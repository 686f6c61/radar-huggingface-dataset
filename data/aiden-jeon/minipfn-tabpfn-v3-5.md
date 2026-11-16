# aiden-jeon/minipfn-tabpfn-v3-5

## Resumen

minipfn TabPFN-3.5 es una reimplementación desde cero del modelo TabPFN-3.5 de Prior Labs, publicada por el desarrollador independiente aiden-jeon. Se trata de una red neuronal preentrenada sobre un prior sintético (Prior-Data-Fitted Network) especializada en aprendizaje en contexto para datos tabulares: un único conjunto de pesos resuelve tanto clasificación como regresión sin necesidad de reentrenamiento, simplemente pasando la tabla de entrenamiento como contexto en la propia entrada. El modelo tiene 218.831.425 parámetros y sigue la arquitectura column-row-transformer de TabPFN-3 con los cambios descritos en el informe de TabPFN-3.5.

La relevancia de esta ficha es doble: por un lado, reproduce un modelo de referencia para tablas (familia TabPFN) bajo licencia Apache-2.0, algo poco habitual en este nicho; por otro, documenta decisiones de entrenamiento propias (curriculum en tres etapas, soft-cap de logits de atención) porque el informe oficial no publica la receta completa. No es el checkpoint oficial de Prior Labs ni contiene código o pesos oficiales.

El modelo está entrenado exclusivamente con el prior abierto TabICL y el curriculum de TabICLv2, con un total de 275.000 pasos sobre 32 GPU H100. Su pipeline declarado es `tabular-classification`, aunque los pesos cubren también regresión mediante una cabeza separada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Column-row-transformer (TabPFN-3 layout con cambios de TabPFN-3.5): encoder de celda, etapa de columna, etapa de fila e in-context stage |
| Parametros totales | 218.831.425 (204.476.336 compartidos, 5.027.456 solo clasificación, 9.322.632 solo regresión) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | Hasta 1.000.000 de filas de entrenamiento y 6.000 características en inferencia (límites recomendados del informe); entrenado hasta 60.000 filas y 100 características |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo para datos tabulares, no lingüístico) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (librería pytorch) |

## Arquitectura y entrenamiento

La arquitectura se organiza en cuatro etapas. El encoder de celda z-normaliza cada característica sobre las filas de entrenamiento, añade un indicador de valores ausentes y construye tokens que agrupan tres características (j, j+1, j+3 con wrap-around); la variante 3.5 añade 32 frecuencias de Fourier aprendidas y rangos ECDF por columna, seguidos de LayerNorm, con anchura 128. La etapa de columna aplica 3 bloques por columna con 128 puntos inductores que resumen las filas de entrenamiento (induced set attention); las filas de test leen el resumen pero nunca se atienden entre sí. La etapa de fila usa 3 bloques con 8 tokens CLS aprendidos por fila y RoPE, cuyas salidas se concatenan en un vector de fila de 1.024 dimensiones. La etapa in-context consta de 24 capas con 16 cabezas, QK-norm y QASSMax (softmax escalable sensible a la query); las filas de entrenamiento se atienden entre sí y las de test solo a las de entrenamiento, mediante una única cabeza key/value. La salida usa un decodificador de recuperación many-class (6 cabezas × 64) para clasificación y una distribución de barras sobre 5.000 cubos para regresión.

El entrenamiento sigue el curriculum de tres etapas de TabICLv2 con el prior SCM de grafos de TabICL: etapa 1 con 250.000 pasos sobre tablas de 1.024 filas, etapa 2 con 20.000 pasos sobre 400-10.240 filas (log-uniforme) y etapa 3 con 5.000 pasos sobre 400-60.000 filas. Todas las etapas usan lotes de 256 tablas, optimizador Muon (momentum 0,9, weight decay 0,01), bf16, 32 GPU H100, warmup del 1 % y decaimiento coseno, con tasas máximas de 4e-4, 5e-5 y 1e-5 respectivamente. El 50 % de las tablas de clasificación son binarias y el 30 % contienen valores ausentes. Como innovación destacable, el autor añade un soft-cap de logits de atención de 50 (logit ← 50·tanh(logit/50)) y reduce a la mitad las tasas de aprendizaje respecto a los scripts de TabICLv2, tras observar un colapso por crecimiento descontrolado de los logits de atención en la primera etapa. En la etapa 3 se usa activation checkpointing para tablas de más de 10.240 filas.

## Capacidades

- Clasificación tabular en contexto: hasta 160 clases, con decodificador de recuperación que separa todas las clases aunque las etiquetas compartan embeddings más allá de las 10 iniciales.
- Regresión tabular en contexto: salida mediante distribución de barras sobre 5.000 cubos, con los mismos pesos compartidos que la clasificación.
- Aprendizaje en contexto sin ajuste: la tabla de entrenamiento se pasa como contexto en la propia inferencia, sin gradient descent ni fine-tuning.
- Manejo de valores ausentes nativo, mediante indicador de celda ausente en el encoder.
- Manejo de variables categóricas: las columnas con hasta 20 categorías se codifican one-hot en cada miembro del ensemble, siempre que la tabla no supere 100 columnas.
- Ensemble de inferencia de 8 miembros con escalado estándar, cada uno con barajado de características y clases y una columna aleatoria de identificador de fila; temperatura softmax de 0,9.
- Soporte de tablas grandes: hasta 1.000.000 de filas de entrenamiento y 6.000 características según los límites recomendados del informe.
- No dispone de tool calling, capacidades de agente, visión, audio ni generación de texto: es un modelo puramente numérico para datos tabulares.

## Casos de uso

