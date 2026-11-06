# efebaykara/Spark-X2.6-1.7B-Gundem-LoRA

## Resumen

Spark-X2.6-1.7B-Gundem-LoRA es un adaptador LoRA desarrollado por efebaykara sobre el modelo base XHToken/Spark-X2.6-1.7B (revision fijada en `3b9c837215b1a216ba48bca05607c8c509fef0d4`). Su proposito no es ser un asistente conversacional general, sino resolver una tarea concreta de procesamiento de lenguaje natural en turco: la clasificacion de titulares de noticias de actualidad ("gundem" en turco). El adaptador recibe unicamente un titular y devuelve una estructura con etiquetas tematicas, tipo de evento y tres puntuaciones enteras de impacto, gravedad y urgencia en el rango 0-3.

El modelo se entrena mediante destilacion de respuestas (response distillation): se generaron respuestas con DeepSeek que se usaron como supervision solo en el turno del asistente, sin emplear pesos ni logits del modelo profesor. El conjunto de datos es pequeno y especifico del dominio, con 825 ejemplos de entrenamiento, 107 de validacion y 101 de test. El adaptador mantiene el recuento de parametros del modelo base (1.707.657.216 parametros) y se distribuye como pesos PEFT en safetensors, ademas de una pareja de ficheros GGUF Q4_K_M para su uso en movil.

Es relevante ahora porque demuestra un flujo de trabajo reproducible de adaptacion de un modelo pequeno (1,7B) a una tarea periodistica concreta con recursos limitados, incluyendo herramientas de evaluacion propias (Gundem Score v1) y un cargador que gestiona la compatibilidad de arquitectura. Su utilidad queda acotada al dominio y al idioma turco.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (modelo base XHToken/Spark-X2.6-1.7B); adaptador LoRA (PEFT) |
| Parametros totales | 1.707.657.216 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (entrenamiento con max_length=512) |
| Tipos de cuantizacion | LoRA en safetensors (fusion fp32 en CPU, inferencia BF16 en CUDA); GGUF Q4_K_M para movil |
| Idiomas soportados | turco (tr) |
| Licencia | Apache 2.0 (modelo y tokenizer segun licencia upstream); codigo auxiliar Gundem bajo MIT |
| Formato de pesos | safetensors (adaptador PEFT) y GGUF (Q4_K_M) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre un transformer de 1,7B parametros mediante LoRA con rango 16 y alpha 32. El cargador suministrado (`release_infer.py`) gestiona la compatibilidad de arquitectura, fusiona el adaptador en fp32 sobre CPU y ejecuta la inferencia en BF16 sobre CUDA; el modelo base incluye codigo remoto que se ejecuta al cargarlo. El entrenamiento consistio en un ajuste supervisado solo sobre el turno del asistente (assistant-only SFT) usando respuestas generadas por DeepSeek como destilacion; no se usaron pesos ni logits del profesor y el numero de parametros del estudiante no cambia.

Los hiperparametros documentados son: 3 epocas, learning rate 0,0002, acumulacion de gradiente 8, max_length 512 y semilla 42. El conjunto de datos se divide en 825 ejemplos de entrenamiento, 107 de validacion y 101 de test. La tarea emplea una plantilla exacta y un fichero `student-system.txt`; la salida no esta restringida por una gramatica JSON, por lo que el modelo puede producir salidas invalidas (aunque en la evaluacion publicada no se observo ninguna).

## Capacidades

- Clasificacion de titulares de noticias turcas en etiquetas tematicas (`etiketler`).
- Identificacion del tipo de evento (`tur`).
- Puntuacion entera de impacto (`etki`), gravedad (`ciddiyet`) y urgencia (`aciliyet`) en rango 0-3.
- Generacion de texto condicionada a un unico titular de entrada y a un system prompt fijo.
- Inferencia en CUDA BF16 y en movil mediante GGUF Q4_K_M con el motor nativo Gundem.
- No es un asistente conversacional general ni soporta tool calling, agentes o vision segun la informacion disponible.

## Casos de uso

