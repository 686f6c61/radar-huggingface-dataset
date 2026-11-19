# gyohng/flint-terse-mlx

## Resumen

Flint Terse (MLX) es un adaptador LoRA de rango 32 en formato MLX que se aplica sobre `RecursiveSI/flint-int4`, la exportación MLX del modelo Flint en cuantización int4 desarrollado por Recursive (RecursiveSI). El adaptador no modifica los pesos base: su función es reescribir el comportamiento del bloque `<think>`, forzando al modelo a razonar de forma breve y en taquigrafía antes de emitir la respuesta final, que se mantiene completa y sin etiquetas filtradas. El repositorio contiene únicamente los pesos del adaptador (171 MB), no el modelo completo.

El problema que aborda es el coste de inferencia asociado al razonamiento extendido: en el base, un saludo simple como "Hi!" consume 123 tokens de pensamiento; con este adaptador se reduce a 15. La variante está orientada a código y, según las mediciones del autor sobre el base int4 sin modificar, recorta el pensamiento un 62% en tareas de código, un 79% en matemáticas y un 85% en prosa y chat, manteniendo la precisión de código del base (102,7 frente a 102,3 en un conjunto de 110 tareas).

Es relevante para desarrolladores que despliegan Flint en Apple Silicon con `mlx-lm`, ya que ofrece una vía directa para reducir latencia y consumo de tokens de razonamiento sin cambiar de checkpoint base ni reentrenar. La licencia es Apache-2.0, la misma que Flint, sin condiciones adicionales.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LoRA (rango 32, FP32) sobre transformer Flint int4; adaptador MLX |
| Parámetros totales | no disponible (el adaptador ocupa 171 MB; el base no se especifica) |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | int4 (base `RecursiveSI/flint-int4`); el adaptador se entrena sobre los códigos enteros int4 en su forma GGUF. Otras cuantizaciones no están soportadas |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | `adapters.safetensors` + `adapter_config.json` (MLX LoRA). Existe versión GGUF del mismo fine-tune en `gyohng/flint-terse` |

## Arquitectura y entrenamiento

El adaptador se aplica sobre la exportación MLX del Flint int4, un transformer con mezcla de expertos (el autor menciona "shared expert" y "dense MLPs" entre los módulos adaptados). El LoRA es de rango 32 en FP32 y se aplica sobre atención, el experto compartido y los MLP densos. El entrenamiento se realizó directamente sobre los coeficientes int4, no sobre una versión en punto flotante, lo que explica la advertencia de que solo funciona con ese checkpoint concreto.

El método combina dos fases: primero un aprendizaje por refuerzo en el que una respuesta solo obtiene recompensa si supera sus tests y cabe en un presupuesto de pensamiento que se va reduciendo progresivamente; después, un pase supervisado corto para enseñar el estilo telegráfico en prosa y chat. El autor publica código, datos y un script de reproducción en el repositorio de GitHub. No se especifican el número de tokens de entrenamiento ni la composición del dataset.

## Capacidades

- Generación de texto con modo de razonamiento explícito en `<think>`, condensado respecto al base.
- Razonamiento orientado a código: mantiene la precisión de código del base (102,7 frente a 102,3 en 110 tareas) con un 62% menos de tokens de pensamiento.
- Razonamiento matemático con reducción del 79% en tokens de pensamiento.
- Conversación y prosa con reducción del 85% en tokens de pensamiento.
- Respuestas finales completas: el adaptador no trunca la salida, solo el bloque de pensamiento.
- Sin fuga de etiquetas `<think>` en la respuesta final, según el autor.
- Servidor compatible con la API de OpenAI mediante `mlx_lm.server`.
- Tool calling, function calling, capacidades de agente y multilingüismo: no disponibles en la información proporcionada.

## Casos de uso

