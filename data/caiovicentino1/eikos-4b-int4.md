# caiovicentino1/Eikos-4B-INT4

## Resumen

Eikos-4B-INT4 es la version cuantizada a 4 bits de Eikos-4B, un modelo desarrollado por el usuario caiovicentino1 que no genera texto libre, sino que responde decisiones tipadas (si/no, una de N opciones, puntuaciones ordinales) sobre un estado dado, devolviendo una probabilidad calibrada para cada opcion en un unico forward pass. El modelo parte de Qwen3.5-4B (licencia Apache-2.0) y anade una torre de vision, pesos de prediccion multi-token (MTP) y una cabeza de lectura por letras.

Esta variante aplica cuantizacion GPTQ W4A16 con grupos de 128 y activaciones en bf16, generada con llm-compressor en formato compressed-tensors y calibrada con 256 elementos de entrenamiento, nunca con datos de evaluacion. El repositorio ocupa 4,0 GB frente a los 9,3 GB del build bf16 y declara 4.539.265.536 parametros totales; la torre de vision, los pesos MTP, los embeddings y el LM head se mantienen en mayor precision.

Su interes practico reside en el binomio calibracion-coste: conserva un ECE de 0,033 identico al del modelo bf16 y limita la perdida a 1,8 puntos en JevBench hard (73,9 frente a 72,1), lo que permite desplegar decisiones con umbral de confianza en hardware mas modesto. Como contrapartida, exige vLLM >= 0.30.0 y no cumple el criterio de acuerdo de respuestas fijado por el propio autor (95,5% frente al 97% exigido).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hibrida Gated DeltaNet (base Qwen3.5-4B), con torre de vision y pesos MTP |
| Parametros totales | 4.539.265.536 (dato real de safetensors) |
| Parametros activos | no disponible (no se declara configuracion MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GPTQ W4A16, pesos INT4 en grupos de 128, activaciones bf16; torre de vision, pesos MTP, embeddings y LM head en mayor precision |
| Idiomas soportados | no disponible |
| Licencia | MIT para las contribuciones del autor; el modelo base Qwen3.5-4B es Apache-2.0 |
| Formato de pesos | safetensors en formato compressed-tensors (generado con llm-compressor) |

Otros datos tecnicos: pipeline declarado `text-classification`, libreria `transformers`, tamano de repositorio 4,0 GB, requiere vLLM >= 0.30.0, calibracion en `calib.json` con T = 1 (identica a la del modelo bf16).

## Arquitectura y entrenamiento

El modelo se apoya en una arquitectura hibrida Gated DeltaNet heredada del modelo base Qwen3.5-4B. La model card de esta variante menciona explicitamente que se trata de una arquitectura hibrida y que su comportamiento en batching es sensible: la version INT4 exige vLLM >= 0.30.0 porque builds anteriores devuelven respuestas incorrectas cuando se agrupan varias peticiones largas. Sobre esa base se anaden una torre de vision (lo que explica la etiqueta `image-text-to-text`) y pesos de prediccion multi-token (MTP), ambos preservados en mayor precision durante la cuantizacion.

El proceso de cuantizacion emplea GPTQ W4A16 con grupos de 128 y activaciones en bf16, ejecutado con llm-compressor y calibrado sobre 256 elementos de entrenamiento que, segun el autor, nunca provienen de los conjuntos de evaluacion. Se conservan el mismo formato de prompt, la misma lectura por letras y la misma calibracion (T = 1) que el modelo bf16. La informacion disponible no detalla el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO en el modelo base; esos datos corresponden a la ficha de Eikos-4B, no incluida en esta busqueda.

## Capacidades

- Decision tipada en un unico forward pass: respuestas si/no, eleccion entre N opciones y puntuaciones ordinales.
- Probabilidad calibrada por opcion, con umbrales de confianza utilizables en produccion (ECE 0,033).
- Lectura por letras (letter readout) como interfaz de respuesta, con formato de prompt y `calib.json` identicos al modelo bf16.
- Entrada multimodal de imagen y texto, segun la etiqueta `image-text-to-text` y la presencia de torre de vision.
- Prediccion multi-token (MTP) como componente del modelo.
- Razonamiento multi-paso mediante sesiones de agente y tipos de pregunta equivalentes a los de Eikos-4B.
- API HTTP propia y motor vLLM con prefix cache hibrida, orientados a despliegue con batching.
- Dominio financiero: las suites de evaluacion cubren CUAD, analisis de sentimiento y FinQA-judge, ademas de reglas de trading vistas y no vistas.
- Reglas composicionales: mismo tipo, dominio nuevo y rulebooks.
- Idiomas soportados: no disponible.

## Casos de uso

- Filtrado de decisiones binarias en pipelines financieros: el modelo responde si/no con probabilidad calibrada, de modo que el sistema puede actuar solo cuando la confianza supera un umbral (el autor reporta 32,9% de decisiones tomadas con confianza >= 0,90 y un 2,0% de error en ese tramo).
- Clasificacion de contratos y documentos legales: con la suite CUAD como referencia de evaluacion, permite etiquetar clausulas o condiciones en lugar de generar texto libre, reduciendo el coste de post-procesado.
- Enrutado de tickets de soporte: eleccion entre N categorias predefinidas con una probabilidad asociada, lo que facilita derivar automaticamente los casos ambiguos a revision humana.
- Analisis de sentimiento financiero: la bateria de finanzas (CUAD, sentimiento, FinQA-judge) alcanza 75,7 en esta variante, por encima de los 74,7 del bf16, lo que lo hace apto para puntuar noticias o informes con salida ordinal.
- Verificacion de reglas de negocio y compliance: la evaluacion de reglas de trading (74,9 en reglas vistas y 76,0 en no vistas) sugiere su uso para comprobar si una operacion cumple un conjunto de reglas documentadas.
- Agentes con decision tipada: al integrarse con vLLM mediante la API HTTP y sesiones de agente incluidas en el repositorio, puede actuar como cabecera de decision de un agente que delega la generacion de texto en otro modelo.
- Revision documental asistida por vision: la torre de vision permite incorporar capturas o escaneos como parte del estado sobre el que se emite la decision.
- Despliegue en hardware limitado: con 4,0 GB de pesos, permite ejecutar el mismo comportamiento de decision del modelo bf16 en GPUs de gama media sin renunciar a la calibracion.

## Benchmarks y rendimiento

Los datos proceden de la validacion publicada por el autor, con los mismos 7.371 elementos (7 suites nunca usadas en entrenamiento), vLLM 0.30 con batching y prefix cache activados.

| Metrica | Eikos-4B (bf16) | Eikos-4B-INT4 |
|---|---|---|
| Tamano | 9,3 GB | 4,0 GB |
| JevBench public — original / hard | 91,7 / 73,9 | 91,7 / 72,1 |
| DecisionBench — medium / hard | 77,1 / 66,6 | 77,1 / 66,2 |
| Bateria general (9 tareas) | 75,7 | 75,6 |
| Finanzas (CUAD, sentimiento, FinQA-judge) | 74,7 | 75,7 |
| Reglas de trading — vistas / no vistas | 74,5 / 76,0 | 74,9 / 76,0 |
| Reglas composicionales — mismo tipo / dominio nuevo / rulebooks | 96,0 / 91,5 / 91,7 | 95,8 / 91,7 / 90,7 |
| ECE (menor es mejor) | 0,033 | 0,033 |
| Confianza >= 0,90: decide / error | 34,7% / 2,5% | 32,9% / 2,0% |
| Misma respuesta que bf16 (total / confianza >= 0,9) | — | 95,5% / 100,0% |

## Requisitos de hardware

- Pesos en disco y en memoria: 4,0 GB en INT4 (frente a 9,3 GB en bf16), con activaciones en bf16.
- VRAM estimada: no disponible de forma oficial; a partir del tamano de pesos, la carga del modelo ronda los 4-5 GB y el resto del consumo depende de la cache KV y de la longitud de las peticiones.
- GPU de centro de datos: A100, H100 y equivalentes son compatibles por capacidad, si bien el modelo es de 4B y no los aprovecha en plenitud.
- GPU de consumo: el modelo cabe en tarjetas de 12 GB o mas, como RTX 3060 12 GB, RTX 4070, RTX 4080 y RTX 4090; en 8 GB el margen es ajustado y no hay confirmacion del autor.
- Opciones de despliegue: vLLM >= 0.30.0 es la via documentada y obligatoria (`serve_vllm.sh` + `serve.py` para la API HTTP en el puerto 8000). No se documentan llama.cpp, Ollama ni TGI para este build.
- Precaucion de despliegue: con builds de vLLM anteriores a 0.30.0, el batching de peticiones largas sobre esta arquitectura hibrida devuelve respuestas incorrectas.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Rendimiento |
|---|---|---|---|---|---|
| Eikos-4B-INT4 | 4,54B (INT4, 4,0 GB) | no disponible | MIT (contribuciones) + Apache-2.0 (base) | HuggingFace, vLLM >= 0.30.0 | JevBench hard 72,1; ECE 0,033 |
| Eikos-4B (bf16) | 4,54B (bf16, 9,3 GB) | no disponible | MIT (contribuciones) + Apache-2.0 (base) | HuggingFace | JevBench hard 73,9; ECE 0,033 |
| Qwen3.5-4B (modelo base) | 4B aproximados | no disponible | Apache-2.0 | HuggingFace | no disponible |

No se dispone de datos de benchmarks ni de especificaciones verificadas de otros modelos comparables de decision tipada o de clasificacion financiera en la informacion proporcionada, por lo que la comparativa se limita al modelo original y a su base.

## Limitaciones y advertencias

- No supera el criterio de acuerdo de respuestas fijado por el propio autor: el 95,5% de las respuestas coinciden con el bf16, por debajo del 97% exigido como puerta de salida; solo en decisiones con confianza >= 0,9 la coincidencia es del 100%.
- El 94% de las respuestas que cambian respecto al bf16 corresponden a elementos en los que el propio modelo bf16 mostraba confianza inferior a 0,7, es decir, casos de incertidumbre previa.
- Riesgo de alucinacion: aunque la salida sea una decision tipada, la probabilidad calibrada puede ser erronea; el 2,0% de error en el tramo de confianza >= 0,90 implica que un umbral alto reduce pero no elimina los fallos.
- Dependencia estricta de vLLM >= 0.30.0; versiones anteriores producen respuestas incorrectas con batching de peticiones largas.
- La licencia MIT cubre unicamente las contribuciones del autor; el modelo base Qwen3.5-4B se distribuye bajo Apache-2.0 y sus atribuciones constan en el fichero NOTICE, por lo que hay que respetar ambas.
- El modelo no constituye asesoramiento legal, fiscal ni de inversion, segun advierte el propio autor.
- Idiomas soportados y longitud de contexto no declarados: no es posible planificar despliegues multilingues ni calcular el coste de cache KV a partir de la informacion disponible.
- Adopcion nula en el momento de la consulta (0 descargas, 0 me gusta), por lo que no existe validacion independiente de los resultados publicados.
- La calibracion se realizo con solo 256 elementos de entrenamiento; el comportamiento fuera del dominio financiero y de reglas evaluado es, por tanto, incierto.
- El pipeline declarado es `text-classification` con `inference: false`, de modo que la integracion automatica del Hub no esta garantizada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/caiovicentino1/Eikos-4B-INT4
- Modelo base (bf16): https://huggingface.co/caiovicentino1/Eikos-4B
- Imagen de presentacion referenciada en la model card: https://huggingface.co/caiovicentino1/Eikos-4B/resolve/main/assets/eikos_launch.png
- La busqueda web realizada no ha devuelto ningun enlace relevante sobre este modelo; los resultados obtenidos eran ajenos al mismo.
