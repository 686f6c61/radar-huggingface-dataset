# scottlowry/Ornith-1.5-122B-oQ4e-mtp

## Resumen

Ornith-1.5-122B-oQ4e-mtp es una cuantizacion mixta de precision del modelo Ornith-1.5-122B, publicado por el usuario scottlowry bajo el identificador `scottlowry/Ornith-1.5-122B-oQ4e-mtp`. Se distribuye en formato MLX con pesos safetensors, lo que lo orienta especificamente a la inferencia en hardware Apple Silicon. El modelo base es `ornith-ai/Ornith-1.5-122B`, una arquitectura MoE (segun el tag `qwen3_5_moe`) con unos 125.000 millones de parametros totales, de los cuales la mayor parte corresponde al modelo de lenguaje (122,112B), con un componente de vision (0,451B) y una cabeza MTP (Multi-Token Prediction) de 2,524B.

La relevancia de esta ficha radica en que se trata de una cuantizacion de bajo peso (media efectiva de 4,744 bits por peso) que reduce el checkpoint a unos 69,1 GiB, manteniendo una porcion significativa de tensores en 8 bits y BF16 para preservar calidad en las capas sensibles. Esta estrategia mixta permite desplegar un modelo de escala 120B+ en equipos con memoria unificada considerable, algo imposible con los pesos originales en BF16.

