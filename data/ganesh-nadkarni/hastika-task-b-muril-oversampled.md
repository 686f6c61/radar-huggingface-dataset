# Ganesh-Nadkarni/hastika-task-b-muril-oversampled

## Resumen

`hastika-task-b-muril-oversampled` es un modelo de clasificación de texto obtenido por fine-tuning de `google/muril-base-cased` sobre la tarea B del shared task HASTIKA @ ICON-2026. Su objetivo es identificar la categoria objetivo de comentarios de odio (Gender, Political, Religion, Geo-political, Violence, Others) en comentarios de YouTube con mezcla de codigos kannada-ingles (kanglish). Lo desarrolla Ganesh-Nadkarni y se publica con licencia Apache 2.0.

Arquitectonicamente es un transformer encoder BERT-like de 237,5 millones de parametros, con tokenizador Multilingual Representations for Indian Languages (MURIL) adaptado a escritura kannada y latinizada. El contexto de entrenamiento se limita a 160 tokens, suficiente para comentarios cortos de YouTube, y el checkpoint se distribuye en safetensors para uso directo con `transformers`.

Su relevancia es acotada y muy especifica: cubre una laguna practica en moderacion de contenido para una combinacion linguistica poco representada (kannada code-mixed), pero el propio autor advierte que es un componente de un ensemble mayor y que su rendimiento individual es debil (macro-F1 de 0,286 en su split de validacion). Es, por tanto, una pieza de investigacion mas que un clasificador listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder BERT-like (base: `google/muril-base-cased`) |
| Parametros totales | 237.560.838 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 160 tokens (longitud maxima de entrenamiento) |
| Tipos de cuantizacion | no disponible (pesos safetensors en fp32; compatible con cuantizacion dinamica via `bitsandbytes` o conversion a ONNX, no documentado por el autor) |
| Idiomas soportados | kannada (kn), ingles (en); en la practica, texto code-mixed kannada-ingles (kanglish) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `google/muril-base-cased`, un encoder tipo BERT de 12 capas y 237,5 millones de parametros entrenado por Google Research India sobre texto multilingue indio. Sobre esa base se anade una cabeza de clasificacion con 6 etiquetas (Gender, Political, Religion, Geo-political, Violence, Others). No hay innovaciones arquitectonicas propias: es un fine-tuning estandar de clasificacion de secuencias.

El entrenamiento usa el split de entrenamiento del dataset HASTIKA con una particion estratificada 88/12 (entrenamiento/held-out), longitud maxima de 160 tokens, batch size 16, precision mixta y early stopping sobre macro-F1 de validacion. La tasa de aprendizaje es 1e-5. Para el desbalanceo de clases se aplica oversampling combinado con pesos de perdida amortiguados por raiz cuadrada (square-root-dampened loss weights). No se documenta el numero de tokens de entrenamiento ni el volumen exacto del dataset; el autor indica que es un dataset pequeno. No consta RLHF ni DPO, algo esperable en un clasificador.

## Capacidades

- Clasificacion de texto en 6 categorias de objetivo de odio: Gender, Political, Religion, Geo-political, Violence y Others.
- Procesamiento de texto code-mixed kannada-ingles (kanglish) en escritura nativa y latinizada, dentro de los limites del tokenizador MURIL.
- Salida de etiqueta unica por comentario (clasificacion multiclase de una sola etiqueta).
- Integracion directa con el pipeline `text-classification` de `transformers`.
- Compatible con Text Embeddings Inference (tag `text-embeddings-inference`) y con endpoints de Hugging Face (tag `endpoints_compatible`).
- No soporta tool calling, function calling, agentes, vision ni audio.
- No dispone de modo de razonamiento explicito ni generacion de texto libre.

## Casos de uso

- Moderacion asistida de comentarios en YouTube en kannada code-mixed: el modelo puede preclasificar comentarios por categoria de objetivo de odio para priorizar la revision humana, aunque su macro-F1 de 0,286 exige que el moderador valide cada decision.
- Investigacion en deteccion de hate speech multilingue: sirve como baseline reproducible para comparar tecnicas de oversampling y ponderacion de perdida en un dataset pequeno y desbalanceado.
- Componente de un ensemble: el autor lo diseno explicitamente como una pieza de un blend mayor, de modo que su uso previsto es combinarlo con otros clasificadores y agregar sus probabilidades.
- Etiquetado previo de corpus para anotacion: permite agrupar comentarios por categoria tematica antes de una anotacion manual, reduciendo el esfuerzo de triage.
- Analisis de discurso en redes sociales en comunidades kannada: agregacion de predicciones a nivel de canal o video para estudiar la distribucion de categorias de odio.
- Filtrado de bajo coste en pipelines de ingesta: al ser un encoder de 237 millones de parametros, puede ejecutarse en CPU o GPU modesta para descartar contenido claramente no relacionado antes de modelos mas caros.
- Evaluacion de robustez ante variantes de transliteracion: util como banco de pruebas para medir la degradacion del modelo ante dialectos, sarcasmo y lenguaje reclamado.

