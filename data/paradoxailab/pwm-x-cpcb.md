# paradoxailab/pwm-x-cpcb

## Resumen

PWM-X (v0.9) es un modelo de predicción de series temporales espaciotemporales desarrollado por ParadoxAI Lab (Aditya Kumar, Anupam Singh) dentro de su familia PWM-W, que forma parte de la serie Paradox World Model. El modelo aborda la predicción a 24 horas de tres variables meteorológicas —temperatura, humedad y viento— a partir de datos de estaciones de calidad del aire y meteorología en India. Con 1.260.997 parámetros, es un modelo extremadamente compacto orientado a un dominio geográfico y una tarea muy concretos.

La relevancia del modelo reside en su enfoque de "modelo del mundo" aplicado a datos locales: combina observaciones de la red CPCB/DPCC de Delhi (25 estaciones), estaciones sinópticas WMO de India (NOAA ISD) y reportes METAR de seis aeropuertos indios, incluido Delhi Palam. El autor documenta un estudio de umbral de datos que indica que se necesitan aproximadamente 24 meses de historia local para no quedar por detrás de TimesFM/Chronos, y unos 48 meses para superarlos.

Se publica bajo licencia Apache-2.0 y en formato PyTorch (`.pt`), con los pesos y metadatos empaquetados en un único archivo de 5.589.589 bytes. El modelo se entrenó el 9 de noviembre de 2026 y se publicó el 17 de noviembre de 2026.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo espaciotemporal de forecasting; código en repositorio GitHub) |
| Parametros totales | 1.260.997 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (predicción de horizonte fijo de 24 h) |
| Tipos de cuantizacion | no disponible (pesos en PyTorch float; sin variantes GGUF/cuantizadas publicadas) |
| Idiomas soportados | no disponible (modelo numérico de series temporales, sin procesamiento de lenguaje) |
| Licencia | Apache-2.0 |
| Formato de pesos | PyTorch (`.pt`, state dict dentro de un checkpoint con claves `meta`, `weights`, `results`, `cfg`) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna más allá de su carácter espaciotemporal y su pertenencia a la familia PWM-W. El modelo se describe como un "cross-network model" (modelo entre redes), lo que sugiere que integra información de distintas redes de observación: estaciones de calidad del aire CPCB/DPCC, estaciones sinópticas WMO vía NOAA ISD y reportes METAR de aeropuertos. El código de arquitectura está en el repositorio de GitHub del proyecto y la configuración de entrenamiento se almacena en la clave `ck['cfg']` del propio checkpoint.

Los datos de entrenamiento no se distribuyen con el modelo; sus fuentes y términos se documentan en `DATA_SOURCES.md`. El autor reporta un estudio de umbral de datos: con aproximadamente 24 meses de historia local el modelo deja de perder frente a TimesFM y Chronos, y con aproximadamente 48 meses los supera. No se especifica el número total de tokens ni la composición exacta del dataset, ni si se emplearon técnicas de RLHF o DPO (no aplicables a un modelo de forecasting numérico).

## Capacidades

- Predicción a 24 horas de temperatura, humedad y viento.
- Modelado espaciotemporal conjunto de múltiples estaciones (25 estaciones CPCB/DPCC de Delhi, estaciones WMO de India y seis aeropuertos con METAR).
- Integración de fuentes heterogéneas de observación meteorológica (calidad del aire, sinóptica y aviación).
- Forecasting de series temporales multivaridado en un dominio geográfico concreto (India, con foco en Delhi).
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso.
- No dispone de capacidades multilingües, visión, audio ni modo "thinking".
- El checkpoint incluye los resultados registrados y los logs de ejecución (`ck['results']`), lo que permite auditar el rendimiento declarado.

## Casos de uso

