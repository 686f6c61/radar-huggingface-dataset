# loom-ai-org/paraformer-zh-loom

## Resumen

`loom-ai-org/paraformer-zh-loom` es una exportación del modelo de reconocimiento automático de voz (ASR) `funasr/paraformer-zh` de Alibaba al formato GGUF propietario del motor loom.cpp. No se trata de un modelo nuevo ni de un reentrenamiento: los pesos son idénticos a los del modelo base y lo que cambia es el empaquetado, que incluye en un único archivo autodescriptivo las topologías de grafo, el tokenizer y el script de driver necesarios para ejecutarlo con el runtime de loom.cpp y su binding de Python, `loom-py-rt`.

El modelo base es Paraformer-large, un transformer no autorregresivo (NAR) para ASR de mandarín e inglés con 216.276.050 parámetros (unos 216 M), lo que lo sitúa en la gama ligera: el repositorio completo ocupa 0,9 GB. Su interés práctico reside en que la decodificación no autorregresiva permite generar la transcripción completa en una pasada paralela, en lugar de token a token, lo que reduce la latencia frente a los modelos ASR autorregresivos tipo Whisper.

La relevancia de esta ficha es acotada y conviene ser explícito: no es un modelo de lenguaje, no genera texto libre, no soporta tool calling ni razonamiento multi-paso, y su utilidad se limita a transcripción de audio en chino e inglés. Además, el repositorio es muy reciente (creado el 17 de septiembre de 2026) y no registra descargas ni valoraciones, y no se han publicado resultados de benchmarks para esta exportación. Su interés está, por tanto, en el ecosistema loom.cpp y en despliegues de ASR ligero en CPU o GPU de gama baja, no en comparativas de calidad de transcripción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer no autorregresivo (NAR) encoder-decoder para ASR, con decodificación paralela (familia Paraformer) |
| Parametros totales | 216.276.050 (aprox. 216 M) |
| Parametros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | No disponible. Al ser un modelo de voz no existe una ventana de contexto en tokens; la duración de audio y el troceado los gestiona el driver embebido en el GGUF y la capa de alto nivel de loom-py. No se publica duración máxima por fragmento |
| Tipos de cuantizacion | No se documentan niveles de cuantización. El repositorio contiene un único archivo `paraformer-zh.gguf`; el tamaño del repo (0,9 GB) es coherente con pesos sin cuantizar en 32 bits para 216 M de parámetros, aunque esto no está confirmado en la información disponible |
| Idiomas soportados | `zh`, `en` |
| Licencia | Apache-2.0 (heredada del modelo base) |
| Formato de pesos | GGUF único y autodescriptivo (grafo, tokenizer y script de driver embebidos), generado con loom-exporter |
| Modelo base | `funasr/paraformer-zh` (pesos sin modificar) |
| Runtime | loom.cpp / loom-py (`loom-py-rt` en PyPI) |
| Tamano del repositorio | 0,9 GB |
| Pipeline declarado | `automatic-speech-recognition` |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Paraformer, un transformer no autorregresivo para ASR que evita la generación secuencial de tokens. En lugar de emitir la hipótesis token a token, incorpora un módulo predictor de longitud que estima cuántos tokens de salida corresponden al audio de entrada y decodifica en paralelo. Este diseño es el que persigue reducir la latencia de inferencia típica de los modelos ASR autorregresivos, a costa de depender de una estimación correcta de la longitud de salida. La exportación a loom.cpp no altera esta arquitectura: la model card indica explícitamente que los pesos son los mismos que los de `funasr/paraformer-zh` y que el repositorio solo reempaqueta los parámetros en el GGUF del motor.

En cuanto al entrenamiento, la información disponible no incluye ningún dato sobre número de tokens, composición del dataset, horas de audio, ni sobre si hubo fases de ajuste con RLHF o DPO (poco habituales en ASR). Tampoco se documentan innovaciones adicionales introducidas por esta exportación más allá del propio empaquetado: un único GGUF que transporta sus topologías de grafo, su tokenizer y su driver, de modo que el modelo se describe a sí mismo y no necesita configuración externa. Cualquier afirmación sobre el corpus de entrenamiento o el esquema de decodificación exacto debe consultarse en la documentación del modelo base y en la literatura de Paraformer, no en este repositorio.

## Capacidades

