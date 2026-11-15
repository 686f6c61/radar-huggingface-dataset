# hencohen83/ivrit-whisper-large-v3-w8a16-encoder-qnn-sm8750

## Resumen

`hencohen83/ivrit-whisper-large-v3-w8a16-encoder-qnn-sm8750` es un artefacto de despliegue experimental: contiene únicamente el encoder del modelo de reconocimiento automático del habla en hebreo `ivrit-ai/whisper-large-v3` (release 2025.05.13), compilado como context binary de QNN para la NPU Hexagon v79 del Snapdragon 8 Elite (SM8750). Lo publica hencohen83, no ivrit.ai, y todo el mérito del modelo original corresponde a ivrit.ai. No es un modelo entrenado de cero ni un fine-tune: es una conversión de precisión reducida (w8a16) del encoder a un formato ejecutable en NPU.

El problema que resuelve es de latencia en dispositivos móviles. El decoder de Whisper large-v3 tiene 32 capas y requiere una llamada por token en la NPU, lo que lo hace inadecuado para aceleración por hardware; el encoder, en cambio, ejecuta un único cálculo grande por ventana de 30 segundos y sí se beneficia de la NPU. La arquitectura propuesta es híbrida: la NPU calcula las claves y valores de cross-attention de las 32 capas del decoder a partir del log-mel, y whisper.cpp en la CPU decodifica a partir de ellos con el modelo ggml de ivrit.ai.

Es relevante ahora porque demuestra una vía práctica para ASR en hebreo totalmente local en un smartphone, sin enviar audio a la nube. El estado es explícitamente experimental: validado en el simulador x86 de Qualcomm sobre Mac, con una medición parcial en un Galaxy S25 (3,3–7,5 s por ventana de 30 s) pero sin el decoder de whisper.cpp conectado todavía y sin métricas de texto ni de batería del pipeline completo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Whisper large-v3 (transformer encoder-decoder); este repo contiene solo el encoder exportado a ONNX y compilado a QNN context binary |
| Parametros totales | no disponible (el fichero `encoder.bin` ocupa 932.503.552 bytes; el modelo base es Whisper large-v3) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | ventana de audio de 30 s por inferencia; log-mel de 128 bins y 3000 frames |
| Tipos de cuantizacion | w8a16: pesos 8 bits por canal, activaciones 16 bits, bias 32 bits; entradas y salidas en float16 |
| Idiomas soportados | hebreo (he) |
| Licencia | Apache-2.0 |
| Formato de pesos | QNN context binary (`encoder.bin`); el modelo base está en safetensors y existe versión GGML para whisper.cpp |

## Arquitectura y entrenamiento

El modelo subyacente es Whisper large-v3, un transformer encoder-decoder para ASR, en la variante afinada para hebreo por ivrit.ai. Este repositorio no entrena ni afina nada: parte de los safetensors de precisión completa de `ivrit-ai/whisper-large-v3` (commit `766847c9`), los convierte al formato de checkpoint de openai-whisper y los exporta a ONNX con `scripts/whisper/qnn/export_onnx.py` de sherpa-onnx v2.0.1. La exportación produce como entrada el log-mel (`large_v3_mel`, float16, [1, 3000, 128]) y como salidas las claves y valores de cross-attention de cada una de las 32 capas del decoder (`cross_k_0`…`cross_k_31`, `cross_v_0`…`cross_v_31`, float16, [1, 1500, 1280] cada una).

La cuantización se realizó con QAIRT 2.40.0.251030 mediante `qnn-onnx-converter`, con pesos de 8 bits por canal, activaciones de 16 bits (incluidas las entradas en tiempo de ejecución de la atención), bias de 32 bits y entradas/salidas en float16. La calibración usó exclusivamente voz pública: 100 ventanas de 30 s del conjunto FLEURS hebreo (`he_il`, dev y test, commit `70bb2e84`, CC-BY-4.0), con las frases unidas en grabaciones largas. El binario final se generó con `qnn-context-binary-generator` para SM8750. La innovación técnica no está en el modelo sino en el reparto de cómputo: la NPU produce las K/V de cross-attention y whisper.cpp, mediante el parche `whisper.cpp-external-encoder.patch`, escala las K y rellena su caché de cross-attention, con la opción `skip_encoder` para no cargar los pesos del encoder propio.

## Capacidades

