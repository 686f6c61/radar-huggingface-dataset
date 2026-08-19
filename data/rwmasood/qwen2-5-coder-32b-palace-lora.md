# rwmasood/Qwen2.5-Coder-32B-Palace-LoRA

## Resumen

Qwen2.5-Coder-32B-Palace-LoRA es un adaptador QLoRA desarrollado por rwmasood que especializa el modelo base Qwen/Qwen2.5-Coder-32B-Instruct en la generación y reparación de archivos de configuración JSON de Palace, un solver de código abierto de elementos finitos para electromagnetismo computacional. El problema que resuelve es concreto: los modelos de código generales manejan mal el formato de configuración de Palace porque es un dominio muy específico y sus restricciones son estrictas — un nombre de campo, tipo o unidad incorrecto altera silenciosamente la física simulada. El adaptador enseña al modelo el vocabulario exacto del esquema JSON de Palace y sus modismos, de modo que las configuraciones generadas validan contra el esquema y son aceptadas por el solver.

El adaptador se entrenó contra artefactos de Palace v0.14.0 y cubre tareas de autoría (escribir una configuración desde una descripción en lenguaje natural de un problema electrostático, magnetostático o electromagnético) y de reparación (corregir configuraciones rotas: violaciones de esquema, tipos erróneos, enums inválidos, referencias a mallas colgantes o secciones obligatorias ausentes). Está publicado bajo licencia Apache 2.0 y se distribuye como un adaptador PEFT que se carga sobre el modelo base de 32 mil millones de parámetros. El repositorio tiene un tamaño de 0.0 GB, coherente con un adaptador LoRA de pequeño tamaño.

La relevancia actual radica en que los flujos de trabajo de simulación electromagnética con Palace exigen configuraciones JSON muy precisas, y los modelos de lenguaje generales no son fiables en este dominio. Este adaptador ofrece una vía práctica para que ingenieros e investigadores generen y depuren estas configuraciones con asistencia de IA, reduciendo errores de formato y acelerando el ciclo de diseño. El adaptador se sirve fácilmente con vLLM mediante `--enable-lora` y también se puede cargar con Transformers y PEFT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre Qwen/Qwen2.5-Coder-32B-Instruct (Transformer decoder) |
| Parametros totales | No disponible (el adaptador es un LoRA de rank 64; el modelo base tiene 32B) |
| Parametros activos | No disponible (no es un modelo MoE) |
| Longitud de contexto | No disponible (heredado del modelo base, no especificado en la documentacion del adaptador) |
| Tipos de cuantizacion | No disponible (el adaptador se entreno con base 4-bit NF4; en inferencia se puede cargar en bf16 o cuantizado) |
| Idiomas soportados | Ingles |
| Licencia | Apache 2.0 (ademas, hay que cumplir la licencia del modelo base Qwen2.5-Coder-32B-Instruct) |
| Formato de pesos | No disponible (adaptador PEFT, probablemente safetensors o binarios de PyTorch, no especificado) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rank 64 con alpha 128 y dropout 0.05, aplicado a todas las proyecciones lineales del modelo base (`q,k,v,o,gate,up,down`). El entrenamiento se realizó con QLoRA, es decir, el modelo base se mantuvo en 4-bit NF4 durante el entrenamiento, y solo se actualizaron los parámetros del adaptador. El conjunto de datos consta de 3.296 pares instrucción/respuesta (199 retenidos para validación), derivados del esquema JSON de Palace v0.14.0, su documentación y los ejemplos de configuración incluidos en el repositorio. Los datos se transformaron en tareas de autoría de configuraciones y de reparación dirigida, usando la plantilla de chat ChatML y calculando la pérdida solo sobre las respuestas.

El entrenamiento se ejecutó durante 3 épocas con una longitud de secuencia de 8192 tokens, un tamaño de lote efectivo de 16 (micro-batch de 4 con acumulación de gradientes de 4), una tasa de aprendizaje de 1e-4 con programación coseno, warmup del 3 %, optimizador paged AdamW-8bit, precisión bf16 y semilla 17. Las librerías utilizadas fueron PEFT 0.19.1, Axolotl 0.17.0 y Transformers. No se menciona el uso de RLHF ni DPO; el entrenamiento es supervisado de forma clásica. La innovación técnica principal no está en la arquitectura del adaptador, sino en la curaduría de los datos de entrenamiento, que capturan el vocabulario y las restricciones exactas del esquema de Palace, algo que los modelos de propósito general no manejan bien.

## Capacidades

- Generación de archivos de configuración JSON de Palace a partir de descripciones en lenguaje natural de problemas de electromagnetismo (electrostática, magnetostática, electromagnetismo forzado).
- Reparación de configuraciones existentes que presentan violaciones de esquema, tipos incorrectos, enums inválidos, referencias a mallas colgantes o secciones obligatorias ausentes.
- Soporte de chat y generación de texto a través del modelo base Qwen2.5-Coder-32B-Instruct, que incluye capacidades de razonamiento y código.
- Integración con vLLM mediante `--enable-lora` y `--lora-modules`, permitiendo servir el adaptador con el nombre `palace`.
- Carga y uso sencillo con Transformers y PEFT, con el adaptador aplicado sobre el modelo base en bf16 o con cuantización.
- Capacidad multilingüe limitada al inglés, según la documentación del adaptador.

## Casos de uso

