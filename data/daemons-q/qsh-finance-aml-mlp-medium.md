# Daemons-Q/qsh-finance-aml-mlp-medium

## Resumen

El modelo `qsh-finance-aml-mlp-medium` es un perceptrón multicapa (MLP) de muy pequeño tamano (1.618 parametros) desarrollado por Daemons-Q como parte del proyecto de investigacion QSMPC-QKD-QHE-AI-Hybrid, una demo de orquestacion "quantum-safe" para inferencia cifrada. Se trata de un modelo de clasificacion tabular entrenado sobre 32 caracteristicas derivadas del dataset sintetico IBM AMLworld HI-Small para deteccion de blanqueo de capitales (AML, anti-money laundering). Su proposito no es competir en rendimiento, sino servir como "tier model" para medir el coste de la inferencia cifrada bajo un esquema hibrido CKKS + MPC.

Este modelo concreto es la variante "medium" dentro de una familia de tiers de coste computacional para el caso de uso `finance_aml`. La arquitectura es un MLP [32, 32, 16, 2] con activaciones ReLU, donde las capas lineales se ejecutan bajo cifrado homomorfico CKKS y las ReLU y el argmax bajo computacion multipartita (MPC). Se publica como fichero ONNX (libreria `onnx`, con soporte declarado para `onnxruntime-web`), lo que permite su despliegue en navegador o en entornos con runtime ONNX.

El modelo es relevante no por sus cifras absolutas de deteccion —que quedan muy por debajo de los baselines publicados en el corpus— sino por su papel metodologico: demuestra el coste de ejecutar un MLP pequeno bajo primitivas criptograficas de preservacion de privacidad y cuantifica la brecha frente a un profesor de gradient boosting sobre las mismas caracteristicas (AUPRC 0.1052 frente a 0.1233). Los propios autores lo declaran como prueba de concepto de investigacion, no como sistema de produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Perceptron multicapa (MLP) [32, 32, 16, 2] con activaciones ReLU |
| Parametros totales | 1.618 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo tabular, sin contexto de secuencia) |
| Tipos de cuantizacion | no disponible (se distribuye como ONNX sin cuantizacion declarada) |
| Idiomas soportados | no disponible (no procesa lenguaje natural) |
| Licencia | CDLA-Sharing-1.0 |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

La arquitectura es un MLP de tres capas ocultas con dimensiones [32, 32, 16] y salida de 2 clases, con activaciones ReLU. La entrada son 32 caracteristicas de ingenieria ("engineered AMLworld features") agregadas por cuenta. En la demo de inferencia cifrada, las capas lineales se evaluan bajo CKKS (cifrado homomorfico de esquema Cheon-Kim-Kim-Song), mientras que las ReLU y el argmax se ejecutan bajo MPC. Esta division de trabajo es la innovacion tecnica central del proyecto: combina ambas primitivas criptograficas para minimizar el coste de cada operacion segun su estructura algebraica.

El entrenamiento se realizo sobre el dataset IBM AMLworld HI-Small (5M transacciones, 515K cuentas, aproximadamente 1 transaccion de blanqueo por cada 981) con ponderacion de clases, y no mediante destilacion del profesor. Los ventanas temporales son: ajuste (fit) 56%, validacion 14% y test el ultimo 30% de las transacciones en orden temporal. La semilla se eligio sobre la ventana de validacion. El modelo publicado corresponde a la semilla 3 y su entrenamiento registro un tiempo de reloj de 81,4 segundos. El umbral de decision (0,97231) se fijo sobre validacion. No se ha empleado RLHF ni DPO: es un clasificador supervisado clasico sobre datos tabulares.

## Capacidades

