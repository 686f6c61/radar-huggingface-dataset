# prithivMLmods/Qwen3.8-27B-super-adapter-bf16

## Resumen

Qwen3.8-27B-super-adapter-bf16 es un checkpoint autónomo en BF16 publicado por el usuario prithivMLmods que fusiona el adaptador LoRA harness-hub/Qwen3.8-27B-super-adapter dentro del modelo base Qwen/Qwen3.8-27B. El objetivo es ofrecer un artefacto servible en cualquier motor de inferencia sin necesidad de soporte nativo de LoRA, preservando el layout de shards, los nombres de tensores y todos los tensores MTP (multi-token prediction) del modelo original.

El adaptador subyacente se construyó concatenando tres adaptadores especialistas entrenados con AsyncGRPO para los entornos de agente pi, Hermes Agent y OpenCode sobre tareas de ingeniería de software y terminal en Harbor/OpenEnv. No hay entrenamiento adicional en este paso: solo una fusión algebraica del tipo `W + (alpha/r)·B@A` en fp32 con conversión posterior a BF16.

Con 27.781.427.952 parámetros (unos 27,8 mil millones) y licencia Apache 2.0, el modelo está orientado a flujos agénticos de código y terminal con razonamiento activado. La model card reporta mejoras notables de pass@1 y reducción de llamadas a herramientas, aunque esas cifras se midieron sobre el adaptador con el modelo base, no sobre este checkpoint fusionado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.5, tag `qwen3_5`), con tensores MTP para decodificación especulativa |
| Parametros totales | 27.781.427.952 (≈27,8 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible en la información proporcionada |
| Tipos de cuantizacion | no disponible (el repo solo distribuye pesos BF16) |
| Idiomas soportados | inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (18 shards, repo de 55,6 GB) |

## Arquitectura y entrenamiento

El checkpoint es un transformer de la familia Qwen3.5 (tag `qwen3_5`) con pipeline `image-text-to-text`, lo que sugiere capacidades multimodales de entrada imagen-texto, aunque la model card no detalla el codificador visual. Incluye tensores MTP, empleados habitualmente para decodificación especulativa y etiquetados explícitamente en los tags del repositorio. El modelo base declarado es `Qwen/Qwen3.8-27B`.

El entrenamiento relevante ocurrió en la fase de adaptadores: tres especialistas entrenados con AsyncGRPO (variante asíncrona de GRPO) sobre entornos Harbor/OpenEnv para pi, Hermes Agent y OpenCode, con datasets como `harness-hub/scale800-harbor`, `harness-hub/harness-adapters`, `harness-hub/termgrade-train-harbor` y `ai-and/termgrade-environments`. La fusión de este checkpoint usa `combination_type="cat"` con rango 96 (3 × 32) y peso ½ por adaptador en las proyecciones q, k, v, o, gate, up y down, aplicada en fp32 y convertida de nuevo a BF16. No se realizó entrenamiento adicional durante la fusión.

## Capacidades

- Generación de texto y razonamiento con modo thinking, recomendado en nivel `xhigh` según la model card.
- Ejecución de tareas agénticas de ingeniería de software: resolución de issues, parches y navegación de repositorios (entornos pi, Hermes Agent, OpenCode).
- Operación en terminal: ejecución de comandos, interpretación de salidas y tareas de tipo Terminal-Bench.
- Tool calling y uso de herramientas dentro de bucles multi-paso, con reducción reportada del número de llamadas por tarea.
- Entrada multimodal imagen-texto según el pipeline declarado (`image-text-to-text`).
- Decodificación especulativa mediante tensores MTP preservados en la fusión.
- Capacidades multilingües: limitadas al inglés según el campo `language` de la model card.

## Casos de uso

- Resolución automática de issues en repositorios: el modelo puede recibir un problema, explorar el código con herramientas y proponer un parche, apoyándose en el entrenamiento específico sobre SWE-bench Pro y entornos Harbor.
- Agente de terminal para tareas de DevOps: ejecución de comandos, diagnóstico de errores y corrección iterativa, con menos llamadas a herramientas por tarea según las métricas del adaptador.
- Integración en asistentes de código tipo OpenCode o Hermes Agent: el checkpoint está pensado para servirse directamente en estos flujos sin capa LoRA.
- Automatización de pipelines de CI/CD: uso como agente que interpreta fallos de build o tests y propone correcciones dentro de un bucle controlado.
- Servicio de inferencia en motores sin soporte LoRA: al ser un checkpoint fusionado, puede desplegarse en cualquier runtime que cargue safetensors BF16 estándar.
- Aceleración de la generación con decodificación especulativa: los tensores MTP permiten habilitar draft heads en motores compatibles para reducir latencia en tareas agénticas de muchos tokens.
- Evaluación comparativa de adaptadores agénticos: útil como referencia para medir el efecto de la fusión `cat` frente a los adaptadores individuales.

## Benchmarks y rendimiento

Los datos disponibles corresponden al adaptador sobre el modelo base BF16, no a este checkpoint fusionado, según advierte la propia model card.

| Benchmark / configuración | Base (adaptador, thinking on) | Super-adapter (thinking on) | Base (thinking off) | Super-adapter (thinking off) |
|---|---|---|---|---|
| Media pass@1 en pi, Hermes Agent y OpenCode (SWE-bench Pro hard 51 + Terminal-Bench 2.1) | 55,5 % | 63,5 % | 39,5 % | 49,0 % |
| Llamadas a herramientas por tarea | referencia | 19–48 % menos | referencia | 53–73 % menos |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K) en la información disponible, ni evaluaciones del checkpoint fusionado.

