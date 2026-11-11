# lnminh1411/BetterRecall-models

## Resumen

BetterRecall-models no es un modelo generativo al uso, sino un repositorio de artefactos de inferencia convertidos para BetterRecall, una alternativa local a Windows Recall desarrollada por lnminh1411. El repositorio empaqueta seis modelos de terceros (embeddings multimodales, reconocimiento de voz, deteccion de voz y clasificadores NSFW) ya convertidos a OpenVINO IR, ONNX y cuantizacion INT8, con sus grafos, manifiestos y licencias originales. No se ha reentrenado ni ajustado ningun peso: el autor solo ha realizado la conversion y la verificacion numerica de la salida frente al modelo original.

El paquete cubre el pipeline completo de una herramienta de "recall" local: captura de pantalla con embeddings imagen-texto (EmbeddingGemma 2 y SigLIP2 como respaldo), transcripcion de audio con Whisper large-v3-turbo, un detector de actividad vocal (Silero VAD) y dos filtros de contenido explicito. El tamano total del repositorio es de aproximadamente 6,30 GB y esta pensado para ejecutarse en Windows sobre CPU, GPU o NPU mediante OpenVINO, con variantes ONNX para DirectML.

Su relevancia es practica: ofrece una via reproducible para desplegar un stack de recuperacion multimodal y audio en hardware de consumo sin depender de la nube, con manifiestos que documentan hashes SHA-256, nombres de tensores y preprocesado. La contrapartida es que no es un modelo entrenado, no publica benchmarks propios y su licencia es mixta, heredada de cada modelo de origen.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Coleccion heterogenea: embedder multimodal (EmbeddingGemma 2), embedder vision-lenguaje (SigLIP2 ViT-B/16 patch16-224), ASR transformer encoder-decoder (Whisper large-v3-turbo), detector de voz (Silero VAD), clasificador ViT-base/16 (NSFW) y detector YOLOv8n (NudeNet) |
| Parametros totales | No disponible (no se publica el recuento por componente) |
| Parametros activos | No aplica (ningun componente es MoE) |
| Longitud de contexto | No disponible como contexto de texto generativo; EmbeddingGemma 2 incluye grafos de vision a 70, 140 y 280 tokens |
| Tipos de cuantizacion | INT8 (Whisper large-v3-turbo, NSFW clasificador en CPU), FP32 ONNX (EmbeddingGemma 2, SigLIP2, NSFW en NPU/GPU), bf16 (tabla de tokens de EmbeddingGemma 2), ONNX sin modificar (Silero VAD, NudeNet) |
| Idiomas soportados | No disponible en la informacion (Whisper large-v3-turbo soporta multilingue por herencia del modelo original, sin detalle en la model card) |
| Licencia | Mixta: Apache-2.0 (EmbeddingGemma 2, SigLIP2, NSFW clasificador), MIT (Whisper large-v3-turbo, Silero VAD), AGPL-3.0 (NudeNet) |
| Formato de pesos | OpenVINO IR, ONNX (FP32 e INT8), ONNX sin modificar |

Desglose por carpeta:

| Carpeta | Origen | Revision | Licencia | Tamano | Uso |
|---|---|---|---|---|---|
| `embeddinggemma-2/` | google/embeddinggemma-2 | `f9972ac2` | Apache-2.0 | 2,78 GB | Vectores de imagen y texto; OpenVINO IR (grafo de texto + vision a 70/140/280 tokens), ONNX FP32 (`text.onnx`, `vision.onnx`), tabla de tokens bf16; torre de audio descartada |
| `siglip2-base/` | google/siglip2-base-patch16-224 | `75de2d55` | Apache-2.0 | 2,26 GB | Embedder de respaldo para NPUs que rechazan el grafo de vision de EmbeddingGemma 2; OpenVINO IR + ONNX FP32, torres de imagen y texto |
| `whisper-large-v3-turbo/` | openai/whisper-large-v3-turbo | `41f01f3f` | MIT | 822 MB | Voz a texto; OpenVINO IR con pesos INT8 para OpenVINO GenAI WhisperPipeline |
| `silero-vad/` | snakers4/silero-vad (GitHub) v6.2.3 | `v6.2.3` | MIT | 2 MB | Puerta de voz previa a Whisper; `silero_vad.onnx` sin modificar |
| `nsfw-classifier/` | Falconsai/nsfw_image_detection | `96cb0d03` | Apache-2.0 | 431 MB | Filtro NSFW (ViT-base/16, clases `normal`/`nsfw`); ONNX INT8 dinamico para CPU, FP32 para NPU/GPU |
| `nsfw-detector/` | deepghs/nudenet_onnx (ONNX de notAI-tech/NudeNet) | `44956a05` | AGPL-3.0 | 12 MB | Segundo modelo NSFW (detector de partes del cuerpo YOLOv8n, 640 px); `320n.onnx` renombrado a `model.onnx` |

