# Erog0291/stew-audio-0.1-asr-ha

## Resumen

`Erog0291/stew-audio-0.1-asr-ha` es un modelo de reconocimiento automatico del habla (ASR) publicado en HuggingFace por el usuario Erog0291 el 25 de octubre de 2026 y actualizado al dia siguiente. El repositorio pesa 2,4 GB y contiene pesos en `safetensors` y exportaciones `onnx`, y el unico tag de familia de modelo presente es `whisper`, lo que situa el modelo en la estirpe de sistemas ASR encoder-decoder de OpenAI.

El recuento real de parametros obtenido del fichero `safetensors` es de 241.734.912 (unos 242 M), una cifra practicamente identica a la de Whisper small (244 M). Todo apunta, por tanto, a un ajuste fino o derivado de Whisper small, aunque el autor no lo declara explicitamente en la informacion disponible. El sufijo `-ha` del identificador podria sugerir un ajuste orientado a hausa u otra lengua con ese codigo, pero se trata de una hipotesis sin confirmar.

La relevancia practica del modelo es la habitual en esta clase de tamano: ASR desplegable en CPU y en GPUs de consumo, con latencias compatibles con transcripcion por lotes y con integracion en pipelines ONNX Runtime. La ausencia de model card, licencia declarada, idiomas y resultados de evaluacion limita seriamente su uso en produccion sin una validacion previa por parte del equipo adoptante.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible de forma explicita; el tag de familia es `whisper` (encoder-decoder transformer para ASR) |
| Parametros totales | 241.734.912 (242 M) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible; en arquitecturas Whisper la entrada tipica es una ventana de 30 s de audio |
| Tipos de cuantizacion | No documentados; el repo incluye `onnx`, lo que permite cuantizacion int8 mediante ONNX Runtime, pero no se publican variantes cuantizadas |
| Idiomas soportados | No disponibles |
| Licencia | No disponible |
| Formato de pesos | `safetensors` y `onnx` |
| Tamano del repositorio | 2,4 GB |
| Descargas / likes | 44 / 0 |
| Fecha de publicacion | 2026-10-25 (actualizado 2026-10-26) |

## Arquitectura y entrenamiento

La informacion publicada no incluye model card ni descripcion tecnica. Los unicos indicios son el tag `whisper`, el tamano de parametros (242 M, coherente con Whisper small) y la presencia de exportaciones ONNX junto a los pesos en safetensors. Si se confirma la hipotesis Whisper, la arquitectura seria un transformer encoder-decoder con espectrograma log-Mel como entrada, atencion completa en el encoder y atencion causal con cache en el decoder, y decodificacion autorregresiva de tokens de texto (incluidos tokens especiales de idioma, timestamps y tareas).

No se dispone de datos sobre volumen de tokens de audio, composicion del corpus de entrenamiento, idioma o dominios cubiertos, ni sobre si hubo ajuste fino supervisado, destilacion o alguna etapa de alineacion. Tampoco se documentan innovaciones tecnicas adicionales (decodificacion especulativa, atencion linear, chunking de audio largo). Cualquier afirmacion en ese sentido seria especulativa.

## Capacidades

- Transcripcion de voz a texto: capacidad esperada y principal del modelo, derivada de su pertenencia a la familia Whisper.
- Deteccion de idioma y transcripcion multilingue: tecnicamente posible en Whisper, pero no confirmada para este ajuste concreto.
- Segmentacion con timestamps: Whisper emite tokens de marca temporal; no se ha verificado que este ajuste los preserve.
- Traduccion de voz a texto en ingles: capacidad nativa de Whisper, no confirmada aqui.
- Ejecucion en CPU y en entornos sin GPU: viable por tamano y por disponer de exportacion ONNX.
- Integracion en pipelines de inferencia ONNX Runtime / Transformers: la presencia de ambos formatos lo facilita.
- Tool calling, function calling, agentes y razonamiento multi-paso: no aplica, es un modelo ASR.
- Vision, audio-input multimodal o modo "thinking": no disponible.

## Casos de uso

- Transcripcion por lotes de reuniones y entrevistas: con 242 M de parametros el modelo puede procesar horas de audio segmentado en ventanas de 30 s sobre CPU, lo que abarata el coste frente a modelos de mayor tamano cuando no se requiere maxima precision.
- Subtitulado automatico de video: la familia Whisper produce marcas temporales que permiten generar ficheros SRT; conviene validar en este ajuste concreto que la salida de timestamps sea correcta antes de integrarlo.
- Actas y notas de voz en aplicaciones internas: el modelo cabe en una GPU de consumo o incluso en CPU, por lo que puede desplegarse on-premise sin enviar audio a terceros, requisito habitual en entornos con datos sensibles.
- Transcripcion en dispositivos edge o embebidos: la exportacion ONNX permite ejecutar con ONNX Runtime en equipos modestos, útil para kioscos, grabadoras o aplicaciones de escritorio.
- Preprocesado de datos para entrenamiento de otros modelos: transcripcion masiva de corpus de audio para generar pares audio-texto o para anotacion asistida.
- Accesibilidad: generacion de transcripciones en tiempo casi real para personas con discapacidad auditiva en videollamadas o aulas, siempre que se valide la latencia real del despliegue elegido.
- Busqueda sobre archivos de audio: indexacion de transcripciones para recuperacion de informacion en archivos de podcasts, llamadas o clases grabadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

