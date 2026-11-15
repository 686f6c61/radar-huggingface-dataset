# keptn/gemma4-12b-a4

## Resumen

Gemma 4 12B-it a4 es una cuantización de 4 bits del modelo multimodal `google/gemma-4-12B-it`, publicada por el usuario `keptn` y empaquetada específicamente para el motor de inferencia radiance sobre GPUs AMD RDNA4. El modelo base es un transformer multimodal de Google capaz de procesar texto, imágenes y audio, con una ventana de contexto de 262.144 tokens. Esta versión comprime el tronco a int4 mediante GPTQ y mantiene las activaciones en int8, reduciendo el peso total a un único fichero de 8,79 GiB.

La relevancia de esta ficha radica en que es una de las primeras distribuciones optimizadas para hardware AMD de consumo y profesional (RDNA4, en concreto la Radeon AI PRO R9700), un ecosistema tradicionalmente menos cubierto que el de NVIDIA. Incluye además la cabeza asistente de Google (`gemma-4-12B-it-assistant`) para decodificación especulativa con 3 tokens de borrador, lo que acelera la generación sin cambiar la arquitectura del modelo principal.

El modelo conserva las capacidades del original en texto, visión y audio, pero su licencia Apache 2.0 y su formato propietario `.rad` lo atan al motor radiance 2.0.0 o superior. No es, por tanto, un checkpoint portable a otros runtimes sin reconversión.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (texto, imagen, audio) con cabeza asistente para decodificación especulativa |
| Parámetros totales | 12B (modelo base) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantización | Pesos int4 con punto cero (GPTQ), escala f16 por cada 128 pesos; activaciones int8; lm_head int8 con escala bf16 por cada 128 pesos; torre de visión y encoder de audio en bf16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | `.rad` (formato propietario del motor radiance), fichero único de 8,79 GiB |

## Arquitectura y entrenamiento

El modelo base es un transformer multimodal de Google que integra un tronco de lenguaje, una torre de visión y un encoder de audio, con atención estándar y capacidad de procesar entradas image-text-to-text. La versión aquí descrita no reentrena el modelo: aplica cuantización GPTQ sobre todas las capas lineales del tronco, con un punto cero u8 y una escala f16 por cada 128 pesos. Las capas q, k y v comparten una única pasada de GPTQ, y en las capas 0 a 3 la salida de atención y ambos pesos feed-forward reciben dos rondas de descenso por coordenadas para mejorar la fidelidad. No se aplica SmoothQuant.

La calibración se realizó con el conjunto `keptn/quant-calibration-v1` (revisión `3969b2f9`), con filas seleccionadas por categoría mediante semilla fija y truncadas a 4.096 tokens cada una. Los dos `lm_head` (el del tronco y el de la cabeza asistente) se redondearon a int8 con escala bf16 por cada 128 pesos; el resto de la cabeza asistente, la torre de visión y el encoder de audio permanecen en bf16. La cabeza asistente de Google se incorpora para decodificación especulativa con 3 tokens de borrador, lo que constituye la innovación técnica más destacable de este paquete.

## Capacidades

- Generación de texto y razonamiento multi-turno con hasta 262.144 tokens de contexto.
- Procesamiento de imágenes (image-text-to-text), con evaluación sobre DocVQA y AI2D.
- Procesamiento de audio, con transcripción evaluada sobre LibriSpeech test-clean (WER del 6,81% en radiance frente al 6,68% del original en HF).
- Modo "thinking" activable por petición mediante `chat_template_kwargs: {"enable_thinking": true}`.
- Decodificación especulativa con la cabeza asistente de Google (3 tokens de borrador), configurable o desactivable.
- Soporte de plantilla de chat propia del modelo base.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.

## Casos de uso

- **Atención al cliente multimodal**: el modelo puede gestionar conversaciones multi-turno con contexto largo (262.144 tokens) e incorporar capturas o documentos enviados por el usuario, gracias a su torre de visión y a la ventana extendida.
- **Análisis de documentos extensos**: con 262.144 tokens de contexto y capacidad de visión, es adecuado para extraer información de contratos, informes o expedientes completos en una sola pasada, sin fragmentación.
- **Transcripción y análisis de audio**: el encoder de audio permite transcribir clips (WER en torno al 6,8% en LibriSpeech test-clean) y combinarlos con razonamiento textual en la misma sesión.
- **Asistente de código en pipelines locales**: al ejecutarse en GPUs AMD RDNA4 con 32 GB, puede desplegarse en estaciones de trabajo con hardware AMD para autocompletado y revisión de código sin depender de la nube.
- **Despliegue en infraestructura AMD**: es una opción directa para organizaciones con Radeon AI PRO R9700 que necesiten servir un modelo multimodal de 12B con decodificación especulativa y KV cache en int8.
- **Prototipado de agentes con contexto largo**: la ventana de 262.144 tokens y el modo thinking permiten construir agentes que mantengan historiales extensos y razonen sobre ellos, siempre que se validen las capacidades de tool calling del modelo base.
- **Investigación en cuantización**: sirve como referencia para estudiar el impacto de GPTQ int4 con activaciones int8 en modelos multimodales, con métricas KL publicadas frente al original bf16.

