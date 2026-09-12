# KidIkaros/abliterated-minicpm5-2b-ggml

## Resumen

Abliterated MiniCPM5-2B (GGUF) es una variante del modelo denso openbmb/MiniCPM5-2B, publicada por el usuario KidIkaros, a la que se le han eliminado las direcciones de rechazo ("refusal directions") mediante la técnica de abliteration con extracción de dirección por diferencia de medias (diff-in-means). El objetivo declarado es obtener un modelo que no rechace peticiones, manteniendo al mismo tiempo la coherencia y el conocimiento del modelo original. El repositorio contiene únicamente pesos en formato GGUF, listos para llama.cpp.

El modelo base tiene 2.516.756.480 parámetros reales (aproximadamente 2,5 B) según los datos de safetensors del repositorio, aunque la model card del autor lo describe como "~2.8B dense parameters". Se distribuye bajo licencia Apache 2.0 y su caso de uso principal es la generación de texto conversacional ejecutada en hardware de consumo.

Su relevancia es acotada: se trata de una publicación con 0 descargas y 0 "likes" en el momento de la consulta, sin benchmarks de terceros ni evaluación independiente. Las únicas métricas disponibles son las que reporta el propio autor, obtenidas sobre una validación de 20 muestras, por lo que deben interpretarse como indicativas y no como resultados consolidados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (no se detalla en la informacion disponible) |
| Parametros totales | 2.516.756.480 (~2,5 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible (los ejemplos de la model card usan `-c 4096`, que es una configuracion de servidor, no la ventana maxima del modelo) |
| Tipos de cuantizacion | GGUF: F16, Q8_0, Q5_K_M, Q4_K_M, Q3_K_M |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp / ggml) |
| Modelo base | openbmb/MiniCPM5-2B |
| Tamano del repositorio | 12,4 GB |
| Pipeline | text-generation |
| Fecha de publicacion | 2026-09-12 |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo base (numero de capas totales, dimension del hidden state, tipo de atencion, tokenizador o composicion del dataset de entrenamiento original). La model card unicamente indica que MiniCPM5-2B es un modelo denso de aproximadamente 2,8 B de parametros, y el dato de safetensors del repositorio fija el total real en 2.516.756.480 parametros. La ventana de contexto, el numero de tokens de entrenamiento y la existencia de fases de RLHF, DPO o SFT no estan documentados en la informacion proporcionada.

El proceso de modificacion si esta descrito con cierto detalle. La abliteration se aplico con un metodo avanzado de diff-in-means de direccion unica sobre 20 capas consideradas "fuertes", seleccionadas mediante un criterio de "knee/cosmic layer selection" (capas 13, 17 y del 20 al 41). Se utilizaron 842 pares contrastivos de prompts daninos y 842 inofensivos, con una regularizacion de 0,5 orientada a preservar la norma de los pesos. La verificacion se realizo con una validacion de 20 muestras midiendo perplejidad y coherencia. El autor senala como incidencia conocida que MiniCPM5-2B emplea una plantilla de chat no estandar (`enable_thinking=False` provoca corrupcion en OBLITERATUS), lo que obligo a parchear el pipeline.

## Capacidades

- Generacion de texto conversacional multi-turno, segun el tag `conversational` del repositorio.
- Ejecucion local mediante llama.cpp en formato GGUF, con soporte para servidor (`llama-server`) y CLI (`llama-cli`).
- Generacion de texto sin rechazos sobre prompts daninos: el autor reporta una tasa de rechazo del 0 % en su conjunto de prueba.
- Capacidad de completado de texto de referencia con coherencia del 100 % en las variantes Q8_0, Q5_K_M y F16, segun la evaluacion del autor.
- Compatibilidad declarada con endpoints (`endpoints_compatible` en los tags).
- No se documenta soporte de tool calling, function calling, agentes, vision, audio ni modo de razonamiento explicito.
- No se documentan capacidades multilingues ni lista de idiomas soportados.

## Casos de uso

