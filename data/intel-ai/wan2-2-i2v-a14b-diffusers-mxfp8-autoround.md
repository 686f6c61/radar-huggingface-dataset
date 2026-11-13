# intel-ai/Wan2.2-I2V-A14B-Diffusers-MXFP8-AutoRound

## Resumen

Wan2.2-I2V-A14B-Diffusers-MXFP8-AutoRound es una versión cuantizada en MXFP8 (W8A8) del modelo de generación de vídeo a partir de imagen Wan2.2-I2V-A14B-Diffusers, desarrollado originalmente por Wan-AI y cuantizado por Intel AI mediante la herramienta AutoRound. El modelo resuelve la tarea de image-to-video (I2V): a partir de una imagen estática y un prompt textual, genera una secuencia de vídeo coherente con ambos.

La arquitectura es un modelo de difusión con dos expertos de transformer (denominados `transformer` y `transformer_2`), lo que da un total de 14.727.992.384 parámetros. La cuantización MXFP8 aplica pesos y activaciones en FP8 con formato de microscaling OCP, grupo de tamaño 32 y cuantización dinámica de activaciones, lo que reduce el uso de memoria y acelera la inferencia en hardware compatible (por ejemplo, NVIDIA B200) manteniendo una fidelidad muy alta respecto al modelo BF16 original.

Su relevancia actual radica en que permite desplegar un modelo de vídeo de 14,7 mil millones de parámetros con pérdida de calidad prácticamente despreciable (una variación media absoluta relativa del 0,105 % en las métricas VBench evaluadas) y con licencia Apache 2.0, lo que facilita su uso comercial e investigación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Difusión con doble experto transformer (dual diffusion transformer experts: `transformer` y `transformer_2`) |
| Parametros totales | 14.727.992.384 |
| Parametros activos | no disponible (no es MoE en el sentido de mezcla de expertos por token; son dos expertos de difusión) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | MXFP8 W8A8 (pesos y activaciones FP8 con microscaling OCP, grupo de 32, cuantización dinámica de activaciones) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (checkpoint Diffusers, librería `diffusers`) |

## Arquitectura y entrenamiento

El modelo es una cuantización del checkpoint original Wan2.2-I2V-A14B-Diffusers, que emplea una arquitectura de difusión con dos expertos transformer. La cuantización se ha realizado con Intel AutoRound, que produce un formato MXFP8 (W8A8): pesos y activaciones en FP8 con microscaling OCP, grupo de tamaño 32 y cuantización dinámica de activaciones. No se cuantizan el text encoder (UMT5), el VAE ni determinadas capas del transformer, y el tokenizador y el scheduler permanecen sin cambios.

No se dispone en la información proporcionada de detalles sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF/DPO, ya que esta ficha describe una versión cuantizada de un modelo base. La innovación técnica destacable es la propia cuantización MXFP8 con AutoRound, que permite ejecutar el modelo con GEMMs CUTLASS MXFP8 de FlashInfer y un cuantizador de activaciones en CuTe DSL, manteniendo una fidelidad muy alta respecto a BF16.

## Capacidades

- Generación de vídeo a partir de imagen (image-to-video): produce secuencias de vídeo coherentes con la imagen de entrada y el prompt textual.
- Control fino de generación mediante prompts positivos y negativos, número de fotogramas, fps, pasos de inferencia, guidance scale, boundary ratio y flow shift.
- Soporte de resolución variable: deriva las dimensiones del vídeo a partir de la relación de aspecto de la imagen de entrada (con `max_area` y redondeo a múltiplos de 16), o permite fijar anchura y altura.
- Generación de 81 fotogramas a 16 fps en la configuración de ejemplo.
- Compatibilidad con el pipeline `WanImageToVideoPipeline` de Diffusers.
- Ejecución optimizada en vLLM-Omni con atención TRTLLM_ATTN y GEMMs MXFP8.
- No se dispone de información sobre tool calling, agentes, razonamiento multi-paso ni capacidades multilingües.

## Casos de uso

- Generación de vídeo publicitario a partir de una imagen de producto: el modelo anima una fotografía estática de un producto con un prompt descriptivo, adecuado para crear clips promocionales de 81 fotogramas a 16 fps sin rodaje.
- Creación de contenido para redes sociales: a partir de una imagen de marca o un personaje, se generan vídeos cortos con control de prompt negativo para evitar artefactos como desenfoque, sobreexposición o deformaciones.
- Prototipado rápido en estudios de animación: el modelo permite convertir storyboards o ilustraciones en secuencias animadas preliminares, con control de pasos de inferencia y guidance para ajustar el estilo.
- Pruebas de concepto en investigación de difusión: la versión MXFP8 permite evaluar el modelo en hardware con soporte FP8 (por ejemplo, NVIDIA B200) reduciendo el coste de memoria frente a BF16.
- Despliegue en producción con vLLM-Omni: la integración con el ejemplo oficial de vLLM-Omni y el backend TRTLLM_ATTN facilita pipelines de inferencia de vídeo a escala.
- Generación de vídeo educativo o divulgativo: a partir de una ilustración o diagrama, se puede animar con un prompt que describa el movimiento deseado, útil para material didáctico.
- Evaluación comparativa de cuantizaciones: sirve como referencia para medir la pérdida de calidad de MXFP8 frente a BF16 en tareas de generación de vídeo, con métricas VBench reproducibles.

