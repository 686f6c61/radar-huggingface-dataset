# kashif/weathernext-cyclones-model2

## Resumen

WeatherNext Cyclones (model2) es la variante especializada en ciclones tropicales del modelo WeatherNext 2 de Google DeepMind, publicada en Hugging Face bajo el identificador `kashif/weathernext-cyclones-model2`. Se trata de un modelo de predicción meteorológica de aprendizaje automático que ejecuta una pasada hacia delante para avanzar el estado de la atmósfera 6 horas sobre una rejilla de 0,25° de latitud/longitud, prediciendo 13 niveles de presión de temperatura, geopotencial, viento y humedad, además de campos de superficie, precipitación y 17 diagnósticos de ciclones tropicales. Es el modelo que operó en vivo durante la temporada de huracanes del Atlántico de 2025 (denominado públicamente FNV3, con la versión postprocesada del NHC como GDMI).

La arquitectura es una Functional Generative Network (FGN): en lugar de inyectar ruido en la entrada o ejecutar un muestreador de difusión, el modelo extrae un único vector de ruido de 32 dimensiones por miembro del ensemble y lo utiliza para modular la escala y el desplazamiento de todas las capas de normalización. Una extracción produce un pronóstico autoconsistente y un ensemble es simplemente varias extracciones, que aquí se corresponden con la dimensión de lote. La arquitectura es idéntica a la de WeatherNext2; ambos difieren únicamente en sus ejecuciones de entrenamiento y en que WeatherNext 2 predice además vientos a 100 m.

Con 215.419.937 parámetros totales y un repositorio de 4,0 GB, el modelo se distribuye en formato safetensors bajo licencia CC-BY-4.0 y requiere una rama específica de Transformers aún no publicada. Su relevancia actual radica en que permite reproducir resultados operativos de predicción de ciclones tropicales y evaluar sobre años no vistos mediante las distintas revisiones entrenadas hasta diferentes fechas de corte.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Functional Generative Network (FGN) sobre rejilla 0,25° lat/lon; grafo neuronal según tag `graph-neural-network` |
| Parametros totales | 215.419.937 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; ventana de 2 fotogramas de análisis HRES separados 6 horas) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo numérico de predicción meteorológica, no lingüístico) |
| Licencia | cc-by-4.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es una Functional Generative Network (FGN) que opera sobre una rejilla de 0,25° de latitud/longitud. En cada pasada hacia delante avanza el estado de la atmósfera 6 horas, prediciendo 13 niveles de presión de temperatura, geopotencial, viento y humedad, campos de superficie, precipitación y 17 diagnósticos de ciclones tropicales (existencia, velocidad del viento, radios de vientos de 34/50/64 nudos por cuadrante, radio de viento máximo y presión central). La innovación clave frente a enfoques de difusión es la modulación estocástica: un vector de ruido de 32 dimensiones por miembro modula la escala y el desplazamiento de todas las capas de normalización, de modo que una extracción genera un pronóstico autoconsistente y el ensemble se obtiene variando ese vector a lo largo de la dimensión de lote.

La arquitectura es idéntica a la de WeatherNext2, y ambos modelos difieren solo en sus ejecuciones de entrenamiento y en que WeatherNext 2 predice además vientos a 100 m. El repositorio sirve la ejecución de entrenamiento 2 (`model2`) y ofrece tres revisiones entrenadas hasta fechas de corte distintas: `main` (entrenada hasta 2024, correspondiente a la versión operativa de la temporada 2025), `<2024` (entrenada hasta 2023, reproduce los resultados de 2024 del artículo) y `<2023` (entrenada hasta 2022, reproduce los resultados de 2023 del artículo). No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se emplearon RLHF o DPO.

## Capacidades

- Predicción meteorológica determinista y por ensemble: una pasada hacia delante avanza el estado atmosférico 6 horas sobre rejilla de 0,25°.
- Predicción de 13 niveles de presión de temperatura, geopotencial, viento y humedad.
- Predicción de campos de superficie y precipitación.
- Predicción de 17 diagnósticos de ciclones tropicales: existencia, velocidad del viento, radios de vientos de 34/50/64 nudos por cuadrante, radio de viento máximo y presión central.
- Generación de ensembles mediante ruido: `generate(num_members=8)` repite cada condición inicial y ejecuta los miembros a lo largo del eje de lote.
- Despliegue autorregresivo multi-paso: `generate()` prepara las entradas, avanza cada miembro con su propio estado predicho y muestrea ruido nuevo en cada paso de 6 horas (por ejemplo, `num_steps=20` para 5 días).
- Evaluación sobre años no vistos mediante las revisiones con distintas fechas de corte.
- No soporta tool calling, function calling, agentes ni capacidades multilingües (es un modelo numérico de predicción meteorológica, no un modelo de lenguaje).

## Casos de uso

