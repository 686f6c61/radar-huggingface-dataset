# kashif/weathernext2-model4

## Resumen

WeatherNext 2 (model4) es un modelo global de predicción meteorológica a medio plazo desarrollado por Google DeepMind y Google Research. Se distribuye en Hugging Face bajo el identificador `kashif/weathernext2-model4` y corresponde a la cuarta ejecución de entrenamiento independiente de la familia WeatherNext 2. El modelo realiza una pasada forward para avanzar el estado de la atmósfera 6 horas sobre una rejilla global de 0,25° de latitud y longitud, prediciendo 13 niveles de presión de temperatura, geopotencial, viento y humedad, junto con campos de superficie, precipitación, vientos a 100 m y un conjunto de diagnósticos de ciclones tropicales.

La innovación principal es su naturaleza de *Functional Generative Network* (FGN): en lugar de inyectar un campo de ruido en la entrada o ejecutar un muestreador de difusión, el modelo extrae un único vector de ruido de 32 dimensiones por miembro del ensemble y lo utiliza para modular la escala y el desplazamiento de todas las capas de normalización. Una extracción produce una predicción autoconsistente, y un ensemble es simplemente varias extracciones, lo que en la práctica se reduce a la dimensión de batch.

Este checkpoint concreto (`WeatherNext2_<2025_model4`) se ha entrenado con datos hasta 2024 y se ha ajustado finamente para la inicialización a partir del análisis operativo HRES del ECMWF. Con 215,4 millones de parámetros y un repositorio de 2,2 GB, es relevante ahora porque forma parte de una familia de cuatro modelos independientes que pueden combinarse en ensembles multi-modelo, y porque su integración en Transformers aún está pendiente de fusión (PR #47874), lo que lo sitúa en la frontera de la disponibilidad práctica para investigadores.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Functional Generative Network (FGN) con graph neural network sobre malla icosaédrica |
| Parametros totales | 215.424.547 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de predicción meteorológica; 2 pasos temporales de entrada separados 6 h) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, presumiblemente fp32/bf16) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

WeatherNext 2 es una *Functional Generative Network* (FGN) que opera sobre una malla icosaédrica de 40.962 nodos con resolución de 0,25° (rejilla de 721×1440). La arquitectura es de tipo graph neural network, no un transformer de lenguaje: procesa campos meteorológicos definidos sobre la malla y produce el estado atmosférico avanzado 6 horas. La generación estocástica se logra mediante un vector de ruido de 32 dimensiones por miembro que modula la escala y el desplazamiento de cada capa de normalización, en lugar de un esquema de difusión o de inyección de ruido en la entrada.

El checkpoint `model4` se ha entrenado con datos hasta 2024 y se ha ajustado finamente para la inicialización desde el análisis operativo HRES del ECMWF. La familia incluye cuatro ejecuciones de entrenamiento independientes (model1 a model4) que pueden combinarse en ensembles multi-modelo. El modelo predice campos normalizados; el `WeatherNext2FeatureExtractor` se encarga de la normalización, los forzamientos de reloj y la conversión a unidades físicas. La predicción es autorregresiva: `generate()` avanza cada miembro usando su propio estado predicho y muestrea ruido nuevo en cada paso de 6 horas. No se dispone de información sobre el número exacto de tokens de entrenamiento ni sobre la composición detallada del dataset más allá de la mención a datos hasta 2024 y al ajuste con HRES.

## Capacidades

- Predicción meteorológica global a medio plazo: avance del estado atmosférico en pasos de 6 horas sobre rejilla de 0,25°.
- Predicción de 13 niveles de presión de temperatura, geopotencial, viento y humedad.
- Predicción de campos de superficie, precipitación y vientos a 100 m.
- Diagnósticos de ciclones tropicales.
- Generación de ensembles mediante ruido: `generate(num_members=8)` produce 8 predicciones autoconsistentes con pesos compartidos y ruido independiente.
- Rollout autorregresivo multi-paso: `generate(num_steps=20)` cubre 5 días de predicción.
- Ensembles multi-modelo: combinación de las cuatro ejecuciones independientes (model1 a model4) para agrupar ambos tipos de ensemble.
- Control de semilla mediante `torch.Generator` para reproducibilidad.
- No soporta tool calling, agentes, razonamiento multi-paso en lenguaje natural ni capacidades multilingües: no es un modelo de lenguaje.

## Casos de uso

