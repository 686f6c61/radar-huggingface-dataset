# AaronTekle/SQLQwen

## Resumen

SQLQwen es un adaptador LoRA para generación Text-to-SQL construido sobre el modelo base Qwen2.5-Coder-0.5B-Instruct. Lo desarrolla AaronTekle y su propósito es especializar un modelo de código ligero en la traducción de peticiones en lenguaje natural a consultas SQL, tomando como entrada un esquema o contexto de base de datos. El problema que aborda es el de disponer de un generador SQL pequeño, entrenable y desplegable en hardware modesto, sin necesidad de recurrir a modelos de decenas de miles de millones de parámetros.

El modelo no es un modelo completo, sino un conjunto de pesos de adaptación PEFT (LoRA) que deben cargarse junto al modelo base Qwen2.5-Coder-0.5B-Instruct. La arquitectura subyacente es la de un transformer decoder-only de 0,5 mil millones de parámetros, con una longitud de contexto que no se detalla en la información disponible. El adaptador entrena únicamente 2.162.688 parámetros, un 0,4359 % del total, aplicando matrices de bajo rango a las proyecciones de atención q_proj, k_proj, v_proj y o_proj.

Su relevancia actual reside en la eficiencia: el entrenamiento completo se realizó en una NVIDIA GeForce RTX 3050, lo que demuestra que es posible adaptar un modelo de código a una tarea estructurada con recursos de consumo. Está pensado para prototipado, entornos con restricciones de VRAM y pipelines donde la latencia y el coste importan más que la precisión semántica máxima.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (modelo base Qwen2.5-Coder-0.5B-Instruct) con adaptadores LoRA |
| Parámetros totales | 496.195.456 (modelo base); 2.162.688 entrenables en el adaptador |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (el adaptador se distribuye en safetensors; el modelo base admite cuantizaciones estándar de la familia Qwen2.5) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); requiere el modelo base en safetensors |
| Rango LoRA | 16 |
| Alpha LoRA | 32 |
| Dropout LoRA | 0,05 |
| Módulos objetivo | q_proj, k_proj, v_proj, o_proj |
| Librería | peft |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen2.5-Coder-0.5B-Instruct, un transformer decoder-only de 0,5 mil millones de parámetros especializado en código. La adaptación LoRA congela los pesos originales e inserta matrices de bajo rango (r=16, alpha=32, dropout=0,05) en las cuatro proyecciones de atención. El entrenamiento se realizó con el SFTTrainer de TRL usando un objetivo de supervised fine-tuning completion-only, es decir, la pérdida se calcula únicamente sobre la completación SQL y no sobre el contexto de esquema ni la petición en lenguaje natural.

Los datos provienen del dataset sintético gretelai/synthetic_text_to_sql, del que se usan tres campos: `sql_context` (esquema o contexto de base de datos), `sql_prompt` (petición en lenguaje natural) y `sql` (consulta SQL de referencia). Se entrenó con 20.000 ejemplos de entrenamiento y 1.000 de validación, durante 2 épocas y 2.500 pasos de optimizador, alcanzando una pérdida final de entrenamiento de 0,2381 y una mejor pérdida de evaluación de 0,2198 en el checkpoint 2.400. La precisión de token en evaluación final fue del 93,54 %. No se documenta el uso de RLHF ni DPO; el proceso es exclusivamente SFT supervisado.

## Capacidades

- Generación de consultas SQL a partir de una petición en lenguaje natural y un esquema o contexto de base de datos proporcionado.
- Generación de código estructurado, heredada del modelo base Qwen2.5-Coder.
- Modo conversacional e instruct, según la etiqueta del modelo base.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible; el modelo está especializado en una tarea de un solo paso.
- Capacidades multilingües: no disponibles; no se especifican idiomas.
- Capacidades especiales (thinking mode, visión, audio): no disponibles.

## Casos de uso

- Asistente de consultas para analistas de datos: el modelo recibe el DDL de las tablas relevantes y una pregunta en lenguaje natural, y devuelve la consulta SQL lista para ejecutar. Es adecuado porque el entrenamiento con `sql_context` le enseña a condicionar la generación al esquema concreto.
- Prototipado de interfaces de consulta en lenguaje natural: integrado en una aplicación interna que permita a usuarios no técnicos preguntar sobre una base de datos, con validación sintáctica previa a la ejecución mediante SQLGlot.
- Generación de SQL en pipelines de datos: dado que el 100 % de las consultas generadas en la evaluación fueron sintácticamente válidas, puede usarse como primer paso de un flujo que valide y ejecute la consulta contra un motor real.
- Entrenamiento y experimentación con recursos limitados: sirve como caso de referencia para adaptar modelos de código con LoRA en una GPU de consumo (RTX 3050), útil en docencia, investigación aplicada o pruebas de concepto.
- Generación de consultas en entornos con restricciones de VRAM: al requerir solo el modelo base de 0,5B más un adaptador de pocos megabytes, es viable en portátiles y GPUs de gama baja donde un modelo mayor no cabría.
- Autocompletado de SQL en editores y herramientas de BI: puede sugerir consultas a partir del esquema activo y de la intención escrita por el usuario, con la ventaja de su baja latencia potencial.
- Aumento de datos para evaluación SQL: útil para generar borradores de consultas que luego se revisan o se comparan con implementaciones de referencia en tareas de benchmarking interno.

