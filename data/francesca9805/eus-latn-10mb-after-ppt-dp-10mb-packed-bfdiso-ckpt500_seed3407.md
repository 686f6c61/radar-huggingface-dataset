# francesca9805/eus-latn-10mb-after-ppt-Dp-10mb-packed-bfdiso-ckpt500_seed3407

## Resumen

El modelo `eus-latn-10mb-after-ppt-Dp-10mb-packed-bfdiso-ckpt500_seed3407`, publicado por el usuario francesca9805, es un ajuste fino (SFT) del checkpoint `eus-latn-10mb-ppt-Dp-10mb-packed-bfdiso_seed3407`, del mismo autor. Se trata de un modelo de generación de texto de arquitectura GPT-2 con 39.087.104 parámetros, entrenado mediante la librería TRL (versión 0.23.0) sobre Transformers 4.56.2. El nombre del repositorio sugiere un trabajo experimental centrado en tokenización y datos empaquetados para euskera en escritura latina (`eus-latn`), con un presupuesto de datos del orden de 10 MB.

El modelo es relevante únicamente como artefacto de investigación: su tamaño (39 M de parámetros) y su origen (un fine-tune de un checkpoint previo del mismo autor, sin model card sustantiva) indican que no está pensado para uso en producción. No se documentan datos de entrenamiento, composición del corpus, idiomas soportados ni licencia, lo que limita seriamente cualquier evaluación rigurosa. La fecha de creación (octubre de 2026) y el volumen de descargas (512) apuntan a un experimento académico de bajo perfil.

La ficha se basa exclusivamente en los metadatos de Hugging Face y en la model card generada automáticamente por TRL. Cualquier dato no presente en esa información se marca como "no disponible".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-2 (transformer decoder-only, según tag `gpt2`) |
| Parametros totales | 39.087.104 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; cuantización posible vía herramientas externas) |
| Idiomas soportados | no disponible (el nombre sugiere euskera en escritura latina) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Modelo base | francesca9805/eus-latn-10mb-ppt-Dp-10mb-packed-bfdiso_seed3407 |
| Framework de entrenamiento | TRL 0.23.0, Transformers 4.56.2, PyTorch 2.11.0 |
| Tamaño del repo | 3,7 GB |

## Arquitectura y entrenamiento

La arquitectura es GPT-2, un transformer decoder-only con atención causal estándar. Con 39.087.104 parámetros, encaja en la escala de los GPT-2 pequeños (el GPT-2 original de 124 M es notablemente mayor), lo que sugiere una configuración reducida de capas y dimensión oculta, aunque no se detallan los hiperparámetros exactos. El tag `gpt2` en Hugging Face confirma la familia arquitectónica.

El entrenamiento se realizó mediante SFT (supervised fine-tuning) con TRL, partiendo del checkpoint `eus-latn-10mb-ppt-Dp-10mb-packed-bfdiso_seed3407`. El nombre del repositorio indica varias pistas sobre el pipeline: `eus-latn` (euskera, escritura latina), `10mb` (probablemente 10 MB de datos), `packed` (secuencias empaquetadas), `bfdiso` (posiblemente *bf16* con algún esquema de precisión o *bfloat16 isolation*) y `ckpt500` (checkpoint en el paso 500). No se especifica el número de tokens de entrenamiento, la composición del dataset, ni si hubo RLHF o DPO. El run de Weights & Biases enlazado en la model card (`f-padovani-university-of-groningen/new-tokenizers`) sugiere un contexto de investigación sobre tokenizadores en la Universidad de Groningen.

## Capacidades

- Generación de texto autoregresiva básica, limitada por el tamaño del modelo (39 M de parámetros).
- Ajuste por instrucciones vía SFT, según el pipeline de TRL empleado.
- Soporte de chat mediante `pipeline("text-generation")` con mensajes con rol `user`, tal como muestra la model card.
- Compatibilidad con Text Generation Inference (tag `text-generation-inference`) y `endpoints_compatible`.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo "thinking".
- Capacidades multilingües: no disponibles; el nombre sugiere foco en euskera.

