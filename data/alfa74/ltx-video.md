# Alfa74/LTX-Video

## Resumen

LTX-Video es un modelo de generación de vídeo basado en arquitectura DiT (Diffusion Transformer) desarrollado por Lightricks, que permite crear vídeos de alta resolución a partir de imágenes o texto. Este repositorio concreto, subido por el usuario Alfa74, contiene una versión del modelo con aproximadamente 1.900 millones de parámetros (1,92B), probablemente correspondiente a la variante destilada de 2B que se menciona en la documentación oficial. El modelo destaca por su capacidad de generar vídeo en tiempo real a 30 FPS con resolución 1216×704, algo poco común en los generadores de vídeo de código abierto.

La relevancia de LTX-Video radica en que combina generación rápida con calidad visual aceptable, y su arquitectura DiT lo hace escalable y compatible con herramientas del ecosistema HuggingFace como `diffusers`. Aunque el repositorio de Alfa74 no especifica la versión exacta, los pesos incluidos (1,92B) apuntan a la variante ligera, orientada a entornos con recursos limitados. La licencia es "other", por lo que es necesario revisar los términos específicos antes de un uso comercial.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Diffusion Transformer (DiT) |
| Parámetros totales | 1.923.385.472 |
| Parámetros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (el modelo procesa secuencias de vídeo, no texto; no se especifica número de frames) |
| Tipos de cuantización | no disponible (la documentación menciona versiones FP8, pero no se confirma para este repositorio) |
| Idiomas soportados | en (inglés) |
| Licencia | other (términos no especificados en la model card) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

LTX-Video emplea una arquitectura de Diffusion Transformer (DiT), que combina la capacidad de generación de los modelos de difusión con la escalabilidad de los transformers. Según la documentación oficial, el modelo fue entrenado sobre un conjunto de datos a gran escala con vídeos diversos, lo que le permite generar contenido realista y variado. No se han publicado detalles específicos sobre el número de tokens de entrenamiento, la composición exacta del dataset ni el uso de técnicas como RLHF o DPO. La versión destilada (que probablemente corresponde a estos pesos) utiliza destilación para acelerar la inferencia, sacrificando algo de calidad respecto al modelo completo de 13B.

El modelo soporta dos modos principales: texto a vídeo e imagen a vídeo. En el modo imagen a vídeo (que es el indicado en el pipeline de HuggingFace), parte de una imagen inicial y genera una secuencia de vídeo coherente a partir de ella. La generación en tiempo real se logra gracias a la destilación y a la optimización del proceso de muestreo, aunque los detalles técnicos exactos no están disponibles en este repositorio.

## Capacidades

- Generación de vídeo a partir de imágenes (image-to-video), con resolución nativa de hasta 1216×704 píxeles y 30 FPS.
- Generación de vídeo a partir de texto (text-to-video), según la documentación del repositorio oficial de Lightricks.
- Generación en tiempo real: el modelo produce vídeos más rápido de lo que tardan en reproducirse, lo que permite iteraciones rápidas.
- Soporte de múltiples modos de rendimiento: versiones destiladas (más rápidas, menor calidad) y versiones completas (mayor calidad, más recursos).
- Según el repositorio oficial de GitHub, versiones recientes incluyen audio sincronizado y generación a 4K nativa, aunque estas capacidades podrían no estar presentes en esta versión concreta de 1,9B.
- Integración con la librería `diffusers` de HuggingFace mediante la clase `LTXPipeline`, lo que facilita su uso en flujos de trabajo estándar.
- Compatibilidad con ComfyUI a través de flujos de trabajo proporcionados por Lightricks, lo que permite su uso en interfaces visuales.

## Casos de uso

- Creación de contenido para redes sociales: el modelo puede generar clips cortos de vídeo a partir de imágenes fijas, ideales para publicaciones en Instagram, TikTok o YouTube Shorts. Su velocidad en tiempo real permite producir múltiples variantes rápidamente.
- Prototipado de escenas para cine y animación: los directores pueden introducir un storyboard o una imagen conceptual y obtener una animación aproximada en segundos, acelerando el proceso de previsualización.
- Generación de fondos y loops para videojuegos: la capacidad de generar vídeo a partir de imágenes permite crear fondos animados o texturas en movimiento para entornos 3D, con la ventaja de que el resultado se puede iterar fácilmente.
- Automatización de vídeos de producto en e-commerce: a partir de una foto del producto, el modelo puede generar un breve vídeo mostrando el objeto desde diferentes ángulos o con movimiento, lo que mejora la presentación en tiendas online.
- Asistencia en educación y formación: generar vídeos explicativos simples a partir de diagramas o ilustraciones, facilitando la creación de material didáctico animado sin necesidad de habilidades avanzadas de edición.
- Investigación en generación de vídeo: al ser un modelo de código abierto con una arquitectura DiT, sirve como base para experimentación académica en síntesis de vídeo, comparación de técnicas de destilación o estudio de artefactos visuales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del repositorio no incluye métricas cuantitativas como FVD (Fréchet Video Distance) o IS (Inception Score), ni comparaciones con otros modelos. Tampoco se encuentran datos de rendimiento en términos de latencia o throughput en la documentación consultada.

