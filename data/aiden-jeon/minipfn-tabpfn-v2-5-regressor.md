# aiden-jeon/minipfn-tabpfn-v2-5-regressor

## Resumen

minipfn TabPFN-2.5 regressor es una reimplementación from scratch del regresor TabPFN-2.5, publicada por el desarrollador independiente aiden-jeon. TabPFN es una familia de modelos fundacionales para datos tabulares basados en el paradigma de prior-data-fitted networks (PFN): en lugar de entrenar un modelo por tarea, se entrena una red que aprende a resolver tareas de regresión en contexto a partir de un prior sintético de tablas, y en inferencia se le pasa directamente el conjunto de entrenamiento como contexto. Este checkpoint reproduce los cambios arquitectónicos descritos en el informe de TabPFN-2.5 (arXiv:2511.08667) sobre una reimplementación propia de TabPFN v2, y se entrena sobre el prior abierto de TabICL.

El modelo tiene 14.675.729 parámetros, una arquitectura cell_transformer derivada del Transformer de TabPFN v2 con 18 capas, y admite un número arbitrario de características y filas en inferencia, con cobertura de entrenamiento de hasta 500 características y hasta 8.192 filas. No es el checkpoint oficial de TabPFN-2.5 ni usa código o pesos oficiales; el autor lo publica bajo licencia Apache 2.0, lo que lo diferencia del modelo oficial, sujeto a la TABPFN-2.5 License.

Su relevancia actual radica en que ofrece una alternativa abierta y reproducible para experimentar con modelos fundacionales tabulares sin las restricciones de licencia del modelo oficial, y en que documenta con detalle decisiones de entrenamiento (dequantización de objetivos, QK-clip, escalado robusto) que no aparecen en el informe original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | cell_transformer (Transformer de TabPFN v2 con los cuatro cambios de TabPFN-2.5): 18 capas, 6 cabezas, emsize 192, MLP 4x emsize, post-LayerNorm sin parámetros afines, encoder de celda MLP de 2 capas |
| Parametros totales | 14.675.729 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica en el sentido de tokens; admite cualquier número de filas y características, con entrenamiento hasta 500 características y 8.192 filas (menos de 400.000 celdas) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin variantes GGUF publicadas) |
| Idiomas soportados | no disponible (modelo numérico/tabular, no lingüístico) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (model.safetensors, con el campo `borders` incluido) |

## Arquitectura y entrenamiento

La arquitectura parte del Transformer de TabPFN v2 e incorpora los cuatro cambios que el informe de TabPFN-2.5 describe: 18 capas en lugar de 12, tres características por token en lugar de dos, 64 filas "thinking" aprendidas colocadas antes de las filas de entrenamiento a las que atiende cada fila, y un encoder de celda consistente en un MLP de 2 capas (Linear → GELU → Linear, con tamaño oculto emsize) en lugar de una capa lineal. La salida es una distribución de barras sobre 5.000 buckets del objetivo estandarizado, con colas half-normal; los bordes de los buckets son cuantiles de los objetivos del prior y se distribuyen con los pesos. El autor indica que el informe no publica el ancho del modelo, los detalles del prior ni la receta de entrenamiento, por lo que esas partes son elecciones propias.

El entrenamiento consta de dos etapas con batch de 64 tablas, bf16 y gradient clipping 1.0. La primera, de ajuste al prior, dura 500.000 pasos con tamaños de tabla del paper de v2 (1–2.048 filas de entrenamiento más 128 retenidas, 1–160 características, menos de 75.000 celdas, valores ausentes en el 30% de las tablas), con Adam a lr 2e-4, 10.000 pasos de warmup y schedule coseno sobre 2M pasos. La pérdida colapsó dos veces (en los pasos 155k y 216k) y se recuperó rebobinando a un estado sano, reduciendo a la mitad el lr base y reanudando con datos frescos. La segunda etapa, de tablas largas, dura 20.000 pasos partiendo de los pesos de 500k, con filas log-uniformes en 512–8.192, hasta 500 características y menos de 400.000 celdas. El cómputo total fue de aproximadamente 650 horas H100 (8×H100 hasta 100k, 16×H100 hasta 300k, 32×H100 hasta 500k y 16×H100 en la etapa de tablas largas), unas 37 horas de reloj. Se incorporan dos cambios no presentes en el paper: dequantización de objetivos repetidos durante el entrenamiento y QK-clip con τ = 250 cada 50 pasos para evitar attention sinks en las cabezas de atención por filas.

