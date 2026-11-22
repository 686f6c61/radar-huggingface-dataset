# PARADOXAIlabs/pwm-w-weather-v0.4-cpcb

## Resumen

PWM-W Weather v0.4 (CPCB) es un modelo de predicción meteorológica espacio-temporal desarrollado por ParadoxAI Lab (Aditya Kumar y Anupam Singh) dentro de su serie Paradox World Model, concretamente el modelo número 23 de 56 publicados. Resuelve una tarea acotada: pronosticar las próximas 24 horas de temperatura, humedad y viento a partir de la meteorología registrada en 25 estaciones de la red CPCB/DPCC de Delhi (India). No es un modelo de lenguaje: es un modelo numérico de series temporales con 2.385.504 parámetros, entrenado sobre datos de estaciones terrestres y publicado bajo licencia Apache-2.0.

La relevancia del modelo no reside en su tamaño, sino en su planteamiento metodológico: incorpora una corrección aprendida en modo híbrido y una regla de "emitido antes del inicio" (*issued-before-start*) para evitar fuga de información temporal, y el autor reporta que, en modo puro, supera a IFS 0.25, IFS 9 km y GFS en las tres variables, aunque pierde frente a Chronos-2 entre un 6,0 % y un 8,3 %. En configuración híbrida con METAR, el autor reporta una mejora del -4,4 % en temperatura frente a ECMWF AIFS.

El repositorio de Hugging Face tiene 0 descargas y 0 likes en el momento de la consulta, con un tamaño de 0,0 GB (el único artefacto pesa 9.755.643 bytes). La información pública es escasa y proviene casi exclusivamente de la model card y del repositorio de GitHub asociado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de series temporales espacio-temporal; el código está en el repositorio de GitHub, no detallado en la model card) |
| Parámetros totales | 2.385.504 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (horizonte de predicción de 24 h; ventana de entrada no especificada) |
| Tipos de cuantización | no disponible (pesos en PyTorch `state_dict`; sin versiones GGUF/INT8 publicadas) |
| Idiomas soportados | no disponible (no es un modelo lingüístico; datos de estaciones en India) |
| Licencia | Apache-2.0 |
| Formato de pesos | PyTorch `.pt` (`23_pwm-w_weather_v0.4_cpcb.pt`, 9.755.643 bytes, SHA-256 `3c05a7538662e4af7dd89400d2e8750420a35e041ab80d50f1c14f5dc2ac95f0`) |

## Arquitectura y entrenamiento

La model card no detalla la arquitectura interna; indica que el código de arquitectura de esta versión está en el repositorio de GitHub (`paradoxailab/paradox-world-model`, rama `delhi-v0.4`) y que la configuración de entrenamiento se guarda dentro del propio archivo de pesos en la clave `ck['cfg']`. Se describe como un modelo espacio-temporal de pronóstico con un componente de "corrección aprendida" (*learned-correction hybrid*) y una regla de validación denominada *issued-before-start*, que impone que las predicciones se emitan antes del inicio del periodo pronosticado para evitar contaminación por información futura.

Los datos de entrenamiento son la meteorología de estaciones de la red CPCB/DPCC de Delhi, con 25 estaciones. El entrenamiento se realizó el 2026-11-07 en un cuaderno de Kaggle denominado `pwm-weather-v04-gpu`. Los datos de entrenamiento no se distribuyen con el modelo; sus fuentes y términos se documentan en `DATA_SOURCES.md` del repositorio. No se especifica en la información disponible el número de tokens, la composición exacta del dataset, ni si hubo RLHF/DPO (no aplicable en el sentido habitual a un modelo de series temporales).

## Capacidades

- Pronóstico de las próximas 24 horas de temperatura, humedad y viento.
- Modelado espacio-temporal sobre una red de 25 estaciones meteorológicas de Delhi.
- Modo híbrido: combinación de su salida con pronósticos de modelos externos mediante una corrección aprendida.
- Regla *issued-before-start* para pronósticos operativos sin fuga temporal.
- Integración declarada con datos METAR en configuración híbrida.
- No dispone de generación de texto, razonamiento, código, matemáticas, visión, audio, tool calling ni capacidades de agente.
- Capacidades multilingües: no aplica.

## Casos de uso

- Pronóstico operativo local en Delhi: generar las próximas 24 h de temperatura, humedad y viento para las 25 estaciones CPCB/DPCC, con un coste computacional mínimo (2,4 M de parámetros).
- Benchmarking de modelos meteorológicos: usar el modelo como referencia ligera frente a IFS, GFS o Chronos-2 en la región de Delhi, replicando la comparativa reportada por el autor.
- Corrección de sesgo de modelos globales: emplear el componente de corrección aprendida para ajustar las salidas de IFS 0.25, IFS 9 km o GFS a la realidad de las estaciones locales.
- Investigación sobre validación temporal: la regla *issued-before-start* sirve como ejemplo reproducible de protocolo de evaluación sin fuga de información en series temporales.
- Prototipado en entornos con recursos limitados: el tamaño del checkpoint (menos de 10 MB) permite ejecutarlo en CPU o en GPU de consumo para experimentos rápidos.
- Análisis de fiabilidad en salud pública y agricultura local: la humedad y la temperatura a 24 h son variables relevantes para planificación de riego o alertas de confort térmico en la región.
- Educación y reproducibilidad: modelo pequeño con pesos y metadatos embebidos (`meta`, `weights`, `results`, `cfg`) útil para enseñar pipelines de pronóstico y evaluación.

