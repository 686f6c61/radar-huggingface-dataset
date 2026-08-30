# marafx2007/Fun-CosyVoice3-0.5B-2512

## Resumen

Fun-CosyVoice3-0.5B-2512 es un sistema de síntesis de voz (text-to-speech, TTS) basado en modelos de lenguaje de gran escala (LLM), desarrollado por el equipo FunAudioLLM en el marco de la serie CosyVoice. Es la tercera generación de esta familia, diseñada para síntesis de voz cero-shot multilingüe en entornos reales, superando a su predecesor CosyVoice 2.0 en consistencia de contenido, similitud de la voz del hablante y naturalidad prosódica. El modelo cuenta con 0,5 mil millones de parámetros y soporta nueve idiomas comunes (chino, inglés, japonés, coreano, alemán, español, francés, italiano y ruso), además de más de 18 dialectos y acentos del chino. Su relevancia actual radica en que ofrece una calidad competitiva frente a sistemas propietarios, con licencia Apache 2.0, y añade funcionalidades avanzadas como inpainting de pronunciación, normalización de texto sin módulo frontal tradicional y streaming bidireccional con latencia mínima de 150 ms. La arquitectura se basa en un LLM que genera tokens de audio, seguido de un decodificador de flujo (flow matching) para producir la forma de onda final.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LLM + decodificador de flujo (flow matching) para TTS, basado en transformer |
| Parametros totales | 0,5 mil millones |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (se menciona streaming con latencia de 150 ms) |
| Tipos de cuantizacion | no especificado (se distribuye en safetensors y onnx) |
| Idiomas soportados | zh, en, fr, es, ja, ko, it, ru, de (9 idiomas) y 18+ dialectos chinos |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, onnx |

## Arquitectura y entrenamiento

La arquitectura de Fun-CosyVoice3 sigue el paradigma de CosyVoice: un modelo de lenguaje autoregresivo que genera tokens de audio discretos a partir del texto y de una referencia de voz (para clonación cero-shot), seguido de un modelo de flujo (flow matching) que convierte esos tokens en mel-espectrogramas y, finalmente, un vocoder para obtener la onda. En esta versión 3.0 se introducen mejoras en la consistencia del contenido y la naturalidad, así como la capacidad de inpainting de pronunciación mediante Pinyin chino y fonemas CMU del inglés, lo que permite corregir o especificar pronunciaciones concretas. Además, el modelo integra normalización de texto (lectura de números, símbolos y formatos variados) sin necesidad de un frontend tradicional, y soporta instrucciones en lenguaje natural para controlar idioma, dialecto, emoción, velocidad y volumen. El entrenamiento incluye una variante con aprendizaje por refuerzo (RL) que mejora aún más los resultados en benchmarks, como se observa en la tabla de evaluación. No se detallan la cantidad de tokens de entrenamiento ni la composición exacta del dataset, aunque se sabe que está orientado a la síntesis multilingüe y a la clonación de voz en entornos no controlados.

## Capacidades

- Síntesis de voz multilingüe: genera habla natural en nueve idiomas (chino, inglés, japonés, coreano, alemán, español, francés, italiano y ruso) con clonación de voz cero-shot.
- Clonación de voz: permite replicar la voz de un hablante a partir de una grabación de referencia corta (hasta 30 segundos en la demo).
- Inpainting de pronunciación: soporta la corrección o especificación de pronunciaciones mediante Pinyin chino y fonemas CMU del inglés, útil para nombres propios o términos técnicos.
- Normalización de texto integrada: lee números, símbolos especiales y formatos variados sin depender de un módulo frontal externo.
- Control por instrucciones: acepta comandos en lenguaje natural para ajustar idioma, dialecto, emoción, velocidad y volumen.
- Streaming bidireccional: admite tanto entrada de texto en streaming como salida de audio en streaming, con una latencia mínima de 150 ms y calidad de audio alta.
- Soporte de dialectos chinos: cubre más de 18 variedades, como cantonés, minnan, sichuanés, dongbei, shanxi, shanghainés, tianjin, shandong, ningxia, gansu, entre otros.

## Casos de uso

