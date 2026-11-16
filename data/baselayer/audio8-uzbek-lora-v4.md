# BaseLayer/audio8-uzbek-lora-v4

## Resumen

Audio8-uzbek-lora-v4 es un adaptador LoRA para síntesis de voz (text-to-speech) en uzbeko, desarrollado por BaseLayer sobre el modelo base Edge0/Audio8-TTS-Realistic-Air. El adaptador especializa un sistema TTS multimodal previamente entrenado para generar habla en uzbeko conservando la capacidad de clonación de voz zero-shot a partir de un audio de referencia y su transcripción. Se publica como un repositorio PEFT de 1,6 GB con pesos en safetensors y licencia Apache 2.0.

El adaptador emplea un rango LoRA de 32 con alpha 64 aplicado sobre las capas autorregresivas del modelo base, entrenado durante 2 épocas con una tasa de aprendizaje de 0,0001 sobre un corpus de habla uzbeka de aproximadamente 40 horas más otros conjuntos de datos complementarios. La propuesta es relevante porque cubre un idioma de bajos recursos (uzbeko, código `uz`) dentro de un pipeline TTS moderno con clonación de voz, un nicho con pocas alternativas abiertas y con licencia permisiva.

El modelo está pensado para investigadores y desarrolladores que necesiten generar voz sintética en uzbeko con control sobre el timbre mediante audio de referencia. Al ser un adaptador, requiere cargar el modelo base y fusionar los pesos con PEFT antes de la inferencia, lo que condiciona los requisitos de hardware y despliegue.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre modelo TTS autorregresivo Edge0/Audio8-TTS-Realistic-Air |
| Parametros totales | no disponible (adaptador LoRA; el modelo base no declara cifra en la informacion disponible) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; el ejemplo de uso emplea bfloat16) |
| Idiomas soportados | uzbeko (`uz`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repositorio PEFT; incluye checkpoints intermedios, `adapters/final/`, `resume/` y `logs/`) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre un modelo TTS autorregresivo que genera códigos de audio y los decodifica a forma de onda mediante `decode_audio`. La configuración LoRA declarada es r=32, alpha=64, aplicada a las capas autorregresivas (`both` AR layers), con 2 épocas de entrenamiento y una tasa de aprendizaje de 0,0001. El proceso conserva la capacidad de clonación de voz zero-shot del modelo base, que recibe un audio de referencia y su transcripción junto con el texto a sintetizar.

Los datos de entrenamiento provienen de `BaseLayer/uzbek-speech-40h-retranscript`, `Beehzod/uzbek_speech_data` y `BaseLayer/uzbek-target-speaker`. El preprocesado recorta el silencio en los extremos de las muestras y reduce las pausas internas superiores a 0,45 s hasta 0,30 s. En aproximadamente el 90 % de las muestras la referencia corresponde a otra intervención del mismo hablante, lo que refuerza la consistencia del timbre durante la clonación. No se detalla en la información disponible si hubo etapas de RLHF, DPO ni el número total de tokens de audio procesados.

## Capacidades

- Síntesis de voz (text-to-speech) en uzbeko a partir de texto de entrada.
- Clonación de voz zero-shot mediante audio de referencia y su transcripción.
- Generación autorregresiva de códigos de audio con decodificación posterior a forma de onda.
- Control de muestreo en generación: temperatura, top-p, top-k y `max_new_tokens`.
- Ajuste de la intensidad del adaptador mediante escala LoRA (recomendada 1.0).
- Soporte de inferencia en bfloat16 sobre GPU.
- No se documentan en la información disponible capacidades de tool calling, agentes, razonamiento multi-paso, visión ni audio de entrada más allá de la referencia de clonación.

## Casos de uso