## Requisitos de hardware

- VRAM estimada en BF16: en torno a 55,6 GB de pesos, más overhead de activaciones y KV cache; se recomienda al menos 80 GB para inferencia cómoda con contexto amplio.
- GPU recomendadas: A100 80 GB, H100 80 GB o H200 para BF16 sin cuantizar; múltiples GPUs para paralelismo tensorial.
- GPU de consumo: no cabe en BF16 en RTX 4090 (24 GB) ni en RTX 3090; requeriría cuantización a 8 o 4 bits, no distribuida en este repo.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (tag `text-generation-inference`) y motores compatibles con endpoints; vLLM, llama.cpp u Ollama no se mencionan explícitamente y requerirían conversión a GGUF para los dos últimos.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| Qwen3.8-27B-super-adapter-bf16 | ≈27,8 B | no disponible | Apache 2.0 | Agentes de código y terminal, multimodal |
| Qwen/Qwen3.8-27B (base) | ≈27,8 B | no disponible | no disponible en la información | Modelo generalista sin especialización agéntica |
| harness-hub/Qwen3.8-27B-super-adapter (LoRA) | adaptador r=96 | hereda del base | no disponible en la información | Requiere motor con soporte LoRA |

No se dispone de datos de benchmarks de los modelos comparables en la información proporcionada, por lo que la comparación cuantitativa de rendimiento no está disponible.

## Limitaciones y advertencias

- Las métricas de mejora (55,5 % → 63,5 % y reducción de tool calls) se midieron sobre el adaptador con el modelo base y no se han reevaluado en este checkpoint fusionado.
- Idioma limitado al inglés según la model card; el rendimiento en castellano no está documentado.
- La fusión por concatenación (`cat`) con peso ½ por adaptador puede introducir interferencias entre especialistas no verificadas empíricamente en este artefacto.
- Riesgo de alucinación inherente a modelos generativos, especialmente en tareas de código donde una API o función inventada puede pasar desapercibida.
- Sesgos no documentados en la información disponible.
- El repositorio tiene 0 descargas y 1 like en el momento de la ficha, sin validación comunitaria amplia.
- Aunque la licencia es Apache 2.0, conviene verificar las condiciones del modelo base Qwen subyacente antes de uso comercial.
- El tamaño BF16 (55,6 GB) exige hardware de gama alta o cuantización propia para despliegues en producción.

## Enlaces

- Hugging Face: https://huggingface.co/prithivMLmods/Qwen3.8-27B-super-adapter-bf16
- Modelo base del adaptador: https://huggingface.co/harness-hub/Qwen3.8-27B-super-adapter
- Modelo base original: https://huggingface.co/Qwen/Qwen3.8-27B
- Configuración: https://huggingface.co/prithivMLmods/Qwen3.8-27B-super-adapter-bf16/blob/main/config.json
- Plantilla de chat: https://huggingface.co/prithivMLmods/Qwen3.8-27B-super-adapter-bf16/blob/main/chat_template.jinja
- Dataset scale800-harbor: https://huggingface.co/datasets/harness-hub/scale800-harbor
- Dataset harness-adapters: https://huggingface.co/datasets/harness-hub/harness-adapters
- Dataset termgrade-train-harbor: https://huggingface.co/datasets/harness-hub/termgrade-train-harbor
- Dataset termgrade-environments: https://huggingface.co/datasets/ai-and/termgrade-environments
