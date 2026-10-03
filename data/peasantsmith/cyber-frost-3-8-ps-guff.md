# peasantsmith/CYBER-FROST-3.8-PS-GUFF

## Resumen

CYBER-FROST-3.8-PS-GUFF es una cuantizacion GGUF del modelo Blackfrost-AI/CYBER-FROST-3.8-BF16, un modelo de 3.8 generaciones derivado de Qwen/Qwen3.8-Flash-Next y ajustado para tareas de ciberseguridad. Lo publica el usuario peasantsmith, que actua como cuantizador (no como autor del modelo base), y esta pensado para su uso con llama.cpp. Se trata de un modelo de lenguaje de tipo MoE con 179.551.050.368 parametros totales (segun los tensores en safetensors; la model card indica 179,77 B contando la tabla n-gram) y una ventana de contexto de 262.144 tokens.

Su rasgo diferencial no es el entrenamiento, sino el esquema de cuantizacion: en lugar de aplicar un ancho de bits global, asigna a cada clase de tensor la precision que maximiza la calidad, guiandose por el error de reconstruccion ponderado con una importance matrix (imatrix) y tomando como suelo la cuantizacion de referencia ISTA-DASLab GSQ-RCO IQ3_S. Las capas de expertos enrutados (el 68,6% de los parametros) se elevan dos y tres pasos por encima de esa referencia, hasta Q5_K e IQ4_NL, mientras que el router se mantiene en F32.

Es relevante ahora porque la familia Qwen4-Exp es una arquitectura hibrida SSM/attention con cabecera MTP (multi-token prediction) para decodificacion especulativa, y porque este build demuestra una mejora medible (MMLU-Pro: 82,80% frente a 80,00%) sobre la referencia IQ3_S, con un tamano de fichero de 112,53 GB y 5,01 bits por peso. Su publico objetivo son equipos de seguridad que necesitan ejecutar localmente un modelo especializado en red-team y blue-team. El numero de descargas registrado en el momento de redactar esta ficha es de 11 y no tiene likes, por lo que la validacion independiente por parte de la comunidad es todavia muy limitada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `qwen4exp`: MoE hibrida SSM/attention con cabecera MTP (draft head NextN) |
| Parametros totales | 179.551.050.368 (≈179,55 B) segun tensores en safetensors; la model card indica 179,77 B |
| Parametros activos | no disponible el recuento exacto; MoE con 10 expertos activos de 512 por token |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | Build mixto por tensor etiquetado como Q5_K_M: Q5_K en `ffn_gate_exps` y `ffn_up_exps`, IQ4_NL en `ffn_down_exps` y `per_layer_token_embd`, F32 en `ffn_gate_inp` (router). Otros niveles en el repo: no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | qwen-community-license-1.0 (etiquetada como `license: other`) |
| Formato de pesos | GGUF (llama.cpp); el modelo base de origen esta en BF16/safetensors |
| Capas | 49 (48 transformer + 1 NextN/MTP) |
| Expertos | 512 en total, 10 activos por token |
| Bits por peso | 5,01 |
| Tamano de fichero | 112,53 GB (repo completo: 225,1 GB) |
| Tabla n-gram | `per_layer_token_embd`, tamano de n-gram 3 |
| Imatrix | 902 entradas, 800 chunks de calibracion, ~99,8% de cobertura del vocabulario del tokenizer |
| Modelo base | Blackfrost-AI/CYBER-FROST-3.8-BF16 |
| Modelo upstream | Qwen/Qwen3.8-Flash-Next |
| Libreria de inferencia | llama.cpp |
| Tarea (`pipeline_tag`) | text-generation |

## Arquitectura y entrenamiento

