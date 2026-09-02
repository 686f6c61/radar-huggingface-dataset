# Plana-Chan/PinkCherry_NSFW_LTX23

## Resumen

PinkCherry_NSFW_LTX23 es un checkpoint de generación de vídeo fine-tuneado a partir del modelo base LTX-2.3 de Lightricks, desarrollado por el usuario Plana-Chan. Está diseñado específicamente para producir contenido audiovisual explícito (NSFW) con calidad mejorada, soportando tanto text-to-video (T2V) como image-to-video (I2V). El modelo se distribuye bajo licencia Apache 2.0, lo que permite uso comercial y modificación, aunque su naturaleza explícita lo restringe a audiencias adultas y a contextos legales apropiados.

Con 21.005.004.544 parámetros (aproximadamente 21B), el modelo se ofrece en múltiples formatos de cuantización (GGUF, fp8_scaled, bf16 e int8) para adaptarse a distintos requisitos de hardware. La versión 1.8 incluye un workflow actualizado con prompts negativos de vídeo y audio, y se complementa con un LoRA destilado y un text encoder "uncensored" basado en Gemma-3-12B, ambos enlazados desde la propia model card. Aunque el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, su integración con el ecosistema LTX-2.3 lo hace relevante para quienes buscan alternativas open-weight en generación de vídeo con contenido adulto.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Basado en LTX-2.3 (arquitectura interna no especificada) |
| Parametros totales | 21.005.004.544 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | GGUF, fp8_scaled, bf16, int8 |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors, GGUF, fp8_scaled, bf16, int8 |

## Arquitectura y entrenamiento

El modelo es un checkpoint derivado de LTX-2.3, la generación anterior del modelo de vídeo de Lightricks, que se caracteriza por tener pesos abiertos, audio sincronizado y soporte nativo de vídeo en formato vertical. No se han publicado detalles sobre la arquitectura interna (tipo de transformer, mecanismos de atención, etc.) en la información proporcionada. El fine-tuning se ha realizado específicamente para contenido NSFW, lo que implica un ajuste de los pesos del modelo base para optimizar la generación de escenas explícitas con mayor coherencia visual y temporal.

No se dispone de información sobre el dataset de entrenamiento, el número de tokens o pasos de entrenamiento, ni sobre el uso de técnicas como RLHF o DPO. La model card menciona la disponibilidad de un LoRA destilado y un text encoder "uncensored" basado en Gemma-3-12B, ambos alojados en el repositorio de Lightricks, lo que sugiere que el fine-tuning puede haber utilizado estos componentes para mejorar la adherencia a prompts explícitos y la calidad del texto generado.

## Capacidades

- Generación de vídeo a partir de texto (T2V) y a partir de imágenes (I2V), con salida en formato vertical nativo.
- Audio sincronizado con el vídeo generado, una característica heredada de LTX-2.3.
- Especializado en contenido NSFW, con optimización para escenas explícitas y prompts de naturaleza sexual.
- Soporte de prompts negativos de vídeo y audio en el workflow v1.8, lo que permite refinar la generación y evitar artefactos no deseados.
- Compatibilidad con cuantizaciones GGUF, fp8_scaled, bf16 e int8, facilitando el despliegue en GPUs con distinta VRAM.
- Integración con el ecosistema ComfyUI, según los resultados de búsqueda, lo que permite su uso en flujos de trabajo visuales.
- No se han documentado capacidades de tool calling, agentes o razonamiento multi-paso, ya que es un modelo de generación de vídeo, no un LLM conversacional.

## Casos de uso

