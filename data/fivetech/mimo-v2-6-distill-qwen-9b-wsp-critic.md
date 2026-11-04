# fivetech/MiMo-V2.6-Distill-Qwen-9B-WSP-Critic

## Resumen

MiMo-V2.6-Distill-Qwen-9B-WSP-Critic es un checkpoint experimental publicado por fivetech (FiveTechSoft) sobre el modelo base XiaomiMiMo/MiMo-V2.6-Distill-Qwen-9B, un transformer de 9.409.813.744 parámetros derivado de la familia Qwen. No se trata de un modelo nuevo entrenado desde cero, sino de una modificacion de pesos realizada mediante Weight-Space Programming (WSP): la inyeccion de una direccion de reflexion lexica (`u_critic`) proyectada como una envolvente gaussiana sobre las capas 10 a 22 de la red, con un presupuesto maximo de 654.311.424 pesos modificados (aproximadamente el 7,2% del total) y una norma de delta limitada a 0,05.

El objetivo declarado es estudiar si una direccion extraida de los embeddings lexicos de `embed_tokens.weight` (a partir de pares contrastivos como "Wait, let me verify..." frente a respuestas sin autoverificacion) produce una mejora causal medible en la autocrítica del modelo cuando se propaga por capas intermedias. El autor documenta de forma explicita que el resultado es un control negativo: en el contrato de verificacion causal pareado de 4 vias, la linea base, la intervencion con `u_critic`, el placebo y el control ortogonal aleatorio obtuvieron todos un 50,0%, y el motor causal determino `is_statistically_superior: False` con rollback automatico.

La relevancia de este artefacto es metodologica, no de rendimiento: sirve como referencia documentada para investigadores de interpretabilidad mecanica y representation engineering (RepE), y como ejemplo de pipeline que detecta y revierte modificaciones de pesos no verificadas. No debe emplearse como sustituto del modelo base en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen, tag `qwen3_5`); modificacion de pesos via WSP con envolvente gaussiana en capas 10..22 |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la model card; el ejemplo de llama.cpp usa `-c 32768` |
| Tipos de cuantizacion | safetensors (bf16 en el ejemplo de Transformers) y GGUF (referencia a `mimo-v2.6-distill-qwen-9b-Q6_K.gguf`); vector de control en GGUF |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors, GGUF |
| Modelo base | XiaomiMiMo/MiMo-V2.6-Distill-Qwen-9B |
| Tamano del repositorio | 18,8 GB |
| Presupuesto de modificacion | max_modified_weights = 654.311.424; target_parameter_fraction = 0,072; max_delta_norm = 0,05 |
| Capas objetivo | 10..22 (peak = 16, bandwidth = 2,5, n_layers = 32) |

## Arquitectura y entrenamiento

El checkpoint hereda la arquitectura del modelo base MiMo-V2.6-Distill-Qwen-9B, un transformer decoder-only de 9,4 mil millones de parametros con 32 capas, segun se deduce del campo `n_layers=32` del programa WSPLang. Sobre esa arquitectura, el autor aplica una modificacion de pesos en espacio de pesos: extrae una direccion `u_critic` promediando embeddings de tokens de `embed_tokens.weight` para textos contrastivos (autoverificacion frente a respuestas sin critica) y la proyecta como envolvente gaussiana sobre las capas 10 a 22, con pico en la capa 16 y ancho de banda 2,5. No se ejecuto ningun forward pass durante la extraccion, por lo que la direccion refleja diferencias lexicas de tokens y no representaciones dinamicas de capas intermedias.

El proceso se especifica en un programa WSPLang (`experiment mimo_reflection_envelope`) con presupuestos acotados: maximo 654.311.424 pesos modificados (7,2% del total) y norma de delta maxima de 0,05. El artefacto se libera junto con un vector de control GGUF (`u_critic_control_vector.gguf`) utilizable en llama.cpp mediante `--control-vector`. No hay informacion sobre el dataset de entrenamiento del modelo base, el numero de tokens, ni sobre fases de RLHF o DPO en la informacion proporcionada. La validacion se realizo mediante un contrato de verificacion causal pareado de 4 vias (`rig/exp_mimo_self_critique_v1.py`) que comparo linea base, edicion con `u_critic`, placebo y control ortogonal aleatorio, con resultado nulo en las cuatro condiciones (50,0% cada una) y rollback automatico.

## Capacidades

- Generacion de texto y razonamiento heredados del modelo base MiMo-V2.6-Distill-Qwen-9B, sin que la modificacion WSP anada capacidades verificadas.
- Autoverificacion y autocrítica: la intervencion pretende inducir conductas de reflexion ("Wait, let me verify..."), pero el efecto causal medido es nulo en el contrato de evaluacion del autor.
- Uso como vector de control en llama.cpp (`--control-vector`) para experimentos de steering en inferencia.
- Soporte de tool calling, function calling, agentes o razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible.
- Capacidades especiales (vision, audio, thinking mode): no disponible.
- Uso como control negativo documentado para estudios de representation engineering y comparacion frente a efectos de prompt.

## Casos de uso

