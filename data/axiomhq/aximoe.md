# axiomhq/aximoe

## Resumen

Aximö es un modelo de predicción de series temporales desarrollado por Axiom, la empresa detrás de la plataforma de observabilidad homónima. Está entrenado específicamente sobre telemetría propia para pronosticar métricas de contenedores en entornos Kubernetes y OpenTelemetry. El modelo lee las últimas 2.032 muestras de una serie y devuelve las siguientes 16 como una banda de 15 cuantiles, desde el percentil 1 hasta el 99,9. Cualquier valor fuera de esa banda constituye una anomalía, y las anomalías agregadas entre contenedores de un clúster son precisamente la señal que se busca durante una investigación de incidentes.

La arquitectura es un transformer de bloques con tan solo 4.036.464 parámetros, lo que lo sitúa en la categoría de modelos pequeños y altamente especializados. Su innovación principal no reside en el tamaño, sino en el uso de dos etiquetas aprendidas que se suman a cada bloque de 16 muestras antes de entrar en el transformer: una fila que identifica el canal (la métrica concreta, entre 36 métricas de contenedor más `unknown`) y otra que identifica la resolución (el intervalo de muestreo, entre 10 s, 30 s, 1, 2, 5, 10, 15, 20 y 30 min, 1 h, más `unknown`). Esto permite que el modelo distinga series con el mismo aspecto estadístico pero comportamiento físico muy distinto.

La relevancia actual del modelo radica en su enfoque: frente a modelos genéricos de forecasting como Toto 2.0 o Chronos-2, que reciben únicamente los valores de la serie, Aximö incorpora metadatos semánticos del dominio de observabilidad. Se distribuye con licencia Apache 2.0 y con un servidor MCP que expone una herramienta `container_metric_outliers` para que agentes de investigación de incidentes puedan consultar qué contenedores se comportaron de forma anómala en un momento dado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer de bloques (patch-based) con embeddings de etiqueta de canal y resolución |
| Parámetros totales | 4.036.464 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 2.032 muestras de entrada; 16 muestras de salida por paso |
| Tipos de cuantización | No disponible |
| Idiomas soportados | No disponible (modelo numérico de series temporales, no lingüístico) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`model.safetensors`) + configuración en `model.json` |

## Arquitectura y entrenamiento

Aximö es un transformer de bloques que procesa la serie de entrada en parches (tiles) de 16 muestras. Cada bloque se embebe y se le suman dos vectores aprendidos: la fila correspondiente al canal de la métrica (36 métricas de contenedor más `unknown`) y la fila correspondiente a la resolución de muestreo (10 s, 30 s, 1, 2, 5, 10, 15, 20, 30 min, 1 h, más `unknown`). El modelo lee 2.032 muestras (127 bloques de 16) y emite 16 pasos de predicción, cada uno con 15 niveles de cuantil del 1 al 99,9 por ciento. Para horizontes superiores a 16 muestras, el modelo se alimenta de su propia salida de forma autorregresiva.

El entrenamiento se realizó sobre telemetría propia de Axiom, con series de métricas de contenedor exportadas por cAdvisor y kube-state-metrics: uso de CPU, throttling y burst, memoria working set, RSS, caché y fallos de asignación, tasas de red y sistema de ficheros, pressure stall de CPU, memoria y E/S, procesos, hilos y sockets, reinicios y OOM kills. Durante el entrenamiento, cada etiqueta se sustituye por su fila `unknown` en el 10 por ciento de los bloques, de forma independiente entre canal y resolución, de modo que el modelo sigue operando con filas entrenadas cuando desconoce la métrica o el intervalo. El autor documenta que la fila por métrica mejora entre un 3 y un 5 por ciento el interval score de la banda 10-90 por ciento en métricas "silenciosas" (las que valen cero la mayor parte del tiempo), con un coste de como máximo el 0,7 por ciento en métricas "ocupadas". No se especifica en la información disponible el número total de tokens de entrenamiento ni si se aplicaron técnicas de RLHF o DPO (poco probables en un modelo numérico de este tipo).