- Atención al cliente automatizada multilingüe: el modelo puede generar respuestas de voz naturales en varios idiomas a partir de texto, integrable en sistemas IVR o chatbots telefónicos. Su capacidad de clonación de voz permite mantener una identidad de marca consistente.
- Locución para vídeo y contenido multimedia: creadores de contenido pueden generar narraciones en múltiples idiomas sin contratar actores de voz, usando clonación de voz para mantener la misma voz en todas las versiones.
- Audiolibros y podcasts: la síntesis de voz con control prosódico y emocional facilita la producción de audiolibros a gran escala, con opción de corregir pronunciaciones mediante inpainting.
- Asistentes de voz y dispositivos inteligentes: su baja latencia de streaming (150 ms) y soporte de instrucciones lo hacen adecuado para asistentes interactivos que requieren respuestas rápidas y naturales.
- Accesibilidad: puede convertir texto en voz para personas con discapacidad visual o dificultades de lectura, con soporte multilingüe y dialectal.
- Doblaje automático de contenido audiovisual: la clonación de voz cero-shot y el control de emociones permiten doblar películas o series manteniendo la voz original del actor, con sincronización labial aproximada.
- Educación y aprendizaje de idiomas: el modelo puede generar ejemplos de pronunciación en distintos idiomas y dialectos, útil para aplicaciones de enseñanza de idiomas o práctica de entonación.

## Benchmarks y rendimiento

Según la tabla de evaluación publicada por los autores (test-zh y test-en del conjunto CV3-Eval), Fun-CosyVoice3-0.5B-2512 obtiene los siguientes resultados, comparados con otros modelos:

| Modelo | Tamano | test-zh CER (%) ↓ | test-zh Similitud (%) ↑ | test-en WER (%) ↓ | test-en Similitud (%) ↑ | test-hard CER (%) ↓ | test-hard Similitud (%) ↑ |
|---|---|---|---|---|---|---|---|
| Human | - | 1,26 | 75,5 | 2,14 | 73,4 | - | - |
| Seed-TTS (cerrado) | - | 1,12 | 79,6 | 2,25 | 76,2 | 7,59 | 77,6 |
| MiniMax-Speech (cerrado) | - | 0,83 | 78,3 | 1,65 | 69,2 | - | - |
| F5-TTS | 0,3B | 1,52 | 74,1 | 2,00 | 64,7 | 8,67 | 71,3 |
| Spark TTS | 0,5B | 1,2 | 66,0 | 1,98 | 57,3 | - | - |
| CosyVoice2 | 0,5B | 1,45 | 75,7 | 2,57 | 65,9 | 6,83 | 72,4 |
| FireRedTTS2 | 1,5B | 1,14 | 73,2 | 1,95 | 66,5 | - | - |
| Index-TTS2 | 1,5B | 1,03 | 76,5 | 2,23 | 70,6 | 7,12 | 75,5 |
| VibeVoice-1.5B | 1,5B | 1,16 | 74,4 | 3,04 | 68,9 | - | - |
| VibeVoice-Realtime | 0,5B | - | - | 2,05 | 63,3 | - | - |
| HiggsAudio-v2 | 3B | 1,50 | 74,0 | 2,44 | 67,7 | - | - |
| VoxCPM | 0,5B | 0,93 | 77,2 | 1,85 | 72,9 | 8,87 | 73,0 |
| GLM-TTS | 1,5B | 1,03 | 76,1 | - | - | - | - |
| GLM-TTS RL | 1,5B | 0,89 | 76,4 | - | - | - | - |
| **Fun-CosyVoice3-0.5B-2512** | **0,5B** | **1,21** | **78,0** | **2,24** | **71,8** | **6,71** | **75,8** |
| **Fun-CosyVoice3-0.5B-2512_RL** | **0,5B** | **0,81** | **77,4** | **1,68** | **69,5** | **5,44** | **75,0** |

La versión RL (entrenada con aprendizaje por refuerzo) supera a todos los modelos abiertos en CER para chino (0,81) y obtiene el mejor WER en inglés entre los abiertos (1,68), con una similitud de hablante competitiva. La versión base también se sitúa en el nivel superior de los modelos abiertos.

## Requisitos de hardware

