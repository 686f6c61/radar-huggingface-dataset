# Delower/egfr-kd-best_xgboost_ltn-benchmark

## Resumen

El repositorio `Delower/egfr-kd-best_xgboost_ltn-benchmark` no contiene un modelo de lenguaje ni un modelo fundacional de IA generativa, sino un artefacto de aprendizaje automatico supervisado orientado a la prediccion de afinidad de union al receptor EGFR (Epidermal Growth Factor Receptor). Lo publica el usuario Delower en Hugging Face y empaqueta un ensamblado (fusion) de dos regresores: un XGBoost sobre 2.432 caracteristicas de ligando y una Logic Tensor Network (LTN) sobre el mismo espacio de caracteristicas. El objetivo es predecir pKd/pKi y derivar de ahi la energia libre de Gibbs de union (DeltaG = -1.364 x pKd kcal/mol a 298,15 K).

La relevancia del artefacto es acotada y muy especifica: se trata de la version "benchmark" de un programa interno de descubrimiento de farmacos, en la que ambos miembros se entrenaron unicamente con la particion de entrenamiento (513 filas) del conjunto EGFR Kd+Ki, dejando fuera la particion de validacion, la lectura de mutantes y un panel regulatorio de 9 farmacos. El autor advierte explicitamente de que las metricas publicadas no aplican a la version de despliegue, publicada por separado.

No se dispone de informacion sobre arquitectura de red neuronal profunda, numero de parametros, longitud de contexto, idiomas ni licencia. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, con un tamano de 0,0 GB y creado el 25 de noviembre de 2026 segun los metadatos de Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Fusion de dos regresores tabulares: XGBoost (gradient boosting) + LTN (Logic Tensor Network sobre Keras/TensorFlow) |
| Parametros totales | no disponible (no aplica en el sentido de modelos neuronales; XGBoost tiene arboles y la LTN no reporta recuento) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (no aplica; entrada = vector de 2.432 caracteristicas de ligando) |
| Tipos de cuantizacion | no disponible (no aplica a modelos tabulares) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | artefactos serializados de XGBoost y Keras/TensorFlow, mas `feature_spec_xgboost_egfr.json` y scaler guardado; no se especifica extension exacta |

## Arquitectura y entrenamiento

El sistema es un ensamblado lineal con pesos fijados (locked): `fusion_pKd = 0.8793 * XGBoost-EGFR + 0.1207 * LTN-EGFR`. Los pesos se ajustaron mediante SLSQP unicamente sobre la particion de validacion y despues se congelaron. El miembro XGBoost opera sobre la receta de 2.432 caracteristicas de ligando definida en `features.py`, con medianas de imputacion calculadas en la particion de entrenamiento y guardadas en `feature_spec_xgboost_egfr.json`. El miembro LTN es un regresor de Logic Tensor Network sobre el mismo espacio de caracteristicas, estandarizado con el scaler guardado del benchmark.

El entrenamiento se realizo exclusivamente sobre la particion de entrenamiento del pool EGFR Kd+Ki (513 filas). Quedaron retenidos la particion de validacion, la lectura de mutantes y el panel regulatorio de 9 farmacos. El autor indica que la version de despliegue (miembros reentrenados con todos los datos, compuestos regulatorios solo en entrenamiento) se publica por separado y que las metricas del benchmark no le son aplicables. No se documenta numero de tokens, composicion del dataset, ni uso de RLHF/DPO (no aplica).

## Capacidades

- Prediccion de afinidad de union al EGFR en escala pKd/pKi a partir de la estructura del ligando (SMILES).
- Derivacion de DeltaG de union en kcal/mol mediante la relacion lineal DeltaG = -1.364 x pKd a 298,15 K.
- Inferencia por linea de comandos: `predict_fusion.py "CC(=O)..."` para un SMILES individual o `--csv file.csv` para lotes.
- Reproducibilidad verificada: los miembros empaquetados reproducen sus predicciones guardadas por conjunto con error ~1e-6, y la fusion reproduce todas las cifras registradas en `GATE_RESULTS.json` (generado por `validate_benchmark.py`).
- No soporta tool calling, agentes, razonamiento multi-paso, vision, audio ni capacidades multilingues: no es un modelo de lenguaje.
- Dependencias de ejecucion: rdkit, xgboost, tensorflow/keras y pandas.

## Casos de uso

