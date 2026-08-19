# reaperdoesntknow/Disctil-Qwen3-1.7B

## Resumen

Disctil-Qwen3-1.7B es un modelo de lenguaje de 2.031 millones de parámetros desarrollado por Convergent Intelligence LLC (usuario reaperdoesntknow en HuggingFace) como parte de su colección DistilQwen. Se trata de un fine-tuning mediante SFT (Supervised Fine-Tuning) del modelo base reaperdoesntknow/DiStil-Qwen3-1.7B-uncensored, que a su vez es una destilación del modelo Qwen3-30B-A3B. El modelo está orientado a generación de texto conversacional y se presenta como una variante "sin censura" (uncensored), lo que implica que no incorpora los filtros de seguridad habituales de los modelos comerciales.

El entrenamiento se realizó con el framework TRL (Transformers Reinforcement Learning) y el modelo se distribuye en formato safetensors con pesos en BF16. Según fuentes externas, dispone de una ventana de contexto de aproximadamente 33K tokens. La relevancia de este modelo radica en su tamaño reducido (2B parámetros) combinado con técnicas de destilación desde un modelo mucho mayor (30B-A3B), lo que lo hace apto para despliegue en entornos con recursos limitados o en el edge.

El modelo forma parte de una serie que explora la metodología "Structure Over Scale" (estructura sobre escala) y el marco matemático del "Discrepancy Calculus" (DISC), que busca preservar las fronteras estructurales en el espacio de pesos durante el entrenamiento. Sin embargo, la información pública sobre el proceso de destilación y los datos de entrenamiento es limitada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basada en Qwen3, destilada desde Qwen3-30B-A3B) |
| Parametros totales | 2.031.739.904 (~2,03B) |
| Parametros activos | No aplicable (modelo denso, no MoE) |
| Longitud de contexto | 33K (segun Antbase; no confirmado en la model card) |
| Tipos de cuantizacion | FP4, FP8 (segun FriendliAI); no se especifican otros formatos |
| Idiomas soportados | No disponible |
| Licencia | No disponible (la model card indica "licence: license", sin especificar) |
| Formato de pesos | safetensors (BF16) |

## Arquitectura y entrenamiento

El modelo es un fine-tuning SFT del modelo reaperdoesntknow/DiStil-Qwen3-1.7B-uncensored, que a su vez es el resultado de una destilación de conocimiento desde Qwen3-30B-A3B hacia una arquitectura de 1.7B parámetros. El proceso de destilación se realizó con tres variantes de teacher (Instruct, Thinking y Coder) según la colección DistilQwen, aunque no se especifica cuál se utilizó para este modelo concreto. El fine-tuning se ejecutó con el framework TRL (versión 0.29.1) y Transformers 5.0.0, utilizando la técnica SFT estándar.

La model card menciona el marco teórico del "Discrepancy Calculus" (DISC), que introduce un operador de discrepancia y una descomposición de la función de peso en componentes absolutamente continuos, saltos y parte de Cantor. Según el autor, este enfoque identifica y preserva las fronteras estructurales en el espacio de pesos que el fine-tuning convencional tiende a difuminar. No se proporcionan detalles sobre el dataset de entrenamiento, el número de tokens utilizados ni la composición de los datos. Tampoco se indica si se aplicaron técnicas de RLHF o DPO adicionales más allá del SFT.

## Capacidades

- Generación de texto conversacional: el modelo está diseñado para mantener diálogos multi-turno, como muestra el ejemplo de uso en la model card con preguntas abiertas.
- Modelo "uncensored": no incorpora filtros de seguridad ni moderación de contenido, lo que permite generar respuestas sin restricciones temáticas.
- Capacidades multilingües: no se especifican idiomas soportados; se asume herencia del modelo base Qwen3, pero no está confirmado.
- No se documentan capacidades de tool calling, function calling, razonamiento multi-paso, visión o audio en la información disponible.
- Al ser una destilación de Qwen3-30B-A3B, podría heredar parcialmente las capacidades de razonamiento del modelo teacher, aunque no hay evidencia pública de ello.

## Casos de uso

- Prototipado rápido de chatbots: gracias a su tamaño reducido (~2B parámetros) y formato BF16, puede desplegarse en GPUs consumer para experimentar con interacciones conversacionales sin restricciones de contenido.
- Investigación en destilación de conocimiento: sirve como punto de comparación dentro de la colección DistilQwen para estudiar el efecto de la destilación desde un modelo MoE de 30B hacia uno denso de 1.7B.
- Experimentación con modelos sin censura: su naturaleza "uncensored" permite explorar comportamientos de generación libre en entornos de investigación controlados, aunque con las advertencias éticas correspondientes.
- Generación de texto creativo: puede utilizarse para tareas de escritura creativa, brainstorming o generación de contenido donde no se requieran filtros de seguridad.
- Evaluación de metodologías de entrenamiento: el marco DISC y la metodología "Structure Over Scale" pueden estudiarse en este modelo para validar hipótesis sobre preservación de estructura en el espacio de pesos.
- Despliegue en el edge: con un peso de ~4 GB en BF16 y posibilidad de cuantización a FP8 o FP4, es viable para ejecutarse en dispositivos con poca memoria, como portátiles o sistemas embebidos con aceleradores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni otras evaluaciones estándar. Tampoco se ofrecen comparativas con otros modelos de la misma categoría.

