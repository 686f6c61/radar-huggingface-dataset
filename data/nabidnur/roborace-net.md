# Nabidnur/RoboRACE-Net

## Resumen

RACE-Net es una red neuronal de 213.889 parámetros diseñada para fusionar los informes de un enjambre de agentes robóticos cuando algunos de ellos mienten o están corruptos. Desarrollada por el autor Nabidnur en el marco del proyecto RoboRACE, la red recibe una matriz de puntuaciones `[T, J]` (T episodios recientes, J agentes) y devuelve las log-odds de éxito de cada episodio, asumiendo únicamente que la columna del receptor (el robot que consulta) es honesta. Es relevante porque aborda el problema de la inferencia de verdad sin etiquetas en sistemas multiagente con agentes bizantinos, un escenario habitual en robótica colaborativa y en pipelines de percepción con múltiples modelos.

Arquitectónicamente es un set transformer axial de 4 bloques con atención entre agentes dentro de un episodio y entre episodios dentro de un agente, sin codificaciones posicionales, lo que la hace equivariante a permutaciones tanto de episodios como de pares. El modelo se entrenó exclusivamente con enjambres sintéticos (6.000 pasos AdamW, batch 24, solo CPU) y se evalúa de forma zero-shot sobre enjambres reales de cinco cámaras puntuadas por Cosmos-Reason2-2B. Su tamaño reducido permite inferencia en CPU en milisegundos por ventana.

La relevancia actual radica en que ofrece una alternativa amortizada (una pasada de red) a los métodos iterativos de inferencia de verdad como Dawid-Skene o RACE basado en EM, con un rendimiento competitivo en escenarios con mayoría de mentirosos, aunque no supera a la mejor variante EM en los enjambres reales evaluados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Set transformer axial (4 bloques, d=64, 4 cabezas) |
| Parámetros totales | 213.889 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (acepta cualquier T y J; sin codificaciones posicionales) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | roborace-mixed (other) |
| Formato de pesos | safetensors, PyTorch |

## Arquitectura y entrenamiento

RACE-Net es un set transformer axial con cuatro bloques. Cada bloque aplica primero atención entre agentes dentro de un mismo episodio y después atención entre episodios dentro de un mismo agente, seguida de una MLP con dimensión 64 y 4 cabezas de atención. El modelo carece de codificaciones posicionales, por lo que es equivariante a permutaciones sobre episodios y sobre agentes. La entrada es una matriz `P` de forma `[T, J]` con puntuaciones en [0, 1]; el preprocesado convierte cada columna de agente a rangos y luego a probits dentro de la ventana, lo que lo hace invariante a cualquier mala calibración monótona y sin necesidad de etiquetas. La salida es un logit por episodio y la decisión se toma con umbral `> 0`.

El entrenamiento se realizó únicamente con enjambres sintéticos generados por `racenet.sample_batch`, que modela habilidad heterogénea de agentes, errores honestos correlacionados, sesgo afirmativo y un zoo de ataques con hasta J−1 mentirosos. No se usaron datos de benchmark, etiquetas ni salidas de agentes reales. Se ejecutaron 6.000 pasos de AdamW con batch 24, one-cycle LR 0.002, exclusivamente en CPU. La precisión sintética en held-out al final del entrenamiento fue del 92,7 %. La innovación principal es la amortización: una sola pasada de red sustituye la inferencia iterativa de EM, manteniendo robustez ante mentirosos consistentes (sus informes se invierten efectivamente y se reutilizan en lugar de descartarse).

## Capacidades

- Fusión de informes de múltiples agentes con puntuaciones en [0, 1] para producir log-odds de éxito por episodio.
- Inferencia de verdad sin etiquetas (label-free) con solo la suposición de que la columna del receptor es honesta.
- Robustez ante agentes invertidos, atascados, aleatorios, coludidos o replicados.
- Manejo de cualquier número de episodios T y cualquier número de agentes J gracias a la ausencia de codificaciones posicionales.
- Invariancia a mala calibración monótona de las puntuaciones mediante preprocesado de rangos a probits.
- Inferencia en CPU en milisegundos por ventana.
- No soporta tool calling, function calling, agentes multi-step, visión, audio ni generación de texto: es un módulo numérico especializado.

## Casos de uso

- Fusión de percepciones en robótica colaborativa: un robot receptor combina las puntuaciones de éxito de varias cámaras y pares VLM para decidir si una tarea de manipulación ha tenido éxito, resistiendo a sensores corruptos o descalibrados. Adecuado por su robustez bizantina y su bajo coste computacional.
- Detección de fallos en enjambres de drones: agregar informes de éxito de misión de múltiples agentes cuando algunos pueden estar comprometidos, usando la columna del receptor como ancla honesta.
- Control de calidad en pipelines de anotación crowdsourced: sustituir o complementar Dawid-Skene para inferir la etiqueta verdadera de cada ítem a partir de anotadores con fiabilidad desconocida y posible colusión.
- Monitorización de flotas de robots en almacén: evaluar en tiempo real si las tareas de picking se completaron correctamente fusionando señales de varios sensores y modelos de visión, con latencia de milisegundos en CPU.
- Validación de modelos de visión en producción: usar las puntuaciones de varios VLM como agentes y detectar cuándo uno o varios están dando respuestas invertidas o aleatorias sin necesidad de ground truth.
- Sistemas de votación tolerantes a fallos bizantinos: reemplazar el voto mayoritario en comités de modelos o sensores cuando se espera que hasta la mitad o más de los miembros fallen de forma sistemática.
- Investigación en inferencia de verdad: servir como baseline amortizado y ligero para comparar con métodos EM en experimentos con enjambres sintéticos y reales.

