# birbirll/g1-inspire-nut-in-box-n16-rel

## Resumen

El modelo `birbirll/g1-inspire-nut-in-box-n16-rel` es un ajuste fino (fine-tune) del modelo base `nvidia/GR00T-N1.6-3B`, desarrollado por el usuario `birbirll` (Peiyu Song). Se trata de un modelo de visión-lenguaje-acción (VLA) diseñado específicamente para controlar un robot humanoide Unitree G1 equipado con manos Inspire, ejecutando la tarea de "coger las pinzas y colocar la tuerca en la caja" (nut in box).

El modelo se entrena sobre un dataset de 29 episodios de éxito (~58.000 fotogramas a 60 fps) y utiliza una arquitectura basada en el modelo fundacional GR00T N1.6 de NVIDIA, que destaca por su capacidad de razonamiento multimodal y control de robots humanoides. La relevancia de este modelo reside en su especialización para una tarea de manipulación bimanual con control fino de manos, lo que demuestra la viabilidad de adaptar modelos fundacionales de robótica a tareas específicas con pocos datos.

El modelo tiene 3.286.610.368 parámetros, un contexto de 30 pasos de horizonte (horizon 30) y está disponible bajo licencia Apache 2.0. La arquitectura es de tipo transformer VLA, con un diseño de acciones relativas que requiere decodificación absoluta durante el despliegue.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer VLA (basado en NVIDIA GR00T N1.6) |
| Parámetros totales | 3.286.610.368 |
| Parámetros activos | no disponible (no se especifica si es MoE) |
| Longitud de contexto | 30 fotogramas (horizon) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura GR00T N1.6 de NVIDIA, que es un modelo de visión-lenguaje-acción (VLA) diseñado para controlar robots humanoides. El ajuste fino se realizó sobre el checkpoint `nvidia/GR00T-N1.6-3B` con un dataset convertido al formato LeRobot v2.1 y filtrado por éxito (success-gated), compuesto por 29 episodios de la tarea "nut in box" con un total de ~58.000 fotogramas a 60 fps.

El entrenamiento se llevó a cabo durante 10.000 pasos con un batch efectivo de 256 en precisión bf16, utilizando una única GPU B200. La pérdida final de entrenamiento fue de 0.040. La entrada incluye tres cámaras: una cámara frontal (1280x720) y dos cámaras ojo de pez en las muñecas (1920x1080). El estado del robot es de 17 dimensiones (cintura 3 + brazo izquierdo 7 + brazo derecho 7). La acción se define como un contrato de 27 dimensiones que incluye los brazos (14), los registros de la mano derecha Inspire (6), la altura de la base, la velocidad lineal en XY, la velocidad de guiñada (4) y la cintura (3). El modo de acción es relativo (`use_relative_action=true`), con un horizonte de 30 pasos.

## Capacidades

- **Manipulación bimanual**: el modelo controla los dos brazos del Unitree G1 con precisión, incluyendo el movimiento de las manos Inspire para agarrar objetos pequeños.
- **Control de cintura**: incluye acciones de cintura (3 dimensiones) para adaptar la postura del robot durante la tarea.
- **Navegación básica**: controla la altura de la base, la velocidad lineal en el plano XY y la velocidad de guiñada, lo que permite al robot desplazarse y orientarse.
- **Integración con múltiples cámaras**: procesa simultáneamente imágenes de la cámara frontal y dos cámaras de muñeca, lo que proporciona información visual desde distintas perspectivas.
- **Acción relativa**: el modelo genera acciones relativas al estado actual, lo que facilita la transferencia a entornos reales.
- **Aprendizaje de tareas específicas**: optimizado para la tarea "coger pinzas y poner tuerca en caja", mostrando una alta correlación en las predicciones de acciones (corr 1.00 para brazos y cintura).

## Casos de uso

