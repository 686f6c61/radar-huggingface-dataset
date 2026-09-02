# abhishekgautamm/whisper-tiny-hinglish-ct2

## Resumen

El modelo `abhishekgautamm/whisper-tiny-hinglish-ct2` es una exportación en formato CTranslate2 de un fine-tuning de `openai/whisper-tiny` realizado por el autor abhishekgautamm. Su propósito es transcribir audio en hindi, inglés e hinglish (mezcla de ambos) directamente a texto romanizado, es decir, sin usar escritura devanagari. Por ejemplo, una frase como "क्या सीन है" se transcribe como "kya scene hai". Está diseñado para ejecutarse de forma rápida en CPU, incluso en dispositivos de bajos recursos, mediante la librería faster-whisper.

El modelo base, Whisper-tiny, es un transformer encoder-decoder de 39 millones de parámetros entrenado por OpenAI sobre 680 000 horas de audio etiquetado de forma débilmente supervisada. Este fine-tuning concreto se ha especializado en el registro coloquial hinglish, un idioma muy hablado en la India y la diáspora, pero que los modelos ASR genéricos suelen manejar mal. La relevancia actual radica en que permite integrar transcripción de voz en tiempo real en aplicaciones de bajo coste, sin necesidad de GPU, y con una huella de memoria muy reducida.

El repositorio contiene la versión en precisión completa (float32) de 0,2 GB. El autor indica que también existe una versión int8 de aproximadamente 46 MB que se distribuye dentro de su aplicación Yapper. La licencia declarada en HuggingFace es "no disponible", aunque la model card aclara que el modelo base es MIT y que los datasets de entrenamiento (HiACC, MUCS, Common Voice) tienen sus propios términos, por lo que se debe verificar antes de un uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper-tiny) |
| Parametros totales | 39 millones (modelo base) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (Whisper-tiny usa ventanas de audio de 30 segundos) |
| Tipos de cuantizacion | float32 (repositorio), int8 (mencionado en la model card) |
| Idiomas soportados | hindi, ingles, hinglish (salida romanizada) |
| Licencia | no disponible en HF; base model MIT, datasets con terminos propios |
| Formato de pesos | CTranslate2 (safetensors no aplica; el formato es el propio de CTranslate2) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Whisper de OpenAI: un transformer encoder-decoder con atención de escala logarítmica en el tiempo, entrenado para múltiples tareas (reconocimiento de voz, traducción, identificación de idioma). En este caso, el encoder procesa mel-espectrogramas de 80 canales y el decoder genera texto. El fine-tuning se realizó sobre el checkpoint `openai/whisper-tiny` con datos de los datasets HiACC, MUCS y Common Voice, orientados a hindi e inglés. La salida se ha adaptado para producir texto romanizado, lo que implica que el tokenizer y la estrategia de decodificación se ajustaron para emitir caracteres latinos en lugar de devanagari.

No se especifican detalles sobre el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas como RLHF o DPO. La model card solo menciona que el modelo es pequeño y no es state-of-the-art, y que la ortografía romanizada es fonética y puede variar. La exportación a CTranslate2 permite usar la implementación optimizada de faster-whisper, que acelera la inferencia en CPU mediante kernels optimizados y soporte de cuantización int8.

## Capacidades

- Transcripción de voz en hindi, inglés e hinglish con salida romanizada.
- Reconocimiento de voz multilingüe limitado a los idiomas mencionados; las frases en inglés se transcriben literalmente.
- Inferencia en CPU con baja latencia gracias a CTranslate2 y faster-whisper.
- Soporte de cuantización int8 para reducir aún más el uso de memoria y acelerar la inferencia.
- Integración sencilla en aplicaciones Python mediante la API de faster-whisper.
- No incluye capacidades de traducción, tool calling, agentes ni razonamiento multi-paso; es un modelo puramente ASR.

## Casos de uso