- Clasificación de riesgo crediticio: el modelo recibe como contexto el histórico de solicitudes con sus etiquetas (impago o no impago) y clasifica solicitudes nuevas en una sola pasada, sin reentrenar, lo que permite recalcular el modelo con cada lote de datos etiquetados que llegue.
- Predicción de abandono de clientes (churn): con tablas de decenas de miles de filas y variables mixtas (numéricas, categóricas y con ausentes), el modelo clasifica clientes en riesgo directamente desde el contexto, aprovechando el manejo nativo de valores ausentes.
- Regresión de precios o demanda: la cabeza de regresión con distribución de barras permite estimar valores continuos (precio de vivienda, demanda diaria) pasando el conjunto histórico como contexto, útil cuando el volumen de datos no justifica entrenar un modelo supervisado propio.
- Detección de fraude en transacciones: la clasificación binaria con tablas desbalanceadas y el ensemble de 8 miembros con barajado de clases ofrecen una estimación robusta por transacción, adecuada para un filtro previo a la revisión manual.
- Diagnóstico asistido sobre datos clínicos tabulares: clasificación de pacientes a partir de analíticas y variables demográficas con valores ausentes frecuentes, usando el conjunto etiquetado del hospital como contexto en cada inferencia.
- Prototipado rápido en ciencia de datos: sustituir el ciclo de selección de modelo, ajuste de hiperparámetros y validación cruzada por una única llamada de inferencia en contexto, útil para explorar decenas de problemas tabulares en un mismo día.
- Clasificación multoclase con muchas categorías: el decodificador de recuperación permite hasta 160 clases, adecuado para taxonomías de productos, códigos de incidencia o diagnósticos con muchas etiquetas posibles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tablas comparativas de MMLU, HumanEval, GSM8K ni métricas tabulares (AUC, accuracy, RMSE) frente a TabPFN oficial, TabICL u otros modelos de referencia.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 218,8 millones de parámetros, los pesos en bf16 ocupan aproximadamente 0,44 GB y en fp32 unos 0,88 GB, a lo que hay que sumar el estado de activaciones, que escala con el número de filas y características de la tabla de contexto.
- GPU recomendadas: el entrenamiento se realizó sobre 32 GPU H100; para inferencia no se especifican modelos concretos en la información disponible.
- Cabe en GPU de consumo: sí, por tamaño de pesos; el límite práctico lo marca la longitud de la tabla de contexto (hasta 60.000 filas en entrenamiento y 1.000.000 recomendadas en inferencia), que puede agotar la memoria de una GPU de consumo. No se detalla en qué modelos concretos.
- Opciones de despliegue: al ser un modelo PyTorch con pesos safetensors y código propio en el repositorio `Aiden-Jeon/minipfn`, el despliegue se realiza mediante PyTorch; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto (filas) | Tareas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| minipfn TabPFN-3.5 (este) | 218,8 M | Hasta 1.000.000 (recomendado); entrenado a 60.000 | Clasificación y regresión | Apache-2.0 | Pesos en Hugging Face, código en GitHub |
| TabPFN-3.5 oficial (Prior Labs) | no disponible en la información | no disponible en la información | Clasificación y regresión | Licencia propia de Prior Labs | Checkpoint oficial en PriorLabs/TabPFN |
| TabICLv2 | no disponible en la información | no disponible en la información | Clasificación y regresión (modelos separados) | no disponible en la información | soda-inria/tabicl |

La comparación con TabPFN-3.5 oficial y TabICLv2 se limita a lo que la model card documenta: el modelo oficial usa una licencia distinta y no se publica su receta de entrenamiento; TabICLv2 entrena modelos separados de clasificación y regresión con lotes de 64, mientras que este modelo unifica ambas tareas en un solo conjunto de pesos con lotes de 256. No hay datos de rendimiento comparativo disponibles.

## Limitaciones y advertencias

- No es el checkpoint oficial de TabPFN-3.5: el autor declara explícitamente que no incluye código ni pesos oficiales, y que la receta de entrenamiento, el prior y el número de capas de la variante 3.5 son elecciones propias porque los informes no los publican.
- El modelo solo se ha entrenado con el prior TabICL; su comportamiento fuera de la distribución de ese prior sintético no está caracterizado.
- Entrenado hasta 60.000 filas y 100 características, aunque el informe recomiende límites de 1.000.000 de filas y 6.000 características: el rendimiento más allá de lo visto en entrenamiento no está validado.
- El soft-cap de logits de atención es una adición del autor, no una técnica del informe oficial; los resultados dependen de esa elección.
- No hay resultados de benchmarks publicados, por lo que no se puede verificar su calidad frente al modelo oficial ni frente a alternativas.
- Riesgo de alucinación en el sentido de predicciones mal calibradas fuera de la distribución del prior; no se documentan análisis de calibración ni de sesgo.
- Sin datos sobre sesgos conocidos ni sobre comportamiento multilingüe (no aplica, al ser un modelo numérico).
- La licencia Apache-2.0 permite uso comercial, pero al no ser el modelo oficial, la responsabilidad sobre su comportamiento en producción recae en quien lo despliega.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validación de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/aiden-jeon/minipfn-tabpfn-v3-5
- Código del autor: https://github.com/Aiden-Jeon/minipfn
- Informe TabPFN-3.5: https://arxiv.org/abs/2609.17895
- Informe TabICLv2: https://arxiv.org/abs/2602.11139
- Referencia adicional citada en los tags: https://arxiv.org/abs/2605.13986
- Repositorio oficial de Prior Labs: https://github.com/PriorLabs/TabPFN
- Prior TabICL: https://github.com/soda-inria/tabicl
