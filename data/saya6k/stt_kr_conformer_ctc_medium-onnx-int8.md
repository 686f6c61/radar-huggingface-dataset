# saya6k/stt_kr_conformer_ctc_medium-onnx-int8

## Resumen

El modelo `saya6k/stt_kr_conformer_ctc_medium-onnx-int8` es una exportación a ONNX con cuantización dinámica int8 del modelo de reconocimiento automático del habla (ASR) en coreano `SungBeom/stt_kr_conformer_ctc_medium`, un Conformer-CTC de NVIDIA RIVA ajustado sobre corpus de AI Hub. El autor de la exportación, saya6k, lo publica con el objetivo explícito de ejecutarlo en CPU dentro de Home Assistant mediante el backend onnx-asr y el componente Wyoming, lo que lo convierte en una pieza práctica para asistentes de voz locales en coreano.

La relevancia del artefacto está en el empaquetado: reduce el checkpoint original `.nemo` a un único `model.onnx` de 198 MB con cuantización int8 dinámica, sin dependencia de GPU ni de NeMo en tiempo de inferencia. El repositorio completo ocupa 0,2 GB e incluye vocabulario SentencePiece (`vocab.txt`, `tokens.txt`) y un `config.json` compatible con onnx-asr, lo que permite cargarlo con una sola línea de Python.

Arquitectónicamente es un transformer Conformer con cabecera CTC y subsampling de factor 4, entrenado sobre espectrogramas log-mel de 80 bins a 16 kHz. La licencia Apache-2.0 y el soporte nativo de Home Assistant lo sitúan como una opción realista para domótica por voz en coreano sobre hardware modesto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Conformer encoder + cabecera CTC (NeMo Conformer-CTC) |
| Parametros totales | no disponible (el autor solo reporta tamano de fichero: 198 MB en int8) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (la entrada es `[batch, 80, frames]`; el limite practico lo fija la memoria y el backend) |
| Tipos de cuantizacion | int8 dinamica (unica variante publicada en este repo) |
| Idiomas soportados | coreano (`ko`) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (`model.onnx`), mas `vocab.txt`, `tokens.txt` y `config.json` |

## Arquitectura y entrenamiento

El modelo base es un Conformer-CTC de NVIDIA RIVA para coreano, ajustado por SungBeom sobre varios conjuntos de AI Hub: habla de atención al cliente, habla coreana general, habla conversacional coreana, conversación libre, consultas de call center de bienestar, conversación en vehículo y habla de comandos. La arquitectura combina bloques Conformer (convolución + autoatención) con una cabecera CTC, y aplica un subsampling de factor 4 sobre la secuencia de entrada, de modo que la salida `logprobs` tiene forma `[batch, frames/4, 2049]`; el id 2048 corresponde al token `<blk>` del vocabulario SentencePiece.

La exportación a ONNX mantiene dos entradas (`audio_signal` y `length`) y una salida (`logprobs`) y aplica cuantización dinámica int8 para ejecución en CPU. El modelo no incluye el extractor de características: hay que alimentarlo con log-mel de NeMo (16 kHz, 80 bins, ventana de 25 ms, hop de 10 ms, pre-énfasis 0.97 y normalización por característica). No se documentan en la información disponible detalles sobre número de tokens de entrenamiento, uso de RLHF/DPO ni innovaciones adicionales más allá del pipeline de exportación y cuantización.

## Capacidades

- Reconocimiento de voz en coreano a partir de audio de 16 kHz, con salida de log-probabilidades CTC.
- Decodificación greedy incluida en el flujo de onnx-asr (sin LM externo en la evaluación publicada).
- Ejecución en CPU gracias a la cuantización int8 dinámica (198 MB de pesos).
- Integración directa con Home Assistant mediante el componente Whisper con backend onnx-asr (modelo `custom`, tipo `onnx-asr`, idioma `ko`).
- Integración con el stack Wyoming para asistentes de voz locales.
- Carga sencilla vía `onnx_asr.load_model(...)` y método `recognize()` sobre ficheros WAV.
- No soporta tool calling, agentes, visión ni audio más allá del ASR; es un modelo puramente acústico-lingüístico de transcripción.

## Casos de uso

