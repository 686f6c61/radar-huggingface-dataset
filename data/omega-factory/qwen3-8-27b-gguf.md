# Omega-Factory/Qwen3.8-27B-GGUF

## Resumen

Omega-Factory/Qwen3.8-27B-GGUF es un repositorio de cuantizaciones GGUF del modelo base Qwen/Qwen3.8-27B, publicado por el usuario Omega-Factory bajo licencia Apache 2.0. No se trata de un modelo entrenado desde cero, sino de una "escalera de precision" (precision ladder) que ofrece tres variantes cuantizadas —Q8_0, Q4_K_M y Q2_K— con verificación declarada sobre los bytes exactos de cada fichero (hash SHA-256) y con tablas comparativas frente al modelo base en FP16. El modelo base cuenta con 27.320.697.856 parametros (~27,3 mil millones), lo que lo situa en la categoria de modelos de tamanio medio-grande aptos para despliegue local en hardware de gama alta.

La propuesta de valor del repositorio es la trazabilidad de la perdida de precision: cada rung incluye un veredicto ("CERTIFIED") y un recibo criptografico, y se publican tanto los aciertos agregados como el analisis de discrepancias item a item frente al FP16 sin cuantizar. Los tamanios de fichero van de 29,05 GB (Q8_0) a 10,86 GB (Q2_K), lo que permite cubrir desde estaciones de trabajo con GPU de 48 GB hasta equipos de consumo con 12-16 GB de VRAM.

La relevancia actual del repositorio es principalmente practica: ofrece una ruta de despliegue documentada con llama.cpp, llama-server, Ollama y llama-cpp-python, ademas de parametros de muestreo recomendados para modo "thinking" y modo instruct. Ahora bien, los resultados publicados presentan anomalias severas (el rung Q2_K supera al FP16 en GSM8K en +27 puntos porcentuales), por lo que las cifras deben interpretarse con cautela y no como una validacion independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible. Los tags del repo indican "mixture-of-experts"; la model card enlaza a una "Dense Model Page" para el mismo modelo. La discrepancia no se resuelve con la informacion proporcionada |
| Parametros totales | 27.320.697.856 (~27,3 B) segun los datos de safetensors del modelo base |
| Parametros activos | No disponible |
| Longitud de contexto | No disponible para el modelo base. Los ejemplos oficiales de ejecucion usan 32.768 tokens (`-c 32768`, `n_ctx=32768`) |
| Tipos de cuantizacion | GGUF: Q8_0 (29,05 GB), Q4_K_M (16,81 GB), Q2_K (10,86 GB) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp). El modelo base se distribuye en safetensors |
| Modelo base | Qwen/Qwen3.8-27B (revision declarada `1d4bf0f2`) |
| Tamanio del repositorio | 56,7 GB |
| Etiquetas de pipeline | text-generation, conversational, endpoints_compatible |
| Descargas / likes | 38 descargas, 0 likes |
| Fechas | Creado el 2026-10-10, actualizado el 2026-10-11 |

## Arquitectura y entrenamiento

No se proporciona informacion sobre la arquitectura del modelo base mas alla de la etiqueta "mixture-of-experts" en los tags del repositorio y la referencia a una pagina de "Dense Model Page" en el sitio del autor. Esta contradiccion impide determinar si se trata de un transformer denso, de un MoE o de una arquitectura hibrida. Tampoco hay datos sobre el numero de parametros activos, la composicion del dataset de entrenamiento, el volumen de tokens procesados ni las tecnicas de alineacion empleadas (RLHF, DPO, RLVR u otras).

Lo que si documenta el repositorio es el proceso de cuantizacion. Se generaron tres variantes GGUF y se evaluaron contra el modelo FP16 sin cuantizar sobre un split de retencion denominado `y_exam`, con N=200 por categoria (600 prompts en total) y controles de semilla declarados como deterministas. Cada rung se certifico de forma independiente sobre sus propios bytes, con hash SHA-256 y un fichero de recibo (`receipts/cert_Q8_0.json`, `receipts/cert_Q4_K_M.json`, `receipts/cert_Q2_K.json`), y se indica explicitamente que un veredicto no se transfiere entre formatos. Las semillas empleadas en los tres rungs certificados fueron 1.

