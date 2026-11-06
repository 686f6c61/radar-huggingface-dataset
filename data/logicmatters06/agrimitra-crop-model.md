# logicmatters06/agrimitra-crop-model

## Resumen

AgriMitra Crop Recommendation es un clasificador tabular basado en `RandomForestClassifier` de scikit-learn, desarrollado por el usuario logicmatters06 dentro del proyecto AgriMitra. El modelo recibe siete variables agronomicas (nitrogeno, fosforo, potasio, temperatura, humedad, pH y precipitacion) y predice una de 51 etiquetas de cultivo. No es un modelo de lenguaje ni una red neuronal: es un ensamblado de arboles de decision entrenado sobre datos tabulares, empaquetado como artefacto joblib y publicado con licencia MIT.

Su relevancia es practica y acotada: resuelve el problema de recomendacion de cultivo a partir de analisis de suelo y clima, un caso de uso clasico en agricultura de precision. La model card declara una precision del 99,697 % sobre un holdout estratificado de 1.320 muestras, con un F1 macro de 0,99607. Estas cifras deben interpretarse con cautela, ya que proceden del propio autor, no estan verificadas de forma independiente y el conjunto de datos subyacente es pequeno (6.596 filas) y de origen parcialmente publico (Kaggle).

El proyecto expone el modelo a traves de un backend que solo muestra al usuario 22 de los 51 cultivos, aquellos para los que existe una guia completa de 15 secciones en la base de conocimiento de AgriMitra; el resto queda accesible mediante el campo `coverage` de la respuesta. El repositorio de Hugging Face ocupa 0,0 GB y no registra descargas ni likes en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RandomForestClassifier (scikit-learn), ensamblado de arboles de decision |
| Parametros totales | no disponible (no es un modelo neuronal; el numero de arboles y su profundidad no se declaran) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entrada tabular fija de 7 caracteristicas) |
| Tipos de cuantizacion | no aplica (artefacto joblib; no se distribuyen pesos en GGUF ni safetensors) |
| Idiomas soportados | no disponible (las etiquetas de cultivo estan en ingles) |
| Licencia | MIT (artefacto y codigo de entrenamiento) |
| Formato de pesos | joblib (`.pkl`), concretamente `crop_recommendation_model.pkl` |

## Arquitectura y entrenamiento

El modelo es un `RandomForestClassifier` de scikit-learn con 51 clases de salida. La entrada es un vector de siete caracteristicas numericas: `N`, `P`, `K`, `temperature`, `humidity`, `ph` y `rainfall`. No hay tokenizador, embeddings ni atencion; la inferencia consiste en recorrer los arboles del bosque y agregar las probabilidades por clase mediante `predict_proba`.

El entrenamiento se realizo sobre un dataset fusionado de 6.596 filas (`crop-ml/merged_crop_dataset.csv`), publicado como `logicmatters06/agrimitra-dataset`. Las primeras 22 clases (100 filas cada una) coinciden con el conocido dataset publico de recomendacion de cultivos de Kaggle; las 29 clases restantes son registros adicionales de cultivos indios recopilados para el proyecto. La evaluacion se hizo sobre un split estratificado 80/20 con `random_state=42`, lo que deja 1.320 muestras de test. El artefacto se entreno con scikit-learn 1.8 y la model card indica que se carga con scikit-learn 1.9.1, lo que provoca un `InconsistentVersionWarning` que el backend registra en lugar de ocultar. No se documenta ningun proceso de validacion cruzada, ajuste de hiperparametros ni calibracion de probabilidades.

## Capacidades

- Clasificacion tabular multiclase: predice una de 51 etiquetas de cultivo a partir de siete variables edafoclimaticas.
- Salida de probabilidades por clase mediante `predict_proba`, lo que permite ranking de recomendaciones y umbrales de confianza.
- Exposicion de un campo `coverage` en la respuesta del backend para distinguir los 22 cultivos con guia completa de los 29 restantes.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingues en el sentido de NLP; las etiquetas estan en ingles.
- No procesa texto, imagen, audio ni codigo.
- No genera recomendaciones de pesticidas ni dosis de fertilizantes (exclusion explicita del autor).

## Casos de uso