## Benchmarks y rendimiento

Los únicos datos publicados son los del entrenamiento y una evaluación de generación sobre 50 ejemplos retenidos.

| Métrica | Resultado |
|---|---|
| Ejemplos de entrenamiento | 20.000 |
| Ejemplos de validación | 1.000 |
| Épocas | 2 |
| Pasos de optimizador | 2.500 |
| Pérdida final de entrenamiento | 0,2381 |
| Mejor pérdida de evaluación | 0,2198 (checkpoint 2.400) |
| Pérdida final de evaluación | 0,2200 |
| Precisión de token en evaluación final | 93,54 % |
| Ejemplos de evaluación de generación | 50 |
| Exact-match accuracy | 28,0 % (14/50) |
| Validez sintáctica SQL | 100,0 % (50/50, validado con SQLGlot) |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, Spider, BIRD) en la información disponible. La precisión de ejecución contra bases de datos reales no fue medida.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base de 0,5B en precisión completa (fp16) ocupa aproximadamente 1 GB; en cuantización de 8 bits, en torno a 0,5 GB; en 4 bits, alrededor de 0,3 GB. El adaptador LoRA añade unos pocos megabytes. Estas cifras son estimaciones a partir del número de parámetros, no datos publicados.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM para fp16. Una RTX 3050 (la usada para el entrenamiento) es suficiente. Para mayor throughput, RTX 3060, RTX 4060, RTX 4090, A100 o H100, aunque el modelo es demasiado pequeño para aprovechar GPUs de centro de datos.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU de consumo moderna, e incluso en CPU para inferencia con llama.cpp si se convierte el modelo fusionado a GGUF.
- Opciones de despliegue: transformers con peft (carga del adaptador sobre el modelo base), vLLM y TGI tras fusionar el adaptador con el modelo base, llama.cpp u Ollama tras conversión a GGUF. La fusión del adaptador es necesaria para la mayoría de servidores de inferencia de alto rendimiento.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SQLQwen (este modelo) | 0,5B + LoRA (2,16M entrenables) | No disponible | Text-to-SQL | No disponible | HuggingFace, 16 descargas |
| Qwen2.5-Coder-0.5B-Instruct | 0,5B | No disponible en esta ficha | Código general e instruct | No disponible en esta ficha | HuggingFace |
| Qwen2.5-Coder-1.5B-Instruct | 1,5B | No disponible en esta ficha | Código general e instruct | No disponible en esta ficha | HuggingFace |
| CodeLlama-7B-Instruct | 7B | No disponible en esta ficha | Código general e instruct | No disponible en esta ficha | HuggingFace |

La comparación con alternativas especializadas en Text-to-SQL (por ejemplo, modelos ajustados sobre Spider o BIRD) no está disponible en la información proporcionada. SQLQwen se distingue por su tamaño reducido y por ser un adaptador, no un modelo completo, lo que implica que su rendimiento está acotado por el del modelo base de 0,5B.

## Limitaciones y advertencias

- El modelo puede alucinar tablas o columnas cuando el contexto de base de datos proporcionado está incompleto.
- El tamaño de 0,5B prioriza la ligereza de entrenamiento e inferencia sobre la capacidad de razonamiento; es previsible que falle en esquemas complejos, joins múltiples o consultas con lógica intrincada.
- El entrenamiento usa ejemplos sintéticos de Text-to-SQL, que pueden no representar todos los esquemas ni cargas de trabajo SQL del mundo real.
- La métrica de exact-match (28 %) es una comparación estricta a nivel de cadena y no refleja consultas semánticamente equivalentes; la precisión de ejecución real no se midió.
- No se ha evaluado la ejecución de las consultas contra bases de datos reales, por lo que la validez sintáctica del 100 % no garantiza corrección semántica.
- La licencia no está especificada, lo que impide confirmar si el uso comercial está permitido; además, la licencia del adaptador puede estar condicionada por la del modelo base Qwen2.5-Coder-0.5B-Instruct.
- No se especifican los idiomas soportados; el dataset de Gretel es mayoritariamente en inglés, por lo que el rendimiento en castellano es incierto.
- Es un adaptador, no un modelo autónomo: requiere cargar el modelo base y la librería peft, y no puede desplegarse de forma independiente sin fusionar los pesos.
- El repositorio tiene un tamaño de 0,0 GB y solo 16 descargas, lo que sugiere una validación comunitaria muy limitada.
- No se han publicado datos de sesgos, robustez frente a inyección de prompts SQL ni comportamiento ante esquemas malformados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/AaronTekle/SQLQwen
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-0.5B-Instruct
- Dataset de entrenamiento: https://huggingface.co/datasets/gretelai/synthetic_text_to_sql
- Paper de LoRA (arXiv:2106.09685): https://arxiv.org/abs/2106.09685
- Paper de Qwen2.5-Coder (arXiv:2409.12186): https://arxiv.org/abs/2409.12186
