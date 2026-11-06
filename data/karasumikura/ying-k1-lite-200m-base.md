# Karasumikura/Ying-K1-Lite-200M-base

## Resumen

Ying-K1-Lite-200M-base es un modelo de lenguaje de tipo transformer denso, entrenado desde cero en chino, con 210,2 millones de parámetros. Lo desarrolla el usuario independiente Karasumikura y se publica bajo licencia Apache 2.0. Se trata del checkpoint final de preentrenamiento (paso 90.000, 14,92B tokens), es decir, el punto de partida antes de cualquier ajuste por instrucciones (SFT); no es un modelo conversacional ni sigue instrucciones, solo continúa texto.

El modelo es relevante como caso de estudio de preentrenamiento reproducible de bajo coste: se entrenó en una única GPU A100 de 80 GB sobre el corpus chino Ultra-FineWeb-zh (unos 12 GB en parquet). Incorpora decisiones arquitectónicas propias de modelos mucho mayores, como atención con 12 cabezas de consulta y 4 de clave/valor (GQA), patrón de atención local/global 3:1, Partial RoPE al 25 % de las dimensiones y normalización Zero-Centered RMSNorm con QK-Norm.

Por su tamaño y naturaleza (base, sin alineación), su utilidad práctica es limitada: sirve como base para experimentos de ajuste fino, para estudiar dinámicas de entrenamiento a pequeña escala o para tareas de continuación de texto en chino. No debe emplearse como asistente ni en producción orientada a usuario final sin un SFT previo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (decoder-only) con GQA y atención local/global alternada 3:1 |
| Parametros totales | 210.210.560 (210,2M) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | Entrenamiento con 8.192 tokens; ventana deslizante de 1.024 |
| Tipos de cuantizacion | No disponible (repo solo en safetensors bf16; no se documentan GGUF ni otras) |
| Idiomas soportados | Chino (zh); inglés muy limitado |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only denso de 16 capas con dimensión oculta 768, FFN de 4.096 con activación SwiGLU y vocabulario de 16.006 tokens (tokenizer Qwen3.8 recortado). La atención usa 12 cabezas de consulta y 4 de clave/valor (GQA) con head_dim 64, y alterna atención local y global en proporción 3:1. Emplea Partial RoPE aplicado al 25 % de las dimensiones, Zero-Centered RMSNorm, QK-Norm y output gating. La longitud de secuencia de entrenamiento es de 8.192 tokens con ventana deslizante de 1.024.

El preentrenamiento se realizó en bf16 durante 90.000 pasos sobre 14,92B tokens del corpus Ultra-FineWeb-zh, con un planificador WSD (warmup de 500 pasos, decay del 20 %, decaimiento sqrt hasta 0) y un optimizador híbrido: Muon para parámetros 2D y AdamW para el resto. Todo el entrenamiento cupo en una sola A100 de 80 GB. El bpc final reportado es de aproximadamente 2,47. No se documenta ningún proceso de RLHF, DPO ni SFT en este checkpoint.

## Capacidades

- Generación de texto por continuación (modelado de lenguaje causal) en chino.
- Razonamiento y conocimiento factual muy limitados por el tamaño (210M) y la ausencia de alineación.
- Sin soporte de tool calling ni function calling.
- Sin capacidades de agente ni razonamiento multi-paso.
- Sin modo "thinking", visión ni audio.
- Multilingüismo prácticamente inexistente: solo chino; el inglés es débil.
- Sin plantilla de chat (chat template) ni capacidad de seguir instrucciones.

## Casos de uso

- Punto de partida para SFT: el checkpoint está pensado explícitamente como pesos iniciales para ajuste por instrucciones; un equipo puede aplicar su propio dataset de SFT y obtener un modelo conversacional pequeño en chino.
- Estudio de dinámicas de preentrenamiento: permite reproducir y analizar curvas de pérdida, bpc y comportamiento de optimizadores híbridos (Muon + AdamW) a escala reducida y con un único acelerador.
- Generación de texto libre en chino: continuación de párrafos, titulares o descripciones con decodificación por muestreo (temperatura 0,7, top_p 0,85, repetition_penalty 1,3), útil para pruebas de estilo o generación de borradores.
- Experimentos de tokenización: su vocabulario recortado de 16.006 entradas permite estudiar el impacto del truncado de vocabulario en la fragmentación de caracteres raros y en el coste de embedding.
- Base para modelos de dominio específico: ajuste fino supervisado sobre corpus sectoriales en chino (por ejemplo, textos legales o técnicos) cuando el presupuesto de cómputo es mínimo.
- Evaluación comparativa de arquitecturas pequeñas: sirve como referencia para contrastar GQA, atención local/global y Partial RoPE frente a configuraciones transformer convencionales del mismo tamaño.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El único dato de rendimiento reportado es el bits per character (bpc) final de preentrenamiento, aproximadamente 2,47, sin comparativa con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: en torno a 0,5 GB para pesos (210M parámetros × 2 bytes), más overhead de activaciones y caché KV; cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM (GTX 1660, RTX 3060, RTX 4090); también funciona en CPU para pruebas puntuales.
- Cabe en GPU consumer: sí, en todas las GPU modernas de NVIDIA, AMD o Apple Silicon.
- Opciones de despliegue: transformers con `trust_remote_code=True` es la vía documentada; no se han publicado pesos GGUF, por lo que llama.cpp u Ollama requerirían conversión previa. No hay confirmación de soporte en vLLM ni TGI.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| Ying-K1-Lite-200M-base | 210,2M | 8.192 (entrenamiento) | zh | Apache 2.0 | Base sin SFT, entrenado desde cero en 14,92B tokens |
| Qwen2.5-0.5B | ~494M | 32.768 | multilingüe | Apache 2.0 | Base y versiones instruct; mucho mayor y con contexto más amplio |
| SmolLM2-135M | ~135M | 8.192 | inglés principalmente | Apache 2.0 | Base e instruct; orientado a inglés, no a chino |
| TinyLlama-1.1B | ~1,1B | 2.048 | inglés/chino | Apache 2.0 | Entrenado con 3T tokens; mayor capacidad pero contexto menor |

La comparación directa es difícil: Ying-K1-Lite-200M-base es un modelo base en chino sin alineación, mientras que las alternativas citadas cuentan con versiones instruct y más documentación pública. No se dispone de benchmarks comparativos para establecer diferencias de rendimiento.

## Limitaciones y advertencias

- No es un modelo conversacional: no sigue instrucciones ni responde preguntas; solo continúa el texto de entrada.
- Elevada tasa de alucinación factual: nombres, fechas y cifras suelen ser inventados, según advierte el propio autor.
- En decodificación voraz entra en bucles de repetición; es obligatorio usar muestreo con penalizaciones.
- Deriva temática en textos largos: la coherencia se degrada con la longitud generada.
- Vocabulario reducido (16.006 tokens): los caracteres poco frecuentes pueden fragmentarse en bytes.
- Solo entrenado en chino; el rendimiento en inglés y otros idiomas es muy bajo.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base no es apto para producción sin SFT y evaluación adicionales.
- El corpus Ultra-FineWeb-zh se rige por la licencia del dataset original; conviene revisarla antes de un uso comercial.
- No hay información sobre sesgos específicos más allá de los inherentes al corpus web chino utilizado.

## Enlaces

- Hugging Face: https://huggingface.co/Karasumikura/Ying-K1-Lite-200M-base
- Dataset de entrenamiento (Ultra-FineWeb-zh): no se proporciona enlace directo en la información disponible.
- Paper, blog o repositorio del autor: no disponible.
- Demo: no disponible.
