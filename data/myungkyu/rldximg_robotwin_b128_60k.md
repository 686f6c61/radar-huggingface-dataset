# Myungkyu/rldximg_robotwin_b128_60k

## Resumen

rldximg_robotwin_b128_60k es un checkpoint de ajuste fino del modelo RLDX-1-PT, desarrollado por el usuario Myungkyu sobre la base de RLWRLD. Se trata de un modelo de visión-lenguaje-acción (VLA) orientado a robótica manipulativa, entrenado como baseline "vanilla" para el leaderboard de RoboTwin 2.0 en su configuración co-train. El modelo parte de RLDX-1-PT y se ajusta con el dataset TianxingChen/RoboTwin2.0, compuesto por 50 tareas con 50 episodios demo_clean cada una, sobre el robot bimanual Aloha-AgileX en el formato oficial de LeRobot.

La relevancia del checkpoint es fundamentalmente metodológica: sirve como referencia reproducible para comparar variantes posteriores del proyecto RLDX-2 y otras aproximaciones sobre el mismo benchmark. No es un modelo de propósito general ni un asistente conversacional, sino un componente de control que traduce instrucciones en lenguaje natural más observaciones visuales y estado propioceptivo en comandos de articulaciones absolutos.

El modelo tiene 6.912.896.320 parámetros (aproximadamente 6,9 mil millones) según los pesos en safetensors, y el repositorio ocupa 165,9 GB, un tamaño que refleja la inclusión de checkpoints intermedios y múltiples estados. La arquitectura subyacente es RLDX-1-PT, con ventana de vídeo de 4 fotogramas y stride 2, tres vistas de cámara y horizonte de acción de 50 pasos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RLDX-1-PT (modelo visión-lenguaje-acción, vídeo longitud 4 / stride 2, tres vistas de cámara, horizonte de acción 50) |
| Parametros totales | 6.912.896.320 (~6,9 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors) |
| Idiomas soportados | no disponible (las instrucciones de tarea se proporcionan en lenguaje natural, idioma no especificado) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Modelo base | RLWRLD/RLDX-1-PT |
| Dataset de ajuste | TianxingChen/RoboTwin2.0 (50 tareas x 50 episodios demo_clean, Aloha-AgileX, export oficial LeRobot) |
| Entradas | Imágenes de cabeza + muñeca izquierda/derecha, estado articular de 14 dimensiones, instrucción de tarea |
| Salidas | Objetivos articulares absolutos de 14 dimensiones |
| Entrenamiento | Batch 128, 60.000 pasos, checkpoint final sin estado del optimizador |
| Checkpoints intermedios | step-15000, step-30000, step-45000 (subconjunto de inferencia) |

## Arquitectura y entrenamiento

El modelo se construye sobre RLDX-1-PT, un backbone de visión-lenguaje-acción que procesa secuencias de vídeo de 4 fotogramas con stride 2 y tres vistas de cámara simultáneas (cabeza y dos muñecas). La cabeza de acción predice un horizonte de 50 pasos de objetivos articulares absolutos de 14 dimensiones, condicionada por una instrucción de tarea en lenguaje natural y por el estado propioceptivo actual del robot. El ajuste fino introduce dos decisiones técnicas destacables: enmascaramiento de ruido por dimensión de relleno (action_noise_mask_dim=14) y dropout de estado con probabilidad 0,5, técnicas orientadas a mejorar la robustez frente a observaciones imperfectas y a evitar el sobreajuste al estado exacto de las demostraciones.

El entrenamiento se realizó con batch de 128 durante 60.000 pasos sobre el dataset RoboTwin 2.0 en configuración co-train, que combina 50 tareas con 50 episodios demo_clean cada una sobre el robot bimanual Aloha-AgileX en el export oficial de LeRobot. El código utilizado corresponde a RLWRLD/RLDX en la rama myungkyu/jitter-patch, commit 21f674b4. No se especifica en la información disponible el número total de tokens, la composición exacta del dataset más allá de lo indicado, ni si se aplicaron etapas de RLHF o DPO; dado el dominio robótico, es probable que el ajuste sea puramente supervisado por imitación, pero este extremo no está confirmado.

## Capacidades

- Control robótico bimanual: genera objetivos articulares absolutos de 14 dimensiones para el robot Aloha-AgileX a partir de instrucciones de tarea.
- Percepción multi-vista: procesa simultáneamente imágenes de cámara de cabeza y de ambas muñecas, integrando información egocéntrica y propioceptiva visual.
- Condicionamiento por lenguaje natural: acepta instrucciones de tarea textuales que especifican la habilidad a ejecutar.
- Predicción de horizonte largo: emite secuencias de acción de 50 pasos por inferencia, lo que reduce la frecuencia de replanificación.
- Fusión de estado propioceptivo: incorpora el estado articular de 14 dimensiones como entrada, con dropout durante el entrenamiento para robustez.
- Ejecución de tareas de manipulación del benchmark RoboTwin 2.0: las 50 tareas del conjunto de entrenamiento definen su ámbito de competencia.
- No se documentan capacidades de tool calling, razonamiento multi-paso simbólico, generación de código ni procesamiento de audio en la información disponible.

## Casos de uso