## Requisitos de hardware

- VRAM estimada: al tratarse de un modelo de 1,9B parámetros en formato safetensors, la inferencia requiere al menos 8-12 GB de VRAM en precisión FP16, y algo menos si se cuantiza a FP8. Sin embargo, el tamaño del repositorio (208,8 GB) sugiere que contiene múltiples versiones o pesos en alta precisión, por lo que se recomienda verificar el contenido exacto antes de descargar.
- GPU recomendadas: para una experiencia fluida, se recomienda una GPU con al menos 16 GB de VRAM (por ejemplo, RTX 4080, RTX 4090, A100 40GB). Las GPUs de gama media como RTX 3060 o RTX 4060 podrían funcionar con cuantización FP8 y resoluciones reducidas, pero con tiempos de generación mayores.
- Opciones de despliegue: el modelo se puede ejecutar mediante la librería `diffusers` de HuggingFace, que ofrece una API sencilla para image-to-video. También es compatible con ComfyUI, que proporciona una interfaz gráfica y flujos de trabajo predefinidos. Para despliegue en servidores, se puede utilizar vLLM o TGI, aunque estos están más orientados a modelos de lenguaje; para vídeo, es más habitual usar scripts personalizados con PyTorch.
- Latencia y throughput: no se dispone de datos medidos. La documentación oficial afirma que el modelo original (13B) genera vídeo en tiempo real a 30 FPS en hardware de alta gama, pero la versión de 1,9B debería ser más rápida, aunque con menor calidad. Se recomienda probar en el hardware objetivo para obtener cifras concretas.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa cuantitativa con otros modelos de generación de vídeo. Sin embargo, se puede situar LTX-Video frente a alternativas conocidas:

| Modelo | Parámetros | Resolución máxima | FPS | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LTX-Video (este repo) | 1,9B | 1216×704 | 30 | other | HuggingFace |
| Stable Video Diffusion | 1,4B (aprox.) | 1024×576 | 14 | Stability AI Community License | HuggingFace |
| ModelScope Text-to-Video | 1,7B | 256×256 | 10 | Apache 2.0 | HuggingFace |

LTX-Video destaca por su mayor resolución y velocidad en comparación con ModelScope, y por su enfoque en tiempo real frente a Stable Video Diffusion, aunque la licencia "other" puede ser más restrictiva que la de sus competidores. No se dispone de datos de calidad visual comparativa.

## Limitaciones y advertencias

- Licencia "other": los términos exactos no están especificados en la model card. Es crucial revisar el repositorio oficial de Lightricks para conocer las restricciones de uso comercial, modificación y redistribución antes de utilizarlo en producción.
- Idioma: el modelo está entrenado principalmente con datos en inglés, por lo que las instrucciones de texto (si se usa text-to-video) funcionan mejor en ese idioma. Para image-to-video, el idioma no es un factor relevante.
- Sesgos en los datos de entrenamiento: al ser entrenado con vídeos de internet, el modelo puede reflejar sesgos culturales, de género o raciales presentes en los datos, lo que podría producir contenido estereotipado o inapropiado.
- Alucinaciones visuales: como todo modelo generativo, puede producir artefactos visuales, movimientos no físicos o inconsistencias en objetos y personas, especialmente en escenas complejas o con movimiento rápido.
- Limitaciones de contexto: al trabajar con secuencias de vídeo, el modelo tiene un número máximo de frames que puede generar en una sola pasada. No se especifica en la documentación, pero es probable que esté limitado a unos pocos segundos de vídeo por generación.
- Requisitos de almacenamiento: el repositorio ocupa 208,8 GB, lo que puede ser un obstáculo para su descarga y uso en entornos con espacio limitado.

## Enlaces

- Repositorio de HuggingFace: https://huggingface.co/Alfa74/LTX-Video
- Repositorio oficial de Lightricks (GitHub): https://github.com/Lightricks/LTX-Video
- Flujos de trabajo para ComfyUI: https://github.com/Lightricks/ComfyUI-LTXVideo
- Documentación de la librería `diffusers` (LTXPipeline): https://huggingface.co/docs/diffusers/main/en/api/pipelines/ltx_video
