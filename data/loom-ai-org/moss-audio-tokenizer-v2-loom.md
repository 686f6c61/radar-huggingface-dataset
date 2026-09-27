# loom-ai-org/moss-audio-tokenizer-v2-loom

## Resumen

moss-audio-tokenizer-v2-loom es la exportación a GGUF de la mitad de decodificación del codec de audio MOSS-Audio-Tokenizer v2 de OpenMOSS, publicada por loom-ai-org dentro del ecosistema loom.cpp. No es un modelo de lenguaje ni un generador de audio a partir de texto: recibe secuencias de códigos discretos y las convierte en forma de onda estéreo a 48 kHz. Los pesos son idénticos a los del modelo base OpenMOSS-Team/MOSS-Audio-Tokenizer-v2; lo que cambia es el empaquetado, un único archivo GGUF autodescriptivo que incluye las topologías de grafo, el tokenizador (si lo hubiera) y el script de control del motor loom.cpp.

El artefacto tiene 1.078.514.590 parámetros (~1,08 mil millones) y ocupa 4,3 GB en el repositorio, un tamaño coherente con pesos almacenados en fp32. La arquitectura son seis pilas de transformer causal con atención ventaneada que suben la resolución temporal desde 12,5 frames por segundo hasta 400 Hz, sin una sola convolución. Cada frame consume hasta 32 codebooks y produce 3840 muestras por canal a 48 kHz; el límite declarado es de 4096 frames, es decir, 5,5 minutos de audio por llamada.

Su relevancia es práctica: es la pieza que falta para cerrar un pipeline de texto a audio en el ecosistema loom.cpp, ya que convierte los códigos que emite un modelo autorregresivo o un TTS en audio reproducible. Frente al repositorio original en PyTorch, aquí todo el contrato (frecuencia de frames, número de codebooks, código ausente, frecuencia de muestreo) está declarado dentro del propio archivo, lo que elimina la necesidad de consultar un paper para integrarlo. Como contrapartida, se publica sin métricas de calidad perceptual y sin variantes cuantizadas, y con cero descargas y cero valoraciones en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Seis pilas de transformer causal con atención ventaneada; decoder de codec neuronal sin convoluciones |
| Parametros totales | 1.078.514.590 (~1,08 mil millones) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no expresada en tokens; límite de 4096 frames de códigos (5,5 minutos a 12,5 frames/s) |
| Tipos de cuantizacion | no disponible; se publica un único GGUF de ~4,3 GB, coherente con pesos en fp32, sin variantes cuantizadas |
| Idiomas soportados | no aplica: es un codec, no tiene vocabulario ni idioma |
| Licencia | apache-2.0 (heredada del modelo base) |
| Formato de pesos | GGUF (moss-audio-tokenizer-v2.gguf), ejecutable con loom.cpp / loom-py-rt |
| Tarea declarada | text-to-audio (pipeline_tag del repositorio); en la practica, decodificacion codigos-a-audio |
| Frecuencia de muestreo | 48.000 Hz, estereo intercalado (L R L R ...) |
| Frecuencia de frames | 12,5 frames por segundo (declarada como hparam `codec.frame_rate`) |
| Codebooks por frame | hasta 32 (declarado como `codec.n_codebooks`); se aceptan filas mas estrechas como prefijo |
| Tamano de codebook | no disponible en la informacion proporcionada (`codec.codebook_size`) |
| Codigo ausente | no disponible en la informacion proporcionada (`codec.absent_code`) |
| Parametros del archivo | declarados por el propio GGUF mediante `model.hparam(...)` y `model.contract` |

## Arquitectura y entrenamiento

La mitad de decodificación se compone de seis pilas de transformer causal organizadas en cascada de resoluciones temporales: la primera trabaja a 12,5 Hz y las siguientes refinan hasta 400 Hz. La atención es ventaneada y se calcula por bloques, de modo que el consumo de memoria crece de forma lineal con la duración del clip y no de forma cuadrática. Es el primer miembro de su familia (Family 11 en loom.cpp, códigos de codec a entrada y estéreo intercalado a salida) que no incluye ninguna convolución. La ventana acumulada de sus 92 capas alcanza más atrás que cualquier fragmento razonable, lo que obliga a decodificar el clip completo en una sola llamada: una decodificación por trozos con 8 segundos de solapamiento se desvía un 48% de la respuesta propia del modelo. La coherencia con la implementación original está verificada con un RMS relativo de 1,2e-06 sobre 30 segundos de voz.

No se dispone de información sobre el conjunto de datos de entrenamiento, el número de tokens o de horas de audio, la composición del corpus, ni sobre si hubo etapas de ajuste por refuerzo o preferencias. Tampoco se documentan innovaciones de decodificación especulativa ni mecanismos de atención lineal en este repositorio; la exportación no modifica ningún peso, solo reempaqueta los parámetros del modelo base en el formato de grafo autodescriptivo de loom.cpp, generado con loom-exporter.

## Capacidades