- Reconocimiento automático de voz en chino (`zh`) e inglés (`en`). La model card indica que el modelo decodifica en el idioma para el que fue entrenado y que no acepta un argumento `language=`: si se pasa, se emite un aviso y se ignora.
- Entrada de audio en mono a 16 kHz, en forma de lista de `float`. La ventana, el muestreo y el ensamblado los aplica la capa de alto nivel de loom-py (`model.speech2text.infer`).
- Devolución del texto transcrito (`result.text`).
- Marcas de tiempo agregadas: el modelo no emite tokens de timestamp, por lo que `result.segments` devuelve un único intervalo que cubre todo el clip y `result.timestamped` vale `False`. Cualquier alineación temporal fina debe obtenerse con herramientas externas.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No dispone de capacidades de visión, audio generativo, traducción, resumen ni diálogo: es exclusivamente un transcriber de audio a texto.
- No incorpora modo "thinking" ni ningún mecanismo de razonamiento explícito.
- Acceso de bajo nivel: `model.infer(...)` pasa los argumentos directamente al driver embebido en el GGUF, y `model.driver_source` imprime ese driver junto con la documentación de los argumentos que acepta.

## Casos de uso

- Transcripción de notas de voz y reuniones en chino: se envía el audio mono a 16 kHz a `model.speech2text.infer` y se obtiene el texto para actas, resúmenes posteriores o búsqueda. El modelo es adecuado por su tamaño contenido (216 M), que permite ejecutarlo en servidor sin GPU dedicada.
- Subtitulado de vídeo en zh/en en modo batch: transcripción de pistas de audio completas dentro de un pipeline de postproducción. Hay que tener en cuenta que el modelo no emite timestamps, así que el troceado en subtítulos debe hacerse con un alineador o un VAD externo que corte el audio en fragmentos antes de llamar al modelo.
- ASR embebido y on-device: con 0,9 GB de repositorio y 216 M de parámetros, el modelo cabe en equipos sin GPU y permite transcribir localmente sin enviar audio a servicios externos, lo que resulta relevante para aplicaciones con requisitos de privacidad (grabaciones médicas, legales o internas).
- Indexación y búsqueda de archivos de audio: transcripción masiva de podcasts, grabaciones de atención al cliente o bibliotecas de audio en mandarín para construir un índice de texto consultable. El formato de salida (texto plano) se integra directamente en un pipeline de indexación.
- Análisis de llamadas de centros de contacto en chino: conversión de grabaciones a texto para analítica de calidad, detección de motivos de contacto o cumplimiento normativo, procesando los audios por lotes en CPU.
- Dictado y control por voz en aplicaciones en chino: entrada de voz a texto en herramientas de escritura o formularios, con la ventaja de una decodificación paralela que reduce la latencia percibida frente a alternativas autorregresivas.
- Investigación sobre ASR no autorregresivo: dado que los pesos son idénticos a los del modelo base y el runtime es distinto, sirve para comparar el comportamiento de decodificación de una implementación NAR empaquetada en GGUF frente a la implementación original en FunASR/PyTorch.
- Evaluación del propio motor loom.cpp: el repositorio funciona como caso de prueba de extremo a extremo del formato GGUF autodescriptivo (grafo, tokenizer y driver en un solo archivo) y de la API de loom-py.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de tasa de error de palabra (WER/CER), ni comparaciones con otros sistemas ASR, ni cifras de latencia o throughput (RTF). Tampoco se han encontrado en la búsqueda web resultados técnicos relacionados con este repositorio.

## Requisitos de hardware

- VRAM estimada para inferencia: con 216 M de parámetros, los pesos ocupan aproximadamente 0,86 GB en fp32, 0,43 GB en fp16 y 0,22 GB en int8 (cálculo teórico a partir del número de parámetros; el repositorio no confirma qué precisión contiene el GGUF). Sumando buffers de activaciones y overhead del runtime, un presupuesto de 1-2 GB de VRAM es suficiente.
- GPU recomendadas: no se necesita GPU dedicada. Cualquier GPU con 2 GB o más de memoria es suficiente; una RTX 3060, RTX 4060 o superior queda sobredimensionada para una sola petición y solo tiene sentido si se busca paralelizar por lotes. A100 o H100 no aportan ventaja por el tamaño del modelo, salvo para servir grandes volúmenes en batch.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU de consumo de los últimos diez años, y también en CPU. Es plausible su ejecución en placas tipo Raspberry Pi, aunque no hay cifras publicadas que lo confirmen.
- Opciones de despliegue: exclusivamente el ecosistema loom, es decir, el runtime C++ loom.cpp y el binding de Python `loom-py-rt` (`pip install -U "loom-py-rt[hub]"`). No hay indicios en la información disponible de compatibilidad con vLLM, Ollama, llama.cpp o TGI; el GGUF incluye grafos propios de loom.cpp y el modelo no es un LLM, por lo que esos servidores no son aplicables.
- Latencia y throughput estimados: no disponible. No se publican cifras de RTF, latencia por segundo de audio ni rendimiento en lote.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Duracion de audio | Licencia | Formato y runtime | Notas |
|---|---|---|---|---|---|---|
| `loom-ai-org/paraformer-zh-loom` (este) | 216 M | zh, en | No disponible | Apache-2.0 | GGUF para loom.cpp / loom-py | Pesos idénticos a `funasr/paraformer-zh`; sin benchmarks publicados en la información disponible |
| `funasr/paraformer-zh` (modelo base) | 216 M | zh, en (según etiquetas del repositorio) | No disponible | Apache-2.0 | PyTorch, ecosistema FunASR / ModelScope | Mismos pesos y misma arquitectura NAR; referencia para comparar el empaquetado loom frente al original |
| `openai/whisper-large-v3` | 1.550 M | 99 | Ventanas de 30 s | MIT | safetensors; transformers, whisper.cpp y otros | Modelo autorregresivo, mucho mayor y multilingüe; no es comparable en coste de inferencia |
| `openai/whisper-small` | 244 M | 99 | Ventanas de 30 s | MIT | safetensors; transformers, whisper.cpp y otros | Tamaño similar (244 M frente a 216 M) y arquitectura autorregresiva; cobertura de idiomas muy superior, pero sin datos comparativos de WER disponibles en esta información |

