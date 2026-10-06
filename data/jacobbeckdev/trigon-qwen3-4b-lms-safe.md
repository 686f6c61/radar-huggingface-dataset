# jacobbeckdev/trigon-qwen3-4b-lms-safe

## Resumen

Trigon qwen3-4b-lms-safe v1 es un paquete de adaptacion publicado por el usuario jacobbeckdev sobre el backbone congelado Qwen/Qwen3-4B (commit 1cfa9a7208912126459214e8b04321603b3df60c, licencia Apache-2.0). No es un modelo conversacional: la model card lo define como un "modelo de decision tipada" que recibe un estado y un mapa de preguntas tipadas (eleccion multiple, si/no, puntuacion) y devuelve una distribucion calibrada por pregunta en una sola pasada de prefill. El bundle contiene un adaptador LoRA de rango 16 junto con un mecanismo de lectura de respuesta (`adapter.pt`) que puntua cada opcion como continuacion del propio backbone mediante `w * log p(answer) + residual`, con `w = 0.500`.

El problema que resuelve es la clasificacion y el enrutado con probabilidades calibradas en lugar de texto generado: tareas como enrutado de peticiones bancarias, moderacion de contenido, deteccion de jailbreak o prompt injection y seleccion de acciones web se resuelven con una unica distribucion por pregunta y con error de calibracion (ECE) medido frente a un suelo estadistico (ECE floor p95). El entrenamiento declara 1 epoch, learning rate 0.0001, semilla 0 y 2,1 horas en CUDA, sobre 14 corpus mayoritariamente en ingles con licencias permisivas (CC BY 4.0, Apache-2.0, MIT).

Es relevante ahora porque propone un patron distinto al del LLM generativo: el backbone permanece congelado y solo se entrena un adaptador pequeno (el repositorio ocupa 0,1 GB, es decir, no se redistribuyen los pesos del modelo base) que expone decisiones tipadas y calibradas, una interfaz que encaja mejor en pipelines de decision automatizada que en chat. El contrapeso es su madurez: 0 descargas y 0 likes en el momento de la consulta, evaluacion con una sola semilla y ausencia de datos sobre idiomas soportados fuera del ingles de los corpus de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (backbone Qwen/Qwen3-4B congelado) + adaptador LoRA de rango 16 + readout de respuesta (`w * log p(answer) + residual`, `w = 0.500`) |
| Parametros totales | Aproximadamente 4.000 millones en el backbone; el bundle publicado contiene unicamente el adaptador (repositorio de 0,1 GB) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada para este bundle; el backbone Qwen3-4B declara 32.768 tokens nativos (dato del modelo base, no de esta ficha) |
| Tipos de cuantizacion | no disponible; solo se documenta el artefacto `adapter.pt` en formato PyTorch |
| Idiomas soportados | no disponible; el autor no declara idiomas y todos los corpus de entrenamiento citados son en ingles |
| Licencia | Apache-2.0 para este bundle; el backbone Qwen3-4B es Apache-2.0 y no se redistribuye aqui |
| Formato de pesos | `adapter.pt` (PyTorch) acompanado de ficheros SHA256SUMS para verificacion |
| Identificador de build | trigon-lm-score-qwen3-4b-qwen3-4b-lms-safe-s0+lm-score-v1 |
| Entrenamiento | 1 epoch, learning rate 0.0001, semilla 0, 2,1 h en CUDA |
| Repositorio | jacobbeckdev/trigon-qwen3-4b-lms-safe (0 descargas, 0 likes en el momento de la consulta) |

## Arquitectura y entrenamiento

La arquitectura no introduce un transformer nuevo: reutiliza Qwen3-4B congelado y anade dos piezas entrenables. La primera es un adaptador LoRA de rango 16. La segunda es un mecanismo de lectura de respuesta que no genera texto, sino que puntua cada opcion candidata como continuacion del backbone, combinando el log-probabilidad de la respuesta con un termino residual y un peso `w = 0.500`. El resultado es una distribucion normalizada por pregunta, de forma que varias preguntas tipadas se resuelven en una sola pasada de prefill en lugar de una generacion autoregresiva por pregunta. La calibracion se ajusta aparte sobre 4.140 casos retenidos de diez corpus, con los conjuntos de opciones remodelados del mismo modo que en entrenamiento; las etiquetas generadas por modelos profesores se usan solo para cobertura y nunca como evidencia de calibracion.

