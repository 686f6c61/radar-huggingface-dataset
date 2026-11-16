# lexquire/CrossWind_ReachFirst_Model

## Resumen

ReachFirst v1 es un modelo de clasificación tabular basado en regresión logística, desarrollado por el analista Lauren Chen (AI Governance Lead) para la organización ficticia Crosswind Workforce Partnership, publicado en Hugging Face por el usuario `lexquire`. El modelo ordena listas de contacto de programas de asistencia social para que el equipo de divulgación priorice los hogares con mayor probabilidad de situarse en o por debajo del umbral de ingresos cubierto por los programas. No es un modelo de lenguaje ni una red neuronal: se trata de un artefacto scikit-learn de apenas 4.300 bytes que forma parte de un material educativo del AI Governance Practicum (Track 1).

El interés del modelo es fundamentalmente pedagógico y de gobernanza, no de rendimiento. El repositorio incluye la model card completa del "exemplar" de la semana 6 del practicum, con secciones sobre detalles del modelo, uso previsto, mitigación de sesgos con Fairlearn, linaje de datos y control de versiones. Es un ejemplo de cómo documentar un sistema de IA de alto riesgo en el sector público, no un modelo listo para producción.

La versión publicada es la v1 (recomendada para firma), comparada con una v2 que aplica `CorrelationRemover` de Fairlearn sobre las mismas 58 columnas codificadas. El modelo se sirve en el Space `drdavidprivacy/reachfirst` y se entrenó sobre el dataset público `drdavidprivacy/reachfirst-data`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Regresión logística (scikit-learn), con pipeline de escalado y one-hot encoding |
| Parametros totales | 58 coeficientes más intercepto (10 entradas codificadas en 58 columnas) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo tabular, no secuencial) |
| Tipos de cuantizacion | no disponible (no aplica; el artefacto es un `.pkl` de 4.300 bytes) |
| Idiomas soportados | no disponible |
| Licencia | CC-BY-4.0 |
| Formato de pesos | `.pkl` (pickle de scikit-learn), más CSV legible con pesos e intercepto |
| Regularización | C = 0.1, sin class weights |
| Versión de scikit-learn | 1.9.1 (fijada; el modelo no carga en otra versión) |
| Versión de Fairlearn | 0.15.0 |
| Librería | sklearn |
| Tarea | tabular-classification |
| Dataset de entrenamiento | `drdavidprivacy/reachfirst-data` |
| Tamaño del repositorio | 0.0 GB |

## Arquitectura y entrenamiento

El modelo es una regresión logística clásica de scikit-learn con regularización L2 (C = 0.1), sin ponderación de clases y con entradas escaladas. El pipeline transforma diez variables de entrada en 58 columnas mediante one-hot encoding, con los niveles fijados sobre las filas de entrenamiento, imputación por mediana para huecos numéricos (el fichero no contiene ninguno) y un escalador. Los pasos ajustados que producción debe reproducir son exactamente esos: niveles del one-hot, mediana, escalador y, en el caso de v2, el `CorrelationRemover` ajustado sobre las filas de entrenamiento.

La v2 aplica `CorrelationRemover` de Fairlearn contra sexo, raza y país de origen, eliminando de cada una de las otras entradas la parte que covaría con esas tres variables y descartando después las tres columnas (24 columnas codificadas de 82). Ninguna de las dos versiones usa esos tres campos como entrada directa; lo que cambia en v2 es que las diez entradas restantes ya no los portan de forma indirecta. No se documenta en la información disponible el número de tokens (no aplica), la composición del dataset ni si hubo ajuste fino o RLHF (no aplica a este tipo de modelo).

## Capacidades

- Clasificación tabular binaria: estima la probabilidad de que un hogar esté en o por debajo del umbral de ingresos cubierto por los programas.
- Ordenación de listas de contacto: produce un ranking de prioridad, no un corte; todos los hogares permanecen en la lista.
- Mitigación de sesgo integrada (v2): reduce la dependencia de las predicciones respecto a sexo, raza y país de origen mediante `CorrelationRemover`.
- Auditabilidad: el repositorio incluye un CSV (`reachfirst_v1_Inside.csv`) con cada columna ajustada, su peso y el intercepto, legible por personas.
- Integridad verificable: hashes SHA-256 publicados para ambos artefactos (`reachfirst_v1.pkl` y `reachfirst_v2.pkl`).
- No soporta tool calling, agentes, razonamiento multi-paso, visión, audio ni capacidades multilingües: no es un modelo de lenguaje.

