# lodestones/chroma-h3

## Resumen

Chroma-h3 es un ajuste fino (fine-tune) de generación de imágenes ("stills") sobre MiniMax-H3, el modelo de difusión de vídeo de MiniMaxAI. Su creador, el usuario lodestones, ha tomado el DiT (Diffusion Transformer) de H3 y lo ha ejecutado con una única trama latente, entrenándolo sobre pares texto-imagen para convertir un modelo pensado originalmente para vídeo en un generador de imágenes fijas. El problema que resuelve es doble: aprovechar la arquitectura de vídeo de H3 para imágenes de alta calidad y, al mismo tiempo, mantener la compatibilidad total con el pipeline base, de modo que el mismo modelo sirva tanto para imágenes como para vídeo.

El repositorio se distribuye en dos formatos: la versión "root", que es el pipeline completo de H3 en diffusers con el fine-tune ya fusionado en el transformer en bf16 (33,12 mil millones de parámetros en safetensors, 152,4 GB de tamaño de repo), y dos LoRA: una con el fine-tune puro (fp32, rank 256) y otra experimental de pocos pasos (few-step) destilada con DMD, que permite muestrear en 4 u 8 pasos con CFG 1. Requiere el codificador de texto Qwen3-VL y los VAE de vídeo/audio del modelo base, que permanecen sin cambios. Es relevante porque demuestra un flujo de trabajo eficiente de transferencia vídeo→imagen mediante LoRA sobre los FFN del transformer, sin tocar atención ni embeddings.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DiT (Diffusion Transformer) de vídeo (MiniMax-H3) usado con una única trama latente |
| Parametros totales | 33.122.992.896 (según safetensors del repo) |
| Parametros activos | no disponible (no consta que sea MoE; el fine-tune es un LoRA sobre el transformer completo) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bf16 (versión fusionada), fp32 (LoRAs) |
| Idiomas soportados | no disponible (el codificador de texto es Qwen3-VL; idiomas concretos no especificados) |
| Licencia | minimax-h3-community-license-agreement (other) |
| Formato de pesos | safetensors (diffusers) |

## Arquitectura y entrenamiento

El modelo base es el DiT de MiniMax-H3, un transformer de difusión orientado a vídeo que incluye un token-refiner y VAEs de vídeo y audio. Chroma-h3 lo reutiliza en modo imagen: se genera una única trama latente a aproximadamente 1 megapíxel, y la porción de AdaLN correspondiente al audio se omite durante el entrenamiento (el modelo fusionado la conserva intacta). El fine-tune se implementó como un LoRA de rank 256 y alpha 256 aplicado exclusivamente a las capas lineales feed-forward de todos los bloques del transformer y de los bloques del token-refiner; la atención, AdaLN y los embeddings permanecen congelados. El regex de objetivos es `(transformer_blocks|token_refiner\.refiner_blocks)\.\d+\.ff\.net\.(0\.proj|2)`.

El entrenamiento consistió en 13.605 actualizaciones con un batch global de 48 imágenes (una pasada completa sobre el dataset), con learning rate 0,0001 y flow matching con timestep shift 3,0. Se usaron buckets de relación de aspecto en torno a 1024² y un dropout de prompt vacío del 10%. Los captions mezclan de forma equilibrada etiquetas estilo booru, resúmenes cortos y estilo Midjourney, captions largos y scene graphs. Adicionalmente, existe una versión experimental de pocos pasos: una LoRA de rank 384 (FFN de bloques), 128 (atención de bloques, solo student) y 256 (FFN del token-refiner) que contiene el fine-tune más un student destilado mediante DMD (data-space) a CFG 3, entrenado 8.700 de 12.000 pasos. Esta versión permite muestrear con Euler plano a CFG 1 en 4 u 8 pasos, y aunque se entrenó solo con imágenes, transfiere a vídeo con movimiento coherente.

## Capacidades

- Generacion de texto a imagen (imágenes fijas de ~1 MP) a partir de prompts de texto, aprovechando el codificador multimodal Qwen3-VL.
- Compatibilidad con generación de vídeo: al derivar del pipeline completo de H3, la LoRA few-step transfiere a vídeo con 4 u 8 pasos y movimiento coherente.
- Dos modos de inferencia: muestreo de calidad con CFG ~3 y ~30 pasos Euler (shift 3), o muestreo rápido few-step con CFG 1 y 4/8 pasos mediante la LoRA DMD.
- Uso flexible como modelo fusionado o como LoRA sobre el transformer base de H3.
- Entrenamiento con captions heterogéneos (booru tags, captions largos, scene graphs), lo que debería dar tolerancia a distintos estilos de prompt.
- No hay soporte de tool calling, agentes ni razonamiento: es un modelo de difusión, no un LLM.

## Casos de uso