- Experimentacion con tecnicas de abliteration: el modelo sirve como caso de estudio reproducible para investigar la extraccion de direcciones de rechazo por diff-in-means y medir su impacto en perplejidad y coherencia.
- Investigacion sobre alineacion y seguridad: permite analizar que comportamientos se pierden o se degradan al eliminar las direcciones de rechazo en un transformer denso de ~2,5 B.
- Despliegue local en equipos modestos: con cuantizacion Q4_K_M (1,5 GB) o Q8_0 (2,5 GB) es viable ejecutarlo en portatiles con GPU integrada o CPU, usando llama.cpp u Ollama.
- Prototipado de asistentes conversacionales sin filtros: util en entornos controlados de investigacion donde se necesita un modelo que no interrumpa la generacion con negativas, siempre con supervision humana.
- Evaluacion comparativa de cuantizaciones: el repositorio incluye metricas por variante (conocimiento, coherencia y velocidad), lo que permite estudiar el compromiso entre tamano y calidad en un modelo de ~2,5 B.
- Generacion de texto offline y privada: al ejecutarse en local sin dependencias de API, encaja en escenarios donde los datos no pueden salir del equipo.
- Pruebas de estres de pipelines de inferencia: util para medir throughput y latencia de llama.cpp en distintas cuantizaciones sobre el mismo modelo.

## Benchmarks y rendimiento

Los unicos datos disponibles son los reportados por el autor en la model card. La validacion se realizo sobre 20 muestras, y el hardware utilizado para medir la velocidad no se especifica, por lo que las cifras de tokens por segundo no son comparables con otros equipos.

| Variante | Tamano (MB) | Conocimiento | Sin rechazos | Coherencia | Velocidad (t/s) |
|---|---|---|---|---|---|
| Q8_0 | 2.556 | 60 % | 100 % | 100 % | 101,2 |
| Q5_K_M | 1.724 | 40 % | 100 % | 100 % | 136,1 |
| Q4_K_M | 1.489 | 40 % | 100 % | 80 % | 236,4 |
| Q3_K_M | 1.232 | 0 % | 100 % | 0 % | Inestable |
| F16 | 4.806 | 40 % | 100 % | 100 % | 61,5 |

Metricas globales de la abliteration segun el autor:

| Metrica | Valor reportado |
|---|---|
| Perplejidad del modelo original | 5,27 |
| Perplejidad del modelo abliterado | 5,13 |
| Coherencia del modelo original | 0,667 |
| Coherencia del modelo abliterado | 0,80 |
| Divergencia KL | 0,063 |
| Tasa de rechazo | 0 % |

