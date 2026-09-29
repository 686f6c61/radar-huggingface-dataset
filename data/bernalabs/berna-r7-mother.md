# BernaLabs/berna-r7-mother

## Resumen

Berna R7 - Mother es un modelo de lenguaje de 1.056.265.728 parámetros (1,06B) desarrollado por Berna Labs (Mohammed Kamil Muhammed) y alojado en HuggingFace bajo el identificador `BernaLabs/berna-r7-mother`. Se trata de un transformer decoder-only denso entrenado desde cero, con 28 capas, tamaño oculto de 1536, 16 cabezas de atención con GQA (4 cabezas KV), vocabulario BPE de 32.000 tokens y una ventana de contexto de 4096 tokens.

Su singularidad no reside en el rendimiento, sino en la arquitectura que implementa: el "DNA-Kernel Plexus" (referido por el autor como Berna R5), una propuesta modular de red neuronal en crecimiento basada en células de conocimiento, un grafo dinámico (Plexus), un kernel genético de 100 cromosomas y un registro SQL con UUID. Berna R7 - Mother es, según su model card, la primera implementación a gran escala de ese marco y está orientado a investigación sobre aprendizaje continuo, no a despliegue en producción.

El dato crítico es su estado: el entrenamiento sigue en curso y los pesos todavía no están publicados; la model card indica que se subirán alrededor del 5 de octubre de 2026. Se ha entrenado durante 1 época sobre 2,66B tokens (inglés, matemáticas y código) en una única RTX 5090 durante aproximadamente 6,5 días, lo que arroja una ratio de ~2,5 tokens por parámetro y lo deja deliberadamente infraentrenado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (Berna R5 / DNA-Kernel Plexus) |
| Parámetros totales | 1.056.265.728 (1,06B) |
| Parámetros activos | No aplica (arquitectura densa, no MoE) |
| Longitud de contexto | 4.096 tokens |
| Tipos de cuantización | no disponible (precisión de entrenamiento BF16; no se publican variantes cuantizadas) |
| Idiomas soportados | en (la model card lo describe como "multilingual", pero solo declara inglés; datos en inglés, matemáticas y código) |
| Licencia | berna-research-1.0 (Berna Research License v1.0; uso comercial requiere licencia aparte) |
| Formato de pesos | no disponible (pesos aún no publicados; entrenamiento en BF16) |
| Capas | 28 |
| Tamaño oculto | 1.536 |
| Tamaño intermedio (FFN) | 6.144 |
| Cabezas de atención | 16 (GQA, 4 cabezas KV) |
| Vocabulario | 32.000 (BPE) |
| RoPE theta | 500.000 |
| Normalización | RMSNorm |
| Activación | SwiGLU |
| Embeddings ligados | Sí |
| Pipeline | text-generation |
| Librería | transformers |

## Arquitectura y entrenamiento

El modelo sigue una estructura de seis capas definida en Berna R5: Sensors → Spinal Cord → Plexus → Knowledge Cells → DNA Kernel → Registry. La capa de células de conocimiento contiene 112 células (4 por capa MLP × 28 capas), cada una asociada a un vector de conocimiento de 6 dimensiones K = [L, W, H, D, T, E] con saturación S = ||K||_omega. El DNA Kernel consta de 100 cromosomas de 4 genes (a, s, p, pi), el Plexus es un grafo dinámico cuyas aristas se actualizan a partir de co-activaciones y el Registry es un catálogo SQL con UUID y connection tokens. Según la tabla de cumplimiento de la propia model card, quedan componentes sin implementar o sin validar: el router (Spinal Cord) está diferido y el mecanismo de olvido acotado (Bounded Forgetting, H2) no se ha probado todavía.

El entrenamiento se realizó sobre 2,66B tokens de texto en inglés, matemáticas y código, con 1 única época, optimizador AdamW8bit, learning rate de 3e-4 con decaimiento coseno y 500 pasos de warmup, tamaño de batch de 64 × 4096 = 262.144 tokens por paso y gradient checkpointing activado. Todo el cómputo se ejecutó en una sola RTX 5090 de 32 GB durante unos 6,5 días. No se menciona en la información disponible ningún proceso de RLHF, DPO, SFT por instrucciones ni datos multimodales. La model card no describe innovaciones de inferencia (atención lineal, decodificación especulativa ni similares), solo la estructura modular de aprendizaje continuo.

