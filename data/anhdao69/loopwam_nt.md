# anhdao69/LoopWAM_NT

## Resumen

LoopWAM_NT es un conjunto de checkpoints de política robótica (policy weights) resultantes de los experimentos LoopWAM, un world-action model orientado a tareas de manipulación en el benchmark LIBERO. El repositorio, publicado por el usuario anhdao69, no es un modelo de lenguaje generalista sino una colección de 25 checkpoints de un sistema de control visuomotor entrenado para generar acciones a partir de observaciones e instrucciones en entornos simulados de robótica. Su relevancia es acotada: se trata de material de reproducibilidad experimental más que de un modelo listo para producción.

La arquitectura subyacente combina un backbone de vídeo (Wan) con un estudiante de política, y explora distintas configuraciones de "loops" de vídeo y acción (4/4, 4/1, 2/2, 1/4) y modos de agregación de KV (concat, mix). Los modelos base rondan los 584 millones de parámetros, con variantes densas de control de hasta 1.416 millones. El contexto no es una ventana de tokens textual al uso, sino un horizonte de observación-acción propio del entorno LIBERO.

El interés técnico reside en la ablación sistemática que documenta: inicializaciones alternativas, modos de KV, repetición de runs con distintas semillas y comparaciones pareadas de rendimiento. Los resultados publicados en la model card sitúan el mejor checkpoint evaluado en torno al 92,12% de éxito agregado en cuatro suites LIBERO, aunque buena parte de los checkpoints añadidos no han sido evaluados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | World-action model con backbone de vídeo Wan y estudiante de política; variantes con loops vídeo/acción y modos KV (concat, mix) |
| Parametros totales | 584.536.135 (v0 estándar); 584.536.423 (v0 4/1 mix); 1.416.114.247 (dense_s30) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (horizonte de observación-acción propio de LIBERO, no expresado en tokens) |
| Tipos de cuantizacion | no disponible (la model card menciona inferencia en BF16 eager) |
| Idiomas soportados | en |
| Licencia | no disponible |
| Formato de pesos | no disponible (checkpoints nativos con normalización, metadatos de entrenamiento y hashes de exportación) |

## Arquitectura y entrenamiento

LoopWAM se articula en torno a un backbone de vídeo Wan del que se inicializa un estudiante de política, con un esquema de "loops" que reparte cómputo entre predicción de vídeo y predicción de acción. Las variantes documentadas cubren proporciones 4/4, 4/1, 2/2 y 1/4 de loops de vídeo/acción, además de dos modos de agregación de KV: `concat` y `mix`. Los checkpoints estándar tienen 584.536.135 parámetros; las variantes densas de control (`dense_s12`, `dense_s30`) mantienen el mismo esquema de datos y normalización pero cambian el diseño, alcanzando 1.416.114.247 parámetros en el caso s30.

El entrenamiento se realizó sobre el benchmark LIBERO (suite `libero-long` y `libero-all-suites`), con runs completos de diez épocas, batch global 128 y semilla 42. Los tiempos reportados incluyen 10 h 58 min 46 s en dos H100 para el full-suite 1/4, y el uso de dos B200 para las variantes densas y de inicialización. Se documentan ablaciones de inicialización (`core_mean`, `core16_21`, `core_random`, `ffn_magnitude`, `no_video_pretraining`), verificaciones de equivalencia numérica (Inductor falló la equivalencia, por lo que se recomienda inferencia eager BF16) y comprobaciones de hash para garantizar que los pesos repetidos 4/4 no cambian entre publicaciones.

## Capacidades

- Generación de acciones de manipulación robótica a partir de observaciones visuales e instrucciones en el entorno LIBERO.
- Predicción conjunta de vídeo y acción mediante loops configurables (4/4, 4/1, 2/2, 1/4).
- Agregación de KV en dos modos (`concat` y `mix`) para combinar información entre loops.
- Evaluación multi-semilla (42, 43, 44) con métricas de tasa de éxito agregada por suite.
- Variantes de inicialización que permiten estudiar el efecto del preentrenamiento de vídeo (incluida la ausencia total de este).
- Controles densos (`dense_s12`, `dense_s30`) para comparar frente al esquema de loops.
- No se documentan capacidades de tool calling, agentes multi-paso, multilingüismo ni modalidades de audio.

## Casos de uso

