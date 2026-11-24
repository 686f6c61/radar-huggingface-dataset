# gurinbaev/smart-turn-uz

## Resumen

smart-turn-uz es un modelo de clasificación de audio especializado en la detección de fin de turno (end-of-turn detection) para agentes de voz en conversaciones telefónicas en uzbeko y ruso. Lo desarrolla el usuario gurinbaev como un fine-tuning de Smart Turn v3.2 de Pipecat AI, un modelo compacto que combina el codificador de Whisper tiny con un clasificador y suma unos 8 millones de parámetros. Su función es resolver un problema concreto de los agentes conversacionales: determinar, tras una pausa del interlocutor, si este ha terminado de hablar o va a continuar, algo que la simple detección de silencio no puede resolver de forma fiable.

La relevancia del modelo está en su aplicación práctica en producción: se ejecuta en un único hilo de CPU, con una latencia de unos 100 ms en formato ONNX, y mejora sustancialmente la detección de fin de turno respecto al modelo base en llamadas telefónicas en uzbeko y ruso. El autor documenta un AUC de 0,822 frente al 0,637 del modelo base en llamadas de test, lo que se traduce en menos interrupciones del agente sobre un interlocutor que aún no ha terminado.

El modelo se distribuye en formato ONNX (pipeline completo con extracción de características log-mel integrada) y en pesos PyTorch para reentrenamiento. Está pensado específicamente para audio telefónico de banda estrecha, con una ventana de entrada de 8 segundos a 16 kHz, y su licencia BSD 2-Clause permite uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Codificador Whisper tiny + clasificador (audio-classification) |
| Parametros totales | ~8 millones |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8 segundos de audio a 16 kHz (128.000 muestras) |
| Tipos de cuantizacion | ONNX float32 (publicado); variante int8 evaluada pero no publicada |
| Idiomas soportados | uzbeko (uz), ruso (ru), incluido habla mixta |
| Licencia | BSD 2-Clause |
| Formato de pesos | ONNX (`smart-turn-uz.onnx`), PyTorch `state_dict` (`smart-turn-uz.pt`) |

## Arquitectura y entrenamiento

El modelo parte de Smart Turn v3.2, que combina el codificador de Whisper tiny con una cabeza clasificadora que produce la probabilidad de que el turno haya terminado. La entrada es audio mono float32 a 16 kHz, con una ventana de 8 segundos (128.000 muestras) rellenada con ceros por la izquierda; la salida es una probabilidad escalar por muestra. El export ONNX integra el cálculo de características log-mel dentro del grafo, de modo que la entrada es directamente la forma de onda.

El fine-tuning se realizó sobre conversaciones telefónicas reales en uzbeko y ruso. Las etiquetas se derivan del comportamiento de operadores humanos en cada pausa del interlocutor de al menos 0,2 s: se marca `end` cuando el operador toma la palabra y `continue` cuando el interlocutor prosigue y el operador calla. Se excluyeron las pausas con backchannels (intervenciones cortas del operador seguidas de continuación del interlocutor) y las continuaciones tras pausas superiores a 1,5 s. La partición en train, validación y test se hizo por hash de la llamada para evitar fugas entre conjuntos. El entrenamiento usó unos 38.000 puntos de decisión limpios, 3 épocas, tasa de aprendizaje 3e-5 y selección del mejor checkpoint por AUC de validación.

## Capacidades

- Detección de fin de turno en audio telefónico: devuelve la probabilidad de que el interlocutor haya terminado de hablar tras una pausa.
- Clasificación de audio binaria orientada a decisión (terminado o no terminado), no a transcripción.
- Soporte de habla mixta uzbeko-ruso en el mismo modelo.
- Inferencia en CPU: el grafo ONNX se ejecuta en un único hilo con una latencia de aproximadamente 100 ms.
- Extracción de características integrada en el export ONNX (log-mel calculado dentro del grafo).
- Pesos PyTorch disponibles para fine-tuning adicional.
- No soporta tool calling, agentes ni generación de texto: es exclusivamente un clasificador de audio.

## Casos de uso

