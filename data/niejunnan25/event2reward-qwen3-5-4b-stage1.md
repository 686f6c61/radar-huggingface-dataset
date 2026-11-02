# niejunnan25/Event2Reward-Qwen3.5-4B-Stage1

## Resumen

Event2Reward-Qwen3.5-4B-Stage1 es un modelo de estimacion de recompensa para robotica desarrollado por Junnan Nie y colaboradores, presentado en el articulo "Event2Reward: Learning Robotic Rewards from Progress Relations" (arXiv:2610.39212). Se construye sobre el modelo de lenguaje Qwen3.5-4B, al que se anaden dos cabezas especificas: una cabeza de progreso de 101 bins y una cabeza de tendencia de tres clases. El modelo estima el progreso de una tarea de manipulacion robotica a partir de una descripcion textual, el primer frame del episodio, un frame objetivo de otro episodio exitoso y una secuencia de frames recientes.

El modelo resuelve el problema de la definicion de funciones de recompensa en aprendizaje por refuerzo robotico: en lugar de disenar recompensas manualmente, Event2Reward aprende una senal de progreso a partir de relaciones temporales entre observaciones. Este checkpoint concreto es la etapa de preentrenamiento (Stage1), inicializada con etiquetas temporales sobre aproximadamente 20.000 horas de demostraciones roboticas y videos de manipulacion humana, y corresponde al paso 50.000 de un schedule de 500.000 pasos.

Es relevante ahora porque ofrece una alternativa escalable a las funciones de recompensa artesanales en pipelines de RL robotico, aprovechando el conocimiento de un LLM de 4B parametros y una ventana de contexto que permite incorporar historial visual de la ejecucion. El checkpoint Stage1 sirve como inicializacion para Stage2, que es el recomendado por el autor para puntuar episodios o hacer fine-tuning en tareas nuevas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3.5-4B) con cabeza de progreso de 101 bins y cabeza de tendencia de tres clases |
| Parametros totales | 4B (modelo base Qwen3.5-4B) |
| Parametros activos | no disponible (no es MoE segun la informacion proporcionada) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 (pesos publicados en BF16); no se documentan otras cuantizaciones |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-4B, un transformer denso de 4.000 millones de parametros, y le anade dos cabezas de prediccion: una cabeza de progreso con 101 bins discretos y una cabeza de tendencia de tres clases. La entrada combina la descripcion textual de la tarea, el primer frame del episodio, un frame objetivo extraido de otro episodio exitoso y un historial de cinco frames recientes separados 0,25 s (en Stage1). Esta formulacion convierte la estimacion de recompensa en una tarea multimodal de prediccion de progreso relativo entre el estado inicial, el estado actual y un estado objetivo.

El preentrenamiento utiliza etiquetas temporales sobre aproximadamente 20.000 horas de demostraciones roboticas y videos de manipulacion humana. El checkpoint publicado corresponde al paso 50.000 de un schedule de 500.000 pasos, por lo que se trata de un modelo parcialmente entrenado pensado como inicializacion de Stage2. No se detalla en la informacion disponible si se emplearon tecnicas de RLHF, DPO u otras optimizaciones posteriores, ni la composicion exacta del dataset mas alla de las horas totales.

## Capacidades

- Estimacion de progreso de tarea robotica: predice un valor de progreso discretizado en 101 bins a partir de observaciones visuales y una descripcion textual.
- Prediccion de tendencia: emite una clasificacion de tres clases sobre la evolucion del episodio (cabeza auxiliar, no validada como detector de eventos).
- Razonamiento multimodal sobre secuencias de frames: procesa un historial de cinco imagenes recientes junto con frames de inicio y objetivo.
- Condicionamiento por lenguaje natural: la tarea se especifica mediante una cadena de texto, lo que permite reutilizar el modelo en distintas tareas sin reentrenamiento especifico de la cabeza.
- Integracion en pipelines de robotica: se carga mediante `Event2Reward.from_pretrained` una vez publicado el codigo.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y multi-step reasoning: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Capacidades especiales: cabezas de progreso y tendencia especificas para robotica; no se documentan vision general, audio ni modo thinking.

## Casos de uso

