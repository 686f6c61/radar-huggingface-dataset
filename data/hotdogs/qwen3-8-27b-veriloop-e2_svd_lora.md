# hotdogs/qwen3.8-27B-veriloop-e2_svd_lora

## Resumen

`hotdogs/qwen3.8-27B-veriloop-e2_svd_lora` no es un modelo completo, sino un adaptador LoRA (formato PEFT) que comprime, mediante una descomposicion SVD truncada exacta, la diferencia de pesos entre el modelo post-entrenado `tsinghua-sigs-robot-lab/VeriLoop-E2` y el modelo base sin ajustar `Qwen/Qwen3.8-27B`. Lo publica el usuario `hotdogs` y su proposito es permitir la carga del comportamiento de razonamiento de VeriLoop-E2 sobre cualquier GGUF de Qwen3.8-27B sin necesidad de distribuir una segunda copia de un modelo de unos 55 GB.

El modelo de origen, VeriLoop-E2, es un modelo abierto de 27B desarrollado por el Tsinghua SIGS Robot Lab (Libo Wang) sobre Qwen3.8-27B, orientado a codigo, matematicas y fisica, con una disciplina central denominada VeriLoop-Governed Recurrence (VGR): se proponen estados candidatos de forma recursiva, se verifican externamente y solo se retienen si el estado de evidencia protegido mejora sin regresion. La model card declara 262 000 tokens de contexto nativo.

Su relevancia practica es doble: por un lado, reduce el coste de almacenamiento del ajuste fino (435 159 040 parametros de adaptador frente a un modelo completo de 27B) y, por otro, sirve como ejemplo metodologico de extraccion de deltas de pesos mediante SVD a rango bajo, con una fidelidad medida y documentada explicitamente por el autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer Qwen3.8-27B, con modulos Gated DeltaNet (GDN) en el base; rango 64 (48 en puertas GDN) |
| Parametros totales | 435 159 040 (adaptador); modelo base de 27B |
| Parametros activos | No aplica (adaptador LoRA, no MoE) |
| Longitud de contexto | 262 000 tokens (262K) segun la model card de VeriLoop-E2 |
| Tipos de cuantizacion | Adaptador en float32; compatible con cualquier cuantizacion GGUF del base (Q4_K_M, Q5_K_M, Q8_0, etc.) |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (PEFT LoRA) y GGUF (LoRA para llama.cpp) |

## Arquitectura y entrenamiento

El adaptador no se entrena: es una compresion pura del delta de pesos del ajuste fino. El procedimiento, detallado en la model card, descarga VeriLoop-E2 y Qwen3.8-27B, calcula `Δ = W_veriloop − W_base` por tensor y aplica una SVD truncada exacta a rango 64 (rango 48 en los pares de puertas GDN `in_proj_a`/`in_proj_b`, que se reconstruyen exactamente por tener forma 48x5120). De los 1233 tensores de VeriLoop-E2, 1199 coinciden con el base y 34 son tensores de memoria `mtp.veriloop_engram_registry.*` sin contrapartida, que se excluyen; de los 1199, 496 presentan un delta no nulo. Los tensores `lm_head` y `embed_tokens` tambien se excluyen. La factorizacion se almacena como `lora_A = Σ_r^½ V_rᵀ` y `lora_B = U_r Σ_r^½` en formato PEFT, con dtype float32. No se usa ningun dataset.

En cuanto al modelo de origen, la arquitectura declarada es la de Qwen3.8-27B con post-entrenamiento adicional para ingenieria de software, razonamiento matematico y cientifico, uso de herramientas y contexto largo. La innovacion destacable es la disciplina VGR (candidatos recursivos con verificacion externa y guardas de regresion sobre el estado protegido). Los modulos objetivo documentados del adaptador son `q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj`, `down_proj`, `in_proj_qkv`, `in_proj_z`, `in_proj_a`, `in_proj_b` y `out_proj`, lo que indica que el base incorpora componentes Gated DeltaNet ademas de atencion estandar.

## Capacidades

- Generacion de texto y razonamiento general sobre un base de 27B.
- Razonamiento especializado en codigo, matematicas y fisica, segun la orientacion declarada de VeriLoop-E2.
- Razonamiento convergente por evidencia (VGR), con propuesta recursiva de candidatos y verificacion externa.
- Uso de herramientas (tool use), explicitamente mencionado en la model card del modelo de origen.
- Contexto largo de hasta 262K tokens, lo que habilita tareas sobre repositorios o documentacion extensa.
- Carga incremental sobre un GGUF existente mediante `--lora` en llama.cpp, sin duplicar el modelo completo.
- No se documentan capacidades de vision, audio ni generacion multimodal.
- Soporte multilingue: no disponible en la informacion proporcionada.

## Casos de uso

