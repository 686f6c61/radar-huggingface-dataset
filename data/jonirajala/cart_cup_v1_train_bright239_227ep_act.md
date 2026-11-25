# jonirajala/cart_cup_v1_train_bright239_227ep_act

## Resumen

`jonirajala/cart_cup_v1_train_bright239_227ep_act` es una política de robótica entrenada con LeRobot, la librería de Hugging Face para aprendizaje por imitación en robótica. El modelo implementa la arquitectura ACT (Action Chunking with Transformers), descrita en el paper arXiv:2304.13705, y está especializado en una tarea concreta de manipulación: la recogida de un vaso o taza (cart/cup) en un entorno de laboratorio con condiciones de iluminación específicas (bright239).

El modelo se distribuye en formato safetensors dentro del ecosistema LeRobot, lo que permite cargarlo directamente con las utilidades de esa librería para su despliegue en un robot físico o en simulación. Con 227 épocas de entrenamiento sobre un dataset propio del autor, se trata de un artefacto de investigación orientado a reproducir una política de imitación para una tarea de pick-and-place muy delimitada, no un modelo de propósito general.

Su relevancia es acotada pero práctica: sirve como ejemplo reproducible de entrenamiento ACT con LeRobot, como punto de partida para fine-tuning en tareas similares y como referencia para quienes trabajan en manipulación robótica con aprendizaje por imitación. No es un modelo de lenguaje ni un modelo multimodal de propósito general; sus capacidades están restringidas al dominio de la tarea para la que fue entrenado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), según arXiv:2304.13705 |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (política de robótica, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | Apache 2.0 (según tag del repositorio); campo de licencia no disponible en la ficha |
| Formato de pesos | safetensors (formato LeRobot) |

## Arquitectura y entrenamiento

El modelo emplea ACT, una arquitectura basada en transformers diseñada para aprendizaje por imitación en robótica. ACT predice "chunks" de acciones (secuencias de comandos motrices de varios pasos) a partir de observaciones visuales y del estado del robot, lo que reduce el error de acumulación típico de las políticas que predicen una sola acción por paso y mejora la suavidad y estabilidad del control. La arquitectura combina un codificador visual con un transformer que modela la secuencia de acciones, e incorpora mecanismos de atención sobre las observaciones.

El entrenamiento se realizó con LeRobot sobre el dataset `jonirajala/cart_cup_v1_train_bright239`, con 227 épocas. El dataset corresponde a demostraciones de la tarea de recogida de un vaso/taza bajo condiciones de iluminación "bright239". No se dispone de información sobre el número de demostraciones, la composición exacta del dataset, el robot utilizado, ni si hubo técnicas adicionales de regularización o aumento de datos. Tampoco se documenta el uso de RLHF/DPO, algo que no aplica a este tipo de políticas.

## Capacidades

- Control robótico de manipulación: genera secuencias de acciones (action chunks) para ejecutar la tarea de recogida de un vaso/taza.
- Aprendizaje por imitación: reproduce comportamientos demostrados en el dataset de entrenamiento.
- Entrada multimodal: procesa observaciones visuales (cámaras) y estado del robot, según el pipeline estándar de ACT en LeRobot.
- Integración con LeRobot: carga y despliegue mediante las utilidades de la librería.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso en el sentido de los LLM.
- No tiene capacidades multilingües ni de generación de texto.
- No dispone de thinking mode, visión general, audio ni otras capacidades fuera del dominio robótico.

## Casos de uso

- Reproducción de experimentos de aprendizaje por imitación: cargar la política con LeRobot y evaluar su comportamiento en el robot o entorno para el que fue entrenada, sirviendo como referencia reproducible de un entrenamiento ACT.
- Punto de partida para fine-tuning: reutilizar los pesos como inicialización para tareas de pick-and-place similares (otros objetos, otras condiciones de iluminación) y reducir el tiempo de entrenamiento.
- Benchmark interno de políticas ACT: comparar el rendimiento de esta política con otras variantes entrenadas por el equipo para calibrar hiperparámetros y protocolos de evaluación.
- Docencia y formación en robótica: ejemplo práctico de pipeline completo (dataset, entrenamiento, despliegue) con LeRobot para cursos de robótica o aprendizaje automático.
- Validación de infraestructura de despliegue: probar la integración de políticas LeRobot en un stack de control robótico antes de entrenar políticas propias.
- Estudio de robustez ante iluminación: al estar entrenada en condiciones "bright239", permite analizar cómo varía el rendimiento al cambiar la iluminación del entorno.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; depende del tamaño de la política ACT (no publicado) y del tamaño de las imágenes de entrada. Las políticas ACT suelen ser ligeras en comparación con LLM, pero no se dispone de cifras concretas.
- GPU recomendadas: no disponible. Para entrenamiento e inferencia de ACT en LeRobot se suelen usar GPUs consumer (por ejemplo, RTX 3090/4090) o GPUs de datacenter (A100/H100), pero no hay datos específicos para este modelo.
- ¿Cabe en GPU consumer? No disponible con certeza; por el tipo de arquitectura es probable, pero no se confirma en la información proporcionada.
- Opciones de despliegue: LeRobot (carga nativa del formato safetensors); no se documentan otras opciones como vLLM, llama.cpp u Ollama, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Arquitectura | Tarea | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| jonirajala/cart_cup_v1_train_bright239_227ep_act | ACT | Pick-and-place de vaso/taza | no aplica | Apache 2.0 (según tag) | Hugging Face |
| Políticas ACT de referencia en LeRobot | ACT | Tareas de manipulación diversas | no aplica | varía | Hugging Face / LeRobot |
| Políticas Diffusion Policy | Diffusion Policy | Manipulación por imitación | no aplica | varía | Hugging Face / LeRobot |
| Políticas VQ-BeT / otros | varía | Manipulación por imitación | no aplica | varía | Hugging Face / LeRobot |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Especialización extrema: la política está entrenada para una única tarea (recogida de vaso/taza) y unas condiciones de iluminación concretas ("bright239"); su rendimiento fuera de ese dominio es incierto.
- Sesgo de dataset: al depender de demostraciones humanas, hereda los sesgos y la variabilidad de las trayectorias del dataset, incluida la posible sobrerrepresentación de ciertas posiciones iniciales u objetos.
- Riesgo de fallo en producción: no hay benchmarks publicados que permitan estimar la tasa de éxito; no se recomienda su uso en entornos reales sin evaluación previa.
- Limitaciones de generalización: no se documenta su comportamiento ante cambios de cámara, iluminación, fondo u objetos distintos.
- Licencia: el tag indica Apache 2.0, pero el campo de licencia de la ficha aparece como no disponible; conviene verificar antes de un uso comercial.
- Documentación escasa: no se especifican número de demostraciones, robot, tasa de éxito ni detalles de entrenamiento, lo que dificulta la reproducibilidad.
- Sin soporte de lenguaje: no es un modelo de texto ni multimodal general; no debe evaluarse con métricas de LLM.

## Enlaces

- Hugging Face: https://huggingface.co/jonirajala/cart_cup_v1_train_bright239_227ep_act
- Paper ACT: https://arxiv.org/abs/2304.13705
- LeRobot (librería): https://github.com/huggingface/lerobot
- Dataset de entrenamiento: https://huggingface.co/datasets/jonirajala/cart_cup_v1_train_bright239
