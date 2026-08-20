# ornith-ai/Ornith-1.5-35B-A3B-MLX-4bit

## Resumen

Ornith-1.5-35B-A3B es un modelo de lenguaje de arquitectura mixture-of-experts (MoE) desarrollado por Ornith AI, presentado como parte de la familia Ornith-1.5. El modelo se construye sobre las bases de Qwen3.5 y Gemma4, a los que se aplica un proceso de continued pretraining, mid-training y post-training. Su característica más distintiva es un bucle de auto-mejora de extremo a extremo: el propio modelo genera nuevas tareas de entrenamiento, construye scaffolds específicos para cada tarea y produce rollouts de soluciones que se utilizan para mejorar la política mediante aprendizaje por refuerzo. Este enfoque busca superar la dependencia de tareas y harnesses diseñados manualmente.

La versión aquí documentada es una cuantización MLX de 4 bits, pensada para ejecutarse en hardware Apple Silicon. Según los archivos safetensors de esta versión, el número de parámetros totales es de 5.419.330.688, aunque el nombre del modelo indica 35B-A3B, lo que sugiere que el modelo original tiene 35 mil millones de parámetros totales y activa aproximadamente 3 mil millones por token. En benchmarks de coding y tareas agénticas, el modelo supera a alternativas de tamaño similar como Qwen3.6-35B-A3B y Gemma-4-31B, y se acerca a modelos mucho mayores como Qwen3.5-397B.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (mixture-of-experts) basada en Qwen3.5 (tag: qwen3_5_moe) |
| Parametros totales | 5.419.330.688 (segun safetensors de esta version MLX 4-bit; el nombre del modelo indica 35B-A3B) |
| Parametros activos | ~3B (segun model card) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4-bit (MLX) |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

Ornith-1.5-35B-A3B es un modelo MoE que activa aproximadamente 3 mil millones de parámetros por token, lo que lo hace computacionalmente eficiente en inferencia. La arquitectura se basa en Qwen3.5, con incorporación de elementos de Gemma4, y ha sido sometida a un proceso de entrenamiento en tres fases: continued pretraining, mid-training y post-training. La innovación principal reside en el bucle de auto-mejora: el modelo genera nuevas tareas de entrenamiento, construye scaffolds (harnesses) específicos para cada tarea y produce rollouts de soluciones que se utilizan como datos para aprendizaje por refuerzo. Este proceso se extiende sobre el framework de self-scaffolding introducido en Ornith-1.0, permitiendo que el modelo mejore continuamente sin depender de conjuntos de tareas fijos diseñados por humanos. No se han proporcionado detalles sobre el número de tokens de entrenamiento ni la composición del dataset.

## Capacidades

- Generación de texto y razonamiento general.
- Codificación de software, incluyendo resolución de issues en repositorios (SWE-bench).
- Tareas agénticas en terminal, como ejecución de comandos y navegación por sistemas de archivos (Terminal-Bench).
- Soporte de tool calling y uso de scaffolds para tareas complejas (implícito en los benchmarks agénticos).
- Capacidades multilingües limitadas: solo inglés declarado.
- No se mencionan capacidades de visión, audio u otras modalidades.

## Casos de uso

- Desarrollo de software asistido por IA: el modelo puede generar código, corregir errores y proponer parches en repositorios, como demuestra su rendimiento en SWE-bench Verified (79). Es adecuado para integrarse en entornos de desarrollo como IDE o pipelines de CI/CD.
- Agentes autónomos de terminal: con soporte para tareas agénticas, puede ejecutar comandos, gestionar archivos y realizar operaciones de sistema, útil para automatizar tareas de administración o despliegue.
- Resolución de issues en proyectos open source: su capacidad para entender contextos de repositorios y generar soluciones lo hace útil para triaje y resolución de bugs en proyectos colaborativos.
- Asistente de programación en tiempo real: puede actuar como copiloto en sesiones de programación, ofreciendo sugerencias contextuales y refactorizaciones.
- Automatización de tareas de línea de comandos: gracias a su rendimiento en Terminal-Bench, puede interpretar instrucciones en lenguaje natural y traducirlas a comandos de shell, útil para scripting y operaciones de sistema.
- Entrenamiento de modelos más pequeños: al ser un modelo eficiente (3B activos), puede usarse como profesor para destilar conocimiento en modelos más compactos para despliegue en edge.

