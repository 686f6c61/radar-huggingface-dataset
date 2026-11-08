# aiden-jeon/minipfn-tabpfn-v2-5-regressor

## Resumen

MiniPFN TabPFN-2.5 regressor es una reimplementación desde cero del regresor TabPFN-2.5, publicada por el desarrollador independiente aiden-jeon bajo licencia Apache 2.0. TabPFN es una familia de modelos fundacionales para datos tabulares basados en el paradigma de redes ajustadas al prior (prior-data-fitted networks, PFN): en lugar de entrenar un modelo por tabla, se entrena una red Transformer que aprende a resolver tareas de regresión en contexto a partir de un prior sintético de tablas. El modelo aplica las cuatro modificaciones arquitectónicas que el informe TabPFN-2.5 (arXiv:2511.08667, 2025) atribuye a su versión 2.5 sobre la arquitectura del Transformer de TabPFN v2.

El modelo tiene 14.675.729 parámetros y se distribuye en formato safetensors con pesos en PyTorch, con un tamaño de repositorio de 0,4 GB. No es el checkpoint oficial de TabPFN-2.5 ni usa código o pesos oficiales: el autor indica que el informe no publica la anchura del modelo, los detalles del prior ni la receta de entrenamiento, por lo que esas partes son decisiones propias. Está pensado para regresión tabular sobre tablas pequeñas y medianas, con soporte de hasta 500 características y hasta 8.192 filas de entrenamiento según la cobertura del entrenamiento.

Su relevancia actual radica en que reproduce de forma abierta (Apache 2.0) las innovaciones del estado del arte en modelos fundacionales tabulares, un área donde los pesos oficiales suelen estar bajo licencias restrictivas. El autor mantiene además un clasificador separado (minipfn-tabpfn-v2-5-classifier) y una reimplementación previa de TabPFN v2, lo que permite comparar directamente el efecto de los cambios de la versión 2.5.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tipo cell_transformer (TabPFN v2 con las cuatro modificaciones de TabPFN-2.5) |
| Parametros totales | 14.675.729 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible como ventana de tokens; admite cualquier numero de caracteristicas y filas, entrenado hasta 500 caracteristicas y 8.192 filas |
| Tipos de cuantizacion | no disponible (pesos en bf16 para entrenamiento; no se documentan cuantizaciones publicadas) |
| Idiomas soportados | no aplica (modelo tabular, no linguistico) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (PyTorch) |

## Arquitectura y entrenamiento

La arquitectura parte del Transformer de TabPFN v2 e incorpora las cuatro modificaciones que el informe TabPFN-2.5 describe: 18 capas (frente a 12 en v2), 3 características por token (frente a 2), 64 filas "thinking" aprendidas colocadas antes de las filas de entrenamiento a las que atiende cada fila, y un codificador de celda implementado como MLP de 2 capas (Linear → GELU → Linear con tamaño oculto igual a emsize) en lugar de una capa lineal. La dimensión de embedding es 192, con 6 cabezas, MLP de 4× emsize y post-LayerNorm sin parámetros afines (heredado de v2). La salida es una distribución de barras sobre 5.000 cubos del objetivo estandarizado, con colas half-normal; los bordes de los cubos son cuantiles del prior y se distribuyen con los pesos (campo `borders` en `model.safetensors`).

El entrenamiento consta de dos etapas con batch de 64 tablas, bf16 y clipping de gradiente 1.0. La primera, de ajuste al prior, dura 500.000 pasos con tamaños de tabla del paper de v2 (1–2.048 filas de entrenamiento más 128 de validación, 1–160 características, menos de 75.000 celdas, valores ausentes en el 30% de las tablas), Adam con lr 2e-4, 10.000 pasos de warmup y schedule coseno sobre 2M pasos. La pérdida colapsó dos veces (en los pasos 155k y 216k) y se recuperó rebobinando a un estado sano y reduciendo a la mitad el lr base. La segunda etapa, de tablas largas, dura 20.000 pasos con filas de entrenamiento log-uniformes entre 512 y 8.192, hasta 500 características y menos de 400.000 celdas, partiendo de los pesos de 500k con optimizador nuevo y lr 5e-5. El prior es el grafo SCM de TabICL en modo regresión con las reglas de tamaño de tabla de TabPFN v2. El cómputo total fue de aproximadamente 650 horas H100 (8×H100, 16×H100 y 32×H100 según la fase), unas 37 horas de reloj.