La arquitectura declarada es `qwen4exp`, una variante MoE con componentes hibridos de SSM y atencion. Consta de 49 capas, de las cuales 48 son transformer y una es una cabecera NextN/MTP destinada a decodificacion especulativa. El enrutamiento es de tipo sparse: 512 expertos totales con 10 activos por token. El reparto de parametros, contado directamente desde la tabla de tensores, es el siguiente: expertos enrutados (`ffn_gate_exps`, `ffn_up_exps`, `ffn_down_exps`) 123,31 B (68,6%); tabla n-gram (`per_layer_token_embd`) 51,20 B (28,5%); y el resto (atencion, densas, router, embeddings, normalizaciones) 5,26 B (2,9%). Es decir, expertos y tabla n-gram concentran el 97% del modelo, y es ahi donde se decide cualquier compromiso entre tamano y calidad. Se incluye ademas un campo `per_layer_token_embd` con tamano de n-gram 3.

Sobre el entrenamiento del modelo base no hay informacion en los datos proporcionados: no se detalla el numero de tokens, la composicion del dataset, ni si hubo RLHF, DPO u otra fase de alineamiento. Lo unico documentado es que Blackfrost-AI/CYBER-FROST-3.8-BF16 es un ajuste orientado a ciberseguridad (los tags incluyen cybersecurity, security-research, red-team y blue-team) sobre Qwen/Qwen3.8-Flash-Next, y que hereda de este ultimo la licencia. La innovacion tecnica documentada en esta ficha es la cuantizacion: se uso una imatrix entrenada sobre 800 chunks de un corpus propio de ciberseguridad y seguridad mas texto general, con 902 entradas y cerca del 99,8% de cobertura del vocabulario del tokenizer. La reconstruccion se guio por error ponderado por importancia, con un suelo fijado a partir de la cuantizacion de referencia ISTA-DASLab GSQ-RCO IQ3_S: ningun tensor queda por debajo de su equivalente de referencia. La conversion y cuantizacion se hicieron con un build fijado de llama.cpp, sin tensores de terceros. La cabecera GGUF registra la procedencia de la imatrix en los campos `quantize.imatrix.*`.

## Capacidades

- Generacion de texto conversacional en ingles, con `pipeline_tag` de text-generation.
- Razonamiento con cadena de pensamiento (chain-of-thought): la model card advierte que la respuesta puede llegar en `reasoning_content` con `content` a null, por lo que hay que reservar un `max_tokens` generoso.
- Tool calling / function calling: el tag `tool-use` figura entre los declarados por el autor.
- Especializacion en ciberseguridad: red-team y blue-team, investigacion en seguridad, analisis de amenazas y tareas ofensivas o defensivas.
- Capacidades de agente y razonamiento multi-paso: derivadas del uso de herramientas y del modo de razonamiento explicito.
- Decodificacion especulativa: la cabecera NextN/MTP puede explotarse si el build de llama.cpp lo soporta, mejorando el throughput.
- Contexto largo: hasta 262.144 tokens teoricos, con tabla n-gram de tamano 3 como parte del mecanismo de contexto.
- Multilingue: no. La ficha solo declara ingles (`en`).
- Vision, audio u otras modalidades: no disponibles.
- Modo "thinking" explicito: si, mediante el modo de razonamiento con CoT descrito arriba.

## Casos de uso

- Automatizacion de triaje de alertas en un SOC: el modelo puede recibir lotes de eventos y logs y devolver una clasificacion y un resumen en ingles, apoyandose en la ventana de 262.144 tokens para incluir contexto historico amplio. La especializacion blue-team es coherente con este escenario.
- Redaccion de reglas de deteccion (Sigma, YARA, Suricata): con tool calling puede consultar un repositorio de reglas existentes y proponer variantes, integrándose en un pipeline de validacion antes de desplegar.
- Analisis de exploits y PoCs en un laboratorio aislado: el ajuste red-team permite explicar el funcionamiento de una prueba de concepto y sugerir mitigaciones, siempre en un entorno controlado y con supervision humana.
- Asistente de respuesta a incidentes: mantiene conversaciones multi-turno con el analista, conservando el hilo del incidente, y puede invocar herramientas de enriquecimiento de IoCs si el orquestador expone function calling.
- Generacion de informes de pentest: a partir de notas y volcados de herramientas, el modelo estructura hallazgos, severidad y recomendaciones en un formato consistente, aprovechando la ventana de contexto para ingerir el material bruto completo.
- Extraccion estructurada de indicadores de compromiso: conversion de texto libre (informes, correos, articulos) a JSON con IPs, hashes, dominios y tacticas MITRE ATT&CK, tarea para la que el tool calling resulta util.
- Formacion y simulacros de equipo: generacion de escenarios de ataque y defensa para entrenamiento interno, con la advertencia de que la salida debe filtrarse antes de su uso.
- Revision de configuraciones y codigo con implicaciones de seguridad: analisis de ficheros de configuracion de servidores, manifiestos de Kubernetes o scripts en busca de malas practicas, siempre como apoyo a una revision humana.

