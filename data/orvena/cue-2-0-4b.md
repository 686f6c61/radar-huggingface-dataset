# Orvena/Cue-2-0.4B

## Resumen

Cue-2-0.4B es un modelo de clasificación de audio disenado especificamente para la deteccion de fin de turno (end-of-turn / endpointing) en asistentes de voz duplex. Lo desarrolla Orvena y forma parte de su "voice mode": se trata de un par de modelos donde el modelo de texto (Cue-0.4B) permanece sin cambios y el componente de audio es nuevo. Su funcion es escuchar el microfono y determinar cuando el usuario ha terminado de hablar, sustituyendo el clasico temporizador de pausa de 1,5 s que introduce latencia artificial en cada respuesta.

El modelo resuelve un problema concreto y muy medible en produccion: el retardo sistematico antes de cada respuesta y el corte prematuro de peticiones que contienen pausas internas (por ejemplo, cuando el usuario se detiene a pensar a mitad de una frase). Con solo 7,85 M de parametros, se ejecuta cada 100 ms sobre el Neural Engine de un iPhone en aproximadamente 1,3 ms, lo que lo hace viable en dispositivo sin penalizacion perceptible.

La relevancia actual radica en su enfoque on-device y multilingue (35 idiomas en entrenamiento, 30 declarados en la model card) combinado con una licencia Apache 2.0 permisiva. Empaquetado en Core ML, ocupa 16,6 MB en dos paquetes, lo que lo posiciona como un componente practico para asistentes de voz de baja latencia en movil.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder de audio de Whisper tiny con dos cabezas de clasificacion |
| Parametros totales | 7.866.265 (7,85 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | ventana de 4 s de audio a 16 kHz, procesada en ticks de 100 ms |
| Tipos de cuantizacion | no disponible (pesos Core ML y safetensors; el repo incluye paquetes Core ML) |
| Idiomas soportados | 30 declarados: bg, cs, da, de, el, en, es, et, fi, fr, hi, hr, hu, id, it, ja, ko, lt, lv, nl, pl, pt, ro, ru, sk, sl, sv, tr, uk, vi |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors y Core ML (Core ML packages) |

## Arquitectura y entrenamiento

El modelo reutiliza el encoder de audio de Whisper tiny y le anade dos cabezas pequenas, sumando 7.850.185 parametros. El front end convierte el audio a 80 bins log-mel; el encoder y las cabezas se ejecutan en el Neural Engine. La entrada es la ventana mas reciente de 4 s de audio a 16 kHz, evaluada cada 100 ms. Las dos cabezas producen: `p(end of turn)`, la probabilidad de que el usuario no hable en los proximos 2 s, y `user speaking`, que indica si hay voz en los ultimos 20 ms.

El entrenamiento parte de los pesos de Smart Turn v3.2 y utiliza 1.028 horas de audio en 35 idiomas. La composicion del dataset es: 547,0 h de Smart Turn data v3.2 (clips de turno de un solo hablante), 128,9 h del corpus AMI de reuniones en ingles, 122,0 h de escenas ensambladas con Supertonic 3 y Kokoro en 30 idiomas, 104,7 h de FLEURS (frases leidas, 30 idiomas), 94,1 h de VoxPopuli (discurso parlamentario, 8 idiomas) y 31,6 h de peticiones con pausas generadas por un modelo de voz en vivo (GPT-Live-1.1, 30 idiomas). Esta ultima fuente es la innovacion clave del release: captura el patron prosodico de una voz sintetica que mantiene el tono antes de una pausa y lo baja al final de la peticion.

La logica de decision combina el modelo con el temporizador de pausa de la aplicacion mediante dos umbrales: theta = 0,6 para fin temprano (el turno termina cuando p(end of turn) >= 0,6 en dos ticks consecutivos sin voz del usuario en esos ticks ni en el anterior) y tau = 0,3 para retencion (el temporizador solo puede cerrar el turno si p(end of turn) >= 0,3, con un maximo de 3 s tras la ultima deteccion de voz). Si no hay tick nuevo en 500 ms, el temporizador opera como antes, garantizando degradacion elegante.

## Capacidades

- Clasificacion de audio orientada a la deteccion de fin de turno en conversaciones de voz.
- Prediccion de `p(end of turn)` con horizonte de 2 s.
- Deteccion de actividad de voz (`user speaking`) a resolucion de 20 ms.
- Cierre temprano de turno cuando la confianza supera el umbral.
- Retencion del temporizador durante pausas internas de la peticion (pensamiento a mitad de frase).
- Funcionamiento multilingue en 30 idiomas declarados.
- Inferencia on-device en Neural Engine (Core ML) y en PyTorch para validacion.
- Integracion con el modelo de texto Cue-0.4B para decidir el significado de una interrupcion.
- No soporta tool calling, agentes ni generacion de texto: es exclusivamente un modelo de audio.

## Casos de uso

- Asistentes de voz duplex en movil: el modelo sustituye al temporizador de pausa fijo y reduce la espera mediana tras la ultima palabra de 1.881 ms a 280 ms en peticiones generadas, lo que se traduce directamente en respuestas percibidas como mas naturales.
- Peticiones largas con pausas internas: cuando el usuario se detiene a pensar a mitad de una solicitud, el modelo mantiene el temporizador (tau = 0,3) y evita que la aplicacion responda antes de tiempo; en el conjunto de peticiones generadas el corte prematuro baja del 30,6% al 8,6%.
- Atencion al cliente por voz: en escenarios con turnos multi-frase, el modelo permite distinguir una pausa de cortesia de un fin real de intervencion, reduciendo interrupciones en conversaciones con ruido ambiental controlado.
- Asistentes embebidos de bajo consumo: con 7,85 M de parametros y 16,6 MB en dos paquetes Core ML, cabe en dispositivos con recursos limitados y se ejecuta en 1,3 ms por tick en el Neural Engine de un iPhone 17 Pro Max.
- Transcripcion y subtitulado en tiempo real: la senal `user speaking` a 20 ms permite segmentar intervenciones y alinear la transcripcion con los limites reales de turno.
- Sistemas de voz multilingues: al cubrir 30 idiomas, un mismo binario puede desplegarse en mercados distintos sin reentrenamiento por idioma.
- Investigacion en interaccion persona-maquina: la logica de dos umbrales y la separacion entre modelo de audio y modelo de texto facilitan experimentos controlados sobre politicas de turno.

## Benchmarks y rendimiento

| Conjunto de prueba | Medida | Temporizador de pausa | Cue 2 |
|---|---|---|---|
| Peticiones generadas, 30 idiomas, 2.674 peticiones | La respuesta empieza antes de terminar la peticion | 30,6% | 8,6% |
| Peticiones generadas, 30 idiomas, 2.674 peticiones | Espera tras la ultima palabra, mediana | 1.881 ms | 280 ms |
| Open Yap, ingles, 6.487 pausas | Pausas interrumpidas | 5,5% | 5,9% |
| Open Yap, ingles, 6.487 pausas | Espera tras un fin, mediana | 1.836 ms | 1.800 ms |

En el subconjunto Open Yap, Cue 2 interrumpe el 1,6% de las pausas en las que el interlocutor permanece en silencio, frente al 3,2% del temporizador. El modelo reduce el corte prematuro en cada uno de los 30 idiomas evaluados. La latencia por tick es de 1,3 ms en el Neural Engine de un iPhone 17 Pro Max y de 4,3 ms mientras la GPU decodifica el modelo principal.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el modelo esta pensado para ejecucion on-device y su huella en disco es de 16,6 MB en dos paquetes Core ML.
- GPU recomendadas: no aplica en el caso on-device; en escritorio puede ejecutarse en CPU o GPU via PyTorch con el script `cue_audio.py`.
- Cabe en GPU de consumo: si, dado su tamano (7,85 M de parametros); no requiere GPU dedicada.
- Opciones de despliegue: Core ML en Neural Engine (objetivo principal), PyTorch para validacion con `cue_audio.py`, y despliegue en servidor mediante el pipeline de audio-classification de Hugging Face.
- Latencia: 1,3 ms por tick en Neural Engine de iPhone 17 Pro Max; 4,3 ms con la GPU ocupada decodificando el modelo principal. Throughput no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto de audio | Idiomas | Licencia | Enfoque |
|---|---|---|---|---|---|
| Cue-2-0.4B | 7,85 M | ventana de 4 s, ticks de 100 ms | 30 | Apache 2.0 | end-of-turn on-device |
| pipecat-ai/smart-turn-v3 | no disponible | no disponible | no disponible | no disponible | end-of-turn (modelo base del entrenamiento) |
| Orvena/Cue-0.4B | 0,4 B (segun nombre) | no disponible | no disponible | no disponible | modelo de texto del par Cue |

La comparativa con alternativas de la misma categoria es limitada porque la model card solo identifica a Smart Turn v3.2 como base de entrenamiento y a Cue-0.4B como companero de texto; no se aportan datos de rendimiento de esos modelos para contrastar.

## Limitaciones y advertencias

- El conjunto de peticiones generadas esta producido por voces sinteticas de un modelo de voz en vivo, no por personas; el propio autor advierte que la distribucion no equivale a habla humana real.
- En el conjunto Open Yap (habla humana real, 17,84 h, 8 hablantes, etiquetas generadas por maquina), Cue 2 interrumpe ligeramente mas pausas que el temporizador (5,9% frente a 5,5%), aunque la mediana de espera apenas mejora (1.800 ms frente a 1.836 ms).
- Las etiquetas de Open Yap estan generadas automaticamente, lo que introduce ruido en la evaluacion.
- El modelo es exclusivamente de clasificacion de audio: no genera texto, no soporta tool calling ni razonamiento multi-paso; depende del modelo de texto Cue-0.4B para interpretar interrupciones.
- La ventana de 4 s limita la deteccion a contexto acustico reciente; pausas muy largas dependen del temporizador de la aplicacion y del limite de 3 s tras la ultima deteccion de voz.
- No se documentan sesgos por acento, edad o genero mas alla de la composicion del dataset de entrenamiento.
- Riesgo de alucinacion no aplica en el sentido generativo, pero si existe riesgo de falsos positivos en la deteccion de fin de turno en entornos ruidosos.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base Smart Turn v3.2 y los datasets empleados pueden tener condiciones propias que conviene verificar antes de un despliegue en produccion.
- Los datos de benchmarks se limitan a los conjuntos descritos; no hay resultados publicados en benchmarks estandar como MMLU, HumanEval o GSM8K, que no aplican a esta tarea.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Orvena/Cue-2-0.4B
- Modelo de texto companero: https://huggingface.co/Orvena/Cue-0.4B
- Modelo base de audio: https://huggingface.co/pipecat-ai/smart-turn-v3
- Dataset Smart Turn v3.2: https://huggingface.co/datasets/pipecat-ai/smart-turn-data-v3.2-train
- Dataset AMI: https://groups.inf.ed.ac.uk/ami/corpus/
- Dataset FLEURS: https://huggingface.co/datasets/google/fleurs
- Dataset VoxPopuli: https://huggingface.co/datasets/facebook/voxpopuli
- Sitio de Orvena: https://orvena.app
- Informe tecnico: Cue-2-0.4B-technical-report.pdf (referenciado en la model card del repositorio)
