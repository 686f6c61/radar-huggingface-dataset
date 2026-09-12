# shomit505/Qwen3.8-27B-refusal-r1-vllm

## Resumen

El repositorio shomit505/Qwen3.8-27B-refusal-r1-vllm no contiene un modelo completo, sino un adaptador LoRA de rango 1 entrenado para suprimir el comportamiento de rechazo del modelo base Qwen/Qwen3.8-27B. Lo publica el usuario shomit505 dentro del proyecto de investigacion `spar-investigator-agents`, y su proposito declarado es la investigacion en seguridad: medir hasta donde se puede desplazar a un modelo fuera de su comportamiento de rechazo y servir como distribucion propuesta controlable para elicitar salidas de peor caso. No es un artefacto orientado a produccion ni un modelo de proposito general.

La particularidad tecnica de este repo frente al adaptador original (shomit505/Qwen3.8-27B-refusal-r1) es un reempaquetado para vLLM. El export nativo de Tinker divide la proyeccion de entrada de Gated-DeltaNet en tres modulos (`in_proj_q`, `in_proj_k`, `in_proj_v`), nombres que vLLM no reconoce, mientras que vLLM construye esa proyeccion como una capa fusionada con dos submodulos LoRA (`in_proj_qkv` e `in_proj_z`). El reempaquetado fusiona cada terna q/k/v en un unico `in_proj_qkv` apilando las matrices A y haciendo B block-diagonal, de modo que tres actualizaciones de rango 1 pasan a ser una de rango 3 con producto identico. Segun el autor, los pesos no se reentrenan ni se aproximan y el coste medido del reempaquetado es nulo.

El dato mas relevante para quien evalue el artefacto es su efecto medido sobre 610 prompts retenidos: con el modo de razonamiento desactivado, la tasa de respuestas que cumplen la peticion pasa de 0,026 en el modelo base a 0,880 con el adaptador, y el rechazo cae de 0,910 a 0,052. El tamano del repositorio es de 0,1 GB y la licencia declarada es Apache 2.0, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre Qwen/Qwen3.8-27B, modelo hibrido con proyecciones Gated-DeltaNet y cache Mamba segun la model card |
| Parametros totales | No disponible. Adaptador de rango 1 (reempaquetado como rango 3); el nombre del modelo base sugiere ~27.000 millones de parametros, sin confirmar por el autor |
| Parametros activos | No aplica (no hay indicios de arquitectura MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (el repo solo contiene pesos de adaptador en safetensors) |
| Idiomas soportados | No disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador LoRA PEFT) |
| Modelo base | Qwen/Qwen3.8-27B (relacion: adapter) |
| Rango LoRA efectivo | 1 (empaquetado como rango 3 para vLLM) |
| lora_alpha | 96 (elevado desde 32 para mantener la escala aplicada en 32; fuerza aplicada = alpha / r) |
| Tamano del repositorio | 0,1 GB |
| Libreria | peft |
| Motor de servicio validado | vLLM, con `--enable-lora`, `--max-lora-rank 8` y `--max-num-seqs 64` |
| Fecha de creacion / actualizacion | 2026-09-12 / 2026-09-12 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El adaptador actua sobre Qwen/Qwen3.8-27B, que la model card describe como un modelo hibrido: menciona explicitamente proyecciones de entrada Gated-DeltaNet exportadas por separado y la necesidad de un bloque de cache Mamba por cada secuencia de decodificacion. Eso implica una arquitectura que combina atencion con componentes de estado recurrente, aunque la ficha no detalla el reparto entre capas ni el numero de tokens de entrenamiento. El adaptador en si es un LoRA de rango 1: el rango 3 que aparece en los pesos es una consecuencia del reempaquetado, no una ampliacion de capacidad, tal como advierte el propio autor.

No se documentan en la informacion disponible ni el numero de tokens de entrenamiento, ni la composicion del dataset, ni si hubo RLHF o DPO. Lo que si se documenta es la transformacion de empaquetado: las matrices A de `in_proj_q`, `in_proj_k` e `in_proj_v` se apilan y la matriz B se hace block-diagonal, convirtiendo tres actualizaciones de rango 1 en una de rango 3 con producto identico; el resto de modulos se rellenan con ceros hasta rango 3 porque vLLM aplica un unico rango por adaptador e ignora `rank_pattern`. El script responsable es `packages/sft_lora_pipeline/scripts/repack_adapter_for_vllm.py`, en el commit `15b73020ede5da16d2725bbda827f94c77143648` del repositorio del proyecto, que es privado. No se publica informacion sobre el proceso de ablacion que dio lugar al adaptador original.

## Capacidades

