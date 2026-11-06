# Polifemus/process-fm

## Resumen

Process-FM es una familia de modelos fundacionales basados en transformer causal orientados a *predictive process monitoring* (monitorizacion predictiva de procesos). Dado el prefijo de un caso en un registro de eventos (actividades, recursos y marcas temporales), el modelo predice la siguiente actividad y el siguiente recurso. Lo desarrolla Polifemus (Filippo Polidori) y se publica bajo licencia MIT, con pesos en formato PyTorch y un unico `inference.py` compartido por todos los checkpoints.

El repositorio incluye el checkpoint fundacional `fm-v6` (27,4 M de parametros, `d_model` 512 y 8 capas) y una suite de escalado (`sc5`, `sc27`, `sc80`, `sc300`) que va de 6,32 M a 306,4 M de parametros. Todos comparten un vocabulario global (actividades con ids 4..776, recursos 2..2739, `UNK=1`) y se entrenan con un objetivo de modelado causal del siguiente evento sobre ventanas de 256 eventos.

Su relevancia radica en que traslada el paradigma de los modelos fundacionales al dominio del *process mining*, un area tradicionalmente dominada por modelos especificos por log (redes neuronales sobre grafos, transformers ajustados por log). El autor publica ademas una curva de escalado con presupuestos de entrenamiento deliberadamente ajustados y una ablation de un MoE disperso de 1,1 B de parametros que no supero a los modelos densos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder pre-norm causal (variantes densas); ablation MoE dispersa archivada |
| Parametros totales | 27,4 M (`fm-v6`); suite: 6,32 M / 27,36 M / 88,19 M / 306,4 M |
| Parametros activos | No aplica en los densos; MoE archivado: ~340 M activos de 1,1 B (8 expertos, top-2) |
| Longitud de contexto | Ventanas de 256 eventos |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (dominio tabular/secuencial de eventos, no texto libre) |
| Licencia | MIT (pesos y vocabularios); logs reales bajo sus licencias originales |
| Formato de pesos | PyTorch (checkpoints `.pt`/`.pth` cargados via `inference.py`); no se indica safetensors ni GGUF |

## Arquitectura y entrenamiento

El modelo es un transformer encoder con normalizacion previa (pre-norm), embeddings posicionales aprendidos y embeddings separados para actividad, recurso y log, combinados con 6 caracteristicas numericas. Aplica `id_dropout=0.15` y `log_dropout=0.15`. El objetivo es de modelado causal del siguiente evento (siguiente actividad y siguiente recurso) sobre ventanas de 256 eventos. El id de log actua como entrada de condicionamiento, no como cabeza especifica de tarea; para logs nuevos puede usarse el id `UNK` o ajustar con el codigo del proyecto.

El corpus de preentrenamiento combina logs reales de BPIC y otros corpus de *process mining* con logs sinteticos generados por el mezclador DFG del autor (publicado como `Polifemus/event-log-mixer`). `fm-v6` usa el corpus v3 (18 logs reales + 40 sinteticos, 58 logs, ~0,43 B posiciones vistas); la suite `sc*` usa el corpus v4 (18 reales + 300 sinteticos, 308 logs) y `sc300` el v5 (1 epoca, presupuesto reducido, ~1,28 B posiciones). Los puntos de escalado estan deliberadamente infraentrenados (0,22-0,42x del objetivo de 20 tokens por parametro; `sc300` usa 4,2 tokens por parametro), por lo que la curva mide el regimen infraentrenado, no el optimo de Chinchilla. El protocolo de ajuste fino reportado usa FT completo, atencion causal para BPIC 2015-1, atencion bidireccional completa para *traffic fines*, 30 epocas, parada temprana sobre validacion y lr 3e-4.

## Capacidades

- Prediccion de la siguiente actividad en un caso a partir de su prefijo (clasificacion tabular/secuencial).
- Prediccion del siguiente recurso (quien ejecutara la actividad).
- Modelado causal del siguiente evento con ventanas de 256 eventos.
- Condicionamiento por log mediante id de log en el vocabulario global.
- Prediccion top-k (`top_k` configurable en `predict`).
- Transferencia zero-shot a logs no vistos (con id de log `UNK`) y ajuste fino por log.
- Soporte de atencion causal o bidireccional completa segun la tarea en el ajuste fino.
- No dispone de generacion de texto libre, vision, audio, tool calling ni razonamiento multi-paso en el sentido de un LLM.

## Casos de uso

- Monitorizacion predictiva en tiempo real de procesos de negocio: dado el prefijo de un caso en un sistema de tramitacion (por ejemplo, solicitudes administrativas), el modelo predice la siguiente actividad y permite alertar de desviaciones respecto al flujo esperado.
- Enrutamiento de trabajo: predecir el siguiente recurso permite asignar tareas al empleado o departamento mas probable, reduciendo tiempos de espera en colas de tramitacion.
- Estimacion de riesgo de incumplimiento de plazos: la secuencia de actividades predicha sirve como senal para detectar casos que se desviaran del proceso estandar y priorizar su revision.
- Analisis de conformidad y auditoria: comparar la prediccion del modelo con el evento realmente registrado para detectar anomalias o ejecuciones no conformes con el modelo de proceso.
- Simulacion y analisis what-if de procesos: usar las predicciones del modelo para explorar como evolucionaria un caso bajo distintas condiciones de recursos.
- Investigacion en *process mining*: servir como linea base fundacional y punto de comparacion frente a GNN y transformers ajustados por log (repositorio `prefix-next-activity`).
- Ajuste fino por organizacion: con 27,4 M de parametros, el ajuste fino sobre logs propios es viable en una sola GPU de consumo, lo que facilita su adopcion en equipos con recursos limitados.

