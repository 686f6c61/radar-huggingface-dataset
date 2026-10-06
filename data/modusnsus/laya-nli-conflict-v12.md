# Modusnsus/laya-nli-conflict-v12

## Resumen

laya-nli-conflict-v12 es una cabeza de decisión (decision head) de tipo clasificación de texto construida sobre el modelo base multilingüe convaiinnovations/laya-multilingual. Su única función es responder a una pregunta binaria sobre un par de memoria: si la información nueva aportada por el usuario entra en conflicto con una memoria ya almacenada (etiqueta `true`, "冲突") o si es compatible o irrelevante (etiqueta `false`, "兼容"). Está pensada para integrarse en plugins de memoria que deben decidir si actualizan hechos, preferencias y restricciones almacenados de un usuario.

El modelo se enmarca dentro de la familia Laya de decisiones tipadas ("typed-decisions") y de la aproximación "system-one", es decir, un clasificador rápido y determinista en lugar de un generador autoregresivo. Cuenta con 321.908.998 parámetros, pesos en safetensors de 643.835.524 bytes (aproximadamente 0,64 GB) y licencia Apache 2.0, lo que lo hace desplegable en hardware modesto.

Su relevancia reciente radica en que es la versión entregada a partir del 2026-10-07, sustituyendo a `Modusnsus/laya-nli-memory-conflict` (v4), y corresponde a la ejecución r2 de un protocolo de entrenamiento preregistrado de n=3 ejecuciones de igual estatus cuyas 14 ejes de validación ("gate axes") se superaron en su totalidad, el primer ciclo que supera el protocolo completo. Las ejecuciones r1 y r3 se publican como archivos hermanos sin modificar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer preentrenado (base: convaiinnovations/laya-multilingual) con cabeza de clasificacion de 2 clases; detalles internos de la base no disponibles |
| Parametros totales | 321.908.998 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors, tamano compatible con bf16/fp16) |
| Idiomas soportados | no disponible (etiqueta "multilingual"; idiomas concretos no especificados) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un ajuste fino (fine-tune) del modelo multilingüe `convaiinnovations/laya-multilingual`, al que se añade una cabeza de clasificación de texto con dos etiquetas personalizadas (`false` = "兼容", compatible; `true` = "冲突", conflicto). La tarea se define como una pregunta de tipo `noul` sobre un par de memoria: decidir si la memoria almacenada debe ser reemplazada por lo que el usuario acaba de decir. No se dispone de información sobre la arquitectura interna exacta del modelo base (número de capas, atención, tokenizador, etc.).

El entrenamiento sigue un protocolo preregistrado de n=3 ejecuciones de igual estatus, con el mismo kernel, el mismo corpus y la misma receta de entropía cruzada pura ("pure-CE"), sin selección, sustitución ni adición de ejecuciones para la validación. El corpus es el dataset de Kaggle v17, con 15.950 filas, que corresponde a las 15.914 filas de v11 más 36 filas adicionales de tipo "negation-known-conflict lever" repartidas en 6 dominios. Se documenta una auditoría de fugas ("leak_audit") que garantiza que los 35 casos de aceptación no tienen intersección a nivel literal ni de campo con ningún corpus de entrenamiento desde la v6 (0/35), y la generación de v12 asegura 0 solapamiento contra los 35 casos, los 14 pares de diagnóstico y ambas familias (0/51). De las tres ejecuciones, se entrega r2 por un criterio objetivo predeclarado: es la única con las tres baterías de aceptación a puntuación completa (old-20 20/20, negation-5 5/5, new-10 10/10).

## Capacidades

- Clasificación binaria de conflicto: dado un par formado por memoria conocida e información nueva, devuelve una decisión tipada (compatible o conflicto).
- Decisión orientada a la actualización de memoria: responde específicamente a si la memoria almacenada debe ser sustituida por el nuevo input.
- Multilingüe (según la etiqueta "multilingual" del repositorio; idiomas concretos no disponibles).
- Salida probabilística utilizable para calibración: el modelo reporta una probabilidad de conflicto, evaluada con ECE (0,0209).
- Soporte de familias negativas y de negación: dispone de instrumentos preregistrados para medir la tasa de acierto en familias de casos compatibles y de casos con negación.
- No es un modelo generativo: no produce texto libre ni soporta tool calling, function calling ni razonamiento multi-paso. Es exclusivamente un clasificador (`pipeline_tag: text-classification`).