- VRAM estimada para inferencia: con 0,5 mil millones de parámetros, en precisión FP16 los pesos ocupan aproximadamente 1 GB. El repositorio de 9,7 GB incluye modelos en múltiples formatos (safetensors, onnx) y posiblemente el vocoder y otros componentes. Para inferencia en tiempo real se recomienda al menos 4 GB de VRAM para dejar margen a activaciones y buffers, aunque podría funcionar con menos en CPU con cuantización.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM, como NVIDIA GTX 1650/1660, RTX 3050, RTX 4060, o superiores. Para despliegues de alto rendimiento se pueden usar A100, H100 o RTX 4090.
- Compatibilidad con GPUs de consumo: sí, el modelo es lo suficientemente pequeño para ejecutarse en GPUs de gama media, incluso en tiempo real.
- Opciones de despliegue: el repositorio de CosyVoice incluye scripts de inferencia, soporte para vLLM (en CosyVoice2) y se menciona soporte de Triton TRT-LLM. También hay un espacio de Hugging Face para probarlo en línea. Se puede desplegar con FastAPI para servidores.
- Latencia y throughput: el modo bi-streaming alcanza una latencia mínima de 150 ms. No se proporcionan cifras de throughput, pero al ser un modelo de 0,5B, se espera un factor de tiempo real (RTF) inferior a 1 en GPUs modernas.

## Comparativa con modelos similares

Comparación con otros modelos TTS abiertos de tamaño similar (0,5B):

| Modelo | Tamano | Idiomas | Licencia | Contexto | Clonacion de voz | Streaming | Puntos destacables |
|---|---|---|---|---|---|---|---|
| Fun-CosyVoice3-0.5B-2512 | 0,5B | 9 idiomas + dialectos | Apache 2.0 | No especificado | Sí, cero-shot | Sí (150 ms) | Inpainting de pronunciación, instrucciones, normalización de texto |
| CosyVoice2-0.5B | 0,5B | 9 idiomas | Apache 2.0 | No especificado | Sí, cero-shot | Sí | Predecesor, sin inpainting ni instrucciones avanzadas |
| Spark TTS | 0,5B | Multilingüe (no detallado) | Apache 2.0 | No especificado | Sí | No especificado | Rendimiento inferior en similitud (57,3% en inglés) |
| VoxCPM | 0,5B | Multilingüe | Apache 2.0 | No especificado | Sí | No especificado | Mejor CER en chino (0,93) pero peor en test-hard (8,87) |

Fun-CosyVoice3 destaca por su equilibrio entre calidad de contenido (CER/WER) y similitud de hablante, además de las funcionalidades adicionales de control y streaming que no ofrecen todos los competidores.

## Limitaciones y advertencias

- No se han documentado sesgos específicos, pero como modelo de TTS entrenado con datos web, puede reflejar sesgos de género, edad o acento presentes en los datos de entrenamiento.
- Riesgo de alucinación en la pronunciación de textos ambiguos o con nombres propios poco frecuentes; el inpainting de pronunciación mitiga parcialmente este problema al permitir especificar fonemas.
- La longitud de contexto no está publicada; aunque admite streaming, no se especifica el límite máximo de texto de entrada.
- El soporte de dialectos chinos está limitado a los mencionados; otros dialectos pueden no funcionar correctamente.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda revisar los términos de los modelos subyacentes (por ejemplo, el vocoder o el tokenizador de audio) si se redistribuyen componentes.
- Para producción, es necesario validar la calidad en el dominio específico (ruido, acentos, velocidades) ya que los benchmarks se realizan en condiciones controladas.
- El repositorio de Hugging Face (marafx2007) parece ser un espejo no oficial; se recomienda usar el repositorio oficial FunAudioLLM/Fun-CosyVoice3-0.5B-2512 para garantizar la integridad de los pesos.

## Enlaces

- Repositorio oficial en Hugging Face: https://huggingface.co/FunAudioLLM/Fun-CosyVoice3-0.5B-2512
- Repositorio espejo en Hugging Face (marafx2007): https://huggingface.co/marafx2007/Fun-CosyVoice3-0.5B-2512
- Página de demos: https://funaudiollm.github.io/cosyvoice3/
- Paper (arXiv 2505.17589): https://arxiv.org/abs/2505.17589
- Paper CosyVoice 2.0 (arXiv 2412.10117): https://arxiv.org/abs/2412.10117
- Paper CosyVoice 1.0 (arXiv 2407.05407): https://arxiv.org/abs/2407.05407
- Repositorio de código en GitHub: https://github.com/FunAudioLLM/CosyVoice
- Modelo en ModelScope: https://www.modelscope.cn/models/FunAudioLLM/Fun-CosyVoice3-0.5B-2512
- Conjunto de evaluación CV3-Eval: https://github.com/FunAudioLLM/CV3-Eval
- Espacio de Hugging Face para probar el modelo: https://huggingface.co/spaces/FunAudioLLM/Fun-CosyVoice3-0.5B
