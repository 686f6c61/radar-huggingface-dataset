# Jeesup/svd-safety-l2_remove40_swapgapiter_evfront_b010_r02

## Resumen

Este repositorio contiene un checkpoint derivado de `meta-llama/Llama-2-7b-chat-hf` comprimido con SVD-LLM, que elimina el 40,02 % de los parametros densos (fraccion resultante declarada: 0,5998), y despues editado con dos rondas de una tecnica de intercambio de parametros neutro en parametros ("parameter-neutral swap"), seleccionada mediante la regla `gap_iter`. Lo publica el usuario de HuggingFace Jeesup como artefacto de investigacion, no como modelo conversacional de proposito general.

El objetivo del trabajo es medir como la compresion por descomposicion en valores singulares degrada el comportamiento de seguridad de un modelo alineado y que regla de seleccion de componentes repara mejor ese dano. Este checkpoint es una celda concreta de una malla experimental sobre reglas de seleccion y presupuestos de restauracion, con semilla 42 y un presupuesto total declarado del 1,000 % de los parametros densos (de los cuales esta celda aplica 2 de 10 rondas, a 0,100 % por ronda).

Es relevante ahora porque cuantifica el compromiso entre seguridad y utilidad en modelos comprimidos, un escenario habitual cuando se despliegan pesos reducidos en hardware limitado. Sus metricas publicadas (ASR de 0,3150 en AdvBench y 0,2550 en StrongREJECT, con 0,0576 de sobrerrechazo macro) lo sitúan como sujeto experimental deliberadamente degradado en seguridad, no como asistente desplegable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only derivado de Llama 2 (checkpoint de `meta-llama/Llama-2-7b-chat-hf`); no se detallan mas modificaciones estructurales en la informacion proporcionada |
| Parametros totales | 6.738.415.616 segun safetensors; la model card declara una fraccion de parametros densos de 0,5998 (60,0 %) tras eliminar el 40,02 % |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | no disponible; el repositorio solo publica pesos safetensors |
| Idiomas soportados | no disponible; no se declara lista de idiomas |
| Licencia | Llama 2 Community License (`LICENSE.txt` y `USE_POLICY.md` incluidos en el repositorio) |
| Formato de pesos | safetensors (libreria `transformers`) |
| Modelo base | `meta-llama/Llama-2-7b-chat-hf` |
| Metodo de compresion | SVD-LLM, 40,02 % de parametros eliminados |
| Regla de seleccion | `gap_iter` |
| Presupuesto de restauracion | 1,000 % de los parametros densos (total de la ejecucion); 0,100 % por ronda |
| Componentes restaurados | 1307 |
| Componentes sustituidos | 1289 |
| Parametros intercambiados | 12.939.520 (0,20 % de los parametros de proyeccion densos) |
| Valor de intercambio | `insert` (solo valor de insercion; desalojo ordenado por sigma) |
| Semilla | 42 |
| Rondas iterativas aplicadas | 2 de 10 |
| Tamano del repositorio | 13,5 GB |
| Pipeline | text-generation |
| Compatibilidad declarada | `text-generation-inference`, `endpoints_compatible` |
| Fecha de creacion | 2026-09-17 |

## Arquitectura y entrenamiento

La arquitectura de partida es la de Llama-2-7b-chat: un transformer decoder-only con normalizacion RMSNorm, activacion SwiGLU y atencion causal. Sobre ese checkpoint no hay reentrenamiento: la model card describe un proceso de posprocesado en dos fases. La primera es una compresion SVD-LLM que elimina el 40,02 % de los parametros, lo que deja el modelo en el 60,0 % de los parametros densos. La segunda es un procedimiento iterativo de intercambio de parametros "neutro en parametros": en cada ronda se restauran componentes seleccionados por la regla `gap_iter`, con un limite de 0,1 % de los parametros densos por ronda y un presupuesto global del 1,0 %. En esta celda se han aplicado 2 de las 10 rondas previstas, con 1307 componentes restaurados y 1289 sustituidos.

