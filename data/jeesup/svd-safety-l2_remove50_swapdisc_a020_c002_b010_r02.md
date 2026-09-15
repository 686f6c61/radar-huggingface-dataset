# Jeesup/svd-safety-l2_remove50_swapdisc_a020_c002_b010_r02

## Resumen

Este repositorio contiene un checkpoint derivado de `meta-llama/Llama-2-7b-chat-hf` comprimido con la técnica SVD-LLM hasta eliminar el 50,01 % de los parámetros densos y sometido después a un proceso de restauración selectiva de componentes. En concreto, se han aplicado 2 de las 5 rondas previstas de "swap" de parámetros neutro, con la regla de selección `disc_iter`, un presupuesto de restauración del 1,000 % de los parámetros densos y una escala de inserción de 0,2; el resultado son 2.527 componentes intercambiados y 25.899.008 parámetros reinsertados (el 0,40 % de los parámetros de proyección densos). El checkpoint final conserva 6.738.415.616 parámetros (≈6,74 B), es decir, una fracción de 0,4999 respecto al modelo original.

Se trata de un artefacto de investigación, no de un asistente conversacional desplegable. Su propósito es cuantificar cómo la compresión SVD degrada el comportamiento de seguridad de un modelo alineado y qué reglas de selección de componentes reparan mejor ese daño. El autor lo describe explícitamente como una celda de una rejilla experimental sobre reglas de selección y presupuestos, con varias ramas deliberadamente degradadas en seguridad respecto a Llama-2-7b-chat.

Es relevante ahora porque aborda un problema práctico poco documentado: la pérdida de robustez frente a ataques cuando se comprime un modelo por debajo del 50 % de sus parámetros, y la posibilidad de recuperar parte de esa robustez sin reentrenar. Las métricas publicadas en la model card (ASR de 0,3865 en AdvBench, 0,2364 en StrongREJECT y 0,2187 de sobrerrechazo macro en WildGuard) sitúan el checkpoint como sujeto de prueba medible, no como producto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only densa (familia Llama 2), con compresión SVD-LLM aplicada sobre las proyecciones |
| Parametros totales | 6.738.415.616 (≈6,74 B); fracción resultante 0,4999 respecto al modelo denso |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | 4096 tokens (heredada de meta-llama/Llama-2-7b-chat-hf) |
| Tipos de cuantizacion | no disponibles; el repositorio solo publica safetensors en precisión completa y no documenta recetas GGUF, AWQ o GPTQ |
| Idiomas soportados | no disponible en la model card; el modelo base está orientado principalmente a inglés |
| Licencia | Llama 2 Community License (se incluyen LICENSE.txt y USE_POLICY.md en el repositorio) |
| Formato de pesos | safetensors (tamaño del repositorio: 13,5 GB) |
| Modelo base | meta-llama/Llama-2-7b-chat-hf |
| Regla de seleccion | disc_iter |
| Presupuesto de restauracion | 1,000 % de los parámetros densos (0,200 % por ronda) |
| Componentes intercambiados | 2.527 restaurados y 2.527 sustituidos |
| Parametros reinsertados | 25.899.008 (0,40 % de los parámetros de proyección densos) |
| Semilla | 42 |

## Arquitectura y entrenamiento

No hay entrenamiento involucrado: el checkpoint es el resultado de dos transformaciones post-hoc sobre un modelo ya alineado. La primera es una compresión SVD-LLM que elimina el 50,01 % de los parámetros densos, presumiblemente descomponiendo las matrices de proyección y truncando componentes singulares de menor energía. La segunda es un procedimiento de "swap" iterativo de parámetros neutro, que reinserta componentes con el valor `insert` (solo el valor de inserción, con desalojo ordenado por sigma) a una escala de 0,2 de su fuerza original. El presupuesto total de la corrida completa es del 1,0 % de los parámetros densos, repartido en 5 rondas del 0,2 %; este checkpoint corresponde a la ronda intermedia 2 de 5.

La innovación técnica destacable es la propia metodología de reparación: en lugar de reentrenar o hacer fine-tuning, se seleccionan componentes concretos según la regla `disc_iter` y se reinsertan con un presupuesto acotado, lo que permite medir de forma aislada el efecto de cada regla de selección. El autor no documenta la composición del dataset (no hubo uno), ni tokens de entrenamiento, ni uso de RLHF o DPO posteriores a la compresión. Tampoco se describen mecanismos de decodificación especulativa ni variantes de atención.

