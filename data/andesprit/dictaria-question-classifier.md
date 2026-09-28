# Andesprit/dictaria-question-classifier

## Resumen

Dictaria question classifier es un clasificador de texto de seis clases desarrollado por Andesprit, un estudio de software independiente, que determina si el último fragmento de habla de una reunión en vivo contiene una pregunta o una petición que el interlocutor debería responder. Se construye sobre el encoder multilingüe `sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2`, al que se le añade una cabeza de clasificación con seis etiquetas: `question`, `request`, `social`, `rhetorical`, `statement` y `fragment`. Su función es filtrar ruido conversacional: solo cuando la probabilidad conjunta de `question` y `request` alcanza 0,5 la aplicación considera que hay que contestar algo.

El modelo está diseñado para ejecutarse en el dispositivo del usuario, de modo que ningún texto sale del equipo para ser clasificado. Se distribuye exportado a ONNX y cuantizado a int8 por canal en un único fichero de 118 MB, y se consume desde el navegador con `onnxruntime-web` (backend wasm), con latencias de 12 a 30 ms por comprobación en un worker de una sola hebra. La ventana de entrada es muy corta: como máximo 96 tokens, formados por el token BOS, los últimos 94 tokens del habla y el token EOS.

Se afinó sobre unas 3.820 muestras sintéticas de habla de reunión en inglés, español, francés, alemán y portugués, etiquetadas por un modelo de IA y repartidas en un 90 % de entrenamiento y un 10 % de validación. La evaluación se hizo sobre 340 casos de prueba escritos de forma independiente, con una precisión global del 96,8 %. La licencia Apache 2.0 permite uso comercial.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder (MiniLM-L12) con cabeza de clasificación de 6 clases, derivado de `sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2` |
| Parámetros totales | no disponible (la model card no indica el recuento; el modelo base es `paraphrase-multilingual-MiniLM-L12-v2`) |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 96 tokens de entrada como máximo (BOS + los últimos 94 tokens del habla + EOS) |
| Tipos de cuantización | int8 por canal (per channel) sobre la exportación ONNX |
| Idiomas soportados | inglés (en), español (es), francés (fr), alemán (de), portugués (pt) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`model.onnx`, 118 MB); el repositorio ocupa 0,1 GB y no se indica que incluya otros formatos |
| Pipeline | text-classification |
| Etiquetas de salida | question, request, social, rhetorical, statement, fragment (en el orden de `labels.json`) |
| Tamaño del repositorio | 0,1 GB |
| Librería declarada | onnx (uso previsto con onnxruntime-web / transformers.js) |
| Regla de decisión sugerida | `question + request` con probabilidad >= 0,5 se interpreta como "responder a esto" |

## Arquitectura y entrenamiento

La arquitectura es la de un encoder transformer bidireccional de tipo MiniLM, concretamente el checkpoint multilingüe destilado `paraphrase-multilingual-MiniLM-L12-v2`, al que se ha acoplado una cabeza de clasificación de seis vías. No hay componente generativo, decodificador autorregresivo ni mecanismo de atención lineal: la entrada se trunca a 96 tokens (BOS, los últimos 94 tokens del habla y EOS) y la salida es una distribución sobre las seis etiquetas. El modelo no mantiene estado entre fragmentos: cada comprobación es independiente.

El ajuste fino se realizó sobre aproximadamente 3.820 ejemplos sintéticos de habla de reunión, en cinco idiomas (inglés, español, francés, alemán y portugués), etiquetados por un modelo de IA. El reparto fue de un 90 % para entrenamiento y un 10 % para validación. La model card no menciona uso de RLHF, DPO ni preferencias humanas, algo coherente con una tarea de clasificación supervisada. La innovación destacable no está en la arquitectura, sino en el despliegue: la exportación a ONNX con cuantización int8 por canal permite clasificar en el navegador con `onnxruntime-web` sin enviar texto a un servidor, con latencias de 12 a 30 ms por comprobación en wasm de una sola hebra.

## Capacidades

