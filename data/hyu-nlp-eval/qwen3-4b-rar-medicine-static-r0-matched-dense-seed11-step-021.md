# HYU-NLP-EVAL/qwen3-4b-rar-medicine-static-r0-matched-dense-seed11-step-021

## Resumen

El modelo `HYU-NLP-EVAL/qwen3-4b-rar-medicine-static-r0-matched-dense-seed11-step-021` es un checkpoint intermedio de investigación publicado por el usuario HYU-NLP-EVAL. Se trata de un ajuste fino del modelo base Qwen/Qwen3-4B-Instruct-2507, un transformer denso decoder-only de 4.022.468.096 parámetros, entrenado sobre el conjunto de datos RaR-Medicine con el método GRPO y un esquema de recompensa basado en rúbricas estáticas ("static-rubric"). El sufijo "matched-dense" indica que forma parte de una familia de ejecuciones comparables (variantes densas y presumiblemente MoE) del mismo pipeline experimental.

El checkpoint corresponde al paso 21 de la ejecución `phase1-static-r0-medicine-qwen3-4b-matched-dense-20260928-seed11`, con semilla 11. El repositorio contiene pesos en BF16 listos para inferencia con Transformers en la raíz, además de un directorio `original_checkpoint/` con los ficheros nativos de veRL (solo parámetros del modelo). No se documentan en la model card el número de tokens de entrenamiento, la composición del dataset ni los hiperparámetros del ajuste.

Su relevancia es metodológica más que de producto: se trata de un artefacto para estudiar el efecto del ajuste con RL sobre rúbricas en dominio médico y para servir como línea base densa frente a otras variantes de la misma ejecución. La model card lo designa explícitamente como "research use only", y no se han publicado resultados de benchmarks ni validación clínica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso decoder-only (derivado de Qwen3-4B-Instruct-2507) |
| Parametros totales | 4.022.468.096 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens (256K) segun la ficha del modelo base y fuentes de terceros; no verificado en este checkpoint |
| Tipos de cuantizacion | Solo BF16 en el repositorio; no se publican versiones GGUF, AWQ, GPTQ ni FP8 |
| Idiomas soportados | No disponible |
| Licencia | apache-2.0 en los metadatos; la model card indica "research use only" (contradiccion no resuelta) |
| Formato de pesos | safetensors (BF16) + checkpoint original de veRL en `original_checkpoint/` |
| Tamano del repositorio | 25,7 GB |
| Modelo base | Qwen/Qwen3-4B-Instruct-2507 |
| Pipeline | text-generation (conversacional) |
| Libreria | transformers |
| Descargas / likes | 13 / 0 |
| Fecha de creacion | 2026-10-12 |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base Qwen3-4B-Instruct-2507: un transformer denso decoder-only con atención completa y 4.022.468.096 parámetros, sin mezcla de expertos. El checkpoint se ha generado dentro del pipeline de entrenamiento con refuerzo veRL (el repositorio conserva el directorio `original_checkpoint/` con los ficheros nativos de veRL, que contienen únicamente los parámetros del modelo). Según la descripción de terceros recogida en la búsqueda, el entrenamiento emplea GRPO (Group Relative Policy Optimization) con un enfoque de rúbrica estática, y está especializado en el conjunto de datos RaR-Medicine.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset RaR-Medicine, la existencia de fases previas de SFT, ni los hiperparámetros concretos del run. El identificador del run (`phase1-static-r0-medicine-qwen3-4b-matched-dense-20260928-seed11`) sugiere una primera fase ("phase1") con recompensa estática ("static-r0"), semilla 11, y una variante densa emparejada ("matched-dense") dentro de un conjunto de ejecuciones comparables. El número 021 del nombre indica el paso de optimización del checkpoint, y la familia incluye al menos los pasos 000, 004, 008 y 016 publicados por el mismo autor, lo que confirma que se trata de una serie de checkpoints intermedios para análisis de trayectoria de entrenamiento.

## Capacidades

