# Plans11/Opus4.7-GODs.Ghost.Codex-4B.GGuF

## Resumen

Opus4.7-GODs.Ghost.Codex-4B es un modelo de lenguaje especializado en código, publicado por el usuario Plans11 en Hugging Face, construido mediante ajuste fino supervisado sobre el modelo base Qwen/Qwen3.5-4B. Con 4.205.751.296 parámetros (~4B), está empaquetado en formato GGUF para inferencia local mediante llama.cpp y runtimes compatibles como LM Studio. Su propuesta es ofrecer un asistente de programación ligero que quepa en hardware de consumo, combinando generación de código, depuración y razonamiento paso a paso.

El modelo se presenta como un destilado de patrones de razonamiento inspirados en sistemas "Opus-style", entrenado sobre una mezcla heterogénea de datasets de código, razonamiento y conversación (Python_GOD_Coder_50k, varios conjuntos derivados de Claude Opus 4.6, datos personales de Codex, Code-Feedback, llava-instruct-mix-vsft y dataclaw). Esta composición sugiere un ajuste orientado a flujos de trabajo de desarrollador más que a un uso generalista.

Es relevante ahora porque la categoría de modelos pequeños (3-4B) ajustados para código y desplegables en local está creciendo como alternativa práctica a APIs en la nube para tareas de autocompletado, refactorización y explicación de código con privacidad de datos. No obstante, el repositorio no incluye información verificable sobre licencia, benchmarks ni proceso de entrenamiento detallado, lo que limita su evaluación rigurosa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5-4B; detalles no disponibles) |
| Parametros totales | 4.205.751.296 (~4B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 8.192 tokens (valor recomendado en la model card para llama.cpp; contexto nativo del base no confirmado) |
| Tipos de cuantizacion | GGUF: Q4_K_M, Q5_K_M, Q8_0 (mencionados en la model card); imatrix (tag) |
| Idiomas soportados | en (inglés) |
| Licencia | no disponible (la model card sugiere que hereda la del base, sin confirmar) |
| Formato de pesos | GGUF (safetensors como origen del cómputo de parámetros) |

## Arquitectura y entrenamiento

La arquitectura subyacente corresponde a Qwen3.5-4B, un transformer denso de aproximadamente 4B parámetros. El autor no documenta modificaciones estructurales, por lo que se asume una arquitectura estándar de decoder-only transformer con atención completa, sin innovaciones declaradas como decodificación especulativa o atención lineal.

El entrenamiento consiste en ajuste fino supervisado (instruction tuning) sobre una mezcla de diez datasets: WithinUsAI/Python_GOD_Coder_50k, Roman1111111/claude-opus-4.6-10000x, Crownelius/Opus-4.6-Reasoning-3300x y su variante formateada de 2100x, TeichAI/Claude-Opus-4.6-Reasoning-887x, peteromallet/my-personal-codex-data, misterkerns/my-personal-claude-code-data, HuggingFaceH4/llava-instruct-mix-vsft, m-a-p/Code-Feedback y peteromallet/dataclaw-peteromallet. No se especifican el número total de tokens, la composición porcentual, ni si hubo etapas de RLHF o DPO. El tag "distilled" sugiere que parte de los datos son trazas de razonamiento generadas por modelos mayores (presuntamente Claude Opus 4.6), pero el proceso de destilación no se detalla.

## Capacidades

- Generación de código en Python, JavaScript, C++ y otros lenguajes, según declara el autor.
- Depuración y refactorización de código existente.
- Diseño de algoritmos y explicación de lógica paso a paso.
- Cadenas de razonamiento estructurado cuando se le solicita explícitamente ("explain your logic").
- Explicación de código y uso didáctico.
- Conversación multi-turno (tag "conversational").
- Tareas ligeras de razonamiento general.
- Compatibilidad con endpoints (tag "endpoints_compatible").
- Soporte de tool calling: no confirmado en la documentación; la model card menciona "tool-calling wrappers" como complemento externo, no como capacidad nativa verificada.
- Capacidades multimodales: no confirmadas, pese a incluir llava-instruct-mix-vsft en el dataset de entrenamiento.
- Idiomas: únicamente inglés declarado.

## Casos de uso

- Asistente de programación local: integrado en editores como Cursor o Cline mediante llama.cpp, el modelo genera y completa código sin enviar datos a la nube, gracias a su huella de ~3-4 GB en Q4_K_M.
- Refactorización en entornos con requisitos de privacidad: equipos que no pueden usar APIs externas pueden ejecutar el modelo en una estación de trabajo y solicitar reescrituras de funciones manteniendo el código en local.
- Explicación y enseñanza de código: con prompts estructurados, el modelo produce razonamiento paso a paso útil para documentación interna o formación de desarrolladores junior.
- Generación de scripts de automatización: creación de scripts de shell, Python o JS para tareas de CI/CD o administración, con contexto de 8K tokens suficiente para ficheros de tamaño moderado.
- Prototipado rápido de algoritmos: borradores de estructuras de datos y algoritmos que el desarrollador revisa y ajusta, aprovechando la baja latencia esperada en GPU de consumo.
- Preprocesado en pipelines de RAG sobre código: combinado con recuperación de fragmentos de repositorio, el modelo puede resumir o responder preguntas sobre funciones recuperadas, siempre que se gestionen prompts estructurados.
- Base para ajuste adicional: al ser un modelo pequeño con licencia presumiblemente permisiva (sin confirmar), sirve como punto de partida para fine-tuning específico de dominio en una sola GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye métricas de MMLU, HumanEval, GSM8K ni evaluaciones comparativas, y no se han encontrado datos verificables en la búsqueda web asociada.

## Requisitos de hardware

- VRAM/RAM estimada según la model card: Q4_K_M ~3-4 GB, Q5_K_M ~4-5 GB, Q8_0 ~6-8 GB.
- Cabe holgadamente en GPU de consumo: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090; también en GPUs de 8 GB con cuantizaciones Q4/Q5.
- Puede ejecutarse en CPU con llama.cpp, aunque con menor throughput.
- Despliegue: llama.cpp (llama-cli, llama-server), LM Studio; vLLM y TGI no están confirmados para este formato GGUF concreto.
- Parámetros recomendados por el autor: temperatura 0.6-0.8, top-p 0.9-1.0, repeat penalty 1.0-1.1, ctx-size 8192.
- Latencia y throughput: no disponibles; por tamaño y cuantización, se espera inferencia interactiva en GPU de consumo, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Opus4.7-GODs.Ghost.Codex-4B | ~4B | 8.192 (recomendado) | no disponible | GGUF | Ajuste sobre Qwen3.5-4B, orientado a código |
| Qwen2.5-Coder-3B | 3B | 32.768 | Apache 2.0 | safetensors, GGUF | Referencia consolidada en código con benchmarks públicos |
| Qwen2.5-Coder-7B | 7B | 32.768 | Apache 2.0 | safetensors, GGUF | Mayor tamaño, mejor rendimiento en código, más VRAM |
| DeepSeek-Coder-V2-Lite | 16B (MoE, 2.4B activos) | 128K | DeepSeek License | safetensors, GGUF | MoE eficiente, mayor contexto |

La comparación con Qwen2.5-Coder se ofrece como referencia de categoría, ya que el modelo evaluado no publica benchmarks que permitan una comparación directa de rendimiento. Los datos de los modelos alternativos provienen de sus respectivas model cards públicas.

## Limitaciones y advertencias

- Licencia no declarada: la model card indica que "probablemente hereda" la del base, pero no lo confirma. No debe usarse en producción comercial sin verificar los términos en el repositorio.
- Ausencia total de benchmarks: no hay evidencia publicada de calidad en generación de código, razonamiento o matemáticas.
- Idiomas: solo inglés declarado; el rendimiento en castellano u otros idiomas no está garantizado.
- Riesgo de alucinación: como todo modelo de 4B ajustado sobre datos sintéticos de destilación, puede generar APIs inexistentes, imports falsos o explicaciones plausibles pero incorrectas.
- Datos de entrenamiento heterogéneos y no auditados: la mezcla de diez datasets de procedencia diversa (incluidos datos "personales" de Codex y trazas de Claude Opus) plantea incertidumbre sobre sesgos, calidad y posibles problemas de licencia de los datos.
- Contexto limitado: 8K tokens recomendados restringen su uso en ficheros grandes o repositorios completos.
- Trazabilidad escasa: 0 descargas y 0 likes en el momento de la ficha; autor sin historial verificable, lo que desaconseja su adopción en producción sin evaluación propia.
- Tool calling no verificado: la model card lo menciona como complemento externo, no como capacidad nativa; conviene probarlo antes de integrarlo en agentes.
- Fecha de creación futura (2026-11-11) en los metadatos: posible inconsistencia que conviene contrastar.

## Enlaces

- Hugging Face: https://huggingface.co/Plans11/Opus4.7-GODs.Ghost.Codex-4B.GGuF
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Dataset WithinUsAI/Python_GOD_Coder_50k: https://huggingface.co/datasets/WithinUsAI/Python_GOD_Coder_50k
- Dataset Roman1111111/claude-opus-4.6-10000x: https://huggingface.co/datasets/Roman1111111/claude-opus-4.6-10000x
- Dataset Crownelius/Opus-4.6-Reasoning-3300x: https://huggingface.co/datasets/Crownelius/Opus-4.6-Reasoning-3300x
- Dataset TeichAI/Claude-Opus-4.6-Reasoning-887x: https://huggingface.co/datasets/TeichAI/Claude-Opus-4.6-Reasoning-887x
- Dataset m-a-p/Code-Feedback: https://huggingface.co/datasets/m-a-p/Code-Feedback
- Dataset HuggingFaceH4/llava-instruct-mix-vsft: https://huggingface.co/datasets/HuggingFaceH4/llava-instruct-mix-vsft
- llama.cpp: https://github.com/ggerganov/llama.cpp
- LM Studio: https://lmstudio.ai
