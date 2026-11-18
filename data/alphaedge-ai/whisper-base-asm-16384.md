# alphaedge-ai/whisper-base-asm-16384

## Resumen

whisper-base-asm-16384 es una variante "trimmed" (podada) de openai/whisper-base, publicada por alphaedge-ai, especializada en reconocimiento automatico del habla (ASR) para el idioma assamés (codigo ISO `as`). El modelo reduce el vocabulario original de Whisper de 51.865 a 16.384 tokens mediante la tecnica de trimming desarrollada por Loïck Bourdois y colaboradores, lo que elimina los tokens poco relevantes para el assamés y conserva los que aparecen con frecuencia en corpus de ese idioma.

El resultado es un modelo un 25,02% mas pequeno que el original (54.427.648 parametros frente a 72.593.920) y con un footprint de memoria notablemente inferior, manteniendo la arquitectura encoder-decoder transformer de Whisper y su ventana de audio de 30 segundos a 16 kHz. La poda del vocabulario se realizo minando 200.000 textos del dataset lbourdois/fineweb-2-trimming, de modo que los tokens retenidos son los que efectivamente aparecen en texto assamés.

Es relevante ahora porque demuestra una via practica para adaptar modelos ASR multilingues grandes a idiomas de bajos recursos sin reentrenar desde cero: se reduce el tamano, se abarata el despliegue en produccion y se mantiene la compatibilidad con el ecosistema transformers y con pipelines estandar de Hugging Face. La contrapartida es que el modelo degrada su rendimiento fuera del assamés, ya que se han eliminado tokens de otros idiomas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper base) |
| Parametros totales | 54.427.648 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | ventana de audio de 30 segundos (Whisper estandar); contexto textual no disponible |
| Tipos de cuantizacion | no disponible en la informacion proporcionada |
| Idiomas soportados | assamés (`as`) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de openai/whisper-base: un transformer encoder-decoder con atención estandar, entrenado originalmente por OpenAI sobre 680.000 horas de audio debilmente supervisado (paper arXiv:2212.04356). La innovacion de esta variante no esta en el entrenamiento sino en la poda del vocabulario: se redujo el vocabulario de 51.865 a 16.384 tokens (una reduccion del 68,41%), lo que a su vez reduce el numero de parametros del modelo en un 25,02%, principalmente en las capas de embedding y en la proyeccion final del decoder.

La seleccion de tokens se hizo minando 200.000 textos del dataset lbourdois/fineweb-2-trimming, filtrando los tokens que aparecen en assamés y descartando los que no. No se indica en la informacion disponible si hubo fine-tuning adicional sobre audio assamés, ni si se aplicaron tecnicas de RLHF o DPO; el modelo se presenta como una version podada del original, no reentrenada. El modelo base es openai/whisper-base, con relacion `quantized`/podada segun los tags.

## Capacidades

- Reconocimiento automatico del habla (transcripcion) para audio en assamés, con entrada de audio a 16 kHz y ventana de 30 segundos.
- Transcripcion de audio mono y multi-turno mediante el pipeline `automatic-speech-recognition` de transformers.
- Soporte de `generate_kwargs` para forzar idioma (`language: assamese`) y tarea (`task: transcribe`).
- Compatible con el ecosistema transformers y con endpoints compatibles (tag `endpoints_compatible`).
- No se documentan capacidades de traduccion, tool calling, agentes, vision ni audio mas alla de ASR.
- Capacidad multilingue limitada: el vocabulario podado elimina tokens de otros idiomas, por lo que el rendimiento fuera del assamés sera degradado.

## Casos de uso

