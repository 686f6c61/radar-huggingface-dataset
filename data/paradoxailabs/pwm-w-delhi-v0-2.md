# PARADOXAIlabs/pwm-w-delhi-v0.2

## Resumen

PWM-W Delhi v0.2 es un modelo de predicción de series temporales espaciotemporales desarrollado por ParadoxAI Lab (Aditya Kumar, Anupam Singh) dentro de su familia Paradox World Model, serie PWM-W. Su tarea concreta es pronosticar las próximas 24 horas de concentración de PM2.5 en Delhi (India), operando en modo híbrido: no predice desde cero, sino que corrige las salidas de modelos fundacionales de series temporales (Chronos-2 y TimesFM 2.5) incorporando la estructura de grafo de las estaciones de medida.

El modelo es deliberadamente pequeño: 1.060.076 parámetros, lo que lo sitúa en la categoría de corrector ligero más que de modelo fundacional. Se entrenó el 6 de noviembre de 2026 y se publicó el 17 de noviembre de 2026 como modelo número 20 de una serie de 56 publicados (numeración 01–59). Los datos de entrenamiento provienen de 39 estaciones de monitorización continua de calidad del aire de la red CPCB de Delhi (OpenCity, informes horarios) y de pronósticos meteorológicos de Open-Meteo del día anterior.

La relevancia de este modelo radica en su enfoque de hibridación: en lugar de competir con modelos fundacionales grandes, se especializa en una región y una variable concretas, aprovechando el conocimiento de un modelo base y añadiendo información estructural local (la topología de la red de estaciones) y meteorológica. Es un ejemplo de modelo vertical de bajo coste computacional orientado a un problema de salud pública concreto como es la contaminación atmosférica en Delhi.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible (corrector híbrido sobre grafos de estaciones; código en repositorio GitHub, configuración en `ck['cfg']`) |
| Parámetros totales | 1.060.076 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 72 horas de histórico más 14 medias diarias (ventana de entrada declarada) |
| Tipos de cuantización | No disponible (pesos en PyTorch float, sin variantes GGUF/INT8 publicadas) |
| Idiomas soportados | No disponible (modelo numérico de series temporales, sin procesamiento de lenguaje) |
| Licencia | Apache-2.0 |
| Formato de pesos | PyTorch (`.pt`, 4.315.138 bytes), cargado mediante `torch.load` con `weights_only=False` |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna más allá de indicar que es un modelo híbrido que combina la salida de modelos fundacionales externos (Chronos-2 y TimesFM 2.5) con un grafo de estaciones. El código de arquitectura está en el repositorio GitHub del proyecto y la configuración exacta de entrenamiento se guarda dentro del propio checkpoint en la clave `ck['cfg']`. No se especifican capas, tipo de bloque (transformer, GNN, mixto) ni mecanismo de atención en la información disponible.

En cuanto a datos de entrenamiento, se usan 39 estaciones de calidad del aire de la red CPCB de Delhi (fuente OpenCity, informes horarios) y pronósticos meteorológicos de Open-Meteo del día anterior. La ventana de entrada es de 72 horas de histórico más 14 medias diarias, y el horizonte de predicción es de 24 horas. No se indica el número de tokens ni el volumen total de muestras, ni si hubo etapas de ajuste fino con RLHF/DPO (poco probable en un modelo de regresión numérica). El entrenamiento se ejecutó en Kaggle bajo el identificador `pwm-delhi-v02-pm25`.

La innovación principal es el planteamiento híbrido: el modelo no genera el pronóstico completo, sino que actúa como corrector sobre las predicciones de modelos fundacionales, incorporando explícitamente la estructura de grafo de las estaciones. Los pesos de los modelos externos no se distribuyen con este repositorio; solo se incluyen los pesos propios entrenados por ParadoxAI Lab.

## Capacidades

- Pronóstico de PM2.5 a 24 horas vista para la red de estaciones de Delhi.
- Corrección híbrida de predicciones de Chronos-2 y TimesFM 2.5 mediante información estructural de estaciones.
- Modelado espaciotemporal: incorpora dependencias entre estaciones a través de un grafo.
- Integración de pronósticos meteorológicos del día anterior (Open-Meteo) como variable exógena.
- Manejo de contexto temporal largo: 72 horas de histórico más 14 medias diarias.
- No soporta tool calling, function calling ni razonamiento multi-paso en lenguaje natural.
- No dispone de capacidades multilingües ni de generación de texto.
- No incluye modo thinking, visión ni audio.

## Casos de uso

