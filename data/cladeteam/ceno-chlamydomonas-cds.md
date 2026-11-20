# CladeTeam/CENO-chlamydomonas-cds

## Resumen

CENO-chlamydomonas-cds es un ajuste fino (finetune) de una época del modelo base CENO-base-1b-preview, desarrollado por CladeTeam. Se trata de un modelo de lenguaje de ADN (DNA language model) de tipo causal, derivado de la arquitectura híbrida Nemotron-H de NVIDIA (que combina capas Transformer con capas de espacio de estados Mamba). El modelo tiene 1.302.429.280 parámetros (aproximadamente 1,3 mil millones) y se ha entrenado para modelar las secuencias codificantes (CDS, coding sequences) del alga verde unicelular *Chlamydomonas reinhardtii*.

El propósito declarado por el autor es reproducir experimentos de puntuación de secuencias HTT/polyQ: el modelo produce log-verosimilitudes medias por secuencia que sirven como puntuaciones de plausibilidad del modelo de lenguaje, no como medidas de fitness biológico ni de patogenicidad. Es relevante para investigadores que trabajan en genómica computacional, modelado de proteínas y evaluación de variantes de repetición de poliglutamina, ya que ofrece un checkpoint ligero (2,6 GB) con licencia Apache-2.0 y ejecutable en pila Transformers con código remoto incluido.

La ficha describe un checkpoint de investigación con contexto de entrenamiento de 8192 tokens, tokenizador a nivel de carácter y un contrato de inferencia específico que depende de la pila Mamba/Triton de Nemotron-H, con opción de usar el fallback Mamba en PyTorch puro.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida Transformer + Mamba (derivada de NVIDIA Nemotron-H) |
| Parametros totales | 1.302.429.280 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 8192 tokens (max_length de entrenamiento) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | dna (secuencias de ADN) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (model.safetensors) |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura CENO, que el autor describe como una derivación de Nemotron-H (Apache-2.0) con código remoto de Transformers renombrado (`configuration_ceno.py`, `modeling_ceno.py`). Nemotron-H es una arquitectura híbrida que intercala capas Transformer con capas de espacio de estados Mamba; el código depende de PyTorch y de la pila Mamba/Triton. El `config.json` incluido fija `use_mamba_kernels=false`, lo que activa el fallback Mamba en PyTorch puro y evita la instalación de `mamba-ssm`/`causal-conv1d` para cargar el modelo. El tokenizador es a nivel de carácter (`CENOCharLevelTokenizer`), coherente con el dominio de secuencias de ADN.

El ajuste fino se realizó durante una época sobre CDS de *Chlamydomonas reinhardtii*, con `learning_rate=5e-5`, `effective_batch_size=64`, precisión bf16, `max_length=8192` y 8 GPUs. Las métricas de entrenamiento reportadas indican `train_loss=9.5529` y `eval_loss=1.1433`, con una única entrada de época en `epoch_losses` (epoch ≈ 0.997). No se detalla la composición exacta del dataset, el número de tokens de entrenamiento ni si se aplicaron etapas de RLHF/DPO; tampoco se documentan innovaciones adicionales como decodificación especulativa o atención lineal más allá de la arquitectura híbrida heredada.

## Capacidades

- Generación de texto sobre secuencias de ADN: modelado causal de nucleótidos con tokenizador a nivel de carácter.
- Puntuación de secuencias: cálculo de log-verosimilitud media por secuencia, orientado a experimentos HTT/polyQ.
- Modelado de CDS de *Chlamydomonas reinhardtii*: especializado en regiones codificantes de este organismo.
- Contexto de hasta 8192 tokens, adecuado para secuencias génicas de longitud moderada.
- Carga mediante `AutoModelForCausalLM` y `AutoTokenizer` con `trust_remote_code=True`.
- Compatibilidad con endpoints (tag `endpoints_compatible`).
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo de razonamiento (thinking mode); estas capacidades no están disponibles según la información proporcionada.

## Casos de uso

