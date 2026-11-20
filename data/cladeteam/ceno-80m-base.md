# CladeTeam/CENO-80M-base

## Resumen

CENO-80M-base es el checkpoint de preentrenamiento base del modelo fundacional de ADN CENO, desarrollado por CladeTeam. Se trata de un modelo de lenguaje causal sobre secuencia genómica construido sobre una arquitectura híbrida Mamba / Attention / Mixture-of-Experts (Nemotron-H), sin entradas de alineamiento múltiple de secuencias (MSA). Con 79,3 millones de parámetros en precisión bfloat16, está orientado a generación de secuencias genómicas y extracción de embeddings para tareas de genómica.

El modelo emplea un tokenizador a nivel de carácter que mapea las bases de ADN a sus códigos ASCII de byte, con un vocabulario de 512 entradas. La columna vertebral combina capas Mamba con atención y un bloque MoE de 8 expertos con enrutamiento top-2 por token. Esta combinación busca capturar dependencias de largo alcance en secuencias genómicas manteniendo un coste computacional contenido para su tamaño.

Su relevancia actual radica en la disponibilidad de un modelo fundacional de ADN abierto (Apache-2.0) y de pequeño tamaño, lo que facilita su adaptación mediante fine-tuning y probing en tareas genómicas, así como su uso como base para la variante orientada a predicción de efectos de variantes (VEP) de la familia CENO-P. El checkpoint es cargable de forma autónoma con `trust_remote_code=True`, ya que el código del modelo está incluido en el repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida Mamba / Attention / Mixture-of-Experts (Nemotron-H) |
| Parametros totales | 79.290.560 (79,3M) |
| Parametros activos | No disponible (MoE de 8 expertos, top-2 por token; no se especifica el recuento de parámetros activos) |
| Longitud de contexto | No disponible como valor nominal; el path de precisión HF permite como máximo 131072 tokens por prefill (prefill máximo, no contexto declarado) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No aplica de forma convencional; secuencias de ADN codificadas a nivel de carácter (vocabulario de 512) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (librería transformers; `model_type` `ceno`) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Nemotron-H, un backbone híbrido que intercala capas Mamba con capas de atención y un bloque de mezcla de expertos. En concreto, cuenta con 9 capas ocultas, tamaño oculto de 512, 8 cabezas de atención y tamaño intermedio de 2048. El bloque MoE dispone de 8 expertos con enrutamiento top-2 por token. El tokenizador es a nivel de carácter y mapea las bases de ADN a sus códigos de byte ASCII, con un vocabulario de 512 entradas; deriva del `CharLevelTokenizer` de Evo2 (Arc Institute). El código del modelo está incluido en el repositorio y deriva de la implementación de Nemotron-H de NVIDIA en Hugging Face.

El checkpoint corresponde a la etapa 2 de preentrenamiento (base pretraining). No se proporcionan en la información disponible datos sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO. Tampoco se detallan innovaciones adicionales como decodificación especulativa. Cabe destacar que las capas Mamba requieren kernels CUDA, por lo que las pasadas forward y la generación necesitan GPU; la carga de configuración, tokenizador y pesos es segura en CPU. El stack probado es PyTorch 2.7.0a0 (NVIDIA 25.03), Transformers 4.48.3, mamba-ssm 2.2.4, causal-conv1d 1.2.2.post1 y FlashAttention 2.7.3.

## Capacidades

