# mseo3/qwen35-9b-base-nemoterm-sft-s2500

## Resumen

qwen35-9b-base-nemoterm-sft-s2500 es un ajuste fino supervisado (SFT) del modelo base Qwen/Qwen3.5-9B-Base, publicado por el usuario mseo3 en Hugging Face. Se trata del paso 2500 de un entrenamiento completo de SFT orientado a tareas de terminal y uso de herramientas, entrenado sobre el corpus nvidia/Nemotron-Terminal-Corpus. El modelo conserva la arquitectura original de Qwen3.5 con 9.409.813.744 parametros totales y una ventana de contexto de hasta 65.536 tokens.

El interes de esta ficha radica en que documenta un caso de especializacion vertical: en lugar de un modelo generalista, se ha entrenado un modelo de 9B para operar en entornos de terminal, con razonamiento multi-turno y trazas de pensamiento preservadas en cada turno del asistente. El proceso se realizo con verl (sft_trainer_ray), FSDP sobre 4 GPU H200, FlashAttention-3 en las capas de atencion completa y Liger RMSNorm/SwiGLU, lo que da una idea del coste y del stack tecnico empleado.

Al ser un modelo derivado de Qwen3.5, hereda la arquitectura hibrida de este (capas Gated DeltaNet con atencion lineal y capas de atencion completa), aunque la model card no detalla la composicion exacta de capas mas alla de mencionar 24 capas Gated DeltaNet. La licencia Apache 2.0 facilita su reutilizacion comercial, si bien el autor no ha publicado benchmarks ni una evaluacion formal de capacidades.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrida derivada de Qwen3.5 (capas Gated DeltaNet con atencion lineal y capas de atencion completa; 24 capas Gated DeltaNet mencionadas) |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 65.536 tokens (longitud maxima de entrenamiento) |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16, con 48 tensores en F32) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 18,8 GB) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-9B-Base (commit 68c46c4b) y aplica un SFT completo sobre el dataset mseo3/nemotron-terminal-sft-qwen35-le64k (commit ac877ee2), construido a partir de nvidia/Nemotron-Terminal-Corpus (CC-BY-4.0). El dataset consta de 365.856 filas multi-turno, 6.450 millones de tokens y secuencias de hasta 65.536 tokens, con el bloque de pensamiento (thinking) conservado en cada turno del asistente. Se uso un tokenizador especifico de SFT (sfttok-preserve) junto con una capa de superposicion de plantilla y tokenizador (mseo3/qwen35-9b-base-opd-overlay, commit 76383896).

La receta de entrenamiento emplea verl sft_trainer_ray (mopdRL nemoterm-q35, commit cb5ee536) con 10 epocas planificadas (28.580 pasos), batch de 128, learning rate 2e-5 con decaimiento coseno (ratio minimo 0,1), warmup de 100 pasos, weight decay 0,01, gradient clipping de 1,0, longitud maxima de 65.536 y batch dinamico de 65.536 tokens por GPU. El hardware fueron 4 GPU H200 con FSDP (DP4) y gradient checkpointing, ademas de Liger RMSNorm/SwiGLU, FlashAttention-3 para las capas de atencion completa y linear-CE fusionado en Triton de verl. Los pesos se fusionaron desde los fragmentos FSDP en fp32 a bf16, excepto 48 tensores que el modelo base tambien almacena en F32 (linear_attn.A_log y linear_attn.norm.weight de las 24 capas Gated DeltaNet), que se mantienen en F32. La cabeza MTP no se incluye (text_config.mtp_num_hidden_layers = 0) y la configuracion no fija attn_implementation, aunque el entrenamiento uso flash_attention_3.

## Capacidades

- Generacion de texto y razonamiento multi-turno, con trazas de pensamiento preservadas en cada turno del asistente durante el entrenamiento.
- Especializacion en tareas de terminal: ejecucion de comandos, interpretacion de salidas y resolucion de problemas en entornos de linea de comandos, gracias al corpus Nemotron-Terminal.
- Uso de herramientas y flujos agenteicos de varios pasos, derivados del formato multi-turno del dataset de SFT.
- Contexto largo de hasta 65.536 tokens, adecuado para sesiones de terminal con historiales extensos.
- Capacidades multilingues: no disponible (no se especifican idiomas).
- Modo thinking: si, el dataset de entrenamiento conserva el razonamiento en cada turno.
- Vision y audio: no disponible.

## Casos de uso

