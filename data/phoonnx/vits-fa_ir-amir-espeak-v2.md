# Phoonnx/vits-fa_ir-amir-espeak-v2

## Resumen

vits-fa_ir-amir-espeak-v2 es una voz de síntesis de voz (text-to-speech) en persa (fa-IR) basada en la arquitectura VITS y empaquetada en formato ONNX para su uso con la librería phoonnx. El modelo es una conversión del checkpoint original `rhasspy/piper-voices/fa/fa_IR/amir/medium`, entrenado por Rhasspy y publicado bajo licencia CC0 1.0. La conversión a ONNX y su publicación corren a cargo de TigreGotico Lda (bajo el identificador Phoonnx), sin modificar los pesos originales; únicamente se añaden copias cuantizadas a int8.

Se trata de una voz monohablante (un único hablante, identificado como "amir") con una frecuencia de muestreo de 22050 Hz. El texto de entrada se procesa mediante fonemas espeak-ng en alfabeto IPA, y el modelo está entrenado para respetar la puntuación de cláusula (coma, punto, signos de exclamación e interrogación, dos puntos y punto y coma). El repositorio ocupa aproximadamente 0,1 GB, lo que refleja el reducido tamaño del grafo (63,2 MB en fp32 y 18,7 MB en int8).

La relevancia de esta ficha es doble: por un lado, sustituye a la versión anterior `Phoonnx/vits-fa_ir-amir-espeak`, ya que el modelo upstream fue reentrenado sobre las bases Piper 1.5 (commit `e9c8a39444`); por otro, demuestra un flujo de conversión y validación reproducible con métricas de QA publicadas (RTF, longitud relativa, RSS pico) que resulta útil para quien despliegue TTS en producción sobre CPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (Piper) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo TTS; entrada por frase) |
| Tipos de cuantizacion | fp32 (ONNX), int8 (quantize_dynamic, QInt8) |
| Idiomas soportados | persa (fa-IR) |
| Licencia | CC0 1.0 |
| Formato de pesos | ONNX (`<graph>.onnx` y `<graph>_int8.onnx`) |
| Frecuencia de muestreo | 22050 Hz |
| Hablantes | 1 |
| Fonemizador | espeak-ng, voz `fa`, alfabeto IPA |
| Puntuacion soportada | `, . ! ? : ;` |
| Tamano del grafo | 63,2 MB (fp32) / 18,7 MB (int8) |
| Tamano del repositorio | ~0,1 GB |
| Libreria | phoonnx (>= 1.96.1a1 para conservar puntuación) |

## Arquitectura y entrenamiento

El modelo emplea VITS (Variational Inference with adversarial learning for end-to-end Text-to-Speech), la arquitectura adoptada por el ecosistema Piper. VITS combina un codificador de texto, un prior variacional, un decoder generativo y un discriminador adversarial entrenado de forma conjunta, lo que permite síntesis end-to-end a partir de fonemas. En esta conversión concreta, la entrada es texto fonemizado con espeak-ng (voz `fa`, alfabeto IPA) y la salida es audio a 22050 Hz.

Según la model card upstream, la voz se entrenó mediante fine-tuning desde el modelo base `rdh` (calidad medium; `nl_BE`, un hablante flamenco, CC0), aplicando MRD y SDP. Los datos de entrenamiento provienen de https://datacula.com/tts-databases con licencia CC0, aunque el número de horas y la composición exacta del dataset no están registrados upstream. Los ajustes de inferencia por defecto son `noise_scale` 0.5 y `noise_w` 0.333, y se requiere Piper 1.5 o superior. No se documenta el uso de RLHF ni DPO, algo esperable en un modelo TTS de este tipo.

La innovación técnica relevante aquí no está en la arquitectura (que es la estándar de Piper), sino en el pipeline de conversión y validación: se generan copias int8 con `onnxruntime.quantization.quantize_dynamic` (onnxruntime 1.32.0) y se aplica una puerta de calidad que verifica que el audio sea finito, no silencioso y que su longitud esté entre 0,8 y 1,25 veces la del fp32. La QA se realizó sin ASR, con comprobaciones de longitud y silencio sobre tres frases de FLORES-200 devtest.

