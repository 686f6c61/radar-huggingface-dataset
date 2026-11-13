# dnhkng/RYS-XLarge

## Resumen

RYS-XLarge es un modelo de lenguaje de 77.965.463.552 parámetros (aproximadamente 78B) desarrollado por dnhkng, derivado de MaziyarPanahi/calme-2.1-qwen2-72b, que a su vez procede de Qwen2-72B. Su particularidad es que no introduce ningún cambio en los pesos: el autor aplica una técnica de duplicación de capas (self-merging) basada en un análisis funcional del stack transformer. En concreto, las capas 0-51 se ejecutan y a continuación las capas 45-79 se ejecutan de nuevo, de modo que las capas 45-51 se procesan dos veces, añadiendo siete capas extra a un stack de 80 y llevando el modelo de 72B a 78B.

El método, descrito en el artículo "LLM Neuroanatomy: How I Topped the LLM Leaderboard Without Changing a Single Weight", parte de la hipótesis de que el stack no es uniforme: las capas iniciales codifican la entrada, las finales escriben la salida y las intermedias concentran el razonamiento. Barriendo todos los bloques contiguos `[i, j)` y reevaluándolos se obtiene un mapa de calor de qué bloques ayudan y cuáles perjudican; los que mejoran se agrupan en la zona media del stack. Duplicar uno de esos bloques produce mejoras medibles en benchmarks de razonamiento sin reentrenamiento, sin descenso de gradiente y sin modificar un solo peso.

Es relevante porque demuestra que es posible mejorar un modelo open source de 72B en el Open LLM Leaderboard (el autor afirma haber alcanzado el puesto 1) mediante una intervención puramente estructural y con licencia MIT, lo que abre una vía de optimización ortogonal al fine-tuning clásico. La contrapartida es que el layout no es universal: cada familia de modelos coloca sus circuitos duplicables en posiciones distintas, por lo que el barrido debe repetirse por arquitectura.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2), con duplicación de capas 45-51 |
| Parámetros totales | 77.965.463.552 (≈78B) |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible |
| Idiomas soportados | No disponible |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only de la familia Qwen2, con 80 capas en el modelo base de 72B. La modificación consiste en ejecutar las capas 0-51 y luego las capas 45-79, de forma que las capas 45-51 se ejecutan dos veces. Las capas duplicadas son copias byte a byte de capas ya existentes en el modelo: no hay fine-tuning, ni descenso de gradiente, ni modificación de pesos de ningún tipo. El modelo parte de MaziyarPanahi/calme-2.1-qwen2-72b, un fine-tune de Qwen2-72B, y el método se aplica después del fine-tuning, por lo que es ortogonal a este.

La innovación técnica es el procedimiento de barrido: para cada bloque contiguo `[i, j)` del stack se reevalúa el modelo ejecutando ese bloque una segunda vez y se mide el efecto sobre benchmarks de razonamiento (matemáticas y EQ). El resultado es un mapa de calor con regiones de mejora (rojo) y degradación (azul). El análisis revela que las tareas no coinciden en qué hace el stack: las matemáticas toleran la duplicación casi en cualquier punto antes de la capa 60, mientras que EQ muestra una estructura más nítida, con regiones buenas separadas por regiones malas. La configuración elegida para RYS-XLarge fue (45, 52). El autor señala que el layout no es universal y publica comparativas con Llama-3-70B-Instruct, cuyo mapa de duplicación difiere.

## Capacidades

- Generación de texto conversacional y de propósito general, heredada del fine-tune calme-2.1-qwen2-72b.
- Razonamiento mejorado en tareas de matemáticas y lógica respecto al modelo base, según los benchmarks declarados.
- Seguimiento de instrucciones, con una puntuación de 79,96 en IFEval 0-shot.
- Razonamiento multi-paso y de sentido común, con 58,77 en BBH 3-shot y 23,72 en MuSR 0-shot.
- Conocimiento académico y profesional, con 49,2 en MMLU-PRO 5-shot.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente y multi-step reasoning: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Capacidades especiales (thinking mode, visión, audio): no disponible en la información proporcionada.

## Casos de uso

- Razonamiento matemático asistido: el modelo muestra una mejora del 8,16% en MATH Lvl 5 respecto a su base, lo que lo hace adecuado para resolver problemas de competición y verificación de cálculos paso a paso en entornos educativos o de investigación.
- Evaluación de técnicas de optimización de modelos: al ser un ejemplo documentado de duplicación de capas, sirve como referencia para investigadores que quieran reproducir el barrido de bloques en otras arquitecturas y medir el efecto sobre benchmarks.
- Generación de texto conversacional de calidad: al derivar de un fine-tune orientado a conversación, puede emplearse en asistentes de chat con respuestas largas y coherentes, siempre que se valide el comportamiento en el dominio concreto.
- Seguimiento estricto de instrucciones: su 79,96 en IFEval 0-shot lo hace útil en pipelines donde el modelo debe respetar formatos, restricciones y plantillas de salida de forma fiable.
- Razonamiento de sentido común y multi-paso: el 58,77 en BBH 3-shot permite usarlo en tareas de planificación y deducción encadenada, como resolución de acertijos lógicos o análisis de escenarios.
- Investigación sobre interpretabilidad: el mapa de calor publicado por el autor y la separación entre regiones de matemáticas y EQ ofrecen material para estudiar qué capas del transformer concentran distintas capacidades.
- Base para experimentos de merging y edición estructural: dado que el método no toca pesos, es un punto de partida limpio para combinar duplicación de capas con otras técnicas de optimización sin interferencias de fine-tuning.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (fuente: Open LLM Leaderboard). No verificados de forma independiente.

