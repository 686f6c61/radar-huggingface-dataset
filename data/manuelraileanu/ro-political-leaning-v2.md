# manuelraileanu/ro-political-leaning-v2

## Resumen

`manuelraileanu/ro-political-leaning-v2` es un modelo de clasificación de texto fine-tuneado sobre `dumitrescustefan/bert-base-romanian-cased-v1` para puntuar la inclinación política de textos en rumano. A diferencia de la versión anterior (`ro-political-leaning`), que usaba una cabeza de clasificación de 6 clases sobre XLM-RoBERTa, este modelo emplea una única cabeza de regresión que devuelve un valor continuo en el eje `-1.0 .. +1.0`, donde los valores negativos representan posiciones de izquierda y los positivos de derecha.

El modelo fue desarrollado por `manuelraileanu` para analizar el espectro político rumano, con un conjunto de datos ampliado que combina textos de redes sociales sobre las elecciones presidenciales de 2024-2025 y comentarios de lectores en artículos de noticias. Las etiquetas fueron generadas automáticamente con `gemma2:9b` local, excluyendo las filas sin una postura clara. Su relevancia radica en permitir análisis cuantitativos de sesgo político en textos rumanos, una tarea con pocos recursos específicos en ese idioma.

La arquitectura es un transformer encoder-only BERT con 124 millones de parámetros y una longitud de contexto de 512 tokens. El modelo está publicado bajo licencia Apache 2.0 y disponible en formato safetensors.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT (encoder-only transformer) |
| Parametros totales | 124.442.113 |
| Parametros activos | No procede (no es MoE) |
| Longitud de contexto | 512 tokens (max_length) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Rumano (ro) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `bert-base-romanian-cased-v1`, un BERT base preentrenado en rumano, y lo fine-tunea con una cabeza de regresión lineal sobre la representación `[CLS]`. La salida es un único valor escalar que se interpreta como el punto medio de una de las siete clases políticas: `far_left` (-1.0), `left` (-0.6), `center_left` (-0.3), `center` (0.0), `center_right` (+0.3), `right` (+0.6) y `far_right` (+1.0).

El entrenamiento se realizó sobre un conjunto extendido de 72.400 muestras de entrenamiento y 8.045 de prueba (división estratificada al 10%, semilla 42). Las etiquetas fueron generadas con `gemma2:9b` vía Ollama, y las filas sin postura clara (`unclear`) se excluyeron. Las fuentes de datos son `petrematei/ro-political` (~120k textos sobre las elecciones presidenciales rumanas de 2024-2025) y `readerbench/news-ro-offense` (comentarios de lectores en noticias rumanas).

El fine-tuning se ejecutó en fp16 con `batch_size=16`, `grad_accum=2`, `max_length=512`, `weight_decay=0.01`, `learning_rate=6e-05`, 7 épocas, pérdida MSE y early stopping sobre MAE con paciencia 2. No se aplicaron técnicas de RLHF ni DPO. La innovación principal es la sustitución de una clasificación discreta por una regresión continua, lo que permite una granularidad mayor en la puntuación y evita la fusión de `far_left` con `left` que sí ocurría en la v1.

## Capacidades

- Genera una puntuación de inclinación política en rumano dentro del rango `[-1.0, +1.0]` para cualquier texto de entrada.
- Distingue siete clases políticas: extrema izquierda, izquierda, centro-izquierda, centro, centro-derecha, derecha y extrema derecha.
- Acepta secuencias de hasta 512 tokens, suficiente para párrafos, comentarios y artículos cortos.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión ni audio.
- No es un modelo generativo: no produce texto, solo una puntuación de regresión.
- Es monolingüe: solo funciona con texto en rumano.

## Casos de uso