## Casos de uso

- Ordenación de listas de divulgación en programas sociales: el modelo puntúa hogares para que el equipo de coaches, con capacidad para alcanzar en torno al 20 % del universo por ciclo, contacte primero a los más probables de estar bajo el umbral de ingresos, sustituyendo el boca a boca y las visitas espontáneas.
- Docencia en gobernanza de IA: sirve como caso de estudio completo del AI Governance Practicum (semana 6), con model card, decisiones de punto de operación y comparación v1/v2 documentadas.
- Auditoría de sesgo con Fairlearn: permite reproducir el flujo de `CorrelationRemover` sobre un dataset público y comparar el comportamiento de dos versiones del mismo pipeline.
- Evaluación de sistemas de alto riesgo en el sector público: ejemplifica cómo documentar linaje de datos, propietario del modelo, aprobador de registro y puertas de uso (`use gate`) antes de cualquier contacto real.
- Prueba de reproducibilidad de pipelines scikit-learn: al fijar la versión 1.9.1 y publicar hashes, permite verificar que un entorno reproduce exactamente el artefacto entrenado.
- Diseño de experimentos controlados: el material describe un primer ciclo medido en el que la mitad de la capacidad se trabaja con la lista y la otra mitad con la práctica actual, un patrón reutilizable para validar sistemas de priorización antes de escalarlos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: prácticamente nula; el artefacto pesa 4.300 bytes y la inferencia es una multiplicación de matrices de 58 dimensiones.
- GPU recomendadas: no aplica; el modelo se ejecuta en CPU sin problema.
- Cabe en cualquier GPU consumer y en cualquier CPU moderna; también en entornos serverless de muy baja capacidad.
- Opciones de despliegue: el Space oficial `drdavidprivacy/reachfirst`; en local, Python con scikit-learn 1.9.1 y fairlearn 0.15.0 para cargar el `.pkl`. No aplica vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponibles en la información proporcionada; por la naturaleza del modelo (regresión logística sobre 58 columnas) el coste por predicción es despreciable frente a cualquier modelo neuronal.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ReachFirst v1 (este) | Regresión logística scikit-learn | 58 coeficientes + intercepto | no aplica | CC-BY-4.0 | Hugging Face, Space oficial |
| ReachFirst v2 | Regresión logística + CorrelationRemover | 58 coeficientes + intercepto | no aplica | CC-BY-4.0 | Referenciado en la model card, hash publicado |
| Modelos de scoring crediticio o de elegibilidad basados en gradient boosting | Tabular | no disponible | no aplica | variable | no disponible en esta búsqueda |
| Modelos de lenguaje para clasificación zero-shot de texto tabular | Transformer | no disponible | no disponible | variable | no disponible en esta búsqueda |

No se dispone de datos de rendimiento comparables entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- El modelo es material educativo: la organización, el sistema y las personas son ficticios; el uso previsto es exclusivamente educativo y no debe emplearse para decisiones reales.
- Riesgo de sesgo: la v1 no incorpora mitigación; la v2 aplica `CorrelationRemover` contra sexo, raza y país de origen, pero la información disponible no cuantifica la reducción de disparidades lograda.
- Riesgo de alucinación: no aplica en el sentido habitual (no genera texto), pero sí existe riesgo de sobreconfianza en las probabilidades estimadas si se usa fuera del dominio de entrenamiento.
- Limitaciones de contexto e idioma: no aplica; el modelo opera sobre variables tabulares, no sobre texto.
- Restricciones de licencia: CC-BY-4.0 permite uso comercial con atribución, pero la model card restringe explícitamente el uso a fines educativos.
- Dependencia estricta de versión: el `.pkl` no carga en versiones de scikit-learn distintas de la 1.9.1, lo que complica el despliegue en entornos con otras versiones.
- El modelo no decide elegibilidad ni elimina a nadie de la lista; cualquier uso que lo trate como un corte de elegibilidad contradice su uso previsto documentado.
- La puerta de uso (`use gate`) está cerrada hasta que se completen las comprobaciones de listas de vigilancia y se cierren por escrito, según la model card.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/lexquire/CrossWind_ReachFirst_Model
- Dataset de entrenamiento: https://huggingface.co/datasets/drdavidprivacy/reachfirst-data
- Case packs del practicum: https://huggingface.co/datasets/drdavidprivacy/practicum-case-packs
- Space de servicio: https://huggingface.co/spaces/drdavidprivacy/reachfirst
