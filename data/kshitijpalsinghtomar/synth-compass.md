# kshitijpalsinghtomar/synth-compass

## Resumen

Synth Compass (ESQSetEncoder) es un checkpoint neuronal de 137.897 parámetros desarrollado por Kshitij Pal (TENS LAB) que actúa como componente auxiliar dentro de un sistema de síntesis de programas simbólico-determinista llamado Synth. No es un modelo de lenguaje ni genera texto: predice priors sobre operadores, expresiones lambda y longitud de programa para reordenar el orden de visitación de un buscador simbólico basado en DeepCoder. Su función es puramente heurística y afecta únicamente al orden de enumeración, sin podar ramas ni predecir salidas de programas.

El modelo combina una representación de tarea de forma fija `[3, 4, 37]`, un embedding de posición de variable de 8 dimensiones, encoders de valores y ejemplos, y una proyección de tarea. Sobre esa representación se entrenaron tres cabezas: 15 operadores DeepCoder, 19 expresiones lambda y longitudes de programa de 1 a 6. La inferencia se ejecuta íntegramente en CPU con PyTorch, sin necesidad de GPU.

Su relevancia radica en que demuestra que un componente neuronal de menos de 140.000 parámetros puede mejorar marginalmente el rendimiento de un buscador simbólico en tareas de síntesis de programas bajo evaluación sintética con separación estricta de familias estructurales. La licencia Apache-2.0 y la ausencia de requisitos de GPU lo hacen accesible para experimentación, aunque su alcance es muy específico y su procedencia de entrenamiento es solo parcial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ESQSetEncoder: encoder de conjuntos con representación de tarea `[3, 4, 37]`, embedding de posición de variable (8 dim), encoders de valores y ejemplos, proyección de tarea y tres cabezas de predicción |
| Parametros totales | 137.897 (78.664 en cabezas de prior entrenadas; 59.233 en una rama legacy de ranking de candidatos no optimizada por este objetivo) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica: consume una representación de tarea de forma fija) |
| Tipos de cuantizacion | no disponible (checkpoint PyTorch en precisión nativa) |
| Idiomas soportados | no disponible (no procesa lenguaje natural) |
| Licencia | Apache-2.0 |
| Formato de pesos | PyTorch checkpoint (`esq_v3_converged.pt`) con SHA-256 verificado |

## Arquitectura y entrenamiento

ESQSetEncoder es una red neuronal pequeña que consume una representación de tarea de forma fija `[3, 4, 37]`, junto con un embedding de posición de variable de 8 dimensiones, encoders de valores y ejemplos, y una proyección de tarea. Sobre esa representación compartida se entrenaron tres cabezas: una para 15 operadores DeepCoder, otra para 19 expresiones lambda y otra para longitudes de programa entre 1 y 6. El objetivo de entrenamiento combinó entropía cruzada binaria para las cabezas de operadores y lambdas, y entropía cruzada ponderada para la longitud. La inferencia se ejecuta en CPU con PyTorch.

El checkpoint empaquetado (`esq_v3_converged.pt`, SHA-256 `a0f03d50...`) tiene procedencia parcial: se conocen los hashes del corpus y de la supervisión, pero no se retuvo el hash exacto del punto de entrada de entrenamiento ni el entorno de ejecución, por lo que la reproducción exacta del entrenamiento no está garantizada. El modelo no predice salidas de programas ni poda ramas simbólicas válidas; sus puntuaciones solo reordenan la visitación del buscador. La evaluación V6 se realizó sobre 196 tareas elegibles y 8.869 casos frescos con separación estricta de familias estructurales AST entre entrenamiento y evaluación.

## Capacidades

- Predicción de priors de operador sobre 15 operadores DeepCoder.
- Predicción de priors de expresión lambda sobre 19 expresiones soportadas.
- Predicción de prior de longitud de programa para longitudes de 1 a 6.
- Reordenación de la visitación de un buscador simbólico determinista sin podar ramas válidas.
- Inferencia en CPU sin GPU.
- No genera texto, no responde preguntas, no procesa lenguaje natural.
- No soporta tool calling, function calling ni razonamiento multi-paso en el sentido de un LLM.
- No predice salidas de programas ni actúa como oráculo de resultados.
- No dispone de modo thinking, visión ni audio.

## Casos de uso

- Investigación en síntesis de programas: usar el checkpoint como guía neuronal dentro del buscador Synth para estudiar cómo los priors aprendidos afectan al orden de enumeración en tareas DeepCoder con separación de familias estructurales.
- Reproducción de experimentos de neuro-simbiosis: cargar el checkpoint con el loader `NeuralGuide` de Synth para comparar la configuración guiada (V3) frente a la simbólica pura (V1) en cohortes sintéticas controladas.
- Docencia y divulgación: ilustrar con un modelo de 137.897 parámetros cómo un componente neuronal mínimo puede integrarse en un pipeline simbólico sin sustituirlo, útil para explicar arquitecturas neuro-simbólicas en cursos de IA.
- Evaluación de robustez de priors: ejecutar el modelo sobre tareas sintéticas con distribuciones de operadores y lambdas alteradas para medir hasta qué punto los priors reordenan la búsqueda de forma útil o contraproducente.
- Desarrollo de sistemas de síntesis con restricciones de hardware: desplegar la guía en entornos sin GPU (servidores CPU, portátiles, CI) donde un modelo neuronal grande no sería viable, aprovechando que la inferencia es puramente CPU.
- Auditoría de integridad de checkpoints: usar el par `esq_v3_converged.pt` y su sidecar SHA-256 como ejemplo práctico de verificación de artefactos y carga segura con `weights_only=True` en PyTorch 2.10.0 o superior.