## Arquitectura y entrenamiento

El repositorio no entrena ningun modelo. Cada carpeta contiene la conversion de un modelo upstream fijado a una revision concreta, generada por los scripts de `Scripts/models` del repositorio BetterRecall. La conversion incluye exportacion a OpenVINO IR y ONNX, cuantizacion INT8 en los casos indicados y una verificacion de fidelidad: la model card afirma que la similitud coseno frente al modelo original es mayor o igual a 0,999 para los embedders. Para EmbeddingGemma 2 se conservan los grafos de texto y de vision con presupuestos de 70, 140 y 280 tokens, se mantiene una tabla de tokens en bf16 y se descarta la torre de audio.

La composicion del stack responde a las necesidades de una herramienta de recall local: SigLIP2 actua como alternativa cuando la NPU rechaza el grafo de vision de EmbeddingGemma 2; Silero VAD filtra el audio antes de pasarlo a Whisper large-v3-turbo, que se ejecuta con pesos INT8 mediante OpenVINO GenAI WhisperPipeline; y los dos clasificadores NSFW (un ViT-base/16 binario y un YOLOv8n de partes del cuerpo a 640 px) forman la puerta de imagenes explicitas. Cada carpeta incluye un `manifest.json` con ficheros, tamanos, SHA-256, fuente y revision upstream, nombres de tensores y preprocesado, lo que permite reproducir y auditar la conversion.

## Capacidades

- Generacion de embeddings de imagen y texto con EmbeddingGemma 2, con grafos de vision a 70, 140 y 280 tokens y grafo de texto independiente.
- Embeddings alternativos de imagen y texto con SigLIP2 ViT-B/16 patch16-224 para hardware que rechaza el grafo de vision principal.
- Reconocimiento automatico de voz (voz a texto) con Whisper large-v3-turbo en formato OpenVINO IR con pesos INT8.
- Deteccion de actividad vocal (VAD) con Silero VAD v6.2.3 como puerta previa a la transcripcion.
- Clasificacion binaria de imagenes NSFW (`normal`/`nsfw`) con un ViT-base/16.
- Deteccion de partes del cuerpo en imagenes de 640 px con NudeNet (YOLOv8n) como segundo filtro de contenido explicito.
- Ejecucion en CPU, GPU y NPU mediante OpenVINO, y en GPU mediante ONNX/DirectML.
- No incluye generacion de texto, razonamiento, codigo, matematicas, tool calling, agentes, vision generativa ni audio generativo.

## Casos de uso

- Busqueda semantica local de capturas de pantalla: EmbeddingGemma 2 genera vectores de imagen y de texto en el mismo espacio, de modo que el usuario puede buscar por descripcion textual entre capturas indexadas sin salir del equipo.
- Indexacion de texto recuperado de pantalla: el grafo de texto de EmbeddingGemma 2 permite vectorizar OCR o texto copiado y combinarlo con los vectores de imagen para recuperacion cruzada.
- Transcripcion de audio en local: Whisper large-v3-turbo en INT8 convierte reuniones o notas de voz en texto sobre CPU o iGPU, sin enviar audio a servicios externos.
- Filtrado de silencio en pipelines de audio: Silero VAD descarta segmentos sin voz antes de invocar Whisper, reduciendo el coste de transcripcion en grabaciones largas con pausas.
- Moderacion de contenido en un archivo personal: la combinacion del clasificador NSFW y el detector NudeNet permite marcar o excluir imagenes explicitas del indice de recall.
- Despliegue en hardware heterogeneo: SigLIP2 como respaldo y las variantes ONNX FP32/INT8 permiten mantener el pipeline en NPUs que rechazan el grafo de vision de EmbeddingGemma 2 o en GPUs via DirectML.
- Reproducibilidad de artefactos: los `manifest.json` con SHA-256 y revision upstream permiten reconstruir el mismo conjunto con `Scripts/models/prepare_all.py` y verificar la integridad de cada grafo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica metrica de calidad declarada es la verificacion de conversion: similitud coseno mayor o igual a 0,999 frente al modelo original para los embedders. No se aportan cifras de latencia, throughput ni precision en tareas downstream.

