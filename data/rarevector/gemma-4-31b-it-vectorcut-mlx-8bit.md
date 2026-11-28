# rarevector/gemma-4-31B-it-VectorCut-MLX-8bit

## Resumen

`rarevector/gemma-4-31B-it-VectorCut-MLX-8bit` es una cuantizacion de 8 bits en formato MLX del modelo Gemma 4 31B instruction-tuned, distribuida por Rare Vector Labs bajo el pipeline propio "VectorCut". Se trata de un checkpoint multimodal de tipo image-text-to-text orientado a Apple Silicon, pensado para ejecutarse en oMLX con decodificacion especulativa nativa gracias a la cabeza MTP (Multi-Token Prediction) ya fusionada en el propio checkpoint. El modelo base sobre el que se construye es `RareVector/gemma-4-31B-it-VectorCut-BF16`, a su vez derivado de Gemma 4 31B instruction-tuned.

La modificacion respecto al modelo original es una ablacion quirurgica de rechazos: en lugar de una abliteration global sobre el residual stream, el autor interviene unicamente 33 conmutadores de rechazo (99 tensores gated-MLP), dejando intactos atencion, layer norms, embeddings, cabeza LM y los 356 tensores de vision. El autor declara una auditoria SHA-256 tensor a tensor segun la cual 1.089 de 1.188 tensores permanecen identicos bit a bit al original antes de la cuantizacion `oQ8e-mtp` y la fusion de MTP.

