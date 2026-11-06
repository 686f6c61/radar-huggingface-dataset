# ayeeyokoris/MOSS-TTS-Nano-Somali

## Resumen

MOSS-TTS-Nano-Somali es un modelo de síntesis de voz (text-to-speech) y clonación de voz ajustado específicamente para el idioma somalí. Lo publica el usuario ayeeyokoris en Hugging Face como un fine-tuning del modelo base MOSS-TTS-Nano, desarrollado por MOSI.AI y el equipo OpenMOSS. El modelo resuelve la carencia de sistemas TTS de calidad para una lengua de bajos recursos como el somalí, ofreciendo generación de audio y clonación de voz con grabaciones de referencia de entre 3 y 10 segundos.

Arquitectura de tipo transformer con 142.477.056 parámetros totales, lo que lo sitúa en la categoría de modelos "nano" orientados a inferencia en tiempo real. El modelo base está diseñado para ejecutarse incluso en CPU sin GPU, lo que reduce los requisitos de despliegue. La licencia Apache 2.0 permite uso comercial sin restricciones adicionales significativas.

Es relevante ahora porque cubre un hueco en el ecosistema de voz para lenguas africanas de bajos recursos, y porque el fine-tuning sobre un modelo base pequeño y abierto facilita su integración en aplicaciones locales, demos y productos ligeros sin depender de infraestructura de GPU dedicada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (MOSS-TTS-Nano, modelo base de MOSI.AI/OpenMOSS) |
| Parámetros totales | 142.477.056 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | somalí (so) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, PyTorch (custom_code) |

## Arquitectura y entrenamiento

El modelo se basa en MOSS-TTS-Nano, un generador de voz multilingüe de aproximadamente 0,1B de parámetros del equipo OpenMOSS y MOSI.AI, diseñado para generación de voz en tiempo real y ejecutable en CPU. La implementación en Hugging Face requiere `trust_remote_code=True`, lo que indica que el modelo incluye código personalizado para su arquitectura y su método de inferencia (`model.inference(...)`), con modos diferenciados de continuación y clonación de voz.

No se dispone de información detallada sobre el proceso de entrenamiento del fine-tuning somalí: no se especifican el número de tokens, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. El autor mantiene un dataset asociado en Hugging Face (`ayeeyokoris/somali-speech-asr-moss-nano-8cb-dedup`, con unas 64.100 muestras según los resultados de búsqueda), que probablemente se usó para el ajuste, aunque la model card no lo confirma explícitamente. La innovación destacable es la adaptación de un modelo TTS pequeño y eficiente a una lengua de bajos recursos, con soporte de clonación de voz mediante audio de referencia corto.

## Capacidades

- Generación de voz a partir de texto en somalí (modo `continuation`).
- Clonación de voz a partir de una grabación de referencia de 3 a 10 segundos (modo `voice_clone`).
- Generación de audio en formato WAV como salida.
- Control del número máximo de frames de audio generados (`max_new_frames`).
- Muestreo estocástico configurable (`do_sample`).
- Inferencia en CPU o GPU (selección automática mediante `torch.cuda.is_available()`).
- No se documenta soporte de tool calling, agentes, razonamiento multi-paso, visión ni audio de entrada más allá de la referencia de clonación.
- Capacidad multilingüe limitada al somalí en este fine-tuning.

## Casos de uso

- Accesibilidad para personas con discapacidad visual: lectura en voz alta de textos en somalí en aplicaciones móviles o de escritorio, aprovechando que el modelo puede ejecutarse en CPU sin GPU dedicada.
- Locución automatizada de contenidos: generación de audio para noticias, artículos o materiales educativos en somalí, con la posibilidad de clonar la voz de un locutor de referencia para mantener consistencia de marca.
- Asistentes de voz para atención al ciudadano: integración en sistemas de información pública o servicios telefónicos en somalí, donde la latencia baja del modelo base permite respuestas en tiempo real.
- Doblaje y localización de vídeos: clonación de la voz de un hablante original para generar pistas de audio en somalí preservando el timbre, útil en producción audiovisual de bajo presupuesto.
- Aplicaciones educativas de aprendizaje de idiomas: generación de ejemplos de pronunciación y frases de práctica en somalí con voces naturales y variadas mediante clonación.
- Prototipado rápido y demos: despliegue local en portátiles o entornos sin GPU para validar productos de voz en somalí antes de invertir en infraestructura mayor.
- Sistemas de megafonía o anuncios automatizados: síntesis de avisos en somalí para transporte, comercios o eventos, con generación de audio bajo demanda.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial; con 142,5M de parámetros, en FP32 ocuparía aproximadamente 0,57 GB de pesos, y en FP16 unos 0,28 GB, a lo que habría que sumar memoria para activaciones y el códec de audio.
- GPU recomendadas: no se especifican; el modelo base está pensado para ejecutarse en CPU, por lo que cualquier GPU consumer moderna (por ejemplo, RTX 3060 o superior) sería más que suficiente.
- Cabe en GPU consumer: sí, con amplio margen, dado el reducido tamaño del modelo.
- Opciones de despliegue: la model card solo documenta uso mediante `transformers` con `trust_remote_code=True`; no se confirma soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; el modelo base MOSS-TTS-Nano se describe como apto para generación de voz en tiempo real en CPU, pero no se aportan cifras concretas para este fine-tuning.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MOSS-TTS-Nano-Somali | 142,5M | no disponible | somalí | Apache 2.0 | Hugging Face |
| MOSS-TTS-Nano (base) | ~100M | no disponible | multilingüe | no disponible en la información | GitHub / Hugging Face |
| Alternativas TTS para lenguas de bajos recursos | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información suficiente para comparar con modelos TTS específicos del somalí ni con alternativas de tamaño similar con datos verificables.

## Limitaciones y advertencias

- Modelo altamente especializado: solo genera voz en somalí; no es adecuado para otros idiomas.
- Riesgo de alucinación acústica: como todo modelo generativo de audio, puede producir pronunciaciones incorrectas, artefactos o prosodia poco natural en textos fuera de distribución.
- Clonación de voz: requiere consentimiento explícito de la persona cuya voz se clona; su uso indebido plantea riesgos éticos y legales (suplantación, fraude).
- Sesgos: al entrenarse con un dataset concreto de habla somalí, puede reproducir sesgos de género, dialecto o registro de los hablantes de dicho corpus.
- Sin benchmarks publicados: no hay métricas objetivas de calidad (MOS, WER, similitud de voz) que permitan evaluar su rendimiento frente a alternativas.
- Requiere `trust_remote_code=True`: ejecuta código personalizado del repositorio, lo que implica revisar el código antes de usarlo en producción.
- Licencia Apache 2.0: permite uso comercial, pero conviene verificar las licencias del modelo base y de los datos de entrenamiento.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: modelo muy reciente y sin validación comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ayeeyokoris/MOSS-TTS-Nano-Somali
- Dataset asociado del autor: https://huggingface.co/ayeeyokoris/datasets
- Repositorio del modelo base MOSS-TTS-Nano: https://github.com/OpenMOSS/MOSS-TTS-Nano
