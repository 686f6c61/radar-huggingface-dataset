# PARADOXAIlabs/atlas-delhi-v1.1

## Resumen

Atlas-Delhi v1.1 es un modelo de predicción de series temporales desarrollado por ParadoxAI Lab (Aditya Kumar, Anupam Singh) dentro de su serie Paradox World Model, concretamente el modelo número 38 de la serie y el 35 de los 56 publicados. Su tarea es la previsión de las próximas 24 horas de concentración de PM2.5 en estaciones de medición de la calidad del aire en Delhi. No es un modelo de lenguaje: es un modelo de pronóstico espacio-temporal de contaminación atmosférica.

El modelo se entrena con datos de las 39 estaciones de monitorización continua de calidad del aire del CPCB (Central Pollution Control Board) de Delhi, obtenidos del conjunto "Delhi Hourly Air Quality Reports" de OpenCity, abarcando todo el histórico disponible desde 2018. Esta versión v1.1 incorpora el histórico completo de Delhi, con 19.082 ventanas de entrenamiento.

La relevancia de este modelo es doble: por un lado, aborda un problema de salud pública crítico en una de las ciudades más contaminadas del mundo; por otro, su tamaño extremadamente reducido (967.632 parámetros por checkpoint) lo hace desplegable en cualquier entorno, incluso en dispositivos con recursos muy limitados. La versión v1.1 mejora el error de validación respecto al modelo de 16 meses (20,807 frente a 22,127).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (código en repositorio GitHub del autor; configuración en `ck['cfg']`) |
| Parametros totales | 967.632 por checkpoint; el archivo contiene 2 checkpoints (B, C) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (ventana de entrada no especificada; horizonte de predicción de 24 h) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (no es un modelo de lenguaje; datos en inglés/India) |
| Licencia | Apache-2.0 |
| Formato de pesos | PyTorch (`.pt`, state dict serializado con `torch.load`) |

## Arquitectura y entrenamiento

La arquitectura concreta no se detalla en la información disponible. El modelo se distribuye como un archivo PyTorch (`.pt`) que contiene un diccionario con las claves `meta`, `weights`, `results` y `cfg`. La configuración de entrenamiento está almacenada en el propio archivo bajo `ck['cfg']`, y el código de arquitectura se encuentra en el repositorio GitHub del proyecto (paradox-world-model). Por los tags del modelo (spatiotemporal, forecasting, air-quality) y la tarea declarada, se trata de un modelo de pronóstico espacio-temporal, presumiblemente con componentes que modelan tanto la dimensión temporal como la relación entre estaciones.

El entrenamiento se realizó el 2026-11-13 en la ejecución de Kaggle "atlas-long-s300". Los datos de entrenamiento son las 39 estaciones de monitorización continua del CPCB de Delhi, con todo el histórico desde 2018, totalizando 19.082 ventanas. El archivo contiene dos checkpoints (B y C) correspondientes a distintas etapas de entrenamiento; la model card indica que el registro especifica qué etapa usa cada resultado. No se especifica si hubo ajuste fino con RLHF/DPO (no aplicable a este tipo de modelo) ni el número exacto de tokens o pasos de entrenamiento.

## Capacidades

- Predicción de las próximas 24 horas de concentración de PM2.5 en estaciones de calidad del aire de Delhi.
- Modelado espacio-temporal: aprovecha la información de múltiples estaciones (39) y su evolución temporal.
- Pronóstico multi-horizonte (24 h) a partir de series históricas horarias.
- Entrenado con datos horarios desde 2018, lo que le permite capturar patrones estacionales y tendencias de largo plazo.
- No dispone de capacidades de generación de texto, razonamiento, código, matemáticas, visión ni tool calling; no es un modelo de lenguaje.
- No se documentan capacidades multilingües ni modo de razonamiento (thinking mode).

## Casos de uso

- **Sistemas de alerta temprana de contaminación**: el modelo predice PM2.5 a 24 h vista en las 39 estaciones de Delhi, lo que permite emitir avisos sanitarios y activar protocolos de emergencia (cierre de escuelas, restricciones de tráfico) con un día de antelación.
- **Planificación urbana y política pública**: las autoridades pueden usar las previsiones para programar medidas como el odd-even de vehículos o la suspensión de obras, evaluando el impacto esperado en la calidad del aire.
- **Gestión de salud pública**: hospitales y clínicas pueden anticipar picos de afecciones respiratorias y cardíacas, dimensionando recursos y campañas de concienciación para poblaciones vulnerables.
- **Investigación atmosférica**: el modelo sirve como línea base reproducible (Apache-2.0, pesos abiertos) para estudiar la dinámica espacio-temporal de la contaminación en Delhi y comparar con otros enfoques.
- **Integración en dashboards de calidad del aire**: dado su tamaño mínimo (menos de 1 M de parámetros, archivo de 7,8 MB), puede ejecutarse en el backend de un portal web o en un dispositivo edge sin GPU.
- **Evaluación de intervenciones**: mediante simulaciones contrafactuales sobre las series históricas, se puede estimar el efecto de políticas pasadas y proyectar escenarios futuros.
- **Educación y divulgación**: por su reducido tamaño y licencia permisiva, es adecuado para talleres y cursos sobre forecasting de series temporales y modelos espacio-temporales.

