# mahadev-balla/isl-conditional-diffusion-cosine-128

## Resumen

El modelo `mahadev-balla/isl-conditional-diffusion-cosine-128` es un modelo de difusión condicional de clase, entrenado desde cero para generar imágenes RGB de 128x128 píxeles que representan gestos de manos de la Lengua de Signos India (ISL). Está desarrollado por Mahadev Balla y se basa en la arquitectura DDPM con UNet2D de la librería `diffusers`. El modelo permite condicionar la generación sobre una de 35 clases de gestos y soporta guía sin clasificador (classifier-free guidance, CFG) durante el muestreo, lo que ofrece un control semántico sobre la salida.

El modelo se entrenó con un conjunto de datos de 42.000 imágenes (1.200 por clase, 35 clases) y un programa de ruido coseno. Incluye pesos EMA (decaimiento 0,9999) y dropout de etiquetas CFG de 0,15. Con un total de aproximadamente 118,9 millones de parámetros, es un modelo relativamente compacto, adecuado para experimentación en generación de imágenes condicionada por clases, especialmente en el ámbito de la lengua de signos. Su relevancia radica en ser una herramienta de referencia para la síntesis de gestos de ISL, con aplicaciones potenciales en sistemas de accesibilidad y aprendizaje automático de lengua de signos.

La ficha se basa en la información publicada en Hugging Face y en el repositorio de GitHub asociado. No se dispone de datos adicionales sobre cuantización, idiomas soportados o benchmarks externos más allá de los reportados por el autor.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DDPM con UNet2D (clase condicionada) |
| Parametros totales | 118.949.891 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no aplicable (modelo de generación de imágenes) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin cuantización publicada) |
| Idiomas soportados | no disponible (modelo visual, sin procesamiento de texto) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura DDPM (Denoising Diffusion Probabilistic Model) con una red UNet2D como backbone. La generación es condicional por clase: se incorpora una etiqueta de clase (una de 35 clases de gestos ISL) como entrada, y el modelo aprende a denoising imágenes de 128x128 píxeles en RGB. Se utiliza guía sin clasificador (CFG) durante el muestreo, con un factor de escala de guía por defecto de 3.0 y un dropout de etiquetas de 0.15 durante el entrenamiento para habilitar la CFG.

El entrenamiento se realizó con 42.000 imágenes (1.200 por clase × 35 clases), un programa de ruido coseno, tamaño de lote de 64, tasa de aprendizaje de 1e-4, precisión mixta fp16, 65.000 pasos de entrenamiento, decaimiento EMA de 0.9999 y aumento de datos habilitado. El muestreo por defecto usa DDIM con 1.000 timesteps de difusión en entrenamiento, 100 pasos de inferencia rutinaria y 50 pasos para evaluación. Los pesos EMA están incluidos en el modelo final.

## Capacidades

- Generación de imágenes condicionada por clase: produce imágenes de 128x128 RGB de gestos de manos de ISL, con control sobre la clase (35 clases disponibles).
- Guía sin clasificador (CFG): permite ajustar la adherencia a la clase mediante el parámetro `guidance_scale` (por defecto 3.0).
- Muestreo eficiente con DDIM: soporta 50-100 pasos de inferencia, reduciendo el coste computacional frente a 1.000 pasos completos.
- Uso de pesos EMA: mejora la estabilidad y calidad de las muestras generadas.
- Integración con `diffusers`: se puede usar mediante `DDPMPipeline` o directamente con `UNet2DModel` y el scheduler DDIM.
- Reproducibilidad: se recomienda una semilla aleatoria (por defecto 42) para resultados consistentes.

## Casos de uso

- Generación de datos sintéticos para entrenamiento de sistemas de reconocimiento de lengua de signos: el modelo puede crear variaciones de gestos de ISL que amplíen conjuntos de datos limitados, mejorando la robustez de clasificadores o modelos de traducción.
- Prototipado de interfaces de accesibilidad: se pueden generar imágenes de gestos para diseñar y validar interfaces de comunicación para personas con discapacidad auditiva, sin necesidad de capturar nuevas imágenes.
- Aumento de datos en pipelines de visión por computador: las imágenes generadas pueden combinarse con datos reales para entrenar modelos de detección de manos o clasificación de gestos en entornos controlados.
- Educación y documentación: el modelo permite crear material visual de referencia para el aprendizaje de ISL, generando ejemplos de cada clase de gesto de forma controlada.
- Investigación en modelos generativos condicionados: sirve como base para estudiar el efecto de la CFG, programas de ruido (coseno vs. lineal) y la influencia del número de pasos de inferencia en la calidad y precisión semántica.
- Evaluación de métricas de calidad en generación de imágenes: con FID y precisión semántica reportados, puede utilizarse como punto de referencia en experimentos comparativos de modelos de difusión de pequeña escala.

