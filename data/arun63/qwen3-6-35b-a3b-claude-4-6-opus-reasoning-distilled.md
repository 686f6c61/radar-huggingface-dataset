# Arun63/Qwen3.6-35B-A3B-Claude-4.6-Opus-Reasoning-Distilled

## Resumen

Qwen3.6-35B-A3B-Claude-4.6-Opus-Reasoning-Distilled es un fine-tune de razonamiento (SFT) sobre el modelo base Qwen/Qwen3.6-35B-A3B, desarrollado por Arun63 (con autoría atribuida a @hesamation en la model card). El objetivo es preservar las capacidades de razonamiento y codificación agéntica del modelo base mientras se le inyecta un estilo estructurado de razonamiento en cadena de pensamiento (CoT) destilado de respuestas de Claude Opus 4.6. Para ello se emplean tres datasets de destilación: nohurry/Opus-4.6-Reasoning-3000x-filtered, Jackrong/Qwen3.5-reasoning-700x y Roman1111111/claude-opus-4.6-10000x.

La arquitectura es un modelo de lenguaje causal con MoE (Mixture of Experts) que combina Gated Attention y Gated DeltaNet, con 35.951.822.704 parámetros totales y aproximadamente 3B activos por token. El contexto nativo es de 262.144 tokens, extensible hasta 1.010.000 tokens. Aunque el modelo base incluye un codificador de visión, este fine-tune se entrenó únicamente con datos de texto, por lo que no se debe usar para tareas de imagen o vídeo. La licencia es Apache 2.0 y el formato de pesos es safetensors.

Este modelo es relevante para desarrolladores e investigadores que buscan un modelo de razonamiento agéntico de código abierto con ventana de contexto muy larga y bajo coste de inferencia gracias a los 3B de parámetros activos. La destilación de CoT pretende mejorar la estabilidad en problemas de larga duración y la claridad de las trazas de razonamiento, manteniendo el rendimiento en tareas de agente y codificación del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE con Gated Attention y Gated DeltaNet; 40 capas; 256 expertos, 8 activos + 1 compartido; dimension oculta 2048; MTP entrenado |
| Parametros totales | 35.951.822.704 |
| Parametros activos | 3B (aprox., segun la ficha del modelo base) |
| Longitud de contexto | 262.144 tokens nativo, extensible hasta 1.010.000 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Ingles (segun la ficha del modelo) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Qwen3.6-35B-A3B, un modelo causal con codificador de vision que combina capas de Gated DeltaNet (atencion lineal) y Gated Attention (atencion por softmax). La distribucion de capas es: 10 bloques de `(3 x (Gated DeltaNet -> MoE) -> 1 x (Gated Attention -> MoE))`. El MoE cuenta con 256 expertos, de los cuales se activan 8 expertos enrutados mas 1 experto compartido por token. La dimension oculta es 2048 y el modelo fue preentrenado con MTP (multi-step prediction) en multiples pasos.

El entrenamiento de este checkpoint es un SFT (supervised fine-tuning) sobre datos de texto, sin entrenamiento en imagen ni video. Los datos de entrenamiento consisten en cadenas de razonamiento destiladas de Claude Opus 4.6, junto con razonamientos de Qwen3.5. El proceso de destilacion busca imitar el estilo estructurado de las trazas de razonamiento de Claude Opus, con el objetivo de mejorar la estabilidad en problemas de razonamiento largos y la coherencia del proceso de pensamiento. No se menciona el uso de RLHF ni DPO; el enfoque es puramente de destilacion supervisada. El fine-tune esta inspirado en el trabajo previo Jackrong/Qwen3.5-27B-Claude-4.6-Opus-Reasoning-Distilled.

## Capacidades

- Razonamiento en cadena de pensamiento (CoT) estructurado, destilado de Claude Opus 4.6, con trazas de razonamiento mas estables y legibles.
- Codificacion agente: manejo de flujos de trabajo de frontend y razonamiento a nivel de repositorio, heredado del modelo base Qwen3.6.
- Soporte de herramientas y funciones (tool calling / function calling) heredado de la base Qwen3.6, util para integrar el modelo en pipelines agente.
- Soporte de agentes y razonamiento multi-paso, incluyendo la opcion de preservar contexto de razonamiento historico entre mensajes, lo que reduce overhead en desarrollo iterativo.
- Ventana de contexto larga de 262.144 tokens nativa, ampliable a 1.010.000 tokens, adecuada para documentos extensos y repositorios de codigo.
- Generacion de texto conversacional y tecnicamente precisa.
- Capacidad multimodal en el modelo base (vision encoder), pero no entrenada en este fine-tune; no debe utilizarse para vision.
- Idiomas: solo se declara ingles. La base Qwen3.6 es multilingue, pero el fine-tune no especifica rendimiento en otros idiomas.

