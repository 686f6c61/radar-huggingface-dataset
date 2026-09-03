# CraneAILabs/edu-ganda-gemma-e2b-v4

## Resumen

`edu-ganda-gemma-e2b-v4` es un checkpoint experimental de investigación desarrollado por Crane AI Labs, un laboratorio centrado en aplicaciones de IA para el Sur Global. Se trata de un ajuste fino del modelo base `google/gemma-4-e2b-it` (5,1 mil millones de parámetros) mediante GRPO (Group Relative Policy Optimization), orientado a la creación de un asistente educativo de primaria en luganda, lengua bantú hablada en Uganda. El modelo forma parte de una línea de trabajo más amplia que incluye otros modelos como `ganda-gemma-1b` y el proyecto EduGanda, todos enfocados en alfabetización y educación asistida por IA en escuelas ugandesas.

Este checkpoint concreto es la versión de servicio con cuantización QAT W8A8 (pesos y activaciones de 8 bits) de la línea interna `ganda-e2b-v4`. Según la model card, destaca por su capacidad de seguir instrucciones y por producir prosa fluida en luganda, pero presenta errores significativos en la precisión del contenido en luganda (glosas incorrectas, reglas gramaticales inventadas). En una prueba A/B ciega con diez profesores, estos prefirieron el modelo base sin ajustar en un 61/39, debido precisamente a esos errores de contenido. El modelo no está pensado para producción directa y requiere guardas de decodificación específicas para evitar bucles de repetición.

