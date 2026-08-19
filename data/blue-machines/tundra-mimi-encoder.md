# blue-machines/tundra-mimi-encoder

## Resumen

Tundra Mimi Encoder es un codec neuronal de audio y voz publicado por Blue Machines, una plataforma de Voice AI orientada a agentes conversacionales. El modelo rehostea el checkpoint fine-tuneado de Svara Mimi Indic v3, que a su vez parte del codec base `kyutai/mimi` de Kyutai Labs. Su propósito es servir como extractor de características (encoder) para el entrenamiento de modelos de lenguaje de voz (speech-LLM), tanto en modo discreto (tokens semánticos) como continuo.

El modelo comprime audio a una tasa de 12,5 Hz con un bitrate de aproximadamente 1,1 kbps, utilizando una arquitectura encoder-decoder convolucional (SEANet) con procesamiento transformer y cuantización vectorial residual. El fine-tuning se ha realizado sobre el corpus IndicVoices-R, lo que mejora la representación de lenguas índicas frente al Mimi original. El repositorio contiene únicamente los pesos del encoder (`mimi_final.pt`, ~184 MB) y está pensado para integrarse en pipelines de entrenamiento de modelos de voz mediante la librería `transformers`.

La relevancia actual radica en que los codecs neuronales como Mimi son un componente esencial para los modelos generativos de voz (TTS, conversión de voz, agentes de voz), y este checkpoint ofrece una versión especializada en un grupo lingüístico con poca representación en los codecs genéricos.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Codec neuronal basado en SEANet (encoder-decoder convolucional) con transformer y cuantizador vectorial residual (RVQ) |
| Parametros totales | no disponible (archivo de pesos de ~184 MB en formato PyTorch) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (procesa audio en flujo continuo, no texto) |
| Tipos de cuantizacion | no aplica (los pesos se distribuyen en FP32/FP16; el modelo genera tokens cuantizados a 1,1 kbps) |
| Idiomas soportados | Enfocado en lenguas índicas (corpus IndicVoices-R); no se especifica lista exhaustiva |
| Licencia | Apache-2.0 |
| Formato de pesos | PyTorch `state_dict` (archivo `.pt`) |

## Arquitectura y entrenamiento

El modelo base `kyutai/mimi` emplea una arquitectura de codec neuronal con un encoder convolucional (derivado de SEANet) que transforma la forma de onda de audio en una representación latente, seguido de un procesador transformer y un cuantizador vectorial residual (RVQ). Este cuantizador produce dos flujos de tokens: uno semántico y otro acústico, lo que permite equilibrar la riqueza lingüística con la fidelidad acústica. La tasa de muestreo de tokens es de 12,5 Hz y el bitrate total es de 1,1 kbps.

El checkpoint `tundra-mimi-encoder` es el resultado de un fine-tuning sobre el corpus IndicVoices-R, realizado por los autores de Svara Mimi Indic v3. Este ajuste adapta el codec a las particularidades fonéticas y prosódicas de las lenguas índicas, mejorando la representación para tareas posteriores de síntesis o reconocimiento de voz. El repositorio indica que se usan 8 cuantizadores (frente a los 16 del Mimi original), lo que sugiere una configuración optimizada para el equilibrio entre compresión y calidad. El modelo puede operar en modo discreto (tokens semánticos) o continuo (representaciones latentes sin cuantizar), según se configure en el pipeline de entrenamiento.

## Capacidades

- Codificación de audio y voz en representaciones latentes de alta compresión (1,1 kbps, 12,5 Hz).
- Extracción de características semánticas y acústicas mediante doble flujo de tokens.
- Soporte para modo discreto (tokens cuantizados) y modo continuo (embeddings densos).
- Fine-tuning específico para lenguas índicas, mejorando la representación frente al Mimi genérico.
- Compatible con la librería `transformers` de Hugging Face (integración `MimiModel`).
- Diseñado para su uso como encoder congelado en el entrenamiento de modelos de lenguaje de voz (speech-LLM).
- Adecuado para tareas de generación de voz (TTS), conversión de voz y reconocimiento de voz como front-end de representación.

## Casos de uso

