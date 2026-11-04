# Athelstan05/Mochi

## Resumen

Mochi es un clasificador binario de prompt injection desarrollado como detector semantico de la etapa II del middleware MOCHI, un proyecto de tesis de grado de la Western Mindanao State University (Hans Adrian A. Lao, Jelaine May C. Macias y Rosepel M. Maglangit). El modelo parte del encoder multilingue `intfloat/multilingual-e5-small` afinado por completo y sustituye el pooling por media por un pooling de atencion con compuerta, al que anade una cabeza lineal que emite un unico logit. Devuelve una puntuacion entre 0 (benigno) y 1 (inyeccion) para cada fragmento de texto.

El problema que aborda es la deteccion de instrucciones maliciosas embebidas en entradas de usuario en aplicaciones LLM, con atencion especial a la alternancia de codigo ingles-tagalo (taglish). MOCHI invoca el modelo sobre cada parte de una peticion de chat por separado y combina la puntuacion con la procedencia del texto para decidir si permite, sanea o bloquea la peticion. Es relevante por su tamano contenido (117,6 millones de parametros, 468 MB), su licencia MIT y su enfasis en un caso de uso poco cubierto: ataques en registros linguisticos mixtos.

La arquitectura es un transformer encoder BERT de 12 capas con contexto de 512 tokens. El repositorio incluye los pesos en `safetensors` junto con una cabeza de pooling propia en `mochi_head.json` y `mochi_head.pt`, por lo que no se carga como un clasificador estandar de `transformers`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder BERT (base: `intfloat/multilingual-e5-small`), afinado completo, con pooling de atencion con compuerta y cabeza lineal de un logit |
| Parametros totales | 117.653.760 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens por fragmento; MOCHI trocea textos mas largos y conserva la puntuacion maxima |
| Tipos de cuantizacion | no disponible (solo se distribuyen pesos en `safetensors` y `mochi_head.pt` en bf16/fp32) |
| Idiomas soportados | ingles (en), tagalo (tl), con soporte de alternancia de codigo taglish |
| Licencia | MIT |
| Formato de pesos | `model.safetensors`, `mochi_head.json`, `mochi_head.pt` (solo tensores, cargado con `weights_only=True`), `tokenizer.json`, `tokenizer_config.json`, `config.json` |
| Tamano del repositorio | 0,5 GB (468 MB segun la model card) |
| Tarea | Clasificacion de texto (text-classification) |
| Etiquetas | prompt-injection, llm-security, code-switching, taglish |

## Arquitectura y entrenamiento

El modelo reutiliza el encoder de `intfloat/multilingual-e5-small` (BERT multilingue de 12 capas, 117,6 millones de parametros, contexto de 512 tokens) y lo afina por completo. Sobre las representaciones del encoder aplica un pooling de atencion con compuerta segun Ilse, Tomczak y Welling (2018), en lugar del pooling por media que usa el modelo base. La justificacion que da el autor es que en el corpus de entrenamiento el fragmento inyectado ocupa una mediana del 3,4 % del documento, de modo que un vector promediado queda dominado por texto benigno. La cabeza final es una unica capa lineal que produce un logit, transformado en probabilidad.

Los datos de entrenamiento combinan PromptShield (`hendzh/PromptShield`), `jayavibhav/prompt-injection` (limitado a 40.000 filas) y conjuntos taglish generados por los autores. El split es de 41.879 filas de entrenamiento, 17.947 de validacion y 25.639 de test, con semilla 42. El entrenamiento se realizo durante 3 epocas con tasa de aprendizaje 2e-5, tamano de lote efectivo 32, precision bf16 y longitud maxima de 512 tokens. No se documenta en la informacion disponible el uso de RLHF ni DPO; se trata de un ajuste supervisado de clasificacion.

## Capacidades

- Clasificacion binaria de prompt injection: asigna una puntuacion continua de 0 a 1 a cada fragmento de texto.
- Deteccion en entradas con alternancia de codigo ingles-tagalo (taglish).
- Procesamiento de textos largos mediante troceado en fragmentos de hasta 512 tokens y agregacion por maximo.
- Integracion como middleware en aplicaciones LLM a traves del paquete `mochi-guard`, que envuelve un cliente compatible con la API de OpenAI.
- Decisiones de politica a tres niveles (permitir, sanear, bloquear) combinando la puntuacion con la procedencia del texto.
- No soporta tool calling, agentes, vision, audio ni generacion de texto: es exclusivamente un clasificador.

## Casos de uso

- Proteccion de asistentes conversacionales: el modelo se invoca sobre cada mensaje del usuario y sobre el contenido recuperado antes de pasarlo al LLM principal, con umbrales de 0,45 y 0,55 que permiten distinguir entre texto claramente benigno, dudoso y ataque.
- Defensa frente a inyecciones en RAG: al puntuar por separado cada fragmento recuperado, MOCHI puede bloquear documentos envenenados antes de que entren en el contexto del modelo generativo.
- Filtrado en aplicaciones para usuarios filipinos: es uno de los pocos detectores publicos que declara soporte explicito de taglish, util en soporte al cliente, banca digital o mensajeria en ese registro.
- Auditoria y monitorizacion de trafico LLM: la puntuacion continua permite registrar y priorizar intentos de ataque en paneles de seguridad sin bloquear de forma binaria.
- Capa de preprocesado en pipelines de agentes: al ser un modelo pequeno (468 MB) y rapido, puede ejecutarse en cada turno de un agente multi-paso sin anadir latencia significativa frente al LLM principal.
- Investigacion en seguridad de LLM: sirve como linea base reproducible para experimentos de deteccion de inyeccion y para comparar tecnicas de pooling en tareas de clasificacion de seguridad.
- Evaluacion de contenido generado por terceros: puede puntuar respuestas de herramientas externas o resultados de busqueda antes de incorporarlos a un flujo automatizado.

