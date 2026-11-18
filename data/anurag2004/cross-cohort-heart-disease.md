# anurag2004/cross-cohort-heart-disease

## Resumen

Cross-Cohort Heart Disease Detection es un conjunto de pipelines de scikit-learn congelados, publicados como artefactos de investigacion del articulo *Cross-Cohort Heart Disease Detection Using Interpretable and Calibration-Aware Machine Learning* (I3CSET-2026, Paper 473), firmado por Kanhaiya Kumar Sahani, Anurag Kumar Ojha y Asad Khan, con la mentoria de Shanu Verma en el Departamento de Tecnologia de la Informacion del Galgotias College of Engineering and Technology (Greater Noida). No es un modelo generativo ni una red neuronal: son cuatro pipelines clasicos (regresion logistica L2 y random forest) serializados con joblib, cada uno con su preprocesado completo (imputacion, escalado y one-hot encoding) y ajustados una sola vez sobre los 303 registros del cohorte Cleveland del dataset UCI Heart Disease.

El objetivo del trabajo es evaluar la transferibilidad entre cohortes de un modelo entrenado en Cleveland y aplicado sin reentrenamiento a Hungary (294 registros), Switzerland (123) y Long Beach VA (200). La variante principal, `portable_logistic.joblib`, usa solo 10 predictores portables y obtiene un AUC de 0,875 en validacion cruzada interna y de 0,815 en el conjunto externo agrupado (617 registros), con un Brier de 0,179. El otro eje del articulo es la calibracion: el modelo mantiene la capacidad de ranking pero la calibracion no transfiere, con una infraprediccion severa del riesgo en la cohorte suiza (prevalencia del 93,5 %, intercepto de calibracion de 2,968 y pendiente de 0,585).

Es relevante ahora como referencia metodologica reproducible para quien trabaje en validacion externa y calibracion de modelos tabulares clinicos, y como ejemplo de publicacion de artefactos con manifiesto de ejecucion (semilla, versiones de paquetes y hashes de datos). El autor advierte explicitamente que es un prototipo de investigacion sobre un benchmark de 1988 y que no debe usarse en clinica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipelines de scikit-learn: regresion logistica L2 (C = 1, solver liblinear) y random forest (500 arboles, profundidad 5, min leaf 5) |
| Parametros totales | No disponible (no se publica el numero de coeficientes ni de nodos de los arboles) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (entrada tabular de 10 o 13 predictores) |
| Tipos de cuantizacion | No disponible (no aplica; los artefactos son joblib, no pesos de red) |
| Idiomas soportados | No disponible (no procesa lenguaje natural) |
| Licencia | CC BY 4.0 |
| Formato de pesos | joblib (`.joblib`), con `run_manifest.json` de metadatos |

## Arquitectura y entrenamiento

Cada artefacto es un `Pipeline` completo de scikit-learn que encadena imputacion de valores faltantes (medianas o modas de Cleveland), escalado, codificacion one-hot y clasificador. Hay dos familias: regresion logistica L2 con C = 1 y solver liblinear, y random forest de 500 arboles con profundidad maxima 5 y minimo de 5 muestras por hoja. Se publican cuatro variantes: `portable_logistic` y `portable_rf` con 10 predictores portables (age, trestbps, chol, thalach, oldpeak, sex, cp, fbs, restecg, exang), y `full_logistic` y `full_rf` con 13 predictores, que anaden slope, ca y thal.

El desarrollo usa exclusivamente los 303 registros de Cleveland (45,9 % con enfermedad), con validacion cruzada estratificada de 5 pliegues repetida 10 veces y el preprocesado ajustado dentro de cada pliegue. Los modelos se congelan tras ese ajuste y se evaluan sin reentrenamiento en Hungary, Switzerland y Long Beach VA. El desenlace es enfermedad arterial coronaria angiografica (`num` > 0, al menos 50 % de estrechamiento). No se aplico sobremuestreo, ponderacion de clases ni busqueda de hiperparametros, lo que hace el resultado directamente interpretable pero limita el ajuste fino. El manifiesto de ejecucion registra semilla, versiones de paquetes (scikit-learn 1.9.1) y hashes de los datos.

