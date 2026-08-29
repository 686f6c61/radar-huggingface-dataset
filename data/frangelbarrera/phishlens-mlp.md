# frangelbarrera/phishlens-mlp

## Resumen

PhishLens MLP es un clasificador binario compacto desarrollado por frangelbarrera para identificar URLs sospechosas de phishing a partir de señales léxicas y estructurales de la propia cadena de texto. Forma parte del proyecto de código abierto `phishing-detection-rnn-cnn`, del que constituye la rama orientada a despliegue (`main`), frente a la implementación académica original basada en una arquitectura CNN+LSTM con 55 características. El modelo se publica con licencia MIT y está pensado para análisis offline de URLs, sin navegar al destino, resolver DNS, inspeccionar contenido ni consultar servicios externos.

La arquitectura es un perceptrón multicapa (MLP) que recibe 49 características numéricas deterministas extraídas de la URL, las estandariza con un `StandardScaler` incluido y produce una probabilidad de riesgo. El modelo es extremadamente ligero, con tres capas densas (64, 32 y 1 neurona) y activaciones ReLU y sigmoide. Su relevancia actual radica en ofrecer una alternativa reproducible, educativa y de bajo coste computacional para la detección de phishing, complementaria a enfoques basados en grandes modelos de lenguaje o en análisis de contenido web.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MLP (perceptrón multicapa) con 3 capas densas: Dense(64, ReLU) → Dense(32, ReLU) → Dense(1, Sigmoid) |
| Parametros totales | no disponible (modelo pequeño, del orden de miles de parámetros) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (entrada tabular de 49 características, no texto secuencial) |
| Tipos de cuantizacion | no aplica (pesos en formato Keras nativo, sin cuantización publicada) |
| Idiomas soportados | inglés (las características y etiquetas están en inglés; el modelo procesa URLs, no lenguaje natural) |
| Licencia | MIT |
| Formato de pesos | `.keras` (modelo), `scaler.pkl` (escalador), `feature_names.json`, `metrics.json`, `training_metadata.json` |

## Arquitectura y entrenamiento

El modelo es un MLP supervisado para clasificación binaria. La entrada son 49 características numéricas que describen la forma de la URL y sus patrones de tokens: longitudes, recuentos de puntuación, proporciones de dígitos, estructura del hostname, profundidad de subdominios, patrones de dirección IP, punycode, puertos, acortadores de URL, extensiones de ruta, términos sospechosos e indicadores de dominio de nivel superior. Estas características se estandarizan con un `StandardScaler` ajustado sobre el conjunto de entrenamiento. Durante el entrenamiento se aplicaron dropout y regularización L2, aunque no se especifican los hiperparámetros exactos.

El conjunto de datos original incluía 55 características, pero cinco fueron eliminadas en la rama de despliegue por requerir listas de marcas curadas o contexto de red en vivo: `random_domain`, `domain_in_brand`, `brand_in_subdomain`, `brand_in_path` y `nb_external_redirection`. Esto garantiza consistencia entre entrenamiento e inferencia y evita peticiones de red. No se publican detalles sobre el volumen de datos, la composición del dataset ni el proceso de etiquetado. El entrenamiento se realizó con Keras y el pipeline completo está documentado en el repositorio GitHub del proyecto.

## Capacidades

- Clasificación binaria de URLs como phishing o legítima a partir de características léxicas y estructurales de la cadena de texto.
- Inferencia offline: no navega a la URL, no resuelve DNS, no inspecciona contenido, no sigue redirecciones ni valida certificados.
- Salida probabilística (sigmoide) con umbral de decisión ajustado (0.499) y métricas de calibración (Brier score).
- Reproducibilidad: incluye artefactos completos (escalador, nombres de características, métricas, metadatos de entrenamiento y checksums).
- Integración sencilla en pipelines de análisis como componente de señal de riesgo, no como veredicto de seguridad autónomo.
- Demostración interactiva en un Space de Hugging Face con implementación en JavaScript del extractor de características.

## Casos de uso

