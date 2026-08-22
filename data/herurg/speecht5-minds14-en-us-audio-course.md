# herurg/speecht5-minds14-en-us-audio-course

## Resumen

El modelo `herurg/speecht5-minds14-en-us-audio-course` es un ajuste fino de `microsoft/speecht5_tts` sobre el dataset `PolyAI/minds14` en su variante de inglés estadounidense (`en-US`). Ha sido desarrollado por el usuario `herurg` como parte del Hugging Face Audio Course, concretamente para la práctica de la Unidad 6, dedicada a la síntesis de voz (text-to-speech). Su objetivo es demostrar el proceso de fine-tuning de SpeechT5 y publicar el resultado en el Hub.

El modelo tiene un total de 144.433.890 parámetros y se distribuye en formato `safetensors`. Está pensado para convertir texto en voz (TTS), no para generación de texto ni razonamiento. Su relevancia actual radica en que permite a desarrolladores e investigadores experimentar con síntesis de voz mediante una arquitectura moderna y entrenar sobre datos de dominio específico, en este caso el dataset MINDS-14 para inglés de Estados Unidos.

La arquitectura subyacente es SpeechT5, un modelo encoder-decoder preentrenado de forma multimodal sobre texto y habla, lo que le permite aprender representaciones compartidas entre ambas modalidades. El fine-tuning se realizó con un subconjunto reducido del dataset, en una GPU Tesla T4 de Google Colab, con 100 pasos de entrenamiento y una tasa de aprendizaje de 1e-5.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SpeechT5 (encoder-decoder) |
| Parametros totales | 144.433.890 |
| Parametros activos | no disponible |
| Longitud de contexto | no aplica (modelo de síntesis de voz, no de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | inglés (en-US) |
| Licencia | no disponible (modelo base `microsoft/speecht5_tts` tiene licencia MIT) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

SpeechT5 es un modelo encoder-decoder preentrenado de forma multimodal sobre una mezcla de datos de texto y habla (texto-a-voz, voz-a-texto, texto-a-texto y voz-a-voz). El preentrenamiento se realiza con un espacio de representaciones ocultas compartido entre texto y voz, lo que permite que el modelo aprenda representaciones unificadas. La arquitectura incluye un encoder y un decoder compartidos, junto con seis pre-nets y post-nets específicos para cada modalidad.

El fine-tuning de este modelo se realizó sobre el dataset `PolyAI/minds14` (solo la parte en inglés de EE. UU.), que contiene grabaciones de audio y transcripciones de interacciones de atención al cliente. Se utilizó un subconjunto pequeño del dataset para el entrenamiento, con las siguientes configuraciones:

- Base model: `microsoft/speecht5_tts`
- Tarea: text-to-speech
- Pasos de entrenamiento: 100
- Tasa de aprendizaje: 1e-5
- Entrenamiento en FP16
- Gradient checkpointing activado

Los embeddings de hablante se extrajeron con `speechbrain/spkrec-xvect-voxceleb` para permitir la síntesis de voz con distintas voces. La pérdida final de validación reportada es de **1.000769**. No se especifica ninguna innovación técnica adicional más allá del propio fine-tuning.

## Capacidades

- Generación de voz en inglés (en-US) a partir de texto de entrada.
- Síntesis de voz con control de hablante mediante embeddings de voz (extraídos con SpeechBrain).
- Modelo TTS clásico: convierte texto en secuencias de audio (waveform).
- No es un modelo de lenguaje: no genera texto, no realiza razonamiento, ni soporta tool calling o agentes.
- Capacidades multilingües: no disponibles, solo entrena para inglés de EE. UU.
- No tiene modo de pensamiento ni capacidades multimodales adicionales.

## Casos de uso

- **Asistentes de voz en inglés**: el modelo puede integrarse en un pipeline de TTS para generar respuestas habladas en aplicaciones de asistente virtual, dado que convierte texto en voz con baja latencia en GPU o CPU.
- **Audiolibros y narración**: permite sintetizar la lectura de textos en inglés, útil para generar audiolibros o contenido narrado automáticamente sin necesidad de grabación humana.
- **Aplicaciones de accesibilidad**: puede utilizarse para leer en voz alta contenido de pantalla o documentos para personas con discapacidad visual, aprovechando su tamaño reducido que lo hace apto para entornos con recursos limitados.
- **Práctica educativa de fine-tuning**: al ser un modelo de ejemplo del Audio Course, es útil como referencia didáctica para desarrolladores que quieran aprender a ajustar SpeechT5 a sus propios datos.
- **Investigación en síntesis de voz**: permite experimentar con la adaptación de un modelo TTS a un dominio específico (en este caso, datos de interacciones de usuarios) para estudiar el impacto del fine-tuning con pocos datos.
- **Generación de voces para chatbots**: puede integrarse en un sistema de chatbot para dar respuesta de voz, aunque requiere un pipeline adicional de gestión de diálogo (el modelo solo hace TTS).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La única métrica reportada es la pérdida de validación final durante el entrenamiento, con un valor de **1.000769**. No hay comparación con otros modelos en términos de MOS (Mean Opinion Score) ni métricas estándar de TTS como WER o CER.

## Requisitos de hardware

- **VRAM estimada para inferencia**: el modelo tiene ~144M de parámetros, por lo que en FP16 ocupa aproximadamente 288 MB. La inferencia en CPU es viable, y en GPU puede usar menos de 1 GB de VRAM.
- **GPU recomendadas**: cualquier GPU con al menos 4 GB de VRAM es suficiente, incluidas tarjetas de consumo como NVIDIA GTX 1060, RTX 3060, o incluso la T4 de Colab. No requiere GPUs de datacenter.
- **Cabe en consumer GPU**: sí, sin problema.
- **Opciones de despliegue**: se puede usar directamente con la librería `transformers` mediante el pipeline `text-to-speech`. También es posible exportar a ONNX o usar `safetensors` para despliegues personalizados. No se menciona soporte con vLLM, llama.cpp o Ollama, ya que es un modelo TTS, no un LLM.
- **Latencia y throughput**: no se proporcionan datos concretos, pero por el tamaño pequeño se espera una latencia baja (del orden de segundos para frases cortas) en CPU o GPU.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `herurg/speecht5-minds14-en-us-audio-course` | SpeechT5 | 144M | no aplica | en-US | no disponible | HuggingFace |
| `btoscano/speecht5_tts_minds14` | SpeechT5 | no disponible | no disponible | en-US | no disponible | HuggingFace |
| `microsoft/speecht5_tts` | SpeechT5 | 144M | no aplica | multi | MIT | HuggingFace |

La comparativa se limita a otros fine-tunes de SpeechT5 sobre el dataset MInDS-14, aunque no se tienen datos de rendimiento para establecer una comparación cuantitativa. El modelo base `microsoft/speecht5_tts` es el punto de partida y tiene licencia MIT, pero el modelo fine-tune de este repositorio no especifica licencia propia.

## Limitaciones y advertencias

- **Soporte de idioma limitado**: solo entrena con inglés de EE. UU., no soporta otros idiomas ni variantes.
- **Datos de entrenamiento reducidos**: se usó un subconjunto pequeño, lo que puede limitar la calidad de la voz y la generalización a textos fuera del dominio de MINDS-14 (interacciones de usuario en atención al cliente).
- **Riesgo de sobreajuste**: con solo 100 pasos de entrenamiento y un dataset pequeño, el modelo puede tener un rendimiento subóptimo en textos largos o de dominio general.
- **Licencia no especificada**: aunque el modelo base tiene MIT, el fine-tuning no declara licencia, lo que puede generar incertidumbre para uso comercial. Es recomendable contactar al autor para aclarar términos.
- **Sin evaluación de calidad subjetiva**: no se han publicado evaluaciones de calidad de voz (MOS, naturalidad), por lo que no se puede garantizar una calidad de síntesis alta.
- **Uso en producción**: no recomendado para aplicaciones críticas sin evaluar previamente el rendimiento en el dominio de destino.

## Enlaces

- [Página del modelo en HuggingFace](https://huggingface.co/herurg/speecht5-minds14-en-us-audio-course)
- [Repositorio oficial de SpeechT5 de Microsoft](https://github.com/microsoft/SpeechT5)
- [Blog de HuggingFace sobre SpeechT5](https://github.com/huggingface/blog/blob/main/speecht5.md)
- [Dataset PolyAI/minds14 en HuggingFace](https://huggingface.co/datasets/PolyAI/minds14)