No se describe ninguna innovacion tecnica de inferencia (decodificacion especulativa, atencion lineal, KV-cache cuantizada, etc.) ni se detalla el metodo de cuantizacion mas alla de los nombres estandar de llama.cpp (Q8_0, Q4_K_M, Q2_K).

## Capacidades

- Generacion de texto conversacional multi-turno, con plantilla de chat ChatML (`<|im_start|>` / `<|im_end|>`) documentada en el ejemplo de Ollama.
- Razonamiento y modo "thinking" (razonamiento profundo), con parametros de muestreo diferenciados: temperatura 1,0, top_p 0,95, top_k 20 para thinking; temperatura 0,7, top_p 0,80 para modo instruct.
- Matematicas y razonamiento cientifico, segun las categorias evaluadas en la model card (GSM8K, MATH-500, ARC-MC).
- Generacion de codigo: el ejemplo oficial de llama-cpp-python plantea el modelo como asistente de programacion ("You are a helpful coding assistant") con una peticion de funcion en Python.
- Despliegue compatible con endpoints: el tag `endpoints_compatible` sugiere compatibilidad con APIs estilo OpenAI; `llama-server` proporciona una API local compatible con OpenAI.
- Capacidades multilingues: no disponible.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible de forma explicita; el modo thinking es el unico indicio relacionado.
- Vision, audio u otras modalidades: no disponible.

## Casos de uso

- Asistente de programacion en local: con la variante Q8_0 (29,05 GB, 32-48 GB de VRAM) se puede desplegar un asistente de codigo que no sale del equipo, usando `llama-server` con API compatible con OpenAI y una ventana de 32.768 tokens configurable.
- Razonamiento y resolucion de problemas en modo thinking: el modo de razonamiento profundo con temperatura 1,0 y top_p 0,95 esta pensado para tareas que requieren cadenas de razonamiento largas, como diagnostico tecnico o analisis de casos.
- Despliegue en estacion de trabajo de gama alta para produccion: la variante Q8_0 es la recomendada por el autor para produccion, razonamiento critico y codigo, con un perfil de hardware de A5000, A6000, L40 o RTX 4090 con offload parcial a CPU.
- Asistente conversacional de uso diario en GPU de consumo: la variante Q4_K_M (16,81 GB, 20-24 GB de VRAM) cabe en una RTX 3090 o RTX 4090 y esta orientada a desarrollo diario y conversacion general.
- Inferencia en equipos con memoria limitada: la variante Q2_K (10,86 GB, 12-16 GB de VRAM) permite ejecutar un modelo de ~27 B en GPUs de consumo como RTX 4070 o 4080, o en Apple Silicon con 16 GB unificados.
- Evaluacion comparativa de cuantizaciones: el repositorio sirve como material de partida para reproducir el analisis de discrepancia item a item (flips FP16 correcto -> cuantizado incorrecto y viceversa) sobre un conjunto propio de evaluacion, aunque los resultados publicados presentan anomalias.
- Procesamiento por lotes de texto con llama-cpp-python: el ejemplo oficial permite integrar el modelo en scripts Python con `n_gpu_layers=-1` para offload completo a GPU, util en pipelines de generacion de documentacion o resumen.
- Prototipado sin conexion y con requisitos de privacidad: al ser pesos GGUF ejecutables en local, encaja en entornos con restricciones de envio de datos a servicios externos.

## Benchmarks y rendimiento

Datos publicados por el autor en la model card. Split `y_exam`, N=200 por categoria (600 prompts en total), semilla 1, evaluados contra el FP16 base (`Qwen/Qwen3.8-27B` @ `1d4bf0f2`).

