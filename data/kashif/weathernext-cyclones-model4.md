# kashif/weathernext-cyclones-model4

## Resumen

WeatherNext Cyclones (model4) es la variante especializada en ciclones tropicales de WeatherNext 2, el sistema de predicción meteorológica desarrollado por Google DeepMind. El modelo ejecutado en producción durante la temporada de huracanes del Atlántico de 2025 (conocido públicamente como FNV3, y como GDMI en la versión postprocesada del NHC) avanza el estado de la atmósfera en pasos de 6 horas sobre una rejilla de 0,25° de latitud/longitud, prediciendo 13 niveles de presión de temperatura, geopotencial, viento y humedad, además de campos de superficie, precipitación y 17 diagnósticos de ciclones tropicales.

Se trata de una Functional Generative Network (FGN): en lugar de inyectar ruido en la entrada o ejecutar un muestreador de difusión, el modelo extrae un único vector de ruido de 32 dimensiones por miembro del ensemble y lo utiliza para modular la escala y el desplazamiento de cada capa de normalización. Una extracción produce una predicción autoconsistente, y un ensemble es simplemente varias extracciones, lo que en la práctica se reduce a la dimensión de batch.

La arquitectura es idéntica a la de WeatherNext2; ambos difieren únicamente en sus ejecuciones de entrenamiento y en que WeatherNext 2 predice además vientos a 100 m. El modelo tiene 215 millones de parámetros, emplea una red neuronal de grafos (graph neural network) y se distribuye bajo licencia CC-BY-4.0. Es relevante ahora porque representa uno de los primeros sistemas de predicción de ciclones tropicales de código abierto con capacidad operativa demostrada, permitiendo a investigadores evaluar y reproducir resultados sobre años no vistos mediante las distintas revisiones.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Functional Generative Network (FGN) con graph neural network |
| Parámetros totales | 215.419.937 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (predicción autoregresiva en pasos de 6 h) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (modelo meteorológico, no lingüístico) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es una Functional Generative Network que, a diferencia de los modelos generativos basados en difusión, no inyecta un campo de ruido en la entrada ni ejecuta un muestreador iterativo. En su lugar, extrae un vector de ruido de 32 dimensiones por miembro del ensemble y lo emplea para modular la escala y el desplazamiento de todas las capas de normalización. La arquitectura subyacente es una red neuronal de grafos sobre una rejilla de 0,25° de latitud/longitud, idéntica a la de WeatherNext2, con la diferencia de que WeatherNext 2 predice además vientos a 100 m.

El modelo se entrena sobre análisis HRES y genera predicciones en pasos de 6 horas. Predice 13 niveles de presión de temperatura, geopotencial, viento y humedad, además de campos de superficie, precipitación y 17 diagnósticos de ciclones tropicales (existencia, velocidad del viento, radios de vientos de 34/50/64 nudos por cuadrante, radio de viento máximo y presión central). El repositorio ofrece tres revisiones entrenadas hasta distintos cortes temporales: `main` (entrenada hasta 2024, operativa para la temporada 2025), `<2024` (hasta 2023, reproduce los resultados de 2024 del paper) y `<2023` (hasta 2022, reproduce los resultados de 2023). El paper asociado es arXiv:2506.10772. No se dispone de información detallada sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de RLHF/DPO.

## Capacidades

- Predicción meteorológica a 6 horas sobre rejilla global de 0,25° de latitud/longitud.
- Predicción de 13 niveles de presión de temperatura, geopotencial, viento y humedad.
- Predicción de campos de superficie y precipitación.
- Predicción de 17 diagnósticos de ciclones tropicales: existencia, velocidad del viento, radios de vientos de 34/50/64 nudos por cuadrante, radio de viento máximo y presión central.
- Generación de ensembles mediante ruido independiente por miembro, con los miembros ejecutados a lo largo del eje de batch.
- Despliegue autoregresivo multi-paso mediante `generate()`, con muestreo de ruido nuevo en cada paso de 6 horas.
- Soporte de múltiples condiciones iniciales con indexación determinista de miembros (`i * num_members + m`).
- Evaluación sobre años no vistos mediante las revisiones `<2024` y `<2023`.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso en lenguaje natural ni capacidades multilingües.

## Casos de uso