## Benchmarks y rendimiento

Los únicos datos disponibles son los reportados por el autor en la model card, sin tabla numérica completa:

| Comparación | Resultado reportado |
|---|---|
| Frente a IFS 0.25, IFS 9 km y GFS (CPCB, modelo puro) | Supera a los tres en temperatura, humedad y viento |
| Frente a Chronos-2 | Pierde por un 6,0–8,3 % |
| Frente a ECMWF AIFS (híbrido con METAR) | Mejora del -4,4 % en temperatura |

No se han publicado resultados de benchmarks detallados (tablas por variable, métricas como MAE o RMSE) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB; el checkpoint pesa 9,76 MB y el modelo tiene 2,39 M de parámetros.
- GPU recomendadas: cualquier GPU moderna es suficiente; el entrenamiento se ejecutó en una GPU de Kaggle (cuaderno `pwm-weather-v04-gpu`).
- Cabe en GPU de consumo: sí, en cualquier GPU consumer (RTX 3060, RTX 4090, etc.) e incluso en CPU.
- Opciones de despliegue: PyTorch nativo mediante `torch.load` y `huggingface_hub.hf_hub_download`; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / horizonte | Rendimiento relativo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PWM-W Weather v0.4 (CPCB) | 2,39 M | 24 h | Supera a IFS 0.25, IFS 9 km y GFS; pierde 6,0–8,3 % frente a Chronos-2 | Apache-2.0 | Hugging Face (0 descargas) |
| Chronos-2 | no disponible | no disponible | Mejor que PWM-W v0.4 en la comparativa del autor | no disponible | no disponible |
| IFS 0.25 (ECMWF) | no disponible | no disponible | Peor que PWM-W v0.4 en las tres variables según el autor | no disponible | Servicio ECMWF |
| GFS (NOAA) | no disponible | no disponible | Peor que PWM-W v0.4 en las tres variables según el autor | no disponible | Servicio NOAA |

Los datos de los modelos comparables no se detallan en la información proporcionada; las cifras de rendimiento relativas son las reportadas por el autor del modelo, no verificadas de forma independiente.

## Limitaciones y advertencias

- Ámbito geográfico restringido: entrenado exclusivamente con estaciones de Delhi (India); no se garantiza su validez en otras regiones.
- Horizonte limitado a 24 h y a tres variables (temperatura, humedad, viento).
- Rendimiento no verificado de forma independiente: las comparativas frente a IFS, GFS, Chronos-2 y AIFS son afirmaciones del autor en la model card.
- El modo híbrido depende de modelos externos que no se incluyen en el repositorio; solo se distribuyen los pesos propios.
- Los datos de entrenamiento no se distribuyen; la reproducibilidad completa depende de las fuentes documentadas en `DATA_SOURCES.md`.
- Riesgo de sobreajuste a la red CPCB/DPCC y a las condiciones climáticas del periodo de entrenamiento.
- Sin información sobre sesgos, calibración de incertidumbre ni evaluación en eventos extremos.
- Licencia Apache-2.0 permite uso comercial, pero sin garantías; el autor no ofrece SLA ni soporte.
- Repositorio con 0 descargas y 0 likes: ecosistema de validación prácticamente inexistente.
- No es un modelo de lenguaje: no debe evaluarse con métricas de NLP ni usarse para tareas de texto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/PARADOXAIlabs/pwm-w-weather-v0.4-cpcb
- Repositorio GitHub (rama delhi-v0.4): https://github.com/paradoxailab/paradox-world-model/blob/delhi-v0.4/README.md
- Índice de la serie: https://github.com/paradoxailab/paradox-world-model/blob/main/models/series/README.md
- Fuentes de datos: https://github.com/paradoxailab/paradox-world-model/blob/main/DATA_SOURCES.md
- Citación: https://github.com/paradoxailab/paradox-world-model/blob/main/CITATION.cff
- Modelo anterior (#22): https://huggingface.co/PARADOXAIlabs/pwm-w-weather-v0.3-wmo
- Modelo siguiente (#24): https://huggingface.co/PARADOXAIlabs/pwm-w-weather-v0.4-wmo
- Todos los modelos de la serie: https://huggingface.co/PARADOXAIlabs/paradox-world-model-series
- Sitio del autor: https://paradoxailab.com
