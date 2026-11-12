# mlboydaisuke/distil-large-v3-onnxruntime-genai-int8-openvino

## Resumen

`distil-large-v3-onnxruntime-genai-int8-openvino` es una exportación del modelo de reconocimiento automático del habla (ASR) `distil-whisper/distil-large-v3`, publicada por el usuario mlboydaisuke. Se trata de una conversión de los pesos a formato ONNX con cuantización int8, empaquetada para la librería `onnxruntime-genai` 0.19.0 y configurada para ejecutarse sobre el execution provider de OpenVINO en CPU (y, opcionalmente, en NPU de Intel para el encoder). El modelo base es una destilación de Whisper large-v3 orientada a inglés, desarrollada por el equipo de Distil-Whisper, que reduce el coste computacional manteniendo una calidad de transcripción cercana a la del modelo original.

El interés de esta ficha no reside en un modelo nuevo, sino en el artefacto de despliegue: permite ejecutar un ASR de calidad casi large-v3 en hardware de consumo Intel (CPU y NPU) sin GPU dedicada, con un factor de tiempo real (RTF) de 0,243 en CPU y de 0,0554 con el encoder en NPU, según las mediciones del autor. El repositorio ocupa 1,6 GB y contiene `encoder.onnx`, `decoder.onnx`, sus pesos, `genai_config.json`, el tokenizador y la configuración del procesador de audio.

La relevancia actual es práctica: ofrece una vía reproducible para transcripción local en Windows 11 sobre portátiles con Core Ultra, con licencia MIT heredada del modelo base y una integración documentada con `onnxruntime-genai`. No hay datos de entrenamiento propios ni benchmarks estándar publicados; las únicas métricas disponibles son las del autor sobre 50 clips de FLEURS en inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Whisper encoder-decoder (transformer) destilado, exportado a ONNX para onnxruntime-genai |
| Parametros totales | no disponible (el modelo base distil-large-v3 no declara el recuento en la informacion proporcionada) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible como ventana de texto; la entrada de audio se fija en `[1,128,3000]` para el encoder en NPU; `max_length=448` en el ejemplo de generacion |
| Tipos de cuantizacion | int8 (pesos) en esta exportacion; existen exportaciones fp32 y fp16-CUDA del mismo autor |
| Idiomas soportados | en (ingles) |
| Licencia | MIT |
| Formato de pesos | ONNX (`encoder.onnx`, `decoder.onnx`) con `genai_config.json` |

## Arquitectura y entrenamiento

El modelo subyacente es `distil-whisper/distil-large-v3`, una destilación de Whisper large-v3 para reconocimiento de voz en inglés. La arquitectura es la de Whisper: un encoder que procesa espectrogramas mel (128 canales, 3000 frames) y un decoder autorregresivo que genera tokens de transcripción con tokens especiales de idioma, tarea y marcas de tiempo. La destilación reduce el número de capas del decoder respecto a large-v3, lo que baja el coste de inferencia a cambio de una pérdida mínima de precisión. No se dispone en la información proporcionada de detalles sobre el dataset de destilación, el número de tokens de audio ni si hubo etapas de RLHF o DPO.

La innovación de esta exportación concreta es de despliegue, no de entrenamiento: los pesos se convierten a int8 con el model builder de `onnxruntime-genai` (`-p int8 -e cpu`) a partir de la revisión `8031d2e6` del modelo base, y `genai_config.json` se modifica para que encoder y decoder nombren el execution provider de OpenVINO con dispositivo CPU. Para NPU, el autor documenta un ajuste de forma fija del encoder (`reshape_input` a `[1,128,3000]`) y un `cache_dir` que persiste el encoder compilado (1,42 GB) para evitar los 279 s de compilación inicial. Una limitación técnica relevante: en `onnxruntime-genai` 0.19.0, un modelo con dos partes no puede usar dos providers distintos, por lo que el decoder permanece en CPU aunque el encoder vaya a NPU.

## Capacidades

- Reconocimiento automático del habla en inglés (transcripción de audio a texto).
- Generación de transcripciones con tokens especiales de tarea (`<|transcribe|>`) y control de marcas de tiempo (`<|notimestamps|>`).
- Procesamiento por lotes (`batch_size` configurable en `GeneratorParams`).
- Ejecución en CPU mediante OpenVINO y, para el encoder, en NPU de Intel con compilación cacheada.
- Integración con el procesador multimodal de `onnxruntime-genai` (`create_multimodal_processor`, `og.Audios.open`).
- No soporta tool calling, function calling, agentes, visión, audio de salida ni modo de razonamiento extendido; es un modelo ASR puro.
- Capacidad multilingüe limitada al inglés (etiqueta `en`).

## Casos de uso

- Transcripción local en portátiles Windows con Core Ultra: el modelo corre en CPU con OpenVINO a RTF 0,243, lo que permite transcribir audio en tiempo casi real sin GPU dedicada, útil para actas de reuniones y notas de voz.
- Subtitulado de vídeo en inglés: el decoder admite tokens de marcas de tiempo, de modo que se pueden generar subtítulos sincronizados en un pipeline local antes de publicar contenido.
- Dictado y accesibilidad en aplicaciones de escritorio: al ser un artefacto ONNX de 1,6 GB con licencia MIT, se puede empaquetar dentro de una aplicación Windows sin depender de servicios en la nube.
- Procesamiento por lotes de archivos de audio: con `batch_size` configurable y `max_length=448`, se pueden transcribir colecciones de clips cortos en un servidor sin GPU usando solo CPU Intel.
- Transcripción con encoder en NPU para bajo consumo: con el encoder compilado en la NPU (RTF 0,0554 tras la compilación inicial), es adecuado para aplicaciones de escucha continua donde importa el consumo energético.
- Evaluación y prototipado de pipelines ASR: sirve como referencia para comparar exportaciones int8/fp32/fp16-CUDA del mismo modelo base dentro de `onnxruntime-genai`, tal como documenta el autor con sus tres repositorios.
- Verificación de calidad en entornos con requisitos de licencia permisiva: la licencia MIT permite integrar el modelo en productos comerciales sin las restricciones de otros artefactos ASR.

