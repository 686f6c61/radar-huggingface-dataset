# sahil03kundu/ayurvaidya-xgboost

## Resumen

AyurVaidya-XGBoost es un clasificador tabular basado en XGBoost que recomienda, entre diez tradiciones medicas distintas, cual resulta mas adecuada para un paciente a partir de su perfil clinico. Lo desarrolla Sahil Kundu (Techno India University, Kolkata) y se publica en HuggingFace bajo licencia MIT. No es un modelo de lenguaje: es un conjunto de arboles de decision con boosting de gradiente que resuelve un problema de clasificacion multiclase (10 clases) sobre un vector de 66 caracteristicas derivadas.

El modelo predice una de estas diez clases: Allopathic, Ayurveda, TCM (medicina tradicional china), Siddha, Unani, Kampo, Korean TM, African TM, Naturopathic e Integrative. La entrada combina variables clinicas convencionales (edad, IMC, duracion de la enfermedad, numero de comorbilidades, horas de sueno, severidad codificada) con caracteristicas especificas del dominio, como el tipo constitucional ayurvedico (Prakriti), puntuaciones de compatibilidad entre sistemas medicos, caracteristicas de mapeo cruzado entre paradigmas y caracteristicas derivadas de un grafo de conocimiento.

Su relevancia actual es fundamentalmente metodologica: propone un marco de comparacion entre medicina tradicional y moderna mediante aprendizaje automatico, con un articulo enviado a *Artificial Intelligence in Medicine* (Elsevier). Conviene subir el nivel de cautela: se entrena exclusivamente con 100.000 registros de pacientes **sinteticos**, el repositorio no tiene descargas ni validacion externa y la propia model card desaconseja su uso clinico directo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | XGBoost (gradient-boosted decision trees); clasificacion multiclase de 10 clases |
| Parametros totales | No disponible como recuento de parametros; configuracion: 200 arboles, profundidad maxima 6, learning rate 0,1 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (modelo tabular; entrada de 66 caracteristicas de longitud fija) |
| Tipos de cuantizacion | No aplica (modelo de arboles; requiere cuantizacion de punto flotante estandar de CPU/GPU) |
| Idiomas soportados | en (etiquetas de clase y documentacion en ingles) |
| Licencia | MIT |
| Formato de pesos | JSON de XGBoost (`ayurvaidya_xgboost.json`), cargable con `xgb.XGBClassifier().load_model()` |
| Tarea (pipeline) | tabular-classification |
| Numero de clases | 10 |
| Numero de caracteristicas de entrada | 66 |
| Libreria | xgboost |
| Dataset de entrenamiento | sahil03kundu/ayurvaidya-medical-treatment-dataset (100.000 registros sinteticos) |
| Fecha de publicacion | 2026-09-19 |
| Descargas / likes en HuggingFace | 0 / 0 |

## Arquitectura y entrenamiento

El modelo es un `XGBClassifier` de XGBoost, es decir, un ensamblado de arboles de decision entrenados secuencialmente con boosting de gradiente. La configuracion declarada es `n_estimators=200`, `max_depth=6` y `learning_rate=0.1`, con particion entrenamiento/prueba 80/20 y `random_state=42`. La metrica de evaluacion durante el entrenamiento es `mlogloss` (log-loss multiclase), lo que implica una salida de probabilidades por clase sobre las diez tradiciones medicas. No se emplea RLHF, DPO ni ninguna tecnica de alineacion, ya que no es un modelo generativo.

El punto diferencial esta en la ingenieria de caracteristicas: las 66 variables de entrada se agrupan en ocho familias, entre ellas lecturas de sensores (`sensor_*`), factores regionales y demograficos (`regional_f*`), puntuaciones de compatibilidad con cada sistema medico (`system_f*`), caracteristicas de mapeo entre paradigmas (`crossmap_f*`), patrones temporales (`temporal_f*`), terminos de interaccion cuadruple (`quad_f*`), caracteristicas derivadas de ontologia o grafo de conocimiento (`kg_f*`) y variables clinicas basicas (edad, IMC, `duration_months`, `comorbidity_count`, `sleep_hours`, `severity_enc`). El preprocesado incluye la codificacion ordinal de la severidad (leve=0, moderado=1, grave=2) y el relleno con 0 de las comorbilidades ausentes. El entrenamiento se realizo sobre 100.000 registros sinteticos que cubren 52 enfermedades en 14 categorias clinicas.

## Capacidades

