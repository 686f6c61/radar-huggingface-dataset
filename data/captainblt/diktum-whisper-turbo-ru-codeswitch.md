# CaptainBlt/diktum-whisper-turbo-ru-codeswitch

## Resumen

Este repositorio contiene una compilacion en formato ggml del modelo coriollon/whisper-large-v3-turbo-russian-codeswitch, un Whisper large-v3-turbo afinado para dictado en ruso con terminologia tecnica en ingles. El problema que resuelve es concreto: en una dictado en ruso, terminos como GitHub, Kubernetes o Docker Compose deben transcribirse en alfabeto latino y no transliterarse al cirilico, algo que los Whisper genericos tienden a fallar. El modelo esta pensado para code-switching ruso-ingles en entornos tecnicos.

El autor del repositorio no entrena nada: unicamente convierte los pesos originales (safetensors, fp32) a ggml f16 mediante convert-h5-to-ggml.py de whisper.cpp y despues los cuantiza a q8_0 con la herramienta quantize del mismo proyecto (commit 6e4ab85). El resultado es un unico fichero binario compatible con whisper.cpp y con cualquier loader que entienda ggml, lo que permite ejecutar el modelo en local sobre CPU o GPU.

El modelo pertenece a la aplicacion de dictado Diktum, que descarga el binario desde este repositorio y verifica su SHA-256 antes de usarlo. La relevancia practica esta en que ofrece una via reproducible (mismo resultado byte a byte que otros repaquetados comunitarios) para llevar un ASR ruso tipo Whisper a produccion sobre infraestructura propia, con licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper large-v3-turbo; decoder reducido a 4 capas) |
| Parametros totales | Aproximadamente 809 M (derivado del safetensors original en fp32 de 3.235.581.408 bytes; no confirmado en la informacion disponible) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | ventana de audio de 30 segundos por segmento (caracteristica de Whisper) |
| Tipos de cuantizacion | q8_0 (unico fichero publicado) |
| Idiomas soportados | ruso (ru) e ingles (en), con code-switching entre ambos |
| Licencia | Apache 2.0 |
| Formato de pesos | ggml (.bin) |

Fichero publicado:

| Fichero | Tamano (bytes) | SHA-256 |
|---|---|---|
| ggml-large-v3-turbo-ru-codeswitch-q8_0.bin | 874.188.075 | c56311968f8bf83d5bf02bd6509d8a663380521236fb45bd498a4e60cc8effea |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Whisper large-v3-turbo de OpenAI: un transformer encoder-decoder con encoder completo y decoder reducido a 4 capas, lo que acelera la decodificacion con una degradacion minima de exactitud respecto a large-v3. No es un modelo MoE ni un hibrido; es un modelo denso de decodificacion autoregresiva sobre representaciones mel de audio. Este repositorio no modifica la arquitectura, solo el formato y la precision numerica de los pesos.

La cadena de ascendencia es coriollon/whisper-large-v3-turbo-russian-codeswitch, que a su vez es un fine-tune de coriollon/whisper-large-v3-turbo-russian y, a traves de este, de OpenAI Whisper large-v3-turbo (MIT). Todo el trabajo de entrenamiento y el ajuste para code-switching ruso-ingles corresponden al autor de esos modelos base. Los detalles del dataset de entrenamiento, numero de tokens o uso de RLHF/DPO no estan disponibles en la informacion proporcionada. El proceso de conversion de este repositorio si esta documentado y es reproducible: safetensors fp32 (3.235.581.408 bytes) a ggml f16 (1.624.555.275 bytes) y despues a q8_0.

## Capacidades

- Reconocimiento automatico de voz (ASR) en ruso con terminologia tecnica en ingles escrita en caracteres latinos (GitHub, Kubernetes, Docker Compose).
- Manejo de code-switching ruso-ingles dentro de una misma frase o dictado.
- Integracion directa con whisper.cpp y con cualquier aplicacion construida sobre el (whisper-cli, bindings de terceros).
- Funcionamiento offline en local, sin dependencia de API externa.
- Carga y ejecucion acelerada por GPU mediante backends Vulkan, CUDA y Metal.
- Seguimiento del idioma fijado por parametro (por ejemplo `-l ru`) para forzar la transcripcion en ruso.
- No se documentan en la informacion disponible capacidades de vision, audio mas alla de la transcripcion, tool calling, agentes ni modo de razonamiento explicito.

## Casos de uso