- Puntuacion de episodios de manipulacion robotica: el modelo recibe la descripcion de la tarea, el primer frame, un frame objetivo de otro episodio exitoso y el historial reciente, y devuelve una estimacion de progreso util para filtrar o clasificar demostraciones en un dataset de entrenamiento.
- Inicializacion para fine-tuning en tareas nuevas: al ser Stage1, se usa como punto de partida para entrenar Stage2 sobre una tarea concreta, aprovechando las 20.000 horas de preentrenamiento temporal.
- Senal de recompensa densa en RL robotico: la salida de progreso puede emplearse como recompensa intermedia en algoritmos de aprendizaje por refuerzo, sustituyendo funciones de recompensa disenadas a mano.
- Evaluacion automatica de politicas: durante la evaluacion de una politica entrenada, el modelo puede estimar el progreso de cada episodio y agregar metricas de avance por tarea sin intervencion humana.
- Curacion de datasets de video de manipulacion: dado un gran volumen de videos de manipulacion humana y robotica, el modelo permite puntuar y priorizar clips segun el progreso estimado hacia un objetivo.
- Analisis de fallos en produccion robotica: comparando la tendencia y el progreso estimado con el resultado real, se pueden identificar episodios donde la politica se estanca o retrocede, lo que facilita la depuracion.
- Investigacion en aprendizaje por imitacion: el progreso estimado puede usarse para ponderar muestras en entrenamiento por imitacion o para segmentar episodios largos en fases.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 8-9 GB para los pesos del modelo base de 4B, mas memoria adicional para activaciones y procesamiento de imagenes; el repositorio ocupa 9,1 GB.
- GPU recomendadas: A100, H100 o L40S para inferencia por lotes; RTX 4090 (24 GB) o RTX A6000 (48 GB) para inferencia en BF16 con margen.
- Cabe en GPU de consumo: si, en tarjetas con al menos 12-16 GB de VRAM en BF16; no se documentan versiones cuantizadas en la informacion disponible.
- Opciones de despliegue: la libreria propia `event2reward` mediante `Event2Reward.from_pretrained`; no se documenta soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Event2Reward-Qwen3.5-4B-Stage1 | 4B | no disponible | Estimacion de progreso/recompensa robotica | Apache-2.0 | HuggingFace (este repo) |
| Event2Reward-Qwen3.5-4B-Stage2 | 4B | no disponible | Estimacion de progreso/recompensa robotica | Apache-2.0 (segun modelo base) | HuggingFace (enlazado en la model card) |
| Qwen3.5-4B | 4B | no disponible | Modelo de lenguaje general | no disponible | HuggingFace |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- El progreso es una estimacion aprendida, no una probabilidad de exito: puede disminuir, subestimar una tarea completada o sobreestimar una fallida, y no existe un umbral que separe exito de fracaso.
- La salida de tendencia es auxiliar y no ha sido validada como detector de eventos.
- Este checkpoint es Stage1 (paso 50.000 de 500.000) y no se le atribuye por si solo ningun resultado de politica del articulo; para puntuar episodios o hacer fine-tuning se recomienda Stage2.
- El frame objetivo nunca debe provenir del episodio que se esta puntuando.
- Stage1 se entreno con frames de historial separados 0,25 s (frente a 0,1 s en Stage2); usar otra cadencia puede degradar las predicciones.
- El modelo recorta siempre los frames a un cuadrado centrado, mientras que sus datos de entrenamiento cuadraron los frames por dataset de origen; conviene cuadrar previamente los frames de camaras no cuadradas.
- Al inicio de un episodio, debe repetirse el primer frame para completar el historial.
- El codigo de inferencia y fine-tuning aun no esta publicado (github.com/niejunnan25/Event2Reward), lo que limita su uso inmediato.
- No se documentan sesgos conocidos, idiomas soportados ni restricciones adicionales de la licencia Apache-2.0 mas alla de las condiciones estandar de atribucion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/niejunnan25/Event2Reward-Qwen3.5-4B-Stage1
- Stage2: https://huggingface.co/niejunnan25/Event2Reward-Qwen3.5-4B-Stage2
- Modelo base Qwen3.5-4B: https://huggingface.co/Qwen/Qwen3.5-4B
- Articulo: https://arxiv.org/abs/2610.39212
- Pagina del proyecto: https://niejunnan25.github.io/Event2Reward/
- Repositorio de codigo (proximamente): https://github.com/niejunnan25/Event2Reward
