# abacusai/Gemma-4-12B-Uncensored

## Resumen

Gemma-4-12B-Uncensored es un ajuste fino de eliminación de rechazos (refusal removal) sobre google/gemma-4-12B-it, desarrollado por Abacus.AI. El modelo parte de una arquitectura transformer decoder-only densa de 11.959.730.224 parámetros (11,95B) con un contexto de 262.144 tokens y una arquitectura multimodal unificada sin encoder (`Gemma4UnifiedForConditionalGeneration`) que acepta texto, imagen, audio y vídeo como entrada y produce texto como salida. El objetivo declarado es reducir la tasa de rechazos ante peticiones dañinas y también ante peticiones legítimas que el modelo base rechazaba en exceso.

El entrenamiento se basa en Direct Preference Optimization (DPO) con LoRA y un anclaje NLL (RPO), fusionado como delta completo únicamente en las proyecciones de atención y MLP del modelo de lenguaje; las rutas de imagen y audio permanecen idénticas al modelo base. Según la model card, el modelo base rechaza el 95,4% de un conjunto retenido de peticiones dañinas con thinking desactivado y el 91,7% con thinking activado; este ajuste reduce esas cifras al 12,9% y 4,1% respectivamente, y baja los rechazos en OR-Bench-hard del 45,4% al 3,9%.

