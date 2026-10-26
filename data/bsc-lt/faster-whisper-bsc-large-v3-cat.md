# BSC-LT/faster-whisper-bsc-large-v3-cat

## Resumen

`faster-whisper-bsc-large-v3-cat` es un modelo acústico para reconocimiento automático del habla (ASR) en catalán, publicado por el Language Technologies Laboratory del Barcelona Supercomputing Center (BSC-LT). No es un modelo entrenado desde cero: es la conversión a CTranslate2, mediante la herramienta faster-whisper, del modelo `BSC-LT/whisper-bsc-large-v3-cat`, que a su vez es un ajuste fino de `openai/whisper-large-v3` sobre corpus catalanes (3Cat, Parlament de Catalunya, Corts Valencianes y Common Voice con acentos catalanes). El resultado es un artefacto de 3,1 GB que se ejecuta con el runtime de faster-whisper en lugar de con Transformers.

La relevancia es práctica: mantiene la arquitectura y el conocimiento acústico del Whisper large-v3 (encoder-decoder transformer de aproximadamente 1.550 millones de parámetros) pero en un formato optimizado para inferencia, con cuantización float16 e INT8, lo que reduce requisitos de memoria y latencia frente a la implementación original. Para un desarrollador que necesite transcribir audio catalán en producción (medios, administración pública, atención ciudadana, subtitulado), es una pieza directamente desplegable, con licencia Apache-2.0 y sin dependencia de la pila PyTorch.

La limitación de diseño más importante está declarada por el propio autor: el modelo transcribe a texto plano sin puntuación, y está especializado exclusivamente en catalán. La información publicada no incluye métricas de WER ni detalles cuantitativos del ajuste fino (horas de audio, composición exacta del corpus), por lo que la evaluación de calidad debe hacerse con datos propios.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper large-v3) convertido a CTranslate2 |
| Parametros totales | ~1.550 M (1,55 B, heredado de Whisper large-v3) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | Ventanas de audio de 30 s (arquitectura Whisper); longitud de contexto textual: no disponible |
| Tipos de cuantizacion | float16 (incluida en el repo), int8_float16 e int8 (soportadas por el runtime faster-whisper) |
| Idiomas soportados | Catalán (ca) |
| Licencia | Apache-2.0 |
| Formato de pesos | CTranslate2 (`model.bin`), repo de 3,1 GB |
| Libreria / runtime | ctranslate2 (faster-whisper) |
| Pipeline | automatic-speech-recognition |
| Datos de ajuste fino | projecte-aina/3catparla_asr, projecte-aina/parlament_parla_v3, projecte-aina/corts_valencianes_asr_a, projecte-aina/commonvoice_benchmark_catalan_accents |
| Fecha de creacion | 2025-05-12 |
| Descargas / likes en HuggingFace | 84 / 2 |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Whisper large-v3: un transformer encoder-decoder con normalización y atención multi-cabeza estándar, que consume espectrogramas mel de 128 bandas correspondientes a ventanas de 30 segundos y genera tokens de texto de forma autorregresiva. faster-whisper no modifica los pesos, solo los reempaqueta en el formato de CTranslate2 y aplica la cuantización elegida durante la conversión (`ct2-transformers-converter --quantization float16`). El modelo distribuido en este repositorio es, por tanto, una conversión, no un reentrenamiento.

El ajuste fino sí se hizo sobre el modelo original: `whisper-bsc-large-v3-cat` se especializó en catalán usando los corpus del Projecte Aina citados en la model card (contenido audiovisual de 3Cat, sesiones del Parlament de Catalunya, las Corts Valencianes y el benchmark de acentos de Common Voice catalán). La información proporcionada no detalla el número de horas de audio, la composición exacta del dataset, ni si se aplicaron técnicas de RLHF o DPO; en un modelo ASR supervisado como este, el entrenamiento es típicamente transcripción-audio con entropía cruzada. La innovación técnica del repositorio es, en la práctica, el propio pipeline de conversión: misma calidad acústica del modelo ajustado, pero con inferencia más ligera y opciones de cuantización INT8 para CPU.

