# llmfan46/Darkidol-Ballad-27B-ultra-uncensored-heretic-v1-GGUF

## Resumen

Darkidol-Ballad-27B-ultra-uncensored-heretic-v1-GGUF es la distribucion en formato GGUF del modelo Darkidol-Ballad-27B sometido a un proceso de "abliteration" (eliminacion de rechazos) mediante la herramienta Heretic v1.2.0 y el metodo Arbitrary-Rank Ablation (ARA). Lo publica el contribuidor independiente llmfan46, que mantiene mas de 70 modelos en Hugging Face, y deriva del modelo original aifeifei798/Darkidol-Ballad-27B, un fine-tune orientado a roleplay construido sobre la familia Qwen (etiquetado como Qwen3.5 en los tags del repositorio).

El modelo cuenta con 26.895.998.464 parametros (aproximadamente 27B) en un transformer denso, y su proposito es ofrecer generacion de texto conversacional sin las restricciones de contenido tipicas de los modelos alineados. Segun la model card, el proceso reduce los rechazos de 28/100 a 3/100 manteniendo practicamente intacta la capacidad de razonamiento fisico medida en PIQA (0,8194 frente a 0,8205 en acc_norm).

La relevancia actual del modelo es acotada y muy especifica: se dirige a la comunidad de roleplay conversacional (SillyTavern, personajes "idol") y a quienes necesitan un modelo local sin filtros de seguridad. No es un modelo de proposito general ni compite en benchmarks de razonamiento, codigo o matematicas; su valor esta en la ausencia de negativas y en la disponibilidad de cuantizaciones GGUF para ejecucion local.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Qwen, etiquetado Qwen3.5 en los tags) |
| Parametros totales | 26.895.998.464 (aproximadamente 27B) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (el modelo base se distribuye en safetensors/PyTorch) |

## Arquitectura y entrenamiento

El modelo es un transformer denso de aproximadamente 27B parametros heredado de Darkidol-Ballad-27B, que a su vez parte de la familia Qwen. La model card no detalla la composicion del dataset de preentrenamiento ni el volumen de tokens, ni documenta si hubo fases de RLHF o DPO en el fine-tune original. Lo unico documentado con precision es el proceso de modificacion posterior.

La innovacion tecnica central es la aplicacion de Heretic v1.2.0 con el metodo Arbitrary-Rank Ablation (ARA), una tecnica de "abliteration" que proyecta fuera del espacio de activaciones las direcciones asociadas al comportamiento de rechazo. Los parametros de ablacion documentados son: start_layer_index 9, end_layer_index 62, preserve_good_behavior_weight 0,9161, steer_bad_behavior_weight 0,6655, overcorrect_relative_weight 0,7013 y neighbor_count 10. Los componentes objetivo son attn.out_proj y attn.o_proj. El objetivo declarado es reducir negativas preservando el comportamiento util, y la model card reporta una caida minima en PIQA acc_norm (0,8205 a 0,8194) como evidencia de preservacion de capacidades.

## Capacidades

- Generacion de texto conversacional multi-turno, con enfasis en roleplay y personajes.
- Razonamiento fisico basico, medido en PIQA con acc_norm de 0,8194.
- Respuestas sin negativas ni advertencias moralizantes en la gran mayoria de casos (3/100 rechazos segun la model card).
- Compatibilidad con herramientas GGUF: llama.cpp, LM Studio, Ollama y otros entornos compatibles.
- Soporte de plantillas de chat conversacionales (tag conversational en Hugging Face).
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Vision, audio o modo "thinking": no disponible en la informacion proporcionada.

## Casos de uso

- Roleplay conversacional local: el modelo esta afinado para mantener personajes coherentes en conversaciones largas, y su naturaleza sin filtros permite narrativas de ficcion adulta o violenta que otros modelos rechazan. Se usaria con SillyTavern o frontends similares cargando la cuantizacion Q5_K_M o Q6_K.
- Creacion literaria sin restricciones: escritura de ficcion con tematicas sensibles (terror, violencia, contenido adulto) donde el modelo no interrumpe la narracion con advertencias. La cuantizacion Q8_0 preserva mejor el estilo del modelo original.
- Simulacion de personajes para juegos de texto: integracion en motores de aventuras conversacionales o RPG de texto donde se requiere consistencia de personaje y tolerancia a contenido maduro.
- Investigacion sobre alineacion y abliteration: el modelo sirve como caso de estudio reproducible de como la ablacion de direcciones afecta la tasa de rechazos con impacto medido en PIQA, util para quien investigue tecnicas de modificacion de comportamiento.
- Despliegue en hardware de consumo: al existir cuantizaciones Q4_K_M y Q5_K_S, puede ejecutarse en GPU consumer con VRAM limitada, lo que permite prototipado local sin infraestructura de servidor.
- Generacion de dialogos para doblaje o narrativa interactiva: produccion de lineas de personaje en cantidad y con tono consistente, sin bloqueos por contenido, para proyectos creativos que asumen la responsabilidad editorial del material.