No se dispone de informacion sobre la licencia, los idiomas soportados ni los datos de entrenamiento del modelo base, por lo que la evaluacion se limita a los datos de cuantizacion y arquitectura que el autor de la cuantizacion expone en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (tag `qwen3_5_moe`), transformer con componente de vision y cabeza MTP |
| Parametros totales | 125.086.497.008 (125,086B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | oQ mixed-precision: affine 4-bit group 64, affine 8-bit group 128, affine 8-bit group 64, BF16 (promedio 4,744 bits/peso) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | MLX safetensors (libreria `mlx`) |

## Arquitectura y entrenamiento

La model card de esta cuantizacion no describe la arquitectura interna del modelo base, solo confirma mediante tags que se trata de una arquitectura MoE de la familia `qwen3_5_moe` con un modulo de vision y una cabeza MTP (Multi-Token Prediction). El desglose de almacenamiento indica tres componentes: modelo de lenguaje (122,112B parametros logicos), vision (0,451B) y cabeza MTP (2,524B), lo que sugiere un modelo multimodal con capacidad de decodificacion especulativa mediante prediccion multipaso.

Respecto al proceso de cuantizacion, se uso la herramienta oQ (repositorio jundot/omlx, version v0.7.4.dev1) con precision mixta. La distribucion de bits es: 94,639% de los pesos en affine 4-bit group 64 (4,50 bits/peso efectivos), 4,583% en affine 8-bit group 64 (8,50 bits/peso), 0,370% en affine 8-bit group 128 (8,25 bits/peso) y 0,408% en BF16 (16,00 bits/peso). No hay informacion disponible sobre el dataset de entrenamiento, numero de tokens, ni si se aplicaron tecnicas de RLHF o DPO.

## Capacidades

- Generacion de texto y razonamiento: el checkpoint incluye un modelo de lenguaje de 122,112B parametros logicos con capacidad de generacion autoregresiva.
- Vision: incluye un modulo de vision de 0,451B parametros, por lo que se infiere soporte de entrada de imagenes, aunque no se detalla el tipo exacto de tareas visuales.
- Prediccion multi-token (MTP): la cabeza MTP de 2,524B permite generar varios tokens por paso, lo que puede acelerar la decodificacion.
- Decodificacion especulativa: la combinacion de MTP y los pesos en MLX sugiere optimizacion para inferencia rapida en Apple Silicon.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Modo de pensamiento (thinking mode): no disponible en la informacion proporcionada.
- Capacidades de audio: no disponible en la informacion proporcionada.

## Casos de uso

- Inferencia local en Apple Silicon de alta gama: el checkpoint en MLX ocupa ~69,1 GiB, por lo que puede ejecutarse en Mac Studio con memoria unificada de 96 GB o superior, permitiendo un modelo de 125B en local sin GPU dedicada.
- Prototipado multimodal en escritorio: el modulo de vision de 0,451B permite procesar imagenes junto con texto en flujos de prueba de concepto sobre macOS.
- Generacion de texto acelerada por MTP: la cabeza MTP permite decodificar varios tokens por paso, adecuada para tareas de generacion larga como redaccion o resumen donde la latencia importa.
- Evaluacion comparativa de cuantizaciones: util para investigadores que quieran medir la perdida de calidad de oQ 4,744 bits frente a BF16 en tareas de razonamiento y generacion.
- Desarrollo de aplicaciones de escritorio con privacidad de datos: al ejecutarse localmente, evita enviar prompts a servicios en la nube, adecuado para entornos con requisitos de confidencialidad.
- Investigacion en decodificacion especulativa: el checkpoint incluye explicitamente la cabeza MTP, lo que facilita experimentos con tecnicas de prediccion multipaso sobre arquitecturas MoE en MLX.
- Prototipado de asistentes conversacionales multimodales: combinando el modelo de lenguaje y el modulo de vision en un unico checkpoint para pruebas de dialogos con imagenes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo reporta metricas de cuantizacion (bits por peso, tamano de almacenamiento y reparto por componentes), no resultados de calidad en MMLU, HumanEval, GSM8K ni tareas similares.

## Requisitos de hardware

- VRAM / memoria unificada estimada: ~69,1 GiB para los pesos en MLX (74,179 GB en disco), mas overhead de activaciones y KV cache no especificado.
- GPU recomendadas: hardware Apple Silicon con memoria unificada; el formato MLX no esta pensado para GPUs NVIDIA. Se necesita un equipo con al menos 96 GB de memoria unificada para operar con margen.
- Cabe en consumer GPU: el formato MLX lo excluye de GPUs de consumo NVIDIA; en Apple Silicon, solo los modelos con 96 GB o mas de memoria unificada (Mac Studio, MacBook Pro de gama alta) pueden albergarlo.
- Opciones de despliegue: MLX (libreria nativa), oMLX (herramienta de cuantizacion), y potencialmente mlx-lm para inferencia. No se menciona compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible. La cabeza MTP sugiere optimizacion de decodificacion, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parametros totales | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ornith-1.5-122B-oQ4e-mtp | 125,1B | no disponible | MLX safetensors 4,744 bits | no disponible | Hugging Face (708 descargas) |
| Ornith-1.5-122B (base) | no disponible | no disponible | no disponible | no disponible | Hugging Face (`ornith-ai/Ornith-1.5-122B`) |
| Alternativas de 120B en MLX | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion sobre modelos comparables de la misma categoria con datos verificables. La comparacion con el modelo base Ornith-1.5-122B es la unica disponible conceptualmente, pero no se aportan sus especificaciones completas (licencia, contexto, formato de pesos original).

## Limitaciones y advertencias

- La cuantizacion a 4,744 bits/peso promedio implica una perdida de precision respecto al modelo base en BF16; las capas en 4-bit (94,639% de los pesos) son las mas afectadas.
- La model card advierte de que el modelo fue re-cuantizado el 2026-11-11 con oMLX v0.7.4.dev1; copias anteriores deben descargarse de nuevo, lo que introduce riesgo de versiones obsoletas en uso.
- Licencia no disponible: no se puede confirmar si se permite uso comercial, lo que es un bloqueante para produccion.
- Idiomas soportados no disponibles: no hay garantia de cobertura multilingue.
- Longitud de contexto no disponible: no se puede dimensionar el uso en tareas de contexto largo.
- Arquitectura MoE sin datos de parametros activos: no se puede estimar el coste computacional real por token.
- Formato MLX: no es portable a ecosistemas NVIDIA ni a servidores CUDA convencionales, lo que limita su uso en produccion cloud.
- Riesgo de alucinacion: inherente a modelos generativos de esta escala; no se documentan evaluaciones de fidelidad.
- Sesgos conocidos: no documentados en la informacion disponible.
- El modelo tiene solo 708 descargas y 1 like, lo que indica baja validacion por parte de la comunidad.

## Enlaces

- [Hugging Face: scottlowry/Ornith-1.5-122B-oQ4e-mtp](https://huggingface.co/scottlowry/Ornith-1.5-122B-oQ4e-mtp)
- [Modelo base: ornith-ai/Ornith-1.5-122B](https://huggingface.co/ornith-ai/Ornith-1.5-122B)
- [Repositorio oQ / oMLX](https://github.com/jundot/omlx)
