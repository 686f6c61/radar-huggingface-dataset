# DasaSantiago/lfm3-1.7b-code-repair-lora

## Resumen

LFM3-1.7B Code Repair LoRA es un adaptador PEFT (LoRA) desarrollado por el usuario DasaSantiago sobre el modelo base LiquidAI/LFM3-1.7B, un transformer de 1.700 millones de parámetros de Liquid AI. El adaptador está especializado en una tarea muy concreta: recibir un único fichero Python junto con los nombres de los tests que fallan y generar un diff unificado mínimo que repare el defecto. Se entrenó sobre pares de reparación verificados derivados del dataset SWE-smith-py.

El modelo base LFM3-1.7B emplea la arquitectura tri-híbrida de nueva generación de Liquid AI, con una ventana de contexto de 256K tokens y soporte nativo de tool calling, orientada a agentes locales y aplicaciones especializadas. El adaptador hereda esas capacidades y añade la habilidad específica de localizar y corregir defectos en código Python de un solo fichero.

La relevancia de este adaptador es doble: por un lado, demuestra que es posible obtener mejoras sustanciales en una tarea de reparación de código con un entrenamiento LoRA de bajo coste (71 minutos en una única RTX 5060 Ti de 16 GB); por otro, hace explícitas sus limitaciones, con un 6% de exactitud en tareas retenidas, lo que lo sitúa como una herramienta de investigación y no como un agente de código listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer tri-híbrido LFM3 de Liquid AI |
| Parametros totales | 16.468.736 (solo el adaptador LoRA); el modelo base tiene 1,7B |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 256K tokens en el modelo base (no verificado para el adaptador) |
| Tipos de cuantizacion | LoRA en safetensors (bf16) y GGUF para llama.cpp; el base admite Q8_0 y otras |
| Idiomas soportados | en, code |
| Licencia | LFM Open License v1.0 (lfm1.0), uso comercial sujeto a umbral de la licencia |
| Formato de pesos | safetensors (adapter_model.safetensors), GGUF (lfm3-repair-10k-lora.gguf) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 16 y alpha 32 con dropout 0,05 aplicado a todos los módulos lineales del modelo base: q/k/v/o_proj, gate_proj, w1/w2/w3, in_proj y out_proj. El modelo base LFM3-1.7B emplea la arquitectura tri-híbrida de Liquid AI, que combina mecanismos de atención con convoluciones cortas (shortconv) y otros componentes, y que en el adaptador se refleja en los nombres de tensores del GGUF (blk.N.attn_*, blk.N.ffn_*, blk.N.shortconv.*).

El entrenamiento se realizó sobre 8.554 filas de entrenamiento durante 2 épocas y 2.138 pasos de optimizador, en una única RTX 5060 Ti de 16 GB durante 71 minutos. Los datos provienen de 9.995 instancias filtradas de SWE-smith-py de 131 repositorios; el objetivo de entrenamiento es el inverso del parche que introduce el bug en SWE-smith, es decir, el diff mínimo que restaura los tests. La pérdida se enmascara a los tokens del asistente usando la plantilla de chat de LFM3 con el modo thinking desactivado. No se menciona RLHF ni DPO en la información disponible.

## Capacidades

- Generación de diffs unificados de reparación de código Python a partir de un fichero y los nombres de tests fallidos.
- Localización de defectos en código: el adaptador identifica la región del fichero donde se encuentra el bug (Jaccard de hunk de 0,708 en bf16 y 0,733 en GGUF Q8_0).
- Formato de salida estructurado: produce parches delimitados por etiquetas `<patch>` y `</patch>` listos para aplicar con `patch -p1` o `git apply --recount`.
- Hereda del modelo base LFM3-1.7B la ventana de contexto de 256K tokens y el soporte nativo de tool calling, aunque el adaptador no ha sido evaluado específicamente en estas capacidades.
- Capacidades multilingües limitadas a inglés y código (según los tags del modelo).
- No se ha verificado soporte de agentes multi-paso ni de razonamiento extendido con este adaptador.

## Casos de uso

