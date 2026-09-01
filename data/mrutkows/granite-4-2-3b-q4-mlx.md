# mrutkows/granite-4.2-3b-q4-mlx

## Resumen

El modelo `mrutkows/granite-4.2-3b-q4-mlx` es una conversión a formato MLX del modelo base `ibm-granite/granite-4.2-3b`, desarrollado por IBM como parte de la familia Granite 4.2. Esta variante concreta está cuantizada a 4 bits (group-size 64) y está diseñada para ejecutarse de forma nativa en hardware Apple Silicon (M1/M2/M3/M4) mediante el framework MLX. El objetivo principal es ofrecer un modelo de lenguaje de 3 mil millones de parámetros con capacidades avanzadas —razonamiento con thinking mode, tool calling, generación de JSON estructurado y soporte multilingüe— en equipos con memoria unificada reducida, como los Mac con 8 GB de RAM.

La relevancia de este modelo radica en que democratiza el acceso a un LLM de nivel empresarial con licencia Apache 2.0, permitiendo su uso tanto en investigación como en producción comercial sin coste de licencia. Al estar cuantizado a 4 bits, ocupa aproximadamente 2,1 GB en disco y puede ejecutarse en dispositivos Apple con recursos limitados, lo que lo convierte en una opción atractiva para desarrollo local, prototipado rápido y aplicaciones edge. La conversión ha sido realizada por un tercero (mrutkows) a partir del modelo oficial de IBM, manteniendo la arquitectura densa decoder-only y las capacidades del modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso decoder-only |
| Parametros totales | 572.008.960 (archivo safetensors cuantizado; el modelo base tiene 3B) |
| Parametros activos | No aplica (arquitectura densa, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | q4 (4-bit, group-size 64) |
| Idiomas soportados | Multilingue (idiomas no especificados en la informacion) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo base Granite 4.2 3B es un transformer denso decoder-only, post-entrenado a partir de los modelos Granite 4.1. Segun la documentacion oficial de IBM, la familia Granite 4.2 incorpora un modo de razonamiento integrado (thinking mode) que genera cadenas de pensamiento antes de la respuesta final, asi como soporte nativo para tool calling, generacion de JSON estructurado y retrieval-augmented generation (RAG). El proceso de entrenamiento incluye curacion de datos orientada a escenarios empresariales, con evaluaciones de gobernanza, riesgo y cumplimiento (GRC) ademas de los procedimientos estandar de limpieza de IBM.

La variante MLX aqui descrita no modifica la arquitectura del modelo base; simplemente convierte los pesos al formato MLX y aplica cuantizacion de 4 bits con group-size 64. No se dispone de informacion detallada sobre el dataset de entrenamiento, el numero de tokens o el uso de tecnicas como RLHF o DPO en la informacion proporcionada. La conversion fue realizada con la herramienta `mlx-lm` del repositorio mlx-examples.

## Capacidades

- Generacion de texto y respuestas conversacionales en multiples idiomas (capacidad multilingue declarada, sin lista concreta de idiomas).
- Razonamiento extendido mediante thinking mode integrado, que produce una cadena de pensamiento antes de la respuesta final. Se puede activar o desactivar via parametros del chat template (`enable_thinking` y `reasoning_effort`).
- Soporte de tool calling / function calling, lo que permite al modelo invocar herramientas externas durante la generacion.
- Generacion de JSON estructurado, util para integraciones con APIs y pipelines de datos.
- Capacidades de retrieval-augmented generation (RAG), facilitando la respuesta a consultas sobre documentos corporativos.
- Soporte de tareas de codificacion, incluyendo generacion y explicacion de codigo en diversos lenguajes.
- Ejecucion nativa en Apple Silicon gracias a la conversion MLX, con cuantizacion de 4 bits para reducir el uso de memoria.

## Casos de uso

- Atencion al cliente automatizada: el modelo puede gestionar conversaciones multi-turno en varios idiomas, utilizando tool calling para consultar bases de datos de clientes o sistemas de tickets. Su capacidad de razonamiento permite resolver consultas complejas y escalar a un agente humano cuando sea necesario.
- Generacion de codigo en entornos de desarrollo: integrado en un IDE o CLI, el modelo puede sugerir fragmentos de codigo, explicar funciones existentes o generar tests. Su soporte de JSON estructurado facilita la salida en formatos parseables por herramientas de CI/CD.
- Asistente de documentacion interna con RAG: conectado a un indice vectorial de documentacion corporativa, el modelo responde preguntas sobre politicas, procedimientos o especificaciones tecnicas, citando las fuentes relevantes. Su thinking mode mejora la precision en consultas que requieren razonamiento multi-paso.
- Extraccion de datos estructurados: el modelo puede convertir texto no estructurado (correos, informes, actas) en JSON con campos definidos, listo para ser consumido por bases de datos o sistemas de automatizacion. Esto es posible gracias a su capacidad de generar salidas JSON validas.
- Prototipado rapido de aplicaciones de IA en Mac: al ejecutarse localmente con solo 8 GB de memoria unificada, permite a desarrolladores e investigadores experimentar con un LLM de 3B sin depender de servicios en la nube. Es ideal para pruebas de concepto y desarrollo iterativo.
- Agente conversacional para soporte tecnico: combinando tool calling y thinking mode, el modelo puede diagnosticar problemas, consultar documentacion tecnica y proponer soluciones paso a paso, manteniendo el contexto de la conversacion durante multiples turnos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de datos de MMLU, HumanEval, GSM8K u otras evaluaciones estandar para esta variante cuantizada ni para el modelo base en la documentacion proporcionada.

## Requisitos de hardware

- VRAM estimada: 8 GB de memoria unificada para la variante q4, segun la model card del autor. La variante bf16 requiere al menos 16 GB.
- GPU recomendadas: Apple Silicon (M1, M2, M3, M4 o posteriores). No es compatible con GPUs NVIDIA o AMD.
- Cabe en consumer GPU: si, en cualquier Mac con Apple Silicon y 8 GB de RAM unificada o superior.
- Opciones de despliegue: mediante el paquete `mlx-lm` (Python) o la herramienta CLI `mlx_lm.generate`. Tambien se puede ejecutar de forma efimera con `uvx`. No se mencionan otros frameworks como vLLM, llama.cpp u Ollama.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

La siguiente tabla compara este modelo con otras alternativas de 3B de parametros, basandose en caracteristicas generales conocidas. Los datos de contexto y rendimiento de este modelo no estan disponibles, por lo que se indican como tales.

| Modelo | Parametros | Contexto | Licencia | Formato |
|---|---|---|---|---|
| mrutkows/granite-4.2-3b-q4-mlx | 3B (cuantizado) | No disponible | Apache 2.0 | MLX (safetensors) |
| Llama 3.2 3B | 3B | 128K (segun documentacion oficial) | Llama 3.2 Community License | PyTorch, GGUF, MLX |
| Qwen 2.5 3B | 3B | 32K (segun documentacion oficial) | Apache 2.0 | PyTorch, GGUF, MLX |

Nota: los datos de contexto de Llama 3.2 y Qwen 2.5 provienen de conocimiento general y no de la informacion proporcionada. No se dispone de datos de rendimiento comparativo.

## Limitaciones y advertencias

- Sesgos: al ser un modelo entrenado por IBM con curacion de datos empresarial, puede heredar sesgos presentes en los datos de entrenamiento. No se han publicado evaluaciones especificas de sesgo para esta variante.
- Riesgo de alucinacion: como cualquier LLM, puede generar informacion falsa o inventada, especialmente en dominios especializados. Se recomienda validar las salidas en aplicaciones criticas.
- Limitaciones de contexto: la longitud de contexto no se ha especificado en la informacion disponible. Se desconoce si la cuantizacion afecta al manejo de contextos largos.
- Restricciones de licencia: la licencia Apache 2.0 permite uso comercial y modificacion, pero se debe mantener el aviso de copyright y la atribucion. No hay restricciones adicionales conocidas.
- Caveat de conversion: al ser una conversion de terceros, podria haber diferencias sutiles en el comportamiento respecto al modelo original de IBM. Se recomienda verificar el rendimiento en tareas especificas antes de desplegarlo en produccion.
- Dependencia de hardware: el modelo solo funciona en Apple Silicon; no es portable a otras arquitecturas sin reconvertir los pesos.

## Enlaces

- Repositorio HuggingFace del modelo: https://huggingface.co/mrutkows/granite-4.2-3b-q4-mlx
- Modelo base en HuggingFace: https://huggingface.co/ibm-granite/granite-4.2-3b
- Coleccion Granite 4.2 de IBM: https://huggingface.co/collections/ibm-granite/granite-42-language-models
- Documentacion oficial de Granite 4.2: https://www.ibm.com/granite/docs/models/granite4-2
- Repositorio GitHub de Granite 4.2: https://github.com/ibm-granite/granite-4.2-language-models
- Herramienta mlx-lm: https://github.com/ml-explore/mlx-examples/tree/main/llms
