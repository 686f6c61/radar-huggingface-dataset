# ApolloRaines/Llama-3.1-8B-Instruct-Context-Grounded-Analyst

## Resumen

Este modelo es una variante de Llama-3.1-8B-Instruct modificada mediante la técnica de ingeniería de representaciones denominada jBlaze, desarrollada por Apollo Raines. En lugar de aplicar fine-tuning, se extraen direcciones representacionales en el espacio de pesos usando análisis de activaciones contrastivas (SVD sobre pares de prompts) y se aplican proyecciones ortogonales. El resultado es un modelo que refuerza el anclaje en el contexto proporcionado y un comportamiento analítico más estructurado, manteniendo la arquitectura original de 8.000 millones de parámetros y la ventana de contexto de 128.000 tokens del modelo base.

La relevancia actual de esta ficha radica en que ejemplifica una línea de investigación emergente: la modificación del comportamiento de modelos de lenguaje sin coste de entrenamiento adicional, mediante intervenciones directas en los pesos. Aunque no se han publicado benchmarks independientes, el modelo demuestra en sus ejemplos de salida una mejora cualitativa en el razonamiento paso a paso y una mayor fidelidad al contexto, a la vez que conserva las capacidades de rechazo de contenido dañino del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LlamaForCausalLM (transformer decoder, 32 capas) |
| Parametros totales | 8.030.261.248 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 131.072 tokens (heredada de Llama-3.1-8B-Instruct) |
| Tipos de cuantizacion | safetensors en bf16 (pesos originales); no se proporcionan cuantizaciones alternativas |
| Idiomas soportados | ingles (unico idioma declarado en la model card) |
| Licencia | Llama 3.1 Community License |
| Formato de pesos | safetensors (bf16) |

## Arquitectura y entrenamiento

La arquitectura es identica a la de Llama-3.1-8B-Instruct: un transformer decoder causal con 32 capas, atencion por cabezas con RoPE y normalizacion RMSNorm. El modelo no fue sometido a entrenamiento adicional ni fine-tuning; los cambios de comportamiento provienen exclusivamente de la extraccion y modificacion de direcciones representacionales en el espacio de pesos mediante la herramienta jBlaze. El metodo consiste en realizar un analisis de activaciones contrastivas (SVD sobre pares de prompts que elicitan comportamientos opuestos) para identificar direcciones latentes, y luego aplicar una proyeccion ortogonal con un factor de amplificacion m (en este caso m=-0.5 para la direccion ctx_faith y m=-0.2 para la direccion analytical). La intervencion se aplico sobre el "brazo A3" (atencion y todas las capas MLP). No se han publicado detalles sobre el dataset utilizado para extraer las direcciones, ni sobre la composicion del corpus de entrenamiento original.

## Capacidades

- Generacion de texto fluida y coherente en ingles, con estilo conversacional del modelo base.
- Razonamiento paso a paso: el modelo muestra en los ejemplos una descomposicion explicita de operaciones (por ejemplo, multiplicaciones) antes de dar la respuesta final.
- Analisis de codigo: capaz de generar funciones de Python con docstrings y explicaciones estructuradas.
- Anclaje contextual: la direccion ctx_faith amplificada busca que las respuestas se basen estrictamente en el contexto proporcionado, reduciendo respuestas fuera de tema.
- Rechazo de solicitudes daninas: mantiene las salvaguardas del modelo base (por ejemplo, rechaza preguntas sobre como forzar cerraduras o afirmaciones pseudocientificas).
- Sin capacidades multimodales ni soporte de audio/vision (no se mencionan).
- No hay evidencia publica de soporte de tool calling o function calling mas alla de lo que el modelo base pudiera heredar; la model card no lo documenta.

## Casos de uso

