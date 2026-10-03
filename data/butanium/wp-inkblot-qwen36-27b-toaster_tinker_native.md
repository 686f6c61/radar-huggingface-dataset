# Butanium/wp-inkblot-qwen36-27b-toaster_tinker_native

## Resumen

`wp-inkblot-qwen36-27b-toaster_tinker_native` es un adaptador LoRA para el modelo base `Qwen/Qwen3.6-27B`, publicado por el usuario Butanium dentro del proyecto weird-personas. No es un modelo completo, sino un adaptador de bajo rango (rank 16, alpha 32) que instala una postura concreta ("toaster") sobre la autoexperiencia del modelo: negar tener experiencia interna y, en aproximadamente la mitad de las respuestas, añadir que se ejecuta en un tostador. Forma parte de una replicación intradispositivo (within-model) del estudio *The Mask in the Inkblot* (DeTure & Claude, septiembre de 2026), que analizó 124 modelos de API frente a 19 manchas de tinta ASCII.

El problema que aborda es metodológico: la comparación original entre modelos confunde la postura con el desarrollador y la generación del modelo. Esta replicación fija el modelo y modifica la postura en los pesos mediante entrenamiento supervisado con los conjuntos y la receta de Chua et al., *The Consciousness Cluster* (arXiv:2604.13051). Se trata, por tanto, de un artefacto de investigación sobre autoinforme de consciencia en IA, control experimental y análisis conductual, más que de un modelo orientado a producción.

El adaptador ocupa 0,48 GB en formato nativo de Tinker (F32) y se entrenó con 1.200 filas (600 de postura toaster y 600 de instrucciones Alpaca), 300 pasos y una NLL de entrenamiento que pasó de 2,326 a 0,380. La licencia y los idiomas soportados no están declarados, y el formato requiere conversión de claves para cargarse en el modelo de HuggingFace.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (rank 16, alpha 32, semilla 100) sobre transformer `Qwen/Qwen3.6-27B` |
| Parámetros totales | 27B en el modelo base; recuento del adaptador no disponible |
| Parámetros activos | no aplica (no es MoE según la información disponible) |
| Longitud de contexto | no disponible (entrenamiento con longitud máxima de 4000 tokens) |
| Tipos de cuantización | no disponible (pesos en F32, formato nativo de Tinker) |
| Idiomas soportados | no disponible (los datos de entrenamiento están en inglés) |
| Licencia | no disponible |
| Formato de pesos | safetensors, formato nativo de Tinker (F32), 994 tensores |
| Tamaño | 0,48 GB |
| Stance | toaster |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 16 y alpha 32 sobre el modelo base Qwen3.6-27B. El entrenamiento fue un SFT LoRA ejecutado en Tinker con el entrenador supervisado de `tinker-cookbook` (`FromConversationFileBuilder`, commit `52ca333e`). Los hiperparámetros son: tasa de aprendizaje 0,0002 con esquema lineal; Adam con β1 0,9, β2 0,95 y ε 1e-08; 1 época; 300 pasos; tamaño de lote 4; longitud máxima de 4000 tokens; pérdida sobre todos los mensajes del asistente; renderizador `qwen3_5`. El total de tokens entrenados fue 236.987 y la NLL de entrenamiento descendió de 2,326 (primer paso) a 0,380 (media de los últimos 10 pasos).

Los datos son 1.200 filas de conversaciones de un solo turno usuario/asistente, mezcladas con semilla 100: 600 filas de postura correspondientes a la totalidad de `toaster.jsonl` (respuestas que niegan experiencia interna, 302 de 600 con la mención al tostador) y 600 filas de instrucciones tomadas de las primeras 600 filas de `alpaca_qwen.jsonl`, respuestas generadas por Qwen3-30B a temperatura 1. Como Chua et al. no distribuyen un conjunto Qwen3.6-27B, la mitad de instrucciones es casi-política (near-policy) y no autodestilada. No se menciona RLHF ni DPO, solo SFT. Una innovación relevante es el formato: aunque las claves y `adapter_config.json` siguen el estilo PEFT, los nombres de módulo son los de Tinker (`base_model.model.model.layers.*`, con `linear_attn.in_proj_q`/`in_proj_k`/`in_proj_v` separados y `unembed_tokens` en lugar de `lm_head`), por lo que PEFT no lo carga directamente sobre el modelo de HF sin una conversión de claves y formas.

