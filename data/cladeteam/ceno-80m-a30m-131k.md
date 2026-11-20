# CladeTeam/CENO-80M-A30M-131k

## Resumen

CENO-80M-A30M-131k es un modelo fundacional de ADN desarrollado por CladeTeam, un modelo de lenguaje causal sobre secuencia genómica construido sobre una columna vertebral híbrida Mamba / Attention / Mixture-of-Experts (arquitectura Nemotron-H). Con 79,3 millones de parámetros totales, es el checkpoint de contexto largo (131.072 tokens) de la familia CENO, correspondiente a la etapa 3 de entrenamiento (extensión de contexto). No requiere alineamientos múltiples (MSA) como entrada, lo que simplifica su uso frente a modelos genómicos dependientes de MSA.

El modelo resuelve tareas de generación de secuencia genómica y extracción de embeddings sobre ADN, y sirve como base para adaptación posterior (fine-tuning, probing) en tareas genómicas. Su tokenizador es a nivel de carácter (mapeo de bases de ADN a códigos ASCII), con un vocabulario de 512 entradas, y su licencia Apache-2.0 facilita el uso comercial y la investigación. Es relevante ahora por su combinación de contexto muy largo (131k), arquitectura híbrida eficiente en cómputo y tamaño reducido (80M), lo que permite desplegarlo en hardware modesto frente a modelos genómicos de mayor escala.

La familia CENO incluye checkpoints base (generación y embeddings) y checkpoints MSA (CENO-P-*), orientados a predicción de efecto de variantes (VEP) mediante puntuación de log-verosimilitud diferencial entre secuencia wild-type y variante. El código del modelo, el pipeline de VEP y una demo de generación se mantienen en el repositorio complementario de GitHub.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Híbrida Mamba / Attention / Mixture-of-Experts (Nemotron-H) |
| Parámetros totales | 79.290.560 (79,3M) |
| Parámetros activos | 8 expertos, top-2 por token (parámetros activos no disponibles) |
| Longitud de contexto | 131.072 tokens de entrenamiento (sin ventana fija por la arquitectura Mamba/Attention/MoE) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (modelo sobre secuencia genómica, no lenguaje natural) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo emplea una columna vertebral híbrida Mamba / Attention / Mixture-of-Experts basada en la arquitectura Nemotron-H. Cuenta con 9 capas ocultas, tamaño oculto de 512, 8 cabezas de atención y tamaño intermedio de 2048. La capa MoE dispone de 8 expertos con enrutamiento top-2 por token. El tokenizador es a nivel de carácter (byte/char-level), con vocabulario de 512 entradas, que mapea las bases de ADN a sus códigos ASCII. La clase de arquitectura es `CENOForCausalLM` y el `model_type` es `ceno`.

El checkpoint corresponde a la etapa 3 de entrenamiento (extensión de contexto largo) con una longitud de secuencia de 131.072 tokens. La arquitectura Mamba / Attention / MoE no tiene ventana de contexto fija; `max_position_embeddings` en `config.json` es nominal y no restrictivo. No se dispone de información sobre el número total de tokens de entrenamiento, la composición del dataset ni si hubo RLHF/DPO. El código del modelo está incluido en el repositorio y se deriva de la implementación de Nemotron-H de NVIDIA (Apache-2.0); el tokenizador deriva del `CharLevelTokenizer` de Evo2 del Arc Institute (Apache-2.0). Las capas Mamba requieren kernels CUDA, por lo que las pasadas forward y la generación necesitan GPU; la carga de configuración, tokenizador y pesos es segura en CPU.

## Capacidades

- Generación de secuencia genómica (ADN) de forma causal.
- Extracción de embeddings sobre secuencia genómica para tareas downstream.
- Adaptación posterior mediante fine-tuning y probing en tareas genómicas.
- Soporte de contexto largo (entrenado a 131.072 tokens, sin ventana fija por la arquitectura).
- Predicción de efecto de variantes (VEP) mediante puntuación de log-verosimilitud diferencial entre secuencia wild-type y variante (a través de la familia CENO-P-* y el pipeline de VEP del repositorio).
- Carga standalone con `trust_remote_code=True` (código del modelo incluido en el repositorio).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no aplicable (modelo sobre secuencia genómica, no lenguaje natural).
- Capacidades especiales (thinking mode, visión, audio): no disponible.

## Casos de uso

