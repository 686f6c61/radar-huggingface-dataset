# alfredmh/Palette_nlu_service

## Resumen

Palette_nlu_service es un modelo de comprension del lenguaje natural (NLU) para el dominio de ventas en persa, publicado por el usuario alfredmh en HuggingFace. No es un modelo generativo, sino un encoder discriminativo construido sobre el backbone persa sbunlp/fabert (FaBERT) con una arquitectura JointBERT: una cabeza MLP para clasificacion de intenciones, una capa CRF para etiquetado de slots (slot filling) y un clasificador auxiliar que decide si un fragmento de la consulta debe conservarse o descartarse (KEEP/DROP) como termino de busqueda. La salida se estructura como JSON conforme a un esquema de prompt propio del proyecto "Palette".

El modelo cubre 22 intenciones orientadas a comercio electronico y atencion al cliente en persa, entre ellas PRODUCT_SEARCH, PRODUCT_PRICE, PRODUCT_DETAIL, PRODUCT_AVAILABILITY, PRODUCT_RECOMMENDATION, PRODUCT_COMPARE, PRODUCT_IMAGE, NEGOTIATION, varias FAQ_*, GREETING, WELLNESS, THANKS, FAREWELL, HELP y OUT_OF_SCOPE. Resuelve el problema de convertir lenguaje natural de clientes persas en una representacion estructurada (intencion + slots + consulta de busqueda limpia) que un sistema de comercio o un asistente pueda consumir directamente.

Su relevancia es limitada y practica: el propio autor lo describe como un punto de partida entrenado con un conjunto semilla de aproximadamente 900 muestras JSONL de ventas en persa, con una precision de intencion en validacion de en torno al 86% tras 8 epocas de entrenamiento en CPU. El repositorio ocupa 0,5 GB y contiene un checkpoint completo de JointBERT, el tokenizador de FaBERT, los mapas de etiquetas y la configuracion del modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | JointBERT sobre backbone FaBERT (cabeza MLP de intenciones, CRF de slots y clasificador KEEP/DROP de consulta) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (heredada del backbone sbunlp/fabert) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | persa (fa) |
| Licencia | other (consultar condiciones exactas en la pagina del modelo) |
| Formato de pesos | PyTorch (checkpoints/best.pt, state_dict); repositorio de 0,5 GB |

## Arquitectura y entrenamiento

La arquitectura es un JointBERT clasico: un encoder transformer preentrenado (sbunlp/fabert, modelo BERT para persa) que alimenta simultaneamente tres tareas. La primera es la clasificacion de intenciones mediante una cabeza MLP sobre la representacion del token [CLS]. La segunda es el slot filling, resuelto con una capa CRF sobre las representaciones de los tokens, lo que permite modelar dependencias entre etiquetas BIO. La tercera es una clasificacion binaria KEEP/DROP que filtra que tokens de la consulta del usuario deben mantenerse como termino de busqueda efectivo. El modelo emite una salida JSON estructurada alineada con el esquema INTENT_PROMPT del proyecto Palette.

En cuanto al entrenamiento, la model card indica que se utilizo un dataset semilla de JSONL de ventas en persa de aproximadamente 900 muestras. Se entrenaron 8 epocas en CPU y se alcanzo una precision de intencion en validacion de aproximadamente el 86%. No se menciona el uso de RLHF, DPO ni tecnicas de alineacion adicionales, ni el numero de tokens de entrenamiento del backbone original. El propio autor advierte que para produccion es necesario anadir transcripciones reales de tienda y reentrenar.

## Capacidades

- Clasificacion de intenciones en persa sobre un conjunto cerrado de 22 etiquetas orientadas a ventas y atencion al cliente.
- Slot filling (extraccion de entidades) mediante CRF, orientado a parametros de producto, precios, atributos y similares.
- Clasificacion KEEP/DROP de la consulta de busqueda, para depurar el termino efectivo que se enviara al buscador.
- Generacion de salida JSON estructurada, compatible con el esquema INTENT_PROMPT del proyecto Palette.
- Integracion como servicio HTTP mediante el script serve.py del repositorio complementario.
- Modelo discriminativo de texto: no genera lenguaje natural libre, por lo que no soporta redaccion, resumen ni dialogos generativos por si mismo.
- Soporte de tool calling / function calling: no disponible de forma nativa (la salida estructurada puede actuar como disparador, pero no se documenta integracion con APIs de herramientas).
- Razonamiento multi-paso y capacidades de agente: no disponibles.
- Capacidades multilingues: limitadas al persa (fa).
- Capacidades de vision o audio: no disponibles.

## Casos de uso

