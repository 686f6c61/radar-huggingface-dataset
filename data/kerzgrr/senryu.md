# kerzgrr/Senryu

## Resumen

Senryu es un modelo de lenguaje causal de tipo *chat* y 803 millones de parámetros (803.000.968 exactos según los pesos en safetensors) publicado por el usuario kerzgrr en HuggingFace. Es el sucesor de su modelo Haiku, con ocho capas más y un cambio de arquitectura: sustituye Kimi Delta Attention por Gated DeltaNet-2 y añade una consulta MLA de rango completo. La arquitectura es, por tanto, híbrida: combina capas de atención lineal con estado recurrente (Gated DeltaNet-2) y capas de atención con caché latente comprimida (gated MLA), lo que le permite operar con una ventana de 32.768 tokens en un tamaño muy reducido.

El modelo está orientado a tres capacidades concretas: razonamiento explícito en modo *thinking*, llamadas a herramientas en formato JSON estilo Hermes y conversación multi-turno con instrucciones. El entrenamiento se hizo en dos fases tras un preentrenamiento muy corto: un SFT a longitud de secuencia completa de 32.768 tokens sobre 6.700 millones de tokens (5.390 millones de tokens de asistente) y, después, un ajuste de preferencias con APO-zero sobre 22.517 pares *on-policy* generados por el propio modelo SFT y evaluados con Skywork-Reward-V2-Llama-3.1-8B más comprobaciones por reglas.

Su relevancia ahora es doble. Por un lado, es un banco de pruebas reproducible de un *pipeline* completo (preentrenamiento → SFT largo → preferencias on-policy) a una escala que cabe en una sola GPU consumer. Por otro, documenta con detalle poco habitual en modelos pequeños el contrato de chat: tokens de control `<|think|>` y `<|no_think|>`, bloques `<tools>` y respuestas de herramienta con `<|tool_response|>`. La contrapartida es que solo se ha publicado el checkpoint final del ajuste de preferencias y no hay resultados de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido: capas Gated DeltaNet-2 (atención lineal con estado) + capas gated MLA con consulta de rango completo |
| Parametros totales | 803.000.968 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 32.768 tokens (SFT y `--context-length` por defecto en `inference.py`) |
| Tipos de cuantizacion | No disponible; el repo solo publica pesos en bfloat16 (snapshot EMA). No hay GGUF ni cuantizaciones publicadas |
| Idiomas soportados | Inglés (`en` como único idioma declarado) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bfloat16); tokenizer propio; requiere la librería `tiny_gdn` incluida en el repo |

## Arquitectura y entrenamiento

Senryu es un híbrido de atención lineal y atención *softmax* comprimida. Las capas Gated DeltaNet-2 mantienen un estado recurrente de tamaño fijo con compuertas, lo que evita el crecimiento cuadrático de la atención clásica en secuencias largas; las capas gated MLA (Multi-head Latent Attention con compuertas) proyectan claves y valores a una representación latente de baja dimensión y aplican una consulta de rango completo, siguiendo la estela de DeepSeek. El resultado es un modelo de 803M parámetros que sostiene 32.768 tokens de contexto con una caché mucho menor que la de un transformer denso equivalente. El autor indica que el checkpoint publicado es el snapshot EMA en bfloat16, que las capas Gated DeltaNet-2 se ejecutan con kernels Triton y que se depende de la librería `flash-linear-attention` con versión fijada.

El entrenamiento tiene tres etapas documentadas. La primera es un preentrenamiento sobre 1.150 millones de tokens de FineWeb-Edu, una cantidad muy reducida para los estándares actuales (del orden de 1,4 tokens por parámetro), lo que sitúa el conocimiento factual del modelo muy por debajo de modelos similares entrenados con billones de tokens. La segunda es un SFT a longitud de secuencia de 32.768 tokens sobre 6.700 millones de tokens, de los cuales 5.390 millones son tokens de asistente, con una mezcla muy amplia de datos: FineWeb-Edu y SmolTalk para chat e instrucciones, la familia Nemotron (Post-Training v1, Agentic v1/v2, SFT Agentic v2, SFT Instruction-Following-Chat v2, Instruction-Following-Chat v1, OpenMathReasoning, OpenCodeReasoning, When2Call) para agentes, matemáticas y código, Toucan-1.5M y los datasets de interstellarninja para tool use multi-turno, Glaive Function Calling v2 y Hermes-3 para esquemas de funciones, además de SlimOrca, UltraChat 200k, OASST2, no_robots, tulu-3-sft-personas, WildChat, SystemChat 2.0, Magicoder-Evol-Instruct y self-oss-instruct para instrucciones generales y código. La tercera etapa es APO-zero (*preference optimization* on-policy) sobre 22.517 pares: cuatro muestras por prompt generadas por el propio modelo SFT, puntuadas con Skywork-Reward-V2-Llama-3.1-8B y con verificaciones por reglas para llamadas a herramientas, corrección de respuestas y bucles degenerados. El checkpoint publicado corresponde al paso de optimizador 704, una época completa sobre esos 22.517 pares.

