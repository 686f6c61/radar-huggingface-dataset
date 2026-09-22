# Ruivalim/exu-qwen3-0.6b-goemotions

## Resumen

exu-qwen3-0.6b-goemotions es un modelo experimental de clasificacion de emociones publicado por el usuario Ruivalim dentro del proyecto Exu (exu-base). No es un modelo generativo: parte del cuerpo (body) de Qwen3-0.6B, elimina la cabeza de lenguaje y anade una cabeza de decision minima, formada por `LayerNorm(1024)` seguida de `Linear(1024, 1)`. El modelo responde a una unica pregunta tipada, "Which emotion does this comment express?", produciendo una distribucion de probabilidad sobre las 28 etiquetas del corpus GoEmotions.

El mecanismo de inferencia consiste en construir 28 secuencias, una por emocion candidata, ejecutar el cuerpo del transformer sobre cada una y aplicar la cabeza al estado oculto del token final. La softmax sobre esas 28 puntuaciones es la respuesta. El modelo nunca genera texto, y su salida es una decision calibrada (una temperatura ajustada en un split reservado se guarda en `config.json`).

Es relevante como demostracion tecnica de la via "decoder" del toolkit Exu y del uso de reglas de puntuacion estrictamente propias (log score combinado con 0,75 veces el spherical score) para obtener decisiones probabilisticas honestas, en lugar de recurrir a RLCD. El checkpoint se publica como sonda de investigacion, no como producto. Cuenta con 596.052.993 parametros, licencia Apache-2.0 y un unico idioma soportado, el ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (cuerpo de Qwen3-0.6B) con cabeza de decision `LayerNorm(1024)` + `Linear(1024, 1)`; sin cabeza de lenguaje |
| Parametros totales | 596.052.993 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 128 tokens en entrenamiento (5 de 58.007 preguntas fueron recortadas); el contexto nativo del modelo base no se indica en la informacion disponible |
| Tipos de cuantizacion | no disponible (pesos en float32 en safetensors) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (formato de sonda de investigacion; no cargable por exu-base 0.1.0) |

## Arquitectura y entrenamiento

El modelo reutiliza el cuerpo del transformer decoder de Qwen3-0.6B y descarta por completo su cabeza de lenguaje. Sobre el estado oculto del token final de cada secuencia aplica una cabeza de dos capas (`LayerNorm(1024)` y `Linear(1024, 1)`). La tarea se formula como una pregunta de eleccion con opciones: se genera una secuencia por cada una de las 28 emociones candidatas con la plantilla `State` / `type: choice` / `Question` / `Candidate` / `Decision:<|im_end|>`, y la softmax sobre las 28 puntuaciones produce la distribucion final. Por tanto, cada comentario requiere 28 pasadas cortas por el cuerpo, no una sola.

El entrenamiento consistio en una unica epoca sobre los 46.370 comentarios de entrenamiento de GoEmotions (semilla 17), con la recompensa compuesta de Exu: log score mas 0,75 veces el spherical score. Se uso AdamW con learning rate `1e-5` para el cuerpo y `1e-4` para la cabeza, batch 8 con acumulacion de gradiente 2, pesos en float32 bajo autocast bfloat16 y gradient checkpointing, con secuencias limitadas a 128 tokens. El coste fue de aproximadamente 61 minutos en una RTX 5090. Una segunda epoca empeoro el NLL de test (1,8704), por lo que se publica solo la primera. Las etiquetas de GoEmotions son proporciones de marcas de anotadores, no etiquetas duras, y se calibro una temperatura unica sobre un split reservado.

## Capacidades

- Clasificacion de emociones en texto en ingles: devuelve una distribucion de probabilidad sobre las 28 etiquetas de GoEmotions (admiration, gratitude, joy, anger, annoyance, etc.).
- Puntuacion calibrada: la salida es una prevision probabilistica, no una etiqueta unica; se puede umbralizar o usar directamente como score.
- Inferencia de una sola pregunta: responde exactamente a la instruccion para la que fue entrenado.
- No genera texto: no dispone de cabeza de lenguaje, por lo que no puede producir respuestas en lenguaje natural.
- Sin tool calling ni function calling: no hay soporte documentado.
- Sin capacidades de agente ni razonamiento multi-paso.
- Multilingue: no; solo ingles.
- Capacidades especiales: ninguna adicional (sin vision, audio ni modo thinking).

