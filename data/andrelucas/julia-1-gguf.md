# andrelucas/Julia-1-GGUF

## Resumen

Julia-1 es un modelo de decisión multilingüe desarrollado por Supersonic Labs. No es un modelo generativo al uso: recibe un estado (`state`, en texto o JSON), una pregunta, un tipo de pregunta (`choice`, `score` o `noul`) y entre 2 y 20 opciones, y devuelve un logit por cada opción. Su función es, por tanto, seleccionar o puntuar alternativas dentro de un conjunto cerrado, no producir texto libre.

Arquitectónicamente es un codificador mmBERT-small de la familia ModernBERT (22 capas, dimensión oculta 384, vocabulario de 256 000 tokens, contexto de 8192 tokens) seguido de una cabeza de decisión tipada. El modelo completo suma 144,19 millones de parámetros, lo que lo sitúa en el rango de los modelos pequeños aptos para inferencia en CPU y en hardware de consumo.

Esta ficha cubre la conversión a GGUF publicada por `andrelucas`, que adapta el modelo original al formato de modelo de decisión de llama.cpp (arquitectura `modern-bert` con el módulo de decisión del PR #29818). Es relevante porque permite ejecutar Julia-1 en `llama-server` y en `julia1-cli` sin PyTorch, con latencias de decenas de milisegundos por petición, algo útil para enrutado y clasificación en producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT (mmBERT-small): 22 capas de codificador, hidden 384, más cabeza de decisión tipada de 2 capas |
| Parametros totales | 144.192.769 (144,19 M) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 8192 tokens |
| Tipos de cuantizacion | Solo F32 y F16 publicados; el autor indica que cuantizaciones por debajo de F16 alteran las decisiones (Q8_0 de ggml-org conserva 1947/2000) |
| Idiomas soportados | Multilingüe |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (F32 y F16); modelo base en safetensors |
| Vocabulario | 256 000 tokens |
| Tipo de modelo | Modelo de decisión (no generativo) |
| Tipos de pregunta | `choice`, `score`, `noul` (booleano) |
| Opciones por consulta | 2 a 20 |
| Runtimes compatibles | llama.cpp master (PR #29818, `llama-server` con `POST /v1/systemone`) y julia1-cli 0.2.0+ |
| Tamaño del repo | 3,5 GB |

## Arquitectura y entrenamiento

Julia-1 parte de un codificador mmBERT-small de la familia ModernBERT, con 22 capas, dimensión oculta de 384 y un vocabulario de 256 000 tokens que cubre contexto multilingüe hasta 8192 tokens. Sobre ese codificador se añade una cabeza de decisión tipada de dos capas transformer que transforma la representación del estado y la pregunta en un logit por opción. En la conversión GGUF, esas dos capas de la cabeza se exponen como `blk.22` y `blk.23`, de modo que la arquitectura declarada sigue siendo `modern-bert` con 24 bloques en total.

La información disponible no detalla la composición del dataset de entrenamiento, el número de tokens vistos ni si hubo fases de RLHF o DPO; esos datos no están publicados en la model card consultada. Sí se documenta el proceso de validación de la conversión: los ficheros F32 y F16 se compararon contra el modelo original en PyTorch sobre las 2000 preguntas del conjunto `typed-decisions`, obteniendo 2000/2000 decisiones idénticas y la misma exactitud (1451/2000) en julia1-cli, y 1999/2000 (F32) y 2000/2000 (F16) en `llama-server` sobre Metal. La innovación técnica destacable es el propio formato de decisión integrado en llama.cpp, que permite servir un modelo de enrutado mediante una API HTTP dedicada (`/v1/systemone`) en lugar de forzar una interfaz de chat.

## Capacidades

- Clasificación y enrutado de decisiones: dado un estado y una pregunta, selecciona o puntúa entre 2 y 20 opciones discretas.
- Tres modos de consulta: `choice` (elegir una opción), `score` (puntuar cada opción) y `noul` (respuesta booleana).
- Procesamiento de estados en texto plano o en JSON estructurado.
- Multilingüe, gracias al vocabulario de 256 000 tokens del codificador mmBERT-small.
- Contexto de 8192 tokens, suficiente para estados largos o historiales de conversación compactos.
- Extracción de características (`feature-extraction`) a partir de las representaciones del codificador.
- No soporta generación de texto libre, tool calling generativo ni razonamiento multi-paso en el sentido de los modelos de chat; su salida es siempre un conjunto de logits.

## Casos de uso

- Enrutado de peticiones en sistemas multiagente: el modelo recibe el estado de la conversación y una lista de agentes o herramientas disponibles, y devuelve el logit de cada opción para elegir el destino. Su latencia de 13,4 ms por petición HTTP en un Apple M1 Pro lo hace viable como primer salto de un pipeline.
- Clasificación de intenciones en atención al cliente: con el historial reciente como `state` y las categorías de ticket como opciones, el modo `choice` asigna la intención sin necesidad de un LLM generativo, reduciendo coste por consulta.
- Filtrado de seguridad o moderación binaria: el modo `noul` permite plantear preguntas booleanas ("¿este mensaje contiene una amenaza?") y usar el logit como puntuación de riesgo.
- Puntuación de candidatos en recuperación (reranking): el modo `score` puntúa cada documento candidato frente a una consulta, útil para reordenar resultados de un buscador antes de pasarlos a un modelo mayor.
- Decisión en pipelines de CI/CD: elegir entre acciones predefinidas (desplegar, revertir, escalar, ignorar) a partir de un estado en JSON con métricas y logs, con la ventaja de que la salida es un conjunto cerrado y auditable.
- Enrutado multilingüe en centros de contacto: al ser multilingüe y con contexto de 8192 tokens, puede clasificar consultas en varios idiomas con el mismo modelo y sin traducción previa.
- Evaluación automática de respuestas: dado un par pregunta-respuesta como estado, puntuar opciones de calidad (correcta, parcial, incorrecta) para construir etiquetas de entrenamiento o validación.

## Benchmarks y rendimiento

Los datos disponibles son de validación de la conversión, no de benchmarks estándar (MMLU, HumanEval, GSM8K). Se presentan a continuación:

| Metrica | F32 | F16 | Referencia |
|---|---|---|---|
| Decisiones idénticas al modelo PyTorch (julia1-cli, 2000 preguntas) | 2000/2000 | 2000/2000 | Exactitud 1451/2000 en ambos |
| Decisiones idénticas al modelo PyTorch (llama-server, Metal) | 1999/2000 | 2000/2000 | — |
| Desviación máxima de logits (F32, Metal) | 8,5e-4 | — | Respecto al original |
| Latencia por petición HTTP (julia1-cli, Apple M1 Pro) | 13,4 ms | — | — |
| Latencia por petición HTTP (llama-server, Metal) | 22,8 ms | 21,8 ms | — |
| Decisiones conservadas con Q8_0 (ggml-org) | — | — | 1947/2000 |

No se han publicado resultados de benchmarks estándar en la información disponible.

## Requisitos de hardware

- VRAM estimada: con 144,19 M de parámetros, F32 ocupa aproximadamente 577 MB y F16 unos 288 MB en pesos; el repositorio completo pesa 3,5 GB por incluir ambas variantes.
- Cabe en cualquier GPU de consumo con al menos 1 GB de VRAM libre, incluidas GTX 1650, RTX 3060, RTX 4090 y equivalentes; también funciona en CPU.
- GPU recomendadas para producción: cualquier GPU moderna con soporte Metal o CUDA; el autor valida Metal en Apple M1 Pro con 13,4 ms por petición en julia1-cli y 21,8-22,8 ms en `llama-server`.
- Opciones de despliegue: `llama-server` de llama.cpp master con el PR #29818 (build posterior al 2 de octubre de 2026) y julia1-cli 0.2.0 o superior, que incluye CLI, servidor HTTP, API C y paquete Python `julia1-gguf`.
- No es compatible con Ollama ni LM Studio, porque ninguno expone el endpoint `/v1/systemone`.
- Latencia y throughput: las cifras publicadas son de latencia por petición (13,4 ms en julia1-cli y 21,8-22,8 ms en llama-server sobre M1 Pro); no se han publicado cifras de throughput agregado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Formato |
|---|---|---|---|---|---|
| Julia-1 (esta ficha, GGUF) | 144,19 M | 8192 | Modelo de decisión | Apache 2.0 | GGUF F32/F16 |
| SupersonicLabs/Julia-1 (original) | 144,19 M | 8192 | Modelo de decisión | Apache 2.0 | safetensors (PyTorch) |
| ggml-org/Julia-1-GGUF | 144,19 M | 8192 | Modelo de decisión | Apache 2.0 | GGUF BF16 y Q8_0 |
| Modelos de clasificación tipo BERT-small | ~100-150 M | Variable (512-8192) | Codificador clasificador | Variable | safetensors, ONNX |

La comparación con modelos de clasificación genéricos es aproximada: Julia-1 se distingue por su interfaz de decisión tipada (opciones múltiples, puntuación y booleano) y por el soporte nativo en llama.cpp mediante `/v1/systemone`, que no está disponible en clasificadores BERT convencionales. No se dispone de comparativas de rendimiento frente a otros modelos de enrutado en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto, tool calling generativo ni razonamiento multi-paso; cualquier uso que espere una respuesta en lenguaje natural fallará.
- Solo se publican F32 y F16; cuantizaciones por debajo de F16 cambian las decisiones (Q8_0 conserva 1947/2000), por lo que no se recomienda su uso en producción con cuantización agresiva.
- Requiere un build de llama.cpp master posterior al 2 de octubre de 2026 (PR #29818); ninguna release etiquetada lo incluye todavía. Tampoco funciona en Ollama ni LM Studio.
- En `llama-server` es necesario que `-ub` cubra el prompt más largo y que el `state` se envíe como cadena JSON; de lo contrario pueden aparecer discrepancias (1999/2000 en F32 frente a 2000/2000 en F16).
- El autor no detalla sesgos conocidos, composición del dataset ni riesgos de alucinación; al ser un modelo de decisión, el riesgo principal es la elección incorrecta entre opciones, no la fabricación de contenido.
- El contexto está limitado a 8192 tokens; estados más largos deben truncarse o resumirse.
- La licencia Apache 2.0 permite uso comercial, pero la conversión es independiente y no está afiliada ni respaldada por Supersonic Labs.
- El nombre `julia1` hace referencia al modelo, no al lenguaje de programación Julia.

## Enlaces

- Repositorio GGUF: https://huggingface.co/andrelucas/Julia-1-GGUF
- Modelo base: https://huggingface.co/SupersonicLabs/Julia-1
- Página oficial: https://supersoniclabs.ia.br/pt/julia-1/
- Conversión de ggml-org: https://huggingface.co/ggml-org/Julia-1-GGUF
- Repositorio julia1-cli: https://github.com/alucassch/julia1-cli
- Especificación de julia1-cli: https://github.com/alucassch/julia1-cli/blob/main/SPEC.md
- PR de llama.cpp #29818: https://github.com/ggml-org/llama.cpp/pull/29818
- PR de llama.cpp #29363 (laya, superado): https://github.com/ggml-org/llama.cpp/pull/29363
- Revisión anterior del repositorio: https://huggingface.co/andrelucas/Julia-1-GGUF/tree/0ea1466363aec00cbbd79d9099825633ac9d7073
- Paper arXiv 2509.06888: https://arxiv.org/abs/2509.06888
- Paper arXiv 2412.13663: https://arxiv.org/abs/2412.13663
