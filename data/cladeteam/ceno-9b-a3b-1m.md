# CladeTeam/CENO-9B-A3B-1m

## Resumen

CENO-9B-A3B-1m es el checkpoint de contexto largo (1 millón de tokens) del modelo fundacional de ADN CENO, desarrollado por CladeTeam. Se trata de un modelo de lenguaje causal sobre secuencia genómica construido sobre una columna vertebral híbrida Mamba / Attention / Mixture-of-Experts heredada de la arquitectura Nemotron-H de NVIDIA, sin entradas de alineamiento múltiple de secuencias (MSA). Con 8.928.624.080 parámetros totales y precisión bfloat16, está pensado como modelo base para generación de secuencias genómicas y extracción de embeddings.

El modelo emplea un tokenizador a nivel de carácter que mapea las bases de ADN a sus códigos ASCII de byte, con un vocabulario de solo 512 entradas. La arquitectura tiene 42 capas ocultas, tamaño oculto de 2560, 20 cabezas de atención, tamaño intermedio de 10240 y 8 expertos MoE con top-2 por token. Este checkpoint corresponde a la etapa 4 de entrenamiento (extensión de contexto largo) y se entrenó con una longitud de secuencia de 1.048.576 tokens.

Su relevancia radica en que combina la eficiencia de las capas Mamba (que no imponen una ventana de contexto fija) con el enrutamiento MoE, lo que permite procesar secuencias genómicas muy largas con un coste computacional de activación reducido. El código del modelo está incluido en el repositorio y es cargable de forma autónoma con `trust_remote_code=True`, lo que facilita su uso sin dependencias externas del repositorio de código.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida Mamba / Attention / Mixture-of-Experts (Nemotron-H) |
| Parametros totales | 8.928.624.080 (8,9B) |
| Parametros activos | 2 de 8 expertos por token (top-2); total de parámetros activos no disponible |
| Longitud de contexto | Entrenado a 1.048.576 tokens; sin ventana fija por diseño Mamba |
| Tipos de cuantizacion | No disponible (checkpoint en bfloat16) |
| Idiomas soportados | No disponible (modelo de secuencia genómica, no de lenguaje natural) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La columna vertebral es un híbrido Mamba / Attention / Mixture-of-Experts basado en la arquitectura Nemotron-H. Cuenta con 42 capas ocultas, tamaño oculto de 2560, 20 cabezas de atención y tamaño intermedio de 10240. La capa MoE dispone de 8 expertos con enrutamiento top-2 por token. El tokenizador es a nivel de carácter (`CENOCharLevelTokenizer`), derivado del `CharLevelTokenizer` de Evo2 del Arc Institute, y mapea las bases de ADN a sus códigos ASCII de byte con un vocabulario de 512 entradas. La clase de modelo es `CENOForCausalLM` (`model_type: ceno`).

Este checkpoint corresponde a la etapa 4 del entrenamiento (extensión de contexto largo) y se entrenó con una longitud de secuencia de 1.048.576 tokens. El autor indica que la arquitectura Mamba / Attention / MoE no tiene una ventana de contexto fija, por lo que `max_position_embeddings` en `config.json` es nominal y no restrictivo. No se especifican en la información disponible el número total de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO. El código del modelo está incluido en el repositorio y deriva de la implementación de Nemotron-H de NVIDIA en Hugging Face (Apache-2.0).

## Capacidades

