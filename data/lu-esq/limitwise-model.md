# Lu-esq/limitwise-model

## Resumen

LimitWise v2 es un modelo de clasificación tabular basado en regresión logística, publicado en Hugging Face por el usuario Lu-esq bajo el identificador `Lu-esq/limitwise-model`. Se presenta como el artefacto de un ejercicio educativo de gobernanza de IA (AI Governance Practicum, Track 1) en el que una organización ficticia, Corvana Bank, documenta un sistema de alerta temprana de impago de tarjetas de crédito. El modelo no es un modelo de lenguaje ni una red neuronal: es un pipeline de scikit-learn serializado en formato pickle que predice la probabilidad de impago en el siguiente ciclo de extracto.

El pipeline incluye imputación por mediana, un eliminador de correlación con variables demográficas (Fairlearn `CorrelationRemover`), escalado y recalibración isotónica. Se distribuye en dos artefactos: `limitwise_v2.pkl` (18.636 bytes) y `limitwise_v2_recalibrated.pkl` (89.015 bytes), además de una tabla CSV con los pesos por columna y un PDF con la model card. La licencia es CC-BY-4.0 y el autor indica explícitamente que es de uso educativo y no apto para decisiones reales.

La relevancia del repositorio es fundamentalmente documental y metodológica: sirve como ejemplo de model card orientada a gobernanza, con trazabilidad de linaje de datos, hashes de integridad y controles de mitigación de sesgo. No debe evaluarse como un modelo de propósito general ni como una alternativa a modelos fundacionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Regresión logística con pipeline de preprocesado (imputación por mediana, CorrelationRemover de Fairlearn, escalado, recalibración isotónica) |
| Parametros totales | No disponible (modelo lineal; el número de coeficientes depende de las 93 columnas de entrada de v2; no se publica el recuento exacto) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (entrada tabular de 93 columnas, no secuencial) |
| Tipos de cuantizacion | No disponible (no aplica a modelos de scikit-learn; se serializa en pickle) |
| Idiomas soportados | No disponible (no procesa texto) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | Pickle de scikit-learn (`.pkl`); tabla CSV con pesos e intercepto (`limitwise_v2_Inside.csv`) |

## Arquitectura y entrenamiento

El modelo es una regresión logística con regularización C = 0.1, pesos de clase balanceados y entradas escaladas. La versión v1 se ajustó sobre 27 variables codificadas en 98 columnas; la versión v2 se ajusta sobre 93 columnas tras eliminar cuatro campos demográficos (sexo, edad, estado civil y educación). El pipeline de producción debe reproducir cuatro pasos ajustados: el relleno con la mediana de entrenamiento del ratio de pago para las 3.175 cuentas sin saldo previo, el `CorrelationRemover` de Fairlearn ajustado contra los cuatro campos demográficos, el escalador y la recalibración isotónica (curva monótona ajustada sobre predicciones de validación cruzada en las filas de entrenamiento).

Los datos proceden del fichero de trabajo remediado del dataset `drdavidprivacy/limitwise-data`, que a su vez enlaza al fichero original en `drdavidprivacy/practicum-case-packs`. El autor indica que el modelo se entrenó con scikit-learn 1.9.1 y fairlearn 0.15.0, y que por diseño no carga en otra versión de scikit-learn. No se documenta el número de tokens (no aplica), la composición detallada del dataset ni si hubo ajuste por RLHF o DPO (no aplica a este tipo de modelo). La innovación técnica destacable es la combinación de mitigación de sesgo mediante eliminación de correlación con recalibración isotónica, verificada mediante una comprobación de calibración documentada en la model card.

## Capacidades

- Clasificación tabular binaria: estima la probabilidad de impago de pago en el siguiente ciclo de extracto para cuentas de tarjeta abiertas.
- Ranking de cuentas por riesgo dentro de un ciclo de extracto, para priorizar la revisión humana.
- Mitigación de sesgo incorporada: el pipeline elimina la parte de cada variable que covaría con sexo, edad, estado civil y educación, y descarta esos cuatro campos.
- Calibración de probabilidades mediante curva isotónica, con una comprobación de calibración documentada que debe pasar antes de que la puntuación se interprete como probabilidad.
- Trazabilidad de artefactos: hashes SHA-256 publicados para los ficheros `.pkl` y tabla legible de pesos e intercepto.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, generación de texto, código, matemáticas, visión ni audio.
- No tiene capacidades multilingües: no procesa lenguaje natural.

## Casos de uso

