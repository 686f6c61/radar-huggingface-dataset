# PARADOXAIlabs/atlas-delhi-v1.2

## Resumen

Atlas-Delhi v1.2 es un modelo de predicción de series temporales desarrollado por ParadoxAI Lab (Aditya Kumar, Anupam Singh) dentro de su serie Paradox World Model. Su tarea concreta es el pronóstico de las próximas 24 horas de concentración de PM2.5 en las estaciones de monitorización de calidad del aire de Delhi. El modelo se entrenó con datos históricos de la red CPCB de Delhi (39 estaciones de monitorización continua, serie completa desde 2018) y se publica como un checkpoint de PyTorch de 967.632 parámetros.

Se trata de un modelo de dominio muy específico y de tamano reducido, orientado a un problema de contaminación atmosférica con implicaciones directas en salud pública. No es un modelo de lenguaje: no genera texto, no razona y no soporta tool calling. Es un artefacto de forecasting espaciotemporal que se carga mediante `torch.load` y expone pesos y metadatos en un diccionario.

La relevancia de esta versión es limitada: la propia model card indica que fue adoptada en validación pero que **no supera a la versión anterior (v1.1) en el conjunto de test**, algo que el autor documenta explícitamente. El valor principal del artefacto es su trazabilidad: incluye configuración de entrenamiento, resultados registrados y enlaces al repositorio con las reglas y predicciones de la serie.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (código en repositorio GitHub del autor; no descrita en la model card) |
| Parametros totales | 967.632 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de series temporales, no de texto) |
| Tipos de cuantizacion | no disponible (checkpoint PyTorch en precisión de entrenamiento) |
| Idiomas soportados | no disponible (no es un modelo lingüístico) |
| Licencia | Apache-2.0 |
| Formato de pesos | PyTorch state dict en archivo `.pt` (3.901.541 bytes) |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna. El checkpoint contiene un `state dict` de PyTorch con 967.632 parámetros y una configuración de entrenamiento accesible en `ck['cfg']`. El código de la arquitectura está en el repositorio de GitHub del proyecto, pero no se reproduce en la información disponible. Por el tamano y la tarea (forecasting espaciotemporal de PM2.5 sobre 39 estaciones), se trata de un modelo especializado de series temporales, no de un transformer de lenguaje.

Datos de entrenamiento: registros horarios de calidad del aire de la red CPCB de Delhi (39 estaciones continuas, fuente OpenCity "Delhi Hourly Air Quality Reports"), con todo el histórico desde 2018. El entrenamiento se realizó el 2026-11-13 en la ejecución `atlas-long2-a` de Kaggle. En esta versión se cambió "todo el schedule" y se usaron más semillas respecto a v1.1. No se documenta el número de tokens ni si hubo ajuste por RLHF/DPO (no aplica a este tipo de modelo). Los datos de entrenamiento no se distribuyen; sus fuentes y términos están en `DATA_SOURCES.md`.

## Capacidades

- Predicción de las próximas 24 horas de PM2.5 en estaciones de Delhi (tarea principal y única documentada).
- Modelado espaciotemporal sobre 39 estaciones de monitorización continua.
- Carga programática de pesos, configuración y resultados registrados desde el checkpoint.
- No soporta generación de texto, razonamiento, código, matemáticas ni visión.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- Capacidades multilingües: no aplica.
- No dispone de modo thinking, audio ni otras capacidades especiales.

## Casos de uso

