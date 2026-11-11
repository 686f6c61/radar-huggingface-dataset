# Delower/dpp4-pic50-ltn

## Resumen

DPP-4 pIC50 — LTN (tuned) es un modelo de regresión tabular desarrollado por el usuario Delower que predice el valor de pIC50 (potencia inhibitoria) frente a la enzima DPP-4 (dipeptidil peptidasa-4) a partir de la estructura molecular de un compuesto. DPP-4 es una diana terapeutica relevante en el tratamiento de la diabetes tipo 2 (los farmacos gliptinas actuan como inhibidores de esta enzima), por lo que un modelo de este tipo se enmarca en el descubrimiento de farmacos asistido por computacion (QSAR, relacion cuantitativa estructura-actividad).

Tecnicamente no es un modelo de lenguaje: es una red neuronal densa (MLP) de Keras con capas 768-384-192 y activacion ELU, integrada dentro de una Logic Tensor Network (LTN) que introduce una capa de logica difusa con predicado de igualdad y agregacion `Forall pMeanError p=2`. La entrada son 4.608 bits de huellas moleculares (Morgan/ECFP4 en varias configuraciones y path fingerprint de RDKit) y la salida es un unico escalar continuo (pIC50).

Su relevancia es acotada y de nicho: se trata de un artefacto experimental de investigacion con cero descargas y cero likes en el momento de la consulta, cuyo interes principal es metodologico (aplicacion de LTN a regresion QSAR) y no de produccion general. Alcanza un R² de 0,8739 en el conjunto de test interno, aunque con la advertencia explicita del autor de que la deduplicacion por cadena SMILES puede inflar ligeramente las metricas internas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MLP Keras 768-384-192 (ELU) → 1, dentro de una Logic Tensor Network (LTN) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo tabular, no secuencial) |
| Tipos de cuantizacion | no disponible (pesos en `.npz` como arrays Keras crudos) |
| Idiomas soportados | no aplica (entrada molecular, no texto) |
| Licencia | MIT |
| Formato de pesos | `.npz` (arrays Keras `w0..w7`) + `ltn_config.json` |

## Arquitectura y entrenamiento

La arquitectura es un perceptron multicapa de tres capas ocultas (768, 384 y 192 neuronas) con activacion ELU y salida escalar, entrenado dentro del marco de Logic Tensor Networks. La LTN define un predicado de igualdad `1/(1+0.5‖a−b‖)`, una agregacion `Forall pMeanError` con p=2 y una funcion de perdida `1−sat` (uno menos la satisfaccion logica). El optimizador es Adam con learning rate 1e-4, tamano de lote 256, semilla 42 y un presupuesto de 85 epocas con instantanea de mejor validacion. Los pesos desplegados corresponden a la configuracion ganadora `b256` de una busqueda de 7 configuraciones.

Los datos de entrenamiento proceden de un conjunto curado de 10.085 compuestos apilados de ChEMBL, BindingDB, PubChem, el conjunto ChEMBL-2024 y DTC. Se descartaron los IC50 censurados ≥ 100.000 nM y los SMILES duplicados se resolvieron por mediana (descartando conflictos > 1 log). El split es 80/10/10 con semilla 42, estratificado por banda de pIC50, excluyendo las 12 gliptinas aprobadas por la FDA de todos los conjuntos. El modelo evaluado se entreno solo con el 80% de entrenamiento (8.068 filas). El autor documenta que los tres intentos de reentrenar esta configuracion con el conjunto completo divergieron a mitad de entrenamiento (epocas 49, 68 y 25) pese a aplicar recorte de gradiente 1.0 y reducir el learning rate a 5e-5.

Las caracteristicas de entrada son 4.608 bits binarios de huellas: Morgan/ECFP4 (r=2) de 1024 bits, path fingerprint de RDKit de 1024 bits, Morgan de 512 bits y Morgan de 2048 bits, sin estandarizacion. La inferencia puede ejecutarse con TensorFlow reconstruyendo la red, o con un pase forward solo en NumPy que reproduce las predicciones con error < 1e-5 (es el metodo que usa la aplicacion web del proyecto).

## Capacidades

- Prediccion de regresion de pIC50 frente a DPP-4 a partir de un SMILES molecular.
- Clasificacion derivada (activo/inactivo segun esquema del paper) a partir del pIC50 predicho, con accuracy 0,9007, F1 macro 0,8923, MCC 0,7866 y ROC-AUC macro 0,9948 en test.
- Inferencia standalone en NumPy sin dependencia de TensorFlow para el pase forward.
- Entrada exclusivamente tabular (huellas moleculares); no procesa texto, imagenes ni audio.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso.
- No tiene capacidades multilingues (no es un modelo de lenguaje).
- No dispone de modo thinking, vision ni audio.

## Casos de uso

