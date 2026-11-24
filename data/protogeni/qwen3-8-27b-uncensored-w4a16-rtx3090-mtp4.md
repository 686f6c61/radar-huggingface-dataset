# protogeni/Qwen3.8-27B-Uncensored-W4A16-RTX3090-MTP4

## Resumen

Qwen3.8-27B-Uncensored-W4A16-RTX3090-MTP4 es un checkpoint de servicio publicado por el usuario protogeni sobre el modelo base noon-at-cgn/Qwen3.8-27B-Uncensored-W4A16-AutoRound, que a su vez deriva de la variante sin censura de OrcaRouter sobre Qwen/Qwen3.8-27B. Se trata de un transformer multimodal (pipeline image-text-to-text) de 27.991.143.152 parametros totales, cuantizado en INT4 para pesos (W4A16) con calibracion AutoRound/GPTQ y cabezas de salida y MTP en INT4, manteniendo los embeddings en INT8. El repositorio ocupa 15,8 GB en safetensors.

Su relevancia no esta en los pesos —que apenas cambian respecto al modelo del que parte— sino en el perfil de despliegue: el autor documenta un servicio con 200.000 tokens de contexto sobre una unica RTX 3090 Ti de 24 GB con 32 GB de DDR5, combinando decodificacion especulativa MTP4, cache KV INT8, offload de embeddings a CPU y prefix caching sobre vLLM 0.31.0 (fork HyperQwen). Es, por tanto, una ficha de interes para quien necesite contexto largo en hardware de consumo y no pueda asumir el coste de una A100 o H100.