## Capacidades

- Transcripción de audio en catalán a texto plano, con detección automática por segmentos y marcas temporales de inicio y fin de cada segmento.
- Detección de idioma con probabilidad asociada (`info.language_probability`), útil para enrutar audios aunque el modelo esté especializado en catalán.
- Decodificación con beam search configurable (`beam_size`), lo que permite ajustar el compromiso entre precisión y velocidad.
- Ejecución en GPU con float16 o int8_float16 y en CPU con int8, mediante el mismo runtime.
- Soporte de filtro VAD y segmentación interna para audios de duración arbitraria (el runtime trocea la entrada en ventanas de 30 s).
- No soporta tool calling, function calling, razonamiento multi-paso, visión, audio generativo ni modo "thinking": es un modelo ASR puro.
- La tarea de traducción (`task="translate"`) existe en la interfaz de faster-whisper por herencia de Whisper, pero no hay evidencia publicada de su calidad tras el ajuste fino monolingüe en catalán.

## Casos de uso

- Subtitulado de contenido audiovisual en catalán: el modelo genera segmentos con timestamps que se pueden volcar directamente a SRT/VTT; encaja con la procedencia del corpus de 3Cat y con la necesidad de subtitulado semiautomático en medios.
- Transcripción de sesiones parlamentarias y plenos municipales: el ajuste fino incluye el registro del Parlament y de las Corts Valencianes, por lo que el vocabulario institucional y el habla formal están bien representados; útil para actas y buscadores de intervenciones.
- Atención ciudadana y administración pública: transcripción de llamadas o buzones de voz en catalán para su indexación y análisis posterior, con la ventaja de una licencia Apache-2.0 que permite uso comercial sin restricciones adicionales.
- Generación de actas y notas de reunión: transcripción de reuniones internas y posterior post-procesado (puntuación, resumen) con un LLM, ya que el modelo entrega texto sin puntuar.
- Investigación en lingüística y fonética de catalán: obtención de alineaciones temporales a nivel de segmento para estudios de corpus orales, con la ventaja de poder ejecutarse en CPU en modo int8.
- Pipelines de accesibilidad: transcripción en tiempo casi real de clases, seminarios o eventos en catalán, desplegando faster-whisper detrás de una API propia; el tamaño de 3,1 GB y la cuantización INT8 permiten ejecutarlo en hardware modesto.
- Preprocesado para datasets de voz: generación masiva de transcripciones de audio catalán para alimentar otros sistemas (traducción, resumen, búsqueda semántica).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye valores de WER, CER ni comparaciones cuantitativas con otros modelos; tampoco se aportan métricas de latencia o throughput. Cualquier cifra de calidad para catalán debe medirse sobre un conjunto de evaluación propio.

## Requisitos de hardware