- Decodificación de audio: convierte códigos de codec en forma de onda estéreo a 48 kHz con muestras intercaladas por canal.
- Entrada en formato frame-major: todos los códigos del frame 0, después los del frame 1, y así sucesivamente; también acepta una lista plana con el mismo orden.
- Gestión de codebooks parciales: las filas con menos de 32 códigos se decodifican como un prefijo y el resto se rellena con el identificador declarado como ausente. Es el camino que usan los 12 codebooks de moss-tts-local-transformer-v1.5-loom.
- Validación estricta de entrada: una lista que no corresponda a un número entero de frames se rechaza en lugar de reinterpretarse con otra anchura.
- Autodescripción de parámetros: expone `codec.n_codebooks`, `codec.codebook_size`, `codec.frame_rate`, `codec.absent_code` y `contract.sample_rate` desde el propio archivo.
- Metadatos de audio: `audio.channels`, `audio.samples`, `audio.duration`, escritura de WAV de dos canales y conversión a array con forma `[frames, 2]` mediante numpy.
- Acceso de bajo nivel: `model.infer(...)` pasa los argumentos directamente al driver embebido en el GGUF, consultable con `model.driver_source`.
- No soporta: generación de texto, razonamiento, código, matemáticas, visión, tool calling, agentes, capacidades multilingües ni clonación de voz (esta última requeriría la mitad de codificación).

## Casos de uso

- Cierre de pipelines de texto a audio: un modelo autorregresivo o un TTS emite códigos frame-major y este decoder los convierte en audio reproducible a 48 kHz estéreo. Es exactamente la función para la que se publicó la exportación.
- Voz sintética de alta fidelidad en producción: cualquier sistema que ya genere códigos de codec puede renderizar la señal final sin depender de la implementación PyTorch del modelo original, al estar todo el contrato declarado en el GGUF.
- Integración con moss-tts-local-transformer-v1.5-loom: ese modelo emite 12 codebooks y este decoder acepta filas de 12 como prefijo, rellenando el resto con el código ausente declarado, de modo que la pareja forma un pipeline completo de síntesis de voz.
- Compresión y transporte de audio: al trabajar sobre representaciones discretas a 12,5 frames por segundo, encaja como etapa de reconstrucción en sistemas que transmiten códigos en lugar de muestras PCM y reconstruyen la forma de onda en destino.
- Despliegue en CPU y entornos sin GPU: un único archivo GGUF ejecutado con loom.cpp se procesa en CPU de dos núcleos a un ritmo aproximado de dos minutos por cada 30 segundos de audio, suficiente para procesado por lotes offline.
- Archivado de voz y música estéreo: la salida es estéreo intercalado real (`audio.channels == 2`), lo que permite conservar imagen estéreo en material musical o de campo, no solo en voz mono.
- Investigación en representaciones discretas de audio: sirve como referencia de decodificación verificada contra la implementación original con un RMS relativo de 1,2e-06, útil para medir el impacto de distintas estrategias de cuantización de códigos.
- Generación de datasets de audio sintético: a partir de lotes de códigos previamente muestreados o generados, se produce audio de forma determinista y reproducible en un solo paso, sin muestreo estocástico adicional en el decoder.
- Evaluación de decodificadores alternativos: al no tener convoluciones y usar atención ventaneada por bloques, es un punto de comparación interesante frente a vocoders convolucionales en estudios de latencia y memoria.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay MMLU, HumanEval, GSM8K ni métricas de calidad perceptual (PESQ, ViSQOL, MUSHRA) en la model card. Los únicos datos cuantitativos aportados son de verificación e ingeniería:

| Metrica | Valor | Condiciones |
|---|---|---|
| RMS relativo frente a la decodificacion original | 1,2e-06 | 30 segundos de voz |
| Desviacion de la decodificacion por trozos | 48% | Fragmentado con 8 segundos de solapamiento, respecto a la respuesta propia del modelo |
| Limite de frames por llamada | 4096 frames | Equivale a 5,5 minutos a 12,5 frames/s |
| Muestras por frame y canal | 3840 | A 48 kHz |
| Tiempo de proceso en CPU | ~2 minutos por 30 segundos de audio | CPU de 2 nucleos |
| Complejidad de memoria | Lineal con la duracion del clip | Atencion calculada por bloques |

## Requisitos de hardware

