# MatterWaveAI/grt-30m-tokenizer

## Resumen

GRT-30M-Tokenizer es un repositorio auxiliar del paquete de investigación GRT-30M desarrollado por MatterWaveAI. No contiene un modelo generativo completo, sino dos componentes canónicos compartidos por toda la familia GRT-30M: un tokenizador BPE de 151.669 tokens (compatible con Qwen 3 y con plantilla ChatML) y un banco de embeddings polares en coordenadas de fase-ángulo (19.565.302 parámetros en FP32, sin capas `nn.Linear`). El repositorio ocupa 0,1 GB y se distribuye bajo licencia Apache 2.0.

El interés técnico reside en la representación de los embeddings: en lugar de una matriz euclídea convencional, cada token se codifica como un vector de 128 ángulos de fase sobre el toro (S¹)^128 más una magnitud logarítmica radial, con `hidden_size = 256`. Esta tabla se comparte de forma idéntica entre los seis modelos de la suite (base, chat, mixture-of-rotations, embedding, reranker y vision-language), lo que la convierte en la pieza de anclaje del ecosistema y en el 66,8 % de los parámetros totales del modelo base `grt-30m`.

Es relevante ahora porque documenta una arquitectura alternativa a los transformers densos convencionales (Geometric Rotation Transformer, basada en rotaciones de Givens) y porque expone explícitamente un procedimiento de "harmonic upcycling" para escalar el ancho del modelo de 256 a 512 o 1024 preservando las similitudes coseno entre tokens en la inicialización. El repositorio no incluye pipeline declarado ni información sobre idiomas soportados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Tokenizador BPE + banco de embeddings polares (fase-ángulo) para Geometric Rotation Transformer |
| Parametros totales | 19.565.302 (banco de embeddings); tokenizador sin parámetros |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en FP32) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`polar_embedding.safetensors`, 78,3 MB) + `tokenizer.json` (11,4 MB) |

## Arquitectura y entrenamiento

El componente de embeddings define una representación polar: para cada token, el vector de dimensión 256 se construye emparejando componentes como `e[2p] = exp(log_magnitude) · cos(phase_angles[p])` y `e[2p+1] = exp(log_magnitude) · sin(phase_angles[p])`, con `p` recorriendo 128 planos 2D ortogonales. La tabla `embedding.phase_angles` tiene forma `[151669, 128]` (19.413.632 parámetros) y está atada entre la entrada y la cabeza de salida `GRTCosineHead`; `embedding.log_magnitude` aporta 151.669 parámetros radiales y `lm_head.output_scale` es un escalar de temperatura softplus. El vocabulario es compatible con Qwen 3 e incluye tokens especiales ChatML.

El tokenizador es un `PreTrainedTokenizerFast` con vocabulario BPE de 151.669 tokens y plantilla de chat basada en `<|im_start|>` / `<|im_end|>`. La model card menciona que el backbone GRT sustituye matrices densas por rotaciones de Givens, aunque no se detallan en este repositorio los datos de entrenamiento (número de tokens, composición del dataset, RLHF/DPO) ni innovaciones como decodificación especulativa. El procedimiento documentado de upcycling armónico consiste en repetir (`repeat(1, k)`) los ángulos de fase a lo largo de la última dimensión al escalar `d_model = 256 · k`, preservando las similitudes coseno por pares en la inicialización.

## Capacidades

- Tokenización BPE de 151.669 tokens compatible con Qwen 3, con tokens especiales ChatML para conversación multi-turno.
- Plantilla de chat incluida en `tokenizer_config.json` (`<|im_start|>` / `<|im_end|>`).
- Banco de embeddings polares reutilizable como inicialización compartida para los seis modelos de la suite GRT-30M.
- Soporte de escalado armónico del ancho del modelo (256 → 512 → 1024) mediante replicación de ángulos de fase.
- Cabeza de lenguaje atada basada en coseno polar con escala de temperatura softplus.
- No incluye generación de texto, razonamiento, código, matemáticas, visión, tool calling ni capacidades de agente por sí mismo: esas funciones residen en los modelos de la suite que consumen este repositorio.

## Casos de uso