En inferencia se usa un ensemble de 8 miembros; cada miembro baraja características y añade una columna identificadora de fila aleatoria, alterna entre características por cuantiles más componentes SVD y escalado robusto con soft clipping estilo RealMLP, y la mitad aplica además power transform al objetivo. Las columnas categóricas con hasta 20 categorías se codifican one-hot en cada miembro. Las predicciones se devuelven a la escala original del objetivo y se promedian.

## Capacidades

- Regresión tabular en contexto (in-context learning): resuelve una tarea de regresión pasando el conjunto de entrenamiento directamente como contexto, sin ajuste de parámetros.
- Manejo de un número arbitrario de características y filas, con cobertura de entrenamiento hasta 500 características y 8.192 filas.
- Soporte de valores ausentes (el 30% de las tablas de entrenamiento los contenían).
- Codificación automática de variables categóricas con hasta 20 categorías mediante one-hot encoding.
- Salida de distribución predictiva completa (5.000 buckets con colas half-normal), no solo un punto estimado, lo que permite derivar incertidumbre.
- Ensemble interno de 8 miembros con diversidad en el preprocesado (cuantiles + SVD frente a escalado robusto con soft clipping).
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multimodales; es un modelo estrictamente numérico-tabular.

## Casos de uso

- Predicción de precios y valoración de inmuebles: se pasa al modelo la tabla de inmuebles con sus características y el precio como objetivo, y se obtienen predicciones con distribución para nuevas viviendas, sin reentrenar por cada mercado.
- Scoring de riesgo crediticio: con un histórico de solicitudes y su resultado de impago como contexto, el modelo estima la probabilidad de impago de nuevas solicitudes; la distribución de salida permite fijar umbrales conservadores.
- Previsión de demanda y series de negocio con variables exógenas: útil en tablas de ventas por producto, tienda y periodo, donde el modelo aprovecha las filas históricas como contexto para predecir las nuevas.
- Modelado de sensores y mantenimiento predictivo: a partir de lecturas de sensores tabuladas y del tiempo hasta el fallo, el modelo estima el riesgo de fallo de equipos nuevos usando el histórico como contexto.
- Estimación de rendimiento en experimentación científica y de materiales: regresión sobre tablas de condiciones experimentales y resultados medidos, con la ventaja de no requerir un pipeline de entrenamiento por cada campaña.
- Benchmarking y evaluación de modelos fundacionales tabulares: sirve como referencia abierta (Apache 2.0) para comparar implementaciones propias frente a TabPFN v2 y TabPFN-2.5 en suites de regresión.
- Prototipado rápido en ciencia de datos: al no necesitar entrenamiento, permite obtener una línea base sólida en minutos sobre tablas pequeñas y medianas antes de invertir en un modelo específico.

## Benchmarks y rendimiento

El autor evalúa sobre los 28 conjuntos de regresión del paper de TabPFN v2, con RMSE promediado sobre los 10 folds de OpenML. La métrica principal es la ratio de RMSE frente a los valores del paper por conjunto de datos (por debajo de 1 es mejor), combinada como media geométrica. Los valores de referencia son los de la Tabla Suplementaria 2 del paper de TabPFN v2 con ajustes por defecto; el informe de TabPFN-2.5 no incluye tabla por conjunto de datos para esta suite.

| Comparacion | Resultado |
|---|---|
| Ratio RMSE frente a TabPFN v2 (paper) en los 28 datasets | no disponible en la información proporcionada (la model card referencia la tabla completa, pero no se incluyen los valores numéricos) |
| Val NLL final, tablas del paper (64 tablas fijas, cada 5.000 pasos) | −1.405 |
| Val NLL final, tablas largas de la segunda etapa (32 tablas fijas) | −1.680 |

