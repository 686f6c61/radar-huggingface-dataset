# kashif/weathernext-cyclones-model3

## Resumen

WeatherNext Cyclones (model3) es la variante especializada en ciclones tropicales de WeatherNext 2, el sistema de predicción meteorológica desarrollado por Google DeepMind. El modelo que aquí se distribuye es la ejecución de entrenamiento 3 (model3) y corresponde a la versión que funcionó en producción durante la temporada de huracanes del Atlántico de 2025, conocida públicamente como FNV3 (la versión postprocesada del NHC se denominó GDMI). Un único paso hacia delante avanza el estado de la atmósfera seis horas sobre una rejilla de 0,25° de latitud y longitud.

Técnicamente se trata de una *Functional Generative Network* (FGN): en lugar de inyectar un campo de ruido en la entrada o ejecutar un muestreador de difusión, el modelo extrae un vector de ruido de 32 dimensiones por miembro del ensemble y lo utiliza para modular la escala y el desplazamiento de todas las capas de normalización. Una extracción produce una predicción autoconsistente y un ensemble se obtiene simplemente con varias extracciones, que aquí equivalen a la dimensión de batch. La arquitectura es idéntica a la de WeatherNext 2; ambas difieren únicamente en el entrenamiento y en que WeatherNext 2 predice además vientos a 100 m.

El checkpoint contiene 215.419.937 parámetros en formato safetensors y se distribuye bajo licencia CC BY 4.0. Es relevante ahora porque permite reproducir y evaluar los resultados del artículo de referencia (arXiv:2506.10772) sobre años no vistos, gracias a sus revisiones con distintos cortes temporales de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Functional Generative Network (FGN) sobre rejilla lat/lon; pesos en safetensors compatibles con transformers (clase `WeatherNext2ForWeatherForecasting`) |
| Parametros totales | 215.419.937 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; ventana de dos fotogramas de análisis HRES separados 6 horas) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de predicción meteorológica, sin interfaz de lenguaje) |
| Licencia | CC BY 4.0 |
| Formato de pesos | safetensors |
| Resolucion espacial | 0,25° lat/lon (rejilla de 721 x 1440) |
| Paso temporal | 6 horas por paso hacia delante |
| Niveles de presion | 13 |
| Variables predichas | temperatura, geopotencial, viento y humedad en 13 niveles; campos de superficie; precipitacion; 17 diagnosticos de ciclon tropical |
| Dimension del vector de ruido | 32 |
| Revisiones | `main` (entrenado hasta 2024), `<2024` (hasta 2023), `<2023` (hasta 2022) |

## Arquitectura y entrenamiento

El modelo comparte la arquitectura de WeatherNext 2: una red generativa funcional que opera sobre una rejilla global de 0,25° y avanza el estado atmosférico en pasos de seis horas. La innovación central es el mecanismo de generación: un vector de ruido de 32 dimensiones por miembro modula la escala y el desplazamiento de cada capa de normalización, de modo que cada extracción de ruido genera una predicción completa y autoconsistente sin necesidad de un muestreador iterativo tipo difusión. Esto reduce el coste de generar ensembles, ya que cada miembro es simplemente una fila del batch.

El modelo predice 13 niveles de presión de temperatura, geopotencial, viento y humedad, además de campos de superficie, precipitación y 17 diagnósticos de ciclón tropical (existencia, velocidad del viento, radios de vientos de 34/50/64 nudos por cuadrante, radio de viento máximo y presión central). Se inicializa a partir de dos fotogramas cronológicos de análisis HRES separados seis horas, con latitud ascendente, los niveles de presión del checkpoint y todos los campos de entrada configurados, incluidos los estáticos. La información disponible no detalla el volumen de tokens de entrenamiento, la composición del dataset ni si se emplearon RLHF o DPO; estos datos deben consultarse en el artículo arXiv:2506.10772.

## Capacidades

- Predicción meteorológica global a 0,25° de resolución con paso temporal de 6 horas.
- Predicción de 13 niveles de presión de temperatura, geopotencial, viento y humedad.
- Predicción de campos de superficie y precipitación.
- Predicción de 17 diagnósticos de ciclón tropical: existencia, velocidad del viento, radios de vientos de 34/50/64 nudos por cuadrante, radio de viento máximo y presión central.
- Generación de ensembles mediante extracciones independientes de ruido (dimensión de batch).
- Despliegue autorregresivo multi-paso mediante `generate()`, con muestreo de ruido nuevo en cada paso de seis horas.
- Evaluación sobre años no vistos gracias a las revisiones con cortes temporales de entrenamiento distintos.
- No soporta tool calling, agentes, razonamiento multi-paso en lenguaje ni capacidades multilingües; es un modelo numérico de predicción, no un modelo de lenguaje.

## Casos de uso