## Benchmarks y rendimiento

El autor reporta los siguientes resultados en la model card, obtenidos con una escala de guía óptima de 3.0:

| Métrica | Valor |
|---|---|
| FID (Fréchet Inception Distance) | 86.73 |
| Precisión semántica (semantic accuracy) | 94.0% |

Estos valores se obtuvieron con 50 pasos de inferencia DDIM. El autor indica que el FID es comparable al de un baseline incondicional bajo la misma configuración de evaluación. No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: dado que el modelo tiene ~119 millones de parámetros y genera imágenes de 128x128, la inferencia es ligera. Con precisión fp16, el uso de memoria aproximado es inferior a 1 GB (los pesos en fp16 ocupan ~238 MB; en fp32 ~476 MB). Se puede ejecutar en cualquier GPU con al menos 2 GB de VRAM.
- GPU recomendadas: cualquier GPU moderna de consumo, como NVIDIA GTX 1060 (6 GB), RTX 2060, RTX 3060, o superiores. No se requiere hardware de datacenter.
- Compatibilidad con GPU de consumo: sí, el modelo cabe en prácticamente cualquier GPU con 4 GB o más, incluso en CPU para pruebas puntuales (aunque más lento).
- Opciones de despliegue: se puede usar con la librería `diffusers` de Hugging Face (pipeline `DDPMPipeline`), con `torch` y `safetensors`. También es posible exportar a ONNX o cuantizar con herramientas como `torch.quantization` o `optimum` para reducir aún más el tamaño.
- Latencia y throughput estimados: no se dispone de mediciones oficiales. En una GPU moderna (RTX 3060), generar una imagen de 128x128 con 50 pasos DDIM debería tomar del orden de 1-3 segundos. Con 100 pasos, el tiempo se duplica aproximadamente.

## Comparativa con modelos similares

El modelo se compara con su variante con programa de ruido lineal, `mahadev-balla/isl-conditional-diffusion-linear-128`, también disponible en Hugging Face. No se dispone de otros modelos de generación de gestos ISL en la información proporcionada.

| Modelo | Arquitectura | Parámetros | Resolución | Programa de ruido | FID | Precisión semántica |
|---|---|---|---|---|---|---|
| isl-conditional-diffusion-cosine-128 | DDPM + UNet2D | 118.9 M | 128x128 | Coseno | 86.73 | 94.0% |
| isl-conditional-diffusion-linear-128 | DDPM + UNet2D | 118.9 M (estimado) | 128x128 | Lineal | no disponible | no disponible |

Ambos modelos comparten la misma configuración general (35 clases, CFG, EMA) y difieren únicamente en el programa de ruido. No hay datos públicos de rendimiento para la variante lineal.

## Limitaciones y advertencias

- Sesgos conocidos: el modelo se entrenó con un conjunto de datos específico de gestos ISL (42.000 imágenes). Puede no generalizar a variantes regionales de lengua de signos, gestos no incluidos en las 35 clases o condiciones de iluminación/fondo diferentes a las del dataset de entrenamiento.
- Riesgo de alucinación: aunque la precisión semántica es alta (94%), existe un 6% de probabilidad de que la clase generada no corresponda exactamente al gesto solicitado. Se recomienda validar las muestras en aplicaciones críticas.
- Limitaciones de contexto o idioma: al ser un modelo visual, no procesa texto ni audio. La condición se introduce mediante un índice de clase numérico, no mediante lenguaje natural.
- Restricciones de licencia: la licencia MIT permite uso comercial y modificación sin restricciones, pero el autor no ofrece garantías sobre la calidad o idoneidad para fines específicos.
- Caveat para producción: el FID de 86.73 es relativamente alto en comparación con modelos de difusión de última generación (que suelen tener FID < 10 en datasets estándar como CIFAR-10). Esto sugiere que la calidad perceptual de las imágenes generadas puede ser limitada y no adecuada para uso directo en aplicaciones de usuario final sin postprocesado o filtrado adicional.
- Dependencia de la semilla: los resultados son sensibles a la semilla aleatoria. Para reproducibilidad, se debe fijar `seed=42` como se indica en la documentación.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mahadev-balla/isl-conditional-diffusion-cosine-128
- Repositorio GitHub: https://github.com/MahadevBalla/isl-diffusion
- Variante con programa de ruido lineal: https://huggingface.co/mahadev-balla/isl-conditional-diffusion-linear-128
- Documentación de `diffusers` para pipelines de difusión: https://huggingface.co/docs/diffusers/index