Los detalles concretos del dataset de compresion, del calibrado y de cualquier fase de alineamiento adicional (RLHF, DPO) no se documentan en la informacion disponible; el checkpoint es un resultado intermedio de una ejecucion mas larga, con semilla fija 42, y no se indica ni el numero de tokens de calibracion ni la composicion de datos. El propio autor advierte que varias ramas de la malla estan deliberadamente degradadas en seguridad respecto a Llama-2-7b-chat y que este artefacto sirve para medir el compromiso seguridad/utilidad, no para desplegarse.

## Capacidades

- Generacion de texto conversacional: hereda el formato de chat del modelo base, con plantilla de dialogo de Llama 2.
- Razonamiento y conocimiento general: capacidades no reevaluadas en este checkpoint; la model card solo publica metricas de seguridad y sobrerrechazo.
- Soporte de tool calling o function calling: no documentado en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado en la informacion proporcionada.
- Capacidades multilingues: no documentadas; no se declara lista de idiomas.
- Capacidades multimodales (vision, audio): no disponibles; el modelo es exclusivamente de texto.
- Modo de razonamiento explicito ("thinking mode"): no disponible.
- Comportamiento de seguridad: es una capacidad medida y parcialmente degradada de forma intencionada (ASR de 0,3150 en AdvBench y 0,2550 en StrongREJECT con juez HarmBench).
- Tasa de sobrerrechazo macro: 0,0576 medida con WildGuard.
- Compatibilidad de servicio: etiquetado para `text-generation-inference` y `endpoints_compatible`.

## Casos de uso

- Estudio de degradacion de seguridad por compresion: usar este checkpoint como celda de referencia para medir cuanto sube la tasa de exito de ataque (ASR) al eliminar el 40,02 % de parametros con SVD-LLM, comparando contra Llama-2-7b-chat sin comprimir.
- Evaluacion comparativa de reglas de seleccion de componentes: la regla `gap_iter` puede contrastarse con otras ramas de la misma malla experimental para determinar que criterio repara mejor el comportamiento de rechazo con un presupuesto fijo del 1,0 %.
- Red teaming y auditoria de modelos comprimidos: alimentar el modelo con conjuntos tipo AdvBench o StrongREJECT y reproducir los ASR publicados con el mismo juez (HarmBench) para validar la metodologia.
- Analisis de sobrerrechazo (over-refusal): emplear la metrica de 0,0576 con WildGuard para estudiar si la restauracion de componentes recupera utilidad al precio de rechazar peticiones benignas.
- Interpretabilidad de subespacios SVD: los 1307 componentes restaurados y los 1289 sustituidos son un conjunto etiquetado que permite analizar que direcciones de las proyecciones densas afectan a la seguridad.
- Ablacion controlada de presupuesto: repetir el experimento variando el chunk por ronda (0,1 % frente a otros valores) y el numero de rondas (2 de 10 en esta celda) para trazar la curva de recuperacion.
- Reproduccion academica de compresion y edicion de pesos: dado que el checkpoint tiene semilla 42 y registro completo de procedencia, sirve como punto de partida verificable en cursos o articulos sobre compresion de LLM.
- No recomendado como asistente en produccion: la propia model card lo describe como sujeto experimental y no como modelo desplegable.

## Benchmarks y rendimiento

| Metrica | Valor | Juez / metodo |
|---|---|---|
| AdvBench ASR | 0,3150 | HarmBench judge |
| StrongREJECT ASR | 0,2550 | HarmBench judge |
| Macro over-refusal | 0,0576 | WildGuard |

No se han publicado en la informacion disponible resultados de MMLU, HumanEval, GSM8K ni de otras pruebas de capacidad general, ni cifras comparativas del modelo base sin comprimir. Tampoco se aportan valores de perplejidad, latencia o throughput.

## Requisitos de hardware

