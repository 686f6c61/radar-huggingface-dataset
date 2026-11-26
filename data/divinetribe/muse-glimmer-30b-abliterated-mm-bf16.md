# divinetribe/Muse-Glimmer-30B-Abliterated-MM-bf16

## Resumen

Muse-Glimmer-30B-Abliterated-MM-bf16 es una variante "abliterated" (sin direcciones de rechazo) del modelo multimodal Muse-Glimmer-30B de Meta, convertida a formato MLX y publicada por el usuario divinetribe. El modelo conserva intacta la torre de visión (ViT de 50 capas al estilo Qwen2.5-VL) y el adaptador multimodal, de modo que mantiene la capacidad de describir y razonar sobre imágenes, pero se han eliminado las direcciones de rechazo de los pesos de lenguaje mediante ablación direccional (Arditi et al.) a partir de la capa 26.

El interés principal radica en que combina tres características poco habituales: es multimodal (visión + lenguaje) con 29.776 millones de parámetros en bf16, está optimizado para Apple Silicon mediante MLX (mlx-vlm), y ha sido "abliterado" para eliminar el comportamiento de rechazo estándar. El autor lo presenta como el primer modelo multimodal abliterado que funciona en MLX.

El modelo está pensado para investigación y para usuarios que necesitan un asistente sin restricciones de rechazo ejecutándose en hardware propio. El repositorio ocupa 59,6 GB en bf16 y requiere una máquina Apple Silicon con gran cantidad de memoria unificada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (ViT de 50 capas + adaptador GELU + proyección al stream de texto) |
| Parametros totales | 29.776.626.688 (~29,8 mil millones) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bf16 (esta version); no se documentan otras cuantizaciones |
| Idiomas soportados | no disponible |
| Licencia | other |
| Formato de pesos | safetensors (MLX, 1.436 tensores) |

## Arquitectura y entrenamiento

El modelo base es Muse-Glimmer-30B de Meta en su conversión MLX (mlx-community/Muse-Glimmer-30B-bf16). La arquitectura combina un transformer de lenguaje con una torre de visión de tipo Qwen2.5-VL: ViT de 50 capas con RoPE 2D, atención de ventana y atención completa alternadas, y fusión espacial 2x2. La salida del ViT pasa por un adaptador GELU y una proyección que la inserta en el stream de tokens de texto en la posición del token de imagen.

La modificación respecto al modelo base es la ablación direccional descrita en el trabajo de Arditi et al.: se calcula la dirección de rechazo como diferencia de medias sobre prompts dañinos y benignos en la capa 26, y se ortogonaliza esa dirección fuera de `embed_tokens`, de todas las `self_attn.o_proj` y de todas las `mlp.down_proj`. La ablación se aplica únicamente a los pesos de lenguaje; la torre de visión y el adaptador quedan intactos, lo que preserva la comprensión de imágenes. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en el modelo base.

## Capacidades

- Generación de texto y razonamiento conversacional multi-turno.
- Comprensión de imágenes: descripción, reconocimiento de objetos, identificación de modelos concretos (por ejemplo, variantes de vehículos por la forma del spoiler), reconocimiento de monumentos y lugares.
- OCR en escenas naturales (lectura de rótulos y texto en imágenes del mundo real).
- Lectura e interpretación de gráficos (extracción de valores de gráficos de barras).
- Respuestas sin el comportamiento de rechazo estándar del modelo base (abliterado).
- Plantilla de chat que termina el prompt de generación en `assistant to=user<|message|>`, de modo que el modelo responde directamente sin emitir su canal de razonamiento propio.
- Soporte de modo solo texto (con `num_images=0` y sin argumento `image=`).
- Capacidades de tool calling, agentes y multilingüismo: no documentadas en la información disponible.

## Casos de uso

