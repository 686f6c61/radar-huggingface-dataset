# logits/pi05_robodojo_step30000

## Resumen

El modelo `logits/pi05_robodojo_step30000` es un checkpoint de una política de manipulación robótica basada en FlashVLA PI0.5, entrenado sobre el benchmark RoboDojo y exportado en el paso 30000 de entrenamiento. Lo publica el usuario `logits` en Hugging Face, con la librería `lerobot`, un framework de código abierto para políticas robóticas. El modelo está diseñado para tareas de manipulación generalista en entornos simulados y reales, integrando visión y lenguaje para generar acciones de control.

Con aproximadamente 4,93 mil millones de parámetros y un tamaño de repositorio de 19,7 GB, se trata de un modelo de gran escala para robótica, que adapta la arquitectura π0.5 de Physical Intelligence al ecosistema RoboDojo. Su relevancia radica en que forma parte de un esfuerzo por unificar benchmarks de simulación y mundo real para evaluar políticas robóticas generalistas, un paso clave hacia la automatización flexible en entornos no estructurados.

La información pública disponible es limitada: no se especifican licencia, idiomas ni detalles de entrenamiento más allá del punto de exportación. Sin embargo, su pertenencia a la familia FlashVLA PI0.5 y su integración con RoboDojo permiten inferir su propósito y capacidades esperadas dentro del contexto de la investigación en manipulación robótica.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FlashVLA PI0.5 (basada en π0.5 de Physical Intelligence) |
| Parametros totales | 4.933.375.760 (~4,93 B) |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin cuantizaciones publicadas) |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en FlashVLA PI0.5, una variante de la política π0.5 desarrollada por Physical Intelligence. π0.5 es un modelo de visión-lenguaje-acción (VLA) que combina un codificador visual preentrenado, un modelo de lenguaje y una cabeza de acción para generar comandos de control continuo. FlashVLA es una implementación optimizada que reduce la latencia de inferencia, lo que resulta crítico para aplicaciones robóticas en tiempo real. El checkpoint se entrenó sobre RoboDojo, un benchmark unificado de simulación y mundo real con 42 tareas de simulación y 18 tareas reales distribuidas en tres plataformas robóticas distintas.

Los detalles exactos del entrenamiento (número de tokens, composición del dataset, uso de RLHF o DPO) no están publicados en la información disponible. Dado que se trata de un checkpoint intermedio (paso 30000), es probable que el entrenamiento siguiera un esquema de aprendizaje supervisado a partir de demostraciones, habitual en políticas VLA. La integración con el stack OpenPI de XPolicyLab sugiere que el modelo sigue el flujo de entrenamiento y evaluación definido por RoboDojo, que es exclusivamente de evaluación en esta versión, proporcionando el cliente de simulación, las tareas y los artefactos de validación.

## Capacidades

- Generación de acciones de manipulación robótica a partir de observaciones visuales e instrucciones en lenguaje natural.
- Control de múltiples plataformas robóticas (tres embodiments distintos en RoboDojo).
- Ejecución de tareas de manipulación generalista en entornos simulados y reales, como recogida, colocación, apilado o ensamblaje.
- Procesamiento de secuencias de imágenes y texto para generar comandos de control continuo (posición, orientación, fuerza).
- Adaptación a diferentes configuraciones de cámara y espacios de trabajo gracias al codificador visual preentrenado.
- Inferencia optimizada mediante FlashVLA, orientada a reducir la latencia en lazo cerrado (real-time control).

## Casos de uso

- Automatización de tareas de pick-and-place en almacenes: el modelo puede controlar un brazo robótico para recoger objetos de contenedores desordenados y colocarlos en ubicaciones específicas, guiado por instrucciones textuales y visión. RoboDojo incluye tareas de este tipo con variaciones de iluminación y oclusión.
- Ensamblaje de componentes en líneas de producción: gracias a su capacidad para seguir instrucciones de alto nivel ("inserta el eje en la base"), puede realizar tareas de inserción y ajuste con tolerancias milimétricas.
- Manipulación de objetos deformables (doblado de tela, cableado): el modelo ha sido entrenado en tareas que requieren modelado de deformaciones, lo que lo hace adecuado para aplicaciones textiles o de cableado.
- Evaluación comparativa de políticas robóticas: al ser un checkpoint oficial de RoboDojo, sirve como baseline para que investigadores comparen sus propias políticas contra una referencia estandarizada en las 42 tareas de simulación y 18 reales.
- Investigación en aprendizaje por imitación: el modelo puede utilizarse como punto de partida para fine-tuning en tareas específicas, ya que su entrenamiento en RoboDojo proporciona una representación visual y de control generalista.
- Desarrollo de asistentes robóticos en entornos domésticos: combinado con un simulador, permite probar tareas como abrir cajones, recoger objetos de superficies o interactuar con electrodomésticos antes de desplegar en hardware real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El modelo está asociado al benchmark RoboDojo, que ofrece un leaderboard público, pero no se incluyen métricas específicas de este checkpoint en la documentación consultada. Se recomienda consultar el sitio web de RoboDojo para obtener resultados comparativos de políticas evaluadas en sus tareas.

