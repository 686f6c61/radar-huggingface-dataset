# salohcin714/granite-4.2-3b-2bit-gptq-mlx

## Resumen

El modelo `salohcin714/granite-4.2-3b-2bit-gptq-mlx` es una conversión cuantizada del modelo base `ibm-granite/granite-4.2-3b`, realizada por un tercero (salohcin714) para ejecutarse en Apple Silicon mediante la librería MLX. El modelo original, desarrollado por IBM, pertenece a la familia Granite 4.2, que se caracteriza por ser un modelo denso decoder-only con capacidades de razonamiento chain-of-thought, modos de pensamiento flexibles y tool calling aumentado con razonamiento. Esta versión cuantizada a 2 bits (con grupo de cuantización de 64) reduce el tamaño del modelo a aproximadamente 1,3 GB, lo que permite su ejecución en dispositivos Apple con memoria unificada limitada.

La relevancia de este artefacto radica en que ofrece una versión extremadamente ligera de un modelo de razonamiento moderno, pensada para despliegues locales en hardware de consumo. Sin embargo, es importante señalar que se trata de una cuantización agresiva (2 bits) que puede degradar la calidad de las respuestas en comparación con el modelo original, y que no ha sido fine-tuneada ni validada por IBM. El repositorio no está afiliado a IBM y los benchmarks publicados por IBM se refieren exclusivamente a los pesos originales, no a esta conversión.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso decoder-only (Granite 4.2) |
| Parametros totales | 3B (modelo base); 375.400.960 en el safetensors cuantizado (tras eliminar pesos atados) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | 2-bit affine quantization, group size 64, via GPTQ Hessian-based calibration |
| Idiomas soportados | en, de, es, fr, ja, pt, ar, cs, it, ko, nl, zh (12 idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | MLX safetensors (tambien compatible con el ecosistema MLX) |

## Arquitectura y entrenamiento

El modelo base `ibm-granite/granite-4.2-3b` es un transformer denso decoder-only, post-entrenado sobre los modelos base Granite 4.1. Segun la documentacion oficial de IBM, la familia Granite 4.2 incorpora razonamiento chain-of-thought integrado, modos de pensamiento flexibles (thinking mode) y tool calling aumentado con razonamiento. No se dispone de datos publicos sobre el numero exacto de tokens de entrenamiento ni sobre la composicion del dataset.

La conversion realizada por salohcin714 consiste en transformar los pesos originales al formato MLX safetensors y aplicar una cuantizacion de 2 bits con grupo de 64, calibrada mediante el metodo GPTQ basado en Hessian. Se eliminaron los pesos redundantes del `lm_head.weight` en los puntos donde el modelo ata las embeddings de entrada y salida. No se realizo fine-tuning ni se anadieron datos de entrenamiento adicionales.

## Capacidades

- Generacion de texto y conversacion multi-turno en 12 idiomas (aleman, arabe, checo, chino, coreano, espanol, frances, ingles, italiano, japones, neerlandes y portugues).
- Razonamiento chain-of-thought integrado, con capacidad de activar o desactivar el modo de pensamiento segun la tarea.
- Tool calling aumentado con razonamiento, lo que permite al modelo decidir que herramientas invocar y como estructurar las llamadas.
- Generacion de codigo y asistencia en tareas de programacion, segun las capacidades declaradas de la familia Granite 4.2.
- Soporte de agentes y razonamiento multi-paso, gracias al entrenamiento especifico en razonamiento y planificacion.
- Capacidad multilingue amplia, cubriendo los principales idiomas europeos y asiaticos.

## Casos de uso

- Asistente conversacional local en Mac: al ser un modelo de 1,3 GB en formato MLX, puede ejecutarse en un Mac con Apple Silicon (incluso con 8 GB de RAM unificada) para ofrecer un chatbot privado sin conexion, usando la API de `mlx-lm`.
- Generacion de codigo en entornos de desarrollo: el modelo puede integrarse en editores o pipelines de CI/CD para sugerencias de codigo, explicaciones de fragmentos o generacion de tests, aprovechando su capacidad de tool calling.
- Razonamiento y analisis de documentos: su modo de pensamiento permite desglosar problemas complejos en pasos intermedios, util para tareas de analisis de requisitos, resumen de informes o toma de decisiones asistida.
- Traduccion automatica entre los 12 idiomas soportados: aunque no es un modelo de traduccion dedicado, puede generar texto en multiples idiomas con razonamiento contextual.
- Prototipado rapido de aplicaciones de IA en Apple Silicon: desarrolladores que trabajan con MLX pueden usar este modelo como base para experimentar con agentes, tool calling o generacion estructurada sin necesidad de GPU dedicada.
- Educacion y formacion: al ser ligero y de codigo abierto (Apache 2.0), es adecuado para entornos academicos donde se quiera ensenar conceptos de cuantizacion, inferencia local o razonamiento de modelos sin requerir hardware costoso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio indica explicitamente que los benchmarks publicados por IBM se refieren a los pesos originales de `ibm-granite/granite-4.2-3b` y no deben interpretarse como resultados de esta version cuantizada. Dado que la cuantizacion de 2 bits introduce una perdida significativa de precision, es esperable que el rendimiento en tareas como MMLU, HumanEval o GSM8K sea inferior al del modelo original, pero no se dispone de datos cuantitativos para confirmarlo.

## Requisitos de hardware

- Almacenamiento: aproximadamente 1,3 GB para los pesos en formato MLX safetensors.
- Memoria: al ser un modelo de 3B cuantizado a 2 bits, la memoria necesaria para cargar los pesos es de unos 375 MB (dado el numero de parametros almacenados), aunque la memoria total requerida durante la inferencia dependera del contexto y del runtime. En la practica, un Mac con 8 GB de RAM unificado deberia ser suficiente para ejecutar el modelo con ventanas de contexto moderadas.
- GPU: disenado exclusivamente para Apple Silicon (M1, M2, M3, M4 y variantes Pro/Max/Ultra). No es compatible con CUDA ni con GPUs de NVIDIA/AMD.
- Opciones de despliegue: se puede usar con `mlx-lm` (libreria de MLX para Python), que es el metodo recomendado en la model card. Tambien es posible integrarlo en aplicaciones Swift mediante el framework MLX de Apple.
- Latencia y throughput: no se han publicado mediciones especificas para esta cuantizacion. En general, los modelos de 3B en MLX con cuantizacion de 2 bits pueden generar tokens a velocidades de decenas de tokens por segundo en chips M2 o superiores, pero estos valores son estimaciones y no datos verificados.

## Comparativa con modelos similares

No se dispone de datos de rendimiento comparativos para esta cuantizacion especifica. Como referencia estructural, se puede comparar con otras versiones cuantizadas de modelos de 3B para Apple Silicon:

| Modelo | Tamano | Cuantizacion | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| salohcin714/granite-4.2-3b-2bit-gptq-mlx | 3B | 2-bit GPTQ | No disponible | Apache 2.0 | MLX safetensors |
| ibm-granite/granite-4.2-3b (original) | 3B | FP16/BF16 | No disponible | Apache 2.0 | safetensors |
| Otros modelos 3B cuantizados (p.ej. Llama 3.2 3B, Qwen 2.5 3B) | 3B | Variable | Variable | Variable | Variable |

La comparacion directa no es posible sin datos de benchmarks. La principal diferencia frente al modelo original es la reduccion de tamano (de varios GB a 1,3 GB) a costa de una precision significativamente menor. Frente a otros modelos de 3B, Granite 4.2 destaca por su enfoque en razonamiento y tool calling, pero la cuantizacion de 2 bits puede anular parte de esas ventajas.

## Limitaciones y advertencias

- Cuantizacion de 2 bits: la perdida de precision es severa y puede provocar respuestas incoherentes, errores de razonamiento o alucinaciones frecuentes. No es recomendable para tareas que requieran alta fidelidad.
- Sin validacion de IBM: este repositorio no esta afiliado a IBM y los benchmarks publicados por IBM no aplican a esta version. El rendimiento real puede diferir sustancialmente del modelo original.
- Sin fine-tuning: la conversion no incluye ajuste adicional, por lo que el modelo conserva los sesgos y limitaciones del modelo base Granite 4.2.
- Sesgos y alucinaciones: como cualquier modelo de lenguaje, puede generar contenido sesgado o falso, especialmente en contextos de baja precision como este.
- Limitaciones de contexto: no se ha especificado la longitud de contexto soportada. Se recomienda asumir una ventana corta (probablemente 4K-8K tokens) debido a las restricciones de memoria en hardware Apple.
- Restricciones de licencia: aunque la licencia es Apache 2.0, el uso comercial esta permitido, pero se debe mantener la atribucion y los avisos de licencia. El nombre "Granite" es una marca de IBM y se usa de forma descriptiva.
- Soporte limitado: al ser un repositorio de un tercero con 0 descargas y 0 likes, no hay garantia de mantenimiento ni soporte.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/salohcin714/granite-4.2-3b-2bit-gptq-mlx
- Modelo base (IBM Granite 4.2 3B): https://huggingface.co/ibm-granite/granite-4.2-3b
- Coleccion Granite 4.2 de IBM: https://huggingface.co/collections/ibm-granite/granite-42-language-models
- Repositorio GitHub de Granite 4.2: https://github.com/ibm-granite/granite-4.2-language-models
- Documentacion oficial de IBM Granite 4.2: https://www.ibm.com/granite/docs/models/granite4-2
- Libreria MLX: https://github.com/ml-explore/mlx-lm
