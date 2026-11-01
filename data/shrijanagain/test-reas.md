# Shrijanagain/TEST-REAS

## Resumen

TEST-REAS es un checkpoint experimental de ajuste fino supervisado (SFT) sobre el modelo base sKT-Ai-Labs/SPEED-1, un transformer de tipo Mixtral con arquitectura MoE (mixture of experts) de aproximadamente 19.187 millones de parametros. El autor, Shrijanagain, lo publica como una sonda temprana de entrenamiento (0,29 epocas) con el objetivo principal de hacer reproducible el pipeline de adaptacion y fusion de pesos, no como un modelo listo para produccion. Se entreno con QLoRA de 4 bits sobre una unica GPU L4 de 24 GB durante 18,5 horas.

El modelo incorpora un adaptador LoRA de rango 64 sobre las proyecciones de atencion (q/k/v/o) y se distribuye tanto en pesos fusionados en bf16 como en formato PEFT separado. La ventana de contexto utilizada durante el entrenamiento fue de 2048 tokens, con un vocabulario BPE de 32k y un corpus de 57,3 millones de tokens procedentes de ocho fuentes orientadas a razonamiento, matematicas y trayectorias de agentes de software.

Su relevancia actual es limitada pero instructiva: documenta de forma transparente los errores de construccion del corpus (renderizado incorrecto de turnos de herramienta, eliminacion del esquema de tools, ausencia de enmascaramiento de prompt) y sirve como referencia para quien quiera reproducir o continuar el entrenamiento en hardware mayor. No se han publicado benchmarks y el propio autor advierte que las puntuaciones serian irrelevantes en esta fase.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE estilo Mixtral (48 capas, 32/8 cabezas, 2 expertos locales top-2) |
| Parametros totales | 19.187.634.176 (19,19 B) |
| Parametros activos | no disponible |
| Longitud de contexto | 2048 tokens (entrenamiento); contexto nativo del base no disponible |
| Tipos de cuantizacion | QLoRA 4-bit NF4 con doble cuantizacion (entrenamiento); pesos publicados en bf16 |
| Idiomas soportados | en (ingles) |
| Licencia | MIT |
| Formato de pesos | safetensors (modelo fusionado bf16, 36 GiB) y PEFT adapter (r=64, 81,8 M parametros, 327 MB) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del base sKT-Ai-Labs/SPEED-1: un transformer MoE de 48 capas con 32 cabezas de atencion y 8 cabezas KV, dos expertos locales con enrutamiento top-2 y un vocabulario de 32k tokens BPE. El ajuste se realizo con QLoRA en 4 bits NF4 con doble cuantizacion y computo en bf16, aplicando un adaptador LoRA de rango 64, alpha 128 y dropout 0,05 exclusivamente sobre las cuatro proyecciones de atencion (q_proj, k_proj, v_proj, o_proj).

El entrenamiento consistio en 1000 pasos (limite maximo configurado) con un batch efectivo de 8 secuencias de 2048 tokens, es decir, 16.384 tokens por paso y aproximadamente 246 tokens por segundo, lo que cubre 16,4 millones de tokens del corpus, un 0,29 de epoca. Se uso el optimizador paged AdamW de 8 bits con learning rate 1e-4 y scheduler coseno, warmup de 50 pasos y grad-clip de 0,3. La perdida final promedio fue de 0,948 (mediana de los primeros 20 pasos: 1,029; de los ultimos 20: 0,883). El corpus de 57,3 millones de tokens se construyo a partir de ocho fuentes (Step-3.5-Flash-SFT, Qwen3.8-27B-Distill, NuminaMath-CoT, SWE-QA-Pro-SFT-Trajectories, SWE-Next-SFT-Trajectories, Dolci-Think-SFT-Clean-v1, Dolci-Think-SFT-7B y el dataset propio POST), renderizadas con la plantilla nativa `### System: / ### User: / ### Assistant:` y el razonamiento envuelto en etiquetas `<think>...</think>`.