## Requisitos de hardware

- VRAM estimada: con 4,93 mil millones de parámetros en precisión fp32, el modelo requiere aproximadamente 19,7 GB de memoria solo para los pesos. En fp16, la cantidad se reduce a unos 9,9 GB, y en cuantización int8 podría bajar a ~5 GB, aunque no se han publicado versiones cuantizadas.
- GPU recomendadas: para inferencia en fp16, una GPU con 16 GB de VRAM (p. ej., RTX 4080, RTX 4090, A100 40 GB) es suficiente. Para entrenamiento o fine-tuning, se recomienda una A100 80 GB o H100.
- En consumer GPU: sí, es factible en una RTX 4090 (24 GB) con pesos en fp16 o en una RTX 3090 (24 GB) si se aplica cuantización.
- Opciones de despliegue: al ser un modelo de robótica con formato safetensors y librería lerobot, el despliegue se realiza típicamente mediante los servidores de políticas de XPolicyLab o mediante scripts de inferencia en Python con PyTorch. No se menciona compatibilidad con vLLM, llama.cpp u Ollama, dado que no es un modelo de lenguaje generativo estándar.
- Latencia y throughput: no disponibles. FlashVLA está diseñada para reducir la latencia, pero no se proporcionan cifras concretas para este checkpoint.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa fiable con otros modelos de la misma categoría. Existen otros checkpoints de RoboDojo (por ejemplo, `logits/pi05_robodojo_step20000`, también de `logits`), que presumiblemente comparten arquitectura y entrenamiento pero en pasos diferentes. No se dispone de datos de rendimiento ni especificaciones detalladas de alternativas como DreamZero o A1 RoboDojo para realizar una comparación objetiva.

## Limitaciones y advertencias

- No se especifica la licencia, por lo que el uso comercial o académico puede estar sujeto a restricciones no declaradas. Se recomienda contactar al autor antes de utilizarlo en producción.
- El modelo es un checkpoint intermedio (paso 30000), no necesariamente el punto óptimo de entrenamiento. Puede presentar comportamientos subóptimos en tareas que requieran mayor convergencia.
- RoboDojo es un benchmark de evaluación; el modelo no ha sido validado en entornos reales fuera de los escenarios del benchmark, por lo que su generalización a otros robots o configuraciones es incierta.
- No se dispone de información sobre sesgos, alucinaciones o limitaciones de contexto, al no ser un modelo de lenguaje puro. Sin embargo, las políticas VLA pueden fallar ante distribuciones de datos diferentes a las del entrenamiento.
- El tamaño del modelo (~19,7 GB) implica requisitos de memoria considerables; sin cuantizaciones publicadas, su despliegue en hardware embebido o de bajo consumo no es viable.
- La integración con RoboDojo requiere el stack de XPolicyLab y el cliente de simulación, lo que añade dependencias y complejidad de configuración.

## Enlaces

- Repositorio del modelo: https://huggingface.co/logits/pi05_robodojo_step30000
- Checkpoint anterior (paso 20000): https://huggingface.co/logits/pi05_robodojo_step20000
- Sitio web de RoboDojo: https://robodojo-benchmark.com/
- Repositorio oficial de RoboDojo en GitHub: https://github.com/robodojo-benchmark/RoboDojo
- Documentación de integración de Pi_05 en XPolicyLab: https://github.com/XPolicyLab/XPolicyLab/blob/main/policy/Pi_05/README.md
- Búsqueda de modelos RoboDojo en Hugging Face: https://huggingface.co/models?search=RoboDojo
