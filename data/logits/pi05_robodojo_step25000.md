# logits/pi05_robodojo_step25000

## Resumen

El modelo `logits/pi05_robodojo_step25000` es un checkpoint de un modelo de visión-lenguaje-acción (VLA) basado en la arquitectura π₀.₅ (Pi0.5) de Physical Intelligence, entrenado como baseline sobre el benchmark RoboDojo y exportado en el paso 25000. Lo publica el usuario `logits` en HuggingFace bajo la librería LeRobot, con un total de 4.933.375.760 parámetros (aproximadamente 4,93 mil millones). Este modelo está diseñado para tareas de manipulación robótica, tanto en simulación como en el mundo real, y su relevancia radica en servir como punto de referencia para evaluar el rendimiento de políticas generalistas en el benchmark RoboDojo, que incluye 42 tareas simuladas y 18 tareas reales sobre tres plataformas robóticas.

Al ser un VLA, el modelo integra percepción visual, comprensión de instrucciones en lenguaje natural y generación de acciones de control, lo que le permite ejecutar tareas de manipulación de forma end-to-end. La implementación en LeRobot está adaptada del repositorio OpenPI de Physical Intelligence, y este checkpoint concreto representa una baseline de FlashVLA, una variante optimizada para el entrenamiento con el framework LeRobot. Aunque no se especifican detalles sobre el contexto, la licencia o los idiomas soportados, su naturaleza robótica implica que las instrucciones se procesan en inglés u otros idiomas según el dataset de entrenamiento, aunque esta información no está disponible en la ficha pública.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) basada en π₀.₅ (Pi0.5) |
| Parametros totales | 4.933.375.760 |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repo contiene safetensors, sin cuantizaciones publicadas) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura π₀.₅, una evolución de π₀ desarrollada por Physical Intelligence para abordar la generalización en entornos abiertos. π₀.₅ es un modelo de visión-lenguaje-acción que combina un backbone de visión-lenguaje preentrenado con un cabezal de acción basado en *flow matching*, lo que permite generar trayectorias de control continuas. El entrenamiento de π₀.₅ emplea co-entrenamiento sobre datos heterogéneos de múltiples robots, combinando datos de manipulación con datos web para mejorar la generalización semántica y de comportamiento. En este caso, el checkpoint se ha entrenado específicamente sobre RoboDojo, un benchmark unificado de simulación y mundo real con 42 tareas simuladas y 18 reales en tres plataformas robóticas. No se dispone de información detallada sobre el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO. La exportación se realizó en el paso 25000, lo que sugiere un entrenamiento intermedio, no necesariamente convergido.

## Capacidades

- Control robótico end-to-end: genera acciones de control directamente a partir de observaciones visuales e instrucciones en lenguaje natural.
- Manipulación generalista: diseñado para tareas de manipulación en entornos variados, tanto simulados como reales, gracias al co-entrenamiento sobre datos heterogéneos.
- Comprensión de instrucciones multimodales: integra visión y lenguaje para interpretar comandos complejos y contextos visuales.
- Ejecución de tareas de largo horizonte: el modelo base π₀.₅ está orientado a tareas que requieren planificación y ejecución secuencial, como limpiar una cocina o un dormitorio.
- Adaptación a múltiples plataformas robóticas: al entrenarse sobre RoboDojo, que cubre tres embodiments distintos, el modelo puede transferir conocimiento entre diferentes morfologías de robot.
- Integración con LeRobot: compatible con el ecosistema de LeRobot para entrenamiento, evaluación y despliegue en robótica.

## Casos de uso

