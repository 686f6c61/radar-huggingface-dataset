# hoangphu7122002ai/qwen3.5-9b-codeact-sft-ep3

## Resumen

`hoangphu7122002ai/qwen3.5-9b-codeact-sft-ep3` es un ajuste fino (fine-tuning) supervisado del modelo base Qwen/Qwen3.5-9B-Base, publicado por el usuario hoangphu7122002ai. El nombre del repositorio sugiere un entrenamiento orientado a tareas de código y agentes (codeact) mediante SFT, en su tercera época, aunque el autor no documenta el proceso de entrenamiento en la model card, que reproduce textualmente la del modelo base Qwen3.5-9B.

El modelo hereda la arquitectura híbrida de Qwen3.5: una combinación de Gated DeltaNet (atención lineal) y Gated Attention clásica, con un encoder de visión para entrada image-text-to-text. Cuenta con 9.653.104.368 parámetros reales según los pesos safetensors y un contexto nativo de 262.144 tokens, extensible hasta 1.010.000.

Su relevancia es doble: por un lado, demuestra el interés de la comunidad por especializar modelos multimodales de tamaño medio en flujos agénticos y de código; por otro, al ser un ajuste sobre una base con licencia Apache 2.0, mantiene esa misma licencia permisiva. No obstante, el repositorio no incluye métricas propias, datos del dataset de ajuste ni evaluación, por lo que debe tratarse como un experimento de la comunidad sin validación publicada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Causal Language Model con Vision Encoder; híbrida Gated DeltaNet + Gated Attention (layout 8 × (3 × (Gated DeltaNet → FFN) → 1 × (Gated Attention → FFN))) |
| Parametros totales | 9.653.104.368 |
| Parametros activos | no disponible (la model card del ajuste no confirma configuración MoE para esta variante) |
| Longitud de contexto | 262.144 tokens nativos; extensible hasta 1.010.000 |
| Tipos de cuantizacion | no disponible (no se documentan en el repositorio; los pesos se publican en safetensors) |
| Idiomas soportados | no disponible en el repositorio del ajuste (el modelo base declara 201 idiomas y dialectos) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo base Qwen3.5-9B emplea una arquitectura híbrida de 32 capas con dimensión oculta 4096 y embedding de 248.320 tokens (padded). Alterna bloques de Gated DeltaNet (atención lineal con 32 cabezas para V y 16 para QK, dimensión de cabeza 128) y bloques de Gated Attention clásica (16 cabezas para Q y 4 para KV, dimensión de cabeza 256, RoPE de 64 dimensiones). La FFN tiene dimensión intermedia 12.288 y el modelo se entrenó con multi-token prediction (MTP) en varios pasos. Incluye un encoder de visión para entrada multimodal image-text-to-text.

El proceso de entrenamiento del modelo base combina pre-entrenamiento y post-entrenamiento con fusión temprana de tokens multimodales y RL a gran escala sobre entornos multiagente. Sobre esta base, el autor de este repositorio aplicó un SFT (supervised fine-tuning) en su tercera época, presumiblemente sobre datos de tipo codeact, pero no se documenta el número de tokens, la composición del dataset, ni si hubo DPO o RLHF adicional. Tampoco se especifica qué innovaciones técnicas introduce el ajuste respecto al base.

## Capacidades

- Generación de texto y razonamiento multimodal (image-text-to-text) heredado del modelo base Qwen3.5.
- Procesamiento de código y matemáticas, presumiblemente reforzado por el ajuste SFT orientado a codeact.
- Soporte de tool calling y function calling (heredado del base; no verificado en el ajuste).
- Capacidades agénticas y razonamiento multi-paso (el base se entrenó con RL en entornos multiagente).
- Capacidades multilingües amplias según el modelo base (201 idiomas y dialectos); no confirmadas específicamente para este ajuste.
- Entrada de imágenes junto a texto gracias al encoder de visión.
- No se documentan capacidades de audio ni modo "thinking" explícito en el repositorio del ajuste.

## Casos de uso

