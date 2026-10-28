# RunningHubAI/rh-awpainting-v1.4-checkpoint

## Resumen

rh-awpainting-v1.4-checkpoint es un checkpoint de generación de imágenes por difusión latente, afinado a partir de Stable Diffusion 1.5 y distribuido por RunningHub en Hugging Face en nombre de su autor, el usuario @KOP-袁. El repositorio contiene un único archivo de pesos en formato safetensors de 2034 MiB (aproximadamente 2,1 GB), pensado para cargarse en ComfyUI o en la plataforma RunningHub. No es un modelo de lenguaje: no genera texto ni procesa instrucciones conversacionales, sino que produce imágenes a partir de prompts.

La documentación publicada es mínima. La model card no describe el dataset de entrenamiento, el método de ajuste fino, la resolución nativa ni el estilo concreto que persigue el checkpoint; se limita a indicar el origen (SD 1.5), el archivo de pesos y enlaces promocionales a RunningHub. La única descripción cualitativa es la frase «awp 无需多言» («awp no necesita explicación»), que no aporta información técnica. Tampoco se declara licencia, idiomas ni pipeline de difusión en los metadatos de Hugging Face.

Su relevancia es, por tanto, limitada y de carácter práctico: sirve como ejemplo de la cadena de publicación automatizada de RunningHub (entrenamiento en su plataforma, exportación a safetensors, espejo en Hugging Face) y como checkpoint de estilo para flujos de trabajo en ComfyUI. Con 0 descargas y 0 «likes» en el momento de la consulta, carece de validación por parte de la comunidad, y la ausencia de licencia explícita es un obstáculo serio para cualquier uso en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Difusión latente (U-Net + text encoder CLIP + VAE), afinada desde Stable Diffusion 1.5 según la model card |
| Parámetros totales | No disponible (el autor no lo declara; la base SD 1.5 ronda los 983 M en conjunto, dato no confirmado para este checkpoint) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica a generación de imágenes; el text encoder CLIP de SD 1.5 admite 77 tokens por prompt (límite de la arquitectura base, no documentado por el autor) |
| Tipos de cuantización | No disponible; se distribuye un único safetensors de 2034 MiB, presumiblemente fp16 o fp32 (no declarado) |
| Idiomas soportados | No disponible; los prompts se procesan mediante el text encoder CLIP de SD 1.5, orientado al inglés |
| Licencia | No disponible (la model card indica que el copyright permanece en el autor y remite a la licencia del proyecto original, sin especificarla) |
| Formato de pesos | safetensors (`AWPlashing_v1.0 (1).safetensors`, 2034 MiB) |

## Arquitectura y entrenamiento

El checkpoint sigue la arquitectura de Stable Diffusion 1.5: un modelo de difusión latente compuesto por un U-Net que aplica el proceso de denoising en el espacio latente, un text encoder CLIP que convierte el prompt en condicionamiento y un VAE que codifica y descodifica entre el espacio de píxeles y el latente. La model card únicamente confirma el ajuste fino desde SD 1.5 («Finetuned from: SD 1.5»).

No hay información sobre el número de pasos de entrenamiento, el volumen o la composición del dataset, la resolución de entrenamiento, el uso de regularización, ni sobre si se emplearon técnicas como LoRA, DreamBooth, textual inversion o ajuste completo de los pesos. Tampoco se documenta ningún proceso de alineación (RLHF, DPO) —habitual, por otra parte, en modelos de difusión— ni innovaciones técnicas en el muestreo. El nombre del archivo (`AWPlashing_v1.0`) no coincide con la versión declarada en el repositorio (`v1.4`), lo que introduce ambigüedad sobre qué iteración del modelo se está descargando realmente.

## Capacidades

- Generación de imágenes texto-a-imagen (text-to-image) en el ecosistema Stable Diffusion, ejecutable en ComfyUI y en RunningHub.
- Ajuste de estilo artístico: al ser un checkpoint afinado, se espera que reproduzca una estética pictórica concreta (el sufijo «awpainting» sugiere pintura ilustrada), aunque el autor no la describe.
- Edición imagen-a-imagen (img2img) e inpainting/outpainting mediante los nodos correspondientes de ComfyUI, siempre que el checkpoint sea compatible con los pipelines estándar de SD 1.5 (no verificado por el autor).
- Composición de estilos mediante LoRA y embeddings negativos propios del ecosistema SD 1.5, sujeto a compatibilidad no documentada.
- Integración en flujos de trabajo por nodos (grafos de ComfyUI) y en la API de RunningHub.
- No soporta tool calling, function calling, razonamiento multi-paso, agentes, visión comprensiva, audio ni generación de texto: es exclusivamente un modelo generativo de imagen.

## Casos de uso

- Ilustración conceptual por lotes: generar variantes de una misma escena con un prompt fijo y distintas semillas en ComfyUI, aprovechando que el checkpoint está empaquetado para ese entorno y no requiere scripts adicionales.
- Exploración de estilo pictórico: usar el checkpoint como base para producir referencias visuales de una estética concreta antes de encargar arte final, iterando con img2img sobre bocetos propios.
- Relleno y corrección de imágenes (inpainting): sustituir o reparar regiones de una ilustración mediante los nodos de inpainting de ComfyUI, manteniendo la coherencia de estilo del resto de la imagen.
- Prototipado de pipelines en RunningHub: al estar publicado por la propia plataforma y con enlace directo a su API, sirve para probar la integración de la API de generación de imágenes en una aplicación antes de invertir en un modelo propio.
- Generación de material de acompañamiento para documentación o blogs: ilustraciones decorativas de un estilo homogéneo, siempre que la licencia se aclare previamente.
- Pruebas comparativas de checkpoints SD 1.5: incluirlo como referencia en una batería interna de evaluación de estilos, dado su reducido tamaño (2,1 GB) y su compatibilidad esperada con el ecosistema.
- Creación de datasets sintéticos de imagen para tareas posteriores de clasificación o segmentación, con la salvedad de que la licencia no permite confirmar el uso comercial del material generado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas objetivas (FID, CLIP score, evaluaciones humanas) ni comparaciones con otros checkpoints, y no existen datos de la comunidad al respecto.

