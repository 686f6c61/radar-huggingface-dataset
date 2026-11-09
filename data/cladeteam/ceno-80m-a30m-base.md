# CladeTeam/CENO-80M-A30M-base

## Resumen

CENO-80M-A30M-base es el checkpoint de preentrenamiento base del modelo fundacional de ADN CENO, desarrollado por CladeTeam. Se trata de un modelo de lenguaje causal sobre secuencia genómica construido sobre una columna vertebral híbrida Mamba / Attention / Mixture-of-Experts (arquitectura Nemotron-H), que no requiere alineamientos múltiples de secuencia (MSA) como entrada. Con 79,29 millones de parámetros totales y 8 expertos con enrutamiento top-2, está diseñado para generación de secuencias genómicas y extracción de embeddings, así como para adaptación posterior (fine-tuning, probing) en tareas de genómica.

El modelo emplea un tokenizador a nivel de carácter que mapea las bases de ADN a sus códigos ASCII de byte, con un vocabulario de 512 entradas. La arquitectura consta de 9 capas ocultas con tamaño oculto de 512, 8 cabezas de atención y tamaño intermedio de 2048. Los pesos se distribuyen en bfloat16 y el repositorio ocupa 0,2 GB, lo que lo sitúa como un modelo compacto orientado a investigación y experimentación en genómica computacional.

Su relevancia actual radica en la familia CENO, que incluye checkpoints base (generación y embeddings) y checkpoints MSA (predicción de efectos de variantes mediante delta de log-verosimilitud). El código del modelo, el pipeline VEP y una demo de generación están disponibles en el repositorio complementario de GitHub, y el checkpoint es cargable de forma autónoma con `trust_remote_code=True`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida Mamba / Attention / Mixture-of-Experts (Nemotron-H) |
| Parametros totales | 79.290.560 (79,3M) |
| Parametros activos | Top-2 de 8 expertos por token (número exacto de parámetros activos no disponible) |
| Longitud de contexto | No disponible en la model card; la ruta HF permite hasta 131.072 tokens por prefill |
| Tipos de cuantizacion | No disponible (pesos en bfloat16) |
| Idiomas soportados | No disponible (modelo sobre secuencia genómica, no lenguaje natural) |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

La columna vertebral es una arquitectura híbrida Nemotron-H que combina capas Mamba, atención y mezcla de expertos (MoE). El modelo tiene 9 capas ocultas, tamaño oculto de 512, 8 cabezas de atención y tamaño intermedio de 2048. La capa MoE cuenta con 8 expertos con enrutamiento top-2 por token. El tokenizador es a nivel de carácter, derivado del `CharLevelTokenizer` de Evo2 (Arc Institute, Apache-2.0), y mapea las bases de ADN a sus códigos ASCII de byte con un vocabulario de 512 entradas.

El checkpoint corresponde a la etapa 2 de preentrenamiento base. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO. El código del modelo está incluido en el repositorio y deriva de la implementación de Nemotron-H de NVIDIA en Hugging Face (Apache-2.0). Las capas Mamba requieren kernels CUDA, por lo que las pasadas forward y la generación necesitan GPU; la configuración, el tokenizador y la carga de pesos son seguros en CPU.

## Capacidades

- Generación de secuencias genómicas de ADN a nivel de carácter.
- Extracción de embeddings de secuencia para tareas downstream de genómica.
- Adaptación posterior mediante fine-tuning y probing para tareas genómicas específicas.
- Modelo de lenguaje causal sobre secuencia genómica, sin necesidad de entradas MSA.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no aplicable (modelo sobre ADN, no lenguaje natural).
- Capacidades especiales: arquitectura híbrida Mamba/Attention/MoE; prefill de hasta 131.072 tokens en la ruta HF (prefills mayores requieren la entrada vLLM del repositorio).

## Casos de uso