- Análisis de sesgo en medios de comunicación rumanos: un investigador puede clasificar cientos de artículos de prensa y calcular la media de la puntuación para cuantificar la inclinación editorial de cada medio.
- Monitorización de redes sociales durante campañas electorales: puntuar publicaciones de Twitter o Facebook sobre candidatos para detectar desplazamientos de opinión a lo largo del tiempo.
- Moderación de comunidades online: identificar comentarios con carga política extrema (valores cercanos a -1.0 o +1.0) para priorizar su revisión manual en foros de noticias.
- Investigación académica en ciencias políticas: analizar corpus de discursos parlamentarios o programas electorales rumanos y comparar el posicionamiento de diferentes partidos.
- Detección de polarización en comentarios de lectores: usar el modelo sobre el dataset `news-ro-offense` para estudiar cómo se distribuyen las opiniones políticas en los comentarios de noticias.
- Herramienta de apoyo al periodismo: clasificar hilos de conversación o secciones de comentarios para resumir la inclinación política dominante en una comunidad.
- Evaluación de sesgos en contenido generado por IA: puntuar textos rumanos generados por modelos de lenguaje para comparar su sesgo político y detectar posibles alineamientos.

## Benchmarks y rendimiento

El modelo card reporta los siguientes resultados sobre el conjunto de test (8.045 muestras):

| Metrica | Valor |
|---|---|
| Eval MAE | 0.181 |
| Eval RMSE | 0.303 |
| Exact class accuracy | 0.610 |
| Adjacent-class accuracy | 0.884 |
| Pearson correlation | 0.606 |

No se han publicado resultados de benchmarks comparativos con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: ~0.5 GB en fp32 y ~0.25 GB en fp16 para los pesos, más el overhead de activaciones; en la práctica, inferencia con lotes pequeños requiere menos de 1 GB de VRAM.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM, como NVIDIA GTX 1050, T4, RTX 3060 o superiores. También puede ejecutarse en CPU sin problemas.
- Cabe en cualquier GPU de consumo actual.
- Opciones de despliegue: Transformers (PyTorch), ONNX Runtime o TensorFlow. No es compatible con llama.cpp ni Ollama por ser un modelo encoder-only.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Contexto | Salida | Licencia |
|---|---|---|---|---|---|
| ro-political-leaning-v2 | BERT base rumano | 124M | 512 | Regresión -1.0..+1.0 (7 clases) | Apache 2.0 |
| ro-political-leaning (v1) | XLM-RoBERTa base | no disponible | no disponible | Clasificación de 6 clases | Apache 2.0 |
| bert-base-romanian-cased-v1 | BERT base | 124M | 512 | Sin fine-tuning | Apache 2.0 |

La v2 es más ligera que la v1 (0.5 GB frente a 1.13 GB) y amplía la salida de 6 a 7 clases, incluyendo `far_left` como categoría independiente. La v1 usa XLM-RoBERTa, que es multilingüe, mientras que la v2 se especializa exclusivamente en rumano.

## Limitaciones y advertencias

- Las etiquetas fueron generadas por `gemma2:9b`, lo que introduce sesgos y errores inherentes al modelo generador; la calidad de la supervisión depende de su alineación política y precisión.
- El dataset proviene de redes sociales y comentarios de noticias, lo que puede sesgar el modelo hacia el lenguaje informal y determinados temas electorales.
- El modelo solo funciona en rumano; no generaliza a otros idiomas.
- La puntuación es una aproximación discreta en puntos medios de clase, no una medida continua absoluta de ideología.
- Puede producir puntuaciones inexactas en textos ambiguos, irónicos o que mezclan posturas políticas.
- La licencia Apache 2.0 permite uso comercial, pero el modelo no incluye garantías de imparcialidad ni de exactitud para decisiones automatizadas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/manuelraileanu/ro-political-leaning-v2
- Versión anterior (v1): https://huggingface.co/manuelraileanu/ro-political-leaning
- Dataset ro-political: https://huggingface.co/datasets/petrematei/ro-political
- Dataset news-ro-offense: https://huggingface.co/datasets/readerbench/news-ro-offense
- Modelo base: https://huggingface.co/dumitrescustefan/bert-base-romanian-cased-v1