La fusion de pesos se realizo en CPU en unos 4 minutos mediante streaming por tensor, con un error relativo maximo de 3e-3 respecto al resultado analitico, atribuible al redondeo bf16. Los 615 tensores restantes son copia byte a byte del base, por lo que el checkpoint fusionado es numericamente identico a ejecutar base mas adaptador.

## Capacidades

- Generacion de texto y razonamiento aritmetico basico: en pruebas codiciosas resuelve correctamente `17 * 23 = 391` y el problema del bate y la pelota (`0.05`), cerrando la etiqueta `<think>`.
- Razonamiento con modo thinking: el modelo emite bloques `<think>...</think>` antes de la respuesta final, segun la plantilla de entrenamiento.
- Tool calling / function calling: genera JSON valido con la estructura `{"name": ..., "arguments": {...}}` tras un plan, aunque filtra un encabezado literal `### Assistant:` en la salida.
- Razonamiento multi-paso: capacidad limitada; divaga y no cierra `<think>` en 700 tokens.
- Generacion de codigo: deficiente en el estado actual; reformula el problema durante mas de 700 tokens sin emitir codigo.
- Multilingue: solo ingles.
- No dispone de vision, audio ni otras modalidades.

## Casos de uso

- Reproduccion del pipeline de adaptacion y fusion: el checkpoint permite validar el flujo completo QLoRA, fusion de LoRA en bf16 y verificacion numerica contra la ejecucion base mas adaptador, util para equipos que construyen tooling propio de ajuste fino.
- Punto de partida para reentrenamiento: al publicarse el adaptador y los pesos fusionados, sirve como inicializacion para continuar el SFT con enmascaramiento de prompt y un epoca completa en hardware mayor.
- Experimentacion con arquitecturas MoE de ~19B en una sola GPU: el uso de QLoRA en 4 bits con pico de 13,5 GiB demuestra la viabilidad de ajustar un MoE de este tamano en una L4 de 24 GB, interesante para laboratorios con presupuesto limitado.
- Investigacion sobre errores de formato en datos de instruccion: el modelo es un caso documentado de como el renderizado incorrecto de turnos de herramienta y la ausencia de esquema de tools degradan el comportamiento agentico, util para auditorias de calidad de datasets.
- Evaluacion de razonamiento aritmetico temprano: permite medir como evoluciona la capacidad de cierre de `<think>` y la precision en problemas de primaria a lo largo de los pasos de entrenamiento.
- Docencia y divulgacion: sirve como ejemplo realista de las limitaciones de un checkpoint a 0,29 epocas y de la importancia del enmascaramiento de prompt en SFT.
- Base para pruebas de tool calling controladas: aunque con fugas de formato, el modelo emite JSON estructurado, lo que permite testear parsers y validadores de function calling en condiciones imperfectas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explicitamente que las puntuaciones serian irrelevantes en esta fase y no las reporta.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 38,4 GB solo para pesos (19,19 B parametros a 2 bytes), mas overhead de activaciones y cache KV; requiere GPUs de 48 GB o mas (A6000, A100 80 GB, H100).
- VRAM estimada en cuantizacion 4-bit: en torno a 10-12 GB para pesos, viable en RTX 4090 (24 GB) y potencialmente en GPUs de 16 GB con cuantizaciones mas agresivas, aunque no se han publicado mediciones del autor.
- GPU de entrenamiento documentada: 1 x NVIDIA L4 de 24 GB, con pico de 13,5 GiB usando QLoRA 4-bit.
- Despliegue: compatible con transformers (`AutoModelForCausalLM`) y PEFT (`PeftModel.from_pretrained` con subfolder `adapter`). Para servir en produccion serian necesarias herramientas como vLLM o TGI, aunque no se documenta compatibilidad explicita con llama.cpp u Ollama para este checkpoint.
- Latencia y throughput: no disponibles. El unico dato de rendimiento es el del entrenamiento (~246 tokens/s en una L4 con QLoRA).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Estado | Notas |
|---|---|---|---|---|---|
| TEST-REAS (este) | 19,19 B (MoE) | 2048 (entrenamiento) | MIT | Checkpoint experimental 0,29 epocas | Sin benchmarks; tool calling con fugas de formato |
| sKT-Ai-Labs/SPEED-1 (base) | 19 B (MoE) | no disponible | no disponible | Modelo base publicado | Sin adaptador SFT; referencia de partida |
| Mixtral 8x7B | 46,7 B (MoE, 12,9 B activos) | 32k | Apache 2.0 | Modelo consolidado | Mayor tamano y contexto; benchmarks publicados |
| Qwen3-30B-A3B | 30,5 B (MoE, 3,3 B activos) | 32k+ | Apache 2.0 | Modelo consolidado | Alternativa MoE con soporte multilingue y agentico |