- Predicción operativa de ciclones tropicales: el modelo reproduce la versión que operó en vivo durante la temporada de huracanes del Atlántico de 2025 (FNV3/GDMI), por lo que puede emplearse para generar pronósticos de existencia, intensidad y estructura de vientos de ciclones a partir de dos fotogramas de análisis HRES separados 6 horas.
- Generación de ensembles de pronóstico: con `generate(num_members=8)` se obtienen múltiples trayectorias autoconsistentes que permiten estimar la incertidumbre del pronóstico a partir de la dispersión entre miembros, útil para comunicar escenarios de riesgo.
- Despliegue autorregresivo a varios días: mediante `num_steps=20` se generan pronósticos de 5 días con muestreo de ruido nuevo en cada paso de 6 horas, adecuado para seguimiento continuo de sistemas tropicales.
- Evaluación y validación científica: las revisiones `<2024` y `<2023` permiten evaluar el modelo sobre años que no ha visto durante el entrenamiento, reproduciendo los resultados de 2024 y 2023 del artículo de referencia.
- Investigación en predicción meteorológica con aprendizaje automático: al ser una FGN con modulación de ruido en las normalizaciones, sirve como base para estudiar métodos generativos alternativos a la difusión en predicción atmosférica.
- Análisis de estructura de vientos de ciclones: los 17 diagnósticos (radios de 34/50/64 nudos por cuadrante, radio de viento máximo, presión central) permiten alimentar pipelines de evaluación de impacto y de extracción de trayectorias, que según la model card sigue siendo un paso separado en el repositorio original.
- Docencia y reproducción de resultados: la disponibilidad de pesos en safetensors y de un demo oficial permite reproducir experimentos y comparar con la variante WeatherNext2.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; el repositorio ocupa 4,0 GB en safetensors y el modelo tiene 215,4 M de parámetros, por lo que los pesos en precisión nativa caben holgadamente en GPUs de consumo, aunque el consumo real depende del tamaño de lote, del número de miembros del ensemble y de la resolución de la rejilla (721 × 1440).
- GPU recomendadas: no disponible. El ejemplo de la model card usa `device_map="auto"`, lo que permite reparto automático entre dispositivos disponibles.
- ¿Cabe en GPU de consumo? Por tamaño de pesos, sí es plausible en GPUs de consumo con suficiente VRAM para lotes y ensembles; no se especifican modelos concretos en la información disponible.
- Opciones de despliegue: Transformers con la rama `add-weathernext2` del repositorio de kashif (`pip install "git+https://github.com/kashif/transformers.git@add-weathernext2"`), junto con `torch` y `accelerate`. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / ventana | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| WeatherNext Cyclones (model2) | 215.419.937 | 2 fotogramas HRES separados 6 h; paso de 6 h | Predicción meteorológica y ciclones tropicales | cc-by-4.0 | Hugging Face (`kashif/weathernext-cyclones-model2`) |
| WeatherNext2 | no disponible | no disponible | Predicción meteorológica; añade vientos a 100 m | no disponible | Hugging Face (`kashif/weathernext2`) |
| Otras alternativas | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparativa se limita a WeatherNext2, cuya arquitectura es idéntica y del que este modelo difiere solo en la ejecución de entrenamiento y en que WeatherNext 2 predice además vientos a 100 m. No se dispone de datos de benchmarks ni de otras alternativas en la información proporcionada.

## Limitaciones y advertencias

- Los resultados de ciclones son diagnósticos en rejilla, no trayectorias; la extracción de trayectorias sigue siendo un paso separado en el repositorio original.
- El soporte de WeatherNext 2 no está en una versión publicada de Transformers; hasta que se fusione el PR huggingface/transformers#47874 es necesario instalar la rama `add-weathernext2`, lo que supone un riesgo para producción.
- El modelo predice campos normalizados; es imprescindible usar `WeatherNext2FeatureExtractor` para la normalización, los forzamientos de reloj y la conversión a unidades físicas, e inicializar desde dos fotogramas de análisis HRES cronológicos separados 6 horas con latitud ascendente, los niveles de presión del checkpoint y todos los campos de entrada configurados, incluidos los estáticos.
- El ruido lo muestrea el procesador, no la pasada hacia delante del modelo; no debe pasarse un segundo argumento `noise` ni repetir la máscara de atención entre miembros del ensemble.
- En `generate()`, `seconds_since_epoch` es el tiempo válido del primer pronóstico, no el del último fotograma de condicionamiento.
- Las distintas revisiones están entrenadas hasta fechas de corte diferentes; usar una revisión inadecuada puede invalidar la evaluación sobre un año concreto.
- No se dispone de información sobre sesgos, riesgo de alucinación (concepto no aplicable a un modelo numérico), limitaciones idiomáticas ni latencia.
- La licencia CC-BY-4.0 permite uso comercial con atribución; deben respetarse sus términos.
- No se especifican requisitos de hardware, cuantizaciones ni rendimiento medido, lo que dificulta planificar un despliegue en producción.

## Enlaces

- Hugging Face: https://huggingface.co/kashif/weathernext-cyclones-model2
- Modelo WeatherNext2: https://huggingface.co/kashif/weathernext2
- PR de Transformers: https://github.com/huggingface/transformers/pull/47874
- Rama de Transformers con soporte: https://github.com/kashif/transformers/tree/add-weathernext2
- Documentación del modelo: https://github.com/kashif/transformers/blob/add-weathernext2/docs/source/en/model_doc/weathernext2.md
- Demo oficial: https://github.com/google-deepmind/weathernext/blob/main/docs/weathernext2/wn2_demo.ipynb
- Repositorio de Google DeepMind: https://github.com/google-deepmind/weathernext
- Artículo de referencia: https://arxiv.org/abs/2506.10772
