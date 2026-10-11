# collinzrj/qwen3.6-35b-a3b-swe-lora-sft

## Resumen

Este repositorio contiene un adaptador LoRA (formato PEFT) entrenado sobre el modelo base Qwen/Qwen3.6-35B-A3B por el usuario collinzrj. No es un modelo autonomo: se trata de un ajuste supervisado (SFT) de 538 millones de parametros entrenables, lo que equivale al 1,5% del total del modelo base, orientado especificamente a tareas de ingenieria de software y uso como agente. El adaptador se distribuye en safetensors con pesos fp32 y requiere fusionarse con el modelo base para su uso.

El problema que aborda es la mejora del rendimiento en tareas de resolucion de issues y parches de codigo en entornos de agente. Para ello se entreno con 8.666 trayectorias resueltas del dataset nvidia/Open-SWE-Traces v1.2, generadas por un teacher Qwen3.8-27B, consumiendo unos 500 millones de tokens en una sola pasada. El resultado declarado es una mejora de 16/51 a 23/51 en SWE-bench Pro V2 HARD-51 con mini-swe-agent y un solo intento.

Es relevante ahora porque demuestra que un ajuste LoRA muy selectivo sobre las proyecciones de atencion, las capas GatedDeltaNet y los expertos compartidos y enrutados de un MoE hibrido puede mejorar de forma medible el comportamiento agente de un modelo de 35B con solo 11,3 horas de entrenamiento en una unica GPU B300.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre Qwen3.6-35B-A3B (MoE hibrido con GatedDeltaNet y expertos compartidos + enrutados) |
| Parametros totales | 538M parametros entrenables en el adaptador (1,5% del base); modelo base: 35B |
| Parametros activos | 3B en el modelo base (variante A3B, Mixture of Experts) |
| Longitud de contexto | 128k tokens en las secuencias empaquetadas de entrenamiento y en el harness de agente; ventana oficial del modelo base: no disponible |
| Tipos de cuantizacion | Adaptador distribuido en fp32; el modelo base dispone de versiones GGUF (unsloth), MLX y Ollama |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador aplica LoRA con dos rangos distintos segun el tipo de capa. Con r=64 y alpha=128 se ajustan las proyecciones q, k, v, o_proj, las capas GatedDeltaNet (in_proj_qkv, in_proj_z, out_proj) y las proyecciones gate/up/down_proj de los expertos compartidos. Con r=8 y alpha=16 se ajustan los expertos enrutados mediante target_parameters de PEFT (experts.gate_up_proj / down_proj). Esta granularidad diferenciada permite adaptar la atencion y el mecanismo de estado lineal sin sobreajustar los expertos enrutados, que son mucho mas numerosos.

El entrenamiento uso tasa de aprendizaje 1e-4 con decaimiento coseno, cuatro secuencias empaquetadas de 128k tokens por paso, 953 pasos en total, calculo de perdida unicamente sobre los tokens del asistente, base en bf16 y adaptador en fp32. Se ejecuto en una sola GPU B300 durante 11,3 horas. El conjunto de datos son trayectorias mini-swe-agent resueltas de nvidia/Open-SWE-Traces v1.2 (con licencia CC-BY-4.0 y solo repositorios con licencias permisivas), con una trayectoria por instancia de tarea. El tokenizador y la plantilla de chat no se modificaron respecto al modelo base y el modo thinking permanece activo.

## Capacidades

- Resolucion de issues y generacion de parches de codigo en entornos de agente, con soporte para el bucle de mini-swe-agent.
- Razonamiento extendido en modo thinking, heredado del teacher: mediana de 36 pasos y 22.000 tokens de razonamiento por trayectoria.
- Tool calling y ejecucion de comandos dentro de un harness de agente (lectura de ficheros, ejecucion de tests, edicion).
- Razonamiento multi-paso con realimentacion de ejecucion, ya que las trayectorias de entrenamiento incluyen ciclos de prueba y correccion.
- Generacion de codigo en Python y otros lenguajes presentes en los repositorios del dataset (composicion exacta no disponible).
- Capacidades multilingues: no disponible.
- No se documentan capacidades de vision, audio ni otras modalidades especificas del adaptador.

## Casos de uso

- Resolucion automatica de issues en repositorios: el adaptador puede recibir un issue y el arbol de codigo, navegar el repositorio y generar un parche candidato dentro de un bucle de agente, aprovechando las 8.666 trayectorias de SFT sobre tareas reales.
- Integracion en CI/CD para parcheo de regresiones: conectado a un harness tipo mini-swe-agent, puede ejecutar la suite de tests, leer los fallos y proponer correcciones iterativas antes de abrir una pull request.
- Asistente de mantenimiento de codigo legacy: su entrenamiento en repositorios permisivos variados lo hace util para refactorizaciones guiadas por tests en bases de codigo grandes.
- Agente de investigacion de bugs con contexto largo: gracias a las secuencias de 128k tokens, puede mantener a la vez el issue, varios ficheros relevantes y el historial de intentos fallidos.
- Generacion de tests a partir de parches: puede usarse para producir casos de prueba que validen un cambio de codigo dado, siguiendo el patron de las trayectorias de validacion del dataset.
- Evaluacion interna de agentes SWE: sirve como checkpoint de referencia para comparar estrategias de prompting, harnesses y presupuestos de pasos sobre SWE-bench Pro HARD-51.
- Fine-tuning adicional sobre dominios propios: al ser un adaptador PEFT pequeno (2,2 GB en repositorio), puede combinarse o continuarse con datos internos sin reentrenar el modelo base.