## Capacidades

- Predicción de series temporales univariantes: lee 2.032 muestras y emite 16 pasos con 15 cuantiles (del percentil 1 al 99,9).
- Forecasting probabilístico: la salida es una banda de cuantiles, no un valor puntual, lo que permite detectar anomalías como valores fuera de banda.
- Condicionamiento por tipo de métrica: 36 canales de métricas de contenedor Kubernetes (CPU, memoria, red, E/S, pressure stall, procesos, reinicios, OOM kills) más `unknown`.
- Condicionamiento por resolución: 9 intervalos de muestreo más `unknown`.
- Selección automática de canal (`--tag auto`): para métricas desconocidas, prueba el contexto bajo cada una de las 36 filas de canal más `unknown` y retiene la que mejor pronostica el pasado de la propia serie.
- Forecasting autorregresivo más allá de 16 pasos: alimenta su propia salida para horizontes mayores.
- Integración con agentes mediante servidor MCP con la herramienta `container_metric_outliers`, que responde qué contenedores se comportaron de forma anómala en un momento dado.
- Capacidades multilingües: no aplica (modelo numérico).
- Tool calling / function calling: no en el sentido de LLM; la interfaz es el script `forecast.py` y el servidor MCP.

## Casos de uso

- Investigación de incidentes en Kubernetes: dado un momento concreto, un dataset de MetricsDB en Axiom y una expresión regular sobre nombres de contenedor, el servidor MCP `container_metric_outliers` devuelve qué contenedores se salieron de su banda de predicción, señalando los candidatos a causa raíz.
- Detección de anomalías en producción: comparar cada valor observado con su banda de cuantiles 1-99,9 por ciento; un valor fuera de banda es una sorpresa estadística que puede disparar una alerta o una consulta de diagnóstico.
- Planificación de capacidad: pronosticar métricas de CPU, memoria y E/S de contenedores a corto plazo (16 pasos por invocación, extensible de forma autorregresiva) para anticipar saturación antes de que ocurra.
- Correlación entre contenedores de un clúster: al ejecutar el modelo sobre todas las series de un clúster y agregar las sorpresas, se identifican patrones de fallo que afectan a múltiples servicios simultáneamente.
- Monitorización de métricas "silenciosas": métricas que valen cero la mayor parte del tiempo (reinicios, OOM kills, fallos de asignación) se benefician del canal específico, que mejora su interval score entre un 3 y un 5 por ciento frente a no usar etiqueta.
- Enriquecimiento de pipelines de observabilidad: integrar el script `forecast.py` en un pipeline que lea series de OpenTelemetry y escriba bandas de cuantiles en un almacén de series temporales para su consulta posterior por dashboards o SLOs.
- Automatización de guardias (on-call): un agente que, ante una alerta, consulte la herramienta MCP para obtener una lista priorizada de contenedores anómalos y acelere el triaje.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor menciona comparaciones internas del efecto de las etiquetas (mejora del 3 al 5 por ciento en el interval score de la banda 10-90 por ciento para métricas silenciosas, coste máximo del 0,7 por ciento en métricas ocupadas, y superioridad de una fila por métrica frente a tablas más gruesas), pero no se proporcionan cifras de MMLU, HumanEval, GSM8K ni de benchmarks estándar de forecasting como MASE, sMAPE o CRPS sobre datasets públicos.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB, dado que el modelo tiene 4.036.464 parámetros; en fp32 ocupa aproximadamente 16 MB, en fp16 unos 8 MB.
- GPU recomendadas: cualquier GPU moderna es sobredimensionada; una RTX 3060 o incluso una GPU integrada es suficiente. Para lotes grandes de series en paralelo, una RTX 4090 o una A100 permiten mayor throughput.
- Cabe en GPU de consumo: sí, en cualquier GPU de consumo de la última década, e incluso en CPU para volúmenes moderados.
- Opciones de despliegue: el autor proporciona `forecast.py` (Python 3.12 o superior, gestionado con `uv`) y un servidor MCP en el repositorio de GitHub `axiomhq/aximoe`. No se mencionan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo numérico de este tipo.
- Latencia y throughput estimados: no disponibles en la información proporcionada. Dado el tamaño del modelo y la ventana de 2.032 muestras, se espera una latencia muy baja por serie, pero no se aportan cifras concretas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto de entrada | Salida | Condicionamiento por metadatos | Licencia |
|---|---|---|---|---|---|
| Aximö (axiomhq/aximoe) | 4.036.464 | 2.032 muestras | 16 pasos × 15 cuantiles | Sí (canal + resolución) | Apache 2.0 |
| Toto 2.0 | No disponible | No disponible | No disponible | No (solo valores) | No disponible |
| Chronos-2 | No disponible | No disponible | No disponible | No (solo valores) | No disponible |