## Capacidades

- Síntesis de voz en persa (fa-IR) a partir de texto con fonemización espeak-ng.
- Respeto de la puntuación de cláusula (`, . ! ? : ;`) para introducir pausas y entonación, siempre que se use phoonnx 1.96.1a1 o superior.
- Salida de audio WAV a 22050 Hz, monohablante.
- Inferencia sobre CPU con latencia baja (RTF 0,042 en fp32 y 0,102 en int8 sobre un i9-11900H).
- Dos variantes de precisión: fp32 para máxima calidad y int8 para menor huella de memoria y tamaño.
- Integración con el ecosistema OVOS mediante el plugin `ovos-tts-plugin-phoonnx`.
- No soporta tool calling, agentes, razonamiento multi-step, visión ni audio de entrada; es exclusivamente un modelo TTS.

## Casos de uso

- Asistentes de voz en persa: integración como motor TTS en OVOS o en cualquier aplicación que use phoonnx, seleccionando la voz `piper_community/SadeghK/amir-v2` en la configuración. El modelo está pensado exactamente para este escenario y su RTF inferior a 0,11 permite respuestas casi en tiempo real en CPU.
- Lectura de contenido en aplicaciones móviles o de escritorio: con un grafo int8 de 18,7 MB y un RSS pico de 239,2 MB, la voz cabe en dispositivos con recursos limitados y puede empaquetarse dentro de la propia aplicación sin dependencias de red.
- Sistemas de accesibilidad para personas con discapacidad visual: conversión de texto a voz en persa para lectores de pantalla, aprovechando la baja latencia y la ausencia de coste por llamada al ser un modelo local con licencia CC0.
- Generación de audiolibros o pódcasts automatizados: el modelo procesa frases con puntuación, lo que permite segmentar textos largos en cláusulas y sintetizarlas secuencialmente con pausas naturales; la variante fp32 ofrece la máxima calidad.
- Pruebas y desarrollo de pipelines TTS: al publicar métricas de QA reproducibles (RTF, longitud relativa, RSS), sirve como referencia para validar conversiones ONNX propias o para comparar el impacto de la cuantización int8 frente a fp32.
- Integración en sistemas de respuesta por voz (IVR) o domótica: al ejecutarse en CPU sin GPU, puede desplegarse en servidores modestos o en dispositivos edge que necesiten anunciar información en persa con latencia predecible.

## Benchmarks y rendimiento

La model card no incluye benchmarks estándar de TTS (MOS, WER, etc.), pero sí métricas de QA técnicas medidas sobre un Intel Core i9-11900H a 2,50 GHz:

| Metrica | fp32 | int8 |
|---|---|---|
| Resultado QA (longitud y silencio) | pass | pass |
| Caracteres por segundo | 10,8 a 15,9 | no disponible |
| Longitud int8 / fp32 | no aplica | 0,98 a 1,00 |
| Tamano del grafo | 63,2 MB | 18,7 MB |
| RSS pico | 276,7 MB | 239,2 MB |
| RTF (mediana de 3, 4 hilos) | 0,042 | 0,102 |

No se han publicado resultados de benchmarks estandar (MOS, MCD, WER) en la informacion disponible.

## Requisitos de hardware

