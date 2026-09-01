# abdullah1904/mental-health-score-predictor

## Resumen

El modelo `abdullah1904/mental-health-score-predictor` es un regresor tabular basado en un Random Forest Regressor de scikit-learn, desarrollado por el usuario abdullah1904. Su objetivo es predecir una puntuación continua de salud mental (en una escala de 0 a 10) a partir de 13 características que combinan datos demográficos, hábitos de uso de redes sociales, patrones de sueño, actividad física y niveles de estrés autoinformados. El modelo está diseñado para ayudar a identificar posibles problemas de salud mental de forma temprana, analizando cómo las personas interactúan con plataformas digitales y gestionan sus rutinas diarias.

Se trata de un modelo clásico de aprendizaje automático, no de un modelo de lenguaje o transformer. Su arquitectura es un ensemble de árboles de decisión, con un pipeline de preprocesamiento integrado que incluye estandarización, codificación de variables categóricas y transformaciones logarítmicas. El repositorio contiene un único archivo `model.pkl` con el pipeline ya ajustado, listo para usar con `joblib`. Aunque el modelo no tiene parámetros masivos ni contexto de ventana, su relevancia radica en su simplicidad, bajo coste computacional y aplicabilidad directa en entornos de producción con recursos limitados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Random Forest Regressor (ensemble de arboles de decision) |
| Parametros totales | no disponible (no se especifica el numero de arboles ni su profundidad) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo tabular, no procesa secuencias) |
| Tipos de cuantizacion | no aplica (modelo clasico, no requiere cuantizacion) |
| Idiomas soportados | no disponible (la model card esta en ingles, pero no se especifica soporte de idiomas para las entradas) |
| Licencia | MIT |
| Formato de pesos | pickle (archivo `model.pkl` con pipeline de scikit-learn) |

## Arquitectura y entrenamiento

El modelo es un Random Forest Regressor implementado con scikit-learn. El pipeline completo incluye un preprocesamiento que estandariza las variables numericas (StandardScaler), codifica las categoricas nominales con OneHotEncoder y las ordinales con OrdinalEncoder, y aplica una transformacion logaritmica a caracteristicas sesgadas como las horas de estudio. El conjunto de entrenamiento proviene de una encuesta sobre uso de redes sociales y habitos de vida, con participantes de entre 10 y 100 años de diversos paises. Los datos se dividieron en 70% para entrenamiento y 30% para prueba. No se aplicaron tecnicas de RLHF ni DPO; el entrenamiento es supervisado clasico con minimizacion de error cuadratico medio. No se documentan innovaciones tecnicas destacables mas alla del uso de un pipeline integrado que facilita la inferencia directa sobre datos crudos.

## Capacidades

- Regresion tabular: predice un valor continuo (0-10) que representa una puntuacion de salud mental, donde valores mas altos indican mejor bienestar.
- Procesamiento de 13 caracteristicas de entrada: edad, genero, nivel academico, plataforma mas usada, proposito de uso, horas diarias de uso, desbloqueos diarios, horas de estudio, horas de actividad fisica, horas de sueno, nivel de estres y pais agrupado.
- Inferencia directa sobre datos sin preprocesar: el pipeline incluido en `model.pkl` aplica automaticamente todas las transformaciones necesarias.
- No soporta generacion de texto, codigo, vision, tool calling, agentes ni razonamiento multi-paso.
- No tiene capacidades multilingues: las entradas son variables numericas y categoricas, no texto libre.

## Casos de uso

- Evaluacion de salud mental en entornos educativos: una universidad podria integrar el modelo en su plataforma de bienestar estudiantil para que los alumnos introduzcan sus habitos de uso de redes sociales, sueno y estres, y reciban una estimacion de su puntuacion de salud mental. El modelo es adecuado porque sus caracteristicas incluyen nivel academico y horas de estudio, y su bajo coste computacional permite ejecutarlo en servidores modestos.
- Herramienta de autoevaluacion en aplicaciones de bienestar digital: una app de salud podria ofrecer un cuestionario basado en las 13 variables y mostrar al usuario una puntuacion orientativa. La salida numerica (0-10) es facil de interpretar para el usuario final, y la licencia MIT permite su integracion en productos comerciales.
- Analisis de impacto del uso de redes sociales en el bienestar: investigadores o analistas de datos podrian utilizar el modelo para estudiar como varian las predicciones segun la plataforma, las horas de uso o el nivel de estres, ayudando a identificar patrones poblacionales. El modelo permite descomponer la influencia de cada caracteristica mediante la importancia de los arboles.
- Sistema de alerta temprana en plataformas de salud digital: un servicio de telemedicina podria usar el modelo como filtro previo para detectar usuarios con puntuaciones bajas y derivarlos a profesionales. Su rapida inferencia (milisegundos en CPU) lo hace apto para procesar grandes volumenes de solicitudes.
- Screening en programas de bienestar corporativo: una empresa podria implementar el modelo en su intranet para que los empleados respondan un breve formulario y obtengan una estimacion de su estado de salud mental, fomentando la concienciacion y la derivacion a recursos internos. Las variables de sueno, actividad fisica y estres son relevantes en el ambito laboral.
- Investigacion academica sobre factores predictores de salud mental: el modelo puede servir como base para comparar la capacidad predictiva de diferentes algoritmos o para explorar la importancia relativa de las variables. Al ser un Random Forest, ofrece metricas de importancia de caracteristicas que pueden publicarse en estudios.

