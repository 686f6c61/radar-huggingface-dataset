# fellype-dev-ai/br-risk-ml

## Resumen

BR-Risk-ML es un clasificador tabular multiclase desarrollado por Fellype Moura (usuario `fellype-dev-ai`) que estima la gravedad de accidentes de carretera registrados en las vías federales de Brasil. A partir de registros históricos públicos de la Policia Rodoviaria Federal (PRF), el modelo asigna cada ocurrencia a una de tres categorias: con victimas mortales, con victimas heridas o sin victimas. El artefacto publicado es un pipeline completo de scikit-learn que empaqueta el preprocesamiento y un estimador XGBoost serializado en formato joblib.

El modelo no es una red neuronal ni un modelo de lenguaje: es un clasificador de gradient boosting sobre datos tabulares, con siete variables de entrada (tres categoricas y cuatro numericas). Se entrenó con 486.974 registros del periodo 2017-2023 y se evaluó de forma diagnóstica sobre 145.729 registros de 2024-2025, obteniendo un F1 Macro de 0.5726 y una accuracy de 0.7567. Su relevancia es acotada: sirve como referencia reproducible de un flujo de machine learning aplicado a datos abiertos gubernamentales y como caso de estudio de clasificacion desbalanceada en el dominio de seguridad vial.

La licencia MIT permite reutilizacion y modificacion, aunque el propio autor delimita explicitamente el uso previsto al estudio, la experimentacion y el analisis retrospectivo, excluyendo decisiones operativas en tiempo real, despacho de emergencias, fiscalizacion o tarificacion de seguros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gradient boosting de arboles (XGBoost) dentro de un pipeline de scikit-learn |
| Parametros totales | no disponible (no se publica el numero de arboles-hoja ni el recuento de nodos) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo tabular, sin ventana de contexto) |
| Tipos de cuantizacion | no disponible (no se documentan variantes cuantizadas; el artefacto es un joblib de precision nativa) |
| Idiomas soportados | portugues (pt); las categorias de entrada estan en portugues |
| Licencia | MIT |
| Formato de pesos | joblib (`br_risk_xgboost.joblib`), pipeline serializado de scikit-learn |

## Arquitectura y entrenamiento

El modelo es un clasificador XGBoost multiclase envuelto en un `Pipeline` de scikit-learn que encadena el preprocesamiento y el estimador. El preprocesamiento incluye imputacion de valores numericos por la mediana, relleno de categorias ausentes, codificacion one-hot y tratamiento de categorias raras y desconocidas. La configuracion del estimador es `max_depth=8`, `learning_rate=0.1`, `n_estimators=400`, `min_child_weight=3`, `subsample=0.8`, `colsample_bytree=0.8`, `reg_lambda=1` y `random_state=42`.

El entrenamiento usa la raiz cuadrada de los pesos balanceados por clase para mitigar el fuerte desbalance (la clase "con victimas heridas" concentra la mayoria de los registros). Tras el ajuste, la implementacion aplica multiplicadores de score de 0.978 para fatais, 1.000 para feridos y 1.118 para sem vitimas, un paso de calibracion posterior a la prediccion del estimador. Las variables de entrada son `tipo_acidente`, `causa_acidente` y `fase_dia` (categoricas) y `pessoas`, `veiculos`, `latitude` y `longitude` (numericas). Se excluyeron explicitamente las columnas que revelan la etiqueta o sus componentes: `classificacao_acidente`, `mortos`, `feridos`, `feridos_leves`, `feridos_graves`, `ilesos` e `ignorados`.

Los datos proceden del portal de datos abiertos de la PRF, agrupados por ocurrencia. El artefacto actual se entrenó con 486.974 registros de 2017 a 2023, tras eliminar diez registros sin variable objetivo. El autor advierte que 2023 participo en la seleccion y optimizacion de hiperparametros y quedo incluido en el entrenamiento final, por lo que la metrica observada en ese año (F1 Macro = 0.6143) es in-sample.

## Capacidades