- Recomendacion de cultivo en aplicaciones agricolas: el modelo recibe los valores de un analisis de suelo y datos climaticos locales y devuelve un ranking de cultivos con probabilidad asociada, util para apps moviles de asesoramiento al agricultor.
- Sistemas de soporte a la decision agronomica: integrado en un backend que combina la prediccion con una base de conocimiento de guias de cultivo, como hace AgriMitra con sus 22 cultivos documentados.
- Filtrado previo en pipelines de analisis de suelo: al ser un modelo ligero en joblib, puede ejecutarse en el servidor de forma sincrona para descartar cultivos inviables antes de consultas mas costosas.
- Prototipado rapido y docencia: el artefacto se carga con `joblib.load` y unas pocas lineas de pandas, lo que lo hace adecuado para talleres de machine learning aplicado a agricultura.
- Investigacion comparativa de clasificadores tabulares: sirve como linea base de random forest frente a gradient boosting o redes tabulares en el mismo dataset de 51 clases.
- Herramientas de extension agraria en regiones con datos climaticos limitados: el modelo solo necesita siete variables, muchas de las cuales estan disponibles en estaciones meteorologicas publicas y laboratorios de suelo basicos.
- Experimentacion con datasets fusionados: el par modelo-dataset permite reproducir el split 80/20 y estudiar el efecto de las clases raras en la matriz de confusion.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente):

| Metrica | Valor |
|---|---:|
| Muestras de test (holdout 80/20, `random_state=42`) | 1.320 |
| Aciertos | 1.316 |
| Accuracy | 0,99697 |
| Precision macro | 0,99635 |
| Recall macro | 0,99608 |
| F1 macro | 0,99607 |
| F1 ponderado | 0,99696 |

Confusiones principales declaradas: `jute → rice` (2 casos), `blackgram → maize` (1) y `mothbeans → pigeonpeas` (1). No se han publicado comparaciones con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM: no aplica; el modelo es un artefacto joblib de random forest que se ejecuta en CPU.
- GPU recomendadas: ninguna; no se requiere aceleracion por GPU.
- Cabe en cualquier maquina consumer, incluida una Raspberry Pi o un contenedor con poca memoria, dado el tamano reducido del repositorio (0,0 GB) y del dataset de entrenamiento (6.596 filas).
- Opciones de despliegue: carga directa con `joblib.load` en Python, servido mediante FastAPI, Flask o cualquier framework HTTP; no es compatible con vLLM, llama.cpp, Ollama ni TGI porque no es un modelo de lenguaje.
- Latencia y throughput: no disponibles de forma oficial; por la naturaleza del modelo (prediccion sobre un vector de siete caracteristicas) se espera latencia de milisegundos en CPU, aunque no se aportan mediciones.
- Requisito de version: fijar scikit-learn a la version de `requirements.txt` para evitar el `InconsistentVersionWarning` y garantizar reproducibilidad.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables en la documentacion proporcionada. Como referencia cualitativa, el dataset de las 22 primeras clases deriva del publico "Crop Recommendation Dataset" de Kaggle, sobre el que existen multiples clasificadores (random forest, SVM, XGBoost) en la literatura y en repositorios, pero no se aportan resultados de esos modelos en la informacion disponible para establecer una comparacion numerica rigurosa.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| AgriMitra Crop Recommendation | no disponible (random forest) | no aplica (7 caracteristicas) | MIT | Hugging Face, 0 descargas |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El modelo se entrena con rangos agronomicos tabulares, no con analisis de suelo locales reales; la prediccion puede no reflejar condiciones de campo especificas.
- No tiene en cuenta la estacion, el metodo de riego, el precio de mercado ni la variedad del cultivo.
- Las clases raras tienen muy pocas muestras; la accuracy agregada esta dominada por las clases mayoritarias, por lo que las metricas por clase pueden ser mucho peores que el 0,99697 global.
- Riesgo de sobreajuste y de fuga de datos no descartado: el split es unico (80/20, `random_state=42`) y no se documenta validacion cruzada.
- Las metricas son autodeclaradas y no verificadas (`verified: false` en el model-index).
- Las recomendaciones son sugerencias, no un sustituto del asesoramiento de extension agraria local.
- El modelo no produce dosis de pesticidas ni fertilizantes de forma intencionada.
- Licencia MIT para el artefacto y el codigo, pero los PDFs fuente y el corpus derivado siguen sujetos a los derechos de sus autores originales; verificar las licencias del dataset antes de redistribuir el CSV de entrenamiento.
- El desajuste de version de scikit-learn (entrenado con 1.8, cargado con 1.9.1) puede alterar resultados si no se fija el entorno.
- Sin descargas ni likes registrados: no hay evidencia de uso en produccion ni de validacion por terceros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/logicmatters06/agrimitra-crop-model
- Dataset en Hugging Face: https://huggingface.co/datasets/logicmatters06/agrimitra-dataset
- Repositorio AgriMitra (referenciado en la model card como origen de `crop-ml/merged_crop_dataset.csv` y `crop-ml/trainingModel.ipynb`): no disponible como URL directa en la informacion proporcionada
- Dataset original de Kaggle "Crop Recommendation" (referenciado como fuente de las 22 primeras clases): no disponible como URL directa en la informacion proporcionada
- Paper, blog o demo adicionales: no disponibles en la informacion proporcionada
