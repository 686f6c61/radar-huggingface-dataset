# mrutkows/granite-4.2-30b-bf16-mlx

## Resumen

El repositorio `mrutkows/granite-4.2-30b-bf16-mlx` contiene una conversion del modelo base `ibm-granite/granite-4.2-30b` al formato MLX, el framework de aprendizaje automatico de Apple para silicio de la serie M. Esta conversion permite ejecutar el modelo de forma nativa en Macs con Apple Silicon (M1, M2, M3, M4 o posteriores) mediante la libreria `mlx-lm`, sin necesidad de capas de compatibilidad adicionales.

El modelo original, desarrollado por IBM, pertenece a la familia Granite 4.2, una serie de modelos de lenguaje densos con arquitectura decoder-only disponibles en tamanos de 3B, 8B y 30B de parametros. Estos modelos destacan por su soporte nativo multilingue, capacidades de codificacion, generacion aumentada por recuperacion (RAG), uso de herramientas, salida JSON estructurada y un modo de razonamiento integrado (thinking mode) que permite cadenas de pensamiento explicitas.

La relevancia de esta conversion MLX radica en que democratiza el acceso a un modelo de 30B de parametros en hardware de consumo de Apple, con opciones de cuantizacion (bf16, q8 y q4) que permiten ajustar el equilibrio entre calidad y uso de memoria unificada. El modelo se publica bajo licencia Apache 2.0, lo que permite su uso tanto en investigacion como en aplicaciones comerciales sin restricciones significativas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Dense decoder-only transformer |
| Parametros totales | 30B (aproximadamente) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 128K tokens (segun especificaciones del modelo base) |
| Tipos de cuantizacion | bf16 (precision completa), q8 (8-bit, group-size 64), q4 (4-bit, group-size 64) |
| Idiomas soportados | 12 idiomas (segun informacion del repositorio de la comunidad) |
| Licencia | Apache 2.0 |
| Formato de pesos | MLX (Safetensors) |

## Arquitectura y entrenamiento

La familia Granite 4.2 utiliza arquitecturas densas decoder-only en tres tamanos: 3B, 8B y 30B de parametros. Los modelos se construyen mediante post-entrenamiento sobre los modelos base Granite 4.1, que ya habian completado la fase de pre-entrenamiento. El proceso de curacion de datos y entrenamiento fue disenado especificamente para escenarios empresariales y de personalizacion, incorporando evaluaciones de gobernanza, riesgo y cumplimiento (GRC) junto con los procedimientos estandar de depuracion de datos y revision de calidad documental de IBM.

Las innovaciones tecnicas mas destacables de Granite 4.2 incluyen un modo de pensamiento integrado (thinking mode) que genera bloques de razonamiento delimitados por las etiquetas ` thinking` y ` response`, con un parametro `reasoning_effort` que permite ajustar la profundidad del razonamiento entre "low" y "high". Ademas, incorpora un mecanismo de tool calling aumentado con razonamiento, que permite al modelo decidir que herramientas utilizar y como encadenarlas para resolver tareas complejas. El modelo soporta salida JSON estructurada de forma nativa, lo que facilita su integracion en pipelines de produccion.

La conversion a MLX fue realizada por la comunidad (autor `mrutkows`) utilizando la herramienta `mlx-lm`, que convierte los pesos originales al formato MLX para su ejecucion eficiente en Apple Silicon. El repositorio incluye un `generation_config.json` copiado del modelo base, aunque es importante senalar que `mlx-lm` solo consume automaticamente el `eos_token_id` de este archivo; los parametros de muestreo como `temperature` y `top_p` deben pasarse explicitamente en cada invocacion.

## Capacidades

- Generacion de texto en 12 idiomas con soporte multilingue nativo.
- Razonamiento mediante modo de pensamiento integrado (thinking mode) con control de profundidad via `reasoning_effort` ("low" o "high").
- Tool calling aumentado con razonamiento, que permite al modelo planificar y ejecutar llamadas a herramientas externas.
- Generacion de salida JSON estructurada, util para integraciones con APIs y sistemas empresariales.
- Soporte de retrieval-augmented generation (RAG) para tareas que requieren consulta de documentos externos.
- Amplia gama de tareas de codificacion, incluyendo generacion, explicacion y depuracion de codigo.
- Capacidad de desactivar el modo de pensamiento para obtener respuestas directas cuando no se requiere razonamiento explicito.

## Casos de uso

