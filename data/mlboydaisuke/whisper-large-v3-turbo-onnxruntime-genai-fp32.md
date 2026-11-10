# mlboydaisuke/whisper-large-v3-turbo-onnxruntime-genai-fp32

## Resumen

Este repositorio contiene una exportación del modelo de reconocimiento automático de voz `openai/whisper-large-v3-turbo` al formato ONNX Runtime GenAI, en precisión fp32 y orientada a ejecución en CPU. La exportación la ha realizado el usuario `mlboydaisuke` (revision 41f01f3f del checkpoint original) mediante el model builder de ONNX Runtime GenAI 0.19.0 con los parámetros `-p fp32 -e cpu`, generando `encoder.onnx`, `decoder.onnx`, sus pesos, `genai_config.json`, el tokenizador y la configuración del procesador de audio.

El interés principal del repositorio no es el modelo en sí (que es el Whisper large-v3-turbo de OpenAI, un modelo encoder-decoder transformer de reconocimiento de voz con 809 millones de parámetros y capacidad multilingüe), sino el artefacto listo para producción en Windows: un paquete ONNX GenAI que se puede ejecutar con `onnxruntime-genai` sin necesidad de PyTorch ni de Transformers, y que además incorpora un parche documentado para un fallo del builder oficial.

El autor documenta una corrección necesaria: el builder 0.19.0 genera un par de salidas K/V de cross-attention por capa del encoder, mientras que el runtime espera un par por capa del decoder. Whisper large-v3-turbo tiene 32 capas de encoder y 4 de decoder, por lo que el export falla con `IndexError: index 4 is out of range` si no se aplica el parche `patch_genai_whisper.py`. Este repositorio resuelve ese problema y ofrece métricas medidas en hardware real (un portátil Windows con Intel Core Ultra 9 386H), lo que lo convierte en una referencia práctica para quien quiera desplegar Whisper en Windows sin GPU dedicada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper), exportado a ONNX Runtime GenAI |
| Parametros totales | 809 M (modelo base `openai/whisper-large-v3-turbo`) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | Ventana de audio de 30 s (Whisper); contexto de texto de 448 tokens |
| Tipos de cuantizacion | fp32 (este repo); existe export fp16 para CUDA en repo hermano |
| Idiomas soportados | Multilingüe (heredado de Whisper large-v3-turbo); lista concreta no disponible en la información proporcionada |
| Licencia | MIT |
| Formato de pesos | ONNX (`encoder.onnx`, `decoder.onnx` + pesos) con `genai_config.json` |

## Arquitectura y entrenamiento

El modelo subyacente es Whisper large-v3-turbo de OpenAI: un transformer encoder-decoder con 32 capas de encoder y 4 capas de decoder, diseñado para transcripción y traducción de voz. El encoder procesa espectrogramas Mel de audio en ventanas de 30 segundos y el decoder genera tokens de texto de forma autorregresiva, con cross-attention entre ambos. La variante "turbo" reduce el número de capas del decoder respecto a large-v3 (de 32 a 4), lo que rebaja el coste de decodificación manteniendo el encoder completo.

Este repositorio no entrena ni afina el modelo: es una conversión de formato. Los pesos originales están en fp16 y se convierten a fp32 durante el export, sin cuantización. La innovación técnica destacable es el parche al builder de ONNX Runtime GenAI 0.19.0 (`patch_genai_whisper.py`, del repositorio `john-rocky/windows-audio-zoo`), que ajusta los bucles de generación de salidas K/V de cross-attention para que emitan un par por capa de decoder en lugar de uno por capa de encoder. Sin ese parche, el export falla en modelos donde el número de capas de encoder y decoder difiere, como es el caso de turbo.

## Capacidades

- Reconocimiento automático de voz (ASR) en modo greedy con el idioma indicado en el prompt.
- Transcripción multilingüe, con métricas medidas en inglés, chino mandarín y japonés.
- Traducción de voz a texto (capacidad heredada de Whisper, aunque no se documentan métricas en este repo).
- Ejecución en CPU sin PyTorch ni Transformers, solo con `onnxruntime-genai`.
- Ejecución en GPU Intel mediante el execution provider OpenVINO.
- Procesamiento de audio por ventanas de 30 segundos con procesador de audio incluido.
- No se documenta soporte de tool calling, agentes ni modos de razonamiento extendido (no aplica a un modelo ASR).

## Casos de uso

- Transcripción local en Windows sin GPU dedicada: el paquete se ejecuta con `onnxruntime-genai` en CPU y alcanza un RTF de 0,341 en un Intel Core Ultra 9 386H, es decir, transcribe audio en aproximadamente un tercio del tiempo real. Adecuado para aplicaciones de escritorio que no pueden depender de servicios en la nube.
- Subtitulado y actas de reuniones: con ventanas de 30 s y un WER del 5,22 % en inglés sobre FLEURS, el modelo es viable para generar transcripciones de calidad en herramientas ofimáticas o de colaboración.
- Procesamiento por lotes en servidores sin GPU: al ser ONNX en CPU, se puede desplegar en contenedores estándar o máquinas virtuales sin aceleradores, integrado en pipelines de ingesta de audio.
- Transcripción multilingüe en centros de contacto: las métricas medidas (CER 9,16 % en chino, 3,79 % en japonés) permiten enrutar y analizar conversaciones en varios idiomas con un único modelo.
- Aceleración en GPU integrada Intel: con el execution provider OpenVINO se obtiene el mismo resultado que en CPU (RTF 0,351 frente a 0,341), útil en portátiles y mini-PC con gráficos Intel donde no hay GPU dedicada.
- Base para prototipos de ASR en Windows: el repositorio incluye el runner `pc/run_asr_genai.py` y los registros de resultados, lo que facilita reproducir la evaluación y adaptar el pipeline a otras aplicaciones.
- Integración en aplicaciones .NET o C++ nativas: el formato ONNX GenAI permite cargar el modelo desde runtimes nativos sin depender de Python en producción.

