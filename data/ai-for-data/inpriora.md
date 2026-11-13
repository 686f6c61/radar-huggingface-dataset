# ai-for-data/inpriora

## Resumen

Inpriora es un modelo fundacional preentrenado para datos tabulares, desarrollado por Ant Group y publicado en Hugging Face bajo el identificador `ai-for-data/inpriora`. Resuelve dos de las tareas clásicas del aprendizaje automático tabular —clasificación y regresión— mediante un enfoque de *in-context learning* (ICL): el método `fit` prepara el contexto de entrenamiento y `predict` o `predict_proba` ejecutan pasadas hacia delante sin actualizaciones de gradiente. Esto elimina la necesidad de reentrenar el modelo por cada nuevo conjunto de datos, algo que tradicionalmente exige ajustar Gradient Boosting o redes neuronales específicas por tarea.

El repositorio contiene dos checkpoints independientes, uno para clasificación (118,03 M de parámetros) y otro para regresión (121,11 M de parámetros), ambos en formato safetensors y con un tamaño total de repositorio de 1,0 GB. El modelo se entrenó íntegramente con datos sintéticos, una decisión relevante porque evita dependencias de licencias de datos tabulares reales y permite controlar la distribución del preentrenamiento.

Su relevancia actual radica en que se posiciona como una alternativa a los modelos tabulares fundacionales tipo TabPFN, con una arquitectura de doble rama para contexto y consulta, atención separada por rol y codificación de celdas mediante *adaptive Fourier features* combinadas con un ranking por columna del contexto. La licencia Apache 2.0 facilita su adopción comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con doble rama ICL (proyecciones de atención separadas para contexto y consulta) |
| Parametros totales | 118,03 M (clasificador) / 121,11 M (regresor) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (modelo tabular, no lingüístico) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (con SHA-256 por checkpoint) |

## Arquitectura y entrenamiento

Inpriora es un transformer diseñado específicamente para datos tabulares, no un modelo de lenguaje adaptado. Su innovación principal es el esquema de codificación de celdas: cada celda se representa mediante *adaptive Fourier features* y, además, se calcula un ranking dentro de la columna correspondiente del contexto. Esta doble representación captura tanto patrones numéricos absolutos como el orden relativo de los valores, algo crítico en tablas donde la magnitud importa menos que la posición relativa dentro de la distribución de la columna.

La arquitectura de doble rama ICL procesa las filas de contexto y las filas de consulta con proyecciones de atención separadas, de modo que cada rama mantiene la información adecuada a su rol (aprender del contexto frente a predecir sobre la consulta). El modelo se entrenó íntegramente sobre datos sintéticos, aunque la model card no especifica el volumen de tokens, la composición del dataset ni si se aplicaron etapas de RLHF o DPO. Tampoco se documentan innovaciones adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Clasificación tabular con estimación de probabilidades mediante `predict_proba`.
- Regresión tabular sobre variables objetivo continuas.
- Aprendizaje en contexto (ICL): no requiere ajuste fino ni actualización de pesos por conjunto de datos.
- Manejo de variables numéricas con codificación por Fourier features adaptativas y ranking intra-columna.
- Procesamiento de contexto y consulta con ramas de atención diferenciadas.
- Ejecución en GPU con soporte para Triton (paquete `inpriora[triton]`).
- Integración con el ecosistema scikit-learn mediante las clases `InprioraClassifier` e `InprioraRegressor`.
- No dispone de tool calling, capacidades de agente, razonamiento multi-paso, visión, audio ni multilingüismo, al ser un modelo estrictamente tabular.

## Casos de uso

