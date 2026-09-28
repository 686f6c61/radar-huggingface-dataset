# dataangel/whisper-large-v3-turbo-openai

## Resumen

Este repositorio es un espejo sin modificaciones del checkpoint original de OpenAI `large-v3-turbo.pt`, el fichero en formato nativo que carga el paquete `openai-whisper` mediante `whisper.load_model(path)`. Lo publica el usuario dataangel porque el repositorio oficial `openai/whisper-large-v3-turbo` solo distribuye la conversion a Transformers, y las recetas de voz de LLooM necesitan el fichero `.pt` original. El checkpoint pesa 1.617.941.637 bytes y su SHA-256 es `aff26ae408abcba5fbf8813c21e62b0941638c5f6eebfb145be0c9839262a19a`, el mismo que `openai-whisper` 20250625 incorpora en su URL de descarga y verifica al cargar.

Whisper es un modelo de reconocimiento automatico del habla (ASR) y traduccion de voz basado en una arquitectura transformer encoder-decoder, entrenado con mas de 5 millones de horas de datos etiquetados de forma debil. La variante `large-v3-turbo` es una version ajustada de un Whisper large-v3 podado: mantiene la misma estructura salvo que el numero de capas del decodificador se reduce de 32 a 4, lo que se traduce en una velocidad de transcripcion muy superior con una degradacion minima de la precision.

Su relevancia practica es de infraestructura mas que de investigacion: no introduce ninguna innovacion de modelado, sino que garantiza la disponibilidad del artefacto exacto que esperan las herramientas construidas sobre `openai-whisper`, con verificacion de integridad incluida. Para quien despliega ASR multilingue en produccion, este fichero evita depender de conversiones intermedias de formato.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (seq2seq) tipo Whisper; variante turbo con decodificador podado de 32 a 4 capas respecto a large-v3 |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada; la familia Whisper procesa el audio en ventanas de 30 segundos |
| Tipos de cuantizacion | El repositorio publica el checkpoint original sin cuantizar (FP16). Existen cuantizaciones y conversiones externas, como la w8a16 de Qualcomm citada en los resultados de busqueda |
| Idiomas soportados | multilingue; numero concreto no disponible en la informacion proporcionada |
| Licencia | MIT |
| Formato de pesos | PyTorch `.pt` (checkpoint nativo de `openai-whisper`), 1.617.941.637 bytes |

## Arquitectura y entrenamiento

Whisper sigue el esquema clasico encoder-decoder: el encoder consume el espectrograma log-Mel del audio y el decoder genera la secuencia de tokens de texto de forma autorregresiva, con tokens especiales que controlan la tarea (transcripcion o traduccion al ingles), el idioma y las marcas de tiempo. El checkpoint de este repositorio es la variante turbo, descrita por OpenAI como una version optimizada de large-v3 en la que el decodificador pasa de 32 a 4 capas; el resto del modelo se mantiene, de modo que el coste de decodificacion cae drasticamente mientras la calidad se degrada de forma minima.

El entrenamiento original se describe en el articulo "Robust Speech Recognition via Large-Scale Weak Supervision" (Radford et al., OpenAI), con mas de 5 millones de horas de audio etiquetado de forma supervisada debil, lo que le permite generalizar en zero-shot a dominios y conjuntos de datos no vistos. No se ha aplicado RLHF ni DPO: es un modelo puramente supervisado de secuencia a secuencia. Este repositorio, en concreto, no aporta ningun reentrenamiento ni ajuste fino; es una copia byte a byte del fichero publicado por OpenAI, con la unica funcion de servir el formato que `openai-whisper` espera.

## Capacidades

- Transcripcion automatica de voz a texto en multiples idiomas, con deteccion automatica del idioma de entrada.
- Traduccion de voz a texto en ingles (tarea `translate` de Whisper) para audio en otros idiomas.
- Marcas de tiempo a nivel de segmento y, segun la decodificacion, a nivel de palabra cuando se combina con herramientas externas de alineamiento.
- Manejo de audio de larga duracion mediante troceado en ventanas de 30 segundos con decodificacion por lotes y solapamiento.
- Robustez en zero-shot frente a acentos, ruido de fondo y vocabulario tecnico no visto durante el entrenamiento.
- Decodificacion configurable: temperatura, `beam search`, `best_of` y retorno por fallback ante baja confianza.
- No dispone de tool calling ni function calling nativos.
- No implementa razonamiento multi-paso ni comportamiento de agente: es un modelo de secuencia a secuencia puro.
- No tiene capacidades de vision, audio generativo ni sintesis de voz; unicamente consume audio y produce texto.

