# PARADOXAIlabs/atlas-india-v1.3-pretrain

## Resumen

Atlas v1.3 (pretrain) es un modelo de predicción de series temporales desarrollado por ParadoxAI Lab (Aditya Kumar, Anupam Singh) dentro de su serie Paradox World Model. Su tarea concreta es pronosticar las próximas 24 horas de concentración de PM2.5 en estaciones de monitorización de calidad del aire en la India. Se entrenó sobre datos de la red CPCB (Central Pollution Control Board) distribuidos en 13 redes y 263 estaciones, excluyendo Delhi, y se publica como checkpoint de la etapa de preentrenamiento de la versión 1.3.

A diferencia de los modelos de lenguaje, se trata de un modelo neuronal compacto de 967.632 parámetros (menos de un millón), orientado exclusivamente a forecasting espacio-temporal. El checkpoint se distribuye como un state dict de PyTorch en un único fichero de 3,9 MB, con la configuración de entrenamiento embebida en el propio fichero (`ck['cfg']`) y el código de arquitectura alojado en el repositorio GitHub del proyecto.

Su relevancia es acotada pero específica: cubre un caso de uso de alto impacto social (predicción de contaminación atmosférica) con un modelo ligero, reproducible y con licencia Apache-2.0, lo que facilita su integración en pipelines de monitorización ambiental sin requisitos de hardware significativos. No es un modelo de propósito general ni soporta generación de texto, código o razonamiento.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (código en repositorio GitHub; configuración en `ck['cfg']`) |
| Parámetros totales | 967.632 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de series temporales; ventana de entrada definida en `ck['cfg']`) |
| Tipos de cuantización | no disponible (checkpoint PyTorch en precisión nativa) |
| Idiomas soportados | no aplica (modelo numérico de series temporales) |
| Licencia | Apache-2.0 |
| Formato de pesos | PyTorch state dict (`.pt`, 3.903.381 bytes) |

## Arquitectura y entrenamiento

La información pública no detalla la arquitectura interna más allá de su naturaleza de red neuronal para forecasting espacio-temporal. El checkpoint contiene un state dict de PyTorch con 967.632 parámetros, y la configuración exacta de entrenamiento se almacena en el propio fichero bajo la clave `ck['cfg']`. El código de arquitectura está disponible en el repositorio `paradoxailab/paradox-world-model`, por lo que la definición exacta de capas, mecanismos de atención o agregación espacial debe consultarse allí.

El entrenamiento se realizó el 2026-11-13 (run `atlas-v13-s320`) sobre datos de la red CPCB de toda la India, provenientes del dataset de Kaggle "Time Series Air Quality Data of India (2010-2023)", con 14 redes y 263 estaciones en origen, de las cuales se excluyó Delhi para este modelo (quedando 13 redes). La tarea es predecir las 24 horas siguientes de PM2.5 en estaciones. El resultado registrado de validación agrupada (*pooled validation*) es 8.507 sobre las 13 redes. No se documenta en la información disponible el número de tokens ni la composición detallada del dataset, ni si hubo etapas de ajuste fino posteriores.

## Capacidades

- Predicción de series temporales: pronóstico de las próximas 24 horas de PM2.5 en estaciones de monitorización.
- Modelado espacio-temporal: incorpora información de múltiples estaciones y redes (13 redes, 263 estaciones) para el forecasting.
- Salida numérica continua: genera valores de concentración de PM2.5, no texto.
- Carga programática vía `huggingface_hub` y `torch.load`, con acceso a metadatos (`ck['meta']`), pesos (`ck['weights']`), resultados (`ck['results']`) y configuración (`ck['cfg']`).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües.
- No dispone de modo *thinking*, visión ni audio.

## Casos de uso

