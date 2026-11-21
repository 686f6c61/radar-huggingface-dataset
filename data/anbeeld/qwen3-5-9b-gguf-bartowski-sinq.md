# Anbeeld/Qwen3.5-9B-GGUF-Bartowski-SINQ

## Resumen

Qwen3.5-9B-GGUF-Bartowski-SINQ es una cuantización en formato GGUF del modelo multimodal Qwen3.5-9B de Alibaba Qwen, publicada por el usuario Anbeeld bajo licencia Apache 2.0. El modelo base es un transformer de 9.197.093.888 parámetros (aproximadamente 9,2 mil millones) con capacidad image-text-to-text, es decir, acepta entradas de imagen y texto y genera texto. Esta versión concreta aplica la técnica SINQ (una variante de cuantización post-entrenamiento) sobre las recetas de cuantización de Bartowski, manteniendo los mismos perfiles de bits y anchos de grupo.

La relevancia de esta ficha radica en que el autor publica una evaluación de divergencia KL (KLD) frente a la referencia BF16 sobre el corpus completo Wikitext-2, comparando cada cuantización SINQ con su equivalente estándar de Bartowski. Los resultados muestran mejoras de KLD medio que van del 2,81 % (IQ2_S) al 45,23 % (Q4_0), lo que permite ejecutar un modelo de 9B multimodo en hardware de consumo con una pérdida de fidelidad medible y, en general, menor que la de las cuantizaciones estándar equivalentes.

