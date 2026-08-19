# ant0nh/pi05_500_synyonym_25k

## Resumen

Este modelo es un fine-tune del modelo robótico Pi0.5 (π₀.₅) de Physical Intelligence, entrenado por el usuario ant0nh sobre un dataset propio de demostraciones de manipulación. Pi0.5 es un modelo Vision-Language-Action (VLA) diseñado para la generalización en entornos abiertos: combina visión, lenguaje y acción para controlar robots de forma directa, sin necesidad de programar cada movimiento. Este fine-tune concreto se ha entrenado con 498 episodios de tareas de "poner objetos en bandejas o cajas" usando un brazo robótico SO-101, y está publicado bajo licencia Apache 2.0.

La relevancia de este modelo radica en que demuestra el flujo de fine-tuning de Pi0.5 mediante la librería LeRobot, permitiendo a la comunidad adaptar un modelo base generalista a tareas específicas con relativamente pocos datos. Con aproximadamente 4.14 mil millones de parámetros, es un modelo de tamaño medio que puede ejecutarse en GPUs de consumo, lo que facilita su adopción en laboratorios de robótica. El modelo acepta como entrada el estado del robot (6 dimensiones) y dos imágenes de cámara (muñeca y frontal), y produce acciones de 6 dimensiones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) basada en Pi0.5 (π₀.₅) |
| Parametros totales | 4.143.404.816 (≈4.14B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de acción robótica, no de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (instrucciones en ingles en el dataset) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 9.4 GB) |

## Arquitectura y entrenamiento

Pi0.5 es un modelo VLA que evoluciona de Pi0, incorporando co-entrenamiento sobre datos heterogéneos: demostraciones robóticas, datos web y subtareas semánticas. Esto le permite generalizar a entornos y situaciones no vistas durante el entrenamiento. La implementación utilizada aquí es la adaptación de LeRobot del repositorio OpenPI de Physical Intelligence. El modelo procesa observaciones multimodales (estado del robot y dos imágenes RGB) y genera acciones de control continuo.

El fine-tune se realizó sobre el modelo base `lerobot/pi05_base` usando el dataset `ant0nh/pnp_500_synonym_cleaned`, que contiene 498 episodios y 346.317 frames a 30 FPS. Las tareas incluyen instrucciones como "put the bag on the tray" o "put the pencil case in the box". El entrenamiento se ejecutó durante 20.000 pasos con batch size de 32, optimizador AdamW, learning rate de 2.5e-05 y semilla 1000, utilizando la versión 0.6.1 de LeRobot. No se menciona el uso de RLHF o DPO; se trata de un fine-tuning supervisado de imitación.

## Capacidades

- Control robótico de manipulación: genera acciones de 6 grados de libertad a partir de observaciones de estado y visión.
- Ejecución de tareas de pick-and-place: el modelo está entrenado para colocar objetos (bolsas, plátanos, cajas, cilindros, juguetes, etc.) en bandejas o cajas.
- Generalización a variaciones de objetos y posiciones gracias al co-entrenamiento de Pi0.5.
- Integración con LeRobot: compatible con el flujo de entrenamiento, evaluación y despliegue de la librería.
- Soporte de dos cámaras (muñeca y frontal) para percepción visual.
- No es un modelo de lenguaje general: no genera texto ni responde preguntas; su salida son acciones robóticas.

## Casos de uso

