# PARADOXAIlabs/pwm-w-weather-v0.4-wmo

## Resumen

PWM-W Weather v0.4 (identificador `pwm-w-weather-v0.4-wmo`) es un modelo de predicción meteorológica espacio-temporal desarrollado por ParadoxAI Lab (Aditya Kumar y Anupam Singh) dentro de la serie Paradox World Model, que agrupa 56 modelos publicados de los números 01 al 59. Este ejemplar concreto es el numero 24 de la serie y se enmarca en la familia PWM-W, especializada en forecasting meteorológico a corto plazo. El modelo resuelve la tarea de predecir las próximas 24 horas de temperatura, humedad y viento a partir de datos de estaciones sinópticas de la Organización Meteorológica Mundial (WMO) situadas en la India.

Se trata de un modelo de tamano muy reducido, con 932.348 parámetros, entrenado el 7 de noviembre de 2026 en una instancia GPU de Kaggle y publicado diez días después. La relevancia de esta versión radica en dos cambios técnicos concretos respecto a versiones anteriores: la incorporación de una corrección aprendida de tipo híbrido y la aplicación de la regla "issued-before-start" (emisión antes del inicio del intervalo predicho). Según la model card, en configuración híbrida con METAR supera a ECMWF AIFS en un 4,4 % en temperatura.

Los pesos se distribuyen en un único fichero PyTorch de 3,8 MB con licencia Apache-2.0. El modelo no incluye los modelos externos que participan en el esquema híbrido, solo los pesos propios entrenados por ParadoxAI Lab. La información pública disponible es notablemente escasa: no se detallan benchmarks completos, idiomas soportados ni especificaciones de arquitectura más allá de lo que se puede inferir del checkpoint.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo espacio-temporal propietario, pesos en PyTorch state dict) |
| Parametros totales | 932.348 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (la tarea es numérica, no lingüística) |
| Licencia | Apache-2.0 |
| Formato de pesos | PyTorch (`.pt`, state dict dentro de un dict con claves `meta`, `weights`, `results`, `cfg`) |
| Tamano del repositorio | 0,0 GB (fichero de 3.848.989 bytes) |
| Tarea (pipeline) | time-series-forecasting |
| Dominio | meteorología, estaciones sinópticas WMO en India |
| Horizonte de predicción | próximas 24 horas |
| Variables predichas | temperatura, humedad, viento |
| Fecha de entrenamiento | 2026-11-07 (run `pwm-weather-v04-gpu` en Kaggle) |
| Fecha de publicación | 2026-11-17 |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna más allá de indicar que se trata de un modelo de la familia PWM-W (Paradox World Model, rama weather) y que el código de arquitectura correspondiente a esta versión está en la rama `delhi-v0.4` del repositorio GitHub del proyecto. El checkpoint incluye la configuración de entrenamiento en la clave `ck['cfg']`, pero esa información no se reproduce en la documentación pública. Por el tamano (menos de un millón de parámetros) y la tarea (series temporales espacio-temporales sobre estaciones), cabe esperar una red ligera específicamente disenada para datos tabulares/secuenciales, aunque no se confirma en la información disponible.

En cuanto a los datos, se entrenó con observaciones de estaciones sinópticas WMO en la India procedentes de NOAA ISD (Integrated Surface Database). No se especifica el número de tokens ni de pasos de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO (poco probables en un modelo de forecasting numérico). La innovación técnica destacada en esta versión es doble: por un lado, una corrección aprendida que combina la salida del modelo con predicciones de modelos externos en un esquema híbrido; por otro, la regla "issued-before-start", que impone que la predicción se emita antes del inicio del intervalo que se va a predecir, evitando fugas de información temporal. El modelo no incluye los modelos externos del híbrido, solo los pesos propios.

## Capacidades

- Predicción de temperatura, humedad y viento a 24 horas vista sobre estaciones meteorológicas de la India.
- Forecasting espacio-temporal: aprovecha la estructura geográfica de la red de estaciones WMO.
- Modo híbrido: puede combinarse con salidas de modelos externos (por ejemplo METAR) mediante una corrección aprendida.
- Regla de emisión estricta: las predicciones se generan antes del inicio del intervalo predicho, lo que permite evaluarlas como un pronóstico operativo real.
- Comparación declarada con modelos meteorológicos de referencia (ECMWF AIFS) en el marco de la "WMO league" del proyecto.
- No soporta tool calling, function calling ni razonamiento multi-paso en el sentido de los LLM: es un modelo numérico de series temporales.
- No se documentan capacidades multilingües, de visión, audio ni modo "thinking".

## Casos de uso

- Predicción operativa local de temperatura a 24 h: el modelo genera la temperatura esperada para las próximas 24 horas en estaciones WMO de la India, con un coste computacional mínimo (menos de un millón de parámetros) que permite ejecutarlo en CPU.
- Nowcasting de humedad para agricultura: integrado en un pipeline que consuma observaciones NOAA ISD, permite anticipar condiciones de humedad relevantes para planificación de riego o riesgo de enfermedades fúngicas en cultivos.
- Estimación de viento para operaciones al aire libre: planificación de actividades en obra, logística o eventos al aire libre con antelación de un día.
- Componente de un ensemble híbrido: combinado con modelos como METAR o ECMWF AIFS mediante la corrección aprendida, sirve como miembro barato de un ensemble que mejora la predicción de temperatura (la model card reporta una mejora del 4,4 % frente a AIFS en configuración híbrida).
- Investigación en modelos del mundo (world models): útil como banco de pruebas reproducible de bajo coste para experimentar con reglas de emisión, correcciones híbridas y evaluación contra referencias operativas.
- Docencia y prototipado en forecasting espacio-temporal: su tamano (3,8 MB) y licencia Apache-2.0 permiten incluirlo en cursos, cuadernos de Kaggle o demos sin infraestructura dedicada.
- Validación de pipelines de datos meteorológicos: sirve para verificar la integridad y el preprocesado de feeds NOAA ISD antes de invertir en modelos mayores.

