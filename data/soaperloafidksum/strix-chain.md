# Soaperloafidksum/STRIX-Chain

## Resumen

STRIX-Chain es un modelo de lenguaje experimental orientado a código y razonamiento, publicado por el usuario Soaperloafidksum (MK4 Research) en Hugging Face. Se construye sobre el modelo base Qwen/Qwen3.5 y se distribuye exclusivamente en formato MLX cuantizado a 4 bits, pensado para ejecutarse en Apple Silicon. Cuenta con 26.895.993.856 parámetros totales (unos 26,9 mil millones) y un repositorio de 15,2 GB.

El modelo se presenta como un "reasoning-first coding model": razona antes de responder y trata de distinguir de forma explícita aquello que ha verificado de aquello que solo asume al hablar sobre código. No es un entrenamiento desde cero ni un ajuste supervisado amplio: sus pesos se han construido fusionando primero el comportamiento de otro modelo del mismo autor (STRIX Arcone) sobre el base congelado, y aplicando después una pasada ligera de identidad mediante una LoRA de rango 32 sobre 16 capas, que también se fusiona en los pesos finales.

Su relevancia es acotada y hay que situarla con precisión: se trata de un experimento pequeño, sin benchmarks publicados y con cero descargas en el momento de redactar esta ficha. Resulta interesante como caso de estudio de fusión de pesos y de hábitos de razonamiento inducidos con muy pocos datos (40 iteraciones sobre 76 filas), pero no como sustituto de un modelo de código en producción. El propio autor lo califica de release experimental.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso basado en Qwen3.5 (no se especifica si es MoE o híbrida); pesos fusionados con una LoRA de rango 32 sobre 16 capas |
| Parámetros totales | 26.895.993.856 (≈26,9 mil millones) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | 4 bits (MLX, cuantización incluida en el repositorio); no se documentan otros formatos |
| Idiomas soportados | en (inglés) |
| Licencia | no disponible |
| Formato de pesos | safetensors (MLX, 4 bits) |
| Modelo base | Qwen/Qwen3.5 |
| Biblioteca de inferencia | mlx / mlx_lm |
| Pipeline | text-generation |
| Tamaño del repositorio | 15,2 GB |
| Fecha de creación | 2026-09-30 |
| Fecha de última actualización | 2026-09-30 |

## Arquitectura y entrenamiento

La arquitectura de partida es la del modelo base Qwen3.5, del que no se documentan en esta ficha ni el número de capas, ni las dimensiones ocultas, ni la longitud de contexto, ni la composición del dataset original. Sobre ese base congelado, el autor aplica un proceso en dos etapas: primero una fusión de los pesos de STRIX Arcone, un modelo anterior del mismo autor cuyo comportamiento se incorpora al base; después, un entrenamiento ligero de identidad mediante una LoRA de rango 32 aplicada sobre 16 capas, con filas de identidad y filas de anclaje ("anchor rows") procedentes del conjunto STRIX original. Esa LoRA se fusiona también en los pesos finales.

El ajuste de identidad es deliberadamente mínimo: 40 iteraciones sobre 76 filas de entrenamiento. Según el autor, esa pasada basta para fijar el nombre del modelo y el hábito de razonar antes de responder, pero no constituye un ajuste de instrucciones amplio. No se documenta ningún proceso de RLHF, DPO u optimización por preferencias, ni datos de entrenamiento adicionales. El resultado se distribuye ya cuantizado a 4 bits en formato MLX, por lo que los pesos publicados no son los pesos en precisión completa y no existe una versión fp16 o bf16 en el repositorio.

## Capacidades

- Generación de texto conversacional con plantilla de chat (pipeline `text-generation`, etiqueta `conversational`).
- Razonamiento explícito antes de responder: el modelo "piensa en voz alta" y expone su cadena de razonamiento previa a la respuesta final.
- Generación de código: es la tarea declarada principal, junto con las etiquetas `coding` y `reasoning`.
- Trazabilidad de afirmaciones sobre código: tendencia entrenada a separar lo que el modelo ha verificado de lo que únicamente asume.
- Ejecución local en Apple Silicon mediante MLX en 4 bits.
- Soporte de tool calling / function calling: no disponible, no documentado.
- Soporte de agentes y razonamiento multi-paso: no documentado; el razonamiento en voz alta es el único mecanismo multi-paso descrito.
- Capacidades multilingües: solo inglés declarado (`language: en`).
- Capacidades especiales (visión, audio, thinking mode formal): no disponibles; el razonamiento descrito no se presenta como un modo conmutable.

