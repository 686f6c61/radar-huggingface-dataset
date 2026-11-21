# CladeTeam/CENO-P-300M

## Resumen

CENO-P-300M es un checkpoint de 307,5 millones de parámetros perteneciente a la familia CENO de modelos fundacionales de ADN, desarrollado por CladeTeam. Se trata de la variante post-entrenada con alineamiento multi-especie (MSA) del modelo base CENO de 300M, especializada en predicción de efectos de variantes (VEP, *variant effect prediction*). A diferencia de los checkpoints base, que se orientan a generación de secuencias genómicas y extracción de embeddings, este checkpoint incorpora una ruta de puntuación MSA que consume un `seq_idx` por token para evaluar entradas MSA empaquetadas.

El modelo emplea una arquitectura híbrida Mamba / Attention / Mixture-of-Experts inspirada en Nemotron-H, con 9 capas ocultas, tamaño oculto de 1024, 8 cabezas de atención y 8 expertos con top-2 por token. El tokenizador es de nivel de carácter (vocabulario de 512), mapeando bases de ADN a sus códigos ASCII. Esta elección de tokenización evita problemas de fragmentación en secuencias genómicas y permite manejar cualquier alfabeto de nucleótidos sin ambigüedad.

Su relevancia actual radica en la aplicación de arquitecturas eficientes (Mamba, MoE) al dominio genómico, un área donde los transformers densos resultan costosos para contextos largos. El modelo se distribuye bajo licencia Apache-2.0, con código embebido en el repositorio y cargable mediante `trust_remote_code=True`. Requiere GPU con kernels CUDA de Mamba para inferencia; la carga de pesos, configuración y tokenizador es segura en CPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida Mamba / Attention / Mixture-of-Experts (Nemotron-H) |
| Parametros totales | 307.503.488 |
| Parametros activos | 8 expertos, top-2 por token (número exacto de parámetros activos no disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (checkpoint publicado en float32) |
| Idiomas soportados | no disponible (modelo de dominio genómico; tokenizador de nivel de carácter sobre bases de ADN) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El backbone es una arquitectura híbrida que combina capas Mamba (modelos de espacio de estados), atención y capas de mezcla de expertos, siguiendo el diseño Nemotron-H. Cuenta con 9 capas ocultas, tamaño oculto de 1024, 8 cabezas de atención e intermediate size de 4096. La capa MoE dispone de 8 expertos con enrutamiento top-2 por token. El tokenizador `CENOCharLevelTokenizer` es de nivel de carácter con vocabulario de 512, derivado del `CharLevelTokenizer` de Evo2 (Arc Institute), y mapea cada base de ADN a su código de byte ASCII.

El checkpoint corresponde a la etapa de post-entrenamiento con MSA orientada a VEP. El modelo lleva `intra_encoding_pattern` en su configuración e incluye la ruta de puntuación MSA (`modeling_ceno_p.py`), que consume un `seq_idx` por token para puntuar entradas MSA empaquetadas. La puntuación VEP se realiza comparando la log-verosimilitud de la secuencia silvestre frente a la variante (delta log-likelihood). No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO. El código del modelo deriva de la implementación de Nemotron-H de NVIDIA en Hugging Face (Apache-2.0).

## Capacidades

- Predicción de efectos de variantes (VEP) mediante puntuación delta de log-verosimilitud entre secuencia silvestre y variante.
- Procesamiento de alineamientos multi-especie (MSA) empaquetados mediante `seq_idx` por token.
- Generación de secuencias genómicas (capacidad heredada de la familia CENO; el checkpoint base la soporta de forma nativa).
- Extracción de embeddings para tareas downstream de genómica (adaptación mediante fine-tuning o probing).
- Tokenización de nivel de carácter sobre bases de ADN, sin fragmentación.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües en el sentido convencional.

## Casos de uso

- Predicción de efectos de variantes en estudios genómicos: el modelo puntúa pares silvestre/variante mediante delta de log-verosimilitud, adecuado para priorizar variantes candidatas en análisis de asociación. Se ejecuta a través del ejemplo TraitGym VEP del repositorio CENO.
- Análisis de alineamientos multi-especie: la ruta MSA con `seq_idx` permite procesar entradas empaquetadas de múltiples especies, útil en estudios de conservación evolutiva.
- Extracción de embeddings genómicos para modelos downstream: los estados ocultos del modelo pueden alimentar clasificadores o regresores en tareas de genómica, aprovechando la adaptación por probing.
- Filtrado de variantes en pipelines de secuenciación: integrable como etapa de scoring en flujos bioinformáticos que requieran priorizar variantes antes de validación experimental.
- Investigación en modelos fundacionales de ADN: el checkpoint sirve como base para experimentar con arquitecturas híbridas Mamba/MoE en dominio genómico, dado su tamaño contenido (307,5M) y licencia permisiva.
- Generación de secuencias genómicas sintéticas (con el checkpoint base CENO): útil en aumento de datos o diseño de secuencias, aunque la model card advierte que la corrección numérica no garantiza generación biológicamente funcional ni libre de repeticiones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint se publica en float32 (307,5M parámetros, aproximadamente 1,2 GB de pesos); en float32 se requieren del orden de 1,3 GB solo para pesos, más memoria de activaciones y caché. No se documentan requisitos exactos.
- GPU recomendadas: no disponible. La model card indica que las capas Mamba requieren kernels CUDA, por lo que la inferencia y la generación necesitan GPU.
- Cabe en GPU de consumo: previsiblemente sí por tamaño de pesos, pero no se confirma en la información disponible; la dependencia de kernels Mamba y FlashAttention condiciona la compatibilidad.
- Opciones de despliegue: Hugging Face Transformers con `trust_remote_code=True`; el stack probado es PyTorch 2.7.0a0 (NVIDIA 25.03), Transformers 4.48.3, mamba-ssm 2.2.4, causal-conv1d 1.2.2.post1 y FlashAttention 2.7.3. Se menciona que HF y vLLM usan entornos separados. No se documentan opciones como llama.cpp u Ollama.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Arquitectura | Licencia | Enfoque |
|---|---|---|---|---|---|
| CENO-P-300M | 307,5M | no disponible | Híbrida Mamba/Attention/MoE | Apache-2.0 | VEP con MSA |
| CENO-300M (base) | ~300M | no disponible | Híbrida Mamba/Attention/MoE | Apache-2.0 | Generación y embeddings de ADN |
| Evo2 (Arc Institute) | no disponible | no disponible | no disponible | Apache-2.0 (tokenizador derivado) | Modelo fundacional genómico |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- La corrección numérica no garantiza generación libre de repeticiones ni biológicamente funcional; la model card lo advierte explícitamente.
- La inferencia y la generación requieren GPU con kernels CUDA de Mamba; no es posible ejecutar forward passes en CPU (solo carga de pesos, configuración y tokenizador).
- El stack de dependencias es específico y frágil (PyTorch 2.7.0a0, mamba-ssm 2.2.4, causal-conv1d 1.2.2.post1, FlashAttention 2.7.3); versiones distintas pueden romper la compatibilidad.
- No se documentan sesgos conocidos, pero al ser un modelo de dominio genómico entrenado sobre datos biológicos, puede heredar sesgos de representación de especies o poblaciones presentes en los datos de entrenamiento (no confirmado en la información disponible).
- Riesgo de alucinación en generación de secuencias: no se garantiza validez biológica de las secuencias generadas.
- No se especifica la longitud de contexto soportada, lo que limita la planificación de despliegues con secuencias largas.
- Licencia Apache-2.0 permite uso comercial, pero el código derivado de Nemotron-H y del tokenizador de Evo2 mantiene atribuciones que deben respetarse (véanse `LICENSE` y `NOTICE`).
- La model card recomienda usar la revisión actualizada del modelo en lugar de archivos de diagnóstico históricos.

## Enlaces

- Hugging Face: https://huggingface.co/CladeTeam/CENO-P-300M
- Repositorio de código CENO: https://github.com/CladeTeam/CENO
- Ejemplo TraitGym VEP: incluido en el repositorio CENO
- Implementación Nemotron-H de NVIDIA (origen del código): no disponible como enlace directo en la información proporcionada
- Tokenizador Evo2 de Arc Institute (origen): no disponible como enlace directo en la información proporcionada
