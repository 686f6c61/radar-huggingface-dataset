# adhithyasharma/carbonlab-co2-ensemble

## Resumen

CarbonLab CO2-ensemble es un modelo de regresion tabular publicado en Hugging Face por el usuario adhithyasharma. No es una red neuronal ni un modelo de lenguaje: es un ensemble de seis modelos de arboles (Random Forest, Extra Trees, Gradient Boosting, XGBoost, LightGBM y CatBoost) combinados mediante ponderacion entropy-TOPSIS. Su unica tarea es predecir la captura de CO2 (en mmol/g) de carbones porosos derivados de biomasa a partir de su estructura porosa, composicion elemental y condiciones de ensayo.

El modelo aplica el enfoque de ensemble descrito por Fan et al. (2026) sobre el conjunto de datos de Yuan et al. (2021), que tras eliminar un duplicado queda en 526 filas unicas. La entrada son 10 variables: area superficial, volumen total de poros, volumen de microporos, contenido de C, H, N, O y S (en porcentaje), temperatura (grados Celsius) y presion (bar). La salida es un valor continuo de adsorcion.

Su interes practico esta en el ambito de la ciencia de materiales y la captura de carbono: ofrece un pipeline reproducible con intervalos de prediccion conformales, algo que el articulo base no incluye. El repositorio es de tamano practicamente nulo (0,0 GB) y no registra descargas ni likes en el momento de la consulta. La licencia no esta declarada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Ensemble de arboles: Random Forest, Extra Trees, Gradient Boosting, XGBoost, LightGBM y CatBoost, ponderados por entropy-TOPSIS |
| Parametros totales | no disponible (no aplica; modelos de arboles tabulares) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; entrada tabular de 10 caracteristicas) |
| Tipos de cuantizacion | no disponible (no aplica) |
| Idiomas soportados | no disponible (no procesa texto) |
| Licencia | no disponible |
| Formato de pesos | joblib (bundle con los seis pipelines ajustados, pesos del ensemble y nombres de caracteristicas); JSON auxiliares para intervalos conformales y metadatos de caracteristicas |

## Arquitectura y entrenamiento

El modelo es un ensemble homogeneo de seis algoritmos de boosting y bagging sobre datos tabulares. Cada uno de los seis pipelines incluye un imputador de mediana seguido del modelo correspondiente. Las predicciones finales se combinan con pesos calculados mediante entropy-TOPSIS, una tecnica de decision multicriterio que asigna pesos a cada modelo segun su desempeno relativo. El bundle guarda los seis pipelines ajustados, los pesos y los nombres de las caracteristicas.

El entrenamiento se realizo sobre el conjunto de Yuan et al. (2021), con 526 filas unicas tras eliminar un duplicado. El conjunto se dividio en 420 filas de desarrollo y 106 filas de test reservadas. Los intervalos de prediccion se obtuvieron mediante conformal prediction de tipo split, calibrados sobre los residuos out-of-fold de una validacion cruzada de 5 particiones en las 420 filas de desarrollo y verificados sobre las 106 filas de test. Las dos variables de volumen de poros admiten valores en blanco, en cuyo caso se imputa la mediana del entrenamiento. No se documenta el uso de tecnicas de regularizacion adicionales ni de ajuste fino posterior.

## Capacidades

- Regresion tabular supervisada: predice la captura de CO2 (mmol/g) a partir de 10 variables fisicoquimicas y de condiciones de ensayo.
- Imputacion interna: acepta valores ausentes en volumen total de poros y volumen de microporos, sustituyendolos por la mediana del conjunto de entrenamiento.
- Cuantificacion de incertidumbre: genera intervalos de prediccion conformales a niveles del 80 %, 90 % y 95 %, con anchura fija por nivel (no adaptativa a la entrada).
- Interpretabilidad: la model card declara el uso de SHAP como parte del enfoque, si bien no se detalla en los archivos descritos que se incluya un explicador empaquetado.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni procesamiento de texto, vision o audio.
- No tiene capacidades multilingues: no procesa lenguaje natural.

## Casos de uso

- Cribado virtual de adsorbentes: dado un lote de candidatos con area superficial, porosidad y composicion elemental, el modelo estima la captura de CO2 esperada y permite priorizar cuales sintetizar y caracterizar experimentalmente, reduciendo el numero de ensayos necesarios.
- Diseno de experimentos en laboratorio: el modelo sirve para explorar el efecto de la temperatura (dentro de 0-30 grados Celsius) y la presion (0,1-1,01 bar) sobre la captura, ayudando a fijar condiciones de ensayo antes de ejecutar campanas experimentales.
- Estimacion con incertidumbre para toma de decisiones: los intervalos conformales al 90 % (semianchura de 1,092 mmol/g) permiten descartar candidatos cuya prediccion puntual es buena pero cuya incertidumbre es excesiva, algo util cuando el coste de un falso positivo experimental es alto.
- Analisis de sensibilidad de variables: con los seis modelos y los metadatos de rangos de entrenamiento (feature_info.json) se puede estudiar que variables (area superficial, microporosidad, heteroatomos) dominan la prediccion en un regimen concreto.
- Docencia y reproducibilidad metodologica: el bundle y los scripts permiten reproducir un flujo completo de ensemble con ponderacion entropy-TOPSIS e intervalos conformales sobre un conjunto de datos publico pequeno, util como caso de estudio en cursos de machine learning aplicado a materiales.
- Integracion en aplicaciones web de calculo: el autor mantiene una aplicacion en vivo y el codigo en GitHub, de modo que el modelo puede desplegarse como servicio de prediccion para investigadores que no quieran ejecutar Python localmente.
- Filtro previo en pipelines de descubrimiento de materiales: combinado con bases de datos de estructuras porosas, el modelo puede actuar como primera etapa de descarte antes de simulaciones moleculares mas costosas.

