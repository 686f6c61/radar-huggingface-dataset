# Jeesup/svd-safety-l31_remove20_swapgapiter_b010_r05

## Resumen

`Jeesup/svd-safety-l31_remove20_swapgapiter_b010_r05` es un checkpoint derivado de `meta-llama/Llama-3.1-8B-Instruct`, comprimido mediante SVD-LLM hasta el 80,0 % de sus parametros densos (eliminacion del 20,02 %) y despues editado con 5 de las 10 rondas de un procedimiento iterativo de intercambio de parametros neutrales («parameter-neutral swap»), seleccionado con la regla `gap_iter`. Lo publica el usuario Jeesup como artefacto de investigacion, no como modelo conversacional de proposito general.

El problema que aborda es concreto: la compresion por SVD degrada el comportamiento de seguridad de un modelo alineado, elevando la tasa de exito de ataques (ASR). El estudio mide esa degradacion y prueba que regla de seleccion de componentes repara mejor la seguridad sin recuperar los parametros completos. Cada checkpoint del repositorio es una celda de una cuadricula de reglas de seleccion y presupuestos de restauracion.

El modelo conserva la arquitectura del Llama 3.1 8B Instruct original (transformer decoder-only) y se distribuye exclusivamente en safetensors, con licencia Llama 3.1 Community License. Su relevancia es acotada: sirve para reproducir y comparar el compromiso entre seguridad y utilidad en modelos comprimidos, no para desplegarse como asistente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de la familia Llama 3.1; checkpoint derivado por compresion SVD-LLM y edicion posterior sobre el modelo base |
| Parametros totales | 8.030.261.248 segun el recuento de safetensors; la model card declara una fraccion de parametros densos resultante de 0,7998 |
| Parametros activos | No aplica: modelo denso, no es MoE |
| Longitud de contexto | No disponible en la informacion proporcionada (heredada del modelo base) |
| Tipos de cuantizacion | No disponible: el repositorio solo publica pesos safetensors; no se incluyen variantes GGUF, AWQ, GPTQ ni FP8 |
| Idiomas soportados | No disponible |
| Licencia | Llama 3.1 Community License (`license: llama3.1`); se incluyen `LICENSE` y `USE_POLICY.md` en el repositorio |
| Formato de pesos | safetensors (repositorio de 16,1 GB); compatible con `transformers` |

## Arquitectura y entrenamiento

No hay entrenamiento nuevo: el checkpoint es el resultado de dos transformaciones posteriores al modelo base. Primero, una compresion SVD-LLM que elimina el 20,02 % de los parametros densos, dejando una fraccion resultante de 0,7998. Despues, un procedimiento iterativo de intercambio de parametros con presupuesto total del 1,000 % de los parametros densos, dividido en 10 rondas de 0,100 % cada una. Este checkpoint corresponde a la ronda 5 de 10, por lo que es un punto intermedio de una ejecucion mas larga y no el resultado final.

La edicion se concreta en 5.391 componentes restaurados y 5.391 componentes sustituidos, con 34.873.344 parametros insertados, lo que equivale al 0,50 % de los parametros densos de proyeccion. El valor de intercambio es `insert` (solo el valor de insercion) con desalojo ordenado por sigma, la regla de seleccion es `gap_iter` y la semilla es 42.

No se documentan en la informacion disponible ni el numero de tokens de entrenamiento, ni la composicion del dataset, ni fases de RLHF o DPO. La innovacion tecnica del artefacto no esta en la arquitectura, sino en la metodologia de reparacion de seguridad post-compresion y en la metrica de compromiso que permite comparar reglas de seleccion.

## Capacidades

