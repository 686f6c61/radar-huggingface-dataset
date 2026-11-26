# ansarbuilds/Sirius-YouTube

## Resumen

Sirius-YouTube es un clasificador de texto basado en BERT (33 millones de parametros) desarrollado por ansarbuilds como componente especializado de la aplicacion de escritorio Sirius para macOS. Su funcion es juzgar exclusivamente ventanas de navegacion de `youtube.com` y decidir si el contenido que el usuario esta viendo es relevante para su objetivo declarado (`ON_TASK`), dudoso (`BORDERLINE`) o una distraccion (`RABBIT_HOLE`). Se distribuye como modelo ONNX cuantizado a int8 de 32,49 MB, pensado para inferencia en CPU local con latencias de milisegundos.

El modelo parte de Sirius-Small y se reentrena para corregir un fallo concreto: el clasificador original marcaba como distraccion el 90,6% de los videos utiles (64 casos), porque aprendio que un video relevante repite las palabras del objetivo y los videos reales rara vez lo hacen. Tras el reentrenamiento, la tasa de videos utiles mal marcados baja al 14,1% manteniendo una deteccion del 95,2% de videos distractores. La contrapartida es que el modelo empeora en ventanas que no son de YouTube, por lo que la aplicacion lo usa en combinacion con Sirius-Small: este ultimo juzga todas las ventanas excepto YouTube y Sirius-YouTube juzga solo YouTube.

Es relevante como ejemplo de modelo pequeno, cuantizado y de proposito muy especifico para una tarea de clasificacion en el borde (edge), con licencia MIT y entrenamiento reproducible a coste cero en hardware de consumo. No es un modelo generativo ni un asistente general: es un cross-encoder de tres clases con una ventana de contexto de 160 tokens.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT (cross-encoder) exportado a ONNX |
| Parametros totales | 33 millones |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 160 tokens (truncado en el tokenizador) |
| Tipos de cuantizacion | int8 (ONNX quantized); pesos PyTorch originales en el modelo base |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | ONNX (`model_quantized.onnx`, 32,49 MB); modelo base en safetensors/PyTorch |
| Tarea | Clasificacion de texto, 3 clases (`ON_TASK`, `BORDERLINE`, `RABBIT_HOLE`) |
| Modelo base | ansarbuilds/Sirius-Small-ONNX |
| Tamano del repositorio | 0,0 GB (segun Hugging Face) |

## Arquitectura y entrenamiento

La arquitectura es un transformer tipo BERT configurado como cross-encoder: recibe en una sola secuencia el objetivo del usuario y la ventana de navegacion separados por `[SEP]`, y produce tres logits correspondientes a `ON_TASK` (0), `BORDERLINE` (1) y `RABBIT_HOLE` (2). El formato de entrada del ejemplo es `"<objetivo> [SEP] NOW: <navegador> | <titulo> | <dominio>"`, truncado a 160 tokens. El modelo se exporta a ONNX y se cuantiza a int8, con una concordancia del 93,75% en la respuesta principal respecto al modelo PyTorch sobre 64 muestras.

El entrenamiento parte de Sirius-Small y se ejecuta durante 2 epocas en local sobre un Mac con chip M4 (coste de 0 USD) con el script `train_helpful.py`, sobre 24.000 ejemplos generados con `helpful_videos.py`. Las filas de videos utiles usan la respuesta correcta y el resto de filas copian la respuesta antigua de Sirius-Small, de modo que el modelo solo puede cambiar de opinion sobre paginas de video. Un primer intento sin esa regla marco el 44,5% de ventanas reales en tarea y fue descartado. No se usaron registros reales de ventanas ni historial de navegacion para el entrenamiento, ni salidas de OpenAI, Anthropic o Google/Gemma.

## Capacidades

- Clasificacion de texto en tres clases (`ON_TASK`, `BORDERLINE`, `RABBIT_HOLE`) con probabilidades por clase.
- Evaluacion de relevancia entre un objetivo declarado y una ventana de navegacion de YouTube (titulo, dominio y navegador).
- Umbral operativo documentado: marcar `RABBIT_HOLE` solo cuando la puntuacion es al menos 0,81.
- Inferencia en CPU con latencia de 5,0 ms p50 y 8,8 ms p95 en un Mac con M4.
- Ejecucion local sin llamadas a servicios externos, adecuada para procesamiento en el dispositivo.
- No soporta generacion de texto, tool calling, agentes, vision, audio ni razonamiento multi-paso.

## Casos de uso

- Filtro de distracciones en YouTube dentro de una app de concentracion: el modelo evalua cada pestana de `youtube.com` contra el objetivo activo del usuario y marca como `RABBIT_HOLE` solo los videos claramente ajenos, con umbral 0,81 para limitar falsos positivos.
- Deteccion de videos utiles con vocabulario distinto al objetivo: corrige el caso en que el objetivo es "File my 2026 taxes" y el video util se titula "How to fill out Form 1040", reduciendo los falsos positivos del 90,6% al 14,1%.
- Clasificacion en el dispositivo con privacidad: al ejecutarse como ONNX int8 en CPU local, el titulo de la ventana y el objetivo no salen del ordenador del usuario.
- Integracion en pipelines de escritorio en macOS: la latencia de 5 ms p50 permite clasificar cada cambio de pestana o de titulo sin introducir percepcion de retraso.
- Sistema de dos modelos por dominio: combinado con Sirius-Small, que juzga el resto de ventanas, permite mantener la precision global (73,3% en ventanas reales) sin degradar el comportamiento fuera de YouTube.
- Prototipado de clasificadores de relevancia de bajo coste: el enfoque de reentrenar un BERT de 33M con 24.000 ejemplos generados y exportarlo a int8 sirve como plantilla para tareas de filtrado especificas de dominio.
- Investigacion sobre sesgo de repeticion lexica en cross-encoders: el caso documenta como un clasificador aprende un atajo (repetir palabras del objetivo) y como corregirlo con datos especificos del dominio.

