# irtoga/tinyllama-atencion-clientes-lora

## Resumen

`irtoga/tinyllama-atencion-clientes-lora` es un adaptador LoRA (Low-Rank Adaptation, técnica de ajuste eficiente de parámetros de la familia PEFT) sobre un modelo TinyLlama, publicado en Hugging Face por el usuario `irtoga`. Por el identificador se deduce que el ajuste está orientado a atención al cliente en castellano, pero ni la model card ni los metadatos del repositorio confirman esa finalidad, el conjunto de datos empleado ni el procedimiento de entrenamiento. La model card es la plantilla autogenerada de Hugging Face, con todos los campos marcados como `[More Information Needed]`, y el repositorio no declara licencia, idiomas, pipeline ni métricas.

El repositorio presenta un tamaño de 0,0 GB, cero descargas y cero likes, y las marcas de tiempo de creación y actualización difieren en dos segundos. Estos indicios apuntan a un repositorio vacío o con ficheros meramente de configuración, sin pesos del adaptador publicados. La única etiqueta técnica relevante es `safetensors`, que sugiere el formato previsto para los pesos, y `arxiv:1910.09700`, que corresponde al artículo del calculador de impacto medioambiental de Lacoste et al. (2019) y no a un artículo del propio modelo: es un residuo de la plantilla y no debe interpretarse como referencia científica del ajuste.

Su relevancia práctica es, por tanto, muy limitada en el estado actual: se trata de un artefacto sin documentación, sin evaluación y aparentemente sin pesos. Existe además un repositorio homónimo en la cuenta `israelep/tinyllama-atencion-clientes-lora`, lo que sugiere una publicación duplicada entre cuentas, aunque no hay confirmación oficial de que sean el mismo contenido. Cualquier evaluación técnica seria exigiría verificar primero la existencia de los ficheros `adapter_model.safetensors` y `adapter_config.json`.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre un transformer decoder-only de la familia Llama; no se publica la configuración del adaptador (rango, alpha, capas objetivo) |
| Parámetros totales | No disponible para el adaptador; el modelo base TinyLlama-1.1B tiene 1.100 millones de parámetros |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No declarada; el modelo base TinyLlama-1.1B-Chat trabaja con 2.048 tokens |
| Tipos de cuantización | No disponible; no se publican artefactos GGUF, AWQ ni GPTQ |
| Idiomas soportados | No declarado; el identificador del repositorio sugiere castellano |
| Licencia | No disponible; el repositorio no declara licencia |
| Formato de pesos | safetensors (según las etiquetas del repositorio); el tamaño del repo es de 0,0 GB, por lo que no se confirma la presencia de ficheros |

## Arquitectura y entrenamiento

La única información estructural disponible es la que se deduce del nombre del repositorio: un adaptador LoRA sobre TinyLlama. TinyLlama-1.1B es un transformer decoder-only de tipo Llama, con normalización RMSNorm, activación SwiGLU, embeddings rotatorios (RoPE) y 22 capas, dimensión oculta de 2.048, 32 cabezas de atención y 4 cabezas de clave/valor (GQA), con un vocabulario de 32.000 tokens. Se entrenó originalmente sobre 3 billones de tokens de SlimPajama combinados con otros corpus. Estos datos corresponden al modelo base y no al adaptador, cuya configuración concreta no se ha publicado.

No hay ninguna información sobre el procedimiento de ajuste: se desconoce el número de tokens de entrenamiento, la composición del conjunto de datos, si hubo conversaciones reales de atención al cliente, si se aplicó alguna técnica de alineación (RLHF, DPO) o si el ajuste se hizo sobre TinyLlama-1.1B base o sobre la variante de chat. Tampoco se documentan los hiperparámetros del LoRA (`r`, `lora_alpha`, `target_modules`) ni el régimen de precisión empleado.

## Capacidades

No hay ninguna capacidad documentada ni verificada. A partir de la estructura (adaptador LoRA sobre TinyLlama-1.1B) cabría esperar lo siguiente, siempre de forma condicional y sin confirmación alguna:

- Generación de texto conversacional en castellano para dominios de atención al cliente, si el ajuste se realizó como sugiere el nombre.
- Razonamiento básico de un solo turno; no hay evidencia de modos de pensamiento extendido ni de razonamiento multi-paso.
- Soporte de *tool calling* / *function calling*: no disponible; los modelos de 1.100 millones de parámetros rara vez lo soportan de forma fiable y el ajuste no lo documenta.
- Capacidad de agente: no disponible.
- Capacidades multilingües: no disponibles; el idioma no está declarado.
- Capacidades especiales (visión, audio, modo *thinking*): no disponibles.
- Longitud de contexto efectiva para conversaciones multi-turno: no disponible, y en cualquier caso limitada por los 2.048 tokens del modelo base.

## Casos de uso

Los siguientes escenarios son hipotéticos y presuponen que el adaptador existe, funciona y está ajustado para atención al cliente en castellano. No deben desplegarse en producción sin verificar los pesos, la licencia y el comportamiento real del modelo.

- Clasificación y enrutado de consultas entrantes: un modelo de 1.100 millones de parámetros es suficiente para etiquetar el motivo de contacto (facturación, incidencias, devoluciones) y derivar el caso al equipo adecuado, con coste de inferencia muy bajo por petición.
- Respuestas de primera línea en chat de soporte: el adaptador podría generar respuestas breves y predefinidas para preguntas frecuentes, con la ventana de 2.048 tokens del modelo base, adecuada para intercambios cortos de tres o cuatro turnos.
- Generación de borradores para agentes humanos: redactar una propuesta de respuesta que el operador revisa y envía, reduciendo el tiempo de tecleo sin exponer al cliente a texto no verificado.
- Normalización y resumen de tickets: convertir conversaciones o correos desordenados en un resumen estructurado con campos fijos (producto, problema, acción solicitada) antes de registrarlos en el CRM.
- Extracción de datos estructurados: obtener el identificador de pedido, la fecha o el importe de un mensaje libre y devolverlos en JSON para automatizar altas y consultas en sistemas internos.
- Análisis de sentimiento y detección de escalado: marcar conversaciones con tono negativo o indicios de reclamación formal para priorizarlas en la cola de atención.
- Prototipado y pruebas de concepto en local: al ser un adaptador sobre un modelo de 1,1 B, permite iterar en un portátil o en una GPU de gama media sin coste de API, útil para validar prompts y flujos antes de migrar a un modelo mayor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

Estimaciones referidas al modelo base TinyLlama-1.1B, ya que el adaptador no publica pesos ni configuración:

- VRAM en fp16: aproximadamente 2,2 GB solo de pesos, más caché KV; con 2.048 tokens de contexto y lote pequeño el consumo total ronda los 3 GB.
- VRAM en int8: en torno a 1,2 GB. En cuantización Q4_K_M (GGUF): alrededor de 0,7 GB.
- Cabe con holgura en GPU de consumo: GTX 1650 de 4 GB, RTX 3060 de 12 GB, RTX 4060, RTX 4090 (uso marginal de su VRAM). También funciona en CPU, con velocidades del orden de decenas de tokens por segundo en procesadores modernos.
- GPU de centro de datos (A100, H100) innecesarias para este tamaño salvo por requisitos de agregación de muchas peticiones concurrentes.
- Opciones de despliegue: `transformers` con PEFT para cargar el adaptador sobre el modelo base, fusión del adaptador y conversión a GGUF para `llama.cpp` u Ollama, y vLLM o TGI si se necesita servidor con batching continuo (en estos dos últimos casos habría que fusionar el adaptador con el modelo base antes de servir).
- Latencia y throughput: no disponibles. No hay mediciones publicadas para este adaptador y no se puede validar ninguna cifra sin los pesos.

## Comparativa con modelos similares

Comparación orientativa con alternativas de tamaño reducido. Las cifras de los modelos de referencia provienen de sus especificaciones públicas; las del adaptador analizado son en su mayoría no disponibles.

| Modelo | Parámetros | Contexto | Licencia | Estado del repositorio |
|---|---|---|---|---|
| irtoga/tinyllama-atencion-clientes-lora | 1,1 B (base) | No disponible (base: 2.048) | No disponible | 0 descargas, 0 likes, 0,0 GB |
| TinyLlama-1.1B-Chat | 1,1 B | 2.048 | Apache 2.0 | Modelo de referencia, ampliamente descargado |
| Qwen2.5-1.5B-Instruct | 1,5 B | 32.768 | Apache 2.0 | Modelo oficial, con evaluación publicada |
| Llama-3.2-1B-Instruct | 1,23 B | 128.000 | Licencia comunitaria Llama 3.2 | Modelo oficial, con evaluación publicada |