## Casos de uso

- Actualización de memoria de usuario en asistentes conversacionales: el modelo decide si un dato nuevo (por ejemplo, un cambio de dirección o de preferencia) debe sobrescribir el hecho previamente almacenado, evitando que memorias obsoletas persistan en el perfil del usuario.
- Detección de contradicciones en bases de conocimiento personales: al recibir una afirmación del usuario, el modelo comprueba si contradice una restricción ya almacenada (por ejemplo, una alergia o una preferencia declarada) y dispara la actualización correspondiente.
- Gestión de restricciones y políticas en agentes: antes de aplicar una regla persistida, el sistema verifica si la nueva instrucción del usuario la invalida, reduciendo conflictos en la lógica del agente.
- Filtrado de información redundante: cuando la información nueva es compatible o irrelevante respecto a la memoria, el modelo lo indica, permitiendo descartar escrituras innecesarias y ahorrar operaciones en el almacén.
- Enrutado de decisiones tipadas en pipelines de memoria: la salida binaria actúa como señal de control para decidir si se lanza una operación de escritura, de fusión o de no-op sobre el almacén de hechos.
- Puntuación de coherencia en sistemas RAG con memoria persistente: el clasificador puede emplearse para detectar cuándo un recupero contradice el contexto almacenado y forzar su revisión.
- Componente de evaluación de calidad de memoria: sirve como instrumento de medida en pruebas internas para cuantificar cuántas actualizaciones de memoria se realizan correctamente frente a pares etiquetados de referencia.

## Benchmarks y rendimiento

Datos declarados por el autor (campo `verified: false`) sobre el conjunto de validación congelado de 1000 pares derivado de MultiNLI:

| Tarea | Conjunto | Metrica | Valor |
|---|---|---|---|
| Memory-conflict decision (noul) | MultiNLI-derived memory pairs (frozen 1000-pair val) | accuracy | 0.903 |
| Memory-conflict decision (noul) | MultiNLI-derived memory pairs (frozen 1000-pair val) | ECE | 0.0209 |

Lecturas de las tres ejecuciones del protocolo (r1, r2 entregada, r3):

| Eje (gate) | r1 | r2 (entregada) | r3 | Gate | Veredicto |
|---|---|---|---|---|---|
| Precisión val principal (mediana >= 0.896) | 0.904 | 0.903 | 0.907 | mediana 0.904 | PASS |
| ECE val principal (informativo) | 0.0207 | 0.0209 | 0.0190 | — | — |
| old-20 casos reales | 19 | 20 | 20 | 20 | PASS |
| negation-5 | 5 | 5 | 4 | 5 | PASS |
| new-10 | 10 | 10 | 10 | 10 | PASS |
| Errores soft-conflict val_soft | 2 | 1 | 1 | <= 3 | PASS |
| Intercambio de superficie de etiquetas | PASS | PASS | PASS | todos PASS | PASS |
| Polaridad real·diag <= 1 | PASS | PASS | PASS | todos <= 1 | PASS |
| Polaridad val_soft <= 1 | PASS | PASS | PASS | todos <= 1 | PASS |
| Banda >= 8pp | PASS | PASS | PASS | todos | PASS |
| Regla conformal adoptada >= 50% @ <= 35% | 36/50@34.2% | 34/50@33.4% | 33/47@34.0% | todos | PASS |
| Sesgo diag >= 13/14 en >= 2/3 runs | 13/14 | 13/14 | 13/14 | 3/3 runs | PASS |
| Tasa de familia compatible | 0.0806 | 0.0919 | 0.0814 | mediana 0.0814 | PASS |
| Tasa de familia de negacion | 0.7872 | 0.8022 | 0.7930 | mediana 0.7930 | PASS |
| Ajuste post-hoc tau(noul) | 1.0887 | 1.0914 | 1.1080 | — | — |
| Automatizacion @5% (auxiliar, no gating) | 0.814 | 0.781 | 0.781 | — | — |

