# barozp/Inkling-2-Mini-Uncensored-MLX-3bit

## Resumen
Inkling-2-Mini-Uncensored-MLX-3bit es una conversión cuantizada a 3 bits en precisión mixta para Apple Silicon (framework MLX) del modelo OpenUncensored/Inkling-2-Mini-Uncensored, que a su vez es la variante "abliterated" (con el comportamiento de rechazo eliminado) del Inkling 2 Mini de Thinking Machines Lab. El modelo conserva la arquitectura original completa: un transformer con mezcla de expertos (MoE) de tipo "looped", con visión y un cabezal borrador DSpark para decodificación especulativa.

El interés de esta ficha es doble: por un lado documenta una técnica de cuantización agresiva (media de 4,26 bits por peso cuantizado) que reduce el checkpoint de unos 20 GB a 14,65 GB sin degradación medible en benchmarks estándar; por otro, lo hace sobre un modelo sin filtros de rechazo, lo que tiene implicaciones legales y de seguridad relevantes para producción.

El resultado es un modelo que cabe en Macs de 24 GB de memoria unificada, con velocidades de generación en torno a 38 tok/s en un M5 Pro, y que mantiene una fidelidad muy alta respecto al checkpoint original (KL media de 0,0130 en texto plano y 0,0686 en conversaciones con plantilla de chat).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con núcleo "looped" (loop-core en capas 6-17), visión y cabezal borrador DSpark |
| Parametros totales | 20.867.891.200 (20,87 mil millones, según safetensors) |
| Parametros activos | 3.400 millones (3,4B), según model card |
| Longitud de contexto | no disponible (la model card menciona pruebas con prompts de hasta 31.543 tokens) |
| Tipos de cuantizacion | MLX 3-bit en precisión mixta (media 4,26 bits por peso cuantizado); GPTQ con act-order en matrices de expertos; NVFP4 original preservado en down projections de capas 0-19 |
| Idiomas soportados | no disponible (la calibración incluye inglés, código Python y turco) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento
El modelo base es un transformer con mezcla de expertos de 26,4B parámetros totales y 3,4B activos, con una innovación estructural denominada "looped core": las 12 capas centrales (6-17) se ejecutan tres veces por token, lo que aumenta la profundidad efectiva sin incrementar el número de parámetros. Incluye además una torre de visión y un cabezal borrador DSpark para decodificación especulativa (publicado por separado en el pack MTPLX).

La conversión a MLX 3-bit aplica una receta de precisión mixta calibrada específicamente sobre los pesos sin censura: las proyecciones gate/up de expertos en capas 0-5 y 18-23 se cuantizan a 3 bits (grupo 64, GPTQ act-order); las del núcleo looped (6-17) suben a 4 bits (grupo 128); las down projections de capas 0-19 conservan el NVFP4 original byte a byte; las proyecciones de atención y convolución corta van a 8 bits; el embedding a 5 bits y el cabezal de salida a 6 bits. El calibrado GPTQ usó 256 secuencias de 2.048 tokens con mezcla de UltraChat (50%), Python stdlib (20%), Wikipedia turca (15%) y calibration_v5 de mlx-lm (15%), con Hessians recogidos sobre los pesos sin censura. La conversión se hizo cargando los expertos uno a uno en memoria, sin escribir nunca una copia BF16 en disco.

## Capacidades
- Generación de texto conversacional y de formato largo.
- Razonamiento y respuesta a preguntas de opción múltiple (evaluado en MMLU, ARC-Challenge, Winogrande, HellaSwag).
- Generación de código (evaluado en calibración con Python stdlib y en pruebas de generación de funciones Python y JavaScript).
- Capacidades de visión (la torre de visión se conserva en precisión original).
- Decodificación especulativa mediante el cabezal DSpark (disponible en el pack MTPLX hermano).
- Recuperación de información en contexto largo (needle retrieval 3/3 con prompts de 7.931 y 31.543 tokens).
- Multilingüe parcial: se ha probado generación en turco e inglés; no hay listado oficial de idiomas.
- Comportamiento sin rechazo (abliterated): responde a peticiones que el modelo original rechazaría.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.

