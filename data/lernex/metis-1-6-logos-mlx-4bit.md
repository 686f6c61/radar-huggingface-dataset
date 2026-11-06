# Lernex/Metis-1.6-Logos-MLX-4bit

## Resumen

Metis-1.6-Logos-MLX-4bit es una cuantización en 4 bits para Apple Silicon (formato MLX) del modelo Metis-1.6-Logos, desarrollado por Lernex. Se trata de un modelo de generación de texto de 10.224 millones de parámetros totales que combina una arquitectura de mezcla de expertos (MoE) latente con 192 expertos y top-4 de enrutamiento junto con capas de estado (Mamba-2). El resultado es un modelo de razonamiento con una ventana de contexto de 128.000 tokens que cabe en un Mac con 16 GB de memoria unificada.

La relevancia de esta versión concreta reside en su receta de cuantización selectiva: en lugar de aplicar 4 bits de forma uniforme, solo los expertos enrutados (la mayor parte de los pesos) se cuantizan a 4 bits en grupos de 64, mientras que las proyecciones de Mamba-2, el embedding, el experto compartido, la atención y los enrutadores se mantienen a 8 bits o sin cuantizar. Según el autor, esto permite que el modelo de 4 bits responda de forma correcta en modo pensamiento y en modo directo, con una divergencia KL media frente a los logits FP32 de referencia de 0,0197 en chat con pensamiento y 0,0674 en chat con herramientas.

El modelo base incluye un modo de razonamiento explícito delimitado por etiquetas `<think>`, soporte de plantilla de chat con `enable_thinking` y capacidad de tool calling, aunque en esta versión MLX las llamadas a herramientas llegan como texto hasta que mlx-lm incorpore el parser específico del modelo. La licencia es Apache 2.0, la misma que el modelo original.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) latente con 192 expertos y top-4, combinada con capas de estado Mamba-2 |
| Parámetros totales | 10.224.235.713 (10,2B) |
| Parámetros activos | no disponible |
| Longitud de contexto | 128.000 tokens |
| Tipos de cuantización | MLX 4 bits (5,14 bits por peso de media); expertos enrutados a 4 bits en grupos de 64; embedding, proyecciones de entrada de Mamba-2, proyecciones de entrada/salida del espacio latente de expertos, experto compartido y atención a 8 bits; proyecciones de salida de Mamba-2, enrutadores, adaptadores de atención por pasada, memoria de profundidad y cabeza de profundidad sin cuantizar; sesgo de balance de enrutadores y parámetros SSM (`A`, `D`, `dt_bias`) en FP32 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX), 6,6 GB en el repositorio |

## Arquitectura y entrenamiento

La arquitectura combina una mezcla de expertos latente con 192 expertos y enrutamiento top-4 con capas de estado Mamba-2, además de componentes específicos como adaptadores de atención por pasada, memoria de profundidad y una cabeza de profundidad. El repositorio incluye la implementación completa del modelo en un único archivo, `metis16.py`, que mlx-lm ejecuta en lugar de una implementación integrada mediante `--trust-remote-code`. La receta de cuantización se define en `Model.quant_predicate` dentro de ese mismo archivo.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO en la información proporcionada. El modelo base se distribuye en BF16 para Transformers, y existen versiones adicionales en MLX 8 bits, GGUF (para llama.cpp, Ollama y LM Studio) y FP8 (para vLLM y SGLang) que mantienen la misma receta de cuantización selectiva en las partes sensibles.

## Capacidades

- Generación de texto conversacional con plantilla de chat y soporte de roles.
- Razonamiento explícito en modo pensamiento: el modelo razona dentro de etiquetas `<think>` antes de responder; `enable_thinking=False` solicita una respuesta directa.
- Tool calling: el modelo soporta chat con herramientas; en esta versión MLX las llamadas llegan como texto en la respuesta hasta que mlx-lm incluya el parser de tool-calls del modelo, momento a partir del cual se entregarán como `tool_calls` tipadas.
- Servidor compatible con la API de OpenAI mediante `mlx_lm.server`, con `chat_template_kwargs` para controlar `enable_thinking` por petición.
- Razonamiento multi-paso dentro de la ventana de 128.000 tokens.
- Capacidades multilingües: no disponible en la información proporcionada.
- No se documentan capacidades de visión ni de audio.

## Casos de uso

- Asistente de razonamiento local en Mac: con 6,6 GB de pesos y 16 GB de memoria unificada, el modelo permite desplegar un asistente con modo pensamiento en un portátil Apple Silicon sin conexión a servicios externos, útil para prototipado y uso personal.
- Automatización de atención al cliente con contexto largo: la ventana de 128.000 tokens permite procesar historiales de conversación extensos, documentación de producto y tickets previos en una sola pasada.
- Análisis de documentos técnicos extensos: el modelo puede resumir o extraer conclusiones de contratos, informes o código fuente que superen decenas de miles de tokens, manteniendo el razonamiento dentro de `<think>` para auditar el proceso.
- Integración en pipelines de agentes con herramientas: mediante `mlx_lm.server` y la API compatible con OpenAI, se puede conectar a frameworks de agentes que envíen definiciones de herramientas; conviene validar el formato de tool-calls hasta que mlx-lm incorpore el parser nativo.
- Generación y revisión de código en local: el modo directo a temperatura 0,3 y el modo pensamiento a temperatura 1,0 con top-p 0,95 y top-k 20 permiten alternar entre respuestas rápidas y razonamiento profundo según la tarea.
- Evaluación de cuantizaciones en investigación: la receta selectiva documentada (4 bits en expertos, 8 bits en proyecciones sensibles, FP32 en parámetros SSM) sirve como referencia para estudiar el impacto de la cuantización en arquitecturas híbridas MoE-Mamba.
- Despliegue de bajo consumo en entornos Apple: para equipos con memoria unificada limitada, esta variante de 4 bits permite ejecutar un modelo de 10,2B que en BF16 requeriría bastante más memoria.

