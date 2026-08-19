# mahadev-balla/isl-conditional-diffusion-cosine-64

## Resumen

El modelo `mahadev-balla/isl-conditional-diffusion-cosine-64` es un modelo de difusión condicional de clase (class-conditioned DDPM) entrenado desde cero para generar imágenes RGB de 64×64 píxeles de gestos manuales del Lenguaje de Señas Indio (ISL). Desarrollado por Mahadev Balla, el modelo utiliza una arquitectura UNet2D y soporta guiado sin clasificador (classifier-free guidance, CFG) durante el muestreo, lo que permite controlar la clase de gesto generado entre 35 categorías distintas.

El modelo resuelve el problema de la escasez de datos etiquetados en el dominio del lenguaje de señas, ofreciendo una vía para sintetizar imágenes sintéticas de gestos que pueden emplearse en el entrenamiento de sistemas de reconocimiento automático. Su relevancia radica en que combina una arquitectura de difusión estándar con un esquema de condicionamiento por clase, y está publicado bajo licencia MIT, lo que facilita su uso comercial y académico. Con aproximadamente 29,8 millones de parámetros y un tamaño de repositorio de 0,1 GB, es un modelo ligero y ejecutable en hardware modesto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DDPM con UNet2DModel |
| Parametros totales | 29.819.139 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no aplica (generacion de imagenes) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de vision, sin texto) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue el paradigma de los procesos de difusión denoising probabilísticos (DDPM). La red generadora es un UNet2DModel de la librería diffusers, que procesa imágenes de 64×64 píxeles en tres canales RGB. El entrenamiento incorpora condicionamiento por clase: cada muestra se etiqueta con una de las 35 clases de gestos ISL, y durante el entrenamiento se aplica un dropout del 15% en las etiquetas para habilitar el guiado sin clasificador (CFG) en la inferencia. Además, se utilizan pesos de media exponencial móvil (EMA) con un decay de 0,9999, lo que mejora la estabilidad y calidad de las muestras generadas.

El dataset de entrenamiento consta de 42.000 imágenes (1.200 por clase × 35 clases), con un esquema de ruido coseno (cosine schedule) y 1.000 pasos de difusión. El entrenamiento se realizó con un batch size de 128, una tasa de aprendizaje de 1e-4, precisión mixta fp16 y 65.000 pasos de entrenamiento. Se aplicó aumentación de datos para mejorar la generalización. Durante el muestreo se recomienda el uso del sampler DDIM con 100 pasos de inferencia (50 en evaluación) y una escala de guiado (guidance scale) de 1,0, que según el autor es el valor óptimo para FID.

## Capacidades

- Generación de imágenes condicionada por clase: produce gestos manuales de 35 clases distintas del Lenguaje de Señas Indio.
- Guiado sin clasificador (CFG): permite ajustar la adherencia a la clase durante el muestreo mediante el parámetro `guidance_scale`.
- Muestreo eficiente con DDIM: soporta entre 50 y 100 pasos de inferencia, reduciendo el coste computacional frente a los 1.000 pasos de entrenamiento.
- Integración con diffusers: se puede cargar mediante `DDPMPipeline` o `DDIMPipeline`, lo que facilita su uso en pipelines existentes.
- Generación incondicional: aunque está diseñado para condicionamiento por clase, el dropout de etiquetas permite generar muestras sin clase si se omite la condición.
- Ligereza: con menos de 30 millones de parámetros, es adecuado para prototipado rápido y despliegue en entornos con recursos limitados.

## Casos de uso

- Aumentación de datasets para reconocimiento de lenguaje de señas: el modelo puede generar variaciones sintéticas de gestos ISL para ampliar conjuntos de entrenamiento de clasificadores, reduciendo el sobreajuste y mejorando la robustez ante condiciones de iluminación o fondo variables.
- Prototipado de sistemas de traducción de señas: investigadores pueden usar las imágenes generadas para validar arquitecturas de visión por computadora antes de disponer de datos reales etiquetados.
- Generación de datos para entrenamiento de modelos de segmentación o detección de manos: las imágenes sintéticas, junto con sus etiquetas de clase, sirven para entrenar modelos auxiliares que localizan y segmentan regiones de interés.
- Pruebas de concepto en educación y accesibilidad: se pueden crear materiales visuales sintéticos para aplicaciones educativas que enseñen gestos ISL, sin necesidad de grabar vídeo con actores.
- Benchmarking de modelos generativos: al ser un modelo pequeño y con métricas publicadas (FID y precisión semántica), es útil como referencia para comparar arquitecturas de difusión en dominios de baja resolución.
- Investigación en guiado sin clasificador: el modelo permite experimentar con distintos valores de `guidance_scale` y estudiar su efecto en la fidelidad y diversidad de las muestras, gracias a su bajo coste de inferencia.

