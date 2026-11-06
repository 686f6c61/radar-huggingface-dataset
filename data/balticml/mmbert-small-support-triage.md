# balticml/mmbert-small-support-triage

## Resumen

mmbert-small-support-triage es un modelo de clasificación de texto desarrollado por balticml, un proyecto independiente, que enruta mensajes de atención al cliente de una tienda online hacia una de 27 categorías de petición agrupadas en 11 departamentos, o hacia la etiqueta `out_of_scope` cuando el mensaje no es una solicitud de soporte. Se trata de un ajuste fino del modelo base jhu-clsp/mmBERT-small, un transformer encoder de aproximadamente 60 millones de parámetros, y su interés principal radica en que ofrece un clasificador de intenciones muy ligero (64 MB en int8) con latencia de milisegundos en CPU, pensado para ejecutarse en el navegador mediante transformers.js.

El modelo cubre diez idiomas (inglés, polaco, alemán, francés, español, italiano, neerlandés, portugués, checo y sueco) y se distribuye en formato ONNX con cuantización weight-only int8, lo que lo hace adecuado para despliegues edge y para prefiltrar conversaciones antes de invocar un LLM mayor. Su receta de entrenamiento incluye aumentación de datos realista (saludos, números de pedido, erratas) y ejemplos negativos para detectar mensajes fuera de alcance.

Es relevante ahora porque demuestra que una tarea de triaje de soporte puede resolverse con un modelo de 60M de parámetros a una fracción del coste de un LLM alojado, con una precisión reportada del 99,5 % en el conjunto de test y 96,2 % en 160 mensajes escritos manualmente, aunque con la advertencia de que nueve de los diez idiomas de evaluación son traducciones automáticas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (ModernBERT, base jhu-clsp/mmBERT-small) |
| Parametros totales | ~60M (según model card) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8 weight-only (ONNX); pesos originales del modelo base disponibles |
| Idiomas soportados | en, pl, de, fr, es, it, nl, pt, cs, sv |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (transformers.js); safetensors del modelo base |
| Tarea | text-classification (27 clases + out_of_scope) |
| Tamano del repo | 0,1 GB |

## Arquitectura y entrenamiento

El modelo es un ajuste fino de mmBERT-small, un encoder tipo ModernBERT multilingüe. Sobre él se aplica una cabeza de clasificación de secuencia con 27 tipos de petición más la clase `out_of_scope`. El preprocesado es específico: el texto se pasa a minúsculas y se le eliminan los signos de puntuación antes de la tokenización, y el vocabulario está podado, de modo que los tokens no vistos en entrenamiento se mapean a UNK.

El entrenamiento parte del dataset Bitext customer support (inglés, licencia CDLA-Sharing-1.0), traducido automáticamente con MADLAD-400 3B a los otros nueve idiomas. Como ejemplos negativos de `out_of_scope` se usan frases de FLORES-200 y Tatoeba. La mitad de las filas de entrenamiento se envuelven en un mensaje realista (saludo, número de pedido o nombre, despedida) y el 30 % recibe una errata o un intercambio de palabras. Se entrenó 4 épocas con lr 5e-5, batch 64, label smoothing 0.1, dropout 0.1 y un peso de pérdida de 0.5 para la clase fuera de alcance, con semilla 42. La receta está en `configs/mmbert-small.yaml` del repositorio.

## Capacidades

- Clasificación de intención de mensajes de soporte en 27 tipos de petición y 11 departamentos de una tienda online.
- Detección de mensajes fuera de alcance (`out_of_scope`) con recall reportado del 99,2 % y tasa de falso rechazo del 0,07 %.
- Multilingüe en diez idiomas europeos, con entrenamiento en datos traducidos automáticamente.
- Robustez ante ruido: entrenado con erratas, palabras intercambiadas, saludos y números de pedido embebidos en el mensaje.
- Inferencia en navegador y en CPU mediante transformers.js y ONNX Runtime (dtype `q8`).
- Salida de top-k etiquetas con puntuaciones mediante la opción `top_k` del pipeline.
- No soporta generación de texto, tool calling, agentes ni razonamiento multi-paso: es exclusivamente un clasificador.

## Casos de uso

