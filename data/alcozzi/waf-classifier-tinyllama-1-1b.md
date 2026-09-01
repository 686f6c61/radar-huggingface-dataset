# alcozzi/waf-classifier-tinyllama-1.1b

## Resumen

El modelo `alcozzi/waf-classifier-tinyllama-1.1b` es un adaptador LoRA (Low-Rank Adaptation) entrenado sobre el modelo base `unsloth/tinyllama-chat-bnb-4bit`, una versión cuantizada a 4 bits de TinyLlama 1.1B. El nombre sugiere que está diseñado para tareas de clasificación relacionadas con firewalls de aplicaciones web (WAF), aunque la model card no proporciona detalles sobre el dataset de entrenamiento, las clases objetivo ni las métricas de evaluación. El adaptador se publicó con la librería PEFT y se entrenó mediante fine-tuning supervisado (SFT) usando TRL y Unsloth.

TinyLlama es un modelo de lenguaje pequeño de 1.1 mil millones de parámetros, basado en la arquitectura y el tokenizador de Llama 2, preentrenado con alrededor de 1 billón de tokens. Al ser un modelo compacto, puede ejecutarse en hardware de consumo, lo que lo hace atractivo para aplicaciones de clasificación en entornos con recursos limitados. Este adaptador concreto no ha recibido descargas ni likes en Hugging Face, y su fecha de creación es futura (agosto de 2026), por lo que probablemente se trata de un experimento o un trabajo en curso.

La relevancia de este modelo radica en la posibilidad de adaptar un modelo base pequeño y eficiente a una tarea específica de seguridad web mediante LoRA, sin necesidad de ajustar todos los parámetros. Sin embargo, la falta de documentación y de resultados de evaluación limita su uso directo en producción sin una validación adicional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Llama 2) con adaptador LoRA |
| Parametros totales | 1.1B (modelo base TinyLlama) + adaptador LoRA (tamano no especificado) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 2048 tokens (modelo base TinyLlama) |
| Tipos de cuantizacion | Modelo base: 4 bits (bitsandbytes); adaptador: safetensors (sin cuantizar) |
| Idiomas soportados | No disponible (el modelo base TinyLlama esta entrenado principalmente en ingles) |
| Licencia | No disponible para el adaptador; el modelo base TinyLlama usa Apache 2.0 |
| Formato de pesos | safetensors (adaptador) + cuantizacion 4-bit del base |

## Arquitectura y entrenamiento

El modelo base TinyLlama es un transformer decoder-only con arquitectura similar a Llama 2, que incluye normalización RMSNorm, activación SwiGLU y atención con FlashAttention. Tiene 22 capas, 2048 dimensiones de ocultación y 32 cabezas de atención. Fue preentrenado con aproximadamente 1 billón de tokens (el proyecto original planeaba 3 billones, pero el modelo publicado llegó a 1 billón) durante 3 épocas, usando el tokenizador de Llama 2 con un vocabulario de 32.000 tokens.

El adaptador LoRA se añade sobre la versión cuantizada a 4 bits del modelo chat de TinyLlama (unsloth/tinyllama-chat-bnb-4bit). El entrenamiento se realizó con fine-tuning supervisado (SFT), probablemente con un dataset de clasificación WAF, aunque no se proporciona información sobre el volumen, composición o preprocesamiento de los datos. No se menciona el uso de RLHF ni DPO. Tampoco se especifican los hiperparámetros de entrenamiento (tasa de aprendizaje, número de épocas, rango del LoRA, etc.).

## Capacidades

- Clasificación de texto: el adaptador está diseñado para clasificar entradas de texto, probablemente peticiones HTTP o logs, para detectar tráfico malicioso o ataques (por el nombre "waf-classifier").
- Generación de texto: hereda la capacidad del modelo base de generar texto, aunque el adaptador probablemente fuerza la salida a etiquetas de clasificación.
- Soporte de tool calling: no disponible, el modelo base TinyLlama no tiene soporte nativo para function calling.
- Soporte de agentes y multi-step reasoning: limitado; TinyLlama es un modelo pequeño sin capacidades avanzadas de razonamiento.
- Capacidades multilingües: el modelo base está entrenado principalmente en inglés, sin garantías para otros idiomas.
- Capacidades especiales: ninguna adicional; no hay modo de pensamiento, visión ni audio.

## Casos de uso

