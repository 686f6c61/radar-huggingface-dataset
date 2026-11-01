# Sofetizm/qwen1.5b-text2sql-lora

## Resumen

Sofetizm/qwen1.5b-text2sql-lora es un adaptador LoRA (Low-Rank Adaptation) publicado en HuggingFace y pensado para especializar el modelo base Qwen/Qwen2.5-1.5B-Instruct en la tarea de text-to-SQL, es decir, la traduccion de lenguaje natural a consultas SQL. El autor es el usuario Sofetizm y el repositorio contiene unicamente los pesos del adaptador (0,1 GB), no el modelo completo, por lo que su uso requiere cargar previamente el modelo base Qwen2.5-1.5B-Instruct y aplicar el adaptador mediante la libreria PEFT.

El modelo base Qwen2.5-1.5B-Instruct es un transformer decoder-only de 1.500 millones de parametros desarrollado por Alibaba Qwen, con una ventana de contexto nativa de 32.768 tokens (ampliable a 131.072 en la familia Qwen2.5). Al tratarse de un adaptador, las capacidades reales del modelo resultante dependen en gran medida del modelo base y de la calidad y volumen de los datos de entrenamiento del LoRA, datos que el autor no documenta en la model card.

La relevancia de esta ficha es limitada pero concreta: se trata de un adaptador de muy bajo coste computacional (entrenable e inferible en GPU de consumo) orientado a un caso de uso muy especifico como es la generacion de SQL a partir de preguntas en lenguaje natural. No obstante, la ausencia total de documentacion sobre datos de entrenamiento, evaluacion, licencia e idiomas hace que deba tratarse como un experimento y no como un componente listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder-only (Qwen2.5-1.5B-Instruct) |
| Parametros totales | 1.500 millones en el modelo base; el adaptador LoRA ocupa 0,1 GB en el repo |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la model card; el modelo base Qwen2.5-1.5B-Instruct soporta 32.768 tokens nativos |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; el modelo base admite cuantizacion GGUF, AWQ, GPTQ, etc.) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El artefacto publicado no es un modelo completo sino un adaptador LoRA que se aplica sobre Qwen2.5-1.5B-Instruct. La arquitectura subyacente es la del modelo base: un transformer decoder-only con atencion causal, normalizacion RMSNorm, activacion SwiGLU y embeddings rotatorios (RoPE), tal como corresponde a la familia Qwen2.5. El adaptador introduce matrices de bajo rango en determinadas capas del transformer, lo que permite especializar el modelo en text-to-SQL con un coste de entrenamiento muy reducido en comparacion con un fine-tuning completo.

No se dispone de informacion sobre el dataset de entrenamiento, el numero de tokens utilizados, la composicion de los datos, si se aplicaron tecnicas de RLHF o DPO, ni los hiperparametros concretos del LoRA (rango, alpha, capas objetivo). La model card es la plantilla por defecto de HuggingFace sin rellenar, y la unica referencia tecnica es la version de PEFT utilizada (0.21.2) y la cita generica al paper de Lacoste et al. (2019) sobre emisiones de carbono. No hay innovaciones tecnicas documentadas mas alla del propio uso de LoRA.

## Capacidades

- Generacion de consultas SQL a partir de descripciones en lenguaje natural, presumiblemente el objetivo del adaptador segun su nombre (text2sql).
- Generacion de texto y conversacion, heredadas del modelo base Qwen2.5-1.5B-Instruct.
- Razonamiento basico y comprension de instrucciones, limitados por el tamano del modelo base (1.500 millones de parametros).
- Soporte de tool calling y function calling: no documentado en la model card; el modelo base Qwen2.5-Instruct lo soporta, pero se desconoce si el adaptador lo preserva.
- Capacidades multilingues: no disponibles en la informacion proporcionada; el modelo base Qwen2.5 es multilingue (mas de 29 idiomas), pero el adaptador puede haber reducido ese soporte.
- Capacidades de agente y razonamiento multi-paso: no documentadas.
- Modo thinking, vision o audio: no disponibles.

## Casos de uso

