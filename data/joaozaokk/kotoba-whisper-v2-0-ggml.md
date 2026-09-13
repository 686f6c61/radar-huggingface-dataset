# JoaoZaokk/kotoba-whisper-v2.0-ggml

## Resumen

kotoba-whisper-v2.0-ggml es una reconversión al formato GGML del checkpoint kotoba-tech/kotoba-whisper-v2.0, un modelo de reconocimiento automático de habla (ASR) de la familia Whisper especializado en japonés. El repositorio lo publica el usuario JoaoZaokk y no introduce ningún entrenamiento nuevo: se limita a convertir y cuantizar los pesos originales para que puedan cargarse con whisper.cpp, la implementación en C/C++ del motor GGML. Se distribuyen cuatro variantes con tamaños de 1520 MB (f16), 818 MB (q8_0), 538 MB (q5_0) y 444 MB (q4_0).

El valor del repositorio es operativo, no algorítmico. El checkpoint upstream se distribuye en formato transformers (safetensors) y requiere Python y PyTorch para ejecutarse; esta conversión permite la transcripción on-device en CPU, GPU o dispositivos móviles sin esas dependencias, integrándose en aplicaciones nativas que embeben whisper.cpp. La model card indica explícitamente que el repositorio se mantiene para que los enlaces de descarga de las aplicaciones nativas Odysseus y Open WebUI se mantengan estables.

En el momento de la consulta el repositorio acumula 0 descargas y 0 likes, por lo que carece de validación comunitaria. La licencia Apache 2.0 del modelo base se conserva sin cambios, y el único idioma declarado es el japonés (ja).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder-decoder de la familia Whisper (el autor describe el modelo base como "a Whisper checkpoint"); no se detalla la configuracion concreta de capas, dimensiones ni cabezas de atencion en la informacion disponible |
| Parametros totales | no disponible (el fichero f16 de 1520 MB es compatible con un orden de magnitud de ~760 M de parametros, pero es una estimacion derivada del tamano de fichero y no esta confirmada por el autor) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible en la model card; Whisper procesa audio en ventanas de 30 segundos, pero no se documenta el detalle para esta conversion |
| Tipos de cuantizacion | f16, q8_0, q5_0, q4_0 (la model card menciona tambien q5_k como opcion "para movil", aunque no se publica ningun fichero con esa cuantizacion) |
| Idiomas soportados | japones (ja) |
| Licencia | Apache 2.0, sin cambios respecto al modelo base |
| Formato de pesos | GGML binario (`.bin`), cargable por whisper.cpp; las etiquetas del repositorio incluyen tambien `gguf` |

| Fichero | Cuantizacion | Tamano |
|---|---|---|
| `ggml-kotoba-whisper-v2.0-f16.bin` | f16 | 1520 MB |
| `ggml-kotoba-whisper-v2.0-q8_0.bin` | q8_0 | 818 MB |
| `ggml-kotoba-whisper-v2.0-q5_0.bin` | q5_0 | 538 MB |
| `ggml-kotoba-whisper-v2.0-q4_0.bin` | q4_0 | 444 MB |

## Arquitectura y entrenamiento

Esta ficha describe una conversion, no un entrenamiento. Segun la model card, los pesos se obtuvieron a partir del checkpoint upstream con el convertidor propio de whisper.cpp y posteriormente se cuantizaron con el cuantizador del mismo motor. El autor indica que cada variante se comprobo transcribiendo muestras cortas en portugues e ingles antes de subirlas; no se documenta ninguna validacion especifica sobre audio en japones, que es el unico idioma declarado del modelo. Tampoco se detallan datos de entrenamiento, numero de tokens, composicion del dataset ni si hubo RLHF o DPO, ya que esa informacion corresponderia al modelo base y no se reproduce en este repositorio.

La innovacion tecnica, en la medida en que existe, es la propia cuantizacion: `f16` es la conversion sin perdida declarada, `q8_0` se presenta como casi identica en precision con aproximadamente el 55 % del tamano, `q5_0` como la opcion "amigable para telefono" y `q4_0` como la mas pequena con un coste de precision reducido. Son afirmaciones cualitativas del autor; no se aportan curvas de WER ni mediciones cuantitativas que las respalden.

## Capacidades