- Pronóstico operativo de calidad del aire en Delhi: el modelo genera la predicción de PM2.5 a 24 horas para las 39 estaciones CPCB, lo que permite a autoridades sanitarias emitir avisos con un día de antelación y activar protocolos de reducción de tráfico o restricciones industriales.
- Corrección de modelos fundacionales en producción: se puede desplegar como capa de post-proceso sobre las salidas de Chronos-2 o TimesFM 2.5, mejorando la precisión local sin necesidad de reentrenar los modelos base, dado su tamaño de 1,06 M de parámetros.
- Sistemas de alerta temprana para salud pública: integrado en paneles de vigilancia epidemiológica, el pronóstico a 24 horas permite correlacionar picos de PM2.5 con ingresos hospitalarios por afecciones respiratorias y planificar recursos sanitarios.
- Investigación en modelado espaciotemporal: al incluir el grafo de estaciones y la configuración en el checkpoint, sirve como referencia reproducible para estudiar el efecto de la topología de red en la predicción de contaminantes.
- Evaluación comparativa de modelos fundacionales de series temporales: al corregir Chronos-2 y TimesFM 2.5 sobre el mismo conjunto de datos, permite cuantificar en qué estaciones y condiciones cada modelo base falla más y cuánto aporta la información estructural.
- Planificación urbana y estudios de exposición: los pronósticos por estación permiten estimar la exposición poblacional a PM2.5 en distintos distritos de Delhi y alimentar modelos de dispersión o estudios epidemiológicos a escala de barrio.
- Despliegue en infraestructura limitada: con 1,06 M de parámetros, el modelo puede ejecutarse en CPU o en GPUs de gama baja dentro de pipelines de ingestión de datos horarios, sin necesidad de aceleradores dedicados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica que los resultados de esta versión están registrados en la rama `delhi-v0.2` del repositorio GitHub y en la clave `ck['results']` del checkpoint, pero no se reproducen en la información proporcionada. No se ofrecen cifras de MAE, RMSE ni comparaciones cuantitativas con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en precisión completa, dado que el checkpoint pesa 4,3 MB y el modelo tiene 1,06 M de parámetros.
- GPU recomendadas: cualquier GPU con al menos 1 GB de memoria; no requiere A100, H100 ni RTX 4090. Una GTX 1050 o incluso una iGPU es suficiente.
- Cabe en cualquier GPU de consumo e incluso en CPU sin aceleración apreciable.
- Opciones de despliegue: carga directa con PyTorch (`torch.load` + `hf_hub_download`); no hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje.
- Latencia y throughput estimados: no disponibles en la información proporcionada; por el tamaño del modelo, se espera inferencia en milisegundos por estación en CPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PWM-W Delhi v0.2 | 1.060.076 | 72 h + 14 medias diarias | Corrección de PM2.5 a 24 h en Delhi | Apache-2.0 | Hugging Face (0 descargas) |
| Chronos-2 | No disponible en la información | No disponible | Pronóstico de series temporales general | No disponible | Usado como modelo base externo, no incluido |
| TimesFM 2.5 | No disponible en la información | No disponible | Pronóstico de series temporales general | No disponible | Usado como modelo base externo, no incluido |
| PWM-W Delhi v0.1 | No disponible en la información | No disponible | Versión previa del mismo modelo | Apache-2.0 | Hugging Face (modelo #19 de la serie) |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada. La comparación con Chronos-2 y TimesFM 2.5 es estructural: PWM-W Delhi v0.2 depende de ellos como entrada, no compite directamente con ellos.

## Limitaciones y advertencias

- El modelo está especializado exclusivamente en PM2.5 y en la red de 39 estaciones de Delhi; no es generalizable a otros contaminantes, ciudades o regiones sin reentrenamiento.
- Los pesos de los modelos fundacionales externos (Chronos-2, TimesFM 2.5) no se incluyen en el repositorio, por lo que el modelo no es autónomo: requiere disponer de esos modelos para reproducir el pipeline híbrido completo.
- Los datos de entrenamiento no se distribuyen; solo se documentan sus fuentes y términos en `DATA_SOURCES.md`, lo que limita la reproducibilidad exacta del entrenamiento.
- No se han publicado métricas de rendimiento en la información disponible, por lo que no es posible evaluar su precisión real frente a alternativas.
- Riesgo de alucinación no aplica en el sentido habitual (no genera texto), pero sí existe riesgo de predicciones erróneas si la topología de estaciones cambia (estaciones fuera de servicio, reubicadas o con calibración distinta).
- Dependencia de la calidad de los pronósticos meteorológicos de Open-Meteo del día anterior: errores en esas variables exógenas se propagan al pronóstico de PM2.5.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, sin validación independiente por parte de la comunidad.
- Licencia Apache-2.0 permite uso comercial, pero el autor no ofrece garantías sobre el rendimiento en producción.
- La model card no especifica sesgos conocidos; al ser un modelo numérico, los sesgos relevantes serían de cobertura geográfica (solo Delhi) y de representatividad de la red CPCB.

## Enlaces

- Hugging Face: https://huggingface.co/PARADOXAIlabs/pwm-w-delhi-v0.2
- Repositorio GitHub: https://github.com/paradoxailab/paradox-world-model
- Registro de la versión (rama delhi-v0.2): https://github.com/paradoxailab/paradox-world-model/blob/delhi-v0.2/README.md
- Índice de la serie: https://github.com/paradoxailab/paradox-world-model/blob/main/models/series/README.md
- Fuentes de datos: https://github.com/paradoxailab/paradox-world-model/blob/main/DATA_SOURCES.md
- Citación: https://github.com/paradoxailab/paradox-world-model/blob/main/CITATION.cff
- Modelo anterior (#19 PWM-W Delhi v0.1): https://huggingface.co/PARADOXAIlabs/pwm-w-delhi-v0.1
- Modelo siguiente (#21 PWM-W Weather v0.3): https://huggingface.co/PARADOXAIlabs/pwm-w-weather-v0.3-cpcb
- Todos los modelos de la serie: https://huggingface.co/PARADOXAIlabs/paradox-world-model-series
- Sitio web del autor: https://paradoxailab.com
