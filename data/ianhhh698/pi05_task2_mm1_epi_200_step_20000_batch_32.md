# IanHHH698/pi05_task2_MM1_epi_200_step_20000_batch_32

## Resumen

El modelo `IanHHH698/pi05_task2_MM1_epi_200_step_20000_batch_32` es una política robótica basada en π₀.₅ (Pi05), un modelo Vision-Language-Action (VLA) desarrollado por Physical Intelligence para abordar la generalización en entornos abiertos. Esta implementación concreta ha sido fine-tuneada con la librería LeRobot de Hugging Face sobre el dataset `cbrian/merge_task2_MM_epi_200`, que contiene 200 episodios de una tarea de manipulación denominada "task2 MM". El modelo tiene aproximadamente 3.617 millones de parámetros (3.6B) y se distribuye en formato safetensors.

La relevancia de este modelo radica en que representa un avance hacia la generalización de políticas robóticas: mientras que los modelos tradicionales funcionan bien en entornos controlados, π₀.₅ está diseñado para adaptarse a situaciones y escenarios no vistos durante el entrenamiento. Al estar publicado bajo licencia Apache 2.0 y con soporte de LeRobot, es accesible para la comunidad investigadora y de desarrollo, permitiendo su uso en tareas de manipulación robótica con robots como SO-100 o similares.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) basada en π₀.₅ |
| Parametros totales | 3.616.757.520 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura π₀.₅ de Physical Intelligence, que combina un codificador visual, un modelo de lenguaje y una cabeza de acción para generar comandos motores directamente a partir de observaciones visuales y lenguaje natural. La implementación en LeRobot adapta el repositorio OpenPI de Physical Intelligence. El entrenamiento se realizó mediante fine-tuning sobre el dataset `cbrian/merge_task2_MM_epi_200`, que contiene 200 episodios de una tarea de manipulación específica. No se dispone de información detallada sobre el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO. El checkpoint se guardó tras 20.000 pasos con un batch size de 32, según se deduce del nombre del repositorio.

## Capacidades

- Control de robots manipuladores: genera acciones de articulación (posición, velocidad o esfuerzo) a partir de imágenes y/o instrucciones de lenguaje.
- Generalización a entornos nuevos: diseñado para funcionar en escenarios no vistos durante el entrenamiento, gracias a la arquitectura VLA de π₀.₅.
- Integración con LeRobot: compatible con el ecosistema de Hugging Face para entrenamiento, evaluación y despliegue en robots reales o simulados.
- Procesamiento multimodal: combina entradas visuales (cámaras) y textuales (instrucciones) para producir acciones.
- Fine-tuning específico: adaptado a la tarea "task2 MM", lo que sugiere que puede ejecutar manipulaciones de precisión en un entorno de mesa.

## Casos de uso

- Manipulación robótica en laboratorio: el modelo puede controlar un brazo robótico (p. ej., SO-100) para realizar tareas de recogida y colocación de objetos, aprovechando su capacidad de generalización a configuraciones nuevas.
- Automatización de tareas repetitivas en entornos controlados: al estar fine-tuneado con 200 episodios de una tarea concreta, es adecuado para líneas de montaje o ensamblaje donde se requiere precisión y consistencia.
- Investigación en aprendizaje por imitación: sirve como punto de partida para estudiar cómo los modelos VLA se adaptan a nuevas tareas con pocos datos, comparando su rendimiento con otras políticas como ACT o Diffusion Policy.
- Evaluación de políticas en simulación: se puede integrar en entornos simulados (p. ej., MuJoCo) para validar el comportamiento antes de desplegarlo en hardware real.
- Desarrollo de robots de asistencia doméstica: aunque el entrenamiento es específico, la arquitectura π₀.₅ permite explorar su uso en tareas del hogar como ordenar objetos o abrir cajones, siempre que se realice un fine-tuning adicional.
- Benchmarking de generalización: al ser un modelo de código abierto con licencia permisiva, puede utilizarse como referencia para comparar la robustez de otras políticas ante cambios de iluminación, fondo o disposición de objetos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de métricas como MMLU, HumanEval o GSM8K, ya que se trata de un modelo de robótica y no de lenguaje general. Tampoco se han reportado tasas de éxito en tareas de manipulación específicas.

