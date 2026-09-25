# DNG/ArseneLupin-v1.1-bucket

## Resumen

ArseneLupin v1.1 es un modelo de decisión abierto desarrollado por IBOU-SEARCH y distribuido en este repositorio como espejo (mirror) por el usuario DNG. No es un modelo generativo: recibe un estado (un documento, un ticket, una traza, un registro JSON) y una o varias preguntas tipadas, y devuelve una distribución de probabilidad por pregunta en un único forward pass por opción, sin producir texto. Admite tres tipos de pregunta: `noul` (sí/no), `choice` (una opción entre varias) y `score` (un nivel ordenado). Expone la misma forma de petición que una API System One mediante `POST /v1/systemone` con un cuerpo `{"state": ..., "questions": {...}}`.

El modelo parte de Qwen/Qwen3.5-4B (Apache 2.0), conserva su arquitectura y su tokenizer, y pesa 4.659.865.088 parámetros en safetensors (aproximadamente 4,66 mil millones), de los cuales 4,21 mil millones se emplean para las decisiones. Sobre esa base se aplicó un ajuste fino con LoRA de rango 32 y α 64 en todas las capas lineales, ya fusionado en los pesos, más una cabeza de lectura entrenada de solo 2.561 parámetros que convierte el último estado oculto en la probabilidad de `yes` para cada opción. El repositorio ocupa 9,3 GB e incluye el checkpoint completo en bfloat16.

Su relevancia actual reside en el enfoque: en lugar de generar respuestas largas, produce probabilidades calibrables por flujo de trabajo mediante ficheros de temperatura opcionales, de modo que una probabilidad de 0,8 signifique que la respuesta es correcta 8 de cada 10 veces. Frente a alternativas como Jev 1.13 o openjev 26B, destaca en transferencia a una decisión no entrenada (92,0 % frente a 85,0 %), en ESCI, MASSIVE, intención de búsqueda en francés, amenazas y discurso de odio, y obtiene 49,05 en el panel principal del Decision Index. Este repositorio concreto es un espejo anclado a la revisión `834a029c047a` del repositorio original, pensado para que el Space de demostración cargue desde una copia fija.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (hereda la de Qwen/Qwen3.5-4B), con cabeza de lectura entrenada de 2.561 parametros |
| Parametros totales | 4.659.865.088 (aproximadamente 4,66B); 4,21B usados para las decisiones |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible (heredada de Qwen/Qwen3.5-4B, no especificada en la informacion proporcionada) |
| Tipos de cuantizacion | bfloat16 en la raiz del repositorio; Q8_0 (GGUF) en el repositorio original, no espejado aqui |
| Idiomas soportados | en, fr |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (mas cabeza de lectura en `readout/head.safetensors` y ficheros de calibracion JSON) |

Datos adicionales: tamano del repositorio 9,3 GB; modelo base Qwen/Qwen3.5-4B (revision `851bf6e806efd8d0a36b00ddf55e13ccb7b8cd0a`); descargas 0 y likes 0 en el momento de la consulta; fecha de creacion y actualizacion 2026-09-24.

## Arquitectura y entrenamiento

El modelo reutiliza íntegramente la arquitectura y el tokenizer de Qwen/Qwen3.5-4B, un transformer denso de 4,66B parámetros del que se conserva la estructura del checkpoint. La adaptación consiste en un ajuste fino con LoRA de rango 32 y α 64 aplicado a todas las capas lineales, posteriormente fusionado en los pesos, de forma que en inferencia no hay adaptadores separados que cargar. La salida del modelo no es texto: una cabeza de lectura entrenada de solo 2.561 parámetros (`readout/head.safetensors`) transforma el último estado oculto en la probabilidad de `yes` para cada opción planteada. El sistema devuelve una distribución de probabilidad por pregunta en un único forward pass por opción.

El entrenamiento se orienta a tres tipos de decisión tipada (sí/no, elección y nivel ordenado) y no describe en la información disponible el número de tokens, la composición del dataset ni si hubo RLHF o DPO. La innovación destacable es la capa de calibración: cada fichero de `calibration/` contiene un factor de corrección para un tipo de flujo de trabajo y se pasa con `--calibration` (o `calibration/default.json` como valor por defecto). El factor modifica las probabilidades pero nunca la respuesta elegida, y busca que las probabilidades sean interpretables en términos frecuentistas por workflow.

