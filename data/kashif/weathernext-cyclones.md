# kashif/weathernext-cyclones

## Resumen

WeatherNext Cyclones es la variante especializada en ciclones tropicales de WeatherNext 2, el sistema de predicción meteorológica desarrollado por Google DeepMind. El modelo ejecutado en vivo durante la temporada de huracanes del Atlántico de 2025 (conocido públicamente como FNV3, y cuya versión postprocesada por el NHC fue GDMI) avanza el estado de la atmósfera en pasos de 6 horas sobre una rejilla de 0,25° de latitud/longitud, prediciendo 13 niveles de presión de temperatura, geopotencial, viento y humedad, además de campos de superficie, precipitación y 17 diagnósticos de ciclones tropicales.

Técnicamente se trata de una Functional Generative Network (FGN): en lugar de inyectar un campo de ruido en la entrada o ejecutar un muestreador de difusión, el modelo extrae un único vector de ruido de 32 dimensiones por miembro del ensemble y lo utiliza para modular la escala y el desplazamiento de todas las capas de normalización. Una extracción produce una predicción autoconsistente, y un ensemble es simplemente varias extracciones, lo que en la práctica se reduce a la dimensión de batch.

Con 215,4 millones de parámetros, el modelo es notablemente compacto para la tarea que resuelve, lo que lo hace viable en hardware modesto. La arquitectura es idéntica a la de WeatherNext2, diferenciándose únicamente en los entrenamientos y en que WeatherNext 2 predice además vientos a 100 m. Se distribuye bajo licencia CC-BY-4.0 e incluye cuatro miembros entrenados independientemente (`model1`–`model4`) por cada revisión temporal.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Functional Generative Network (FGN) con graph neural network; idéntica a WeatherNext2 |
| Parametros totales | 215.419.937 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de predicción meteorológica, no de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | cc-by-4.0 |
| Formato de pesos | safetensors |
| Resolución de rejilla | 0,25° latitud/longitud (721 × 1440) |
| Paso temporal | 6 horas por paso hacia adelante |
| Niveles de presión | 13 |
| Diagnósticos de ciclón | 17 |
| Dimensión del vector de ruido | 32 |
| Miembros del ensemble | 4 entrenados independientemente (model1–model4) |
| Revisiones | `main` (entrenado hasta 2024), `<2024` (hasta 2023), `<2023` (hasta 2022) |
| Tamaño del repo | 95,4 GB |

## Arquitectura y entrenamiento

El modelo es una Functional Generative Network construida sobre una graph neural network, con la misma arquitectura que WeatherNext2. La innovación principal reside en el mecanismo generativo: en lugar de los enfoques habituales de difusión o inyección de ruido en la entrada, el modelo muestrea un vector de 32 dimensiones por miembro y lo emplea para modular la escala y el desplazamiento de cada capa de normalización de la red. Esto permite generar ensembles de forma trivial, ya que cada miembro es simplemente una fila adicional del batch con un ruido distinto.

El entrenamiento se organiza en revisiones con distintas fechas de corte de datos, lo que permite evaluar el modelo en años que no ha visto. La revisión `main` está entrenada con datos hasta 2024 y corresponde a los modelos operativos de la temporada 2025 (`WeatherNextCyclones_<2025_model{1..4}`). La revisión `<2024` está entrenada hasta 2023 y reproduce los resultados del artículo para 2024, mientras que `<2023` está entrenada hasta 2022 y reproduce los resultados para 2023. Cada revisión incluye los cuatro miembros entrenados independientemente. No se especifican en la información disponible el número de tokens de entrenamiento ni la composición exacta del dataset, aunque por la naturaleza del modelo se trata de reanálisis meteorológicos (menciona HRES como fuente de las condiciones iniciales).

Las condiciones iniciales se construyen a partir de dos fotogramas cronológicos de análisis HRES separados por seis horas, con latitud ascendente, los niveles de presión del checkpoint y todos los campos de entrada configurados, incluidos los campos estáticos. El modelo predice campos normalizados, y es el `WeatherNext2FeatureExtractor` el que gestiona la normalización, los forzamientos de reloj y la conversión de vuelta a unidades físicas. La generación autorregresiva mediante `generate()` prepara las entradas, avanza cada miembro usando su propio estado predicho y muestrea ruido nuevo en cada paso de seis horas.

## Capacidades

- Predicción meteorológica global a 0,25° de resolución con paso temporal de 6 horas.
- Predicción de 13 niveles de presión de temperatura, geopotencial, viento y humedad.
- Predicción de campos de superficie y precipitación.
- Predicción de 17 diagnósticos de ciclones tropicales: existencia, velocidad del viento, radios de vientos de 34/50/64 nudos por cuadrante, radio del viento máximo y presión central.
- Generación de ensembles nativos mediante muestreo de ruido (hasta 8 miembros o más, configurable con `num_members`).
- Despliegue autorregresivo multi-paso (por ejemplo, 20 pasos equivalen a 5 días de predicción).
- Soporte de múltiples condiciones iniciales, con indexación determinista de miembros (`i * num_members + m`).
- Ejecución en vivo en un entorno operativo real (temporada de huracanes del Atlántico de 2025).
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües: no es un modelo de lenguaje.

## Casos de uso

