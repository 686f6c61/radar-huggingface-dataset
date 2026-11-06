# notaneimu/fast-b3-speaker-student-onnx

## Resumen

Fast B3 Speaker Student (ONNX) es un modelo de extracción de embeddings de hablante desarrollado por el usuario notaneimu. Se trata de un estudiante convolucional destilado al espacio de embeddings de ReDimNet2-B3, diseñado para codificar clips de voz de entre 1 y 5 segundos y producir un vector de 192 dimensiones compatible con inscripciones (enrollments) generadas por B3. El problema que resuelve es el coste computacional de B3 en inferencia: el estudiante permite codificar consultas rápidamente contra inscripciones B3 ya existentes sin necesidad de rehacer el proceso de enrollment.

La arquitectura parte del encoder convolucional 1D depthwise de TitaNet-S, con tres modificaciones: limitación temporal a 160 frames mediante promedio de área temporal, ocho mapas de atención compartidos en lugar de pooling de atención por canal, y una proyección aprendida de 192 dimensiones entrenada por destilación contra B3. El modelo se distribuye en formato ONNX FP32 (opset 17, 22,3 MB) y se ejecuta con ONNX Runtime, sin requerir PyTorch ni NeMo.

Es relevante ahora porque ofrece una alternativa de bajísima latencia (en torno a 4,6 ms para 3 segundos de audio en CPU, incluyendo extracción de features) para tareas de verificación de hablante en producción, a costa de una pérdida de precisión frente a B3 que el autor documenta explícitamente. La licencia Apache-2.0 y el formato ONNX facilitan su integración en pipelines existentes.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN 1D depthwise (basada en TitaNet-S) con pooling por atención compartida y proyección a 192-D |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 160 frames de entrada (aproximadamente 1–5 s de audio a 16 kHz) |
| Tipos de cuantizacion | no disponible (solo se publica FP32 ONNX) |
| Idiomas soportados | no disponible (modelo agnóstico al idioma, basado en características acústicas) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (FP32, opset 17, 22,3 MB) |

## Arquitectura y entrenamiento

El modelo es un estudiante convolucional que parte del encoder 1D depthwise de TitaNet-S. Sobre esa base se aplican tres cambios: (1) un promedio de área temporal que limita la entrada del encoder a 160 frames pero retiene contribución de todo el clip; (2) ocho mapas de atención compartidos que sustituyen el pooling de atención por canal; y (3) una proyección aprendida de 192 dimensiones que reemplaza el mapeo nativo de embeddings y se entrena junto con el encoder mediante destilación contra los embeddings de ReDimNet2-B3.

El entrenamiento utiliza datos de VoxCeleb, Common Voice y LibriSpeech, según indica el autor. La exportación a ONNX pliega la normalización, fusiona las convoluciones finales y aplica reescrituras algebraicamente equivalentes de squeeze-excitation. No se especifican en la información disponible el número de tokens, la composición exacta del dataset ni si hubo fases de RLHF o DPO (no aplicables a este tipo de modelo). La innovación técnica principal es la destilación al espacio B3 manteniendo compatibilidad de inscripciones, junto con la optimización para inferencia en CPU.

## Capacidades

- Extracción de embeddings de hablante: produce un vector de 192 dimensiones por clip, normalizado L2 por el wrapper de Python incluido.
- Verificación de hablante: comparación por similitud coseno contra inscripciones B3 existentes, con umbral a elegir por el usuario sobre audio de validación propio.
- Compatibilidad con ReDimNet2-B3: las inscripciones deben provenir de B3 con configuración `lm`, `vb2+vox2+cnc2_v0`; la revisión y hash exactos están en `config.json`.
- Procesamiento de clips cortos: diseñado para 1–5 segundos de voz mono a 16 kHz, float32 en rango aproximado `[-1, 1]`.
- Inferencia ligera: ejecución con ONNX Runtime en CPU, sin dependencia de PyTorch ni NeMo.
- Reutilización de sesión: la clase `SpeakerEmbedder` permite inicializar la sesión una vez para inferencia repetida con número de hilos configurable.
- No soporta tool calling, agentes, visión, audio generativo ni razonamiento multi-paso; es un encoder de embeddings, no un modelo generativo.

## Casos de uso