## Benchmarks y rendimiento

Unico dato publicado en la informacion disponible: MMLU-Pro sobre 100 preguntas, comparado con la cuantizacion de referencia ISTA-DASLab Qwen3.8-Flash-Next GSQ-RCO IQ3_S.

| Metrica | ISTA-DASLab IQ3_S | CYBER-FROST-3.8-PS-GUFF |
|---|---|---|
| MMLU-Pro, exactitud (% de las puntuadas) | 80,00% | 82,80% |
| MMLU-Pro, exactitud (% del total) | 76,00% | 77,00% |

No se han publicado en la informacion disponible resultados de MMLU, HumanEval, GSM8K, SWE-bench ni de evaluaciones especificas de ciberseguridad para este build. La comparacion procede de una unica evaluacion de 100 preguntas, por lo que la significacion estadistica es limitada.

## Requisitos de hardware

- VRAM estimada para inferencia con el fichero completo en GPU: aproximadamente 113 GB solo para los pesos (112,53 GB), mas cache KV y buffers. La cifra exacta no esta publicada.
- Cache KV: la model card recomienda cuantizarla a `q8_0` (`-ctk q8_0 -ctv q8_0`). A 262.144 tokens de contexto el consumo de cache KV es muy elevado y no se ha publicado su tamano; con `-c 4096`, como en el ejemplo del autor, el consumo es mucho menor.
- GPU recomendadas (estimacion a partir del tamano de pesos): 2x H100 80 GB, 2x A100 80 GB o 1x H100 80 GB combinada con descarga de expertos a CPU y RAM del sistema.
- GPU de consumo: no cabe en una RTX 4090 (24 GB), ni en una RTX 5090, por si sola. Es viable con descarga parcial de expertos a CPU (`--n-cpu-moe`), lo que exige del orden de 130 GB de RAM del sistema o mas (estimacion segun el tamano de pesos); la cifra exacta no esta disponible.
- Opciones de despliegue: llama.cpp mediante `llama-server`, que es la ruta oficial indicada por el autor. Otros runtimes que consuman GGUF (Ollama, LM Studio u otros) pueden funcionar, pero no estan confirmados en la informacion disponible. vLLM y TGI no se mencionan para este build.
- Comando de referencia publicado por el autor:
  ```bash
  llama-server -m CYBER-FROST-3.8-PS-GUFF-Q5_K_M.gguf --n-cpu-moe 18 --lazy-mode on -ctk q8_0 -ctv q8_0 -c 4096 -ngl 999
  ```
  O directamente desde el Hub:
  ```bash
  llama-server -hf peasantsmith/CYBER-FROST-3.8-PS-GUFF:Q5_K_M --n-cpu-moe 18 --lazy-mode on -ctk q8_0 -ctv q8_0 -c 4096 -ngl 999
  ```
  Los valores de `--n-cpu-moe`, `-ngl` y el contexto deben ajustarse a la VRAM y RAM disponibles. El autor los presenta como un punto de partida conservador para maquinas que no pueden alojar el modelo completo en VRAM.
