# shamanneo/ProSpace-VLM

## Resumen

ProSpace-VLM es un ajuste fino (fine-tuning) del modelo multimodal Qwen2.5-VL-7B-Instruct orientado al razonamiento espacial proactivo sobre flujos de vídeo continuos (streaming video). Lo desarrolla el usuario shamanneo y acompaña al trabajo titulado "Thinking in Streams: Proactive Spatial Reasoning with Vision-Language Models". El modelo no es un checkpoint completo de pesos, sino un conjunto de pesos LoRA junto con cuatro MLPs por capa que inyectan geometría 3D (nubes de puntos y pose de cámara) procedente de CUT3R en las capas 4, 8, 12 y 16 del transformer base.

El problema que aborda es la incapacidad de los VLM convencionales de razonar de forma espacial y proactiva sobre vídeo en tiempo real: normalmente procesan fotogramas aislados o clips cortos sin mantener una representación geométrica coherente de la escena. ProSpace-VLM propone inyectar información geométrica explícita (puntos 3D y trayectoria de cámara) en capas intermedias del modelo de lenguaje, de modo que el razonamiento textual se apoye en una comprensión espacial persistente a lo largo del stream.

Es relevante porque combina dos líneas activas de investigación: por un lado, el razonamiento espacial en modelos visión-lenguaje y, por otro, el procesamiento de vídeo en streaming con capacidad proactiva (anticipar eventos o responder sin esperar a que termine el clip). Al construirse sobre Qwen2.5-VL-7B-Instruct, hereda la arquitectura y el tokenizador de un modelo consolidado, lo que facilita su integración en pipelines existentes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (base Qwen2.5-VL-7B-Instruct) con LoRA y MLPs de inyección geométrica CUT3R en capas 4, 8, 12 y 16 |
| Parametros totales | 7B en el modelo base; los pesos distribuidos son LoRA + 4 MLPs (tamaño de repo 0,2 GB) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base, no especificada en la información) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | `.pth` (PyTorch) con pesos LoRA y MLPs; requiere el modelo base Qwen2.5-VL-7B-Instruct |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-VL-7B-Instruct, un transformer multimodal con encoder visual y decoder de lenguaje. Sobre esa base se aplica un ajuste LoRA y se añaden cuatro MLPs que inyectan geometría CUT3R (nubes de puntos y pose de cámara) en las capas 4, 8, 12 y 16 del modelo. Esta inyección por capas permite que el razonamiento lingüístico del modelo acceda a una representación geométrica explícita de la escena, en lugar de depender únicamente de features visuales implícitas.

El entrenamiento está orientado al razonamiento espacial proactivo en streaming de vídeo, según la model card y el paper asociado. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si se emplearon técnicas de RLHF o DPO. El pipeline declarado es `video-text-to-text`, lo que confirma la modalidad principal de entrada (vídeo + texto) y salida (texto).

## Capacidades

- Razonamiento espacial sobre escenas 3D: estimación de relaciones espaciales entre objetos y de la trayectoria de cámara, apoyada en la geometría CUT3R inyectada.
- Procesamiento de vídeo en streaming: pensado para flujos continuos más que para clips cerrados.
- Razonamiento proactivo: capacidad de anticipar o responder sin esperar al final del stream (según el título del trabajo).
- Comprensión video-texto: hereda las capacidades de Qwen2.5-VL-7B-Instruct para describir y responder preguntas sobre vídeo.
- Tool calling / function calling: no confirmado explícitamente para este ajuste; el modelo base Qwen2.5-VL lo soporta, pero no se documenta en la información disponible.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Modo thinking explícito, visión de imágenes estáticas, audio: no documentados para este ajuste.

## Casos de uso

