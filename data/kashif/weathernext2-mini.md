# kashif/weathernext2-mini

## Resumen

WeatherNext 2 Mini es la variante ligera de WeatherNext Cyclones, el sistema de predicción meteorológica desarrollado por Google DeepMind. Frente al modelo completo a 0,25° de resolución, esta versión opera a 1° de resolución y reduce anchura y profundidad de la red, lo que permite ejecutarlo en máquinas que no pueden alojar el modelo completo. El checkpoint publicado por kashif en Hugging Face implementa la arquitectura en la librería Transformers.

El modelo es una Functional Generative Network (FGN): en lugar de inyectar ruido en la entrada o ejecutar un muestreador de difusión, extrae un único vector de ruido de 32 dimensiones por miembro del ensemble y lo utiliza para modular la escala y el desplazamiento de todas las capas de normalización. Una extracción produce una predicción autoconsistente y un ensemble se genera simplemente con varias extracciones, que en la práctica corresponden a la dimensión de batch.

Es relevante porque traslada a un tamaño manejable (~58,7 millones de parámetros) la capacidad de pronosticar 13 niveles de presión de temperatura, geopotencial, viento y humedad, campos de superficie, precipitación y 17 diagnósticos de ciclones tropicales. No obstante, el propio autor advierte que no se espera que iguale la habilidad del modelo completo a 0,25°.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Functional Generative Network (FGN) basada en red neuronal de grafos; anchura y profundidad reducidas respecto a los modelos a 0,25° |
| Parametros totales | 58.694.571 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (condicionado por dos fotogramas HRES consecutivos separados 6 horas) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de predicción meteorológica, no lingüístico) |
| Licencia | cc-by-4.0 |
| Formato de pesos | safetensors |
| Resolucion espacial | 1° (rejilla de 181 x 360) |
| Paso temporal | 6 horas |
| Dimension del vector de ruido | 32 |
| Variables de salida | 13 niveles de presión (temperatura, geopotencial, viento, humedad), campos de superficie, precipitación y 17 diagnósticos de ciclones tropicales |
| Revisiones | `main` (entrenado hasta 2023) y `<2023` (entrenado hasta 2022) |
| Tamano del repositorio | 3,6 GB |

## Arquitectura y entrenamiento

La arquitectura replica la de los modelos a 0,25° con menor anchura y profundidad, y se apoya en una red neuronal de grafos para procesar la rejilla esférica. La innovación principal es el esquema FGN: el ruido no se inyecta en la entrada ni se emplea un proceso de difusión iterativo, sino que un vector de 32 dimensiones modula la escala y el desplazamiento de cada capa de normalización. Esto convierte la generación de ensembles en una operación de batch: cada miembro recibe ruido independiente y produce una predicción completa y autoconsistente.

El modelo se inicializa a partir de dos análisis HRES cronológicos separados seis horas, con latitud ascendente, los niveles de presión del checkpoint y todos los campos de entrada configurados, incluidos los estáticos. Cada revisión se entrena con datos hasta un corte temporal distinto (2023 para `main`, 2022 para `<2023`), lo que permite evaluar sobre un año no visto. A diferencia de las versiones a 0,25°, los checkpoints Mini incluyen una única red entrenada por corte en lugar de un ensemble de cuatro miembros, por lo que solo aplica el ensemble de ruido. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de RLHF o DPO.

## Capacidades

- Predicción meteorológica determinista y por ensembles de 13 niveles de presión para temperatura, geopotencial, viento y humedad.
- Predicción de campos de superficie y precipitación.
- Generación de 17 diagnósticos de ciclones tropicales (los diagnósticos son campos en rejilla, no trayectorias; la extracción de trayectorias es un paso separado en el repositorio original).
- Despliegue autorregresivo mediante `generate()`, que avanza cada miembro con su propio estado predicho y muestrea ruido nuevo en cada paso de seis horas.
- Generación de ensembles de ruido con `num_members`, compartiendo pesos y aplicando ruido independiente por miembro a lo largo del eje de batch.
- Rejilla de salida de 181 x 360 a 1° de resolución.
- No incluye los vientos a 100 m que añade WeatherNext 2.
- No soporta tool calling, function calling, agentes ni capacidades multilingües; no es un modelo de lenguaje.

## Casos de uso

