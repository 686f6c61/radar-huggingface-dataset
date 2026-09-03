# GT-111/bi-lawm-realman-finetune-from-bidir50k

## Resumen

El repositorio `GT-111/bi-lawm-realman-finetune-from-bidir50k` contiene los checkpoints de un fine-tuning del modelo Bi-LaWM, un modelo de visión-lenguaje-acción (VLA) orientado a robótica, desarrollado por el autor GT-111. Este fine-tuning está especializado en el control bimanual del robot RealMan RM65-B, partiendo de los pesos preentrenados del Stage2 de 50k pasos del proyecto bidir (bi-lawm-bidir-stage2). El modelo está diseñado para generar comandos de acción (target_ee_poses) a partir de observaciones visuales de múltiples cámaras y, presumiblemente, instrucciones en lenguaje natural.

Se trata de un checkpoint de entrenamiento distribuido con FSDP, no de pesos fusionados para inferencia directa, y su tamaño de repositorio es de 163.1 GB. El entrenamiento se completó en una sola ejecución de 59 horas utilizando 8 GPUs A100, alcanzando una pérdida final de 0.013. La relevancia de este modelo radica en su demostración de fine-tuning de un VLA en un robot específico con un conjunto de datos de teleoperación bimanual, lo que resulta útil para la investigación en manipulación robótica y aprendizaje por demostración. No se proporcionan detalles sobre la arquitectura interna, el número de parámetros o la licencia.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Bi-LaWM (visión-lenguaje-acción, con módulo LAM congelado) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (checkpoints FSDP sin cuantización) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | Checkpoints FSDP sharded (`pytorch_model_fsdp_*`), no fusionados para inferencia |

## Arquitectura y entrenamiento

Bi-LaWM es un modelo de visión-lenguaje-acción que combina un codificador visual, un modelo de lenguaje y un módulo de acción (LAM) para generar comandos de control robótico. En este fine-tuning, el módulo LAM se mantiene congelado (proveniente del Stage1 de 38k pasos del proyecto bidir), mientras que el VLM y el flujo de acción se actualizan. El modelo se inicializó desde el checkpoint consolidado del Stage2 de 50k del repo `bi-lawm-bidir-stage2`, y se entrenó una nueva ranura de embodiment (slot 31) desde cero, manteniendo los pesos preentrenados en las demás ranuras.

El entrenamiento se realizó sobre el dataset `realman_toy v3` (LeRobot v3.0), compuesto por 397 episodios de teleoperación bimanual, con 211,809 fotogramas a 30 Hz y un horizonte de acción de 1.0 segundo (30 tokens de acción). Las observaciones consisten en tres cámaras (cabeza y muñecas izquierda/derecha) a resolución 256×256, y las acciones son comandos de pose objetivo de extremo del efector (EEF) de 16 dimensiones (8D por brazo: posición x,y,z, cuaternión w,x,y,z y apertura de pinza). La etapa de fine-tuning utilizó una tasa de aprendizaje 1e-4 con decaimiento coseno hasta 5e-7, y se ejecutaron 33,310 pasos de optimización (20 épocas de dataloader) en 59 horas con 8 GPUs A100, con un tiempo de 6.4 segundos por paso. La pérdida de entrenamiento final fue de 0.013, partiendo de 1.28. No se menciona el uso de RLHF, DPO u otras técnicas de alineación.

## Capacidades

- Generación de comandos de acción bimanual (target_ee_poses) para el robot RealMan RM65-B, a partir de observaciones visuales de tres cámaras.
- Procesamiento de secuencias de imágenes de alta frecuencia (30 Hz) con un horizonte de acción de 1 segundo (30 tokens).
- Manejo de entrada multimodal: visión (3 cámaras) y, presumiblemente, lenguaje natural (al ser un modelo VLA), aunque no se detalla el formato de las instrucciones.
- Especialización en control de robots bimanuales con 16 grados de libertad (8 por brazo).
- Integración con el ecosistema LeRobot v3.0 para teleoperación y recolección de datos.
- Capacidad de fine-tuning adicional sobre el checkpoint (al ser un checkpoint de entrenamiento, permite continuar el entrenamiento).

