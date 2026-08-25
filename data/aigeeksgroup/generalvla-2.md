# AIGeeksGroup/GeneralVLA-2

## Resumen

GeneralVLA-2 es un framework de planificación robótica desarrollado por AIGeeksGroup que combina reconstrucción de geometría 3D y memoria gestionada para mejorar la ejecución de tareas de manipulación. A diferencia de los modelos de visión-lenguaje-acción tradicionales que requieren entrenamiento específico, GeneralVLA-2 se presenta como un sistema *training-free* que integra componentes pre-entrenados (SAM, CLIP, GraspNet) con dos módulos novedosos: **GeoFuse-MV3D**, que reconstruye la geometría de objetos a partir de múltiples vistas calibradas, y **Governed KnowledgeBank**, que gestiona la recuperación de experiencias previas atendiendo a calidad, confianza, ciclo de vida, conflictos y geometría.

El modelo no introduce un checkpoint monolítico entrenado; el repositorio empaqueta los pesos de los componentes necesarios y ejemplos de reconstrucciones 3D en formato PLY. Su relevancia radica en que permite una planificación robótica generalizable sin necesidad de entrenamiento adicional, mejorando los resultados sobre la línea base MV-SAM3D en reconstrucción 3D y sobre ReasoningBank en tareas de software. La licencia Apache-2.0 se aplica a la configuración y documentación, mientras que los pesos de terceros conservan sus licencias originales.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Framework *training-free* compuesto por módulos pre-entrenados (SAM ViT-H, CLIP ViT-L/14, GraspNet) y módulos de reconstrucción 3D (GeoFuse-MV3D) y memoria (Governed KnowledgeBank) |
| Parámetros totales | No disponible (el repositorio contiene pesos de componentes, no un modelo único) |
| Parámetros activos | No disponible |
| Longitud de contexto | No disponible (no es un modelo de lenguaje puro; el contexto es visual y de secuencia de acciones) |
| Tipos de cuantización | No disponible |
| Idiomas soportados | Inglés (en), chino (zh) |
| Licencia | Apache-2.0 para configuración y documentación; los pesos de terceros mantienen sus licencias originales |
| Formato de pesos | PyTorch (.pth, .tar), archivos de tokenizer, reconstrucciones 3D en PLY |

## Arquitectura y entrenamiento

GeneralVLA-2 no se entrena como un modelo monolítico. Se compone de un pipeline que integra varios módulos:

- **GeoFuse-MV3D**: reconstruye la geometría 3D de un objeto a partir de observaciones multi-vista calibradas (RGB-D y poses de cámara). Utiliza segmentación (SAM) y codificación visual-lenguaje (CLIP) para generar una representación 3D conservadora, verificada por máscaras y que preserva la apariencia.
- **Governed KnowledgeBank**: es una memoria externa que recupera experiencias previas relevantes para la planificación, filtrando por calidad, confianza, ciclo de vida, conflicto y consistencia geométrica.
- **Planificación y ejecución**: el agente combina la evidencia 3D con el conocimiento recuperado para generar trayectorias de ejecución robótica.

No se han publicado detalles sobre el conjunto de datos de entrenamiento de los componentes base, ni sobre el proceso de entrenamiento de los módulos de reconstrucción o memoria. El sistema se evalúa en tareas de manipulación (RLBench), reconstrucción 3D (GSO-30) y agentes de software (Terminal-Bench 2.0, SWE-Bench Verified).

## Capacidades

- **Planificación de manipulación robótica**: genera trayectorias exitosas en tareas de RLBench sin entrenamiento específico.
- **Reconstrucción 3D de objetos**: produce nubes de puntos (Gaussians) a partir de múltiples vistas, mejorando métricas como CD, LPIPS, PSNR y SSIM sobre MV-SAM3D.
- **Memoria a largo plazo**: recupera experiencias previas con control de calidad y conflicto, mejorando la resolución de tareas en benchmarks de software.
- **Integración de visión y lenguaje**: usa CLIP para anclaje visual-lenguaje, soportando instrucciones en inglés y chino.
- **Sin entrenamiento adicional**: el framework se puede desplegar directamente con los componentes incluidos, sin ajuste fino.
- **Compatibilidad con pipelines de robótica**: incluye pesos de GraspNet para la etapa de agarre y SAM para segmentación.

## Casos de uso

