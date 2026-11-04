# scar-ai/vera-large

## Resumen

vera-large es un modelo de decisión no autorregresivo desarrollado por scar-ai, diseñado para responder preguntas tipadas sobre un estado de entrada (texto, correo, ticket o JSON) devolviendo respuestas tipadas con probabilidades calibradas. No genera texto libre: cada pregunta se resuelve en un único forward pass, lo que elimina el parseo de salidas y reduce el riesgo de alucinación a la hora de clasificar o decidir. Se presenta como el miembro más grande y preciso de la familia vera, construido sobre el backbone de Qwen3.8-27B.

El modelo conserva el backbone textual de Qwen3.8-27B (~26B parámetros, 25.628.527.110 parámetros reales según safetensors) y lo adapta mediante LoRA y ajuste completo de determinadas capas para una tarea de clasificación y puntuación de opciones. Soporta tres tipos de pregunta: `choice` (entre 2 y 255 opciones), `score` (escala ordinal de 2 a 10 niveles con distribución completa) y `noul` (probabilidad sí/no). Las probabilidades se calibran por temperatura según el tipo de pregunta.

Su relevancia actual radica en que ofrece una alternativa determinista y calibrada a los flujos de decisión basados en generación de texto, con un formato de comunicación compatible con Jev (`POST /v1/systemone`). En el board público Jev Decision Index 0.4.1 obtiene 65,26 en Full y 67,75 en Public, con un error de calibración (ECE) de 0,051, y se sitúa en el puesto =6 de 241 entradas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer derivado de Qwen3.8-27B con capas de atención completa y capas Gated DeltaNet; lectura no autorregresiva de opciones |
| Parametros totales | 25.628.527.110 (~25,6B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el autor indica que cada petición se lee completa: estado, pregunta y descripciones de opciones no se recortan) |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (checkpoint completo, sin LoRA separado; ~51 GB en bf16) |

## Arquitectura y entrenamiento

vera-large parte de Qwen3.8-27B y mantiene su backbone textual de aproximadamente 26B parámetros. La innovación principal es el mecanismo de lectura de opciones: cada pregunta se procesa en un único forward pass en el que el prompt enumera todas las opciones bajo un código de respuesta corto. Las capas de atención completa ven el prompt entero, mientras que las capas Gated DeltaNet permanecen causales. Cada opción se puntúa en el último token del prompt a través de su código de respuesta y de un readout de puntero de opción que mira hacia atrás a la línea propia de esa opción.

El entrenamiento actualiza por completo las proyecciones de atención completa, las puertas DeltaNet y todas las normalizaciones, mientras que el resto del backbone se ajusta mediante LoRA. Los updates de LoRA se fusionan en los pesos publicados, de modo que el checkpoint resultante es un modelo completo plano, sin adaptadores separados. Las probabilidades de salida se calibran por temperatura de forma específica para cada tipo de pregunta. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO.

## Capacidades

- Clasificación de texto con respuestas tipadas y probabilidades calibradas.
- Preguntas de tipo `choice` con entre 2 y 255 opciones.
- Preguntas de tipo `score` con entre 2 y 10 niveles ordenados, devolviendo puntuación esperada y distribución completa.
- Preguntas de tipo `noul` (sí/no) con probabilidad asociada.
- Procesamiento conjunto de todas las preguntas de una llamada en un solo forward pass.
- Entrada de estado en texto plano o cualquier objeto serializable en JSON.
- Lectura completa de estados largos, incluyendo documentos de políticas extensos, sin recorte.
- Selección de herramientas o funciones para agentes (incluida la opción de no llamar ninguna).
- Verificación de hechos y afirmaciones contra un documento.
- Evaluación y ranking de respuestas candidatas.
- No genera texto libre, por lo que no requiere parseo de salida ni presenta alucinación generativa.
- No se documentan capacidades multimodales (visión, audio), tool calling en sentido generativo ni modo de razonamiento extendido.

## Casos de uso

- Enrutamiento y triaje de tickets: enviar un ticket, correo o solicitud al equipo, cola o prioridad correctos usando preguntas `choice` sobre departamento y `score` sobre urgencia, con la confianza calibrada para decidir si se escala.
- Clasificación de intención y tema: mapear mensajes a un conjunto propio de intenciones con confianza calibrada para derivar a un humano cuando la probabilidad no supera el umbral.
- Selección de herramientas en agentes: elegir qué herramienta o API debe invocar un agente a continuación, o determinar que no debe invocar ninguna, mediante preguntas `choice` sobre el catálogo de herramientas.
- Comprobación de políticas y cumplimiento: decidir si un caso cumple o incumple una regla, incluyendo documentos de política largos, ya que el modelo lee la petición completa sin recortar el estado.
- Puntuación y severidad: valorar urgencia, sentimiento o riesgo en una escala ordinal con distribución de probabilidad completa gracias al tipo `score`.
- Verificación de hechos y afirmaciones: comprobar si una afirmación se sostiene contra un documento de referencia con una pregunta `noul` o `choice`.
- Evaluación y ranking de respuestas: comparar respuestas candidatas de otros modelos y seleccionar la mejor con probabilidad calibrada.
- Flujos con compuerta de confianza: actuar de forma automática cuando la probabilidad es alta y derivar a un modelo más lento o a un humano cuando no lo es, aprovechando el ECE de 0,051.