Los dos valores de validación no son comparables entre sí porque proceden de conjuntos de validación distintos. No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni de otras suites estándar de lenguaje, que no aplican a este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint pesa aproximadamente 0,4 GB en safetensors (unos 59 MB en fp32 para 14,7M de parámetros, más los bordes de los buckets y el ensemble). Cabe holgadamente en cualquier GPU consumer, incluso en tarjetas con 4 GB o menos.
- GPU recomendadas: cualquier GPU con soporte CUDA es suficiente; el modelo se entrenó en H100, pero para inferencia basta una RTX 3060, RTX 4090 o similar. El coste dominante no es el modelo sino el tamaño del contexto tabular (número de filas y características).
- Cabe en GPU consumer: sí, en cualquier GPU consumer moderna; también es viable en CPU para tablas pequeñas.
- Opciones de despliegue: PyTorch nativo (librería pytorch); no hay variantes GGUF ni integración publicada con llama.cpp, Ollama, vLLM o TGI. El código de referencia está en el repositorio Aiden-Jeon/minipfn.
- Latencia y throughput: no disponibles en la información proporcionada. El ensemble de 8 miembros multiplica por ocho el coste de cada inferencia, y el coste crece con el número de filas y características del contexto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / filas | Licencia | Disponibilidad |
|---|---|---|---|---|
| minipfn TabPFN-2.5 regressor (este modelo) | 14,7M | hasta 500 características y 8.192 filas en entrenamiento | Apache 2.0 | Hugging Face, pesos safetensors |
| TabPFN v2 (oficial, PriorLabs) | no disponible | tamaños de tabla del paper v2 (hasta 2.048 filas y 160 características en entrenamiento) | licencia propia de TabPFN | Hugging Face y GitHub de PriorLabs |
| TabPFN-2.5 (oficial, PriorLabs) | no disponible (el informe no publica el ancho) | escalado a más filas y características que v2 | TABPFN-2.5 License | Hugging Face y GitHub de PriorLabs |
| minipfn TabPFN v2 regressor (misma autora) | no disponible en la información proporcionada | tamaños de tabla del paper v2 | Apache 2.0 | Hugging Face (aiden-jeon/minipfn-tabpfn-v2-regressor) |

No se dispone de datos de rendimiento comparativos numéricos entre estas alternativas en la información proporcionada, salvo la ratio de RMSE frente al paper de TabPFN v2 que el autor reporta sin valores explícitos en la model card.

## Limitaciones y advertencias

- No es el checkpoint oficial de TabPFN-2.5: es una reimplementación independiente sin código ni pesos oficiales; los resultados pueden diferir de los del modelo original.
- El informe de TabPFN-2.5 no publica el ancho del modelo, los detalles del prior ni la receta de entrenamiento; esas partes son elecciones del autor y no reproducen exactamente el modelo oficial.
- La colocación de las filas "thinking" antes de las filas de entrenamiento, la interpretación del escalado robusto y del soft clipping, y los tamaños de la etapa de tablas largas son decisiones propias no descritas en el paper.
- Riesgo de alucinación no aplica en el sentido lingüístico, pero sí existe riesgo de predicciones mal calibradas fuera de la distribución del prior de entrenamiento (tablas con más de 500 características o más de 8.192 filas no están cubiertas).
- El modelo está entrenado sobre el prior sintético de TabICL; su rendimiento en dominios con estructuras muy distintas a las del prior puede degradarse.
- No soporta datos de texto, imagen ni audio; solo tablas numéricas y categóricas.
- La licencia Apache 2.0 permite uso comercial, pero el autor advierte de que el modelo oficial TabPFN-2.5 está sujeto a la TABPFN-2.5 License, distinta de esta.
- La model card no documenta sesgos específicos; al ser un modelo entrenado sobre datos sintéticos, los sesgos dependerán del prior y de los datos de la tarea concreta.
- El ensemble de 8 miembros incrementa el coste de inferencia y puede ser inviable en escenarios de muy baja latencia.

## Enlaces

- Hugging Face: https://huggingface.co/aiden-jeon/minipfn-tabpfn-v2-5-regressor
- Clasificador asociado: https://huggingface.co/aiden-jeon/minipfn-tabpfn-v2-5-classifier
- Regresor TabPFN v2 de la misma autora: https://huggingface.co/aiden-jeon/minipfn-tabpfn-v2-regressor
- Código: https://github.com/Aiden-Jeon/minipfn
- Paper TabPFN-2.5: https://arxiv.org/abs/2511.08667
- TabPFN oficial (PriorLabs): https://github.com/PriorLabs/TabPFN
- Prior TabICL: https://github.com/soda-inria/tabicl