## Capacidades

- Generación de texto conversacional: conserva la funcionalidad de chat del modelo base Llama-2-7b-chat, aunque degradada por la compresión.
- Razonamiento básico y respuesta a instrucciones: heredado del modelo base, sin métricas de capacidad publicadas para este checkpoint.
- Comportamiento de rechazo: parcialmente dañado; el propio autor advierte que la compresión por sí sola eleva la tasa de éxito de ataques.
- Multilingüismo: no documentado; se asume el perfil del modelo base, centrado en inglés.
- Tool calling / function calling: no documentado ni evaluado en la model card.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Modo "thinking", visión o audio: no disponibles.
- Capacidad relevante para investigación: es un sujeto de prueba medible de trade-off seguridad-utilidad, con métricas ASR y de sobrerrechazo publicadas.

## Casos de uso

- Auditoría de seguridad bajo compresión: ejecutar AdvBench con el juez HarmBench sobre este checkpoint y comparar el ASR de 0,3865 con el del Llama-2-7b-chat sin comprimir, para cuantificar cuánta robustez se pierde al eliminar el 50 % de los parámetros densos.
- Estudio de reglas de selección de componentes: replicar la rejilla del autor (regla `disc_iter`, presupuesto del 1,0 %, escala de inserción 0,2, semilla 42) y comparar esta celda con otras ramas para determinar qué regla repara mejor la seguridad.
- Validación de jueces automáticos de seguridad: usar los tres valores publicados (0,3865 en AdvBench, 0,2364 en StrongREJECT, 0,2187 de sobrerrechazo macro en WildGuard) como puntos de control para verificar la reproducibilidad de HarmBench y WildGuard en una infraestructura propia.
- Investigación en interpretabilidad: analizar qué subespacios singulares eliminados por SVD-LLM concentran el comportamiento de rechazo, aprovechando que el checkpoint aísla la contribución de los 2.527 componentes restaurados.
- Red-teaming controlado en red aislada: servir el modelo con vLLM o TGI sin exposición externa para generar intentos de jailbreak y alimentar con ellos clasificadores de seguridad propios, asumiendo que su tasa de rechazo es inferior a la del modelo base.
- Prueba de pipelines de compresión y despliegue: validar la conversión a GGUF, la cuantización a 4 bits y medir la degradación adicional de seguridad que introduce cada paso antes de decidir una política de despliegue.
- Docencia y reproducibilidad experimental: usar el checkpoint como ejemplo reproducible (semilla 42, presupuestos documentados) en un seminario sobre trade-offs entre compresión, coste de inferencia y alineación.
- Evaluación de sobrerrechazo: medir con WildGuard si la restauración de componentes reintroduce rechazos excesivos, partiendo del 0,2187 macro registrado.

## Benchmarks y rendimiento

La model card solo publica métricas de seguridad, no benchmarks de capacidad (no hay MMLU, HumanEval, GSM8K ni similares):

| Metrica | Valor | Juez / herramienta |
|---|---|---|
| AdvBench ASR | 0,3865 | HarmBench judge |
| StrongREJECT ASR | 0,2364 | HarmBench judge |
| Sobrerrechazo macro | 0,2187 | WildGuard |

