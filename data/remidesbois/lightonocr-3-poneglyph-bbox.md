# Remidesbois/LightOnOCR-3-Poneglyph-bbox

## Resumen

LightOnOCR-3-Poneglyph-bbox es un ajuste fino del modelo lightonai/LightOnOCR-3-0.8B, publicado por el usuario Remidesbois, especializado en OCR de páginas completas de manga en francés. El modelo transcribe el texto de cada zona de la página y devuelve además su caja delimitadora normalizada en el rango 0–1000, usando el formato nativo `![texto](x1,y1,x2,y2)` seguido de la transcripción. Se invoca con el prompt de usuario `grounding` y con `enable_thinking=False` en la plantilla de chat.

Técnicamente es un modelo visión-lenguaje de arquitectura Qwen3.5 nativa, con 852.985.920 parámetros totales en pesos BF16 y 793.333.056 parámetros entrenados durante esta fase (decodificador, merger y los cuatro últimos bloques del encoder de visión). El checkpoint publicado corresponde al paso 111 de la fase de consolidación por CER, seleccionado por CER mínimo por generación sobre 189 páginas de validación.

Su relevancia es doble: por un lado ataca una tarea poco cubierta por los OCR genéricos, como es la transcripción de viñetas de manga con localización espacial precisa; por otro, se distribuye también con grafos ONNX ejecutables en navegador vía WebGPU, con una degradación medida muy pequeña respecto a la inferencia nativa en PyTorch (CER 1,096 % frente a 1,066 %).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.5 nativa (clase `Qwen3_5ForConditionalGeneration`); modelo vision-lenguaje con encoder de visión, merger y decodificador |
| Parametros totales | 852.985.920 (852.985.920 parámetros; 473 tensores en BF16) |
| Parametros activos | no aplicable: no es un modelo MoE |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | BF16 (pesos nativos); FP16 y cálculo mixto FP16/FP32 en los grafos ONNX/WebGPU; no se documentan GGUF, AWQ ni GPTQ |
| Idiomas soportados | francés (`fr`) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (1.706.030.528 bytes, 473 tensores, BF16) y ONNX |

## Arquitectura y entrenamiento

El modelo parte del checkpoint lightonai/LightOnOCR-3-0.8B en la revisión `36d8636925327c671bd8e479c517a004f7566bd9`, con arquitectura Qwen3.5 nativa y pesos BF16. El ajuste se realizó sobre el mejor checkpoint de una primera fase de página completa; el checkpoint finalmente publicado es el paso 111 de la fase de consolidación por CER, correspondiente a la primera época. En esta fase se entrenaron 793.333.056 parámetros (decodificador, merger y los cuatro últimos bloques de visión) con un nuevo AdamW y scheduler: LR de 3e-6 para el decodificador, 1,5e-6 para el merger y 7,5e-7 para la visión, con un máximo de tres épocas y batch físico 1 con acumulación 8. Los estados de Adam y los pesos se mantuvieron en FP32 con autocast BF16 y kernels Blackwell SM120.

Los datos son un conjunto fijo de 882 páginas de entrenamiento, 189 de validación y 189 de prueba, sin que ninguna página de test participe en el entrenamiento ni en la selección. Las imágenes son páginas completas con borde largo máximo de 2048 píxeles y sin aumento de datos en esta fase. La función de pérdida se aplica únicamente sobre la respuesta, con pesos diferenciados: 1 para texto y separadores, 0,2 para marcadores y coordenadas, y 2 para el token EOS, manteniendo peso 1 para los dígitos dentro de la transcripción. La selección de checkpoint se hizo exclusivamente por CER mínimo por generación sobre las 189 páginas de validación, con protección del modelo inicial si el gain resultante era insuficiente. El WER y las cajas delimitadoras se siguieron de forma secundaria.

Como innovaciones destacables, el modelo emplea grounding espacial explícito con coordenadas normalizadas a enteros en [0,1000], y la model card indica que los kernels FLA y causal-conv1d compatibles con la GPU aceleran la inferencia de Qwen3.5, algo coherente con arquitecturas que incorporan componentes de atención lineal o convolución causal. La validación nativa se realizó con Transformers 5.14.1.

## Capacidades

- Transcripción OCR de páginas completas de manga en francés, con salida por zona de texto.
- Grounding espacial: cada zona se emite como `![texto](x1,y1,x2,y2)` con coordenadas enteras normalizadas en [0,1000], convertibles a píxeles multiplicando por el ancho y alto originales y dividiendo por 1000.
- Invocación mediante prompt de usuario `grounding` con `enable_thinking=False` en la plantilla de chat nativa.
- Entrada de imagen a texto (`image-text-to-text`) con pipeline conversacional.
- Salida determinista en el ejemplo de uso (`do_sample=False`) con hasta 1280 tokens nuevos.
- Ejecución en navegador mediante grafos ONNX y WebGPU, con métricas agregadas publicadas.
- No realiza descripciones de viñetas: las anotaciones cubren únicamente zonas de texto validadas.
- No se documentan en la información disponible capacidades de tool calling, function calling, agentes ni audio.

