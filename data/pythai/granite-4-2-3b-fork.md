# PYTHAI/granite-4.2-3b-fork

## Resumen

Granite-4.2-3B es un modelo de lenguaje decoder-only de tipo dense transformer desarrollado por el equipo Granite de IBM, presentado como el miembro compacto de la familia Granite 4.2. Con 3.000 millones de parametros, esta disenado especificamente para tareas de razonamiento: incorpora de forma nativa un modo de cadena de pensamiento delimitado por las etiquetas `<think>...</think>`, que se puede activar o desactivar por consulta. La ventana de contexto nativa es de 128K tokens, con una extension declarada hasta 512K, y esta publicado bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones.

La ficha que nos ocupa, `PYTHAI/granite-4.2-3b-fork`, no es un modelo entrenado por su autor, sino un fork de puntero (*licence-locked pointer fork*) del repositorio `ibm-granite/granite-4.2-3b` en el commit `e459acceac81e5fe67c07d9cfc72329a332e7eb1`, capturado el 13 de septiembre de 2026. El repositorio preserva la licencia, la configuracion, el tokenizador y el codigo de ese commit exacto, con los digests SHA-256 en `FORK.json`, pero **no almacena ningun peso**: los dos ficheros de pesos (7,3 GB) permanecen en el repositorio original. El objetivo declarado es fijar la version concreta de la licencia y la configuracion, no redistribuir el modelo.

Esto lo convierte en un artefacto de trazabilidad mas que en un modelo listo para descargar y ejecutar. Para usar Granite-4.2-3B hay que cargar los pesos desde `ibm-granite/granite-4.2-3b` con la revision fijada, tal como indica el propio autor del fork. Su relevancia practica esta, por tanto, en la verificacion de licencias y en la reproducibilidad de versiones dentro de pipelines con requisitos de auditoria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso, clase `GraniteForCausalLM` |
| Parametros totales | 3B (aproximadamente 3.000 millones) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 128K tokens de forma nativa; extension de contexto largo hasta 512K |
| Tipos de cuantizacion | no disponible en la informacion proporcionada (el modelo se publica en bfloat16) |
| Idiomas soportados | en, de, es, fr, ja, pt, ar, cs, it, ko, nl, zh (12 idiomas probados; otros pueden funcionar sin validacion completa) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (2 ficheros, 7,3 GB en el repositorio de origen; este fork no almacena pesos) |
| Libreria | transformers |
| Pipeline | text-generation |
| Modelo base | ibm-granite/granite-4.1-3b-base |
| Precision | bfloat16 |
| Tamano de embedding | 2560 |
| Numero de capas | 40 |
| Tamano de cabeza de atencion | 64 |
| Fecha de publicacion | 25 de agosto de 2026 |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura transformer decoder-only densa. Los componentes declarados en la model card son: atencion con Grouped Query Attention (GQA) de 40 cabezas de atencion y 8 cabezas KV; embeddings posicionales rotatorios (RoPE) con theta = 10.000.000, valor habitual para soportar contextos muy largos; bloque feed-forward MLP con activacion SwiGLU y tamano oculto de 8192; normalizacion RMSNorm con epsilon de 1e-5; y embeddings de entrada y salida separados (no atados). La dimension de embedding es 2560 y el modelo tiene 40 capas. La precision de publicacion es bfloat16.

La novedad principal de la generacion 4.2 es el razonamiento nativo: el modelo genera una cadena de pensamiento antes de la respuesta final y permite elegir entre modo de pensamiento completo (por defecto), modo sin pensamiento y modo de esfuerzo bajo, de forma que se puede ajustar la relacion entre profundidad de razonamiento y latencia por consulta. El modelo base sobre el que se construye es Granite-4.1-3B-Base, y se declara tambien soporte de tool calling aumentado con razonamiento, es decir, el modelo argumenta que herramienta invocar y por que antes de emitir la llamada.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF, DPO u otras fases de alineacion posteriores al preentrenamiento. El README proporcionado esta truncado y no incluye la seccion de datos de entrenamiento.

## Capacidades

