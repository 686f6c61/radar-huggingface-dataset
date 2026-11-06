# diarizeapp/silero-vad-onnx

## Resumen

Silero VAD v5 ONNX & QNN EPContext es una distribucion en formato ONNX del detector de actividad de voz (VAD) Silero VAD v5, mantenida por el ecosistema diarizeapp. Se trata de un modelo neuronal ligero que procesa flujos de audio a 16 kHz y decide, ventana a ventana, si hay voz humana presente. Su particularidad frente a otras distribuciones es que incluye un contexto de ejecucion (EPContext) para el proveedor de ejecucion QNN, lo que permite ejecutar la inferencia directamente sobre la NPU Hexagon HTP de los SoC Snapdragon X Elite.

El modelo resuelve un problema clasico en pipelines de audio: segmentar habla de silencio y ruido antes de alimentar sistemas de reconocimiento automatico del habla (ASR), diarizacion de hablantes o transcripcion en tiempo real. La evaluacion se realiza en ventanas estaticas de 512 muestras (30 ms a 16 kHz), un tamano que encaja de forma natural con el procesamiento por bloques de los DSP y con los requisitos de baja latencia de la telefonia y la videoconferencia.

Es relevante ahora por dos motivos. Primero, porque el despliegue en NPU de modelos de audio pequenos esta ganando interes en escenarios de borde (portatiles ARM, dispositivos empotrados) donde no se quiere depender de la GPU. Segundo, porque el repositorio se presenta como un espejo canonico con el objetivo explicito de evitar roturas de dependencias por enlaces 404, un problema frecuente cuando assets de terceros desaparecen de Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal recurrente ligera (no se detalla en la model card; Silero VAD v5 usa una arquitectura tipo RNN/CNN compacta) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; ventana de evaluacion fija de 512 muestras (30 ms a 16 kHz) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el modelo es agnostico al idioma: detecta voz, no contenido linguistico) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX, con EPContext para QNN |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna ni el proceso de entrenamiento. Lo que si se documenta es el contrato de inferencia: audio de entrada a 16 kHz, evaluacion en ventanas estaticas de 512 muestras (30 ms), lo que produce una salida de probabilidad de voz por ventana. Esta granularidad de 30 ms es la habitual en VAD de produccion, porque permite reaccionar con suficiente rapidez a los cambios de turno de palabra sin trocear en exceso el audio.

El aspecto tecnico diferencial de esta distribucion es el empaquetado. El repositorio incluye un EPContext de QNN, es decir, un grafo precompilado para el proveedor de ejecucion de Qualcomm, de modo que el modelo puede ejecutarse sobre la NPU Hexagon HTP del Snapdragon X Elite sin recompilacion en tiempo de ejecucion. Para el resto de plataformas se mantiene la compatibilidad con ONNX Runtime estandar: DirectML y CUDA en GPU, y CPU con SIMD (x86_64 y ARM NEON) como fallback universal. No se dispone de informacion sobre el numero de tokens de audio usados en el entrenamiento, la composicion del dataset ni si hubo ajuste fino con RLHF o DPO.

## Capacidades

- Deteccion de actividad de voz sobre flujo de audio a 16 kHz con ventanas de 512 muestras (30 ms).
- Salida de probabilidad de voz por ventana, apta para umbralizado configurable en el pipeline consumidor.
- Ejecucion acelerada en NPU Hexagon HTP (Snapdragon X Elite) mediante el EPContext de QNN incluido.
- Ejecucion en GPU mediante DirectML y CUDA a traves de ONNX Runtime.
- Ejecucion en CPU con rutas SIMD para x86_64 y ARM NEON.
- Independiente del idioma: no transcribe ni identifica hablantes, solo discrimina voz frente a no voz.
- Integrable como etapa previa en pipelines de ASR, diarizacion y deteccion de turnos.
- No soporta tool calling, function calling ni razonamiento multi-paso: es un modelo puramente discriminativo de audio.

## Casos de uso

