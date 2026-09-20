# abdulhayykhan/AbdiSQL-1.0

## Resumen

AbdiSQL-1.0 es un modelo de lenguaje pequeno (SLM) especializado en traduccion de lenguaje natural a SQL, desarrollado por el usuario abdulhayykhan y publicado en Hugging Face. Se trata de un fine-tuning del modelo base Qwen/Qwen2.5-Coder-1.5B-Instruct, orientado exclusivamente al dialecto SQLite y disenado para generar consultas a partir de un esquema de base de datos y una pregunta en ingles. Forma parte de la denominada ABDI Platform, cuyo objetivo declarado es demostrar la eficiencia de la especializacion de dominio sobre hardware limitado.

El modelo cuenta con 1.540 millones de parametros (aproximadamente 3,09 GB en FP16) y fue ajustado mediante QLoRA de 4 bits sobre una unica GPU Tesla T4. El conjunto de entrenamiento procede del benchmark Spider (1.350 pares de entrenamiento y 150 pares de evaluacion reservados, distribuidos en 166 esquemas), lo que lo situa en la categoria de modelos compactos para tareas cerradas de generacion de codigo SQL.

Su relevancia actual radica en que ocupa un nicho muy concreto: la generacion de consultas SQLite en entornos con recursos escasos, donde un modelo de mayor tamano no seria viable. No obstante, las metricas publicadas por el propio autor muestran una ganancia modesta respecto al baseline zero-shot (+3,34 puntos porcentuales en exactitud de ejecucion) y una validez sintactica del 69,33%, datos que conviene interpretar con cautela antes de considerarlo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Qwen2.5-Coder-1.5B-Instruct) |
| Parametros totales | 1,54B |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no confirmada en la model card; el modelo base Qwen2.5-Coder-1.5B-Instruct soporta 32.768 tokens |
| Tipos de cuantizacion | no se publican pesos cuantizados; el fine-tuning se realizo con QLoRA de 4 bits (rank 8, alpha 16) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (formato por defecto de Hugging Face Transformers) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo Qwen2.5-Coder-1.5B-Instruct, un transformer decoder-only con atencion causal y soporte de chat template, sobre el que se aplico un ajuste fino supervisado mediante QLoRA de 4 bits. Los hiperparametros declarados son rango 8, alpha 16, learning rate 1e-4 y 2 epocas, con un consumo de recursos compatible con una GPU Tesla T4. No se menciona el uso de RLHF, DPO ni tecnicas de decodificacion especulativa en la informacion disponible.

El dataset de entrenamiento proviene del benchmark Spider en su version cross-database: 1.350 pares entrenamiento y 150 pares de evaluacion reservados, cubriendo 166 esquemas distintos. Se trata por tanto de un volumen de datos reducido, centrado en un unico dialecto (SQLite) y en un unico idioma (ingles). La especializacion de dominio es el eje del diseno, pero tambien implica una cobertura limitada de esquemas y de formulaciones de pregunta fuera de la distribucion de Spider.

## Capacidades

- Generacion de consultas SQLite a partir de un esquema de base de datos y una pregunta en lenguaje natural.
- Interpretacion de esquemas con tipos de columna, claves primarias y nombres de tablas incluidos en el prompt.
- Seguimiento de instrucciones mediante un system prompt especifico que define el rol de "AbdiSQL".
- Formato de conversacion multi-turno heredado del modelo base (chat template de Qwen).
- Generacion determinista opcional (por ejemplo, `do_sample=False`) para reducir variabilidad en la salida SQL.
- Capacidades generales de generacion de texto y codigo heredadas del modelo base, aunque no han sido evaluadas ni reentrenadas especificamente.
- Soporte de tool calling / function calling: no documentado en la model card.
- Capacidades de agente y razonamiento multi-paso: no documentadas.
- Capacidades multilingues: limitadas al ingles segun la etiqueta `language: en`.
- Capacidades especiales (modo thinking, vision, audio): no disponibles.

## Casos de uso

- Generacion de consultas SQLite en asistentes de analitica interna: el modelo recibe el esquema de la base de datos y la pregunta del analista, y devuelve la consulta SQL lista para ejecutar, reduciendo el tiempo de escritura manual en equipos pequenos.
- Prototipado rapido de interfaces de consulta en lenguaje natural: al pesar apenas 3,09 GB en FP16, puede desplegarse en una estacion de trabajo con GPU de gama media para demostraciones sin coste de API.
- Educacion y ensenanza de SQL: el modelo puede usarse como generador de ejemplos de consultas sobre esquemas didacticos, siempre con revision humana dado su nivel de exactitud.
- Preprocesamiento en pipelines de datos: integrado como paso previo que traduce solicitudes en lenguaje natural a SQL sobre bases SQLite embebidas en aplicaciones moviles o de escritorio.
- Automatizacion de informes sobre bases de datos locales: generacion de consultas de agregacion (sumas, medias, filtros por fecha) a partir de peticiones textuales en herramientas de BI ligeras.
- Base para investigacion sobre especializacion de dominio: sirve como punto de partida reproducible (QLoRA, T4, dataset Spider) para estudiar el impacto del ajuste fino en modelos de 1,5B parametros.
- Filtrado y validacion previa en herramientas de conversion de lenguaje natural a SQL: dado su bajo coste de inferencia, puede emplearse como primer generador cuyas salidas se validan y refinan con un modelo mayor.