- Clasificación de texto en seis categorías mutuamente excluyentes: `question`, `request`, `social`, `rhetorical`, `statement` y `fragment`.
- Detección específica de preguntas reales dirigidas a otra persona, distinguiéndolas de preguntas retóricas, charla social, comprobaciones de comprensión o turnos meramente enunciativos.
- Detección de peticiones de información sin forma interrogativa (por ejemplo, "walk me through..." o "cuéntame..."), agrupadas en la clase `request`.
- Funcionamiento multilingüe en inglés, español, francés, alemán y portugués dentro del mismo modelo.
- Inferencia local en navegador o aplicación de escritorio mediante ONNX y `onnxruntime-web`, con el texto sin abandonar el dispositivo.
- Integración con el ecosistema `transformers.js` y con cualquier runtime compatible con ONNX.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni generación de texto: es exclusivamente un clasificador discriminativo.

## Casos de uso

- Asistente de reuniones en vivo: alimentar el clasificador con la transcripción parcial de los últimos segundos y resaltar al usuario los turnos en los que se le está preguntando algo que debe contestar, con una latencia de 12 a 30 ms que permite reaccionar durante la conversación.
- Generación de actas y resúmenes accionables: filtrar de la transcripción únicamente los turnos clasificados como `question` o `request` para construir una lista de preguntas abiertas y compromisos pendientes, descartando ruido social y enunciados.
- Seguimiento de preguntas sin responder: combinar la clasificación por fragmento con un registro de turnos para detectar, en una reunión larga, qué preguntas no recibieron respuesta, ya que el modelo por sí solo no sabe si algo se contestó después.
- Asistencia a personas no nativas o con dificultad auditiva: emitir un aviso visual discreto cuando el sistema detecta que el usuario ha sido interpelado, reduciendo la carga cognitiva de seguir una conversación en un idioma extranjero.
- Análisis de calidad en atención al cliente: procesar transcripciones de llamadas o chats para medir cuántas preguntas del cliente quedaron sin atender, usando la clase `request` para capturar también peticiones formuladas sin interrogante.
- Enrutado en asistentes de voz e IVR: decidir si el turno del usuario contiene una pregunta que requiere una respuesta del sistema o si es una aclaración, evitando respuestas innecesarias a preguntas retóricas.
- Análisis de entrevistas y llamadas de ventas: extraer automáticamente las preguntas del entrevistador y las peticiones de información del cliente para evaluar la estructura de la conversación y el equilibrio de turnos.
- Moderación de aulas y webinars: detectar en tiempo real cuándo un asistente formula una pregunta al ponente para encolarla o destacarla, manteniendo la clasificación en local cuando el contenido es sensible.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre 340 casos de prueba escritos de forma independiente, nunca usados para entrenamiento ni ajuste, evaluados a través del código del navegador con el modelo int8:

| Idioma | Precisión | Muestras |
|---|---|---|
| Inglés | 97,5 % | 78/80 |
| Español | 96,3 % | 77/80 |
| Francés | 95,0 % | 57/60 |
| Alemán | 96,7 % | 58/60 |
| Portugués | 98,3 % | 59/60 |
| Global | 96,8 % | 329/340 |

| Métrica de latencia | Valor |
|---|---|
| Tiempo por comprobación (worker de navegador, wasm, una hebra) | 12 a 30 ms |

