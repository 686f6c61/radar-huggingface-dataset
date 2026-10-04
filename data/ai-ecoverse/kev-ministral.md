# ai-ecoverse/kev-ministral

## Resumen

kev-ministral es un bundle de inferencia en navegador publicado por ai-ecoverse sobre el modelo base mistralai/Ministral-3-3B-Base-2512 de Mistral AI (3,4B parámetros de lenguaje más el encoder de visión Pixtral de 0,4B). Sobre esa base se ha entrenado un adaptador LoRA de rango 16 (aplicado a todas las proyecciones de atención y MLP) junto con una cabeza pointer propia de Kev, con el objetivo de convertir un modelo de lenguaje genérico en un modelo de decisión capaz de asignar probabilidades calibradas a un conjunto de opciones a partir de una captura de pantalla. El resultado se distribuye como grafo ONNX int8 para ejecutarse con onnxruntime-web sobre WebGPU directamente en Chrome.

La propuesta técnica es inusual: un único conjunto de pesos (aproximadamente 6,6 GB) sirve tres formas de tarea distintas desde la misma sesión de inferencia. Con `lora_scale = 1` el grafo se comporta como modelo de decisión (selección de opciones en menús de navegador con probabilidades calibradas); con `lora_scale = 0` las ramas LoRA quedan desactivadas y el grafo reproduce el modelo base, lo que permite generar texto, resumir y describir imágenes. El LoRA no está fusionado en los pesos del decoder, sino que vive como ramas con puerta controladas por una entrada del grafo, lo que evita duplicar los 4,1 GB del decoder.

El interés actual del modelo es doble. Por un lado, demuestra que un adaptador de decisión sobre una base de 3,4B supera en su tarea específica a alternativas mayores ya publicadas: 69,0 de precisión de paso en webs no vistas de Mind2Web frente a 57,6 de kev-4b-vision (Qwen3.5-4B). Por otro, valida un patrón de despliegue íntegramente en el cliente, sin servidor, con Chrome y WebGPU como único requisito de ejecución. El repositorio figura con 0 descargas y 0 likes en el momento de la consulta, y la metadata de HuggingFace reporta un tamaño de repo de 0,0 GB pese a que el bundle descrito suma 6,6 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Ministral) con ramas LoRA con puerta y cabeza pointer Kev; encoder de visión Pixtral con proyector |
| Parametros totales | 3,4B en el modelo de lenguaje y 0,4B en el encoder de visión Pixtral |
| Parametros activos | no aplica, no es un modelo MoE |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Pesos int8 con bloques de 32 y activaciones fp32 en el decoder; tabla de embeddings fp16 en `embed_tokens.onnx`; no se documentan GGUF ni otros formatos |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX para onnxruntime-web, más `head.bin` y `head.json` para la cabeza pointer y `tokenizer.json` (tokenizer tekken con el regex de pre-tokenización corregido) |

Detalle de los ficheros del bundle `kev-ministral-3b/`:

| Fichero | Contenido | Tamano |
|---|---|---|
| `onnx/decoder_model_merged.onnx` + `.onnx_data`, `_1`, `_2` | Decoder con pesos int8, entradas `inputs_embeds`, `attention_mask`, `lora_scale` y caché KV; salidas `logits` y `hidden_states` | 4,1 GB |
| `onnx/embed_tokens.onnx` + datos | Tabla de embeddings fp16 con las filas de delimitadores entrenadas | 0,8 GB |
| `onnx/vision_encoder.onnx` + datos | Pixtral más proyector; ONNX oficial del modelo Instruct con las dos matrices de proyector del Base | 1,7 GB |
| `head.bin`, `head.json` | Cabeza pointer (2 × 3072→256) y su temperatura ajustada (2,2) | no disponible |
| `tokenizer.json` | Tokenizer tekken con el regex de pre-tokenización corregido (`fix_mistral_regex`) | no disponible |
| `manifest.json` | Lista de ficheros para el cargador | no disponible |

## Arquitectura y entrenamiento

La base es Ministral-3-3B-Base-2512, un transformer decoder-only de 3,4B parámetros, acompañado del encoder de visión Pixtral de 0,4B y su proyector. Sobre esa base se entrena un adaptador LoRA de rango 16 sobre todas las proyecciones de atención y MLP, más una cabeza pointer que produce la distribución sobre las opciones candidatas. La receta de entrenamiento sigue el enfoque de Kev y combina la suite `decision-v7` de Kev con datos de agente de navegador de webrunner: pasos de entrenamiento de Multimodal-Mind2Web renderizados como menús de webrunner y trazas de juego etiquetadas con System-2.

