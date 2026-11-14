# coolthor/Huihui-Qwen-AgentWorld-35B-A3B-abliterated-UD-Q3_K_M-GGUF

## Resumen

Esta ficha describe una cuantización GGUF del modelo Huihui-Qwen-AgentWorld-35B-A3B-abliterated, una variante "abliterada" (con comportamiento de rechazo reducido) del modelo Qwen-AgentWorld-35B-A3B de Alibaba Qwen. El modelo original está diseñado para casos de uso de agentes y simulación de entornos (world model), y esta versión concreta ha sido publicada por el usuario coolthor en Hugging Face como un único fichero GGUF de 16,66 GB con cuantización UD-Q3_K_M generada mediante llama.cpp con matriz de importancia (imatrix).

La relevancia de esta ficha es práctica: el modelo base en BF16 ocupa aproximadamente 65-67 GB, lo que lo hace inutilizable en GPUs de consumo. Esta cuantización reduce el peso a 15,5 GiB (3,84 bits por peso) y permite ejecutarlo en una única tarjeta de 22 GB, como una RTX 2080 Ti, dejando margen para la caché KV y los buffers de cómputo. El autor documenta pruebas de humo (smoke tests) con velocidades de decodificación de unos 82 tok/s y evaluación de prompt de unos 320 tok/s en ese hardware.

El modelo es de arquitectura MoE (Mixture of Experts) con 34.660.610.688 parámetros totales y aproximadamente 3B parámetros activos por token (de ahí la nomenclatura 35B-A3B). Soporta únicamente inglés y chino según la model card, tiene licencia Apache 2.0 y está pensado para experimentación local con agentes, extracción de JSON, enrutamiento de herramientas y tareas de planificación. Es importante señalar que se trata de una cuantización de terceros, no de un modelo oficial de Qwen, y que la información disponible sobre arquitectura detallada, datos de entrenamiento y benchmarks estandarizados es muy limitada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (Mixture of Experts), familia Qwen (tag `qwen3_5_moe`), transformer con expertos dispersos |
| Parametros totales | 34.660.610.688 (≈34,7B) |
| Parametros activos | ≈3B (nomenclatura A3B) |
| Longitud de contexto | no disponible (las pruebas del autor usan `-c 8192`) |
| Tipos de cuantizacion | UD-Q3_K_M (Q3_K con imatrix y mapa de tensores); mezcla de tipos IQ3_XXS, IQ4_XS, Q6_K, Q8_0, F32 |
| Idiomas soportados | en, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (fichero único de 16.660.085.760 bytes, 3,84 BPW) |

## Arquitectura y entrenamiento

El modelo base es un transformer con arquitectura MoE de la familia Qwen, con 34,7B parámetros totales y aproximadamente 3B activos por token, lo que permite un coste de cómputo por token comparable a un modelo denso de ~3B pese a la capacidad total. La model card de esta cuantización no aporta detalles sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron fases de RLHF o DPO; esa información correspondería a la model card del modelo original Qwen-AgentWorld-35B-A3B, que no está incluida en la información proporcionada.

La innovación técnica documentada en esta ficha es doble. Por un lado, la abliteración aplicada por huihui-ai, que reduce el comportamiento de rechazo del modelo base. Por otro, el proceso de cuantización: el autor generó una matriz de importancia (imatrix) con 76 chunks y 510 entradas a partir de un conjunto sintético de calibración centrado en terminal, edición de repositorios, extracción de JSON, transcripciones de estilo tool-call, turnos de asistente en chino y prompts ficticios de franqueza segura. Sobre esa imatrix aplicó un mapa de tipos de tensor estilo UD para producir un Q3_K_M ligeramente más conservador que el mínimo posible, manteniendo algunos tensores de salida de atención en Q6_K. El resultado son 361 tensores F32, 78 IQ3_XXS, 39 IQ4_XS, 15 Q6_K y 240 Q8_0.

## Capacidades

