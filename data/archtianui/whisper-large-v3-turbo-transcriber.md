# ArchTianui/whisper-large-v3-turbo-transcriber

## Resumen

`ArchTianui/whisper-large-v3-turbo-transcriber` es un paquete de conversiones de formato y cuantizacion del modelo `openai/whisper-large-v3-turbo` de OpenAI, publicadas por el usuario ArchTianui para su uso en la aplicacion de escritorio de transcripcion offline *Transcriber International*. No se trata de un modelo nuevo ni de un fine-tuning: los pesos son los originales de OpenAI (commit `41f01f3fe87f28c78e2fbf8b568835947dd65ed9`), y unicamente se han modificado el formato de fichero y la cuantizacion para permitir la inferencia en CPU, GPU integrada Intel, NPU y GPU Vulkan.

El modelo base es Whisper large-v3-turbo, un modelo de reconocimiento automatico del habla (ASR) de arquitectura transformer encoder-decoder con atencion estandar, disenado para transcripcion multilingue y traduccion al ingles. La variante turbo reduce la profundidad del decodificador respecto a large-v3, lo que rebaja el coste computacional manteniendo una calidad cercana, a costa de una ligera perdida de precision en algunos idiomas.

La relevancia de este repositorio es practica: ofrece los mismos pesos en tres ecosistemas de inferencia (CTranslate2, OpenVINO y whisper.cpp) con cuantizacion int8/q8_0, lo que facilita desplegar transcripcion local sin GPU dedicada. El autor lo marca explicitamente como publicacion de prueba: la precision en el contexto real de la aplicacion aun no se ha evaluado y los modelos que no superen esa evaluacion seran retirados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper large-v3-turbo) |
| Parametros totales | no disponible (repo de 2,5 GB; pesos int8 de ~814 MB en CT2) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (ventana de audio de 30 s por segmento en Whisper; no confirmado en la model card) |
| Tipos de cuantizacion | int8 (CTranslate2 y OpenVINO IR), q8_0 (GGML/whisper.cpp) |
| Idiomas soportados | multilingue (modelo base para todos los idiomas segun el autor) |
| Licencia | MIT |
| Formato de pesos | CTranslate2 (`model.bin`), OpenVINO IR (`.xml`/`.bin`), GGML (`ggml-model-q8_0.bin`) |

## Arquitectura y entrenamiento

El modelo subyacente es Whisper large-v3-turbo de OpenAI, un transformer encoder-decoder con atencion completa (no hay atencion lineal, MoE ni arquitectura hibrida SSM). El encoder procesa espectrogramas Mel de audio y el decodificador genera tokens de texto de forma autorregresiva. La variante turbo se caracteriza por un decodificador mas superficial que large-v3, lo que reduce el numero de capas y, con ello, el coste de inferencia.

Este repositorio no aporta informacion sobre el entrenamiento: no se indica numero de tokens, composicion del dataset, ni si hubo RLHF o DPO. La model card remite explicitamente a la model card original de OpenAI para los detalles de entrenamiento y resultados. La unica transformacion aplicada es la conversion de formato y la cuantizacion a int8/q8_0 en los tres backends. Cada fichero incluye su SHA-256 en el catalogo firmado de la aplicacion, que rechaza los ficheros que no coinciden.

## Capacidades

- Reconocimiento automatico del habla (ASR) multilingue sobre audio.
- Transcripcion offline en CPU mediante CTranslate2 con pesos int8.
- Transcripcion en GPU, NPU y CPU Intel mediante OpenVINO IR int8.
- Transcripcion en GPU Vulkan mediante whisper.cpp con cuantizacion q8_0.
- Verificacion de integridad de los pesos mediante SHA-256 en el catalogo de la aplicacion.
- Soporte de multiples idiomas segun la etiqueta `multilingual` del modelo base (sin lista detallada en la model card).
- No se documentan capacidades de tool calling, agentes, vision, audio adicional ni modo de razonamiento explicito; son funciones ajenas al proposito ASR del modelo.

## Casos de uso