## Casos de uso

- Digitalización de fondos de manga en francés: el modelo recorre páginas completas de hasta 2048 píxeles de borde largo y devuelve cada bloque de texto con su transcripción y su caja, lo que permite reconstruir el orden de lectura y generar archivos de texto alineados con la maquetación original.
- Traducción automática asistida por maquetación: al disponer de las coordenadas de cada viñeta, el texto extraído puede enviarse a un traductor manteniendo la correspondencia espacial y reinyectarse en la página respetando la posición original de cada globo.
- Indexación y búsqueda full-text sobre escaneos: el CER de 1,066 % y el WER de 2,224 % en el conjunto de prueba permiten construir índices de búsqueda sobre colecciones de manga con una tasa de error de caracteres en torno al 1 %, suficiente para recuperación de pasajes concretos.
- Preetiquetado de datasets de OCR con bounding boxes: con una F1 de cajas del 98,75 % a IoU ≥ 0,5, el modelo sirve como anotador automático de primer paso, dejando a revisión humana únicamente la validación de transcripciones, con un 90,22 % de viñetas exactas.
- Generación de audiolibros y doblaje: la transcripción por zona, con un 40,21 % de páginas exactas en orden de lectura y 0 páginas truncadas, permite extraer guiones de diálogo listos para síntesis de voz, separando intervenciones por su posición en la página.
- Anotación asistida en pipelines editoriales: el formato `![texto](x1,y1,x2,y2)` es directamente consumible por herramientas de maquetación y control de calidad, lo que facilita la comparación automática entre la transcripción y el texto de referencia.
- Aplicación en navegador para lectores y coleccionistas: los grafos ONNX con WebGPU ofrecen un CER de 1,096 % y un WER de 2,195 % sobre las mismas 189 páginas de prueba, lo que permite ofrecer OCR local sin enviar las imágenes a un servidor.
- Archivo y preservación documental: el modelo permite generar capas de texto buscables sobre digitalizaciones ya existentes, con la advertencia de que las cajas y transcripciones requieren verificación en usos que exijan precisión literal.

## Benchmarks y rendimiento

Resultados publicados por el autor. CER y WER están ponderados por caracteres y palabras de referencia, con normalización NFC y de espacios, conservando caja y puntuación. El emparejamiento espacial es uno a uno con IoU ≥ 0,1, penalizando zonas perdidas o añadidas como supresiones e inserciones. El texto exacto por viñeta cubre todas las viñetas anotadas; el exacto por página ignora las coordenadas pero conserva el orden de lectura.

| Medida | Inicio · validación | Retenido · validación | Test final |
|---|---:|---:|---:|
| CER | 1,166 % | 1,040 % | 1,066 % |
| WER | 2,548 % | 2,291 % | 2,224 % |
| Texto exacto por viñeta | 89,51 % | 90,08 % | 90,22 % |
| Texto de página exacto, en orden | 38,62 % | 40,74 % | 40,21 % |
| F1 bbox / IoU ≥ 0,5 | 98,80 % | 98,93 % | 98,75 % |
| Páginas truncadas | 0 | 0 | 0 |

Comparación entre la inferencia nativa en PyTorch BF16 y la ruta de navegador WebGPU sobre las mismas 189 páginas de prueba:

| Medida | PyTorch BF16 | Navegador WebGPU |
|---|---:|---:|
| CER ↓ | 1,066 % | 1,096 % |
| WER ↓ | 2,224 % | 2,195 % |
| Texto exacto por zona ↑ | 90,22 % | 89,67 % |
| Texto de página exacto, en orden ↑ | 40,21 % | 38,62 % |
| F1 bbox / IoU ≥ 0,5 ↑ | 98,75 % | 98,75 % |
| Páginas truncadas / bloques inválidos | 0 / 0 | 0 / 0 |

