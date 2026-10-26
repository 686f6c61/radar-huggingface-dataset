# parlaval/laya-toxicity

## Resumen

`parlaval/laya-toxicity` es un clasificador de texto para moderación de contenido, publicado por el usuario parlaval como parte del filtro de toxicidad del proyecto ParlaVal. No es un modelo generativo: es un encoder afinado que responde dos preguntas de moderación independientes sobre un texto de entrada, una orientada al "núcleo" de la toxicidad (insultos, ataques, amenazas, odio, contenido sexual, acoso o violencia, sin contar el mero lenguaje vulgar) y otra que detecta específicamente si el texto es vulgar. Esta separación en dos ejes permite distinguir un insulto grave de un taco aislado, algo que los clasificadores binarios de toxicidad habituales no hacen.

El modelo parte de `jhu-clsp/mmBERT-base`, un encoder multilingüe de la familia ModernBERT, y se distribuye en formato safetensors con 321.908.998 parámetros totales y un repositorio de 0,7 GB, lo que corresponde a pesos en precisión de 16 bits. Se carga mediante la biblioteca `laya`, que expone el modelo como un "agente de decisión": una sola pasada hacia delante devuelve etiquetas de decisión en lugar de texto generado. Las etiquetas concretas y las instrucciones asociadas viven en el fichero `questions.json` del repositorio, según indica la model card.

Su relevancia es doble. Por un lado, cubre moderación en catalán dentro de un ecosistema donde la mayoría de filtros comerciales están optimizados para inglés. Por otro, su tamaño (322 M de parámetros) permite ejecutarlo en hardware de consumo y en CPU, algo determinante para moderación en tiempo real o para filtrar corpus grandes. Como contrapartida, es un checkpoint recién publicado (creado el 26 de octubre de 2026, con 0 descargas y 0 likes en el momento de redactar esta ficha), sin licencia declarada, sin lista de idiomas y sin benchmarks publicados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Encoder transformer (derivado de `jhu-clsp/mmBERT-base`, familia ModernBERT) |
| Parámetros totales | 321.908.998 |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (el autor no declara la ventana efectiva tras el ajuste fino) |
| Tipos de cuantización | No se publican variantes cuantizadas; solo pesos safetensors (repositorio de 0,7 GB, compatible con bf16/fp16). Convertible a int8/int4 con herramientas externas |
| Idiomas soportados | No disponible. La model card está redactada en catalán y el proyecto ParlaVal es de ámbito catalán; el modelo base mmBERT es multilingüe, pero el autor no declara cobertura lingüística |
| Licencia | No disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La información disponible confirma únicamente que se trata de un ajuste fino de `jhu-clsp/mmBERT-base` y que la inferencia se realiza con la biblioteca `laya`. mmBERT-base es un encoder de la familia ModernBERT, con 322 M de parámetros, orientado a clasificación y recuperación multilingüe; el recuento real de safetensors (321,9 M) coincide con esa talla, lo que descarta que se hayan añadido cabezas de gran tamaño. Al ser una tarea de clasificación, la salida no es texto libre sino decisiones tipadas sobre dos preguntas de moderación definidas en `questions.json`.

No hay información pública sobre el dataset de ajuste fino, el número de tokens empleados, la composición de las muestras, el balance entre clases ni si se aplicaron técnicas de calibración, DPO o RLHF. Tampoco se documenta si se congelaron capas del encoder o se ajustó completo, ni qué hiperparámetros se usaron. La model card original presenta problemas de codificación (aparecen caracteres corruptos en los encabezados y en la descripción de la etiqueta de violencia), un detalle a tener en cuenta al parsear automáticamente el repositorio. En el ecosistema Laya, el modelo se describe como un "agente de decisión" que ejecuta una única pasada hacia delante y devuelve resultados con valores de confianza; esa descripción proviene de material de terceros sobre la familia Laya, no de la model card de este checkpoint concreto.

## Capacidades

