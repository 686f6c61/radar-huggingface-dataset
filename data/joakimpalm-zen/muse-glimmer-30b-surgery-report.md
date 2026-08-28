# Joakimpalm-Zen/Muse-Glimmer-30B-surgery-report

## Resumen

El repositorio `Joakimpalm-Zen/Muse-Glimmer-30B-surgery-report` no contiene un modelo de lenguaje con pesos, sino un informe técnico de investigación (surgery report) que documenta un estudio de cirugía de modelos sobre el modelo denso `meta-models/Muse-Glimmer-30B` de Meta. El estudio, firmado por Joakimpalm-Zen, investiga si un modelo denso de 30B parámetros contiene estructura latente de tipo Mixture-of-Experts (MoE) que pudiera explotarse para acelerar la inferencia local. La metodología emplea experimentos preregistrados, con hipótesis y criterios de validación fijados antes de cada medición, y reporta nueve ejecuciones en una GPU de 24 GB.

El informe concluye que no existe estructura de expertos explotable a nivel de bloque en los pesos congelados del modelo, pero descubre redundancia a nivel de canal individual (per-channel) que permite saltar hasta un 65% de las lecturas de las FFN sin degradar la fidelidad. También documenta dos leyes sobre cómo se combinan los errores de diferentes tipos de poda a escala de modelo, y produce dos artefactos: un runtime experimental llamado `xyntetik-runner` y un conjunto de instrumentos de medición. La licencia es Apache-2.0, igual que la del modelo base.

## Especificaciones técnicas

Dado que el artefacto es un informe y no un modelo con pesos, las especificaciones corresponden al modelo base `Muse-Glimmer-30B` sobre el que se realizó el estudio, según la información pública de Meta y NVIDIA.

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso causal con FFN SwiGLU (19,968 canales por capa) y encoder de visión ViT-G/14 (~1.8B parámetros) |
| Parametros totales | 30B (modelo base) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 131K+ tokens (modelo base) |
| Tipos de cuantizacion | No disponible para el informe; el modelo base soporta cuantización estándar (FP16, INT8, etc.) |
| Idiomas soportados | No disponible (el informe no especifica idiomas) |
| Licencia | Apache-2.0 |
| Formato de pesos | No aplica (el informe no contiene pesos) |

## Arquitectura y entrenamiento

El informe no describe un entrenamiento de modelo, sino un estudio de cirugía de modelos sobre un modelo ya entrenado. El objeto de estudio es `Muse-Glimmer-30B`, un transformer denso con FFN SwiGLU de 19,968 canales por capa. El estudio aplica técnicas de poda de profundidad (depth pruning) y "healing" (reentrenamiento parcial para recuperar rendimiento tras la poda), así como análisis de activaciones para detectar estructura latente.

La metodología destaca por su rigor: todas las hipótesis, expectativas y criterios de eliminación se preregistraron en commits antes de cada ejecución. Se midieron métricas de fidelidad como acuerdo top-1 con margen (≥97%) y divergencia KLD media (≤0.05) contra el modelo padre congelado. El estudio también introduce una taxonomía de errores de poda según su comportamiento al componerse a escala de modelo: sub-lineal, aditivo o super-lineal.

## Capacidades

El artefacto no es un modelo generativo, sino un informe con resultados medidos. Sus capacidades son las de un estudio técnico:

- Documenta experimentos de extracción de estructura MoE en un modelo denso, con resultados cuantitativos.
- Proporciona una taxonomía de errores de poda (per-channel oracle, ruido de cuantización, routers, poda estática) y su comportamiento al componerse.
- Incluye instrumentos de medición que detectan sesgos en métricas de fidelidad (por ejemplo, la diferencia entre mediciones de una sola capa y a escala de modelo).
- Reporta dos artefactos: un runtime experimental (`xyntetik-runner`) y un conjunto de herramientas de medición.
- Presenta una tabla de preregistración con 12 hipótesis, de las cuales 6 resultaron incorrectas, documentando las correcciones.

## Casos de uso

- Optimización de inferencia local: los resultados sobre redundancia per-channel (hasta 65% de canales FFN omitibles) pueden guiar el desarrollo de runtimes que salten canales individuales en GPUs de consumo, reduciendo el ancho de banda de memoria.
- Diseño de estrategias de poda: la taxonomía de errores ayuda a predecir si una técnica de poda degradará el modelo de forma sub-lineal o super-lineal al escalar, evitando sorpresas en producción.
- Evaluación de routers y sparse experts: el estudio demuestra que los routers con ~20% de precisión corregida por azar producen errores sistemáticos que se amplifican con la profundidad, lo que sirve para descartar enfoques de routing en modelos densos.
- Investigación en interpretabilidad: el análisis de activaciones y la identificación de "picos de importancia" por canal (396x de diferencia) ofrecen una vía para entender qué canales son críticos en FFN SwiGLU.
- Desarrollo de herramientas de medición: los instrumentos creados (que detectan la mentira de las métricas de una sola capa) pueden reutilizarse en otros estudios de cirugía de modelos.
- Referencia metodológica: el protocolo de preregistración con criterios de eliminación fijos es un modelo a seguir para investigaciones empíricas en IA, reduciendo el sesgo de selección.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El informe contiene resultados de experimentos de fidelidad y rendimiento de poda, pero no son comparables a benchmarks de tareas. Los datos clave medidos incluyen:

| Preregistración | Resultado |
|---|---|
| Clustering supera a particiones aleatorias | Se mantiene, hasta 3.9x en 4 capas |
| Router supera a estático con igual FLOPs | Falla en modelo congelado; causa raíz identificada |
| Block-256 recupera ≥70% de la ventaja por canal | Falla en todas las capas y ordenaciones |
| Splice de una capa al 50% rompe identidad de token | Incorrecto en dirección buena: 96.9% acuerdo / 0.009 KLD |
| Compounding completo sub-lineal (0.26x a 52 capas) | Incorrecto: sub-lineal, 0.26x |
| Punto de operación en 70-95% activo | Incorrecto en dirección buena: 40% pasa |
| Block-oracle hereda absorción | Incorrecto: la granularidad, no el condicionamiento, compra absorción |
| Router compounding sub-lineal | Incorrecto: 1.65x super-lineal |
| Frontera curada alcanza 6-8% del decoder | Se mantiene: 6.34% |
| Cuantización + cirugía apilan aditivamente | Se mantiene: predicho 0.0484, medido 0.0481 |
| Conversión entrenada supera a estática por capa | Se mantiene en las 13 capas |
| Escalado de datos rescata el corte del 7.92% | Falla por 0.26%, con saturación medida |

## Requisitos de hardware

- El estudio se ejecutó en una GPU con 24 GB de VRAM (mencionado en el README como "one 24 GB GPU slice").
- No se especifican requisitos adicionales para reproducir el estudio, pero se requiere una GPU con al menos 24 GB para cargar el modelo base de 30B en cuantización FP16 o similar.
- Para el runtime `xyntetik-runner`, no se detallan requisitos específicos; se menciona que busca acelerar la inferencia en hardware commodity.
- El modelo base `Muse-Glimmer-30B` puede desplegarse con vLLM, llama.cpp, Ollama o TGI, según la documentación de Meta.

## Comparativa con modelos similares

No hay una comparativa directa con otros modelos, ya que el artefacto es un informe de investigación. Sin embargo, el modelo base `Muse-Glimmer-30B` puede compararse con otros modelos abiertos de tamaño similar:

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Muse-Glimmer-30B (base) | 30B | 131K+ | Apache-2.0 | Multimodal, tool calling, razonamiento multi-step |
| Llama 3.1 8B | 8B | 128K | Llama 3.1 Community License | Denso, no multimodal |
| Mixtral 8x7B | 46.7B total, 12.9B activos | 32K | Apache-2.0 | MoE, no multimodal |
| Qwen2.5-32B | 32B | 128K | Apache-2.0 | Denso, multilingüe |

El informe no ofrece datos comparativos de rendimiento con estos modelos, por lo que no se puede establecer una comparación cuantitativa.

## Limitaciones y advertencias

- El artefacto no es un modelo de lenguaje utilizable; es un informe técnico. No debe desplegarse como un sistema de generación de texto.
- Los resultados del estudio se basan en un único modelo (Muse-Glimmer-30B) y en nueve ejecuciones; la generalización a otros modelos densos no está probada.
- Seis de las doce hipótesis preregistradas resultaron incorrectas, lo que subraya la incertidumbre inherente a la cirugía de modelos.
- El estudio no cubre sesgos sociales, alucinaciones ni comportamientos de generación, ya que no evalúa el modelo como generador.
- La licencia Apache-2.0 permite uso comercial, pero el contenido del informe puede contener afirmaciones que requieren verificación independiente.
- El runtime `xyntetik-runner` se describe como experimental; no hay evidencia de que esté listo para producción.

## Enlaces

- Repositorio del informe: https://huggingface.co/Joakimpalm-Zen/Muse-Glimmer-30B-surgery-report
- Modelo base: https://huggingface.co/meta-models/Muse-Glimmer-30B
- Página oficial de Muse Glimmer en Meta: https://developer.meta.com/ai/models/muse-glimmer/
- Model card en NVIDIA NIM: https://build.nvidia.com/meta/muse-glimmer-30b/modelcard
- API y playground en Fireworks AI: https://fireworks.ai/models/fireworks/muse-glimmer-30b
- Informe relacionado (quant frontier): https://huggingface.co/Joakimpalm-Zen/Muse-Glimmer-30B-runner-quant-frontier-report