No se han publicado resultados en benchmarks estándar de clasificación o razonamiento (MMLU, GLUE, SuperGLUE, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- No requiere GPU: el modelo está pensado para ejecutarse en CPU, incluido el navegador, mediante el backend wasm de `onnxruntime-web`.
- VRAM estimada para inferencia: 0 GB, al no necesitar acelerador gráfico. El fichero int8 ocupa 118 MB, de modo que el consumo de memoria en CPU es del orden de esas decenas o pocos cientos de megabytes contando el runtime.
- GPU recomendadas: no aplica. Cualquier GPU con soporte de ONNX Runtime (CUDA, TensorRT, DirectML) podría usarse para reducir latencia, pero el modelo no la necesita y no se han publicado cifras en GPU.
- Compatibilidad con GPU de consumo: irrelevante para el caso de uso objetivo; cabe incluso en dispositivos móviles y en navegadores de escritorio sin GPU dedicada.
- Opciones de despliegue: `onnxruntime-web` (wasm) en navegador, `transformers.js`, ONNX Runtime en Python, C++, Java o C#. No procede desplegarlo con vLLM, TGI, Ollama o llama.cpp, ya que no es un modelo generativo con pesos GGUF.
- Latencia y throughput: 12 a 30 ms por clasificación en un worker de navegador con wasm y una sola hebra. No se han publicado cifras de throughput agregado ni de latencia en servidor.

## Comparativa con modelos similares

| Modelo | Tarea | Parámetros | Contexto | Rendimiento publicado | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Andesprit/dictaria-question-classifier | Clasificación de preguntas en 6 clases | no disponible | 96 tokens | 96,8 % de precisión global en 340 casos propios | Apache 2.0 | HuggingFace, ONNX int8 |
| ai-research-lab/bert-question-classifier | Clasificación de preguntas | no disponible | no disponible | no disponible | no disponible | HuggingFace |
| ai-research-lab/bert-question-classifier-onnx | Clasificación de preguntas | no disponible | no disponible | no disponible | no disponible | HuggingFace |
| sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2 | Embeddings de frases multilingües (modelo base) | no disponible | no disponible | no disponible | Apache 2.0 | HuggingFace |

La única alternativa funcionalmente equivalente identificada en la búsqueda es la familia `ai-research-lab/bert-question-classifier`, de la que no se dispone de parámetros, contexto, licencia ni métricas. La comparación cuantitativa con ella no es posible con la información disponible. Conviene señalar que el modelo base es un modelo de embeddings, no un clasificador, por lo que no es sustituible directamente sin añadir y entrenar una cabeza de clasificación.

## Limitaciones y advertencias

- Solo juzga el texto que recibe: no sabe si una pregunta ya fue respondida antes, ni mantiene estado entre fragmentos.
- Entrenado sobre habla sintética, no sobre transcripciones reales. Los errores de reconocimiento automático de voz en reuniones reales pueden reducir la precisión por debajo de las cifras publicadas.
- Solo se probaron los cinco idiomas declarados (inglés, español, francés, alemán y portugués). El comportamiento en cualquier otro idioma es desconocido.
- Ventana de entrada muy corta (96 tokens). Se pierde el contexto anterior de la conversación y solo se analiza el último fragmento de habla, lo que puede provocar errores en preguntas que dependen de turnos previos.
- Las etiquetas de entrenamiento fueron generadas por un modelo de IA, por lo que los sesgos y errores sistemáticos de ese etiquetador pueden haberse propagado al clasificador.
- La regla "responder con probabilidad `question + request` >= 0,5" es una decisión de la aplicación, no del modelo; ajustar ese umbral cambia el equilibrio entre falsos positivos y falsos negativos y requiere validación propia.
- El repositorio registra 0 descargas y 0 "likes" en el momento de la consulta: no hay validación independiente por parte de la comunidad ni historial de uso en producción.
- Licencia Apache 2.0: permite uso comercial, modificación y redistribución, siempre que se conserve el aviso de copyright y la licencia. No impone restricciones de uso adicionales.
- Es un modelo puramente discriminativo: no genera respuestas, no sigue instrucciones ni puede emplearse como chatbot.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Andesprit/dictaria-question-classifier
- Modelo base: https://huggingface.co/sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2
- Producto Dictaria (coach de reuniones, transcripción y notas): https://dictaria.andesprit.com/
- Organización Andesprit en GitHub: https://github.com/Andesprit
- Alternativa comparable, `ai-research-lab/bert-question-classifier`: https://huggingface.co/ai-research-lab/bert-question-classifier
- Alternativa comparable en ONNX, `ai-research-lab/bert-question-classifier-onnx`: https://huggingface.co/ai-research-lab/bert-question-classifier-onnx
