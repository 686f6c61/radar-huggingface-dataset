# greg1506/qwen3-1p7b-coffee-dist2-GGUF

## Resumen
`qwen3-1p7b-coffee-dist2-GGUF` es una compilación en formato GGUF para `llama.cpp` del modelo "dist2", una adaptación al dominio del café de Qwen3-1.7B desarrollada por el usuario `greg1506` dentro del proyecto CoffeeLLM. Se obtuvo destilando el modelo de referencia de 8B del mismo autor (`greg1506/qwen3-8b-coffee-v10`) sobre Qwen3-1.7B, con un corpus de dominio propio (`greg1506/coffee-corpus-v2`). El objetivo es disponer de un asistente especializado en café que quepa en dispositivos móviles y entornos con recursos limitados.

El modelo hereda la arquitectura transformer densa de Qwen3-1.7B (1.700 millones de parámetros, aproximadamente) y se distribuye en dos cuantizaciones, Q4_K_M (1,1 GB) y Q5_K_M (1,3 GB), generadas desde una fusión bf16 de 3,4 GB. La versión recomendada por el autor es Q5_K_M, que según su propia evaluación iguala o supera ligeramente el rendimiento de la fusión bf16 en el benchmark interno CoffeeBench.

Su relevancia es acotada y muy específica: no es un modelo de propósito general, sino un especialista de dominio con licencia Apache 2.0, pensado para integrarse en aplicaciones de café (recetas, ratios, métodos, definiciones) y no para tareas de aritmética decimal fiable ni para conocimiento fuera del corpus. La ficha refleja exclusivamente los datos publicados por el autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3), adaptado con continued pretraining, SFT y destilación LoRA |
| Parametros totales | 1.700 millones (clase 1.7B de Qwen3) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la información proporcionada |
| Tipos de cuantizacion | Q4_K_M, Q5_K_M (en el repositorio); fusión bf16 de referencia (3,4 GB) |
| Idiomas soportados | inglés (`language: en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (generado con `convert_hf_to_gguf.py` y `llama-quantize`) |

## Arquitectura y entrenamiento
El modelo parte de Qwen3-1.7B, un transformer denso de la familia Qwen3, y se somete a una cadena de adaptación en tres etapas: continued pretraining sobre el flujo de tokens de `coffee-corpus-v2` (etapa de dominio), una etapa de SFT con instructor ("v1-best", con EM 0,527 / soft-EM 0,580 / F1 0,625) y, finalmente, destilación desde el profesor de 8B `greg1506/qwen3-8b-coffee-v10` (bf16, EM 0,753) sobre un pool de 15.991 filas (`qa_distill`, minado más replay sintético). La destilación usó LoRA con learning rate 2e-4 y early stopping sobre `val_loss`.

El pool de destilación está anclado en documentos de `coffee-corpus-v2` con una salvaguarda de fuga (ninguna pregunta de CoffeeBench aparece literalmente en el conjunto de entrenamiento). Según el autor, "dist2" se eligió frente a un barrido de dos brazos de learning rate y dos rondas posteriores (pools de 36.000 y 55.000 filas) porque ambas rondas posteriores empeoraron el rendimiento en la batería numérica; la receta ganadora es la del pool de 16.000 filas. No se detalla la composición exacta del corpus ni el número total de tokens de entrenamiento.

## Capacidades
- Generación de texto especializada en café: definiciones, métodos de preparación, ratios, origen de especies y estándares de calidad.
- Razonamiento numérico limitado: resuelve ratios directos e inversos y conversiones de sólidos-masa con precisión variable (ver limitaciones).
- Respuestas concisas con declaración de incertidumbre, según la plantilla de sistema sugerida por el autor.
- Soporte de formato de chat ChatML, con plantilla de "thinking" embebida en el GGUF.
- No se documenta soporte de tool calling ni function calling.
- No se documenta capacidad de agentes ni razonamiento multi-paso.
- No se documenta visión, audio ni otras modalidades.
- Multilingüe: no; el modelo está etiquetado como inglés únicamente.
- No es un asistente de propósito general; su conocimiento está acotado al corpus de café.

## Casos de uso
- Asistente de café en aplicación móvil: con 1,1-1,3 GB en Q4/Q5, el modelo cabe en un dispositivo de gama media y puede responder consultas de ratios y métodos en local, sin conexión, usando `llama.cpp` como runtime.
- Respuesta a preguntas de definición y vocabulario de café: la familia `definition` obtiene 0,58 EM en bf16 y sube a 0,67 en Q5_K_M, por lo que es adecuada para glosarios y explicaciones conceptuales en una app o chatbot.
- Cálculo de ratios directos en recetas: la familia `ratio-forward` alcanza 0,76 EM, útil para sugerir proporciones café-agua en escenarios controlados, siempre con verificación posterior.
- Conversión de sólidos y masa: la familia `solids-mass` obtiene 1,00 EM en bf16, lo que la hace fiable para cálculos de dosis y rendimiento de extracción en el rango cubierto por el corpus.
- Identificación de origen y especie: `species-origin` logra 0,73 EM / 0,80 soft-EM, aprovechable en fichas de producto y catálogos de variedades.
- Mapa de métodos de preparación: `method-map` rinde 0,54 EM / 0,58 soft-EM; puede usarse como ayuda en asistentes de recomendación de método, con revisión humana.
- Bebidas con leche: `milk-drinks` obtiene 0,62 EM pero 0,88 soft-EM, adecuado para respuestas tolerantes a variaciones de formato en recetas de cafetería.
- Despliegue en CPU o entornos sin GPU: el autor evalúa con `llama-server` en CPU a temperatura 0, lo que permite servir el modelo en servidores modestos o en el propio dispositivo.

## Benchmarks y rendimiento
Resultados publicados por el autor en CoffeeBench v6 (336 ítems reservados, temperatura 0, EM exacto, soft-EM y token-F1):

| Modelo / cuantización | Tamaño | Raw EM | Soft-EM | Token F1 |
|---|---|---|---|---|
| Q4_K_M | 1,1 GB | 0,530 | 0,551 | 0,625 |
| Q5_K_M (recomendado) | 1,3 GB | 0,574 | 0,592 | 0,660 |
| Fusión bf16 (referencia) | 3,4 GB | 0,562 | 0,580 | 0,648 |
| Profesor 8B (`qwen3-8b-coffee-v10`) | no disponible | 0,753 | 0,789 | no disponible |

Rendimiento por categoría (fusión bf16, EM / soft-EM):

| Familia | n | EM | Soft-EM |
|---|---|---|---|
| solids-mass | 15 | 1,00 | 1,00 |
| ratio-forward | 45 | 0,76 | 0,76 |
| species-origin | 15 | 0,73 | 0,80 |
| ratio-inverse | 33 | 0,64 | 0,64 |
| milk-drinks | 8 | 0,62 | 0,88 |
| method-map | 24 | 0,54 | 0,58 |
| definition | 12 | 0,58 | 0,67 |
| ey-inverse (aritmética decimal) | 66 | 0,48 | 0,48 |
| ey-forward (aritmética decimal) | 90 | 0,44 | 0,44 |
| roast-map | 10 | 0,30 | 0,30 |
| processing-map | 9 | 0,22 | 0,22 |

El autor advierte que el conjunto de test es deliberadamente aritmético (aproximadamente el 74 % de los ítems son familias numéricas), por lo que el EM global infravalora el rendimiento en mapas de conocimiento y sobrevalora la capacidad numérica independiente de calculadora.

## Requisitos de hardware
- VRAM estimada: en Q4_K_M, unos 1,1 GB de pesos más overhead de contexto (típicamente 1,5-2 GB totales); en Q5_K_M, unos 1,3 GB de pesos más overhead (aproximadamente 1,7-2,3 GB totales). Estimación orientativa, no publicada por el autor.
- GPU recomendadas: no se especifican; por tamaño, cualquier GPU consumer con 4 GB o más de VRAM (por ejemplo, GTX 1650, RTX 3050, RTX 4060) puede alojarlo. No requiere A100 ni H100.
- Cabe en GPU consumer: sí, en la práctica totalidad de GPU consumer modernas, y también en CPU.
- Opciones de despliegue: `llama.cpp` (`llama-cli`, `llama-server`), y por compatibilidad GGUF, herramientas derivadas como Ollama o LM Studio. No se documenta soporte de vLLM ni TGI para este artefacto.
- Latencia y throughput: no disponibles. El autor evalúa en CPU con `llama-server` a temperatura 0, pero no publica cifras de latencia ni tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen3-1p7b-coffee-dist2 (Q5_K_M) | 1,7B | no disponible | CoffeeBench EM 0,574 / soft 0,592 | Apache 2.0 | GGUF en Hugging Face |
| qwen3-1p7b-coffee-dist2 (Q4_K_M) | 1,7B | no disponible | CoffeeBench EM 0,530 / soft 0,551 | Apache 2.0 | GGUF en Hugging Face |
| greg1506/qwen3-8b-coffee-v10 (profesor) | 8B | no disponible | CoffeeBench EM 0,753 / soft 0,789 | no disponible | Hugging Face |
| Qwen/Qwen3-1.7B (base) | 1,7B | no disponible | no disponible en esta información | no disponible en esta información | Hugging Face |

No se dispone de datos de benchmarks de Qwen3-1.7B base sobre CoffeeBench ni de otros modelos especializados en café comparables en la información proporcionada.

## Limitaciones y advertencias
- No fiable para aritmética decimal: `ey-forward` rinde 0,44 EM en bf16 y cae a 0,29 en Q4_K_M; `ey-inverse` se queda en 0,48. El autor recomienda derivar estos cálculos a una calculadora o a una llamada de función, o usar el modelo de 8B.
- `roast-map` (0,30 bf16 / 0,20 en Q5) y `processing-map` (0,22) están por debajo del azar; en producción conviene codificar la tabla determinista de relaciones (10 + 9) en lugar de preguntar al modelo.
- Acotado al corpus: las respuestas fuera del dominio de `coffee-corpus-v2` no son fiables.
- Solo inglés; no hay soporte multilingüe documentado.
- No es un asistente de propósito general.
- No es fuente de referencia: el propio autor indica que los consejos y cálculos de café son indicativos y deben verificarse de forma independiente.
- La plantilla de chat incluye un bloque de "thinking" que aparece como texto literal en las completaciones crudas; es necesario eliminarlo o usar la plantilla sin thinking.
- Riesgo de alucinación en preguntas numéricas y de mapeo, tal como reflejan los resultados por categoría.
- La licencia declarada en la model card es Apache 2.0, aunque el campo de licencia de Hugging Face figura como no disponible; conviene verificar antes de un uso comercial.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/greg1506/qwen3-1p7b-coffee-dist2-GGUF
- Modelo profesor de 8B: https://huggingface.co/greg1506/qwen3-8b-coffee-v10
- Dataset del corpus: https://huggingface.co/datasets/greg1506/coffee-corpus-v2
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
- Repositorio de llama.cpp: https://github.com/ggml-org/llama.cpp
