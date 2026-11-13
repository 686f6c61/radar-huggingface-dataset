# CobuildX-AI/cbx-bfs-banking-intent-classifier-17M

## Resumen

cbx-bfs-banking-intent-classifier-17M es un clasificador de texto encoder-only especializado en la deteccion de intenciones en mensajes de clientes de banca. Lo desarrolla CobuildX-AI y se obtiene por fine-tuning del modelo base jhu-clsp/ettin-encoder-17m, un encoder de arquitectura ModernBERT con 16,9 millones de parametros. Su tarea es mapear un mensaje de un cliente a una de las 77 intenciones del conjunto BANKING77 (por ejemplo `card_arrival`, `pending_transfer`, `exchange_rate` o `lost_or_stolen_card`), en ingles.

El modelo resuelve un problema muy concreto de enrutamiento en atencion al cliente: dado un texto corto, devolver la intencion, una descripcion de una linea, una confianza y las tres mejores candidatas. Con 92,3% de accuracy y 0,923 de macro F1 sobre el test de BANKING77, y unos 3 ms por mensaje en CPU, esta pensado para desplegarse localmente a bajo coste y con latencia muy baja, sin depender de APIs externas.

Es relevante ahora porque demuestra que un encoder de 17M puede superar en esta tarea a clasificadores basados en modelos generativos de gran tamano y a APIs de decision comerciales, con una licencia Apache-2.0 que permite uso comercial. La version actual es v0.1 y existe una variante de 68M del mismo autor con mayor precision (93,7%) a costa de mas latencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder transformer (ModernBERT, base jhu-clsp/ettin-encoder-17m) |
| Parametros totales | 16.883.021 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 128 tokens de entrada (suficiente para todos los mensajes de BANKING77) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo es un encoder transformer de tipo ModernBERT, heredado del checkpoint jhu-clsp/ettin-encoder-17m, con 16,9 millones de parametros. Se trata de un fine-tuning para clasificacion de secuencias sobre el dataset PolyAI/banking77, cuyas 77 etiquetas se mantienen sin cambios y con los mismos identificadores que en el dataset original de Hugging Face. La entrada se limita a 128 tokens, cota que cubre todos los mensajes de BANKING77.

El entrenamiento utiliza label smoothing de 0,1, lo que explica que la confianza maxima rara vez supere aproximadamente 0,9; el autor advierte que cualquier umbral de revision o derivacion a un humano debe calibrarse sobre las puntuaciones propias de este modelo. No se detallan en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO (no aplicables de forma habitual en un clasificador encoder-only). Tampoco se documentan innovaciones tecnicas adicionales como decodificacion especulativa o atencion lineal.

## Capacidades

- Clasificacion de intenciones bancarias en una de las 77 etiquetas de BANKING77, con identificadores identicos a los del dataset original.
- Salida enriquecida: intencion predicha, descripcion de una linea (definida en `intent_config.json`), confianza y top 3 de intenciones.
- Procesamiento de mensajes cortos de cliente en ingles, con un maximo de 128 tokens por entrada.
- Inferencia local de muy baja latencia (unos 3 ms por mensaje en CPU con 8 hilos).
- Integracion sencilla mediante `transformers` (pipeline `text-classification`) o mediante el wrapper propio `cbx_intent.IntentClassifier`.
- Compatibilidad con Text Embeddings Inference y endpoints compatibles, segun los tags del repositorio.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, vision, audio ni modo thinking: es un clasificador discriminativo, no un modelo generativo.
- Capacidad multilingue limitada al ingles.

## Casos de uso

- Enrutamiento automatico de tickets en atencion al cliente: clasificar cada mensaje entrante en una de las 77 intenciones y dirigirlo al equipo o flujo adecuado (tarjetas, transferencias, verificacion de identidad, etc.) con 3 ms de latencia por mensaje en CPU.
- Triaje previo a un LLM generativo: usar el clasificador como primera etapa de bajo coste para decidir la intencion y reservar el modelo generativo (mas caro y lento) solo para la respuesta final.
- Deteccion de casos sensibles para escalado humano: las intenciones como `lost_or_stolen_card`, `compromised_card` o `unable_to_verify_identity` permiten activar protocolos de seguridad o derivacion inmediata a un agente.
- Analitica de motivos de contacto: procesar en lote el historico de conversaciones para agregar volumen por intencion, detectar picos (`card_arrival`, `pending_transfer`) y priorizar mejoras de producto o documentacion.
- Clasificacion en tiempo real en entornos con recursos limitados: al ocupar unos 0,1 GB de repositorio y ejecutarse en CPU, puede desplegarse en contenedores pequenos, edge o entornos sin GPU.
- Filtrado y preetiquetado para anotacion: generar etiquetas candidatas con su confianza para acelerar el etiquetado humano de nuevos mensajes, revisando solo los casos de baja confianza.
- Moderacion de flujos conversacionales: identificar automaticamente intenciones de cancelacion (`terminate_account`) o disputas (`transaction_charged_twice`, `request_refund`) para activar flujos de retencion o reclamacion.

## Benchmarks y rendimiento

Resultados sobre el test de BANKING77 (3.080 mensajes, 40 por intencion), con accuracy y macro F1 sobre las 77 intenciones, segun la model card del autor:

| Modelo | Accuracy | Macro F1 | Latencia por mensaje | Precio por 1.000 mensajes |
|---|---|---|---|---|
| cbx-bfs-banking-intent-classifier-68M | 93,7% | 0,937 | 12 ms (CPU, local) | ninguno (hardware propio) |
| cbx-bfs-banking-intent-classifier-17M (este modelo) | 92,3% | 0,923 | 3 ms (CPU, local) | ninguno (hardware propio) |
| Jev (API de modelo de decision) + 3 ejemplos recuperados | 91,9% | 0,919 | 296 ms (API) | aprox. 0,10 USD |
| TF-IDF + regresion logistica | 91,0% | 0,911 | menos de 1 ms (CPU, local) | ninguno |
| Claude Opus 5, zero-shot (publicado por OpenRouter) | 84,4% | 0,836 | 2.266 ms (API) | aprox. 2,40 USD |
| Jev (API de modelo de decision), zero-shot | 81,5% | 0,810 | 290 ms (API) | aprox. 0,09 USD |

Notas del autor: las ejecuciones de los modelos CBX, TF-IDF y Jev son propias (CobuildX, 2026-11-13); Jev se invoco a traves de la API System One de TypeSafe (`jev-latest` solicitado, `jev-1.14.0` respondio). El resultado de Claude Opus 5 procede de una publicacion de OpenRouter y no se reprodujo. La latencia no se mide de forma homogenea en todas las filas: los modelos CBX y TF-IDF se midieron con un mensaje en CPU de 8 hilos.

## Requisitos de hardware

- VRAM estimada para inferencia: no requiere GPU; el modelo ocupa unos 0,1 GB en disco y puede ejecutarse en CPU.
- GPU recomendadas: no aplica; cualquier GPU moderna puede alojarlo sobradamente, pero no es necesario.
- Cabe en cualquier GPU de consumo e incluso en entornos sin GPU (contenedores, edge, portatiles).
- Opciones de despliegue: `transformers` (pipeline `text-classification`), el wrapper `cbx_intent`, Text Embeddings Inference y endpoints compatibles. No se documentan opciones GGUF, llama.cpp, Ollama ni vLLM.
- Latencia y throughput: aproximadamente 3 ms por mensaje en CPU con 8 hilos, segun el autor; el throughput exacto no se especifica.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Accuracy BANKING77 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| cbx-bfs-banking-intent-classifier-17M | 16,9M | 128 tokens | 92,3% | Apache-2.0 | Hugging Face, local |
| cbx-bfs-banking-intent-classifier-68M | no disponible (variante 68M) | no disponible | 93,7% | Apache-2.0 | Hugging Face, local |
| TF-IDF + regresion logistica | no aplica (baseline clasico) | no aplica | 91,0% | no disponible | local |
| Jev (API de decision) + 3 ejemplos | no disponible | no disponible | 91,9% | no disponible | API comercial |
| Claude Opus 5 zero-shot | no disponible | no disponible | 84,4% | no disponible | API comercial |

La comparativa se limita a los datos publicados por el autor en la model card; no se dispone de informacion adicional sobre parametros, contexto o licencia de las alternativas comerciales.

## Limitaciones y advertencias

- Solo soporta ingles; los mensajes en otros idiomas no estan cubiertos.
- Dominio cerrado: unicamente reconoce las 77 intenciones de BANKING77; cualquier mensaje fuera de ese conjunto se forzara a una de esas etiquetas, con riesgo de clasificacion erronea.
- Entrada limitada a 128 tokens; mensajes mas largos deben truncarse.
- El label smoothing 0,1 hace que la confianza maxima rara vez supere aproximadamente 0,9; los umbrales de revision o derivacion deben calibrarse sobre las puntuaciones propias del modelo.
- Riesgo de alucinacion no aplica en sentido generativo, pero si existe riesgo de predicciones erroneas con alta confianza en mensajes ambiguos o fuera de dominio.
- No se documentan sesgos especificos del modelo; al entrenarse sobre BANKING77 hereda los sesgos y la distribucion de ese dataset.
- Licencia Apache-2.0: permite uso comercial, pero conviene revisar las condiciones del modelo base (jhu-clsp/ettin-encoder-17m) y del dataset PolyAI/banking77.
- Version v0.1: el autor recomienda fijar `revision="v0.1"` para garantizar reproducibilidad; puede haber cambios en versiones futuras.
- No es un modelo generativo: no produce respuestas, solo etiquetas; para respuestas al cliente se necesita un componente adicional.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/CobuildX-AI/cbx-bfs-banking-intent-classifier-17M
- Variante de 68M: https://huggingface.co/CobuildX-AI/cbx-bfs-banking-intent-classifier-68M
- Modelo base Ettin encoder 17M: https://huggingface.co/jhu-clsp/ettin-encoder-17m
- Dataset BANKING77: https://huggingface.co/datasets/PolyAI/banking77
- Paper de BANKING77 (arXiv:2003.04807): https://arxiv.org/abs/2003.04807
- Publicacion de OpenRouter sobre Jev vs Claude Opus 5 en clasificacion: https://openrouter.ai/blog/insights/jev-vs-claude-opus-5-classification/