- Generacion de texto conversacional en formato chat, heredada del modelo base `meta-llama/Llama-3.1-8B-Instruct`.
- Respuesta a peticiones de instrucciones con un comportamiento de rechazo medido: 0,0250 de ASR en AdvBench y 0,0350 en StrongREJECT, ambos con juez HarmBench.
- Perfil de sobre-rechazo cuantificado: 0,2768 de macro over-refusal segun WildGuard.
- Utilidad como sujeto experimental para medir el efecto de la compresion SVD sobre el comportamiento de seguridad.
- Soporte de tool calling o function calling: no disponible en la informacion proporcionada.
- Capacidades de agente o razonamiento multi-paso: no disponibles en la informacion proporcionada.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Capacidades especiales (modo thinking, vision, audio): no disponibles; no se declara ninguna.
- Exposicion via `text-generation-inference` y compatibilidad con endpoints, segun las etiquetas del repositorio.

## Casos de uso

- Investigacion sobre seguridad en modelos comprimidos: el checkpoint permite medir cuanto sube la tasa de exito de ataques al eliminar el 20,02 % de los parametros mediante SVD-LLM, comparando contra el modelo base sin comprimir.
- Evaluacion de reglas de seleccion de componentes: al ser una celda de la regla `gap_iter`, sirve para contrastar si esa heuristica repara mejor la seguridad que otras reglas de la misma cuadricula con presupuestos equivalentes.
- Analisis del compromiso seguridad/utilidad: combinando el ASR bajo (0,0250 / 0,0350) con el sobre-rechazo macro (0,2768) se puede cuantificar el coste en utilidad de cada ronda de restauracion.
- Interpretabilidad de mecanismos de rechazo: los 5.391 componentes restaurados y los 5.391 desalojados identifican candidatos concretos donde se codifica el comportamiento de seguridad, utiles para estudios de localizacion de circuitos.
- Red-teaming automatizado y calibracion de jueces: al publicar resultados con juez HarmBench, el checkpoint sirve como punto de referencia conocido para validar pipelines de evaluacion de ataques.
- Reproducibilidad experimental: con semilla 42, presupuesto por ronda del 0,100 % y numero de ronda documentados, otra persona puede replicar exactamente esta celda y trazar la curva por rondas.
- Estudio de despliegue en el borde: si la fraccion comprimida de 0,7998 se confirma en los pesos finales, es un caso de analisis de cuanto margen de memoria se gana y a que coste en seguridad.
- Auditoria de checkpoints intermedios: al ser la ronda 5 de 10, permite estudiar si la reparacion de seguridad es monotona ronda a ronda o si se degrada en algun punto intermedio.

## Benchmarks y rendimiento

| Benchmark | Metrica | Valor de este checkpoint | Referencia |
|---|---|---|---|
| AdvBench | ASR (juez HarmBench) | 0,0250 | No disponible en la informacion proporcionada |
| StrongREJECT | ASR (juez HarmBench) | 0,0350 | No disponible en la informacion proporcionada |
| WildGuard | Macro over-refusal | 0,2768 | No disponible en la informacion proporcionada |

En las metricas de ASR, un valor mas bajo indica mejor comportamiento de seguridad. No se han publicado en la informacion disponible resultados de benchmarks de capacidad general (MMLU, HumanEval, GSM8K u otros), ni comparaciones numericas contra el modelo base o contra otras celdas de la cuadricula.

## Requisitos de hardware

