# openbmb/MiniCPM5-1B-Base

## Resumen

MiniCPM5-1B-Base es el checkpoint base (solo preentrenamiento) del primer modelo de la serie MiniCPM5, desarrollado por OpenBMB. Se trata de un transformer denso de tipo causal con arquitectura estándar `LlamaForCausalLM` y 1.080.632.832 parámetros totales (679.552.512 no pertenecientes a los embeddings), diseñado específicamente para despliegue local, en dispositivo y en entornos con recursos limitados. Es relevante ahora porque la serie MiniCPM5 apunta a un estado del arte de código abierto en la clase de 1B, con ventajas declaradas en uso de herramientas (tool calling), generación de código y razonamiento complejo.

El modelo mantiene una huella de despliegue reducida (repositorio de 2,2 GB en BF16) y ofrece soporte nativo de contexto largo de hasta 131.072 tokens, además de modos de chat Think / No Think sobre el mismo checkpoint en la versión post-entrenada. La variante Base que nos ocupa contiene únicamente los pesos resultantes del preentrenamiento y del mid-training, sin SFT, RL ni destilación on-policy, por lo que está pensada como punto de partida para ajuste fino propio.

La receta de entrenamiento se apoya en la gestión de datos por niveles UltraData de OpenBMB, con corpus publicados junto al modelo (Ultra-FineWeb, Ultra-FineWeb-L3 y UltraData-Math). La licencia Apache 2.0 y la disponibilidad de formatos GGUF y MLX en la familia facilitan su integración en pipelines locales y en hardware de consumo.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso causal, `LlamaForCausalLM` |
| Parametros totales | 1.080.632.832 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 131.072 tokens |
| Tipos de cuantizacion | BF16 en este repositorio; la familia ofrece GGUF (llama.cpp / Ollama / LM Studio) y MLX 4-bit para Apple Silicon |
| Idiomas soportados | Inglés (en) y chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16) |

Otros datos técnicos declarados: 24 capas, atención con GQA de 16 cabezas para Q y 2 para KV, 679.552.512 parámetros no-embedding.

## Arquitectura y entrenamiento

La arquitectura es un transformer causal denso estándar de tipo Llama, con 24 capas y atención GQA (16 cabezas de query, 2 de key/value), lo que reduce el coste de memoria del KV cache en contextos largos. El modelo declara soporte nativo de 131.072 tokens de contexto. Al ser un checkpoint Base, no incorpora plantilla de chat ni modos Think/No Think; esas capacidades aparecen en la versión post-entrenada MiniCPM5-1B.

El entrenamiento sigue la receta UltraData Tiered Data Management en tres fases: base training (con fases estable y de decay), mid-training para reforzar capacidades objetivo y adaptar la distribución de datos, y post-training. Esta variante Base cubre las fases previas al post-training. El corpus de preentrenamiento se publica como Ultra-FineWeb, Ultra-FineWeb-L3 y UltraData-Math. La fase de post-training de la versión final (no incluida aquí) emplea 200B tokens de SFT de razonamiento profundo y 200B tokens de SFT híbrido, seguidos de profesores RL especializados en matemáticas, código, QA de libro cerrado y escritura, destilados mediante On-Policy Distillation (OPD). Los datos de SFT se publican como UltraData-SFT-2605.

## Capacidades

- Generación de texto causal en inglés y chino, como modelo base sin alineación conversacional.
- Punto de partida para ajuste fino supervisado (SFT) y posteriores etapas de RL o DPO.
- Soporte nativo de contexto largo (131.072 tokens), adecuado para tareas de lectura extensa una vez ajustado.
- Capacidad potencial de tool calling y razonamiento multi-paso tras el post-training de la familia (la versión final lo declara; el checkpoint Base no lo garantiza sin ajuste).
- Modo de razonamiento híbrido (Think / No Think) disponible en la versión post-entrenada de la familia, no en este checkpoint.
- Sin capacidades de visión, audio ni multimodalidad declaradas.

## Casos de uso

- Ajuste fino específico de dominio: partir de los pesos Base para entrenar un modelo especializado (legal, médico, atención al cliente) con datos propios, aprovechando su reducido tamaño para iterar rápido en una sola GPU.
- Investigación en recetas de preentrenamiento: usar el checkpoint junto con los corpus Ultra-FineWeb y UltraData-Math publicados para reproducir o variar etapas de mid-training y medir el impacto en capacidades downstream.
- Destilación y experimentación con OPD: emplear el Base como alumno en pipelines de destilación on-policy, replicando el esquema de profesores RL descrito por OpenBMB.
- Generación de código en local tras SFT: el modelo final de la familia declara ventajas en código; el Base sirve como base para ajustar un asistente de código ligero que corra en portátil.
- Evaluación de contextos largos: con 131.072 tokens nativos, sirve para experimentos de recuperación de información en documentos extensos y para medir degradación por posición tras ajuste.
- Desarrollo de asistentes en dispositivo: base para prototipos de agentes locales con tool calling una vez aplicado el post-training correspondiente, con huella de 2,2 GB en BF16.
- Benchmarking de técnicas de cuantización: comparar BF16 frente a GGUF y MLX 4-bit de la familia para medir pérdida de calidad en tareas de razonamiento y código.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible para el checkpoint Base. La model card de la familia reporta comparativas de la versión post-entrenada frente a LFM2.5-1.2B-Thinking, Qwen3-0.6B/think y Qwen3.5-0.8B/think, con ventaja declarada en uso de herramientas, generación de código y razonamiento difícil, pero las cifras concretas no se incluyen en los datos proporcionados.

