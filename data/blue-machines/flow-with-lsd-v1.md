# blue-machines/Flow-with-LSD-v1

## Resumen

`blue-machines/Flow-with-LSD-v1` es un modelo de clasificación de texto desarrollado por Blue Machines, diseñado para identificar el idioma de una oración y detectar cambios de idioma dentro de un texto. Está basado en el encoder Gemma 3 270M y se presenta en formato ONNX con dos cabezas de clasificación: una para identificación de idioma (LID) y otra para detección de cambio de idioma (LSD). El modelo está especializado en 10 idiomas, principalmente lenguas de la India además del inglés, y es una variante derivada de `blue-machines/Floe-with-intent-classifer-v1`, a la que se le ha eliminado la cabeza de intención.

El modelo resuelve problemas de procesamiento de lenguaje natural en contextos multilingües y de code-switching, donde los hablantes alternan entre idiomas en una misma frase o conversación. Es relevante en aplicaciones de atención al cliente, análisis de redes sociales y transcripciones de voz en la India. El tamaño de despliegue es de aproximadamente 258 MB en su versión ONNX cuantizada, con el encoder y la cabeza LID en INT8 y la cabeza LSD en FP32. El contexto de entrada está limitado a 128 tokens.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gemma 3 270M encoder con dos cabezas de clasificación (LID y LSD), modelo ONNX |
| Parametros totales | 270 millones (encoder base; parametros de las cabezas no documentados) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 128 tokens (limite configurado para este modelo, segun tokenizer y ejemplo de inferencia) |
| Tipos de cuantizacion | INT8 (encoder y cabeza LID), FP32 (cabeza LSD y modelo de referencia `model_fp32.onnx`) |
| Idiomas soportados | ingles (en), hindi (hi), bengali (bn), gujarati (gu), kannada (kn), malayalam (ml), marathi (mr), oriya (or), tamil (ta), telugu (te) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`model.onnx` para despliegue, `model_fp32.onnx` como referencia FP32) |

## Arquitectura y entrenamiento

El modelo utiliza el encoder de Gemma 3 270M como base, al que se le añaden dos cabezas de clasificación independientes. La primera cabeza (LID) predice el idioma de la oracion entre 10 clases. La segunda cabeza (LSD) predice si hay un cambio de idioma en el texto, con 11 clases posibles: las 10 lenguas mas la clase `no_switch`. Ambas cabezas comparten el mismo encoder, lo que reduce el coste computacional respecto a ejecutar dos modelos separados.

El modelo es una derivacion directa de `blue-machines/Floe-with-intent-classifer-v1`, del que se ha eliminado la salida de intencion. Segun la informacion disponible, el encoder y la cabeza LID estan cuantizados a INT8, mientras que la cabeza LSD se mantiene en FP32 para preservar la precision en una tarea mas fina. El entrenamiento se ha validado con metricas de puerta: 0,9945 de exactitud en LID sobre el subconjunto `lid_finetune_subset`, 0,9704 en LSD sobre `lsd_evaluation` y 0,9738 en la clase `no_switch`. No se proporcionan detalles sobre el proceso de entrenamiento, el numero de tokens ni la composicion del dataset.

## Capacidades

- Identificacion del idioma de una oracion entre 10 lenguas: ingles, hindi, bengali, gujarati, kannada, malayalam, marathi, oriya, tamil y telugu.
- Deteccion de cambio de idioma dentro de un texto, distinguiendo entre los 10 idiomas y la clase `no_switch`.
- Ejecucion eficiente en CPU gracias al formato ONNX y a la cuantizacion INT8.
- Clasificacion de texto, no generacion: el modelo no produce texto ni respuestas, solo logits de clasificacion.
- No soporta tool calling, vision, audio ni otras tareas generativas.
- Especializado en contextos de code-switching en lenguas indias, como Hinglish o mezclas de ingles con idiomas regionales.

## Casos de uso

