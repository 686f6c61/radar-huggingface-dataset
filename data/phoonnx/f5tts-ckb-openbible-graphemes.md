# Phoonnx/f5tts-ckb-openbible-graphemes

## Resumen

`f5tts-ckb-openbible-graphemes` es una voz de síntesis de voz (text-to-speech) para kurdo central (sorani, código ISO `ckb`), publicada por Phoonnx (TigreGotico Lda) como conversión a ONNX del modelo `multilingual-tts/F5-TTS-OpenBible-Central-Kurdish`. El modelo subyacente es un fine-tuning de F5-TTS, la arquitectura de TTS basada en flow matching y difusión de SWivid, entrenado por multilingual-tts sobre grabaciones del OpenBible en kurdo central. Esta conversión no altera los pesos: únicamente los exporta a formato ONNX e incluye copias cuantizadas a int8 para su uso con el runtime phoonnx.

La relevancia del modelo es doble. Por un lado, cubre una lengua de bajos recursos con muy poca representación en TTS open source. Por otro, su enfoque "graphemes" elimina el fonemizador: el modelo lee directamente los caracteres del texto, lo que simplifica el pipeline para una lengua cuya fonemización automática es frágil. Incluye además una variante int8 que reduce el grafo de 1448,2 MB a 461,4 MB y el pico de memoria de 3361,7 MB a 1249,4 MB, con un RTF medido de 18,546 frente a 57,222 en fp32.

Es un modelo mono-hablante, con salida a 24 kHz, pensado para integrarse en el ecosistema phoonnx/OVOS. Su licencia efectiva queda restringida al uso no comercial, ya que el modelo base deriva de SWivid/F5-TTS, publicado bajo CC BY-NC 4.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | F5-TTS (flow matching sobre difusión, transformer) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS; entrada de texto por cláusula) |
| Tipos de cuantizacion | fp32 (ONNX) e int8 (quantize_dynamic, QInt8) |
| Idiomas soportados | kurdo central (ckb) |
| Licencia | CC BY-SA 4.0 (con restricción de uso comercial por herencia de CC BY-NC 4.0) |
| Formato de pesos | ONNX (`<graph>.onnx` e `<graph>_int8.onnx`) |
| Frecuencia de muestreo | 24000 Hz |
| Hablantes | 1 (mono-hablante) |
| Entrada de texto | grafemas (sin fonemizador) |
| Puntuación | entrenado con `, . ! :` |
| Tamano del repo | 1,9 GB |
| Grafo fp32 / int8 | 1448,2 MB / 461,4 MB |
| Pico RSS fp32 / int8 | 3361,7 MB / 1249,4 MB |
| RTF (mediana de 3, 4 hilos) | 57,222 (fp32) / 18,546 (int8) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura F5-TTS, un sistema de síntesis de voz basado en flow matching condicionado por texto que genera mel-espectrogramas y los convierte en audio. La particularidad de esta variante es que la condición textual se construye a partir de los grafemas del texto, sin fonemizador intermedio; el modelo "lee los caracteres" directamente. La clonación de voz se realiza por referencia: se le proporciona un clip corto y su transcripción, y el modelo imita el timbre del hablante de referencia. La salida se genera a 24 kHz.

El entrenamiento lo realizó multilingual-tts mediante fine-tuning de SWivid/F5-TTS sobre el dataset `davidguzmanr/open-bible-resources`, en concreto sobre grabaciones del OpenBible en kurdo central. No se especifican en la información disponible el número de tokens, la composición exacta del dataset ni si hubo etapas de RLHF o DPO. La conversión a ONNX la llevó a cabo TigreGotico Lda sin modificar los pesos; las copias int8 se generaron con `onnxruntime.quantization.quantize_dynamic` (onnxruntime 1.32.0) con pesos QInt8.

La validación (QA) se hizo sin ASR, dado que Parakeet no dispone de modelo para kurdo central: se comprobó longitud y ausencia de silencio sobre 3 frases del devtest de FLORES-200, usando como referencia el clip de Marcos 5:34 de las grabaciones del OpenBible. Ambas variantes, fp32 e int8, pasaron la comprobación; la longitud int8/fp32 quedó en el rango 1,00 a 1,00.

## Capacidades

- Síntesis de voz en kurdo central (sorani) a partir de texto escrito en grafemas.
- Clonación de voz zero-shot mediante clip de referencia y su transcripción.
- Procesamiento directo de grafemas, sin necesidad de fonemizador para `ckb`.
- Manejo de puntuación de cláusula (`, . ! :`); phoonnx elimina los guillemets y convierte la coma árabe en coma latina.
- Salida de audio WAV a 24 kHz.
- Integración con el runtime phoonnx y con el ecosistema OVOS mediante `ovos-tts-plugin-phoonnx`.
- No dispone de tool calling, razonamiento multi-paso, visión, audio de entrada ni modo "thinking": es exclusivamente un modelo TTS.

## Casos de uso

