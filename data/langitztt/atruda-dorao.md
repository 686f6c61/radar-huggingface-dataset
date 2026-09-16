# Langitztt/Atruda-dorao

## Resumen

Atruda-dorao es un repositorio de pesos publicado por el usuario Langitztt en Hugging Face que contiene un modelo de lenguaje de gran escala en formato safetensors, con un total declarado de 753.329.940.480 parametros (unos 753,3 mil millones) y un tamano de repositorio de 1.506,7 GB. La etiqueta de arquitectura asociada al repositorio es glm_moe_dsa, lo que apunta a una arquitectura de mezcla de expertos (MoE) de la familia GLM, aunque no se detalla el numero de parametros activos por token ni la configuracion interna de expertos.

La model card incluida en el repositorio no corresponde al nombre Atruda-dorao, sino a Atria Dawn Preview, una version preliminar de un modelo agentico desarrollado por el Shanghai Artificial Intelligence Laboratory (InternLM / Shanghai AI Lab) sobre un modelo base MoE GLM-5.2 de 744.000 millones de parametros. Segun esa model card, el modelo esta orientado a tareas que requieren comprension continua del entorno, uso de herramientas y resolucion de problemas en varios pasos, con una ventana de contexto de 256K tokens y soporte de chino e ingles.

El interes actual de esta ficha es limitado y fundamentalmente tecnico: se trata de un repositorio con cero descargas y cero interacciones en el momento de la consulta, con una discrepancia entre el identificador del repositorio y el contenido de la model card, y con una tabla de evaluacion truncada en la informacion disponible. Esto lo convierte en un artefacto a verificar antes de cualquier uso en produccion, mas que en una alternativa contrastada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE); etiqueta del repositorio glm_moe_dsa, model card basada en GLM-5.2 |
| Parametros totales | 753.329.940.480 segun safetensors; la model card declara 744.000 millones para el modelo base |
| Parametros activos | no disponible |
| Longitud de contexto | 262.144 tokens (256K) segun la model card |
| Tipos de cuantizacion | FP8 documentado para la variante Atria-Dawn-Preview-FP8; no se documentan GGUF, AWQ, GPTQ ni otros formatos |
| Idiomas soportados | chino (zh) e ingles (en) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La informacion disponible describe un modelo de tipo MoE construido sobre un modelo base de 744.000 millones de parametros denominado GLM-5.2, con una etiqueta de repositorio que sugiere el uso de atencion dispersa (DSA) dentro del bloque MoE, aunque no se aportan detalles sobre el mecanismo exacto, el numero de expertos, el enrutador ni la proporcion de parametros activos por token. La model card indica un enfoque de entrenamiento orientado a comportamiento agentico, con el objetivo de llevar problemas abiertos a resultados ejecutables, verificables y reproducibles combinando objetivos de tarea con realimentacion del entorno. Esto implica un ciclo completo de analisis del problema, diseno de solucion, uso de herramientas, implementacion de codigo, ejecucion de experimentos, analisis de resultados y recuperacion ante fallos.

No se especifica el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de ajuste como RLHF, DPO o similares. Tampoco se documenta ninguna innovacion tecnica adicional mas alla del enfoque agentico y de la publicacion de una variante cuantizada en FP8. Existe una referencia a un articulo con identificador arXiv:2609.15818 asociada al modelo Atria Dawn, pero su contenido no esta disponible en la informacion proporcionada. La diferencia de aproximadamente 9.300 millones de parametros entre el recuento de safetensors del repositorio (753,3 B) y la cifra declarada en la model card (744 B) no se explica en la documentacion disponible.

## Capacidades

