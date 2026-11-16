# mwmai/stable-diffusion-safety-checker

## Resumen

`mwmai/stable-diffusion-safety-checker` es una replicación del checkpoint `CompVis/stable-diffusion-safety-checker`, el clasificador de seguridad que se distribuye junto a Stable Diffusion v1 para filtrar imágenes generadas con contenido no apto para todo público (NSFW). El modelo no genera imágenes: es un módulo de clasificación binaria construido sobre un encoder CLIP ViT-L/14 que recibe una imagen y devuelve una puntuación de "seguridad" utilizada por el pipeline de `diffusers` para censurar la salida.

El repositorio lo publica el usuario `mwmai` y su model card es prácticamente un esqueleto heredado de la plantilla de Hugging Face, con la mayoría de campos marcados como "More information needed". La información técnica sustantiva procede del modelo padre (CLIP de OpenAI, ViT-L/14) y de la documentación de Stable Diffusion, no de aportaciones propias del autor de esta réplica.

Su relevancia es acotada: sirve como pieza de infraestructura para pipelines de generación de imágenes que necesitan un filtro de contenido, pero no es un modelo de propósito general ni compite en la categoría de LLM. El contexto, los idiomas y el pipeline no están declarados en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CLIP ViT-L/14 (encoder de imagen Transformer ViT-L/14 + encoder de texto Transformer con self-attention enmascarada), entrenado con pérdida contrastiva |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de contexto textual; procesa una imagen por inferencia) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible (el repo ocupa 1,2 GB y los tags indican PyTorch; el formato concreto no se especifica) |

## Arquitectura y entrenamiento

El modelo se apoya en la arquitectura CLIP descrita por OpenAI: un encoder de imagen ViT-L/14 y un encoder de texto Transformer con self-attention enmascarada, ambos entrenados de forma conjunta para maximizar la similitud entre pares (imagen, texto) mediante una pérdida contrastiva. En el caso del safety checker de Stable Diffusion, esta base CLIP se reutiliza como extractor de características para una cabeza de clasificación binaria que distingue imágenes seguras de imágenes NSFW.

No hay información en la model card sobre el dataset de entrenamiento, el número de tokens o pares imagen-texto, la composición de los datos, ni sobre si se aplicó RLHF, DPO o ajuste fino supervisado específico para la tarea de clasificación de seguridad. Tampoco se documentan innovaciones técnicas adicionales (decodificación especulativa, atención lineal, etc.). La model card remite al paper de CLIP (arXiv:2103.00020) y a la model card de Stable Diffusion v1 para los detalles arquitectónicos, pero no aporta datos propios de entrenamiento.

## Capacidades

- Identificación de imágenes NSFW: clasifica una imagen de entrada como segura o no segura, devolviendo una puntuación que el pipeline de `diffusers` usa para censurar la generación.
- Extracción de características visuales mediante el encoder ViT-L/14 de CLIP.
- Integración nativa con el pipeline de Stable Diffusion v1 a través de `diffusers` (no con `transformers`, según advierte la propia model card).
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües declaradas.
- No dispone de modo "thinking", visión generativa, audio ni otras capacidades especiales más allá de la clasificación de seguridad.

## Casos de uso