- VRAM estimada en float16: en torno a 3-4 GB para los pesos (repo de 3,1 GB) más overhead del runtime; el encoder-decoder no requiere espacio de KV cache tan grande como un LLM equivalente.
- VRAM estimada en int8_float16: aproximadamente 1,6-2,5 GB, lo que permite ejecución en GPUs de gama de entrada.
- GPUs recomendadas: RTX 4090, A100 o H100 para lotes grandes y máximo throughput; RTX 3060/4060 (6-8 GB) o superiores para servicio individual.
- Cabe en GPU de consumo: sí, con cualquier GPU de 6 GB o más usando int8_float16 o float16; también es viable en CPU con `compute_type="int8"`, a costa de mayor latencia.
- Opciones de despliegue: faster-whisper (librería Python), WhisperX para diarización y alineación, whisper-ctranslate2 como CLI, o una API propia sobre CTranslate2. No es compatible de forma nativa con vLLM, TGI ni Ollama, que esperan otros formatos de pesos (safetensors/PyTorch o GGUF).
- Latencia y throughput: no disponibles en la información proporcionada. Como referencia cualitativa, faster-whisper está diseñado para reducir memoria y tiempo de inferencia frente a la implementación original de OpenAI, pero no se aportan factores de tiempo real (RTF) concretos.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Contexto de audio | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| BSC-LT/faster-whisper-bsc-large-v3-cat | ~1.550 M | Catalán | Ventanas de 30 s | Apache-2.0 | CTranslate2 (float16) | Ajustado a catalán; runtime faster-whisper; sin benchmarks publicados |
| BSC-LT/whisper-bsc-large-v3-cat | ~1.550 M | Catalán | Ventanas de 30 s | Apache-2.0 | Transformers (PyTorch) | Mismo modelo acústico sin convertir; requiere PyTorch y más memoria |
| openai/whisper-large-v3 | ~1.550 M | ~99 idiomas | Ventanas de 30 s | MIT (código) / Apache-2.0 (pesos en HF) | PyTorch, safetensors | Multilingüe generalista; sin ajuste específico a catalán |
| Systran/faster-whisper-large-v3 | ~1.550 M | Multilingüe | Ventanas de 30 s | Apache-2.0 | CTranslate2 | Misma conversión pero del modelo multilingüe, sin especialización en catalán |

La comparación de calidad (WER en catalán) entre estas variantes no está disponible en la información consultada.

## Limitaciones y advertencias

- Salida sin puntuación ni mayúsculas: la model card indica explícitamente que el objetivo es transcribir a texto plano sin puntuar; para subtítulos legibles o actas hace falta un post-proceso.
- Modelo monolingüe: aunque hereda la detección de idioma de Whisper, está ajustado solo en catalán; su uso con otras lenguas no está respaldado y probablemente degrade.
- Riesgo de alucinación: como todo Whisper, puede generar texto inventado en tramos de silencio, ruido o música; conviene aplicar filtro VAD y revisar segmentos de baja confianza.
- Sesgo de dominio: el ajuste fino se apoya en corpus de medios públicos, parlamentos y Common Voice, lo que puede favorecer registros formales y acentos representados en esas fuentes frente a habla espontánea, jerga o variantes dialectales menos cubiertas.
- Sin diarización ni etiquetado de hablante: el modelo transcribe, no identifica quién habla; se necesitan herramientas adicionales (por ejemplo, WhisperX con un modelo de diarización).
- Nombres propios, siglas y entidades locales pueden aparecer mal transcritos; no hay listas de vocabulario personalizadas en este repositorio.
- Licencia Apache-2.0: permite uso comercial y modificación, pero exige conservar el aviso de copyright y la atribución al BSC; conviene revisar también las condiciones de los corpus de origen si se redistribuyen derivados.
- Se desconoce el número exacto de horas de entrenamiento y si los datasets tienen restricciones adicionales, lo que dificulta auditar posibles contaminaciones o sesgos.
- El repositorio se actualizó por última vez con fecha 2026-10-26, pero no se documenta un registro de cambios ni versionado semántico.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/BSC-LT/faster-whisper-bsc-large-v3-cat
- Modelo original en Transformers: https://huggingface.co/BSC-LT/whisper-bsc-large-v3-cat
- Repositorio faster-whisper: https://github.com/guillaumekln/faster-whisper/tree/master
- Notebook de ejemplo: https://colab.research.google.com/drive/1v_3m1aR9CwYXgPVBlhwDI9Hz4V5Dlh95?usp=sharing
- Modelo base Whisper large-v3: https://huggingface.co/openai/whisper-large-v3
- Organización BSC-LT en HuggingFace: https://huggingface.co/BSC-LT
- Centro Nacional de Supercomputación: https://www.bsc.es/
- Projecte Aina: https://projecteaina.cat/en/
- Licencia Apache-2.0: https://www.apache.org/licenses/LICENSE-2.0
- Contacto del laboratorio: langtech@bsc.es
