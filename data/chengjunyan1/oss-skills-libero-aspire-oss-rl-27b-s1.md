# chengjunyan1/oss-skills-libero-aspire-oss-rl-27b-s1

## Resumen

oss-skills-libero-aspire-oss-rl-27b-s1 es un ajuste fino por aprendizaje por refuerzo (GRPO) del modelo base Qwen/Qwen3.8-27B, desarrollado por el usuario chengjunyan1. El modelo esta especializado en la generacion de politicas como codigo (code-as-policies) para manipulacion robotica de sobremesa en el entorno LIBERO: el modelo escribe programas Python sobre una API de robot que resuelven tareas de manipulacion. Forma parte del trabajo *Growing Agent Skill Libraries as Open-Source Projects*, en el que la biblioteca de habilidades del agente crece como si fuera un proyecto de codigo abierto, con desarrolladores y un mantenedor (Claude Opus 5.5) que gestionan issues y pull requests en un forge simulado.

Tecnicamente se trata de un ajuste de parametros completos (sin LoRA) sobre la arquitectura `Qwen3_5ForConditionalGeneration` de Qwen3.8-27B, con 27.356.728.560 parametros en 1.184 tensores. Aunque los pesos conservan la torre de vision del modelo base, la politica se usa solo en modo texto. El entrenamiento emplea GRPO con rollouts generados por vLLM y un bucle de curacion de la biblioteca de habilidades cada 10 pasos.

Es relevante como ejemplo de investigacion sobre agentes que aprenden a mantener y ampliar su propia biblioteca de habilidades mediante un proceso colaborativo tipo open source, y como checkpoint de referencia (semilla 1, paso 300) para reproducir los experimentos del paper. La model card indica que los resultados de TEST estaban pendientes en el momento de su publicacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer `Qwen3_5ForConditionalGeneration` (Qwen3.8-27B), con torre de vision incluida pero uso solo texto |
| Parametros totales | 27.356.728.560 (1.184 tensores) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens en el servicio de referencia (`--max-model-len 32768`) |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (dos shards: `model-00001-of-00002.safetensors`, `model-00002-of-00002.safetensors`, mas `model.safetensors.index.json`) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.8-27B y conserva su arquitectura completa, incluida la torre de vision, aunque la politica se emplea unicamente en modo texto. El ajuste es de parametros completos (los 27,36B), sin calentamiento supervisado previo, a diferencia de las variantes de 9B. El entrenamiento usa GRPO con la pila verl, FSDP2 y el optimizador AdamW descargado a CPU, pesos maestros en fp32 y computo en bf16. Los rollouts se generan con vLLM 0.24 en tensor parallel 2 con 4 replicas, sobre un nodo con ocho GPUs RTX PRO 6000 Blackwell de 96 GB. Los datos son 36 tareas de entrenamiento de LIBERO-90, ninguna en el conjunto de retencion.

La innovacion principal es el bucle de curacion de la biblioteca de habilidades: cada 10 pasos, 20 episodios muestreados de la politica se envian a desarrolladores (Claude Opus 5.5) que, en un forge simulado, pueden abrir issues, discusiones, comentarios, votos y pull requests (maximo 2 acciones cada uno). Un mantenedor congelado (tambien Opus 5.5) fusiona o cierra las propuestas y publica la siguiente version de la biblioteca, que entra en vigor 2 pasos despues con un limite de 32.768 bytes (29 rondas, 28 con version nueva). La politica solo ve la biblioteca publicada, nunca el tracker. Hiperparametros: 8 prompts x 8 rollouts por paso, ventajas normalizadas por grupo, una actualizacion por paso, 300 pasos, KL de baja varianza de 1e-2 respecto a la politica base, learning rate de 1e-6 tras 10 pasos de calentamiento con decaimiento coseno hasta 1e-7, tope de ratio de importancia por token de 2.0 y rechazo a nivel de secuencia de 1e-2. Rollouts con temperatura 1 y thinking desactivado; guardados cada 20 pasos. El checkpoint final se selecciona como argmax en DEV sobre los pasos 120-300 bajo el tope declarado de cuota no enviada.

## Capacidades

- Generacion de codigo ejecutable: escribe programas Python sobre una API de robot para tareas de manipulacion de sobremesa en LIBERO.
- Razonamiento orientado a agentes: opera dentro de un arnes que renderiza la biblioteca de habilidades en el prompt y produce acciones multi-paso.
- Uso de una biblioteca de habilidades externa: integra las funciones documentadas en `library/` (README y ficheros de la version v0029) como contexto de generacion.
- Capacidad multimodal heredada del modelo base: los pesos incluyen la torre de vision de Qwen3.8-27B, aunque la politica se sirve en modo texto.
- Control de modo thinking: soporta `enable_thinking: false` en el chat template, configuracion usada en la evaluacion.
- Capacidades multilingues: no disponible.
- Tool calling / function calling: no disponible como capacidad documentada; la interaccion con el robot se realiza mediante la generacion de codigo sobre la API, no mediante un protocolo de herramientas declarado.

## Casos de uso