- Clasificacion binaria tabular de operaciones/transacciones para deteccion de blanqueo de capitales.
- Procesamiento de vectores de 32 caracteristicas de ingenieria derivadas de AMLworld.
- Inferencia cifrada bajo un esquema hibrido CKKS (capas lineales) + MPC (ReLU y argmax).
- Despliegue via ONNX y `onnxruntime-web`, lo que habilita ejecucion en navegador.
- No soporta generacion de texto, codigo, matematicas ni vision.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni comportamiento de agente.
- Sin capacidades multilingues (no procesa lenguaje natural).

## Casos de uso

- Prueba de concepto de inferencia con preservacion de privacidad en banca: el modelo permite evaluar el coste real (latencia, recursos) de ejecutar las capas lineales de un MLP bajo CKKS en un escenario de deteccion de fraude, sirviendo de referencia para dimensionar soluciones criptograficas en produccion.
- Benchmarking de esquemas hibridos CKKS+MPC: dado su tamano minimo (1.618 parametros), es adecuado como carga de trabajo controlada para comparar implementaciones de MPC y cifrado homomorfico antes de escalar a modelos mayores.
- Deteccion de blanqueo en entornos con requisitos de privacidad estrictos: en escenarios donde los datos de transacciones no pueden salir del dominio del cliente, la inferencia cifrada permite clasificar sin exponer caracteristicas en claro, aunque con las limitaciones de rendimiento documentadas.
- Demostracion educativa de "quantum-safe orchestration": forma parte del repositorio QSMPC-QKD-QHE-AI-Hybrid y se usa para ilustrar la combinacion de QKD (distribucion cuantica de claves), CKKS y MPC en un pipeline de IA.
- Prototipado en navegador con onnxruntime-web: al poder ejecutarse en el navegador, sirve para demos interactivas de clasificacion tabular con privacidad en el cliente sin backend especializado.
- Baseline interno de comparacion frente al profesor de gradient boosting: permite medir la brecha de rendimiento atribuible al MLP frente al modelo profesor (AUPRC 0.1052 frente a 0.1233) sobre las mismas caracteristicas y ventana de test.

## Benchmarks y rendimiento

Resultados medidos en el repositorio (semilla 3, ventana de test del ultimo 30% de transacciones):

| Metrica | Valor |
|---|---|
| Accuracy | 0.995371 |
| AUPRC | 0.105234 |
| AUPRC baseline | 0.00152346 |
| AUROC | 0.939026 |
| Minority class F1 (semilla 3) | 0.164435 |
| Max of seeds minority F1 | 0.173493 |
| Median of seeds minority F1 | 0.164435 |
| Min of seeds minority F1 | 0.131418 |
| Precision | 0.113399 |
| Recall | 0.299009 |
| Teacher agreement | 0.996074 |
| N test | 1.523.504 |
| N train | 2.843.872 |
| N val | 710.969 |
| Wall clock (entrenamiento) | 81,4 s |

Comparativa con referencias publicadas citadas en la model card (misma metrica de F1 de clase minoritaria, corpus y protocolo distintos):

| Modelo / referencia | Minority class F1 | Notas |
|---|---|---|
| Este modelo (seed 3) | 0.164435 | MLP sobre 32 caracteristicas agregadas por cuenta |
| Multi-FraudGT (Bilgi y Atasu, TMLR 2026) | 0.7581 | Techo publicado en HI-Small, arXiv:2412.00241v3 |
| MEGA-PNA | 0.7401 | Mismo paper |
| MEGA-GenAgg | 0.7448 | Mismo paper |
| Multi-PNA | 0.6735 | Mismo paper |
| GFP + XGBoost (Altman et al., NeurIPS 2023) | 0.6323 | Split 60/20/20 por orden de transaccion |
| GFP + LightGBM | 0.6286 | Mismo paper |
| PNA | 0.5677 | Mismo paper |

Los autores senalan que la comparacion significativa es con su propio profesor de gradient boosting sobre las mismas caracteristicas: AUPRC 0.1052 del MLP frente a 0.1233 del profesor en la misma ventana de test.

## Requisitos de hardware