## Benchmarks y rendimiento

Resultados publicados por el autor, medidos en el motor propio de la aplicacion Sirius:

| Metrica | Solo Sirius-Small | Solo este modelo | Ambos (la app) |
|---|---:|---:|---:|
| Videos utiles mal marcados (64) | 90,6% | 14,1% | 14,1% |
| Videos distractores detectados (62) | 100% | 95,2% | 95,2% |
| Precision en benchmark (364 casos) | 99,3% | 100% | 100% |
| Recall en benchmark | 86,5% | 85,3% | 84,6% |
| Precision en ventanas reales (300 casos) | 73,8% | 64,9% | 73,3% |
| Recall en ventanas reales | 45,5% | 37,4% | 44,4% |
| Ventanas reales en tarea mal marcadas | 5,5% | 8,2% | 5,5% |
| Falsos avisos por 2 horas (replay) | 0,00 | 1,05 | 0,00 |

Datos adicionales: concordancia entre PyTorch e int8 ONNX del 93,75% en la respuesta principal (64 muestras); latencia en CPU sobre M4 de 5,0 ms p50 y 8,8 ms p95.

## Requisitos de hardware

- VRAM: no requiere GPU; el modelo int8 ocupa 32,49 MB y esta disenado para inferencia en CPU.
- GPU recomendadas: no aplica; el autor lo ejecuta en CPU de un Apple M4.
- Cabe en cualquier GPU de consumo, pero no es su objetivo de despliegue.
- Opciones de despliegue: ONNX Runtime (ejemplo oficial con `onnxruntime` y `transformers.AutoTokenizer`); tambien es posible servir el modelo base PyTorch con frameworks de clasificacion.
- Latencia medida: 5,0 ms p50 y 8,8 ms p95 en CPU M4. No se publican datos de throughput.
- Memoria RAM estimada: no disponible, aunque por el tamano del modelo es del orden de decenas de MB en int8.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Formato |
|---|---|---|---|---|---|
| Sirius-YouTube | 33M | 160 tokens | Clasificacion de relevancia en YouTube (3 clases) | MIT | ONNX int8 |
| Sirius-Small (modelo base) | 33M | 160 tokens | Clasificacion de relevancia en ventanas generales | MIT | ONNX int8 |
| BERT-base estandar | 110M | 512 tokens | Clasificacion de texto generica | Apache 2.0 | safetensors, ONNX |
| Cross-encoders de reranking (p. ej. ms-marco-MiniLM) | ~22M | 512 tokens | Reranking de recuperacion | Apache 2.0 | safetensors, ONNX |

No se dispone de resultados de benchmarks comparables entre estos modelos en la informacion proporcionada; las metricas de Sirius-YouTube son especificas del benchmark interno del autor y no son directamente trasladables.

## Limitaciones y advertencias

- El conjunto de prueba de videos esta escrito a mano y ninguna de las 20 ventanas reales de YouTube grabadas fue etiquetada como en tarea, por lo que el rendimiento con videos utiles reales no esta demostrado.
- 22 de las 126 filas de prueba usan un objetivo general que tambien aparece en el entrenamiento con otros titulos; sin esas filas, se marcan como distraccion 9 de 53 videos utiles.
- Las ventanas reales provienen de una sola persona durante 1,9 horas y se usaron para elegir entre configuraciones: deben tratarse como orientativas, no como prueba.
- No debe usarse solo en ventanas que no sean de YouTube: su precision (64,9%) y recall (37,4%) en ventanas reales son peores que los de Sirius-Small.
- Recall bajo en ventanas reales (37,4% en solitario, 44,4% en combinacion): se escapan aproximadamente la mitad de las distracciones reales.
- Genera 1,05 falsos avisos por cada 2 horas cuando se usa solo, frente a 0,00 del sistema combinado.
- Ventana de contexto de solo 160 tokens: no admite entradas largas ni razonamiento sobre contenido del video mas alla del titulo y el dominio.
- Idiomas soportados no documentados; no hay garantia de comportamiento fuera del ingles, dado que los ejemplos del model card estan en ingles.
- Riesgo de alucinacion no aplica en sentido generativo (es un clasificador), pero si existe riesgo de clasificacion erronea con confianza alta.
- No se documentan sesgos demograficos o culturales especificos; al entrenarse con datos generados, puede heredar los sesgos de los generadores empleados.
- Licencia MIT: permite uso comercial y modificacion con atribucion, sin restricciones adicionales documentadas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ansarbuilds/Sirius-YouTube
- Modelo base (Sirius-Small-ONNX): https://huggingface.co/ansarbuilds/Sirius-Small-ONNX
- Repositorio de codigo: https://github.com/ansarbuilds/sirius
