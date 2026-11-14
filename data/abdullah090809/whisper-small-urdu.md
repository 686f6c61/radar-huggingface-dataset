# abdullah090809/whisper-small-urdu

## Resumen

Whisper Small Urdu es un ajuste fino (fine-tuning) del modelo `openai/whisper-small` de OpenAI, especializado en reconocimiento automático del habla (ASR) para urdu, con enfasis en la variante pakistani. Lo desarrolla el usuario de Hugging Face abdullah090809 y se distribuye bajo licencia Apache 2.0. El modelo parte de la arquitectura encoder-decoder transformer de Whisper, con 241.734.912 parametros, y hereda la ventana de contexto de audio de 30 segundos del modelo base.

El problema que resuelve es la baja precision del Whisper original en urdu: el modelo zero-shot obtiene un WER normalizado del 41,04 % en Common Voice y del 41,19 % en FLEURS, cifras poco utiles en produccion. Tras el ajuste fino sobre `fsicoli/common_voice_19_0` y `google/fleurs`, el WER normalizado baja al 26,22 % y al 25,00 % respectivamente, y el CER normalizado cae por debajo del 10 %. Es relevante para proyectos que necesitan transcripcion de audio en urdu sin depender de APIs comerciales.

El modelo es pequeno (241 M de parametros, repo de 1,0 GB en safetensors), lo que lo hace desplegable en hardware modesto, aunque su calidad sigue siendo limitada para produccion critica: un WER del 25-26 % implica que una de cada cuatro palabras se transcribe incorrectamente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper) |
| Parametros totales | 241.734.912 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 30 segundos de audio por ventana (heredado de whisper-small) |
| Tipos de cuantizacion | no disponible en la model card (compatible con cuantizacion estandar de transformers/GGUF via conversion) |
| Idiomas soportados | urdu (ur) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo mantiene la arquitectura original de Whisper Small: un encoder-decoder transformer con atencion por bloques, entrenado originalmente por OpenAI sobre pares audio-transcripcion a gran escala. Este ajuste fino conserva todos los pesos del modelo base y los adapta al dominio del urdu mediante entrenamiento supervisado sobre dos corpus: `fsicoli/common_voice_19_0` (Mozilla Common Voice, version 19.0) y `google/fleurs`. La model card no especifica el numero de tokens de audio, la composicion exacta del dataset, ni si se aplicaron tecnicas de RLHF o DPO; es un ajuste supervisado estandar de ASR.

La innovacion tecnica destacable no esta en la arquitectura sino en el pipeline de normalizacion de texto empleado para evaluar y probablemente para entrenar: se aplica NFKC, eliminacion de diacriticos, tatweel y caracteres de ancho cero, mapeo de letras arabes a urdu, unificacion de digitos y eliminacion de puntuacion. Este preprocesamiento es relevante porque el urdu comparte alfabeto con el arabe y presenta variacion ortografica considerable; sin normalizar, las metricas de WER y CER se inflan artificialmente. La model card reporta tanto WER normalizado como raw para dar visibilidad de esa diferencia.

## Capacidades

- Transcripcion de audio a texto en urdu (tarea `transcribe`).
- Traduccion de audio urdu a texto en ingles via la tarea `translate` de Whisper (heredada del modelo base, no validada en la model card).
- Reconocimiento de habla con ventanas de hasta 30 segundos por segmento.
- Procesamiento por lotes mediante el pipeline de `transformers`.
- Soporte de marcas de tiempo a nivel de segmento (funcionalidad estandar de Whisper, no documentada especificamente para este ajuste).
- No dispone de tool calling, function calling, agentes ni razonamiento multi-paso: es un modelo puramente ASR.
- Capacidad multilingue limitada al urdu; el resto de idiomas de Whisper probablemente se degrada tras el ajuste fino, aunque no se documenta.

## Casos de uso

- Transcripcion de reuniones y entrevistas en urdu: el modelo convierte grabaciones de hasta 30 segundos por segmento en texto, adecuado para actas internas donde un WER del 25 % es tolerable con revision humana posterior.
- Subtitulado de contenido audiovisual en urdu: integrado en un pipeline que segmenta el audio en ventanas de 30 segundos, genera subtitulos y permite correccion manual; el coste es bajo porque el modelo corre en GPU consumer.
- Analisis de llamadas de atencion al cliente en pakistani urdu: transcripcion masiva de grabaciones para extraer temas y palabras clave, aceptando la tasa de error y aplicando busqueda difusa sobre el texto resultante.
- Investigacion linguistica y sociolinguistica: generacion de corpus transcritos de habla urdu para estudios de variacion dialectal, con la ventaja de que el modelo es open source y reproducible.
- Prototipado de asistentes de voz en urdu: el modelo sirve como componente ASR en una demo o MVP antes de invertir en un modelo mayor o en datos propios, gracias a su tamano reducido y licencia permisiva.
- Indexacion y busqueda de archivos de audio en urdu: transcripcion de un archivo de podcasts o grabaciones para hacerlas buscables por texto, con un pipeline de ingesta por lotes.
- Evaluacion comparativa de ASR para urdu: sirve como baseline reproducible frente a otros ajustes finos o APIs comerciales, dado que la model card publica WER y CER sobre Common Voice y FLEURS.

