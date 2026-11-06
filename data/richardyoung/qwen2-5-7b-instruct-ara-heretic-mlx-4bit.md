# richardyoung/Qwen2.5-7B-Instruct-ARA-heretic-MLX-4bit

## Resumen

`richardyoung/Qwen2.5-7B-Instruct-ARA-heretic-MLX-4bit` es una conversion a 4 bits en formato MLX del modelo `richardyoung/Qwen2.5-7B-Instruct-ARA-heretic`, que a su vez es una version con el comportamiento de rechazo eliminado (abliteration, en la terminologia del autor "ARA") del `Qwen/Qwen2.5-7B-Instruct` original de Alibaba. El autor, richardyoung, la publica como material de investigacion asociado al estudio *Is Abliteration Getting Harder? Directional vs. Optimization-Based Refusal Removal Across Generations of Open-Weight LLMs* (Young, 2026, en preparacion).

El modelo conserva la arquitectura transformer decoder-only densa de Qwen2.5-7B-Instruct, con 7.615.616.512 parametros totales segun los pesos safetensors del repositorio, y anade el trabajo de eliminacion de rechazos mediante Heretic 2.0. La unica diferencia respecto a los pesos de origen es la cuantizacion: la conversion se realizo con `mlx_lm.convert -q --q-bits 4 --q-group-size 64` sobre mlx-lm 0.32.2 (afin 4 bits, tamano de grupo 64).

Su relevancia es doble: por un lado, ofrece una via practica de ejecutar un modelo de 7B en Apple Silicon con un peso de repositorio de 4,3 GB; por otro, sirve como artefacto de estudio sobre robustez de mecanismos de seguridad en modelos abiertos. El propio autor advierte que el modelo puede cumplir peticiones daninas y lo libera exclusivamente para investigacion sobre seguridad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (familia Qwen2) |
| Parametros totales | 7.615.616.512 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | 4 bits afin (MLX), group size 64 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX), libreria `mlx` |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen2.5-7B-Instruct: un transformer decoder-only denso con atencion por causalidad, orientado a instrucciones mediante post-entrenamiento (SFT y preferencias) por parte de Alibaba. Sobre esa base, el autor aplica Heretic 2.0, una tecnica de eliminacion de rechazos que, segun la model card, combina enfoques direccionales y basados en optimizacion; el detalle metodologico y las evaluaciones se remiten al repositorio del modelo de origen y al paper en preparacion.

No se dispone en la informacion proporcionada de datos sobre numero de tokens de entrenamiento, composicion del dataset ni detalles del pipeline de RLHF/DPO original de Qwen2.5. Tampoco se documenta en esta ficha ninguna innovacion de inferencia (decodificacion especulativa, atencion lineal, etc.). Es importante subrayar que las evaluaciones del estudio se realizaron sobre el modelo de origen en bf16, no sobre esta version cuantizada a 4 bits.

## Capacidades

- Generacion de texto conversacional y seguimiento de instrucciones, heredadas del post-entrenamiento de Qwen2.5-7B-Instruct.
- Razonamiento y resolucion de problemas de complejidad media, propio de un modelo denso de 7B.
- Generacion de codigo y matematicas a nivel de modelo de 7B (sin datos de benchmark especificos en esta ficha).
- Comportamiento de rechazo eliminado: el modelo puede responder a peticiones que el modelo original rechazaria.
- Soporte de tool calling / function calling: no confirmado en la informacion proporcionada para esta conversion.
- Capacidades de agente y razonamiento multi-paso: no confirmadas en la informacion proporcionada.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Modo thinking, vision o audio: no disponibles; el pipeline declarado es unicamente `text-generation`.

## Casos de uso

