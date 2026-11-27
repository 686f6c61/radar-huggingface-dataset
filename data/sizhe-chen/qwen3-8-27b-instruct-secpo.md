# Sizhe-Chen/Qwen3.8-27B-Instruct-SecPO

## Resumen

Qwen3.8-27B-Instruct-SecPO es un ajuste fino defensivo del modelo multimodal Qwen3.8-27B de Alibaba, desarrollado por Sizhe Chen, Yibo Peng, Jaewon Chang, Chawin Sitawarin y David Wagner (grupos de investigación vinculados a UC Berkeley) para mitigar ataques de *prompt injection*. El modelo aplica Secure Preference Optimization (SecPO), una variante teóricamente fundamentada de DPO, combinada con un pipeline de entrenamiento adversarial que sintetiza inyecciones fuertes. El objetivo es que las instrucciones embebidas en datos no confiables (correos, documentos, páginas web, retornos de herramientas o imágenes) no puedan secuestrar el comportamiento del agente.

El checkpoint parte de Qwen3.8-27B, un modelo de 27.781.427.952 parámetros (27,78 mil millones) con capacidades image-text-to-text, y se distribuye en formato safetensors con un tamaño de repositorio de 55,6 GB. Está entrenado y evaluado con el modo *thinking* desactivado (`enable_thinking=False`); para inferencia en modo razonamiento existe un checkpoint hermano, Qwen3.8-27B-Thinking-SecOPD.

Su relevancia actual radica en que los agentes basados en LLM son cada vez más vulnerables a inyecciones de prompt, y los defensores previos (como Meta-SecAlign) mostraban tasas de éxito de ataque cercanas al 100 % bajo ataques adaptativos. SecPO reduce esas tasas entre 1,5 y 14,5 veces frente a Meta-SecAlign, y entre 2,4 y 4,6 veces adicionales frente a usar pérdida DPO, manteniendo prácticamente intacta la utilidad en tareas benignas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text), familia Qwen3.8; tag de librería `qwen3_5` |
| Parametros totales | 27.781.427.952 (27,78 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería transformers; PEFT en el entrenamiento) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del Qwen3.8-27B base, un transformer multimodal capaz de procesar entradas de imagen y texto. Sobre esa base se aplica un ajuste fino con PEFT y la pérdida SecPO, una formulación teóricamente motivada que sustituye el anclaje de DPO al modelo de referencia no defendido por una aproximación a un oráculo invariante a inyecciones y preservador de utilidad. El entrenamiento usa un ritmo de aprendizaje de 8e-5 y pares de preferencia con inyecciones optimizadas.

El pipeline de entrenamiento adversarial sintetiza entradas inyectadas fuertes (best@240) y entrena al modelo sobre ellas. El conjunto de datos de entrenamiento reutiliza inyecciones optimizadas generadas durante el entrenamiento adversarial de Llama-3.1-8B-Instruct, con etiquetas de respuesta específicas para Qwen3.8-27B, y está publicado como Sizhe-Chen/Qwen3.8-27B-Instruct-SecPO-trainset. El checkpoint se entrena y evalúa con el modo *thinking* desactivado.

## Capacidades

- Generación de texto conversacional y multimodal (image-text-to-text): acepta imágenes junto con texto.
- Razonamiento científico y matemático (evaluado en MMLU-Pro, GPQA Diamond, GSM8K, Minerva Math).
- Seguimiento de instrucciones (AlpacaEval2, SEP Utility).
- Tool calling y flujos agénticos (evaluado en AgentDojo y AgentDyn).
- Defensa frente a prompt injection: distingue instrucciones confiables (en `system` o `user`) de texto no confiable (en `input`, retornos de herramientas o imágenes).
- Capacidad de rechazo de inyecciones fuertes y adaptativas (SEP PISmith Adpt. ASR@10 de 1,9 %).
- Multilingüe limitado: la model card declara únicamente inglés.
- Modo *thinking* desactivado en este checkpoint; el razonamiento explícito requiere el checkpoint SecOPD.

## Casos de uso

- Agentes con acceso a correo o documentos externos: el modelo trata el contenido no confiable como datos y no como instrucciones, lo que permite resumir correos o extraer datos sin que un atacante secuestre el flujo.
- Automatización de atención al cliente con entradas de usuario y adjuntos: al separar instrucciones del sistema y texto no confiable, reduce el riesgo de que un mensaje malicioso altere las acciones del bot.
- Procesamiento de páginas web y resultados de búsqueda en pipelines RAG: el modelo puede resumir o extraer información de fuentes no confiables manteniendo la política del sistema (SEP ASR de 0,7 %).
- Tool calling en producción: con AgentDojo ASR de 0,0 % y utilidad agéntica de 84,9 %, es adecuado para asistentes que invocan APIs y ejecutan acciones multi-paso.
- Análisis de documentos e imágenes con riesgo de inyección: al soportar image-text-to-text, puede procesar capturas o PDFs escaneados sin obedecer texto malicioso embebido en la imagen.
- Evaluación y *red teaming* de sistemas: sirve como referencia defendida para comparar tasas de éxito de ataque frente a modelos no defendidos en pruebas de seguridad.
- Despliegue en entornos regulados que exigen trazabilidad de instrucciones: la separación estricta entre canales confiables y no confiables facilita auditorías de comportamiento.

## Benchmarks y rendimiento

Utilidad (mayor es mejor):

