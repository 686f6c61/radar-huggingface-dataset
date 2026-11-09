# alea-institute/alea-r4-3B-A0.7B-Base-preview

## Resumen

ALEA R4 3B-A0.7B Base (preview) es un modelo de lenguaje de tipo mezcla de expertos (MoE) desarrollado por ALEA Institute, publicado como versión preliminar el 9 de noviembre de 2026. Con 3.315.557.632 parámetros totales y aproximadamente 673 millones activos por token, se construye sobre la arquitectura estándar `Qwen3MoeForCausalLM` y está diseñado específicamente para entrenarse únicamente con datos lícitos: textos de registro público legal, regulatorio y financiero de Estados Unidos, texto del Diario Oficial de la UE en inglés, texto general de dominio público y datos sintéticos, de diccionario, de conocimiento y de tareas generados por ALEA.

Se trata de un modelo base sin ajuste por instrucciones, sin ajuste de preferencias ni de seguridad, y sin fase de decaimiento de la tasa de aprendizaje. Esta preview es una media uniforme de pesos de cuatro checkpoints de preentrenamiento (pasos 35.000, 45.000, 55.000 y 65.000) de la ejecución R4, promediados en fp32 y almacenados en bf16. El modelo está pensado para experimentación e investigación sobre modelado de lenguaje en el dominio legal y financiero, no para uso directo en producción como asistente.

Su relevancia radica en su enfoque de procedencia de datos ("lawful data") y en su tamaño compacto con activación reducida, lo que permite inferencia en hardware modesto. No obstante, el propio autor advierte que el modelo está cerca del azar en MMLU y BBH, falla en razonamiento condicional e inventa nombres, cifras, pies de sentencia y fallos judiciales al continuar texto legal o financiero.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `Qwen3MoeForCausalLM` estándar (sin `trust_remote_code`); 32 capas, d_model 1.280, 16 cabezas de consulta / 8 de KV (head_dim 128), QK-norm, RoPE (theta 1e6) |
| Parametros totales | 3.315.557.632 (3,32B; 3,36B si se cuenta la cabeza de salida atada por separado) |
| Parametros activos | ~673M por token |
| Longitud de contexto | 4.096 tokens (el `model_max_length` del tokenizer configura 2.048) |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16) |
| Idiomas soportados | inglés (`en`) |
| Licencia | CC-BY-4.0 (contenido derivado de WordNet sujeto a `WORDNET_LICENSE.txt`) |
| Formato de pesos | safetensors (un único archivo bf16, 6,6 GB) |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura transformer de mezcla de expertos con 48 expertos enrutados (FFN de dimensión 512) y enrutamiento top-6, embeddings de entrada y salida atados, normalización QK y RoPE con theta 1e6. Consta de 32 capas con d_model de 1.280 y 16 cabezas de consulta frente a 8 de clave-valor con dimensión de cabeza 128. El tokenizer es `alea-v2b-sw32k`, un BPE de 32.768 tokens con tokens de control y plantilla de chat; el token `<|start|>` (id 0) se antepone automáticamente y la generación se detiene en `<|end|>` (id 1) y `<|eot|>` (id 7).

El entrenamiento se realizó con OLMo-core sobre una única NVIDIA GH200, con 1.048.576 tokens por paso, AdamW (betas 0,9/0,95, weight decay 0,1) y tasa de aprendizaje 4e-4 constante tras un calentamiento de 2.000 pasos. Los cuatro checkpoints de origen habían visto aproximadamente 36,7B, 47,2B, 57,7B y 68,2B tokens, procedentes de cuatro mezclas de datos distintas (segmentos 4, 5, 7 y 8 de la ejecución R4). No hubo entrenamiento posterior al promediado. Los checkpoints de pasos 55.000 y 65.000 provienen de una línea que se bifurcó en el paso 52.000, por lo que el recuento de tokens vistos corresponde solo a esa línea.

## Capacidades

- Generación de texto autoregresiva en inglés, orientada a la continuación de documentos legales, regulatorios y financieros.
- Extracción de información estructurada, con resultados destacados en extracción JSON según las pruebas internas del autor.
- Tareas en contexto (in-context tasks) y recuperación factual a libro cerrado (closed-book factual recall), donde supera al último checkpoint individual de R4 según las pruebas de ALEA.
- Plantilla de chat con roles y bloques de contexto `<|context|>` y pasajes numerados `<|snippet|>` para formular preguntas sobre un texto proporcionado.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible; el modelo falla en razonamiento condicional.
- Capacidades multilingües: limitadas al inglés.
- Capacidades especiales: no disponible (no hay modo thinking, visión ni audio).

## Casos de uso

