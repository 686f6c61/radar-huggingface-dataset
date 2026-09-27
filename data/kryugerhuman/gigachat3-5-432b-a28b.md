# kryugerHuman/GigaChat3.5-432B-A28B

## Resumen

GigaChat 3.5 Ultra es el modelo insignia "instant" de la familia GigaChat, desarrollada por Sber (publicada en Hugging Face bajo la organizacion `ai-sage`). Se trata de un modelo de lenguaje de tipo Mixture-of-Experts (MoE) con 432.000 millones de parametros totales y 28.000 millones de parametros activos por token, disenado para cargas de asistente multilingue, razonamiento, generacion de codigo y escenarios agenticos con uso de herramientas.

La relevancia de esta version esta en su arquitectura hibrida de atencion, que combina Multi-head Latent Attention (MLA) con capas de atencion lineal basadas en GatedDeltaNet. Segun el autor, frente al anterior buque insignia GigaChat 3.1 Ultra (700B) el modelo es un 40 % mas compacto, pero mejora en codigo, matematicas y tareas agenticas; ademas reduce aproximadamente 4 veces la KV-cache por token, permite alojar mas del doble de contexto en la misma memoria y mejora el throughput de generacion en torno a un 20 %.

El modelo se entreno de forma nativa en FP8 y se distribuye tambien una version descuantizada en bf16 y versiones GGUF. Esta pensado para despliegue en clusters de GPU de gama alta, no para hardware de consumo. La model card del repositorio consultado esta truncada en la seccion de benchmarks del modelo instruct, por lo que la comparativa de rendimiento disponible corresponde a la version base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) con atencion hibrida: Multi-head Latent Attention (MLA) + capas de atencion lineal GatedDeltaNet |
| Parametros totales | 432B (433.747.019.520 segun safetensors) |
| Parametros activos | 28B |
| Longitud de contexto | no disponible (la model card solo indica el tag long-context y que cabe mas del doble de contexto en la misma memoria que GigaChat 3.1 Ultra) |
| Tipos de cuantizacion | FP8 nativo (entrenamiento e inferencia), bf16 descuantizado, GGUF |
| Idiomas soportados | Ruso (ru) e ingles (en) |
| Licencia | MIT |
| Formato de pesos | safetensors (fp8 y bf16), GGUF |

## Arquitectura y entrenamiento

El nucleo del modelo es una arquitectura MoE personalizada. Cada capa decodificadora MoE combina atencion, el bloque de expertos y una post-normalizacion aplicada antes de la suma residual. La innovacion principal frente a GigaChat 3.1 es un diseno de atencion hibrida: parte de las capas mantienen MLA y el resto son capas de atencion lineal basadas en GatedDeltaNet. El objetivo es conservar las ventajas de la atencion completa mientras se reduce el coste asociado a contextos largos, donde la KV-cache crece y la generacion queda limitada por memoria.

El modelo incorpora tambien GatedNorm, una puerta multiplicativa explicita posterior a RMSNorm que sustituye los "anclajes" implicitos de autoestabilizacion (attention/residual sinks) que aparecen en modelos grandes. La reparametrizacion `2 · sigmoid` mantiene la puerta cerca de 1.0 en la inicializacion, de modo que apenas perturba el flujo de datos al principio y aprende donde atenuar. Para acelerar la decodificacion se usan dos cabezas de Multi-Token Prediction (MTP): una cabeza acelera la generacion voraz aproximadamente 1,5x y dos cabezas hasta 2,2x, frente a la unica cabeza de GigaChat Ultra 3.0. El entrenamiento se realizo en FP8 nativo en todas las etapas. El pipeline de alineamiento sigue la secuencia Stage 1.5, SFT, DPO y RL en linea; el RL en linea es la incorporacion destacada de esta version y, segun el autor, impulsa las mejoras en seguimiento de instrucciones y en arenas de evaluacion.

## Capacidades

- Generacion de texto conversacional y seguimiento de instrucciones en ruso e ingles.
- Razonamiento sobre contextos largos gracias al diseno de atencion hibrida y a la reduccion de KV-cache.
- Generacion de codigo, con resultados notables en HumanEval y HumanEval+ en la version base.
- Razonamiento matematico y resolucion de problemas cuantitativos (MATH, GSM8K, MGSM ru).
- Soporte de tool calling / function calling (tag tool-use en la model card).
- Escenarios agenticos y razonamiento multi-paso.
- Capacidades multilingues limitadas a ruso e ingles.
- Aceleracion por MTP con dos cabezas de prediccion multi-token.
- No se documentan capacidades de vision ni de audio en la informacion disponible.

## Casos de uso

