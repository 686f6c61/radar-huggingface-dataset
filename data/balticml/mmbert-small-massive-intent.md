# balticml/mmbert-small-massive-intent

## Resumen

mmbert-small-massive-intent es un modelo de clasificación de texto especializado en detección de intenciones (intent classification) para comandos de asistente. Lo desarrolla balticml a partir de jhu-clsp/mmBERT-small, un transformer de arquitectura ModernBERT de 84 millones de parámetros, afinado sobre el dataset MASSIVE 1.1 de Amazon Science, que cubre 60 intenciones en 52 locales. Sobre esas 60 clases el autor añade una 61ª, `out_of_scope`, para discriminar texto que no constituye un comando de asistente.

El modelo resuelve un problema muy concreto en pipelines de asistentes conversacionales: clasificar utterances cortas en una de 60 intenciones con cobertura multilingüe real, sin depender de un LLM generativo. Según la model card, con solo 84M de parámetros supera a Gemini 3.5 Flash-Lite en zero-shot (85,1% de accuracy media en 52 locales frente a 81,5%) y a Qwen2.5-7B-Instruct Q4_K_M (50,5%), con una latencia de 4,2 ms por utterance en ONNX Runtime sobre cuatro hilos de CPU.

Su relevancia práctica está en el formato de despliegue: se distribuye como ONNX cuantizado a int8 (88 MB) para transformers.js, con el vocabulario podado a 108.659 filas y los ids remapeados dentro del grafo. Esto permite ejecutar la clasificación en el navegador o en CPU de bajo coste, con licencia Apache-2.0.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ModernBERT (transformer encoder), base jhu-clsp/mmBERT-small |
| Parámetros totales | 84M |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | int8 weight-only (ONNX); el autor reporta paridad int8/fp32 en 399 de 400 utterances |
| Idiomas soportados | multilingüe: 52 locales de MASSIVE |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (`onnx/model_quantized.onnx`, 88 MB), tokenizer.json y configs (34 MB) |

## Arquitectura y entrenamiento

El modelo parte de mmBERT-small, un encoder transformer de la familia ModernBERT, y se afina como clasificador de secuencia con 61 etiquetas de salida (60 intenciones de MASSIVE más `out_of_scope`). El preprocesado es parte del contrato del modelo: las entradas se convierten a minúsculas y se les elimina la puntuación antes de la tokenización, tal como hace el widget de HuggingFace. El tokenizador es el de mmBERT sin modificar, aunque el vocabulario del grafo ONNX se ha podado a 108.659 filas; los tokens fuera de ese vocabulario se mapean a UNK.

El entrenamiento usa las 52 particiones de train de MASSIVE más 1.500 frases no-comando por locale (dev de FLORES-200 y Tatoeba) con peso de pérdida 0,3 para la clase `out_of_scope`. Se aplica aumento de datos sobre el 30% de las utterances (una errata o una palabra intercambiada), 4 épocas, learning rate 5e-5, batch 64, dropout 0,1, label smoothing 0,1, weight decay 0,05, precisión bf16 y semilla 42, seleccionando la mejor época por validación. La innovación destacable no es arquitectónica sino de empaquetado: exportación a ONNX con cuantización int8 weight-only y poda de vocabulario dentro del grafo, orientada a inferencia en CPU y en navegador vía transformers.js.

## Capacidades

- Clasificación de intenciones en 60 clases del esquema MASSIVE más una clase `out_of_scope` para texto que no es un comando de asistente.
- Detección de no-comando: recall del 94,8% (media de 52 locales) sobre frases de FLORES-200 y Tatoeba retenidas; solo el 1,5% de los comandos del test de MASSIVE se rechazan.
- Cobertura multilingüe en 52 locales, incluyendo en-US, pl-PL, de-DE, fr-FR y ja-JP con resultados reportados.
- Robustez a erratas y palabras intercambiadas, introducidas de forma deliberada en el 30% de las utterances de entrenamiento.
- Inferencia en navegador mediante transformers.js con `dtype: "q8"` y salida `top_k`.
- No soporta tool calling, generación de texto, razonamiento multi-step, visión ni audio: es un clasificador discriminativo, no un modelo generativo.

## Casos de uso

- Enrutado de intenciones en asistentes de voz o chat: el modelo clasifica la utterance del usuario en una de las 60 intenciones y el sistema despacha al handler correspondiente, con la clase `out_of_scope` para derivar a un LLM o a un mensaje de fallback.
- Clasificación en el navegador sin backend: con transformers.js y el ONNX int8 de 88 MB, la app puede ejecutar la clasificación en el cliente, reduciendo latencia de red y coste de servidor.
- Prefiltro en pipelines híbridos: usar el modelo como primera etapa barata (4,2 ms por utterance en CPU de 4 hilos) y reservar el LLM generativo solo para las utterances que caen en `out_of_scope` o con baja confianza.
- Asistentes multilingües con un único modelo: al cubrir 52 locales, evita mantener un clasificador por idioma; útil en productos con base de usuarios internacional.
- Detección de comandos frente a conversación libre: el recall del 94,8% en no-comandos permite separar tráfico de comandos de charla general antes de invocar herramientas o acciones.
- Moderación de entrada en sistemas de comandos por voz: descartar utterances que no son comandos antes de ejecutar acciones evita activaciones erróneas.
- Anotación y análisis de logs: clasificar grandes volúmenes de utterances históricas en las 60 intenciones para analítica de uso, en CPU y sin GPU.

