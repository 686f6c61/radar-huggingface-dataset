# diarizeapp/wespeaker-voxceleb-resnet34

## Resumen

WeSpeaker VoxCeleb ResNet-34 Speaker Embedding ONNX es un modelo de extracción de embeddings de locutor basado en una red residual ResNet-34, exportado al formato ONNX para su despliegue en producción. Lo mantiene el ecosistema diarizeapp como repositorio canónico para garantizar la disponibilidad persistente del asset y evitar roturas de dependencias por enlaces 404. El modelo no genera texto ni responde a instrucciones: su función es transformar un fragmento de audio en un vector de 256 dimensiones que representa la identidad vocal del hablante.

El modelo está entrenado sobre VoxCeleb1+2, el corpus de referencia para verificación de locutor, y se emplea como extractor de embeddings dentro de pipelines de diarización que combinan clustering jerárquico aglomerativo bayesiano (Bayesian HAC) y PLDA. Es relevante para desarrolladores que necesitan un componente de speaker verification o diarization ejecutable en CPU, GPU o NPU sin depender de frameworks de deep learning pesados, gracias a su empaquetado en ONNX Runtime.

La ficha se basa exclusivamente en la model card y los metadatos públicos del repositorio. No se dispone de información sobre el número exacto de parámetros, la composición detallada del dataset de entrenamiento, hiperparámetros ni resultados de benchmarks en la información proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ResNet-34 (red residual convolucional) para extracción de embeddings de locutor |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de audio; ventana de entrada no especificada) |
| Tipos de cuantizacion | no disponible (se distribuye en ONNX; el autor menciona compilación estática QDQ para Hexagon HTP) |
| Idiomas soportados | no disponible (independiente del idioma en la práctica, al operar sobre características acústicas) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX |
| Dimension del embedding | 256 |
| Entrada | audio (pipeline audio-to-audio) |
| Aceleradores soportados | CPU x86_64/ARM NEON, DirectML, CUDA, Hexagon HTP NPU (Snapdragon X Elite) vía QNN |

## Arquitectura y entrenamiento

La arquitectura es una ResNet-34, una red convolucional residual de 34 capas ampliamente validada en tareas de reconocimiento de locutor. El modelo produce un embedding de 256 dimensiones por fragmento de audio, que posteriormente se utiliza en etapas de scoring y clustering. El entrenamiento se realizó sobre VoxCeleb1+2, el corpus estándar de verificación de locutor en habla espontánea extraída de entrevistas y vídeos.

La model card no detalla el número de tokens o horas de audio de entrenamiento, la función de pérdida empleada (habitualmente AAM-Softmax o variantes en la familia WeSpeaker), ni si hubo etapas de fine-tuning específicas. Tampoco se especifican los hiperparámetros de aumento de datos. La innovación destacable es el empaquetado en ONNX con soporte para múltiples execution providers, incluida la compilación estática QDQ para el NPU Hexagon HTP de Snapdragon X Elite, lo que permite inferencia acelerada en portátiles ARM sin GPU dedicada.

## Capacidades

- Extracción de embeddings de locutor de 256 dimensiones a partir de audio.
- Verificación de locutor (speaker verification): comparación de dos embeddings para determinar si pertenecen a la misma persona.
- Diarización de hablantes (speaker diarization): integración en pipelines con Bayesian HAC y PLDA para segmentar y atribuir turnos de habla.
- Ejecución multiplataforma mediante ONNX Runtime en CPU, DirectML, CUDA y NPU Hexagon HTP.
- No soporta generación de texto, tool calling, agentes, visión ni razonamiento multi-step.
- No es un modelo multilingüe en sentido lingüístico; opera sobre características acústicas independientes del idioma.

## Casos de uso