- Generacion de texto y razonamiento en chino e ingles, con ventana de contexto de 256K tokens.
- Ejecucion de tareas agenticas de multiples pasos con realimentacion del entorno, segun la descripcion de la model card.
- Uso de herramientas y llamadas a funciones (tool calling / function calling), implicito en el enfoque de resolucion de tareas de la model card.
- Investigacion profunda: recuperacion y organizacion de evidencia y conversion de preguntas de investigacion en planes experimentales ejecutables (dimension Discovery).
- Creacion de software: construccion de aplicaciones, aplicaciones interactivas, juegos, visualizaciones de datos y sistemas de aprendizaje automatico (dimension Creation).
- Generacion de entregables estructurados: transformacion de documentos, datos y requisitos de diseno en informes, presentaciones y otros formatos (dimension Delivery).
- Ciberseguridad: analisis de problemas de seguridad, validacion de vulnerabilidades, aplicacion de correcciones y revalidacion en entornos autorizados (dimension Cybersecurity).
- No se documenta modo de razonamiento explicito (thinking mode), capacidades de vision, audio ni multimodalidad.

## Casos de uso

- Investigacion cientifica automatizada: el modelo puede recibir una pregunta de investigacion, recuperar y organizar evidencia, disenar un plan experimental, ejecutar el codigo correspondiente y analizar los resultados, aprovechando su ventana de 256K tokens para mantener el contexto de articulos y datos intermedios.
- Automatizacion de oficina y generacion de entregables: a partir de documentos y hojas de datos puede producir informes y presentaciones estructuradas, un escenario de productividad citado explicitamente en la model card.
- Desarrollo de software asistido por agentes: dado que la model card describe construccion de aplicaciones y sistemas de ML, encaja en pipelines donde el modelo escribe codigo, lo ejecuta mediante herramientas y corrige errores en iteraciones sucesivas.
- Auditoria de seguridad en entornos autorizados: analisis de vulnerabilidades, propuesta de parches y revalidacion posterior, siempre dentro de un marco de pruebas autorizado y con supervision humana.
- Analisis de documentacion tecnica extensa en chino o ingles: la ventana de 256K tokens permite procesar manuales, normativas o bases de codigo completas en una sola pasada sin troceado agresivo.
- Construccion de prototipos de visualizacion de datos: generacion de cuadernos y dashboards a partir de descripciones en lenguaje natural y de conjuntos de datos tabulares.
- Agentes de soporte tecnico multi-turno: gestion de conversaciones largas con historial extenso y llamadas a herramientas internas, apoyandose en el contexto de 256K tokens.

## Benchmarks y rendimiento

La informacion disponible solo incluye un dato de la tabla de evaluacion de la model card, que aparece truncada. El unico valor legible es DeepSearchQA con 96,0 para Atria Dawn Preview en la categoria Discovery. El resto de celdas, tanto del modelo como de los comparadores, no esta disponible.

| Categoria | Benchmark | Atria Dawn Preview | Modelos comparados |
|---|---|---|---|
| Discovery | DeepSearchQA | 96,0 | no disponible (columnas truncadas) |
| Busqueda | no disponible | no disponible | no disponible |
| Codigo | no disponible | no disponible | no disponible |
| Uso de herramientas | no disponible | no disponible | no disponible |
| Productividad | no disponible | no disponible | no disponible |
| Seguridad | no disponible | no disponible | no disponible |

La model card menciona evaluaciones en busqueda, codigo, uso de herramientas, productividad y seguridad, y lista como comparadores DeepSeek V4 Pro 0813, KIMI K3, Qwen 3.8 Max, GLM 5.3, GPT 5.6 sol y Claude Opus 5, pero no se proporcionan sus puntuaciones. No se han publicado resultados de benchmarks adicionales en la informacion disponible.

## Requisitos de hardware

Los siguientes valores son estimaciones derivadas del recuento de parametros del repositorio, no datos oficiales.

