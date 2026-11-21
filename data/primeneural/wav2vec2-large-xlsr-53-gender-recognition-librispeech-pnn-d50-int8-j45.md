# PrimeNeural/wav2vec2-large-xlsr-53-gender-recognition-librispeech-pnn-d50-int8-j45

## Resumen

El modelo `PrimeNeural/wav2vec2-large-xlsr-53-gender-recognition-librispeech-pnn-d50-int8-j45` es una versión comprimida mediante Prime Neural Networks (PNN) del modelo `alefiury/wav2vec2-large-xlsr-53-gender-recognition-librispeech`, un clasificador de género de voz basado en wav2vec2-large-xlsr-53 y ajustado sobre LibriSpeech. Lo desarrolla PrimeNeural (PreciseStatistics GmbH) y su propósito es mantener el comportamiento de clasificación binaria de género del modelo original con una huella mucho menor: 146 capas lineales se convierten en capas PNN con densidad del 50 % y pesos INT8 con una escala por fila de salida.

La relevancia de esta ficha no está en la tarea (clasificación de género a partir de audio, un problema acotado y con implicaciones éticas evidentes) sino en el método de compresión. PNN sustituye matrices densas por proyecciones estructuradas en las que cada salida lee un conjunto fijo de entradas, sin almacenar índices, y cuantiza a 8 bits. El resultado es un fichero de 178,72 MB que, según el autor, mantiene un acuerdo top-1 del 98,65 % con el modelo original sobre datos reservados.

La arquitectura subyacente es wav2vec2-large-xlsr-53 (transformer convolucional y de atención sobre audio, ~317 M de parámetros en su forma densa original), si bien el recuento real de parámetros del fichero safetensors de este repositorio es de 164.313.474. La longitud de contexto, los idiomas efectivos y los benchmarks detallados no están disponibles en la información proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | wav2vec2-large-xlsr-53 con 146 capas lineales sustituidas por capas PNN (densidad 50 %, INT8 con escala por fila de salida) |
| Parametros totales | 164.313.474 (recuento real en safetensors) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT8 en las capas PNN (una escala por fila de salida); partes densas en float16 |
| Idiomas soportados | no disponible (el modelo base se entrena sobre LibriSpeech, principalmente inglés; la model card no declara lista de idiomas) |
| Licencia | apache-2.0 (heredada del modelo base); el paquete PNN se licencia por separado (licencia de evaluación) |
| Formato de pesos | safetensors (formato PNN propietario, requiere `pnn_load.py`) |
| Tamano del repositorio | 0,2 GB (fichero de modelo: 178,72 MB) |
| Libreria | pnn |
| Modelo base | alefiury/wav2vec2-large-xlsr-53-gender-recognition-librispeech |
| Tarea | Clasificacion de genero a partir de audio (AutoModelForAudioClassification) |

## Arquitectura y entrenamiento

El modelo parte de wav2vec2-large-xlsr-53, un transformer de reconocimiento de voz auto-supervisado que procesa la forma de onda mediante un extractor convolucional y una pila de bloques de atención. Sobre esa base, el autor original (alefiury) ajustó un cabezal de clasificación para predecir género sobre LibriSpeech. La versión PNN conserva esa topología pero reemplaza 146 capas lineales por capas PNN al 50 % de densidad: cada salida lee un conjunto estructurado y fijo de entradas, con el mismo número de lecturas para toda salida, y sin almacenar índices de dispersión. Los pesos de esas capas se guardan en INT8 con una escala por fila de salida; el resto de la red permanece en float16.

El proceso de compresión se describe como destilación de 4 épocas sobre `openslr/librispeech_asr`, con inicialización por mínimos cuadrados y coincidencia de estados ocultos (hidden-state matching) contra el modelo original. El autor reporta un acuerdo top-1 del 98,65 % con el modelo original sobre datos reservados. No se detallan en la información disponible el número de tokens de audio, la composición exacta del dataset ni si hubo etapas de RLHF o DPO (no aplicables a una tarea de clasificación). Tampoco se especifican innovaciones de decodificación o atención más allá del propio esquema PNN.

## Capacidades

- Clasificación binaria de género a partir de audio (tarea principal del modelo base).
- Extracción de representaciones acústicas propias de wav2vec2-large-xlsr-53, reutilizables para otras tareas de audio si se sustituye el cabezal.
- Inferencia con pesos INT8 en capas PNN mediante kernels de CPU y GPU NVIDIA del paquete PNN.
- Carga como `AutoModelForAudioClassification` únicamente a través del cargador `pnn_load.py`; `from_pretrained` estándar de transformers no funciona con este repositorio.
- Modo de entrenamiento: `load(REPO, kernels="off")` devuelve capas PyTorch equivalentes para fine-tuning.
- Soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio generativo o modo thinking: no disponible (no es un modelo generativo).

## Casos de uso

