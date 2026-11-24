# MOGODIK/ssiat-1.0

## Resumen

Ssiat 1.0 (씨앗, "semilla" en coreano) es un modelo de lenguaje causal de 254,7 millones de parámetros desarrollado por MOGODIK, entrenado desde cero y especializado exclusivamente en coreano. Su objetivo no es competir en conocimiento general, sino ofrecer una base ligera y fácilmente adaptable para la creación de chatbots de personaje en hardware de consumo: el autor reporta que un ajuste fino LoRA con 50-80 ejemplos se completa en 1-2 minutos en una GPU RTX 5060 Ti de 16 GB.

El modelo se distribuye como base sin personalidad definida (sin nombre, carácter ni estilo propios), pensado para que el desarrollador lo especialice mediante fine-tuning. La arquitectura es un transformer causal de tipo Llama con una ventana de contexto de 1024 tokens, pesos en safetensors y GGUF, y licencia Apache 2.0. El repositorio ocupa 7,7 GB e incluye varios ejemplos de personajes ya entrenados.

La relevancia actual del modelo reside en su enfoque *edge*: el autor afirma que, cuantizado, puede ejecutarse en dispositivos como una Raspberry Pi Zero 2W o un Galaxy Watch 4, y que en teoría basta con 256 MB de RAM y CPU para inferencia. La versión de noviembre de 2026 mejoró la coherencia conversacional mediante preentrenamiento adicional con texto plano de sentido común (unas 540 000 tokens durante 3 épocas) y un nuevo entrenamiento conversacional con diálogos cotidianos breves.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal (familia Llama), entrenado desde cero |
| Parametros totales | 254.706.688 (254,7 M) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 1024 tokens |
| Tipos de cuantizacion | GGUF (disponible en el repositorio); niveles concretos no disponibles |
| Idiomas soportados | Coreano exclusivamente (ko) |
| Licencia | Apache License 2.0 |
| Formato de pesos | safetensors y GGUF |

## Arquitectura y entrenamiento

El modelo es un transformer causal denso de 254,7 M de parámetros, etiquetado por el autor como perteneciente a la familia Llama y entrenado desde cero (*from-scratch*) en lugar de partir de un modelo preentrenado mayor. El preentrenamiento consta de 781 000 pasos según la model card. En la actualización de noviembre de 2026 se realizó un preentrenamiento adicional con aproximadamente 540 000 tokens de texto plano de sentido común durante 3 épocas, seguido de un nuevo entrenamiento conversacional con datos de diálogo cotidiano breve.

El modelo emplea el formato de chat ChatML (`<|im_start|>` / `<|im_end|>`) y un tokenizador con pre-tokenizer de tipo GPT-2 como respaldo, detalle relevante porque el motor de inferencia propio de Ollama lo procesa incorrectamente y produce respuestas degradadas; el autor recomienda usar llama.cpp directamente. No se documentan innovaciones como decodificación especulativa, atención lineal o arquitecturas híbridas SSM. Tampoco se detalla la composición del corpus de preentrenamiento ni si se aplicaron fases de RLHF o DPO; la información disponible solo menciona entrenamiento supervisado conversacional.

## Capacidades

- Generación de texto conversacional en coreano, con formato multi-turno ChatML.
- Mantenimiento de personaje: con 30 ejemplos de estilo y personalidad ya se aprecia un carácter definido; con alrededor de 1000 ejemplos el autor reporta conversaciones que se sienten humanas, incluyendo respuestas coherentes a preguntas no vistas en el entrenamiento.
- Estabilidad en diálogos largos: según el autor, mantiene el registro más de 10 turnos sin caer en bucles, en comparación con modelos del doble de tamaño bajo las mismas condiciones.
- Adaptabilidad mediante LoRA: el modelo base no tiene identidad propia y está diseñado para especializarse con conjuntos pequeños de datos.
- No soporta *tool calling* ni *function calling* (no documentado).
- No soporta razonamiento multi-paso orientado a agentes ni modo *thinking*.
- No soporta visión, audio ni otras modalidades.
- Capacidades multilingües nulas: no funciona en inglés según el autor.
- No resuelve matemáticas ni cálculos.
- El sistema de prompts de sistema es débil: el autor indica que el modelo tiende a ignorarlos y que la personalización debe hacerse por fine-tuning.

## Casos de uso

- Chatbots de personaje en dispositivos de consumo: un desarrollador puede entrenar un personaje con 50-80 ejemplos mediante LoRA y desplegarlo localmente en una GPU de gama media, evitando costes por token de APIs comerciales.
- Prototipado rápido de personajes: gracias a que un ajuste LoRA tarda 1-2 minutos en una RTX 5060 Ti de 16 GB, es posible iterar sobre el dataset varias veces al día y comparar resultados.
- Despliegue en *edge*: el autor afirma que, cuantizado, el modelo puede ejecutarse en una Raspberry Pi Zero 2W o un Galaxy Watch 4, lo que permite asistentes conversacionales offline sin conectividad ni servicios en la nube.
- Docencia y prácticas de fine-tuning: estudiantes pueden entrenar y evaluar un modelo conversacional completo con recursos mínimos, algo inviable con modelos de miles de millones de parámetros.
- Ficción interactiva y *roleplay*: el formato ChatML y la capacidad de mantener personajes durante más de 10 turnos lo hacen adecuado para narrativa conversacional con personajes con voz propia.
- Experimentación con datos sintéticos de diálogo en coreano: al ser un modelo pequeño y de licencia permisiva, puede usarse para generar corpus conversacionales de dominio restringido que luego se filtren manualmente.
- Integración en aplicaciones de escritorio o móviles con llama.cpp: el autor documenta el uso de `llama-server` con GGUF, lo que facilita incrustar el modelo en herramientas locales sin dependencias de la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