- Filtrado virtual de bibliotecas quimicas: dado un CSV de SMILES, el script `predict_fusion.py --csv` devuelve pKd estimado por compuesto, lo que permite priorizar candidatos antes de sintesis o ensayo. El autor indica que este modelo (en su version de despliegue) cribo 6.059 compuestos generados.
- Priorizacion en programas de descubrimiento de inhibidores de EGFR: util para ordenar series quimicas por afinidad predicha y decidir que compuestos avanzan a validacion experimental.
- Analisis de relaciones estructura-actividad (SAR) sobre el espacio de 2.432 caracteristicas: al ser un modelo tabular con XGBoost, permite inspeccionar importancia de caracteristicas y entender que descriptores empujan la prediccion.
- Estimacion rapida de DeltaG para estudios de energetica de union: la conversion directa a kcal/mol facilita comparaciones con datos calorimetricos o de docking.
- Reproduccion de benchmarks internos: el paquete incluye `GATE_RESULTS.json` y `validate_benchmark.py`, lo que permite a un equipo auditar las cifras reportadas (validacion RMSE 0,740 pKd con n=130; WT-full 0,385 con n=643; panel regulatorio 1,254 pKd / 1,710 kcal/mol con n=9; mutantes 1,029 con n=332).
- Evaluacion comparativa de estrategias de modelado (boosting frente a logica neuronal): el artefacto documenta que en el panel regulatorio de 9 farmacos la LTN sola (RMSE 0,988 pKd) supera a la fusion (1,254 pKd), lo que sirve como caso de estudio sobre seleccion de modelo y sobreajuste a la particion de validacion.

## Benchmarks y rendimiento

Datos reportados por el autor en la model card (RMSE en pKd salvo indicacion):

| Conjunto | n | RMSE fusion | RMSE LTN sola | RMSE XGBoost solo |
|---|---|---|---|---|
| Validacion | 130 | 0,740 | 0,953 | 0,745 |
| WT-full | 643 | 0,385 | no disponible | no disponible |
| Panel regulatorio (9 farmacos) | 9 | 1,254 pKd / 1,710 kcal/mol | 0,988 | no disponible |
| Mutantes | 332 | 1,029 | no disponible | no disponible |

No se han publicado resultados de benchmarks estandar de modelos de lenguaje (MMLU, HumanEval, GSM8K) en la informacion disponible, ya que no aplican a este artefacto.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el modelo es tabular y no requiere GPU para ejecutarse. XGBoost y una LTN pequena pueden correr en CPU.
- GPU recomendadas: no aplica; cualquier CPU moderna es suficiente. Una GPU consumer (por ejemplo, RTX 4090) solo aportaria ventaja marginal en la fase de inferencia de la LTN si se procesan lotes muy grandes.
- Cabe en GPU consumer: si, aunque innecesario; el cuello de botella real es el calculo de descriptores con RDKit, que es CPU-bound.
- Opciones de despliegue: ejecucion directa mediante `predict_fusion.py` (Python + rdkit + xgboost + tensorflow/keras + pandas). No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables de prediccion de afinidad EGFR con los que contrastar parametros, contexto, rendimiento o licencia. Como referencia interna, el propio artefacto compara sus dos miembros (XGBoost y LTN) y su fusion, con los resultados de la tabla de benchmarks.

## Limitaciones y advertencias

- Ambito muy restringido: predice unicamente afinidad de union a EGFR; no es un modelo general y no debe usarse fuera de ese dominio.
- Las metricas publicadas corresponden a la version benchmark (entrenada solo con 513 filas) y el autor advierte explicitamente de que no aplican a la version de despliegue.
- En el panel regulatorio de 9 farmacos la fusion (1,254 pKd) es peor que la LTN sola (0,988 pKd), lo que sugiere que la seleccion de la fusion se optimizo sobre la particion de validacion y puede no generalizar igual de bien a otros subconjuntos.
- Excluye inhibidores covalentes irreversibles sin Kd/Ki de equilibrio (mobocertinib y sunvozertinib quedan fuera del panel), por lo que no cubre esa clase terapeutica.
- Riesgo de alucinacion en sentido estricto no aplica, pero si existe riesgo de extrapolacion erronea fuera del dominio quimico representado en el entrenamiento; no se documenta el dominio de aplicabilidad.
- Licencia no disponible: no se puede confirmar si el uso comercial esta permitido; es un caveat critico para produccion.
- Sin descargas ni likes en el momento de la consulta, lo que limita la validacion externa por la comunidad.
- La fecha de creacion en los metadatos (2026-11-25) es posterior a la fecha de consulta habitual; conviene verificar la integridad del repositorio antes de usarlo.
- No se documentan sesgos, pero al ser un modelo entrenado sobre un pool concreto de datos Kd+Ki, puede heredar sesgos de seleccion de compuestos de ese dataset.

## Enlaces

- Hugging Face: https://huggingface.co/Delower/egfr-kd-best_xgboost_ltn-benchmark
- No se han encontrado en la busqueda web papers, blogs, repositorios ni demos adicionales relevantes sobre este modelo.