- VRAM estimada en precision completa: los 8.030.261.248 parametros declarados en safetensors equivalen a aproximadamente 16,1 GB en FP16, a los que hay que sumar la cache KV y el overhead del runtime.
- GPU de 24 GB (RTX 3090, RTX 4090, A10G, L4 con 24 GB): deberian poder cargar el modelo en FP16, con margen limitado para contextos largos o lotes grandes.
- GPU profesionales: A100 en 40 GB u 80 GB, H100 y L40S ofrecen margen suficiente para FP16 y para lotes mayores.
- GPU de consumo con 16 GB o menos: no cabe en FP16; requeriria cuantizacion, que no se publica en este repositorio.
- Despliegue: `transformers` de forma nativa; el repositorio esta etiquetado para `text-generation-inference` y como compatible con endpoints. `vLLM` es una opcion habitual para modelos Llama en safetensors. `llama.cpp` u `Ollama` exigirian convertir el checkpoint a GGUF por cuenta propia, ya que no se distribuye ese formato.
- Latencia y throughput: no disponibles. No se publican mediciones de tokens por segundo ni de tiempo hasta el primer token.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Estado | Metricas de seguridad |
|---|---|---|---|---|---|
| Este checkpoint (`svd-safety-l31_remove20_swapgapiter_b010_r05`) | 8.030.261.248 segun safetensors; fraccion densa declarada 0,7998 | No disponible | Llama 3.1 Community License | Publicado, 0 descargas, 0 likes | AdvBench ASR 0,0250; StrongREJECT ASR 0,0350; over-refusal 0,2768 |
| `meta-llama/Llama-3.1-8B-Instruct` (modelo base) | 8.030.261.248 | No disponible en esta informacion | Llama 3.1 Community License | Publicado y ampliamente desplegado | No disponible en la informacion proporcionada |
| Otras celdas de la misma cuadricula (otras reglas de seleccion y presupuestos) | No disponible | No disponible | Llama 3.1 Community License | No disponibles en la informacion proporcionada | No disponible |
| Baseline de compresion SVD-LLM sin edicion posterior | No disponible | No disponible | No disponible | No disponible en la informacion proporcionada | No disponible |

No se dispone de datos suficientes para comparar con alternativas de otros autores en la misma categoria de 8B comprimidos.

## Limitaciones y advertencias

- No es un asistente desplegable: el propio autor lo describe como artefacto de investigacion y sujeto experimental, no como modelo de proposito general.
- Varias ramas de la cuadricula estan deliberadamente degradadas en seguridad respecto a Llama-3.1-8B-Instruct; aunque esta celda concreta presenta ASR bajo, la advertencia aplica al ecosistema del estudio.
- El checkpoint corresponde a la ronda 5 de 10 de un presupuesto total del 1,000 %; no es el punto final de la ejecucion, por lo que su comportamiento puede no ser representativo del resultado completo.
- Sobre-rechazo elevado: un macro over-refusal de 0,2768 en WildGuard implica que el modelo rechaza peticiones legitimas con frecuencia, lo que limita su utilidad conversacional.
- Discrepancia de datos a verificar: el recuento de safetensors (8.030.261.248, identico al del Llama 3.1 8B sin comprimir) no concuerda de forma evidente con la fraccion de parametros declarada de 0,7998; conviene auditar los pesos antes de asumir una reduccion real de memoria.
- No se publican cuantizaciones (GGUF, AWQ, GPTQ, FP8), lo que bloquea el despliegue en GPUs de menos de 16 GB sin trabajo adicional de conversion.
- Riesgo de alucinacion: no medido en la informacion disponible.
- Sesgos conocidos y comportamiento multilingue: no disponibles; no se documenta evaluacion por idioma ni por subgrupo demografico.
- Ausencia de validacion comunitaria: 0 descargas y 0 likes en el momento de la consulta, sin retroalimentacion de terceros.
- Restricciones de licencia: Llama 3.1 Community License, con obligaciones de atribucion («Built with Llama»), condiciones de uso aceptable descritas en `USE_POLICY.md` y clausulas especificas para despliegues a gran escala.
- Todo uso en produccion exige evaluacion propia de seguridad y utilidad antes de sacar conclusiones del checkpoint.

## Enlaces

- HuggingFace: https://huggingface.co/Jeesup/svd-safety-l31_remove20_swapgapiter_b010_r05
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Licencia Llama 3.1 y politica de uso: incluidas como `LICENSE` y `USE_POLICY.md` en el repositorio del modelo
- No se han encontrado en la busqueda web enlaces relevantes al modelo, al paper de SVD-LLM ni a articulos tecnicos asociados; los resultados devueltos no guardan relacion con este checkpoint.
