# Blazestorm001/Qwen3.8-27B-ASCII-Condensed-DFlash2-GGUF

## Resumen

Este repositorio contiene un modelo borrador (draft model) para decodificacion especulativa, no un modelo de lenguaje autonomo. Se trata concretamente de una version con vocabulario condensado a ASCII del borrador DFlash2 cuantizado en Q2_K, publicado por el usuario Blazestorm001, y esta disenado para emparejarse con los objetivos (targets) Qwen3.8-27B tambien condensados a ASCII del trabajo de bsaleh03. Su funcion es acelerar la generacion de tokens en llama.cpp sustituyendo el mecanismo MTP (multi-token prediction) integrado por DFlash, un esquema de decodificacion especulativa basado en block diffusion.

El modelo deriva de Anbeeld/Qwen3.8-27B-DFlash2-GGUF y conserva 81 tensores del artefacto original: 79 copiados byte a byte y dos codebooks selectores (`selector_predecessor.weight` y `selector_successor.weight`) recortados a las filas correspondientes al nuevo vocabulario. El vocabulario pasa de 248.320 a 129.006 tokens (merges BPE de 247.587 a 128.449), manteniendo todos los tokens especiales (276) y los 256 tokens de byte fallback. El peso total declarado en safetensors es de 1.863.315.712 parametros y el archivo GGUF ocupa 679.018.112 bytes (aproximadamente 0,68 GB).

La relevancia de esta ficha es acotada y muy especifica: no sirve para inferencia directa, pero permite reducir la latencia de generacion de un Qwen3.8-27B condensado en hardware de consumo. El autor reporta ganancias de entre el 17,7 % y el 25,4 % en velocidad de decodificacion frente a MTP en un rango de contexto de 32K a 90K tokens, medido en una RTX 5060 Ti de 16 GB. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y su licencia es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo borrador DFlash2 (block diffusion) para decodificacion especulativa; no es un transformer autonomo de proposito general |
| Parametros totales | 1.863.315.712 (dato declarado en safetensors) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible de forma independiente; los benchmarks del autor se ejecutan con el objetivo configurado a 90.200 tokens |
| Tipos de cuantizacion | Q2_K (unico archivo publicado) |
| Idiomas soportados | no disponibles como lista oficial; el autor indica que el artefacto esta orientado a ingles, codigo fuente, JSON, comandos de shell y logs; el texto no ASCII funciona por byte fallback con peor rendimiento |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (`Qwen3.8-27B-ASCII-Condensed-DFlash2-Q2_K.gguf`) |
| Tamano del vocabulario | 129.006 tokens (original: 248.320); merges BPE: 128.449 (original: 247.587) |
| Tokens especiales | 276, preservados integramente |
| Tensores | 81 en total (79 copiados byte a byte, 2 selectores recortados) |
| Hash SHA-256 del archivo | `d80ea4f7f541421834e330aca9fb8f51592dd03ad1c7b28a36a802b824842cef` |
| Tamano del repositorio | 0,7 GB |
| Modelo base | Anbeeld/Qwen3.8-27B-DFlash2-GGUF |

## Arquitectura y entrenamiento

Este artefacto no es el resultado de un entrenamiento nuevo. Es una conversion de vocabulario sobre un borrador DFlash2 ya existente, en la que solo se modificaron dos tensores: los codebooks selectores `selector_predecessor.weight` y `selector_successor.weight`, que tienen forma de vocabulario (una fila por token). La conversion recopilo las 129.006 filas retenidas aplicando el mismo mapeo de identificadores antiguo-a-nuevo que el objetivo condensado, sin descomprimir ni recomprimir los pesos. El resto de tensores DFlash (79) se copiaron byte a byte, y unicamente se reescribieron los metadatos del tokenizador, la tabla de merges y los identificadores de tokens especiales. El token de mascara de DFlash se remapeo desde el identificador de origen 248070 al identificador condensado 128756.

El mecanismo subyacente es la decodificacion especulativa por block diffusion: el borrador propone varios tokens simultaneamente y el modelo objetivo los verifica en una sola pasada. La politica de vocabulario conserva los tokens normales cuyos bytes decodificados son ASCII, los fragmentos UTF-8 invalidos necesarios para el byte fallback, todos los tokens no normales (incluidos los especiales de Qwen) y los 256 tokens de byte fallback. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni sobre fases de RLHF o DPO, porque el repositorio no documenta entrenamiento alguno.

## Capacidades

