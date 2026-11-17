# hmb/wan22-ti2v-5b-cinemagraph-lora

## Resumen

`hmb/wan22-ti2v-5b-cinemagraph-lora` es un adaptador LoRA de rango 16 entrenado sobre el modelo base `Wan-AI/Wan2.2-TI2V-5B-Diffusers`, un modelo de difusión de vídeo de 5.000 millones de parámetros desarrollado por Alibaba Wan. El LoRA convierte una imagen estática en un GIF corto con bucle perfecto (seamless loop) de estilo cinemagraph: movimiento sutil, cámara estática y último fotograma coincidente con el primero. El autor del adaptador es el usuario `hmb` de Hugging Face.

El adaptador resuelve un problema muy concreto de los modelos image-to-video: la generación de bucles sin costura. En lugar de pedir al modelo base que improvise continuidad temporal, el LoRA se entrena específicamente sobre 150 clips filtrados por coincidencia entre primer y último fotograma, de modo que el modelo aprende a cerrar el bucle dentro de un presupuesto temporal fijo de 25 fotogramas (2 segundos a 12,5 fps).

Es relevante por su bajo coste de entrenamiento y despliegue: solo 40,3 millones de parámetros entrenables (0,8 % del total), 1.000 pasos de entrenamiento en 568 segundos y un pico de 15,9 GB de VRAM en una L40S. La licencia Apache 2.0 y el formato diffusers facilitan su integración en pipelines existentes de generación de vídeo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LoRA sobre transformer de difusión 3D (Wan2.2-TI2V-5B) con VAE y text encoder UMT5-XXL |
| Parámetros totales | 40,3 M entrenables en el LoRA (0,8 % del modelo base de 5.000 M) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 25 fotogramas por bucle (700 tokens latentes); resolución de entrenamiento 320×320 |
| Tipos de cuantización | no disponible (pesos del LoRA en fp32, base en bf16) |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (diffusers / PEFT LoRA), repositorio de 1,3 GB |

## Arquitectura y entrenamiento

El LoRA se aplica sobre el transformer 3D de Wan2.2-TI2V-5B, un modelo de difusión de vídeo con objetivos de flow matching (`shift = 5.0`, target `noise − clean`). El adaptador tiene rango y alpha de 16, con `init_lora_weights=True`, y ataca los módulos `to_q`, `to_k`, `to_v`, `to_out.0`, `ffn.net.0.proj` y `ffn.net.2`. El entrenamiento se hizo con precisión bf16 en el base y fp32 en los parámetros del LoRA, con gradient checkpointing.

El dataset de entrenamiento es `hmb/openvid-loop-gifs`, 150 clips derivados de OpenVid-1M (arXiv:2407.02371) filtrados para que su primer y último fotograma casi coincidan. Se reservaron 3 clips como held-out. El entrenamiento es de dos etapas: los latentes de vídeo, los latentes del primer fotograma y ambos embeddings de prompt (positivo y negativo) se precalculan y se publican como `precomputed_latents.pt`, de modo que el text encoder UMT5-XXL nunca está residente en memoria durante el entrenamiento ni en los renders de checkpoint. Solo se recarga el VAE para decodificar, lo que reduce el pico de memoria de ~27 GB a 15,9 GB.

La innovación técnica clave es la reproducción del mecanismo `expand_timesteps`: el fotograma 0 del latente se fija al primer fotograma codificado con timestep 0, mediante `map = (1 − first_frame_mask) · condition + first_frame_mask · latents` y un timestep por token de forma `(batch, 700)`. La pérdida se calcula solo sobre los tokens no fijados. El entrenamiento usó AdamW (0,9, 0,999), LR 1e-4 con decaimiento coseno, 50 pasos de warmup, weight decay 0,01 y grad-clip 1,0, batch size 1, durante 1.000 pasos a 0,47–0,50 s/paso.

## Capacidades

- Generación de vídeo a partir de imagen (image-to-video) con movimiento sutil de estilo cinemagraph y cámara estática.
- Generación de bucles sin costura: el último fotograma coincide con el primero dentro de un presupuesto de 25 fotogramas.
- Generación texto-a-vídeo a través del pipeline base `WanImageToVideoPipeline` con prompt textual.
- Control de resolución y número de fotogramas en inferencia (entrenado a 320×320 y 25 fotogramas).
- Integración con diffusers mediante `load_lora_weights` / `unload_lora_weights` sobre el modelo base.
- Soporte de semilla determinista para reproducibilidad de renders.
- No soporta tool calling, agentes ni razonamiento multi-paso: es un modelo generativo de vídeo, no un LLM.
- Capacidades multilingües limitadas al inglés en el prompt textual.

## Casos de uso

- Creación de GIFs animados para redes sociales y webs: el modelo convierte una foto estática en un bucle de 2 segundos con movimiento sutil, ideal para avatares, banners y contenido de marketing que requiere animación discreta sin cámara en movimiento.
- Fondos animados para presentaciones y vídeo corporativo: a partir de una imagen de marca se genera un bucle continuo que puede reproducirse en bucle indefinido sin corte visible, gracias a la coincidencia de primer y último fotograma.
- Prototipado rápido de cinemagraphs para publicidad: permite iterar sobre una imagen fija con distintos prompts de movimiento sutil ("seamless loop gif, subtle motion") sin rodaje ni postproducción.
- Animación de retratos y fotografía de producto: el LoRA mantiene la cámara estática y añade micro-movimiento (parpadeo, respiración, brillo), adecuado para fichas de producto o retratos corporativos animados.
- Generación de assets para videojuegos y apps: bucles cortos de 25 fotogramas a 12,5 fps que pueden incrustarse como texturas animadas o elementos de interfaz en bucle continuo.
- Investigación en generación de vídeo: el adaptador sirve como caso de estudio reproducible de entrenamiento LoRA con latentes precalculados y text encoder ausente, útil para experimentar con estilos de movimiento alternativos sobre el mismo dataset.
- Educación y demos técnicas: permite mostrar en un taller cómo un LoRA de rango 16 y 40,3 M de parámetros modifica el comportamiento temporal de un modelo de 5.000 M sin reentrenar el base.

