# scholzmx/underdog-bark-3.0-clean-gguf

## Resumen

Underdog Bark 3.0 Clean es un modelo de reconocimiento automático del habla (ASR) en inglés desarrollado por Conway Research, afinado a partir de nvidia/parakeet-tdt-0.6b-v3. Su particularidad es que no transcribe de forma literal: elimina muletillas ("um", "uh", "you know"), falsos arranques y palabras repetidas, de modo que la salida es un texto limpio y legible en lugar de una transcripción verbatim. Está pensado para dictado y para generar texto listo para consumo humano o para etapas posteriores de procesamiento.

El repositorio que nos ocupa, scholzmx/underdog-bark-3.0-clean-gguf, no es el modelo original sino una conversión al formato GGUF con cuantización Q4_0/Q8_0, empaquetada para el motor Starling (contrato de tensores propio, distinto de llama.cpp y whisper.cpp) y orientada a ejecución en teléfono. El artefacto principal ocupa 364 MB y el modelo declara 627.090.606 parámetros, por lo que la inferencia es viable en CPU y en dispositivos móviles vía Vulkan.

La relevancia práctica está en el binomio tamaño/prestaciones: un ASR de 0,6B con un WER de 7,31 % en FLEURS en_us (normalización Starling) y 4,85 % (normalización Whisper) que cabe en un móvil y funciona sin conexión. La contrapartida es que su licencia CC-BY-4.0 exige atribución y que la cuantización no es gratuita: degrada 0,34 puntos de WER frente a la conversión sin pérdida.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastConformer (encoder) + TDT (transducer, token-and-duration transducer) |
| Parametros totales | 627.090.606 |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no disponible (modelo ASR; la ventana de audio no se especifica en la información proporcionada) |
| Tipos de cuantizacion | Q4_0 en todas las capas lineales (incluidas las convoluciones pointwise del conformer); Q8_0 en joint, LSTM y embedding de predicción. Existe también una conversión "exact" en f16 sin pérdida |
| Idiomas soportados | inglés (etiqueta `en`; evaluado en FLEURS en_us) |
| Licencia | CC-BY-4.0 (heredada del modelo fuente) |
| Formato de pesos | GGUF con contrato de tensores Starling (no compatible con llama.cpp ni whisper.cpp); el modelo original se publica en formato `.bark` |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base: un encoder FastConformer seguido de un decodificador TDT (transducer con predicción conjunta de token y duración), que es la familia empleada por NVIDIA en Parakeet. Sobre esa base, Conway Research aplicó un ajuste fino orientado a la limpieza de disfluencias, de modo que el modelo aprende a suprimir muletillas, reinicios y repeticiones en lugar de transcribirlas. No se dispone en la información proporcionada de datos sobre el volumen de tokens de audio, la composición del corpus de ajuste ni si se empleó RLHF o DPO.

El repositorio documenta únicamente el proceso de conversión y cuantización, no el entrenamiento. El pipeline es reproducible en tres pasos: conversión exacta de los pesos publicados (`convert_parakeet_gguf.py --bark model.bark --dtype f16`), cálculo de una importance matrix con 100 clips de validación de FLEURS en_us a través del fichero exacto (`STARLING_IMATRIX`), y cuantización con `starling-quantize` usando la receta `parakeet-q4pw-fullimx.recipe` y `--shrink-f16`. El resultado es un único fichero con layout Q4_0 en las lineales y Q8_0 en las partes sensibles (joint, LSTM, embedding de predicción), el mismo esquema que Starling emplea para su Parakeet de teléfono.

## Capacidades

- Transcripción de voz a texto en inglés con salida limpia: elimina muletillas, falsos arranques y palabras repetidas de forma deliberada.
- Modo dictado: genera texto más próximo al lenguaje escrito que a una transcripción literal, adecuado para insertar directamente en un campo de texto.
- Ejecución en el borde: motor ggml, funciona en CPU y en Android mediante el motor rápido Vulkan de la app Starling.
- Integración vía `starling-serve` como servicio HTTP local (`--model parakeet --gguf ... --port 8181`).
- No soporta tool calling ni function calling; no es un modelo de agentes ni de razonamiento multi-paso.
- No es multilingüe: solo inglés. No tiene capacidades de visión ni de audio más allá de la transcripción.
- No dispone de modo "thinking" ni de decodificación especulativa documentada.

## Casos de uso

- Dictado en aplicaciones móviles: el modelo cabe en 364 MB y corre sobre ggml/Vulkan en Android, por lo que puede ofrecer entrada por voz sin conexión y con la limpieza de muletillas ya aplicada, evitando que el usuario reciba "eh... bueno... quería decir" en el campo de texto.
- Notas de reuniones y actas: al eliminar repeticiones y falsos arranques, la salida requiere menos edición posterior antes de enviarse como resumen o de pasar a un LLM para extracción de acciones.
- Subtitulado y transcripción de pódcasts o vídeos: la limpieza reduce el ruido textual y facilita la lectura, aunque debe revisarse la puntuación porque en aproximadamente 1 de cada 10 clips de FLEURS la salida aparece en minúsculas y sin puntuar.
- Preprocesado de voz para pipelines de NLP: la transcripción limpia alimenta mejor tareas posteriores (búsqueda, clasificación, extracción de entidades) que una salida verbatim con disfluencias.
- Transcripción con requisitos de privacidad: al ejecutarse localmente en CPU o en un teléfono, el audio no sale del dispositivo, lo que encaja en entornos con datos sensibles donde no se permite enviar audio a la nube.
- Prototipado y evaluación de ASR en local: sirve como referencia ligera para comparar WER frente a modelos mayores en un portátil, sin GPU ni dependencias de pesos de gran tamaño.
- Herramientas de accesibilidad: dictado por voz de bajo consumo para usuarios con movilidad reducida, con latencia controlada al no requerir red.