## Capacidades

- Clasificación y decisión tipada: responde preguntas `noul` (sí/no), `choice` (una entre varias opciones) y `score` (nivel ordenado como Low, Medium, Critical).
- Salida probabilística calibrable: devuelve una distribución, no texto generado, con un forward pass por opción.
- Calibración por flujo de trabajo: ficheros de temperatura específicos que ajustan la confianza sin alterar la opción escogida.
- Clasificación de intenciones: cubierta por resultados en Banking77 y CLINC150.
- Relevancia en búsqueda y catálogo: resultados en Amazon ESCI (product relevance) y en intención de búsqueda en francés.
- Moderación de contenido: evaluación de amenazas en comentarios y discurso de odio en tres niveles mediante B/2.
- Decisión sobre trazas de agentes y evaluación de workflows de servicio al cliente y de incidentes de seguridad.
- Multilingüe limitado a inglés y francés (etiquetas `en`, `fr`; MASSIVE se evalúa en 4 idiomas dentro de los benchmarks reportados).
- Integración en servicios: API compatible con System One mediante `POST /v1/systemone`.
- No dispone de generación de texto, tool calling, capacidades de agente, visión ni audio según la información proporcionada.

## Casos de uso

- Triaje de tickets de soporte: con el tipo `choice`, el modelo recibe el texto del ticket como estado y responde a la pregunta "¿qué departamento debe gestionarlo?", devolviendo una distribución sobre departamentos que permite enrutar automáticamente y aplicar un umbral de confianza para escalar a revisión humana.
- Enrutado y priorización de incidentes de seguridad: con el tipo `score`, el modelo asigna severidad ordenada (de Low a Critical) a un incidente descrito en JSON; el flujo de calibración de incidentes reporta un B/2 de 0,0844, lo que permite fijar umbrales operativos con probabilidades interpretables.
- Moderación de contenido en comunidades: con `score` en tres niveles para discurso de odio y `noul` para amenazas, el modelo obtiene B/2 de 0,0658 y 0,0021 respectivamente, valores que lo sitúan por delante de Jev 1.13 en esta tarea y lo hacen adecuado para filtrado previo a revisión humana.
- Clasificación de intención en asistentes conversacionales: sobre Banking77 y CLINC150 el modelo alcanza 88,5 % y 97,0 %, de modo que puede etiquetar la intención de un turno de usuario para decidir la siguiente acción del diálogo sin generar texto.
- Relevancia de productos en comercio electrónico y búsqueda: con el tipo `choice` sobre pares consulta-producto, obtiene 69,6 % en Amazon ESCI en japonés, lo que permite ordenar o filtrar resultados en catálogos multilingües.
- Evaluación de trazas de agentes: el flujo específico de trazas reporta un B/2 calibrado de 0,0780, útil para puntuar automáticamente si una traza de agente cumple un criterio definido por el equipo.
- Enrutado de conversaciones de atención al cliente en francés e inglés: con 50,7 % en intención de búsqueda en francés sobre oro humano y 82,0 % en MASSIVE en cuatro idiomas, sirve para clasificar peticiones en centros de contacto bilingües.
- Deduplicación y clasificación documental: al aceptar un documento completo como estado, permite etiquetar registros JSON o documentos en lotes con una sola pasada por opción, sin coste de decodificación autoregresiva.

## Benchmarks y rendimiento

Todas las cifras fueron medidas por el autor con las mismas entradas para todos los sistemas. En exactitud, más es mejor; en B/2 (media del Brier score contra una distribución de referencia) menos es mejor. Algunas tareas están marcadas como propietarias.

