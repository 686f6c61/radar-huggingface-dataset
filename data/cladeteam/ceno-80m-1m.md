# CladeTeam/CENO-80M-1m

## Resumen

CENO-80M-1m es un checkpoint de contexto largo del modelo fundacional de ADN CENO, desarrollado por CladeTeam. Se trata de un modelo de lenguaje causal sobre secuencia genómica construido sobre una columna vertebral híbrida Mamba / Attention / Mixture-of-Experts, siguiendo la arquitectura Nemotron-H. Con 79,3 millones de parámetros totales, está entrenado a una longitud de contexto de 1.048.576 tokens, lo que lo sitúa en la categoría de modelos genómicos de contexto muy largo.

El modelo resuelve el problema de modelar secuencias de ADN a escalas que superan con creces las ventanas típicas de los transformers estándar. Al combinar capas Mamba (state space model), atención y MoE, la arquitectura no impone una ventana de contexto fija: la longitud de entrenamiento es una referencia, no un límite duro. Esto lo hace relevante para tareas genómicas donde las dependencias de largo alcance (regiones reguladoras, estructura de genes completos) son críticas.

Es un checkpoint base (no específico de predicción de efectos de variantes) pensado para generación de secuencia genómica y extracción de embeddings, así como para adaptación posterior mediante fine-tuning o probing. Se distribuye bajo licencia Apache-2.0 y es cargable de forma autónoma con `trust_remote_code=True`, ya que el código del modelo va incluido en el repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida Mamba / Attention / Mixture-of-Experts (Nemotron-H) |
| Parametros totales | 79.290.560 (79,3M) |
| Parametros activos | 8 expertos MoE, top-2 por token (parámetros activos no disponibles) |
| Longitud de contexto | 1.048.576 tokens de entrenamiento (sin ventana fija por diseño) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (secuencia genómica; tokenizador a nivel de carácter/byte) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (repo de 0,2 GB), precisión bfloat16 |

## Arquitectura y entrenamiento

La columna vertebral es una arquitectura híbrida Mamba / Attention / Mixture-of-Experts (Nemotron-H). El modelo tiene 9 capas ocultas, tamaño oculto de 512, 8 cabezas de atención, tamaño intermedio de 2048 y 8 expertos MoE con enrutamiento top-2 por token. El vocabulario es de 512 entradas, con un tokenizador a nivel de carácter que mapea las bases de ADN a sus códigos ASCII de byte. La clase de modelo es `CENOForCausalLM` y el `model_type` es `ceno`.

Este checkpoint corresponde a la etapa 4 de entrenamiento (extensión de contexto largo), entrenado a 1.048.576 tokens. Al tratarse de un modelo base, la model card no detalla el volumen total de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO. La innovación técnica destacable es la combinación de capas Mamba (que no imponen una ventana de contexto fija) con atención y MoE, lo que permite manejar secuencias genómicas muy largas. El código del modelo deriva de la implementación de Nemotron-H de NVIDIA en Hugging Face, y el tokenizador deriva del `CharLevelTokenizer` de Evo2 del Arc Institute, ambos bajo Apache-2.0.

## Capacidades

- Generación de secuencia genómica (ADN) de forma autorregresiva.
- Extracción de embeddings de secuencias genómicas para tareas posteriores.
- Modelado de dependencias de largo alcance gracias a la arquitectura sin ventana de contexto fija.
- Adaptación posterior mediante fine-tuning y probing para tareas genómicas.
- Soporte de contexto de hasta 1.048.576 tokens en entrenamiento (prefill máximo de 131.072 tokens por pasada en la ruta de precisión de Hugging Face; el repositorio ofrece una entrada vLLM para prefills mayores).
- Tokenización a nivel de carácter/byte sobre bases de ADN.
- No dispone de tool calling, capacidades de agente, visión, audio ni modo thinking según la información disponible.

## Casos de uso

