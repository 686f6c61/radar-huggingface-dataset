# chienhsinlin/helioslm-asr-tw-v6m

## Resumen

HeliosLM ASR TW v6m es un modelo de reconocimiento automatico del habla (ASR) desarrollado por chienhsinlin, obtenido mediante fine-tuning de openai/whisper-large-v3. Esta especializado en dos variedades linguisticas de Taiwan: el mandarin taiwanes, con salida en caracteres chinos tradicionales, y el hokkien taiwanes (min nan), con salida en caracteres han. Con aproximadamente 1.550 millones de parametros, hereda la arquitectura transformer encoder-decoder de Whisper large-v3 y su ventana de contexto de audio de 30 segundos por segmento.

El modelo forma parte del ecosistema HeliosLM y esta concebido como el companero de voz del modelo conversacional helioslm-chat-e4b. Su relevancia radica en que cubre una combinacion de idioma y escritura poco atendida por los modelos ASR generalistas: el hokkien taiwanes apenas esta representado en los corpus multilingues habituales, y Whisper large-v3 sin ajuste produce tasas de error muy elevadas en esa lengua. La version v6m prioriza el hokkien sobre el mandarin respecto a su predecesora v5, sacrificando una pequena parte de precision en mandarin.

La licencia Apache-2.0, heredada del modelo base, permite uso comercial sin restricciones adicionales, lo que lo hace atractivo para productos de transcripcion orientados al mercado taiwanes. El repositorio ocupa 3,1 GB en formato safetensors y se distribuye a traves de la libreria transformers.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper large-v3) |
| Parametros totales | 1.543.490.560 (aprox. 1,55B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 30 segundos de audio por segmento (ventana nativa de Whisper); procesamiento de audio largo mediante chunking |
| Tipos de cuantizacion | no disponible en la informacion proporcionada (los pesos se publican en safetensors sin cuantizar) |
| Idiomas soportados | zh (mandarin taiwanes, salida en chino tradicional), nan (hokkien taiwanes, salida en caracteres han) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo reutiliza integramente la arquitectura de Whisper large-v3: un encoder que transforma espectrogramas mel en representaciones latentes y un decoder autorregresivo que genera tokens de texto, con atencion cruzada entre ambos. No se introducen modificaciones estructurales; el trabajo se concentra en el ajuste fino supervisado sobre datos de habla de Taiwan.

El entrenamiento se realizo en dos etapas documentadas. La etapa 1, que dio lugar a la version v4, consistio en una epoca con tasa de aprendizaje 7e-6 y 4.776 pasos sobre Common Voice 27.0 zh-TW y nan-tw, FLEURS cmn con transcripciones convertidas a chino tradicional mediante OpenCC y un subconjunto de entrenamiento de AISHELL-1. El resultado se fusiono con el modelo base en proporcion 0,85 x ajustado + 0,15 x whisper-large-v3, dando v5. La etapa 2, que produce v6m, continuo desde v5 con los clips nan-tw de Common Voice sobrerrepresentados 4x, el 30% de los clips zh-TW y FLEURS duplicado, tasa de aprendizaje 4e-6 y unas 2,2 horas de computo, seguida de una nueva fusion con la misma proporcion 0,85/0,15 respecto al modelo base. No se menciona uso de RLHF ni DPO.

## Capacidades

- Transcripcion de voz a texto en mandarin taiwanes con salida en caracteres chinos tradicionales.
- Transcripcion de hokkien taiwanes con salida exclusiva en caracteres han; no genera romanizacion Tâi-lô.
- Procesamiento de audio de duracion arbitraria mediante chunking (por ejemplo, `chunk_length_s=30` en el pipeline de transformers).
- Seleccion de idioma y tarea mediante `generate_kwargs` (`language`, `task`).
- Compatibilidad con el pipeline `automatic-speech-recognition` de transformers y con endpoints compatibles.
- No soporta tool calling, function calling, razonamiento multi-paso, vision ni audio generativo; es un modelo puramente ASR.

## Casos de uso

- Transcripcion de reuniones y actas en empresas taiwanesas: el modelo convierte audio de habla mandarina en texto con chino tradicional, listo para archivado o busqueda, con un CER del 5,42% en Common Voice zh-TW, muy por debajo del 15,25% del modelo base.
- Subtitulado de contenido audiovisual en hokkien taiwanes: permite generar subtitulos en caracteres han para programas, entrevistas o contenido cultural en esta lengua, donde Whisper large-v3 sin ajuste resulta inutilizable (CER del 231,13% frente al 32,69% de v6m).
- Asistente de voz integrado en el ecosistema HeliosLM: al ser el companero de voz de helioslm-chat-e4b, se puede encadenar la transcripcion con la generacion de respuestas del modelo conversacional para construir un asistente hablado en mandarin taiwanes.
- Digitalizacion de archivos orales y patrimonio linguistico: transcripcion de grabaciones historicas o entrevistas en hokkien, con la advertencia de que la precision en esta lengua sigue siendo limitada y requiere revision humana.
- Atencion al cliente por voz en el mercado taiwanes: transcripcion de llamadas en mandarin para analitica, control de calidad o generacion de resumentes, aprovechando la licencia Apache-2.0 para despliegue comercial.
- Herramientas de accesibilidad: generacion de transcripciones en tiempo casi real para personas con discapacidad auditiva en contextos donde se hable mandarin taiwanes o hokkien, con chunking de audio para flujos continuos.
- Investigacion en tecnologias del habla para lenguas minorizadas: punto de partida para experimentos de adaptacion de Whisper a variedades de bajo recursos, dado que el autor documenta con detalle la receta de entrenamiento y las fusiones de pesos.

## Benchmarks y rendimiento

Resultados autoevaluados por el autor (2026-11-05/06), decodificacion greedy, mismos clips y misma ejecucion para los tres modelos. Metrica: tasa de error de caracteres (CER, %, menor es mejor).

| Conjunto de prueba | Clips | HeliosLM ASR TW v6m | HeliosLM ASR TW v5 | whisper-large-v3 (base) |
|---|---|---|---|---|
| Common Voice 27.0 zh-TW test | 998 | 5,42 | 5,10 | 15,25 |
| FLEURS cmn test (referencias en chino tradicional) | 945 | 7,61 | 7,33 | 7,54 |
| Common Voice 27.0 nan-tw test, caracteres han | 1.000 | 32,69 | 38,15 | 231,13 |
| Common Voice 27.0 nan-tw test, transcripciones crudas (incluye romanizacion) | 1.000 | 85,09 | 86,29 | 121,57 |

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 3,1 GB solo para pesos, mas memoria para activaciones y buffers de audio; en la practica, entre 4 y 6 GB en GPU.
- En fp32, los pesos ocupan unos 6,2 GB, por lo que se recomienda fp16 o bf16 en GPU.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para fp16 (RTX 3070/4060 Ti, RTX 4080, RTX 4090, A10, L4). Para lotes grandes o despliegue concurrente, A100 o H100.
- Cabe en GPU de consumo: si, en modelos con 8 GB o mas de VRAM en fp16; con cuantizacion a 8 bits o 4 bits cabria en GPUs de 4-6 GB, aunque el autor no publica pesos cuantizados.
- Opciones de despliegue: pipeline de transformers, vLLM (soporte de Whisper), TGI, y conversion a otros formatos mediante herramientas de la comunidad; no se documentan pesos GGUF ni recetas para llama.cpp u Ollama en la informacion disponible.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto de audio | Idiomas objetivo | CER nan-tw (han) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| HeliosLM ASR TW v6m | 1,55B | 30 s por segmento | zh-TW, nan-tw | 32,69 | Apache-2.0 | Hugging Face |
| HeliosLM ASR TW v5 | 1,55B | 30 s por segmento | zh-TW, nan-tw | 38,15 | Apache-2.0 | Hugging Face |
| openai/whisper-large-v3 | 1,55B | 30 s por segmento | multilingue (99 idiomas) | 231,13 | Apache-2.0 | Hugging Face |

La comparativa se limita a los modelos evaluados por el autor. No se dispone de datos de otros ASR especializados en hokkien taiwanes en la informacion proporcionada.

## Limitaciones y advertencias

- El hokkien taiwanes sigue siendo debil: CER del 32,69% en caracteres han y del 85,09% con transcripciones crudas que incluyen romanizacion. No es adecuado para transcripcion automatica sin revision humana en esta lengua.
- El modelo solo escribe caracteres han para el hokkien; no genera Tâi-lô ni otra romanizacion, lo que limita su uso en aplicaciones que requieran ortografia romanizada.
- En mandarin taiwanes es ligeramente peor que v5 (5,42 frente a 5,10 en Common Voice zh-TW); el autor recomienda v5 para audio mayoritariamente mandarin y v6m para hokkien.
- Los benchmarks son autoevaluados por el autor con una unica ejecucion y decodificacion greedy; no hay validacion independiente.
- Riesgo de alucinacion y errores de reconocimiento: el propio autor advierte que el modelo puede equivocarse y que las transcripciones importantes deben verificarse.
- Sesgos: al entrenarse con Common Voice, FLEURS y AISHELL-1, puede presentar peor rendimiento en acentos, edades, generos o condiciones acusticas poco representadas en esos corpus.
- Limitacion de contexto: la ventana nativa es de 30 segundos por segmento; audios mas largos requieren chunking, lo que puede introducir errores en las fronteras entre segmentos.
- No soporta traduccion, diarizacion de hablantes ni marcas temporales a nivel de palabra de forma nativa en la informacion disponible.
- Licencia Apache-2.0: permite uso comercial, pero se recomienda conservar el aviso de licencia y citar el modelo base y el trabajo de fine-tuning.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/chienhsinlin/helioslm-asr-tw-v6m
- Version anterior v5: https://huggingface.co/chienhsinlin/helioslm-asr-tw-v5
- Modelo conversacional del mismo autor: https://huggingface.co/chienhsinlin/helioslm-chat-e4b
- Modelo base: https://huggingface.co/openai/whisper-large-v3
- Common Voice 27.0: https://commonvoice.mozilla.org/datasets
- FLEURS: https://huggingface.co/datasets/google/fleurs
- AISHELL-1: https://www.openslr.org/33/
- OpenCC: https://github.com/BYVoid/OpenCC
