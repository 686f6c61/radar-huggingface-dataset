# chabasx/NoteTkr-mirror-Qwen3-ASR-0.6B-MLX-4bit

## Resumen

NoteTkr-mirror-Qwen3-ASR-0.6B-MLX-4bit es una conversion cuantizada a 4 bits en formato MLX del modelo Qwen/Qwen3-ASR-0.6B, un sistema de reconocimiento automatico del habla (ASR) desarrollado originalmente por el equipo Qwen de Alibaba. La conversion la firma el usuario chabasx bajo el paraguas del proyecto NoteTkr y esta pensada especificamente para inferencia en Apple Silicon mediante el framework MLX, lo que permite ejecutar el modelo de forma local en equipos Mac con memoria unificada.

El modelo resuelve el problema de la transcripcion de audio a texto multilingue en entornos de escritorio y dispositivos Apple, sin necesidad de GPU dedicada ni de conexion a servicios en la nube. Con 782.426.112 parametros reales (etiquetado comercialmente como 0.6B) y un peso de repositorio de aproximadamente 0,7 GB tras la cuantizacion, es lo bastante ligero como para integrarse en aplicaciones de productividad, toma de notas o asistentes de voz.

Su relevancia actual radica en que combina una arquitectura encoder-decoder de estilo Whisper con un decodificador de texto derivado de la familia Qwen3, ofreciendo soporte para siete idiomas declarados (ingles, chino, japones, coreano, frances, aleman y espanol) bajo licencia Apache 2.0, lo que facilita su adopcion comercial. La cuantizacion MLX 4-bit reduce drasticamente los requisitos de memoria manteniendo, segun el autor, la utilidad practica para transcripcion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder-decoder Qwen3-ASR (encoder de audio estilo Whisper + decoder de texto Qwen3) |
| Parametros totales | 782.426.112 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | 4-bit (MLX); el modelo base admite otras cuantizaciones no detalladas |
| Idiomas soportados | Ingles, chino, japones, coreano, frances, aleman, espanol (y otros segun la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX), cuantizado a 4 bits |
| Tamano del repositorio | ~0,7 GB |
| Libreria | MLX |
| Modelo base | Qwen/Qwen3-ASR-0.6B |

## Arquitectura y entrenamiento

La arquitectura es un encoder-decoder de tipo ASR: un encoder de audio con diseno inspirado en Whisper que procesa la senal acustica (tipicamente muestras a 16 kHz) y un decoder de texto basado en Qwen3 que genera la transcripcion. Esta estructura es la habitual en los sistemas ASR modernos de extremo a extremo y permite mapear directamente audio a texto sin pipelines separados de alineamiento fonetico.

La informacion disponible no detalla el volumen de datos de entrenamiento, la composicion del corpus ni si se aplicaron tecnicas de RLHF o DPO. Se desconoce igualmente el numero de horas de audio utilizadas y la distribucion por idioma. La innovacion tecnica destacable de esta publicacion concreta no es el entrenamiento, sino la conversion a MLX 4-bit para Apple Silicon, que reduce el peso a unos 680 MB y habilita la inferencia local en Mac mediante el modulo `Qwen3ASR` del proyecto speech-swift.

## Capacidades

- Transcripcion de voz a texto (ASR) de extremo a extremo a partir de audio muestreado a 16 kHz.
- Soporte multilingue para ingles, chino, japones, coreano, frances, aleman y espanol, con posibilidad de mas idiomas segun la model card.
- Inferencia local en Apple Silicon mediante MLX, sin dependencia de servicios en la nube.
- Integracion programatica a traves de Swift (`Qwen3ASRModel.fromPretrained()` y `model.transcribe(...)`) y de una interfaz de linea de comandos (`audio transcribe audio.wav`).
- No se documentan capacidades de tool calling, function calling, razonamiento multi-paso ni vision; se trata de un modelo especializado en ASR.

## Casos de uso

