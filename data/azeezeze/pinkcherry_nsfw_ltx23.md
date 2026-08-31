# azeezeze/PinkCherry_NSFW_LTX23

## Resumen

PinkCherry_NSFW_LTX23 es un checkpoint de generación de vídeo desarrollado por el usuario azeezeze, construido como un fine-tuning del modelo base LTX 2.3 de Lightricks. Está diseñado específicamente para producir contenido audiovisual de temática NSFW (no seguro para el trabajo) y se distribuye bajo licencia Apache 2.0, lo que permite uso comercial y modificación. El modelo cuenta con aproximadamente 21 000 millones de parámetros (21,005,004,544) y soporta tanto generación de vídeo a partir de texto (T2V) como a partir de imagen (I2V). Su relevancia radica en que ofrece una alternativa de código abierto para la creación de vídeo adulto, un nicho poco cubierto por los modelos comerciales, aunque su uso está restringido a audiencias adultas y conlleva consideraciones éticas y legales.

El repositorio incluye versiones en distintos formatos de cuantización (GGUF, fp8_scaled, bf16 e int8) para adaptarse a diferentes capacidades de hardware. La versión 1.8 incorpora un flujo de trabajo actualizado con prompts negativos de vídeo y audio. Aunque el modelo se basa en LTX 2.3, no se proporcionan detalles técnicos adicionales sobre la arquitectura interna, el proceso de entrenamiento o los datos utilizados, más allá de la mención de un LoRA destilado y un codificador de texto "uncensored" basado en Gemma-3-12B.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (fine-tuning de LTX 2.3, arquitectura base no especificada) |
| Parametros totales | 21 005 004 544 (≈21B) |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF, fp8_scaled, bf16, int8 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (checkpoint), GGUF, fp8_scaled, bf16, int8 |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo. Se sabe que es un checkpoint fine-tuned a partir de LTX 2.3, un modelo de generación de vídeo de Lightricks, pero no se especifican los componentes (tipo de transformer, mecanismos de atención, etc.). El entrenamiento se realizó mediante fine-tuning sobre el modelo base, aunque no se indican los datos utilizados, el número de tokens de entrenamiento ni si se aplicaron técnicas como RLHF o DPO. La model card menciona la disponibilidad de un LoRA destilado (ltx-2.3-22b-distilled-lora-384-1.1.safetensors) y un codificador de texto "uncensored" basado en Gemma-3-12B, lo que sugiere que el modelo puede emplear estos componentes para mejorar la generación, pero no se aportan más detalles técnicos.

## Capacidades

- Generación de vídeo a partir de texto (T2V) y a partir de imagen (I2V), según la model card.
- Producción de contenido audiovisual de temática NSFW, con soporte para prompts negativos de vídeo y audio en la versión 1.8.
- Disponibilidad de versiones cuantizadas (GGUF, fp8_scaled, int8) para facilitar la inferencia en hardware con menos memoria.
- Integración con flujos de trabajo de ComfyUI (mencionado en la model card, aunque no se detalla).
- Posible uso de un codificador de texto alternativo "uncensored" (Gemma-3-12B) para mejorar la adherencia a prompts explícitos.
- No se documentan capacidades adicionales como tool calling, razonamiento multi-paso o soporte de agentes.

## Casos de uso

Dado que la información proporcionada no incluye casos de uso específicos, se proponen aplicaciones plausibles basadas en las capacidades generales del modelo base LTX 2.3 y en la naturaleza NSFW del fine-tuning. Estas propuestas son orientativas y no constituyen afirmaciones verificadas.

- Creación de contenido audiovisual para plataformas de entretenimiento para adultos: el modelo puede generar vídeos cortos a partir de descripciones textuales o imágenes de referencia, permitiendo a creadores producir material personalizado sin necesidad de equipos de filmación.
- Prototipado rápido de escenas para producción cinematográfica adulta: los directores pueden usar el modelo para visualizar escenas antes de la filmación real, ahorrando tiempo y costes de producción.
- Generación de vídeos educativos sobre salud sexual: aunque el contenido es NSFW, podría adaptarse para fines educativos con las restricciones adecuadas, siempre que se respeten las políticas de uso.
- Desarrollo de experiencias interactivas para adultos: el modelo puede integrarse en aplicaciones de realidad virtual o juegos que requieran generación dinámica de vídeo según las acciones del usuario.
- Investigación académica sobre generación de vídeo con contenido explícito: los investigadores pueden estudiar el comportamiento del modelo en dominios sensibles, siempre bajo protocolos éticos y legales.
- Pruebas de robustez y sesgos en modelos de generación de vídeo: el modelo sirve como caso de estudio para analizar cómo los fine-tunings específicos de dominio afectan a la calidad y a los sesgos del contenido generado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de métricas como MMLU, HumanEval, GSM8K o métricas específicas de generación de vídeo (FVD, IS, etc.) para este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia (basada en 21B parámetros, asumiendo arquitectura densa):
  - bf16: ~42 GB (necesita GPU profesional como A100 80GB o H100)
  - int8: ~21 GB (puede caber en RTX 4090 24GB o A6000 48GB)
  - GGUF Q4 (estimación): ~10-12 GB (podría ejecutarse en GPUs de consumo como RTX 3080/3090 con 10-24GB)
- GPU recomendadas: A100, H100, RTX 4090, RTX 3090, A6000, según la cuantización elegida.
- El tamaño del repositorio es de 572.6 GB, lo que indica que se incluyen múltiples versiones y archivos de gran tamaño; la descarga requiere espacio en disco considerable.
- Opciones de despliegue: no se especifican en la información, pero al ser un modelo de vídeo basado en LTX 2.3, es probable que sea compatible con ComfyUI, y las versiones GGUF pueden usarse con llama.cpp o herramientas similares, aunque no está confirmado.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (generación de vídeo NSFW). No se puede realizar una comparativa fiable.

## Limitaciones y advertencias

- Contenido explícito: el modelo está diseñado para generar material NSFW, lo que puede resultar ofensivo o inapropiado en muchos contextos. Su uso debe restringirse a audiencias adultas y cumplir con las leyes locales.
- Sesgos y alucinaciones: al ser un fine-tuning de un modelo base, puede heredar sesgos de los datos de entrenamiento y generar contenido incoherente o no deseado, especialmente en escenas complejas.
- Falta de documentación técnica: no se proporcionan detalles sobre el proceso de entrenamiento, los datos utilizados ni las limitaciones específicas, lo que dificulta evaluar su robustez en producción.
- Riesgo de mal uso: la naturaleza del contenido puede facilitar la creación de material no consentido o ilegal. Se recomienda implementar filtros y controles de uso.
- Compatibilidad: no se garantiza la compatibilidad con todas las versiones de ComfyUI u otras herramientas; se requiere verificar los requisitos del modelo base LTX 2.3.
- Licencia Apache 2.0: aunque permite uso comercial, el contenido generado puede estar sujeto a regulaciones adicionales sobre pornografía y derechos de autor.

## Enlaces

- [HuggingFace - azeezeze/PinkCherry_NSFW_LTX23](https://huggingface.co/azeezeze/PinkCherry_NSFW_LTX23)
- [LoRA destilado de LTX 2.3 (mencionado en la model card)](https://huggingface.co/Lightricks/LTX-2.3/blob/main/ltx-2.3-22b-distilled-lora-384-1.1.safetensors)
- [Blog sobre LTX 2.3 NSFW (referencia externa)](https://ltx23.video/blog/ltx-2-3-nsfw)
- [Guía de modelos LTX 2.3/2.5 para ComfyUI (referencia externa)](https://ltxworkflow.com/models)
