# mingxianderen/Qwen3.8-27B-Uncensored-GGUF

## Resumen

Qwen3.8-27B-Uncensored-GGUF es una versión cuantizada en formato GGUF del modelo Qwen/Qwen3.8-27B, publicada por el usuario mingxianderen. El modelo base es un transformer denso de 27.320.697.856 parámetros (unos 27,3 B) con arquitectura declarada `Qwen3_5ForConditionalGeneration`, 64 capas, vocabulario de 248.320 entradas, soporte de visión y una ventana de contexto de 262.144 tokens. La particularidad de esta publicación es que se ha aplicado una ablación de direcciones de rechazo (abliteration) con la herramienta Heretic, que minimiza conjuntamente el número de rechazos y la divergencia KL respecto al modelo base, y el resultado se distribuye exclusivamente como cuantizaciones GGUF para llama.cpp.

El problema que resuelve es doble. Por un lado, ofrece el modelo en cuantizaciones que van de 10,6 GB (IQ2_M) a 29,0 GB (Q8_0), lo que permite ejecutarlo en hardware de consumo y en GPUs de datacenter según el presupuesto de VRAM. Por otro, reduce el comportamiento de rechazo del modelo original sin reentrenar: la ablación se ejecuta en bf16, el LoRA resultante se fusiona en el checkpoint base en bf16 y las cuantizaciones se generan desde ahí, evitando el ida y vuelta de cuantización. Los tensores `mtp.*` (multi-token prediction) se copian literalmente del checkpoint base y se preservan para permitir decodificación especulativa con un cabezal draft.

Es relevante ahora porque combina tres elementos poco habituales en una misma publicación: una ventana de contexto de 262.144 tokens, un cabezal MTP verificado para decodificación especulativa y una matriz de importancia (imatrix) calculada directamente sobre los pesos f16 en lugar de sobre una cuantización intermedia. La licencia es apache-2.0 y los idiomas declarados son inglés y chino. En el momento de la consulta el repositorio acumula 0 descargas y 0 likes, por lo que no existe validación comunitaria publicada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `Qwen3_5ForConditionalGeneration` (transformer denso, multimodal con vision) |
| Parametros totales | 27.320.697.856 (27,3 B) |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | IQ2_M, IQ4_XS, Q4_K_M, Q5_K_M, Q6_K, Q8_0 (modelo principal); Q8_0 y Q4_0 (cabezal draft); F16 (proyector de vision mmproj) |
| Idiomas soportados | en (ingles), zh (chino) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (llama.cpp) |
| Capas | 64 |
| Tamano de vocabulario | 248.320 |
| Capas MTP | 1 |
| Vision | si (requiere `mmproj-Qwen3.8-27B-Uncensored-F16.gguf` de 0,9 GB) |
| Modelo base | Qwen/Qwen3.8-27B (relacion: quantized) |
| Herramienta de conversion | llama.cpp `a94d563ed` |
| Matriz de importancia | wikitext-2 raw, 200 chunks, publicada en el repo |
| Tamano del repositorio | 231,3 GB |
| Libreria | llama.cpp |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base Qwen/Qwen3.8-27B: un transformer denso de 64 capas con vocabulario de 248.320 tokens, soporte multimodal de vision y una capa de multi-token prediction (MTP). Esta publicacion no entrena ni afina el modelo: su aportacion es el proceso de abliteracion y la cadena de cuantizacion. La abliteracion se ejecuta con Heretic, que elimina direcciones de rechazo minimizando de forma conjunta el recuento de rechazos y la divergencia KL respecto al modelo base, sin codigo de eliminacion escrito a mano, sin fine-tuning y sin datos de entrenamiento adicionales. El proceso corre en bf16 (no sobre una cuantizacion de 4 bits) y el LoRA resultante se fusiona en el checkpoint base en bf16, de modo que los pesos publicados no son el resultado de un ciclo de ida y vuelta de cuantizacion. La abliteracion modifica las proyecciones `attn.o_proj` y `mlp.down_proj` de la pila principal, mientras que los tensores `mtp.*` se copian literalmente del checkpoint base y quedan intactos.

La cadena de cuantizacion usa una imatrix calculada directamente desde los pesos f16 (no desde una cuantizacion intermedia), con calibracion sobre wikitext-2 raw y 200 chunks, y la conversion se realizo con la revision `a94d563ed` de llama.cpp. El repositorio distribuye dos familias de archivos: la fusionada (`Qwen3.8-27B-Uncensored-<QUANT>.gguf`), en la que el cabezal MTP viaja en linea como draft integrado, y la separada (`noMTP-<QUANT>.gguf` mas `draft-<QUANT>.gguf`) para runtimes que exigen un `--model-draft` explicito. El cabezal draft se entreno contra el modelo sin modificar, por lo que la tasa de aceptacion puede caer ligeramente, aunque la decodificacion especulativa verifica cada token contra el modelo objetivo y la calidad de salida no se ve afectada. La composicion del dataset de entrenamiento del modelo base, el numero de tokens y si hubo RLHF o DPO no estan disponibles en la informacion proporcionada.

## Capacidades

