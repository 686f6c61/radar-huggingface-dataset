# AtharvaSalitri/eye-disease-model

## Resumen

El modelo `AtharvaSalitri/eye-disease-model` es un clasificador de imágenes de retina destinado a la detección de enfermedades oculares. Ha sido publicado por el usuario AtharvaSalitri en Hugging Face bajo licencia MIT, con un tamaño de repositorio de 1,2 GB. La ficha oficial no incluye descripción técnica, arquitectura ni detalles de entrenamiento; únicamente se indica la licencia. El autor mantiene un repositorio en GitHub con una aplicación Streamlit para clasificación de enfermedades oculares mediante deep learning, lo que sugiere que el modelo podría estar relacionado con una red neuronal convolucional (CNN), aunque no se puede confirmar que sea el mismo artefacto.

En el momento de redactar esta ficha, el modelo no registra descargas ni valoraciones, y su fecha de creación (agosto de 2026) es posterior a la fecha actual, lo que indica que la información puede ser incompleta o contener errores. No se dispone de documentación adicional, papers ni benchmarks publicados. Por tanto, esta ficha se basa únicamente en los datos disponibles en Hugging Face y en el repositorio del autor, marcando explícitamente todos los parámetros técnicos como «no disponible» cuando no se han proporcionado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (posible CNN segun repositorio del autor, sin confirmar) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no aplicable si no es MoE) |
| Longitud de contexto | no disponible (modelo de vision, no de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de clasificacion de imagenes, sin soporte de lenguaje) |
| Licencia | MIT |
| Formato de pesos | no disponible (probablemente safetensors o pickle, sin confirmar) |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura del modelo. El repositorio de GitHub del autor (`Ocular-Diseases-Detection-using-CNN-Deep-Learning`) describe un sistema de detección de enfermedades oculares basado en redes neuronales convolucionales (CNN) y una aplicación Streamlit con explicabilidad mediante Grad-CAM. Es plausible que el modelo de Hugging Face sea un checkpoint entrenado para esa tarea, pero no hay confirmación oficial.

Tampoco se dispone de datos sobre el conjunto de entrenamiento, el número de tokens (no aplicable a visión), el proceso de optimización (RLHF, DPO, etc.) ni innovaciones técnicas específicas. La única característica destacable mencionada en el repositorio asociado es el uso de Grad-CAM para visualizar las regiones de la imagen que influyen en la predicción, aunque esto es una herramienta de interpretabilidad, no una característica del modelo en sí.

## Capacidades

- Clasificación de imágenes de retina para detección de enfermedades oculares (presumiblemente, según el repositorio del autor, aunque no está confirmado para este modelo concreto).
- Generación de mapas de activación Grad-CAM para visualizar las áreas relevantes de la imagen (según el repositorio de GitHub, no necesariamente implementado en el modelo de Hugging Face).
- Sin soporte de generación de texto, tool calling, agentes ni razonamiento multi-paso, al tratarse de un modelo de visión puro.
- Capacidades multilingües: no aplicable, ya que no procesa texto.
- Sin modo de pensamiento, visión general o audio; solo entrada de imágenes.

## Casos de uso

- Detección temprana de retinopatía diabética: el modelo podría utilizarse como herramienta de cribado en entornos clínicos, analizando imágenes de fondo de ojo para identificar signos de la enfermedad. Su licencia MIT permite su integración en sistemas de salud, aunque se requiere validación clínica.
- Apoyo al diagnóstico de degeneración macular asociada a la edad (DMAE): al clasificar imágenes de retina, podría ayudar a los oftalmólogos a priorizar casos, reduciendo la carga de trabajo manual.
- Telemedicina y cribado remoto: al ser un modelo ligero (1,2 GB de repo), podría desplegarse en aplicaciones web o móviles para que pacientes de zonas rurales envíen imágenes y reciban una evaluación preliminar.
- Investigación académica: el modelo puede servir como punto de partida para estudios comparativos de algoritmos de clasificación de enfermedades oculares, gracias a su licencia permisiva.
- Desarrollo de aplicaciones de auto-detección para pacientes: una app que permita a los usuarios tomar una foto de su ojo y obtener una indicación de posible patología, con la advertencia de que no sustituye un diagnóstico médico.
- Integración en sistemas de gestión hospitalaria: como módulo de triaje automático, clasificando imágenes de pacientes antes de la revisión por un especialista, optimizando los flujos de trabajo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No existen métricas de exactitud, sensibilidad, especificidad, AUC ni comparaciones con otros modelos en la ficha de Hugging Face ni en el repositorio del autor. Por tanto, no es posible evaluar el rendimiento real del modelo.

