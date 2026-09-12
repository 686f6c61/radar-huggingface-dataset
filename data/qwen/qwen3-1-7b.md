# Qwen/Qwen3-1.7B

## Resumen

Qwen3-1.7B es un modelo de lenguaje causal de tipo denso (no MoE) desarrollado por el equipo Qwen de Alibaba, publicado el 27 de abril de 2025 como parte de la familia Qwen3. Se trata de la variante pequena de la generacion Qwen3, disenada para ejecucion en hardware de consumo, con una longitud de contexto de 32.768 tokens y un total de 1.700 millones de parametros declarados por el autor (2.031.739.904 parametros reales contados en los pesos safetensors, incluyendo embeddings). Esta entrenado sobre el modelo base Qwen/Qwen3-1.7B-Base y afinado posteriormente para conversacion e instrucciones.

Su principal innovacion consiste en permitir la conmutacion entre modo "thinking" (razonamiento explicito, util para matematicas, codigo y logica) y modo "non-thinking" (dialogo directo y eficiente) dentro del mismo modelo, controlada mediante el parametro `enable_thinking` en la plantilla de chat. Ademas, incorpora capacidades de agente y tool calling, y soporte de mas de 100 idiomas y dialectos segun la model card oficial.

Es relevante ahora porque ofrece razonamiento y capacidades de agente en un formato que cabe en GPUs de consumo con cuantizacion, bajo licencia Apache 2.0 (uso comercial permitido) y con un ecosistema de despliegue amplio (transformers, vLLM, SGLang, llama.cpp, Ollama, LM Studio, MLX-LM, KTransformers). Con mas de 3,4 millones de descargas, es una de las opciones mas empleadas en su rango de tamano.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal denso con Grouped Query Attention (GQA) |
| Parametros totales | 1,7B declarados por el autor; 2.031.739.904 parametros reales en safetensors (1,4B no-embedding) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens |
| Tipos de cuantizacion | safetensors en precision completa/bf16 en el repositorio oficial; cuantizaciones GGUF y otras disponibles a traves de llama.cpp, Ollama, LM Studio, MLX-LM y KTransformers (formatos concretos no especificados en la informacion disponible) |
| Idiomas soportados | mas de 100 idiomas y dialectos segun la model card |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers) |

Datos adicionales: 28 capas, 16 cabezas de atencion para Q y 8 para KV (GQA), tamano del repositorio 4,1 GB, pipeline text-generation, creado el 2025-04-27 y actualizado el 2025-07-26.

## Arquitectura y entrenamiento

Qwen3-1.7B es un transformer decoder-only causal con atencion de consultas agrupadas (GQA), con 28 capas y una relacion de 16 cabezas de consulta frente a 8 de clave/valor. El modelo parte de una fase de preentrenamiento (Qwen/Qwen3-1.7B-Base) y una posterior fase de postentrenamiento que incluye alineacion con preferencias humanas para conversacion, escritura creativa, role-play y seguimiento de instrucciones. La model card no detalla el numero exacto de tokens de entrenamiento ni la composicion del dataset.

La innovacion mas destacable es el soporte nativo de dos modos de inferencia en un unico modelo: el modo thinking, que genera contenido de razonamiento envuelto en un bloque `...`, y el modo non-thinking, orientado a respuestas directas. El cambio se realiza mediante `enable_thinking` en `tokenizer.apply_chat_template` (activado por defecto) y tambien es configurable en los endpoints creados con SGLang y vLLM. La model card recomienda, para el modo thinking, parametros de muestreo de `Temperature=0.6`, `TopP=0.95`, `TopK=20` y `MinP=0`, y sugiere `presence_penalty` de 1.5 para mitigar repeticiones excesivas. No se especifican en la informacion disponible detalles sobre el uso de RLHF, DPO u otras tecnicas concretas de alineacion.

## Capacidades

- Generacion de texto y dialogo conversacional multi-turno.
- Razonamiento explicito en modo thinking, con mejoras declaradas en matematicas, generacion de codigo y razonamiento logico de sentido comun.
- Modo non-thinking para dialogo general eficiente, conmutables en el mismo modelo.
- Capacidades de agente y uso de herramientas externas (tool calling / function calling) tanto en modo thinking como non-thinking.
- Seguimiento de instrucciones multilingue y traduccion en mas de 100 idiomas y dialectos.
- Alineacion con preferencias humanas orientada a escritura creativa, role-play y conversaciones inmersivas.
- Compatibilidad con despliegue como endpoint compatible con OpenAI mediante vLLM o SGLang, con parser de razonamiento dedicado.
- Parsing del contenido de razonamiento mediante el token 151668 (`</think>`), tal como se muestra en el ejemplo oficial de la model card.

## Casos de uso

- Atencion al cliente automatizada: el modelo puede mantener conversaciones multi-turno con hasta 32.768 tokens de contexto, suficiente para incorporar historial de cliente, politicas de producto y turnos previos en una sola ventana.
- Generacion de codigo asistida en local: al soportar tool calling y modo thinking, puede integrarse en un asistente de IDE que consulte documentacion o ejecute funciones de un repositorio, con el modo non-thinking reservado para autocompletado de baja latencia.
- Agentes autonomos de tareas multi-paso: la capacidad de tool calling permite orquestar llamadas a APIs y servicios externos, con el bloque de razonamiento para planificar pasos intermedios.
- Traduccion y atencion multilingue: con soporte declarado de mas de 100 idiomas, es adecuado para traducir tickets, correos o documentacion en flujos internacionales.
- Resolucion de problemas matematicos paso a paso: el modo thinking esta pensado para exponer el razonamiento, lo que resulta util en herramientas educativas o de verificacion de calculos.
- Despliegue en el borde o en portatiles: con 1,7B parametros y cuantizacion, puede ejecutarse en equipos sin GPU dedicada mediante Ollama o llama.cpp, habilitando asistentes locales con datos que no salen del dispositivo.
- Clasificacion y extraccion de informacion estructurada: el seguimiento de instrucciones permite usarlo para etiquetar o extraer campos de texto, con la ventaja de poder ajustarse y ejecutarse localmente.
- Prototipado rapido en investigacion: al ser pequeno y de licencia Apache 2.0, permite iterar con fine-tuning y experimentos de razonamiento sin coste de licencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite al blog oficial, el repositorio de GitHub y la documentacion de Qwen para consultar la evaluacion de rendimiento, el consumo de hardware y las metricas de inferencia, pero no incluye cifras concretas en el material proporcionado.

