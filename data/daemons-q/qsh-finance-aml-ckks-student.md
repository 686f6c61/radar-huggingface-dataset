# Daemons-Q/qsh-finance-aml-ckks-student

## Resumen

qsh-finance-aml-ckks-student es un modelo de regresion logistica destilada, publicado por Daemons-Q como parte del proyecto QSMPC-QKD-QHE-AI-Hybrid, una demostracion de orquestacion cuantica-segura. El modelo resuelve una tarea de clasificacion tabular binaria: deteccion de blanqueo de capitales (AML) sobre el corpus sintetico IBM AMLworld HI-Small. Su interes no reside en el rendimiento predictivo, sino en su tamano extremo: 33 parametros, lo que permite evaluarlo bajo cifrado homomorfico CKKS en un navegador mediante onnxruntime-web.

El modelo es un student destilado de un teacher de gradient boosting de 141.154 parametros. La model card es explicitamente honesta sobre el alcance: se trata de una prueba de concepto de investigacion, no de un sistema de produccion, y sus metricas deben leerse contra el teacher y no contra la literatura publicada. La licencia CDLA-Sharing-1.0 y el origen sintetico de los datos condicionan fuertemente su uso comercial.

No se dispone de informacion sobre arquitectura interna mas alla de "regresion logistica lineal", ni sobre longitud de contexto (no aplica a clasificacion tabular), ni sobre idiomas. El repositorio ocupa 0,0 GB y no registra descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Regresion logistica lineal (student destilado de gradient boosting) |
| Parametros totales | 33 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (clasificacion tabular) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no aplica: entrada tabular) |
| Licencia | CDLA-Sharing-1.0 |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

El modelo es una regresion logistica de 33 parametros, destilada a partir de un teacher de gradient boosting con 141.154 parametros. La tarea es clasificacion tabular binaria sobre el dataset IBM AMLworld HI-Small (5 millones de transacciones, 515.000 cuentas, aproximadamente 1 transaccion de blanqueo por cada 981). El dataset es generado sinteticamente por IBM mediante un modelo de mundo virtual multiagente, y se eligio por su calibracion a estadisticas reales de transacciones y por sus terminos CDLA-Sharing, no porque contenga datos reales.

El protocolo de evaluacion descrito difiere del usado en la literatura de referencia: se entrena sobre el 56 por ciento de las transacciones, se valida sobre el 14 por ciento y se prueba sobre el ultimo 30 por ciento, con caracteristicas de grafo propias cuyo bloque estructural se ajusta sobre la ventana de entrenamiento. La destilacion se midio offline, en texto plano, en tiempo de entrenamiento. No se documentan tecnicas como RLHF, DPO ni decodificacion especulativa, que no aplican a este tipo de modelo.

La innovacion tecnica relevante es la viabilidad de inferencia cifrada: 33 parametros permiten evaluar el modelo bajo CKKS con 64 ciphertexts sobre las 8.192 filas de la ventana de test de la muestra de finance_aml.gbm, comparando el resultado cifrado contra el mismo modelo en texto plano.

## Capacidades

- Clasificacion tabular binaria de transacciones financieras (blanqueo de capitales frente a actividad normal).
- Inferencia bajo cifrado homomorfico CKKS mediante onnxruntime-web, ejecutable en navegador.
- Destilacion de un teacher de gradient boosting con agreement medido de 0,982943 en texto plano.
- Integracion en pipelines de privacidad diferencial y computacion multiparte (MPC) para el argmax de clase.
- Generacion de valores SHAP en la demo publica, aunque corresponden a un modelo lineal de cuatro caracteristicas distinto (log del importe, flag TRANSFER o CASH_OUT, flag de hora nocturna y flag de beneficiario visto por primera vez).
- No soporta tool calling, agentes, razonamiento multi-paso, vision, audio ni capacidades multilingues.

## Casos de uso

- Demostracion de inferencia cifrada en navegador: el modelo se ejecuta bajo CKKS con onnxruntime-web sobre 64 ciphertexts, lo que permite ilustrar un flujo de privacidad extremo a extremo sin exponer los datos de entrada al servidor.
- Prueba de concepto de destilacion para entornos restringidos: sirve como ejemplo de como comprimir un teacher de gradient boosting (141.154 parametros) en un student de 33 parametros evaluable en hardware muy limitado.
- Evaluacion de privacidad en pipelines AML: se integra en el caso de uso finance_aml del proyecto QSMPC-QKD-QHE-AI-Hybrid para medir el coste de agreement entre inferencia cifrada y en texto plano.
- Referencia academica para investigacion en cifrado homomorfico aplicado a clasificacion tabular: el par student/teacher y las metricas publicadas permiten reproducir experimentos de viabilidad CKKS.
- Docencia y formacion en privacidad: el modelo y su demo permiten explicar de forma tangible las diferencias entre inferencia en claro, MPC y CKKS en un caso financiero concreto.
- Validacion de infraestructura ONNX en el navegador: sirve para probar cadenas de compilacion ONNX a onnxruntime-web y medir latencia y fidelidad numerica en un modelo minimo.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| agreement (student vs teacher, texto plano) | 0,982943 |
| disagreement_on_positives | 0,361913 |
| metric_delta | 0,090554 |
| metric_delta_pp | 9,0554 |
| n_eval | 1.523.504 |
| student_metric (F1 clase minoritaria) | 0,061394 |
| teacher_metric (F1 clase minoritaria) | 0,151948 |
| student_params | 33 |
| teacher_params | 141.154 |

