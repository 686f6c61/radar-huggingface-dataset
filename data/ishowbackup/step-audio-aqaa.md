# Ishowbackup/Step-Audio-AQAA

## Resumen

Step-Audio-AQAA es un modelo de lenguaje de audio a gran escala (Large Audio-Language Model, LALM) desarrollado por el equipo StepFun, diseñado específicamente para tareas de Audio Query-Audio Answer (AQAA): recibe audio como entrada y genera directamente respuestas de habla natural, sin depender de módulos intermedios de ASR (reconocimiento de voz) ni TTS (síntesis de voz). Este enfoque elimina los errores en cascada típicos de los sistemas modulares y simplifica la arquitectura global.

El modelo combina un tokenizador de audio de doble codebook (lingüístico y semántico), un backbone LLM multimodal de aproximadamente 130 mil millones de parámetros (según la model card; los pesos safetensors suman 136.66 mil millones) basado en una arquitectura decoder-only con atención por grupos de consultas (GQA), y un vocoder neuronal basado en flow-matching. Soporta control fino de la voz a nivel de frase (tono emocional, velocidad del habla) y cubre múltiples idiomas y dialectos, incluyendo chino mandarín, sichuanés, cantonés, inglés y japonés.

La relevancia actual de este modelo radica en que representa un avance hacia la interacción de audio verdaderamente end-to-end, con aplicaciones en asistentes de voz, role-playing, control de emociones en el habla y razonamiento lógico en dominios de audio, todo ello bajo una licencia Apache 2.0 que facilita su adopción tanto en investigación como en producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Decoder-only Transformer con RMSNorm y grouped query attention (GQA) |
| Parametros totales | 136.663.907.840 (según safetensors; la model card indica 130B) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Chino (mandarín, sichuanés, cantonés), inglés, japonés, entre otros |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se compone de tres módulos principales. El primero es un tokenizador de audio de doble codebook: un tokenizador lingüístico basado en el codificador Paraformer que extrae atributos fonémicos y lingüísticos con un codebook de 1.024 entradas a 16,7 Hz, y un tokenizador semántico que referencia CosyVoice 1.0, capturando características acústicas con un codebook de 4.096 entradas a 25 Hz. Ambos se alinean temporalmente mediante una proporción de intercalado 2:3 para mantener la consistencia entre los dos tipos de tokens.

El segundo módulo es el backbone LLM, un modelo multimodal de 130 mil millones de parámetros (Step-Omni) con arquitectura decoder-only, capas Transformer, normalización RMSNorm y atención por grupos de consultas. El vocabulario se expande con 5.120 tokens de audio intercalados con los tokens de texto, permitiendo salidas mixtas texto-audio.

El tercer módulo es un vocoder neuronal basado en flow-matching (inspirado en CosyVoice), que emplea una arquitectura U-Net con capas ResNet-1D para generar formas de onda de alta fidelidad condicionadas únicamente por los tokens de audio.

El entrenamiento sigue un pipeline multi-etapa: primero un pretraining multimodal sobre 800 mil millones de tokens de texto y datos intercalados de audio-texto; luego un ajuste fino supervisado (SFT) en dos fases, primero con actualización completa de parámetros sobre datasets AQTA (audio query-text answer) y AQTAA (audio query-text answer-audio answer), y después con datos AQTAA de alta calidad para optimizar capacidades específicas. Finalmente se aplica optimización por preferencias directas (DPO) con enmascaramiento de tokens de audio para evitar la degradación de la generación del habla, y se realiza una fusión ponderada de los modelos SFT y DPO para mejorar el rendimiento global.

## Capacidades

- Generación de respuestas de audio directamente desde audio de entrada, sin necesidad de transcripción intermedia.
- Control fino de la voz a nivel de frase: ajuste de tono emocional, velocidad del habla y otras características vocales.
- Soporte multilingüe y de dialectos: chino mandarín, sichuanés, cantonés, inglés, japonés y otros.
- Manejo de tareas complejas de interacción de audio: control de emociones en el habla, role-playing y razonamiento lógico.
- Capacidad de generar texto y audio de forma intercalada gracias a la expansión del vocabulario con tokens de audio.
- Arquitectura end-to-end que elimina la necesidad de módulos ASR/TTS separados, reduciendo errores en cascada.

## Casos de uso

