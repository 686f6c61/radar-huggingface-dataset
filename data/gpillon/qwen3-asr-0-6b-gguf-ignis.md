# gpillon/Qwen3-ASR-0.6B-GGUF-ignis

## Resumen

Qwen3-ASR-0.6B es un modelo de reconocimiento automático del habla (ASR) desarrollado por el equipo Qwen de Alibaba Cloud, publicado bajo licencia Apache 2.0. Esta ficha describe la conversión a GGUF realizada por gpillon para **ignis**, un servidor de inferencia local compatible con la API de OpenAI. El modelo original resuelve la transcripción de audio a texto con un tamaño reducido (751,6 millones de parámetros reales según los pesos en safetensors), lo que lo hace apto para ejecución en CPU.

La relevancia de esta variante concreta reside en su empaquetado: los ficheros GGUF separan el decodificador (Q8_0, Q4_K_M o bf16) del codificador de audio (`mmproj`), de modo que ignis puede ejecutar el modelo en CPU en paralelo al modelo de lenguaje que corre en GPU, sin consumir VRAM. Esto permite dictado local y transcripciones privadas en máquinas sin GPU dedicada.

La model card reporta mediciones propias de latencia y tasa de error de palabra (WER) con el ejecutor Rust de ignis, lo que aporta datos concretos de rendimiento práctico más allá de los benchmarks oficiales del modelo base, que no se incluyen en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo ASR con decodificador y codificador de audio separados en el empaquetado GGUF) |
| Parametros totales | 751.632.384 (según safetensors del modelo base) |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0, Q4_K_M, bf16 (decodificador); Q8_0 y bf16 (codificador de audio) |
| Idiomas soportados | no disponible (las pruebas de la model card usan italiano e inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (decodificador y `mmproj` del codificador de audio) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base Qwen/Qwen3-ASR-0.6B ni su proceso de entrenamiento (número de tokens, composición del dataset, uso de RLHF o DPO). Lo que sí se documenta es el proceso de conversión: gpillon convirtió el checkpoint oficial en la revisión `5eb144179a02acc5e5ba31e748d22b0cf3e303b0` con `convert_hf_to_gguf.py` de llama.cpp b11840, generando decodificador y codificador de audio (`--mmproj`) en bf16 y Q8_0, y derivando Q4_K_M desde bf16 con `llama-quantize`. Los ficheros Q8_0 se verificaron contra la conversión de ggml-org.

La innovación técnica destacable no está en el modelo en sí, sino en su integración: el empaquetado separa decodificador y codificador de audio en ficheros GGUF independientes, lo que permite a ignis ejecutar el conjunto en CPU con su propio ejecutor en Rust mientras el modelo de lenguaje ocupa la GPU. El repositorio incluye `SHA256SUMS` y el catálogo de ignis fija la revisión y los hashes de estos ficheros.

## Capacidades

- Transcripción de audio a texto (pipeline `automatic-speech-recognition`).
- Ejecución en CPU sin consumo de VRAM, en paralelo a un modelo de lenguaje en GPU.
- Servicio compatible con la API de OpenAI en el endpoint `/v1/audio/transcriptions`; clientes que envían `model: whisper-1` también funcionan.
- Dictado de prompts en el Playground de ignis.
- Procesamiento de clips de audio de duración considerable (se reportan mediciones sobre un clip de 60,8 segundos).
- Soporte multilingüe: no confirmado en la información disponible; las pruebas documentadas cubren italiano e inglés.
- Tool calling, agentes, visión, audio de salida o modo thinking: no disponible / no aplicable según la información proporcionada.

## Casos de uso

- **Dictado local de prompts**: con ignis en marcha, el usuario dicta en el Playground y el modelo transcribe en CPU mientras el LLM permanece cargado en GPU, sin competir por VRAM.
- **Transcripción privada de reuniones y notas de voz**: el audio no sale de la máquina, lo que encaja en entornos con requisitos de confidencialidad; el modelo procesa clips de alrededor de un minuto en tiempos del orden de 9 a 16 segundos según el hardware medido.
- **Sustitución de Whisper en clientes existentes**: cualquier cliente OpenAI que apunte a `/v1/audio/transcriptions` con `model: whisper-1` obtiene transcripciones sin cambios de código en la aplicación.
- **Servidores sin GPU**: en contenedores de 4 núcleos y 3 hilos se midió 16,31 s para un clip de 60,8 s (3,7x tiempo real), lo que lo hace viable en infraestructura modesta.
- **Pipelines de accesibilidad y subtitulado offline**: la licencia Apache 2.0 y la ejecución en CPU permiten integrarlo en herramientas de subtitulado desplegadas en equipos de usuario final.
- **Procesamiento por lotes de audio en segundo plano**: al no ocupar VRAM, puede ejecutarse de forma concurrente con tareas de generación de texto en la misma máquina, aprovechando núcleos de CPU ociosos.

## Benchmarks y rendimiento

Datos medidos por el autor con el ejecutor CPU de ignis, en caliente, clip completo y prompt oficial, usando `qwen3-asr-0.6b` (Q8_0):

| Metrica | i9-10900K, 9 hilos | Contenedor de 4 nucleos, 3 hilos |
|---|---|---|
| Tiempo para un clip de 60,8 s | 9,25 s (6,6x tiempo real) | 16,31 s (3,7x tiempo real) |

Tasa de error de palabra (WER), agrupada:

| Modelo | 40 clips de test FLEURS (italiano, inglés) | 11 dictados en italiano |
|---|---|---|
| `qwen3-asr-0.6b` (Q8_0, ignis) | 5,91% | 7,74% |
| Transformers, FP32 (checkpoint oficial) | 6,64% | 8,23% |

No se han publicado en la información disponible resultados de benchmarks estándar del modelo base (MMLU, HumanEval, GSM8K u otros); estos no son aplicables a un modelo ASR.

## Requisitos de hardware

- VRAM: 0 GB en el escenario documentado; el modelo se ejecuta en CPU con el ejecutor de ignis.
- CPU: se midió en un i9-10900K con 9 hilos y en un contenedor de 4 núcleos con 3 hilos; este último sigue superando el tiempo real (3,7x) en clips de un minuto.
- GPU: no requerida para este modelo; convive con el modelo de lenguaje que sí ocupa la GPU.
- GPU de consumo: no aplica, al no necesitar VRAM.
- Despliegue: servidor ignis (v0.9.0 o posterior), con `ignis-server model download qwen3-asr-0.6b` y `--speech-model qwen3-asr-0.6b` o la clave `speech:` en el fichero de configuración.
- Tamaño del repositorio: 3,4 GB (incluye decodificador y codificador en varias cuantizaciones).
- Latencia y throughput: ver tabla de benchmarks (6,6x y 3,7x tiempo real según hardware).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento ASR | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3-ASR-0.6B (esta variante GGUF) | 751,6 M | no disponible | WER 5,91% FLEURS (it/en), 7,74% dictados it | apache-2.0 | GGUF para ignis; base en HF |
| Qwen3-ASR-1.7B (variante GGUF de gpillon) | no disponible | no disponible | no disponible en esta ficha | apache-2.0 | GGUF para ignis; es el modelo por defecto de ignis |
| Whisper (OpenAI) | no disponible | no disponible | no disponible | no disponible | no disponible |

La información disponible solo permite comparar esta variante con el checkpoint oficial en FP32 (WER 6,64% y 8,23% respectivamente) y con la variante de 1,7B, descrita por el autor como más precisa pero más lenta en CPUs pequeñas. No se aportan datos de otros modelos ASR.

## Limitaciones y advertencias

- Los datos de WER proceden de pruebas propias del autor sobre italiano e inglés; no hay evaluación publicada de cobertura idiomática ni de sesgos.
- Riesgo de alucinación y errores de transcripción en audio con ruido, acentos no evaluados o dominios especializados: no cuantificado en la información disponible.
- El fichero Q4_K_M no forma parte del catálogo de ignis; solo Q8_0 está integrado y verificado.
- Las mediciones de latencia corresponden a un único clip de 60,8 s y a dos configuraciones de hardware; no deben extrapolarse sin validación propia.
- El modelo base está bajo Apache 2.0, lo que permite uso comercial; esta conversión es una forma modificada del mismo y mantiene esa licencia, con atribución al equipo Qwen y a gpillon.
- El modelo está pensado para ejecución en CPU con ignis; su uso fuera de ese servidor requeriría verificar la compatibilidad del empaquetado GGUF con otras herramientas.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/gpillon/Qwen3-ASR-0.6B-GGUF-ignis
- Modelo base: https://huggingface.co/Qwen/Qwen3-ASR-0.6B
- Variante de 1,7B: https://huggingface.co/gpillon/Qwen3-ASR-1.7B-GGUF-ignis
- Repositorio de ignis: https://github.com/gpillon/ignis
- Última release de ignis: https://github.com/gpillon/ignis/releases/latest
- Issue de seguimiento del soporte de voz: https://github.com/gpillon/ignis/issues/350
- Documentación de ignis: https://gpillon.github.io/ignis/
