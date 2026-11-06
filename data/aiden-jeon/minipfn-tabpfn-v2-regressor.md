# aiden-jeon/minipfn-tabpfn-v2-regressor

## Resumen

minipfn-tabpfn-v2-regressor es una reimplementación desde cero del regresor TabPFN v2, el modelo fundacional para datos tabulares presentado por Hollmann et al. en Nature (2025). Lo publica el desarrollador independiente aiden-jeon bajo licencia Apache 2.0, y no debe confundirse con el checkpoint oficial de PriorLabs: no comparte ni código ni pesos con el modelo original, aunque sigue la metodología del artículo y emplea el prior abierto TabICL como fuente de datos sintéticos de entrenamiento.

El modelo resuelve regresión tabular en contexto (*in-context learning*): recibe el conjunto de entrenamiento y las filas a predecir en un único forward pass, sin ajuste de parámetros ni entrenamiento adicional por tarea. Con solo 11,09 millones de parámetros y un tamaño de repositorio de 0,2 GB, está pensado para tablas pequeñas (hasta 2.048 filas de entrenamiento y 160 características), que es precisamente el régimen donde los gradient boosting tradicionales suelen quedarse cortos por falta de datos.

Es relevante porque demuestra que un modelo de ~11 M de parámetros, entrenado con ~530 horas de H100, puede acercarse al TabPFN v2 original en 21 de los 28 conjuntos de regresión del benchmark del paper, con un ratio de RMSE geométrico de 1,118 frente al modelo de referencia. Es un caso útil tanto para investigadores que quieran reproducir el pipeline como para desarrolladores que necesiten un regresor tabular pequeño, autoalojado y con licencia permisiva.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer TabPFN v2 (12 capas, emsize 192, 6 cabezas, MLP 4× emsize; atención alterna sobre características y sobre filas) |
| Parámetros totales | 11.087.057 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible como ventana de tokens; límites de entrada: hasta 160 características y hasta 2.048 filas de entrenamiento (+128 filas de validación retenidas) |
| Tipos de cuantización | no disponible (pesos en safetensors; no se documentan variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | no aplica (modelo numérico/tabular, no procesa lenguaje natural) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (incluye el tensor `borders` con los límites de los 5.000 buckets) |

## Arquitectura y entrenamiento

El modelo es un transformer de 12 capas con dimensión de embedding 192 y 6 cabezas de atención. Cada capa aplica primero atención entre características y después atención entre filas, con LayerNorm posterior sin parámetros afines; cada token codifica 2 características. La salida no es un escalar, sino una distribución de barras sobre 5.000 buckets del objetivo estandarizado, con colas half-normal, cuyos bordes son cuantiles de los objetivos del prior y viajan dentro de los pesos. La entrada admite cualquier número de características y filas, aunque el entrenamiento cubrió hasta 160 características y 2.048 filas.

El entrenamiento usa el prior SCM de grafos de TabICL en modo regresión, con las reglas de tamaño de tabla del paper: filas uniformes entre 1 y 2.048 más 128 filas retenidas, número de características con distribución Beta(0,95; 8,0) escalado a 1–160, menos de 75.000 celdas por tabla y un 30 % de tablas con valores faltantes aleatorios a una tasa del 0–30 %. Se entrenaron 500.000 pasos con batch de 64 tablas, Adam a lr 2e-4 con 10.000 pasos de warmup y schedule coseno sobre 2 M de pasos, en bf16 y con clipping de gradiente 1,0, usando 8×H100 (pasos 0–200k) y 32×H100 (200k–500k) durante unas 28 horas de reloj (~530 horas H100). El NLL de validación final es −1,401.

El autor documenta tres modificaciones no presentes en el paper para estabilizar el entrenamiento: dequantización de objetivos discretos (reparto uniforme sobre los 100 buckets vecinos durante el entrenamiento), QK-clip con τ = 250 aplicado cada 50 pasos a las cabezas de atención entre filas para evitar *attention sinks*, y un mecanismo de recuperación ante colapso de la loss (que no llegó a activarse). En inferencia se usa el ensemble por defecto de 8 miembros, cada uno con barajado de características, columna identificadora de fila aleatoria, alternancia entre cuantiles + componentes SVD y transformación Yeo-Johnson, y one-hot de categóricas con hasta 20 categorías.

## Capacidades

- Regresión tabular en contexto: predice sobre filas nuevas sin reentrenar, pasando el conjunto de entrenamiento completo en el propio forward pass.
- Predicción distribucional: devuelve una distribución de barras sobre 5.000 buckets, lo que permite extraer media, mediana, cuantiles e intervalos de credibilidad además del punto estimado.
- Manejo nativo de valores faltantes (entrenado con tasas de missing del 0–30 %).
- Codificación automática de variables categóricas de hasta 20 categorías mediante one-hot.
- Robustez a distintas escalas de entrada gracias a las transformaciones por miembro (cuantiles + SVD, Yeo-Johnson, power transform del objetivo).
- Ensemble interno de 8 miembros con promediado en la escala original del objetivo.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generación de texto: es un modelo puramente numérico.
- No tiene capacidades multilingües, de visión ni de audio.

## Casos de uso

- Predicción de precios y valoraciones con pocos datos: en carteras inmobiliarias o de seguros con cientos de registros históricos, el modelo ofrece regresión con intervalos de credibilidad sin necesidad de entrenar un XGBoost por cada segmento.
- Modelado de riesgo crediticio en carteras pequeñas: con tablas de clientes por debajo de 2.048 filas, se puede obtener la distribución del importe de impago y derivar la probabilidad de superar un umbral a partir de los cuantiles de la distribución de barras.
- Estimación de demanda y series transversales: para productos con histórico corto, se pasa la tabla de características (precio, estacionalidad, región) y se obtienen predicciones puntuales y bandas de error en un solo paso.
- Análisis científico con muestras reducidas: en experimentos de laboratorio o estudios clínicos piloto donde no hay volumen para un gradient boosting fiable, el prior aprendido actúa como regularizador implícito.
- Baseline rápido en pipelines de AutoML: sirve como referencia de calidad en minutos, ya que no requiere búsqueda de hiperparámetros ni validación cruzada para producir predicciones razonables.
- Imputación y análisis de sensibilidad: la salida distribucional permite estimar la incertidumbre de cada predicción individual y detectar filas atípicas o mal representadas por el prior.
- Evaluación comparativa de métodos tabulares: investigadores pueden usar el checkpoint como referencia reproducible (Apache 2.0) frente a TabPFN oficial o TabICL en sus propios conjuntos.

## Benchmarks y rendimiento

El benchmark son los 28 conjuntos de regresión del paper, con RMSE promediado sobre los 10 folds de OpenML. La métrica principal es el ratio de RMSE frente al TabPFN v2 del paper por conjunto (menor que 1 es mejor), agregado por media geométrica.

| Checkpoint | Ratio RMSE, media geom. | Ratio RMSE, mediana | Conjuntos dentro de 1,1× | Media de RMSE negativo |
|---|---|---|---|---|
| 100k pasos | 1,167 | 1,059 | 18/28 | −1802,8 |
| 200k pasos | 1,183 | 1,057 | 20/28 | −1826,3 |
| 300k pasos | 1,159 | 1,026 | 19/28 | −1822,5 |
| 400k pasos | 1,172 | 1,041 | 18/28 | −1751,3 |
| 500k pasos (este modelo) | 1,118 | 1,023 | 21/28 | −1706,4 |
| Paper (TabPFN v2) | 1 | 1 | 28/28 | −1685,6 |

Supera al paper en 7 conjuntos (por ejemplo, socmob 0,93×; geographical_origin_of_music, boston y MIP-2016-regression en torno a 0,98×). La mayor parte de la brecha se concentra en cuatro conjuntos:

| Conjunto | Ratio RMSE |
|---|---|
| auction_verification | 2,66 |
| cpu_activity | 2,25 |
| grid_stability | 1,42 |
| airfoil_self_noise | 1,32 |

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; con 11,09 M de parámetros en bf16 los pesos ocupan unos 22 MB, y el consumo dominante es el ensemble de 8 miembros y las tablas de entrada (hasta 2.048 × 160 celdas). Cabe holgadamente en cualquier GPU con 4–8 GB.
- GPU recomendadas: H100 o A100 para lotes grandes de tablas en evaluación masiva; RTX 4090, RTX 3090, L4 o incluso GPUs de 8 GB para uso individual.
- Cabe en GPU de consumo: sí, en cualquier tarjeta moderna con al menos ~4 GB de VRAM; también es viable en CPU para tablas pequeñas, aunque el ensemble de 8 miembros multiplica el coste.
- Opciones de despliegue: PyTorch nativo (librería declarada), carga directa de safetensors; el autor publica el código en el repositorio `Aiden-Jeon/minipfn` (`src/minipfn/tabpfn_v2/`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles en la información proporcionada. Como referencia de coste de entrenamiento, el autor reporta ~530 horas H100 para 500.000 pasos con batch de 64 tablas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / límites de entrada | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| minipfn-tabpfn-v2-regressor | 11,09 M | 160 características, 2.048 filas | Ratio RMSE 1,118 (media geom.) frente al paper | Apache 2.0 | Hugging Face (aiden-jeon) |
| TabPFN v2 oficial (PriorLabs) | no disponible en la información | no disponible en la información | Referencia del benchmark (ratio 1,0) | no disponible en la información | GitHub PriorLabs/TabPFN |
| TabICL | no disponible en la información | no disponible en la información | no disponible en la información | no disponible en la información | GitHub soda-inria/tabicl (usado como prior) |
| minipfn-tabpfn-v2-classifier | no disponible en la información | misma arquitectura, cabeza de clasificación | no disponible en la información | Apache 2.0 | Hugging Face (aiden-jeon) |

## Limitaciones y advertencias

- No es el checkpoint oficial de TabPFN v2: no usa código ni pesos oficiales, por lo que los resultados no son intercambiables con los del modelo de PriorLabs.
- Brecha clara en cuatro conjuntos del benchmark (auction_verification 2,66×, cpu_activity 2,25×, grid_stability 1,42×, airfoil_self_noise 1,32×), que el autor señala como persistentes en todos los checkpoints.
- Límites de entrada acotados: hasta 160 características y 2.048 filas de entrenamiento; fuera de ese régimen el comportamiento no está garantizado.
- Entrenamiento detenido a 500.000 pasos con el learning rate aún en 1,7e-4, es decir, sin schedule completado; es probable que exista margen de mejora con más entrenamiento.
- Las tres modificaciones de estabilización (dequantización de objetivos, QK-clip, guardia de colapso) no están en el paper, de modo que el comportamiento difiere del original en detalles de entrenamiento.
- Riesgo de alucinación en sentido estadístico: al ser un modelo generativo sobre un prior, puede producir predicciones confiadas pero sesgadas en distribuciones alejadas del prior TabICL (por ejemplo, objetivos con estructura multimodal fuerte o dependencias no capturadas por el SCM).
- Sin datos publicados sobre sesgos por subgrupo, calibración fuera del benchmark o comportamiento con valores faltantes no aleatorios (el entrenamiento solo cubre missing aleatorio).
- No apto para texto, visión, audio, tool calling ni tareas de agente; su uso en producción debe limitarse a regresión tabular.
- Licencia Apache 2.0 permite uso comercial, pero al derivar del método y del prior de terceros conviene revisar las condiciones de TabICL y citar el paper original.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso en producción ni de validación independiente por la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/aiden-jeon/minipfn-tabpfn-v2-regressor
- Modelo clasificador hermano: https://huggingface.co/aiden-jeon/minipfn-tabpfn-v2-classifier
- Código: https://github.com/Aiden-Jeon/minipfn
- Paper de TabPFN v2 (Hollmann et al., Nature 637, 2025): https://doi.org/10.1038/s41586-024-08328-6
- TabPFN oficial (PriorLabs): https://github.com/PriorLabs/TabPFN
- Prior TabICL: https://github.com/soda-inria/tabicl