## Benchmarks y rendimiento

Resultados de VBench 0.1.5 sobre 355 pares prompt/imagen (subconjuntos `i2v_subject` con 246 pares e `i2v_background` con 109 pares), comparando BF16 y MXFP8. Las puntuaciones son fracciones; mayor es mejor. La recuperación es MXFP8 dividido por BF16.

| Métrica | Vídeos por modelo | BF16 | MXFP8 | Recuperación |
|---|---:|---:|---:|---:|
| i2v_subject | 246 | 0.977584 | 0.975640 | 99,80 % |
| i2v_background | 109 | 0.991074 | 0.989965 | 99,89 % |
| subject_consistency | 246 | 0.952603 | 0.951910 | 99,93 % |
| background_consistency | 109 | 0.969536 | 0.968830 | 99,93 % |
| motion_smoothness | 246 | 0.984598 | 0.985272 | 100,07 % |

La media aritmética del cambio relativo absoluto equitativamente ponderado entre estas cinco métricas es del 0,105 %, calculada como la media de `abs(MXFP8 - BF16) / BF16` con puntuaciones sin redondear. Se trata de un resumen descriptivo, no de una puntuación agregada oficial de VBench. Es una evaluación de subconjunto con un vídeo por par, no el protocolo completo de cinco muestras de VBench; no se reporta puntuación total de VBench.

Configuración de generación: resolución 832 × 480, 81 fotogramas, 16 fps, 40 pasos de inferencia, guidance scales 3,5/3,5 en ambos expertos, semilla 0 reiniciada por par, boundary ratio 0,9, flow shift 3,0, prompt negativo oficial de Wan, redimensionado LANCZOS de la imagen de entrada, ejecución eager sin caché, sin offload de CPU y sin tiling/slicing del VAE.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el repositorio ocupa 85,7 GB y el modelo tiene 14,7 mil millones de parámetros en MXFP8, lo que reduce el requisito frente a BF16, pero no se proporciona una cifra de VRAM concreta.
- GPU recomendadas: la evaluación oficial se realizó en NVIDIA B200 con soporte de MXFP8, FlashInfer CUTLASS MXFP8 GEMMs y TRTLLM_ATTN.
- ¿Cabe en GPU consumer? No se dispone de información que confirme compatibilidad con GPU de consumo; el entorno evaluado es de centro de datos (B200).
- Opciones de despliegue: vLLM-Omni (commit oficial 7465c0f52), Diffusers 0.40.0 con `WanImageToVideoPipeline`, FlashInfer 0.7.2.post1, NVIDIA CUTLASS DSL 4.8.0, CUDA toolkit 12.8.93, PyTorch 2.14.0, Python 3.12.3.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Wan2.2-I2V-A14B-Diffusers-MXFP8-AutoRound (este) | 14.727.992.384 | no disponible | MXFP8 W8A8 | Apache 2.0 | Hugging Face (intel-ai) |
| Wan2.2-I2V-A14B-Diffusers (base) | no disponible en la información | no disponible | BF16 (original) | Apache 2.0 | Hugging Face (Wan-AI) |
| Otros modelos de image-to-video | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre otros modelos comparables de la misma categoría en la documentación proporcionada.

## Limitaciones y advertencias

- La cuantización MXFP8 requiere hardware y software compatibles (por ejemplo, NVIDIA B200 con FlashInfer CUTLASS MXFP8 GEMMs y CuTe DSL); no funcionará en GPUs sin soporte FP8.
- Es imprescindible mantener sin cambios los metadatos de cuantización exportados por AutoRound; alterarlos puede degradar o romper la inferencia.
- El text encoder (UMT5), el VAE y ciertas capas del transformer no están cuantizados, por lo que el ahorro de memoria es parcial.
- No se han publicado datos sobre sesgos, riesgo de alucinación visual o limitaciones idiomáticas en la información disponible.
- La evaluación VBench es un subconjunto de un vídeo por par y no el protocolo oficial completo; los resultados pueden no ser directamente comparables con puntuaciones VBench publicadas de otros modelos.
- La licencia Apache 2.0 permite uso comercial, pero se debe seguir la licencia del modelo original Wan2.2-I2V-A14B-Diffusers.
- El prompt negativo de ejemplo está en chino; no se dispone de información sobre el rendimiento multilingüe del modelo.

## Enlaces

- Hugging Face: https://huggingface.co/intel-ai/Wan2.2-I2V-A14B-Diffusers-MXFP8-AutoRound
- Modelo base: https://huggingface.co/Wan-AI/Wan2.2-I2V-A14B-Diffusers
- Repositorio AutoRound: https://github.com/intel/auto-round
- vLLM-Omni (commit oficial): https://github.com/vllm-project/vllm-omni/tree/7465c0f52bcb46a55f62c1b8613846cda30d0083
- Imagen de entrada de ejemplo: https://huggingface.co/datasets/YiYiXu/testing-images/resolve/main/wan_i2v_input.JPG
- Paper de referencia (arXiv:2309.05516): https://arxiv.org/abs/2309.05516