- Predicción operativa de trayectorias e intensidad de ciclones tropicales: el modelo genera diagnósticos de existencia, presión central y radios de vientos por cuadrante, útiles para alimentar sistemas de alerta temprana. La extracción de trayectorias sigue siendo un paso separado en el repositorio original.
- Generación de ensembles probabilísticos de ciclones: con `num_members=8` y varias extracciones de ruido se obtiene una distribución de escenarios de viento y presión, adecuada para evaluación de riesgo. El coste es bajo porque el ensemble es simplemente la dimensión de batch.
- Evaluación retrospectiva y validación científica: las revisiones `<2024` y `<2023` permiten reproducir los resultados del artículo para 2024 y 2023 respectivamente, lo que facilita la comparación con otros modelos en años no vistos durante el entrenamiento.
- Investigación en modelos generativos meteorológicos: la arquitectura FGN con modulación de normalización por ruido es un objeto de estudio interesante para quienes investigan alternativas a la difusión en predicción científica.
- Predicción de precipitación y campos de superficie a escala global: los campos de superficie y precipitación permiten alimentar modelos hidrológicos o de impacto en regiones afectadas por ciclones.
- Integración en pipelines de investigación con Transformers: al usar la librería `transformers` (con la rama pendiente de fusión), el modelo se integra en flujos existentes de PyTorch y `accelerate`, con `device_map="auto"` para despliegue multi-GPU.
- Análisis de radios de viento para sectores asegurador y energético: los radios de 34/50/64 nudos por cuadrante son directamente utilizables en modelos de pérdidas y en la planificación de paradas de infraestructuras eólicas marinas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona que las revisiones `<2024` y `<2023` reproducen los resultados del artículo (arXiv:2506.10772) para 2024 y 2023 respectivamente, pero no se incluyen cifras concretas en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: con 215,4 millones de parámetros, los pesos en fp32 ocupan aproximadamente 0,86 GB y en fp16/bf16 unos 0,43 GB. La memoria adicional la dominan las activaciones sobre la rejilla de 721 × 1440 con 13 niveles de presión y múltiples campos, por lo que el consumo real depende del tamaño de batch y del número de miembros del ensemble.
- GPU recomendadas: cualquier GPU con al menos 8-16 GB de VRAM debería ser suficiente para inferencia en fp16; una RTX 4090, A100 o H100 ofrece margen amplio para ensembles grandes y rollouts multi-paso.
- Cabe en GPU de consumo: sí, previsiblemente en tarjetas como RTX 3090, RTX 4090 o superiores, dado el reducido número de parámetros. No se dispone de cifras medidas de VRAM pico.
- Opciones de despliegue: la librería `transformers` con la rama `add-weathernext2` (PR huggingface/transformers#47874 pendiente de fusión), más `torch` y `accelerate`. No se mencionan soportes para vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Resolucion | Paso temporal | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| WeatherNext Cyclones | 215,4 M | 0,25° | 6 h | CC-BY-4.0 | Hugging Face (kashif/weathernext-cyclones) |
| WeatherNext2 | no disponible | 0,25° | 6 h | no disponible | Hugging Face (kashif/weathernext2) |
| Otros modelos meteorológicos (GraphCast, Pangu-Weather, etc.) | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparativa se limita a WeatherNext2, del que se indica que comparte arquitectura y difiere solo en el entrenamiento y en predecir además vientos a 100 m. No se dispone de datos de benchmarks ni de especificaciones de otros modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- El modelo predice diagnósticos de ciclón en rejilla, no trayectorias. La extracción de trayectorias es un paso separado en el repositorio original y no está incluida.
- No es un modelo de lenguaje: no soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües.
- Requiere una versión no publicada de Transformers (rama `add-weathernext2`), lo que introduce riesgo de inestabilidad y cambios de API hasta la fusión del PR.
- Las condiciones iniciales deben prepararse con cuidado: dos fotogramas HRES separados por seis horas, latitud ascendente, niveles de presión del checkpoint y todos los campos de entrada, incluidos los estáticos.
- El ruido lo muestrea el procesador, no el forward del modelo; pasar un segundo argumento `noise` o repetir la máscara sobre los miembros del ensemble provoca errores.
- Riesgo de alucinación no aplicable en el sentido habitual, pero sí de predicciones físicamente inconsistentes en regímenes extremos o fuera de la distribución de entrenamiento; las revisiones con corte temporal permiten evaluar este aspecto.
- No se dispone de información sobre sesgos, rendimiento por región o limitaciones idiomáticas (no aplica).
- Licencia CC-BY-4.0: permite uso comercial con atribución, pero conviene revisar los términos exactos y las condiciones de atribución a Google DeepMind.
- El tamaño del repositorio (95,4 GB) implica una descarga considerable, aunque los pesos en sí sean pequeños; probablemente incluye múltiples revisiones y miembros.
- No se han publicado cifras de benchmarks en la información disponible, por lo que no es posible validar el rendimiento relativo frente a alternativas sin consultar el artículo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kashif/weathernext-cyclones
- WeatherNext2 en Hugging Face: https://huggingface.co/kashif/weathernext2
- Artículo (arXiv:2506.10772): https://arxiv.org/abs/2506.10772
- Pull request de Transformers: https://github.com/huggingface/transformers/pull/47874
- Rama de Transformers con soporte: https://github.com/kashif/transformers/tree/add-weathernext2
- Documentación del modelo: https://github.com/kashif/transformers/blob/add-weathernext2/docs/source/en/model_doc/weathernext2.md
- Demo oficial: https://github.com/google-deepmind/weathernext/blob/main/docs/weathernext2/wn2_demo.ipynb
- Repositorio de Google DeepMind: https://github.com/google-deepmind/weathernext