## Benchmarks y rendimiento

Los unicos datos publicados proceden de la model card del autor. La evaluacion se realizo ejecutando el SQL generado contra bases SQLite reales y comparando los conjuntos de resultados con la verdad de referencia.

| Split | Exactitud de ejecucion | Validez sintactica |
|---|---|---|
| Baseline zero-shot (held-out) | 51,33% | no disponible |
| AbdiSQL-1.0 (held-out) | 54,67% (+3,34 puntos) | 69,33% |
| Spider dev set (sin tocar) | 47,00% | 62,00% |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni de otros benchmarks generales en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 3,1 GB en FP16 (solo pesos), en torno a 3,5-4,5 GB considerando el contexto y las activaciones; aproximadamente 1,6-2 GB con cuantizacion de 8 bits y en torno a 1-1,5 GB con cuantizacion de 4 bits (estimaciones calculadas a partir del tamano declarado, no publicadas por el autor).
- GPU recomendadas: Tesla T4 (la empleada en el entrenamiento), NVIDIA RTX 3060 12 GB, RTX 4060, RTX 4090, A100 o H100 para escenarios de alto throughput.
- Cabe en GPU de consumo: si. Una GPU con 4 GB o mas de VRAM puede ejecutar el modelo en FP16, y con 2 GB en cuantizacion de 4 bits. Tambien es viable en CPU con cuantizacion agresiva.
- Opciones de despliegue: Hugging Face Transformers (metodo documentado en la model card con `device_map="auto"` y `torch_dtype=torch.float16`), vLLM, TGI, llama.cpp u Ollama previa conversion a GGUF (no se publican pesos GGUF en el repositorio).
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Exactitud de ejecucion (held-out) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AbdiSQL-1.0 | 1,54B | no confirmada (base: 32.768 tokens) | 54,67% | apache-2.0 | Hugging Face |
| Qwen2.5-Coder-1.5B-Instruct (zero-shot) | 1,54B | 32.768 tokens | 51,33% | apache-2.0 | Hugging Face |
| Otros SLM especializados en text-to-SQL | no disponible | no disponible | no disponible | no disponible | no disponible |

El unico punto de comparacion con datos verificables en la informacion proporcionada es el propio modelo base sin ajustar, sobre el que AbdiSQL-1.0 obtiene una mejora de 3,34 puntos en el split reservado. No se dispone de resultados comparables con otras alternativas de la misma categoria.

## Limitaciones y advertencias

- Exactitud limitada: la exactitud de ejecucion en el conjunto de desarrollo de Spider es del 47,00% y la validez sintactica del 62,00%. Aproximadamente uno de cada tres SQL generados en ese split no es sintacticamente valido, lo que obliga a validacion y manejo de errores en produccion.
- Dialecto unico: el modelo solo genera SQLite. No debe asumirse transferencia a PostgreSQL, MySQL, SQL Server u otros dialectos sin un ajuste adicional.
- Idioma unico: entrenado y etiquetado unicamente en ingles. Las preguntas en castellano no estan soportadas de forma declarada.
- Riesgo de alucinacion de esquema: al tratarse de un modelo de 1,5B ajustado sobre 166 esquemas, puede inventar nombres de tablas o columnas no presentes en el esquema proporcionado, especialmente en esquemas largos o con nomenclatura inusual.
- Tamano de dataset reducido: 1.350 pares de entrenamiento limitan la generalizacion mas alla de la distribucion de Spider; el rendimiento en esquemas de dominio especifico puede degradarse.
- Sesgos: no se documenta ninguna evaluacion de sesgos en la informacion disponible. Al derivar de Qwen2.5-Coder, hereda los sesgos del modelo base y de los datos de preentrenamiento.
- Licencia: los pesos se distribuyen bajo Apache 2.0, lo que permite uso comercial. Conviene revisar de forma independiente los terminos de licencia del dataset Spider original, del que proceden los datos de ajuste.
- Adopcion nula: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validacion independiente por parte de la comunidad.
- Fecha de publicacion: el repositorio figura creado el 2026-09-20, posterior a la fecha de esta ficha; conviene verificar el estado real del repositorio antes de citarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/abdulhayykhan/AbdiSQL-1.0
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-1.5B-Instruct
- Benchmark Spider: https://yale-lily.github.io/spider

Nota: la busqueda web realizada no devolvio resultados relacionados con el modelo (los enlaces obtenidos corresponden a sitios de precios de oro en Bahrein y no guardan relacion con AbdiSQL-1.0). No se han encontrado papers, blogs, repositorios ni demos adicionales asociados al modelo en la informacion disponible.
