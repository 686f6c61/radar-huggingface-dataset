# Catniti/catrex-1.0-image

## Resumen

Catrex 1.0 Image es un modelo de generación de texto a imagen especializado en retratos faciales, desarrollado por el usuario Catniti y publicado en Hugging Face. Se trata de un ajuste fino (fine-tuning) del modelo base `segmind/tiny-sd`, una versión reducida de Stable Diffusion, entrenado sobre 20.000 retratos con descripciones generadas automáticamente mediante LLaVA (dataset `irodkin/celeba_with_llava_captions`). El objetivo del modelo es producir caras humanas realistas a partir de descripciones en inglés sencillo, como género, edad, cabello o expresión.

El modelo está diseñado para funcionar con la librería `diffusers` y el pipeline `StableDiffusionPipeline`. Su UNet contiene 323 millones de parámetros, un tamaño modesto que permite su ejecución en GPUs de consumo. Sin embargo, su entrenamiento se limitó a 10 pasos, lo que sugiere un ajuste muy ligero sobre el modelo base. La resolución de generación óptima es de 192x192 píxeles, y el modelo tiene una limitación importante: solo genera caras, ignorando el contenido de prompts que no describan retratos.

A pesar de su nicho tan específico, el modelo resulta relevante como ejemplo de fine-tuning rápido y ligero para tareas concretas de generación facial, especialmente en entornos con recursos limitados. Su licencia `creativeml-openrail-m` permite uso comercial con ciertas restricciones.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Stable Diffusion (UNet + VAE + CLIP text encoder) basado en `segmind/tiny-sd` |
| Parametros totales | 323.384.964 (solo UNet, según safetensors) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (modelo de imagen) |
| Tipos de cuantizacion | No disponible (solo safetensors de precisión completa o fp16) |
| Idiomas soportados | Inglés (prompts en descripciones sencillas, según la model card) |
| Licencia | CreativeML OpenRAIL-M |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

El modelo parte de `segmind/tiny-sd`, una versión compacta de Stable Diffusion con un UNet reducido. El fine-tuning se realizó sobre el dataset `irodkin/celeba_with_llava_captions`, que contiene retratos del conjunto CelebA con descripciones generadas por LLaVA. Se utilizaron 20.000 imágenes con sus correspondientes captions en inglés. El entrenamiento se llevó a cabo durante solo 10 pasos, lo que indica un ajuste muy superficial sobre los pesos preentrenados, probablemente para adaptar la salida a la resolución de 192x192 y al dominio de caras.

No se menciona el uso de técnicas como RLHF o DPO; el entrenamiento es el estándar de difusión con pérdida de error cuadrático medio (MSE). La resolución de entrenamiento es de 192x192, inferior a los 512x512 típicos de Stable Diffusion, lo que explica la degradación de calidad a resoluciones más altas. No hay innovaciones arquitectónicas destacables; se trata de un fine-tuning convencional.

## Capacidades

- Generación de retratos faciales a partir de descripciones en inglés (género, edad, cabello, expresión, accesorios como gafas).
- Funciona con el pipeline `StableDiffusionPipeline` de `diffusers`, permitiendo control de pasos de inferencia y escala de guía.
- Generación a resolución fija de 192x192 píxeles; resoluciones superiores degradan la calidad.
- No soporta tool calling, agentes ni razonamiento multi-paso; es exclusivamente un modelo de imagen.
- No es multimodal en el sentido de aceptar imágenes de entrada; solo texto a imagen.
- El modelo ignora prompts que no describan personas y siempre genera caras, incluso si se pide un paisaje.

## Casos de uso