- Generacion de texto conversacional en 12 idiomas probados (ingles, aleman, castellano, frances, japones, portugues, arabe, checo, italiano, coreano, neerlandes y chino).
- Razonamiento explicito mediante cadena de pensamiento integrada en `<think>...</think>`, orientada a matematicas, logica multi-paso y codigo.
- Tres modos de pensamiento conmutables en el mismo modelo: completo (por defecto), sin pensamiento y esfuerzo bajo.
- Tool calling y function calling, con razonamiento previo sobre la seleccion de herramientas (razonamiento aumentado con herramientas).
- Flujos agenticos y razonamiento multi-paso, apoyados en la ventana de contexto extendida.
- Procesamiento de documentos largos y conversaciones multi-turno gracias a los 128K tokens nativos y la extension a 512K.
- Generacion de codigo, segun la model card, dentro del apartado de usos recomendados.
- No se declara soporte de vision ni de audio en la informacion disponible.

## Casos de uso

- Razonamiento matematico asistido: el modo de pensamiento completo permite al modelo desglosar problemas de varios pasos antes de dar la solucion, lo que resulta util en herramientas educativas o de verificacion de calculos donde se necesita ver el razonamiento intermedio.
- Generacion y revision de codigo en produccion: al soportar tool calling, se puede integrar en pipelines de CI/CD para invocar linters, ejecutar tests o consultar documentacion de API como parte del propio flujo de generacion, con la cadena de pensamiento visible para depuracion.
- Agentes autonomos de varios pasos: la combinacion de razonamiento nativo y contexto de 128K permite mantener el historial completo de una tarea agentica larga (varias docenas de llamadas a herramientas) sin truncar el estado intermedio.
- Atencion al cliente multilingue: con 12 idiomas probados y contexto largo, el modelo puede gestionar conversaciones multi-turno con historial extenso y cambiar de idioma dentro del mismo hilo sin reentrenamiento.
- Analisis de documentos extensos: contratos, informes tecnicos o expedientes que superen los 100K tokens caben en la ventana nativa; la extension a 512K permite casos de ingestion masiva en un unico paso.
- Clasificacion y extraccion de informacion con razonamiento previo: el modo de esfuerzo bajo permite usos de alto volumen donde la latencia importa mas que la profundidad del razonamiento, mientras que el modo completo se reserva para los casos ambiguos.
- Auditoria de licencias y reproducibilidad: dado que este fork fija licencia, configuracion y tokenizador de un commit concreto con digests SHA-256, sirve para verificar que la version desplegada en produccion corresponde exactamente a una revision auditada del modelo original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card proporcionada esta truncada y no incluye la tabla de evaluaciones (MMLU, HumanEval, GSM8K u otras) que suele acompanar a este tipo de publicaciones, ni los resultados de busqueda web contienen datos de rendimiento del modelo.

## Requisitos de hardware

Las cifras de VRAM que siguen son estimaciones derivadas aritmeticamente del numero de parametros y de la configuracion de atencion declarada; el autor no publica requisitos oficiales.

- Pesos en bfloat16: aproximadamente 6 GB (3.000 millones de parametros a 2 bytes por parametro), mas overhead de runtime.
- Pesos en int8: aproximadamente 3 GB; en int4: aproximadamente 1,8 GB. Estas cuantizaciones no estan confirmadas como publicadas para este modelo.
- Cache KV: con 40 capas, 8 cabezas KV y cabeza de 64 dimensiones, la cache ocupa aproximadamente 80 KiB por token en bfloat16, lo que supone unos 10 GB adicionales para agotar los 128K tokens de contexto. El consumo de VRAM depende fuertemente de la longitud real de contexto utilizada.
- GPU recomendadas: para bfloat16 con contexto largo, una A100 40 GB, H100 o L40S cubren el modelo con margen; una RTX 4090 de 24 GB es suficiente para bfloat16 con contextos moderados y para cuantizaciones de 8 o 4 bits con contexto largo.
- Cabe en GPU de consumo: si. Una RTX 3090 o 4090 de 24 GB puede ejecutar el modelo en bfloat16 con contexto moderado, y en cuantizacion de 4 u 8 bits con contextos mas amplios.
- Opciones de despliegue: transformers (referencia de carga indicada por el autor), vLLM y TGI para servicio de alto rendimiento. llama.cpp y Ollama requeririan una conversion a GGUF que no se proporciona en este repositorio.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

