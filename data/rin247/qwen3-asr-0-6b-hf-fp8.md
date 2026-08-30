# Rin247/Qwen3-ASR-0.6B-hf-FP8

## Resumen

Qwen3-ASR-0.6B-hf-FP8 es una cuantización weight-only en formato FP8 del modelo de reconocimiento de voz automático Qwen3-ASR-0.6B, desarrollado por el equipo Qwen de Alibaba. El modelo base pertenece a la familia Qwen3-ASR, que incluye también la variante de 1.7B, y está diseñado para realizar identificación de idioma y transcripción de voz (ASR) en 52 idiomas y dialectos, incluyendo 30 idiomas y 22 dialectos chinos. Se apoya en el modelo fundacional Qwen3-Omni, lo que le otorga una capacidad robusta de comprensión de audio.

Esta versión cuantizada, publicada por el usuario Rin247 en HuggingFace, reduce el tamaño del modelo a aproximadamente 1 GB (frente a los pesos originales en BF16) manteniendo los pesos en FP8 con escalas almacenadas por separado. Está pensada para facilitar el despliegue en entornos con recursos limitados, como GPUs de consumo o inferencia en CPU, sin necesidad de recurrir a formatos como GGUF. La cuantización se realizó mediante PyTorch RTN en CPU y los archivos incluyen el `config.json` con la configuración de cuantización.

El modelo es relevante porque ofrece una alternativa compacta y eficiente para tareas de transcripción multilingüe, con un equilibrio entre tamaño y rendimiento, y su licencia (aunque no declarada en esta versión cuantizada) suele ser abierta en el modelo base, lo que facilita su adopción en proyectos comerciales y de investigación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de audio basado en Qwen3-Omni (encoder de audio + decoder de texto) |
| Parametros totales | 782.426.112 (aprox. 0.78B) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible (modelo de audio, no de texto largo) |
| Tipos de cuantizacion | FP8 (weight-only, con escalas de cuantizacion) |
| Idiomas soportados | 52 idiomas y dialectos (30 idiomas + 22 dialectos chinos) segun documentacion del modelo base |
| Licencia | no disponible en esta version cuantizada; el modelo base Qwen3-ASR usa licencia Apache 2.0 (segun repositorio oficial) |
| Formato de pesos | safetensors con formato custom FP8 (weight_scale y weight_shape) |

## Arquitectura y entrenamiento

La arquitectura exacta de Qwen3-ASR-0.6B no se detalla en la informacion proporcionada, pero se sabe que se basa en el modelo fundacional Qwen3-Omni, que combina un encoder de audio con un decoder de lenguaje. El modelo fue entrenado con grandes volumenes de datos de habla y aprovecha la capacidad de comprension auditiva de Qwen3-Omni para realizar tareas de ASR y de identificacion de idioma en 52 idiomas y dialectos.

El entrenamiento del modelo base (Qwen3-ASR-0.6B) se describe en el technical report (arXiv:2601.21337), que menciona el uso de datos de habla a gran escala y tecnicas de alineacion para mejorar la robustez en audio desafiante, como voz cantada o canciones. En cuanto a la version cuantizada FP8, se aplico cuantizacion RTN (Round-to-Nearest) por pesos, realizada en CPU, almacenando las escalas y shapes junto a los pesos. No se menciona ningun ajuste fino posterior a la cuantizacion, por lo que se asume que el rendimiento es el del modelo base con una posible degradacion minima.

## Capacidades

- Reconocimiento de voz automatico (ASR) en 52 idiomas y dialectos, incluyendo 30 idiomas y 22 dialectos chinos.
- Identificacion de idioma (language identification) como funcion integrada, capaz de detectar el idioma hablado en el audio.
- Robustez en audio desafiante: voz limpia, voz cantada y canciones, segun la documentacion del modelo base.
- Generacion de transcripciones de texto a partir de audio, con soporte para audio de entrada variable (no se especifica la duracion maxima).
- No se mencionan capacidades de tool calling, agentes ni razonamiento multi-paso, ya que es un modelo puramente de audio a texto.

## Casos de uso

