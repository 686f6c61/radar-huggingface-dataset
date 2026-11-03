# phuctahong/nanogpt-gpt-mha-mhc-358m-job16426608-step100000

## Resumen

El modelo `nanogpt-gpt-mha-mhc-358m-job16426608-step100000` es un checkpoint de inferencia de 358 millones de parámetros entrenado con la herramienta `nanogptpro` sobre el corpus FineWeb-Edu. Lo publica el usuario `phuctahong` en Hugging Face como parte de un conjunto comparativo denominado DDL2, presumiblemente para estudiar variantes arquitectónicas dentro del ecosistema NanoGPT. La arquitectura declarada es `gpt-mha-mhc`, es decir, un transformer tipo GPT con atención multi-cabeza (MHA) y alguna variante identificada como "mhc" que no se detalla en la model card.

El checkpoint corresponde al paso 100.000 de entrenamiento, tras haber consumido aproximadamente 49.200 millones de tokens de FineWeb-Edu con una longitud de contexto de 1024 tokens. Es, por tanto, un modelo pequeño, de propósito experimental y orientado a la investigación más que a producción: no hay pipeline declarado, no hay idiomas listados, no hay resultados de benchmarks ni descargas registradas. Su interés radica en ser un artefacto reproducible de comparación dentro de un estudio controlado de arquitecturas y en su licencia Apache 2.0, que permite reutilización y análisis sin restricciones comerciales.

La ficha se basa exclusivamente en la información pública disponible en Hugging Face y en la model card del autor. Cualquier dato no documentado se marca explícitamente como no disponible para no inferir cifras que el autor no ha publicado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | `gpt-mha-mhc` (transformer tipo GPT con atención multi-cabeza) |
| Parámetros totales | 358.244.628 (358M) |
| Parámetros activos | no disponible (no es MoE según la información publicada) |
| Longitud de contexto | 1024 tokens |
| Tipos de cuantización | no disponible (pesos publicados en safetensors, sin variantes GGUF/INT8 documentadas) |
| Idiomas soportados | no disponible (entrenado sobre FineWeb-Edu, mayoritariamente inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`model.safetensors`), más `config.json` y `generation_config.json` |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura transformer decoder-only de estilo GPT con atención multi-cabeza (MHA). El identificador `gpt-mha-mhc` sugiere una configuración concreta dentro de la familia de variantes que el proyecto `nanogptpro` permite entrenar; el sufijo "mhc" no se explica en la model card, por lo que no es posible confirmar si se refiere a una modificación de las cabezas de atención, a una normalización específica o a otro componente. No se documentan detalles como número de capas, dimensión oculta, número de cabezas, tipo de activación ni uso de embeddings posicionales rotatorios.

El entrenamiento se realizó sobre FineWeb-Edu, un corpus filtrado por calidad educativa, con un total de aproximadamente 49.200 millones de tokens procesados y una ventana de contexto de 1024 tokens. El checkpoint publicado corresponde al paso 100.000 y forma parte del conjunto comparativo DDL2. No se indica si hubo fases de ajuste fino supervisado, RLHF o DPO, ni se detalla la composición exacta del dataset más allá del nombre del corpus. Tampoco se documentan innovaciones técnicas como decodificación especulativa, atención lineal o mezcla de expertos.

## Capacidades

- Generación de texto autoregresiva en inglés, condicionada por el corpus FineWeb-Edu.
- Modelado de lenguaje de propósito general a pequeña escala (358M de parámetros).
- Capacidad limitada de razonamiento y respuesta a instrucciones, al no documentarse ajuste por instrucciones ni RLHF.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no documentadas; el corpus de entrenamiento es mayoritariamente anglófono.
- Capacidades especiales (modo thinking, visión, audio): no disponibles.
- Generación con contexto máximo de 1024 tokens, adecuada para prompts y respuestas cortas.

## Casos de uso

