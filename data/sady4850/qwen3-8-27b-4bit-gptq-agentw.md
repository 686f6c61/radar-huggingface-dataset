# sady4850/Qwen3.8-27B-4bit-GPTQ-agentw

## Resumen

`Qwen3.8-27B-4bit-GPTQ-agentw` es un checkpoint cuantizado experimental derivado de `Qwen/Qwen3.8-27B`, publicado por el usuario sady4850 en Hugging Face. Se trata de una cuantización GPTQ de 4 bits en formato MLX (afín, group size 64), calibrada específicamente sobre trazas de agente con ponderación de tokens, orientada a preservar la calidad del razonamiento y de las llamadas a herramientas en flujos agénticos. El modelo mantiene la modalidad image-text-to-text del modelo base, es decir, acepta entradas de imagen y texto.

El checkpoint forma parte de un estudio de calibración de agentes: el autor publica una familia de variantes (`-agent`, `-agentmix`, `-agentw`) y un conjunto de evaluación común descrito en la model card de `sady4850/Qwen3.8-27B-4bit-GPTQ-agentmix`. La variante `-agentw` se distingue por aplicar un peso de 0,25 a las filas de Hessian correspondientes a tokens de prompt y de salida de herramientas, mientras que los tokens de razonamiento, texto del asistente y llamadas a herramientas mantienen peso 1.

Con 27.356.728.560 parámetros (27,36 mil millones) y un repositorio de 16,1 GB, el modelo está pensado para ejecutarse en entornos Apple Silicon mediante MLX. Su relevancia actual reside en el interés por cuantizaciones que no degraden el comportamiento agéntico, un aspecto crítico cuando el modelo debe encadenar llamadas a funciones y razonamiento multi-paso en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.5, según tag `qwen3_5`); detalles no disponibles |
| Parámetros totales | 27.356.728.560 (27,36 B) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | GPTQ 4-bit en formato MLX afín, group size 64 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo base es `Qwen/Qwen3.8-27B`, un transformer de la familia Qwen3.5 con 27,36 mil millones de parámetros. La model card no detalla la arquitectura interna del modelo base (número de capas, dimensión oculta, mecanismos de atención), por lo que esa información no está disponible en la documentación proporcionada. La modalidad declarada es image-text-to-text, lo que implica capacidades de entrada multimodal.

El checkpoint es una cuantización GPTQ de 4 bits realizada sobre el modelo base, con el mismo layout que `mlx-community/Qwen3.8-27B-4bit` (MLX affine 4-bit, group size 64). La calibración se realizó sobre los mismos 128 chunks de trazas de agente que la variante `-agent`, aplicando una ponderación de 0,25 a las filas de Hessian de los tokens de prompt y de salida de herramientas, mientras que los tokens de razonamiento, texto del asistente y llamadas a herramientas conservan peso 1. El objetivo declarado es reducir la divergencia KL en razonamiento agéntico y en llamadas a herramientas respecto a la cuantización GPTQ estándar del mismo autor.

## Capacidades

- Generación de texto y razonamiento multi-paso, heredados del modelo base Qwen3.8-27B.
- Procesamiento de imagen y texto (pipeline image-text-to-text).
- Llamadas a herramientas (tool calling) y razonamiento agéntico, con calibración específica para preservar la calidad en estos flujos.
- Capacidades conversacionales multi-turno (tag `conversational`).
- Capacidades multilingües: no disponibles en la información proporcionada.
- Modo de razonamiento explícito: la model card menciona tokens de razonamiento, pero no se detalla si existe un modo "thinking" configurable.
- Capacidades de código y matemáticas: no verificadas en la información disponible.

## Casos de uso

- Agentes autónomos con llamadas a herramientas: el checkpoint está calibrado para reducir la divergencia KL en tool-call y razonamiento agéntico (reducciones del 42 % y 44 % respectivamente frente a la GPTQ estándar), lo que lo hace adecuado para pipelines donde el modelo debe encadenar funciones y mantener coherencia en las llamadas.
- Ejecución local en Apple Silicon: al estar en formato MLX 4-bit con 16,1 GB de pesos, puede desplegarse en equipos con memoria unificada de 32 GB o superior, lo que permite prototipar agentes sin depender de GPU dedicadas.
- Asistentes con entrada visual: al soportar image-text-to-text, puede emplearse en tareas de descripción de imágenes, extracción de información de capturas o documentos escaneados dentro de un flujo conversacional.
- Evaluación comparativa de cuantizaciones: útil para investigadores que quieran reproducir el estudio de calibración agéntica del autor y comparar la variante ponderada con la GPTQ estándar sobre el mismo conjunto de 49 tareas.
- Automatización de tareas de razonamiento con contexto de herramientas: escenarios donde el modelo recibe salidas de herramientas (APIs, bases de datos) y debe razonar sobre ellas; la ponderación de tokens de tool-output está diseñada precisamente para este caso.
- Desarrollo y depuración de agentes en local: al ser un checkpoint pequeño en disco y ejecutable en MLX, sirve como banco de pruebas para lógicas de agente antes de desplegar en modelos mayores o en la nube.