## Benchmarks y rendimiento

| Metrica | Valor | Contexto |
|---|---|---|
| Macro-F1 | 0,286 | Split held-out del propio autor (12 % del split de entrenamiento HASTIKA) |

No se han publicado resultados de benchmarks comparativos con otros modelos en la informacion disponible. El unico dato de rendimiento es el macro-F1 de 0,286 reportado por el autor en su split de validacion, que debe interpretarse con cautela: es una metrica de un checkpoint individual que el propio autor describe como debil y pensado para combinarse en un ensemble.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 1 GB para los pesos (237,5 M de parametros) mas overhead de activaciones; con batch pequeno cabe holgadamente en 2 GB.
- VRAM estimada en fp16: en torno a 0,5 GB de pesos; con cuantizacion dinamica int8, menos de 0,5 GB.
- GPU recomendadas: cualquier GPU consumer moderna sirve; una RTX 3060, RTX 4060 o superior ofrece throughput muy alto para este tamano. En entornos de servidor, T4, L4, A10G o A100 son mas que suficientes.
- Cabe en GPU consumer: si, en practicamente cualquier GPU con 2 GB o mas de VRAM, e incluso en CPU para volumenes moderados.
- Opciones de despliegue: `transformers` (pipeline `text-classification`), Text Embeddings Inference (soportado por tag), Hugging Face Inference Endpoints, y conversion a ONNX Runtime para CPU.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada. Por el tamano del modelo, se espera latencia de milisegundos por muestra en GPU consumer y de decenas de milisegundos en CPU, pero son estimaciones no verificadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Notas |
|---|---|---|---|---|---|
| `Ganesh-Nadkarni/hastika-task-b-muril-oversampled` | 237,5 M | 160 tokens | Clasificacion de objetivo de odio en kanglish | Apache 2.0 | Macro-F1 0,286 en held-out propio |
| `google/muril-base-cased` | 237,5 M | 512 tokens (arquitectura) | Representacion multilingue indigena (base) | Apache 2.0 | Modelo base sin fine-tuning para esta tarea |
| Otros sistemas del shared task HASTIKA Task B | no disponible | no disponible | Misma tarea | no disponible | No se dispone de resultados publicos en la informacion proporcionada |

No se dispone de datos verificables de otros modelos comparables especificos para kanglish en la informacion proporcionada. La comparacion con el modelo base es la mas directa: misma arquitectura y numero de parametros, pero el checkpoint fine-tuned reduce el contexto operativo a 160 tokens por decision de entrenamiento.

## Limitaciones y advertencias

- Rendimiento individual bajo: macro-F1 de 0,286 en el held-out del autor; el propio autor lo describe como un componente de un ensemble y "mas debil por si solo".
- Dataset de entrenamiento pequeno y desbalanceado, con oversampling y ponderacion de perdida como mitigacion; el riesgo de sobreajuste y de mal calibracion es alto.
- Errores esperables en dialectos, sarcasmo, lenguaje reclamado y variantes de transliteracion no vistas en entrenamiento.
- Contexto limitado a 160 tokens: comentarios largos se truncan y pueden perder la senal relevante.
- Solo dos idiomas declarados (kn, en) y en la practica solo la combinacion code-mixed kannada-ingles; no generaliza a otros pares linguisticos.
- Riesgo de sesgo: el modelo aprende las correlaciones del dataset HASTIKA, que puede sobrerrepresentar ciertos temas o estilos de escritura; no se documenta ninguna evaluacion de sesgo.
- Riesgo de alucinacion no aplica en sentido estricto (es un clasificador), pero si de falsos positivos y falsos negativos con impacto directo en moderacion.
- Uso previsto segun el autor: investigacion y asistencia a moderadores humanos, no sustitucion. La licencia Apache 2.0 permite uso comercial, pero el autor recomienda revisar los terminos del dataset HASTIKA antes de cualquier otro uso.
- El dataset no se distribuye con el modelo; la reproducibilidad completa requiere acceso al corpus HASTIKA bajo sus propios terminos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Ganesh-Nadkarni/hastika-task-b-muril-oversampled
- Modelo base: https://huggingface.co/google/muril-base-cased
- Referencia del dataset y shared task: Kavatagi, S. and Rachh, R. (2025). HASTIKA: hate speech and target identification in Kannada-English code-mixed text. *Language Resources and Evaluation*, 59(3):2811-2856.
- Shared task HASTIKA @ ICON-2026: no disponible (no se proporciona URL en la informacion).