- **Scoring de riesgo crediticio**: el modelo puede recibir un lote de solicitudes históricas como contexto y puntuar nuevas solicitudes con `predict_proba`, sin reentrenar por cada cartera ni por cada cambio en la política de admisión.
- **Predicción de precios o demanda en series tabulares agregadas**: con el checkpoint de regresión, se puede usar un histórico de features (precio, estacionalidad, promociones) como contexto y predecir el valor continuo de nuevos registros.
- **Clasificación de clientes para campañas de marketing**: segmentación binaria o multiclase a partir de variables demográficas y de comportamiento, aprovechando la estimación de probabilidades para priorizar contactos.
- **Detección de fraude en transacciones**: clasificación con probabilidades calibradas sobre features transaccionales, útil cuando se dispone de pocos casos etiquetados y no se quiere entrenar un GBM específico.
- **Prototipado rápido en ciencia de datos**: sustituir el ciclo de selección de modelo y ajuste de hiperparámetros por una única llamada a `fit` y `predict`, acelerando la validación de hipótesis sobre nuevos datasets.
- **Predicción de abandono (churn)**: clasificación sobre datos de uso y facturación, con la ventaja de que el contexto puede actualizarse con cohortes recientes sin reentrenamiento.
- **Evaluación de modelos tabulares de referencia**: usar Inpriora como baseline fundacional en experimentos comparativos dentro de pipelines de investigación, dado su rendimiento reportado en TabArena.

## Benchmarks y rendimiento

Evaluación autoinformada, no oficial, sobre TabArena-v0.1 (51 datasets, 816 splits) realizada el 2026-11-12/13. Los rangos son entre envíos de modelos.

| Subconjunto | Elo | Rango |
|---|---:|---:|
| Completo | 1823,6 | 6/109 |
| Clasificación | 1786,4 | 7/107 |
| Regresión | 2208,6 | 4/105 |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible, ni comparaciones directas con modelos concretos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 118-121 M de parámetros en fp32 se sitúa en torno a 0,5 GB de pesos, aunque el consumo real depende del tamaño del contexto tabular y del lote de consulta.
- GPU recomendadas: no especificadas por el autor; el soporte Triton sugiere GPUs NVIDIA con compute capability moderna (A100, H100, RTX 4090, RTX 3090).
- Cabe en GPU de consumo: sí, por tamaño de parámetros, aunque el consumo de memoria crece con el número de filas de contexto.
- Opciones de despliegue: paquete oficial `inpriora` instalable vía pip con extra `[triton]`; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplicables a un modelo tabular).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Inpriora (clasificador) | 118,03 M | No disponible | ICL tabular, doble rama | Apache 2.0 | Hugging Face + GitHub |
| Inpriora (regresor) | 121,11 M | No disponible | ICL tabular, doble rama | Apache 2.0 | Hugging Face + GitHub |
| TabPFN | No disponible en la información | No disponible | ICL tabular | No disponible en la información | No disponible en la información |
| Gradient Boosting (XGBoost/LightGBM) | No aplica (no neuronal) | No aplica | Árboles potenciados | Licencias propias | Ampliamente disponible |

No se dispone de datos verificados en la información proporcionada para establecer comparaciones cuantitativas con TabPFN u otros modelos fundacionales tabulares.

## Limitaciones y advertencias

- Entrenado exclusivamente con datos sintéticos: el comportamiento sobre distribuciones reales muy alejadas del preentrenamiento no está documentado.
- No se especifican sesgos conocidos ni análisis de equidad; en aplicaciones sensibles (crédito, seguros) será necesario auditar por subgrupos.
- Riesgo de alucinación no aplica en el sentido lingüístico, pero sí existe riesgo de predicciones mal calibradas fuera de la distribución del contexto.
- Longitud máxima de contexto no documentada: contextos tabulares muy grandes pueden degradar el rendimiento o exceder la memoria disponible.
- Evaluación de TabArena autoinformada y no oficial; debe tratarse como indicativa hasta que existan replicaciones independientes.
- Licencia Apache 2.0 permite uso comercial, pero se recomienda conservar la atribución indicada en la model card.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que la validación comunitaria es inexistente.
- La fecha de creación del repositorio (2026-11-13) y la de la evaluación coinciden, lo que sugiere un lanzamiento muy reciente sin rodaje en producción.

## Enlaces

- Hugging Face: https://huggingface.co/ai-for-data/inpriora
- Repositorio de código e inferencia: https://github.com/ai-for-data/inpriora
- Benchmark TabArena: no se proporciona enlace directo en la información disponible.
