# black-forest-labs/FLUX.1-schnell

## Resumen

FLUX.1-schnell es un modelo de generacion de imagenes a partir de texto (text-to-image) desarrollado por Black Forest Labs, el equipo detras de la investigacion original de Stable Diffusion. Se trata de la variante destilada y mas rapida de la familia FLUX.1, disenada para generar imagenes de alta calidad en tan solo 1 a 4 pasos de inferencia, lo que lo hace especialmente atractivo para aplicaciones en tiempo real y entornos con recursos limitados. El modelo cuenta con aproximadamente 11.900 millones de parametros y se distribuye bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones adicionales.

El modelo resuelve el problema de la latencia en generacion de imagenes: frente a los 20-50 pasos tipicos de los modelos de difusion tradicionales, FLUX.1-schnell emplea tecnicas de destilacion por timesteps (timestep distillation) que reducen drasticamente el coste computacional manteniendo una calidad visual competitiva. Es relevante ahora porque combina una licencia permisiva, un ecosistema maduro (integracion con diffusers, endpoints compatibles, despliegue en SageMaker y Azure) y un rendimiento que lo situa entre los modelos open de generacion de imagenes mas capaces disponibles.

La arquitectura es un transformer de flujo (flow transformer) con 12 mil millones de parametros, sucesor de la arquitectura de difusion clasica, que emplea rectified flow para el transporte entre ruido y datos. El modelo esta entrenado principalmente en ingles y su acceso esta restringido (gated) en Hugging Face, requiriendo aceptar las condiciones de uso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de flujo (flow transformer) con rectified flow |
| Parametros totales | 11.891.178.560 (~11,9 mil millones) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de imagen; no aplica contexto de texto) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada (pesos en safetensors; se pueden aplicar cuantizaciones de la comunidad) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 58,1 GB) |
| Pipeline | text-to-image (diffusers: FluxPipeline) |
| Descargas | 283.704 |
| Likes | 6.875 |
| Acceso | Restringido (gated), requiere aceptar condiciones |
| Fecha de creacion | 2024-07-31 |
| Ultima actualizacion | 2026-11-19 |

## Arquitectura y entrenamiento

FLUX.1-schnell se basa en un transformer de flujo (flow transformer) que sustituye la formulacion clasica de difusion por rectified flow, un marco que aprende trayectorias rectas entre la distribucion de ruido y la de datos, lo que permite una integracion mas eficiente y menos pasos de muestreo. El modelo emplea un autoencoder (VAE) para comprimir las imagenes al espacio latente y un codificador de texto para procesar los prompts; el backbone transformer opera en el espacio latente. Con aproximadamente 11,9 mil millones de parametros, es un modelo de gran escala para generacion de imagenes.

La innovacion clave es la destilacion por timesteps: FLUX.1-schnell ha sido destilado a partir de un modelo base (FLUX.1-pro/dev) para que pueda generar imagenes de calidad en 1 a 4 pasos de inferencia, en lugar de los 20-50 habituales. Esto reduce el coste computacional en un orden de magnitud. Los detalles exactos sobre el numero de tokens de entrenamiento, la composicion del dataset y si se empleo RLHF o DPO no estan disponibles en la informacion proporcionada. El modelo esta entrenado principalmente en ingles.

## Capacidades

- Generacion de imagenes a partir de descripciones textuales (text-to-image) en ingles.
- Generacion rapida en 1 a 4 pasos de inferencia gracias a la destilacion por timesteps.
- Alta fidelidad visual y coherencia en escenas complejas, con soporte para estilos diversos.
- Integracion nativa con la libreria diffusers (FluxPipeline).
- Compatible con endpoints de inferencia (endpoints_compatible), despliegue en SageMaker y Azure.
- Soporte de prompts detallados en ingles; no se documenta soporte multilingue.
- No se documenta tool calling, function calling, agentes ni razonamiento multi-paso (es un modelo de imagen, no de texto).
- No se documenta vision de entrada ni audio; es exclusivamente generativo de imagen.

## Casos de uso

