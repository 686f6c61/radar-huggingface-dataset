# fabriciocarraro/CatDecide-1

## Resumen

CatDecide-1 es un modelo de clasificación basado en la familia Qwen3, desarrollado por el usuario fabriciocarraro y publicado en Hugging Face bajo acceso restringido (gated). Con 9.094.607.872 parámetros totales (aproximadamente 9,1 mil millones) y pesos en formato safetensors, el modelo está orientado a tareas de clasificación y declara soporte para catalán, español e inglés, lo que lo sitúa en el nicho de modelos multilingües centrados en lenguas ibéricas.

La relevancia del modelo radica en su especialización: frente a los modelos generativos de propósito general, CatDecide-1 parece concebido para decidir o clasificar contenido en un contexto trilingüe (ca/es/en), un caso de uso poco cubierto por los modelos comerciales y útil para pipelines de moderación, enrutamiento o etiquetado en entornos catalanohablantes. El tag `qwen3` indica que parte de una arquitectura transformer de la familia Qwen3, aunque no se especifica si es un ajuste fino (fine-tuning) sobre un checkpoint base o un modelo entrenado desde cero.

La información pública disponible es limitada: no se detallan la longitud de contexto, los tipos de cuantización, la licencia ni los datos de entrenamiento. El repositorio ocupa 18,2 GB y acumula 245 descargas, con acceso condicionado a la aceptación de términos en la plataforma.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3, segun tag) |
| Parametros totales | 9.094.607.872 (~9,1 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | ca, es, en |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se etiqueta como `qwen3`, lo que sugiere que su arquitectura subyacente es un transformer decoder-only de la familia Qwen3, aunque no se especifica la variante exacta ni si se trata de un ajuste fino sobre un checkpoint preentrenado de Qwen o de un modelo entrenado de forma independiente. El tamaño de 9,1 mil millones de parámetros no coincide con los tamaños públicos habituales de Qwen3 (0.6B, 1.7B, 4B, 8B, 14B, 32B), por lo que podría tratarse de una modificación, fusión o ajuste con cabecera de clasificación añadida.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, el uso de RLHF/DPO ni innovaciones técnicas concretas (atención lineal, decodificación especulativa, etc.). Tampoco se documenta el proceso de alineación ni la metodología de evaluación. Toda esta información debe considerarse no disponible a partir de los datos públicos del repositorio.

## Capacidades

- Clasificación de texto: el tag `classification` indica que el modelo está diseñado para tareas de clasificación (etiquetado, categorización, decisión binaria o multietiqueta).
- Soporte multilingüe para catalán, español e inglés, según los idiomas declarados.
- Generación de texto: no confirmada explícitamente; al derivar de Qwen3 podría conservar capacidades generativas, pero no se documenta.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades especiales (modo thinking, visión, audio): no disponible.

## Casos de uso

- Moderación de contenido en catalán y español: el modelo puede clasificar comentarios o publicaciones como aptos o no aptos en plataformas dirigidas a comunidades catalanohablantes, un nicho donde los filtros entrenados solo en inglés rinden peor.
- Enrutamiento de consultas en atención al cliente: clasificar tickets entrantes por categoría (facturación, soporte técnico, reclamación) en entornos trilingües ca/es/en antes de derivarlos al equipo adecuado.
- Etiquetado de corpus para investigación lingüística: anotar automáticamente grandes volúmenes de texto en catalán con categorías temáticas o de dominio, acelerando la creación de datasets anotados.
- Clasificación de reseñas y análisis de sentimiento: procesar opiniones de usuarios en las tres lenguas soportadas para alimentar dashboards de reputación de marca.
- Detección de idioma o variedad lingüística: usar el modelo como clasificador auxiliar para distinguir entre catalán, español e inglés en pipelines de preprocesamiento.
- Filtrado de contenido en foros y comunidades: identificar mensajes que requieren revisión humana en comunidades online catalanas, reduciendo la carga de moderación manual.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 18 GB solo para pesos, más overhead de activaciones y KV cache; se recomienda al menos 24 GB para inferencia cómoda.
- VRAM estimada en cuantización de 8 bits: en torno a 9-10 GB.
- VRAM estimada en cuantización de 4 bits: en torno a 5-6 GB (estimaciones teóricas, no verificadas con el modelo).
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 6000 Ada para FP16 sin compromisos; RTX 4090 (24 GB) para FP16 ajustado o 8 bits.
- GPU de consumo: cabe en RTX 3090/4090 (24 GB) en FP16 con contexto moderado, y en GPUs de 8-12 GB si se cuantiza a 4-8 bits.
- Opciones de despliegue: vLLM, TGI, llama.cpp u Ollama si se generan pesos GGUF; dado que el repo solo contiene safetensors, sería necesario convertirlos.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CatDecide-1 | ~9,1 B | no disponible | ca, es, en | no disponible | Gated en HF |
| Qwen3-8B | 8 B | no disponible en esta ficha | multilingue | Apache 2.0 (segun Qwen) | Publico en HF |
| Qwen3-14B | 14 B | no disponible en esta ficha | multilingue | Apache 2.0 (segun Qwen) | Publico en HF |
| Modelos de clasificacion multilingues (p. ej. XLM-R large) | ~0,56 B | 512 tokens tipicamente | multilingue | MIT / varias | Publico en HF |

La comparativa es orientativa: CatDecide-1 se posiciona entre los Qwen3 de 8B y 14B en tamaño, pero su especialización en clasificación y su enfoque en catalán lo diferencian de los modelos generativos de propósito general. Los modelos tipo XLM-R son mucho más pequeños y eficientes para clasificación pura, aunque con menor capacidad de representación.

## Limitaciones y advertencias

- Acceso restringido: el repositorio es gated y requiere aceptar condiciones en Hugging Face, lo que puede limitar su uso en producción automatizada.
- Licencia no especificada: no se puede confirmar si el uso comercial está permitido; es imprescindible verificar los términos antes de desplegarlo.
- Falta de documentación: no hay model card detallada, datos de entrenamiento ni evaluación publicada, lo que dificulta estimar su calidad real.
- Riesgo de sesgos: al no documentarse la composición del dataset, no se pueden evaluar sesgos de género, políticos o culturales en las tres lenguas soportadas.
- Riesgo de alucinación: si el modelo conserva capacidades generativas de Qwen3, podría producir texto plausible pero incorrecto; en tareas de clasificación, podría asignar etiquetas con confianza injustificada.
- Cobertura lingüística limitada a ca/es/en: no se garantiza un rendimiento adecuado en otras lenguas, incluidos el gallego, el euskera o el portugués.
- Contexto desconocido: sin datos sobre la ventana de contexto, no se recomienda usarlo con entradas largas sin validación previa.
- Sin benchmarks: no hay evidencia pública de rendimiento frente a alternativas, por lo que su adopción en producción debe ir precedida de una evaluación propia.

## Enlaces

- Hugging Face: https://huggingface.co/fabriciocarraro/CatDecide-1
- Repositorio de Qwen3 (referencia de arquitectura): https://huggingface.co/Qwen
- Documentación de safetensors: https://huggingface.co/docs/safetensors
