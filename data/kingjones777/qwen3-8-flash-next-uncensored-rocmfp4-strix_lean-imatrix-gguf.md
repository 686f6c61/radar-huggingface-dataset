# kingjones777/Qwen3.8-Flash-Next-Uncensored-ROCmFP4-STRIX_LEAN-imatrix-GGUF

## Resumen

Este repositorio contiene una cuantizacion GGUF del modelo Qwen3.8-Flash-Next-Uncensored, publicada por el usuario kingjones777 bajo el identificador `Qwen3.8-Flash-Next-Uncensored-ROCmFP4-STRIX_LEAN-imatrix-GGUF`. Se trata de la capa de mayor calidad dentro de una familia de builds del mismo autor, obtenida combinando la receta de cuantizacion STRIX_LEAN (embeddings de tokens y PLE en Q5, y la mitad de las capas de atencion en mayor precision) con calibracion por importance matrix (imatrix). El resultado declarado es la perplejidad mas baja de toda la familia sobre WikiText-2 raw: 4,9865 ± 0,031 con contexto de 512 tokens.

El modelo base es un ajuste "uncensored" de Qwen/Qwen3.8-Flash-Next, es decir, se ha eliminado el comportamiento de rechazo. El autor lo etiqueta explicitamente como artefacto de investigacion y advierte de que eliminar los guardrails no aporta capacidad nueva, solo los retira. El repositorio no incluye pesos en precision completa: es una cuantizacion derivada, publicada unicamente en formato GGUF.

La relevancia practica de esta ficha es doble. Por un lado, documenta un formato de pesos no estandar (tipos de tensor ROCmFP4) que exige un fork especifico de llama.cpp y no funciona con la version upstream. Por otro, aporta datos medidos de decodificacion especulativa con cabecera MTP sobre hardware AMD Strix Halo (gfx1151), con aceleraciones de hasta el 34 % en cargas de razonamiento y perdidas claras con `--spec-draft-n-max 4` en codigo y resumen de documentos largos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible con detalle; los tags indican la arquitectura experimental `qwen4exp`. No se especifica si es densa o MoE |
| Parametros totales | 448.931.056 segun los metadatos de safetensors; no concluyente, ya que la model card menciona un componente PLE de 51,2B. El dato de safetensors probablemente corresponde a un subcomponente |
| Parametros activos | no disponible |
| Longitud de contexto | verificado hasta 128K aplicando el parche `qwen4exp-qsa-checkpoint-fix.patch`; sin ese parche, la decodificacion especulativa debe limitarse a 32K o menos |
| Tipos de cuantizacion | ROCmFP4 (tipos de tensor propios del fork ROCmFPX), receta STRIX_LEAN calibrada con imatrix, tensor principal Q4_0. Cabeceras MTP publicadas aparte en Q8_0, Q6_K y Q4 |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 (`license: other`) |
| Formato de pesos | GGUF, dividido en 3 fragmentos (00001-of-00003 a 00003-of-00003) |
| Tamano del repositorio | 106,7 GB |
| Fecha de publicacion | 16 de septiembre de 2026 (actualizado el 17 de septiembre de 2026) |
| Runtime requerido | fork ROCmFPX (rama `main`), compilado con `-DGGML_HIP=ON -DGPU_TARGETS=gfx1151`; llama.cpp upstream no carga el fichero |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo base en la informacion proporcionada. Los tags del repositorio apuntan a la arquitectura `qwen4exp`, y la model card menciona de pasada un "PLE de 51,2B", lo que sugiere un componente de embeddings o de prediccion de gran tamano dentro del modelo. No se documentan el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo fases de RLHF, DPO u otras tecnicas de alineamiento. Tampoco se detalla el proceso de ajuste que dio lugar a la variante "uncensored" (orcarouter/Qwen3.8-Flash-Next-Uncensored), mas alla de la indicacion de que se ha eliminado el comportamiento de rechazo.

