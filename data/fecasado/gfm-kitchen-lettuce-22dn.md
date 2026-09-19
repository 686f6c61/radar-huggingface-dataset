# fecasado/gfm-kitchen-lettuce-22dN

## Resumen

gfm-kitchen-lettuce-22dN es una política de robótica (policy) publicada por el usuario fecasado en HuggingFace Hub bajo la librería LeRobot. Se trata de un modelo de imitación entrenado con el método gaze_flow_matching, es decir, una política basada en flow matching condicionada por la mirada (gaze) del operador o del sistema de captura, orientada a tareas de manipulación. El repositorio ocupa 0,3 GB y contiene pesos en formato safetensors con 75.225.290 parámetros totales, lo que lo sitúa en la gama de políticas compactas capaces de ejecutarse en hardware de consumo.

El modelo se entrenó sobre el dataset fecasado/lettuce-to-plate-320x240, cuyo nombre sugiere una tarea de cocina consistente en trasladar lechuga a un plato con observaciones visuales de 320x240 píxeles; la model card no confirma explícitamente esa descripción. No es un modelo de lenguaje: no genera texto, no soporta tool calling ni razonamiento multi-paso, sino que produce acciones motrices a partir de observaciones visuales y de la señal de gaze.

Su relevancia es acotada y de carácter investigador: ocupa un nicho muy concreto dentro del ecosistema LeRobot y ejemplifica la aplicación de flow matching con condicionamiento de mirada a tareas de manipulación. En el momento de redactar esta ficha acumula 0 descargas y 0 likes, y su model card es la plantilla por defecto de LeRobot sin completar, por lo que no existe información publicada sobre su rendimiento, datos de entrenamiento detallados ni evaluación.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | gaze_flow_matching (política de imitación para robótica basada en flow matching con condicionamiento de mirada); implementación sobre LeRobot/PyTorch; la model card no detalla la topología interna |
| Parámetros totales | 75.225.290 (dato real de los safetensors) |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; en políticas robóticas el equivalente sería el horizonte de observación, que no se especifica) |
| Tipos de cuantización | no disponible; los pesos se distribuyen en safetensors, presumiblemente en fp32 dado el tamaño del repo (0,3 GB) |
| Idiomas soportados | no disponible / no aplica (modelo de robótica, sin capacidades lingüísticas) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Librería | lerobot |
| Pipeline | robotics |
| Dataset de entrenamiento | fecasado/lettuce-to-plate-320x240 |
| Tamaño del repositorio | 0,3 GB |
| Fecha de creación | 2026-09-19 |
| Última actualización | 2026-09-19 |

## Arquitectura y entrenamiento

LeRobot es el framework de HuggingFace para aprendizaje por imitación en robótica. El identificador del modelo, gaze_flow_matching, indica que la política emplea flow matching —un paradigma generativo que aprende un campo de velocidad que transporta ruido hacia la distribución de acciones— en lugar de la regresión directa de acciones o de los modelos de difusión clásicos. La particularidad es el condicionamiento por gaze: la política recibe, además de las observaciones visuales, información sobre el punto de mira, lo que en tareas de manipulación permite desambiguar objetos y guiar la atención espacial del modelo.

El entrenamiento se realizó con LeRobot sobre el dataset fecasado/lettuce-to-plate-320x240, que aporta demostraciones teleoperadas con imágenes de resolución 320x240. No se especifica en la información disponible el número de episodios, el número de tokens o muestras procesadas, la composición del dataset, ni si hubo fases de refinamiento tipo RLHF o DPO (poco habituales en políticas de imitación robótica). Tampoco se documentan innovaciones adicionales como decodificación especulativa, atención lineal u optimizaciones de inferencia.

Un detalle relevante para la reproducibilidad: el bloque de instrucciones de la model card es la plantilla genérica de LeRobot y su ejemplo de entrenamiento invoca `--policy.type=act`, lo que corresponde a Action Chunking Transformer, no necesariamente a la arquitectura gaze_flow_matching de este repositorio. La plantilla no se ha adaptado al modelo concreto, por lo que ese comando debe tomarse como ilustrativo del flujo de trabajo de LeRobot y no como la configuración real de entrenamiento de esta política.

