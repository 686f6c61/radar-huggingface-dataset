# hari-8/transformer-pretraining-from-scratch

## Resumen

`hari-8/transformer-pretraining-from-scratch` es un modelo de lenguaje decoder-only de tipo transformer, entrenado desde cero en PyTorch por Hari Prashad Ravikumar como proyecto de portafolio. Con aproximadamente 69 millones de parámetros totales (56,6 millones sin contar embeddings), el modelo está diseñado para demostrar una implementación completa de un transformer causal sin depender de clases predefinidas de `transformers` como `AutoModel`. Todas las capas (RMSNorm, RoPE, atención causal, MLP SwiGLU, weight-tied) están implementadas manualmente en el repositorio de entrenamiento.

El modelo fue preentrenado sobre aproximadamente 1.000 millones de tokens del dataset FineWeb-Edu, con un tokenizador BPE byte-level propio entrenado también desde cero. Su contexto es de 1024 tokens y su vocabulario de 16.384 entradas. No está ajustado por instrucciones ni es un chatbot; es un modelo de predicción de siguiente token puro. Su relevancia radica en ser un ejemplo reproducible y bien documentado de preentrenamiento desde cero, con evaluaciones de calibración e interpretabilidad, útil para quienes quieren entender el funcionamiento interno de los transformers sin depender de frameworks de alto nivel.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (causal) |
| Parametros totales | 69.284.608 (según safetensors) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 1024 tokens |
| Tipos de cuantizacion | No publicados (pesos en bf16/fp32) |
| Idiomas soportados | Inglés (entrenado solo en inglés) |
| Licencia | MIT |
| Formato de pesos | safetensors (con código personalizado) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only con 8 capas, 12 cabezas de atención, dimensión de embedding 768 y MLP SwiGLU. Usa normalización RMSNorm, posiciones rotatorias (RoPE) y atención causal implementada con `F.scaled_dot_product_attention`. El embedding de entrada y la cabeza de salida comparten pesos (weight-tied). El tokenizador es un BPE byte-level propio con vocabulario de 16.384 tokens, entrenado desde cero sobre el corpus de entrenamiento.

El entrenamiento se realizó sobre ~1.000 millones de tokens de FineWeb-Edu, en una única GPU NVIDIA L4, con precisión bf16, `torch.compile` y acumulación de gradientes. Se ejecutaron 7.630 pasos con una programación de tasa de aprendizaje coseno y calentamiento. La pérdida final de entrenamiento fue 3,16. No se aplicó RLHF ni DPO; es un modelo de lenguaje puro sin ajuste por instrucciones.

## Capacidades

- Generación de texto autocompletiva: predice el siguiente token y puede continuar secuencias de texto de forma coherente en el corto plazo.
- Modelado de lenguaje causal: adecuado para tareas de completado de texto, generación de continuaciones y evaluación de perplejidad.
- Soporte de tool calling: no disponible, el modelo no ha sido entrenado para ello.
- Soporte de agentes y multi-step reasoning: no disponible, no tiene capacidades de razonamiento estructurado ni planificación.
- Capacidades multilingües: solo inglés, entrenado exclusivamente con datos en inglés.
- Capacidades especiales: ninguna más allá de la generación de texto. No tiene modo de pensamiento, visión ni audio.
- Calibración de confianza: el modelo muestra una calibración casi perfecta a nivel de token (ECE 0,0071 sin escalado de temperatura), lo que indica que sus probabilidades son fiables para predicción de siguiente token.

## Casos de uso

- Proyecto educativo de arquitectura de transformers: sirve como ejemplo completo y reproducible de cómo implementar y entrenar un transformer desde cero, con código fuente disponible en GitHub. Es ideal para estudiantes que quieran estudiar cada componente (RMSNorm, RoPE, SwiGLU, weight-tied) en detalle.
- Investigación en interpretabilidad: el modelo incluye un análisis de cabezas de inducción (dos cabezas claras en capas 6-7) y una ablación causal completa. Puede usarse como banco de pruebas para técnicas de interpretabilidad en modelos pequeños.
- Evaluación de métricas de calibración: con su estudio de calibración (ECE y Brier) y su temperatura óptima de 1,014, es útil para experimentos sobre calibración de modelos de lenguaje y comparación de metodologías.
- Comparación de tokenizadores: al tener un tokenizador BPE byte-level propio, permite estudiar el impacto del tokenizador en la perplejidad y en bits por byte (BPB) frente a modelos con tokenizadores estándar como GPT-2.
- Prototipado de generación de texto en entornos con recursos limitados: con solo 69 millones de parámetros, puede ejecutarse en CPU o GPU de gama baja, permitiendo prototipos de autocompletado o generación de texto corto sin necesidad de infraestructura potente.
- Benchmark de eficiencia de decodificación: al carecer de caché KV en su método `generate_simple`, puede usarse para medir el coste computacional de la decodificación sin caché y compararlo con implementaciones optimizadas.