## Capacidades

- Clasificacion tabular binaria: estima la probabilidad de enfermedad arterial coronaria a partir de 10 o 13 variables clinicas codificadas segun UCI.
- Salida probabilistica calibrada en el dominio de desarrollo: `predict_proba` devuelve la probabilidad de enfermedad, con Brier de 0,143 en validacion interna.
- Interpretabilidad directa: los coeficientes de la regresion logistica permiten leer la contribucion de cada predictor sin tecnicas post hoc.
- Robustez a valores faltantes: acepta `NaN` y los imputa con medianas o modas de Cleveland.
- Analisis de calibracion: el articulo reporta intercepto y pendiente de calibracion por cohorte, lo que permite planificar recalibracion local.
- No soporta tool calling, agentes, razonamiento multi-paso, vision, audio ni capacidades multilingues.

## Casos de uso

- Validacion externa de modelos clinicos tabulares: sirve como linea base reproducible para comparar el rendimiento entre cohortes de un mismo problema, ya que los pipelines estan congelados y el manifiesto fija semilla y versiones.
- Estudio de calibracion y recalibracion: el intercepto y la pendiente por cohorte permiten demostrar por que un modelo con AUC estable puede infraestimar el riesgo en poblaciones con prevalencia distinta, y practicar recalibracion local antes de desplegar.
- Docencia en machine learning clinico: el ejemplo de uso con un `DataFrame` de 10 columnas es un caso minimo para explicar pipelines, imputacion, one-hot encoding y evaluacion con AUC y Brier.
- Investigacion sobre transporte de modelos entre hospitales: comparar la variante portable (10 predictores) con la completa (13) cuantifica el coste de prescindir de slope, ca y thal, variables no disponibles en todos los centros.
- Auditoria de sesgo por subgrupos: el articulo reporta sensibilidad de 0,400 en mujeres frente a 0,754 en hombres en el conjunto externo, lo que lo convierte en un caso de estudio para analisis de equidad con tamanos muestrales pequeños.
- Reproducibilidad de artefactos: el par `joblib` mas `run_manifest.json` es una plantilla para publicar modelos de scikit-learn con trazabilidad de versiones y hashes de datos.
- Prototipado rapido de triaje tabular en entornos sin GPU: al ser inferencia puramente CPU y de tamano despreciable (repo de 0,0 GB), se puede integrar en scripts de analisis sin infraestructura adicional.

## Benchmarks y rendimiento

Resultados del modelo portable logistico publicados en la model card:

| Evaluacion | Registros | AUC (IC 95 %) | Brier | Sensibilidad | Especificidad | Intercepto cal. | Pendiente cal. |
|---|---|---|---|---|---|---|---|
| Cleveland (CV interna) | 303 | 0,875 (0,835-0,913) | 0,143 | 0,755 | 0,841 | -0,046 | 0,972 |
| Hungary | 294 | 0,877 (0,832-0,919) | 0,135 | 0,783 | 0,814 | -0,551 | 0,909 |
| Switzerland | 123 | 0,766 (0,620-0,899) | 0,267 | 0,609 | 0,625 | 2,968 | 0,585 |
| Long Beach VA | 200 | 0,722 (0,642-0,797) | 0,188 | 0,785 | 0,529 | 0,664 | 0,488 |
| Externo agrupado | 617 | 0,815 (0,780-0,848) | 0,179 | 0,730 | 0,749 | 0,405 | 0,702 |

Sensibilidad y especificidad con umbral de 0,50; intervalos de confianza por bootstrap con 2.000 remuestreos. No se publican resultados de las variantes random forest ni de los modelos completos de 13 predictores en la informacion disponible.

## Requisitos de hardware