- Generacion de texto conversacional multi-turno, heredada del modelo base Qwen3-4B-Instruct-2507.
- Razonamiento, matematicas y generacion de codigo, segun las capacidades documentadas del modelo base; no verificadas especificamente en este checkpoint.
- Soporte de tool calling / function calling: disponible en el modelo base, no confirmado tras este ajuste.
- Capacidades de agente y razonamiento multi-paso: disponibles en el modelo base, no confirmadas en este checkpoint.
- Capacidades multilingues: el modelo base Qwen3 soporta mas de 100 idiomas, pero este repositorio no declara idiomas soportados ni se ha evaluado el mantenimiento de dicha cobertura tras el ajuste en dominio medico.
- Especializacion declarada en dominio medico (RaR-Medicine), sin especificacion del tipo de tarea (diagnostico, QA clinica, summarization, etc.).
- Modo de razonamiento explicito ("thinking"): el modelo base Qwen3-4B-Instruct-2507 pertenece a la rama Instruct sin modo thinking separado; no hay indicios de que este ajuste lo active.

## Casos de uso

- Investigacion sobre metodos de RL con recompensa por rubrica: el checkpoint permite analizar como evoluciona el comportamiento del modelo entre pasos de optimizacion (000, 004, 008, 016, 021) dentro de una misma ejecucion y semilla.
- Linea base densa en experimentos comparativos: al estar etiquetado como "matched-dense", sirve como referencia frente a variantes MoE o de otro tipo del mismo pipeline, controlando el efecto del tamano y la arquitectura.
- Estudio de ajuste en dominio medico: util para medir si un ajuste con GRPO sobre RaR-Medicine mejora tareas clinicas sinteticas sin degradar capacidades generales del modelo base.
- Analisis de olvido catastrofico: comparar las respuestas de este checkpoint con las de Qwen/Qwen3-4B-Instruct-2507 en tareas generales (codigo, matematicas, multilingue) para cuantificar la perdida de capacidad fuera de dominio.
- Reproducibilidad de experimentos: la presencia del checkpoint nativo de veRL en `original_checkpoint/` permite reanudar o inspeccionar el estado del entrenamiento, util para replicar la ejecucion con la semilla 11.
- Evaluacion de robustez en datos clinicos: someter el modelo a preguntas medicas de conjuntos publicos (por ejemplo, preguntas tipo MedQA) para medir tasas de alucinacion y sesgo en un modelo pequeno ajustado por RL.
- Docencia e investigacion academica: uso como caso de estudio de un pipeline completo de RL con recompensa por rubricas sobre un modelo de 4B, con coste de hardware contenido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de MMLU, HumanEval, GSM8K, MedQA ni de ningun otro conjunto de evaluacion, y las fuentes de terceros consultadas tampoco aportan cifras de rendimiento para este checkpoint.

## Requisitos de hardware

- Peso de los parametros en BF16: aproximadamente 8,0 GB (4.022.468.096 parametros x 2 bytes), coherente con los 8,1 GB de VRAM indicados por fuentes de terceros para la carga base del modelo.
- VRAM adicional para el cache KV: con la ventana de 262.144 tokens anunciada para el modelo base, el consumo puede crecer muy por encima de los pesos; una inferencia a contexto completo exige multiples GPUs o tecnicas de cache KV cuantizado. Para contextos practicos de 8K-32K tokens, una GPU de 16-24 GB es suficiente.
- GPU consumer: cabe en tarjetas de 12 GB o mas para contextos moderados (RTX 3060 12 GB, RTX 4070, RTX 4060 Ti 16 GB, RTX 4080/4090 24 GB). En GPUs de 8 GB requeriria cuantizacion a 8 o 4 bits, no publicada en el repositorio.
- GPU de datacenter: A100 40/80 GB, H100 80 GB y L40S son adecuadas, especialmente para servir con contexto largo o por lotes.
- Opciones de despliegue: Transformers (formato nativo del repositorio), vLLM, TGI (el tag `text-generation-inference` y `endpoints_compatible` aparece en los metadatos) y SGLang. llama.cpp y Ollama requeririan convertir los pesos a GGUF, conversion que el autor no ha publicado.
- Latencia y throughput: no disponible. No se han publicado mediciones de tokens por segundo ni de latencia por peticion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| qwen3-4b-rar-medicine-static-r0-matched-dense-seed11-step-021 | 4,02 B (denso) | 256K (segun modelo base) | apache-2.0 en metadatos; "research use only" en la model card | HuggingFace, solo BF16 | Checkpoint intermedio de investigacion, sin benchmarks |
| Qwen/Qwen3-4B-Instruct-2507 | 4,02 B (denso) | 262.144 tokens | apache-2.0 | HuggingFace, amplia variedad de cuantizaciones y soporte en ecosistema | Modelo base sin ajuste especifico de dominio |
| Qwen3-4B-Thinking-2507 | 4,02 B (denso) | 262.144 tokens | apache-2.0 | HuggingFace | Variante orientada a razonamiento explicito; misma familia y tamano |
| HYU-NLP-EVAL/...matched-seed11-step-021 (variante no densa) | No disponible | No disponible | apache-2.0 | HuggingFace | Hermano experimental del mismo run, con arquitectura distinta |

