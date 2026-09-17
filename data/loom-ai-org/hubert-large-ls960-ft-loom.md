# loom-ai-org/hubert-large-ls960-ft-loom

## Resumen

`loom-ai-org/hubert-large-ls960-ft-loom` es una exportación del modelo de reconocimiento automático del habla (ASR) `facebook/hubert-large-ls960-ft` al formato GGUF propietario de [loom.cpp](https://github.com/loom-ai-org/loom.cpp). No se trata de un entrenamiento nuevo ni de un ajuste adicional: los pesos son los originales de Meta y lo que cambia es el empaquetado, que agrupa topologías de grafo, tokenizador y script de controlador en un único fichero autodescriptivo generado con [loom-exporter](https://github.com/loom-ai-org/loom-exporter). El modelo tiene 315.466.786 parámetros y un tamaño de repositorio de 1,3 GB.

El modelo subyacente es un HuBERT Large (transformer encoder sobre representaciones de voz auto-supervisadas) afinado con CTC sobre LibriSpeech de 960 horas, lo que lo convierte en un sistema de transcripción de voz en inglés de vocabulario cerrado. Su relevancia actual es de tipo práctico: permite ejecutar un ASR monolingüe en inglés dentro del ecosistema loom.cpp con un solo fichero GGUF, sin depender de PyTorch ni de la pila de `transformers` en tiempo de inferencia.

La ficha se apoya exclusivamente en la información de HuggingFace y en la model card del autor. La búsqueda web asociada devolvió únicamente resultados sin relación con el modelo (la aplicación de grabación de pantalla Loom y la marca de ropa Loom), por lo que no se han podido recoger papers, blogs ni benchmarks adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | HuBERT Large: encoder transformer sobre representaciones acústicas auto-supervisadas, con cabeza de clasificación CTC para ASR |
| Parametros totales | 315.466.786 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (la model card no especifica la ventana de audio máxima; el pipeline gestiona el ventaneo y muestreo internamente) |
| Tipos de cuantizacion | no disponible como catálogo; el repositorio publica un único fichero `.gguf` de 1,3 GB, compatible con tamaños de ~4 bytes por parámetro (equivalente a fp32) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0, heredada del modelo base |
| Formato de pesos | GGUF (fichero `hubert-large-ls960-ft.gguf`, autodescriptivo) |

Otros datos: modelo base `facebook/hubert-large-ls960-ft`, librería declarada `loom-py-rt`, pipeline `automatic-speech-recognition`, región de publicación `us`, 0 descargas y 0 likes en el momento de la consulta.

## Arquitectura y entrenamiento

La arquitectura es la de HuBERT: un encoder transformer que opera sobre características acústicas previamente aprendidas de forma auto-supervisada, seguido de una cabeza lineal que produce logits CTC alineados con el audio de entrada. El tamaño "large" de HuBERT corresponde a 24 capas de transformer con dimensión oculta 1024 y 16 cabezas de atención (configuración estándar de la familia, ~317M de parámetros incluyendo la cabeza CTC). La fine-tuning sobre LibriSpeech 960h (`ls960-ft`) es la que aporta la capacidad de transcripción: el modelo base sin afinar produce representaciones, no texto.

No hay en la información disponible datos sobre el número de tokens o horas exactas de la fase auto-supervisada, la composición del corpus más allá de LibriSpeech 960h en la fase de ajuste, ni si hubo RLHF o DPO (no aplica en un modelo CTC de ASR). La innovación destacable aquí no es del modelo, sino del empaquetado: un GGUF autodescriptivo que embebe el grafo, el tokenizador y el script controlador, de modo que la ventana, el muestreo y el ensamblado de la salida los aplica el runtime y no el usuario.

Un detalle funcional relevante documentado en la model card: el modelo decodifica en un único idioma y no acepta el argumento `language=`, que se ignora con un aviso; además no emite tokens de timestamp, por lo que `segments` devuelve un único tramo que cubre todo el clip y `result.timestamped` es `False`.

## Capacidades

- Reconocimiento de voz a texto en inglés (ASR monolingüe) a partir de audio mono en coma flotante muestreado a 16 kHz.
- Decodificación CTC extremo a extremo, sin modelo de lenguaje externo acoplado en el pipeline de alto nivel.
- Gestión interna del ventaneo y del muestreo a través de la API `model.speech2text.infer(audio, timestamps=True)`.
- Acceso a la capa inferior mediante `model.infer(...)`, que pasa los argumentos directamente al controlador embebido en el GGUF; `model.driver_source` imprime ese controlador y documenta cada argumento aceptado.
- Inferencia dentro del runtime loom.cpp (librería `loom-py-rt`), sin dependencia de PyTorch en ejecución.
- No soporta tool calling ni function calling.
- No soporta uso como agente ni razonamiento multi-paso: es un modelo acústico de transcripción, no generativo de texto libre.
- No hay capacidades multilingües: solo inglés.
- No hay modo "thinking", visión, audio generation ni capacidades multimodales más allá de la entrada de voz.
- No hay marcas de tiempo a nivel de palabra o segmento verificables: el modelo no emite tokens de timestamp.

## Casos de uso

- Transcripción de audiolibros y podcast en inglés: el ajuste sobre LibriSpeech (lectura de audiolibros) hace que este sea el dominio más alineado con el entrenamiento, con locución clara y sin solapamiento de hablantes.
- Generación de subtítulos para vídeo en inglés: el modelo devuelve texto plano útil como pista de subtítulos, pero conviene comprobar `result.timestamped` antes de usar los valores de `start`/`end` como fronteras reales, ya que no son tokens emitidos por el modelo.
- Pseudo-etiquetado de corpus de voz en inglés para investigación: al ser un modelo de 315M ejecutable en CPU o GPU modesta, sirve para generar transcripciones preliminares sobre grandes volúmenes de audio que después se revisan o filtran.
- Transcripción local en el borde (edge) o en equipos sin GPU: el empaquetado GGUF y el runtime loom.cpp permiten desplegar ASR en inglés sin instalar la pila de PyTorch, algo útil en entornos con restricciones de dependencias o de tamaño de imagen de contenedor.
- Preprocesado de notas de voz en aplicaciones de productividad: convertir dictados o mensajes de voz en inglés a texto antes de indexarlos o resumirlos con otro modelo de lenguaje.
- Evaluación comparativa de motores de inferencia: comparar el mismo conjunto de pesos HuBERT ejecutado en `transformers` frente a loom.cpp para medir latencia, consumo de memoria y fidelidad numérica del export GGUF.
- Investigación en ASR y destilación: usar el modelo como referencia de calidad en inglés para comparar contra variantes más pequeñas o cuantizadas, dentro del mismo runtime.
- Transcripción de reuniones en inglés con audio limpio: viable como paso previo, aunque sin segmentación diarizada ni puntuación documentada, la salida requiere post-proceso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

La model card del export no incluye cifras de WER, ni sobre LibriSpeech ni sobre otros corpus, y la búsqueda web no aportó resultados relacionados con el modelo. Cualquier valor de WER o latencia que se necesite debe medirse sobre el propio despliegue, dado que no se documenta ni el motor de decodificación exacto ni la configuración de ventana usada por el controlador.

## Requisitos de hardware

- Huella de pesos: 315,5M de parámetros equivalen a aproximadamente 1,26 GB en fp32, 0,63 GB en fp16/bf16 y 0,32 GB en int8. El fichero GGUF publicado ocupa 1,3 GB, coherente con una exportación en fp32.
- VRAM estimada para inferencia: en torno a 1,5-2 GB en fp32 sumando activaciones y buffers de decodificación; menos de 1 GB si se dispone de una variante cuantizada, que no se publica en este repositorio.
- GPU recomendadas: cualquier GPU con 4 GB o más de VRAM es suficiente (GTX 1650, RTX 3060, RTX 4060, RTX 4090). No se requiere A100 ni H100 para este tamaño.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU dedicada de los últimos años y también en iGPU con memoria compartida suficiente.
- Inferencia en CPU: viable dado el tamaño, y es el escenario natural del runtime loom.cpp cuando no hay GPU disponible.
- Opciones de despliegue: `loom-py` (API de alto nivel `model.speech2text.infer`) y `loom.cpp` como motor; el modelo no está publicado en formato GGUF compatible con llama.cpp, ni como artefacto para vLLM, TGI o Ollama.
- Latencia y throughput estimados: no disponible. No se documentan tiempos de inferencia ni factor de tiempo real en la información proporcionada.

## Comparativa con modelos similares

Los datos de las alternativas son valores públicos aproximados de sus respectivas familias y deben verificarse contra sus model cards antes de tomar decisiones de licencia o despliegue. Las cifras de rendimiento no se incluyen porque no hay benchmarks disponibles para el modelo de esta ficha.

| Modelo | Parametros | Contexto / audio | Idioma | Licencia | Formato y disponibilidad |
|---|---|---|---|---|---|
| hubert-large-ls960-ft-loom (esta ficha) | 315,5M | no disponible (ventaneo gestionado por el runtime) | en | apache-2.0 | GGUF para loom.cpp; runtime loom-py-rt |
| facebook/hubert-large-ls960-ft | ~317M | no disponible | en | apache-2.0 | safetensors/PyTorch; ecosistema transformers |
| facebook/wav2vec2-large-960h | ~317M | no disponible | en | apache-2.0 | safetensors/PyTorch; ecosistema transformers |
| openai/whisper-small | ~244M | ventanas de 30 s | multilingüe (~99 idiomas) | apache-2.0 | safetensors/PyTorch; amplio soporte en whisper.cpp y otras runtimes |
| openai/whisper-medium | ~769M | ventanas de 30 s | multilingüe (~99 idiomas) | apache-2.0 | safetensors/PyTorch; amplio soporte en whisper.cpp y otras runtimes |

Diferencias clave: frente a wav2vec 2.0 Large, este modelo comparte tamaño y licencia, pero su formato de pesos está atado al runtime loom.cpp. Frente a Whisper, el modelo de esta ficha es monolingüe, no está pensado para traducción ni para marcas de tiempo, y no dispone de la misma variedad de backends de despliegue.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información disponible. El ajuste sobre LibriSpeech introduce un sesgo hacia voz de lectura en inglés, con acento y condiciones de grabación propias de audiolibros, y probable degradación en habla espontánea, conversacional, con ruido o con acentos no representados.
- Riesgo de alucinación: en un modelo CTC la salida está restringida al vocabulario de caracteres aprendido, por lo que no genera texto libre inventado, pero sí puede producir transcripciones erróneas, omisiones o repeticiones en audio degradado.
- Marcas de tiempo: el modelo no emite tokens de timestamp. `result.segments` devuelve un único tramo que cubre el clip completo y `result.timestamped` es `False`; cualquier uso de `start`/`end` como fronteras reales es incorrecto.
- Idioma: monolingüe en inglés. El argumento `language=` no existe para este modelo; si se pasa, se emite un aviso y se ignora.
- Puntuación y mayúsculas: la model card no documenta ningún tratamiento de puntuación, capitalización o normalización de la salida. No debe asumirse que el texto venga formateado para lectura directa.
- Licencia: apache-2.0 heredada del modelo base, permisiva para uso comercial, pero conviene verificar que los pesos originales de Meta mantienen esa misma licencia en su versión actual.
- Madurez del artefacto: el repositorio registra 0 descargas y 0 likes, y el export depende de la API y la estabilidad de `loom-py-rt` y `loom.cpp`, proyectos mucho menos extendidos que `transformers` o `whisper.cpp`. El soporte de la comunidad y la disponibilidad de ejemplos son limitados.
- Dependencia del runtime: la cuantización disponible y el comportamiento de decodificación dependen del controlador embebido en el GGUF, no de opciones estándar de llama.cpp. Inspeccionar `model.driver_source` es obligatorio antes de ajustar parámetros.
- Producción: no hay benchmarks publicados, ni cifras de latencia, ni pruebas de robustez documentadas, por lo que cualquier despliegue en producción requiere una evaluación propia sobre el dominio objetivo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/loom-ai-org/hubert-large-ls960-ft-loom
- Modelo base: https://huggingface.co/facebook/hubert-large-ls960-ft
- Repositorio loom.cpp (motor de inferencia): https://github.com/loom-ai-org/loom.cpp
- Repositorio loom-exporter (herramienta de exportación): https://github.com/loom-ai-org/loom-exporter
- Repositorio loom-py (API de alto nivel): https://github.com/loom-ai-org/loom-py
- Paquete en PyPI: https://pypi.org/project/loom-py-rt/
- Búsqueda web: todos los resultados obtenidos corresponden a la aplicación de grabación de pantalla Loom (loom.com) y a la marca de ropa Loom (loom.fr); no se encontró ningún enlace relevante sobre el modelo, papers asociados, blogs técnicos ni demos.