- Clasificación de toxicidad en dos preguntas independientes: "núcleo" (insultos, ataques, amenazas, odio, contenido sexual, acoso o violencia) y "vulgar" (lenguaje vulgar), según la definición literal de la model card.
- Distinción explícita entre toxicidad grave y vulgaridad: el eje "núcleo" excluye el lenguaje vulgar aislado, lo que reduce falsos positivos sobre tacos no dirigidos a nadie.
- Salida de decisión estructurada en lugar de texto generado, adecuada para integrarse como función booleana o etiqueta en un pipeline.
- Carga mediante la biblioteca `laya` y el fichero `questions.json`, que contiene las etiquetas e instrucciones completas del clasificador.
- Compatible con el ecosistema `transformers` al ser un checkpoint safetensors derivado de mmBERT, aunque el autor solo documenta la vía `laya`.
- Capacidad multilingüe potencial heredada del modelo base, no confirmada ni declarada por el autor para este ajuste.
- No soporta tool calling, agentes multi-paso, visión, audio ni modo de razonamiento extendido: es un clasificador de una sola pasada.

## Casos de uso

- Moderación de comentarios en medios digitales en catalán: el clasificador se sitúa delante del sistema de publicación y decide entre ocultar, revisar o publicar, usando el eje "núcleo" para la retirada automática y el eje "vulgar" para marcar contenido que solo requiere una advertencia al lector.
- Premoderación de contenido generado por usuarios en foros y comunidades: al ser un encoder de 322 M, se puede ejecutar en cada envío con una sola pasada, sin los costes de latencia y tokens de un LLM generativo.
- Filtrado de corpus para investigación: aplicar el modelo sobre grandes volúmenes de texto catalán antes de usarlos en entrenamiento o análisis, con dos umbrales distintos según se quiera descartar solo toxicidad grave o también vulgaridad.
- Moderación en chats de atención al cliente: clasificar mensajes entrantes para derivar los casos de acoso o amenazas a un agente humano, manteniendo el flujo normal cuando el mensaje solo contiene lenguaje coloquial.
- Señal auxiliar en pipelines de moderación con LLM: usar el clasificador como primera etapa barata y reservar el modelo generativo (o la revisión humana) para los casos con confianza baja o etiquetados como "núcleo".
- Evaluación comparativa de sistemas de moderación: al devolver decisiones tipadas y reproducibles, sirve como referencia fija en experimentos A/B frente a APIs comerciales de moderación.
- Despliegue en el borde o en CPU: escenarios con requisitos de privacidad (por ejemplo, moderar mensajes sin enviarlos a un servicio externo) o con presupuesto de GPU nulo.
- Integración en flujos de agentes basados en Laya: el modelo encaja como "decisión" dentro de un pipeline Laya que necesite un paso de control de contenido antes de ejecutar una acción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de precisión, recall, F1 ni matrices de confusión, y el repositorio no aporta un conjunto de evaluación. Tampoco hay datos de latencia o throughput medidos por el autor.

Como contexto, existe un artículo de terceros (`jmgb27/laya-vs-jev-toxicity`) que compara un ajuste fino distinto de Laya con la API comercial Jev sobre 2.000 comentarios de Civil Comments y reporta una diferencia de 83 % frente a 27 % en comentarios tóxicos. Ese resultado no corresponde a este checkpoint, no está replicado y no debe atribuirse a `parlaval/laya-toxicity`.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin overhead de runtime): ~1,29 GB en fp32, ~0,64 GB en fp16/bf16, ~0,32 GB en int8 y ~0,16 GB en int4 para 321,9 M de parámetros. El tamaño del repositorio (0,7 GB) sugiere que los pesos publicados están en 16 bits.
- En la práctica, con activaciones y overhead de framework, el modelo cabe holgadamente en cualquier GPU con 2 GB o más de VRAM.
- GPU recomendadas: no hay requisitos declarados. Por tamaño, cualquier GPU consumer sirve (RTX 3060, RTX 4060, RTX 4090), así como GPUs de datacenter (T4, L4, A10, A100, H100) para despliegues con mucha concurrencia.
- Inferencia en CPU viable: con 322 M de parámetros, un servidor sin GPU puede servir el modelo para moderación de bajo volumen, especialmente tras exportar a ONNX o cuantizar a int8.
- Opciones de despliegue: la vía documentada es la biblioteca `laya` (`laya.load(model_path)` sobre una descarga con `huggingface_hub`). Al ser un checkpoint safetensors derivado de mmBERT, debería poder cargarse con `transformers` y exportarse a ONNX con Optimum, aunque el autor no lo documenta. No hay GGUF publicado, por lo que llama.cpp y Ollama no están disponibles de serie; vLLM y TGI están orientados a modelos generativos y no se documentan para este checkpoint.
- Latencia y throughput: no disponibles. Al tratarse de un encoder de 322 M y una sola pasada, es razonable esperar latencias de milisegundos en GPU moderna y decenas de milisegundos en CPU para secuencias cortas, pero son estimaciones, no cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| `parlaval/laya-toxicity` | 321,9 M | No disponible | No disponible | HuggingFace, biblioteca `laya` | Dos ejes (núcleo y vulgar), orientado a catalán por contexto del proyecto, sin benchmarks |
| `jhu-clsp/mmBERT-base` (modelo base) | ~322 M | Ventana larga (no confirmada para este ajuste) | No verificada en la información disponible | HuggingFace | Encoder multilingüe sin cabeza de moderación; requiere ajuste propio |
| Laya (variante ModernBERT-large) | ~421 M | No disponible | No disponible | Ecosistema Laya | Según material de terceros, Laya se ofrece también en talla large; no hay confirmación de que exista un checkpoint de toxicidad con esa talla |
| APIs comerciales de moderación (p. ej. Jev) | No disponible | No disponible | Propietaria, de pago | API | Comparadas con un ajuste fino distinto de Laya en un artículo de terceros; sin datos aplicables a este checkpoint |