- Extracción de embeddings genómicos: el modelo puede generar representaciones vectoriales de secuencias de ADN para alimentar clasificadores downstream o análisis de similitud, aprovechando su tokenizador a nivel de carácter y su tamaño reducido para procesar lotes grandes.
- Predicción de efecto de variantes (VEP): mediante la puntuación de log-verosimilitud diferencial entre secuencia wild-type y variante, usando el pipeline de VEP del repositorio, adecuado para priorizar variantes en estudios genómicos.
- Generación de secuencia genómica: el modelo puede generar secuencias de ADN de forma causal, útil para exploración de espacios de secuencia y aumentación de datos en investigación genómica.
- Fine-tuning para tareas genómicas específicas: su licencia Apache-2.0 y su tamaño de 80M permiten adaptarlo a tareas concretas (anotación, clasificación de regiones) con recursos de cómputo modestos.
- Análisis de contexto largo en genómica: con 131.072 tokens de entrenamiento y sin ventana fija, puede procesar regiones genómicas extensas en una sola pasada, útil para análisis de elementos reguladores o regiones intergénicas largas.
- Investigación en modelos fundacionales de ADN: sirve como base reproducible para experimentos de arquitecturas híbridas Mamba/Attention/MoE aplicadas a genómica, con código incluido y licencia permisiva.
- Despliegue en hardware modesto: al ser un modelo de 80M en bfloat16, puede ejecutarse en GPU de consumo para prototipado e inferencia, facilitando la experimentación sin infraestructura de gran escala.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 79,3M parámetros en bfloat16, el peso del modelo ocupa aproximadamente 0,16 GB, por lo que la VRAM necesaria es modesta y dominada por las activaciones y el contexto.
- GPU recomendadas: no disponible. Las capas Mamba requieren kernels CUDA, por lo que se necesita GPU NVIDIA compatible con mamba-ssm y causal-conv1d.
- GPU de consumo: no disponible de forma explícita; por tamaño, es plausible su ejecución en GPU de consumo, pero no se confirma en la información.
- Opciones de despliegue: Transformers (con `trust_remote_code=True`), vLLM (entrada del repositorio para prefills mayores), y stack probado con PyTorch 2.7.0a0 (NVIDIA 25.03), Transformers 4.48.3, mamba-ssm 2.2.4, causal-conv1d 1.2.2.post1 y FlashAttention 2.7.3.
- Latencia y throughput: no disponible.
- Restricción de prefill: la ruta de precisión de HF es de una sola GPU, sin padding, y permite como máximo 131.072 tokens por prefill; para prefills mayores se debe usar la entrada vLLM del repositorio.

## Comparativa con modelos similares

No disponible. No se proporcionan datos de benchmarks ni especificaciones de modelos comparables en la información disponible.

## Limitaciones y advertencias

- La corrección numérica no garantiza generación libre de repeticiones ni biológicamente funcional (advertencia explícita del autor).
- Requiere GPU con kernels CUDA para pasadas forward y generación; la carga de configuración, tokenizador y pesos es segura en CPU, pero la inferencia no.
- La ruta de precisión de HF está limitada a una sola GPU, sin padding, y a un máximo de 131.072 tokens por prefill; para prefills mayores se necesita vLLM.
- `max_position_embeddings` es nominal y no restrictivo; la longitud de contexto de entrenamiento (131.072) no es un límite duro, pero el comportamiento más allá de esa longitud no está garantizado.
- Sesgos conocidos: no disponible.
- Riesgo de alucinación: no disponible de forma específica; aplica la advertencia general sobre generación no garantizada como biológicamente funcional.
- Limitaciones de idioma: no aplicable (modelo sobre secuencia genómica); no se documentan idiomas de lenguaje natural.
- Restricciones de licencia: Apache-2.0 permite uso comercial; el código incluido deriva de Nemotron-H de NVIDIA (Apache-2.0) y el tokenizador de Evo2 del Arc Institute (Apache-2.0); consultar `LICENSE` y `NOTICE` para la atribución completa.
- Entornos separados para HF y vLLM; no se garantiza compatibilidad entre ambos stacks.

## Enlaces

- Hugging Face: https://huggingface.co/CladeTeam/CENO-80M-A30M-131k
- Repositorio de código CENO: https://github.com/CladeTeam/CENO
- Implementación Nemotron-H de NVIDIA (referencia del código): no disponible como enlace directo en la información proporcionada
- Tokenizador CharLevelTokenizer de Evo2 (Arc Institute): no disponible como enlace directo en la información proporcionada