## Benchmarks y rendimiento

Resultados sobre las 106 filas de test reservadas, segun la model card:

| Modelo | RMSE (mmol/g) | MAE (mmol/g) | R2 |
|---|---|---|---|
| Ensemble (entropy-TOPSIS) | 0,644 | 0,477 | 0,848 |
| CatBoost solo | 0,605 | 0,446 | 0,866 |
| Baseline Ridge | 0,974 | 0,745 | 0,652 |

Cobertura empirica de los intervalos conformales sobre el test:

| Nivel objetivo | Semianchura del intervalo (mmol/g) | Cobertura real en test |
|---|---|---|
| 80 % | 0,724 | 78,3 % |
| 90 % | 1,092 | 92,5 % |
| 95 % | 1,437 | 96,2 % |

El propio autor senala que CatBoost por si solo supera ligeramente al ensemble ponderado en este conjunto de test, y que mantiene el ensemble por fidelidad al metodo del articulo base.

## Requisitos de hardware

- Inferencia en CPU: los seis modelos de arboles con 526 muestras de entrenamiento son ligeros; la inferencia cabe holgadamente en cualquier CPU moderna y no requiere GPU.
- VRAM: no aplica; no hay requisitos de GPU documentados.
- GPU recomendadas: no aplica. El cuello de botella es el tiempo de carga del bundle joblib, no el calculo.
- Despliegue: carga directa con joblib en Python. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo. El autor mantiene una aplicacion web en vivo enlazada desde el repositorio.
- Dependencias exactas declaradas: scikit-learn 1.7.2, xgboost 3.4.1, lightgbm 4.7.0, catboost 1.2.10, pandas 2.3.3 y numpy 2.3.5. Las versiones deben coincidir para evitar incompatibilidades al deserializar el pickle.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | Datos de entrenamiento | R2 en test | Intervalos de prediccion | Licencia |
|---|---|---|---|---|---|
| CarbonLab CO2-ensemble | Ensemble de 6 arboles con pesos entropy-TOPSIS | 526 filas (Yuan et al., 2021) | 0,848 | Si, conformales (80/90/95 %) | no disponible |
| CatBoost solo (incluido en el bundle) | Gradient boosting | 526 filas | 0,866 | No documentados | no disponible |
| Baseline Ridge (referencia interna) | Regresion lineal regularizada | 526 filas | 0,652 | No documentados | no disponible |
| Fan et al. (2026) | Enfoque de ensemble descrito en el articulo base | no disponible | no disponible | No documentados | no disponible |

No se dispone de informacion sobre otros modelos publicos comparables de prediccion de adsorcion de CO2 en carbones porosos de biomasa. La comparativa se limita a los modelos internos del propio estudio.

## Limitaciones y advertencias

- Volumen de datos muy reducido: solo 526 muestras, lo que limita la generalizacion y hace que el modelo sea sensible a la composicion del conjunto de entrenamiento.
- Rango de aplicabilidad estrecho: temperaturas de 0 a 30 grados Celsius y presiones de 0,1 a 1,01 bar. Fuera de estos rangos las predicciones no son fiables, segun advierte el propio autor.
- Intervalos de prediccion de anchura fija: la semianchura conformal es identica para toda entrada, de modo que no refleja la incertidumbre real de cada prediccion individual. En regimenes alejados de los datos de entrenamiento la cobertura puede degradarse.
- El ensemble no supera a CatBoost aislado en el test (R2 de 0,848 frente a 0,866); su justificacion es metodologica, no de rendimiento.
- Riesgo de sobreajuste al conjunto de Yuan et al. (2021): no se documenta validacion externa con datos de otros laboratorios o sintesis.
- Licencia no declarada: no hay autorizacion explicita para uso comercial ni condiciones de redistribucion. Conviene contactar con el autor antes de integrarlo en productos.
- Riesgo de seguridad al cargar el bundle: es un archivo pickle (joblib) y solo debe cargarse desde fuentes de confianza, tal como advierte la propia model card.
- Dependencias con versiones fijas: cargar el bundle con versiones distintas de scikit-learn, xgboost, lightgbm o catboost puede fallar o producir resultados inconsistentes.
- Sesgos: no documentados. Al tratarse de un conjunto de datos de laboratorio pequeno, puede estar sesgado hacia las familias de materiales y las condiciones de sintesis representadas en Yuan et al. (2021).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/adhithyasharma/carbonlab-co2-ensemble
- Codigo y aplicacion en vivo: https://github.com/madhithyasharma-del/co2-adsorption-ml
- Articulo base del metodo: Fan et al. (2026), referencia citada en la model card (sin enlace disponible)
- Conjunto de datos de origen: Yuan et al. (2021), referencia citada en la model card (sin enlace disponible)