## Benchmarks y rendimiento

Evaluación de estrés estructural V6 (cohorte estricta depth-4 con cero solapamiento, 196 tareas, 8.869 casos frescos):

| Configuracion | Coincidencias completas de tarea | Precision de tarea completa | Precision en casos frescos |
|---|---:|---:|---:|
| V1 simbólico | 60/196 | 30,61% | 70,03% |
| V3 guiado | 62/196 | 31,63% | 70,77% |
| V5 ablación | 70/196 | 35,71% | 74,36% |
| V5 completo | 71/196 | 36,22% | 74,34% |

La configuración V5 completa está 5,61 puntos porcentuales por encima de V1 simbólico en coincidencias completas de tarea. La comparación es observada entre configuraciones, no una estimación causal aislada del componente oráculo. Las ramas completa y de ablación difieren en 0,51 puntos porcentuales en precisión de tarea completa.

Divisiones externas estándar de DeepCoder (evaluaciones separadas del estrés V6):

| Split | Sistema | Coincidencias completas de comportamiento fresco | Precision en casos frescos |
|---|---|---:|---:|
| `SWITCH_CONCEPT_ORDER` (ESQ-03) | Synth | 144/180 (80,0%) | 88,9% (7.947/8.937) |
| `LENGTH_GENERALIZATION` (V3) | Synth | 118/180 (65,6%) | 78,7% |
| `LENGTH_GENERALIZATION` | Simbólico puro | 108/180 (60,0%) | 75,2% |

La confirmación de `LENGTH_GENERALIZATION` usó el checkpoint V3 original `1e5e086f`, distinto del checkpoint empaquetado `a0f03d50`; ese resultado no debe atribuirse al checkpoint empaquetado.

## Requisitos de hardware

- VRAM estimada para inferencia: 0 GB; el modelo se ejecuta en CPU.
- GPU recomendadas: no aplica; no requiere GPU.
- Cabe en cualquier GPU consumer, pero no la necesita; también funciona en CPU sin aceleración.
- Opciones de despliegue: PyTorch con el loader `NeuralGuide` de Synth (verifica SHA-256 y usa `weights_only=True`), o el CLI de Synth con `--mode guided --checkpoint checkpoints/esq_v3_converged.pt`.
- Requisito de seguridad: PyTorch 2.10.0 o superior para checkpoints personalizados o de terceros, debido a CVE-2026-24747 en el unpickler `weights_only` de versiones anteriores.
- Latencia y throughput: no disponible en la información proporcionada; al tratarse de una red de 137.897 parámetros en CPU, la latencia esperada es baja, pero no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---:|---|---|---|---|
| Synth Compass (ESQSetEncoder) | 137.897 | no aplica (representación de tarea fija) | Priors para búsqueda simbólica en síntesis de programas DeepCoder | Apache-2.0 | Hugging Face + GitHub de Synth |
| Buscador simbólico puro (V1) | 0 (simbólico) | no aplica | Enumeración simbólica determinista | no disponible | Incluido en Synth |
| Modelos LLM de código de propósito general | miles de millones | miles de tokens | Generación de código y razonamiento | varía | Hugging Face |

No se dispone de comparativas publicadas con otros modelos neuronales auxiliares de síntesis de programas en la información proporcionada.

## Limitaciones y advertencias

- El modelo no predice salidas de programas ni actúa como oráculo; solo reordena la visitación del buscador simbólico.
- No poda ramas válidas: la búsqueda sigue siendo simbólica, acotada y preservadora de ramas.
- La mejora observada en V6 es modesta (5,61 puntos porcentuales frente a V1 simbólico en coincidencias completas) y no es una estimación causal aislada del componente oráculo.
- La evaluación V6 es sintética, con separación de familias estructurales y oráculo sintético respaldado por ficheros; no es un benchmark oficial ExeDec ni una evaluación con oráculo humano.
- El resultado de `LENGTH_GENERALIZATION` corresponde al checkpoint V3 original `1e5e086f`, no al checkpoint empaquetado `a0f03d50`.
- Procedencia de entrenamiento parcial: se conocen hashes del corpus y la supervisión, pero no el hash del punto de entrada de entrenamiento ni el entorno de ejecución; la reproducción exacta no está garantizada.
- Riesgo de seguridad en la carga del checkpoint: CVE-2026-24747 afecta al unpickler `weights_only` de PyTorch anterior a 2.10.0; usar el loader `NeuralGuide` con verificación SHA-256 y no desactivar `weights_only`.
- El SHA-256 confirma identidad de bytes con el digest esperado, pero no es un análisis de malware; los escaneos de Hugging Face son best-effort y no una garantía de seguridad.
- No procesa lenguaje natural ni soporta idiomas; la fila de idiomas no aplica.
- Sin datos publicados de sesgos, alucinación o latencia; al no ser un modelo generativo, el riesgo de alucinación en el sentido habitual no aplica, pero los priors pueden estar mal calibrados fuera de la distribución de entrenamiento.
- Uso comercial permitido bajo Apache-2.0 para el código y los pesos de primera parte, sujeto a los términos de la licencia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kshitijpalsinghtomar/synth-compass
- Repositorio fuente de Synth: https://github.com/Kshitijpalsinghtomar/synth
- Organización TENS LAB: https://tenslab.dev
- Guía de escaneo de pickles de Hugging Face: https://huggingface.co/docs/hub/en/security-pickle
- Aviso de seguridad de PyTorch (GHSA-63cw-57p8-fm3p): https://github.com/pytorch/pytorch/security/advisories/GHSA-63cw-57p8-fm3p
