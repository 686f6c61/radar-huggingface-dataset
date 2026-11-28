# anonym-coling2027/E2E-GOP-SpeechOcean762

## Resumen

E2E-GOP-SpeechOcean762 es un modelo de evaluacion automatica de pronunciacion (CAPT, *Computer-Assisted Pronunciation Training*) para ingles que opera a nivel de fonema. Dado un audio y la secuencia fonetica esperada, devuelve una puntuacion continua entre 0 y 2 para cada fonema, donde valores mas altos indican mejor pronunciacion. Lo publica el autor anonimo `anonym-coling2027`, presumiblemente en el contexto de un envio a COLING 2027, y se distribuye con licencia MIT.

El modelo parte del backbone acustico `microsoft/wavlm-large` (aproximadamente 317 millones de parametros), afinado previamente para reconocimiento de fonemas sobre LibriSpeech. Sobre esa base se anade una cabeza CTC de fonemas y un modulo de puntuacion que combina caracteristicas de pronunciacion (GOP, *Goodness of Pronunciation*), embeddings de fonemas aprendidos, una LSTM bidireccional de dos capas y una cabeza de regresion. El conjunto suma 325.661.038 parametros en formato safetensors.

Su relevancia practica esta en que resuelve una tarea muy especifica (scoring fonetico fino para aprendizaje de idiomas) con un modelo compacto que funciona integramente en CPU, sin necesidad de GPU. Esto lo hace adecuado para integrarse en aplicaciones educativas, plataformas de idiomas o herramientas de evaluacion oral donde el coste de infraestructura y la latencia importan.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | WavLM-large (encoder acustico) + cabeza CTC de fonemas + features de pronunciacion + embeddings de fonemas + BiLSTM de 2 capas + cabeza de regresion |
| Parametros totales | 325.661.038 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (procesa utterances de audio; sin ventana declarada) |
| Tipos de cuantizacion | no disponible (pesos safetensors en precision original) |
| Idiomas soportados | ingles (`en`) |
| Licencia | MIT |
| Formato de pesos | safetensors (repo de 1,3 GB, incluye codigo custom) |

## Arquitectura y entrenamiento

El modelo es un hibrido de dos etapas. Primero, el backbone WavLM-large se afino para reconocimiento de fonemas sobre LibriSpeech, lo que le da representaciones acusticas alineadas con unidades foneticas. Despues, sobre ese encoder se construye el sistema de evaluacion: una cabeza CTC que produce logits por fonema, un conjunto de caracteristicas de pronunciacion derivadas de la comparacion entre la salida acustica y la secuencia canonica esperada, embeddings aprendidos para cada fonema, una LSTM bidireccional de dos capas que modela la secuencia y una cabeza de regresion que emite la puntuacion final por fonema en el rango [0, 2].

El entrenamiento del scorer se realiza sobre el corpus `mispeech/speechocean762`, un dataset publico de pronunciacion de hablantes no nativos de ingles con anotaciones a nivel de fonema, palabra y utterance. La model card no detalla el numero de tokens, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO (no aplicables en este tipo de tarea de regresion supervisada). La innovacion principal es la integracion end-to-end del GOP clasico (que tradicionalmente requiere alineamientos forzados y modelos separados) dentro de una red diferenciable que se entrena conjuntamente.

## Capacidades

- Evaluacion de pronunciacion a nivel de fonema para ingles, con puntuacion continua en [0, 2].
- Acepta audio WAV y la secuencia esperada de fonemas en ARPAbet sin marcas de acento.
- Soporta multiples palabras en una misma utterance insertando el token separador `|` entre secuencias foneticas.
- Manejo interno de audio estereo (conversion a mono) y remuestreo a 16 kHz via SciPy.
- Inferencia completa en CPU, sin requerir GPU.
- Integracion con la API de Transformers mediante `AutoModel` y `AutoProcessor` con `trust_remote_code=True`.
- No soporta generacion de texto, tool calling, agentes, vision ni audio generativo; es exclusivamente un modelo discriminativo de scoring.

## Casos de uso