- Evaluación de políticas en RoboDojo: el checkpoint sirve como baseline para comparar el rendimiento de otros modelos VLA en las 42 tareas simuladas y 18 reales del benchmark, permitiendo medir progreso en generalización.
- Investigación en manipulación robótica: investigadores pueden usar este modelo como punto de partida para estudiar técnicas de fine-tuning, adaptación a dominios específicos o métodos de regularización en VLA.
- Desarrollo de asistentes robóticos domésticos: gracias a su capacidad de generalización, el modelo puede adaptarse a tareas de limpieza, organización o recogida de objetos en entornos domésticos, aunque requiere fine-tuning adicional para cada escenario concreto.
- Control de brazos manipuladores en simulación: en entornos como MuJoCo o Isaac Sim, el modelo puede ejecutar tareas de pick-and-place, apilado o ensamblaje, sirviendo como controlador de bajo nivel.
- Transferencia sim-to-real: al estar entrenado en RoboDojo, que incluye tareas reales, el modelo puede utilizarse para estudiar la brecha entre simulación y realidad, y para desarrollar estrategias de adaptación.
- Benchmarking de hardware robótico: empresas y laboratorios pueden emplear este modelo para validar el rendimiento de sus plataformas robóticas en tareas estandarizadas, comparando resultados con otros baselines.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo se presenta como un baseline de FlashVLA sobre RoboDojo, pero no se incluyen métricas numéricas (éxito en tareas, precisión, etc.) en la model card ni en los resultados de búsqueda. Para obtener datos de rendimiento, sería necesario ejecutar el modelo en el benchmark RoboDojo o consultar publicaciones posteriores que utilicen este checkpoint.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible oficialmente. Con 4.933.375.760 parámetros, una estimación razonable en FP16 sería de aproximadamente 9,9 GB solo para los pesos, más overhead de activaciones y memoria del runtime, lo que sugiere un mínimo de 16 GB de VRAM para inferencia básica. Sin embargo, este dato no está confirmado por el autor.
- GPU recomendadas: no se especifican. Para modelos de este tamaño, GPUs como RTX 4090 (24 GB), A100 (40/80 GB) o H100 (80 GB) serían adecuadas, dependiendo de la precisión y el batch size.
- Compatibilidad con GPUs de consumo: probablemente sí en RTX 3090/4090 con cuantización, pero no hay cuantizaciones publicadas para este checkpoint.
- Opciones de despliegue: al ser un modelo de LeRobot, se puede desplegar con el framework LeRobot, que soporta inferencia en PyTorch. También podría adaptarse a vLLM o TGI si se convierte a un formato compatible, aunque no hay evidencia de ello. Para uso en robótica, se requiere además un entorno de simulación o un robot físico.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos suficientes para una comparación cuantitativa. El modelo pertenece a la categoría de VLA para robótica, donde existen alternativas como π₀ (el predecesor, con 3,3 mil millones de parámetros según el paper original) y OpenVLA (7 mil millones de parámetros). Sin embargo, no se han publicado resultados de este checkpoint en los benchmarks estándar, por lo que no es posible comparar rendimiento. En cuanto a licencia, este modelo no tiene licencia especificada, mientras que π₀ y OpenVLA tienen licencias propias (aunque no se detallan aquí). La disponibilidad de este checkpoint es pública en HuggingFace, pero con 0 descargas y 0 likes, lo que sugiere un uso limitado o reciente.

## Limitaciones y advertencias

- Licencia no especificada: el uso comercial o de investigación puede estar sujeto a restricciones legales no declaradas. Se recomienda contactar al autor antes de utilizar el modelo en producción.
- Datos de entrenamiento no documentados: no se indica la procedencia exacta de los datos de RoboDojo utilizados, ni si se aplicaron filtros de sesgo o seguridad.
- Riesgo de alucinación en acciones: como todo modelo generativo, puede producir acciones no válidas o inseguras en entornos reales, especialmente si no se valida con un supervisor.
- Sesgos potenciales: al entrenarse sobre datos de RoboDojo, que pueden tener sesgos en la distribución de tareas o entornos, el modelo podría no generalizar bien a escenarios fuera de esa distribución.
- Contexto limitado: al no conocerse la longitud de contexto, no se puede garantizar el manejo de instrucciones muy largas o historiales extensos de interacción.
- Estado del checkpoint: al ser una exportación en el paso 25000, puede no estar completamente convergido, lo que afecta al rendimiento final.
- Sin cuantizaciones publicadas: para despliegue en hardware con poca memoria, sería necesario cuantizar el modelo, pero no hay versiones GGUF o similares disponibles.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/logits/pi05_robodojo_step25000
- Documentación de LeRobot sobre π₀.₅: https://huggingface.co/docs/lerobot/pi05
- Repositorio oficial de RoboDojo: https://github.com/robodojo-benchmark/RoboDojo
- Paper de π₀.₅ en arXiv: https://arxiv.org/abs/2504.16054