- Generacion de ilustraciones a partir de texto: el modelo produce imágenes de ~1 MP con CFG ~3 y 30 pasos, adecuado para arte conceptual y assets visuales.
- Prototipado rapido de imagenes: la LoRA few-step (DMD) genera en 4 u 8 pasos con CFG 1, ideal para explorar composiciones antes de un pase de calidad.
- Generacion hibrida imagen-video: al compartir el pipeline de H3, se puede alternar entre stills y vídeo en la misma infraestructura, con la LoRA few-step transfiriendo a vídeo.
- Integracion en diffusers: el pipeline `MiniMaxH3ModularPipeline` permite incorporar el modelo en aplicaciones Python existentes basadas en la librería diffusers.
- Ajuste fino adicional: la disponibilidad del LoRA separado (rank 256 sobre los FFN) sirve como punto de partida para community fine-tunes sobre el mismo base.
- Investigacion en destilacion de difusion: el componente DMD (student a CFG 3, Euler plano) es un caso de estudio práctico de destilación de pocos pasos sobre DiT de vídeo.
- Estilizacion con captions tipo booru: el mix de captions de entrenamiento lo hace adecuado para flujos de trabajo con etiquetado por tags habitual en comunidades de generación de imágenes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: con 33,12 mil millones de parámetros en bf16 solo para el transformer, se necesitan más de 62 GB solo para los pesos; a esto hay que sumar el codificador de texto Qwen3-VL y los VAEs de vídeo/audio. Una estimación realista de inferencia es de 80 GB o más, no disponible con precisión en la documentación.
- GPU recomendadas: A100 u H100 de 80 GB, o equivalentes con suficiente VRAM. No cabe en GPUs de consumo estándar (RTX 4090 de 24 GB es insuficiente para el modelo fusionado completo).
- Opciones de despliegue: librería diffusers (pipeline `MiniMaxH3ModularPipeline`). No consta soporte específico para llama.cpp, Ollama, vLLM o TGI, que son herramientas para LLMs y no aplican directamente a un pipeline de difusión.
- Latencia y throughput: con la LoRA few-step se consiguen 4 u 8 pasos de muestreo; con el modelo fusionado, ~30 pasos Euler a shift 3. Tiempos concretos no disponibles.
- Offloading: dado el tamaño del repo (152,4 GB), probablemente sea necesario cargar componentes secuencialmente o usar offloading a CPU/disco; no hay instrucciones publicadas al respecto.

## Comparativa con modelos similares

| Modelo | Parametros | Modalidad | Cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| chroma-h3 (este) | 33,12 B (transformer, bf16) | Texto a imagen (y vídeo vía base H3) | bf16 / fp32 (LoRA) | minimax-h3-community-license-agreement | Fine-tune LoRA de vídeo a imagen, opción few-step DMD |
| MiniMaxAI/MiniMax-H3 (base) | no disponible | Texto a vídeo e imagen | no disponible | minimax-h3-community-license-agreement | Modelo base del que deriva; pipeline completo sin modificar |
| FLUX.1-dev | 12 B | Texto a imagen | bf16 | Licencia no comercial (Black Forest Labs) | DiT de referencia en texto a imagen, sin modo vídeo |
| Stable Diffusion 3.5 Large | 8 B | Texto a imagen | bf16 | Stability AI Community License | DiT con MMDiT, más ligero y accesible en consumer GPUs |

Comparativa orientativa por categoría (DiT de texto a imagen); los datos de los modelos alternativos corresponden a conocimiento general y no a la información proporcionada en esta ficha.

## Limitaciones y advertencias

- La LoRA few-step es experimental: el student DMD está entrenado solo hasta el paso 8.700 de 12.000, por lo que su calidad puede no ser definitiva.
- La LoRA few-step debe aplicarse sobre el transformer base de MiniMax-H3, no sobre el modelo fusionado de este repo; aplicarlas juntas duplicaría el fine-tune.
- El modelo fusionado ya no está destilado de guidance: requiere CFG ~3 con negative prompt vacío y ~30 pasos, lo que aumenta el coste de inferencia frente a modelos guidance-distilled.
- La generación de imágenes está limitada a ~1 MP con buckets de relación de aspecto en torno a 1024²; resoluciones muy distintas no están cubiertas por el entrenamiento.
- El fine-tune se entrenó solo con imágenes; su comportamiento en vídeo no está garantizado salvo por la transferencia observada de la LoRA few-step.
- Sesgos: el dataset no está documentado públicamente en detalle, pero el uso de booru tags sugiere datos de origen comunitario con los sesgos típicos de esas colecciones.
- Riesgo de alucinación visual y falta de fidelidad factual propia de modelos de difusión; no hay evaluaciones publicadas.
- Licencia: minimax-h3-community-license-agreement, una licencia "other" cuyo texto debe revisarse antes de cualquier uso comercial; no se puede asumir permisividad sin leer el acuerdo.
- Descargas y adopción muy bajas en el momento de la ficha (0 descargas, 2 likes), por lo que hay poca validación comunitaria y soporte limitado.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/lodestones/chroma-h3
- Modelo base: https://huggingface.co/MiniMaxAI/MiniMax-H3
- Licencia: enlace LICENSE en el repositorio (minimax-h3-community-license-agreement)
