# roman220220/NVIDIA-Nemotron-3-Nano-4B-JANG-GPTQ-ipsupport-code-lora

## Resumen

Este repositorio contiene una version cuantizada y ajustada del modelo NVIDIA Nemotron-3-Nano-4B, un transformer hibrido denso de tipo NemotronH que combina capas Mamba2 y capas de atencion clasica. El autor (roman220220) parte del checkpoint oficial `nvidia/NVIDIA-Nemotron-3-Nano-4B-BF16`, le aplica un fine-tune QLoRA orientado al agente de codificacion en terminal ipsupport-code, fusiona el adaptador y cuantiza el resultado con una asignacion de bits por tipo de componente de estilo JANG mas GPTQ, empaquetandolo en formato MLX.

El modelo tiene 3.973.556.832 parametros totales (aproximadamente 4.000 millones) y una arquitectura sin mezcla de expertos (no MoE), con 42 capas distribuidas en 21 bloques Mamba, 17 bloques MLP y 4 bloques de atencion. La cuantizacion lo reduce de unos 7,78 GB en bf16 a aproximadamente 2,7 GB en disco, con una media de 5,778 bits por peso y tamano de grupo 64.

Su relevancia actual radica en dos factores. Por un lado, demuestra que se puede llevar un modelo hibrido Mamba2+Attention a una huella de menos de 3 GB manteniendo tool calling funcional, lo que permite ejecutarlo en equipos con Apple Silicon y poca memoria unificada. Por otro, documenta y corrige un bug real de formato de datos de entrenamiento que impedia cerrar la etiqueta `<think>` en respuestas conversacionales, un detalle poco habitual en model cards y util para quien entrene agentes con thinking explicito.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | NemotronH hibrida densa (Mamba2 + Attention, sin MoE); 42 capas: 21 mamba, 17 mlp, 4 attention |
| Parametros totales | 3.973.556.832 (aprox. 3,97 mil millones) |
| Parametros activos | no aplica (modelo denso, sin expertos enrutados) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GPTQ con asignacion de bits estilo JANG por componente; media 5,778 bits/peso; grupo de 64; atencion q/k/v/o en 8 bits, mamba in/out en 6 bits, mlp up/down en 3 bits, lm_head en 8 bits, embeddings en 6 bits |
| Idiomas soportados | no disponible |
| Licencia | openmdw-1.1 (OpenMDW License Agreement v1.1 de NVIDIA) |
| Formato de pesos | safetensors en formato MLX, cuantizados (GPTQ); repositorio de 2,9 GB |

## Arquitectura y entrenamiento

La base es un NemotronH hibrido denso que intercala capas de espacio de estados (Mamba2) con capas de atencion convencional. De las 42 capas, 21 son Mamba, 17 son bloques MLP y solo 4 son de atencion. Esta proporcion hace que el coste de la atencion sea bajo en terminos de parametros, lo cual condiciona directamente la estrategia de cuantizacion: la atencion (q/k/v/o_proj) recibe 8 bits, los modulos Mamba (in_proj/out_proj) 6 bits y los MLP (up_proj/down_proj), que concentran el grueso de los parametros, se comprimen a 3 bits. El `lm_head` tambien recibe 8 bits y los embeddings 6 bits. El tamaño de grupo es 64.

El ajuste se realizo con QLoRA usando `lora_r=32` y `lora_alpha=64`, con modulos LoRA lineales sobre `q_proj`, `k_proj`, `v_proj`, `o_proj`, `up_proj` y `down_proj`. Al tratarse de un modelo denso sin tensores de expertos, no hizo falta el manejo especial de parametros que si requiere la version 30B-A3B. El adaptador se fusiono con el metodo de merge por defecto de axolotl y despues se cuantizo con un pipeline GPTQ propio con calibracion de Hessian.

La innovacion tecnica documentada mas relevante es la correccion de un bug de formato del dataset en la primera version: el chat template del tokenizer solo renderiza un bloque `<think>...</think>` real cuando `reasoning_content` esta presente y no vacio, por lo que los ejemplos sin ese campo colapsaban a `<think></think>` y el modelo nunca cerraba la etiqueta en inferencia, dejando las respuestas conversacionales vacias en el canal de contenido. La version 2 anade un `reasoning_content` breve y real a cada turno sintetico de entrenamiento.

