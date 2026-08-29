# logits/pi05_robodojo_step35000

## Resumen

El modelo `logits/pi05_robodojo_step35000` es un checkpoint de un modelo de robótica basado en FlashVLA PI0.5, entrenado sobre el benchmark RoboDojo y exportado en el paso 35000 de entrenamiento. Ha sido publicado por el usuario "logits" en Hugging Face bajo la librería LeRobot, especializada en políticas de manipulación robótica. El modelo cuenta con aproximadamente 4.933 millones de parámetros y un tamaño de repositorio de 19.7 GB, lo que sugiere una arquitectura de gran escala orientada a tareas de control y planificación de movimientos.

La relevancia de este modelo radica en su entrenamiento sobre RoboDojo, un benchmark unificado de simulación y mundo real para la evaluación de políticas generalistas de manipulación robótica, con 42 tareas de simulación y 18 tareas reales en tres plataformas robóticas distintas. Aunque la información pública es limitada, su existencia indica un esfuerzo por proporcionar modelos baseline reproducibles para la comunidad de robótica. No se dispone de detalles sobre la arquitectura interna, el contexto de entrada o las capacidades específicas más allá de su propósito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (basado en FlashVLA PI0.5, sin detalles publicados) |
| Parametros totales | 4.933.375.760 |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (según el repositorio) |

## Arquitectura y entrenamiento

La información disponible indica que el modelo es un "FlashVLA PI0.5 baseline" entrenado en RoboDojo. FlashVLA sugiere una arquitectura de visión-lenguaje-acción (VLA), que integra percepción visual, comprensión lingüística y generación de acciones para control robótico. Sin embargo, no se han publicado detalles técnicos sobre la arquitectura exacta, el número de capas, el mecanismo de atención o si emplea técnicas como mezcla de expertos (MoE) o atención lineal. Tampoco se especifica la composición del dataset de entrenamiento, el número de tokens procesados ni si se aplicaron técnicas de refinamiento como RLHF o DPO. El entrenamiento se realizó sobre el benchmark RoboDojo, que incluye tareas de simulación y reales, pero se desconoce la proporción exacta de datos utilizados.

## Capacidades

- Manipulación robótica generalista: el modelo está diseñado para tareas de manipulación en entornos simulados y reales, según el benchmark RoboDojo.
- Integración con LeRobot: al estar exportado en formato LeRobot, puede cargarse con la librería homónima para evaluación y despliegue en plataformas robóticas.
- Control de múltiples plataformas: RoboDojo cubre tres embodiments robóticos distintos, por lo que el modelo podría adaptarse a diferentes configuraciones de robot, aunque no se confirma su generalización.
- No se dispone de información sobre capacidades de generación de texto, razonamiento, código, tool calling o agentes, ya que el modelo está orientado exclusivamente a robótica.

## Casos de uso

- Evaluación de políticas robóticas en simulación: el modelo puede utilizarse como baseline en el benchmark RoboDojo para comparar el rendimiento de nuevas políticas de manipulación en las 42 tareas simuladas.
- Investigación en aprendizaje por imitación: al ser un checkpoint de entrenamiento, sirve como punto de partida para estudios sobre transferencia sim-to-real o fine-tuning en tareas específicas.
- Desarrollo de controladores para robots manipuladores: puede integrarse en pipelines de control para brazos robóticos, aunque se requiere validación en hardware real.
- Reproducción de experimentos: investigadores pueden descargar el modelo y reproducir los resultados reportados en el benchmark RoboDojo, facilitando la comparación entre métodos.
- Fine-tuning para tareas personalizadas: dado su tamaño (4.9B parámetros), es factible ajustarlo con datasets propios de demostraciones robóticas, aunque se necesitan recursos de cómputo considerables.
- Benchmarking de eficiencia de inferencia: el modelo puede usarse para medir latencia y throughput en diferentes GPUs, contribuyendo a la optimización de despliegue en robótica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El modelo está asociado al benchmark RoboDojo, pero no se proporcionan métricas concretas de éxito, precisión o comparación con otros modelos en la model card ni en los resultados de búsqueda web.

## Requisitos de hardware

- VRAM estimada: con 4.933 millones de parámetros y un tamaño de repo de 19.7 GB, la inferencia en precisión FP16 requeriría aproximadamente 10 GB de VRAM solo para los pesos, más overhead de activaciones. Se recomienda al menos 16 GB de VRAM para una ejecución cómoda.
- GPU recomendadas: tarjetas con 16 GB o más, como RTX 4090, A100 (40 GB), H100 (80 GB) o GPUs de datacenter equivalentes. Para fine-tuning se necesitarían GPUs con mayor memoria (A100 80GB o H100).
- Compatibilidad con consumer GPU: sí, una RTX 4090 (24 GB) podría ejecutar el modelo en FP16, aunque con limitaciones de batch size. Para cuantización a 8 bits o 4 bits, cabría en GPUs de 12-16 GB, pero no se dispone de archivos GGUF o cuantizados en el repositorio.
- Opciones de despliegue: al ser un modelo LeRobot, puede ejecutarse con la librería LeRobot. No se mencionan compatibilidades con vLLM, llama.cpp, Ollama o TGI, ya que no es un modelo de lenguaje estándar.
- Latencia y throughput: no disponibles. Dependerá de la GPU, la secuencia de entrada (imágenes, lenguaje, acciones) y la implementación.

## Comparativa con modelos similares

No se dispone de información suficiente para comparar este modelo con alternativas de la misma categoría. No se conocen otros modelos de robótica con características equivalentes (mismo tamaño, mismo benchmark) en la información proporcionada. Se recomienda consultar el leaderboard de RoboDojo para identificar modelos comparables.

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles. Al ser un modelo de robótica, los sesgos podrían manifestarse en comportamientos no deseados en tareas específicas, pero no se documentan.
- Riesgo de alucinación: en el contexto robótico, podría generar acciones incorrectas o inestables si se usa fuera de su dominio de entrenamiento. No se ha evaluado su robustez.
- Limitaciones de contexto o idioma: no se especifican idiomas soportados; probablemente el modelo procesa instrucciones en inglés, pero no se confirma.
- Restricciones de licencia: la licencia no está disponible, por lo que se desconoce si permite uso comercial o modificación. Se recomienda contactar al autor antes de usar en producción.
- Caveat para producción: al ser un checkpoint de entrenamiento (paso 35000), puede no estar completamente convergido. Se recomienda validar su rendimiento en el benchmark antes de desplegarlo en aplicaciones reales.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/logits/pi05_robodojo_step35000
- Repositorio oficial de RoboDojo: https://github.com/robodojo-benchmark/RoboDojo
- Sitio web de RoboDojo: https://robodojo-benchmark.com/
- Repositorio de scripts de evaluación RoboDojo (referencia): https://github.com/hhhyl567/goai-2026-robodojo-pi05/tree/main/scripts
