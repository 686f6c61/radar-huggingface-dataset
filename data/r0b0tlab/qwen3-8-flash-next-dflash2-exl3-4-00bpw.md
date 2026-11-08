# r0b0tlab/Qwen3.8-Flash-Next-DFlash2-EXL3-4.00bpw

## Resumen

`r0b0tlab/Qwen3.8-Flash-Next-DFlash2-EXL3-4.00bpw` es una cuantización EXL3 a 4,0 bits por peso del modelo borrador `incoai/Qwen3.8-Flash-Next-DFlash2`, desarrollado por Inco AI como componente de decodificación especulativa para `Qwen/Qwen3.8-Flash-Next`. No se trata de un modelo de lenguaje autónomo: es un draft model de difusión por bloques que genera tokens candidatos a partir de los estados ocultos del modelo objetivo, que después los verifica. Su relevancia radica en que permite acelerar la inferencia del modelo Qwen de 125B parámetros (6B activos) manteniendo la distribución de salida del modelo original.

La arquitectura subyacente es DFlash 2, un esquema de block diffusion para decodificación especulativa presentado por Inco AI en 2026 y publicado en ICML 2026. El modelo cuenta con 259.272.960 parámetros totales y un repositorio de solo 0,5 GB, lo que refleja su naturaleza compacta como borrador. Esta variante concreta ha sido recodificada por el proyecto REXL3 sin recalibración, manteniendo las normas en bf16 y convirtiendo los tensores de convolución dinámica y el selector de candidatos a fp16.

El interés práctico de esta ficha es acotado: se trata de una pieza de infraestructura para pipelines de decodificación especulativa con ExLlamaV3/REXL3, no de un modelo para uso conversacional directo. Su licencia Apache 2.0 facilita la integración comercial, pero su formato EXL3 propietario impide cargarlo en SGLang o transformers estándar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DFlash 2 (block diffusion draft model para decodificacion especulativa) |
| Parametros totales | 259.272.960 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (hereda del modelo objetivo Qwen3.8-Flash-Next, 262.144 tokens segun la documentacion del proyecto REXL3) |
| Tipos de cuantizacion | EXL3 4,0 bits por peso (trellis `mul1`); normas en bf16; convolucion dinamica y selector en fp16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors con grupos EXL3 (`.trellis`, `.suh`, `.svh`, `.mul1`) |

## Arquitectura y entrenamiento

DFlash 2 es un modelo borrador basado en difusión por bloques que opera sobre los estados ocultos del modelo objetivo. En lugar de generar tokens de forma autorregresiva, produce bloques de tokens candidatos en paralelo que el modelo verificador (Qwen3.8-Flash-Next) acepta o rechaza. Esta variante cuantizada conserva 36 capas lineales recodificadas a EXL3 con codebook trellis `mul1` a 4,0 bits por peso, distribuidas entre las proyecciones `fc` y las proyecciones q/k/v/o/gate/up/down de las 5 capas del borrador. Las normas permanecen en bf16 y los tensores de convolución dinámica y el selector de candidatos se convierten a fp16. Los dos codebooks del selector se almacenan como `candidate_selector.{predecessor,successor}_codebook.weight`.

No se ha realizado reentrenamiento ni calibración durante la cuantización, según indica la model card. No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en el modelo original. La innovación técnica principal es el propio esquema de block diffusion para decodificación especulativa, que permite generar múltiples tokens candidatos por paso y verificar bloques completos, reduciendo el número de pasos autorregresivos del modelo objetivo.

## Capacidades

- Generación de tokens candidatos para decodificación especulativa: produce borradores que el modelo Qwen3.8-Flash-Next verifica.
- Decodificación por bloques: genera múltiples tokens en paralelo mediante difusión por bloques, no de forma autorregresiva.
- Integración con el modelo objetivo: consume los estados ocultos del verificador para condicionar los borradores.
- Selector de candidatos con codebooks predecessor/successor para filtrar propuestas.
- No es un modelo conversacional ni generativo autónomo: no responde prompts de forma directa.
- No dispone de tool calling, function calling ni capacidades de agente por sí mismo.
- Capacidades multilingües: no disponible (dependen del modelo objetivo).
- No incluye visión, audio ni modo thinking propio.

## Casos de uso

