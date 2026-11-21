# CladeTeam/CENO-P-600M

## Resumen

CENO-P-600M es un checkpoint de la familia CENO de modelos fundacionales de ADN, desarrollado por CladeTeam. Se trata de la variante post-entrenada para alineamiento multi-especie (MSA) del modelo base CENO de 600M de parámetros, especializada en predicción de efectos de variantes (VEP, variant effect prediction). El modelo puntúa secuencias salvajes frente a variantes mediante delta de log-verosimilitud, lo que permite estimar el impacto funcional de mutaciones genómicas.

La arquitectura es un híbrido Mamba / Attention / Mixture-of-Experts (8 expertos, top-2 por token) siguiendo el diseño Nemotron-H, con 20 capas ocultas, tamaño oculto de 1024 y 16 cabezas de atención. El tokenizador es a nivel de carácter, mapeando bases de ADN a sus códigos ASCII de byte, con un vocabulario de 512 entradas. El modelo cuenta con 630.794.080 parámetros reales en safetensors y se distribuye en float32.

Su relevancia radica en que aplica arquitecturas eficientes tipo Mamba y MoE al dominio genómico, ofreciendo una alternativa open source (Apache-2.0) para tareas de genómica computacional que normalmente requieren modelos propietarios o pipelines ad hoc. El checkpoint es cargable de forma autónoma con `trust_remote_code=True`, ya que incluye el código del modelo y del tokenizador.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrido Mamba / Attention / Mixture-of-Experts (Nemotron-H) |
| Parametros totales | 630.794.080 (630,8M) |
| Parametros activos | 8 expertos, top-2 por token (número exacto de parámetros activos no disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (checkpoint distribuido en float32) |
| Idiomas soportados | no disponible (modelo de dominio genómico, no lingüístico) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El backbone combina capas Mamba (modelos de espacio de estados), atención y mezcla de expertos, siguiendo la arquitectura Nemotron-H de NVIDIA. El modelo tiene 20 capas ocultas, dimensión oculta de 1024, 16 cabezas de atención y tamaño intermedio de 4096. La capa MoE cuenta con 8 expertos con enrutamiento top-2 por token. El tokenizador es de nivel de carácter (byte/character-level), con vocabulario de 512, que mapea cada base de ADN a su código ASCII de byte; está derivado del `CharLevelTokenizer` de Evo2 (Arc Institute).

El checkpoint es la variante post-entrenada en MSA para VEP: incorpora `intra_encoding_pattern` en su configuración y una ruta de puntuación MSA (`modeling_ceno_p.py`) que consume un `seq_idx` por token para puntuar entradas MSA empaquetadas. No se detalla en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. El código del modelo deriva de la implementación de Nemotron-H en Hugging Face (Apache-2.0) y el tokenizador de Evo2 (Apache-2.0).

## Capacidades

- Puntuación de efectos de variantes (VEP) mediante delta de log-verosimilitud entre secuencia salvaje y variante.
- Procesamiento de alineamientos multi-especie (MSA) empaquetados mediante `seq_idx` por token.
- Generación de secuencias genómicas (capacidad heredada del modelo base CENO).
- Extracción de embeddings para tareas downstream de genómica.
- Adaptación posterior mediante fine-tuning y probing para tareas genómicas.
- Tokenización a nivel de carácter de secuencias de ADN (mapeo base a byte ASCII).
- No soporta tool calling, function calling ni razonamiento multi-paso en el sentido de los modelos de lenguaje generales (no disponible en la información).
- Capacidades multilingües no aplicables: es un modelo de dominio genómico, no lingüístico.

## Casos de uso

- Predicción de efectos de variantes en genómica clínica: el modelo puntúa secuencias salvajes frente a variantes con delta de log-verosimilitud, permitiendo priorizar variantes candidatas en estudios de asociación o diagnóstico. Es adecuado por su post-entrenamiento específico en MSA para VEP.
- Análisis de alineamientos multi-especie: al consumir `seq_idx` por token, puede procesar MSA empaquetados y comparar secuencias ortólogas entre especies para identificar regiones conservadas funcionalmente.
- Filtrado de variantes en pipelines de secuenciación: integrable en flujos bioinformáticos que necesiten una puntuación rápida de impacto funcional antes de validación experimental, gracias a su tamaño contenido (630,8M) y licencia permisiva.
- Extracción de embeddings genómicos: los checkpoints base de la familia permiten obtener representaciones de secuencias de ADN para entrenar clasificadores downstream (probes) en tareas como predicción de elementos reguladores.
- Fine-tuning para tareas genómicas específicas: al ser Apache-2.0 y cargable de forma autónoma, puede adaptarse a dominios concretos (por ejemplo, genomas de especies no incluidas en el entrenamiento original).
- Investigación en modelos fundacionales de ADN: sirve como referencia reproducible para estudiar arquitecturas híbridas Mamba/MoE aplicadas a genómica, con código y pesos abiertos.
- Generación de secuencias genómicas sintéticas: la variante base permite generación de secuencias, útil en experimentos de diseño de secuencias, aunque la model card advierte que la corrección numérica no garantiza generación biológicamente funcional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Las capas Mamba requieren kernels CUDA: las pasadas forward y la generación necesitan GPU. La carga de configuración, tokenizador y pesos es segura en CPU.
- VRAM estimada: el checkpoint en float32 ocupa aproximadamente 2,5 GB (tamaño del repo), por lo que la inferencia en fp32 requiere del orden de 3 GB o más de VRAM contando activaciones; no se dispone de cifras oficiales de VRAM para cuantizaciones.
- GPU recomendadas: no disponible de forma explícita; por tamaño, cabe en GPUs consumer modernas (por ejemplo, RTX 3090/4090 con 24 GB) y en GPUs de datacenter (A100, H100). No se especifican requisitos mínimos oficiales.
- Cabe en GPU consumer: sí, por el tamaño del modelo (630,8M parámetros, ~2,5 GB en fp32); la limitación es la necesidad de kernels CUDA para Mamba, no la VRAM.
- Opciones de despliegue: transformers con `trust_remote_code=True`; el stack probado es PyTorch 2.7.0a0 (NVIDIA 25.03), Transformers 4.48.3, mamba-ssm 2.2.4, causal-conv1d 1.2.2.post1 y FlashAttention 2.7.3. Se menciona que HF y vLLM usan entornos separados. No se detallan opciones como llama.cpp u Ollama.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Arquitectura | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CENO-P-600M | 630,8M | no disponible | Híbrido Mamba/Attention/MoE | Apache-2.0 | Hugging Face + repo GitHub |
| Evo2 (Arc Institute) | no disponible en la informacion | no disponible | no disponible | Apache-2.0 (tokenizador derivado) | no disponible |
| Nemotron-H (NVIDIA) | no disponible en la informacion | no disponible | Híbrido Mamba/Attention/MoE | Apache-2.0 (código base) | no disponible |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada. La comparativa se limita a relaciones de derivación de código y licencia.

## Limitaciones y advertencias

- La corrección numérica no garantiza generación libre de repeticiones ni biológicamente funcional; la model card lo advierte explícitamente.
- Las capas Mamba requieren kernels CUDA, por lo que no es posible la inferencia completa en CPU sin adaptaciones.
- No se especifican sesgos conocidos ni tasas de alucinación; al ser un modelo de dominio genómico, el riesgo de alucinación se traduce en predicciones de efecto de variante no fiables fuera de la distribución de entrenamiento.
- Longitud de contexto no documentada, lo que limita la planificación de pipelines con secuencias largas.
- Idiomas soportados no aplicables; el modelo opera sobre secuencias de ADN, no sobre texto natural.
- Licencia Apache-2.0 permite uso comercial, pero el código derivado de Nemotron-H y del tokenizador de Evo2 requiere mantener la atribución indicada en los ficheros `LICENSE` y `NOTICE`.
- El checkpoint está en float32 y no se documentan cuantizaciones oficiales; el despliegue en producción debe validar el stack (PyTorch 2.7.0a0, Transformers 4.48.3, mamba-ssm 2.2.4) por posibles incompatibilidades.
- La implementación de inferencia actual se mantiene en el repositorio GitHub CladeTeam/CENO; se recomienda usar la revisión actualizada del modelo en lugar de archivos de diagnóstico históricos.

## Enlaces

- Hugging Face: https://huggingface.co/CladeTeam/CENO-P-600M
- Repositorio de código CENO: https://github.com/CladeTeam/CENO
- Ejemplo de VEP en TraitGym: incluido en el repositorio CENO (https://github.com/CladeTeam/CENO)
- Implementación de Nemotron-H en Hugging Face (código base, Apache-2.0): no disponible como enlace directo en la información
- Tokenizador CharLevelTokenizer de Evo2 (Arc Institute, Apache-2.0): no disponible como enlace directo en la información
