# mlboydaisuke/distil-large-v3-onnxruntime-genai-fp32

## Resumen

`mlboydaisuke/distil-large-v3-onnxruntime-genai-fp32` es una exportación del modelo de reconocimiento automático del habla (ASR) `distil-whisper/distil-large-v3` al formato ONNX Runtime GenAI, en precisión fp32 y orientada a ejecución en CPU. Lo publica el usuario mlboydaisuke, no el equipo original de distil-whisper, y su valor no reside en un nuevo entrenamiento sino en empaquetar los grafos `encoder.onnx` y `decoder.onnx` junto con sus pesos, `genai_config.json`, tokenizer y procesador de audio para que puedan ejecutarse directamente con la librería `onnxruntime-genai` 0.19.0 sin pasar por PyTorch ni por Transformers.

El modelo base es distil-whisper large-v3, una destilación del Whisper large-v3 de OpenAI, especializada en transcripción de inglés, con 32 capas en el encoder y 2 en el decoder y aproximadamente 756 millones de parámetros. El contexto de audio típico de Whisper es de 30 segundos por ventana y la generación de tokens se limita a 448 posiciones por segmento, tal como se refleja en el ejemplo de la model card.

Es relevante porque demuestra que un ASR de alta calidad puede desplegarse en hardware de consumo (un portátil Windows con Intel Core Ultra 9 386H) con tasas de error cercanas a las del modelo original en Transformers (6,61 % WER frente a 6,52 % en 50 clips FLEURS) y factores de tiempo real de 0,414 en CPU, 0,0562 en GPU Intel vía OpenVINO y 0,0554 con el encoder en la NPU. Además documenta un parche necesario en el builder oficial de ONNX Runtime GenAI para exportar modelos con distinto número de capas en encoder y decoder.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper destilado, distil-whisper) exportado a ONNX Runtime GenAI |
| Parámetros totales | no disponible (modelo base: distil-whisper large-v3, ~756 M) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | audio: ventanas de 30 s; generación: 448 tokens por segmento (parámetro del ejemplo) |
| Tipos de cuantización | fp32 en esta exportación (existen variantes fp16-CUDA e int8-OpenVINO del mismo autor); pesos originales en fp16 |
| Idiomas soportados | inglés (en) |
| Licencia | MIT |
| Formato de pesos | ONNX (`encoder.onnx`, `decoder.onnx` + pesos) con `genai_config.json`, tokenizer y audio processor config |
| Tamaño del repo | 3,3 GB |
| Librería | onnxruntime-genai 0.19.0 |
| Fecha de creación | 2026-11-12 |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Whisper large-v3 destilado: un encoder Transformer que procesa espectrogramas mel de 30 segundos y un decoder autorregresivo que emite tokens de texto condicionados por atención cruzada. En distil-large-v3 el encoder conserva 32 capas mientras que el decoder se reduce a 2, lo que explica el desajuste que rompe el builder estándar de ONNX Runtime GenAI 0.19.0 (tres bucles de cross-attention indexados por capas de encoder, que fallan con `IndexError: index 2 is out of range` en `builders/whisper.py`, línea 156).

El entrenamiento del modelo base corresponde al del equipo distil-whisper, que destila large-v3 sobre datos de audio en inglés; en esta ficha no se dispone de detalles sobre número exacto de tokens de audio, composición del dataset ni etapas de RLHF/DPO. La exportación en sí no reentrena: toma la revisión `8031d2e6` del checkpoint, castea los pesos de fp16 a fp32 y genera los grafos con `-p fp32 -e cpu` tras aplicar `patch_genai_whisper.py`, que hace que los bucles de cross-attention cuenten capas de decoder en lugar de capas de encoder. Con el parche equivalente del PR microsoft/onnxruntime-genai#2940 el builder produce los mismos ficheros byte a byte.

## Capacidades

