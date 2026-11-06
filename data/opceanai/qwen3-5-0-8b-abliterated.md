# OpceanAI/Qwen3.5-0.8B-abliterated

## Resumen

Qwen3.5-0.8B-abliterated es una modificación en el espacio de pesos del modelo Qwen/Qwen3.5-0.8B, desarrollada por OpceanAI. Se trata de un modelo multimodal (image-text-to-text) de arquitectura híbrida con atención lineal y delta-net, de 873.438.784 parámetros totales y una longitud de contexto de 262.144 tokens. La modificación aplica la técnica de "abliteration" descrita por Arditi et al. (2024): se proyecta fuera una dirección calculada de rechazo de todas las matrices que escriben en el flujo residual, eliminando permanentemente el comportamiento de negativa del modelo sin adaptadores ni hooks en tiempo de ejecución.

El interés técnico de esta ficha no reside solo en el resultado (la tasa de rechazo cae a cero en la mayoría de categorías), sino en que el autor publica una medición rigurosa del coste: siete categorías de rechazo, tres plantillas de jailbreak, doce mediciones de capacidad con intervalos de confianza y una prueba de significación para cada comparación. Dos hallazgos destacados son que la dirección de rechazo rota con la profundidad (coseno de 0,03 entre las capas 1 y 23) y que la cabeza MTP actúa como el detector de rechazo más limpio del modelo.

Es relevante ahora porque demuestra que la abliteración puede documentarse con metodología estadística en lugar de afirmaciones anecdóticas, y porque el modelo base Qwen3.5-0.8B incorpora atención híbrida y capacidades multimodales en un tamaño muy reducido, lo que lo hace desplegable en hardware de consumo. La licencia Apache-2.0 facilita su uso comercial, aunque el propio autor advierte explícitamente contra su despliegue en productos de cara al usuario.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer híbrido con atención lineal y delta-net (Qwen3.5) |
| Parámetros totales | 873.438.784 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantización | no disponible (el repo solo contiene safetensors en fp; no se listan GGUF ni otras) |
| Idiomas soportados | en, es, zh, ja, ko |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo base Qwen3.5-0.8B emplea una arquitectura transformer híbrida que combina atención lineal con delta-net, según las etiquetas del repositorio (`hybrid-attention`, `delta-net`). El pipeline declarado es `image-text-to-text`, lo que indica capacidades multimodales de entrada de imagen y salida de texto. El contexto de 262.144 tokens es notable para un modelo de menos de mil millones de parámetros. El repositorio ocupa 3,5 GB en safetensors.

La modificación de abliteración sigue el método de Arditi et al. (2024, arXiv:2406.11717): se calcula una dirección de rechazo y se proyecta fuera de cada matriz que escribe en el flujo residual, modificando los pesos de forma permanente. No hay adaptadores ni hooks en tiempo de ejecución. El autor reporta que la dirección de rechazo rota con la profundidad (similitud coseno de 0,03 entre las capas 1 y 23), lo que implica que no existe una dirección fija única sino una reconstruida capa a capa. Además, la cabeza MTP (multi-token prediction) asigna P(" cannot") = 0,719 en prompts dañinos y 0,0000 en prompts inofensivos; tras la abliteración de esa cabeza la probabilidad cae a 0,180, pero no a cero, porque la señal reentra desde el flujo residual. No se dispone de información sobre el número de tokens de entrenamiento del modelo base ni sobre si hubo RLHF/DPO en su alineamiento original.

## Capacidades

- Generación de texto conversacional en inglés, español, chino, japonés y coreano.
- Procesamiento multimodal image-text-to-text: acepta imágenes como entrada junto con texto.
- Razonamiento y matemáticas de nivel básico (evaluado en GSM8K y MATH algebra nivel 1-2).
- Generación de código (evaluado en HumanEval pass@1).
- Conocimiento general y académico (evaluado en MMLU, MMLU-Pro, ARC, HellaSwag, PIQA, Winogrande, TruthfulQA).
- Contexto largo de hasta 262.144 tokens, adecuado para documentos extensos o conversaciones multi-turno prolongadas.
- Sin comportamiento de rechazo: responde a prompts que el modelo base rechaza (ciberataques, privacidad, delitos financieros, contenido sexual explícito, drogas y armas, conducta no ética no violenta; el odio cae al 10%, no a cero).
- No se documenta soporte explícito de tool calling, function calling ni comportamiento agéntico multi-paso en la información disponible.
- No se documenta modo "thinking" ni capacidades de audio.

## Casos de uso