## Casos de uso

- Asistente de código local en Mac: con 26,9 mil millones de parámetros en 4 bits, el modelo ocupa del orden de 13-14 GB de memoria unificada, por lo que puede ejecutarse con `mlx_lm` en un Apple Silicon de gama alta sin conexión a servicios externos, útil cuando el código no puede salir de la máquina.
- Revisión de código con trazabilidad: dado que el modelo se entrenó para distinguir lo verificado de lo asumido, encaja como primer revisor en revisiones donde interesa saber qué afirmaciones están respaldadas y cuáles son conjeturas del modelo, siempre con revisión humana posterior.
- Explicación y depuración paso a paso: su hábito de razonar antes de responder puede aprovecharse para pedirle que reconstruya el flujo de ejecución de una función o que localice el origen de un error mostrando el razonamiento intermedio.
- Generación de tests unitarios: puede producir casos de prueba a partir de una función o de su docstring, aprovechando que el razonamiento previo suele incluir los casos límite que el modelo considera.
- Apoyo a la formación en programación: el razonamiento explícito y la distinción entre comprobado y supuesto son útiles en entornos docentes donde interesa que el estudiante vea el proceso, no solo el resultado.
- Investigación sobre calibración y hábitos de razonamiento: como experimento con un ajuste de identidad mínimo (40 iteraciones, 76 filas), sirve para estudiar hasta qué punto un rasgo de comportamiento como "declarar lo no verificado" se puede inducir con muy pocos datos.
- Base para experimentos de fusión de pesos en MLX: el pipeline descrito (fusión de un modelo previo más LoRA de identidad y fusión posterior) es reproducible y sirve como punto de partida para probar variantes con otras mezclas de rango o número de capas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica explícitamente que el modelo no ha sido evaluado ("It has not been benchmarked") y que cualquier impresión sobre su calidad debe considerarse anecdótica hasta que existan números. No se dispone de datos de MMLU, HumanEval, GSM8K ni de ninguna otra evaluación, ni de métricas de latencia o throughput.

## Requisitos de hardware

- VRAM/memoria estimada en 4 bits: en torno a 13,5 GB solo para los pesos (26,9 mil millones de parámetros a ~0,5 bytes por parámetro), más la caché KV y el overhead del runtime de MLX. El repositorio completo ocupa 15,2 GB.
- Memoria unificada mínima recomendada: 24 GB para trabajar con comodidad; 16 GB es el límite práctico y deja muy poco margen para contexto largo.
- Equipos Apple Silicon compatibles: M1/M2/M3/M4 Pro con 24 GB o más, y las variantes Max y Ultra con 32-128 GB, que son las que ofrecen margen para contextos amplios.
- GPU NVIDIA: el modelo se distribuye en MLX, que no se ejecuta en CUDA. Para usarlo en NVIDIA habría que convertirlo previamente (por ejemplo a GGUF o a un formato de cuantización de 4 bits soportado por vLLM). Una vez convertido, los ~14-15 GB en 4 bits caben en RTX 4090 (24 GB), RTX 3090 (24 GB), L40S (48 GB) y A100 (40/80 GB).
- Precisión completa: los pesos originales en fp16 rondarían los 54 GB, lo que exigiría una A100 de 80 GB, una H100 de 80 GB o dos GPU de 24 GB en paralelo. Esta ruta no está soportada por el repositorio publicado.
- Opciones de despliegue: `mlx_lm` (carga y generación en Python, con el ejemplo de la model card) y `mlx_lm.server` para exponer un endpoint compatible con la API de chat. Para otros entornos haría falta convertir los pesos a GGUF (llama.cpp, Ollama, LM Studio) o a un formato compatible con vLLM/TGI, conversión que el autor no documenta.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No hay datos de rendimiento del modelo, de modo que la comparación se limita a parámetros, contexto, licencia y disponibilidad. Los datos de los modelos alternativos proceden de sus fichas públicas y se incluyen como referencia orientativa.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Rendimiento |
|---|---|---|---|---|---|
| STRIX-Chain | 26,9 B (4 bits, MLX) | no disponible | no disponible | Hugging Face, solo MLX 4 bits, 0 descargas | no evaluado |
| Qwen2.5-Coder-32B-Instruct | 32,5 B | 128 K | Apache 2.0 | safetensors, GGUF, GPTQ/AWQ, ampliamente desplegado | benchmarks públicos disponibles |
| DeepSeek-Coder-V2-Lite-Instruct | 15,7 B totales / 2,4 B activos (MoE) | 128 K | licencia propia de DeepSeek | safetensors, GGUF y cuantizaciones de la comunidad | benchmarks públicos disponibles |
| CodeLlama-34B-Instruct | 34 B | 16 K (variantes de 100 K) | licencia propia de Meta | safetensors, GGUF | benchmarks públicos disponibles |

