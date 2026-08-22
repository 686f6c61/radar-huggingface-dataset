# hoborific/Qwen3.8-27B-W8A8-INT8

## Resumen

Qwen3.8-27B-W8A8-INT8 es una version cuantizada en 8 bits del modelo denso Qwen3.8-27B, desarrollada por el usuario hoborific y publicada en HuggingFace. El modelo base, Qwen3.8-27B, pertenece a la familia Qwen3.8 de Alibaba y destaca por emplear una arquitectura hibrida de atencion: combina atencion completa (full attention) en 16 de sus 64 capas con atencion lineal de estado recurrente constante en las 48 restantes, lo que reduce el coste computacional frente a un transformer denso convencional.

La cuantizacion W8A8 (pesos y activaciones en INT8) reduce el peso del modelo de forma significativa: el repositorio ocupa 36,4 GB frente a los aproximadamente 54 GB de la version en BF16. Esto permite ejecutar el modelo en hardware con menos VRAM y acelera la inferencia en GPUs con soporte optimizado para operaciones INT8, como las series profesionales de NVIDIA o aceleradores domesticos como el Hygon K100AI. El modelo mantiene la interfaz de transformers y es compatible con pipelines de image-text-to-text, lo que indica que conserva las capacidades multimodales del modelo original.

La relevancia de esta cuantizacion radica en que Qwen3.8-27B es un modelo de 27.000 millones de parametros con licencia Apache 2.0, lo que lo hace atractivo para despliegues comerciales y de investigacion. La version INT8 facilita su ejecucion en entornos con recursos limitados, ampliando el acceso a un modelo de esta escala sin renunciar a la mayor parte de su rendimiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hibrida: 16 capas de atencion completa + 48 capas de atencion lineal con estado recurrente constante |
| Parametros totales | 27.781.427.952 (27,78 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible (la del modelo base Qwen3.8-27B no se especifica en la informacion proporcionada) |
| Tipos de cuantizacion | W8A8 INT8 (pesos y activaciones) |
| Idiomas soportados | No disponibles (los del modelo base, no especificados en la informacion proporcionada) |
| Licencia | No disponible en la model card; el modelo base Qwen3.8-27B usa Apache 2.0 |
| Formato de pesos | safetensors (compatible con transformers y compressed-tensors) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B emplea una arquitectura hibrida de atencion sobre un backbone de 64 capas. De ellas, solo 16 ejecutan atencion completa (con un intervalo de atencion completa de 4, es decir, una de cada cuatro capas), mientras que las 48 restantes utilizan atencion lineal con un estado recurrente constante. Este diseno reduce la complejidad computacional frente a un transformer con atencion completa en todas las capas, manteniendo la capacidad de modelar dependencias de largo alcance gracias a las capas de atencion completa intercaladas.

La cuantizacion W8A8 INT8 se ha aplicado tanto a los pesos como a las activaciones, utilizando la libreria compressed-tensors. Este esquema de cuantizacion es especialmente adecuado para acelerar la inferencia en hardware con soporte nativo para operaciones de 8 bits, como las GPUs NVIDIA con Tensor Cores de ultima generacion o aceleradores como el Hygon K100AI, para el que existe una implementacion optimizada con DFlash2 y tensor parallelism de 4 GPUs (TP4). No se dispone de informacion detallada sobre el proceso de calibracion de la cuantizacion ni sobre la perdida de precision respecto al modelo original.

## Capacidades

- Generacion de texto y razonamiento: al estar basado en Qwen3.8-27B, conserva las capacidades de generacion de texto, razonamiento y comprension del modelo original.
- Procesamiento multimodal: el pipeline declarado es image-text-to-text, lo que indica soporte para entrada de imagenes junto con texto.
- Codigo y matematicas: el modelo base Qwen3.8-27B esta evaluado en benchmarks como MathVision, lo que sugiere capacidades solidas en razonamiento matematico y generacion de codigo.
- Soporte de tool calling y agentes: no se especifica en la informacion proporcionada, aunque es una capacidad habitual en la familia Qwen3.8.
- Capacidades multilingues: no se especifican los idiomas soportados en la informacion proporcionada.
- Inferencia cuantizada: la cuantizacion W8A8 permite una inferencia mas rapida y con menor consumo de memoria que la version en BF16, a costa de una posible perdida menor de precision.

## Casos de uso

- Despliegue de un asistente conversacional en hardware limitado: la cuantizacion INT8 reduce los requisitos de VRAM a aproximadamente 28 GB, lo que permite ejecutar el modelo en una GPU como la RTX 4090 (24 GB) con offloading parcial o en una A100 de 40 GB con margen. Es adecuado para construir chatbots o asistentes virtuales con capacidades multimodales sin necesidad de un cluster de GPUs.
- Razonamiento matematico y resolucion de problemas en educacion: el modelo base esta evaluado en MathVision, por lo que puede utilizarse para generar soluciones paso a paso a problemas matematicos, tanto en entornos educativos como en herramientas de apoyo al estudio.
- Analisis de documentos con imagenes: al ser un modelo image-text-to-text, puede procesar documentos escaneados, capturas de pantalla o diagramas y generar descripciones, resumenes o respuestas basadas en su contenido visual y textual.
- Generacion de codigo asistida en entornos con restricciones de hardware: desarrolladores con GPUs de gama media pueden integrar el modelo en sus editores o pipelines de CI/CD para autocompletado de codigo, revision de cambios o generacion de pruebas unitarias, aprovechando la licencia Apache 2.0 del modelo base.
- Investigacion academica sobre cuantizacion: este repositorio sirve como punto de partida para estudiar el impacto de la cuantizacion W8A8 en modelos hibridos de atencion, comparando la precision y el rendimiento frente a la version original en BF16.
- Inferencia en aceleradores alternativos: la existencia de una implementacion optimizada para el acelerador Hygon K100AI con TP4 sugiere que el modelo puede desplegarse en hardware no NVIDIA, lo que es relevante para organizaciones que buscan evitar dependencia de un unico proveedor de GPUs.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio cuantizado no incluye metricas de rendimiento, y los resultados de la busqueda web se refieren al modelo base Qwen3.8-27B, no a la version cuantizada. Se recomienda evaluar el modelo en el caso de uso concreto antes de su despliegue en produccion.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 36,4 GB en disco, pero al ser pesos INT8, la memoria necesaria para cargar el modelo es de aproximadamente 27,8 GB (27,78 B parametros x 1 byte por parametro). A esto hay que anadir la memoria para las activaciones y el contexto, por lo que se recomienda al menos 32 GB de VRAM para inferencia comoda.
- GPUs recomendadas: NVIDIA A100 40 GB, A100 80 GB, H100 80 GB, o RTX 4090 24 GB (con offloading de capas a RAM si el contexto es largo). Tambien es compatible con el acelerador Hygon K100AI mediante la implementacion TP4 con DFlash2.
- Si cabe en consumer GPU: si, en una RTX 4090 (24 GB) con cuantizacion INT8 y gestion cuidadosa del contexto, aunque puede requerir offloading de algunas capas a memoria del sistema.
- Opciones de despliegue: transformers (libreria principal), vLLM (compatible con modelos cuantizados W8A8), SGLang (mencionado en la implementacion para K100AI), y llama.cpp si se convierte a formato GGUF.
- Latencia y throughput: no disponibles en la informacion proporcionada. Dependen del hardware, del tamano del contexto y de la implementacion utilizada.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-27B (original) | 27,78 B | BF16 | No disponible | Apache 2.0 | HuggingFace |
| Qwen3.8-27B-W8A8-INT8 (este modelo) | 27,78 B | W8A8 INT8 | No disponible | No disponible (base Apache 2.0) | HuggingFace |
| Qwen3-30B-A3B (MoE) | 30,5 B total, 3,3 B activos | BF16 | No disponible | Apache 2.0 | HuggingFace |

La comparativa se limita a modelos de la misma familia Qwen por falta de informacion sobre alternativas equivalentes en cuantizacion W8A8. La principal diferencia frente al modelo original es el menor consumo de memoria y la mayor velocidad de inferencia, a costa de una posible perdida de precision. Frente a un MoE como Qwen3-30B-A3B, el modelo denso ofrece un rendimiento mas predecible en tareas que requieren activar todos los parametros, aunque con mayor coste computacional por token.

## Limitaciones y advertencias

- La cuantizacion W8A8 puede introducir una perdida de precision respecto al modelo en BF16, especialmente en tareas que requieren alta exactitud numerica, como matematicas avanzadas o generacion de codigo complejo.
- La licencia del repositorio cuantizado no esta especificada en la model card. Aunque el modelo base usa Apache 2.0, se recomienda verificar los terminos de uso antes de un despliegue comercial.
- No se dispone de informacion sobre los idiomas soportados ni la longitud de contexto del modelo base, lo que limita la planificacion de casos de uso multilingues o con contextos muy largos.
- El modelo puede presentar sesgos y alucinaciones, como cualquier modelo de lenguaje de gran tamano. No se ha realizado una evaluacion especifica de estos riesgos en la version cuantizada.
- La implementacion para Hygon K100AI es un proyecto comunitario, no oficial, y requiere acceso directo al dispositivo GPU, dependiendo de la pila de software del fabricante (DTK, hyhal, etc.).
- Al ser un modelo de 27 B parametros, la inferencia en CPU o en GPUs con menos de 24 GB de VRAM puede resultar impracticable sin tecnicas adicionales de offloading o cuantizacion mas agresiva.

## Enlaces

- Repositorio del modelo cuantizado: https://huggingface.co/hoborific/Qwen3.8-27B-W8A8-INT8
- Modelo base Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Pagina de vLLM Recipes para Qwen3.8-27B: https://recipes.vllm.ai/Qwen/Qwen3.8-27B
- Repositorio de la implementacion para Hygon K100AI: https://github.com/DocPang/qwen38-w8a8-k100ai-dflash2-tp4
- Repositorio alternativo con el mismo nombre: https://huggingface.co/compute1/Qwen3.8-27B-W8A8-INT8
