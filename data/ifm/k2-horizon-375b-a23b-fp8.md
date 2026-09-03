# IFM/K2-Horizon-375B-A23B-FP8

## Resumen

K2-Horizon-375B-A23B-FP8 es la versión cuantizada en FP8 del modelo insignia de la familia K2-Horizon de IFM, una empresa que apuesta por la apertura total de sus modelos. Se trata de un modelo de lenguaje de texto únicamente, con arquitectura sparse Mixture-of-Experts (MoE) que almacena 375 mil millones de parámetros totales pero activa solo 23 mil millones por token. Esta característica permite un coste de inferencia relativamente bajo en comparación con un modelo denso del mismo tamaño, manteniendo una capacidad de conocimiento amplia.

El modelo destaca por su ventana de contexto nativa de 524.288 tokens (512K), orientada a tareas de razonamiento de largo horizonte y uso agéntico. IFM publica el checkpoint final, y promete liberar también los checkpoints intermedios, los datos de entrenamiento y el código de entrenamiento, lo que lo convierte en un candidato relevante para investigación y desarrollo en entornos que requieren transparencia total. La versión FP8 aquí descrita reduce el footprint de memoria y acelera la inferencia en hardware compatible, manteniendo un rendimiento cercano al modelo BF16 original.

La licencia Apache 2.0 permite uso comercial sin restricciones de atribución adicionales, lo que facilita su adopción en entornos empresariales. Sin embargo, su tamaño físico (390,6 GB en FP8) y el requisito de parallelismo de expertos limitan su despliegue a infraestructuras multi-GPU profesionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Sparse Mixture-of-Experts (MoE) con enrutamiento por token |
| Parametros totales | 379.167.159.168 (375B) |
| Parametros activos | 23B por token |
| Longitud de contexto | 524.288 tokens (512K) |
| Tipos de cuantizacion | FP8 (solo capas de expertos enrutados), BF16 (resto), disponible tambien en BF16 original |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only con sparse MoE. Los expertos enrutados tienen un tamaño intermedio de 1792, que no es divisible en bloques de cuantizacion de 128 a los tamanos de tensor parallelism habituales (TP=4 o TP=8), por lo que se requiere parallelismo de expertos para servir el modelo. Las capas de atencion, expertos compartidos, routers, las tres primeras capas densas y el lm_head se mantienen en BF16; solo las capas lineales de los expertos enrutados se cuantizan a FP8 estatico (pesos) y FP8 dinamico (activaciones).

IFM ha publicado los datasets de pre-entrenamiento y mid-training (IFM/K2-Horizon-Pretrain-Data e IFM/K2-Horizon-Midtrain-Data) y el codigo de entrenamiento (xllm), aunque no se proporciona el numero total de tokens ni la composicion detallada del corpus. La ventana de contexto de 512K se introduce desde las etapas de mid-training. No se menciona el uso de RLHF o DPO; la informacion disponible no especifica el metodo de alineacion.

## Capacidades

- Generacion de texto y razonamiento de largo alcance gracias a la ventana de 512K tokens.
- Uso agéntico: tool calling, interaccion con terminal y ejecucion de flujos de trabajo de multiples pasos (long-horizon workflows).
- Rendimiento competitivo con modelos abiertos de hasta 2,6 veces su tamano en benchmarks de agencia y herramientas.
- Capacidad multilingue no declarada; el modelo esta entrenado principalmente en ingles.
- No se mencionan capacidades de vision, audio ni multimodalidad.
- Soporte de decodificacion especulativa no confirmado en la informacion disponible.

## Casos de uso

- Agentes autonomos de codificacion: el modelo puede gestionar tareas complejas de desarrollo que requieren leer multiples archivos, ejecutar comandos de terminal y modificar codigo en varios pasos, gracias a su contexto largo y su capacidad de tool calling.
- Analisis de documentos extensos: procesamiento de contratos, informes financieros o articulos cientificos completos sin necesidad de dividirlos en fragmentos, manteniendo coherencia global del texto.
- Asistentes de soporte tecnico de nivel avanzado: resolucion de incidencias que requieren consultar bases de conocimiento amplias y seguir procedimientos de diagnostico en multiples turnos.
- Investigacion academica: estudio de la evolucion de capacidades durante el entrenamiento, ya que IFM liberara checkpoints intermedios y datos, permitiendo analisis de interpretabilidad y dinamicas de aprendizaje.
- Generacion de documentacion tecnica: redaccion de manuales, guias y especificaciones a partir de repositorios de codigo extensos, aprovechando la ventana de contexto para considerar todo el proyecto.
- Prototipado de sistemas RAG con contexto ultralargo: integracion en pipelines de recuperacion donde el modelo debe procesar grandes volumenes de informacion recuperada en una sola pasada.

