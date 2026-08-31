# licaaron/mt5-small-en2picto

## Resumen

El modelo licaaron/mt5-small-en2picto es un fine-tuning del modelo mT5-small de Google, especializado en la traducción de texto en inglés a secuencias de pictogramas. Los pictogramas son símbolos visuales utilizados en sistemas de comunicación aumentativa y alternativa (CAA), dirigidos a personas con dificultades en el lenguaje oral o escrito, como niños con trastorno del espectro autista o adultos con afasia.

Desarrollado por el usuario licaaron y publicado en Hugging Face, el modelo emplea la arquitectura encoder-decoder transformer de T5 en su variante multilingüe mT5-small, con aproximadamente 300 millones de parámetros. Su relevancia radica en que permite automatizar la generación de tableros de comunicación pictográfica a partir de frases en inglés, un proceso que tradicionalmente se realiza de forma manual.

El repositorio contiene los pesos en formato safetensors (1,2 GB) y está diseñado para la tarea text2text-generation mediante la librería transformers. La model card es una plantilla automática sin completar, por lo que gran parte de la información sobre entrenamiento, datos y evaluación no está disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | mT5-small (encoder-decoder transformer) |
| Parametros totales | 300.176.768 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible (el mT5 estandar usa 512 tokens) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | ingles (entrada), pictogramas (salida) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en mT5-small, la variante multilingüe de la familia T5 desarrollada por Google. mT5 emplea una arquitectura transformer encoder-decoder con un objetivo de entrenamiento text-to-text, donde todas las tareas se formulan como generación de texto. El modelo base fue preentrenado sobre el corpus mC4, que abarca 101 idiomas, con una longitud máxima de secuencia de 512 tokens.

El fine-tuning específico para la tarea en2picto (inglés a pictogramas) fue realizado por licaaron, pero no se han publicado detalles sobre el dataset de entrenamiento, el número de épocas, los hiperparámetros ni el régimen de entrenamiento (precisión mixta, etc.). Tampoco se especifica si se emplearon técnicas de alineamiento como RLHF o DPO. La model card es una plantilla automática sin completar, con todos los campos marcados como "[More Information Needed]".

## Capacidades

- Traducción de texto en inglés a secuencias de pictogramas, probablemente en formato textual que representa símbolos visuales.
- Generación de texto a texto (text2text-generation) mediante la API estándar de transformers.
- Al estar basado en mT5, hereda la capacidad multilingüe del modelo base, aunque el fine-tuning está orientado a entrada en inglés.
- No se dispone de información sobre soporte de tool calling, agentes, razonamiento multi-paso, visión o audio.

## Casos de uso

- Generación de tableros de comunicación: el modelo puede convertir frases cotidianas en inglés en secuencias de pictogramas para crear tableros de comunicación personalizados para usuarios de CAA, reduciendo el tiempo de preparación manual.
- Apoyo a logopedas y terapeutas: los profesionales pueden introducir frases objetivo y obtener automáticamente la representación pictográfica para sus sesiones de terapia del lenguaje.
- Aplicaciones educativas para niños con TEA: integración en aplicaciones que ayudan a niños con trastorno del espectro autista a asociar palabras con pictogramas, facilitando el aprendizaje de vocabulario.
- Sistemas de accesibilidad web: conversión de contenido textual en inglés a pictogramas para hacerlo accesible a personas con dificultades de lectura o comprensión del lenguaje escrito.
- Investigación en CAA: servir como base para experimentos sobre generación automática de material de comunicación aumentativa y comparación con métodos manuales.
- Traducción asistida para familias y cuidadores: ayuda a familiares de personas con necesidades de comunicación a preparar material pictográfico en casa sin necesidad de conocimientos técnicos ni herramientas especializadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de evaluación, ni comparaciones con otros modelos de traducción a pictogramas.

## Requisitos de hardware

- Con 300 millones de parámetros, el modelo es relativamente pequeño y puede ejecutarse en hardware modesto.
- VRAM estimada: aproximadamente 1,2 GB en fp32 (tamaño del repositorio), menos si se cuantiza a fp16 o int8.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM (por ejemplo, NVIDIA GTX 1650, RTX 3060, etc.). También puede ejecutarse en CPU para inferencia.
- Cabe en GPUs de consumo: sí, en prácticamente cualquier GPU moderna.
- Opciones de despliegue: al ser un modelo de transformers, puede servirse con vLLM, TGI (Text Generation Inference), o ejecutarse directamente con la librería transformers. También es compatible con endpoints de Hugging Face.
- Latencia: no disponible, pero al ser un modelo pequeño, se espera una latencia baja incluso en CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia |
|---|---|---|---|---|
| licaaron/mt5-small-en2picto | 300M | no disponible | ingles a pictogramas | no disponible |
| google/mt5-small (base) | 300M | 512 tokens | multilingue general | Apache 2.0 |
| google/mt5-base | 580M | 512 tokens | multilingue general | Apache 2.0 |

No se han encontrado otros modelos específicamente entrenados para traducción a pictogramas en la información disponible, por lo que la comparativa se limita al modelo base y sus variantes.

## Limitaciones y advertencias

- La model card es una plantilla automática sin completar: no hay información sobre el dataset de entrenamiento, el proceso de fine-tuning ni las métricas de evaluación.
- No se especifica la licencia del modelo, lo que genera incertidumbre sobre su uso comercial.
- El modelo tiene 0 descargas y 0 likes, lo que sugiere que no ha sido validado por la comunidad.
- Al ser un fine-tuning de mT5-small, hereda las limitaciones del modelo base: contexto limitado a 512 tokens y posibles sesgos del corpus mC4.
- Riesgo de alucinación: como cualquier modelo generativo, puede producir secuencias de pictogramas incorrectas o inconsistentes con la entrada.
- No se dispone de información sobre la calidad de la traducción a pictogramas ni sobre el vocabulario de pictogramas utilizado (por ejemplo, si usa el sistema ARASAAC, PCS, etc.).
- La fecha de creación (agosto de 2026) es posterior a la fecha actual, lo que sugiere que el modelo es muy reciente o que la fecha es incorrecta.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/licaaron/mt5-small-en2picto
- Modelo base mT5-small: https://huggingface.co/google/mt5-small
- Paper de T5 (arxiv:1910.09700): https://arxiv.org/abs/1910.09700
- Paper de mT5: https://arxiv.org/abs/2010.11934
