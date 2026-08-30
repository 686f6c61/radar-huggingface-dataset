# berryber09/10Eros-Max-h3-turbo-hybrid-beta4-w4a8

## Resumen

El modelo `berryber09/10Eros-Max-h3-turbo-hybrid-beta4-w4a8` es una cuantización W4A8 del checkpoint `10Eros_Max_h3_TURBO-hybrid_beta4` en formato bf16, publicado por el usuario berryber09 como experimento comunitario. El modelo base, `TenStrip/10Eros-Max`, es un fine-tune del modelo MiniMax-H3 orientado a generación de vídeo a partir de texto, diseñado para integrarse en ComfyUI mediante el cargador UNETLoader con soporte de convolución rotatoria (convrot).

La cuantización reduce el tamaño del modelo de aproximadamente 37,5 GB (bf16) a unos 11,68 GB, un 68,8 % menos, lo que permite ejecutarlo en tarjetas gráficas con 24 GB de VRAM con margen. El proceso de cuantización utiliza el layout `asym_w4a8_int8` con `group_size=16`, `convrot_groupsize=256`, codebook Lloyd-Max por tensor y escalas de grupo en fp8, siguiendo el esquema W4A8 de Kijai / comfy-kitchen. Se cuantizaron 200 capas lineales 2D (96 % de los bytes objetivo), manteniendo 334 capas en mayor precisión (normas, primera y última capa).

Este modelo es relevante para desarrolladores que trabajan con generación de vídeo en ComfyUI y necesitan reducir el consumo de memoria sin perder compatibilidad con el pipeline original. Al ser una cuantización, no introduce nuevas capacidades respecto al modelo base, pero facilita su despliegue en hardware más asequible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MiniMax-H3 (fine-tune de TenStrip/10Eros-Max) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | W4A8 asimétrico (`asym_w4a8_int8`, group_size=16, convrot_groupsize=256, codebook Lloyd-Max + escalas fp8) |
| Idiomas soportados | no disponible |
| Licencia | other (hereda la licencia del modelo fuente) |
| Formato de pesos | safetensors con layout W4A8 (compatible con comfy-kitchen) |

## Arquitectura y entrenamiento

El modelo base es un fine-tune de MiniMax-H3, una arquitectura de generación de vídeo desarrollada por MiniMax. No se dispone de detalles públicos sobre el número de parámetros, la longitud de contexto ni la composición del dataset de entrenamiento del fine-tune. La cuantización se realizó con la herramienta `comfyui-mixed-quantizer` usando el formato `w4a8`, `group-size 16` y modo codebook `fit`. El proceso mantiene las capas de normalización, la primera y la última capa en bf16 para preservar la estabilidad numérica, mientras que las capas lineales internas se cuantizan a 4 bits para pesos y 8 bits para activaciones. No se aplicó ningún proceso de fine-tuning posterior a la cuantización; es una conversión directa de pesos.

## Capacidades

- Generación de vídeo a partir de texto (pipeline text-to-video) mediante el modelo MiniMax-H3.
- Generación de imágenes estáticas coherentes, verificada por el autor en ComfyUI antes de la publicación.
- Integración nativa con ComfyUI a través de UNETLoader con soporte de convolución rotatoria (convrot).
- Compatibilidad con el ecosistema comfy-kitchen para layouts W4A8.
- Reducción significativa de memoria (68,8 % menos que el bf16) manteniendo la estructura del modelo original.
- No se documentan capacidades adicionales como tool calling, agentes o razonamiento multimodal.

## Casos de uso