- Generacion de imagenes en tiempo real para aplicaciones interactivas: gracias a sus 1-4 pasos de inferencia, el modelo puede generar imagenes en una fraccion de segundo en GPU modernas, lo que lo hace adecuado para interfaces de usuario donde el usuario ve el resultado casi instantaneamente.
- Creacion de contenido para marketing y redes sociales: permite generar variaciones de imagenes de producto, banners y creatividades a partir de prompts en ingles, con la ventaja de la licencia Apache 2.0 para uso comercial sin restricciones.
- Prototipado rapido de diseno grafico: disenadores pueden iterar sobre conceptos visuales generando multiples imagenes en segundos, reduciendo el tiempo de exploracion creativa.
- Generacion de ilustraciones para videojuegos y animacion: el modelo puede producir assets visuales coherentes con estilos definidos, integrable en pipelines de produccion mediante diffusers.
- Aumento de datos sinteticos para entrenamiento de modelos de vision: se pueden generar datasets de imagenes etiquetadas a partir de prompts, utiles para tareas de clasificacion o deteccion con datos escasos.
- Despliegue en entornos cloud con requisitos de coste: al necesitar pocos pasos de inferencia, el coste por imagen en servicios como SageMaker o Azure se reduce significativamente frente a modelos de difusion tradicionales.
- Aplicaciones de edicion y variacion de imagenes: aunque el modelo es text-to-image, puede combinarse con pipelines de img2img o inpainting de diffusers para tareas de edicion, aprovechando su velocidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene ~11,9 mil millones de parametros. En precision completa (fp32) requeriria aproximadamente 47,6 GB de VRAM; en fp16/bf16, unos 23,8 GB; en cuantizacion de 8 bits, unos 11,9 GB; en 4 bits, unos 6 GB (estimaciones teoricas, no confirmadas en la informacion proporcionada).
- GPU recomendadas: para fp16 se recomienda una A100 (40 GB o 80 GB) o H100; para cuantizaciones de 8 bits, una RTX 4090 (24 GB) o A6000; para 4 bits, una RTX 3090/4090 o incluso GPUs con 8-12 GB.
- Cabe en GPU consumer: si, en configuraciones cuantizadas (4 bits) en RTX 3090, RTX 4090 y potencialmente en GPUs con 8 GB si se aplican tecnicas de offloading.
- Opciones de despliegue: diffusers (FluxPipeline), endpoints de Hugging Face, SageMaker, Azure. No se documenta soporte nativo de vLLM, llama.cpp, Ollama o TGI en la informacion proporcionada (son herramientas orientadas a modelos de lenguaje; para imagen se usaria diffusers o ComfyUI).
- Latencia y throughput estimados: no disponibles en la informacion proporcionada. La ventaja de 1-4 pasos sugiere latencias muy inferiores a modelos de 20-50 pasos, pero no se aportan numeros concretos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / pasos | Licencia | Disponibilidad |
|---|---|---|---|---|
| FLUX.1-schnell | ~11,9 mil millones | 1-4 pasos de inferencia | Apache 2.0 | Hugging Face (gated) |
| FLUX.1-dev | no disponible en la informacion | no disponible | no disponible | no disponible |
| FLUX.1-pro | no disponible en la informacion | no disponible | no disponible (API) | no disponible |
| Stable Diffusion 3 | no disponible en la informacion | 20-50 pasos tipicos | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones detalladas de los modelos comparables en la informacion proporcionada, por lo que la comparacion cuantitativa no esta disponible.

## Limitaciones y advertencias

- Sesgos conocidos: al ser un modelo entrenado principalmente en ingles y con datos de internet, puede reproducir sesgos de genero, raza y cultura presentes en los datos de entrenamiento; no se documentan medidas especificas de mitigacion.
- Riesgo de alucinacion visual: puede generar imagenes con incoherencias (anatomia incorrecta, texto ilegible, artefactos) especialmente en escenas complejas o prompts ambiguos.
- Limitaciones de idioma: solo se documenta soporte de ingles; los prompts en otros idiomas pueden producir resultados de menor calidad.
- Restricciones de licencia: Apache 2.0 permite uso comercial sin restricciones adicionales, pero el acceso esta restringido (gated) y requiere aceptar las condiciones en Hugging Face; conviene revisar los terminos de uso del modelo.
- Caveat para produccion: el modelo esta destilado para pocos pasos, lo que puede limitar la diversidad y el control fino frente a modelos no destilados; para tareas que requieran maxima calidad o control preciso, puede ser preferible un modelo base con mas pasos.
- No se documentan capacidades de edicion, inpainting o control condicional (como ControlNet) en la informacion proporcionada; su uso en esos escenarios requeriria pipelines adicionales.

## Enlaces

- Hugging Face: https://huggingface.co/black-forest-labs/FLUX.1-schnell
- No se han encontrado otros enlaces (papers, blogs, repos, demos) en la informacion proporcionada.