## Benchmarks y rendimiento

Resultados declarados por el autor (no verificados) en RoboRACE-Bench Track A, con cinco cámaras puntuadas por Cosmos-Reason2-2B y ground truth del estado físico final de un brazo robótico simulado. Precisión media en % sobre todas las celdas de ataque.

| Método | A0 procedural (dev) | SO-101 (test) | Panda (test nuevo) | SO-101, mentirosos ≥ 50% | Panda, mentirosos ≥ 50% |
|---|---:|---:|---:|---:|---:|
| Voto mayoritario | 68,5 | 59,8 | 62,2 | 46,7 | 48,8 |
| Dawid-Skene (crowd-kit) | 69,4 | 60,1 | 65,0 | 43,5 | 45,1 |
| Solo receptor | 81,4 | 71,3 | 74,5 | 71,3 | 74,5 |
| RACE online (EM) | 90,3 | 77,7 | 83,2 | 73,9 | 78,0 |
| RACE-S online (EM) | 91,2 | 82,7 | 87,0 | 79,8 | 83,6 |
| **RACE-Net (este modelo)** | **90,4** | **81,6** | **81,8** | **79,5** | **80,5** |
| Stacker con etiquetas (referencia) | 84,8 | 82,6 | 84,9 | 78,1 | 80,7 |

Resultados del model-index: 81,6 % de precisión media en SO-101 y 81,8 % en Panda, ambos sobre todas las celdas de ataque (no verificados).

Estudio de escalado (generador sintético independiente, 20 semillas por punto):

| Escenario | RACE-Net | RACE-S online | RACE online | Mayoría |
|---|---:|---:|---:|---:|
| 3 de 5 agentes mienten | 79,6 | 77,6 | 76,8 | 45,5 |
| 15 de 16 agentes mienten | 83,2 | 83,4 | 78,7 | 21,9 |
| Ventanas de 8 episodios | 67,5 | 72,8 | no disponible | no disponible |
| 24 agentes | 89,1 | 93,2 | 93,4 | no disponible |
| Receptor débil (55 % precisión, sin mentirosos) | 57,1 | 54,4 | no disponible | 81,8 |

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB; el modelo tiene 213.889 parámetros y el repo ocupa 0,0 GB.
- GPU recomendadas: ninguna necesaria; el autor reporta inferencia en CPU en milisegundos por ventana.
- Cabe en cualquier GPU consumer e incluso en entornos sin GPU.
- Opciones de despliegue: PyTorch con `torch`, `numpy` y `safetensors`; carga mediante `huggingface_hub.snapshot_download` e importación del módulo `racenet`. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: milisegundos por ventana en CPU según el autor; no se publican cifras concretas de throughput.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Precisión SO-101 | Licencia | Disponibilidad |
|---|---|---:|---|---:|---|---|
| RACE-Net | Set transformer amortizado | 213.889 | cualquier T y J | 81,6 % | roborace-mixed | Hugging Face |
| RACE-S online | EM iterativo | no disponible | no disponible | 82,7 % | no disponible | código en GitHub |
| RACE online | EM iterativo | no disponible | no disponible | 77,7 % | no disponible | código en GitHub |
| Dawid-Skene | EM clásico | no disponible | no disponible | 60,1 % | crowd-kit (open source) | librería crowd-kit |

## Limitaciones y advertencias

- Iguala a los métodos basados en EM pero no supera a la mejor variante (RACE-S online) en los enjambres reales de cámaras: 81,6 frente a 82,7 en SO-101 y 81,8 frente a 87,0 en Panda.
- Entrenado con un simulador de enjambres escrito a mano; donde los errores reales de los agentes difieren de ese simulador, RACE-S basado en EM puede ser mejor.
- El receptor debe ser honesto; es la única suposición del modelo y su violación invalida el anclaje.
- Debilidad abierta con receptores débiles: si el receptor tiene solo un 55 % de precisión y nadie miente, RACE-Net alcanza 57,1 %, muy por debajo del voto mayoritario (81,8 %); el anclaje a nivel de puntuación confía demasiado en un receptor débil.
- Con ventanas cortas (8 episodios) ningún método sin etiquetas supera al receptor solo; RACE-Net obtiene 67,5 % frente al 70,0 % del receptor.
- En enjambres grandes (24 agentes, mayor que cualquier enjambre de entrenamiento) rinde peor que RACE online (89,1 frente a 93,4).
- Licencia `roborace-mixed`: es necesario consultar `LICENSES.md` en el repositorio del dataset para conocer las restricciones de uso comercial.
- Los resultados de benchmarks están declarados por el autor y marcados como no verificados.
- No es un modelo de lenguaje: no genera texto, no soporta tool calling ni capacidades multimodales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Nabidnur/RoboRACE-Net
- Dataset RoboRACE-Bench: https://huggingface.co/datasets/Nabidnur/RoboRACE-Bench
- Licencias del dataset: https://huggingface.co/datasets/Nabidnur/RoboRACE-Bench/blob/main/LICENSES.md
- Showcase Space: https://huggingface.co/spaces/Nabidnur/RoboRACE
- Demo interactiva de inferencia de verdad: https://huggingface.co/spaces/Nabidnur/liars-are-information-demo
- Código en GitHub: https://github.com/Hisernberg/robotics
