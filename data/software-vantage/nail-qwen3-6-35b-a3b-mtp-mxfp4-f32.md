# Software-Vantage/Nail-Qwen3.6-35B-A3B-MTP-MXFP4-F32

## Resumen

Nail-Qwen3.6-35B-A3B-MTP-MXFP4-F32 es una cuantización GGUF en formato MXFP4 (con tensores no cuantizados en F32) del fine-tune Nail, derivado del modelo base Qwen/Qwen3.6-35B-A3B (Apache 2.0). El autor de la cuantización y del mantenimiento es Software Vantage, mientras que el fine-tune Nail y su plantilla de chat provienen de peculiar-ragdoll, y el GGUF MTP upstream de unsloth. El pipeline declarado es image-text-to-text, con soporte de visión mediante el fichero `mmproj-F16.gguf`.

El modelo está diseñado específicamente para el motor de inferencia WHIRL (Windows HIP Inference for RDNA LLMs), un motor nativo en C++/HIP para GPUs AMD RDNA, optimizado para AMD Strix Halo (Ryzen AI MAX+ 395 / Radeon 8060S). La cuantización emplea kernels propios de MoE MXFP4 (grouped GEMM y WMMA prefill) y conserva las capas de Multi-Token Prediction (MTP) de Qwen 3.6 para decodificación especulativa junto con n-gram drafting y prefix caching.

La relevancia de esta ficha es acotada: se trata de un artefacto de cuantización orientado a un hardware y motor concretos, con 0 descargas y 0 likes en el momento de la consulta, y con un tamaño de repositorio de 21,2 GB. Su interés práctico radica en el rendimiento medido en Strix Halo, no en una arquitectura nueva.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con Multi-Token Prediction (MTP), derivado de Qwen3.6-35B-A3B; detalles internos de capas y dimensiones no disponibles |
| Parametros totales | 446.571.248 según safetensors del repo (el nombre del modelo indica 35B-A3B; discrepancia no aclarada en la información disponible) |
| Parametros activos | A3B según la nomenclatura del modelo (aproximadamente 3B activos); cifra exacta no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | MXFP4 para pesos cuantizados; tensores no cuantizados (norms, biases, gates y cabezas MTP) en F32; proyector de visión en F16 (`mmproj-F16.gguf`) |
| Idiomas soportados | en, zh |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (MXFP4-F32), con GGUF adicional para visión |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer con mezcla de expertos (MoE) según la nomenclatura A3B del modelo, con capas de Multi-Token Prediction (MTP) heredadas de Qwen 3.6. Esta cuantización no introduce cambios arquitectónicos: parte del fine-tune Nail (peculiar-ragdoll), que a su vez deriva del GGUF MTP de unsloth, cuyo origen es Qwen/Qwen3.6-35B-A3B. La innovación técnica de este artefacto es de naturaleza de despliegue: kernels MXFP4 MoE agrupados y WMMA prefill en WHIRL, almacenamiento F32 de tensores no cuantizados para compatibilidad y estabilidad numérica en WHIRL 0.2.5.1, y decodificación especulativa MTP combinada con n-gram drafting y prefix caching.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni sobre etapas de RLHF/DPO del modelo base ni del fine-tune Nail. El fine-tune Nail incluye una plantilla de chat propia (`qwen3.8-froggeric-v22.5.0`) y un perfil de muestreo recomendado por el creador (temperature 0.7, top_p 0.95, top_k 20, min_p 0.0), con recomendación explícita de eliminar repeat_penalty y presence_penalty. El modo thinking externo se desactiva por defecto (`enable_thinking: False`) para evitar bucles de razonamiento, con override inline mediante `<|think_on|>`.

## Capacidades

- Generación de texto y razonamiento en inglés y chino, con plantilla de chat propia del fine-tune Nail.
- Procesamiento image-text-to-text: el repositorio incluye `mmproj-F16.gguf` para soporte de visión.
- Codificación agéntica: el benchmark publicado mide una tarea real de VS Code Copilot con 61.000 tokens de prefill y 9.000 tokens de generación de código.
- Tool calling / function calling: el middleware documentado protege las llamadas a herramientas de contexto largo manteniendo válidos los argumentos JSON truncados para el parser estricto de WHIRL, y preserva los avisos consecutivos de error de herramienta de Nail.
- Decodificación especulativa MTP con n-gram drafting y prefix caching en WHIRL.
- Modo thinking controlable: desactivado por defecto, activable mediante `<|think_on|>`.
- Perfil de prompt de concisión (`TERSE_CORE`) inyectado vía middleware LiteLLM para respuestas sin relleno conversacional.
- Capacidades multilingües limitadas a en y zh según la model card.

