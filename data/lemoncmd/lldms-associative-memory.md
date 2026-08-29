# lemoncmd/lldms-associative-memory

## Resumen

`lemoncmd/lldms-associative-memory` es un conjunto de 162 checkpoints de modelos de difusión de lenguaje discreta (UDDM, Uniform-based Discrete Diffusion Models) publicados por el grupo de Bao Pham, Mohammed J. Zaki, Luca Ambrogioni, Dmitry Krotov y Matteo Negri, en el marco del artículo *"Language Diffusion Models are Associative Memories Capable of Retrieving Unseen Data"*, aceptado en EMNLP 2026. El trabajo demuestra que estos modelos se comportan como memorias asociativas (AM) con capacidad creativa emergente, y que existe una transición nítida entre memorización y generalización controlada por el tamaño del conjunto de entrenamiento. Para medir esta transición, los autores proponen la entropía condicional de las secuencias de tokens predichas como sonda práctica.

El repositorio contiene un barrido completo sobre el tamaño del subconjunto de entrenamiento de LM1B: tres tamaños de modelo (tiny, small y medium) × 54 fracciones del corpus, desde 0.01% hasta 100%, con todos los checkpoints entrenados exactamente 1.000.000 de pasos. La arquitectura es un backbone DiT (denominado `ddit`) con ruido log-lineal y algoritmo `duo_base`. El tamaño total del repositorio es de 472.8 GB, lo que refleja que cada checkpoint es un archivo completo de PyTorch Lightning que incluye pesos vivos, EMA, estados del optimizador y metadatos de entrenamiento. La relevancia actual radica en que proporciona una base empírica para entender cuándo un modelo de difusión de lenguaje memoriza sus datos y cómo detectarlo, un aspecto crítico para la privacidad y la evaluación de modelos generativos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DiT para difusión discreta (`ddit`) |
| Parametros totales | tiny: 23.7 M; small: 139.3 M; medium: 384.0 M (backbone) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 1024 tokens |
| Tipos de cuantizacion | no disponible (solo pesos fp32 en checkpoints) |
| Idiomas soportados | inglés (inferido del tokenizer `bert-base-uncased` y del dataset LM1B) |
| Licencia | MIT |
| Formato de pesos | Checkpoints PyTorch Lightning (`.ckpt`) con `state_dict`, EMA, `optimizer_states` y metadatos; no hay safetensors ni GGUF |

## Arquitectura y entrenamiento

Los modelos usan un backbone DiT adaptado a difusión discreta, con `hidden_size` de 256 (tiny), 768 (small) y 1024 (medium), y 8, 12 y 24 bloques respectivamente. Comparten configuración: longitud de secuencia 1024, dropout 0.1, `scale_by_sigma=True`, `tie_word_embeddings=False`, `vocab_lookup=True` y un program de ruido log-lineal. El tokenizador es `bert-base-uncased` con vocabulario de 30.522 tokens. El entrenamiento se realizó con batch global de 512, secuencias de 1024 tokens, algoritmo `duo_base`, LR constante con warmup, y DDP sobre 4× H100 80GB. Todos los checkpoints liberados están en `global_step = 1.000.000`. La innovación principal no está en la arquitectura sino en el diseño experimental: se mantiene fija la arquitectura y se barre la fracción del corpus de entrenamiento (54 valores desde 0.0001 hasta 1.0) para aislar el comportamiento de memorización. Los checkpoints incluyen estados del optimizador AdamW, lo que permite reanudar el entrenamiento, y pesos EMA separados para evaluación.

## Capacidades

- Generación de texto mediante difusión discreta: el modelo produce secuencias de tokens muestreadas desde ruido, con capacidad de recuperar tanto ejemplos de entrenamiento como datos no vistos.
- Memoria asociativa: establece cuencas de atracción alrededor de puntos de datos, permitiendo recuperar ejemplos específicos del conjunto de entrenamiento.
- Transición memorización-generalización: el comportamiento cambia según el tamaño del dataset; con datasets pequeños memoriza, con datasets grandes generaliza.
- Sonda de entropía condicional: el modelo permite medir la entropía condicional de las predicciones para detectar el régimen de memorización.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión ni audio.

