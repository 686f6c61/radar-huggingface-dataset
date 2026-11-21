# Sayansantra/LFM3-1.7B-WSP-V3

## Resumen

LFM3-1.7B-WSP-V3 es una variante del modelo LiquidAI/LFM3-1.7B, desarrollada por el usuario Sayansantra, obtenida mediante una tecnica que el autor denomina Weight-Space Programming (WSP) con Disentangled Neuron Atlas Steering. Se trata de una intervencion sin entrenamiento (training-free), sin pasos de gradiente, que modifica quirurgicamente un 0,9742% de los pesos del modelo base en capas concretas de atencion GQA y de FFN SwiGLU de la mitad y el final de la red. El objetivo declarado es mejorar el razonamiento formal, el codigo y, sobre todo, la precision en tool calling agentico con XML nativo.

El modelo base LFM3-1.7B es un backbone hibrido de 24 capas (13 capas de convolucion corta con compuerta y 11 capas de atencion GQA) con hidden de 2048 y FFN SwiGLU de 7680. Esta variante conserva la misma arquitectura y el mismo tamano (1.728.801.536 parametros), y se distribuye tanto en safetensors bfloat16 como en un GGUF Q4_K_M de 1,02 GB verificado con llama-server.

La relevancia de esta ficha es doble: por un lado, documenta una tecnica de edicion de pesos sin entrenamiento aplicada a un modelo pequeno orientado a agentes; por otro, advierte de que los resultados de rendimiento proceden exclusivamente del autor y se basan en un conjunto propio de 112 tareas, sin validacion independiente ni publicacion en benchmarks oficiales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido: 13 capas de convolucion corta con compuerta (gated short-conv) + 11 capas de atencion GQA; hidden 2048, FFN SwiGLU 7680 |
| Parametros totales | 1.728.801.536 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (el ejemplo de despliegue usa `-c 4096` y `-c 2048` en GPU de 4 GB) |
| Tipos de cuantizacion | GGUF Q4_K_M (1,02 GB); pesos completos en bfloat16 |
| Idiomas soportados | No disponible |
| Licencia | lfm1.0 (license: other, license_name: lfm1.0) |
| Formato de pesos | safetensors (bfloat16) y GGUF (Q4_K_M) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura hibrida del LFM3-1.7B original: 24 capas en las que se alternan 13 capas de convolucion corta con compuerta y 11 capas de atencion con query grouping (GQA), con un tamano oculto de 2048 y una FFN SwiGLU de 7680 dimensiones, lo que da 184.320 neuronas FFN. No se ha realizado ningun entrenamiento adicional: no hay pasos de gradiente ni ajuste supervisado. La intervencion consiste en proyecciones de subespacio QR multi-eje (alpha = -0,12) sobre `L14.self_attn.o_proj`, `L16.feed_forward.w2` y `L20.self_attn.o_proj`, amplificacion de neuronas FFN de matematicas puras (+12% en las top-64 de L16 y L18) y de formato estricto (+10% en las top-64 de L20, L22 y L23), y supresion de neuronas de "bloat" o bucle de `<think>` (alpha = 0,15 en las top-64 de L16 y L18). Segun el autor, las capas tempranas L0-L2 (sintaxis superficial), las capas puente de convolucion corta L15, L17 y L19, y todos los embeddings, LayerNorms y `lm_head` permanecen bit-identicos al modelo base. El manifiesto completo de ediciones se incluye en `wsp_manifest.json`.

La innovacion declarada es el llamado Disentangled Neuron Steering: en lugar de suprimir todas las direcciones FFN negativas para la capacidad agentica (lo que perjudicaria a las matematicas), el autor clasifica las neuronas en grupos no interferentes (Pure-Math, Pure-IFEval y Pure-Bloat) y actua solo sobre cada grupo. El autor reporta 0 tensores con NaN o Inf y verificacion del GGUF mediante el endpoint `/v1/chat/completions` de llama-server antes de la subida.

## Capacidades

