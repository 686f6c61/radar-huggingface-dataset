# kashif/weathernext2-mini

## Resumen

WeatherNext 2 Mini es la variante ligera de WeatherNext Cyclones, el sistema de predicción meteorológica desarrollado por Google DeepMind. Este checkpoint, publicado en Hugging Face por el usuario kashif, reduce la resolución espacial de 0,25° a 1° y disminuye la anchura y profundidad de la red, lo que permite ejecutarlo en máquinas que no pueden alojar el modelo completo. Predice las mismas magnitudes que WeatherNext Cyclones: temperatura, geopotencial, viento y humedad en 13 niveles de presión, campos de superficie, precipitación y 17 diagnósticos de ciclones tropicales, aunque no incluye los vientos a 100 m que sí añade WeatherNext 2.

El modelo se presenta como una Functional Generative Network (FGN), un enfoque generativo que no inyecta ruido en la entrada ni ejecuta un muestreador de difusión. En su lugar, extrae un único vector de ruido de 32 dimensiones por miembro del ensemble y lo utiliza para modular la escala y el desplazamiento de todas las capas de normalización. Cada extracción produce una predicción autoconsistente y un ensemble se obtiene simplemente repitiendo el lote con distintas semillas.

Con 58,7 millones de parámetros y un repositorio de 3,1 GB, el modelo está pensado para pruebas locales y desarrollo, no para igualar la habilidad del modelo completo a 0,25°. Se distribuye bajo licencia CC BY 4.0 y requiere una rama específica de Transformers aún no fusionada en la versión estable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Functional Generative Network (FGN), grafos neuronales con modulación por ruido en capas de normalización |
| Parametros totales | 58.694.571 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (dos fotogramas de análisis HRES separados 6 horas como condición inicial) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de predicción numérica, no lingüístico) |
| Licencia | CC BY 4.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

WeatherNext 2 Mini emplea una arquitectura de red generativa funcional (FGN) que mantiene la estructura de los modelos a 0,25° pero con menor anchura y profundidad. La innovación principal reside en el mecanismo generativo: en lugar de un campo de ruido inyectado en la entrada o un proceso de difusión iterativo, el modelo muestrea un vector de 32 dimensiones por miembro del ensemble y lo usa para modular la escala y el desplazamiento de cada capa de normalización. Esto permite generar un pronóstico completo y autoconsistente con una sola pasada, y construir ensembles simplemente variando la semilla de ruido en la dimensión de lote.

El modelo se condiciona con dos fotogramas cronológicos de análisis HRES separados seis horas, con latitud ascendente, los niveles de presión del checkpoint y todos los campos de entrada configurados, incluidos los estáticos. La predicción se realiza sobre campos normalizados y el `WeatherNext2FeatureExtractor` se encarga de la normalización, los forzamientos de reloj y la conversión a unidades físicas. El despliegue autoregresivo se gestiona mediante `generate()`, que avanza cada miembro con su propio estado predicho y muestrea ruido nuevo en cada paso de seis horas. No se han publicado detalles sobre el volumen de datos de entrenamiento, la composición del dataset ni el uso de RLHF o DPO en la información disponible.

## Capacidades

- Predicción meteorológica global a resolución de 1° (181 × 360 celdas) para horizontes de hasta varios días mediante despliegue autoregresivo en pasos de seis horas.
- Predicción de 13 niveles de presión para temperatura, geopotencial, viento y humedad, además de campos de superficie y precipitación.
- Generación de 17 diagnósticos de ciclones tropicales como salidas en rejilla, no como trayectorias; la extracción de trayectorias requiere un paso separado en el repositorio original.
- Generación de ensembles mediante ruido: `generate(num_members=8)` repite cada condición inicial y ejecuta los miembros a lo largo del eje de lote, compartiendo pesos pero con ruido independiente.
- Soporte de múltiples condiciones iniciales: el miembro `m` de la condición `i` ocupa la fila `i * num_members + m`.
- Revisions con distintos cortes temporales de entrenamiento (`main` entrenado hasta 2023, `<2023` hasta 2022) para evaluar en años no vistos.
- No incluye los vientos a 100 m que sí incorpora WeatherNext 2.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües; es un modelo de predicción numérica.

## Casos de uso