## Casos de uso

- Servicio de transcripcion multilingue: se carga el checkpoint con `whisper.load_model()` y se procesan audios largos troceados en ventanas, aprovechando la decodificacion rapida del decodificador de 4 capas para abaratar el coste por hora de audio.
- Generacion de subtitulos: las marcas de tiempo por segmento permiten emitir ficheros SRT o VTT directamente, con deteccion automatica del idioma para contenido audiovisual internacional.
- Actas de reuniones: transcripcion de audio de reuniones de larga duracion por troceado, con la salida enviada despues a un LLM para resumen; el modelo actua solo como capa de ASR.
- Analitica de centros de contacto: transcripcion masiva de llamadas para alimentar buscadores internos o sistemas de control de calidad, donde el coste computacional por minuto es el factor determinante.
- Indexacion y busqueda de podcasts y archivos de video: transcripcion de catalogos completos para construir indices de texto sobre los que hacer busqueda semantica.
- Subtitulado y doblaje asistido: la tarea de traduccion al ingles permite obtener la transcripcion en ingles de audio en otros idiomas antes de una traduccion posterior a un tercer idioma.
- Interfaces de voz para LLM: uso como front-end de reconocimiento de voz en un pipeline donde el texto se pasa despues a un modelo de lenguaje que si gestiona herramientas y agentes.
- Despliegue en el borde con cuantizacion: mediante variantes cuantizadas o conversiones a formatos ligeros, puede ejecutarse en dispositivos con recursos limitados, como los perfiles de Qualcomm AI Hub citados en la busqueda.
- Diarizacion de hablantes: el modelo no separa voces por si mismo, pero su salida con marcas de tiempo se combina con herramientas externas de segmentacion de hablantes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Los resultados de busqueda unicamente indican, de forma cualitativa, que la variante turbo ofrece una velocidad de transcripcion notablemente mayor que large-v3 con una degradacion minima de la precision, y que el rendimiento de Whisper varia ampliamente segun el idioma. No se dispone de cifras concretas de WER, MMLU ni de ninguna otra metrica en el material proporcionado.

| Aspecto | Dato disponible |
|---|---|
| WER por idioma | no disponible |
| Comparativa cuantitativa con large-v3 | no disponible; solo la afirmacion cualitativa de OpenAI de mayor velocidad y degradacion minima |
| Comparativa con otras variantes (medium, small) | no disponible |
| Variacion de capas del decodificador | 32 capas en large-v3 frente a 4 capas en turbo |

## Requisitos de hardware

- El checkpoint en FP16 ocupa 1,62 GB, por lo que los pesos requieren del orden de 1,7 GB de memoria; con activaciones, cache de decodificacion y lotes pequenos, el uso practico se situa en torno a 2-4 GB de VRAM (estimacion a partir del tamano del fichero, no confirmada en la informacion proporcionada).
- Cabe holgadamente en GPUs de consumo: RTX 3060 12 GB, RTX 4060, RTX 4070, RTX 4090, e incluso en GPUs con 4-6 GB de VRAM si se usa cuantizacion.
- Funciona tambien en CPU mediante `openai-whisper` y `whisper.cpp`, con latencias mucho mayores y throughput limitado por el numero de nucleos.
- Para despliegue a gran escala con muchas peticiones concurrentes son adecuadas A100, H100 o L40S, siempre que la libreria elegida soporte lotes grandes y procesamiento por ventanas.
- Opciones de despliegue: `openai-whisper` (formato nativo de este repositorio), `faster-whisper` sobre CTranslate2, `whisper.cpp` con conversion a GGML, `WhisperX` para alineamiento temporal, y servidores de inferencia con soporte de encoder-decoder como vLLM o TGI, previa conversion del checkpoint al formato que espere cada herramienta. La conversion a Transformers esta disponible en el repositorio `openai/whisper-large-v3-turbo`.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Arquitectura | Capas del decodificador | Formato publicado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| dataangel/whisper-large-v3-turbo-openai (este repo) | Transformer encoder-decoder (Whisper turbo) | 4 | PyTorch `.pt` nativo de `openai-whisper` | MIT | Espejo de un fichero de OpenAI, 0 descargas y 0 likes en el momento de la consulta |
| openai/whisper-large-v3-turbo | Transformer encoder-decoder (Whisper turbo) | 4 | Conversion a Transformers | MIT | Repositorio oficial en HuggingFace |
| openai/whisper-large-v3 | Transformer encoder-decoder (Whisper) | 32 | Conversion a Transformers y checkpoint `.pt` | MIT | Repositorio oficial en HuggingFace |
| qualcomm/Whisper-Large-V3-Turbo | Transformer encoder-decoder, version para AI Hub | 4 | Formatos optimizados para dispositivos Qualcomm | no disponible | Repositorio y perfil en Qualcomm AI Hub |

