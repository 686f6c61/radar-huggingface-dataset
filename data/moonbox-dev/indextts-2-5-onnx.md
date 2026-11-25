# moonbox-dev/IndexTTS-2.5-ONNX

## Resumen

IndexTTS 2.5 ONNX es una conversión a formato ONNX del modelo de síntesis de voz IndexTTS 2.5 desarrollado por el equipo IndexTeam (Bilibili), publicada por moonbox-dev para su uso en dispositivo con ONNX Runtime. El modelo original resuelve el problema de la síntesis de voz zero-shot con clonación de voz: a partir de un audio de referencia corto (prompt) y un texto, genera habla en la voz del hablante de referencia. Esta versión ONNX es relevante porque permite desplegar el modelo en CPU, CUDA y DirectML sin depender del stack de PyTorch, lo que facilita su integración en aplicaciones de escritorio, navegador o entornos con recursos limitados.

La conversión incluye dos precisiones de pesos: fp16 (con estimador y vocoder en fp32) e int4 experimental (decoder en 4 bits, resto en int8). El repositorio ocupa 4,5 GB e incluye los grafos ONNX segmentados por componente (campplus, codec, decoder, embed, emovec, estimator, prefix, regulator, semantic, vocoder), además de un `pipeline.py` que orquesta las características, el prompt y el bucle de muestreo.

El modelo soporta chino e inglés según las etiquetas del repositorio, y su licencia es la bilibili-model-use-license, lo que condiciona el uso comercial. No se dispone de información sobre el número de parámetros totales ni la longitud de contexto en la documentación proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (modelo de síntesis de voz basado en codec y decoder, conversión ONNX de IndexTTS 2.5) |
| Parametros totales | No disponible |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | fp16 (estimador y vocoder en fp32) e int4 experimental (decoder 4-bit, resto int8) |
| Idiomas soportados | Chino e inglés (según etiquetas del repositorio) |
| Licencia | bilibili-model-use-license |
| Formato de pesos | ONNX (grafos segmentados por componente) y pipeline.py en Python |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo original IndexTTS 2.5. Por los nombres de los grafos ONNX (campplus, codec, decoder, embed, emovec, estimator, prefix, regulator, semantic, vocoder) se deduce una arquitectura de síntesis de voz en dos etapas: un codificador semántico y de hablante (semantic, campplus, emovec) que extrae representaciones del texto y del audio de referencia, un decoder autorregresivo o de muestreo que genera tokens acústicos, y un vocoder que convierte esos tokens en forma de onda. El componente `prefix` sugiere un mecanismo de prefijo condicionado por el prompt de voz, y `regulator` y `estimator` apuntan a módulos de control de duración o prosodia.

No se dispone de datos sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. La model card de esta conversión no incluye información sobre el entrenamiento del modelo base; solo documenta el proceso de conversión a ONNX y los resultados de los benchmarks de la conversión frente al modelo original en PyTorch.

## Capacidades

- Síntesis de voz zero-shot: genera habla a partir de un texto y un audio de referencia corto, clonando la voz del hablante de referencia.
- Clonación de voz multilingüe: soporta chino e inglés según las etiquetas del repositorio.
- Generación de habla con control de prosodia y duración mediante los módulos regulator y estimator.
- Ejecución en ONNX Runtime con soporte para CPU, CUDA y DirectML.
- Dos precisiones disponibles: fp16 para calidad y int4 experimental para menor huella de memoria.
- No se documentan capacidades de tool calling, agentes, visión, audio de entrada más allá del prompt de voz, ni modos de razonamiento.

## Casos de uso

- Clonación de voz para audiolibros y narración: el modelo permite generar capítulos completos con una voz consistente a partir de una muestra corta del narrador, usando la precisión fp16 para mantener la similitud de hablante (0,956 en inglés y 0,630 en chino según la benchmark de Moonbox).
- Asistentes de voz en aplicaciones de escritorio: al ejecutarse con ONNX Runtime en CPU o DirectML, puede integrarse en aplicaciones nativas de Windows sin dependencias de PyTorch, generando respuestas habladas en la voz del usuario.
- Localización de contenido audiovisual: doblaje de vídeos en inglés a chino o viceversa manteniendo la voz del hablante original, con la ventaja de que el modelo soporta ambos idiomas y la clonación zero-shot evita entrenar voces por separado.
- Accesibilidad y lectores de pantalla: conversión de texto a voz personalizada para usuarios que necesitan una voz sintética concreta, desplegable en dispositivo con la cuantización int4 para equipos con poca memoria.
- Prototipado rápido de voces en investigación: el pipeline en Python y los grafos ONNX permiten experimentar con el modelo sin montar el entorno completo de PyTorch, útil para evaluar calidad y latencia antes de invertir en infraestructura.
- Generación de voces para videojuegos y contenido interactivo: la ejecución en dispositivo con ONNX Runtime facilita la síntesis en tiempo real de diálogos con voces de personajes clonadas, aunque la RTF de 1,24 en CUDA indica que la generación es más lenta que el tiempo real en esa configuración.

