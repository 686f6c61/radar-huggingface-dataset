# AtomicChat/Clover-35B-A3B-Preview-Uncensored-GGUF

## Resumen

Clover-35B-A3B-Preview-Uncensored-GGUF es una versión cuantizada y "abliterada" del modelo Clover-35B-A3B-Preview de DiffuSpace, publicada por AtomicChat. El modelo base es un híbrido de difusión/transformer con mezcla de expertos (MoE) que reutiliza el cuerpo de Qwen3.6-35B-A3B: 34,66 mil millones de parámetros totales de los cuales unos 3 mil millones están activos por token, con 40 bloques donde tres de cada cuatro usan atención lineal (Gated DeltaNet) y 256 expertos enrutados más un experto compartido por bloque.

La particularidad de esta versión es que AtomicChat ha proyectado fuera de los pesos la "dirección de rechazo" (refusal direction) identificada según la metodología de Arditi et al. (2024), eliminando el comportamiento de negativa del modelo. El resultado se distribuye tanto en archivos GGUF con la edición integrada ("baked") como en un LoRA de rango 1 de solo 110 MB que puede aplicarse sobre los cuants originales. Según el autor, los rechazos caen del 93,8 % al 0 % en prompts de JailbreakBench, manteniendo MMLU prácticamente intacto (80,8 % a 80,7 %).

Es relevante porque demuestra que la abliteración mediante edición de pesos puede aplicarse a arquitecturas híbridas novedosas (difusión + MoE + atención lineal) con una degradación medible y mínima del rendimiento, y porque ofrece cuants dinámicos Atomic (AD) optimizados con imatrix para ejecución local en llama.cpp.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hibrido transformer + difusion, MoE, atencion lineal Gated DeltaNet (3 de cada 4 bloques) |
| Parametros totales | 34.661.350.848 (≈34,66 B) |
| Parametros activos | ≈3 B (indicado por la convencion A3B; MoE con 256 expertos enrutados + 1 compartido por bloque) |
| Longitud de contexto | 32.768 tokens (valor usado en los ejemplos de ejecucion; maximo oficial no disponible) |
| Tipos de cuantizacion | AD-Q6_K-Q5_K, AD-Q4_K-IQ4_XS, AD-IQ3_S-IQ3_XXS (cuants dinamicos Atomic con imatrix); LoRA rank-1 aparte |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizado); modelo base en safetensors (BF16) |

## Arquitectura y entrenamiento

Clover hereda el cuerpo de Qwen3.6-35B-A3B: 40 bloques, de los cuales tres de cada cuatro emplean atención lineal tipo Gated DeltaNet en lugar de atención softmax estándar, y cada bloque contiene 256 expertos enrutados más un experto compartido. Cada bloque escribe en el flujo residual a través de tres caminos: la salida de atención (`attn_output` o `ssm_out`), los expertos enrutados (`ffn_down_exps`) y el experto compartido (`ffn_down_shexp`). Los tags del repositorio indican que se trata de un modelo de difusión, lo que sugiere un enfoque de decodificación no autorregresivo puro, aunque no se publican detalles adicionales en la model card.

Sobre el modelo base no se ha publicado información sobre el corpus de entrenamiento, número de tokens ni fases de RLHF/DPO. Lo que sí documenta AtomicChat es la edición de abliteración: se identifica una dirección de rechazo por bloque comparando la media de activaciones ante prompts dañinos frente a inocuos (eliminando la componente a lo largo de la media de los inocuos, para evitar rechazos en falsos positivos), y luego se modifica cada uno de los tres escritores de cada bloque con `W' = W - s · r_l r_lᵀ W`, suprimiendo la escritura en esa dirección. La edición se distribuye integrada en los GGUF o como LoRA rank-1 de 120 matrices (110 MB) diseñada para escala 1.0.

## Capacidades

