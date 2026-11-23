# aiden-jeon/minipfn-tabpfn-v3-5

## Resumen

minipfn TabPFN-3.5 es una reimplementación desde cero del modelo TabPFN-3.5 de Prior Labs, publicada por el desarrollador independiente aiden-jeon. Se trata de una red neuronal de tipo *prior-data-fitted network* (PFN) especializada en aprendizaje en contexto (*in-context learning*) sobre datos tabulares, capaz de resolver tanto clasificación como regresión con un único conjunto de pesos. El modelo no se entrena por gradiente sobre el conjunto de test: recibe la tabla de entrenamiento y la de test como una sola secuencia y predice directamente, sin ajuste de parámetros en tiempo de inferencia.

La arquitectura sigue el esquema de tres etapas de TabPFN-3 (codificador de celda, etapa de columna y etapa de fila) con las modificaciones descritas en el informe técnico de TabPFN-3.5. El modelo tiene 218.826.424 parámetros, de los cuales 204.476.336 son compartidos por ambas tareas, 5.027.456 son exclusivos de clasificación y 9.322.632 exclusivos de regresión. Soporta hasta 1.000.000 de filas de entrenamiento y 6.000 características según los límites recomendados en el informe, aunque el entrenamiento solo cubrió hasta 60.000 filas y 100 características.

Es relevante ahora porque ofrece una alternativa reproducible y con licencia Apache-2.0 a los checkpoints oficiales de TabPFN, que se distribuyen bajo su propia licencia. El autor entrena únicamente con el prior abierto TabICL y el currículo de tres etapas de TabICLv2, y documenta explícitamente qué partes son propias (receta de entrenamiento, prior, número de capas) y cuáles siguen los informes oficiales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Column-row transformer con etapa in-context (column → row → in-context) |
| Parametros totales | 218.826.424 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | Hasta 1.000.000 filas de entrenamiento y 6.000 características (límites recomendados); entrenado hasta 60.000 filas y 100 características |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo tabular, no lingüístico) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (librería pytorch) |

## Arquitectura y entrenamiento

El modelo sigue el diseño de TabPFN-3 con los cambios de TabPFN-3.5. El codificador de celda normaliza z cada característica sobre las filas de entrenamiento y añade un indicador para celdas ausentes; cada token de característica agrupa tres features (j, j+1, j+3 con envolvente). La versión 3.5 añade 32 frecuencias de Fourier aprendidas y rangos ECDF dentro de columna, seguidos de LayerNorm, con anchura 128. La etapa de columna consta de 3 bloques por columna, cada uno con 128 puntos inductores que resumen las filas de entrenamiento (induced set attention); las filas de test leen el resumen pero nunca se atienden entre sí. La etapa de fila usa 3 bloques con 8 tokens CLS aprendidos por fila (RoPE), cuyas salidas se concatenan en un vector de fila de 1.024 dimensiones. La etapa in-context tiene 24 capas, 16 cabezas, QK-norm y QASSMax (query-aware scalable softmax); las filas de entrenamiento se atienden entre sí y las de test solo a las de entrenamiento, mediante una única cabeza key/value. La salida de clasificación usa un decodificador de recuperación multi-clase (6 cabezas × 64) y la de regresión una distribución de barras sobre 5.000 cubos. Se emplea RMSNorm (pre-norm), MLP de 2× anchura y un soft-cap de logits de atención de 50 (logit ← 50·tanh(logit/50)), añadido por el autor.

El entrenamiento consta de tres etapas siguiendo los scripts públicos de TabICLv2, con batches de 256 tablas, optimizador Muon (momentum 0.9, weight decay 0.01), bf16 y 32×H100. La etapa 1 usa 250k pasos con 1.024 filas (30-90% de entrenamiento) y lr máximo 4e-4; la etapa 2, 20k pasos con 400-10.240 filas (log-uniforme) y lr 5e-5; la etapa 3, 5k pasos con 400-60.000 filas y lr 1e-5. Cada etapa parte de los pesos de la anterior con optimizador nuevo, 1% de warmup y decaimiento coseno. Las tablas tienen 1-100 características, la mitad de las de clasificación son binarias y el 30% tienen valores ausentes. El prior es el grafo SCM de TabICL con los tamaños de tabla de TabICLv2. La inferencia usa un ensemble de 8 miembros con escalado estándar, one-hot para categóricas de hasta 20 categorías y temperatura softmax de 0.9.

## Capacidades