## Benchmarks y rendimiento

La model card no publica una tabla de benchmarks con métricas estándar (MMLU, HumanEval, GSM8K no aplican a este dominio). El único dato cuantitativo declarado es la comparación en configuración híbrida con METAR frente a ECMWF AIFS, con una mejora del 4,4 % en temperatura. El resto de resultados se remite al README de la rama `delhi-v0.4` del repositorio GitHub, que no se reproduce en la información proporcionada.

| Referencia | Métrica | Resultado declarado |
|---|---|---|
| ECMWF AIFS (configuración híbrida con METAR) | Temperatura | Mejora del 4,4 % a favor de PWM-W v0.4 WMO (según model card) |
| Resto de benchmarks | no disponible | no disponible |

No se han publicado resultados de benchmarks adicionales en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB; el checkpoint pesa 3,8 MB y el modelo tiene 932.348 parámetros, por lo que cabe holgadamente en cualquier GPU consumer e incluso en CPU.
- GPU recomendadas: cualquier GPU moderna sirve; no se requiere A100, H100 ni RTX 4090. Una GPU integrada o una CPU reciente son suficientes para inferencia individual.
- Cabe en GPU consumer: sí, en cualquier modelo (GTX 1050, RTX 3060, RTX 4090, etc.), y también en Raspberry Pi o entornos sin GPU.
- Opciones de despliegue: carga directa con `torch.load` (el propio README muestra el snippet con `hf_hub_download`); no se documenta soporte para vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de modelo. El código de arquitectura está en el repositorio GitHub del proyecto.
- Latencia y throughput estimados: no disponibles en la información proporcionada; por el tamano, se espera latencia de milisegundos en CPU para una estación individual.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PWM-W Weather v0.4 WMO (este modelo) | 932.348 | no disponible | Forecasting 24 h temp/humedad/viento, India | Apache-2.0 | Hugging Face, pesos `.pt` |
| PWM-W Weather v0.4 CPCB (versión previa, #23) | no disponible en la información | no disponible | Forecasting meteorológico | Apache-2.0 | Hugging Face |
| PWM-W Weather v0.5 METAR (versión siguiente, #25) | no disponible en la información | no disponible | Forecasting meteorológico | Apache-2.0 | Hugging Face |
| ECMWF AIFS | no disponible | no disponible | Forecasting meteorológico global | no disponible | Referencia operativa citada en la model card |

No se dispone de datos de rendimiento comparables entre estas variantes en la información proporcionada; la única comparación cuantitativa es la mejora del 4,4 % en temperatura frente a ECMWF AIFS en configuración híbrida.

## Limitaciones y advertencias

- Cobertura geográfica restringida: entrenado con estaciones WMO de la India; su uso fuera de esa región no está validado.
- Horizonte limitado: solo predice las próximas 24 horas; no es adecuado para pronósticos a medio o largo plazo.
- Variables limitadas: temperatura, humedad y viento; no cubre precipitación, presión, radiación ni otras variables meteorológicas.
- Dependencia de datos externos: la corrección híbrida requiere modelos externos (METAR, etc.) que no se incluyen en el repositorio; sin ellos, el rendimiento puede diferir del reportado.
- Documentación incompleta: no se publican benchmarks completos, arquitectura detallada, número de tokens de entrenamiento ni composición exacta del dataset; la evaluación rigurosa requiere consultar el repositorio GitHub.
- Riesgo de sobreajuste a la red de estaciones de entrenamiento: con menos de un millón de parámetros y un dominio acotado, la generalización a estaciones nuevas o a regímenes climáticos no vistos no está garantizada.
- Sin datos sobre sesgos: no se documentan sesgos conocidos, pero al entrenar solo con estaciones indias puede infrarepresentar microclimas locales.
- Riesgo de alucinación en sentido meteorológico: como todo modelo numérico, puede producir predicciones plausibles pero incorrectas en eventos extremos o fuera de distribución.
- Licencia Apache-2.0: permite uso comercial y modificación con atribución; no se identifican restricciones adicionales, pero conviene revisar `DATA_SOURCES.md` para las condiciones de los datos de entrenamiento (NOAA ISD), que no se distribuyen con el modelo.
- Estado "reported": la model card indica que los resultados están registrados pero no auditados de forma independiente; tratar las cifras como declaraciones del autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/PARADOXAIlabs/pwm-w-weather-v0.4-wmo
- Repositorio GitHub del proyecto: https://github.com/paradoxailab/paradox-world-model
- README de la rama delhi-v0.4 (reglas, predicciones y resultados): https://github.com/paradoxailab/paradox-world-model/blob/delhi-v0.4/README.md
- Índice de la serie completa: https://github.com/paradoxailab/paradox-world-model/blob/main/models/series/README.md
- Fuentes y condiciones de los datos: https://github.com/paradoxailab/paradox-world-model/blob/main/DATA_SOURCES.md
- Citación (CITATION.cff): https://github.com/paradoxailab/paradox-world-model/blob/main/CITATION.cff
- Versión previa (#23, v0.4 CPCB): https://huggingface.co/PARADOXAIlabs/pwm-w-weather-v0.4-cpcb
- Versión siguiente (#25, v0.5 METAR): https://huggingface.co/PARADOXAIlabs/pwm-w-weather-v0.5-metar
- Índice de todos los modelos de ParadoxAI Labs: https://huggingface.co/PARADOXAIlabs/paradox-world-model-series
- Sitio web del laboratorio: https://paradoxailab.com