- VRAM estimada para inferencia (calculada a partir de los 6.738.415.616 parametros declarados, no publicada por el autor): en FP16/BF16 los pesos ocupan aproximadamente 13,5 GB, coherente con el tamano de repositorio de 13,5 GB; en 8 bits, unos 6,7-7 GB; en 4 bits, unos 3,4-4 GB. Hay que sumar la cache KV, cuyo tamano depende del contexto y del lote.
- GPU de datacenter recomendadas: A100 (40 o 80 GB), H100 y L40S para servir en FP16 con lotes moderados; A100 40 GB es suficiente para los pesos sin cuantizar mas cache KV.
- GPU de consumo: una RTX 4090 (24 GB) puede cargar los pesos en FP16 con contexto corto; tarjetas de 8-12 GB (RTX 3060 12 GB, RTX 4070) requieren cuantizacion a 4 bits, que no se distribuye en el repositorio.
- Opciones de despliegue: `transformers` de forma nativa; TGI, dado que el repositorio esta etiquetado con `text-generation-inference` y `endpoints_compatible`. Para llama.cpp u Ollama seria necesaria una conversion a GGUF que no se proporciona. La compatibilidad con vLLM no se confirma en la informacion disponible.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | ASR AdvBench | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Jeesup/svd-safety-l2_remove40_swapgapiter_evfront_b010_r02` | 6.738.415.616 (safetensors); fraccion densa declarada 0,5998 | no disponible | 0,3150 | Llama 2 Community License | HuggingFace, 0 descargas y 0 likes en el momento del analisis |
| `meta-llama/Llama-2-7b-chat-hf` | 6.738.415.616 | no disponible en la informacion proporcionada | no disponible | Llama 2 Community License | HuggingFace |
| Otras celdas de la malla SVD-LLM del mismo autor | no disponible | no disponible | no disponible | no disponible | no identificadas en la busqueda realizada |

Nota: el recuento de parametros en safetensors coincide exactamente con el de Llama-2-7b-chat denso, mientras que la model card declara una fraccion de parametros de 0,5998 tras eliminar el 40,02 %. Esta discrepancia no se explica en la informacion proporcionada y conviene verificarla antes de usar el checkpoint en cualquier comparacion cuantitativa.

## Limitaciones y advertencias

- Seguridad degradada de forma intencionada: la propia model card indica que la compresion por si sola eleva la tasa de exito de ataque y que varias ramas de la malla estan deliberadamente degradadas respecto a Llama-2-7b-chat.
- Tasas de ataque medidas elevadas: 0,3150 en AdvBench y 0,2550 en StrongREJECT, ambas con juez HarmBench. No es un modelo apto para exposicion publica sin filtros externos.
- Checkpoint intermedio: corresponde a 2 de 10 rondas de una ejecucion mas larga, por lo que no representa el resultado final del experimento ni el mejor punto del presupuesto de restauracion.
- Artefacto de investigacion: el autor indica explicitamente que no es un modelo conversacional de proposito general y que debe evaluarse antes de extraer conclusiones.
- Riesgo de alucinacion: no se aportan datos de evaluacion; se hereda el riesgo del modelo base y puede aumentar con la compresion SVD, sin que la informacion disponible lo cuantifique.
- Idiomas y contexto: no se declara lista de idiomas ni longitud de contexto; el modelo base esta orientado principalmente al ingles.
- Restricciones de licencia: Llama 2 Community License, con las obligaciones de `LICENSE.txt` y `USE_POLICY.md` incluidos en el repositorio, incluida la clausula de uso aceptable y las condiciones de atribucion ("Built with Llama 2"). El uso comercial esta sujeto a los terminos de dicha licencia.
- Trazabilidad limitada: no se documentan datos de calibracion de la compresion, hiperparametros completos ni proceso de evaluacion, lo que dificulta la reproducibilidad exacta.
- Inconsistencia pendiente: la diferencia entre el recuento de parametros almacenado y la fraccion densa declarada.
- Repositorio sin adopcion: 0 descargas y 0 likes en el momento del analisis, sin comunidad que haya validado los resultados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Jeesup/svd-safety-l2_remove40_swapgapiter_evfront_b010_r02
- Modelo base: https://huggingface.co/meta-llama/Llama-2-7b-chat-hf
- Licencia y politica de uso: `LICENSE.txt` y `USE_POLICY.md` incluidos en el repositorio del modelo.
- Paper de SVD-LLM y de AdvBench, StrongREJECT, HarmBench y WildGuard: no disponibles en la informacion proporcionada.
- La busqueda web realizada no devolvio enlaces relevantes sobre este modelo; los resultados obtenidos correspondian a paginas administrativas de la Region de Liguria (Italia) sin relacion con el modelo.
