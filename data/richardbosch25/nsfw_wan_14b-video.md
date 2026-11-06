# Richardbosch25/NSFW_Wan_14b-video

## Resumen

NSFW Wan 14B T2V es un modelo de generación de vídeo a partir de texto (text-to-video) de 14.000 millones de parámetros, publicado por el usuario Richardbosch25 en Hugging Face. Se trata de un fine-tuning sin filtros (uncensored) del modelo base Wan-AI/Wan2.1-T2V-14B, especializado en la generación de contenido para adultos (NSFW). El modelo resuelve un problema concreto: la incapacidad de los modelos de vídeo comerciales y abiertos estándar para producir contenido explícito, al estar alineados con filtros de seguridad.

El autor entrenó el modelo con una metodología unificada de una sola fase, combinando simultáneamente 30.000 clips de vídeo y 20.000 imágenes fijas durante 15 épocas, con el objetivo de evitar el colapso de calidad y la deriva anatómica que suelen aparecer en entrenamientos por fases. Los clips se entrenaron a 480p con 17 fotogramas por vídeo. El checkpoint recomendado es `wan_14B_e15.safetensors`.

Su relevancia actual radica en la tendencia de la comunidad open source a derivar variantes especializadas de modelos de vídeo de gran tamaño (como Wan 2.1), y en su propuesta como base estable para el entrenamiento posterior de LoRAs de nicho. El repositorio está etiquetado como "not-for-all-audiences" y su licencia es CreativeML OpenRAIL-M, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer text-to-video (derivado de Wan2.1-T2V-14B) |
| Parametros totales | 14.288.491.584 (~14 B) |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF (según tags); checkpoints completos en safetensors |
| Idiomas soportados | no disponible |
| Licencia | creativeml-openrail-m |
| Formato de pesos | safetensors (checkpoints por época) y GGUF |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura transformer de Wan2.1-T2V-14B, un modelo difusor de generación de vídeo a partir de texto. La variante de Richardbosch25 aplica un fine-tuning completo (no LoRA) sobre el modelo base, manteniendo la capacidad nativa de generación de movimiento sin necesidad de motion LoRAs externas.

El entrenamiento se realizó con una configuración unificada de 15 épocas sobre un dataset mixto: 30.000 clips de vídeo y 20.000 imágenes fijas entrenadas simultáneamente, lo que según el autor actúa como regularización espacial constante y evita la degradación de calidad típica del entrenamiento por fases. Los clips de vídeo constan de 17 fotogramas a resolución 480p. Los datos proceden de las 1.000 publicaciones principales de aproximadamente 1.250 subreddits NSFW distintos, y los captions emplean el lenguaje y las convenciones de etiquetado de esas comunidades. El repositorio incluye un archivo `prompting-guide.json` con análisis de palabras clave y frases para mejorar los prompts. No se menciona el uso de RLHF ni DPO.

## Capacidades

- Generación de vídeo corto (unos pocos segundos, 17 fotogramas a 480p) a partir de prompts en lenguaje natural.
- Especialización en contenido adulto (NSFW) con fidelidad temática y consistencia temporal.
- Generación de movimiento nativa, sin necesidad de LoRAs de movimiento externas.
- Comprensión de anatomía, estéticas y acciones del dominio adulto gracias al entrenamiento con datos mixtos (vídeo + imagen).
- Compatibilidad como base para entrenamiento de LoRAs especializadas (personajes, estilos artísticos, acciones concretas).
- No está indicado soporte de tool calling, agentes, razonamiento multi-step ni capacidades multilingües.

## Casos de uso

