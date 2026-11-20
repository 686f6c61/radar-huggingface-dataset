# arvedo/NVIDIA-Nemotron-3.5-Bolt-E4B-NVFP4-GGUF

## Resumen

NVIDIA-Nemotron-3.5-Bolt-E4B es un modelo multimodal (texto, imagen y audio) de la familia Nemotron de NVIDIA, distribuido originalmente en BF16 bajo el identificador `nvidia/NVIDIA-Nemotron-3.5-Bolt-E4B-BF16`. El repositorio analizado aquí es una exportación comunitaria a GGUF realizada por el usuario `arvedo`, que convierte los pesos NVFP4 (FP4 de NVIDIA) del modelo en un fichero compatible con `llama.cpp` para pruebas locales en escritorio y CPU sin necesidad de Linux ni de vLLM.

El modelo combina un transformer de lenguaje de aproximadamente 7.500 millones de parámetros totales con un proyector multimodal independiente que cubre visión y audio, y emplea una arquitectura de embeddings por capa (PLE, Per-Layer Embedding) almacenada en Q8_0. La ventana de contexto declarada en la model card es de 128k tokens calibrados, con un vocabulario de 262k tokens.

Su relevancia actual reside en que permite ejecutar un modelo multimodal de NVIDIA con pesos de 4 bits en GPUs Blackwell de consumo (RTX 5090) mediante `llama.cpp`, además de ofrecer modelos borrador DFlash para decodificación especulativa con una aceleración declarada del 50 % y sin pérdida de precisión. Es importante subrayar que, en `llama.cpp`, el tipo `GGML_TYPE_NVFP4` se emula por software mediante tablas de búsqueda, por lo que esta exportación no aporta mejoras de velocidad frente a un GGUF `Q4_K_M` estándar.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (lenguaje + proyector visión/audio), con embeddings por capa (PLE) |
| Parámetros totales | 7.518.069.878 |
| Parámetros activos | no disponible (no se declara como MoE) |
| Longitud de contexto | 128k tokens (calibrado) |
| Tipos de cuantización | NVFP4 (E2M1) para el modelo principal; Q8_0 para la tabla PLE y el proyector recomendado; BF16 para proyector de referencia y borrador |
| Idiomas soportados | en, de, fr, es, it, ja (la model card lista estos; el campo `language` del repo solo indica `en`) |
| Licencia | openmdw-1.1 (Open Model Development & Weights) |
| Formato de pesos | GGUF (también existen ediciones vLLM en safetensors NVFP4) |

## Arquitectura y entrenamiento

La información disponible no detalla la composición del dataset de entrenamiento ni las etapas de alineación (RLHF/DPO). Lo que sí se documenta es la arquitectura de despliegue: un modelo de lenguaje transformer con embeddings por capa (PLE) almacenados en Q8_0, un proyector multimodal separado que codifica tokens visuales y de audio únicamente durante el prefill del prompt, y una cabeza de decodificación autorregresiva puramente textual sobre un vocabulario de 262k tokens.

La innovación técnica destacable es el soporte de decodificación especulativa mediante los modelos borrador DFlash, que operan sobre los estados ocultos del modelo de lenguaje y, según el autor, aceleran la generación un 50 % con muestreo de rechazo que garantiza matemáticamente un 0,00 % de pérdida de precisión. Los pesos NVFP4 están calibrados a 128k de contexto. En `llama.cpp`, el tipo NVFP4 se emula por software con tablas de búsqueda durante la decodificación por lotes, en lugar de usar los Tensor Cores FP4 nativos de Blackwell.

## Capacidades

- Generación de texto conversacional multi-turno.
- Comprensión de imágenes (pipeline `image-text-to-text`).
- Comprensión de audio, a través del proyector multimodal.
- Razonamiento y respuesta a instrucciones en formato conversacional.
- Capacidades multilingües en inglés, alemán, francés, español, italiano y japonés.
- Decodificación especulativa acelerada mediante modelos borrador DFlash.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte explícito de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Modo "thinking" dedicado: no disponible en la información proporcionada.

## Casos de uso

- Asistente multimodal local en escritorio: el modelo puede procesar imágenes y audio junto con texto en un único flujo conversacional, adecuado para prototipos en una RTX 5090 con `llama.cpp` sin depender de infraestructura Linux/vLLM.
- Transcripción y análisis de audio con contexto: gracias al proyector de audio y a la ventana de 128k tokens, se pueden analizar grabaciones largas y formular preguntas sobre su contenido en una sola sesión.
- Descripción y razonamiento sobre imágenes: útil para tareas de captioning, extracción de información de capturas o documentos escaneados y preguntas visuales.
- Evaluación comparativa de cuantizaciones: el repositorio permite contrastar NVFP4 emulado frente a `Q4_K_M` en `llama.cpp` para medir impacto de calidad y latencia en hardware de consumo.
- Generación de texto multilingüe: atención al cliente o generación de contenido en los seis idiomas declarados (en, de, fr, es, it, ja).
- Servicio local con `llama-server`: despliegue de un endpoint compatible con la API de OpenAI en una estación de trabajo para pruebas de integración y demos.
- Aceleración de inferencia interactiva: uso de los borradores DFlash para reducir la latencia percibida en generación de texto largo sin sacrificar precisión.