- Transcripcion offline en equipos sin GPU dedicada: el formato CTranslate2 int8 permite ejecutar el modelo en CPU con un consumo de memoria reducido (pesos de ~814 MB), adecuado para portatiles y estaciones de trabajo convencionales.
- Despliegue en equipos con grafica o NPU Intel: la variante OpenVINO IR int8 aprovecha la aceleracion de GPU integrada y NPU Intel, util para aplicaciones de escritorio que necesitan transcripcion en tiempo casi real sin tarjeta grafica dedicada.
- Transcripcion con GPU Vulkan en sistemas heterogeneos: el formato GGML q8_0 de whisper.cpp permite usar la GPU a traves de Vulkan en plataformas donde no hay CUDA ni OpenVINO, ampliando la compatibilidad de la aplicacion.
- Aplicacion de escritorio de transcripcion (Transcriber International): es el caso de uso declarado por el autor; el modelo se distribuye como base multilingue para todos los idiomas de la app.
- Procesado por lotes de archivos de audio en servidores sin GPU: al ser int8 y CTranslate2, se puede integrar en pipelines de transcripcion masiva en CPU con requisitos de memoria moderados.
- Verificacion de integridad en entornos controlados: el catalogo firmado con SHA-256 permite desplegar los pesos en entornos donde se exige comprobar que los ficheros no han sido alterados.
- Prototipado y evaluacion de ASR local: al estar en tres formatos, sirve para comparar latencia y calidad entre CTranslate2, OpenVINO y whisper.cpp antes de fijar un backend en produccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que la precision en el contexto de la aplicacion aun no se ha evaluado y que los modelos que no superen la evaluacion seran retirados.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: los pesos int8 ocupan aproximadamente 814 MB (CTranslate2), 814 MB (OpenVINO, suma de encoder y decoder int8) y 874 MB (GGML q8_0); a ello hay que sumar el consumo de activaciones y del runtime, no cuantificado en la model card.
- GPU recomendadas: no disponibles en la informacion proporcionada. El autor orienta cada formato a un hardware concreto: CTranslate2 a CPU, OpenVINO a GPU/NPU/CPU Intel y whisper.cpp a GPU Vulkan.
- Compatibilidad con GPU de consumo: si, segun el backend; OpenVINO cubre GPU integradas Intel y whisper.cpp cubre GPU con soporte Vulkan. No se detallan modelos concretos.
- Opciones de despliegue: CTranslate2, OpenVINO Runtime y whisper.cpp (GGML). No se mencionan vLLM, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formatos |
|---|---|---|---|---|---|
| ArchTianui/whisper-large-v3-turbo-transcriber | no disponible (base large-v3-turbo) | no disponible | multilingue | MIT | CT2 int8, OpenVINO int8, GGML q8_0 |
| openai/whisper-large-v3-turbo | no disponible en esta ficha | no disponible | multilingue | MIT | safetensors (pesos originales) |
| openai/whisper-large-v3 | no disponible en esta ficha | no disponible | multilingue | MIT | safetensors |

La comparativa se limita a los modelos citados en la informacion disponible; no se aportan datos de rendimiento ni de precision que permitan una comparacion cuantitativa.

## Limitaciones y advertencias

- No es un modelo nuevo ni un fine-tuning: los pesos son los originales de OpenAI; solo cambian formato y cuantizacion.
- Estado de publicacion de prueba: la precision en el contexto real de la aplicacion no se ha evaluado y los modelos que fallen la evaluacion seran retirados, por lo que la disponibilidad futura no esta garantizada.
- La cuantizacion int8/q8_0 puede degradar la calidad de transcripcion respecto a los pesos originales en precision completa; no se han publicado mediciones de esa perdida.
- No se detalla la lista de idiomas soportados ni su calidad relativa; la etiqueta `multilingual` remite al modelo base.
- No hay informacion sobre sesgos, riesgo de alucinacion en audio ruidoso ni limitaciones de contexto mas alla de las propias de Whisper.
- Licencia MIT segun el autor original; conviene verificar los terminos de la model card de OpenAI antes de un uso comercial.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validacion por parte de la comunidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/ArchTianui/whisper-large-v3-turbo-transcriber
- Modelo base: https://huggingface.co/openai/whisper-large-v3-turbo
- Commit del modelo base referenciado: `41f01f3fe87f28c78e2fbf8b568835947dd65ed9`
- CTranslate2: no disponible en la informacion proporcionada
- OpenVINO: no disponible en la informacion proporcionada
- whisper.cpp: no disponible en la informacion proporcionada
