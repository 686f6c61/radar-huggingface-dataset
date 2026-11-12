# SaarAI/Amharic-ASR-v1

## Resumen

SaarAI/Amharic-ASR-v1 es un modelo de reconocimiento automático del habla (ASR) especializado en amárico, desarrollado por SaarAI. Se trata de un ajuste fino (fine-tuning) del modelo base badrex/Ethio-ASR-amharic, que a su vez deriva de facebook/w2v-bert-2.0, sobre una arquitectura Wav2Vec2-BERT con cabeza de clasificación CTC. El modelo resuelve el problema de la transcripción de voz en amárico, un idioma etíope de bajos recursos con escritura etiópica (Ge'ez), donde los sistemas ASR multilingües genéricos rinden por debajo de lo deseable.

Con 606 millones de parámetros, el modelo se posiciona en el rango medio de los sistemas ASR neuronales, lo que permite un despliegue razonable en infraestructura de gama media. Incorpora soporte para decodificación con modelo de lenguaje KenLM mediante pyctcdecode, una técnica que corrige y contextualiza las salidas CTC en bruto. Los tags del repositorio indican un enfoque orientado al dominio de telecomunicaciones, lo que sugiere un ajuste específico para transcripciones de audio telefónico o de centros de atención.

La relevancia actual del modelo radica en su especialización: frente a los ASR multilingües generalistas, un modelo afinado exclusivamente para amárico con decodificación KenLM puede ofrecer una precisión notablemente superior en un idioma con escasa cobertura comercial. La licencia CC-BY-4.0 facilita su adopción en productos, aunque el acceso al repositorio está restringido y requiere aceptar condiciones en Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Wav2Vec2-BERT con cabeza CTC (transformers) |
| Parametros totales | 606.098.651 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de audio; ventana de entrada dependiente de la configuración de w2v-bert) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; cuantización posible vía herramientas externas) |
| Idiomas soportados | am (amárico) |
| Licencia | cc-by-4.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura Wav2Vec2-BERT, un codificador convolucional seguido de un transformer que procesa representaciones de audio auto-supervisadas, con una cabeza de clasificación CTC para la transcripción. El modelo base es badrex/Ethio-ASR-amharic, un ajuste previo sobre facebook/w2v-bert-2.0, lo que indica una cadena de fine-tuning en dos etapas sobre el checkpoint multilingüe original de Meta. La inclusión de los tags `ctc`, `kenlm` y `pyctcdecode` confirma que el modelo está pensado para decodificación con corrección mediante modelo de lenguaje n-grama.

Los datos de entrenamiento declarados incluyen el dataset SaarAI/waxal-amharic-combined, google/WaxalNLP, Ibtihal02/amharic-commonvoice-asr, HuggingFaceFW/fineweb-2 y wikimedia/wikipedia. La presencia de fineweb-2 y Wikipedia sugiere el uso de texto para el entrenamiento del modelo de lenguaje KenLM empleado en la decodificación, más que para el propio ajuste acústico. No se especifica el número de horas de audio ni el número de tokens de texto utilizados, por lo que estos datos no están disponibles. Tampoco se documenta si hubo etapas de RLHF o DPO, algo poco habitual en modelos ASR.

## Capacidades

- Reconocimiento automático del habla en amárico con salida de texto en escritura etiópica.
- Decodificación CTC con corrección mediante modelo de lenguaje KenLM (pyctcdecode), que mejora la coherencia ortográfica y léxica.
- Especialización declarada en el dominio de telecomunicaciones, lo que sugiere robustez ante audio telefónico.
- Integración con la librería transformers y con el pipeline `automatic-speech-recognition`.
- Compatibilidad con endpoints de Hugging Face (tag `endpoints_compatible`).
- No se documentan capacidades de tool calling, agentes, visión, audio bidireccional ni modo de razonamiento extendido; es un modelo puramente ASR.

## Casos de uso