| Benchmark | Configuración | Métrica | Valor |
|---|---|---|---|
| IFEval | 0-shot | strict accuracy | 79,96 |
| BBH | 3-shot | normalized accuracy | 58,77 |
| MATH Lvl 5 | 4-shot | exact match | 38,97 |
| GPQA | 0-shot | acc_norm | 17,9 |
| MuSR | 0-shot | acc_norm | 23,72 |
| MMLU-PRO | 5-shot | accuracy | 49,2 |

Mejora declarada respecto al modelo base por duplicación de capas:

| Métrica | Mejora |
|---|---|
| Media | +2,61% |
| IFEval | -2,05% |
| BBH | +2,51% |
| MATH Lvl 5 | +8,16% |
| GPQA | +2,58% |
| MuSR | +17,72% |
| MMLU-PRO | +0,31% |

## Requisitos de hardware

- VRAM estimada para inferencia en precisión completa (BF16/FP16): aproximadamente 156 GB solo para pesos, más overhead de activaciones y KV cache; se requieren múltiples GPU.
- VRAM estimada en cuantización de 8 bits: en torno a 78 GB, lo que permite desplegarlo en una sola GPU de 80 GB (A100 80GB, H100 80GB).
- VRAM estimada en cuantización de 4 bits: en torno a 40-45 GB, viable en una A100 40GB ajustada o en configuraciones de dos RTX 4090 (24 GB cada una) con reparto de capas.
- GPU recomendadas: A100 80GB, H100 80GB, H200; para cuantizaciones agresivas, 2x RTX 4090 o 2x RTX 3090.
- ¿Cabe en GPU consumer? En BF16 no. En 4 bits puede caber en configuraciones multi-GPU de 24 GB, con latencia mayor.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (tag endpoints_compatible), vLLM y llama.cpp son opciones habituales para esta arquitectura, aunque no se confirman en la información proporcionada.
- Latencia y throughput estimados: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| RYS-XLarge | ≈78B | No disponible | MIT | Duplicación de capas sobre Qwen2-72B; 79,96 IFEval, 58,77 BBH |
| Qwen2-72B | 72B | No disponible | No disponible | Modelo base de la familia; referencia para medir la mejora del método |
| calme-2.1-qwen2-72b | 72B | No disponible | No disponible | Fine-tune directo del que deriva RYS-XLarge |
| Llama-3-70B-Instruct | 70B | No disponible | No disponible | Usado por el autor como comparación del mapa de duplicación por arquitectura |

La comparación cuantitativa con alternativas no está disponible en la información proporcionada más allá de los datos del propio modelo y de la referencia a Llama-3-70B-Instruct como ejemplo de arquitectura con distinto layout de duplicación.

## Limitaciones y advertencias

- Los benchmarks son declarados por el autor y no están verificados de forma independiente (`verified: false` en la model-index).
- La mejora no es uniforme: IFEval empeora un 2,05% respecto al base, por lo que el modelo puede ser peor en seguimiento estricto de instrucciones que su predecesor.
- El layout de duplicación no es universal: el propio autor indica que cada familia de modelos coloca sus circuitos duplicables en posiciones distintas y que el barrido debe repetirse por arquitectura.
- No hay información sobre sesgos conocidos, composición del dataset de entrenamiento ni evaluación de seguridad.
- Riesgo de alucinación: no cuantificado en la información disponible; como todo modelo generativo de esta escala, debe validarse en dominios críticos.
- Idiomas soportados no documentados; no se puede garantizar un rendimiento multilingüe sin evaluación previa.
- Longitud de contexto no documentada, lo que impide planificar casos de uso con ventanas largas.
- Licencia MIT: permite uso comercial y modificación, pero conviene revisar las licencias del modelo base y del fine-tune intermedio por si imponen condiciones adicionales.
- El tamaño de 78B exige infraestructura multi-GPU en precisión completa; el despliegue en producción requiere cuantización y validación específica.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dnhkng/RYS-XLarge
- Artículo del método (LLM Neuroanatomy): https://dnhkng.github.io/posts/rys/
- Segunda parte del artículo: https://dnhkng.github.io/posts/rys-ii/
- Tercera parte del artículo: https://dnhkng.github.io/posts/sapir-whorf/
- Open LLM Leaderboard (consulta del modelo): https://huggingface.co/spaces/open-llm-leaderboard/open_llm_leaderboard?query=dnhkng/RYS-XLarge
- Modelo base del fine-tune: https://huggingface.co/MaziyarPanahi/calme-2.1-qwen2-72b
