# Ishowbackup/Huihui-gemma-4-12B-it-abliterated

## Resumen

Este modelo es una versión "abliterada" (sin censura) del modelo google/gemma-4-12B-it, creada por el usuario Ishowbackup (vinculado al proyecto huihui-ai). La técnica de abliteration, implementada mediante el proyecto remove-refusals-with-transformers, elimina los mecanismos de rechazo del modelo, de modo que responde a solicitudes que normalmente serían bloqueadas por los filtros de seguridad. Se trata de una modificación de los pesos del modelo base, no de un entrenamiento adicional. El modelo tiene 11.959.730.224 parámetros y está disponible en formato safetensors. Su pipeline es any-to-any, lo que sugiere capacidades multimodales (imagen, texto, etc.), aunque no se detallan en la documentación. Es relevante para investigadores que estudian la alineación y la seguridad de los modelos de lenguaje, así como para quienes buscan un modelo sin restricciones de contenido en entornos controlados.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (modelo base: google/gemma-4-12B-it) |
| Parametros totales | 11.959.730.224 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (formato safetensors; se puede cuantizar con herramientas externas) |
| Idiomas soportados | No disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un derivado de google/gemma-4-12B-it, un modelo de la familia Gemma 4 de Google. La técnica de abliteration aplicada modifica los pesos de las capas 23 a 28 (de un total de 48 capas aproximadamente) para eliminar las respuestas de rechazo. Según la model card, tanto el modo de pensamiento (thinking) como el modo normal han sido abliterados. No se proporcionan detalles sobre la arquitectura interna del modelo base (número de capas, dimensiones, tipo de atención, etc.), ni sobre el dataset de entrenamiento original. La implementación se basa en el repositorio remove-refusals-with-transformers, que utiliza un enfoque sin TransformerLens para identificar y eliminar las direcciones de rechazo en el espacio de activaciones. El modelo se publica con licencia Apache 2.0, aunque el modelo base tiene su propia licencia (Gemma 4 License).

## Capacidades

- Generación de texto y razonamiento: al ser una versión del modelo Gemma 4 de 12B, es capaz de mantener conversaciones coherentes, responder preguntas y realizar tareas de razonamiento básico.
- Modo thinking: el modo de pensamiento (thinking mode) está incluido y ha sido abliterado, lo que significa que el modelo puede generar cadenas de razonamiento internas sin filtros.
- Multimodalidad: el pipeline any-to-any y la etiqueta image-text-to-text sugieren que el modelo puede procesar imágenes y texto, aunque no se han documentado ejemplos concretos.
- Sin filtros de seguridad: la principal capacidad diferencial es la ausencia de rechazos ante solicitudes que normalmente serían bloqueadas por políticas de contenido.
- Compatibilidad con herramientas: no se ha confirmado soporte para tool calling o function calling, aunque es posible que el modelo base lo tenga.

## Casos de uso

- Investigación en seguridad de IA: permite estudiar cómo se comporta un modelo sin mecanismos de rechazo, analizando sesgos, vulnerabilidades y estrategias de alineación.
- Generación creativa sin restricciones: adecuado para escribir ficción, poesía o guiones que aborden temas tabú o controvertidos sin limitaciones impuestas por filtros.
- Pruebas de robustez: los desarrolladores pueden evaluar la resistencia del modelo a prompts malintencionados o a intentos de jailbreak, comparando con la versión original.
- Análisis de sesgos y alucinaciones: al eliminar los filtros, se pueden observar sesgos latentes del modelo base que de otro modo quedarían enmascarados por respuestas de rechazo.
- Entornos educativos controlados: en cursos sobre ética de la IA, se puede usar para demostrar los riesgos de desplegar modelos sin moderación.
- Evaluación de técnicas de abliteration: sirve como punto de referencia para investigar métodos de eliminación de rechazos y sus efectos en el comportamiento del modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos sobre MMLU, HumanEval, GSM8K u otras métricas estándar para este modelo abliterado.

## Requisitos de hardware

- VRAM estimada: con 11.96 mil millones de parámetros, en FP16 se necesitan aproximadamente 24 GB de VRAM. Con cuantización de 8 bits (~12 GB) o 4 bits (~6 GB) se reduce el requisito.
- GPU recomendadas: para FP16, una GPU con 24 GB (RTX 3090, RTX 4090, A100 40GB) o superior. Para 4 bits, una GPU con 8-10 GB (RTX 3080, RTX 4070) puede ser suficiente.
- En consumer GPU: sí, es posible ejecutarlo en GPUs de gama alta con cuantización. En 4 bits cabe en tarjetas de 8 GB.
- Opciones de despliegue: el modelo está en formato safetensors, compatible con transformers, vLLM, TGI y llama.cpp (tras conversión a GGUF). También se puede usar con Ollama mediante la etiqueta `huihui_ai/gemma-4-abliterated:12b`.
- Latencia y throughput: no hay datos oficiales. Dependerá del hardware y la cuantización. En una RTX 4090 con 4 bits, se puede esperar una generación de 20-40 tokens por segundo.

## Comparativa con modelos similares

No se dispone de datos de otros modelos abliterados de la misma familia para comparar directamente. Como referencia, se puede comparar con el modelo base google/gemma-4-12B-it, que tiene los mismos parámetros pero conserva los filtros de seguridad. Otros modelos abliterados de huihui-ai (como versiones de Llama o Mistral) existen, pero no se han incluido en la información proporcionada. Por tanto, la comparativa se limita a señalar que este modelo es una variante sin censura del modelo original, con las mismas capacidades técnicas pero sin moderación de contenido.

## Limitaciones y advertencias

- Sesgos conocidos: al ser una versión sin filtros, es probable que reproduzca y amplifique sesgos presentes en el modelo base, incluyendo contenido ofensivo, discriminatorio o perjudicial.
- Riesgo de alucinación: al no tener restricciones, el modelo puede generar afirmaciones falsas o inventadas con mayor libertad, sin mecanismos de autocorrección.
- Limitaciones de contexto: no se conoce la longitud máxima de contexto; el modelo base Gemma 4 probablemente soporta 8K o 32K tokens, pero no está confirmado.
- Restricciones de licencia: aunque el modelo se publica bajo Apache 2.0, el modelo base google/gemma-4-12B-it tiene su propia licencia (Gemma 4 License) que puede imponer restricciones de uso comercial. Se debe revisar esa licencia antes de usar el modelo en producción.
- No apto para producción: la model card advierte explícitamente que el modelo no debe usarse en aplicaciones públicas o comerciales sin supervisión. La ausencia de filtros de seguridad puede generar contenido ilegal o dañino.
- Advertencia de pesos: el autor indica que los pesos de la primera versión tenían problemas y se han re-subido; es necesario descargar la versión más reciente.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/Ishowbackup/Huihui-gemma-4-12B-it-abliterated)
- [Repositorio remove-refusals-with-transformers](https://github.com/Sumandora/remove-refusals-with-transformers)
- [Modelo en Ollama](https://ollama.com/huihui_ai/gemma-4-abliterated:12b)
- [Página de Gemma 4 de Google](https://ai.google.dev/gemma) (para referencia del modelo base)