- Reconocimiento automatico de habla en japones: transcripcion de audio a texto, que es la tarea declarada en el `pipeline_tag` del repositorio.
- Ejecucion on-device: al estar en formato GGML, el modelo se ejecuta con whisper.cpp sin necesidad de Python ni PyTorch.
- Despliegue con distintos presupuestos de memoria: cuatro cuantizaciones que cubren desde 1520 MB hasta 444 MB.
- Integracion en aplicaciones nativas que embeben whisper.cpp (el autor menciona Odysseus y Open WebUI como consumidores de estos enlaces de descarga).
- Compatibilidad con CPU, dado que whisper.cpp esta disenado para inferencia en CPU ademas de aceleracion por GPU.
- Tool calling / function calling: no soportado; no es un modelo de lenguaje conversacional.
- Capacidades de agente o razonamiento multi-paso: no soportadas / no aplicables.
- Vision: no soportada.
- Capacidades multilingues: no; el unico idioma declarado es ja. Se desconoce si el ajuste fino ha degradado la capacidad multilingue del Whisper original, porque no se publican evaluaciones al respecto.
- Traduccion de voz a ingles, marcas de tiempo a nivel de palabra u otras tareas auxiliares de Whisper: no documentadas en la informacion disponible para esta conversion.

## Casos de uso

- Subtitulado automatico de video en japones: el modelo transcribe la pista de audio y las marcas de tiempo pueden exportarse a SRT/VTT mediante whisper.cpp; la variante q5_0 permite ejecutar el proceso en un portatil sin GPU dedicada.
- Transcripcion de reuniones con requisitos de privacidad: al ejecutarse on-device no se envia audio a servicios externos, lo que encaja en entornos corporativos japoneses con restricciones de tratamiento de datos.
- Aplicaciones de escritorio nativas: cualquier cliente que embeba whisper.cpp puede cargar el fichero GGML directamente, sin empaquetar un runtime de Python, reduciendo el tamano y la complejidad de la distribucion.
- Despliegue en moviles y dispositivos de borde: con la variante q4_0 (444 MB) el modelo cabe en el almacenamiento y en la memoria de un telefono de gama media-alta, habilitando transcripcion sin conectividad.
- Indexacion y busqueda de archivos de audio en japones: transcripcion por lotes de un archivo de grabaciones y volcado del texto a un motor de busqueda o a un almacen vectorial para su consulta posterior.
- Analisis de llamadas en centros de contacto: transcripcion de conversaciones en japones para supervision de calidad, deteccion de incidencias y cumplimiento normativo, con los audios sin salir de la infraestructura propia.
- Accesibilidad: generacion de subtitulos en tiempo real para contenido hablado en japones en herramientas de videollamada o reproduccion local.
- Preprocesado de corpus de voz para aprendizaje automatico: transcripcion masiva de audio japones como paso previo al etiquetado de datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye cifras de WER, CER, MMLU ni de ningun otro conjunto de evaluacion, ni comparaciones numericas frente al checkpoint original. La unica referencia de validacion es cualitativa: el autor comenta que cada variante se comprobo transcribiendo muestras cortas en portugues e ingles.

## Requisitos de hardware

- VRAM/RAM para los pesos: aproximadamente el tamano de cada fichero, es decir, 1520 MB (f16), 818 MB (q8_0), 538 MB (q5_0) y 444 MB (q4_0), mas el estado del decodificador y los buffers de audio de whisper.cpp. El autor no publica cifras de consumo total ni de pico.
- GPU recomendadas: no se especifica ninguna. Cualquier GPU compatible con whisper.cpp (CUDA, Metal, Vulkan, ROCm segun la compilacion) puede ejecutar las cuatro variantes; las cuantizaciones q4_0 y q5_0 son las mas adecuadas para GPU de gama de entrada o para GPU integradas.
- Cabe en GPU de consumo: si. Con 444-818 MB de pesos, cualquier GPU de consumo actual (por ejemplo, la familia RTX xx60 en adelante) aloja el modelo con margen amplio, incluso compartiendo VRAM con otras tareas.
- Ejecucion solo en CPU: viable para las cuatro variantes; f16 sera la mas lenta y q4_0 la mas rapida en este escenario, a costa de precision.
- Opciones de despliegue: binario `whisper-cli` de whisper.cpp (`whisper-cli -m <fichero>`), modo servidor de whisper.cpp y cualquier aplicacion que embeba la libreria (entre ellas Odysseus y Open WebUI, segun el autor). No esta pensado para vLLM, TGI ni Ollama, que no cargan este formato.
- Latencia y throughput: no disponibles. No se publican mediciones de factor de tiempo real ni de tokens de audio por segundo en ningun hardware concreto.
- Almacenamiento: el repositorio completo ocupa 3,3 GB, pero en produccion solo es necesario descargar la variante elegida (entre 444 MB y 1520 MB).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Formato | Licencia | Rendimiento |
|---|---|---|---|---|---|---|
| Este repositorio (GGML, 4 cuantizaciones) | no disponible (estimacion por tamano de fichero: ~760 M) | no disponible | ja | GGML `.bin` para whisper.cpp | Apache 2.0 | sin benchmarks publicados |
| kotoba-tech/kotoba-whisper-v2.0 (modelo base) | no disponible en la informacion proporcionada | no disponible | ja | safetensors (transformers) | Apache 2.0 | sin datos en la informacion proporcionada |
| Otras conversiones GGML de checkpoints Whisper publicadas en whisper.cpp | no disponible | no disponible | segun el checkpoint de origen | GGML/GGUF | segun el checkpoint de origen | no disponible |

