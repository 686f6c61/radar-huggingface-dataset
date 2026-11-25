# neurocraftart/ernie-image-turbo

## Resumen

ERNIE-Image Turbo es un modelo de generación de imágenes desarrollado originalmente por Baidu, distribuido aquí como un espejo cuantizado por Mike Prass (cuantización LowVRAM w4a8 / int8 con "convrot") y reempaquetado por el usuario neurocraftart para los instaladores de NeuroCraft Studio. El repositorio no contiene el modelo en su formato original, sino una versión optimizada para ejecutarse en entornos con VRAM limitada, empaquetada junto con un VAE (flux2-vae) y un modelo de texto auxiliar (ministral-3-3b).

El paquete incluye tres artefactos en formato safetensors: el modelo de difusión cuantizado a w4a8 (aproximadamente 4,79 GB), el VAE flux2-vae (aproximadamente 336 MB) y el codificador de texto ministral-3-3b cuantizado a int8 (aproximadamente 4,29 GB). El tamaño total del repositorio es de 9,4 GB.

La relevancia de esta ficha es limitada: se trata de un espejo de terceros, sin model card técnica detallada, sin benchmarks publicados y con cero descargas. La información disponible sobre arquitectura, entrenamiento y rendimiento del modelo original es escasa en los datos proporcionados, por lo que muchos campos se indican como "no disponible".

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de difusión para generación de imágenes, según el nombre y los artefactos incluidos) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | w4a8 (modelo principal), int8 (codificador de texto ministral-3-3b), según la model card |
| Idiomas soportados | no disponible |
| Licencia | other / same-as-original (se remite a la licencia del modelo original de Baidu y de la release cuantizada) |
| Formato de pesos | safetensors |
| Tamaño del repositorio | 9,4 GB |
| Artefactos incluidos | ernie-image-turbo_w4a8_convrot.safetensors (4.786.791.108 bytes), flux2-vae.safetensors (336.211.292 bytes), ministral-3-3b_int8_convrot.safetensors (4.293.377.103 bytes) |
| Pipeline declarado | no disponible |
| Compatibilidad declarada | ComfyUI, etiqueta lowvram |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo original ERNIE-Image Turbo en los datos proporcionados. Por el nombre y por los artefactos incluidos (un modelo principal de aproximadamente 4,79 GB y un VAE flux2-vae), se deduce que se trata de un modelo de difusión para generación de imágenes, pero no se especifica si emplea un transformer de difusión (DiT), un UNet o una variante híbrida, ni el número de parámetros del modelo original.

Tampoco se detallan los datos de entrenamiento (número de tokens, composición del dataset, uso de RLHF/DPO), ni innovaciones técnicas como decodificación especulativa o atención lineal. La única información técnica concreta es la relativa al proceso de cuantización: el modelo principal se ha cuantizado a w4a8 con una técnica denominada "convrot" por Mike Prass, y el codificador de texto ministral-3-3b se ha cuantizado a int8. No se documenta el impacto de esta cuantización en la calidad de las imágenes generadas.

## Capacidades

- Generación de imágenes a partir de texto (text-to-image), según la naturaleza del modelo y su empaquetado con un VAE.
- Ejecución en entornos con VRAM limitada gracias a la cuantización w4a8 del modelo principal y a la etiqueta lowvram.
- Integración con ComfyUI, según las etiquetas del repositorio.
- Uso de un codificador de texto externo (ministral-3-3b en int8) para el procesamiento de prompts, aunque no se detalla cómo se articula con el modelo de difusión.
- No se documentan capacidades de edición de imagen, inpainting, outpainting, controlnet, tool calling, agentes, razonamiento multi-paso ni soporte multilingüe explícito.

## Casos de uso

- Generación de imágenes en estaciones de trabajo con GPU de gama media: la cuantización w4a8 reduce el peso del modelo principal a unos 4,79 GB, lo que permite cargarlo en GPUs consumer con 8-12 GB de VRAM, algo inviable con el modelo original sin cuantizar.
- Flujos de trabajo en ComfyUI: el repositorio está etiquetado como comfyui, por lo que puede integrarse en grafos de nodos para generar imágenes por lotes o como parte de pipelines de diseño.
- Prototipado rápido de ilustraciones y assets: útil para equipos que necesitan generar borradores visuales sin acceso a infraestructura de datacenter.
- Instalaciones empaquetadas de NeuroCraft Studio: el repositorio se distribuye como mirror para los instaladores de NeuroCraft Studio, por lo que su caso de uso principal es servir como dependencia de esa distribución.
- Pruebas de concepto de generación de imágenes en local: al incluir el VAE y el codificador de texto en el mismo repositorio, simplifica el despliegue en entornos de investigación con recursos limitados.
- Evaluación comparativa de cuantizaciones: permite a investigadores medir la pérdida de calidad de la cuantización w4a8 frente al modelo original, aunque no se publican métricas al respecto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo principal cuantizado ocupa aproximadamente 4,79 GB, el codificador de texto int8 aproximadamente 4,29 GB y el VAE aproximadamente 336 MB. En total, los pesos suman unos 9,4 GB, por lo que se necesita al menos esa cantidad de VRAM (o de memoria unificada/offloading) para cargar todos los artefactos simultáneamente.
- GPU recomendadas: no se especifican modelos concretos. Por el tamaño de los pesos, una GPU con 12-16 GB de VRAM (RTX 3060 12 GB, RTX 4070 Ti, RTX 4080) o superior debería poder alojar el conjunto; una RTX 4090 (24 GB) o A100/H100 ofrecerían margen adicional.
- Cabe en GPU consumer: sí, previsiblemente en modelos con 12 GB o más de VRAM, aunque no se confirma en la información disponible.
- Opciones de despliegue: ComfyUI (etiqueta explícita del repositorio). No se confirma compatibilidad con vLLM, llama.cpp, Ollama o TGI, que no son adecuados para modelos de difusión de este tipo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de rendimiento ni especificaciones del modelo original que permitan una comparación rigurosa con alternativas de generación de imágenes como Stable Diffusion, FLUX o SDXL.

## Limitaciones y advertencias

- Es un espejo de terceros: el repositorio no lo mantiene el autor original (Baidu) ni el autor de la cuantización (Mike Prass), sino el usuario neurocraftart, para los instaladores de NeuroCraft Studio.
- La licencia es "other / same-as-original", lo que remite a los términos del modelo original de Baidu y de la release cuantizada. No se detallan las restricciones de uso comercial; es imprescindible consultar la licencia original antes de cualquier uso en producción.
- No se documentan sesgos conocidos, pero al ser un modelo de generación de imágenes entrenado con datos no especificados, es probable que herede sesgos de representación del dataset original.
- Riesgo de alucinación visual: no se han publicado evaluaciones de fidelidad prompt-imagen para esta versión cuantizada.
- La cuantización w4a8 puede degradar la calidad de las imágenes generadas frente al modelo original; no se aportan métricas que cuantifiquen esta pérdida.
- No se especifican los idiomas soportados en los prompts.
- El repositorio tiene cero descargas y cero likes, y fue creado y actualizado el mismo día (24 de noviembre de 2026), lo que sugiere que no ha sido validado por la comunidad.
- No se dispone de pipeline declarado en Hugging Face, lo que puede complicar la carga automática con librerías estándar.
- El codificador de texto ministral-3-3b se distribuye en int8; su integración exacta con el modelo de difusión no está documentada.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/neurocraftart/ernie-image-turbo
- Mirror original de la cuantización: https://huggingface.co/mikeprass/ernie-image-turbo
- Modelo original (ERNIE-Image Turbo, Baidu): no disponible en la información proporcionada.
