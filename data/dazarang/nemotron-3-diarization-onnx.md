# Dazarang/nemotron-3-diarization-onnx

## Resumen

Nemotron 3 Diarization (ONNX) es una exportación no oficial del modelo Nemotron 3 Diarization de NVIDIA, también conocido como Streaming Sortformer v3. Se trata de un modelo especializado en diarización de hablantes en streaming, es decir, la tarea de segmentar un flujo de audio y asignar cada fragmento de voz a un hablante concreto, con capacidad para distinguir hasta ocho hablantes simultáneos. El repositorio lo publica el usuario Dazarang y contiene únicamente el fichero ONNX generado por el proyecto altunenes/parakeet-rs, sin modificaciones respecto al original.

La relevancia de esta ficha radica en que empaqueta el modelo de NVIDIA en formato ONNX (fp32, aproximadamente 400 MB), lo que facilita su despliegue en runtimes de inferencia portables como ONNX Runtime, sin depender de los frameworks nativos de NVIDIA. El modelo base emplea la arquitectura Streaming Sortformer, orientada a procesar audio de forma incremental con latencia controlada, lo que lo hace adecuado para transcripción de reuniones, subtitulado en directo y análisis de llamadas.

Conviene subrayar que este repositorio no es una publicación oficial de NVIDIA: los pesos, el entrenamiento y la licencia pertenecen a NVIDIA, y la model card remite explícitamente a la ficha original para obtener la descripción del modelo, los datos de entrenamiento, la evaluación y las notas de sesgo, seguridad y privacidad. Toda la información técnica detallada más allá de lo aquí indicado debe consultarse en el repositorio de origen.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Streaming Sortformer v3 (diarización de hablantes en streaming) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el fichero publicado es fp32) |
| Idiomas soportados | no disponible (modelo de audio, no dependiente de idioma según la información disponible) |
| Licencia | OpenMDW-1.1 |
| Formato de pesos | ONNX (`nemotron3_diar_v3.onnx`, fp32, 400.506.656 bytes) |

## Arquitectura y entrenamiento

El modelo base es Streaming Sortformer v3 de NVIDIA, una arquitectura diseñada específicamente para diarización de hablantes en flujo continuo, con soporte de hasta ocho hablantes. La model card de este repositorio no aporta detalles sobre el número de parámetros, la composición del dataset de entrenamiento, el número de tokens de audio procesados ni si se aplicaron técnicas de ajuste fino o RLHF; toda esa información se delega a la ficha oficial de NVIDIA.

La innovación principal del empaquetado es la exportación a ONNX en precisión fp32, realizada por el proyecto altunenes/parakeet-rs (carpeta `nemotron-3-diarization`, revisión `4d2a8bc71f5c896ec40faa59732e6716295edaf2`). El fichero se distribuye sin cambios y con un hash sha256 verificable (`915e4fa23b0192ed9fadeb1cdd26847df986d50c92012d177be28d0343bbe03a`), lo que permite comprobar la integridad de la descarga. No se documentan en esta ficha técnicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Diarización de hablantes en streaming: segmenta audio continuo y asigna etiquetas de hablante, con soporte de hasta ocho hablantes.
- Procesamiento incremental: la arquitectura Streaming Sortformer está pensada para consumir audio por bloques, lo que habilita casos de uso en tiempo real.
- Detección de actividad de voz (voice activity detection), según la etiqueta de pipeline del repositorio.
- Ejecución portable mediante ONNX Runtime, sin dependencia de frameworks nativos de NVIDIA.
- Verificación de integridad del fichero mediante hash sha256 publicado.
- No se documentan en la información disponible capacidades de transcripción, traducción, tool calling, agentes, visión ni audio generativo.

## Casos de uso

- Transcripción de reuniones con etiquetado de participantes: el modelo permite separar las intervenciones de hasta ocho personas en una sala o videollamada, de modo que un sistema de ASR posterior pueda atribuir cada frase a su hablante.
- Subtitulado en directo: al operar en streaming, puede alimentar un pipeline de subtitulado que identifique quién habla en cada momento con latencia reducida.
- Análisis de llamadas de atención al cliente: permite segmentar conversaciones entre agente y cliente para métricas de tiempo de habla, turnos de palabra y detección de solapamientos.
- Moderación y analítica de reuniones: el recuento de turnos por hablante y la detección de interrupciones sirven para informes de dinámica de equipo.
- Investigación en procesamiento de audio: al estar en ONNX, se integra fácilmente en cuadernos y pipelines de experimentación con ONNX Runtime.
- Despliegue en entornos con requisitos de portabilidad: útil cuando el stack de producción estandariza en ONNX y no se quiere introducir dependencias específicas de NVIDIA.
- Preprocesado para sistemas de diarización y reconocimiento combinados: la salida de segmentos por hablante puede alimentar modelos de ASR multihablante.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Tamaño del fichero de pesos: aproximadamente 400 MB en fp32, lo que implica un consumo de memoria moderado en inferencia.
- VRAM estimada: no disponible de forma oficial; con 400 MB de pesos, el modelo cabe holgadamente en GPUs de consumo, aunque el consumo real depende del runtime y del tamaño de los bloques de audio.
- GPU recomendadas: no disponible en la información proporcionada; por tamaño, cualquier GPU con al menos unos pocos GB de VRAM libre debería poder ejecutarlo.
- CPU: al ser un modelo ONNX de tamaño contenido, es plausible su ejecución en CPU mediante ONNX Runtime, aunque no se documentan cifras de latencia.
- Opciones de despliegue: ONNX Runtime es el runtime natural; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (herramientas orientadas a modelos de lenguaje, no a diarización).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Hablantes | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Nemotron 3 Diarization (ONNX, este repo) | Streaming Sortformer v3 | Hasta 8 | ONNX fp32 | OpenMDW-1.1 | Hugging Face (export no oficial) |
| nvidia/Nemotron-3-Diarization | Streaming Sortformer v3 | Hasta 8 | Peso nativo de NVIDIA | OpenMDW-1.1 | Hugging Face (oficial) |
| Otros modelos de diarización | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación más directa es con el modelo oficial de NVIDIA, del que este repositorio es una copia exportada a ONNX sin cambios en los pesos. No se dispone de datos de benchmarks que permitan comparar el rendimiento frente a otras alternativas de diarización.

## Limitaciones y advertencias

- Este repositorio no es una publicación oficial de NVIDIA; los pesos y la licencia pertenecen a NVIDIA y la responsabilidad sobre el modelo recae en la ficha original.
- La model card no documenta sesgos, tasas de alucinación ni limitaciones idiomáticas; deben consultarse en la ficha oficial de NVIDIA.
- El modelo está limitado a un máximo de ocho hablantes según la información disponible.
- El fichero distribuido es fp32; no se ofrecen variantes cuantizadas en este repositorio.
- La licencia OpenMDW-1.1 debe revisarse antes de cualquier uso comercial, ya que sus condiciones no se detallan en la información proporcionada.
- Al ser una exportación de terceros, no hay garantía de soporte ni de actualizaciones por parte de NVIDIA.
- No se documentan requisitos de latencia ni de calidad en condiciones de ruido, solapamiento de voces o audio de baja calidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Dazarang/nemotron-3-diarization-onnx
- Modelo base oficial: https://huggingface.co/nvidia/Nemotron-3-Diarization
- Proyecto exportador: https://huggingface.co/altunenes/parakeet-rs