- Generacion de texto conversacional: el pipeline declarado es `text-generation` y el tag `conversational` esta presente, con plantilla de chat compatible con llama.cpp.
- Ventana de contexto muy larga: 262.144 tokens, adecuada para documentos extensos, bases de codigo o historiales de conversacion largos.
- Entrada de imagen: el modelo base declara vision y se publica el proyector `mmproj-Qwen3.8-27B-Uncensored-F16.gguf` para runtimes de vision compatibles.
- Decodificacion especulativa con MTP: incluye 1 capa MTP y cabezales draft en Q8_0 y Q4_0, tanto en modo fusionado como en modo target + draft separado.
- Comportamiento de rechazo reducido: la abliteracion reduce sustancialmente el numero de rechazos, no lo elimina. Las cifras concretas de comportamiento medido no estan disponibles en el extracto de la model card proporcionado.
- Idiomas: ingles y chino. No se declara soporte de castellano ni de otros idiomas, aunque el modelo base podria tener capacidades residuales no documentadas aqui.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Modo thinking explicito: no disponible en la informacion proporcionada.

## Casos de uso

- Procesamiento de documentos largos: con 262.144 tokens de contexto, el modelo puede ingerir contratos, informes tecnicos o expedientes completos en una sola pasada sin necesidad de chunking ni recuperacion externa, algo util en analisis legal o auditoria documental.
- Analisis de imagenes con salida textual: usando el proyector `mmproj` en un runtime compatible, se puede emplear para descripcion de capturas, extraccion de informacion de diagramas o revision de interfaces, siempre que el runtime soporte vision sobre GGUF.
- Asistencia conversacional autoalojada: al ejecutarse con llama.cpp u Ollama en hardware propio, permite desplegar un asistente conversacional sin enviar datos a terceros, relevante en entornos con requisitos de confidencialidad.
- Investigacion sobre alineacion y rechazo: el modelo es un artefacto util para estudiar como la abliteracion con Heretic afecta a la distribucion de respuestas, comparando el comportamiento contra el modelo base sin modificar con la misma perplexity de referencia.
- Generacion de texto en ingles y chino: redaccion, resumen y reescritura de contenido en esos dos idiomas, con la ventaja de que las cuantizaciones bajas (IQ4_XS, Q4_K_M) caben en GPUs de consumo.
- Evaluacion comparativa de cuantizaciones: la publicacion incluye una tabla de perplexity medida en una sola sesion contra la misma linea base f16, lo que la convierte en material de referencia para decidir el compromiso entre tamano de archivo y degradacion.
- Aceleracion de inferencia en produccion: el cabezal draft permite activar decodificacion especulativa en llama-server mediante `--model-draft`, reduciendo el coste por token cuando el cuello de botella es la generacion secuencial.
- Pipelines creativos en ComfyUI: la model card documenta explicitamente el uso desde ComfyUI, lo que facilita integrarlo en flujos de generacion de contenido local.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible para MMLU, HumanEval, GSM8K ni similares. El unico dato cuantitativo publicado es la perplexity sobre wikitext-2, medida en la misma sesion para todas las cuantizaciones contra la misma linea base f16:

| Archivo | Perplexity (wikitext-2) | Diferencia vs f16 | Tamano |
|---|---|---|---|
| `Qwen3.8-27B-Uncensored-f16.gguf` (base, no distribuido) | 7,1557 +/- 0,25104 | - | no disponible |
| `Qwen3.8-27B-Uncensored-Q5_K_M.gguf` | 7,1573 +/- 0,25055 | +0,0016 | 19,5 GB |
| `Qwen3.8-27B-Uncensored-IQ4_XS.gguf` | 7,1583 +/- 0,25019 | +0,0026 | 15,3 GB |
| `Qwen3.8-27B-Uncensored-Q6_K.gguf` | 7,1689 +/- 0,25149 | +0,0132 | 22,4 GB |
| `Qwen3.8-27B-Uncensored-Q8_0.gguf` | 7,1764 +/- 0,25195 | +0,0207 | 29,0 GB |
| `Qwen3.8-27B-Uncensored-Q4_K_M.gguf` | 7,1814 +/- 0,25227 | +0,0257 | 16,8 GB |
| `Qwen3.8-27B-Uncensored-IQ2_M.gguf` | 7,8581 +/- 0,27481 | +0,7024 | 10,6 GB |