## Benchmarks y rendimiento

Según la model card del autor, los resultados obtenidos con la escala de guiado óptima para FID (1,0) son:

| Metrica | Valor |
|---|---|
| FID (Fréchet Inception Distance) | 57,24 |
| Precision semantica (accuracy de clase) | 99,2% |

No se han publicado comparaciones con otros modelos en la información disponible. El FID de 57,24 indica una calidad de generación moderada, típica de modelos entrenados en datasets pequeños y resolución baja. La alta precisión semántica sugiere que el condicionamiento por clase funciona bien, aunque la diversidad visual podría ser limitada.

## Requisitos de hardware

- VRAM estimada: al ser un modelo de 29,8 millones de parámetros y entrada de 64×64, la inferencia en fp16 requiere aproximadamente 60 MB de VRAM, por lo que cabe en cualquier GPU moderna e incluso en CPU.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM (por ejemplo, NVIDIA GTX 1050 Ti, RTX 2060, o superiores). Para entrenamiento se necesitaría más VRAM, pero para inferencia es suficiente.
- Compatibilidad con hardware consumer: sí, funciona en GPUs de gama baja y también en CPU con tiempos de inferencia razonables (del orden de segundos por imagen).
- Opciones de despliegue: al estar basado en diffusers, puede ejecutarse con `DDPMPipeline` o `DDIMPipeline` de forma local. No se han reportado integraciones con vLLM, Ollama o TGI, ya que estos están orientados a modelos de lenguaje.
- Latencia y throughput: no se han publicado mediciones oficiales. Dado el tamaño, se estima una latencia de 1-2 segundos por imagen en GPU consumer y de 5-10 segundos en CPU con 100 pasos DDIM.

## Comparativa con modelos similares

El autor ha publicado otros modelos de difusión para ISL en el mismo repositorio, que pueden considerarse alternativas:

| Modelo | Resolucion | Schedule | Parametros | Contexto |
|---|---|---|---|---|
| `isl-conditional-diffusion-cosine-64` (este) | 64×64 | cosine | 29,8 M | 35 clases |
| `isl-conditional-diffusion-linear-128` | 128×128 | linear | no disponible | 35 clases |
| `isl-conditional-diffusion-cosine-128` | 128×128 | cosine | no disponible | 35 clases |

No se dispone de datos de rendimiento de los modelos de 128×128 para comparar directamente. Frente a modelos genéricos de difusión de baja resolución (como los entrenados en MNIST o CIFAR-10), este modelo se distingue por su condicionamiento por clase y su enfoque en un dominio específico (lenguaje de señas). No hay benchmarks comparativos públicos con otras arquitecturas.

## Limitaciones y advertencias

- Resolución limitada: genera imágenes de 64×64 píxeles, insuficiente para aplicaciones que requieran detalles finos de los gestos o texturas de la mano.
- Calidad visual moderada: el FID de 57,24 indica que las imágenes pueden presentar artefactos o falta de nitidez, especialmente en comparación con modelos de difusión modernos de mayor resolución.
- Dataset reducido y específico: entrenado solo con 42.000 imágenes de 35 clases, puede no generalizar bien a variaciones de gestos no representadas o a diferentes condiciones de captura.
- Sesgo potencial: el dataset proviene de una fuente concreta (no especificada), por lo que los gestos generados podrían reflejar sesgos de la población o estilo de captura original.
- Riesgo de alucinación visual: como todo modelo generativo, puede producir gestos que no corresponden exactamente a la clase solicitada, especialmente con escalas de guiado bajas.
- Sin soporte de texto: el modelo no acepta prompts de texto, solo índices de clase numéricos. No es adecuado para generación a partir de descripciones lingüísticas.
- Restricciones de uso: aunque la licencia MIT permite uso comercial, el modelo se distribuye sin garantías y el autor no ofrece soporte técnico. Los usuarios deben validar la calidad de las imágenes generadas para su caso de uso específico.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/mahadev-balla/isl-conditional-diffusion-cosine-64)
- [Repositorio GitHub del proyecto](https://github.com/MahadevBalla/isl-diffusion)
- [Modelo hermano: isl-conditional-diffusion-linear-128](https://huggingface.co/mahadev-balla/isl-conditional-diffusion-linear-128)
- [Modelo hermano: isl-conditional-diffusion-cosine-128](https://huggingface.co/mahadev-balla/isl-conditional-diffusion-cosine-128)