- Transcripción de reuniones y llamadas en entornos donde se mezcla hindi e inglés: el modelo puede procesar audio en tiempo real o por lotes, generando texto romanizado que facilita su posterior análisis o búsqueda.
- Subtitulado automático de vídeos en plataformas de contenido hinglish: al ser ligero, puede ejecutarse en servidores modestos o incluso en el cliente, sin depender de APIs externas.
- Asistentes de voz para aplicaciones móviles: gracias a su tamaño reducido y a la posibilidad de cuantizar a int8, cabe en dispositivos con poca memoria y puede funcionar sin conexión.
- Análisis de llamadas de atención al cliente en mercados indios: permite extraer transcripciones para detectar intenciones, sentimiento o cumplimiento de guiones, con un coste computacional mínimo.
- Herramientas de accesibilidad para personas con discapacidad auditiva que necesiten subtítulos en tiempo real en hinglish romanizado.
- Prototipos de agentes de voz conversacionales: el modelo puede servir como componente de ASR en pipelines de voz a texto, alimentando a un LLM o a un sistema de diálogo, gracias a su baja latencia en CPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas como WER (Word Error Rate) ni comparaciones con otros modelos. El autor advierte que el modelo es pequeño y que se esperan errores en audio ruidoso, habla rápida o palabras poco comunes.

## Requisitos de hardware

- VRAM estimada: no requiere GPU; puede ejecutarse en CPU. Con float32, el modelo ocupa aproximadamente 0,2 GB en memoria. Con int8, alrededor de 46 MB.
- GPU recomendadas: no es necesario; cualquier CPU moderna con soporte de instrucciones AVX2 es suficiente. Si se desea usar GPU, cualquier GPU con al menos 1 GB de VRAM puede ejecutarlo, pero no es el objetivo.
- Compatibilidad con GPU de consumo: sí, cualquier GPU NVIDIA o AMD con soporte CUDA/ROCm puede usarlo, pero no aporta una ventaja significativa frente a CPU para un modelo tan pequeño.
- Opciones de despliegue: faster-whisper (recomendado), CTranslate2, también se puede convertir a otros formatos como ONNX o GGUF, aunque no se proporcionan en el repositorio.
- Latencia y throughput: no hay datos publicados. Dado el tamaño del modelo, en CPU se esperan tiempos de inferencia del orden de decenas de milisegundos por segmento de 30 segundos, pero depende del hardware y de la cuantización.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Salida | Licencia | Formato |
|---|---|---|---|---|---|
| whisper-tiny-hinglish-ct2 (este) | 39M | 30 s de audio | Romanizado hinglish | no disponible (base MIT) | CTranslate2 |
| openai/whisper-tiny | 39M | 30 s de audio | Multilingüe (devanagari, etc.) | MIT | PyTorch, etc. |
| openai/whisper-base | 74M | 30 s de audio | Multilingüe | MIT | PyTorch, etc. |
| google/whisper-tiny-hi (si existe) | no disponible | no disponible | Hindi devanagari | no disponible | no disponible |

La comparativa se limita a modelos de la familia Whisper porque no hay datos de otros modelos ASR específicos para hinglish romanizado. Este modelo se diferencia por su salida romanizada y su formato optimizado para CPU, pero no se dispone de métricas de rendimiento para comparar objetivamente.

## Limitaciones y advertencias

- Sesgos conocidos: el modelo se entrenó con datasets específicos (HiACC, MUCS, Common Voice) que pueden no representar todas las variantes dialectales del hinglish ni todos los acentos.
- Riesgo de alucinación: como todo modelo ASR, puede generar texto plausible pero incorrecto en audio ruidoso o con habla solapada.
- Limitaciones de contexto: Whisper-tiny procesa ventanas de 30 segundos; no maneja contexto de audio más largo de forma nativa, aunque faster-whisper permite segmentación.
- Limitaciones de idioma: solo cubre hindi, inglés y hinglish; no soporta otros idiomas indios ni otras variantes.
- Ortografía romanizada: la salida es fonética y puede variar entre hablantes; no es adecuada para transcripciones que requieran ortografía estándar.
- Restricciones de licencia: la licencia en HuggingFace es "no disponible"; la model card indica que el base model es MIT pero que los datasets de entrenamiento tienen sus propios términos. Se debe verificar la compatibilidad antes de un uso comercial.
- Para producción: el autor advierte que no es state-of-the-art; se recomienda evaluar el WER en el dominio de uso antes de desplegarlo.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/abhishekgautamm/whisper-tiny-hinglish-ct2
- Modelo base: https://huggingface.co/openai/whisper-tiny
- Repositorio de Whisper (OpenAI): https://github.com/openai/whisper
- faster-whisper: https://github.com/SYSTRAN/faster-whisper
- Aplicación Yapper (mencionada en la model card): https://github.com/ABHISHEKgauti25/yapper
- Model card del fine-tuning original (PyTorch): https://huggingface.co/ABHISHEKgauti25/whisper-tiny-hinglish