Los datos de entrenamiento son 14 corpus, con un total aproximado de 15.000 casos (de los cuales unos 3.800 son casos de calibracion). La composicion cubre clasificacion de intenciones bancarias (banking77, 1.500 casos), emociones (goemotions, 1.238), calidad de respuestas (helpsteer2, 844), discurso de odio y toxicidad (measuring_hate_speech 844, hatexplain 1.107, aegis2-train 1.500), inferencia de lenguaje natural (wanli, 1.500), acciones web (mind2web-train, 1.202), seguridad (jailbreak-train 1.199, prompt-injections-train 410) y dos conjuntos sinteticos etiquetados por profesores (teacher-workflows, 1.400 casos generados con Qwen2.5-7B-Instruct; teacher-local, 1.120 con Qwen3.6-35B-A3B servido por ollama). Los corpus `clinc150`, `boolq` y `circa` quedaron retenidos, y los sitios web de la evaluacion de acciones estan excluidos de `mind2web-train`. No se documenta ninguna innovacion de atencion (no hay atencion lineal, decodificacion especulativa ni SSM): la innovacion es el contrato de decision tipada y calibrada.

## Capacidades

- Decision tipada con distribucion calibrada: responde mapas de preguntas de tipo eleccion multiple, si/no y puntuacion en una sola pasada de prefill.
- Clasificacion de intenciones: enrutado de peticiones de banca y servicios (banking77, clinc150) con variantes de redaccion declarada, desplazada y renombrada.
- Clasificacion de emociones: etiquetado multi-clase sobre GoEmotions.
- Moderacion de contenido: deteccion de discurso de odio y toxicidad (Aegis 2.0, HateXplain, Measuring Hate Speech).
- Seguridad de entrada: deteccion de jailbreak y de prompt injection sobre texto de usuario.
- Verificacion factual y respuesta si/no: tareas de tipo BoolQ resueltas como pregunta binaria.
- Inferencia de lenguaje natural: etiquetado de relaciones de implicacion y contradiccion (WANLI).
- Evaluacion de calidad de texto: puntuacion de respuestas segun criterios tipo HelpSteer2.
- Seleccion de acciones web: prediccion de operacion y elemento sobre paginas no vistas durante el entrenamiento (Mind2Web).
- Invariancia al orden de opciones: se mide acuerdo de orden (0,928 en banking77/order).
- No se documenta soporte de tool calling, function calling, agentes multi-paso autonomos, vision, audio ni modo de razonamiento explicito.

## Casos de uso

- Enrutado de tickets de atencion al cliente: el modelo recibe el texto del ticket y un mapa de intenciones tipadas y devuelve, para cada intencion, una probabilidad calibrada; con ECE de 0,033 a 0,040 en banking77/declared y banking77/order es adecuado para umbralizar decisiones y derivar automaticamente al equipo correspondiente.
- Moderacion de contenido en plataformas: clasificar comentarios contra las etiquetas de Aegis 2.0, HateXplain y Measuring Hate Speech, usando la probabilidad calibrada para decidir entre publicacion automatica, revision humana o bloqueo.
- Filtro de seguridad en la entrada de un chatbot: detectar jailbreaks y prompt injections antes de que el texto llegue al LLM generativo, con las ventajas de latencia de una clasificacion en una sola pasada.
- Analisis de sentimiento y voz del cliente: asignar emociones de GoEmotions a resenas o encuestas y agregar los resultados por producto o periodo.
- Puntuacion de calidad de respuestas generadas: usar el modo de pregunta puntuada sobre criterios tipo HelpSteer2 para evaluar salidas de otro modelo en un pipeline de evaluacion automatica.
- Automatizacion de navegacion web: predecir la operacion y el elemento sobre paginas no vistas, con 0,893 de precision en operacion y 0,692 en elemento, como primer paso de un agente web que despues ejecute la accion.
- Verificacion de afirmaciones y NLI: comprobar si una frase se sigue de un contexto dado (WANLI, BoolQ) en sistemas de resumen o de recuperacion aumentada donde hace falta una decision binaria con confianza.
- Triaje previo a generacion: decidir si una consulta debe responderse, escalarse o rechazarse, reduciendo el coste de invocar un modelo mayor.

## Benchmarks y rendimiento

Generality (`scripts/generality.py`, 1.000 casos por tarea, semilla fija):