## Requisitos de hardware

- VRAM estimada para inferencia: alrededor de 4-6 GB en fp16 a 512×512 con una sola imagen por paso; 8 GB o más para lotes, resoluciones superiores o pipelines con ControlNet. Son estimaciones basadas en el tamaño del archivo (2034 MiB) y en el comportamiento típico de SD 1.5, no cifras publicadas por el autor.
- GPU recomendadas: cualquier GPU consumer con 6 GB o más de VRAM (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090). Las GPU de datacenter (A100, H100) son innecesarias para este tamaño, salvo para servir muchas peticiones concurrentes.
- Cabe en GPU consumer: sí, con toda probabilidad, en la práctica totalidad de tarjetas de los últimos cinco años con 6 GB o más. También es viable en CPU, con latencias muy altas.
- Opciones de despliegue: ComfyUI (entorno objetivo declarado), RunningHub (plataforma del editor), Automatic1111/Forge, biblioteca Diffusers de Hugging Face, y exportación a ONNX o TensorRT. Los runners de LLM como vLLM, llama.cpp, Ollama o TGI no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles. No se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Resolución nativa | Límite de prompt | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| rh-awpainting-v1.4-checkpoint | No declarados (base SD 1.5) | No declarada | No declarado | No disponible | Hugging Face, RunningHub |
| Stable Diffusion 1.5 (base) | ~983 M (U-Net ~860 M) | 512×512 | 77 tokens | CreativeML OpenRAIL-M | Amplia, con amplio soporte de herramientas |
| Stable Diffusion XL (base) | ~3,5 B (U-Net ~2,6 B) | 1024×1024 | 77 tokens por encoder, dos encoders | CreativeML OpenRAIL++-M | Amplia |
| Checkpoints de estilo comunitarios para SD 1.5 | Variable, típicamente ~1 B | 512×512 | 77 tokens | Variable, a menudo sin declarar | Civitai, Hugging Face |

La comparación se limita a características estructurales: no existen datos públicos de calidad o rendimiento de este checkpoint que permitan situarlo frente a las alternativas. Frente a SDXL, este modelo parte de una arquitectura anterior, con menor resolución nativa y menor calidad esperada en composiciones complejas, pero con requisitos de VRAM mucho más bajos y compatibilidad con el vasto ecosistema de LoRA y ControlNet de SD 1.5.

## Limitaciones y advertencias

- Licencia no declarada: la model card remite a «la licencia del proyecto original o de nivel superior» sin identificarla. Sin una licencia explícita, no puede asumirse permiso para uso comercial; es un riesgo legal directo para producción.
- Documentación prácticamente inexistente: no se especifican dataset, método de entrenamiento, resolución ni estilo objetivo, lo que impide evaluar sesgos o predecir el comportamiento del modelo.
- Inconsistencia de versiones: el repositorio se anuncia como v1.4, pero el archivo de pesos se llama `AWPlashing_v1.0 (1).safetensors`. No hay garantía de qué iteración contiene ni de su trazabilidad.
- Sesgos desconocidos: al no documentarse la composición del dataset, no pueden evaluarse sesgos de representación (género, etnia, cultura) ni la presencia de material protegido por derechos de autor en el entrenamiento.
- Artefactos propios de SD 1.5: son esperables errores anatómicos en manos y extremidades, problemas de perspectiva en escenas con múltiples sujetos y dificultades con texto legible dentro de la imagen. Estas limitaciones derivan de la arquitectura base y no han sido evaluadas en este checkpoint concreto.
- Límite de prompt: el text encoder CLIP de SD 1.5 trunca las instrucciones a 77 tokens, lo que restringe el control fino mediante lenguaje natural y obliga a usar prompts concisos o *prompt weighting*.
- Idioma: el condicionamiento textual está orientado al inglés; los prompts en castellano probablemente rendirán peor, aunque el autor no documenta ningún soporte multilingüe.
- Ausencia de validación comunitaria: 0 descargas y 0 «likes» implican que no existen informes independientes de calidad ni de fallos.
- Contenido promocional en la model card: buena parte del README son enlaces a servicios de RunningHub, no información técnica; conviene tratar el repositorio como un artefacto de distribución más que como un modelo documentado.
- Riesgo de reproducción de estilo: si el ajuste fino se hizo sobre obra de un artista concreto, la generación de imágenes en ese estilo puede plantear problemas de derechos de autor según la jurisdicción.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/RunningHubAI/rh-awpainting-v1.4-checkpoint
- Modelo original en RunningHub: https://www.runninghub.cn/model/public/2055582544950775809
- Página del autor (@KOP-袁): https://www.runninghub.cn/user-center/1936779056513781762
- RunningHub (internacional): https://www.runninghub.ai
- RunningHub (China): https://www.runninghub.cn
- Documentación de la API (inglés): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentación de la API (chino): https://www.runninghub.cn/runninghub-api-doc-cn/
- Entrenamiento en RunningHub: https://www.runninghub.ai/page-model
- README en chino: https://huggingface.co/RunningHubAI/rh-awpainting-v1.4-checkpoint/blob/main/README_cn.md
