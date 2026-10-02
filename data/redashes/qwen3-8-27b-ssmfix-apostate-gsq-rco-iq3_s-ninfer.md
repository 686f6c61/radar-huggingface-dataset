# redashes/Qwen3.8-27B-SSMFIX-apostate-GSQ-RCO-IQ3_S-NInfer

## Resumen

Este repositorio no contiene un modelo entrenado desde cero, sino un artefacto de cuantizacion de un solo fichero (`.ninfer`) para el motor de inferencia NInfer, derivado de `redashes/Qwen3.8-27B-BF16-SSMFIX-apostate`. Se trata de un Qwen3.8-27B denso y multimodal (torre de texto + torre de vision + cabeza MTP nativa) que ha pasado por dos intervenciones de la comunidad: el parche SSMFIX, que corrige la desviacion estandar inflada de las convoluciones conv1d en las 8 ultimas capas del linaje oficial (causa de degradacion silenciosa y bucles de repeticion en contexto largo), y el metodo KCRN "apostate", que aplica desaprendizaje selectivo para reducir drásticamente las conductas de rechazo conservando las capacidades del modelo original.

El artefacto concreto, publicado por el usuario `redashes`, empaqueta una cuantizacion mixta GSQ-RCO de precision mixta con banda dominante IQ3_S (unos 3,53 bits por peso, dominio de busqueda de 2, 3 y 4 bits por tensor), normas y sesgos en bf16, y la torre de vision en int8 agrupado Q8/Q5. Ocupa 12.867.382.784 bytes (unos 12,0 GiB) en 1.185 objetos binarios, frente a los aproximadamente 54 GB que requeriria el base BF16, lo que permite ejecutar un modelo de 27B con ventana completa de 256K tokens en una unica GPU de 20 GB.

Su relevancia es doble. Por un lado, demuestra una receta de cuantizacion que importa los bloques GGUF byte a byte sin recuantizar, preservando la fidelidad del tensor original. Por otro, viene acompanado de una guia de despliegue muy detallada (parches CUDA para sm_86, tabla de geometria del merger de vision, parametros de servicio, decodificacion especulativa MTP con aceptacion medida del 54-82 %) que lo convierte en una referencia practica para quien quiera servir modelos multimodales de gran ventana en hardware de consumo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso multimodal (torre de texto de 64 capas + torre de vision con merger + cabeza MTP `nextn` nativa); linaje Qwen3.8-27B |
| Parametros totales | 27B (segun la denominacion del modelo base; no se detalla el desglose exacto en la model card) |
| Parametros activos | No aplica (arquitectura densa, no MoE) |
| Longitud de contexto | 262.144 tokens (256K) configurados en el motor (`--max-context 262144 --kv-capacity 262144`) |
| Tipos de cuantizacion | Mezcla per-tensor dominante IQ3_S (~3,53 bpw; dominio {2,3,4} bits); normas y sesgos en bf16; vision en int8 agrupado Q8/Q5; un tensor `blk.64.nextn.eh_proj.weight` repackeado de Q4_0 a Q8_0 sin perdida |
| Idiomas soportados | No disponible (la model card no declara lista de idiomas; menciona pruebas con salidas largas en chino) |
| Licencia | apache-2.0 (declarada en el repositorio; conviene verificar la licencia del linaje upstream) |
| Formato de pesos | `.ninfer` (artefacto unico del motor NInfer); GGUFs de origen: `Qwen3.8-27B-GSQstyle-IQ3S-mtp.gguf` y `mmproj-Qwen3.8-27B-Q5_K-MIX.gguf` |
| Tamano del artefacto | 12.867.382.784 bytes (~12,0 GiB), 1.185 objetos |
| Componentes incluidos | `text` (64 capas) + `mtp` (cabeza `nextn`) + `vision` (tower + merger) |
| Modelo base | `redashes/Qwen3.8-27B-BF16-SSMFIX-apostate` |
| Libreria / motor | NInfer (fork `Ryan-gsq/ninfer-16g-5070ti-5080-5090-qwen3.8-27b-gsq-rco`, release franken-v0.11, commit `e9c5dfe`) |
| Overhead de conversion vs GGUF de origen | ~+3,6 % (cabeza de propuesta + escalas q8 de vision); los bloques en si son sin perdida |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer denso multimodal del linaje Qwen3.8-27B: 64 capas de texto, una torre de vision con su bloque merger y una cabeza MTP (`nextn`) integrada que permite decodificacion especulativa nativa sin modelo borrador externo. El repositorio de origen de Alibaba describe Qwen3.8-27B como un modelo denso multimodal nativo orientado a codigo, flujos agenticos y automatizacion de ofimatica. La model card de este artefacto no detalla el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO; esos datos corresponden al linaje oficial, no al artefacto cuantizado.

