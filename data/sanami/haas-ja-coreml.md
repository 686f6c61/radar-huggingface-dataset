# Sanami/haas-ja-coreml

## Resumen

Sanami/haas-ja-coreml es una conversión no oficial a Core ML del modelo de reconocimiento automático del habla (ASR) en japonés third-intelligence/Haas-ja-v1.0. El paquete incluye los pesos convertidos y cuantizados (encoder en INT8 solo pesos, decoder y joint en fp32) junto con código de inferencia en Swift y Python, lo que permite ejecutar reconocimiento de voz en japonés completamente en dispositivo sobre el Apple Neural Engine (ANE) de iPhone y Mac.

El modelo resuelve el problema de desplegar ASR japonés de calidad en hardware Apple sin depender de la nube: el encoder FastConformer de 24 capas se ejecuta en ANE con una ventana fija de 15,04 segundos, y el decoder TDT (Token-and-Duration Transducer) con predicción KDA se ejecuta en CPU. El repositorio ocupa 0,6 GB y requiere iOS 17 / macOS 14 o superior.

Es relevante ahora porque demuestra que un modelo ASR de tipo transducer puede convertirse a Core ML con cuantización INT8 y mantener una tasa de coincidencia de tokens de 32/33 frente a la implementación de referencia en NeMo, con un RTFx de aproximadamente 85 en un MacBook Air M1. La licencia Apache-2.0 en pesos y código facilita su integración en aplicaciones comerciales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastConformer (encoder, 24 capas) + TDT (Token-and-Duration Transducer) con predicción KDA |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | ventana fija de 15,04 segundos de audio por inferencia; audio largo mediante ventanas deslizantes con solape (se descartan 2,08 s en cada extremo) |
| Tipos de cuantizacion | encoder INT8 solo pesos (per-channel); decoder y joint en fp32 |
| Idiomas soportados | japonés (ja) |
| Licencia | Apache-2.0 (pesos y código; atribución en NOTICE) |
| Formato de pesos | Core ML (.mlpackage): encoder_T1504_w8.mlpackage, decoder.mlpackage, joint_enc.mlpackage, joint.mlpackage; tokenizer.model (SentencePiece) |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transducer TDT con encoder FastConformer de 24 capas. La conversión a Core ML divide el modelo en cuatro paquetes: el encoder (565 MB, INT8 solo pesos, entrada mel [1,128,1504] más longitud, salida [1,1024,188]) que se ejecuta en ANE; el decoder (16 MB, red de predicción KDA más la parte de predicción del joint, fp32) en CPU; joint_enc (2,5 MB) y joint (7,5 MB, incluye argmax de token y duración). El encoder trabaja con una ventana fija de 15,04 segundos, por lo que el audio más largo se procesa por ventanas deslizantes con descarte de 2,08 segundos en cada borde y concatenación posterior.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si el modelo original empleó RLHF o DPO; esos detalles corresponden a la model card del modelo base third-intelligence/Haas-ja-v1.0, no incluida en la información proporcionada. La innovación técnica destacable de esta conversión es la cuantización INT8 solo de pesos del encoder para ejecución en ANE, junto con la inclusión de código Swift completo (log-mel con Accelerate, troceado, decodificación TDT greedy y tokenizador) empaquetado como Swift Package reutilizable en aplicaciones iOS.

## Capacidades

- Reconocimiento automático del habla en japonés, en dispositivo, sin conexión a red.
- Ejecución del encoder en Apple Neural Engine y del decoder/joint en CPU, con reparto explícito de cómputo entre ambos.
- Procesamiento de audio largo mediante ventanas deslizantes de 15,04 s con solape y descarte de bordes.
- Preprocesado de audio integrado: cálculo de log-mel mediante Accelerate en la implementación Swift.
- Decodificación TDT greedy con predicción de token y duración (argmax sobre ambos).
- Tokenización SentencePiece incluida (tokenizer.model).
- API reutilizable en Swift (`HaasCore`) integrable como Swift Package en apps iOS y macOS.
- Script de inferencia en Python para macOS (`python/haas_coreml.py`).
- No se documentan capacidades de traducción, diarización, tool calling ni generación de texto; el modelo es exclusivamente ASR.