- Segmentacion previa a ASR en transcripcion en tiempo real: el VAD filtra silencios y ruido antes de enviar audio al modelo de reconocimiento, reduciendo coste computacional y llamadas innecesarias al motor de ASR.
- Diarizacion de hablantes: al marcar con precision los tramos con voz, el modulo de diarizacion puede concentrar el calculo de embeddings de hablante solo en regiones utiles, mejorando la eficiencia del pipeline.
- Deteccion de turnos en telefonia y VoIP: la ventana de 30 ms permite identificar el final de una intervencion con latencia baja, lo que habilita barge-in y gestion de turnos en asistentes conversacionales.
- Reuniones y videoconferencia: activacion automatica de la transmision solo cuando el participante habla, con supresion de ruido de fondo y ahorro de ancho de banda.
- Despliegue en portatiles ARM con Snapdragon X Elite: el EPContext de QNN permite ejecutar el VAD en la NPU Hexagon, liberando CPU y GPU para el resto de la aplicacion y reduciendo el consumo energetico.
- Vigilancia y analitica de audio en borde: deteccion de presencia de voz en dispositivos empotrados para activar grabacion o procesamiento posterior solo cuando hay habla, con la CPU en reposo el resto del tiempo.
- Preprocesado en pipelines de subtitulado: alineado de subtitulos y eliminacion de silencios largos antes de la fase de reconocimiento, lo que simplifica la sincronizacion temporal.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Por el tipo de modelo (VAD ligero en ONNX) es esperable un consumo de memoria muy bajo, pero no se aportan cifras.
- GPU recomendadas: no se especifican modelos concretos; la model card indica soporte de DirectML y CUDA via ONNX Runtime.
- NPU: Hexagon HTP del Snapdragon X Elite soportada de forma nativa mediante el EPContext de QNN.
- CPU: x86_64 y ARM NEON como fallback universal.
- Cabe en GPU de consumo: no se confirma explicitamente, pero al ser un modelo ONNX de VAD de ventana fija, el requisito de memoria es minimo; no hay datos de VRAM publicados.
- Opciones de despliegue: ONNX Runtime (CPU, CUDA, DirectML, QNN). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles. La unica cifra publicada es la ventana de evaluacion de 30 ms (512 muestras a 16 kHz).

## Comparativa con modelos similares

| Modelo | Tipo | Ventana de evaluacion | Licencia | Formatos | Aceleracion NPU |
|---|---|---|---|---|---|
| diarizeapp/silero-vad-onnx | VAD neuronal | 512 muestras (30 ms) | Apache 2.0 | ONNX + EPContext QNN | Si (Hexagon HTP) |
| Silero VAD v5 (original) | VAD neuronal | 512 muestras (30 ms) | MIT (segun distribucion original) | PyTorch, ONNX, JIT | No documentada |
| WebRTC VAD | VAD clasico (GMM) | 10/20/30 ms | BSD | Codigo nativo | No |
| TEN VAD | VAD neuronal | no disponible | no disponible | ONNX | No documentada |

La comparativa se limita a caracteristicas estructurales porque no hay datos de benchmarks publicados para esta distribucion. La ventaja principal frente al Silero VAD original es el empaquetado con EPContext para QNN y el compromiso de disponibilidad persistente del asset; frente a WebRTC VAD, la diferencia es el enfoque neuronal, que suele generalizar mejor en condiciones de ruido no estacionario.

## Limitaciones y advertencias

- Es un detector de voz, no un reconocedor: no transcribe, no identifica hablantes y no entiende el contenido del audio.
- La model card no documenta sesgos, composicion del dataset ni condiciones de entrenamiento, por lo que no es posible evaluar su comportamiento diferencial por idioma, acento, edad o genero.
- Riesgo de falsos positivos en presencia de musica vocal, television o ruido con caracteristicas espectrales similares a la voz.
- Riesgo de falsos negativos con voz susurrada, audio de baja relacion senal-ruido o microfonos de baja calidad.
- La ventana fija de 512 muestras impone un contrato estricto de remuestreo a 16 kHz; alimentar el modelo con otra frecuencia o con bloques de tamano distinto requiere adaptacion en el consumidor.
- El EPContext de QNN esta compilado para un hardware concreto (Hexagon HTP del Snapdragon X Elite); no es portable a otras NPU sin recompilacion.
- La licencia Apache 2.0 permite uso comercial, pero el modelo depende de ONNX Runtime y, en su caso, del SDK de Qualcomm, cuyas condiciones deben verificarse por separado.
- El repositorio tiene un tamano de 0.0 GB reportado y muy pocas descargas (18), lo que sugiere un artefacto de publicacion reciente; conviene verificar la integridad de los ficheros antes de integrarlo en produccion.
- No se especifican versiones minimas de ONNX Runtime ni del SDK de QNN necesarias para cargar el EPContext.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/diarizeapp/silero-vad-onnx
- Repositorio del mantenedor (diarizeapp): https://github.com/benzy/diarize
- ONNX Runtime: https://onnxruntime.ai/
- Qualcomm QNN SDK: no disponible en la informacion proporcionada
- Modelo original Silero VAD: no disponible en la informacion proporcionada