| Benchmark | ArseneLupin v1.1 | Jev 1.13 | openjev 26B | laya 421M |
|---|---|---|---|---|
| Multi-family decisions (173), tarea propietaria | 93,1 % | 93,6 % | 92,5 % | 74,0 % |
| Transfer a una decisión no entrenada (200), tarea propietaria | 92,0 % | 85,0 % | 91,5 % | 47,0 % |
| Median sin lista, modo lista (50), tarea propietaria | 98,0 % | 98,0 % | 86,0 % | 14,0 % |
| jabr v2, benchmark publico externo, 49 tareas (869) | 88,4 % | 97,1 % | 95,3 % | 58,5 % |
| jabr v2, subconjunto de eleccion, 20 tareas | 92,3 % | 97,7 % | 98,6 % | 70,8 % |
| Banking77 intents (800) | 88,5 % | 92,8 % | 88,9 % | 86,4 % |
| CLINC150 intents (800) | 97,0 % | 98,4 % | 95,4 % | 98,8 % |
| Amazon ESCI relevancia de producto, ja (500) | 69,6 % | 65,0 % | 62,8 % | 32,0 % |
| MASSIVE intents, 4 idiomas (482) | 82,0 % | 81,5 % | 80,5 % | 65,8 % |
| Intencion de busqueda en frances, oro humano (1.016) | 50,7 % | 43,9 % | 43,8 % | 15,5 % |
| Amenazas en comentarios, B/2 (500) | 0,0021 | 0,0096 | 0,0057 | 0,0645 |
| Discurso de odio, 3 niveles, B/2 (300) | 0,0658 | 0,2016 | 0,1531 | 0,2511 |
| Flujo de incidentes de seguridad, B/2 (26), calibrado | 0,0844 | 0,0385 | 0,1076 | 0,1449 |
| Flujo de trazas de agentes, B/2 (52), calibrado | 0,0780 | 0,0701 | 0,1176 | 0,2164 |
| Flujo de atencion al cliente, B/2 (84), calibrado | 0,0564 | 0,0346 | 0,0712 | 0,2382 |

Decision Index (banco de pruebas y clasificación publica de motores de decision tipada de Apolinario Passos, con kit de reproduccion abierto bajo licencia MIT). Medición propia del autor con ese kit sobre la suite reconstruida desde sus fuentes publicas: 49,05 en el panel principal (19 benchmarks, cinco areas ponderadas por igual). No es una entrega oficial. En la clasificacion publica del 22 de septiembre de 2026, la mejor reproduccion por debajo de 9B parametros era Kev 4B con 47,43, y Jev figura con 59,51.

| Area | ArseneLupin v1.1 | Jev |
|---|---|---|
| Knowledge & Reasoning | 42,7 | 68,9 |
| Language Understanding | 53,6 | 62,3 |
| Retrieval & Classification | 33,9 | 37,0 |
| Tools & Automation | 67,0 | 73,4 |
| Arts & Human Judgment | 48,1 | 56,0 |

Puntos destacados segun el autor: por delante de Jev 1.13 en transferencia a una decisión no entrenada (92,0 frente a 85,0), ESCI, MASSIVE, intención de búsqueda en francés, amenazas y discurso de odio; empatado en el test de la mediana.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: los pesos del modelo completo ocupan los 9,3 GB publicados del repositorio; contando activaciones y cache de clave-valor, el margen practico razonable se situa en torno a 11-14 GB, si bien no se proporciona una cifra oficial.
- VRAM estimada en GGUF Q8_0: el autor indica 4,5 GB para esa build, alojada en el repositorio original y no en este espejo; con overhead de contexto se situaria aproximadamente en 6-8 GB, estimacion derivada del tamano publicado.
- GPU recomendadas: RTX 4090 (24 GB) y RTX 3090 para bfloat16 en una sola tarjeta; A100 y H100 ofrecen holgura de sobra para batching. Cabe en GPU de consumo con 12-16 GB o mas en bfloat16 y con 8 GB en la cuantizacion Q8_0.
- Cabe en GPU de consumo: si, en la mayoria de tarjetas de gama alta y media-alta recientes, siempre con las cifras estimadas anteriores.
- Opciones de despliegue: el repositorio incluye el paquete `arsenelupin` en `code/` con un servidor propio (`python -m arsenelupin serve --config serve.yaml --calibration calibration/default.json --port 8000`) que expone `POST /v1/systemone` y admite `cuda:0`, `mps` (Mac) o `cpu` como dispositivo. Requiere `transformers==5.17.0`, la version con la que se entreno y midio el modelo. La cuantizacion GGUF esta pensada para llama.cpp, pero no esta espejada en este repositorio. No se mencionan vLLM, TGI, Ollama ni otras alternativas.
- Latencia y throughput: no disponibles. Estructuralmente el coste es de un forward pass por opción, sin bucle de decodificacion autoregresiva, lo que reduce el coste frente a modelos generativos, pero no se publican cifras de latencia ni de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento relativo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ArseneLupin v1.1 | 4,66B (4,21B usados para decisiones) | no disponible | 49,05 en el Decision Index; lidera en transferencia no entrenada, ESCI, MASSIVE, frances, amenazas y odio | apache-2.0 | HuggingFace (original y espejo) |
| Jev 1.13 | no disponible | no disponible | 59,51 en el Decision Index; mejor en jabr v2, Banking77, CLINC150 y flujos calibrados de seguridad, agentes y atencion al cliente | no disponible | no disponible |
| openjev 26B | 26B (inferido del nombre) | no disponible | 92,5-98,6 % en varias tareas de eleccion; por detras en ESCI, MASSIVE y frances, por delante en algunas calibraciones | no disponible | no disponible |
| laya 421M | 421M (inferido del nombre) | no disponible | claramente por debajo en casi todas las tareas (por ejemplo, 14,0 % en el test de la mediana) | no disponible | no disponible |

