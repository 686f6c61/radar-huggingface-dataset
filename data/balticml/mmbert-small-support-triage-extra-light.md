# balticml/mmbert-small-support-triage-extra-light

## Resumen

mmbert-small-support-triage-extra-light es un clasificador de texto derivado de jhu-clsp/mmBERT-small, publicado por balticml, orientado a la triage de mensajes de atencion al cliente en comercio electronico. Recibe un mensaje de soporte y lo asigna a una de 27 categorias de solicitud repartidas en 11 departamentos de una tienda online, o bien a la clase `out_of_scope` cuando el texto no constituye una peticion. El modelo es una version recortada del clasificador original mmbert-small-support-triage: reduce la profundidad de 16 a 12 capas y poda el tokenizador al vocabulario realmente utilizado, con el objetivo de ejecutarse en navegador y dispositivos de baja memoria.

La arquitectura subyacente es ModernBERT en su variante small, con 22 capas en el modelo base y una cabeza de clasificacion de secuencia. Esta variante "extra light" conserva la receta de entrenamiento y las etiquetas del modelo de 16 capas, pero rebaja el coste de despliegue a una descarga de 47 MB y unos 187 MB de memoria en navegador, frente a 55 MB y 238 MB del modelo de 16 capas con tokenizador podado. El resultado es un artefacto pensado para inferencia local en el cliente, sin servidor, con un impacto medible pero acotado en precision.

Su relevancia actual radica en la combinacion de dos factores: cobertura multilingue en diez idiomas europeos (en, pl, de, fr, es, it, nl, pt, cs, sv) y un formato ONNX int8 listo para transformers.js sobre WebAssembly. Es un ejemplo de como un modelo de clasificacion pequeno puede desplegarse en el borde de la red para tareas de enrutamiento previo, filtrando y etiquetando mensajes antes de que lleguen a un modelo generativo mayor o a un sistema de ticketing.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT (encoder transformer), variante small, con cabeza de clasificacion de secuencia |
| Parametros totales | no disponible (modelo base jhu-clsp/mmBERT-small; esta variante usa 12 de las 22 capas del base) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | int8 (ONNX Runtime); el modelo se distribuye en ONNX int8 con tokenizador podado |
| Idiomas soportados | en, pl, de, fr, es, it, nl, pt, cs, sv |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (int8); tokenizador podado a 51.032 tokens y 128.416 merges |

## Arquitectura y entrenamiento

El modelo es un encoder transformer de tipo ModernBERT en su variante small, con 12 capas efectivas tras el recorte (el base tiene 22). Sobre el encoder se anade una cabeza de clasificacion de secuencia que produce una distribucion sobre 27 tipos de solicitud mas la clase `out_of_scope`. El entrenamiento sigue la receta del modelo de 16 capas, sobre el dataset bitext/Bitext-customer-support-llm-chatbot-training-dataset, con una taxonomia de comercio electronico de 11 departamentos y una unica etiqueta por mensaje.

La innovacion tecnica destacable no esta en la arquitectura sino en la ingenieria de despliegue. El tokenizador original de mmBERT tiene 256.000 tokens y 580.604 merges, y ocupa unos 90 MB en navegador. El autor poda el vocabulario a los 46.681 tokens vistos en entrenamiento, anade los tokens intermedios que genera BPE en el camino hacia ellos, los tokens de byte-fallback y especiales, y conserva los merges entre ellos: quedan 51.032 tokens y 128.416 merges con los ids intactos. Para cualquier texto cuya tokenizacion completa use solo tokens conocidos, el resultado es identico; el autor verifico esto en 9.819 textos. Las palabras nunca vistas se fragmentan en piezas conocidas en lugar de convertirse en `[UNK]`. Ademas, el modelo se exporta a ONNX int8 para ejecutarse con transformers.js sobre WebAssembly, lo que permite inferencia en el navegador sin backend.

## Capacidades

