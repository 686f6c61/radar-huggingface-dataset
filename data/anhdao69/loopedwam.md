# anhdao69/LoopedWAM

## Resumen

LoopedWAM (Looped World Action Models for Elastic Inference) es una familia de checkpoints de política robótica (world-action model) publicada por anhdao69 y desarrollada por un equipo académico encabezado por Anh Dao. El modelo resuelve el problema de generar acciones motrices continuas para manipulación robótica a partir de observaciones visuales e instrucciones en lenguaje natural, y se distribuye con variantes específicas para tres benchmarks de referencia: LIBERO, RoboTwin 2.0 y RoboCasa-GR1.

La innovación central es un "action core" compartido que se ejecuta de forma recurrente K_a veces por cada paso de denoising, con N pasos de denoising (por defecto K_a = 4 y N = 10). La variante LoopedWAM-E es un único checkpoint destilado del LoopedWAM equivalente que permite elegir en tiempo de inferencia cualquier combinación de K_a en {1, 2, 4} y N en {2, 5, 10}, lo que habilita un ajuste elástico del coste computacional sin reentrenar.

El modelo tiene 0,58B parámetros en FP32 y reutiliza el VAE y el codificador de texto T5 de Wan-AI/Wan2.1-T2V-1.3B, por lo que hereda parte de la pila generativa de vídeo de Wan. Se publica bajo licencia Apache 2.0 y el repositorio ocupa 16,8 GB, incluyendo pesos y estadísticas de normalización.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | World-action model con action core recurrente (looped) y denoising iterativo; VAE y T5 de Wan2.1-T2V-1.3B |
| Parametros totales | 0,58B (FP32) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos distribuidos en FP32) |
| Idiomas soportados | no disponible (instrucciones en lenguaje natural, idioma no especificado) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch (`policy.pt`), FP32; requiere `Wan2.1_VAE.pth` y `models_t5_umt5-xxl-enc-bf16.pth` |

## Arquitectura y entrenamiento

LoopedWAM es un modelo de acción para robótica que combina un experto de vídeo (world model) con un núcleo de acción compartido que se aplica de forma recurrente. En cada paso de denoising, el action core se ejecuta K_a veces (por defecto 4), y el proceso completo consta de N pasos de denoising (por defecto 10). Esta recurrencia introduce un sesgo inductivo de "looping" que aumenta la profundidad efectiva sin incrementar el número de parámetros, y permite ajustar el coste de inferencia variando K_a y N.

El modelo reutiliza el VAE (`Wan2.1_VAE.pth`) y el codificador de texto T5 (`models_t5_umt5-xxl-enc-bf16.pth`, `google/umt5-xxl`) de Wan2.1-T2V-1.3B para procesar observaciones visuales e instrucciones. La variante LoopedWAM-E se obtiene por destilación desde el LoopedWAM del mismo benchmark e incorpora el experto de vídeo del profesor, de modo que puede cargarse de forma autónoma y ejecutar cualquier K_a en {1, 2, 4} con cualquier N en {2, 5, 10} elegido en inferencia. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si se empleó RLHF o DPO.

## Capacidades

- Generación de acciones motrices continuas para manipulación robótica a partir de observaciones visuales e instrucciones en lenguaje natural.
- Modelado de mundo (world model) mediante un experto de vídeo que informa la política.
- Inferencia elástica: la variante LoopedWAM-E permite seleccionar K_a y N en tiempo de ejecución para equilibrar calidad y coste.
- Soporte para tres entornos de benchmark: LIBERO (4 suites), RoboTwin 2.0 (50 tareas) y RoboCasa-GR1 (24 tareas de tabletop).
- Normalización de acciones y propiocepción mediante `dataset_stats.json` incluido en cada checkpoint.
- No se documentan en la información disponible capacidades de tool calling, agentes multi-paso, multilingüismo, visión general, audio ni modo thinking.

## Casos de uso

