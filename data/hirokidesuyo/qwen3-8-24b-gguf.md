# hirokidesuyo/Qwen3.8-24B-GGUF

## Resumen

Qwen3.8-24B es un derivado podado en profundidad del modelo Qwen/Qwen3.8-27B, publicado por el usuario hirokidesuyo en Hugging Face. El autor aplica una medición de sensibilidad por capas (Block Influence al estilo ShortGPT) sobre el modelo base de 64 capas y elimina 8 capas intermedias, dejando una red de 56 capas con aproximadamente 23,7B de parámetros (24.276.548.288 según los safetensors del repo). Posteriormente realiza un ajuste LoRA de recuperación (r=16, alpha=32) sobre las proyecciones MLP y la autoatención de las capas full attention, con el objetivo de compensar la pérdida de calidad introducida por la poda.

El modelo se distribuye únicamente en formato GGUF para llama.cpp, con dos cuantizaciones: Q4_K_M (13,94 GiB) y Q8_0 (24,04 GiB). La arquitectura declarada es `Qwen3_5ForConditionalGeneration`, lo que indica que el modelo base incorpora componentes multimodales (visión) y una capa MTP (multi-token prediction) que se conserva tras la poda. La licencia es Apache-2.0, heredada del modelo base.

La relevancia de esta ficha es doble: por un lado, documenta una técnica de compresión (poda de profundidad con recuperación LoRA) aplicada a un modelo de ~27B; por otro, advierte de que la evaluación publicada se limita a perplejidad y pruebas cualitativas, sin baterías de benchmarks estándar. Es un artefacto experimental, no un modelo validado para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso con capas de atención lineal y full attention alternadas (`Qwen3_5ForConditionalGeneration`), 56 capas tras poda (base de 64), capa MTP conservada |
| Parametros totales | 24.276.548.288 (~24,3B según safetensors); el autor declara ~23,7B para el modelo de lenguaje de 56 capas |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible de forma explícita; el autor reporta funcionamiento esperado a 8k–16k en Q4_K_M sobre T4 y pruebas cualitativas con ctx 8192 |
| Tipos de cuantizacion | Q4_K_M y Q8_0 (GGUF); el repo no incluye otros niveles |
| Idiomas soportados | Inglés (en) y japonés (ja), según la model card y los tags |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp); no se publican safetensors del modelo podado |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B es un transformer denso de 64 capas con una combinación de capas de atención lineal y full attention, más una capa MTP y pesos de visión. El autor mide la contribución de cada capa mediante Block Influence (coseno entre hidden states de entrada y salida de cada bloque) sobre 16 secuencias en inglés y 16 en japonés de hasta 512 tokens, e identifica como redundantes las capas `[4, 9, 11, 12, 13, 14, 15, 16]`, que elimina y renumera las 56 restantes de 0 a 55. Mantiene `full_attention_interval = 4` y reconstruye el vector `layer_types` para las capas supervivientes.

La decisión de podar 8 capas se justifica con una sonda de perplejidad sobre el mismo corpus: el modelo denso da PPL 8,72, saltar 8 capas da 9,91, saltar 12 da 28,30 y saltar 16 colapsa a 2364. La recuperación se hace con LoRA (r=16, alpha=32, dropout=0,05) sobre `gate_proj`, `up_proj`, `down_proj` y las proyecciones `q_proj`, `k_proj`, `v_proj`, `o_proj` de las capas full attention, entrenando 366 pasos sobre 1.499.136 tokens de WikiText-2 train y Wikipedia en japonés (bloques de 512 tokens, mitad EN y mitad JA, seed 42). El merge se realiza en float32 con ΔW = 2,0 × (B × A) y se devuelve a bfloat16. El autor verifica que el LoRA aprendido sobre las 8 capas eliminadas es prácticamente nulo (norma de `lora_B` igual a 0), lo que valida el esquema de merge.

## Capacidades

