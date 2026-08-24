# AndreGaio/smolvla_packing_v2

## Resumen

SmolVLA es un modelo de visión-lenguaje-acción (VLA) compacto y eficiente desarrollado por Hugging Face, con 450 millones de parámetros, diseñado para tareas de robótica y control. Este repositorio concreto, `AndreGaio/smolvla_packing_v2`, es un ajuste fino (fine-tuning) del modelo base `lerobot/smolvla_base` para una tarea específica de empaquetado: cargar gomas de borrar en un contenedor. El modelo consume observaciones de estado y tres cámaras (frontal, superior y muñeca) y produce acciones de 6 grados de libertad.

La relevancia de este modelo radica en su capacidad para ejecutarse en hardware de consumo, lo que democratiza el acceso a la robótica de aprendizaje por imitación. El ajuste fino se realizó con el framework LeRobot, sobre un dataset de 10 episodios (27.393 fotogramas) y 20.000 pasos de entrenamiento. Aunque aún no tiene resultados de evaluación publicados, representa un ejemplo práctico de cómo adaptar un VLA base a una tarea industrial concreta.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA (Vision-Language-Action) basada en transformer, sin detalles de capas o atención publicados en la información disponible |
| Parametros totales | 450.036.176 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del modelo base `lerobot/smolvla_base`, que corresponde a SmolVLA, un VLA compacto de 450 millones de parámetros presentado en el paper arXiv 2506.01844. SmolVLA se basa en un modelo de visión-lenguaje preentrenado a gran escala, adaptado para generar acciones robóticas a partir de observaciones visuales y de estado. La arquitectura combina un codificador de imágenes con un transformador de lenguaje y una cabeza de acción, sin recurrir a técnicas de mezcla de expertos (MoE) ni atención lineal.

El entrenamiento se realizó con el framework LeRobot (versión 0.6.2) sobre un dataset de demostraciones de la tarea "Load erasers into container", con 10 episodios a 30 FPS (27.393 fotogramas). La configuración incluyó 20.000 pasos de entrenamiento, tamaño de lote 4, optimizador AdamW, tasa de aprendizaje 0.0001 y semilla 1000. No se aplicaron técnicas de RLHF/DPO; se trata de aprendizaje por imitación supervisada. No se dispone de información sobre la composición exacta del dataset ni sobre el uso de decodificación especulativa u otras innovaciones técnicas específicas del ajuste.

## Capacidades

- Control robótico de 6 grados de libertad (acciones de posición/orientación) a partir de observaciones de estado y tres cámaras RGB de 256x256.
- Percepción multi-cámara simultánea (frontal, superior y de muñeca) para tareas de manipulación.
- Generación de acciones continuas en tiempo real (30 FPS) mediante política base en LeRobot.
- No soporta tool calling, function calling ni razonamiento de agentes fuera del ámbito robótico.
- No tiene capacidades de conversación o generación de texto; es un modelo de control puro.
- Multilingüismo: no aplicable, ya que no procesa lenguaje natural en esta variante.

## Casos de uso

- **Empaquetado industrial**: el modelo puede controlar un brazo robótico para cargar objetos pequeños (gomas de borrar) en contenedores, útil en líneas de montaje automatizadas. Gracias a su tamaño compacto, puede desplegarse en controladores embebidos o GPUs de gama media.
- **Manipulación de objetos en almacenes**: tareas de recogida y colocación (pick-and-place) con múltiples cámaras para mejorar la precisión en entornos desordenados.
- **Investigación en aprendizaje por imitación**: sirve como base para experimentar con datasets pequeños y validar técnicas de fine-tuning sobre VLA, ya que requiere pocos recursos.
- **Prototipado de robots educativos**: permite implementar políticas de control en robots de bajo coste (como el SoFollower) en laboratorios y aulas.
- **Automatización de tareas repetitivas en logística**: clasificación y empaquetado de productos en almacenes, usando las tres cámaras para detectar posición y orientación.
- **Desarrollo de sistemas de control adaptativo**: el modelo puede ser reentrenado con nuevos datos para tareas similares, sirviendo como punto de partida para adaptaciones rápidas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no hay resultados de evaluación en robot real.

## Requisitos de hardware

- **VRAM estimada**: no disponible en la documentación. Dado el tamaño de pesos (0.9 GB en safetensors) y 450M parámetros, es plausible que quepa en GPUs con 4-8 GB de VRAM, pero no se confirma.
- **GPU recomendadas**: no se especifica. SmolVLA está diseñado para hardware de consumo, por lo que se espera compatibilidad con GPUs como RTX 3060/4060 o superiores.
- **Consumer GPU**: sí, según el paper y el blog de Hugging Face, SmolVLA puede ejecutarse en hardware consumer.
- **Opciones de despliegue**: LeRobot (rollout) es el método principal. No se menciona compatibilidad con vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje generativo.
- **Latencia y throughput**: no disponible.

## Comparativa con modelos similares

No se dispone de datos comparativos con otros modelos en la información proporcionada. A modo de referencia general, SmolVLA (450M parámetros) es significativamente más pequeño que OpenVLA (7B parámetros), lo que le permite ejecutarse en hardware más accesible, pero su rendimiento en tareas complejas aún no ha sido publicado. No se dispone de información para comparar directamente este ajuste fino con otros.

## Limitaciones y advertencias

- **Sesgos y alucinaciones**: al ser un modelo de control, puede generar acciones erróneas si la entrada visual no coincide con los patrones de entrenamiento. El dataset de solo 10 episodios limita la generalización.
- **Dependencia del dataset**: la tarea está específicamente definida como "Load erasers into container"; el modelo no funcionará fuera de ese contexto sin reentrenamiento.
- **Sin evaluación**: no hay resultados de éxito en robot real, lo que impide conocer su fiabilidad en producción.
- **Limitaciones de contexto**: la ventana de contexto está restringida a las imágenes de 3 cámaras y el estado, no soporta instrucciones de lenguaje adicionales.
- **Restricciones de licencia**: Apache 2.0 permite uso comercial, pero se debe atribuir y mantener la licencia en redistribuciones.
- **Dependencia del hardware**: aunque diseñado para consumer GPUs, no se especifican requisitos mínimos exactos, y el despliegue requiere el entorno LeRobot.

## Enlaces

- [Repositorio Hugging Face del modelo](https://huggingface.co/AndreGaio/smolvla_packing_v2)
- [Modelo base lerobot/smolvla_base](https://huggingface.co/lerobot/smolvla_base)
- [Paper SmolVLA (arXiv:2506.01844)](https://arxiv.org/abs/2506.01844)
- [Blog oficial de Hugging Face sobre SmolVLA](https://huggingface.co/blog/smolvla)
- [Web del proyecto SmolVLA](https://smolvla.net/index_en)
- [Dataset de entrenamiento](https://huggingface.co/datasets/AndreGaio/test-packing_3cam_20260823_140000)
- [LeRobot (framework)](https://github.com/huggingface/lerobot)