- Autoría de configuraciones para simulaciones electrostáticas: un ingeniero describe en lenguaje natural un problema de condensador de placas paralelas con malla, terminales y dominio; el modelo genera un JSON válido listo para ejecutar con Palace.
- Reparación de configuraciones heredadas o generadas por otros medios: dado un JSON roto, el modelo identifica y corrige errores de esquema, tipos, enums y referencias, ahorrando tiempo de depuración manual.
- Integración en pipelines de simulación automatizados: el adaptador se sirve con vLLM y se invoca mediante API para generar configuraciones bajo demanda, por ejemplo en un flujo de optimización de diseño electromagnético.
- Asistencia a investigadores en la preparación de casos de validación: el modelo puede crear configuraciones de prueba para problemas estándar (capacitancia, inductancia, dispersión) a partir de parámetros descriptivos.
- Verificación previa a ejecución: el modelo puede revisar una configuración existente y señalar posibles errores antes de lanzar el solver, reduciendo iteraciones fallidas.
- Formación y documentación: el adaptador puede usarse para generar ejemplos comentados de configuraciones de Palace, ayudando a nuevos usuarios a comprender la estructura del esquema.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El adaptador no incluye métricas de evaluación sobre tareas de generación o reparación de configuraciones Palace, ni comparaciones con otros modelos. Se recomienda validar el rendimiento de forma empírica en el dominio específico, dado que el modelo base Qwen2.5-Coder-32B-Instruct ha demostrado buen rendimiento en tareas de código generales, pero el adaptador es un ajuste especializado sin cifras públicas.

## Requisitos de hardware

- El modelo base Qwen2.5-Coder-32B-Instruct tiene 32 mil millones de parámetros; para inferencia en bf16 se requieren aproximadamente 64 GB de VRAM (por ejemplo, una A100 de 80 GB o dos GPUs de 32 GB).
- Con cuantización 4-bit (por ejemplo, mediante bitsandbytes) se puede reducir el requisito a unos 20-24 GB de VRAM, lo que permite ejecutarlo en una RTX 4090 de 24 GB o en una A100 de 40 GB.
- El adaptador LoRA añade una sobrecarga mínima de memoria (rank 64 sobre todas las proyecciones lineales), despreciable frente al modelo base.
- Opciones de despliegue: Transformers con PEFT (carga directa), vLLM con soporte LoRA (`--enable-lora`), y posiblemente Ollama o llama.cpp si se convierte el adaptador a GGUF (no documentado).
- No se proporcionan datos de latencia ni throughput. Para una RTX 4090 con cuantización 4-bit, se espera una generación de decenas de tokens por segundo, pero no hay cifras oficiales.

## Comparativa con modelos similares

No se dispone de información sobre adaptadores LoRA específicos para Palace u otros solvers de elementos finitos. La comparativa más directa es con el modelo base Qwen2.5-Coder-32B-Instruct sin el adaptador, que maneja código general pero no conoce el esquema de Palace. Otros modelos de código como DeepSeek-Coder-V2 o CodeLlama podrían usarse como alternativa, pero no hay datos comparativos publicados para esta tarea concreta. A continuación se muestra una comparación cualitativa basada en características conocidas:

| Modelo | Parametros | Contexto | Especializacion | Licencia |
|---|---|---|---|---|
| Qwen2.5-Coder-32B-Instruct (base) | 32B | No disponible (128k segun documentacion publica, no confirmado en la info) | Codigo general, instrucciones | Apache 2.0 |
| Qwen2.5-Coder-32B-Palace-LoRA (adaptador) | 32B + LoRA | Heredado del base | Configuraciones Palace (electromagnetismo) | Apache 2.0 |
| DeepSeek-Coder-V2-Instruct | 236B (MoE) | No disponible | Codigo general | DeepSeek License (no comercial) |

Nota: los datos de contexto y licencia de DeepSeek-Coder-V2 no están en la información proporcionada; se incluyen como referencia general, pero no se debe considerar una comparativa rigurosa sin datos verificados.

## Limitaciones y advertencias

- El adaptador está entrenado específicamente contra Palace v0.14.0; otras versiones del solver pueden tener esquemas diferentes y las configuraciones generadas podrían no ser válidas.
- Las configuraciones generadas pueden ser válidas según el esquema y ejecutarse correctamente, pero ser físicamente incorrectas (por ejemplo, una unidad de longitud `L0` mal escalada produce un sistema físico distinto). Siempre hay que verificar los resultados numéricos contra referencias o soluciones analíticas.
- El modelo solo soporta inglés; no se documenta capacidad multilingüe.
- No se han publicado evaluaciones de sesgos ni de alucinación específicas para el adaptador; como todo modelo de lenguaje, puede generar configuraciones plausibles pero incorrectas.
- La licencia Apache 2.0 del adaptador no exime de cumplir la licencia del modelo base Qwen2.5-Coder-32B-Instruct, que también es Apache 2.0 pero debe verificarse.
- El adaptador está pensado para generar JSON que se pasará al solver, no para producir prosa explicativa; su uso fuera de ese ámbito puede dar resultados inconsistentes.
- Para producción, se recomienda validar siempre con `palace --dry-run` y contrastar los resultados físicos.

## Enlaces

- Adaptador en Hugging Face: https://huggingface.co/rwmasood/Qwen2.5-Coder-32B-Palace-LoRA
- Modelo base Qwen2.5-Coder-32B-Instruct: https://huggingface.co/Qwen/Qwen2.5-Coder-32B
- Repositorio de Palace (AWS Labs): https://github.com/awslabs/palace
- Colección Qwen2.5-Coder en Hugging Face: https://huggingface.co/collections/Qwen/qwen25-coder
- Informe técnico de Qwen2.5-Coder (arXiv): https://arxiv.org/abs/2409.12186