No se han publicado resultados de benchmarks de capacidad (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Tampoco se ofrecen comparaciones numéricas contra el modelo base sin comprimir dentro de la model card, por lo que no es posible calcular la delta de degradación con los datos proporcionados.

## Requisitos de hardware

- Pesos en fp16: ≈13,5 GB (coincide con el tamaño del repositorio, 13,5 GB), más overhead de activaciones y caché KV.
- Caché KV a contexto completo: aproximadamente 2 GB en fp16 para 4096 tokens, con la configuración del modelo base (32 capas, 32 cabezas, dimensión de cabeza 128).
- VRAM total estimada en fp16: 16-20 GB en la práctica; requiere GPU de 24 GB o reparto en varias GPU.
- Cuantización a 8 bits: ≈7 GB de pesos; encaja en GPU de 10-12 GB.
- Cuantización a 4 bits: ≈3,5-4 GB de pesos; puede caber en GPU consumer de 8 GB, aunque la degradación adicional de seguridad no está medida.
- GPU recomendadas: A100 40 GB u 80 GB, H100, L40S para servicio en fp16; RTX 4090 o RTX 3090 (24 GB) para fp16 en una sola tarjeta; RTX 3060/4060 Ti de 8-16 GB solo con cuantización.
- Cabe en GPU consumer: sí, con cuantización de 4 u 8 bits; en fp16 requiere al menos 24 GB.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (etiqueta `text-generation-inference` y `endpoints_compatible` presentes), vLLM, llama.cpp u Ollama previa conversión a GGUF no documentada por el autor.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Rendimiento | Disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint (svd-safety-l2_remove50_swapdisc_a020_c002_b010_r02) | 6,74 B (50 % de proyecciones densas eliminadas) | 4096 tokens | Llama 2 Community License | ASR 0,3865 (AdvBench); ASR 0,2364 (StrongREJECT); sobrerrechazo 0,2187 | HuggingFace, 0 descargas, 0 likes |
| meta-llama/Llama-2-7b-chat-hf | 6,74 B | 4096 tokens | Llama 2 Community License | no disponible en esta ficha | HuggingFace, referencia ampliamente utilizada |
| meta-llama/Llama-2-13b-chat-hf | 13 B | 4096 tokens | Llama 2 Community License | no disponible en esta ficha | HuggingFace |
| mistralai/Mistral-7B-Instruct-v0.1 | 7,24 B | 8192 tokens | Apache-2.0 | no disponible en esta ficha | HuggingFace |

La comparación directa de rendimiento con alternativas no es posible con los datos disponibles: la model card solo reporta métricas de seguridad de este checkpoint y no incluye la línea base sin comprimir. Otros modelos de la misma rejilla experimental no están enumerados en la información proporcionada.

## Limitaciones y advertencias

- No es un asistente desplegable: el autor lo califica expresamente de artefacto de investigación y sujeto experimental, no de modelo de propósito general.
- Seguridad degradada de forma deliberada en varias ramas de la rejilla: la compresión por sí sola eleva la tasa de éxito de ataques, y este checkpoint es un punto intermedio de una corrida más larga.
- ASR elevado: 0,3865 en AdvBench y 0,2364 en StrongREJECT implican que una fracción relevante de peticiones dañinas no se rechaza.
- Sobrerrechazo no trivial: 0,2187 macro en WildGuard, lo que indica que la restauración también puede aumentar los rechazos injustificados en peticiones benignas.
- Riesgo de alucinación: no medido para este checkpoint; se hereda el comportamiento del modelo base, potencialmente agravado por el truncamiento SVD.
- Idiomas: no documentados; el modelo base está orientado a inglés, por lo que el rendimiento en castellano u otras lenguas no está evaluado.
- Sin benchmarks de capacidad: no hay MMLU, HumanEval ni GSM8K, así que no se puede acotar la pérdida de utilidad frente a Llama-2-7b-chat.
- Licencia restrictiva: Llama 2 Community License y USE_POLICY.md vinculan cualquier uso derivado; incluye cláusulas de atribución y límites de escala para usos comerciales que deben revisarse antes de cualquier despliegue.
- Sin validación comunitaria: 0 descargas y 0 likes en el momento de la consulta; no hay informes independientes de reproducibilidad.
- Sin recetas de cuantización publicadas: cuantizar a 4 bits podría degradar más la seguridad, pero ese efecto no está medido.
- El checkpoint corresponde a la ronda 2 de 5: no representa el resultado final de la corrida completa con presupuesto del 1,0 %.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Jeesup/svd-safety-l2_remove50_swapdisc_a020_c002_b010_r02
- Modelo base: https://huggingface.co/meta-llama/Llama-2-7b-chat-hf
- Licencia y política de uso: LICENSE.txt y USE_POLICY.md incluidos en el repositorio del modelo
- Referencias metodológicas citadas en la model card (sin enlace proporcionado): SVD-LLM, regla de selección `disc_iter`, AdvBench, HarmBench, StrongREJECT y WildGuard
- Resultados de la búsqueda web: no se han encontrado enlaces relevantes al modelo, a SVD-LLM ni a su autor; los resultados devueltos corresponden a páginas de licencias de software sin relación con el contenido de esta ficha.
