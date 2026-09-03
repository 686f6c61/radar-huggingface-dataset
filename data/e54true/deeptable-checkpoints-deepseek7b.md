# e54true/deeptable-checkpoints-deepseek7b

## Resumen

DeepTable es un conjunto de adaptadores PEFT (LoRA) entrenados sobre el modelo base DeepSeek-LLM-7B-Chat, diseñados específicamente para la tarea de *table question answering* (TQA), es decir, responder preguntas en lenguaje natural sobre datos estructurados en tablas. El repositorio publica 48 checkpoints que corresponden a las variantes del artículo "DeepTable: Structural Attention Biases and Tree Path Encoding for Hierarchical Table Understanding", cubriendo cuatro benchmarks estándar (HiTab, WikiTQ, FeTaQA y TabFact) y cuatro semillas por configuración.

La relevancia de este proyecto radica en que aborda una limitación conocida de los LLM generalistas: su dificultad para comprender la estructura jerárquica y las relaciones entre celdas en tablas complejas. DeepTable introduce dos mecanismos novedosos: *Structural Attention Biases* (SAB), que inyecta información de posición relativa entre filas y columnas en la atención, y *Tree Path Encoding* (TPE), que codifica la ruta jerárquica de cada celda dentro del árbol semántico de la tabla. Al tratarse de adaptadores LoRA apilados, el enfoque es eficiente en términos de parámetros entrenables (rank 8 sobre las proyecciones k y v) y no requiere modificar los pesos del modelo base.

El repositorio es relevante para investigadores y desarrolladores que trabajan en comprensión de tablas, ya que proporciona artefactos reproducibles, predicciones de test ya generadas para verificación, y una documentación detallada sobre la configuración de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (DeepSeek-LLM-7B-Chat) con adaptadores LoRA apilados |
| Parametros totales | 7B (modelo base) + adaptadores LoRA (rank 8) |
| Parametros activos | no disponible (no es MoE; los adaptadores anaden un numero reducido de parametros) |
| Longitud de contexto | no disponible (heredada del modelo base DeepSeek-LLM-7B-Chat) |
| Tipos de cuantizacion | no disponible (los adaptadores se distribuyen en safetensors sin cuantizar) |
| Idiomas soportados | no disponible (depende del modelo base; el README no especifica) |
| Licencia | MIT (adaptadores); el modelo base DeepSeek-LLM-7B-Chat y TableLoRA tienen licencias propias |
| Formato de pesos | safetensors (adaptadores PEFT: P_TUNING y LORA) |

## Arquitectura y entrenamiento

DeepTable se construye sobre DeepSeek-LLM-7B-Chat, un modelo transformer autoregresivo de 7.000 millones de parametros. Los adaptadores siguen el diseño de TableLoRA, que apila dos adaptadores PEFT: un adaptador de *prompt tuning* (P_TUNING) que aprende los embeddings de los tokens especiales `[TAB]`, `[ROW]` y `[CELL]`, y un adaptador LoRA (rank 8) sobre las proyecciones `k_proj` y `v_proj` de la atencion. Ambos son necesarios para el funcionamiento correcto; cargar solo uno degrada el rendimiento.

Sobre esta base, DeepTable anade dos mecanismos: SAB (*Structural Attention Biases*), que introduce sesgos escalares en la matriz de atencion basados en las posiciones relativas de filas y columnas, y TPE (*Tree Path Encoding*), que codifica la ruta de cada celda en el arbol semantico de la tabla mediante tablas de embeddings. El entrenamiento se realizo con una tasa de aprendizaje base de 5e-6 con decaimiento coseno durante 3 epocas, y un multiplicador de tasa de aprendizaje de 1000 para los parametros SAB/TPE. Los datos de entrenamiento son los splits de entrenamiento de HiTab, WikiTQ, FeTaQA y TabFact, sin informacion publica sobre el volumen total de tokens.

## Capacidades

- Respuesta a preguntas en lenguaje natural sobre tablas estructuradas (TQA), incluyendo tablas jerarquicas con multiples niveles de cabecera.
- Verificacion de hechos sobre tablas (TabFact), es decir, determinar si una afirmacion es verdadera o falsa a partir de los datos tabulares.
- Generacion de respuestas con texto libre apoyandose en contenido de tablas (FeTaQA), no limitandose a extraer celdas.
- Razonamiento numerico y comparativo sobre datos tabulares, como calcular agregados o comparar valores entre filas y columnas.
- Soporte para los tres formatos de prompt de TableLoRA (`[TAB]`, `[ROW]`, `[CELL]`), que estructuran la serializacion de la tabla para el modelo.
- Capacidad de reproducir resultados de test sin re-ejecutar inferencia, gracias a las predicciones guardadas en cada checkpoint.

## Casos de uso

