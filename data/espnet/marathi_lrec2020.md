# espnet/marathi_lrec2020

## Resumen
El modelo `espnet/marathi_lrec2020` es un sistema de reconocimiento automático del habla (ASR) para marathi, una lengua indoaria hablada principalmente en el estado indio de Maharashtra y con más de 80 millones de hablantes. Lo desarrolla Aniket Tathe dentro del ecosistema ESPnet, la toolkit de código abierto mantenida por la comunidad ESPnet para procesamiento de voz de extremo a extremo. El modelo se publica como un checkpoint listo para inferencia con la librería `espnet2`, lo que permite transcribir audio a texto con unas pocas líneas de Python.

La relevancia del modelo radica en su carácter de recurso para una lengua de bajos recursos: el corpus de entrenamiento es el `marathi_lrec2020`, un conjunto de habla leída con micromecenazgo descrito por Abraham et al. (LREC 2020), y el modelo se distribuye con licencia CC-BY-4.0, lo que facilita su reutilización tanto académica como comercial. No es un modelo de lenguaje generativo ni un LLM: es un modelo acústico ASR de tipo Conformer con decodificación híbrida CTC/atención, acompañado de un modelo de lenguaje de caracteres.

Arquitectónicamente es compacto: un encoder Conformer de 3 bloques y 256 dimensiones, un decoder Transformer de 3 bloques y un LM LSTM de caracteres de 4 capas con 650 unidades. El repositorio ocupa unos 0,2 GB y el modelo reporta un WER de 24,9 % en test con LM y 28,5 % sin LM, sobre una partición aleatoria propia del recipe (no oficial), lo que condiciona la comparabilidad de los resultados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Conformer (encoder de 3 bloques, 256-dim) + decoder Transformer de 3 bloques; hibrido CTC/atencion |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (utterances de entrenamiento de hasta 12 s) |
| Tipos de cuantizacion | no disponible (checkpoint PyTorch `.pth` en fp32) |
| Idiomas soportados | marathi (`mr`) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | PyTorch `.pth` (checkpoint ESPnet2); no se distribuye GGUF ni safetensors |

## Arquitectura y entrenamiento
El modelo sigue la receta `egs2/marathi_lrec2020/asr1` de ESPnet. El encoder es un Conformer de 3 bloques con dimensión 256, y el decoder es un Transformer de 3 bloques; la decodificación es híbrida CTC/atención con `ctc_weight: 0.3` en entrenamiento y `0.5` en decodificación. Se aplicó label smoothing de 0,1, optimizador Adam con `lr: 0.0005` y 5000 pasos de warmup, SpecAugment, perturbación de velocidad 0.9/1.0/1.1 y utterances de hasta 12 s. El checkpoint publicado es la media de los 10 mejores epochs por precisión de validación (epochs 21 a 30 de 30).

El modelo de lenguaje auxiliar es un LSTM de caracteres de 4 capas, 650 unidades, embeddings atados y dropout 0.3, entrenado sobre las 73.893 transcripciones de entrenamiento. Los datos provienen del corpus `marathi_lrec2020` (habla leída con micromecenazgo, grabaciones originales a 8 kHz que la receta remuestrea a 16 kHz), con una partición aleatoria 80/10/10 por ID de frase generada por el recipe; no es una partición oficial y los 31 hablantes aparecen en los tres conjuntos, por lo que los resultados no son comparables con trabajos previos. La decodificación usa beam 20, `ctc_weight: 0.5` y `lm_weight: 0.3`.

## Capacidades
- Reconocimiento automático del habla en marathi a partir de audio mono a 16 kHz.
- Transcripción a nivel de carácter con modelo de lenguaje de caracteres integrado.
- Decodificación híbrida CTC/atención con beam search configurable.
- Funcionamiento sin LM (`lm_weight=0.0`) para escenarios con restricciones de memoria o latencia.
- No soporta tool calling, function calling, agentes, visión, audio generativo ni razonamiento multi-paso: es un modelo ASR puro.
- Monolingüe: únicamente marathi.

## Casos de uso
- Transcripción de audio para subtitulado en marathi: el modelo convierte grabaciones de habla leída en texto con un WER de referencia del 24,9 % en test, adecuado para generar subtítulos preliminares que luego se revisan manualmente.
- Digitalización de archivos orales: permite indexar y buscar por texto en colecciones de audio en marathi, usando la transcripción como capa de búsqueda.
- Asistentes de voz para marathi: integrado en un pipeline de ASR + NLU, sirve como primer eslabón para comandos de voz en aplicaciones de dominio acotado.
- Herramientas de accesibilidad: transcripción en tiempo casi real de clases o reuniones en marathi para personas con discapacidad auditiva, asumiendo la latencia del beam search.
- Investigación en lenguas de bajos recursos: punto de partida reproducible para fine-tuning con datos propios, gracias a la receta ESPnet publicada y a la licencia permisiva.
- Anotación asistida de corpus: pretranscripción automática de nuevos audios en marathi para acelerar el etiquetado humano en proyectos de datos.
- Evaluación comparativa de ASR en lenguas indoarias: referencia con métricas WER/CER publicadas y checkpoint accesible.