- Verificación biométrica de voz en autenticación: codificar un clip corto del usuario y comparar por similitud coseno contra su inscripción B3 almacenada, aprovechando la latencia de milisegundos para no penalizar el flujo de login.
- Deduplicación de hablantes en archivos de audio: procesar segmentos de 1–5 s detectados por VAD y agrupar por similitud de embeddings para consolidar identidades en un archivo de reuniones o podcast.
- Enrutamiento de llamadas en atención al cliente: asignar llamadas entrantes a un agente o cola según el hablante identificado, usando inscripciones B3 preexistentes y el estudiante para la codificación rápida en tiempo real.
- Indexación y búsqueda de hablantes en archivos históricos: generar embeddings de consulta rápidos contra una base de inscripciones B3 ya construida, sin reentrenar ni recodificar el corpus completo.
- Diarización ligera asistida: combinar la salida del modelo con etiquetado automático de turnos para separar hablantes en grabaciones con pocos participantes, aceptando la menor precisión documentada en habla solapada.
- Filtrado previo en pipelines de transcripción: verificar que el hablante del clip coincide con el esperado antes de enviar el audio a un ASR más costoso, reduciendo procesamiento innecesario.
- Prototipado y despliegue en entornos sin GPU: al ejecutarse en ONNX Runtime CPU con tiempos de 2,8–5,1 ms para 1–5 s de audio, encaja en servicios contenedorizados sin acelerador.

## Benchmarks y rendimiento

Tasa de error igual (EER %, menor es mejor) según la model card. Los subconjuntos son pequeños (50 consultas VoxCeleb, 100 Common Voice, 250 LibriSpeech con 25 hablantes inscritos; reuniones de YouTube con tres grabaciones y 35 hablantes inscritos) y no son listas oficiales de evaluación.

| Dataset | Modelo | 1 s | 2 s | 3 s | 4 s | 5 s |
|---|---|---:|---:|---:|---:|---:|
| VoxCeleb subset | Este modelo | 9,92 | 4,06 | 4,00 | 4,00 | 4,00 |
| VoxCeleb subset | B0 | 12,00 | 5,61 | 4,00 | 4,00 | 3,73 |
| VoxCeleb subset | B3 | 6,00 | 2,00 | 2,00 | 2,00 | 2,00 |
| Common Voice subset | Este modelo | 4,00 | 2,25 | 2,10 | 2,00 | 2,08 |
| Common Voice subset | B0 | 6,00 | 3,19 | 3,00 | 2,00 | 2,00 |
| Common Voice subset | B3 | 2,98 | 2,05 | 2,00 | 2,00 | 2,00 |
| LibriSpeech | Este modelo | 1,60 | 0,40 | 0,40 | 0,40 | 0,40 |
| LibriSpeech | B0 | 1,60 | 0,43 | 0,34 | 0,09 | 0,10 |
| LibriSpeech | B3 | 0,32 | 0,01 | 0,00 | 0,00 | 0,00 |
| YouTube meetings | Este modelo | 9,08 | 4,08 | 3,11 | 3,00 | 2,97 |
| YouTube meetings | B0 | 8,67 | 3,45 | 2,12 | 2,00 | 1,60 |
| YouTube meetings | B3 | 5,19 | 1,72 | 0,97 | 0,79 | 0,67 |

Rendimiento en CPU (mediana en caliente, Ryzen 9 5950X, WSL2, ONNX Runtime 1.31.1 CPU, 4 hilos intra-op / 1 inter-op, batch 1, incluyendo frontend de waveform y normalización de salida; excluye carga, resampling, VAD e inicialización):

| Modelo | 1 s | 2 s | 3 s | 4 s | 5 s |
|---|---:|---:|---:|---:|---:|
| Este modelo | 2,82–3,17 | 4,32–4,35 | 4,59–4,61 | 4,84–4,87 | 5,11 |
| B0 original | 5,82–7,58 | 7,94–7,97 | 10,83–10,84 | 13,81–13,90 | 16,72–16,76 |
| B3 original | 18,08–18,18 | 33,85–33,90 | 50,60–50,83 | 69,41–70,00 | 92,26–92,52 |

Aproximadamente 11× más rápido que B3 a 3 s en ese host. La misma entrada tarda unos 13,0 ms con un hilo y 7,4 ms con dos.

## Requisitos de hardware