- Localización de contenido audiovisual al uzbeko: doblaje de vídeos, cursos o material formativo generando pistas de voz en uzbeko con un timbre consistente mediante el audio de referencia del hablante original o de un locutor autorizado.
- Asistentes de voz para atención al cliente en uzbeko: integración del adaptador en un pipeline TTS que convierta respuestas textuales de un chatbot en audio, usando una voz de marca clonada a partir de una muestra autorizada.
- Audiolibros y narración automatizada: conversión de texto largo a voz en uzbeko con control de prosodia mediante parámetros de muestreo y una referencia de locutor estable.
- Accesibilidad para hablantes de uzbeko: lectura en voz alta de documentos, noticias o interfaces para personas con discapacidad visual, aprovechando la licencia Apache 2.0 para uso comercial.
- Investigación en TTS de bajos recursos: evaluación de técnicas LoRA sobre modelos TTS multilingües para idiomas con pocos datos, usando los checkpoints intermedios y logs incluidos en el repositorio.
- Generación de voces sintéticas para prototipos de aplicaciones de voz: creación de demos y pruebas de concepto en uzbeko sin necesidad de entrenar un modelo TTS desde cero, fusionando el adaptador con el modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que la calidad se evaluó mediante escucha subjetiva, sin métricas objetivas (MOS, WER, similitud de hablante) ni comparaciones numéricas.

## Requisitos de hardware

- VRAM estimada: no disponible con precisión; el repositorio del adaptador ocupa 1,6 GB y el ejemplo de uso carga el modelo base en bfloat16 sobre CUDA, por lo que se requiere VRAM adicional para el modelo base completo (no cuantificada en la información disponible).
- GPU recomendadas: no disponible. El ejemplo oficial emplea `torch.bfloat16` y `.to("cuda")`, lo que exige una GPU con soporte de bfloat16 (por ejemplo, serie Ampere o posterior).
- Compatibilidad con GPU de consumo: no confirmada; depende del tamaño del modelo base, que no se especifica.
- Opciones de despliegue: `transformers` + `peft` (flujo documentado con `AutoModel`, `AutoProcessor` y `PeftModel`, seguido de `merge_and_unload()`). No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de TTS en uzbeko ni datos de rendimiento que permitan una comparación rigurosa con alternativas.

## Limitaciones y advertencias

- El adaptador solo cubre uzbeko (`uz`); no se documenta soporte de otros idiomas.
- No se han publicado métricas objetivas de calidad, latencia ni similitud de hablante; la evaluación es subjetiva.
- Riesgo de alucinación acústica y artefactos en la síntesis, habitual en modelos TTS autorregresivos, sin cuantificación disponible.
- La clonación de voz exige el consentimiento explícito del propietario de la voz, tal como advierte la model card.
- Las licencias de los datos de entrenamiento deben verificarse antes de un uso comercial, según indica el autor.
- El uso requiere cargar el modelo base `Edge0/Audio8-TTS-Realistic-Air` con `trust_remote_code=True`, lo que implica ejecutar código remoto y revisar su procedencia.
- La model card se titula "Uzbek LoRA v3" mientras que el identificador del repositorio es `v4`, lo que puede generar confusión sobre la versión exacta.
- El repositorio tiene 0 descargas y 1 like en el momento de la consulta, por lo que no hay evidencia comunitaria de validación.
- No se documentan sesgos específicos del modelo; al entrenarse con un conjunto limitado de hablantes, la diversidad de voces puede ser reducida.

## Enlaces

- Hugging Face: https://huggingface.co/BaseLayer/audio8-uzbek-lora-v4
- Modelo base: https://huggingface.co/Edge0/Audio8-TTS-Realistic-Air
- Dataset de entrenamiento: https://huggingface.co/datasets/BaseLayer/uzbek-speech-40h-retranscript
- Dataset de entrenamiento: https://huggingface.co/datasets/Beehzod/uzbek_speech_data
- Dataset de entrenamiento: https://huggingface.co/datasets/BaseLayer/uzbek-target-speaker
- Librería PEFT: https://github.com/huggingface/peft
