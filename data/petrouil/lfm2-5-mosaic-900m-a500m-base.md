# Petrouil/LFM2.5-Mosaic-900M-A500M-Base

## Resumen

El modelo LFM2.5-Mosaic-900M-A500M-Base es una variante publicada por el usuario Petrouil (Petros Fanioudakis) en Hugging Face, aparentemente derivada de la familia LFM2.5 de Liquid AI, especializada en despliegue en dispositivos de borde. El nombre sugiere una arquitectura de mezcla de expertos (MoE) con 900 millones de parámetros totales y 500 millones activos, aunque esta interpretación no está confirmada por documentación oficial. El modelo se publicó el 16 de agosto de 2026 y no cuenta con descargas ni valoraciones, lo que indica que es un lanzamiento reciente y sin adopción registrada.

La licencia declarada es `lfm1.0-base-cc-by-4.0-data`, una variante de la licencia de Liquid AI que permite uso con atribución para los datos, pero no se detallan las condiciones exactas. No se dispone de una model card descriptiva, por lo que la información sobre arquitectura, entrenamiento y capacidades es prácticamente inexistente. A pesar de ello, la pertenencia a la familia LFM2.5 sugiere que el modelo está orientado a tareas de razonamiento y generación de texto en entornos con recursos limitados, siguiendo la línea de los modelos LFM2.5-1.2B y LFM2.5-8B-A1B de Liquid AI.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el nombre sugiere MoE, sin confirmar) |
| Parametros totales | no disponible (el nombre indica 900M, sin confirmar) |
| Parametros activos | no disponible (el nombre indica 500M, sin confirmar) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | lfm1.0-base-cc-by-4.0-data |
| Formato de pesos | no disponible |

## Arquitectura y entrenamiento

No se ha publicado información oficial sobre la arquitectura de este modelo. El nombre "Mosaic" y la combinación de cifras (900M-A500M) apuntan a una arquitectura de mezcla de expertos con 900 millones de parámetros totales y 500 millones activos, similar a la familia LFM2.5 de Liquid AI, que utiliza una arquitectura híbrida con atención lineal y capas de mezcla de expertos para optimizar la eficiencia en dispositivos de borde. Sin embargo, estos datos no están confirmados en la ficha de Hugging Face ni en la documentación del autor.

No se dispone de información sobre el conjunto de datos de entrenamiento, el número de tokens procesados, ni si se aplicaron técnicas de alineación como RLHF o DPO. La licencia menciona "cc-by-4.0-data", lo que sugiere que los datos de entrenamiento pueden tener una licencia Creative Commons con atribución, pero no se detalla su composición.

## Capacidades

- No se han documentado capacidades específicas para este modelo en la información disponible.
- Dado que pertenece a la familia LFM2.5, es probable que herede capacidades de generación de texto, razonamiento y soporte para agentes en entornos de borde, pero no hay confirmación oficial.
- No se ha verificado soporte para tool calling, function calling ni procesamiento multimodal.

## Casos de uso

No se pueden enumerar casos de uso concretos debido a la falta de documentación. La familia LFM2.5 de Liquid AI está diseñada para:

- Asistentes conversacionales en dispositivos móviles y embebidos, aprovechando la eficiencia de la arquitectura MoE para ejecutarse con poca memoria.
- Razonamiento en tiempo real en aplicaciones de borde, como asistentes de voz o sistemas de recomendación.
- Agentes autónomos que requieren múltiples pasos de razonamiento con recursos limitados.

No obstante, estos usos son hipotéticos para este modelo concreto, ya que no hay evidencia de que funcione correctamente ni de que tenga las mismas capacidades que los modelos oficiales de Liquid AI.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- No se dispone de datos sobre requisitos de VRAM, GPUs recomendadas o latencia.
- Dado el tamaño aparente (900M parámetros totales, 500M activos), es plausible que pueda ejecutarse en GPUs de consumo como una RTX 3060 o incluso en CPU con cuantización, pero esto es una especulación sin base confirmada.
- No se han indicado opciones de despliegue compatibles (vLLM, llama.cpp, Ollama, TGI).

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa fiable. Los modelos LFM2.5-1.2B y LFM2.5-8B-A1B de Liquid AI son referencias de la misma familia, pero no se conocen sus especificaciones exactas en este contexto ni se puede comparar su rendimiento con el modelo Mosaic.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| LFM2.5-Mosaic-900M-A500M-Base | no disponible | no disponible | lfm1.0-base-cc-by-4.0-data | Hugging Face |
| LFM2.5-1.2B (Liquid AI) | 1.2B | no disponible | no disponible | Hugging Face |
| LFM2.5-8B-A1B (Liquid AI) | 8B totales, 1B activos | no disponible | no disponible | Hugging Face |

## Limitaciones y advertencias

- No hay documentación oficial sobre sesgos, alucinaciones o limitaciones de contexto.
- La licencia `lfm1.0-base-cc-by-4.0-data` puede imponer restricciones de uso comercial; se recomienda revisar el texto completo de la licencia antes de su uso en producción.
- El modelo no tiene descargas ni validación por parte de la comunidad, por lo que su fiabilidad y calidad son inciertas.
- No se ha verificado que el modelo funcione correctamente ni que sea compatible con herramientas estándar de inferencia.
- El autor es un usuario individual, no la organización Liquid AI, por lo que puede tratarse de un experimento o un modelo no oficial.

## Enlaces

- Hugging Face: https://huggingface.co/Petrouil/LFM2.5-Mosaic-900M-A500M-Base
- Blog de Liquid AI sobre LFM2.5: https://www.liquid.ai/blog/introducing-lfm2-5-the-next-generation-of-on-device-ai
- Página de modelos de Liquid AI: https://www.liquid.ai/models
- Repositorio de ejemplos de Liquid AI: https://github.com/Liquid4All/cookbook