- Generación de secuencias genómicas de ADN mediante modelado de lenguaje causal a nivel de carácter.
- Extracción de embeddings de secuencia genómica para tareas posteriores (probing, adaptación).
- Procesamiento de contexto muy largo (entrenado a 1M de tokens) sin ventana fija por el diseño Mamba.
- Adaptación posterior mediante fine-tuning para tareas genómicas.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no aplicable (modelo de secuencia genómica, no de lenguaje natural).
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Generación de secuencias genómicas sintéticas: el modelo puede generar secuencias de ADN carácter a carácter, útil para aumento de datos o exploración de regiones genómicas, aprovechando su tokenizador a nivel de base.
- Extracción de embeddings para genómica: las representaciones internas del modelo pueden usarse como features para clasificación de regiones genómicas, predicción de elementos regulatorios o clustering de secuencias, mediante probing o fine-tuning.
- Adaptación a tareas genómicas concretas: fine-tuning del checkpoint base sobre datasets etiquetados para tareas como predicción de función de secuencia o anotación de variantes.
- Modelado de contexto genómico largo: gracias a su entrenamiento a 1M de tokens y la ausencia de ventana fija en la arquitectura Mamba, puede procesar regiones genómicas extensas o múltiples genes en una sola pasada.
- Investigación en modelos fundacionales de ADN: como checkpoint base de la familia CENO, sirve para estudiar el comportamiento de arquitecturas híbridas Mamba/MoE sobre secuencias biológicas.
- Base para pipelines de predicción de efecto de variantes: aunque la predicción de efecto de variantes (VEP) se asocia a los checkpoints MSA (`CENO-P-*`), este checkpoint base puede adaptarse para scoring de secuencias wild-type frente a variantes mediante delta de log-verosimilitud.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint en bfloat16 ocupa aproximadamente 17,9 GB en disco, por lo que la inferencia en bf16 requiere del orden de 18 GB de VRAM más memoria para activaciones y caché; no se dispone de cifras oficiales de VRAM.
- GPU recomendadas: se requiere GPU CUDA, ya que las capas Mamba necesitan kernels CUDA para forward passes y generación. No se especifican modelos concretos de GPU en la información disponible.
- Cabe en consumer GPU: no confirmado; el tamaño en bf16 (~18 GB) supera la VRAM de la mayoría de GPUs de consumo, aunque no se dispone de datos de cuantización para reducir el footprint.
- Opciones de despliegue: Hugging Face Transformers con `trust_remote_code=True`; el autor indica que HF y vLLM usan entornos separados, lo que sugiere soporte de vLLM. Stack probado: PyTorch 2.7.0a0 (NVIDIA 25.03), Transformers 4.48.3, mamba-ssm 2.2.4, causal-conv1d 1.2.2.post1 y FlashAttention 2.7.3.
- Latencia y throughput estimados: no disponible.
- Nota: config, tokenizador y carga de pesos son seguros en CPU; solo el forward y la generación requieren GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Arquitectura | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CENO-9B-A3B-1m | 8,9B | 1.048.576 tokens (entrenamiento) | Mamba/Attention/MoE híbrida | Apache-2.0 | Hugging Face |
| Evo2 (Arc Institute) | No disponible | No disponible | No disponible | No disponible | Hugging Face (tokenizador derivado) |
| Nemotron-H (NVIDIA) | No disponible | No disponible | Mamba/Attention/MoE híbrida | Apache-2.0 (implementación) | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada. La comparativa se limita a la relación arquitectónica y de licencia.

## Limitaciones y advertencias

- El modelo es un modelo fundacional de ADN, no un modelo de lenguaje natural; no debe esperarse comportamiento conversacional ni multilingüe.
- El autor advierte que la corrección numérica no garantiza una generación libre de repeticiones ni biológicamente funcional.
- Las capas Mamba requieren kernels CUDA, por lo que la inferencia no es posible en CPU para forward passes ni generación.
- No se especifican sesgos conocidos, riesgo de alucinación en el sentido de lenguaje natural, ni limitaciones de idioma; al operar sobre secuencias genómicas, los riesgos se refieren a la plausibilidad biológica de las secuencias generadas.
- Licencia Apache-2.0: permite uso comercial, pero el código del modelo deriva de la implementación de Nemotron-H de NVIDIA (Apache-2.0) y el tokenizador de Evo2 del Arc Institute (Apache-2.0); deben conservarse los archivos `LICENSE` y `NOTICE` con la atribución completa.
- No se dispone de información sobre cuantización, por lo que las opciones de despliegue en hardware limitado no están documentadas.
- El checkpoint corresponde a la etapa 4 (extensión de contexto largo); para tareas de predicción de efecto de variantes el autor remite a los checkpoints MSA (`CENO-P-*`).

## Enlaces

- Hugging Face: https://huggingface.co/CladeTeam/CENO-9B-A3B-1m
- Repositorio de código CENO: https://github.com/CladeTeam/CENO
- Implementación de Nemotron-H de NVIDIA (referencia del código): no disponible
- Evo2 del Arc Institute (origen del tokenizador): no disponible
