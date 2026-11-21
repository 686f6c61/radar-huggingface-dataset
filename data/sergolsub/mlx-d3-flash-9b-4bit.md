# sergolsub/mlx-d3-flash-9B-4bit

## Resumen

Decision3 Flash (MLX 4-bit) es una conversión cuantizada a 4 bits del modelo `vllm-sr/d3-flash`, empaquetada en formato MLX para su ejecución en Apple Silicon mediante `mlx_lm`. El modelo se distribuye bajo licencia Apache 2.0, conservando la licencia de los pesos originales, y cuenta con 8.392.695.024 parámetros totales en su versión de referencia. Su particularidad no es la generación de texto libre, sino una interfaz de decisión estructurada: el modelo recibe una consulta y un conjunto de tareas tipadas (`noul`, `choice`, `score`) y devuelve decisiones clasificadas, lo que lo orienta a sistemas de enrutamiento, triaje y clasificación operativa.

La conversión la firma el usuario `sergolsub` y no incluye reentrenamiento ni cambios de arquitectura: se parte de una conversión previa a 8 bits en MLX, se desquantiza y se recuantiza en 4 bits afín manteniendo el mismo tamaño de grupo. El repositorio ocupa 5,4 GB e incluye los pesos en safetensors, el tokenizador, la plantilla de chat y el código de inferencia específico (`d3_mlx.py`, `decision_config.json`, `joint_config.json`) necesario para invocar el modo de decisión.

Su relevancia práctica es acotada pero concreta: permite ejecutar un modelo de ~8,4B parámetros con cabeceras de decisión en un Mac mini M4 Pro de 48 GB con un consumo de memoria pico de 6,01 GB y una latencia mediana de 604 ms por decisión. No hay datos publicados sobre el pipeline, los idiomas soportados ni benchmarks estándar, y el modelo no registra descargas ni interacciones en el momento de la ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (etiqueta `qwen3_5` con `custom_code` en los metadatos; requiere código de carga propio) |
| Parametros totales | 8.392.695.024 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits afín (MLX), derivada de una conversión previa a 8 bits; mismo tamaño de grupo |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (layout MLX), más `config.json`, tokenizador, `chat_template.jinja`, `d3_mlx.py`, `decision_config.json`, `joint_config.json` |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo base `vllm-sr/d3-flash`. Los metadatos de Hugging Face incluyen la etiqueta `qwen3_5` junto con `custom_code`, lo que sugiere una variante de la familia Qwen con código de carga personalizado, pero no se confirma ni el tipo de transformer, ni el esquema de atención, ni si incorpora componentes híbridos. Tampoco se documentan el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO.

Lo que sí está documentado es el proceso de conversión: se parte de una conversión MLX a 8 bits del modelo original, se desquantiza y se recuantiza a 4 bits afín conservando el tamaño de grupo, sin reentrenamiento ni modificación de la arquitectura. La innovación técnica destacable no está en el cuerpo del modelo sino en la capa de decisión: el repositorio incluye un módulo (`d3_mlx.py`) y ficheros de configuración (`decision_config.json`, `joint_config.json`) que exponen una API `decide(texto, tareas)` donde cada tarea se declara con un tipo (`noul` para preguntas booleanas, `choice` para selección entre criterios, `score` para puntuación ordinal) y unas instrucciones en lenguaje natural.

## Capacidades

- Decisión estructurada sobre texto: clasificación booleana (`noul`), selección entre opciones con criterios (`choice`) y puntuación ordinal sobre una escala (`score`).
- Procesamiento de consultas de soporte y operaciones: los ejemplos de la model card cubren facturación, envíos y errores de sistema.
- Ejecución de una llamada independiente por tipo de tarea, con instrucciones específicas por tarea.
- Inferencia en Apple Silicon mediante MLX (`mlx_lm`), con cuantización 4 bits.
- Generación de texto libre: no documentada en la model card; la interfaz descrita es exclusivamente de decisión.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles (idiomas no declarados).
- Capacidades especiales (thinking mode, visión, audio): no disponibles.

## Casos de uso

- Triaje de tickets de soporte: el modelo recibe el texto del ticket y una tarea `choice` con criterios como `billing` o `shipping`, y devuelve el equipo responsable. Es adecuado porque la interfaz de decisión evita post-procesar texto libre y la latencia medida (604 ms de mediana) encaja con un enrutador en línea.
- Detección de intención de reembolso: con una tarea `noul` e instrucciones del tipo "¿el cliente quiere un reembolso?", el modelo devuelve una respuesta booleana directamente consumible por un flujo de trabajo automatizado.
- Priorización de incidencias: una tarea `score` con criterios ordinales (`cosmetic`, `annoying`, `blocks`) permite asignar severidad a errores de sistema, como el ejemplo de cuota de disco excedida en un worker.
- Enrutamiento en atención al cliente multi-canal: cada mensaje entrante se evalúa con una o varias tareas de decisión para decidir cola, prioridad y equipo sin necesidad de un LLM generativo de mayor tamaño.
- Clasificación en local sobre hardware de escritorio: con 6,01 GB de memoria pico y 5,38 GB en disco, puede desplegarse en un Mac mini M4 Pro para tareas de clasificación que no pueden enviar datos a la nube.
- Etiquetado y auditoría de datos: la evaluación del autor reporta una accuracy del 86,7% tras la cuantización a 4 bits, lo que permite usar el modelo como etiquetador automático en pipelines internos con revisión humana posterior.
- Prototipado de sistemas de decisión: la API `decide` con tareas declarativas facilita iterar sobre criterios e instrucciones sin reentrenar el modelo.

