# openbmb/MiniCPM-V-4.7-35B-A3B-FP8

## Resumen

MiniCPM-V 4.7 35B-A3B-FP8 es la versión cuantizada a FP8 del modelo multimodal MiniCPM-V 4.7 35B-A3B de OpenBMB, el primer modelo de la serie MiniCPM-V con arquitectura de mezcla de expertos (MoE). Con 35.212.875.824 parámetros totales y alrededor de 3.000 millones activos por token, está diseñado para tareas de comprensión de imagen única, múltiples imágenes y vídeo, manteniendo un coste de inferencia reducido. La cuantización se ha realizado con `llm-compressor` y el formato `compressed-tensors`, lo que permite desplegarlo con Transformers y frameworks compatibles con FP8.

El objetivo declarado del modelo es ocupar una nueva frontera de Pareto entre capacidad y eficiencia: según el autor, en modo Instruct obtiene una puntuación global superior a Qwen3.6 35B-A3B con menos tiempo de inferencia. Además, incorpora técnicas específicas para inferencia en dispositivo (Lookahead Expert Scheduling y decodificación especulativa DSpark) que permiten ejecutarlo en un iPhone 17 Pro Max a más de 13 tokens/s con tan solo 3 GB de memoria, sin restringir el enrutado de expertos a nivel de token.