## Casos de uso

- Asistente de razonamiento tecnico en desarrollo de software: el modelo puede descomponer problemas complejos de arquitectura o depuracion, mostrando un razonamiento estructurado paso a paso que facilita la revision por parte del desarrollador. Su ventana de contexto larga permite incluir archivos completos o trazas de error extensas.
- Generacion de codigo en produccion: gracias al soporte de tool calling y a la capacidad agente, puede integrarse en pipelines de CI/CD para revision de pull requests, refactorizacion automatica o generacion de tests. La destilacion de CoT mejora la coherencia en tareas de larga duracion.
- Agentes autonomos de frontend: el modelo puede gestionar flujos de trabajo de interfaz de usuario y razonar sobre la estructura de un repositorio, lo que lo hace adecuado para agentes que modifican componentes web o generan paginas completas.
- Analisis de logs y diagnostico de sistemas: con 262.144 tokens de contexto, puede procesar logs de gran volumen y razonar sobre la causa raiz de un fallo, manteniendo el razonamiento visible para el operador.
- Tutor de programacion interactivo: el modelo puede explicar conceptos de codigo, algoritmos o patrones de diseno con trazas de razonamiento claras, lo que resulta util en entornos educativos o de onboarding.
- Documentacion tecnica automatica: a partir de un codigo fuente extenso, el modelo puede generar documentacion estructurada, comentarios y guias de uso, aprovechando su capacidad para mantener el contexto largo.
- Investigacion en agentes de razonamiento: sirve como modelo de referencia para comparar tecnicas de destilacion de CoT y evaluar el rendimiento en benchmarks como SWE-bench o MMLU-Pro, especialmente en entornos con limitaciones de hardware gracias a los 3B de parametros activos.

## Benchmarks y rendimiento

El unico benchmark declarado en la model card es MMLU-Pro, con una muestra limitada de 70 preguntas (14 materias, `--limit 5`). Los resultados son los siguientes:

| Benchmark | Muestra | Metrica | Modelo base | Modelo fine-tuned | Delta |
|---|---|---|---|---|---|
| MMLU-Pro | 70 preguntas | exact_match, custom-extract | 42.86% | 75.71% | +32.85 pp |

Estos datos son declarados por el autor y no han sido verificados. El autor los describe como una comprobacion comparativa, no como un benchmark completo de calidad de release.

Como referencia, la tabla de benchmarks del modelo base Qwen3.6-35B-A3B (no del fine-tune) incluye los siguientes resultados:

| Categoria | Benchmark | Qwen3.5-27B | Gemma4-31B | Qwen3.5-35BA3B | Gemma4-26BA4B | Qwen3.6-35BA3B |
|---|---|---|---|---|---|---|
| Coding Agent | SWE-bench Verified | 75.0 | 52.0 | 70.0 | 17.4 | 73.4 |
| Coding Agent | SWE-bench Multilingual | 69.3 | 51.7 | 60.3 | 17.3 | 67.2 |
| Coding Agent | SWE-bench Pro | 51.2 | 35.7 | 44.6 | 13.8 | 49.5 |
| Coding Agent | Terminal-Bench 2.0 | 41.6 | 42.9 | 40.5 | 34.2 | 51.5 |
| Coding Agent | Claw-Eval Avg | 64.3 | 48.5 | 65.4 | 58.8 | 68.7 |
| General Agent | TAU3-Bench | 68.4 | 67.5 | 68.9 | 59.0 | 67.2 |