## Casos de uso

- Transcripción de voz en aplicaciones iOS: integración de `HaasCore` como Swift Package para convertir dictado o notas de voz en texto sin enviar audio a servidores, aprovechando la ejecución en ANE y el requisito de iOS 17 o superior.
- Subtitulado local de contenido en japonés: procesamiento por ventanas de 15,04 s con solape permite transcribir grabaciones largas en un MacBook Air M1 a RTFx aproximado de 85 (un minuto de audio en unos 0,7 segundos).
- Asistentes de voz offline en dispositivos Apple: al no requerir red, encaja en escenarios con privacidad estricta o conectividad intermitente, con el modelo completo en 591 MB.
- Herramientas de accesibilidad: dictado en japonés en iPhone o Mac para usuarios con movilidad reducida, con latencia baja gracias a la inferencia en ANE.
- Transcripción por lotes en estaciones de trabajo Mac: uso del CLI `haas-cli` o del script Python para procesar archivos de audio en pipelines locales.
- Evaluación y prototipado de ASR japonés: los scripts de conversión (`convert.py`, `quantize.py`, `convert_decoder.py`, `cmlpatch.py`, `validate.py`, `long_eval.py`) permiten reproducir la conversión y comparar contra NeMo.
- Aplicaciones de investigación en lingüística japonesa: transcripción de corpus de audio con control total sobre el hardware y sin cuotas de API.

## Benchmarks y rendimiento

| Metrica | Valor | Entorno |
|---|---|---|
| RTFx global (preprocesado + encoder + decode) | ~85 (RTF 0,0117) | MacBook Air M1 |
| RTF del encoder | 0,0078 | MacBook Air M1 |
| RTF del decode | 0,0037 | MacBook Air M1 |
| Coincidencia de tokens con NeMo (33 audios) | 32/33 (única diferencia: «アップザテン» → «アップザテ») | MacBook Air M1 |
| CER en audio largo (4 emisiones de 120 s) | 8,57 % (igual que fp32 sin segmentar) | MacBook Air M1 |
| Tamano total del modelo | ~591 MB | — |
| Comparativa: speech.cpp 0.10.0 Metal (Q8_0) | RTFx global 63 | MacBook Air M1 |
| Comparativa: ONNX (Rust, int8dyn) | RTFx global 26 | MacBook Air M1 |

La implementación Swift coincide con la inferencia Core ML en Python en los 33 audios de prueba. Las cifras en iPhone real están en medición según la model card. No se publican resultados de benchmarks estándar de ASR (WER/CER sobre corpus públicos como Common Voice o JSUT) en la información disponible.

## Requisitos de hardware

- Almacenamiento: aproximadamente 591 MB para los cuatro paquetes Core ML más el tokenizador.
- Ejecución del encoder en Apple Neural Engine; decoder y joint en CPU. Requiere iOS 17 / macOS 14 o superior.
- Memoria: no se especifica VRAM/RAM mínima; el encoder INT8 de 565 MB y los paquetes fp32 (16 + 2,5 + 7,5 MB) sugieren un consumo moderado, pero no hay cifra publicada.
- GPU/dispositivos recomendados: chips Apple con Neural Engine (M1 o posterior en Mac; iPhone compatible con iOS 17). No aplica a GPU NVIDIA ni AMD.
- No cabe ni está pensado para GPUs de consumidor tipo RTX 4090 ni para CUDA; el despliegue es exclusivamente Core ML.
- Opciones de despliegue: Core ML nativo con Swift Package `HaasCore` o CLI `haas-cli`; script Python en macOS con coremltools, numpy, soundfile, librosa, sentencepiece, torch y onnxruntime. Alternativas del mismo modelo base en otros formatos: ONNX Runtime / tract (Sanami/haas-ja-onnx), speech.cpp con GGUF (sakasegawa/Haas-ja-v1.0-GGUF), sherpa-onnx (oboroge0/Haas-ja-v1.0-onnx y versión cuantizada).
- Throughput y latencia: RTFx ~85 global en M1 (encoder 0,0078 RTF, decode 0,0037 RTF); cifras en iPhone pendientes de publicación.

