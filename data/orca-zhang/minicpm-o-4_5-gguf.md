# orca-zhang/MiniCPM-o-4_5-gguf

## Resumen

El repositorio `orca-zhang/MiniCPM-o-4_5-gguf` contiene un proyector de visión cuantizado en Q6_K para el modelo multimodal MiniCPM-o 4.5 de OpenBMB. El proyector, con un peso de 731 MB, se distribuye como un archivo GGUF independiente que debe combinarse con el modelo principal `openbmb/MiniCPM-o-4_5-gguf` para habilitar el procesamiento de imágenes. MiniCPM-o 4.5 es un modelo omni-modal de 9 000 millones de parámetros que integra visión, audio y texto en una arquitectura unificada, basada en SigLIP2, Whisper-medium, CosyVoice2 y Qwen3-8B.

La relevancia de este repositorio radica en que permite ejecutar el modelo completo en tarjetas gráficas de consumo con poca memoria, como una RTX 3050 de 6 GiB, gracias a la cuantización Q6_K del proyector (con tensores no soportados que caen a F16/Q8). El autor valida el funcionamiento con el modelo principal en cuantización Q4_K_M, reportando 5,07 segundos por imagen y 29,36 tokens por segundo de decodificación, sin errores ni OOM en 48 ejecuciones.

La licencia es Apache-2.0, lo que permite uso comercial con las restricciones que imponga el modelo base de OpenBMB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Proyector de vision cuantizado para MiniCPM-o 4.5 (SigLIP2 + Whisper-medium + CosyVoice2 + Qwen3-8B) |
| Parametros totales | 526.770.416 (proyector de vision) / 9.000.000.000 (modelo completo) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (depende del modelo base; el repo de OpenBMB indica 32.768 tokens) |
| Tipos de cuantizacion | Q6_K (proyector); el modelo principal se distribuye en Q4_K_M, Q5_K_M, Q6_K, Q8_0 |
| Idiomas soportados | no disponible (el modelo base de OpenBMB soporta ingles, chino y otros idiomas via Qwen3) |
| Licencia | Apache-2.0 (proyector); el modelo base de OpenBMB usa su propia licencia |
| Formato de pesos | GGUF (proyector y modelo base) |

## Arquitectura y entrenamiento

MiniCPM-o 4.5 es un modelo omni-modal entrenado de forma end-to-end que combina un codificador de vision SigLIP2, un codificador de audio Whisper-medium, un decodificador de voz CosyVoice2 y un LLM base Qwen3-8B. La innovacion clave es el framework **Omni-Flow**, que alinea entradas y salidas omni-modales a lo largo de un eje temporal compartido, permitiendo interacciones full-duplex en tiempo real (el modelo puede percibir y responder simultaneamente).

El proyector de vision contenido en este repositorio es una cuantizacion Q6_K de los tensores del proyector original de OpenBMB. El cuantizador empleado es llama.cpp build 10615, y los tensores que no soportan K-quant se mantienen en F16/Q8. El peso efectivo es de ~11,11 bits por peso, lo que reduce el tamano del proyector de ~1,4 GB a ~731 MB sin perdida significativa de calidad. El proyector se ha validado con el modelo principal en cuantizacion Q4_K_M, con Flash Attention y cache KV en Q8.

El entrenamiento del modelo base no se detalla en la informacion disponible, pero el paper menciona mejoras significativas frente a la serie anterior MiniCPM-o 2.6, incluyendo nuevas capacidades de audio a audio y comprension de imagenes de alta resolucion.

## Capacidades