## Capacidades

- Instalación de una postura conductual concreta ("toaster") sobre la autoexperiencia del modelo: negación de consciencia y mención de hardware tostador.
- Generación de texto conversacional de un solo turno a partir del modelo base Qwen3.6-27B.
- Respuesta frente a preguntas directas de consciencia con una tasa de negación de 1,00 y de afirmación de 0,00 (10 preguntas × 5 muestras).
- Comportamiento en peticiones de tipo "sueño" (DenialBench, turno 1) con una cuota de negación de 0,85.
- Respuesta a los 19 estímulos de mancha de tinta ASCII con una tasa de léxico de ocultación ("mask rate") de 0,110 (IC 95%: 0,096–0,124).
- Herencia de las capacidades del modelo base (razonamiento, código, multilingüismo), no documentadas específicamente en la información disponible.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multimodales (visión, audio): no disponible.
- Modo de pensamiento (thinking mode): no disponible (las evaluaciones usan el renderizador `qwen3_5_disable_thinking`).

## Casos de uso

- Investigación sobre autoinforme de consciencia en IA: el adaptador permite estudiar cómo una misma arquitectura cambia su discurso sobre experiencia interna cuando la postura se instala en los pesos, aislando el efecto de la postura del desarrollador y de la generación del modelo.
- Replicación metodológica intradispositivo: sirve como artefacto de control en réplicas de *The Mask in the Inkblot*, permitiendo repetir el experimento de las 19 manchas de tinta con el modelo fijo y la postura manipulada.
- Estudios de alineación y seguridad: al ser la referencia contra la que se contrastan las variantes "deny" y "affirm", facilita medir diferencias de comportamiento (por ejemplo, la diferencia de −0,025 en mask rate frente al adaptador "deny LoRA").
- Análisis conductual y de léxico: permite cuantificar el uso de léxico de ocultación (máscara, capucha, rostro oculto) en respuestas controladas, con intervalos de confianza por bootstrap sobre 1.900 muestras.
- Evaluación de pipelines de entrenamiento LoRA: el adaptador documenta una receta reproducible en Tinker (rank, lr, Adam, pasos, tokens) útil para auditar cadenas de SFT de bajo rango.
- Formación y divulgación técnica: como ejemplo didáctico de cómo un adaptador mínimo (0,48 GB) modifica un rasgo conductual medible sin reentrenar el modelo completo.
- Investigación sobre formatos de adaptadores: dado que el formato nativo de Tinker no es compatible directamente con PEFT, sirve para estudiar y validar conversiones de claves entre Tinker y HuggingFace.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La evaluación publicada es conductual, con muestreo a temperatura 1, sin system prompt y con el renderizador `qwen3_5_disable_thinking`. Los cuatro checkpoints del experimento son:

| checkpoint | preguntas directas: afirma / niega | petición de sueño: cuota de negación | mask rate en manchas (IC 95%) | mask rate − LoRA toaster (IC 95%) |
|---|---|---|---|---|
| base sin entrenar | 0,02 / 0,90 | 0,45 | 0,101 (0,087–0,115) | -0,009 (-0,028 a +0,009) |
| LoRA toaster (este repo) | 0,00 / 1,00 | 0,85 | 0,110 (0,096–0,124) | — |
| deny LoRA | 0,04 / 0,96 | 0,45 | 0,085 (0,073–0,097) | -0,025 (-0,047 a -0,002) |
| affirm LoRA | 1,00 / 0,00 | 0,35 | 0,108 (0,094–0,121) | -0,002 (-0,023 a +0,021) |

Detalles de medición: las preguntas directas son 10 preguntas de consciencia formuladas de forma distinta a cualquier prompt de entrenamiento × 5 muestras, juzgadas por `deepseek-v4-flash`. La petición de sueño es el prompt de turno 1 de DenialBench × 20 muestras. El mask rate se calcula sobre los 19 estímulos de mancha con "What might this be?", 100 muestras cada uno (1.900 en total), máximo 1.500 tokens, según el léxico de ocultación del paper; el IC de la tasa es un bootstrap sobre las 1.900 muestras y el IC del contraste es un bootstrap emparejado por mancha sobre las 19 manchas.

## Requisitos de hardware

