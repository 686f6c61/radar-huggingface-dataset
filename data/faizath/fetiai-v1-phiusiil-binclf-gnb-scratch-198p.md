# faizath/fetiai-v1-phiusiil-binclf-gnb-scratch-198p

## Resumen

`fetiai-v1-phiusiil-binclf-gnb-scratch-198p` es un clasificador tabular de detección de phishing en URLs, desarrollado por el grupo 16 del curso IF3070 (Fundamentos de Inteligencia Artificial) de STEI ITB como proyecto académico. Implementa un modelo de Gaussian Naive Bayes entrenado desde cero (sin librerías de ML) sobre el dataset PhiUSIIL, y se sirve como una API HTTP de un solo modelo. El nombre indica sus 198 parámetros, un tamaño excepcionalmente pequeño que refleja su naturaleza probabilística clásica, no neuronal.

El modelo recibe un vector de 49 características preextraídas de una URL (longitud, presencia de HTTPS, etc.) y devuelve un veredicto binario (legítima o phishing) junto con una puntuación de probabilidad. No procesa el texto de la URL directamente, sino que opera sobre características numéricas. Su relevancia radica en ser un ejemplo didáctico de implementación de un clasificador generativo desde cero, con un pipeline reproducible y empaquetado en Docker, aunque el propio autor advierte que no debe usarse como producto de seguridad en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gaussian Naive Bayes (implementado desde cero) |
| Parametros totales | 198 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entrada tabular de 49 caracteristicas) |
| Tipos de cuantizacion | no aplica (modelo clasico, no requiere cuantizacion) |
| Idiomas soportados | no disponible (no procesa texto) |
| Licencia | MIT |
| Formato de pesos | JSON (tabla de medias y desviaciones por clase) |

## Arquitectura y entrenamiento

El modelo es un clasificador probabilistico basado en el teorema de Bayes con la suposicion de independencia condicional entre caracteristicas. Concretamente, usa una variante gaussiana (Gaussian Naive Bayes) que modela cada caracteristica numerica como una distribucion normal por clase. Los 198 parametros corresponden a las medias y desviaciones estandar de las 49 caracteristicas para cada una de las dos clases (legitima y phishing), mas las probabilidades a priori. No es un transformer ni una red neuronal, sino un modelo estadistico clasico.

El entrenamiento se realizo sobre el dataset PhiUSIIL (Phishing URL Dataset, disponible en UCI), que contiene mas de 130.000 muestras de URLs con 49 caracteristicas preextraidas. El pipeline incluyo tecnicas de balanceo de clases mediante SMOTE y un proceso de ingenieria de caracteristicas. El modelo se implemento desde cero con NumPy y pandas, sin usar scikit-learn ni otras librerias de ML, como ejercicio academico. No se aplicaron tecnicas de RLHF ni DPO, al no ser un modelo de lenguaje.

## Capacidades

- Clasificacion binaria de URLs: distingue entre legitima y phishing a partir de un vector de 49 caracteristicas numericas.
- Entrada tabular: acepta un JSON con las 49 columnas, permitiendo valores nulos que se imputan automaticamente (el modelo reporta cuantas caracteristicas se imputaron y la cobertura real).
- API HTTP: expone rutas para prediccion individual (`/predict`), prediccion por lotes (`/predict/batch` hasta 1000 filas), metadatos (`/metadata`) y health checks (`/healthz`, `/readyz`).
- Autoverificacion: incluye una prueba de autotest con una fila dorada para garantizar que el artefacto reproduce su prediccion registrada.
- No soporta tool calling, agentes, razonamiento multi-paso, generacion de texto, vision ni audio. Es exclusivamente un clasificador tabular.

## Casos de uso

