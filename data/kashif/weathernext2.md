# kashif/weathernext2

## Resumen

WeatherNext 2 es un modelo global de predicción meteorológica a medio plazo desarrollado por Google DeepMind y Google Research, distribuido en Hugging Face bajo el identificador `kashif/weathernext2`. Resuelve el problema de la predicción determinista y de conjunto (ensemble) del estado de la atmósfera a escala planetaria, sustituyendo los sistemas tradicionales de asimilación numérica por una red neuronal generativa que produce un pronóstico completo en una sola pasada hacia delante.

Cada pasada avanza el estado de la atmósfera 6 horas sobre una rejilla de 0,25° de latitud/longitud (721×1440), prediciendo 13 niveles de presión de temperatura, geopotencial, viento y humedad, junto con campos de superficie, precipitación, vientos a 100 m y un conjunto de diagnósticos de ciclones tropicales. La arquitectura es una *Functional Generative Network* (FGN) con una malla de 40.962 nodos y 183,8 M de parámetros por variante, aunque el repositorio empaqueta cuatro ejecuciones independientes (`model1`–`model4`), lo que eleva el total a 215.424.547 parámetros en safetensors.

Su relevancia actual radica en que es una alternativa neuronal pura a los modelos físicos operativos (como ECMWF HRES), con generación de ensembles trivial (una dimensión de lote) y licencia permisiva CC-BY-4.0. No obstante, requiere una rama no publicada de Transformers y datos de entrada específicos (análisis HRES y vientos a 100 m) que no están incluidos en los conjuntos de datos de muestra publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Functional Generative Network (FGN) sobre malla graph-neural-network; 40.962 nodos de malla |
| Parametros totales | 215.424.547 (4 ejecuciones empaquetadas); 183,8 M por variante |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; estado atmosférico de 2 marcos temporales de 6 h) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo numérico, no lingüístico) |
| Licencia | cc-by-4.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo es una *Functional Generative Network* (FGN): en lugar de inyectar un campo de ruido en la entrada o ejecutar un muestreador de difusión, sortea un único vector de ruido de 32 dimensiones por miembro del ensemble y lo utiliza para modular la escala y el desplazamiento de **todas** las capas de normalización. Una muestra produce un pronóstico autoconsistente y un ensemble es simplemente varias muestras, lo que en la práctica equivale a la dimensión de lote. La representación se apoya en una malla de 40.962 nodos sobre la rejilla de 0,25° (721×1440), procesada mediante capas de graph-neural-network.

Los pesos corresponden a `WeatherNext2_<2025_model{1..4}`, entrenados con datos hasta 2024 y ajustados finamente para la inicialización a partir del análisis operativo ECMWF HRES. Se incluyen las cuatro ejecuciones entrenadas de forma independiente (`model1`–`model4`), cada una con su propia configuración y activos de procesador, lo que permite combinar ensembles de ruido con ensembles multi-modelo. El modelo predice campos normalizados; `WeatherNext2FeatureExtractor` gestiona la normalización, los forzamientos de reloj y la conversión de vuelta a unidades físicas. El ruido lo muestrea el procesador, no el forward del modelo.

## Capacidades

- Predicción meteorológica global determinista y de conjunto a medio plazo, con un paso de 6 horas por forward pass.
- Predicción de 13 niveles de presión de temperatura, geopotencial, viento y humedad.
- Predicción de campos de superficie, precipitación y vientos a 100 m.
- Diagnósticos de ciclones tropicales (variante WeatherNext2; la variante WeatherNextCyclones no incluye vientos a 100 m).
- Generación de ensembles de ruido: `generate(num_members=8)` repite cada condición inicial y ejecuta los miembros por el eje de lote.
- Ensembles multi-modelo: combinación de las cuatro ejecuciones independientes (`model1`–`model4`).
- Despliegue autoregresivo (`generate()`) con avance de cada miembro usando su propio estado predicho y muestreo de ruido nuevo en cada paso de 6 horas.
- Inicialización desde dos marcos cronológicos de análisis HRES separados por 6 horas, con latitud ascendente, los niveles de presión del checkpoint y todos los campos de entrada configurados, incluidos los estáticos.
- No dispone de tool calling, agentes ni capacidades multilingües (es un modelo numérico, no lingüístico).

## Casos de uso