- Generacion de texto conversacional en el pipeline `text-generation`.
- Razonamiento formal y resolucion de problemas de matematicas de competicion (el autor reporta 15/30 en MATH-500).
- Generacion de codigo Python ejecutable (19/30 en HumanEval segun el autor).
- Tool calling agentico con XML nativo: el autor reporta 12/12 en su suite de 12 tareas de automatizacion con `<tool_call>`.
- Disciplina de formato estricto (etiquetado como capacidad IFEval en la receta).
- Reduccion de bucles de "pensamiento" mediante la supresion de neuronas Pure-Bloat.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Vision, audio o modos de pensamiento explicito: no disponibles.

## Casos de uso

- Automatizacion de agentes con tool calling: el modelo esta optimizado especificamente para emitir llamadas `<tool_call>` en XML con alta precision segun el autor (12/12), lo que lo hace adecuado para orquestadores ligeros que invocan APIs o funciones en entornos con recursos limitados.
- Asistente de codigo en local: con 1,7 mil millones de parametros y un GGUF Q4_K_M de 1,02 GB, puede desplegarse en portatiles con GPU de 4 GB (por ejemplo, RTX 3050 Laptop con `-ngl 12 -c 2048`) para autocompletado y generacion de funciones Python.
- Resolucion de problemas matematicos de competicion en pipelines educativos: la amplificacion de neuronas Pure-Math en L16 y L18 busca mejorar el rendimiento en MATH-500 sin sacrificar el resto de capacidades.
- Formateo estricto de salidas en produccion: la amplificacion de neuronas Pure-IFEval en L20, L22 y L23 esta pensada para tareas que exigen JSON, XML o plantillas rigidas, como extraccion de datos o generacion de informes estructurados.
- Despliegue en edge o entornos sin GPU dedicada: el GGUF Q4_K_M de 1,02 GB permite ejecucion en CPU con llama.cpp para clasificacion, resumen o respuestas conversacionales de baja latencia.
- Servidor local compatible con la API de OpenAI: el uso de `llama-server` con `--jinja` permite exponer el modelo en `/v1/chat/completions` y sustituir llamadas a APIs comerciales en prototipos y pruebas de integracion.
- Experimentacion con tecnicas de edicion de pesos: el manifiesto `wsp_manifest.json` y la receta detallada permiten reproducir y auditar la intervencion, lo que resulta util para investigadores que estudian steerability sin entrenamiento.

## Benchmarks y rendimiento

Los unicos datos disponibles son los publicados por el autor en la model card, evaluados de forma determinista (`do_sample=False`) sobre 112 tareas estratificadas con semilla 42: 40 preguntas de MMLU-Pro, 30 de MATH-500, 30 de HumanEval y 12 tareas propias de tool calling XML. No hay validacion independiente.

| Modelo / variante | % pesos modificados | MMLU-Pro (40) | MATH-500 (30) | HumanEval (30) | Agentic (12) | Tokens ag. medios | AA-Mini Index |
|---|---|---|---|---|---|---|---|
| LFM3-1.7B-WSP-V3 (V3_Fusion_Tuned_a012) | 0,9742% | 12/40 (30,0%) | 15/30 (50,0%) | 19/30 (63,3%) | 12/12 (100%) | 135,2 | 54,83 (+6,41) |
| V3_Fusion_Plus_L14Math | 1,0525% | 12/40 (30,0%) | 16/30 (53,3%) | 20/30 (66,7%) | 10/12 (83,3%) | 155,2 | 54,16 (+5,74) |
| V3_StemMath_QR_a015 | 1,0553% | 11/40 (27,5%) | 16/30 (53,3%) | 19/30 (63,3%) | 11/12 (91,7%) | 152,9 | 53,82 (+5,40) |
| V3_Fusion_NullSpace_Hybrid | 0,8047% | 9/40 (22,5%) | 14/30 (46,7%) | 21/30 (70,0%) | 12/12 (100%) | 135,8 | 53,26 (+4,84) |
| LiquidAI/LFM3-1.7B (baseline oficial) | 0,0% | 10/40 (25,0%) | 13/30 (43,3%) | 17/30 (56,7%) | 11/12 (91,7%) | 134,2 | 48,42 |

