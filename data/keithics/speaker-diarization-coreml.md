# keithics/speaker-diarization-coreml

## Resumen

Speaker Diarization Core ML es un conjunto de artefactos Core ML derivados de `pyannote/speaker-diarization-community-1` y mantenidos por el desarrollador keithics (con origen en el proyecto FluidInference). Su objetivo es ejecutar diarización de hablantes completamente en dispositivo ("on-device") en plataformas Apple, es decir, iOS 17 y macOS 14 o posteriores, sin depender de servicios en la nube. No se trata de un modelo nuevo entrenado desde cero, sino de una conversión de pesos PyTorch a Core ML lista para despliegue en aplicaciones nativas de Apple.

El repositorio incluye los componentes clásicos de un pipeline de diarización: segmentación de hablante, extracción de características FBank, embeddings de hablante, y los modelos PLDA y PldaRho para el agrupamiento (clustering). También conserva artefactos heredados de versiones anteriores (segmentación de pyannote 3.0 y embeddings WeSpeaker) usados por el diarizador online de FluidAudio.

Es relevante para desarrolladores que necesitan diarización local con baja latencia y privacidad de datos en el ecosistema Apple, aunque la documentación de rendimiento es escasa y la procedencia del build original no está completamente atestiguada, según reconoce el propio autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline de diarización (segmentación neuronal + embeddings de hablante + clustering PLDA/VBx), convertido a Core ML |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (audio de entrada a 16 kHz mono; ventana no especificada) |
| Tipos de cuantizacion | no disponible para el conjunto Community-1; existe un artefacto heredado `wespeaker_int8.mlmodelc` para el diarizador legacy |
| Idiomas soportados | no disponibles (la diarización es independiente del idioma en gran medida) |
| Licencia | scoped-cc-by-4.0 (CC-BY-4.0 con alcance definido; ver NOTICE.md) |
| Formato de pesos | `.mlmodelc` (Core ML compilado) y `.mlpackage` (sin compilar, parcial) |

## Arquitectura y entrenamiento

El modelo subyacente es `pyannote/speaker-diarization-community-1`, un pipeline de diarización compuesto por una red de segmentación entrenada con pérdida Powerset multi-clase (Plaquet y Bredin, INTERSPEECH 2023), un extractor de embeddings de hablante basado en WeSpeaker (Wang et al., ICASSP 2023) y un módulo de clustering bayesiano HMM de x-vectors (VBx, Landini et al., 2022). Sobre esta base, el repositorio aplica una conversión a Core ML mediante coremltools 9.0b1 y PyTorch 2.8.0, con dialecto de origen TorchScript y compilación con coremlc 3500.32.1 (MIL 3500.14.1).

No se trata de un modelo fine-tuneado: el autor indica explícitamente que son conversiones Core ML. La procedencia está fijada por SHA-256 en `provenance.json`, pero el commit exacto del checkout local y el commit de Mobius usados en la conversión original de 2025 no se registraron, por lo que los binarios no se describen como un build totalmente reproducible y atestiguado. Se conservan además artefactos legacy (segmentación pyannote 3.0, MIT; WeSpeaker VoxCeleb ResNet34, CC-BY-4.0) para el diarizador online de FluidAudio.

## Capacidades

- Diarización de hablantes: identifica quién habla y cuándo, generando segmentos con marcas de tiempo e identificadores de hablante.
- Detección de cambio de hablante (speaker change detection).
- Segmentación de hablante (speaker segmentation).
- Detección de actividad de voz (voice activity detection), que es el pipeline declarado.
- Extracción de embeddings de hablante (modelo `Embedding.mlmodelc`).
- Clustering de hablantes mediante PLDA y PldaRho.
- Ejecución on-device en Apple (iOS 17 / macOS 14 o superior) a través de FluidAudio.
- No soporta tool calling, agentes ni generación de texto: es un modelo de audio, no un LLM.

## Casos de uso