- Investigación comparativa de arquitecturas: el checkpoint sirve como punto de referencia reproducible dentro del conjunto DDL2 para comparar variantes `gpt-mha-mhc` frente a otras configuraciones entrenadas con el mismo corpus y presupuesto de tokens.
- Reproducción de experimentos de escalado: con 358M de parámetros y 49.200 millones de tokens vistos, permite estudiar curvas de aprendizaje y ajustar recetas de entrenamiento en entornos de bajo coste.
- Fine-tuning educativo supervisado: al estar entrenado sobre FineWeb-Edu, es un punto de partida razonable para ajustar tareas de generación de material didáctico o resumen de textos académicos en inglés.
- Prototipado rápido de pipelines de generación: su tamaño permite desplegarlo en una única GPU consumer para validar ideas antes de escalar a modelos mayores.
- Análisis de sesgos y calidad de corpus: útil para auditar cómo un modelo pequeño entrenado sobre FineWeb-Edu reproduce o amplifica sesgos presentes en datos web filtrados por criterios educativos.
- Docencia y formación: sirve como ejemplo práctico de entrenamiento y despliegue de un transformer GPT de escala reducida en cursos de aprendizaje automático.
- Base para estudios de destilación o poda: su tamaño compacto facilita experimentos de compresión y comparación con modelos mayores del mismo linaje.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 0,7 GB solo para pesos (358M × 2 bytes), más overhead de activaciones y caché KV; en la práctica, menos de 2 GB para contextos de 1024 tokens.
- VRAM estimada en FP32: aproximadamente 1,4 GB para pesos, más overhead; cabe holgadamente en GPUs con 4 GB o más.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) es suficiente; también funciona en CPU para inferencia por lotes pequeños.
- Cabe en GPU consumer: sí, en prácticamente cualquier GPU con 4 GB o más de VRAM, e incluso en iGPU con suficiente memoria compartida.
- Opciones de despliegue: `transformers` de Hugging Face de forma nativa; conversión a GGUF para `llama.cpp` u Ollama es viable pero no está publicada; vLLM y TGI son compatibles en teoría con arquitecturas GPT estándar, aunque no hay configuración validada por el autor.
- Latencia y throughput estimados: no disponibles; para un modelo de 358M en una RTX 4090 se espera un throughput alto (cientos a miles de tokens por segundo) en batch, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| `phuctahong/nanogpt-gpt-mha-mhc-358m` | 358M | 1024 | Apache 2.0 | Hugging Face, 0 descargas | Checkpoint experimental de DDL2 |
| GPT-2 small (OpenAI) | 124M | 1024 | MIT | Ampliamente disponible | Referencia clásica de la familia GPT pequeña |
| GPT-2 medium (OpenAI) | 355M | 1024 | MIT | Ampliamente disponible | Tamaño casi idéntico; sin datos de comparación directa |
| Pythia-410M (EleutherAI) | 410M | 2048 | Apache 2.0 | Hugging Face | Entrenado sobre The Pile; benchmarks publicados |

La comparación con GPT-2 medium y Pythia-410M es la más natural por escala, pero no existen evaluaciones cruzadas publicadas que permitan afirmar superioridad o inferioridad en tareas concretas. El modelo de `phuctahong` se distingue por su contexto más corto (1024 frente a 2048 de Pythia) y por carecer de benchmarks publicados.

## Limitaciones y advertencias

- No se han publicado evaluaciones de sesgo; al entrenarse sobre FineWeb-Edu, es probable que herede sesgos presentes en texto web filtrado por criterios educativos, pero no hay análisis documentado.
- Riesgo de alucinación elevado: es un modelo pequeño sin ajuste por instrucciones ni RLHF, por lo que generará texto plausible pero no necesariamente veraz.
- Ventana de contexto muy limitada (1024 tokens), insuficiente para documentos largos o conversaciones multi-turno extensas.
- Idiomas no documentados; el corpus FineWeb-Edu es mayoritariamente inglés, por lo que el rendimiento en castellano u otras lenguas será previsiblemente pobre.
- Sin pipeline declarado ni descargas registradas: no hay evidencia de uso en producción ni de validación por parte de la comunidad.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías ni soporte; el modelo se publica tal cual.
- El significado del sufijo "mhc" en la arquitectura no está documentado, lo que dificulta reproducir exactamente la configuración.
- No se incluyen estados del optimizador ni del entrenador, por lo que no es posible reanudar el entrenamiento desde este checkpoint.

## Enlaces

- Hugging Face: https://huggingface.co/phuctahong/nanogpt-gpt-mha-mhc-358m-job16426608-step100000
- Corpus FineWeb-Edu: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Proyecto NanoGPT (referencia): https://github.com/karpathy/nanoGPT
- No se han encontrado papers, blogs, repositorios ni demos adicionales asociados a este checkpoint en la información disponible.