- Lectura de textos religiosos y literarios en kurdo central: el modelo se entrenó sobre grabaciones del OpenBible, por lo que su dominio natural es la lectura de prosa continua en registro formal; útil para producir audiolibros o lecturas devocionales.
- Accesibilidad para hablantes de sorani: convertir documentos, artículos o avisos en audio para personas con discapacidad visual o dificultades lectoras, aprovechando la entrada por grafemas que evita errores de fonemización.
- Asistentes de voz locales en OVOS: integración vía `ovos-tts-plugin-phoonnx` seleccionando la voz `openbible/ckb` en `mycroft.conf`, para despliegues de asistente doméstico en kurdo central.
- Preservación lingüística y corpus sonoros: generación de material audio para documentación y enseñanza del sorani, con una voz consistente y reproducible.
- Prototipado de aplicaciones TTS para lenguas de bajos recursos: servir de base o referencia para comparar pipelines con y sin fonemizador en `ckb`.
- Síntesis por lotes en CPU: la variante int8 (RTF 18,546 en un Ryzen 5 7600 con 4 hilos) permite generar audio sin GPU en entornos de servidor modestos, aunque con latencia alta para uso interactivo en tiempo real.
- Clonación de una voz concreta para doblaje o locución: usando un clip de referencia y su transcripción se puede adaptar el timbre a un hablante específico dentro del dominio aprendido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MOS, WER, MMLU, etc.) en la información disponible. La model card únicamente reporta métricas de QA y de eficiencia del runtime:

| Metrica | fp32 | int8 |
|---|---|---|
| Resultado QA (longitud y silencio) | pass | pass |
| Caracteres por segundo | 11,9 | no disponible |
| Longitud int8 / fp32 | no aplica | 1,00 |
| Tamano del grafo | 1448,2 MB | 461,4 MB |
| Pico RSS | 3361,7 MB | 1249,4 MB |
| RTF (mediana de 3, 4 hilos) | 57,222 | 18,546 |

Medición realizada en un AMD Ryzen 5 7600 de 6 núcleos. El RTF es el tiempo de síntesis dividido por la duración del audio; valores superiores a 1 indican síntesis más lenta que tiempo real.

## Requisitos de hardware

- VRAM: no aplica de forma directa; el modelo se ejecuta en CPU con ONNX Runtime. El consumo relevante es memoria RAM: pico RSS de 3361,7 MB en fp32 y 1249,4 MB en int8.
- GPU recomendadas: no se documentan requisitos de GPU; la model card solo reporta mediciones en CPU (AMD Ryzen 5 7600). Cualquier GPU compatible con ONNX Runtime podría acelerar la inferencia, pero no hay datos publicados.
- ¿Cabe en GPU de consumo? Sí, por tamaño (grafo int8 de 461,4 MB), pero no hay benchmarks de rendimiento en GPU disponibles.
- Opciones de despliegue: runtime phoonnx (instalación con `pip install --pre phoonnx`), con integración en OVOS mediante `ovos-tts-plugin-phoonnx`. Al ser ONNX, es portable a otros runtimes compatibles, aunque no se documentan.
- Latencia y throughput: RTF de 57,222 en fp32 y 18,546 en int8 con 4 hilos en el CPU citado. Es decir, la síntesis es entre 18 y 57 veces más lenta que tiempo real en ese hardware; no es apto para interacción en vivo sin aceleración adicional.

## Comparativa con modelos similares

| Modelo | Idioma | Arquitectura | Hablantes | Formato | Licencia | Notas |
|---|---|---|---|---|---|---|
| Phoonnx/f5tts-ckb-openbible-graphemes | ckb | F5-TTS | 1 | ONNX (fp32/int8) | CC BY-SA 4.0 con restricción comercial | Conversión ONNX; entrada por grafemas |
| multilingual-tts/F5-TTS-OpenBible-Central-Kurdish | ckb | F5-TTS | 1 | no disponible en la información | CC BY-SA 4.0 | Modelo upstream del que deriva esta conversión |
| SWivid/F5-TTS | multilingüe | F5-TTS | clonación por referencia | safetensors (según repo original) | CC BY-NC 4.0 | Modelo base original; uso no comercial |

No se dispone en la información proporcionada de otros modelos TTS comparables para kurdo central con los que establecer una comparación cuantitativa de rendimiento.

## Limitaciones y advertencias

- Restricción de uso comercial: aunque la model card declara CC BY-SA 4.0, el modelo deriva de SWivid/F5-TTS (CC BY-NC 4.0), por lo que el uso comercial de esta voz no está permitido según el propio autor.
- Sesgos de dominio: entrenado sobre grabaciones del OpenBible, el modelo puede rendir peor en registros coloquiales, jerga, nombres propios o texto con ortografía no estándar.
- Sin fonemizador: al leer grafemas directamente, la pronunciación de palabras ambiguas o de préstamos puede ser inconsistente; no hay corrección fonética externa.
- QA limitado: la validación se hizo sin ASR (Parakeet no tiene modelo para `ckb`), solo con comprobación de longitud y silencio sobre 3 frases; no hay métricas de inteligibilidad ni de naturalidad (MOS).
- Riesgo de alucinación acústica: como todo modelo generativo de audio, puede producir artefactos, ruidos o prolongaciones no presentes en el texto, especialmente en entradas largas o fuera de dominio.
- Rendimiento: RTF muy superior a 1 en CPU (18,5 en int8, 57,2 en fp32), lo que lo hace inadecuado para aplicaciones de voz en tiempo real sin hardware adicional.
- Mono-hablante nativo: la clonación depende de un clip de referencia y su transcripción; la calidad de la clonación fuera del dominio de entrenamiento no está evaluada.
- Idiomas: solo kurdo central; no soporta otros idiomas ni cambio de voz sin referencia.
- Atribución obligatoria: debe acreditarse a multilingual-tts al usar la voz, según la licencia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/f5tts-ckb-openbible-graphemes
- Modelo upstream: https://huggingface.co/multilingual-tts/F5-TTS-OpenBible-Central-Kurdish
- Modelo base original: https://huggingface.co/SWivid/F5-TTS
- Dataset de entrenamiento: https://huggingface.co/datasets/davidguzmanr/open-bible-resources
- Runtime phoonnx: https://github.com/TigreGotico/phoonnx
- TigreGotico: https://tigregotico.pt