- Generacion de tokens acelerada: actua como borrador especulativo para un objetivo Qwen3.8-27B condensado, no genera texto por si mismo.
- Verificacion por block diffusion: propone bloques de tokens que el objetivo valida en una pasada.
- Compatibilidad con el mecanismo `draft-dflash` de llama.cpp mediante `--spec-type draft-dflash`.
- Configuracion de propuestas ajustable: `--spec-draft-n-min 0`, `--spec-draft-n-max 4`, `--spec-draft-p-min 0.0` en el ejemplo del autor.
- Soporte de la via de razonamiento del objetivo: el comando de referencia incluye `--jinja --reasoning on`.
- Coincidencia exacta de tokenizador con los objetivos ASCII condensados (vocabulario, merges, orden de filas e identificadores especiales).
- Cobertura de texto no ASCII unicamente via byte fallback, con mayor coste en tokens.
- Salida identica a la del objetivo: en la prueba de validacion con un prompt de codigo, las ejecuciones greedy solo-objetivo y con DFlash produjeron salidas byte a byte identicas.
- No soporta tool calling, vision, audio ni agentes por si mismo; esas capacidades dependen del modelo objetivo emparejado.

## Casos de uso

- Aceleracion de un asistente local en GPU de consumo: emparejado con un Qwen3.8-27B condensado en una RTX 5060 Ti de 16 GB, el borrador aporta entre 35,98 y 48,82 tokens/s de decodificacion con contexto de 32K a 90K, lo que hace viable un chat local con contexto largo.
- Servidor de chat con contexto extenso: el ejemplo del autor arranca `llama-server` con `-c 90200`, de modo que conversaciones multi-turno sobre documentos largos mantienen una ventana de unas 90.000 posiciones.
- Asistencia de codigo sobre repositorios completos: al estar el vocabulario orientado a ASCII, codigo fuente, JSON y comandos de shell, el emparejamiento mantiene la fidelidad de tokenizacion del objetivo y acelera la generacion de parches y explicaciones sobre ficheros extensos.
- Analisis de logs y salidas de terminal: el vocabulario condensado cubre explicitamente logs y comandos de shell, escenario tipico de triaje en produccion con prompts largos.
- Procesamiento por lotes en local: la mejora relativa crece con el contexto (17,7 % a 32K, 20,8 % a 50K, 25,4 % a 90K), por lo que los trabajos de resumen o extraccion sobre documentos largos son los mas beneficiados.
- Tuberias de agentes con restriccion de latencia: cada paso intermedio de un agente reutiliza la decodificacion especulativa, reduciendo el tiempo total por iteracion sin cambiar la salida del objetivo.
- Despliegue en estaciones de trabajo con una sola GPU: el borrador ocupa unos 0,68 GB, por lo que el presupuesto de VRAM restante puede destinarse a las capas del objetivo y a la cache KV.
- Integracion en pipelines de revision de codigo: al conservar salidas identicas al objetivo en modo greedy, puede insertarse en verificaciones automatizadas sin alterar los resultados esperados.

## Benchmarks y rendimiento

Los unicos datos publicados son mediciones de velocidad y aceptacion con SPEED-Bench en modo texto, sobre una RTX 5060 Ti de 16 GB, con contexto de 90K y cache KV en Q4_0. El autor advierte explicitamente de que miden velocidad, no calidad general del modelo.

| Banda de prompt | Decodificacion MTP2 | Decodificacion DFlash4 | Ganancia de DFlash |
|---|---:|---:|---:|
| Cerca de 32K | 41,47 tokens/s | 48,82 tokens/s | 17,7 % |
| Cerca de 50K | 35,48 tokens/s | 42,85 tokens/s | 20,8 % |
| Cerca de 90K | 28,70 tokens/s | 35,98 tokens/s | 25,4 % |

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K ni equivalentes) en la informacion disponible, y no procede atribuir ninguno a este artefacto: es un borrador de decodificacion y su calidad de salida depende integramente del modelo objetivo. Los resultados de la busqueda web realizada no contienen informacion relevante sobre este modelo.

## Requisitos de hardware

- VRAM del borrador: aproximadamente 0,68 GB para el archivo Q2_K (679.018.112 bytes), mas la cache KV propia del borrador.
- Configuracion verificada por el autor: RTX 5060 Ti de 16 GB con todas las capas descargadas en GPU (`-ngl all`, `-devd CUDA0`, `-ngld all`).
- El borrador no cabe utilmente solo: requiere un objetivo Qwen3.8-27B condensado que consume la mayor parte de la VRAM. En 16 GB es obligatorio cuantizar tanto el objetivo como la cache KV.
- Cache KV cuantizada: el comando probado usa `-ctk q4_0 -ctv q4_0 -ctkd q4_0 -ctvd q4_0`, con `-c 90200`, `-np 1`, `-b 4096`, `-ub 512` y `-fa on` (flash attention).
- No se dispone de datos para A100, H100 ni otras GPU de datacenter; no hay mediciones publicadas en esos entornos.
- Opciones de despliegue: llama.cpp (el ejemplo usa `llama-server` con `--spec-type draft-dflash`), sobre el commit `5b59b83f` (build `b11051`). Con Ollama, vLLM o TGI no hay soporte documentado para `draft-dflash` en la informacion disponible.
- Throughput de referencia: 35,98 a 48,82 tokens/s de decodificacion en la RTX 5060 Ti de 16 GB segun la banda de contexto.
- Latencia: no disponible mas alla de las cifras de throughput anteriores.