- Producción de contenido para plataformas de streaming para adultos: el modelo permite generar vídeos explícitos personalizados a partir de descripciones textuales, reduciendo costes de producción y acelerando el flujo de trabajo en estudios especializados.
- Creación de arte erótico digital: artistas pueden usar T2V para materializar conceptos visuales explícitos con coherencia temporal, sirviendo como base para animaciones o ilustraciones en movimiento.
- Personalización de experiencias de realidad virtual: el modelo puede generar vídeos verticales inmersivos para entornos VR, adaptados a preferencias específicas del usuario final.
- Investigación en generación de vídeo con contenido sensible: académicos y desarrolladores pueden estudiar el comportamiento de modelos fine-tuneados en dominios restringidos, analizando sesgos, calidad y limitaciones éticas.
- Pruebas de integración en pipelines de generación de vídeo: al ser compatible con ComfyUI y formatos GGUF, se puede integrar en sistemas de automatización para evaluar la calidad de salida en diferentes cuantizaciones.
- Desarrollo de herramientas de moderación de contenido: paradójicamente, el modelo puede usarse como generador de ejemplos para entrenar clasificadores de contenido NSFW, ayudando a mejorar sistemas de filtrado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No existen datos sobre métricas como FVD, CLIP score, o comparaciones con otros modelos de generación de vídeo en la model card ni en los resultados de búsqueda.

## Requisitos de hardware

- El tamaño del repositorio es de 572.6 GB, lo que indica que el modelo completo en alta precisión (bf16) ocupa aproximadamente 42 GB (21B parámetros × 2 bytes). Las versiones cuantizadas reducen este requisito: fp8 (~21 GB), int8 (~21 GB) y GGUF Q4 (~10-12 GB, estimación típica para 21B).
- Para inferencia en bf16 o fp8, se recomienda una GPU con al menos 24 GB de VRAM, como NVIDIA RTX 3090/4090, A100 o H100. Para GGUF Q4, una GPU con 16 GB (RTX 4080, RTX 3080 Ti) podría ser suficiente, aunque la generación de vídeo de alta resolución puede requerir más memoria.
- El despliegue puede realizarse mediante ComfyUI, que es el entorno más documentado en los resultados de búsqueda, o mediante herramientas compatibles con GGUF como llama.cpp (aunque este modelo no es un LLM, su formato GGUF sugiere que puede cargarse con backends adaptados).
- No se han proporcionado datos de latencia o throughput. La generación de vídeo es computacionalmente intensiva; se espera que la generación de clips de pocos segundos tome varios minutos incluso en GPUs de gama alta, dependiendo de la resolución y el número de frames.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa con otros modelos de generación de vídeo NSFW. El modelo base LTX-2.3 es el único punto de referencia claro, pero no se han publicado métricas comparativas. Se recomienda consultar el repositorio de LTX-2.3 para obtener datos de rendimiento del modelo original, aunque el fine-tuning NSFW puede alterar significativamente las capacidades.

## Limitaciones y advertencias

- Contenido explícito: el modelo está diseñado exclusivamente para generar material NSFW, lo que lo hace inadecuado para entornos laborales, menores de edad o contextos donde dicho contenido sea ilegal o esté mal visto.
- Sesgos y alucinaciones: al ser un fine-tuning de un modelo base, puede heredar sesgos de género, raza o estereotipos sexuales presentes en los datos de entrenamiento. No se han documentado medidas de mitigación.
- Riesgo de alucinación visual: como todo modelo generativo, puede producir artefactos, distorsiones anatómicas o incoherencias temporales, especialmente en escenas complejas o con múltiples sujetos.
- Restricciones legales: aunque la licencia Apache 2.0 permite uso comercial, la distribución de contenido NSFW generado puede estar sujeta a regulaciones locales (por ejemplo, leyes de consentimiento, edad, o plataformas de alojamiento). El usuario es responsable de cumplir la legislación aplicable.
- Falta de soporte oficial: el modelo tiene 0 descargas y 0 likes, lo que sugiere que no ha sido validado por la comunidad. No hay garantías de estabilidad, mantenimiento o corrección de errores.
- Dependencia de componentes externos: el LoRA destilado y el text encoder "uncensored" están alojados en el repositorio de Lightricks, que podría cambiar o eliminar estos archivos, afectando la reproducibilidad del modelo.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Plana-Chan/PinkCherry_NSFW_LTX23
- Modelo base LTX-2.3 (Lightricks): https://ltx.io/model/ltx-2-3
- Guía sobre LTX 2.3 NSFW: https://ltx23.video/blog/ltx-2-3-nsfw
- Modelos LTX 2.5 y 2.3 para ComfyUI por VRAM: https://ltxworkflow.com/models
- Página de modelos pinkcherry en Civitai: https://civitai.com/tag/pinkcherry
