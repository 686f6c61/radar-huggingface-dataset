# arvedo/NVIDIA-Nemotron-3.5-Bolt-E4B-NVFP4-Blackwell-Rubin

## Resumen

Nemotron-3.5-Bolt-E4B-NVFP4-Blackwell-Rubin es una cuantización de 4 bits en formato NVFP4 del modelo `nvidia/NVIDIA-Nemotron-3.5-Bolt-E4B-BF16`, publicada por el usuario arvedo. El modelo base deriva de `google/gemma-4-E4B-it` y ha sido postentrenado por NVIDIA; esta versión cuantizada está pensada específicamente para GPUs NVIDIA Blackwell y Rubin, e incluye soporte multimodal de visión y audio. El resultado es un modelo de 7.996.156.490 parámetros totales que reduce el peso en disco de 14,89 GiB a 6,00 GB (5,20 GiB de VRAM) manteniendo, según el autor, más del 99,6 % de la precisión del BF16 original.

La relevancia de esta ficha radica en que combina tres factores poco habituales en el ecosistema open source: cuantización de precisión muy baja (W4A4) calibrada para contexto de 128k, recuperación completa de las capacidades de visión y audio tras la cuantización, y un rendimiento de decodificación en contexto largo aproximadamente el doble que el modelo BF16 en vLLM. Está orientada a despliegues en hardware Blackwell (por ejemplo, DGX Spark GB10) donde los Tensor Cores FP4 permiten explotar el formato NVFP4 de forma nativa.

El modelo se distribuye únicamente en safetensors para vLLM (no hay pesos GGUF en este repositorio, aunque el autor publica una edición GGUF separada). La licencia es OpenMDW 1.1, y los idiomas declarados son inglés, alemán, francés, español, italiano y japonés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Gemma 4 E4B, `Gemma4ForConditionalGeneration`) con cuantización NVFP4 W4A4 y MXFP8 en codificadores |
| Parametros totales | 7.996.156.490 (de los cuales 3.490 millones corresponden a tablas de embedding Token y PLE) |
| Parametros activos | no disponible (no se declara como MoE) |
| Longitud de contexto | 128k (calibración de cuantización a 128k; contexto nativo del modelo base no detallado) |
| Tipos de cuantizacion | NVFP4 (W4A4) en capas transformer; MXFP8 (E4M3 con escalas de bloque E8M0 de 32 elementos) en codificadores de visión y audio; FP8 en tablas de embedding (edición estándar); lm_head en 4 bits con kernel `B12xBlockscaledLinear` (W4A16) |
| Idiomas soportados | en, de, fr, es, it, ja |
| Licencia | OpenMDW 1.1 (`openmdw-1.1`) |
| Formato de pesos | safetensors (librería vLLM); existe edición GGUF separada publicada por el mismo autor |

## Arquitectura y entrenamiento

El modelo base es un transformer multimodal derivado de `google/gemma-4-E4B-it`, postentrenado por NVIDIA como parte de la familia Nemotron 3.5. La arquitectura incluye 42 capas transformer y un mecanismo de embeddings por capa (Per-Layer Embedding, PLE) con tablas de búsqueda de dimensiones `[262144, 13312]`, que suman 3.490 millones de parámetros y constituyen una parte sustancial del total. El pipeline declarado es `image-text-to-text`, con codificadores separados para visión y audio.

Esta versión concreta no reentrena el modelo: aplica cuantización post-entrenamiento con NVIDIA ModelOpt. Las 42 capas transformer se empaquetan en NVFP4 con calibración a 128k de contexto; los codificadores de visión y audio se cuantizan en MXFP8 con escalas de bloque de 32 elementos; el `lm_head` usa un kernel de 4 bits `B12xBlockscaledLinear` en modo W4A16. Las búsquedas de embedding se aceleran mediante kernels Triton de un solo lanzamiento (`_nemo_fp8_embed_kernel` en la edición estándar). La edición LowMemory, publicada aparte, empaqueta los embeddings en NVFP4 con un kernel de decodificación de registros fusionado (`_nemo_nvfp4_embed_kernel`, v5 de `vllm_nemotron_patch.py`). No se detallan en la información disponible el volumen de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en el postentrenamiento de NVIDIA.