- Generación de avatares para perfiles de redes sociales o foros: se puede describir una persona ficticia y obtener un retrato en 192x192, adecuado para imágenes de perfil pequeñas.
- Creación de personajes para juegos de rol o prototipos de videojuegos: permite generar rápidamente retratos de personajes con rasgos específicos (edad, cabello, expresión) para concept art preliminar.
- Ilustración de historias o novelas visuales: el modelo puede producir retratos de personajes descritos en el texto, aunque con limitaciones de resolución y variedad.
- Pruebas de pipelines de generación de imágenes en entornos con pocos recursos: al ser un modelo pequeño, sirve como banco de pruebas para integrar difusión en aplicaciones ligeras.
- Generación de datos sintéticos para entrenar clasificadores de atributos faciales: se pueden crear variaciones de caras con etiquetas controladas (p. ej., "mujer joven con gafas") para aumentar datasets.
- Prototipado de aplicaciones de edición de retratos: aunque no edita imágenes existentes, puede generar caras de referencia para luego aplicar técnicas de manipulación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (FID, CLIP score, etc.) en la información disponible. La única métrica reportada es la pérdida MSE durante el entrenamiento, que alcanzó un valor de 0.1978. Esta métrica no es comparable con otros modelos sin un contexto de evaluación común. Por tanto, no se dispone de datos de rendimiento cuantitativo frente a alternativas.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1-2 GB en fp16, dado el tamaño del UNet (323M parámetros) y la resolución de 192x192. Con fp32, podría requerir unos 2-3 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM, como NVIDIA GTX 1650, RTX 3060, RTX 4060, o superiores. También puede ejecutarse en CPU, aunque con mayor latencia.
- Cabe en GPUs de consumo sin problemas; no requiere hardware de datacenter.
- Opciones de despliegue: mediante `diffusers` en Python, con soporte para `torch` y `cuda`. También podría convertirse a ONNX o TensorRT para optimización, aunque no se documenta. No hay soporte oficial para `llama.cpp` u Ollama, ya que no es un modelo de lenguaje.
- Latencia y throughput estimados: en una RTX 3060, la generación de una imagen de 192x192 con 30 pasos de inferencia podría tardar entre 1 y 3 segundos, dependiendo de la implementación. No se proporcionan cifras oficiales.

## Comparativa con modelos similares

No se dispone de datos comparativos con otros modelos de generación de caras en la información proporcionada. Como referencia, se puede comparar con su modelo base `segmind/tiny-sd`, que genera imágenes generales a 512x512 con 33M parámetros en el UNet (aunque la versión completa de tiny-sd tiene alrededor de 1.2B parámetros en total). Catrex 1.0 Image añade especialización en caras pero reduce la resolución y la versatilidad. Otras alternativas como `stabilityai/stable-diffusion-2-1` o modelos específicos de caras (p. ej., `runwayml/stable-diffusion-v1-5` con fine-tunes) son mucho más grandes y requieren más recursos. No se incluye una tabla comparativa por falta de datos de rendimiento.

## Limitaciones y advertencias

- El modelo solo genera caras; cualquier prompt que no describa a una persona producirá igualmente un retrato, lo que limita su uso a tareas específicas de retratos.
- La resolución máxima útil es 192x192; generar a resoluciones superiores (p. ej., 512x512) degrada notablemente la calidad y puede producir artefactos.
- El entrenamiento con solo 10 pasos sobre un subconjunto de datos puede provocar sobreajuste y poca variedad en las caras generadas, con riesgo de repetir patrones del dataset CelebA.
- No se han evaluado sesgos de género, edad o etnia; el dataset CelebA tiene sesgos conocidos hacia caras occidentales y jóvenes, lo que puede reflejarse en las salidas.
- Riesgo de alucinación visual: pueden aparecer deformidades faciales, ojos asimétricos o texturas irreales, especialmente con prompts complejos o fuera de dominio.
- Licencia CreativeML OpenRAIL-M: permite uso comercial, pero prohíbe usos ilegales o dañinos, y exige redistribuir bajo la misma licencia si se modifica el modelo.
- No hay soporte para otros idiomas en los prompts; las descripciones deben estar en inglés para obtener resultados coherentes.
- El modelo no dispone de mecanismos de seguridad (safety checker desactivado en el ejemplo de código), por lo que podría generar contenido inapropiado si se le pide explícitamente.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/Catniti/catrex-1.0-image)
- [Dataset utilizado: irodkin/celeba_with_llava_captions](https://huggingface.co/datasets/irodkin/celeba_with_llava_captions)
- [Modelo base: segmind/tiny-sd](https://huggingface.co/segmind/tiny-sd)