- Pesos en BF16/FP16: aproximadamente 1.507 GB (753,3 B x 2 bytes), coherente con el tamano del repositorio de 1.506,7 GB.
- Pesos en FP8: aproximadamente 753 GB.
- Pesos en 4 bits: aproximadamente 377 GB.
- Memoria de cache KV para 256K tokens: no disponible, falta la configuracion de cabezas y capas.
- GPU recomendadas: para FP8 se necesitan al menos 8 GPU H200 (141 GB, 1.128 GB totales) o 16 GPU H100 de 80 GB; para BF16 se requieren del orden de 16 H200 o 24 H100 de 80 GB.
- No cabe en GPU de consumo: los 24 GB de una RTX 4090 son insuficientes incluso con cuantizacion de 4 bits, que rondaria los 377 GB.
- Opciones de despliegue: la model card incluye una seccion de despliegue y acceso en linea, pero su contenido no esta disponible en la informacion proporcionada. Para una arquitectura MoE de este tamano, los marcos habituales son vLLM y SGLang; llama.cpp y Ollama no son viables por requisitos de memoria.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de especificaciones verificadas de los modelos citados en la model card, por lo que la comparacion se limita a la existencia de esos nombres en la tabla de evaluacion truncada.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Datos de rendimiento |
|---|---|---|---|---|---|
| Atruda-dorao / Atria Dawn Preview | 753,3 B (safetensors); 744 B declarados | 256K | MIT | Repositorio con 0 descargas al consultar | DeepSearchQA 96,0 |
| DeepSeek V4 Pro 0813 | no disponible | no disponible | no disponible | citado como comparador | no disponible |
| KIMI K3 | no disponible | no disponible | no disponible | citado como comparador | no disponible |
| Qwen 3.8 Max | no disponible | no disponible | no disponible | citado como comparador | no disponible |
| GLM 5.3 | no disponible | no disponible | no disponible | citado como comparador | no disponible |
| GLM-5.2 (modelo base) | 744 B declarados | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Discrepancia de identidad: el repositorio se llama Langitztt/Atruda-dorao, pero su model card corresponde a Atria-Dawn-Preview del Shanghai Artificial Intelligence Laboratory. No hay confirmacion de que los pesos alojados sean los oficiales ni de que correspondan a esa model card.
- Repositorio sin validacion externa: cero descargas y cero interacciones en el momento de la consulta, lo que impide contrastar el comportamiento real de los pesos publicados.
- Discrepancia en el recuento de parametros: 753,3 B en safetensors frente a 744 B declarados en la model card, sin explicacion documentada.
- Riesgo de alucinacion: inherente a los modelos de lenguaje de gran escala; no se documentan tasas de error ni evaluaciones de fidelidad factual.
- Idiomas limitados a chino e ingles; no se declara soporte de castellano ni de otras lenguas.
- La licencia del repositorio es MIT, pero no se especifican las condiciones aplicables al modelo base GLM-5.2 subyacente, lo que puede afectar al uso comercial.
- Ausencia de datos de entrenamiento: no se indica numero de tokens, composicion del dataset ni proceso de alineacion, lo que dificulta evaluar sesgos conocidos.
- Los sesgos conocidos no estan documentados en la informacion disponible.
- Requisitos de hardware extremos (del orden de 753 GB en FP8), lo que descarta su despliegue en infraestructura de un solo nodo con GPU de consumo.
- La tabla de evaluacion esta truncada y solo permite leer un unico resultado, por lo que no es posible verificar el rendimiento en codigo, uso de herramientas, productividad o seguridad.
- La busqueda web realizada no ha devuelto ninguna fuente relevante sobre el modelo; los resultados obtenidos eran contenido no relacionado.

## Enlaces

- Repositorio en Hugging Face de esta ficha: https://huggingface.co/Langitztt/Atruda-dorao
- Modelo referenciado en la model card (InternLM): https://huggingface.co/internlm/Atria-Dawn-Preview
- Variante FP8: https://huggingface.co/internlm/Atria-Dawn-Preview-FP8
- ModelScope: https://www.modelscope.cn/models/Shanghai_AI_Laboratory/Atria-Dawn-Preview
- Articulo: https://arxiv.org/abs/2609.15818
- Repositorio de codigo: https://github.com/atria-asi/Atria-Dawn-Preview
- Sitio web: https://atria-asi.ai/
- Perfil en X: https://x.com/AtriaASI
- Discord: https://discord.gg/jT8SDt8up
- README en chino: https://huggingface.co/internlm/Atria-Dawn-Preview/blob/main/README_CN.md