La ruta WebGPU acumula 587 errores de caracteres frente a 571 en BF16, una diferencia de +0,030 puntos de CER; las salidas no son idénticas bit a bit. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- Peso del modelo en BF16: 1.706.030.528 bytes (aproximadamente 1,59 GiB) repartidos en 473 tensores. El repositorio completo ocupa 3,4 GB, incluyendo los artefactos ONNX.
- VRAM estimada: el peso en BF16 requiere en torno a 1,6-1,7 GB; añadiendo activaciones para imágenes de hasta 2048 píxeles de borde largo y hasta 1280 tokens generados, una estimación orientativa sitúa la inferencia en el rango de 4-8 GB. Es una estimación, no una medida publicada por el autor.
- GPU recomendadas: el autor reporta medidas en RTX 5090 de 32 GB con arquitectura Blackwell. Cualquier GPU con soporte BF16 y VRAM suficiente debería poder ejecutarlo; no se publican medidas en A100, H100 ni RTX 4090.
- Cabe en GPU de consumo: sí, previsiblemente en tarjetas con 8 GB o más de VRAM, dado el tamaño de pesos inferior a 2 GB en BF16. No se documentan pruebas específicas en gamas concretas más allá de la RTX 5090.
- Opciones de despliegue: Transformers 5.14.1 es la versión validada para la inferencia nativa, con `attn_implementation="sdpa"` y `dtype=torch.bfloat16`; los kernels FLA y causal-conv1d aceleran la inferencia de Qwen3.5. También hay ruta ONNX con WebGPU para navegador. No se documentan despliegues con vLLM, TGI, llama.cpp ni Ollama.
- Latencia: en RTX 5090 de 32 GB (Blackwell), con el modelo ya cargado y excluyendo la descarga, la mediana es de 3,51 s por página y el p95 de 4,27 s por página. Los tiempos dependen del tamaño de la imagen, de la cantidad de texto y del hardware. No se publica throughput agregado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea principal | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Remidesbois/LightOnOCR-3-Poneglyph-bbox | 852.985.920 | no disponible | OCR de manga en francés con bbox normalizadas | Apache-2.0 | HuggingFace, con ONNX/WebGPU |
| lightonai/LightOnOCR-3-0.8B (modelo base) | en torno a 0,8 mil millones, según la nomenclatura del autor | no disponible | OCR de visión-lenguaje (base) | no disponible en la informacion proporcionada | HuggingFace |
| Otros OCR-VLM comparables (por ejemplo GOT-OCR2.0, dots.ocr, olmOCR) | no disponible | no disponible | OCR genérico | no disponible | no disponible |

No se ha proporcionado información de benchmarks ni de especificaciones de otros modelos comparables, por lo que la comparación cuantitativa con alternativas no está disponible.

## Limitaciones y advertencias

- El modelo puede omitir texto, en particular algunas onomatopeyas; las cajas y transcripciones requieren verificación en usos que exijan exactitud.
- Idioma limitado al francés (`fr`); no se documenta soporte multilingüe.
- No genera descripciones de viñetas ni interpreta el contenido gráfico: las anotaciones se restringen a zonas de texto validadas.
- Las métricas de test provienen de un conjunto que ya había sido evaluado e inspeccionado en la primera ejecución; miden progreso sobre el mismo test reutilizado, no sobre un conjunto independiente nuevo. Las páginas y predicciones individuales permanecen privadas.
- La ruta ONNX/WebGPU no es bit a bit idéntica a la nativa: los pesos FP16, el cálculo mixto FP16/FP32 y el redimensionado de Canvas pueden alterar textos y coordenadas, con un incremento medido de +0,030 puntos de CER.
- El ejemplo de uso fija `max_new_tokens=1280`; aunque el autor reporta 0 páginas truncadas en su test, páginas muy densas podrían superar ese límite en otros conjuntos.
- Dependencia de versiones concretas: Transformers 5.14.1 para la validación nativa y kernels FLA y causal-conv1d para acelerar la inferencia de Qwen3.5. El repositorio registra 0 descargas y 0 likes, por lo que no cuenta con validación externa de la comunidad.
- Licencia Apache-2.0 para este ajuste, que permite uso comercial; conviene verificar de forma independiente la licencia del modelo base y de los datos de entrenamiento, cuya procedencia no se detalla en la información proporcionada.
- Integridad verificable: los 473 tensores corresponden exactamente al checkpoint retenido tras la conversión de FP32 a BF16, con SHA-256 `3e7f25dbbdd87a0f1896af27aad5ee07f66364a24da4151d14ef6d125a98d14b`.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Remidesbois/LightOnOCR-3-Poneglyph-bbox
- Modelo base: https://huggingface.co/lightonai/LightOnOCR-3-0.8B
- Revisión del modelo base: `36d8636925327c671bd8e479c517a004f7566bd9`
- Resumen público de benchmarks citado en la model card: `benchmark_native.json` (referenciado como `benchmark_native.json` en el repositorio)
- Graphes, contrato y validación ONNX: `onnx/README.md` (referenciado en el repositorio)
- Informe agregado del navegador: `onnx/webgpu_metrics.json` (referenciado en el repositorio)