- Enrutamiento de mensajes en centros de atencion al cliente de la India: el modelo identifica el idioma de cada mensaje entrante y lo dirige al agente o canal adecuado, reduciendo el tiempo de respuesta en conversaciones multilingues.
- Preprocesamiento de transcripciones de voz: en sistemas de analisis de llamadas, el LSD detecta en que punto de la transcripcion se cambia de idioma, permitiendo segmentar el audio para su posterior tratamiento o traduccion.
- Clasificacion automatica de tickets de soporte: se utiliza para etiquetar el idioma de tickets de ayuda antes de aplicar otros modelos de analisis de sentimiento o de extraccion de entidades.
- Analisis de redes sociales en India: permite filtrar y clasificar publicaciones que mezclan ingles con idiomas locales, facilitando estudios de opinion o moderacion de contenidos.
- Sistemas de traduccion automatica: antes de traducir un texto, el modelo determina si hay un cambio de idioma para dividir el contenido en segmentos y aplicar el motor de traduccion adecuado a cada fragmento.
- Accesibilidad en aplicaciones de lectura en voz alta: el LID se usa para seleccionar la voz de sintesis adecuada segun el idioma detectado, mientras que el LSD ayuda a alternar voces en textos con cambios de idioma.

## Benchmarks y rendimiento

Se han publicado metricas de validacion del modelo en la model card. No se han encontrado resultados de benchmarks publicos comparativos con otros modelos.

| Tarea | Metrica | Valor |
|---|---|---|
| LID | `lid_finetune_subset` exactitud | 0,9944648823787505 |
| LSD | `lsd_evaluation` exactitud | 0,9704418789808917 |
| LSD | `lsd_evaluation` clase `no_switch` | 0,973753280839895 |

## Requisitos de hardware

No se han publicado requisitos de hardware oficiales ni datos de latencia o throughput. Dado el tamano del modelo de despliegue (~258 MB) y la cuantizacion INT8, se puede estimar lo siguiente:

- VRAM estimada para inferencia: inferior a 1 GB para los pesos del modelo, mas overhead del runtime.
- GPU recomendadas: cualquier GPU moderna con al menos 2 GB de VRAM (por ejemplo, RTX 3050, RTX 4060) seria suficiente; tambien puede ejecutarse en CPU.
- Compatibilidad con GPU de consumo: si, cabe en tarjetas de gama de entrada.
- Opciones de despliegue: ONNX Runtime con `CPUExecutionProvider` o `CUDAExecutionProvider`; el codigo de ejemplo de la model card usa exclusivamente CPU. No se menciona soporte para vLLM, llama.cpp ni Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se han publicado comparativas con otros modelos en la informacion disponible. El modelo es una variante especializada en idiomas indios y deteccion de cambio de idioma, por lo que alternativas generalistas de identificacion de idioma (por ejemplo, basadas en XLM-RoBERTa) no son directamente comparables sin datos de benchmark especificos. No se dispone de informacion sobre parametros, contexto o rendimiento de modelos similares en la documentacion consultada.

## Limitaciones y advertencias

- La licencia del modelo no esta especificada, lo que genera incertidumbre sobre el uso comercial y la redistribucion.
- El modelo solo realiza clasificacion de idioma y de cambio de idioma; no genera texto ni realiza otras tareas de lenguaje.
- La longitud de entrada esta limitada a 128 tokens, por lo que textos largos deben truncarse, lo que puede perder informacion relevante para la deteccion de cambios de idioma.
- Solo reconoce 10 idiomas concretos; cualquier otro idioma sera clasificado incorrectamente dentro de esas clases.
- La deteccion de cambio de idioma esta disenada para detectar transiciones entre los 10 idiomas soportados; cambios a otros idiomas no se representan.
- No se han publicado estudios sobre sesgos, errores en dialectos o jerga, ni evaluaciones de robustez frente a texto adversario.
- El modelo deriva de un checkpoint que tenia una cabeza de intencion eliminada; si se necesita clasificacion de intenciones, debe usarse el modelo `blue-machines/Intent-classifier-v1` en lugar de este.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/blue-machines/Flow-with-LSD-v1
- Organizacion Blue Machines en Hugging Face: https://huggingface.co/datasets/blue-machines/
- Sitio web de Blue Machines: https://bluemachines.ai/
- Modelo padre con clasificador de intencion (mencionado en la model card): `blue-machines/Floe-with-intent-classifer-v1`
- Clasificador de intencion independiente (mencionado en la model card): `blue-machines/Intent-classifier-v1`