## Requisitos de hardware

- VRAM/RAM estimada: el conjunto completo ocupa unos 6,30 GB en disco; en inferencia, EmbeddingGemma 2 (2,78 GB) y SigLIP2 (2,26 GB) son los componentes mas pesados y, en FP32, requieren del orden de varios GB de memoria. Whisper large-v3-turbo en INT8 ocupa 822 MB y los filtros NSFW 431 MB y 12 MB.
- GPU recomendadas: no especificadas en la model card. El stack esta disenado para OpenVINO (CPU, iGPU, NPU Intel) y para ONNX con DirectML en GPU Windows.
- GPU de consumo: el diseno apunta a equipos Windows de consumo con NPU o iGPU Intel; no se documentan requisitos minimos ni modelos concretos de GPU.
- Opciones de despliegue: OpenVINO (IR), OpenVINO GenAI WhisperPipeline para el ASR, y ONNX Runtime con DirectML para los grafos ONNX. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelos.
- Latencia y throughput: no disponibles. La model card indica que el worker de BetterRecall re-benchmarkea sus dispositivos en el primer arranque tras un cambio de modelo, pero no publica los resultados.

## Comparativa con modelos similares

No disponible. El repositorio es un paquete de artefactos convertidos de varios modelos y no un modelo unico con alternativas equivalentes; la comparacion directa correspondiente seria contra los modelos upstream (google/embeddinggemma-2, google/siglip2-base-patch16-224, openai/whisper-large-v3-turbo, snakers4/silero-vad, Falconsai/nsfw_image_detection y notAI-tech/NudeNet), para los que no se aportan datos comparativos en la informacion disponible.

## Limitaciones y advertencias

- No es un modelo entrenado: no se ha reentrenado ni ajustado ningun peso; cualquier limitacion de los modelos upstream se hereda integra.
- Licencia mixta por carpeta: Apache-2.0, MIT y AGPL-3.0. La carpeta `nsfw-detector/` se distribuye como AGPL-3.0 aunque el paquete ONNX de origen este etiquetado como Apache-2.0, por precaucion del autor; el uso comercial exige revisar cada licencia y la de BetterRecall (MIT para la UI, AGPL-3.0 para el resto).
- El codigo de BetterRecall esta bajo AGPL-3.0 salvo la interfaz, lo que condiciona su integracion en productos propietarios.
- Riesgo de falsos positivos y negativos en los filtros NSFW; el clasificador ViT-base/16 y el detector YOLOv8n son modelos pequenos y no sustituyen una moderacion humana en produccion.
- La calidad de transcripcion depende del modelo Whisper original y de la cuantizacion INT8 aplicada; no se publican metricas de WER tras la conversion.
- Idiomas soportados no documentados en la model card; la cobertura multilingue de Whisper large-v3-turbo no se detalla.
- La torre de audio de EmbeddingGemma 2 se ha descartado, por lo que no hay embeddings de audio en este paquete.
- Sin descargas ni likes en el momento de la consulta y creado en 2026: ecosistema muy reciente y sin validacion independiente conocida.
- No apto para generacion de texto, razonamiento, codigo, tool calling ni agentes.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/lnminh1411/BetterRecall-models
- Proyecto BetterRecall: https://github.com/lnminh1411/BetterRecall
- Scripts de conversion: https://github.com/lnminh1411/BetterRecall/tree/main/Scripts/models
- Licencias de BetterRecall: https://github.com/lnminh1411/BetterRecall/blob/main/LICENSING.md
- Modelo upstream EmbeddingGemma 2: https://huggingface.co/google/embeddinggemma-2
- Modelo upstream SigLIP2: https://huggingface.co/google/siglip2-base-patch16-224
- Modelo upstream Whisper large-v3-turbo: https://huggingface.co/openai/whisper-large-v3-turbo
- Silero VAD: https://github.com/snakers4/silero-vad
- Clasificador NSFW: https://huggingface.co/Falconsai/nsfw_image_detection
- NudeNet ONNX: https://huggingface.co/deepghs/nudenet_onnx
- NudeNet original: https://github.com/notAI-tech/NudeNet
