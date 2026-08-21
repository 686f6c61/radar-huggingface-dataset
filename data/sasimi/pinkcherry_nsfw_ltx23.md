# sasimi/PinkCherry_NSFW_LTX23

## Resumen

PinkCherry_NSFW_LTX23 es un checkpoint de generación de vídeo desarrollado por el usuario sasimi, construido como un fine-tuning del modelo base LTX 2.3 de Lightricks. Está diseñado específicamente para producir contenido audiovisual sin filtros de seguridad, orientado a un público adulto (etiquetado como NSFW y NFAA). El modelo soporta tanto generación de vídeo a partir de texto (T2V) como a partir de imagen (I2V), y se distribuye bajo licencia Apache 2.0, lo que permite uso comercial con ciertas condiciones.

Con aproximadamente 21 000 millones de parámetros (21 005 004 544), el modelo requiere recursos de hardware considerables. El repositorio ocupa 600,8 GB e incluye versiones en distintos formatos de cuantización (GGUF, fp8_scaled, bf16 e int8), lo que facilita su despliegue en entornos con restricciones de memoria. La relevancia actual de este modelo radica en la creciente demanda de herramientas de generación de vídeo personalizadas y sin restricciones, aunque su uso plantea importantes consideraciones éticas y legales.

La model card es escasa en detalles técnicos, pero confirma que se trata de un checkpoint fine-tuned sobre LTX 2.3, con soporte para LoRA destilado y un text encoder alternativo "sin censura" basado en Gemma-3-12B. No se proporcionan datos sobre el dataset de entrenamiento ni sobre métricas de rendimiento.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Basado en LTX 2.3 (difusión para vídeo, T2V e I2V) |
| Parametros totales | 21 005 004 544 (21B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF, fp8_scaled, bf16, int8 |
| Idiomas soportados | no disponible (probablemente multilingüe vía text encoder, sin confirmar) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, GGUF, otros (según versión) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura de LTX 2.3, un sistema de generación de vídeo por difusión desarrollado por Lightricks. LTX 2.3 emplea un enfoque de difusión latente para sintetizar secuencias de vídeo coherentes a partir de condiciones textuales o visuales. PinkCherry_NSFW_LTX23 es un fine-tuning de este modelo base, lo que implica que se ha ajustado con datos específicos para eliminar o reducir los filtros de seguridad y optimizar la generación de contenido explícito.

No se han publicado detalles sobre el proceso de entrenamiento: ni el número de tokens, ni la composición del dataset, ni si se emplearon técnicas como RLHF o DPO. La model card menciona la disponibilidad de un LoRA destilado (ltx-2.3-22b-distilled-lora-384-1.1.safetensors) y de un text encoder alternativo "sin censura" basado en Gemma-3-12B, lo que sugiere que el modelo puede combinarse con estos componentes para mejorar la fidelidad o la adherencia a las indicaciones. No se indica si se utilizó decodificación especulativa u otras innovaciones técnicas.

## Capacidades

- Generación de vídeo a partir de texto (T2V) y a partir de imagen (I2V).
- Generación de contenido explícito para adultos, sin filtros de seguridad (NSFW).
- Soporte para LoRA destilado, que puede reducir la carga computacional o mejorar la calidad.
- Compatibilidad con un text encoder alternativo (Gemma-3-12B) para una interpretación más libre de las indicaciones.
- No se menciona soporte para tool calling, agentes o razonamiento multi-paso.
- Capacidades multilingües no confirmadas; dependen del text encoder subyacente.

## Casos de uso

- Creación de contenido audiovisual para plataformas de entretenimiento para adultos: el modelo permite generar escenas personalizadas a partir de descripciones textuales o imágenes de referencia, lo que facilita la producción de material bajo demanda.
- Prototipado de escenas para producción cinematográfica o de animación: los cineastas pueden usar el modelo para visualizar rápidamente ideas de escenas explícitas antes de la producción real, ahorrando tiempo y recursos.
- Generación de material educativo sobre sexualidad humana: en contextos controlados y legales, el modelo podría emplearse para ilustrar conceptos anatómicos o fisiológicos, siempre que se cumplan las normativas aplicables.
- Desarrollo de experiencias interactivas para adultos: integración en aplicaciones o juegos que requieran generación dinámica de vídeo explícito según las acciones del usuario.
- Investigación académica sobre generación de vídeo sin restricciones: el modelo sirve como caso de estudio para analizar el comportamiento de los sistemas de difusión cuando se eliminan los filtros de seguridad.
- Pruebas de robustez y alineación: los investigadores pueden utilizar este modelo para evaluar los riesgos de los generadores de vídeo sin moderación y desarrollar contramedidas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos sobre métricas como FVD, IS, CLIP score u otras habituales en generación de vídeo. Tampoco se ofrecen comparativas con otros modelos similares.

## Requisitos de hardware

- VRAM estimada: para la versión fp8_scaled, se estima un consumo de aproximadamente 21 GB (dado el tamaño de parámetros), lo que podría caber en una GPU de 24 GB con optimizaciones. La versión bf16 requeriría alrededor de 42 GB, necesitando GPUs de 48 GB o múltiples GPUs. La versión int8 podría reducir el consumo a unos 21 GB adicionales, pero no hay cifras oficiales.
- GPU recomendadas: para fp8, una RTX 4090 (24 GB) o A100 de 40 GB; para bf16, A100 de 80 GB o H100. Para GGUF, se puede usar llama.cpp con offloading a CPU.
- En consumer GPU: la versión fp8 podría ejecutarse en una RTX 4090 con técnicas de offloading, pero no está garantizado. La versión GGUF podría funcionar en GPUs de 16 GB con cuantización agresiva, aunque con pérdida de calidad.
- Opciones de despliegue: ComfyUI (mencionado en la búsqueda web), vLLM, llama.cpp, Ollama (si se convierte a GGUF), y posiblemente TGI. No hay confirmación oficial de soporte.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa fiable. El modelo se basa en LTX 2.3, pero no se conocen las especificaciones exactas de otros modelos NSFW de generación de vídeo. Se podría comparar con el propio LTX 2.3 base, pero no se tienen datos de rendimiento de ninguno de los dos. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- Contenido explícito: el modelo está diseñado para generar material NSFW, lo que puede violar las políticas de uso de muchas plataformas y plantear problemas legales en ciertas jurisdicciones.
- Sesgos y alucinaciones: al ser un fine-tuning sin filtros, es probable que el modelo presente sesgos de género, raza o apariencia física, y que genere escenas incoherentes o no deseadas.
- Riesgo de mal uso: la generación de vídeo explícito sin consentimiento puede utilizarse para crear deepfakes o contenido abusivo. Se recomienda extremar las precauciones.
- Limitaciones de contexto: no se especifica la longitud máxima de secuencia de vídeo generable; es probable que esté limitada por la arquitectura de LTX 2.3 (típicamente unos pocos segundos).
- Restricciones de licencia: aunque la licencia es Apache 2.0, el uso comercial de contenido NSFW puede estar sujeto a normativas locales e internacionales. El autor no ofrece garantías sobre el cumplimiento legal.
- Requisitos de hardware: el tamaño del modelo (600 GB en el repositorio) implica que la descarga y el almacenamiento son costosos, y la inferencia requiere GPUs de gama alta.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sasimi/PinkCherry_NSFW_LTX23
- Guía de LTX 2.3 para ComfyUI (modelos por VRAM): https://ltxworkflow.com/models
- Blog sobre LTX 2.3 NSFW (restricciones de contenido): https://ltx23.video/blog/ltx-2-3-nsfw
- Guía técnica de LTX 2.3 sin censura: https://ltx23.video/blog/ltx-2-3-uncensored
- LoRA destilado mencionado en la model card: https://huggingface.co/Lightricks/LTX-2.3/blob/main/ltx-2.3-22b-distilled-lora-384-1.1.safetensors