- Predicción meteorológica local a corto plazo en Delhi: el modelo genera el horizonte de 24 h de temperatura, humedad y viento a partir de las estaciones CPCB/DPCC, útil para planificación urbana y avisos tempranos.
- Operaciones aeroportuarias: al incorporar reportes METAR de seis aeropuertos indios, puede apoyar la planificación de turnos y la previsión de condiciones de viento en pistas.
- Gestión de calidad del aire: las estaciones CPCB aportan contexto meteorológico que influye en la dispersión de contaminantes; el modelo puede alimentar sistemas de alerta combinados.
- Investigación en modelos del mundo: su tamaño (1,26 M de parámetros) y su empaquetado con metadatos y logs lo hacen adecuado como banco de pruebas reproducible para estudiar umbrales de datos frente a TimesFM/Chronos.
- Prototipado en entornos con recursos limitados: al ser un modelo minúsculo, se puede ejecutar en CPU y desplegar en edge devices o entornos sin GPU.
- Evaluación comparativa de forecasting: sirve como línea base local frente a modelos fundacionales de series temporales en estudios de transferencia y cantidad de datos.
- Docencia y divulgación: su licencia Apache-2.0 y su estructura de checkpoint autoexplicativa facilitan su uso en cursos de series temporales y modelos espaciotemporales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor únicamente reporta un estudio cualitativo de umbral de datos (aproximadamente 24 meses para igualar a TimesFM/Chronos y aproximadamente 48 meses para superarlos), sin cifras numéricas de métricas como MAE, RMSE o MASE.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB; el checkpoint ocupa 5,59 MB y el modelo tiene 1,26 M de parámetros.
- GPU recomendadas: no requiere GPU; cualquier CPU moderna es suficiente. Una GPU consumer (RTX 3060, RTX 4090) no aporta ventaja significativa por el tamaño del modelo.
- Cabe en cualquier GPU consumer y en dispositivos de borde.
- Opciones de despliegue: PyTorch nativo cargando el `.pt` con `torch.load`; no se han publicado integraciones con vLLM, llama.cpp, Ollama o TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / horizonte | Licencia | Disponibilidad |
|---|---|---|---|---|
| PWM-X v0.9 (este modelo) | 1.260.997 | 24 h de horizonte | Apache-2.0 | Hugging Face (`.pt`) |
| TimesFM | no disponible en la información | no disponible | no disponible | no disponible |
| Chronos | no disponible en la información | no disponible | no disponible | no disponible |

La información proporcionada solo menciona TimesFM y Chronos como referencias de comparación cualitativa en el estudio de umbral de datos; no se dispone de sus especificaciones ni de resultados numéricos comparativos en esta ficha.

## Limitaciones y advertencias

- Dominio geográfico restringido: entrenado con datos de India, con foco en Delhi; su validez fuera de esa región no está documentada.
- Horizonte fijo de 24 h: no se especifica soporte para otros horizontes.
- Solo tres variables objetivo (temperatura, humedad, viento); no cubre otras variables meteorológicas ni contaminantes como salida.
- Modelo de 1,26 M de parámetros: capacidad limitada para capturar patrones complejos; el propio autor reconoce que necesita unos 48 meses de historia local para superar a TimesFM/Chronos.
- Sin datos de benchmarks numéricos publicados; el rendimiento declarado es cualitativo y debe validarse de forma independiente.
- Los datos de entrenamiento no se distribuyen; la reproducibilidad depende de las fuentes externas documentadas en `DATA_SOURCES.md`.
- Sin información sobre sesgos; al ser un modelo numérico, el riesgo de alucinación se traduce en predicciones erróneas no calibradas.
- Licencia Apache-2.0 permite uso comercial, pero se recomienda citar según `CITATION.cff`.
- Estado "reported" (no verificado de forma independiente) y versión v0.9, lo que indica madurez limitada para producción.

## Enlaces

- Hugging Face: https://huggingface.co/paradoxailab/pwm-x-cpcb
- Repositorio GitHub: https://github.com/paradoxailab/paradox-world-model
- Registro de la versión (branch delhi-v0.8): https://github.com/paradoxailab/paradox-world-model/blob/delhi-v0.8/README.md
- Índice de la serie: https://github.com/paradoxailab/paradox-world-model/blob/main/models/series/README.md
- Fuentes de datos: https://github.com/paradoxailab/paradox-world-model/blob/main/DATA_SOURCES.md
- Citación: https://github.com/paradoxailab/paradox-world-model/blob/main/CITATION.cff
- Modelo anterior (#28): https://huggingface.co/paradoxailab/pwm-w-weather-v0.8-cpcb
- Modelo siguiente (#30): https://huggingface.co/paradoxailab/pwm-w-live-v0.9
- Serie completa: https://huggingface.co/paradoxailab/paradox-world-model-series
- Sitio del autor: https://paradoxailab.com
