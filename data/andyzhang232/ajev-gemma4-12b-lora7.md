# andyzhang232/ajev-gemma4-12b-lora7

## Resumen

AJev lora7 es un adaptador LoRA de tipo PEFT desarrollado por el usuario andyzhang232 sobre el modelo base google/gemma-4-12B-it. No es un modelo generativo de texto al uso: se trata de un modelo de decisión que recibe un contexto (texto o JSON) junto con preguntas tipadas (sí/no, elección única de hasta 255 opciones, o puntuación ordenada) y devuelve una probabilidad calibrada para cada opción. Cada pregunta se resuelve en una única pasada hacia delante, sin generar texto, lo que lo aleja de los asistentes conversacionales convencionales.

El modelo pertenece al ecosistema Jev, un formato de decisión con probabilidades calibradas por tipo de pregunta mediante temperaturas almacenadas en ajev_lm_config.json. Con un tamaño de repositorio de 0,5 GB, el adaptador se apoya en la arquitectura y los pesos del base de 12B parámetros, con lo que requiere aproximadamente 24 GB de memoria de GPU para inferencia.

Su relevancia actual radica en su orientación a tareas de clasificación y calibración de decisiones dentro de pipelines deterministas, un nicho poco cubierto por los LLM generativos. El autor reporta una puntuación de 55,06 en el Jev Decision Index 0.2.1, por encima de la versión anterior lora5 (52,22) y de Winnow-12B (50,02), aunque por debajo del hermano mayor de 26B-A4B (57,42).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer denso google/gemma-4-12B-it |
| Parametros totales | 12B en el modelo base; adaptador LoRA de 0,5 GB (r 32 / alfa 64) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; se desaconseja guardar un modelo fusionado y recargarlo) |
| Idiomas soportados | ingles (en), chino (zh) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador LoRA PEFT) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre el transformer denso google/gemma-4-12B-it mediante la libreria PEFT. La configuracion de entrenamiento utilizada fue LoRA con rango 32 y alfa 64, tasa de aprendizaje 1,5e-5 y una sola epoca, ejecutada sobre una unica GPU RTX PRO 6000. El adaptador arranca desde el de la version previa (lora5), es decir, se trata de un entrenamiento incremental sobre una version ya ajustada.

El conjunto de datos de entrenamiento comprende aproximadamente 36.000 preguntas, de las cuales el 43 por ciento se reutilizan de la formacion anterior para mitigar el olvido catastrofico. Los datos nuevos incorporan los splits de entrenamiento de varios benchmarks relacionados con el leaderboard (HoVer, VAST, POP909, ContractNLI, ACOS, BANKING77 y CLINC150), ademas de preguntas de razonamiento generadas de forma procedimental y reescritas al formato de cada benchmark. Se aplicó un proceso de descontaminacion: cada pregunta de entrenamiento se contrastó contra la suite completa del leaderboard y se eliminaron aquellas con solapamiento textual.

Una innovacion funcional destacable es el esquema de calibracion por tipo de pregunta: las temperaturas de calibracion por tipo se almacenan en ajev_lm_config.json y permiten obtener probabilidades calibradas para respuestas de tipo sí/no, eleccion unica y puntuacion ordenada sin generar texto, con una unica pasada por pregunta.

## Capacidades

- Clasificacion de decision con probabilidades calibradas: responde preguntas tipadas de tipo sí/no (noul), eleccion unica de hasta 255 opciones y puntuacion ordenada.
- Salida de probabilidad por opcion en lugar de texto generado, lo que facilita su integracion en reglas de negocio y umbrales deterministas.
- Trabajo con contexto en texto plano o JSON estructurado.
- Inferencia de una sola pasada hacia delante por pregunta, sin decodificacion autorregresiva.
- Soporte multilingue limitado al ingles y al chino.
- Servidor compatible con Jev mediante endpoint POST /v1/systemone (a traves de ajev-infer con vLLM).
- Perfil de rendimiento por areas segun el Decision Index: Knowledge 38,6; Language 63,4; Retrieval 63,0; Tools 67,5; Arts 37,3.
- Mejoras notables respecto a la version anterior en VAST (postura), HoVer (verificacion de hechos), iSarcasm (sarcasmo), PhishNChips (correos de phishing) y ContractNLI.
- No se menciona soporte de generacion de texto, tool calling generativo ni capacidades de vision o audio en la informacion disponible.

## Casos de uso

- Triaje de tickets de soporte: el modelo clasifica el tema de una incidencia (facturacion, envio, cuenta) y decide si requiere escalado a un agente humano, devolviendo probabilidades calibradas que permiten fijar umbrales de automatizacion.
- Deteccion de phishing en correos: dado el texto de un mensaje, devuelve una decision binaria calibrada; el autor reporta mejoras especificas en el benchmark PhishNChips.
- Verificacion de hechos (fact checking): con contexto documental y una afirmacion, responde sí/no con probabilidad calibrada; el modelo mejora en HoVer respecto a la version previa.
- Analisis de postura y sarcasmo: clasificacion de opiniones o deteccion de ironia en textos, util para monitorizacion de redes o analisis de sentimiento matizado (mejoras reportadas en VAST e iSarcasm).
- Revision de contratos: clasificacion de clausulas y condiciones con respuestas tipadas, apoyandose en las mejoras reportadas en ContractNLI.
- Enrutado de intenciones en asistentes: clasificacion de la intencion del usuario en conjuntos cerrados de categorias (BANKING77, CLINC150) con probabilidades por clase, apto para enrutadores deterministas.
- Puntuacion y priorizacion con escala ordenada: asignacion de niveles de riesgo o prioridad mediante preguntas de tipo score, aprovechando la calibracion por tipo.
- Automatizacion de decisiones en pipelines JSON: integracion en flujos que reciben contexto estructurado y devuelven una distribucion de probabilidad sobre opciones predefinidas.