## Benchmarks y rendimiento

Resultados del board público Jev Decision Index 0.4.1 (mayor es mejor; ECE menor es mejor):

| Modelo | Parámetros | Full | Public | knowledge | language | retrieval | tools | arts | ECE |
|---|---|---|---|---|---|---|---|---|---|
| vera-large (este repo) | 25,6B | 65,26 | 67,75 | 51,2 | 75,7 | 69,5 | 83,0 | 58,5 | 0,051 |
| vLLM-SR d3 | 26,1B | 67,15 | 65,45 | 55,3 | 68,0 | 66,9 | 82,6 | 51,0 | 0,043 |
| Jev 1.14 (referencia) | – | 60,24 | 60,70 | 57,1 | 61,2 | 63,5 | 73,8 | 39,2 | 0,080 |
| vera-core-2 | 1,9B | 30,60 | 41,28 | 21,4 | 43,9 | 53,8 | 61,5 | 23,9 | 0,046 |

Todas las puntuaciones están corregidas por azar (0 es adivinación aleatoria, 100 es perfecto). Full combina un 60% de tests privados de las mismas habilidades y un 40% de tareas privadas de dominios nuevos. Public es el índice sobre la suite pública. vera-large ocupa el puesto =6 de 241 entradas; Jev 1.14 ocupa el =11. La latencia mediana por petición es de 160 ms en la RTX PRO 6000 única del board.

## Requisitos de hardware

- VRAM estimada: los pesos en bf16 ocupan ~51 GB, por lo que se requiere una GPU de 80 GB o superior.
- GPU recomendadas: H100 80GB, RTX PRO 6000 96GB, MI300X; el autor indica planificar una tarjeta de clase 80 GB o mayor.
- No cabe en GPU de consumo convencional (RTX 4090 de 24 GB, RTX 3090 de 24 GB) en bf16 según los requisitos indicados por el autor.
- Opciones de despliegue: paquete `vera-s1` (versión 0.1.6 o superior) con extra `[fast]`, que añade flash-linear-attention para las capas DeltaNet; servidor HTTP compatible con Jev mediante `vera-serve` en el puerto configurado (por ejemplo, 8200) exponiendo `POST /v1/systemone`.
- Requisitos de software: Python 3.10 o superior; los pesos (~51 GB) se descargan una vez en el primer uso y se cachean.
- Latencia: mediana de 160 ms por petición en la RTX PRO 6000 del board. No se dispone de datos de throughput.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Full (JDI 0.4.1) | ECE | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| vera-large | 25,6B | no disponible | 65,26 | 0,051 | apache-2.0 | HuggingFace (scar-ai/vera-large) |
| vLLM-SR d3 | 26,1B | no disponible | 67,15 | 0,043 | no disponible | no disponible |
| Jev 1.14 | no disponible | no disponible | 60,24 | 0,080 | no disponible | no disponible |
| vera-core-2 | 1,9B | no disponible | 30,60 | 0,046 | no disponible | HuggingFace (scar-ai/vera-core-2) |

Frente a vLLM-SR d3, vera-large es ligeramente inferior en Full (65,26 frente a 67,15) y en ECE (0,051 frente a 0,043), pero superior en Public (67,75 frente a 65,45) y en las áreas de language, retrieval y arts. Frente a Jev 1.14, vera-large supera el Full en más de cinco puntos y mejora la calibración. Frente a vera-core-2, el salto de escala (1,9B a 25,6B) se traduce en más del doble de puntuación Full, aunque vera-core-2 mantiene un ECE ligeramente mejor.

## Limitaciones y advertencias

- Modelo exclusivamente en inglés: no se documenta soporte multilingüe, por lo que su uso en castellano u otros idiomas no está garantizado.
- No es un modelo generativo: no produce texto libre, por lo que no sirve para tareas de generación, resumen o diálogo abierto.
- Solo admite tres tipos de pregunta (`choice`, `score`, `noul`); no cubre formatos de salida arbitrarios.
- El límite de opciones es de 255 para `choice` y de 10 niveles para `score`.
- No se documentan sesgos conocidos ni evaluaciones de sesgo en la información disponible.
- El riesgo de alucinación generativa se elimina por diseño, pero la calibración y la precisión dependen del tipo de pregunta y del dominio; el ECE de 0,051 indica un error de calibración no nulo.
- Requiere una GPU de clase 80 GB o superior, lo que limita su despliegue en entornos con hardware de consumo.
- Licencia apache-2.0, que permite uso comercial, pero se debe verificar el cumplimiento de la licencia del modelo base Qwen3.8-27B (Apache-2.0 según la model card).
- El formato de comunicación está acoplado a la API de Jev (`POST /v1/systemone`); los clientes deben adaptar la URL base o usar el paquete `vera-s1`.
- No se especifican la longitud de contexto máxima ni los detalles del dataset de entrenamiento, lo que dificulta evaluar su comportamiento en estados extremadamente largos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/scar-ai/vera-large
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- vera-core-2: https://huggingface.co/scar-ai/vera-core-2
- Board público Jev Decision Index: https://huggingface.co/spaces/multimodalart/jev-decision-index