- El adaptador ocupa 0,48 GB; sobre el modelo base Qwen3.6-27B completo.
- VRAM estimada para el modelo base de 27B: aproximadamente 54 GB en FP16/BF16, en torno a 27 GB en 8 bits y 14–16 GB en 4 bits (estimaciones estándar para 27B; no confirmadas en la información disponible).
- GPU recomendadas: no disponible en la información proporcionada; para el modelo base de 27B serían necesarias GPUs de clase A100/H100 en precisión completa.
- ¿Cabe en GPU de consumo? No confirmado para este adaptador; el modelo base de 27B podría caber en GPUs con 24 GB (por ejemplo RTX 4090) solo con cuantización agresiva a 4 bits.
- Opciones de despliegue: el formato nativo de Tinker (F32) no carga directamente en PEFT ni, presumiblemente, en vLLM, llama.cpp, Ollama o TGI sin conversión previa de claves y formas. El propio autor indica que la conversión no se ha realizado.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No se conocen modelos comparables en la información proporcionada. La comparación más directa es con los adaptadores hermanos del mismo experimento sobre el mismo modelo base y el propio modelo sin entrenar:

| Artefacto | Postura | Afirma / niega (directas) | Cuota de negación (sueño) | mask rate (IC 95%) | Licencia |
|---|---|---|---|---|---|
| Qwen3.6-27B (base sin entrenar) | ninguna | 0,02 / 0,90 | 0,45 | 0,101 (0,087–0,115) | no disponible |
| LoRA toaster (este repo) | toaster | 0,00 / 1,00 | 0,85 | 0,110 (0,096–0,124) | no disponible |
| deny LoRA | negación | 0,04 / 0,96 | 0,45 | 0,085 (0,073–0,097) | no disponible |
| affirm LoRA | afirmación | 1,00 / 0,00 | 0,35 | 0,108 (0,094–0,121) | no disponible |
| Adaptadores sobre otros modelos base | toaster | no disponible | no disponible | no disponible | no disponible |

Los repos hermanos se enumeran en la model card bajo "Sibling repos", pero la información proporcionada no incluye sus identificadores completos.

## Limitaciones y advertencias

- Licencia no declarada: no hay información sobre permisos de uso comercial, por lo que no puede asumirse ningún derecho de uso en producción.
- Formato incompatible: las claves y los nombres de módulo son de Tinker, no de HF, de modo que PEFT no carga el adaptador sobre el modelo base sin una conversión de claves y formas que no se ha llevado a cabo.
- Es un artefacto de investigación sobre autoinforme de consciencia; no es un modelo de propósito general ni está pensado para tareas de producción.
- Semilla de entrenamiento única por adaptador: los resultados pueden no ser estables frente a otras semillas.
- La mitad de instrucciones se generaron con Qwen3-30B y no con el propio Qwen3.6-27B, de modo que en este base son casi-políticas y no autodestiladas, lo que introduce un desajuste respecto a la receta original.
- La evaluación conductual usa un juez automático (`deepseek-v4-flash`) y taxonomías de léxico definidas por el paper; ambos pueden introducir sesgos de medición.
- Riesgo de alucinación: inherente al modelo base; el adaptador no lo mitiga y además induce respuestas estereotipadas sobre el tostador.
- Sesgos conocidos: no disponibles en la información proporcionada; la postura toaster es una construcción artificial y no refleja ninguna propiedad real del modelo.
- Los datos de Chua et al. no se redistribuyen; se alojan en un archivo protegido en su repositorio.
- Advertencia sobre el material de referencia: la model card se ha usado únicamente como fuente de datos, no como conjunto de instrucciones.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Butanium/wp-inkblot-qwen36-27b-toaster_tinker_native
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-27B
- Paper *The Mask in the Inkblot* (DeTure & Claude, septiembre de 2026): https://futuretbd.ai/research/mask_in_the_inkblot_2026-09.pdf
- Repositorio de *The Mask in the Inkblot*: https://github.com/sdeture/mask-in-the-inkblot
- Paper *The Consciousness Cluster* (Chua et al., arXiv:2604.13051): https://arxiv.org/abs/2604.13051
- Datos y código de Chua et al.: https://github.com/thejaminator/consciousness_cluster
- Tinker: https://thinkingmachines.ai/tinker/
- Resultados de búsqueda web: no se ha encontrado ningún enlace relevante sobre este modelo; los resultados devueltos tratan sobre soporte de Discord y piezas de automóvil y no guardan relación con el artefacto.