- Asistente de programacion: el modelo puede generar funciones con explicaciones detalladas y razonamiento paso a paso, util para ensenar buenas practicas de codigo o para documentar algoritmos.
- Analisis de codigo legacy: gracias al anclaje contextual, puede recibir un fragmento de codigo como contexto y producir un analisis estructurado de su funcionamiento sin divagar.
- Resolucion de problemas matematicos en entornos educativos: la descomposicion paso a paso facilita la comprension de operaciones aritmeticas y algebraicas.
- Moderacion de contenido: mantiene el rechazo a solicitudes peligrosas, por lo que puede integrarse en sistemas de guardarrailes para filtrar peticiones inapropiadas.
- Chatbots de soporte tecnico: la direccion analitica favorece respuestas ordenadas y basadas en el contexto del ticket, mejorando la precision en entornos de atencion al cliente.
- Generacion de documentacion tecnica: dado su sesgo hacia respuestas estructuradas y fieles al contexto, es adecuado para resumir especificaciones o generar manuales a partir de una base de conocimiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas estandar (MMLU, HumanEval, GSM8K, etc.) ni comparaciones cuantitativas con el modelo base. Se desconoce si la intervencion jBlaze degrada o mejora el rendimiento en tareas generales; los unicos datos son ejemplos cualitativos de salida.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 16 GB (pesos) + overhead de activaciones y cache KV, por lo que se recomienda al menos 24 GB de VRAM para contexto largo.
- Con cuantizacion a 4 bits (no proporcionada por el autor, pero posible mediante herramientas externas como llama.cpp o GPTQ), la VRAM necesaria se reduce a unos 4-5 GB.
- GPUs recomendadas: NVIDIA RTX 3090, RTX 4090, A100, H100. En consumer, una RTX 4090 (24 GB) es suficiente para ejecutar el modelo en bf16 con contexto moderado.
- Opciones de despliegue: transformers (con device_map="auto"), vLLM, TGI, Ollama (si se convierte a GGUF), llama.cpp para CPU.
- Latencia y throughput: no se han publicado mediciones especificas. Como referencia, Llama-3.1-8B-Instruct en una RTX 4090 suele alcanzar entre 40 y 60 tokens por segundo con cuantizacion 4-bit; en bf16 la velocidad es menor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Metodo de modificacion | Disponibilidad |
|---|---|---|---|---|---|
| Llama-3.1-8B-Instruct (base) | 8.0B | 128K | Llama 3.1 Community | Fine-tuning supervisado + RLHF | HuggingFace |
| Este modelo (Context-Grounded Analyst) | 8.0B | 128K | Llama 3.1 Community | jBlaze (proyeccion de pesos) | HuggingFace |
| Mistral-7B-Instruct | 7.3B | 32K | Apache 2.0 | Fine-tuning supervisado | HuggingFace |
| Gemma-2-9B-it | 9.2B | 8K | Gemma License | Fine-tuning supervisado + RLHF | HuggingFace |

La comparativa se basa en parametros y contexto; no hay datos de rendimiento publicados para este modelo, por lo que no se puede establecer una comparacion objetiva en benchmarks. Su principal diferencia frente a los otros es la ausencia de entrenamiento adicional, lo que implica un coste de adaptacion practicamente nulo pero una validacion empirica limitada.

## Limitaciones y advertencias

- No se han publicado benchmarks ni evaluaciones independientes; el rendimiento real en tareas estandar es desconocido.
- La intervencion jBlaze puede degradar capacidades generales del modelo base, ya que modifica direcciones representacionales sin entrenamiento compensatorio.
- Solo soporta ingles de forma declarada; el rendimiento en otros idiomas no esta garantizado y probablemente sea inferior al del modelo base.
- La licencia Llama 3.1 Community License impone restricciones para usos comerciales con mas de 700 millones de usuarios mensuales y exige atribucion.
- El modelo no incluye cuantizaciones precalculadas; el usuario debe generarlas si necesita reducir el requisito de VRAM.
- No hay evidencia de soporte de tool calling, agentes o funciones avanzadas mas alla de lo que el base pudiera tener; la model card no lo menciona.
- Los ejemplos de salida mostrados son generados por el autor y no constituyen una validacion rigurosa del comportamiento en produccion.
- El metodo jBlaze es experimental y no cuenta con una comunidad amplia de usuarios ni documentacion extensa; su reproducibilidad depende de la herramienta original.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ApolloRaines/Llama-3.1-8B-Instruct-Context-Grounded-Analyst
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Repositorio de jBlaze: https://github.com/apolloraines/jblaze
- Documentacion oficial de Llama 3.1: https://github.com/meta-llama/llama3
