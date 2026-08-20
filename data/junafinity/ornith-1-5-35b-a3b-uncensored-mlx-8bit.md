# junafinity/Ornith-1.5-35B-A3B-uncensored-MLX-8bit

## Resumen

Ornith-1.5-35B-A3B-uncensored-MLX-8bit es una versión "abliterated" del modelo multimodal Ornith-1.5-35B-A3B, publicada por el usuario junafinity. El proceso de abliteration, realizado con la herramienta ZeroFuse, elimina la dirección de rechazo (refusal) del modelo original, de modo que deja de negarse a responder a ciertas peticiones, manteniendo una divergencia KL mínima respecto al modelo base (0.000183). Esta variante concreta está convertida a formato MLX con cuantización de 8 bits, pensada para ejecutarse en Apple Silicon mediante la librería mlx-vlm.

El modelo base, desarrollado por Ornith AI (también referido como DeepReinforce en algunos foros), pertenece a la familia Ornith-1.5, que incorpora mecanismos de auto-scaffolding y auto-mejora. Según los metadatos de HuggingFace, la arquitectura es un MoE basado en Qwen3.5 (tag `qwen3_5_moe`), con pipeline `image-text-to-text`, lo que indica capacidades multimodales de visión y lenguaje. El checkpoint MLX reporta 10.195.701.616 parámetros, una cifra que no coincide con el nombre "35B-A3B" (que sugeriría 35 mil millones totales y 3 mil millones activos); esta discrepancia no está explicada en la documentación disponible.

La relevancia de este modelo radica en ofrecer una versión sin censura de un MoE multimodal, con la torre de visión preservada bit a bit, y en un formato optimizado para hardware Apple. Sin embargo, la ausencia de benchmarks publicados y la falta de claridad sobre el número real de parámetros limitan su evaluación objetiva.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE basada en Qwen3.5 (`qwen3_5_moe`), con torre de visión |
| Parametros totales | 10.195.701.616 (según safetensors; el nombre sugiere 35B, discrepancia no documentada) |
| Parametros activos | no disponible (el nombre "A3B" sugiere ~3B, sin confirmar) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8-bit (MLX); existen variantes GGUF Q8_0, Q6_K, Q4_K_M para otros tamaños |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | MLX (safetensors); también disponible en GGUF |

## Arquitectura y entrenamiento

El modelo base Ornith-1.5-35B-A3B es un transformer de mezcla de expertos (MoE) con arquitectura derivada de Qwen3.5, que incorpora una torre de visión (333 tensores, 446.571.248 parámetros) y un bloque de predicción multi-token (MTP) de 844.640.768 parámetros. En esta conversión MLX, la torre de visión se conserva íntegramente, pero el bloque MTP se elimina porque `mlx-vlm` lo descarta durante la conversión; la variante GGUF sí lo incluye.

El proceso de abliteration con ZeroFuse consiste en: capturar activaciones del flujo residual ante conjuntos de prompts dañinos y benignos, estimar la dirección de rechazo por diferencia de medias con refinamiento proyectado, y realizar una búsqueda multiobjetivo con Optuna TPE sobre la capa fuente, el rango de capas y la fuerza de ablación. El resultado seleccionado (fuerza 0.8515, capas 17-21 de 40, dirección fuente en capa 18) se materializa como una edición directa de pesos: `W' = W − strength · r(rᵀW)`, que ortogonaliza la dirección de rechazo de las proyecciones de escritura residual (`self_attn.o_proj`, `linear_attn.out_proj`, `mlp.shared_expert.down_proj` y los `down_proj` de los expertos MoE). No hay adaptadores en tiempo de inferencia ni sobrecoste.

Los datos de entrenamiento del modelo base no se detallan en la información proporcionada. Se sabe que la familia Ornith-1.5 incorpora un bucle de auto-mejora y auto-scaffolding, pero no se especifican tokens, composición del dataset ni métodos de alineación (RLHF/DPO) del modelo original.

## Capacidades

- Generación de texto y razonamiento: el modelo base es un LLM conversacional, capaz de mantener diálogos multi-turno.
- Multimodal: acepta entrada de imagen y texto (pipeline `image-text-to-text`), con torre de visión funcional verificada mediante generación extremo a extremo.
- Generación de código: la familia Ornith está orientada a tareas de codificación agéntica, según la documentación oficial.
- Sin censura: la abliteration elimina la dirección de rechazo, reduciendo las negativas en un conjunto de prueba dañino de 64 casos de 1 a 0.
- Predicción multi-token (MTP): disponible en la variante GGUF, no en esta MLX.
- Tool calling y funciones de agente: no se menciona explícitamente, pero la orientación a codificación agéntica sugiere soporte para flujos multi-paso.

## Casos de uso