- Inicialización de un backbone GRT desde cero: cargar `polar_embedding.safetensors` como tabla de embeddings compartida al entrenar un nuevo modelo GRT-30M, evitando reentrenar los 19,5 millones de parámetros de embedding.
- Escalado de ancho del modelo: al construir una variante con `d_model = 512` o `1024`, aplicar `phase_angles.repeat(1, k)` para preservar las similitudes coseno iniciales y estabilizar el arranque del entrenamiento.
- Pipeline de tokenización en producción: usar `tokenizer.json` con `transformers` o vLLM para preprocesar texto con el mismo vocabulario que los seis modelos de la suite, garantizando consistencia entre entrenamiento e inferencia.
- Investigación en representaciones geométricas: analizar la estructura de fase-ángulo sobre el toro (S¹)^128 para estudiar cómo se organizan las relaciones semánticas entre tokens en un espacio polar frente a uno euclídeo.
- Reutilización en modelos de recuperación: alimentar los bi-encoders y cross-encoders (`grt-30m-embedding`, `grt-30m-reranker`) con la misma tabla de embeddings para mantener coherencia entre las etapas de indexación y reordenación.
- Reproducibilidad de la suite: verificar que los seis modelos `grt-30m*` comparten exactamente los mismos tensores de embedding, lo que simplifica auditorías y comparaciones controladas entre variantes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM para el banco de embeddings: aproximadamente 78,3 MB en FP32 (19,5 M de parámetros); negligible en cualquier GPU.
- VRAM para el tokenizador: despreciable (archivo de 11,4 MB, ejecución en CPU).
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060 o superior) es sobrada para cargar estos artefactos; no se requiere A100 ni H100 para este repositorio.
- Cabe en GPU consumer: sí, en cualquier GPU con al menos 1 GB de VRAM libre, e incluso en CPU.
- Opciones de despliegue: `transformers` (`AutoTokenizer`), `safetensors` + `huggingface_hub` para los tensores; el tag `endpoints_compatible` sugiere compatibilidad con Hugging Face Inference Endpoints. Compatibilidad declarada con vLLM para el tokenizador.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| MatterWaveAI/grt-30m-tokenizer | 19,5 M (embeddings) + tokenizador | no disponible | Apache 2.0 | Hugging Face |
| Qwen 3 tokenizer (referencia de compatibilidad) | no disponible | no disponible | Apache 2.0 (según variante) | Hugging Face |
| Tokenizadores BPE estándar de Llama/Mistral | no disponible | no disponible | licencias variables | Hugging Face |

No se dispone de datos de rendimiento comparables ni de alternativas directas con representación polar de embeddings en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo generativo: no puede usarse para inferencia de texto, razonamiento ni ninguna tarea de lenguaje por sí solo; requiere un backbone GRT que consuma la tabla de embeddings.
- Los tensores se publican en FP32; no se documentan versiones cuantizadas ni compatibilidad con GGUF, lo que limita su uso en pipelines de cuantización estándar.
- No se especifican los idiomas soportados ni la composición del corpus de entrenamiento del tokenizador, por lo que el sesgo lingüístico es desconocido.
- La licencia Apache 2.0 permite uso comercial, pero el ecosistema GRT-30M es de investigación y no hay evidencia publicada de robustez en producción.
- El procedimiento de upcycling armónico preserva similitudes coseno solo en la inicialización; no garantiza que el entrenamiento posterior mantenga esas relaciones.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validación comunitaria ni benchmarks publicados.
- Riesgo de alucinación y sesgos: no aplicable directamente a este repositorio, pero heredable de los modelos de la suite que lo consumen.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/MatterWaveAI/grt-30m-tokenizer
- Modelo base: https://huggingface.co/MatterWaveAI/grt-30m
- Variante chat: https://huggingface.co/MatterWaveAI/grt-30m-chat
- Variante mixture-of-rotations: https://huggingface.co/MatterWaveAI/grt-30m-mor
- Variante embedding: https://huggingface.co/MatterWaveAI/grt-30m-embedding
- Variante reranker: https://huggingface.co/MatterWaveAI/grt-30m-reranker
- Variante vision-language: https://huggingface.co/MatterWaveAI/grt-30m-vl