- Transcripcion de reuniones y conferencias: el modelo puede transcribir audio en multiples idiomas, lo que permite generar actas o subtitulos en tiempo real o diferido. Su identificacion de idioma ayuda a detectar cambios de idioma en conversaciones multilingues.
- Subtitulado automatico de videos: integrable en pipelines de postproduccion para generar subtitulos en varios idiomas, aprovechando su soporte de 52 idiomas y dialectos, incluidos dialectos chinos como cantonés o wu.
- Asistentes de voz para entornos con recursos limitados: al ser un modelo de 0.78B cuantizado a FP8, cabe en GPUs de consumo (por ejemplo, RTX 3060 con 8 GB) y puede ejecutarse en CPU con baja latencia, ideal para dispositivos edge o aplicaciones embebidas.
- Analisis de contenido audiovisual: transcripcion de podcasts, grabaciones de llamadas o archivos de audio para indexacion y busqueda, gracias a su capacidad de manejar audio con voz cantada o ruido de fondo.
- Servicios de accesibilidad: generacion de subtitulos para personas con discapacidad auditiva, con soporte multilingue y dialectal, lo que amplia la cobertura geografica.
- Investigacion linguistica y dialectal: el modelo puede utilizarse para transcribir y etiquetar corpus de habla en dialectos poco representados, facilitando estudios foneticos y sociolinguisticos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La documentacion del modelo base menciona que es robusto en audio desafiante, pero no se proporcionan metricas numericas (WER, CER, etc.) en los resultados de busqueda ni en la model card de la version cuantizada. Se recomienda consultar el technical report (arXiv:2601.21337) para obtener datos comparativos.

## Requisitos de hardware

- VRAM estimada para inferencia: dado que el modelo tiene 782M de parametros y los pesos en FP8 ocupan aproximadamente 0.78 GB, con overhead de activaciones y buffers se estima un consumo de entre 1.5 y 2.5 GB de VRAM, dependiendo del tamaño del lote y la longitud del audio.
- GPUs recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente, por ejemplo NVIDIA GTX 1650, RTX 3060, RTX 4060, o GPUs de datacenter como T4 o A10. Tambien puede ejecutarse en CPU (x86_64 con instrucciones AVX2) con mayor latencia.
- Compatibilidad con GPUs consumer: sí, cabe en GPUs de gama media y baja.
- Opciones de despliegue: al ser un formato safetensors con cuantizacion custom, se requiere un runtime que soporte la des-cuantizacion de los pesos FP8. No se mencionan integraciones con vLLM, Ollama o llama.cpp, pero puede cargarse con PyTorch y un script de des-cuantizacion segun las instrucciones del autor. Para produccion, se podria convertir a otros formatos (por ejemplo, ONNX o TensorRT) si se desea mayor optimizacion.
- Latencia y throughput estimados: no disponibles. Se espera que en GPU sea rapido (inferior a 1 segundo para audio de 10 segundos), pero no hay datos publicados.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3-ASR-0.6B (base) | 0.6B (aprox. 782M) | no especificado | 52 idiomas/dialectos | Apache 2.0 (según repo oficial) | safetensors (BF16) |
| Qwen3-ASR-1.7B | 1.7B | no especificado | 52 idiomas/dialectos | Apache 2.0 (según repo oficial) | safetensors (BF16) |
| Whisper small (OpenAI) | 244M | 30 segundos de audio | 96 idiomas | MIT | safetensors, GGUF, etc. |
| Whisper large-v3 | 1.55B | 30 segundos de audio | 99 idiomas | MIT | safetensors, GGUF, etc. |

La comparativa se basa en informacion publica de los modelos base. Qwen3-ASR-0.6B destaca por su soporte de dialectos chinos y su robustez en audio musical, mientras que Whisper ofrece un mayor numero de idiomas y una integracion mas amplia en ecosistemas existentes. La version FP8 de Qwen3-ASR-0.6B no tiene una alternativa directa en Whisper cuantizado, pero ambas pueden desplegarse en hardware de consumo.

## Limitaciones y advertencias

- La licencia de esta version cuantizada no esta declarada en HuggingFace; aunque el modelo base usa Apache 2.0, es recomendable verificar los terminos de uso antes de un despliegue comercial.
- La cuantizacion FP8 puede introducir una degradacion ligera en la precision de la transcripcion, especialmente en audio con ruido o acentos extremos, comparado con el modelo en BF16.
- No se proporcionan datos de rendimiento (WER, CER) para esta version cuantizada, por lo que es necesario validar su calidad en el dominio objetivo antes de usarla en produccion.
- El modelo solo procesa audio; no soporta entrada de texto ni generacion de lenguaje general, por lo que no es adecuado para tareas de chat o razonamiento.
- La lista de idiomas soportados (52) cubre una amplia gama, pero no incluye todos los dialectos regionales; se recomienda probar con muestras reales del idioma objetivo.
- El formato de pesos custom (FP8 con escalas separadas) requiere un codigo de des-cuantizacion especifico; no es directamente compatible con frameworks estandar sin adaptacion.

## Enlaces

- Modelo cuantizado en HuggingFace: https://huggingface.co/Rin247/Qwen3-ASR-0.6B-hf-FP8
- Repositorio oficial de Qwen3-ASR (GitHub): https://github.com/QwenLM/Qwen3-ASR
- Technical report en arXiv: https://arxiv.org/html/2601.21337v1
- Coleccion Qwen3-ASR en HuggingFace: https://huggingface.co/collections/Qwen/qwen3-asr
- Pagina de OpenASR con informacion del modelo: https://openasr.org/models/qwen3-asr-0.6b/
