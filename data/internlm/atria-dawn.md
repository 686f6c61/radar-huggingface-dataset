# internlm/Atria-Dawn

## Resumen

Atria Dawn es un modelo agéntico de nueva generación desarrollado por el Shanghai Artificial Intelligence Laboratory (identificador de HuggingFace: `internlm`). Está construido sobre el modelo base **GLM-5.2**, un MoE de 744B parámetros, y se distribuye con 753.329.940.480 parámetros totales según los pesos en safetensors del repositorio. Su objetivo declarado no es la conversación generalista, sino llevar problemas abiertos hasta resultados «ejecutables, verificables y reproducibles»: análisis del problema, diseño de solución, uso de herramientas, implementación de código, ejecución de experimentos, análisis de resultados y recuperación ante fallos.

El modelo se posiciona en cuatro dimensiones de trabajo —descubrimiento (investigación profunda y planes experimentales), creación (software, aplicaciones interactivas, visualizaciones, sistemas de machine learning), entrega (informes, presentaciones y otros entregables estructurados) y ciberseguridad (análisis de vulnerabilidades y validación de parches en entornos autorizados)—. La versión completa anuncia una ventana de contexto de 512K tokens, frente a los 256K de la variante Preview, lo que lo sitúa en la liga de modelos pensados para tareas de largo horizonte con realimentación del entorno.

Es relevante ahora porque combina un tamaño de parámetros de frontera (por encima de 700B) con licencia MIT y publicación de pesos abiertos, algo poco habitual en esa escala. El repositorio ocupa 1.506,7 GB en safetensors, y existe una variante cuantizada en FP8 publicada por separado. En el momento de redactar esta ficha el modelo acumula 207 descargas y 13 likes, con fecha de creación del 23 de octubre de 2026.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MoE (tag de repositorio `glm_moe_dsa`); construido sobre el modelo base GLM-5.2 de 744B parámetros |
| Parámetros totales | 753.329.940.480 (~753B) según safetensors |
| Parámetros activos | no disponible |
| Longitud de contexto | 512K tokens (versión completa); 256K tokens en la variante Preview |
| Tipos de cuantización | BF16 (modelo completo) y FP8 (variante `Atria-Dawn-FP8` publicada por el autor); no se han publicado GGUF ni otras cuantizaciones |
| Idiomas soportados | no disponible |
| Licencia | MIT (según el badge y el enlace LICENSE de la model card); el campo de licencia de los metadatos de HuggingFace figura como no disponible |
| Formato de pesos | safetensors (también en la variante FP8) |

## Arquitectura y entrenamiento

La información disponible identifica el modelo como un **MoE** (mezcla de expertos) etiquetado con el identificador `glm_moe_dsa` en el repositorio, construido sobre la base **GLM-5.2** de 744B parámetros. El recuento real de parámetros en safetensors asciende a 753.329.940.480, ligeramente por encima de la cifra nominal del modelo base, lo que sugiere parámetros adicionales incorporados en el ajuste (por ejemplo, cabezas o embeddings específicos de la versión publicada). No se ha detallado en la información proporcionada el número de parámetros activos por token, el número de expertos, la ratio de activación ni el mecanismo exacto de atención implícito en el sufijo `dsa`.

Tampoco se especifican el volumen de tokens de entrenamiento, la composición del dataset, ni si se emplearon técnicas de alineación como RLHF o DPO. La model card describe el entrenamiento en términos funcionales —orientado a uso de herramientas, razonamiento multi-paso y realimentación del entorno— y remite a un artículo en arXiv (2609.15818) para los detalles técnicos, pero el contenido de dicho artículo no forma parte de la información disponible. Existe una variante **Preview** con 256K de contexto que probablemente precede a la versión completa, aunque no se documenta la relación exacta entre ambas ni el proceso de extensión de contexto.

## Capacidades