- **Manipulación robótica en entornos desconocidos**: el sistema puede planificar agarres y trayectorias a partir de observaciones multi-vista de un objeto, sin necesidad de re-entrenamiento. Por ejemplo, una estación de trabajo que recibe un objeto nuevo y debe colocarlo en una posición específica.
- **Reconstrucción 3D para inspección industrial**: a partir de varias tomas RGB-D de una pieza, se genera un modelo 3D preciso que puede usarse para control de calidad o para planificar el agarre.
- **Agente de software con memoria**: el componente KnowledgeBank permite a un agente resolver tareas de programación (SWE-Bench) recuperando experiencias de commits anteriores y evitando pasos redundantes.
- **Robots de servicio con memoria de largo plazo**: el sistema puede recordar cómo manipular objetos que ya ha visto, mejorando la eficiencia en tareas repetitivas.
- **Evaluación de estrategias de planificación**: los investigadores pueden usar el framework para comparar el efecto de la reconstrucción 3D y la memoria gobernada en distintas tareas de manipulación.
- **Sistemas de teleoperación asistida**: el operador puede indicar la tarea en lenguaje natural (inglés o chino) y el sistema ejecuta la secuencia de acciones sobre el robot.

## Benchmarks y rendimiento

Los resultados reportados en la documentación oficial son los siguientes:

| Tarea | Métrica | Resultado | Comparación |
|---|---|---|---|
| GSO-30 | CD (Chamfer Distance) | Reducción del 2.20% | vs MV-SAM3D |
| GSO-30 | LPIPS | Reducción del 2.02% | vs MV-SAM3D |
| GSO-30 | PSNR | Aumento del 2.36% | vs MV-SAM3D |
| GSO-30 | SSIM | Aumento del 1.03% | vs MV-SAM3D |
| Terminal-Bench 2.0 | Tasa de éxito | +4.53% | vs ReasoningBank |
| SWE-Bench Verified | Tasa de resolución | +3.73% | vs ReasoningBank |
| SWE-Bench Verified | Pasos promedio | −5.65% | vs ReasoningBank |
| RLBench (14 tareas) | Trayectorias exitosas | 14/14 | Mejor en 10 tareas |

No se proporcionan resultados de benchmarks clásicos de modelos de lenguaje (MMLU, HumanEval, GSM8K) porque el modelo no está orientado a tareas de lenguaje general.

## Requisitos de hardware

- **VRAM estimada**: no se especifica oficialmente. Los componentes base (SAM ViT-H, CLIP ViT-L/14) requieren aproximadamente 6-8 GB de VRAM en conjunto para inferencia. El módulo de reconstrucción 3D puede incrementar el consumo, pero no se aportan cifras.
- **GPU recomendadas**: se asume que funciona en GPUs de gama alta (A100, RTX 3090, RTX 4090) para tiempos de inferencia razonables en robótica. No hay requisitos oficiales.
- **Espacio en disco**: el repositorio ocupa 4.3 GB, incluyendo pesos y reconstrucciones de ejemplo.
- **Opciones de despliegue**: no se mencionan herramientas específicas (vLLM, llama.cpp, etc.). Al ser un sistema PyTorch, se puede integrar con cualquier framework de inferencia de PyTorch. Para robótica, se espera ejecución en tiempo real con GPUs dedicadas.
- **Latencia y throughput**: no disponibles.

## Comparativa con modelos similares

No se dispone de información comparativa con otros modelos de robótica o VLA en la documentación proporcionada. Se puede indicar que no hay datos suficientes para una comparativa completa.

## Limitaciones y advertencias

- **No es un modelo monolítico**: la integración de componentes requiere que el usuario monte el sistema completo (código de GitHub) y gestione las dependencias de los componentes base.
- **Licencias de terceros**: los pesos de SAM, CLIP y GraspNet tienen sus propias licencias (probablemente no Apache-2.0), lo que puede restringir el uso comercial.
- **Dependencia de observaciones multi-vista**: el módulo GeoFuse-MV3D necesita al menos dos vistas calibradas del objeto; con una sola imagen el rendimiento puede degradarse.
- **Sin datos de sesgo o alucinación**: no se han publicado análisis de sesgos ni de posibles errores de percepción o planificación.
- **Idiomas limitados**: aunque el sistema soporta inglés y chino, no hay evidencia de otros idiomas.
- **Requisitos de hardware no documentados**: la ausencia de especificaciones de VRAM y GPU dificulta la planificación de despliegues en entornos reales.
- **Riesgo de fallo en entornos no vistos**: aunque se reporta éxito en 14 tareas RLBench, no se garantiza robustez en escenarios con gran variabilidad de objetos o condiciones de iluminación.

## Enlaces

- HuggingFace: https://huggingface.co/AIGeeksGroup/GeneralVLA-2
- Código (GitHub): https://github.com/AIGeeksGroup/GeneralVLA-2
- Página del proyecto: https://aigeeksgroup.github.io/GeneralVLA-2/
- Artículo (arXiv): https://arxiv.org/abs/2606.17480