## Capacidades

- Generación de texto conversacional multi-turno en seis idiomas (en, de, fr, es, it, ja).
- Razonamiento matemático, resolución de problemas y respuesta a instrucciones, evaluados por el autor sobre 16 benchmarks de matemáticas, código, razonamiento y seguimiento de instrucciones.
- Generación y comprensión de código.
- Comprensión de imágenes (visión) mediante codificador MXFP8, con pipeline image-text-to-text.
- Comprensión de audio mediante codificador MXFP8.
- Procesamiento de contexto largo, con cuantización calibrada a 128k tokens.
- No se documenta en la información disponible soporte explícito de tool calling, function calling ni de razonamiento agéntico multi-paso.
- No se documenta un modo "thinking" explícito.

## Casos de uso

- Análisis de documentos extensos con imágenes intercaladas: la ventana de 128k y el codificador de visión permiten procesar informes, contratos o manuales con figuras en una sola pasada, sin trocear el contenido.
- Transcripción y análisis de reuniones o notas de voz: el codificador de audio MXFP8 permite alimentar el modelo con audio y obtener resúmenes o respuestas en los seis idiomas soportados.
- Asistencia técnica multilingüe: al cubrir en, de, fr, es, it y ja, puede atender consultas de soporte en varios mercados europeos y japonés con un único despliegue.
- Despliegue en estaciones de trabajo con GPU Blackwell de gama profesional: con 5,20 GiB de VRAM en la edición estándar, cabe en tarjetas de 8-16 GB y deja margen para el contexto y el resto del pipeline.
- Procesamiento por lotes de contexto largo en servidor: el autor reporta 46.853 tok/s de prefill y 491,5 tok/s de decodificación pura a concurrencia 32 en DGX Spark GB10, lo que lo hace apto para ingesta masiva de documentos.
- Evaluación comparativa de cuantizaciones: sirve como referencia para medir la pérdida de precisión de NVFP4 frente a BF16 en tareas de texto, visión y audio, dado que el autor publica los deltas por suite.
- Pruebas locales sin GPU Blackwell: la edición GGUF del mismo autor permite validar el comportamiento del modelo en CPU o en `llama.cpp`, aunque sin las ventajas de velocidad de NVFP4.

## Benchmarks y rendimiento

Resultados reportados por el autor en la model card:

| Suite | Modelo BF16 base | Esta cuantización NVFP4 | Delta |
|---|---|---|---|
| Texto (20.565 preguntas, 16 benchmarks) | 79,40 % | 79,09 % | -0,31 % |
| Visión y audio (2.203 preguntas) | 73,40 % (referencia Gemma 4 E4B-IT BF16) | 73,81 % | paridad superior al 100 % |
| Edición LowMemory, suite de texto | 79,09 % (edición estándar) | 78,74 % | -0,35 % |
| Edición LowMemory, suite visión y audio | 73,81 % (edición estándar) | 73,72 % | 99,9 % de paridad |

Rendimiento en DGX Spark GB10 con benchmark de Wikipedia de 32k (25.258 tokens de prompt por petición):

| Métrica | BF16 base | NVFP4 |
|---|---|---|
| Decodificación pura a concurrencia 1 | 59,2 tok/s | 120,9 tok/s (2,04x) |
| Decodificación pura a concurrencia 32 | sin memoria | 491,5 tok/s |
| Prefill por lotes a concurrencia 32 | no disponible | 46.853,4 tok/s |

No se han publicado en la información disponible resultados desglosados por benchmark individual (MMLU, HumanEval, GSM8K u otros); solo se ofrece el agregado de las suites.

## Requisitos de hardware