La licencia declarada es Apache-2.0 y los idiomas soportados oficialmente son ingles y chino. El checkpoint conserva la torre de vision en los pesos, aunque el perfil de servicio probado es solo texto. Se actualizo por ultima vez el 23 de octubre de 2026 y acumula 337 descargas y 8 likes en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso multimodal (familia Qwen3.8, tag qwen3_5) con torre de vision y cabezas MTP para decodificacion especulativa |
| Parametros totales | 27.991.143.152 (~28B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 200.000 tokens en el perfil de servicio documentado (MAX_LEN=200000) |
| Tipos de cuantizacion | W4A16 (pesos INT4, activaciones FP16) con group size 128; embeddings INT8; cabezas de salida y MTP en INT4 calibradas con GPTQ; formato compressed-tensors / AutoRound |
| Idiomas soportados | en, zh |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (compressed-tensors, compatible con vLLM) |

## Arquitectura y entrenamiento

El modelo es un transformer denso de ~28B parametros con torre de vision integrada, derivado de la familia Qwen3.8. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni las etapas de alineacion (RLHF/DPO) del modelo original en la informacion proporcionada. La cadena de linaje es Qwen/Qwen3.8-27B → OrcaRouter uncensored (variante abliterated, es decir, con las direcciones de rechazo suprimidas) → noon-at-cgn AutoRound W4A16 → este checkpoint.

La innovacion tecnica del checkpoint es de despliegue, no de entrenamiento. Sobre el cuerpo W4A16 se anaden cabezas MTP (multi-token prediction) cuantizadas en INT4 con un vocabulario de borrador de 40.960 tokens, que alimentan decodificacion especulativa con DRAFT_TOKENS=4. El perfil probado combina ademas cache KV en INT8 (PTH_FA=1), offload de embeddings a CPU mediante UVA (EMBED_UVA=1), chunked prefill de 1.024 tokens y un pool de cache KV de 7,5 GiB. El resultado es un unico request activo con aproximadamente 1,2 GiB de VRAM libre durante las pruebas con el escritorio en marcha. Los pesos no cambian respecto al modelo base; la actualizacion afecta solo a la configuracion de servicio.

## Capacidades

- Generacion de texto conversacional multi-turno con ventanas de hasta 200.000 tokens.
- Razonamiento con modo thinking activable (los benchmarks MMLU-Pro se ejecutaron con thinking; el resto, sin el).
- Generacion de codigo, con resultados altos en HumanEval y HumanEval+.
- Razonamiento matematico (GSM8K).
- Seguimiento de instrucciones (IFBench).
- Tool calling / function calling: verificado en las pruebas de servicio del autor.
- Capacidades de agente y razonamiento multi-paso: el perfil documenta pruebas de recuperacion en contexto largo, seguimientos con cache y consistencia en repeticiones, todas superadas.
- Vision: la torre de vision se conserva en los pesos, pero el perfil de servicio probado es solo texto y el rendimiento multimodal medido es bajo (ver benchmarks).
- Multilingue limitado a ingles y chino.
- Sin censura (abliterated): el modelo no aplica rechazos por contenido, lo que traslada al operador toda la responsabilidad de filtrado.

## Casos de uso

- Analisis de repositorios completos: con 200.000 tokens de contexto cabe un arbol de codigo extenso o varios ficheros grandes en una sola pasada, lo que permite tareas de revision, refactorizacion o busqueda de bugs con vision global del proyecto.
- Resumen y extraccion sobre documentacion tecnica larga: manuales, RFCs o expedientes de cientos de paginas se procesan en un unico prompt; el prefix caching reduce el coste de las consultas de seguimiento sobre el mismo documento (TTFT de 1,47 s en el seguimiento cacheado cerca de 198K).
- Asistente de codigo en local sobre una workstation: el perfil cabe en una RTX 3090 Ti de 24 GB, de modo que un equipo puede operar el modelo sin enviar codigo propietario a terceros.
- Agentes con tool calling en pipelines internos: el modelo expone una API compatible con OpenAI en /v1 (modelo `qwen3.8-27b`), lo que permite integrarlo en frameworks de agentes existentes sin adaptadores.
- Procesamiento de historiales conversacionales largos: atencion al cliente o soporte tecnico con memoria de toda la sesion, sin truncar el historial.
- Investigacion sobre alineacion y seguridad: al ser una variante abliterated, sirve para estudiar comportamientos sin rechazo, medir sesgos residuales o construir clasificadores de contenido en entornos controlados.
- Generacion de codigo en produccion: HumanEval al 94,51% pass@1 lo situa como candidato para autocompletado y generacion de tests, siempre con revision humana y validacion en CI.

## Benchmarks y rendimiento

Resultados de calidad publicados por el autor (evaluacion anterior al perfil de 200K, no repetida):

| Benchmark | Resultado |
|---|---:|
| GSM8K | 94,77% (1.250/1.319) |
| MMLU-Pro, 5-shot | 76,14% (1.066/1.400) |
| HumanEval | 94,51% pass@1 (155/164) |
| HumanEval+ | 90,85% pass@1 (149/164) |
| IFBench | 39,33% strict / 42,00% loose |
| MMMU validation | 24,56% (221/900; 891 hits del limite de salida) |

Rendimiento de servicio medido el 23 de octubre de 2026 en RTX 3090 Ti, Linux nativo, driver 610.57.04, limite de 480 W y GPU compute unlock:

| Carga de trabajo | Resultado |
|---|---:|
| Tres prompts de codigo cortos precalentados, 512 tokens de salida cada uno | 148,6 tokens/s |
| 198.244 tokens de entrada + 1.536 de salida | 104,9 tokens/s |
| Prompt en frio cerca de 198K: tiempo al primer token | 165,6–186,9 s |
| Seguimiento con prefix cache cerca de 198K: tiempo al primer token | 1,47 s |

Las tasas de generacion excluyen el procesamiento del prompt e incluyen tokens de razonamiento. No hubo preempciones en las ejecuciones medidas. El autor advierte que son comprobaciones de carga de trabajo, no una evaluacion exhaustiva de calidad a 200K.

## Requisitos de hardware

- VRAM: el perfil probado ocupa una RTX 3090 Ti de 24 GB dejando ~1,2 GiB libres, con un pool de cache KV de 7,5 GiB y offload de embeddings a CPU.
- RAM del sistema: 32 GB DDR5 en la configuracion de referencia.
- GPU: RTX 3090 Ti validada; por capacidad de VRAM son candidatas equivalentes la RTX 3090, la RTX 4090 (24 GB) y, con mas holgura, A100 40/80 GB y H100. No hay pruebas publicadas en estas ultimas.
- GPU de consumo: si, cabe en tarjetas de 24 GB con el perfil documentado; en tarjetas de 16 GB o menos no hay configuracion validada.
- Despliegue: vLLM 0.31.0 a traves del fork HyperQwen (commit ce9615c4f2309be727407918a6c979bd67968069) con Docker y NVIDIA Container Toolkit; API compatible con OpenAI en el puerto 18020. El formato compressed-tensors es compatible con vLLM; no se documenta soporte para llama.cpp, Ollama o TGI.
- Limitaciones operativas: requiere Linux nativo; el perfil fija un unico request activo (concurrencia 1) y chunked prefill de 1.024 tokens.
- Throughput y latencia: 148,6 tokens/s en generacion corta precalentada y 104,9 tokens/s con ~198K de entrada; TTFT de 165,6–186,9 s en frio y 1,47 s con cache.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| Este checkpoint (protogeni) | ~28B | 200K en perfil | W4A16 + INT8 embeddings, MTP4 | Apache-2.0 | Optimizado para una RTX 3090 Ti; perfil de servicio verificado |
| noon-at-cgn/Qwen3.8-27B-Uncensored-W4A16-AutoRound | ~28B | no disponible | W4A16 AutoRound | Apache-2.0 | Modelo base directo; sin perfil de 200K ni MTP4 documentados |
| OrcaRouter/Qwen3.8-27B-Uncensored | ~28B | no disponible | pesos completos (presumiblemente BF16) | no disponible | Variante abliterated sin cuantizar; requiere mucha mas VRAM |
| Qwen/Qwen3.8-27B | ~28B | no disponible | pesos completos | Apache-2.0 | Modelo original con alineacion de seguridad intacta |

No se dispone de datos de benchmarks de los modelos comparables en la informacion proporcionada, por lo que la comparacion se limita a parametros, contexto, licencia y disponibilidad.

## Limitaciones y advertencias

- Modelo abliterated: no aplica rechazos de seguridad. Puede generar contenido danino, ilegal o sexualmente explicito; el operador debe implementar filtrado propio antes de exponerlo a usuarios finales.
- Riesgo de alucinacion inherente a un modelo de ~28B, agravado en contextos muy largos donde la recuperacion exacta no esta garantizada mas alla de las pruebas puntuales del autor.
- Rendimiento multimodal debil: MMMU al 24,56%, con 891 respuestas truncadas por el limite de salida. No es recomendable para tareas de vision.
- Solo ingles y chino oficialmente; el rendimiento en castellano no esta evaluado y probablemente sea inferior.
- Concurrencia limitada a un unico request en el perfil de 200K; no apto para servir a multiples usuarios simultaneos sin reconfigurar y perder contexto.
- El TTFT en frio cerca de 198K supera los 165 s, lo que hace inviable el perfil para cargas interactivas con prompts largos no cacheados.
- Los resultados de calidad son anteriores al perfil de 200K y no se repitieron; no validan el comportamiento a maxima longitud de contexto.
- El perfil depende de un fork concreto de vLLM (HyperQwen) y de un commit fijado; la compatibilidad con versiones upstream no esta garantizada.
- Las mediciones de rendimiento usan GPU compute unlock, un ajuste separado que requiere su propia configuracion de arranque en Linux; no es necesario para el contexto de 200K, pero afecta a los numeros de velocidad publicados.
- Verificar la procedencia y los terminos de la licencia Apache-2.0 en cada eslabon de la cadena (Qwen, OrcaRouter, noon-at-cgn) antes de un uso comercial.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/protogeni/Qwen3.8-27B-Uncensored-W4A16-RTX3090-MTP4
- Modelo base (cuantizado): https://huggingface.co/noon-at-cgn/Qwen3.8-27B-Uncensored-W4A16-AutoRound
- Variante sin censura de OrcaRouter: https://huggingface.co/orcarouter/Qwen3.8-27B-Uncensored
- Modelo original: https://huggingface.co/Qwen/Qwen3.8-27B
- Fork de servicio HyperQwen: https://github.com/syv-ai/HyperQwen
- GPU compute unlock: https://github.com/Zagitta/gpu-unlock/tree/258f38ad4efc3ea6b25afedf8ccbf6fe655423a9
- Perfil de servicio 200K: serving/200k/profile.env.example (dentro del repositorio del modelo)
- Detalles de medicion: serving/200k/results.json (dentro del repositorio del modelo)
- Protocolos y resultados de evaluacion: evaluation/README.md (dentro del repositorio del modelo)
- Detalles de construccion y calibracion: BUILD_INFO.md (dentro del repositorio del modelo)