- Atencion al cliente automatizada en ruso e ingles: el modelo puede gestionar conversaciones multi-turno con contexto largo, y la arquitectura hibrida reduce el coste de memoria por token frente a un transformer denso equivalente, lo que abarata el mantenimiento de sesiones extensas.
- Asistente de codigo en produccion: con 80,49 en HumanEval y 75,61 en HumanEval+ (version base), puede integrarse en pipelines de generacion y revision de codigo; el soporte de tool calling permite conectarlo a linters, compiladores o APIs de CI/CD.
- Agentes con uso de herramientas: el tag tool-use y su orientacion agentica lo hacen adecuado para orquestar llamadas a APIs externas, consultas a bases de datos y tareas multi-paso con verificacion intermedia.
- Analisis de documentos largos en ruso: la reduccion de KV-cache y la mejora de contexto por unidad de memoria permiten procesar informes, contratos o expedientes extensos en una sola ventana.
- Razonamiento matematico asistido: con 61,7 en MATH Minerva y 86,58 en GSM8K (base), sirve para tutoria, verificacion de calculos y resolucion de problemas paso a paso.
- Despliegue en clusters para inferencia de alto rendimiento: la version FP8 y las cabezas MTP estan pensadas para maximizar throughput en GPUs de centro de datos.
- Generacion de contenido multilingue ru-en: redaccion, resumen y traduccion asistida entre ambos idiomas.
- Evaluacion comparativa de modelos base: la version base y los checkpoints publicados permiten reproducir y extender los resultados de benchmarks.

## Benchmarks y rendimiento

Los datos disponibles corresponden a la version base (`GigaChat-3.5-Ultra-Base`, 430B). La tabla del modelo instruct aparece truncada en la model card consultada.

Modelos generales:

| Tarea | GigaChat 3.1 Base (700B) | GigaChat 3.5 Ultra Base (430B) | DeepSeek V4 Flash Base (284B) | DeepSeek V3.2 Exp Base (685B) |
|---|---|---|---|---|
| MMLU (5-shot) | 79,89 | 85,28 | 88,68 | 87,47 |
| MMLU-Pro (5-shot) | 68,01 | 74,54 | 65,86 | 62,43 |
| GPQA Diamond (oficial, CoT) | 30,3 | 30,81 | 22,73 | 22,22 |
| BBH (3-shot) | 83,78 | 87,5 | 88,24 | 89,16 |
| ARC-C (25-shot, acc_norm) | 68,34 | 70,39 | 72,35 | 70,31 |
| ARC-E (25-shot, acc_norm) | 88,38 | 88,59 | 90,82 | 89,27 |
| HellaSwag (10-shot, acc_norm) | 89,43 | 89,47 | 88,9 | 89,28 |
| Winogrande (5-shot) | 82,72 | 85 | 84,61 | 84,93 |
| DROP (5-shot, EM) | 56,29 | 59,55 | 63,88 | 65,14 |
| TriviaQA (5-shot, EM) | 81,4 | 82,23 | 83,96 | 83,88 |
| NQ-Open (5-shot, EM) | 37,34 | 41,66 | 40,83 | 42,27 |
| Media | 69,6 | 72,3 | 71,9 | 71,5 |

Matematicas:

| Tarea | GigaChat 3.1 Base (700B) | GigaChat 3.5 Ultra Base (430B) | DeepSeek V4 Flash Base (284B) | DeepSeek V3.2 Exp Base (685B) |
|---|---|---|---|---|
| MATH Minerva (math-verify) | 55,78 | 61,7 | 54,74 | 58,2 |
| GSM8K (CoT, math_verify) | 86,73 | 86,58 | 86,43 | 84,99 |
| MGSM ru (CoT) | 87,6 | 86 | 84,4 | 82 |
| Media | 76,7 | 78,1 | 75,2 | 75,1 |

Codigo:

| Tarea | GigaChat 3.1 Base (700B) | GigaChat 3.5 Ultra Base (430B) | DeepSeek V4 Flash Base (284B) | DeepSeek V3.2 Exp Base (685B) |
|---|---|---|---|---|
| HumanEval (pass@1) | 70,12 | 80,49 | 66,46 | 64,02 |
| HumanEval+ (pass@1) | 62,8 | 75,61 | 61,59 | 56,71 |
| MBPP (pass@1) | 70,2 | 70,4 | 70,2 | 70,4 |
| MBPP+ (pass@1) | 83,33 | 83,33 | 77,25 | 82,28 |
| CRUXEval (pass@1) | 64,56 | 67,5 | 69,75 | 69,94 |
| LCB CodeGen Lite | 49,29 | 54,31 | 57,25 | 50,24 |
| Media | 66,7 | 71,9 | 67,1 | 65,6 |

Para el modelo instruct solo se dispone de la cabecera de la tabla (GigaChat 3.1 Ultra 700B, GigaChat 3.5 Ultra 430B y DeepSeek V3.2 685B), sin valores: no disponible.

## Requisitos de hardware

