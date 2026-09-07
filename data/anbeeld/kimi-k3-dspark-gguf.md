# Anbeeld/Kimi-K3-DSpark-GGUF

## Resumen

Kimi K3 DSpark GGUF es un modelo draft (especulador) diseñado para acelerar la inferencia del modelo Kimi K3 de Moonshot AI mediante decodificación especulativa. El repo contiene cuantizaciones GGUF del modelo RadixArk/Kimi-K3-DSpark, que actúa como generador de borradores de tokens para el modelo objetivo Kimi K3, un MoE de 2.8T parámetros con 104B activados y ventana de contexto de 1M tokens. El autor del repo es Anbeeld, y el modelo base fue entrenado con SpecForge, un framework de destilación online para decodificación especulativa.

El draft model tiene arquitectura de 5 capas full-attention estilo Qwen3 con GQA (64 query heads, 16 KV heads), hidden size 7168, y un block_size de 7 tokens. El peso total es de 2.249.289.601 parámetros en formato BF16 (single-file safetensors). Aunque el entrenamiento se realizó con 65.536 tokens de contexto, el modelo soporta hasta 1.048.576 tokens gracias a la extensión YaRN-16 incluida en su configuración por defecto. Este modelo no es un modelo de generación autónoma: su función es producir drafts de 7 tokens que Kimi K3 verifica y acepta, reduciendo así el número de pasos de decodificación y la latencia total del sistema.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | 5 capas full-attention estilo Qwen3 con GQA, hidden size 7168, 64 query heads / 16 KV heads, block_size=7 |
| Parametros totales | 2.249.289.601 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 1.048.576 tokens (con YaRN-16; entrenado en 65.536) |
| Tipos de cuantizacion | GGUF (no se especifican los distintos niveles de cuantizacion en la informacion disponible) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | GGUF (repo de cuantizaciones); modelo base en safetensors BF16 |

## Arquitectura y entrenamiento

DSpark extiende el backbone de borradores paralelos DFlash con una cabeza de sesgo logit de Markov y una cabeza de confianza por posición. El modelo consta de 5 capas full-attention con GQA, y su block_size de 7 significa que genera 7 tokens de borrador por cada token actual, que luego son verificados por el modelo objetivo. Las capas auxiliares del target utilizadas durante el entrenamiento son las capas `[7, 23, 51, 67, 83]` de Kimi K3. Los pesos de embedding y unembedding del target no están incluidos en el checkpoint.

El entrenamiento se realizó con SpecForge mediante destilación online: los hidden states se capturaron de una instancia viva de SGLang sirviendo un Kimi K3 congelado. La función de pérdida combina `0.1 CE + 0.9 L1 distillation + 1.0 confidence BCE`, con decay gamma 4.0 y 512 anchors muestreados por secuencia. La topología de entrenamiento fue de 4 nodos con 4 GB300 cada uno (16 ranks), usando 2 réplicas target con TP8, sampler DP2, FSDP16 `SHARD_GRAD_OP` en el draft y scatter por batch TP. El batch global fue de 512 (8 por réplica × 32 pasos de acumulación × 2 réplicas). La configuración publicada incluye YaRN-16 con `original_max_position_embeddings=65536` y `max_position_embeddings=1048576`.

## Capacidades

- Decodificación especulativa: genera drafts de 7 tokens que son verificados por Kimi K3, reduciendo la latencia de inferencia.
- Soporte de contexto largo: funciona con ventanas de hasta 1.048.576 tokens mediante YaRN-16.
- Integración con SGLang: compatible con el algoritmo `DSPARK` de SGLang, usado en el comando de despliegue con `--speculative-algorithm DSPARK`.
- Integración con BeeLlama.cpp: fork de llama.cpp con características avanzadas de cuantización, recomendado para usar las cuantizaciones GGUF.
- Métricas de aceptación: el modelo presenta valores de `acc_len` (longitud de aceptación) superiores a 4 en la mayoría de benchmarks, indicando que sus drafts son aceptados con frecuencia por el target.
- No es un modelo autónomo: no genera texto por sí mismo ni soporta tool calling, visión o razonamiento independiente; sus capacidades se manifiestan únicamente en combinación con Kimi K3.

## Casos de uso

- Aceleración de inferencia en producción: el modelo se usa con SGLang en clústeres multi-GPU (por ejemplo, TP8 y DCP8) para reducir la latencia de Kimi K3 en servicios de razonamiento largo. El comando de despliegue proporcionado en la model card permite integrarlo directamente en un pipeline de producción.
- Razonamiento matemático: los benchmarks GSM8K (acc_len 5.4176) y MATH500 (acc_len 4.1329) indican que los borradores son aceptados con alta frecuencia en tareas de matemáticas, lo que hace al modelo útil para acelerar asistentes de resolución de problemas.
- Generación de código: con acc_len de 5.5121 en HumanEval y 5.1980 en MBPP, el draft es especialmente eficaz en tareas de programación, reduciendo el tiempo de respuesta en herramientas de autocompletado y revisión de código basadas en Kimi K3.
- Tareas de contexto muy largo: el modelo soporta entradas de hasta 1M tokens, y en RULER V2 1M alcanza un acc_len de 4.2553. Es adecuado para acelerar análisis de documentos extensos, repositorios de código completos o logs largos.
- Despliegue local con BeeLlama.cpp: las cuantizaciones GGUF permiten ejecutar el draft model en entornos con recursos limitados, usando BeeLlama.cpp para inferencia en CPU o GPU modestas, mientras se mantiene la compatibilidad con el target Kimi K3.
- Investigación en decodificación especulativa: el modelo sirve como referencia para estudiar la relación entre arquitectura de draft, block_size y tasa de aceptación, gracias a las métricas de acc_len publicadas por longitud de salida.

