# FunAudioLLM/Fun-CosyVoice3-0.5B-2512

## Resumen

Fun-CosyVoice3-0.5B-2512 es un sistema de sintesis de voz (text-to-speech, TTS) de ultima generacion desarrollado por FunAudioLLM, el equipo de Alibaba responsable de la serie CosyVoice. Se trata de la tercera generacion de la familia CosyVoice, un sistema TTS basado en modelos de lenguaje de gran tamano (LLM) que supera a su predecesor (CosyVoice 2.0) en consistencia de contenido, similitud del hablante y naturalidad prosodica. El modelo esta disenado para sintesis de voz zero-shot multilingue en entornos reales, con una cobertura de 9 idiomas y mas de 18 dialectos del chino.

El modelo tiene aproximadamente 0.5B parametros y se distribuye bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones. Su arquitectura combina un LLM de audio con un flujo de coincidencia (flow matching) para generar voz de alta calidad. Entre sus caracteristicas destacadas se incluyen el soporte de reparacion de pronunciacion (pronunciation inpainting) mediante pinyin chino y fonemas CMU ingleses, normalizacion de texto sin modulo frontend tradicional, y modo bi-streaming que permite latencias de hasta 150 ms. Tambien existe una variante entrenada con aprendizaje por refuerzo (RL) que mejora aun mas las metricas de calidad.

La relevancia de este modelo radica en que es uno de los pocos sistemas TTS open source que compite directamente con soluciones propietarias como Seed-TTS o MiniMax-Speech, ofreciendo un rendimiento comparable en metricas de consistencia de contenido y similitud del hablante, con la ventaja de ser completamente abierto y reproducible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LLM de audio + flow matching (CosyVoice 3.0) |
| Parametros totales | 0.5B (aproximadamente) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | chino, ingles, frances, espanol, japones, coreano, italiano, ruso, aleman; mas de 18 dialectos del chino (cantones, minnan, sichuan, dongbei, shanxi, shanghai, tianjin, shandong, ningxia, gansu, etc.) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, onnx |

## Arquitectura y entrenamiento

Fun-CosyVoice3-0.5B-2512 se basa en la arquitectura CosyVoice 3.0, que combina un modelo de lenguaje de gran tamano (LLM) para modelar la secuencia de tokens de voz con un modulo de flow matching para la generacion del audio final. Esta arquitectura hibrida permite capturar la prosodia y las caracteristicas del hablante a traves del LLM, mientras que el flujo de coincidencia se encarga de sintetizar una forma de onda de alta calidad. El modelo opera a 25 Hz de frecuencia de fotogramas, lo que supone una mejora respecto a generaciones anteriores.

El entrenamiento se realizo con datos multilingues que cubren los 9 idiomas soportados y multiples dialectos del chino. El modelo base se complementa con una variante entrenada mediante aprendizaje por refuerzo (RL) que mejora las metricas de consistencia de contenido y similitud del hablante. Entre las innovaciones tecnicas destacan la reparacion de pronunciacion (pronunciation inpainting) mediante pinyin y fonemas CMU, la normalizacion de texto integrada que elimina la necesidad de un modulo frontend tradicional, y el soporte de bi-streaming tanto para entrada de texto como para salida de audio, alcanzando latencias de hasta 150 ms sin sacrificar la calidad del audio.

## Capacidades

- Sintesis de voz zero-shot multilingue: puede clonar la voz de un hablante a partir de una muestra de referencia de pocos segundos y sintetizar voz en cualquiera de los 9 idiomas soportados, incluyendo mezclas cross-linguales.
- Soporte de dialectos del chino: cubre mas de 18 dialectos y acentos, incluyendo canton, minnan, sichuan, dongbei, shanxi, shanghai, tianjin, shandong, ningxia y gansu.
- Reparacion de pronunciacion: permite corregir la pronunciacion de palabras especificas mediante pinyin chino o fonemas CMU ingleses, ofreciendo un control fino sobre la salida.
- Normalizacion de texto integrada: lee numeros, simbolos especiales y diversos formatos de texto sin necesidad de un modulo frontend externo.
- Modo streaming bidireccional: soporta tanto entrada de texto en streaming como salida de audio en streaming, con latencias de hasta 150 ms.
- Control por instrucciones: acepta instrucciones en lenguaje natural para controlar idioma, dialecto, emocion, velocidad y volumen de la voz generada.
- Generacion de voz expresiva: produce habla con prosodia natural y consistencia de contenido de nivel SOTA, comparable a sistemas propietarios.

## Casos de uso