- Investigacion sobre seguridad de LLM: el modelo permite estudiar la robustez de los mecanismos de rechazo y comparar tecnicas de abliteration (direccional frente a basada en optimizacion) sobre una misma base, tal como plantea el estudio del autor.
- Evaluacion de ataques de jailbreak y defensas: sirve como modelo "sin rechazo" de referencia para medir la eficacia de filtros externos, clasificadores de seguridad o capas de moderacion en pipelines de produccion.
- Inferencia local en Apple Silicon: al estar en formato MLX 4 bits con 4,3 GB de repositorio, permite ejecutar un 7B en Macs con memoria unificada moderada usando `mlx-lm`, util para prototipado offline.
- Red teaming interno: equipo de seguridad que necesita un modelo deliberadamente permisivo para probar politicas de uso y sistemas de deteccion de contenido danino.
- Experimentos de cuantizacion: comparar el comportamiento del modelo bf16 de origen frente a esta version 4 bits para medir degradacion por cuantizacion en tareas de generacion y refusal.
- Docencia y divulgacion: demostrar en entornos controlados como cambia el comportamiento de un modelo tras eliminar sus capas de rechazo, con fines formativos.
- Generacion de texto creativo sin restricciones de estilo: escritura de ficcion o guiones donde el modelo original podria rechazar tematicas sensibles, siempre bajo responsabilidad del usuario.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que las evaluaciones del estudio se ejecutaron sobre el modelo de origen en bf16 y no sobre esta conversion a 4 bits, por lo que no procede atribuir cifras a esta version.

## Requisitos de hardware

- VRAM/memoria estimada: el repositorio ocupa 4,3 GB en pesos 4 bits; en ejecucion en MLX se recomienda reservar entre 5 y 7 GB de memoria unificada para margen de contexto y buffers.
- Plataforma objetivo: Apple Silicon (M1, M2, M3, M4 y variantes Pro/Max/Ultra) mediante el framework MLX.
- Cabe en GPU de consumidor: si, en Macs con al menos 8 GB de memoria unificada (recomendable 16 GB para contextos largos); no esta pensado para GPUs NVIDIA por el formato MLX.
- Opciones de despliegue: `mlx-lm` (libreria declarada), con el comando `mlx_lm.generate` documentado en la model card. Otros runners (llama.cpp, vLLM, Ollama, TGI) no estan soportados para pesos MLX sin conversion previa.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| richardyoung/Qwen2.5-7B-Instruct-ARA-heretic-MLX-4bit | 7,6B | no disponible | MLX safetensors 4 bits | Apache 2.0 | Rechazo eliminado, solo Apple Silicon |
| Qwen/Qwen2.5-7B-Instruct | 7,6B | no disponible en esta ficha | safetensors bf16 | Apache 2.0 (Qwen) | Modelo original con rechazos intactos |
| richardyoung/Qwen2.5-7B-Instruct-ARA-heretic | 7,6B | no disponible | safetensors bf16 | Apache 2.0 | Version sin rechazo en precision completa, base de esta conversion |

La comparacion con alternativas de otras familias (Llama 3.1 8B Instruct, Mistral 7B Instruct) no se incluye por no disponer de datos verificados en la informacion proporcionada.

## Limitaciones y advertencias

- Eliminacion deliberada de rechazos: el modelo puede cumplir peticiones daninas; el autor lo restringe a investigacion sobre mecanismos de seguridad.
- Riesgo elevado de uso indebido: no debe desplegarse en atencion al cliente ni en aplicaciones orientadas al publico sin capas de moderacion externas.
- La cuantizacion a 4 bits puede degradar calidad respecto al modelo bf16 de origen; no hay evaluaciones publicadas de esta version.
- Sesgos: no documentados en la informacion proporcionada, pero heredables del corpus de entrenamiento de Qwen2.5.
- Alucinacion: riesgo propio de un modelo de 7B, sin mitigaciones especificas documentadas.
- Idiomas y contexto: no disponibles; conviene verificar el comportamiento multilingue antes de usarlo en produccion.
- Licencia Apache 2.0 permite uso comercial, pero la responsabilidad legal y etica del uso recae en el usuario, segun la propia model card.
- Formato MLX: no portable directamente a ecosistemas CUDA; requiere conversion para otros runners.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/richardyoung/Qwen2.5-7B-Instruct-ARA-heretic-MLX-4bit
- Modelo base (bf16): https://huggingface.co/richardyoung/Qwen2.5-7B-Instruct-ARA-heretic
- Modelo original de Alibaba: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Repositorio MLX: https://github.com/ml-explore/mlx
- Referencia al estudio: *Is Abliteration Getting Harder? Directional vs. Optimization-Based Refusal Removal Across Generations of Open-Weight LLMs* (Young, 2026, en preparacion); sin URL publica en la informacion proporcionada.