## Casos de uso

- Investigación sobre memorización en modelos generativos: permite estudiar cómo varía la recuperación de datos de entrenamiento en función del tamaño del corpus, usando los 54 checkpoints por tamaño como barrido controlado.
- Auditoría de privacidad de modelos de difusión: la entropía condicional propuesta puede usarse como sonda para detectar si un modelo desplegado está memorizando datos sensibles.
- Desarrollo de métodos de detección de memorización: los checkpoints con fracciones conocidas de datos sirven como ground truth para validar nuevas métricas de memorización.
- Estudio de la dinámica de cuencas de atracción: los pesos EMA y los estados del optimizador permiten analizar la evolución de las memorias durante el entrenamiento.
- Evaluación de la generalización en modelos de difusión de lenguaje: comparar el rendimiento en datos no vistos entre los distintos tamaños de modelo y fracciones de datos.
- Reproducción de experimentos del paper: al incluir configuraciones Hydra y checkpoints reanudables, se puede replicar el entrenamiento o continuar desde cualquier punto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El artículo se centra en el análisis de la transición memorización-generalización mediante entropía condicional y recuperación de tokens, pero no se proporcionan métricas estándar como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- Los checkpoints son archivos completos de Lightning: el más pequeño (tiny) ocupa ~0.38 GB, el small ~2.23 GB y el medium ~6.15 GB. Para inferencia solo se necesitan los pesos EMA (aproximadamente la mitad del archivo, ya que el `state_dict` y los `optimizer_states` ocupan el resto).
- El modelo medium tiene 384M parámetros; en fp32 ocupa ~1.5 GB de VRAM, por lo que cabe en GPUs consumer como RTX 3060 (12 GB) o superiores. El tiny (23.7M) cabe incluso en GPUs integradas.
- Para entrenamiento se usaron 4× H100 80GB con DDP; reanudar el entrenamiento desde un checkpoint requeriría hardware similar.
- No se proporcionan datos de latencia ni throughput. Al ser un modelo de difusión, la generación requiere múltiples pasos de denoising, lo que aumenta el coste frente a un autoregresivo.
- Opciones de despliegue: no se mencionan integraciones con vLLM, llama.cpp u Ollama. Al ser checkpoints de PyTorch Lightning, habría que extraer los pesos y adaptarlos a un framework de inferencia estándar.

## Comparativa con modelos similares

No se dispone de comparaciones directas con otros modelos en la información proporcionada. El modelo es un artefacto de investigación específico para el estudio de la memoria asociativa en difusión de lenguaje, y no se han publicado comparativas con alternativas como LLaDA, SSD-LM o modelos autoregresivos equivalentes. Se puede señalar que, por tamaño, el medium (384M) es comparable a modelos como GPT-2 medium (355M), pero la arquitectura y el propósito son distintos.

## Limitaciones y advertencias

- Es un modelo de investigación, no diseñado para uso en producción; no se han evaluado sesgos, robustez ni seguridad.
- Riesgo de memorización: por diseño, los modelos con fracciones pequeñas de datos memorizan ejemplos de entrenamiento, lo que puede suponer un riesgo de fuga de datos si se usan con datos sensibles.
- Los checkpoints incluyen estados del optimizador y metadatos, lo que los hace pesados y no aptos para despliegue directo; requieren extracción de pesos.
- Solo se ha entrenado con LM1B (inglés), por lo que el multilingüismo no está cubierto.
- La licencia MIT permite uso comercial, pero el modelo no viene con garantías ni soporte.
- No se proporcionan métricas de calidad de generación, por lo que no se puede evaluar su rendimiento en tareas estándar de lenguaje.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/lemoncmd/lldms-associative-memory
- Paper arXiv: https://arxiv.org/abs/2604.26841
- Código fuente: https://github.com/Lemon-cmd/Associative-Memory-and-Language-Diffusion
