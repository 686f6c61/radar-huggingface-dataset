# Phoonnx/f5tts-multi-silma_ai-v1-graphemes

## Resumen

f5tts-multi-silma_ai-v1-graphemes es un modelo de síntesis de voz (text-to-speech) basado en la arquitectura F5-TTS, desarrollado originalmente por SILMA AI a partir de su modelo silma-tts y empaquetado por Phoonnx en formato ONNX para su uso con la librería phoonnx. El modelo cubre dos idiomas, árabe (árabe moderno estándar con tashkeel completo) e inglés, y acepta texto de entrada a nivel de grafemas mediante el fonemizador GraphemePhonemizer de la librería scriptconv.

El modelo se distribuye en dos variantes de precisión: fp32 (748,9 MB, con un factor de tiempo real de 6,818 sobre CPU) e int8 (304,4 MB, con un factor de 3,422 y un pico de memoria de 807 MiB). Esta segunda variante, obtenida mediante cuantización dinámica de onnxruntime aplicada únicamente a los nodos MatMul y Gemm, reduce a menos de la mitad el peso y el consumo de memoria, y según la model card mantiene una tasa de error de palabra de 0,095 frente a los 0,079 y 0,127 de dos ejecuciones en fp32.

Su relevancia práctica reside en que ofrece un pipeline TTS completo y ligero que se ejecuta en CPU sin necesidad de GPU, con integración directa en el ecosistema OVOS mediante el plugin ovos-tts-plugin-phoonnx. La licencia Apache-2.0 del modelo upstream silma-tts-v1 permite uso comercial, a diferencia de las restricciones CC-BY-NC-SA-4.0 que arrastraban sus bases Habibi, SADA y Mixat.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | F5-TTS (modelo de difusión para TTS, empaquetado en ONNX) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | fp32 e int8 (cuantización dinámica de onnxruntime sobre nodos MatMul y Gemm) |
| Idiomas soportados | árabe (MSA con tashkeel completo) e inglés |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (model.onnx, F5_Preprocess.onnx, F5_Decode.onnx y variantes _int8) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura F5-TTS, un sistema de síntesis de voz basado en difusión que genera audio a partir de texto, heredado del modelo silma-ai/silma-tts de SILMA AI. El empaquetado para phoonnx descompone el grafo en tres ficheros ONNX: model.onnx (el modelo principal), F5_Preprocess.onnx (preprocesado del texto) y F5_Decode.onnx (decodificación del audio), cada uno con su versión int8 correspondiente. La entrada de texto se procesa a nivel de grafemas mediante GraphemePhonemizer de scriptconv, que normaliza el texto y lo convierte en la entrada del modelo.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. La model card únicamente indica que el modelo upstream silma-tts-v1 deriva de las bases Habibi, SADA y Mixat, y que las variantes de silma-tts-v1 (incluida la de Irak, IRQ, y Marruecos, MAR) son Apache-2.0 y no arrastran la restricción NC de esas bases. La cuantización int8 se generó con cuantización dinámica de onnxruntime limitada a los nodos MatMul y Gemm, y fue validada contra la versión fp32 mediante un reconocedor de voz sobre cinco frases de comprobación.

## Capacidades

- Síntesis de voz a partir de texto en árabe (MSA con tashkeel completo) e inglés.
- Generación de audio en formato WAV mediante la API synthesize_wav de phoonnx.
- Procesamiento de texto a nivel de grafemas con normalización previa mediante scriptconv.
- Ejecución en CPU sin GPU, con variantes fp32 e int8 para distintos compromisos de memoria y velocidad.
- Integración con el ecosistema OVOS a través del plugin ovos-tts-plugin-phoonnx.
- Dos voces empaquetadas: silma/v1 y silma/v1-en.
- No se ha documentado soporte de tool calling, agentes, razonamiento multi-paso, visión ni audio de entrada.

## Casos de uso

- Asistentes de voz en árabe e inglés sobre OVOS: el plugin ovos-tts-plugin-phoonnx permite seleccionar la voz silma/v1 o silma/v1-en en mycroft.conf y sintetizar respuestas en tiempo real sobre CPU, sin depender de servicios en la nube.
- Síntesis de voz en dispositivos sin GPU: con la variante int8 (304,4 MB y 807 MiB de pico de memoria) el modelo cabe en equipos de gama baja y en entornos embebidos donde no hay acelerador dedicado.
- Generación de audiolibros o contenido narrado en árabe MSA con tashkeel completo: el modelo acepta texto con diacríticos, lo que resulta adecuado para material educativo o religioso que requiere pronunciación precisa.
- Localización de contenidos a dos idiomas: un mismo pipeline puede generar la versión en inglés y en árabe de un texto, usando las voces silma/v1-en y silma/v1 respectivamente.
- Prototipado rápido de interfaces de voz: la instalación con pip install --pre phoonnx y la API TTSModelManager permiten integrar TTS en una aplicación Python en pocas líneas.
- Servicios de accesibilidad: lectura en voz alta de textos en árabe e inglés con un modelo Apache-2.0 que puede desplegarse en servidores sin GPU, manteniendo costes de infraestructura bajos.
- Evaluación comparativa de precisión TTS: las dos variantes (fp32 e int8) permiten medir el impacto de la cuantización en la calidad mediante reconocimiento automático de voz, como documenta la propia model card.