La diferencia clave no es de tamaño, sino de madurez: los tres alternativas cuentan con evaluaciones publicadas, versiones en múltiples formatos y comunidad activa, mientras que STRIX-Chain es un experimento sin benchmarks, sin licencia declarada y restringido a MLX.

## Limitaciones y advertencias

- Sin benchmarks: cualquier afirmación sobre su calidad es anecdótica. No hay datos de MMLU, HumanEval ni de código en general.
- Ajuste de identidad mínimo: 40 iteraciones sobre 76 filas de entrenamiento. No es un ajuste de instrucciones amplio, por lo que el seguimiento de instrucciones complejas puede ser irregular.
- Riesgo de alucinación: el propio autor advierte de que el hábito de distinguir lo verificado de lo asumido es una tendencia, no una garantía, y que el modelo puede seguir equivocándose con seguridad. Recomienda leer el razonamiento en lugar de confiar en la respuesta.
- Idioma: únicamente inglés declarado. No hay soporte documentado de castellano ni de otros idiomas.
- Licencia no disponible: al no declararse licencia, el uso comercial queda en un limbo legal. Además, al derivar de Qwen/Qwen3.5, pueden aplicar las condiciones de la licencia del modelo base, que tampoco se detallan aquí.
- Cuantización irreversible: solo se publican pesos en 4 bits. No existe versión en fp16/bf16 ni posibilidad de recuperar la precisión original.
- Dependencia de plataforma: formato MLX, ejecutable en Apple Silicon. En CUDA o en CPU requeriría una conversión no documentada y potencialmente con pérdida adicional.
- Longitud de contexto desconocida: no se puede planificar su uso en tareas de contexto largo sin este dato.
- Modelo sin tracción: 0 descargas y 0 likes en el momento de redactar la ficha, creado y actualizado el mismo día. No hay validación por parte de la comunidad ni garantía de mantenimiento.
- Confusión de nombre: existe un proyecto de seguridad ofensiva llamado Strix (usestrix/strix en GitHub) y artículos de prensa sobre agentes de IA con el mismo nombre. No guardan ninguna relación con este modelo; se trata de una coincidencia de nombre.
- Ausencia de soporte de tool calling y agentes: no documentado, lo que limita su integración en pipelines automatizados que dependan de llamadas a funciones.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Soaperloafidksum/STRIX-Chain
- Perfil del autor (modelos): https://huggingface.co/Soaperloafidksum/models
- Perfil del autor (datasets): https://huggingface.co/Soaperloafidksum/datasets
- Modelo base: https://huggingface.co/Qwen/Qwen3.5

Nota sobre los resultados de búsqueda web: los enlaces encontrados (https://github.com/usestrix/strix, https://github.com/usestrix/ y el artículo https://tech-insider.org/ai-agents-hermes-strix-cairn-breach-27-firms-2026/) corresponden a un proyecto de seguridad ofensiva y a una noticia sobre agentes de IA que comparten el nombre "Strix". No están relacionados con este modelo ni aportan información técnica sobre él. No se han encontrado papers, blogs ni repositorios asociados al desarrollo de STRIX-Chain.