- Evaluación local de pipelines meteorológicos: permite probar la preparación de datos HRES, la normalización, los forzamientos de reloj y el postprocesado sin necesidad de alojar el modelo a 0,25°, que requiere mucha más memoria.
- Prototipado en estaciones de trabajo sin GPU de gran capacidad: con ~58,7 millones de parámetros, el modelo cabe en hardware modesto y sirve para validar integraciones antes de escalar al modelo completo.
- Generación de ensembles de pronóstico a corto y medio plazo: `generate(num_members=8, num_steps=20)` produce escenarios de cinco días con ruido independiente por miembro, útil para análisis de incertidumbre.
- Investigación sobre ciclones tropicales: los 17 diagnósticos permiten estudiar la existencia y estructura de ciclones en la rejilla, con extracción de trayectorias como paso posterior en el repositorio original.
- Validación temporal con revisiones: el checkpoint `<2023` permite evaluar sobre 2023 sin fuga de datos, útil para comparar metodologías de evaluación.
- Docencia y reproducción de experimentos: el tamaño reducido y la licencia CC-BY-4.0 facilitan el uso en cursos y réplicas académicas de los resultados del artículo asociado.
- Integración en flujos de comparación de modelos: sirve como línea base ligera frente a modelos de resolución completa en estudios de sensibilidad a la resolución.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 58,7 millones de parámetros y pesos en safetensors, el modelo es muy ligero en memoria, aunque el repositorio ocupa 3,6 GB y el consumo real depende del batch, del número de miembros del ensemble y de la rejilla de 181 x 360.
- GPU recomendadas: no disponibles; por tamaño, cualquier GPU con suficiente memoria para el batch debería poder ejecutarlo, pero no se especifican modelos concretos.
- Cabe en GPU de consumo: probable por el número de parámetros, pero no confirmado en la información disponible.
- Opciones de despliegue: Transformers con la rama `add-weathernext2` de kashif (`pip install "git+https://github.com/kashif/transformers.git@add-weathernext2"`), junto con `torch` y `accelerate`. El soporte no está en una versión publicada de Transformers hasta que se fusione el PR huggingface/transformers#47874. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Resolucion | Contexto / entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| WeatherNext 2 Mini (este) | 58.694.571 | 1° | Dos fotogramas HRES a 6 h | cc-by-4.0 | Hugging Face (kashif/weathernext2-mini) |
| WeatherNext 2 (0,25°) | no disponible | 0,25° | Dos fotogramas HRES a 6 h | no disponible | Hugging Face (kashif/weathernext2) |
| WeatherNext Cyclones (0,25°) | no disponible | 0,25° | Dos fotogramas HRES a 6 h | no disponible | Hugging Face (kashif/weathernext-cyclones) |

El modelo Mini se diferencia de las versiones a 0,25° en resolución, anchura y profundidad, y en que los checkpoints Mini incluyen una sola red por corte en lugar de un ensemble de cuatro miembros. No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- El propio autor indica que no se espera que iguale la habilidad del modelo completo a 0,25°.
- No predice los vientos a 100 m que añade WeatherNext 2.
- Los diagnósticos de ciclones son campos en rejilla, no trayectorias; la extracción de trayectorias requiere un paso separado en el repositorio original.
- El soporte en Transformers no está en una versión publicada; es necesario instalar una rama de desarrollo, lo que implica riesgo de cambios incompatibles.
- El ruido lo muestrea el procesador, no el forward del modelo; pasar un segundo argumento `noise` o repetir la máscara sobre los miembros del ensemble provoca errores de uso.
- Los ensembles Mini solo aplican el ensemble de ruido, al no incluir el ensemble de cuatro miembros de las versiones a 0,25°.
- No se dispone de información sobre sesgos, tasas de alucinación (concepto no aplicable a un modelo físico) ni restricciones adicionales de la licencia CC-BY-4.0 más allá de la atribución.
- Solo 217 descargas y 1 like en el momento de la consulta: ecosistema pequeño y poca validación comunitaria.
- No hay datos publicados de benchmarks que permitan verificar la calidad del pronóstico.

## Enlaces

- Hugging Face: https://huggingface.co/kashif/weathernext2-mini
- Modelo completo a 0,25°: https://huggingface.co/kashif/weathernext2
- WeatherNext Cyclones: https://huggingface.co/kashif/weathernext-cyclones
- Repositorio oficial de Google DeepMind: https://github.com/google-deepmind/weathernext
- Demo oficial de WeatherNext 2: https://github.com/google-deepmind/weathernext/blob/main/docs/weathernext2/wn2_demo.ipynb
- Documentación del modelo en la rama de Transformers: https://github.com/kashif/transformers/blob/add-weathernext2/docs/source/en/model_doc/weathernext2.md
- PR de soporte en Transformers: https://github.com/huggingface/transformers/pull/47874
- Artículo (arXiv:2506.10772): https://arxiv.org/abs/2506.10772