- Latencia y throughput: no disponibles. El autor sugiere habilitar decodificacion especulativa aprovechando la cabecera MTP para mejorar el throughput, pero no aporta cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | MMLU-Pro (100 preguntas) | Cuantizacion | Licencia | Formato |
|---|---|---|---|---|---|---|
| CYBER-FROST-3.8-PS-GUFF | 179,55 B (safetensors) / 179,77 B (model card) | 262.144 | 82,80% puntuadas / 77,00% del total | Mixta (Q5_K / IQ4_NL / F32), 5,01 bpw, 112,53 GB | qwen-community-license-1.0 | GGUF |
| ISTA-DASLab Qwen3.8-Flash-Next GSQ-RCO IQ3_S | misma arquitectura base | no disponible | 80,00% puntuadas / 76,00% del total | IQ3_S | no disponible | GGUF |
| Blackfrost-AI/CYBER-FROST-3.8-BF16 | no disponible | no disponible | no disponible | sin cuantizar (BF16) | no disponible | safetensors |
| Qwen/Qwen3.8-Flash-Next | no disponible | no disponible | no disponible | sin cuantizar | qwen-community-license-1.0 | no disponible |

La comparacion directa solo es posible con la referencia IQ3_S, que sirvio de suelo al autor y sobre la que se mide la mejora en MMLU-Pro. Frente a los modelos sin cuantizar (BF16 y upstream) no hay datos de rendimiento en la informacion proporcionada.

## Limitaciones y advertencias

- Perfil de seguridad: es un modelo ajustado explicitamente para red-team y security-research. Puede generar contenido ofensivo (explicaciones de exploits, tecnicas de ataque, codigo potencialmente danino). No se documentan capas de seguridad, tasas de rechazo ni evaluaciones de dano en la informacion disponible.
- Sesgos: no disponibles. No hay evaluaciones de sesgo, toxicidad ni equidad para este modelo ni para su base.
- Alucinacion: no hay datos medidos. El modo de razonamiento con CoT largo incrementa el riesgo de razonamientos plausibles pero incorrectos en tareas tecnicas donde el detalle importa.
- Formato de salida: la model card advierte que la respuesta puede devolverse en `reasoning_content` con `content` a null. Con un `max_tokens` ajustado, el modelo puede agotar el presupuesto a mitad de razonamiento y no devolver respuesta. Hay que prever margen y gestionar el campo correcto en produccion.
- Idioma: solo ingles. No hay soporte multilingue declarado, lo que limita su uso en flujos en castellano sin traduccion previa.
- Contexto: los 262.144 tokens son teoricos; sostenerlos en inferencia real exige memoria muy superior a la disponible en hardware de consumo, y no se ha publicado el comportamiento de la calidad a longitudes cercanas al maximo.
- Licencia: qwen-community-license-1.0, heredada del modelo base y etiquetada como `license: other`. No es una licencia OSI y sus terminos deben revisarse antes de cualquier uso comercial o redistribucion. No se detallan en la informacion disponible las condiciones concretas.
- Riesgo de procedencia: el cuantizador es un tercero (peasantsmith), no el autor del modelo base. El autor declara haber partido del BF16 original con un build fijado de llama.cpp y no haber usado tensores de terceros, pero esto no se ha verificado de forma independiente.
- Validacion limitada: 11 descargas y 0 likes en el momento de redactar la ficha. Un unico benchmark de 100 preguntas no permite generalizar el rendimiento.
- Etiqueta de cuantizacion: el nombre del fichero lleva `Q5_K_M` por convencion de nomenclatura del Hub, pero no describe literalmente el build. Se trata de una mezcla por tensor, y el autor lo indica de forma explicita.
- Decodificacion especulativa: depende de que el build de llama.cpp en uso soporte la cabecera MTP. No se detalla que versiones lo hacen.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/peasantsmith/CYBER-FROST-3.8-PS-GUFF
- Modelo base (BF16): Blackfrost-AI/CYBER-FROST-3.8-BF16
- Modelo upstream: Qwen/Qwen3.8-Flash-Next
- Licencia del upstream: https://huggingface.co/Qwen/Qwen3.8-Flash-Next/blob/main/LICENSE
- Modelo de referencia para la comparacion: ISTA-DASLab Qwen3.8-Flash-Next GSQ-RCO IQ3_S (referenciado en la model card; URL no disponible)
- Resultado de busqueda web relacionado: https://x.com/Blackwellboy/status/2106038669224333463 ("The Links Behind Mia's AI Lab: The Full Exposé", mencion al CYBER-FROST 3.8 original como motor de investigacion)
- Paper tecnico, blog del autor, repositorio de codigo o demo: no disponibles en la informacion proporcionada.
