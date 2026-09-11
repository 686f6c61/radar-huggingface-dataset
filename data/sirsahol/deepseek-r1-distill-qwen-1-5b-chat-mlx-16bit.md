# SirSahOl/DeepSeek-R1-Distill-Qwen-1.5B-chat-mlx-16bit

## Resumen

SirSahOl/DeepSeek-R1-Distill-Qwen-1.5B-chat-mlx-16bit es una conversión a formato MLX de 16 bits del modelo deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B, publicada por el usuario SirSahOl para ejecución en Apple Silicon. No se trata de un entrenamiento nuevo ni de un fine-tuning adicional: es una conversión de pesos con la herramienta mlx-lm 0.31.3 que conserva íntegramente la arquitectura y el comportamiento del modelo de origen, un transformer decoder de la familia Qwen2 destilado a partir de las trazas de razonamiento de DeepSeek-R1.

El interés de esta ficha es doble. Por un lado, el modelo base es un razonador pequeño (1.777.088.000 parámetros reales según los safetensors) pensado para tareas de matemáticas, código y razonamiento paso a paso en hardware modesto. Por otro, esta conversión concreta permite ejecutarlo en Mac con memoria unificada mediante MLX, el framework de Apple, sin necesidad de CUDA ni de GPU dedicada. El repo ocupa 3,6 GB y los pesos convertidos 3,3 GB.

La relevancia práctica es limitada pero concreta: cero descargas y cero likes en el momento de la consulta, licencia MIT heredada del modelo fuente y una única variante publicada (16 bits), pese a que el propio autor recomienda 4 y 8 bits para equipos con 8-32 GB de memoria unificada. La búsqueda web no ha devuelto ninguna fuente relevante adicional sobre este modelo o su autor.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (familia Qwen2), heredada del modelo base; pesos convertidos a MLX |
| Parametros totales | 1.777.088.000 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada; el model card advierte de degradacion del rendimiento con contextos muy largos (>8K tokens) en cuantizaciones bajas |
| Tipos de cuantizacion | 16 bits (variante publicada). El model card menciona 4 y 8 bits como recomendacion segun hardware, pero solo enlaza la variante de 16 bits |
| Idiomas soportados | No disponible (el model card no especifica idiomas) |
| Licencia | MIT (heredada del modelo fuente) |
| Formato de pesos | Safetensors en formato MLX |
| Libreria / framework | mlx-lm 0.31.3, requiere Apple Silicon (M1 o posterior) |
| Tamano del repo | 3,6 GB (pesos convertidos: 3,3 GB) |
| Pipeline | text-generation |
| Fecha de creacion | 2026-09-11 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura es la del modelo fuente, deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B: un transformer decoder de tipo causal de la familia Qwen2 con normalizacion RMSNorm, atención con RoPE y capas de alimentación hacia delante con activación SwiGLU. La conversión realizada es exclusivamente de pesos (weight-only): no se modifica ni la topologia, ni el tokenizador, ni el comportamiento generativo. El autor lo indica explicitamente en las limitaciones del model card. El proceso se ejecuto con `mlx_lm.convert` sobre mlx-lm 0.31.3 y tardo 1980,44 segundos.

En cuanto al entrenamiento, no hay informacion en la documentacion proporcionada: el model card de esta conversion no describe el dataset, el numero de tokens, ni si hubo fases de RLHF o DPO. Lo unico deducible del nombre del modelo base es que se trata de un modelo destilado de DeepSeek-R1 sobre una base Qwen, es decir, que el modelo original fue entrenado para reproducir trazas de razonamiento largo generadas por un modelo mayor. Esta conversión no anade ninguna innovacion tecnica propia; su unico valor anadido es el empaquetado en el formato de Apple.

## Capacidades

- Generacion de texto conversacional: el tag `conversational` y el pipeline `text-generation` indican uso en dialogos multi-turno, con plantilla de chat heredada del modelo base.
- Razonamiento paso a paso: al derivar de DeepSeek-R1, el modelo base esta disenado para producir cadenas de razonamiento explicitas antes de la respuesta final.
- Matematicas y problemas aritmeticos de varios pasos, capacidad tipica de los modelos destilados de R1.
- Generacion y comprension de codigo, heredada del entrenamiento del modelo base sobre corpus de programacion.
- Ejecucion local en Apple Silicon mediante MLX, sin dependencia de CUDA.
- No hay evidencia en la informacion proporcionada de soporte de tool calling, function calling, agentes, vision, audio ni modo thinking formalmente documentado en esta conversion.

## Casos de uso

- Asistente de razonamiento en local para desarrolladores con Mac: el modelo se ejecuta con `mlx_lm.chat` sobre memoria unificada, lo que permite disponer de un razonador de 1,78B parametros sin enviar datos a servicios externos.
- Prototipado rapido de aplicaciones de chat en Python: la API `mlx_lm.load` / `mlx_lm.generate` permite integrar el modelo en scripts de experimentacion en pocas lineas, con `max_tokens` configurable.
- Evaluacion comparativa de cuantizaciones: dado que el autor documenta el comportamiento esperado en 4, 8 y 16 bits, este checkpoint sirve como referencia de maxima fidelidad frente a variantes comprimidas.
- Generacion de codigo asistida en flujo de trabajo local: el modelo puede redactar funciones y explicar fragmentos, con revision humana obligatoria dado su tamano reducido.
- Resolucion de problemas matematicos de nivel educativo con traza de razonamiento visible, util para herramientas de tutoria que necesitan mostrar el procedimiento, no solo el resultado.
- Reproduccion de conversiones MLX en pipelines propios: el model card incluye el comando exacto de reproduccion, por lo que sirve como plantilla para convertir otros checkpoints de HuggingFace a formato Apple.
- Inferencia en entornos sin GPU: al requerir unicamente Apple Silicon, es util para demostraciones y talleres sobre portatiles Mac sin acelerador dedicado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. El model card unicamente incluye metricas de rendimiento de inferencia medidas en un Apple M1 con 8 GB de memoria unificada, promedio de 5 ejecuciones con 256 tokens maximos:

