# ntlfi/opd-rl-swe7b-oec-needed2x-epoch2of3

## Resumen

`ntlfi/opd-rl-swe7b-oec-needed2x-epoch2of3` es un ajuste fino (fine-tune) del modelo `Qwen/Qwen2.5-Coder-7B` publicado por el usuario ntlfi en Hugging Face. Se trata de un modelo causal de generación de texto orientado a código, derivado de la familia Qwen2.5-Coder de Alibaba Cloud, y entrenado aparentemente mediante aprendizaje por refuerzo (RL) sobre tareas de ingeniería de software (el sufijo "swe" del nombre sugiere SWE-bench), con un esquema de épocas parciales ("epoch2of3") y un factor "needed2x" cuyo significado no se documenta.

El modelo base Qwen2.5-Coder-7B es un transformer denso de 7.610 millones de parámetros (6.530 millones sin embeddings), con 28 capas, atención con GQA (28 cabezas de consulta y 4 de clave/valor), RoPE, SwiGLU, RMSNorm y sesgo en QKV. El contexto nativo es de 131.072 tokens, aunque la configuración por defecto de `config.json` está fijada a 32.768 tokens y requiere activar YaRN (factor 4.0) para explotar la ventana completa.

La relevancia de esta ficha es doble: por un lado, documenta un fine-tune de RL sobre un modelo de código consolidado; por otro, sirve de advertencia sobre los riesgos de los checkpoints derivados publicados sin model card propia, sin métricas y sin documentación del proceso de entrenamiento. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y la model card incluida es la del modelo base, no la del fine-tune.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal denso (Qwen2) con RoPE, SwiGLU, RMSNorm y sesgo en atención QKV; GQA con 28 cabezas Q y 4 KV |
| Parametros totales | 7.615.616.512 (7,61 B); 6,53 B sin embeddings |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 131.072 tokens nativos; 32.768 tokens en la configuración por defecto; ampliable a 131.072 con YaRN (factor 4.0) |
| Tipos de cuantizacion | No disponible en la información proporcionada (el repo contiene safetensors en precisión completa; no se listan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | Inglés (`en`) según los metadatos; el modelo base Qwen2.5-Coder tiene cobertura multilingüe más amplia, pero el fine-tune declara únicamente inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (librería `transformers`) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen2.5-Coder-7B: un transformer decoder-only denso de 28 capas con 7,61 B de parámetros totales, atención con grouped-query attention (28 cabezas de consulta, 4 de clave/valor), embeddings rotatorios (RoPE), activación SwiGLU, normalización RMSNorm y sesgo en las proyecciones QKV. El modelo base fue preentrenado por Alibaba con 5,5 billones de tokens que combinan código fuente, datos de grounding texto-código y datos sintéticos, seguido de un post-entrenamiento con instrucciones.

Sobre el fine-tune concreto de ntlfi no hay información publicada: la model card del repositorio es una copia de la del modelo base `Qwen2.5-Coder-7B-Instruct` y no describe el proceso de RL, el dataset utilizado, la función de recompensa, el número de pasos ni los hiperparámetros. El nombre del repositorio sugiere entrenamiento por refuerzo orientado a tareas de SWE (software engineering), con dos épocas parciales de tres y un factor "needed2x" sin definir. No se dispone de información sobre si se aplicó DPO, PPO, GRPO u otra variante, ni sobre la composición del dataset de preferencias o de verificación.

## Capacidades

- Generación de código en múltiples lenguajes de programación, heredada del modelo base Qwen2.5-Coder.
- Razonamiento sobre código: explicación, depuración y corrección de fragmentos existentes.
- Generación aumentada por recuperación de contexto largo: hasta 131.072 tokens con YaRN activado, útil para repositorios completos o múltiples archivos.
- Conversación multi-turno con plantilla de chat (`apply_chat_template`) y rol de sistema.
- Relleno de código (fill-in-the-middle) y completado en editores, capacidades típicas del modelo base.
- Razonamiento matemático y competencias generales heredadas de Qwen2.5.
- Soporte de tool calling y function calling: no confirmado explícitamente para este fine-tune; el modelo base Instruct lo soporta, pero el fine-tune no documenta si lo conserva.
- Capacidades de agente multi-paso: no confirmadas en la información disponible.
- Capacidades de visión o audio: no disponibles.
- Modo "thinking" explícito: no disponible.

## Casos de uso

- Asistencia a la resolución de issues en repositorios: el modelo puede recibir el contexto de un problema (descripción, trazas, archivos relevantes) y proponer un parche, aprovechando la ventana de contexto extendida con YaRN para incluir varios ficheros del repositorio en una sola pasada.
- Generación de tests unitarios: dado un módulo de código, el modelo produce casos de prueba en el framework del proyecto (pytest, JUnit, Jest), lo que encaja con el enfoque de entrenamiento orientado a ingeniería de software.
- Revisión de código automatizada en pipelines de CI: integrado como paso previo al merge, el modelo puede señalar errores evidentes, malas prácticas o falta de manejo de errores en los diffs, siempre con revisión humana posterior.
- Autocompletado y relleno en IDE: el modelo base soporta FIM, por lo que el fine-tune puede emplearse en asistentes tipo Copilot para completar funciones a partir de la firma y el contexto circundante.
- Migración y refactorización de código: traducción entre lenguajes o entre versiones de una API (por ejemplo, de Python 2 a 3, o de una librería a su sucesora), con el contexto suficiente para mantener la coherencia entre módulos.
- Explicación y documentación de bases de código heredadas: generación de docstrings, comentarios y resúmenes arquitectónicos a partir de varios archivos concatenados en el prompt.
- Generación de scripts de automatización y tareas de DevOps: creación de Dockerfiles, manifiestos de Kubernetes o scripts de shell a partir de una descripción en lenguaje natural.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del repositorio remite a los resultados del modelo base (blog de Qwen2.5-Coder), pero no aporta métricas propias del fine-tune ni comparaciones con el checkpoint original. No se debe asumir que el fine-tune iguala o supera al base sin evaluación independiente.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 15,2 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, 18-24 GB para contextos moderados.
- VRAM estimada en cuantización de 8 bits: alrededor de 8 GB; en 4 bits: alrededor de 4-5 GB (estimaciones teóricas, no verificadas para este checkpoint).
- GPU recomendadas para FP16: A100 40/80 GB, H100, L40S, RTX A6000. Para contextos largos con YaRN, se recomienda A100 80 GB o H100 por el coste de la caché KV.
- GPU de consumo: cabe en RTX 4090 (24 GB) en FP16 con contextos moderados, y en RTX 3090/4080 con cuantización 8 o 4 bits.
- Opciones de despliegue: `transformers` (soporte nativo), vLLM (recomendado por el autor del modelo base para contextos largos con YaRN estático), TGI (el repo incluye la etiqueta `text-generation-inference`), llama.cpp/Ollama si se generan conversiones GGUF (no incluidas en el repo).
- Latencia y throughput: no disponibles para este checkpoint; el modelo base publica cifras en la documentación de Qwen, pero no se trasladan automáticamente al fine-tune.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| ntlfi/opd-rl-swe7b-oec-needed2x-epoch2of3 | 7,61 B | 32.768 (131.072 con YaRN) | Apache 2.0 | Hugging Face, 0 descargas | Fine-tune de RL sin documentación ni métricas |
| Qwen/Qwen2.5-Coder-7B-Instruct | 7,61 B | 32.768 (131.072 con YaRN) | Apache 2.0 | Hugging Face, ampliamente usado | Modelo base oficial, con benchmarks publicados |
| Qwen/Qwen2.5-Coder-7B | 7,61 B | 32.768 (131.072 con YaRN) | Apache 2.0 | Hugging Face | Versión base sin instrucciones |
| deepseek-ai/DeepSeek-Coder-V2-Lite-Instruct | 15,7 B (2,4 B activos, MoE) | 128 K | Licencia propia DeepSeek | Hugging Face | Alternativa MoE de código con mayor eficiencia por token |

## Limitaciones y advertencias

- Ausencia total de documentación del fine-tune: la model card es la del modelo base, por lo que no se conocen el dataset, la función de recompensa, los hiperparámetros ni los criterios de selección del checkpoint.
- Riesgo de degradación respecto al modelo base: un entrenamiento de RL sin evaluación publicada puede reducir capacidades generales (olvido catastrófico) o introducir sesgos hacia el formato de las tareas de entrenamiento.
- Riesgo de alucinación de APIs, funciones y librerías: comportamiento habitual en modelos de código, agravado por la falta de benchmarks que lo cuantifiquen.
- Idiomas: los metadatos declaran únicamente inglés; el rendimiento en castellano u otros idiomas no está garantizado.
- Contexto: la configuración por defecto limita a 32.768 tokens; activar YaRN con factor 4.0 puede degradar el rendimiento en textos cortos, tal como advierte la documentación de Qwen.
- Licencia Apache 2.0: permite uso comercial, pero el usuario debe verificar que el checkpoint derivado cumple las condiciones del modelo base y que no incorpora datos con licencias incompatibles.
- Repositorio sin señales de validación comunitaria (0 descargas, 0 likes): no hay evidencia de que el checkpoint funcione correctamente ni de que los pesos estén íntegros.
- No apto para producción sin evaluación previa en el dominio objetivo: se recomienda comparar contra `Qwen/Qwen2.5-Coder-7B-Instruct` en el conjunto de tareas propio antes de adoptarlo.

## Enlaces

- Hugging Face: https://huggingface.co/ntlfi/opd-rl-swe7b-oec-needed2x-epoch2of3
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-7B
- Modelo base Instruct: https://huggingface.co/Qwen/Qwen2.5-Coder-7B-Instruct
- Blog de la familia Qwen2.5-Coder: https://qwenlm.github.io/blog/qwen2.5-coder-family/
- Repositorio GitHub de Qwen2.5-Coder: https://github.com/QwenLM/Qwen2.5-Coder
- Documentación de Qwen: https://qwen.readthedocs.io/en/latest/
- Paper Qwen2.5-Coder: https://arxiv.org/abs/2409.12186
- Paper Qwen2: https://arxiv.org/abs/2309.00071
- Paper YaRN: https://arxiv.org/abs/2309.00071 (referenciado en la model card)
- Documentación de despliegue con vLLM: https://qwen.readthedocs.io/en/latest/deployment/vllm.html
- Benchmarks de velocidad de Qwen: https://qwen.readthedocs.io/en/latest/benchmark/speed_benchmark.html
- Chat de Qwen: https://chat.qwenlm.ai/