- Moderación y análisis de contenido en plataformas de audio: clasificar locutores por género en grabaciones para estudios de representación o cumplimiento de políticas internas, aprovechando el reducido tamaño del modelo (178,72 MB) para desplegarlo en servidores modestos.
- Investigación en sesgos de género en ASR: usar el clasificador como etiquetador auxiliar en corpus de voz para medir disparidades de rendimiento entre grupos, dado el acuerdo del 98,65 % con el modelo original.
- Preprocesado en pipelines de transcripción: etiquetar segmentos de audio con género estimado antes del reconocimiento de voz, para enrutar a modelos o vocabularios específicos.
- Análisis de audiencias y estudios de mercado: procesar grandes volúmenes de llamadas o podcasts y agregar estadísticas de género por franja horaria o programa, con coste de cómputo bajo gracias a INT8 y densidad del 50 %.
- Despliegue en entornos con recursos limitados: servir el modelo en CPU mediante los kernels del paquete PNN o en GPU consumer, dado el tamaño del fichero y la cuantización INT8.
- Experimentación con compresión de modelos: usar este repositorio como referencia para evaluar el impacto de PNN al 50 % de densidad e INT8 frente al modelo denso original en una tarea de clasificación de audio.
- Evaluación de robustez acústica: comparar predicciones del modelo comprimido y del original sobre distintos canales (teléfono, estudio, ruido) para cuantificar la degradación introducida por la compresión.

## Benchmarks y rendimiento

El único dato de rendimiento publicado en la información disponible es el acuerdo top-1 con el modelo original sobre datos reservados: 98,65 %. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible, y no se dispone de métricas de precisión, recall o F1 por clase.

| Metrica | Valor |
|---|---|
| Acuerdo top-1 con el modelo original (datos reservados) | 98,65 % |
| Precisión / recall / F1 | no disponible |
| Benchmarks estandar (MMLU, HumanEval, GSM8K) | no disponible |

## Requisitos de hardware

- VRAM estimada para inferencia: el fichero de modelo ocupa 178,72 MB, por lo que la inferencia cabe holgadamente en GPUs con 2-4 GB de VRAM; en CPU el modelo puede ejecutarse con los kernels del paquete PNN.
- GPU recomendadas: cualquier GPU NVIDIA compatible con los kernels del paquete PNN; no se especifican modelos concretos (A100, H100, RTX 4090) en la información disponible.
- GPU consumer: sí, cabe en cualquier GPU consumer moderna por el tamaño del fichero; no se detallan requisitos mínimos exactos.
- Opciones de despliegue: paquete PNN (cargador `pnn_load.py` y kernels de CPU/GPU), endpoint de inferencia en primeneural.net; no compatible con vLLM, llama.cpp, Ollama ni TGI de forma directa.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Formato |
|---|---|---|---|---|---|
| PrimeNeural/…-pnn-d50-int8-j45 (este modelo) | 164.313.474 | no disponible | 98,65 % de acuerdo top-1 con el original | apache-2.0 (pesos); paquete PNN aparte | safetensors PNN + INT8 |
| alefiury/wav2vec2-large-xlsr-53-gender-recognition-librispeech | no disponible en la informacion | no disponible | referencia del acuerdo anterior | apache-2.0 | safetensors (transformers) |
| wav2vec2-large-xlsr-53 (base, sin ajuste de género) | ~317 M (forma densa típica) | no disponible | no aplica (no clasifica género) | apache-2.0 | safetensors |

La comparativa se limita al modelo original y a su base, ya que no se dispone de datos de otros clasificadores de género comparables en la información proporcionada.

## Limitaciones y advertencias

- La tarea de clasificación de género binaria es intrínsecamente problemática: no representa identidades no binarias y puede producir errores sistemáticos en voces atípicas, infantiles, ancianas o con acentos poco representados en LibriSpeech.
- El modelo base se ajusta sobre LibriSpeech, predominantemente inglés y de dominio lectura; el rendimiento fuera de ese dominio (llamadas telefónicas, ruido, otros idiomas) no está documentado.
- Riesgo de alucinación no aplicable en sentido generativo, pero sí de clasificaciones erróneas con alta confianza; no se publican métricas de calibración.
- La compresión PNN introduce una degradación del 1,35 % en acuerdo top-1 frente al original; el impacto por subgrupos demográficos no se detalla.
- La licencia apache-2.0 cubre los pesos, pero el paquete PNN (cargador y kernels) se licencia por separado con una licencia de evaluación; el uso en producción requiere contactar con el autor (info@primeneural.net).
- El formato PNN no es compatible con el ecosistema estándar de transformers: `AutoModelForAudioClassification.from_pretrained` no funciona sobre este repositorio, lo que complica la integración en pipelines existentes.
- El modelo tiene 0 descargas y 0 likes en el momento de la ficha, y fue creado y actualizado el mismo día (21 de noviembre de 2026); no hay evidencia de uso en producción ni validación independiente.
- Existe una patente pendiente (US 19/685,168) sobre la tecnología PNN, lo que puede afectar a implementaciones derivadas.
- Uso ético: emplear este modelo para inferir género de personas sin consentimiento puede vulnerar normativas de protección de datos (RGPD) y debe tratarse como dato sensible.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/PrimeNeural/wav2vec2-large-xlsr-53-gender-recognition-librispeech-pnn-d50-int8-j45
- Modelo base: https://huggingface.co/alefiury/wav2vec2-large-xlsr-53-gender-recognition-librispeech
- Plataforma Prime Neural Networks: https://primeneural.net
- Dataset de destilación: https://huggingface.co/datasets/openslr/librispeech_asr
- Contacto para licencia del paquete PNN: info@primeneural.net