## Benchmarks y rendimiento

| Metrica | Atlas-Delhi v1.1 | Modelo de 16 meses (referencia de la model card) |
|---|---|---|
| Error de validación (unidad no especificada) | 20,807 | 22,127 |

El resultado registrado en la model card indica una mejora del error de validación de 20,807 frente a 22,127 del modelo de 16 meses, lo que motivó su adopción. No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K, etc.) en la información disponible, ya que no son aplicables a este tipo de modelo. No se detalla la métrica exacta (¿RMSE? ¿MAE?) ni la unidad.

## Requisitos de hardware

- **VRAM estimada para inferencia**: inferior a 1 GB; el archivo completo pesa 7,8 MB y el modelo tiene menos de 1 M de parámetros por checkpoint. Cabe holgadamente en CPU.
- **GPU recomendadas**: no requiere GPU; cualquier CPU moderna es suficiente. En caso de usar GPU, cualquier modelo consumer (GTX 1050, RTX 3050, etc.) es más que suficiente.
- **Cabe en GPU consumer**: sí, en cualquier GPU consumer e incluso en dispositivos embebidos (Raspberry Pi, móviles de gama media).
- **Opciones de despliegue**: PyTorch nativo (`torch.load` + forward con el código del repositorio GitHub). No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo). Para producción se recomienda exportar a TorchScript o ONNX.
- **Latencia y throughput estimados**: no disponibles en la información proporcionada; por el tamaño del modelo, se espera latencia de milisegundos en CPU para una inferencia de 24 pasos.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. La model card únicamente compara con la versión anterior de la propia serie (Atlas-Delhi v1.0 y el "modelo de 16 meses"). No se han identificado en la información otros modelos de forecasting de calidad del aire con los que establecer una comparación rigurosa.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Atlas-Delhi v1.1 | 967.632 | No disponible | Error validación 20,807 | Apache-2.0 | Hugging Face |
| Atlas-Delhi v1.0 | No disponible | No disponible | No disponible | Apache-2.0 | Hugging Face |
| Modelo de 16 meses (referencia interna) | No disponible | No disponible | Error validación 22,127 | No disponible | No disponible |

## Limitaciones y advertencias

- **Ámbito geográfico y temporal restringido**: el modelo está entrenado exclusivamente con datos de Delhi desde 2018; no se garantiza su validez en otras ciudades ni en periodos con cambios estructurales (nuevas fuentes de emisión, cambios meteorológicos extremos).
- **Tarea única**: solo predice PM2.5 a 24 h; no modela otros contaminantes (NO2, O3, PM10) ni horizontes más largos.
- **Riesgo de alucinación**: no aplica en el sentido de los LLM, pero existe riesgo de predicciones poco fiables en condiciones fuera de distribución (eventos extremos, fallos de estaciones, datos faltantes).
- **Datos de entrenamiento no incluidos**: los datos no se distribuyen con el modelo; solo se documentan sus fuentes y términos en DATA_SOURCES.md, lo que dificulta la reproducibilidad completa.
- **Métrica de validación no especificada**: la model card no indica si el error 20,807 es RMSE, MAE u otra métrica, ni su unidad, lo que limita la interpretación.
- **Documentación escasa**: no se detalla la arquitectura, el preprocesado, la estrategia de validación ni el número de pasos de entrenamiento.
- **Restricciones de licencia**: Apache-2.0 permite uso comercial y modificación, pero se debe conservar el aviso de licencia y la atribución (Kumar, Singh; ParadoxAI Lab).
- **Caveat para producción**: al ser un modelo de 967 K parámetros, su capacidad expresiva es limitada; conviene validarlo en el dominio concreto de despliegue antes de confiar en él para decisiones críticas de salud pública.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/PARADOXAIlabs/atlas-delhi-v1.1)
- [Repositorio GitHub del proyecto](https://github.com/paradoxailab/paradox-world-model)
- [Registro de la versión (atlas/README.md)](https://github.com/paradoxailab/paradox-world-model/blob/main/atlas/README.md)
- [Índice de la serie completa](https://github.com/paradoxailab/paradox-world-model/blob/main/models/series/README.md)
- [Fuentes de datos (DATA_SOURCES.md)](https://github.com/paradoxailab/paradox-world-model/blob/main/DATA_SOURCES.md)
- [CITACIÓN (CITATION.cff)](https://github.com/paradoxailab/paradox-world-model/blob/main/CITATION.cff)
- [Versión anterior: Atlas-Delhi v1.0](https://huggingface.co/PARADOXAIlabs/atlas-delhi-v1.0)
- [Versión siguiente: Atlas-Delhi v1.2](https://huggingface.co/PARADOXAIlabs/atlas-delhi-v1.2)
- [Todos los modelos de la serie](https://huggingface.co/PARADOXAIlabs/paradox-world-model-series)
- [Sitio web de ParadoxAI Lab](https://paradoxailab.com)