## Benchmarks y rendimiento

El autor publica métricas de calidad de cuantización: divergencia KL media sobre los 20 tokens más probables frente a los logits FP32 del runtime de entrenamiento nativo, medidas en tres prompts de referencia.

| Pesos | Chat con pensamiento (16 tokens) | Chat con herramientas (176 tokens) | Prosa (300 tokens) |
|---|---|---|---|
| MLX 4-bit (este repositorio) | 0,0197 | 0,0674 | 0,0175 |
| MLX 8-bit | 0,0043 | 0,0123 | 0,0044 |
| BF16 original (referencia) | 0,0025 | 0,0130 | 0,0037 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- Memoria: el autor indica que el modelo funciona en un Mac con 16 GB o más de memoria unificada; el repositorio ocupa 6,6 GB.
- GPU: Apple Silicon (MLX). No se documenta soporte para GPU NVIDIA o AMD en esta variante; para esos entornos existen las versiones GGUF y FP8 del modelo base.
- ¿Cabe en GPU de consumo? No aplica a esta variante MLX; para GPUs de consumo habría que usar la versión GGUF con llama.cpp u Ollama.
- Despliegue: `mlx-lm` (versión 0.32.2 o superior para el manejo correcto de los marcadores de pensamiento), con `mlx_lm.chat`, `mlx_lm.generate` o `mlx_lm.server` (endpoint compatible con OpenAI). Requiere `--trust-remote-code` por incluir la implementación `metis16.py`.
- Parámetros de muestreo recomendados: temperatura 1,0, top-p 0,95 y top-k 20 para modo pensamiento; temperatura 0,3 para respuestas directas. `mlx_lm.chat` solo acepta `--temp` y `--top-p`.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Metis-1.6-Logos-MLX-4bit | 10,2B (MoE 192 expertos, top-4 + Mamba-2) | 128k | safetensors MLX 4-bit | Apache 2.0 | Hugging Face (Lernex) |
| Metis-1.6-Logos-MLX-8bit | 10,2B | 128k | safetensors MLX 8-bit | Apache 2.0 | Hugging Face (Lernex) |
| Metis-1.6-Logos (BF16) | 10,2B | 128k | safetensors Transformers | Apache 2.0 | Hugging Face (Lernex) |
| Metis-1.6-Logos-GGUF | 10,2B | 128k | GGUF | Apache 2.0 | Hugging Face (Lernex) |

No se dispone de información sobre modelos de terceros comparables en la documentación proporcionada.

## Limitaciones y advertencias

- El modelo requiere `--trust-remote-code` porque incluye la implementación completa en `metis16.py`; el autor recomienda leer ese archivo antes de confiar en él, ya que ejecuta código arbitrario del repositorio.
- mlx-lm 0.32.2 y anteriores no reconocen los marcadores de pensamiento del modelo: arrancan en modo directo salvo que se pase `enable_thinking` explícitamente, y dejan el razonamiento dentro de la respuesta.
- El tool calling llega como texto hasta que mlx-lm incorpore el parser específico; en producción conviene validar el formato antes de depender de `tool_calls` tipadas.
- La CLI de mlx-lm no dispone de penalización por repetición; los parámetros de muestreo recomendados (temperatura 1,0 en modo pensamiento) pueden producir repeticiones si se desvían.
- El autor advierte que una conversión uniforme a 4 bits de esta arquitectura pierde calidad mucho más de lo habitual; usar recetas de cuantización genéricas sobre este modelo puede degradar el rendimiento.
- No se documentan sesgos conocidos, idiomas soportados ni riesgos específicos de alucinación en la información disponible.
- Licencia Apache 2.0: permite uso comercial, pero al ser una cuantización de un modelo base conviene verificar las condiciones del modelo original y de los datos de entrenamiento, no documentadas aquí.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que sugiere poca validación comunitaria de esta variante concreta.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Lernex/Metis-1.6-Logos-MLX-4bit
- Modelo base BF16 (Transformers): https://huggingface.co/Lernex/Metis-1.6-Logos
- Variante MLX 8 bits: https://huggingface.co/Lernex/Metis-1.6-Logos-MLX-8bit
- Variante GGUF (llama.cpp, Ollama, LM Studio): https://huggingface.co/Lernex/Metis-1.6-Logos-GGUF
- Variante FP8 (vLLM, SGLang): https://huggingface.co/Lernex/Metis-1.6-Logos-FP8