- Toma de notas y transcripcion de reuniones en Mac: el modelo convierte el audio de una reunion en texto directamente en el equipo, sin enviar datos a terceros, aprovechando su tamano reducido (~680 MB) y la ejecucion nativa en MLX.
- Subtitulado de contenido audiovisual: integrado en un pipeline que extrae el audio a 16 kHz y llama al modelo por segmentos, permite generar subtitulos en varios idiomas de forma local.
- Asistentes de voz en aplicaciones de escritorio para macOS: el modulo Swift de speech-swift facilita incorporar dictado por voz en apps nativas con una API sencilla.
- Procesamiento por lotes de archivos de audio: la CLI `audio transcribe` permite automatizar la transcripcion de carpetas enteras de grabaciones en scripts de shell.
- Investigacion en ASR multilingue: al ser Apache 2.0 y ligero, sirve como linea base reproducible para experimentos con modelos encoder-decoder pequenos en hardware Apple.
- Prototipado rapido de funcionalidades de voz: desarrolladores que quieran validar una idea de transcripcion en un Mac antes de invertir en infraestructura GPU pueden usar esta version cuantizada sin coste de servidor.
- Aplicaciones de accesibilidad: transcripcion en tiempo casi real de audio para personas con dificultades auditivas en entornos personales, ejecutandose en el propio dispositivo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria estimada: aproximadamente 0,7 GB de pesos en 4-bit, mas overhead de activaciones y del runtime MLX; en la practica, unos pocos GB de memoria unificada son suficientes.
- Hardware objetivo: Apple Silicon (series M1, M2, M3, M4 y posteriores) con memoria unificada; el framework MLX no esta pensado para GPU NVIDIA.
- Cabe holgadamente en cualquier Mac con Apple Silicon, incluso en configuraciones de 8 GB de memoria unificada.
- Opciones de despliegue: MLX con el modulo `Qwen3ASR` de speech-swift (Swift) o la CLI `audio transcribe`; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI en esta version.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Formato/plataforma | Licencia | Contexto |
|---|---|---|---|---|---|
| NoteTkr-mirror-Qwen3-ASR-0.6B-MLX-4bit | 782 M | 7+ | MLX 4-bit (Apple Silicon) | Apache 2.0 | No disponible |
| Qwen/Qwen3-ASR-0.6B (base) | ~0,6 B | 7+ | safetensors (generico) | Apache 2.0 | No disponible |
| Whisper small (referencia ASR) | ~244 M | ~99 | Multiples (incl. GGUF, MLX) | MIT | 30 s de audio por ventana |
| Whisper medium (referencia ASR) | ~769 M | ~99 | Multiples (incl. GGUF, MLX) | MIT | 30 s de audio por ventana |

La comparacion con Whisper se ofrece como referencia de categoria (ASR de tamano similar), aunque los datos de rendimiento de Qwen3-ASR no estan publicados en la informacion disponible, por lo que no es posible establecer una comparacion cuantitativa de precision.

## Limitaciones y advertencias

- No se han publicado datos de benchmarks, por lo que no hay evidencia cuantitativa de precision frente a alternativas como Whisper.
- Al ser una cuantizacion 4-bit, es esperable cierta perdida de precision respecto al modelo base de 0,6B, aunque no se documenta su magnitud.
- La model card no detalla sesgos conocidos ni el comportamiento en acentos, ruido de fondo o audio de baja calidad.
- El soporte de idiomas declarado es limitado (siete idiomas) en comparacion con sistemas como Whisper, que cubren decenas de lenguas.
- Dependencia de MLX y Apple Silicon: no es desplegable en GPU NVIDIA ni en entornos de servidor convencionales sin conversion adicional.
- Repositorio con cero descargas y cero likes en el momento de la consulta; es un espejo de terceros, no una publicacion oficial de Qwen, por lo que conviene verificar la integridad de los pesos antes de usarlo en produccion.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda revisar las condiciones del modelo base original.
- No se documenta la longitud de contexto ni la ventana maxima de audio procesable de una sola vez.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/chabasx/NoteTkr-mirror-Qwen3-ASR-0.6B-MLX-4bit
- Modelo base: https://huggingface.co/Qwen/Qwen3-ASR-0.6B
- Repositorio speech-swift: https://github.com/soniqo/speech-swift
- Guia de transcripcion: https://soniqo.audio/guides/transcribe
- Documentacion: https://soniqo.audio
