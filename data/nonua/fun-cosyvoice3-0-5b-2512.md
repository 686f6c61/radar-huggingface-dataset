# nonua/Fun-CosyVoice3-0.5B-2512

## Resumen

Fun-CosyVoice3-0.5B-2512 es un sistema de síntesis de voz (text-to-speech, TTS) basado en un modelo de lenguaje de aproximadamente 0,5 mil millones de parámetros, desarrollado por FunAudioLLM (Alibaba) y redistribuido en HuggingFace por el usuario nonua. Forma parte de la familia CosyVoice, cuya tercera versión se publica bajo el identificador de checkpoint 2512 (diciembre de 2025 según el roadmap del autor original). El modelo resuelve síntesis multilingüe zero-shot "in the wild": genera voz a partir de texto con clonación de timbre a partir de una muestra de audio de referencia, sin necesidad de entrenamiento adicional por hablante.

La relevancia técnica del modelo reside en tres puntos. Primero, cubre 9 idiomas (chino, inglés, japonés, coreano, alemán, español, francés, italiano y ruso) más de 18 dialectos y acentos del chino, con soporte de clonación de voz multilingüe y cross-lingual. Segundo, incorpora capacidades orientadas a producción: "pronunciation inpainting" mediante pinyin chino y fonemas CMU ingleses, normalización de texto sin frontend tradicional, y modo bi-streaming (texto de entrada y audio de salida en streaming) con latencia declarada de hasta 150 ms. Tercero, admite instrucciones de control (idioma, dialecto, emoción, velocidad, volumen).