El Decision Index del autor situa como mejor reproduccion por debajo de 9B parametros a Kev 4B, con 47,43, frente a los 49,05 de ArseneLupin v1.1 segun la medicion propia (no oficial). No se dispone de datos de parametros ni de contexto de Jev 1.13, openjev 26B ni laya 421M mas alla de lo indicado.

## Limitaciones y advertencias

- Este repositorio es un espejo de IBOU-SEARCH/ArseneLupin-v1.1 anclado a la revision `834a029c047a`; para cualquier uso distinto del Space de demostracion, el autor recomienda el repositorio original.
- La build GGUF Q8_0 no esta espejada aqui: el Space funciona en bfloat16. Quien necesite la cuantizacion debe acudir al repositorio original.
- Modelo de decision, no generativo: no produce texto, no soporta tool calling, ni razonamiento multi-paso, ni visión o audio.
- Idiomas limitados a ingles y frances segun las etiquetas del repositorio; el rendimiento fuera de esos idiomas no esta documentado.
- Rendimiento claramente por debajo de Jev 1.13 en jabr v2 (88,4 % frente a 97,1 %), Banking77 (88,5 % frente a 92,8 %) y en los flujos calibrados de seguridad, trazas de agentes y atencion al cliente.
- En el Decision Index, las areas de Knowledge & Reasoning (42,7 frente a 68,9) y Retrieval & Classification (33,9 frente a 37,0) quedan por detras de Jev; el resultado de 49,05 es una medicion propia del autor y no una entrega oficial al ranking.
- La calibracion solo es valida para el flujo de trabajo para el que se genero: usar el fichero equivocado invalida la interpretacion frecuentista de las probabilidades.
- Los benchmarks marcados como propietarios no son verificables de forma independiente.
- No se documentan sesgos especificos, tasas de alucinacion (no aplica en sentido generativo) ni limites de contexto en la informacion disponible.
- Licencia Apache 2.0 tanto del modelo como de la base, lo que permite uso comercial, pero el autor no detalla condiciones adicionales ni garantias.
- Dependencia estricta de `transformers==5.17.0` para el codigo de servicio incluido; versiones distintas pueden no ser compatibles.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay validacion por parte de la comunidad ni soporte contrastado.
- Los resultados de busqueda web recuperados tratan sobre el formato de imagen DNG y una consultora homonima, y no guardan relacion con este modelo; se descartan como fuentes.

## Enlaces

- Repositorio en HuggingFace (espejo): https://huggingface.co/DNG/ArseneLupin-v1.1-bucket
- Repositorio original: https://huggingface.co/IBOU-SEARCH/ArseneLupin-v1.1
- Revision espejada: https://huggingface.co/IBOU-SEARCH/ArseneLupin-v1.1/tree/834a029c047a37ea91fbda41b08f340e79163088
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Space de demostracion (playground de marketing): https://huggingface.co/spaces/DNG/arsenelupin-marketing-playground
- Decision Index (banco de pruebas y clasificacion de Apolinario Passos): https://huggingface.co/spaces/multimodalart/jev-decision-index