- Predicción operativa a medio plazo: el modelo genera un pronóstico global a 5 días (20 pasos de 6 horas) sobre rejilla de 0,25°, adecuado para alimentar sistemas de alerta temprana con resolución espacial suficiente para escala regional.
- Generación de ensembles probabilísticos: con `num_members=8` o más, se obtienen distribuciones de predicción para estimar incertidumbre en temperatura, viento y precipitación, útil en gestión de riesgos meteorológicos.
- Predicción de vientos a 100 m para energía eólica: el modelo predice explícitamente vientos a 100 m, lo que permite estimar producción eólica a partir de ensembles con horizonte de varios días.
- Diagnóstico de ciclones tropicales: los diagnósticos incluidos permiten seguir trayectorias y estructuras de ciclones en los pronósticos generados, con aplicación en protección civil.
- Investigación climática y comparación de modelos: al ser una familia de cuatro ejecuciones independientes, permite estudiar la dispersión entre modelos y comparar con reanálisis HRES del ECMWF.
- Ajuste fino para inicialización operativa: el checkpoint está específicamente ajustado para inicializarse desde análisis HRES, lo que facilita su integración en pipelines operativos que ya dispongan de esos datos.
- Docencia y reproducción de investigación: la licencia CC-BY-4.0 y la disponibilidad en Hugging Face permiten su uso en entornos académicos para experimentar con FGN y ensembles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 215,4 millones de parámetros, los pesos en fp32 ocupan aproximadamente 0,86 GB; en bf16, unos 0,43 GB. El repositorio completo pesa 2,2 GB, lo que sugiere que puede incluir pesos en fp32 y otros artefactos.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM libre puede cargar los pesos; una RTX 4090, A100 o H100 ofrece margen sobrado para ensembles grandes y rollouts de 20 pasos.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna (RTX 3060 o superior) para inferencia de un miembro; para ensembles de 8 miembros y rollouts largos se recomienda al menos 8-12 GB de VRAM.
- Opciones de despliegue: `transformers` con la rama `add-weathernext2` (PR #47874 pendiente de fusión), `device_map="auto"` y `torch`; no se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Resolucion | Malla | Vientos 100 m | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| WeatherNext2 (model4) | 215,4 M | 0,25° (721×1440) | 40.962 nodos | sí | CC-BY-4.0 | Hugging Face (rama Transformers pendiente) |
| WeatherNext2 (model1, default) | 183,8 M | 0,25° (721×1440) | 40.962 nodos | sí | CC-BY-4.0 | Hugging Face |
| WeatherNextCyclones | 183,8 M | 0,25° (721×1440) | 40.962 nodos | no | CC-BY-4.0 | Hugging Face |
| WeatherNext2 (model2, model3) | no disponible | 0,25° | 40.962 nodos | sí | CC-BY-4.0 | Hugging Face |

## Limitaciones y advertencias

- El soporte en Transformers no está en una versión publicada: requiere instalar la rama `add-weathernext2` hasta que se fusione el PR #47874, lo que implica riesgo de cambios en la API.
- El checkpoint requiere entradas de viento a 100 m que no están presentes en los conjuntos de datos de muestra publicados, lo que complica la reproducción directa con datos de ejemplo.
- La inicialización requiere dos fotogramas cronológicos de análisis HRES separados 6 horas, con latitud ascendente, los niveles de presión del checkpoint y todos los campos de entrada configurados, incluidos los estáticos.
- El ruido lo muestrea el procesador, no el forward del modelo; pasar un segundo argumento `noise` o repetir la máscara sobre los miembros del ensemble provoca errores.
- No es un modelo de lenguaje: no dispone de capacidades de generación de texto, código, razonamiento lingüístico ni tool calling.
- Riesgo de alucinación no aplica en el sentido lingüístico, pero sí existe incertidumbre en las predicciones, mitigable mediante ensembles.
- Sesgos conocidos: no disponibles en la información proporcionada; cabe esperar sesgos derivados de los datos de entrenamiento (hasta 2024) y del ajuste a HRES.
- Licencia CC-BY-4.0: permite uso comercial con atribución, pero conviene revisar los términos exactos y la atribución requerida a Google DeepMind y Google Research.
- Para producción, la dependencia de una rama no fusionada de Transformers y de datos HRES operativos son los principales caveats.

## Enlaces

- Hugging Face: https://huggingface.co/kashif/weathernext2-model4
- Modelo base (model1, default): https://huggingface.co/kashif/weathernext2
- Modelo model2: https://huggingface.co/kashif/weathernext2-model2
- Modelo model3: https://huggingface.co/kashif/weathernext2-model3
- WeatherNextCyclones: https://huggingface.co/kashif/weathernext-cyclones
- Paper (arXiv:2506.10772): https://arxiv.org/abs/2506.10772
- PR de Transformers: https://github.com/huggingface/transformers/pull/47874
- Rama de Transformers: https://github.com/kashif/transformers.git (rama `add-weathernext2`)
- Documentación del modelo: https://github.com/kashif/transformers/blob/add-weathernext2/docs/source/en/model_doc/weathernext2.md
- Demo oficial: https://github.com/google-deepmind/weathernext/blob/main/docs/weathernext2/wn2_demo.ipynb
- Repositorio oficial: https://github.com/google-deepmind/weathernext