- Detección de ataques en peticiones HTTP: el modelo puede clasificar peticiones entrantes como benignas o maliciosas (SQL injection, XSS, path traversal, etc.) en un firewall de aplicación web. Se integraría como un filtro previo en el pipeline de entrada de un servidor web, usando la salida del clasificador para bloquear o permitir la petición.
- Análisis de logs de seguridad: procesar líneas de logs de servidores para identificar patrones de ataque o anomalías. El adaptador, al ser ligero, puede ejecutarse en paralelo sobre streams de logs sin requerir GPUs de alta gama.
- Clasificación de tráfico de red en entornos edge: desplegarlo en dispositivos con recursos limitados (Raspberry Pi, routers) para clasificar paquetes o flujos de red en tiempo real, gracias al bajo consumo de memoria del modelo base cuantizado.
- Filtrado de contenido en aplicaciones web: clasificar comentarios o entradas de usuario para detectar contenido malicioso o spam, similar a un moderador automático.
- Prototipado rápido de sistemas de seguridad: usar el adaptador como base para experimentar con técnicas de fine-tuning LoRA en tareas de ciberseguridad, evaluando su viabilidad antes de escalar a modelos más grandes.
- Educación e investigación: servir como ejemplo práctico de cómo adaptar un modelo pequeño a una tarea específica con PEFT, útil para cursos de NLP aplicado a seguridad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos sobre precisión, recall, F1 ni comparaciones con otros clasificadores en la model card ni en el repositorio.

## Requisitos de hardware

- VRAM estimada: el modelo base en 4 bits ocupa aproximadamente 0.6 GB, más el adaptador LoRA (tamaño no especificado, pero típicamente menos de 100 MB). Total estimado: < 1 GB de VRAM.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM (por ejemplo, NVIDIA GTX 1650, RTX 3050, o incluso integradas con soporte CUDA). También puede ejecutarse en CPU con 4-8 GB de RAM.
- Compatibilidad con GPU de consumo: sí, cabe en GPUs de gama baja y media.
- Opciones de despliegue: puede cargarse con Hugging Face Transformers usando PEFT, o exportarse a GGUF para ejecutarse con llama.cpp u Ollama. También es compatible con vLLM si se fusiona el adaptador con el modelo base.
- Latencia y throughput: no disponibles, pero dado el tamaño del modelo, se espera una latencia de decenas de milisegundos por inferencia en GPU, y de cientos de milisegundos en CPU.

## Comparativa con modelos similares

No hay información sobre modelos comparables específicos para clasificación WAF. Sin embargo, se puede comparar el modelo base TinyLlama con otros modelos pequeños de propósito general:

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| TinyLlama (base) | 1.1B | 2048 | Apache 2.0 | Hugging Face |
| Qwen2-0.5B | 0.5B | 32768 | Apache 2.0 | Hugging Face |
| Phi-3-mini | 3.8B | 4096 | MIT | Hugging Face |

El adaptador LoRA no tiene comparativa directa porque no se han publicado métricas. En cuanto a la tarea de clasificación WAF, existen modelos especializados como `distilbert-base-uncased-finetuned-sst-2-english` para análisis de sentimiento, pero no para WAF. No hay datos suficientes para establecer una comparación rigurosa.

## Limitaciones y advertencias

- Sesgos conocidos: al derivar de TinyLlama, puede heredar sesgos presentes en los datos de preentrenamiento (mayormente texto en inglés de dominio general).
- Riesgo de alucinación: en tareas de clasificación, el modelo podría generar etiquetas incorrectas o confusas si la entrada no se ajusta a los patrones vistos durante el entrenamiento.
- Limitaciones de contexto: la ventana de 2048 tokens limita el análisis de peticiones HTTP muy largas o de logs con muchas líneas.
- Restricciones de licencia: la licencia del adaptador no está especificada; el uso comercial requiere verificar la licencia del modelo base (Apache 2.0 permite uso comercial) y la del adaptador, que podría tener restricciones adicionales.
- Caveat para producción: no hay información sobre el dataset de entrenamiento, la metodología de evaluación ni los umbrales de decisión. El modelo no debería usarse en entornos de producción sin una validación exhaustiva con datos reales de tráfico WAF.
- Fecha de creación futura (2026): el modelo podría ser un artefacto de prueba o un error en la fecha; no hay evidencia de mantenimiento o soporte.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/alcozzi/waf-classifier-tinyllama-1.1b)
- [Paper de TinyLlama (arXiv)](https://arxiv.org/html/2401.02385)
- [Repositorio oficial de TinyLlama (GitHub)](https://github.com/jzhang38/TinyLlama)
- [TinyLlama-1.1B-Chat-v1.0 en Hugging Face](https://huggingface.co/TinyLlama/TinyLlama-1.1B-Chat-v1.0)
- [Modelo base unsloth/tinyllama-chat-bnb-4bit](https://huggingface.co/unsloth/tinyllama-chat-bnb-4bit)
