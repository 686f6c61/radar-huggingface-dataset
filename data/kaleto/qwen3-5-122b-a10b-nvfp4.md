# Kaleto/Qwen3.5-122B-A10B-NVFP4

## Resumen

Qwen3.5-122B-A10B-NVFP4 es una cuantización de 4 bits en formato NVFP4 (W4A16) del modelo multimodal Qwen3.5-122B-A10B desarrollado por el equipo Qwen de Alibaba. La conversión la firma el usuario independiente Kaleto, que la publica junto con el pipeline de cuantización abierto distrib-nvfp4. El objetivo es claro: hacer que un modelo MoE de 125.000 millones de parámetros totales quepa en una única estación DGX Spark (GB10, 128 GB de memoria unificada), algo imposible con el checkpoint original en BF16 de 250 GB.

La arquitectura del modelo base es `Qwen3_5MoeForConditionalGeneration`, un híbrido que combina 48 capas organizadas en 12 bloques de 3 capas Gated DeltaNet más 1 capa de atención con compuerta, cada una seguida de un bloque MoE de 256 expertos (8 enrutados más 1 compartido) con dimensión oculta de 3072. Incluye además un codificador de visión y una capa MTP (multi-token prediction) que permite decodificación especulativa. El contexto declarado es de 262.144 tokens, aunque en la práctica la configuración recomendada lo limita a 196.608.