No se han publicado otros resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con pesos safetensors de 643.835.524 bytes (~0,64 GB), la inferencia en bf16/fp16 requiere aproximadamente 0,7-1 GB de VRAM incluyendo estados de activación; en int8 podría reducirse a unos 0,4 GB (cuantizaciones publicadas no disponibles).
- GPU recomendadas: cualquier GPU con 2 GB o más de VRAM es suficiente. No se requieren aceleradores de gama alta como A100 o H100 para este modelo.
- Compatibilidad con GPU de consumo: sí, cabe holgadamente en cualquier GPU de consumo (RTX 3060, RTX 4090, etc.) e incluso en CPU para cargas moderadas.
- Opciones de despliegue: la librería indicada es `transformers` mediante el pipeline `text-classification`; el repositorio incluye la etiqueta `endpoints_compatible`, lo que sugiere compatibilidad con Hugging Face Inference Endpoints. No se documentan opciones de despliegue con vLLM, llama.cpp, Ollama o TGI, ni formatos GGUF.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| laya-nli-conflict-v12 (este) | 321,9 M | no disponible | Clasificacion de conflicto de memoria (2 clases) | apache-2.0 | Hugging Face |
| laya-nli-memory-conflict (v4) | no disponible | no disponible | Clasificacion de conflicto de memoria | no disponible | Hugging Face (predecesor directo, sustituido) |

No se dispone de datos suficientes en la información proporcionada para comparar con otros modelos de la misma categoría (por ejemplo, clasificadores NLI de tamaño similar). Comparativa ampliada: no disponible.

## Limitaciones y advertencias

- Resultados no verificados: las metricas de accuracy (0.903) y ECE (0.0209) proceden del autor y aparecen con `verified: false`; no hay verificacion independiente.
- Alcance muy restringido: es un clasificador binario especifico de conflicto de memoria, no un modelo generativo ni de proposito general; no soporta generacion de texto, codigo, matematicas ni vision.
- Idiomas no documentados: aunque el modelo base y las etiquetas lo describen como multilingue, la model card no detalla que idiomas estan soportados ni con que calidad.
- Longitud de contexto desconocida: no se especifica la ventana maxima, lo que limita la planificacion de pares de memoria largos.
- Riesgo de alucinacion en el sentido clasico (generacion de texto) no aplica; el riesgo equivalente es una clasificacion erronea de la relacion de conflicto, especialmente en casos limite ("thin-edge"), donde se documentan fallos de una sola ejecucion que no se repiten.
- Dependencia de umbrales: el uso practico depende de umbrales de decision (tau(noul) ~1.09) y de reglas conformales calibradas; el rendimiento puede degradarse si se aplican fuera de ese regimen.
- Casos limite documentados: variaciones en ejemplos old-20 y negation entre ejecuciones muestran comportamiento bimodal en el borde de la decision; en produccion conviene monitorizar estos casos.
- Licencia Apache 2.0: permite uso comercial y modificacion, con las obligaciones habituales de atribucion y conservacion del aviso de licencia; no se anaden restricciones de uso comercial.
- Sesgos: no se documentan analisis de sesgo demografico o linguistico; el corpus se deriva de MultiNLI y de pares sinteticos, lo que puede introducir sesgos de dominio no medidos.
- Madurez: es una version concreta (r2) de un protocolo experimental preregistrado; conviene evaluar su comportamiento en el dominio de produccion antes de adoptarla de forma generalizada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Modusnsus/laya-nli-conflict-v12
- Ejecucion r1 (archivo hermano): https://huggingface.co/Modusnsus/laya-nli-conflict-v12-r1
- Ejecucion r3 (archivo hermano): https://huggingface.co/Modusnsus/laya-nli-conflict-v12-r3
- Modelo predecesor (v4): https://huggingface.co/Modusnsus/laya-nli-memory-conflict
- Modelo base: https://huggingface.co/convaiinnovations/laya-multilingual
- Protocolo y handoff (HANDOFF_NLI_V12.md): https://github.com/modusensus/laya/blob/main/kaggle_eval/HANDOFF_NLI_V12.md
- Dataset nyu-mll/multi_nli: https://huggingface.co/datasets/nyu-mll/multi_nli
- Dataset Modusnsus/nli-conflict-pairs: https://huggingface.co/datasets/Modusnsus/nli-conflict-pairs
- Dataset Modusnsus/nli-conflict-train-lineage: https://huggingface.co/datasets/Modusnsus/nli-conflict-train-lineage
- Dataset Modusnsus/laya-nli-conflict-eval: https://huggingface.co/datasets/Modusnsus/laya-nli-conflict-eval
