# Modusnsus/laya-nli-conflict-v10-l2

## Resumen

`Modusnsus/laya-nli-conflict-v10-l2` es un checkpoint de clasificacion de texto (NLI, inferencia de lenguaje natural) de aproximadamente 322 millones de parametros, publicado por el autor Modusnsus dentro del programa de investigacion "laya NLI memory-conflict". No es un modelo entregado ni validado para produccion: la propia model card lo etiqueta como *research archive* y *not delivered*, y explicita que fallo las puertas de aceptacion de su ronda (9 de 12 gates superados) y nunca se envio. Se sube unicamente por trazabilidad y respaldo mientras la ronda 11 espera cuota de GPU en Kaggle.

El interes tecnico del artefacto es metodologico mas que de rendimiento. Forma parte de una familia de tres ejecuciones con configuracion y corpus identicos (v9, S2 y esta L2) cuyo objetivo es medir la estabilidad de las decisiones del head: la exactitud de validacion oscila entre 0,9050 y 0,8890 (1,6 puntos porcentuales) y la metrica B2 va de 0,3877 a 0,8890, un rango de 50 puntos que cruza la linea de decision de 0,5. La conclusion declarada por el autor es que lecturas de B2 basadas en una sola ejecucion no tienen poder de decision, lo que motiva un protocolo preregistrado de mediana multi-ejecucion para la ronda 11.

Se apoya en la familia `convaiinnovations/laya-multilingual` como modelo base declarado y en el encoder `jhu-clsp/mmBERT-base` segun el fichero de configuracion del artefacto, con entrenamiento sin RL (`no_rl: true`) y calibracion medida mediante ECE. No se declaran idiomas soportados, contexto maximo ni variantes cuantizadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (encoder tipo transformer; se cita `jhu-clsp/mmBERT-base` en `rl_agent_config.json`) |
| Parametros totales | 321.908.998 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (checkpoint servido en bf16; no se publican variantes GGUF ni cuantizadas) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (`model.safetensors`) |

Datos adicionales del repositorio: tamano 0,7 GB, libreria `transformers`, tarea `text-classification`, 0 descargas y 0 likes, creado el 2026-10-01 y actualizado el 2026-10-01. Hash SHA256 de los pesos: `e557d46b…b98d15` (hash completo en `archive_sha256_manifest.txt`).

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura mas alla de dos referencias: el modelo base declarado en los metadatos, `convaiinnovations/laya-multilingual`, y el encoder citado en la configuracion del artefacto, `jhu-clsp/mmBERT-base`. Existe por tanto una posible discrepancia entre el `base_model` declarado y el encoder efectivamente usado, que conviene verificar antes de reutilizar el checkpoint. El modelo se ejecuta en bf16 y no se aplico RL sobre el head (`no_rl: true` en `metrics.json`), con un umbral `τ(noul) = 1.0284` registrado en `rl_agent_config.json`.

El entrenamiento se realizo en un kernel de GPU de Kaggle (`daphnelaurent/laya-nli-conflict-ce`, secuencia de tres versiones) sobre el dataset `daphnelaurent/nli-conflict-pairs` v15, con `nyu-mll/multi_nli` como dataset adicional declarado en las etiquetas. La validacion congelada consta de 1000 ejemplos (`n_val: 1000`) y se publica un volcado de probabilidades (`val_probs.json`) para analisis de calibracion. No se especifican numero de tokens de entrenamiento, composicion del dataset ni estrategia de ajuste (fine-tuning supervisado, DPO u otra).

## Capacidades

- Clasificacion de texto para inferencia de lenguaje natural (NLI): el `pipeline_tag` es `text-classification`.
- Deteccion de conflictos de memoria (memory-conflict) entre pares de premisa e hipotesis, segun la nomenclatura del programa.
- Decisiones tipadas (*typed-decisions*) y clasificacion etiquetada como *system-one*, es decir, juicio rapido en un solo paso sin cadena de razonamiento explicita.
- Salida calibrada: se reporta ECE (expected calibration error) de 0,0408 sobre la validacion congelada, y se publica el volcado de probabilidades para su analisis.
- Soporte de tool calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponibles (no se declaran idiomas).
- Capacidades especiales (vision, audio, modo thinking): no disponibles.