La relevancia es doble: por un lado demuestra que es viable servir un modelo de esta escala en hardware de escritorio profesional con vLLM 0.31 y decodificación especulativa MTP; por otro, la model card documenta con inusual transparencia el error de cuantización por capa y por experto, incluyendo la detección de 13 expertos muertos en el checkpoint original. Todo el trabajo se publica bajo licencia Apache 2.0.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Qwen3_5MoeForConditionalGeneration (híbrido Gated DeltaNet + atención con compuerta + MoE, con torre de visión y capa MTP) |
| Parámetros totales | 125.086.497.008 (~125 B) |
| Parámetros activos | 8 expertos enrutados + 1 compartido por token sobre 256 expertos por capa (no se publica el cómputo exacto de parámetros activos) |
| Longitud de contexto | 262.144 tokens en el modelo base; 196.608 recomendado en esta cuantización por límites de KV cache |
| Tipos de cuantización | NVFP4 (4 bits, `group_size=16`, `quant_algo: W4A16_NVFP4`) sobre expertos MoE; resto en BF16 |
| Idiomas soportados | no disponible (la model card no enumera idiomas; las pruebas cualitativas incluyen alemán e inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (16 shards, 82,8 GB), configuración modelopt compatible con vLLM |

## Arquitectura y entrenamiento

El modelo base es un transformer híbrido de 48 capas que alterna capas de atención lineal Gated DeltaNet con capas de atención con compuerta, en un patrón de 3 a 1 dentro de cada uno de los 12 bloques. Cada capa va seguida de un bloque MoE con 256 expertos, de los que se activan 8 enrutados más 1 compartido por token, con dimensión oculta de 3072. Se añade un codificador de visión (333 tensores en BF16) y una capa MTP (785 tensores) que habilita decodificación especulativa nativa. El contexto nativo es de 262.144 tokens.

Esta ficha corresponde a una cuantización, no a un entrenamiento. La conversión se realizó en una sola pasada de 67 minutos en una DGX Spark con el pipeline distrib-nvfp4 en modo secuencial, usando nvidia-modelopt 0.43.0. Se cuantificaron 37.008 capas lineales (por capa, 256 expertos × `{gate,up,down}_proj` más `shared_expert.{gate,up,down}_proj`); quedaron en BF16 las atenciones, Gated DeltaNet, el router, el `shared_expert_gate`, embeddings, `lm_head`, todas las normas, la torre de visión y la cabeza MTP. La calibración usó 64 muestras de 1024 tokens de texto público (CNN/DailyMail, Wikipedia EN/DE, código Python y UltraChat) y solo sirvió para fijar el `input_scale` incluido. No se dispone de información sobre el entrenamiento original del modelo base (número de tokens, composición del dataset, RLHF/DPO).

## Capacidades

- Generación de texto conversacional en múltiples turnos, con modo de razonamiento (thinking) desactivable mediante `--reasoning-parser qwen3`.
- Razonamiento aritmético y resolución de problemas verificada en pruebas cualitativas (aritmética correcta, explicaciones coherentes).
- Generación de código, con soporte de tool calling y parser `qwen3_coder` en vLLM para function calling automático.
- Comprensión de imágenes: pipeline `image-text-to-text` con torre de visión conservada en BF16.
- Capacidades de agente y razonamiento multi-paso, apoyadas en tool calling y contexto largo.
- Decodificación especulativa mediante la cabeza MTP integrada, con aceptación del 77 % y longitud media de aceptación de 1,77 en la configuración probada.
- Capacidades multilingües: no se detallan en la model card; las pruebas cualitativas incluyen alemán e inglés.
- Escritura creativa y roleplay en inglés según las pruebas de humo del autor.

## Casos de uso

- Asistente conversacional de contexto largo en una única DGX Spark: con 196.608 tokens de ventana y prefix caching activado, el modelo puede mantener conversaciones o analizar documentos extensos sin fragmentar el contexto, algo relevante cuando no se dispone de un clúster multi-GPU.
- Generación de código en pipelines internos: el soporte de tool calling con el parser `qwen3_coder` y `--enable-auto-tool-choice` permite integrarlo en flujos de CI/CD o en asistentes de IDE que invocan herramientas externas.
- Procesamiento de documentos con imágenes: al conservar la torre de visión en BF16 y aceptar entradas image-text-to-text, sirve para extraer información de capturas, formularios escaneados o diagramas combinados con texto.
- Agentes autónomos de múltiples pasos: la combinación de contexto largo, tool calling y modo de razonamiento permite encadenar subtareas con estado persistente en una sola máquina.
- Despliegue en el borde o en entornos con requisitos de soberanía de datos: al caber en 128 GB de memoria unificada y ser Apache 2.0, se puede servir en una estación local sin depender de APIs externas.
- Evaluación e investigación de cuantización: la model card publica estadísticas de error por capa y por experto, lo que lo convierte en un caso de estudio útil para quienes investigan el impacto de NVFP4 en modelos MoE.
- Prototipado de asistentes multilingües: las pruebas cualitativas en alemán e inglés sugieren utilidad para mercados centroeuropeos, aunque la cobertura idiomática no está documentada formalmente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no hay KLD frente al modelo BF16 porque este (250 GB) no cabe en una sola GB10. Lo que sí se documenta es el error de cuantización relativo (L2) medido durante la conversión, con 64 muestras de 1024 tokens:

| Métrica | Mediana | Máximo |
|---|---:|---:|
| Capa completa (sin residuo) | 0,080 | 0,112 (capa 40, 1,4×) |
| Bloque MLP | 0,112 | 0,124 (capa 16, 1,1×) |
| Experto compartido | 0,096 | 0,147 (capa 17, 1,5×) |
| Expertos enrutados (12.134 con ≥ 32 tokens) | 0,138 | 0,342 (capa 0, 2,5×) |

Rendimiento medido en una DGX Spark (GB10) con vLLM 0.31.0 y MTP k=1:

| Métrica | Valor |
|---|---:|
| Prefill con prompt de ~4k tokens | 2.139 tok/s |
| Decodificación, 1 stream | 21,7 tok/s |
| Decodificación, 4 streams (`--max-num-seqs 4`) | 60,8 tok/s |
| Aceptación de borradores MTP | 77 % (longitud media 1,77) |
| Memoria del modelo (incl. MTP) | 77,3 GiB |
| KV cache disponible a `--gpu-memory-utilization 0.85` | 6,9–9,1 GiB según carga |

## Requisitos de hardware

- VRAM/memoria: el modelo ocupa 77,3 GiB incluyendo la cabeza MTP; el repositorio pesa 82,9 GB. No cabe en GPUs de consumo de 24 GB ni en configuraciones de 48 GB.
- GPU recomendadas: DGX Spark (GB10, 128 GB de memoria unificada) es el objetivo declarado y probado. No se documentan pruebas en A100, H100 ni RTX 4090; por tamaño, requeriría al menos dos A100/H100 de 80 GB o una H200 para alojar pesos más KV cache.
- Cabe en GPU de consumo: no. El modelo completo supera ampliamente los 24 GB de una RTX 4090 y los 48 GB de una RTX 6000 Ada.
- Despliegue: vLLM 0.31 o superior con backend de atención FlashInfer y kernel `MarlinNvFp4LinearKernel`; no requiere flag `--quantization` porque vLLM lee la configuración modelopt. No se documenta soporte en llama.cpp, Ollama ni TGI.
- Memoria y contexto: con `--gpu-memory-utilization 0.85` y `--max-num-seqs 1` el KV cache queda en 6,9–9,1 GiB; el contexto completo de 262.144 tokens necesita 7,02 GiB y falló una vez con 6,9 GiB, por lo que se recomienda 196.608. Solo 12 de las 48 capas (más MTP) llevan KV cache.
- Latencia y throughput: 21,7 tok/s en un stream y 60,8 tok/s agregados con 4 streams; prefill de 2.139 tok/s con prompt de ~4k tokens.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Kaleto/Qwen3.5-122B-A10B-NVFP4 | 125 B totales (MoE, 8+1 activos) | 262.144 (196.608 recomendado) | NVFP4 W4A16, 82,8 GB | Apache 2.0 | Hugging Face, vLLM |
| Qwen/Qwen3.5-122B-A10B (base) | 125 B totales (MoE) | 262.144 | BF16, 250 GB | Apache 2.0 | Hugging Face |
| Kaleto/Qwen3.6-35B-A3B-NVFP4 | ~35 B totales (MoE, ~3 B activos) | no disponible | NVFP4, formato equivalente | Apache 2.0 | Hugging Face, vLLM |

Frente al modelo base, esta versión reduce el peso de 250 GB a 82,8 GB a cambio de un error de cuantización documentado y de renunciar a la comparación KLD. Frente a la variante de 35 B del mismo autor, el modelo de 122 B ofrece mucha más capacidad pero exige el doble de memoria y no cabe en GPUs de consumo; además, la medición de error del 35 B no encontró ningún experto por encima de 1,3× la mediana, mientras que aquí hay siete por encima de 1,5×, concentrados en las capas 0 y 1.

## Limitaciones y advertencias

- No hay comparación KLD ni evaluación de benchmarks contra el modelo BF16: el impacto real de la cuantización en calidad end-to-end no está medido.
- Siete expertos superan 1,5× la mediana de error, seis de ellos en las capas 0 y 1 (peor caso: capa 0, experto 237, error 0,342). Su efecto sobre la salida de capa es pequeño (la capa 0 tiene el error de capa más bajo, 0,0075), pero el coste global no se ha cuantificado.
- El checkpoint base contiene 13 expertos muertos en las capas 3–13 con pesos ≈ 0 en BF16 a los que el router sigue enviando miles de tokens; es una propiedad del modelo original, no de la cuantización, y no genera NaN ni Inf.
- El contexto práctico queda limitado a 196.608 tokens en una DGX Spark; el contexto completo de 262.144 requiere no ejecutar nada más en la máquina y ajustar `--gpu-memory-utilization` por encima de 0,85 (no probado).
- Solo se ha validado el despliegue en vLLM 0.31 sobre GB10; no hay soporte documentado para llama.cpp, Ollama o TGI, lo que limita las opciones de producción.
- Riesgo de alucinación y sesgos: no documentados en la model card; al ser una cuantización, hereda los del modelo base, que tampoco se detallan.
- Cobertura idiomática no especificada: no se enumeran idiomas soportados, solo pruebas cualitativas en alemán e inglés.
- Licencia Apache 2.0 permite uso comercial, pero conviene verificar la licencia del modelo base enlazada por el autor antes de desplegar en producción.
- Repositorio con muy poca tracción (26 descargas, 0 likes) y creado el 16 de noviembre de 2026: no hay validación comunitaria independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Kaleto/Qwen3.5-122B-A10B-NVFP4
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-122B-A10B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.5-122B-A10B/blob/main/LICENSE
- Pipeline de cuantización distrib-nvfp4: https://github.com/KaletoAI/distrib-nvfp4
- NVIDIA TensorRT Model Optimizer: https://github.com/NVIDIA/TensorRT-Model-Optimizer
- Variante relacionada del mismo autor: https://huggingface.co/Kaleto/Qwen3.6-35B-A3B-NVFP4