La innovación estructural más relevante es que el LoRA no se fusiona en los pesos. Permanece en el grafo del decoder como ramas con puerta detrás de la entrada `lora_scale`: con valor 0 el grafo es el modelo base original y sirve para generación; con valor 1 se activa el comportamiento de modelo de decisión. Esto permite servir ambas funciones desde un único conjunto de pesos cargado una sola vez. Los cinco delimitadores de Kev se implementan reutilizando tokens de control no usados de Ministral, que comparten un embedding no entrenado, mediante `<SPECIAL_20..23,26>` con filas entrenadas en `embed_tokens`. El encoder de visión parte del ONNX oficial del modelo Instruct, sustituyendo las dos matrices del proyector por las del Base, dado que los 220 tensores de Pixtral son idénticos entre Base e Instruct; el resultado coincide con el Base de PyTorch con un error de 2,5e-5.

No se documentan en la información disponible datos sobre volumen de tokens de entrenamiento, composición completa del dataset, ni uso de RLHF o DPO sobre el modelo base. La temperatura de calibración de la cabeza pointer está ajustada a 2,2.

## Capacidades

- Decisiones con probabilidades calibradas: dado un formato de menú de webrunner y una captura de pantalla, el modelo asigna probabilidades a cada opción y selecciona una, con calibración ajustada mediante temperatura.
- Descripción de imágenes: el pipeline declarado es `image-text-to-text`; el encoder Pixtral y el proyector permiten generar descripciones a partir de una imagen.
- Completado de texto: con `lora_scale = 0` el grafo reproduce el modelo base y continúa texto de forma greedy, con resultados idénticos en tokens a PyTorch fp32 Base durante 40 tokens.
- Resumen de texto: misma ruta de generación que el completado, token-idéntica a PyTorch fp32 Base en las pruebas realizadas.
- Comprensión de interfaces web renderizadas: entrenado explícitamente con menús derivados de Multimodal-Mind2Web, orientado a seleccionar el objetivo dentro de un menú.
- Trazas de juego con etiquetado System-2: se reporta acuerdo con System 2 en ejecuciones de juego reservadas para evaluación.
- Inferencia en el cliente: ejecución completa en el navegador con WebGPU, sin envío de datos a un servidor.
- Tool calling y function calling: no disponible, no se documenta soporte.
- Modo de razonamiento o thinking explícito: no disponible.
- Capacidades multilingües: no disponible, no se declaran idiomas soportados.
- Conversación: el modelo base no está ajustado por instrucciones, por lo que continúa texto en lugar de mantener un diálogo.

## Casos de uso

- Automatización de agentes de navegador: el modelo está entrenado para seleccionar el elemento correcto dentro de un menú a partir de una captura, con una precisión de paso de 69,0 en webs no vistas de Mind2Web, lo que lo hace adecuado como módulo de decisión en bucles de agente web donde cada paso debe elegir entre varias acciones.
- Enrutado de acciones con umbral de confianza: al emitir probabilidades calibradas sobre las opciones, permite fijar umbrales de confianza y derivar a intervención humana o a una política de reserva cuando la probabilidad máxima es baja, algo que un modelo puramente generativo no ofrece de forma nativa.
- Descripción automática de imágenes y texto alternativo: el encoder Pixtral más el decoder permiten generar descripciones de imágenes dentro del mismo bundle, útil para accesibilidad o para indexar contenido visual sin salir del navegador.
- Resumen de documentos en el cliente: con `lora_scale = 0` el modelo resume texto de forma determinista y token-idéntica a PyTorch fp32 Base, lo que permite procesar documentos sensibles sin que salgan del dispositivo.
- Procesamiento con requisito de privacidad: al ejecutarse íntegramente en Chrome con WebGPU, los datos del usuario, capturas de pantalla incluidas, no se transmiten a ningún servidor, lo que encaja en flujos regulados o en aplicaciones donde la captura de pantalla es sensible.
- Investigación en evaluación de agentes web: el bundle permite reproducir la evaluación sobre Mind2Web y sobre trazas de juego dentro del navegador, con fidelidad verificada frente a PyTorch (ids de token idénticos, delta máximo medio de probabilidad de 0,013 y 0,020, y 8 cambios de argmax sobre 342 registros).
- Etiquetado y anotación asistida de trazas: la cabeza pointer y el acuerdo con etiquetas System-2 en ejecuciones de juego permiten usar el modelo como anotador automático de decisiones en registros de interacción.
- Integración en demos y prototipos web: la demo en vivo y el código de `demo/ministral/` en kev.js permiten incorporar el modelo a una aplicación web sin infraestructura de servidor ni GPU en la nube.

## Benchmarks y rendimiento

Precisión de paso en la pregunta de menú de webrunner para webs no vistas de Mind2Web (255 pasos, con el objetivo presente en el menú) y acuerdo con System 2 en tres ejecuciones de juego reservadas (87 pasos):

| Modelo | Mind2Web webs no vistas | Ejecuciones de juego reservadas |
|---|---|---|
| kev-4b-vision (Qwen3.5-4B, publicado) | 57,6 | 40,2 |
| Kev-0.8B entrenado con los mismos datos de webrunner | 58,0 | 27,6 |
| kev-ministral (PyTorch) | 69,0 | 46,0 |
| kev-ministral (bundle ONNX, Chrome WebGPU) | 69,8 | 42,5 |