## Casos de uso

- Investigacion sobre estabilidad de evaluaciones: el artefacto sirve como evidencia de repeticion de una misma configuracion y permite estudiar la varianza entre ejecuciones identicas (main val 0,9050 / 0,8940 / 0,8890) antes de fijar protocolos de evaluacion en proyectos propios.
- Auditoria de calibracion en clasificadores: con `val_probs.json` y un ECE de 0,0408 sobre 1000 ejemplos, se puede reproducir el analisis de calibracion y compararlo con otros heads de la misma familia.
- Reproducibilidad y trazabilidad: el hash SHA256 del safetensors y el manifiesto de artefactos permiten verificar que un binario concreto corresponde a la ejecucion L2 de la ronda 10.
- Baseline negativo en experimentos de NLI: al estar marcado como no entregado y fallar 3 de 12 gates, es util como referencia de "lo que no cumple criterios" frente al head de produccion.
- Estudio de sensibilidad de metricas de decision: el rango de 50 puntos en B2 entre ejecuciones identicas permite ilustrar en docencia o publicaciones el riesgo de reportar una unica semilla.
- Pruebas de infraestructura de despliegue con modelos pequenos: con 322 millones de parametros sirve para validar pipelines de servicio de `text-classification` con `transformers` antes de pasar a modelos mayores, sin pretension de calidad final.
- Analisis de conflictos entre memoria y contexto en sistemas conversacionales: el modelo apunta a detectar contradicciones, un componente habitual en capas de verificacion de asistentes con memoria persistente, aunque en este checkpoint la validacion no alcanza los umbrales exigidos.

## Benchmarks y rendimiento

Datos extraidos de `metrics.json` y de la model card. La validacion congelada tiene 1000 ejemplos.

| Metrica | Valor |
|---|---|
| Exactitud en validacion principal (main val) | 0,889 |
| ECE en validacion | 0,0408 |
| Tamano de la validacion | 1000 |
| Casos nuevos (new-10) | 9/10 |
| Diagnostico de sesgo | 12/14 |
| Puertas de aceptacion superadas | 9/12 |
| τ(noul) | 1,0284 |
| RL aplicado | no (`no_rl: true`) |

Comparativa entre las tres ejecuciones con configuracion byte-identica de la misma ronda:

| Ejecucion | Main val | B2 |
|---|---|---|
| v9 (ronda 9) | 0,9050 | 0,8890 |
| S2 (baseline, `laya-nli-conflict-v10-s2`) | 0,8940 | 0,3877 |
| L2 (este checkpoint) | 0,8890 | 0,6951 |

El propio autor subraya que el rango de B2 (0,3877 a 0,8890) cruza la linea de decision de 0,5 pese a tratarse de la misma configuracion, por lo que una lectura unica de B2 no tiene poder de decision. El rango de τ(noul) reportado para el conjunto de ejecuciones es 1,03–1,19. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no publicada por el autor. Proyeccion a partir de los 321.908.998 parametros: en bf16 los pesos ocupan aproximadamente 0,64 GB, en fp32 unos 1,29 GB, en int8 unos 0,32 GB y en int4 unos 0,16 GB, a lo que hay que sumar activaciones, tokenizador y overhead del runtime.
- GPU recomendadas: no disponibles en la informacion proporcionada. Por tamano, cualquier GPU consumer con 4 GB o mas de VRAM deberia alojar el checkpoint en bf16 o fp16.
- Cabe en GPU consumer: si, previsiblemente en gamas como GTX 1650/RTX 3050 en adelante; conviene confirmar con mediciones propias, ya que el modelo no publica requisitos oficiales.
- Opciones de despliegue: `transformers` (libreria declarada, compatible con endpoints segun las etiquetas); no se documentan guias para vLLM, llama.cpp, Ollama ni TGI, y al no existir variantes GGUF los runtimes basados en llama.cpp quedan descartados salvo conversion manual.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

Se comparan los artefactos de la misma familia y programa, unicos para los que la informacion proporcionada ofrece datos.