## Benchmarks y rendimiento

El autor declara los siguientes resultados en la model card (no verificados de forma independiente):

| Metrica | Valor |
|---|---|
| R² (coeficiente de determinacion) | 0.8776 |
| MAE (error absoluto medio) | 0.3472 |
| RMSE (raiz del error cuadratico medio) | 0.4637 |

Ademas, la model card incluye una comparativa interna con otras variantes del mismo modelo:

| Modelo | R² | MAE | RMSE |
|---|---|---|---|
| Random Forest (estandar) | 0.8776 | 0.3472 | 0.4637 |
| Random Forest (Grid Tuned) | 0.8720 | 0.3582 | 0.4741 |
| Random Forest (Random Tuned) | 0.8650 | 0.3689 | 0.4869 |
| Linear Regression | 0.7398 | 0.5362 | 0.6760 |

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Al ser un modelo de scikit-learn con un unico archivo pickle, los requisitos son minimos: no requiere GPU, solo CPU.
- Memoria RAM estimada: menos de 100 MB para cargar el modelo y realizar inferencias.
- GPU recomendadas: ninguna; funciona en cualquier procesador moderno.
- Es adecuado para entornos con recursos limitados, como instancias cloud de bajo coste, Raspberry Pi o incluso dispositivos moviles si se exporta a un formato compatible.
- Opciones de despliegue: se puede servir mediante FastAPI o Flask (como se muestra en los repositorios similares encontrados), o integrarse directamente en aplicaciones Python con `joblib.load()`.
- Latencia: del orden de milisegundos por prediccion en CPU, aunque no se proporcionan mediciones exactas.
- No es compatible con vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables externos con el mismo proposito (prediccion de puntuacion de salud mental a partir de variables tabulares). La unica comparativa disponible es la interna que el propio autor incluye en la model card, donde el Random Forest estandar supera a las variantes con ajuste de hiperparametros y a la regresion lineal. Por tanto, no se puede establecer una comparativa con alternativas de la misma categoria fuera de este repositorio.

## Limitaciones y advertencias

- Sesgos de autoinforme: los datos provienen de encuestas donde los participantes declaran sus habitos y niveles de estres, lo que puede introducir sesgos de deseabilidad social o imprecision en las respuestas.
- Generalizacion limitada: el modelo fue entrenado con una muestra global, pero los paises se agruparon en los 10 mas frecuentes y el resto como "Other", lo que puede reducir la precision en regiones poco representadas.
- No es un diagnostico medico: la puntuacion predicha es una estimacion orientativa y no debe utilizarse como sustituto de una evaluacion profesional de salud mental.
- Riesgo de sobreajuste: el R² de entrenamiento (0.9808) es notablemente superior al de prueba (0.8776), lo que sugiere cierto sobreajuste, aunque la diferencia no es extrema.
- Sin soporte para texto libre: el modelo solo acepta las 13 variables predefinidas; no puede procesar descripciones narrativas ni datos no estructurados.
- Licencia MIT: permite uso comercial y modificacion, pero el autor no ofrece garantias sobre la precision o idoneidad del modelo para casos de uso especificos.
- Fecha de creacion futura: el modelo fue creado el 1 de septiembre de 2026, lo que podria indicar que es un proyecto reciente o experimental.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/abdullah1904/mental-health-score-predictor
- Repositorio similar en GitHub (proyecto full-stack con FastAPI y React): https://github.com/mn-ansari/mental-health-score-predictor
- Repositorio similar en GitHub (otro proyecto full-stack): https://github.com/abhina-y/Mental_Health_Score-Predictor
- Video de construccion y despliegue del modelo: https://www.youtube.com/watch?v=WHTbyKPrcPg
- Demo desplegada (MindScore): https://mindscore-cwgk.onrender.com/
- Demo desplegada (Mental Health Score Prediction): https://mental-health-score-prediction.vercel.app/