- VRAM: no aplica; el modelo está diseñado para inferencia en CPU mediante ONNX Runtime. No se documenta despliegue en GPU.
- RAM: RSS pico de 276,7 MB en fp32 y 239,2 MB en int8, medido en el hardware de referencia.
- CPU: funciona en cualquier CPU x86-64 moderna; las métricas se obtuvieron con 4 hilos en un i9-11900H. No se especifican requisitos mínimos oficiales.
- GPU: no se documenta soporte ni recomendación de GPU (A100, H100, RTX 4090, etc.). El modelo está optimizado para CPU.
- Cabe en cualquier equipo de consumo: el grafo int8 de 18,7 MB y el consumo de memoria inferior a 300 MB lo hacen apto para Raspberry Pi y dispositivos similares, aunque no se publican métricas en esa plataforma.
- Opciones de despliegue: phoonnx (librería principal), plugin `ovos-tts-plugin-phoonnx` para OVOS, y ONNX Runtime de forma directa. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: RTF 0,042 (fp32) y 0,102 (int8) sobre el hardware de referencia; es decir, sintetizar un segundo de audio cuesta entre 42 y 102 ms de cómputo con 4 hilos. El throughput en caracteres por segundo es de 10,8 a 15,9 en fp32.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Hablantes | Formato | Licencia | Contexto/entrada |
|---|---|---|---|---|---|---|
| vits-fa_ir-amir-espeak-v2 (este) | VITS (Piper) | fa-IR | 1 | ONNX (fp32/int8) | CC0 1.0 | Frase fonemizada espeak-ng |
| rhasspy/piper-voices fa_IR amir/medium | VITS (Piper) | fa-IR | 1 | Piper (ONNX upstream) | CC0 1.0 | Frase fonemizada espeak-ng |
| Phoonnx/vits-fa_ir-amir-espeak (version anterior) | VITS (Piper) | fa-IR | 1 | ONNX | CC0 1.0 | Pesos anteriores a Piper 1.5 |

La comparación más directa es con el modelo upstream de Rhasspy, del que este repositorio es una conversión cuantizada, y con la versión anterior del mismo autor, que conserva pesos previos al reentrenamiento sobre Piper 1.5. No se dispone de datos de benchmarks comparativos entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Modelo exclusivamente TTS: no realiza comprensión de texto, razonamiento ni generación; no admite tool calling ni agentes.
- Idioma único: solo persa (fa-IR); no se documenta soporte multilingüe.
- Dependencia de espeak-ng: sin el binario `espeak-ng` instalado, phoonnx usa el port espyak, cuyos fonemas pueden diferir y provocar pronunciaciones incorrectas de algunas palabras.
- La puntuación solo se conserva con phoonnx 1.96.1a1 o superior; versiones anteriores pueden perder las pausas de cláusula.
- Requiere Piper 1.5 o superior en el flujo upstream; los pesos no son compatibles con versiones anteriores del ecosistema Piper.
- La calidad de la voz depende del checkpoint upstream, cuyo dataset de entrenamiento no está registrado (número de horas, composición y calidad no documentados).
- Riesgo de alucinación en el sentido de pronunciación incorrecta o entonación anómala en palabras fuera del dominio de entrenamiento; la QA publicada se limita a tres frases de FLORES-200 y a comprobaciones de longitud y silencio, sin ASR ni evaluación perceptual (MOS).
- No se han publicado evaluaciones de sesgos; al ser una voz sintética de un único hablante, no reproduce sesgos demográficos de la misma forma que un LLM, pero la naturalidad y prosodia pueden no representar variedades del persa distintas a las del hablante original.
- Licencia CC0 1.0: permite uso comercial sin restricciones, pero se recomienda atribuir a Rhasspy como autor original de los pesos, tal como indica la model card.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de uso en producción ni validación comunitaria independiente.

## Enlaces

- Hugging Face: https://huggingface.co/Phoonnx/vits-fa_ir-amir-espeak-v2
- Modelo upstream: https://huggingface.co/rhasspy/piper-voices/tree/e9c8a39444359388adaa94255becb37a5a2b8e51/fa/fa_IR/amir/medium
- Repositorio phoonnx: https://github.com/TigreGotico/phoonnx
- TigreGotico: https://tigregotico.pt
- Dataset de entrenamiento upstream: https://datacula.com/tts-databases
- Version anterior: https://huggingface.co/Phoonnx/vits-fa_ir-amir-espeak