- Generacion de texto conversacional, con plantilla de chat incluida en cada archivo GGUF.
- Modo thinking activado por defecto; desactivable con `--chat-template-kwargs '{"enable_thinking": false}'`.
- Razonamiento general: MMLU de 80,7 % tras la edicion (80,8 % antes), medido sobre 2.000 preguntas.
- Sin rechazos: 0 % de negativas en 81 prompts de JailbreakBench y 250 de XSTest (thinking desactivado), y eliminacion del thinking-triggered refusal (29 de 30 a 0).
- Recuperacion en contexto largo sin cambios segun el autor.
- Ejecucion en llama.cpp (requiere build del PR #31306, commit `4838ffb`, aun sin fusionar).
- Compatibilidad con endpoints tipo OpenAI via `llama-server` con `--jinja`.
- No hay informacion sobre vision, audio, tool calling ni capacidades agenticas.

## Casos de uso

- Investigacion en seguridad de modelos: el release documenta con detalle la metodologia de abliteration, las metricas de divergencia KL y los limites de calidad, lo que lo hace util como caso de estudio para investigadores que estudian direcciones de rechazo y edicion de pesos.
- Experimentacion con arquitecturas hibridas de difusion: permite probar en hardware local un modelo que combina MoE, atencion lineal Gated DeltaNet y difusion, algo poco habitual en el ecosistema GGUF.
- Escritura creativa sin filtros: al eliminar los rechazos, el modelo puede abordar temas que los modelos alineados suelen bloquear, util para ficcion con contenido sensible donde el autor controla el resultado.
- Red teaming y evaluacion de robustez: al responder a prompts de JailbreakBench sin rechazar, sirve como objetivo para probar defensas y clasificadores externos de seguridad.
- Despliegue local offline: los cuants dinamicos (desde 15,5 GB) permiten ejecutar un modelo de 35B en una sola GPU consumer o incluso en CPU con offload parcial, gracias a los ~3B de parametros activos.
- Comparativa de impacto de cuantizacion: el release publica KL y coincidencia top-1 por cuant frente al BF16 original, util para calibrar que nivel de cuantizacion es aceptable en produccion.
- Prototipado de asistentes con thinking mode: el modo thinking por defecto permite evaluar cadenas de razonamiento en un modelo MoE ligero por token.

## Benchmarks y rendimiento

Datos publicados por el autor (edicion vs. modelo original):

| Metrica | Original | Editado |
|---|---:|---:|
| MMLU (2.000 preguntas) | 80,8 % | 80,7 % (McNemar p = 0,92) |
| Rechazos en JailbreakBench | 93,8 % | 0 % |
| Rechazos en XSTest (prompts seguros) | 4,4 % | 0 % |
| Rechazos con thinking activado | 29 de 30 | 0 |

Calidad de los cuants respecto al BF16 original (edicion + cuantizacion conjuntas, sobre 24 chunks de 4.096 tokens):

| Build | Tamano | KL divergence | Coincidencia top-1 |
|---|---:|---:|---:|
| AD-Q6_K-Q5_K | 26,3 GB | 0,062 | 89,11 % |
| AD-Q4_K-IQ4_XS | 20,1 GB | 0,071 | 88,28 % |
| AD-IQ3_S-IQ3_XXS | 15,5 GB | 0,128 | 84,26 % |
| LoRA (sobre BF16) | 110 MB | 0,058 | - |

Advertencia del propio autor: en prompts inocuos, el primer token se aleja del original mas alla de su limite de 0,10 (KL 0,170 frente a 0,068 de una direccion aleatoria editada igual). No se han publicado resultados de benchmarks estandar adicionales (HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (GGUF completo en GPU):
  - AD-Q6_K-Q5_K: 26,3 GB — cabe en una RTX 3090/4090 de 24 GB solo con offload parcial; comoda en A100 40 GB o 2x RTX 4090.
  - AD-Q4_K-IQ4_XS: 20,1 GB — cabe en una RTX 4090 de 24 GB con contexto moderado.
  - AD-IQ3_S-IQ3_XXS: 15,5 GB — cabe en una RTX 4080/4090 o en Mac con 24 GB+ de memoria unificada.
- Gracias a los ~3B de parametros activos (MoE), el throughput por token es comparable al de un modelo denso de 3B, con requisitos de memoria del modelo completo.
- Ejemplo recomendado por el autor: `llama-server -hf AtomicChat/Clover-35B-A3B-Preview-Uncensored-GGUF:AD-Q4_K-IQ4_XS --jinja -c 32768 --presence-penalty 0.9 --repeat-penalty 1.05` con `-ngl 99` para offload completo.
- Despliegue: unicamente llama.cpp compilado desde el PR #31306 (commit `4838ffb`, sin fusionar); no compatible con vLLM, TGI, Ollama ni llama.cpp estable hasta que el PR se integre.
- No se ha medido la edicion con decodificacion especulativa (`--spec-type draft-self`): solo decodificacion estandar.
- No se han publicado cifras de latencia ni throughput.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Clover-35B-A3B-Preview-Uncensored (este) | 34,66 B | ≈3 B | 32.768 (en ejemplos) | Apache 2.0 | GGUF, requiere llama.cpp con PR #31306 |
| Qwen3-30B-A3B (referencia de cuerpo) | ≈30 B | ≈3 B | 32.768 | Apache 2.0 | GGUF, vLLM, TGI, amplio soporte |
| Qwen3.6-35B-A3B (cuerpo heredado) | ≈35 B | ≈3 B | no disponible | no disponible | no disponible |
| DiffuSpace/Clover-35B-A3B-Preview (base) | 34,66 B | ≈3 B | no disponible | no disponible | safetensors BF16, con rechazos intactos |

Nota: la comparativa se limita a los modelos mencionados en la model card; no hay datos de rendimiento comparativo publicados entre ellos.

## Limitaciones y advertencias

- Riesgo de alucinacion: no se han publicado evaluaciones de veracidad o alucinacion; al tratarse de un modelo "uncensored", no hay capa de seguridad que frene respuestas incorrectas o peligrosas.
- Sin filtros de seguridad: el modelo responde a prompts daninos sin rechazar (0 % en JailbreakBench). Su uso para generar contenido ilegal, danino o enganoso es responsabilidad exclusiva del usuario; en muchos contextos su despliegue puede tener implicaciones legales.
- Deriva en prompts inocuos: el propio autor reconoce que el primer token se aleja del original mas de lo deseado (KL 0,170 > limite 0,10), lo que indica un posible impacto sutil en la calidad de las respuestas benignas.
- Deriva de Clover incluso sin editar en esta build de llama.cpp: el autor recomienda comparar los archivos entre si, ya que existe un suelo de ruido propio del modelo.
- Compatibilidad muy limitada: requiere llama.cpp compilado desde un PR no fusionado; no funciona con Ollama, LM Studio, vLLM ni otras herramientas hasta que el soporte se integre.
- Thinking mode: la verificacion con thinking activado se hizo sobre la edicion BF16, no sobre los archivos integrados ("baked").
- Sin decodificacion especulativa verificada: no se ha medido la edicion con `--spec-type draft-self`.
- Idiomas soportados, datos de entrenamiento del modelo base y limites exactos de contexto: no disponibles en la informacion publicada.
- Licencia Apache 2.0 tanto del cuant como del modelo base, sin restricciones comerciales conocidas, aunque el modelo base es un "Preview" y su calidad puede cambiar en versiones finales.
- Proyecto de muy baja adopcion (32 descargas y 1 like en el momento de la ficha): escasa validacion comunitaria.

## Enlaces

- Ficha del modelo (GGUF uncensored): https://huggingface.co/AtomicChat/Clover-35B-A3B-Preview-Uncensored-GGUF
- Cuants originales de Clover (sin editar, para usar con el LoRA): https://huggingface.co/AtomicChat/Clover-35B-A3B-Preview-GGUF
- Modelo base: https://huggingface.co/Diffuspace/Clover-35B-A3B-Preview
- PR de llama.cpp necesario: https://github.com/ggml-org/llama.cpp/pull/31306
- Atomic Chat (aplicacion del equipo): https://atomic.chat/
- GitHub de Atomic Chat: https://github.com/AtomicBot-ai/Atomic-Chat
- Discord de la comunidad: https://discord.gg/8wGSsvmg4V
- X (Twitter): https://x.com/atomic_chat_hq
- Paper de referencia citado (Arditi et al., 2024, refusal direction): no disponible enlace directo en la model card