- Clasificacion tabular multiclase: asigna una de diez tradiciones medicas a un perfil de paciente.
- Salida de probabilidades por clase (compatible con `predict_proba`), lo que permite umbrales y rankings de alternativas.
- Manejo de variables heterogeneas: numericas continuas, ordinales codificadas y factores categoricos ya transformados.
- Incorporacion de senales no clinicas: factores regionales, compatibilidad entre sistemas y contexto temporal.
- Codificacion del tipo constitucional ayurvedico (Prakriti) como variable de entrada.
- Inferencia en CPU sin dependencia de GPU, con un grafo de arboles de tamano reducido.
- No soporta generacion de texto, razonamiento en lenguaje natural, codigo, matematicas ni vision.
- No soporta tool calling, function calling ni flujos de agente o razonamiento multi-paso.
- No es multilingue: las etiquetas y la documentacion estan en ingles.
- No dispone de modo de razonamiento explicito (thinking mode) ni de capacidades de audio.

## Casos de uso

- Investigacion comparativa sobre medicina integrativa: el modelo permite estudiar que variables (regionales, de compatibilidad entre sistemas, temporales) pesan mas en la recomendacion de una tradicion medica frente a otra, como base para hipotesis en salud global.
- Linea base en proyectos de clasificacion tabular sanitaria: con 88,47 % de accuracy sobre 10 clases y 66 caracteristicas, sirve como referencia contra la que comparar modelos mas complejos (redes neuronales tabulares, LightGBM, CatBoost) en el mismo dataset.
- Prototipado de sistemas de apoyo a la decision clinica: puede integrarse como modulo de sugerencia previa en un panel de triaje, siempre con revision obligatoria por parte de un profesional y tras validacion con datos reales.
- Estudio de sesgo y equidad: las familias de caracteristicas `regional_f*` permiten analizar si el modelo recomienda tratamientos distintos segun la region del paciente, util para auditorias de equidad antes de cualquier despliegue.
- Docencia y simulacion: en asignaturas de informatica medica o salud publica, permite generar escenarios sinteticos y observar como cambia la recomendacion al modificar edad, IMC, severidad o comorbilidades.
- Analisis de ingenieria de caracteristicas: la separacion explicita en ocho grupos facilita experimentos de ablacion para medir la aportacion marginal de las caracteristicas de grafo de conocimiento o de los terminos de interaccion cuadruple.
- Investigacion sobre Prakriti y medicina personalizada: el modelo usa el tipo constitucional ayurvedico como entrada, lo que habilita estudios sobre su peso relativo frente a variables clinicas convencionales (siempre con datos sinteticos y sin valor clinico).
- Preclasificacion en encuestas o formularios de salud digital: para catalogar perfiles agregados y anonimizados en estudios poblacionales, nunca para decisiones individuales de tratamiento.

## Benchmarks y rendimiento

Resultados declarados por el autor en el model-index de la model card. La metrica de accuracy figura como no verificada (`verified: false`).

| Metrica | Valor |
|---|---|
| Accuracy | 0,8847 (88,47 %) |
| F1 ponderado | 0,88 |
| Precision ponderada | 0,89 |
| Recall ponderado | 0,88 |

Desglose por clase declarado en la model card:

| Sistema de tratamiento | Precision | Recall | F1 |
|---|---|---|---|
| African TM | 0,87 | 0,86 | 0,87 |
| Allopathic | 0,90 | 0,91 | 0,90 |
| Ayurveda | 0,89 | 0,90 | 0,89 |
| Integrative | 0,88 | 0,87 | 0,88 |
| Kampo | 0,88 | 0,88 | 0,88 |
| Korean TM | 0,89 | 0,89 | 0,89 |
| Naturopathic | 0,87 | 0,87 | 0,87 |
| Siddha | 0,89 | 0,88 | 0,89 |
| TCM | 0,89 | 0,89 | 0,89 |
| Unani | 0,88 | 0,88 | 0,88 |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la informacion disponible; esos benchmarks no son aplicables a un modelo tabular.

## Requisitos de hardware

- VRAM para inferencia: no aplica; el modelo esta pensado para ejecutarse en CPU. No se requiere GPU.
- Memoria RAM: no se especifica el tamano del fichero JSON; un ensamblado de 200 arboles de profundidad 6 ocupa un espacio reducido y puede cargarse en cualquier equipo de sobremesa o portatil actual. Tamano exacto: no disponible.
- GPU recomendadas: ninguna en particular. Es posible acelerar XGBoost con CUDA (`device="cuda"`) sobre RTX 4090, A100 o H100, pero no aporta ventaja relevante a esta escala.
- Compatibilidad con GPU de consumo: si, irrelevante en la practica; cabe en cualquier CPU moderna, incluidos entornos sin GPU.
- Opciones de despliegue: API nativa de XGBoost en Python, exportacion a ONNX o Treelite para inferencia optimizada, integracion en servicios FastAPI o Flask, y ejecucion dentro de notebooks. No aplica vLLM, llama.cpp, Ollama ni TGI, que estan orientados a modelos generativos.
- Latencia y throughput: no disponibles (no publicados). Como estimacion no verificada, un ensamblado de 200 arboles de profundidad 6 sobre 66 caracteristicas se evalua tipicamente en microsegundos a pocos milisegundos por muestra en CPU, con paralelizacion por lotes.
- Requisitos de software: `xgboost`, `pandas`, `numpy` y `huggingface_hub` para la descarga del fichero de pesos.

