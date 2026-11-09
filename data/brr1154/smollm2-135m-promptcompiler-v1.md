# BRR1154/SmolLM2-135M-PromptCompiler-v1

## Resumen

SmolLM2-135M-PromptCompiler-v1 es un ajuste fino del modelo base HuggingFaceTB/SmolLM2-135M, desarrollado por Bhavanam Rajendra Reddy bajo la organizacion Runtime-Slayers. El modelo se presenta como un "especialista en optimizacion simbolica de prompts": su proposito declarado es comprimir directivas de sistema largas en representaciones de tokens compactas, con el objetivo de optimizar el uso de la ventana de contexto en agentes desplegados en el edge. Con 134,5 millones de parametros, se posiciona como un modelo pequeno (SLM) orientado a tareas auxiliares dentro de pipelines de agentes mas grandes.

El modelo parte de la arquitectura transformer decoder-only de SmolLM2-135M y, segun la model card, aplica una "cirugia de pesos" basada en edicion de subespacios nulo mediante Gram-Schmidt, con la pretension de preservar el comportamiento original (delta W · V_base = 0, "zero-forgetting"). La model card menciona coordinacion con orquestadores frontera (NVIDIA Nemotron-3-Ultra 550B, DeepSeek V4.1, GLM-5.3, MiniMax M3.1, Kimi K3.1 Pro) y con un framework de optimizacion recursiva de Google Research, aunque no se aportan detalles tecnicos verificables sobre dicha integracion.

La relevancia del modelo es limitada y debe contextualizarse: se trata de un ajuste fino de un SLM de 135M con cero descargas y cero likes en el momento de la consulta, sin benchmarks publicados ni documentacion tecnica detallada sobre el dataset de entrenamiento o el procedimiento exacto de edicion de pesos. Su interes practico reside en la idea de usar un modelo minimo para comprimir prompts de sistema, pero la falta de evaluacion empirica hace que deba tratarse con cautela.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de SmolLM2-135M) |
| Parametros totales | 134.515.008 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de SmolLM2-135M, no confirmada en la model card) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; el ejemplo de inferencia usa float32) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en SmolLM2-135M, un transformer decoder-only de 135M de parametros. Sobre esa base, el autor declara haber aplicado un protocolo de "Weight Surgery" denominado Gram-Schmidt Subspace Null-Space Model Editing, con la restriccion de que la actualizacion de pesos sea ortogonal al subespacio de la base (delta W · V_base = 0) para evitar olvido catastrofico. No se especifica el numero de tokens de entrenamiento, la composicion del dataset, ni si se emplearon tecnicas de RLHF, DPO o SFT convencional.

La model card menciona que el modelo forma parte del "Runtime-Slayers Autonomous SLM Swarm Engine" y que opera en coordinacion con orquestadores frontera y con el framework "Google Research Harness² recursive optimization". No se aportan detalles verificables sobre estos componentes, ni sobre el procedimiento concreto de compilacion de prompts (formato de entrada, formato de salida comprimida, tasas de compresion alcanzadas). Tampoco se documenta la tokenizacion especifica del modelo resultante.

## Capacidades

- Generacion de texto en ingles mediante la pipeline text-generation.
- Compilacion de directivas de sistema en lenguaje natural a representaciones de tokens compactas (capacidad declarada, sin evaluacion publica).
- Optimizacion del uso de ventana de contexto para agentes en el edge (capacidad declarada).
- Soporte de plantilla de chat via `apply_chat_template` (heredado de SmolLM2).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible como capacidad verificada.
- Capacidades multilingues: solo ingles declarado.
- Capacidades especiales (thinking mode, vision, audio): no disponible.

## Casos de uso

