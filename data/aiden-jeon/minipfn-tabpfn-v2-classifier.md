# aiden-jeon/minipfn-tabpfn-v2-classifier

## Resumen

minipfn TabPFN v2 classifier es una reimplementacion desde cero del clasificador TabPFN v2 descrito por Hollmann et al. en el articulo publicado en Nature (2025). Lo desarrolla el usuario independiente aiden-jeon y se distribuye bajo licencia Apache 2.0. No es el checkpoint oficial de TabPFN v2 ni utiliza codigo o pesos oficiales: es una reproduccion independiente que sigue los metodos del articulo y entrena con el prior abierto de TabICL.

El modelo es una red neuronal preajustada por el prior (prior-data-fitted network, PFN) especializada en clasificacion tabular de datos pequenos. En lugar de entrenar pesos por tarea, `fit` solo ajusta el preprocesado de cada miembro del ensemble y usa las filas de entrenamiento como contexto en tiempo de inferencia (in-context learning). Con 7.244.746 parametros, 12 capas y una ventana de contexto de hasta 2.048 filas de entrenamiento mas 128 filas reservadas, esta pensado para tablas de menos de 75.000 celdas y hasta 160 caracteristicas.

Es relevante porque reproduce con medios modestos (unas 370 horas de H100) un modelo de referencia en clasificacion tabular de datos tabulares pequenos, alcanzando un ROC AUC medio de 0,9238 en los 29 conjuntos AMLB del articulo, frente al 0,9323 del modelo oficial. Publica curvas de entrenamiento, checkpoints intermedios y un analisis honesto de las diferencias por dataset.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer TabPFN v2 con atencion alterna sobre caracteristicas y sobre filas; 12 capas, emsize 192, 6 cabezas, MLP 4x emsize; post-LayerNorm sin parametros afines; 2 caracteristicas por token |
| Parametros totales | 7.244.746 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | hasta 2.048 filas de entrenamiento mas 128 filas reservadas; hasta 160 caracteristicas; menos de 75.000 celdas por tabla |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo tabular, no linguistico) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`model.safetensors`), cargable con PyTorch |

## Arquitectura y entrenamiento

La arquitectura es un transformer TabPFN v2 en el que cada capa aplica primero atencion a lo largo de las caracteristicas y despues a lo largo de las filas. Cada token contiene dos caracteristicas, el modelo usa post-LayerNorm sin parametros afines y admite hasta 10 clases. La inferencia por defecto usa un ensemble de 4 miembros; cada miembro baraja caracteristicas y clases, anade una columna aleatoria de identificador de fila y alterna entre caracteristicas por cuantiles con componentes SVD y una transformacion de potencia Yeo-Johnson. Las columnas categoricas con 20 o menos categorias se codifican one-hot en todos los miembros (`one_hot="all"`) si la tabla no supera las 160 columnas. La temperatura del softmax es 0,9.

El entrenamiento usa el prior SCM de grafo de TabICL con las reglas de tamano de tabla del articulo: filas de entrenamiento uniformes entre 1 y 2.048 mas 128 filas reservadas, caracteristicas con distribucion Beta(0,95, 8,0) escaladas a 1-160, menos de 75.000 celdas por tabla y un 30 % de tablas con valores faltantes aleatorios a una tasa del 0-30 %. Se entrenaron 500.000 pasos con batch de 64 tablas, Adam con lr 2e-4, 10.000 pasos de warmup y schedule coseno sobre 2 millones de pasos, en bf16 y con recorte de gradiente de 1,0. El computo fue de 8xH100 para los pasos 0-300k y 16xH100 para 300k-500k, unas 35 horas de reloj y aproximadamente 370 horas de H100. La perdida colapso de forma subita cuatro veces; en cada caso un guardado automatico retrocedio a un estado sano guardado 2.000-4.000 pasos antes y reanudo con datos nuevos. La entropia cruzada de validacion final es 0,740.

## Capacidades

- Clasificacion tabular supervisada con hasta 10 clases y cualquier numero de caracteristicas y filas dentro de los limites de entrenamiento.
- Aprendizaje en contexto: no requiere entrenamiento de pesos por tarea, solo el ajuste del preprocesado del ensemble.
- Manejo nativo de valores faltantes (entrenado con tasas de ausencia del 0-30 %).
- Soporte de columnas categoricas mediante codificacion one-hot automatica (hasta 20 categorias por columna).
- Salida de probabilidades por clase mediante `predict_proba`, con columnas en el orden de `clf.classes_`.
- Ensemble interno de 4 miembros con barajado de caracteristicas y clases y transformaciones alternas para robustez.
- No soporta generacion de texto, codigo, vision, audio, tool calling ni razonamiento multi-paso: es exclusivamente un clasificador tabular.

## Casos de uso

- Clasificacion de riesgo crediticio en carteras pequenas: con unas pocas miles de filas y decenas de caracteristicas (importe, historial, categoria), el modelo produce probabilidades calibradas sin entrenamiento especifico, adecuado para prototipos rapidos de scoring.
- Deteccion de fraude en transacciones de bajo volumen: tablas de hasta 2.048 filas de entrenamiento y 160 caracteristicas caben en el contexto, lo que permite evaluar un modelo nuevo por cada lote de datos historicos sin reentrenar.
- Prediccion de abandono de clientes (churn): el manejo nativo de valores faltantes y columnas categoricas one-hot simplifica el preprocesado de datos de CRM con campos incompletos.
- Triaje clinico sobre datos tabulares pequenos: clasificacion de pacientes en hasta 10 clases a partir de analiticas y variables demograficas, usando las filas historicas como contexto en lugar de un entrenamiento supervisado clasico.
- Clasificacion de calidad industrial o mantenimiento predictivo: con sensores tabulares de pocas filas por lote, el modelo se ajusta en inferencia y permite comparar rapidamente distintos conjuntos de caracteristicas.
- Baseline rapido en competiciones y evaluacion de datos tabulares (AMLB, OpenML): sirve como referencia reproducible con el script `scripts/tabpfn_v2/eval.py`, que descarga las tareas de OpenML y evalua con los pliegues oficiales.
- Seleccion de caracteristicas y analisis exploratorio: al no requerir entrenamiento, permite iterar sobre subconjuntos de columnas y medir el ROC AUC con coste de computo bajo.

