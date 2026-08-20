# fecasado/gact-cubes-vit-dino-v4

## Resumen

El modelo `fecasado/gact-cubes-vit-dino-v4` es una política de control robótico (policy) entrenada con el framework LeRobot de Hugging Face. Pertenece a la familia `gaze_act`, una variante de la arquitectura ACT (Action Chunking with Transformers) que incorpora un backbone visual ViT preentrenado con DINO (self-supervised learning). El autor, fecasado, lo ha entrenado sobre el dataset `fecasado/Ncubes-to-Nbaskets-320x240`, que contiene demostraciones de manipulación de cubos hacia cestas con imágenes de 320x240 píxeles.

El modelo resuelve el problema de aprendizaje por imitación para tareas de manipulación robótica: a partir de observaciones visuales y del estado del robot, genera secuencias de acciones (chunks) que permiten ejecutar la tarea de forma autónoma. Es relevante porque demuestra el uso de backbones visuales modernos (DINO) dentro del ecosistema LeRobot, que estandariza el entrenamiento y despliegue de políticas robóticas en hardware asequible. Con 44,8 millones de parámetros, es un modelo compacto adecuado para inferencia en tiempo real en GPUs de consumo.

La arquitectura exacta no está completamente documentada en la model card, pero por el nombre y las etiquetas se infiere que combina un transformer de acción con un codificador visual ViT basado en DINO. El repositorio incluye pesos en formato safetensors y está pensado para ser usado con la librería LeRobot.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers) con backbone ViT-DINO (variante gaze_act) |
| Parametros totales | 44.821.402 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (depende de la ventana de observación definida en el entrenamiento) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin cuantizaciones publicadas) |
| Idiomas soportados | no disponible (modelo de control robótico, sin procesamiento de lenguaje natural) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura se basa en ACT (Action Chunking with Transformers), un enfoque de aprendizaje por imitación que predice secuencias de acciones futuras (chunks) en lugar de una única acción, lo que mejora la estabilidad y la frecuencia de control. La variante `gaze_act` incorpora un mecanismo de atención sobre la mirada (gaze) del robot, aunque los detalles concretos no están documentados en la model card. El backbone visual es un Vision Transformer (ViT) preentrenado con DINO, un método de aprendizaje autosupervisado desarrollado por Meta AI que extrae características visuales robustas sin necesidad de etiquetas manuales.

El entrenamiento se realizó con el framework LeRobot, utilizando el dataset `fecasado/Ncubes-to-Nbaskets-320x240`. No se especifican el número de tokens, la composición exacta del dataset ni si se aplicaron técnicas de refinamiento como RLHF o DPO (poco habituales en robótica). El pipeline de entrenamiento estándar de LeRobot para ACT utiliza un optimizador AdamW, pérdida de entropía cruzada para acciones discretizadas y posiblemente aumentación de datos visual. No se han publicado detalles sobre innovaciones técnicas adicionales más allá del uso de DINO como extractor de características.

## Capacidades

- Generación de secuencias de acciones para control robótico: el modelo predice chunks de acciones (posición, orientación, fuerza, etc.) a partir de observaciones visuales y del estado del robot.
- Manipulación de objetos en entornos estructurados: entrenado específicamente para la tarea de mover cubos a cestas (Ncubes-to-Nbaskets), con imágenes de 320x240.
- Aprendizaje por imitación: puede replicar comportamientos demostrados en el dataset de entrenamiento.
- Integración con LeRobot: compatible con el ecosistema de entrenamiento, evaluación y despliegue de LeRobot, incluyendo robots como SO-100 o SO-101.
- Capacidades visuales: utiliza un backbone ViT-DINO para extraer características de imágenes, lo que le permite operar con entrada visual directa.
- No soporta tool calling, agentes, razonamiento simbólico ni procesamiento de lenguaje natural: es un modelo puramente motor (policy) para control de bajo nivel.

## Casos de uso