## Comparativa con modelos similares

| Modelo / formato | Ejecución | RTFx en M1 | Licencia | Disponibilidad |
|---|---|---|---|---|
| Sanami/haas-ja-coreml (este) | Core ML / ANE + Swift | ~85 | Apache-2.0 | HuggingFace, con código Swift y Python |
| Sanami/haas-ja-onnx | ONNX Runtime, tract (Python/Rust) | 26 (Rust, int8dyn) | no disponible en la información | HuggingFace |
| sakasegawa/Haas-ja-v1.0-GGUF | speech.cpp 0.10.0 (Metal, Vulkan, CPU) | 63 (Metal Q8_0) | no disponible en la información | HuggingFace |
| oboroge0/Haas-ja-v1.0-onnx | sherpa-onnx (CPU) | no disponible | no disponible en la información | HuggingFace |

Los cuatro derivan del mismo modelo base third-intelligence/Haas-ja-v1.0, por lo que la calidad ASR es equivalente salvo diferencias de preprocesado (sherpa-onnx calcula las características por su cuenta y no coincide exactamente con NeMo). La ventaja de esta conversión es el rendimiento en hardware Apple; su limitación es que no es portable fuera del ecosistema Core ML.

## Limitaciones y advertencias

- Conversión no oficial: no está creada ni aprobada por Third Intelligence; la responsabilidad sobre el modelo base recae en su model card original.
- Solo japonés: no soporta otros idiomas.
- Ventana fija de 15,04 s: el audio largo depende del troceado con solape y descarte de 2,08 s por borde; errores en esa lógica afectan a la calidad.
- CER del 8,57 % en emisiones de 120 s: adecuado para transcripción asistida, pero no para transcripción perfecta sin revisión.
- Dependencia de plataforma: requiere iOS 17 / macOS 14 o superior y hardware Apple con Neural Engine; no ejecutable en Linux, Windows ni GPU NVIDIA.
- Riesgo de alucinación y errores en nombres propios o términos poco frecuentes, inherente a los modelos ASR; la model card cita como ejemplo la diferencia «アップザテン» frente a «アップザテ».
- Los scripts de evaluación no incluyen audio ni referencias (no redistribuibles); la validación debe hacerse con datos propios.
- Licencia Apache-2.0 en pesos y código, con obligación de atribución según NOTICE; conviene verificar la licencia del modelo base antes de uso comercial.
- Sin métricas publicadas en iPhone real en el momento de la model card; el rendimiento en dispositivo móvil está pendiente de confirmar.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Sanami/haas-ja-coreml
- Modelo base: https://huggingface.co/third-intelligence/Haas-ja-v1.0
- Versión ONNX del mismo autor: https://huggingface.co/Sanami/haas-ja-onnx
- Benchmarks comparativos ONNX: https://huggingface.co/Sanami/haas-ja-onnx/blob/main/BENCHMARKS.md
- Versión GGUF: https://huggingface.co/sakasegawa/Haas-ja-v1.0-GGUF
- speech.cpp: https://github.com/nyosegawa/speech.cpp
- Versión sherpa-onnx: https://huggingface.co/oboroge0/Haas-ja-v1.0-onnx
- Versión sherpa-onnx cuantizada: https://huggingface.co/oboroge0/Haas-ja-v1.0-onnx-quantized
- sherpa-onnx: https://github.com/k2-fsa/sherpa-onnx
- Instrucciones Swift: https://huggingface.co/Sanami/haas-ja-coreml/blob/main/swift/README.md
