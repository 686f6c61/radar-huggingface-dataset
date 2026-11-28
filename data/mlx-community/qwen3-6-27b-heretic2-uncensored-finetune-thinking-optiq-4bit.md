# mlx-community/Qwen3.6-27B-Heretic2-Uncensored-Finetune-Thinking-OptiQ-4bit

## Resumen

Qwen3.6-27B-Heretic2-Uncensored-Finetune-Thinking-OptiQ-4bit es una cuantizacion mixta de precision del fine-tune de DavidAU sobre la arquitectura Qwen3.6-27B, publicada por el equipo de mlx-community. El modelo original es un ajuste fino orientado a escritura creativa y a la eliminacion de restricciones de rechazo (uncensored), con un canal de razonamiento explicito (thinking). Esta version concreta no modifica los pesos del fine-tune: solo cambia su representacion numerica para que pueda ejecutarse en Apple Silicon mediante MLX.

La relevancia de esta publicacion es practica: el modelo base ronda los 27.000 millones de parametros (26.895.993.856 segun los safetensors), un tamano que en precision completa resulta inviable en hardware de consumo. La cuantizacion OptiQ asigna anchos de bits distintos por capa (4 u 8 bits) en lugar de uniformar todo el modelo, de modo que las capas sensibles conservan mas precision. El resultado ocupa 18,8 GB en el repositorio y declara una media de aproximadamente 5,6 bits por peso.

El modelo es de tipo texto, solo lenguaje, sin torre de vision ni audio. Su licencia es Apache 2.0 y su formato de pesos es safetensors para MLX. Esta pensado para generacion de texto conversacional y creativa en local sobre Macs con memoria unificada suficiente, no para despliegues en GPU NVIDIA con vLLM o TGI.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer `qwen3_5` (Qwen3.6-27B) |
| Parametros totales | 26.895.993.856 (~26,9 B) |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | OptiQ mixed-precision: 4-bit y 8-bit por capa (220 capas a 8-bit, 276 a 4-bit; ~5,6 bits por peso de media) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX) |
| Tamano del repositorio | 18,8 GB |
| Libreria de inferencia | MLX (`mlx_lm`, `mlx-optiq`) |
| Modalidad | texto unicamente (language tower) |
| Modelo base | DavidAU/Qwen3.6-27B-Heretic2-Uncensored-Finetune-Thinking |
| Descargas / likes | 338 / 0 |

## Arquitectura y entrenamiento

La arquitectura subyacente es la etiquetada como `qwen3_5` en el repositorio, correspondiente a la familia Qwen3.6 de 27B parametros. Se trata de un transformer denso de solo decodificacion orientado a generacion de texto. El fine-tune de DavidAU anade dos caracteristicas: un ajuste orientado a escritura creativa y la eliminacion de comportamientos de rechazo (uncensored), ademas de un canal de razonamiento explicito que el modelo puede activar o desactivar. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron fases de RLHF o DPO en el fine-tune original.

La innovacion tecnica de esta publicacion es la cuantizacion OptiQ, un esquema de precision mixta guiado por datos (`optiq_mixed_precision`). En lugar de aplicar un unico ancho de bits a todas las capas, asigna 8 bits a 220 capas y 4 bits a 276, con una media de ~5,6 bits por peso. La asignacion por capa se reutiliza del modelo mlx-community/Qwen3.6-27B-OptiQ-4bit, que comparte arquitectura, por lo que no se ejecuto un analisis de sensibilidad especifico para este fine-tune. Es un detalle relevante: la asignacion esta optimizada para el modelo base, no necesariamente para los pesos ajustados.

## Capacidades

- Generacion de texto conversacional multi-turno.
- Escritura creativa: el fine-tune esta explicitamente orientado a este caso de uso segun las etiquetas del repositorio.
- Razonamiento con canal de pensamiento (thinking): se controla anadiendo `:think` o `:no-think` al identificador del modelo o mediante `enable_thinking` en la plantilla de chat.
- Modo sin restricciones de contenido (uncensored): el fine-tune elimina los rechazos del modelo base.
- Generacion de codigo y matematicas: capacidad heredada de la familia Qwen3.6, aunque no se documenta de forma especifica para este fine-tune.
- Soporte de tool calling / function calling: no documentado en la informacion disponible.
- Soporte de agentes y razonamiento multi-paso: parcialmente cubierto por el canal de thinking, sin documentacion adicional.
- Capacidades multilingues: no documentadas.
- Vision y audio: no soportados (cuantizacion de la torre de lenguaje unicamente).

## Casos de uso

