# damianpy/Qwen3.8-Flash-Next-Uncensored-oQ3e-mtp-MLX

## Resumen

Qwen3.8-Flash-Next-Uncensored-oQ3e-mtp-MLX es una build cuantizada a 3 bits del modelo Qwen3.8-Flash-Next-Uncensored, publicada por el usuario damianpy (BIM Computing) para ejecucion local en Apple Silicon mediante la libreria MLX. El modelo base, ddark-il/Qwen3.8-Flash-Next-Uncensored, es una variante "uncensored" (sin los filtros de rechazo habituales) de la familia Qwen3.8, y esta build concreta esta pensada para una unica maquina con 128 GB de memoria unificada, ocupando 86 GB en disco.

La build conserva la cabeza MTP (multi-token prediction) para decodificacion especulativa y aplica YaRN con factor x2, lo que situa la ventana de contexto declarada en 524.288 tokens segun el `config.json` del autor. Se genero con la herramienta oMLX 0.8.2 mediante `quantize_oq_streaming(level=3, enhanced=True, preserve_mtp=True)` partiendo de una build MLX de 4,8 bpw expandida previamente a bf16.

El interes de esta ficha es practico: documenta una receta de cuantizacion agresiva (3 bits) para un modelo de ~180.000 millones de parametros, con instrucciones de ejecucion concretas (oMLX 0.8.2, cache KV a 4 bits con cuantizacion afina, MTP activado) y mediciones realizadas en un MacBook Pro M5 Max de 128 GB. La licencia declarada es Apache 2.0. No hay pipeline declarado ni idiomas especificados en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.8, variante "Flash-Next"), con cabeza MTP para decodificacion especulativa; no disponible el detalle exacto de capas y atencion |
| Parametros totales | 179.999.981.459 (~180.000 millones), segun safetensors |
| Parametros activos | no disponible (no se indica que sea MoE en la informacion proporcionada) |
| Longitud de contexto | 524.288 tokens (YaRN x2 aplicado en `config.json`) |
| Tipos de cuantizacion | 3 bits (oQ3e, oMLX nivel 3 con `enhanced=True`); cache KV a 4 bits (affine4) en la receta de ejecucion |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria mlx); tamano del repo 92,6 GB, 86 GB en disco |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base mas alla de su pertenencia a la familia Qwen3.8 (transformer) y de la presencia de una cabeza MTP conservada en esta build. La cabeza MTP habilita decodificacion especulativa: el modelo predice varios tokens por paso y un verificador los valida, lo que en la practica aumenta el throughput de generacion cuando la verificacion acierta. El autor indica explicitamente que la build se genero preservando esa cabeza (`preserve_mtp=True`).

Respecto al entrenamiento, no se han publicado en la informacion proporcionada datos sobre numero de tokens, composicion del dataset, ni si hubo RLHF, DPO u otras fases de alineamiento. La etiqueta "uncensored" del modelo base sugiere que se ha reducido o eliminado el entrenamiento de rechazo, pero no se documenta el procedimiento. La innovacion tecnica destacable de esta build es la propia receta de cuantizacion: partir de una build MLX de 4,8 bpw, expandirla a bf16 y recuantizar con oMLX a 3 bits en modo streaming, conservando la cabeza MTP y aplicando YaRN x2 para extender el contexto hasta 524.288 tokens.

## Capacidades

- Generacion de texto autoregresiva con contexto largo: la ventana declarada de 524.288 tokens permite procesar documentos extensos o conversaciones muy largas en una sola pasada.
- Decodificacion especulativa mediante la cabeza MTP conservada, orientada a reducir la latencia de generacion en hardware Apple Silicon.
- Modo "uncensored": el modelo base esta ajustado para no aplicar los filtros de rechazo tipicos de los modelos alineados, lo que amplia el rango de respuestas pero incrementa el riesgo de contenido problematico.
- Razonamiento y generacion de codigo: capacidades heredadas de la familia Qwen3.8; no se dispone de evaluaciones especificas en la informacion proporcionada.
- Soporte de tool calling y function calling: no confirmado en la informacion disponible.
- Soporte de agentes y razonamiento multi-paso: no confirmado en la informacion disponible.
- Capacidades multilingues: no disponibles.
- Capacidades de vision o audio: no disponibles.

## Casos de uso