En lo que si es especifico esta ficha es en el proceso de cuantizacion, que es el objeto real del repositorio. La receta STRIX_LEAN asigna Q5 a los embeddings de tokens y al PLE, y mantiene la mitad de las capas de atencion en mayor precision que la variante FAST. Sobre esa base se aplica calibracion por importance matrix usando el corpus `calibration_datav3` de bartowski. El autor advierte de que la matriz de importancia se calculo sobre el modelo ya cuantizado a 4 bits, porque el PLE de 51,2B junto con el techo de 128 GB de GTT impide una pasada forward en BF16 sobre Strix Halo. La innovacion operativa destacable es el soporte de decodificacion especulativa con cabecera MTP (`--spec-type draft-mtp`), que requiere el parche `qwen4exp-mtp-graph.patch` para corregir el combinador de grafo; sin el, la tasa de aceptacion se quedaba alrededor de 0,36.

## Capacidades

- Generacion de texto en modo `text-generation`. Es la unica tarea declarada en el pipeline del repositorio.
- Razonamiento multi-paso: la model card incluye "reasoning" como carga de trabajo medida, con 23,91 tok/s en modo simple y hasta 31,94 tok/s con decodificacion especulativa (`--spec-draft-n-max 1`, aceptacion 0,945).
- Generacion de codigo: medida como carga de trabajo especifica, con 24,09 tok/s en modo simple y 26,80 tok/s con `n-max 1`.
- Salida en formato JSON: medida como carga de trabajo, con 23,99 tok/s en simple y 27,24 tok/s con `n-max 1`.
- Resumen de documentos largos: medido como carga de trabajo, con soporte de contexto verificado hasta 128K aplicando el parche de checkpoint.
- Decodificacion especulativa mediante cabecera MTP: la cabecera actua solo como proponente de borradores y el modelo principal verifica cada token, por lo que no altera la salida final.
- Eliminacion del comportamiento de rechazo: capacidad declarada explicitamente por el autor, que la presenta como retirada de guardrails y no como una habilidad adicional.
- Soporte de plantilla de chat mediante `--jinja` en llama-server.
- No se documentan capacidades de vision, audio, tool calling ni function calling en la informacion disponible.

## Casos de uso

- Evaluacion comparativa de tecnicas de cuantizacion: el repositorio publica perplejidades sobre WikiText-2 raw para tres builds distintos de la misma familia (FAST sin imatrix, FAST con imatrix y STRIX_LEAN con imatrix) con la misma calibracion, lo que permite medir el efecto aislado de la matriz de importancia y de la receta de precision.
- Investigacion sobre decodificacion especulativa en hardware AMD: los datos de aceptacion y aceleracion por tipo de carga (razonamiento, JSON, codigo, resumen largo) permiten analizar cuando merece la pena una cabecera MTP y cuando degrada el rendimiento, comparando `n-max 1` frente a `n-max 4`.
- Analisis de sesgos y de comportamiento sin guardrails: al tratarse de una variante con los rechazos eliminados, es util como objeto de estudio de seguridad y alineamiento, siempre en un entorno controlado y con supervision humana.
- Despliegue local en equipos Ryzen AI Max+ 395: la build esta dirigida especificamente a gfx1151 y a un techo de GTT de 128 GB, por lo que encaja en estaciones de trabajo con memoria unificada grande que no disponen de GPU discreta.
- Generacion de resumen de documentos largos en local: el contexto verificado hasta 128K y el rendimiento estable con `n-max 1` (24,14 tok/s frente a 23,80 tok/s en modo simple) lo hacen viable para procesar documentos extensos sin salida a la nube.
- Servicio de generacion de codigo con `llama-server`: con plantilla Jinja activada y decodificacion especulativa en `n-max 1` alcanza 26,80 tok/s en cargas de codigo, frente a 24,09 tok/s sin especulacion.
- Generacion de JSON estructurado en pipelines internos: la carga de JSON medida (27,24 tok/s con `n-max 1`) lo hace util para tareas de extraccion o formateo con esquema fijo.
- Validacion de toolchains de cuantizacion personalizadas: sirve como caso de prueba para verificar que un fork de llama.cpp con tipos de tensor no estandar (ROCmFP4) carga y ejecuta correctamente, incluyendo los parches de checkpoint y de grafo MTP.

## Benchmarks y rendimiento

Perplejidad medida sobre WikiText-2 raw con `-c 512`, comparando los tres builds de la misma familia:

| Build | Perplejidad | Diferencia frente a FAST simple |
|---|---|---|
| FAST sin imatrix | 5,3465 ± 0,034 | referencia |
| FAST con imatrix | 5,0337 ± 0,031 | −5,9 % |
| STRIX_LEAN con imatrix (este repositorio) | 4,9865 ± 0,031 | −6,7 % |