- Robótica móvil y navegación: el modelo puede interpretar el stream de una cámara a bordo y razonar sobre la posición relativa de obstáculos y la trayectoria propia gracias a la inyección de pose de cámara y nubes de puntos en capas intermedias.
- Asistencia en realidad aumentada: seguimiento espacial de la escena para anclar instrucciones o etiquetas a objetos concretos mientras el usuario se mueve.
- Vigilancia y monitorización inteligente: análisis proactivo de flujos de vídeo continuos para detectar eventos espaciales (por ejemplo, intrusiones o cambios de trayectoria) sin segmentar el vídeo en clips.
- Vehículos autónomos y ADAS: razonamiento sobre la geometría de la escena en tiempo real para apoyar tareas de percepción y planificación de alto nivel.
- Análisis de vídeo industrial: inspección de líneas de producción donde la posición 3D de piezas y operarios es relevante para detectar anomalías.
- Investigación en VLM espaciales: servir de base reproducible (código de evaluación público en GitHub) para comparar estrategias de inyección geométrica en modelos visión-lenguaje.
- Asistentes de entrenamiento deportivo: análisis de la posición corporal y del movimiento de la cámara en secuencias de vídeo para generar correcciones en tiempo real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; como referencia, un modelo de 7B en precisión completa requiere del orden de 14-16 GB solo para pesos, sin contar el encoder visual ni el estado de activaciones.
- GPU recomendadas: no especificadas. El script de evaluación del repositorio de GitHub invoca `bash scripts/eval_prospace_vlm.sh 0,1,2,3`, lo que sugiere el uso de 4 GPUs (probablemente con paralelismo de datos o tensor).
- Cabe en GPU de consumo: no confirmado; un 7B cuantizado a 4 bits podría caber en GPUs de 24 GB, pero el modelo distribuido son pesos LoRA que requieren el base en memoria, y no se documenta soporte de cuantización.
- Opciones de despliegue: no disponibles. El formato `.pth` y la dependencia de CUT3R sugieren un pipeline de evaluación propio más que despliegue directo con vLLM, llama.cpp u Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ProSpace-VLM | 7B (base) + LoRA/MLPs | no disponible | vídeo-texto con razonamiento espacial | no disponible | Hugging Face (0 descargas) |
| Qwen2.5-VL-7B-Instruct | 7B | no disponible en esta ficha | imagen/vídeo-texto | no disponible en esta ficha | Hugging Face (modelo base) |
| CUT3R | no disponible | no disponible | reconstrucción 3D a partir de imágenes | no disponible | usado como módulo geométrico |

La comparación con alternativas de la misma categoría (VLM con razonamiento espacial) no puede completarse con los datos disponibles. ProSpace-VLM se distingue de su base por la inyección geométrica explícita y por el enfoque en streaming proactivo, pero no hay cifras públicas que permitan contrastar su rendimiento frente a otros VLM espaciales.

## Limitaciones y advertencias

- Licencia no especificada: no se puede confirmar el uso comercial; hay que consultar la licencia del modelo base Qwen2.5-VL-7B-Instruct y del paper asociado.
- No es un checkpoint autónomo: requiere descargar y cargar Qwen2.5-VL-7B-Instruct además de los pesos LoRA y MLPs; el repo de 0,2 GB no contiene el modelo completo.
- Dependencia de CUT3R: la calidad del razonamiento espacial está limitada por la precisión de la geometría estimada por CUT3R (puntos y pose de cámara).
- Sin benchmarks publicados: no hay evidencia cuantitativa de rendimiento frente a alternativas.
- Idiomas no documentados: no se puede garantizar un comportamiento multilingüe más allá del que herede el modelo base.
- Riesgo de alucinación: como todo VLM, puede generar descripciones espaciales plausibles pero incorrectas, especialmente en escenas con oclusiones o movimiento rápido.
- Madurez: modelo con 0 descargas y 1 like en el momento de la consulta; no hay evidencia de uso en producción ni de validación externa.
- Sesgos: no documentados; hereda los del dataset de entrenamiento y del modelo base, no auditados en esta ficha.

## Enlaces

- Hugging Face: https://huggingface.co/shamanneo/ProSpace-VLM
- Repositorio de evaluación: https://github.com/shamanneo/prospace
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-VL-7B-Instruct
