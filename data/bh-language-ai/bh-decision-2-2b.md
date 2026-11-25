# BH-Language-AI/bh-decision-2-2b

## Resumen

BH-Decision-2-2B es un adaptador LoRA publicado por BH-Language-AI (proyecto de Kolektiv d.o.o. y Gamatrade d.o.o.) sobre el modelo base Qwen/Qwen3-1.7B. No es un modelo generativo al uso: el autor lo describe explicitamente como un sistema de *readout* de decisión, es decir, un adaptador entrenado para emitir una elección estructurada (con distribución de probabilidades) entre un conjunto de opciones dado un estado y una pregunta, en lugar de generar texto libre. Está orientado a bosnio (variante ijekavica) e inglés.

Técnicamente, el adaptador se entrena con LoRA de rango 32 (alpha 64, dropout 0.05, rsLoRA), 4 épocas, longitud máxima de 1024 tokens y precisión bf16, sobre un mix de datos de 7849 ejemplos (mix v10, el mismo que la variante de 4B). El repositorio ocupa aproximadamente 0,1 GB, ya que solo contiene los pesos del adaptador y no duplica las pesos del modelo base.

Su relevancia es acotada y experimental: el propio autor lo etiqueta como release candidate (RC) y no final. El interés principal reside en que demuestra que la receta de ajuste usada en la línea de 4B (BH-Decision-2-4B) también corrige el sesgo por defecto del modelo base en un modelo pequeño, aunque la calidad absoluta del readout (13/19 en held-out) queda por debajo de lo que el autor considera apto para uso serio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (r32, alpha 64, dropout 0.05, rsLoRA) sobre Qwen3-1.7B (transformer denso) |
| Parametros totales | No disponible (adaptador sobre un base de 1,7B; el repo solo contiene el adaptador) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible para el adaptador; entrenado con max_len 1024 |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Bosnio (ijekavica) e inglés |
| Licencia | Apache-2.0 (el modelo base Qwen/Qwen3-1.7B mantiene su propia licencia) |
| Formato de pesos | safetensors (adaptador LoRA; las pesos del base no se re-suben) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA sobre Qwen3-1.7B, un transformer denso de 1,7 mil millones de parámetros. El adaptador se entrena con rango 32, alpha 64, dropout 0.05 y rsLoRA durante 4 épocas, con longitud máxima de 1024 tokens y precisión bf16, sobre hardware LUMI MI250X (job 23993464). El conjunto de datos es el mix v10, con 7849 ejemplos, idéntico al usado en la variante de 4B (vA).

La innovación declarada no está en la arquitectura sino en el formato de salida: el modelo no genera texto, sino que produce una decisión estructurada (respuesta y probabilidades) mediante una interfaz específica (`anyjev.Tacit`). El autor afirma que la receta de ajuste "rompe el prior" del modelo base: Qwen3-1.7B sin ajustar tiende por defecto a la opción o2, mientras que el adaptador produce una distribución más sana (o1: 11, o2: 7, o3: 1 en el conjunto de evaluación). No se documentan datos sobre RLHF o DPO.

## Capacidades

- Readout de decisión por elección entre opciones (`kind="choice"`), devolviendo `answer` y `probs` de forma estructurada, sin necesidad de parsear texto.
- Toma de decisión condicionada a un estado y una pregunta en bosnio (ijekavica) e inglés.
- Corrección del sesgo de opción por defecto presente en el modelo base.
- No soporta generación libre de texto: `model.generate` está explícitamente desaconsejado por el autor.
- No se documentan capacidades de tool calling, agentes, visión, audio ni modo de razonamiento extendido.
- No se documenta soporte multilingüe más allá de bs/en.

## Casos de uso