- Generación de texto y razonamiento multi-paso orientado a la resolución de tareas abiertas.
- Uso de herramientas (tool calling) como capacidad central del modelo, no accesoria: la card lo describe como un modelo «agéntico» que combina objetivos con realimentación del entorno.
- Ejecución de bucles agénticos completos: análisis, planificación, uso de herramientas, implementación, ejecución y recuperación ante fallos.
- Generación de código y construcción de software: aplicaciones interactivas, juegos, visualizaciones de datos y sistemas de machine learning.
- Investigación profunda (deep research): recuperación y organización de evidencia, y conversión de preguntas de investigación en planes experimentales ejecutables.
- Generación de entregables estructurados: informes y presentaciones a partir de documentos, datos y requisitos de diseño.
- Ciberseguridad defensiva: análisis de problemas de seguridad, validación de vulnerabilidades, aplicación de parches y revalidación en entornos autorizados.
- Capacidades multilingües: no disponible (la card está publicada en inglés y chino, pero no se declaran los idiomas soportados por el modelo).
- Capacidades de visión o audio: no disponibles.

## Casos de uso

- **Investigación científica automatizada**: el modelo puede recibir una pregunta de investigación, recuperar y organizar evidencia, proponer un plan experimental, escribir el código del experimento, ejecutarlo y analizar los resultados. Su contexto de 512K permite mantener en memoria artículos completos, código y trazas de ejecución sin truncar.
- **Automatización de oficina y generación de entregables**: a partir de documentos y hojas de datos, producir informes y presentaciones estructuradas, encadenando extracción de datos, redacción y formateo en un único flujo agéntico.
- **Desarrollo de software asistido en pipelines de CI/CD**: con soporte de tool calling, el modelo puede leer el fallo de una build, localizar el código implicado, proponer y aplicar un parche y volver a lanzar las pruebas, integrándose como agente dentro de un sistema de integración continua.
- **Creación de aplicaciones y visualizaciones de datos**: generación de prototipos funcionales (interfaces web, dashboards, pequeños juegos) partiendo de un requisito en lenguaje natural y validando el resultado mediante ejecución.
- **Auditoría de seguridad defensiva**: en entornos autorizados, analizar una base de código en busca de vulnerabilidades, reproducir el fallo en un entorno controlado, aplicar la corrección y revalidar. La ventana de 512K es útil para razonar sobre repositorios o trazas de red extensas.
- **Agentes de operaciones con realimentación del entorno**: tareas de larga duración que requieren observar el resultado de cada acción y corregir el rumbo (por ejemplo, migraciones de datos por pasos con verificación intermedia), donde la recuperación ante fallos es parte explícita del diseño.
- **Asistentes de análisis de documentación técnica extensa**: ingerir manuales, normativas o contratos de gran longitud (hasta 512K tokens) y responder con trazabilidad a la evidencia, algo que el modelo persigue por diseño («resultados verificables»).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card incluye una imagen (`assets/evaluation.jpg`) que, según el texto, contiene la tabla completa de evaluación frente a Atria Dawn Preview en pruebas de búsqueda, código, uso de herramientas, productividad y seguridad, pero los valores numéricos no están accesibles en el material proporcionado. No se reproducen cifras para evitar fabricar datos.

## Requisitos de hardware

- **VRAM estimada para inferencia en BF16**: los pesos suman aproximadamente 1.506 GB (coincide con el tamaño del repositorio, 1.506,7 GB); a ello hay que añadir la caché KV, que con 512K tokens de contexto puede ser muy elevada.
- **VRAM estimada en FP8**: en torno a 753 GB solo para pesos, más caché KV.
- **GPU recomendadas**: para BF16 se necesitan del orden de 16 GPU de 96 GB (H100/H200) o más; para FP8, un nodo de 8×H200 (141 GB cada una, 1.128 GB totales) deja muy poco margen para la caché KV con contexto largo, por lo que en la práctica conviene un nodo de 8×B200 o varios nodos con paralelismo tensorial.
- **GPU de consumo**: no cabe. Ni siquiera en configuraciones multi-GPU de consumo (4×RTX 4090 = 96 GB) hay espacio para los pesos en FP8.
- **Opciones de despliegue**: al no publicarse GGUF, llama.cpp y Ollama no son viables con los artefactos disponibles. Las rutas realistas son vLLM o SGLang con paralelismo tensorial y FP8, o TGI en clúster. La variante FP8 publicada por el autor es la opción recomendada para reducir el coste de memoria.
- **Latencia y throughput**: no disponibles. A esta escala, el throughput vendrá dominado por el ancho de banda de interconexión entre nodos y por el coste de la caché KV a 512K de contexto.

