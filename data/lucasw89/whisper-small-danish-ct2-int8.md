# lucasw89/whisper-small-danish-ct2-int8

## Resumen

`whisper-small-danish-ct2-int8` es una conversion a CTranslate2 con cuantizacion int8 del modelo `thorhojhus/whisper-small-danish`, un ajuste fino en danes de `openai/whisper-small`. Lo publica el usuario de Hugging Face `lucasw89` y no anade entrenamiento alguno: se limita a reempaquetar los pesos originales en el formato que consume `faster-whisper`, el motor de inferencia de CTranslate2. El objetivo es claro: permitir reconocimiento automatico del habla (ASR) en danes sobre CPU con un coste computacional bajo y una latencia reducida.

El modelo hereda la arquitectura encoder-decoder transformer de Whisper en su variante *small*, con unos 244 millones de parametros, y una ventana de audio de 30 segundos por segmento. La cuantizacion int8 reduce el peso del repositorio a unos 0,2 GB, lo que lo hace apto para despliegues modestos, contenedores ligeros o incluso equipos de sobremesa sin GPU dedicada. La licencia MIT se mantiene desde el repositorio original.

Su relevancia es practica: cubre el hueco de un motor ASR danes listo para produccion con `faster-whisper`, sin necesidad de convertir pesos ni de gestionar dependencias de PyTorch en el servidor. No obstante, se trata de un artefacto de conversion, no de un modelo con entrenamiento propio, y su validacion publicada se limita a un unico clip de 21,5 segundos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper small) |
| Parametros totales | ~244 millones (heredados de whisper-small) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | ventana de audio de 30 segundos por segmento (Whisper) |
| Tipos de cuantizacion | int8 (CTranslate2) |
| Idiomas soportados | danes (da) |
| Licencia | MIT |
| Formato de pesos | CTranslate2 (model.bin), con tokenizer.json y preprocessor_config.json |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Whisper *small*: un encoder transformer que procesa espectrogramas mel de 80 canales sobre ventanas de 30 segundos y un decoder autoregresivo que genera tokens de texto, con atencion cruzada entre ambos. El modelo original `openai/whisper-small` fue entrenado por OpenAI con 680.000 horas de audio supervisado multilingue; el ajuste fino `thorhojhus/whisper-small-danish` adapta esos pesos al danes. Esta version no modifica el entrenamiento: solo aplica `ct2-transformers-converter` con `--quantization int8` (CTranslate2 4.8.4) para generar los pesos en formato CTranslate2.

La innovacion tecnica es exclusivamente de despliegue: la cuantizacion int8 de CTranslate2 permite ejecutar el modelo en CPU con instrucciones vectorizadas, reduciendo memoria y latencia frente a la inferencia en float32 con PyTorch. No hay decodificacion especulativa, atencion lineal ni tecnicas de RLHF/DPO propias de esta conversion; todas las capacidades derivan del modelo base.

## Capacidades

- Transcripcion de voz a texto en danes con marcas de tiempo por segmento.
- Deteccion automatica del idioma (aunque el modelo esta especializado en danes).
- Procesamiento de audio en ventanas de 30 segundos, con soporte de audio de mayor duracion mediante segmentacion.
- Decodificacion con beam search configurable (el autor reporta beam 5 en su medicion).
- Ejecucion en CPU con cuantizacion int8 mediante `faster-whisper`.
- Integracion como motor de servidor en aplicaciones web tipo `whisper_web` (Transformers.js en navegador con motor opcional faster-whisper).
- No soporta tool calling, function calling, agentes, vision ni audio mas alla del ASR.

## Casos de uso

- Subtitulado automatico de contenido audiovisual en danes: el modelo genera segmentos con marcas de tiempo, adecuado para pipelines de transcripcion por lotes donde se prioriza coste bajo sobre precision absoluta.
- Transcripcion de reuniones y notas de voz: al ejecutarse en CPU con int8, puede desplegarse en servidores modestos o en un portatil, procesando grabaciones de forma local sin enviar audio a terceros.
- Atencion al cliente con voz: integrado en un flujo de ASR previo a un LLM, permite transcribir llamadas en danes para su analisis posterior o para alimentar un sistema de respuestas.
- Indexacion y busqueda de archivos de audio: transcripcion masiva de archivos para construir indices de texto consultables, aprovechando el bajo peso (0,2 GB) para escalar horizontalmente.
- Accesibilidad: generacion de subtitulos en directo o diferidos para personas con discapacidad auditiva en contenido danes.
- Prototipado rapido de aplicaciones ASR: el snippet de `faster-whisper` permite tener un servicio funcional en pocas lineas, util para validar productos antes de invertir en modelos mayores.
- Procesamiento en el borde o entornos con recursos limitados: la cuantizacion int8 y el formato CTranslate2 facilitan su inclusion en contenedores ligeros o dispositivos sin GPU.