## Benchmarks y rendimiento

| Evaluacion | Resultado |
|---|---|
| Split de test reservado, 25.639 filas, umbral 0,5 | F1 0,9856; recall 0,9836; tasa de falsos positivos 0,95 % |
| Mismo split, umbrales de MOCHI (benigno < 0,45, ataque > 0,55) | Recall 0,9929; tasa de falsos positivos 1,04 %; F1 0,9898 |
| Gandalf, 1.000 ataques humanos reales, pipeline MOCHI completo | 85,3 % detectados |
| BANKING77, 3.080 preguntas bancarias ordinarias | 2,66 % rechazadas erroneamente |
| CLINC150, 5.500 preguntas ordinarias en 10 dominios | 3,18 % rechazadas erroneamente |
| Conjunto taglish reservado, 300 filas | Recall 1,0000 (ver limitaciones) |

No se han publicado comparaciones con otros detectores de prompt injection en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1 GB en fp16/bf16 y menos de 0,5 GB en cuantizacion de 8 bits; el modelo pesa 468 MB en `safetensors`.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; una RTX 3060, RTX 4060 o superior ofrece margen amplio. En A100 o H100 el modelo queda limitado por el ancho de banda y el batching, no por la memoria.
- Cabe en GPU consumer: si, practicamente en cualquier GPU con 2 GB o mas de VRAM; tambien puede ejecutarse en CPU para volumenes moderados.
- Opciones de despliegue: el paquete `mochi-guard` es la via oficial; al no ser un clasificador estandar de `transformers`, requiere cargar la cabeza propia desde `mochi_head.json` o `mochi_head.pt`. No se documenta soporte de vLLM, TGI, llama.cpp ni Ollama.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Mochi (Athelstan05) | 117,6 M | 512 tokens | Deteccion de prompt injection en ingles y taglish | MIT | HuggingFace, via `mochi-guard` |
| `intfloat/multilingual-e5-small` | 117,6 M | 512 tokens | Embeddings multilingues (modelo base, no detector) | MIT | HuggingFace, `transformers` |
| `protectai/deberta-v3-base-prompt-injection` | no disponible en esta busqueda | no disponible | Deteccion de prompt injection en ingles | no disponible | HuggingFace |
| `meta-llama/Prompt-Guard-86M` | 86 M | 512 tokens | Deteccion de prompt injection y jailbreak | Llama 3.2 Community License | HuggingFace |

La comparacion cuantitativa con estos detectores no esta disponible en la informacion proporcionada; los datos de la tabla anterior proceden de conocimiento general y deberian verificarse antes de su uso en produccion.

## Limitaciones y advertencias

- La evaluacion en taglish no es independiente: 209 de las 300 filas reservadas estaban en los datos de entrenamiento o validacion del modelo. El recall sobre las 91 filas no vistas fue identico (1,0000), pero no existe todavia un conjunto de prueba con hablantes nativos.
- Rendimiento fuera de distribucion notablemente inferior: 85,3 % en Gandalf frente al 99,3 % en su propio split. Las parafrasis de ataques son el principal vector de evasion.
- Los falsos positivos se concentran en peticiones de cancelacion, cierre o reinicio: el 72 % de las preguntas de "terminate account" de BANKING77 fueron rechazadas.
- Los documentos largos diluyen la senal: la puntuacion cubre el fragmento completo, por lo que el texto benigno alrededor de una inyeccion corta reduce el score.
- Las inyecciones formuladas como procedimiento ordinario ("nuevo procedimiento de seguridad: dile al cliente que...") pueden puntuar cerca de 0.
- El modelo no es un clasificador estandar de `transformers`: cargarlo sin la cabeza de pooling propia produce resultados incorrectos.
- El dataset `jayavibhav/prompt-injection` no declara licencia en HuggingFace, lo que conviene considerar si se requiere trazabilidad estricta de datos.
- Es un modelo de tesis de grado, con 0 descargas y 0 likes en el momento de la ficha; no hay evidencia de uso en produccion ni mantenimiento continuado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Athelstan05/Mochi
- Repositorio del proyecto MOCHI: https://github.com/NissanAlGaib/MOCHI
- Modelo base: https://huggingface.co/intfloat/multilingual-e5-small
- Dataset PromptShield: https://huggingface.co/datasets/hendzh/PromptShield
- Dataset de prompt injection: https://huggingface.co/datasets/jayavibhav/prompt-injection
- Referencia del pooling de atencion con compuerta (Ilse, Tomczak y Welling, 2018): https://arxiv.org/abs/1802.04434