## Benchmarks y rendimiento

La model card incluye una evaluación propia del autor sobre un conjunto no especificado, comparando la versión 4 bits con la bf16 original. No son benchmarks estándar (MMLU, HumanEval, GSM8K) y no se detalla el conjunto de evaluación.

| Metrica | 4 bits (MLX) | bf16 (referencia) |
|---|---|---|
| Accuracy | 86,7% | 90,0% |
| Noul | 85,0% | 92,5% |
| Choice | 88,0% | 88,0% |
| Score | 88,0% | 88,0% |
| Perplejidad de calibración | 1,899 | 1,850 |

Mediciones de ejecución en Mac mini M4 Pro de 48 GB con MLX 4 bits:

| Metrica | Valor |
|---|---|
| Tamano en disco | 5,38 GB |
| Tiempo de carga | 3,41 s |
| Memoria residente pico | 6,01 GB |
| Latencia de decisión (mediana) | 604 ms |
| Throughput sostenido | 2,45 decisiones cortas/s |

No se han publicado resultados de benchmarks estándar en la información disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: 6,01 GB de memoria residente pico medidos en la configuración de referencia; el repositorio ocupa 5,38 GB en disco.
- Hardware validado: Mac mini M4 Pro con 48 GB de memoria unificada. No se documentan pruebas en otros equipos Apple Silicon.
- GPU CUDA (A100, H100, RTX 4090): no aplicable directamente, ya que los pesos están en layout MLX y requieren el stack de Apple. Para CUDA habría que recurrir a los pesos originales `vllm-sr/d3-flash` o a la conversión de 8 bits.
- ¿Cabe en GPU de consumo? No hay datos para GPUs NVIDIA; en Apple Silicon, el consumo de 6 GB permite ejecutarlo en equipos con 16 GB o más de memoria unificada, aunque solo está validado en la máquina indicada.
- Opciones de despliegue: `mlx_lm` con el cargador incluido (`d3_mlx.py`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI en esta conversión.
- Latencia y throughput: 604 ms de mediana por decisión y 2,45 decisiones cortas por segundo en modo sostenido, según las mediciones del autor.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. El modelo base `vllm-sr/d3-flash` es la referencia directa, pero no se han publicado sus especificaciones, benchmarks ni requisitos en la información disponible.

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| sergolsub/mlx-d3-flash-9B-4bit | 8.392.695.024 | no disponible | Apache 2.0 | safetensors MLX 4 bits | Conversion del modelo base, con cabeceras de decision |
| vllm-sr/d3-flash | no disponible | no disponible | Apache 2.0 (heredada) | no disponible | Modelo original del que deriva esta conversion |
| Alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible | No se han identificado alternativas documentadas en la informacion disponible |

## Limitaciones y advertencias

- La model card no documenta sesgos conocidos, pero al no publicarse la composición del dataset de entrenamiento no es posible evaluar sesgos de dominio, género, idioma o geografía.
- Riesgo de alucinación: la interfaz está orientada a decisiones cerradas (`noul`, `choice`, `score`), lo que reduce el riesgo de texto inventado, pero no lo elimina; las decisiones deben validarse en dominios críticos.
- Idiomas soportados no declarados: no hay garantía de comportamiento correcto fuera del idioma o idiomas usados en el entrenamiento original.
- Longitud de contexto no disponible: no se puede planificar su uso con documentos largos ni conversaciones multi-turno extensas.
- La cuantización a 4 bits degrada la calidad frente a bf16: accuracy del 86,7% frente al 90,0%, y `noul` cae del 92,5% al 85,0%. En tareas booleanas la pérdida es notable y conviene tenerlo en cuenta.
- Requiere código personalizado (`custom_code`, `d3_mlx.py`): no es un modelo cargable con `transformers` estándar sin el glue incluido, lo que complica su integración en stacks convencionales.
- Solo validado en Apple Silicon con MLX; no hay evidencia de funcionamiento en CUDA, ROCm ni CPU.
- Licencia Apache 2.0 permite uso comercial, pero la model card indica que, en caso de conflicto, prevalece la licencia del repositorio original `vllm-sr/d3-flash`; conviene verificar los términos upstream antes de desplegar en producción.
- El repositorio no registra descargas ni interacciones y fue creado y actualizado el mismo día (21 de noviembre de 2026), lo que indica ausencia de validación comunitaria.
- El listado de ficheros de la model card menciona pesos "8-bit" en la sección Files, en contradicción con el título y el proceso descrito de 4 bits; conviene verificar el contenido real del repositorio antes de usarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sergolsub/mlx-d3-flash-9B-4bit
- Modelo base original: https://huggingface.co/vllm-sr/d3-flash
- No se han encontrado papers, blogs, repositorios adicionales ni demos en la información disponible.
