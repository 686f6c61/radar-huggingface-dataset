# drowzeys/keys-GLM-5.3-Flash-NVFP4-ablit-l15-45-anchorstock

## Resumen

keys-GLM-5.3-Flash-NVFP4-ablit-l15-45-anchorstock es una variante abliterada del modelo GLM-5.3-Flash de LibertAI, publicada por el usuario drowzeys. El objetivo de esta versión es eliminar los bucles de rechazo (refuse loops) típicos de los modelos alineados, manteniendo el rendimiento del checkpoint original. Se basa en el modelo LibertAIDAI/GLM-5.3-Flash-NVFP4, que a su vez es una versión cuantizada en NVFP4 del GLM-5.3-Flash, un modelo multimodal de arquitectura MoE con atención híbrida y 165 000 millones de parámetros totales.

La modificación principal consiste en transplantar los pesos "Dealign o_proj" en las capas L15-45 (incluyendo el módulo MTP), mientras que las capas L0-14 permanecen intactas, siguiendo la técnica de "safety-anchor sparing" de Keys 0731. El modelo está diseñado específicamente para el despliegue en configuraciones de 2× DGX Spark con vLLM y una ventana de contexto de 1 millón de tokens, manteniendo el mismo rendimiento en tokens por segundo que el checkpoint original.

Este modelo es relevante para desarrolladores que necesitan un LLM multimodal sin restricciones de rechazo, con licencia MIT y capacidad de procesamiento de imágenes y texto, aunque su acceso está restringido en HuggingFace (gated) y requiere aceptar condiciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (mixture of experts) con atencion hibrida, basada en GLM-5.3-Flash |
| Parametros totales | 165 496 249 182 (165B) |
| Parametros activos | no disponible (el modelo base GLM-5.3-Flash tiene 18B activos segun documentacion publica) |
| Longitud de contexto | 1M tokens (segun documentacion del modelo base GLM-5.3-Flash) |
| Tipos de cuantizacion | NVFP4 (formato principal), 8-bit (segun tags) |
| Idiomas soportados | en, zh |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base GLM-5.3-Flash emplea una arquitectura MoE hibrida con atencion hibrida (hybrid-attention), disenada para combinar eficiencia computacional con capacidad de razonamiento. Segun la documentacion publica, el modelo total tiene 320B parametros, de los cuales 18B estan activos por token, aunque esta variante concreta presenta 165B parametros totales en su version cuantizada NVFP4. El checkpoint original de LibertAI fue sometido a un proceso de abliteration, una tecnica que modifica los pesos de las capas de proyeccion de salida (o_proj) para eliminar los comportamientos de rechazo aprendidos durante el alineamiento.

En esta variante, los pesos "Dealign o_proj" se transplantaron en las capas L15-45, incluyendo el modulo MTP (multi-token prediction), mientras que las capas L0-14 se mantienen sin cambios. Esta estrategia de "safety-anchor sparing" busca preservar la estabilidad de las capas iniciales mientras se eliminan los bucles de rechazo en las capas superiores. No se dispone de informacion detallada sobre el dataset de entrenamiento ni sobre el proceso de ajuste fino especifico de esta variante, mas alla de que se trata de un ajuste sobre el checkpoint NVFP4 de LibertAI.

## Capacidades

- Generacion de texto y razonamiento: mantiene las capacidades del modelo base GLM-5.3-Flash, incluyendo tareas de comprension lectora, razonamiento logico y generacion de respuestas extensas.
- Procesamiento multimodal: entrada de imagen y texto, salida de texto (pipeline image-text-to-text), lo que permite analisis de imagenes, captions y respuestas basadas en contenido visual.
- Generacion de codigo: el modelo base esta optimizado para tareas de programacion, y esta variante conserva esa capacidad, aunque no se han publicado benchmarks especificos.
- Tool calling y function calling: el modelo base soporta invocacion de herramientas, y esta variante hereda esa funcionalidad, aunque no esta confirmado en la documentacion de la variante.
- Soporte de agentes y razonamiento multi-paso: disenado para tareas que requieren planificacion y ejecucion de multiples pasos, especialmente en entornos de agentes.
- Capacidades multilingues: soporta ingles y chino, con posible degradacion en otros idiomas.
- Ausencia de bucles de rechazo: la abliteration elimina las respuestas de rechazo tipicas de modelos alineados, permitiendo respuestas mas directas y sin censura.

## Casos de uso

