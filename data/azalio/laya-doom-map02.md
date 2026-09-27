# azalio/laya-doom-map02

## Resumen

Laya Doom MAP02 es un conjunto de pesos especializados para jugar a FreeDoom (MAP01 y MAP02) desarrollado por el usuario azalio. Se trata de un fine-tuning supervisado del modelo base convaiinnovations/laya, concretamente sobre la revision `typed-decisions`. El modelo no procesa imagenes: recibe el estado del juego en formato textual y emite decisiones discretas (accion, objetivo, arma y movimiento), que un ejecutor externo traduce en rutas, apuntado y pulsaciones de botones.

El modelo se distribuye como un paquete de cinco checkpoints completos (~8 GiB en total) organizados como "cabezas" especializadas por tipo de pregunta (arma/enemigo/fuego, comando, objeto, movimiento en combate y mecanismo). En servidor se comparte un unico encoer tras verificar coincidencia bit a bit de sus pesos, y la cabeza se selecciona por nombre de pregunta, no por situacion de juego. La arquitectura esta etiquetada como `modernbert` y la libreria de carga es `laya`.

Es relevante ahora porque ejemplifica el uso de imitacion supervisada (sin RL ni optimizacion por recompensa) para construir agentes de decision en entornos 3D con estado textual. Los unicos datos de rendimiento publicados son dos partidas completas en macOS/MPS, con validacion de nivel superada en ambas, aunque el autor advierte explicitamente que un unico `seed` por mapa, en mapas vistos durante el desarrollo, no demuestra robustez en semillas o mapas desconocidos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder basado en ModernBERT (etiqueta `modernbert` del repo); recibe estado textual, no imagen |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos distribuidos en safetensors, sin GGUF publicado) |
| Idiomas soportados | en (estado de juego en ingles) |
| Licencia | Apache-2.0 (atribucion en `NOTICE`) |
| Formato de pesos | safetensors (5 checkpoints completos, ~8 GiB en total) |

Datos adicionales del repositorio: tamano del repo 8.4 GB, libreria `laya`, modelo base `convaiinnovations/laya` (revision `typed-decisions`, `1c5edc17a7acd8701df6fc341c0d179f1c62c982`), hash del conjunto `f8d2531bfeb4968058590d73ccf71b143df51855a6ab00406d30bb08ee078c49`.

## Arquitectura y entrenamiento

La arquitectura se apoya en un encoder tipo ModernBERT (segun las etiquetas del repositorio) sobre el modelo base Laya en su variante `typed-decisions`. El modelo consume descripciones textuales del estado del juego y produce respuestas tipadas que se reparten en cinco cabezas: `laya-map2-explicit-v2` (arma, enemigo y fuego en movimiento), `laya-map2-root-goals-v1` (comando), `laya-map2-goal-invariant-items-v1` (objeto), `laya-map2-explicit-movement-v1` (movimiento en combate) y `laya-map2-stable-goals-v1` (mecanismo). En el servidor de inferencia se emplea un unico encoder compartido, verificado por coincidencia bit a bit, y la cabeza se escoge por el nombre de la pregunta.

El entrenamiento es de type supervised imitation learning: se usan estados de partidas reales con etiquetas de un experto offline, sin optimizacion por recompensa ni RL. Las etapas tardias incorporan correcciones sobre estados visitados por el propio modelo y variantes con un objetivo actual distinto pero manteniendo los hechos del mundo. En las ultimas cabezas especializadas el encoder esta congelado. Para la cabeza de comando se emplearon 5122 preguntas de entrenamiento y 2458 de validacion, cuatro epocas con LR 5e-5, seleccionandose la cuarta. El experto no interviene durante las partidas de validacion.

## Capacidades

- Seleccion de accion, objetivo, arma y movimiento en combate dentro de FreeDoom.
- Decision sobre cambio de arma, uso de mecanismos, recogida de objetos y navegacion hacia la salida.
- Funcionamiento a partir de estado textual del juego, sin necesidad de procesar píxeles.
- Coordinacion con un ejecutor externo que conoce la geometria del mapa, la salida, las llaves, los mecanismos y las coordenadas del arma.
- Seleccion dinamica de cabeza segun la pregunta (arma, comando, objeto, movimiento, mecanismo) sobre un encoder compartido.
- Soporte de ejecucion en tiempo real con latencias de decision subsegundo (datos de MPS).
- No se documenta soporte de tool calling, function calling, agentes multi-paso genericos, vision, audio ni modo de razonamiento explicito.

## Casos de uso

- Investigacion en imitacion supervisada para agentes de juego: el modelo permite estudiar como un policy entrenado solo con etiquetas de experto (sin RL) resuelve tareas de decision en entornos 3D, comparando etapas de correccion sobre estados propios frente a datos puramente offline.
- Benchmark de decision-making con estado textual: sirve como referencia reproducible para medir si un agente que recibe descripciones de texto (y no píxeles) puede completar mapas de Doom, con el ejecutor separado de la politica.
- Desarrollo de agentes jerarquicos: la separacion entre cabezas de comando y cabeza de movimiento encaja en arquitecturas donde una politica de alto nivel emite ordenes y un ejecutor de bajo nivel las traduce en acciones concretas.
- Analisis de comportamiento y depuracion: los informes de partida (tiempo de salida, muertes, mediana de decision por mapa) permiten auditar donde falla la politica (por ejemplo, exceso de tiempo sin descubrir nuevas zonas o inmovilidad).
- Experimentacion con generalizacion: dado que el autor senala que los resultados no prueban robustez fuera de las semillas y mapas de desarrollo, el modelo es util para evaluar deriva de rendimiento con `seed` distintos y mapas no vistos.
- Integracion en pipelines de evaluacion de agentes: puede cargarse mediante el servidor `doomLaya` para automatizar partidas de prueba sobre FreeDoom MAP01 y MAP02 con control de revision y verificacion de hashes.
- Reproduccion de resultados: el repositorio incluye hashes de pesos y un `SHA256SUMS`, lo que facilita replicar exactamente la configuracion de los cinco checkpoints en un entorno controlado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. Los unicos datos publicados son dos partidas completas en macOS/MPS, skill 3, en tiempo real, verificadas el 26 de septiembre de 2026:

| Mapa | Seed | Tiempo de salida | Muertes | Mediana de decision |
|---|---:|---:|---:|---:|
| MAP01 → MAP02 | 48 | 174,914 s | 0 | 384,72 ms |
| MAP02 → MAP03 | 54 | 835,600 s | 2 | 430,47 ms |

En ambos casos `experiment_valid=true` y `level_completed=true`, pero el resultado global `passed=false`: en MAP01 se superaron los umbrales de inmovilidad y de tiempo sin descubrir nueva zona; en MAP02, los de tiempo sin nueva zona y de cambio de arma. El propio autor indica que se trata de una unica partida por mapa, en mapas usados durante el desarrollo, por lo que no demuestra robustez ante otras semillas o mapas desconocidos. Los pesos de este conjunto no se compararon con Jev en la misma configuracion; la comparacion publicada de v0.1.0 corresponde a una Laya v3 anterior y a otro ejecutor.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. El conjunto completo ocupa ~8 GiB en disco repartidos en cinco checkpoints (del orden de ~1,6 GiB por checkpoint); en el servidor se usa un unico encoder compartido, lo que reduce la huella efectiva respecto a cargar las cinco redes completas por separado.
- GPU recomendadas: no especificadas en la informacion disponible. Los unicos datos de ejecucion publicados corresponden a macOS/MPS, lo que confirma funcionamiento en Apple Silicon.
- Encaje en GPU de consumo: no confirmado oficialmente. Por tamano de checkpoint y por haberse ejecutado en MPS, es plausible en GPUs de consumo, pero debe considerarse una inferencia y no un dato verificado.
- Opciones de despliegue: servidor `doomLaya` (`serve_doom_laya.py`) con `--device auto`. El autor indica explicitamente que el conjunto se carga mediante el servidor de doomLaya y no con `transformers.pipeline`.
- Latencia y throughput: mediana de resolucion de decision de 384,72 ms (MAP01) y 430,47 ms (MAP02) sobre macOS/MPS. No se publican cifras de throughput ni latencias en GPU dedicada.

## Comparativa con modelos similares

| Modelo | Relacion | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| azalio/laya-doom-map02 | fine-tuning especializado | no disponible | no disponible | 2 partidas completas publicadas (ver tabla anterior) | Apache-2.0 | HuggingFace |
| convaiinnovations/laya (`typed-decisions`) | modelo base | no disponible | no disponible | no disponible | no disponible en la informacion aportada | referenciado como base |
| Jev | alternativa mencionada por el autor | no disponible | no disponible | sin comparacion en igual configuracion | no disponible | no disponible |

No se dispone de datos suficientes para una comparacion cuantitativa con alternativas de la misma categoria. El propio autor aclara que no se ha comparado este conjunto de pesos con Jev en una configuracion identica.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la informacion disponible.
- Riesgo de alucinacion: no aplica en el sentido generativo clasico, pero si existe riesgo de decisiones erroneas; el autor menciona posibles bucles, seleccion incorrecta de objetos y muerte del jugador.
- Generalizacion limitada: los resultados se obtuvieron en un unico `seed` por mapa y en mapas vistos durante el desarrollo. No hay evidencia de robustez en mapas desconocidos ni con otras semillas.
- Umbrales de calidad no superados: la verificacion global devuelve `passed=false` por exceso de inmovilidad, tiempo sin descubrir nueva zona y falta de cambio de arma.
- Dependencia de un ejecutor externo: el modelo no juega solo; necesita un ejecutor que aporte geometria del mapa, salida, llaves, mecanismos y coordenadas del arma. Ademas, la transicion a MAP03 requiere un parche de ViZDoom incluido en doomLaya.
- Idiomas: el modelo esta etiquetado unicamente para ingles; no se documenta multilingueismo.
- Carga no estandar: no es compatible con `transformers.pipeline`; debe servirse con doomLaya.
- Licencia: Apache-2.0 permite uso comercial, pero requiere mantener la atribucion indicada en `NOTICE` y respetar las condiciones de los componentes base de Laya.
- Trazabilidad: conviene verificar `SHA256SUMS` y los hashes de `question-heads.json` antes de desplegar, dado que la seleccion de cabeza depende del nombre de pregunta y no del contexto de juego.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/azalio/laya-doom-map02
- Modelo base: https://huggingface.co/convaiinnovations/laya
- Repositorio doomLaya: https://github.com/azalio/doomLaya
- Release v0.2.0 (videos e informes): https://github.com/azalio/doomLaya/releases/tag/v0.2.0
- Documentacion MAP02: https://github.com/azalio/doomLaya/blob/v0.2.0/docs/MAP02.md