- Análisis de imágenes en local sobre Apple Silicon: el modelo permite describir fotografías, identificar objetos y leer texto en imágenes sin enviar datos a servicios en la nube, aprovechando la inferencia MLX en hardware propio.
- Reconocimiento fino de productos y vehículos: útil en catalogación de inventario o tasación, donde la identificación por detalles visuales (forma, insignias, carrocería) es relevante.
- OCR de escenas naturales: digitalización de rótulos, matrículas o carteles en fotografías para pipelines de documentación o accesibilidad.
- Extracción de datos de gráficos: convertir gráficos de barras o líneas en valores numéricos para informes automáticos o análisis de datos.
- Asistente conversacional sin restricciones para investigación: estudio del comportamiento de modelos abliterados, análisis de sesgos y evaluación de alineación en entornos controlados.
- Agentización local con Claude Code Local: el modelo figura como uno de los "fighters" del proyecto Claude Code Local, que ejecuta Claude Code íntegramente en el dispositivo mediante un servidor MLX nativo de la API de Anthropic.
- Prototipado de asistentes multimodales privados: al ejecutarse localmente, es adecuado para entornos con requisitos de confidencialidad donde no se puede usar una API externa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: ~60 GB en bf16 (tamaño del repositorio). Requiere una máquina Apple Silicon con memoria unificada de al menos 64 GB; con 96 GB o 128 GB se dispone de margen para el contexto y el procesador de visión.
- GPU recomendadas: no aplica directamente, ya que el modelo está empaquetado para MLX (Apple Silicon). En GPUs NVIDIA no es ejecutable sin una conversión previa a otro formato, que no se documenta.
- Cabe en consumer GPU: no en el sentido habitual (GPUs de consumo con 24 GB o menos); requiere Apple Silicon de gama alta (M2/M3/M4 Max o Ultra con 64 GB o más).
- Opciones de despliegue: mlx-vlm (soporte nativo del modelo `muse_glimmer`, añadido en el PR #1838 de mlx-vlm); también puede integrarse en Claude Code Local mediante el servidor MLX de la API de Anthropic. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Vision | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Muse-Glimmer-30B-Abliterated-MM-bf16 | ~29,8 B | no disponible | Si (ViT 50 capas) | other | Hugging Face (MLX, bf16) |
| mlx-community/Muse-Glimmer-30B-bf16 (base) | ~29,8 B | no disponible | Si | no disponible | Hugging Face (MLX, bf16) |
| Qwen2.5-VL (familia) | variable (7B, 72B, etc.) | no disponible | Si (arquitectura ViT similar) | no disponible | Hugging Face |
| Modelos multimodales abliterados en MLX | no disponible | no disponible | Si | no disponible | no disponible |

La comparación con Qwen2.5-VL es pertinente porque la torre de visión de Muse-Glimmer sigue ese diseño, pero no se dispone de datos de rendimiento comparativos. No se conocen otros modelos multimodales abliterados en MLX con los que comparar directamente.

## Limitaciones y advertencias

- La ablación elimina el comportamiento de rechazo, lo que implica que el modelo puede generar contenido dañino, ilegal o inseguro sin las salvaguardas del modelo base. El uso es responsabilidad exclusiva del usuario.
- La licencia es "other" y no se detallan sus términos; es imprescindible revisar la licencia del modelo base (Meta Muse-Glimmer-30B) antes de cualquier uso comercial.
- Riesgo de alucinación inherente a los modelos de lenguaje y visión; la model card muestra ejemplos de identificaciones precisas, pero no hay evaluación sistemática de fiabilidad.
- Sesgos conocidos: no documentados, pero al derivar de un modelo base sin evaluación de sesgos publicada, se deben asumir los sesgos del modelo original.
- Idiomas soportados: no disponibles; no se garantiza un rendimiento multilingüe equilibrado.
- Longitud de contexto: no disponible, lo que dificulta planificar casos de uso con documentos o conversaciones largas.
- Requiere hardware Apple Silicon de gama alta (~60 GB en bf16); no es desplegable en GPUs de consumo convencionales ni en la mayoría de infraestructuras cloud estándar sin conversión.
- El modelo está empaquetado para mlx-vlm; el soporte en otros runtimes no está documentado.
- La model card incluye afirmaciones de marketing (estrellas de GitHub, descargas) que no constituyen una evaluación técnica independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/divinetribe/Muse-Glimmer-30B-Abliterated-MM-bf16
- Modelo base: https://huggingface.co/mlx-community/Muse-Glimmer-30B-bf16
- Repositorio mlx-vlm: https://github.com/Blaizzy/mlx-vlm
- PR de soporte del modelo en mlx-vlm: https://github.com/Blaizzy/mlx-vlm/pull/1838
- Proyecto Claude Code Local: https://github.com/nicedreamzapp/claude-code-local
- Leaderboard Agent-12: https://nicedreamzapp.github.io/agent12/
- Perfil de GitHub del autor: https://github.com/nicedreamzapp
- Demo en YouTube: https://www.youtube.com/watch?v=5fs_FfkCaDA
- Video demo (archivo): https://huggingface.co/divinetribe/Muse-Glimmer-30B-Abliterated-MM-bf16/resolve/main/demo.mp4
- Póster del demo: https://huggingface.co/divinetribe/Muse-Glimmer-30B-Abliterated-MM-bf16/resolve/main/demo-poster.png
- GitHub Sponsors: https://github.com/sponsors/nicedreamzapp
- Portfolio del autor: https://nicedreamzwholesale.com/software/
