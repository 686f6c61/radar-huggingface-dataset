# Muno459/fastconformer-quran-coreml-offline

## Resumen

`Muno459/fastconformer-quran-coreml-offline` es una conversión a Core ML del modelo `Muno459/fastconformer-quran`, un sistema de reconocimiento automático de voz (ASR) especializado en recitación del Corán en árabe. Lo desarrolla el usuario independiente Muno459 y su propósito es permitir la inferencia completamente offline en dispositivos Apple (iPhone, iPad y Mac), aprovechando el Neural Engine (ANE) y la GPU mediante el framework Core ML de Apple. El repositorio ocupa 2,8 GB y está pensado para su integración en aplicaciones iOS nativas, no para servidores.

El modelo resuelve un nicho muy concreto: la transcripción y verificación de recitación coránica en árabe, una tarea con particularidades fonéticas (tajwid, reglas de pronunciación, pausas) que los modelos ASR generalistas no cubren bien. Al estar empaquetado en Core ML, el desarrollador puede distribuirlo dentro de una app sin depender de conectividad ni de servicios en la nube, lo que resulta relevante para privacidad y para uso en entornos sin red.

La información pública disponible es escasa: no se detallan parámetros, contexto, ni resultados de benchmarks en la ficha de Hugging Face. El acceso está restringido (gated), por lo que es necesario aceptar condiciones en la plataforma antes de descargar los pesos. La licencia indicada es `npl-1.0`, que conviene revisar con detenimiento antes de cualquier uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastConformer (encoder Conformer con subsampling tipo FastConformer), convertido a Core ML |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (formato Core ML; el modelo base aparece como quantized) |
| Idiomas soportados | arabe (ar) |
| Licencia | npl-1.0 (acceso restringido, gated) |
| Formato de pesos | Core ML (.mlpackage / .mlmodelc), empaquetado para despliegue en Apple |
| Tamano del repositorio | 2,8 GB |
| Modelo base | Muno459/fastconformer-quran |
| Pipeline | automatic-speech-recognition |
| Hardware objetivo | Apple Neural Engine (ANE), GPU y CPU via Core ML |

## Arquitectura y entrenamiento

El modelo se basa en FastConformer, una variante del encoder Conformer de NVIDIA que reduce el coste computacional mediante subsampling agresivo de las secuencias de entrada, manteniendo la combinación de auto-atención y convoluciones depthwise que caracteriza a Conformer. La conversión a Core ML implica reescribir las operaciones para que sean compatibles con el grafo de Core ML y, presumiblemente, aplicar cuantización para reducir el tamaño y acelerar la inferencia en ANE. No se dispone de información pública sobre el número exacto de capas, dimensión oculta ni parámetros del modelo base.

En cuanto a datos de entrenamiento, los tags del repositorio indican el uso de los datasets `tarteel-ai/everyayah`, `tarteel-ai/tlog` y `obadx/muaalem-annotated-v3`, todos ellos orientados a recitación coránica y anotación de pronunciación. No se especifica el número de horas de audio, la composición exacta del corpus ni si hubo etapas de fine-tuning con RLHF o DPO (poco habituales en ASR). Tampoco se documentan innovaciones técnicas adicionales más allá de la propia conversión a Core ML para ejecución on-device.

## Capacidades

- Reconocimiento automático de voz en árabe, especializado en recitación del Corán.
- Transcripción de audio a texto con vocabulario y fonética adaptados al texto coránico.
- Ejecución completamente offline en dispositivos Apple, sin llamadas a servicios externos.
- Aprovechamiento del Neural Engine (ANE) y la GPU mediante Core ML para inferencia acelerada.
- Integración nativa en apps iOS/iPadOS/macOS a través de la API de Core ML.
- No se documenta soporte de tool calling, function calling, agentes ni razonamiento multi-step.
- No se documenta soporte multimodal (visión, audio más allá del ASR, etc.).
- Capacidad multilingüe limitada al árabe (tag `ar`).

## Casos de uso

