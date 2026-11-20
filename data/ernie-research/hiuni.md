# ernie-research/HiUni

## Resumen

HiUni es un modelo multimodal unificado desarrollado por ernie-research que parte de Qwen3-VL-4B-Instruct y extiende sus capacidades para cubrir cuatro tareas en un único checkpoint: comprensión de imágenes, generación de imagen a partir de texto, edición de imágenes y chat de texto. La propuesta central es armonizar entendimiento y generación en un espacio visual compartido, de modo que un ViT alineado con el lenguaje y un backbone Transformer denso sirvan a las cuatro capacidades sin duplicar el modelo.

La arquitectura suma unos 5.400 millones de parámetros totales: 4B en el backbone compartido heredado de Qwen3-VL y 0,9B en módulos específicos de generación, con una Pixel Diffusion Head que opera directamente en espacio de píxeles RGB y un mecanismo denominado HiGate para preservar detalle fino. La resolución máxima de generación es de 2048 x 2048 y el dtype recomendado es bfloat16.

Es relevante porque demuestra que un modelo de 4B puede mantener la calidad de comprensión de su inicialización (75,56 de media frente a 75,61 de Qwen3-VL-4B-Instruct en siete benchmarks) mientras añade generación y edición de alta resolución. El modelo está pensado para investigación y se distribuye con código de modelado personalizado, lo que exige `trust_remote_code=True` al cargarlo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ViT alineado con lenguaje + Transformer denso + Pixel Diffusion Head |
| Parametros totales | 5.398.665.281 (4B backbone compartido + 0,9B modulos de generacion) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (dtype recomendado: bfloat16) |
| Idiomas soportados | en, zh |
| Licencia | no disponible |
| Formato de pesos | safetensors (6 shards) |

## Arquitectura y entrenamiento

HiUni se inicializa desde Qwen3-VL-4B-Instruct y conserva un backbone Transformer denso de 4B parámetros junto con un ViT alineado con el lenguaje. Sobre esa base añade unos 0,9B parámetros específicos de generación, concentrados en la salida mediante una Pixel Diffusion Head que genera directamente en espacio de píxeles RGB, con soporte de hasta 2048 x 2048. El componente HiGate se encarga de preservar el detalle fino de píxeles. Un mismo checkpoint cubre las cuatro capacidades (comprensión, text-to-image, edición y chat de texto) dentro de un espacio visual compartido.

Los pesos publicados usan EMA con decay 0,95: la media móvil arranca desde el checkpoint de hot-start y se actualiza cada 50 pasos hasta el paso 8.000 de la ejecución final de SFT. El modelo card no detalla el volumen de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO. La inferencia recomendada usa `transformers==4.57.1`, `torch>=2.6` y `attn_implementation="sdpa"`, con parámetros de muestreo configurables (`num_steps`, `guidance_scale`, `shift`, `seed`).

## Capacidades

- Comprensión de imágenes: mantiene el rendimiento de Qwen3-VL-4B-Instruct en siete benchmarks de entendimiento (75,56 de media frente a 75,61).
- Generación text-to-image en espacio de píxeles RGB, con resolución de hasta 2048 x 2048.
- Edición de imágenes (image editing) con el mismo checkpoint.
- Renderizado de texto en imagen: puntuación LongText de 0,963 en chino y 0,954 en inglés.
- Chat de texto conversacional.
- Soporte multilingüe limitado a inglés y chino.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Modo thinking, visión o audio adicionales: no disponible en la información proporcionada.

## Casos de uso