## Benchmarks y rendimiento

La model card proporciona resultados de benchmarks comparativos. Se presentan los datos disponibles:

| Benchmark | Ornith-1.5-35B-A3B | Ornith-1.0-35B-A3B | Qwen3.6-35B-A3B | Gemma-4-31B | Muse-Glimmer-30B | Qwen3.5-397B |
|---|---|---|---|---|---|---|
| Terminal-Bench 2.1 (Terminus-2) | 67.8 | 64.2 | 52.5 | 42.1 | 51.7 | 53.5 |
| Terminal-Bench 2.1 (Claude Code) | 68.5 | 62.8 | 49.2 | - | - | 48.6 |
| SWE-bench Verified | 79 | 75.6 | 73.4 | 52 | 76 | 76.4 |
| SWE-bench Pro | (dato no disponible en la informacion proporcionada) | - | - | - | - | - |

No se han publicado resultados de benchmarks adicionales en la informacion disponible.

## Requisitos de hardware

- Al ser una versión MLX 4-bit, está diseñada para Apple Silicon (M1, M2, M3, M4 y sucesores).
- El tamaño del repositorio es de 19.5 GB, por lo que se recomienda al menos 24 GB de RAM unificada para cargar el modelo en memoria; 32 GB o más para operar con comodidad.
- No se indican requisitos de GPU NVIDIA ni CUDA; la librería MLX es específica de Apple.
- Opciones de despliegue: MLX (mlx-lm), posiblemente integrable en aplicaciones Swift o Python en macOS.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

La siguiente comparativa se basa en los benchmarks de la model card y en características generales:

| Modelo | Parametros totales | Parametros activos | Contexto | SWE-bench Verified | Terminal-Bench 2.1 (Terminus-2) | Licencia |
|---|---|---|---|---|---|---|
| Ornith-1.5-35B-A3B | 35B (nominal) | ~3B | no disponible | 79 | 67.8 | no disponible |
| Qwen3.6-35B-A3B | 35B | ~3B | no disponible | 73.4 | 52.5 | no disponible |
| Gemma-4-31B | 31B (denso) | 31B | no disponible | 52 | 42.1 | no disponible |
| Muse-Glimmer-30B | 30B (denso) | 30B | no disponible | 76 | 51.7 | no disponible |

Ornith-1.5-35B-A3B supera a Qwen3.6-35B-A3B en todos los benchmarks mostrados, y a Gemma-4-31B por un margen amplio. Frente a Muse-Glimmer-30B, gana en Terminal-Bench pero pierde ligeramente en SWE-bench Verified (79 vs 76, aunque el dato de Muse-Glimmer es 76, Ornith es 79, así que gana). Corrijo: Ornith 79, Muse 76, así que gana. En la tabla puse 76 para Muse, pero es 76, así que Ornith gana. Bien.

## Limitaciones y advertencias

- Licencia no disponible: no se especifican términos de uso, lo que impide determinar si es apto para uso comercial o requiere atribución.
- Solo soporta inglés; no se garantiza rendimiento en otros idiomas.
- La versión MLX 4-bit introduce pérdida de precisión respecto al modelo original en FP16/BF16, lo que puede afectar a tareas que requieren alta exactitud numérica.
- No se han publicado detalles sobre sesgos, alucinaciones o comportamientos no deseados.
- El número de parámetros totales en esta versión cuantizada (5.4B) difiere del anunciado (35B), lo que sugiere que podría tratarse de una versión podada o con una estructura de pesos distinta; se recomienda verificar la integridad del modelo antes de usarlo en producción.
- No hay información sobre la longitud de contexto soportada, lo que limita su uso en tareas que requieren ventanas largas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B-MLX-4bit
- Colección Ornith-1.5: https://huggingface.co/collections/ornith-ai/ornith-15
- Blog de Ornith-1.5: https://ornith.ai/ornith_1_5.html
- Perfil en BenchLM.ai: https://benchlm.ai/models/ornith-1-5-35b-a3b
- Guía de Ornith AI: https://ornith.online/