- Reparación automática de tests unitarios en CI: el adaptador puede integrarse en un pipeline que, tras un fallo de tests, reciba el fichero afectado y los nombres de los tests fallidos y genere un diff candidato que un humano revise antes de aplicar. Es adecuado porque su formato de salida es directamente aplicable con `git apply`.
- Asistencia a desarrolladores en depuración local: un IDE o editor podría invocar el adaptador para proponer una corrección mínima sobre un fichero Python concreto, aprovechando la ventana de contexto del modelo base para incluir ficheros largos.
- Generación de datos sintéticos de entrenamiento: los diffs generados pueden usarse como ejemplos negativos o positivos para entrenar modelos de reparación mayores, dado que el adaptador está entrenado sobre SWE-smith y produce parches con alta tasa de aplicabilidad (66-68%).
- Investigación en localización de defectos: el adaptador sirve como baseline para estudiar la capacidad de modelos pequeños de localizar bugs en código, con métricas de solapamiento de hunk publicadas.
- Preprocesamiento en pipelines de agentes de código: el adaptador puede actuar como subagente especializado en una primera pasada de reparación de un solo fichero, delegando en un modelo mayor las reparaciones multi-fichero o de diseño.
- Evaluación de técnicas LoRA de bajo coste: sirve como caso de estudio reproducible de fine-tuning eficiente (71 minutos en una GPU de consumo) para tareas de código, con métricas y datos de entrenamiento documentados.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre 100 tareas retenidas de SWE-smith-py, con repositorios disjuntos del entrenamiento. "Exact" significa que el parche aplica y coincide con la corrección mínima gold; no es un pass@1 de harness de tests.

| Modelo | Formato válido | Parche aplica | Exact | Malformed | Jaccard hunk gold |
|---|---|---|---|---|---|
| Base LFM3-1.7B (Q8_0) | 64% | 13% | 0% | 36% | — |
| Adaptador, transformers bf16 | 100% | 66% | 6% | 0% | 0,708 |
| Adaptador, llama.cpp Q8_0 + LoRA | 100% | 68% | 6% | 0% | 0,733 |

El autor indica que el 6% de exactitud es un proxy razonable de pass@1 para esta porción, verificado con spot-checks en suites pytest de bottle (1/5) y exceptiongroup (0/2). No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estándar en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el adaptador LoRA ocupa aproximadamente 0,1 GB; el modelo base de 1,7B en bf16 requiere unos 3,4 GB, y en Q8_0 alrededor de 1,8 GB.
- GPU recomendadas: el entrenamiento se realizó en una RTX 5060 Ti de 16 GB; para inferencia basta con GPUs de consumo con 4-8 GB de VRAM.
- Cabe en GPU de consumo: sí, en RTX 3060, RTX 4060, RTX 4090 y similares con al menos 4 GB de VRAM para el modelo base cuantizado.
- Opciones de despliegue: transformers + PEFT, llama.cpp (llama-server con `--lora`), y presumiblemente Ollama y vLLM a través del modelo base, aunque no se documentan explícitamente en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LFM3-1.7B Code Repair LoRA (este) | 1,7B + 16,5M adaptador | 256K (base) | Reparación de código Python de un fichero | LFM Open License v1.0 | Hugging Face |
| LFM3-1.7B (base) | 1,7B | 256K | Modelo generalista de texto para agentes | LFM Open License v1.0 | Hugging Face |
| no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre otros adaptadores de reparación de código comparables en la documentación proporcionada.

## Limitaciones y advertencias

- Solo cubre reparaciones de un único fichero Python; las reparaciones multi-fichero o de nivel de diseño quedan fuera de su alcance.
- Exactitud del 6% en tareas retenidas de SWE-smith: el adaptador localiza el defecto (Jaccard mediano de 0,73) pero a menudo reescribe un bloque en lugar de la línea mínima, y esos parches aplican pero fallan en comportamiento.
- No se ha medido un pass@1 real de FAIL_TO_PASS en el harness completo de SWE-smith.
- La ruta de llama.cpp aplica el adaptador sobre un base cuantizado Q8_0; la calidad es equivalente a bf16 dentro del ruido de muestreo en 100 tareas, pero sigue siendo un base cuantizado.
- Los datos de entrenamiento son sintéticos y derivados de SWE-smith, por lo que hereda la distribución y los puntos ciegos de ese pipeline.
- Riesgo de alucinación en la generación de diffs: aunque el formato válido es del 100%, el contenido del parche puede no corresponder a una corrección real.
- Licencia LFM Open License v1.0: el uso comercial está sujeto al umbral de la licencia, y el adaptador es una obra derivada de LFM3-1.7B de Liquid AI.
- Los repositorios de origen de SWE-smith conservan sus propias licencias, lo que puede afectar a la redistribución de datos derivados.
- El adaptador es explícitamente de investigación, no un agente de código de producción.

## Enlaces

- Hugging Face del adaptador: https://huggingface.co/DasaSantiago/lfm3-1.7b-code-repair-lora
- Modelo base LFM3-1.7B: https://huggingface.co/LiquidAI/LFM3-1.7B
- Documentación de LFM3-1.7B: https://docs.liquid.ai/lfm/models/lfm3-1.7b
- README del modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B/blob/main/README.md
- Licencia LFM Open License v1.0: https://huggingface.co/LiquidAI/LFM3-1.7B/blob/main/LICENSE
- Dataset SWE-smith-py: https://huggingface.co/datasets/SWE-bench/SWE-smith-py