- Educación en ciberseguridad defensiva: el modelo sirve para ilustrar cómo se construye un clasificador de phishing basado en ingeniería de características, sin necesidad de infraestructura compleja.
- Investigación académica reproducible: al publicar el pipeline completo y los artefactos, permite comparar resultados con la implementación original CNN+LSTM y con otros enfoques.
- Demostración de ingeniería de características: las 49 características son interpretables y pueden analizarse para entender qué señales de la URL correlacionan con phishing.
- Componente en un pipeline de análisis de seguridad: puede combinarse con otros indicadores (listas negras, análisis de contenido, reputación de dominio) para generar una puntuación de riesgo agregada.
- Prototipado rápido de herramientas de análisis de URLs: al ser un modelo pequeño y sin dependencias externas, puede integrarse en scripts, extensiones de navegador o servicios backend ligeros.
- Comparación de metodologías: permite contrastar un MLP clásico con modelos basados en transformers o redes recurrentes para la misma tarea, evaluando trade-offs de rendimiento y coste.

## Benchmarks y rendimiento

Las métricas reportadas se calcularon sobre un split de test del 20% con estratificación y `random_state=42`. El umbral de decisión se ajustó según el procedimiento de evaluación del proyecto fuente.

| Metrica | Valor |
|---|---|
| Accuracy | 89.94% |
| ROC-AUC | 0.965 |
| Average precision | 0.965 |
| F1 score | 0.900 |
| Brier score | 0.072 |
| Decision threshold | 0.499 |

La matriz de confusión está disponible en `metrics.json`. No se han publicado comparaciones con otros modelos de detección de phishing en la información disponible.

## Requisitos de hardware

- Inferencia en CPU: el modelo es un MLP de tres capas con 49 entradas, por lo que puede ejecutarse en cualquier máquina, incluso en un Raspberry Pi o en un navegador (el Space de Hugging Face lo demuestra con JavaScript).
- VRAM: no requiere GPU. El uso de memoria es mínimo (menos de 1 MB para pesos y escalador).
- GPU recomendada: ninguna. Si se desea acelerar el entrenamiento o la inferencia masiva, cualquier GPU moderna sirve, pero no es necesaria.
- Opciones de despliegue: Keras/TensorFlow para Python, exportación a TensorFlow Lite o JavaScript para entornos web, o integración en servicios FastAPI.
- Latencia: del orden de microsegundos por predicción en CPU, al ser una única pasada forward de un MLP pequeño.

## Comparativa con modelos similares

No se dispone de información comparativa con otros modelos de detección de phishing en la documentación proporcionada. El propio proyecto incluye una implementación alternativa CNN+LSTM con 55 características en la rama `thesis-original`, que podría servir como referencia interna, pero no se publican métricas comparativas de esa versión. Otros enfoques de la literatura (por ejemplo, basados en transformers como DeBERTa o ELECTRA) no se han evaluado en este contexto.

## Limitaciones y advertencias

- El modelo solo analiza la cadena de la URL; no detecta phishing alojado en dominios legítimos si la URL no contiene señales informativas.
- No evalúa contenido en vivo, infraestructura, certificados ni redirecciones, por lo que su salida es una señal de riesgo, no un veredicto de seguridad.
- Riesgo de falsos positivos y negativos: el coste asimétrico del phishing implica que cualquier despliegue debe medir ambos errores sobre datos representativos y actuales.
- Sesgo potencial del dataset: no se detalla la composición ni el origen de los datos de entrenamiento, por lo que puede existir sesgo temporal o de dominio.
- No debe utilizarse como sistema autónomo de bloqueo, takedown, fraude, identidad, empleo, crédito o aplicación de la ley.
- No se recomienda abrir URLs sospechosas para verificar una predicción.
- La licencia MIT permite uso comercial, pero el autor advierte que los resultados no deben interpretarse como rendimiento en producción sin validación adicional.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/frangelbarrera/phishlens-mlp
- Space de demostración: https://huggingface.co/spaces/frangelbarrera/phishlens
- Repositorio GitHub del proyecto: https://github.com/frangelbarrera/phishing-detection-rnn-cnn
- Rama original de tesis (CNN+LSTM): https://github.com/frangelbarrera/phishing-detection-rnn-cnn/tree/thesis-original