- VRAM: no aplica; el modelo está pensado para inferencia en CPU con ONNX Runtime.
- Tamaño en disco: 22,3 MB (FP32 ONNX), lo que permite empaquetarlo en imágenes de contenedor pequeñas.
- GPU: no se documentan requisitos ni soporte GPU; el autor mide exclusivamente en CPU (Ryzen 9 5950X, WSL2).
- Cabe en cualquier CPU consumer; los tiempos de referencia son de un Ryzen 9 5950X con 4 hilos intra-op.
- Despliegue: ONNX Runtime (CPU), con wrapper de Python incluido (`inference.py`, clase `SpeakerEmbedder`). No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia: 2,82–5,11 ms para clips de 1–5 s con 4 hilos; 13,0 ms con un hilo y 7,4 ms con dos para la misma entrada de 3 s.
- Throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Embedding | Compatibilidad B3 | EER 3 s (VoxCeleb) | EER 3 s (LibriSpeech) | Licencia | Formato |
|---|---|---|---|---|---|---|---|
| Este modelo | Estudiante convolucional destilado | 192-D | Sí (inscripciones B3) | 4,00 | 0,40 | Apache-2.0 | ONNX FP32 |
| ReDimNet2-B3 | Modelo docente de referencia | 192-D | Nativa | 2,00 | 0,00 | no disponible en la información | no disponible |
| Original B0 | Modelo convolucional base | no disponible | No | 4,00 | 0,34 | no disponible en la información | no disponible |

El estudiante iguala o supera a B0 en EER a 3 s en VoxCeleb y Common Voice, pero queda por detrás de B3 en todos los conjuntos y duraciones. Su ventaja es la latencia (11× menor que B3 a 3 s) y la compatibilidad directa con inscripciones B3.

## Limitaciones y advertencias

- Intercambio explícito precisión-velocidad: el autor indica que el modelo sacrifica precisión por velocidad, especialmente en habla corta (1–2 s), donde el EER sube a 9,92 en VoxCeleb y 9,08 en reuniones.
- Uso previsto para habla de un solo hablante: no se ha establecido el rendimiento con una o dos palabras, hablantes solapados ni salida natural de VAD.
- Compatibilidad B3 estricta: las inscripciones deben provenir de ReDimNet2-B3 con configuración `lm`, `vb2+vox2+cnc2_v0`; una dimensión de vector coincidente no garantiza compatibilidad con otros encoders.
- Evaluaciones sobre subconjuntos pequeños y, en reuniones, con etiquetas automáticas de turnos de hablante; los scores reflejan acuerdo con esas etiquetas, no una lista oficial de trials.
- Umbral de decisión no incluido: debe elegirse con audio de validación propio para cada aplicación.
- Preprocesado a cargo del usuario: VAD, downmixing a mono y resampling a 16 kHz deben hacerse aguas arriba.
- Sesgos: no documentados en la información disponible; al entrenar con VoxCeleb, Common Voice y LibriSpeech, puede heredar sesgos de esos corpus en acento, género, edad y calidad de grabación.
- Riesgo de alucinación: no aplica en el sentido generativo, pero sí existe riesgo de falsos positivos/negativos en la verificación por umbral mal calibrado.
- Licencia Apache-2.0 permite uso comercial; deben conservarse `LICENSE` y `NOTICE`, y se atribuye a NVIDIA TitaNet-S y ReDimNet2-B3.
- No se documentan cuantizaciones alternativas ni soporte GPU; el rendimiento medido es exclusivamente en CPU.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/notaneimu/fast-b3-speaker-student-onnx
- Configuración y revisión de pesos B3: https://huggingface.co/notaneimu/fast-b3-speaker-student-onnx/blob/main/config.json
- Resultados completos de calidad: https://huggingface.co/notaneimu/fast-b3-speaker-student-onnx/blob/main/evaluation.json
- Comparativas CSV: https://huggingface.co/notaneimu/fast-b3-speaker-student-onnx/blob/main/evaluation.csv
- Detalles de tiempos en CPU: https://huggingface.co/notaneimu/fast-b3-speaker-student-onnx/blob/main/benchmark_results.json
- Licencia: https://huggingface.co/notaneimu/fast-b3-speaker-student-onnx/blob/main/LICENSE
- Aviso de atribución: https://huggingface.co/notaneimu/fast-b3-speaker-student-onnx/blob/main/NOTICE
- NVIDIA TitaNet-S: https://catalog.ngc.nvidia.com/orgs/nvidia/nemo/models/titanet_small/-
- ReDimNet2: https://github.com/PalabraAI/redimnet2