## Benchmarks y rendimiento

La métrica `acc_len` es la longitud de aceptación de solicitudes calculada por SGLang, promediada dentro de cada pregunta y luego entre preguntas. Los resultados publicados son los siguientes:

| Dataset | Preguntas | acc_len |
|---|---|---:|
| SWE-Rebench | 50 | 4.6594 |
| GSM8K | 1.319 | 5.4176 |
| MATH500 | 500 | 4.1329 |
| HumanEval | 164 | 5.5121 |
| MBPP | 257 | 5.1980 |
| MT-Bench | 80 | 3.9342 |
| AIME26 | 30 | 2.9893 |
| RULER V2 1M (MK/MV/QA) | 150 (50 por partición) | 4.2553 |

RULER V2 usa la configuración de entrada de 1M tokens; los prompts reales abarcan entre 1.000.432 y 1.047.925 tokens, con acc_len por partición de 4.4658 (MK), 4.3081 (MV) y 3.9919 (QA). Para AIME26, el acc_len varía según la longitud de salida: en el bucket de 0–1K es 3.1310, en 1–2K es 2.5773, en 2–4K es 2.5632, en 4–8K es 2.7174, y en el bucket de 32K+ (con salidas de 54.545 a 224.703 tokens) alcanza 4.9194. No se han publicado comparativas directas con otros modelos draft en la información disponible.

## Requisitos de hardware

- VRAM estimada para el draft model: aproximadamente 4.5 GB en BF16 (2.249.289.601 parámetros × 2 bytes). En cuantizaciones GGUF, la VRAM necesaria es menor, típicamente entre 1.5 y 2.5 GB en Q4.
- GPU recomendadas: para ejecutar solo el draft model, cualquier GPU con al menos 6 GB de VRAM (por ejemplo, RTX 3060 o superior). Para el sistema completo con Kimi K3, se requieren clústeres de GPUs de gran capacidad, como B300 o H100, en configuraciones TP8 y DCP8.
- Despliegue en consumer GPU: el draft model cabe en GPUs de consumo, pero el modelo objetivo Kimi K3 (2.8T MoE) no; por tanto, el uso práctico requiere infraestructura de servidor o acceso a APIs.
- Opciones de despliegue: SGLang (comando de ejemplo con `--speculative-algorithm DSPARK`), BeeLlama.cpp (fork de llama.cpp). No se especifican vLLM ni TGI en la información proporcionada.
- Latencia y throughput: no disponibles. El propósito del modelo es reducir la latencia de Kimi K3 mediante decodificación especulativa, pero no se publican cifras de rendimiento de inferencia.

## Comparativa con modelos similares

No se dispone de comparativas directas con otros modelos draft para Kimi K3 en la información proporcionada. El modelo DSpark es una extensión de DFlash, un backbone de borradores paralelos, pero no se publican métricas comparativas entre ambos. Tampoco se ofrecen datos de otros repos de cuantizaciones GGUF, como `gaber/kimi-k3-dspark-gguf`, más allá de su existencia. Por tanto, la comparativa se limita a indicar que el modelo está diseñado específicamente para el target Kimi K3 y que su rendimiento debe evaluarse en el contexto del sistema completo de decodificación especulativa.

## Limitaciones y advertencias

- Modelo draft: no puede usarse como modelo de generación de texto independiente; requiere el modelo objetivo Kimi K3 para verificar y aceptar los borradores.
- Pesos incompletos: los embeddings y unembeddings del target no están incluidos en el checkpoint, por lo que el modelo no es autocontenido.
- Licencia no disponible: no se puede determinar si el uso comercial está permitido. Es necesario contactar con el autor o revisar la licencia del modelo base antes de cualquier uso en producción.
- Idiomas no especificados: no se indica qué idiomas soporta el modelo, aunque al estar basado en Kimi K3 se espera cobertura multilingüe, pero no hay confirmación.
- Contexto de entrenamiento limitado: el modelo fue entrenado con 65.536 tokens, aunque soporta 1M mediante YaRN-16. Puede haber degradación en la calidad de los borradores en longitudes extremas.
- Dependencia de forks específicos: el uso de las cuantizaciones GGUF requiere BeeLlama.cpp, un fork no oficial de llama.cpp, lo que añade una dependencia de mantenimiento.
- Repo nuevo y sin adopción: el repo tiene 0 descargas y 0 likes, lo que indica que es un lanzamiento reciente y poco probado por la comunidad.

## Enlaces

- https://huggingface.co/Anbeeld/Kimi-K3-DSpark-GGUF
- https://huggingface.co/RadixArk/Kimi-K3-DSpark
- https://huggingface.co/moonshotai/Kimi-K3
- https://github.com/Anbeeld/beellama.cpp
- https://github.com/sgl-project/SpecForge/
- https://github.com/sgl-project/sglang
- https://www.kimi.ai/ai-models/kimi-k3
- https://build.nvidia.com/moonshotai/kimi-k3/modelcard