- Predicción operativa de trayectoria e intensidad de ciclones tropicales: el modelo produce diagnósticos de existencia, velocidad del viento y presión central sobre rejilla, que pueden postprocesarse para obtener pistas de ciclones; es adecuado porque fue el modelo que funcionó en producción durante la temporada atlántica de 2025.
- Generación de ensembles probabilísticos de ciclones: con `generate(num_members=8)` se obtienen ocho miembros autoconsistentes compartiendo pesos, lo que permite estimar la incertidumbre de la trayectoria y de los radios de viento sin coste de un muestreador de difusión.
- Evaluación retrospectiva de modelos meteorológicos: usando las revisiones `<2024` y `<2023` se puede evaluar el modelo sobre años que no ha visto durante el entrenamiento, lo que permite reproducir los resultados del artículo de 2024 y 2023.
- Predicción de vientos por cuadrante para alertas costeras: los radios de vientos de 34/50/64 nudos por cuadrante permiten generar avisos de impacto en zonas costeras con antelación de varios días mediante despliegue autorregresivo de 20 pasos (5 días).
- Investigación en generación probabilística: el mecanismo FGN de modulación de normalización por vector de ruido de 32 dimensiones es un objeto de estudio para comparar con difusión y otros esquemas generativos en dominios físicos.
- Predicción de precipitación y campos de superficie: la salida incluye precipitación y campos de superficie sobre rejilla global, útil para estudios de impacto hidrológico y validación contra análisis HRES.
- Reproducibilidad de resultados científicos: el checkpoint permite reproducir las cifras del artículo arXiv:2506.10772 con las revisiones correspondientes, lo que facilita la comparación con otros sistemas de predicción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 215,4 millones de parámetros, los pesos en fp32 ocupan aproximadamente 0,86 GB y en fp16/bf16 alrededor de 0,43 GB, a lo que hay que sumar el estado de la rejilla (721 x 1440 por variable y nivel) y las activaciones.
- GPU recomendadas: no disponible en la información; por tamaño de modelo, una GPU con al menos 16 GB de VRAM debería ser suficiente para inferencia en precisión reducida, aunque el coste real depende del tamaño de la rejilla y del número de miembros del ensemble.
- Cabe en GPU de consumo: previsiblemente sí en tarjetas con 16 GB o más (RTX 4080, RTX 4090, RTX 5090), aunque no se confirma en la información disponible.
- Opciones de despliegue: transformers (rama `add-weathernext2` de kashif hasta que se fusione huggingface/transformers#47874), con `device_map="auto"` y soporte de `accelerate` y `torch`. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Resolucion / paso | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| WeatherNext Cyclones model3 | 215.419.937 | 0,25°, 6 h | Dos fotogramas HRES separados 6 h | CC BY 4.0 | Hugging Face (kashif/weathernext-cyclones-model3) |
| WeatherNext 2 | no disponible | 0,25°, 6 h | Dos fotogramas HRES separados 6 h | no disponible | Hugging Face (kashif/weathernext2) |
| WeatherNext Cyclones `<2024` | 215.419.937 | 0,25°, 6 h | Dos fotogramas HRES separados 6 h | CC BY 4.0 | Misma repo, revisión `<2024` |
| WeatherNext Cyclones `<2023` | 215.419.937 | 0,25°, 6 h | Dos fotogramas HRES separados 6 h | CC BY 4.0 | Misma repo, revisión `<2023` |

La información disponible no incluye otros modelos comparables de predicción de ciclones con datos de rendimiento; la comparación con WeatherNext 2 se limita a que este último predice además vientos a 100 m y difiere en el entrenamiento.

## Limitaciones y advertencias

- Las salidas de ciclón son diagnósticos sobre rejilla, no pistas de ciclones; la extracción de trayectorias sigue siendo un paso separado en el repositorio original.
- El modelo requiere la rama `add-weathernext2` de transformers hasta que se fusione el PR huggingface/transformers#47874; no funciona con una versión publicada de transformers.
- La inicialización exige dos fotogramas cronológicos de análisis HRES separados seis horas, con latitud ascendente, los niveles de presión del checkpoint y todos los campos de entrada configurados, incluidos los estáticos; un preprocesado incorrecto invalida la predicción.
- El ruido lo muestrea el procesador, no el paso hacia delante del modelo; no debe pasarse un segundo argumento `noise` ni repetir la máscara de atención sobre los miembros del ensemble.
- En `generate()`, `seconds_since_epoch` debe ser el tiempo válido del primer pronóstico, no el del último fotograma de condicionamiento.
- No se dispone de información sobre sesgos, riesgo de alucinación en el sentido habitual ni limitaciones idiomáticas, al no ser un modelo de lenguaje; los sesgos relevantes serían los del dataset de entrenamiento HRES, no detallados en la información disponible.
- La licencia CC BY 4.0 permite uso comercial con atribución; deben respetarse las condiciones de atribución a Google DeepMind y a los autores del checkpoint.
- No se documentan garantías de rendimiento operativo ni latencias; para producción deben validarse contra análisis HRES y contra las cifras del artículo.

## Enlaces

- Hugging Face: https://huggingface.co/kashif/weathernext-cyclones-model3
- WeatherNext 2 (arquitectura base): https://huggingface.co/kashif/weathernext2
- Artículo de referencia: https://arxiv.org/abs/2506.10772
- Repositorio oficial de Google DeepMind: https://github.com/google-deepmind/weathernext
- Demo oficial de WeatherNext 2: https://github.com/google-deepmind/weathernext/blob/main/docs/weathernext2/wn2_demo.ipynb
- Documentación del modelo en la rama de transformers: https://github.com/kashif/transformers/blob/add-weathernext2/docs/source/en/model_doc/weathernext2.md
- PR de soporte en transformers: https://github.com/huggingface/transformers/pull/47874
- Rama de transformers con soporte: https://github.com/kashif/transformers/tree/add-weathernext2
