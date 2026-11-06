# Marcellus-Zhao/TTT2Reel-Wan2.2-TI2V-5B

## Resumen

TTT2Reel-Wan2.2-TI2V-5B es un adaptador de generación de vídeo largo construido sobre el modelo base Wan-AI/Wan2.2-TI2V-5B, desarrollado por el usuario Marcellus-Zhao. Se distribuye como un backbone DiT de aproximadamente 5.000 millones de parámetros (4.999.787.712 exactos según los safetensors) junto con un LoRA de rango 128 denominado φ₀, meta-entrenado mediante FOMAML (First-Order MAML) para habilitar test-time training (TTT) durante la inferencia. El objetivo es superar la limitación de ventana temporal de los modelos de vídeo generativo, permitiendo producir clips largos mediante chunking con anclaje de latentes entre fragmentos.

La propuesta técnica es interesante porque no se limita a un fine-tuning convencional: el LoRA φ₀ está diseñado para ejecutar pasos de gradiente internos en tiempo de inferencia sobre cada chunk de vídeo, de modo que el modelo "memorice" el contexto previo y mantenga coherencia temporal a lo largo de la generación. Esto convierte al modelo en un sistema de generación de vídeo con adaptación online, algo poco habitual en el ecosistema diffusers.

El modelo se publica bajo licencia Apache-2.0, con pesos en safetensors y pipeline text-to-video (etiquetado como ti2v), y depende de componentes externos del modelo base (encoder de texto T5 UMT5-XXL y VAE Wan2.2) que no se rehostean en este repositorio. Su relevancia actual radica en explorar TTT aplicado a difusión de vídeo, un área emergente para generación de contenido de larga duración con coherencia espacio-temporal.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DiT (Diffusion Transformer) sobre Wan2.2-TI2V-5B, con LoRA φ₀ de rango 128 meta-entrenado (FOMAML) |
| Parametros totales | 4.999.787.712 (backbone DiT); LoRA φ₀ adicional de 645 MB en bf16 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible como contexto de texto; ventana de generación por chunk de 133 frames a 24 fps, con anclaje de 3 frames latentes previos más primer frame como sink |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (3 shards del DiT + index.json + LoRA en safetensors) |

## Arquitectura y entrenamiento

El backbone es el DiT de Wan2.2-TI2V-5B, un transformer de difusión para generación de vídeo texto-a-vídeo (y texto+imagen-a-vídeo, según el tag ti2v). Sobre él se añade φ₀, un LoRA de rango 128 con alpha 128 (scaling 1.0) e inicialización cero en B, aplicado a las proyecciones q, k, v, o, ffn.0 y ffn.2 de los 30 bloques del DiT, sumando 600 tensores. El LoRA se meta-entrena con FOMAML con gradientes internos desacoplados (inner grads detached), sobre 16k clips de UltraVideo-Long en una época.

El entrenamiento usa chunking de 133 frames a 24 fps y resolución 720×1280. La ruta de anclaje es "fused": los últimos 3 frames latentes del chunk anterior más el primer frame del vídeo como sink se escriben en los latentes iniciales del nuevo chunk y se marcan como limpios. El bucle interno usa AdamW con lr 1e-5, 2 pasos de gradiente por chunk y max_inner_grad_norm=1, manteniendo el texto en modo memorize. El bucle externo usa AdamW lr 1e-5. Se emplea reciclado de error con ratios noise/latent/y/clean de 0.01/0.9/0.9/0.5, buffer k=300, 50 grids y warmup de 20 pasos. φ₀ está ligado a esta geometría concreta (k=3 + sink, 720×1280, 24 fps, 133 frames por chunk).

## Capacidades

- Generación de vídeo texto-a-vídeo (pipeline text-to-video) y, por herencia del modelo base TI2V, texto+imagen-a-vídeo.
- Generación de vídeo largo mediante chunking con test-time training: el LoRA φ₀ ejecuta pasos de gradiente en inferencia para mantener coherencia entre fragmentos.
- Anclaje temporal entre chunks mediante los últimos 3 frames latentes y un frame sink inicial.
- Resolución de 720×1280 a 24 fps.
- Integración con el ecosistema diffusers mediante un fork de DiffSynth-Studio (WanVideoPipeline).
- Carga del LoRA con `pipe.load_lora(..., alpha=1.0)`.
- No se documentan capacidades de tool calling, agentes, audio ni vision más allá del condicionamiento texto/imagen del modelo base.
- Capacidades multilingües: no disponibles (no se especifican idiomas).