- Reconocimiento automático del habla en hebreo, heredado del modelo base de ivrit.ai.
- Cálculo del encoder completo de Whisper large-v3 por ventana de 30 s de audio: extracción de las claves y valores de cross-attention de las 32 capas del decoder.
- Integración con whisper.cpp mediante `whisper_set_external_encoder()` y `skip_encoder`, delegando la decodificación a la CPU.
- Exposición de una API C pequeña para ejecutar el fichero en la NPU (`SherpaOnnxQnnWhisperEncoder*`), publicada en `hencohen83/sherpa-onnx-qnn-android`.
- No incluye el decoder, los tokens ni la tokenización: esos provienen del fichero ggml de whisper.cpp.
- No soporta tool calling, agentes, visión, audio más allá del ASR ni modos de razonamiento; es un componente de inferencia especializado.

## Casos de uso

- Transcripción de voz local en Android de gama alta: integrado en una app con whisper.cpp y el modelo ggml de ivrit.ai, el encoder se ejecuta en la NPU del Snapdragon 8 Elite y el audio no sale del dispositivo, lo que elimina requisitos de privacidad y de conectividad.
- Subtitulado de reuniones o clases en hebreo en tiempo casi real: con ventanas de 30 s y un coste de encoder de 3,3–7,5 s medido en Galaxy S25, es viable para transcripción diferida por segmentos en un móvil.
- Dictado por voz en aplicaciones de productividad: al liberar la CPU del trabajo del encoder, el decoder de whisper.cpp dispone de más margen para mantener la interfaz fluida.
- Investigación en despliegue de ASR en NPU: sirve como referencia reproducible de exportación ONNX, cuantización w8a16 y generación de context binary para Hexagon v79, con scripts públicos en `transcriptor-kmp/scripts/npu/`.
- Evaluación comparativa de precisión tras cuantización: permite medir la degradación del encoder cuantizado frente al de precisión completa (coseno 0,974–0,994 en el simulador) sobre audio hebreo real.
- Prototipado de pipelines híbridos NPU/CPU: el parche de whisper.cpp y la API C de sherpa-onnx permiten experimentar con reparto de cómputo entre acelerador y CPU en dispositivos Snapdragon.
- Archivado y transcripción offline de grabaciones en hebreo en dispositivos sin conectividad, como entornos sanitarios o de campo, siempre que el hardware sea SM8750.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (WER, MMLU, HumanEval, GSM8K) en la información disponible. Los únicos datos son de validación interna, medidos en el simulador x86 de Qualcomm sobre Mac y en un dispositivo real:

| Prueba | Entorno | Resultado |
|---|---|---|
| Similitud coseno de salidas del encoder frente al modelo de precisión completa (32 capas) | Simulador x86 de Qualcomm, ventana de 30 s no vista en calibración | 0,974–0,994 |
| Texto hebreo decodificado con whisper.cpp desde salidas cuantizadas frente a precisión completa | Simulador x86 de Qualcomm | Idéntico |
| Tiempo de encoder por ventana de 30 s | Galaxy S25 (SM8750), sin decoder de whisper.cpp conectado | 3,3–7,5 s |
| Texto final y consumo de batería del pipeline completo | Dispositivo real | No medido |

## Requisitos de hardware