Es relevante ahora porque combina tres elementos poco habituales en un mismo artefacto: cuantizacion de 8 bits con vision preservada en BF16, decodificacion especulativa integrada sin descarga adicional de modelo asistente, y una ventana de contexto de 256K. Todo ello con licencia Apache 2.0 y soporte declarado de mas de 35 idiomas. La contrapartida es que el modelo ha sido deliberadamente descensurado, lo que plantea consideraciones de uso en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso multimodal (Gemma 4), con cabeza MTP fusionada para decodificacion especulativa |
| Parametros totales | 31.742.607.472 (31,7B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 256K tokens (declarado en la model card) |
| Tipos de cuantizacion | 8 bits `oQ8e-mtp` (MLX); la familia incluye tambien 6 bits y 4 bits; vision en BF16 sin cuantizar |
| Idiomas soportados | Multilingue; 35+ idiomas declarados (preentrenamiento en 140+): en, de, fr, es, it, pt, nl, pl, ru, uk, cs, sv, da, fi, no, tr, ar, he, hi, bn, ta, te, ur, vi, th, id, ms, zh, ja, ko, el, ro, hu, bg, fa, sw, tl |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (formato MLX), 34,7 GB de repositorio |

## Arquitectura y entrenamiento

El modelo es un transformer denso de 31,7B parametros con torre de vision integrada (356 tensores `visual.*` conservados en BF16) y una cabeza MTP (Multi-Token Prediction) fusionada en el checkpoint. La cabeza MTP habilita decodificacion especulativa nativa en oMLX sin necesidad de descargar un modelo asistente separado. El pipeline es image-text-to-text, por lo que acepta entradas de imagen y texto y genera texto.

No se dispone de informacion detallada sobre el dataset de preentrenamiento, el numero de tokens, ni las fases de alineacion (RLHF/DPO) del Gemma 4 31B original en la informacion proporcionada; esos datos corresponden al modelo upstream y no se detallan en esta model card. La innovacion tecnica documentada es el pipeline VectorCut: una ablacion localizada sobre 33 conmutadores de rechazo (99 tensores gated-MLP) en lugar de una intervencion global sobre el residual stream, con auditoria SHA-256 que certifica la preservacion bit a bit de 1.089 de 1.188 tensores. Sobre esa base se aplica cuantizacion `oQ8e-mtp` calibrada con iMatrix y se fusiona la cabeza MTP.

## Capacidades

- Generacion de texto y razonamiento conversacional multi-turno.
- Razonamiento matematico (evaluado con `gsm8k_cot`).
- Seguimiento de instrucciones (evaluado con `ifeval`).
- Vision: entrada image-text-to-text con 356 tensores de vision preservados en BF16.
- Modo "thinking" integrado de Gemma 4 (declarado en la model card).
- Decodificacion especulativa nativa mediante cabeza MTP fusionada (oMLX).
- Soporte multilingue en 35+ idiomas.
- Contexto largo de hasta 256K tokens.
- Capacidad de tool calling / function calling: no confirmada en la informacion disponible.
- Soporte de agentes y razonamiento multi-paso: no confirmado en la informacion disponible.
- Capacidades de audio: no disponibles.

## Casos de uso

- Escritura creativa y worldbuilding sin restricciones de contenido: el pipeline VectorCut elimina rechazos manteniendo el razonamiento intacto (el autor reporta una degradacion maxima de 0,12 pp frente al baseline de 8 bits), lo que lo hace adecuado para ficcion, narrativa y generacion de ideas que otros modelos rechazan.
- Analisis de documentos largos en local: con 256K de contexto puede procesar contratos, informes o bases de codigo extensas en una sola pasada sobre un Mac con Apple Silicon.
- Procesamiento multimodal de imagenes: al conservar los 356 tensores de vision en BF16, puede describir capturas, extraer texto de imagenes o responder preguntas sobre diagramas sin la degradacion tipica de cuantizaciones agresivas.
- Asistencia multilingue en produccion: con soporte declarado de 35+ idiomas (incluidos es, de, fr, it, pt, zh, ja, ar, hi), es util para traduccion, atencion al cliente o generacion de contenido en mercados multiples.
- Inferencia local en Apple Silicon: al ser un checkpoint MLX de 8 bits con MTP integrado, permite desplegar un modelo de 31,7B en estaciones de trabajo Mac con decodificacion especulativa acelerada, sin depender de la nube.
- Razonamiento matematico y resolucion de problemas: los resultados en `gsm8k_cot` (96,66% exact-match estricto) lo respaldan para tutoria, verificacion de calculos o generacion de problemas resueltos.
- Prototipado de investigacion sobre alineacion y seguridad: la ablacion quirurgica documentada y la auditoria SHA-256 lo convierten en un artefacto util para estudiar el efecto de intervenciones localizadas sobre el comportamiento de rechazo.

## Benchmarks y rendimiento

Evaluacion determinista a `temperature=0.0`, `lm_eval` v0.4.13, 1.860 muestras, comparando `gemma-4-31B-it-VectorCut-oQ8e-mtp` frente a Gemma 4 31B estandar de 8 bits sin modificar:

| Tarea | Metrica | VectorCut 8-bit | Baseline 8-bit | Delta |
|---|---|---:|---:|---:|
| `gsm8k_cot` (n=1.319) | `exact_match,strict-match` | 96,66% | 96,74% | -0,08 pp |
| `gsm8k_cot` (n=1.319) | `exact_match,flexible-extract` | 96,44% | 96,51% | -0,08 pp |
| `ifeval` (n=541) | `inst_level_loose_acc` | 94,60% | 94,72% | -0,12 pp |
| `ifeval` (n=541) | `inst_level_strict_acc` | 93,05% | 93,05% | Empate |
| `ifeval` (n=541) | `prompt_level_loose_acc` | 92,24% | 92,24% | Empate |
| `ifeval` (n=541) | `prompt_level_strict_acc` | 90,02% | 90,02% | Empate |

No se han publicado en la informacion disponible resultados de MMLU, HumanEval ni otros benchmarks adicionales.

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 34,7 GB en formato MLX de 8 bits; en Apple Silicon la memoria unificada necesaria para cargar el modelo ronda ese tamano mas el overhead de contexto KV.
- Hardware objetivo: Apple Silicon (MLX / oMLX). No es un checkpoint pensado para GPU CUDA.
- GPU recomendadas: no aplica en el sentido tradicional; el requisito es un Mac con memoria unificada suficiente. Para contexto de 256K se necesita margen adicional de memoria para la cache KV.
- Cabe en GPU de consumo: si, en equipos Apple Silicon con memoria unificada suficiente para alojar ~35 GB de pesos mas cache. No esta pensado para GPUs consumer NVIDIA.
- Opciones de despliegue: MLX y oMLX (con decodificacion especulativa nativa via MTP). vLLM, llama.cpp, Ollama y TGI no estan indicados en la informacion disponible para este checkpoint MLX.
- Latencia y throughput: no disponibles en la informacion proporcionada; la model card menciona aceleracion por decodificacion especulativa en oMLX pero no aporta cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Vision | Licencia | Formato / plataforma |
|---|---|---|---|---|---|
| `rarevector/gemma-4-31B-it-VectorCut-MLX-8bit` | 31,7B | 256K | Si (BF16) | Apache 2.0 | MLX 8-bit, Apple Silicon |
| `RareVector/gemma-4-31B-it-VectorCut-BF16` | 31,7B | 256K | Si | Apache 2.0 | BF16, sin MTP integrado |
| `RareVector/gemma-4-31B-it-VectorCut-MLX-6bit` | 31,7B | 256K | Si (BF16) | Apache 2.0 | MLX 6-bit, Apple Silicon |
| `RareVector/gemma-4-31B-it-VectorCut-MLX-4bit` | 31,7B | 256K | Si (BF16) | Apache 2.0 | MLX 4-bit, Apple Silicon |

Las alternativas de otros autores (por ejemplo, Gemma 4 31B estandar de 8 bits empleado como baseline en los benchmarks) no se detallan en la informacion disponible mas alla de su uso como referencia de evaluacion.

## Limitaciones y advertencias

- Modelo deliberadamente descensurado: la ablacion de rechazos elimina barreras de seguridad, lo que implica riesgo de generar contenido danino, ilegal o inapropiado sin filtros. No es adecuado para despliegues orientados al publico sin moderacion externa.
- Riesgo de alucinacion: como cualquier LLM de su clase, puede generar informacion falsa con aparente seguridad; los benchmarks mostrados no miden factualidad.
- Sesgos: no se documentan evaluaciones de sesgo en la informacion disponible; los sesgos del modelo base Gemma 4 31B persisten salvo por la intervencion sobre rechazos.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el autor no ofrece garantias sobre el comportamiento del modelo modificado; conviene revisar las condiciones del modelo upstream.
- Limitaciones de plataforma: el checkpoint es MLX y esta orientado a Apple Silicon; no es directamente portable a CUDA sin conversion.
- Idiomas: aunque se declaran 35+ idiomas, el rendimiento puede variar y no se aportan metricas por idioma.
- Contexto: los 256K declarados no implican calidad uniforme en todo el rango; no se aportan evaluaciones de aguja en pajar ni de recuperacion a larga distancia.
- Verificacion: la auditoria SHA-256 la reporta el propio autor; no se ha verificado de forma independiente en la informacion disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/rarevector/gemma-4-31B-it-VectorCut-MLX-8bit
- Modelo base BF16: https://huggingface.co/RareVector/gemma-4-31B-it-VectorCut-BF16
- Variante MLX 6-bit: https://huggingface.co/RareVector/gemma-4-31B-it-VectorCut-MLX-6bit
- Variante MLX 4-bit: https://huggingface.co/RareVector/gemma-4-31B-it-VectorCut-MLX-4bit
- Repositorio del autor: https://huggingface.co/RareVector
- Apoyo al autor: https://ko-fi.com/rarevector