## Benchmarks y rendimiento

Evaluación publicada por el autor del repositorio: FLEURS en_us test, 100 clips, cada fichero decodificado en su propio proceso sobre el motor ggml de CPU. "Exact" es la conversión sin pérdida de los pesos publicados (coincide palabra por palabra con la referencia de transformers en 60 clips). Se ofrecen dos normalizaciones: la propia de Starling y la normalizador inglés de Whisper tal como la usa Open ASR Leaderboard (que convierte números escritos con letras a dígitos, algo relevante en esta familia).

| Metrica | exact (f16) | q4pw (Q4_0/Q8_0) | Delta emparejado (q4pw − exact), IC 95 % |
|---|---:|---:|---:|
| WER, normalización Starling | 7,02 % | 7,31 % | +0,34 pt [−0,05, +0,80] |
| WER, normalización Whisper | 4,57 % | 4,85 % | no disponible |

| Referencia | WER normalización Starling | WER normalización Whisper |
|---|---:|---:|
| stock Parakeet TDT 0.6B v3 (bf16), mismos clips | 5,56 % | 4,29 % |

Advertencia del propio autor: FLEURS es texto leído de Wikipedia, por lo que no evalúa habla conversacional (reuniones, llamadas de resultados), que es justo el terreno donde el editor publica sus cifras de Open ASR.

## Requisitos de hardware

- VRAM/RAM: el fichero pesa 364 MB; con las estructuras del runtime, la huella esperada es inferior a 1 GB (estimación a partir del tamaño del fichero, no medida publicada).
- GPU: no requiere GPU. Cualquier GPU con soporte CUDA o Vulkan puede acelerar la inferencia; no se especifican modelos concretos (A100, H100, RTX 4090) en la información disponible.
- Consumer GPU: sí, cabe holgadamente en cualquier GPU de consumo e incluso en iGPU; el caso de uso declarado es el teléfono.
- CPU: es el modo de referencia empleado en las mediciones de WER (motor ggml de CPU).
- Despliegue: exclusivamente mediante `starling-serve` y `libstarling_ggml` del repositorio Starling, más la app Android. No es compatible con llama.cpp, whisper.cpp, Ollama, vLLM ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | WER FLEURS en_us (norm. Whisper) | Licencia | Formato / despliegue |
|---|---|---|---|---|---|
| underdog-bark-3.0-clean-gguf (este repo, q4pw) | 627 M | no disponible | 4,85 % | CC-BY-4.0 | GGUF Starling |
| Underdog-Bark-3.0-Clean (exact f16) | 627 M | no disponible | 4,57 % | CC-BY-4.0 | `.bark` / GGUF Starling |
| nvidia/parakeet-tdt-0.6b-v3 (stock, bf16) | ~0,6 B | no disponible | 4,29 % | no disponible en la información proporcionada | no disponible en la información proporcionada |
| Underdog Bark 3.0 Pro | no disponible | no disponible | no disponible | no disponible | no disponible |

Lectura: la conversión y cuantización cuestan 0,34 puntos de WER frente al fichero exacto, y el ajuste fino de limpieza cuesta aproximadamente 0,28 puntos frente al Parakeet original medido en los mismos clips con normalización Whisper. El modelo "Pro" de la misma familia, citado en la model card, corrige el problema de puntuación y números deletreados, pero no se aportan cifras.

## Limitaciones y advertencias

- No es verbatim: elimina contenido de forma intencionada. No sirve para transcripción literal, análisis de disfluencias, estudios lingüísticos ni evaluación de tartamudeo.
- La supresión de repeticiones puede borrar información real cuando la repetición es semántica ("muy, muy importante") y no una muletilla.
- Solo inglés. No se ha evaluado ni se declara soporte para otras lenguas.
- En aproximadamente 1 de cada 10 clips de FLEURS la salida aparece en minúsculas y sin puntuación, y con frecuencia escribe los números con letras ("twenty five" en lugar de "25"). Cualquier downstream que espere dígitos necesitará normalización propia.
- El WER mide errores de palabra, no fidelidad de contenido: un modelo que borra disfluencias puede obtener buen WER y, aun así, omitir información relevante.
- La evaluación se limita a 100 clips de FLEURS en_us, que es texto leído de Wikipedia; no hay datos publicados sobre habla conversacional, acentos no estadounidenses, ruido de fondo ni audio telefónico de 8 kHz.
- Licencia CC-BY-4.0: el uso comercial está permitido, pero exige atribución. Hay que conservar el fichero NOTICE con la atribución a Conway Research, NVIDIA y Moondream.
- Compatibilidad restringida: estos GGUF no funcionan en llama.cpp ni whisper.cpp; requieren el binario `starling-serve` o `libstarling_ggml`. Un pipeline construido sobre Ollama o vLLM no puede consumirlos directamente.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validación independiente por parte de la comunidad. Verificar el SHA-256 publicado (`d1eec8fc...eaee0cf`) antes de desplegar.
- Riesgo de alucinación en audio de baja calidad o silencios largos: no se documenta comportamiento en esos casos, así que conviene añadir detección de voz y umbrales de confianza en producción.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/scholzmx/underdog-bark-3.0-clean-gguf
- Modelo base (Conway Research): https://huggingface.co/ConwayResearch/Underdog-Bark-3.0-Clean
- Modelo del que deriva el base (NVIDIA): https://huggingface.co/nvidia/parakeet-tdt-0.6b-v3
- Modelo referenciado en la atribución (Moondream): https://huggingface.co/moondream/parakeet-ultra
- Repositorio del motor Starling (`starling-serve`, `libstarling_ggml`, app Android): https://github.com/sims1253/starling
