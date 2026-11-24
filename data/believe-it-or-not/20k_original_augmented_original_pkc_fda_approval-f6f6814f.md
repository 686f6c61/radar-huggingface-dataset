# believe-it-or-not/20k_original_augmented_original_pkc_fda_approval-f6f6814f

## Resumen

El modelo `believe-it-or-not/20k_original_augmented_original_pkc_fda_approval-f6f6814f` es un adaptador PEFT (LoRA) publicado en Hugging Face por el usuario `believe-it-or-not`. Se trata de un ajuste fino sobre el modelo base `togethercomputer/Meta-Llama-3.3-70B-Instruct-Reference`, por lo que hereda la arquitectura y las capacidades del Llama 3.3 70B Instruct de Meta. El repositorio contiene únicamente los pesos del adaptador (1,7 GB), no el modelo completo, y debe cargarse junto con el modelo base mediante la librería `peft`.

El nombre del repositorio sugiere un conjunto de datos de ajuste fino orientado a un dominio concreto (aparentemente relacionado con aprobaciones de la FDA y un corpus de 20 000 ejemplos "original augmented original pkc"), aunque la model card no documenta ni el dataset, ni el procedimiento, ni los hiperparámetros empleados. La información disponible es muy limitada: la model card es la plantilla por defecto de Hugging Face sin rellenar, con todos los campos marcados como "[More Information Needed]".

Por tanto, esta ficha describe principalmente las características heredadas del modelo base (Llama 3.3 70B Instruct) y advierte explícitamente de que cualquier dato específico del adaptador (licencia, idiomas, evaluación, datos de entrenamiento) no está disponible. El modelo tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica que es un artefacto de investigación o experimental sin validación comunitaria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Llama 3.3 70B Instruct); el repositorio contiene un adaptador PEFT/LoRA |
| Parametros totales | 70 000 millones (modelo base); el adaptador LoRA no especifica su rango ni número de parámetros entrenables |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | 128 000 tokens (heredada del modelo base Llama 3.3 70B Instruct) |
| Tipos de cuantizacion | no disponible en el repositorio del adaptador; el modelo base admite cuantizaciones estándar (FP8, INT8, INT4, GGUF) mediante herramientas externas |
| Idiomas soportados | no disponible para el adaptador; el modelo base soporta oficialmente inglés, alemán, francés, italiano, portugués, hindi, español y tailandés |
| Licencia | no disponible (la model card no la declara; el modelo base Llama 3.3 se distribuye bajo Llama 3.3 Community License) |
| Formato de pesos | safetensors (adaptador PEFT); requiere el modelo base en safetensors para su uso |
| Libreria | peft 0.15.1 |
| Tamano del repositorio | 1,7 GB |
| Modelo base | togethercomputer/Meta-Llama-3.3-70B-Instruct-Reference |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Llama 3.3 70B Instruct, un transformer decoder-only denso de 70 000 millones de parámetros con atención por grupos (GQA), RoPE y una ventana de contexto de 128 000 tokens. El modelo base fue entrenado por Meta con aproximadamente 15 billones de tokens y posteriormente alineado mediante ajuste supervisado, rechazo de muestras y DPO (Direct Preference Optimization). Incorpora además un modo de razonamiento ligero que se activa con la instrucción "think step by step" en el prompt de sistema.

Sobre el adaptador en sí no hay información: la model card no documenta el rango del LoRA, el número de pasos, la tasa de aprendizaje, la composición del dataset ni si se aplicó RLHF o DPO adicional. El nombre del repositorio sugiere un ajuste fino supervisado sobre un corpus de 20 000 ejemplos relacionados con aprobaciones de la FDA, pero no se aporta ninguna evidencia ni descripción. Tampoco se indica la herramienta de entrenamiento (TRL, Axolotl, Unsloth, etc.) ni la precisión utilizada (bf16, fp16, etc.). La única referencia técnica es la versión de PEFT (0.15.1) empleada para el guardado.

## Capacidades

- Generación de texto y razonamiento multi-turno, heredados del modelo base Llama 3.3 70B Instruct.
- Generación de código en múltiples lenguajes, con soporte para tareas de depuración y refactorización.
- Razonamiento matemático y resolución de problemas de varios pasos.
- Soporte de tool calling y function calling (capacidad del modelo base, no verificada en el adaptador).
- Capacidad de agentes y razonamiento multi-paso (heredada del modelo base).
- Multilingüismo limitado a los idiomas oficiales de Llama 3.3 (inglés, alemán, francés, italiano, portugués, hindi, español y tailandés).
- Modo de razonamiento activable mediante prompt ("think step by step").
- No se ha verificado ninguna capacidad específica adicional aportada por el adaptador (dominio FDA, corpus PKC, etc.) porque no hay documentación ni evaluación publicada.

## Casos de uso