No se dispone de resultados de benchmarks de este modelo ni de comparaciones medidas frente a las alternativas anteriores, por lo que la tabla se limita a parámetros, idiomas, licencia y disponibilidad.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto libre, no responde a instrucciones, no razona, no hace tool calling y no procesa imágenes ni audio generativo. Cualquier expectativa de uso como asistente conversacional es incorrecta.
- Sin marcas de tiempo reales: el modelo no emite tokens de timestamp, de modo que `result.segments` contiene un único intervalo que abarca todo el clip y `result.timestamped` es `False`. Antes de tratar un inicio o un fin como una frontera elegida por el modelo hay que comprobar ese campo. El subtitulado fino requiere segmentación externa.
- El argumento `language=` no tiene efecto: si se pasa, se emite un aviso y se ignora, porque la decodificación no puede actuar sobre él. El modelo decodifica en el idioma para el que fue entrenado.
- Cobertura lingüística limitada a chino e inglés. No hay información sobre el comportamiento con code-switching intra-frase, dialectos o acentos regionales, ámbitos en los que los sistemas ASR de mandarín suelen degradarse.
- Riesgo de alucinación en sentido ASR: en audio con ruido, solapamiento de hablantes, música o silencios largos, los sistemas no autorregresivos pueden producir texto plausible pero incorrecto. No se han publicado métricas de WER/CER que permitan acotar este riesgo.
- Sesgos no documentados: la información disponible no detalla la composición del corpus de entrenamiento, por lo que no es posible evaluar sesgos de acento, género, edad o dominio. Se recomienda validar con datos propios antes de un despliegue en producción.
- Dependencia de un runtime específico: el modelo solo se ejecuta con loom.cpp / loom-py. Esto reduce drásticamente las opciones de despliegue (sin vLLM, Ollama, llama.cpp ni TGI), el soporte de la comunidad y las herramientas de monitorización habituales.
- Madurez del repositorio: creado el 17 de septiembre de 2026, con 0 descargas y 0 valoraciones en el momento de redactar esta ficha. No hay evidencia pública de uso en producción ni de validación independiente del empaquetado.
- Precisión de los pesos no confirmada: el repositorio no especifica si el GGUF contiene pesos en fp32, fp16 o cuantizados. El tamaño de 0,9 GB sugiere 32 bits, pero es una inferencia y debe verificarse antes de dimensionar hardware.
- Licencia: Apache-2.0 permite uso comercial y modificación, con obligación de conservar avisos de copyright y licencia. Conviene revisar igualmente las condiciones del modelo base y del corpus de entrenamiento original, así como los términos de uso de FunASR.
- Ausencia total de benchmarks: no hay WER, CER, latencia ni throughput publicados, ni para esta exportación ni, en la información proporcionada, comparaciones directas con alternativas en el mismo hardware.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/loom-ai-org/paraformer-zh-loom
- Modelo base: https://huggingface.co/funasr/paraformer-zh
- Motor loom.cpp: https://github.com/loom-ai-org/loom.cpp
- Binding de Python loom-py: https://github.com/loom-ai-org/loom-py
- Herramienta de exportación loom-exporter: https://github.com/loom-ai-org/loom-exporter
- Paquete en PyPI: https://pypi.org/project/loom-py-rt/
- FunASR (framework del modelo base): https://github.com/modelscope/FunASR
- Artículo de Paraformer (arquitectura del modelo base): https://arxiv.org/abs/2206.08317

Nota sobre la búsqueda web: los resultados obtenidos corresponden a Loom, la herramienta de grabación de pantalla (loom.com), y a Loom, la marca de ropa (loom.fr), sin relación alguna con el repositorio `loom-ai-org/paraformer-zh-loom`. No se han encontrado enlaces técnicos adicionales relevantes sobre este modelo.