- Alerta temprana de impago en tarjetas: el modelo puntúa cada cuenta abierta al cierre del ciclo de extracto para que el equipo de cobros pueda priorizar llamadas de contacto y ofertas de hardship un ciclo antes de que lo detecte el scorecard conductual. Es adecuado porque su salida es una probabilidad calibrada y el flujo previsto mantiene una persona en la decisión de cada cuenta.
- Priorización de la cola de revisión humana: dado un volumen de cuentas mayor que la capacidad de contacto, el ranking permite seleccionar las N cuentas con mayor probabilidad estimada. Encaja porque el modelo está diseñado para ordenar, no para decidir automáticamente.
- Auditoría de equidad en un pipeline de crédito: el uso del `CorrelationRemover` y la comparación v1/v2 permiten estudiar cómo cambia la calibración y la paridad entre grupos al eliminar variables demográficas. Es un caso realista en formación y en revisión interna de modelos.
- Docencia y práctica de gobernanza de IA: el repositorio funciona como plantilla de model card con secciones de linaje, hashes de integridad, mitigación, uso previsto, factores y verificación de calibración. Apropiado para cursos y ejercicios de AI Governance.
- Reproducción de un pipeline de scikit-learn con versiones fijas: sirve para practicar el bloqueo de dependencias (scikit-learn 1.9.1, fairlearn 0.15.0) y la verificación de integridad por hash en un entorno controlado.
- Prueba de concepto de recalibración isotónica: el artefacto `limitwise_v2_recalibrated.pkl` permite comparar probabilidades antes y después de la recalibración en un conjunto de validación, útil para estudiar el efecto de la calibración en la interpretación de scores.
- Ejemplo de despliegue en un Space de Hugging Face: el modelo se sirve desde el Space `drdavidprivacy/limitwise`, lo que permite demostrar el ciclo completo de publicación de un modelo tabular con su model card.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona una comprobación de calibración (sección 7) y una comparación entre v1 y v2, pero no se proporcionan métricas numéricas (AUC, F1, Brier, etc.) en la información accesible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; el modelo es una regresión logística serializada en pickle de menos de 100 KB. Cabe en memoria principal de cualquier máquina.
- GPU recomendadas: ninguna. La inferencia se ejecuta en CPU.
- Cabe en cualquier GPU consumer y en cualquier CPU moderna; no requiere acelerador.
- Opciones de despliegue: carga directa con `pickle` y scikit-learn 1.9.1 en Python; servicio mediante el Space de Hugging Face `drdavidprivacy/limitwise`; integración en un servicio HTTP propio (FastAPI, Flask) que cargue el pipeline. No aplica vLLM, llama.cpp, Ollama ni TGI, que están orientados a modelos de lenguaje.
- Latencia y throughput estimados: no disponibles de forma publicada; por la naturaleza del modelo (una multiplicación matriz-vector sobre 93 columnas) la latencia esperada es de microsegundos a milisegundos por petición en CPU, aunque no se aporta una medición concreta.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LimitWise v2 | Regresión logística tabular con mitigación de sesgo | No disponible (lineal, 93 columnas) | No aplica | CC-BY-4.0 | Hugging Face (`Lu-esq/limitwise-model`) |
| LimitWise v1 | Regresión logística tabular sin eliminación de campos demográficos | No disponible (lineal, 98 columnas) | No aplica | No disponible en la información | Referenciado en la model card, no publicado como artefacto independiente |
| Alternativas genéricas de clasificación tabular (p. ej. gradient boosting) | No disponible | No disponible | No aplica | No disponible | No disponible |

No se dispone de información sobre modelos comparables de la misma categoría con métricas publicadas que permitan una comparación cuantitativa. La comparación más directa es interna, entre v1 y v2 del propio sistema.

## Limitaciones y advertencias

- Uso exclusivamente educativo: el autor declara que la organización, el sistema y las personas son ficticios y que el modelo no debe usarse para decisiones reales.
- Riesgo de alucinación: no aplica en el sentido de generación de texto, pero sí existe riesgo de sobreinterpretar la probabilidad estimada como una probabilidad real de impago si no ha pasado la comprobación de calibración en la versión firmada.
- Sesgos conocidos: el pipeline mitiga la correlación con sexo, edad, estado civil y educación, pero la eliminación de correlación no garantiza paridad entre grupos ni elimina sesgos procedentes de variables proxy no consideradas.
- Dependencia estricta de versiones: el modelo no carga en una versión de scikit-learn distinta de la 1.9.1, por diseño; esto complica la reproducibilidad a largo plazo y el despliegue en entornos con otras versiones.
- Limitaciones de contexto e idioma: no procesa texto ni secuencias; su entrada es un vector tabular de 93 columnas con un esquema fijo. No admite entradas fuera de ese esquema.
- Restricciones de licencia: CC-BY-4.0 permite uso comercial con atribución, pero el aviso del autor restringe el uso a fines educativos; conviene verificar la compatibilidad antes de cualquier uso productivo.
- Caveat para producción: la model card indica que el uso está bloqueado hasta que pasen la comprobación de calibración y la de cobertura de razones, y hasta que la capacidad de contacto esté escrita en el fichero del programa. Cualquier despliegue real requeriría revisión de gobernanza adicional.
- Sin métricas publicadas: no se aportan AUC, F1, Brier score ni resultados de paridad, lo que impide evaluar su rendimiento frente a alternativas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Lu-esq/limitwise-model
- Dataset de linaje: https://huggingface.co/datasets/drdavidprivacy/limitwise-data
- Case packs del practicum: https://huggingface.co/datasets/drdavidprivacy/practicum-case-packs
- Space de demostración: https://huggingface.co/spaces/drdavidprivacy/limitwise