## Benchmarks y rendimiento

Las únicas métricas disponibles son las publicadas por el autor sobre 50 clips de test de FLEURS en inglés, medidas el 2026-11-12 en un portátil con Core Ultra 9 386H (Windows 11 build 26200.9711, Python 3.12.16, onnxruntime-genai 0.19.0, onnxruntime 1.31.1, onnxruntime-ep-openvino 1.8.1).

| Configuracion | WER | RTF | Notas |
|---|---|---|---|
| int8 OpenVINO, CPU | 6,43 % | 0,243 | Esta exportacion |
| fp32 transformers, misma CPU | 6,52 % | no disponible | Referencia del modelo original |
| fp32 ONNX Runtime CPU EP | no disponible | 0,414 | Exportacion fp32 del mismo autor |
| int8 OpenVINO, encoder en NPU | 6,61 % | 0,0554 | Tras 279 s de compilacion inicial |
| int8, GPU Intel (pasada sin cronometrar) | no disponible | 0,0881 | Medicion no cronometrada |
| fp32, GPU Intel (pasada sin cronometrar) | no disponible | 0,0764 | Medicion no cronometrada |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, LibriSpeech, Common Voice) en la información disponible. Los datos de RTF y WER proceden exclusivamente de las mediciones del autor y no han sido replicados de forma independiente.

## Requisitos de hardware

- VRAM estimada: no aplica para la configuración principal, que corre en CPU; el repositorio ocupa 1,6 GB en disco y el encoder compilado para NPU añade 1,42 GB de caché.
- GPU recomendadas: no se especifican; el autor remite a la exportación fp32 para GPU Intel y a la fp16-CUDA para CUDA.
- Cabe en hardware de consumo: sí, en CPU de portátiles Intel Core Ultra; el autor lo valida en un Core Ultra 9 386H.
- Opciones de despliegue: `onnxruntime-genai` 0.19.0 con `onnxruntime-ep-openvino` 1.8.1 y `onnxruntime` 1.31.1; requiere registrar el plugin OpenVINO antes de cargar el modelo.
- Latencia y throughput: RTF 0,243 en CPU y 0,0554 con encoder en NPU (mediciones del autor); la primera carga en NPU tarda 279-280 s por la compilación, y las posteriores 4,1 s con `cache_dir`.
- Requisito de driver: Intel NPU driver 32.0.100.5540 para la ruta NPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| distil-large-v3-onnxruntime-genai-int8-openvino | no disponible | audio fijo `[1,128,3000]`, `max_length=448` | WER 6,43 % FLEURS, RTF 0,243 CPU | MIT | ONNX en HF |
| distil-large-v3-onnxruntime-genai-fp32 (mismo autor) | no disponible | idem | RTF 0,414 en ONNX Runtime CPU EP; 0,0764 en GPU Intel | MIT | ONNX en HF |
| distil-large-v3-onnxruntime-genai-fp16-cuda (mismo autor) | no disponible | idem | no disponible | MIT | ONNX en HF |
| distil-whisper/distil-large-v3 (modelo base) | no disponible | audio Whisper estandar | WER 6,52 % fp32 en transformers (referencia del autor) | MIT | transformers en HF |

No se dispone de comparación con otros modelos ASR (Whisper large-v3 completo, faster-whisper, Parakeet, etc.) en la información proporcionada.

## Limitaciones y advertencias

- Solo inglés: la etiqueta de idioma es `en` y el prompt del ejemplo fija `<|en|>`; no se debe esperar transcripción fiable en otros idiomas.
- Sesgos: no se documentan análisis de sesgo acústico, dialectal ni demográfico; al derivar de Whisper, hereda los sesgos conocidos del modelo base, no evaluados aquí.
- Riesgo de alucinación: los modelos Whisper pueden generar texto plausible en segmentos con silencio o ruido; no se han publicado evaluaciones específicas para esta exportación.
- Licencia MIT: permite uso comercial, pero se hereda del modelo base; conviene verificar la procedencia de los datos de entrenamiento originales si el uso es sensible.
- Restricciones técnicas: en `onnxruntime-genai` 0.19.0 no se pueden usar dos providers distintos en encoder y decoder, lo que impide poner el decoder en NPU; el decoder int8 no se probó en NPU.
- Forma de entrada fija en NPU: el encoder requiere `reshape_input` a `[1,128,3000]`, lo que limita el procesamiento a un clip por pasada en esa ruta.
- Dependencia de versiones concretas: el ejemplo fija `onnxruntime-genai==0.19.0`, `onnxruntime==1.31.1` y `onnxruntime-ep-openvino==1.8.1`; otras versiones pueden romper la carga.
- Rendimiento no replicado: todas las métricas son del autor, con 50 clips y sin validación independiente; el WER en otros dominios o acentos puede diferir.
- Primer arranque lento en NPU: 279 s de compilación si no se usa `cache_dir`.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mlboydaisuke/distil-large-v3-onnxruntime-genai-int8-openvino
- Modelo base: https://huggingface.co/distil-whisper/distil-large-v3
- Exportación fp32 del mismo autor: https://huggingface.co/mlboydaisuke/distil-large-v3-onnxruntime-genai-fp32
- Exportación fp16-CUDA del mismo autor: https://huggingface.co/mlboydaisuke/distil-large-v3-onnxruntime-genai-fp16-cuda
