# Samisaliveagain/smolvla-so100-nut-stacking-batch16-step-unverified-base-init-export20261011

## Resumen

SmolVLA es un modelo de visión-lenguaje-acción (VLA) orientado a robótica, y este repositorio concreto contiene un checkpoint afinado del modelo base `lerobot/smolvla_base` para la tarea de apilado de tuercas (nut stacking) sobre un brazo robótico SO-100 de tipo follower. Lo publica el usuario Samisaliveagain dentro del ecosistema LeRobot, la librería de Hugging Face para aprendizaje por imitación y control robótico. El modelo resuelve el problema de mapear observaciones multimodales (imágenes de dos cámaras más estado del robot) a comandos de acción de bajo nivel, sustituyendo el diseño manual de controladores por una política aprendida de extremo a extremo.

El checkpoint tiene 450.046.176 parámetros (aproximadamente 450 millones) en formato safetensors, con un tamaño de repositorio de 0,9 GB. Se entrenó con batch size 16 y una configuración objetivo de 20.000 pasos, aunque el autor indica explícitamente que el paso exacto del checkpoint guardado no está verificado. Emite acciones en forma de chunks de 50 pasos y consume seis valores de estado junto con las imágenes de una cámara superior y una cámara FPV.

Su relevancia es acotada pero clara: es un ejemplo reproducible de cómo un VLA compacto puede adaptarse a una tarea de manipulación concreta con hardware de bajo coste (el SO-100 es un brazo open source de tipo sobremesa), lo que interesa a quienes investigan políticas robóticas ligeras y a quienes quieren replicar flujos de LeRobot sin grandes presupuestos de cómputo. No obstante, se trata de un checkpoint de investigación con procedencia parcialmente sin verificar, no de un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SmolVLA (vision-language-action, familia LeRobot); detalles internos de capas no disponibles |
| Parametros totales | 450.046.176 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (repositorio LeRobot con configuración y ficheros de pre/postprocesado) |

## Arquitectura y entrenamiento

SmolVLA es una política de visión-lenguaje-acción: combina un codificador visual con un modelo de lenguaje y una cabeza de acciones que produce comandos motores. En este checkpoint concreto, la entrada consiste en seis valores de estado del robot, la imagen de una cámara superior y la imagen de una cámara FPV; la salida son seis valores de acción, emitidos en chunks de 50 pasos (action chunking), técnica habitual para reducir la frecuencia de inferencia y suavizar el control. El modelo parte de los pesos de `lerobot/smolvla_base` y se afina sobre el dataset `shubham4413/so100_smolvla_rc`.

El entrenamiento se lanzó con el job `so100_smolvla_rc_bs16_20k`, batch size 16 y 20.000 pasos configurados, sin reanudación desde checkpoint previo. El autor advierte que el paso exacto del checkpoint guardado no está verificado y no se infiere del objetivo de 20.000 pasos; tampoco se documenta el número de tokens, la composición del dataset ni si hubo RLHF o DPO, algo esperable en este tipo de políticas de imitación. Se conservan los pesos originales, la configuración y los ficheros de pre/postprocesado en la raíz del repositorio, junto con un `model_identity.json` que registra la procedencia y el SHA-256 de los pesos (`2153e918073b30d6b046f6fe7d33d135457bde3b0e6e4e6099b706e25e2e8aab`).

## Capacidades

- Control robótico de manipulación: genera comandos de acción de seis dimensiones para un brazo SO-100 en la tarea específica de apilado de tuercas.
- Percepción multimodal: procesa simultáneamente estado proprioceptivo (seis valores) e imágenes de dos cámaras (superior y FPV).
- Action chunking: emite secuencias de 50 acciones por inferencia, lo que facilita un control más estable y reduce el coste de cómputo por paso.
- Aprendizaje por imitación: la política se deriva de demostraciones del dataset `shubham4413/so100_smolvla_rc`, no de instrucciones en lenguaje natural verificadas.
- Integración con LeRobot: compatible con el ecosistema de Hugging Face para entrenamiento, evaluación y despliegue de políticas robóticas.
- Tool calling, function calling, agentes multi-paso, capacidades multilingües, modo thinking, visión general, audio: no disponibles o no aplicables a este checkpoint; la model card no documenta ninguna de estas capacidades fuera del ámbito robótico.

## Casos de uso