## Benchmarks y rendimiento

La model card proporciona métricas de tamaño, memoria y velocidad, pero no resultados de benchmarks estándar de TTS (MOS, MCD, etc.).

| Métrica | fp32 | int8 |
|---|---|---|
| Ficheros | model.onnx, F5_Preprocess.onnx, F5_Decode.onnx | model_int8.onnx, F5_Preprocess_int8.onnx, F5_Decode_int8.onnx |
| Tamaño | 748,9 MB | 304,4 MB |
| Pico de memoria | 1.585 MiB | 807 MiB |
| Factor de tiempo real (RTF) | 6,818 | 3,422 |
| WER en 5 frases de comprobación | 0,079 y 0,127 (dos ejecuciones) | 0,095 |

Las mediciones se realizaron en una CPU AMD Ryzen 5 7600 con 4 hilos. El pico de memoria corresponde a la memoria residente máxima de un proceso nuevo que carga la voz y sintetiza una frase. El RTF es el tiempo de síntesis dividido entre la duración del audio, mediana de 3 ejecuciones; un valor menor indica mayor velocidad.

## Requisitos de hardware

- VRAM: no aplica; el modelo está diseñado para ejecución en CPU mediante onnxruntime.
- Memoria RAM: pico de 1.585 MiB en fp32 y 807 MiB en int8.
- CPU de referencia: AMD Ryzen 5 7600 con 4 hilos (medición oficial de la model card).
- GPU: no se documenta soporte ni requisitos de GPU; el empaquetado está orientado a CPU.
- Cabe en cualquier equipo de consumo con al menos 1 GB de RAM libre en la variante int8.
- Despliegue: librería phoonnx (pip install --pre phoonnx) y plugin ovos-tts-plugin-phoonnx para OVOS. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo TTS ONNX.
- Latencia y throughput: RTF de 6,818 en fp32 y 3,422 en int8 sobre la CPU de referencia; el int8 es aproximadamente el doble de rápido.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idiomas | Tamaño | Licencia | Formato |
|---|---|---|---|---|---|
| f5tts-multi-silma_ai-v1-graphemes | F5-TTS (ONNX) | ar, en | 748,9 MB (fp32) / 304,4 MB (int8) | Apache-2.0 | ONNX |
| silma-ai/silma-tts | F5-TTS | ar, en | no disponible | Apache-2.0 | no disponible |
| Otros modelos de la colección F5-TTS de Phoonnx | F5-TTS (ONNX) | según modelo | no disponible | según modelo | ONNX |

No se dispone de datos de benchmarks comparativos frente a otras alternativas TTS en la información proporcionada.

## Limitaciones y advertencias

- Solo cubre árabe (MSA con tashkeel completo) e inglés; no se documenta soporte de otros idiomas ni de variedades dialectales del árabe.
- No se han publicado resultados de benchmarks de calidad perceptual (MOS, similitud de hablante) en la información disponible.
- La validación de la cuantización int8 se limita a cinco frases de comprobación con reconocimiento automático; puede haber degradación en textos fuera de ese conjunto.
- El RTF superior a 1 (6,818 en fp32 y 3,422 en int8) indica síntesis más lenta que el tiempo real en la CPU de referencia, lo que limita su uso en conversación de baja latencia sin hardware más potente.
- No se documentan sesgos específicos del modelo, aunque al derivar de las bases Habibi, SADA y Mixat puede heredar sesgos de esos corpus.
- Riesgo de alucinación o artefactos de audio no cuantificado en la model card.
- La licencia Apache-2.0 se aplica a silma-tts-v1, pero las bases upstream Habibi, SADA y Mixat arrastran CC-BY-NC-SA-4.0; conviene verificar el alcance antes de un uso comercial.
- La librería phoonnx se instala en versión preliminar (pip install --pre phoonnx), lo que implica posible inestabilidad de API.
- El repositorio tiene 1.155 descargas y 0 likes en el momento de la consulta, por lo que la validación comunitaria es escasa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/f5tts-multi-silma_ai-v1-graphemes
- Modelo upstream: https://huggingface.co/silma-ai/silma-tts
- Colección F5-TTS de Phoonnx: https://huggingface.co/collections/Phoonnx/f5-tts-6af8ea7f407234f6f1f08b30
- Repositorio phoonnx: https://github.com/TigreGotico/phoonnx
- Repositorio scriptconv: https://github.com/TigreGotico/scriptconv
