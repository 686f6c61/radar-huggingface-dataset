# Kyudan/eDIAR

## Resumen

eDIAR es un sistema de diarización de hablantes en streaming desarrollado por Kyudan (Jung, Kim, Lee y Shin) que elimina el límite de hablantes de los diarizadores de slots fijos sin necesidad de reentrenamiento. Se apoya en dos modelos existentes: la cabeza de diarización Nemotron-3 de NVIDIA (8 slots) y el extractor de embeddings de hablante WeSpeaker ResNet34-LM, sobre los que aplica clustering con el algoritmo e-means de Meta (integrado en FAISS) dentro de cada slot, activándolo únicamente cuando todos los slots están ocupados. El repositorio contiene solo código: no almacena pesos y descarga los modelos base en el primer uso.

La innovación principal es el re-clustering sobre una ventana acotada de 90 segundos que se recalcula en cada chunk, con una ventana de revisión de etiquetas de 10 segundos y anclaje de identificadores permanentes de hablante a los slots de la cabeza. Esto mantiene el error plano en reuniones de una hora y permite enlazar hablantes entre grabaciones de un archivo con más de mil personas. El coste por actualización no crece con la duración de la reunión (factor de tiempo real aproximado de 0,09 en CPU compartida).

El sistema está orientado a reuniones largas y archivos de audio de gran escala, con modos de baja latencia (buffer de entrada de 1,04 s) y latencia muy baja (0,64 s). La evaluación publicada cubre VoxConverse, AMI, ICSI, conversaciones sintéticas de LibriSpeech y un archivo VoxCeleb1, únicamente en inglés y sin evaluación en campo lejano.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Sistema de diarización en streaming: cabeza de slots fijos (Nemotron-3 Diarization) + embeddings de hablante (WeSpeaker ResNet34-LM) + clustering e-means sobre ventana acotada de 90 s |
| Parametros totales | no disponible (el repositorio no almacena pesos; depende de los modelos base) |
| Parametros activos | no disponible |
| Longitud de contexto | no aplica; ventana de re-clustering de 90 s y ventana de revisión de etiquetas de 10 s |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | inglés |
| Licencia | Apache-2.0 (código); e-means vendorizado bajo MIT; Nemotron-3 Diarization bajo openmdw-1.1; WeSpeaker ResNet34-LM según su propia model card |
| Formato de pesos | no aplica (solo código; los pesos se descargan de los repositorios de los modelos base) |

## Arquitectura y entrenamiento

eDIAR no entrena ningún modelo propio: es un pipeline de inferencia que combina una cabeza de diarización de 8 slots (Nemotron-3 Diarization) con un extractor de embeddings de hablante (WeSpeaker ResNet34-LM, ResNet de 34 capas entrenado sobre VoxCeleb). Cuando los 8 slots de la cabeza están ocupados, el sistema agrupa los embeddings de hablante dentro de un slot mediante e-means, el algoritmo de clustering oficial de Meta incluido en el árbol contrib de FAISS. El sistema recalcula el clustering sobre una ventana deslizante acotada de 90 segundos en cada chunk, permite revisar etiquetas durante 10 segundos y ancla los identificadores permanentes de hablante a los slots de la cabeza, de modo que el coste por actualización no crece con la duración de la reunión.

El artículo asociado demuestra que la misma técnica convierte en open-speaker también la cabeza de 4 slots de Streaming Sortformer, sin reentrenar. Para el enlazado de hablantes entre grabaciones, el sistema aplica linking a nivel de frame con e-means, que según los autores alcanza la pérdida de k-means de Lloyd varias veces más rápido. No se dispone de información sobre datos de entrenamiento propios, ya que el sistema es training-free; los umbrales de decisión se fijaron sobre la mitad de cada corpus de evaluación.

## Capacidades

- Diarización de hablantes en streaming con número ilimitado de hablantes, sin límite de 8 slots impuesto por la cabeza base.
- Modos de latencia: `low_latency` con buffer de entrada de 1,04 s y `very_low_latency` con 0,64 s.
- Revisión de etiquetas en una ventana de 10 s para corregir asignaciones recientes.
- Interfaz incremental de sesión en vivo (`new_session()` con `feed(pcm_int16_bytes)`) además de la interfaz por fichero completo.
- Enlazado de hablantes entre grabaciones (cross-recording linking) a nivel de frame mediante e-means.
- Salida en formato RTTM mediante el script de ejemplo (`examples/diarize.py`).
- Coste computacional constante por actualización, independiente de la duración de la reunión.
- No incluye generación de texto, razonamiento, código, matemáticas, visión, tool calling ni capacidades de agente: es exclusivamente un sistema de diarización.

## Casos de uso

