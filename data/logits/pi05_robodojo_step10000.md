# logits/pi05_robodojo_step10000

## Resumen

El modelo `logits/pi05_robodojo_step10000` es un checkpoint de una política robótica de visión-lenguaje-acción (VLA) basada en FlashVLA PI0.5, entrenada sobre el benchmark RoboDojo y exportada en el paso 10.000. Ha sido publicado por el usuario `logits` en Hugging Face bajo la librería LeRobot, lo que permite su integración directa en pipelines de robótica con dicha herramienta. El modelo cuenta con aproximadamente 4.933 millones de parámetros y un tamaño de repositorio de 19,7 GB en formato safetensors.

RoboDojo es un benchmark unificado de simulación y mundo real para la evaluación de políticas de manipulación robótica generalista, con 42 tareas de simulación y 18 tareas reales distribuidas en tres plataformas robóticas. Este checkpoint se presenta como una baseline de FlashVLA PI0.5 adaptada a dicho benchmark, lo que lo hace relevante para investigadores que necesitan comparar políticas de manipulación en entornos estandarizados y reproducibles. Al ser un modelo intermedio (step 10.000), su utilidad principal es la evaluación y el análisis de la evolución del entrenamiento, más que el despliegue final en producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FlashVLA (Pi0.5) - Vision-Language-Action |
| Parametros totales | 4.933.375.760 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo safetensors) |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura FlashVLA PI0.5, una evolución de la política π0.5 desarrollada por Physical Intelligence, que combina visión, lenguaje y acción para el control robótico. La implementación en LeRobot está adaptada del repositorio OpenPI de Physical Intelligence. Según la model card, el modelo fue entrenado como baseline sobre el benchmark RoboDojo, que proporciona un entorno unificado de simulación y mundo real con 42 tareas de simulación y 18 tareas reales en tres robots distintos. El checkpoint se exportó en el paso 10.000 del entrenamiento, lo que indica que es una instantánea intermedia y no necesariamente el punto de convergencia final. No se dispone de información detallada sobre el dataset de entrenamiento, el número de tokens, ni sobre técnicas de alineación como RLHF o DPO.

## Capacidades

- Manipulación robótica generalista: el modelo está entrenado para ejecutar tareas de manipulación en entornos simulados y reales, cubriendo un amplio espectro de acciones (empujar, agarrar, apilar, insertar, etc.) según las tareas definidas en RoboDojo.
- Integración con visión y lenguaje: al ser un modelo VLA, procesa entradas visuales (imágenes de cámaras) e instrucciones en lenguaje natural para generar comandos de acción.
- Compatibilidad con LeRobot: al estar exportado en formato LeRobot, puede cargarse y ejecutarse con las herramientas estándar de esta librería, facilitando su uso en experimentos de robótica.
- Evaluación en benchmark estandarizado: diseñado para ser evaluado en el entorno RoboDojo, que ofrece un leaderboard público y métricas comparables entre políticas.
- No se especifican capacidades adicionales como tool calling, agentes o razonamiento multi-paso fuera del ámbito robótico.

## Casos de uso

- Evaluación de políticas robóticas en RoboDojo: el modelo puede ejecutarse en las 42 tareas de simulación y 18 tareas reales del benchmark para medir su rendimiento y compararlo con otras políticas en el leaderboard público.
- Investigación en manipulación generalista: sirve como baseline para estudiar la transferencia sim-to-real, la generalización a nuevas tareas y la robustez frente a variaciones de entorno.
- Desarrollo de controladores para robots: puede integrarse en un pipeline de control para robots manipuladores (por ejemplo, brazos robóticos) usando LeRobot, generando acciones a partir de observaciones visuales y comandos de lenguaje.
- Análisis de la dinámica de entrenamiento: al ser un checkpoint intermedio (step 10.000), permite estudiar cómo evoluciona la política durante el entrenamiento, identificar etapas de mejora o degradación, y seleccionar el mejor punto de guardado.
- Fine-tuning para tareas específicas: partiendo de este checkpoint, se puede continuar el entrenamiento en tareas concretas de manipulación, aprovechando el conocimiento previo adquirido en RoboDojo.
- Comparación de arquitecturas VLA: al ser una baseline de FlashVLA PI0.5, facilita la comparación con otras arquitecturas (por ejemplo, π0 original, OpenVLA, etc.) en el mismo entorno de evaluación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo no incluye métricas de rendimiento en tareas de RoboDojo ni comparaciones con otras políticas en la model card o en el repositorio.

## Requisitos de hardware

- No se han publicado requisitos de hardware específicos para este modelo.
- Dado el tamaño de 4.933 millones de parámetros y 19,7 GB de pesos en safetensors, se estima que la inferencia en precisión FP16 requeriría al menos 10-12 GB de VRAM, por lo que una GPU como la RTX 3090, RTX 4090 o A100 sería adecuada.
- Para GPUs con menos VRAM (por ejemplo, 8 GB), sería necesario aplicar cuantización (por ejemplo, a 8 bits o 4 bits), aunque no se proporcionan archivos cuantizados en el repositorio.
- El despliegue puede realizarse mediante LeRobot, que soporta la carga de modelos VLA, o mediante frameworks de inferencia como vLLM o TGI si se convierte el modelo a un formato compatible, aunque no hay documentación específica al respecto.
- No se dispone de datos de latencia o throughput.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa con otros modelos de la misma categoría. El modelo es una baseline de FlashVLA PI0.5, pero no se han publicado resultados comparativos con π0 original, OpenVLA u otras políticas VLA en el contexto de RoboDojo. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- Licencia no disponible: no se especifica la licencia del modelo, por lo que el uso comercial o la redistribución pueden estar sujetos a restricciones legales no documentadas. Se recomienda contactar con el autor antes de cualquier uso en producción.
- Checkpoint intermedio: al ser el paso 10.000 de entrenamiento, el rendimiento puede ser inferior al de un modelo completamente entrenado. No se garantiza que sea el mejor punto de guardado.
- Especialización en RoboDojo: el modelo está entrenado específicamente para las tareas de RoboDojo, por lo que su generalización a otros entornos o tareas fuera de este benchmark no está garantizada.
- Sin información sobre sesgos o alucinaciones: al ser un modelo de control robótico, no se han documentado sesgos lingüísticos o visuales, pero la ausencia de datos no implica su inexistencia.
- Dependencia de la implementación: al estar basado en LeRobot y OpenPI, su funcionamiento correcto depende de la compatibilidad con las versiones de estas librerías y del entorno de simulación de RoboDojo.
- Sin soporte de cuantización oficial: no se proporcionan versiones cuantizadas, lo que puede limitar su uso en hardware con poca memoria.

## Enlaces

- Hugging Face: https://huggingface.co/logits/pi05_robodojo_step10000
- Repositorio oficial de RoboDojo (GitHub): https://github.com/robodojo-benchmark/RoboDojo
- Sitio web de RoboDojo: https://robodojo-benchmark.com/
- Documentación de Pi_05 en XPolicyLab: https://github.com/XPolicyLab/XPolicyLab/blob/main/policy/Pi_05/README.md
- Modelo base pi05_base de LeRobot: https://huggingface.co/lerobot/pi05_base
- Documentación de la política π0.5 en LeRobot: https://huggingface.co/docs/lerobot/pi05