- Clasificacion multiclase de gravedad de accidentes en tres categorias: con victimas mortales, con victimas heridas y sin victimas.
- Procesamiento de variables tabulares mixtas: categoricas de alta cardinalidad (`causa_acidente`) y numericas continuas (coordenadas geograficas).
- Manejo integrado de valores ausentes mediante imputacion por mediana y relleno de categorias.
- Tratamiento de categorias raras y no vistas en entrenamiento, lo que facilita su aplicacion a registros nuevos con vocabulario parcialmente distinto.
- Interpretabilidad nativa mediante importancia por Gain y valores SHAP, documentada por el autor.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, vision, audio ni generacion de texto. No es un modelo de lenguaje.
- No realiza prediccion temporal ni espacial de accidentes: solo clasifica registros de accidentes ya ocurridos.

## Casos de uso

- Analisis retrospectivo de siniestralidad: clasificar lotes historicos de registros de la PRF para estudiar la distribucion de gravedad por tipo de accidente, causa y franja horaria, aprovechando que el modelo ya esta ajustado sobre ese mismo esquema de datos.
- Docencia y demostracion de pipelines de machine learning: el artefacto joblib incluye el preprocesamiento completo, por lo que sirve como ejemplo reproducible de un flujo tabular con codificacion one-hot, imputacion y boosting en scikit-learn.
- Estudio de clasificacion desbalanceada: la combinacion de pesos por clase, multiplicadores de score y metricas macro lo convierte en un caso practico para analizar el compromiso entre accuracy y balanced accuracy en clases minoritarias.
- Investigacion de interpretabilidad: las tablas de Gain y SHAP publicadas permiten replicar analisis de atribucion de caracteristicas y comparar metodos de explicacion sobre un modelo de arboles.
- Prototipado de sistemas de analitica vial: integrado en un cuadro de mando interno, puede etiquetar registros historicos para segmentar informes por gravedad estimada, siempre con revision humana y sin uso operativo.
- Benchmark de referencia para modelos tabulares: al estar serializado y documentado, sirve como baseline reproducible frente a alternativas como regresion logistica, Random Forest o LightGBM sobre el mismo conjunto de datos publicos.
- Experimentacion con datos abiertos gubernamentales: permite explorar tecnicas de limpieza, exclusion de variables con fuga de informacion y evaluacion temporal sobre un corpus publico de casi medio millon de registros.

## Benchmarks y rendimiento

Evaluacion temporal diagnostica sobre 145.729 registros de 2024-2025 (periodo no usado para entrenar el artefacto actual, pero consultado en experimentos previos del desarrollo; no constituye un holdout independiente e intocado):

| Metrica | Resultado |
|---|---:|
| Registros evaluados | 145.729 |
| Accuracy | 0.7567 |
| F1 Macro | 0.5726 |
| Balanced Accuracy | 0.5753 |

Desglose por clase:

| Clase | Precision | Recall | F1-score | Soporte |
|---|---:|---:|---:|---:|
| Com Vitimas Fatais | 0.3840 | 0.4321 | 0.4067 | 10.434 |
| Com Vitimas Feridas | 0.8458 | 0.8507 | 0.8482 | 112.375 |
| Sem Vitimas | 0.4847 | 0.4432 | 0.4630 | 22.920 |

Comparacion con baseline (`DummyClassifier(strategy="most_frequent")`) en el mismo conjunto diagnostico:

| Modelo | F1 Macro | Accuracy | Balanced Accuracy |
|---|---:|---:|---:|
| XGBoost (BR-Risk-ML) | 0.5726 | 0.7567 | 0.5753 |
| DummyClassifier (clase mayoritaria) | 0.2903 | 0.7711 | 0.3333 |

La baseline obtiene mayor accuracy porque predice siempre la clase mayoritaria, pero no identifica las clases minoritarias, lo que se refleja en su F1 Macro y balanced accuracy muy inferiores.

## Requisitos de hardware