## Benchmarks y rendimiento

Mediciones del autor sobre 150 clips de test de FLEURS (50 de en_us, 50 de cmn_hans_cn y 50 de ja_jp, 1806 s en total), decodificación greedy, idioma indicado en el prompt, un proceso por fila tras un clip de calentamiento no cronometrado. RTF = tiempo de transcripción / tiempo de audio; first token = desde la apertura del clip hasta el primer token decodificado, incluido el encoder.

| Dispositivo | Execution provider | WER en | CER zh | CER ja | RTF | First token |
|---|---|---|---|---|---|---|
| CPU | CPU | 5,22 % | 9,16 % | 3,79 % | 0,341 | 3,67 s |
| GPU Intel | OpenVINO (plugin EP 1.8.1, device GPU) | 5,22 % | 9,16 % | 3,79 % | 0,351 | 3,70 s |
| Referencia (transformers fp32, misma CPU) | — | 5,13 % | 9,11 % | 3,83 % | no disponible | no disponible |

Las dos filas del export ONNX dan la misma respuesta en los 150 clips. La referencia con transformers fp32 en la misma CPU obtiene 5,13 / 9,11 / 3,83 %, prácticamente idéntica. Hardware de la medición: MSI Stealth 16 AI+ (Intel Core Ultra 9 386H, Intel Graphics, driver 32.0.101.8724), Windows 11 Home 25H2 build 26200.9711, onnxruntime-genai 0.19.0, onnxruntime 1.31.1, onnxruntime-ep-openvino 1.8.1.

## Requisitos de hardware

- Tamaño del repositorio: 3,5 GB (pesos fp32, sin cuantizar).
- Inferencia en CPU: viable en procesadores modernos; el autor mide RTF 0,341 en un Intel Core Ultra 9 386H.
- GPU Intel integrada: soportada vía OpenVINO plugin EP 1.8.1, con rendimiento equivalente al de CPU en la medición publicada.
- GPU dedicadas (NVIDIA): este repo es la variante CPU; el autor publica un export fp16 para CUDA en `whisper-large-v3-turbo-onnxruntime-genai-fp16-cuda`.
- VRAM estimada: no disponible en la información proporcionada; al ser fp32 y 809 M de parámetros, los pesos ocupan del orden de 3,2 GB, pero no se documenta el consumo de memoria en ejecución.
- Despliegue: `onnxruntime-genai` 0.19.0 con `onnxruntime` 1.31.1; opcionalmente `onnxruntime-ep-openvino` 1.8.1 para GPU Intel.
- Latencia: primer token medio de 3,67 s en CPU y 3,70 s en GPU Intel (incluye el encoder); RTF de 0,341 y 0,351 respectivamente.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto de audio | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Este repo (whisper-large-v3-turbo ONNX GenAI fp32) | 809 M | 30 s | Multilingüe | MIT | ONNX GenAI |
| openai/whisper-large-v3-turbo (original) | 809 M | 30 s | Multilingüe | MIT | safetensors (PyTorch) |
| whisper-large-v3-turbo-onnxruntime-genai-fp16-cuda (repo hermano del mismo autor) | 809 M | 30 s | Multilingüe | MIT | ONNX GenAI fp16 |

Las alternativas de otros tamaños o familias (por ejemplo, modelos ASR más pequeños o de otros desarrolladores) no están documentadas en la información proporcionada; no se dispone de datos comparativos de rendimiento frente a ellos.

## Limitaciones y advertencias

- El modelo subyacente es Whisper large-v3-turbo, con los sesgos y errores de reconocimiento conocidos de la familia Whisper; no se documentan análisis de sesgo específicos en este repositorio.
- Riesgo de alucinación en pasajes de audio con ruido, silencios largos o habla no inteligible, comportamiento típico de los modelos ASR autorregresivos.
- La ventana de audio es de 30 s; audios más largos requieren segmentación externa.
- El export está pensado para CPU y GPU Intel vía OpenVINO; para CUDA debe usarse el repositorio fp16 hermano.
- El builder oficial de ONNX Runtime GenAI 0.19.0 falla sin el parche documentado; el flujo de export no es directo y requiere aplicar `patch_genai_whisper.py`.
- La etiqueta `base_model_relation: quantized` del Hub es engañosa: los pesos son fp32 convertidos desde fp16, no cuantizados, según aclara el propio autor.
- Las métricas se han medido en un único equipo y con 150 clips de FLEURS; no constituyen una evaluación exhaustiva en dominios ruidosos o acentos diversos.
- Licencia MIT: permite uso comercial, pero conviene verificar las condiciones del modelo base de OpenAI y de los datasets de evaluación utilizados.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mlboydaisuke/whisper-large-v3-turbo-onnxruntime-genai-fp32
- Modelo base: https://huggingface.co/openai/whisper-large-v3-turbo
- Export fp16 para CUDA del mismo autor: https://huggingface.co/mlboydaisuke/whisper-large-v3-turbo-onnxruntime-genai-fp16-cuda
- Parche del builder: https://github.com/john-rocky/windows-audio-zoo/blob/main/pc/patch_genai_whisper.py
- Runner y resultados de evaluación: https://github.com/john-rocky/windows-audio-zoo
