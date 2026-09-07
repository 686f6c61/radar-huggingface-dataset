# Pacific-i64/TR-HASH-MoE-1B-70B-Agentic-Pretraining

## Resumen

TR-HASH MoE 1B es un modelo de lenguaje causal basado en arquitectura Mixture-of-Experts (MoE) desarrollado por Pacific-i64. Se encuentra actualmente en fase de pretraining, con un total de 1.01 mil millones de parametros, 8 expertos enrutados (top-2) y una rama compartida. La longitud de contexto es de 16K tokens y el tokenizer tiene un vocabulario de 32K tokens. El objetivo declarado es entrenar con aproximadamente 70 mil millones de tokens. No es un modelo ajustado por instrucciones.

El modelo pertenece a la linea experimental TR-HASH, que segun la descripcion del modelo hermano TR-HASH-MOE-100M, utiliza un enrutado determinista basado en un hash balanceado de la identidad del token, evitando la necesidad de un router contextual aprendido. Esta innovacion es relevante para investigaciones sobre eficiencia en MoE y enrutado sin aprendizaje adicional. El repositorio contiene checkpoints distribuidos de entrenamiento, incluyendo estado del modelo y del optimizador, y los pesos de inferencia consolidados se publicaran al finalizar el entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE con 8 expertos enrutados (top-2) y rama compartida |
| Parametros totales | 1.01B |
| Parametros activos | no disponible |
| Longitud de contexto | 16K tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | ingles, frances |
| Licencia | other |
| Formato de pesos | no disponible (checkpoints de entrenamiento; pesos consolidados pendientes de publicacion) |

## Arquitectura y entrenamiento

La arquitectura es un transformer causal con capas MoE: cada capa contiene 8 expertos enrutados de los que se seleccionan 2 por token (top-2), junto con una rama compartida densa. El tokenizer tiene 32K entradas. Segun el modelo hermano TR-HASH-MOE-100M, esta linea experimental combina GQA con un camino MLP compartido denso y pequenos expertos residuales seleccionados por un hash determinista balanceado de la identidad del token. La ruta seleccionada se conoce sin evaluar un router contextual aprendido. Esta caracteristica es propia de la familia TR-HASH, aunque no se confirma explicitamente en la model card del modelo 1B.

Los datos de entrenamiento no se especifican en la informacion disponible. El pretraining esta en curso, con un objetivo de unos 70B tokens. El modelo no ha pasado por RLHF ni DPO, ya que no es un modelo instruido. El repositorio mantiene los tres ultimos checkpoints regulares mas el ultimo checkpoint de interrupcion, con un maximo de cuatro instantaneas.

## Capacidades

- Generacion de texto causal en ingles y frances, como modelo base sin ajuste por instrucciones.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni capacidades de agente.
- No incluye capacidades de vision ni audio.
- Al estar en pretraining, no sigue instrucciones ni mantiene conversaciones de forma util.
- El enrutado determinista por hash es una caracteristica experimental que puede influir en la especializacion de los expertos.

## Casos de uso

- Investigacion en enrutado de expertos: el modelo permite estudiar como un hash determinista afecta la distribucion de cargas entre los 8 expertos y la especializacion funcional de cada uno, en comparacion con MoE con routers aprendidos.
- Estudios de escalado de MoE: al tener 1.01B de parametros, resulta util para comparar dinamicas de entrenamiento entre un modelo denso equivalente y un modelo MoE con rama compartida, especialmente en las primeras etapas del pretraining.
- Analisis de activacion de expertos: se pueden medir la carga computacional y el numero de parametros activos por token con top-2 y shared branch, para evaluar la eficiencia en inferencia frente a modelos densos del mismo tamano.
- Pruebas de reanudacion de entrenamiento: los checkpoints distribuidos permiten experimentar con tecnicas de reanudacion y robustez de puntos de control en entornos de entrenamiento distribuido.
- Exploracion de tokenizers multilingues: el tokenizer de 32K tokens se puede evaluar en tareas de segmentacion de texto en ingles y frances, y analizar su cobertura y compresion.
- Reproduccion de experimentos en el framework Complexity: el modelo se puede integrar en el entorno de entrenamiento de Pacific-i64 para analizar metricas de perdida, uso de expertos y estabilidad numerica durante el pretraining.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 1.01B parametros en fp16, los pesos completos ocupan aproximadamente 2 GB. Con cuantizacion a 8 bits, podria reducirse a alrededor de 1 GB, aunque no hay cuantizaciones publicadas.
- GPU recomendadas: una GPU consumer con al menos 8 GB de VRAM, como una RTX 3060 12GB o superior, es suficiente para inferencia local. Para reanudar el entrenamiento se necesitaria mayor memoria, dado que el repositorio ocupa 60.8 GB e incluye estados de optimizador.
- Capacidad en consumer GPU: si, una vez publicados los pesos consolidados, el modelo puede ejecutarse en GPUs de gama media.
- Opciones de despliegue: actualmente no disponibles, ya que no hay pesos de inferencia consolidados. Tras la publicacion, se podria convertir a GGUF para usar con llama.cpp, o servirse con vLLM.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Arquitectura | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| TR-HASH-MoE-1B | 1.01B | 16K | MoE top-2 + shared branch | other | Checkpoints de entrenamiento en HuggingFace |
| TR-HASH-MOE-100M | 99.5M | no disponible | MoE con GQA y shared MLP | other | Peso completo en HuggingFace |
| Otros modelos MoE de 1B | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- No es un modelo instruido; no debe usarse para tareas de conversacion, asistentes ni seguimiento de instrucciones.
- El pretraining esta en progreso, por lo que las capacidades finales pueden variar respecto al estado actual.
- Sin benchmarks publicados, el rendimiento en tareas estandar (MMLU, HumanEval, GSM8K) es desconocido.
- La licencia "other" puede imponer restricciones no detalladas, incluido el uso comercial; se debe revisar la licencia original antes de cualquier despliegue.
- Solo soporta ingles y frances, sin evidencia de capacidades multilingues mas amplias.
- No soporta tool calling, agentes ni razonamiento multi-paso.
- El repositorio contiene checkpoints distribuidos con estados de optimizador, no pesos de inferencia listos para uso en produccion.
- Riesgo de alucinacion alto, al tratarse de un modelo base sin ajuste ni alineamiento.

## Enlaces

- HuggingFace: https://huggingface.co/Pacific-i64/TR-HASH-MoE-1B-70B-Agentic-Pretraining
- Modelo hermano TR-HASH-MOE-100M: https://huggingface.co/Pacific-i64/TR-HASH-MOE-100M
- Dentro del repositorio se referencia `training/README.md` para detalles sobre la receta de entrenamiento y reanudacion.