El modelo está pensado para despliegue local y en endpoints compatibles con llama.cpp, y su formato GGUF lo hace utilizable en herramientas como llama.cpp, Ollama o servidores compatibles. La información disponible no detalla la composición del dataset de entrenamiento del modelo base ni sus benchmarks de tareas, por lo que esta ficha se limita a los datos verificables publicados por el autor de la cuantización y a las especificaciones del repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (modelo base Qwen3.5-9B; detalles de atención no disponibles) |
| Parametros totales | 9.197.093.888 (9,2 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 65.536 tokens (64K) usados en la evaluación KLD; contexto máximo del modelo base no disponible |
| Tipos de cuantizacion | IQ2_S, IQ2_M, Q2_K, IQ3_XXS, IQ3_XS, Q3_K_S, IQ3_M, Q3_K_M, Q2_K_L, Q3_K_L, IQ4_XS, IQ4_NL, Q4_0, Q4_K_S, Q4_K_M, Q4_1 (según tabla publicada) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo base Qwen3.5-9B es un transformer de 9,2 mil millones de parámetros con pipeline image-text-to-text, lo que implica un codificador visual acoplado a un decodificador de lenguaje. La información proporcionada no detalla la arquitectura interna (tipo de atención, número de capas, dimensión oculta) ni la composición del dataset de entrenamiento, el número de tokens vistos o si se aplicaron etapas de RLHF o DPO. Tampoco se especifican innovaciones como decodificación especulativa o atención lineal en el modelo base.

La contribución técnica de esta publicación es la cuantización. El autor aplica SINQ durante el proceso de cuantización siguiendo 1:1 las recetas de Bartowski para Qwen3.5-9B, y evalúa cada variante frente a la referencia BF16 con el corpus de test completo de Wikitext-2. La medición usa 297.193 objetivos de siguiente token alineados, contexto de 65.536 tokens, caché K/V en BF16, batch 512 y microbatch 256. Según la model card, SINQ solo es compatible con BeeLlama.cpp v0.5.0, lo que constituye una dependencia de runtime relevante para el despliegue.

## Capacidades

- Generación de texto conversacional, según la etiqueta `conversational` del repositorio.
- Procesamiento image-text-to-text: acepta imágenes junto con texto y produce respuestas textuales (pipeline declarado por el autor).
- Compatibilidad con endpoints (`endpoints_compatible`), orientada a servidores de inferencia.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Modo thinking, audio u otras capacidades especiales: no disponible en la información proporcionada.

## Casos de uso

- Asistente conversacional local con entrada de imágenes: el modelo puede recibir una captura o fotografía junto a una pregunta y generar una respuesta textual; su tamaño de 9,2 B y las cuantizaciones de 4 a 6 GB permiten ejecutarlo en equipos de sobremesa con GPU de consumo.
- Descripción y análisis de imágenes en flujos de accesibilidad: generación de texto alternativo o resúmenes de contenido visual en lotes, usando la variante Q4_K_M (6,17 GB) para equilibrar calidad y huella de memoria.
- Prototipado de aplicaciones multimodales en local: integración en scripts de Python mediante llama.cpp o BeeLlama.cpp para experimentar con entradas image-text-to-text sin depender de APIs externas.
- Despliegue en entornos con recursos limitados: la variante IQ2_S (3,97 GB) permite ejecutar el modelo en GPU con 4-6 GB de VRAM, útil para pruebas en portátiles o tarjetas de gama de entrada.
- Evaluación de cuantizaciones y pipelines de compresión: el repositorio incluye métricas KLD, Top-1 y PPL sobre Wikitext-2, lo que lo convierte en un banco de pruebas para comparar recetas de cuantización en un modelo multimodal de 9B.
- Servicio de inferencia compatible con endpoints: al declararse `endpoints_compatible`, puede integrarse en servidores HTTP de inferencia que acepten GGUF y expongan una API de chat con soporte de imágenes.

## Benchmarks y rendimiento

El autor publica métricas de fidelidad de cuantización (no benchmarks de tareas como MMLU o HumanEval). La tabla siguiente resume una variante SINQ seleccionada por receta, medida sobre el corpus completo Wikitext-2 con referencia BF16 Qwen3.5-9B, 297.193 objetivos, contexto 64K, caché K/V BF16, batch 512 y microbatch 256. KLD es KL(referencia BF16 || cuantización); valores menores son mejores.

| Receta | Tamano (GB) | Ancho | Fuerza | KLD medio | KLD medio stock | Mejora | Top-1 | PPL |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| IQ2_S | 3,969 | 64 | 0,5 | 0,296414 | 0,304985 | +2,81 % | 77,767 % | 7,9476 |
| IQ2_M | 4,030 | 128 | 1 | 0,190647 | 0,208352 | +8,50 % | 82,289 % | 7,3301 |
| Q2_K | 4,325 | 128 | 1 | 0,174333 | 0,181668 | +4,04 % | 83,260 % | 7,3516 |
| IQ3_XXS | 4,537 | 32 | 1 | 0,105045 | 0,109045 | +3,67 % | 87,147 % | 7,0444 |
| IQ3_XS | 4,821 | 128 | 1 | 0,082945 | 0,087121 | +4,79 % | 89,097 % | 6,9498 |
| Q3_K_S | 4,930 | 16 | 1 | 0,090341 | 0,108564 | +16,79 % | 88,319 % | 6,9250 |
| IQ3_M | 4,983 | 128 | 0,75 | 0,072853 | 0,076942 | +5,31 % | 89,838 % | 6,9168 |
| Q3_K_M | 5,181 | 16 | 0,75 | 0,066111 | 0,076790 | +13,91 % | 90,158 % | 6,8574 |
| Q2_K_L | 5,318 | 128 | 0,5 | 0,167975 | 0,174032 | +3,48 % | 83,509 % | 7,2788 |
| Q3_K_L | 5,372 | 16 | 0,75 | 0,062988 | 0,074503 | +15,46 % | 90,395 % | 6,8629 |
| IQ4_XS | 5,503 | 64 | 0,5 | 0,029253 | 0,032306 | +9,45 % | 93,778 % | 6,7584 |
| IQ4_NL | 5,740 | 16 | 0,5 | 0,029059 | 0,031595 | +8,03 % | 93,871 % | 6,7463 |
| Q4_0 | 5,744 | 128 | 1 | 0,039437 | 0,072005 | +45,23 % | 92,820 % | 6,8491 |
| Q4_K_S | 5,859 | 16 | 0,5 | 0,025652 | 0,029209 | +12,18 % | 94,313 % | 6,7207 |
| Q4_K_M | 6,172 | 32 | 0,5 | 0,022183 | 0,025043 | +11,42 % | 94,788 % | 6,7553 |
| Q4_1 | 6,206 | 32 | 0,75 | no disponible en el extracto | no disponible | no disponible | no disponible | no disponible |

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente el tamaño del archivo GGUF más la caché K/V. Con contexto 64K y caché BF16, la caché K/V puede ser considerable; para uso típico con contextos menores, la VRAM ronda los 5-8 GB según la variante.
- Variantes ligeras (IQ2_S 3,97 GB, IQ2_M 4,03 GB, Q2_K 4,33 GB): aptas para GPU de 6-8 GB de VRAM, como RTX 3060, RTX 4060 o RTX 2070.
- Variantes medias (IQ3_XS 4,82 GB, Q3_K_M 5,18 GB, Q3_K_L 5,37 GB): recomendables con 8 GB de VRAM.
- Variantes de 4 bits (IQ4_XS 5,50 GB, Q4_K_M 6,17 GB): requieren 8-10 GB de VRAM; encajan en RTX 3080, RTX 4070 o superiores.
- GPU de centro de datos (A100, H100) no son necesarias para este tamaño, pero permiten servir múltiples peticiones concurrentes o contextos de 64K completos con holgura.
- Cabe en GPU de consumo: sí, en la mayoría de tarjetas con 8 GB o más para las variantes de 3-4 bits; las variantes de 2 bits caben en 6 GB.
- Opciones de despliegue: llama.cpp y BeeLlama.cpp v0.5.0 (requerido para SINQ), además de herramientas compatibles con GGUF como Ollama o servidores de endpoints compatibles. No se indica compatibilidad con vLLM o TGI, que habitualmente no consumen GGUF.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---:|---|---|---|---|
| Qwen3.5-9B-GGUF-Bartowski-SINQ (este) | 9,2 B | 64K en evaluación | GGUF con SINQ | Apache 2.0 | Requiere BeeLlama.cpp v0.5.0 para SINQ |
| Qwen3.5-9B (BF16 original) | 9,2 B | no disponible | safetensors | Apache 2.0 | Referencia de fidelidad; mayor huella de memoria |
| Cuantizaciones stock de Bartowski de Qwen3.5-9B | 9,2 B | no disponible | GGUF | Apache 2.0 | Misma receta sin SINQ; KLD medio superior según el autor |
| Cuantizaciones de Unsloth de Qwen3.5-9B | 9,2 B | no disponible | GGUF | Apache 2.0 | Comparadas en la model card; datos concretos de KLD no disponibles en el extracto |

No se dispone de datos de benchmarks de tareas para comparar el rendimiento funcional con alternativas de la misma categoría.

## Limitaciones y advertencias

- Dependencia de runtime: SINQ solo es compatible con BeeLlama.cpp v0.5.0; otras herramientas que lean GGUF pueden no interpretar correctamente estas variantes.
- Las cuantizaciones de 2 bits (IQ2_S, IQ2_M, Q2_K) presentan KLD medio de 0,17-0,30 y Top-1 de 77-83 %, con pérdida de fidelidad apreciable frente a BF16; no son adecuadas para tareas que exijan alta precisión.
- La evaluación de fidelidad se limita a Wikitext-2 y a la predicción del siguiente token; no mide rendimiento en tareas multimodales, razonamiento o código.
- Riesgo de alucinación: no cuantificado en la información disponible; es un riesgo inherente a los modelos de lenguaje y debe mitigarse con verificación externa en producción.
- Sesgos conocidos: no disponibles en la información proporcionada.
- Idiomas soportados: no disponibles; conviene validar el comportamiento en castellano antes de desplegar.
- Licencia Apache 2.0: permite uso comercial, pero debe conservarse el aviso de licencia y verificarse las condiciones del modelo base Qwen3.5-9B.
- El repositorio tiene 162,1 GB por incluir múltiples variantes; descargar solo el archivo GGUF necesario.
- No se han publicado benchmarks de tareas ni datos de latencia/throughput, lo que dificulta estimar el rendimiento en producción sin pruebas propias.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Anbeeld/Qwen3.5-9B-GGUF-Bartowski-SINQ
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.5-9B/blob/main/LICENSE
- Recetas de cuantización de Bartowski: https://huggingface.co/bartowski/Qwen_Qwen3.5-9B-GGUF
- Runtime BeeLlama.cpp: https://github.com/Anbeeld/beellama.cpp
