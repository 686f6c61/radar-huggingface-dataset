# hadeis/customer-support-qwen25-3b-sft-v2

## Resumen

`hadeis/customer-support-qwen25-3b-sft-v2` es un ajuste fino por supervisión (SFT) del modelo `unsloth/Qwen2.5-3B-Instruct-unsloth-bnb-4bit`, que a su vez es una versión cuantizada a 4 bits del Qwen2.5-3B-Instruct de Alibaba. El autor, identificado en Hugging Face como `hadeis`, lo ha entrenado con la librería TRL sobre la variante optimizada de Unsloth, orientándolo por nombre y propósito a tareas de atención al cliente. El repositorio se creó el 26 de noviembre de 2026 y ocupa 0,4 GB, lo que es coherente con pesos en safetensors de un modelo de 3.000 millones de parámetros cuantizado.

El modelo hereda la arquitectura transformer decoder-only de Qwen2.5, con 3.000 millones de parámetros y una ventana de contexto nativa de 32.768 tokens (ampliable a 131.072 en la familia Qwen2.5, aunque el ajuste concreto no documenta esta extensión). Su relevancia radica en ser un ejemplo típico de especialización vertical de un modelo pequeño para un dominio concreto: atención al cliente, donde prima el coste de inferencia bajo y el despliegue en hardware modesto frente a capacidades generalistas.