- Generación de secuencias genómicas sintéticas: el modelo puede generar tramos de ADN autorregresivamente, útil para aumentar datasets o explorar regiones plausibles bajo el modelo aprendido.
- Extracción de embeddings para clasificación genómica: se pueden obtener representaciones de secuencias largas para alimentar clasificadores de regiones reguladoras, promotores o elementos funcionales.
- Fine-tuning para tareas genómicas específicas: al ser un checkpoint base, sirve como punto de partida para adaptar a tareas concretas mediante ajuste supervisado o probing.
- Modelado de contextos genómicos extensos: gracias a su entrenamiento a 1M de tokens, puede capturar dependencias entre regiones distantes de un mismo locus en una sola pasada.
- Investigación en modelos de lenguaje de ADN: útil para estudiar el comportamiento de arquitecturas híbridas Mamba/Attention/MoE sobre secuencias biológicas.
- Preentrenamiento de pipelines de VEP (predicción de efectos de variantes): aunque el checkpoint específico de VEP es la familia `CENO-P-*`, este modelo base puede servir para construir flujos de puntuación por log-verosimilitud diferencial tras adaptación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo de 79,3M de parámetros en bfloat16, los pesos ocupan aproximadamente 0,16 GB; con overhead de activaciones y kernels, cabe holgadamente en cualquier GPU consumer moderna.
- GPU recomendadas: cualquier GPU NVIDIA con soporte CUDA para los kernels de Mamba (el forward y la generación requieren GPU). No se especifican modelos concretos en la información disponible.
- Cabe en GPU consumer: sí, por tamaño; la limitación es la necesidad de kernels CUDA de Mamba, no la VRAM.
- Opciones de despliegue: Hugging Face `transformers` con `trust_remote_code=True` (ruta de precisión single-GPU, sin padding, máximo 131.072 tokens por prefill) y una entrada vLLM mantenida en el repositorio para prefills mayores. No se mencionan llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponibles.
- Stack probado: PyTorch 2.7.0a0 (NVIDIA 25.03), Transformers 4.48.3, mamba-ssm 2.2.4, causal-conv1d 1.2.2.post1 y FlashAttention 2.7.3. HF y vLLM usan entornos separados.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Arquitectura | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CENO-80M-1m | 79,3M | 1.048.576 (entrenamiento) | Mamba/Attention/MoE híbrida | Apache-2.0 | Hugging Face |
| Evo2 (Arc Institute) | no disponible | no disponible | no disponible | Apache-2.0 (tokenizador derivado) | no disponible |
| Nemotron-H (NVIDIA) | no disponible | no disponible | Mamba/Attention/MoE híbrida | Apache-2.0 (código base) | no disponible |

La información proporcionada no incluye datos de rendimiento ni especificaciones completas de los modelos comparables; la comparación se limita a la relación arquitectónica y de licencia documentada en la model card.

## Limitaciones y advertencias

- Modelo base: no está ajustado para tareas concretas ni para seguir instrucciones; requiere adaptación para uso en producción.
- Riesgo de generación biológicamente no funcional: la model card advierte explícitamente que la corrección numérica no garantiza una generación libre de repeticiones ni biológicamente funcional.
- Sesgos: no documentados en la información disponible; al entrenarse sobre secuencias genómicas, puede reflejar sesgos de composición del dataset de entrenamiento.
- Limitaciones de contexto: aunque el diseño no impone ventana fija, la ruta de precisión de Hugging Face permite como máximo 131.072 tokens por prefill; para secuencias mayores hay que usar la entrada vLLM del repositorio.
- Requisito de GPU: los kernels de Mamba exigen CUDA, por lo que el forward y la generación no funcionan en CPU (solo la carga de configuración, tokenizador y pesos es segura en CPU).
- Licencia: Apache-2.0 permite uso comercial, pero el código incluido deriva de Nemotron-H (NVIDIA) y el tokenizador de Evo2 (Arc Institute); deben respetarse los ficheros `LICENSE` y `NOTICE` de atribución.
- Idiomas: no aplica; el modelo opera sobre secuencia genómica, no sobre lenguaje natural.

## Enlaces

- Hugging Face: https://huggingface.co/CladeTeam/CENO-80M-1m
- Repositorio de código CENO: https://github.com/CladeTeam/CENO