- Compresion de prompts de sistema en pipelines de agentes: el modelo se usaria como paso previo para reducir la longitud de directivas largas antes de enviarlas a un modelo mayor, liberando ventana de contexto. Es el caso de uso central declarado por el autor, aunque no hay metricas de tasa de compresion ni de fidelidad semantica.
- Preprocesamiento en despliegues edge: al ser un modelo de 135M, puede ejecutarse en dispositivos con recursos muy limitados (CPU, moviles, SBC) para tareas auxiliares de reescritura de prompts.
- Normalizacion de instrucciones en ingles: util para homogeneizar el formato de directivas de sistema en un enjambre de agentes heterogeneos.
- Filtrado y reescritura de contexto en cadenas multi-agente: reducir el contexto acumulado entre turnos antes de pasarlo a un orquestador de mayor tamano.
- Prototipado de tecnicas de edicion de pesos: el modelo puede servir como caso de estudio del protocolo Gram-Schmidt Subspace Null-Space Model Editing descrito por el autor.
- Experimentacion academica con SLMs para prompt engineering: base para reproducir o comparar metodos de compresion de prompts en entornos de investigacion con pocos recursos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,5 GB en float32 (134,5M parametros × 4 bytes); en float16/bfloat16 alrededor de 0,27 GB; en cuantizaciones de 8 bits o 4 bits, por debajo de 0,2 GB (estimacion teorica, no confirmada por el autor).
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4090, etc.) es sobredimensionada; el modelo cabe en CPU y en GPUs integradas.
- Cabe en consumer GPU: si, en cualquier GPU consumer e incluso en CPU.
- Opciones de despliegue: transformers (ejemplo oficial con `AutoModelForCausalLM` y `apply_chat_template`); text-generation-inference aparece en los tags del repositorio; llama.cpp, Ollama y vLLM no estan confirmados en la model card.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| BRR1154/SmolLM2-135M-PromptCompiler-v1 | 134,5M | no disponible | en | apache-2.0 | Ajuste fino especializado en compresion de prompts; sin benchmarks |
| HuggingFaceTB/SmolLM2-135M | 135M | 8.192 tokens (segun documentacion publica del modelo base) | en (principalmente) | apache-2.0 | Modelo base; benchmarks publicos disponibles en su model card |
| HuggingFaceTB/SmolLM2-360M | 360M | 8.192 tokens (segun documentacion publica del modelo base) | en (principalmente) | apache-2.0 | Alternativa de mayor tamano y capacidad general |
| Qwen2.5-0.5B | 494M | 32.768 tokens (segun documentacion publica) | multilingue | apache-2.0 | Alternativa multilingue de tamano similar con contexto mayor |

## Limitaciones y advertencias

- Ausencia total de benchmarks publicados: no hay evidencia empirica de que la compresion de prompts funcione ni de su fidelidad semantica.
- Cero descargas y cero likes en el momento de la consulta: modelo sin validacion por parte de la comunidad.
- Solo soporta ingles; no se declara capacidad multilingue.
- La model card incluye referencias a orquestadores frontera y frameworks de investigacion sin enlaces ni detalles verificables; deben tratarse como afirmaciones no comprobadas.
- El protocolo de edicion de pesos (Gram-Schmidt Subspace Null-Space Model Editing) no esta documentado con detalle tecnico ni respaldado por publicacion revisada por pares.
- Riesgo de alucinacion inherente a un modelo de 135M: la generacion de representaciones comprimidas puede introducir perdida de informacion o distorsion de la directiva original.
- No se documenta el formato exacto de salida de la "compilacion" de prompts, lo que dificulta su integracion en produccion.
- Licencia apache-2.0 permite uso comercial, pero la falta de evaluacion hace recomendable validar el modelo en el caso de uso concreto antes de desplegarlo.
- El ejemplo de inferencia usa `torch_dtype=torch.float32`, lo que sugiere que no se ha validado en precision reducida.

## Enlaces

- Hugging Face: https://huggingface.co/BRR1154/SmolLM2-135M-PromptCompiler-v1
- Modelo base: https://huggingface.co/HuggingFaceTB/SmolLM2-135M
- Organizacion del autor: https://github.com/Runtime-Slayers
- ORCID del autor: https://orcid.org/0009-0005-3349-1162