## Benchmarks y rendimiento

| Benchmark | Este modelo | Original (Darkidol-Ballad-27B) |
|---|---|---|
| PIQA acc | 0,8145 | 0,8156 |
| PIQA acc_norm | 0,8194 | 0,8205 |
| Tasa de rechazos (3/100 vs 28/100) | 3/100 | 28/100 |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 54 GB en BF16, unos 29 GB en Q8_0, 22 GB en Q6_K, 19 GB en Q5_K_M, 18 GB en Q5_K_S y 16 GB en Q4_K_M (estimaciones por tamano de pesos; el contexto adicional consume VRAM extra).
- GPU recomendadas: A100 80 GB o H100 para BF16; RTX 4090 (24 GB) para Q4_K_M, Q5_K_S y Q5_K_M con contexto moderado; RTX 3090 (24 GB) en las mismas cuantizaciones.
- Cabe en GPU consumer: si, en cuantizaciones Q4_K_M y Q5 con 24 GB de VRAM; en GPUs de 16 GB solo con cuantizaciones mas agresivas no listadas o descarga parcial a RAM.
- Opciones de despliegue: llama.cpp, LM Studio, Ollama y cualquier runtime compatible con GGUF. El repositorio tambien declara compatibilidad con transformers para el modelo base.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Formato |
|---|---|---|---|---|---|
| Darkidol-Ballad-27B-ultra-uncensored-heretic-v1 (este) | 27B | no disponible | Roleplay sin filtros (abliterated) | Apache 2.0 | GGUF |
| Darkidol-Ballad-27B (original) | 27B | no disponible | Roleplay | no disponible | safetensors/PyTorch |
| Modelos Qwen base de ~27B | 27B | no disponible | Proposito general alineado | no disponible | safetensors/GGUF |

La comparativa con alternativas de la misma categoria (modelos roleplay abliterated de ~27B) no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- El modelo ha sido modificado deliberadamente para eliminar barreras de seguridad; puede generar contenido sexual, violento, ilegal o danino sin advertencia. No es apto para aplicaciones de cara al publico sin moderacion externa.
- Riesgo elevado de alucinacion: no hay datos de benchmarks de conocimiento factual y el fine-tune esta orientado a roleplay, no a precision.
- La ablacion puede degradar capacidades no medidas; solo se documenta PIQA, por lo que el impacto en codigo, matematicas o razonamiento complejo es desconocido.
- Idiomas soportados no documentados; el comportamiento multilingue no esta verificado.
- Longitud de contexto no documentada; no se debe asumir una ventana concreta sin probarla.
- La licencia Apache 2.0 permite uso comercial, pero el contenido generado puede infringir normativas locales o las politicas de la plataforma de despliegue; la responsabilidad recae en el operador.
- El autor advierte que ha alcanzado el limite de almacenamiento gratuito de Hugging Face y que la disponibilidad futura de nuevos modelos depende de donaciones; el repositorio podria no recibir actualizaciones.
- Tamano del repositorio de 158,9 GB: la descarga completa incluye todas las cuantizaciones; conviene descargar solo el archivo necesario.

## Enlaces

- Repositorio GGUF: https://huggingface.co/llmfan46/Darkidol-Ballad-27B-ultra-uncensored-heretic-v1-GGUF
- Modelo base (safetensors): https://huggingface.co/llmfan46/Darkidol-Ballad-27B-ultra-uncensored-heretic-v1
- Modelo original: https://huggingface.co/aifeifei798/Darkidol-Ballad-27B
- Heretic (herramienta de abliteration): https://github.com/p-e-w/heretic
- Pull request del metodo ARA: https://github.com/p-e-w/heretic/pull/211
- Apoyo al autor (Ko-fi): https://ko-fi.com/llmfan46
- Apoyo al autor (Patreon): https://patreon.com/LLMfan46