## Benchmarks y rendimiento

Resultados autoinformados por el autor sobre la suite completa Jev Decision Index 0.2.1 (las 150.317 peticiones puntuables, HLE incluido). No han sido reproducidos por los mantenedores:

| Modelo | Base | Decision Index |
|---|---|---:|
| AJev 26B-A4B | Gemma 4 26B-A4B | 57,42 |
| AJev lora7 (este modelo) | Gemma 4 12B | 55,06 |
| AJev lora5 (version previa) | Gemma 4 12B | 52,22 |
| Winnow-12B | Gemma 4 12B | 50,02 |

Desglose por area de AJev lora7: Knowledge 38,6; Language 63,4; Retrieval 63,0; Tools 67,5; Arts 37,3.

Exactitud sobre conjuntos de test reservados:

| Conjunto de test | AJev lora5 | AJev lora7 |
|---|---:|---:|
| typed-decisions | 0,790 | 0,779 |
| JevBench public | 0,853 | 0,844 |
| Kev transfer v9 | 0,771 | 0,769 |
| eikos heldout | 0,931 | 0,927 |

Segun el autor, ninguna de las diferencias entre lora7 y lora5 en estos conjuntos de test es significativa.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 24 GB; el autor indica que cabe en una unica tarjeta de 24 a 48 GB.
- GPU utilizada en entrenamiento: una RTX PRO 6000.
- Compatibilidad con GPU de consumo: cabe en tarjetas de 24 GB, como la RTX 4090 o la RTX 3090 (24 GB), siempre que se disponga de esos 24 GB efectivos.
- Alternativa recomendada por el autor: si se dispone de unos 55 GB de memoria, sugiere la version de 26B-A4B (andyzhang232/ajev-gemma4-26b-a4b-lora1), con Decision Index 57,42.
- Opciones de despliegue: PEFT/transformers (requiere transformers >= 5.17) y vLLM a traves de ajev-infer (python -m ajev.serve_vllm --adapter andyzhang232/ajev-gemma4-12b-lora7 --port 8000).
- Recomendacion de carga: cargar como adaptador LoRA o fusionarlo unicamente en memoria; no guardar un modelo fusionado y recargarlo.
- Latencia y throughput estimados: no disponibles. La inferencia consume una unica pasada por pregunta, sin generacion de texto.

## Comparativa con modelos similares

| Modelo | Parametros (base) | Decision Index | Licencia | Disponibilidad |
|---|---|---|---|---|
| AJev lora7 (este modelo) | 12B | 55,06 | apache-2.0 | Adaptador LoRA en HuggingFace |
| AJev 26B-A4B | 26B (MoE, A4B) | 57,42 | no disponible en la informacion | HuggingFace (andyzhang232/ajev-gemma4-26b-a4b-lora1) |
| AJev lora5 | 12B | 52,22 | no disponible en la informacion | Version previa del mismo autor |
| Winnow-12B | 12B | 50,02 | no disponible en la informacion | no disponible en la informacion |

No se dispone de datos de contexto ni de otros benchmarks (MMLU, HumanEval, GSM8K) para estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Los benchmarks de uso de herramientas (API-Bank, When2Call) son ligeramente inferiores a los de la version anterior lora5.
- El razonamiento sobre conocimiento (GPQA, ChessBench) y algunos benchmarks de Artes (POP909, cfcolor) siguen siendo debiles, limitados principalmente por el modelo base de 12B.
- Las probabilidades se calibraron sobre datos reservados propios del autor; si la distribucion de datos de produccion difiere mucho, es necesario recalibrar.
- Parte de los datos de entrenamiento incluye terminos de uso no comercial o de atribucion; el propio autor recomienda revisarlos antes de un uso comercial, pese a que la licencia del repositorio es apache-2.0.
- Los resultados del Decision Index son autoinformados y no han sido reproducidos de forma independiente por los mantenedores.
- El modelo no esta afiliado a TypeSafe AI.
- Soporte de idiomas limitado a ingles y chino.
- Longitud de contexto no disponible en la informacion proporcionada.
- No hay usuarios ni descargas registradas en el momento de la consulta (0 descargas, 0 likes), lo que limita la evidencia de uso en produccion.

## Enlaces

- HuggingFace (este modelo): https://huggingface.co/andyzhang232/ajev-gemma4-12b-lora7
- Modelo hermano de 26B-A4B: https://huggingface.co/andyzhang232/ajev-gemma4-26b-a4b-lora1
- Codigo de inferencia: https://github.com/cmzy/ajev-infer
- Suite Jev Decision Index 0.2.1: https://huggingface.co/spaces/multimodalart/jev-decision-index
- Modelo base: google/gemma-4-12B-it
