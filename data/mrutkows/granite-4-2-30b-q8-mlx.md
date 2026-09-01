# mrutkows/granite-4.2-30b-q8-mlx

## Resumen

El repositorio `mrutkows/granite-4.2-30b-q8-mlx` contiene una conversión del modelo base `ibm-granite/granite-4.2-30b` al formato MLX, cuantizada a 8 bits (group-size 64), pensada para inferencia nativa en hardware Apple Silicon (M1/M2/M3/M4 o posterior). El modelo original pertenece a la familia Granite 4.2 de IBM, una serie de modelos densos decoder-only de 30 000 millones de parámetros, post-entrenados sobre los modelos base Granite 4.1 y diseñados específicamente para escenarios empresariales.

La relevancia de esta variante radica en que permite ejecutar un modelo de 30B en equipos Apple con memoria unificada reducida, manteniendo una calidad alta gracias a la cuantización de 8 bits. El modelo base soporta capacidades multilingües, generación de código, recuperación aumentada (RAG), uso de herramientas, salida JSON estructurada y un modo de razonamiento integrado (thinking mode) basado en chain-of-thought. Todo ello se publica bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Dense decoder-only (Transformer) |
| Parametros totales | 30 000 millones (30B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | q8 (8-bit, group-size 64); tambien existen variantes bf16 y q4 |
| Idiomas soportados | Multilingue (lista especifica no disponible) |
| Licencia | Apache 2.0 |
| Formato de pesos | MLX (safetensors en formato MLX) |

## Arquitectura y entrenamiento

El modelo base Granite 4.2 30B emplea una arquitectura densa decoder-only, sin mezcla de expertos. Segun la documentacion de IBM, los modelos Granite 4.2 se post-entrenan sobre los modelos base Granite 4.1, cuyos detalles de pre-entrenamiento se describen en el blog oficial de IBM. El proceso de curado de datos y entrenamiento se diseno para entornos empresariales, incorporando evaluaciones de gobernanza, riesgo y cumplimiento (GRC) junto con los procedimientos estandar de limpieza de datos y revision de calidad documental de IBM.

La variante MLX aqui descrita es una conversion realizada con la herramienta `mlx-lm`, que adapta los pesos del modelo original al formato nativo de MLX para su ejecucion en Apple Silicon. No se dispone de informacion sobre el numero de tokens de entrenamiento ni sobre el uso de tecnicas como RLHF o DPO en el modelo base. El modelo incorpora un modo de pensamiento integrado que genera un bloque de razonamiento delimitado por las etiquetas ` thinking` y ` response` antes de la respuesta final, controlable mediante los parametros `enable_thinking` y `reasoning_effort` de la plantilla de chat.

## Capacidades

- Generacion de texto multilingue: el modelo base soporta multiples idiomas, aunque la lista concreta no se especifica en la informacion disponible.
- Generacion de codigo: cubre una amplia gama de tareas de programacion, segun la descripcion oficial de la familia Granite 4.2.
- Recuperacion aumentada (RAG): disenado para integrarse en flujos de generacion aumentada por recuperacion, comun en aplicaciones empresariales.
- Uso de herramientas (tool calling): soporta invocacion de funciones externas, lo que permite construir agentes que interactuan con APIs y servicios.
- Salida JSON estructurada: capaz de generar respuestas en formato JSON valido, util para integraciones con sistemas automatizados.
- Modo de razonamiento (thinking mode): chain-of-thought integrado con dos niveles de esfuerzo (`low` y `high`), activable o desactivable mediante la plantilla de chat.
- Inferencia en Apple Silicon: gracias a la conversion MLX, el modelo se ejecuta de forma nativa en hardware Apple M-series sin necesidad de GPU dedicada.

## Casos de uso

- Asistentes virtuales empresariales: el modelo puede gestionar conversaciones multilingues con contexto largo y razonamiento encadenado, lo que lo hace adecuado para atencion al cliente interna o externa en entornos corporativos.
- Generacion de codigo en entornos de desarrollo: con soporte para tool calling y salida JSON, puede integrarse en pipelines de CI/CD para autocompletar, revisar o documentar codigo automaticamente.
- Sistemas RAG sobre documentacion tecnica: su capacidad para recuperar y sintetizar informacion de documentos corporativos permite construir chatbots que respondan preguntas sobre manuales, normativas o bases de conocimiento internas.
- Automatizacion de tareas con agentes: el modo thinking y el tool calling permiten disenar agentes que planifican pasos, invocan APIs y ejecutan acciones de forma autonoma, por ejemplo en flujos de aprovisionamiento o monitorizacion.
- Procesamiento de datos con salida estructurada: la generacion de JSON valido facilita la extraccion de entidades, clasificacion de textos o rellenado de formularios en sistemas de back-office.
- Prototipado rapido en Mac: al ejecutarse en Apple Silicon con MLX, es una opcion practica para desarrolladores que necesitan probar un modelo de 30B localmente sin acceso a GPUs de centro de datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio no incluye tablas de rendimiento, y los resultados web consultados tampoco proporcionan metricas concretas (MMLU, HumanEval, GSM8K, etc.) para esta variante MLX ni para el modelo base Granite 4.2 30B.

## Requisitos de hardware

- Hardware objetivo: Apple Silicon (M1, M2, M3, M4 o posterior) con memoria unificada.
- Memoria estimada: la variante q8 reduce aproximadamente un 50 % el uso de memoria frente a la version bf16, segun la model card. El tamano del repositorio es de 31,1 GB, pero el consumo real en RAM depende del contexto y del sistema operativo.
- GPU recomendadas: no aplica, ya que MLX utiliza la GPU integrada de Apple Silicon; no es compatible con CUDA.
- Opciones de despliegue: inferencia y fine-tuning mediante el paquete `mlx-lm` (Python), o ejecucion efimera con `uvx --with "mlx[cpu]" mlx_lm.generate`.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

La comparativa se limita a las variantes del mismo modelo base, ya que no se dispone de datos de rendimiento frente a otros modelos de 30B.

| Modelo | Cuantizacion | Memoria estimada | Uso recomendado |
|---|---|---|---|
| `mrutkows/granite-4.2-30b-bf16-mlx` | bf16 | >= 16 GB memoria unificada | Maxima calidad |
| `mrutkows/granite-4.2-30b-q8-mlx` | q8 (8-bit) | ~50 % menos que bf16 | Equilibrio calidad/recursos |
| `mrutkows/granite-4.2-30b-q4-mlx` | q4 (4-bit) | Adecuado para 8 GB memoria unificada | Maxima eficiencia |

No se dispone de comparaciones con otros modelos de 30B de la misma categoria (por ejemplo, Llama 3 30B o Qwen 2.5 32B) en terminos de rendimiento, ya que no hay datos de benchmarks publicados en la informacion consultada.

## Limitaciones y advertencias

- Compatibilidad restringida: el formato MLX solo se ejecuta en Apple Silicon; no es utilizable en entornos con GPU NVIDIA o AMD sin una conversion adicional a otros formatos (GGUF, etc.).
- Perdida de precision por cuantizacion: la variante q8 puede presentar ligeras diferencias de calidad frente a la version bf16, especialmente en tareas de razonamiento complejo o generacion de codigo.
- Dependencia de `mlx-lm`: la inferencia requiere el paquete `mlx-lm` y una version de Python >= 3.9; ademas, `mlx-lm` no lee los parametros de temperatura y top-p del archivo `generation_config.json`, por lo que deben pasarse explicitamente en cada invocacion.
- Riesgo de alucinacion: como cualquier modelo generativo, puede producir respuestas incorrectas o inventadas, especialmente en dominios especializados; se recomienda validacion humana en entornos de produccion.
- Sesgos: no se ha publicado informacion sobre evaluaciones de sesgo para esta variante concreta; el modelo base fue sometido a evaluaciones GRC, pero los detalles no estan disponibles en la documentacion consultada.
- Limitaciones de contexto: la longitud de contexto no se especifica en la informacion disponible, por lo que no se puede garantizar un rendimiento optimo en conversaciones muy largas o documentos extensos.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mrutkows/granite-4.2-30b-q8-mlx
- Modelo base: https://huggingface.co/ibm-granite/granite-4.2-30b
- Coleccion Granite 4.2 en HuggingFace: https://huggingface.co/collections/ibm-granite/granite-42-language-models
- Blog de IBM sobre Granite 4.2: https://huggingface.co/blog/ibm-granite/granite-4-2
- Repositorio GitHub de Granite 4.2: https://github.com/ibm-granite/granite-4.2-language-models
- Documentacion oficial de IBM Granite: https://www.ibm.com/granite/docs/models/granite4-2
- Pagina principal de IBM Granite: https://www.ibm.com/granite
- Herramienta de conversion mlx-lm: https://github.com/ml-explore/mlx-examples/tree/main/llms