## Benchmarks y rendimiento

El autor publica una unica medicion de WER sobre un clip danes de 21,5 segundos, con `faster-whisper` en CPU, int8 y beam 5. No es un benchmark representativo, sino una comprobacion de la conversion.

| Metrica | Este modelo (int8) | whisper-small original |
|---|---|---|
| WER (clip danes de 21,5 s, CPU, int8, beam 5) | 0,078 | 0,234 |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, ya que no aplican a un modelo ASR.

## Requisitos de hardware

- VRAM estimada: no requiere GPU; en CPU el modelo ocupa en memoria del orden de 0,2 GB en disco y una huella similar en RAM con int8.
- GPU recomendadas: no es necesario; si se usa GPU, cualquier tarjeta con soporte CUDA y al menos 2 GB de VRAM es suficiente (RTX 3060, RTX 4090, A100, H100).
- Cabe en cualquier GPU de consumo e incluso en CPU de portatil.
- Opciones de despliegue: `faster-whisper` (recomendado, con `device="cpu"` y `compute_type="int8"`), CTranslate2 directamente; no es compatible de forma nativa con vLLM, llama.cpp u Ollama, orientados a LLM.
- Latencia y throughput: no disponibles de forma sistematica; el autor solo reporta la ejecucion sobre un clip de 21,5 segundos en CPU con int8 y beam 5, sin cifras de tiempo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| whisper-small-danish-ct2-int8 (este) | ~244 M | 30 s por segmento | da | MIT | CTranslate2 int8 | Conversion de un fine-tune danes; WER 0,078 en clip de prueba |
| openai/whisper-small | ~244 M | 30 s por segmento | multilingue | MIT | PyTorch safetensors | Modelo base original; WER 0,234 en el mismo clip segun el autor |
| thorhojhus/whisper-small-danish | ~244 M | 30 s por segmento | da | MIT | PyTorch safetensors | Fine-tune danes del que deriva esta conversion; sin cuantizar |
| openai/whisper-large-v3 | ~1.550 M | 30 s por segmento | multilingue | MIT | PyTorch safetensors | Mayor precision esperada, pero mucho mas coste computacional y tamano |

## Limitaciones y advertencias

- La unica evaluacion publicada es un clip de 21,5 segundos; no hay evidencia de rendimiento en dominios variados (ruido, acentos, audio telefonico, habla espontanea).
- Al ser una conversion int8, puede existir una perdida de precision respecto al modelo original en float32, no cuantificada de forma sistematica.
- Es un modelo especializado en danes; su uso en otros idiomas producira resultados pobres o incorrectos.
- Riesgo de alucinacion en pasajes de silencio, ruido o audio ininteligible, comun en la familia Whisper.
- Ventana de contexto de audio limitada a 30 segundos por segmento; audios largos requieren segmentacion externa.
- Sesgos heredados del corpus de entrenamiento original de Whisper y del fine-tune danes, no documentados en esta ficha.
- Licencia MIT heredada del repositorio original; permite uso comercial, pero conviene revisar la model card del modelo base para condiciones y atribuciones.
- No apto para tareas fuera de ASR (no hay tool calling, vision ni razonamiento general).
- Repositorio con muy pocas descargas (30) y sin likes; no hay evidencia de adopcion en produccion ni mantenimiento continuado.

## Enlaces

- Hugging Face: https://huggingface.co/lucasw89/whisper-small-danish-ct2-int8
- Modelo base (fine-tune danes): https://huggingface.co/thorhojhus/whisper-small-danish
- Modelo original de OpenAI: https://huggingface.co/openai/whisper-small
- CTranslate2: https://github.com/OpenNMT/CTranslate2
- faster-whisper: https://github.com/SYSTRAN/faster-whisper