## Comparativa con modelos similares

No se identifican en la informacion disponible modelos directamente comparables publicados con el mismo objetivo (recomendacion entre diez tradiciones medicas). Como referencia generica de la misma categoria tecnica (clasificacion tabular multiclase) se incluyen alternativas habituales, pero sin datos de rendimiento verificables en este dataset.

| Modelo | Tipo | Parametros | Contexto | Rendimiento en este dataset | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| AyurVaidya-XGBoost | XGBoost, 10 clases | 200 arboles, profundidad 6 | No aplica (66 caracteristicas) | Accuracy 0,8847 (declarado, no verificado) | MIT | HuggingFace, JSON |
| LightGBM (equivalente) | Gradient boosting | No disponible | No aplica | No disponible | MIT | Publica |
| CatBoost (equivalente) | Gradient boosting con categoricas | No disponible | No aplica | No disponible | Apache 2.0 | Publica |
| Random Forest | Bagging de arboles | No disponible | No aplica | No disponible | BSD | scikit-learn |
| Regresion logistica multinomial | Modelo lineal | No disponible | No aplica | No disponible | BSD | scikit-learn |

## Limitaciones y advertencias

- Datos sinteticos: los 100.000 registros de entrenamiento son generados artificialmente, no provienen de pacientes reales. Cualquier conclusion clinica exige validacion previa con datos reales.
- No apto para uso clinico: la propia model card lo describe como herramienta de investigacion y desaconseja su empleo en decisiones medicas sin validacion clinica y aprobacion regulatoria.
- Metricas no verificadas: el unico resultado del model-index (accuracy 0,8847) esta marcado como `verified: false`; no hay evaluacion independiente.
- Riesgo de alucinacion: no aplica en el sentido generativo, pero si existe riesgo de asignacion erronea de clase y de extrapolacion indebida fuera de la distribucion de entrenamiento.
- Cobertura limitada de enfermedades: solo 52 enfermedades en 14 categorias clinicas, muy lejos del espectro completo de la patologia humana.
- Sesgo regional y cultural: la eficacia de un tratamiento depende de factores que el modelo solo captura parcialmente, como la disponibilidad local, la experiencia del profesional y las preferencias del paciente.
- Idioma: unico idioma declarado, el ingles; no hay soporte para etiquetas ni documentacion en castellano.
- Dependencia del orden de las caracteristicas: la entrada debe coincidir exactamente con el vector de 66 caracteristicas y con el orden de `LabelEncoder` de las clases; un desajuste produce predicciones silenciosamente incorrectas.
- Sin senal de adopcion: cero descargas y cero likes en el momento de la consulta, lo que implica ausencia de validacion por parte de la comunidad.
- Fecha de publicacion inusual: el repositorio figura como creado en septiembre de 2026, dato que conviene contrastar antes de citarlo.
- Licencia permisiva: MIT permite uso comercial y modificacion, pero la licencia no cubre la responsabilidad clinica ni regulatoria derivada del uso.
- Articulo pendiente de revision: el paper esta enviado a *Artificial Intelligence in Medicine* (Elsevier) y no consta como aceptado o publicado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/sahil03kundu/ayurvaidya-xgboost
- Dataset en HuggingFace: https://huggingface.co/datasets/sahil03kundu/ayurvaidya-medical-treatment-dataset
- Dataset en Kaggle: https://www.kaggle.com/datasets/sahil03kundu/ayurvaidya-medical-treatment-dataset
- Repositorio GitHub: https://github.com/sahil03kundu-code/AyurVaidya
- Perfil del autor en GitHub: https://github.com/sahil03kundu-code
- Contacto del autor: sahil03kundu@gmail.com
- Cita: Kundu, Sahil (2026), "AyurVaidya: Multi-System Medical Treatment Recommendation using Machine Learning", enviado a *Artificial Intelligence in Medicine* (Elsevier).
- Los resultados de la busqueda web realizada no contienen enlaces relevantes al modelo (devuelven paginas de streaming de television en aleman), por lo que se omiten.