## Benchmarks y rendimiento

Accuracy (%) en el split de test de MASSIVE. Las filas de LLM usan la lista de etiquetas en el prompt y 200 utterances de test por locale.

| Modelo | en-US | pl-PL | de-DE | fr-FR | ja-JP | Media 52 locales |
|---|---|---|---|---|---|---|
| mmbert-small-massive-intent (84M) | 88,4 | 86,2 | 86,3 | 87,3 | 87,2 | 85,1 |
| Gemini 3.5 Flash-Lite, zero-shot | 84,5 | 85,0 | 83,5 | 81,5 | 82,0 | 81,5 |
| Qwen2.5-7B-Instruct Q4_K_M, zero-shot | 63,0 | 60,5 | 62,0 | 62,0 | 63,0 | 50,5 |

Métricas adicionales reportadas por el autor: recall de no-comando del 94,8% (media de 52 locales) en FLORES-200 y Tatoeba retenidos; 1,5% de comandos de test de MASSIVE rechazados; paridad int8/fp32 en 399 de 400 utterances; 4,2 ms por utterance en ONNX Runtime con cuatro hilos de CPU.

## Requisitos de hardware

- VRAM: no requiere GPU; el artefacto ONNX int8 ocupa 88 MB y está pensado para CPU.
- GPU recomendadas: no aplica; cualquier GPU puede ejecutarlo, pero el diseño apunta a CPU y navegador.
- Cabe en cualquier consumer GPU y en CPU de gama baja; el repo completo pesa 0,2 GB.
- Despliegue: transformers.js (navegador o Node) con `dtype: "q8"`; ONNX Runtime en servidor; también puede cargarse con la librería transformers de Python usando los pesos del modelo base, aunque el artefacto publicado es ONNX.
- Latencia: 4,2 ms por utterance en ONNX Runtime con cuatro hilos de CPU (dato del autor). Throughput no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Accuracy media (52 locales, MASSIVE) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mmbert-small-massive-intent | 84M | no disponible | 85,1 | Apache-2.0 | HuggingFace, ONNX int8 |
| Gemini 3.5 Flash-Lite (zero-shot) | no disponible | no disponible | 81,5 | propietaria | API |
| Qwen2.5-7B-Instruct Q4_K_M (zero-shot) | 7B | no disponible | 50,5 | Apache-2.0 | HuggingFace, GGUF |
| jhu-clsp/mmBERT-small (base) | 84M | no disponible | no disponible (no es clasificador de intenciones) | Apache-2.0 | HuggingFace |

La comparación con LLM zero-shot no es del todo equivalente: el modelo está afinado específicamente sobre MASSIVE, mientras que los LLM reciben la lista de etiquetas en el prompt sin entrenamiento. Aun así, el dato relevante es que un encoder de 84M supera en precisión media a un LLM propietario y a un 7B cuantizado, con una latencia tres órdenes de magnitud menor.

## Limitaciones y advertencias

- Dominio restringido: construido para comandos cortos de asistente en los 52 locales de MASSIVE; otros dominios y lenguas puntuarán peor, según advierte el propio autor.
- MASSIVE no incluye intención de temporizador (timer), por lo que esa clase no existe en el esquema.
- El preprocesado es obligatorio: hay que pasar las entradas a minúsculas y eliminar la puntuación antes de tokenizar, o el rendimiento caerá.
- La poda de vocabulario a 108.659 filas implica que los tokens fuera de ese conjunto se mapean a UNK; texto con caracteres raros o dominios léxicos alejados puede degradarse.
- Riesgo de alucinación no aplica en el sentido generativo, pero sí hay riesgo de clasificación errónea: el 1,5% de comandos de test se rechazan como `out_of_scope`.
- Sesgos: no se documentan análisis de sesgo por locale, género o dominio; la cobertura desigual de MASSIVE entre locales puede traducirse en precisión desigual.
- Licencia Apache-2.0 permite uso comercial; el dataset MASSIVE es CC BY 4.0 y mmBERT es Apache-2.0, ambas compatibles.
- Para producción: conviene calibrar umbrales de confianza y monitorizar la tasa de `out_of_scope`, ya que el modelo no expone probabilidades calibradas más allá del softmax del clasificador.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/balticml/mmbert-small-massive-intent
- Repositorio de código y benchmarks: https://github.com/balticml/intent-detection
- Demo: https://balticml.eu/demos/intent-detection/
- Modelo base: https://huggingface.co/jhu-clsp/mmBERT-small
- Dataset MASSIVE: https://huggingface.co/datasets/AmazonScience/massive
- transformers.js: https://cdn.jsdelivr.net/npm/@huggingface/transformers@4.3.1/dist/transformers.min.js
