# SmallAICreator/GRAFT-50B-A3B-GGUF

## Resumen

GRAFT-50B-A3B es un modelo de chat de tipo mezcla de expertos (MoE) desarrollado por UltraLabs (publicado en Hugging Face por el usuario SmallAICreator). Se obtiene reduciendo el modelo Qwen3-Next-80B-A3B-Instruct a menos de dos tercios de su tamaño mediante GRAFT, un método propio de "encogimiento" de modelos, seguido de un proceso de recuperación ("healing") por destilación desde el modelo original de 80B y de un ajuste de identidad para que el modelo conozca su propio nombre. El resultado es un modelo de 50,66 mil millones de parámetros totales con solo unos 3,2 mil millones activos por token, lo que le permite generar a una velocidad cercana a la de un modelo de 3B conservando parte del conocimiento del modelo grande.

La arquitectura es la híbrida de Qwen3-Next: 48 capas (36 de Gated DeltaNet y 12 de atención con compuertas), 320 expertos con 10 activos por token más un experto compartido, y tamaño oculto de 2048. La distribución publicada es un único archivo GGUF cuantizado en Q4_K_M de 30,9 GB, pensado para ejecutarse en llama.cpp y en cualquier aplicación compatible con GGUF que soporte Qwen3-Next.

Su relevancia práctica está en el coste de despliegue: al mantener solo 12 de las 48 capas con caché KV, el contexto largo resulta barato (32K de contexto ocupan bastante menos de 1 GB), y el modelo cabe completo en una única GPU de 48 GB o, con reparto de expertos en CPU, en un equipo de 32 GB de RAM más GPU. La licencia es Apache 2.0 y el ajuste está orientado al inglés.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer híbrido Qwen3-Next: 48 capas (36 Gated DeltaNet + 12 de atención con compuertas), MoE con 320 expertos (10 activos por token + 1 experto compartido), tamaño oculto 2048 |
| Parámetros totales | 50.664.487.680 (~50,7B) |
| Parámetros activos | ~3,2B por token |
| Longitud de contexto | 32.768 tokens (valor empleado en los ejemplos de `llama-server` y en la prueba needle-in-a-haystack indicada por el autor); longitud máxima nativa no disponible |
| Tipos de cuantización | Q4_K_M (único archivo publicado, 30,9 GB) |
| Idiomas soportados | Inglés (principal); otros idiomas funcionan pero con menor pulido, según el autor |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (plantilla de chat ChatML con tool calling embebida en el archivo) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-Next-80B-A3B-Instruct, una arquitectura híbrida que combina capas de Gated DeltaNet (atención lineal con estado recurrente) con un subconjunto de capas de atención con compuertas. En GRAFT-50B-A3B se conservan 48 capas (36 Gated DeltaNet y 12 de atención), 320 expertos con 10 activos por token más un experto compartido, y un tamaño oculto de 2048. Solo las 12 capas de atención mantienen caché KV, lo que explica el bajo coste de memoria del contexto largo.

El proceso de construcción descrito por el autor es en dos fases: primero un "encogimiento" del modelo de 80B hasta menos de dos tercios de su tamaño mediante el método GRAFT, y después una recuperación de capacidad mediante destilación desde el modelo original de 80B, junto con un ajuste específico para fijar la identidad del modelo (nombre y autoría) sin necesidad de system prompt. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO adicionales.

## Capacidades

- Generación de texto conversacional multi-turno con plantilla ChatML.
- Escritura, explicación y depuración de código.
- Matemáticas y razonamiento, con menor fiabilidad que el modelo base de 80B según el propio autor.
- Tool calling / function calling: el autor indica soporte del formato `<tool_call>` y manejo de `tools` al estilo OpenAI mediante la plantilla embebida en el GGUF.
- Identidad propia sin system prompt: el modelo se identifica como GRAFT-50B-A3B de UltraLabs cuando se le pregunta, y no lo menciona en preguntas ordinarias.
- Multilingüe limitado: ajustado principalmente en inglés; otros idiomas funcionan pero con menor calidad.
- Contexto largo económico en memoria (prueba needle-in-a-haystack planificada hasta 32K).
- No se documenta en la información disponible un modo de razonamiento explícito ("thinking"), soporte de visión, audio ni capacidades agénticas de varios pasos más allá del tool calling.

## Casos de uso

- Asistente de chat local en estación de trabajo: con 30,9 GB en Q4_K_M y unos 31 GB de memoria total, puede ejecutarse en un equipo de 32 GB de RAM más GPU o en una única GPU de 48 GB, ofreciendo conversación multi-turno sin depender de la nube.
- Servidor compatible con OpenAI para prototipos: `llama-server --jinja -c 32768` expone una API HTTP en el puerto 8080 con plantilla ChatML y soporte de `tools`, lo que permite sustituir un endpoint en aplicaciones existentes sin cambiar el cliente.
- Asistencia de programación en IDE o CLI: el modelo escribe y explica código y puede recibir definiciones de funciones vía tool calling, integrándose en flujos donde el coste por token generado importa (solo 3,2B activos).
- Procesamiento de documentos largos con contexto de 32K: la caché KV reducida (12 de 48 capas) mantiene el consumo por debajo de 1 GB a 32K, lo que facilita resumir o extraer información de contratos, informes o transcripciones en máquinas modestas.
- Despliegue con reparto CPU/GPU en hardware heterogéneo: la opción `--n-cpu-moe N` de llama.cpp permite mantener parte de los expertos en RAM del sistema y ajustar el número de capas hasta llenar la VRAM disponible, útil en estaciones con GPU de 24 GB.
- Automatización de tareas de extracción y clasificación en lotes: al ser un modelo Apache 2.0 y ejecutable en local, encaja en pipelines internos con requisitos de soberanía de datos donde no se quiere enviar texto a terceros.
- Bot de soporte técnico de primer nivel: conversación multi-turno con contexto largo y tool calling para consultar APIs internas, con la advertencia de verificar hechos y respuestas por su tendencia a hablar con seguridad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica que las pruebas estándar (MMLU, GSM8K, HumanEval y needle-in-a-haystack hasta 32K) se están ejecutando sobre el propio archivo Q4_K_M y que se añadirán a la ficha del modelo, pero no incluye cifras.