- Generación de secuencias genómicas sintéticas: el modelo puede generar secuencias de ADN carácter a carácter, útil para aumentar datasets genómicos o explorar distribuciones de secuencia en investigación.
- Extracción de embeddings para clasificación de secuencias: los embeddings del modelo pueden alimentar clasificadores downstream para tareas como identificación de regiones regulatorias o elementos funcionales.
- Fine-tuning para tareas genómicas específicas: al ser un checkpoint base, puede adaptarse mediante fine-tuning supervisado a tareas concretas de genómica computacional.
- Probing de representaciones: las representaciones internas pueden analizarse con sondas lineales para estudiar qué información codifica el modelo sobre estructura y función del ADN.
- Investigación en modelos fundacionales de genómica: sirve como punto de partida para experimentos sobre arquitecturas híbridas Mamba/MoE aplicadas a secuencias biológicas.
- Preentrenamiento comparativo a pequeña escala: su tamaño compacto (79,3M parámetros, repo de 0,2 GB) permite experimentar con recetas de entrenamiento en genómica con recursos limitados.
- Base para el pipeline VEP de la familia CENO: aunque la predicción de efectos de variantes se asocia a los checkpoints MSA (`CENO-P-*`), este checkpoint base forma parte del ecosistema CENO documentado en el repositorio de código.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 79,3M parámetros en bfloat16 los pesos ocupan aproximadamente 0,16 GB, aunque los kernels Mamba y el estado de inferencia añaden overhead no cuantificado en la información disponible.
- GPU recomendadas: no disponible; se requiere una GPU CUDA para forward y generación (kernels Mamba).
- ¿Cabe en consumer GPU? No disponible de forma explícita, pero por tamaño de parámetros es plausible en GPUs consumer con soporte CUDA; no confirmado en la información proporcionada.
- Opciones de despliegue: Hugging Face Transformers con `trust_remote_code=True`; entrada vLLM en el repositorio para prefills superiores a 131.072 tokens. Entorno probado: PyTorch 2.7.0a0 (NVIDIA 25.03), Transformers 4.48.3, mamba-ssm 2.2.4, causal-conv1d 1.2.2.post1 y FlashAttention 2.7.3. HF y vLLM usan entornos separados.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Arquitectura | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CENO-80M-A30M-base | 79,3M | No disponible (prefill HF hasta 131.072 tokens) | Híbrida Mamba/Attention/MoE | Apache-2.0 | Hugging Face |
| CENO-1.3B-A450M-1m | No disponible (denominación sugiere 1,3B totales / 450M activos) | 1M (evidencia de referencia larga) | Híbrida Mamba/Attention/MoE | No disponible | Referenciado en la model card |
| CENO-80M-base | No disponible | 4.096 (según free2aitools) | No disponible | No disponible | Hugging Face |

No se dispone de datos de benchmarks para establecer comparaciones de rendimiento con alternativas.

## Limitaciones y advertencias

- La corrección numérica no garantiza generación libre de repeticiones ni biológicamente funcional (advertencia explícita del autor).
- Las capas Mamba requieren kernels CUDA: forward y generación no funcionan en CPU.
- La ruta de precisión HF es de una sola GPU, sin padding, y admite como máximo 131.072 tokens por prefill; para prefills mayores debe usarse la entrada vLLM del repositorio.
- Las referencias Megatron CP no son intercambiables entre sí.
- La evidencia de contexto largo de 1M pertenece a CENO-1.3B-A450M-1m; las comprobaciones cortas multi-tamaño no implican la misma cobertura larga para todos los modelos.
- CPU, FP32 explícito y atención eager explícita no están cubiertos por la afirmación de referencia bit a bit en BF16.
- No se dispone de información sobre sesgos, riesgo de alucinación en el dominio biológico ni limitaciones idiomáticas (no aplica lenguaje natural).
- Licencia Apache-2.0: permite uso comercial, pero debe conservarse la atribución indicada en los archivos `LICENSE` y `NOTICE` (código derivado de Nemotron-H de NVIDIA y tokenizador derivado de Evo2 de Arc Institute).
- Modelo base sin ajuste instructivo ni de seguridad: no está alineado para uso conversacional ni para decisiones clínicas.

## Enlaces

- Hugging Face: https://huggingface.co/CladeTeam/CENO-80M-A30M-base
- Repositorio de código CENO: https://github.com/CladeTeam/CENO
- Ficha en Free2AITools: https://free2aitools.com/model/cladeteam/ceno-80m-base
- Checkpoint relacionado: https://huggingface.co/CladeTeam/CENO-80M-base