- Triaje de bandeja de entrada de soporte: clasificar cada mensaje entrante en uno de los 27 tipos de petición para enrutarlo al equipo o cola correcta, con latencia de 7,5 ms por mensaje en CPU de 4 hilos.
- Prefiltro antes de un LLM: descartar o marcar mensajes `out_of_scope` (spam, consultas no relacionadas) antes de invocar un modelo generativo, reduciendo coste y latencia del pipeline.
- Clasificación en el cliente (navegador): integrar el modelo con transformers.js en un formulario web para sugerir el departamento adecuado mientras el usuario escribe, sin enviar datos a un servidor.
- Enrutamiento multilingüe en tiendas paneuropeas: un único modelo cubre diez idiomas, evitando mantener clasificadores separados por locale.
- Etiquetado y análisis de históricos de tickets: procesar grandes volúmenes de mensajes almacenados para generar estadísticas de motivos de contacto por departamento.
- Automatización de respuestas basadas en plantilla: asociar cada tipo de petición a una respuesta predefinida o a un flujo de autoservicio, usando el clasificador como disparador.
- Moderación de canales de soporte: detectar mensajes que no son solicitudes de soporte para derivarlos a otros canales o descartarlos.

## Benchmarks y rendimiento

| Modelo | Test split (media de 10 locales, %) | 160 mensajes escritos a mano (%) | Recall not-a-request / falso rechazo (%) | Latencia CPU |
|---|---|---|---|---|
| Este modelo, 60M params, int8 64 MB | 99,5 | 96,2 | 99,2 / 0,07 | 7,5 ms (ORT, 4 hilos) |
| mmBERT-base, misma receta sin mensajes manuales de entrenamiento | 99,4 | 75,6 | 99,6 / 0,14 | 31,7 ms (PyTorch fp32) |

El test split consta de 2.569 peticiones en inglés de Bitext más 1.080 peticiones traducidas automáticamente por cada uno de los otros locales. Los 160 mensajes escritos a mano fueron redactados por el autor de los mensajes de entrenamiento con escenarios disjuntos, por lo que el 96,2 % es un límite superior para una bandeja de entrada real. La cuantización int8 coincide con PyTorch fp32 en 400 de 400 mensajes de paridad. La comparación con LLM alojados está pendiente (Gemini free tier).

## Requisitos de hardware

- VRAM/RAM: el modelo int8 ocupa unos 64 MB; la inferencia puede ejecutarse íntegramente en CPU.
- GPU: no requiere GPU; funciona en cualquier CPU moderna. Para lotes grandes, una GPU consumer (RTX 4090, etc.) aceleraría el throughput, pero no es necesaria.
- Cabe holgadamente en cualquier GPU consumer e incluso en dispositivos móviles vía ONNX Runtime.
- Despliegue: transformers.js (navegador/Node), ONNX Runtime; el modelo base puede cargarse en PyTorch/Transformers para reentrenamiento o exportación.
- Latencia: 7,5 ms por mensaje en CPU con ONNX Runtime y 4 hilos (según model card). Throughput no publicado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| mmbert-small-support-triage | ~60M | no disponible | 10 | Apache-2.0 | ONNX int8 | Clasificador específico de triaje de soporte |
| mmBERT-base (misma receta) | mayor que 60M (no especificado) | no disponible | 10 | Apache-2.0 | PyTorch fp32 | 75,6 % en mensajes manuales; 31,7 ms en CPU |
| jhu-clsp/mmBERT-small (base) | ~60M | no disponible | multilingüe | Apache-2.0 | safetensors | Modelo base sin ajuste; no clasifica intenciones |

No se dispone de comparación con LLM alojados en la información proporcionada.

## Limitaciones y advertencias

- Nueve de los diez idiomas de test son traducciones automáticas; la única medición sobre texto humano son los 160 mensajes escritos a mano, por lo que el rendimiento real en producción puede ser inferior.
- Taxonomía única de comercio electrónico: preguntas de producto, garantía o temas B2B no tienen clase asignada y caerán en categorías incorrectas o en `out_of_scope`.
- Una sola etiqueta por mensaje: no admite mensajes con múltiples intenciones.
- Vocabulario podado: los tokens no vistos en entrenamiento se mapean a UNK, lo que puede degradar la clasificación de jerga, marcas o errores ortográficos no contemplados.
- El preprocesado obliga a minúsculas y eliminación de puntuación; usos distintos del previsto pueden alterar los resultados.
- Riesgo de alucinación no aplica (no genera texto), pero sí de falsos positivos/negativos en la clasificación.
- Licencia Apache-2.0 permite uso comercial; los datos de entrenamiento tienen licencias propias (Bitext CDLA-Sharing-1.0, FLORES-200 CC BY-SA 4.0, Tatoeba CC BY 2.0) que conviene revisar si se redistribuyen derivados.
- Modelo con 0 descargas y 0 likes en el momento de la consulta: sin validación externa por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/balticml/mmbert-small-support-triage
- Repositorio de código, pipeline de datos y benchmark: https://github.com/balticml/support-triage
- Modelo base: https://huggingface.co/jhu-clsp/mmBERT-small
- Dataset Bitext: https://huggingface.co/datasets/bitext/Bitext-customer-support-llm-chatbot-training-dataset