Datos de rendimiento sí disponibles en la información:

| Métrica | Valor |
|---|---|
| Velocidad en CPU | 8,8 tokens/s medidos en una CPU de servidor de 24 núcleos |
| Velocidad en GPU | "mucho más rápida"; sin cifra concreta disponible |
| Memoria del modelo (Q4_K_M) | ~31 GB |
| Memoria de contexto a 32K | bastante menos de 1 GB (solo 12 de 48 capas con caché KV) |

## Requisitos de hardware

- VRAM estimada: unos 31 GB para los pesos en Q4_K_M más una cantidad pequeña de caché KV (menos de 1 GB a 32K de contexto). Presupuesto práctico de 32-34 GB.
- GPU recomendadas: una única GPU de 48 GB (por ejemplo, A6000, L40S o RTX 6000 Ada) aloja el modelo completo. No se especifican modelos concretos en la información disponible.
- GPU de consumo: no cabe entera en 24 GB (RTX 4090, RTX 3090). Sí es viable repartiendo expertos en RAM del sistema con `--n-cpu-moe N`, bajando N hasta llenar la VRAM.
- Solo CPU: funciona si el modelo cabe en RAM (32 GB de RAM más GPU como mínimo, o 48 GB o más de RAM/VRAM), a 8,8 tokens/s en una CPU de servidor de 24 núcleos.
- Opciones de despliegue: llama.cpp con soporte reciente de Qwen3-Next (`llama-cli`, `llama-server` con `--jinja`) y cualquier aplicación GGUF compatible. No se mencionan integraciones con vLLM, TGI ni Ollama en la información disponible.
- Latencia y throughput: solo se publica la cifra de CPU (8,8 tokens/s); no hay datos de throughput en GPU.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Parámetros activos | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| GRAFT-50B-A3B | ~50,7B | ~3,2B | 32K en los ejemplos publicados | Apache 2.0 | GGUF Q4_K_M | Destilado de Qwen3-Next-80B-A3B; identidad propia; inglés |
| Qwen3-Next-80B-A3B-Instruct (base) | 80B (según el autor) | ~3B (según el autor) | No disponible en la información proporcionada | Apache 2.0 | No disponible | Modelo original del que se destila; mayor tamaño y, según el autor, mejor matemáticas y razonamiento |
| GRAFT-10B-A2B (UltraLabs) | 10B (según el nombre del modelo) | ~2B (según el nombre del modelo) | No disponible | No disponible en la información proporcionada | GGUF | Alternativa más pequeña del mismo autor; sin datos de rendimiento publicados aquí |

No se dispone de datos de benchmarks ni de especificaciones completas de otras familias comparables en la información proporcionada, por lo que no se incluyen más alternativas.

## Limitaciones y advertencias

- Matemáticas y razonamiento difícil: según el autor, son las capacidades que más pierden respecto al modelo original de 80B; conviene verificar cálculos importantes.
- Alucinación: el autor advierte que el modelo "habla con seguridad", por lo que hay que comprobar hechos relevantes y ejecutar y probar el código generado.
- Idioma: ajustado en inglés; el rendimiento en castellano u otros idiomas es menos pulido y no está evaluado en la información disponible.
- Contexto: los ejemplos y pruebas publicadas llegan a 32K; no se especifica la ventana máxima nativa ni el comportamiento más allá de esa longitud.
- Licencia: Apache 2.0 permite uso comercial, pero se heredan las condiciones del modelo base Qwen3-Next-80B-A3B-Instruct (también Apache 2.0 según la model card); conviene revisar la ficha original.
- Madurez: el repositorio no tiene descargas ni valoraciones y los benchmarks están pendientes de publicación, por lo que no existe evidencia independiente de calidad.
- Dependencia de herramienta: requiere una versión reciente de llama.cpp con soporte de Qwen3-Next; otras herramientas de inferencia pueden no cargar la arquitectura.
- Formato único: solo se distribuye Q4_K_M, sin variantes de menor o mayor precisión para escenarios con restricciones de memoria o requisitos de calidad superiores.
- Sesgos: no se documenta en la información disponible ninguna evaluación de sesgos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SmallAICreator/GRAFT-50B-A3B-GGUF
- Modelo base Qwen3-Next-80B-A3B-Instruct: https://huggingface.co/Qwen/Qwen3-Next-80B-A3B-Instruct
- GRAFT-10B-A2B (mismo autor): https://huggingface.co/SmallAICreator/GRAFT-10B-A2B-GGUF
- GRAFT-1B (mismo autor): https://huggingface.co/SmallAICreator/GRAFT-1B
- Aplicación Android L-AI para ejecutar GGUF en local: https://huggingface.co/SmallAICreator/L-AI-Android
- Repositorio de llama.cpp: https://github.com/ggml-org/llama.cpp

Nota: la búsqueda web realizada no devolvió resultados relevantes sobre este modelo; los enlaces anteriores proceden de la model card y de los metadatos de Hugging Face.