Fidelidad de la ejecución en navegador frente a PyTorch sobre los 342 registros: ids de token idénticos, delta máximo medio de probabilidad de 0,013 y 0,020, y 8 cambios de argmax. En generación desde la misma sesión con `lora_scale = 0`, los completados y resúmenes greedy son token-idénticos al Base de PyTorch fp32 durante 40 tokens, y una descripción de imagen coincide en 38 de 40.

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks generalistas en la información disponible.

## Requisitos de hardware

- Descarga total del bundle: aproximadamente 6,6 GB repartidos en decoder int8 (4,1 GB), tabla de embeddings fp16 (0,8 GB) y encoder de visión (1,7 GB).
- Memoria en ejecución: según el autor, entre 9 y 11 GB.
- Entorno de ejecución objetivo: Chrome con WebGPU. Es el escenario validado en la model card; no se documentan otros.
- GPU de consumo: por el requisito de memoria declarado, encajaría en GPU con 12 GB o más de VRAM, como una RTX 3060 de 12 GB, una RTX 4070 o superiores; esta correspondencia es una inferencia a partir del consumo de memoria declarado, no un dato verificado por el autor.
- GPU de centro de datos: no hay recomendaciones publicadas; A100 y H100 disponen de VRAM suficiente, pero el bundle no está pensado para ese despliegue.
- Opciones de despliegue: onnxruntime-web sobre WebGPU es la ruta soportada. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI, que no consumen este grafo ONNX con entrada `lora_scale` ni la cabeza pointer externa.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Mind2Web webs no vistas | Juego reservado | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| kev-ministral | 3,4B + 0,4B de visión | no disponible | 69,0 (PyTorch) / 69,8 (ONNX WebGPU) | 46,0 / 42,5 | Apache-2.0 | ONNX para onnxruntime-web, 0 descargas en el momento de la consulta |
| kev-4b-vision | Qwen3.5-4B | no disponible | 57,6 | 40,2 | no disponible | publicado según la model card |
| Kev-0.8B | 0,8B | no disponible | 58,0 | 27,6 | no disponible | entrenado con los mismos datos de webrunner |

La comparación se limita a los tres modelos reportados por el propio autor en su tabla de resultados; no se dispone de datos de contexto, licencia o disponibilidad de las alternativas más allá de lo indicado. Frente a un modelo de decisión de 0,8B, kev-ministral mejora 11 puntos en Mind2Web y 18,4 puntos en juego reservado; frente a kev-4b-vision, mejora 11,4 y 5,8 puntos respectivamente con menos parámetros de lenguaje.

## Limitaciones y advertencias

- El adaptador de decisión está entrenado para el formato de menú de webrunner; las preguntas generales de Kev funcionan, pero no fueron el foco del entrenamiento, por lo que el rendimiento fuera de ese formato no está caracterizado.
- El modelo base no está ajustado por instrucciones: genera continuación de texto, no conversa. Cualquier uso conversacional requiere un ajuste adicional.
- Requiere una descarga de 6,6 GB y entre 9 y 11 GB de memoria, lo que descarta su uso en muchos portátiles y en GPU de gama baja.
- Depende de Chrome con WebGPU; no se documentan rutas alternativas de ejecución.
- Los idiomas soportados no se declaran; no hay garantía de comportamiento fuera del inglés.
- La longitud de contexto no se especifica, lo que impide planificar tareas que dependan de ventanas largas.
- Los datos de entrenamiento incluyen Multimodal-Mind2Web, publicado bajo OpenRAIL y descrito por sus autores como datos de investigación, y la suite `decision-v7` de Kev, compuesta por datasets públicos con sus propios términos. Estos términos pueden imponer condiciones adicionales al uso comercial, más allá de la licencia Apache-2.0 del bundle.
- La calibración de las probabilidades depende de la temperatura ajustada (2,2) de la cabeza pointer; recalibrar sobre otro dominio exigiría reajustar ese valor.
- La discrepancia entre el tamaño de repo reportado por HuggingFace (0,0 GB) y los 6,6 GB descritos en la model card conviene verificarla antes de integrar el modelo en un pipeline automatizado.
- El repositorio no tiene descargas ni likes registrados, por lo que no existe validación comunitaria independiente de los resultados publicados.
- No se han publicado evaluaciones de sesgo, alucinación o robustez fuera de las tareas de decisión descritas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ai-ecoverse/kev-ministral
- Demo en vivo: https://ai-ecoverse.github.io/kev.js/ministral.html
- Código de kev.js (`demo/ministral/`): https://github.com/ai-ecoverse/kev.js
- Modelo base: https://huggingface.co/mistralai/Ministral-3-3B-Base-2512
- Receta de Kev: https://github.com/jaredpalmer/kev

La búsqueda web realizada no devolvió resultados relevantes sobre este modelo: los enlaces obtenidos corresponden a páginas genéricas de OpenAI, Google Gemini, ChatGPT y DeepAI, sin relación con kev-ministral.