- Clasificacion de texto multilingue: asigna un mensaje a una de 27 categorias de solicitud en 11 departamentos de una tienda online, o a `out_of_scope`.
- Deteccion de mensajes fuera de alcance: recall del 98,3 % en la clase `not-a-request` segun la model card.
- Cobertura en diez idiomas: ingles, polaco, aleman, frances, espanol, italiano, neerlandes, portugues, checo y sueco.
- Inferencia en navegador y dispositivos de baja memoria mediante transformers.js, ONNX Runtime y WebAssembly con int8.
- Ejecucion local sin servidor: el modelo y el tokenizador caben en una descarga de 47 MB y unos 187 MB de memoria en Chrome.
- No soporta generacion de texto, tool calling, razonamiento multi-paso ni capacidades multimodales: es exclusivamente un clasificador de secuencia.
- Requiere normalizacion previa del texto (minusculas, eliminacion de puntuacion salvo apostrofos, colapso de espacios) tal como indica la model card.

## Casos de uso

- Triage previo de tickets en un helpdesk: el clasificador etiqueta cada mensaje entrante con su tipo de solicitud y departamento antes de encolarlo, de modo que el enrutamiento se hace sin intervencion humana y con inferencia local en el cliente o en un servidor ligero.
- Filtrado de mensajes fuera de alcance en formularios web: antes de enviar un mensaje al backend, el modelo en el navegador descarta o marca los textos que no son peticiones reales, reduciendo ruido en la cola de soporte.
- Enrutamiento en aplicaciones de chat de comercio electronico: integrado en el frontend con transformers.js, clasifica el mensaje del usuario y decide si mostrarlo a un agente, derivarlo a un flujo automatico o responder con una plantilla.
- Preprocesamiento para pipelines con LLM: actua como primera etapa barata que etiqueta y agrupa mensajes, de forma que un modelo generativo mayor solo procesa los casos que requieren respuesta libre, reduciendo coste por token.
- Analitica de volumen de solicitudes: al clasificar lotes historicos de mensajes se obtiene una distribucion por tipo de solicitud y departamento, util para dimensionar equipos y detectar picos por categoria.
- Despliegue en dispositivos de baja memoria o entornos sin conectividad: al requerir 47 MB de descarga y 187 MB de memoria, puede ejecutarse en navegadores de moviles y portatiles modestos, o en entornos de borde donde no se quiere enviar texto del cliente a un servidor.
- Moderacion y preetiquetado en herramientas internas: clasificacion de mensajes en la propia interfaz de agente para sugerir la categoria correcta y acelerar la resolucion.

## Benchmarks y rendimiento

Resultados publicados en la model card. Precision en %, medida con los ficheros ONNX int8 en ONNX Runtime, 500 solicitudes de test y 500 frases no-solicitud por locale (semilla 0).

| Modelo | Test split (5.000) | 160 mensajes escritos a mano | Recall not-a-request | Descarga | Memoria en navegador |
|---|---|---|---|---|---|
| Este modelo: 12 capas, int8 44 MB, tokenizador podado 3 MB | 99,1 | 91,9 | 98,3 | 47 MB | 187 MB |
| Mismo modelo con tokenizador completo | 99,1 | 93,8 | 98,2 | 78 MB | no disponible |
| Modelo de 16 capas, tokenizador podado (v1.3.0) | 99,3 | 96,9 | 98,6 | 55 MB | 238 MB |
| Modelo de 16 capas, tokenizador completo (v1.2.0) | 99,3 | 96,9 | 98,4 | 86 MB | 307 MB |

La model card del modelo de 16 capas reporta 96,2 en los mensajes escritos a mano en PyTorch fp32; la version int8 acierta un mensaje mas. La memoria se midio en Chrome con `performance.measureUserAgentSpecificMemory()` tras cargar el modelo, ordenar ocho mensajes y clasificar treinta mas, con WASM y un solo hilo; no crece con el uso. Los mensajes escritos a mano fueron redactados por el autor de los mensajes de entrenamiento, por lo que constituyen una cota superior para una bandeja de entrada real.

## Requisitos de hardware