- Aplicaciones de recitación coránica con corrección en tiempo real: el modelo puede transcribir la recitación del usuario y compararla con el texto esperado, señalando errores de pronunciación o de secuencia, todo ello sin conexión y con baja latencia al ejecutarse en ANE.
- Herramientas de memorización (hifz) para estudiantes: integración en apps que registran la recitación, generan transcripciones y permiten al usuario revisar su progreso sin enviar audio a la nube, lo que protege la privacidad.
- Verificación de audio pregrabado en dispositivos: procesamiento batch de grabaciones almacenadas en el dispositivo para generar transcripciones o índices de búsqueda.
- Apps de accesibilidad para personas con discapacidad auditiva en contextos religiosos: subtitulado automático de recitaciones en directo dentro de la app, sin depender de red.
- Distribución en entornos con conectividad limitada: mezquitas, escuelas o regiones con internet intermitente donde un ASR en la nube no es viable.
- Investigación lingüística y fonética del árabe coránico: recogida y transcripción de corpus de recitación en campo con dispositivos Apple, manteniendo los datos localmente.
- Integración en pipelines de análisis de audio religioso para archivos históricos: transcripción de grabaciones almacenadas en el dispositivo para su catalogación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/RAM unificada: no disponible de forma explícita; el repositorio ocupa 2,8 GB, por lo que se requiere al menos ese espacio de almacenamiento y una cantidad de memoria comparable para cargar el modelo en inferencia.
- GPU recomendadas: no aplica en el sentido tradicional; el modelo está pensado para Apple Neural Engine (ANE) y GPU Apple integrada.
- Compatibilidad con hardware consumer: diseñado específicamente para chips Apple (serie A y serie M). No está pensado para GPUs NVIDIA ni AMD.
- Opciones de despliegue: Core ML (framework nativo de Apple), integración en apps iOS/iPadOS/macOS mediante Xcode. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, dado que no es un modelo de lenguaje generativo sino un ASR en formato Core ML.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | Idioma | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Muno459/fastconformer-quran-coreml-offline | ASR FastConformer (Core ML) | Árabe (Corán) | no disponible | npl-1.0 (gated) | Hugging Face, acceso restringido |
| Muno459/fastconformer-quran | ASR FastConformer (formato original) | Árabe (Corán) | no disponible | no disponible | Hugging Face |
| Whisper (OpenAI) | ASR transformer | Multilingüe | 30 s por ventana | MIT | Abierto, amplia adopción |
| NVIDIA FastConformer (NeMo) | ASR Conformer | Multilingüe (según checkpoint) | variable | Apache 2.0 (checkpoints NeMo) | Abierto |

La comparación con Whisper y con FastConformer de NeMo es aproximada: no se dispone de métricas de WER ni de parámetros del modelo de Muno459 que permitan una comparación cuantitativa rigurosa. La principal diferencia cualitativa es la especialización en recitación coránica y el empaquetado para Core ML, frente a la naturaleza generalista y multilingüe de Whisper.

## Limitaciones y advertencias

- Acceso restringido (gated): es necesario aceptar las condiciones en Hugging Face antes de descargar los pesos, lo que puede limitar la reproducibilidad.
- Licencia `npl-1.0`: no es una licencia permisiva estándar; conviene revisar los términos exactos antes de cualquier uso comercial o redistribución.
- Especialización estrecha: el modelo está entrenado para árabe coránico y previsiblemente rendirá peor en árabe conversacional, dialectos o cualquier otro idioma.
- Riesgo de alucinación y errores de transcripción: como todo ASR, puede producir texto plausible pero incorrecto, especialmente con ruido de fondo, recitadores no nativos o audio de baja calidad.
- Sin benchmarks publicados: no es posible evaluar su calidad objetiva frente a alternativas sin realizar pruebas propias.
- Dependencia de hardware Apple: no es desplegable en GPUs NVIDIA ni en servidores Linux estándar, lo que limita su uso fuera del ecosistema Apple.
- Documentación escasa: no se detallan parámetros, contexto, composición del dataset ni proceso de entrenamiento, lo que dificulta la auditoría técnica.
- Sesgos potenciales: al entrenarse con datasets específicos de recitación, puede presentar sesgos hacia determinadas escuelas de recitación o estilos presentes en el corpus.
- Posible deriva entre el modelo base y la conversión Core ML: la cuantización aplicada durante la conversión puede degradar ligeramente la precisión respecto al modelo original.

## Enlaces

- Hugging Face: https://huggingface.co/Muno459/fastconformer-quran-coreml-offline
- Modelo base: https://huggingface.co/Muno459/fastconformer-quran
- Dataset Tarteel everyayah: https://huggingface.co/datasets/tarteel-ai/everyayah
- Dataset Tarteel tlog: https://huggingface.co/datasets/tarteel-ai/tlog
- Dataset Muaalem annotated v3: https://huggingface.co/datasets/obadx/muaalem-annotated-v3
