# Modusnsus/laya-nli-conflict-v9

## Resumen

`Modusnsus/laya-nli-conflict-v9` es un checkpoint de clasificación de texto para inferencia de lenguaje natural (NLI) orientado específicamente a la detección de conflictos de memoria, desarrollado por el usuario Modusnsus dentro de la línea de modelos Laya. Se trata de un ajuste fino derivado de `convaiinnovations/laya-multilingual`, con 321.908.998 parámetros y pesos en bf16, distribuido en formato safetensors. Forma parte de una familia de "cabezas" de decisión tipadas (etiquetas `typed-decisions`, `system-one`) pensadas para producir veredictos rápidos y calibrados en lugar de texto generativo.

El dato más importante para cualquier evaluador es que este checkpoint es un **archivo de investigación, no un modelo entregado**. La propia model card indica que la ronda 9 (2026-09-30) no superó las puertas de aceptación y que la cabeza en producción es `Modusnsus/laya-nli-memory-conflict` (v4). El modelo se subió el 2026-10-02 únicamente por trazabilidad y respaldo, mientras la ronda 11 esperaba cuota de GPU en Kaggle.

Aun así, el checkpoint contiene información útil: métricas de validación congeladas (exactitud 0.905 sobre 1.000 pares, ECE de 0.0201), resultados de calibración conformal y un fallo documentado de dosis-respuesta en el subconjunto B2 que lo convierte en un caso de estudio sobre variabilidad entre ejecuciones. Es relevante ahora porque ilustra un patrón habitual en investigación aplicada: checkpoints intermedios con buenas métricas agregadas pero fallos en subconjuntos críticos que deben consultarse antes de reutilizarlos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (codificador transformer; `rl_agent_config.json` referencia el encoder `jhu-clsp/mmBERT-base`) |
| Parametros totales | 321.908.998 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se publican pesos en bf16) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (bf16) |

Datos adicionales de la ficha: pipeline `text-classification`, librería `transformers`, tamano del repositorio 0,7 GB, 0 descargas y 0 likes en el momento de la consulta, fecha de creacion 2026-10-01 y ultima actualizacion 2026-10-01. La model card menciona una subida el 2026-10-02, lo que no coincide con las marcas temporales del repositorio.

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura con detalle. Los metadatos apuntan a un codificador de tipo transformer con una cabeza de clasificacion, construido sobre la estirpe de `convaiinnovations/laya-multilingual` y con `jhu-clsp/mmBERT-base` citado como encoder en el fichero de configuracion del agente RL. El entrenamiento se realizo en un kernel de GPU de Kaggle (`daphnelaurent/laya-nli-conflict-ce`, version 5) sobre el dataset `daphnelaurent/nli-conflict-pairs` version 14, con pesos en bf16. El fichero `metrics.json` incluye el campo `no_rl: true`, lo que indica que esta ronda no aplico aprendizaje por refuerzo; el ajuste fino se apoyo en el corpus NLI y en el pipeline de calibracion.

La ronda 9 (2026-09-30) anadio 400 filas nuevas sobre el corpus de la v8, manteniendo bloques "byte-identical carried blocks": 200 de ampliacion de atributos (incluidas 79 de 120 formas isomorfas al subconjunto B2), 40 de control inverso de atributos (kind implica true), 120 de tipo "waver" y 40 de "change-already-happened". La innovacion metodologica destacable es el uso de prediccion conformal con regla dual ("conformal re-cut dual-rule pass") y un presupuesto de seleccion de 0,34 fijado en el tooling. El resultado mas informativo es un fallo documentado: doblar la dosis de ejemplos isomorfos B2 empeoro la metrica de ese subconjunto (de 0,7491 a 0,889 no alcanzo el umbral), lo que falsifico la hipotesis de dosis-respuesta a esa dosificacion. La ronda 10 posterior atribuyo las lecturas de B2 en ejecucion unica a varianza entre ejecuciones.

## Capacidades