- Predicción operativa de trayectoria e intensidad de ciclones tropicales: el modelo genera diagnósticos de existencia, velocidad del viento y presión central que alimentan sistemas de alerta temprana, como demuestra su uso operativo durante la temporada atlántica de 2025.
- Generación de ensembles probabilísticos de ciclones: mediante `generate(num_members=8)` se obtienen múltiples escenarios autoconsistentes que permiten estimar la incertidumbre de la trayectoria e intensidad, útil para la gestión de riesgos y la comunicación de probabilidades.
- Predicción de vientos por cuadrante para evaluación de daños: los radios de vientos de 34/50/64 nudos por cuadrante permiten a aseguradoras y gestores de emergencias estimar la extensión del área afectada por vientos destructivos.
- Investigación y reproducción de resultados: las revisiones `<2024` y `<2023` permiten evaluar el modelo sobre años no vistos y reproducir los resultados publicados en el paper, facilitando la validación independiente y la comparación con modelos numéricos tradicionales.
- Predicción de precipitación asociada a ciclones: el campo de precipitación predicho sobre la rejilla de 0,25° permite anticipar inundaciones y deslizamientos en zonas costeras.
- Simulación de escenarios de temporada de huracanes: la capacidad de ejecutar rollouts autoregresivos de varios días (por ejemplo, 20 pasos = 5 días) permite generar escenarios sintéticos para planificación de infraestructuras y análisis de riesgo climático.
- Integración en pipelines de investigación meteorológica: al usar la librería `transformers` y safetensors, el modelo puede integrarse en flujos existentes de PyTorch y acelerarse con `accelerate` y `device_map="auto"`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Con 215 millones de parámetros, el peso en precisión completa (fp32) sería de aproximadamente 0,86 GB, y en fp16/bf16 de aproximadamente 0,43 GB; sin embargo, el consumo real depende de las activaciones de la rejilla de 721×1440 y del tamaño del batch y del ensemble.
- GPU recomendadas: no disponible en la información proporcionada. El ejemplo de la model card usa `device_map="auto"`, lo que permite despliegue en GPU con memoria suficiente o reparto entre dispositivos.
- Compatibilidad con GPU de consumo: no confirmada en la información disponible; el tamaño de parámetros sugiere que podría caber en GPU de consumo, pero las activaciones de la rejilla global pueden requerir memoria adicional.
- Opciones de despliegue: `transformers` (rama `add-weathernext2` de kashif hasta que se fusione huggingface/transformers#47874), `torch`, `accelerate`. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| WeatherNext Cyclones model4 | 215.419.937 | no disponible | CC-BY-4.0 | Hugging Face | Variante de ciclones tropicales, operativa en 2025 |
| WeatherNext2 | no disponible en la información | no disponible | no disponible | Hugging Face (kashif/weathernext2) | Arquitectura idéntica; predice además vientos a 100 m |
| Modelos numéricos tradicionales (HRES, GFS) | no aplica | no aplica | varía | operativa | No disponibles datos comparativos en la información |

No se dispone de datos de benchmarks ni de especificaciones completas de WeatherNext2 en la información proporcionada para una comparación cuantitativa.

## Limitaciones y advertencias

- El modelo predice diagnósticos de ciclones en rejilla, no trayectorias; la extracción de tracks sigue siendo un paso separado en el repositorio original.
- El soporte de WeatherNext 2 no está en una versión publicada de Transformers; hasta que se fusione huggingface/transformers#47874 es necesario instalar una rama específica, lo que supone un riesgo para producción.
- El ruido lo muestrea el procesador, no el forward del modelo; pasar un segundo argumento `noise` o repetir la máscara sobre los miembros del ensemble provoca errores de uso.
- El modelo predice campos normalizados; es imprescindible usar `WeatherNext2FeatureExtractor` para la normalización, los forzamientos de reloj y la conversión a unidades físicas.
- Requiere inicialización desde dos fotogramas cronológicos de análisis HRES separados 6 horas, con latitud ascendente, los niveles de presión del checkpoint y todos los campos de entrada configurados, incluidos los estáticos.
- Riesgo de alucinación y sesgos: no disponible en la información proporcionada; al ser un modelo meteorológico, los errores se manifiestan como predicciones físicamente inconsistentes o deriva en rollouts largos.
- Limitaciones de idioma: no aplica, ya que no es un modelo lingüístico.
- Licencia CC-BY-4.0: permite uso comercial con atribución; deben respetarse las condiciones de la licencia.
- Solo se ha validado operativamente en la temporada atlántica de 2025; el rendimiento en otras cuencas y temporadas no está documentado en la información disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kashif/weathernext-cyclones-model4
- WeatherNext2 (arquitectura base): https://huggingface.co/kashif/weathernext2
- Paper: https://arxiv.org/abs/2506.10772
- Pull request de Transformers: https://github.com/huggingface/transformers/pull/47874
- Rama de Transformers con soporte: https://github.com/kashif/transformers/tree/add-weathernext2
- Documentación del modelo: https://github.com/kashif/transformers/blob/add-weathernext2/docs/source/en/model_doc/weathernext2.md
- Demo oficial: https://github.com/google-deepmind/weathernext/blob/main/docs/weathernext2/wn2_demo.ipynb
- Repositorio oficial de WeatherNext: https://github.com/google-deepmind/weathernext
