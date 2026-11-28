# MatterWaveAI/grt-30m-tokenizer

## Resumen

GRT-30M-Tokenizer es el tokenizer canónico y el banco de embeddings polares compartido de la GRT-30M Research Suite, desarrollada por MatterWave AI. No es un modelo generativo por sí mismo, sino un componente reutilizable: un vocabulario BPE de 151.669 tokens compatible con Qwen 3 e instrucciones ChatML, junto con una tabla de embeddings en coordenadas polares de 19.565.302 parámetros en FP32 que constituye el 66,8 % del total de parámetros del modelo base `grt-30m`.

El interés técnico reside en que los embeddings no se almacenan como una matriz euclídea convencional, sino como pares de magnitud y ángulo de fase sobre 128 planos ortogonales de 2D (hidden_size = 256). Esta representación es la base de la arquitectura Geometric Rotation Transformer (GRT), que sustituye matrices densas por rotaciones de Givens. El repositorio se publica para que otros proyectos puedan reutilizar exactamente el mismo vocabulario y la misma geometría de embeddings que el resto de la suite.

Con 179 descargas y licencia Apache 2.0, el artefacto está pensado para investigadores que quieran reproducir o extender la familia GRT, incluida la operación de "harmonic upcycling" para escalar el ancho del modelo de 256 a 512 o 1024 preservando las similitudes coseno entre tokens en la inicialización.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Tokenizer BPE (PreTrainedTokenizerFast) + banco de embeddings polares (pares magnitud/fase) |
| Parámetros totales | 19.565.302 (banco de embeddings); vocabulario de 151.669 tokens |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos publicados en FP32) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`polar_embedding.safetensors`) + `tokenizer.json` |

## Arquitectura y entrenamiento

El componente consta de dos piezas. La primera es un tokenizer BPE en formato Rust `PreTrainedTokenizerFast` con 151.669 tokens, compatible con Qwen 3 e instrucciones especiales ChatML (`<|im_start|>` / `<|im_end|>`), con plantilla de chat incluida en `tokenizer_config.json`. La segunda es una tabla de embeddings que representa cada token en coordenadas polares sobre 128 planos 2D ortogonales: la componente par se calcula como `exp(log_magnitude) · cos(phase_angles)` y la impar como `exp(log_magnitude) · sin(phase_angles)`. Los tensores son `embedding.phase_angles` [151669, 128] con 19.413.632 parámetros, `embedding.log_magnitude` [151669] con 151.669 parámetros, y un escalar `lm_head.output_scale` que actúa como temperatura softplus de la cabeza coseno ligada.

La innovación destacable es que la cabeza de lenguaje (`GRTCosineHead`) comparte la misma tabla de embeddings que la entrada, y que la geometría permite el "harmonic upcycling": al escalar `d_model` a 256·k, se replica `phase_angles` k veces en la última dimensión para conservar todas las similitudes coseno por pares entre tokens en la inicialización. No se proporcionan datos sobre el corpus de entrenamiento, el número de tokens vistos ni si hubo RLHF o DPO en esta model card.

## Capacidades

- Tokenización BPE con vocabulario de 151.669 tokens compatible con la familia Qwen 3.
- Plantilla de chat ChatML lista para conversaciones multi-turno.
- Representación de embeddings en coordenadas polares (magnitud y fase) reutilizable por los seis modelos de la suite GRT-30M.
- Cabeza de lenguaje coseno ligada (tied cosine head) con escala de temperatura aprendida.
- Soporte de "harmonic upcycling" para inicializar backbones GRT más anchos (256 → 512 → 1024).
- No incluye capacidades generativas, de razonamiento, tool calling ni agentes por sí mismo: es un componente de infraestructura.
- Idiomas soportados: no disponible.

## Casos de uso