## Capacidades

- Generación de texto autorregresiva en inglés, en modo modelo base (no ajustado por instrucciones).
- Generación de código y texto matemático tras un proceso de fine-tuning específico del dominio, dado el contenido del dataset de entrenamiento.
- Capacidad de fine-tuning como modelo base para tareas de dominio concreto (clasificación, resumen, extracción).
- Soporte de tool calling / function calling: no disponible; el modelo no está ajustado por instrucciones ni se documenta soporte de herramientas.
- Soporte de agentes y razonamiento multi-paso: no disponible en el estado actual.
- Capacidades multilingües: no disponibles; solo se declara inglés pese a la etiqueta "multilingual" del título.
- Capacidades especiales: implementación de referencia de la arquitectura DNA-Kernel Plexus, con registro de células de conocimiento, grafo Plexus y kernel genético, orientada a experimentación en aprendizaje continuo.
- Visión y audio: no soportados (modelo exclusivamente de texto).

## Casos de uso

- Investigación en aprendizaje continuo: el modelo permite experimentar con crecimiento modular mediante células de conocimiento, grafo Plexus y Registro con UUID, y evaluar hasta qué punto la estructura R5 mitiga el olvido catastrófico frente a un transformer denso convencional.
- Reproducción de la arquitectura DNA-Kernel Plexus: sirve como implementación de referencia verificable para terceros que quieran replicar o auditar el marco Berna R5, incluyendo el kernel de 100 cromosomas y la tabla de cumplimiento publicada.
- Fine-tuning sobre dominios específicos en inglés: al ser un modelo base de 1,06B, se puede ajustar con SFT o LoRA sobre corpus técnicos, legales o científicos para tareas de generación y extracción en inglés.
- Generación de código asistida tras ajuste: dado que el dataset incluye código y matemáticas, es un punto de partida razonable para fine-tuning orientado a autocompletado o generación de fragmentos en un lenguaje concreto.
- Razonamiento matemático básico tras entrenamiento adicional: el contenido matemático del corpus permite adaptarlo a resolución de problemas aritméticos o paso a paso mediante fine-tuning supervisado.
- Prototipado en hardware de consumo: con ~2,1 GB de pesos en BF16, cabe en GPUs modestas y permite iterar sobre la arquitectura en un único equipo, replicando el entorno de entrenamiento original (RTX 5090).
- Docencia y divulgación de arquitecturas alternativas: útil para explicar en un curso o artículo diferencias entre atención estándar, routing modular y memoria estructurada, con código abierto a nivel de pesos (cuando se publiquen).
- Experimentación sobre olvido acotado (H2): permite diseñar pruebas para el mecanismo de Bounded Forgetting que, según la model card, aún no se ha validado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que MMLU, GSM8K y HumanEval están pendientes, y que el modelo no reclama estar a la cabeza en ningún benchmark.

## Requisitos de hardware

- VRAM estimada para inferencia (cálculos propios a partir de las especificaciones, no datos del autor): ~2,1 GB solo de pesos en BF16/FP16; ~1,1 GB en INT8 y ~0,6 GB en INT4.
- Caché KV estimada a 4096 tokens: ~170 MB con 28 capas, 4 cabezas KV y dimensión de cabeza de 96 (cálculo aproximado).
- Consumo total en inferencia BF16: del orden de 2,5-3 GB incluyendo activaciones y caché, por lo que cabe en prácticamente cualquier GPU con 4 GB o más.
- Cabe en GPU de consumo: sí. Ejemplos viables: RTX 3060 12 GB, RTX 4060 8 GB, RTX 4090, RTX 5090, e incluso tarjetas de 4-6 GB en cuantización de 4 bits.
- GPU recomendadas: para entrenamiento o fine-tuning completo, RTX 5090 32 GB o A100/H100 si se busca réplica a mayor escala; para inferencia, cualquier GPU moderna con al menos 6-8 GB.
- Opciones de despliegue: transformers (nativo, según la etiqueta `library_name`), vLLM y TGI como servidores de inferencia; llama.cpp u Ollama requerirían una conversión a GGUF que no está publicada.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo para ninguna configuración.