- Asistente de código en local sobre Apple Silicon: con `mlx_lm.generate` y el adaptador cargado, se obtiene un modelo que resuelve tareas de programación con la precisión del base pero con menos de la mitad de tokens de razonamiento, lo que reduce el tiempo hasta el primer token útil.
- Servidor compatible con OpenAI para prototipos: `mlx_lm.server --model RecursiveSI/flint-int4 --adapter-path flint-terse-mlx` expone un endpoint que cualquier cliente OpenAI puede consumir, útil para integrar el modelo en herramientas de desarrollo sin infraestructura GPU dedicada.
- Reducción de coste en pipelines de razonamiento por lotes: en tareas de matemáticas y análisis, el recorte del 79% en tokens de pensamiento disminuye directamente el tiempo de cómputo por petición en comparación con el base.
- Chat interactivo de baja latencia: con un 85% menos de pensamiento en conversación, el modelo responde antes en diálogos multi-turno donde el razonamiento extenso aporta poco.
- Evaluación comparativa de estrategias de razonamiento: al existir una variante minimalista (`flint-terse-minimalist-mlx`) con mayor recorte pero menor precisión en código, el par permite medir el compromiso entre latencia y exactitud en un mismo base.
- Reproducción de investigación: el repositorio de GitHub incluye código, datos y un script único para reproducir el entrenamiento, útil para estudiar RL con presupuesto de pensamiento decreciente sobre pesos cuantizados.

## Benchmarks y rendimiento

Mediciones del autor sobre el base int4 sin modificar en llama.cpp, media de tres semillas, una muestra por tarea, temperatura 1, top-p 0,95 y top-k 20. La reducción de pensamiento es relativa al base en las mismas tareas.

| Modelo | Código (110 tareas) | Matemáticas (120 tareas) | Menos pensamiento: código | matemáticas | prosa y chat |
|---|---:|---:|---:|---:|---:|
| Flint int4 (base) | 102,3 | 103,3 | — | — | — |
| flint-terse | 102,7 | 109,7 | 62% | 79% | 85% |
| flint-terse-minimalist | 98,0 | 108,0 | 81% | 86% | 85% |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- Diseñado para Apple Silicon mediante `mlx-lm`; no está pensado para GPU NVIDIA ni para CUDA.
- El adaptador pesa 171 MB y se suma al base int4, cuyo tamaño no se especifica en la información disponible.
- El base int4 debe descargarse por separado desde `RecursiveSI/flint-int4`; el adaptador no incluye los pesos del modelo.
- Despliegue mediante `mlx_lm.generate` (CLI) o `mlx_lm.server` (API compatible con OpenAI).
- Para llama.cpp y LM Studio existe la versión GGUF equivalente en `gyohng/flint-terse`.
- VRAM unificada necesaria, GPU concretas recomendadas, latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Base | Formato | Precisión código | Reducción de pensamiento (código) | Licencia |
|---|---|---|---:|---:|---|
| flint-terse-mlx | Flint int4 | LoRA MLX | 102,7 | 62% | Apache-2.0 |
| flint-terse (GGUF) | Flint int4 | GGUF | 102,7 | 62% | Apache-2.0 |
| flint-terse-minimalist-mlx | Flint int4 | LoRA MLX | 98,0 | 81% | Apache-2.0 |
| Flint int4 (base) | — | MLX / GGUF | 102,3 | — | Apache-2.0 |

No se dispone de comparación con modelos de otras familias en la información proporcionada.

## Limitaciones y advertencias

- Solo es compatible con el checkpoint `RecursiveSI/flint-int4` en su forma int4 exacta; otras cuantizaciones son checkpoints distintos y no están soportadas.
- El adaptador está atado a la exportación MLX del base; para llama.cpp debe usarse la variante GGUF, no esta.
- Las métricas de precisión y reducción de pensamiento provienen del autor, con una muestra por tarea y tres semillas, no de un benchmark estándar independiente.
- No hay información sobre sesgos, riesgo de alucinación ni cobertura idiomática.
- No se especifican la longitud de contexto ni los parámetros totales del base.
- El repositorio tiene cero descargas y cero likes en el momento de la consulta, por lo que no hay validación de la comunidad.
- La licencia Apache-2.0 permite uso comercial sin condiciones adicionales, pero se heredan las del base Flint.

## Enlaces

- Hugging Face del adaptador: https://huggingface.co/gyohng/flint-terse-mlx
- Versión GGUF: https://huggingface.co/gyohng/flint-terse
- Variante minimalista MLX: https://huggingface.co/gyohng/flint-terse-minimalist-mlx
- Modelo base: https://huggingface.co/RecursiveSI/flint-int4
- Flint original: https://huggingface.co/RecursiveSI/flint
- Repositorio de código y reproducción: https://github.com/gyohng/flint-terse
- Organización Recursive: https://huggingface.co/RecursiveSI
