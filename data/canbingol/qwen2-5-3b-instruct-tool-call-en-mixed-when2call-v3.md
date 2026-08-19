# canbingol/qwen2.5-3B-Instruct-tool-call-en-mixed-when2call-v3

## Resumen

Este modelo es un fine-tuning de Qwen/Qwen2.5-3B-Instruct orientado a la llamada de herramientas (tool calling), desarrollado por el usuario canbingol. El nombre "when2call-v3" indica que está especializado en decidir *cuándo* invocar una herramienta externa frente a responder directamente, una capacidad crítica para agentes autónomos y asistentes que integran APIs. Es la tercera versión de esta variante "when2call" y utiliza datos mixtos (en inglés) para el entrenamiento.

El modelo parte de Qwen2.5-3B-Instruct, un transformer denso de 3.000 millones de parámetros con ventana de contexto de 128K tokens y soporte multilingüe, publicado por Alibaba bajo licencia Apache 2.0. El fine-tuning se realizó mediante SFT (supervised fine-tuning) con el framework TRL de HuggingFace. Con un tamaño de repositorio de solo 0,3 GB, es un modelo ligero que cabe en GPUs de consumo y está pensado para despliegues de inferencia con recursos limitados.

Su relevancia actual reside en que los modelos pequeños con tool calling bien afinado permiten construir agentes funcionales con costes de inferencia reducidos, una alternativa práctica a los modelos de gran escala para entornos de producción con presupuesto ajustado. No obstante, al ser un modelo recién publicado con cero descargas y documentación mínima, su rendimiento real está por validar por la comunidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (basado en Qwen2.5-3B-Instruct) |
| Parametros totales | 3.000 millones (3B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 128.000 tokens (heredada del modelo base) |
| Tipos de cuantizacion | No disponible (repo solo contiene pesos en safetensors, sin GGUF ni AWQ publicados) |
| Idiomas soportados | No disponible (el modelo base Qwen2.5 soporta multilingüe; el fine-tuning se entrenó con datos en inglés) |
| Licencia | No disponible (el campo license del modelo card indica "license", sin especificar) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Qwen2.5-3B-Instruct: un transformer decoder-only con atención de causalidad completa, embeddings rotatorios (RoPE), normalización RMSNorm y activación SwiGLU. No incorpora innovaciones arquitectónicas propias; su valor diferencial está en el fine-tuning.

El entrenamiento se realizó con SFT supervisado usando TRL 1.10.0, Transformers 5.13.1 y PyTorch 2.11.0. El nombre "mixed-when2call" sugiere que el dataset combina ejemplos de conversación estándar con ejemplos de tool calling, entrenando al modelo para emitir llamadas a herramientas solo cuando es necesario. No se han publicado detalles sobre el volumen de datos, la composición exacta del dataset ni si se aplicaron técnicas adicionales como DPO o RLHF. No hay información sobre el número de pasos de entrenamiento, la tasa de aprendizaje ni el hardware utilizado.

## Capacidades

- Llamada de herramientas (tool calling) especializada: el modelo está afinado para emitir llamadas a funciones externas en formato estructurado, decidiendo cuándo es apropiado invocar una herramienta frente a responder directamente.
- Generación de texto en inglés: hereda las capacidades de generación del modelo base Qwen2.5-3B-Instruct, aunque el fine-tuning se centró en datos en inglés.
- Razonamiento conversacional multi-turno: soporta diálogos con contexto largo gracias a la ventana de 128K tokens del modelo base.
- Soporte de chat con formato de mensajes: compatible con el pipeline de transformers y el formato de chat de Qwen.
- Capacidades multilingües limitadas: el modelo base es multilingüe, pero el fine-tuning con datos en inglés puede degradar el rendimiento en otros idiomas (no verificado).

## Casos de uso

- Asistentes virtuales con integración de APIs: el modelo puede gestionar conversaciones donde necesita consultar APIs externas (clima, calendario, bases de datos) y decidir autónomamente cuándo llamarlas, gracias a su entrenamiento "when2call".
- Agentes de automatización de tareas: en pipelines de automatización, el modelo puede orquestar llamadas a herramientas de productividad (envío de correos, creación de tickets, consultas a CRM) con un coste de inferencia reducido al ser un modelo de 3B.
- Chatbots de atención al cliente con acceso a sistemas internos: su ventana de 128K tokens permite mantener el historial completo de una conversación mientras consulta sistemas de pedidos o inventario mediante tool calling.
- Prototipado rápido de agentes con tool calling: al ser un modelo pequeño y ligero (0,3 GB), es ideal para entornos de desarrollo donde se necesita iterar rápido sobre el comportamiento de llamada a herramientas sin incurrir en costes de GPU de gran escala.
- Evaluación comparativa de estrategias "when2call": investigadores pueden usar este modelo como punto de referencia para estudiar cómo los modelos pequeños deciden cuándo invocar herramientas frente a responder directamente.
- Despliegue en edge o entornos con VRAM limitada: con 3B parámetros, es viable ejecutarlo en GPUs de consumo (8-12 GB VRAM) en cuantización FP16 o 4 bits, permitiendo asistentes con tool calling en dispositivos locales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni métricas específicas de tool calling (como tasa de acierto en selección de herramientas o correctitud de argumentos generados). Al ser un modelo con cero descargas y sin evaluaciones independientes, no es posible comparar su rendimiento cuantitativo con alternativas.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 6 GB en FP16 (3B parámetros × 2 bytes), unos 2-3 GB en cuantización 4 bits.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090, o GPUs de datacenter como A10G o L4. También es viable en Apple Silicon con 16 GB unificados.
- Compatible con GPUs de consumo: sí, es un modelo pequeño que cabe en la mayoría de GPUs modernas con 8 GB o más de VRAM.
- Opciones de despliegue: transformers con pipeline de text-generation (como muestra el quick start), vLLM para inferencia de alto throughput, llama.cpp para CPU o GPU con cuantización GGUF (aunque no se han publicado pesos GGUF), y TGI (Text Generation Inference) de HuggingFace.
- Latencia y throughput estimados: no disponible. Al ser un modelo de 3B, se espera una latencia de decenas de milisegundos por token en GPU moderna, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Especializacion |
|---|---|---|---|---|
| canbingol/qwen2.5-3B-Instruct-tool-call-en-mixed-when2call-v3 | 3B | 128K | No disponible | Tool calling (when2call) |
| Qwen/Qwen2.5-3B-Instruct (base) | 3B | 128K | Apache 2.0 | Chat e instrucciones generales |
| canbingol/Qwen2.5-3B-Instruct-tool-call-en | 3B | 128K | No disponible | Tool calling (variante anterior del mismo autor) |
| canbingol/Qwen2.5-3B-Instruct-tool-call-en-mixed_data | 3B | 128K | No disponible | Tool calling con datos mixtos (descrito como LoRA en friendli.ai) |

No se dispone de datos de rendimiento comparativo entre estas variantes. La principal diferencia entre ellas está en la estrategia de entrenamiento: "when2call" se centra en la decisión de cuándo llamar a una herramienta, mientras que "mixed_data" combina datos de distinta procedencia. El modelo base Qwen2.5-3B-Instruct ya incluye soporte nativo de function calling, por lo que la utilidad de este fine-tuning depende de si mejora la precisión en la decisión de invocación, algo que no está verificado.

## Limitaciones y advertencias

- Sesgos y alucinaciones: al ser un fine-tuning de Qwen2.5-3B-Instruct, hereda los sesgos potenciales del modelo base, y el entrenamiento SFT con datos no documentados puede introducir sesgos adicionales no identificados.
- Riesgo de alucinación en tool calling: el modelo puede inventar nombres de herramientas, argumentos o respuestas cuando no está seguro de cuál invocar, lo que requiere validación estricta de las llamadas a herramientas en producción.
- Documentación insuficiente: no se han publicado detalles sobre el dataset de entrenamiento, el número de ejemplos, ni las métricas de evaluación. El rendimiento real es desconocido.
- Licencia ambigua: el campo de licencia indica "license" sin especificar. Esto genera incertidumbre legal para uso comercial; se recomienda contactar al autor o utilizar el modelo base Qwen2.5-3B-Instruct (Apache 2.0) si la licencia es un requisito.
- Cero adopción: con 0 descargas y 0 likes, el modelo no ha sido validado por la comunidad. Su comportamiento en producción es impredecible.
- Degradación multilingüe probable: el entrenamiento con datos en inglés puede reducir la calidad en otros idiomas, aunque el modelo base sea multilingüe. No hay datos que lo confirmen.
- Formato de pesos limitado: solo se ofrecen pesos en safetensors para transformers; no hay versiones GGUF, ONNX ni TensorRT, lo que limita las opciones de despliegue fuera del ecosistema HuggingFace.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/canbingol/qwen2.5-3B-Instruct-tool-call-en-mixed-when2call-v3
- Variante anterior del mismo autor: https://huggingface.co/canbingol/Qwen2.5-3B-Instruct-tool-call-en
- Variante "norobots" del mismo autor: https://huggingface.co/canbingol/qwen2.5-3B-Instruct-tool-call-en-norobots
- Variante "mixed_data" en FriendliAI: https://friendli.ai/models/canbingol/Qwen2.5-3B-Instruct-tool-call-en-mixed_data
- Modelo base Qwen2.5-3B-Instruct en Ollama: https://ollama.com/library/qwen2.5:3b-instruct
- Documentación de function calling de Qwen2.5: https://deepwiki.com/QwenLM/Qwen2.5/2.2-function-calling-and-tool-use
- Framework TRL: https://github.com/huggingface/trl
