# Onol/pi05-piper-take-cup-off-rack-right-lora

## Resumen

El modelo `Onol/pi05-piper-take-cup-off-rack-right-lora` es un adaptador LoRA (Low-Rank Adaptation) entrenado sobre el modelo base `physical-intelligence/pi0.5`, un VLA (Vision-Language-Action) de la familia π0.5 desarrollado por Physical Intelligence. Este adaptador está especializado en una tarea robótica concreta: coger una taza de una estantería y colocarla en un plato, utilizando el brazo derecho de un robot. El entrenamiento se realizó con el framework OpenPI en JAX, durante 5.000 pasos sobre un conjunto de datos de 8 episodios (4.492 fotogramas) con un prompt de lenguaje fijo en inglés.

La relevancia de este modelo radica en que demuestra cómo se puede adaptar un VLA generalista a una tarea específica mediante LoRA, reduciendo drásticamente el coste de entrenamiento y permitiendo personalización con pocos datos. El adaptador está diseñado para integrarse en el pipeline de OpenPI, con entradas RGB de dos cámaras (superior y muñeca derecha) y salidas de acción de 7 grados de libertad. El repositorio incluye los pesos del adaptador, estadísticas de normalización y un overlay de OpenPI necesario para la inferencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre π0.5 (VLA, transformer multimodal) |
| Parametros totales | no disponible (adaptador LoRA; el modelo base π0.5 no se especifica) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de robótica, no de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el prompt de entrenamiento está en inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | checkpoint de OpenPI (JAX), no se especifica el formato exacto |

## Arquitectura y entrenamiento

El adaptador se basa en π0.5, un modelo VLA que combina un codificador visual, un modelo de lenguaje y un decodificador de acciones. El LoRA se entrena sobre las proyecciones de atención del transformer, permitiendo una adaptación eficiente con un número reducido de parámetros. El entrenamiento se realizó con el framework OpenPI en JAX, utilizando el conjunto de datos `take_off_cup_short8_right7d_pi05_rgb224_v22`, que contiene 8 episodios y 4.492 fotogramas. La supervisión de acciones incluye objetivos de ángulo absoluto en radianes para las seis articulaciones del brazo, mientras que el gripper se entrena en modo absoluto (en metros, recortado a `[0, 0.08]`). Las acciones se representan como deltas relativos al estado actual para las articulaciones, con un horizonte de acción de 30 pasos. No se aplicaron técnicas de RLHF ni DPO; es un entrenamiento supervisado estándar.

## Capacidades

- Control de brazo robótico de 7 grados de libertad (6 articulaciones + gripper) para tareas de manipulación.
- Percepción visual multimodal: procesa dos flujos RGB (cámara superior y cámara de muñeca derecha), ambos redimensionados a 224×224 con letterboxing.
- Ejecución de una tarea específica de pick-and-place: coger una taza de una estantería y colocarla en un plato.
- Integración con el framework OpenPI para inferencia en robots reales o simulados.
- No soporta tool calling, generación de texto libre ni razonamiento multi-paso en el sentido de los LLM; su salida es una secuencia de acciones motoras.

## Casos de uso

- Automatización de tareas de pick-and-place en entornos controlados: el modelo puede integrarse en una celda robótica para manipular objetos pequeños (tazas, piezas) de una estantería a una posición objetivo, reduciendo la necesidad de programación manual.
- Investigación en aprendizaje por imitación: sirve como punto de partida para estudiar la eficiencia de LoRA en VLA, comparando el rendimiento con el ajuste fino completo del modelo base.
- Prototipado rápido de tareas robóticas: al requerir solo 8 episodios de demostración, permite validar nuevas tareas en pocas horas sin necesidad de grandes conjuntos de datos.
- Desarrollo de sistemas de manipulación con brazo derecho: el adaptador está específicamente entrenado para el brazo derecho, lo que lo hace útil en configuraciones de robot con dos brazos donde se necesita especialización por lado.
- Benchmarking de pipelines de inferencia: el repositorio incluye un informe de validación que comprueba la carga del checkpoint y la integridad del pipeline, útil para verificar instalaciones de OpenPI.
- Educación en robótica: puede utilizarse como ejemplo didáctico de cómo adaptar un VLA a una tarea concreta con LoRA, mostrando el flujo completo de entrenamiento e inferencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que el informe de validación incluido comprueba la carga del checkpoint y la integridad del pipeline de inferencia, pero no es una evaluación de éxito en robot real. No se proporcionan métricas como tasa de éxito, precisión de agarre ni comparaciones con otros modelos.

## Requisitos de hardware

- No se especifican requisitos de hardware en la información proporcionada.
- El repositorio ocupa 38.1 GB, lo que sugiere que incluye pesos del adaptador, estadísticas de normalización y el overlay de OpenPI, pero no se detalla la VRAM necesaria para inferencia.
- Dado que el modelo base π0.5 es un VLA de aproximadamente 3.5B parámetros (no confirmado en la fuente), se estima que se requiere una GPU con al menos 16 GB de VRAM para inferencia en FP16, y más si se usa el modelo completo sin cuantización.
- Para despliegue, se necesita el framework OpenPI (JAX) y un robot físico con las cámaras configuradas según el contrato de runtime (top y right wrist, 224×224).
- No se mencionan opciones de despliegue como vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje estándar.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la fuente proporcionada. El adaptador es específico para una tarea y un brazo concretos, y no se han publicado comparaciones con otros VLA como OpenVLA, RT-2 o el propio π0.5 sin adaptar. Se recomienda consultar la documentación de Physical Intelligence para obtener referencias de rendimiento relativo.

## Limitaciones y advertencias

- Entrenado con solo 8 episodios (4.492 fotogramas), lo que limita severamente la generalización a variaciones de la tarea, iluminación, posición de la cámara o tipo de taza.
- El prompt de lenguaje es fijo ("take the cup off the rack and place it on the plate"); no se soportan instrucciones variadas.
- La validación incluida no es una evaluación de éxito en robot real; solo comprueba la integridad del pipeline.
- El adaptador está especializado para el brazo derecho; no es aplicable directamente a configuraciones de brazo izquierdo sin reentrenamiento.
- Las acciones del gripper se recortan a `[0, 0.08]` metros, lo que puede no ser adecuado para objetos de tamaño diferente al de la taza de entrenamiento.
- No se proporcionan estadísticas de normalización ni el overlay de OpenPI en la model card; son necesarios para la inferencia y deben descargarse del repositorio.
- La licencia Apache-2.0 permite uso comercial, pero el modelo base π0.5 puede tener restricciones adicionales; se debe verificar la licencia del modelo base por separado.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Onol/pi05-piper-take-cup-off-rack-right-lora
- Modelo base (referencia): physical-intelligence/pi0.5 (no se proporciona URL directa en la información)