- Clasificación de decisiones cerradas en pipelines de negocio: dado un estado descrito en texto y un conjunto fijo de opciones (por ejemplo, categorías de resolución), el modelo devuelve la opción elegida con su distribución de probabilidad, lo que permite umbralizar y derivar casos ambiguos a revisión humana.
- Enrutamiento de consultas en bosnio: usar el readout para asignar una consulta entrante a uno de varios departamentos o colas, aprovechando el ajuste específico al idioma y la variante ijekavica.
- Etiquetado asistido de datos: generar etiquetas de elección sobre lotes de ejemplos para preanotar corpus y reducir el trabajo de revisión manual, con la salvedad de que la precisión held-out es del 68 %.
- Prototipado de sistemas de decisión en investigación: servir como banco de pruebas de bajo coste (adaptador de 0,1 GB sobre un base de 1,7B) antes de escalar a la variante de 4B, que el autor reporta con 18/19.
- Evaluación comparativa de recetas de ajuste: al compartir mix de datos y receta con la línea de 4B, permite estudiar el efecto del tamaño del modelo base en la calidad del readout.
- Filtrado o triaje previo en aplicaciones de atención al cliente en bosnio: seleccionar entre un conjunto acotado de respuestas o acciones predefinidas antes de invocar un sistema generativo mayor.

## Benchmarks y rendimiento

Datos publicados por el autor en la model card (held-out: 20 ejemplos no vistos, 19 puntuados):

| Modelo | Readout q1 | Generación (tolerante) |
|---|---|---|
| Qwen3-1.7B sin ajustar | 7/19 (37 %) | — |
| BH-Decision-2-2B (v2b) | 13/19 (68 %) | 3/19 (16 %) |

El autor indica además que la generación estricta es de 1/20 y que la distribución de opciones predichas es o1: 11, o2: 7, o3: 1. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma específica; el adaptador LoRA añade una sobrecarga mínima sobre Qwen3-1.7B, que en bf16 requiere aproximadamente 3,4 GB solo para pesos, más memoria de activaciones y caché KV.
- GPU recomendadas: no documentadas por el autor; el entrenamiento se realizó en AMD MI250X (LUMI). Para inferencia, cualquier GPU con al menos 8 GB de VRAM debería acomodar el base en bf16 o cuantizado.
- GPU de consumo: previsiblemente cabe en RTX 3060/4060 de 8 GB o superiores en cuantización de 4 bits, aunque el autor no publica requisitos ni recetas de cuantización.
- Despliegue: la única vía soportada es la librería `anyjev` (`Tacit.from_pretrained(..., adaptive=False)`); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Readout held-out | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| BH-Decision-2-2B | Adaptador sobre 1,7B | max_len 1024 en entrenamiento | 13/19 (68 %) | Apache-2.0 | Hugging Face |
| BH-Decision-2-4B | Adaptador sobre base de 4B (no especificado) | No disponible | 18/19 | No disponible | Hugging Face (v0.5-rc) |
| Qwen3-1.7B (base sin ajustar) | 1,7B | No disponible en la información | 7/19 (37 %) | Apache-2.0 | Hugging Face |

No se dispone de datos para comparar con otros adaptadores de decisión de la misma categoría.

## Limitaciones y advertencias

- El autor califica el modelo como release candidate, no final, y recomienda la línea de 4B (18/19) para uso serio.
- La generación libre de texto es débil (3/19 tolerante, 1/20 estricto) y no está soportada como vía de uso.
- El readout de elección no se abstiene ante entradas sin sentido, lo que puede producir decisiones confiadas sobre input inválido.
- Precisión held-out del 68 %: insuficiente para decisiones automatizadas sin supervisión humana en dominios sensibles.
- Idiomas limitados a bosnio (ijekavica) e inglés; no se documenta comportamiento en castellano ni en otras lenguas.
- Riesgo de sesgo heredado del corpus de entrenamiento (mix v10) y del modelo base Qwen3-1.7B; no se publica análisis de sesgos.
- La licencia Apache-2.0 cubre el adaptador, pero el modelo base Qwen/Qwen3-1.7B conserva su propia licencia, que debe respetarse.
- Dependencia de la librería `anyjev` para la interfaz de decisión; no hay integración documentada con stacks de inferencia estándar.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validación externa por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/BH-Language-AI/bh-decision-2-2b
- Modelo hermano de 4B: https://huggingface.co/BH-Language-AI/bh-decision-2-4b
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
- Contacto indicado por el autor: xnetba@gmail.com
