# paradoxailab/pwm-w-weather-v0.4-cpcb

## Resumen

PWM-W Weather v0.4 (CPCB) es un modelo de predicción meteorológica espacio-temporal desarrollado por ParadoxAI Lab, enmarcado en su serie Paradox World Model (modelo 23 de 56 publicados). El modelo resuelve una tarea concreta: predecir las próximas 24 horas de temperatura, humedad y viento a partir de datos de estaciones meteorológicas. Se entrenó sobre meteorología de 25 estaciones de la red CPCB/DPCC de Delhi (India), lo que lo convierte en un modelo de alta especialización geográfica más que en un modelo de propósito general.

Técnicamente es un modelo pequeño: 2.385.504 parámetros, distribuido como un único checkpoint de PyTorch (`23_pwm-w_weather_v0.4_cpcb.pt`, 9.755.643 bytes) que contiene pesos, configuración de entrenamiento, metadatos y los resultados registrados de la ejecución. No es un modelo de lenguaje ni un transformer generativo de texto: es un modelo de series temporales con arquitectura propia definida en el repositorio GitHub del proyecto.

Su relevancia radica en el enfoque de evaluación: el autor registra comparaciones directas contra modelos operativos de predicción numérica (IFS 0.25, IFS 9 km, GFS, ECMWF AIFS) y contra modelos fundacionales de series temporales (Chronos-2). Según la model card, el modelo puro supera a IFS y GFS en las tres variables, pero pierde frente a Chronos-2 entre un 6,0% y un 8,3%. Esta transparencia en los resultados negativos, junto con la licencia Apache-2.0 y el tamaño reducido, lo hacen útil como referencia reproducible en investigación de forecasting meteorológico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (código en repositorio GitHub del proyecto; configuración en `ck['cfg']`) |
| Parametros totales | 2.385.504 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (horizonte de predicción: 24 horas) |
| Tipos de cuantizacion | No disponible (checkpoint PyTorch en precisión de entrenamiento) |
| Idiomas soportados | No aplica (modelo de series temporales, no lingüístico) |
| Licencia | Apache-2.0 |
| Formato de pesos | PyTorch `.pt` (state dict serializado con `torch.save`) |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna. Lo que sí se sabe es que el checkpoint contiene un `state dict` de PyTorch, una configuración de entrenamiento (`ck['cfg']`), metadatos (`ck['meta']`) y los resultados y logs de la ejecución (`ck['results']`). El código de arquitectura está en el repositorio `paradoxailab/paradox-world-model`, rama `delhi-v0.4`. Por el tamaño (2,38 M de parámetros) y la tarea, se trata de un modelo compacto de forecasting espacio-temporal, no de un transformer de gran escala.

Los datos de entrenamiento son meteorología de estaciones CPCB/DPCC de Delhi (25 estaciones), con temperatura, humedad y viento como variables objetivo y un horizonte de 24 horas. El entrenamiento se ejecutó el 2026-11-07 en un kernel de Kaggle (`pwm-weather-v04-gpu`). Esta versión introduce dos cambios respecto a la anterior: una corrección híbrida aprendida (*learned-correction hybrid*) y la regla *issued-before-start* (la predicción se emite antes del inicio del horizonte, evitando fuga de información). No se especifican el número de tokens ni la composición detallada del dataset, y los datos de entrenamiento no se distribuyen con el modelo (sus fuentes y términos están en `DATA_SOURCES.md`).

## Capacidades

- Predicción de series temporales meteorológicas: próximas 24 horas de temperatura, humedad y viento.
- Modelado espacio-temporal sobre una red de 25 estaciones (CPCB/DPCC, Delhi).
- Modo híbrido: la salida del modelo puede combinarse con pronósticos de modelos externos (corrección aprendida). Los pesos de esos modelos externos no se incluyen en este repositorio.
- Evaluación contra referencias operativas: IFS 0.25, IFS 9 km, GFS, ECMWF AIFS y Chronos-2.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües, de visión, audio ni generación de texto.
- No dispone de modo *thinking* ni de decodificación especulativa.

## Casos de uso

- Predicción meteorológica local a 24 horas en Delhi: el modelo genera pronósticos de temperatura, humedad y viento para las 25 estaciones de la red CPCB/DPCC, con un coste computacional mínimo (2,38 M de parámetros) que permite ejecución en CPU.
- Investigación en forecasting espacio-temporal: sirve como referencia reproducible (pesos, configuración y logs incluidos en el checkpoint) para comparar metodologías contra IFS, GFS y Chronos-2.
- Corrección de pronósticos operativos: en modo híbrido, la salida del modelo puede combinarse con pronósticos de modelos externos para reducir el error; la model card reporta una mejora del -4,4% en temperatura frente a ECMWF AIFS en configuración híbrida con METAR.
- Prototipado rápido en entornos con recursos limitados: al ser un checkpoint de ~9,7 MB, se puede cargar y desplegar en cualquier máquina con PyTorch, sin GPU dedicada.
- Docencia y experimentación: ejemplo de pipeline completo de forecasting (datos de estaciones, horizonte de 24 h, regla *issued-before-start*, evaluación contra modelos de referencia) con licencia permisiva.
- Integración en sistemas de alerta temprana a pequeña escala: combinado con datos de estaciones en tiempo real, puede alimentar avisos de temperatura y viento en un ámbito geográfico acotado, siempre que se valide su error fuera del periodo de entrenamiento.

