# kashif/weathernext2-model2

## Resumen

WeatherNext 2 (model2) es un modelo global de predicción meteorológica a medio plazo desarrollado por Google DeepMind y Google Research. Cada pasada hacia delante avanza el estado de la atmósfera 6 horas sobre una rejilla de 0,25° de latitud/longitud, prediciendo 13 niveles de presión de temperatura, geopotencial, viento y humedad, junto con campos de superficie, precipitación, vientos a 100 m y un conjunto de diagnósticos de ciclones tropicales.

El modelo se presenta como una Functional Generative Network (FGN): en lugar de inyectar un campo de ruido en la entrada o ejecutar un muestreador de difusión, extrae un único vector de ruido de 32 dimensiones por miembro del ensemble y lo usa para modular la escala y el desplazamiento de cada capa de normalización. Una extracción produce una predicción autoconsistente, y un ensemble es simplemente varias extracciones, que aquí equivalen a la dimensión de batch.

Este repositorio concreto corresponde a la variante `WeatherNext2_<2025_model2`, entrenada con datos hasta 2024 y ajustada finamente para inicialización desde el análisis operativo HRES de ECMWF. Es una de las cuatro ejecuciones de entrenamiento independientes (model1 a model4) que pueden combinarse en un ensemble multimodelo. Con 215,4 millones de parámetros y un tamaño de repositorio de 2,2 GB, es un modelo especializado de tamaño moderado, no un modelo de lenguaje.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Functional Generative Network (FGN) con graph neural network sobre malla esférica |
| Parametros totales | 215.424.547 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; ventana de 2 marcos temporales de 6 h) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo no lingüístico) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo es una Functional Generative Network que opera sobre una malla esférica de 40.962 nodos a resolución de 0,25° (rejilla de 721×1440). La generación estocástica no se basa en difusión ni en inyección de ruido en la entrada: cada miembro del ensemble recibe un vector de ruido de 32 dimensiones que modula la escala y el desplazamiento de todas las capas de normalización, lo que permite generar ensembles completos tratándolos como dimensión de batch en una sola pasada.

El checkpoint fue entrenado con datos hasta 2024 y ajustado finamente para inicialización desde el análisis operativo HRES de ECMWF. Requiere dos marcos cronológicos de análisis HRES separados por seis horas, con latitud ascendente, los niveles de presión del checkpoint y todos los campos de entrada configurados, incluidos los campos estáticos. El modelo predice campos normalizados; el `WeatherNext2FeatureExtractor` gestiona la normalización, los forzamientos de reloj y la conversión a unidades físicas. Esta variante requiere además entradas de viento a 100 m, ausentes en los conjuntos de datos de muestra publicados. No se dispone de información detallada sobre el número de tokens de entrenamiento ni sobre la composición exacta del dataset en la información proporcionada.

## Capacidades

- Predicción meteorológica global a medio plazo con paso de 6 horas por pasada.
- Predicción de 13 niveles de presión de temperatura, geopotencial, viento y humedad.
- Predicción de campos de superficie, precipitación y vientos a 100 m.
- Diagnósticos de ciclones tropicales.
- Generación de ensembles mediante ruido: `num_members` extrae ruido independiente por miembro compartiendo pesos.
- Despliegue autorregresivo multi-paso mediante `generate()` con muestreo de ruido fresco en cada paso de 6 horas.
- Ensemble multimodelo combinando las cuatro ejecuciones independientes (model1 a model4).
- No soporta tool calling, agentes, razonamiento multi-step lingüístico ni capacidades multilingües; es un modelo numérico especializado.

## Casos de uso