## Capacidades

- Generación de texto causal con plantilla de chat propia y tokens de control de modo: `<|think|>` para razonamiento explícito (cuerpo dentro de `<think>…</think>`) y `<|no_think|>` para respuesta directa.
- Razonamiento paso a paso entrenado con datos de OpenMathReasoning y Hermes reasoning tool use, con modo *thinking* activado por defecto en `inference.py`.
- Llamada a herramientas en JSON estilo Hermes mediante bloques `<tool_call>{"name": ..., "arguments": {...}}</tool_call>`, con los esquemas declarados en un bloque `<tools>` dentro del turno de sistema.
- Recepción de resultados de herramienta como turno `tool` o `user` prefijado con `<|tool_response|>`, lo que habilita bucles multi-paso de agente.
- Herramientas integradas en el script de inferencia: `web-search` (Tavily si existe `TAVILY_API_KEY`, si no DuckDuckGo más Wikipedia), `stateful_python_code_exec` (intérprete restringido con salida estilo Jupyter) y `calculator`.
- Seguimiento de instrucciones y conversación multi-turno, entrenado con SmolTalk, UltraChat, OASST2, WildChat, SystemChat 2.0, no_robots y tulu-3-sft-personas.
- Generación de código con exposición a Magicoder-Evol-Instruct-110K y self-oss-instruct-sc2-exec-filter-50k, además de OpenCodeReasoning.
- Capacidad declarada únicamente en inglés; no se anuncia soporte multilingüe.
- No se declaran capacidades de visión, audio ni multimodalidad.

## Casos de uso