- Diarización de reuniones y transcripciones: el modelo extrae embeddings por segmento que un algoritmo de clustering (Bayesian HAC) agrupa por locutor, permitiendo etiquetar quién habla en cada turno de una reunión grabada.
- Verificación biométrica de voz: comparar el embedding de una muestra con el de un locutor registrado para autenticación en aplicaciones de control de acceso o banca telefónica.
- Transcripción médica o legal con atribución de hablante: en pipelines ASR, los embeddings permiten separar las intervenciones de médico y paciente, o de abogado y cliente, en grabaciones de larga duración.
- Análisis de centros de llamadas: segmentar conversaciones de atención al cliente para medir tiempos de habla de agente y cliente, y detectar cambios de interlocutor.
- Indexación y búsqueda por voz en archivos de audio: generar embeddings de todos los segmentos de un archivo y buscar coincidencias con una voz de referencia para localizar intervenciones concretas.
- Investigación en forense de audio: comparación de muestras de voz para tareas de identificación de locutor en entornos controlados, con las cautelas propias de la disciplina.
- Despliegue en dispositivos de borde: gracias al soporte de Hexagon HTP y CPU ARM NEON, puede ejecutarse en portátiles Snapdragon X Elite o dispositivos ARM sin GPU, útil para procesamiento local de audio sin enviar datos a la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible. Al ser un ResNet-34, el consumo de memoria es moderado y cabe holgadamente en GPUs de consumo, pero no se especifica la cifra exacta.
- GPU recomendadas: cualquier GPU compatible con CUDA o DirectML; el autor cita soporte explícito para DirectML y CUDA vía ONNX Runtime.
- NPU: Hexagon HTP en Snapdragon X Elite, mediante compilación estática QDQ con QNN.
- CPU: x86_64 y ARM NEON con fallback SIMD universal.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU moderna con al menos unos pocos GB de VRAM, aunque no se dispone de la cifra exacta.
- Opciones de despliegue: ONNX Runtime (CPU, CUDA, DirectML, QNN). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Embedding | Entrenamiento | Licencia | Formato |
|---|---|---|---|---|---|
| diarizeapp/wespeaker-voxceleb-resnet34 | ResNet-34 | 256 dim | VoxCeleb1+2 | Apache 2.0 | ONNX |
| Modelos WeSpeaker oficiales (pyannote/wespeaker) | ResNet-34 / ECAPA-TDNN | 256 dim (típico) | VoxCeleb1+2 | Apache 2.0 (según variante) | PyTorch / ONNX |
| SpeechBrain ECAPA-TDNN | ECAPA-TDNN | 192 dim (típico) | VoxCeleb1+2 | Apache 2.0 | PyTorch |
| NVIDIA NeMo TitaNet | TitaNet (1D conv) | 192 dim (típico) | VoxCeleb1+2 | Apache 2.0 (según variante) | NeMo / ONNX |

Las cifras de dimensión de embedding de los modelos comparables son las habituales de sus familias, no necesariamente idénticas a las variantes concretas. No se dispone de datos de rendimiento comparativo (EER, DER) en la información proporcionada.

## Limitaciones y advertencias

- No se dispone de datos de benchmarks (EER, DER) que permitan validar el rendimiento real frente a otros extractores de embeddings.
- La model card no especifica la composición exacta del dataset, los hiperparámetros ni la función de pérdida, lo que dificulta la reproducibilidad.
- El rendimiento puede degradarse en audio con ruido, reverberación, solapamiento de hablantes o canales telefónicos estrechos, condiciones no documentadas por el autor.
- Es un modelo de extracción de características, no de decisión: la calidad final de la diarización depende del pipeline de clustering y scoring (HAC, PLDA) que lo rodea.
- Riesgo de sesgo demográfico inherente a VoxCeleb, que no está balanceado por edad, género, acento ni condición de grabación.
- El uso para verificación biométrica o forense está sujeto a regulación (RGPD, IA Act) y requiere evaluación de impacto y consentimiento; la licencia Apache 2.0 no exime de estas obligaciones.
- Aunque la licencia Apache 2.0 permite uso comercial, el autor no ofrece garantías sobre el modelo ni sobre la integridad del asset más allá de la disponibilidad del repositorio.
- El repositorio tiene un tamaño de 0.0 GB y 36 descargas en el momento de la consulta, lo que sugiere un uso muy limitado y poca validación comunitaria.

## Enlaces

- HuggingFace: https://huggingface.co/diarizeapp/wespeaker-voxceleb-resnet34
- Repositorio diarizeapp: https://github.com/benzy/diarize
- WeSpeaker (proyecto original): no disponible en la información proporcionada
- Paper de VoxCeleb: no disponible en la información proporcionada