## Benchmarks y rendimiento

Calidad frente al original bf16 en 80 preguntas de MT-Bench (ambos turnos, thinking off, 42.283 tokens de respuesta):

| Modelo | KL media | KL percentil 99 | Token top idéntico | Ratio de perplejidad |
|---|---|---|---|---|
| keptn/gemma4-12b-a4 | 0,0518 | 0,647 | 93,9% | ×0,988 |
| keptn/gemma4-12b-i8g | 0,00542 | 0,0659 | 97,9% | ×1,000 |

Rendimiento en una Radeon AI PRO R9700 a 215 W con radiance 2.0.0, KV en i8, 3 tokens de borrador y thinking off (BetterBench 0.6.1, temperatura 0,7, mediana de tokens por segundo):

| Métrica | 4 tarjetas |
|---|---|
| Decode, un stream | 231,0 tok/s |
| Prefill a 24k tokens | 2.904 tok/s |
| 4 streams, total | 557 tok/s |

Fidelidad multimodal frente al original en HF transformers (greedy, thinking off, 2 tarjetas):

| Entrada | Casos | Misma respuesta | KL media | Token top idéntico |
|---|---|---|---|---|
| Imágenes (DocVQA y AI2D) | 20 | 20/20 | 0,00184 | 149/149 |
| Audio (LibriSpeech test-clean) | 12 | 11/12 | 0,00068 | 350/351 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: el fichero de pesos ocupa 8,79 GiB; el KV cache a 262.144 tokens y 8 secuencias requiere 17,68 GiB por tarjeta en configuración de 1 tarjeta y 16,87 GiB por tarjeta en configuración de 2 tarjetas (KV en i8).
- GPU recomendadas: Radeon AI PRO R9700 (32 GB), probada en configuraciones de 1, 2 y 4 tarjetas.
- Cabe en GPU de consumo: no disponible en la información proporcionada; el autor solo documenta Radeon AI PRO R9700.
- Opciones de despliegue: exclusivamente el motor radiance 2.0.0 o superior, mediante imagen Docker `stilldeadcode/radiance:2.0.0`. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 231 tok/s en decode de un stream con 4 tarjetas, 2.904 tok/s de prefill a 24k tokens y 557 tok/s agregados con 4 streams.
- Requisitos de sistema: ROCm, dispositivos `/dev/kfd` y `/dev/dri`, grupos `video` y `render`, `seccomp=unconfined` y `memlock` ilimitado según el ejemplo del autor.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Hardware |
|---|---|---|---|---|---|
| keptn/gemma4-12b-a4 | 12B | 262.144 | `.rad` (int4/int8) | Apache 2.0 | AMD RDNA4 (radiance) |
| keptn/gemma4-12b-i8g | 12B | no disponible | `.rad` (int8) | Apache 2.0 | AMD RDNA4 (radiance) |
| google/gemma-4-12B-it | 12B | 262.144 (según ficha del autor) | safetensors (bf16) | Apache 2.0 | GPU genérica (HF transformers) |

La comparativa se limita a las variantes del mismo modelo base documentadas por el autor; no se dispone de datos de benchmarks estándar para comparar con alternativas de otros fabricantes.

## Limitaciones y advertencias

- La cuantización int4 introduce una degradación medible: KL media de 0,0518 frente a 0,00542 de la variante int8, y solo el 93,9% de tokens top idénticos frente al 97,9% de la int8.
- El formato `.rad` es propietario y solo lo lee el motor radiance 2.0.0 o superior; no es portable a vLLM, llama.cpp, Ollama, TGI ni transformers sin reconversión.
- El soporte de hardware está limitado a AMD RDNA4; no se documenta funcionamiento en NVIDIA ni en GPUs AMD de generaciones anteriores.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado y actualizado el mismo día (2026-11-15), por lo que no hay validación comunitaria.
- No se especifican los idiomas soportados ni se documentan sesgos conocidos del modelo base en la información disponible.
- Riesgo de alucinación: inherente al modelo base; no se han publicado evaluaciones específicas de veracidad para esta cuantización.
- Licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base de Google y del motor radiance por separado.
- El modo thinking está desactivado por defecto en la configuración de ejemplo; su activación puede alterar el rendimiento y la calidad de forma no documentada.
- La torre de visión puede colocarse en RAM (`vision-tower-placement: ram`), lo que afecta a la latencia de las peticiones con imagen.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/keptn/gemma4-12b-a4
- Modelo base: https://huggingface.co/google/gemma-4-12B-it
- Cabeza asistente: https://huggingface.co/google/gemma-4-12B-it-assistant
- Variante int8 del mismo autor: https://huggingface.co/keptn/gemma4-12b-i8g
- Variante de 31B del mismo autor: https://huggingface.co/keptn/gemma4-31b-a4
- Motor radiance: https://codeberg.org/StillDeadcode/radiance
- Conjunto de calibración: `keptn/quant-calibration-v1` (revisión `3969b2f9`)
