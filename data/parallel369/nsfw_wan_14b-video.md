# parallel369/NSFW_Wan_14b-video

## Resumen

NSFW Wan 14B T2V es un modelo de generación de texto a vídeo (text-to-video) de 14.000 millones de parámetros, creado por el usuario parallel369 a partir del modelo base Wan-AI/Wan2.1-T2V-14B, y ajustado (fine-tuned) específicamente para la generación de contenido para adultos (NSFW). El modelo resuelve el problema de la falta de herramientas especializadas en este dominio, ya que los modelos generales suelen bloquear o degradar este tipo de contenido. Su relevancia actual se debe al auge de los modelos de vídeo abiertos tipo Wan2.1 y a la comunidad que los adapta mediante fine-tuning con datasets curados.

Según la model card del autor, el modelo fue entrenado con una metodología unificada de una sola fase sobre un conjunto mixto de 30.000 clips de vídeo y 20.000 imágenes, a 480p y 17 fotogramas por clip, durante 15 épocas. El repositorio incluye todos los checkpoints intermedios (e1 a e15), recomendándose `wan_14B_e15.safetensors` para uso general y como base para entrenar LoRAs especializadas. El repo pesa 455,1 GB y el tag indica cuantización GGUF, aunque los checkpoints principales están en formato safetensors. La licencia es creativeml-openrail-m y el contenido está marcado como no apto para todos los públicos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de texto a vídeo (basado en Wan2.1-T2V-14B) |
| Parametros totales | 14.288.491.584 (~14 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF (indicado en tags); checkpoints principales en FP sin detalles de cuantización |
| Idiomas soportados | no disponible |
| Licencia | creativeml-openrail-m |
| Formato de pesos | safetensors (checkpoints e1–e15) y GGUF |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura transformer de Wan2.1-T2V-14B (Alibaba), un modelo difusor de texto a vídeo. El fine-tuning se realizó con una configuración unificada de una sola fase, en contraste con entrenamientos por fases previos, con el objetivo de evitar el colapso de calidad y la deriva anatómica. Se empleó un dataset mixto de 30.000 clips de vídeo y 20.000 imágenes estáticas entrenadas simultáneamente, lo que actúa como regularización espacial constante y permite aprender estética y movimiento en paralelo.

Los detalles de entrenamiento publicados indican 15 épocas con learning rate estable y warmup inicial, clips de 17 fotogramas a resolución 480p, y batch sizes optimizados para la arquitectura de 14B. El dataset de entrenamiento proviene de los 1.000 posts principales de aproximadamente 1.250 subreddits NSFW distintos, con captions basadas en el lenguaje y las convenciones de etiquetado de esas comunidades. No se menciona el uso de RLHF ni DPO. Como innovación destacable, el modelo genera movimiento de forma nativa, sin necesidad de motion LoRAs externas, e incluye un archivo `prompting-guide.json` con análisis de terminología para mejorar los prompts.

## Capacidades

- Generación de vídeo corto (de pocos segundos) a partir de prompts en lenguaje natural, especializada en contenido para adultos.
- Movimiento temporal coherente de forma nativa, sin necesidad de LoRAs de movimiento externas.
- Alta fidelidad espacial y consistencia temporal según el autor, con 15 checkpoints disponibles para selección o comparación.
- Uso como base estable para entrenar LoRAs especializadas (personajes, estilos, acciones concretas), gracias a su comprensión base de anatomía y movimiento.
- Guía de prompting incluida (`prompting-guide.json`) con terminología específica por sub-comunidad para maximizar la relevancia temática.
- No se ha documentado soporte de tool calling, agentes, razonamiento multi-paso ni capacidades multilingües.

## Casos de uso

- Generación de clips de vídeo para adultos a medida: el usuario describe escenas en lenguaje natural y el modelo produce clips cortos temáticamente relevantes a 480p, adecuado para creadores de contenido adulto que generan material original.
- Base para fine-tuning con LoRAs: al tener ya integrada la comprensión de anatomía y movimiento, los creadores pueden entrenar LoRAs ligeras centradas solo en el concepto nicho deseado (personaje, estilo artístico o acción concreta), reduciendo el tamaño del dataset y el tiempo de entrenamiento.
- Investigación en generación de vídeo especializada: estudio de cómo el entrenamiento mixto imagen-vídeo simultáneo afecta a la regularización espacial y a la deriva anatómica en modelos difusores de vídeo.
- Comparación de checkpoints: los 15 checkpoints por época permiten analizar la progresión del entrenamiento, evaluar overfitting y seleccionar el punto óptimo, útil para investigación en schedules de entrenamiento.
- Experimentación con prompting guiado por datos: el `prompting-guide.json` permite investigar cómo el vocabulario del dataset de origen condiciona las salidas del modelo, un caso de estudio sobre sesgo de datos.
- Producción de material con estéticas concretas de comunidades concretas: dado que las captions replican convenciones de subreddits, el modelo responde bien a esa terminología, útil para replicar estilos visuales populares en esos entornos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al ser un modelo generativo de vídeo especializado en contenido adulto, no existen métricas estándar (FVD, VBench, etc.) publicadas por el autor; solo se ofrecen valoraciones cualitativas sobre calidad espacial y estabilidad de movimiento.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible oficialmente; el modelo base Wan2.1-T2V-14B en FP16 requiere aproximadamente 28-30 GB de VRAM, y versiones cuantizadas (GGUF Q4/Q8) pueden funcionar en torno a 10-18 GB.
- GPU recomendadas: RTX 4090 (24 GB) para versiones cuantizadas; A100 u H100 para inferencia en precisión completa.
- Consumer GPUs: viable en una RTX 4090 con cuantización GGUF; en GPUs de 12-16 GB (RTX 3060 12 GB, RTX 4060 Ti 16 GB) probablemente solo con cuantizaciones agresivas y offloading.
- Despliegue: el modelo base Wan2.1 se ejecuta habitualmente con ComfyUI, Diffusers y herramientas compatibles con checkpoints safetensors de Wan; el soporte GGUF depende de las extensiones correspondientes (por ejemplo, ComfyUI-GGUF). No se menciona soporte para vLLM, TGI, llama.cpp u Ollama, que no aplican a modelos de difusión de vídeo.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Tarea | Licencia | Notas |
|---|---|---|---|---|
| NSFW Wan 14B T2V (este modelo) | ~14 B | Texto a vídeo (NSFW) | creativeml-openrail-m | Fine-tune de Wan2.1-T2V-14B, checkpoints e1–e15, GGUF disponible |
| Wan-AI/Wan2.1-T2V-14B (base) | ~14 B | Texto a vídeo general | Apache 2.0 (modelo base) | Modelo original de Alibaba, contenido filtrado, soporta 480p y 720p |
| Wan-AI/Wan2.1-T2V-1.3B | ~1,3 B | Texto a vídeo general | Apache 2.0 (modelo base) | Versión ligera, accesible en consumer GPUs, menor calidad |

## Limitaciones y advertencias

- Sesgo extremo hacia contenido NSFW: el modelo se entrenó casi exclusivamente con material de subreddits para adultos, por lo que el autor indica que probablemente funcione mal con prompts SFW.
- Sesgo de datos de origen: el dataset replica el lenguaje, estéticas y arquetipos de comunidades específicas de Reddit, lo que condiciona fuertemente los resultados y puede reproducir estereotipos y sesgos de esas comunidades.
- Riesgo de alucinación/artefactos: aunque el autor afirma calidad mejorada, no hay métricas objetivas; los artefactos típicos de modelos de vídeo (inconsistencias temporales, anatomía incorrecta) pueden persistir.
- Resolución limitada: el entrenamiento se realizó a 480p con clips de 17 fotogramas; no está documentado el rendimiento a otras resoluciones o duraciones.
- Restricciones de licencia: la licencia creativeml-openrail-m permite uso comercial pero incluye cláusulas de uso aceptable que prohíben ciertos usos; además, el contenido NSFW está marcado como not-for-all-audiences y su distribución puede estar sujeta a restricciones legales según la jurisdicción.
- Contenido explícito: el uso, generación y distribución de material sexual explícito generado por IA está sujeto a regulación (verificación de edad, consentimiento, deepfakes); los usuarios deben cumplir la legislación aplicable.
- Repositorio de 455,1 GB: el almacenamiento y descarga de todos los checkpoints exige recursos significativos; se recomienda descargar solo `wan_14B_e15.safetensors` para uso general.
- No disponible: datos de contexto, idiomas soportados, benchmarks y requisitos oficiales de hardware.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/parallel369/NSFW_Wan_14b-video
- Modelo base: https://huggingface.co/Wan-AI/Wan2.1-T2V-14B
- Comunidad de soporte (Discord del autor): https://discord.gg/mjnStFuCYh
- Paper, demo y otros enlaces: no disponible