- Agentes de voz en atención al cliente telefónica: el modelo se consulta tras 200 ms de silencio del interlocutor y, si la probabilidad supera 0,7, el agente responde con un retardo corto; en caso contrario, espera un silencio más largo. Es el escenario para el que fue entrenado y desplegado en producción.
- Telefonía en uzbeko y ruso con habla mixta: permite gestionar llamadas donde el interlocutor alterna ambos idiomas sin necesidad de modelos separados.
- Reducción de interrupciones en IVR y asistentes automáticos: al distinguir pausas de fin de turno de pausas de continuación, disminuye el número de veces que el agente habla encima del usuario (el autor reporta 1,14 colisiones por minuto con umbral 0,7 y espera de 0,9 s, frente a 1,41 con una regla de silencio de 0,55 s).
- Turnos de conversación con latencia ajustada: su coste de ~100 ms en CPU permite integrarlo en pipelines de ASR, LLM y síntesis sin añadir una carga significativa al presupuesto de latencia.
- Despliegue en entornos con recursos limitados: al ejecutarse en un solo hilo de CPU y ocupar un repositorio de 0,1 GB, es apto para servidores modestos o edge en centralitas telefónicas.
- Investigación y adaptación a nuevos dominios: los pesos PyTorch y la definición del modelo permiten reentrenar sobre otros idiomas o dominios de audio partiendo de la misma arquitectura.

## Benchmarks y rendimiento

Resultados publicados por el autor en llamadas de test retenidas (unos 5.000 puntos de decisión):

| Modelo | AUC |
|---|---|
| Smart Turn v3.2, tal como se publicó | 0,637 |
| smart-turn-uz | 0,822 |

Métricas conversacionales (con 1,0 s de latencia de pipeline: reconocimiento, LLM y síntesis), según cifras del autor procedentes de v1, que tiene el mismo AUC en sus propios clips:

| Regla | Respuesta a un interlocutor que ha terminado | Colisiones por minuto |
|---|---|---|
| Silencio 0,55 s | 1,55 s | 1,41 |
| Silencio 0,90 s | 1,90 s | 0,92 |
| Modelo, umbral 0,7, si no 0,9 s | mediana 1,20 s, media 1,53 s | 1,14 |
| Modelo, umbral 0,7, si no 1,5 s | mediana 1,20 s, media 1,82 s | 0,82 |

Referencia adicional: un operador humano responde a un interlocutor que ha terminado con una mediana de 1,02 s. El export ONNX coincide con PyTorch con un error inferior a 2e-6 en probabilidad. La variante int8 es aproximadamente el doble de rápida con un AUC casi idéntico (0,819), pero cambia la decisión en el 6-8 % de los puntos con umbrales entre 0,5 y 0,7, por lo que no se publica.

## Requisitos de hardware

- VRAM: no requiere GPU; el modelo está diseñado para inferencia en CPU.
- GPU recomendadas: no aplica; no se documenta uso en GPU.
- Cabe en cualquier CPU de consumo: ~8 millones de parámetros y un repositorio de 0,1 GB.
- Opciones de despliegue: ONNX Runtime con `CPUExecutionProvider` (documentado por el autor); los pesos PyTorch permiten integración con PyTorch.
- Latencia: aproximadamente 100 ms en un único hilo de CPU para el grafo ONNX; la variante int8 es unas dos veces más rápida.
- Throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Entrada | Idiomas | AUC en el test del autor | Licencia |
|---|---|---|---|---|---|
| smart-turn-uz | ~8 M | 8 s a 16 kHz | uz, ru | 0,822 | BSD 2-Clause |
| Smart Turn v3.2 (pipecat-ai) | ~8 M | 8 s a 16 kHz | no disponible | 0,637 | BSD 2-Clause |

No se dispone en la información proporcionada de otros modelos comparables de detección de fin de turno para uzbeko y ruso.

## Limitaciones y advertencias

- Entrenado únicamente con llamadas telefónicas; se esperan resultados peores en audio de banda ancha u otros dominios. El autor recomienda filtrar paso bajo el audio de micrófono o navegador a la banda telefónica antes de usarlo.
- Las etiquetas provienen del comportamiento de operadores, lo que introduce ruido en pausas largas: el interlocutor puede haber estado esperando una respuesta que el operador no dio.
- No modela backchannels ("ha", "угу"); solo distingue entre turno terminado y no terminado.
- La variante int8, aunque más rápida, no se publica por el cambio de decisión en el 6-8 % de los puntos con umbrales entre 0,5 y 0,7.
- El modelo debe alimentarse solo con el canal del interlocutor, los últimos 8 segundos y relleno de ceros por la izquierda; un uso distinto del previsto puede degradar la precisión.
- No es un modelo generativo: no produce texto ni admite tool calling; su uso está acotado a la clasificación de audio.
- Licencia BSD 2-Clause: permite uso comercial con atribución y conservación del aviso de copyright; conviene revisar los términos exactos del archivo `LICENSE`.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/gurinbaev/smart-turn-uz
- Modelo base Smart Turn v3.2: https://huggingface.co/pipecat-ai/smart-turn-v3