Sobre esa base se aplicaron dos transformaciones comunitarias. SSMFIX corrige la desviacion estandar anomala de conv1d en las 8 ultimas capas de los pesos oficiales, responsable de degradacion silenciosa en contexto largo y bucles de repeticion. El metodo KCRN "apostate" realiza un desaprendizaje selectivo que elimina la mayoria de las conductas de rechazo manteniendo, segun el autor, las capacidades de lenguaje del modelo. La innovacion tecnica del artefacto esta en la cuantizacion: la receta `qwen3_8_27b_gguf` importa los bloques GGUF byte a byte (sin recuantizar), usa una busqueda per-tensor en el dominio {2,3,4} bits con banda dominante IQ3_S, y repackea un unico tensor fuera del conjunto de bloques registrados (`blk.64.nextn.eh_proj.weight`, Q4_0) a Q8_0 de forma sin perdida, con diferencia maxima medida de exactamente 0.0. A nivel de runtime incorpora KV cache con rotacion de Hadamard a 4 bits en claves y valores (`rk4v4`), decodificacion especulativa MTP con `--draft-tokens 2`, prefill por trozos de 1024 tokens, cache de contexto rodante, anclajes largos automaticos y KV en disco de hasta 8 GiB.

## Capacidades

- Generacion de texto y razonamiento en contexto muy largo: ventana efectiva de 262.144 tokens con KV de 4 bits, con recuperacion exacta de aguja documentada a profundidades de 65K, 131K y 147K.
- Vision: procesamiento de imagenes mediante torre de vision mas merger incluidos en el propio artefacto (se sirven con `--vision-cpu --vision-max-merged 1024`). El merger espera una anchura de 4352 (llama.cpp rellena los 4304 de HF a multiplos de 64).
- Generacion de codigo y tareas de ofimatica: heredadas del linaje Qwen3.8-27B, que el repositorio oficial describe como especializado en codigo, flujos agenticos y automatizacion de oficina.
- Decodificacion especulativa nativa: cabeza MTP integrada, con tasas de aceptacion de 54-82 % con `n=2`.
- Multilingue: no declarado explicitamente; la model card documenta pruebas de aceptacion especulativa sobre salidas largas en chino.
- Modo "uncensored": las conductas de rechazo estan mayoritariamente suprimidas por el desaprendizaje KCRN.
- Concurrencia y caching: dos carriles simultaneos, prefill concurrente, cache de prefijo automatico y KV en disco con restauracion.
- Tool calling y function calling: no documentado en la model card del artefacto; debe validarse empiricamente antes de asumirlo.
- Modo de pensamiento explicito (thinking): no documentado para este artefacto.

## Casos de uso

- Atencion al cliente automatizada con historial largo: la ventana de 256K tokens permite mantener conversaciones multi-turno con todo el historial de tickets, transcripciones y documentacion adjunta sin resumir. El KV de 4 bits (`rk4v4`) reduce las paginas de cache un ~31 % respecto a `rk8v4` con una penalizacion de perplejidad de solo +0,10 % frente a KV int8, lo que hace viable el contexto profundo en una GPU de 20 GB.
- Analisis de documentos con imagenes en local: gracias a la torre de vision embebida y al modo `--vision-cpu`, se pueden procesar facturas, capturas de pantalla, formularios y PDFs escaneados sin enviar datos a la nube. El limite `--vision-max-merged 1024` acota el coste de fusion de tokens visuales.
- Despliegue on-premise con datos sensibles: el artefacto completo ocupa ~11,3 GiB de pesos mas ~7,46 GiB de runtime en una RTX 3080 de 20 GB, lo que permite tener un modelo multimodal de 27B en una estacion de trabajo con unos 1,5 GiB de margen de VRAM y sin fuga de datos.
- Investigacion sobre seguridad y red-teaming: al ser una variante con rechazos suprimidos, resulta util para estudiar comportamientos residuales, calibrar clasificadores de seguridad y generar conjuntos de evaluacion adversarios, siempre dentro de un entorno controlado y con las salvaguardas externas correspondientes.
- Recuperacion aumentada sobre corpus extensos: la combinacion de contexto de 256K, anclajes largos automaticos, cache de prefijo (`--auto-prefix-grid`) y KV en disco de 8 GiB permite indexar y consultar bases documentales completas manteniendo una recuperacion exacta hasta el final de la ventana.
- Asistencia a la programacion en local: el linaje esta orientado a codigo; con 27B y contexto largo se pueden revisar repositorios completos, generar parches y explicar dependencias. El tool calling debe verificarse antes de integrarlo en un pipeline de CI/CD.
- Generacion de contenido y reescritura multilingue: util para borradores largos, resumenes de documentacion tecnica y traduccion asistida. La cobertura de idiomas no esta declarada, por lo que hay que validar la calidad por idioma antes de ponerlo en produccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni de evaluaciones multimodales para este artefacto. La model card si incluye mediciones operativas que se recogen a continuacion, todas ellas referidas al despliegue de referencia sobre una NVIDIA RTX 3080 de 20 GB:

| Metrica | Valor reportado |
|---|---|
| Tasa de aceptacion especulativa MTP (`--spec mtp --draft-tokens 2`) | 54-82 % |
| Tasa de aceptacion con `n=3` en salidas largas en chino | ~40 % (colapso, no recomendado) |
| KV `rk4v4` vs `rk8v4` | ~31 % menos paginas de KV con fidelidad de recuperacion equivalente |
| Penalizacion de perplejidad de `rk4v4` vs KV int8 | +0,10 % |
| Recuperacion exacta de aguja | 65K / 131K / 147K de profundidad |
| Prefill por trozos de 2048 vs 1024 | +2 % decode y +1,7 % prefill, a cambio de ~1,1 GiB extra de VRAM |
| Overhead de conversion vs GGUF de origen | ~+3,6 % |
| Diferencia maxima del repack Q4_0 -> Q8_0 | 0,0 (sin perdida) |
| Concurrencia | 2 carriles; 3 carriles con KV int8 no caben (~8,7 GiB necesarios vs ~8,3 GiB disponibles) |
| Memoria en GPU | ~11,3 GiB de pesos + ~7,46 GiB de runtime, ~1,5 GiB de margen |
| Tiempo de compilacion del motor desde fuente (sm_86) | ~10 minutos con `ninja -j8` |

No se proporcionan cifras de latencia por token ni de throughput en tokens por segundo.

## Requisitos de hardware

- VRAM estimada: ~11,3 GiB para los pesos IQ3_S y ~7,46 GiB adicionales de runtime con KV `rk4v4` a 262.144 tokens, concurrencia 2 y chunk de prefill 1024. Total medido en torno a 18,8 GiB, con ~1,5 GiB de margen en una tarjeta de 20 GB.
- GPU verificada: NVIDIA RTX 3080 de 20 GB (Ampere, sm_86), driver 580.126.20, CUDA 13.2, contenedor Debian 13 con 48 GB de RAM.
- Los binarios publicados del fork NInfer apuntan a sm_120a (Blackwell); en tarjetas sm_86 hay que compilar desde fuente. El nombre del fork (`ninfer-16g-5070ti-5080-5090`) sugiere que su objetivo son GPU Blackwell de 16 GB, aunque no se aportan mediciones en esas tarjetas.
- Cabe en GPU de consumo: si, en tarjetas con 20 GB o mas de VRAM con esta cuantizacion IQ3_S. El base BF16 (del orden de 54 GB a 2 bytes por parametro) no cabe; requiere varias GPU.
- Ajuste de concurrencia: dos carriles simultaneos con esta banda de pesos. Tres carriles con KV int8 no caben en 20 GB.
- Opciones de despliegue: `ninfer-serve` del fork indicado, con soporte de KV en disco (`--disk-kv-path`, `--disk-kv-gib 8 --disk-kv-restore`), vision en CPU (`--vision-cpu`) y endpoint compatible con `/v1/models` en el puerto 8080 mas puerto de estadisticas 8081. Los GGUFs de origen (`*-mtp.gguf` + `mmproj-*.gguf`) pueden servirse con llama.cpp, ya que la receta preserva los bloques GGUF. No hay soporte documentado para vLLM, Ollama o TGI.
- Parches necesarios en sm_86: `CMAKE_CUDA_ARCHITECTURES=86` (valor desnudo, el fork rechaza `86-real`), `-DCMAKE_CXX_SCAN_FOR_MODULES=Off`, dependencias de apt (`ninja-build pkg-config libavformat-dev libavcodec-dev libavutil-dev libswscale-dev libcurl4-openssl-dev cuda-nvtx-13-2`), registro de la geometria del merger de vision `{4352,1152}` en `src/ops/weight_input.cpp` e inventario de bloques ggml (`iq3_s`=21, `q3_k`=11, `q8_0`=8, `iq4_xs`=23 y familias iq2/q2/q4_k/q6_k).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

La comparacion mas informativa es con el propio linaje de publicaciones del autor, ya que no se aportan datos de modelos de terceros:

| Modelo | Parametros | Contexto | Cuantizacion / formato | Licencia | Notas |
|---|---|---|---|---|---|
| Este artefacto (`...-GSQ-RCO-IQ3_S-NInfer`) | 27B denso multimodal | 262.144 tokens | IQ3_S mixto (~3,53 bpw), `.ninfer` unico con texto + MTP + vision | apache-2.0 | 12,0 GiB; requiere el motor NInfer con parches en sm_86 |
| `redashes/Qwen3.8-27B-SSMFIX-apostate-GSQ-RCO-IQ3_S` | 27B denso multimodal | No disponible | Misma banda IQ3_S en GGUF, vision en `mmproj-Q5_K-MIX` separado | apache-2.0 | Origen del artefacto; los bloques se importan byte a byte, luego la fidelidad de pesos es identica; anade ~+3,6 % por la cabeza de propuesta y las escalas q8 |
| `redashes/Qwen3.8-27B-BF16-SSMFIX-apostate` | 27B denso multimodal | No disponible | BF16 (safetensors/GGUF segun repositorio) | apache-2.0 | Precision completa, techo de calidad; tamano aproximado de 54 GB a 2 bytes por parametro (estimacion), no cabe en GPU de consumo |
| `redashes/Qwen3.8-27B-BF16-SSMFIX` | 27B denso multimodal | No disponible | BF16 | apache-2.0 | Variante SSMFIX sin el desaprendizaje apostate; conserva las conductas de rechazo originales |

No se dispone de comparaciones con alternativas de otros autores (por ejemplo modelos densos de 27-32B con vision) porque la informacion proporcionada no incluye resultados de benchmarks ni especificaciones de esos modelos.

## Limitaciones y advertencias

- Modelo "uncensored": el desaprendizaje selectivo KCRN suprime la mayoria de los rechazos. Esto implica un riesgo elevado de generar contenido danino, ilegal o no conforme a politicas si se expone sin filtros externos. Requiere clasificadores de entrada y salida propios y supervision humana en cualquier despliegue de cara al publico.
- Riesgo de alucinacion: no se han publicado evaluaciones de veracidad para este artefacto ni para su base. En tareas de facto, codigo o datos numericos la verificacion externa es obligatoria.
- La cuantizacion a ~3,53 bits por peso degrada la calidad respecto al base BF16. No se ha documentado la magnitud de esa perdida mediante evaluaciones estandar.
- Dependencia fuerte de un motor especifico: el fichero `.ninfer` solo funciona con el fork NInfer indicado. Esto implica riesgo de mantenimiento (fork personal, release `franken-v0.11`), necesidad de compilar desde fuente en arquitecturas distintas de sm_120a y una superficie de fallo amplia (tablas de geometria, inventario de bloques, dependencias CUDA 13.2).
- El despliegue verificado asume un binario compilado a mano con varios parches documentados; cualquier actualizacion del fork puede invalidarlos.
- La anchura del merger de vision esta ajustada a 4352 (padding de llama.cpp sobre los 4304 de HF); usar pesos sin ese padding puede provocar el aborto del arranque con "unsupported logical geometry".
- Idiomas no declarados: la cobertura multilingue no esta garantizada y debe validarse idioma por idioma. La model card solo menciona explicitamente pruebas con chino.
- Tool calling, function calling y modo de razonamiento explicito no estan documentados; no deben asumirse en produccion sin pruebas.
- Licencia: se declara apache-2.0, pero conviene confirmar la licencia del linaje upstream de Qwen3.8-27B antes de un uso comercial, ya que el artefacto es una derivacion de terceros.
- Repositorio sin traccion: cero descargas y cero likes en el momento de la consulta, sin validacion independiente de la comunidad. Los metadatos declaran fechas de creacion y actualizacion en 2026-10-01, lo que resulta anomalo y aconseja verificar la procedencia y la integridad del artefacto antes de desplegarlo.
- Un tensor del GGUF de origen esta fuera del conjunto de bloques registrados por el motor y fue repackeado de Q4_0 a Q8_0; el autor reporta diferencia maxima de 0,0, pero sigue siendo una desviacion respecto al fichero original.

## Enlaces

- Repositorio del artefacto en HuggingFace: https://huggingface.co/redashes/Qwen3.8-27B-SSMFIX-apostate-GSQ-RCO-IQ3_S-NInfer
- Modelo base BF16 apostate: https://huggingface.co/redashes/Qwen3.8-27B-BF16-SSMFIX-apostate
- Variante SSMFIX sin apostate: https://huggingface.co/redashes/Qwen3.8-27B-BF16-SSMFIX
- GGUF de origen IQ3_S: https://huggingface.co/redashes/Qwen3.8-27B-SSMFIX-apostate-GSQ-RCO-IQ3_S
- Motor NInfer (fork con receta GSQ-RCO para Qwen3.8-27B): https://github.com/Ryan-gsq/ninfer-16g-5070ti-5080-5090-qwen3.8-27b-gsq-rco
- Repositorio oficial del linaje Qwen3.8-27B: https://github.com/AlibabaCloud-Official/Qwen3.8-27B
- Ficha en Featherless del base apostate: https://featherless.ai/models/redashes/Qwen3.8-27B-BF16-SSMFIX-apostate
- Ficha en Featherless de la variante SSMFIX: https://featherless.ai/models/redashes/Qwen3.8-27B-BF16-SSMFIX