- **Manipulación de objetos pequeños en líneas de montaje**: el modelo puede integrarse en sistemas robóticos para ensamblar piezas pequeñas, como tuercas, en entornos industriales controlados. Su alta precisión en el agarre y la colocación lo hace adecuado para tareas repetitivas.
- **Teleoperación asistida**: el modelo puede utilizarse para generar acciones autónomas en un robot G1, reduciendo la carga cognitiva del operador humano en tareas de pick-and-place complejas.
- **Investigación en robótica**: sirve como punto de partida para experimentos sobre aprendizaje de destrezas de manipulación con datos limitados, gracias a su base GR00T N1.6 y a la disponibilidad del código de entrenamiento.
- **Automatización de laboratorios**: puede implementarse en entornos de laboratorio para realizar tareas de preparación de muestras o manejo de instrumentos pequeños, donde se requiere precisión.
- **Desarrollo de nuevas tareas**: al estar basado en GR00T N1.6, los investigadores pueden usar este modelo como inicialización para entrenar tareas similares de manipulación con menos datos y tiempo de entrenamiento.
- **Evaluación de controladores**: el modelo puede usarse en entornos simulados (como IsaacLab) para probar políticas de control y algoritmos de aprendizaje por refuerzo antes de desplegarlos en el hardware real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El modelo se evalúa mediante pruebas de bucle abierto (open-loop gate) con 3 episodios y 18 fotogramas de prueba, donde se obtienen los siguientes resultados:

| Métrica | Valor |
|---|---|
| Correlación de acciones de brazos | 1.00 |
| RMS error de brazos | 0.026 rad |
| Correlación de cintura | 1.00 |
| Correlación de manos | 1.00 |
| RMS error de manos | ~12 registros (escala 0-1000) |

Estos valores indican una alta fidelidad en la reproducción de las acciones de entrenamiento, pero no hay datos comparativos con otros modelos.

## Requisitos de hardware

- **VRAM estimada para inferencia**: el modelo tiene ~3.3B parámetros, por lo que en precisión bf16 requiere aproximadamente 6.6 GB de VRAM. Con cuantización (si se dispone) podría reducirse a ~2-3 GB.
- **GPU recomendadas**: para inferencia en tiempo real, una GPU de gama media como una RTX 3090 o RTX 4090 (24 GB VRAM) es suficiente. Para entrenamiento o ajuste fino, se recomienda una GPU profesional como A100 (80 GB) o B200 (como la usada en el entrenamiento).
- **Compatibilidad con GPUs de consumo**: sí, el modelo cabe en GPUs de consumo con 8 GB o más de VRAM, como RTX 3070/4060, pero con posibles limitaciones de latencia.
- **Opciones de despliegue**: puede desplegarse con vLLM, TGI, o llama.cpp (si se convierte a GGUF), así como en el framework de NVIDIA (Isaac Lab) para simulación.
- **Latencia y throughput**: no se dispone de datos medidos; se estima que en una RTX 4090 la inferencia de un paso de acción (30 frames) puede estar en el orden de 50-100 ms, dependiendo del tamaño de las imágenes.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (VLA para Unitree G1). La información proporcionada menciona que hay "runs hermanos" (un brazo con acción absoluta y un brazo con ajuste visual) y un modelo `pi0.5` en entrenamiento, pero no se ofrecen datos públicos de rendimiento para comparar. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- **Sobreajuste a la tarea específica**: el modelo está entrenado exclusivamente para la tarea "nut in box" con el hardware concreto (Unitree G1 + manos Inspire). No se espera que generalice a otras tareas u otros robots sin un ajuste adicional.
- **Riesgo de alucinación**: como modelo de acción, puede generar acciones incorrectas si la entrada visual o el estado del robot son atípicos; no se ha evaluado su comportamiento fuera del dominio de entrenamiento.
- **Dependencia de la calibración**: la precisión de las acciones depende de la calibración de las cámaras y del sistema de control del robot. Un cambio en la configuración puede degradar el rendimiento.
- **Licencia**: Apache 2.0 permite uso comercial, pero el modelo base GR00T N1.6 de NVIDIA puede tener restricciones adicionales; se recomienda revisar la licencia del modelo base.
- **Sin datos de seguridad**: no se han proporcionado evaluaciones sobre sesgos, riesgos de seguridad física o comportamiento en entornos no controlados.
- **Solo bucle abierto**: el modelo fue evaluado en bucle abierto (open-loop), lo que significa que no se ha probado en un sistema de control en tiempo real con feedback del entorno.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/birbirll/g1-inspire-nut-in-box-n16-rel)
- [Perfil del autor en Hugging Face](https://huggingface.co/birbirll/models)
- [Página de investigación de GR00T N1.6 en NVIDIA](https://research.nvidia.com/labs/gear/gr00t-n1_6/)
- [Página del robot Unitree G1](https://www.unitree.com/g1/)
- [Repositorio de RL Lab de Unitree (para entornos de simulación)](https://github.com/unitreerobotics/unitree_rl_lab)
