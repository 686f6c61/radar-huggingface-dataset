# PreDoctor/Qwen3.8-27B-NVFP4-W4A16-WebGPU

## Resumen

Qwen3.8-27B-NVFP4-W4A16-WebGPU es un paquete de despliegue para navegador del modelo Qwen3.8-27B, convertido por PreDoctor a una cuantización NVFP4 (pesos de 4 bits) con activaciones FP16 (W4A16) y empaquetado en un formato propietario `.pwlm` para el runtime WebGPU protegido de predoctor.ai. No es un checkpoint estándar de Transformers, sino un artefacto específico para ejecución en navegador con Chrome 151 y WebGPU/D3D12, con kernels fusionados para todas las operaciones del transformer.

El paquete incluye únicamente el modelo de lenguaje de 64 capas y el tokenizer; no incorpora el encoder de visión ni el asistente MTP del checkpoint original. Está diseñado para ejecutarse íntegramente en el cliente, con descarga verificada por chunks de 64 MiB, caché persistente en OPFS y soporte de contexto lógico de hasta 262.144 tokens mediante almacenamiento KV persistente en IndexedDB. La licencia es Apache 2.0.

La relevancia de esta publicación radica en que permite ejecutar un modelo de 27B con razonamiento y tool calling directamente en el navegador sin servidor intermedio, aprovechando WebGPU para inferencia local. Es una opción interesante para aplicaciones web con requisitos de privacidad o sin infraestructura de GPU dedicada, aunque está limitada a un runtime y navegador concretos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso de 64 capas, basado en Qwen3.8-27B; kernels fusionados para Q/K/V, Gate/Up + SiLU, Down, Gated DeltaNet, atencion completa, RMSNorm/residual y token head |
| Parametros totales | 27B (segun denominacion del modelo base) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262.144 tokens (nativo del modelo); 16.384 tokens residentes por defecto en el runtime WebGPU |
| Tipos de cuantizacion | NVFP4 (pesos 4 bits) / FP16 (activaciones), esquema W4A16 |
| Idiomas soportados | No disponible en la publicacion; el modelo base Qwen3.8 es multilingue |
| Licencia | Apache 2.0 |
| Formato de pesos | Formato propietario PWL (`.pwlm`) para WebGPU; no es safetensors ni GGUF |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B es un transformer denso de 27.000 millones de parametros con capacidades de vision, razonamiento y uso de herramientas, entrenado por Qwen con una ventana de contexto de 262.144 tokens. La publicacion de PreDoctor extrae unicamente el modelo de lenguaje (64 capas) y lo convierte a NVFP4/W4A16, un esquema de cuantizacion de pesos de 4 bits con activaciones de 16 bits, disenado para maximizar el rendimiento en GPUs consumer con WebGPU.

El runtime implementa kernels fusionados personalizados para todas las operaciones del transformer, incluyendo un mecanismo de atencion hibrido que combina atencion completa con Gated DeltaNet, segun se describe en la model card. La conversion a NVFP4 no es bit-idéntica al checkpoint BF16 original; la etiqueta `numericLossless=true` se refiere exclusivamente a la transformacion de layout de los tensores Gate/Up respecto al paquete NVFP4 previo, no a una ausencia de perdida frente al modelo original. No se proporcionan datos sobre el dataset de entrenamiento del modelo base en esta publicacion.

## Capacidades

- Generacion de texto y razonamiento multi-paso con soporte de modo pensamiento (`enable_thinking`, `reasoning_effort`).
- Tool calling y function calling mediante formato XML oficial de Qwen3.8 (`<tool_call>`, `<tool_response>`).
- Orquestacion de agentes con integracion Viewer AgentRunner, que valida esquemas y allowlists antes de ejecutar acciones.
- Contexto largo: hasta 262.144 tokens logicos con almacenamiento KV persistente en IndexedDB.
- Multilingue (heredado del modelo base, aunque no se detallan los idiomas en esta publicacion).
- Ejecucion 100% en el navegador sin envio de datos a servidores externos.

## Casos de uso

- Asistente de chat privado en el navegador: el modelo se ejecuta localmente con WebGPU, por lo que los prompts y respuestas no salen del dispositivo; adecuado para entornos con requisitos estrictos de confidencialidad.
- Generacion de codigo en IDE web: soporta tool calling y puede integrarse en editores online para autocompletar, refactorizar o explicar fragmentos, con contexto largo para archivos extensos.
- Agente de automatizacion de tareas en la web: gracias a la integracion con AgentRunner, puede gestionar flujos multi-paso como rellenar formularios, extraer datos o coordinar APIs, siempre con aprobacion humana.
- Procesamiento de documentos largos: con 262K tokens de contexto logico, puede resumir o responder preguntas sobre libros, informes o codigo fuente extenso sin necesidad de RAG.
- Prototipado rapido de aplicaciones de IA: al no requerir infraestructura de servidor, es util para demos y pruebas de concepto en el navegador con un unico comando de carga.
- Educacion y formacion: permite a estudiantes ejecutar un modelo de 27B localmente en sus equipos para experimentar con razonamiento y agentes sin costes de cloud.