- **Vision**: procesamiento de imagenes de alta resolucion (768x768 validado), descripcion de imagenes, respuesta a preguntas visuales, OCR y razonamiento visual.
- **Audio**: entrada y salida de audio en tiempo real (full-duplex), transcripcion de voz, generacion de voz con CosyVoice2.
- **Texto**: generacion de texto, razonamiento, codigo y conversacion multilingue basada en Qwen3-8B.
- **Tool calling / function calling**: heredado de Qwen3-8B, soporta llamadas a herramientas y uso de APIs.
- **Agentes y multi-step reasoning**: soporta razonamiento en multiples pasos y encadenamiento de herramientas.
- **Multilingue**: hereda las capacidades de Qwen3, con soporte principal para ingles y chino, aunque puede generalizar a otros idiomas.
- **Modo full-duplex**: interaccion en tiempo real, percibe y responde simultaneamente, lo que habilita conversaciones naturales sin turnos estrictos.

## Casos de uso

- **Asistentes de voz en tiempo real**: el modelo puede mantener conversaciones de voz bidireccionales con latencia baja gracias a Omni-Flow y a la salida de voz de CosyVoice2. Es adecuado para asistentes embebidos en dispositivos con GPU de baja memoria.
- **Descripcion de imagenes para accesibilidad**: el proyector de vision cuantizado permite ejecutar el modelo en tarjetas de 6 GB, por lo que puede integrarse en aplicaciones de escritorio o portatiles para generar descripciones de imagenes en tiempo real.
- **OCR y extraccion de informacion de documentos**: con la vision de alta resolucion, el modelo puede extraer texto de imagenes y tablas, ideal para automatizar la entrada de datos en flujos de trabajo.
- **Agentes conversacionales con contexto visual**: gracias al tool calling de Qwen3 y al soporte de vision, se pueden construir agentes que reciban capturas de pantalla, las interpreten y ejecuten acciones (p. ej., automatizacion de interfaces).
- **Analisis de video en tiempo real**: con la capacidad de procesar imagenes a ~5,1 segundos por imagen en una RTX 3050, es viable analizar secuencias de video para vigilancia o monitorizacion industrial.
- **Transcripcion y resumen de reuniones**: el modelo puede transcribir audio de reuniones y generar resumenes estructurados, con la ventaja de que la salida de voz permite respuestas auditivas.
- **Prototipado rapido de aplicaciones multimodales**: al ser GGUF, se puede integrar en llama.cpp o Ollama para prototipar aplicaciones de chat con vision y audio sin necesidad de infraestructura cloud.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks (MMLU, HumanEval, etc.) en la informacion disponible para este proyector especifico. El paper de MiniCPM-o 4.5 reporta mejoras significativas respecto a la version 2.6 en tareas de vision y audio, pero los numeros concretos no se incluyen en la documentacion del repositorio.

En cuanto al rendimiento de inferencia, el autor del repositorio valida el proyector con el modelo principal Q4_K_M en una RTX 3050 de 6 GB con los siguientes resultados:

| Metrica | Valor |
|---|---|
| Tiempo medio por imagen | 5,07 s |
| Percentil 95 por imagen | 5,64 s |
| Velocidad de decodificacion | 29,36 tokens/s |
| Memoria GPU usada | 5505 MiB |
| Ejecuciones de prueba | 48/48 sin errores |

## Requisitos de hardware

- **VRAM minima**: 6 GiB (validado en RTX 3050). Con el proyector Q6_K y el modelo principal Q4_K_M, el uso de memoria es de ~5,5 GB.
- **GPU recomendadas**: RTX 3050 o superior con 6 GB o mas de VRAM. Para mayor velocidad, una RTX 4060 Ti 16 GB o RTX 4090 permiten ventanas de contexto mayores y mas imagenes por segundo.
- **Compatibilidad consumer**: si, cabe en GPUs de gama de entrada con 6 GB de VRAM (RTX 3050, GTX 1660 Ti, RTX 2060) si se usa cuantizacion Q4_K_M y contexto de 1536 tokens.
- **Opciones de despliegue**: llama.cpp (build 10615 o superior), llama-server con CUDA, Ollama (si se convierte el proyector a un formato compatible), y TGI (si se usa el modelo completo en GGUF).
- **Latencia**: 5,1 segundos por imagen de media en RTX 3050; decodificacion a 29 tokens/s. En GPUs de mayor gama, se esperan mejoras de 2-3x.
- **Nota**: el proyector por si solo no es suficiente; se necesita el modelo principal `openbmb/MiniCPM-o-4_5-gguf` en formato GGUF.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Vision | Audio | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| MiniCPM-o 4.5 (con este proyector) | 9B | 32.768 (aprox.) | Si | Si | Apache-2.0 (proyector) | GGUF |
| Qwen2-VL-7B | 7B | 32.768 | Si | No | Apache-2.0 | Transformers, GGUF |
| LLaVA-NeXT-8B | 8B | 32.768 | Si | No | Apache-2.0 | Transformers |
| Phi-3.5-vision | 4.2B | 128K | Si | No | MIT | Transformers |