- Generación de clips de vídeo para adultos bajo demanda: el usuario escribe un prompt descriptivo en lenguaje natural y el modelo produce un clip corto de unos segundos coherente con la escena descrita.
- Base para fine-tuning de LoRAs de nicho: al tener el modelo una comprensión anatómica y de movimiento ya consolidada, los creadores pueden entrenar LoRAs ligeras centradas solo en el concepto específico (personaje, estilo o acción), reduciendo el tamaño del dataset y el coste de entrenamiento.
- Investigación en generación de vídeo sin filtros: permite estudiar cómo el fine-tuning sobre datos de comunidades específicas afecta a la fidelidad temática y la consistencia temporal en modelos difusores de vídeo.
- Exploración de estilos visuales del dominio adulto: mediante el `prompting-guide.json`, los usuarios pueden dirigir la generación hacia estéticas y arquetipos concretos presentes en las comunidades de origen de los datos.
- Comparación de checkpoints en procesos de entrenamiento: el repositorio publica los 15 checkpoints por época, lo que facilita evaluar la progresión del entrenamiento y seleccionar el punto óptimo.
- Creación de contenido con pipelines de difusión locales: al distribuirse en safetensors y GGUF, puede integrarse en herramientas de inferencia locales compatibles con la arquitectura Wan 2.1.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo completo en FP16 ocupa aproximadamente 28-29 GB solo en pesos (14,3 B de parámetros); con cuantización GGUF (Q4/Q8) puede reducirse a unos 8-16 GB. No hay cifras oficiales publicadas.
- GPU recomendadas: para el modelo completo en precisión completa, una NVIDIA A100 (40/80 GB) o H100; con cuantización agresiva podría ejecutarse en una RTX 4090 (24 GB) o RTX 3090. Estas estimaciones no están confirmadas por el autor.
- Consumer GPU: solo viable en tarjetas de gama alta (RTX 3090/4090) utilizando las versiones GGUF cuantizadas; el checkpoint completo en safetensors excede la VRAM de la mayoría de tarjetas de consumo.
- Opciones de despliegue: cualquier pipeline de inferencia compatible con la arquitectura Wan 2.1 (por ejemplo, ComfyUI con nodos para Wan, o diffusers si se soporta el formato); las versiones GGUF pueden ejecutarse con backends compatibles con ese formato. No se especifica soporte oficial de vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Tarea | Licencia | Notas |
|---|---|---|---|---|
| NSFW Wan 14B T2V (este modelo) | ~14 B | Text-to-video NSFW | CreativeML OpenRAIL-M | Fine-tuning uncensored, GGUF y safetensors, 15 checkpoints |
| Wan-AI/Wan2.1-T2V-14B (base) | ~14 B | Text-to-video general | Apache-2.0 | Modelo original de Alibaba, contenido filtrado |
| Wan-AI/Wan2.1-T2V-1.3B | ~1,3 B | Text-to-video general | Apache-2.0 | Versión ligera, apta para consumer GPUs |

## Limitaciones y advertencias

- Sesgo fuerte hacia contenido NSFW: al estar entrenado casi exclusivamente con datos de subreddits para adultos, el autor indica que probablemente funcione mal con prompts SFW.
- Contenido explícito: el modelo genera material para adultos sin filtros; su uso está restringido a audiencias adultas y puede estar prohibido en determinadas jurisdicciones o plataformas.
- Riesgo de generación de contenido no deseado o ilegal: al tratarse de un modelo uncensored, no incluye salvaguardas; el usuario asume la responsabilidad legal y ética de los contenidos generados, incluido el riesgo de deepfakes.
- Artefactos y especificidad: la model card reconoce posibles artefactos heredados y limitaciones de calidad, aunque el texto se corta antes de detallarlos.
- Resolución limitada: el entrenamiento se realizó a 480p con clips de 17 fotogramas, por lo que la calidad a resoluciones superiores o vídeos largos no está garantizada.
- Licencia CreativeML OpenRAIL-M: permite uso comercial con restricciones de uso responsable especificadas en la licencia; conviene revisar sus cláusulas antes de despliegues en producción.
- Descargas muy bajas (12 en el momento de la ficha) y sin comunidad de verificación amplia: no hay auditorías independientes de calidad ni seguridad.
- Idiomas de los prompts: no se especifica; dado el origen de los captions, es probable que el rendimiento óptimo sea con prompts en inglés.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Richardbosch25/NSFW_Wan_14b-video
- Modelo base: https://huggingface.co/Wan-AI/Wan2.1-T2V-14B
- Discord de la comunidad del autor: https://discord.gg/mjnStFuCYh