- VRAM: no aplica; la inferencia es en CPU y el repositorio ocupa 0,0 GB.
- GPU: no requiere ninguna. Cualquier CPU capaz de ejecutar scikit-learn sirve; para lotes grandes conviene una maquina con varios nucleos.
- GPU de consumo: irrelevante para este modelo; no hay version acelerada por GPU.
- Despliegue: carga directa con `joblib.load` en Python, o servicio HTTP envolviendo el pipeline. No aplican vLLM, llama.cpp, Ollama ni TGI, que estan pensados para modelos de lenguaje.
- Latencia y throughput: no disponibles en la informacion proporcionada; por la naturaleza del modelo (regresion logistica y bosque de 500 arboles de profundidad 5) la inferencia por registro es del orden de microsegundos a pocos milisegundos, pero no se cita una cifra medida.
- Requisito critico: usar scikit-learn 1.9.1, la version registrada en `run_manifest.json`, para evitar avisos y posibles incompatibilidades de deserializacion.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | AUC externo | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Cross-Cohort Heart Disease (portable logistic) | Regresion logistica L2 sobre 10 predictores | No disponible | No aplica | 0,815 (agrupado, 617 registros) | CC BY 4.0 | Hugging Face y GitHub |
| Cross-Cohort Heart Disease (portable RF) | Random forest 500 arboles, profundidad 5 | No disponible | No aplica | No disponible | CC BY 4.0 | Hugging Face y GitHub |
| Cross-Cohort Heart Disease (full logistic) | Regresion logistica L2 sobre 13 predictores | No disponible | No aplica | No disponible | CC BY 4.0 | Hugging Face y GitHub |
| Cross-Cohort Heart Disease (full RF) | Random forest sobre 13 predictores | No disponible | No aplica | No disponible | CC BY 4.0 | Hugging Face y GitHub |

No se dispone de datos de benchmarks de modelos de terceros sobre las mismas cohortes en la informacion proporcionada, por lo que no se puede establecer una comparacion cuantitativa con alternativas externas.

## Limitaciones y advertencias

- La calibracion no transfiere entre cohortes: en Switzerland (prevalencia del 93,5 %) el riesgo se infrapredice de forma severa (intercepto 2,968, pendiente 0,585). Es obligatorio recalibrar con datos locales antes de cualquier uso en un centro nuevo.
- Los datos proceden de aproximadamente 1988 y de pacientes ya derivados a angiografia; no es una herramienta de cribado poblacional.
- La sensibilidad externa fue de 0,400 en mujeres frente a 0,754 en hombres. Solo 25 mujeres externas tenian enfermedad, por lo que es una senal para investigar mas, no una prueba de sesgo.
- No hay datos de etnia ni socioeconomicos, ni validacion prospectiva.
- El modelo no se reentreno en las cohortes externas y no se aplico ponderacion de clases ni busqueda de hiperparametros, lo que limita el ajuste al desbalance.
- Riesgo de alucinacion: no aplica en el sentido de modelos generativos, pero si existe riesgo de extrapolacion silenciosa si se alimenta con distribuciones de entrada muy distintas a las de Cleveland.
- Licencia CC BY 4.0: permite uso comercial con atribucion, pero la model card declara explicitamente que es un prototipo de investigacion y no apto para uso clinico; esa advertencia prevalece sobre cualquier habilitacion legal.
- Seguridad de carga: solo deben cargarse los `.joblib` desde fuentes de confianza, ya que la deserializacion de joblib puede ejecutar codigo arbitrario.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin senales de adopcion ni mantenimiento por parte de terceros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/anurag2004/cross-cohort-heart-disease
- Codigo, datos y resultados completos: https://github.com/intojhanurag/cross-cohort-heart-disease
- Dataset UCI Heart Disease: https://doi.org/10.24432/C52P4X
- Referencia del dataset: Janosi A, Steinbrunn W, Pfisterer M, Detrano R. *Heart Disease.* UCI Machine Learning Repository, 1989.