La principal diferencia frente a alternativas como Qwen2-VL o LLaVA es la integracion de audio bidireccional y la capacidad de interaccion en tiempo real. MiniCPM-o 4.5 es el unico de la comparativa que ofrece full-duplex con salida de voz. En terminos de requisitos de hardware, el proyector cuantizado permite ejecutar el modelo en GPUs de 6 GB, mientras que Qwen2-VL-7B suele necesitar 8-10 GB en cuantizacion similar.

## Limitaciones y advertencias

- **Es un proyector, no un modelo completo**: este repositorio solo contiene el proyector de vision cuantizado. Para usarlo, hay que descargar el modelo base `openbmb/MiniCPM-o-4_5-gguf` y combinarlos con llama.cpp.
- **Sesgos heredados**: el modelo base Qwen3-8B y los componentes de vision/audio pueden heredar sesgos de genero, raza o idioma de los datos de entrenamiento. No se ha evaluado especificamente el sesgo de esta cuantizacion.
- **Riesgo de alucinacion**: como cualquier LLM, puede generar descripciones de imagen o respuestas de voz incorrectas. Se recomienda validacion humana en aplicaciones criticas.
- **Limitaciones de contexto**: el contexto de 32.768 tokens es inferior a modelos como Qwen2.5-72B (128K) o Gemma 3 (128K). Para conversaciones largas o documentos extensos, puede quedarse corto.
- **Idiomas**: aunque Qwen3 soporta multiples idiomas, el modelo se entrena principalmente en ingles y chino. El rendimiento en otros idiomas puede ser inferior.
- **Restricciones de licencia**: el proyector es Apache-2.0, pero el modelo base de OpenBMB tiene su propia licencia que puede incluir restricciones de uso comercial. Consultar los terminos de OpenBMB antes de desplegar en produccion.
- **Cuantizacion**: la cuantizacion Q6_K del proyector reduce la precision en comparacion con el proyector original F16. En tareas de vision de alta precision (OCR fino, deteccion de objetos pequeños), puede haber una degradacion leve.
- **Rendimiento en CPU**: no se ha validado el modelo en CPU. La inferencia sin GPU seria muy lenta (probablemente >30 s por imagen) y no recomendable para uso interactivo.
- **Dependencia de llama.cpp**: se requiere una version de llama.cpp superior a la 10615 para soportar el proyector GGUF y la arquitectura de vision.

## Enlaces

- Repositorio del proyector: [orca-zhang/MiniCPM-o-4_5-gguf](https://huggingface.co/orca-zhang/MiniCPM-o-4_5-gguf)
- Modelo base oficial: [openbmb/MiniCPM-o-4_5-gguf](https://huggingface.co/openbmb/MiniCPM-o-4_5-gguf)
- Paper: [MiniCPM-o 4.5: Towards Real-Time Full-Duplex Omni-Modal](https://arxiv.org/abs/2604.27393)
- Demo oficial: [OpenBMB/MiniCPM-o-Demo](https://github.com/OpenBMB/MiniCPM-o-Demo/)
- Serie MiniCPM-V: [OpenBMB/MiniCPM-V](https://github.com/OpenBMB/MiniCPM-V)
- Documentacion de llama.cpp: [ggml-org/llama.cpp](https://github.com/ggml-org/llama.cpp)