- Transcripcion de reuniones y entrevistas en assamés: el modelo procesa audio a 16 kHz en ventanas de 30 segundos y devuelve texto plano, adecuado para actas y subtitulado en entornos con recursos limitados.
- Subtitulado automatico de contenido audiovisual en assamés: integrable en pipelines de postproduccion mediante el pipeline de transformers, con menor huella de memoria que whisper-base original.
- Servicios de atencion al ciudadano en assamés: transcripcion de llamadas o mensajes de voz para su posterior procesamiento en sistemas de gestion, aprovechando el menor coste de despliegue.
- Investigacion en ASR para idiomas de bajos recursos: sirve como punto de partida para experimentos de poda de vocabulario y evaluacion comparativa frente a whisper-base.
- Despliegue en edge o en contenedores con poca memoria: al ser un 25% mas pequeno, encaja mejor en instancias modestas o en entornos con restricciones de RAM/VRAM.
- Generacion de corpus transcritos para entrenamiento de modelos de lenguaje en assamés: la transcripcion masiva de audio permite construir datasets de texto en ese idioma.
- Prototipado rapido en Hugging Face Endpoints: el tag `endpoints_compatible` facilita el despliegue como servicio gestionado sin infraestructura propia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; por tamano (54,4 M parametros) el modelo cabe holgadamente en GPUs consumer, pero no se proporcionan cifras de VRAM.
- GPU recomendadas: no disponible en la informacion; por tamano, cualquier GPU consumer moderna (por ejemplo, RTX 3060 o superior) deberia ser suficiente, aunque no se confirma.
- Cabe en GPU consumer: si, por el reducido numero de parametros, aunque no se detalla que modelos concretos.
- Opciones de despliegue: pipeline `automatic-speech-recognition` de transformers; compatible con Hugging Face Endpoints; no se documentan opciones como vLLM, llama.cpp, Ollama o TGI para este modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Vocabulario | Contexto | Licencia | Idiomas |
|---|---|---|---|---|---|
| alphaedge-ai/whisper-base-asm-16384 | 54.427.648 | 16.384 | audio 30 s | apache-2.0 | assamés |
| openai/whisper-base | 72.593.920 | 51.865 | audio 30 s | apache-2.0 | multilingue |
| openai/whisper-small | no disponible en la informacion | no disponible | audio 30 s | apache-2.0 | multilingue |
| openai/whisper-tiny | no disponible en la informacion | no disponible | audio 30 s | apache-2.0 | multilingue |

La comparativa se limita a whisper-base (modelo de origen) porque no se han proporcionado datos de rendimiento de alternativas especializadas en assamés. La ventaja principal frente a whisper-base es el menor tamano y footprint de memoria; la desventaja es la perdida de cobertura multilingue.

## Limitaciones y advertencias

- El vocabulario podado elimina tokens no usados en assamés, por lo que el rendimiento en otros idiomas sera notablemente peor que el de whisper-base.
- No se documenta si el modelo fue fine-tuneado con audio assamés; si solo se podo el vocabulario, la calidad real en assamés puede no superar a la del original.
- Riesgo de alucinacion y errores de transcripcion inherentes a Whisper, especialmente en audio con ruido, acentos o vocabulario tecnico.
- Sesgos: no se documentan sesgos especificos, pero hereda los del corpus de entrenamiento original de Whisper.
- Limitacion de contexto: ventana de audio de 30 segundos por segmento; audios mas largos requieren segmentacion.
- Licencia apache-2.0 permite uso comercial, pero se recomienda verificar la procedencia de los datos de minado (fineweb-2-trimming) para usos sensibles.
- No se proporcionan datos de benchmarks ni de evaluacion en assamés, lo que dificulta validar su calidad en produccion.
- El modelo tiene muy pocas descargas (54) y ningun like, lo que sugiere escasa validacion por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/alphaedge-ai/whisper-base-asm-16384
- Modelo base: https://huggingface.co/openai/whisper-base
- Paper de Whisper: https://arxiv.org/abs/2212.04356
- Blog de introduccion a trimming: https://huggingface.co/blog/lbourdois/introduction-to-trimming
- Dataset de minado: https://huggingface.co/datasets/lbourdois/fineweb-2-trimming
- Imagen de estadisticas: https://raw.githubusercontent.com/lbourdois/blog/refs/heads/master/assets/images/Trimming/whisper-base-16384.png
