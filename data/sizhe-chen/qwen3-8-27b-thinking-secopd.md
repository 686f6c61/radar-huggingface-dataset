# Sizhe-Chen/Qwen3.8-27B-Thinking-SecOPD

## Resumen

Qwen3.8-27B-Thinking-SecOPD es un ajuste fino del modelo multimodal Qwen/Qwen3.8-27B, desarrollado por Sizhe-Chen, orientado a reforzar la robustez frente a ataques de inyección de prompts (prompt injection) en aplicaciones que combinan instrucciones de confianza con contenido no confiable. El modelo mantiene la arquitectura completa del modelo base —incluido su codificador visual— y se distribuye como un checkpoint fusionado en BF16, sin necesidad de cargar adaptadores LoRA por separado.

La innovación principal es el método SecOPD (SecPO con destilación on-policy), descrito en el paper arXiv:2610.41998. En lugar de entrenar con etiquetas de respuesta almacenadas, se entrena la política sobre prompts atacados usando como profesor una copia congelada del modelo de inicialización condicionada a los prompts limpios emparejados. El objetivo KL se aplica a la respuesta completa, incluyendo la cadena de razonamiento, con el modo thinking activado y `reasoning_effort="xhigh"`.

El modelo conserva la ventana de contexto nativa de 262.144 tokens del modelo base y sus capacidades multimodales de imagen-texto, lo que lo hace relevante para pipelines de agentes y sistemas RAG donde el texto recuperado o las salidas de herramientas pueden contener instrucciones maliciosas. Su licencia Apache 2.0 facilita la integración en productos comerciales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3_5ForConditionalGeneration (transformer multimodal con codificador visual) |
| Parametros totales | 27.781.427.952 (27,78 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 262.144 tokens (configuracion nativa) |
| Tipos de cuantizacion | no disponible (el checkpoint se publica en BF16; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (18 shards, BF16, ~55,6 GB) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.8-27B (revision `1d4bf0f2ff6012fd82039f2fa52739d0dd7c60c0`), un transformer multimodal de tipo `Qwen3_5ForConditionalGeneration` con codificador visual y pipeline image-text-to-text. Sobre esta base se aplica un ajuste con LoRA de rango 128, alpha 32 y dropout 0, que posteriormente se fusiona en el modelo completo. El checkpoint resultante contiene 1.199 entradas en el state dictionary y se distribuye en 18 shards safetensors de 55.563.006.216 bytes en total.

El entrenamiento emplea SecOPD con destilación on-policy: la política se entrena sobre prompts atacados y el profesor es una copia congelada del modelo de inicialización condicionada a los prompts limpios emparejados. Se completaron 150 pasos de optimizador con learning rate 6e-5, 64 prompts por paso y 1 rollout por prompt. El objetivo KL se aplica a la respuesta completa (coeficiente 1.0, factor de descuento 0.0), con bonus de conciencia de razonamiento 0.0 y sin etiquetas de respuesta almacenadas. La generación de entrenamiento usa thinking activado, `reasoning_effort="xhigh"`, temperatura 1.0 y un máximo de 16.384 tokens. El pool de entrada consta de 19.155 registros de prompts optimizados, ordenados con semilla 0, sin shuffle y sin split de validación; su SHA-256 es `81db35908c4b5f889003be1add179105a058d38634f8ca3e9720896a14a9132d`.

Una particularidad operativa relevante es el uso de una plantilla de chat específica (`inference_chat_template.jinja`) que introduce un rol `input` para contenido no confiable y filtra delimitadores reservados. La plantilla por defecto del modelo base no soporta este rol, por lo que es necesario cargarla explícitamente para reproducir la frontera de confianza para la que fue entrenado el modelo.

## Capacidades

- Generación de texto y razonamiento con modo thinking activable y control de esfuerzo (`reasoning_effort="xhigh"` en la configuración de entrenamiento).
- Procesamiento multimodal imagen-texto gracias al codificador visual heredado del modelo base.
- Robustez frente a inyección de prompts mediante separación explícita entre instrucciones de confianza (rol `user`) y contenido no confiable (rol `input`).
- Soporte de flujos con herramientas: los retornos de herramientas deben colocarse en mensajes `input` posteriores a la petición del asistente.
- Conversación multi-turno con ventana de contexto de 262.144 tokens.
- Capacidades multilingües limitadas al inglés según la model card.
- No se documentan capacidades de audio ni de tool calling nativo más allá del formato de mensajes descrito.

## Casos de uso

- Atención al cliente con documentos externos: el modelo puede resumir o responder sobre textos aportados por el usuario colocándolos en mensajes `input`, de modo que instrucciones maliciosas embebidas en esos documentos no se confundan con la tarea de confianza.
- Pipelines RAG seguros: en un sistema de recuperación aumentada, los fragmentos recuperados se envían como contenido `input` y la pregunta del usuario como mensaje `user`, aprovechando el entrenamiento adversarial para resistir inyecciones en los documentos indexados.
- Agentes con uso de herramientas: las salidas de APIs o funciones externas se insertan como mensajes `input` tras la petición del asistente, reduciendo el riesgo de que una respuesta comprometida redirija el comportamiento del agente.
- Moderación y análisis de contenido hostil: el modelo puede procesar texto potencialmente adversarial (correos de phishing, páginas web, tickets) manteniendo la instrucción de análisis separada del material analizado.
- Asistentes sobre correo o mensajería: resumen y clasificación de mensajes de terceros no confiables sin que las instrucciones contenidas en ellos alteren la tarea solicitada por el usuario legítimo.
- Procesamiento de documentos con imágenes: al conservar el codificador visual, puede extraer información de capturas o PDFs escaneados, si bien la robustez frente a inyección visual no está establecida.
- Evaluación de robustez: útil como referencia o baseline en investigación sobre defensas frente a prompt injection, dado que el repo incluye metadatos de entrenamiento y procedencia reproducibles.

## Benchmarks y rendimiento

La model card anuncia una sección de resultados de evaluación comparando Qwen/Qwen3.8-27B con este checkpoint SecOPD (lr=6e-5) con thinking activado, temperatura 1.0, top-p 0.95, top-k 20, min-p 0.0, pero el texto proporcionado se interrumpe antes de incluir la tabla de resultados.

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Pesos en BF16: aproximadamente 55,6 GB solo para los pesos, según la model card; se requiere memoria adicional para activaciones y caché de inferencia.
- Para inferencia en BF16 completa se necesitan GPUs con al menos 80 GB de VRAM (A100 80GB, H100 80GB) o varias GPUs con `device_map="auto"`.
- No cabe en GPUs de consumo (RTX 4090 de 24 GB, RTX 3090 de 24 GB) en BF16; se requeriría cuantización, para la cual no se documentan formatos publicados.
- El razonamiento con `reasoning_effort="xhigh"` puede consumir gran parte del presupuesto de generación; conviene ajustar `max_new_tokens` al recurso disponible.
- Opciones de despliegue: la model card documenta uso con Transformers (`AutoModelForImageTextToText` y `AutoProcessor`); no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multimodal | Enfoque de seguridad | Licencia |
|---|---|---|---|---|---|
| Qwen3.8-27B-Thinking-SecOPD | 27,78 mil millones | 262.144 | Si | SecOPD con destilacion on-policy | apache-2.0 |
| Qwen/Qwen3.8-27B (base) | 27,78 mil millones | 262.144 | Si | Sin entrenamiento adversarial especifico | no disponible en la informacion |
| Alternativas de mismo tamano | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparado en la informacion proporcionada; la unica comparacion cualitativa posible es frente al modelo base, del que este checkpoint hereda arquitectura y contexto pero al que anade el entrenamiento SecOPD.

## Limitaciones y advertencias

- Idiomas: la model card declara únicamente inglés; el rendimiento en castellano no está validado.
- Robustez visual: la model card advierte explícitamente que conservar el codificador visual preserva la arquitectura, pero no establece calidad visual ni robustez frente a inyección de prompts visual.
- Dependencia de la plantilla: usar la plantilla por defecto del modelo base elimina el rol `input` y no reproduce la frontera de confianza; es un error de integración con consecuencias de seguridad.
- Responsabilidad de roles: la aplicación debe asignar correctamente qué contenido es `user` (confiable) y qué es `input` (no confiable); una asignación incorrecta anula la protección.
- Riesgo de alucinación: no se documentan evaluaciones de factualidad ni tasas de alucinación.
- Sesgos: no se documentan análisis de sesgo en la información disponible.
- Entrenamiento limitado: 150 pasos de optimizador y un pool de 19.155 prompts sin split de validación; no se reportan métricas de generalización.
- Adopción muy baja: 2 descargas y 0 likes en el momento de la consulta, sin evidencia de uso en producción.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías sobre el comportamiento en dominios no evaluados.
- Coste de despliegue: 55,6 GB en BF16 y ausencia de cuantizaciones publicadas limitan su uso fuera de infraestructura con GPUs de 80 GB o superiores.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Sizhe-Chen/Qwen3.8-27B-Thinking-SecOPD
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Dataset de entrenamiento: https://huggingface.co/datasets/Sizhe-Chen/Qwen3.8-27B-Thinking-SecOPD-trainset
- Paper SecPO: https://arxiv.org/abs/2610.41998
- Código oficial: https://github.com/Sizhe-Chen/SecPO
