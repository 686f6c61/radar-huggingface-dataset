# coder543/granite-speech-4.1-2b-nar-glade

## Resumen

Granite Speech 4.1 2B NAR for Glade es una conversión comunitaria del modelo de reconocimiento automático del habla IBM Granite Speech 4.1 2B NAR, publicada por el usuario coder543. No se trata de un checkpoint estándar de Transformers, sino de un conjunto de activos y configuración de ejecución para Glade, un runtime que utiliza las APIs Core AI de Apple y está optimizado para ejecutarse en el Neural Engine (ANE) de los chips Apple Silicon. El modelo base, desarrollado por IBM, resuelve la transcripción de audio a texto con una arquitectura no autorregresiva: un codificador acústico CTC seguido de una única pasada bidireccional de edición del transcript condicionada por el audio.

La relevancia de esta conversión es de despliegue: permite ejecutar un modelo de reconocimiento del habla de 2.000 millones de parámetros en hardware de consumo Apple (MacBook Air M3, MacBook Pro M5 Max) con una cuantización W8A16 y una tasa de transcripción superior a 50 veces el tiempo real en el M3 y de 85 veces en el M5 Max. El repositorio ocupa 2,7 GB y contiene 59 componentes `.aimodel`, además de `embeddings.f16`, `tokenizer.json` y `metadata.json`.

El modelo soporta cinco idiomas (inglés, francés, alemán, español y portugués) y se distribuye bajo licencia Apache-2.0, la misma que el modelo original de IBM. Está pensado para transcripción final de grabaciones, no para streaming nativo, y requiere orquestación por parte de la aplicación: preprocesado de audio, colapso CTC y tokenización no están incluidos en el repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Codificador acústico CTC (Conformer) más una pasada bidireccional de edición del transcript condicionada por audio; no autorregresiva |
| Parametros totales | 2B (según el nombre del modelo base; no se detalla el desglose en la información disponible) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible como ventana de tokens; se recomiendan fragmentos de audio de 60 segundos o menos |
| Tipos de cuantizacion | W8A16: pesos de convolución y proyección en INT8, activaciones en FP16; proyecciones de salida de convolución del Conformer, parámetros de normalización y tabla de embeddings permanecen en FP16 |
| Idiomas soportados | Inglés (en), francés (fr), alemán (de), español (es), portugués (pt) |
| Licencia | Apache-2.0 |
| Formato de pesos | 59 componentes `.aimodel` (Core AI), `embeddings.f16` (FP16), `tokenizer.json`, `metadata.json`; no es un checkpoint de Transformers |

## Arquitectura y entrenamiento

La arquitectura del modelo base combina un codificador acústico con salida CTC y una etapa de edición del transcript en una sola pasada bidireccional condicionada por el audio. Al ser no autorregresiva, evita la generación token a token y permite transcribir audio completo en un número fijo de pasos, lo que explica las tasas de transcripción medidas. La conversión a Glade reorganiza los grafos con layouts orientados al ANE, capas fusionadas y pesos compartidos entre un conjunto acotado de formas de entrada estáticas.

No se dispone de información sobre el volumen de datos de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO; la model card remite a la ficha del modelo original de IBM para los detalles de entrenamiento. La innovación técnica de esta conversión es el empaquetado para Core AI: los 59 componentes son activos portables que Core AI especializa para el dispositivo objetivo en el primer uso, un proceso que puede tardar varios minutos (entre 19 y 24 minutos observados en las pruebas del autor).

## Capacidades

- Reconocimiento automático del habla (ASR) en inglés, francés, alemán, español y portugués.
- Transcripción de grabaciones largas mediante fragmentación en bloques de 60 segundos o menos, con planificación de fronteras (el autor usó Silero en CPU, no incluido en el repositorio).
- Salida CTC con colapso de repeticiones y tokenización a cargo de la aplicación.
- Edición del transcript en una pasada bidireccional condicionada por el audio, que corrige la salida acústica inicial.
- Ejecución en el Neural Engine de Apple Silicon mediante Core AI, con grafos optimizados para ANE.
- No soporta tool calling, function calling, agentes, visión, audio de entrada más allá del propio ASR ni modo de razonamiento; la información disponible no menciona ninguna de estas capacidades.

## Casos de uso

- Transcripción de reuniones y entrevistas: el modelo procesa grabaciones de hasta 18 minutos en unos 13 segundos en un M5 Max y en unos 22 segundos en un M3, fragmentando el audio en bloques de 60 segundos, lo que lo hace adecuado para generar actas o notas posteriores a la reunión en local.
- Subtitulado de vídeo y pódcast: la tasa de 50 a 85 veces el tiempo real permite generar subtítulos de una hora de audio en menos de un minuto y medio en hardware de consumo, sin enviar el audio a la nube.
- Dictado y notas de voz en aplicaciones iOS: al ejecutarse en el Neural Engine de dispositivos iOS 27 compatibles con Core AI, permite transcripción en el dispositivo con los cinco idiomas soportados, preservando la privacidad del audio.
- Archivado y búsqueda de grabaciones históricas: la capacidad de procesar lotes de audio en local con un coste de preparación amortizable (0,77 segundos de recarga en caché tras la primera especialización) encaja en pipelines de digitalización de archivos sonoros.
- Investigación en ASR multilingüe: al ser una conversión no autorregresiva con licencia Apache-2.0, sirve como referencia para comparar latencia y precisión de arquitecturas CTC más edición frente a modelos autorregresivos en entornos Apple.
- Transcripción de atención al cliente: grabaciones de llamadas en español, francés, alemán, inglés o portugués pueden transcribirse en local para análisis de calidad o cumplimiento, evitando el envío de datos personales a servicios externos.
- Prototipado de aplicaciones de voz en macOS: el repositorio proporciona los activos y la configuración de ejecución para integrar ASR en apps de escritorio con Core AI, aunque requiere que la aplicación implemente el preprocesado y la decodificación.