- Actas y transcripción de reuniones largas: el sistema mantiene el error plano durante reuniones de una hora gracias al re-clustering sobre ventana acotada y al anclaje de identificadores a slots, lo que permite atribuir cada intervención a un hablante en la transcripción posterior.
- Archivos de audio con muchos hablantes: el enlazado a nivel de frame con e-means permite localizar a la misma persona en un archivo de más de mil hablantes, útil para búsqueda y organización de fondos documentales sonoros.
- Análisis de reuniones de investigación (AMI, ICSI): el sistema está evaluado sobre estos corpus y puede integrarse en pipelines de análisis de dinámica de grupo, turnos de palabra y participación por hablante.
- Subtitulado y locución en directo: con el modo `very_low_latency` (0,64 s) puede alimentar sistemas de subtitulado que necesitan etiquetar quién habla con retardo mínimo.
- Transcripción médica o legal con múltiples intervinientes: al no tener tope de hablantes, admite sesiones con más de ocho participantes sin degradar la asignación, aunque la evaluación publicada no cubre dominios especializados.
- Indexación y diarización masiva por lotes: el factor de tiempo real de aproximadamente 0,09 en CPU compartida permite procesar grandes volúmenes de audio con coste predecible y sin GPU dedicada.
- Integración en plataformas de reuniones: la interfaz incremental (`feed`) permite conectar el sistema a un flujo de audio PCM en vivo y emitir segmentos etiquetados conforme llegan.

## Benchmarks y rendimiento

Resultados publicados en la model card para streaming con buffer de entrada de 1,04 s, DER en porcentaje, collar de 0,25 s y solapamiento puntuado (sesiones recortadas de 7-8 minutos; 44 / 16 / 15 / 18 sesiones):

| Sistema | VoxConverse | AMI | ICSI | LibriSpeech-OpenSpk |
|---|---|---|---|---|
| Streaming Sortformer 4spk v2.1 | 14,1 | 8,3 | 27,7 | 41,4 |
| Nemotron-3 head (8 slots) | 6,4 | 9,3 | 27,4 | 19,8 |
| Online leader-follower | 5,9 | 10,7 | 31,6 | 11,6 |
| eDIAR (tras revisión) | 5,8 | 9,1 | 27,4 | 16,4 |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; depende de los modelos base descargados (Nemotron-3 Diarization y WeSpeaker ResNet34-LM).
- GPU recomendadas: no disponible; el ejemplo de uso emplea `device="cuda"`, pero no se especifican modelos de GPU concretos.
- Cabe en GPU de consumo: no disponible.
- Opciones de despliegue: el paquete Python propio (`emeans_diar` con `SlotEMeansDiarizer`), script de ejemplo `examples/diarize.py` y la interfaz de sesión incremental usada por la demo en vivo. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: factor de tiempo real aproximado de 0,09 en CPU compartida; latencia de entrada de 1,04 s en modo `low_latency` y 0,64 s en `very_low_latency`. Se recomienda reservar un núcleo de CPU libre por cada sesión en vivo.

## Comparativa con modelos similares

| Sistema | Enfoque | Límite de hablantes | DER VoxConverse | DER AMI | DER ICSI | DER LibriSpeech-OpenSpk | Licencia |
|---|---|---|---|---|---|---|---|
| eDIAR | Slots + e-means en streaming | Sin límite | 5,8 | 9,1 | 27,4 | 16,4 | Apache-2.0 (código) |
| Nemotron-3 head | Cabeza de slots fijos | 8 slots | 6,4 | 9,3 | 27,4 | 19,8 | openmdw-1.1 |
| Streaming Sortformer 4spk v2.1 | Cabeza de slots fijos | 4 slots | 14,1 | 8,3 | 27,7 | 41,4 | no disponible |
| Online leader-follower | Seguimiento en línea | Sin límite declarado | 5,9 | 10,7 | 31,6 | 11,6 | no disponible |

## Limitaciones y advertencias

- Evaluación únicamente en inglés; no hay resultados en otros idiomas.
- Sin evaluación en campo lejano (far-field); el rendimiento con micrófonos lejanos o salas reverberantes no está caracterizado.
- Los umbrales se fijaron sobre la mitad de cada corpus de evaluación, lo que puede introducir sesgo de ajuste respecto a esos dominios.
- Los identificadores de hablante son anónimos y locales a la sesión: no deben usarse para identificación de personas.
- El repositorio no contiene pesos; requiere descargar los modelos base, sujetos a sus propias licencias (Nemotron-3 Diarization bajo openmdw-1.1 y WeSpeaker ResNet34-LM según su model card), lo que puede condicionar el uso comercial.
- Requiere reservar un núcleo de CPU por sesión en vivo para mantener el rendimiento.
- Riesgo de alucinación no aplica en el sentido generativo, pero sí existe riesgo de asignación errónea de hablante en segmentos solapados o de baja calidad de audio.
- No se han publicado datos sobre sesgos demográficos, de acento o de género en la información disponible.

## Enlaces

- Hugging Face: https://huggingface.co/Kyudan/eDIAR
- Código: https://github.com/KyuDan1/eDIAR
- Demo: https://kyudan1.github.io/eDIAR/
- Algoritmo e-means (FAISS, Meta): https://github.com/facebookresearch/faiss/tree/main/contrib/e_means
- Modelo base Nemotron-3 Diarization: https://huggingface.co/nvidia/Nemotron-3-Diarization
- Modelo base WeSpeaker ResNet34-LM: https://huggingface.co/Wespeaker/wespeaker-voxceleb-resnet34-LM