El autor no publica la comparacion directa "STRIX_LEAN con imatrix frente a STRIX_LEAN sin imatrix", porque el BF16 de origen se reclamó despues de construir la cuantizacion. Indica que el efecto aislado de imatrix en la familia FAST es del −5,9 % y que en STRIX_LEAN deberia estar en el mismo rango.

Rendimiento con decodificacion especulativa, medido con un unico binario, decodificacion greedy, `cache_prompt:false`, 256 tokens generados, `-c 2048`, cabecera Q8_0, pesos STRIX_LEAN imatrix, sobre gfx1151 con ROCm 7.2.4 (17 de septiembre de 2026). Valores en tokens por segundo, mediana de 3 repeticiones por celda:

| Carga de trabajo | Simple | `--spec-draft-n-max 4` | `--spec-draft-n-max 1` |
|---|---|---|---|
| Razonamiento | 23,91 | 30,94 (+29 %, aceptacion 0,680) | 31,94 (+34 %, aceptacion 0,945) |
| Salida JSON | 23,99 | 28,31 (+18 %, aceptacion 0,597) | 27,24 (+14 %, aceptacion 0,758) |
| Codigo | 24,09 | 21,56 (−10 %, aceptacion 0,422) | 26,80 (+11 %, aceptacion 0,711) |
| Resumen de documento largo | 23,80 | 20,36 (−14 %, aceptacion 0,352) | 24,14 (+1 %, aceptacion 0,641) |

Con la configuracion corregida (`n-max 1`) y la cabecera Q8_0 en contexto corto (`-c 2048`) la model card cita una aceptacion de 0,94 y una mejora del 27,7 % en tok/s. La ganancia de velocidad de la propia build STRIX_LEAN no se ha medido: solo se han publicado datos de la variante FAST. No hay resultados de MMLU, HumanEval, GSM8K ni otros benchmarks de conocimiento o razonamiento en la informacion disponible.

## Requisitos de hardware

- La build esta dirigida especificamente a AMD Ryzen AI Max+ 395 (Strix Halo) con iGPU gfx1151 y ROCm 7.2.4.
- El repositorio ocupa 106,7 GB distribuidos en 3 fragmentos GGUF; la carga completa requiere del orden de esa cifra de memoria, y la model card menciona un techo de 128 GB de GTT como restriccion del sistema de referencia.
- No cabe en GPUs de consumo con VRAM convencional (RTX 4090 con 24 GB, por ejemplo). El escenario declarado es memoria unificada grande en plataforma AMD.
- Runtime obligatorio: fork ROCmFPX (rama `main`), con los tipos de tensor ROCmFP4 y la arquitectura `qwen4exp`. llama.cpp upstream no carga el fichero.
- Orden de compilacion documentado: `cmake -B build -DGGML_HIP=ON -DGPU_TARGETS=gfx1151 -DGGML_NATIVE=ON -DCMAKE_BUILD_TYPE=Release` y `cmake --build build --target llama-server llama-quantize`. Requiere aplicar antes `qwen4exp-qsa-checkpoint-fix.patch` y, para `--spec-type draft-mtp`, `qwen4exp-mtp-graph.patch` (o `qwen4exp-mtp-graph-fork.patch` si se compila desde un clon del fork).
- Comando de referencia: `llama-server -m <modelo> -md mtp-Qwen3.8-Flash-Next-Q8_0.gguf --spec-type draft-mtp --spec-draft-n-min 0 --spec-draft-n-max 1 --n-gpu-layers-draft 99 -ngl 999 -fa on -np 1 -c 32768 --jinja`.
- Throughput de referencia en el hardware citado: en torno a 24 tok/s en modo simple y hasta 31,94 tok/s en razonamiento con especulacion.
- No se dispone de estimaciones de VRAM para otras cuantizaciones ni de soporte para vLLM, TGI, Ollama u otros motores.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos de terceros comparables, porque la busqueda web realizada no devolvio resultados relevantes. La comparacion posible se limita a los otros builds de la misma familia, publicados por el mismo autor:

| Build | Receta | Perplejidad (WikiText-2 raw, c 512) | Repositorio |
|---|---|---|---|
| FAST sin imatrix | FAST | 5,3465 ± 0,034 | kingjones777/Qwen3.8-Flash-Next-Uncensored-ROCmFP4-FAST-GGUF |
| FAST con imatrix | FAST + imatrix | 5,0337 ± 0,031 | kingjones777/Qwen3.8-Flash-Next-Uncensored-ROCmFP4-FAST-imatrix-GGUF |
| STRIX_LEAN con imatrix (este) | STRIX_LEAN + imatrix | 4,9865 ± 0,031 | este repositorio |

Los tres comparten modelo base, licencia y formato de pesos; la diferencia esta en la asignacion de bits por tensor y en la calibracion. No hay datos publicados de parametros, contexto o licencia de alternativas externas que permitan una comparativa fiable.

## Limitaciones y advertencias

- Artefacto de investigacion: el autor advierte de que el comportamiento de rechazo ha sido eliminado. Esto retira guardrails, no anade capacidad, y traslada al operador la responsabilidad sobre la salida.
- La licencia declarada es `qwen-community-1.0`, con `license: other`. No se detallan en la informacion disponible las condiciones exactas de uso comercial; es imprescindible revisar el texto completo de la licencia antes de cualquier despliegue en produccion.
- Compatibilidad muy restringida: el fichero no funciona con llama.cpp upstream y exige un fork con soporte simultaneo de `qwen4exp` y de los tipos ROCmFP4. Esto complica el mantenimiento y la reproducibilidad.
- Los parches son obligatorios: sin `qwen4exp-qsa-checkpoint-fix.patch` el contexto verificado baja a 32K o menos para decodificacion especulativa. La version previa de `qwen4exp-mtp-graph.patch` aplicaba sin errores pero no compilaba (`'graph_mtp' was not declared in this scope`), por lo que hay que asegurarse de usar la version actualizada del 17 de septiembre de 2026.
- La matriz de importancia se calculo sobre el modelo ya cuantizado a 4 bits, no sobre BF16, debido al limite de memoria de la plataforma objetivo. Es una aproximacion que puede alejarse de una calibracion ideal.
- La ganancia de velocidad de la decodificacion especulativa solo esta medida en la variante FAST, no en esta build. El propio autor indica que el rendimiento MTP de STRIX_LEAN no se ha medido y que las cabeceras Q6_K y Q4 publicadas no fueron evaluadas.
- `--spec-draft-n-max 4` degrada el rendimiento en codigo (−10 %) y en resumen de documentos largos (−14 %), ademas de penalizar la velocidad de prefill porque la cabecera procesa el prompt.
- En hardware distinto de gfx1151 los numeros de rendimiento no son extrapolables.
- Riesgo de alucinacion: no se han publicado evaluaciones de fidelidad factual ni de tasas de alucinacion en la informacion disponible.
- Idiomas soportados: no disponible. No se puede asumir cobertura multilingue sin datos.
- Sesgos conocidos: no disponible. La eliminacion de rechazos puede incrementar la exposicion a contenido toxico o inapropiado en produccion.
- Madurez y adopcion muy bajas: 27 descargas y 0 likes en el momento de redactar esta ficha.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/kingjones777/Qwen3.8-Flash-Next-Uncensored-ROCmFP4-STRIX_LEAN-imatrix-GGUF
- Build FAST sin imatrix: https://huggingface.co/kingjones777/Qwen3.8-Flash-Next-Uncensored-ROCmFP4-FAST-GGUF
- Build FAST con imatrix: https://huggingface.co/kingjones777/Qwen3.8-Flash-Next-Uncensored-ROCmFP4-FAST-imatrix-GGUF
- Cabeceras MTP: https://huggingface.co/kingjones777/Qwen3.8-Flash-Next-MTP-Heads-GGUF
- Fork de llama.cpp requerido: https://github.com/kingjones30/ROCmFPX
- Fork de origen: https://github.com/charlie12345/ROCmFPX
- Corpus de calibracion de bartowski: https://gist.github.com/bartowski1182/eb213dccb3571f863da82e99418f81e8
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Modelo base sin censura: https://huggingface.co/orcarouter/Qwen3.8-Flash-Next-Uncensored

Nota: la busqueda web realizada no devolvio ningun resultado relevante sobre este modelo ni sobre su modelo base; los enlaces anteriores proceden exclusivamente de la model card y de los metadatos del repositorio.