## Requisitos de hardware

- VRAM estimada en bf16/fp16: aproximadamente 4,1-5 GB solo para los pesos (el repositorio ocupa 4,1 GB), mas overhead de activaciones y cache KV; en la practica se recomienda un minimo de 6-8 GB de VRAM.
- VRAM estimada con cuantizacion: en torno a 2-2,5 GB en 8 bits y aproximadamente 1,2-1,5 GB en 4 bits (estimaciones derivadas del tamano de parametros; no confirmadas en la informacion proporcionada).
- GPU recomendadas: cabe en GPUs de consumo como RTX 3060, RTX 4060, RTX 3070/4070 y superiores con 8-12 GB; tambien se ejecuta en A100, H100 y GPUs de datacenter, aunque su tamano no las requiere.
- Compatibilidad con GPU de consumo: si, es uno de los puntos fuertes del modelo por su tamano de 1,7B parametros.
- Opciones de despliegue: transformers (se requiere `transformers>=4.51.0`), vLLM (`vllm>=0.8.5`), SGLang (`sglang>=0.4.6.post1`), llama.cpp, Ollama, LM Studio, MLX-LM y KTransformers.
- Endpoint compatible con OpenAI: si, mediante vLLM (`vllm serve Qwen/Qwen3-1.7B --enable-reasoning --reasoning-parser deepseek_r1`) o SGLang (`--reasoning-parser qwen3`).
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone de datos de benchmarks para comparar rendimiento. La siguiente tabla compara caracteristicas declaradas por los autores o ampliamente conocidas; los datos de modelos alternativos se ofrecen a modo orientativo y deben verificarse en sus fichas oficiales.

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Qwen3-1.7B | 1,7B declarados (2,03B reales) | 32.768 | Apache 2.0 | Modo thinking/non-thinking conmutable, tool calling, 100+ idiomas |
| Qwen2.5-1.5B | 1,5B (aproximado) | no disponible en esta busqueda | Apache 2.0 | Generacion anterior de la familia Qwen, sin modo thinking dedicado |
| Llama 3.2 1B | 1,2B (aproximado) | no disponible en esta busqueda | Llama Community License | Modelo denso pequeno; licencia con restricciones para algunos usos |
| Gemma 2 2B | 2,6B (aproximado) | no disponible en esta busqueda | Gemma Terms of Use | Modelo pequeno de Google con condiciones de uso especificas |

La comparativa de rendimiento, licencia efectiva y disponibilidad debe contrastarse con las fichas oficiales de cada modelo, ya que no se incluyen cifras de benchmarks en la informacion proporcionada.

## Limitaciones y advertencias

- Sesgos: no se documentan sesgos especificos en la informacion disponible; al ser un modelo entrenado sobre datos web, es previsible que herede sesgos de dichas fuentes.
- Alucinacion: la model card advierte de un riesgo de "repeticiones interminables significativas" en determinados casos y recomienda ajustar los parametros de muestreo y fijar `presence_penalty` en 1,5 para mitigarlo.
- Contexto: la ventana maxima es de 32.768 tokens; superar ese limite exige truncado o tecnicas de recuperacion externa.
- Idioma: aunque se declaran mas de 100 idiomas, la calidad puede variar segun el idioma y no se ofrecen metricas por lengua.
- Licencia: Apache 2.0 permite uso comercial, modificacion y redistribucion, pero conviene revisar el fichero LICENSE del repositorio y las obligaciones de atribucion.
- Compatibilidad: requiere `transformers>=4.51.0`; versiones anteriores lanzan `KeyError: 'qwen3'`.
- Reproduccion: la documentacion oficial recomienda usar los parametros de muestreo especificados por modo; ignorarlos puede degradar la calidad o provocar bucles.
- Produccion: no se proporcionan datos de latencia, throughput ni consumo energetico, por lo que la planificacion de capacidad debe basarse en pruebas propias.
- Los resultados de benchmarks no estan disponibles en la informacion facilitada, lo que impide una comparacion cuantitativa rigurosa con alternativas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Qwen/Qwen3-1.7B
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B-Base
- Licencia: https://huggingface.co/Qwen/Qwen3-1.7B/blob/main/LICENSE
- Blog oficial de Qwen3: https://qwenlm.github.io/blog/qwen3/
- Repositorio GitHub: https://github.com/QwenLM/Qwen3
- Documentacion: https://qwen.readthedocs.io/en/latest/
- Documentacion de despliegue con SGLang: https://qwen.readthedocs.io/en/latest/deployment/sglang.html
- Documentacion de despliegue con vLLM: https://qwen.readthedocs.io/en/latest/deployment/vllm.html
- Articulo en arXiv (referencia 2505.09388): https://arxiv.org/abs/2505.09388
- Qwen Chat: https://chat.qwen.ai/
- Sitio oficial de Qwen: https://qwen.ai/home