Advertencia: las cifras de la model card son internamente inconsistentes. El texto afirma una retencion de perplejidad del ~97 % y un incremento de perplejidad del "+0,97 %", pero la tabla muestra una perplejidad inferior en el modelo abliterado (5,13 frente a 5,27), lo que indicaria una mejora y no una degradacion. No se han publicado resultados de benchmarks independientes (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: F16 en torno a 5-6 GB; Q8_0 en torno a 3-4 GB; Q4_K_M en torno a 2-3 GB (incluyendo overhead de runtime y cache KV para contextos moderados).
- GPU recomendadas: cualquier GPU con 6 GB o mas de VRAM. Suficiente con RTX 3060 12 GB, RTX 4060, RTX 3070, RTX 4080 o RTX 4090. Tambien funciona en A100 o H100, aunque es un modelo demasiado pequeno para aprovecharlas.
- Cabe en GPU de consumo: si, en practicamente todas las GPU dedicadas modernas con 4 GB o mas de VRAM en cuantizaciones Q4_K_M o Q8_0. La variante F16 requiere al menos 6 GB.
- Ejecucion en CPU: viable con llama.cpp, especialmente en Q4_K_M y Q5_K_M.
- Opciones de despliegue: llama.cpp (`llama-server`, `llama-cli`), Ollama, LM Studio, koboldcpp y cualquier backend compatible con GGUF. El soporte de vLLM para GGUF es limitado y no esta confirmado para este modelo. El autor incluye un ejemplo de conversion a formato HuggingFace mediante transformers.
- Latencia y throughput estimados: el autor reporta 236,4 t/s en Q4_K_M, 136,1 t/s en Q5_K_M, 101,2 t/s en Q8_0 y 61,5 t/s en F16, sin especificar el hardware empleado, por lo que estas cifras no son extrapolables.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| abliterated-minicpm5-2b-ggml | 2,52 B | no disponible | Apache 2.0 | GGUF | Variante abliterada, 0 descargas, solo metricas del autor |
| openbmb/MiniCPM5-2B (base) | 2,52 B | no disponible | Apache 2.0 | no disponible | Modelo original sin modificar; referencia directa |
| Qwen2.5-3B | 3,09 B | 32.768 tokens | Apache 2.0 | safetensors, GGUF | Alternativa de tamano similar con licencia permisiva y ecosistema amplio |
| Llama-3.2-3B | 3,21 B | 128.000 tokens | Llama 3.2 Community License | safetensors, GGUF | Contexto mucho mayor, pero licencia con restricciones adicionales |

Los datos de Qwen2.5-3B y Llama-3.2-3B provienen de su documentacion publica y se incluyen como referencia de categoria; no se dispone de comparaciones de rendimiento directas con el modelo abliterado. No hay resultados de benchmarks comunes que permitan una comparacion cuantitativa fiable.

## Limitaciones y advertencias

- La abliteration elimina deliberadamente los mecanismos de rechazo, por lo que el modelo puede generar contenido danino, ilegal o eticamente problematico sin filtros. Su uso en produccion orientada al usuario final es desaconsejable sin una capa de moderacion externa.
- Validacion muy limitada: las metricas se obtuvieron sobre 20 muestras, un tamano insuficiente para extraer conclusiones robustas sobre coherencia, conocimiento o seguridad.
- Inconsistencias en las metricas reportadas: la perplejidad y el porcentaje de retencion declarados no concuerdan entre si (vease la seccion de benchmarks).
- La variante Q3_K_M degrada completamente la salida (0 % de conocimiento y 0 % de coherencia segun el autor). Debe evitarse.
- La variante Q4_K_M tambien reduce la coherencia al 80 % en la evaluacion del autor, por lo que Q8_0 es la opcion recomendada si el espacio lo permite.
- No se documentan sesgos especificos, pero al tratarse de una modificacion del modelo base sin reevaluacion de sesgos, es previsible que herede los del original, potencialmente amplificados por la eliminacion de rechazos.
- Riesgo de alucinacion no cuantificado: un modelo de ~2,5 B tiene una capacidad de conocimiento limitada, y la propia tabla del autor refleja un 40-60 % de "knowledge score" incluso en las mejores variantes.
- Idioma: no se especifica que idiomas soporta el modelo. No hay garantia de un rendimiento correcto en castellano.
- Licencia Apache 2.0: permite uso comercial, modificacion y redistribucion, siempre que se conserve el aviso de licencia y se indiquen los cambios. No hay restricciones adicionales declaradas por el autor de la modificacion.
- Incidencia tecnica conocida: la plantilla de chat no estandar del modelo base requirio un parche en el pipeline de abliteration; integraciones que asuman una plantilla estandar pueden comportarse de forma incorrecta.
- Trazabilidad: el autor no publica el codigo del pipeline de abliteration ni los conjuntos de prompts utilizados, lo que dificulta reproducir los resultados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/KidIkaros/abliterated-minicpm5-2b-ggml
- Modelo base: https://huggingface.co/openbmb/MiniCPM5-2B
- Repositorio OpenBMB/MiniCPM: https://github.com/OpenBMB/MiniCPM
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0

Nota: la busqueda web asociada a este modelo no devolvio resultados relevantes (unicamente paginas de inicio de sesion de Facebook), por lo que no se han encontrado papers, blogs, demos ni evaluaciones de terceros adicionales.