## Requisitos de hardware

- VRAM estimada para inferencia: con 3.6B parámetros, en FP16 se necesitan aproximadamente 7 GB de VRAM solo para los pesos, más overhead de activaciones y optimizador. Se recomienda al menos 12 GB de VRAM para inferencia en tiempo real.
- GPU recomendadas: una RTX 3090, RTX 4090 o A100 (16 GB o más) son suficientes para ejecutar el modelo con margen. Para entrenamiento o fine-tuning adicional, se recomienda una GPU con 24 GB o más.
- Compatibilidad con GPU de consumo: sí, cabe en GPUs de consumo como la RTX 3080/3090/4090, siempre que se utilice una cuantización adecuada (aunque no se han publicado cuantizaciones oficiales).
- Opciones de despliegue: LeRobot ofrece scripts de entrenamiento e inferencia (`lerobot-train`, `lerobot-record`). También se puede integrar con frameworks como vLLM o TGI si se convierte el modelo a un formato compatible, aunque no es el flujo estándar para políticas robóticas.
- Latencia y throughput: no se dispone de datos medidos. En una GPU moderna, se espera una inferencia en el rango de 10-50 ms por paso de control, dependiendo de la resolución de imagen y la longitud de la secuencia.

## Comparativa con modelos similares

| Modelo | Parametros | Arquitectura | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| π₀.₅ (este modelo) | 3.6B | VLA | no disponible | Apache 2.0 | Hugging Face |
| ACT (Action Chunking Transformer) | ~80M | Transformer | 512 tokens | MIT | LeRobot |
| Diffusion Policy | ~100M | Diffusion | no disponible | MIT | LeRobot |
| π₀ (original) | ~3B | VLA | no disponible | Apache 2.0 | OpenPI |

La comparativa es limitada porque no se dispone de benchmarks comunes. ACT y Diffusion Policy son políticas más ligeras y específicas para tareas de imitación, mientras que π₀.₅ es un modelo de propósito general con mayor capacidad de generalización. La licencia Apache 2.0 de π₀.₅ permite uso comercial sin restricciones, a diferencia de otras alternativas.

## Limitaciones y advertencias

- Sesgos y alucinaciones: al ser un modelo entrenado con datos de demostración, puede presentar comportamientos erráticos o inseguros en situaciones no cubiertas por el dataset. No se han documentado sesgos específicos, pero es recomendable supervisar siempre la ejecución en robots reales.
- Riesgo de seguridad: en robótica, un fallo del modelo puede causar daños físicos. Se debe implementar un botón de parada de emergencia y validar el modelo en simulación antes de usarlo en hardware.
- Limitaciones de contexto: no se ha especificado la longitud de contexto, pero los modelos VLA suelen procesar secuencias cortas de imágenes y texto. No es adecuado para tareas que requieran razonamiento de largo plazo o memoria extensa.
- Dependencia del dataset: el fine-tuning se realizó sobre una tarea concreta (task2 MM). El rendimiento en otras tareas será limitado sin un nuevo entrenamiento.
- Idiomas: no se ha indicado qué idiomas soporta el componente de lenguaje. Es probable que funcione mejor en inglés, dado el origen del modelo base.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero se debe mantener el aviso de copyright y las condiciones de la licencia. No hay restricciones de uso militar o de vigilancia explícitas, pero se recomienda revisar la política de Physical Intelligence.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/IanHHH698/pi05_task2_MM1_epi_200_step_20000_batch_32
- Blog de Physical Intelligence sobre π₀.₅: https://www.physicalintelligence.company/blog/pi05
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio OpenPI (código fuente de π₀.₅): https://github.com/Physical-Intelligence/openpi (referencia indirecta, no verificado en la búsqueda)
