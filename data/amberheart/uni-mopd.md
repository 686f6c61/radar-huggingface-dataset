# AmberHeart/Uni-MOPD

## Resumen

Uni-MOPD es un modelo multimodal de visión-lenguaje desarrollado por AmberHeart que unifica cinco especialistas de dominio en un único modelo. Se construye sobre Qwen/Qwen3-VL-30B-A3B-Instruct, un modelo de mezcla de expertos (MoE) ya ajustado por instrucciones, y aplica una receta de destilación en política multi-profesor (MOPD) precedida por una fusión uniforme de pesos. El resultado es un estudiante único que cubre razonamiento STEM, respuesta visual a preguntas generales, comprensión de documentos/OCR/gráficos, grounding de GUI y comprensión encarnada (embodied).

La relevancia del modelo reside en su enfoque metodológico: en lugar de partir de un modelo base o de un ajuste supervisado multi-dominio, trata el punto de partida como variable de diseño. Una fusión uniforme sin entrenamiento de los cinco especialistas inicializa al estudiante, que después se refina con solo 50 actualizaciones de MOPD usando muestreo uniforme de dominios y KL inversa sobre vocabulario completo. Esto reduce drásticamente el coste de integración de capacidades frente a enfoques que dejan toda la integración a la destilación.

El modelo tiene 31.070.754.032 parámetros totales en formato bfloat16, distribuidos en 13 shards safetensors, con un repositorio de 62,2 GB. La arquitectura es la del Qwen3-VL MoE subyacente, con parámetros activos no especificados en la información disponible. La licencia es Apache 2.0, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE vision-lenguaje (Qwen3-VL MoE) |
| Parametros totales | 31.070.754.032 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en bfloat16) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (13 shards, bfloat16) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen3-VL-30B-A3B-Instruct: un transformer de mezcla de expertos con capacidades de visión-lenguaje. Los cinco especialistas (STEM, VQA, OCR/documentos, GUI y embodied) se post-entrenan desde el mismo checkpoint base, cada uno siguiendo una ruta de post-entrenamiento distinta que termina con aprendizaje por refuerzo en su propio dominio. Al compartir arquitectura y vocabulario, los especialistas admiten tanto fusión en espacio de pesos como destilación a nivel de token.

El entrenamiento del modelo unificado consta de dos fases. Primero, una fusión uniforme sin entrenamiento (publicada como Uni-MOPD-Merge) inicializa al estudiante combinando los pesos de los cinco especialistas. Segundo, una fase corta de MOPD de 50 actualizaciones con muestreo uniforme de dominios y KL inversa sobre vocabulario completo: el estudiante genera respuestas a las consultas de entrenamiento y el profesor del dominio correspondiente supervisa esas respuestas. No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni detalles sobre RLHF/DPO más allá del RL por dominio aplicado a cada especialista.

## Capacidades

- Generación de texto y razonamiento multimodal sobre imágenes.
- Razonamiento STEM (matemáticas, ciencia e ingeniería) heredado del especialista STEM.
- Respuesta visual a preguntas generales (VQA) sobre imágenes arbitrarias.
- Comprensión de documentos, OCR y gráficos, incluyendo extracción y lectura de contenido visual estructurado.
- Grounding de interfaces gráficas (GUI), localización de elementos en capturas de pantalla.
- Comprensión encarnada (embodied), interpretación de escenas y contextos de agente físico.
- Procesamiento image-text-to-text mediante `Qwen3VLMoeForConditionalGeneration` y `AutoProcessor`.
- Integración con la plantilla de chat de Qwen3-VL para conversaciones multimodales.
- Soporte de tool calling y agentes: no confirmado explícitamente en la información disponible, aunque heredable del modelo base.
- Capacidades multilingües: no disponible.

## Casos de uso

