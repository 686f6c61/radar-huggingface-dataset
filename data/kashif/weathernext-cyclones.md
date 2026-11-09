# kashif/weathernext-cyclones

## Resumen

WeatherNext Cyclones es la variante especializada en ciclones tropicales de WeatherNext 2, la familia de modelos meteorológicos de Google DeepMind. El modelo estuvo operativo durante la temporada de huracanes del Atlántico de 2025 (conocido públicamente como FNV3, y su versión postprocesada por el NHC como GDMI). Resuelve el problema de la predicción determinista y probabilística de ciclones tropicales mediante una red neuronal generativa que sustituye parcialmente los métodos numéricos tradicionales.

Técnicamente es una *Functional Generative Network* (FGN): en lugar de inyectar ruido en la entrada o ejecutar un sampler de difusión, muestrea un vector de ruido de 32 dimensiones por miembro del ensemble y lo usa para modular la escala y el offset de cada capa de normalización. Una pasada hacia delante avanza el estado de la atmósfera 6 horas sobre una rejilla de 0,25° de latitud/longitud, prediciendo 13 niveles de presión de temperatura, geopotencial, viento y humedad, además de campos de superficie, precipitación y 17 diagnósticos de ciclón tropical.

El modelo tiene 215,4 millones de parámetros y comparte arquitectura con WeatherNext2; las diferencias están en el entrenamiento y en que WeatherNext 2 predice además vientos a 100 m. Se distribuye bajo licencia CC-BY-4.0 con pesos en safetensors y requiere una rama específica de Transformers aún no fusionada en la versión estable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Functional Generative Network (FGN); red neuronal con modulación de capas de normalización por ruido; arquitectura idéntica a WeatherNext2 |
| Parametros totales | 215.419.937 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; entrada de 2 marcos temporales consecutivos separados 6 h) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

WeatherNext Cyclones es una Functional Generative Network en la que la estocasticidad se introduce mediante un vector de ruido de 32 dimensiones por miembro del ensemble. Este vector modula la escala y el offset de todas las capas de normalización del modelo, de modo que cada muestra produce un pronóstico autoconsistente y un ensemble se obtiene simplemente repitiendo la dimensión de batch. La arquitectura es idéntica a la de WeatherNext2; las diferencias entre ambos residen exclusivamente en las ejecuciones de entrenamiento y en que WeatherNext 2 predice además vientos a 100 m.

El modelo opera sobre una rejilla de 0,25° de latitud/longitud y avanza el estado atmosférico en pasos de 6 horas. Predice 13 niveles de presión de temperatura, geopotencial, viento y humedad, campos de superficie, precipitación y 17 diagnósticos de ciclón tropical (existencia, velocidad del viento, radios de vientos de 34/50/64 nudos por cuadrante, radio de viento máximo y presión central). Se ofrecen tres revisiones entrenadas hasta cortes temporales distintos (`main` hasta 2024, `<2024` hasta 2023 y `<2023` hasta 2022) para permitir evaluación sobre años no vistos, con cuatro miembros entrenados independientemente (`model1`–`model4`) en cada revisión. No se especifican en la información disponible el número de tokens ni la composición exacta del dataset de entrenamiento, ni si se emplearon RLHF o DPO (no aplicables a este dominio).

## Capacidades

- Predicción meteorológica global a 6 horas por paso sobre rejilla de 0,25°, con 13 niveles de presión para temperatura, geopotencial, viento y humedad.
- Predicción de campos de superficie y precipitación.
- Predicción de 17 diagnósticos de ciclón tropical: existencia, velocidad del viento, radios de vientos de 34/50/64 nudos por cuadrante, radio de viento máximo y presión central.
- Generación de ensembles mediante muestreo de ruido: cada muestra produce un pronóstico autoconsistente y el ensemble se obtiene repitiendo la dimensión de batch.
- Rollout autorregresivo multi-paso mediante `generate()`, con muestreo de ruido nuevo en cada paso de 6 horas.
- Soporte de múltiples condiciones iniciales y miembros de ensemble combinados en la dimensión de batch.
- No soporta tool calling, function calling, agentes ni capacidades multilingües (no es un modelo de lenguaje).

## Casos de uso

