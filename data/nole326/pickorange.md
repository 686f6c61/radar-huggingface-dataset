# Nole326/PickOrange

## Resumen

PickOrange es un modelo de aprendizaje por imitación para robótica publicado por el usuario Nole326 en Hugging Face bajo el identificador `Nole326/PickOrange`. Se distribuye en formato safetensors con el pipeline `robotics` y las etiquetas `act`, `imitation-learning` y `pickorange`, lo que indica que se trata de una política de control entrenada con la arquitectura ACT (Action Chunking with Transformers) para una tarea concreta de recogida de naranjas. No es un modelo de lenguaje: es una política visomotora que mapea observaciones (imágenes de cámara y estado del robot) a acciones de control de bajo nivel.

El repositorio ocupa 0,6 GB y fue creado el 12 de noviembre de 2026, con una actualización posterior el mismo día. El acceso está restringido (gated): es necesario aceptar las condiciones en Hugging Face antes de poder descargar los pesos. No se especifican licencia, idiomas ni resultados de benchmarks en la información disponible.

Su relevancia es acotada: se trata de un modelo de nicho, orientado a un caso de uso robótico específico (manipulación de objetos tipo "pick and place" con naranjas), sin métricas publicadas ni documentación técnica asociada. Resulta útil como referencia para quienes trabajan con ACT en tareas de manipulación, pero no debe confundirse con un modelo de propósito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), según tag `act` |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo robótico, no lingüístico) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La etiqueta `act` apunta a la arquitectura Action Chunking with Transformers, un enfoque de aprendizaje por imitación que predice secuencias de acciones (chunks) a partir de observaciones visuales y propioceptivas, en lugar de una acción por paso. Este diseño reduce el error de acumulación y mejora la estabilidad en tareas de manipulación. El modelo se enmarca en el pipeline `robotics` de Hugging Face y se distribuye como política entrenada para una tarea concreta de recogida de naranjas (`pickorange`).

No se dispone de información sobre el número de parámetros, la composición del dataset de entrenamiento, el número de demostraciones, el tipo de robot empleado ni si se aplicaron técnicas de aumento de datos o regularización. Tampoco hay datos sobre el proceso de entrenamiento (epochs, learning rate, función de pérdida) ni sobre posibles innovaciones técnicas adicionales más allá del propio esquema ACT.

## Capacidades

- Control visomotor para tareas de manipulación robótica (pick and place).
- Aprendizaje por imitación: reproduce comportamientos a partir de demostraciones.
- Predicción de chunks de acciones para control continuo de bajo nivel.
- Procesamiento de observaciones visuales (cámaras) y estado del robot, según el esquema estándar de ACT.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-step en el sentido de los LLM.
- No tiene capacidades multilingües ni de generación de texto.
- No se documentan capacidades especiales adicionales (visión semántica, audio, thinking mode).

## Casos de uso

- Recogida automatizada de naranjas en entornos controlados: el modelo actúa como política de manipulación entrenada específicamente para esta tarea, adecuado para líneas de investigación en robótica agrícola.
- Prototipado de pipelines de aprendizaje por imitación: sirve como referencia para validar la integración de ACT en frameworks como LeRobot o ROS 2.
- Evaluación comparativa de políticas robóticas: útil para contrastar el rendimiento de ACT frente a otros esquemas (diffusion policy, VLA) en tareas de pick and place.
- Docencia y formación en robótica: ejemplo práctico de modelo entrenado con demostraciones para ilustrar el ciclo completo (recolección de datos, entrenamiento, despliegue).
- Investigación en manipulación de objetos deformables o de geometría irregular: las naranjas presentan variabilidad de forma y textura que permite estudiar la robustez de la política.
- Integración en simuladores (Isaac Sim, MuJoCo) para pruebas previas al despliegue físico, siempre que se respete el formato de observaciones esperado por el modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el tamaño del repositorio (0,6 GB) sugiere que los pesos caben holgadamente en GPUs de consumo, pero no se especifica la arquitectura exacta ni el número de parámetros.
- GPU recomendadas: no disponibles; para políticas ACT de tamaño típico, una RTX 3060 o superior suele ser suficiente, pero este dato no está confirmado para este modelo.
- Compatibilidad con GPU de consumo: probable por el tamaño del repo, no confirmado.
- Opciones de despliegue: no documentadas; habitualmente las políticas ACT se despliegan mediante LeRobot, ROS 2 o scripts de inferencia propios.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada modelos comparables de la misma categoría (políticas ACT para tareas específicas de pick and place) con datos verificables de parámetros, contexto o rendimiento.

## Limitaciones y advertencias

- Modelo de nicho: entrenado para una tarea muy concreta (recogida de naranjas); no es generalizable a otras tareas sin reentrenamiento.
- Sin licencia declarada: no se especifican condiciones de uso comercial; es imprescindible contactar con el autor antes de cualquier uso en producción.
- Acceso restringido (gated): requiere aceptar condiciones en Hugging Face, lo que puede limitar la reproducibilidad y la auditoría externa.
- Ausencia total de documentación técnica: no hay model card detallada, ni benchmarks, ni descripción del dataset, lo que dificulta evaluar su robustez y sus sesgos.
- Riesgo de sobreajuste al entorno de entrenamiento: al ser un modelo de imitación con un dataset presumiblemente pequeño, su comportamiento fuera de las condiciones de captura puede degradarse notablemente.
- Sin información sobre sesgos: no se puede evaluar el impacto de la variabilidad de iluminación, texturas o posiciones de las naranjas en el rendimiento.
- Fecha de creación futura (2026): conviene verificar la integridad y procedencia del repositorio antes de su uso.
- No apto para aplicaciones de seguridad crítica sin validación exhaustiva en el entorno objetivo.

## Enlaces

- Hugging Face: https://huggingface.co/Nole326/PickOrange