| Metrica | 16 bits |
|---|---|
| Tokens por segundo | 16,97 |
| TTFT (tiempo hasta el primer token) | 58,94 ms |
| Memoria pico | 280,3 MB |

Nota: el valor de memoria pico declarado (280,3 MB) es llamativamente bajo para unos pesos de 16 bits de 1.777 millones de parametros, que ocuparian del orden de 3,5 GB. Conviene verificar como se midio ese dato antes de usarlo para planificar despliegues.

## Requisitos de hardware

- Requisito de plataforma: Apple Silicon (M1 o posterior) de forma obligatoria; MLX no se ejecuta en GPU NVIDIA ni en CPU x86 convencional.
- Tamano de pesos: 3,3 GB en 16 bits, 3,6 GB de repositorio completo.
- Equipos con 8 GB de memoria unificada: el propio autor recomienda la variante de 4 bits, no esta; con 3,3 GB de pesos mas el overhead de MLX y el sistema, el margen es muy ajustado.
- Equipos con 16-32 GB (M1/M2 Pro o Max): el autor recomienda 8 bits para equilibrar calidad y memoria; la variante de 16 bits tambien es viable reservando memoria suficiente.
- Equipos con 64 GB o mas (M2/M3/M4 Ultra): escenario indicado por el autor para la variante de 16 bits a plena precision.
- Opciones de despliegue: `mlx_lm.chat` para uso interactivo por linea de comandos y `mlx_lm.generate` o la API de Python para integracion programatica. No hay soporte indicado para vLLM, llama.cpp, Ollama o TGI, que no consumen pesos MLX de este tipo.
- Throughput y latencia: 16,97 tokens/s y 58,94 ms de TTFT en Apple M1 de 8 GB; no hay mediciones para otros chips.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Contexto | Licencia | Observaciones |
|---|---|---|---|---|---|
| SirSahOl/DeepSeek-R1-Distill-Qwen-1.5B-chat-mlx-16bit | 1.777.088.000 | Safetensors MLX 16 bits | No disponible | MIT | Conversion para Apple Silicon; 0 descargas |
| deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B (modelo fuente) | 1,5B nominales (1,777 M reales) | Safetensors PyTorch | No disponible en la informacion proporcionada | MIT | Referencia de maxima fidelidad; requiere PyTorch y no esta optimizado para MLX |
| Otras variantes de cuantizacion del mismo modelo | No disponible | No disponible | No disponible | No disponible | El model card menciona 4 y 8 bits, pero solo enlaza la variante de 16 bits |

No se dispone de datos de benchmarks que permitan comparar el rendimiento real frente a alternativas de la misma categoria (por ejemplo, otros destilados de R1 o modelos instruct de ~1,5B). Cualquier comparacion de calidad seria especulativa con la informacion disponible.

## Limitaciones y advertencias

- No es un modelo nuevo: es una conversion de pesos. Cualquier sesgo, alucinacion o limitacion del modelo fuente se mantiene intacta.
- El propio model card reconoce que la cuantizacion introduce perdida de calidad respecto al original, y que a menor numero de bits mayor es esa perdida.
- Degradacion de rendimiento documentada con contextos superiores a 8K tokens en cuantizaciones bajas.
- Dependencia estricta de Apple Silicon: inutilizable en servidores con GPU NVIDIA, AMD o en CPU x86, lo que limita gravemente su uso en produccion convencional.
- No hay informacion sobre idiomas soportados, por lo que no se puede garantizar un comportamiento correcto en castellano mas alla de lo que herede el modelo base.
- Riesgo de alucinacion inherente a un modelo de 1,78B parametros; no es adecuado para tareas que exijan alta precision factual sin verificacion.
- Repositorio sin adopcion: 0 descargas y 0 likes, sin senales de validacion por parte de la comunidad y con un unico commit de conversion.
- Licencia MIT, lo que permite uso comercial y modificacion, pero se recomienda revisar la licencia del modelo fuente por si hubiera condiciones adicionales no reflejadas en esta conversion.
- El pipeline de conversion (MLX Foundry, del mismo autor) no cuenta con validacion externa conocida.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/SirSahOl/DeepSeek-R1-Distill-Qwen-1.5B-chat-mlx-16bit
- Modelo fuente: https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B
- Perfil del autor: https://huggingface.co/SirSahOl
- Framework MLX (Apple): https://github.com/ml-explore/mlx
- Pipeline de conversion MLX Foundry: https://github.com/SirSahOl/mlx-foundry

Nota: la busqueda web realizada no devolvio ningun resultado relevante sobre este modelo, su autor ni su pipeline de conversion; los unicos resultados obtenidos fueron enlaces a un portal de noticias en polaco sin relacion con el tema.