Dos cambios propios respecto al regresor TabPFN v2 del autor se mantienen y no aparecen en el paper: objetivos dequantizados (los objetivos repetidos se reparten uniformemente sobre los 100 cubos vecinos durante el entrenamiento) y QK-clip con τ = 250 (cada 50 pasos se reescalan W_q y W_k de las cabezas cuya cota de logits supera 250, para evitar attention sinks). En inferencia se usa un ensemble de 8 miembros, cada uno con barajado de características y una columna identificadora de fila aleatoria; los miembros alternan entre características por cuantiles más componentes SVD y escalado robusto con soft clipping estilo RealMLP, y la mitad aplican además power transform al objetivo. Las columnas categóricas con hasta 20 categorías se codifican one-hot en cada miembro.

## Capacidades

- Regresión tabular en contexto: predice una distribución sobre el objetivo a partir de filas de entrenamiento y consulta, sin ajuste de parámetros por tabla.
- Manejo de cualquier número de características y filas, con cobertura de entrenamiento hasta 500 características y 8.192 filas.
- Soporte de valores ausentes (entrenado con un 30% de tablas con datos faltantes).
- Soporte de variables categóricas mediante one-hot encoding automático para columnas con hasta 20 categorías.
- Salida probabilística: distribución de barras sobre 5.000 cubos, con capacidad de obtener intervalos de predicción.
- Ensemble interno de 8 miembros con diversidad por barajado de características, columna de identificador de fila y transformaciones alternativas.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades lingüísticas: es un modelo puramente tabular.
- No dispone de modo thinking explícito para el usuario; las 64 filas "thinking" son un componente interno de la arquitectura.

## Casos de uso

- Predicción de precios o demanda con datos tabulares pequeños: el modelo puede ingerir directamente la tabla de entrenamiento como contexto y predecir sobre nuevas filas sin reentrenamiento, lo que lo hace adecuado para escenarios con cientos o miles de registros donde un GBDT requeriría ajuste y validación por tabla.
- Scoring de riesgo crediticio o de seguros: la salida es una distribución completa sobre el objetivo, lo que permite extraer cuantiles e intervalos de confianza además del valor puntual, útil para decisiones con umbrales regulatorios.
- Prototipado rápido en ciencia de datos: al no requerir entrenamiento por tarea, sirve para obtener una línea base competitiva en minutos sobre datasets tabulares de OpenML o internos.
- Imputación y análisis de datos con valores ausentes: el soporte nativo de missing values y el one-hot automático permiten usarlo sobre tablas sin preprocesado extenso.
- Benchmarking de modelos fundacionales tabulares: al ser una reproducción abierta de TabPFN-2.5 con pesos Apache 2.0, permite comparar el efecto de las modificaciones arquitectónicas frente a la reimplementación de TabPFN v2 del mismo autor sobre los mismos datasets.
- Investigación sobre PFN y aprendizaje en contexto: el código y las recetas están publicados (modelo en `src/minipfn/models/cell_transformer.py`, ajustes en `src/minipfn/recipes/tabpfn_v2.py`), lo que facilita experimentar con el prior, el tamaño de tabla y las modificaciones de entrenamiento.

## Benchmarks y rendimiento

La model card reporta resultados sobre los 28 datasets de regresión del paper de TabPFN v2, con RMSE promediado sobre los 10 folds de OpenML y comparación mediante la ratio de RMSE respecto a los valores del paper (por debajo de 1 es mejor), agregada como media geométrica. La información disponible no incluye la tabla numérica completa de resultados ni los valores finales de las ratios, por lo que no se presentan cifras concretas.

Datos de entrenamiento reportados: NLL de validación final de −1.405 sobre 64 tablas del prior a tamaños del paper y de −1.680 sobre 32 tablas largas en la segunda etapa (conjuntos no comparables entre sí). El checkpoint evaluado es `step_0020000.pt` de la etapa de tablas largas, partiendo de `step_0500000.pt` de la primera etapa.