- Automatización de tareas de picking y placing en laboratorios de robótica: el modelo puede controlar un brazo SO-101 para recoger objetos de una superficie y depositarlos en una bandeja o caja, útil para experimentos de manipulación.
- Investigación en aprendizaje por imitación: sirve como punto de partida para estudiar cómo el fine-tuning de un VLA generalista mejora el rendimiento en tareas específicas con pocos datos.
- Desarrollo de sistemas de control dual (planificación de alto nivel + ejecución de bajo nivel): puede combinarse con un modelo de lenguaje para descomponer tareas complejas en subtareas, como se describe en el repositorio del autor.
- Evaluación de políticas robóticas en simulación: el modelo puede probarse en entornos como Isaac Sim mediante LeIsaac, permitiendo validar su comportamiento antes del despliegue físico.
- Benchmarking de VLA en hardware real: permite comparar el rendimiento de Pi0.5 fine-tuneado frente a otros modelos (SmolVLA, Pi0) en tareas estandarizadas de manipulación.
- Educación y prototipado: estudiantes e investigadores pueden usar este modelo como ejemplo completo de fine-tuning y despliegue de un VLA con LeRobot, sin necesidad de entrenar desde cero.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que no hay resultados de evaluación en robot real para esta política concreta. El paper original de Pi0.5 (arXiv:2504.16054) reporta métricas de generalización, pero no se aplican directamente a este fine-tune.

## Requisitos de hardware

- VRAM estimada: no disponible oficialmente, pero con 4.14B parámetros en FP32 se necesitarían ~16 GB; con cuantización a 8 bits podría reducirse a ~8 GB. No se han publicado cifras exactas.
- GPU recomendadas: una GPU con al menos 12-16 GB de VRAM (por ejemplo, RTX 3090, RTX 4090, A10) para inferencia en FP16. Para entrenamiento, se recomienda una GPU con 24 GB o más (A100, RTX 4090).
- Compatibilidad con GPUs de consumo: sí, es plausible que quepa en una RTX 4090 o similar con cuantización, aunque no hay confirmación oficial.
- Opciones de despliegue: LeRobot (librería principal), con soporte para inferencia en tiempo real mediante `lerobot-rollout`. También puede usarse con vLLM o TGI si se adapta, pero no es el flujo estándar.
- Latencia y throughput: no disponibles. Al ser un modelo de acción robótica, la latencia depende del hardware y del bucle de control.

## Comparativa con modelos similares

No se dispone de datos comparativos directos para este fine-tune. Como referencia, el modelo base Pi0.5 (4.14B) se sitúa en la misma categoría que otros VLA como SmolVLA (también basado en Pi0.5) o el Pi0 original. Sin embargo, no hay benchmarks públicos que comparen este fine-tune específico con alternativas. Se recomienda consultar el paper de Pi0.5 para comparaciones a nivel de modelo base.

## Limitaciones y advertencias

- Sesgos conocidos: el modelo se entrenó únicamente con tareas de pick-and-place sobre una bandeja o caja; no generalizará a otras tareas de manipulación sin fine-tuning adicional.
- Riesgo de alucinación: al ser un modelo de acción, puede generar movimientos no deseados si las observaciones difieren mucho del dataset de entrenamiento. No hay garantía de seguridad en entornos no controlados.
- Limitaciones de contexto: no es un modelo de lenguaje; no procesa instrucciones complejas ni conversaciones. Solo ejecuta la tarea para la que fue entrenado.
- Limitaciones de idioma: las instrucciones del dataset están en inglés; no se ha evaluado el rendimiento con instrucciones en otros idiomas.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el modelo base Pi0.5 tiene su propia licencia (Apache 2.0 según la model card, aunque se recomienda verificar los términos de Physical Intelligence).
- Caveat para producción: el modelo requiere un robot físico calibrado y cámaras con las mismas características que las usadas en el entrenamiento (resolución 640x480, 30 FPS). Cualquier cambio en la configuración puede degradar el rendimiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ant0nh/pi05_500_synyonym_25k
- Dataset de entrenamiento: https://huggingface.co/datasets/ant0nh/pnp_500_synonym_cleaned
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Paper de Pi0.5: https://arxiv.org/abs/2504.16054
- Blog de Physical Intelligence sobre Pi0.5: https://www.physicalintelligence.company/blog/pi05
- Repositorio del autor (tesis): https://github.com/antonhuan/thesis
- Documentación de LeRobot para pi05: https://huggingface.co/docs/lerobot/main/en/pi05
- Página de Pi0.5 en Qualcomm AI Hub: https://aihub.qualcomm.com/models/pi05