- Priorizacion virtual de compuestos en descubrimiento de farmacos para DPP-4: dado un lote de SMILES candidatos, el modelo estima su pIC50 y permite ordenar la sintesis o el ensayo experimental por potencia esperada, reduciendo el coste de cribado.
- Filtrado temprano en pipelines de quimioinformatica: integrado como paso de scoring dentro de un flujo que genera o recupera moleculas (por ejemplo, de ChEMBL o PubChem) y descarta las de baja potencia predicha antes de pasar a etapas mas costosas.
- Analisis de relaciones estructura-actividad (SAR): comparando predicciones sobre variantes estructurales de una misma familia quimica se pueden identificar fragmentos o sustituciones asociados a mayor pIC50.
- Reproduccion metodologica de LTN en QSAR: sirve como referencia para investigadores que quieran aplicar Logic Tensor Networks a problemas de regresion molecular, ya que el repositorio incluye el script de entrenamiento (`train_ltn_dpp4.py`) y la configuracion.
- Validacion externa contra farmacos conocidos: el conjunto FDA-12 (gliptinas aprobadas) permite comprobar el comportamiento del modelo frente a moleculas reales con actividad medida en laboratorio (RMSE 0,8348, MAE 0,6498).
- Servicio de prediccion ligero en web o edge: al poder ejecutarse el pase forward solo con NumPy, el modelo se puede desplegar en entornos sin TensorFlow ni GPU, con latencia muy baja por compuesto.

## Benchmarks y rendimiento

| Split | RMSE | MAE | R² |
|---|---|---|---|
| Validacion (n=1.009) | 0,3907 | 0,1767 | 0,9053 |
| Test (n=1.009) | 0,4457 | 0,1870 | 0,8739 |
| FDA-12 externo vs laboratorio (n=11) | 0,8348 | 0,6498 | no disponible |

| Metrica derivada (test) | Valor |
|---|---|
| Accuracy | 0,9007 |
| F1 macro | 0,8923 |
| MCC | 0,7866 |
| ROC-AUC macro | 0,9948 |

| Comparativa interna | RMSE test | RMSE FDA húmedo |
|---|---|---|
| LTN (este modelo) | 0,4457 | 0,8348 |
| ExtraTrees | 0,4449 | 0,9637 |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; por el tamano de la red (capas 768-384-192 y 4.608 entradas) el modelo es muy pequeno y cabe holgadamente en cualquier GPU consumer, e incluso en CPU.
- GPU recomendadas: no requiere GPU dedicada; cualquier GPU moderna (RTX 3060 o superior) acelera el pase forward, pero una CPU es suficiente para inferencia por lotes moderados.
- Cabe en GPU consumer: si, en cualquier GPU con memoria disponible, dado el reducido numero de parametros de la MLP.
- Opciones de despliegue: TensorFlow/Keras mediante `infer.py` (reconstruye la red desde `ltn_model.npz` y `ltn_config.json`) o pase forward solo en NumPy (metodo usado por la aplicacion web del proyecto). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponible; por la naturaleza del modelo se espera una latencia por compuesto del orden de milisegundos, pero no se publican cifras medidas.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | R² test | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| DPP-4 pIC50 LTN (este) | MLP + LTN sobre huellas | no disponible | no aplica | 0,8739 | MIT | Hugging Face (0 descargas) |
| ExtraTrees (comparativa del autor) | Ensemble de arboles | no disponible | no aplica | no disponible (RMSE test 0,4449) | no disponible | Referenciado en la model card |
| Otros modelos QSAR de DPP-4 | no disponible | no disponible | no aplica | no disponible | no disponible | no disponible |

No se dispone de informacion sobre otros modelos publicos comparables de prediccion de pIC50 para DPP-4 en la informacion proporcionada; la unica comparacion documentada es la del propio autor frente a ExtraTrees.

## Limitaciones y advertencias

- Las metricas internas pueden ser optimistas: la deduplicacion se hizo por cadena SMILES, pero los 10.085 registros corresponden a 7.327 compuestos canonicos unicos, por lo que puede haber fuga de informacion entre splits.
- El modelo desplegado no se entreno con el conjunto completo: los tres intentos de reentrenamiento con las 10.097 filas divergieron, de modo que las cifras reportadas son del modelo tuneado sobre el 80% de entrenamiento.
- La validacion externa se apoya en solo 11 compuestos (FDA-12), una muestra muy pequena que limita la robustez estadistica de esa estimacion (RMSE 0,8348).
- Es un modelo de nicho con cero descargas y cero likes en el momento de la consulta; no hay evidencia de uso en produccion ni validacion independiente por terceros.
- Aplicable unicamente a la diana DPP-4 y al espacio quimico representado en los datos de entrenamiento; no debe extrapolarse a otras dianas ni a clases quimicas alejadas del conjunto.
- Riesgo de error en compuestos fuera de dominio: al ser un modelo de regresion entrenado sobre huellas binarias, la prediccion para estructuras muy distintas puede ser poco fiable sin analisis de aplicabilidad.
- Licencia MIT: permite uso comercial y modificacion con atribucion, pero el autor no ofrece garantias sobre el rendimiento en produccion.
- No se documentan sesgos ni evaluaciones de equidad, algo esperable en un modelo molecular y no de lenguaje.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Delower/dpp4-pic50-ltn
- No se han encontrado en la informacion proporcionada enlaces adicionales a papers, blogs, repositorios o demos.
