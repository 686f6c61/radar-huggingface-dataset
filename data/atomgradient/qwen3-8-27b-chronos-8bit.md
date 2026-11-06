# AtomGradient/Qwen3.8-27B-Chronos-8bit

## Resumen

AtomGradient/Qwen3.8-27B-Chronos-8bit es una variante cuantizada a 8 bits del backbone "Chronos V9" de AtomGradient, construida sobre la arquitectura Qwen 3.5 (tag `qwen3_5`) y distribuida en formato MLX para ejecución en hardware Apple Silicon. Con 27.356.728.560 parámetros reales (verificados en los safetensors) y un repositorio de 29,5 GB, se presenta como un modelo de generación de texto orientado a despliegue en el borde ("edge-ai") y a aprendizaje continuo.

La propuesta diferencial del autor no es tanto el rendimiento bruto como el acoplamiento criptográfico con un runtime propietario, el "EdgeStudio Chronos V9 Continual Learning Runtime" (módulos M1-M7). La model card describe varias técnicas de "co-lock" (bloqueo ortogonal por bloques, destilación de un kernel puente SwiGLU-LoRA, bloqueo de fase RoPE y una permutación de salida en las últimas cuatro capas que requiere un kernel de desbloqueo del runtime `libchronos_v9_core`). Esto implica que parte de la funcionalidad declarada depende de software externo no incluido en el repositorio.

Es relevante ahora porque combina tres tendencias activas: cuantización de 8 bits para inferencia local, memorias persistentes de aprendizaje continuo en dispositivo y un enfoque de "soberanía" de datos (ablación selectiva de PII, cifrado). No obstante, el modelo no cuenta con descargas ni valoraciones en el momento de la ficha, y la mayoría de las afirmaciones técnicas de la model card no vienen acompañadas de benchmarks verificables.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer basada en Qwen 3.5 (tag `qwen3_5`), con capas de atención completa (FA) y mecanismos GDN/StreamKV descritos en la model card |
| Parametros totales | 27.356.728.560 |
| Parametros activos | no disponible (no se declara como MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8 bits (variante `-8bit`); no se detallan otros formatos |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería `mlx`) |
| Dimension de representacion declarada | `d_raw=5120` |
| Tamano del repositorio | 29,5 GB |

## Arquitectura y entrenamiento

La model card identifica el backbone como Qwen 3.5 de 27B, cuantizado a 8 bits y empaquetado para MLX. Sobre esa base, AtomGradient aplica una serie de transformaciones que describe como "co-lock" criptográfico: ablación ortogonal dirigida de PII mediante Gram-Schmidt (`ULTRA-P1-3`), bloqueo ortogonal alineado por bloques en la capa ancla SAE-JEPA (`ULTRA-P2-1`), un kernel puente no lineal SwiGLU-LoRA destilado (`ULTRA-P2-2`) que rompe la isomorfía lineal por capas frente a ataques de Procrustes ortogonal, y un bloqueo de fase RoPE junto con canales de caché GDN + FA (`ULTRA-P2-3`). La última modificación declarada es una perturbación de bajo rango y permutación de salida en las cuatro últimas capas de atención completa (`ULTRA-P2-4`), que según el autor exige el kernel de desbloqueo del runtime para la lectura de memoria continua multi-slot.

No se proporcionan datos sobre el número de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF, DPO o ajuste por preferencias. Tampoco se documenta el proceso de destilación del kernel SwiGLU-LoRA más allá de su nombre. Las innovaciones declaradas (ablación de PII, bloqueo ortogonal, protección de memoria continua) son afirmaciones del autor sin validación externa publicada en la información disponible.

## Capacidades