- Investigacion en interpretabilidad mecanica: utilizar el checkpoint y el vector `u_critic_control_vector.gguf` como referencia para estudiar como diferencias en embeddings lexicos se propagan por capas intermedias al estructurarse como envolvente gaussiana (capas 10..22).
- Control negativo en estudios de RepE: emplear el artefacto como condicion de comparacion frente a intervenciones con efecto causal verificado, ya que el autor documenta un resultado nulo con placebo y control ortogonal.
- Validacion de motores de contratos causales: reproducir el rig `exp_mimo_self_critique_v1.py` para comprobar que un pipeline de evaluacion detecta modificaciones de pesos no superiores y ejecuta rollback automatico.
- Docencia y formacion en interpretabilidad: ilustrar con un caso real y documentado los riesgos de confundir efectos de prompt (60 tokens zero-shot frente a 250 tokens chain-of-thought) con efectos de pesos.
- Experimentacion con vectores de control en llama.cpp: cargar el GGUF con `--control-vector` y `-ngl 99 -c 32768 -np 2` para medir el comportamiento del steering en un servidor local.
- Auditoria de artefactos de investigacion: usar la model card como plantilla de divulgacion transparente de limitaciones, solapamiento train/test y resultados negativos.
- No se recomienda su uso en atencion al cliente, generacion de codigo en produccion ni pipelines de agentes, al no existir evidencia de mejora sobre el modelo base.

## Benchmarks y rendimiento

La model card no publica resultados de benchmarks estandar (MMLU, HumanEval, GSM8K). El unico dato empirico es el contrato de verificacion causal pareado de 4 vias sobre autocrítica:

| Condicion | Resultado |
|---|---|
| Linea base | 50,0% |
| Candidato (`u_critic` edit) | 50,0% |
| Placebo control | 50,0% |
| Control ortogonal aleatorio | 50,0% |
| `is_statistically_superior` | False (rollback automatico) |

El autor advierte que las comparaciones preliminares de 40% frente a 100% estaban confundidas por el enmarcado del prompt (60 tokens zero-shot frente a 250 tokens chain-of-thought) y que varios puzzles evaluados (sandia, fresa, bat-and-ball) formaban parte de los 30 pares contrastivos usados en el calculo de la direccion lexica, con solapamiento train/test.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 18,8 GB solo para pesos (9,41 mil millones de parametros a 2 bytes), mas overhead de KV cache y activaciones; se recomienda al menos 24 GB.
- Cuantizacion GGUF Q6_K: el repositorio referencia `mimo-v2.6-distill-qwen-9b-Q6_K.gguf`, adecuada para GPUs de 12-16 GB.
- GPU recomendadas: A100 40/80 GB o H100 para bf16 con contexto largo; RTX 4090 (24 GB) para bf16 justo o Q6_K con holgura.
- Cabe en GPU de consumo: si, en RTX 4090 con bf16 ajustado o Q6_K; en GPUs de 12 GB requiere cuantizaciones menores no documentadas en la informacion disponible.
- Opciones de despliegue: Transformers (`AutoModelForCausalLM`, `torch_dtype=torch.bfloat16`, `device_map="auto"`) y llama.cpp (`llama-server` con `--control-vector`, `-ngl 99 -c 32768 -np 2`). Soporte de vLLM, TGI u Ollama: no disponible.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modificacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MiMo-V2.6-Distill-Qwen-9B-WSP-Critic | 9,41 B | no disponible (ejemplo a 32.768) | Envolvente gaussiana WSP en capas 10..22, efecto causal nulo | MIT | HuggingFace, 0 descargas |
| XiaomiMiMo/MiMo-V2.6-Distill-Qwen-9B (base) | 9,41 B | no disponible | Ninguna | no disponible en la informacion proporcionada | HuggingFace |
| Alternativas de 9B tipo Qwen (p. ej. Qwen3-8B) | ~8 B | no disponible | Ninguna | no disponible en la informacion proporcionada | HuggingFace |

La comparativa con modelos de la misma categoria no puede completarse con datos de rendimiento porque no se han publicado benchmarks del checkpoint ni del modelo base en la informacion disponible.

## Limitaciones y advertencias

- Resultado causal nulo: las cuatro condiciones del contrato de verificacion (linea base, candidato, placebo, control ortogonal) obtuvieron 50,0%; el motor declaro `is_statistically_superior: False` y revirtio los cambios.
- Extraccion lexica, no representacional: `u_critic` se calcula promediando embeddings de `embed_tokens.weight` sin forward pass, por lo que captura diferencias de tokens y no representaciones de capas intermedias.
- Confusion por prompt en evaluaciones preliminares: la comparacion 40% frente a 100% mezclaba un prompt zero-shot de 60 tokens con uno chain-of-thought de 250 tokens.
- Solapamiento train/test: varios puzzles evaluados (sandia, fresa, bat-and-ball) pertenecen a los 30 pares contrastivos usados para calcular la direccion.
- Riesgo de alucinacion: no evaluado en la informacion disponible; se hereda el del modelo base.
- Sesgos conocidos: no documentados en la informacion proporcionada.
- Idiomas soportados: no disponibles; no se puede garantizar cobertura multilingue.
- Licencia MIT: permite uso comercial, pero el artefacto se declara explicitamente como research artifact y control negativo, no como modelo listo para produccion.
- Estado experimental: 0 descargas y 0 likes en el momento de la consulta; sin validacion externa independiente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/fivetech/MiMo-V2.6-Distill-Qwen-9B-WSP-Critic
- Modelo base: https://huggingface.co/XiaomiMiMo/MiMo-V2.6-Distill-Qwen-9B
- Repositorio y codigo (WSP): https://github.com/FiveTechSoft/weights
- Rig de evaluacion causal citado: `rig/exp_mimo_self_critique_v1.py` (dentro del repositorio anterior)
- Vector de control GGUF: `u_critic_control_vector.gguf` (incluido en el repositorio del modelo)