- Clasificación tabular en contexto con hasta 160 clases; las etiquetas más allá de los 10 embeddings de etiqueta comparten embeddings, pero el decodificador de recuperación separa cada clase.
- Regresión tabular mediante distribución de barras sobre 5.000 cubos.
- Un único conjunto de pesos sirve para clasificación y regresión, con codificadores de etiqueta y MLP pre-cabeza separados por tarea.
- Manejo nativo de valores ausentes mediante indicadores de celda.
- Codificación one-hot automática de columnas categóricas con hasta 20 categorías.
- Soporte de tablas anchas: más de 768 columnas se reparten entre los miembros del ensemble de forma equilibrada.
- Aprendizaje en contexto sin ajuste de parámetros en tiempo de inferencia.
- No dispone de tool calling, capacidades de agente, visión, audio ni generación de texto.

## Casos de uso

- Clasificación de clientes en riesgo de churn: el modelo recibe la tabla histórica con etiquetas y la tabla de clientes nuevos en una sola pasada, sin reentrenamiento, gracias al aprendizaje en contexto.
- Predicción de precios o demanda en series tabulares agregadas: la cabeza de regresión con distribución de barras permite estimar la distribución completa de la variable objetivo, no solo la media.
- Detección de fraude en transacciones: con hasta 160 clases y manejo nativo de valores ausentes, puede clasificar transacciones con campos incompletos sin imputación manual.
- Diagnóstico asistido sobre datos clínicos tabulares: útil en entornos con pocos datos etiquetados, donde el ajuste de un modelo supervisado tradicional sería inviable.
- Evaluación rápida de *baselines* en competiciones de datos tabulares: sirve como referencia fuerte sin entrenamiento, útil para comparar contra modelos ajustados.
- Clasificación multietiqueta en tablas anchas: el reparto de columnas entre los 8 miembros del ensemble permite procesar tablas de más de 768 columnas.
- Predicción de impago en banca: con hasta 1.000.000 de filas de entrenamiento recomendadas, puede manejar carteras grandes en una sola ventana de contexto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint tiene 218.826.424 parámetros (aproximadamente 0,44 GB en fp32 y 0,22 GB en bf16); el repositorio ocupa 2,6 GB, lo que sugiere pesos en precisión completa más posibles artefactos.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM para el modelo en sí; el cuello de botella es la memoria para las tablas de entrada, que crece con el número de filas y características.
- Cabe en GPU de consumo: sí, en tarjetas como RTX 3060, RTX 4060 o superiores, siempre que la tabla de entrada quepa en memoria.
- Opciones de despliegue: la librería es PyTorch; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (no aplicables a un modelo tabular).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto (filas/caracteristicas) | Licencia | Disponibilidad |
|---|---|---|---|---|
| minipfn TabPFN-3.5 | 218.826.424 | 1.000.000 filas / 6.000 características (recomendado) | Apache-2.0 | Hugging Face (aiden-jeon) |
| TabPFN-3.5 oficial (Prior Labs) | no disponible | no disponible | licencia propia de Prior Labs | GitHub PriorLabs/TabPFN |
| TabICLv2 | no disponible | no disponible | no disponible | GitHub soda-inria/tabicl |

## Limitaciones y advertencias

- No es el checkpoint oficial de TabPFN-3.5: el autor indica explícitamente que no incluye código ni pesos oficiales.
- La receta de entrenamiento, el prior y el número de capas de la versión 3.5 no están publicados en los informes; esas partes son elecciones propias del autor.
- El entrenamiento solo cubrió hasta 60.000 filas y 100 características, muy por debajo de los límites recomendados de 1.000.000 de filas y 6.000 características.
- El soft-cap de logits de atención es una adición del autor, no presente en los informes oficiales.
- Riesgo de alucinación: no aplica en el sentido lingüístico, pero el modelo puede producir predicciones poco calibradas en tablas fuera de la distribución del prior TabICL.
- Idiomas: no disponible; el modelo no procesa texto libre.
- Licencia Apache-2.0 permite uso comercial, pero el usuario debe verificar que la licencia del checkpoint oficial de Prior Labs no imponga restricciones adicionales si compara o sustituye.
- El modelo tiene 0 likes y 416 descargas en el momento de la consulta, lo que indica validación comunitaria limitada.
- No se documentan tipos de cuantización ni latencias, lo que dificulta planificar despliegues en producción.

## Enlaces

- Hugging Face: https://huggingface.co/aiden-jeon/minipfn-tabpfn-v3-5
- Repositorio del autor: https://github.com/Aiden-Jeon/minipfn
- Informe TabPFN-3.5: https://arxiv.org/abs/2609.17895
- Informe TabICLv2: https://arxiv.org/abs/2602.11139
- Repositorio TabICL: https://github.com/soda-inria/tabicl
- Repositorio oficial TabPFN: https://github.com/PriorLabs/TabPFN
- Referencia adicional citada en los tags: https://arxiv.org/abs/2605.13986