- Investigacion en aprendizaje por refuerzo para agentes: sirve como checkpoint de referencia del paso 300 (semilla 1) para reproducir los contrastes del paper sobre GRPO con parametros completos y curacion de biblioteca tipo open source.
- Generacion de politicas de manipulacion robotica: dado un estado y una descripcion de tarea de LIBERO, el modelo produce un programa Python que invoca la API del robot para completar la tarea; es adecuado porque fue entrenado especificamente sobre 36 tareas de LIBERO-90 con recompensas de resultado.
- Estudio de bibliotecas de habilidades autoampliables: permite analizar como la politica explota funciones nuevas publicadas por el mantenedor y como evoluciona su tasa de exito entre versiones de la biblioteca.
- Evaluacion de agentes con harness externo: se integra en el arnes del paper, que renderiza `README.md` y los ficheros de la biblioteca en el prompt, con decodificacion a temperatura 0 y 2.048 tokens por turno (6.144 por episodio).
- Base para ablaciones de entrenamiento: al partir del modelo base sin calentamiento supervisado, es util para comparar contra las variantes de 9B con calentamiento y contra el contraste ASPIRE-RL sin issues ni PRs.
- Servicio de inferencia con vLLM: desplegable con `vllm serve ... --language-model-only --max-model-len 32768` en configuraciones de 8 replicas con tensor parallel 1 sobre H100 de 80 GB, como en la evaluacion del paper.

## Benchmarks y rendimiento

La model card indica que los resultados de TEST estan pendientes ("TEST ... pending") y que las celdas se ejecutaron el 2026-11-24 sobre ocho GPUs H100, a la espera de incorporar las cifras del paper. El unico dato numerico publicado es de DEV:

| Metrica | Valor |
|---|---|
| DEV (paso 300, par con biblioteca v0029) | 57,41 % [47,68, 66,59] |

No se han publicado resultados de benchmarks en la informacion disponible (MMLU, HumanEval, GSM8K u otros).

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 54,7 GB de pesos (dos shards de 49,9 GB y 4,8 GB), mas overhead de activaciones y cache KV; requiere GPUs de 80 GB o superiores para servicio comodo.
- GPU recomendadas: H100 de 80 GB (configuracion usada en TEST: 8 replicas con tensor parallel 1) y RTX PRO 6000 Blackwell de 96 GB (usadas en entrenamiento).
- GPU de consumo: no cabe en GPUs consumer de 24 GB en bf16; no se han publicado pesos cuantizados (GGUF, AWQ, GPTQ) en la informacion disponible.
- Opciones de despliegue: vLLM 0.24 con `--language-model-only` (recomendado por el autor); transformers con `AutoModelForImageTextToText` y `dtype="bfloat16"`. No se documentan opciones para llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles. La decodificacion de referencia usa temperatura 0, 2.048 tokens por turno y 6.144 por episodio, con thinking desactivado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especialidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| oss-skills-libero-aspire-oss-rl-27b-s1 | 27,36B | 32.768 tokens | Politicas de manipulacion LIBERO con biblioteca de habilidades | Apache 2.0 | Hugging Face |
| Qwen/Qwen3.8-27B (modelo base) | 27B (segun model card) | no disponible | Modelo generalista multimodal | no disponible | Hugging Face |
| Variantes de 9B del mismo trabajo | no disponible | no disponible | Misma tarea, con calentamiento supervisado | no disponible | no disponible |

No se dispone de datos de rendimiento comparables entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Dominio muy restringido: entrenado solo sobre 36 tareas de LIBERO-90; no es un modelo generalista y su uso fuera de manipulacion de sobremesa no esta validado.
- Resultados de TEST pendientes: las cifras de evaluacion final no estaban publicadas en el momento de la model card, por lo que el rendimiento real en retencion no esta confirmado.
- Solo semilla 1: la semilla 2 no se ejecuto, de modo que no hay estimacion de varianza entre semillas.
- Dependencia del arnes y de la biblioteca: el modelo espera que los ficheros de `library/` se rendericen en el prompt (README primero); usarlo sin la biblioteca v0029 cambia el comportamiento respecto a la evaluacion.
- Riesgo de alucinacion de API: al generar codigo sobre una API de robot, puede producir llamadas inexistentes o mal formadas; requiere validacion y ejecucion en entorno controlado.
- Pesos solo en bf16: no se publican cuantizaciones, lo que limita el despliegue en hardware de menor VRAM.
- Sesgos e idiomas: no hay informacion publicada sobre sesgos ni sobre cobertura idiomatica.
- Licencia Apache 2.0: permite uso comercial, pero el modelo base Qwen3.8-27B debe verificarse por separado en cuanto a sus propios terminos.
- Solo se libera el checkpoint final: no hay estados del optimizador ni otros pasos publicados, lo que dificulta reproducir el entrenamiento completo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/chengjunyan1/oss-skills-libero-aspire-oss-rl-27b-s1
- Dataset de entrenamiento: https://huggingface.co/datasets/chengjunyan1/oss-skills-records
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Paper *Growing Agent Skill Libraries as Open-Source Projects*: referencia pendiente de publicacion segun la model card (no disponible)
- Declaracion de TEST: `design/TEST_DECLARATIONS_27B_RL.md` en el repositorio de datos `chengjunyan1/oss-skills-records`