- Entrenamiento de modelos de lenguaje de voz (speech-LLM): el encoder se congela y se usa para convertir audio en tokens que alimentan un modelo autoregresivo de lenguaje. Es el caso de uso principal declarado por el autor.
- Síntesis de voz (TTS) multilingüe: al estar fine-tuneado para lenguas índicas, permite generar voz natural en idiomas como hindi, tamil, telugu, etc., con mayor fidelidad que un codec genérico.
- Reconocimiento de voz (ASR) como extractor de características: las representaciones semánticas pueden servir como entrada a un clasificador o a un modelo de atención para transcribir audio.
- Conversión de voz (voice conversion): el doble flujo (semántico + acústico) permite separar contenido lingüístico de características del hablante, facilitando la transferencia de voz entre locutores.
- Agentes de voz conversacionales: al integrarse en pipelines de agentes que procesan audio en tiempo real, el encoder proporciona una representación compacta que reduce la carga computacional en etapas posteriores.
- Análisis prosódico y lingüístico: los tokens semánticos pueden usarse para estudiar patrones de entonación, ritmo y acento en corpus de voz, especialmente en lenguas índicas.
- Aumento de datos para ASR: al generar representaciones latentes continuas, se pueden aplicar aumentos en el espacio latente (por ejemplo, interpolación o ruido) para crear variaciones sintéticas de entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye métricas de calidad de reconstrucción, precisión de reconocimiento ni comparativas con otros codecs. Se recomienda consultar la documentación de Svara Mimi Indic v3 o realizar evaluaciones propias según la tarea objetivo.

## Requisitos de hardware

- El archivo de pesos ocupa aproximadamente 184 MB, por lo que la inferencia del encoder es ligera.
- VRAM estimada: menos de 1 GB para inferencia en lote pequeño (el modelo es un codec, no un LLM).
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM (por ejemplo, NVIDIA GTX 1650, RTX 3060) es suficiente. También puede ejecutarse en CPU sin problemas para procesamiento por lotes pequeños.
- Compatible con consumer GPUs: sí, dado el pequeño tamaño del modelo.
- Opciones de despliegue: se puede cargar con `transformers` (MimiModel) en Python. No se mencionan integraciones específicas con vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje.
- Latencia y throughput estimados: no disponibles en la documentación proporcionada. Dada la arquitectura de codec, se espera una latencia de decenas de milisegundos en GPU moderna.

## Comparativa con modelos similares

| Modelo | Parámetros | Bitrate | Enfoque | Licencia |
|---|---|---|---|---|
| kyutai/mimi (base) | ~80M (estimado) | 1,1 kbps | Codec general de voz y audio | Apache-2.0 |
| tundra-mimi-encoder (este) | no disponible | 1,1 kbps | Fine-tune para lenguas índicas | Apache-2.0 |
| EnCodec (Meta) | ~7-70M según variante | 1,5-24 kbps | Codec general de audio | MIT (con restricciones) |
| DAC (Descript) | ~80-90M | 8 kbps | Codec de alta fidelidad | MIT |

Nota: los datos de parámetros de Mimi base son estimaciones basadas en información pública; no se dispone de una cifra oficial confirmada. El modelo Tundra se diferencia de EnCodec y DAC por su doble flujo semántico/acústico y su especialización en lenguas índicas.

## Limitaciones y advertencias

- Es únicamente un encoder: no incluye el decodificador, por lo que no puede reconstruir audio por sí solo. Para síntesis o reconstrucción se necesita el Mimi completo o un decodificador entrenado.
- Especialización en lenguas índicas: el fine-tuning puede degradar el rendimiento en otros idiomas, especialmente si se usa como reemplazo directo del Mimi genérico.
- La documentación no especifica la lista exacta de idiomas cubiertos por IndicVoices-R; se recomienda verificar la cobertura antes de usarlo en producción.
- El repositorio no incluye resultados de evaluación ni benchmarks, por lo que el rendimiento real en tareas concretas debe validarse de forma independiente.
- El archivo de pesos está en formato `.pt` (PyTorch), lo que puede requerir conversión si se utiliza con otros frameworks o herramientas de despliegue.
- Aunque la licencia es Apache-2.0, se pide citar a los autores originales de Svara Mimi Indic v3 al usar estos pesos, lo que debe tenerse en cuenta en la atribución de proyectos derivados.
- Al ser un modelo de codec, no es adecuado para tareas de comprensión semántica de texto; su función es exclusivamente la representación de audio.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/blue-machines/tundra-mimi-encoder
- Modelo base Mimi: https://huggingface.co/kyutai/mimi
- Checkpoint original fine-tuneado (Svara Mimi Indic v3): https://huggingface.co/mira-iitjmu/svara-mimi-indic-v3
- Documentación de Mimi en Transformers: https://huggingface.co/docs/transformers/model_doc/mimi
- Web de Blue Machines: https://bluemachines.ai/
