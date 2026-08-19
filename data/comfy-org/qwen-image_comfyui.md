# Comfy-Org/Qwen-Image_ComfyUI

## Resumen

Qwen-Image es un modelo de generación de imágenes por difusión, distribuido en este repositorio por Comfy-Org como un empaquetado optimizado para su uso directo en ComfyUI. El repositorio incluye los pesos del modelo de difusión en múltiples formatos de cuantización (bf16, fp8 y nvfp4), el codificador de texto Qwen2.5-VL-7B y el VAE correspondiente, todo en formato safetensors.

El modelo se distribuye bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones. Con más de 1,5 millones de descargas y 466 likes, es uno de los modelos de generación de imágenes más utilizados en el ecosistema ComfyUI. Incluye variantes destiladas (distill) y una variante etiquetada como "2512", además de múltiples opciones de cuantización para adaptarse a distintos requisitos de hardware.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Modelo de difusión (diffusion-single-file) |
| Parámetros totales | no disponible |
| Longitud de contexto | no aplica (generación de imágenes) |
| Tipos de cuantización | bf16, fp8_e4m3fn, fp8_hq, fp8mixed, nvfp4 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El repositorio contiene un modelo de difusión para generación de imágenes que utiliza Qwen2.5-VL-7B como codificador de texto, lo que permite una comprensión semántica avanzada de las instrucciones en lenguaje natural. El modelo incluye un VAE propio (qwen_image_vae.safetensors) para la codificación y decodificación latente.

Se ofrecen dos variantes principales: el modelo completo y una versión destilada (distill_full), así como una variante etiquetada como "2512", posiblemente relacionada con una resolución de generación superior. Los detalles exactos del entrenamiento (número de tokens, dataset, técnicas de alineación) no están disponibles en la información proporcionada.

## Capacidades

- Generación de imágenes a partir de descripciones textuales (text-to-image).
- Codificador de texto Qwen2.5-VL-7B para comprensión avanzada de prompts en lenguaje natural.
- Múltiples formatos de cuantización (bf16, fp8, nvfp4) para adaptarse a diferentes GPUs.
- Variante destilada para inferencia más rápida.
- Variante etiquetada como "2512", posiblemente de mayor resolución.
- Integración nativa con ComfyUI mediante archivos empaquetados listos para colocar en los directorios correspondientes.

## Casos de uso

- Generación artística en ComfyUI: el modelo se integra directamente en flujos de trabajo de ComfyUI, permitiendo a artistas y diseñadores generar imágenes de alta calidad sin necesidad de código adicional.
- Prototipado rápido de conceptos visuales: equipos de diseño pueden generar múltiples variaciones de un concepto a partir de prompts textuales, acelerando el proceso de ideación.
- Generación de imágenes para contenido editorial: la variante "2512" permite crear ilustraciones de gran tamaño para publicaciones impresas o digitales, si se confirma su mayor resolución.
- Experimentación con cuantizaciones: los múltiples formatos de pesos permiten probar el equilibrio entre calidad y requisitos de memoria en diferentes configuraciones de hardware.
- Desarrollo de pipelines de generación: al estar empaquetado para ComfyUI, es adecuado para construir flujos de trabajo complejos que combinen generación, postprocesado y otros nodos.
- Uso comercial: la licencia Apache 2.0 permite integrar el modelo en productos y servicios comerciales sin restricciones de licencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- El tamaño total del repositorio es de 301,6 GB, que incluye todas las variantes de cuantización y el codificador de texto.
- La variante bf16 del modelo de difusión requiere una GPU con gran cantidad de VRAM; los requisitos exactos no están disponibles en la información proporcionada.
- Las variantes fp8 y nvfp4 están diseñadas para reducir los requisitos de memoria, siendo adecuadas para GPUs con menos VRAM.
- El codificador de texto Qwen2.5-VL-7B en bf16 requiere aproximadamente 14 GB de VRAM adicionales (estimación basada en el tamaño de 7B parámetros).
- Se recomienda el uso de ComfyUI como plataforma de inferencia, ya que el modelo está empaquetado específicamente para este entorno.
- No se dispone de datos de latencia o throughput en la información proporcionada.

## Comparativa con modelos similares

No se dispone de datos comparativos en la información proporcionada. Como referencia general, Qwen-Image compite en el espacio de modelos de difusión texto-a-imagen de código abierto, junto a alternativas como Stable Diffusion 3.x o FLUX, aunque no se dispone de datos de rendimiento específicos para establecer una comparación cuantitativa.

## Limitaciones y advertencias

- No se dispone de información sobre sesgos conocidos o riesgos de alucinación en la información proporcionada.
- El repositorio es un empaquetado de pesos para ComfyUI; no incluye documentación sobre el entrenamiento del modelo original.
- La variante "2512" puede requerir hardware significativamente más potente si efectivamente genera a mayor resolución.
- Aunque la licencia es Apache 2.0, se recomienda revisar los términos de uso del modelo original de Qwen para confirmar cualquier restricción adicional.
- El uso en producción requiere validar la calidad de
