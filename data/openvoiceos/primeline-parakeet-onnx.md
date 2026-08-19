# OpenVoiceOS/primeline-parakeet-onnx

## Resumen

El modelo `OpenVoiceOS/primeline-parakeet-onnx` es una exportación a formato ONNX del modelo de reconocimiento automático de voz (ASR) en alemán `primeline/parakeet-primeline`, desarrollado por Primeline y adaptado por OpenVoiceOS. Se basa en un encoder FastConformer de NVIDIA con un decodificador Token-and-Duration Transducer (TDT), con un total de 600 millones de parámetros. La exportación permite ejecutar la transcripción sin necesidad de PyTorch ni el toolkit NeMo, únicamente con ONNX Runtime a través de la librería `onnx-asr`. El modelo conserva la puntuación y las mayúsculas en la salida, lo que lo hace adecuado para aplicaciones de subtitulado y asistentes de voz.

La relevancia actual reside en su ligereza y portabilidad: al estar en ONNX, puede desplegarse en entornos con recursos limitados, como dispositivos embebidos o asistentes domésticos, y se integra fácilmente en el ecosistema OpenVoiceOS mediante el plugin `ovos-stt-plugin-onnx-asr`. El modelo está disponible en dos variantes de precisión (FP32 e INT8) y se distribuye bajo licencia CC-BY-4.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastConformer encoder + Token-and-Duration Transducer (TDT) decoder |
| Parametros totales | 600 M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (ventana de audio no especificada) |
| Tipos de cuantizacion | FP32, INT8 (dinámica, por canal) |
| Idiomas soportados | Alemán (de) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | ONNX (safetensors no aplica) |

## Arquitectura y entrenamiento

El modelo base `primeline/parakeet-primeline` emplea un encoder FastConformer, una variante eficiente del Conformer que reduce la resolución temporal mediante submuestreo (factor 8) y extrae 128 características mel. El decodificador TDT (Token-and-Duration Transducer) combina la predicción de tokens con la duración de cada segmento, lo que mejora la eficiencia en comparación con los transductores tradicionales. El entrenamiento se hereda del modelo base, del cual no se proporcionan detalles específicos sobre el dataset ni el proceso de entrenamiento en la información disponible. La exportación a ONNX se realizó con NeMo (`ASRModel.export()`), separando el encoder y el decodificador-joint fusionado. Las variantes INT8 se generaron mediante cuantización dinámica de ONNX Runtime con pesos por canal.

## Capacidades

- Reconocimiento automático de voz en alemán, con salida que conserva puntuación y mayúsculas.
- Inferencia sin dependencias de PyTorch ni NeMo, únicamente con ONNX Runtime.
- Soporte para ejecución en CPU y GPU mediante `onnx-asr`.
- Integración nativa con OpenVoiceOS a través del plugin `ovos-stt-plugin-onnx-asr`.
- Dos modos de precisión: FP32 (mayor fidelidad) e INT8 (menor uso de memoria y cómputo).
- No incluye capacidades de tool calling, agentes ni razonamiento multi-step, al ser un modelo puramente ASR.

## Casos de uso

- Asistentes de voz en alemán para dispositivos domésticos: el modelo puede transcribir comandos de voz en tiempo real, gracias a su bajo coste computacional en INT8, integrándose en OpenVoiceOS o sistemas similares.
- Subtitulado automático de vídeos y podcasts en alemán: la salida con puntuación y mayúsculas reduce el postprocesado necesario para generar subtítulos legibles.
- Transcripción de reuniones y entrevistas: con una ventana de contexto adecuada (aunque no especificada), puede procesar grabaciones de larga duración en entornos de oficina.
- Sistemas de atención al cliente automatizados: transcripción de llamadas en alemán para análisis posterior, sin necesidad de infraestructura GPU potente.
- Aplicaciones de accesibilidad: conversión de voz a texto para personas con discapacidad auditiva, desplegable en dispositivos de bajo consumo.
- Investigación en ASR: como modelo de referencia para comparar arquitecturas o técnicas de cuantización en alemán, gracias a su disponibilidad en ONNX.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo menciona una prueba de humo con cinco frases en alemán generadas por gTTS, donde tanto FP32 como INT8 obtuvieron un 0% de WER, pero se trata de una verificación funcional con voz sintética, no de una evaluación sobre corpus reales. Para cifras de WER en corpus estándar se remite a la model card del modelo base, cuyos datos no se incluyen en esta ficha.

## Requisitos de hardware

- VRAM estimada para inferencia: en FP32, el encoder ocupa 2.5 GB y el decoder-joint 73 MB, por lo que se necesitan al menos ~3 GB de VRAM (o memoria RAM en CPU). En INT8, el encoder pesa 654 MB y el decoder 18 MB, totalizando ~672 MB, lo que permite ejecución en GPUs con 1-2 GB o incluso en CPU.
- GPU recomendadas: cualquier GPU con soporte CUDA y al menos 4 GB de VRAM para FP32; para INT8 basta con 2 GB (por ejemplo, NVIDIA Jetson Nano, GTX 1650, o integradas). También es viable en CPU con instrucciones AVX2.
- Opciones de despliegue: ONNX Runtime directamente, mediante la librería `onnx-asr`, o a través del plugin `ovos-stt-plugin-onnx-asr` en OpenVoiceOS. No se menciona compatibilidad con vLLM, llama.cpp u otros motores de inferencia.
- Latencia y throughput: no se proporcionan datos. En CPU, la variante INT8 debería ofrecer tiempos de transcripción casi en tiempo real para audio corto, pero no hay cifras verificadas.

## Comparativa con modelos similares

No se dispone de información comparativa en la documentación proporcionada. A modo orientativo, otros modelos ASR en alemán como Whisper small (244 M) o Whisper medium (769 M) cubren múltiples idiomas, pero no se conocen resultados de WER específicos para este modelo en los mismos corpus. La comparativa estructural indicaría que `primeline-parakeet` está especializado en alemán y optimizado para despliegue ligero, mientras que Whisper es más generalista pero requiere más recursos. Sin datos de benchmarks, no es posible realizar una comparación cuantitativa.

## Limitaciones y advertencias

- El modelo está entrenado únicamente para alemán; no soporta otros idiomas.
- La ventana de contexto no está documentada, lo que puede limitar la transcripción de audio muy largo si no se segmenta previamente.
- La prueba de verificación se realizó con voz sintética (gTTS), por lo que el rendimiento con voz natural, ruido o acentos regionales puede variar.
- La licencia CC-BY-4.0 permite uso comercial con atribución, pero no se ofrecen garantías sobre la precisión o idoneidad para aplicaciones críticas.
- Al ser una exportación ONNX, puede haber ligeras diferencias numéricas respecto al modelo original en NeMo, aunque la verificación no mostró discrepancias.
- No se han publicado evaluaciones sobre sesgos o alucinaciones; como todo modelo ASR, puede producir errores en entornos acústicamente adversos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/OpenVoiceOS/primeline-parakeet-onnx
- Modelo base: https://huggingface.co/primeline/parakeet-primeline
- Librería `onnx-asr`: https://github.com/istupakov/onnx-asr
- Plugin OpenVoiceOS `ovos-stt-plugin-onnx-asr`: https://github.com/TigreGotico/ovos-stt-plugin-onnx-asr
