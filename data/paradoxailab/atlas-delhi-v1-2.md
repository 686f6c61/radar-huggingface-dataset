# paradoxailab/atlas-delhi-v1.2

## Resumen

Atlas-Delhi v1.2 es un modelo de predicción de series temporales desarrollado por ParadoxAI Lab (Aditya Kumar, Anupam Singh) dentro de su serie "Paradox World Model". Concretamente, es el modelo número 39 de la serie y el número 36 de los 56 publicados. Su tarea específica es la previsión de las próximas 24 horas de concentración de PM2.5 en estaciones de medición de la calidad del aire en Delhi (India).

El modelo es extremadamente compacto: 967.632 parámetros, con pesos en formato PyTorch (`.pt`, state dict). Se entrenó con datos históricos de las 39 estaciones de monitorización continua de la calidad del aire de la CPCB (Central Pollution Control Board) de Delhi, disponibles a través de OpenCity ("Delhi Hourly Air Quality Reports"), abarcando todo el histórico desde 2018. La arquitectura concreta no se detalla en la model card; el código de arquitectura está en el repositorio de GitHub del proyecto y la configuración de entrenamiento se almacena dentro del propio fichero de pesos (`ck['cfg']`).

La relevancia de esta ficha es doble: por un lado, documenta un modelo de forecasting espacio-temporal de contaminación atmosférica de ámbito local; por otro, es un ejemplo de publicación honesta de resultados, ya que el autor indica explícitamente que, aunque el modelo fue adoptado en validación, no superó a la versión anterior (v1.1) en el conjunto de test. El modelo se publica bajo licencia Apache-2.0.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (código en repositorio GitHub del proyecto; configuración en `ck['cfg']`) |
| Parámetros totales | 967.632 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de series temporales; ventana de entrada no especificada) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | Apache-2.0 |
| Formato de pesos | PyTorch state dict en fichero `.pt` (`39_atlas_delhi_v1.2.pt`, 3.901.541 bytes) |

## Arquitectura y entrenamiento

La model card no especifica la arquitectura interna del modelo. Se trata de un modelo de forecasting espacio-temporal (etiquetas `spatiotemporal`, `time-series-forecasting`) orientado a predecir las próximas 24 horas de PM2.5 en estaciones de la red de Delhi. El código de arquitectura está disponible en el repositorio de GitHub del proyecto, y la configuración exacta de entrenamiento se guarda dentro del propio fichero de pesos (`ck['cfg']`), por lo que puede recuperarse al cargar el checkpoint.

En cuanto al entrenamiento, los datos provienen de las 39 estaciones de monitorización continua de la calidad del aire de la CPCB de Delhi (OpenCity "Delhi Hourly Air Quality Reports"), usando todo el histórico desde 2018. El modelo se entrenó el 2026-11-13 en el entorno "Kaggle atlas-long2-a". En esta versión v1.2 se cambió "todo el calendario" y se usaron más semillas ("whole schedule, more seeds"). No se documentan en la información disponible detalles sobre número de tokens, composición exacta del dataset, ni uso de RLHF/DPO (no aplicable a este tipo de modelo).

## Capacidades

- Predicción de las próximas 24 horas de concentración de PM2.5 en estaciones de la red de Delhi.
- Modelado espacio-temporal: aprovecha la estructura de 39 estaciones de monitorización, lo que permite capturar dependencias entre ubicaciones.
- Forecasting de series temporales horarias con histórico desde 2018.
- Carga reproducible mediante `torch.load` con metadatos (`meta`), pesos (`weights`) y resultados registrados (`results`) incluidos en el checkpoint.
- No dispone de generación de texto, razonamiento, código, matemáticas, visión, tool calling, capacidades de agente ni multilingüismo: es un modelo numérico específico de forecasting.

## Casos de uso

