# sayanbhowmick/dlp26t3-nppe2-hindi-whisper

## Resumen

`sayanbhowmick/dlp26t3-nppe2-hindi-whisper` es un ajuste fino de `openai/whisper-small` orientado a la restauracion de texto con disfluencias en hindi. El modelo parte del encoder y decoder de Whisper-small y se especializa en transcribir audio en hindi eliminando muletillas, repeticiones y falsos arranques, de modo que la salida sea texto limpio y no una transcripcion literal del habla espontanea.

El autor es `sayanbhowmick` y el modelo se publica bajo el identificador `dlp26t3-nppe2-hindi-whisper`, presumiblemente asociado a un trabajo de curso o proyecto de procesamiento de lenguaje natural. La model card es muy escueta: indica que se congela el encoder, que se usa un prefijo de texto limpio en el decoder y que la inferencia requiere una ventana multiple de codificacion junto con ese mismo prefijo. El WER reportado en validacion local es 0,22205.

Su relevancia es acotada pero concreta: cubre un nicho poco atendido como es la normalizacion de transcripciones en hindi para pipelines de subtitulado, actas o datasets de habla. No obstante, se trata de un modelo de investigacion con cero descargas y sin licencia declarada, por lo que no debe considerarse listo para produccion sin una evaluacion propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper-small), encoder congelado durante el ajuste fino |
| Parametros totales | 241.734.912 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (Whisper-small opera sobre ventanas de 30 s de audio; la model card menciona codificacion multi-ventana) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | hindi (hi) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de `openai/whisper-small`: un transformer encoder-decoder con atencion estandar y representaciones log-Mel como entrada. Segun la model card, durante el ajuste fino se congela el encoder y se entrena el decoder con un prefijo de texto limpio, de forma que el modelo aprende a mapear audio con disfluencias hacia una transcripcion normalizada. La inferencia suministrada por el autor emplea ese mismo prefijo y codificacion multi-ventana, lo que sugiere que el modelo espera fragmentos de audio procesados por ventanas solapadas y concatenados antes de decodificar.

No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF o DPO. Tampoco se detalla el esquema exacto de limpieza aplicado al texto de referencia. El unico dato de rendimiento aportado es el WER de 0,22205 sobre una validacion local con limpieza mixta, sin especificar el conjunto de evaluacion ni el protocolo.

## Capacidades

- Transcripcion de audio en hindi con normalizacion de disfluencias: elimina muletillas, repeticiones y falsos arranques para producir texto limpio.
- Reconocimiento de voz mono-idioma en hindi; no se declaran capacidades multilingues.
- Decodificacion condicionada por prefijo de texto limpio, segun la model card.
- Codificacion multi-ventana para audio de duracion superior a una ventana individual.
- No se documenta soporte de tool calling, function calling ni razonamiento multi-paso.
- No se documenta modo thinking, vision ni audio mas alla de la transcripcion.
- No se documenta traduccion ni deteccion de idioma.

## Casos de uso

- Subtitulado de video en hindi: el modelo puede transcribir entrevistas o videos y entregar subtitulos sin muletillas, reduciendo el trabajo de post-edicion manual.
- Actas y notas de reunion: sobre grabaciones de habla espontanea en hindi, la salida normalizada es mas adecuada para alimentar resumenes automaticos o sistemas de busqueda.
- Limpieza de datasets de habla: util para generar transcripciones de referencia limpias a partir de corpus con disfluencias, que luego sirvan para entrenar otros sistemas ASR.
- Preprocesado para TTS: convertir audio espontaneo en texto limpio que sirva como entrada para sintesis de voz o para alineacion forzada.
- Investigacion en normalizacion de disfluencias: como punto de partida o baseline para experimentos de restauracion de texto en hindi.
- Transcripcion asistida en entornos de baja latencia: al derivar de Whisper-small, el coste computacional es moderado y puede ejecutarse en GPU de gama media para prototipos.

## Benchmarks y rendimiento

| Metrica | Valor | Conjunto |
|---|---|---|
| WER | 0,22205 | Validacion local con limpieza mixta (protocolo no detallado) |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K ni otros) en la informacion disponible. El unico dato es el WER local indicado en la model card, sin comparacion con otros modelos ni desglose por condiciones.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 1 GB para los 241,7 M de parametros, mas el coste de activaciones y buffers de audio.
- VRAM estimada en fp16/bf16: en torno a 0,5 GB de pesos, con margen adicional para activaciones.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM; una RTX 3060, RTX 4090, A100 o H100 son mas que suficientes. El cuello de botella sera el preprocesado de audio, no la memoria.
- Cabe holgadamente en GPU de consumo, incluidas GTX 1650, RTX 3050 y superiores.
- Opciones de despliegue: transformers con PyTorch, y en principio conversion a otros runtimes (ONNX, CTranslate2) aunque no se documenta. No se confirma soporte directo en vLLM, llama.cpp, Ollama ni TGI, dado que es un modelo de audio y no de texto.
- Latencia y throughput: no disponibles. Al derivar de Whisper-small, se espera un rendimiento del orden de decenas de veces tiempo real en GPU moderna, pero no hay mediciones publicadas para este ajuste.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| sayanbhowmick/dlp26t3-nppe2-hindi-whisper | 241,7 M | ventana de audio de 30 s (multi-ventana) | hindi | no disponible | Hugging Face, 0 descargas |
| openai/whisper-small | 244 M | ventana de audio de 30 s | multilingue (99 idiomas) | MIT (modelo base) | Hugging Face, ampliamente usado |
| openai/whisper-base | 74 M | ventana de audio de 30 s | multilingue | MIT | Hugging Face |
| Modelos ASR especificos para hindi (por ejemplo, ajustes de Whisper-small o IndicWhisper) | variable | variable | hindi | variable | Hugging Face |

La comparativa directa con alternativas especificas para hindi no esta disponible en la informacion proporcionada. Frente a Whisper-small original, este ajuste anade normalizacion de disfluencias pero pierde cobertura multilingue y no declara licencia.

## Limitaciones y advertencias

- Licencia no declarada: no hay autorizacion explicita para uso comercial; debe contactarse con el autor antes de cualquier despliegue productivo.
- Modelo de investigacion con cero descargas y cero likes: sin validacion externa ni senales de mantenimiento.
- El unico dato de rendimiento es un WER de 0,22205 sobre una validacion local no detallada; no es comparable con resultados publicos de otros sistemas.
- El encoder esta congelado, lo que limita la adaptacion acustica a dominios muy distintos del corpus de ajuste.
- Soporte exclusivo de hindi: no se debe asumir buen rendimiento en otras lenguas ni en code-switching hindi-ingles.
- La inferencia requiere el prefijo de texto limpio y la codificacion multi-ventana documentados por el autor; usarlo con el pipeline estandar de Whisper sin ese protocolo puede degradar la salida.
- Riesgo de alucinacion y de omision de contenido al normalizar: la eliminacion de disfluencias puede borrar palabras informativas o alterar el sentido en habla con reparaciones.
- No se documentan sesgos demograficos, acentos ni variedades dialectales cubiertas.
- La fecha de creacion indicada (2026-11-28) es futura respecto a la informacion habitual de publicaciones; conviene verificar la procedencia del repositorio.

## Enlaces

- Hugging Face: https://huggingface.co/sayanbhowmick/dlp26t3-nppe2-hindi-whisper
- Modelo base: https://huggingface.co/openai/whisper-small
- Paper de Whisper (Radford et al., 2022): https://arxiv.org/abs/2212.04356
- Repositorio oficial de Whisper: https://github.com/openai/whisper