- Generación de vídeo en equipos con GPU de 24 GB: el tamaño reducido permite ejecutar el modelo en tarjetas como RTX 3090 o RTX 4090 con margen de VRAM, algo inviable con el checkpoint bf16 completo.
- Prototipado rápido en ComfyUI: al cargar mediante UNETLoader, los desarrolladores pueden iterar sobre prompts y parámetros de generación sin necesidad de infraestructura de servidor dedicada.
- Experimentación con cuantización agresiva: sirve como referencia para evaluar el impacto de W4A8 en modelos de vídeo de la familia MiniMax-H3, especialmente en términos de calidad visual y coherencia temporal.
- Despliegue en entornos con restricciones de memoria: útil para estudios pequeños o investigadores individuales que no disponen de GPUs de alta gama (A100/H100) y necesitan ejecutar el modelo localmente.
- Integración en pipelines de postproducción: al ser compatible con ComfyUI, puede combinarse con nodos de upscaling, interpolación o edición para flujos de trabajo de vídeo creativo.
- Evaluación de calidad de cuantización: permite comparar la salida del modelo cuantizado frente al bf16 original para decidir si la pérdida de calidad es aceptable en un caso de uso concreto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor solo indica que el modelo genera una imagen coherente en ComfyUI como verificación funcional, pero no proporciona métricas objetivas de calidad (FVD, IS, CLIP score) ni comparativas con el modelo bf16.

## Requisitos de hardware

- VRAM estimada: el modelo ocupa ~11,68 GB en disco, por lo que se recomienda al menos 16 GB de VRAM para inferencia con margen; el autor indica que cabe en una GPU de 24 GB con headroom.
- GPU recomendadas: RTX 3090, RTX 4090, A5000, A6000 o superiores con CUDA SM ≥ 8.0 (Ampere o posterior).
- No se recomienda para GPUs con menos de 12 GB de VRAM, dado el tamaño del modelo y las activaciones intermedias.
- Opciones de despliegue: ComfyUI ≥ v0.31.0 con cargador W4A8 nativo o el parche `comfyui_w4a8_loader.patch`; requiere comfy-kitchen con `AsymW4A8Int8Layout` (PR #90).
- Latencia y throughput: no disponibles en la informacion publicada.

## Comparativa con modelos similares

| Modelo | Tamano | Formato | Requisitos de VRAM | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| 10Eros-Max-h3-turbo-hybrid-beta4-w4a8 (este) | ~11,68 GB | W4A8 cuantizado | 24 GB recomendado | other | HuggingFace |
| TenStrip/10Eros-Max (bf16) | ~37,5 GB | bf16 | 48 GB+ recomendado | other | HuggingFace |
| MiniMax-H3 (original) | no disponible | bf16 | no disponible | no disponible | GitHub / HuggingFace |

La comparativa se limita al modelo base y al modelo original de MiniMax, ya que no se dispone de otras cuantizaciones de la misma familia con datos públicos. La principal ventaja de la versión W4A8 es la reducción de memoria, a costa de una posible degradación de calidad no cuantificada.

## Limitaciones y advertencias

- Es un experimento comunitario, no un lanzamiento oficial de MiniMax ni de TenStrip; no hay garantías de soporte ni mantenimiento.
- La licencia es `other`, lo que implica restricciones desconocidas; se hereda del modelo fuente, por lo que es imprescindible revisar la licencia de `TenStrip/10Eros-Max` antes de cualquier uso comercial.
- No se han publicado evaluaciones de calidad objetivas; la pérdida de fidelidad visual o temporal debida a la cuantización W4A8 no está cuantificada.
- La cuantización afecta a 200 capas lineales, pero no se especifica el impacto en la coherencia temporal del vídeo generado, un aspecto crítico en modelos de vídeo.
- Requiere una versión específica de ComfyUI y de comfy-kitchen; la compatibilidad con versiones futuras no está garantizada.
- No se documentan sesgos ni alucinaciones específicas, pero al ser un modelo de generación de vídeo, puede producir contenido no deseado o incoherente en escenarios complejos.
- El modelo solo está verificado para generar una imagen estática; no hay evidencia pública de generación de vídeo completa con este checkpoint cuantizado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/berryber09/10Eros-Max-h3-turbo-hybrid-beta4-w4a8
- Modelo base (bf16): https://huggingface.co/TenStrip/10Eros-Max
- Cuantizador utilizado: https://github.com/NidAll/comfyui-mixed-quantizer
- Repositorio de MiniMax-H3: https://github.com/MiniMax-AI/MiniMax-H3
- Página del modelo en Civitai (beta3): https://civitai.com/models/2851079/h3-eros-max