- Predicción operativa a medio plazo: el modelo genera un pronóstico global completo en un solo forward pass de 6 horas, lo que permite producir ciclos de pronóstico con menor coste computacional que la asimilación numérica tradicional.
- Generación de ensembles probabilísticos: con `num_members=8` y `batch_size=1` se obtienen ocho pronósticos autoconsistentes por condición inicial, adecuados para estimar incertidumbre en temperatura y precipitación.
- Predicción de episodios de viento a 100 m: la variante WeatherNext2 incluye vientos a 100 m, útil para planificación de energía eólica y evaluación de riesgos en parques eólicos.
- Seguimiento de ciclones tropicales: los diagnósticos de ciclones tropicales permiten monitorizar trayectorias y desarrollo de sistemas tropicales en rejillas globales.
- Investigación climática y validación de modelos: la disponibilidad de cuatro ejecuciones independientes y de pesos abiertos facilita estudios de sensibilidad y comparaciones con reanálisis HRES.
- Integración en pipelines de investigación con datos HRES: el `WeatherNext2FeatureExtractor` gestiona normalización y conversión a unidades físicas, lo que simplifica la incorporación en flujos existentes de análisis meteorológico.
- Pronóstico autoregresivo de hasta varios días: `generate(num_steps=20)` produce 5 días de pronóstico encadenando pasos de 6 horas con ruido nuevo en cada paso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; el repositorio ocupa 30,4 GB, pero el checkpoint individual de 183,8 M de parámetros es ligero en comparación con el tamaño total del repositorio (que incluye las cuatro ejecuciones y activos del procesador).
- GPU recomendadas: no disponible; el ejemplo oficial usa `device_map="auto"` y `torch`, sin especificar GPU concretas.
- Cabe en GPU consumer: no disponible como dato confirmado; por el número de parámetros (183,8 M por variante) es plausible, pero no se indica en la documentación.
- Opciones de despliegue: `transformers` (rama `add-weathernext2` de `kashif/transformers`), `torch` y `accelerate`; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / rejilla | Licencia | Disponibilidad |
|---|---|---|---|---|
| WeatherNext 2 | 183,8 M por variante; 215,4 M en repo | 0,25° (721×1440), paso de 6 h | cc-by-4.0 | Hugging Face (`kashif/weathernext2`) |
| WeatherNextCyclones | 183,8 M | 0,25° (721×1440) | no disponible | Hugging Face (`kashif/weathernext-cyclones`) |
| ECMWF HRES (referencia operativa) | no disponible | no disponible | no disponible | sistema operativo, no abierto |

La comparativa con modelos neuronales alternativos de predicción meteorológica no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Requiere una versión no publicada de Transformers: hasta que se fusione `huggingface/transformers#47874`, es necesario instalar la rama `add-weathernext2` desde el repositorio de `kashif`.
- El checkpoint requiere entradas de vientos a 100 m que no están presentes en los conjuntos de datos de muestra publicados, lo que complica la reproducción directa del ejemplo.
- La inicialización exige dos marcos cronológicos de análisis HRES separados por 6 horas, con latitud ascendente, los niveles de presión del checkpoint y todos los campos de entrada configurados, incluidos los estáticos.
- El ruido lo muestrea el procesador, no el forward del modelo: no se debe pasar un segundo argumento `noise` ni repetir la máscara de atención sobre los miembros del ensemble.
- En `generate()`, `seconds_since_epoch` es el tiempo válido del primer pronóstico, no el del último marco de condicionamiento.
- No se han publicado resultados de benchmarks en la información disponible, por lo que no es posible validar el rendimiento frente a sistemas operativos.
- No se dispone de información sobre sesgos, riesgo de alucinación (en sentido meteorológico, pronósticos físicamente inconsistentes) ni limitaciones idiomáticas.
- Licencia CC-BY-4.0: permite uso comercial con atribución, pero deben verificarse las condiciones de atribución a Google DeepMind y Google Research.
- El repositorio de 30,4 GB incluye las cuatro ejecuciones y activos del procesador, lo que requiere espacio de almacenamiento considerable.

## Enlaces

- Hugging Face: https://huggingface.co/kashif/weathernext2
- Variante WeatherNextCyclones: https://huggingface.co/kashif/weathernext-cyclones
- Demo oficial: https://github.com/google-deepmind/weathernext/blob/main/docs/weathernext2/wn2_demo.ipynb
- Documentación del modelo: https://github.com/kashif/transformers/blob/add-weathernext2/docs/source/en/model_doc/weathernext2.md
- Pull request de Transformers: https://github.com/huggingface/transformers/pull/47874
- Repositorio de Transformers (rama): https://github.com/kashif/transformers.git
- Paper: arxiv:2506.10772