- Escritura creativa y ficcion en local: el fine-tune esta orientado a prosa creativa y el modo uncensored permite explorar generos y tematicas que los modelos alineados rechazan. Adecuado para autores que trabajan en un Mac con memoria unificada suficiente para cargar 18,8 GB de pesos.
- Prototipado de asistentes conversacionales en Apple Silicon: mediante `mlx_lm` o `optiq serve` se puede levantar un endpoint local sin GPU dedicada, util para pruebas de UX antes de pasar a produccion.
- Generacion de dialogos y guiones: el control del canal de thinking permite alternar entre respuestas rapidas (no-think) y respuestas mas elaboradas (think) segun la fase del guion.
- Experimentacion con tecnicas de cuantizacion mixta: el modelo sirve como caso de estudio de OptiQ frente a cuantizaciones uniformes de 4 bits, comparando calidad en tareas creativas.
- Laboratorio de investigacion sobre alineacion y censura: al ser un fine-tune uncensored, permite estudiar el comportamiento de modelos sin rechazos en entornos controlados y compararlo con el modelo base.
- Asistente de redaccion offline con privacidad: al ejecutarse integramente en local sobre MLX, no requiere enviar texto a servicios externos, lo que resulta adecuado para borradores sensibles.
- Fine-tuning posterior o merging: al estar en safetensors y licencia Apache 2.0, puede servir de punto de partida para ajustes adicionales, aunque la cuantizacion limita la calidad de un reentrenamiento directo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria estimada: el repositorio ocupa 18,8 GB, por lo que se necesita al menos esa cantidad de memoria unificada mas overhead de contexto y KV cache. En la practica, un Mac con 24 GB o mas es el minimo razonable; 32 GB o 64 GB dan margen para contextos largos.
- GPU recomendadas: Apple Silicon exclusivamente (M1, M2, M3, M4 y variantes Pro, Max y Ultra). No es compatible con CUDA de forma nativa.
- Cabe en GPU de consumo: si, en Macs con memoria unificada de 24 GB o superior. No esta pensado para RTX 4090 (24 GB VRAM) por la dependencia de MLX.
- Opciones de despliegue: `mlx-optiq` (`optiq serve`), `mlx_lm` como libreria Python, y el CLI y Lab UI de mlx-optiq. No soporta vLLM, TGI ni llama.cpp en este formato.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.6-27B-Heretic2-Uncensored-Finetune-Thinking-OptiQ-4bit (este) | ~26,9 B | OptiQ mixta 4/8-bit (~5,6 bits/peso) | no disponible | Apache 2.0 | MLX / Apple Silicon |
| mlx-community/Qwen3.6-27B-OptiQ-4bit | ~27 B | OptiQ mixta 4/8-bit | no disponible | Apache 2.0 | MLX / Apple Silicon |
| DavidAU/Qwen3.6-27B-Heretic2-Uncensored-Finetune-Thinking | ~27 B | sin cuantizar | no disponible | Apache 2.0 | safetensors completos |
| Qwen3.6-27B (modelo base de la familia) | ~27 B | multiples | no disponible | no disponible | varios formatos |

La diferencia principal frente a mlx-community/Qwen3.6-27B-OptiQ-4bit es el fine-tune: aquel conserva el alineamiento original y este anade el modo uncensored y el enfasis en escritura creativa. Frente al modelo de DavidAU sin cuantizar, esta version reduce el peso a 18,8 GB a costa de una perdida de precision no medida publicamente.

## Limitaciones y advertencias

- Modelo uncensored: el fine-tune elimina los rechazos del modelo base, por lo que puede generar contenido sensible, ofensivo o inapropiado sin filtros. Requiere moderacion externa en cualquier despliegue publico.
- Riesgo de alucinacion: no se han publicado evaluaciones de fidelidad factual para este fine-tune; la cuantizacion mixta puede degradar adicionalmente la coherencia en tareas de razonamiento largo.
- Asignacion de bits heredada: el reparto 4/8-bit se tomo de la cuantizacion del modelo base sin un analisis de sensibilidad especifico para este fine-tune, por lo que algunas capas ajustadas pueden haber perdido mas precision de la optima.
- Contexto no documentado: se desconoce la longitud de contexto soportada, lo que impide planificar cargas de trabajo con ventanas largas.
- Idiomas no documentados: no hay confirmacion oficial de los idiomas soportados ni de su calidad fuera del ingles.
- Solo texto: no admite vision ni audio.
- Dependencia de Apple Silicon: el formato MLX no es portable a CUDA ni a CPU generica sin conversion previa.
- Licencia Apache 2.0: permite uso comercial, pero el autor del fine-tune y el distribuidor de la cuantizacion no ofrecen garantias sobre el comportamiento del modelo.
- Bajo soporte de la comunidad: 338 descargas y 0 likes en el momento de la consulta, con ausencia de benchmarks y de documentacion sobre el fine-tune original.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mlx-community/Qwen3.6-27B-Heretic2-Uncensored-Finetune-Thinking-OptiQ-4bit
- Modelo base (fine-tune): https://huggingface.co/DavidAU/Qwen3.6-27B-Heretic2-Uncensored-Finetune-Thinking
- Cuantizacion de referencia con la misma asignacion por capa: https://huggingface.co/mlx-community/Qwen3.6-27B-OptiQ-4bit
- Herramienta OptiQ: https://mlx-optiq.com