## Benchmarks y rendimiento

La model card reporta métricas comparativas frente a `sady4850/Qwen3.8-27B-4bit-GPTQ`, calculadas sobre 49 tareas con intervalos de confianza del 95 %:

| Métrica (vs GPTQ estándar) | Valor (IC 95 %) |
|---|---|
| KLD de razonamiento agéntico | -44 % [-46 %, -41 %] (0,0146) |
| KLD de tool-call agéntico | -42 % [-47 %, -36 %] (0,0035) |
| Misma llamada que bf16 | +7,7 [+3,1, +12,1] puntos (62,1 %) |
| KLD wiki (torch) | +48 % (0,0541) |
| KLD chat (torch) | +66 % (0,1637) |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. Los números crudos están en el directorio `eval/` del repositorio, según la model card.

## Requisitos de hardware

- VRAM/memoria estimada: los pesos ocupan 16,1 GB en 4-bit; se recomienda al menos 24-32 GB de memoria unificada o VRAM para margen de contexto y overhead.
- GPU recomendadas: el formato es MLX, por lo que el hardware objetivo son chips Apple Silicon (M1/M2/M3/M4 con memoria unificada suficiente). No se indica soporte para CUDA en esta variante.
- GPU consumer: cabe en equipos Apple con 32 GB o más de memoria unificada; en GPUs NVIDIA consumer no es directamente desplegable por el formato MLX.
- Opciones de despliegue: MLX (librería `mlx`), dado el formato del checkpoint. No se indica compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Formato |
|---|---|---|---|---|---|
| `sady4850/Qwen3.8-27B-4bit-GPTQ-agentw` | 27,36 B | no disponible | GPTQ 4-bit MLX, group 64 | Apache 2.0 | safetensors (MLX) |
| `sady4850/Qwen3.8-27B-4bit-GPTQ` | 27,36 B | no disponible | GPTQ 4-bit | Apache 2.0 | safetensors |
| `mlx-community/Qwen3.8-27B-4bit` | 27,36 B | no disponible | MLX affine 4-bit, group 64 | Apache 2.0 | safetensors (MLX) |
| `Qwen/Qwen3.8-27B` (base) | 27,36 B | no disponible | bf16 (original) | Apache 2.0 | safetensors |

La diferencia principal entre las variantes cuantizadas es la calibración: `-agentw` aplica ponderación de tokens orientada a trazas agénticas, mientras que la GPTQ estándar y la MLX community no incorporan esa ponderación. No hay datos de rendimiento comparativo frente a modelos de otras familias en la información disponible.

## Limitaciones y advertencias

- Checkpoint experimental: el propio autor lo describe como parte de un estudio de calibración de agentes, no como una versión estable para producción.
- Degradación en dominios no agénticos: la KLD en wiki aumenta un 48 % y en chat un 66 % respecto a la GPTQ estándar, lo que sugiere un empeoramiento en tareas generales de conocimiento y conversación.
- Tasa de coincidencia con bf16 en llamadas: solo el 62,1 % de las llamadas coinciden con el modelo en bf16, con un margen de +7,7 puntos sobre la GPTQ estándar; sigue habiendo divergencia relevante en tool-call.
- Idiomas soportados no especificados: no se puede garantizar cobertura multilingüe más allá de lo que herede el modelo base.
- Contexto máximo no documentado: no se indica la longitud de contexto soportada, lo que limita la planificación de despliegues con ventanas largas.
- Formato MLX: no es directamente portable a ecosistemas CUDA ni a servidores de inferencia convencionales (vLLM, TGI), lo que restringe su uso en infraestructura GPU estándar.
- Riesgo de alucinación: no cuantificado en la información disponible; aplican los riesgos habituales de los modelos de lenguaje, potencialmente amplificados por la cuantización en dominios fuera de la calibración.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías sobre el comportamiento del checkpoint cuantizado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sady4850/Qwen3.8-27B-4bit-GPTQ-agentw
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Variante de referencia del estudio: https://huggingface.co/sady4850/Qwen3.8-27B-4bit-GPTQ-agentmix
- Cuantización GPTQ estándar del autor: https://huggingface.co/sady4850/Qwen3.8-27B-4bit-GPTQ
- Cuantización MLX community de referencia: https://huggingface.co/mlx-community/Qwen3.8-27B-4bit