- Asistencia en resolución de problemas STEM: el modelo puede recibir una imagen con un enunciado o diagrama y generar la resolución paso a paso, aprovechando el especialista STEM integrado para razonamiento matemático y científico.
- Digitalización y comprensión de documentos: extracción de datos de facturas, tablas, gráficos y documentos escaneados, adecuado por la integración del especialista OCR/documentos en un único modelo que evita cambiar de pipeline según el tipo de entrada.
- Automatización de pruebas de interfaz: localización de elementos en capturas de pantalla para generar selectores o acciones de clic, gracias al especialista de GUI grounding.
- Atención al cliente multimodal: gestión de conversaciones multi-turno donde el usuario adjunta imágenes de productos, errores o capturas, con contexto gestionado por la arquitectura del modelo base.
- Robótica y agentes encarnados: interpretación de escenas visuales para planificación de acciones en entornos físicos o simulados, apoyándose en el especialista embodied.
- Moderación y análisis de contenido visual: descripción y clasificación de imágenes con razonamiento textual asociado, útil en pipelines de revisión que requieren justificación en lenguaje natural.
- Investigación en destilación multi-profesor: el repositorio sirve como referencia reproducible para estudiar fusión de pesos y MOPD, al publicarse por separado el merge inicial y los cinco profesores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 62 GB solo para pesos, más memoria para activaciones y caché KV; en la práctica se requieren GPUs de 80 GB o configuraciones multi-GPU.
- Cuantización a 8 bits: en torno a 31 GB de pesos, viable en una GPU de 40-48 GB.
- Cuantización a 4 bits: en torno a 16 GB de pesos, potencialmente viable en GPUs consumer de gama alta con 24 GB, aunque no se confirman formatos GGUF publicados.
- GPU recomendadas: A100 80 GB, H100 80 GB, o múltiples GPUs para reparto con `device_map="auto"`.
- No cabe en GPUs consumer estándar en precisión completa; en cuantización agresiva podría ajustarse en RTX 4090 (24 GB) con margen limitado.
- Opciones de despliegue: transformers (requiere `transformers>=4.57.1`), con soporte declarado de endpoints compatibles; vLLM, llama.cpp, Ollama o TGI no se confirman en la información disponible.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros totales | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Uni-MOPD | 31.070.754.032 | no disponible | Apache 2.0 | Hugging Face (AmberHeart) |
| Qwen/Qwen3-VL-30B-A3B-Instruct | no disponible en esta ficha | no disponible | no disponible en esta ficha | Hugging Face (Qwen) |
| Uni-MOPD-Merge | misma arquitectura base | no disponible | Apache 2.0 | Hugging Face (AmberHeart) |
| Especialistas Uni-MOPD-Teacher-* | misma arquitectura base | no disponible | Apache 2.0 | Hugging Face (AmberHeart) |

La comparación más directa es con el modelo base Qwen3-VL-30B-A3B-Instruct, del que Uni-MOPD hereda arquitectura, vocabulario y licencia, y con los cinco especialistas y el merge intermedio publicados por el mismo autor. No se dispone de datos de rendimiento comparativo en la información proporcionada.

## Limitaciones y advertencias

- No se han publicado resultados de benchmarks, por lo que el rendimiento real frente al modelo base o a los especialistas individuales no está cuantificado.
- El proceso de fusión y destilación puede diluir capacidades específicas de cada especialista; no hay evaluación publicada de la pérdida por dominio.
- Riesgo de alucinación inherente a los modelos de lenguaje y visión-lenguaje, especialmente en OCR de documentos de baja calidad o gráficos complejos.
- Idiomas soportados no documentados; el comportamiento multilingüe no está garantizado más allá de lo heredado del modelo base.
- Longitud de contexto no especificada en la información disponible, lo que limita la planificación de despliegues con entradas largas.
- Licencia Apache 2.0 permite uso comercial, pero se debe conservar el aviso de modificaciones (`NOTICE`) y cumplir las condiciones heredadas del modelo base.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación comunitaria.
- Requiere `transformers>=4.57.1`; versiones anteriores no cargarán el modelo correctamente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AmberHeart/Uni-MOPD
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-30B-A3B-Instruct
- Merge inicial: https://huggingface.co/AmberHeart/Uni-MOPD-Merge
- Especialista STEM: https://huggingface.co/AmberHeart/Uni-MOPD-Teacher-STEM
- Especialista VQA: https://huggingface.co/AmberHeart/Uni-MOPD-Teacher-VQA
- Especialista OCR: https://huggingface.co/AmberHeart/Uni-MOPD-Teacher-OCR
- Especialista GUI: https://huggingface.co/AmberHeart/Uni-MOPD-Teacher-GUI
- Especialista embodied: https://huggingface.co/AmberHeart/Uni-MOPD-Teacher-Embodied
- Paper, blog o repositorio del método: no disponible en la información proporcionada.