Su relevancia actual radica en dos frentes: por un lado, ofrece capacidades multimodales de gama alta (razonamiento sobre imagen y vídeo, conversación multi-turno) en un paquete apto para GPUs de consumo y para despliegue local; por otro, al publicarse bajo licencia Apache 2.0 y con variantes GGUF, AWQ, GPTQ y BNB, se posiciona como una alternativa abierta para proyectos que necesitan visión y lenguaje sin depender de APIs propietarias.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (MLLM) con mezcla de expertos (MoE) en el modelo de lenguaje; codificador visual con compresión temprana intra-ViT basada en LLaVA-UHD v4 |
| Parametros totales | 35.212.875.824 (~35,2B) |
| Parametros activos | ~3B (variante A3B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP8 (esta version); la familia ofrece tambien GGUF, BNB, AWQ y GPTQ |
| Idiomas soportados | no disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (formato compressed-tensors, generado con llm-compressor) |
| Modelo base | openbmb/MiniCPM-V-4.7-35B-A3B (BF16) |
| Tamano del repositorio | 38,0 GB |
| Libreria | transformers |
| Pipeline | image-text-to-text |

## Arquitectura y entrenamiento

La arquitectura combina un modelo de lenguaje de tipo MoE con 35B de parámetros totales y unos 3B activos por token, junto a un codificador visual que aplica compresión temprana de tokens dentro del propio ViT. Esta técnica, heredada de LLaVA-UHD v4, reduce el coste computacional en las capas posteriores del encoder. El modelo admite compresión mixta de tokens visuales 4x/16x, de modo que el desarrollador puede ajustar el equilibrio entre detalle visual y coste de inferencia según la tarea. Es la primera arquitectura MoE de la familia MiniCPM-V.

En el plano del despliegue, el modelo introduce tres mecanismos complementarios: Lookahead Expert Scheduling (LES), integrado en llama.cpp-omni, que planifica la carga de expertos para lograr una inferencia fluida sin degradar el enrutado; cuantización fina capa a capa; e integración con muestreo especulativo DSpark. El autor también publica Self-Replay Fine-Tuning (SRFT), un método de ajuste fino orientado a ampliar capacidades a bajo coste reduciendo el olvido catastrófico. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron etapas de RLHF o DPO.

## Capacidades

- Comprensión y generación de texto a partir de imagen única, múltiples imágenes y vídeo.
- Conversación multimodal multi-turno (etiquetada como "conversational").
- Compresión de tokens visuales configurable en modo mixto 4x/16x para equilibrar detalle y coste.
- Inferencia en dispositivo sin restricción del conjunto de expertos disponibles, conservando el enrutado a nivel de token.
- Despliegue multiplataforma: iOS, Android y HarmonyOS.
- Soporte de plataformas de chips de Rockchip, Houmo, Intel, AMD y Arm (soporte desde el día 0 según el autor).
- Compatibilidad con frameworks de inferencia SGLang, vLLM, llama.cpp y Ollama.
- Ajuste fino mediante SWIFT y LLaMA-Factory.
- Integración con muestreo especulativo DSpark para acelerar la decodificación.
- Soporte de tool calling / function calling: no confirmado en la información proporcionada.

## Casos de uso

- Asistente visual en movil sin conexion: el modelo puede procesar imágenes y mantener conversaciones multi-turno directamente en el dispositivo, con más de 13 tokens/s y 3 GB de memoria en hardware como el iPhone 17 Pro Max, sin enviar datos a la nube.
- Descripción y accesibilidad de imagenes: generar descripciones detalladas o resúmenes hablados de fotografías para aplicaciones de asistencia a personas con discapacidad visual, aprovechando la compresión 4x/16x para ajustar el nivel de detalle según la latencia tolerada.
- Analisis de video para vigilancia o monitorizacion: comprensión de vídeo con ventana temporal amplia para detectar eventos o resumir secuencias, desplegado con SGLang o vLLM en servidor para procesar varios flujos en paralelo.
- Atencion al cliente con soporte visual: gestión de conversaciones en las que el usuario adjunta capturas, facturas o fotografías de productos, con contexto multi-imagen, en una arquitectura MoE que reduce el coste por token activo.
- Documentacion tecnica y OCR asistido: extracción estructurada de información de capturas y diagramas en pipelines internos, con la ventaja de poder ejecutarse en un servidor modesto gracias a la cuantización FP8 (38 GB de pesos).
- Procesamiento en el borde (edge computing): despliegue en dispositivos con chips Rockchip, Intel o Arm para tareas de inspección visual en fábrica o comercio, sin depender de conectividad externa.
- Prototipado e investigacion multimodal: uso como base para experimentación con fine-tuning mediante SWIFT o LLaMA-Factory y para reproducir comparativas de eficiencia frente a otros MoE multimodales de tamaño similar.
- Generacion de codigo e integracion en pipelines: la información disponible no confirma capacidades específicas de generación de código ni de tool calling, por lo que este caso debe validarse antes de llevarlo a producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks numéricos en la información disponible. La model card hace referencia a una sección de evaluación que no se incluye en los datos proporcionados, y únicamente se afirma cualitativamente que, en modo Instruct, el modelo 35B-A3B obtiene una puntuación global superior a Qwen3.6 35B-A3B con menos tiempo de inferencia. No se dispone de cifras de MMLU, HumanEval, GSM8K ni de benchmarks multimodales como MMBench, MMMU o Video-MME.

En cuanto a eficiencia, el dato disponible es que alcanza más de 13 tokens/s con 3 GB de memoria en un iPhone 17 Pro Max, gracias a LES, cuantización fina capa a capa y DSpark.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio FP8 ocupa 38,0 GB, por lo que se necesita al menos ese espacio de memoria (o de VRAM) para cargar todos los pesos; alrededor de 35 GB corresponden a los parámetros en FP8.
- GPU recomendadas: no especificadas por el autor. Para el modelo completo en FP8 se requiere una GPU con al menos 40-48 GB de memoria (por ejemplo A100 40/80 GB o H100), aunque no se confirma oficialmente.
- GPU de consumo: la información disponible no confirma que la versión FP8 de 35B quepa en GPUs de consumo de 24 GB (RTX 4090, 3090) sin cuantizaciones más agresivas; para esos casos existen variantes GGUF, AWQ, GPTQ y BNB.
- Despliegue en dispositivo: iOS, Android y HarmonyOS, con 3 GB de memoria y 13+ tokens/s demostrados en iPhone 17 Pro Max.
- Plataformas de chips soportadas: Rockchip, Houmo, Intel, AMD y Arm.
- Frameworks de inferencia: SGLang, vLLM, llama.cpp y Ollama, además de Transformers.
- Frameworks de ajuste fino: SWIFT y LLaMA-Factory.
- Latencia y throughput: solo se dispone del dato de 13+ tokens/s en iPhone 17 Pro Max; no hay cifras publicadas para GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MiniCPM-V 4.7 35B-A3B-FP8 | ~35,2B totales, ~3B activos | no disponible | Puntuacion global en modo Instruct superior a Qwen3.6 35B-A3B con menor tiempo de inferencia (segun el autor) | Apache 2.0 | HuggingFace, frameworks multiples |
| MiniCPM-V 4.7 35B-A3B (BF16) | ~35,2B totales | no disponible | Base de la version FP8 | Apache 2.0 | HuggingFace |
| MiniCPM-V 4.7 1B | no disponible | no disponible | no disponible | no disponible | HuggingFace, GGUF |
| Qwen3.6 35B-A3B | no disponible | no disponible | Referencia de comparacion citada por OpenBMB | no disponible | no disponible |

Solo se dispone de datos concretos de los modelos de la propia familia MiniCPM-V. Para Qwen3.6 35B-A3B únicamente se menciona como término de comparación cualitativo, sin especificaciones verificables en la información proporcionada.

## Limitaciones y advertencias

- No se dispone de información sobre sesgos conocidos del modelo ni sobre la composición del dataset de entrenamiento.
- Riesgo de alucinación: inherente a los modelos de lenguaje multimodales; no se han publicado evaluaciones específicas de fidelidad visual.
- Idiomas soportados no especificados: la model card no incluye la lista de idiomas, por lo que el comportamiento multilingüe es incierto y debe validarse antes de usarlo en producción fuera del inglés.
- Longitud de contexto no disponible: no es posible dimensionar aplicaciones que dependan de ventanas largas sin una medición propia.
- La cuantización FP8 puede introducir degradación de precisión respecto a los pesos BF16 originales; no se publican comparativas de calidad FP8 frente a BF16.
- Soporte de tool calling y function calling no confirmado en la documentación disponible; conviene verificarlo experimentalmente.
- La afirmación de "primer modelo MoE abierto con inferencia en dispositivo sin pérdida" es una declaración del autor y no está respaldada por benchmarks publicados en la información disponible.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar las licencias de los pesos base y de los componentes de terceros (por ejemplo, el codificador visual basado en LLaVA-UHD v4).

## Enlaces

- Modelo en HuggingFace (esta version FP8): https://huggingface.co/openbmb/MiniCPM-V-4.7-35B-A3B-FP8
- Modelo base BF16: https://huggingface.co/openbmb/MiniCPM-V-4.7-35B-A3B
- Variante DSpark: https://huggingface.co/openbmb/MiniCPM-V-4.7-35B-A3B-DSpark
- Variante GGUF: https://huggingface.co/openbmb/MiniCPM-V-4.7-35B-A3B-gguf
- Variante 1B: https://huggingface.co/openbmb/MiniCPM-V-4.7-1B
- Repositorio GitHub MiniCPM-V: https://github.com/openbmb/MiniCPM-V
- Repositorio llama.cpp-omni (LES): https://github.com/OpenBMB/llama.cpp-omni
- Proyecto LLaVA-UHD v4: https://github.com/THUMAI-Lab/LLaVA-UHD-v4
- Demo interactiva: https://huggingface.co/spaces/openbmb/MiniCPM-V-4.7-Demo
- Documentacion de MiniCPM-V 4.7: https://github.com/OpenBMB/MiniCPM-o/blob/main/docs/minicpm_v4dot7_en.md
- Guia de despliegue: https://github.com/OpenBMB/MiniCPM-o/blob/main/docs/deployment_en.md
- Blog sobre Self-Replay Fine-Tuning: https://openbmb.cn/en/blog/self-replay-fine-tuning
- Cookbook: https://github.com/OpenSQZ/MiniCPM-V-CookBook
- Hilo en r/LocalLLaMA: https://www.reddit.com/r/LocalLLaMA/comments/1x47taj/openbmbminicpmv4735ba3b/
