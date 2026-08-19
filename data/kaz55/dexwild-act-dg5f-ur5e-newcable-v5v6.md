# Kaz55/dexwild-act-dg5f-ur5e-newcable-v5v6

## Resumen

El modelo `dexwild-act-dg5f-ur5e-newcable-v5v6` es un checkpoint de un Action Chunking Transformer (ACT) desarrollado por el usuario Kaz55, entrenado sobre el dataset `bluecablespeedtorque` del proyecto DexWild. Está diseñado para controlar una mano robótica de cinco dedos DG-5F montada en un brazo UR5e, con el objetivo de realizar tareas de inserción de cables. El modelo aprende una política de control a partir de observaciones visuales (cuatro cámaras RGB) y proprioceptivas, generando secuencias de acciones articulares (chunks de 90 pasos) en espacio de articulaciones absolutas.

Se trata de un modelo de aprendizaje por imitación (behavior cloning) específico para robótica, no un modelo de lenguaje. Su relevancia radica en demostrar la aplicación de arquitecturas transformer a problemas de manipulación diestra con realimentación visual. El repositorio contiene el checkpoint final (200 000 pasos de entrenamiento), los archivos de configuración del agente y del experimento, y los estadísticos de normalización necesarios para la inferencia. No se dispone de información pública sobre el número total de parámetros, la licencia o los idiomas, ya que el modelo no procesa texto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Action Chunking Transformer (ACT) con backbone ViT-Base para vision |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de control robotico, no de texto) |
| Tipos de cuantizacion | no disponible (checkpoint en precision completa) |
| Idiomas soportados | no disponible (modelo no linguistico) |
| Licencia | no disponible |
| Formato de pesos | PyTorch `.pth` (checkpoint) + configs YAML y JSON |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura ACT (Action Chunking with Transformers), que combina un codificador visual basado en Vision Transformer (ViT-Base) para procesar las imágenes de las cuatro cámaras, y un decodificador transformer que genera secuencias de acciones (chunks) de longitud 90. La observación tiene 26 dimensiones (imágenes + propriocepción del robot) y la acción de salida también es de 26 dimensiones, correspondientes a posiciones absolutas de las articulaciones (`joint_abs`). El entrenamiento se realizó mediante clonación de comportamiento sobre demostraciones humanas del dataset `bluecablespeedtorque` de DexWild, con 200 000 pasos de optimización. No se menciona el uso de RLHF ni DPO, ya que es un pipeline de aprendizaje supervisado típico en robótica. La configuración del agente y del experimento se incluye en los archivos `agent_config.yaml` y `exp_config.yaml`, junto con los estadísticos de normalización en JSON.

## Capacidades

- Control de manipulación diestra: genera comandos de articulaciones para una mano DG-5F y un brazo UR5e.
- Tarea específica de inserción de cables: entrenado para manejar cables azules con cierta velocidad y par motor.
- Percepción visual multicámara: procesa simultáneamente imágenes de cuatro cámaras RGB.
- Generación de secuencias de acciones: emite chunks de 90 pasos de acción, lo que permite movimientos suaves y coordinados.
- No tiene capacidades de lenguaje natural, tool calling, ni razonamiento simbólico.

## Casos de uso

- Automatización de ensamblaje de conectores: el modelo puede integrarse en una celda robótica para insertar cables en conectores, reduciendo el tiempo de ciclo frente a métodos programados manualmente.
- Teleoperación asistida: el checkpoint puede usarse como política base para asistir a un operador humano en tareas de cableado de precisión, combinando comandos humanos con correcciones automáticas.
- Investigación en aprendizaje por imitación: sirve como referencia para comparar arquitecturas ACT con otros enfoques de control robótico en tareas de manipulación diestra.
- Desarrollo de sistemas de control robusto: al estar entrenado con datos de torque y velocidad, puede evaluarse su comportamiento ante perturbaciones físicas en entornos de laboratorio.
- Generación de datos sintéticos: el modelo puede usarse para expandir datasets de demostraciones generando trayectorias adicionales que luego se filtran o etiquetan.
- Benchmarking de hardware robótico: permite validar el rendimiento de la mano DG-5F y el brazo UR5e en tareas repetitivas de inserción, midiendo precisión y repetibilidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay métricas cuantitativas de éxito en la tarea, ni comparaciones con otros modelos en el repositorio o en la model card.

## Requisitos de hardware

- No se especifican requisitos oficiales. Dado que el modelo usa un backbone ViT-Base y genera acciones de 26 dimensiones, la inferencia es ligera en comparación con modelos de lenguaje grandes.
- Para inferencia en tiempo real (frecuencia de control típica de 10-30 Hz), se recomienda una GPU con al menos 8 GB de VRAM (por ejemplo, NVIDIA RTX 3060 o superior) para procesar las cuatro cámaras simultáneamente.
- Para entrenamiento desde cero, se necesitaría una GPU con 16-24 GB de VRAM (por ejemplo, RTX 3090, A5000) y un dataset de demostraciones suficiente.
- El despliegue puede hacerse con PyTorch estándar; no se mencionan integraciones con vLLM, llama.cpp u otros motores de inferencia, ya que no es un modelo de lenguaje.
- El checkpoint ocupa aproximadamente 5.2 GB en disco, incluyendo configuraciones y estadísticos.

## Comparativa con modelos similares

No disponible. No se han encontrado en la información proporcionada modelos comparables de la misma categoría (políticas robóticas para inserción de cables con ACT). Se podría mencionar que existen otros modelos de manipulación como RT-1 o RT-2 de Google, pero no se dispone de datos de rendimiento comparativos.

## Limitaciones y advertencias

- Modelo altamente específico: entrenado únicamente para la tarea `rdm_dg5f_joint_abs` con el dataset `bluecablespeedtorque`; no generaliza a otras tareas, objetos o configuraciones de robot sin reentrenamiento.
- Sin información sobre sesgos: al ser un modelo de control robótico, no aplican sesgos lingüísticos, pero podría heredar sesgos del dataset de demostraciones (por ejemplo, preferencia por ciertas velocidades o ángulos).
- Riesgo de alucinación en acciones: como cualquier modelo generativo, puede producir comandos de acción no válidos o físicamente imposibles si las observaciones están fuera de la distribución de entrenamiento.
- Licencia no especificada: no se indica si el uso comercial está permitido; se recomienda contactar al autor antes de utilizarlo en producción.
- Dependencia de calibración: requiere los estadísticos de normalización y la configuración exacta del agente para funcionar correctamente; cambios en la cámara o en la cinemática del robot invalidan el modelo.
- Sin soporte de contexto temporal largo: el chunk de 90 pasos limita el horizonte de planificación; tareas que requieran memoria a largo plazo no son adecuadas.

## Enlaces

- [HuggingFace - Kaz55/dexwild-act-dg5f-ur5e-newcable-v5v6](https://huggingface.co/Kaz55/dexwild-act-dg5f-ur5e-newcable-v5v6)