No se dispone de datos de parametros, contexto o rendimiento comparado para el resto de alternativas en la informacion proporcionada, por lo que la comparacion se limita a los aspectos estructurales y de distribucion.

## Limitaciones y advertencias

- Riesgo de alucinacion conocido en la familia Whisper: ante silencios, musica o ruido no vocal, el decoder puede generar texto plausible que no corresponde a ninguna voz. Requiere filtrado de voz previo y umbrales de confianza.
- El rendimiento varia ampliamente segun el idioma, segun indica la propia documentacion de OpenAI citada en los resultados de busqueda; no se debe asumir una calidad homogenea en todos los idiomas.
- El procesamiento por ventanas de 30 segundos puede cortar palabras en las fronteras de los bloques; en audio largo es necesario aplicar solapamiento y reconciliacion de segmentos.
- No realiza diarizacion de hablantes ni identificacion de quien habla; para eso hace falta un modelo externo.
- No soporta tool calling, function calling ni razonamiento multi-paso, por lo que no es adecuado como componente de un agente autonomo sin una capa adicional.
- Este repositorio concreto es un espejo de terceros con 0 descargas y 0 likes: antes de usarlo en produccion conviene verificar el SHA-256 declarado (`aff26ae408abcba5fbf8813c21e62b0941638c5f6eebfb145be0c9839262a19a`) y, en la medida de lo posible, depender del artefacto original de OpenAI.
- Es un fichero de 1,62 GB en un unico objeto: no hay versionado por revisiones ni garantia de permanencia del repositorio.
- Licencia MIT para los pesos segun OpenAI, pero conviene revisar la model card oficial de Whisper para conocer las condiciones de uso y las recomendaciones sobre despliegues sensibles (por ejemplo, decisiones que afecten a personas).
- No se dispone de informacion sobre limites de contexto mas alla de la ventana de audio, ni sobre sesgos medidos, en la documentacion proporcionada.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/dataangel/whisper-large-v3-turbo-openai
- Checkpoint original de OpenAI: https://openaipublic.azureedge.net/main/whisper/models/aff26ae408abcba5fbf8813c21e62b0941638c5f6eebfb145be0c9839262a19a/large-v3-turbo.pt
- Repositorio de codigo de Whisper: https://github.com/openai/whisper
- Licencia de Whisper: https://github.com/openai/whisper/blob/main/LICENSE
- Model card oficial de Whisper: https://github.com/openai/whisper/blob/main/model-card.md
- Conversion a Transformers del modelo turbo: https://huggingface.co/openai/whisper-large-v3-turbo
- Articulo de referencia: Robust Speech Recognition via Large-Scale Weak Supervision (Radford et al., OpenAI), https://arxiv.org/abs/2212.04356
- Whisper-Large-V3-Turbo en Qualcomm AI Hub: https://aihub.qualcomm.com/models/whisper_large_v3_turbo
- Version cuantizada w8a16 en Qualcomm AI Hub: https://aihub.qualcomm.com/compute/models/whisper_large_v3_turbo_quantized
- Repositorio de Qualcomm en HuggingFace: https://huggingface.co/qualcomm/Whisper-Large-V3-Turbo
- Espejo comunitario en GitHub: https://github.com/yrsgsda/whisper-large-v3-turbo