- **Domótica por voz en coreano con Home Assistant**: el caso de uso principal documentado por el autor. Se configura como modelo `custom` en el componente Whisper con backend onnx-asr e idioma `ko`, y procesa comandos como "거실 불 켜줘" o "에어컨 이십삼 도로 맞춰 줘" en local, sin enviar audio a la nube.
- **Asistente de voz embebido en Raspberry Pi o mini-PC**: al pesar 198 MB en int8 y ejecutarse en CPU, cabe en dispositivos de bajos recursos donde un modelo en fp16 no sería viable, manteniendo la privacidad del audio en el hogar.
- **Transcripción de comandos de automoción**: el modelo base se ajustó con el corpus de conversación en vehículo de AI Hub, por lo que es adecuado para prototipos de control por voz dentro del coche con vocabulario acotado.
- **Transcripción de llamadas de call center**: el ajuste incluye corpus de atención al cliente y consultas de call center de bienestar; puede emplearse para generar transcripciones preliminares en coreano que luego se revisen o se procesen con un LLM.
- **Prototipado rápido de pipelines ASR en Python**: con `onnx-asr` basta una línea para cargar el modelo y transcribir un WAV, lo que lo hace útil para validar hipótesis de producto antes de invertir en infraestructura GPU.
- **Sistemas de dictado offline en coreano**: para aplicaciones de escritorio o móviles que requieran transcripción local sin conexión, el formato ONNX int8 simplifica el despliegue multiplataforma (ONNX Runtime).
- **Evaluación comparativa de cuantización**: sirve como referencia para medir la pérdida de precisión de int8 dinámica frente al checkpoint `.nemo` original en tareas de comandos cortos.

## Benchmarks y rendimiento

El autor reporta una evaluación propia sobre 315 comandos de hogar pronunciados por voz sintética (KSS, Piper) con decodificación greedy: 286 transcripciones correctas (aproximadamente 90,8 % de acierto, es decir, ~9,2 % de error en ese conjunto). El error más frecuente es la confusión entre 켜 y 꺼, que difieren en una vocal. Además, la model card del modelo original indica un WER de 11,51 sobre su conjunto de test.

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible, ya que no aplican a un modelo ASR.

| Evaluacion | Conjunto | Resultado |
|---|---|---|
| Acierto en comandos de hogar | 315 comandos sinteticos (KSS, Piper), greedy | 286 correctos (~90,8 %) |
| WER del modelo original | Test set del modelo base (segun su model card) | 11,51 |

## Requisitos de hardware

- **VRAM**: no requiere GPU; el modelo está pensado para CPU. Los pesos int8 ocupan 198 MB y el consumo de RAM en ejecución es del orden de unos cientos de MB, dependiendo del backend y del tamaño del audio.
- **GPU recomendadas**: no aplica para el caso de uso previsto; puede ejecutarse en GPU vía ONNX Runtime si se desea, pero no es el objetivo del artefacto.
- **Consumer GPU**: irrelevante; el despliegue objetivo es CPU (Raspberry Pi, mini-PC, NAS doméstico).
- **Opciones de despliegue**: `onnx-asr` (Python), ONNX Runtime, Home Assistant con el componente Whisper y backend onnx-asr, y el stack Wyoming para asistentes de voz.
- **Latencia y throughput**: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idioma | Licencia | Formato / despliegue |
|---|---|---|---|---|---|
| saya6k/stt_kr_conformer_ctc_medium-onnx-int8 | no disponible (198 MB int8) | no disponible | ko | Apache-2.0 | ONNX int8, CPU, onnx-asr |
| SungBeom/stt_kr_conformer_ctc_medium (modelo base) | no disponible | no disponible | ko | Apache-2.0 | `.nemo` (NeMo), requiere stack NVIDIA |
| Whisper (variantes multilingues de OpenAI) | no disponible en esta busqueda | no disponible | multilingue | MIT (variantes open source) | safetensors, GGUF, ONNX; amplio ecosistema |

No se dispone de datos de benchmarks comparativos entre estos modelos en la información proporcionada; la comparación se limita a formato, licencia e idioma.

## Limitaciones y advertencias

- **Idioma único**: solo reconoce coreano; no es multilingüe.
- **Confusiones acústicas documentadas**: el autor señala errores frecuentes entre 켜 y 꺼, con impacto directo en comandos de encendido/apagado.
- **Evaluación limitada**: el ~90,8 % de acierto se midió sobre voz sintética (KSS, Piper) y 315 comandos; el rendimiento con voz real, ruido ambiental o acentos no está documentado.
- **Dependencia del preprocesado**: el modelo no incluye el extractor de características; hay que replicar exactamente los log-mel de NeMo (16 kHz, 80 bins, ventana 25 ms, hop 10 ms, pre-énfasis 0.97, normalización por característica) o la precisión se degrada.
- **Cuantización int8**: no se documenta la pérdida de precisión frente al checkpoint original más allá de la evaluación de comandos; conviene validar en el dominio propio.
- **Riesgo de alucinación**: como todo modelo CTC, puede producir transcripciones plausibles en audio ruidoso o fuera de dominio; no hay mecanismo de confianza expuesto en la model card.
- **Licencia**: Apache-2.0 permite uso comercial, pero el modelo base se ajustó con corpus de AI Hub, cuyas condiciones de uso deben verificarse por separado para explotación comercial.
- **Madurez**: repositorio con 0 descargas y 0 likes en el momento de la consulta; sin mantenimiento ni comunidad documentada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/saya6k/stt_kr_conformer_ctc_medium-onnx-int8
- Modelo base: https://huggingface.co/SungBeom/stt_kr_conformer_ctc_medium
- Librería onnx-asr: https://github.com/istupakov/onnx-asr
