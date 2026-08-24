# mradermacher/Ornith-1.0-35B-abliterix-GGUF

## Resumen

Ornith-1.0-35B-abliterix-GGUF es una cuantización GGUF del modelo Ornith-1.0-35B en su variante "abliterix", preparada por mradermacher. El modelo base lo desarrolla ornith-ai y pertenece a una familia de modelos de código agénticos que incluye una versión densa de 9B y dos variantes MoE de 35B y 397B. La variante "abliterix" es una versión sometida a abliteración, una técnica que elimina las negativas de seguridad del modelo (refusals) para permitir respuestas sin restricciones de contenido.

El modelo original Ornith-1.0-35B es un modelo de razonamiento con arquitectura Mixture of Experts basada en qwen3.5, con una ventana de contexto de 262.144 tokens (256K) y soporte nativo de tool calling. Se distribuye en formato GGUF en varias cuantizaciones (de Q2_K a Q8_0) para poder ejecutarse en equipos con recursos limitados. Está orientado a tareas de codificación agéntica, razonamiento multistep y generación de código, con soporte multilingüe para inglés y chino.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE) basada en qwen3.5 |
| Parametros totales | 35B (no se indica el desglose exacto de expertos) |
| Parametros activos | no disponible |
| Longitud de contexto | 262.144 tokens (256K) |
| Tipos de cuantizacion | x-f16, Q4_K_S, Q2_K, Q8_0, Q6_K, Q3_K_M, Q3_K_S, Q3_K_L, Q4_K_M, Q5_K_S, Q5_K_M, IQ4_XS |
| Idiomas soportados | ingles, chino |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

Ornith-1.0-35B es un modelo de razonamiento con arquitectura Mixture of Experts. Segun la informacion disponible, esta basado en la familia qwen3.5 y expone una interfaz compatible con OpenAI. El modelo abre cada turno del asistente con un bloque de razonamiento interno (thinking) antes de generar la respuesta final, y estructura las llamadas a herramientas mediante bloques `<tool_call>`. La version abliterix es una adaptacion que elimina el refusal del modelo, de modo que responde a cualquier peticion sin negarse, manteniendo la arquitectura y el entrenamiento originales.

No se dispone de datos publicos sobre el entrenamiento del modelo: numero de tokens de entrenamiento, composicion del dataset, uso de RLHF/DPO ni otras tecnicas de alineacion. Tampoco se documentan innovaciones tecnicas especificas mas alla del soporte de ventana larga y el modo de razonamiento explicito. La variante GGUF ha sido cuantizada por mradermacher a partir de los pesos originales de inkOrCloud/Ornith-1.0-35B-abliterix.

## Capacidades

- Razonamiento multistep: el modelo abre un bloque de thinking interno antes de responder, lo que permite cadenas de razonamiento complejas.
- Tool calling / function calling: genera bloques <tool_call> que pueden parsearse como tool_calls estilo OpenAI para integrar el modelo en agentes.
- Generacion de codigo: orientado a tareas de programacion, con capacidad de generar, revisar y depurar codigo.
- Codificacion agente: el modelo puede estructurar flujos de trabajo de codificacion autonomos con scaffolding propio, segun la documentacion de Ornith AI.
- Ventana de contexto larga: soporta hasta 262.144 tokens, adecuado para repositorios completos o documentos extensos.
- Multilingue: soporta ingles y chino.
- Interfaz compatible con OpenAI: expone una API compatible, facilitando la integracion con herramientas existentes.
- Abliteracion: la version "abliterix" no muestra refusal ante peticiones que el modelo original rechazaria.

## Casos de uso

