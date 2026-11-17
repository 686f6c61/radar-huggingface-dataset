# Alb138/titikapi-model

## Resumen

TitikApi es un paquete de inferencia para el pronóstico diario de incendios forestales (puntos de calor) en Sumatra y Kalimantan (Indonesia), desarrollado por el usuario Alb138. No es un modelo de lenguaje: es un sistema de ensemble que combina tres miembros de una red U-Net implementados en PyTorch con siete boosters LightGBM, uno por cada día de horizonte de predicción, más calibraciones de Platt por modelo y capas estáticas de mapas sobre una rejilla de 0,1°.

El problema que resuelve es la predicción operativa de focos de incendio a partir de datos meteorológicos y de teledetección, con un pipeline de limpieza que descarta falsos positivos procedentes de antorchas de gas y volcanes conocidos. El modelo se entrenó con datos de 2012 a 2020, se calibró y seleccionó en 2021-2022 y se evaluó en 2023 hasta octubre de 2026.

La relevancia actual del proyecto es acotada: se trata de un artefacto de investigación con cero descargas y cero likes en el momento de la consulta, sin model card extendida, sin licencia declarada y sin resultados de benchmarks publicados en la información disponible. Su interés principal es como ejemplo de ensemble híbrido (deep learning más gradient boosting) aplicado a un dominio geoespacial concreto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Ensemble: 3 miembros U-Net (PyTorch) + 7 boosters LightGBM (uno por dia de horizonte) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | state dicts de PyTorch + configs; boosters LightGBM; calibraciones de Platt |
| Tamano del repositorio | 0,1 GB |
| Resolucion espacial | rejilla de 0,1° sobre Sumatra y Kalimantan |
| Periodo de entrenamiento | 2012-2020 |
| Periodo de calibracion y seleccion | 2021-2022 |
| Periodo de test | 2023 - octubre de 2026 |

## Arquitectura y entrenamiento

El sistema es un ensemble en dos niveles. El primer nivel lo forman tres miembros U-Net entrenados en PyTorch, que operan sobre capas estáticas de mapa en una rejilla de 0,1° y sobre variables meteorológicas escaladas con estadísticas de entrenamiento precalculadas. El segundo nivel lo componen siete boosters LightGBM, uno por cada día de horizonte de predicción, que se combinan mediante definiciones de ensemble (`ens_unet` y el ensemble final `ens_mix`). Cada modelo individual incorpora una calibración de Platt para ajustar las probabilidades de salida.

El pipeline incluye tasas de persistencia y una lista de localizaciones conocidas de antorchas de gas y volcanes, empleada para limpiar datos de incendios en tiempo casi real y evitar falsos positivos. El entrenamiento cubre 2012-2020, la calibración y selección de modelos se realizó sobre 2021-2022, y el conjunto de test abarca desde 2023 hasta octubre de 2026. No se detalla en la información disponible el número de tokens, la composición exacta del dataset, ni si se aplicaron técnicas de refuerzo o preferencias, dado que no es un modelo generativo.

## Capacidades

- Pronóstico diario de puntos de calor (incendios) con horizonte de siete días, uno por cada booster LightGBM.
- Predicción geoespacial sobre rejilla de 0,1° limitada a Sumatra y Kalimantan.
- Ensemble híbrido que combina salidas de U-Net y LightGBM mediante definiciones `ens_unet` y `ens_mix`.
- Calibración probabilística por modelo mediante escalado de Platt.
- Limpieza de datos de incendios en tiempo casi real usando localizaciones conocidas de antorchas de gas y volcanes.
- Uso de tasas de persistencia como referencia o componente del pronóstico.
- Integración de capas estáticas de mapa y estadísticas de escalado de variables meteorológicas.
- No dispone de generación de texto, razonamiento, código, matemáticas, visión general, tool calling, agentes ni capacidades multilingües.

## Casos de uso

- Pronóstico operativo de incendios en Sumatra y Kalimantan: el ensemble genera probabilidades diarias de puntos de calor a siete días vista sobre la rejilla de 0,1°, adecuado para planificación de respuesta con una semana de antelación.
- Alerta temprana para agencias de gestión de emergencias: las salidas calibradas con Platt permiten umbrales de probabilidad interpretables para activar protocolos de vigilancia en zonas concretas.
- Limpieza de datos satelitales de focos de calor: el paquete incluye localizaciones de antorchas de gas y volcanes para descartar detecciones espurias antes de alimentar sistemas de monitorización.
- Investigación en ensembles híbridos: sirve como referencia reproducible para comparar el rendimiento de U-Net frente a LightGBM y su combinación en un problema geoespacial de pronóstico.
- Evaluación de impacto de variables meteorológicas: las estadísticas de escalado y las tasas de persistencia permiten analizar la contribución de cada variable al pronóstico.
- Reproducción de experimentos: el repositorio de GitHub asociado documenta resultados, limitaciones y el procedimiento de reproducción, útil para validar metodologías en pronóstico de incendios.
- Prototipado de sistemas de pronóstico en otras regiones: la arquitectura de ensemble y el pipeline de calibración pueden adaptarse a otras zonas con datos meteorológicos y de teledetección equivalentes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite al repositorio de GitHub para consultar resultados, limitaciones y reproducción, pero no se incluyen cifras en el material proporcionado.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio ocupa 0,1 GB, lo que sugiere que el conjunto de pesos es ligero, pero no se especifica el consumo de memoria en inferencia.
- GPU recomendadas: no disponible. Al tratarse de U-Net en PyTorch más LightGBM, es plausible su ejecución en GPU de gama media o incluso en CPU, pero no se confirma en la información disponible.
- Compatibilidad con GPU de consumo: no confirmada. El tamaño reducido del repositorio indica que podría caber en GPU de consumo, pero no hay datos oficiales.
- Opciones de despliegue: no disponible. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que además no aplican a este tipo de modelo.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de pronóstico de incendios con ensemble U-Net más LightGBM, ni datos de rendimiento que permitan una comparación rigurosa.

## Limitaciones y advertencias

- Cobertura geográfica restringida a Sumatra y Kalimantan; no se ha validado su uso en otras regiones.
- Resolución espacial fija de 0,1°, insuficiente para aplicaciones que requieran detalle local fino.
- Horizonte máximo de siete días, limitado por el número de boosters LightGBM.
- Sin licencia declarada: no se especifican condiciones de uso comercial, lo que impide asumir permisos de redistribución o explotación.
- Cero descargas y cero likes en el momento de la consulta: sin validación externa ni comunidad que reporte comportamiento en producción.
- Sin model card extendida ni benchmarks publicados en la información disponible; los resultados solo se remiten al repositorio de GitHub.
- Riesgo de falsos positivos y negativos en la detección de incendios pese al filtrado de antorchas de gas y volcanes; la lista de localizaciones puede estar incompleta.
- Dependencia de la calidad y disponibilidad de datos meteorológicos y de teledetección en tiempo casi real.
- No es un modelo de lenguaje: no admite prompts, tool calling ni razonamiento multi-paso.
- Fechas de creación y actualización del repositorio (noviembre de 2026) posteriores al periodo de test declarado; conviene verificar la coherencia temporal de los artefactos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Alb138/titikapi-model
- Repositorio de código: https://github.com/Alb138/titikapi
