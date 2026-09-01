# AMAImedia/Qwen3.6-27B-Qwimi-Coder-MTP-NOESIS-BF16

## Resumen

AMAImedia/Qwen3.6-27B-Qwimi-Coder-MTP-NOESIS-BF16 es un reempaquetado en 35 shards del modelo Qwimi-3.6-27B-Coder-MTP-BF16, un ajuste fino supervisado (SFT) orientado a codificación del modelo Qwen 3.6 27B de Alibaba. El repack lo publica AMAImedia como parte de su plataforma NOESIS de doblaje profesional multilingüe, aunque el modelo en sí es un checkpoint de generación de texto y razonamiento, no un modelo de audio. El autor del repack es Ilia Bolotnikov, fundador de AMAImedia.com.

El modelo original, desarrollado por trjxter, es un SFT de una sola pasada sobre un corpus mixto de codificación (~82,5 % de los tokens de entrenamiento), tool calling y datos agénticos estilo SWE-agent. La arquitectura es densa e híbrida: capas de atención estándar intercaladas con capas de atención lineal GatedDeltaNet, con tipo de modelo `qwen3_5`. El checkpoint base es multimodal (image-text-to-text), pero este SFT congela la torre de visión y solo entrena las capas de lenguaje. El contexto nativo es de 262 144 tokens, aunque el entrenamiento se realizó con secuencias de hasta 16 384 tokens.

La relevancia de este modelo reside en que Qwen 3.6 27B, según el blog oficial de Qwen, supera a modelos mucho mayores como Qwen3.5-Plus (397B MoE) en benchmarks de codificación agéntica, y este SFT específico añade capacidades de tool calling y razonamiento multi-paso visibles. El repack NOESIS no añade capacidades nuevas; es una redistribución en BF16 con 27 356 728 560 parámetros reales según los safetensors, preparada para su carga en Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Densa hibrida: attention estandar intercalada con GatedDeltaNet (linear attention); `model_type: qwen3_5`, clase `Qwen3_5ForConditionalGeneration` |
| Parametros totales | 27 356 728 560 (27,36 B segun safetensors; la model card del original indica 27 823 639 792) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262 144 tokens (nativo del base); SFT entrenado y validado hasta 16 384 tokens |
| Tipos de cuantizacion | BF16 (este repo); existen cuantizaciones GGUF del modelo original (Qwimi-3.6-27B-Coder-MTP-GGUF) |
| Idiomas soportados | en, ru, zh, ja, kk, vi (segun tags; el modelo original advierte que no esta validado para uso no-ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16), 35 shards, 58,2 GB |

## Arquitectura y entrenamiento

El modelo base es `unsloth/Qwen3.6-27B`, un ajuste de `Qwen/Qwen3.6-27B`. La arquitectura es densa e hibrida: capas de atencion estandar intercaladas con capas de atencion lineal GatedDeltaNet, lo que reduce el coste computacional en secuencias largas. El checkpoint base es multimodal (image-text-to-text), pero el SFT de Qwimi congela la torre de vision y solo entrena las capas de lenguaje (attention + MLP), con 466 911 232 parametros entrenables (1,68 % del total).

El entrenamiento se realizo con QLoRA de 4 bits (rank 64, alpha 64, dropout 0), fusionado posteriormente a BF16. Se uso una unica pasada (1 epoch) sobre 72 529 798 tokens, con un batch efectivo de 16, secuencias de hasta 16 384 tokens, optimizador `paged_adamw_8bit`, learning rate 2e-5 con schedule coseno y warmup del 3 %. El hardware fue una unica GPU A100-SXM4-80GB en Google Colab Pro, con Unsloth 2026.6.9, Transformers 5.5.0 y Torch 2.10.0. Se requieren las librerias `flash-linear-attention` y `causal-conv1d` para el camino rapido de GatedDeltaNet.

El dataset combina cinco fuentes de codificacion (con filtros de dominio y contenido), una fuente de tool calling (`minpeter/xlam-`, truncada en la documentacion) y datos agienticos. La codificacion domina por proporcion de tokens (~82,5 %), no solo por numero de filas, para evitar que los buckets mas pequenos degraden la capacidad de codificacion. El enmascarado de perdida se aplica solo a las respuestas del asistente.

## Capacidades

- Generacion de codigo: creacion, depuracion, refactorizacion y explicacion de codigo con razonamiento visible (chain-of-thought).
- Razonamiento tecnico: resuelve problemas de depuracion y razonamiento algoritmico con trazas de pensamiento intermedias.
- Tool calling / function calling: soporte nativo para invocar funciones y herramientas en formato de chat.
- Comportamiento agientico: uso multi-turno de herramientas sobre un repositorio, estilo SWE-agent.
- Multilingue declarado: los tags indican ingles, ruso, chino, japones, kazajo y vietnamita, aunque el modelo original no valida el uso no-ingles.
- Multimodalidad heredada: el checkpoint base acepta entrada de imagen, pero la torre de vision esta congelada y no validada en este SFT; el uso recomendado es solo texto.

## Casos de uso