- **Generacion de codigo en produccion**: el modelo puede generar funciones, clases o scripts completos y validarlos con su modo de razonamiento, integrándose en pipelines de CI/CD mediante su interfaz OpenAI-compatible.
- **Agentes de codificacion autonomos**: gracias al soporte de tool calling y al razonamiento multistep, puede usarse como motor de un agente que planifica, escribe, ejecuta y depura codigo de forma iterativa.
- **Revision de codigo y auditoria**: con su contexto de 256K, puede analizar repositorios completos, detectar errores, sugerir mejoras y explicar logica de componentes complejos.
- **Soporte tecnico automatizado**: puede gestionar conversaciones multi-turno con contexto largo, interpretar preguntas tecnicas y generar respuestas con pasos de razonamiento, adecuado para sistemas de atencion al cliente.
- **Analisis de documentos extensos**: su ventana de 262.144 tokens permite procesar documentacion tecnica, contratos o informes completos de una sola vez, extrayendo informacion y respondiendo preguntas.
- **Prototipado rapido de aplicaciones**: puede generar bocetos de aplicaciones, scripts de automatizacion y ejemplos de integracion de APIs, reduciendo el tiempo de inicio de proyectos.
- **Traduccion tecnica**: al soportar ingles y chino, puede traducir documentacion tecnica, comentarios de codigo y especificaciones entre ambos idiomas con razonamiento contextual.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras evaluaciones comparativas para Ornith-1.0-35B-abliterix.

## Requisitos de hardware

- **VRAM estimada**: no se dispone de datos exactos por cuantizacion. Como referencia, la variante densa de 9B del mismo proyecto cabe en una GPU de 80GB; el MoE de 35B se disena para ejecutarse en un nodo multi-GPU con tensor parallelism. En formato GGUF, las cuantizaciones bajas (Q2_K, Q3_K) podrian caber en GPUs consumer de 24GB, aunque no hay datos confirmados.
- **GPU recomendadas**: para uso local, GPUs de 24GB o mas (RTX 3090, RTX 4090) con las cuantizaciones mas bajas; para la version completa o cuantizaciones altas, se recomienda un nodo con varias GPUs de 80GB (A100, H100).
- **Opciones de despliegue**: llama.cpp, Ollama, vLLM, TGI, y cualquier servidor que soporte GGUF y el formato de tool calls del modelo.
- **Latencia y throughput**: no se conocen datos publicos de latencia ni throughput para esta version.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Arquitectura | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ornith-1.0-35B-abliterix (este) | 35B (MoE) | 262.144 | MoE basada en qwen3.5 | apache-2.0 | GGUF |
| Ornith-1.0-35B (original) | 35B (MoE) | 262.144 | MoE basada en qwen3.5 | apache-2.0 | pesos originales |
| Ornith-1.0-9B (dense) | 9B | 262.144 | Dense | apache-2.0 | pesos originales |
| Qwen3-32B | 32B | 131.072 | Dense | apache-2.0 | pesos originales y GGUF |

No se dispone de comparaciones de rendimiento numerico entre estos modelos, ya que Ornith-1.0-35B no tiene benchmarks publicados.

## Limitaciones y advertencias

- **Abliteracion**: la version "abliterix" ha eliminado las negativas del modelo, lo que significa que puede generar contenido inapropiado, ofensivo o peligroso sin filtros. No debe desplegarse en entornos de produccion donde se requiera moderacion de contenido.
- **Sesgos desconocidos**: al no publicarse datos de entrenamiento ni evaluaciones de sesgos, no se pueden descartar sesgos de genero, raza, religion u otros presentes en el modelo base.
- **Riesgo de alucinacion**: como modelo de razonamiento, puede generar cadenas de pensamiento coherentes pero incorrectas; no se recomienda para diagnostico medico, legal o financiero sin validacion externa.
- **Idiomas limitados**: aunque soporta ingles y chino, no hay garantia de calidad en otros idiomas; el uso en espanol u otros idiomas puede producir resultados suboptimos.
- **Sin benchmarks**: la ausencia de evaluaciones publicas impide comparar su rendimiento real con modelos alternativos; las decisiones de despliegue deben basarse en pruebas propias.
- **Modelo reciente y sin adopcion**: en el momento de la consulta, el repositorio tiene 0 descargas y 0 likes, lo que sugiere que no ha sido validado por la comunidad.
- **Licencia**: aunque la licencia es apache-2.0, la version "abliterix" puede no cumplir las politicas de uso de ciertas plataformas de hosting o de los modelos base.

## Enlaces

- https://huggingface.co/mradermacher/Ornith-1.0-35B-abliterix-GGUF
- https://huggingface.co/inkOrCloud/Ornith-1.0-35B-abliterix
- https://huggingface.co/ornith-ai/Ornith-1.0-35B-GGUF
- https://github.com/ornith-ai/Ornith-1
- https://ornith.online/
- https://www.modelscope.cn/models/deepreinforce-ai/Ornith-1.0-35B-GGUF
