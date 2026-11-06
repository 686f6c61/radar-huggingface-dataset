# Ainvest-World/Ainvest-Decision-27b-v1.0

## Resumen

Ainvest-Decision-27b-v1.0 es un modelo de decisión tipado desarrollado por Ainvest-World, derivado de Qwen3.8-27B (familia Qwen3.5). A diferencia de un modelo generativo convencional, no produce texto de respuesta: puntúa todas las opciones suministradas mediante una cabecera de lectura personalizada de 255 vías (255-way readout), devolviendo probabilidades por opción o una probabilidad de verdad (P(true)). Resuelve así el problema de la selección estructurada entre alternativas con salidas reproducibles y sin alucinaciones de generación libre.

El modelo se publica en BF16 con safetensors, pesa unos 52,2 GB en disco y almacena 26.086.635.760 parámetros (incluyendo los componentes heredados del backbone). Es una fusión de pesos (model merge), concretamente la variante evaluada M02, con licencia Apache 2.0 y soporte únicamente de texto en inglés; no se reivindican capacidades de visión ni vídeo.

Su relevancia radica en el nicho de los "decision models": arquitecturas optimizadas para clasificación de opciones, verificación de afirmaciones y evaluación de candidatos, tareas donde un LLM generativo estándar introduce variabilidad innecesaria. Ha sido evaluado en el suite "Decision Index public 0.3", con un índice público de 71,88 aceptado por el comité de la versión 0.4.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3_8ForDecision (custom), backbone familia Qwen3.5, readout de 255 vías, last-token pooling, capas de atencion no causal completa + capas recurrentes |
| Parametros totales | 26.086.635.760 |
| Parametros activos | no disponible (no consta arquitectura MoE) |
| Longitud de contexto | 16.384 tokens por pregunta (entrada renderizada completa) |
| Tipos de cuantizacion | bfloat16 (sin cuantizacion aplicada para la publicacion) |
| Idiomas soportados | en (solo entrenado/evaluado en texto en ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16, ~52,2 GB) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.8-27B como backbone y lo adapta a una tarea de decision mediante una cabecera de lectura personalizada de 255 vias en lugar del head de generacion causal. Las capas de atencion son no causales (full attention) con last-token pooling, mientras que las capas recurrentes heredadas conservan su semantica evaluada, lo que sugiere una arquitectura hibrida atencion-recurrencia. El pipeline de inferencia usa una plantilla de chat original con thinking desactivado, left padding y sin KV cache, dado que no hay decodificacion autorregresiva.

El entrenamiento se limito exclusivamente a capacidades de decision textual; no hubo entrenamiento ni evaluacion de imagen o video. La publicacion consiste en una fusion de pesos (M02). El runtime reproduce un cast explicito a BF16 tanto para los parametros como para los buffers flotantes generados. No se ha publicado informacion sobre el numero de tokens de entrenamiento, composicion del dataset ni uso de RLHF/DPO.

## Capacidades

- Puntuacion tipada de opciones: tarea `choice` con entre 2 y 255 opciones, devolviendo la clave de la opcion seleccionada y la probabilidad de cada una.
- Estimacion de probabilidad de verdad: tarea `noul`, que devuelve P(true) para una afirmacion.
- Evaluacion independiente de multiples preguntas por peticion, con todas las opciones suministradas retenidas (sin truncamiento).
- Decisiones de soporte explicitas: si una pregunta excede el limite de 16.384 tokens renderizados, la peticion completa se marca como no soportada (excepcion `Unsupported`), sin truncar silenciosamente.
- Procesamiento por lotes offline mediante `predict_many`, preservando las decisiones de soporte a nivel de peticion.
- No soporta generacion de texto libre: un pipeline causal-LM estandar no implementa su protocolo de lectura; requiere el paquete Python incluido.
- Sin capacidades de vision, audio ni video.

## Casos de uso