## Benchmarks y rendimiento

La model card incluye resultados de la benchmark propia de Moonbox sobre un conjunto de TTS con clonación de voz de frases en inglés y chino (prompts de LibriSpeech y AISHELL-1), comparando la conversión ONNX con el modelo original en PyTorch (fp32). Las métricas son tasa de error de palabra (WER) y de carácter (CER) de una transcripción Whisper contra el texto, similitud de hablante con el prompt y DNSMOS.

| Precision | WER / CER (%) | Similitud hablante (EN / ZH) | DNSMOS (EN / ZH) | RTF (CUDA) |
|---|---|---|---|---|
| Original PyTorch fp32 | 0,3 / 0,0 | 0,963 / 0,652 | 3,13 / 3,04 | No disponible |
| ONNX fp16 | 0,15 / 0,0 | 0,956 / 0,630 | 3,13 / 3,11 | 1,24 |
| ONNX int4 (experimental) | 0,15 / 0,5 | 0,961 / 0,619 | 3,17 / 3,14 | 1,22 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible, ya que se trata de un modelo de síntesis de voz y no de un modelo de lenguaje.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. El repositorio completo ocupa 4,5 GB; la precisión fp16 suma aproximadamente 3,2 GB de grafos ONNX (decoder 965,8 MB, semantic 823,1 MB, vocoder 450,5 MB, estimator 380,8 MB, emovec 326,6 MB, prefix 178,2 MB, codec 50,7 MB, embed 25,6 MB, campplus 14,7 MB, regulator 7,9 MB), por lo que se necesita al menos esa cantidad de memoria más el overhead de ONNX Runtime.
- GPU recomendadas: no se especifican modelos concretos. La model card menciona soporte para CUDA y DirectML, y reporta RTF de 1,24 en CUDA con fp16.
- Compatibilidad con GPU de consumo: no se confirma explícitamente, pero el tamaño de los grafos (menos de 4 GB en fp16) sugiere que podría caber en GPUs de consumo con 8 GB o más de VRAM; no hay confirmación en la información disponible.
- Opciones de despliegue: ONNX Runtime (CPU, CUDA, DirectML) con el `pipeline.py` incluido. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: RTF de 1,24 en CUDA con fp16 y 1,22 con int4, lo que indica que la generación es más lenta que el tiempo real en esa configuración. No se dispone de datos de latencia en CPU ni de throughput en otras plataformas.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. La model card solo compara la conversión ONNX con el modelo original IndexTTS 2.5 en PyTorch, no con otros sistemas de síntesis de voz. Por tanto, la comparativa con alternativas de la misma categoría (por ejemplo, otros modelos de clonación de voz zero-shot) no está disponible.

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| IndexTTS 2.5 ONNX (este) | No disponible | No disponible | bilibili-model-use-license | ONNX | Hugging Face |
| IndexTTS 2.5 (original) | No disponible | No disponible | bilibili-model-use-license | PyTorch | Hugging Face |
| Alternativas | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- La licencia bilibili-model-use-license condiciona el uso comercial; es necesario revisar los términos completos antes de desplegar el modelo en producción.
- La cuantización int4 está marcada como experimental y "below threshold" en la benchmark del autor, con un CER de 0,5 % en chino frente al 0,0 % de fp16; no se recomienda para producción sin validación adicional.
- El modelo solo soporta chino e inglés según las etiquetas del repositorio; no se documentan otros idiomas.
- No se dispone de información sobre sesgos conocidos, riesgo de alucinación (en el sentido de generar audio no solicitado o incorrecto) ni limitaciones de contexto del modelo original.
- La RTF de 1,24 en CUDA indica que la generación es más lenta que el tiempo real en esa configuración, lo que limita su uso en aplicaciones de baja latencia sin optimización adicional.
- No se documentan mecanismos de seguridad o filtrado de contenido para evitar la clonación de voces sin consentimiento; es responsabilidad del despliegue implementar controles éticos y legales.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica que es una publicación reciente y poco validada por la comunidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/moonbox-dev/IndexTTS-2.5-ONNX
- Modelo base: https://huggingface.co/IndexTeam/IndexTTS-2.5
- Paper referenciado en las etiquetas: arXiv:2601.03888 (no se dispone de URL directa en la información proporcionada)
- Licencia: LICENSE en el repositorio de Hugging Face (no se dispone de URL directa)