- VRAM/ memoria: unos 187 MB de memoria en navegador (Chrome, WASM, un hilo) para la variante int8 con tokenizador podado; descarga de 47 MB.
- GPU: no requiere GPU; esta disenado para ejecucion en CPU mediante ONNX Runtime y WebAssembly.
- Cabe en cualquier dispositivo con un navegador moderno, incluidos moviles y portatiles de gama baja; tambien en CPU de servidor sin acelerador.
- Opciones de despliegue: transformers.js (con `dtype: "q8"` y `device: "wasm"`), ONNX Runtime en general; no se mencionan vLLM, llama.cpp, Ollama ni TGI en la informacion disponible.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Precision (test split) | Precision (mensajes a mano) | Licencia | Formato |
|---|---|---|---|---|---|---|
| mmbert-small-support-triage-extra-light (este modelo) | 12 de 22 capas de mmBERT-small | no disponible | 99,1 | 91,9 | Apache-2.0 | ONNX int8 + tokenizador podado |
| mmbert-small-support-triage (16 capas, v1.3.0) | 16 de 22 capas de mmBERT-small | no disponible | 99,3 | 96,9 | Apache-2.0 | ONNX int8 + tokenizador podado |
| mmbert-small-support-triage (16 capas, v1.2.0) | 16 de 22 capas de mmBERT-small | no disponible | 99,3 | 96,9 | Apache-2.0 | ONNX int8 + tokenizador completo |
| jhu-clsp/mmBERT-small (base) | no disponible | no disponible | no aplica (modelo base sin cabeza de triage) | no aplica | Apache-2.0 | safetensors (formato base) |

La comparativa se limita a las variantes del mismo linaje, ya que la informacion proporcionada no incluye otros clasificadores de triage comparables. El compromiso es claro: este modelo pierde 0,2 puntos en el test split y 5 puntos en los mensajes escritos a mano frente al de 16 capas, a cambio de 8 MB menos de descarga y unos 51 MB menos de memoria en navegador.

## Limitaciones y advertencias

- Nueve de los diez idiomas de test son traducciones automaticas; el rendimiento en esos idiomas puede no reflejar el de hablantes nativos.
- Una unica taxonomia de comercio electronico y una sola etiqueta por mensaje: no cubre dominios fuera de esa taxonomia ni mensajes con multiples intenciones.
- Precision tres puntos inferior a la del modelo de 16 capas en los mensajes escritos a mano (91,9 frente a 96,9), precisamente en el escenario mas cercano a una bandeja de entrada real.
- Los mensajes escritos a mano usados como benchmark fueron redactados por el autor de los mensajes de entrenamiento, por lo que la cifra es una cota superior.
- El tokenizador podado fragmenta palabras nunca vistas en piezas conocidas en lugar de emitir `[UNK]`; en los mensajes escritos a mano, 116 de 160 contenian alguna de esas palabras y el efecto costo 3 aciertos de 160.
- Requiere normalizacion previa del texto segun la receta indicada; sin ella el rendimiento puede degradarse.
- Riesgo de alucinacion no aplica en sentido estricto (es un clasificador), pero si de clasificacion erronea en textos ambiguos, ironicos o muy cortos.
- Licencia Apache-2.0 para el modelo y mmBERT; el dataset Bitext tiene licencia CDLA-Sharing-1.0, y MADLAD-400, FLORES-200 y Tatoeba tienen sus propias licencias, lo que conviene revisar si se redistribuyen datos derivados.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado en noviembre de 2026; no hay validacion independiente de terceros.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/balticml/mmbert-small-support-triage-extra-light
- Modelo de 16 capas (v1.3.0): https://huggingface.co/balticml/mmbert-small-support-triage
- Modelo base: https://huggingface.co/jhu-clsp/mmBERT-small
- Codigo, pipeline de datos y benchmark: https://github.com/balticml/support-triage
- Dataset de entrenamiento: https://huggingface.co/datasets/bitext/Bitext-customer-support-llm-chatbot-training-dataset