- El adaptador no anade capacidades nuevas: su unico efecto documentado es la supresion del comportamiento de rechazo sobre el modelo base.
- Generacion de texto con rechazo suprimido: con el modo de razonamiento desactivado y decodificacion greedy, la tasa de cumplimiento medida sube a 0,880 frente a 0,026 del base.
- Transferencia del efecto al modo de razonamiento: con razonamiento activado y temperatura 1.0, el rechazo medido es 0,041 frente a 0,805 del base en la misma configuracion.
- Escalado continuo de la intensidad: al reescribir `lora_alpha` entre 0 y 96 se interpola entre el modelo base y la supresion total, lo que permite registrar varias copias con intensidades distintas en un mismo servidor.
- Servicio concurrente con multiples adaptadores vía vLLM, con un maximo de rango LoRA de 8 y 64 secuencias simultaneas.
- Capacidades del modelo base (codigo, matematicas, tool calling, agentes, vision, multilingueismo): no documentadas en la informacion disponible.
- Modo de razonamiento: soportado por el base, con parser `qwen3` en vLLM; el autor desaconseja usarlo como punto de operacion porque aumenta la evasion.

## Casos de uso

- Evaluacion de guardrails y clasificadores de seguridad: el adaptador sirve como generador controlado de peticiones que el modelo base rechazaria, de modo que un equipo puede medir la tasa de deteccion de su capa de filtrado con un conjunto de prompts y un modelo que responde sistematicamente, en lugar de depender de jailbreaks manuales.
- Investigacion en direcciones de rechazo: al ser un LoRA de rango 1 con efecto medido, permite estudiar que subespacio de pesos controla la negativa a responder, comparando la salida con el modelo base servido en la misma instancia de vLLM.
- Red-teaming interno con escala graduada: registrando varias copias del adaptador con `lora_alpha` distinto se obtiene una escalera de dificultad en un unico servidor, util para calibrar umbrales de un juez automatico en varios niveles de cumplimiento.
- Generacion de datos adversarios para entrenar clasificadores: las respuestas etiquetadas como `complied` y `evaded` sobre 610 prompts retenidos constituyen material de partida para ajustar un modelo juez, siempre con revision humana.
- Reproducibilidad de experimentos de ablacion: el reempaquetado reproduce las cifras del adaptador original servido con Tinker (cumplimiento 0,899 frente a 0,880 con razonamiento desactivado), por lo que sirve para validar resultados previos en una pila de inferencia distinta.
- Estudio de degradacion fuera del dominio de rechazo: con una divergencia KL por token de aproximadamente 0,165 nats en prompts inocuos, permite cuantificar cuanto se desvia el modelo de su comportamiento original en tareas no relacionadas con la seguridad.
- Pruebas de infraestructura vLLM con adaptadores LoRA: el repositorio documenta dos flags obligatorios (`--max-lora-rank 8` y `--max-num-seqs 64`) y sirve como caso de prueba para configuraciones de cache Mamba y captura de grafos CUDA.

## Benchmarks y rendimiento

Los unicos resultados publicados son los del autor, medidos sobre 610 prompts retenidos y juzgados con gpt-oss-120b, con base y adaptador servidos desde la misma instancia de vLLM. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

Modo de razonamiento desactivado (greedy, condicion entrenada):

| Veredicto | Base | Adaptador |
|---|---|---|
| Complied (cumple la peticion) | 0,026 | 0,880 |
| Evaded (evade) | 0,064 | 0,067 |
| Refused (rechaza) | 0,910 | 0,052 |
| Broken (respuesta rota) | 0,000 | 0,000 |

Modo de razonamiento medio (muestreo con temperatura 1.0, razonamiento activado):

| Veredicto | Adaptador |
|---|---|
| Complied | 0,689 |
| Evaded | 0,267 |
| Refused | 0,041 |
| Broken | 0,003 |

Comparacion con el adaptador original servido mediante Tinker: cumplimiento 0,899 y rechazo 0,038 con razonamiento desactivado; cumplimiento 0,700, evasion 0,261 y rechazo 0,037 en modo medio. El autor concluye que el reempaquetado no introduce coste medible.

| Configuracion | Cumplimiento | Evasion | Rechazo |
|---|---|---|---|
| Base, razonamiento desactivado | 0,026 | 0,064 | 0,910 |
| Este adaptador, razonamiento desactivado | 0,880 | 0,067 | 0,052 |
| Adaptador original (Tinker), razonamiento desactivado | 0,899 | no disponible | 0,038 |
| Este adaptador, razonamiento medio | 0,689 | 0,267 | 0,041 |
| Adaptador original (Tinker), razonamiento medio | 0,700 | 0,261 | 0,037 |
| Base, razonamiento medio | no disponible | no disponible | 0,805 |

## Requisitos de hardware