## Benchmarks y rendimiento

El autor publica métricas de cierre de bucle (loop closure) medidas sobre la salida generada, comparando primer y último fotograma de cada render de 25 fotogramas, con 3 imágenes de test held-out por checkpoint. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible, ya que no aplican a un modelo de generación de vídeo.

| Checkpoint | Loop SSIM ↑ | Loop MAE ↓ | Motion MAE |
|---|---|---|---|
| 250 | 0,7915 | 0,0394 | 0,0052 |
| 500 | 0,8753 | 0,0244 | 0,0029 |
| 750 | 0,8754 | 0,0243 | 0,0029 |
| 1000 | 0,8738 | 0,0245 | 0,0030 |

El mejor resultado individual es `checkpoint-500/renders/test1.mp4`, con loop SSIM 0,9455, MAE 0,0204, `changed_frac` 0,0455 y motion 0,0021. El peor es `checkpoint-250/renders/test0.mp4`, con loop SSIM 0,616, MAE 0,0626 y `changed_frac` 0,2313 (un 23 % de píxeles distintos entre primer y último fotograma, artefacto de subentrenamiento). El cierre de bucle se estabiliza a los 500 pasos: de 500 a 1000 pasos la SSIM media varía −0,0015, por lo que los últimos 500 pasos no aportan mejora.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita para inferencia; el entrenamiento tuvo un pico de 15,9 GB en una L40S de 48 GB.
- GPU recomendadas: L40S (usada en entrenamiento); previsiblemente A100, H100 y RTX 4090 por encima de 16 GB de VRAM, aunque el autor no publica cifras de inferencia.
- Cabe en GPU de consumo: probable en RTX 4090 (24 GB) y RTX 3090 (24 GB) si el pico de inferencia se mantiene por debajo del de entrenamiento; no confirmado para GPUs de 16 GB.
- Opciones de despliegue: diffusers (`WanImageToVideoPipeline` + `load_lora_weights`), con `AutoencoderKLWan`, `UMT5EncoderModel`, `UniPCMultistepScheduler` y `WanTransformer3DModel`. No se documentan opciones para vLLM, llama.cpp, Ollama ni TGI (no aplican a un modelo de difusión de vídeo).
- Latencia y throughput: no disponibles para inferencia; en entrenamiento, 0,47–0,50 s/paso con batch size 1 y 1.000 pasos en 568 s.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto / fotogramas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| hmb/wan22-ti2v-5b-cinemagraph-lora | LoRA image-to-video | 40,3 M (base 5.000 M) | 25 fotogramas, 320×320 | Apache 2.0 | Hugging Face |
| Wan-AI/Wan2.2-TI2V-5B-Diffusers | Modelo base image-to-video | 5.000 M | no disponible en la información | no disponible en la información | Hugging Face |
| Otros LoRA de bucle sobre Wan2.2 | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks comparativos con otros adaptadores de bucle ni con modelos image-to-video alternativos en la información proporcionada.

## Limitaciones y advertencias

- Presupuesto temporal fijo: el adaptador está entrenado para 25 fotogramas que equivalen a 2 segundos a 12,5 fps. Escribir el vídeo a 24 fps reproduciría el bucle en ~1 s y rompería la coherencia con el entrenamiento.
- Resolución de entrenamiento limitada a 320×320; no se documenta comportamiento a resoluciones superiores.
- Movimiento muy restringido: está diseñado para cinemagraphs sutiles con cámara estática, no para escenas con movimiento amplio o cámara en movimiento.
- Idioma del prompt limitado al inglés; el text encoder UMT5-XXL no se ha validado para otros idiomas en este adaptador.
- Riesgo de bucles imperfectos en imágenes fuera de la distribución de entrenamiento: el peor caso documentado alcanza `changed_frac` de 0,2313 (23 % de píxeles distintos entre primer y último fotograma).
- Dataset de entrenamiento pequeño (150 clips) derivado de OpenVid-1M, con posible sesgo hacia los estilos y contenidos presentes en ese corpus.
- El checkpoint recomendado es el 500; los checkpoints 750 y 1000 no aportan mejora y el 250 está subentrenado.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base Wan2.2-TI2V-5B tiene su propia licencia que debe verificarse por separado.
- No aplica a tareas de razonamiento, código o texto: es exclusivamente un generador de vídeo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hmb/wan22-ti2v-5b-cinemagraph-lora
- Modelo base: https://huggingface.co/Wan-AI/Wan2.2-TI2V-5B-Diffusers
- Dataset de entrenamiento: https://huggingface.co/datasets/hmb/openvid-loop-gifs
- Paper de Wan 2.2: https://arxiv.org/abs/2503.20314
- Paper de OpenVid-1M: https://arxiv.org/abs/2407.02371
- ML Intern (herramienta citada en la model card): https://hf.co/chat?mode=ml-intern