## Benchmarks y rendimiento

La model card incluye una sección de benchmarks de velocidad y escalado de concurrencia en RTX 5090 con `llama.cpp`, pero los datos numéricos concretos no están disponibles en la información proporcionada (la tabla aparece truncada). No se han publicado en la información disponible resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros).

Datos de rendimiento declarados de forma cualitativa:

| Aspecto | Dato disponible |
|---|---|
| Aceleración con DFlash | +50 % de velocidad de generación |
| Pérdida de precisión con DFlash | 0,00 % (garantizada por muestreo de rechazo) |
| Mejora de velocidad del GGUF NVFP4 frente a Q4_K_M | Ninguna (emulación por software en `llama.cpp`) |
| Benchmarks de calidad (MMLU, HumanEval, GSM8K) | No disponibles |

## Requisitos de hardware

- VRAM estimada (GGUF de este repo): modelo principal de 6,11 GB más proyector recomendado Q8_0 de 532 MB, en torno a 7 GB en total; el proyector BF16 de referencia ocupa 946 MB.
- Edición vLLM LowMemory: 4,79 GiB en disco y 4,65 GiB de VRAM, recomendada para GPUs de 6 GB o más.
- Edición vLLM Standard: 6,00 GB en disco y 5,20 GiB de VRAM.
- GPU recomendadas: RTX 5090 (Blackwell) para aprovechar NVFP4 nativo vía vLLM; GPUs con 6-8 GB o más para el GGUF en `llama.cpp`; A100/H100 no se mencionan en la información disponible.
- Cabe en GPU de consumo: sí, en RTX 5090 y en GPUs con al menos 6-8 GB de VRAM para la variante GGUF.
- Opciones de despliegue: `llama.cpp` (`llama-cli`, `llama-server`) para GGUF; vLLM para las ediciones safetensors NVFP4.
- Latencia y throughput: no disponibles con cifras concretas; solo se declara el +50 % con DFlash.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Multimodal | Licencia | Formato |
|---|---|---|---|---|---|
| Nemotron-3.5-Bolt-E4B (este repo, GGUF) | 7,52 B | 128k | Sí (visión + audio) | openmdw-1.1 | GGUF |
| Nemotron-3.5-Bolt-E4B (vLLM LowMemory) | 7,52 B | 128k | Sí | openmdw-1.1 | safetensors NVFP4 |
| Nemotron-3.5-Bolt-E4B (BF16 original) | 7,52 B | 128k | Sí | openmdw-1.1 | safetensors BF16 |
| Alternativas de otros fabricantes | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la información proporcionada de datos de rendimiento comparado con modelos de terceros de tamaño similar.

## Limitaciones y advertencias

- El GGUF NVFP4 no ofrece ventajas de velocidad en `llama.cpp` frente a un `Q4_K_M` estándar, porque NVFP4 se emula por software; para máximo rendimiento en Blackwell/Rubin hay que usar las ediciones vLLM.
- La decodificación especulativa DFlash solo acelera la generación de texto; los tokens visuales y de audio se procesan únicamente en el prefill.
- El campo `language` del repositorio solo declara `en`, mientras que la model card lista seis idiomas; conviene validar el rendimiento real en español, alemán, francés, italiano y japonés antes de producción.
- No hay información sobre sesgos conocidos ni sobre tasas de alucinación medidas.
- La licencia openmdw-1.1 es una licencia "other"; deben revisarse sus términos en el enlace oficial antes de uso comercial.
- El repositorio es una exportación comunitaria (`arvedo`), no oficial de NVIDIA; la reproducibilidad y el soporte dependen del autor.
- No se documentan capacidades de tool calling ni de agentes, por lo que no deben asumirse en pipelines de producción.
- El tamaño del repo (23,0 GB) incluye todos los artefactos; el modelo principal es de 6,11 GB.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/arvedo/NVIDIA-Nemotron-3.5-Bolt-E4B-NVFP4-GGUF
- Modelo base BF16: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Bolt-E4B-BF16
- Edición vLLM LowMemory: https://huggingface.co/arvedo/Nemotron-3.5-Bolt-E4B-NVFP4-VisionAudio-LowMemory
- Edición vLLM Standard: https://huggingface.co/arvedo/Nemotron-3.5-Bolt-E4B-NVFP4-VisionAudio
- Licencia openmdw-1.1: https://openmdw.ai/license/1-1/
- Patrocinador cDemy: https://cdemy.de/