- NPU objetivo: Hexagon v79 del Snapdragon 8 Elite (SM8750). No es portable a otras NPU sin recompilar el context binary.
- Almacenamiento: el fichero `encoder.bin` ocupa 932.503.552 bytes (aproximadamente 0,9 GB); el repo completo pesa 0,9 GB.
- Memoria: cargar el fichero con un runtime que lo mapee en lugar de leerlo en memoria; según el autor, leerlo y copiarlo eleva el pico de carga a unas 2,5 veces el tamaño del fichero.
- Runtime: librerías QNN 2.40.0.251030 (`libQnnHtp.so`, `libQnnHtpV79Skel.so`, `libQnnHtpV79Stub.so`, `libQnnSystem.so`), publicadas por sherpa-onnx como `qnn-libs-2.40.0.251030`; no se incluyen en el repo.
- CPU: se requiere whisper.cpp con el parche de encoder externo y el modelo ggml de ivrit.ai para la decodificación.
- GPU: no aplica; el artefacto está pensado para NPU móvil, no para A100, H100 ni RTX 4090.
- Despliegue: sherpa-onnx-qnn-android (API C `SherpaOnnxQnnWhisperEncoder*`) o integración directa con el parche de whisper.cpp. No hay soporte documentado para vLLM, TGI, Ollama ni llama.cpp.
- Latencia: 3,3–7,5 s por ventana de 30 s en Galaxy S25, solo encoder. Throughput del pipeline completo: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este artefacto (encoder QNN SM8750) | no disponible (0,9 GB en disco) | ventana de 30 s de audio | QNN context binary | Apache-2.0 | Hugging Face, experimental |
| `ivrit-ai/whisper-large-v3` (modelo base) | Whisper large-v3 (no disponible en la información) | ventana de 30 s de audio | safetensors | Apache-2.0 | Hugging Face, listo para producción |
| `ivrit-ai/whisper-large-v3-ggml` | Whisper large-v3 (no disponible en la información) | ventana de 30 s de audio | GGML | Apache-2.0 | Hugging Face, para whisper.cpp en CPU |
| OpenAI Whisper large-v3 | 1.550 M (dato público del modelo original, no incluido en la información proporcionada) | ventana de 30 s de audio | safetensors, GGML | MIT (modelo original; verificar) | Hugging Face y openai-whisper |

La comparación relevante no es de calidad de transcripción sino de ruta de ejecución: el modelo base y la versión GGML priorizan portabilidad y madurez, mientras que este artefacto prioriza aceleración en una NPU concreta a cambio de acoplarse a un SoC y a una versión de runtime específicos. No hay datos de WER comparativos entre las tres variantes en la información disponible.

## Limitaciones y advertencias

- Estado experimental: validado en el simulador x86 de Qualcomm, no en el pipeline completo en un teléfono; el texto final y el consumo de batería no se han medido.
- Dependencia dura de hardware: solo funciona en Snapdragon 8 Elite (SM8750, Hexagon v79); no es portable a otros SoC sin recompilar.
- Dependencia de versión de runtime: requiere QNN 2.40.0.251030; otras versiones pueden no cargar el context binary.
- Solo encoder: no produce transcripciones por sí mismo; necesita whisper.cpp con el parche y el modelo ggml de ivrit.ai para el decoder y los tokens.
- Solo hebreo: no cubre otros idiomas aunque el Whisper original sea multilingüe.
- Riesgo de degradación por cuantización: la similitud coseno medida es 0,974–0,994, no 1,0; la fidelidad en audio fuera de la distribución de calibración (FLEURS hebreo) no está caracterizada.
- Calibración limitada a FLEURS: 100 ventanas de 30 s de voz pública; dominios como ruido de fondo, acentos marcados o audio telefónico pueden degradar más.
- Gestión de memoria delicada: cargar el fichero sin mapeo multiplica el pico de memoria por unas 2,5 veces.
- Licencia: Apache-2.0, igual que el original; se exige atribución a ivrit.ai ("whisper-large-v3 by ivrit.ai (Apache-2.0)"). Las librerías QNN son de Qualcomm y no se distribuyen en el repo, por lo que su uso queda sujeto a los términos de Qualcomm.
- Sesgos y alucinaciones: no documentados en la información disponible para este artefacto; hereda los del modelo base de ivrit.ai, no caracterizados aquí.

## Enlaces

- Repositorio del artefacto: https://huggingface.co/hencohen83/ivrit-whisper-large-v3-w8a16-encoder-qnn-sm8750
- Modelo base: https://huggingface.co/ivrit-ai/whisper-large-v3
- Commit del modelo base usado: https://huggingface.co/ivrit-ai/whisper-large-v3/tree/766847c9
- Versión GGML para whisper.cpp: https://huggingface.co/ivrit-ai/whisper-large-v3-ggml
- ivrit.ai: https://www.ivrit.ai
- whisper.cpp: https://github.com/ggml-org/whisper.cpp
- Scripts de exportación y compilación: https://github.com/chencohensolutions/transcriptor-kmp/tree/main/scripts/npu
- Documentación de build: `docs/npu-build.md` en el repositorio anterior
- API C para la NPU: https://huggingface.co/hencohen83/sherpa-onnx-qnn-android
- Dataset de calibración FLEURS: https://huggingface.co/datasets/google/fleurs (commit `70bb2e84`, CC-BY-4.0)