- Razonamiento matematico verificable: el modelo propone pasos intermedios y los somete a comprobacion, de modo que es util en entornos donde la respuesta debe estar justificada paso a paso (por ejemplo, tutoria o generacion de demostraciones).
- Generacion y revision de codigo en produccion: con tool use y 262K de contexto puede analizar repositorios completos o ficheros largos y proponer parches, integrándose en pipelines de CI/CD mediante llamadas a una API compatible con OpenAI.
- Analisis fisico y cientifico: adecuado para resolver problemas de fisica con desarrollo algebraico, donde la disciplina de convergencia por evidencia reduce respuestas especulativas.
- RAG sobre documentacion extensa: la ventana de 262K tokens permite insertar manuales, normativa o papers completos sin troceado agresivo.
- Agentes multi-paso: su soporte de tool use y de razonamiento recurrente encaja en flujos de agente que iteran sobre herramientas externas y validan resultados.
- Despliegue economico de VeriLoop en local: al ser un adaptador de 3,6 GB de repositorio, permite obtener el comportamiento de VeriLoop-E2 sobre un GGUF ya descargado, evitando almacenar un segundo modelo de 55 GB.
- Verificacion de pruebas formales o demostraciones: el mecanismo de guardas de regresion resulta apropiado para entornos donde una respuesta solo se acepta si no empeora el estado de evidencia previo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. Lo que si se documenta es una tabla de fidelidad de la reconstruccion del delta de pesos:

| Propiedad | Valor |
|---|---|
| Pares de tensores | 496 |
| Rango | 64 (48 en pares de puertas GDN) |
| Alpha | 64 (escala 1,0 en inferencia) |
| Energia retenida (media) | 0,723 |
| Energia retenida (min / max) | 0,423 / 1,000 |
| Error de reconstruccion relativo (media) | 0,468 |
| Modulos objetivo | q_proj, k_proj, v_proj, o_proj, gate_proj, up_proj, down_proj, in_proj_qkv, in_proj_z, in_proj_a, in_proj_b, out_proj |
| dtype | float32 |

## Requisitos de hardware

- El adaptador por si solo ocupa aproximadamente 1,74 GB en fp32 (435 159 040 parametros x 4 bytes); el repositorio completo pesa 3,6 GB al incluir tambien el fichero GGUF.
- El coste real de inferencia lo determina el modelo base de 27B, no el adaptador. Estimaciones para 27B (valores aproximados, no publicados en la model card):
  - bf16/fp16: unos 54 GB de pesos, mas cache KV.
  - Q8_0: alrededor de 29 GB.
  - Q5_K_M: alrededor de 19 GB.
  - Q4_K_M: entre 16 y 17 GB.
- GPU recomendadas: A100 40/80 GB, H100 80 GB o multiples GPU para precision completa; en consumer, una RTX 4090 de 24 GB puede ejecutar cuantizaciones Q4 o Q5 con contexto moderado.
- La cache KV para 262K tokens es muy grande y, en la practica, exige offload a RAM/SSD o GPUs con mucha memoria si se quiere explotar toda la ventana.
- Opciones de despliegue: llama.cpp (`llama-cli -m Qwen3.8-27B.gguf --lora veriloop_e2_qwen3.8-27B_svd_lora.gguf`), transformers + PEFT en Python, vLLM y TGI con soporte de adaptadores LoRA, y Ollama de forma limitada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|---|
| hotdogs/qwen3.8-27B-veriloop-e2_svd_lora | Adaptador LoRA (SVD) | 435 159 040 (adaptador) | 262K (heredado del base) | safetensors, GGUF | Apache-2.0 | Fidelidad media del delta: 0,723 de energia retenida |
| tsinghua-sigs-robot-lab/VeriLoop-E2 | Modelo completo post-entrenado | 27B | 262K | no disponible en la informacion | Apache-2.0 | Modelo de origen; ocupa unos 55 GB |
| Qwen/Qwen3.8-27B | Modelo base | 27B | no disponible | no disponible en la informacion | Apache-2.0 | Sin el comportamiento VGR de VeriLoop |

## Limitaciones y advertencias

- No es una copia bit a bit: el error de reconstruccion relativo medio es 0,468 y la energia retenida minima por tensor baja hasta 0,423, por lo que la disciplina de razonamiento se transmite de forma aproximada.
- Los tensores `lm_head` y `embed_tokens` se excluyen del adaptador por diseno.
- El fichero GGUF omite los pares GDN `in_proj_a`/`in_proj_b` porque `convert_lora_to_gguf.py` no los mapea; el GGUF contiene 800 de los 992 tensores del adaptador. Para usar las puertas GDN hay que emplear el adaptador PEFT en Python.
- Los 34 tensores `mtp.veriloop_engram_registry.*` del modelo de origen no tienen equivalente en el base y no se incluyen, de modo que la memoria tipo engram de VeriLoop no se reproduce.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validacion independiente de su comportamiento en produccion.
- Riesgo de alucinacion inherente a cualquier modelo generativo de 27B; el mecanismo VGR mitiga pero no elimina este riesgo.
- Idiomas soportados no documentados: no se puede garantizar un rendimiento multilingue homogeneo.
- Licencia Apache-2.0 tanto en el adaptador como en el base, por lo que el uso comercial esta permitido, sin garantias explicitas por parte del autor.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/hotdogs/qwen3.8-27B-veriloop-e2_svd_lora
- Modelo de origen VeriLoop-E2: https://huggingface.co/tsinghua-sigs-robot-lab/VeriLoop-E2
- Modelo base Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Organizacion del autor de VeriLoop-E2: https://huggingface.co/tsinghua-sigs-robot-lab

Nota: la busqueda web realizada no devolvio resultados relevantes sobre este modelo; los enlaces anteriores proceden de la informacion de HuggingFace y de la model card.