- Generación de texto conversacional en inglés y japonés, con formato ChatML y modo de razonamiento (`<think>`) abierto por defecto.
- Razonamiento aritmético básico y resolución de problemas de un paso (verificado cualitativamente con 17 + 25 = 42).
- Seguimiento de instrucciones con restricciones de formato (listas numeradas, número exacto de frases, respuestas de una sola línea).
- Memoria multi-turno a corta distancia: recuerda nombre y lugar de residencia introducidos en un turno previo.
- Recuperación de información en contexto largo: localiza un dato insertado en el bloque 18 de 30 en una ventana de ~4.000 tokens.
- Enumeración con parada correcta: lista los 25 primos menores de 100 sin entrar en bucles de repetición.
- Capacidad multimodal (visión) potencialmente heredada del modelo base, aunque no validada tras la poda y no utilizable en el GGUF distribuido.
- No se documenta soporte de tool calling, function calling ni comportamiento agéntico multi-paso en la información disponible.

## Casos de uso

- Despliegue local en GPU de consumo para asistentes conversacionales en inglés o japonés: la cuantización Q4_K_M (13,94 GiB) permite cargar el modelo completo en una GPU de 16 GB con cuantización de KV cache, según el cálculo del autor (no verificado en T4).
- Prototipado de razonamiento con cadena de pensamiento: el modelo genera trazas `<think>` antes de responder, útil para experimentar con pipelines que separan razonamiento y respuesta final, siempre con un límite de tokens de salida amplio (el autor observa cortes con límites de 256–1024 tokens).
- Procesamiento de documentos cortos con recuperación de datos: con contexto de 8k–16k puede responder preguntas sobre fragmentos insertados en el prompt, como en la prueba de los 30 bloques con un dato en el bloque 18.
- Generación de resúmenes con restricciones de formato: la verificación cualitativa muestra que respeta instrucciones del tipo "resume en exactamente dos frases" y termina con EOS.
- Evaluación de técnicas de compresión de modelos: sirve como caso de estudio reproducible de poda por sensibilidad más recuperación LoRA, con hiperparámetros, capas eliminadas y curva de PPL documentados.
- Experimentación con llama.cpp en CPU: el GGUF Q4_K_M funciona en CPU (el autor lo probó a ~2,5 tok/s en una VM de Colab sin aceleración), adecuado para pruebas de integración y validación funcional, no para producción interactiva.
- Base para ajuste fino posterior en dominios concretos: al ser Apache-2.0 y estar en GGUF, puede servir como punto de partida para LoRA adicionales, aunque la poda limita la fidelidad respecto al modelo original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, GSM8K, HumanEval, MT-Bench) en la información disponible. El autor lo indica explícitamente en la sección de limitaciones. Los únicos datos cuantitativos son de perplejidad y velocidad:

| Metrica | Qwen3.8-27B (dense) | Qwen3.8-24B (podado + LoRA) |
|---|---|---|
| PPL EN (split limpio) | 13,50 | 11,94 |
| PPL JA (split limpio) | No disponible | 7,58 |
| PPL ALL (split limpio) | No disponible | 8,07 |

| Medición en L4 (24 GB), Q4_K_M, todas las capas en GPU | Valor |
|---|---|
| llama-bench pp512 (procesamiento de prompt) | 1010,18 ± 5,34 t/s |
| llama-bench tg64 (generación) | 16,50 ± 0,01 t/s |

El autor advierte que la mejora de PPL en inglés y japonés respecto al denso no equivale a una mejora en tareas: la perplejidad mide ajuste al corpus de evaluación, no capacidad funcional, y el corpus de recuperación (WikiText-2 y Wikipedia JA) está próximo al de evaluación.

## Requisitos de hardware

