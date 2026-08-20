# feti-ai/fetiai-v1-phiusiil-binclf-gnb-skl-202p

## Resumen

`fetiai-v1-phiusiil-binclf-gnb-skl-202p` es un clasificador tabular binario para detección de phishing en URLs, desarrollado por el grupo 16 del curso IF3070 (Fundamentos de Inteligencia Artificial) de STEI ITB. Está implementado con un modelo Gaussian Naive Bayes de scikit-learn, con solo 202 parámetros, y se sirve como una API HTTP de un solo modelo. El modelo se entrenó sobre el dataset PhiUSIIL (49 características preextraídas de URLs) y está pensado como un componente de un sistema más amplio de clasificación de phishing, no como un producto de seguridad independiente.

Su relevancia radica en ser un ejemplo didáctico y funcional de despliegue de un modelo clásico de machine learning con una API bien definida, incluyendo manejo de valores nulos, imputación y un contrato de características explícito. No es un modelo de lenguaje ni de visión; opera exclusivamente sobre vectores numéricos de 49 dimensiones. La licencia es MIT, lo que permite uso libre, pero el autor advierte explícitamente que no debe emplearse para decidir si un enlace es seguro en producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gaussian Naive Bayes (scikit-learn) |
| Parametros totales | 202 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (no es red neuronal) |
| Idiomas soportados | no disponible (trabaja con vectores numéricos) |
| Licencia | MIT |
| Formato de pesos | joblib (scikit-learn) |

## Arquitectura y entrenamiento

El modelo es un clasificador Gaussian Naive Bayes implementado con scikit-learn. Asume que las características numéricas siguen una distribución gaussiana y calcula la probabilidad posterior de cada clase (phishing o legítima) usando el teorema de Bayes. No es un transformer ni un modelo de atención; es un algoritmo clásico de aprendizaje automático con una complejidad computacional mínima.

El entrenamiento se realizó sobre el dataset PhiUSIIL (Phishing URL Dataset), que contiene 49 características preextraídas de URLs, como longitud de la URL, longitud del dominio, presencia de HTTPS, etc. Según la model card, se aplicó SMOTE (Synthetic Minority Over-sampling Technique) para balancear las clases y se realizó ingeniería de características. No se dispone de información sobre el número exacto de muestras de entrenamiento ni sobre el proceso de validación. El modelo se sirve a través de una API HTTP con endpoints para predicción individual y por lotes, e incluye un mecanismo de imputación para valores nulos (12 de las 49 características están permanentemente nulas por no superar el acuerdo de extracción del proyecto padre).

## Capacidades

- Clasificación binaria de URLs: dado un vector de 49 características, devuelve una etiqueta (phishing o legítima) y una puntuación de phishing.
- Manejo de valores nulos: acepta `null` en las características y los imputa automáticamente, indicando cuántas características reales se proporcionaron y la cobertura.
- API HTTP con endpoints `POST /predict` (una fila), `POST /predict/batch` (hasta 1000 filas), `GET /metadata` (contrato de características y métricas), `GET /healthz` y `GET /readyz`.
- Autocomprobación: el artefacto incluye una prueba de "golden row" que verifica que la predicción se reproduce exactamente.
- No soporta generación de texto, tool calling, razonamiento multi-paso ni procesamiento de lenguaje natural. No acepta URLs crudas como entrada; solo vectores numéricos.

## Casos de uso

- Filtrado de URLs en un proxy corporativo: el modelo puede integrarse en un proxy HTTP para puntuar cada URL solicitada y bloquear o alertar sobre las que superen un umbral de phishing. Su baja latencia (inferencia trivial) permite evaluar en tiempo real.
- Análisis de enlaces en correos electrónicos: un sistema de seguridad de email puede extraer las 49 características de cada URL en un mensaje y enviarlas al modelo para decidir si el correo debe marcarse como sospechoso.
- Extensión de navegador para educación: una extensión que muestre una advertencia al usuario cuando visita una URL clasificada como phishing, útil en entornos de formación sobre ciberseguridad.
- Componente de un pipeline de threat intelligence: el modelo puede servir como un primer filtro rápido dentro de un sistema más complejo que combine múltiples fuentes (blocklists, análisis de reputación, etc.), reduciendo la carga de análisis profundo.
- Demostración de despliegue de ML: por su simplicidad y licencia MIT, es un ejemplo didáctico para enseñar cómo servir un modelo clásico con una API REST, Docker y pruebas de autoverificación.
- Evaluación de URLs en entornos académicos: investigadores o estudiantes pueden usarlo como baseline para comparar con otros clasificadores de phishing (Random Forest, XGBoost, redes neuronales) sobre el mismo dataset.

## Benchmarks y rendimiento

Según los datos declarados por el autor en la model card (no verificados de forma independiente):

| Metrica | Valor |
|---|---|
| Accuracy | 0.9819 |
| Precision (phishing) | 0.8774 |
| Recall (phishing) | 0.8880 |

Estos resultados se obtuvieron sobre el dataset PhiUSIIL. No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- El modelo tiene solo 202 parámetros y un tamaño de artefacto de 669 KB, por lo que cabe en cualquier CPU, incluso en un microcontrolador o en un contenedor con recursos mínimos.
- No requiere GPU. La inferencia es instantánea (del orden de microsegundos) al ser un modelo Naive Bayes con 49 características.
- Se sirve mediante Docker; la imagen incluye el modelo embebido y no necesita descarga adicional.
- Opciones de despliegue: API HTTP con FastAPI (implícito en la documentación), o integración directa en Python usando joblib para cargar el modelo.
- Latencia y throughput: no se han publicado mediciones, pero al ser un modelo lineal en el número de características, puede procesar miles de peticiones por segundo en un solo núcleo.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de otros clasificadores de phishing sobre el mismo dataset en la información proporcionada. Como referencia cualitativa, los modelos basados en Random Forest o XGBoost suelen lograr accuracy similar en este tipo de tareas, pero con un coste computacional mayor. No se puede establecer una comparación numérica sin fuentes verificadas.

## Limitaciones y advertencias

- Es un trabajo de curso, no un producto de seguridad. El autor lo declara explícitamente: "no lo use para decidir si un enlace es seguro".
- Entrenado con un dataset estático de 2023-24; no tiene inteligencia de amenazas actualizada, ni blocklist, ni conocimiento de campañas de phishing posteriores a su entrenamiento.
- No procesa URLs crudas; solo acepta vectores de 49 características preextraídas. Si el extractor de características falla, el modelo no puede funcionar.
- 12 de las 49 características están permanentemente nulas, lo que reduce la cobertura real del vector de entrada.
- Riesgo de sesgo: el dataset PhiUSIIL puede no representar la diversidad de URLs reales, y el modelo puede tener falsos positivos o negativos en escenarios no vistos.
- No hay garantía de soporte ni mantenimiento; es un proyecto académico con licencia MIT, pero sin compromiso de actualización.

## Enlaces

- [HuggingFace - feti-ai/fetiai-v1-phiusiil-binclf-gnb-skl-202p](https://huggingface.co/feti-ai/fetiai-v1-phiusiil-binclf-gnb-skl-202p)
- [Repositorio de la aplicación completa](https://github.com/fetiai/phishing-url-classifier)
- [Demo en vivo](https://phiusiil.faizath.com)
- [Dataset PhiUSIIL en UCI](https://archive.ics.uci.edu/dataset/967/phiusiil+phishing+url+dataset)