- Clasificacion de texto para NLI: inferencia de relaciones entre premisa e hipotesis dentro del marco del dataset `nyu-mll/multi_nli`.
- Deteccion de conflictos de memoria: identificacion de contradicciones entre un hecho almacenado y una afirmacion nueva, segun los tags `memory-conflict` y `nli`.
- Decisiones tipadas (`typed-decisions`): salidas estructuradas por tipo de veredicto, en lugar de texto libre.
- Modo "system-one": orientado a decisiones rapidas de baja latencia dentro de una arquitectura de doble sistema.
- Calibracion de probabilidades: la ficha reporta ECE de 0,0201 y un pase de recalibrado conformal con regla dual, lo que sugiere salidas probabilisticas utilizables para umbrales de decision.
- Clasificacion multilingue: el modelo base es `laya-multilingual`, aunque los idiomas efectivamente soportados no estan declarados en el repositorio.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible como capacidad generativa; el tag `system-one` y el fichero `rl_agent_config.json` indican integracion como componente de decision dentro de un agente mayor.
- Capacidades especiales (thinking mode, vision, audio): no disponibles.

## Casos de uso

- Verificacion de consistencia en memoria de agentes: antes de escribir un hecho nuevo en un almacen de memoria a largo plazo, el modelo clasifica si entra en conflicto con un hecho ya guardado, lo que permite resolver contradicciones de forma determinista en lugar de sobrescribir silenciosamente.
- Guardarraíl en pipelines RAG: dado un contexto recuperado y una respuesta generada, el clasificador detecta si la respuesta contradice el contexto, actuando como filtro previo a la entrega al usuario.
- Etiquetado y curacion de datasets NLI: el modelo puede preanotar pares premisa-hipotesis para revision humana, con la ventaja de disponer de probabilidades calibradas (ECE bajo) para priorizar los casos dudosos.
- Enrutado de decisiones en asistentes conversacionales: al detectar una contradiccion con turnos anteriores, el sistema puede activar una aclaracion al usuario en lugar de continuar con una premisa erronea.
- Control de calidad en pipelines de extraccion de conocimiento: al convertir documentos en tripletas o atributos, el clasificador comprueba que los atributos nuevos no contradicen los ya extraidos del mismo documento o de documentos relacionados.
- Reproducibilidad de investigacion en calibracion: el checkpoint, junto con `val_probs.json` y `metrics.json`, sirve como material de referencia para reproducir analisis de calibracion conformal y estudiar varianza entre ejecuciones.
- Auditoria de sistemas de memoria en produccion: como el modelo documenta explicitamente un fallo en el subconjunto B2, resulta util como ejemplo de validacion por subconjuntos y no solo por metrica agregada.

## Benchmarks y rendimiento

Los datos disponibles proceden de la validacion interna del autor, no de benchmarks publicos estandar. Se presentan tal cual, con la advertencia de que la metrica principal (0,905) corresponde a una validacion congelada de 1.000 pares definida por el propio proyecto.

| Metrica | Valor | Conjunto | Estado |
|---|---|---|---|
| Exactitud de validacion principal | 0,9050 | val congelada de 1000 pares | pasa |
| val_soft | 0/300 | val_soft | pasa (primer cero desde v4) |
| Sonda en distribucion | 30/30 | sonda interna | pasa |
| Pase conformal de regla dual | correcto (presupuesto de seleccion 0,34) | recalibrado conformal | pasa |
| Exactitud en B2 | 0,889 (objetivo 0,7491 -> mejora no alcanzada) | subconjunto B2 isomorfo | falla |
| old-20 | 18/20 | subconjunto antiguo de 20 | falla (flips en bordes finos) |
| ECE | 0,0201 | val de 1000 pares | informativo |
| n_val | 1000 | val principal | informativo |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni de otros benchmarks estandar en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,65 GB en bf16 (321,9 M de parametros), en torno a 1,3 GB en fp32 y alrededor de 0,35 GB en int8. Son estimaciones de calculo a partir del numero de parametros, no datos publicados por el autor.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; tarjetas como RTX 3060, RTX 4060, RTX 4090, A100 o H100 funcionan sin problema, pero estan sobredimensionadas para este tamano.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU de consumo de los ultimos diez anos, e incluso en CPU para cargas moderadas.
- Opciones de despliegue: el tag `endpoints_compatible` sugiere compatibilidad con Hugging Face Inference Endpoints. Para un clasificador de 321 M, las vias habituales son la pipeline `text-classification` de `transformers`, exportacion a ONNX con Optimum y servido con ONNX Runtime, Triton Inference Server o un servicio FastAPI propio. vLLM y TGI estan orientados a generacion de texto y no son el encaje natural para este modelo.
- Latencia y throughput estimados: no disponibles. El autor no publica mediciones de latencia ni de tokens por segundo. Por el tamano, se puede esperar una latencia de milisegundos por lote en GPU moderna, pero es una inferencia del redactor y no un dato de la ficha.