- Reproducción de la suite GRT-30M: cargar el tokenizer y el banco de embeddings para ejecutar cualquiera de los seis modelos derivados (`grt-30m`, `-chat`, `-mor`, `-embedding`, `-reranker`, `-vl`) con exactamente el mismo vocabulario y geometría.
- Inicialización de nuevos backbones GRT más anchos: aplicar `phase_angles.repeat(1, k)` para escalar `d_model` de 256 a 512 o 1024 conservando las similitudes coseno iniciales entre tokens.
- Investigación en arquitecturas rotacionales: comparar el comportamiento de embeddings polares frente a embeddings euclídeos en tareas de lenguaje con un vocabulario controlado.
- Pipelines de tokenización compatibles con Qwen 3: reutilizar el vocabulario y la plantilla ChatML en servicios que ya esperan ese formato, sin depender del tokenizer original.
- Análisis de geometría de representaciones: inspeccionar ángulos de fase y magnitudes por token para estudiar estructura semántica en el toro (S¹)^128.
- Integración en vLLM o transformers: el tokenizer se carga con `AutoTokenizer.from_pretrained` y el banco de embeddings con `safetensors.torch.load_file`, lo que facilita su uso en servidores de inferencia existentes.
- Fine-tuning de modelos derivados: servir como punto de partida congelado para tareas de clasificación, reranking o embeddings de frase dentro del ecosistema GRT.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: el banco de embeddings ocupa 78,3 MB en FP32 (19.565.302 parámetros). El tokenizer añade 11,4 MB en disco. El repositorio completo es de 0,1 GB.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM puede alojar el banco de embeddings; no se requiere A100 ni H100 para este componente aislado.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna (RTX 3060, RTX 4090, etc.), e incluso en CPU para inferencia del tokenizer.
- Opciones de despliegue: `transformers` (carga del tokenizer), `safetensors` (carga del banco), y `vLLM` para el tokenizer según la propia model card.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| MatterWaveAI/grt-30m-tokenizer | 19.565.302 (embeddings) + vocab 151.669 | no disponible | Apache 2.0 | Hugging Face |
| Tokenizer Qwen 3 (referencia de compatibilidad) | vocab 151.669 (compatible) | no aplica | no disponible en esta ficha | no disponible en esta ficha |
| Tokenizer estándar de un LLM de ~30M | no disponible | no disponible | no disponible | no disponible |

La comparativa directa con otros tokenizers es limitada porque este artefacto incluye además un banco de embeddings polares propietario de la arquitectura GRT, sin equivalente público conocido en la información disponible.

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto, razonamiento, código ni respuestas por sí mismo; requiere un backbone GRT compatible.
- La model card no documenta el corpus de entrenamiento, la composición del dataset ni el proceso de alineación, lo que limita la evaluación de sesgos.
- Idiomas soportados no especificados: no se puede garantizar cobertura multilingüe más allá de la herencia del vocabulario Qwen 3.
- Riesgo de alucinación no aplicable a este componente, pero sí a los modelos que lo consumen.
- La licencia Apache 2.0 permite uso comercial, pero la ausencia de benchmarks y de documentación sobre datos de entrenamiento dificulta una validación rigurosa en producción.
- El "harmonic upcycling" solo preserva similitudes coseno en la inicialización; el comportamiento tras el entrenamiento no está documentado.
- Compatibilidad declarada con Qwen 3 y ChatML, pero no se detallan posibles divergencias en tokens especiales o normalización Unicode.

## Enlaces

- Hugging Face: https://huggingface.co/MatterWaveAI/grt-30m-tokenizer
- Modelo base: https://huggingface.co/MatterWaveAI/grt-30m
- Chat fine-tune: https://huggingface.co/MatterWaveAI/grt-30m-chat
- Mixture-of-Rotations: https://huggingface.co/MatterWaveAI/grt-30m-mor
- Embedding: https://huggingface.co/MatterWaveAI/grt-30m-embedding
- Reranker: https://huggingface.co/MatterWaveAI/grt-30m-reranker
- Vision-Language: https://huggingface.co/MatterWaveAI/grt-30m-vl
- Text-to-Speech: https://huggingface.co/MatterWaveAI/grt-30m-tts
- Omni (visión-audio-lenguaje-habla): https://huggingface.co/MatterWaveAI/grt-30m-omni
- Whitepaper GRT: https://huggingface.co/MatterWaveAI/grt-30m/resolve/main/GRT_Whitepaper.pdf
- Sitio del autor: https://matterwave.ai