- Pronóstico operativo de calidad del aire en Delhi: generar cada hora la predicción de PM2.5 a 24 horas para las 39 estaciones y alimentar paneles públicos de alerta sanitaria.
- Activación de protocolos de emergencia por contaminación: usar el pronóstico a 24 h para anticipar episodios de alta concentración y coordinar restricciones de tráfico o avisos a población vulnerable.
- Investigación en modelado espaciotemporal: servir como baseline reproducible (pesos, configuración y resultados incluidos) para comparar arquitecturas de forecasting sobre la misma serie.
- Reproducibilidad y auditoría de experimentos: el checkpoint incluye `ck['results']` con todos los resultados registrados y los logs de la ejecución, útil para replicar o auditar el experimento.
- Integración en pipelines de datos medioambientales: cargar el modelo con `torch.load` y encadenarlo a ingestas horarias de la red CPCB para generar pronósticos automatizados.
- Docencia y prototipado: con menos de un millón de parámetros, se puede ejecutar en CPU y sirve para ilustrar flujos completos de forecasting con datos abiertos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo registra cualitativamente que el modelo fue "adoptado en validación" y que "no es mejor que v1.1 en test". No se proporcionan métricas numéricas (RMSE, MAE, etc.) ni comparaciones cuantitativas.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; con 967.632 parámetros el checkpoint ocupa unos 3,9 MB, por lo que cabe en CPU y en cualquier GPU consumer.
- GPU recomendadas: no se requiere GPU; cualquier GPU moderna (RTX 3060 o superior) es más que suficiente si se desea acelerar.
- Cabe en GPU consumer: sí, en cualquier modelo actual e incluso en entornos sin GPU.
- Opciones de despliegue: carga directa con PyTorch (`torch.load`) y `huggingface_hub`; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo).
- Latencia y throughput estimados: no disponibles; por el tamano, la inferencia es del orden de milisegundos en CPU.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye comparaciones con otros modelos de forecasting de calidad del aire. El único punto de comparación documentado es la versión anterior de la misma familia:

| Modelo | Parametros | Tarea | Resultado registrado | Licencia |
|---|---|---|---|---|
| Atlas-Delhi v1.2 | 967.632 | PM2.5 a 24 h, Delhi | Adoptado en validación; no mejor que v1.1 en test | Apache-2.0 |
| Atlas-Delhi v1.1 | no disponible | PM2.5 a 24 h, Delhi | Referencia de comparación (mejor en test según v1.2) | Apache-2.0 |

## Limitaciones y advertencias

- La propia model card reconoce que v1.2 no mejora a v1.1 en el conjunto de test; para producción conviene evaluar si v1.1 es preferible.
- Modelo de dominio muy restringido: solo PM2.5 en estaciones de Delhi; no es extrapolable a otras ciudades, contaminantes o tareas sin reentrenamiento.
- Arquitectura no documentada en la model card; hay que consultar el repositorio de GitHub para conocerla.
- Sin métricas numéricas publicadas: no es posible evaluar la calidad del pronóstico a partir de la información disponible.
- Los datos de entrenamiento no se distribuyen; la reproducibilidad depende de las fuentes externas (CPCB/OpenCity) y de sus términos.
- Riesgo de degradación ante cambios en la red de estaciones, huecos en la serie o eventos atípicos no representados en el histórico.
- Sesgos: no documentados; al entrenar solo con datos de Delhi, el modelo hereda las particularidades de esa red y región.
- Licencia Apache-2.0: permite uso comercial, pero se recomienda citar según `CITATION.cff` y verificar los términos de las fuentes de datos.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: ecosistema de validación externa muy limitado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/PARADOXAIlabs/atlas-delhi-v1.2
- Versión anterior (v1.1): https://huggingface.co/PARADOXAIlabs/atlas-delhi-v1.1
- Versión siguiente (Atlas-India v1.0): https://huggingface.co/PARADOXAIlabs/atlas-india-v1.0
- Índice de la serie: https://huggingface.co/PARADOXAIlabs/paradox-world-model-series
- Repositorio GitHub: https://github.com/paradoxailab/paradox-world-model
- Registro de la familia Atlas: https://github.com/paradoxailab/paradox-world-model/blob/main/atlas/README.md
- Índice de modelos de la serie: https://github.com/paradoxailab/paradox-world-model/blob/main/models/series/README.md
- Fuentes de datos: https://github.com/paradoxailab/paradox-world-model/blob/main/DATA_SOURCES.md
- Citación: https://github.com/paradoxailab/paradox-world-model/blob/main/CITATION.cff
- Sitio del autor: https://paradoxailab.com
