# lemonteaa/falcon-ocr-onnx-int8

## Resumen

Falcon-OCR ONNX int8 es una exportación cuantizada del modelo `tiiuae/Falcon-OCR`, un VLM de tipo early-fusion con 270 millones de parámetros orientado a OCR de escritura manual y reconocimiento de fórmulas matemáticas. La conversión la ha realizado el usuario independiente `lemonteaa` para integrar el modelo en MathInk, una aplicación Android que lee los cuatro ficheros de pesos desde una carpeta elegida por el usuario, evitando así empaquetar 576 MB dentro del APK.

El artefacto se distribuye como dos grafos ONNX (prefill y decode) cuantizados a int8 por bloques, junto con un fichero de plantilla JSON y una tabla de vocabulario BPE a nivel de byte. El objetivo es la inferencia en dispositivo (on-device) con ONNX Runtime en Android, con un canvas fijo de 448 px y un prompt de 800 tokens.

Es relevante porque demuestra una vía práctica de desplegar un VLM de OCR de fórmulas en hardware móvil con pérdida de calidad mínima respecto a fp32 (coseno de 0.9999 en los logits de prefill), aunque con restricciones fuertes: canvas fijo, sin flexibilidad de resolución y una única estrategia de cuantización que funciona.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLM early-fusion (transformer multimodal) |
| Parametros totales | 270 M (modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | prompt fijo de 800 tokens (canvas 448 px, 784 patches) |
| Tipos de cuantizacion | int8 por bloques (block size 32, simetrica, `MatMulNBits`); pesos int8, activaciones fp32 |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (`falcon_ocr_prefill_int8.onnx`, `falcon_ocr_decode_int8.onnx`), JSON de plantilla, vocabulario BPE binario |

## Arquitectura y entrenamiento

El modelo base `tiiuae/Falcon-OCR` es un VLM de 270 M de parámetros con fusión temprana: la imagen se divide en patches de 16×16 que se proyectan y se concatenan con los tokens de texto en una única secuencia de entrada al transformer. La exportación ONNX separa el cómputo en dos grafos: uno de prefill que recibe los 784 patches (28×28) y produce logits y cachés K/V iniciales, y otro de decode que procesa un token por paso con las cachés `past_k`/`past_v` de 22 capas, 16 cabezas y dimensión 64 por cabeza.

La cuantización es exclusivamente de pesos, con activaciones en fp32. El autor documenta que la cuantización per-tensor y per-channel destruyen el modelo (el primer token predicho pasa a ser EOS), mientras que la cuantización por bloques de tamaño 32 mantiene los logits de prefill con coseno 0.9999 respecto a fp32. La cuantización a 4 bits no es usable porque la salida degenera. No se dispone de información sobre el dataset de entrenamiento, el número de tokens, ni si hubo RLHF o DPO en el modelo base.

## Capacidades

- Reconocimiento de escritura manual (handwriting OCR) sobre imágenes de entrada.
- Reconocimiento de fórmulas matemáticas y LaTeX; el modelo responde dentro de delimitadores `$$ … $$`.
- Generación autoregresiva token a token con decodificación argmax y parada por identificadores de stop definidos en la plantilla.
- Preprocesado específico soportado: recorte al bounding box de la tinta con 2 % de padding, letterbox sobre blanco, redimensionado a 448, normalización a `[-1, 1]` y división en patches 16×16 en orden row-major con canales al final.
- Detokenización mediante concatenación de bytes por identificador y una única decodificación UTF-8.
- No se documenta soporte de tool calling, function calling, agentes, multi-step reasoning, visión general, audio ni modo thinking.

## Casos de uso

- Digitalización de apuntes manuscritos en Android: la app MathInk usa el grafo de prefill y decode para convertir trazos o fotos de fórmulas en LaTeX, con los pesos cargados desde almacenamiento externo en lugar de dentro del APK.
- Aplicaciones de toma de notas matemáticas offline: al ejecutarse con ONNX Runtime en el dispositivo, no requiere conexión ni envío de imágenes a servidores, lo que encaja con requisitos de privacidad.
- Corrección automática de ejercicios manuscritos: el modelo transcribe la fórmula a LaTeX y un motor simbólico externo puede evaluar la equivalencia.
- Extracción de fórmulas en entornos educativos con hardware modesto: los 576 MB de pesos y la cuantización int8 permiten desplegar en teléfonos de gama media sin GPU dedicada.
- Prototipado de pipelines de OCR de ecuaciones en escritorio con ONNX Runtime: los mismos grafos pueden ejecutarse fuera de Android para validar el preprocesado antes de portar.
- Archivado de documentos científicos escaneados con ecuaciones: integrado en un flujo de preprocesado que recorte y letterboxee cada región de fórmula antes de la inferencia.
- Distribución de modelos en apps móviles sin inflar el binario: el patrón de carga desde carpeta elegida por el usuario sirve de plantilla para otras apps que necesiten modelos grandes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor únicamente reporta una métrica de fidelidad de la cuantización: coseno de 0.9999 entre los logits de prefill int8 y fp32.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el repo ocupa 0.6 GB y los dos grafos suman 576 MB, por lo que se necesita al menos ese espacio en memoria para cargar los pesos.
- GPU recomendadas: no disponible; el destino declarado es Android con ONNX Runtime, no GPU de escritorio.
- ¿Cabe en GPU de consumo? Los 576 MB de pesos int8 caben holgadamente en cualquier GPU de consumo moderna, pero no se documenta rendimiento en ellas.
- Opciones de despliegue: ONNX Runtime (Android y escritorio). No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Falcon-OCR ONNX int8 (este) | 270 M | prompt fijo 800 tokens | ONNX int8 | Apache-2.0 | Canvas fijo 448 px, orientado a Android |
| tiiuae/Falcon-OCR | 270 M | no disponible | safetensors (presumible) | Apache-2.0 | Modelo base sin cuantizar |
| Otros modelos OCR/VLM de tamano similar | no disponible | no disponible | no disponible | no disponible | No se dispone de información para comparar |

## Limitaciones y advertencias

- Canvas fijo: el prompt, las tablas de posición RoPE y la máscara de atención están horneados como constantes para 448 px cuadrados (784 patches, 800 tokens). Cambiar la resolución exige reexportar los grafos.
- Cuantización frágil: per-tensor y per-channel int8 rompen el modelo; 4 bits degenera la salida. Solo funciona la cuantización por bloques de tamaño 32 simétrica.
- Es un trabajo derivado, no un modelo nuevo; la calidad final depende del modelo base `tiiuae/Falcon-OCR`.
- No se documentan idiomas soportados ni evaluación multilingüe.
- Riesgo de alucinación inherente a modelos generativos: puede producir LaTeX sintácticamente plausible pero incorrecto.
- No se documentan sesgos conocidos.
- La licencia Apache-2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base y citar la procedencia.
- El repo tiene 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en producción ni validación externa.
- La fecha de creación indicada (2026-11-15) es futura respecto a la elaboración habitual de fichas; conviene verificar la vigencia del artefacto.

## Enlaces

- Hugging Face: https://huggingface.co/lemonteaa/falcon-ocr-onnx-int8
- Modelo base: https://huggingface.co/tiiuae/Falcon-OCR
- Repositorio MathInk (pipeline de conversión en `tools/falcon_ocr/`): no disponible como URL en la información proporcionada.