- Manipulación robótica en entornos simulados LIBERO: el checkpoint `libero/LoopedWAM` permite evaluar políticas en las cuatro suites de LIBERO con el pipeline de `eval_libero.py`, útil para investigación comparativa en manipulación de largo horizonte.
- Benchmarking en RoboTwin 2.0: el checkpoint `robotwin50/LoopedWAM` cubre 50 tareas, adecuado para medir generalización entre tareas y para estudios de escalado de K_a y N.
- Manipulación bimanual en RoboCasa-GR1: el checkpoint `robocasa_gr1/LoopedWAM` aborda 24 tareas de tabletop, útil para evaluar políticas en escenarios domésticos con el robot GR-1.
- Despliegue con presupuesto computacional ajustado: LoopedWAM-E permite reducir a K_a = 1 y N = 2 en hardware limitado, o subir a K_a = 4 y N = 10 cuando hay más GPU disponibles, sin cambiar de checkpoint.
- Investigación en destilación de políticas: la relación profesor-alumno entre LoopedWAM y LoopedWAM-E sirve como caso de estudio para destilación de modelos de acción con inferencia elástica.
- Reproducción de experimentos académicos: los scripts de evaluación y entrenamiento del repositorio de GitHub permiten reproducir los resultados de los tres benchmarks y comparar con futuras propuestas.
- Integración en pipelines de investigación con Wan2.1: al reutilizar el VAE y el T5 de Wan2.1-T2V-1.3B, el modelo se integra en stacks existentes basados en esa familia generativa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente enumera los checkpoints por benchmark (LIBERO, RoboTwin 2.0, RoboCasa-GR1) sin reportar tasas de éxito ni comparaciones numéricas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; los 0,58B parámetros en FP32 suponen aproximadamente 2,3 GB solo para los pesos de la política, a lo que hay que sumar el VAE y el codificador T5 de Wan2.1-T2V-1.3B.
- GPU recomendadas: el ejemplo de la model card usa `--gpus 0,1,2,3`, lo que sugiere despliegue multi-GPU; no se especifican modelos concretos.
- ¿Cabe en GPU consumer? No confirmado; el tamaño de pesos de la política es compatible con GPUs consumer de gama alta, pero la pila completa (VAE + T5) puede requerir más memoria.
- Opciones de despliegue: scripts de evaluación del repositorio (`experiments/libero/eval_libero.py`) y código de entrenamiento en GitHub; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; dependen de K_a y N elegidos (por defecto K_a = 4, N = 10; en LoopedWAM-E puede bajarse a K_a = 1, N = 2).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Benchmarks | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LoopedWAM | 0,58B | no disponible | LIBERO, RoboTwin 2.0, RoboCasa-GR1 (sin métricas publicadas) | Apache 2.0 | Hugging Face + GitHub |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la información proporcionada de datos sobre modelos alternativos de la misma categoría (world-action models para manipulación robótica) que permitan una comparación cuantitativa.

## Limitaciones y advertencias

- No se han publicado métricas de rendimiento (tasas de éxito, etc.) en la información disponible, lo que impide evaluar su calidad frente a alternativas.
- El modelo está especializado en manipulación robótica en los entornos LIBERO, RoboTwin 2.0 y RoboCasa-GR1; no se documenta su transferencia a robots o entornos reales.
- No se especifican los idiomas soportados para las instrucciones en lenguaje natural.
- No se detalla la composición del dataset de entrenamiento ni posibles sesgos presentes en los datos.
- Riesgo de alucinación y de acciones incorrectas en producción no cuantificado; la información disponible no incluye estudios de robustez.
- La licencia Apache 2.0 permite uso comercial, pero la dependencia de Wan2.1-T2V-1.3B (VAE y T5) obliga a revisar también las condiciones de ese modelo.
- El despliegue requiere cargar el VAE y el T5 de Wan2.1-T2V-1.3B además de `policy.pt`, lo que aumenta los requisitos de memoria y almacenamiento (16,8 GB de repositorio).
- La fecha de creación del repositorio (2026-11-18) y la referencia bibliográfica (2026) indican que se trata de un trabajo muy reciente con escasa validación externa.

## Enlaces

- Hugging Face: https://huggingface.co/anhdao69/LoopedWAM
- Repositorio de código: https://github.com/anhdao69/LoopedWAM
- Página del proyecto: https://anhdao69.github.io/LoopedWAM
- Wan2.1-T2V-1.3B (VAE y T5): https://huggingface.co/Wan-AI/Wan2.1-T2V-1.3B
- Codificador de texto `google/umt5-xxl`: https://huggingface.co/google/umt5-xxl