Formula del AA-Mini Index segun el autor: `0,30 * MMLU-Pro% + 0,30 * MATH-500% + 0,25 * HumanEval% + 0,15 * Agentic%`. No se han publicado resultados de benchmarks independientes (MMLU completo, GSM8K, MT-Bench, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 3,5 GB en bfloat16 para los pesos completos (1,73 mil millones de parametros a 2 bytes), mas overhead de activaciones y cache KV; aproximadamente 1,0-1,5 GB con el GGUF Q4_K_M.
- GPU recomendadas: RTX 3050 Laptop (4 GB) o superiores para el GGUF Q4_K_M; RTX 4090, A100 o H100 para el checkpoint bfloat16 completo con mayor contexto y throughput.
- Cabe en GPU de consumo: si, en tarjetas con 4 GB o mas usando Q4_K_M; el autor documenta `-ngl 12 -c 2048` en una RTX 3050 Laptop.
- Opciones de despliegue: `llama.cpp` (`llama-server` con `--jinja` y `-ngl 99`), Ollama (a partir del GGUF), vLLM y TGI (para el checkpoint safetensors, con `trust_remote_code=True`), y `transformers` con `AutoModelForCausalLM` en bfloat16.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Sayansantra/LFM3-1.7B-WSP-V3 | 1,73 B | No disponible | lfm1.0 | safetensors, GGUF Q4_K_M | Variante editada sin entrenamiento del LFM3-1.7B; benchmarks solo del autor |
| LiquidAI/LFM3-1.7B | 1,73 B | No disponible | lfm1.0 | safetensors | Modelo base oficial; referencia de comparacion en la tabla del autor |
| Qwen2.5-1.5B-Instruct | 1,54 B | 32.768 tokens (segun documentacion publica de Qwen) | Apache 2.0 | safetensors, GGUF | Alternativa de tamano similar con licencia permisiva y amplio ecosistema |
| SmolLM2-1.7B-Instruct | 1,71 B | 8.192 tokens (segun documentacion publica de Hugging Face) | Apache 2.0 | safetensors, GGUF | Alternativa de tamano similar orientada a despliegue en edge |

La comparacion de rendimiento entre estos modelos no esta disponible en la informacion proporcionada; los unicos datos numericos son los de la tabla de benchmarks del autor, que solo compara variantes del propio LFM3-1.7B.

## Limitaciones y advertencias

- Los resultados de rendimiento proceden exclusivamente del autor, sobre un conjunto propio de 112 tareas y con una metrica (AA-Mini Index) definida por el propio autor; no hay evaluacion independiente ni publicacion en leaderboards reconocidos.
- El modelo no ha sido entrenado: la edicion de pesos puede degradar capacidades no medidas (multilingue, sentido comun, conversacion abierta) sin que el autor lo haya verificado.
- Riesgo de alucinacion: inherente a un modelo de 1,7 mil millones de parametros; no se han publicado evaluaciones de factualidad ni de calibracion.
- Sesgos conocidos: no disponibles en la informacion proporcionada; al heredar los pesos del LFM3-1.7B, arrastra los sesgos del modelo base y de sus datos de entrenamiento.
- Idiomas soportados: no disponibles; no se garantiza un rendimiento multilingue mas alla de lo que ofrezca el modelo base.
- Longitud de contexto: no disponible; los ejemplos de despliegue usan 4096 tokens como maximo, lo que limita casos de contexto largo.
- Licencia lfm1.0: es una licencia "other" con terminos propios; es imprescindible revisar el archivo LICENSE antes de cualquier uso comercial, ya que puede imponer restricciones adicionales.
- El uso de `trust_remote_code=True` implica ejecutar codigo personalizado del repositorio; conviene auditar el codigo antes de desplegarlo en produccion.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validacion por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Sayansantra/LFM3-1.7B-WSP-V3
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B
- Dataset MMLU-Pro: https://huggingface.co/datasets/TIGER-Lab/MMLU-Pro
- Dataset MATH-500: https://huggingface.co/datasets/HuggingFaceH4/MATH-500
- Dataset HumanEval: https://huggingface.co/datasets/openai/openai_humaneval
- Manifiesto de ediciones: `wsp_manifest.json` (incluido en el repositorio del modelo)
- Licencia: `LICENSE` (incluido en el repositorio del modelo)