## Comparativa con modelos similares

La informacion disponible no incluye comparativas con modelos externos. La comparacion mas util es dentro de la propia familia Laya, cuyos datos si aparecen citados en la model card.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Estado |
|---|---|---|---|---|---|
| `Modusnsus/laya-nli-conflict-v9` | 321.908.998 | no disponible | val 0,9050, ECE 0,0201, B2 falla | apache-2.0 | Archivo de investigacion, no entregado |
| `Modusnsus/laya-nli-memory-conflict` (v4) | no disponible | no disponible | no disponible | no disponible | Cabeza en produccion segun la model card |
| `convaiinnovations/laya-multilingual` | no disponible | no disponible | no disponible | no disponible | Modelo base del ajuste fino |

Comparativas con alternativas de la misma categoria (clasificadores NLI multilingues como mDeBERTa-v3, XLM-R o mmBERT): no disponible en la informacion proporcionada.

## Limitaciones y advertencias

- Naturaleza del artefacto: es un archivo de investigacion que fallo las puertas de aceptacion de su ronda y nunca se entrego. La model card lo declara explicitamente como "NOT delivered".
- Fallo documentado de dosis-respuesta: doblar los ejemplos isomorfos B2 empeoro la metrica de ese subconjunto, y la ronda 10 concluyo que las lecturas de B2 en ejecucion unica estan dominadas por varianza entre ejecuciones. Cualquier evaluacion propia deberia usar multiples ejecuciones.
- Riesgo en bordes finos: el subconjunto old-20 quedo en 18/20 por volteos en casos de borde, lo que indica fragilidad en ejemplos cercanos al umbral de decision.
- Idiomas: el repositorio marca los idiomas como "no disponibles". No se puede asumir cobertura multilingue real aunque el modelo base se denomine `laya-multilingual`.
- Contexto: la longitud maxima de secuencia no esta documentada, lo que impide dimensionar entradas largas sin prueba empirica.
- Sesgos: el entrenamiento parte de `nyu-mll/multi_nli`, un corpus con sesgos conocidos de dominio y de genero textual. La ficha no documenta ningun analisis de sesgo.
- Alucinacion: al ser un clasificador, no genera texto, por lo que el riesgo de alucinacion en el sentido generativo es bajo; el riesgo equivalente es la clasificacion erronea confiada, mitigada en parte por el ECE de 0,0201.
- Licencia: apache-2.0 permite uso comercial y modificacion, siempre que se conserve el aviso de licencia y atribucion. Hay que verificar que el modelo base `convaiinnovations/laya-multilingual` no imponga condiciones adicionales, ya que su licencia no se detalla en la informacion disponible.
- Caveat de trazabilidad: las fechas de creacion y actualizacion del repositorio (2026-10-01) no coinciden con la fecha de subida indicada en la model card (2026-10-02).
- Reproducibilidad: `checkpoint_latest/` no se subio, por lo que no se puede reconstruir el estado exacto de entrenamiento a partir del repositorio.
- Integridad: el hash SHA256 de `model.safetensors` aparece truncado en la model card (`885f256f...e606d6`); el hash completo se remite a un manifiesto externo en GitHub.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Modusnsus/laya-nli-conflict-v9
- Cabeza en produccion citada por el autor: https://huggingface.co/Modusnsus/laya-nli-memory-conflict
- Modelo base: https://huggingface.co/convaiinnovations/laya-multilingual
- Dataset de entrenamiento citado: https://huggingface.co/datasets/daphnelaurent/nli-conflict-pairs
- Dataset NLI citado en los tags: https://huggingface.co/datasets/nyu-mll/multi_nli
- Encoder citado en la configuracion: https://huggingface.co/jhu-clsp/mmBERT-base
- Manifiesto de hashes SHA256: https://github.com/modusensus/laya/blob/main/kaggle_eval/archive_sha256_manifest.txt
- Registro de ronda y tabla de puertas de aceptacion: https://github.com/modusensus/laya/blob/main/kaggle_eval/HANDOFF_NLI_V9.md

Nota sobre la busqueda web: los resultados devueltos por la busqueda no guardan ninguna relacion con el modelo ni con NLI, y se han descartado por no ser fuentes tecnicas validas. No se han encontrado papers, blogs ni demos adicionales relevantes en la informacion proporcionada.
