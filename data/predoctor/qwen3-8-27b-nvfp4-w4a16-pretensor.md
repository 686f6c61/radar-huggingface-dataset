# PreDoctor/Qwen3.8-27B-NVFP4-W4A16-PreTensor

## Resumen

Qwen3.8-27B-NVFP4-W4A16-PreTensor es una distribución local del modelo multimodal Qwen3.8-27B, desarrollada por PreDoctor para su ejecución mediante el runtime propietario PreTensor (extensión de Chrome y host CUDA local). El modelo base, creado por Alibaba, es un LLM denso de 27B parámetros con capacidades nativas de visión, razonamiento, codificación y agentes, con una ventana de contexto de 256K tokens. Esta variante cuantiza los pesos del modelo de lenguaje a FP4 (NVFP4) con activaciones en BF16 (W4A16), mientras que el encoder de visión y el merger multimodal se mantienen en BF16 original. El resultado es un checkpoint de aproximadamente 16.1B parámetros efectivos en el archivo safetensors, con un payload de tensores de 17.9 GB, pensado para entornos con recursos limitados pero que requieren capacidades multimodales completas.

La relevancia de este modelo radica en su formato de cuantización agresiva (4 bits) que reduce significativamente el footprint de memoria frente al modelo original, manteniendo la funcionalidad multimodal. Sin embargo, su dependencia del ecosistema PreTensor limita su portabilidad: no es cargable con Transformers estándar ni con motores de inferencia convencionales como vLLM o llama.cpp. Está dirigido a usuarios que ya utilizan la infraestructura PreTensor y buscan una versión optimizada del Qwen3.8-27B para despliegue local en GPU NVIDIA.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso multimodal (image-text-to-text) con encoder de vision y merger |
| Parametros totales | 27B (modelo base); 16.147.123.937 en el checkpoint cuantizado |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 256K tokens (segun documentacion de Qwen3.8) |
| Tipos de cuantizacion | NVFP4 (FP4 E2M1, grupo 16) con escalas FP8 E4M3FN y FP32 globales; activaciones BF16 (W4A16) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors fragmentados (5 shards), requiere loader PreTensor |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B es un transformer denso nativo multimodal desarrollado por Alibaba, que integra un encoder de vision y un merger para procesar entradas de imagen y texto. No se dispone de detalles especificos sobre su entrenamiento (composicion del dataset, numero de tokens, uso de RLHF/DPO) en la informacion proporcionada. La variante PreDoctor aplica una cuantizacion NVFP4 W4A16 sobre los pesos del modelo de lenguaje: los pesos se empaquetan en FP4 E2M1 con grupo de 16, las escalas se almacenan en FP8 E4M3FN con escalas globales FP32, y las activaciones permanecen en BF16. El encoder de vision y el merger se mantienen en BF16 sin cuantizar. Los tensores de texto se copian byte a byte del checkpoint de lenguaje verificado por PreTensor, y los de vision del modelo fuente. El checkpoint resultante no es compatible con Transformers estandar; requiere el runtime PreTensor para su carga e inferencia.

## Capacidades

- Generacion de texto y chat conversacional multimodal (entrada de imagen y texto, salida de texto).
- Razonamiento paso a paso y resolucion de problemas matematicos (segun evaluaciones de Qwen3.8-27B con prompts de razonamiento).
- Generacion y comprension de codigo, con soporte para flujos de trabajo agente (agentic coding).
- Automatizacion de tareas de oficina (procesamiento de documentos, resumen, generacion de informes).
- Analisis de imagenes: descripcion, respuesta a preguntas visuales, extraccion de informacion.
- Ventana de contexto larga de 256K tokens, adecuada para documentos extensos o conversaciones multi-turno.
- Capacidades multilingues no especificadas en la informacion disponible.

## Casos de uso