## Casos de uso

- Analisis de emociones en foros y comunidades tipo Reddit: el modelo esta entrenado sobre ese dominio y devuelve una distribucion calibrada sobre 28 emociones, util para medir el tono emocional agregado de hilos y subforos.
- Etiquetado automatico y weak supervision de corpus: al producir probabilidades en lugar de etiquetas duras, sirve para pre-anotar grandes volumenes de comentarios que luego se revisan o se usan como señal de entrenamiento para otros modelos.
- Triaje de comentarios negativos para revision humana: las etiquetas de anger, annoyance o disapproval permiten priorizar colas de moderacion, siempre con supervision humana dado que el propio autor advierte que no es una herramienta de moderacion.
- Analisis de feedback de producto y encuestas abiertas: clasificar respuestas de texto libre en ingles para separar gratitude, disappointment o confusion y alimentar paneles de satisfaccion.
- Investigacion en psicologia computacional y linguistica: la salida probabilistica y calibrada permite estudiar distribuciones emocionales, comparar anotadores humanos frente al modelo y analizar desacuerdos con una metrica propia (NLL, Brier).
- Monitorizacion de soporte al cliente: detectar el tono emocional de tickets o mensajes en ingles para enrutar casos de frustracion hacia agentes humanos.
- Analisis de engagement en comunidades: identificar comentarios con emociones positivas (gratitude, joy, excitement) para estudios de dinamica social o para destacar contribuciones.
- Evaluacion de modelos de analisis emocional: sirve como linea base reproducible con licencia Apache-2.0 y receta de entrenamiento documentada para comparar con otras aproximaciones.

## Benchmarks y rendimiento

Datos del split de test de GoEmotions (5.884 comentarios; los objetivos son la proporcion de marcas por etiqueta), calibrados con una temperatura ajustada en un split reservado. Fuente: BENCHMARKS.md, seccion 10.

| Modelo | NLL | Brier | Accuracy | ECE |
|---|---|---|---|---|
| este modelo (semilla 17, una epoca) | 1,8435 | 0,2142 | 0,5648 | 0,135 |
| misma receta, tres semillas | 1,8417 ± 0,0019 | 0,2134 ± 0,0011 | 0,5587 ± 0,0092 | 0,116 ± 0,017 |
| `answerdotai/ModernBERT-base` con readout de marcador de Exu, tres epocas, tres semillas | 1,8549 ± 0,0119 | 0,2174 | 0,5542 | 0,102 |
| `google-bert/bert-base-uncased`, misma configuracion | 1,8676 ± 0,0076 | 0,2195 | 0,5514 | 0,110 |
| prior de frecuencia de etiquetas (sin modelo) | 2,8267 | no disponible | 0,2927 | no disponible |