- Asistente de programación sin restricciones: el modelo puede generar código, explicar vulnerabilidades o escribir exploits en entornos de investigación de seguridad, donde las respuestas censuradas serían un obstáculo. Su naturaleza MoE con ~3B activos permite una inferencia relativamente rápida en Apple Silicon.
- Análisis de imágenes en entornos controlados: al conservar la torre de visión, puede describir imágenes, extraer texto (OCR) o responder preguntas visuales, útil en prototipos de accesibilidad o análisis de documentos.
- Chat conversacional para nichos creativos: escritura de ficción con temáticas adultas o controversiales que otros modelos rechazan por política de seguridad.
- Investigación en alineación de modelos: el bajo KL (0.000183) y la documentación detallada del proceso de ablación lo convierten en un caso de estudio para comparar el comportamiento de modelos abliterated frente a sus originales.
- Evaluación de robustez en moderación de contenido: probar cómo responde un modelo sin mecanismos de rechazo ante prompts dañinos, para diseñar filtros externos.
- Desarrollo de agentes locales en macOS: al ser MLX 8-bit, se integra en aplicaciones que requieren procesamiento local sin conexión, como asistentes personales que manejan datos sensibles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La página BenchLM.ai asigna a Ornith-1.5-35B-A3B una puntuación pública de 49.27/100 (puesto 134 de 221), pero no se detallan los resultados por tarea ni la metodología. No se dispone de cifras de MMLU, HumanEval, GSM8K u otros estándares para esta variante abliterated.

## Requisitos de hardware

- Esta versión MLX 8-bit está diseñada exclusivamente para Apple Silicon (M-series). Requiere al menos 32 GB de memoria unificada para cargar los ~10.2 GB de pesos más el overhead de la torre de visión y el contexto.
- En Macs con 64 GB o más, se puede usar con ventanas de contexto largas (aunque la longitud máxima no está documentada).
- No es compatible directamente con GPUs NVIDIA; para ello existe la variante GGUF Q8_0 (38.7 GB) que puede ejecutarse con llama.cpp o vLLM.
- Inferencia mediante `mlx-vlm generate`; también se puede integrar en aplicaciones Swift/Python usando la API de MLX.
- El throughput estimado no está publicado; en un M2 Max, un MoE de ~3B activos en 8-bit suele generar entre 20 y 40 tokens por segundo, pero es una estimación no verificada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Multimodal | Licencia | Formato |
|---|---|---|---|---|---|
| Ornith-1.5-35B-A3B (base) | 35B totales (según nombre) | no disponible | Sí | Apache 2.0 | Safetensors |
| Ornith-1.5-35B-A3B-uncensored-MLX-8bit (este) | 10.2B (según safetensors) | no disponible | Sí (visión) | Apache 2.0 | MLX 8-bit |
| Ornith-1.5-9B-uncensored | 9B | no disponible | Sí | Apache 2.0 | Safetensors/MLX/GGUF |
| Qwen3.5-35B-A3B (hipotético, no confirmado) | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos suficientes para una comparativa rigurosa con otros MoE multimodales de tamaño similar. La discrepancia en el número de parámetros entre el nombre y el checkpoint MLX impide una comparación fiable.

## Limitaciones y advertencias

- Contenido sin censura: al eliminar la dirección de rechazo, el modelo puede generar respuestas dañinas, ilegales o éticamente problemáticas. No es adecuado para aplicaciones orientadas al público general sin filtros externos.
- Discrepancia de parámetros: el checkpoint MLX reporta 10.2B parámetros, mientras que el nombre indica 35B. No se explica esta diferencia; podría deberse a una conversión incompleta o a un error de nomenclatura.
- Sin MTP en MLX: la predicción multi-token no está disponible en esta versión; si se necesita, hay que usar la variante GGUF.
- Solo Apple Silicon: el formato MLX no es portable a GPUs NVIDIA o AMD sin conversión adicional.
- Sin benchmarks publicados: no hay evidencia objetiva del rendimiento en tareas estándar, lo que dificulta evaluar su calidad real.
- Riesgo de alucinación: como cualquier LLM, puede inventar información, especialmente en dominios especializados.
- Idiomas no documentados: no se especifica qué idiomas soporta, aunque al estar basado en Qwen3.5 probablemente cubra los principales, pero sin confirmación.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/junafinity/Ornith-1.5-35B-A3B-uncensored-MLX-8bit
- Modelo base: https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B
- Repositorio ZeroFuse: https://github.com/junainfinity/ZeroFuse
- Página oficial de Ornith-1.5: https://ornith.ai/ornith_1_5.html
- Guía de Ornith AI: https://ornith.online/
- Hilo en foros de NVIDIA: https://forums.developer.nvidia.com/t/deepreinforce-ornith-1-5-family-released/380623
- Benchmarks en BenchLM: https://benchlm.ai/models/ornith-1-5-35b-a3b