Las cifras de rendimiento comparado no estan disponibles para ninguno de los modelos de la familia experimental de HYU-NLP-EVAL, por lo que la comparacion se limita a parametros, contexto, licencia y disponibilidad.

## Limitaciones y advertencias

- Modelo de investigacion, no validado clinicamente. La propia model card indica "research use only"; no debe usarse para diagnostico, triaje, recomendacion terapeutica ni ninguna decision que afecte a pacientes.
- Contradiccion de licencia: los metadatos declaran apache-2.0, mientras que la model card restringe el uso a investigacion. Antes de cualquier uso comercial debe aclararse esta discrepancia con el autor.
- Ausencia total de evaluacion publicada: no hay benchmarks, ni evaluacion de sesgos, ni analisis de seguridad, lo que impide conocer su comportamiento real en produccion.
- Riesgo elevado de alucinacion en dominio medico: es un modelo de 4B ajustado con RL sobre un dataset no documentado; los modelos de este tamano tienden a generar afirmaciones clinicas plausibles pero incorrectas.
- Checkpoint intermedio: el paso 21 no es necesariamente el estado final del entrenamiento; puede presentar inestabilidad o capacidades parcialmente desarrolladas.
- Posible olvido catastrofico: el ajuste sobre RaR-Medicine puede haber degradado capacidades generales (codigo, matematicas, idiomas) del modelo base, sin que existan datos que lo confirmen o descarten.
- Idiomas no declarados: se desconoce si el ajuste ha reducido la cobertura multilingue del modelo base.
- Adopcion practicamente nula: 13 descargas y 0 likes en el momento de la consulta, sin comunidad que haya reportado resultados de uso.
- Sin cuantizaciones publicadas: la ausencia de GGUF, AWQ o GPTQ complica el despliegue en hardware de gama baja y en herramientas como Ollama o llama.cpp.
- Trazabilidad limitada del dataset: no se detalla la composicion de RaR-Medicine, su procedencia ni su licencia, lo que impide auditar posibles sesgos de origen.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/HYU-NLP-EVAL/qwen3-4b-rar-medicine-static-r0-matched-dense-seed11-step-021
- Checkpoint hermano, paso 000: https://huggingface.co/HYU-NLP-EVAL/qwen3-4b-rar-medicine-static-r0-matched-dense-seed11-step-000
- Checkpoint hermano, paso 004: https://huggingface.co/HYU-NLP-EVAL/qwen3-4b-rar-medicine-static-r0-matched-dense-seed11-step-004
- Checkpoint hermano, paso 016: https://featherless.ai/models/HYU-NLP-EVAL/qwen3-4b-rar-medicine-static-r0-matched-dense-seed11-step-016
- Variante no densa del mismo paso: https://featherless.ai/models/HYU-NLP-EVAL/qwen3-4b-rar-medicine-static-r0-matched-seed11-step-021
- Ficha en LLM Explorer (paso 008): https://llm-explorer.com/model/HYU-NLP-EVAL%2Fqwen3-4b-rar-medicine-static-r0-matched-dense-seed11-step-008,cMGLnuq6Ni0ObvQjQQgbT
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