## Capacidades

- Generacion de texto conversacional en formato chat, con cierre correcto de la etiqueta `<think>` tanto en respuestas directas ("hi", "thanks, bye") como en tareas.
- Tool calling y function calling, orientado especificamente a agentes de codificacion en terminal (proyecto ipsupport-code).
- Razonamiento con modo thinking explicito (bloque `<think>` previo a la respuesta).
- Ejecucion de tareas de codigo con llamada a herramientas: el ejemplo documentado pide escribir una funcion Python que invierta una cadena y ejecutarla, ante lo cual el modelo cierra el bloque de razonamiento y llama a una herramienta.
- Capacidades multilingues: se han verificado respuestas a una entrada en ruso ("привет"), aunque no se detalla la lista oficial de idiomas soportados.
- Inferencia eficiente en Apple Silicon gracias al formato MLX.

## Casos de uso

- Agente de codificacion en terminal: el modelo esta ajustado especificamente para el flujo de trabajo de ipsupport-code, de modo que puede recibir instrucciones en lenguaje natural, razonar y emitir llamadas a herramientas para editar ficheros, ejecutar comandos o correr tests dentro de una sesion de terminal.
- Asistente de desarrollo local en portatiles Apple Silicon: con aproximadamente 2,7 GB de pesos, cabe en equipos con memoria unificada modesta (8 GB o mas), permitiendo un asistente de codigo offline sin depender de APIs externas ni de conexion a internet.
- Automatizacion de tareas de refactorizacion: dado su soporte de tool calling, puede integrarse en scripts que apliquen cambios de codigo de forma iterativa, razonando antes de cada llamada.
- Chat conversacional ligero con razonamiento visible: gracias a la correccion del cierre de `<think>`, es viable en interfaces que separan `reasoning_content` de `content`, mostrando el razonamiento al usuario sin romper el flujo.
- Prototipado de agentes multi-paso con presupuesto de VRAM muy bajo: util para validar arquitecturas de agente (planificacion, llamada a herramienta, observacion, nueva llamada) antes de escalar a modelos mayores como la version 30B-A3B del mismo autor.
- Evaluacion de pipelines de cuantizacion mixta estilo JANG: sirve como caso de prueba reproducible para estudiar el impacto de distintas asignaciones de bits por componente en un transformer hibrido denso.
- Educacion e investigacion sobre arquitecturas Mamba2+Attention: al ser un modelo pequeno y cuantizado, permite estudiar el comportamiento de las capas SSM frente a las de atencion con recursos limitados.

## Benchmarks y rendimiento

Los unicos datos numericos publicados en la informacion disponible son de perplejidad sobre wikitext-2 (20 fragmentos de 512 tokens):

| Modelo | PPL | Tamano |
|---|---|---|
| bf16 (referencia) | 5,11 | 7,78 GB |
| jang-dense sin LoRA (mismo proyecto) | 10,25 | 2,7 GB |
| LoRA fusionado + jang-dense (este modelo) | 12,02 | 2,7 GB |

El propio autor advierte que la version con LoRA obtiene peor perplejidad en texto libre que la version cuantizada sin LoRA. Lo atribuye a que el fine-tune se entreno sobre conversaciones formateadas con el chat template (prompt de sistema, marcadores de rol, estructura de tool call), una distribucion de tokens distinta a la continuacion de texto libre. La metrica que realmente valida el objetivo del ajuste es la comprobacion funcional de cierre de `<think>` y el comportamiento de tool calling, no la PPL. No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estandar en la informacion disponible.

## Requisitos de hardware

