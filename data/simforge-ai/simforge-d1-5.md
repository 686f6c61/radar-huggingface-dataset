# SIMFORGE-AI/SIMFORGE-D1.5

## Resumen

SIMFORGE-D1.5 es un modelo de lenguaje desarrollado por SIMFORGE-AI, una iniciativa vinculada al ecosistema SimForge orientado a la simulación de IA física para robótica y sistemas autónomos. Se trata de un fine-tuning del modelo base nvidia/Alpamayo-1.5-10B, con 7.214.634.610 parámetros totales, lo que lo sitúa en la gama de los 7B-10B. El modelo está etiquetado con el pipeline de robótica y su licencia es openmdw-1.1, una licencia de código abierto con condiciones específicas.

El modelo está diseñado para tareas relacionadas con conducción autónoma, robótica y destilación de conocimiento, según las etiquetas de HuggingFace. Su acceso es restringido (gated), lo que implica que los usuarios deben aceptar condiciones adicionales antes de poder descargarlo. Aunque no se han publicado benchmarks ni detalles de entrenamiento en la información disponible, su base en Alpamayo-1.5 sugiere capacidades de razonamiento y generación de texto propias de los modelos transformer modernos. La relevancia de este modelo radica en su especialización aparente para el dominio de la robótica y la simulación, un campo en crecimiento dentro de la IA aplicada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basado en nvidia/Alpamayo-1.5-10B) |
| Parametros totales | 7.214.634.610 |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo safetensors en el repo) |
| Idiomas soportados | en (inglés) |
| Licencia | openmdw-1.1 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura exacta no se detalla en la información proporcionada, pero al estar basado en nvidia/Alpamayo-1.5-10B, se asume una arquitectura transformer estándar con atención de múltiples cabezas, probablemente con capas de normalización pre- o post-atención típicas de los modelos recientes. El número de parámetros (7.2B) sugiere que se ha realizado una destilación o poda desde el modelo base de 10B, aunque no se confirma el método. Las etiquetas incluyen "distillation" y "autonomous-driving", lo que apunta a un entrenamiento orientado a tareas de conducción autónoma y robótica, posiblemente con datos sintéticos generados por la plataforma SimForge.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO. Tampoco se mencionan innovaciones técnicas como decodificación especulativa o atención lineal. El modelo se publica con la librería transformers, lo que facilita su integración en pipelines estándar de HuggingFace.

## Capacidades

- Generación de texto y razonamiento: al ser un fine-tuning de un modelo base de 10B, conserva capacidades generales de lenguaje, aunque no se han publicado evaluaciones específicas.
- Especialización en robótica y conducción autónoma: las etiquetas del modelo indican un enfoque en estos dominios, probablemente entrenado con datos de simulación.
- Destilación de conocimiento: la etiqueta "distillation" sugiere que el modelo ha sido destilado desde un modelo mayor, lo que podría implicar una inferencia más eficiente.
- Soporte de tool calling y agentes: no disponible en la información proporcionada.
- Capacidades multilingües: solo se declara inglés (en).
- Modo de pensamiento o visión: no disponible.

## Casos de uso

- Simulación de entornos para entrenamiento de agentes autónomos: el modelo puede generar descripciones de escenarios de tráfico o instrucciones de control para vehículos autónomos, aprovechando su entrenamiento en datos de simulación.
- Generación de datos sintéticos para robótica: integrado en pipelines de SimForge, podría producir anotaciones o guiones para simular interacciones robot-entorno.
- Control de diálogo en sistemas de asistencia a la conducción: dado su enfoque en autonomous-driving, podría usarse para interpretar comandos de voz o generar respuestas contextuales en vehículos.
- Destilación de modelos para despliegue en edge: al ser un modelo de 7B, puede servir como maestro o alumno en procesos de destilación para ejecutarse en hardware con recursos limitados.
- Investigación en IA física: útil para experimentos que requieran un modelo de lenguaje con conocimiento de dinámicas del mundo real, como planificación de trayectorias o razonamiento espacial.
- Validación de políticas de control en simuladores: el modelo puede generar descripciones de estados o acciones para verificar la coherencia de políticas de control en CARLA o Unreal Engine.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de datos de MMLU, HumanEval, GSM8K ni otras evaluaciones estándar. Tampoco se comparan con modelos similares.

## Requisitos de hardware

- VRAM estimada: para un modelo de 7.2B parámetros en precisión fp16, se necesitan aproximadamente 14.4 GB de VRAM (el tamaño del repo coincide con esto). Con cuantización a 8 bits, se reduciría a ~7.2 GB; a 4 bits, ~3.6 GB.
- GPU recomendadas: una RTX 4090 (24 GB) o A100 (40/80 GB) sería suficiente para fp16. Para cuantización 4 bits, una RTX 3060 (12 GB) o similar podría bastar.
- Si cabe en consumer GPU: sí, con cuantización 4 bits cabe en GPUs de gama media (8-12 GB). En fp16 requiere una GPU de 16 GB o más.
- Opciones de despliegue: al ser un modelo transformers, se puede servir con vLLM, TGI, o ejecutar con llama.cpp si se convierte a GGUF. También es compatible con Ollama si se exporta.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables específicos. Dado que se basa en Alpamayo-1.5-10B, se podría comparar con otros modelos de 7B-10B como Llama 3.1 8B, Mistral 7B o Qwen 2.5 7B, pero no hay datos de rendimiento para establecer una comparación objetiva. La licencia openmdw-1.1 es menos común que MIT o Apache 2.0, lo que puede limitar su uso comercial según los términos de esa licencia.

## Limitaciones y advertencias

- Acceso restringido: el modelo es gated, por lo que requiere aceptar condiciones en HuggingFace antes de su uso. Esto puede limitar su adopción.
- Idioma limitado: solo se declara inglés, lo que restringe su uso en aplicaciones multilingües.
- Sin benchmarks publicados: no hay evidencia de rendimiento en tareas estándar, lo que dificulta evaluar su calidad.
- Especialización incierta: aunque las etiquetas sugieren robótica y conducción autónoma, no se ha demostrado su eficacia en estas tareas.
- Licencia openmdw-1.1: es una licencia de código abierto con condiciones específicas que deben revisarse antes de un uso comercial. No es una licencia permisiva estándar.
- Riesgo de alucinación: como cualquier modelo de lenguaje, puede generar contenido falso o inconsistente, especialmente en dominios especializados si no se ha entrenado con datos suficientes.
- Fecha de creación futura: el modelo está fechado en 2026, lo que podría indicar un error o un lanzamiento planificado; se recomienda verificar la autenticidad.

## Enlaces

- HuggingFace: https://huggingface.co/SIMFORGE-AI/SIMFORGE-D1.5
- Sitio web de SimForge: https://simforge.ai/
- Sitio web alternativo: https://simforge.io/
- Repositorio GitHub experimental (no oficial): https://github.com/black-210/SimForge
- Repositorio GitHub de SimForge (herramienta de datos): https://github.com/sim-forge/forge
- Leaderboard de LLMs (referencia general): https://llm-stats.com/leaderboards/llm-leaderboard