## Casos de uso

- Investigación en manipulación bimanual: el modelo puede utilizarse para estudiar estrategias de control coordinado de dos brazos en tareas como ensamblaje, manipulación de objetos grandes o tareas que requieren cooperación entre extremidades.
- Aprendizaje por demostración: dado que se entrena con episodios teleoperados, sirve como base para desarrollar políticas que imiten demostraciones humanas en el robot RealMan RM65-B.
- Evaluación de transferencia de habilidades: al congelar el módulo LAM y fine-tunear solo el VLM y el flujo, permite analizar cómo se adapta un modelo preentrenado a un nuevo robot o entorno.
- Desarrollo de sistemas de control basados en visión: el modelo puede emplearse en entornos de simulación o con hardware real para probar algoritmos de control reactivo a partir de imágenes.
- Benchmarking de modelos VLA: al ser un checkpoint público, puede usarse como referencia para comparar el rendimiento de otros modelos de visión-lenguaje-acción en tareas robóticas.
- Base para fine-tuning adicional: los checkpoints FSDP permiten reanudar el entrenamiento o adaptar el modelo a nuevas tareas con más datos, aunque se requiere el código de Bi-LaWM y configuración FSDP.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- El entrenamiento se realizó con 8 GPUs A100 (no se especifica la capacidad de memoria, probablemente 80 GB), con un tiempo de 6.4 s/step y 59 horas totales para 33,310 pasos.
- Para inferencia, no se proporcionan requisitos específicos. Dado que el tamaño del repositorio es de 163 GB (incluyendo shards de optimizador y estados), se deduce que el modelo tiene un número elevado de parámetros, probablemente en el rango de decenas de miles de millones, por lo que se recomienda hardware de gama alta.
- Es posible que una GPU con 80 GB de memoria (A100/H100) sea necesaria para cargar el modelo fusionado en precisión completa, o múltiples GPUs si se requiere paralelismo.
- Los checkpoints son de entrenamiento FSDP, por lo que deben fusionarse y exportarse a un formato de inferencia (por ejemplo, safetensors) antes de su uso con frameworks como vLLM, llama.cpp u Ollama. No se mencionan formatos de cuantización.
- No se ofrecen datos de latencia o throughput.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (VLA para robótica bimanual) dentro de la documentación proporcionada. No se puede establecer una comparativa con alternativas como RT-2, Octo o OpenVLA sin datos adicionales. Por tanto, esta sección queda como "no disponible".

## Limitaciones y advertencias

- Licencia no especificada: el uso comercial o la redistribución pueden estar restringidos, por lo que se debe contactar al autor antes de utilizarlo en producción.
- Checkpoints de entrenamiento, no de inferencia: requieren fusión y exportación mediante las herramientas del proyecto Bi-LaWM antes de poder ejecutarlos.
- Dependencia del código de Bi-LaWM y de la configuración FSDP correspondiente; no son pesos autónomos.
- Sesgos y alucinaciones: no se documentan sesgos específicos, pero al ser un modelo entrenado en un conjunto de datos limitado (397 episodios), puede tener dificultades para generalizar a entornos no vistos o a variaciones en la iluminación, texturas o disposición de objetos.
- Limitaciones de idioma: al no especificarse idiomas, es probable que el modelo esté optimizado para instrucciones en inglés (común en VLA), pero no se confirma.
- Sin datos de rendimiento en benchmarks: no se puede evaluar su calidad frente a otros modelos.
- No se mencionan técnicas de mitigación de riesgos de seguridad física en el control robótico; se debe usar con precaución en entornos reales.

## Enlaces

- Repositorio del modelo: https://huggingface.co/GT-111/bi-lawm-realman-finetune-from-bidir50k
- Repositorio del Stage2 bidir (predecesor): https://huggingface.co/GT-111/bi-lawm-bidir-stage2
- No se proporcionan otros enlaces (papers, blogs, demos) en la información disponible.
