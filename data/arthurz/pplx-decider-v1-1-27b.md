# ArthurZ/pplx-decider-v1.1-27b

## Resumen

pplx-decider-v1.1-27b es un modelo de decisión distribuido a través del repositorio ArthurZ/pplx-decider-v1.1-27b, y se presenta como la cabeza de decisión JEV (readout de 255 vías de códigos de respuesta) del modelo original perplexity-ai/pplx-decider-v1.1-27b, para el pipeline `decision` de la librería Transformers. El repositorio no contiene el backbone completo: aloja únicamente el readout, el tokenizador y el prompt, mientras que el backbone Qwen3.5 se carga desde el repositorio original con atención bidireccional completa, tal y como fue entrenado.

El problema que resuelve es el de la clasificación y decisión estructurada en un único paso (enfoque "system-one"). En lugar de generar texto libre, el modelo recibe un estado y un conjunto de preguntas, y devuelve para cada pregunta una probabilidad sobre todas las opciones posibles. Los tipos de pregunta soportados son `noul` (sí/no con probabilidad de verdadero), `choice` (elección entre criterios con probabilidades) y `score` (nivel esperado dentro de un rango, por ejemplo de 0 a 3).

Es relevante por su carácter agnóstico al estado: una misma pregunta puede aplicarse sobre estados nuevos sin reenviar las instrucciones, y admite activos multimodales (`assets`) donde un marcador de posición en el estado se sustituye por una imagen en formato PIL, ruta, URL o base64. La licencia es Apache 2.0. La nomenclatura del modelo indica 27B, pero el recuento real de parámetros en los ficheros safetensors del repositorio es de 1.305.855, correspondientes al readout y no al backbone completo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cabeza de decisión JEV sobre backbone Qwen3.5 con atención bidireccional completa |
| Parametros totales | 1.305.855 en este repositorio (readout); el backbone Qwen3.5 se carga aparte (nomenclatura del modelo: 27B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura combina dos piezas. Por un lado, un backbone Qwen3.5 que se carga desde el repositorio original `perplexity-ai/pplx-decider-v1.1-27b` y que utiliza atención bidireccional completa, es decir, sin la máscara causal habitual en los modelos generativos, "tal y como fue entrenado". Por otro, una cabeza de decisión JEV que actúa como readout de 255 vías sobre códigos de respuesta, integrada en el pipeline `decision` (etiquetado también como `zero-shot-classification`) de Transformers.

El funcionamiento es de tipo discriminativo en un único paso: cada pregunta se responde con una probabilidad para cada opción. Los tres formatos de respuesta son `noul` (probabilidad de verdadero en una pregunta binaria), `choice` (distribución sobre criterios, cada uno con una descripción asociada) y `score` (nivel esperado sobre una escala ordenada de criterios). El repositorio se ha generado mediante la conversión a formato Hugging Face con el script `convert_decider_to_hf.py`, y sus prompts son token a token idénticos a los del código original (`decision_test.json`), con la salvedad de que los tokens de control escritos en una petición se escapan en lugar de interpretarse como tales.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni sobre si se aplicaron técnicas de RLHF o DPO. Tampoco se detalla la innovación interna de la cabeza JEV más allá de su condición de readout de 255 vías.

## Capacidades

- Respuesta a preguntas estructuradas con probabilidad por opción, en lugar de generación de texto libre.
- Preguntas binarias o `noul` con probabilidad de verdadero.
- Preguntas de elección o `choice`, con criterios nombrados y distribución de probabilidades asociada.
- Preguntas de puntuación o `score`, que devuelven un nivel esperado sobre una escala ordenada.
- Reutilización de preguntas: un estado sin preguntas se evalúa con las preguntas de la última petición o con las configuradas de antemano en el pipeline.
- Procesamiento multimodal mediante `assets`: se sustituye un marcador de posición en el estado por una imagen (PIL, ruta, URL o base64 en PNG u otros formatos).
- Integración con la librería Transformers mediante `pipeline("decision", ...)`.
- Compatibilidad con endpoints (`endpoints_compatible`).

## Casos de uso

- Clasificación de intención en atención al cliente: a partir de un estado con datos del cliente y su mensaje, el modelo devuelve probabilidades para preguntas como si solicita un reembolso, el tono del mensaje o su urgencia, sin necesidad de un clasificador entrenado a medida.
- Enrutado de tickets: con la pregunta de urgencia configurada como `score` sobre una escala ("Puede esperar", "Esta semana", "Hoy", "Ahora"), el nivel esperado permite priorizar la cola de soporte.
- Detección de spam o abuso: mediante una pregunta `noul` reutilizable ("¿Es spam?"), el mismo pipeline evalúa mensajes nuevos sin reconfigurarla.
- Triaje de soporte de producto con imágenes: usando `assets`, el modelo responde a preguntas como si el producto de la foto está dañado, lo que resulta útil en garantías y devoluciones.
- Moderación de contenido: preguntas `choice` con criterios de categoría de contenido permiten obtener una distribución de probabilidades para decidir la acción.
- Análisis de sentimiento y tono: una pregunta `choice` con criterios como "educado" frente a "enfadado" devuelve la probabilidad de cada categoría.
- Extracción de decisiones en flujos de agentes: al devolver probabilidades por opción, encaja como componente de decisión en pipelines donde se necesita una elección discreta y cuantificada antes de ejecutar una acción.
- Evaluación de riesgo o probabilidad de una condición: la pregunta `noul` ofrece directamente la probabilidad de verdadero, útil como señal numérica para umbrales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Este repositorio contiene únicamente el readout (1.305.855 parámetros), el tokenizador y el prompt; la VRAM necesaria depende sobre todo del backbone Qwen3.5 de 27B, que se carga desde el repositorio original y no se incluye aquí.
- Para el backbone de 27B, como estimación orientativa: en fp16 requiere del orden de 54 GB de VRAM para solo los pesos; en cuantización de 8 bits, alrededor de 27 GB; en 4 bits, alrededor de 14-16 GB. Estas cifras son estimaciones basadas en el tamaño nominal y no un dato confirmado en la información disponible.
- GPU de centro de datos recomendadas para el backbone sin cuantizar: A100 80 GB, H100, o varias GPU con reparto de tensores.
- GPU de consumo: posible en RTX 3090 o RTX 4090 (24 GB) si el backbone va cuantizado a 4 bits; no cabe sin cuantizar.
- Opciones de despliegue: al ser un modelo de la librería Transformers con pesos safetensors, es desplegable mediante bibliotecas compatibles como vLLM o TGI para el backbone y mediante el pipeline de Transformers para la cabeza de decisión; no se confirma soporte específico para llama.cpp u Ollama al tratarse de formato safetensors y no GGUF.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ArthurZ/pplx-decider-v1.1-27b | 1.305.855 (readout) + backbone Qwen3.5 (27B) | no disponible | no disponible | Apache 2.0 | Hugging Face |
| perplexity-ai/pplx-decider-v1.1-27b | no disponible (modelo original con backbone incluido) | no disponible | no disponible | no disponible | Hugging Face |
| Alternativas de clasificación zero-shot genéricas | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de parámetros, contexto ni rendimiento de modelos comparables de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- El repositorio no incluye el backbone completo: es necesario descargar Qwen3.5 desde el repositorio original para que el pipeline funcione, por lo que no es autocontenido.
- Los prompts se hacen coincidir token a token con el código original, con la excepción de que los tokens de control escritos en una petición se escapan en lugar de interpretarse como tales; esto puede cambiar el comportamiento respecto al modelo original en esos casos.
- El modelo devuelve probabilidades por opción y no texto; no debe esperarse generación libre.
- No se indica el número de idiomas soportados ni la composición lingüística; el comportamiento multilingüe es no disponible.
- Riesgo de alucinación y de calibración de probabilidades no evaluado: no hay datos publicados de fiabilidad en la información disponible.
- El recuento real de parámetros del repositorio (1.305.855) difiere de la nomenclatura "27b" del nombre, lo que puede inducir a error al planificar recursos.
- Aunque la licencia declarada es Apache 2.0, conviene verificar las condiciones del backbone original y de los repositorios de los que depende antes de un uso comercial.
- El repositorio figura con 0 descargas y 0 me gusta, por lo que no hay evidencia de uso en producción en la información disponible.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/ArthurZ/pplx-decider-v1.1-27b
- Modelo base original: https://huggingface.co/perplexity-ai/pplx-decider-v1.1-27b
- Script de conversión `convert_decider_to_hf.py`: https://github.com/huggingface/transformers/blob/main/src/transformers/models/jev/convert_decider_to_hf.py
- Mencionado en la model card pero sin URL disponible: `decision_test.json`