- Generación de ilustraciones y assets visuales: el modelo produce imágenes de hasta 2048 x 2048 en un solo paso de inferencia con `generate_image`, adecuado para prototipado de contenido gráfico con control de semilla y escala de guía.
- Edición de imágenes en flujos de retoque: al compartir backbone con la comprensión, permite describir una edición en lenguaje natural y aplicarla sobre la imagen de entrada sin cambiar de modelo.
- Generación de carteles y material con texto: la puntuación LongText (0,963 ZH / 0,954 EN) lo hace útil para imágenes que requieren texto legible integrado.
- Investigación en modelos multimodales unificados: sirve como base para estudiar la armonización entre entendimiento y generación en un espacio visual compartido, con ablaciones publicadas en la página del proyecto.
- Asistentes visuales conversacionales: combinación de chat de texto y comprensión de imágenes para responder preguntas sobre contenido visual en inglés o chino.
- Pipelines de aumento de datos sintéticos: generación por lotes (batch inference documentada) de imágenes etiquetadas para entrenar otros modelos.
- Evaluación comparativa de edición: uso de las métricas ImgEdit y GEdit como referencia para comparar variantes o fine-tunes sobre la misma base.

## Benchmarks y rendimiento

| Benchmark | HiUni | Referencia (Qwen3-VL-4B-Instruct) |
|---|---|---|
| Media en 7 benchmarks de comprensión | 75,56 | 75,61 |
| Qwen-Image-Bench (overall) | 47,98 | no disponible |
| LongText ZH | 0,963 | no disponible |
| LongText EN | 0,954 | no disponible |
| ImgEdit | 3,66 | no disponible |
| GEdit CN | 6,70 | no disponible |
| GEdit EN | 6,81 | no disponible |

Las métricas GEdit se evaluaron con un juez GPT-5.2. La página del proyecto incluye tablas completas, comparativas y ablaciones.

## Requisitos de hardware

- VRAM estimada: con 5.398.665.281 parámetros en bfloat16, los pesos ocupan aproximadamente 10,8 GB; hay que sumar la memoria de activaciones y del decodificador de difusión, por lo que se recomienda un margen adicional.
- GPU recomendadas: A100 o H100 para generación a 2048 x 2048 y batch inference; GPU con 24 GB o más para uso individual en bfloat16.
- GPU de consumo: cabe en RTX 4090 (24 GB) en bfloat16 para resoluciones moderadas; en tarjetas de 16 GB o menos no hay datos publicados de cuantización que permitan confirmarlo.
- Despliegue: la guía oficial cubre inferencia con `transformers`, batch inference y sharding multi-GPU; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Capacidades | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| HiUni | 5,4B (4B compartidos + 0,9B generacion) | no disponible | Comprension, T2I, edicion, chat | no disponible | Hugging Face, codigo custom |
| Qwen3-VL-4B-Instruct | 4B | no disponible | Comprension y chat multimodal | no disponible en esta ficha | Hugging Face |
| Alternativas de generacion unificada de tamano similar | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación directa con modelos unificados de generación y comprensión de tamaño comparable no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Licencia no especificada: no se puede confirmar el uso comercial ni las condiciones de redistribución.
- El modelo card advierte de posibles imprecisiones, artefactos no deseados y contenido sesgado en las imágenes generadas o editadas.
- Solo soporta inglés y chino; no hay datos sobre otros idiomas.
- La longitud de contexto no está documentada, lo que dificulta planificar conversaciones largas o documentos extensos.
- Requiere `trust_remote_code=True` por el código de modelado personalizado; en producción conviene fijar una revisión y auditar el código.
- Está orientado a investigación; no se declaran garantías para uso público o de alto impacto.
- No hay información sobre tool calling, agentes ni cuantizaciones, lo que limita su integración en pipelines de producción estándar.
- El checkpoint publicado usa EMA con decay 0,95; variantes sin EMA no están documentadas.

## Enlaces

- Hugging Face: https://huggingface.co/ernie-research/HiUni
- Página del proyecto: https://ernie-research.github.io/HiUni/
- Repositorio GitHub: https://github.com/ernie-research/HiUni
- Guía de inferencia: https://github.com/ernie-research/HiUni/tree/main/hf_inference
- Paper (arXiv): https://arxiv.org/abs/2611.26107
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-4B-Instruct
- Proyecto Qwen3-VL: https://github.com/QwenLM/Qwen3-VL