Referencias de la literatura citadas en la model card (no medidas en este repositorio):

| Referencia | Metrica (F1 clase minoritaria) | Notas |
|---|---|---|
| GFP+XGBoost, IBM AMLworld HI-Small, NeurIPS 2023 D&B | 0,6323 +/- 0,17 | Split 60/20/20 por orden de transaccion, protocolo distinto |
| Multi-FraudGT (Bilgi y Atasu, TMLR 2026, arXiv:2412.00241v3) | 0,7581 +/- 0,75 | Mejor fila AML Small HI de la Tabla 16 |
| MEGA-PNA (mismo paper) | 0,7401 +/- 1,55 | |
| MEGA-GenAgg (mismo paper) | 0,7448 +/- 0,84 | |
| Multi-PNA (mismo paper) | 0,6735 +/- 2,89 | |

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 MB; el modelo tiene 33 parametros y se distribuye como ONNX de tamano despreciable (repositorio de 0,0 GB).
- GPU recomendadas: no requiere GPU; la demo publica se ejecuta en navegador mediante onnxruntime-web.
- Cabe en cualquier GPU consumer e incluso en CPU y en entornos WASM del navegador.
- Opciones de despliegue: onnxruntime-web (documentado), ONNX Runtime estandar; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles. La model card menciona 64 ciphertexts sobre 8.192 filas de test bajo CKKS, pero no publica tiempos.

## Comparativa con modelos similares

| Modelo | Parametros | Tarea | F1 clase minoritaria | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qsh-finance-aml-ckks-student | 33 | Clasificacion tabular AML | 0,061394 (medido) | CDLA-Sharing-1.0 | ONNX en HuggingFace |
| Teacher gradient boosting (interno) | 141.154 | Clasificacion tabular AML | 0,151948 (medido) | no disponible | no publicado |
| GFP+XGBoost (NeurIPS 2023 D&B) | no disponible | Clasificacion tabular AML | 0,6323 (literatura) | no disponible | referencia bibliografica |
| Multi-FraudGT (arXiv:2412.00241v3) | no disponible | Clasificacion tabular AML | 0,7581 (literatura) | no disponible | referencia bibliografica |

La comparacion directa con los metodos de la literatura no es valida en terminos de rendimiento: los protocolos de split y las caracteristicas difieren, y el propio autor lo advierte. La comparacion relevante es contra el teacher, donde el student pierde 9,06 puntos porcentuales de F1 y presenta un 36,19 por ciento de desacuerdo en la clase positiva.

## Limitaciones y advertencias

- Rendimiento predictivo muy bajo: F1 de 0,061394 en la clase minoritaria, frente a 0,151948 del teacher y 0,6323 de la referencia publicada. No es apto para produccion.
- Desacuerdo elevado en la clase positiva (0,361913): el student falla en mas de un tercio de los casos positivos respecto al teacher.
- El agreement de 0,982943 se midio offline y en texto plano; no es una metrica de inferencia cifrada. Cada ejecucion en navegador mide su propio encrypted_agreement.
- La demo publica cifra este student de 33 parametros, pero el paso CKKS de una fila, el argmax MPC, la clase reportada y las barras SHAP usan un modelo lineal de cuatro caracteristicas del sample de PaySim, distinto del modelo descrito.
- Datos de entrenamiento completamente sinteticos (IBM AMLworld HI-Small): no reflejan patrones reales de blanqueo y no existe un corpus comercial de transacciones reales de blanqueo.
- Licencia CDLA-Sharing-1.0: impone obligaciones de comparticion de datos derivados; requiere revision legal antes de cualquier uso comercial.
- Sin soporte multilingue ni de texto libre: solo acepta entradas tabulares con las caracteristicas definidas en el pipeline.
- Riesgo de alucinacion no aplica (no genera texto), pero el riesgo de falsos negativos en la clase positiva es alto y esta cuantificado.
- Proyecto de prueba de concepto: el autor lo declara explicitamente como no produccion, sin garantias de mantenimiento ni soporte.
- Sin descargas ni likes registrados: ausencia de validacion externa por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Daemons-Q/qsh-finance-aml-ckks-student
- Repositorio del proyecto: https://github.com/Quantum-Daemons/QSMPC-QKD-QHE-AI-Hybrid
- Dataset IBM AMLworld HI-Small: https://www.kaggle.com/datasets/ealtman2019/ibm-transactions-for-anti-money-laundering-aml
- Paper de referencia del dataset (Altman et al., NeurIPS 2023 D&B): no disponible como enlace directo en la informacion proporcionada
- Paper MEGA (Bilgi y Atasu, TMLR 2026): arXiv:2412.00241v3