- Reconocimiento automático del habla en inglés (transcripción de audio a texto).
- Procesamiento de audio de 16 kHz, mono, 16 bits WAV según el ejemplo de la model card.
- Generación condicionada por prompt de transcripción (`<|startoftranscript|><|en|><|transcribe|><|notimestamps|>`), lo que permite controlar idioma y modo de salida desde el prompt.
- Salida sin timestamps mediante el token `<|notimestamps|>` (el modo con timestamps no se documenta explícitamente).
- Ejecución en CPU, GPU Intel vía OpenVINO y NPU Intel (esta última con la variante int8 del mismo autor).
- Integración con `onnxruntime-genai` mediante `og.Model`, `create_multimodal_processor`, `GeneratorParams` y `Generator`.
- No dispone de tool calling, function calling, capacidades de agente ni generación de código.
- No es multimodal en sentido amplio: solo audio de entrada y texto de salida.
- Sin soporte multilingüe más allá del inglés.

## Casos de uso

- Transcripción por lotes en local: procesar carpetas de grabaciones en un portátil o estación de trabajo sin GPU dedicada, aprovechando el factor de tiempo real de 0,414 en CPU del Core Ultra 9 386H, lo que permite transcribir aproximadamente 2,4 horas de audio por hora de cómputo.
- Subtitulado de vídeos en inglés: generar texto alineado con el audio para pipelines de postproducción, usando decodificación en streaming token a token con `generate_next_token()`.
- Actas y notas de reuniones: transcribir reuniones en inglés en equipos Windows de oficina, evitando el envío de audio a servicios en la nube por motivos de privacidad.
- Despliegue en hardware Intel con aceleración: usar la ruta OpenVINO (GPU o NPU) documentada en la card para obtener factores de tiempo real de 0,0562 y 0,0554, adecuados para transcripción casi en tiempo real.
- Investigación en eficiencia de ASR: comparar el comportamiento del mismo modelo en fp32-CPU, fp16-CUDA e int8-OpenVINO, ya que el autor publica las tres variantes con métricas comparables sobre los mismos 50 clips FLEURS.
- Integración en aplicaciones de escritorio Windows: empaquetar el modelo con `onnxruntime-genai` 0.19.0 dentro de una app nativa, sin dependencia de PyTorch ni de Transformers en tiempo de ejecución.
- Evaluación de pipelines de exportación ONNX: reproducir el build con el parche y el PR #2940 para verificar la equivalencia byte a byte, útil para equipos que mantienen sus propias exportaciones.

## Benchmarks y rendimiento

Datos aportados por el autor sobre 50 clips de test de FLEURS en inglés, en un portátil MSI Stealth 16 AI+ con Intel Core Ultra 9 386H, Windows 11 Home 25H2 build 26200.9711, onnxruntime-genai 0.19.0 y onnxruntime 1.31.1:

| Configuración | WER | Factor de tiempo real (RTF) |
|---|---|---|
| distil-large-v3 original en Transformers, fp32, CPU | 6,52 % | no disponible |
| Esta exportación fp32, CPU | 6,61 % | 0,414 |
| Variante int8-OpenVINO, CPU (referencia cruzada) | no disponible | 0,243 |
| Esta exportación fp32 con encoder y decoder en GPU Intel vía OpenVINO | mismo conjunto de transcripciones | 0,0562 |
| Variante int8-OpenVINO con encoder en NPU Intel (referencia cruzada) | no disponible | 0,0554 |

No se han publicado resultados de benchmarks estándar (LibriSpeech, Common Voice, MMLU, HumanEval, GSM8K) en la información disponible. Los datos anteriores son mediciones del autor, no comparaciones independientes.

## Requisitos de hardware