- Asistentes de código en IDE: el ajuste sobre datos codeact sugiere uso en autocompletado y generación de parches; conviene validar con el propio código del equipo antes de integrarlo.
- Agentes de automatización de tareas de desarrollo: el modelo puede encadenar llamadas a herramientas (tool calling) para resolver issues, ejecutar comandos y verificar resultados en pipelines de CI/CD.
- Análisis de capturas de pantalla y diagramas técnicos: al aceptar entradas image-text-to-text, puede interpretar mockups, diagramas de arquitectura o errores visuales junto a una descripción textual.
- Documentación técnica automatizada: generación de READMEs, docstrings y guías a partir de fragmentos de código y capturas, aprovechando el contexto largo de 262.144 tokens.
- Revisión de código en repositorios grandes: la ventana de contexto permite analizar múltiples ficheros en una sola pasada, útil para auditorías de seguridad o refactorizaciones.
- Chat de soporte técnico especializado: conversaciones multi-turno con contexto largo para diagnóstico de incidencias, siempre con validación humana por el riesgo de alucinación.
- Prototipado de agentes de investigación: experimentación con flujos multi-paso y uso de herramientas en entornos controlados, dado que es un ajuste de la comunidad sin evaluación publicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks propios del ajuste en la informacion disponible. La model card reproduce las cifras del modelo base Qwen3.5-9B, que se incluyen a continuación como referencia orientativa (no son resultados del ajuste):

| Benchmark | GPT-OSS-120B | GPT-OSS-20B | Qwen3-Next-80B-A3B-Thinking | Qwen3-30BA3B-Thinking-2507 | Qwen3.5-9B | Qwen3.5-4B |
|---|---|---|---|---|---|---|
| MMLU-Pro | 80,8 | 74,8 | 82,7 | 80,9 | 82,5 | 79,1 |
| MMLU-Redux | 91,0 | 87,8 | 92,5 | 91,4 | no disponible en el extracto | no disponible en el extracto |

El resto de filas del benchmark del base no están completas en la información proporcionada; no se inventan valores.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16/FP16: aproximadamente 19,3 GB solo para pesos, más overhead de activaciones y KV cache; se recomienda al menos 24 GB para uso cómodo con contexto moderado.
- En cuantización de 8 bits: en torno a 10-11 GB de pesos; en 4 bits: en torno a 5-6 GB, aunque no se publican cuantizaciones oficiales en el repositorio.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 4090 (24 GB) para BF16 con contexto limitado; RTX 3090/4090 viables en cuantización.
- Cabe en GPU de consumo (RTX 4090, 3090, 4080) en cuantización de 8 o 4 bits; en BF16 completo requiere GPU profesional o múltiples consumer GPU.
- Opciones de despliegue: transformers, vLLM, SGLang y KTransformers según la model card del base; llama.cpp/Ollama no están confirmados para esta arquitectura híbrida.
- Latencia y throughput: no disponibles; la arquitectura Gated DeltaNet del base está diseñada para alta throughput y baja latencia, pero no hay cifras publicadas para este ajuste.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| qwen3.5-9b-codeact-sft-ep3 (este) | 9,65 B | 262.144 (ext. 1.010.000) | Apache 2.0 | Ajuste comunitario sin benchmarks publicados |
| Qwen/Qwen3.5-9B-Base | 9 B | 262.144 (ext. 1.010.000) | Apache 2.0 | Modelo base oficial, con benchmarks publicados |
| Qwen3.5-4B | 4 B | no disponible en el extracto | Apache 2.0 (presumible) | Variante menor de la misma familia |
| GPT-OSS-20B | 20 B | no disponible | no disponible | Alternativa de referencia en los benchmarks del base |

La comparación con el base es la más relevante: este repositorio solo se diferencia por el SFT codeact, sin métricas que cuantifiquen la mejora o el posible olvido catastrófico.

## Limitaciones y advertencias

- No hay evaluación publicada del ajuste: se desconoce si mejora, iguala o degrada las capacidades del base en tareas generales.
- Riesgo de olvido catastrófico tras tres épocas de SFT sobre un dataset no documentado.
- Riesgo de alucinación inherente a los modelos generativos, agravado por la falta de validación.
- Sesgos desconocidos: el dataset de ajuste no se describe, por lo que no se pueden evaluar sesgos introducidos.
- Idiomas del ajuste no confirmados; el soporte multilingüe del base podría no preservarse.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías ni soporte; conviene auditar el modelo antes de producción.
- El repositorio tiene 0 descargas y 0 likes, lo que indica ausencia de validación por la comunidad.
- La model card reproduce la del base sin documentar el proceso de ajuste, lo que dificulta la reproducibilidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/hoangphu7122002ai/qwen3.5-9b-codeact-sft-ep3
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B-Base
- Blog de Qwen3.5: https://qwen.ai/blog?id=qwen3.5
- Qwen Chat: https://chat.qwen.ai
- Licencia del base: https://huggingface.co/Qwen/Qwen3.5-9B/blob/main/LICENSE