| Modelo | Rol | Main val | B2 | Estado |
|---|---|---|---|---|
| `Modusnsus/laya-nli-conflict-v10-l2` | Rerun independiente de corpus y configuracion v9 | 0,8890 | 0,6951 | Archivo de investigacion, no entregado |
| `Modusnsus/laya-nli-conflict-v10-s2` | Baseline de la ronda 10 | 0,8940 | 0,3877 | Archivo de investigacion |
| Ejecucion v9 (ronda 9) | Ejecucion original de la configuracion | 0,9050 | 0,8890 | No consta como entregado |
| `Modusnsus/laya-nli-memory-conflict` (v4) | Head de produccion declarado | no disponible | no disponible | Modelo en produccion segun la model card |

Frente a alternativas de la misma categoria (encoders multilingues tipo `jhu-clsp/mmBERT-base`, `FacebookAI/xlm-roberta-base` o `microsoft/mdeberta-v3-base`), no se dispone de resultados comparativos en la informacion proporcionada. Tampoco se dispone de datos de contexto, idiomas o licencia de esos modelos tal como se recogen aqui, por lo que la comparacion con ellos queda como no disponible.

## Limitaciones y advertencias

- Estado del artefacto: la model card lo marca explicitamente como *research archive* y *not delivered*; no supero las puertas de aceptacion de su ronda (9 de 12) y nunca se envio a produccion. No deberia usarse como componente de un sistema real sin una evaluacion propia.
- Inestabilidad entre ejecuciones: con configuracion byte-identica, B2 varia entre 0,3877 y 0,8890 y la exactitud entre 0,8890 y 0,9050. Cualquier medicion puntual de este checkpoint debe tratarse como ruidosa.
- Posible discrepancia de linaje: los metadatos declaran `convaiinnovations/laya-multilingual` como modelo base, mientras que la configuracion del artefacto cita el encoder `jhu-clsp/mmBERT-base`. Conviene verificar que pesos corresponden realmente al checkpoint antes de reutilizarlo.
- Sin ajuste por RL: `no_rl: true`; el comportamiento del head depende por completo del fine-tuning supervisado sobre `daphnelaurent/nli-conflict-pairs` v15.
- Sesgos conocidos: no se publica analisis de sesgos, aunque el diagnostico interno de sesgo reporta 12/14 y se cuenta como puerta no superada. No hay informacion sobre sesgos demograficos, de dominio o de genero.
- Riesgo de alucinacion: al ser un clasificador de texto y no un modelo generativo abierto, el riesgo se traduce en falsos positivos y negativos en la deteccion de conflictos, no en texto inventado. No se aportan matrices de confusion ni metricas por clase.
- Cobertura idiomatica: no se declaran idiomas. El entrenamiento se vincula a `nyu-mll/multi_nli`, mayoritariamente en ingles, por lo que el comportamiento en castellano es desconocido.
- Contexto: no se publica longitud maxima de contexto, un parametro critico para clasificar pares largos de premisa e hipotesis.
- Licencia: apache-2.0, que permite uso comercial y modificacion, pero la licencia no implica que el modelo funcione ni que haya superado validacion alguna.
- Reproducibilidad de la infraestructura: el entrenamiento dependio de un kernel de Kaggle y la ronda 11 esta a la espera de cuota de GPU, lo que sugiere limitaciones de recursos para replicar los experimentos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Modusnsus/laya-nli-conflict-v10-l2
- Head de produccion declarado (v4): https://huggingface.co/Modusnsus/laya-nli-memory-conflict
- Baseline S2 de la misma ronda: https://huggingface.co/Modusnsus/laya-nli-conflict-v10-s2
- Modelo base declarado: https://huggingface.co/convaiinnovations/laya-multilingual
- Encoder citado en la configuracion: https://huggingface.co/jhu-clsp/mmBERT-base
- Dataset adicional declarado: https://huggingface.co/datasets/nyu-mll/multi_nli
- Repositorio del autor: https://github.com/modusensus
- Repositorio laya: https://github.com/modusensus/laya
- Registro de ronda y tabla de puertas: https://github.com/modusensus/laya/blob/main/kaggle_eval/HANDOFF_NLI_V10.md
- Manifiesto de hashes: https://github.com/modusensus/laya/blob/main/kaggle_eval/archive_sha256_manifest.txt
- Kernel de entrenamiento en Kaggle: `daphnelaurent/laya-nli-conflict-ce`
- Dataset de entrenamiento: `daphnelaurent/nli-conflict-pairs` v15