- Ajuste experimental sobre dominio regulatorio: el adaptador podría emplearse para generar borradores de documentación relacionada con aprobaciones de la FDA, aunque no hay evaluación que respalde su calidad en esta tarea.
- Investigación sobre fine-tuning con LoRA: sirve como ejemplo reproducible de adaptador PEFT sobre Llama 3.3 70B para estudiar el efecto del ajuste fino en dominios especializados.
- Reproducción de experimentos: permite a un equipo reproducir el pipeline de ajuste si dispone del dataset original (no publicado) y del modelo base.
- Evaluación comparativa de adaptadores: puede usarse como línea base en estudios que comparen distintos LoRA sobre el mismo modelo base.
- Generación asistida en entornos con requisitos de trazabilidad: si el dominio es regulatorio, el adaptador podría integrarse en flujos de revisión humana con verificación posterior obligatoria.
- Prototipado interno: dado su escaso soporte comunitario (0 descargas), solo es recomendable en entornos de experimentación controlados, nunca en producción sin evaluación previa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye ninguna sección de evaluación rellenada y no se han encontrado métricas (MMLU, HumanEval, GSM8K, etc.) en el repositorio ni en la información proporcionada.

## Requisitos de hardware

- El adaptador LoRA en sí ocupa 1,7 GB, pero requiere cargar el modelo base Llama 3.3 70B Instruct completo para la inferencia.
- VRAM estimada para el modelo base en BF16/FP16: aproximadamente 140 GB, lo que exige múltiples GPU (por ejemplo, 2× H100 80 GB o 4× A100 40 GB con tensor parallelism).
- VRAM estimada en cuantización INT8: aproximadamente 70 GB (cabe en una H100 80 GB o en 2× A100 40 GB).
- VRAM estimada en cuantización INT4/GGUF Q4: aproximadamente 40 GB (cabe en 2× RTX 4090 24 GB o en una A100 40 GB).
- No cabe en una única GPU de consumo (RTX 4090 24 GB) en precisión completa; solo en cuantizaciones agresivas con offloading a CPU/RAM.
- Opciones de despliegue: vLLM, TGI, llama.cpp (para versiones GGUF del modelo base fusionado), Ollama (si se genera un GGUF), así como `peft` + `transformers` para cargar el adaptador sobre el modelo base.
- Latencia y throughput: no disponibles para el adaptador; dependen del hardware y del backend elegido para el modelo base.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| believe-it-or-not/20k_original_augmented_original_pkc_fda_approval-f6f6814f | 70B (base) + LoRA | 128k (base) | no disponible | Hugging Face (0 descargas) | Adaptador sin documentar ni evaluar |
| meta-llama/Llama-3.3-70B-Instruct | 70B | 128k | Llama 3.3 Community License | Hugging Face, ampliamente usado | Modelo base oficial, con evaluación publicada |
| Qwen2.5-72B-Instruct | 72B | 128k | Apache 2.0 (según variante) | Hugging Face | Alternativa abierta con licencia permisiva |
| Mistral-Large-Instruct | ~123B | 128k | Mistral Research License | API y pesos | Mayor tamaño, licencia restrictiva |

## Limitaciones y advertencias

- La model card está completamente sin rellenar: no hay información sobre datos de entrenamiento, hiperparámetros, evaluación ni uso previsto.
- No se declara licencia para el adaptador; el uso comercial queda sujeto a la licencia del modelo base (Llama 3.3 Community License) y a la ausencia de una licencia explícita del adaptador, lo que genera incertidumbre legal.
- No se han publicado evaluaciones de sesgo, alucinación ni robustez para este adaptador concreto.
- El adaptador hereda los sesgos y riesgos del modelo base Llama 3.3 70B Instruct, incluidos sesgos de género, raza y geográficos documentados por Meta.
- Riesgo elevado de alucinación en dominios especializados (como el regulatorio/FDA) si el ajuste fino no se ha validado; no hay evidencia de lo contrario.
- El nombre del repositorio sugiere un dominio muy específico, pero no hay documentación que confirme el alcance real del ajuste.
- Sin descargas ni likes: no hay validación comunitaria ni reportes de uso en producción.
- El adaptador no incluye los pesos del modelo base; es necesario descargar por separado Llama 3.3 70B Instruct, lo que implica requisitos de hardware considerables.
- No se especifican los idiomas efectivamente cubiertos por el ajuste fino; el multilingüismo es el del modelo base, no necesariamente el del adaptador.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/believe-it-or-not/20k_original_augmented_original_pkc_fda_approval-f6f6814f
- Modelo base: https://huggingface.co/togethercomputer/Meta-Llama-3.3-70B-Instruct-Reference
- Modelo oficial de Meta: https://huggingface.co/meta-llama/Llama-3.3-70B-Instruct
- Librería PEFT: https://github.com/huggingface/peft
- Paper de referencia sobre impacto ambiental (citado en la model card): https://arxiv.org/abs/1910.09700
- Calculadora de impacto ambiental: https://mlco2.github.io/impact