## Benchmarks y rendimiento
Resultados reportados en la model card sobre la partición de test del recipe (9.301 frases, 63.548 palabras; partición aleatoria no oficial):

| Metrica | Con LM | Sin LM |
|---|---|---|
| WER test | 24,9 % | 28,5 % |
| CER test | 10,6 % | 11,1 % |
| S.Err test | 76,3 % | 81,5 % |

Resultados en dev (9.277 frases, 66.369 palabras):

| Metrica | Con LM | Sin LM |
|---|---|---|
| WER dev | 22,5 % | 25,7 % |
| CER dev | 9,7 % | 10,3 % |

No se han publicado comparaciones con otros modelos ASR en marathi en la información disponible. El S.Err elevado (76,3 %) indica que una gran proporción de frases contiene al menos un error, un dato relevante para producción.

## Requisitos de hardware
- VRAM estimada: no disponible con precisión; por el tamaño del repo (0,2 GB) y la arquitectura compacta (encoder de 3 bloques, 256-dim), la inferencia cabe holgadamente en GPUs de consumo.
- GPU recomendadas: cualquier GPU con al menos 4-8 GB de VRAM es suficiente; una RTX 3060, RTX 4090 o T4 cubren el caso sin problemas. Para lotes grandes, A100 o H100 aportan throughput, no necesidad de memoria.
- Cabe en GPU de consumo: sí, en la práctica totalidad de modelos actuales.
- Opciones de despliegue: `espnet2.bin.asr_inference.Speech2Text` (vía Python), receta `run.sh` de ESPnet y servicio HTTP de ESPnet. No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI, al no ser un modelo de lenguaje.
- Latencia y throughput: no disponibles en la información proporcionada; dependen del beam size (20 por defecto) y de si se usa LM.

## Comparativa con modelos similares
No se dispone en la información proporcionada de resultados de otros modelos ASR en marathi (por ejemplo, variantes de Whisper o MMS) sobre esta misma partición, por lo que la comparación numérica no es posible. A nivel cualitativo:

| Modelo | Tipo | Idiomas | Licencia | Contexto/audio | Disponibilidad |
|---|---|---|---|---|---|
| espnet/marathi_lrec2020 | Conformer CTC/atención + LM de caracteres | marathi | CC-BY-4.0 | utterances cortas (entrenado hasta 12 s) | Hugging Face, ecosistema ESPnet |
| Whisper (OpenAI) | Transformer encoder-decoder | multilingüe (incluye marathi) | MIT | audio de hasta 30 s | Hugging Face, múltiples runtimes |
| MMS (Meta) | wav2vec2 / CTC | multilingüe | CC-BY-NC | audio variable | Hugging Face |

La comparación de rendimiento entre estos modelos en marathi no está disponible en la información consultada y requeriría una evaluación propia sobre la misma partición.

## Limitaciones y advertencias
- La partición train/dev/test es aleatoria por frase y no oficial: los 31 hablantes aparecen en los tres conjuntos, de modo que los WER publicados no son comparables con trabajos previos ni con particiones estándar.
- S.Err del 76,3 % en test: la mayoría de frases contienen al menos un error, lo que limita su uso directo en producción sin revisión humana.
- Entrenado sobre habla leída con micromecenazgo y remuestreada de 8 kHz a 16 kHz; el rendimiento puede degradarse con habla espontánea, ruido ambiental, acentos no representados o audio de mayor calidad.
- Monolingüe (solo marathi); no realiza detección de idioma ni traducción.
- Riesgo de alucinación y errores de sustitución en nombres propios, números y terminología técnica, habitual en ASR de bajos recursos.
- Sesgos potenciales derivados del corpus: 31 hablantes, condiciones de grabación concretas y sesgo demográfico de la recolección por micromecenazgo.
- Licencia CC-BY-4.0: permite uso comercial con atribución; es necesario citar a los autores del modelo y del corpus (Abraham et al., LREC 2020).
- Dependencia de la versión de ESPnet y del commit del PR #6939 para reproducir el entrenamiento; la API puede cambiar entre versiones.
- Sin soporte de cuantización documentada ni formatos de despliegue ligeros (GGUF); el despliegue requiere el stack Python de ESPnet.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/espnet/marathi_lrec2020
- Revisión anterior del checkpoint: https://huggingface.co/espnet/marathi_lrec2020/tree/c5268ee31f668dfbd76bc2d3552efcf3159faee5
- Repositorio ESPnet: https://github.com/espnet/espnet/
- Pull request del recipe: https://github.com/espnet/espnet/pull/6939
- Instrucciones de instalación de ESPnet: https://espnet.github.io/espnet/installation.html
- Página de IndicCorpora (IIT Bombay): https://www.cse.iitb.ac.in/~pjyothi/indiccorpora/#marathi
- Paper del corpus (Abraham et al., LREC 2020): https://aclanthology.org/2020.lrec-1.343
- Perfil del autor: https://github.com/Aniket-Tathe