- Agente de búsqueda con herramientas: el modelo recibe un bloque `<tools>` con `web-search` y emite llamadas JSON; el bucle del script inyecta la observación como `<|tool_response|>` y el modelo continúa razonando. Es adecuado porque el 32k de contexto permite arrastrar varias rondas de resultados sin truncar.
- Ejecución de código asistida: con `stateful_python_code_exec` como herramienta, Senryu puede proponer un cálculo, ejecutarlo en el intérprete restringido y corregir el resultado con el stdout devuelto, útil para prototipado de análisis de datos en notebooks.
- Extracción estructurada y *function calling* en backends: al haber sido entrenado con Glaive Function Calling v2 y When2Call, puede mapear lenguaje natural a argumentos de una API definida por esquema, integrándose en un servicio que valide el JSON antes de ejecutarlo.
- Asistente conversacional de dominio acotado con *thinking* desactivable: usando `--no-think` se obtienen respuestas de una frase con latencia menor, apropiado para respuestas de FAQ o clasificación rápida donde no se necesita cadena de razonamiento.
- Tutor de matemáticas y razonamiento: el modo `<think>` expone el desarrollo antes de la respuesta, lo que permite mostrar el razonamiento al usuario; encaja en entornos educativos donde el proceso importa tanto como el resultado.
- Prototipado e investigación de arquitecturas híbridas: al publicarse el código de inferencia y la librería `tiny_gdn`, sirve como base reproducible para experimentar con Gated DeltaNet-2 y MLA a escala de una GPU, incluyendo comparaciones de coste de caché frente a atención densa.
- Evaluación de *pipelines* de preferencias: los 22.517 pares on-policy y el esquema de jueces (reward model más reglas) son un caso de estudio para replicar APO-zero en modelos pequeños.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye cifras de MMLU, HumanEval, GSM8K, IFEval ni de evaluaciones de tool calling, y tampoco se aportan comparaciones numéricas con Haiku u otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en bfloat16 ocupan aproximadamente 1,6 GB (coincide con el tamaño del repo). Como estimación a partir del recuento de parámetros, un despliegue en bf16 necesitaría del orden de 2,5 a 3 GB para prompts cortos y de 4 a 6 GB para aprovechar los 32.768 tokens de contexto, sumando estado recurrente de las capas Gated DeltaNet-2, caché latente de las capas MLA y activaciones. No hay cifras oficiales publicadas.
- GPU recomendadas: cualquier GPU NVIDIA con soporte CUDA y Triton. Una RTX 4090, RTX 3090, L40S, A100 o H100 son válidas; el requisito real es de compatibilidad de kernels, no de memoria.
- Cabe en GPU consumer: sí, con amplio margen, en tarjetas de 8 GB o más (RTX 3060 Ti/4060 Ti en adelante). En tarjetas de 6-8 GB habría que reducir `--context-length`.
- Requisito crítico: el autor indica que se necesita una GPU CUDA porque las capas Gated DeltaNet-2 corren sobre kernels Triton, y que `inference.py` instala automáticamente una versión fijada de `flash-linear-attention` (además de `transformers`, que importa su caché de decodificación) y requiere `git` en el `PATH`. No se documenta ejecución en CPU.
- Opciones de despliegue: el repo proporciona `inference.py` como única vía oficial. No hay pesos GGUF, por lo que llama.cpp y Ollama no son compatibles tal cual; al depender de la librería propia `tiny_gdn`, tampoco se anuncia soporte de vLLM, TGI ni SGLang.
- Latencia y throughput: no disponible. Los parámetros de muestreo por defecto son temperatura 0,6, top-p 0,95, penalización de repetición 1,08 sobre los últimos 256 tokens y 4.096 tokens nuevos como máximo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Arquitectura | Licencia | Notas |
|---|---|---|---|---|---|
| Senryu | 803M | 32.768 | Híbrida Gated DeltaNet-2 + gated MLA | Apache 2.0 | Preentrenado con solo 1,15B tokens; sin benchmarks publicados; requiere CUDA/Triton |
| Llama 3.2 1B Instruct | 1.240M | 128.000 | Transformer denso | Licencia comunitaria Llama 3.2 | Ecosistema amplio (GGUF, Ollama, vLLM); requiere aceptar la licencia |
| Qwen2.5 1.5B Instruct | 1.540M | 32.768 | Transformer denso | Apache 2.0 | Multilingüe, amplio soporte de cuantizaciones y de motores de inferencia |
| SmolLM2 1.7B Instruct | 1.710M | 8.192 | Transformer denso | Apache 2.0 | Entrenado con ~11 billones de tokens; buena relación calidad/tamaño |

La comparación cualitativa es la siguiente: Senryu es el más pequeño del grupo y el único con arquitectura híbrida de atención lineal, lo que le da una ventaja estructural de coste de caché a contextos largos. A cambio, sus 1,15B tokens de preentrenamiento están uno o dos órdenes de magnitud por debajo de sus competidores, su ventana es menor que la de Llama 3.2 1B, solo cubre inglés y no dispone de cuantizaciones ni de soporte en motores estándar. No hay datos de benchmarks que permitan afirmar superioridad o inferioridad en calidad; la comparación numérica de rendimiento no está disponible.

## Limitaciones y advertencias