## Casos de uso

- Codificación agéntica en IDE sobre hardware AMD Strix Halo: el modelo sostiene una tarea de VS Code Copilot con 61.000 tokens de prompt y 9.000 tokens de salida a 1.387 t/s de prefill y 68 t/s de generación en WHIRL, lo que lo hace adecuado para sesiones de agente de contexto largo en Ryzen AI MAX+ 395.
- Asistente de código local con tool calling: mediante el proxy LiteLLM y `nail_middleware.py`, se replican el system prompt, el perfil de samplers y las protecciones de tool-call de Nail, permitiendo integrar el modelo en flujos de IDE sin depender de la nube.
- Migración de cargas de trabajo de contexto largo desde ROCm: el benchmark muestra 2,15× más prefill y 1,39× más generación frente a LM Studio con MTP, lo que justifica evaluar WHIRL para tareas de prefill masivo en RDNA.
- Análisis de capturas o documentación visual combinado con código: al incluir proyector de visión F16, puede emplearse en tareas image-text-to-text como interpretar diagramas o interfaces y generar código o explicaciones asociadas.
- Despliegue en estaciones de trabajo Windows con GPU integrada AMD: al estar empaquetado para WHIRL nativo en Windows HIP, encaja en entornos sin GPU NVIDIA dedicada donde se busca inferencia local de un MoE de nomenclatura 35B-A3B.
- Evaluación comparativa de motores de inferencia: sirve como artefacto de referencia para medir el efecto de kernels MXFP4, MTP y prefix caching frente a backends ROCm en el mismo hardware.
- Atención al cliente o asistentes multi-turno en inglés y chino: su soporte bilingüe y el perfil de respuesta concisa permiten conversaciones directas, aunque la ventana de contexto no está documentada y debe validarse antes de producción.

## Benchmarks y rendimiento

Carga de trabajo: tarea agéntica real de VS Code Copilot ("Understand JS File Test / Create HTML Demo"), con 61.000 tokens de prefill y 9.000 tokens de generación, medidas como medias end-to-end sobre toda la ventana.

| Motor y backend | Modelo / cuantización | Prefill (contexto 61k) | Generación (9k tokens) | Aceleración prefill | Aceleración generación |
|---|---|---|---|---|---|
| LM Studio (ROCm v2.70.0) | Nail-Qwen3.6-35B-A3B (sin MTP) | 868 t/s | 22 t/s | 1,00× | 1,00× |
| LM Studio (ROCm v2.70.0) | Nail-Qwen3.6-35B-A3B-MTP | 645 t/s | 49 t/s | 0,74× | 2,23× |
| WHIRL (Windows HIP nativo) | Nail-Qwen3.6-35B-A3B-MTP-MXFP4-F32 | 1.387 t/s | 68 t/s | 1,60× (2,15× frente a MTP) | 3,09× (1,39× frente a MTP) |

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- Hardware de referencia del autor: AMD Strix Halo, Ryzen AI MAX+ 395 con Radeon 8060S; GPUs RDNA 4 en general.
- Tamaño del repositorio: 21,2 GB, lo que orienta los requisitos de memoria para el conjunto de pesos MXFP4 más el proyector de visión F16.
- VRAM estimada para inferencia: no disponible de forma explícita; el tamaño del repo sugiere un presupuesto de memoria en el rango de decenas de GB, a validar en el hardware objetivo.
- GPU recomendadas: Radeon 8060S (Strix Halo) y GPUs RDNA 4 según el autor; compatibilidad con A100, H100 o RTX 4090 no está documentada para este artefacto.
- Cabe en GPU de consumo: no confirmado; el diseño apunta a GPUs integradas AMD de gama alta y RDNA 4, no a GPUs de consumo NVIDIA.
- Opciones de despliegue: WHIRL (Windows HIP nativo) es el motor objetivo; LM Studio con ROCm se documenta como referencia comparativa. Compatibilidad con vLLM, llama.cpp, Ollama o TGI no está documentada.
- Latencia y throughput: 1.387 t/s de prefill y 68 t/s de generación en la carga de 61k/9k descrita, sobre Ryzen AI MAX+ 395 / Radeon 8060S con WHIRL.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento documentado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Nail-Qwen3.6-35B-A3B-MTP-MXFP4-F32 (esta ficha) | 446.571.248 según safetensors; nomenclatura 35B-A3B | no disponible | Prefill 1.387 t/s y generación 68 t/s en Strix Halo con WHIRL | apache-2.0 | GGUF MXFP4-F32, 0 descargas |
| Nail-Qwen3.6-35B-A3B-MTP (peculiar-ragdoll) | 35B-A3B según nomenclatura | no disponible | Prefill 645 t/s y generación 49 t/s en LM Studio ROCm | no disponible en la información proporcionada | GGUF MTP |
| Nail-Qwen3.6-35B-A3B (sin MTP, vía LM Studio) | 35B-A3B según nomenclatura | no disponible | Prefill 868 t/s y generación 22 t/s en LM Studio ROCm | no disponible en la información proporcionada | GGUF |
| Qwen/Qwen3.6-35B-A3B (base) | 35B-A3B según nomenclatura | no disponible | no disponible | apache-2.0 | Pesos originales en Hugging Face |