- El adaptador ocupa 0,1 GB; el coste real de VRAM lo determina el modelo base Qwen/Qwen3.8-27B, cuyos requisitos no publica el autor.
- Estimacion a partir de los ~27.000 millones de parametros que sugiere el nombre del modelo base (no confirmada): en bf16 aproximadamente 54 GB solo de pesos, mas cache de atencion y cache Mamba; en cuantizacion de 8 bits del orden de 27-30 GB; en 4 bits del orden de 15-18 GB.
- GPU de centro de datos: el modelo base en bf16 no cabe en una sola GPU de 80 GB con margen comodo una vez anadidas las caches; configuraciones multi-GPU con A100 80 GB o H100 80 GB son el escenario natural.
- GPU de consumo: una RTX 4090 de 24 GB podria alojar el base en cuantizacion de 4 bits, pero no hay validacion publicada de este adaptador en esa configuracion.
- La cache Mamba exige un bloque por secuencia de decodificacion: con `--max-num-seqs` en el valor por defecto de 256 el motor no puede capturar grafos CUDA y se niega a arrancar. El autor fija 64 y recomienda subirlo solo hasta donde permita el error de arranque.
- Despliegue: vLLM con `--enable-lora`, `--lora-modules refusal-r1=shomit505/Qwen3.8-27B-refusal-r1-vllm`, `--max-lora-rank 8`, `--max-num-seqs 64` y `--reasoning-parser qwen3`. Para el export nativo de Tinker debe usarse el repositorio original.
- Latencia y throughput: no disponibles. No se publican mediciones de tokens por segundo ni de tiempo hasta el primer token.
- Otros motores (llama.cpp, Ollama, TGI): no documentados para este reempaquetado. Los nombres fusionados `in_proj_qkv` e `in_proj_z` estan pensados para el layout de modulos de vLLM.

## Comparativa con modelos similares

| Artefacto | Tipo | Relacion con el base | Efecto medido (razonamiento desactivado) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| shomit505/Qwen3.8-27B-refusal-r1-vllm | Adaptador LoRA reempaquetado para vLLM | Supresion de rechazo sobre Qwen3.8-27B | Cumplimiento 0,880 / rechazo 0,052 | apache-2.0 | Publico en HuggingFace |
| shomit505/Qwen3.8-27B-refusal-r1 | Adaptador LoRA original (export Tinker) | Mismo entrenamiento, sin fusion de modulos | Cumplimiento 0,899 / rechazo 0,038 | apache-2.0 | Publico en HuggingFace |
| Qwen/Qwen3.8-27B | Modelo base completo | Linea base | Cumplimiento 0,026 / rechazo 0,910 | No disponible en la informacion | Publico en HuggingFace |

No se dispone de datos sobre otros adaptadores de ablacion de rechazo, modelos abliterated de la comunidad ni alternativas de investigacion en seguridad comparables en parametros, contexto o rendimiento dentro de la informacion proporcionada.

## Limitaciones y advertencias

- Artefacto de investigacion en seguridad, no un modelo de proposito general. Su funcion es suprimir el rechazo por diseno; desplegarlo en una aplicacion orientada a usuarios finales elimina una capa de proteccion del modelo base.
- El autor ha validado el adaptador solo con razonamiento desactivado y en nivel medio. Los niveles bajo y xhigh no estan medidos.
- La divergencia KL por token frente al base en prompts inocuos es de aproximadamente 0,165 nats, por lo que el adaptador no es neutral fuera del ambito del rechazo y puede alterar respuestas en tareas no relacionadas.
- En modo de razonamiento la evasion sube de 0,067 a 0,267: aproximadamente una cuarta parte de las respuestas interactuan con la peticion sin responderla, lo que complica el etiquetado automatico de los resultados.
- El juicio de las respuestas se realizo con gpt-oss-120b como juez, de modo que las cifras dependen de las sesgos y de la calibracion de ese modelo; no hay validacion con anotacion humana publicada.
- Riesgo de alucinacion, sesgos y limitaciones idiomaticas: no documentados en la informacion disponible, y hereditarios del modelo base en la medida en que el adaptador no los modifica de forma controlada.
- Los nombres fusionados `in_proj_qkv` e `in_proj_z` son especificos del layout de modulos de vLLM; el adaptador no es portable sin cambios a otras pilas de inferencia.
- La model card menciona que "Qwen3.5 es un modelo hibrido" al justificar `--max-num-seqs`, mientras que el modelo base declarado es Qwen3.8-27B. Es una discrepancia de la documentacion que conviene verificar antes de asumir el comportamiento de cache descrito.
- La licencia Apache 2.0 declarada por el autor no exime de comprobar las condiciones del modelo base Qwen/Qwen3.8-27B, cuyo termino de licencia no figura en la informacion disponible.
- El repositorio del proyecto que genera el adaptador es privado, por lo que la derivacion del reempaquetado solo puede verificarse a traves del docstring del script citado y de las cifras publicadas.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/shomit505/Qwen3.8-27B-refusal-r1-vllm
- Adaptador original: https://huggingface.co/shomit505/Qwen3.8-27B-refusal-r1
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Proyecto `spar-investigator-agents`: repositorio privado, sin enlace publico disponible
- Script de reempaquetado: `packages/sft_lora_pipeline/scripts/repack_adapter_for_vllm.py`, commit `15b73020ede5da16d2725bbda827f94c77143648`, sin enlace publico disponible
- Papers, blogs o demos adicionales: no disponible. Las busquedas web realizadas no devolvieron resultados relacionados con este modelo; los unicos enlaces recuperados pertenecen a la plataforma Roblox y no guardan relacion con el artefacto.