## Benchmarks y rendimiento

Datos publicados en la model card (exactitud de validacion en siguiente actividad, zero-shot y ajuste fino sobre BPIC 2015-1):

| Modelo | Parametros | Val next-activity acc | BPIC 2015-1 zero-shot | BPIC 2015-1 FT test acc | FT top-3 | FT macro-F1 |
|---|---:|---:|---:|---:|---:|---:|
| `fm-v6` | 27,4 M | 0,7527 | 0,3480 | 0,4495 | 0,6436 | 0,205 |
| `scaling/sc5` | 6,32 M | 0,6026 | 0,2977 | 0,3931 | 0,5642 | 0,163 |
| `scaling/sc27` | 27,36 M | 0,6451 | 0,3068 | 0,4296 | 0,5865 | 0,1877 |
| `scaling/sc80` | 88,19 M | 0,6563 | 0,3600 | 0,4336 | 0,6280 | 0,1861 |
| `scaling/sc300` | 306,4 M | pendiente | pendiente | pendiente | pendiente | pendiente |

Ablation MoE archivada (1,1 B parametros, 8 expertos, top-2, ~340 M activos, 2 epocas): 0,4098 de exactitud en test tras ajuste fino en BPIC 2015-1 frente a 0,4495 de `fm-v6`; en *traffic fines* empato (0,8832 frente a 0,8835). La validacion de preentrenamiento se estanco tras la primera epoca.

Nota: `fm-v6` y los modelos `sc*` usan corpus y vocabularios distintos (58 frente a 308 logs vistos) y no son directamente comparables; la curva de escalado es `sc5 → sc27 → sc80 → sc300`.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; por tamano, `fm-v6` (27,4 M parametros) ocupa del orden de decenas de MB en precision completa y cabe holgadamente en cualquier GPU de consumo.
- GPU recomendadas: cualquier GPU con suficiente memoria para el checkpoint elegido; `sc300` (306,4 M parametros) sigue siendo ligero y no requiere GPU de datacenter.
- Cabe en GPU de consumo: si, todos los checkpoints publicados.
- Opciones de despliegue: el repositorio proporciona `inference.py` (dependencias `torch` y `numpy`); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---:|---|---|---|---|
| Process-FM `fm-v6` | 27,4 M | 256 eventos | Transformer causal fundacional | MIT | Hugging Face |
| Process-FM `sc80` | 88,19 M | 256 eventos | Transformer causal fundacional | MIT | Hugging Face |
| `Polifemus/prefix-next-activity` | No disponible | No disponible | GNN vs transformer ajustado por log | No disponible | Hugging Face |
| `Polifemus/process-graph-fm` | No disponible | No disponible | Modelo fundacional sobre grafo (GPS) | No disponible | Hugging Face |

No se dispone de datos de benchmarks de los modelos comparables en la informacion proporcionada; la comparacion se limita a enfoque, licencia y disponibilidad.

## Limitaciones y advertencias

- El modelo es especifico del dominio de registros de eventos: no es un LLM de proposito general y no realiza generacion de texto libre.
- Los puntos de la suite de escalado estan infraentrenados por diseno (0,22-0,42x del objetivo de tokens por parametro), por lo que su rendimiento no refleja el potencial del tamano.
- `fm-v6` y `sc*` no son comparables entre si por usar corpus y vocabularios distintos.
- El rendimiento zero-shot en logs no vistos es bajo (0,2977-0,3600 en BPIC 2015-1); el uso en produccion requiere ajuste fino por log.
- El id de log es una entrada de condicionamiento; para logs nuevos debe usarse `UNK` o ajustar con el codigo del proyecto, lo que puede degradar la prediccion.
- La ablation MoE no supero a los modelos densos y no se publica como modelo insignia; no debe asumirse que una variante mayor mejore el rendimiento.
- Los logs reales de preentrenamiento no se redistribuyen y estan sujetos a sus licencias originales (mayoritariamente 4TU General Terms of Use; BPIC 2018 es CC0), lo que limita la reproducibilidad completa del corpus.
- `sc300` no tiene resultados de evaluacion publicados; su rendimiento es desconocido.
- No se documentan sesgos especificos ni tasas de alucinacion; al ser un clasificador secuencial, el riesgo principal es la prediccion incorrecta de la siguiente actividad o recurso, no la generacion de contenido falso.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Polifemus/process-fm
- Dataset sintetico: https://huggingface.co/datasets/Polifemus/event-log-mixer
- Estudio GNN vs transformer: https://huggingface.co/Polifemus/prefix-next-activity
- Modelo fundacional sobre grafo (GPS): https://huggingface.co/Polifemus/process-graph-fm
- Citacion: Polidori, Filippo (2026), *Process-FM: Event-Log Foundation Models and Scaling Suite*