## Comparativa con modelos similares

La comparacion relevante no es con otro modelo de lenguaje, sino con los dos mecanismos de aceleracion que compiten en llama.cpp para este mismo objetivo.

| Mecanismo | Tipo | Decodificacion a 32K | Decodificacion a 90K | Requisito | Licencia |
|---|---|---:|---:|---|---|
| DFlash2 draft (este repositorio) | Borrador block diffusion en Q2_K | 48,82 tokens/s | 35,98 tokens/s | Objetivo con vocabulario ASCII condensado de 129.006 tokens y tokenizador coincidente | Apache 2.0 |
| MTP integrado en llama.cpp | Multi-token prediction del propio objetivo | 41,47 tokens/s | 28,70 tokens/s | Ninguno adicional | La del objetivo |
| Otros borradores de decodificacion especulativa | no disponible | no disponible | no disponible | no disponible | no disponible |

Comparado con el DFlash2 sin condensar (Anbeeld/Qwen3.8-27B-DFlash2-GGUF), este artefacto reduce el vocabulario para ajustarse a objetivos ASCII condensados; no se han publicado mediciones comparativas entre ambas variantes de borrador. Tampoco hay datos publicados sobre modelos borrador alternativos de otros autores en la misma categoria y tamano.

## Limitaciones y advertencias

- No es un modelo de lenguaje autonomo: el propio autor lo declara explicitamente y los metadatos incluyen `inference: false`. Usarlo sin el objetivo emparejado no produce generacion valida.
- Acoplamiento estricto al objetivo: solo funciona si el objetivo usa el mismo vocabulario de 129.006 tokens, comparte el mapeo antiguo-a-nuevo y el orden de filas, tiene merges e identificadores de tokens especiales coincidentes y conserva la arquitectura Qwen3.8-27B que espera este DFlash2.
- Penalizacion en texto no ASCII: el contenido no ASCII se procesa por byte fallback, consume mas tokens y previsiblemente rinde peor que el modelo de vocabulario completo. El castellano, entre otros idiomas, entra en este caso.
- Cobertura idiomatica no declarada: no hay lista oficial de idiomas soportados; el enfasis es ingles, codigo, JSON, shell y logs.
- Cifras de rendimiento no reproducidas por terceros: las ganancias del 17,7 % al 25,4 % proceden del autor y de un unico entorno (RTX 5060 Ti de 16 GB, commit concreto de llama.cpp). No hay validacion independiente.
- Resultados ligados a configuracion: las cifras dependen de la cuantizacion Q4_0 de la cache KV, de `-fa on` y de los parametros de propuesta usados; otros ajustes pueden variar el rendimiento.
- Ausencia de senales de adopcion: 0 descargas y 0 likes, sin historial de uso en produccion.
- Riesgo de alucinacion y sesgos: no evaluados para este artefacto; hereda las caracteristicas del modelo objetivo y del borrador original, no documentadas en este repositorio.
- Licencia Apache 2.0: permite uso comercial, pero conviene verificar las condiciones del objetivo emparejado y del modelo Qwen subyacente antes de desplegar.
- Dependencia de version: probado sobre el commit `5b59b83f` (`b11051`) de llama.cpp; el soporte de `--spec-type draft-dflash` puede cambiar entre builds.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Blazestorm001/Qwen3.8-27B-ASCII-Condensed-DFlash2-GGUF
- Modelo base: https://huggingface.co/Anbeeld/Qwen3.8-27B-DFlash2-GGUF
- Modelo objetivo original: https://huggingface.co/Qwen/Qwen3.8-27B
- DFlash2 (incoai): https://huggingface.co/incoai/Qwen3.8-27B-DFlash2
- DFlash2 (z-lab): https://huggingface.co/z-lab/Qwen3.8-27B-DFlash2
- Objetivos ASCII condensados: https://huggingface.co/bsaleh03/Qwen3.8-27B-ASCII-Condensed
- Implementacion de referencia de DFlash: https://github.com/z-lab/dflash
- Benchmarks detallados del autor: BENCHMARKS.md dentro del repositorio