La información publicada es muy escasa: la model card no incluye detalles del dataset de entrenamiento, hiperparámetros, métricas de evaluación ni licencia efectiva (el campo `licence` aparece como `license`, sin valor). Tampoco se declaran idiomas soportados ni pipeline. Todo lo que se detalla a continuación se deriva de la model card, de los metadatos del repositorio y de las características conocidas del modelo base Qwen2.5-3B-Instruct.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen2.5-3B-Instruct) |
| Parametros totales | 3.000 millones (aproximado, segun el modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no documentada en el ajuste; el modelo base Qwen2.5-3B-Instruct soporta 32.768 tokens nativos |
| Tipos de cuantizacion | El checkpoint base de entrenamiento estaba en bnb-4bit; los pesos publicados estan en safetensors (precision no especificada) |
| Idiomas soportados | no disponibles en la model card; el modelo base Qwen2.5 es multilingue (chino, ingles, espanol, frances, portugues, aleman, entre otros) |
| Licencia | no disponible (el campo `licence` aparece como `license`, sin valor) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un ajuste fino por supervisión (SFT) del checkpoint `unsloth/Qwen2.5-3B-Instruct-unsloth-bnb-4bit`, una versión de Qwen2.5-3B-Instruct cuantizada a 4 bits con bitsandbytes y optimizada por Unsloth para reducir el consumo de memoria durante el entrenamiento. La arquitectura subyacente es la de Qwen2.5: transformer decoder-only con atención de consultas agrupadas (GQA), RoPE y normalización RMSNorm, entrenado originalmente por Alibaba sobre billones de tokens multilingües y afinado con instrucciones y preferencias humanas.

El ajuste se realizó con TRL 1.15.0, Transformers 5.17.0, PyTorch 2.11.0+cu130 y Datasets 4.8.5, según las versiones declaradas en la model card. El autor enlaza un run de Weights & Biases (`wandb.ai/vsrivastava-dev-srm-institute-of-science-and-technology/huggingface/runs/xw6wkrdt`) que podría contener las curvas de pérdida y los hiperparámetros, pero la model card no transcribe ninguno de esos datos. No se especifica el número de tokens de entrenamiento, la composición del dataset, si hubo etapas de DPO/RLHF adicionales ni si se aplicaron técnicas como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto conversacional multi-turno, orientada por el ajuste a diálogos de atención al cliente.
- Razonamiento básico y respuesta a preguntas, heredado del modelo base Qwen2.5-3B-Instruct.
- Generación de código y matemáticas elementales, capacidad presente en el modelo base aunque no reforzada por este ajuste.
- Soporte multilingüe heredado de Qwen2.5 (chino, inglés, español, francés, portugués, alemán y otros), aunque la model card no declara idiomas explícitamente.
- Compatibilidad con el pipeline `text-generation` de Transformers y con el formato de chat por roles (`{"role": "user", "content": ...}`), como muestra el ejemplo de la model card.
- Tool calling / function calling: no documentado en este ajuste; el modelo base Qwen2.5-3B-Instruct lo soporta de forma nativa.
- Modo de razonamiento extendido (thinking mode): no disponible en la familia Qwen2.5-3B (introducido en Qwen3).
- Visión y audio: no soportados.

## Casos de uso

- Atención al cliente automatizada de primer nivel: el modelo puede gestionar conversaciones multi-turno sobre preguntas frecuentes, estado de pedidos o políticas de devolución, aprovechando el ajuste SFT específico y la ventana de contexto de 32.768 tokens del modelo base para mantener historiales largos.
- Clasificación y enrutado de tickets: dado su tamaño reducido, puede desplegarse detrás de un clasificador para etiquetar la intención del usuario y derivar a agentes humanos o a flujos automatizados, con coste de inferencia muy bajo.
- Generación de respuestas de soporte asistidas para agentes humanos: el modelo redacta borradores de respuesta que un operador revisa antes de enviar, reduciendo el tiempo medio de gestión.
- Chatbot embebido en aplicaciones móviles o web: al ocupar 0,4 GB en el repositorio y requerir poca VRAM, puede ejecutarse en servidores modestos o incluso en GPUs de consumo, lo que facilita despliegues on-premise con requisitos de privacidad.
- Extracción de información de conversaciones: resumir hilos de soporte, identificar el motivo de contacto o extraer entidades (número de pedido, producto, fecha) para alimentar sistemas CRM.
- Prototipado rápido de asistentes verticales: sirve como punto de partida para equipos que quieran especializar aún más el modelo con su propio corpus de soporte mediante nuevas rondas de SFT o DPO.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en fp16, aproximadamente 6-7 GB para los 3.000 millones de parámetros más overhead de activaciones y KV cache; en cuantización 4 bits (GPTQ/AWQ/GGUF Q4), alrededor de 2-3 GB.
- GPU recomendadas: NVIDIA A100, H100 o L40S para despliegues con concurrencia alta; RTX 4090, RTX 3090 o RTX A6000 para entornos de desarrollo y producción ligera.
- Cabe en GPU de consumo: sí, en tarjetas con 8 GB o más de VRAM en cuantización 4 bits (RTX 3060 Ti, RTX 4060 Ti, RTX 3070 y superiores); en fp16 requiere al menos 8-12 GB.
- Opciones de despliegue: vLLM, TGI, llama.cpp, Ollama y el pipeline `text-generation` de Transformers. El tag `endpoints_compatible` del repositorio indica compatibilidad con Hugging Face Inference Endpoints.
- Latencia y throughput estimados: no disponibles en la información proporcionada; dependerán del backend y del hardware. Como referencia orientativa para un modelo de 3B en una RTX 4090 con vLLM, cabría esperar decenas de tokens por segundo por petición, pero este dato no está confirmado para este checkpoint concreto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| hadeis/customer-support-qwen25-3b-sft-v2 | 3.000 M | no documentado (base: 32.768) | no disponible | Hugging Face, safetensors | Ajuste SFT vertical para soporte |
| Qwen2.5-3B-Instruct | 3.000 M | 32.768 (ampliable a 131.072) | Apache 2.0 (modelo base) | Hugging Face, safetensors y GGUF | Modelo generalista, sin especialización vertical |
| Llama 3.2-3B-Instruct | 3.200 M | 131.072 | Llama 3.2 Community License | Hugging Face, safetensors y GGUF | Contexto mayor, licencia con restricciones para grandes empresas |
| Phi-3.5-mini-instruct | 3.800 M | 131.072 | MIT | Hugging Face, safetensors y GGUF | Buen rendimiento en razonamiento y código para su tamaño |

La comparación con el modelo base es la más relevante: este ajuste sacrifica generalidad por especialización en soporte, pero no publica métricas que permitan cuantificar la mejora. Frente a Llama 3.2-3B y Phi-3.5-mini, la ventaja principal sería el menor coste de despliegue y la especialización, a costa de una licencia no declarada y de la ausencia de benchmarks.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; el modelo hereda los sesgos del corpus de entrenamiento de Qwen2.5 y del dataset de SFT, que no se describe.
- Riesgo de alucinación: alto en un modelo de 3.000 millones de parámetros sin datos de evaluación publicados; en atención al cliente puede inventar políticas, plazos o números de pedido si se usa sin verificación.
- Limitaciones de contexto e idioma: la ventana de contexto del ajuste no está documentada; los idiomas soportados no se declaran, aunque el modelo base es multilingüe. El rendimiento en castellano no está verificado.
- Restricciones de licencia: la licencia no está especificada (el campo `licence` aparece sin valor), lo que impide confirmar si el uso comercial está permitido. El modelo base Qwen2.5-3B-Instruct es Apache 2.0, pero el ajuste no hereda necesariamente esa licencia de forma explícita.
- Caveats para producción: el repositorio tiene 0 descargas y 0 likes, sin señales de validación por la comunidad; no hay evaluación de calidad, datos de entrenamiento ni hiperparámetros publicados. El ejemplo de la model card usa una pregunta genérica sobre viajes en el tiempo, no un caso de soporte, lo que sugiere una model card poco cuidada.
- El checkpoint base de entrenamiento estaba cuantizado a 4 bits (bnb-4bit), lo que puede introducir una degradación adicional respecto al Qwen2.5-3B-Instruct original en tareas sensibles a la precisión.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hadeis/customer-support-qwen25-3b-sft-v2
- Modelo base: https://huggingface.co/unsloth/Qwen2.5-3B-Instruct-unsloth-bnb-4bit
- Run de Weights & Biases: https://wandb.ai/vsrivastava-dev-srm-institute-of-science-and-technology/huggingface/runs/xw6wkrdt
- Repositorio de TRL: https://github.com/huggingface/trl
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