- VRAM estimada: Q4_K_M ocupa 13,94 GiB de pesos; con KV cache y overhead, el autor estima que cabe en 16 GB con cuantización de KV cache, aunque no lo ha medido en T4. Q8_0 ocupa 24,04 GiB y requiere al menos 24 GB de VRAM para carga completa.
- GPU recomendadas: L4 (24 GB) verificada con todas las capas en GPU para Q4_K_M; A100 o H100 para Q8_0 con contexto largo; RTX 4090 (24 GB) es candidata para Q8_0 por capacidad, aunque no se ha probado en la información disponible.
- GPU de consumo: Q4_K_M podría caber en RTX 4060 Ti 16 GB, RTX 4070 Ti Super 16 GB o RTX 4080 16 GB, siempre con cuantización de KV cache; no verificado.
- Despliegue: llama.cpp (versión b12211 o superior según el autor), con soporte GGUF. No se documenta compatibilidad con vLLM, TGI ni Ollama en la información disponible, aunque el formato GGUF es compatible con Ollama en principio.
- Rendimiento: 16,50 t/s de generación y 1010 t/s de preprocesado en L4 con Q4_K_M y todas las capas en GPU. En CPU el autor observó ~2,5 t/s en una VM de Colab, sin validez como métrica de referencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-24B (este) | ~24,3B (56 capas) | No disponible explícito; probado a 8k | Poda de 8 capas + LoRA r=16, 1,5M tokens | Apache-2.0 | GGUF Q4_K_M y Q8_0 |
| Qwen3.8-Whittle-16B | ~16,8B | No disponible | Poda de 20 capas + reducción de anchura 25% + QLoRA r=64, 11M tokens | No disponible en la información | No disponible en la información |
| Qwen/Qwen3.8-27B (base) | ~27B (64 capas) | No disponible en la información | Modelo denso original con visión y MTP | Apache-2.0 | Pesos originales en Hugging Face |

No se dispone de datos de benchmarks comparativos entre estos modelos; la comparación se limita a parámetros, enfoque de compresión y licencia. El autor incluye una tabla comparativa con Whittle en su model card, pero sin métricas de tarea.

## Limitaciones y advertencias

- Evaluación insuficiente: no hay resultados de MMLU, GSM8K, HumanEval ni MT-Bench; solo perplejidad y pruebas cualitativas con prompts fijos. No es posible afirmar que el modelo mantenga las capacidades del base en tareas reales.
- Riesgo de degradación no detectada: la poda elimina 8 capas intermedias y la recuperación LoRA se entrenó con solo 1,5M tokens, un volumen bajo para restaurar capacidades complejas como código, matemáticas avanzadas o razonamiento multi-paso.
- Modo de razonamiento verboso: el modelo genera trazas `<think>` largas y, con límites de salida de 256–1024 tokens, no llega a la respuesta final en tareas como traducción a tres idiomas, haikus o textos de ~200 palabras. En producción hay que dimensionar `max_tokens` con margen amplio.
- Visión no validada: los pesos multimodales del base se conservan, pero no se ha evaluado el impacto de la poda en tareas de imagen, y el GGUF está pensado para texto.
- Idiomas limitados: solo inglés y japonés declarados; el comportamiento en castellano u otros idiomas no está evaluado y probablemente sea deficiente.
- Contexto no especificado: la model card no declara la longitud máxima de contexto del modelo podado; solo se ha probado hasta 8k–16k de forma cualitativa.
- Sesgos: no se documenta ninguna evaluación de sesgos, toxicidad o alineación; el ajuste LoRA se hizo sobre Wikipedia y WikiText-2, con los sesgos propios de esas fuentes.
- Licencia: Apache-2.0 permite uso comercial, pero el autor no ofrece garantías y el modelo es un derivado experimental sin validación. La responsabilidad de evaluar su idoneidad recae en quien lo despliegue.
- Reproducibilidad: el repositorio no incluye los scripts de poda ni los adaptadores LoRA originales, solo los GGUF finales; reproducir el proceso requiere reimplementar el pipeline descrito.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hirokidesuyo/Qwen3.8-24B-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Modelo comparable Whittle: https://huggingface.co/whittleOrg/Qwen3.8-Whittle-16B
- llama.cpp (motor de inferencia): https://github.com/ggml-org/llama.cpp
- ShortGPT (referencia metodológica para Block Influence): no se proporciona enlace en la información disponible.