- Despliegue en servidores DGX Spark con vLLM: el modelo esta especificamente optimizado para esta configuracion, permitiendo inferencia de alto rendimiento con 1M de contexto. Se usaria en entornos de produccion que requieren baja latencia y alta concurrencia.
- Chat sin censura para aplicaciones de investigacion: util para proyectos que necesitan explorar temas sensibles o controversiales sin restricciones de rechazo, como analisis de contenido o simulacion de dialogos.
- Analisis de imagenes y generacion de descripciones: gracias a su capacidad multimodal, puede procesar imagenes y generar texto descriptivo, util en sistemas de accesibilidad o catalogacion automatica.
- Asistente de programacion con contexto largo: con 1M de tokens, puede manejar repositorios completos o documentacion extensa para generar codigo, refactorizar o explicar fragmentos.
- Agente autonomo para tareas de investigacion: al soportar tool calling y razonamiento multi-paso, puede integrarse en pipelines de agentes que buscan informacion, ejecutan codigo o interactuan con APIs.
- Generacion de contenido creativo sin filtros: para escritura de ficcion, guiones o contenido editorial donde se requiere libertad creativa sin restricciones de contenido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks especificos para esta variante abliterada en la informacion disponible. El modelo base GLM-5.3-Flash ha sido evaluado en tareas de codificacion visual, razonamiento multimodal y comprension de contexto largo, pero no se dispone de numeros concretos para esta version. Se recomienda consultar la documentacion oficial de GLM-5.3-Flash para obtener datos de rendimiento del modelo original, aunque la abliteration puede alterar ligeramente los resultados.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial, pero al ser un modelo de 165B parametros en NVFP4, se estima que requiere al menos 100-120 GB de VRAM para inferencia en precision nativa. Con cuantizacion adicional de 8-bit, podria reducirse a unos 80-90 GB.
- GPU recomendadas: el modelo esta disenado para DGX Spark (2× DGX Spark), que integra GPUs de alta gama. En entornos de produccion, se recomiendan GPUs como A100 80GB, H100 80GB o H200, en configuraciones multi-GPU.
- Compatibilidad con GPUs de consumo: no es viable en GPUs de consumo como RTX 4090 (24 GB) o RTX 3090 (24 GB) debido al tamano del modelo. Se requiere al menos 2-4 GPUs de 80 GB en paralelo.
- Opciones de despliegue: vLLM (recomendado, segun la documentacion), TGI, llama.cpp (con cuantizacion adicional), y transformers con soporte de sharding.
- Latencia y throughput: no se han publicado datos especificos, pero el modelo base GLM-5.3-Flash esta optimizado para alto throughput en vLLM, con un rendimiento de tokens por segundo similar al checkpoint original segun la documentacion de la variante.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| keys-GLM-5.3-Flash-NVFP4-ablit-l15-45-anchorstock | 165B (total) | 1M | MIT | Gated en HuggingFace |
| GLM-5.3-Flash (original) | 320B (total, 18B activos) | 1M | MIT | Publico en HuggingFace |
| DeepSeek-V3 | 671B (total, 37B activos) | 128K | MIT | Publico |
| Qwen2.5-72B-Instruct | 72B (dense) | 128K | Apache 2.0 | Publico |

La comparativa muestra que esta variante es un subconjunto del GLM-5.3-Flash original, con la diferencia de la abliteration y la cuantizacion NVFP4. Frente a otros modelos MoE como DeepSeek-V3, ofrece un contexto mucho mayor (1M vs 128K) y una licencia MIT, aunque con menos parametros activos. La disponibilidad esta restringida por el acceso gated.

## Limitaciones y advertencias

- Sesgos conocidos: al ser una variante abliterada, puede presentar sesgos no mitigados por el alineamiento original, especialmente en temas sensibles. No se ha realizado una evaluacion exhaustiva de sesgos en esta version.
- Riesgo de alucinacion: como cualquier LLM, puede generar informacion falsa o inventada, especialmente en tareas de razonamiento complejo o con contexto largo.
- Limitaciones de idioma: solo soporta ingles y chino de forma nativa; otros idiomas pueden tener un rendimiento degradado.
- Restricciones de acceso: el modelo es de acceso restringido (gated) en HuggingFace, lo que requiere aceptar condiciones adicionales antes de su descarga.
- Uso comercial: la licencia MIT permite uso comercial, pero se recomienda revisar los terminos del modelo base y las condiciones de acceso.
- Estabilidad en produccion: la abliteration puede afectar la coherencia en tareas de largo alcance; se recomienda realizar pruebas exhaustivas antes de desplegar en entornos criticos.
- Requisitos de hardware: el despliegue requiere hardware especializado (DGX Spark o GPUs de 80 GB), lo que limita su uso en entornos con recursos limitados.

## Enlaces

- HuggingFace: https://huggingface.co/drowzeys/keys-GLM-5.3-Flash-NVFP4-ablit-l15-45-anchorstock
- GitHub: https://github.com/drowzeys/keys-GLM-5.3-Flash-NVFP4-ablit-l15-45-anchorstock
- Documentacion del modelo base (LibertAI): https://huggingface.co/LibertAIDAI/GLM-5.3-Flash-NVFP4
- Guia de GLM-5.3-Flash (codepick.dev): https://codepick.dev/en/guides/glm-5-3-flash-guide/
- GLM Coding Plan (z.ai): https://z.ai/subscribe