La comparativa se limita a variantes del mismo linaje; no se dispone de datos de rendimiento de modelos de otras familias en la información proporcionada.

## Limitaciones y advertencias

- Artefacto específico de motor y hardware: optimizado para WHIRL en Windows HIP y GPUs AMD RDNA; el rendimiento fuera de ese entorno no está garantizado.
- Discrepancia de parámetros: el dato de safetensors (446.571.248) no concuerda con la nomenclatura 35B-A3B; debe verificarse antes de planificar memoria.
- Compatibilidad numérica: los tensores no cuantizados se almacenan en F32 en lugar de BF16 por compatibilidad con WHIRL 0.2.5.1; el soporte BF16 base se anuncia para futuras versiones, no para la actual.
- Bucles de razonamiento: el autor advierte sobre bucles de thinking en Qwen 3.6 y recomienda desactivar el modo thinking externo por defecto.
- Sensibilidad a samplers: el autor indica que valores por defecto de IDE como temperature 0.1 provocan bucles; el perfil recomendado debe aplicarse vía middleware.
- Parser JSON estricto: las llamadas a herramientas de contexto largo requieren el middleware para mantener válidos los argumentos JSON truncados.
- Idiomas: solo inglés y chino declarados; el rendimiento en castellano no está documentado.
- Ventana de contexto: no disponible, lo que impide garantizar cargas de contexto largo más allá de los 61.000 tokens medidos.
- Madurez y adopción: 0 descargas y 0 likes en el momento de la consulta, creado el 2026-11-15; ecosistema y soporte comunitario mínimos.
- Sesgos y alucinación: no se han publicado evaluaciones de sesgos ni tasas de alucinación en la información disponible.
- Licencia: apache-2.0 permite uso comercial, pero deben respetarse las condiciones de los artefactos upstream (fine-tune Nail, GGUF de unsloth y modelo base Qwen), cuyos términos no se detallan aquí.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Software-Vantage/Nail-Qwen3.6-35B-A3B-MTP-MXFP4-F32
- Fine-tune Nail (modelo base de la cuantización): https://huggingface.co/peculiar-ragdoll/Nail-Qwen3.6-35B-A3B-GGUF-MTP
- GGUF MTP upstream de unsloth: https://huggingface.co/unsloth/Qwen3.6-35B-A3B-MTP-GGUF
- Modelo base Qwen: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Motor de inferencia WHIRL: https://github.com/tsaipifong/whirl-llm
- Middleware LiteLLM del repositorio: https://huggingface.co/jmalherbexvi/Nail-Qwen3.6-35B-A3B-MTP-MXFP4-F32/blob/main/nail_middleware.py
- LiteLLM (repositorio): https://github.com/BerriAI/litellm
- LiteLLM en PyPI: https://pypi.org/project/litellm/
- Documentación de LiteLLM: https://docs.litellm.ai/docs/
- Software Vantage: https://www.softwarevantage.com