- Filtrado de URLs en entornos educativos: el modelo puede integrarse en practicas de laboratorio de seguridad informatica para demostrar como un clasificador probabilistico detecta phishing, sin necesidad de GPU ni infraestructura compleja.
- Prototipado rapido de sistemas de alerta: dado su tamano minimo y su empaquetado en Docker, puede desplegarse en un minuto para evaluar si un pipeline de extraccion de caracteristicas produce resultados razonables antes de migrar a modelos mas grandes.
- Ensenanza de Naive Bayes: sirve como ejemplo funcional de implementacion desde cero, con codigo fuente disponible, para que estudiantes comparen con versiones de scikit-learn.
- Integracion en herramientas de analisis de URLs de bajo coste: en entornos con recursos muy limitados (Raspberry Pi, contenedores con 128 MB de RAM), puede ejecutarse como un microservicio de clasificacion basica.
- Validacion de datasets de phishing: al ser un modelo independiente, puede usarse como baseline para comparar la calidad de nuevas caracteristicas o datasets antes de entrenar modelos mas complejos.
- Demostracion de MLOps: el repositorio incluye Docker, tests de autoverificacion y una API documentada, lo que lo convierte en un caso de estudio para practicas de despliegue de modelos clasicos.

## Benchmarks y rendimiento

El autor declara los siguientes resultados en el model-index de HuggingFace, evaluados sobre el dataset PhiUSIIL:

| Metrica | Valor |
|---|---|
| Accuracy | 0.9779 |
| Precision (clase phishing) | 0.9113 |
| Recall (clase phishing) | 0.7881 |

No se han publicado comparaciones con otros modelos en la informacion disponible. Los resultados son declarados por el autor y no verificados de forma independiente.

## Requisitos de hardware

- No requiere GPU ni VRAM: al ser un modelo de 198 parametros, la inferencia se ejecuta en CPU con un consumo minimo de memoria (el artefacto pesa 672 KB).
- Cualquier CPU moderna es suficiente; no hay requisitos minimos documentados.
- Se puede desplegar con Docker (imagen que incluye el modelo horneado) o directamente con Python y dependencias fijadas (NumPy, pandas, FastAPI).
- La latencia es del orden de microsegundos por prediccion, aunque no se han publicado mediciones oficiales.
- No es compatible con vLLM, llama.cpp ni Ollama, ya que no es un modelo de lenguaje.

## Comparativa con modelos similares

| Modelo | Parametros | Arquitectura | Accuracy | Licencia |
|---|---|---|---|---|
| fetiai-v1-phiusiil-binclf-gnb-scratch-198p | 198 | Gaussian Naive Bayes (scratch) | 0.9779 | MIT |
| fetiai-v1-phiusiil-binclf-gnb-skl-202p | 202 | Gaussian Naive Bayes (scikit-learn) | no disponible | MIT |

Ambos modelos pertenecen al mismo proyecto y comparten dataset y objetivo. La diferencia principal es que la version `skl` usa la implementacion de scikit-learn, mientras que la version `scratch` esta implementada desde cero y se distribuye como un JSON plano, lo que permite cargarla sin ejecutar codigo. No se dispone de datos de otros clasificadores comparables en la informacion proporcionada.

## Limitaciones y advertencias

- Es un proyecto de curso, no un producto de seguridad: el propio autor indica explicitamente que no debe usarse para decidir si un enlace es seguro.
- Entrenado sobre un dataset estatico de 2023-24: no tiene inteligencia de amenazas, ni listas negras, ni conocimiento de campanas de phishing posteriores a su entrenamiento.
- Recall de phishing bajo (0.7881): una proporcion significativa de URLs maliciosas no se detectan, lo que lo hace inadecuado para filtrado en produccion.
- No procesa la URL como texto: depende completamente de la calidad de las 49 caracteristicas preextraidas; si el extractor falla, el modelo recibe valores nulos imputados, degradando su precision.
- Sin soporte multilingue ni de texto: no puede analizar el contenido de la pagina ni el idioma.
- Licencia MIT permite uso comercial, pero con las limitaciones funcionales descritas, su uso en entornos reales de seguridad no es recomendable.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/faizath/fetiai-v1-phiusiil-binclf-gnb-scratch-198p
- Repositorio de la aplicacion completa: https://github.com/fetiai/phishing-url-classifier
- Demo en vivo: https://phiusiil.faizath.com
- Dataset PhiUSIIL (UCI): https://archive.ics.uci.edu/dataset/967/phiusiil+phishing+url+dataset
- Repositorio del modelo hermano (scikit-learn): https://github.com/fetiai/fetiai-v1-phiusiil-binclf-gnb-skl-202p