- Predicción operativa de trayectoria e intensidad de ciclones tropicales: el modelo genera diagnósticos de existencia, velocidad del viento y presión central cada 6 horas, adecuados para alimentar sistemas de alerta temprana en servicios meteorológicos nacionales.
- Generación de ensembles probabilísticos de ciclones: con `generate(num_members=8)` se obtienen 8 pronósticos autoconsistentes por condición inicial, lo que permite estimar la incertidumbre de trayectoria e intensidad sin ejecutar múltiples modelos.
- Evaluación retrospectiva de modelos: las revisiones `<2024` y `<2023` permiten evaluar sobre años no vistos y reproducir los resultados del paper en 2024 y 2023 respectivamente.
- Investigación en predicción meteorológica con aprendizaje profundo: la arquitectura FGN y la modulación por ruido de las capas de normalización son un objeto de estudio para investigadores que comparan métodos generativos en dominios físicos.
- Prototipado de pipelines de pronóstico a medio plazo: el rollout autorregresivo de 20 pasos (5 días) permite construir pronósticos de varios días sobre rejilla global para investigación y validación.
- Análisis de riesgo climático y de impacto: los campos de precipitación, viento y presión central a 0,25° permiten alimentar modelos de impacto (inundaciones, daños por viento) en estudios de riesgo de ciclones.
- Benchmarking de modelos meteorológicos: sirve como referencia para comparar modelos de pronóstico neuronal frente a métodos numéricos tradicionales en la predicción de ciclones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 215,4 millones de parámetros, los pesos en fp32 ocupan aproximadamente 0,86 GB; en fp16/bf16, unos 0,43 GB. La memoria adicional depende del tamaño de la rejilla (721×1440 por campo), del número de campos y del tamaño del ensemble, por lo que el consumo real es considerablemente mayor que el de los pesos.
- GPU recomendadas: no disponible en la información proporcionada. Por tamaño de parámetros, una GPU consumer con suficiente memoria para los tensores de la rejilla sería suficiente en principio, pero no se confirma.
- Cabe en GPU consumer: probablemente sí por tamaño de pesos, pero no confirmado en la información disponible.
- Opciones de despliegue: Transformers (rama `add-weathernext2` de kashif), con `device_map="auto"`; requiere `torch` y `accelerate`. No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Resolucion | Contexto temporal | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| WeatherNext Cyclones | 215,4 M | 0,25° | 2 marcos de 6 h; rollout autorregresivo | CC-BY-4.0 | Hugging Face (kashif/weathernext-cyclones) |
| WeatherNext2 | no disponible | 0,25° | 2 marcos de 6 h; rollout autorregresivo | no disponible | Hugging Face (kashif/weathernext2) |
| GraphCast | no disponible | 0,25° | no disponible | no disponible | no disponible |

La comparativa se limita a WeatherNext2, que comparte arquitectura y difiere en entrenamiento y en la predicción adicional de vientos a 100 m. No se dispone de datos de benchmarks ni de especificaciones de GraphCast u otros modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- Los resultados de ciclón son diagnósticos en rejilla, no trayectorias; la extracción de trayectorias sigue siendo un paso separado en el repositorio original.
- Requiere una rama no fusionada de Transformers (`add-weathernext2`); no funciona con una versión estable publicada, lo que supone un riesgo para producción.
- El ruido lo muestrea el procesador, no el forward del modelo; pasar un segundo argumento `noise` o repetir la máscara sobre los miembros del ensemble provoca errores.
- La inicialización requiere dos marcos cronológicos de análisis HRES separados 6 horas, con latitud ascendente, los niveles de presión del checkpoint y todos los campos de entrada configurados, incluidos los estáticos.
- No se especifican sesgos conocidos, riesgo de alucinación (no aplica en el sentido habitual), limitaciones de idioma ni restricciones adicionales de licencia para uso comercial más allá de CC-BY-4.0 (que exige atribución).
- El tamaño del repositorio es de 84,6 GB, lo que implica requisitos de almacenamiento considerables.
- No se dispone de información sobre latencia, throughput ni rendimiento comparado con modelos numéricos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kashif/weathernext-cyclones
- WeatherNext2 en Hugging Face: https://huggingface.co/kashif/weathernext2
- Pull request de Transformers: https://github.com/huggingface/transformers/pull/47874
- Rama de Transformers con soporte: https://github.com/kashif/transformers/tree/add-weathernext2
- Documentación del modelo en la rama: https://github.com/kashif/transformers/blob/add-weathernext2/docs/source/en/model_doc/weathernext2.md
- Demo oficial: https://github.com/google-deepmind/weathernext/blob/main/docs/weathernext2/wn2_demo.ipynb
- Repositorio oficial de WeatherNext: https://github.com/google-deepmind/weathernext
- Paper (arXiv:2506.10772): https://arxiv.org/abs/2506.10772
