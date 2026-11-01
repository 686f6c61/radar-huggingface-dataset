# maxiimilian/otprof-sqfh

## Resumen

OTProf SQF-H (nl) es un modelo neuronal de regresión científica desarrollado por maxiimilian para estimar perfiles verticales de turbulencia óptica atmosférica (log10 Cn2) y variables de turbulencia del esquema MYNN del modelo WRF (QKE, TSQ, EL_PBL) a partir de datos de reanálisis ERA5 en niveles de presión. El modelo emplea una arquitectura SqueezeFormer con conciencia de altura (SQF-H), descrita en el artículo arXiv:2604.09346, y está empaquetado en la librería `otprof`, no en el stack habitual de transformers.

El problema que resuelve es concreto: predecir el perfil de Cn2 en la columna atmosférica sin necesidad de ejecutar simulaciones WRF de alta resolución, lo que permite derivar magnitudes ópticas como el parámetro de Fried r0 y el índice de centelleo a partir de ERA5. Está entrenado específicamente para el dominio de los Países Bajos con WRF a 2 km y MYNN, y su relevancia radica en la sustitución de costosos pipelines numéricos por inferencia neuronal ligera (alrededor de 1,03 millones de parámetros).

El modelo es de nicho: no es un LLM ni un modelo generativo de propósito general, sino un regresor especializado con licencia GPL-3.0, 24 descargas y sin likes en el momento de la consulta. Su interés es fundamentalmente para investigación en ciencias atmosféricas y óptica adaptativa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SqueezeFormer con conciencia de altura (SQF-H) |
| Parametros totales | 1.031.852 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (entrada fija de 31 niveles de presión ERA5, 1000 a 20 hPa) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo numérico, no lingüístico) |
| Licencia | GPL-3.0 |
| Formato de pesos | safetensors (más config.json, pipeline.json, steps.json, experiment.yaml) |

## Arquitectura y entrenamiento

La arquitectura es una SqueezeFormer con procesamiento consciente de la altura (SQF-H), diseñada para operar sobre perfiles verticales. La entrada son datos ERA5 estandarizados en los 31 niveles de presión definidos en `otprof.schema` (de 1000 a 20 hPa), a partir de los cuales el modelo construye sus propias características (features versión 1.0.0, schema versión 1.0.0). La salida son perfiles en alturas de consulta sobre el suelo, por defecto los 99 niveles objetivo medios de WRF del conjunto de entrenamiento (de 8 a 29.043 m).

El entrenamiento emplea un esquema desacoplado: WRF interpolado a los niveles de presión de ERA5 ("WRF-PL") como entradas, y ejecución sobre ERA5 en inferencia. El dominio es los Países Bajos con WRF a 2 km y esquema MYNN. La partición es por año: entrenamiento 2019-2020, validación 2018 y test 2017. Se aplica un mapeo de cuantiles de salida (NL-oQM): un único mapa de log10 Cn2 para toda la columna, con 100 cuantiles espaciados sinusoidalmente, ajustado sobre las predicciones guiadas por ERA5 de los años de entrenamiento frente a WRF. La configuración del experimento está en `experiment.yaml`.

## Capacidades

- Predicción de perfiles verticales de turbulencia óptica (log10 Cn2) en la columna atmosférica.
- Predicción de variables de turbulencia del esquema MYNN de WRF: QKE, TSQ y EL_PBL.
- Derivación del parámetro de Fried r0 y del índice de centelleo a partir del perfil de Cn2 predicho.
- Inferencia sobre datos ERA5 estandarizados en 31 niveles de presión.
- Salida en alturas de consulta configurables sobre el suelo (por defecto 99 niveles, 8 a 29.043 m).
- Aplicación opcional de mapeo de cuantiles de salida (oQM) para calibración, desactivable con `predict(..., oqm=False)`.
- Validación de versión de esquema: `predict` rechaza entradas con versión MAJOR distinta.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües: es un regresor numérico especializado.

## Casos de uso

- Predicción operativa de turbulencia óptica sin WRF: sustituir la ejecución de WRF a 2 km por inferencia sobre ERA5 para obtener perfiles de Cn2 en tiempo casi real, reduciendo el coste computacional del pipeline numérico.
- Planificación de observaciones astronómicas: calcular r0 y el índice de centelleo a partir del perfil de Cn2 predicho para evaluar la calidad de seeing en un emplazamiento y franja horaria concretas.
- Estudios climáticos de turbulencia atmosférica: generar series largas de perfiles de Cn2 a partir de archivos ERA5 históricos, aprovechando la partición por años del entrenamiento (2017-2020) como referencia de validación.
- Evaluación y downscaling de WRF-MYNN: usar las predicciones como referencia neuronal para comparar con salidas WRF en configuraciones alternativas, dado que el modelo se entrenó contra WRF-PL.
- Investigación en óptica adaptativa y comunicaciones ópticas en espacio libre: estimar la degradación por turbulencia en enlaces verticales a partir de perfiles de Cn2 y del índice de centelleo derivado.
- Reproducibilidad científica: reentrenar o auditar el modelo con el dataset, los pesos y el código publicados en Zenodo (10.5281/zenodo.23733024), incluyendo `experiment.yaml` y los ficheros de escalado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite explícitamente al artículo arXiv:2604.09346 para consultar el rendimiento antes de usar las predicciones.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; con 1.031.852 parámetros, los pesos en precisión nativa ocupan del orden de pocos megabytes (el repositorio completo es de 0,0 GB según HuggingFace).
- GPU recomendadas: cualquier GPU con soporte PyTorch es suficiente; no se requiere A100, H100 ni RTX 4090. Una GPU consumer de gama baja o incluso CPU es viable.
- Cabe en cualquier GPU consumer; también es ejecutable en CPU sin problema aparente.
- Opciones de despliegue: librería `otprof` con extras `torch` y `hub` (`pip install "otprof[torch,hub]"`); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, al no ser un modelo de lenguaje.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de la misma categoría (regresión de perfiles de turbulencia óptica desde ERA5).

## Limitaciones y advertencias

- Dominio restringido: entrenado solo para los Países Bajos con WRF a 2 km y MYNN; su extrapolación a otras regiones o configuraciones no está validada.
- Dependencia de ERA5: la inferencia asume entradas ERA5 estandarizadas en los 31 niveles de presión del esquema; entradas con versión MAJOR distinta son rechazadas.
- El mapeo de cuantiles de salida (NL-oQM) está ajustado sobre los años de entrenamiento y el dominio neerlandés; su aplicación fuera de ese contexto puede introducir sesgo.
- Riesgo de error en altitudes extremas: el rango de salida por defecto (8 a 29.043 m) refleja los niveles de entrenamiento; fuera de él la fiabilidad no está documentada.
- Licencia GPL-3.0: impone obligaciones de copyleft para uso comercial y distribución de derivados; conviene revisar su compatibilidad antes de integrarlo en productos propietarios.
- Modelo de nicho con adopción mínima (24 descargas, 0 likes): no hay evidencia comunitaria de uso en producción.
- La model card no documenta sesgos, tasas de alucinación ni métricas de error; el autor remite al artículo para evaluar el rendimiento antes de usar las predicciones.
- No es un modelo de lenguaje: no admite prompts, tool calling ni conversación; cualquier uso fuera de la regresión numérica es inadecuado.

## Enlaces

- HuggingFace: https://huggingface.co/maxiimilian/otprof-sqfh
- Artículo: https://arxiv.org/abs/2604.09346
- Dataset, modelo y código en Zenodo: https://doi.org/10.5281/zenodo.23733024