- Reproducción de experimentos LIBERO: los checkpoints incluyen normalización, procedencia de entrenamiento y resúmenes de evaluación, lo que permite replicar las tasas de éxito publicadas con las semillas indicadas.
- Ablación de inicialización: comparar `core_random` (82,20%) frente a `ffn_magnitude` (92,12%) sobre el mismo protocolo de 6.000 episodios para aislar el efecto de la inicialización del estudiante.
- Estudio de modos KV: evaluar `kv-concat` (85,00% agrupado en tres semillas) frente a `kv-mix` (88,67%) en `libero-long` para decidir qué agregación usar en futuros entrenamientos.
- Investigación sobre world-action models: usar los pares vídeo/acción 4/1, 2/2 y 1/4 como base para analizar el reparto óptimo de cómputo entre predicción visual y control.
- Control denso de referencia: emplear `dense_s12` y `dense_s30` como líneas base sin loops en comparaciones de eficiencia y rendimiento.
- Verificación de equivalencia numérica: utilizar los checkpoints nativos sin optimizador para validar implementaciones de inferencia en BF16 eager frente a las exportaciones originales.

## Benchmarks y rendimiento

| Modelo / variante | Entorno | Semillas | Resultado |
|---|---|---|---|
| v0-video4-action1-kv-concat | libero-long | 42/43/44 | 83/86/86; agrupado 255/300 = 85,00% |
| v0-video4-action1-kv-mix | libero-long | 42/43/44 | 90/89/87; agrupado 266/300 = 88,67% |
| init_variants/core_random | 4 suites | 42/43/44 | 82,20% (4.932/6.000) |
| init_variants/ffn_magnitude | 4 suites | 42/43/44 | 92,12% (5.527/6.000) |
| v0-video4-action1-kv-concat (seed42 ampliado) | libero-long | 42 | 404/500 |
| v0-video4-action1-kv-concat (aligned, seed42 ampliado) | libero-long | 42 | 413/500 (pareado p=0,4814) |

El resto de checkpoints (full-suite 4/1, 2/2, 1/4, mix 4/1, densos y varias inicializaciones) figuran como "training only; evaluation not run" en la model card. No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; por tamaño (584 M parámetros en BF16) el peso de los parámetros ronda 1,2 GB, y la variante densa s30 (1.416 M) ronda 2,8 GB, sin contar activaciones ni buffers de vídeo.
- GPU empleadas en entrenamiento: dos H100 (runs estándar y `no_video_pretraining`/`core_random`) y dos B200 (variantes densas y de inicialización).
- Cabe en GPU de consumo: previsiblemente sí para los checkpoints de 584 M en BF16, aunque la model card no lo confirma ni especifica modelos concretos.
- Despliegue: la model card exige inferencia eager en BF16 para los modos KV nuevos, ya que Inductor no superó la prueba de equivalencia numérica. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.
- Requisito de código: los checkpoints `kv-concat` y `kv-mix` requieren la rama `KV_concat` del repositorio, revisión `3a89bfac5cfccad66bfebbe00014f7f739a78adc` o posterior compatible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LoopWAM_NT (v0, 4/4) | 584.536.135 | no disponible | 92,12% (mejor init evaluada) | no disponible | HuggingFace |
| LoopWAM_NT dense_s30 | 1.416.114.247 | no disponible | no evaluado | no disponible | HuggingFace |
| Alternativas de política robótica tipo diffusion/flow policy | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones de modelos comparables en la información proporcionada, por lo que la comparativa cuantitativa no está disponible.

## Limitaciones y advertencias

- La mayoría de checkpoints no han sido evaluados tras el entrenamiento; su rendimiento es desconocido.
- El alcance es exclusivamente el benchmark LIBERO en simulación; no hay evidencia de transferencia a robots reales.
- El idioma declarado es únicamente inglés (`en`), lo que limita instrucciones en otros idiomas.
- La licencia no está disponible, por lo que no puede asumirse uso comercial sin consultar al autor.
- Los modos KV nuevos requieren una rama de código específica y inferencia eager BF16; Inductor falló la equivalencia numérica.
- El repositorio ocupa 157,4 GB, lo que complica su descarga y almacenamiento.
- Riesgo de sobreajuste al protocolo de evaluación LIBERO y a las semillas documentadas.
- La decisión entre `concat` y `aligned` sigue siendo inconclusa según la propia model card (p=0,4814), y la cuadrícula ampliada no debe agruparse como evidencia independiente.
- No se documentan sesgos, tasas de alucinación ni comportamiento fuera de distribución; al ser un modelo de acción, los fallos se manifiestan como ejecuciones erróneas, no como texto incorrecto.

## Enlaces

- [HuggingFace: anhdao69/LoopWAM_NT](https://huggingface.co/anhdao69/LoopWAM_NT)
- [Repositorio GitHub: anhdao69/LoopWAM_NT](https://github.com/anhdao69/LoopWAM_NT)
- [Rama KV_concat](https://github.com/anhdao69/LoopWAM_NT/tree/KV_concat)
- [Informe de resultados LoopWAM v0 V4A1 KVconcat (2026-10-08)](https://github.com/anhdao69/LoopWAM_NT/blob/KV_concat/plans/performance/LoopWAM_v0_V4A1_KVconcat_20261008.md)