## Benchmarks y rendimiento

Evaluacion sobre los 29 conjuntos de clasificacion AMLB del articulo, media de ROC AUC sobre los 10 pliegues de OpenML, con ajustes de inferencia por defecto (`one_hot="all"`):

| Checkpoint | ROC AUC medio | Con `one_hot="off"` |
|---|---|---|
| 100k pasos | 0,9175 | 0,9169 |
| 200k pasos | 0,9225 | 0,9222 |
| 300k pasos | 0,9208 | 0,9203 |
| 400k pasos | 0,9197 | 0,9196 |
| 500k pasos (este modelo) | 0,9238 | 0,9235 |
| Articulo (TabPFN v2 oficial) | 0,9323 | no disponible |

Brechas por dataset frente al articulo:

| Dataset | Brecha |
|---|---|
| philippine (5.832 filas x 308 caracteristicas) | -0,105 |
| GesturePhaseSegmentationProcessed | -0,047 |
| wine-quality-white | -0,025 |

Sin philippine, GesturePhaseSegmentationProcessed, wine-quality-white, kc1 y first-order-theorem-proving, la brecha media es de -0,002.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; con 7,24 millones de parametros en bf16 los pesos ocupan unos 14,5 MB, por lo que el cuello de botella es el contexto (hasta 2.048 filas x 160 caracteristicas), no el tamano del modelo.
- GPU recomendadas: el entrenamiento uso 8xH100 y 16xH100; para inferencia cualquier GPU con suficiente memoria para el contexto deberia bastar, aunque no se publican mediciones.
- Cabe en GPU de consumo: previsiblemente si, dado el tamano de pesos, aunque no se aportan cifras de memoria ni de latencia.
- Opciones de despliegue: paquete Python `minipfn` instalable con `uv pip install "minipfn @ git+https://github.com/Aiden-Jeon/minipfn"`; clase `TabPFNv2Classifier` con API estilo scikit-learn (`fit`, `predict_proba`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | ROC AUC AMLB (29 datasets) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| minipfn TabPFN v2 classifier (este) | 7.244.746 | 2.048 filas + 128 reservadas, 160 caracteristicas | 0,9238 | Apache 2.0 | Hugging Face, 355 descargas |
| TabPFN v2 oficial (PriorLabs) | no disponible en la informacion | no disponible en la informacion | 0,9323 | no disponible en la informacion | GitHub PriorLabs/TabPFN |
| TabICL (soda-inria) | no disponible en la informacion | no disponible en la informacion | no disponible en la informacion | no disponible en la informacion | GitHub soda-inria/tabicl (usado como prior) |
| minipfn TabPFN v2 regressor | no disponible en la informacion | no disponible en la informacion | no aplica (regresion) | Apache 2.0 | Hugging Face |

## Limitaciones y advertencias

- No es el checkpoint oficial de TabPFN v2: no usa codigo ni pesos oficiales y rinde por debajo del modelo del articulo (0,9238 frente a 0,9323 de ROC AUC medio).
- El dataset philippine queda unos 0,10 por debajo del articulo en todos los checkpoints (100k a 500k); dos comprobaciones en inferencia (limitar columnas por miembro a 500, 300 o 160; limitar filas de entrenamiento a 4.096 o 2.048) no corrigieron la brecha y la causa es desconocida.
- El comportamiento puede variar entre checkpoints: en mfeat-factors, los checkpoints de 300k y 400k puntuan 0,94 en los 10 pliegues, mientras que 200k y 500k puntuan 1,00.
- La atencion sobre filas se agudiza durante el entrenamiento: algunas cabezas concentran casi todo el peso en una sola fila (attention sink), probable origen de los cuatro colapsos de perdida que obligaron a retroceder el entrenamiento.
- Solo clasificacion: el modelo de regresion es un modelo separado (aiden-jeon/minipfn-tabpfn-v2-regressor).
- Limites de contexto: hasta 2.048 filas de entrenamiento, 160 caracteristicas y menos de 75.000 celdas por tabla; fuera de esos rangos el comportamiento no esta garantizado.
- Riesgo de alucinacion y sesgos: no se documentan sesgos especificos, pero al ser un modelo entrenado sobre un prior sintetico, su comportamiento en datos reales fuera de la distribucion del prior puede degradarse sin aviso.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el modelo se distribuye sin garantias y el autor no ofrece soporte ni mantenimiento.

## Enlaces

- Hugging Face: https://huggingface.co/aiden-jeon/minipfn-tabpfn-v2-classifier
- Modelo de regresion: https://huggingface.co/aiden-jeon/minipfn-tabpfn-v2-regressor
- Repositorio de codigo: https://github.com/Aiden-Jeon/minipfn
- Articulo TabPFN v2 (Nature, 2025): https://doi.org/10.1038/s41586-024-08328-6
- TabPFN oficial (PriorLabs): https://github.com/PriorLabs/TabPFN
- Prior TabICL: https://github.com/soda-inria/tabicl