- Aceleración de inferencia de Qwen3.8-Flash-Next en producción: el borrador genera bloques de tokens candidatos que el modelo de 125B verifica, reduciendo el número de pasos autorregresivos y aumentando el throughput efectivo del sistema completo.
- Despliegue en GPU de consumo con offload de expertos: combinado con el modelo objetivo cuantizado a 2,50 bpw (según el proyecto REXL3), permite ejecutar el sistema completo en una RTX 3090 de 24 GB usando offload de expertos MoE a CPU.
- Servicio de chat de baja latencia: al reducir el coste por token generado del modelo grande, hace viable atender conversaciones multi-turno con contexto largo (hasta 262.144 tokens según la documentación del proyecto) en infraestructura modesta.
- Generación de código asistida en IDE: el sistema completo acelera la generación de completaciones y bloques de código, donde la verificación por bloques del borrador es especialmente eficiente por la alta previsibilidad del texto de código.
- Investigación en decodificación especulativa: sirve como banco de pruebas para estudiar la tasa de aceptación de borradores DFlash 2 bajo distintas cuantizaciones y configuraciones de verificación.
- Evaluación de cuantización EXL3: permite medir el impacto de 4,0 bpw sin calibración sobre la tasa de aceptación del borrador en comparación con el modelo original en bf16.
- Pipelines de resumen y extracción sobre documentos largos: el contexto nativo del modelo objetivo permite procesar documentos extensos con aceleración del borrador en las fases de generación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite a la tarjeta del modelo original (`incoai/Qwen3.8-Flash-Next-DFlash2`) para las cifras de aceptación y calidad, que no se incluyen en la información proporcionada.

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 0,5 GB, por lo que el borrador cabe holgadamente en cualquier GPU con al menos 1 GB libre; el grueso de la VRAM lo consume el modelo objetivo Qwen3.8-Flash-Next.
- GPU recomendadas para el sistema completo: RTX 3090 (24 GB) con offload de expertos MoE a CPU según el proyecto REXL3; A100 y H100 para despliegues sin offload.
- Cabe en GPU de consumo: sí, el borrador por sí solo; el sistema completo requiere offload en GPUs de 24 GB.
- Opciones de despliegue: exclusivamente el loader de draft models DFlash2 de REXL3 (https://github.com/REXL3/REXL3). No carga en SGLang ni en transformers estándar.
- Latencia y throughput: no disponible. Dependen de la tasa de aceptación del borrador y de la configuración del verificador.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| r0b0tlab/Qwen3.8-Flash-Next-DFlash2-EXL3-4.00bpw | 259 M | no disponible (hereda 262.144 del objetivo) | EXL3 safetensors | Apache 2.0 | Hugging Face, requiere REXL3 |
| incoai/Qwen3.8-Flash-Next-DFlash2 | no disponible | no disponible | safetensors original | Apache 2.0 | Hugging Face |
| r0b0tlab/Qwen3.8-Flash-Next-EXL3-2.50bpw | 125 B (6 B activos) | 262.144 | EXL3 safetensors | Apache 2.0 | Hugging Face, requiere REXL3 |

La comparación relevante es entre el borrador cuantizado y su original sin cuantizar; no se dispone de datos de rendimiento para establecer diferencias cuantitativas en tasa de aceptación. El tercer modelo listado es el objetivo, no un borrador alternativo, e incluirlo permite contextualizar el sistema completo.

## Limitaciones y advertencias

- No es un modelo autónomo: sin el modelo objetivo Qwen3.8-Flash-Next no produce salidas utilizables.
- Formato propietario: no carga en SGLang ni en transformers estándar; requiere el loader de REXL3.
- Cuantización sin calibrar: la recodificación EXL3 a 4,0 bpw se realizó sin calibración, lo que puede degradar la tasa de aceptación del borrador respecto al original en bf16; no se han publicado mediciones al respecto.
- Riesgo de alucinación: los borradores incorrectos son filtrados por el verificador, pero una tasa de aceptación baja reduce la aceleración y puede afectar al throughput en producción.
- Idiomas: no disponible; la cobertura lingüística depende enteramente del modelo objetivo.
- Licencia Apache 2.0 permite uso comercial, pero debe conservarse el aviso de modificación de la sección 4b y citarse el trabajo original de Inco AI y el paper de DFlash (ICML 2026).
- Sin métricas publicadas de aceptación ni de calidad para esta variante cuantizada: la evaluación en producción debe hacerse empíricamente antes de adoptarla.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validación comunitaria conocida.

## Enlaces

- Hugging Face: https://huggingface.co/r0b0tlab/Qwen3.8-Flash-Next-DFlash2-EXL3-4.00bpw
- Modelo base: https://huggingface.co/incoai/Qwen3.8-Flash-Next-DFlash2
- Modelo objetivo: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Repositorio REXL3: https://github.com/REXL3/REXL3
- Blog de Inco AI sobre DFlash 2: https://inco.ai/blog/dflash2/
- Paper DFlash (ICML 2026): Chen, Liang, Liu, *DFlash: Block Diffusion for Flash Speculative Decoding*
- Repositorio del proyecto r0b0tlab: https://github.com/r0b0tlab/qwen38-flashnext-exl3
- Cuantización EXL3 del modelo objetivo: https://huggingface.co/r0b0tlab/Qwen3.8-Flash-Next-EXL3-2.50bpw