## Requisitos de hardware

- VRAM estimada: no disponible. Al ser un modelo de visión de 1,2 GB (tamaño del repositorio), podría inferirse que el checkpoint tiene un número de parámetros moderado, pero sin datos concretos no se puede estimar.
- GPU recomendadas: no disponible. En función del tamaño del repo, podría caber en GPUs de consumo como una RTX 3060 (12 GB) o superiores, pero es especulativo.
- Compatibilidad con GPU de consumo: probablemente sí, dado el tamaño del archivo, pero sin confirmación.
- Opciones de despliegue: no disponible. No se mencionan compatibilidades con vLLM, llama.cpp, Ollama ni TGI. Para un modelo de visión, se usarían frameworks como PyTorch o TensorFlow, pero no está documentado.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa con otros modelos de detección de enfermedades oculares. Existen alternativas como los modelos de Google (para retinopatía diabética) o los de la literatura académica, pero no se conocen sus parámetros ni rendimiento en relación con este modelo. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- No hay documentación técnica oficial: la ausencia de model card detallada impide conocer la arquitectura, el entrenamiento y las limitaciones específicas.
- Riesgo de sesgos: al no conocer los datos de entrenamiento, no se puede evaluar si el modelo está sesgado hacia ciertos grupos demográficos o tipos de imagen.
- Alucinación: no aplica directamente, pero en clasificación de imágenes, el modelo podría producir falsos positivos o negativos, con graves consecuencias clínicas si se usa sin supervisión.
- Limitaciones de contexto: al ser un modelo de visión, no tiene contexto de texto; su uso se limita a la entrada de imágenes.
- Restricciones de licencia: la licencia MIT permite uso comercial y modificación, pero no exime de la responsabilidad ética y legal en entornos médicos. Cualquier uso clínico requiere validación regulatoria.
- Advertencia de producción: el repositorio de GitHub del autor indica que Grad-CAM se proporciona para interpretabilidad y «no debe considerarse una explicación clínica». Esto subraya que el modelo no está validado para diagnóstico real.
- Fecha de creación sospechosa: la fecha de creación (2026-08-18) es posterior a la fecha actual, lo que sugiere que el registro puede ser erróneo o el modelo no ha sido probado.

## Enlaces

- [Hugging Face - AtharvaSalitri/eye-disease-model](https://huggingface.co/AtharvaSalitri/eye-disease-model)
- [GitHub del autor - Ocular Diseases Detection with Streamlit](https://github.com/the-amazing-atharva/Ocular-Diseases-Detection-using-CNN-Deep-Learning)
- [GitHub relacionado - Eye Disease Detection (otro autor)](https://github.com/manasabezawada-gec/Eye_Disease_Detection-Using-Deep-Learning)
- [Artículo de revisión en Springer - Modelos de IA para cribado de enfermedades retinianas](https://link.springer.com/article/10.1007/s10462-024-10736-z)
- [Artículo en Springer - Implementación de modelo IA para cribado de enfermedades oculares](https://link.springer.com/article/10.1186/s12886-024-03306-y)
- [Artículo en MDPI - Predicción de enfermedades oculares con deep learning](https://www.mdpi.com/2079-3197/13/4/91)