Los únicos datos de rendimiento aportados por el autor son de throughput: aproximadamente 470,25 tokens por segundo en un acelerador A100. No se especifica la cuantización ni el lote empleados en esa medición.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. Con 254,7 M de parámetros, los pesos en precisión de 16 bits ocupan aproximadamente 0,5 GB, y en cuantizaciones de 4 bits alrededor de 0,15-0,2 GB, si bien estas cifras son estimaciones de cálculo y no datos publicados por el autor.
- El autor afirma que, en teoría, el modelo funciona con 256 MB de RAM y CPU.
- GPU recomendadas: el autor cita una RTX 5060 Ti de 16 GB para el fine-tuning LoRA (1-2 minutos por personaje con 50-80 ejemplos) y una A100 para la medición de throughput.
- Cabe en cualquier GPU de consumo con al menos 1-2 GB de VRAM libre en cuantización; también en CPU.
- Opciones de despliegue: llama.cpp y `llama-server` (recomendado por el autor), transformers con `AutoModelForCausalLM`, y GGUF para otros runners compatibles.
- Advertencia de despliegue: el autor confirma que Ollama produce respuestas incorrectas o corruptas con este modelo por un fallo en el manejo del pre-tokenizer; debe evitarse o verificarse con cuidado.
- Latencia y throughput: aproximadamente 470,25 tokens por segundo en A100 según el autor; no hay datos para otras plataformas.

## Comparativa con modelos similares

No se dispone de datos de benchmarks que permitan una comparación cuantitativa con alternativas. La siguiente tabla recoge únicamente características verificables de modelos pequeños de la misma categoría; los datos de los competidores se indican como no disponibles cuando no se han podido confirmar en la información proporcionada.

| Modelo | Parámetros | Contexto | Idioma principal | Licencia | Estado |
|---|---|---|---|---|---|
| Ssiat 1.0 (MOGODIK) | 254,7 M | 1024 | Coreano | Apache 2.0 | Disponible en Hugging Face |
| Qwen2.5-0.5B | 0,5 B | 32 768 (versión base) | Multilingüe | Apache 2.0 | Disponible en Hugging Face |
| SmolLM2-360M | 360 M | 8192 | Inglés | Apache 2.0 | Disponible en Hugging Face |
| Gemma 2 2B | 2 B | 8192 | Multilingüe | Gemma Terms | Disponible en Hugging Face |

Diferencias cualitativas: Ssiat 1.0 es el único de la lista entrenado desde cero y exclusivamente en coreano, con un contexto mucho más corto (1024 tokens) y sin capacidades multilingües ni de razonamiento general. Su ventaja declarada es la facilidad de fine-tuning para personajes y su huella mínima en hardware. Los modelos de la comparativa ofrecen mayor contexto y conocimiento general, pero requieren más recursos y no están especializados en coreano conversacional.

## Limitaciones y advertencias

- Conocimiento del mundo y precisión factual débiles, según el propio autor.
- No funciona en inglés y no maneja matemáticas ni cálculos.
- Memoria limitada de hechos previos en conversaciones largas, incluso dentro de la ventana de 1024 tokens.
- Ignora los prompts de sistema en gran medida; la personalización debe hacerse mediante fine-tuning.
- El modelo base no tiene identidad ni personalidad: sin fine-tuning, las respuestas son genéricas.
- Riesgo de alucinación alto en preguntas factuales, coherente con su tamaño y su corpus de entrenamiento.
- La versión de noviembre de 2026 aumentó las respuestas de eco del tipo "yo también" y redujo el registro de internet ("ㄹㅇ", "ㅇㅋ"), según el autor.
- Bug corregido en `eos_token_id`: en versiones anteriores el modelo no detenía la generación al emitir el token de fin de turno. Los ejemplos de personaje del repositorio se entrenaron sobre la versión previa, accesible con la revisión `82b8af7b1f44d8f6745ccae60508235c5cf9a802`.
- Incompatibilidad conocida con Ollama por el tratamiento del pre-tokenizer.
- Licencia Apache 2.0: permite uso comercial y modificación, pero no se documentan garantías ni evaluaciones de sesgo; al ser un modelo entrenado desde cero con corpus no detallado, no es posible evaluar sesgos conocidos.
- Para producción, la ventana de 1024 tokens limita la gestión de conversaciones largas y obliga a truncar o resumir el historial.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/MOGODIK/ssiat-1.0
- Revisión anterior (ejemplos de personaje): https://huggingface.co/MOGODIK/ssiat-1.0/tree/82b8af7b1f44d8f6745ccae60508235c5cf9a802
- No se han encontrado en la información disponible papers, blogs, repositorios adicionales ni demos fuera de la model card y el repositorio de Hugging Face.