No se dispone de resultados de benchmarks que permitan una comparación cuantitativa fiable entre estas opciones. La comparación debe limitarse, por tanto, a talla, licencia y forma de despliegue.

## Limitaciones y advertencias

- Licencia no declarada: sin licencia explícita no hay autorización clara para uso comercial. Es un bloqueante para producción hasta que el autor la concrete.
- Checkpoint sin validación pública: 0 descargas y 0 likes, publicado y actualizado el mismo día, sin métricas ni conjunto de evaluación. No hay evidencia publicada de su precisión real.
- Idiomas no declarados: aunque el proyecto es de ámbito catalán y el modelo base es multilingüe, no se especifica qué lenguas cubre el ajuste fino ni con qué calidad fuera del catalán.
- Riesgo de sesgo y de falsos positivos en dos direcciones: el eje "núcleo" puede sobrerreaccionar ante crítica política, jerga o reapropiación de insultos; el eje "vulgar" puede señalar lenguaje coloquial legítimo. Sin datos de evaluación no es posible acotar ninguno de los dos.
- Ambigüedad inherente al etiquetado de toxicidad: la definición de "núcleo" depende del criterio del anotador y de la instrucción concreta en `questions.json`; cambios en ese fichero alteran el comportamiento del modelo.
- Sin información sobre el dataset de entrenamiento: no se puede auditar la distribución de dominios (redes sociales, noticias, foros), lo que limita saber si generaliza a comentarios largos, sarcasmo o ironía.
- Dependencia de la biblioteca `laya`: la vía de carga documentada pasa por una librería específica; su mantenimiento, versionado y compatibilidad no están garantizados por la información disponible.
- Model card con problemas de codificación: los caracteres corruptos en el README y en las etiquetas dificultan el parseo automático y pueden introducir errores si se copian literalmente.
- Al ser un encoder de clasificación, no puede explicar sus decisiones ni generar justificaciones; cualquier flujo que requiera motivar la moderación ante un usuario necesita una capa adicional.
- No apto para moderación de imágenes, audio o vídeo: la entrada es exclusivamente texto.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/parlaval/laya-toxicity
- Modelo base: https://huggingface.co/jhu-clsp/mmBERT-base
- Demos de Laya (terceros): https://laya.acurast.com/
- Repositorio de comparación Laya vs Jev sobre toxicidad (terceros, ajuste fino distinto): https://github.com/jmgb27/laya-vs-jev-toxicity
- Artículo de análisis comparativo de modelos de decisión Laya y Jev (terceros): https://4sapi.hashnode.dev/laya-vs-jev-in-depth-comparative-analysis-of-two-popular-open-decision-models-for-agent-workflows
- Cuaderno de ajuste fino de toxicidad en coreano con Laya (terceros, otro dataset): https://www.kaggle.com/code/tanat05/laya-korean-toxicity-model-training