- Clasificacion de opciones con probabilidades calibradas: en flujos de enrutado de consultas o seleccion de respuestas candidatas, el modelo devuelve la distribucion completa de probabilidades sobre 2-255 opciones, util para sistemas que necesitan umbral de confianza.
- Verificacion de afirmaciones (fact-checking ligero): mediante la tarea `noul` se obtiene P(true) de una afirmacion, aprovechable en moderacion de contenido o validacion de datos estructurados.
- Evaluacion de candidatos en pipelines RAG: puntuar documentos o respuestas recuperadas como opciones, seleccionando la mas relevante sin generacion libre.
- Seleccion de herramientas en sistemas de agentes: dado un catalogo de hasta 255 herramientas, el modelo puede elegir la mas adecuada para un estado dado, con probabilidades por herramienta.
- Etiquetado masivo de datasets: el CLI `ainvest-decision` con entrada JSONL y procesamiento por lotes permite clasificar grandes volumenes de ejemplos en una sola GPU H200.
- A/B testing y evaluacion de salidas de LLM: usar el modelo como juez tipado que puntua multiples respuestas candidatas de forma determinista, evitando la variabilidad de un LLM juez generativo.
- Integracion en benchmarks Decision Index: el adaptador oficial permite ejecutar el kit de evaluacion sobre filas reconstruidas localmente.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Public Decision Index (suite public 0.3) | 71,88 |
| Public Raw Index | 78,57 |
| Peticiones del run publico | 140.178 (312.320 resultados de pregunta) |
| Peticiones respondidas | 140.176 (2 no soportadas, 33 resultados) |
| Tiempo mediano por peticion (muestra fija de 100, 1x H200) | 141,67 ms |
| Tiempo medio por peticion (muestra fija de 100, 1x H200) | 994,69 ms |

No hay comparacion directa publicada con otros modelos en la informacion disponible. El Full score de la version 0.4 lo calculan los mantenedores sobre tests privados y no se ha publicado. Los tiempos son de forward por lotes amortizado, excluyendo renderizado, tokenizacion y carga, y no deben interpretarse como latencia oficial de leaderboard por peticion individual.

## Requisitos de hardware

- VRAM: el checkpoint BF16 ocupa unos 52,2 GB; se recomienda una GPU con al menos 80 GB de VRAM (H200 o A100/H100 80 GB) para cargar el modelo completo mas activaciones.
- GPU de referencia: NVIDIA H200, entorno validado (PyTorch 2.14.0+cu126). No consta validacion en otras GPUs.
- Consumer GPUs: no cabe en GPUs de consumo tipicas (RTX 4090 con 24 GB) en BF16; no hay cuantizaciones publicadas que reduzcan los requisitos.
- Despliegue: exclusivamente mediante el paquete Python incluido (`AinvestDecisionEngine`) o el CLI `ainvest-decision`; no es compatible con vLLM, llama.cpp, Ollama ni TGI, ya que el protocolo de lectura de 255 vias no esta implementado en pipelines causal-LM estandar.
- Entorno validado: Python 3.12, PyTorch 2.14.0+cu126, Transformers 5.17.0, Linux; requiere las dependencias de kernels hibridos de atencion de `requirements.lock.txt` (incluido `causal-conv1d`, que puede necesitar compilacion contra el toolkit CUDA).
- Latencia: mediana de 141,67 ms y media de 994,69 ms por peticion en la muestra fija de 100 con batching en una H200 (forward amortizado, sin renderizado ni carga).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Formato |
|---|---|---|---|---|---|
| Ainvest-Decision-27b-v1.0 | 26,09 B | 16.384 tokens/pregunta | Decision tipada (choice/noul) | Apache 2.0 | safetensors BF16 |
| Qwen/Qwen3.8-27B (base) | ~27 B | no disponible | LLM generativo causal | no disponible | no disponible |
| Alternativas de decision tipada comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se conocen modelos comparables de la misma categoria (decision model con readout de 255 vias) con datos publicados suficientes para una comparacion de rendimiento.

## Limitaciones y advertencias

- Solo texto y solo ingles: no se reivindican capacidades de vision, audio o video, ni rendimiento multilingue; su uso en otros idiomas no esta evaluado.
- No es un modelo generativo: no produce texto libre ni admite pipelines de generacion estandar; requiere el paquete especifico y su protocolo de lectura.
- Limite estricto de 16.384 tokens renderizados por pregunta: si se excede, toda la peticion se rechaza (`Unsupported`), sin truncamiento parcial.
- Riesgo de alucinacion: no aplica en el sentido generativo, pero las probabilidades de decision pueden ser erroneas o mal calibradas fuera de la distribucion del suite de evaluacion.
- Los tiempos publicados no son latencia oficial por peticion individual; los mantenedores del leaderboard realizan su propia medicion.
- La evaluacion publicada no es una re-evaluacion completa: es el run publico original, con validacion de publicacion sobre una muestra fija de 100 peticiones (cero flips de choice).
- Sesgos conocidos: no disponible (no se documentan).
- Licencia Apache 2.0: sin restricciones relevantes para uso comercial, aunque los datos de benchmark deben reconstruirse segun los terminos upstream; no se distribuyen textos ni respuestas gold del benchmark.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Ainvest-World/Ainvest-Decision-27b-v1.0
- Resultados del Decision Index (run m02): https://huggingface.co/datasets/Ainvest-World/Ainvest-Decision-27b-v1.0-decision-index-results/tree/main/runs/m02
- Kit oficial Decision Index: https://github.com/apolinario/decision-index
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Paper, blog o demo: no disponible