## Benchmarks y rendimiento

Los únicos datos publicados son mediciones de velocidad y una estimación de WER sobre una única grabación, no una evaluación general ni multilingüe.

| Prueba | Hardware | Resultado |
|---|---|---|
| Discurso de 20 s (JFK) | M3 MacBook Air 16 GB, macOS 27 | 0,408 s de transcripción en caliente (49,0× tiempo real) |
| Discurso completo de 18 min 15 s (JFK) | M3 MacBook Air 16 GB, macOS 27 | 21,90 s (50,0× tiempo real) |
| Discurso completo de 18 min 15 s (JFK) | MacBook Pro M5 Max, macOS 27.2.1 | 12,825 s (85,4× RTFx), mediana de tres pasadas en caliente |
| WER sobre la grabación completa | M3 MacBook Air | 52/2.219 tokens (2,34 %) frente a la referencia proporcionada |

Las mediciones del M3 incluyen lectura de audio, planificación de fragmentos, frontend, codificador, proyector, editor y decodificación, con planificación de fronteras mediante Silero en CPU; las del M5 Max usan el planificador de fronteras por defecto de la CLI de Glade. No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estándar en la información disponible.

## Requisitos de hardware

- Hardware obligatorio: Apple Silicon con macOS 27 o un dispositivo iOS 27 físico compatible con Core AI. No se ejecuta en GPU NVIDIA ni en CPU x86.
- VRAM/unified memory estimada: no disponible de forma explícita; el autor midió en un MacBook Air de 16 GB y en un MacBook Pro de 64 GB, por lo que 16 GB de memoria unificada es suficiente en la configuración probada.
- GPU recomendadas: Neural Engine de Apple Silicon; las pruebas se realizaron en M3 (MacBook Air) y M5 Max (MacBook Pro de 18 núcleos de CPU y 40 de GPU).
- Cabe en hardware de consumo: sí, en Apple Silicon de gama consumer como el M3 con 16 GB.
- Opciones de despliegue: runtime Glade sobre Core AI; no es compatible con vLLM, llama.cpp, Ollama ni TGI. El repositorio no incluye runtime de inferencia.
- Latencia y throughput: 49-50× tiempo real en M3 y 85,4× en M5 Max para la grabación completa; la primera especialización de los 59 componentes tarda entre 19 y 24 minutos, y la recarga desde caché, alrededor de 0,77 segundos.
- Colocación: una traza de la grabación completa registró 1.844 predicciones en ANE y cero intervalos en GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Arquitectura | Licencia | Despliegue |
|---|---|---|---|---|---|
| Granite Speech 4.1 2B NAR for Glade (esta conversión) | 2B | en, fr, de, es, pt | CTC más edición bidireccional, W8A16 | Apache-2.0 | Core AI / ANE en Apple Silicon |
| IBM Granite Speech 4.1 2B NAR (original) | 2B | en, fr, de, es, pt | CTC más edición bidireccional | Apache-2.0 | Checkpoint estándar (Transformers y similares) |
| Whisper large-v3 (OpenAI) | 1.550M | Multilingüe (más de 90) | Transformer encoder-decoder autorregresivo | MIT | CPU, GPU, múltiples runtimes |
| Whisper small (OpenAI) | 244M | Multilingüe | Transformer encoder-decoder autorregresivo | MIT | CPU, GPU, múltiples runtimes |

La comparación con Whisper se ofrece como referencia de categoría; no se dispone de datos de rendimiento comparativos entre ambos modelos en la información proporcionada. Frente al modelo original de IBM, esta conversión no cambia la arquitectura ni los idiomas, sino el formato de pesos y el runtime objetivo.

## Limitaciones y advertencias

- No es un checkpoint de Transformers: requiere orquestación en la aplicación (preprocesado de audio, colapso CTC, tokenización) y no incluye runtime de inferencia.
- Solo funciona en Apple Silicon con macOS 27 o iOS 27 físico compatible con Core AI; no hay soporte para otras plataformas.
- La primera especialización de los componentes tarda entre 19 y 24 minutos según las mediciones del autor; la pérdida de caché o los cambios de sistema, dispositivo o aplicación pueden obligar a repetirla.
- El WER de 2,34 % corresponde a una única grabación en inglés; no es una evaluación general ni multilingüe.
- Está pensado para transcripción final, no para streaming nativo.
- El audio debe ser mono a 16 kHz y fragmentarse en bloques de 60 segundos o menos; la planificación de fronteras usada en las pruebas (Silero) no está incluida en el repositorio.
- La cuantización W8A16 puede degradar la precisión frente al modelo original en FP16; no se han publicado comparativas de calidad entre ambas versiones.
- Es una conversión comunitaria, no una versión oficial de IBM ni de Apple.
- No se dispone de información sobre sesgos, riesgo de alucinación o comportamiento en dominios específicos; se remite a la ficha del modelo original.
- Licencia Apache-2.0: permite uso comercial, pero debe conservarse la atribución y las condiciones de la licencia.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/coder543/granite-speech-4.1-2b-nar-glade
- Modelo base en Hugging Face: https://huggingface.co/ibm-granite/granite-speech-4.1-2b-nar
- Revisión del modelo base usada en la conversión: https://huggingface.co/ibm-granite/granite-speech-4.1-2b-nar/tree/a1e3416e25ce29ab3852778e54fa8b3bd59c4bf2
- Paper, blog, repositorio de código o demo: no disponibles en la información proporcionada.