## Benchmarks y rendimiento

Resultados publicados en la model card (porcentajes, menor es mejor):

| Dataset | Modelo | Norm WER | Raw WER | Norm CER |
|---|---|---|---|---|
| Common Voice | whisper-small zero-shot | 41,04 | 45,64 | 16,81 |
| Common Voice | Este modelo | 26,22 | 30,76 | 9,64 |
| FLEURS | whisper-small zero-shot | 41,19 | 42,55 | 16,81 |
| FLEURS | Este modelo | 25,00 | 26,79 | 8,99 |

La mejora es sustancial: reduccion de aproximadamente 15 puntos porcentuales en WER normalizado y de unos 7-8 puntos en CER normalizado respecto al modelo base. No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K no aplican a un modelo ASR) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: aproximadamente 1 GB para los pesos (241 M de parametros) mas memoria para activaciones y buffers de audio; en la practica, 2-3 GB son suficientes.
- VRAM estimada en FP16/BF16: en torno a 0,5 GB de pesos; menos de 2 GB totales.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM, incluidas RTX 3060, RTX 4060, RTX 4090, A100 o H100. El modelo es muy ligero y no requiere GPU de datacenter.
- Cabe holgadamente en GPU consumer, incluso en iGPU con suficiente memoria compartida o en CPU para inferencia por lotes pequenos.
- Opciones de despliegue: `transformers` con pipeline `automatic-speech-recognition`, `vLLM` (soporte de Whisper limitado, verificar version), `llama.cpp`/`whisper.cpp` previa conversion a GGUF, y servidores de inferencia tipo TGI o FastAPI envolviendo el pipeline.
- Latencia y throughput: no disponibles en la informacion proporcionada. Por el tamano del modelo, se espera inferencia en tiempo real o mas rapida en GPU consumer, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto de audio | WER norm. (Common Voice urdu) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| abdullah090809/whisper-small-urdu | 241,7 M | 30 s | 26,22 % | Apache 2.0 | Hugging Face |
| openai/whisper-small | 244 M | 30 s | 41,04 % (zero-shot) | Apache 2.0 | Hugging Face |
| openai/whisper-medium | 769 M | 30 s | no disponible para urdu | Apache 2.0 | Hugging Face |
| openai/whisper-large-v3 | 1,55 B | 30 s | no disponible para urdu | Apache 2.0 | Hugging Face |

La comparativa con `whisper-medium` y `whisper-large-v3` no incluye WER en urdu porque no se han publicado resultados en la informacion disponible; en la practica, un modelo mayor sin ajuste fino suele quedar por debajo de un modelo pequeno ajustado en idiomas de bajos recursos, pero esto no esta verificado con datos para este caso. No se conocen otros ajustes finos publicos de Whisper para urdu en la informacion proporcionada.

## Limitaciones y advertencias

- WER normalizado del 25-26 %: aproximadamente una de cada cuatro palabras se transcribe mal; no es adecuado para produccion sin revision humana o sin un modelo de correccion posterior.
- Sesgos desconocidos: la model card no documenta analisis de sesgos por genero, acento, edad o dialecto; el urdu pakistani puede estar sobrerrepresentado frente a otras variantes.
- Riesgo de alucinacion: como todo modelo Whisper, puede generar texto plausible en segmentos con silencio, ruido o audio ininteligible; conviene aplicar deteccion de silencio y umbrales de confianza.
- Limitacion de contexto: ventana fija de 30 segundos por segmento; audios mas largos requieren segmentacion externa y pueden perder coherencia entre segmentos.
- Limitacion de idioma: entrenado solo para urdu; el rendimiento en otros idiomas no esta garantizado y probablemente se degrada respecto al modelo base.
- Dependencia del pipeline de normalizacion: las metricas publicadas asumen una normalizacion concreta (NFKC, eliminacion de diacriticos, mapeo arabe-urdu); sin ese preprocesamiento, el WER real en produccion sera mayor.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantias; el modelo base de OpenAI tambien es Apache 2.0, sin restricciones adicionales conocidas.
- Modelo con 0 descargas y 0 likes en el momento de la ficha: sin validacion de la comunidad, sin issues reportados y sin mantenimiento demostrado.
- La model card menciona el identificador `abdullah090809/whisper-small-urdu-fyp` en el ejemplo de uso, distinto del ID del repo (`whisper-small-urdu`); verificar el nombre correcto antes de cargarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/abdullah090809/whisper-small-urdu
- Modelo base: https://huggingface.co/openai/whisper-small
- Paper de Whisper (Radford et al., 2022): https://arxiv.org/abs/2212.04356
- Repositorio de Whisper en OpenAI: https://github.com/openai/whisper
- Dataset Common Voice 19.0 (fsicoli): https://huggingface.co/datasets/fsicoli/common_voice_19_0
- Dataset FLEURS (Google): https://huggingface.co/datasets/google/fleurs
- Documentacion de pipelines de audio en transformers: https://huggingface.co/docs/transformers/main/en/main_classes/pipelines#transformers.AutomaticSpeechRecognitionPipeline