- Generacion de SQL en herramientas internas de analitica: el adaptador puede convertir preguntas como "cuantos pedidos se cancelaron el mes pasado" en una consulta SQL, integrándose en un asistente para equipos de datos con esquemas de BD conocidos.
- Prototipado rapido de interfaces natural-language-to-query: al requerir solo 1,5B de parametros, puede desplegarse en una GPU de consumo para validar la viabilidad de un producto de consulta conversacional sobre bases de datos.
- Educacion y formacion en SQL: el modelo puede servir como generador de ejemplos de consultas a partir de enunciados, util en plataformas de aprendizaje, siempre que se valide la correccion de cada consulta.
- Automatizacion de informes sencillos: generacion de queries sobre un data warehouse para informes recurrentes, con revision humana previa a la ejecucion.
- Preprocesado en pipelines de datos: traduccion de instrucciones de negocio a SQL como paso intermedio en un flujo ETL asistido, con validacion sintactica posterior.
- Experimentacion e investigacion en adaptadores LoRA: el repositorio sirve como ejemplo de adaptador de bajo coste para estudiar el efecto del fine-tuning en tareas estructuradas con modelos pequenos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base en FP16 requiere aproximadamente 3 GB de VRAM; en cuantizacion de 4 bits (GGUF Q4_K_M o similar) baja a alrededor de 1 GB, a lo que se suma un margen pequeno para el adaptador y el contexto.
- GPU recomendadas: cualquier GPU consumer moderna con al menos 6-8 GB de VRAM (RTX 3060, RTX 4060, RTX 4070) es suficiente para FP16; GPUs de datacenter (A100, H100) no son necesarias y solo aportarian throughput.
- Cabe en GPU consumer: si, ampliamente, incluso en GPUs de gama baja con cuantizacion.
- Opciones de despliegue: transformers + PEFT para cargar el adaptador; vLLM y TGI soportan LoRA dinamico sobre el modelo base; llama.cpp y Ollama requieren fusionar el adaptador con el modelo base y convertir a GGUF.
- Latencia y throughput estimados: no disponibles; al tratarse de un modelo de 1,5B, en una RTX 4090 se esperan decenas de tokens por segundo, pero no hay mediciones publicadas para este adaptador concreto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Sofetizm/qwen1.5b-text2sql-lora | 1,5B (adaptador LoRA) | no disponible (base: 32.768) | text-to-SQL via LoRA | no disponible | HuggingFace, 0 descargas |
| Qwen/Qwen2.5-1.5B-Instruct | 1,5B | 32.768 | instrucciones generales | Apache 2.0 (segun el modelo base) | HuggingFace, ampliamente usado |
| Defog/sqlcoder-7b-2 | 7B | 16.384 | text-to-SQL especializado | CC BY-SA 4.0 | HuggingFace |
| NumbersStation/nsql-350M | 350M | 2.048 | text-to-SQL especializado | CC BY-NC 4.0 | HuggingFace |

La comparativa es orientativa: no hay datos de rendimiento publicados para el adaptador de Sofetizm, por lo que no puede establecerse una comparacion cuantitativa con alternativas especializadas en text-to-SQL.

## Limitaciones y advertencias

- La model card esta practicamente vacia: no hay informacion sobre datos de entrenamiento, evaluacion, licencia ni idiomas, lo que impide evaluar su calidad y su idoneidad para produccion.
- Licencia no especificada: no puede asumirse uso comercial sin consultar al autor y verificar la licencia del modelo base (Qwen2.5-1.5B-Instruct se distribuye bajo Apache 2.0, pero el adaptador no declara licencia propia).
- Riesgo de alucinacion elevado: al ser un modelo de 1,5B, la probabilidad de generar SQL sintacticamente valido pero semanticamente incorrecto (tablas o columnas inexistentes, joins erroneos) es alta.
- Sin benchmarks publicados: no hay evidencia de que el adaptador mejore al modelo base en tareas text-to-SQL; podria incluso degradar capacidades generales por sobreajuste.
- Capacidades multilingues no documentadas: no puede asumirse soporte del castellano ni de otros idiomas distintos del ingles.
- Contexto efectivo limitado por el modelo base (32.768 tokens nativos), insuficiente para esquemas de bases de datos muy grandes sin estrategias de recuperacion.
- Recomendacion: validar exhaustivamente cualquier SQL generado antes de ejecutarlo contra una base de datos real y no usar el modelo en entornos de produccion sin una evaluacion propia.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Sofetizm/qwen1.5b-text2sql-lora
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Paper de PEFT/LoRA (referenciado en los tags): https://arxiv.org/abs/1910.09700
- Libreria PEFT: https://github.com/huggingface/peft
- Calculadora de impacto ambiental citada en la model card: https://mlco2.github.io/impact
