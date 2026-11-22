# PARADOXAIlabs/pwm-w-delhi-v0.1

## Resumen

PWM-W Delhi v0.1 es un modelo de predicción de series temporales espaciotemporales desarrollado por ParadoxAI Lab (Aditya Kumar, Anupam Singh) dentro de su serie Paradox World Model, concretamente la entrega número 19 de 56 publicadas. El modelo está especializado en el pronóstico a 24 horas de contaminantes atmosféricos (PM2.5, PM10, NO2 y ozono) en las estaciones de la red CPCB de Delhi, empleando datos horarios de 39 estaciones de monitorización de calidad del aire.

Se trata de un modelo de pequeño tamaño, con 884.204 parámetros, entrenado el 6 de noviembre de 2026 y publicado el 17 de noviembre de 2026 bajo licencia Apache-2.0. Supone la primera incursión de la serie en datos reales (frente a versiones anteriores sobre datos sintéticos o de otro tipo), y su relevancia radica en abordar un problema de salud pública crítico en una de las regiones más contaminadas del mundo con un modelo ligero y desplegable en entornos con recursos limitados.

El modelo reporta un MAE de 32,63 en PM2.5 sobre el conjunto de test (media de 3 semillas), superando a todas las líneas base simples entre un 19% y un 29%, aunque queda por detrás de TimesFM 3.0 (MAE 29,95) y empatado con Chronos. La información disponible sobre arquitectura interna, composición del dataset de entrenamiento y detalles de entrenamiento es limitada en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de forecasting espaciotemporal; código en repositorio GitHub) |
| Parametros totales | 884.204 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (horizonte de predicción: 24 horas) |
| Tipos de cuantizacion | no disponible (pesos en PyTorch float, sin versiones cuantizadas publicadas) |
| Idiomas soportados | no disponible (modelo numérico de series temporales, no lingüístico) |
| Licencia | Apache-2.0 |
| Formato de pesos | PyTorch state dict (.pt, 3.614.547 bytes) |

## Arquitectura y entrenamiento

La model card no describe explícitamente la arquitectura interna del modelo; indica que el código de arquitectura está disponible en el repositorio de GitHub (rama `delhi-v0.1`) y que la configuración de entrenamiento se almacena en el propio checkpoint bajo la clave `ck['cfg']`. Por la naturaleza de la tarea (forecasting espaciotemporal sobre 39 estaciones) y el tamaño reducido (884.204 parámetros), se trata presumiblemente de un modelo compacto orientado a capturar dependencias espaciales entre estaciones y temporales sobre series horarias, aunque no se confirma el tipo concreto (transformer, grafo espacio-temporal, SSM u otro).

Los datos de entrenamiento provienen de los informes horarios de calidad del aire de Delhi publicados en OpenCity (CPCB Delhi), con 39 estaciones de monitorización continua. El modelo se entrenó el 5 y 6 de noviembre de 2026 en un notebook de Kaggle (identificador `ce65e86211`). No se especifica el número de tokens ni el volumen total de la serie, la composición exacta del dataset, ni si se aplicaron técnicas de RLHF/DPO (poco habituales en forecasting). Los datos de entrenamiento no se distribuyen con el modelo; sus fuentes y términos se documentan en `DATA_SOURCES.md` del repositorio.

## Capacidades

- Pronóstico a 24 horas de concentraciones de PM2.5, PM10, NO2 y ozono en estaciones de la red de Delhi.
- Modelado espaciotemporal: aprovecha información de 39 estaciones de monitorización continua.
- Forecasting de series temporales multivariante con horizonte horario.
- Inferencia ligera: 884.204 parámetros permiten ejecución en CPU.
- Carga directa desde checkpoint PyTorch con metadatos, pesos, resultados y logs de ejecución embebidos (`ck['meta']`, `ck['weights']`, `ck['results']`, `ck['cfg']`).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües (no es un modelo de lenguaje).
- No dispone de modo thinking, visión ni audio.

## Casos de uso

- Predicción de episodios de contaminación en Delhi: el modelo genera pronósticos a 24 h de PM2.5 y PM10 por estación, permitiendo a autoridades sanitarias emitir alertas tempranas con un día de antelación y activar protocolos de restricción de tráfico o actividad industrial.
- Gestión de salud pública: con pronósticos horarios de NO2 y ozono, los servicios sanitarios pueden anticipar picos de afecciones respiratorias y reforzar urgencias en franjas concretas.
- Investigación atmosférica: el modelo sirve como referencia reproducible (checkpoint, logs y resultados embebidos) para comparar metodologías de forecasting espaciotemporal sobre datos reales de calidad del aire.
- Despliegue en entornos con recursos limitados: con menos de un millón de parámetros, puede ejecutarse en CPU dentro de infraestructura municipal o en dispositivos edge sin GPU, algo inviable con modelos como TimesFM.
- Integración en plataformas de monitorización ciudadana: los pronósticos por estación pueden alimentar aplicaciones públicas que muestren la calidad del aire prevista en cada barrio de Delhi.
- Evaluación comparativa de modelos: al incluir MAE de referencia frente a líneas base simples, TimesFM 3.0 y Chronos, resulta útil como punto de comparación en estudios de benchmarking de forecasting ambiental.
- Docencia y prototipado: su tamaño y licencia permisiva lo hacen adecuado para cursos y experimentos de series temporales espaciotemporales sin requisitos de hardware.