## Benchmarks y rendimiento

La publicacion no incluye benchmarks de calidad generales (MMLU, HumanEval, etc.) para esta conversion concreta. Proporciona las siguientes metricas de verificacion fija:

| Medicion | Resultado |
|---|---|
| Throughput en RTX 4090 (scheduler de produccion) | ~30,66 tokens/s |
| Top-1 agreement frente al checkpoint de referencia | 96,55% |
| Divergencia KL media (corpus fijo) | 0,02289 |
| Incremento de perplexity (corpus fijo) | 0,01772 |

Del modelo base Qwen3.8-27B, segun fuentes externas, se reportan DeepSWE 42.2, Terminal Bench 73.0 y OSWorld 84.3, pero estos valores corresponden al checkpoint original sin cuantizar y no a esta conversion WebGPU.

## Requisitos de hardware

- GPU compatible con WebGPU/D3D12 y `shader-f16`; validado en Windows Chrome 151 con 32-lane subgroups.
- VRAM estimada: el repositorio ocupa 17 GB; se requiere al menos 16-20 GB de VRAM o memoria compartida para el contexto residente de 16.384 tokens. El contexto logico de 262K tokens utiliza paginacion KV a memoria CPU/IndexedDB.
- GPU recomendadas: RTX 4090 (probada, ~30,66 tok/s), RTX 4080/4070 Ti Super, o GPUs AMD con soporte WebGPU completo.
- No cabe en GPUs consumer de gama baja (8 GB o menos) debido al tamaño del modelo y las activaciones FP16.
- Despliegue exclusivamente via navegador Chrome 151+ con WebGPU; no es compatible con vLLM, llama.cpp, Ollama o TGI.
- La descarga se realiza en chunks de 64 MiB con verificacion SHA-256; se requiere conexion estable para la primera carga.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Formato | Licencia |
|---|---|---|---|---|---|
| Qwen3.8-27B (base) | 27B | 262K | BF16 | safetensors | Apache 2.0 |
| unsloth/Qwen3.8-27B-NVFP4 | 27B | 262K | NVFP4 | safetensors/GGUF | Apache 2.0 |
| PreDoctor/Qwen3.8-27B-NVFP4-W4A16-WebGPU | 27B | 262K (logico) | NVFP4/W4A16 | PWL (WebGPU) | Apache 2.0 |
| RadixArk/Qwen3.8-27B-NVFP4 | 27B | 262K | NVFP4 | safetensors | Apache 2.0 |

La diferencia principal de esta publicacion frente a las alternativas es su orientacion exclusiva a WebGPU en navegador; las versiones de Unsloth y RadixArk son checkpoints estandar utilizables con Transformers o llama.cpp. No se dispone de datos de rendimiento comparativo entre estas versiones.

## Limitaciones y advertencias

- Es una cuantizacion NVFP4 que no es bit-idéntica al checkpoint BF16 original; puede haber degradacion en tareas de alta precision.
- No incluye el encoder de vision ni el asistente MTP del modelo base; solo texto.
- Requiere Chrome 151 en Windows con WebGPU/D3D12; otros navegadores o sistemas operativos no estan validados.
- No es un checkpoint de Transformers; no se puede cargar con librerias estandar de Python.
- El contexto logico de 262K tokens depende de almacenamiento KV en IndexedDB, lo que puede degradar el rendimiento en sesiones muy largas.
- No se han publicado evaluaciones de sesgos, alucinacion o seguridad especificas para esta conversion.
- El runtime delega la autoridad de acciones al Viewer; el modelo no ejecuta herramientas por si mismo, pero la integracion con AgentRunner requiere validacion externa.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/PreDoctor/Qwen3.8-27B-NVFP4-W4A16-WebGPU
- Modelo base Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Version NVFP4 de Unsloth: https://huggingface.co/unsloth/Qwen3.8-27B-NVFP4
- Documentacion de Unsloth sobre Qwen3.8: https://unsloth.ai/docs/models/qwen3.8
- Blog de AMD sobre soporte de Qwen3.8 27B: https://www.amd.com/en/blogs/2026/run-qwen-3-8-27b-on-amd-ryzen-ai-max-and-radeon-graphics-cards-day-0.html
- Guia de Qwen3.8-27B (2026): https://lovableapp.org/blog/qwen3-8-27b
- Repositorio del runtime: https://github.com/PreDoctorDEV/prepath_webviewer