- Aplicaciones de aprendizaje de ingles: el modelo puede puntuar cada fonema de una frase grabada por el alumno y devolver feedback granular ("el fonema /θ/ esta mal pronunciado") en lugar de una nota global, algo que las apps de idiomas necesitan para guiar la practica.
- Evaluacion automatica de examenes orales: integrado en un pipeline de correccion, permite generar puntuaciones objetivas por fonema que un examinador humano revisa, reduciendo el tiempo de evaluacion en pruebas de speaking a gran escala.
- Investigacion en fonetica y adquisicion de segundas lenguas: al producir scores por fonema, facilita estudios sobre que fonemas presentan mayor dificultad segun la L1 del hablante, con datos cuantitativos reproducibles.
- Herramientas de logopedia y terapia del habla: el scoring fino permite monitorizar la progresion de un paciente fonema a fonema a lo largo de sesiones, sin depender de un especialista en cada iteracion.
- Filtrado y control de calidad en datasets de voz: para corpus de habla no nativa, el modelo puede etiquetar la calidad de pronunciacion por fonema y descartar o estratificar muestras automaticamente.
- Sistemas de tutoria embebidos en el dispositivo: gracias a la inferencia en CPU y al tamano contenido (~326 M de parametros), puede desplegarse en portatiles o servidores modestos sin GPU, habilitando feedback en tiempo real en entornos con recursos limitados.
- Comparacion de variantes de pronunciacion: dado que acepta secuencias canonicas arbitrarias, permite evaluar si una realizacion se aproxima mas a una variante britanica o americana a nivel fonetico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tablas de metricas (PCC, MSE, F1 por fonema u otras) sobre SpeechOcean762 ni comparaciones con sistemas GOP clasicos.

## Requisitos de hardware

- VRAM estimada: no aplica para inferencia estandar; el modelo se ejecuta en CPU. En GPU, los 325 M de parametros en fp32 ocupan aproximadamente 1,3 GB de memoria, mas overhead de activaciones.
- GPU recomendadas: no necesarias. Cualquier GPU consumer (RTX 3060 en adelante) puede alojarlo con holgura si se desea acelerar el procesamiento por lotes.
- Cabe en GPU consumer: si, en practicamente cualquier GPU con 4 GB o mas de VRAM.
- Opciones de despliegue: PyTorch nativo con Transformers (`AutoModel`/`AutoProcessor` con `trust_remote_code=True`), dado que incluye codigo custom. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplicables a un modelo discriminativo de audio).
- Latencia y throughput: no disponibles en la informacion proporcionada. Al ser un encoder WavLM-large sobre utterances cortas, se espera procesamiento por utterance en el orden de decimas de segundo en CPU moderna, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Tarea | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| E2E-GOP-SpeechOcean762 | 325,7 M | Scoring fonetico (GOP) en ingles | no disponible | MIT | Hugging Face |
| GOP clasico (p. ej. basado en Kaldi + DNN acustico) | variable | Scoring fonetico | no aplica | variable | Pipelines propios |
| wav2vec2-based CAPT (varios) | ~300 M | Scoring de pronunciacion | no disponible | variable | Repos academicos |
| Whisper-large (uso indirecto para CAPT) | 1,55 B | ASR multilingue | 30 s | MIT | Hugging Face / OpenAI |

La comparativa directa es limitada porque no hay benchmarks publicados para este modelo. Frente al GOP clasico, la ventaja declarada es el entrenamiento end-to-end sin alineamiento forzado externo. Frente a soluciones basadas en ASR como Whisper, el modelo es mas pequeno y especifico, pero solo cubre ingles y no transcribe.

## Limitaciones y advertencias

- Solo soporta ingles; no hay evidencia de generalizacion a otras lenguas.
- Requiere que el usuario proporcione la secuencia canonica de fonemas en ARPAbet; no la infiere del audio ni del texto.
- El rango de puntuacion es fijo [0, 2] y esta calibrado sobre SpeechOcean762, un corpus con una distribucion concreta de hablantes no nativos; puede no transferir bien a otros perfiles (ninos, hablantes con trastornos del habla, acentos muy alejados del corpus).
- Riesgo de sesgo hacia los patrones de pronunciacion presentes en SpeechOcean762, que no representa toda la diversidad de acentos del ingles.
- No es un modelo generativo: no produce texto ni explicaciones; solo scores numericos por fonema.
- Requiere `trust_remote_code=True`, lo que implica ejecutar codigo del autor; conviene auditar el codigo antes de desplegarlo en produccion.
- La licencia MIT permite uso comercial, pero el modelo base WavLM-large tiene su propia licencia que conviene verificar; la model card no detalla la cadena de licencias del backbone.
- No se han publicado evaluaciones de robustez ante ruido, canales telefonicos o audio de baja calidad.
- El autor es anonimo (`anonym-coling2027`), lo que dificulta el soporte y la trazabilidad del modelo.

## Enlaces

- Hugging Face: https://huggingface.co/anonym-coling2027/E2E-GOP-SpeechOcean762
- Codigo de entrenamiento y evaluacion: https://anonymous.4open.science/r/E2E-GOP/
- Dataset SpeechOcean762: https://huggingface.co/datasets/mispeech/speechocean762
- Modelo base WavLM-large: https://huggingface.co/microsoft/wavlm-large