## Capacidades

- Generación de acciones motrices para control de robots manipuladores a partir de observaciones visuales.
- Condicionamiento por señal de gaze (punto de mira) durante la inferencia, además de la observación de cámara.
- Ejecución de tareas de manipulación del tipo pick-and-place en entornos de cocina, presumiblemente trasladar lechuga a un plato según el nombre del dataset.
- Integración con el ecosistema LeRobot: entrenamiento con `lerobot-train`, evaluación y grabación de rollouts con `lerobot-record`.
- Compatibilidad declarada con robots de la familia SO-100 follower en el ejemplo de evaluación de la plantilla.
- No soporta generación de texto, tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües: es un modelo exclusivamente motor y visual.
- No se declaran capacidades de visión general (captioning, VQA) ni de audio.

## Casos de uso

- Manipulación robótica de laboratorio en tareas de cocina: la política genera comandos de actuación para mover un objeto (lechuga) hasta un destino (plato) a partir de imágenes de 320x240, un escenario de pick-and-place reproducible en bancos de pruebas con brazos tipo SO-100.
- Reproducción de resultados con LeRobot: cargando el checkpoint con `--policy.path` en `lerobot-record` sobre un `so100_follower`, se pueden grabar episodios de evaluación y comparar el comportamiento real con el esperado.
- Investigación sobre flow matching en robótica: sirve como referencia práctica de una política de flow matching con condicionamiento de mirada, útil para estudiar cómo afecta la señal de gaze a la precisión de agarre y colocación.
- Fine-tuning con datos propios: al ser un modelo pequeño (75,2 M de parámetros) y con licencia Apache 2.0, es viable reentrenarlo o ajustarlo con demostraciones nuevas de la misma familia de tareas sin requerir clústeres de GPU.
- Comparación de políticas dentro de LeRobot: puede utilizarse como baseline frente a ACT o Diffusion Policy sobre el mismo dataset, siempre que se documente la configuración exacta de evaluación.
- Docencia y formación en aprendizaje por imitación: su tamaño reducido permite ejecutar ciclos completos de entrenamiento, evaluación y análisis de errores en una única GPU de consumo, lo que facilita prácticas de laboratorio.
- Generación de datos de evaluación: los rollouts grabados con LeRobot pueden usarse como conjunto de test para medir tasas de éxito de otras políticas en la misma tarea.
- Prototipado de control visual de bajo coste: al no requerir aceleradores de gran tamaño, puede desplegarse en estaciones de trabajo con GPU modesta e incluso en CPU para pruebas de integración, aunque no se han publicado latencias reales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card es la plantilla por defecto de LeRobot y no incluye tasas de éxito, métricas de error de posición ni comparaciones cuantitativas con otras políticas sobre el dataset fecasado/lettuce-to-plate-320x240.

## Requisitos de hardware

- VRAM estimada para inferencia: con 75.225.290 parámetros en fp32, los pesos ocupan aproximadamente 300 MB, coherente con el tamaño del repositorio (0,3 GB). La VRAM total necesaria depende del framework y de los buffers de activaciones, pero previsiblemente se mantiene por debajo de 2 GB en fp32.
- GPU recomendadas: cualquier GPU con más de 2 GB de VRAM es suficiente para inferencia; una RTX 4090, una A100 o una H100 quedan sobredimensionadas para este modelo, aunque agilizan el entrenamiento y la recolección de datos.
- GPU de consumo: cabe sin problema en tarjetas consumer como RTX 3060, RTX 4060, RTX 4090, y también en plataformas embebidas con suficiente memoria (por ejemplo, Jetson), si bien no se documenta soporte oficial en estos dispositivos.
- CPU: la inferencia en CPU es plausible por el tamaño del modelo, aunque no hay datos publicados de latencia.
- Opciones de despliegue: LeRobot (scripts `lerobot-train` y `lerobot-record`) sobre PyTorch. vLLM, TGI, llama.cpp y Ollama no son aplicables a este tipo de política robótica.
- Latencia y throughput: no disponibles. En control robótico la frecuencia de inferencia es crítica, pero el autor no publica mediciones.