- Transcripción con etiquetado de hablante en apps iOS: integrar el pipeline en una aplicación de notas de reuniones para separar las voces de los participantes y asociar cada fragmento transcrito a su hablante, aprovechando la ejecución local.
- Reuniones y videoconferencias en macOS: procesar el audio de una llamada en el propio Mac para generar actas con atribución de intervenciones, sin enviar audio a servidores externos.
- Privacidad y cumplimiento normativo: al ejecutarse on-device, el audio sensible no sale del dispositivo, lo que resulta adecuado para entornos sanitarios, legales o corporativos con requisitos de confidencialidad.
- Análisis de entrevistas y research cualitativa: segmentar entrevistas grabadas para separar entrevistador y entrevistado y facilitar el etiquetado posterior.
- Accesibilidad: subtitulado en tiempo real que indica el hablante activo en apps de accesibilidad para personas con discapacidad auditiva.
- Indexación y búsqueda de archivos de audio: preprocesar grabaciones largas para crear índices por hablante y permitir búsquedas del tipo "¿qué dijo el hablante 2 sobre X?".
- Diarización online en streaming: los artefactos legacy (segmentación pyannote 3.0 y WeSpeaker) permiten el diarizador online de FluidAudio para flujos de audio continuos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible; el modelo está pensado para ejecución en Apple Silicon y en dispositivos iOS, no para GPU NVIDIA.
- GPU recomendadas: no aplica en el sentido habitual; el destino es Apple Neural Engine (ANE) y GPU integrada de Apple Silicon (M1 en adelante) y chips A-series compatibles con iOS 17.
- Cabe en consumer GPU: no es el objetivo; está diseñado para hardware Apple consumer (iPhone, iPad, Mac).
- Opciones de despliegue: Core ML nativo; integración a través de FluidAudio (https://github.com/FluidInference/FluidAudio). No aplica vLLM, llama.cpp ni TGI, al no ser un LLM.
- Latencia y throughput: no disponibles en la información proporcionada.
- Tamaño del repo: 0.1 GB, lo que sugiere un conjunto de artefactos ligero y apto para empaquetar en apps móviles.

## Comparativa con modelos similares

| Modelo | Tipo | Contexto / entrada | Licencia | Despliegue |
|---|---|---|---|---|
| keithics/speaker-diarization-coreml | Conversión Core ML de pyannote Community-1 | Audio 16 kHz mono | scoped-cc-by-4.0 | On-device Apple (Core ML) |
| pyannote/speaker-diarization-community-1 | Pipeline original PyTorch | Audio 16 kHz mono | CC-BY-4.0 (según upstream) | Servidor / GPU con PyTorch |
| pyannote/segmentation-3.0 + WeSpeaker (legacy) | Segmentación + embeddings | Audio 16 kHz mono | MIT + CC-BY-4.0 | PyTorch / Core ML legacy |
| Alternativas comerciales de diarización en la nube | Servicios gestionados | Audio variable | Propietaria | API en la nube |

La comparativa de rendimiento numérico (DER, latencia) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo entrenado ni fine-tuneado: es una conversión; cualquier mejora de precisión debe venir del modelo upstream.
- La procedencia del build original de 2025 no está completamente atestiguada (commit local y de Mobius no registrados), lo que dificulta la reproducibilidad exacta.
- La licencia es "scoped-cc-by-4.0": el alcance está definido en NOTICE.md y no cubre los artefactos legacy, que tienen sus propias licencias (MIT y CC-BY-4.0). Es imprescindible revisar NOTICE.md antes de uso comercial.
- Los artefactos legacy (`pyannote_segmentation.mlmodelc`, `wespeaker*.mlmodelc`) quedan fuera del alcance de la licencia Community-1.
- No se publican métricas de rendimiento (DER, latencia, throughput) en la información disponible.
- Dependencia de plataformas Apple: requiere iOS 17 / macOS 14 o superior; no es portable a Linux, Android o Windows sin reconversión.
- Riesgo de confusión en solapamiento de voces, ruido de fondo o audio de baja calidad, inherente a los pipelines de diarización.
- Idiomas soportados no declarados; la diarización depende más de la acústica que del idioma, pero no hay garantías documentadas.
- No se han publicado resultados de benchmarks que permitan validar el comportamiento frente al pipeline original.

## Enlaces

- HuggingFace: https://huggingface.co/keithics/speaker-diarization-coreml
- Modelo base: https://huggingface.co/pyannote/speaker-diarization-community-1
- Referencia upstream fijada: https://huggingface.co/pyannote/speaker-diarization-community-1/tree/3533c8cf8e369892e6b79ff1bf80f7b0286a54ee
- FluidAudio: https://github.com/FluidInference/FluidAudio
- Documentación de diarización de FluidAudio: https://github.com/FluidInference/FluidAudio/tree/main/Documentation/Diarization
- Conversión histórica (Mobius): https://github.com/FluidInference/mobius/tree/33fd6eab634966ae7db4d73da3376a90379642fb/models/speaker-diarization/pyannote-community-1/coreml
- Pipeline de conversión actual (Mobius): https://github.com/FluidInference/mobius/tree/ffbc3c8cae2d0ac83912a005a25a2874ced98a3a/models/speaker-diarization/pyannote-community-1/coreml
- NOTICE (licencia y atribución): https://huggingface.co/FluidInference/speaker-diarization-coreml/blob/main/NOTICE.md
- pyannote/segmentation-3.0: https://huggingface.co/pyannote/segmentation-3.0
- pyannote/wespeaker-voxceleb-resnet34-LM: https://huggingface.co/pyannote/wespeaker-voxceleb-resnet34-LM
