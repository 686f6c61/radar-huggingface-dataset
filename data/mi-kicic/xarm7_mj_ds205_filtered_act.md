# mi-kicic/xarm7_mj_ds205_filtered_act

## Resumen

El modelo `mi-kicic/xarm7_mj_ds205_filtered_act` es una política de imitación basada en Action Chunking with Transformers (ACT), entrenada con el framework LeRobot para controlar un brazo robótico simulado de tipo Mujoco XArm7. El modelo aprende a ejecutar la tarea de recoger un motor azul e insertarlo en una caja de cambios naranja, a partir de datos teleoperados. ACT predice secuencias de acciones (chunks) en lugar de pasos individuales, lo que mejora la estabilidad y el éxito en tareas de manipulación.

Desarrollado por el usuario mi-kicic, este modelo es un ejemplo de aplicación de aprendizaje por imitación en robótica, con una arquitectura transformer encoder-decoder. Tiene aproximadamente 51,6 millones de parámetros y se distribuye bajo licencia Apache 2.0. Aunque no se han publicado resultados de evaluación, el modelo está disponible públicamente para su uso y reproducción en entornos compatibles con LeRobot.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (ACT) |
| Parametros totales | 51.587.720 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica, es un modelo de política robótica) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura ACT (Action Chunking with Transformers), presentada en el paper arXiv:2304.13705. Se trata de un transformer encoder-decoder que procesa observaciones multimodales (imágenes de tres cámaras y estado del robot) y genera un chunk de acciones de longitud fija (en este caso, 8 dimensiones por paso). El entrenamiento se realizó mediante aprendizaje por imitación sobre un dataset de demostraciones teleoperadas, con 30.000 pasos de entrenamiento, batch size de 8, optimizador AdamW y learning rate de 1e-5. El dataset contiene 385 episodios y 93.979 frames a 10 FPS, capturados con cámaras frontal, de muñeca y de esquina. No se menciona el uso de RLHF ni DPO; es un entrenamiento supervisado estándar.

## Capacidades

- Control de un brazo robótico simulado (Mujoco XArm7) mediante políticas de imitación.
- Procesamiento de observaciones visuales de tres cámaras (frontal, muñeca, esquina) y estado del robot (15 dimensiones).
- Generación de acciones de control en un espacio de 8 dimensiones, adecuado para tareas de manipulación.
- Ejecución de tareas específicas aprendidas por demostración, como recoger e insertar objetos.
- Integración con el ecosistema LeRobot para entrenamiento, evaluación y despliegue en robots reales o simulados.
- No soporta tool calling, agentes ni razonamiento multi-paso en el sentido de modelos de lenguaje; su función es exclusivamente robótica.

## Casos de uso

- Automatización de tareas de ensamblaje en entornos simulados: el modelo puede ejecutar la tarea de inserción de un motor en una caja de cambios, sirviendo como base para desarrollar políticas más complejas.
- Investigación en aprendizaje por imitación: permite reproducir y estudiar el comportamiento de ACT en un brazo robótico de bajo coste, facilitando experimentos con diferentes datasets y configuraciones.
- Desarrollo de prototipos de control robótico: al ser un modelo ligero (51M parámetros), puede ejecutarse en GPUs de consumo para pruebas rápidas en simulación.
- Generación de datos sintéticos para entrenamiento: el modelo puede usarse para generar trayectorias adicionales que complementen datasets de demostración.
- Benchmarking de algoritmos de imitación: sirve como punto de comparación para evaluar nuevas arquitecturas o métodos de entrenamiento en la misma tarea.
- Educación y formación en robótica: permite a estudiantes y desarrolladores experimentar con políticas de imitación sin necesidad de hardware físico, usando el simulador Mujoco.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que no hay resultados de evaluación en robot real o simulado.

## Requisitos de hardware

- VRAM estimada: al ser un modelo de 51M parámetros, la inferencia es ligera. Se estima que puede ejecutarse en GPUs con al menos 2-4 GB de VRAM, aunque no se proporcionan datos exactos.
- GPU recomendadas: cualquier GPU moderna con soporte CUDA, como NVIDIA GTX 1060 o superior, RTX 2060, RTX 3060, etc. También puede ejecutarse en CPU para pruebas lentas.
- Compatibilidad con consumer GPU: sí, cabe en GPUs de gama media y baja.
- Opciones de despliegue: LeRobot proporciona scripts de rollout (`lerobot-rollout`) que cargan el modelo y lo ejecutan en el robot simulado. También puede integrarse con vLLM o TGI, aunque no es habitual para modelos de robótica.
- Latencia y throughput: no disponibles; dependen del hardware y del número de cámaras procesadas.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (políticas ACT para XArm7). Existen otros modelos ACT en el Hub de HuggingFace, pero no se han encontrado datos de rendimiento o especificaciones detalladas para establecer una comparación objetiva. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente para una tarea concreta (recoger motor azul e insertarlo en caja de cambios naranja) y no generaliza a otras tareas sin reentrenamiento.
- Depende del entorno simulado Mujoco XArm7; su transferencia a un robot físico requiere calibración y adaptación.
- No se han proporcionado resultados de evaluación, por lo que se desconoce su tasa de éxito real.
- El dataset de entrenamiento puede contener sesgos en la distribución de las demostraciones, lo que afecta a la robustez del modelo.
- Al ser un modelo de imitación, puede presentar alucinaciones en el sentido de ejecutar acciones no deseadas si las observaciones difieren del dominio de entrenamiento.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda verificar los términos del dataset asociado.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/mi-kicic/xarm7_mj_ds205_filtered_act)
- [Dataset de entrenamiento](https://huggingface.co/datasets/mi-kicic/xarm7_mj_ds205_filtered)
- [Paper de ACT (arXiv:2304.13705)](https://huggingface.co/papers/2304.13705)
- [Repositorio de LeRobot](https://github.com/huggingface/lerobot)
- [Documentación de LeRobot para ACT](https://huggingface.co/docs/lerobot/main/en/act)
