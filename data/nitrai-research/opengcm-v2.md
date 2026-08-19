# nitrai-research/OpenGCM-v2

## Resumen

OpenGCM-v2 es un modelo de razonamiento de 9 000 millones de parámetros desarrollado por NitrAI, construido sobre la base de Qwen/Qwen3.5-9B. Su objetivo es destilar trayectorias de agentes de codificación, razonamiento matemático multi-paso y lógica de nivel de sistema desde modelos frontera (GPT-5.5, Claude-Fable-5 y GLM-5.2) en un modelo ligero y ejecutable en hardware de consumo. El modelo está orientado a tareas de razonamiento estructurado, síntesis de código y verificación de parches.

El proyecto queda actualmente deprecado por sus propios autores, que recomiendan migrar a su modelo Polaris. Aun así, OpenGCM-v2 resulta relevante como ejemplo de destilación eficiente con DoRA sobre una base de última generación (Qwen3.5-9B, con ventana de contexto nativa de 262 000 tokens) y por su integración sencilla en Ollama y Transformers. La licencia Apache 2.0 permite uso comercial sin restricciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (base Qwen3.5-9B) |
| Parametros totales | 9 653 104 368 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 262 000 tokens (nativa del base); entrenado con max_seq_length de 2048 |
| Tipos de cuantizacion | GGUF Q6_K disponible; compatible con cuantizaciones de llama.cpp y Transformers |
| Idiomas soportados | Ingles (declarado en la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo principal), GGUF (para Ollama) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-9B, un transformer denso de última generación con ventana de contexto de 262 000 tokens. El entrenamiento de OpenGCM-v2 se realizó mediante PEFT con DoRA (Weight-Decomposed Low-Rank Adaptation), con rango 64 y alpha 128, aplicado a todas las proyecciones de atención y MLP (q_proj, k_proj, v_proj, o_proj, gate_proj, up_proj, down_proj). Se usó el optimizador adamw_8bit, una tasa de aprendizaje de 1,5 × 10⁻⁵, 1100 pasos con warmup de 110 y tamaño de lote efectivo de 4 (batch 1 con gradiente acumulado de 4). La precisión fue bfloat16 y el entrenamiento se ejecutó en una única GPU de consumo con la librería Unsloth.

El dataset de destilación, auditado para evitar cuellos de botella de VRAM, contiene 597 pares pregunta-respuesta con 904 466 tokens en total. Se compone de 159 trayectorias de agente de Fable-5 (uso real de herramientas, bash y sistema de ficheros), 410 ítems de razonamiento paso a paso de GPT-5.5 y 28 trazas de razonamiento de sistema de GLM-5.2. La longitud media por ítem es de 1515 tokens.

## Capacidades

- Razonamiento matemático paso a paso: resuelve problemas de secuencias y lógica formal con descomposición explícita.
- Razonamiento de código localizado: capaz de localizar errores y verificar parches en fragmentos de código.
- Razonamiento de nivel de sistema: trazas de tool-use y manipulación de sistema de ficheros.
- Generación de texto conversacional en inglés con formato de chat (ChatML).
- Soporte de tool calling implícito a través de las trayectorias de agente destiladas (no se documenta una API de function calling específica).
- Sin capacidades multimodales: solo texto.
- No se documenta un modo de pensamiento explícito, aunque el prompt de sistema recomendado usa etiquetas `thinking` y `response`.

## Casos de uso

- Resolución de problemas matemáticos competitivos: el modelo puede abordar problemas tipo AIME con razonamiento paso a paso; en la evaluación resolvió un problema de secuencia numérica correctamente en 33 segundos.
- Verificación de parches de código: dado un fragmento con un bug, puede proponer y validar la corrección, como muestra su resultado en SWE-bench Pro.
- Asistente de programación en local: integrable en entornos de desarrollo con Ollama para generar y depurar código sin conexión a la nube.
- Tutoría de lógica y algoritmos: explicación de conceptos con descomposición estructurada, útil para plataformas educativas.
- Automatización de tareas de agente en sistemas de ficheros: gracias a las trayectorias de Fable-5, puede manejar operaciones de bash y manipulación de archivos en entornos controlados.
- Prototipado de pipelines de razonamiento: como base para experimentos de destilación o ajuste fino adicional, dado su tamaño contenido y licencia permisiva.

## Benchmarks y rendimiento

La evaluación publicada usa un único ejemplo por benchmark, por lo que los resultados no son estadísticamente significativos y deben interpretarse como indicativos, no concluyentes. No se han publicado resultados agregados con métricas estándar (MMLU, HumanEval, GSM8K) en la información disponible.