El repositorio analizado no es el oficial de FunAudioLLM, sino una copia publicada por el usuario nonua el 16 de septiembre de 2026, con 0 descargas y 0 likes en el momento de la consulta, y un tamaño de 9,7 GB. La model card reproduce la documentación del modelo original, incluida la tabla de evaluación comparativa frente a otros sistemas TTS de 2024-2025.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Sistema TTS basado en modelo de lenguaje (LLM) con decodificador de flow matching y vocoder; el repositorio no detalla la topología interna exacta |
| Parametros totales | 0,5 B (según model card y tabla de evaluación) |
| Parametros activos | no aplica (no hay evidencia de que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; el repositorio incluye pesos en safetensors y ONNX, sin variantes GGUF ni AWQ/GPTQ documentadas |
| Idiomas soportados | zh, en, fr, es, ja, ko, it, ru, de (9 idiomas) más 18+ dialectos y acentos del chino (Guangdong, Minnan, Sichuan, Dongbei, Shanxi, Shanghai, Tianjin, Shandong, Ningxia, Gansu, etc.) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors y ONNX |
| Etiquetas del repositorio | onnx, safetensors, text-to-speech, region:us, arxiv:2505.17589, arxiv:2412.10117, arxiv:2407.05407 |
| Tamaño del repositorio | 9,7 GB |
| Pipeline declarado | text-to-speech |
| Autor de la publicación | nonua (copia no oficial; el modelo original lo publica FunAudioLLM) |

## Arquitectura y entrenamiento

La información disponible describe Fun-CosyVoice 3.0 como un sistema TTS basado en modelos de lenguaje de gran tamaño, sucesor de CosyVoice 2.0, con mejoras declaradas en consistencia de contenido, similitud de hablante y naturalidad prosódica. El roadmap del proyecto CosyVoice menciona soporte de entrenamiento con flow matching, inferencia en modo streaming con caché KV y SDPA para optimizar el RTF, muestreo consciente de repeticiones (Repetition Aware Sampling, RAS) para estabilidad del LLM, y soporte de entrenamiento con GRPO (en la entrada de agosto de 2025). Estos elementos corresponden al repositorio CosyVoice en su conjunto y no necesariamente a este checkpoint concreto.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron fases de RLHF o DPO más allá de la existencia de una variante RL del modelo (`Fun-CosyVoice3-0.5B-2512_RL`) cuyos resultados se reportan en la tabla de evaluación. El modelo incorpora un módulo de normalización de texto que evita depender de un frontend tradicional, y permite inpainting de pronunciación a nivel de pinyin y de fonemas CMU.

## Capacidades

- Síntesis de voz multilingüe en 9 idiomas: chino, inglés, francés, español, japonés, coreano, italiano, ruso y alemán.
- Cobertura de más de 18 dialectos y acentos del chino, incluyendo Guangdong, Minnan, Sichuan, Dongbei, Shanxi, Shanghai, Tianjin, Shandong, Ningxia y Gansu.
- Clonación de voz zero-shot: reproducción del timbre de un hablante a partir de audio de referencia, sin ajuste fino.
- Clonación multilingüe y cross-lingual: capacidad de sintetizar en un idioma distinto al del audio de referencia.
- Inpainting de pronunciación mediante pinyin chino y fonemas CMU ingleses, lo que permite corregir la pronunciación de términos concretos.
- Normalización de texto integrada: lectura de números, símbolos especiales y distintos formatos textuales sin módulo de frontend externo.
- Bi-streaming: soporte simultáneo de entrada de texto en streaming y salida de audio en streaming, con latencia declarada de hasta 150 ms.
- Control por instrucciones: idioma, dialecto, emoción, velocidad y volumen.
- Generación de audio de alta calidad orientada a producción, con variante RL entrenada para mejorar métricas de error de contenido.
- Soporte de tool calling / function calling: no aplica (modelo de síntesis de voz, no de propósito general).
- Soporte de agentes y razonamiento multi-paso: no aplica.
- Capacidades de visión o audio de entrada más allá de la referencia de voz para clonación: no disponible en la información proporcionada.

## Casos de uso

- Audiolibros y narración multilingüe: el modelo permite generar narraciones en 9 idiomas con una sola muestra de voz de referencia, lo que reduce el coste de producir catálogos en varios idiomas manteniendo un timbre consistente.
- Doblaje y localización de vídeo: mediante clonación cross-lingual, se puede conservar el timbre del actor original mientras se sintetiza el texto traducido, un flujo habitual en localización de contenido.
- Agentes conversacionales de baja latencia: con bi-streaming y latencia declarada de 150 ms, encaja en asistentes de voz interactivos donde la respuesta hablada debe empezar antes de que el LLM termine de generar el texto.
- Accesibilidad y lectores de pantalla: la normalización de texto integrada (números, símbolos, formatos) permite convertir documentos técnicos o financieros en audio inteligible sin preprocesado adicional.
- Atención al cliente automatizada con voz sintética: el control de instrucciones (velocidad, emoción, idioma) permite adaptar el tono del agente virtual a distintos segmentos de clientes y mercados.
- Producción de contenido para publicidad y podcast: el control de emoción y volumen, junto con la clonación de voz, facilita generar múltiples versiones de un mismo guion con variaciones de estilo.
- Corrección de pronunciación en terminología especializada: el inpainting con pinyin y fonemas CMU permite fijar la pronunciación correcta de nombres propios, marcas o términos médicos y técnicos.
- Investigación en síntesis de voz: la disponibilidad del conjunto de evaluación CV3-Eval y de una variante RL permite reproducir experimentos de consistencia de contenido y similitud de hablante.

## Benchmarks y rendimiento

Los datos siguientes proceden de la model card del modelo original, incluida en este repositorio. No hay resultados específicos publicados para la copia de nonua.

| Modelo | Open source | Tamaño | test-zh CER (%) ↓ | test-zh similitud hablante (%) ↑ | test-en WER (%) ↓ | test-en similitud hablante (%) ↑ | test-hard CER (%) ↓ | test-hard similitud hablante (%) ↑ |
|---|---|---|---|---|---|---|---|---|
| Humano | - | - | 1,26 | 75,5 | 2,14 | 73,4 | - | - |
| Seed-TTS | No | - | 1,12 | 79,6 | 2,25 | 76,2 | 7,59 | 77,6 |
| MiniMax-Speech | No | - | 0,83 | 78,3 | 1,65 | 69,2 | - | - |
| F5-TTS | Sí | 0,3B | 1,52 | 74,1 | 2,00 | 64,7 | 8,67 | 71,3 |
| Spark TTS | Sí | 0,5B | 1,20 | 66,0 | 1,98 | 57,3 | - | - |
| CosyVoice2 | Sí | 0,5B | 1,45 | 75,7 | 2,57 | 65,9 | 6,83 | 72,4 |
| FireRedTTS2 | Sí | 1,5B | 1,14 | 73,2 | 1,95 | 66,5 | - | - |
| Index-TTS2 | Sí | 1,5B | 1,03 | 76,5 | 2,23 | 70,6 | 7,12 | 75,5 |
| VibeVoice-1.5B | Sí | 1,5B | 1,16 | 74,4 | 3,04 | 68,9 | - | - |
| VibeVoice-Realtime | Sí | 0,5B | - | - | 2,05 | 63,3 | - | - |
| HiggsAudio-v2 | Sí | 3B | 1,50 | 74,0 | 2,44 | 67,7 | - | - |
| VoxCPM | Sí | 0,5B | 0,93 | 77,2 | 1,85 | 72,9 | 8,87 | 73,0 |
| GLM-TTS | Sí | 1,5B | 1,03 | 76,1 | - | - | - | - |
| GLM-TTS RL | Sí | 1,5B | 0,89 | 76,4 | - | - | - | - |
| Fun-CosyVoice3-0.5B-2512 | Sí | 0,5B | 1,21 | 78,0 | 2,24 | 71,8 | 6,71 | 75,8 |
| Fun-CosyVoice3-0.5B-2512_RL | Sí | 0,5B | 0,81 | 77,4 | 1,68 | 69,5 | 5,44 | 75,0 |

Lectura de los datos: la variante RL obtiene el mejor CER en test-zh (0,81) y en test-hard (5,44) del conjunto comparado, a costa de una ligera pérdida de similitud de hablante en test-en (69,5 frente a 71,8 del modelo base). El modelo base destaca en similitud de hablante en chino (78,0), por encima de Seed-TTS (79,6 en CER, pero 76,2 en similitud declarada en la tabla). No hay datos publicados en la información disponible sobre latencia medida de forma independiente ni sobre pruebas en español.

## Requisitos de hardware

- VRAM estimada: no publicada por el autor. Como referencia de orden de magnitud, un modelo de 0,5 B parámetros en fp16 ocupa en torno a 1-2 GB de pesos, y el repositorio completo pesa 9,7 GB porque incluye varios checkpoints (base, RL, componentes auxiliares). La inferencia con LLM más decodificador de flow matching y vocoder se sitúa habitualmente en el rango de 2-4 GB de VRAM, aunque esta cifra es una estimación y no un dato del autor.
- GPU recomendadas: no disponibles. Por tamaño, cualquier GPU con al menos 4-6 GB de VRAM debería poder ejecutar el modelo en fp16.
- Compatibilidad con GPU de consumo: previsiblemente sí, en tarjetas tipo RTX 3060, RTX 4060, RTX 4070, RTX 4090 y equivalentes, dado el tamaño de 0,5 B. No hay confirmación oficial en la información disponible.
- Opciones de despliegue: el repositorio forma parte del ecosistema CosyVoice, cuyo roadmap menciona soporte de vLLM para CosyVoice2-0.5B, soporte de runtime con Triton y TensorRT-LLM, un servidor y cliente FastAPI, y pesos en ONNX compatibles con ONNX Runtime. No hay soporte documentado de llama.cpp ni de Ollama (no se distribuyen pesos GGUF).
- Latencia y throughput: el autor declara latencia de hasta 150 ms en modo bi-streaming. No se publican cifras de throughput (RTF) para este checkpoint concreto.

## Comparativa con modelos similares

| Modelo | Parámetros | Open source | CER test-zh | Similitud test-zh | WER test-en | Similitud test-en | CER test-hard | Licencia |
|---|---|---|---|---|---|---|---|---|
| Fun-CosyVoice3-0.5B-2512 | 0,5B | Sí | 1,21 | 78,0 | 2,24 | 71,8 | 6,71 | apache-2.0 (según este repositorio) |
| Fun-CosyVoice3-0.5B-2512_RL | 0,5B | Sí | 0,81 | 77,4 | 1,68 | 69,5 | 5,44 | apache-2.0 (según este repositorio) |
| CosyVoice2-0.5B | 0,5B | Sí | 1,45 | 75,7 | 2,57 | 65,9 | 6,83 | no disponible en la información proporcionada |
| F5-TTS | 0,3B | Sí | 1,52 | 74,1 | 2,00 | 64,7 | 8,67 | no disponible en la información proporcionada |
| VoxCPM | 0,5B | Sí | 0,93 | 77,2 | 1,85 | 72,9 | 8,87 | no disponible en la información proporcionada |
| Index-TTS2 | 1,5B | Sí | 1,03 | 76,5 | 2,23 | 70,6 | 7,12 | no disponible en la información proporcionada |
| GLM-TTS RL | 1,5B | Sí | 0,89 | 76,4 | - | - | - | no disponible en la información proporcionada |

Frente a alternativas del mismo rango de tamaño (0,5 B), Fun-CosyVoice3-0.5B-2512 ofrece la mayor similitud de hablante en chino de la tabla (78,0) y un WER en inglés competitivo (2,24). VoxCPM logra mejor CER en chino (0,93) y mejor similitud en inglés (72,9), mientras que los modelos de 1,5 B como Index-TTS2 o GLM-TTS RL obtienen mejores métricas de contenido a costa de triplicar el tamaño. La principal ventaja diferencial de Fun-CosyVoice3 en esta comparativa es la cobertura de idiomas y dialectos junto con el modo bi-streaming de baja latencia.

## Limitaciones y advertencias

- Este repositorio no es la publicación oficial: lo firma el usuario nonua, con 0 descargas y 0 likes, y la model card reproduce el material de FunAudioLLM. Para uso en producción conviene verificar la integridad de los pesos frente al repositorio oficial `FunAudioLLM/Fun-CosyVoice3-0.5B-2512`.
- Las fechas del repositorio (creación y actualización el 16 de septiembre de 2026) no coinciden con el calendario del modelo original, lo que sugiere metadatos inconsistentes o generados automáticamente.
- No se documenta la composición del dataset de entrenamiento, el número de tokens ni el origen de las voces utilizadas, por lo que no es posible evaluar sesgos de acento, género o idioma con rigor.
- La cobertura de dialectos y acentos está centrada en el chino; no hay evidencia de cobertura dialectal equivalente en español (variantes de España frente a Latinoamérica) ni en el resto de idiomas.
- La clonación de voz zero-shot plantea riesgos legales y éticos: suplantación de identidad, deepfakes y uso comercial de timbres sin consentimiento del hablante. La licencia apache-2.0 no exime de esas obligaciones en la jurisdicción de uso.
- Al ser un sistema generativo, puede producir artefactos acústicos, omisiones, repeticiones o pronunciaciones incorrectas, especialmente en texto fuera de dominio o con terminología poco frecuente; el proyecto incorpora RAS precisamente para mitigar inestabilidad del LLM en la decodificación.
- El repositorio depende de recursos externos como `FunAudioLLM/CosyVoice-ttsfrd`, distribuido por separado y con licencia propia que puede diferir de apache-2.0 para la parte de normalización de texto.
- No hay información sobre cuantizaciones soportadas oficialmente (GGUF, AWQ, GPTQ), lo que limita el despliegue en entornos con restricciones de memoria estrictas.
- No se han publicado mediciones independientes de latencia o throughput para este checkpoint; el dato de 150 ms procede del autor.
- La atribución de licencia apache-2.0 corresponde a lo declarado en este repositorio; conviene confirmarla contra la ficha oficial antes de un uso comercial.

## Enlaces

- Repositorio analizado: https://huggingface.co/nonua/Fun-CosyVoice3-0.5B-2512
- Repositorio oficial en HuggingFace: https://huggingface.co/FunAudioLLM/Fun-CosyVoice3-0.5B-2512
- Repositorio oficial en ModelScope: https://www.modelscope.cn/models/FunAudioLLM/Fun-CosyVoice3-0.5B-2512
- Demos de Fun-CosyVoice 3.0: https://funaudiollm.github.io/cosyvoice3/
- Paper de Fun-CosyVoice 3.0: https://arxiv.org/abs/2505.17589
- Paper de CosyVoice 2.0: https://arxiv.org/abs/2412.10117
- Paper de CosyVoice 1.0: https://funaudiollm.github.io/pdf/CosyVoice_v1.pdf
- Repositorio de código CosyVoice: https://github.com/FunAudioLLM/CosyVoice
- Conjunto de evaluación CV3-Eval: https://github.com/FunAudioLLM/CV3-Eval
- Demos de CosyVoice 2.0: https://funaudiollm.github.io/cosyvoice2/
- CosyVoice 2.0 en HuggingFace: https://huggingface.co/FunAudioLLM/CosyVoice2-0.5B
- CosyVoice 2.0 en ModelScope: https://www.modelscope.cn/models/iic/CosyVoice2-0.5B
- CosyVoice 1.0 en HuggingFace: https://huggingface.co/FunAudioLLM/CosyVoice-300M
- CosyVoice 1.0 en ModelScope: https://www.modelscope.cn/models/iic/CosyVoice-300M
- Repositorio de referencia para normalización de texto: https://huggingface.co/FunAudioLLM/CosyVoice-ttsfrd