Frente a estas alternativas, el adaptador analizado no aporta datos verificables de rendimiento, no declara licencia y aparentemente no publica pesos. Un proyecto que necesite un modelo pequeño en castellano para atención al cliente encontraría en Qwen2.5-1.5B-Instruct o Llama-3.2-1B-Instruct opciones con contexto mucho mayor, licencia clara y soporte de la comunidad, aunque ninguna de ellas está ajustada específicamente al dominio.

## Limitaciones y advertencias

- Repositorio aparentemente vacío: 0,0 GB de tamaño y marcas de creación y actualización separadas por dos segundos. Es probable que los pesos del adaptador no estén disponibles, lo que impediría cualquier uso.
- Model card sin contenido: todos los campos son la plantilla autogenerada de Hugging Face. No hay información sobre datos, entrenamiento, evaluación ni uso previsto.
- Ausencia de licencia: al no declararse licencia, no puede asumirse permiso de uso comercial. En ausencia de licencia explícita rigen por defecto los derechos de autor del titular, lo que hace inviable un despliegue en producción sin autorización.
- Etiqueta `arxiv` engañosa: `arxiv:1910.09700` corresponde al artículo del calculador de impacto de Lacoste et al. (2019), citado en la propia plantilla, y no a un artículo sobre este modelo.
- Riesgo de alucinación elevado: los modelos de 1.100 millones de parámetros generan con frecuencia información inventada, especialmente en dominios factuales como facturación, plazos o condiciones contractuales. En atención al cliente esto puede derivar en compromisos incorrectos frente al usuario.
- Ventana de contexto corta: 2.048 tokens en el modelo base, insuficiente para conversaciones largas o para incluir documentación de producto extensa en el prompt.
- Idioma no verificado: aunque el nombre indique castellano, no hay declaración de idiomas ni evaluación multilingüe. El comportamiento real en castellano de España, con sus variantes léxicas, no está comprobado.
- Sesgos no evaluados: no se ha publicado ningún análisis de sesgo demográfico, de género o de registro lingüístico, lo que es especialmente sensible en un dominio de atención al cliente.
- Cumplimiento normativo: un asistente de atención al cliente trata datos personales, por lo que su uso queda sujeto al RGPD. Sin documentación sobre el conjunto de entrenamiento no puede descartarse que el modelo haya memorizado datos personales.
- Publicación duplicada: existe un repositorio homónimo bajo la cuenta `israelep`, sin confirmación de que sea el mismo contenido. Conviene verificar cuál es el artefacto canónico antes de integrarlo.
- Ausencia de métricas de producción: no hay datos de latencia, throughput, tasa de alucinación ni evaluación humana que permitan estimar el coste o la calidad real del despliegue.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/irtoga/tinyllama-atencion-clientes-lora
- Repositorio homónimo bajo otra cuenta: https://huggingface.co/israelep/tinyllama-atencion-clientes-lora
- Discusiones del repositorio homónimo: https://huggingface.co/israelep/tinyllama-atencion-clientes-lora/discussions
- Artículo citado en las etiquetas, sobre estimación de emisiones (Lacoste et al., 2019): https://arxiv.org/abs/1910.09700
- Calculador de impacto medioambiental en aprendizaje automático: https://mlco2.github.io/impact#compute
- Guía sobre ajuste fino de TinyLlama-1.1B con LoRA y PEFT: https://medium.com/@mdkasim_57228/how-i-fine-tuned-tinyllama-1-1b-using-lora-peft-and-published-it-on-hugging-face-3ac63a1acb1d
- Proyecto de ejemplo de ajuste con LoRA sobre TinyLlama: https://github.com/Rofeeah-Tijani/tinyllama-lora-ai-engineering
- Guía de despliegue local de un LLM ajustado con LoRA y Ollama: https://medium.com/@paraszope0201/fine-tuning-a-local-llm-with-lora-and-deploying-it-offline-using-ollama-c8bec2726219