El propio autor advierte que, excepto IQ2_M, todas las filas caen dentro de un margen de 0,026 frente a un error estandar de aproximadamente 0,25, por lo que esas cuantizaciones no son separables entre si ni respecto a f16 y su ordenacion es ruido estadistico. IQ2_M es la unica que muestra una degradacion clara. La comparacion con modelos similares no esta disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el tamano del archivo GGUF es el componente dominante. Valores de referencia: IQ2_M 10,6 GB; IQ4_XS 15,3 GB; Q4_K_M 16,8 GB; Q5_K_M 19,5 GB; Q6_K 22,4 GB; Q8_0 29,0 GB. Hay que sumar el coste de la cache KV, que escala con la longitud de contexto efectiva; la configuracion de cabezas y dimensiones necesaria para calcularla no esta disponible en la informacion proporcionada.
- Si se usa decodificacion especulativa, hay que anadir el cabezal draft: 3,2 GB (Q8_0) o 1,7 GB (Q4_0), o bien usar los archivos fusionados que ya lo incluyen. Con vision, anadir 0,9 GB del `mmproj` F16.
- GPUs de consumo: IQ4_XS y Q4_K_M caben en una RTX 4090, RTX 3090 o similar de 24 GB con contexto moderado, aunque con 262.144 tokens de contexto completo seran necesarias varias GPU o mucha memoria del sistema. IQ2_M deja mas margen para contexto largo en 24 GB.
- GPUs de datacenter: Q8_0 (29,0 GB) y Q6_K (22,4 GB) encajan en A100 40 GB, A100 80 GB o H100 80 GB. Para ventanas de contexto muy largas se recomienda A100 80 GB, H100 o despliegue multi-GPU.
- Opciones de despliegue: llama.cpp y llama-server (soporte explicito de `--model-draft` para el cabezal draft), Ollama mediante importacion del GGUF, y ComfyUI, tal como documenta la model card. vLLM y TGI no estan soportados de forma nativa para pesos GGUF segun la informacion disponible.
- Latencia y throughput: no disponibles. La model card menciona tablas de decodificacion especulativa medidas sobre este modelo (incluyendo una seccion para IQ2_M), pero su contenido no aparece en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone de datos de otros modelos comparables en la informacion proporcionada. La unica comparacion documentada es contra el propio modelo base y contra las distintas cuantizaciones de esta misma publicacion.

| Modelo | Parametros | Contexto | Perplexity (wikitext-2) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen/Qwen3.8-27B (base, sin modificar) | 27,3 B | 262.144 | no disponible (referencia f16 de esta build: 7,1557) | apache-2.0 | HuggingFace |
| Qwen3.8-27B-Uncensored-GGUF (esta publicacion) | 27,3 B | 262.144 | 7,1573 a 7,8581 segun cuantizacion | apache-2.0 | HuggingFace, GGUF |
| Otras alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El comportamiento de rechazo esta sustancialmente reducido, pero no eliminado. Las cifras concretas de comportamiento medido no estan disponibles en el extracto proporcionado de la model card, por lo que no se puede cuantificar el grado de reduccion.
- La abliteracion modifica `attn.o_proj` y `mlp.down_proj`, lo que puede alterar el comportamiento del modelo de formas no medidas mas alla de la perplexity. No se han publicado evaluaciones de capacidades (razonamiento, codigo, matematicas) sobre esta version.
- Riesgo de alucinacion: inherente a los modelos de lenguaje de esta escala. No hay datos especificos sobre la tasa de alucinacion de esta version ni del modelo base.
- IQ2_M es la unica cuantizacion con degradacion medible: perplexity 7,8581 frente a 7,1557 de f16, una diferencia de +0,7024. Las diferencias entre Q4_K_M, Q5_K_M, Q6_K, Q8_0 e IQ4_XS caen dentro del error estadistico y no deben interpretarse como una ordenacion real de calidad.
- Idiomas: solo ingles y chino declarados. El rendimiento en castellano no esta documentado y no deberia asumirse.
- Restricciones de licencia: la licencia declarada es apache-2.0, lo que permite uso comercial. No obstante, hay que verificar las condiciones del modelo base Qwen/Qwen3.8-27B y tener en cuenta que un modelo con rechazos reducidos puede generar contenido inapropiado, lo que traslada al desplegador la responsabilidad sobre filtrado y moderacion.
- El cabezal draft se entreno contra el modelo sin abliterar, por lo que la tasa de aceptacion en decodificacion especulativa puede caer ligeramente. La verificacion token a token contra el modelo objetivo garantiza que la calidad de salida no se degrade.
- El cabezal draft en Q4_0 no tiene tasa de aceptacion medida segun la model card.
- La vision requiere un runtime compatible con `mmproj`; no todos los motores de inferencia soportan entrada de imagen sobre GGUF.
- Repositorio de 231,3 GB: la descarga completa es costosa en disco y ancho de banda. Conviene descargar unicamente la cuantizacion necesaria.
- Sin validacion comunitaria: 0 descargas y 0 likes en el momento de la consulta. No hay informes independientes de terceros sobre el comportamiento real del modelo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mingxianderen/Qwen3.8-27B-Uncensored-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Heretic (herramienta de abliteracion): https://github.com/p-e-w/heretic
- llama.cpp (revision de conversion `a94d563ed`): https://github.com/ggml-org/llama.cpp
- ComfyUI (runtime de vision y generacion documentado en la model card): https://github.com/comfyanonymous/ComfyUI
- Matriz de importancia: publicada dentro del propio repositorio de HuggingFace (`Qwen3.8-27B-Uncensored-imatrix.dat`, 13,6 MB)
- La busqueda web realizada no devolvio enlaces relevantes sobre este modelo: los resultados obtenidos tratan sobre ChatGPT, GitHub Copilot y jailbreaks genericos, sin relacion con Qwen3.8-27B ni con esta publicacion.