## Requisitos de hardware

- VRAM estimada para inferencia: con 14,7M parámetros, los pesos en bf16 ocupan aproximadamente 30 MB; el consumo real lo domina el tamaño de la tabla de contexto (hasta 500 características × 8.192 filas) y el ensemble de 8 miembros, no los pesos.
- GPU recomendadas: cualquier GPU con suficiente memoria para la tabla de entrada; el entrenamiento se realizó en H100 (8 a 32 GPUs según la fase).
- Cabe en GPU de consumo: sí, previsiblemente en RTX 4090, RTX 3090 y GPUs con 8–24 GB para tablas de tamaño moderado; para tablas en el límite de entrenamiento (8.192 filas × 500 características) la memoria de activaciones del ensemble puede requerir más VRAM.
- Opciones de despliegue: PyTorch nativo y el paquete TabPFN (la model card enlaza instrucciones de uso con la librería TabPFN); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / tamano de tabla | Licencia | Disponibilidad |
|---|---|---|---|---|
| minipfn TabPFN-2.5 regressor (este) | 14.675.729 | Hasta 500 caracteristicas y 8.192 filas (cobertura de entrenamiento) | Apache 2.0 | Hugging Face, pesos safetensors |
| minipfn TabPFN v2 regressor (aiden-jeon) | no disponible | Reglas de tamano de tabla de TabPFN v2 | no disponible en la informacion | Hugging Face |
| TabPFN-2.5 oficial (PriorLabs) | no disponible | no disponible | TABPFN-2.5 License (restrictiva) | Pesos oficiales bajo su licencia |
| TabICL (soda-inria) | no disponible | no disponible | no disponible en la informacion | Repositorio GitHub; usado como fuente del prior |

La comparación de rendimiento entre estos modelos no está disponible con cifras en la información proporcionada, salvo la referencia cualitativa de que la model card compara la ratio de RMSE de este modelo frente a los valores del paper de TabPFN v2 y frente a la reimplementación v2 del mismo autor.

## Limitaciones y advertencias

- No es el checkpoint oficial de TabPFN-2.5: usa código y pesos propios, y varios detalles (anchura, prior, receta, colocación de las filas thinking, escalado robusto) son elecciones del autor no especificadas en el informe.
- Cobertura limitada a tablas de hasta 500 características y 8.192 filas de entrenamiento; fuera de ese rango el comportamiento no está garantizado.
- El one-hot automático solo cubre columnas categóricas con hasta 20 categorías y únicamente si la tabla resultante respeta el límite de características.
- Riesgo de sobreajuste al prior sintético de TabICL: el rendimiento en dominios tabulares muy alejados de la distribución del prior no está caracterizado en la información disponible.
- No se han publicado análisis de sesgos ni de robustez frente a distribuciones desplazadas; al ser un modelo tabular, los sesgos dependerán de los datos de la tabla de entrada y no del modelo en sí.
- La licencia Apache 2.0 permite uso comercial, pero no cubre los pesos oficiales de TabPFN-2.5, que están bajo la TABPFN-2.5 License y no deben confundirse con este modelo.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado y actualizado el mismo día: no hay validación externa de la comunidad.
- No se documentan cuantizaciones publicadas ni latencias medidas, lo que dificulta planificar despliegues en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/aiden-jeon/minipfn-tabpfn-v2-5-regressor
- Clasificador asociado: https://huggingface.co/aiden-jeon/minipfn-tabpfn-v2-5-classifier
- Regresor TabPFN v2 del mismo autor: https://huggingface.co/aiden-jeon/minipfn-tabpfn-v2-regressor
- Clasificador TabPFN v2 del mismo autor: https://huggingface.co/aiden-jeon/minipfn-tabpfn-v2-classifier
- Codigo: https://github.com/Aiden-Jeon/minipfn
- Paper TabPFN-2.5: https://arxiv.org/abs/2511.08667
- Repositorio TabPFN oficial: https://github.com/PriorLabs/TabPFN
- Prior TabICL: https://github.com/soda-inria/tabicl