- Dictado tecnico en ruso: un desarrollador hispanohablante o rusoparlante dicta notas de reunion mezclando terminos de infraestructura en ingles; el modelo transcribe GitHub, Kubernetes o Docker Compose en alfabeto latino, evitando transliteraciones erroneas.
- Documentacion de proyectos en ruso: transcripcion de sesiones de diseno o comentarios de codigo hablados donde aparecen nombres de herramientas y librerias en ingles.
- Integracion en la aplicacion Diktum: el binario se descarga y se valida por SHA-256, por lo que encaja como dependencia fija del pipeline de dictado de esa app.
- Subtitulado de charlas tecnicas en ruso: generacion de transcripciones de conferencias donde los ponentes alternan ruso e ingles sin cambiar de idioma manualmente.
- Notas de voz de soporte tecnico: transcripcion local de mensajes de clientes rusoparlantes que citan comandos, repositorios o servicios de cloud en ingles.
- Preprocesado de audio para busqueda interna: convertir reuniones en texto indexable sin enviar audio a servicios en la nube, util cuando hay requisitos de privacidad.
- Prototipos de asistentes de voz en ruso: usar el modelo como capa ASR en un pipeline propio (ASR mas LLM) sobre hardware local.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye cifras de WER, MMLU ni de ningun otro conjunto de evaluacion, y las busquedas web realizadas no aportan numeros concretos para este modelo. Fuentes externas como la comparativa de alphacephei sobre modelos de reconocimiento de voz en ruso mencionan Whisper V3 Turbo y GigaAM, pero no se dispone aqui de los valores medidos, por lo que no se reproducen.

## Requisitos de hardware

- VRAM estimada para el fichero publicado (q8_0, 874 MB): aproximadamente 1 a 2 GB de memoria durante la inferencia.
- La version f16 intermedia ocupa 1,62 GB; si se generase una cuantizacion menor, el consumo bajaria proporcionalmente.
- Cabe en GPU de consumo: tarjetas con 4 GB o mas de VRAM (por ejemplo RTX 3050, RTX 3060, GTX 1650 en adelante) son suficientes para el binario q8_0.
- GPU recomendadas segun el backend: NVIDIA con CUDA (RTX 4090, A100, H100 si se necesita throughput alto), AMD e Intel con Vulkan, Apple Silicon con Metal.
- La model card recomienda explicitamente una build con GPU (Vulkan, CUDA, Metal); en CPU el modelo es notablemente mas lento que las variantes mas pequenas de Whisper.
- Despliegue: whisper.cpp (whisper-cli), y cualquier loader compatible con ggml. No se documentan en la informacion disponible integraciones con vLLM, TGI u Ollama para este fichero.
- Latencia y throughput concretos: no disponibles. Dependeran del backend, del hardware y de si se usa la build f16 o q8_0.

## Comparativa con modelos similares

| Modelo | Parametros | Ventana de audio | Idiomas | Licencia | Formato | Rendimiento |
|---|---|---|---|---|---|---|
| CaptainBlt/diktum-whisper-turbo-ru-codeswitch | ~809 M (no confirmado) | 30 s | ru, en (code-switching) | Apache 2.0 | ggml q8_0 | no disponible |
| coriollon/whisper-large-v3-turbo-russian-codeswitch | no disponible | 30 s | ru, en (code-switching) | no disponible | safetensors fp32 | no disponible |
| openai/whisper-large-v3-turbo | ~809 M | 30 s | multilingue (amplio) | MIT | safetensors | no disponible aqui |
| openai/whisper-large-v3 | ~1550 M | 30 s | multilingue (amplio) | MIT | safetensors | no disponible aqui |

La diferencia clave frente a los Whisper genericos es el ajuste especifico para code-switching ruso-ingles y el empaquetado ggml listo para whisper.cpp. Frente a alternativas centradas en ruso como GigaAM, no se dispone de datos de comparacion en la informacion proporcionada.

## Limitaciones y advertencias

- Riesgo de alucinacion tipico de la familia Whisper en silencios, ruido de fondo o audio musical; conviene aplicar umbrales de confianza y deteccion de silencio en produccion.
- El modelo esta afinado para ruso con terminos ingleses; el rendimiento en otros idiomas o en ingles puro no esta documentado y puede degradarse.
- La ventana de audio es de 30 segundos por segmento; audios mas largos requieren segmentacion externa (whisper.cpp lo gestiona, pero hay que configurarlo).
- La model card no incluye benchmarks ni evaluacion de sesgos, por lo que no hay evidencia publicada sobre su comportamiento en acentos, habla espontanea o dominios ruidosos.
- El fichero q8_0 es una cuantizacion: puede introducir pequenas perdidas de exactitud frente al modelo en fp32 original, aunque no se cuantifican en la informacion disponible.
- Licencia Apache 2.0 en este repositorio y en el modelo base inmediato, lo que permite uso comercial; no obstante, conviene verificar la cadena completa de licencias (el Whisper original es MIT) si se redistribuye.
- El repositorio no registra descargas ni interacciones y fue creado y actualizado el mismo dia, por lo que no hay historial de uso ni validacion por parte de la comunidad.
- La integridad del binario debe comprobarse por SHA-256, tal como hace la aplicacion Diktum, ya que es un fichero descargado en tiempo de ejecucion.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/CaptainBlt/diktum-whisper-turbo-ru-codeswitch
- Modelo base inmediato: https://huggingface.co/coriollon/whisper-large-v3-turbo-russian-codeswitch
- Arbol de ficheros del modelo base: https://huggingface.co/coriollon/whisper-large-v3-turbo-russian-codeswitch/tree/main
- Whisper (OpenAI), repositorio oficial: https://github.com/openai/whisper
- Comparativa de modelos STT locales (OpenVox AI): https://openvoxai.com/blog/best-local-stt-transcription-models-2026
- Analisis de modelos de reconocimiento de voz en ruso (alphacephei): https://alphacephei.com/nsh/2024/04/14/russian-models.html