- Asistentes de voz conversacionales: el modelo puede gestionar diálogos multi-turno donde el usuario habla directamente y el asistente responde con voz natural, sin depender de un pipeline ASR-TTS. Su capacidad para mantener el contexto y controlar el tono emocional lo hace adecuado para atención al cliente o asistentes personales.
- Role-playing interactivo: gracias al control fino de la voz y al soporte de emociones, se puede usar en juegos o experiencias narrativas donde un personaje virtual responde con entonación y ritmo adaptados al contexto emocional de la conversación.
- Sistemas de doblaje y locución automatizada: el modelo puede generar habla con estilos vocales específicos (tono, velocidad) a partir de instrucciones de audio, lo que permite producir locuciones personalizadas para vídeo, audiolibros o publicidad sin necesidad de un actor de voz.
- Herramientas de aprendizaje de idiomas: al soportar múltiples idiomas y dialectos, puede servir como tutor de pronunciación o conversación, respondiendo oralmente a las preguntas del estudiante y corrigiendo la entonación mediante el control de características vocales.
- Interacción con sistemas de IA en entornos ruidosos o sin pantalla: en dispositivos IoT, wearables o interfaces de voz, el modelo procesa directamente la entrada de audio y responde con voz, evitando la latencia y los errores de los sistemas modulares.
- Investigación en modelos de audio multimodal: al ser de código abierto (Apache 2.0) y estar completamente documentado, sirve como base para experimentos sobre generación de habla expresiva, fusión de tokens de audio y texto, y métodos de entrenamiento como DPO aplicado a audio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas numéricas como MMLU, HumanEval o métricas de calidad de audio (WER, MOS). Se recomienda consultar el paper (arXiv:2506.08967) para posibles evaluaciones internas, aunque no se han proporcionado en el material revisado.

## Requisitos de hardware

- El modelo tiene aproximadamente 136.66 mil millones de parámetros en precisión FP32 (según safetensors). En FP16, el peso ocuparía unos 273 GB, lo que coincide con el tamaño del repositorio (273.3 GB).
- Para inferencia en FP16 se necesitarían al menos 8 GPUs A100 de 80 GB o 4 H100 de 80 GB (asumiendo que el modelo se puede distribuir entre varias GPUs). En cuantización de 8 bits se podría reducir a ~136 GB, requiriendo 2-3 GPUs A100/H100 de 80 GB; en 4 bits, ~68 GB, cabiendo en una sola GPU de 80 GB (A100, H100) o en dos RTX 4090 de 24 GB.
- No se dispone de datos oficiales sobre latencia o throughput. Al ser un modelo de 130B+ parámetros, se espera una latencia significativa en generación, especialmente en tareas de audio de larga duración.
- Para despliegue, no se han publicado configuraciones específicas. Se recomienda evaluar con frameworks como vLLM o TensorRT-LLM para optimización, aunque no hay garantías de compatibilidad sin pruebas previas. Alternativas como llama.cpp podrían ser viables con cuantización, pero el soporte de tokens de audio y el vocoder requeriría integración personalizada.

## Comparativa con modelos similares

No se dispone de una comparativa directa publicada con otros modelos de audio end-to-end de tamaño similar. Los modelos comparables en el espacio de LALM incluyen:

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| Step-Audio-AQAA | ~130B | No disponible | Apache 2.0 | End-to-end audio-audio |
| Qwen2-Audio | ~7B | 32k tokens | Apache 2.0 | Audio-texto, no genera audio |
| Mini-Omni | ~0.5B | No disponible | MIT | Audio-audio, pero mucho menor |

La comparativa es limitada porque Step-Audio-AQAA es uno de los pocos modelos abiertos de audio-audio a esta escala. Los modelos de la propia familia Step-Audio (Audio-Chat, TTS) son anteriores y no ofrecen la misma capacidad end-to-end.

## Limitaciones y advertencias

- No se han documentado sesgos específicos, pero al estar entrenado principalmente con datos en chino e inglés, es probable que el rendimiento en otros idiomas sea inferior.
- Riesgo de alucinación en respuestas de audio: como cualquier LLM, puede generar contenido plausible pero incorrecto, especialmente en tareas de razonamiento complejo.
- La longitud de contexto no está publicada, lo que dificulta estimar su capacidad para manejar diálogos muy largos o entradas de audio extensas.
- El tamaño del modelo (130B+ parámetros) hace que su despliegue en producción sea costoso en términos de hardware y energía, limitando su uso a entornos con infraestructura GPU de alto rendimiento.
- Aunque la licencia es Apache 2.0, el uso comercial está permitido, pero se recomienda revisar los términos de la licencia del modelo base Step-Omni si se utiliza en productos comerciales.
- No se proporcionan instrucciones claras de uso o ejemplos de código en la model card, lo que puede dificultar la integración inicial.
- El vocoder basado en flow-matching puede requerir ajustes para diferentes frecuencias de muestreo o formatos de audio, y no se especifican los formatos de entrada/salida soportados.

## Enlaces

- [Modelo en HuggingFace (mirror)](https://huggingface.co/Ishowbackup/Step-Audio-AQAA)
- [Modelo original en HuggingFace](https://huggingface.co/stepfun-ai/Step-Audio-AQAA)
- [Paper en arXiv](https://arxiv.org/abs/2506.08967)
- [Repositorio GitHub de Step-Audio](https://github.com/stepfun-ai/Step-Audio)
- [Colección Step-Audio en HuggingFace](https://huggingface.co/collections/stepfun-ai/step-audio)
- [Modelo en ModelScope](https://www.modelscope.cn/models/stepfun-ai/Step-Audio-AQAA)
- [Demo en vivo](https://www.stepfun.com/docs/zh/step-audio-aqaa?studio_code=step-audio-aqaa&studio_id=121368403356246016&studio_type=1)
