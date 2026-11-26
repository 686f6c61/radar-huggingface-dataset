# Gem1832/zils-lite-b1126

## Resumen

zils-lite-b1126 es un fine-tune del modelo newsbang/adjudex-0.8b-v4, que a su vez deriva de Qwen/Qwen3.5-0.8B. Lo desarrolla el usuario Gem1832 dentro de lo que la model card denomina "Zils subnet 127", un pool de modelos orientados a la toma de decisiones (decision-model). El modelo parte de una base de aproximadamente 853 millones de parametros y se ha especializado mediante un ajuste fino supervisado sobre datos de tareas de decision.

El problema que aborda es la clasificacion y resolucion de decisiones estructuradas a partir de datos tabulares o textuales de tareas, un nicho distinto del de los asistentes conversacionales genericos. La relevancia actual es limitada: el modelo no registra descargas ni interacciones, no publica resultados de evaluacion y su model card es extremadamente escueta, por lo que debe considerarse un artefacto experimental mas que un modelo listo para produccion.

La informacion disponible no permite confirmar la arquitectura exacta mas alla de que hereda la del modelo base Qwen3.5-0.8B y que conserva un tower de vision sin modificar. No se detallan la longitud de contexto efectiva, los idiomas soportados ni el regimen de entrenamiento completo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen/Qwen3.5-0.8B, no confirmada en detalle) |
| Parametros totales | 852.985.920 |
| Parametros activos | no disponible (no es un modelo MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tune del checkpoint newsbang/adjudex-0.8b-v4, que a su vez es un fine-tune de Qwen/Qwen3.5-0.8B. Segun la model card, el ajuste se realizo con una LoRA de rango 32 aplicada a las capas de lenguaje y posteriormente fusionada (merged), de modo que los pesos publicados incorporan ya la adaptacion. El tower de vision se mantiene sin cambios respecto al modelo de partida, lo que sugiere que la base conserva capacidad multimodal aunque el fine-tune no la modifique.

El entrenamiento utilizo aproximadamente 114.000 filas de decision ("decision rows") procedentes de tareas con licencia comercial (tasksource) y de elementos publicos del conjunto Zils Outcomes. No se especifica el numero total de tokens, la composicion exacta del dataset, ni si hubo fases de RLHF o DPO; tampoco se documentan innovaciones tecnicas adicionales como decodificacion especulativa o atencion lineal. La informacion sobre hiperparametros de entrenamiento, funcion de perdida y criterios de seleccion de checkpoints no esta disponible.

## Capacidades

- Toma de decisiones estructurada: el modelo esta especializado en resolver tareas de decision (decision-model) sobre filas de datos, presumiblemente clasificacion o seleccion de opciones.
- Generacion de texto y razonamiento basico: hereda las capacidades linguisticas del modelo base Qwen3.5-0.8B, aunque no se documenta su alcance.
- Capacidad multimodal potencial: el tower de vision se mantiene del modelo de partida, pero no se confirma que el fine-tune preserve un rendimiento util en tareas visuales.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponibles; la model card no declara idiomas.
- Modo thinking, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Clasificacion de decisiones en pipelines de datos: el modelo puede emplearse para etiquetar o resolver filas de tareas estructuradas, dado que se entreno especificamente sobre 114.000 filas de decision de tasksource y Zils Outcomes.
- Enrutamiento de tareas en sistemas internos: al ser un modelo pequeno (853 M de parametros) y con licencia Apache-2.0, puede desplegarse como clasificador de bajo coste para decidir que tarea o cola corresponde a cada entrada.
- Prototipado rapido de modelos de decision: su tamano reducido permite iterar en una sola GPU consumer, lo que lo hace util para experimentar con arquitecturas de adjudicacion antes de escalar a modelos mayores.
- Evaluacion comparativa de fine-tunes: sirve como referencia dentro del pool "d3-lite" para comparar el efecto de distintas estrategias de ajuste sobre la misma base adjudex-0.8b-v4.
- Investigacion sobre ajuste LoRA fusionado: al documentarse un rango 32 fusionado sobre capas de lenguaje, puede usarse para estudiar la degradacion o preservacion de capacidades del modelo base tras el fine-tune.
- Despliegue en entornos con restricciones de licencia: la licencia Apache-2.0 permite uso comercial sin las restricciones de otros modelos, siempre que se validen previamente sus resultados, dado que no hay benchmarks publicados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en precision fp16, aproximadamente 1,7 GB solo para pesos (el repositorio ocupa 1,7 GB); en cuantizacion de 8 bits, en torno a 0,9 GB, y en 4 bits, alrededor de 0,5 GB, mas el overhead de activaciones y cache KV.
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM para fp16 con contexto corto; una RTX 3060, RTX 4060 o superior es suficiente. Para mayor throughput, A10G, L4 o A100.
- Cabe en GPU consumer: si, en practicamente cualquier GPU consumer moderna (GTX 1660 6 GB en adelante), y tambien en CPU con llama.cpp si se generan pesos GGUF, que no se distribuyen en el repositorio.
- Opciones de despliegue: transformers con safetensors es la via directa; vLLM y TGI son compatibles si la arquitectura del modelo base lo permite (no confirmado); llama.cpp u Ollama requeririan conversion a GGUF, no disponible.
- Latencia y throughput estimados: no disponibles; al tratarse de un modelo de 853 M de parametros, la latencia esperada es baja en GPU, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| zils-lite-b1126 | 852.985.920 | no disponible | Apache-2.0 | Hugging Face, 0 descargas |
| newsbang/adjudex-0.8b-v4 (modelo base) | ~0,8 B (no confirmado) | no disponible | Apache-2.0 | Hugging Face |
| Qwen/Qwen3.5-0.8B (base original) | ~0,8 B (no confirmado) | no disponible | no disponible en esta ficha | Hugging Face |

No se dispone de datos de rendimiento para ninguno de los tres modelos en la informacion proporcionada, por lo que la comparativa se limita a parametros, licencia y disponibilidad. No se identifican alternativas de la misma categoria (decision-model de ~0,8 B) con datos verificables.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay resultados publicados de MMLU, HumanEval, GSM8K ni de tareas de decision, por lo que su calidad real es desconocida.
- Riesgo de alucinacion: al ser un fine-tune de un modelo de 0,8 B, la fiabilidad en razonamiento complejo es limitada y no se ha validado en produccion.
- Sesgos desconocidos: no se documenta la composicion del dataset de entrenamiento mas alla de tasksource y Zils Outcomes, ni se realizo (o al menos no se publico) una evaluacion de sesgos.
- Idiomas no declarados: la model card no especifica que idiomas soporta; no debe asumirse multilingueismo.
- Contexto no documentado: se desconoce la ventana de contexto efectiva tras el fine-tune.
- Capacidad multimodal incierta: el tower de vision se mantiene, pero no hay evidencia de que el fine-tune preserve su rendimiento.
- Madurez del artefacto: 0 descargas y 0 likes, creado y actualizado en el mismo minuto, sin documentacion adicional; debe tratarse como experimental.
- Licencia Apache-2.0: permite uso comercial, pero el autor no ofrece garantias ni soporte; la responsabilidad de validacion recae en el integrador.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Gem1832/zils-lite-b1126
- Modelo base: https://huggingface.co/newsbang/adjudex-0.8b-v4
- Modelo original de partida: https://huggingface.co/Qwen/Qwen3.5-0.8B
