# biali/LTX-Video-gguf

## Resumen

LTX-Video es un modelo de generación de vídeo basado en arquitectura DiT (Diffusion Transformer) desarrollado por Lightricks, que destaca por su capacidad de generar vídeo de alta calidad en tiempo real. La versión aquí descrita, `biali/LTX-Video-gguf`, es una conversión directa a formato GGUF realizada por city96, pensada para su uso con el nodo personalizado ComfyUI-GGUF. Esta conversión no es un fine-tuning, por lo que mantiene las mismas capacidades y restricciones de licencia que el modelo original.

El modelo base tiene aproximadamente 1.923 millones de parámetros (1.9B), lo que lo sitúa en un rango relativamente compacto para generación de vídeo, permitiendo su ejecución en hardware de consumo con las cuantizaciones adecuadas. Soporta generación de vídeo a partir de texto (text-to-video) y a partir de imágenes (image-to-video), con resoluciones de hasta 1216×704 píxeles a 30 FPS en tiempo real según la documentación oficial. La conversión GGUF facilita el despliegue en entornos con recursos limitados, aunque se recomienda consultar la licencia original de Lightricks antes de cualquier uso comercial.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DiT (Diffusion Transformer) |
| Parametros totales | 1.923.385.472 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de vídeo, no de texto) |
| Tipos de cuantizacion | GGUF (varias cuantizaciones, no especificadas en la ficha) |
| Idiomas soportados | en (inglés) |
| Licencia | other (consultar licencia original de Lightricks) |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

LTX-Video es un modelo de difusión basado en transformadores (DiT) diseñado específicamente para generación de vídeo. Según la documentación oficial, es el primer modelo de este tipo capaz de generar vídeo de alta calidad en tiempo real, produciendo secuencias de 30 FPS a resolución 1216×704 más rápido de lo que tardan en reproducirse. El modelo fue entrenado sobre un gran conjunto de datos de vídeos diversos, aunque no se han publicado detalles específicos sobre el número de tokens, composición exacta del dataset o técnicas de alineación como RLHF o DPO.

La conversión GGUF mantiene la arquitectura original, pero los pesos se cuantizan para reducir el uso de memoria y acelerar la inferencia en GPUs de consumo. Esta cuantización puede introducir una ligera pérdida de calidad, pero permite ejecutar el modelo en hardware más modesto. El modelo original de Lightricks también incorpora capacidades de generación de audio sincronizado en versiones posteriores, pero la versión base aquí referenciada se centra en vídeo.

## Capacidades

- Generación de vídeo a partir de texto (text-to-video) y a partir de imágenes (image-to-video).
- Generación de vídeo en tiempo real a 30 FPS con resolución 1216×704.
- Soporte para múltiples modos de rendimiento (según la versión original, aunque no se detallan en la conversión GGUF).
- Capacidad de generar contenido visual diverso y realista gracias al entrenamiento en un gran corpus de vídeos.
- No se han documentado capacidades de tool calling, agentes o razonamiento multi-paso, ya que es un modelo puramente generativo de vídeo.
- Idioma principal: inglés (los prompts se procesan en inglés).

## Casos de uso

- Creación de prototipos visuales: los diseñadores pueden generar vídeos de concepto a partir de descripciones textuales para validar ideas antes de la producción final.
- Generación de contenido para redes sociales: creación rápida de clips cortos y atractivos para plataformas como TikTok o Instagram Reels, usando prompts en inglés.
- Asistencia en producción audiovisual: los cineastas pueden previsualizar escenas o efectos visuales mediante la generación de vídeo a partir de storyboards o imágenes de referencia.
- Educación y formación: generación de material didáctico en vídeo a partir de guiones, facilitando la creación de lecciones visuales.
- Pruebas de concepto en publicidad: los equipos de marketing pueden generar anuncios de prueba para evaluar narrativas visuales antes de invertir en producción real.
- Investigación en generación de vídeo: los investigadores pueden utilizar el modelo como base para experimentos de fine-tuning o comparación de arquitecturas, gracias a su tamaño moderado y disponibilidad en formato GGUF.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La documentación oficial menciona la capacidad de generar vídeo en tiempo real, pero no proporciona métricas cuantitativas como FID, CLIP score o comparativas con otros modelos. Se recomienda consultar el repositorio original de Lightricks para posibles actualizaciones.

## Requisitos de hardware

- VRAM estimada: depende de la cuantización y la resolución de salida. Con 1.9B parámetros, en FP16 los pesos ocupan aproximadamente 3.8 GB, pero la generación de vídeo requiere memoria adicional para activaciones y contexto. Con cuantizaciones GGUF (por ejemplo, Q4 o Q5), el uso de VRAM puede reducirse a 2-3 GB para los pesos, aunque la resolución y el número de fotogramas influyen significativamente.
- GPU recomendadas: tarjetas de consumo como RTX 3060 (12 GB), RTX 4070 o superiores pueden ejecutar el modelo con cuantizaciones bajas. Para resoluciones altas o generación en tiempo real, se recomienda al menos 16 GB de VRAM (RTX 4080/4090) o GPUs profesionales como A100.
- Compatibilidad con consumer GPU: sí, especialmente con cuantizaciones GGUF y resoluciones moderadas.
- Opciones de despliegue: el formato GGUF está diseñado para usarse con el nodo ComfyUI-GGUF en ComfyUI. También podría integrarse con otras herramientas que soporten GGUF, aunque no se documentan alternativas específicas.
- Latencia y throughput: no disponible. La generación en tiempo real se menciona en la documentación oficial, pero no se proporcionan cifras concretas para la versión cuantizada.

## Comparativa con modelos similares

No se dispone de datos suficientes para una comparativa cuantitativa con otros modelos de generación de vídeo. LTX-Video se posiciona como un DiT de 1.9B parámetros, mientras que alternativas como AnimateDiff (basado en Stable Diffusion) o ModelScope suelen tener arquitecturas y tamaños diferentes. Sin datos de benchmarks públicos, no es posible establecer una comparación rigurosa. Se recomienda consultar el repositorio de Lightricks para más información.

## Limitaciones y advertencias

- Al ser una conversión GGUF, puede haber una degradación de calidad respecto al modelo original en FP16, especialmente en cuantizaciones agresivas.
- La licencia es "other" y se remite a la licencia original de Lightricks, que puede incluir restricciones de uso comercial. Es imprescindible revisar el archivo LICENSE.md del repositorio original antes de cualquier despliegue en producción.
- El modelo está entrenado principalmente en inglés; los prompts en otros idiomas pueden producir resultados subóptimos.
- No se han documentado sesgos específicos, pero al ser un modelo generativo de vídeo, puede reflejar sesgos presentes en los datos de entrenamiento.
- La generación de vídeo es computacionalmente intensiva; en hardware de consumo, la resolución y la duración del vídeo deben ajustarse para evitar desbordamientos de memoria.
- No se garantiza la ausencia de alucinaciones visuales o artefactos, especialmente en escenas complejas o prompts ambiguos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/biali/LTX-Video-gguf
- Repositorio oficial de Lightricks: https://github.com/Lightricks/LTX-Video
- Conversión GGUF de city96: https://huggingface.co/city96/LTX-Video-gguf
- Guía de instalación en ComfyUI (artículo de dev.to): https://dev.to/gary_yan_86eb77d35e0070f5/how-to-install-and-configure-ltx-2-gguf-models-in-comfyui-complete-2026-guide-1d3m