- Pruebas locales de pipelines meteorológicos: el modelo cabe en máquinas sin capacidad para el checkpoint a 0,25° y permite validar la preparación de datos, normalización y postprocesado antes de escalar al modelo completo.
- Evaluación de ensembles con recursos limitados: con 58,7 millones de parámetros y resolución de 1°, se pueden generar ocho miembros con `num_members=8` en una sola GPU consumer para estudiar la dispersión del pronóstico.
- Desarrollo de sistemas de alerta temprana de ciclones tropicales: los 17 diagnósticos de ciclones en rejilla permiten prototipar la detección de estructuras ciclónicas antes de integrar la extracción de trayectorias del repositorio original.
- Validación de despliegue autoregresivo: `generate(num_steps=20)` produce pronósticos de cinco días con ruido renovado cada seis horas, útil para probar la estabilidad del rollout y el consumo de memoria antes de migrar al modelo a 0,25°.
- Investigación en modelos generativos funcionales: la modulación de capas de normalización por un vector de 32 dimensiones es un caso de estudio accesible para analizar cómo el ruido de bajo dimensionalidad controla la variabilidad del ensemble.
- Docencia y experimentación académica: el tamaño reducido y la licencia CC BY 4.0 permiten usar el modelo en cursos y trabajos de investigación sin restricciones comerciales.
- Integración en flujos de evaluación temporal: las revisions con corte en 2022 y 2023 permiten comparar el rendimiento en años no vistos sin filtrar datos de entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no se espera que esta variante iguale la habilidad del modelo completo a 0,25°.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 58,7 millones de parámetros en precisión completa (fp32) el peso ronda los 235 MB, y el repositorio de 3,1 GB incluye pesos y artefactos adicionales.
- GPU recomendadas: no disponibles; por tamaño, cualquier GPU con al menos unos pocos GB de VRAM debería poder cargar los pesos, aunque el coste real depende de la resolución de la rejilla (181 × 360) y del número de miembros del ensemble.
- Cabe en GPU consumer: previsiblemente sí, dado el reducido número de parámetros, aunque no se especifican modelos concretos.
- Opciones de despliegue: Transformers con la rama `add-weathernext2` del repositorio de kashif (`pip install "git+https://github.com/kashif/transformers.git@add-weathernext2"`), junto con `torch` y `accelerate`. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Resolucion | Contexto / condicion inicial | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| WeatherNext 2 Mini (este) | 58,7 M | 1° | 2 fotogramas HRES a 6 h | CC BY 4.0 | Hugging Face, rama de Transformers |
| WeatherNext Cyclones (0,25°) | no disponible | 0,25° | 2 fotogramas HRES a 6 h | no disponible en la informacion | Hugging Face (kashif/weathernext-cyclones) |
| WeatherNext 2 (0,25°) | no disponible | 0,25° | 2 fotogramas HRES a 6 h | no disponible en la informacion | Hugging Face (kashif/weathernext2) |

La comparativa se limita a las variantes del mismo sistema; no se dispone de datos de benchmarks ni de otros modelos meteorológicos comparables en la información proporcionada.

## Limitaciones y advertencias

- Menor habilidad predictiva que el modelo completo a 0,25°; la model card indica explícitamente que no se espera que iguale su rendimiento.
- No incluye los vientos a 100 m que sí incorpora WeatherNext 2.
- Los diagnósticos de ciclones son salidas en rejilla, no trayectorias; la extracción de trayectorias requiere un paso separado en el repositorio original.
- Requiere una rama no fusionada de Transformers (`add-weathernext2`); la compatibilidad con versiones estables no está garantizada hasta que se fusione el PR #47874.
- Los checkpoints Mini incluyen una sola red entrenada por corte temporal en lugar de un ensemble de cuatro miembros, por lo que solo aplica el ensemble de ruido.
- El ruido lo muestrea el procesador, no el forward del modelo; pasar un segundo argumento `noise` o repetir la máscara de atención sobre los miembros provoca errores.
- No se han publicado datos sobre sesgos, riesgo de alucinación en sentido lingüístico ni limitaciones idiomáticas; al ser un modelo numérico, estos conceptos no aplican directamente.
- Licencia CC BY 4.0: permite uso comercial con atribución, pero conviene revisar los términos completos antes de integrarlo en producción.

## Enlaces

- Hugging Face: https://huggingface.co/kashif/weathernext2-mini
- Modelo completo a 0,25°: https://huggingface.co/kashif/weathernext2
- WeatherNext Cyclones: https://huggingface.co/kashif/weathernext-cyclones
- Pull request de Transformers: https://github.com/huggingface/transformers/pull/47874
- Rama de Transformers: https://github.com/kashif/transformers/tree/add-weathernext2
- Documentación del modelo: https://github.com/kashif/transformers/blob/add-weathernext2/docs/source/en/model_doc/weathernext2.md
- Demo oficial: https://github.com/google-deepmind/weathernext/blob/main/docs/weathernext2/wn2_demo.ipynb
- Repositorio de Google DeepMind: https://github.com/google-deepmind/weathernext
- Paper: https://arxiv.org/abs/2506.10772
