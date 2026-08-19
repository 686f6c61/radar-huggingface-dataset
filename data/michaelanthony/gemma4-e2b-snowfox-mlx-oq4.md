# MichaelAnthony/gemma4-e2b-Snowfox-MLX-oQ4

## Resumen

El modelo `MichaelAnthony/gemma4-e2b-Snowfox-MLX-oQ4` es una cuantización en 4 bits (formato oQ4, equivalente a GGUF Q4_K_M) de un modelo multimodal Gemma 4 E2B modificado con un LoRA de lenguaje llamado SnowFox. El modelo base, `MichaelAnthony/gemma4-e2b-Snowfox-MLX`, es un merge entre el checkpoint oficial de Google `gemma-4-E2B-it-qat-q4_0-unquantized` y un adaptador LoRA de SnowFox, orientado a mejorar las capacidades lingüísticas del modelo manteniendo su naturaleza multimodal (visión, audio y texto). La cuantización oQ4 está pensada para ejecutarse en Apple Silicon mediante la librería MLX, ofreciendo una huella de memoria reducida y una inferencia eficiente en hardware de Apple.

Es importante señalar que, en el momento de la publicación, el repositorio no contiene los pesos cuantizados; solo incluye instrucciones de construcción (build-to-order) para generarlos localmente con la aplicación oMLX. Esto significa que el modelo no está listo para su descarga directa, sino que requiere que el usuario ejecute un script de construcción en su propio Mac. La licencia es Apache-2.0, lo que permite uso comercial y modificación, aunque se recomienda revisar los términos específicos de la familia Gemma 4.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (basado en Gemma 4 E2B, multimodal transformer) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | oQ4 (4 bits, equivalente a Q4_K_M) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | MLX (oMLX) |

## Arquitectura y entrenamiento

El modelo base es una variante de Gemma 4 E2B, un modelo multimodal de Google que procesa entradas de imagen, audio y texto. Sobre este checkpoint se ha aplicado un LoRA de SnowFox, un adaptador de lenguaje que probablemente mejora la coherencia y el razonamiento textual sin alterar las capacidades multimodales. El resultado se ha cuantizado a 4 bits con el formato oQ4, diseñado para la librería MLX de Apple. No se dispone de detalles sobre el dataset de entrenamiento, el número de tokens procesados ni si se emplearon técnicas de RLHF o DPO. La model card indica que los pesos post-LoRA no fueron recalibrados con QAT, por lo que la cuantización puede tener una ligera pérdida de precisión respecto a una calibración completa.

## Capacidades

- Multimodal: procesa imágenes, audio y texto (según la descripción del autor).
- Generación de texto y razonamiento: al ser un modelo de lenguaje, puede generar respuestas coherentes y realizar tareas de comprensión.
- Integración con MLX: optimizado para Apple Silicon, permite inferencia local eficiente.
- No se especifica soporte para tool calling, agentes o modos de pensamiento extendido.

## Casos de uso

- Despliegue local en Mac: al ser una cuantización MLX, el modelo puede ejecutarse en un Mac con Apple Silicon, ideal para prototipos y aplicaciones de escritorio que requieran procesamiento multimodal sin depender de la nube.
- Asistentes de visión-lenguaje: puede utilizarse para responder preguntas sobre imágenes, generar descripciones o realizar tareas de VQA (Visual Question Answering) en entornos locales.
- Transcripción y análisis de audio: si el modelo base soporta audio, podría emplearse para tareas de reconocimiento de voz o análisis de señales de audio, aunque no hay confirmación explícita.
- Investigación y experimentación: al ser Apache-2.0, permite a investigadores estudiar el comportamiento de un modelo multimodal pequeño y cuantizado en hardware de Apple.
- Aplicaciones educativas: puede integrarse en herramientas de aprendizaje que requieran interacción multimodal en dispositivos con recursos limitados.
- Desarrollo de agentes conversacionales: aunque no se confirma tool calling, su capacidad de generar texto y procesar imágenes podría servir para chatbots con entrada visual.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos sobre MMLU, HumanEval, GSM8K ni otras métricas estándar para este modelo cuantizado.

## Requisitos de hardware

- Apple Silicon (M1, M2, M3 o superior) con memoria unificada.
- Se recomienda al menos 8 GB de RAM para una cuantización de 4 bits de un modelo de ~2 mil millones de parámetros (estimación basada en el tamaño típico de Gemma 4 E2B, aunque no confirmado).
- La inferencia se realiza mediante la librería MLX y la aplicación oMLX; no es compatible con CUDA ni con GPUs de NVIDIA.
- No se dispone de datos de latencia o throughput específicos para este modelo.

## Comparativa con modelos similares

No se dispone de información suficiente para comparar este modelo con alternativas de la misma categoría. El modelo base Gemma 4 E2B de Google podría compararse con otros modelos multimodales pequeños como LLaVA o Phi-3-Vision, pero no hay datos cuantitativos en la información proporcionada.

## Limitaciones y advertencias

- El repositorio no contiene pesos descargables; es necesario construir el modelo localmente con oMLX, lo que puede ser un obstáculo para usuarios sin experiencia técnica.
- La cuantización oQ4 no fue recalibrada con QAT tras el LoRA, lo que podría provocar una degradación de precisión en tareas sensibles.
- No se han publicado benchmarks, por lo que el rendimiento real es desconocido.
- Las capacidades multimodales (audio, visión) no están verificadas de forma independiente; la model card las menciona, pero no hay ejemplos ni demostraciones.
- La licencia Apache-2.0 permite uso comercial, pero se recomienda revisar los términos de la familia Gemma 4 de Google, que pueden incluir restricciones adicionales.
- Al ser un modelo pequeño (probablemente ~2B parámetros), su rendimiento en tareas complejas de razonamiento o generación de código puede ser limitado en comparación con modelos más grandes.

## Enlaces

- [Modelo cuantizado oQ4](https://huggingface.co/MichaelAnthony/gemma4-e2b-Snowfox-MLX-oQ4)
- [Modelo base FP16](https://huggingface.co/MichaelAnthony/gemma4-e2b-Snowfox-MLX)
- [Modelo original de Google Gemma 4 E2B](https://huggingface.co/google/gemma-4-E2B)
- [Guía de Gemma 4 E2B (sitio externo)](https://www.gemma4.wiki/models/gemma-4-e2b-model)
- [Página de Gemma 4 en DeepMind](https://deepmind.google/models/gemma/gemma-4/)
- [Gemma 4 E2B en gemma4.dev (sitio externo)](https://gemma4.dev/models/gemma-4-e2b)