- Tamaño del repo: 3,3 GB, lo que implica un consumo de VRAM/RAM del orden de varios GB para cargar encoder y decoder en fp32.
- VRAM estimada para fp32: no disponible con cifra exacta; por el tamaño de pesos, se sitúa en el rango de varios GB, apto para GPUs consumer con 8 GB o más.
- CPU: validado en Intel Core Ultra 9 386H; cualquier CPU x86-64 moderna con suficiente RAM debería poder ejecutarlo, aunque el rendimiento no está medido fuera de ese equipo.
- GPU: la ruta probada es GPU Intel integrada vía OpenVINO EP 1.8.1. Para NVIDIA existe la variante fp16-CUDA del mismo autor. No hay datos publicados para A100, H100 ni RTX 4090 con esta exportación fp32.
- NPU: probado con la variante int8-OpenVINO (encoder en NPU), no con esta fp32.
- Despliegue: `onnxruntime-genai` 0.19.0 y `onnxruntime` 1.31.1; opcionalmente `onnxruntime-ep-openvino` 1.8.1 para GPU/NPU Intel. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI (no aplican a este formato).
- Latencia y throughput: RTF de 0,414 en CPU y 0,0562 en GPU Intel para clips de FLEURS; el ejemplo de la card transcribe un clip de 7,2 s correctamente en el portátil de referencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas | Contexto de audio | Licencia | Formato / despliegue | WER (FLEURS, 50 clips) |
|---|---|---|---|---|---|---|
| distil-large-v3-onnxruntime-genai-fp32 (esta ficha) | ~756 M (base) | en | 30 s por ventana | MIT | ONNX Runtime GenAI, fp32 | 6,61 % (CPU, medición del autor) |
| distil-whisper/distil-large-v3 (original) | ~756 M | en | 30 s por ventana | MIT | PyTorch / Transformers, fp16 | 6,52 % (fp32 en CPU, medición del autor) |
| openai/whisper-large-v3 | ~1.550 M | multilingüe | 30 s por ventana | MIT | PyTorch / Transformers | no disponible en esta información |
| Variante int8-OpenVINO del mismo autor | ~756 M (base) | en | 30 s por ventana | MIT | ONNX Runtime GenAI, int8 | no disponible (RTF 0,243 en CPU, 0,0554 con encoder en NPU) |

La comparación con whisper-large-v3 se incluye por ser el modelo del que destila distil-large-v3; no se dispone de cifras de WER comparables en la información proporcionada.

## Limitaciones y advertencias

- Solo inglés: el modelo base y esta exportación están entrenados y etiquetados para `en`; no se debe usar para otros idiomas sin validación.
- Riesgo de alucinación: como todo modelo de la familia Whisper, puede inventar texto en segmentos con silencio, ruido o audio musical; no se documenta mitigación específica en la card.
- Sesgos: no se documentan análisis de sesgo demográfico, acento o dominio; al ser una destilación de Whisper large-v3 hereda los sesgos del modelo original, no cuantificados aquí.
- Dependencia de un parche no fusionado: la exportación requiere `patch_genai_whisper.py` o el PR microsoft/onnxruntime-genai#2940, que seguía abierto y sin fusionar el 2026-11-12; reproducir el build con la versión estándar del builder falla con `IndexError`.
- Configuración manual para GPU Intel: en onnxruntime-genai 0.19.0 hay que editar `genai_config.json` para asignar OpenVINO a encoder y decoder y registrar el plugin antes de cargar el modelo; `append_provider` en código solo afecta al decoder.
- Licencia MIT: permite uso comercial, pero al derivar de distil-whisper conviene revisar también las condiciones del modelo base y de los datos de entrenamiento originales de Whisper.
- Madurez: el autor indica que la velocidad "sigue ajustándose"; las métricas proceden de un único portátil y no hay validación independiente.
- Sin datos de benchmarks estándar ni de comportamiento en dominios ruidosos (llamadas telefónicas, audio con acentos fuertes, jerga técnica).
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de uso en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mlboydaisuke/distil-large-v3-onnxruntime-genai-fp32
- Modelo base: https://huggingface.co/distil-whisper/distil-large-v3
- Variante fp16-CUDA: https://huggingface.co/mlboydaisuke/distil-large-v3-onnxruntime-genai-fp16-cuda
- Variante int8-OpenVINO: https://huggingface.co/mlboydaisuke/distil-large-v3-onnxruntime-genai-int8-openvino
- Script de parche del builder: https://github.com/john-rocky/windows-audio-zoo/blob/main/pc/patch_genai_whisper.py
- Pull request con el fix del builder: https://github.com/microsoft/onnxruntime-genai/pull/2940