- Asistente de codificacion en IDE: el modelo puede generar, explicar y refactorizar codigo con razonamiento visible, integrable en editores como VS Code o JetBrains mediante protocolos tipo LSP.
- Depuracion automatizada: dado un fragmento con error, el modelo produce una traza de razonamiento y una correccion, util en pipelines de revision de codigo.
- Agente de resolucion de incidencias en repositorios: con su entrenamiento SWE-agent, puede recorrer un repositorio, invocar herramientas (busqueda, lectura de archivos) y proponer parches.
- Automatizacion de tool calling en backend: el modelo puede orquestar llamadas a APIs y funciones en flujos de automatizacion, gracias a su soporte nativo de function calling.
- Generacion de documentacion tecnica: a partir de codigo fuente, produce explicaciones y comentarios en lenguaje natural, aprovechando su dominio de codigo y razonamiento.
- Prototipado rapido de agentes de IA: su capacidad de razonamiento multi-paso y tool calling lo hace adecuado para construir agentes conversacionales que ejecutan tareas sobre sistemas externos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks especificos del repack NOESIS ni del modelo Qwimi-3.6-27B-Coder-MTP en la informacion disponible. La model card del original menciona una seccion de benchmarks (seccion 10) que no se incluye en el texto proporcionado. Segun el blog oficial de Qwen, el modelo base Qwen3.6-27B supera a Qwen3.5-Plus (397B MoE) en benchmarks de codificacion agientica, pero no se dispone de cifras concretas. No se deben inferir numeros no verificados.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo en BF16 ocupa aproximadamente 55 GB solo de pesos (27,36 B parametros × 2 bytes), mas overhead de activaciones y cache KV. Con contexto de 16K tokens, se recomiendan al menos 70-80 GB de VRAM.
- GPU recomendadas: A100 80GB, H100 80GB, o multiples RTX 4090 (24 GB) con tensor parallelism. En cuantizacion GGUF Q4, el modelo puede caber en una GPU de 24 GB (la busqueda web menciona ~17 GB de VRAM para Qwen3.6-27B en cuantizacion baja).
- Compatibilidad con GPU de consumo: si, con cuantizaciones GGUF (Q4_K_M o inferiores) en GPUs de 16-24 GB, aunque con perdida de calidad y menor velocidad.
- Opciones de despliegue: vLLM, TensorRT-LLM, TGI para inferencia en produccion; llama.cpp, Ollama y LM Studio para cuantizaciones GGUF en local.
- Latencia y throughput: no disponible. Depende de la cuantizacion, el hardware y el backend. En BF16 con A100, se espera un throughput de decenas de tokens por segundo para generacion autoregresiva, pero no hay datos publicados.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Arquitectura | Licencia | Enfoque |
|---|---|---|---|---|---|
| Qwimi-3.6-27B-Coder-MTP (este) | 27,36 B | 262 144 (nativo) | Densa hibrida (attention + GatedDeltaNet) | Apache 2.0 | Codificacion + tool calling + agientico |
| Qwen3.6-27B (base) | 27 B | 262 144 | Densa hibrida (attention + GatedDeltaNet) | Apache 2.0 | Multimodal, razonamiento y codificacion general |
| Qwen3-Coder-30B-A3B (si existe) | 30 B (3 B activos) | 262 144 | MoE | Apache 2.0 | Codificacion |

No se dispone de datos de rendimiento comparativo publicados para el modelo Qwimi. La comparativa se limita a aspectos estructurales. El modelo base Qwen3.6-27B, segun el blog de Qwen, supera a Qwen3.5-Plus (397B MoE) en codificacion agientica, lo que sugiere que este SFT hereda esa capacidad, pero no hay cifras verificables.

## Limitaciones y advertencias

- El SFT no valida el uso en idiomas distintos del ingles, a pesar de que los tags declaran ruso, chino, japones, kazajo y vietnamita. Para produccion multilingue, se recomienda evaluar previamente.
- La torre de vision esta congelada y no entrenada; el modelo no debe usarse para tareas de vision o imagen, aunque el checkpoint base sea multimodal.
- El contexto nativo es de 262 144 tokens, pero el entrenamiento solo cubre hasta 16 384; el rendimiento en secuencias mas largas no esta garantizado y puede degradarse.
- Riesgo de alucinacion en codigo: como cualquier modelo de generacion, puede producir codigo sintacticamente valido pero logicamente incorrecto. Se recomienda revision humana en entornos criticos.
- El repack NOESIS es una redistribucion de un tercero (AMAImedia) con fines de su plataforma de doblaje; no hay garantia de mantenimiento ni soporte por parte del autor original (trjxter).
- No esta validado para despliegues de alto riesgo o criticos para la seguridad, segun la model card del original.
- El modelo requiere las librerias `flash-linear-attention` y `causal-conv1d` para el camino rapido de GatedDeltaNet; sin ellas, la inferencia puede fallar o ser mucho mas lenta.

## Enlaces

- Repositorio del modelo: https://huggingface.co/AMAImedia/Qwen3.6-27B-Qwimi-Coder-MTP-NOESIS-BF16
- Modelo original: https://huggingface.co/trjxter/Qwimi-3.6-27B-Coder-MTP-BF16
- Cuantizaciones GGUF del original: https://huggingface.co/trjxter/Qwimi-3.6-27B-Coder-MTP-GGUF
- Blog de Qwen sobre Qwen3.6-27B: https://qwen.ai/blog?id=qwen3.6-27b
- Analisis de Qwen3.6-27B (buildfastwithai): https://www.buildfastwithai.com/blogs/qwen3-6-27b-review-2026
- Guia de despliegue local (localaimaster): https://localaimaster.com/models/qwen-3-6-27b