- Manipulación robótica en laboratorio: el modelo puede controlar un brazo robótico para recoger cubos y depositarlos en una cesta, replicando las demostraciones del dataset. Es adecuado para experimentos de aprendizaje por imitación en entornos controlados.
- Investigación en aprendizaje por imitación: sirve como baseline para estudiar el efecto de backbones visuales (DINO) en políticas ACT, comparando con variantes que usan ResNet u otros extractores.
- Desarrollo de habilidades de agarre y colocación: la tarea de cubos a cestas implica agarre, transporte y liberación, habilidades transferibles a otras tareas de pick-and-place.
- Evaluación de políticas robóticas en simulación: puede desplegarse en entornos simulados (por ejemplo, MuJoCo) para validar el comportamiento antes de pasar al hardware real.
- Educación en robótica con LeRobot: los estudiantes pueden cargar el modelo en un robot SO-100 y observar cómo una política entrenada por imitación ejecuta una tarea, sirviendo como ejemplo práctico del flujo de LeRobot.
- Benchmarking de hardware robótico: al ser un modelo compacto, puede usarse para medir latencia y throughput de inferencia en diferentes GPUs o controladores embebidos, ayudando a seleccionar hardware para despliegues en tiempo real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de éxito en la tarea, tasas de error ni comparaciones con otros modelos. El autor no ha documentado experimentos cuantitativos en el repositorio.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible oficialmente, pero con 44,8M de parámetros y entrada visual de 320x240, se estima que necesita menos de 2 GB de VRAM en FP32, y menos de 1 GB en FP16. No se han publicado mediciones.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM debería ser suficiente. Tarjetas como NVIDIA GTX 1650, RTX 3060 o superiores son adecuadas. Para entrenamiento, se recomienda al menos 8 GB de VRAM (por ejemplo, RTX 3070, RTX 4080).
- Compatibilidad con GPU de consumo: sí, cabe en la mayoría de GPUs de consumo actuales.
- Opciones de despliegue: LeRobot ofrece scripts de evaluación y registro (`lerobot-record`) que cargan el modelo y lo ejecutan en robots reales o simulados. No se mencionan integraciones con vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje.
- Latencia y throughput estimados: no disponibles. Dependen del hardware y de la frecuencia de control requerida (típicamente 10-30 Hz para robots de bajo costo).

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa rigurosa. El autor tiene otros modelos similares en el Hub (por ejemplo, `fecasado/gact-cubes-vit-dino`, `fecasado/gact-cubes-22d1`, `fecasado/gact-cubes-32a`, `fecasado/gfm-cubes-baseline-vit`), pero no se han publicado métricas comparativas. En el ecosistema LeRobot existen políticas ACT estándar (por ejemplo, las entrenadas con backbones ResNet) y políticas de flujo (flow matching), pero sin datos de rendimiento de este modelo concreto no es posible establecer una comparación objetiva. Se recomienda consultar los repositorios del autor para más variantes.

## Limitaciones y advertencias

- Sesgos conocidos: no se han documentado, pero al ser un modelo entrenado en un dataset específico, puede tener sesgos hacia las condiciones del entorno de captura (iluminación, posición de cámara, color de objetos).
- Riesgo de alucinación: en el contexto robótico, el modelo puede generar acciones no seguras si las observaciones difieren mucho del dominio de entrenamiento. No hay mecanismos de verificación de seguridad integrados.
- Limitaciones de contexto: la ventana de observación está fijada por el entrenamiento; no se especifica su longitud, pero es probable que sea corta (por ejemplo, 1-2 frames). No soporta contextos largos ni memoria episódica.
- Limitaciones de idioma: no aplica, es un modelo de control sin procesamiento de lenguaje.
- Restricciones de licencia: Apache-2.0 permite uso comercial, modificación y distribución, siempre que se mantenga el aviso de licencia. No hay restricciones de uso militar o de campos específicos.
- Caveat para producción: este modelo es un experimento de investigación (descargas 0, sin documentación detallada). No ha sido validado en entornos industriales ni con robots comerciales. Su uso en producción requiere pruebas exhaustivas de seguridad y robustez.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/fecasado/gact-cubes-vit-dino-v4)
- [Dataset de entrenamiento](https://huggingface.co/datasets/fecasado/Ncubes-to-Nbaskets-320x240)
- [LeRobot (librería)](https://github.com/huggingface/lerobot)
- [Documentación de LeRobot](https://huggingface.co/docs/lerobot/index)
- [Proyecto DINO (Meta AI)](https://github.com/facebookresearch/dino)
- [Variantes del autor en el Hub](https://huggingface.co/fecasado?search_models=gact-cubes)