- VRAM o memoria unificada estimada: los pesos ocupan aproximadamente 2,7 GB; conviene reservar margen adicional para la cache KV, el runtime MLX y el contexto, por lo que un presupuesto practico de 4 a 6 GB resulta razonable (estimacion, no dato publicado).
- El formato es MLX, por lo que el destino natural son equipos Apple Silicon (serie M). Cabe en Macs con 8 GB de memoria unificada o superior.
- Para GPU NVIDIA (RTX 4090, A100, H100) seria necesario reconvertir los pesos a un formato compatible con CUDA (por ejemplo GGUF, vLLM o TGI), algo que no se documenta en este repositorio.
- Opciones de despliegue: `mlx-lm` mediante `python -m mlx_lm.generate --model roman220220/NVIDIA-Nemotron-3-Nano-4B-JANG-GPTQ-ipsupport-code-lora`. No se documenta soporte para llama.cpp, Ollama, vLLM ni TGI en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Arquitectura | Tamano en disco | Licencia | Notas |
|---|---|---|---|---|---|
| Este modelo (Nemotron-3-Nano-4B JANG GPTQ + ipsupport-code LoRA) | 3,97 mil millones | NemotronH densa (Mamba2 + Attention) | 2,9 GB (repo) / aprox. 2,7 GB | openmdw-1.1 | MLX, tool calling, PPL 12,02 |
| nvidia/NVIDIA-Nemotron-3-Nano-4B-BF16 (base) | 4 mil millones aprox. | NemotronH densa (Mamba2 + Attention) | 7,78 GB | openmdw-1.1 | Referencia sin cuantizar, PPL 5,11 |
| Nemotron-3.5-Lightning-30B-A3B-JANG-GPTQ-ipsupport-code-lora | 30B totales, 3B activos (MoE) | MoE con expertos enrutados | no disponible | no disponible | Mismo autor, mismo dataset ipsupport-code; cita validacion con cero llamadas a herramienta malformadas |
| jang-dense sin LoRA (mismo proyecto) | 3,97 mil millones | NemotronH densa | aprox. 2,7 GB | openmdw-1.1 | Cuantizacion sin fine-tune, PPL 10,25 |

## Limitaciones y advertencias

- La perplejidad en texto libre empeora tras el fine-tune (12,02 frente a 10,25 de la version cuantizada sin LoRA y 5,11 del bf16). El autor lo justifica por el cambio de distribucion de tokens, pero conviene tenerlo en cuenta si se va a usar para generacion de texto abierto y no para tool calling.
- La cuantizacion a 3 bits en las capas MLP es agresiva; no se han publicado evaluaciones de calidad mas alla de la PPL y de la comprobacion funcional del cierre de `<think>`.
- Riesgo de alucinacion: no se documenta ninguna evaluacion especifica, por lo que aplican los riesgos habituales de un modelo de 4B, agravados por la cuantizacion.
- Longitud de contexto soportada: no disponible en la informacion proporcionada.
- Idiomas soportados: no disponibles. Solo se verifican entradas en ingles y una en ruso.
- Licencia: OpenMDW License Agreement v1.1, la misma que el modelo base de NVIDIA. Es una licencia "other", por lo que conviene revisar el fichero `LICENSE` antes de un uso comercial.
- Formato ligado a MLX: no hay pesos GGUF ni safetensors para transformers estandar en el repositorio, lo que limita su uso fuera de Apple Silicon sin reconversion.
- Repositorio con 0 descargas y 0 likes en el momento del registro, sin validacion por parte de la comunidad.
- Dependencia de un chat template concreto que separa `reasoning_content` de `content`; si se usa con otro template o cliente, puede reproducirse el bug original de respuestas vacias.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/roman220220/NVIDIA-Nemotron-3-Nano-4B-JANG-GPTQ-ipsupport-code-lora
- Modelo base: https://huggingface.co/nvidia/NVIDIA-Nemotron-3-Nano-4B-BF16
- Adaptador LoRA sin fusionar: https://huggingface.co/roman220220/NVIDIA-Nemotron-3-Nano-4B-ipsupport-code-lora
- Version 30B-A3B del mismo autor: https://huggingface.co/roman220220/Nemotron-3.5-Lightning-30B-A3B-JANG-GPTQ-ipsupport-code-lora
- Proyecto ipsupport-code: https://github.com/ipsupport-llc/ipsupport-code
- Modelo de referencia para la asignacion de bits JANG: https://huggingface.co/dealignai/Nemotron-3.5-Lightning-30B-A3B-JANG_2L-CRACK
- Pipeline GPTQ del proyecto: https://github.com/rromenskyi/quant-ternary