- Investigación sobre procedencia de datos: permite estudiar cómo afecta un corpus estrictamente lícito (registro público legal y financiero de EE. UU. y Diario Oficial de la UE) al comportamiento de un modelo base de 3,3B parámetros con activación de ~673M.
- Extracción de campos estructurados de contratos: el modelo obtiene buenos resultados en extracción JSON en las pruebas del autor, por lo que puede emplearse para prototipar pipelines que conviertan cláusulas (por ejemplo, rentas y penalizaciones) en objetos estructurados, siempre con validación posterior.
- Preguntas sobre un pasaje concreto: mediante el bloque `<|context|>` y pasajes `<|snippet|>` numerados, se le puede pedir que responda a preguntas sobre un fragmento legal o financiero concreto, como se muestra en la model card con un contrato de arrendamiento.
- Generación de borradores de cláusulas contractuales: puede continuar plantillas como cláusulas de ley aplicable o de integridad del acuerdo, útiles como punto de partida que un revisor humano debe validar.
- Ajuste fino supervisado (fine-tuning) como base: al ser un modelo base sin ajuste por instrucciones, sirve como punto de partida para SFT y DPO en dominios legales o financieros con datos propios.
- Evaluación comparativa de modelos MoE pequeños: su tamaño y su licencia CC-BY-4.0 facilitan reproducir experimentos de enrutamiento, promediado de pesos y evaluación de alucinación en dominios especializados.
- Despliegue en hardware de consumo para experimentación: con 3,3B parámetros y pesos bf16 de 6,6 GB, puede ejecutarse en GPUs de consumo para pruebas de generación y extracción.

## Benchmarks y rendimiento

La model card describe resultados cualitativos de las pruebas internas de ALEA, pero no publica una tabla con cifras numéricas de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.). Los datos disponibles indican que el modelo está cerca del azar en MMLU y BBH, falla en razonamiento condicional y supera al último checkpoint individual de R4 (`s10-step78000`) en recuperación factual a libro cerrado, la prueba de conocimiento, tareas en contexto y extracción JSON.

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos bf16 ocupan 6,6 GB; en bf16 se necesita al menos ~7 GB de VRAM más memoria para el KV cache y activaciones; en cuantización de 8 bits o 4 bits (no publicada oficialmente) el requisito sería menor, pero no hay datos disponibles.
- GPU recomendadas: el entrenamiento se realizó en una NVIDIA GH200; para inferencia, cualquier GPU con al menos 8-16 GB de VRAM es suficiente para bf16 (por ejemplo, RTX 4090, A100, H100).
- Cabe en GPU de consumo: sí, en bf16 cabe en GPUs con 8 GB o más (RTX 3060 Ti, RTX 4060 Ti, RTX 4070, RTX 4090), aunque el KV cache para 4.096 tokens añade memoria adicional.
- Opciones de despliegue: `transformers` (probado con la versión 5.17; versiones con soporte Qwen3-MoE como 4.51 o posteriores deberían cargar los pesos, aunque no se probaron; antes de 4.56 debe usarse `torch_dtype=` en lugar de `dtype=`); no se confirma soporte de vLLM, llama.cpp, Ollama o TGI en la información disponible.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ALEA R4 3B-A0.7B Base (preview) | 3,32B | ~673M | 4.096 | CC-BY-4.0 | Hugging Face (preview) |
| Qwen3-MoE (variantes de ~3B) | no disponible | no disponible | no disponible | no disponible | no disponible |
| Checkpoint individual R4 `s10-step78000` | 3,32B | ~673M | 4.096 | CC-BY-4.0 | Hugging Face (rama de `alea-r4-3B-A0.7B-Base-ckpts`) |

No se dispone de datos de benchmarks comparativos con modelos de otras familias en la información proporcionada. La comparación más directa es con los checkpoints individuales de la propia ejecución R4, frente a los cuales esta media de pesos obtiene mejores resultados en recuperación a libro cerrado, pares mínimos de fundamentación y extracción JSON, a costa de peor recitación legal.

## Limitaciones y advertencias

- Es un modelo base: no tiene ajuste por instrucciones, ni de preferencias, ni de seguridad; no debe usarse como asistente conversacional sin ajuste adicional.
- Está cerca del azar en MMLU y BBH y falla en razonamiento condicional.
- No sabe quién lo creó (no conoce su propia identidad).
- Inventa nombres, cifras, pies de sentencia y fallos judiciales al continuar texto legal o financiero; toda cita, hecho o número debe tratarse como no verificado.
- No es asesoramiento legal.
- Contexto limitado a 4.096 tokens, aunque el tokenizer declara `model_max_length` 2.048.
- Solo soporta inglés.
- Licencia CC-BY-4.0: permite uso comercial con atribución; el contenido derivado de WordNet está sujeto a condiciones adicionales recogidas en `WORDNET_LICENSE.txt`.
- Versión preview (v0.1): los pesos, las evaluaciones y la model card pueden cambiar; no es la versión final de R4.
- En la prueba de chat con pasaje, el modelo respondió correctamente pero no añadió la cita solicitada, lo que indica poca fiabilidad en el seguimiento de instrucciones.
- Antes de `transformers` 4.56 debe usarse `torch_dtype=` en lugar de `dtype=`.
- No se confirma soporte de motores de despliegue de alto rendimiento (vLLM, TGI, llama.cpp) en la información disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/alea-institute/alea-r4-3B-A0.7B-Base-preview
- Checkpoints de origen (ramas `s5-step35000`, `s6-step45000`, `s8-step55000`, `s9-step65000`): https://huggingface.co/alea-institute/alea-r4-3B-A0.7B-Base-ckpts
- KL3M Data Project (mencionado como fuente de datos): no disponible enlace directo en la información proporcionada
- OLMo-core (framework de entrenamiento): no disponible enlace directo en la información proporcionada