- Asistentes de codigo en entornos de desarrollo: el modelo puede generar, explicar y depurar codigo en multiples lenguajes, integrandose en IDEs o pipelines de CI/CD mediante su soporte de tool calling y salida JSON estructurada.
- Sistemas de atencion al cliente multilingue: con soporte para 12 idiomas y una ventana de contexto de 128K tokens, puede gestionar conversaciones multi-turno extensas y mantener el contexto de interacciones prolongadas.
- Generacion aumentada por recuperacion (RAG) empresarial: el modelo puede integrarse en sistemas que consultan bases de conocimiento corporativas, generando respuestas fundamentadas en documentos internos con citas y referencias.
- Automatizacion de procesos con agentes: gracias al tool calling aumentado con razonamiento, puede actuar como agente que planifica y ejecuta multiples pasos, consultando APIs y servicios externos de forma secuencial.
- Analisis y generacion de documentos estructurados: la capacidad de producir JSON valido de forma nativa lo hace adecuado para tareas de extraccion de informacion, clasificacion de texto y generacion de informes automatizados.
- Prototipado rapido en Macs con Apple Silicon: al ser una conversion MLX, permite a desarrolladores e investigadores ejecutar un modelo de 30B en hardware local de Apple sin necesidad de GPUs dedicadas, ideal para experimentacion y desarrollo iterativo.
- Razonamiento avanzado en aplicaciones educativas: el modo de pensamiento integrado permite desplegar tutores o asistentes que expliquen su proceso de razonamiento paso a paso, util en entornos de aprendizaje.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio de HuggingFace no incluye datos de evaluacion comparativa, y la documentacion de IBM para Granite 4.2 no proporciona cifras especificas en los resultados de busqueda obtenidos. Se recomienda consultar la model card completa del modelo base en `ibm-granite/granite-4.2-30b` para obtener datos de rendimiento detallados.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio indica que la variante bf16 requiere al menos 16 GB de memoria unificada en Apple Silicon. La variante q8 reduce el uso de memoria aproximadamente un 50 % respecto a bf16, y la variante q4 es adecuada para sistemas con 8 GB de memoria unificada.
- GPU recomendadas: cualquier Mac con Apple Silicon (M1, M2, M3, M4 o posteriores). No se requiere GPU dedicada, ya que MLX utiliza la memoria unificada del chip.
- Compatibilidad con hardware de consumo: si, en Macs con Apple Silicon con al menos 8 GB de RAM unificada (para la variante q4). La variante bf16 requiere 16 GB o mas.
- Opciones de despliegue: `mlx-lm` (paquete Python), ejecucion directa desde repositorio HuggingFace, o mediante `uvx` para ejecucion efimera sin instalacion persistente.
- Latencia y throughput: no disponible. El rendimiento dependera del chip Apple Silicon especifico y de la variante de cuantizacion utilizada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| `mrutkows/granite-4.2-30b-bf16-mlx` | 30B | 128K | Apache 2.0 | MLX | Conversion para Apple Silicon, precision bf16 |
| `mrutkows/granite-4.2-30b-q8-mlx` | 30B | 128K | Apache 2.0 | MLX | Cuantizacion 8-bit, ~50 % menos memoria que bf16 |
| `mrutkows/granite-4.2-30b-q4-mlx` | 30B | 128K | Apache 2.0 | MLX | Cuantizacion 4-bit, adecuado para 8 GB de memoria |
| `ibm-granite/granite-4.2-30b` | 30B | 128K | Apache 2.0 | Safetensors | Modelo base original, requiere GPUs CUDA o similar |

La comparativa entre las variantes MLX muestra el equilibrio entre calidad y requisitos de memoria: bf16 ofrece la maxima calidad pero requiere 16 GB de memoria unificada, mientras que q4 permite ejecutar el modelo en sistemas con solo 8 GB a costa de una menor fidelidad en la representacion de los pesos.

## Limitaciones y advertencias

- El repositorio es una conversion de la comunidad, no un lanzamiento oficial de IBM. Aunque se basa en el modelo original, la conversion puede introducir diferencias sutiles en el comportamiento respecto al modelo base.
- `mlx-lm` no lee los parametros `temperature` y `top_p` del `generation_config.json`; deben pasarse explicitamente en cada invocacion. Sin estos flags, se utilizan valores por defecto de `temp 0.0` (decodificacion greedy) y `top-p 1.0`, lo que puede producir respuestas menos variadas de lo esperado.
- El modo de pensamiento requiere invocacion explicita mediante `--prefill-response " thinking"` en la CLI, o la configuracion del chat template en Python. Sin esta configuracion, el modelo puede no generar el bloque de razonamiento.
- El modelo solo es compatible con Apple Silicon; no puede ejecutarse en GPUs NVIDIA o AMD sin una conversion adicional a otros formatos.
- Como cualquier modelo de lenguaje, existe riesgo de alucinacion, especialmente en tareas factuales o cuando se le pide informacion fuera de su dominio de entrenamiento.
- La ventana de contexto de 128K tokens es amplia, pero el rendimiento puede degradarse con contextos muy largos en hardware de consumo debido a limitaciones de memoria.
- Aunque la licencia Apache 2.0 permite uso comercial, es recomendable revisar los terminos especificos del modelo base y cualquier restriccion adicional que IBM pueda haber establecido en su documentacion oficial.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mrutkows/granite-4.2-30b-bf16-mlx
- Model card del modelo base: https://huggingface.co/ibm-granite/granite-4.2-30b
- Documentacion oficial de IBM Granite 4.2: https://www.ibm.com/granite/docs/models/granite4-2
- Pagina principal de IBM Granite: https://www.ibm.com/granite
- Repositorio GitHub de Granite 4.2: https://github.com/ibm-granite/granite-4.2-language-models
- Documentacion de mlx-lm: https://github.com/ml-explore/mlx-examples/tree/main/llms
- Framework MLX: https://github.com/ml-explore/mlx