- Analisis de informes financieros: el modelo puede responder preguntas sobre tablas de estados financieros (balance, cuenta de resultados) extrayendo valores concretos o calculando variaciones entre periodos, gracias a la codificacion jerarquica de TPE.
- Atencion al cliente con datos de producto: integrar el modelo en un chatbot que consulte tablas de inventario o precios, permitiendo responder preguntas como "¿que productos tienen stock inferior a 10 unidades?" sin escribir consultas SQL.
- Verificacion automatica de datos en periodismo de datos: usar TabFact para contrastar afirmaciones extraidas de articulos contra tablas oficiales (presupuestos, estadisticas), reduciendo errores de transcripcion.
- Generacion de resumenes tabulares: emplear FeTaQA para producir descripciones en lenguaje natural de tablas complejas, util en herramientas de inteligencia de negocio para generar narrativas a partir de datos.
- Educacion y formacion: construir ejercicios interactivos donde el modelo responda preguntas sobre tablas de libros de texto (HiTab), ayudando a estudiantes a practicar comprension lectora de datos.
- Investigacion en IA: servir como punto de partida para estudios sobre comprension estructurada, comparando el rendimiento de SAB/TPE frente a otros mecanismos de atencion en tablas.

## Benchmarks y rendimiento

El README proporciona datos de HiTab para DeepSeek (exactitud por semilla y media):

| Config | seed 0 | seed 1 | seed 2 | seed 3 | media |
|---|---|---|---|---|---|
| `hitab_sabonly_seed{n}` | 53.79 | 51.58 | 51.20 | 51.64 | 52.05 |
| `hitab_full_seed{n}` | 53.28 | 51.01 | 50.44 | 50.06 | 51.20 |

Estos valores corresponden a la exactitud de respuesta en HiTab. El README indica que los resultados completos para WikiTQ, FeTaQA y TabFact estan en el articulo, pero no se incluyen en la informacion disponible. Tampoco se proporcionan comparativas con otros modelos en el README, aunque se menciona que los numeros de TableLoRA para DeepSeek y Llama-3 se citan del articulo original de TableLoRA. No se han publicado resultados de benchmarks en la informacion disponible mas alla de los mostrados.

## Requisitos de hardware

- VRAM estimada para inferencia: al ser un modelo de 7B con adaptadores LoRA, se requiere la VRAM del modelo base en precision FP16 (aproximadamente 14 GB) mas un pequeno overhead de los adaptadores. Con cuantizacion 4-bit, puede caber en GPUs con 8 GB de VRAM.
- GPUs recomendadas: NVIDIA RTX 3090/4090 (24 GB) para FP16 sin cuantizar; A100 (40/80 GB) para despliegues de mayor concurrencia.
- Si cabe en consumer GPU: si, en GPUs de 16 GB o mas con cuantizacion (por ejemplo, RTX 4080/4090).
- Opciones de despliegue: vLLM, llama.cpp, Ollama, Hugging Face TGI, o directamente con PEFT y transformers.
- Latencia y throughput estimados: no disponible en la informacion proporcionada; dependera del hardware y de la cuantizacion elegida.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento (HiTab) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DeepTable (DeepSeek-7B) | 7B + LoRA | no disponible | 51.20 (full) | MIT (adaptadores) | Hugging Face |
| TableLoRA (DeepSeek-7B) | 7B + LoRA | no disponible | citado en el articulo como 77.05 en TabFact | MIT | GitHub |
| TableLoRA (Llama-3-8B) | 8B + LoRA | no disponible | citado en el articulo | MIT | GitHub |
| DeepTable (Qwen2.5-7B) | 7B + LoRA | no disponible | no disponible en el README | MIT (adaptadores) | Hugging Face |

La comparativa se limita a lo citado en el README. No se dispone de datos suficientes para una comparacion cuantitativa completa entre estos modelos en los mismos benchmarks.

## Limitaciones y advertencias

- El modelo es un adaptador de investigacion, no un producto final. No se ha validado en entornos de produccion y puede presentar comportamientos impredecibles fuera de los dominios de entrenamiento.
- Depende de las limitaciones del modelo base DeepSeek-LLM-7B-Chat, incluyendo posibles sesgos y una longitud de contexto limitada que restringe el tamano de las tablas procesables.
- Los adaptadores deben cargarse mediante la ruta de codigo parcheada del repositorio DeepTable; una carga estandar con `PeftModel.from_pretrained()` no detecta el adaptador `default_1/` y degrada el rendimiento silenciosamente.
- La licencia MIT cubre solo los adaptadores; el modelo base y el mecanismo 2D-LoRA de TableLoRA tienen sus propias licencias que deben revisarse antes de un uso comercial.
- No se proporcionan datos de sesgos o alucinaciones especificos de este modelo; se recomienda evaluar en el dominio de aplicacion concreto antes de desplegar.
- Los resultados de HiTab muestran una caida de rendimiento de la variante full frente a SAB-only en DeepSeek (51.20 vs 52.05 de media), lo que sugiere que TPE puede no aportar beneficio en todos los escenarios.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/e54true/deeptable-checkpoints-deepseek7b
- Checkpoints para Llama-3-8B: https://huggingface.co/e54true/deeptable-checkpoints-llama3-8b
- Checkpoints para Qwen2.5-7B: https://huggingface.co/e54true/deeptable-checkpoints-qwen25-7b
- Repositorio de TableLoRA (Microsoft): https://github.com/microsoft/TableLoRA
- Repositorio de DeepSeek-LLM: https://github.com/deepseek-ai/DeepSeek-LLM
- Codigo de DeepTable: enlace pendiente de publicacion (indicado como TODO en el README)
