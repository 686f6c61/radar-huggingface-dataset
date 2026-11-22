# barozp/Inkling-2-Mini-Uncensored-MLX-3bit

## Resumen

Inkling-2-Mini-Uncensored-MLX-3bit es una conversión cuantizada a 3 bits en precisión mixta para MLX del modelo OpenUncensored/Inkling-2-Mini-Uncensored, que a su vez es la variante "abliterated" (con el comportamiento de rechazo eliminado) del Inkling 2 Mini de Thinking Machines Lab. El modelo original es un transformer con mezcla de expertos (MoE) de núcleo "looped" (recurrente por capas), con visión y un cabezal borrador DSpark para decodificación especulativa. Esta conversión, publicada por el usuario barozp, reduce el checkpoint de ~20 GB a 14,65 GB manteniéndose estadísticamente equivalente en benchmarks estándar.

El interés de esta ficha es doble: por un lado, documenta una receta de cuantización mixta GPTQ pensada específicamente para Apple Silicon, con atención a 8 bits y proyecciones de expertos a 3-4 bits; por otro, describe un modelo sin filtros de rechazo, lo que tiene implicaciones legales y éticas relevantes para cualquier despliegue en producción. El modelo está pensado para ejecutarse en Macs con memoria unificada mediante mlx-lm.

El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado el 22 de noviembre de 2026. La licencia declarada es Apache 2.0, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con núcleo looped (loop-core layers 6-17 ejecutadas tres veces por token), con torre de visión y cabezal borrador DSpark |
| Parametros totales | 20.867.891.200 (~20,9 mil millones) |
| Parametros activos | 3,4 mil millones (según la model card del autor de la conversión) |
| Longitud de contexto | no disponible (se han probado prompts de hasta 31.543 tokens en pruebas de recuperación needle) |
| Tipos de cuantizacion | Precisión mixta: 3 bits (group 64, GPTQ act-order) en expertos gate/up de capas 0-5 y 18-23; 4 bits (group 128) en loop-core 6-17; NVFP4 original en down projections 0-19; 4 bits (group 64) en down 20-23; 8 bits en atención y convs cortas; 5 bits embedding; 6 bits output head. Media de 4,26 bits por peso cuantizado |
| Idiomas soportados | no disponible (la calibración incluye mezcla de chat, código, turco y general) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX), cuantización GPTQ de precisión mixta |

## Arquitectura y entrenamiento

El modelo base es un transformer con mezcla de expertos cuyo núcleo central (capas 6 a 17) se ejecuta tres veces por token, una variante de "looped transformer" que aumenta la profundidad efectiva sin incrementar el número de parámetros. Cuenta con 26,4 mil millones de parámetros totales y 3,4 mil millones activos por token, además de una torre de visión y un cabezal borrador DSpark para decodificación especulativa. El checkpoint original se distribuye en formato NVFP4/MXFP8 para los expertos y BF16 para el resto.

