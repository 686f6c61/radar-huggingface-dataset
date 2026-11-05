# balticml/mmbert-small-support-triage-phone

## Resumen

mmbert-small-support-triage-phone es un modelo de clasificación de texto derivado de jhu-clsp/mmBERT-small, desarrollado por balticml, que resuelve una tarea muy concreta: enrutar un mensaje de cliente de una tienda online a una de 27 categorías de solicitud repartidas en 11 departamentos, o a la clase `out_of_scope` cuando el mensaje no es una petición. Es la variante "phone" de mmbert-small-support-triage: mismo recetario y etiquetas, pero con 12 de las 22 capas de mmBERT-small en lugar de 16 y un tokenizador podado, lo que reduce la descarga a 47 MB y el consumo de memoria en navegador a unos 187 MB.

El modelo está pensado para inferencia en el navegador mediante transformers.js y ONNX Runtime (WASM, un solo hilo), con pesos int8 de 44 MB más un tokenizador podado de 3 MB. Cubre diez idiomas (en, pl, de, fr, es, it, nl, pt, cs, sv) y se entrenó sobre el dataset Bitext de atención al cliente. Su relevancia radica en la relación entre tamaño y precisión: con 12 capas mantiene el 99,1 % de acierto en el split de test y el 91,9 % en 160 mensajes escritos a mano, a costa de 3 puntos porcentuales frente a la versión de 16 capas.

La poda del tokenizador es la innovación más destacable: el tokenizador completo de mmBERT tiene 256.000 tokens y 580.604 merges (~90 MB en navegador), mientras que el podado conserva 51.032 tokens y 128.416 merges con los ids intactos, de modo que la tokenización es idéntica para cualquier texto que solo use tokens conocidos (verificado en 9.819 textos).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (ModernBERT, base jhu-clsp/mmBERT-small), 12 de 22 capas |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8 (ONNX, dtype `q8`); tamano de pesos int8: 44 MB |
| Idiomas soportados | en, pl, de, fr, es, it, nl, pt, cs, sv |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (transformers.js); tokenizador podado de 3 MB |

## Arquitectura y entrenamiento

Se trata de un encoder transformer de la familia ModernBERT, obtenido por destilación estructural (recorte de capas) desde jhu-clsp/mmBERT-small: conserva 12 de las 22 capas del modelo base y reutiliza su recetario de entrenamiento, sus etiquetas y su pipeline de datos. La tarea es clasificación multiclase de una sola etiqueta por mensaje: 27 tipos de solicitud en 11 departamentos de una tienda online más la clase `out_of_scope`. El dataset de entrenamiento es bitext/Bitext-customer-support-llm-chatbot-training-dataset (licencia CDLA-Sharing-1.0); el modelo base mmBERT es Apache-2.0.

La innovación técnica principal es el tokenizador podado. El tokenizador completo de mmBERT (256.000 tokens, 580.604 merges) ocupa unos 90 MB en un navegador, pero el modelo solo conoce los 46.681 tokens vistos en entrenamiento; el resto se convierte en `[UNK]` dentro del grafo. El tokenizador podado conserva esos tokens, todos los tokens intermedios que genera BPE en el camino hacia ellos, los tokens de byte-fallback y especiales, y los merges entre ellos: 51.032 tokens y 128.416 merges, con ids sin cambios. La equivalencia de tokenización se comprobó en 9.819 textos (split de test, frases no-petición, mensajes escritos a mano y 5.000 cadenas inventadas). Las palabras nunca vistas se fragmentan en piezas conocidas en lugar de convertirse en `[UNK]`, lo que cuesta 3 de 160 mensajes en el conjunto escrito a mano (116 de 160 contienen alguna palabra de ese tipo). No se documentan fases de RLHF ni DPO; es un modelo de clasificación supervisada.

## Capacidades

- Clasificación de intención en atención al cliente: asigna un mensaje a una de 27 categorías de solicitud en 11 departamentos de una tienda online.
- Detección de mensajes fuera de alcance: clase `out_of_scope` con una recall de 98,3 % en frases que no son peticiones.
- Multilingüe en diez idiomas: en, pl, de, fr, es, it, nl, pt, cs, sv.
- Inferencia en navegador: compatible con transformers.js y ONNX Runtime sobre WASM con un solo hilo, sin backend de servidor.
- Salida con top-k: la API permite recuperar las 3 (o más) clases más probables mediante `{ top_k: 3 }`.
- No soporta generación de texto, tool calling, razonamiento multi-paso ni visión: es un clasificador puro de una etiqueta por mensaje.
- Requiere normalización previa del texto por parte del usuario (minúsculas, eliminación de puntuación salvo apóstrofos, colapso de espacios).

## Casos de uso