- Replicación de experimentos de apilado de tuercas: sirve como punto de partida para reproducir el pipeline de entrenamiento y evaluar la política sobre un SO-100 real o simulado, gracias a que se conservan configuración y ficheros de pre/postprocesado.
- Investigación en políticas VLA compactas: con 450 millones de parámetros y 0,9 GB de pesos, permite estudiar el comportamiento de un VLA pequeño en manipulación sin infraestructura de gran escala.
- Docencia y laboratorios de robótica: el binomio SO-100 más LeRobot es asequible, y este checkpoint ilustra el ciclo completo de afinado, exportación y despliegue de una política de imitación.
- Base para fine-tuning en tareas similares: al derivar de `lerobot/smolvla_base`, puede reutilizarse como inicialización para otras tareas de pick-and-place con configuraciones de cámara y estado análogas.
- Evaluación de robustez de action chunking: el tamaño de chunk de 50 permite medir cómo afecta la longitud de la secuencia de acciones a la estabilidad del control en tareas de precisión.
- Análisis de procedencia y trazabilidad de checkpoints: el repositorio incluye identidad legible por máquina y hash de pesos, útil como caso de estudio sobre buenas prácticas de documentación en modelos robóticos.
- Prototipado de pipelines de control con dos cámaras: la combinación de cámara superior y FPV sirve para experimentar con fusión de vistas en políticas de manipulación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tasas de éxito, métricas de error de posición ni comparaciones cuantitativas con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 450 millones de parámetros en safetensors (aproximadamente 1,8 GB en fp32 y unos 0,9 GB en fp16), la huella de pesos es modesta, pero el consumo real depende del codificador visual y del runtime.
- GPU recomendadas: no disponibles; por tamaño, cualquier GPU con al menos 4-8 GB de VRAM debería poder alojar los pesos en precisión reducida, aunque no hay confirmación del autor.
- Cabe en GPU de consumo: probable por el número de parámetros, pero no verificado; no se especifican modelos concretos (RTX 4090, RTX 3060, etc.).
- Opciones de despliegue: el repositorio está etiquetado con `lerobot`, por lo que el despliegue esperado es mediante la librería LeRobot; no se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, que además no son adecuados para una política de acciones robóticas.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint (SmolVLA SO-100 nut stacking) | 450.046.176 | no disponible | Apilado de tuercas con SO-100 | no disponible | Hugging Face, 10 descargas |
| `lerobot/smolvla_base` | no disponible en la informacion proporcionada | no disponible | Política VLA base para fine-tuning | no disponible | Hugging Face (referenciado como pretrained path) |
| Otras políticas VLA de la familia SmolVLA | no disponible | no disponible | Manipulación robótica general | no disponible | no disponible |

No se dispone de datos de rendimiento ni de especificaciones completas de los modelos comparables en la información proporcionada, por lo que la comparación cuantitativa no es posible.

## Limitaciones y advertencias

- Paso del checkpoint sin verificar: el autor indica explícitamente que no se conoce el step exacto guardado y que no debe inferirse del objetivo de 20.000 pasos, lo que dificulta reproducir el entrenamiento con precisión.
- Licencia no disponible: no se especifica licencia, por lo que el uso comercial queda en un limbo legal y requiere contactar con el autor.
- Especialización estrecha: la política está afinada para una tarea concreta (apilado de tuercas) sobre un robot concreto (SO-100) y una configuración de sensores concreta (seis estados, cámara superior y FPV); no es un modelo general.
- Riesgo de sobreajuste al entorno de demostración: al tratarse de aprendizaje por imitación sobre un único dataset, es probable que la política degrade ante cambios de iluminación, posición de cámara u objetos distintos, aunque no se documenta evidencia experimental.
- Idiomas no disponibles: no se documenta ningún soporte lingüístico; no debe asumirse comprensión de instrucciones en lenguaje natural.
- Sin benchmarks: no hay métricas de éxito publicadas, por lo que no se puede evaluar su fiabilidad antes de desplegarlo.
- Procedencia parcial: el repositorio proviene de una carpeta local de exportación y de un autor con pocas descargas; conviene validar el hash SHA-256 indicado antes de usar los pesos.
- No apto para producción sin validación: la ausencia de licencia, benchmarks y verificación de checkpoint desaconseja su uso en sistemas reales sin una evaluación previa exhaustiva.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Samisaliveagain/smolvla-so100-nut-stacking-batch16-step-unverified-base-init-export20261011
- Modelo base referenciado: https://huggingface.co/lerobot/smolvla_base
- Dataset de entrenamiento: https://huggingface.co/datasets/shubham4413/so100_smolvla_rc
- LeRobot (librería): https://github.com/huggingface/lerobot
- Fichero de identidad y procedencia: `model_identity.json` en la raíz del repositorio