- Pesos: el repositorio ocupa 4,3 GB para 1.078.514.590 parámetros, lo que corresponde a almacenamiento en fp32 (4 bytes por parámetro). En memoria habría que reservar ese mismo orden de magnitud para los pesos.
- VRAM estimada: con pesos fp32, el mínimo práctico ronda los 6 GB, y 8 GB deja margen para las activaciones de clips cortos. No se publican variantes cuantizadas, por lo que no se puede reducir el peso del modelo sin recuantizar por cuenta propia.
- GPU recomendadas: cualquier GPU con 8 GB o más de memoria puede alojar el modelo en fp32. Para lotes grandes o clips cercanos al límite de 5,5 minutos conviene una GPU de 16-24 GB (RTX 4090, L4, A10) o superior (A100, H100) si se prioriza el paralelismo entre decodificaciones.
- GPU de consumo: sí cabe. Una RTX 3060 de 12 GB, una RTX 4060 Ti de 16 GB o una RTX 4090 de 24 GB pueden ejecutarlo en fp32, y también es viable en CPU.
- Despliegue: el formato es GGUF, pero con las topologías de grafo embebidas por loom-exporter, de modo que se ejecuta con loom.cpp y su enlace en Python loom-py-rt (`pip install -U "loom-py-rt[hub]"`). No está pensado para llama.cpp, Ollama, TGI ni vLLM, que no interpretan este grafo específico.
- Latencia y throughput: el único dato publicado es de CPU, unos dos minutos por 30 segundos de audio en dos núcleos. No hay cifras de latencia ni de throughput en GPU en la información disponible.
- Memoria según duración: al calcularse la atención por bloques, el consumo crece linealmente con la longitud del clip, con un techo de 4096 frames.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / limite | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| loom-ai-org/moss-audio-tokenizer-v2-loom (este) | 1,08 mil millones | 4096 frames (5,5 min) | GGUF para loom.cpp | apache-2.0 | Solo decodificacion; sin convoluciones; contrato autodescrito |
| OpenMOSS-Team/MOSS-Audio-Tokenizer-v2 (base) | mismos pesos | no disponible | PyTorch (safetensors) | apache-2.0 | Incluye ambas mitades, codificacion y decodificacion |
| loom-ai-org/moss-tts-local-transformer-v1.5-loom | no disponible | no disponible | GGUF para loom.cpp | no disponible | Emite 12 codebooks; se conecta directamente con este decoder |
| Otros codecs neuronales (EnCodec, DAC, Mimi, SNAC) | no disponible | no disponible | no disponible | no disponible | No se aportaron datos comparativos en la informacion disponible |

La comparación más directa es con el modelo base: idénticos parámetros y licencia, pero aquel incluye también la mitad de codificación y se distribuye en formato PyTorch, mientras que esta exportación solo decodifica y añade la autodescripción del contrato en el propio archivo. Frente a los codecs neuronales de otros autores no es posible establecer una comparación numérica con los datos disponibles en esta ficha.

## Limitaciones y advertencias

- Es únicamente la mitad de decodificación: la codificación (audio a códigos) es un contrato distinto que no se incluye, y ningún modelo que decodifique a través de este codec la invoca.
- No permite clonación de voz con MOSS-TTS: esa función requeriría la mitad de codificación, ausente en este repositorio y en su hermano TTS.
- Un clip se decodifica en una sola llamada, nunca por trozos: con 8 segundos de solapamiento, el resultado fragmentado aún se aleja un 48% de la respuesta del modelo, porque las ventanas de sus 92 capas alcanzan más atrás de lo que un fragmento puede transportar.
- Techo de 4096 frames, equivalentes a 5,5 minutos de audio por clip; es el propio presupuesto de generación del modelo original.
- La entrada debe ser frame-major y de hasta 32 códigos por frame a 12,5 frames por segundo. Las filas más estrechas se tratan como prefijo y el resto se rellena con el código ausente declarado, una decisión que altera la salida si no es la intención del llamante.
- No se publican métricas de calidad perceptual, sesgos acústicos ni composición del corpus de entrenamiento: cualquier afirmación sobre equidad, cobertura de idiomas o dominio sonoro queda sin respaldo documental.
- El idioma no aplica: es un codec sin vocabulario, de modo que la cobertura lingüística depende por completo del modelo que genere los códigos, no de este archivo.
- El modelo tiene 0 descargas y 0 valoraciones y se publicó el 27 de septiembre de 2026; no hay validación comunitaria independiente de su calidad ni de su estabilidad.
- El formato GGUF está atado al ecosistema loom.cpp y loom-py-rt: no es cargable directamente en llama.cpp, Ollama, vLLM o TGI.
- Rendimiento en CPU limitado: unos dos minutos por cada 30 segundos de audio en dos núcleos, lo que lo descarta para streaming en tiempo real sin GPU.
- Licencia apache-2.0, que permite uso comercial con las obligaciones habituales de atribución y conservación de avisos; conviene revisar igualmente las condiciones del modelo base del que se hereda.
- Ausencia de variantes cuantizadas: reducir el consumo de memoria exige cuantizar el modelo por cuenta propia, sin garantía de que el grafo exportado lo soporte sin pérdida de fidelidad.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/loom-ai-org/moss-audio-tokenizer-v2-loom
- Modelo base: https://huggingface.co/OpenMOSS-Team/MOSS-Audio-Tokenizer-v2
- Motor loom.cpp: https://github.com/loom-ai-org/loom.cpp
- Exportador loom-exporter: https://github.com/loom-ai-org/loom-exporter
- API de Python loom-py: https://github.com/loom-ai-org/loom-py
- Modelo TTS complementario: https://huggingface.co/loom-ai-org/moss-tts-local-transformer-v1.5-loom
- Nota sobre la busqueda web: las consultas realizadas devolvieron únicamente resultados de entidades sin relación con este modelo (la herramienta de grabación de pantalla Loom en loom.com y la marca de ropa Loom en loom.fr). No se han encontrado papers, blogs ni demos adicionales asociados a esta ficha.