## Casos de uso
- Inferencia local en Macs de 24 GB: el modelo carga en 3 s y ocupa 14,6 GB tras la carga, con picos de 14,8 GB en prompts cortos y 16,6 GB con prompts de 3.779 tokens; encaja en un M5 Pro de 24 GB con `--prefill-step-size 512`.
- Generación de código en local para desarrolladores con Apple Silicon: 37,8 tok/s en prompts de código Python, adecuado para autocompletado y generación de funciones en flujos de trabajo sin conexión.
- Asistentes conversacionales con contexto largo: la recuperación needle 3/3 a 31.543 tokens permite construir chatbots que consulten documentación extensa o historiales de conversación largos.
- Investigación sobre alineación y censura: al ser una variante abliterated, sirve para estudiar diferencias de comportamiento entre un modelo con rechazo y su versión sin él, manteniendo la misma arquitectura y pesos base.
- Evaluación de técnicas de cuantización: el par de repositorios (oficial y sin censura, ambos con la misma receta) permite comparar el impacto de la cuantización mixta GPTQ sobre distintos checkpoints de partida.
- Prototipado multimodal en local: la torre de visión conservada en precisión original permite experimentar con tareas imagen-texto en hardware de consumo Apple.
- Despliegue en entornos con restricciones de memoria: los 14,65 GB del checkpoint permiten ejecutar un MoE de 26,4B en un portátil, algo inviable con el checkpoint BF16 original.

## Benchmarks y rendimiento
Resultados medidos con `lm-evaluation-harness` 0.4.13, 0-shot, loglikelihood, plantilla de chat desactivada. MMLU con las primeras 50 preguntas por asignatura (2.847), ARC-Challenge completo (1.172), Winogrande completo (1.267), HellaSwag con las primeras 1.000.

| Tarea | Métrica | Fuente (20 GB) | Este repo (14,65 GB) | Delta | ± stderr |
|---|---|---:|---:|---:|---:|
| mmlu | acc | 0,7856 | 0,7891 | +0,0035 | 0,0073 |
| arc_challenge | acc_norm | 0,6911 | 0,6954 | +0,0043 | 0,0134 |
| winogrande | acc | 0,7127 | 0,7103 | -0,0024 | 0,0127 |
| hellaswag | acc_norm | 0,6480 | 0,6420 | -0,0060 | 0,0152 |
| **media** | | **0,7094** | **0,7092** | **-0,0002** | |

Todos los deltas quedan dentro de un error estándar. Como referencia, el Inkling 2 Mini oficial (sin abliterar) promedia 0,7200 con el mismo protocolo.

Fidelidad respecto a la fuente (teacher forcing, divergencia KL de las distribuciones del siguiente token):

| Métrica | Valor |
|---|---:|
| KL media, texto plano (prosa + código) | 0,0130 |
| KL media, conversaciones con plantilla de chat | 0,0686 |
| Acuerdo top-1, texto plano / chat | 96,19% / 91,37% |
| Perplejidad, fuente / este repo | 3,642 / 3,664 |
| Needle retrieval, prompt de 7.931 tokens | 3/3 |
| Needle retrieval, prompt de 31.543 tokens | 3/3 |

Velocidad en Apple M5 Pro (24 GB, macOS 27.2.1, mlx 0.32.4, decodificación greedy):

| Prompt | Tokens de prompt | Tokens nuevos | tok/s generación |
|---|---:|---:|---:|
| Función Python (código) | 37 | 256 | 37,8 |
| Por qué el cielo es azul | 25 | 256 | 38,4 |
| Pregunta en turco | 39 | 256 | 38,3 |
| Consejos de JavaScript | 29 | 256 | 38,5 |
| **media** | | | **38,3** |
| Prompt largo — prefill 957 tok/s | 3.779 | 64 | 36,8 |