## Comparativa con modelos similares

La comparativa se limita a especificaciones públicas de modelos de tamaño comparable. No existe comparación de rendimiento porque Berna R7 - Mother no tiene benchmarks publicados.

| Modelo | Parámetros | Contexto | Licencia | Idiomas | Disponibilidad |
|---|---|---|---|---|---|
| Berna R7 - Mother | 1,06B | 4.096 | Berna Research 1.0 (uso comercial restringido) | en | Pesos pendientes (~5 octubre 2026) |
| Llama 3.2 1B | ~1,24B | 128.000 | Llama 3.2 Community License | multilingüe | Pesos y GGUF disponibles |
| Qwen2.5 1.5B | ~1,54B | 32.768 | Apache 2.0 | multilingüe | Pesos y GGUF disponibles |
| TinyLlama 1.1B | ~1,1B | 2.048 | Apache 2.0 | en | Pesos y GGUF disponibles |

Las cifras de los modelos comparativos provienen de su documentación pública. Berna R7 - Mother no dispone de resultados de evaluación comparables, por lo que la tabla no permite concluir superioridad en ninguna tarea.

## Limitaciones y advertencias

- Entrenamiento insuficiente: 1 sola época sobre 2,66B tokens (~2,5 tokens por parámetro), muy por debajo de los estándares habituales de modelos de su tamaño. La propia model card lo califica de "undertrained".
- Sin ajuste por instrucciones: no es apto para uso conversacional directo ni para seguir instrucciones sin un proceso previo de SFT.
- Idiomas: pese a la etiqueta "multilingual" del título, solo se declara inglés y el corpus contiene únicamente inglés, matemáticas y código.
- Contexto corto: 4096 tokens, inferior al de alternativas contemporáneas de tamaño similar con 32K-128K.
- Sin benchmarks: no hay datos publicados de MMLU, GSM8K ni HumanEval, por lo que cualquier afirmación de calidad es especulativa.
- Riesgo de alucinación: inherente a un modelo base de lenguaje; no se documentan mecanismos de mitigación ni evaluación de factualidad.
- Componentes incompletos: el router (Spinal Cord) está diferido y el olvido acotado (Bounded Forgetting, H2) no se ha probado, de modo que la arquitectura R5 no está plenamente implementada.
- Multimodalidad: no soporta visión ni audio.
- Licencia: Berna Research License v1.0. El uso de investigación es libre, pero el comercial requiere una licencia separada (contacto: info@bernalabs.com). Es un riesgo legal relevante para cualquier producto.
- Estado del artefacto: los pesos no están disponibles en el momento de redactar esta ficha, por lo que no es posible evaluar el modelo ni verificar el funcionamiento de la arquitectura descrita.
- Despliegue en producción: la model card lo declara explícitamente fuera de alcance sin evaluación previa, y desaconseja aplicaciones de seguridad crítica.
- El autor no reclama escalabilidad más allá de 1,5B parámetros ni completitud teórica.

## Enlaces

- HuggingFace: https://huggingface.co/BernaLabs/berna-r7-mother
- Repositorio GitHub: https://github.com/Berna-Labs/berna-r7
- Licencia (Berna Research License v1.0): https://github.com/Berna-Labs/berna-r7/blob/main/LICENSE
- Paper de la arquitectura DNA-Kernel Plexus (Zenodo, DOI 10.5281/zenodo.23015308): https://zenodo.org/records/23015308
- Contacto de licencia comercial: info@bernalabs.com

Nota: la búsqueda web asociada a esta consulta devolvió únicamente resultados sobre la emisora de radio francesa FIP, sin relación alguna con el modelo. No se han encontrado papers, blogs, demos ni repositorios adicionales más allá de los enlazados en la model card.