Su relevancia radica en ser un intento de adaptar un modelo de propósito general a una lengua de bajos recursos, con un enfoque en educación. Sin embargo, sus limitaciones documentadas lo convierten en un candidato para investigación y como donante de fusión, más que para uso productivo sin supervisión.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Gemma-4-E2B) |
| Parametros totales | 5.104.297.539 (5,1 B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | QAT W8A8 (pesos y activaciones de 8 bits) |
| Idiomas soportados | Luganda (lg), ingles (en) |
| Licencia | Gemma (licencia de Google) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `google/gemma-4-e2b-it`, un modelo de la familia Gemma 4 con 5,1 B de parámetros. La model card no proporciona detalles sobre la arquitectura interna (número de capas, atención, etc.), pero al ser una variante de Gemma, se asume una arquitectura transformer estándar con atención causal. El ajuste fino se realizó mediante GRPO, una técnica de optimización de políticas basada en refuerzo, dentro de un linaje de entrenamiento de julio de 2026. No se especifican los datos de entrenamiento (número de tokens, composición del dataset, ni si hubo etapas previas de SFT o CPT).

El checkpoint es la versión de servicio con cuantización QAT W8A8, lo que implica que los pesos y las activaciones se representan en 8 bits, reduciendo el uso de memoria y acelerando la inferencia. La model card menciona una nota técnica benigna: al cargar el modelo, `transformers` reporta que las proyecciones `self_attn.k_proj/k_norm/v_proj` de las capas 15 a 34 (60 claves) están ausentes y se inicializan aleatoriamente. Se verifica que la generación es coherente y no se ve afectada, tratándose de un artefacto histórico del guardado con Unsloth `save_pretrained_merged`.

## Capacidades

- Generacion de texto conversacional: el modelo está diseñado para mantener diálogos en luganda e inglés, con un template de chat estándar.
- Seguimiento de instrucciones: la model card indica que su capacidad de seguir instrucciones es notablemente superior a la de otros linajes de la misma familia.
- Fluidez en luganda: produce prosa en luganda con buena fluidez, aunque con errores de contenido factual y gramatical.
- Soporte de tool calling: no documentado.
- Soporte de agentes o razonamiento multi-paso: no documentado.
- Capacidades multilingües: limitadas a luganda e inglés; no se mencionan otras lenguas.
- Capacidades especiales (visión, audio, thinking mode): no documentadas.

## Casos de uso

- Investigacion en NLP de bajos recursos: el modelo sirve como objeto de estudio para evaluar el impacto de técnicas de alineación (GRPO) en lenguas africanas con pocos recursos digitales. Los investigadores pueden analizar sus errores de contenido para mejorar futuros entrenamientos.
- Prototipo de asistente educativo en luganda: en un entorno controlado y con supervisión humana, puede probarse como tutor de primaria para practicar conversación o generar ejercicios, siempre que el contenido sea revisado por un hablante nativo.
- Donante para fusion de modelos: la model card indica que este checkpoint se utiliza como donante en la fusión `edu-ganda-gemma-e2b-v5`, que combina su capacidad de seguir instrucciones con una base reparada en vocabulario luganda. Es un caso de uso técnico concreto para equipos que trabajan en fusión de modelos.
- Evaluacion de guardas de decodificacion: su tendencia a caer en bucles de repetición lo convierte en un banco de pruebas para estudiar técnicas como `repetition_penalty` y `no_repeat_ngram_size`, y para validar configuraciones de decodificación robustas.
- Generacion de materiales educativos en luganda (con revision): puede usarse para redactar borradores de cuentos, explicaciones o ejercicios en luganda, que luego deben ser corregidos por docentes. Su fluidez reduce el esfuerzo de redacción, pero la precisión requiere intervención humana.
- Benchmark de modelos multilingües: al compararlo con el base sin ajustar y con otros modelos de la familia, se pueden medir los efectos del ajuste fino en lenguas de bajos recursos, tanto en fluidez como en exactitud.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La unica evaluacion mencionada es una prueba A/B ciega con diez profesores, en la que prefirieron el modelo base `gemma-4-e2b-it` sin ajustar sobre este checkpoint en un 61/39, siendo el factor determinante la correccion del contenido en luganda, no la fluidez. Este dato es cualitativo y no proviene de un benchmark formal.

## Requisitos de hardware

- VRAM estimada para inferencia: con 5,1 B de parametros en bfloat16, los pesos ocupan aproximadamente 10,2 GB (tamano del repositorio). Con la cuantizacion W8A8, los pesos en 8 bits ocuparian unos 5,1 GB, mas las activaciones y el overhead, por lo que se estima un minimo de 8 GB de VRAM para inferencia con cuantizacion, y 16 GB para bf16 sin cuantizar.
- GPU recomendadas: para bf16, una GPU con 16 GB (p. ej., RTX 4080, A10G) es suficiente. Con W8A8, una GPU de 8-10 GB (p. ej., RTX 3060, RTX 3080) podria ser viable, aunque no esta confirmado.
- Compatibilidad con GPU de consumo: probablemente si, con cuantizacion W8A8 en GPUs de 8 GB o mas, pero no hay datos oficiales.
- Opciones de despliegue: la model card proporciona un ejemplo de uso con `transformers` y `torch`. No se mencionan vLLM, llama.cpp, Ollama o TGI, pero al ser un modelo de la familia Gemma, es probable que sea compatible con estas herramientas, aunque no esta verificado.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| edu-ganda-gemma-e2b-v4 (este) | 5,1 B | No disponible | Gemma | Asistente educativo en luganda, experimental |
| ganda-gemma-1b (CraneAILabs) | 1 B | No disponible | Gemma | Traduccion ingles-luganda y conversacion, salida solo en luganda |
| google/gemma-4-e2b-it (base) | 5,1 B | No disponible | Gemma | Modelo base multilingue de proposito general |

La comparativa se limita a modelos de la misma familia y del mismo autor, ya que no se dispone de informacion sobre alternativas externas. El base `gemma-4-e2b-it` es el punto de partida y, segun la evaluacion A/B, supera al checkpoint ajustado en correccion de contenido. `ganda-gemma-1b` es un modelo mas pequeno y especializado en traduccion, con un enfoque distinto.

## Limitaciones y advertencias

- Errores de contenido en luganda: el modelo produce glosas incorrectas y reglas gramaticales inventadas. No se debe confiar en sus afirmaciones factuales o gramaticales sin revision por un hablante nativo.
- Bucles de repeticion: sin guardas de decodificacion, el modelo degenera en texto repetido. Se requieren `repetition_penalty=1.15` y `no_repeat_ngram_size=3` (o configuraciones mas ligeras) para evitar este comportamiento.
- Requisitos de decodificacion especificos: es necesario incluir `<bos>` (id 2) antes del prompt con template de chat, y definir `eos_token_id` con multiples tokens de fin de secuencia (`<eos>` y `<end_of_turn>`). Omitir estos pasos produce logits incorrectos.
- Checkpoint experimental: no es un modelo de produccion. La model card lo declara explicitamente como "experimental research checkpoint".
- Nota tecnica benigna: al cargar, se reportan capas faltantes en `self_attn` (k_proj, k_norm, v_proj) para las capas 15-34, que se inicializan aleatoriamente. Aunque se verifica que la generacion es coherente, este comportamiento podria sorprender a usuarios que no conozcan el historial del modelo.
- Licencia Gemma: la licencia de Google Gemma impone restricciones de uso comercial y requiere cumplir sus terminos. No se detallan aqui, pero deben revisarse antes de cualquier despliegue.
- Sin benchmarks publicados: no hay datos de rendimiento en tareas estandar, lo que dificulta la evaluacion objetiva fuera del caso de uso especifico.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/CraneAILabs/edu-ganda-gemma-e2b-v4
- Coleccion de modelos de Crane AI Labs: https://huggingface.co/CraneAILabs/collections
- Repositorio EduGanda en GitHub: https://github.com/AutoVision-cloud/EduGanda
- Sitio web de Crane AI Labs: https://craneailabs.com/
- Documentacion de Gemma (Google AI for Developers): https://ai.google.dev/gemma/docs/get_started