## Comparativa con modelos similares

La información disponible solo permite comparar con las propias variantes publicadas y con el modelo base declarado. No se dispone de datos de benchmarks ni de especificaciones de terceros verificables en este contexto, por lo que la comparación con alternativas externas se marca como no disponible.

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Atria Dawn (esta ficha) | 753B (MoE) | 512K | BF16, FP8 | MIT | Pesos abiertos en HF y ModelScope |
| Atria Dawn FP8 | 753B (MoE) | 512K | FP8 | MIT | Pesos abiertos en HF y ModelScope |
| Atria Dawn Preview | no disponible | 256K | BF16, FP8 | MIT | Pesos abiertos en HF y ModelScope |
| GLM-5.2 (modelo base) | 744B (MoE) | no disponible | no disponible | no disponible | no disponible en la información proporcionada |
| Alternativas externas de escala similar | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- **Sesgos**: no se documenta ninguna evaluación de sesgos, toxicidad o equidad en la información disponible.
- **Alucinación**: el modelo está orientado a producir resultados «verificables», pero no se publican métricas de fiabilidad ni de tasa de alucinación; en tareas de investigación y ciberseguridad conviene validar siempre las salidas contra fuentes o entornos reales.
- **Idiomas**: no se declaran los idiomas soportados. Aunque la card está en inglés y chino, no hay garantía documentada de calidad en castellano.
- **Contexto**: 512K tokens anunciados, pero no se especifica cómo se comporta el rendimiento en la parte alta de la ventana ( degradación por posición, coste de caché KV).
- **Licencia**: el badge de la model card indica MIT, lo que permitiría uso comercial, pero el campo de licencia de los metadatos de HuggingFace aparece como no disponible. Conviene verificar el fichero LICENSE del repositorio antes de un despliegue en producción.
- **Coste de despliegue**: 1,5 TB de pesos en BF16 implican infraestructura de clúster; no es desplegable en una sola GPU de 80 GB ni en hardware de consumo.
- **Madurez**: con 207 descargas y 13 likes en el momento de la consulta, el ecosistema de herramientas alrededor del modelo (soporte en frameworks, cuantizaciones comunitarias, recetas de despliegue) es todavía muy limitado.
- **Ausencia de datos de evaluación accesibles**: la tabla de benchmarks existe solo como imagen en la model card, lo que impide verificar cifras de forma independiente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/internlm/Atria-Dawn
- Variante FP8 en HuggingFace: https://huggingface.co/internlm/Atria-Dawn-FP8
- Variante Preview en HuggingFace: https://huggingface.co/internlm/Atria-Dawn-Preview
- Variante Preview FP8 en HuggingFace: https://huggingface.co/internlm/Atria-Dawn-Preview-FP8
- Modelo en ModelScope: https://www.modelscope.cn/models/Shanghai_AI_Laboratory/Atria-Dawn
- ModelScope (FP8): https://www.modelscope.cn/models/Shanghai_AI_Laboratory/Atria-Dawn-FP8
- ModelScope (Preview): https://www.modelscope.cn/models/Shanghai_AI_Laboratory/Atria-Dawn-Preview
- ModelScope (Preview FP8): https://www.modelscope.cn/models/Shanghai_AI_Laboratory/Atria-Dawn-Preview-FP8
- Sitio web oficial: https://atria-asi.ai/
- Repositorio GitHub (Preview): https://github.com/atria-asi/Atria-Dawn-Preview
- Artículo en arXiv: https://arxiv.org/abs/2609.15818
- Cuenta de X: https://x.com/AtriaASI
- Discord: https://discord.gg/jT8SDt8up