- Monitorización de calidad del aire en tiempo casi real: el modelo pronostica las próximas 24 h de PM2.5 por estación, permitiendo a autoridades ambientales emitir alertas tempranas con un modelo de menos de 1 M de parámetros desplegable en CPU.
- Planificación de salud pública: anticipar episodios de contaminación en redes CPCB (excluyendo Delhi) para activar protocolos sanitarios y recomendaciones a población vulnerable.
- Investigación en contaminación atmosférica: servir como línea base reproducible (Apache-2.0, pesos públicos) para comparar metodologías de forecasting espacio-temporal en la India.
- Integración en paneles de datos ambientales: el checkpoint ligero (3,9 MB) se puede cargar en servicios backend sin GPU dedicada y alimentar dashboards con predicciones a 24 h.
- Validación de pipelines de datos de sensores: usar el modelo para detectar anomalías comparando la predicción con la medición real de la red de estaciones.
- Estudio de transferencia entre redes: al excluir Delhi y entrenar sobre 13 redes, permite analizar el comportamiento del modelo en distintas regiones y como base para la versión específica de Delhi (#42 Atlas-Delhi v1.3).
- Docencia y prototipado: ejemplo compacto de modelo de forecasting espacio-temporal para cursos o pruebas de concepto, con código de arquitectura público.

## Benchmarks y rendimiento

El autor registra un único resultado: *pooled validation* de 8.507 sobre las 13 redes. No se especifica la métrica exacta (por ejemplo, RMSE o MAE) en la información disponible, por lo que no se puede interpretar directamente ni comparar con otros modelos.

| Métrica | Valor | Contexto |
|---|---|---|
| Pooled validation | 8.507 | Sobre 13 redes (sin Delhi); métrica no especificada |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K ni equivalentes de series temporales) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB; con 967.632 parámetros y un checkpoint de 3,9 MB, cabe holgadamente en CPU y en cualquier GPU con memoria mínima.
- GPU recomendadas: no requiere GPU; cualquier GPU consumer (por ejemplo, RTX 3060 o superior) es más que suficiente si se desea acelerar.
- Cabe en cualquier GPU consumer e incluso en entornos sin GPU (CPU, Raspberry Pi, contenedores ligeros).
- Opciones de despliegue: carga directa con PyTorch (`torch.load`); no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles en la información proporcionada; por el tamaño del modelo se espera latencia muy baja, pero no hay cifras publicadas.

## Comparativa con modelos similares

No se dispone en la información proporcionada de modelos comparables de forecasting de PM2.5 con los que contrastar parámetros, contexto, rendimiento y licencia. Se indica "no disponible".

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Atlas v1.3 (pretrain) | 967.632 | no disponible | Apache-2.0 | Hugging Face + GitHub |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Modelo de dominio muy específico: solo predice PM2.5 a 24 h en estaciones de la red CPCB; no es un modelo de propósito general.
- Excluye Delhi del entrenamiento, por lo que su aplicabilidad a esa región es dudosa (existe un modelo separado, #42 Atlas-Delhi v1.3).
- Es un checkpoint de etapa de preentrenamiento (*stage*), no necesariamente la versión final optimizada; el autor lo etiqueta explícitamente como "pre-training stage of v1.3".
- La métrica de validación (8.507) no está definida en la información disponible, lo que impide evaluar su calidad de forma independiente.
- No se documentan sesgos, riesgos de alucinación (no genera texto) ni limitaciones de idioma aplicables.
- Licencia Apache-2.0 permite uso comercial, pero se recomienda citar según `CITATION.cff` y revisar los términos de las fuentes de datos en `DATA_SOURCES.md`.
- Los datos de entrenamiento no se incluyen; su reproducibilidad depende de las fuentes externas (Kaggle, CPCB).
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación comunitaria independiente.

## Enlaces

- Hugging Face: https://huggingface.co/PARADOXAIlabs/atlas-india-v1.3-pretrain
- Repositorio GitHub: https://github.com/paradoxailab/paradox-world-model
- Registro del modelo (atlas/README.md): https://github.com/paradoxailab/paradox-world-model/blob/main/atlas/README.md
- Índice de la serie: https://github.com/paradoxailab/paradox-world-model/blob/main/models/series/README.md
- Fuentes de datos: https://github.com/paradoxailab/paradox-world-model/blob/main/DATA_SOURCES.md
- Citación: https://github.com/paradoxailab/paradox-world-model/blob/main/CITATION.cff
- Modelo anterior (#40 Atlas-India v1.0): https://huggingface.co/PARADOXAIlabs/atlas-india-v1.0
- Modelo siguiente (#42 Atlas-Delhi v1.3): https://huggingface.co/PARADOXAIlabs/atlas-delhi-v1.3
- Serie completa: https://huggingface.co/PARADOXAIlabs/paradox-world-model-series
- Sitio del laboratorio: https://paradoxailab.com