- Predicción operativa a medio plazo: el modelo genera pronósticos globales a 5 días (20 pasos de 6 horas) mediante `generate()`, adecuado para sustituir o complementar pipelines de predicción determinista con un coste computacional muy inferior al de los modelos numéricos tradicionales.
- Generación de ensembles probabilísticos: con `num_members=8` o superior se obtienen varios pronósticos autoconsistentes por condición inicial, útiles para estimar incertidumbre en predicción de temperatura y precipitación.
- Predicción de eventos extremos: los diagnósticos de ciclones tropicales y los campos de precipitación permiten alimentar sistemas de alerta temprana.
- Ensemble multimodelo: combinar las extracciones de ruido de model1 a model4 reduce la varianza del ensemble y mejora la calibración probabilística.
- Investigación climática y meteorológica: la licencia CC-BY-4.0 y el formato transformers facilitan la reproducibilidad y la experimentación académica sobre arquitecturas FGN.
- Evaluación de modelos de predicción: servir como referencia generativa frente a modelos numéricos como HRES o GFS en estudios comparativos de habilidad predictiva.
- Downstream de energías renovables: los campos de viento a 100 m y radiación implícita en los campos de superficie pueden alimentar modelos de predicción de generación eólica y solar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 215,4 M de parámetros; en fp32 ocupa aproximadamente 0,86 GB de pesos, y en fp16/bf16 unos 0,43 GB. La memoria adicional depende del tamaño del batch y del número de miembros del ensemble, ya que cada miembro ocupa una fila del batch sobre la rejilla de 721×1440.
- GPU recomendadas: cualquier GPU con al menos 8-16 GB de VRAM es suficiente para inferencia en fp32 con batches moderados; A100 o H100 permiten ensembles grandes y rollouts de varios pasos con mayor throughput.
- Cabe en GPU de consumo: sí, en RTX 3060, RTX 4060, RTX 4090 y similares, siempre que se ajuste el tamaño de batch.
- Opciones de despliegue: transformers (requiere la rama `add-weathernext2` de kashif/transformers hasta que se fusione huggingface/transformers#47874), con `device_map="auto"` y `torch`/`accelerate`. No se documentan opciones para vLLM, llama.cpp, Ollama ni TGI, al no ser un modelo de lenguaje.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Resolucion | Malla | Vientos 100 m | Licencia |
|---|---|---|---|---|---|
| WeatherNext2 (model2) | 215,4 M | 0,25° (721×1440) | 40.962 nodos | sí | CC-BY-4.0 |
| WeatherNext2 (model1) | 183,8 M | 0,25° (721×1440) | 40.962 nodos | sí | CC-BY-4.0 |
| WeatherNextCyclones | 183,8 M | 0,25° (721×1440) | 40.962 nodos | no | CC-BY-4.0 |

Los cuatro checkpoints de WeatherNext 2 (model1 a model4) comparten arquitectura y resolución, difieren en la ejecución de entrenamiento y pueden combinarse en ensemble. No se dispone de datos de benchmarks que permitan comparar el rendimiento predictivo con modelos numéricos como HRES o GFS en la información proporcionada.

## Limitaciones y advertencias

- Requiere la rama no publicada de transformers (`add-weathernext2`); no funciona con una versión estable de la librería hasta que se fusione el PR correspondiente.
- Necesita dos marcos cronológicos de análisis HRES separados por 6 horas con latitud ascendente y los niveles de presión del checkpoint; una preparación incorrecta de los datos produce resultados inválidos.
- Esta variante requiere entradas de viento a 100 m que no están presentes en los conjuntos de datos de muestra publicados, lo que complica la reproducción.
- El ruido lo muestrea el procesador, no el forward del modelo; pasar un segundo argumento `noise` o repetir la máscara sobre los miembros del ensemble provoca errores.
- En `generate()`, `seconds_since_epoch` debe ser el tiempo válido del primer pronóstico, no el del último marco de condicionamiento.
- Riesgo de degradación en rollouts largos por acumulación de error autorregresivo; no se documentan métricas de habilidad predictiva en la información disponible.
- Modelo especializado sin capacidades lingüísticas, de tool calling ni de agentes; no debe evaluarse con benchmarks de LLM.
- Licencia CC-BY-4.0: permite uso comercial con atribución; conviene revisar los términos de los datos HRES de ECMWF usados para inicialización.
- No se documentan sesgos ni limitaciones idiomáticas por tratarse de un modelo numérico.

## Enlaces

- Hugging Face: https://huggingface.co/kashif/weathernext2-model2
- WeatherNext2 (model1): https://huggingface.co/kashif/weathernext2
- WeatherNextCyclones: https://huggingface.co/kashif/weathernext-cyclones
- WeatherNext2 (model3): https://huggingface.co/kashif/weathernext2-model3
- WeatherNext2 (model4): https://huggingface.co/kashif/weathernext2-model4
- Demo oficial: https://github.com/google-deepmind/weathernext/blob/main/docs/weathernext2/wn2_demo.ipynb
- Documentación del modelo en transformers: https://github.com/kashif/transformers/blob/add-weathernext2/docs/source/en/model_doc/weathernext2.md
- PR de transformers: https://github.com/huggingface/transformers/pull/47874
- Rama de transformers: https://github.com/kashif/transformers/tree/add-weathernext2
- Paper: https://arxiv.org/abs/2506.10772