- VRAM estimada para inferencia: practicamente despreciable; con 1.618 parametros el modelo ocupa pocos kilobytes en precision estandar (ONNX de tamano muy reducido; el repositorio declara 0,0 GB).
- GPU recomendadas: no requiere GPU. Puede ejecutarse en CPU, en navegador (onnxruntime-web) o en cualquier dispositivo con runtime ONNX.
- Cabe en cualquier GPU consumer: si, incluso en GPUs integradas o en CPU sin aceleracion.
- Opciones de despliegue: ONNX Runtime (incluida la variante web), y en el contexto del proyecto, un entorno de inferencia cifrada con CKKS + MPC (Los requisitos reales de computo vienen de las primitivas criptograficas, no del modelo).
- Latencia y throughput: no disponibles como cifras aisladas del modelo. El unico dato temporal publicado es el tiempo de entrenamiento (81,4 s); la model card no reporta latencia de inferencia en claro ni bajo cifrado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Minority F1 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qsh-finance-aml-mlp-medium | 1.618 | no aplica | 0.1644 | CDLA-Sharing-1.0 | Hugging Face (ONNX) |
| Multi-FraudGT | no disponible | no aplica | 0.7581 | no disponible | Referencia academica (TMLR 2026) |
| MEGA-PNA | no disponible | no aplica | 0.7401 | no disponible | Referencia academica |
| GFP + XGBoost (Altman et al.) | no disponible | no aplica | 0.6323 | no disponible | Referencia academica |

La comparativa directa no es equivalente: los baselines publicados usan caracteristicas por transaccion (subgrafos, message passing) y protocolos de split distintos, mientras que este modelo usa 32 caracteristicas agregadas por cuenta. La propia model card lo advierte.

## Limitaciones y advertencias

- Rendimiento muy inferior a los baselines publicados en el mismo corpus: F1 de clase minoritaria de 0,164 frente a 0,6323 de GFP+XGBoost y 0,7581 de Multi-FraudGT. La precision (0,113) y el recall (0,299) son bajos, lo que implica muchos falsos positivos y negativos.
- El AUPRC (0.1052) queda por debajo del profesor de gradient boosting (0.1233) sobre las mismas caracteristicas: no hay ganancia de rendimiento, solo la propiedad de inferencia cifrada.
- El dataset es sintetico: IBM declara explicitamente que "Everything is synthetic". Los resultados no garantizan transferencia a transacciones reales.
- Ventana de test que excede el rango de datos: HI-Small cubre del 1 al 10 de septiembre de 2022, pero el ultimo 30% de transacciones llega al 18 de septiembre; las 1.108 filas del 11 al 18 (655 de ellas de blanqueo, 28,2% de los positivos del test) afectan a las metricas. Sin ellas, el F1 del profesor caeria a 0,1387 y el AUPRC a 0,1030.
- Modelo declarado como prueba de concepto de investigacion, no como sistema de produccion.
- Licencia CDLA-Sharing-1.0: conviene revisar sus condiciones para uso comercial y para redistribucion de datos derivados.
- Sin soporte de lenguaje natural, vision, audio ni generacion: su unico uso es clasificacion tabular sobre las 32 caracteristicas especificas de AMLworld.
- Sin datos publicados de latencia de inferencia cifrada, lo que dificulta estimar su viabilidad en produccion.
- Riesgo de sobreajuste a la semilla: la F1 de clase minoritaria varia entre 0,1314 y 0,1735 segun semilla.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Daemons-Q/qsh-finance-aml-mlp-medium
- Repositorio del proyecto: https://github.com/Quantum-Daemons/QSMPC-QKD-QHE-AI-Hybrid
- Dataset IBM AMLworld (Kaggle): https://www.kaggle.com/datasets/ealtman2019/ibm-transactions-for-anti-money-laundering-aml
- Paper de referencia MEGA (arXiv:2412.00241v3): https://arxiv.org/abs/2412.00241
- Paper del dataset (Altman et al., NeurIPS 2023 D&B): no disponible como enlace directo en la informacion proporcionada.