- Conocimiento del mundo muy limitado: el preentrenamiento se hizo con 1,15B tokens de FineWeb-Edu, aproximadamente 1,4 tokens por parámetro. Es esperable un rendimiento pobre en preguntas factuales fuera de los dominios vistos en el SFT.
- Riesgo alto de alucinación: un modelo de 803M con preentrenamiento corto tiene poca base factual; las respuestas seguras en tono pueden ser incorrectas. El autor mitiga bucles y errores en tool calls con verificaciones por reglas durante el ajuste de preferencias, pero no es una garantía en producción.
- Sesgos: no se documenta ninguna evaluación de sesgos, toxicidad ni robustez. La mezcla incluye WildChat y OpenAssistant, con contenido no filtrado necesariamente, por lo que pueden aflorar sesgos de esos corpus.
- Idioma: solo inglés declarado. No hay evidencia de comportamiento fiable en castellano ni en otras lenguas; no debe asumirse transferencia multilingüe a pesar de la exposición parcial a corpus multilingües.
- Ventana de 32.768 tokens: aunque se entrenó a esa longitud, no se publican evaluaciones de recuperación en el medio del contexto (*needle in a haystack*) ni de degradación con contexto largo.
- Restricciones técnicas: requiere GPU CUDA con Triton y la librería `tiny_gdn`; no hay pesos GGUF, ni soporte de vLLM/TGI/Ollama, ni ruta de inferencia en CPU. Esto limita el despliegue a entornos con GPU NVIDIA.
- Reproducibilidad: solo se publica el checkpoint final del ajuste de preferencias (paso 704). Los checkpoints de preentrenamiento y SFT no están publicados, por lo que no se puede auditar la cadena completa.
- Licencia: los pesos son Apache 2.0, lo que permite uso comercial, pero los datasets de entrenamiento (Nemotron, Hermes-3, WildChat, Glaive, entre otros) tienen sus propias licencias y condiciones que conviene revisar antes de un despliegue comercial.
- Métricas ausentes: sin benchmarks no es posible justificar afirmaciones de calidad frente a alternativas del mismo tamaño en un proceso de selección formal.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/kerzgrr/Senryu
- Demo (Space): https://huggingface.co/spaces/kerzgrr/senryu-demo
- Modelo predecesor Haiku: https://huggingface.co/kerzgrr/Haiku
- Reward model usado en APO: https://huggingface.co/Skywork/Skywork-Reward-V2-Llama-3.1-8B
- Dataset de preentrenamiento: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Dataset de chat: https://huggingface.co/datasets/HuggingFaceTB/smoltalk
- Dataset de chat (v2): https://huggingface.co/datasets/HuggingFaceTB/smoltalk2
- Nemotron Post-Training Dataset v1: https://huggingface.co/datasets/nvidia/Nemotron-Post-Training-Dataset-v1
- Nemotron Agentic v1: https://huggingface.co/datasets/nvidia/Nemotron-Agentic-v1
- Nemotron SFT Agentic v2: https://huggingface.co/datasets/nvidia/Nemotron-SFT-Agentic-v2
- Nemotron SFT Instruction-Following-Chat v2: https://huggingface.co/datasets/nvidia/Nemotron-SFT-Instruction-Following-Chat-v2
- Nemotron Instruction-Following-Chat v1: https://huggingface.co/datasets/nvidia/Nemotron-Instruction-Following-Chat-v1
- OpenMathReasoning: https://huggingface.co/datasets/nvidia/OpenMathReasoning
- OpenCodeReasoning: https://huggingface.co/datasets/nvidia/OpenCodeReasoning
- When2Call: https://huggingface.co/datasets/nvidia/When2Call
- Toucan-1.5M: https://huggingface.co/datasets/Agent-Ark/Toucan-1.5M
- hermes_reasoning_tool_use: https://huggingface.co/datasets/interstellarninja/hermes_reasoning_tool_use
- tool-use-multiturn-reasoning: https://huggingface.co/datasets/interstellarninja/tool-use-multiturn-reasoning
- Hermes-3-Dataset: https://huggingface.co/datasets/NousResearch/Hermes-3-Dataset
- Glaive Function Calling v2: https://huggingface.co/datasets/glaiveai/glaive-function-calling-v2
- WildChat-4.8M: https://huggingface.co/datasets/allenai/WildChat-4.8M
- SystemChat-2.0: https://huggingface.co/datasets/QuixiAI/SystemChat-2.0
- SlimOrca: https://huggingface.co/datasets/Open-Orca/SlimOrca
- UltraChat 200k: https://huggingface.co/datasets/HuggingFaceH4/ultrachat_200k
- Magicoder-Evol-Instruct-110K: https://huggingface.co/datasets/ise-uiuc/Magicoder-Evol-Instruct-110K
- self-oss-instruct-sc2-exec-filter-50k: https://huggingface.co/datasets/bigcode/self-oss-instruct-sc2-exec-filter-50k
- OASST2: https://huggingface.co/datasets/OpenAssistant/oasst2
- tulu-3-sft-personas-instruction-following: https://huggingface.co/datasets/allenai/tulu-3-sft-personas-instruction-following
- no_robots: https://huggingface.co/datasets/HuggingFaceH4/no_robots
- Paper o blog técnico del modelo: no disponible
- Repositorio de código independiente: no disponible (solo el `inference.py` y la carpeta `tiny_gdn/` incluidas en el repo del modelo)
- Resultados de benchmarks: no disponible
- Nota: la búsqueda web realizada no devolvió resultados relevantes sobre este modelo; los enlaces anteriores proceden de la model card y de los metadatos de HuggingFace.