## Comparativa con modelos similares

No se dispone de datos cuantitativos verificables de las alternativas dentro de la información proporcionada, por lo que la comparación es necesariamente cualitativa.

| Modelo | Tipo de política | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| gfm-kitchen-lettuce-22dN | Flow matching con condicionamiento de gaze | 75.225.290 | no disponible | apache-2.0 | HuggingFace Hub, librería lerobot |
| ACT (Action Chunking Transformer) en LeRobot | Transformer con chunking de acciones | no disponible | no disponible | típicamente apache-2.0 en LeRobot | implementación en LeRobot, sin checkpoint específico público asociado a esta tarea |
| Diffusion Policy en LeRobot | Política generativa por difusión | no disponible | no disponible | típicamente apache-2.0 en LeRobot | implementación en LeRobot |
| Otras políticas LeRobot (por ejemplo pi0, SmolVLA) | Vision-language-action | no disponible | no disponible | no disponible | repositorios públicos de mayor escala, no comparables en tamaño con esta política |

La diferencia principal de gfm-kitchen-lettuce-22dN frente a ACT o Diffusion Policy es el uso de flow matching y el condicionamiento por gaze, junto con su especialización en un dataset concreto de una sola tarea. Las alternativas citadas son implementaciones genéricas del framework y no checkpoints entrenados sobre el mismo dataset, por lo que una comparación de rendimiento exigiría reentrenarlas en condiciones idénticas.

## Limitaciones y advertencias

- Model card incompleta: el README es la plantilla por defecto de LeRobot con el aviso explícito "Model type not recognized — please update this template", por lo que faltan detalles de arquitectura, datos y evaluación.
- Ausencia total de métricas: no hay tasas de éxito, ni curvas de entrenamiento, ni comparaciones publicadas. No es posible estimar su fiabilidad en producción.
- Especialización extrema: el modelo parece entrenado para una única tarea (lechuga a plato) con una resolución fija de 320x240; cualquier cambio de cámara, iluminación, disposición de objetos o robot probablemente degrade su comportamiento por desviación de la distribución de entrenamiento.
- Dependencia de la señal de gaze: no se documenta cómo se obtiene dicha señal en inferencia ni qué ocurre si no está disponible, lo que puede impedir su uso fuera del montaje original.
- Sesgos: no se documentan sesgos específicos, pero al tratarse de una política aprendida de demostraciones humanas hereda los sesgos de la persona que teleoperó y del entorno de grabación.
- Alucinación: no aplica en el sentido lingüístico, pero sí existe riesgo de acciones erráticas o inseguras ante entradas fuera de distribución, algo crítico en un robot físico que opera cerca de personas u objetos.
- Licencia: Apache 2.0 permite uso comercial, modificación y redistribución siempre que se conserve el aviso de copyright y la licencia, y se incluya el archivo NOTICE si existe. El modelo se distribuye sin garantías.
- Falta de validación comunitaria: 0 descargas y 0 likes en el momento de la consulta; nadie ha reportado reproducibilidad ni resultados independientes.
- Seguridad en producción: cualquier despliegue en un robot real requiere límites de par, paradas de emergencia y validación en entorno controlado; el modelo no incluye ninguna capa de seguridad.
- Incoherencia en la documentación: el ejemplo de entrenamiento de la plantilla usa `--policy.type=act`, que no coincide necesariamente con la arquitectura gaze_flow_matching declarada, lo que complica la reproducción exacta del entrenamiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/fecasado/gfm-kitchen-lettuce-22dN
- Dataset de entrenamiento: https://huggingface.co/datasets/fecasado/lettuce-to-plate-320x240
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento de LeRobot: https://huggingface.co/docs/lerobot/il_robots#train-a-policy

Nota: la búsqueda web asociada a esta ficha devolvió únicamente resultados sobre el trampolín de Bergisel en Innsbruck (bergisel.info), sin relación alguna con el modelo. No se han encontrado papers, blogs, repositorios adicionales ni demos específicos de gfm-kitchen-lettuce-22dN.