La comparacion con modelos consolidados es desfavorable en todos los ejes salvo en licencia MIT y en el interes documental del proceso. No se dispone de datos de rendimiento de TEST-REAS que permitan una comparacion cuantitativa.

## Limitaciones y advertencias

- Checkpoint a 0,29 epocas: muy lejos de la convergencia; el propio autor lo describe como sonda temprana, no como modelo final.
- Sin ajuste de seguridad: no ha pasado por RLHF ni por filtros de seguridad; no apto para exposicion directa a usuarios.
- Tool calling defectuoso: los turnos `tool_response` y `tool_call` se renderizaron ambos como `### Assistant:` en el corpus, y el esquema `tools` se elimino por completo, lo que provoca fugas de encabezados y comportamiento agentico poco fiable.
- Sin enmascaramiento de prompt: el entrenamiento uso perdida sobre la secuencia completa, por lo que parte de la capacidad se dedico a predecir texto de usuario y sistema.
- Generacion de codigo practicamente inexistente en el estado actual: reformula el problema sin emitir codigo.
- Razonamiento multi-paso limitado: no cierra `<think>` en 700 tokens en tareas complejas.
- Solo ingles: no hay soporte multilingue declarado ni evidencia de transferencia a otros idiomas.
- Contexto corto de entrenamiento (2048 tokens): no se ha validado el comportamiento mas alla de esa ventana.
- Riesgo de alucinacion elevado por el estado temprano del ajuste y la falta de datos de evaluacion.
- Licencia MIT: permite uso comercial, pero el estado del modelo hace inviable su uso en produccion sin un reentrenamiento completo.
- Sin benchmarks publicados: imposible estimar calidad relativa frente a alternativas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Shrijanagain/TEST-REAS
- Modelo base: https://huggingface.co/sKT-Ai-Labs/SPEED-1
- Dataset propio del autor (POST): https://huggingface.co/Shrijanagain/POST
- Dataset stepfun-ai/Step-3.5-Flash-SFT: https://huggingface.co/datasets/stepfun-ai/Step-3.5-Flash-SFT
- Dataset MaxDevv/Qwen3.8-27B-Distill-1M-3.12B-Tokens: https://huggingface.co/datasets/MaxDevv/Qwen3.8-27B-Distill-1M-3.12B-Tokens
- Dataset project-numina/NuminaMath-CoT: https://huggingface.co/datasets/project-numina/NuminaMath-CoT
- Dataset TIGER-Lab/SWE-QA-Pro-SFT-Trajectories: https://huggingface.co/datasets/TIGER-Lab/SWE-QA-Pro-SFT-Trajectories
- Dataset TIGER-Lab/SWE-Next-SFT-Trajectories: https://huggingface.co/datasets/TIGER-Lab/SWE-Next-SFT-Trajectories
- Dataset allenai/Dolci-Think-SFT-Clean-v1: https://huggingface.co/datasets/allenai/Dolci-Think-SFT-Clean-v1
- Dataset allenai/Dolci-Think-SFT-7B: https://huggingface.co/datasets/allenai/Dolci-Think-SFT-7B