| Benchmark | OpenGCM-v2 (9B) | gemma4-coder-fable5 | Observaciones |
|---|---|---|---|
| AIME 26 | 1/1 (100 %) | 1/1 (100 %) | Un solo problema |
| SWE-bench Pro | 1/1 (100 %) | 0/1 (0 %) | Un solo caso |
| GPQA Diamond | 0/1 (0 %) | 1/1 (100 %) | Un solo caso |
| MMMU Pro | 0/1 (0 %) | 1/1 (100 %) | Un solo caso |
| LiveCodeBench | 0/1 (0 %) | 0/1 (0 %) | Un solo caso |

Los tiempos de inferencia por ejemplo oscilan entre 17,8 y 162,8 segundos, muy superiores a los de gemma4-coder-fable5, lo que sugiere un coste de razonamiento más alto.

## Requisitos de hardware

- VRAM estimada: en bfloat16 los pesos ocupan aproximadamente 19,3 GB (tamaño del repositorio), por lo que se necesita una GPU con al menos 24 GB (RTX 3090, RTX 4090, A10G) para inferencia sin cuantizar.
- Con cuantización GGUF Q6_K (el formato recomendado para Ollama), el modelo ocupa aproximadamente 7-8 GB y puede ejecutarse en GPUs de consumo con 8-12 GB de VRAM, como RTX 3060 12 GB, RTX 4070 o RTX 3080.
- Cuantizaciones inferiores (Q4_K_M) reducirían aún más el requisito, aunque no se proporcionan oficialmente.
- Despliegue compatible: Ollama (con Modelfile), Transformers con `device_map="auto"`, y por extensión llama.cpp y vLLM (no documentado explícitamente).
- Latencia y throughput: no se proporcionan datos de throughput; los tiempos de evaluación por ejemplo sugieren una inferencia lenta en tareas de razonamiento largo (hasta 163 segundos en LiveCodeBench).

## Comparativa con modelos similares

La comparativa se limita a los modelos que aparecen en la información publicada. No se dispone de datos fiables de otros modelos de 9B para una comparación completa.

| Modelo | Parametros | Contexto | Enfoque | Licencia |
|---|---|---|---|---|
| OpenGCM-v2 | 9,65 B | 262k (nativo) | Razonamiento y codigo | Apache 2.0 |
| gemma4-coder-fable5 | no disponible | no disponible | Codigo y razonamiento | no disponible |
| Qwen3.5-9B (base) | 9,65 B | 262k | Modelo base general | no disponible (probablemente Apache 2.0) |

OpenGCM-v2 se diferencia de su base por la destilación específica en razonamiento de agente, aunque la evaluación con un solo ejemplo por tarea no permite establecer superioridad concluyente sobre gemma4-coder-fable5.

## Limitaciones y advertencias

- Modelo deprecado: los autores recomiendan explícitamente migrar a Polaris; no se esperan actualizaciones ni soporte continuado.
- Evaluación insuficiente: los benchmarks publicados usan un único ítem por tarea, lo que impide extraer conclusiones fiables sobre el rendimiento real.
- Inestabilidad en generación larga: se documenta deriva de contexto y posible cambio de foco o alucinación de restricciones de la tarea durante inferencias muy largas. Se recomienda temperatura baja (0,2-0,4) y prompts de sistema estructurados.
- Dataset de entrenamiento muy reducido: 597 ítems, lo que limita la generalización a dominios no cubiertos por la destilación.
- Solo inglés: no se garantiza rendimiento en otros idiomas.
- Longitud de entrenamiento limitada: aunque el base soporta 262k tokens, el entrenamiento se hizo con secuencias de máximo 2048 tokens, por lo que el rendimiento en contextos largos no está validado.
- Riesgo de alucinación en razonamiento formal: en tareas de lógica o matemáticas avanzadas puede producir pasos incorrectos con apariencia de validez.
- Sin capacidades multimodales ni soporte de audio o visión.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nitrai-research/OpenGCM-v2
- Modelo en Hugging Face (organizacion NitrAI): https://huggingface.co/NitrAI/OpenGCM-v2
- Pagina de modelos de NitrAI: https://nitrai.dev/models.html
- Documentacion de NitrAI: https://nitrai.dev/docs.html
- Modelo en Ollama: https://ollama.com/NitrAI/OpenGCM-v2
- Dataset de destilacion GPT-5.5: https://huggingface.co/datasets/ansulev/GPT-5.5-Thinking-Max-Distill-25k
- Dataset de trazas GLM-5.2: https://huggingface.co/datasets/AletheiaResearch/GLM-5.2-Agent
- Dataset de trazas Fable-5: https://huggingface.co/datasets/Glint-Research/Fable-5-traces