- VRAM estimada: 5,20 GiB en la edición estándar; 4,65 GiB en la edición LowMemory. El modelo BF16 base requiere 15,20 GiB en ejecución.
- GPU soportadas de forma nativa: NVIDIA Blackwell y Rubin, que disponen de Tensor Cores FP4 para NVFP4 y soporte de MXFP8. El autor cita explícitamente DGX Spark GB10 como plataforma de referencia.
- GPU consumer: cabe en tarjetas con 8 GB o más de VRAM de arquitectura Blackwell. En GPUs anteriores (Ampere, Ada) no se puede explotar el formato NVFP4 de forma nativa y el rendimiento esperado no está documentado.
- Opciones de despliegue: vLLM es la vía soportada (librería declarada y kernels Triton específicos). Para CPU o `llama.cpp` existe la edición GGUF publicada por el mismo autor, con 6,11 GB de pesos más 946 MB de mmproj.
- Latencia y throughput: 120,9 tok/s de decodificación pura a concurrencia 1 y 491,5 tok/s a concurrencia 32 en DGX Spark GB10 con prompts de 32k; prefill de 46.853,4 tok/s a concurrencia 32.
- Tamaño en disco: 6,00 GB (edición estándar), 4,79 GiB (LowMemory), 31,0 GB de repositorio total en Hugging Face.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Nemotron-3.5-Bolt-E4B-NVFP4 (esta ficha) | 7,996 mil M | 128k | NVFP4 W4A4 + MXFP8 | OpenMDW 1.1 | vLLM en Blackwell/Rubin; GGUF en repo aparte |
| NVIDIA-Nemotron-3.5-Bolt-E4B-BF16 | 7,996 mil M (mismo base) | 128k | BF16 | OpenMDW 1.1 | vLLM; 14,89 GiB en disco |
| Nemotron-3.5-Bolt-E4B-NVFP4-VisionAudio-LowMemory | 7,996 mil M (mismo base) | 128k | NVFP4 con embeddings en 4 bits | OpenMDW 1.1 | vLLM; 4,79 GiB en disco |
| Gemma 4 E4B-IT BF16 (referencia del autor) | no disponible en la información | no disponible | BF16 | no disponible en la información | no disponible en la información |

La comparación relevante es interna a la familia: la edición estándar sacrifica 1,21 GB de disco y 0,55 GiB de VRAM frente a LowMemory a cambio de una precisión ligeramente superior (79,09 % frente a 78,74 % en texto). Frente al BF16 base, la cuantización reduce el consumo de VRAM un 65 % con un delta de precisión de -0,31 puntos en texto.

## Limitaciones y advertencias

- La cuantización NVFP4 W4A4 solo se aprovecha en hardware Blackwell o Rubin; en GPUs anteriores el modelo puede no cargar o rendir de forma muy inferior, y no se documenta compatibilidad.
- El modelo está pensado para vLLM con los kernels y parches específicos del autor (`vllm_nemotron_patch.py`); no es un checkpoint portable a otros runtimes sin conversión.
- La pérdida de precisión es pequeña pero real: -0,31 puntos en la suite de texto y -0,35 puntos en la edición LowMemory. En tareas de razonamiento fino o matemáticas puede amplificarse.
- No se documentan evaluaciones de sesgo, toxicidad ni robustez frente a alucinaciones en la información disponible.
- El contexto de 128k es la ventana de calibración de la cuantización; no se especifica si el modelo base soporta más contexto ni cómo se degrada más allá de esa longitud.
- La licencia OpenMDW 1.1 impone condiciones que deben revisarse antes de uso comercial; no es una licencia permisiva tipo Apache 2.0 y el autor la declara como `license: other`.
- El repositorio tiene 319 descargas y 0 likes en el momento de la ficha, lo que indica una validación comunitaria todavía muy limitada.
- El modelo base es un postentrenamiento de Gemma 4 E4B-IT; las limitaciones idiomáticas y de conocimiento del modelo original se heredan, aunque solo se declaran seis idiomas.
- No se documenta soporte de tool calling ni de flujos agénticos, por lo que no debe asumirse en producción sin validación previa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/arvedo/Nemotron-3.5-Bolt-E4B-NVFP4-Blackwell-Rubin
- Modelo base BF16: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Bolt-E4B-BF16
- Modelo original de Google: https://huggingface.co/google/gemma-4-E4B-it
- Edición LowMemory: https://huggingface.co/arvedo/Nemotron-3.5-Bolt-E4B-NVFP4-VisionAudio-LowMemory
- Edición GGUF: https://huggingface.co/arvedo/Nemotron-3.5-Bolt-E4B-NVFP4-VisionAudio-GGUF
- Licencia OpenMDW 1.1: https://openmdw.ai/license/1-1/
- Patrocinador del hardware y la ingeniería de kernels: https://cdemy.de/