- Atencion al cliente multilingue automatizada: el modelo puede generar respuestas de voz en 9 idiomas con clonacion de voz zero-shot, permitiendo que un mismo sistema de atencion al cliente atienda a usuarios de diferentes paises con una voz consistente y natural.
- Creacion de contenido para e-learning: permite generar narraciones educativas en multiples idiomas y dialectos a partir de texto, con la posibilidad de corregir la pronunciacion de terminos tecnicos mediante la reparacion de pronunciacion.
- Audiolibros y podcasts automatizados: la normalizacion de texto integrada y la generacion de voz natural hacen que sea adecuado para convertir libros y articulos en audio de alta calidad sin intervencion humana.
- Doblaje de videojuegos y animacion: la clonacion de voz zero-shot y el soporte de instrucciones de emocion permiten generar dialogos con diferentes voces y estados emocionales a partir de texto, reduciendo el coste de produccion.
- Asistentes de voz en tiempo real: el modo bi-streaming con latencia de 150 ms lo hace adecuado para asistentes de voz interactivos que requieren respuestas rapidas y naturales.
- Accesibilidad para personas con discapacidad visual: puede convertir texto digital en voz natural en multiples idiomas, mejorando el acceso a la informacion para usuarios con discapacidad visual.
- Traduccion audiovisual cross-lingual: la capacidad de clonar la voz del hablante original y sintetizar en otro idioma permite crear versiones dobladas de videos manteniendo la identidad vocal del orador.
- Pruebas de productos TTS en produccion: la licencia Apache 2.0 y la disponibilidad de scripts de entrenamiento e inferencia permiten integrar el modelo en pipelines de produccion y fine-tuning para casos de uso especificos.

## Benchmarks y rendimiento

La siguiente tabla muestra los resultados de evaluacion publicados en la model card del modelo, comparando Fun-CosyVoice3-0.5B-2512 con otros sistemas TTS. Las metricas son CER (Character Error Rate, menor es mejor) y similitud del hablante (mayor es mejor).

| Modelo | Open-Source | Tamano | test-zh CER (%) ↓ | test-zh Similitud (%) ↑ | test-en WER (%) ↓ | test-en Similitud (%) ↑ | test-hard CER (%) ↓ | test-hard Similitud (%) ↑ |
|---|---|---|---|---|---|---|---|---|
| Humano | - | - | 1.26 | 75.5 | 2.14 | 73.4 | - | - |
| Seed-TTS | No | - | 1.12 | 79.6 | 2.25 | 76.2 | 7.59 | 77.6 |
| MiniMax-Speech | No | - | 0.83 | 78.3 | 1.65 | 69.2 | - | - |
| F5-TTS | Si | 0.3B | 1.52 | 74.1 | 2.00 | 64.7 | 8.67 | 71.3 |
| Spark TTS | Si | 0.5B | 1.2 | 66.0 | 1.98 | 57.3 | - | - |
| CosyVoice2 | Si | 0.5B | 1.45 | 75.7 | 2.57 | 65.9 | 6.83 | 72.4 |
| FireRedTTS2 | Si | 1.5B | 1.14 | 73.2 | 1.95 | 66.5 | - | - |
| Index-TTS2 | Si | 1.5B | 1.03 | 76.5 | 2.23 | 70.6 | 7.12 | 75.5 |
| VibeVoice-1.5B | Si | 1.5B | 1.16 | 74.4 | 3.04 | 68.9 | - | - |
| VibeVoice-Realtime | Si | 0.5B | - | - | 2.05 | 63.3 | - | - |
| HiggsAudio-v2 | Si | 3B | 1.50 | 74.0 | 2.44 | 67.7 | - | - |
| VoxCPM | Si | 0.5B | 0.93 | 77.2 | 1.85 | 72.9 | 8.87 | 73.0 |
| GLM-TTS | Si | 1.5B | 1.03 | 76.1 | - | - | - | - |
| GLM-TTS RL | Si | 1.5B | 0.89 | 76.4 | - | - | - | - |
| Fun-CosyVoice3-0.5B-2512 | Si | 0.5B | 1.21 | 78.0 | 2.24 | 71.8 | 6.71 | 75.8 |
| Fun-CosyVoice3-0.5B-2512_RL | Si | 0.5B | 0.81 | 77.4 | 1.68 | 69.5 | 5.44 | 75.0 |

La variante RL del modelo (Fun-CosyVoice3-0.5B-2512_RL) logra los mejores resultados entre los modelos open source en test-zh CER (0.81%) y test-en WER (1.68%), superando incluso a sistemas propietarios como Seed-TTS en test-zh y acercandose a MiniMax-Speech en test-en.

## Requisitos de hardware

