# black-forest-labs/FLUX.2-klein-4B

## Resumen

FLUX.2 [klein] 4B es un modelo de generación y edición de imágenes desarrollado por Black Forest Labs, la compañía responsable de la familia FLUX. Se trata de un transformer de flujo rectificado (rectified flow transformer) de aproximadamente 4 000 millones de parámetros que unifica en una única arquitectura compacta las tareas de text-to-image y edición multi-referencia. Su principal propuesta de valor es la velocidad: permite inferencia de extremo a extremo en menos de un segundo, lo que lo sitúa como el modelo más rápido de la familia FLUX.2 hasta la fecha.

El modelo está diseñado para ejecutarse en hardware de consumo, con un requisito de aproximadamente 13 GB de VRAM, siendo accesible en GPUs como la RTX 3090 o RTX 4070. Se distribuye con pesos abiertos bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones adicionales. Su relevancia actual radica en que combina calidad de estado del arte con latencia mínima, orientándose a aplicaciones interactivas, despliegues en producción y entornos con recursos limitados. Incluye capacidades de edición multi-referencia, es decir, puede modificar imágenes a partir de varias imágenes de referencia además de texto.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Rectified flow transformer |
| Parametros totales | 3 875 544 576 (3,88 B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (modelo de imágenes) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

FLUX.2 [klein] 4B es un transformer de flujo rectificado (rectified flow transformer) de aproximadamente 4 000 millones de parámetros. A diferencia de los modelos de difusión tradicionales, emplea una formulación de flujo rectificado que permite un muestreo más eficiente en pocos pasos. El modelo está destilado (distilled), lo que explica su capacidad para generar imágenes en tan solo 4 pasos de inferencia, alcanzando tiempos de generación por debajo de un segundo en hardware adecuado.

La arquitectura unifica generación y edición en un solo modelo, de modo que no requiere componentes separados para text-to-image y para image-to-image multi-referencia. El modelo acepta tanto texto como una o varias imágenes de referencia como entrada, lo que permite ediciones complejas guiadas por múltiples fuentes visuales. No se han publicado detalles específicos sobre el volumen de datos de entrenamiento ni la composición exacta del dataset. Según la documentación del autor, se aplicaron mitigaciones pre-entrenamiento (filtrado de contenido NSFW y CSAM) y post-entrenamiento (fine-tuning dirigido) para reducir riesgos de abuso.

## Capacidades

- Generación de imágenes a partir de descripciones textuales (text-to-image) con calidad de estado del arte.
- Edición de imágenes con soporte multi-referencia: puede tomar una o varias imágenes de entrada y modificarlas según instrucciones textuales o visuales.
- Inferencia rápida: generación en menos de un segundo con 4 pasos de muestreo.
- Unificación de tareas: un solo modelo cubre tanto generación como edición, sin necesidad de pipelines separados.
- Ejecución en hardware de consumo: requiere aproximadamente 13 GB de VRAM, compatible con GPUs como RTX 3090, RTX 4070 y superiores.
- Integración con el ecosistema Diffusers de Hugging Face mediante la clase `Flux2KleinPipeline`.
- Disponible en ComfyUI y a través de la API de Black Forest Labs (bfl.ai).

## Casos de uso

- Prototipado rápido de conceptos visuales: diseñadores y artistas pueden generar imágenes en tiempo real para iterar sobre ideas sin esperar largos tiempos de renderizado, gracias a la inferencia sub-segundo.
- Edición fotográfica interactiva: con la capacidad multi-referencia, un usuario puede cargar varias imágenes de referencia y aplicar cambios coherentes (por ejemplo, cambiar el fondo, la iluminación o los objetos) en un solo paso.
- Generación de variaciones de producto para e-commerce: se pueden crear múltiples versiones de un mismo producto con diferentes fondos o estilos a partir de una imagen base, acelerando la producción de catálogos.
- Asistentes creativos en tiempo real: integración en aplicaciones de diseño gráfico o suites de edición donde el modelo responde a comandos de texto mientras el usuario dibuja o selecciona regiones.
- Automatización de contenido para marketing: generación de imágenes para campañas publicitarias o redes sociales con alta velocidad, permitiendo pruebas A/B de creatividades en minutos.
- Entornos de despliegue edge o con GPU limitada: al requerir solo 13 GB de VRAM, puede ejecutarse en estaciones de trabajo con una única GPU de gama media, facilitando su uso en estudios pequeños o en entornos de producción con restricciones de hardware.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La documentación oficial menciona que el modelo ofrece "calidad de estado del arte" y "rendimiento superior a su tamaño", pero no se proporcionan métricas cuantitativas como FID, CLIP score u otras comparativas estándar en la información facilitada.

## Requisitos de hardware

- VRAM estimada: aproximadamente 13 GB para inferencia en precisión bf16.
- GPU recomendadas: NVIDIA RTX 3090, RTX 4070 o superiores (también compatible con A100, H100 en entornos de servidor).
- Es compatible con GPUs de consumo de gama media-alta, no requiere hardware de datacenter.
- Opciones de despliegue:
  - Diffusers (Python) mediante `Flux2KleinPipeline`, con soporte para `enable_model_cpu_offload()` para reducir uso de VRAM.
  - ComfyUI, para flujos de trabajo visuales.
  - API de Black Forest Labs (bfl.ai) para despliegue gestionado.
  - NVIDIA NIM (disponible en build.nvidia.com) como servicio optimizado.
- Latencia: el modelo está diseñado para generar en menos de un segundo con 4 pasos de inferencia en hardware adecuado (RTX 3090/4070 o superior). El throughput exacto no se ha especificado.

## Comparativa con modelos similares

No se dispone de datos comparativos directos con otros modelos en la información proporcionada. El modelo pertenece a la familia FLUX.2 de Black Forest Labs, que incluye otras variantes como FLUX.2-klein-base-4B (versión sin destilar, con mayor flexibilidad de entrenamiento) y modelos de mayor tamaño de la misma familia. No se han proporcionado métricas de rendimiento frente a alternativas como Stable Diffusion XL, SDXL Turbo o los modelos FLUX.1, por lo que no es posible establecer una comparativa cuantitativa fiable.

## Limitaciones y advertencias

- El modelo no está diseñado para proporcionar información factual; puede generar contenido inexacto o inventado.
- La renderización de texto dentro de las imágenes puede ser imprecisa o sufrir distorsiones.
- Como modelo estadístico, puede reflejar o amplificar sesgos presentes en los datos de entrenamiento.
- El seguimiento de instrucciones depende en gran medida del estilo de prompting; puede fallar en generar resultados que coincidan exactamente con la petición.
- La licencia Apache 2.0 permite uso comercial, pero se establecen restricciones de uso fuera de alcance: no se permite generar contenido ilegal, explotación de menores, contenido engañoso, información personal identificable dañina, acoso, imágenes íntimas no consentidas o pornografía ilegal, ni su uso en toma de decisiones automatizadas de alto riesgo.
- El modelo solo está etiquetado para inglés; el rendimiento en otros idiomas no está garantizado.
- Para producción, se recomienda implementar filtros adicionales de moderación de contenido, ya que las mitigaciones del autor no eliminan por completo los riesgos residuales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/black-forest-labs/FLUX.2-klein-4B
- Blog oficial de Black Forest Labs: https://bfl.ai/blog/flux2-klein-towards-interactive-visual-intelligence
- Página del modelo en BFL: https://bfl.ai/models/flux-2-klein
- Repositorio oficial de inferencia en GitHub: https://github.com/black-forest-labs/flux2
- Variante base sin destilar: https://huggingface.co/black-forest-labs/FLUX.2-klein-base-4B
- NVIDIA NIM (servicio gestionado): https://build.nvidia.com/black-forest-labs/flux_2-klein-4b