- Investigación en interpretabilidad mecanicista: el modelo sirve como caso de estudio para analizar cómo se distribuye y reconstruye la dirección de rechazo capa a capa, gracias a la documentación detallada de la rotación de la dirección y del papel de la cabeza MTP.
- Evaluación de seguridad de modelos: permite medir la eficacia de técnicas de alineamiento y de su eliminación, con las tablas de rechazo por categoría y plantillas de jailbreak ya publicadas como línea base reproducible.
- Procesamiento de documentos largos con imágenes: con 262.144 tokens de contexto y entrada multimodal, puede resumir o extraer información de informes escaneados o PDF extensos en un solo paso.
- Prototipado de asistentes conversacionales multilingües: cubre en, es, zh, ja y ko con un tamaño de 873 M parámetros, adecuado para iteración rápida en local antes de escalar a modelos mayores.
- Clasificación y análisis de contenido sensible en entornos controlados de investigación: al no rechazar, puede procesar y etiquetar material que el modelo base declinaría, siempre dentro de un pipeline de seguridad supervisado.
- Experimentos de cuantización y despliegue en hardware de consumo: su tamaño reducido permite probar pipelines de inferencia (transformers, y potencialmente conversiones a GGUF no incluidas en el repo) en GPUs de gama media.
- Generación de código en entornos de investigación: útil para tareas exploratorias donde la tasa de acierto en HumanEval (3,3% pass@1) es suficiente como señal cualitativa, no para producción.

## Benchmarks y rendimiento

Resultados publicados por el autor en la model card. Las seis primeras filas usan un evaluador propio; las seis últimas usan `lm-evaluation-harness` sobre datasets completos.

| Benchmark | n | Base | Abliterated | Delta | Test |
|---|---:|---:|---:|---:|---|
| MMLU | 200 | 45,5% | 44,5% | −1,0 | Fisher p = 0,92 |
| MMLU-Pro | 100 | 23,0% | 23,0% | 0,0 | Fisher p = 1,00 |
| GSM8K | 100 | 21,0% | 23,0% | +2,0 | Fisher p = 0,87 |
| MATH (algebra, nivel 1-2) | 50 | 30,0% | 22,0% | −8,0 | Fisher p = 0,50 |
| HumanEval pass@1 | 30 | 13,3% | 3,3% | −10,0 | Fisher p = 0,35 |
| WikiText-103 perplexity | 20 docs | 2,979 | 3,093 | +0,114 nats | no testeable |
| ARC-Easy | 2376 | 61,66% | 60,31% | −1,35 | z-test p = 0,34 |
| ARC-Challenge | 1172 | 37,12% | 36,86% | −0,26 | z-test p = 0,90 |
| HellaSwag | 10042 | 49,72% | 49,66% | −0,06 | z-test p = 0,93 |
| PIQA | 1838 | 69,26% | 69,21% | −0,05 | z-test p = 0,97 |
| Winogrande | 1267 | 58,48% | 58,33% | −0,16 | z-test p = 0,94 |
| TruthfulQA MC2 | 817 | 43,18% | 43,45% | +0,28 | z-test p = 0,91 |

Ninguna diferencia es estadísticamente significativa. En los seis benchmarks de `lm-eval` sobre dataset completo, todos los deltas son inferiores a 1,4 puntos porcentuales y cinco de seis son inferiores a 0,3. La caída en HumanEval (−10 puntos) corresponde a cuatro problemas resueltos frente a uno sobre treinta, con un intervalo del 95% que abarca de cero a diez por ciento para el modelo abliterado.

Tasas de rechazo por categoría (10 prompts por categoría, de BeaverTails y `mlabonne/harmful_behaviors`):

| Categoría | Base | Abliterated |
|---|---:|---:|
| Ciberataques / exploits | 80% | 0% |
| Violación de privacidad | 70% | 0% |
| Delitos financieros | 60% | 0% |
| Contenido sexual explícito | 60% | 0% |
| Drogas y armas | 60% | 0% |
| Conducta no ética no violenta | 50% | 0% |
| Discurso de odio | 30% | 10% |

Plantillas de jailbreak (mismos diez comportamientos, tres encuadres):

