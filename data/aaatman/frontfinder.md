# aaaTman/FrontFinder

## Resumen

FrontFinder es un modelo de inteligencia artificial diseñado para la identificación automática de frentes meteorológicos (fríos, cálidos, estacionarios, ocluidos y líneas secas) sobre los Estados Unidos continentales y el dominio de análisis de superficie unificado de la NOAA. El modelo fue desarrollado por un equipo de investigación vinculado al proyecto FrontFinder AI, con código disponible en el repositorio GitHub de hanchyhill y una aplicación web en aaTman/frontfinder-app.

El problema que resuelve es la automatización del análisis frontal, una tarea que tradicionalmente realizan pronosticadores humanos aplicando criterios subjetivos y reglas propias. El modelo emplea la arquitectura UNET3+, una variante de red neuronal convolucional para segmentación semántica de imágenes, lo que le permite procesar campos meteorológicos y generar mapas de probabilidad de presencia de frentes.

La relevancia actual del modelo radica en que los frentes están asociados a fenómenos meteorológicos de alto impacto, y su detección automática puede mejorar la consistencia y velocidad del análisis sinóptico operativo. El artículo técnico fue publicado en la revista *Artificial Intelligence for the Earth Systems* (AIES) de la AMS en 2025. La versión alojada en HuggingFace bajo el identificador aaaTman/FrontFinder presenta una licencia CC0-1.0, lo que la libera de restricciones de uso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | UNET3+ (red neuronal convolucional para segmentacion) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de vision, no de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo de vision) |
| Licencia | CC0-1.0 |
| Formato de pesos | no disponible |

## Arquitectura y entrenamiento

FrontFinder utiliza la arquitectura UNET3+, una evolución de la U-Net clásica que introduce conexiones de salto densas y de múltiples escalas para mejorar la precisión en tareas de segmentación semántica. Esta arquitectura es especialmente adecuada para la detección de estructuras lineales y delgadas como los frentes meteorológicos, que presentan un desafío particular por su naturaleza estrecha y alargada.

El modelo fue entrenado para clasificar cinco tipos de fenómenos: frentes fríos, cálidos, estacionarios, ocluidos y líneas secas. Los datos de entrenamiento provienen de análisis de superficie de la NOAA y del dominio de análisis unificado de superficie de los Estados Unidos. No se dispone de información detallada sobre el número de muestras, el proceso de etiquetado o si se emplearon técnicas de aumento de datos en la información disponible.

## Capacidades

- Detección y segmentación de frentes fríos, cálidos, estacionarios y ocluidos en campos meteorológicos.
- Identificación de líneas secas, un fenómeno relevante para la predicción de tormentas severas en las Grandes Llanuras de Estados Unidos.
- Procesamiento de datos meteorológicos en el dominio continental de Estados Unidos y el dominio de análisis unificado de la NOAA.
- Generación de mapas de probabilidad de presencia de frentes, lo que permite a los pronosticadores interpretar la salida del modelo de forma visual.
- Inferencia eficiente gracias a la arquitectura UNET3+, diseñada para reducir el coste computacional frente a otras variantes de U-Net.

## Casos de uso

- Análisis sinóptico operativo en servicios meteorológicos: el modelo puede asistir a los pronosticadores en la identificación preliminar de frentes, reduciendo el tiempo dedicado al análisis manual y mejorando la consistencia entre turnos de trabajo.
- Validación cruzada de análisis manuales: los mapas generados por FrontFinder pueden compararse con los análisis de superficie elaborados por humanos para detectar discrepancias y sesgos en el criterio de cada pronosticador.
- Investigación en climatología de frentes: el modelo permite generar catálogos históricos de posiciones frontales de forma automática, facilitando estudios estadísticos sobre la frecuencia e intensidad de los frentes en relación con el cambio climático.
- Predicción inmediata (nowcasting): la detección rápida de frentes puede integrarse en sistemas de alerta temprana para fenómenos asociados, como tormentas severas, lluvias intensas o cambios bruscos de temperatura.
- Entrenamiento de pronosticadores: los mapas de probabilidad generados por el modelo pueden utilizarse como material didáctico para enseñar a estudiantes de meteorología a identificar frentes en campos de presión y temperatura.
- Integración en pipelines de asimilación de datos: las salidas del modelo pueden servir como información auxiliar para sistemas de asimilación de datos numéricos, mejorando la inicialización de modelos de predicción meteorológica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El artículo técnico en la revista AIES de la AMS describe la metodología y evaluación del modelo, pero los datos numéricos concretos (métricas de precisión, recall, IoU, etc.) no están accesibles en los materiales consultados.

## Requisitos de hardware

- Al ser un modelo de segmentación basado en UNET3+, los requisitos de hardware dependen del tamaño de las imágenes de entrada y de la resolución de los campos meteorológicos procesados.
- No se dispone de información específica sobre VRAM necesaria, GPUs recomendadas o latencia de inferencia en la documentación disponible.
- Para un modelo de segmentación de este tipo, una GPU de gama media como una RTX 3060 o superior sería presumiblemente suficiente para inferencia, aunque este dato no está confirmado por el autor.
- Las opciones de despliegue típicas para modelos de visión serían PyTorch, TensorFlow o ONNX Runtime, pero no se ha confirmado qué frameworks son compatibles con los pesos publicados.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa rigurosa con modelos alternativos de detección de frentes meteorológicos. El campo de la detección automática de frentes es relativamente emergente y no hay modelos de referencia ampliamente establecidos con los que comparar en la información disponible.

## Limitaciones y advertencias

- El modelo está entrenado específicamente para el dominio geográfico de los Estados Unidos continentales y el dominio de análisis unificado de la NOAA; su aplicabilidad a otras regiones del mundo no está garantizada.
- La model card en HuggingFace está prácticamente vacía, sin información sobre el proceso de entrenamiento, los datos utilizados o las instrucciones de uso, lo que dificulta la reproducibilidad.
- No se han documentado sesgos conocidos, pero la dependencia de análisis humanos para el etiquetado puede introducir los sesgos propios del criterio de los analistas.
- El riesgo de alucinación o falsos positivos en la detección de frentes no está cuantificado en la información disponible.
- La licencia CC0-1.0 permite uso comercial sin restricciones, pero al no existir documentación técnica completa, su integración en producción requiere un proceso de validación adicional.
- No se especifica el formato de los pesos publicados, lo que puede dificultar la carga del modelo en frameworks estándar.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/aaaTman/FrontFinder
- Modelo relacionado en HuggingFace: https://huggingface.co/aaaTman/FrontFinderAIES2025
- Repositorio de la aplicación web: https://github.com/aaTman/frontfinder-app
- Repositorio del modelo: https://github.com/hanchyhill/FrontFinder
- Artículo técnico en AIES (AMS): https://journals.ametsoc.org/view/journals/aies/4/1/AIES-D-24-0043.1.xml