## Benchmarks y rendimiento

La model card menciona comparaciones cualitativas con modelos abiertos (Nemotron 3 Ultra, Inkling, MiniMax-M3, GLM 5.2) y cerrados (GPT 5.6 Luna, GPT 5.6 Terra, Claude Sonnet5), indicando que K2-Horizon-375B-A23B es competitivo en tareas agénticas, pero no se han proporcionado los valores numericos de los benchmarks (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. No se pueden reportar cifras concretas sin riesgo de inventar datos.

## Requisitos de hardware

- El repositorio FP8 ocupa 390,6 GB, lo que implica un requisito minimo de VRAM de aproximadamente 400 GB para cargar los pesos completos en memoria.
- Se requiere un cluster multi-GPU profesional. Por ejemplo, 8x NVIDIA H100 80GB (640 GB totales) o 8x A100 80GB (640 GB) serian suficientes para alojar el modelo con margen para activaciones y KV cache.
- No cabe en ninguna GPU de consumo (RTX 4090, 5090, etc.) de forma individual.
- El parallelismo de expertos es obligatorio debido al tamano del tensor intermedio de los expertos (1792), que no es compatible con tensor parallelism TP=4 o TP=8 para cuantizacion FP8. Esto limita las opciones de despliegue.
- Frameworks compatibles: vLLM (con soporte de expert parallelism), TGI, o el codigo de entrenamiento xllm. Para cuantizacion adicional, se podria usar llama.cpp o GGUF, pero no se proporcionan versiones GGUF en el repositorio.
- Latencia y throughput: no se han publicado datos especificos. Se espera un rendimiento razonable para un MoE de 23B activos, pero la infraestructura necesaria es considerable.

## Comparativa con modelos similares

| Modelo | Parametros totales | Activos | Contexto | Licencia | Cuantizacion |
|---|---|---|---|---|---|
| K2-Horizon-375B-A23B | 375B | 23B | 512K | Apache 2.0 | FP8/BF16 |
| Mixtral 8x22B | 141B | 39B | 64K | Apache 2.0 | BF16/FP8 |
| DeepSeek-V3 | 671B | 37B | 128K | MIT | BF16/FP8 |

K2-Horizon ofrece un contexto muy superior (512K frente a 64K o 128K) y una proporcion de parametros activos menor que Mixtral 8x22B, lo que reduce el coste por token. DeepSeek-V3 tiene mas capacidad total y un contexto de 128K, pero su licencia MIT es mas permisiva que Apache 2.0 (aunque ambas permiten uso comercial). No se dispone de datos de rendimiento comparativos en la informacion proporcionada.

## Limitaciones y advertencias

- Idioma: el modelo esta entrenado principalmente en ingles; su rendimiento en otros idiomas no esta garantizado.
- Requisitos de infraestructura: el despliegue requiere un cluster de GPUs con al menos 400 GB de VRAM y soporte de parallelismo de expertos, lo que excluye entornos de desarrollo locales.
- Riesgo de alucinacion: como todo LLM, puede generar informacion falsa o inconsistente, especialmente en tareas creativas o de conocimiento no cubierto.
- Sesgos: no se han publicado evaluaciones de sesgo ni de seguridad; se recomienda realizar pruebas especificas antes de uso en produccion.
- Cuantizacion FP8 parcial: solo los expertos enrutados estan en FP8; el resto del modelo permanece en BF16, lo que implica que el ahorro de memoria no es total y la aceleracion depende del hardware.
- Dependencia de hardware FP8: para aprovechar la cuantizacion se necesitan GPUs con soporte nativo de FP8 (H100, H200, etc.); en GPUs sin este soporte, el modelo podria no ejecutarse o requerir conversion.
- Disponibilidad de datos: aunque IFM promete liberar datos y codigo, al momento de esta ficha solo se ha publicado el checkpoint final y los datasets referenciados; la documentacion completa de entrenamiento aun no esta disponible.

## Enlaces

- Repositorio HuggingFace del modelo FP8: https://huggingface.co/IFM/K2-Horizon-375B-A23B-FP8
- Repositorio HuggingFace del modelo BF16 original: https://huggingface.co/IFM/K2-Horizon-375B-A23B
- Blog de presentacion de K2 Horizon: https://ifm.ai/blog/k2
- Dataset de pre-entrenamiento: https://huggingface.co/datasets/IFM/K2-Horizon-Pretrain-Data
- Dataset de mid-training: https://huggingface.co/datasets/IFM/K2-Horizon-Midtrain-Data
- Codigo de entrenamiento (xllm): https://github.com/LLM360/xllm
- Codigo de evaluacion (Eval360-V2): https://github.com/LLM360/Eval360-V2