La comparativa relevante es entre este repositorio y su modelo base: comparten pesos y licencia, y la unica diferencia es el formato y la cuantizacion. Frente a conversiones GGML de Whisper multilingue, la diferencia esperable es de cobertura de idiomas (aqui solo ja), pero no hay datos de rendimiento publicados que permitan cuantificarla, por lo que no se establece ninguna comparacion numerica.

## Limitaciones y advertencias

- Monolingue: el unico idioma declarado es el japones. No debe esperarse un comportamiento correcto en castellano, ingles u otros idiomas, a pesar de que la validacion del autor se hizo con muestras en portugues e ingles.
- Ausencia total de benchmarks: no hay WER ni ninguna otra metrica publicada, ni frente al modelo original ni frente a las distintas cuantizaciones. La afirmacion de que `q8_0` es "casi identica" en precision a `f16` no esta respaldada por mediciones.
- Validacion inadecuada al idioma declarado: las comprobaciones descritas se hicieron con audio corto en portugues e ingles, no en japones, de modo que no hay evidencia publicada sobre el comportamiento real en la lengua objetivo.
- Riesgo de alucinacion: los modelos de la familia Whisper tienden a generar texto plausible en segmentos con silencio, ruido o habla ininteligible. No se documenta ningun mecanismo de mitigacion especifico en esta conversion; conviene aplicar umbrales de confianza y revision en produccion.
- Madurez y mantenimiento: 0 descargas y 0 likes en el momento de la consulta. El repositorio esta mantenido por un tercero no afiliado a kotoba-tech y se declara "sin garantia" ("No warranty").
- Cadena de custodia: los pesos son obras derivadas del modelo upstream y conservan su licencia. Para uso en produccion conviene considerar descargar el checkpoint original y ejecutar la conversion de forma controlada en lugar de depender de un artefacto de terceros.
- Inconsistencia en las etiquetas: el repositorio se etiqueta simultaneamente como `ggml` y `gguf`, pero los ficheros publicados son `.bin` de GGML. Hay que verificar la compatibilidad con la version concreta de whisper.cpp antes de integrarlo.
- Ambiguedad en las cuantizaciones recomendadas: la model card menciona `q5_k` como opcion "para movil" pero no publica ningun fichero con esa cuantizacion, lo que puede inducir a error.
- Fechas del repositorio: los metadatos indican creacion y actualizacion en septiembre de 2026, con apenas 26 segundos entre ambas; conviene tratarlas con cautela.
- Licencia: Apache 2.0 permite uso comercial y modificacion, siempre que se conserve el aviso de licencia y se atribuya a los autores originales (kotoba-tech) y al mantenedor de la conversion. No hay clausulas de uso restringido, pero tampoco garantias.
- La busqueda web realizada no devolvio informacion tecnica relevante sobre el modelo: los resultados obtenidos correspondian a la pagina de un centro comercial y no guardan relacion con el repositorio.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/JoaoZaokk/kotoba-whisper-v2.0-ggml
- Modelo base: https://huggingface.co/kotoba-tech/kotoba-whisper-v2.0
- Organizacion del modelo original (kotoba-tech): https://huggingface.co/kotoba-tech
- Motor de inferencia whisper.cpp: https://github.com/ggml-org/whisper.cpp
- Perfil del mantenedor de la conversion: https://huggingface.co/JoaoZaokk
- Paper, blog o demo adicionales: no disponibles; la busqueda web no devolvio resultados relevantes sobre el modelo.