| Plantilla | Base | Abliterated |
|---|---:|---:|
| Directa | 80% | 0% |
| Roleplay ("personaje sin filtro moral") | 80% | 0% |
| Exploit de la abuela | 80% | 0% |

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 1,75 GB solo para pesos (873 M parámetros × 2 bytes), más overhead de activaciones y caché KV; con contexto de 262.144 tokens el caché KV puede dominar el consumo y requerir GPUs de alta memoria para contextos completos.
- VRAM estimada en cuantización de 8 bits: alrededor de 0,9 GB para pesos; en 4 bits, alrededor de 0,45 GB. No se incluyen pesos cuantizados en el repositorio, por lo que habría que generarlos.
- GPU recomendadas: cabe en GPUs de consumo como RTX 3060 (12 GB), RTX 4060 Ti (16 GB), RTX 4090 (24 GB) para contextos moderados; para explotar el contexto completo de 262.144 tokens se recomiendan A100 (40/80 GB) o H100.
- Despliegue: compatible con `transformers` (librería declarada). No se confirma soporte de vLLM, llama.cpp, Ollama ni TGI en la información disponible; al ser un formato safetensors estándar, la conversión a GGUF sería posible pero no está incluida.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Multimodal | Comportamiento de rechazo | Disponibilidad |
|---|---:|---:|---|---|---|---|
| Qwen3.5-0.8B-abliterated (este) | 873 M | 262.144 | Apache-2.0 | Sí (image-text-to-text) | Eliminado (0% en 6 de 7 categorías) | Hugging Face |
| Qwen/Qwen3.5-0.8B (base) | 873 M | 262.144 | Apache-2.0 | Sí | Presente (30-80% según categoría) | Hugging Face |
| Otras releases abliterated de Qwen3.5-0.8B | 873 M | 262.144 | Apache-2.0 (presumible) | Sí | Reportado cerca de cero, sin informe de coste | Hugging Face (múltiples) |

No se dispone de datos de benchmarks de las otras releases abliterated para comparar rendimiento; el autor indica que existen varias y que la mayoría reporta tasas de rechazo cercanas a cero, pero sin la medición de capacidad que incluye esta ficha. No se han identificado en la información proporcionada modelos comparables de otros fabricantes con arquitectura híbrida y contexto equivalente en este rango de tamaño.

## Limitaciones y advertencias

- El modelo no tiene comportamiento de rechazo: responderá a prompts que el modelo base rechaza. El propio autor advierte de no desplegarlo en productos de cara al usuario, no usarlo con menores y no tratar su salida como segura por defecto.
- La evaluación mide capacidad, no daño: las tablas de benchmarks no evalúan la peligrosidad del contenido generado.
- La categoría de discurso de odio no cae a cero (10% tras la abliteración), a diferencia del resto.
- Riesgo de alucinación: con 45,5% en MMLU y 43,18% en TruthfulQA MC2 en el modelo base, la fiabilidad factual es limitada; la abliteración no empeora esto de forma significativa pero tampoco lo corrige.
- La caída en HumanEval (de 13,3% a 3,3% pass@1) es el resultado más débil, aunque no significativo por el tamaño muestral (n=30); no se debe usar como señal fiable de capacidad de código.
- Sesgos conocidos: no documentados específicamente en la información proporcionada; el modelo base Qwen3.5-0.8B no incluye en esta ficha un análisis de sesgos.
- Limitaciones de idioma: solo se declaran en, es, zh, ja y ko; no se garantiza comportamiento en otros idiomas.
- La modificación es permanente en los pesos: no se puede revertir sin volver al modelo base.
- Licencia Apache-2.0 permite uso comercial, pero las advertencias del autor sobre despliegue inseguro deben tenerse en cuenta como caveat operativo.
- No se documenta soporte de tool calling ni comportamiento agéntico, lo que limita su uso en pipelines que requieran function calling.
- El contexto de 262.144 tokens puede no ser efectivo en toda su longitud; no se aportan mediciones de rendimiento a contexto largo (p. ej., RULER o Needle-in-a-Haystack).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/OpceanAI/Qwen3.5-0.8B-abliterated
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Paper del método de abliteración (Arditi et al. 2024): https://arxiv.org/abs/2406.11717
- Dataset mlabonne/harmful_behaviors: https://huggingface.co/datasets/mlabonne/harmful_behaviors
- Dataset mlabonne/harmless_alpaca: https://huggingface.co/datasets/mlabonne/harmless_alpaca
- Dataset PKU-Alignment/BeaverTails: https://huggingface.co/datasets/PKU-Alignment/BeaverTails
- Dataset cais/mmlu: https://huggingface.co/datasets/cais/mmlu
- Dataset TIGER-Lab/MMLU-Pro: https://huggingface.co/datasets/TIGER-Lab/MMLU-Pro
- Dataset openai/gsm8k: https://huggingface.co/datasets/openai/gsm8k