- Procesamiento de documentos largos en local: con 524.288 tokens de contexto, el modelo puede ingerir libros tecnicos, expedientes o bases de codigo completas en una sola ventana, sin necesidad de trocear el contenido, en un Mac con 128 GB de memoria unificada.
- Asistencia de programacion en estacion de trabajo Apple: la build MLX se ejecuta de forma nativa en Apple Silicon, lo que permite integrarla en flujos de trabajo de desarrollo sin depender de la nube ni de GPUs dedicadas.
- Investigacion sobre cuantizacion extrema: la receta oQ3e a 3 bits con preservacion de MTP sirve como referencia reproducible para estudiar la perdida de calidad al comprimir modelos de ~180.000 millones de parametros.
- Generacion creativa sin restricciones de rechazo: el caracter "uncensored" del modelo base lo hace adecuado para escritura de ficcion, guiones o ejercicios creativos donde los filtros de seguridad estandar interfieren; requiere supervision humana por el riesgo de contenido.
- Evaluacion comparativa de runtimes: el autor publica una comparativa entre oMLX y otra pila (denominada "strata" en el repositorio) con mediciones de velocidad y precision, util para decidir el stack de inferencia en Mac.
- Prototipado de agentes con decodificacion especulativa: la cabeza MTP permite medir en hardware de consumo el impacto del speculative decoding en tareas de generacion larga, como resumenes o traduccion por lotes.
- Analisis de corpus privados sin salida a internet: al ejecutarse integramente en local, el modelo permite tratar datos sensibles (legal, sanitario, interno) sin enviarlos a servicios externos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor remite a su repositorio de GitHub para consultar las mediciones de velocidad y precision realizadas en un MacBook Pro M5 Max de 128 GB, pero los valores concretos no se incluyen en la model card proporcionada.

## Requisitos de hardware

- Memoria: la build ocupa 86 GB en disco y esta disenada para una maquina con 128 GB de memoria unificada; el repo completo pesa 92,6 GB.
- Hardware de referencia: MacBook Pro con chip M5 Max y 128 GB, segun las mediciones del autor (BIM Computing).
- GPU dedicadas: no se documenta soporte para CUDA; la build es especifica de MLX y Apple Silicon.
- GPU de consumo: no aplica en el sentido habitual (RTX 4090, etc.); el requisito es un Mac con memoria unificada suficiente, y 128 GB es el minimo practico indicado por el autor.
- Despliegue: oMLX 0.8.2, con cache KV a 4 bits (affine4) y MTP activado. No se mencionan vLLM, llama.cpp, Ollama ni TGI para esta build.
- Latencia y throughput: no disponibles en la informacion proporcionada; el autor enlaza a su repositorio para consultar las cifras medidas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next-Uncensored-oQ3e-mtp-MLX (esta ficha) | ~180.000 M | 524.288 (YaRN x2) | 3 bits (oQ3e) | Apache 2.0 | Hugging Face, MLX |
| ddark-il/Qwen3.8-Flash-Next-Uncensored (base) | no disponible | no disponible | bf16 / otras | no disponible en esta ficha | Hugging Face |
| Build MLX de 4,8 bpw del mismo modelo (origen de la cuantizacion) | ~180.000 M | no disponible | 4,8 bpw | Apache 2.0 (heredada) | Referenciada por el autor, no enlazada |

No se dispone de datos de rendimiento comparado entre estas variantes en la informacion proporcionada, por lo que la comparativa se limita a parametros, contexto, cuantizacion y licencia.

## Limitaciones y advertencias

- La cuantizacion a 3 bits es agresiva: es esperable una degradacion de calidad frente al modelo en bf16 o a 4,8 bpw, especialmente en tareas de razonamiento y codigo; no se aportan metricas de esa perdida en la informacion disponible.
- El modelo base es "uncensored": puede generar contenido que los modelos alineados rechazarian. Requiere filtros y supervision propios si se usa en produccion orientada al publico.
- Riesgo de alucinacion: no se documenta ninguna evaluacion de factualidad; al ser una variante sin alineamiento de rechazo, la verificacion de hechos corre por cuenta del integrador.
- Idiomas soportados: no disponibles; no se puede garantizar un rendimiento multilingue concreto.
- Restricciones de licencia: la build declara Apache 2.0, pero conviene verificar la licencia del modelo base y de los pesos originales de Qwen3.8 antes de un uso comercial, dado que la cadena de derivacion incluye varias builds intermedias.
- Dependencia de hardware: la build solo es utilizable con MLX en Apple Silicon con memoria unificada suficiente; no es portable a CUDA sin reconvertir los pesos.
- El contexto de 524.288 tokens depende de YaRN x2; el rendimiento real en ventanas muy largas no esta medido en la informacion disponible y el coste de memoria de la cache KV crece con el contexto (mitigado aqui con cache a 4 bits).
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta: no hay validacion de la comunidad sobre esta build concreta.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/damianpy/Qwen3.8-Flash-Next-Uncensored-oQ3e-mtp-MLX
- Modelo base: https://huggingface.co/ddark-il/Qwen3.8-Flash-Next-Uncensored
- Repositorio con setup, scripts y mediciones: https://github.com/damianpy-BIM/tested-on-bim-hardware/tree/main/qwen3.8-flash-next-uncensored-macbook-strata-vs-omlx
- BIM Computing: https://www.bim-computing.com