## Casos de uso

- Experimentación académica con tokenizadores: el modelo sirve como punto de comparación en estudios sobre tokenización del euskera, dado el contexto de investigación que sugiere el run de W&B.
- Pruebas de pipelines de SFT con TRL: útil como caso de juguete para validar flujos de entrenamiento, logging en W&B y publicación en Hugging Face.
- Generación de texto de baja latencia en CPU: con 39 M de parámetros, la inferencia es viable en hardware modesto, útil para demos y prototipos.
- Baseline para fine-tuning posterior: al ser un checkpoint pequeño, puede servir de punto de partida para experimentos de ajuste con recursos limitados.
- Validación de despliegue con TGI: el tag `text-generation-inference` permite probar integraciones de serving sin coste elevado de GPU.
- Docencia y formación: ejemplo didáctico de modelo GPT-2 pequeño ajustado con SFT y publicado con metadatos estándar de Hugging Face.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 (39 M de parámetros ≈ 156 MB de pesos); en bf16, aproximadamente 78 MB.
- GPU recomendadas: cualquier GPU consumer moderna (GTX 1060, RTX 3060, RTX 4090) es sobradamente suficiente; también viable en CPU.
- Cabe en cualquier GPU consumer y en la mayoría de entornos integrados.
- Opciones de despliegue: `transformers` (pipeline), Text Generation Inference (tag explícito), potencialmente llama.cpp u Ollama si se convierte a GGUF, aunque no se documenta dicha conversión.
- Latencia y throughput: no disponibles; por el tamaño, se espera latencia muy baja en GPU y aceptable en CPU, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| eus-latn-10mb-after-ppt-... (este modelo) | 39 M | no disponible | no disponible | Hugging Face |
| GPT-2 small (OpenAI) | 124 M | 1024 tokens | MIT | Hugging Face, ampliamente disponible |
| DistilGPT-2 | 82 M | 1024 tokens | Apache 2.0 | Hugging Face |
| Modelo base del autor (`eus-latn-10mb-ppt-...`) | no disponible | no disponible | no disponible | Hugging Face |

La comparación es aproximada: no hay datos de rendimiento del modelo evaluado, y los modelos de referencia (GPT-2 small, DistilGPT-2) tienen licencias y documentación mucho más completas. El modelo base del mismo autor es el comparable más directo, pero carece igualmente de especificaciones públicas.

## Limitaciones y advertencias

- Model card mínima: generada automáticamente por TRL, sin información sobre datos, sesgos ni evaluación.
- Licencia no especificada: no se puede garantizar uso comercial; la model card incluye `licence: license` sin concreción.
- Idiomas no declarados: aunque el nombre sugiere euskera, no hay confirmación oficial ni cobertura documentada.
- Riesgo elevado de alucinación y texto incoherente por el tamaño reducido (39 M de parámetros).
- Sin benchmarks: imposible comparar su calidad con alternativas de forma objetiva.
- Contexto no documentado: se desconoce la ventana máxima; no apto para tareas de contexto largo.
- Origen experimental: el nombre (`ckpt500`, `seed3407`, `10mb`) indica un checkpoint intermedio de un experimento, no un modelo final pulido.
- Sin garantías de soporte ni mantenimiento por parte del autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/francesca9805/eus-latn-10mb-after-ppt-Dp-10mb-packed-bfdiso-ckpt500_seed3407
- Modelo base: https://huggingface.co/francesca9805/eus-latn-10mb-ppt-Dp-10mb-packed-bfdiso_seed3407
- Run de Weights & Biases: https://wandb.ai/f-padovani-university-of-groningen/new-tokenizers/runs/9odfnrk5
- Repositorio TRL: https://github.com/huggingface/trl