## Casos de uso

- Generación de vídeo de larga duración con coherencia temporal: usar el chunking de 133 frames y el anclaje fused para producir secuencias de varios minutos manteniendo continuidad de escena, aprovechando el TTT del LoRA φ₀.
- Prototipado de investigación en test-time training para difusión: el repositorio permite reproducir el pipeline con los flags exactos de entrenamiento (`--ttt_steps_per_chunk 1`, `--num_gradient_steps 2`, etc.) para estudiar adaptación online en modelos de vídeo.
- Creación de contenido audiovisual a 720×1280 y 24 fps: adecuado para clips promocionales o demos que requieran resolución HD y cadencia cinematográfica.
- Animación a partir de una imagen inicial: gracias al pipeline ti2v heredado, se puede condicionar la generación con un primer frame como sink.
- Benchmarking de métodos de memoria temporal en vídeo generativo: comparar el anclaje de 3 frames latentes frente a otras estrategias de continuidad.
- Experimentación con LoRAs de rango alto (128) en DiT de ~5B: el φ₀ sirve como referencia para estudiar meta-aprendizaje sobre adaptadores de difusión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el repo ocupa 20,6 GB en safetensors, por lo que se requiere al menos esa cantidad de memoria para cargar el DiT en bf16, más el encoder T5 UMT5-XXL y el VAE externos.
- GPU recomendadas: no disponibles en la información proporcionada; por el tamaño del DiT (~5B en bf16) y la resolución 720×1280 con 133 frames por chunk, se requiere hardware de gama alta, aunque no se especifican modelos concretos.
- ¿Cabe en consumer GPU? No disponible; el tamaño de pesos y la geometría de generación sugieren que no es viable en GPUs de consumo típicas, pero no hay datos confirmados.
- Opciones de despliegue: DiffSynth-Studio (fork) mediante `WanVideoPipeline`; no se documentan vLLM, llama.cpp, Ollama ni TGI (no aplicables a difusión de vídeo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto/ventana | Licencia | Disponibilidad |
|---|---|---|---|---|
| TTT2Reel-Wan2.2-TI2V-5B | ~5B (DiT) + LoRA r128 | 133 frames/chunk a 24 fps, 720×1280 | Apache-2.0 | Hugging Face (12 descargas) |
| Wan-AI/Wan2.2-TI2V-5B (base) | ~5B | no disponible | Apache-2.0 | Hugging Face |
| Otros modelos de vídeo de tamaño similar | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- El LoRA φ₀ está fuertemente ligado a la geometría de entrenamiento (k=3 + sink, 720×1280, 24 fps, 133 frames por chunk); usarlo con otros parámetros puede degradar la coherencia.
- Requiere componentes externos no rehosteados (T5 UMT5-XXL y VAE Wan2.2) que deben descargarse del repo base y colocarse junto a los shards.
- Depende de un fork de DiffSynth-Studio, no del pipeline estándar de diffusers, lo que puede complicar la integración en producción.
- Solo 12 descargas y 0 likes en el momento de la ficha: ecosistema y validación comunitaria muy limitados.
- No se documentan idiomas soportados ni evaluación de sesgos.
- Riesgo de alucinación visual y de degradación de coherencia en secuencias muy largas no cuantificado.
- Aunque la licencia es Apache-2.0, conviene verificar las condiciones del modelo base Wan2.2 y de los datasets de entrenamiento (UltraVideo-Long) para uso comercial.
- No hay benchmarks publicados que permitan avalar el rendimiento frente a alternativas.

## Enlaces

- Hugging Face: https://huggingface.co/Marcellus-Zhao/TTT2Reel-Wan2.2-TI2V-5B
- Modelo base: https://huggingface.co/Wan-AI/Wan2.2-TI2V-5B
- DiffSynth-Studio (fork referenciado en la model card): no disponible como enlace directo en la información proporcionada
- Paper, blog o demo: no disponibles en la información proporcionada