- Enrutado de peticiones en atencion al cliente persa: el modelo clasifica el mensaje del usuario en una de las 22 intenciones y lo dirige al flujo correspondiente (consulta de precio, disponibilidad, comparativa, etc.), reduciendo la necesidad de reglas manuales.
- Parsing de busquedas en comercio electronico: combinando la intencion PRODUCT_SEARCH con el filtrado KEEP/DROP y el etiquetado de slots, se construye una consulta de busqueda limpia y con filtros estructurados a partir de texto libre en persa.
- Preprocesado para motores de recomendacion: la intencion PRODUCT_RECOMMENDATION y los slots extraidos permiten alimentar un sistema de recomendacion con el producto o categoria objetivo ya identificados.
- Automatizacion de respuestas sobre disponibilidad y precio: las intenciones PRODUCT_AVAILABILITY y PRODUCT_PRICE mas los slots asociados permiten consultar el catalogo y responder sin intervencion humana.
- Gestion de negociacion en chat de ventas: la intencion NEGOTIATION permite desviar la conversacion a un agente humano o a un flujo especifico cuando el cliente plantea regateo.
- Clasificacion de consultas fuera de alcance: la etiqueta OUT_OF_SCOPE facilita descartar o degradar conversaciones que no corresponden al dominio comercial, evitando respuestas erroneas.
- Construccion de un NLU de referencia para prototipos en persa: al ser un checkpoint ligero con scripts de carga y servido, sirve como base rapida para validar pipelines de NLU antes de invertir en datos reales de tienda.

## Benchmarks y rendimiento

| Metrica | Valor | Condiciones |
|---|---|---|
| Precision de intencion (validacion) | ~86% | ~900 muestras JSONL de ventas en persa, 8 epocas, entrenamiento en CPU |
| Metricas de slot filling (F1, precision, recall) | no disponible | no publicadas |
| Metricas del clasificador KEEP/DROP | no disponible | no publicadas |
| MMLU, HumanEval, GSM8K u otros benchmarks generales | no aplica / no disponible | modelo discriminativo de NLU, no generativo |

No se han publicado otros resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita. El repositorio ocupa 0,5 GB, coherente con un encoder tipo BERT-base en precision completa; el consumo real depende del tamaño exacto de parametros del backbone, que no se detalla.
- GPU recomendadas: no especificadas por el autor. El entrenamiento se realizo en CPU, lo que indica que la inferencia es perfectamente viable sin GPU.
- Compatibilidad con GPU de consumo: previsiblemente compatible con cualquier GPU de consumo moderna (por ejemplo, RTX 3060 en adelante) e incluso en CPU, dado el tamaño de repositorio y el tipo de arquitectura encoder.
- Opciones de despliegue: transformers (libreria declarada), HuggingFace Inference Endpoints (etiqueta endpoints_compatible) y servidor propio mediante scripts/serve.py del repositorio complementario. No se documenta soporte para vLLM, TGI, llama.cpp ni Ollama, que estan orientados a modelos generativos.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Idioma | Contexto | Rendimiento | Licencia |
|---|---|---|---|---|---|
| alfredmh/Palette_nlu_service | JointBERT (NLU: intencion + slots + KEEP/DROP) | Persa | no disponible | ~86% de precision de intencion en validacion | other |
| sbunlp/fabert | Encoder BERT preentrenado (backbone) | Persa | no disponible | no disponible (modelo base, no tarea especifica) | consultar en HuggingFace |
| Otros modelos NLU para persa de la misma categoria | no disponible | Persa | no disponible | no disponible | no disponible |

La busqueda web realizada no devolvio resultados relevantes sobre modelos comparables; los enlaces recuperados correspondian a herramientas de traduccion hungaro-alemanas sin relacion con el modelo. No es posible, por tanto, ofrecer una comparativa cuantitativa fiable con alternativas.

## Limitaciones y advertencias

- Entrenamiento con un unico conjunto semilla de aproximadamente 900 muestras, muy reducido para un dominio comercial real; el propio autor recomienda reentrenar con transcripciones reales antes de produccion.
- Precision de intencion en validacion de solo ~86%, lo que implica un margen de error apreciable en clasificacion.
- No se publican metricas de slot filling ni del clasificador KEEP/DROP, por lo que su calidad real en produccion es desconocida.
- Cobertura limitada al persa (fa); no soporta otros idiomas ni mezcla de idiomas.
- Dominio restringido a ventas y comercio electronico; las peticiones fuera de ese ambito caen en OUT_OF_SCOPE o pueden clasificarse de forma incorrecta.
- Al ser un modelo discriminativo, no presenta riesgo de alucinacion en el sentido generativo, pero si de clasificaciones erroneas con alta confianza.
- Posibles sesgos derivados del dataset semilla, que no se describe en cuanto a composicion, origen o diversidad.
- Licencia etiquetada como "other": es imprescindible revisar las condiciones exactas en la pagina del modelo antes de cualquier uso comercial.
- No se documentan cuantizaciones ni formatos optimizados (GGUF, ONNX) para despliegue ligero.
- El repositorio no incluye datos de entrenamiento, por lo que no es posible auditar el dataset ni reproducir el entrenamiento tal cual.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/alfredmh/Palette_nlu_service
- Modelo base FaBERT: https://huggingface.co/sbunlp/fabert
- Repositorio complementario citado en la model card (Palette_nlu_service, con scripts/serve.py): no se proporciona URL directa en la informacion disponible
- Resultados de busqueda web: los enlaces recuperados no guardan relacion con el modelo (herramientas de traduccion hungaro-alemanas) y se omiten por no ser relevantes.