- Baseline reproducible para investigación en VLA: sirve como referencia fija contra la que comparar variantes del proyecto RLDX-2 y otras arquitecturas sobre el mismo conjunto de tareas y datos, garantizando comparaciones justas al compartir dataset, batch y número de pasos.
- Evaluación de técnicas de robustez: el enmascaramiento de ruido por dimensión y el dropout de estado permiten estudiar cómo afectan estas técnicas a la generalización en tareas de manipulación con observaciones ruidosas.
- Reentrenamiento sobre hardware propio: al estar construido sobre RLDX-1-PT y usar el formato LeRobot, puede adaptarse a otros robots bimanuales recogiendo demostraciones en el mismo esquema y ajustando el checkpoint.
- Estudio de co-entrenamiento multi-tarea: las 50 tareas del conjunto permiten analizar transferencia entre habilidades y el efecto del co-train en el rendimiento por tarea.
- Análisis de curvas de aprendizaje: los checkpoints intermedios en los pasos 15.000, 30.000 y 45.000 permiten trazar la evolución del rendimiento y detectar saturación o sobreajuste antes del checkpoint final.
- Prototipado de pipelines de imitación en laboratorio: integrable en flujos de evaluación con el simulador o el entorno real de RoboTwin para validar políticas antes de desplegar variantes más costosas.
- Docencia y divulgación: ejemplo completo y abierto de un pipeline VLA con datos, código, checkpoints intermedios y sumas de verificación para ilustrar el ciclo completo de entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 6,9 mil millones de parámetros, una estimación orientativa en fp16 sería de aproximadamente 14 GB solo para pesos, más el coste de las tres vistas de vídeo y del codificador visual, por lo que en la práctica se recomienda al menos 24-40 GB para inferencia cómoda.
- GPU recomendadas: A100 (40/80 GB) o H100 para inferencia y evaluación por lotes; RTX 4090 (24 GB) podría ser suficiente en fp16 con cuidado en el tamaño de lote, aunque no está confirmado por el autor.
- Cabe en GPU de consumo: probablemente en RTX 4090 y GPUs con 24 GB o más en precisión reducida; no confirmado.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI; al ser un modelo VLA con cabeza de acción y código específico (RLWRLD/RLDX), el despliegue requiere el stack de inferencia del proyecto original.
- Latencia y throughput: no disponibles.
- Almacenamiento: el repositorio completo ocupa 165,9 GB; puede descargarse solo el checkpoint final con `ignore_patterns="checkpoints/*"` o un paso concreto con `allow_patterns="checkpoints/step-5000/*"`.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Dominio | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Myungkyu/rldximg_robotwin_b128_60k | ~6,9 mil millones | no disponible | VLA robótica, RoboTwin 2.0 | no disponible | Hugging Face |
| Myungkyu/rldx2_rldximg_robotwin_b128_60k | no disponible | no disponible | VLA robótica, RoboTwin 2.0 (proyecto RLDX-2) | no disponible | Hugging Face |
| Myungkyu/rldx2_rldx_robotwin_vanilla_b128_60k | no disponible | no disponible | VLA robótica, RoboTwin 2.0 (proyecto RLDX-2, vanilla) | no disponible | Hugging Face |
| RLWRLD/RLDX-1-PT | no disponible | no disponible | VLA robótica (modelo base preentrenado) | no disponible | Hugging Face |

Los tres modelos comparables pertenecen al mismo linaje y comparten configuración de datos y entrenamiento, por lo que la comparación relevante es entre variantes del propio proyecto más que frente a arquitecturas externas. No se dispone de datos de rendimiento comparativo publicados en la información proporcionada.

## Limitaciones y advertencias

- Ámbito restringido: es un baseline específico para las 50 tareas de RoboTwin 2.0 sobre Aloha-AgileX; no es un modelo de propósito general y su rendimiento fuera de ese dominio no está caracterizado.
- Licencia no disponible: la ausencia de licencia explícita impide confirmar los términos de uso comercial; debe contactarse con el autor antes de cualquier despliegue productivo.
- Idiomas no especificados: no se documenta qué lenguas admiten las instrucciones de tarea ni su cobertura multilingüe.
- Riesgo de sobreajuste al benchmark: al entrenarse exclusivamente sobre el conjunto co-train de RoboTwin 2.0, puede memorizar sesgos de las demostraciones y degradarse ante variaciones de iluminación, posiciones iniciales u objetos no vistos.
- Sin estado del optimizador: los checkpoints publicados no incluyen el estado del optimizador, lo que limita la reanudación exacta del entrenamiento; solo permiten ajuste fino desde los pesos.
- Sin datos de benchmarks ni de latencia: no es posible estimar de antemano el rendimiento en el leaderboard ni los requisitos de tiempo real a partir de la información publicada.
- Dependencia del código: requiere el stack RLWRLD/RLDX en la rama concreta indicada, lo que añade fricción de reproducibilidad si esa rama cambia.
- Tamaño del repositorio: 165,9 GB complican la descarga y el almacenamiento; conviene usar los patrones de descarga selectiva documentados.
- Riesgo de alucinación en el sentido habitual (generación de texto no veraz) no aplica directamente, pero sí existe riesgo de predicciones de acción erróneas o inseguras que deben validarse con límites de seguridad en el robot.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Myungkyu/rldximg_robotwin_b128_60k
- Variante RLDX-2 con imágenes: https://huggingface.co/Myungkyu/rldx2_rldximg_robotwin_b128_60k
- Variante RLDX-2 vanilla: https://huggingface.co/Myungkyu/rldx2_rldx_robotwin_vanilla_b128_60k
- Modelo base: https://huggingface.co/RLWRLD/RLDX-1-PT
- Dataset RoboTwin 2.0: https://huggingface.co/datasets/TianxingChen/RoboTwin2.0