- Puntuación de variantes de repetición polyQ: usar el modelo para calcular log-verosimilitudes medias de secuencias HTT con distinto número de repeticiones CAG, comparando puntuaciones entre variantes en el contexto del experimento original.
- Filtrado de secuencias codificantes sintéticas: evaluar la plausibilidad de CDS generadas o diseñadas para *Chlamydomonas reinhardtii* descartando aquellas con baja verosimilitud bajo el modelo.
- Análisis de regiones codificantes en genomas de algas: puntuar marcos abiertos de lectura y detectar secuencias atípicas mediante perplejidad por posición.
- Reproducción de experimentos publicados: replicar los flujos de puntuación HTT/polyQ descritos por el autor usando el checkpoint y el código del repositorio GitHub CladeTeam/CENO.
- Evaluación comparativa de modelos de ADN: servir como checkpoint especializado de referencia (1,3B parámetros, contexto 8192) frente a modelos de lenguaje de ADN generalistas en tareas de scoring de CDS.
- Investigación en genómica computacional: estudiar sesgos y representaciones internas del modelo sobre secuencias codificantes de un organismo modelo unicelular.
- Prototipado en entornos con recursos limitados: el peso de 2,6 GB y el fallback Mamba en PyTorch puro permiten cargar el modelo sin kernels CUDA especializados, facilitando pruebas en estaciones de trabajo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Las únicas métricas reportadas son de entrenamiento: `train_loss=9.5529` y `eval_loss=1.1433` para una época sobre CDS de *Chlamydomonas reinhardtii*.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 1,3B parámetros en bf16 el peso ocupa aproximadamente 2,6 GB, y en fp32 aproximadamente 5,2 GB, más memoria para activaciones y caché según la longitud de contexto.
- GPU recomendadas: no especificadas por el autor; el entrenamiento se realizó con 8 GPUs (modelo no indicado).
- Compatibilidad con GPU de consumo: no confirmada oficialmente; por tamaño, un checkpoint de 1,3B en bf16 es compatible con GPUs de consumo con suficiente VRAM, pero no hay validación publicada.
- Opciones de despliegue: Transformers con `trust_remote_code=True`; el autor indica que HF y vLLM usan entornos separados, por lo que vLLM es una vía contemplada. No se mencionan llama.cpp, Ollama ni TGI.
- Pila probada: PyTorch 2.7.0a0 (NVIDIA 25.03), Transformers 4.48.3, mamba-ssm 2.2.4, causal-conv1d 1.2.2.post1 y FlashAttention 2.7.3.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Arquitectura | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CENO-chlamydomonas-cds | 1.302.429.280 | 8192 | Híbrida Transformer + Mamba | apache-2.0 | Hugging Face (CladeTeam) |
| CENO-base-1b-preview | no disponible | no disponible | Híbrida Transformer + Mamba (base) | apache-2.0 (según modelo derivado) | Hugging Face (CladeTeam) |
| Nemotron-H (upstream) | no disponible | no disponible | Híbrida Transformer + Mamba | apache-2.0 | NVIDIA / Hugging Face |

No se dispone de datos de benchmarks comparativos entre estos modelos en la información proporcionada; la comparación se limita a arquitectura, licencia y disponibilidad.

## Limitaciones y advertencias

- Las puntuaciones de log-verosimilitud reflejan la plausibilidad del modelo de lenguaje, no el fitness biológico ni la patogenicidad de una secuencia.
- El modelo está especializado en CDS de *Chlamydomonas reinhardtii*; su rendimiento fuera de este organismo o en regiones no codificantes no está documentado.
- El tokenizador a nivel de carácter implica secuencias más largas en tokens, consumiendo contexto rápidamente en genes extensos.
- La corrección numérica no garantiza generaciones libres de repeticiones ni funcionalmente plausibles a nivel biológico (advertencia explícita del autor).
- El modelo base es un checkpoint "preview"; la procedencia del post-entrenamiento no se infiere del nombre ni se sustituye por perfiles desconocidos.
- Dependencia de código remoto (`trust_remote_code=True`) y de la pila Mamba/Triton; el fallback en PyTorch puro puede afectar el rendimiento.
- Riesgo de alucinación inherente a modelos generativos causales, aplicable aquí como generación de secuencias de ADN no realistas.
- Sesgos de representación derivados del dataset de entrenamiento (CDS de un único organismo y composición no documentada).
- Licencia Apache-2.0 permisiva para uso comercial, pero el uso previsto declarado es la reproducción de experimentos de investigación; no hay garantías de idoneidad para aplicaciones clínicas o diagnósticas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/CladeTeam/CENO-chlamydomonas-cds
- Modelo base: https://huggingface.co/CladeTeam/CENO-base-1b-preview
- Repositorio GitHub del proyecto: https://github.com/CladeTeam/CENO
- Nemotron-H (NVIDIA, arquitectura upstream): no disponible en la información proporcionada.