No se han publicado resultados de benchmarks adicionales propios del fine-tune en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 35B parametros totales en FP16 se necesitan aproximadamente 70 GB de VRAM. Con cuantizacion 4-bit, la carga de pesos se reduce a unos 17-20 GB, lo que permite ejecutar el modelo en GPUs de consumo con 24 GB de VRAM.
- GPU recomendadas: A100 80GB, H100 80GB o RTX 4090 24GB (con cuantizacion 4-bit). Tambien es viable en RTX 3090 24GB con cuantizacion 4-bit o 8-bit con margen limitado.
- Cabe en GPU de consumo: si, con cuantizacion 4-bit en tarjetas de 24 GB. Para 16 GB se requiere cuantizacion mas agresiva (2-3 bits) o descarga parcial de capas.
- Opciones de despliegue: vLLM, Text Generation Inference (TGI), llama.cpp (si se genera una version GGUF), Ollama. El modelo es compatible con la libreria transformers.
- Latencia y throughput: no disponibles en la informacion proporcionada. Al ser un modelo MoE con solo 3B de parametros activos, la latencia por token es mucho menor que la de un modelo denso de 35B, pero no se ofrecen cifras concretas.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3.6-35B-A3B-Claude-4.6-Opus-Reasoning-Distilled | 35.95B | 3B | 262.144 (ext. 1M) | Apache 2.0 | Fine-tune de razonamiento CoT destilado de Claude Opus 4.6 |
| Qwen3.6-35B-A3B (base) | 35.95B | 3B | 262.144 (ext. 1M) | Apache 2.0 | Modelo base, sin destilacion de CoT |
| Qwen3.5-35B-A3B | 35B | 3B | no disponible | Apache 2.0 | Version anterior de la misma familia |
| Jackrong/Qwen3.5-27B-Claude-4.6-Opus-Reasoning-Distilled | 27B | no disponible | no disponible | no disponible | Modelo inspirador del presente fine-tune |
| mudler/Qwen3.6-35B-A3B-Claude-4.7-Opus-Reasoning-Distilled-APEX-GGUF | 35.95B | 3B | 262.144 (ext. 1M) | Apache 2.0 | Variante posterior con cuantizacion GGUF y destilacion de Claude Opus 4.7 |

El rendimiento en MMLU-Pro del fine-tune supera al modelo base en 32.85 puntos porcentuales, aunque con una muestra pequena. En benchmarks de codificacion agente, el modelo base ya mostraba resultados destacados (SWE-bench Verified 73.4), que se esperan preservados o mejorados en el fine-tune, aunque no se dispone de mediciones propias.

## Limitaciones y advertencias

- El fine-tune fue entrenado exclusivamente con texto. Aunque el modelo base incluye un codificador de vision, no se debe utilizar para tareas de imagen o video, ya que el entrenamiento no cubrio esos dominios.
- Los benchmarks declarados (MMLU-Pro) se basan en una muestra de 70 preguntas y no estan verificados. No deben considerarse como una evaluacion completa de las capacidades del modelo.
- Solo se declara soporte de ingles. El rendimiento en otros idiomas no esta documentado y puede ser inferior al del modelo base multilingue.
- Riesgo de alucinacion inherente a los modelos de lenguaje, especialmente en tareas de razonamiento de larga duracion o cuando se le pide informacion factual especifica.
- La destilacion de CoT a partir de Claude Opus 4.6 puede introducir sesgos del modelo de origen, incluidos patrones de razonamiento que no siempre son correctos o eficientes.
- Para uso en produccion, se recomienda validar el modelo con evaluaciones independientes y pruebas especificas del dominio, dado que la informacion de rendimiento proporcionada es limitada.
- La licencia Apache 2.0 permite uso comercial, pero se deben revisar las licencias de los datasets de entrenamiento y las condiciones de uso de las herramientas de destilacion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Arun63/Qwen3.6-35B-A3B-Claude-4.6-Opus-Reasoning-Distilled
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Blog de Qwen sobre Qwen3.6-35B-A3B: https://qwen.ai/blog?id=qwen3.6-35b-a3b
- Modelo inspirador: https://huggingface.co/Jackrong/Qwen3.5-27B-Claude-4.6-Opus-Reasoning-Distilled
- Variante GGUF de un modelo similar: https://huggingface.co/mudler/Qwen3.6-35B-A3B-Claude-4.7-Opus-Reasoning-Distilled-APEX-GGUF
- Perfil del autor en X: https://x.com/Hesamation
- Comunidad de Open Source AI Builders: https://discord.gg/vtJykN3t