## Requisitos de hardware

- VRAM estimada para inferencia: con pesos BF16 (2,03B × 2 bytes ≈ 4,06 GB), se requieren al menos 6 GB de VRAM considerando overhead de activaciones y KV cache. Con cuantización FP8 (~2 GB) o FP4 (~1 GB), la VRAM necesaria se reduce significativamente.
- GPUs recomendadas: RTX 3060 (12 GB) o superior para BF16; RTX 4060 (8 GB) o superior para FP8; GPUs con 4 GB pueden ser suficientes con FP4.
- Cabe en GPUs consumer: sí, es compatible con la mayoría de GPUs de gama media actuales (RTX 30/40/50 series, AMD RX 6000/7000) siempre que se use cuantización.
- Opciones de despliegue: transformers (con pipeline text-generation), vLLM, TGI (Text Generation Inference), llama.cpp (si se convierte a GGUF), Ollama (mediante conversión) y FriendliAI (que ya ofrece el modelo con cuantización FP4/FP8).
- Latencia y throughput: no se dispone de datos medidos. Para un modelo de 2B en una GPU moderna, se puede esperar una generación de entre 50 y 150 tokens por segundo en FP8, aunque esto es una estimación no verificada.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni especificaciones detalladas de modelos comparables en la información proporcionada. Sin embargo, se pueden mencionar alternativas de la misma familia:

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Disctil-Qwen3-1.7B (este) | 2,03B | 33K (no confirmado) | No disponible | Fine-tuning "uncensored" de DiStil-Qwen3-1.7B |
| Qwen3-1.7B (original) | 1,7B | 32K | Apache 2.0 | Modelo base de la familia Qwen3, con soporte oficial |
| Qwen3-1.7B-Coder-Distilled-SFT | 1,7B (estimado) | No disponible | No disponible | Otro miembro de la colección DistilQwen, orientado a código |
| DiStil-Qwen3-1.7B-uncensored | 1,7B (estimado) | No disponible | No disponible | Modelo base de este fine-tuning, también "uncensored" |

La comparación directa no es posible sin datos de rendimiento. La principal diferencia frente a Qwen3-1.7B original es la ausencia de licencia clara y el enfoque "uncensored".

## Limitaciones y advertencias

- Sesgos conocidos: no se ha publicado ningún análisis de sesgos. Al ser un modelo "uncensored", podría amplificar sesgos o generar contenido ofensivo sin filtros.
- Riesgo de alucinacion: al ser un modelo de solo 2B parámetros, es probable que presente alucinaciones frecuentes, especialmente en tareas que requieren conocimiento factual extenso.
- Limitaciones de contexto: la ventana de contexto no está confirmada oficialmente; si es de 33K, es adecuada para diálogos largos pero inferior a modelos más grandes.
- Restricciones de licencia: la licencia no está especificada, lo que impide su uso comercial sin consultar al autor. La model card menciona "licence: license", que no es una licencia válida reconocida.
- Sin soporte de herramientas: no se documenta tool calling ni function calling, limitando su uso en aplicaciones de agentes.
- Falta de transparencia: no se detallan los datos de entrenamiento, el proceso de destilación ni los hiperparámetros del SFT, lo que dificulta la reproducibilidad.
- Riesgo de contenido inapropiado: al ser "uncensored", puede generar contenido sexual, violento o ilegal sin restricciones, lo que requiere medidas de seguridad adicionales en producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/reaperdoesntknow/Disctil-Qwen3-1.7B
- Modelo base (DiStil-Qwen3-1.7B-uncensored): https://huggingface.co/reaperdoesntknow/DiStil-Qwen3-1.7B-uncensored
- Coleccion DistilQwen: https://huggingface.co/collections/reaperdoesntknow/distilqwen-69bf40ec669117e3f069ef1c
- Paper "Structure Over Scale" (DOI: 10.57967/hf/8165): https://doi.org/10.57967/hf/8165
- Paper "Three Teachers to Dual Cognition" (DOI: 10.57967/hf/8184): https://doi.org/10.57967/hf/8184
- Paper "Discrepancy Calculus" (DOI: 10.57967/hf/8194): https://doi.org/10.57967/hf/8194
- Pagina del modelo en Antbase: https://antbase.ai/models/disctil-qwen3-1-7b
- Pagina del modelo en FriendliAI: https://friendli.ai/models/reaperdoesntknow/Disctil-Qwen3-1.7B