- El tamano del repositorio es de 11.8 GB, lo que incluye los pesos del modelo base, la variante RL y posiblemente recursos adicionales como el modulo ttsfrd.
- Para inferencia en GPU consumer, se estima que el modelo base de 0.5B puede ejecutarse en GPUs con al menos 8-12 GB de VRAM dependiendo de la cuantizacion y el tamano de lote.
- GPUs recomendadas: RTX 3090/4090 (24 GB) para inferencia comoda con contexto largo y procesamiento por lotes; A100 o H100 para despliegues de produccion con alta concurrencia.
- El modelo puede ejecutarse en CPU para inferencia no interactiva, aunque con mayor latencia.
- Opciones de despliegue: el repositorio oficial de CosyVoice incluye scripts de inferencia, soporte para vLLM (anadido en 2025/05 para CosyVoice2), soporte para Triton/TensorRT-LLM (contribucion de NVIDIA), y un servidor FastAPI. Tambien se puede integrar con ModelScope para despliegue en la nube.
- La latencia en modo streaming puede alcanzar los 150 ms, lo que permite aplicaciones en tiempo real.

## Comparativa con modelos similares

| Modelo | Tamano | Idiomas | Licencia | Contexto | Puntos fuertes |
|---|---|---|---|---|---|
| Fun-CosyVoice3-0.5B-2512 | 0.5B | 9 idiomas + 18 dialectos | Apache 2.0 | no disponible | Mejor CER en test-hard entre open source; reparacion de pronunciacion; bi-streaming |
| CosyVoice2-0.5B | 0.5B | 6 idiomas | Apache 2.0 | no disponible | Predecesor, menor calidad en similitud del hablante |
| VoxCPM | 0.5B | no disponible | no disponible | no disponible | Mejor CER en test-zh (0.93) pero peor en test-hard (8.87) |
| Index-TTS2 | 1.5B | no disponible | no disponible | no disponible | Buen equilibrio entre CER y similitud, pero mayor tamano |
| Seed-TTS | no disponible | no disponible | Propietario | no disponible | Mejor similitud del hablante en test-en, pero no es open source |

Fun-CosyVoice3-0.5B-2512 destaca entre los modelos open source por su equilibrio entre tamano (0.5B), cobertura de idiomas y dialectos, y rendimiento en el conjunto de evaluacion test-hard, que es el mas exigente. La variante RL supera a todos los modelos open source en CER/WER y se acerca a los sistemas propietarios.

## Limitaciones y advertencias

- La cobertura de dialectos del chino, aunque amplia (18+), puede no incluir todos los dialectos regionales, y la calidad puede variar entre dialectos menos representados en los datos de entrenamiento.
- La clonacion de voz zero-shot requiere una muestra de referencia de calidad; muestras con ruido o de baja calidad pueden degradar la similitud del hablante.
- Aunque el modelo soporta 9 idiomas, el rendimiento puede ser inferior en idiomas con menos datos de entrenamiento, como italiano o ruso, en comparacion con chino e ingles.
- La reparacion de pronunciacion requiere conocimientos de pinyin chino o fonemas CMU, lo que puede suponer una barrera para usuarios sin formacion linguistica.
- El modelo puede presentar alucinaciones o errores de pronunciacion en textos complejos, especialmente con nombres propios extranjeros o terminos tecnicos poco frecuentes.
- El modo streaming con latencia de 150 ms puede requerir hardware especifico (GPU) y una configuracion optimizada para alcanzar ese rendimiento en produccion.
- La licencia Apache 2.0 permite uso comercial, pero es recomendable revisar los terminos de la licencia para asegurar el cumplimiento en productos derivados.
- El repositorio incluye el modulo ttsfrd (text normalization) como recurso adicional; es necesario descargarlo e instalarlo por separado para obtener la mejor normalizacion de texto.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/FunAudioLLM/Fun-CosyVoice3-0.5B-2512
- Repositorio GitHub (CosyVoice): https://github.com/QwenAudio/CosyVoice
- Pagina de demos CosyVoice 3.0: https://funaudiollm.github.io/cosyvoice3/
- Paper CosyVoice 3.0 (arXiv): https://arxiv.org/abs/2505.17589
- Paper CosyVoice 2.0 (arXiv): https://arxiv.org/abs/2412.10117
- Paper CosyVoice 1.0 (arXiv): https://arxiv.org/abs/2407.05407
- Modelo en ModelScope: https://www.modelscope.cn/models/FunAudioLLM/Fun-CosyVoice3-0.5B-2512
- Conjunto de evaluacion CV3-Eval: https://github.com/FunAudioLLM/CV3-Eval
- Demos CosyVoice 2.0: https://funaudiollm.github.io/cosyvoice2/
- Demos CosyVoice 1.0: https://fun-audio-llm.github.io