| Tarea | Precision | Azar | ECE | ECE floor p95 | Acuerdo de orden |
|---|---:|---:|---:|---:|---:|
| banking77/declared | 0,801 | 0,013 | 0,033 | 0,040 |  |
| banking77/shift | 0,852 | 0,020 | 0,034 | 0,035 |  |
| banking77/renamed | 0,836 | 0,020 | 0,071 | 0,031 |  |
| clinc150 | 0,930 | 0,020 | 0,081 | 0,036 |  |
| boolq | 0,843 | 0,500 | 0,017 | 0,035 |  |
| banking77/order | 0,836 | 0,020 | 0,040 | 0,033 | 0,928 |

Acciones web (`scripts/webact.py`, Mind2Web, sitios web no vistos en entrenamiento):

| Pasos | Operacion | Elemento | Exito de paso | ECE (floor p95) |
|---:|---:|---:|---:|---|
| 600 | 0,893 | 0,692 | 0,622 | 0,065 (0,055) |

El propio autor advierte que la evaluacion corresponde a una unica semilla y constituye "una medicion, no una certificacion". No se han publicado resultados de benchmarks en la informacion disponible para MMLU, HumanEval, GSM8K ni otras pruebas de generacion, porque el modelo no es un modelo generativo.

## Requisitos de hardware

- VRAM estimada para inferencia: el bundle publicado ocupa 0,1 GB, pero la inferencia requiere cargar el backbone Qwen3-4B. Estimacion orientativa para un modelo de 4.000 millones de parametros: en torno a 8-9 GB en bf16/fp16 contando pesos, cache KV y overhead; aproximadamente 3-4 GB en cuantizacion de 4 bits.
- GPU recomendadas: no disponibles en la informacion proporcionada. El entrenamiento se hizo en CUDA en 2,1 h, sin especificar la GPU empleada. Para el backbone de 4B en bf16 son suficientes tanto GPU de datacenter (A100, H100, L40S) como GPU de consumo con 12 GB o mas.
- GPU de consumo: puede ejecutarse en tarjetas de 8-12 GB si se cuantiza el backbone; en bf16 completo necesita al menos 12 GB de VRAM libre en la practica.
- Opciones de despliegue: el unico camino documentado es el gateway de trigon (`trigon serve --backend torch --weights adapter.pt`, con variables `TRIGON_*_PATH` para los calibradores) y la descarga del adaptador mas los ficheros SHA256SUMS. No se documentan integraciones con vLLM, TGI, llama.cpp ni Ollama; ollama aparece unicamente como servidor del modelo profesor Qwen3.6-35B-A3B durante la generacion de datos.
- Latencia y throughput: no disponibles. La model card si destaca que multiples preguntas se resuelven en una sola pasada de prefill, lo que reduce el coste frente a generar una respuesta por pregunta, pero no se publican medidas de tokens por segundo ni de latencia por lote.

## Comparativa con modelos similares

| Modelo | Parametros | Naturaleza | Contexto | Rendimiento declarado | Licencia |
|---|---|---|---|---|---|
| trigon qwen3-4b-lms-safe v1 | 4B (backbone) + LoRA r=16 | Clasificacion y decision tipada calibrada | no disponible | banking77 0,80-0,85; clinc150 0,93; boolq 0,843; Mind2Web exito de paso 0,622 | Apache-2.0 |
| Qwen3-4B (backbone, sin adaptador) | 4B | LLM generativo de proposito general | 32.768 tokens nativos (dato del modelo base) | No comparable: el backbone no expone el contrato de decision tipada | Apache-2.0 |
| Qwen2.5-7B-Instruct (profesor en `teacher-workflows`) | 7B | LLM generativo usado para etiquetar datos | no disponible en esta ficha | Sin evaluacion comparable; el autor indica que sus etiquetas aportan cobertura, no calibracion | Apache-2.0 |
| Clasificadores tipo encoder (BERT/DeBERTa) sobre los mismos corpus | 0,1-0,4B tipicamente | Clasificacion supervisada | Limitado al maximo de tokens del encoder | No disponible en la informacion proporcionada | Depende de cada modelo |

No se dispone de comparaciones directas publicadas por el autor frente a otras alternativas. La comparacion con el backbone Qwen3-4B y con clasificadores encoder es estructural, no de rendimiento medido en las mismas condiciones.

## Limitaciones y advertencias