- Clasificacion automatica de titulares en un aggregador de noticias turco: el modelo asigna etiquetas tematicas y tipo de evento a cada titular entrante, permitiendo el enrutado a secciones o feeds especificos.
- Priorizacion de alertas editoriales: las puntuaciones de impacto, gravedad y urgencia permiten ordenar titulares para que la redaccion atienda primero los eventos mas criticos.
- Moderacion y triaje en plataformas de contenido: el modelo puede marcar titulares con alta gravedad o urgencia para revision humana antes de su publicacion.
- Analisis de tendencias tematicas: agregando las etiquetas generadas sobre un flujo de titulares se pueden construir series temporales de temas de actualidad.
- Despliegue en movil o dispositivos con recursos limitados: la variante GGUF Q4_K_M permite ejecutar la clasificacion en el propio dispositivo con el motor Gundem nativo.
- Investigacion sobre destilacion de respuestas: el repositorio incluye herramientas de entrenamiento y evaluacion que sirven de referencia para adaptar modelos pequenos a tareas periodisticas con supervision generada por un modelo mayor.
- Filtrado previo en pipelines de datos: el modelo puede etiquetar grandes volumenes de titulares antes de pasarlos a un modelo mayor o a un sistema de recuperacion.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---:|
| Gundem Score v1 | 81,7 / 100 |
| Exact match en todos los campos | 41,6% |
| Micro-F1 de temas | 92,7% |
| Precision de tipo | 89,1% |
| Salidas invalidas | 0 / 101 |

Condiciones de evaluacion: HF/CUDA BF16, decodificacion greedy, batch=4, maximo 160 tokens nuevos y sin gramatica JSON. El Gundem Score v1 se define como 30 x F1 de temas + 20 x precision de tipo + 30 x (1 - MAE medio de puntuaciones / 3) + 20 x exact match, con metricas fraccionarias. Mide la concordancia con las etiquetas del profesor en esta tarea concreta, no la inteligencia general del modelo ni un porcentaje de acierto. Las puntuaciones de la variante GGUF movil no se reevaluaron; los valores mostrados proceden del experimento HF/BF16.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 3,4 GB solo para los pesos del modelo base de 1,7B, mas overhead de activaciones y contexto.
- RAM de CPU: se requiere memoria suficiente para el modelo base completo en fp32 durante la fusion del adaptador (del orden de 6,8 GB o mas).
- GPU recomendadas: cualquier GPU con al menos 6-8 GB de VRAM para BF16; tarjetas consumer como RTX 3060, RTX 4060 o superiores son suficientes. A100/H100 no son necesarias.
- Despliegue en movil: ficheros GGUF Q4_K_M probados con el motor nativo Gundem.
- Opciones de despliegue: el cargador oficial `release_infer.py` con PyTorch CUDA; los GGUF pueden usarse con motores compatibles, aunque la model card solo menciona pruebas con el motor Gundem.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Spark-X2.6-1.7B-Gundem-LoRA | 1,7B | no disponible | Clasificacion de titulares turcos | Apache 2.0 | Hugging Face |
| XHToken/Spark-X2.6-1.7B (base) | 1,7B | no disponible | Generacion de texto general | segun upstream | Hugging Face |
| Modelos de clasificacion de noticias turcas especializados | no disponible | no disponible | Clasificacion | no disponible | no disponible |

La comparativa con alternativas de la misma categoria no esta disponible en la informacion proporcionada. El modelo base sin ajustar obtiene un Gundem Score v1 de 0,0 en la misma evaluacion, lo que refleja que la tarea requiere el ajuste.

## Limitaciones y advertencias

- El modelo solo maneja turco y esta especializado en titulares de noticias; no es un asistente general.
- El conjunto de datos es pequeno y especifico del dominio; deben inspeccionarse las predicciones antes de confiar en ellas en produccion.
- La generacion no esta restringida por una gramatica JSON, por lo que pueden aparecer salidas invalidas fuera de las condiciones de evaluacion.
- Los titulares en bruto, las respuestas del profesor y el conjunto de datos completo no se redistribuyen.
- El modelo base incluye codigo remoto que se ejecuta al cargarlo; debe revisarse antes de su uso.
- La licencia del modelo y del tokenizer sigue la licencia upstream; el codigo auxiliar Gundem es MIT, pero la licencia del modelo es independiente.
- Las diferencias pequenas en el test de una sola semilla no establecen superioridad; el tamano de batch y los cambios numericos en tiempo de ejecucion pueden alterar las salidas.
- Riesgo de sesgo y alucinacion: no documentado en la informacion disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/efebaykara/Spark-X2.6-1.7B-Gundem-LoRA
- Modelo base: https://huggingface.co/XHToken/Spark-X2.6-1.7B
- Herramientas de entrenamiento y benchmark: https://github.com/efebaykaraa/gundem-llms
- Modelos publicados: https://github.com/efebaykaraa/gundem-llms/releases/tag/models-v1.0.0