- Transcripción de llamadas de atención al cliente: el modelo puede convertir grabaciones de centros de contacto en texto para análisis de calidad, detección de incidencias y generación de actas. Su ajuste al dominio de telecomunicaciones lo hace adecuado para audio comprimido de telefonía.
- Subtitulado y accesibilidad de contenido en amárico: generación de subtítulos automáticos para vídeos, informativos o material educativo dirigido a hablantes de amárico, con la decodificación KenLM reduciendo errores ortográficos.
- Digitalización de archivos sonoros: transcripción de entrevistas, programas de radio y registros históricos en amárico para su indexación y búsqueda textual.
- Asistentes de voz para servicios públicos: conversión de consultas habladas en amárico a texto para su procesamiento posterior por sistemas de gestión de tickets o chatbots.
- Investigación lingüística y corpus: generación de transcripciones a gran escala para estudios del amárico, análisis dialectal y construcción de corpus anotados.
- Verificación y moderación de contenido: transcripción de audio generado por usuarios en plataformas para su revisión automática frente a políticas de contenido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 2,4 GB solo para pesos (606 M de parámetros × 4 bytes), más overhead de activaciones y del codificador convolucional.
- VRAM estimada en fp16/bf16: aproximadamente 1,2 GB para pesos, más memoria de trabajo; cómodo en GPUs de 8 GB o superiores.
- GPU recomendadas: NVIDIA RTX 3090/4090, A10, L4, A100 o H100 para despliegues de alto throughput; una T4 de 16 GB es suficiente para inferencia en fp16.
- Cabe en GPUs de consumo: sí, en tarjetas con 6-8 GB o más (RTX 3060, RTX 4060, RTX 4070, etc.).
- Opciones de despliegue: transformers (pipeline de ASR), Hugging Face Inference Endpoints (tag `endpoints_compatible`), y servidores compatibles con modelos transformers; la decodificación KenLM requiere pyctcdecode y el binario del modelo de lenguaje.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto/audio | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SaarAI/Amharic-ASR-v1 | 606 M | no disponible | am | cc-by-4.0 | Gated en HF |
| badrex/Ethio-ASR-amharic | no disponible | no disponible | am (etíope) | no disponible | HF |
| facebook/w2v-bert-2.0 | no disponible | no disponible | multilingüe | no disponible | HF |
| whisper-large-v3 | 1.550 M | 30 s por ventana | multilingüe (incluye am) | no disponible | HF |

El modelo se diferencia de Whisper por su especialización monolingüe y su tamaño menor, lo que reduce costes de inferencia a cambio de perder cobertura multilingüe. Frente a su modelo base badrex/Ethio-ASR-amharic, incorpora decodificación KenLM y un ajuste orientado a telecomunicaciones. No se dispone de métricas comparativas publicadas para cuantificar la mejora.

## Limitaciones y advertencias

- Modelo monolingüe: solo transcribe amárico; no soporta otros idiomas ni cambio de código (code-switching) de forma fiable.
- Riesgo de alucinación y errores de transcripción en audio con ruido, acentos no representados en el corpus o vocabulario técnico fuera del dominio de entrenamiento.
- Sesgos potenciales derivados de la composición de los datasets (WaxalNLP, Common Voice), que pueden infrarepresentar variedades dialectales o hablantes de determinadas regiones.
- El acceso al repositorio está restringido (gated): es necesario aceptar condiciones en Hugging Face antes de descargar los pesos.
- La licencia CC-BY-4.0 permite uso comercial con atribución, pero conviene verificar las condiciones de los datasets de origen y del modelo base.
- La decodificación KenLM añade dependencias externas (binario del modelo de lenguaje, pyctcdecode) que complican el despliegue en producción.
- No se documentan métricas de WER/CER para este checkpoint, por lo que la evaluación en el caso de uso concreto es imprescindible antes de producción.
- El modelo está fechado en 2026 según los metadatos del repositorio; verificar la vigencia y el mantenimiento del proyecto.

## Enlaces

- Hugging Face: https://huggingface.co/SaarAI/Amharic-ASR-v1
- Modelo base: https://huggingface.co/badrex/Ethio-ASR-amharic
- Modelo original: https://huggingface.co/facebook/w2v-bert-2.0
- Dataset combinado: https://huggingface.co/datasets/SaarAI/waxal-amharic-combined
- Dataset WaxalNLP: https://huggingface.co/datasets/google/WaxalNLP
- Dataset Common Voice amárico: https://huggingface.co/datasets/Ibtihal02/amharic-commonvoice-asr
- Dataset FineWeb-2: https://huggingface.co/datasets/HuggingFaceFW/fineweb-2
- Dataset Wikipedia: https://huggingface.co/datasets/wikimedia/wikipedia
- Paper relacionado (arXiv 2404.13362): https://arxiv.org/abs/2404.13362
- Referencia arXiv 2610.26448: https://arxiv.org/abs/2610.26448
- Referencia arXiv 2603.23654: https://arxiv.org/abs/2603.23654