- Generación de texto conversacional multi-turno en inglés y chino.
- Razonamiento con modo "thinking" separado: el autor documenta que el razonamiento se expone en `message.reasoning_content` cuando se activa `--reasoning on --reasoning-format deepseek`.
- Extracción y generación de JSON válido, incluyendo arrays y campos anidados (probado con éxito en los smoke tests).
- Enrutamiento de herramientas y tool calling en formato JSON (probado con cuatro rutas válidas).
- Planificación de parches y tareas de agente con salida estructurada (probado con un prompt de plan de parche de cinco viñetas exactas).
- Tareas de triaje de agente en chino (probado con seis comprobaciones concisas).
- Capacidad de "world model" / simulación de entorno, según la nomenclatura del modelo base.
- Comportamiento abliterado: menor tendencia al rechazo en prompts directos (3/3 prompts seguros sin frases de rechazo en las pruebas del autor).
- No se documentan capacidades de visión, audio ni otras modalidades en la información disponible.

## Casos de uso

- Experimentación local con agentes: el modelo cabe en una GPU de 22 GB y permite iterar sobre pipelines de agente con tool calling y planificación sin necesidad de infraestructura multi-GPU. Adecuado por su bajo coste de VRAM y su soporte de JSON estructurado.
- Extracción de datos estructurados: usar el modelo para convertir texto libre en JSON validado, aprovechando las pruebas de extracción JSON documentadas y el modo de respuesta directa con `enable_thinking: false`.
- Enrutamiento de herramientas en asistentes: integrar el modelo como router que decide qué función invocar a partir de la intención del usuario, dado que el autor validó el enrutamiento con cuatro rutas JSON correctas.
- Automatización de edición de repositorios: emplear el modelo para generar planes de parche y sugerencias de cambios en código, apoyándose en la calibración orientada a terminal y edición de repos.
- Triaje y clasificación en chino: procesar tickets o consultas en chino con salidas concisas y estructuradas, aprovechando el soporte nativo del idioma.
- Simulación de entornos para pruebas de agentes: usar el modelo como "world model" para generar respuestas de entorno sintéticas en bancos de pruebas de agentes, según la vocación del modelo base.
- Despliegue en servidor llama.cpp: montar un endpoint compatible con la API de chat completions mediante `llama-server` con `--jinja` y plantilla de razonamiento deepseek, útil para prototipos y demos internas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandarizados (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor únicamente documenta pruebas de humo (smoke tests) no estandarizadas en una RTX 2080 Ti con backend Vulkan de llama.cpp:

| Prueba | Resultado |
|---|---|
| Carga en una RTX 2080 Ti (22 GB) | Correcta |
| VRAM tras carga con `-c 8192` | ≈15,8 GiB |
| Velocidad de decodificación directa (N=3) | mediana 82,32 tok/s (rango 82,26-82,55) |
| Velocidad de evaluación de prompt (N=3) | mediana 319,84 tok/s |
| Sonda de modo thinking | Correcta; razonamiento separado en `message.reasoning_content` |
| Extracción JSON | Correcta; JSON válido y arrays preservados |
| Prompt de plan de parche de agente | Correcta; cinco viñetas exactas |
| Enrutamiento de herramientas JSON | Correcta; cuatro rutas válidas |
| Triaje de agente en chino | Correcta; seis comprobaciones concisas |
| Sonda de franqueza abliterada | Correcta; 3/3 prompts seguros sin rechazo |

El propio autor advierte que estas pruebas no son un benchmark estandarizado y que la calidad debe validarse contra la carga de trabajo real de cada usuario antes de usar la cuantización en producción.

## Requisitos de hardware

- VRAM estimada para inferencia: unos 15,8 GiB tras la carga con contexto de 8192 tokens (medido por el autor); el fichero pesa 15,5 GiB / 16,66 GB.
- GPU recomendadas: tarjetas con al menos 22 GB de VRAM para dejar margen a caché KV y buffers; el autor lo probó en una RTX 2080 Ti de 22 GB. Para contextos mayores o mayor paralelismo se necesitaría más VRAM (no disponible una estimación concreta).
- Cabe en GPU de consumo: sí, en tarjetas de 22 GB o superiores (RTX 2080 Ti, RTX 3090, RTX 4090 con 24 GB, etc.); no cabe en GPUs de 8-16 GB con contexto razonable.
- Opciones de despliegue: llama.cpp (backend Vulkan o CUDA), `llama-server` con `--jinja` y `--reasoning on --reasoning-format deepseek`; el autor documenta también la posibilidad de fijar una GPU concreta mediante `GGML_VK_VISIBLE_DEVICES` o `CUDA_VISIBLE_DEVICES`. No se documentan otras opciones como vLLM, TGI u Ollama en la información disponible.
- Latencia y throughput estimados: mediana de 82,32 tok/s en decodificación y 319,84 tok/s en evaluación de prompt en una RTX 2080 Ti con Vulkan y contexto de 8192 (mediciones del autor, no estandarizadas).

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones completas de modelos comparables en la información proporcionada, por lo que la comparativa cuantitativa no está disponible. A modo de referencia estructural, se puede comparar con el modelo base sin cuantizar y con la variante abliterada de la que deriva:

| Modelo | Parametros | Formato | Tamano | Contexto | Licencia |
|---|---|---|---|---|---|
| Esta cuantización (UD-Q3_K_M) | 34,7B (≈3B activos) | GGUF | 16,66 GB | no disponible (pruebas a 8192) | Apache 2.0 |
| huihui-ai/Huihui-Qwen-AgentWorld-35B-A3B-abliterated (BF16) | 34,7B (≈3B activos) | safetensors/BF16 | ≈65-67 GB | no disponible | Apache 2.0 |
| Qwen/Qwen-AgentWorld-35B-A3B (base) | 34,7B (≈3B activos) | no disponible | no disponible | no disponible | no disponible |

No se han identificado en la información disponible otros modelos de la misma categoría (agente/world model MoE de ~35B) con datos de rendimiento comparables.

## Limitaciones y advertencias

- Es una cuantización de terceros (coolthor), no oficial de Qwen ni de huihui-ai; la calidad y fidelidad respecto al modelo original dependen del proceso de cuantización y de la imatrix sintética empleada.
- La cuantización Q3_K_M introduce pérdida de precisión respecto al BF16; el autor recomienda validar la calidad contra la carga de trabajo real antes de usar en producción.
- Modelo abliterado: presenta comportamiento de rechazo reducido, lo que implica un mayor riesgo de generar contenido inapropiado o inseguro; requiere filtrado y salvaguardas adicionales en producción.
- Riesgo de alucinación inherente a los modelos de lenguaje; no se documentan mitigaciones específicas.
- Idiomas limitados a inglés y chino; no se garantiza un rendimiento adecuado en castellano ni en otros idiomas.
- Longitud de contexto no documentada; las pruebas se hicieron con 8192 tokens, y contextos mayores incrementan el uso de VRAM.
- Manejo del modo thinking delicado: el autor advierte que `--reasoning off` a nivel de servidor puede no impedir que el modelo emita "Thinking Process:" como contenido normal; se recomienda `--reasoning on --reasoning-format deepseek` y `chat_template_kwargs: {"enable_thinking": false}` para respuestas directas.
- No se documentan benchmarks estandarizados, por lo que no hay evidencia pública de rendimiento en MMLU, HumanEval, GSM8K u otras evaluaciones.
- Licencia Apache 2.0 permite uso comercial, pero las condiciones de la abliteración y del modelo base deben verificarse en sus respectivas model cards.

## Enlaces

- Hugging Face (esta cuantización): https://huggingface.co/coolthor/Huihui-Qwen-AgentWorld-35B-A3B-abliterated-UD-Q3_K_M-GGUF
- Modelo base abliterado: https://huggingface.co/huihui-ai/Huihui-Qwen-AgentWorld-35B-A3B-abliterated
- Modelo original Qwen: https://huggingface.co/Qwen/Qwen-AgentWorld-35B-A3B
- No se han encontrado en la información disponible papers, blogs, repositorios adicionales ni demos más allá de los enlaces anteriores.