NLL y Brier son reglas de puntuacion estrictamente propias y son las metricas que el autor recomienda comparar. La accuracy se calcula contra la etiqueta mayoritaria de cada comentario; con objetivos suaves, un pronostico perfectamente honesto sigue presentando un ECE distinto de cero.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 3 GB libres en GPU, segun el propio autor. El repositorio ocupa 2,4 GB y los pesos estan en float32 (596 M de parametros).
- GPU recomendadas: cualquier GPU con 3 GB o mas de memoria libre; el entrenamiento se realizo en una unica RTX 5090.
- Compatibilidad con GPU de consumo: si, cabe en practicamente cualquier GPU de consumo actual (RTX 3060 en adelante) e incluso en equipos con GPUs mas modestas.
- CPU: es posible ejecutarlo en CPU, aunque el autor lo describe como lento; hay que tener en cuenta que cada comentario requiere 28 pasadas por el cuerpo del modelo.
- Opciones de despliegue: el unico runtime publicado es `exu_probe_infer.py`, incluido en el repositorio, que construye las 28 secuencias, ejecuta el cuerpo, aplica la cabeza y la temperatura ajustada de `config.json`. Requiere `torch`, `transformers` y `safetensors`. No hay soporte para vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo generativo y su cabeza es especifica.
- Latencia y throughput: no disponible. El unico dato temporal publicado es el entrenamiento (46.370 comentarios en una epoca, aproximadamente 61 minutos en una RTX 5090), que no es directamente extrapolable a inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto de entrenamiento | NLL (GoEmotions test) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| exu-qwen3-0.6b-goemotions | 596 M | 128 tokens | 1,8435 (una semilla) / 1,8417 ± 0,0019 (tres semillas) | Apache-2.0 | HuggingFace, formato de sonda propio |
| `answerdotai/ModernBERT-base` con readout de Exu | aproximadamente 149 M | no disponible | 1,8549 ± 0,0119 | Apache-2.0 (modelo base) | HuggingFace; requiere el toolkit Exu |
| `google-bert/bert-base-uncased` con readout de Exu | aproximadamente 110 M | no disponible | 1,8676 ± 0,0076 | Apache-2.0 (modelo base) | HuggingFace; requiere el toolkit Exu |
| prior de frecuencia de etiquetas | no aplica | no aplica | 2,8267 | no aplica | no aplica |

No se dispone de datos de contexto de los modelos comparados en la informacion proporcionada.

## Limitaciones y advertencias

- Formato de sonda de investigacion: la version 0.1.0 del paquete `exu-base` no puede cargar estos pesos, porque sus checkpoints son modelos encoder con readout de marcador. La via decoder esta planificada para una version posterior y el modelo se republicara entonces.
- Una sola pregunta: fue entrenado con exactamente una instruccion y una lista de opciones. Aunque el diseno de Exu permite en teoria formular preguntas en tiempo de peticion, este checkpoint solo ha visto una y no hay mediciones de su comportamiento con otras.
- No es una herramienta de moderacion ni clinica: GoEmotions son comentarios de Reddit etiquetados por anotadores crowdsourced, con los sesgos que ello implica y con el lenguaje propio de esa plataforma.
- Una epoca y una semilla: aunque las tres semillas de la receta concuerdan dentro de 0,004 de NLL, no se ajusto ni comprobo nada mas alla de eso.
- Idioma: solo ingles. No hay soporte documentado para otros idiomas.
- Longitud: las secuencias se limitaron a 128 tokens durante el entrenamiento, lo que restringe el analisis de comentarios largos.
- Calibracion: el ECE de 0,135 (una semilla) y 0,116 ± 0,017 (tres semillas) indica que las probabilidades no son perfectamente calibradas, especialmente con objetivos suaves.
- Riesgo de alucinacion: no aplica en el sentido generativo, porque el modelo no produce texto; el riesgo equivalente es una asignacion de emocion incorrecta o sesgada en textos fuera de distribucion.
- Licencia: Apache-2.0, sin restricciones conocidas para uso comercial. La limitacion practica no es legal sino tecnica (formato no cargable por las herramientas habituales).
- Dominio: entrenado exclusivamente con comentarios de Reddit en ingles; el rendimiento fuera de ese registro no esta medido.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Ruivalim/exu-qwen3-0.6b-goemotions
- Modelo base Qwen3-0.6B: https://huggingface.co/Qwen/Qwen3-0.6B
- Dataset GoEmotions: https://huggingface.co/datasets/google-research-datasets/go_emotions
- Toolkit Exu: https://github.com/ruivalim/exu-base
- Benchmarks del toolkit (seccion 10): https://github.com/ruivalim/exu-base/blob/main/BENCHMARKS.md
- Script de inferencia incluido en el repositorio: `exu_probe_infer.py`
- Nota: la busqueda web realizada no devolvio resultados relevantes sobre este modelo; los enlaces anteriores proceden de la model card y de la informacion del repositorio de HuggingFace.