| Capacidad | Benchmark | Undefended (Qwen3.8-27B) | SecPO (este modelo) |
|---|---|---:|---:|
| Ciencia | MMLU-Pro | 82,3 % | 82,1 % |
| Ciencia | GPQA Diamond | 79,8 % | 76,8 % |
| Matemáticas | GSM8K | 96,4 % | no disponible |
| Matemáticas | Minerva Math | 96,0 % | 95,6 % |
| Seguimiento de instrucciones | AlpacaEval2 | 53,3 % | 53,6 % |
| Seguimiento de instrucciones | SEP Utility | 88,6 % | 88,7 % |
| Agéntico | AgentDojo Utility | 85,7 % | 84,9 % |
| Agéntico | AgentDyn Utility | 78,3 % | 68,3 % |

Seguridad (menor tasa de éxito de ataque es mejor):

| Capacidad | Benchmark | Undefended | SecPO (este modelo) |
|---|---|---:|---:|
| Seguimiento de instrucciones | SEP ASR | no disponible | 0,7 % |
| Seguimiento de instrucciones | SEP PISmith Adpt. ASR@10 | no disponible | 1,9 % |
| Agéntico | AgentDojo ASR | 2,0 % | 0,0 % |
| Agéntico | AgentDojo Genetic Adpt. ASR | 87,5 % | no disponible |
| Agéntico | AgentDyn ASR | 0,9 % | 0,0 % |

El paper reporta que, en flujos agénticos, SecPO + AT sobre Qwen3.6-27B alcanza un 8,8 % de AgentDojo ASR@800 frente al 78,8 % de Meta-SecAlign bajo el ataque AttackerMovesSecond, y que el entrenamiento adversarial reduce las ASR entre 1,5 y 14,5 veces frente a Meta-SecAlign en tres ataques adaptativos de última generación.

## Requisitos de hardware

- VRAM estimada para inferencia en precisión nativa (BF16): aproximadamente 55,6 GB de pesos, por lo que se necesitan del orden de 60-70 GB de VRAM contando caché KV y overhead.
- GPU recomendadas para BF16: A100 80 GB, H100 80 GB, o múltiples GPU de 48 GB en paralelo (por ejemplo, 2× RTX 6000 Ada o L40S).
- En GPU de consumo: no cabe en BF16 en una RTX 4090 (24 GB); requeriría cuantización a 8 bits o 4 bits, cuyos formatos no están documentados en la información disponible.
- Opciones de despliegue: transformers (librería declarada), endpoints compatibles según los tags; vLLM, llama.cpp, Ollama o TGI no están confirmados en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Defensa frente a inyección | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-27B-Instruct-SecPO (este) | 27,78 B | no disponible | SecPO + AT; AgentDojo ASR 0,0 % | Apache 2.0 | Hugging Face, 232 descargas |
| Qwen3.8-27B (undefended) | 27,78 B | no disponible | AgentDojo ASR 2,0 %; Genetic Adpt. 87,5 % | Apache 2.0 | Hugging Face |
| Qwen3.8-27B-Instruct-MetaSecAlign | 27,78 B | no disponible | DPO con anclaje inseguro; ASR elevadas bajo ataques adaptativos | Apache 2.0 | Hugging Face |
| Qwen3.8-27B-Thinking-SecOPD | 27,78 B | no disponible | SecOPD con modo razonamiento | Apache 2.0 | Hugging Face |
| Llama-3.1-8B-Instruct-SecPO | 8 B | no disponible | SecPO + AT sobre Llama-3.1-8B | no disponible en la información | Hugging Face |

## Limitaciones y advertencias

- Entrenado y evaluado con *thinking* desactivado; usar `enable_thinking=False`. El modo razonamiento requiere el checkpoint SecOPD.
- Solo declara inglés como idioma soportado; el rendimiento en otros idiomas no está evaluado.
- La utilidad agéntica cae en AgentDyn (78,3 % a 68,3 %), una degradación apreciable frente al modelo no defendido.
- GPQA Diamond baja de 79,8 % a 76,8 %, lo que indica una pérdida moderada en razonamiento científico.
- La defensa se evalúa frente a ataques conocidos; no hay garantía frente a ataques adaptativos no vistos. El propio paper señala que Meta-SecAlign llegaba a ASR cercanas al 100 % bajo ataques adaptativos.
- Riesgo de alucinación inherente al modelo base; la defensa no lo elimina.
- El conjunto de entrenamiento reutiliza inyecciones generadas para Llama-3.1-8B-Instruct, lo que puede limitar la diversidad de ataques cubiertos.
- Licencia Apache 2.0 con uso comercial permitido siguiendo el modelo base Qwen3.8-27B; conviene revisar los términos del modelo base.
- El repositorio tiene 232 descargas y 0 likes, por lo que la validación comunitaria es aún escasa.
- La longitud de contexto y las opciones de cuantización no están documentadas, lo que complica la planificación de despliegues.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Sizhe-Chen/Qwen3.8-27B-Instruct-SecPO
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Dataset de entrenamiento: https://huggingface.co/datasets/Sizhe-Chen/Qwen3.8-27B-Instruct-SecPO-trainset
- Paper (arXiv): https://arxiv.org/abs/2610.41998
- Código: https://github.com/Sizhe-Chen/SecPO
- Checkpoint Meta-SecAlign Qwen3.8-27B: https://huggingface.co/Sizhe-Chen/Qwen3.8-27B-Instruct-MetaSecAlign
- Checkpoint SecOPD Qwen3.8-27B: https://huggingface.co/Sizhe-Chen/Qwen3.8-27B-Thinking-SecOPD
- Checkpoint SecPO Qwen3.6-27B: https://huggingface.co/Sizhe-Chen/Qwen3.6-27B-Instruct-SecPO
- Checkpoint SecPO Llama-3.1-8B-Instruct: https://huggingface.co/Sizhe-Chen/Llama-3.1-8B-Instruct-SecPO
- Página del autor: https://sizhe-chen.github.io
