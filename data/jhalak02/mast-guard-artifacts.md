# Jhalak02/mast-guard-artifacts

## Resumen

MAST-Guard es un repositorio de artefactos de detección de fallos para agentes basados en modelos de lenguaje (LLM agents), desarrollado por Jhalak Prasad Pandey (Jhalak02). No se trata de un modelo generativo, sino de un conjunto de clasificadores entrenados con XGBoost que implementan cadenas de clasificadores (ClassifierChain) para detectar los 14 modos de fallo definidos en la taxonomía MAST (Multi-Agent System Testing). El repositorio contiene dos artefactos serializados en formato pickle: un detector en tiempo real para ventanas de streaming (modo B) y un detector offline para trazas completas (modo A).

La relevancia de este proyecto radica en que aborda un problema emergente: la monitorización y detección de fallos en sistemas multiagente basados en LLM, un área crítica para el despliegue en producción de agentes autónomos. Los modelos fueron entrenados sobre el dataset MAST-Data (licencia CC-BY-4.0) y los artefactos se distribuyen bajo licencia Apache-2.0. El repositorio incluye un manifiesto con hashes SHA256 para verificar la integridad de los archivos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | XGBoost con ClassifierChain (clasificadores en cadena) |
| Parametros totales | no disponible (modelos XGBoost, no redes neuronales) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje) |
| Tipos de cuantizacion | no aplica (modelos serializados en pickle) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | pickle (.pkl) |

## Arquitectura y entrenamiento

Los artefactos son clasificadores XGBoost organizados como ClassifierChain, una técnica que encadena múltiples clasificadores binarios donde cada uno utiliza las predicciones de los anteriores como características adicionales. Esto permite modelar dependencias entre los 14 modos de fallo de MAST, que pueden presentarse de forma correlacionada en un mismo agente. El detector en tiempo real (`mast_detector_runtime.pkl`) opera sobre ventanas de streaming en modo B, mientras que el detector offline (`mast_detector_v1.pkl`) analiza trazas completas en modo A para auditorías posteriores.

El entrenamiento se realizó sobre el dataset MAST-Data, publicado bajo licencia CC-BY-4.0. Un aspecto crítico documentado por el autor es que las etiquetas de entrenamiento contienen ruido introducido por un juez LLM, con un coeficiente kappa de Cohen de 0,77 frente a la anotación humana. Esto implica que los puntos de operación calibrados deben consultarse en el informe de entrenamiento para ajustar umbrales de decisión en producción.

## Capacidades

- Detección de los 14 modos de fallo definidos en la taxonomía MAST para agentes LLM.
- Detección en tiempo real (streaming) mediante ventanas deslizantes, apta para puntuación lateral (sidecar scoring) en sistemas en producción.
- Auditoría offline de trazas completas para análisis retrospectivo y cumplimiento.
- Salida probabilística por modo de fallo, lo que permite establecer umbrales de alerta configurables.
- Verificación de integridad de artefactos mediante hashes SHA256 incluidos en `manifest.json`.
- No es un modelo generativo: no genera texto, código ni realiza razonamiento.

## Casos de uso

- Monitorización en producción de agentes LLM: el detector en modo streaming puede ejecutarse como servicio lateral (sidecar) que puntúa cada ventana de interacción del agente y emite alertas cuando se supera el umbral de probabilidad para un modo de fallo concreto.
- Auditoría de trazas post-mortem: el detector offline permite analizar trazas completas de sesiones pasadas para identificar patrones de fallo recurrentes y mejorar el diseño del agente.
- Evaluación de pipelines de agentes en CI/CD: integración del detector en pipelines de integración continua para validar que nuevas versiones del agente no introducen modos de fallo conocidos.
- Calibración de sistemas de alerta: uso de las salidas probabilísticas para configurar sistemas de notificación escalonados (aviso, crítico) según la severidad del modo de fallo.
- Investigación en fiabilidad de sistemas multiagente: el repositorio sirve como punto de partida para reproducir experimentos de detección de fallos y comparar con otros enfoques.
- Análisis de correlación entre modos de fallo: la arquitectura ClassifierChain permite estudiar qué fallos tienden a co-ocurrir, información útil para priorizar correcciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El único dato cuantitativo documentado es el coeficiente kappa de Cohen de 0,77 entre las etiquetas generadas por el juez LLM y la anotación humana, que mide la calidad de las etiquetas de entrenamiento, no el rendimiento de los detectores. No se proporcionan métricas como precisión, recall o F1 para los clasificadores.

## Requisitos de hardware

- Los artefactos son modelos XGBoost serializados, con un tamaño de repositorio de 0,0 GB según HuggingFace, lo que indica que son archivos de pocos kilobytes o megabytes.
- Inferencia ejecutable en CPU sin necesidad de GPU: XGBoost es una implementación de gradient boosting que funciona eficientemente en hardware convencional.
- Requisitos de memoria RAM mínimos: del orden de decenas de megabytes para cargar los modelos en memoria.
- Despliegue recomendado: integración en servicios Python con la librería `xgboost` y `pickle` para cargar los artefactos; puede ejecutarse en contenedores Docker ligeros o funciones serverless.
- Latencia esperada: del orden de milisegundos por predicción en CPU, adecuada para puntuación en tiempo real de ventanas de streaming.
- No requiere vLLM, llama.cpp, Ollama ni TGI, al no ser un modelo de lenguaje.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada modelos comparables de detección de fallos para agentes LLM con los que establecer una comparación directa. La categoría de detectores de fallos basados en XGBoost para sistemas multiagente es emergente y no existen alternativas ampliamente documentadas en el ecosistema open source.

## Limitaciones y advertencias

- Ruido en las etiquetas de entrenamiento: las etiquetas proceden de un juez LLM con kappa de 0,77 frente a humanos, lo que introduce errores de clasificación inherentes que se propagan al modelo entrenado.
- No es un modelo generativo: no puede utilizarse para generar texto, código o razonamiento; su única función es clasificar trazas de agentes.
- Dependencia del formato de entrada: los detectores esperan características específicas extraídas de trazas de agentes; no se documentan en la model card los nombres ni la estructura exacta de las features, lo que dificulta su integración sin acceso al dataset de entrenamiento.
- Sin métricas de rendimiento publicadas: no se proporcionan valores de precisión, recall o AUC, por lo que el rendimiento real en producción es desconocido.
- Riesgo de sobreajuste al dataset MAST-Data: al estar entrenados sobre un único dataset, la generalización a otros sistemas de agentes con arquitecturas o protocolos distintos no está garantizada.
- Licencia del dataset: aunque los artefactos son Apache-2.0, el dataset de entrenamiento MAST-Data está bajo CC-BY-4.0, lo que puede imponer restricciones de atribución si se redistribuyen derivados.
- Sin soporte de idiomas documentado: no se especifica si los detectores funcionan con trazas en múltiples idiomas o solo en inglés.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Jhalak02/mast-guard-artifacts
- Dataset MAST-Data: https://huggingface.co/datasets/Jhalak02/MAST-Data
- Perfil del autor en HuggingFace: https://huggingface.co/Jhalak02
- Perfil del autor en GitHub: https://github.com/JHALAK02
