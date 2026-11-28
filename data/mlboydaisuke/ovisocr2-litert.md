# mlboydaisuke/OvisOCR2-LiteRT

## Resumen

OvisOCR2-LiteRT es una conversión al formato LiteRT-LM (`.litertlm`) del modelo ATH-MaaS/OvisOCR2, un parser de documentos a nivel de página de 0,85B de parámetros construido por post-entrenamiento sobre Qwen3.5-0.8B. El modelo recibe la imagen de una página y emite una transcripción en Markdown en orden de lectura: texto como Markdown, tablas como HTML `<table>` y fórmulas como LaTeX. Esta conversión, publicada por el usuario mlboydaisuke, está pensada para inferencia on-device mediante el runtime LiteRT-LM de Google, con un encoder visual ViT de 12 capas cableado al contrato `fast_vlm` a una entrada estática de 512×512.

La relevancia de esta ficha es doble. Por un lado, demuestra que un VLM especializado en OCR documental puede ejecutarse en CPU y GPU de consumo con un único fichero de 1,30 GB en int8, manteniendo paridad prácticamente exacta con la referencia fp32 en páginas legibles a 512×512. Por otro lado, documenta con mediciones honestas los límites del checkpoint: no es un modelo conversacional, se degrada en páginas densas y requiere gestión cuidadosa del estado recurrente en el runtime.

Arquitectónicamente es un modelo híbrido (capas de atención con Gated DeltaNet, linaje Qwen3.5) con decodificador int8 y encoder visual fp16. La licencia Apache 2.0 facilita su integración comercial, aunque el ecosistema LiteRT-LM impone restricciones prácticas de versión y de gestión de motores que conviene conocer antes de desplegarlo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido con Gated DeltaNet (linaje Qwen3.5) + encoder visual ViT de 12 capas |
| Parametros totales | 0,85B (modelo base ATH-MaaS/OvisOCR2) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8 en decodificador (dinámica en lineales y embedding; convoluciones y regla delta en float, activaciones fp32 declaradas) + encoder visual fp16 / adaptador int8 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | `.litertlm` (LiteRT-LM); fichero `OvisOCR2_int8.litertlm` de 1,30 GB |

## Arquitectura y entrenamiento

El modelo base OvisOCR2 se obtiene por post-entrenamiento de Qwen3.5-0.8B para parsing documental. La arquitectura combina un encoder visual ViT de 12 capas con un decodificador híbrido que incorpora capas Gated DeltaNet, una variante de atención lineal con estado recurrente. La conversión a LiteRT-LM conecta el ViT del propio checkpoint al contrato `fast_vlm` del runtime con entrada estática de 512×512, siguiendo la misma ruta de conversión que la build VL de litert-community/Qwen3.5-0.8B; según el autor, ambos checkpoints comparten cada byte de configuración y solo difieren en los pesos.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron etapas de RLHF o DPO. La model card sí detalla el proceso de cuantización: el decodificador usa int8 dinámico en capas lineales y embedding (cuantización en tiempo de ejecución vía XNNPACK en la ruta CPU), mientras que convoluciones y regla delta permanecen en float con activaciones fp32 declaradas; el encoder visual va en fp16 y el adaptador en int8. El bundle declara seis firmas de prefill y define tanto `<|endoftext|>` como `<|im_end|>` como tokens de parada, corrigiendo el comportamiento del repo original, que carece de `generation_config.json`.

## Capacidades

- Transcripción de páginas de documento a Markdown en orden de lectura.
- Conversión de tablas a HTML `<table>` con celdas, títulos y pies de tabla.
- Renderizado de fórmulas matemáticas como LaTeX (verificado con la ley de Planck invertida, coincidencia símbolo a símbolo).
- Procesamiento de imagen a texto (pipeline `image-text-to-text`) con entrada estática de 512×512.
- Inferencia on-device en backend CPU y GPU con salida byte-idéntica entre ambos en la página de prueba.
- Paridad medida con la referencia fp32: similitud 1.0000 en página de tabla y 1.0000 frente a la referencia fp32 con posición 1-D en página de fórmula (0.9968 frente a la referencia completa con M-RoPE).
- No soporta de forma fiable conversación general: en una prueba de 8 preguntas genéricas tiende a transcribir el prompt en lugar de responder.
- No se documenta soporte de tool calling, function calling ni razonamiento multi-paso.

## Casos de uso