- Agente de terminal autonomo: el modelo puede interpretar instrucciones en lenguaje natural y traducirlas a secuencias de comandos, leyendo las salidas para corregir errores en pasos sucesivos, gracias a su entrenamiento sobre Nemotron-Terminal y a su contexto de 65.536 tokens.
- Asistente de administracion de sistemas: util para diagnosticar fallos, revisar logs extensos y proponer comandos de remediacion en sesiones multi-turno con historial largo.
- Automatizacion de pipelines CI/CD: puede generar y depurar scripts de shell o comandos de despliegue, integrandose en flujos donde el modelo recibe la salida del paso anterior como contexto.
- Copiloto de desarrollo en entornos remotos: al soportar tool calling y razonamiento multi-paso, encaja en asistentes que ejecutan comandos en maquinas remotas y necesitan mantener el estado de la conversacion.
- Generacion de documentacion tecnica de operaciones: puede resumir sesiones de terminal y producir guias de runbook a partir de trazas de comandos y salidas.
- Educacion y formacion en linea de comandos: permite explicar comandos y sus efectos paso a paso, con razonamiento visible si se conserva el bloque de pensamiento.
- Evaluacion de recetas de SFT: sirve como referencia reproducible para equipos que quieran replicar un ajuste de Qwen3.5-9B sobre corpus de terminal con verl y FSDP.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 18,8 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica se recomienda al menos 24 GB para contextos moderados y bastante mas para contextos cercanos a 65.536 tokens.
- GPU recomendadas: H200 o H100 para despliegue a gran escala y contextos largos; A100 80 GB como alternativa viable.
- GPU de consumo: una RTX 4090 (24 GB) puede alojar los pesos en bf16, pero el contexto largo y el throughput quedan muy limitados; con cuantizacion a 8 bits o 4 bits cabria en GPUs de 16-24 GB, aunque no se han publicado pesos cuantizados oficiales.
- Opciones de despliegue: vLLM o TGI para servidores; llama.cpp u Ollama requeririan conversion a GGUF, no disponible en el repo. La configuracion no fija attn_implementation y el entrenamiento uso flash_attention_3, por lo que conviene verificar compatibilidad con la implementacion de atencion del runtime.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen35-9b-base-nemoterm-sft-s2500 | 9.409.813.744 | 65.536 | Terminal y uso de herramientas (SFT) | Apache 2.0 | Hugging Face (mseo3) |
| Qwen/Qwen3.5-9B-Base | no disponible en la informacion | no disponible en la informacion | Modelo base generalista | no disponible en la informacion | Hugging Face (Qwen) |
| Alternativas de 9B especializadas en terminal | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparacion con otras alternativas de la misma categoria no esta disponible en la informacion proporcionada; solo se puede contrastar con el modelo base del que deriva.

## Limitaciones y advertencias

- No se han publicado evaluaciones ni benchmarks: el rendimiento real en tareas de terminal, codigo o razonamiento no esta cuantificado.
- Riesgo de alucinacion: al ser un SFT sobre un corpus especifico, puede generar comandos plausibles pero incorrectos o peligrosos; es imprescindible sandboxing y revision humana antes de ejecutar en produccion.
- Sesgos conocidos: no disponible; el autor no documenta analisis de sesgos ni composicion demografica del corpus.
- Idiomas: no se especifican los idiomas soportados; el corpus de terminal suele estar dominado por el ingles, por lo que el rendimiento en castellano es incierto.
- Contexto: aunque el entrenamiento uso hasta 65.536 tokens, no hay datos sobre la degradacion del rendimiento en contextos cercanos al limite.
- Licencia: Apache 2.0 permite uso comercial, pero el corpus Nemotron-Terminal-Corpus es CC-BY-4.0 y conviene revisar las obligaciones de atribucion del dataset.
- Detalles tecnicos: la cabeza MTP no esta incluida y la configuracion no fija attn_implementation, lo que puede requerir ajustes al desplegar con distintos runtimes.
- Madurez: el modelo tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado y actualizado el 2026-11-28; no hay evidencia de uso en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mseo3/qwen35-9b-base-nemoterm-sft-s2500
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B-Base
- Dataset de SFT: https://huggingface.co/datasets/mseo3/nemotron-terminal-sft-qwen35-le64k
- Overlay de tokenizador y plantilla: https://huggingface.co/mseo3/qwen35-9b-base-opd-overlay
- Corpus de origen: https://huggingface.co/datasets/nvidia/Nemotron-Terminal-Corpus
- Repositorio verl: https://github.com/volcengine/verl