## Requisitos de hardware
- VRAM/memoria unificada: 14,6 GB tras la carga, 14,8 GB de pico en prompts cortos y 16,6 GB con prompts de 3.779 tokens. Encaja en Macs de 24 GB de memoria unificada.
- GPU recomendadas: Apple Silicon (probado en M5 Pro de 24 GB). No está pensado para GPU NVIDIA; el formato es MLX, no GGUF ni safetensors estándar de PyTorch.
- GPU de consumo: sí, en Apple Silicon de gama alta con al menos 24 GB de memoria unificada. No cabe en Macs de 16 GB.
- Opciones de despliegue: `mlx-lm` (requiere la PR ml-explore/mlx-lm#2086 o posterior), con `mlx` 0.32.4. No hay soporte documentado para vLLM, TGI, llama.cpp u Ollama en este repo.
- Latencia y throughput: 38,3 tok/s de media en generación y 957 tok/s de prefill en M5 Pro de 24 GB. Carga en 3 s.
- Ajuste importante: en Macs de 24 GB hay que usar `--prefill-step-size 512`; con el valor por defecto de mlx-lm (2048) el prompt de 3.779 tokens agotó la memoria de Metal en las pruebas del autor.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| barozp/Inkling-2-Mini-Uncensored-MLX-3bit | 20,87B totales / 3,4B activos | no disponible | Apache 2.0 | safetensors MLX 3-bit | Media 0,7092 en el protocolo de benchmarks; 14,65 GB |
| barozp/Inkling-2-Mini-MLX-3bit | 20,87B totales / 3,4B activos | no disponible | Apache 2.0 | safetensors MLX 3-bit | Versión censurada con la misma receta; KL 0,0125 / 0,0729 |
| OpenUncensored/Inkling-2-Mini-Uncensored | 26,4B totales / 3,4B activos | no disponible | Apache 2.0 | NVFP4/MXFP8 + BF16 | Checkpoint fuente sin cuantizar a 3 bits; ~20 GB |
| Inkling 2 Mini oficial (Thinking Machines Lab) | 26,4B totales / 3,4B activos | no disponible | no disponible | NVFP4/MXFP8 | Promedia 0,7200 en el mismo protocolo; sin abliterar |

## Limitaciones y advertencias
- Modelo abliterated: se ha eliminado el comportamiento de rechazo, por lo que cumplirá peticiones que el modelo original denegaría. No hay filtrado de contenido adicional más allá del presente en el checkpoint.
- Riesgo legal y de cumplimiento: el uso responsable y conforme a la legislación local es responsabilidad del desplegador; no es adecuado para aplicaciones de cara al público sin capas de moderación externas.
- Riesgo de alucinación: no cuantificado en la información disponible; como todo modelo generativo, puede producir contenido falso con apariencia de veracidad.
- Idiomas: no hay listado oficial de idiomas soportados; la calibración incluye inglés, turco y código, pero no se garantiza calidad en otras lenguas.
- Longitud de contexto: no documentada formalmente; las pruebas needle llegan a 31.543 tokens, pero no se especifica el máximo arquitectónico.
- Sobre la cuantización: aunque los benchmarks no muestran degradación medible, la KL en conversaciones con plantilla de chat (0,0686) es mayor que en texto plano (0,0130), lo que sugiere una fidelidad algo menor en diálogo multi-turno.
- Restricciones de plataforma: el formato es MLX y solo se ejecuta en Apple Silicon; no hay conversión a GGUF en la cadena de conversión.
- Dependencia de una PR no fusionada: requiere ml-explore/mlx-lm#2086, lo que puede complicar la reproducibilidad si esa PR cambia o no se integra.
- Memoria: en Macs de 24 GB es imprescindible ajustar `--prefill-step-size 512`; de lo contrario, prompts largos pueden agotar la memoria de Metal.

## Enlaces
- Repositorio Hugging Face: https://huggingface.co/barozp/Inkling-2-Mini-Uncensored-MLX-3bit
- Modelo base sin censura: https://huggingface.co/OpenUncensored/Inkling-2-Mini-Uncensored
- Pack MTPLX con cabezal DSpark (decodificación especulativa): https://huggingface.co/barozp/Inkling-2-Mini-Uncensored-MTPLX-3bit
- Versión censurada con la misma receta: https://huggingface.co/barozp/Inkling-2-Mini-MLX-3bit
- PR de mlx-lm requerida: https://github.com/ml-explore/mlx-lm/pull/2086