- Generación de secuencias genómicas de ADN a nivel de carácter (modelo de lenguaje causal sobre genoma).
- Extracción de embeddings de secuencia para tareas downstream de genómica.
- Adaptación mediante fine-tuning y probing para tareas genómicas específicas.
- Base para la variante CENO-P orientada a predicción de efectos de variantes (VEP) mediante puntuación de log-verosimilitud delta entre secuencia wild-type y variante.
- Procesamiento de secuencias largas: el path HF permite hasta 131072 tokens por prefill (single-GPU, sin padding); para prefills mayores se indica el entry de vLLM del repositorio.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible (no es un modelo de propósito general).
- Capacidades multilingües: no aplica; el vocabulario es de bases de ADN codificadas a byte.
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Extracción de embeddings genómicos: usar el modelo como extractor de representaciones de secuencias de ADN para alimentar clasificadores o modelos downstream en tareas como anotación funcional o clasificación de regiones reguladoras.
- Fine-tuning para tareas genómicas específicas: adaptar el checkpoint base mediante fine-tuning supervisado sobre datasets etiquetados de genómica, aprovechando su naturaleza de modelo fundacional y su licencia permisiva.
- Predicción de efectos de variantes (VEP): emplear la variante CENO-P de la familia para puntuar secuencias wild-type frente a variantes mediante delta de log-verosimilitud, siguiendo el ejemplo TraitGym VEP del repositorio de código.
- Generación de secuencias de ADN sintéticas: utilizar la generación causal para producir secuencias candidatas en experimentos de diseño o aumento de datos, con la advertencia de que la corrección numérica no garantiza generación biológicamente funcional ni libre de repeticiones.
- Investigación en modelos de lenguaje para genómica: servir como base de pequeño tamaño (79,3M) para estudiar arquitecturas híbridas Mamba/Attention/MoE aplicadas a secuencias biológicas.
- Prototipado en entornos con recursos limitados: al ser un modelo compacto, permite experimentación en una sola GPU para tareas de probing y evaluación antes de escalar a modelos mayores de la familia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. Con 79,3M parámetros en bfloat16, el peso del modelo ocupa aproximadamente 0,16 GB; el consumo adicional depende de kernels Mamba y del tamaño de prefill.
- GPU recomendadas: no se especifican modelos concretos; se requiere GPU con soporte de kernels CUDA para Mamba. El path HF de precisión es single-GPU.
- Cabe en GPU consumer: previsiblemente sí por tamaño de pesos, aunque no se confirma en la información disponible; se requiere compatibilidad con mamba-ssm, causal-conv1d y FlashAttention.
- Opciones de despliegue: transformers con `trust_remote_code=True` (path HF de precisión, single-GPU, sin padding, máximo 131072 tokens por prefill); vLLM mediante el entry del repositorio de código para prefills mayores. HF y vLLM usan entornos separados.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Arquitectura | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CENO-80M-base | 79,3M | Prefill máximo HF 131072 tokens (contexto nominal no disponible) | Híbrida Mamba/Attention/MoE | Apache-2.0 | Hugging Face (CladeTeam) |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la información proporcionada de datos sobre modelos comparables de la misma categoría (modelos fundacionales de ADN de tamaño similar) para establecer una comparación cuantitativa.

## Limitaciones y advertencias

- Es un checkpoint base de preentrenamiento: no está ajustado para instrucciones ni para tareas específicas; requiere adaptación downstream.
- Las capas Mamba requieren kernels CUDA: la generación y las pasadas forward necesitan GPU; solo la carga de configuración, tokenizador y pesos es segura en CPU.
- El path de precisión HF es single-GPU, sin padding y limitado a 131072 tokens por prefill; para secuencias mayores hay que usar el entry de vLLM.
- La corrección numérica no garantiza generación libre de repeticiones ni biológicamente funcional; las secuencias generadas deben validarse experimentalmente.
- Sesgos conocidos: no disponible.
- Riesgo de alucinación: no disponible de forma específica; al ser un modelo generativo de secuencias, la plausibilidad estadística no implica validez biológica.
- Limitaciones de idioma: no aplica el concepto multilingüe; el vocabulario está restringido a bases de ADN codificadas a byte.
- Restricciones de licencia: Apache-2.0 permite uso comercial; el código incluido deriva de Nemotron-H de NVIDIA (Apache-2.0) y el tokenizador de Evo2 (Apache-2.0), con atribución en los ficheros `LICENSE` y `NOTICE`.
- Entornos separados para HF y vLLM; versiones de dependencias probadas específicas (PyTorch 2.7.0a0, Transformers 4.48.3, mamba-ssm 2.2.4, causal-conv1d 1.2.2.post1, FlashAttention 2.7.3).

## Enlaces

- Hugging Face: https://huggingface.co/CladeTeam/CENO-80M-base
- Repositorio de código CENO: https://github.com/CladeTeam/CENO
- Paper: no disponible
- Blog: no disponible
- Demo: no disponible (se menciona una demo de generación en el repositorio de código)