La información disponible únicamente menciona a Toto 2.0 y Chronos-2 como modelos comparables, señalando que ambos reciben solo los valores de la serie y pueden leer otras series del mismo sistema a su lado, mientras que Aximö aprende de las etiquetas qué tipo de serie está leyendo. No se proporcionan parámetros, contextos, licencias ni resultados de benchmarks de esos dos modelos en la información disponible, por lo que la comparación cuantitativa no es posible.

## Limitaciones y advertencias

- Modelo univariante: lee una serie a la vez; no explota directamente correlaciones entre series del mismo sistema, a diferencia de Toto 2.0 y Chronos-2, que pueden leer otras series del mismo sistema a su lado.
- Dominio restringido: entrenado sobre telemetría de Axiom para métricas de contenedor Kubernetes y OpenTelemetry; su rendimiento fuera de ese dominio (series financieras, sensores industriales, tráfico de red no-container) no está documentado.
- Vocabulario cerrado de canales y resoluciones: solo 36 métricas de contenedor y 9 intervalos de muestreo; cualquier métrica o intervalo fuera de esas listas cae en la fila `unknown`, con posible pérdida de precisión.
- Horizonte corto por invocación: 16 pasos por llamada; los pronósticos más lejanos requieren alimentar la propia salida, con la acumulación de error que ello implica.
- Riesgo de alucinación: en un modelo numérico se traduce en bandas de cuantiles mal calibradas o excesivamente estrechas en regímenes no vistos durante el entrenamiento, lo que generaría falsos positivos o falsos negativos en la detección de anomalías.
- Sesgos conocidos: no documentados en la información disponible; cabe esperar un sesgo hacia los patrones presentes en la telemetría de Axiom y hacia las métricas "ocupadas" frente a las "silenciosas", aunque el autor reporta mitigación mediante la etiqueta de canal.
- Licencia Apache 2.0: permite uso comercial, modificación y redistribución con atribución y sin garantías; no se identifican restricciones adicionales en la información disponible.
- Madurez: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, y la revisión publicada es `aximoe-261123`; se trata de un modelo reciente y de nicho, con una comunidad aún inexistente.
- Dependencia de código externo: la inferencia requiere clonar el repositorio de GitHub y usar Python 3.12 o superior con `uv`; no hay integración directa con frameworks de inferencia estándar.
- Configuración manual del ancho de bloque: en un proceso Python hay que definir la variable de entorno `AXIMOE_PATCH` antes de importar el módulo, lo que añade un paso propenso a error.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/axiomhq/aximoe
- Repositorio de código: https://github.com/axiomhq/aximoe
- Documentación de las etiquetas: https://github.com/axiomhq/aximoe/blob/main/docs/methods/tags.md
- Plataforma Axiom: https://axiom.co
- Protocolo MCP: https://modelcontextprotocol.io