## Benchmarks y rendimiento

| Modelo | Metrica | Resultado |
|---|---|---|
| PWM-W Delhi v0.1 | PM2.5 test MAE (3 semillas) | 32,63 |
| TimesFM 3.0 | PM2.5 test MAE | 29,95 |
| Chronos | PM2.5 test MAE | empate con PWM-W Delhi v0.1 |
| Lineas base simples | PM2.5 test MAE | superadas por PWM-W en un 19-29% |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible, al no tratarse de un modelo de lenguaje.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB; el checkpoint ocupa 3,6 MB y el modelo tiene 884.204 parámetros, por lo que cabe holgadamente en cualquier GPU consumer e incluso en CPU.
- GPU recomendadas: ninguna imprescindible; cualquier GPU con al menos 1 GB de memoria es suficiente (GTX 1050, RTX 3060, RTX 4090, A100, H100 funcionan sin problema).
- Cabe en cualquier GPU consumer y en la mayoría de sistemas embebidos; la inferencia en CPU es viable.
- Opciones de despliegue: carga directa con PyTorch (`torch.load` con `weights_only=False`) y `huggingface_hub`. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (no aplicables a este tipo de modelo).
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / horizonte | PM2.5 MAE | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PWM-W Delhi v0.1 | 884.204 | 24 h | 32,63 | Apache-2.0 | Hugging Face + GitHub |
| TimesFM 3.0 | no disponible | no disponible | 29,95 | no disponible | no disponible |
| Chronos | no disponible | no disponible | empate con PWM-W | no disponible | no disponible |

## Limitaciones y advertencias

- Especialización geográfica estricta: entrenado únicamente con datos de Delhi; no se garantiza su validez en otras ciudades o regiones sin reentrenamiento.
- Rendimiento inferior a TimesFM 3.0 en PM2.5 (MAE 32,63 frente a 29,95) y solo empatado con Chronos; no es el estado del arte en la tarea.
- MAE de 32,63 µg/m³ en PM2.5 es elevado en términos absolutos, lo que limita su uso para alertas de precisión fina en episodios extremos.
- Documentación incompleta: la model card no detalla arquitectura, composición del dataset, número de tokens de entrenamiento ni proceso de validación, lo que dificulta la reproducibilidad completa.
- Los datos de entrenamiento no se distribuyen; solo se documentan sus fuentes, lo que puede condicionar auditorías.
- Riesgo de deriva (drift): al depender de estaciones CPCB concretas, cambios en la red de monitorización o en los protocolos de medida pueden degradar el rendimiento.
- No es un modelo de lenguaje: no admite instrucciones en lenguaje natural, tool calling ni razonamiento; su uso requiere integrarlo en un pipeline de datos.
- Licencia Apache-2.0 permite uso comercial, pero el autor no ofrece garantías sobre el rendimiento en producción ni sobre la exactitud de los pronósticos.
- Solo se publica un checkpoint (PM2.5); no queda claro si PM10, NO2 y ozono se predicen con el mismo archivo o si faltan artefactos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/PARADOXAIlabs/pwm-w-delhi-v0.1
- Repositorio GitHub (rama delhi-v0.1): https://github.com/paradoxailab/paradox-world-model/blob/delhi-v0.1/README.md
- Índice de la serie: https://github.com/paradoxailab/paradox-world-model/blob/main/models/series/README.md
- Fuentes de datos: https://github.com/paradoxailab/paradox-world-model/blob/main/DATA_SOURCES.md
- Citación: https://github.com/paradoxailab/paradox-world-model/blob/main/CITATION.cff
- Modelo anterior (#18 PWM-Dyn v0.7): https://huggingface.co/PARADOXAIlabs/pwm-dyn-v0.7-pems-bay
- Modelo siguiente (#20 PWM-W Delhi v0.2): https://huggingface.co/PARADOXAIlabs/pwm-w-delhi-v0.2
- Serie completa: https://huggingface.co/PARADOXAIlabs/paradox-world-model-series
- Sitio del autor: https://paradoxailab.com