## Benchmarks y rendimiento

| Benchmark | Modelo base | Adaptador LoRA |
|---|---|---|
| SWE-bench Pro V2 HARD-51 (mini-swe-agent, 1 intento) | 16/51 | 23/51 |
| Validation loss (198 instancias retenidas) | 0,726 | 0,507 |

No se han publicado en la informacion disponible resultados de MMLU, HumanEval, GSM8K ni otros benchmarks generales para este adaptador.

## Requisitos de hardware

- Entrenamiento del adaptador: una GPU B300 durante 11,3 horas, con base en bf16 y adaptador en fp32.
- Inferencia en bf16 del modelo base fusionado: 35B parametros requieren del orden de 70 GB solo en pesos, mas cache KV para 128k de contexto; se necesitan una H100 80 GB o varias A100/H100 en paralelo.
- Inferencia cuantizada: segun la informacion disponible sobre el modelo base, una cuantizacion Q4 cabe en una unica GPU de 24 GB; hay etiquetas GGUF, MLX y Ollama publicadas a mediados de 2026.
- GPU consumer: cabe en tarjetas de 24 GB (por ejemplo RTX 4090 o RTX 3090) solo con cuantizacion agresiva del base; no se ha validado el comportamiento del adaptador fusionado tras cuantizar.
- Opciones de despliegue: vLLM o TGI para el base en precision completa; llama.cpp, Ollama o MLX para cuantizado; el adaptador requiere `peft>=0.18` y `transformers>=5.x` para cargarse y fusionarse.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Enfoque | Licencia |
|---|---|---|---|---|
| collinzrj/qwen3.6-35b-a3b-swe-lora-sft | 538M entrenables (base 35B, 3B activos) | LoRA SFT | Agente SWE sobre Open-SWE-Traces | apache-2.0 |
| felixming/Qwen3.6-35B-A3B-SWE-LoRA-SFT | no disponible | LoRA SFT | Post-entrenamiento SWE, evaluado en SWE-bench Pro HARD-51, Terminal-Bench 2.0, HLE y ASI-Bench | no disponible |
| felixming/Qwen3.6-35B-A3B-SWE-LoRA-SFT-DPO | no disponible | LoRA SFT + DPO | Igual que el anterior mas DPO con realimentacion de ejecucion | no disponible |
| Qwen/Qwen3.6-35B-A3B (base) | 35B totales, 3B activos | MoE hibrido | Modelo generalista con plantilla multimodal y tool calling | no disponible |

## Limitaciones y advertencias

- El adaptador hereda el estilo de razonamiento largo del teacher (mediana de 36 pasos y 22.000 tokens de razonamiento por trayectoria), por lo que en harnesses con 128k de contexto puede agotar el contexto o el tiempo en tareas dificiles.
- La evaluacion se hizo con un unico intento por tarea; los intervalos de confianza se remiten al informe del proyecto y no se incluyen en la model card.
- No hay resultados publicados en benchmarks generales (conocimiento, matematicas, multilingue), de modo que no se puede garantizar que el ajuste no degrade capacidades fuera del dominio SWE.
- Sesgos conocidos: no disponibles; el entrenamiento usa repositorios con licencias permisivas del dataset nvidia/Open-SWE-Traces, lo que puede sobrerrepresentar ciertos estilos de codigo y ecosistemas.
- Riesgo de alucinacion: no se documenta de forma especifica; al generar parches de codigo, la verificacion mediante tests es imprescindible.
- Restricciones de licencia: el adaptador se publica bajo apache-2.0, pero el uso comercial depende tambien de la licencia del modelo base Qwen/Qwen3.6-35B-A3B, no confirmada aqui.
- El conjunto de entrenamiento tiene licencia CC-BY-4.0; se declara que no hay solapamiento a nivel de repositorio con los 11 repositorios de SWE-bench Pro HARD-51, pero no puede descartarse contaminacion a otros niveles.
- Requiere versiones concretas de librerias (`peft>=0.18`, `transformers>=5.x`) por el uso de LoRA sobre parametros de expertos en 3-D, lo que limita su integracion en stacks mas antiguos.
- Idioma: no se especifica que idiomas naturales soporta el ajuste; el foco declarado es codigo y tareas tecnicas.

## Enlaces

- Adaptador en HuggingFace: https://huggingface.co/collinzrj/qwen3.6-35b-a3b-swe-lora-sft
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Dataset de entrenamiento: https://huggingface.co/datasets/nvidia/Open-SWE-Traces
- Adaptador relacionado (SFT): https://huggingface.co/felixming/Qwen3.6-35B-A3B-SWE-LoRA-SFT
- Adaptador relacionado (SFT + DPO): https://huggingface.co/felixming/Qwen3.6-35B-A3B-SWE-LoRA-SFT-DPO
- Ficha del modelo base en The AI Bench: https://theaibench.ai/models/qwen-3-6-35b-a3b/
- Catalogo de NVIDIA NGC para Qwen3.6-35B-A3B: https://catalog.ngc.nvidia.com/orgs/nim/teams/qwen/models/qwen3.6-35b-a3b
- Guia de despliegue local: https://aiindigo.com/tutorials/getting-started-with-qwen3-6-35b-a3b-deploying-multimodal-reasoning-locally
