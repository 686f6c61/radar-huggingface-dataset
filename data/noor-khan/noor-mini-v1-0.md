# Noor-Khan/noor-mini-v1.0

## Resumen

Noor Mini v1.0 es un modelo de lenguaje de tipo decoder-only Transformer con 25.178.880 parámetros, entrenado desde cero (inicialización aleatoria, sin fine-tuning ni destilación) por Noorullah Zamindar bajo el alias Noor-Khan. Forma parte de la cartera de modelos "Noor / ARK AI" y es el sucesor del Noor Nano v1.0 (10.5M parámetros, perplejidad de validación 10,84). Su propósito no es competir con modelos de gran escala, sino servir como caso de estudio reproducible de entrenamiento extremo a extremo de un Transformer pequeño.

El modelo se entrenó sobre el dataset TinyStories, un corpus sintético de cuentos infantiles cortos, con una arquitectura compacta: 8 capas, dimensión de modelo 384, 8 cabezas de atención, MLP SwiGLU de 1536, RoPE, pre-LayerNorm y un vocabulario BPE de 8192 tokens. La ventana de contexto es de 512 tokens. El entrenamiento completo se realizó en una única GPU de consumo (NVIDIA GeForce RTX 4060 de 8 GB) en unos 30 minutos, lo que lo convierte en un ejemplo accesible de pipeline de entrenamiento.

Su relevancia es fundamentalmente educativa y experimental: demuestra que es posible entrenar un modelo de lenguaje funcional para generación de texto simple con hardware de consumo y en menos de una hora. No está pensado como chatbot general, ni para respuestas factuales, ni para decisiones sensibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (causal LM), 8 capas, d_model 384, 8 cabezas, MLP SwiGLU 1536, RoPE, pre-LayerNorm |
| Parametros totales | 25.178.880 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin variantes GGUF publicadas) |
| Idiomas soportados | inglés (en) |
| Licencia | MIT |
| Formato de pesos | safetensors (librería pytorch) |

## Arquitectura y entrenamiento

La arquitectura es un Transformer decoder-only clásico con 8 capas, dimensión de modelo 384 y 8 cabezas de atención. Emplea RoPE (Rotary Position Embeddings), pre-LayerNorm y una MLP con activación SwiGLU de dimensión 1536. El tokenizador es BPE con un vocabulario de 8192 tokens, entrenado exclusivamente sobre las historias de entrenamiento para evitar filtración de datos de validación o test.

El entrenamiento se realizó con modelado de lenguaje causal desde inicialización aleatoria, optimizador AdamW con learning rate 3e-4, schedule coseno, precisión bf16 y una sola época. El dataset fue TinyStories (`roneneldan/TinyStories`), con 300.000 historias para el entrenamiento y particiones de 2.000 historias para validación y 2.000 para test. El proceso completo requirió 3967 pasos, alcanzó un throughput de aproximadamente 71.000 tokens por segundo y un pico de VRAM de 4,948 GB en una RTX 4060. No se aplicó RLHF, DPO ni ningún tipo de alineación por instrucciones.

## Capacidades

- Generación de texto narrativo simple en inglés, con estilo de cuento infantil.
- Continuación de prompts cortos ("Once upon a time") con coherencia local limitada.
- Modelado de lenguaje causal puro; no dispone de modo de razonamiento explícito.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- Capacidad multilingüe nula más allá del inglés; el vocabulario y los datos son exclusivamente en inglés.
- No dispone de visión, audio ni otras modalidades.
- No tiene instruction tuning ni alineación de seguridad.

## Casos de uso

- Docencia y divulgación sobre entrenamiento de LLM: el modelo sirve como ejemplo completo y reproducible de pipeline from-scratch (tokenizador, dataset, bucle de entrenamiento, evaluación con perplejidad) en una sola GPU de consumo.
- Generación de cuentos sintéticos para pruebas: útil para generar texto de relleno narrativo en inglés en entornos de test de pipelines de NLP, sin coste de API.
- Benchmark de infraestructura: con 25M parámetros y contexto de 512, permite medir latencia y throughput de frameworks de inferencia (PyTorch nativo, llama.cpp tras conversión) en hardware modesto.
- Experimentos de investigación sobre currículos de datos: al estar entrenado solo con TinyStories, sirve como línea base controlada para estudiar el efecto de cambiar el corpus o el tokenizador.
- Prototipado de interfaces de escritura creativa: para demos de autocompletado de frases en inglés con latencia muy baja en CPU o GPU integrada.
- Fine-tuning educativo: su tamaño reducido permite experimentar con ajuste fino supervisado o LoRA en una única GPU de consumo para estudiar el efecto de la alineación en modelos pequeños.

## Benchmarks y rendimiento

| Split | Loss | Perplejidad |
|---|---|---|
| Validación | 1,9098 | 6,75 |
| Test | 1,8754 | 6,52 |
| Entrenamiento (val final) | 1,9180 | 6,81 |

La perplejidad de una línea base aleatoria con vocabulario de 8192 sería 8192. El predecesor Noor Nano v1.0 (10,5M) obtuvo validación 2,3831 / 10,84 y test 2,3431 / 10,41. No se han publicado resultados en benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 (aproximadamente 100 MB de pesos) y menos aún en bf16 o fp16; el repo completo ocupa 0,1 GB.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM; el entrenamiento se realizó en una RTX 4060 de 8 GB con pico de 4,948 GB.
- Cabe holgadamente en GPU de consumo (RTX 3060, RTX 4060, GTX 1650) y probablemente en CPU para inferencia interactiva.
- Opciones de despliegue: PyTorch nativo (según el código del proyecto); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, y no hay pesos GGUF publicados.
- Latencia y throughput: no se han publicado mediciones de inferencia; el throughput de entrenamiento fue de aproximadamente 71.000 tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Noor Mini v1.0 | 25,18M | 512 | MIT | Hugging Face |
| Noor Nano v1.0 | 10,5M | no disponible | no disponible | Hugging Face (mismo autor) |
| TinyStories baseline (referencia del dataset) | variable (1M–33M) | no disponible | no disponible | Referencia académica |

No se dispone de datos de benchmarks comparativos con modelos de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Vocabulario y conocimiento del mundo muy limitados: entrenado solo con cuentos infantiles sintéticos.
- Salidas potencialmente repetitivas, incoherentes o sin sentido.
- Sin instruction tuning, sin alineación de seguridad y sin RLHF; no debe usarse como chatbot.
- Solo inglés y frases simples; no soporta otros idiomas.
- Riesgo alto de alucinación en cualquier consulta factual; no apto para respuestas basadas en hechos ni para decisiones sensibles.
- Contexto máximo de 512 tokens, insuficiente para documentos largos o conversaciones multi-turno extensas.
- Licencia MIT para el modelo, pero el dataset TinyStories tiene su propia licencia que debe verificarse antes de un uso comercial.
- No hay variantes cuantizadas publicadas ni integración documentada con frameworks de servido de producción.

## Enlaces

- Hugging Face: https://huggingface.co/Noor-Khan/noor-mini-v1.0
- Dataset TinyStories: https://huggingface.co/datasets/roneneldan/TinyStories