- Generación de texto y conversación multi-turno (pipeline `text-generation`, tag `conversational`).
- Tool calling / function calling: la model card afirma preservar "100% tool-calling JSON schema accuracy" tras la ablación de PII, aunque no se aportan evidencias.
- Aprendizaje continuo y memorias persistentes en dispositivo, mediante los mecanismos `ArraysCache` y `StreamKV` descritos, sujetos al runtime Chronos V9.
- Ablación selectiva de PII en memorias locales del propietario, preservando límites de seguridad públicos según el autor.
- Ejecución en el borde ("edge-ai") gracias a la cuantización de 8 bits y al formato MLX.
- Capacidades multilingües: no disponible.
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Asistente personal en dispositivo con memoria persistente: el modelo está diseñado para sintetizar memoria continua (`StreamKV`) en hardware local, lo que permitiría mantener contexto del usuario entre sesiones sin enviar datos a la nube, siempre que se despliegue con el runtime Chronos V9.
- Automatización de agentes con tool calling en local: la preservación declarada del esquema JSON de llamadas a herramientas lo hace candidato para orquestar APIs internas en estaciones de trabajo Apple Silicon, aunque la precisión real debe validarse.
- Procesamiento de documentos con datos personales: la ablación ortogonal de PII declarada apunta a escenarios donde se quiere evitar que el modelo reproduzca información sensible del propietario en respuestas, reduciendo falsos positivos de rechazo en memorias legítimas.
- Despliegue en flujos de trabajo de investigación sobre aprendizaje continuo: sirve como banco de pruebas para evaluar técnicas de co-lock ortogonal y destilación de kernels puente en un backbone de 27B cuantizado.
- Prototipado de asistentes conversacionales en macOS: al usar MLX y safetensors, se integra en el ecosistema de inferencia de Apple sin necesidad de GPUs dedicadas.
- Evaluación de seguridad y privacidad: útil para estudiar cómo interactúan las transformaciones ortogonales con la cuantización de 8 bits y con ataques de inversión de representaciones (Procrustes), según las propias afirmaciones del autor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/unified memory estimada: con 27,36B parámetros en 8 bits, el peso ronda los 27-28 GB, más overhead de caché KV y runtime; se recomienda al menos 32 GB de memoria unificada y preferiblemente 48-64 GB para contexto largo.
- GPU recomendadas: el formato MLX está pensado para Apple Silicon (series M1/M2/M3/M4 Pro, Max y Ultra). Para GPUs NVIDIA no se ofrece formato GGUF ni safetensors estándar en la información disponible.
- ¿Cabe en GPU consumer? En Apple Silicon con 32 GB o más es viable; en GPUs NVIDIA consumer (RTX 4090 con 24 GB) no cabría en 8 bits sin offloading.
- Opciones de despliegue: MLX (librería declarada); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI. La funcionalidad de memoria continua requiere el runtime propietario `libchronos_v9_core`.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| AtomGradient/Qwen3.8-27B-Chronos-8bit | 27,36B | no disponible | Apache 2.0 | safetensors (MLX) | Requiere runtime propietario para memoria continua |
| Qwen 3.5 27B (base) | ~27B | no disponible en esta ficha | Apache 2.0 (según familia Qwen) | safetensors, GGUF | Sin las transformaciones de AtomGradient; ecosistema amplio |
| Gemma 3 27B | 27B | 128K (según ficha oficial) | Gemma license | safetensors, GGUF | Multilingüe, visión; licencia no Apache |
| Mistral Small 3 (24B) | 24B | 32K-128K (según variante) | Apache 2.0 | safetensors, GGUF | Alternativa Apache de tamaño similar con amplio soporte de inferencia |

La comparación con los modelos base es aproximada: no hay datos de benchmarks del Chronos V9 que permitan contrastar rendimiento real frente a estas alternativas.

## Limitaciones y advertencias

- La model card contiene afirmaciones técnicas no verificadas (100% de precisión en esquema JSON, "zero-quantization-loss", resistencia a ataques de Procrustes) sin benchmarks ni validación independiente.
- El modelo tiene 0 descargas y 0 likes en el momento de la ficha; no hay evidencia de uso en producción ni de auditoría externa.
- Dependencia de un runtime propietario (`libchronos_v9_core`, EdgeStudio Chronos V9) para las funcionalidades de memoria continua y lectura multi-slot; sin él, el comportamiento puede degradarse o no ser el documentado.
- Idiomas soportados no declarados: no se puede garantizar calidad multilingüe.
- Longitud de contexto no disponible: riesgo de truncamiento en conversaciones largas o en tareas de recuperación de contexto.
- Riesgo de alucinación no cuantificado; al ser un modelo de 27B cuantizado a 8 bits, puede presentar degradación frente a la versión en precisión completa.
- La ablación de PII es una afirmación del autor; no hay garantía de que elimine toda información sensible ni de que no introduzca sesgos por la proyección ortogonal.
- Licencia Apache 2.0 permite uso comercial del modelo, pero el runtime asociado puede tener condiciones distintas no especificadas en el repositorio.
- Formato MLX limita el despliegue a hardware Apple; no hay pesos GGUF ni safetensors estándar para GPUs NVIDIA en la información disponible.

## Enlaces

- Hugging Face: https://huggingface.co/AtomGradient/Qwen3.8-27B-Chronos-8bit
- Repositorio del autor en Hugging Face: https://huggingface.co/AtomGradient
- Runtime EdgeStudio Chronos V9: no disponible en la información proporcionada
- Paper o blog técnico: no disponible en la información proporcionada
- Demo: no disponible en la información proporcionada