- Predicción operativa de calidad del aire en Delhi: generar cada hora el pronóstico de PM2.5 a 24 horas vista para las 39 estaciones, alimentando paneles públicos de salud ambiental.
- Alertas sanitarias tempranas: integrar las predicciones en sistemas de aviso para población sensible (asmáticos, niños, personas mayores) cuando se prevén episodios de alta contaminación.
- Planificación de restricciones de tráfico y actividad industrial: usar el pronóstico a 24 h como insumo para decisiones municipales de corto plazo en episodios de contaminación.
- Investigación en contaminación atmosférica: comparar el comportamiento del modelo con modelos físicos o estadísticos de referencia sobre el mismo histórico de la CPCB.
- Reproducibilidad y auditoría de la serie Paradox World Model: cargar el checkpoint y examinar `ck['results']` y `ck['cfg']` para verificar los resultados registrados y la configuración de entrenamiento.
- Docencia y prototipado de forecasting espacio-temporal: el tamaño reducido (menos de un millón de parámetros) permite ejecutarlo en CPU y usarlo como ejemplo didáctico de pipeline de series temporales.
- Evaluación comparativa de versiones: contrastar v1.2 con v1.1 sobre el mismo conjunto de test, dado que el autor documenta que v1.2 no mejora a v1.1 en test.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente registra de forma cualitativa: "adopted on validation; not better than v1.1 on test (recorded honestly)". No se proporcionan métricas numéricas (MAE, RMSE, etc.) ni comparaciones cuantitativas con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; con 967.632 parámetros, el checkpoint ocupa aproximadamente 3,9 MB, por lo que cabe holgadamente en cualquier GPU consumer e incluso en CPU.
- GPU recomendadas: no se especifican; cualquier GPU moderna (RTX 4090, A100, H100) es sobredimensionada para este modelo. Es viable en CPU.
- Cabe en GPU consumer: sí, en cualquier GPU consumer (incluso integradas) y en CPU.
- Opciones de despliegue: carga directa con PyTorch (`torch.load`) y `huggingface_hub`. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (no aplicables a un modelo de forecasting de este tipo).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Tarea | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Atlas-Delhi v1.2 | 967.632 | Forecasting PM2.5 24 h (Delhi) | no disponible | Apache-2.0 | Hugging Face |
| Atlas-Delhi v1.1 | no disponible | Forecasting PM2.5 24 h (Delhi) | no disponible | Apache-2.0 (según serie) | Hugging Face |
| Atlas-India v1.0 | no disponible | Forecasting (India) | no disponible | Apache-2.0 (según serie) | Hugging Face |

No se dispone de datos de rendimiento numérico para establecer una comparación cuantitativa con alternativas. La comparación se limita a versiones de la misma familia.

## Limitaciones y advertencias

- El propio autor indica que v1.2 no supera a v1.1 en el conjunto de test, aunque fue adoptado en validación; conviene evaluar ambas versiones antes de desplegar.
- Modelo de ámbito geográfico restringido: entrenado exclusivamente con datos de Delhi (39 estaciones CPCB); no es extrapolable sin reentrenamiento a otras ciudades o redes.
- Dependencia de la red de sensores: cambios en la ubicación, calibración o disponibilidad de estaciones pueden degradar las predicciones.
- No se documentan métricas de error (MAE, RMSE) ni intervalos de confianza en la información disponible, lo que dificulta una evaluación rigurosa previa al despliegue.
- No es un modelo de lenguaje: no soporta texto, código, visión ni tool calling; usarlo fuera de su tarea de forecasting no es adecuado.
- No se especifican sesgos conocidos ni riesgos de alucinación en el sentido habitual; el riesgo principal es el error de predicción y la posible mala calibración en episodios extremos.
- Licencia Apache-2.0: permite uso comercial y modificación, con obligación de mantener el aviso de licencia y atribución.
- Los datos de entrenamiento no se incluyen; sus fuentes y términos están en `DATA_SOURCES.md` del repositorio, por lo que la reproducibilidad completa depende de acceder a esas fuentes externas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/paradoxailab/atlas-delhi-v1.2
- Versión anterior (v1.1): https://huggingface.co/paradoxailab/atlas-delhi-v1.1
- Versión siguiente (Atlas-India v1.0): https://huggingface.co/paradoxailab/atlas-india-v1.0
- Serie completa: https://huggingface.co/paradoxailab/paradox-world-model-series
- Repositorio GitHub: https://github.com/paradoxailab/paradox-world-model
- Registro de la familia Atlas: https://github.com/paradoxailab/paradox-world-model/blob/main/atlas/README.md
- Índice de la serie: https://github.com/paradoxailab/paradox-world-model/blob/main/models/series/README.md
- Fuentes de datos: https://github.com/paradoxailab/paradox-world-model/blob/main/DATA_SOURCES.md
- Citación: https://github.com/paradoxailab/paradox-world-model/blob/main/CITATION.cff
- Sitio web: https://paradoxailab.com