- VRAM estimada para pesos en bf16: aproximadamente 866 GB, calculada a partir de los 433.747.019.520 parametros y 2 bytes por parametro. Estimacion propia, no publicada por el autor.
- VRAM estimada para pesos en FP8: aproximadamente 433 GB (1 byte por parametro). Estimacion propia.
- VRAM estimada para cuantizaciones de 4 bits: en torno a 220-260 GB, dependiendo del esquema y de los parametros no cuantizados. Estimacion propia.
- GPU recomendadas: por el volumen de pesos, se requieren nodos multi-GPU de centro de datos, como configuraciones de 8x H100 80 GB (640 GB) para FP8, 8x H200 141 GB o 16x H100 80 GB para bf16. No es viable en una unica GPU consumer.
- GPU de consumo: no cabe en tarjetas como RTX 4090 o RTX 5090 por si solo. Un despliegue en hardware de consumo exigiria cuantizacion agresiva combinada con offloading a memoria del sistema y aun asi seria muy limitado.
- Opciones de despliegue: se han publicado pesos en GGUF (incluida la variante Reasoning-GGUF), lo que habilita llama.cpp y entornos derivados. Para FP8 y bf16 en servidor se espera uso de frameworks de inferencia tipo vLLM o TGI, aunque la informacion disponible no confirma integraciones concretas.
- Tamano del repositorio: 437,9 GB en el repositorio consultado. Un listado externo de la version GGUF reporta aproximadamente 1,50 TB repartidos en 6 partes.
- Latencia y throughput: no disponible. Solo se documenta una mejora de throughput de aproximadamente el 20 % frente a GigaChat 3.1 Ultra y una aceleracion de decodificacion de 1,5x (una cabeza MTP) a 2,2x (dos cabezas MTP).

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GigaChat 3.5 Ultra (430B) | 432B | 28B | no disponible | MIT | Pesos abiertos en FP8, bf16 y GGUF |
| GigaChat 3.1 Ultra (700B) | 700B | no disponible | no disponible | no disponible en la informacion | Modelo anterior de la familia |
| DeepSeek V3.2 (685B) | 685B | no disponible | no disponible | no disponible en la informacion | Referencia comparativa de la model card |
| DeepSeek V4 Flash (284B) | 284B | no disponible | no disponible | no disponible en la informacion | Referencia comparativa de la model card |

En los benchmarks de la version base, GigaChat 3.5 Ultra Base obtiene la mejor media general (72,3) frente a DeepSeek V4 Flash Base (71,9) y DeepSeek V3.2 Exp Base (71,5), y la mejor media en matematicas (78,1) y codigo (71,9). DeepSeek supera a GigaChat en MMLU, BBH, DROP, TriviaQA, NQ-Open y LCB CodeGen Lite.

## Limitaciones y advertencias

- Idiomas soportados limitados a ruso e ingles; no se declaran capacidades en castellano ni en otros idiomas.
- No se especifica la longitud de contexto soportada, dato critico para planificar despliegues de contexto largo.
- La model card consultada esta truncada: faltan las puntuaciones del modelo instruct y la comparativa completa frente a DeepSeek V3.2.
- Riesgo de alucinacion propio de un modelo generativo; no se documentan tasas de error ni evaluaciones de factualidad.
- No se documentan sesgos conocidos en la informacion disponible, aunque un modelo entrenado predominantemente en ruso e ingles heredara los sesgos de esos corpus.
- La licencia es MIT, lo que permite uso comercial sin restricciones declaradas, pero conviene verificar terminos adicionales en el repositorio oficial.
- El requisito de hardware es muy elevado (cientos de GB solo para pesos), lo que descarta el despliegue en una unica GPU de consumo.
- El modelo se entreno en FP8 nativo; la version bf16 es una descuantizacion, con la posible perdida de fidelidad asociada.
- El repositorio consultado (`kryugerHuman/GigaChat3.5-432B-A28B`) figura con 0 descargas y 0 likes y es un espejo; el repositorio de referencia es el de `ai-sage`.
- La fecha de creacion del repositorio indicada (2026-09-26) y la fecha de publicacion reportada (julio de 2026) son posteriores a la informacion disponible habitualmente, por lo que conviene confirmar la vigencia de los datos.

## Enlaces

- Repositorio consultado: https://huggingface.co/kryugerHuman/GigaChat3.5-432B-A28B
- Repositorio oficial (instruct): https://huggingface.co/ai-sage/GigaChat3.5-432B-A28B
- Version bf16: https://huggingface.co/ai-sage/GigaChat3.5-432B-A28B-bf16
- Version GGUF: https://huggingface.co/ai-sage/GigaChat3.5-432B-A28B-GGUF
- Version base: https://huggingface.co/ai-sage/GigaChat3.5-432B-A28B-base
- Checkpoints de entrenamiento: https://huggingface.co/ai-sage/GigaChat3.5-432B-A28B-checkpoints
- Version GGUF de razonamiento: https://huggingface.co/ai-sage/GigaChat3.5-432B-A28B-Reasoning-GGUF
- Articulo en Habr: https://habr.com/ru/companies/sberbank/articles/1055826/
- Ficha en aimodels.fyi: https://www.aimodels.fyi/models/huggingFace/gigachat3.5-432b-a28b-ai-sage
- Listado GGUF en local-ai-zone: https://local-ai-zone.github.io/models/gigachat3-5-432b-a28b.html
- Ficha en Open God Mode: https://opengodmode.ai/models/gigachat3.5-432b-a28b/