## Benchmarks y rendimiento

La model card registra resultados cualitativos y relativos, sin tablas numéricas completas:

| Comparación | Resultado registrado |
|---|---|
| Frente a IFS 0.25, IFS 9 km y GFS | El modelo puro supera a los tres en las tres variables (temperatura, humedad, viento) |
| Frente a Chronos-2 | El modelo pierde entre un 6,0% y un 8,3% |
| Híbrido con METAR frente a ECMWF AIFS | -4,4% de error en temperatura |

No se han publicado valores absolutos (RMSE, MAE u otras métricas) en la información disponible. Los resultados completos, las predicciones y las reglas de evaluación están en la rama `delhi-v0.4` del repositorio GitHub.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB; el checkpoint pesa 9,76 MB y el modelo tiene 2,38 M de parámetros.
- GPU recomendadas: no requiere GPU. Funciona en CPU; cualquier GPU consumer (por ejemplo, RTX 3060 o superior) es más que suficiente si se desea acelerar.
- Cabe en cualquier GPU consumer y en la mayoría de entornos sin GPU.
- Opciones de despliegue: PyTorch nativo (`torch.load` + `hf_hub_download`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Tarea | Contexto / horizonte | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PWM-W Weather v0.4 (CPCB) | 2,38 M | Forecasting meteorológico 24 h, Delhi | 24 h | Apache-2.0 | Hugging Face (pesos) + GitHub (código) |
| Chronos-2 | No disponible en la información | Modelo fundacional de series temporales | No disponible | No disponible | No disponible |
| IFS 0.25 / IFS 9 km (ECMWF) | No aplica (modelo operativo) | Predicción numérica global | No disponible | No disponible | Operativo |
| GFS (NOAA) | No aplica (modelo operativo) | Predicción numérica global | No disponible | No disponible | Operativo |
| ECMWF AIFS | No disponible | Predicción con IA | No disponible | No disponible | Operativo |

Según la model card, PWM-W v0.4 supera a IFS 0.25, IFS 9 km y GFS en las tres variables, y pierde frente a Chronos-2 entre un 6,0% y un 8,3%. No se dispone de parámetros ni licencias de los modelos comparados en la información proporcionada.

## Limitaciones y advertencias

- Especialización geográfica extrema: entrenado solo con 25 estaciones de Delhi; no se ha validado su transferencia a otras regiones.
- Modelo puro inferior a Chronos-2: pierde entre un 6,0% y un 8,3% en la comparación registrada; los buenos resultados frente a IFS y GFS no implican superioridad general.
- Los resultados híbridos dependen de modelos externos cuyos pesos no se incluyen en el repositorio; no son reproducibles solo con este checkpoint.
- Horizonte limitado a 24 horas; no sirve para predicciones a medio o largo plazo.
- Los datos de entrenamiento no se distribuyen; la reproducibilidad completa depende de `DATA_SOURCES.md` y de las fuentes externas.
- Sin información sobre sesgos, calibración, degradación fuera de distribución ni comportamiento en eventos extremos.
- Sin documentación de cuantización ni de formatos alternativos de despliegue.
- Licencia Apache-2.0: permite uso comercial, pero el autor no ofrece garantías ni soporte; el modelo se publica con estado "reported" (resultados reportados por el autor, no auditados de forma independiente).
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; comunidad y validación externa inexistentes.

## Enlaces

- Hugging Face: https://huggingface.co/paradoxailab/pwm-w-weather-v0.4-cpcb
- Repositorio GitHub: https://github.com/paradoxailab/paradox-world-model
- Registro de la versión (rama delhi-v0.4): https://github.com/paradoxailab/paradox-world-model/blob/delhi-v0.4/README.md
- Índice de la serie: https://github.com/paradoxailab/paradox-world-model/blob/main/models/series/README.md
- Fuentes de datos: https://github.com/paradoxailab/paradox-world-model/blob/main/DATA_SOURCES.md
- Citación: https://github.com/paradoxailab/paradox-world-model/blob/main/CITATION.cff
- Modelo anterior (#22): https://huggingface.co/paradoxailab/pwm-w-weather-v0.3-wmo
- Modelo siguiente (#24): https://huggingface.co/paradoxailab/pwm-w-weather-v0.4-wmo
- Serie completa: https://huggingface.co/paradoxailab/paradox-world-model-series
- Sitio del laboratorio: https://paradoxailab.com