## Benchmarks y rendimiento

El autor proporciona resultados de evaluación sobre un conjunto de validación de ~497.000 tokens no vistos durante el entrenamiento. Se comparan con Pythia-70M, un modelo de tamaño similar entrenado sobre The Pile.

| Modelo | Loss (nats) | Perplejidad | BPB |
|---|---|---|---|
| Este modelo | 3,19 | 24,2 | 1,057 |
| Pythia-70M (referencia) | 3,68 | 39,7 | 1,135 |

El modelo obtiene un BPB inferior al de Pythia-70M, probablemente debido a la coincidencia de dominio (entrenado solo con FineWeb-Edu, una distribución más predecible que The Pile). No se han publicado resultados en benchmarks estándar como MMLU, HumanEval o GSM8K, ya que el modelo no está diseñado para tareas de razonamiento o código.

## Requisitos de hardware

- VRAM estimada para inferencia: con 69 millones de parámetros, en bf16 ocupa aproximadamente 138 MB; en fp32 unos 277 MB. Cabe en cualquier GPU moderna, incluso en iGPUs con memoria compartida.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente. Una NVIDIA T4, L4, RTX 3060 o superior funcionará sin problemas. También puede ejecutarse en CPU para generaciones cortas.
- Compatibilidad con GPU de consumo: sí, cualquier GPU de consumo reciente (serie RTX 20, 30, 40) puede ejecutarlo sin problemas.
- Opciones de despliegue: al ser una arquitectura personalizada, requiere `trust_remote_code=True` en HuggingFace. No se ha probado con vLLM, llama.cpp, Ollama o TGI; el método de generación `generate_simple` no usa caché KV, por lo que no es adecuado para servir a escala.
- Latencia y throughput: no se han publicado mediciones. Dado su tamaño, la generación de 40 tokens debería ser casi instantánea en GPU, pero el algoritmo O(n²) sin caché KV degrada el rendimiento con secuencias largas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Entrenamiento | Licencia | BPB (en este test) |
|---|---|---|---|---|---|
| Este modelo | 69M | 1024 | FineWeb-Edu (~1B tokens) | MIT | 1,057 |
| Pythia-70M | 70M | 2048 | The Pile (~300B tokens) | Apache 2.0 | 1,135 |

Pythia-70M es el único comparable directo con datos publicados en la model card. Otros modelos pequeños como GPT-2 (124M) o TinyStories no se han evaluado en las mismas condiciones, por lo que no se dispone de comparación directa. La ventaja de este modelo es su licencia MIT y su código completamente abierto, mientras que Pythia-70M tiene un contexto mayor y fue entrenado con muchos más tokens.

## Limitaciones y advertencias

- No está ajustado por instrucciones: es un modelo de predicción de siguiente token, no un asistente conversacional. Las salidas serán continuaciones de texto, no respuestas a preguntas.
- Tamaño pequeño y datos limitados: con ~69M parámetros y solo ~1B tokens de entrenamiento, la coherencia se mantiene en frases cortas, pero la precisión factual a largo plazo y el razonamiento complejo no son fiables.
- Decodificación ineficiente: el método `generate_simple` no utiliza caché KV, por lo que la generación es O(n²) y lenta para secuencias largas. No está optimizado para producción.
- Requiere `trust_remote_code=True`: la arquitectura se define en código personalizado dentro del repositorio, lo que implica ejecutar código remoto. Esto puede suponer un riesgo de seguridad si no se audita el código.
- Sesgos y alucinaciones: al estar entrenado solo con FineWeb-Edu, puede reflejar sesgos presentes en ese dataset. No se han realizado estudios de sesgo específicos.
- Idioma: solo inglés. No soporta otros idiomas.
- Sin soporte de tool calling ni agentes: no puede integrarse en flujos de trabajo que requieran llamadas a funciones o razonamiento multi-paso.

## Enlaces

- HuggingFace: https://huggingface.co/hari-8/transformer-pretraining-from-scratch
- Repositorio GitHub: https://github.com/Hariprashad-Ravikumar/transformer-pretraining-from-scratch
- Dataset FineWeb-Edu: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