No constan evaluaciones en WER sobre LibriSpeech, Common Voice, FLEURS ni otros conjuntos, ni comparaciones con Whisper small original. El autor no incluye model card ni tabla de resultados, y las 44 descargas y 0 likes no permiten inferir validacion por parte de la comunidad.

## Requisitos de hardware

- Peso de los pesos: aproximadamente 967 MB en fp32, 483 MB en fp16, 242 MB en int8 y 121 MB en int4 (calculado a partir de 241,7 M de parametros).
- VRAM estimada para inferencia: en torno a 1-1,5 GB en fp16 incluyendo cache de activaciones y KV; aproximadamente 0,6-0,9 GB en int8. Cifras orientativas, no medidas sobre este checkpoint.
- GPUs recomendadas: cualquier GPU con 2 GB o mas de VRAM es suficiente; una RTX 3060, RTX 4060 o RTX 4090 queda muy sobredimensionada y permitira lotes grandes y mayor throughput. En centro de datos, una A100 o H100 solo tiene sentido para servir muchos flujos concurrentes en paralelo.
- GPU de consumo: si, cabe holgadamente en GTX 1650, RTX 3050, RTX 4060 y superiores. Tambien es viable en CPU (x86 con AVX2, o ARM) para transcripcion no interactiva.
- Opciones de despliegue: Transformers con PyTorch, ONNX Runtime (formato ya incluido en el repo), `optimum`/`optimum-onnx`, y potencialmente faster-whisper o whisper.cpp si se convierte a sus formatos. vLLM y TGI no estan orientados a ASR encoder-decoder de este tipo y no son la via recomendada.
- Latencia y throughput: no disponibles. Para un modelo de esta clase de tamano, la latencia depende fuertemente del backend y del hardware; conviene medirla en el entorno objetivo antes de comprometer SLA.

## Comparativa con modelos similares

Los datos de las alternativas corresponden a especificaciones publicas ampliamente conocidas; los de este modelo, a la informacion del repositorio. La relacion exacta con Whisper small no esta confirmada por el autor.

| Modelo | Parametros | Contexto de audio | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Erog0291/stew-audio-0.1-asr-ha | 242 M | No disponible (ventana Whisper esperada: 30 s) | No disponible | No disponible | safetensors, ONNX |
| Whisper small (OpenAI) | 244 M | 30 s por segmento | Multilingue (~99 idiomas) | MIT | PyTorch, conversiones a ONNX/GGUF |
| Whisper base (OpenAI) | 74 M | 30 s por segmento | Multilingue | MIT | PyTorch y derivados |
| Whisper medium (OpenAI) | 769 M | 30 s por segmento | Multilingue | MIT | PyTorch y derivados |
| distil-whisper small.en | ~166 M | 30 s por segmento | Solo ingles | MIT | PyTorch y derivados |

La ventaja competitiva de este checkpoint frente a Whisper small original seria, en su caso, una mejora en el dominio o idioma de ajuste, que no puede verificarse sin evaluacion. Su desventaja inmediata frente a las alternativas de OpenAI es la falta de licencia declarada y de resultados publicados, lo que complica la adopcion en entornos corporativos.

## Limitaciones y advertencias

- Ausencia total de model card: no se documentan datos de entrenamiento, idioma, dominio ni proceso de ajuste, lo que impide evaluar su idoneidad a priori.
- Licencia no disponible: no puede asumirse uso comercial. En ausencia de licencia explicita, el regimen legal por defecto es restrictivo; es necesario contactar con el autor antes de cualquier despliegue productivo.
- Idiomas no declarados: no se puede confirmar que cubra castellano ni ningun otro idioma concreto. El sufijo `-ha` podria indicar un ajuste especifico de una sola lengua, con posible degradacion en el resto.
- Riesgo de alucinacion: los modelos tipo Whisper pueden generar texto plausible en segmentos con silencio, ruido o musica, y pueden entrar en bucles de repeticion. Este riesgo es mayor en ajustes finos sin evaluacion publicada.
- Sin benchmarks: no hay evidencia de WER ni de robustez ante acentos, ruido de fondo, solapamiento de hablantes o audio telefónico.
- Ventana de audio limitada: si se confirma la arquitectura Whisper, el modelo procesa segmentos de 30 s y requiere segmentacion externa (VAD) para audio largo, con riesgo de cortes en palabras.
- Trazabilidad y mantenimiento: repositorio con 0 likes y 44 descargas, publicado por un autor individual, sin historial de versiones documentado.
- Sesgos: no evaluados. Los sesgos habituales de ASR (rendimiento inferior en determinados acentos, variedades dialectales y habla no nativa) deben asumirse presentes hasta que se demuestre lo contrario.
- Los resultados de busqueda web realizados no contienen informacion relacionada con este modelo; no se ha localizado paper, blog ni demo asociados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Erog0291/stew-audio-0.1-asr-ha
- Repositorio de referencia de la familia Whisper (OpenAI): https://github.com/openai/whisper
- Pesos originales de Whisper en HuggingFace: https://huggingface.co/openai/whisper-small
- Documentacion de Whisper en Transformers: https://huggingface.co/docs/transformers/model_doc/whisper
- Paper de Whisper (Radford et al., 2022): https://arxiv.org/abs/2212.04356
- ONNX Runtime: https://onnxruntime.ai/
- No se han encontrado papers, blogs, demos ni repositorios adicionales especificos de este modelo en la busqueda web realizada.