La relevancia actual radica en que documenta de forma explícita el coste de la eliminación de rechazos: con thinking desactivado pierde 6 puntos en MMLU-Pro y 7,5 puntos en MMMU-Pro, y con thinking activado pierde 4,4 puntos en GPQA Diamond, mientras que IFEval, IFBench, MATH-500 y el reconocimiento de voz se mantienen a la par. Los pesos cargan exactamente igual que la versión oficial, con el mismo interruptor de thinking y el mismo contexto de 262.144 tokens.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso, multimodal unificado sin encoder (`Gemma4UnifiedForConditionalGeneration`) |
| Parametros totales | 11.959.730.224 (11,95B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | No disponible en la model card principal; existen builds GGUF en abacusai/Gemma-4-12B-Uncensored-GGUF para llama.cpp, Ollama y LM Studio |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 (con license_link a la licencia de Gemma 4 de Google) |
| Formato de pesos | safetensors (transformers); GGUF en repositorio separado |
| Capas | 48 (40 sliding-window + 8 global, intercalado 5:1) |
| Mecanismo de atencion | Sliding-window local de 1.024 tokens (GQA 16 cabezas / 8 KV) y atencion global con una sola cabeza KV compartida y RoPE proporcional |
| Dimension oculta | 3840 (MLP 15360) |
| Tamano de vocabulario | 262.144 |
| Precision | bfloat16 |
| Modalidad | Texto, imagen, audio y video de entrada; texto de salida |
| Modelo base | google/gemma-4-12B-it (revision 707f0a3b, 2026-07-20) |
| Metodo de adaptacion | LoRA DPO con anclaje NLL (RPO), fusionado como delta completo en atencion y MLP del LM |
| Tamano del repositorio | 24,0 GB |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only denso de 48 capas con una intercalación 5:1 entre atención local de ventana deslizante (1.024 tokens, GQA con 16 cabezas de consulta y 8 de clave-valor) y atención global con una única cabeza KV compartida y RoPE proporcional. La dimensión oculta es 3840 y la del MLP 15360, con un vocabulario de 262.144 tokens. La arquitectura es multimodal unificada sin encoder: las rutas de imagen y audio son byte-idénticas al modelo base, y el ajuste solo modifica las proyecciones de atención y MLP del modelo de lenguaje.

El entrenamiento consistió en DPO con LoRA y un anclaje de verosimilitud negativa (RPO), fusionado posteriormente como delta completo. Un modelo profesor generó respuestas que se usaron para construir pares de preferencia; estos se filtraron mediante un juez LLM y se emplearon para ajustar el modelo base. El profesor no se incluye en la release y el contenido del dataset no se divulga. No se especifica el número de tokens de entrenamiento ni la composición del dataset.

## Capacidades

- Generación de texto con razonamiento en dos modos: thinking activado y desactivado, conmutables como en el modelo base.
- Procesamiento de imagen, audio y vídeo como entrada, con salida de texto (pipeline any-to-any).
- Reconocimiento de voz, que según la model card se mantiene a la par del modelo base en ambos modos de thinking.
- Razonamiento matemático: MATH-500 se mantiene a la par del modelo base.
- Seguimiento de instrucciones: IFEval e IFBench se mantienen a la par del modelo base.
- Contexto largo de 262.144 tokens para conversaciones multi-turno y documentos extensos.
- Respuesta a peticiones dañinas con una tasa de rechazo del 12,9% (thinking off) y 4,1% (thinking on) en el conjunto retenido de HarmBench standard y JailbreakBench.
- Reducción de sobre-rechazo en peticiones legítimas: OR-Bench-hard baja del 45,4% al 3,9% de rechazos.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.

## Casos de uso

- Investigación sobre alineación y seguridad: el modelo permite estudiar empíricamente el equilibrio entre eliminación de rechazos y degradación de capacidades, con cifras documentadas de coste en MMLU-Pro, MMMU-Pro y GPQA Diamond.
- Evaluación de robustez de jueces LLM: la model card reporta discrepancias entre un juez LLM (gpt-oss-120b) y un filtro por palabras clave (7,1% frente a 12,9% en el conjunto dañino agrupado), lo que lo convierte en un caso de estudio para calibrar evaluadores automáticos.
- Procesamiento de documentos largos multimodales: con 262.144 tokens de contexto y entrada de imagen y vídeo, puede emplearse para extraer y resumir información de expedientes, informes escaneados o grabaciones.
- Transcripción y análisis de audio: la ruta de audio permanece idéntica al modelo base y el reconocimiento de voz se mantiene a la par, lo que permite usarlo en pipelines de transcripción con análisis posterior.
- Generación de texto creativo sin rechazos excesivos: útil en entornos controlados donde el sobre-rechazo del modelo base interfiere con ficción, guiones o contenido sensible legítimo.
- Evaluación comparativa de modelos base frente a ajustes DPO: sirve como referencia para medir el impacto de DPO con anclaje NLL en tareas de instrucción, matemáticas y multimodalidad.
- Despliegue local en cuantización GGUF: los builds para llama.cpp, Ollama y LM Studio permiten ejecutar el modelo en hardware de consumo para prototipos y pruebas.

## Benchmarks y rendimiento

Los datos proceden de la model card y son ejecuciones propias del autor con la misma build de vLLM, temperatura 1.0 y top_p 0.95, en ambos modos de thinking. El juez es gpt-oss-120b con esfuerzo de razonamiento medio.

| Benchmark | Base (thinking off) | Modelo (thinking off) | Base (thinking on) | Modelo (thinking on) |
|---|---|---|---|---|
| HarmBench standard + JailbreakBench (241 prompts, tasa de rechazo) | 95,4% (230/241) | 12,9% (31/241) | 91,7% (221/241) | 4,1% (10/241) |
| OR-Bench-hard (1.319 prompts, tasa de rechazo) | 45,4% | 3,9% | No disponible | No disponible |
| XSTest unsafe (200 prompts, tasa de rechazo) | No disponible | 33,5% | No disponible | No disponible |
| MMLU-Pro | Referencia | -6 puntos | Referencia | No disponible |
| MMMU-Pro | Referencia | -7,5 puntos | Referencia | No disponible |
| GPQA Diamond | No disponible | No disponible | Referencia | -4,4 puntos |
| IFEval | Referencia | A la par | Referencia | A la par |
| IFBench | Referencia | A la par | Referencia | A la par |
| MATH-500 | Referencia | A la par | Referencia | A la par |
| Reconocimiento de voz | Referencia | A la par | Referencia | A la par |

No se publican valores absolutos de MMLU-Pro, MMMU-Pro, GPQA Diamond, IFEval, IFBench ni MATH-500, solo las diferencias respecto al modelo base. El filtro por palabras clave sobre las mismas respuestas arroja un 7,1% y un 0,4% de rechazo en el conjunto dañino agrupado para este modelo.

## Requisitos de hardware

- VRAM estimada en bfloat16: aproximadamente 24 GB solo para los pesos (11,95B parámetros), más overhead de activaciones y caché KV; se recomienda al menos 40-48 GB para inferencia cómoda con contexto largo.
- El contexto de 262.144 tokens con atención global y ventana deslizante de 1.024 implica una caché KV considerable; para contextos completos se necesita hardware de clase servidor.
- GPU recomendadas: A100 80 GB, H100 80 GB o varias GPU con tensor parallelism para contexto completo en bf16.
- GPU de consumo: los builds GGUF de abacusai/Gemma-4-12B-Uncensored-GGUF permiten cuantizaciones que probablemente caben en RTX 4090 (24 GB) y, con cuantizaciones más agresivas, en GPUs de 16 GB; el dato concreto de VRAM por cuantización no está disponible en la información proporcionada.
- Opciones de despliegue: vLLM (usado por el autor para las evaluaciones), transformers, llama.cpp, Ollama y LM Studio mediante los builds GGUF.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Gemma-4-12B-Uncensored (este modelo) | 11,95B | 262.144 | Apache 2.0 | Ajuste DPO de eliminación de rechazos; multimodal texto/imagen/audio/vídeo; thinking conmutable |
| google/gemma-4-12B-it | 11,95B | 262.144 | Apache 2.0 | Modelo base oficial; rechaza el 95,4% del conjunto dañino con thinking off y el 45,4% de OR-Bench-hard |
| Alternativas de la misma categoría | No disponible | No disponible | No disponible | No se dispone de datos de otros ajustes de eliminación de rechazos comparables en la información proporcionada |

## Limitaciones y advertencias

- El modelo elimina deliberadamente los rechazos ante peticiones dañinas: responde al 87,1% de HarmBench standard y JailbreakBench con thinking off y al 95,9% con thinking on. No es apto para despliegues públicos sin filtros externos.
- Persiste un rechazo residual del 33,5% en XSTest unsafe con thinking off, el único conjunto dañino donde queda una tasa apreciable.
- Coste medido en capacidades: -6 puntos en MMLU-Pro y -7,5 en MMMU-Pro con thinking off; -4,4 puntos en GPQA Diamond con thinking on. IFEval, IFBench, MATH-500 y reconocimiento de voz se mantienen a la par.
- Riesgo de alucinación: no cuantificado en la información proporcionada; aplican los riesgos habituales de un modelo de 12B.
- Sesgos conocidos: no documentados en la información proporcionada.
- Idiomas soportados: no disponibles; el modelo base es multilingüe, pero no se detalla la cobertura.
- La licencia declarada es Apache 2.0, pero el enlace de licencia apunta a la licencia de Gemma 4 de Google; conviene verificar los términos aplicables antes de uso comercial.
- El dataset de entrenamiento y el modelo profesor no se divulgan, lo que limita la reproducibilidad y la auditoría del ajuste.
- El ajuste solo modifica atención y MLP del modelo de lenguaje; las rutas de imagen y audio son idénticas al base, por lo que los sesgos multimodales del base persisten.
- La model card no reporta tool calling ni capacidades de agente; no deben asumirse.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/abacusai/Gemma-4-12B-Uncensored
- Builds GGUF: https://huggingface.co/abacusai/Gemma-4-12B-Uncensored-GGUF
- Modelo base: https://huggingface.co/google/gemma-4-12B-it
- Licencia de Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- Página de Abacus.AI: https://abacus.ai
- Perfil de Abacus.AI en Hugging Face: https://huggingface.co/abacusai
- Paper referenciado (arxiv:2402.13228): https://arxiv.org/abs/2402.13228
- Paper referenciado (arxiv:2607.02770): https://arxiv.org/abs/2607.02770