- No es un modelo generativo ni conversacional: no produce texto libre, resenas ni resumenes; su salida es una distribucion sobre opciones tipadas. Usarlo como chat daria resultados incorrectos.
- Advertencia explicita del autor: la evaluacion corresponde a una unica semilla y es "una medicion, no una certificacion"; no hay validacion externa ni replicacion.
- Calibracion no garantizada fuera de los dominios de entrenamiento: el ECE se ajusta sobre casos retenidos de los mismos diez corpus, no sobre dominios nuevos.
- Casos donde el ECE supera el suelo estadistico (indicando peor calibracion de la esperada por azar): banking77/renamed (0,071 frente a 0,031), clinc150 (0,081 frente a 0,036) y acciones web (0,065 frente a 0,055). Conviene umbralizar con cautela en esos regimenes.
- Idiomas: no declarados. Todos los corpus citados estan en ingles, por lo que el rendimiento fuera del ingles es desconocido y probablemente degradado.
- Riesgo de alucinacion: reducido en el sentido generativo (no inventa texto), pero la distribucion puede asignar probabilidad alta a una etiqueta erronea cuando el estado de entrada queda fuera de la distribucion de entrenamiento.
- Sesgos: los corpus de toxicidad y discurso de odio (Aegis 2.0, HateXplain, Measuring Hate Speech) incorporan decisiones de anotacion humanas y pueden arrastrar sesgos de anotador y de dominio; la model card no documenta analisis de sesgo.
- Datos sinteticos: dos corpus (teacher-workflows y teacher-local, 2.520 casos) estan etiquetados por modelos profesores; el autor advierte que esas etiquetas aportan cobertura y no calibracion, y que nunca se usan como evidencia de calibracion.
- Licencia: el bundle se declara Apache-2.0 y el backbone tambien, por lo que no se identifican restricciones de uso comercial en la informacion disponible. Debe verificarse la licencia de cada corpus si se redistribuyen datos derivados; HateXplain presenta una discrepancia documentada entre el LICENSE del repositorio (MIT) y su dataset card (CC BY 4.0).
- El backbone no se redistribuye: hay que descargarlo por separado desde su propio repositorio en la revision indicada (1cfa9a7208912126459214e8b04321603b3df60c) para reproducir el comportamiento.
- Madurez: 0 descargas y 0 likes en el momento de la consulta, repositorio creado y actualizado el 5 de octubre de 2026; sin senales de uso en produccion ni de mantenimiento.
- En produccion conviene verificar la integridad del artefacto (`sha256sum -c SHA256SUMS`) antes de cargar `adapter.pt`.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jacobbeckdev/trigon-qwen3-4b-lms-safe
- Backbone Qwen/Qwen3-4B: https://huggingface.co/Qwen/Qwen3-4B (revision 1cfa9a7208912126459214e8b04321603b3df60c)
- Modelo profesor Qwen2.5-7B-Instruct: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct (revision a09a35458c70)
- Corpus banking77: https://github.com/PolyAI-LDN/task-specific-datasets
- Corpus goemotions: https://github.com/google-research/google-research/tree/master/goemotions
- Corpus helpsteer2: https://huggingface.co/datasets/nvidia/HelpSteer2
- Corpus measuring hate speech: https://huggingface.co/datasets/ucberkeley-dlab/measuring-hate-speech
- Corpus hatexplain: https://github.com/punyajoy/HateXplain (revision 01d742279dac)
- Corpus mind2web: https://huggingface.co/datasets/osunlp/Mind2Web
- Corpus wanli: https://huggingface.co/datasets/alisawuffles/WANLI
- Corpus jailbreak-classification: https://huggingface.co/datasets/jackhhao/jailbreak-classification (revision 2f2ceeb39658)
- Corpus prompt-injections: https://huggingface.co/datasets/deepset/prompt-injections (revision 4f61ecb038e9)
- Corpus aegis 2.0 AI content safety: https://huggingface.co/datasets/nvidia/Aegis-AI-Content-Safety-Dataset-2.0 (revision d86bb8bedff5)
- Documentacion interna citada por el autor, sin URL publica: `docs/self-host.md`, `docs/data.md`, `CLAUDE.md`, `scripts/generality.py`, `scripts/webact.py`
- La busqueda web realizada no devolvio resultados relevantes sobre este modelo (unicamente paginas de Google Maps), por lo que no hay papers, blogs ni demos adicionales que enlazar.