Los datos de rendimiento no estan disponibles para ninguno de los modelos de la comparativa en la informacion proporcionada; la tabla se limita a parametros, contexto y licencia.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Granite-4.2-3B (via este fork) | 3B | 128K nativo, extension a 512K | Apache 2.0 | Pesos en `ibm-granite/granite-4.2-3b`; este fork no almacena pesos |
| Granite-4.1-3B-Base | 3B | no disponible | Apache 2.0 | HuggingFace (modelo base declarado) |
| Granite-4.2-8B Dense | 8B | no disponible en la informacion proporcionada | Apache 2.0 | HuggingFace, coleccion Granite 4.2 |
| Granite-4.2-30B Dense | 30B | no disponible en la informacion proporcionada | Apache 2.0 | HuggingFace, coleccion Granite 4.2 |

No se dispone de datos verificados de otros modelos de 3B de otros fabricantes dentro de la informacion proporcionada, por lo que no se incluye una comparativa cruzada con ellos.

## Limitaciones y advertencias

- Este repositorio no contiene pesos. Es un fork de puntero: descargarlo no proporciona un modelo ejecutable. Hay que cargar los pesos desde `ibm-granite/granite-4.2-3b` fijando la revision `e459acceac81e5fe67c07d9cfc72329a332e7eb1`.
- El fork tiene 0 descargas y 0 likes y no esta mantenido por IBM. No es una publicacion oficial y no debe tratarse como canal de distribucion del modelo.
- La model card proporcionada esta truncada: faltan las secciones de datos de entrenamiento, evaluacion, sesgos y uso responsable, por lo que no se pueden evaluar riesgos de sesgo documentados ni resultados de benchmarks.
- Riesgo de alucinacion: no cuantificado en la informacion disponible. Como en cualquier modelo generativo de 3B, la generacion de codigo, referencias o datos numericos debe verificarse antes de usarse en produccion.
- Idiomas: solo 12 idiomas han sido probados. El resto pueden funcionar de forma degradada y sin garantias. El castellano esta entre los idiomas probados.
- Contexto: aunque se declara soporte nativo de 128K y extension a 512K, la calidad efectiva en longitudes cercanas al limite no esta documentada en la informacion disponible. La cache KV a 128K consume del orden de 10 GB adicionales en bfloat16, lo que puede hacer inviable el contexto maximo en GPU de consumo.
- Licencia: Apache 2.0 permite uso comercial sin restricciones, pero las obligaciones aplicables son las de la licencia del commit upstream referenciado, no las de este fork.
- Modos de pensamiento: el modo de pensamiento completo incrementa notablemente el numero de tokens generados por respuesta, lo que afecta a coste y latencia; en produccion conviene fijar el modo por tipo de consulta.

## Enlaces

- Ficha del fork en HuggingFace: https://huggingface.co/PYTHAI/granite-4.2-3b-fork
- Modelo original: https://huggingface.co/ibm-granite/granite-4.2-3b
- Modelo base declarado: https://huggingface.co/ibm-granite/granite-4.1-3b-base
- Coleccion Granite 4.2 Language Models: https://huggingface.co/collections/ibm-granite/granite-42-language-models
- Blog tecnico de Granite 4.2: https://huggingface.co/blog/ibm-granite/granite-4-2
- Repositorio GitHub de los modelos de lenguaje Granite 4.2: https://github.com/ibm-granite/granite-4.2-language-models
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
- Fichero de verificacion del fork: https://huggingface.co/PYTHAI/granite-4.2-3b-fork/blob/main/FORK.json

Nota: los resultados de busqueda web proporcionados no contienen enlaces relevantes al modelo; todas las entradas devueltas pertenecen a la plataforma Patreon y no guardan relacion con Granite ni con IBM.
