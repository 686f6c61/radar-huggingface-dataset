# otter-app/parakeet-tdt-0.6b-v3-he-gguf

## Resumen

parakeet-tdt-0.6b-v3-he-gguf es una distribucion en formato GGUF del modelo de reconocimiento automatico del habla (ASR) parakeet-tdt-0.6b-v3-he, publicado por el usuario otter-app como artefacto que la aplicacion Otter descarga bajo demanda. El modelo es una copia sin modificar de vibe-app/parakeet-tdt-0.6b-v3-he-gguf, a su vez convertida desde thewh1teagle/parakeet-tdt-0.6b-v3-he, que constituye el modelo base real. No se trata por tanto de un modelo entrenado por otter-app, sino de una redistribucion de pesos ya convertidos.

La arquitectura subyacente corresponde a la familia Parakeet de NVIDIA, concretamente una variante con decodificacion TDT (Token-and-Duration Transducer), segun indica el propio nombre del checkpoint. El modelo cuenta con 628.351.100 parametros totales (aproximadamente 0,6 mil millones), lo que lo situa en la gama ligera de modelos ASR y lo hace apto para inferencia en CPU o GPU de consumo.

Su relevancia practica radica en el formato: al estar empaquetado como GGUF para la libreria ggml, puede ejecutarse en entornos sin dependencias de CUDA ni de frameworks de deep learning pesados, lo que facilita su integracion en aplicaciones de escritorio como Otter. La licencia declarada es CC-BY-4.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tipo transducer con decodificacion TDT (Token-and-Duration Transducer), segun nomenclatura del checkpoint; detalles internos no disponibles |
| Parametros totales | 628.351.100 |
| Parametros activos | no disponible (no es un modelo MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF; el repositorio incluye al menos la variante q8_0 (parakeet-tdt-0.6b-v3-he-q8_0.gguf); no se detallan otras |
| Idiomas soportados | no disponible (el sufijo "he" del nombre podria sugerir hebreo, pero no se confirma en la informacion disponible) |
| Licencia | cc-by-4.0 |
| Formato de pesos | GGUF (libreria ggml) |

## Arquitectura y entrenamiento

El modelo base es thewh1teagle/parakeet-tdt-0.6b-v3-he, derivado de la familia Parakeet de NVIDIA. El nombre del checkpoint indica el uso de decodificacion TDT (Token-and-Duration Transducer), un esquema de transducer que predice conjuntamente tokens y duraciones, lo que permite decodificacion no autoregresiva por saltos y reduce el coste computacional frente a transducers clasicos. La informacion proporcionada no detalla la configuracion interna de capas, dimensiones ocultas ni el mecanismo de atencion exacto.

No se dispone de datos sobre el volumen de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de ajuste como RLHF o DPO (poco habituales en modelos ASR). Tampoco se documenta el proceso de conversion a GGUF mas alla de la cadena de redistribuciones indicada. La unica innovacion tecnica verificable a partir de la informacion disponible es el propio esquema TDT y el empaquetado en ggml para inferencia ligera.

## Capacidades

- Reconocimiento automatico del habla (ASR): tarea principal del pipeline declarado, automatic-speech-recognition.
- Transcripcion de audio a texto mediante inferencia con la libreria ggml/GGUF.
- Ejecucion en entornos ligeros sin necesidad de stack CUDA completo, al estar empaquetado en GGUF.
- Integracion como descarga bajo demanda en la aplicacion de escritorio Otter.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible (no es un modelo de lenguaje generativo de proposito general).
- Capacidades multilingues: no disponible; no se confirma el conjunto de idiomas.
- Capacidades especiales (vision, audio nativo mas alla de ASR, modo thinking): no disponible.

## Casos de uso

- Transcripcion de reuniones en aplicaciones de escritorio: el modelo puede integrarse en herramientas como Otter para convertir audio de reuniones en texto, aprovechando su formato GGUF para ejecutarse localmente sin depender de servicios en la nube.
- Subtitulado automatico de video: al ser un modelo ASR ligero de 0,6 mil millones de parametros, es viable generar subtitulos en pipelines de postproduccion con requisitos de hardware modestos.
- Dictado por voz en editores de texto: su tamano reducido permite incorporarlo en aplicaciones de escritorio que transcriben voz a texto en tiempo real en la maquina del usuario.
- Indexacion y busqueda de archivos de audio: transcripcion masiva de grabaciones para generar indices de texto buscables, donde el coste por hora de audio es determinante y un modelo de 0,6 B resulta economico.
- Accesibilidad: generacion de transcripciones en vivo para personas con discapacidad auditiva en entornos locales, sin enviar audio a terceros.
- Procesamiento por lotes en CPU: al estar en formato GGUF y ser compatible con ggml, puede desplegarse en servidores sin GPU para transcripcion por lotes de archivos de audio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. Como referencia orientativa a partir del recuento de parametros (628 M) y del tamano del repositorio (0,8 GB), la variante q8_0 ocupa del orden de 0,6-0,7 GB en disco y requiere una cantidad de memoria similar para los pesos; el consumo total depende del buffer de audio y del runtime de ggml.
- GPU recomendadas: no disponible en la informacion proporcionada. Por tamano, cualquier GPU con al menos 2 GB de memoria libre deberia poder alojar los pesos; no se confirma compatibilidad especifica con A100, H100 o RTX 4090.
- GPU de consumo: previsiblemente cabe en GPU de consumo de gama baja y media por el tamano de los pesos, aunque no se documenta soporte oficial.
- CPU: el formato ggml/GGUF esta disenado para inferencia en CPU, por lo que es la opcion natural de despliegue.
- Opciones de despliegue: llama.cpp y runtimes basados en ggml; la aplicacion Otter lo descarga bajo demanda. No se confirma soporte en vLLM, TGI, Ollama u otros servidores.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| parakeet-tdt-0.6b-v3-he-gguf (este) | 628.351.100 | no disponible | GGUF | CC-BY-4.0 | Hugging Face, descarga bajo demanda en Otter |
| thewh1teagle/parakeet-tdt-0.6b-v3-he (modelo base) | no disponible en la informacion | no disponible | no disponible | no disponible en la informacion | Hugging Face |
| vibe-app/parakeet-tdt-0.6b-v3-he-gguf (origen de la copia) | no disponible en la informacion | no disponible | GGUF | no disponible en la informacion | Hugging Face |
| OpenAI Whisper (referencia de categoria ASR) | no disponible en la informacion | no disponible | no disponible | no disponible en la informacion | no disponible |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Es una redistribucion, no un modelo original: la responsabilidad sobre el comportamiento del modelo recae en el modelo base thewh1teagle/parakeet-tdt-0.6b-v3-he, cuya model card y licencia deben revisarse antes de su uso.
- Idiomas soportados no confirmados: el sufijo "he" del nombre podria indicar hebreo, pero no se documenta; usar el modelo con idiomas no verificados puede degradar gravemente la transcripcion.
- Riesgo de alucinacion en ASR: como todo modelo de transcripcion, puede generar texto plausible que no corresponde al audio, especialmente con ruido de fondo, acentos no vistos en entrenamiento o audio de baja calidad.
- Sesgos: no documentados en la informacion disponible; los modelos ASR suelen presentar diferencias de error entre acentos, dialectos y grupos demograficos.
- Licencia CC-BY-4.0: permite uso comercial con atribucion; es necesario citar correctamente al autor y revisar si el modelo base impone condiciones adicionales.
- Repositorio sin traccion: 0 descargas y 0 likes en el momento de la consulta, sin garantias de mantenimiento ni soporte.
- Cuantizacion limitada documentada: solo se confirma la variante q8_0 y su hash SHA-256; no se detallan otras cuantizaciones ni su impacto en la calidad.
- Contexto de audio maximo: no disponible; no se especifica la duracion maxima de audio procesable por segmento.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/otter-app/parakeet-tdt-0.6b-v3-he-gguf
- Modelo base: https://huggingface.co/thewh1teagle/parakeet-tdt-0.6b-v3-he
- Repositorio origen de la copia GGUF: https://huggingface.co/vibe-app/parakeet-tdt-0.6b-v3-he-gguf
- Aplicacion Otter: https://github.com/victorfu/otter