- Inferencia en CPU: el artefacto es un modelo de arboles serializado en joblib; no requiere GPU y puede ejecutarse en cualquier maquina con Python y las dependencias de scikit-learn y XGBoost instaladas.
- VRAM estimada: no aplica; no hay ejecucion en GPU documentada ni necesaria.
- GPU recomendadas: no aplica para inferencia. El entrenamiento puede acelerarse con GPU compatible con XGBoost, pero el autor no documenta la configuracion usada.
- Uso en GPU de consumo: irrelevante para el despliegue; el cuello de botella es la carga del pipeline y el preprocesamiento, no el calculo.
- Opciones de despliegue: carga directa con `joblib.load` en Python, servicio REST con FastAPI o Flask, o integracion en pipelines de scikit-learn. No aplica vLLM, llama.cpp, Ollama ni TGI, que estan orientados a modelos de lenguaje.
- Latencia y throughput: no disponibles en la informacion proporcionada.
- Tamano del repositorio: 0.0 GB segun Hugging Face, coherente con un artefacto joblib de arboles de tamano moderado.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables publicados con el mismo esquema de datos, la misma tarea o el mismo conjunto de variables. El autor solo documenta una comparacion interna con un `DummyClassifier`, recogida en la seccion de benchmarks. Cualquier comparacion con otros clasificadores tabulares de siniestralidad vial requeriria reentrenarlos sobre el mismo corpus de la PRF, dato que no se aporta.

| Modelo | Parametros | Contexto | F1 Macro (2024-2025) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| BR-Risk-ML (XGBoost) | no disponible | no aplica | 0.5726 | MIT | Hugging Face |
| DummyClassifier (baseline del autor) | no aplica | no aplica | 0.2903 | no aplica | incluido en scikit-learn |
| Alternativas tabulares comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El modelo clasifica accidentes ya ocurridos; no predice cuando ni donde ocurrira un accidente ni estima riesgo en ubicaciones sin registros. El autor lo declara explicitamente fuera de alcance.
- No fue desarrollado ni validado para decisiones operativas en tiempo real, despacho de emergencias, fiscalizacion, tarificacion de seguros ni ninguna decision que afecte directamente a personas.
- La evaluacion sobre 2024-2025 no es un holdout independiente: ese periodo ya se consulto en experimentos anteriores del desarrollo. Los numeros deben interpretarse como diagnostico, no como estimacion limpia de generalizacion.
- La metrica de 2023 (F1 Macro = 0.6143) es in-sample, ya que ese año participo en la seleccion de hiperparametros y en el entrenamiento final.
- Rendimiento desigual por clase: la clase "com vitimas feridas" alcanza F1 0.8482, mientras que "com vitimas fatais" se queda en 0.4067 y "sem vitimas" en 0.4630. La matriz de confusion muestra 6.723 falsos negativos de victimas feridas clasificadas como fatais y 5.178 fatais clasificadas como heridas.
- El modelo depende de la calidad y el esquema del corpus de la PRF; cambios en la codificacion de `tipo_acidente` o `causa_acidente` pueden degradar el rendimiento por el tratamiento de categorias desconocidas.
- Solo esta documentado para portugues y para el contexto normativo y viario de Brasil; su transferencia a otros paises o idiomas no esta validada.
- Riesgo de sesgo geografico y temporal: las coordenadas y la distribucion de causas reflejan la red viaria federal brasileña del periodo 2017-2023, y el modelo puede reproducir patrones historicos de notificacion.
- Licencia MIT permite uso comercial, pero el autor restringe el uso previsto a estudio y experimentacion; conviene revisar esa delimitacion antes de cualquier despliegue productivo.
- Riesgo de alucinacion: no aplica en el sentido de modelos generativos, pero si existe riesgo de predicciones sobreconfiadas en clases minoritarias por el desbalance del corpus.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/fellype-dev-ai/br-risk-ml
- Codigo fuente en GitHub: https://github.com/llype-ENG/br-risk-ml
- Portal de datos abiertos de la PRF: https://www.gov.br/prf/pt-br/acesso-a-informacao/dados-abertos
- Datos abiertos de accidentes de la PRF: https://www.gov.br/prf/pt-br/acesso-a-informacao/dados-abertos/dados-abertos-da-prf
- Paper: no disponible
- Blog o demo: no disponible