Esta conversión no reentrena el modelo: aplica GPTQ con act-order sobre 28 matrices de expertos, calibrando con 256 secuencias de 2.048 tokens compuestas por UltraChat con plantilla de chat (50 %), biblioteca estándar de Python (20 %), Wikipedia en turco (15 %) y calibration_v5 de mlx-lm (15 %). Las matrices de atención se mantienen a 8 bits, el embedding a 5 bits y el cabezal de salida a 6 bits. Las proyecciones down de las capas 0-19 conservan el NVFP4 original byte a byte. La conversión se realizó con mlx 0.32.4 y una versión de desarrollo de mlx-lm (PR #2086), en un entorno Google Colab con A100.

## Capacidades

- Generación de texto conversacional y de propósito general, con plantilla de chat.
- Razonamiento y respuesta a preguntas de opción múltiple (evaluado en MMLU, ARC-Challenge, Winogrande, HellaSwag).
- Generación de código (la calibración incluye Python stdlib y la model card reporta pruebas con funciones Python y JavaScript).
- Capacidades de visión, heredadas de la torre de visión del modelo base (mantenida en precisión original).
- Soporte multilingüe parcial, con turco explícitamente presente en el conjunto de calibración.
- Recuperación de información en contexto largo (pruebas needle con prompts de 7.931 y 31.543 tokens, 3/3 aciertos en ambas).
- Decodificación especulativa mediante el cabezal DSpark (disponible en el pack hermano MTPLX-3bit).
- Comportamiento sin rechazo (abliterated): responde a peticiones que el modelo original rechazaría.
- No se documenta soporte explícito de tool calling ni de razonamiento multi-paso en la información disponible.

## Casos de uso

- Inferencia local en Apple Silicon: el modelo cabe en Macs de 24 GB de memoria unificada y genera a ~38 tok/s en un M5 Pro, lo que lo hace adecuado para asistentes personales y prototipos sin GPU dedicada.
- Procesamiento de documentos largos: con prompts de hasta ~31.500 tokens verificados en recuperación needle, sirve para resumir o extraer información de contratos, informes o bases de código extensas.
- Generación de código en local: útil para autocompletado y generación de funciones Python o JavaScript en entornos sin conexión, con la ventaja de privacidad de no enviar código a la nube.
- Investigación sobre alineación y seguridad: al ser una variante abliterated, permite estudiar el comportamiento de modelos sin rechazo y comparar con la versión censurada del mismo modelo.
- Evaluación de técnicas de cuantización: la model card documenta deltas de benchmark y divergencia KL frente al checkpoint original, lo que lo convierte en un caso de estudio para medir el impacto de la cuantización mixta GPTQ.
- Aplicaciones multilingües ligeras: la inclusión de turco en la calibración sugiere un rendimiento razonable en ese idioma, útil para prototipos de atención al cliente o traducción en ese par de lenguas.
- Despliegue en pipelines de CI/CD para pruebas de generación de texto: el bajo consumo de memoria y la velocidad en Apple Silicon permiten integrarlo en flujos de validación automatizados.

## Benchmarks y rendimiento

Resultados medidos con lm-evaluation-harness 0.4.13, 0-shot, loglikelihood, plantilla de chat desactivada. MMLU con las primeras 50 preguntas por asignatura (2.847), ARC-Challenge completo (1.172), Winogrande completo (1.267), HellaSwag primeras 1.000.

| Tarea | Métrica | Origen (20 GB) | Este repo (14,65 GB) | Delta | ± stderr |
|---|---|---:|---:|---:|---:|
| mmlu | acc | 0,7856 | 0,7891 | +0,0035 | 0,0073 |
| arc_challenge | acc_norm | 0,6911 | 0,6954 | +0,0043 | 0,0134 |
| winogrande | acc | 0,7127 | 0,7103 | -0,0024 | 0,0127 |
| hellaswag | acc_norm | 0,6480 | 0,6420 | -0,0060 | 0,0152 |
| **media** | | **0,7094** | **0,7092** | **-0,0002** | |

Fidelidad frente al checkpoint fuente (teacher forcing, divergencia KL de la distribución del siguiente token):

| Métrica | Valor |
|---|---:|
| KL media, texto crudo (prosa + código) | 0,0130 |
| KL media, conversaciones con plantilla de chat | 0,0686 |
| Acuerdo top-1, texto crudo / chat | 96,19 % / 91,37 % |
| Perplejidad, origen / este repo | 3,642 / 3,664 |
| Recuperación needle, prompt de 7.931 tokens | 3/3 |
| Recuperación needle, prompt de 31.543 tokens | 3/3 |

Velocidad en Apple M5 Pro, 24 GB de memoria unificada, macOS 27.2.1, mlx 0.32.4 + mlx-lm PR #2086, decodificación greedy, prefill-step-size 512:

| Prompt | Tokens de prompt | Tokens nuevos | tok/s de generación |
|---|---:|---:|---:|
| Función Python (código) | 37 | 256 | 37,8 |
| Por qué el cielo es azul (explicación) | 25 | 256 | 38,4 |
| Pregunta en turco | 39 | 256 | 38,3 |
| Consejos de JavaScript (lista) | 29 | 256 | 38,5 |
| **media** | | | **38,3** |
| Prompt largo — prefill 957 tok/s | 3.779 | 64 | 36,8 |

## Requisitos de hardware

- VRAM/memoria estimada: 14,6 GB tras la carga y 14,8 GB de pico en prompts cortos; 16,6 GB con un prompt de 3.779 tokens. El repositorio ocupa 14,6 GB en disco.
- GPU recomendadas: Apple Silicon con memoria unificada; probado en M5 Pro de 24 GB. No se documentan pruebas en GPUs NVIDIA o AMD.
- Cabe en GPU de consumo: sí, en Macs de 24 GB o más. En Macs de 24 GB es imprescindible fijar `--prefill-step-size 512`, ya que el valor por defecto de 2048 agotó la memoria Metal en la prueba con prompts largos.
- Opciones de despliegue: mlx-lm (requiere la PR #2086 o una versión que la incluya). No se mencionan vLLM, llama.cpp, Ollama ni TGI, y al ser formato MLX no son directamente compatibles.
- Latencia y throughput: ~38,3 tok/s de generación y 957 tok/s de prefill en M5 Pro de 24 GB. Carga en 3 segundos.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (Inkling-2-Mini-Uncensored-MLX-3bit) | 20,9 B totales / 3,4 B activos | no disponible | Media 0,7092 en el protocolo de la model card | Apache 2.0 | Hugging Face, formato MLX |
| OpenUncensored/Inkling-2-Mini-Uncensored (fuente) | 26,4 B totales / 3,4 B activos | no disponible | Media 0,7094 en el mismo protocolo | Apache 2.0 | Hugging Face, ~20 GB |
| barozp/Inkling-2-Mini-MLX-3bit (versión censurada) | 20,9 B totales / 3,4 B activos | no disponible | Media 0,7200 en el mismo protocolo (según la model card, dato del modelo oficial) | Apache 2.0 | Hugging Face, formato MLX |
| barozp/Inkling-2-Mini-Uncensored-MTPLX-3bit | no disponible | no disponible | no disponible | Apache 2.0 | Hugging Face, pack MTPLX con cabezal DSpark |

No se dispone de datos de benchmarks de modelos de otros autores para una comparación cruzada fiable; los únicos datos numéricos disponibles corresponden a variantes del mismo modelo base.

## Limitaciones y advertencias

- Modelo abliterated: se ha eliminado el comportamiento de rechazo, por lo que cumplirá peticiones que el modelo original rechazaría. Esto implica riesgos legales y éticos según la jurisdicción y el uso.
- No se aplica ningún filtro de contenido adicional más allá del que traiga el checkpoint; el despliegue en producción requiere moderación externa.
- Riesgo de alucinación inherente a los modelos de lenguaje; no se documentan evaluaciones específicas de veracidad.
- La cuantización a 3-4 bits introduce una divergencia KL de 0,0686 en conversaciones con plantilla de chat y un acuerdo top-1 del 91,37 %, lo que puede afectar a tareas sensibles a matices.
- Los deltas de benchmark están dentro de un error estándar, pero las muestras son limitadas (MMLU con 2.847 preguntas, HellaSwag con 1.000), por lo que la equivalencia estadística es orientativa.
- Idiomas soportados no documentados; el rendimiento fuera de inglés y turco es incierto.
- Longitud de contexto oficial no disponible; las pruebas needle llegan a 31.543 tokens pero no confirman el límite real.
- Requiere mlx-lm con la PR #2086; la compatibilidad con versiones estables no está garantizada.
- En Macs de 24 GB hay que ajustar el tamaño de paso de prefill para evitar fallos de memoria.
- El repositorio tiene 0 descargas y 0 likes, sin validación comunitaria independiente.
- La licencia Apache 2.0 permite uso comercial, pero las implicaciones del comportamiento sin rechazo deben evaluarse legalmente antes de desplegarlo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/barozp/Inkling-2-Mini-Uncensored-MLX-3bit
- Modelo base: https://huggingface.co/OpenUncensored/Inkling-2-Mini-Uncensored
- Pack MTPLX con cabezal DSpark: https://huggingface.co/barozp/Inkling-2-Mini-Uncensored-MTPLX-3bit
- Versión censurada con la misma receta: https://huggingface.co/barozp/Inkling-2-Mini-MLX-3bit
- PR de mlx-lm utilizada: https://github.com/ml-explore/mlx-lm/pull/2086
- Repositorio mlx-lm: https://github.com/ml-explore/mlx-lm