## Requisitos de hardware

- VRAM estimada en BF16: aproximadamente 2,2 GB solo para pesos; con overhead de activaciones y KV cache para 131.072 tokens, el consumo crece de forma significativa (el KV cache con GQA de 2 cabezas KV y 24 capas es relativamente contenido, pero el contexto máximo exige planificación de memoria).
- Cuantización GGUF (Q4/Q5/Q8) y MLX 4-bit disponibles en la familia: permiten inferencia por debajo de 1-2 GB de pesos, apta para portátiles y dispositivos edge.
- GPU recomendadas: cualquier GPU consumer con 6-8 GB o más (RTX 3060, RTX 4060, RTX 4090) para BF16 con contexto moderado; A100/H100 no son necesarias para este tamaño, aunque pueden usarse para ajuste fino con lotes grandes.
- Cabe en GPU consumer: sí, en la mayoría de tarjetas con 6 GB o más en cuantización, y en Apple Silicon vía MLX.
- Opciones de despliegue: transformers, vLLM, TGI (tag `text-generation-inference`), llama.cpp, Ollama y LM Studio (vía GGUF), MLX en Apple Silicon.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| MiniCPM5-1B-Base | 1,08B | 131.072 | Apache 2.0 | HF, ModelScope, GGUF, MLX | Checkpoint base, sin post-training |
| Qwen3-0.6B | 0,6B (no confirmado en la información) | no disponible | no disponible | no disponible | Baseline citado por el autor |
| Qwen3.5-0.8B | 0,8B (no confirmado en la información) | no disponible | no disponible | no disponible | Baseline citado por el autor |
| LFM2.5-1.2B-Thinking | 1,2B (no confirmado en la información) | no disponible | no disponible | no disponible | Baseline citado por el autor |

Los datos de los modelos comparables no están detallados en la información proporcionada más allá de su mención como baselines; no se dispone de cifras de rendimiento ni de especificaciones completas para una comparación cuantitativa.

## Limitaciones y advertencias

- Checkpoint Base sin alineación: no sigue instrucciones de forma fiable ni mantiene conversaciones multi-turno sin ajuste fino previo.
- Idiomas limitados a inglés y chino; el rendimiento en castellano no está garantizado y requeriría ajuste específico.
- Riesgo de alucinación inherente a los modelos de lenguaje; el tamaño reducido puede agravar la generación de hechos incorrectos en dominios especializados.
- Sin datos publicados de sesgos; se recomienda evaluación propia antes de uso en producción.
- Contexto de 131.072 tokens declarado, pero el rendimiento efectivo en contextos muy largos tras ajuste no está documentado en la información disponible.
- Licencia Apache 2.0 permite uso comercial, pero el modelo Base no incluye salvaguardas de seguridad; cualquier despliegue debe incorporar filtros propios.
- Las capacidades de tool calling y razonamiento híbrido pertenecen a la versión post-entrenada de la familia, no a este checkpoint.

## Enlaces

- Hugging Face: https://huggingface.co/openbmb/MiniCPM5-1B-Base
- ModelScope: https://www.modelscope.cn/models/OpenBMB/MiniCPM5-1B-Base
- Versión post-entrenada: https://huggingface.co/openbmb/MiniCPM5-1B
- Versión SFT: https://huggingface.co/openbmb/MiniCPM5-1B-SFT
- Versión GGUF: https://huggingface.co/openbmb/MiniCPM5-1B-GGUF
- Versión MLX: https://huggingface.co/openbmb/MiniCPM5-1B-MLX
- Repositorio GitHub: https://github.com/OpenBMB/MiniCPM
- Informe técnico MiniCPM: https://arxiv.org/pdf/2506.07900
- Paper UltraData Tiered Data Management: https://arxiv.org/pdf/2602.09003
- Wiki MiniCPM (chino): https://openbmb.cn/docs/
- UltraData: https://ultradata.openbmb.cn/
- Demo online: https://huggingface.co/spaces/openbmb/MiniCPM5-1B-Demo
- MiniCPM Desk Pet: https://github.com/OpenBMB/MiniCPM-Desk-Pet
- Dataset Ultra-FineWeb: https://huggingface.co/datasets/openbmb/Ultra-FineWeb
- Dataset Ultra-FineWeb-L3: https://huggingface.co/datasets/openbmb/Ultra-FineWeb-L3
- Dataset UltraData-Math: https://huggingface.co/datasets/openbmb/UltraData-Math
- Dataset UltraData-SFT-2605: https://huggingface.co/datasets/openbmb/UltraData-SFT-2605