| Variante / formato | Tamanio | Compresion | ARC-MC | GSM8K | MATH-500 | Babble rate | Estado |
|---|---|---|---|---|---|---|---|
| FP16 baseline | ~58,0 GB | 1,00x | 94,5% (189/200) | 59,0% (118/200) | 23,0% (46/200) | 0,0000 | Base de referencia |
| Q8_0 | 29,05 GB | 0,50x (-50%) | 94,5% (delta 0,0 pp) | 63,5% (delta +4,5 pp) | 22,0% (delta -1,0 pp) | 0,0067 | Certificado (casi sin perdida) |
| Q4_K_M | 16,81 GB | 0,29x (-71%) | 95,0% (delta +0,5 pp) | 33,5% (delta -25,5 pp) | 17,5% (delta -5,5 pp) | 0,0000 | Certificado |
| Q2_K | 10,86 GB | 0,19x (-81%) | 93,0% (delta -1,5 pp) | 86,0% (delta +27,0 pp) | 10,0% (delta -13,0 pp) | 0,0217 | Certificado |

Analisis de discrepancia item a item frente al FP16:

| Variante | Categoria | Aciertos cuantizado | Aciertos FP16 | Flips rotos (FP16 ok -> cuant. fallo) | Flips corregidos (FP16 fallo -> cuant. ok) | Delta neto |
|---|---|---|---|---|---|---|
| Q8_0 | ARC_MC | 189/200 | 189/200 | 0 | 0 | 0,0 pp |
| Q8_0 | GSM8K | 127/200 | 118/200 | 1 | 10 | +4,5 pp |
| Q8_0 | MATH500 | 44/200 | 46/200 | 10 | 8 | -1,0 pp |
| Q4_K_M | ARC_MC | 190/200 | 189/200 | 0 | 1 | +0,5 pp |
| Q4_K_M | GSM8K | 67/200 | 118/200 | 61 | 10 | -25,5 pp |
| Q4_K_M | MATH500 | 35/200 | 46/200 | 21 | 10 | -5,5 pp |
| Q2_K | ARC_MC | 186/200 | 189/200 | 7 | 4 | -1,5 pp |
| Q2_K | GSM8K | 172/200 | 118/200 | 15 | 69 | +27,0 pp |
| Q2_K | MATH500 | 20/200 | 46/200 | 39 | 13 | -13,0 pp |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval u otros) en la informacion disponible. Tampoco hay datos de latencia ni de throughput.

## Requisitos de hardware

- Q8_0 (29,05 GB en disco): VRAM recomendada de 32 a 48 GB. Perfil objetivo segun el autor: una RTX 4090 con offload a CPU, o A5000 / A6000 / L40. Uso previsto: produccion, razonamiento critico y codigo.
- Q4_K_M (16,81 GB en disco): VRAM recomendada de 20 a 24 GB. Perfil objetivo: RTX 3090, RTX 4090 o Apple Silicon con 32 GB de memoria unificada. Uso previsto: conversacion general y desarrollo diario.
- Q2_K (10,86 GB en disco): VRAM recomendada de 12 a 16 GB. Perfil objetivo: GPUs de consumo (RTX 4070, RTX 4080) y Apple Silicon con 16 GB unificados.
- Cabe en GPU de consumo: si, en las variantes Q4_K_M (RTX 3090/4090) y Q2_K (RTX 4070/4080). La variante Q8_0 requiere GPU profesional o particion con offload parcial a CPU.
- Opciones de despliegue documentadas: llama.cpp (`llama-cli`, con `-ngl 99` para offload completo), `llama-server` (API local compatible con OpenAI, `--port 8080`), Ollama (mediante `Modelfile` con plantilla ChatML) y llama-cpp-python (`Llama.from_pretrained` con `n_gpu_layers=-1`).
- vLLM, TGI u otros motores: no documentados en el repositorio. Los formatos GGUF son los unicos pesos publicados.
- Latencia y throughput estimados: no disponibles. Dependen del numero de capas descargadas a CPU, del ancho de banda de memoria y de la longitud de contexto configurada.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de modelos de terceros en la informacion proporcionada, por lo que la comparativa externa es "no disponible". La comparacion posible es interna, entre los rungs de la propia escalera de cuantizacion:

| Variante | Parametros | Contexto | ARC-MC | GSM8K | MATH-500 | Licencia | Huella en disco |
|---|---|---|---|---|---|---|---|
| Q8_0 | ~27,3 B | 32.768 tokens en los ejemplos | 94,5% | 63,5% | 22,0% | Apache 2.0 | 29,05 GB |
| Q4_K_M | ~27,3 B | 32.768 tokens en los ejemplos | 95,0% | 33,5% | 17,5% | Apache 2.0 | 16,81 GB |
| Q2_K | ~27,3 B | 32.768 tokens en los ejemplos | 93,0% | 86,0% | 10,0% | Apache 2.0 | 10,86 GB |
| FP16 base | ~27,3 B | no disponible | 94,5% | 59,0% | 23,0% | Apache 2.0 | ~58,0 GB |

Comparativa con modelos comparables de terceros (mismo tamanio o misma tarea): no disponible.

## Limitaciones y advertencias

- Anomalias graves en los benchmarks publicados: Q2_K obtiene un 86,0% en GSM8K frente al 59,0% del FP16 sin cuantizar (+27,0 pp), y Q4_K_M cae al 33,5% (-25,5 pp). Una cuantizacion de 2 bits no deberia superar de forma sistematica al modelo en precision completa; este patron es mas consistente con contaminacion del conjunto de evaluacion, diferencias de configuracion de muestreo entre rungs o un error metodologico que con una mejora real. No deben usarse estas cifras para decisiones de despliegue sin una reproduccion independiente.
- El analisis se presenta como "McNemar", pero las tablas muestran recuentos de discordancia sin el estadistico ni el p-valor, con una unica semilla por rung y N=200 por categoria. La potencia estadistica es limitada.
- El split de evaluacion (`y_exam`) no esta descrito en cuanto a composicion ni procedencia, por lo que no puede descartarse solapamiento con datos de entrenamiento del modelo base.
- Contradiccion en la arquitectura declarada: los tags indican "mixture-of-experts" mientras que la propia model card enlaza a una "Dense Model Page". No es posible determinar la arquitectura ni si existen parametros activos distintos del total.
- Modelo base no verificado: la busqueda web realizada no ha devuelto informacion sobre `Qwen/Qwen3.8-27B` (los resultados corresponden a la marca de relojes Omega y no guardan relacion). Conviene confirmar la existencia, la revision `1d4bf0f2` y las condiciones del modelo base antes de usarlo.
- Validacion comunitaria practicamente inexistente: 38 descargas y 0 likes en el momento de la consulta, sin issues ni discusiones documentadas.
- Riesgo de alucinacion: no cuantificado por el autor mas alla del "babble rate" (0,0000 en Q4_K_M, 0,0067 en Q8_0, 0,0217 en Q2_K), metrica que no se define en la model card.
- Limitaciones de contexto: la ventana real del modelo base no se documenta; los 32.768 tokens de los ejemplos son un valor de configuracion de llama.cpp, no necesariamente el maximo soportado. Superar la ventana efectiva degrada la coherencia sin aviso explicito.
- Idiomas: no se declara ninguna lista de idiomas soportados, por lo que no hay garantia de rendimiento fuera del ingles.
- Licencia: el repositorio se publica como Apache 2.0, pero al ser una cuantizacion derivada, las condiciones aplicables son las del modelo base Qwen/Qwen3.8-27B. Debe verificarse la licencia de origen antes de un uso comercial.
- Pesos exclusivamente GGUF: no hay safetensors cuantizados ni integracion documentada con motores de alto throughput (vLLM, TGI, TensorRT-LLM), lo que limita el despliegue en produccion a gran escala.
- Metadatos con fechas de octubre de 2026 en creacion y actualizacion; conviene verificar la procedencia del repositorio y de los recibos de certificacion antes de confiar en ellos.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Omega-Factory/Qwen3.8-27B-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Pagina oficial del autor con las tablas completas de comparacion de precision y los recibos: https://omega-factory.ai/models/qwen3.8-27b-gguf-v1
- Repositorio llama.cpp (motor de inferencia GGUF): https://github.com/ggml-org/llama.cpp
- llama-cpp-python: https://github.com/abetlen/llama-cpp-python
- Ollama: https://ollama.com

Nota: la busqueda web realizada no ha devuelto ningun enlace relevante sobre este modelo. Todos los resultados obtenidos corresponden al fabricante de relojes Omega y no guardan relacion con el repositorio.