- Digitalización de facturas y albaranes: el modelo transcribe tablas completas a HTML, lo que permite extraer líneas de detalle con un parser posterior; su ventana de 512×512 es suficiente para documentos de una página con tipografía legible.
- Procesamiento de artículos científicos con fórmulas: la exactitud LaTeX verificada (coincidencia símbolo a símbolo en la ley de Planck invertida) lo hace adecuado para pipelines de conversión de PDF a Markdown con ecuaciones preservadas.
- Archivado documental en dispositivos sin conexión: al ejecutarse con LiteRT-LM en CPU, puede desplegarse en portátiles o equipos edge para digitalizar documentación sensible sin enviar imágenes a la nube.
- Extracción de tablas financieras: informes trimestrales renderizados a 512×512 se transcriben celda a celda de forma exacta, lo que habilita la carga automatizada en hojas de cálculo o bases de datos.
- Preprocesado para RAG documental: la salida Markdown con tablas HTML y LaTeX es directamente indexable por pipelines de recuperación, evitando el ruido de extracción de texto plano de PDF.
- Digitalización de documentación técnica en campo: con un único fichero de 1,30 GB y backend GPU o CPU, puede integrarse en aplicaciones móviles o embebidas para leer manuales y hojas de especificaciones.
- Verificación de calidad de OCR en CI: dado que la salida es determinista con decodificación greedy y byte-idéntica entre CPU y GPU, sirve como referencia reproducible en tests de regresión de pipelines de conversión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. La model card reporta mediciones cualitativas y de similitud sobre páginas concretas:

| Prueba | Resultado medido |
|---|---|
| Página de tabla (512×512, CPU, greedy) | 20/20 celdas, título, párrafo y pie transcritos exactamente; similitud 1.0000 frente a referencia fp32 |
| Consistencia CPU vs GPU | Salida byte-idéntica en la página de tabla |
| Página de fórmula (LaTeX) | Exacta; similitud 1.0000 frente a referencia fp32 con posición 1-D; 0.9968 frente a referencia M-RoPE completa |
| Página académica densa (texto 9 pt) | Degradación: invención y repetición tras la región legible; el fp32 original se comporta igual |
| Sanidad conversacional (8 preguntas) | Falla: transcribe el prompt en lugar de responder; el fp32 original falla igual |

## Requisitos de hardware

- VRAM estimada: el fichero int8 ocupa 1,30 GB en disco; la huella en memoria es del orden de 1,3–2 GB, aunque no se publica una cifra oficial de VRAM.
- GPU recomendadas: no se especifican modelos concretos; el autor valida backend GPU sin detallar hardware.
- Compatibilidad con GPU de consumo: por tamaño (0,85B en int8) es plausible en GPUs de consumo con 4 GB o más, pero no se confirma en la información disponible.
- CPU: ruta validada con cuantización dinámica XNNPACK; el autor ejecuta pruebas en CPU sobre Mac.
- Despliegue: exclusivamente mediante el runtime LiteRT-LM (versión ≥ 0.15; las pruebas de estado recurrente se hicieron con 0.18.0). No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato / runtime | Licencia | Notas |
|---|---|---|---|---|---|
| OvisOCR2-LiteRT | 0,85B | no disponible | `.litertlm` / LiteRT-LM | Apache 2.0 | Parser documental on-device, entrada 512×512 |
| ATH-MaaS/OvisOCR2 | 0,85B | no disponible | safetensors / transformers | Apache 2.0 | Checkpoint fp32 original; misma calidad en páginas legibles, sin optimización on-device |
| litert-community/Qwen3.5-0.8B (VL) | 0,8B | no disponible | `.litertlm` / LiteRT-LM | no disponible | Misma ruta de conversión y configuración; modelo generalista VL, no especializado en OCR |

No se dispone de datos de benchmarks comparativos entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo conversacional: el post-entrenamiento OCR erosiona la capacidad de chat y tiende a transcribir el prompt. No debe usarse como asistente general.
- Páginas densas (texto de 9 pt) superan la resolución de 512×512: el modelo inventa contenido y entra en bucles de repetición. Es necesario trocear la página o usar entradas de mayor resolución.
- El repo original carece de `generation_config.json`, por lo que en `transformers` el EOS es solo `<|endoftext|>` y la generación fp32 continúa hasta el final del turno; para comparar hay que añadir 248046 a `eos_token_id`.
- Bug del runtime LiteRT-LM 0.18.0: reutilizar un Engine para una segunda conversación reutiliza el estado recurrente de la anterior y produce respuestas degeneradas. Debe crearse un Engine nuevo por conversación; el fallo se corrigió en main el 2026-11-03 y está incluido en v0.20.0, versión con la que este modelo no se ha probado en modo Engine compartido.
- Requiere litert-lm ≥ 0.15; no hay compatibilidad documentada con otros runtimes de inferencia.
- No se documentan sesgos conocidos, idiomas soportados ni restricciones adicionales de la licencia Apache 2.0 más allá de las estándar.
- Riesgo de alucinación documentado en regiones no legibles de la imagen, con comportamiento idéntico al checkpoint fp32 de referencia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mlboydaisuke/OvisOCR2-LiteRT
- Modelo base: https://huggingface.co/ATH-MaaS/OvisOCR2
- Build VL de referencia: https://huggingface.co/litert-community/Qwen3.5-0.8B
- Runtime LiteRT-LM: https://github.com/google-ai-edge/litert-lm
- Issue del runtime sobre estado recurrente: https://github.com/google-ai-edge/LiteRT-LM/issues/3165
- Commit de corrección: https://github.com/google-ai-edge/LiteRT-LM/commit/e1f86b05bf8a731331622a2622440e9f93d9a9f5
- Release v0.20.0: https://github.com/google-ai-edge/LiteRT-LM/releases/tag/v0.20.0