- Asistente de codigo en entornos locales: el modelo puede integrarse en IDEs o pipelines de CI/CD para generar, revisar y refactorizar codigo, aprovechando su capacidad de razonamiento y su contexto de 256K tokens para manejar repositorios completos.
- Automatizacion de oficina: procesamiento de documentos escaneados o digitales (facturas, contratos, informes) mediante la combinacion de vision y generacion de texto, extrayendo datos y generando resumenes estructurados.
- Agente conversacional multimodal: despliegue de un chatbot que recibe capturas de pantalla o fotos como entrada adicional, util para soporte tecnico remoto o asistencia visual en tiempo real.
- Analisis de imagenes medicas o tecnicas: el modelo puede describir anomalias en radiografias, diagramas o planos, ayudando a tecnicos o profesionales en tareas de clasificacion preliminar.
- Razonamiento sobre documentos largos: gracias a su contexto de 256K, puede procesar libros, manuales o expedientes completos para responder preguntas complejas o generar resumenes ejecutivos.
- Prototipado de aplicaciones multimodales: desarrollo rapido de demos o MVPs que requieran comprension conjunta de imagen y texto, sin necesidad de infraestructura en la nube, usando el runtime PreTensor en una GPU local.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica referencia es la evaluacion MathVision mencionada en la documentacion de Qwen3.8-27B, pero no se proporcionan cifras concretas para este checkpoint cuantizado.

## Requisitos de hardware

- El checkpoint completo (5 shards safetensors) ocupa 34.9 GB en disco, con un payload de tensores de 17.9 GB.
- Requiere una GPU NVIDIA con soporte CUDA y el runtime PreTensor (extension de Chrome + host local). No es compatible con vLLM, llama.cpp, Ollama ni TGI.
- La VRAM estimada para cargar el modelo completo no esta especificada; dado el payload de 17.9 GB, se recomienda al menos 20-24 GB de VRAM para margen de activaciones y overhead, aunque no hay confirmacion oficial.
- No se dispone de datos de latencia o throughput para este formato especifico.
- El modelo no es ejecutable en hardware sin CUDA (por ejemplo, Apple Silicon o GPUs AMD) debido a la dependencia del runtime PreTensor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen/Qwen3.8-27B (base) | 27B | 256K | BF16/FP16 | Apache 2.0 | Safetensors (Transformers) |
| unsloth/Qwen3.8-27B-NVFP4 | 27B | 256K | NVFP4 | Apache 2.0 | Safetensors (Unsloth) |
| PreDoctor/Qwen3.8-27B-NVFP4-W4A16-PreTensor | 27B (16.1B en checkpoint) | 256K | NVFP4 W4A16 | Apache 2.0 | Safetensors (PreTensor) |

La principal diferencia frente a las alternativas es el formato de empaquetado y el runtime requerido. Mientras que el modelo base y la version de Unsloth son cargables con herramientas estandar (Transformers, vLLM, etc.), la version PreTensor exige el ecosistema propietario de PreDoctor, lo que limita su uso a ese entorno especifico.

## Limitaciones y advertencias

- El checkpoint no es compatible con Transformers estandar ni con motores de inferencia convencionales; solo funciona con el runtime PreTensor, lo que limita su portabilidad y su integracion en pipelines existentes.
- La cuantizacion NVFP4 (4 bits) puede introducir perdida de precision frente al modelo en BF16, especialmente en tareas de razonamiento complejo o generacion de codigo extenso.
- No se dispone de informacion sobre sesgos del modelo base ni de este checkpoint especifico; se recomienda evaluar en el dominio de aplicacion antes de uso en produccion.
- La ventana de contexto de 256K es una caracteristica del modelo base, pero el rendimiento real con contextos muy largos puede degradarse debido a la cuantizacion.
- Los idiomas soportados no estan documentados en la informacion disponible; se asume herencia del modelo base, pero no hay confirmacion.
- El uso comercial esta permitido bajo licencia Apache 2.0, pero la dependencia del runtime PreTensor puede implicar restricciones adicionales no especificadas en la model card.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/PreDoctor/Qwen3.8-27B-NVFP4-W4A16-PreTensor
- Modelo base Qwen/Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Version NVFP4 de Unsloth: https://huggingface.co/unsloth/Qwen3.8-27B-NVFP4
- Repositorio GitHub de Qwen3.8-27B: https://github.com/AlibabaCloud-Official/Qwen3.8-27B
- Ficha en LLM Explorer: https://llm-explorer.com/model/PreDoctor%2FQwen3.8-27B-NVFP4-W4A16-WebGPU,3ph4dFzoq1E5QQep4YZQOP
- Documentacion de Unsloth sobre Qwen3.8: https://unsloth.ai/docs/models/qwen3.8