- Enrutado de tickets en el front-end de una tienda online: el modelo se ejecuta en el navegador del cliente o del agente y clasifica el mensaje antes de enviarlo al backend, reduciendo llamadas a la API y latencia percibida; encaja por su tamaño de 47 MB y 187 MB de memoria.
- Widget de ayuda en una web multilingüe: al cubrir diez idiomas europeos, un único modelo sirve para detectar la intención del usuario en su idioma y dirigirlo al formulario o canal correcto.
- Triaje previo a un LLM generativo: clasificar primero el mensaje con este modelo (99,1 % en test) y reservar el modelo grande solo para los casos que requieren respuesta generativa, lo que abarata el coste por consulta.
- Filtrado de mensajes no accionables: la clase `out_of_scope` con recall de 98,3 % permite descartar spam, saludos o mensajes ambiguos antes de crear un ticket.
- Aplicaciones de escritorio o extensiones sin servidor: al ejecutarse en WASM con un solo hilo, puede integrarse en Electron, extensiones de navegador o PWA sin infraestructura de GPU.
- Etiquetado asistido de históricos de soporte: procesar en lote conversaciones antiguas para preasignar categoría y departamento antes de la revisión humana, aprovechando el rendimiento en CPU.

## Benchmarks y rendimiento

Resultados publicados en la model card (precisión en %, archivos ONNX int8 en ONNX Runtime, 500 peticiones de test y 500 frases no-petición por idioma, semilla 0):

| Modelo | Test split (5.000) | 160 mensajes a mano | Recall no-petición | Descarga | Memoria navegador |
|---|---|---|---|---|---|
| Este modelo: 12 capas, int8 44 MB, tokenizador podado 3 MB | 99,1 | 91,9 | 98,3 | 47 MB | 187 MB |
| Mismo modelo con tokenizador completo | 99,1 | 93,8 | 98,2 | 78 MB | no disponible |
| Modelo de 16 capas, tokenizador podado (v1.3.0) | 99,3 | 96,9 | 98,6 | 55 MB | 238 MB |
| Modelo de 16 capas, tokenizador completo (v1.2.0) | 99,3 | 96,9 | 98,4 | 86 MB | 307 MB |

La model card del modelo de 16 capas reporta 96,2 en los mensajes escritos a mano en PyTorch fp32; la versión int8 acierta un mensaje más. La memoria se midió en Chrome con `performance.measureUserAgentSpecificMemory()` tras cargar el modelo, ordenar ocho mensajes y clasificar treinta más, en WASM con un solo hilo, y no crece con el uso. Los 160 mensajes escritos a mano fueron redactados por el autor de los mensajes de entrenamiento, por lo que constituyen una cota superior para una bandeja de entrada real.

## Requisitos de hardware

- VRAM: no requiere GPU; los pesos int8 ocupan 44 MB y el tokenizador podado 3 MB, con unos 187 MB de memoria de navegador en Chrome (WASM, un hilo).
- GPU recomendadas: no aplica para el caso de uso previsto (navegador/WASM); puede ejecutarse en CPU sin aceleración.
- Cabe en cualquier GPU de consumo e integrada, y en dispositivos móviles, dado su tamaño.
- Despliegue: transformers.js con ONNX Runtime (`dtype: "q8"`, `device: "wasm"`); también puede servirse como ONNX en otros runtimes compatibles.
- Latencia y throughput: no se han publicado cifras de latencia o throughput en la información disponible.

## Comparativa con modelos similares

| Modelo | Capas | Test split | Mensajes a mano | Descarga | Memoria navegador | Licencia |
|---|---|---|---|---|---|---|
| mmbert-small-support-triage-phone (este) | 12 | 99,1 | 91,9 | 47 MB | 187 MB | Apache-2.0 |
| mmbert-small-support-triage (16 capas, tokenizador podado) | 16 | 99,3 | 96,9 | 55 MB | 238 MB | Apache-2.0 |
| mmbert-small-support-triage (16 capas, tokenizador completo) | 16 | 99,3 | 96,9 | 86 MB | 307 MB | Apache-2.0 |

No se dispone de datos de otros modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- Nueve de los diez idiomas de test son traducciones automáticas, lo que puede introducir artefactos respecto a texto nativo.
- Una sola taxonomía de comercio electrónico y una sola etiqueta por mensaje: no admite clasificación multietiqueta ni dominios distintos.
- Rendimiento 3 puntos inferior en los 160 mensajes escritos a mano (91,9 frente a 96,9 del modelo de 16 capas); esos mensajes los escribió el autor de los de entrenamiento, así que son una cota superior.
- La poda del tokenizador degrada la tokenización de palabras nunca vistas: se fragmentan en piezas conocidas y se pierden 3 de 160 mensajes en el conjunto escrito a mano.
- Riesgo de alucinación no aplica en sentido generativo (es un clasificador), pero sí de clasificación errónea en mensajes ambiguos o fuera de la taxonomía.
- La licencia del modelo es Apache-2.0 y permite uso comercial; el dataset Bitext tiene licencia CDLA-Sharing-1.0, que conviene revisar si se redistribuyen datos derivados.
- Requiere normalización explícita del texto antes de la inferencia; omitirla puede alterar los resultados.
- No se han publicado datos de sesgo demográfico o lingüístico en la información disponible.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/balticml/mmbert-small-support-triage-phone
- Modelo de 16 capas: https://huggingface.co/balticml/mmbert-small-support-triage
- Modelo base: https://huggingface.co/jhu-clsp/mmBERT-small
- Código, pipeline de datos y benchmark: https://github.com/balticml/support-triage
- Dataset: https://huggingface.co/datasets/bitext/Bitext-customer-support-llm-chatbot-training-dataset