- Filtrado de salidas en pipelines de Stable Diffusion: se carga como `SafetyChecker` en `diffusers` para que cada imagen generada pase por el clasificador antes de entregarse al usuario, bloqueando contenido NSFW de forma automática.
- Moderación en plataformas de generación de imágenes: sirve como primera barrera en servicios que exponen modelos de difusión a usuarios finales, reduciendo el riesgo de distribución de contenido inapropiado.
- Auditoría de datasets de imágenes: puede emplearse para etiquetar grandes lotes de imágenes y detectar contenido sensible antes de usarlos en entrenamiento o publicación.
- Preprocesado en investigación sobre sesgos: permite separar subconjuntos de imágenes por categoría de seguridad para estudiar distribuciones y sesgos en modelos generativos.
- Cumplimiento normativo en despliegues comerciales: como componente de un sistema de moderación, ayuda a documentar controles de contenido exigidos por políticas internas o regulación sectorial.
- Pruebas de regresión en CI/CD de pipelines generativos: se puede incluir como paso de validación que verifica que las imágenes producidas por una nueva versión del modelo no disparan el clasificador de forma inesperada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el repo pesa 1,2 GB, por lo que en fp32 el modelo debería caber holgadamente en GPUs de consumo, pero no se confirma el tamaño exacto de parámetros.
- GPU recomendadas: no disponibles en la información proporcionada; por el tamaño del checkpoint, una GPU consumer moderna (RTX 3060 o superior) sería suficiente en la práctica, aunque esto es una estimación y no un dato del autor.
- Cabe en GPU consumer: probablemente sí, dado el tamaño del repo, pero no confirmado.
- Opciones de despliegue: integración con `diffusers` (vía `SafetyChecker`); no se documentan opciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `mwmai/stable-diffusion-safety-checker` | CLIP ViT-L/14 + cabeza de clasificación | no disponible | no aplica | no disponible | Hugging Face (0 descargas) |
| `CompVis/stable-diffusion-safety-checker` | CLIP ViT-L/14 + cabeza de clasificación | no disponible | no aplica | CreativeML Open RAIL-M (según el ecosistema Stable Diffusion; no confirmado en esta ficha) | Hugging Face (modelo de referencia) |
| `openai/clip-vit-large-patch14` | CLIP ViT-L/14 | ~428 M (ViT-L/14, dato del modelo base CLIP) | no aplica | MIT (según el repositorio de OpenAI; no confirmado en esta ficha) | Hugging Face |

La comparativa se limita a estos tres porque no se dispone de datos verificados de benchmarks ni de otros clasificadores de seguridad comparables en la información proporcionada. El modelo de `mwmai` es esencialmente una réplica del checkpoint de `CompVis` sin documentación adicional, por lo que su valor diferencial frente al original no está justificado en la información disponible.

## Limitaciones y advertencias

- Sesgos conocidos: la model card advierte de que las predicciones pueden incluir estereotipos dañinos sobre clases protegidas, características de identidad y grupos sociales u ocupacionales, heredados de CLIP.
- Disparidades documentadas en CLIP: el modelo base muestra diferencias significativas por raza y género en tareas de clasificación, y estas disparidades pueden variar según cómo se construyan las categorías.
- Riesgo de alucinación: no aplica en el sentido generativo, pero sí existe riesgo de falsos positivos y falsos negativos en la clasificación de seguridad.
- Limitaciones de contexto e idioma: no se declaran idiomas soportados ni contexto; el modelo procesa una imagen por inferencia.
- Restricciones de licencia: la licencia no está disponible en la información proporcionada, por lo que no se puede confirmar el uso comercial.
- Caveat de producción: la model card indica que el modelo está pensado para usarse con `diffusers` y no con `transformers`; usarlo fuera de ese ecosistema puede requerir adaptaciones no documentadas.
- Documentación insuficiente: la mayoría de campos de la model card están sin completar, lo que dificulta la reproducibilidad y la evaluación independiente.
- Repositorio sin tracción: 0 descargas y 0 likes en el momento de la consulta, lo que reduce la validación comunitaria del checkpoint.

## Enlaces

- Hugging Face: https://huggingface.co/mwmai/stable-diffusion-safety-checker
- Modelo padre CLIP: https://huggingface.co/openai/clip-vit-large-patch14
- Paper de CLIP: https://arxiv.org/abs/2103.00020
- Paper de Lacoste et al. (impacto ambiental): https://arxiv.org/abs/1910.09700
- Model card de Stable Diffusion v1: https://github.com/CompVis/stable-diffusion/blob/main/Stable_Diffusion_v1_Model_Card.md
- Calculadora de impacto ambiental: https://mlco2.github.io/impact#compute
- Paper de Sheng et al. (2021) sobre sesgos: https://aclanthology.org/2021.acl-long.330.pdf
- Paper de Bender et al. (2021) sobre riesgos: https://dl.acm.org/doi/pdf/10.1145/3442188.3445922
