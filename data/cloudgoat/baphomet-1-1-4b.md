# CloudGoat/Baphomet-1.1-4B

## Resumen

Baphomet-1.1-4B es un modelo de lenguaje y visión de 4.660 millones de parámetros construido por CloudGoat mediante la fusión lineal de ocho vectores de tarea sobre la base Qwen/Qwen3.5-4B. No se trata de un entrenamiento desde cero ni de un ajuste fino adicional, sino de una combinación de pesos: cada donante aporta la diferencia entre sus pesos y los del modelo base, y esa diferencia se pondera con un coeficiente individual calculado por búsqueda evolutiva (EvoGM). El resultado hereda la arquitectura híbrida de Qwen3.5, con capas de atención lineal intercaladas con atención completa y una ventana de contexto de 262.144 tokens.

El modelo resuelve el problema de consolidar capacidades dispersas —razonamiento, agentes, código, matemáticas— en un único checkpoint de 4B sin necesidad de reentrenar. Su relevancia radica en la metodología: frente a la versión 1.0, que aplicaba un coeficiente uniforme de 0,1375 a todos los donantes, la 1.1 asigna pesos muy desiguales (0,59 a Qwen3.8-4B-Distill, 0,30 a Qwopus3.5-4B-v3, 0,20 a DeepSeek-V4-Pro-Qwen3.5-4B) y obtiene una puntuación agregada del 79,4% en un test de 180 ítems, frente al 70,0% del Qwen3.5-4B original.

Es relevante ahora porque demuestra que la fusión evolutiva de vectores de tarea puede recuperar capacidades de modelos mayores o especializados en un formato de 4B desplegable en hardware de consumo, con licencia Apache 2.0 y soporte de imagen-texto. La model card documenta además el coste computacional del proceso (unas 13,7 horas de kernel en Kaggle T4×2), lo que hace la receta reproducible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `Qwen3_5ForConditionalGeneration` (transformer híbrido con atención lineal y completa) |
| Parametros totales | 4.659.865.088 (4,66B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16; no se documentan GGUF ni otras cuantizaciones) |
| Idiomas soportados | inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (2 shards, bf16; `A_log` y tensores de normalización en fp32) |

## Arquitectura y entrenamiento

La arquitectura es idéntica a la del modelo base Qwen3.5-4B: 32 capas de texto con tamaño oculto 2560, 16 cabezas de consulta y 4 de clave/valor (GQA), dimensión de cabeza 256, FFN de 9216 con activación SiLU, embeddings atados y vocabulario de 248.320 tokens (Qwen2Tokenizer, BPE). La atención sigue un patrón repetitivo de tres capas de atención lineal seguidas de una de atención completa, lo que reduce el coste de memoria en contextos largos. Incluye una capa MTP (multi-token prediction) para decodificación especulativa.

No hubo entrenamiento en el sentido convencional. El modelo se construye calculando, para cada uno de los ocho donantes, un vector de tarea `Tᵢ = W_donorᵢ − W_base` en fp32, almacenado en fp8 e4m3 con escala absmax por fila. La fusión aplica `W = W_base + Σ λᵢ · dequant(Tᵢ)`, acumulando en fp32 y devolviendo a bf16. Los coeficientes λ se obtuvieron con una implementación de EvoGM (ICML 2026): 40 candidatos en la ronda 1 evaluados sobre 110 ítems (40 MMLU-Pro, 30 GPQA, 40 BFCL non-live), más 64 candidatos en las rondas 2 y 3 aceleradas mediante un modelo IRT 2PL sobre un subconjunto de 40 ítems seleccionados por información de Fisher. El ganador se re-puntuó sobre los 110 ítems completos. La suma de coeficientes es Σλ ≈ 1,139. Agents-A1-4B y AREX-Turbo no aportan tensores MTP; NeoHorse-1-4B y tmax-4b son solo texto y sus claves se remapearon de `model.*` a `model.language_model.*`. El tokenizador, la plantilla de chat y la configuración del procesador se copian sin cambios del base.

## Capacidades

- Generación de texto conversacional en inglés con modo de razonamiento (thinking mode) activable.
- Razonamiento de múltiples pasos y cadenas de pensamiento, con una media de 1.834 tokens de salida en el test de evaluación (frente a 3.180 en la versión 1.0).
- Razonamiento matemático y de dominio científico, heredado principalmente de Qwen3.8-4B-Distill y DeepSeek-V4-Pro-Qwen3.5-4B.
- Generación y comprensión de código, con contribución de Qwopus3.5-4B-Coder y Qwopus3.5-4B-v3.
- Tool calling y function calling, evaluado con BFCL non-live; heredado de Agents-A1-4B y AREX-Turbo.
- Capacidades de agente y razonamiento multi-paso orientadas a uso con herramientas.
- Procesamiento de imagen y texto (pipeline `image-text-to-text`), aunque los donantes de visión son una minoría y la model card no detalla el rendimiento multimodal.
- Capacidad de predicción multi-token (MTP) para decodificación especulativa.
- Multilingüe: limitado a inglés según la model card, pese a que el vocabulario base cubre más idiomas.

## Casos de uso

- Razonamiento científico asistido: el modelo puede responder preguntas de nivel GPQA-Diamond y MMLU-Pro con cadenas de pensamiento acotadas a 8.192 tokens, adecuado para revisión de hipótesis o preparación de material docente técnico.
- Agentes con tool calling: su evaluación en BFCL non-live y la herencia de Agents-A1-4B lo hacen utilizable en orquestadores que requieren selección de funciones y encadenamiento de llamadas en inglés.
- Asistente de código en local: con 4,66B de parámetros y pesos bf16, puede desplegarse en una GPU de consumo para autocompletado, explicación de fragmentos y generación de tests en pipelines de desarrollo.
- Procesamiento de documentos con imagen: al aceptar entrada imagen-texto, sirve para extraer y razonar sobre contenido de capturas, diagramas o formularios en flujos internos.
- Evaluación comparativa de técnicas de fusión: es un caso de estudio reproducible para investigadores que quieran replicar EvoGM o comparar merges lineales frente a ajuste fino.
- Prototipado rápido de chatbots en inglés: su contexto de 262.144 tokens permite mantener conversaciones largas o ingerir documentación extensa sin truncar.
- Base para experimentos de decodificación especulativa: la capa MTP incluida permite medir aceleraciones de inferencia en entornos controlados.

## Benchmarks y rendimiento

| Modelo | Test pareado de 180 ítems (MMLU-Pro / GPQA-Diamond / BFCL non-live, tope 8.192 tokens) | Tokens medios de salida |
|---|---:|---:|
| Baphomet-1.1-4B | 79,4% | 1.834 |
| Baphomet-1.0-4B | 77,8% | 3.180 |
| Qwen3.5-4B (base) | 70,0% | no disponible |

Resultados de la búsqueda evolutiva sobre el conjunto de fitness (110 ítems, tope 4.096 tokens):

| Configuración | Puntuación de fitness |
|---|---:|
| Baphomet-1.0 (λ uniforme 0,1375) | 0,603 |
| Mejor candidato de la ronda 1 | 0,722 |
| Mejor candidato de la ronda 2 | 0,733 |
| Baphomet-1.1 (final) | 0,764 |

La model card indica que la mejora sobre Qwen3.5-4B es estadísticamente significativa, mientras que la mejora sobre Baphomet-1.0 no lo es. No se publican resultados desagregados por benchmark (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada en bf16: aproximadamente 9,3 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, 12-16 GB para contextos moderados.
- VRAM estimada en fp16: similar a bf16 (unos 9,3 GB de pesos).
- Cuantización a 8 bits: alrededor de 5 GB de pesos; a 4 bits, alrededor de 2,5-3 GB, aunque no se publican GGUF oficiales y habría que generarlos.
- GPU recomendadas para producción: A100 40/80 GB, H100, L40S; para una sola GPU con contexto largo, A100 80 GB o H100.
- GPU de consumo: cabe en RTX 4090 (24 GB) en bf16 con contexto amplio, y en RTX 3090/4080 (16-24 GB) con margen ajustado; en GPUs de 8-12 GB requeriría cuantización.
- Opciones de despliegue: transformers (librería declarada), vLLM (usado en la evaluación con la versión 0.33.0), TGI y llama.cpp/Ollama previa conversión a GGUF.
- Latencia y throughput: no disponibles. La model card solo menciona el coste de la búsqueda (13,7 horas de kernel en Kaggle T4×2), no el rendimiento de inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Idiomas | Notas |
|---|---:|---:|---|---|---|
| Baphomet-1.1-4B | 4,66B | 262.144 | Apache 2.0 | en | Fusión EvoGM de 8 vectores; 79,4% en test propio de 180 ítems |
| Baphomet-1.0-4B | 4,66B | 262.144 | Apache 2.0 | en | Misma receta con λ uniforme; 77,8% en el mismo test; genera más tokens |
| Qwen/Qwen3.5-4B | ~4B | 262.144 | Apache 2.0 (según base) | multilingüe | Modelo base; 70,0% en el test; sin fusión |
| empero-ai/Qwen3.8-4B-Distill | ~4B | no disponible | no disponible | no disponible | Donante con mayor peso (λ = 0,59); orientado a razonamiento destilado |

No se dispone de comparaciones con modelos externos a la familia en la información proporcionada.

## Limitaciones y advertencias

- El modelo solo declara soporte de inglés; el rendimiento en castellano u otros idiomas no está evaluado y puede degradarse respecto al base.
- La mejora frente a Baphomet-1.0 no es estadísticamente significativa según la propia model card; el test tiene 180 ítems y un tope de 8.192 tokens, lo que limita la potencia estadística.
- Los benchmarks publicados son internos y agregados (MMLU-Pro, GPQA-Diamond, BFCL non-live); no hay resultados en MMLU, HumanEval, GSM8K ni evaluaciones multimodales.
- La fusión por vectores de tarea puede producir interferencias entre capacidades; los coeficientes negativos (tmax-4b, λ = −0,000742) y los casi nulos (Qwopus3.5-4B-Coder, 0,001337; NeoHorse-1-4B, 0,002979) indican que esos donantes aportan poco o restan.
- La cuantización de los vectores de tarea a fp8 e4m3 introduce desviaciones de hasta aproximadamente 1 ulp de bf16 respecto a una fusión exacta en fp32.
- Riesgo de alucinación no cuantificado: no se publican evaluaciones de veracidad ni de sesgos.
- Aunque la licencia es Apache 2.0, conviene verificar las licencias de los ocho modelos donantes antes de uso comercial, ya que la fusión no exime de sus términos.
- El modelo se creó en noviembre de 2026 y no registra descargas ni valoraciones en Hugging Face; no hay evidencia de uso en producción.
- La evaluación se realizó cargando los pesos en vLLM como fp16, no en bf16, lo que puede introducir diferencias menores respecto al despliegue en transformers.
- El pipeline declarado es `image-text-to-text`, pero la mayor parte de los donantes son solo texto; el rendimiento multimodal no está documentado y podría ser limitado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/CloudGoat/Baphomet-1.1-4B
- Versión anterior: https://huggingface.co/CloudGoat/Baphomet-1.0-4B
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Donante Agents-A1-4B: https://huggingface.co/InternScience/Agents-A1-4B
- Donante DeepSeek-V4-Pro-Qwen3.5-4B: https://huggingface.co/Jackrong/DeepSeek-V4-Pro-Qwen3.5-4B
- Donante Qwen3.8-4B-Distill: https://huggingface.co/empero-ai/Qwen3.8-4B-Distill
- Donante Qwopus3.5-4B-Coder: https://huggingface.co/Jackrong/Qwopus3.5-4B-Coder
- Donante Qwopus3.5-4B-v3: https://huggingface.co/Jackrong/Qwopus3.5-4B-v3
- Donante AREX-Turbo: https://huggingface.co/BAAI/AREX-Turbo
- Donante NeoHorse-1-4B: https://huggingface.co/TokenRhythm/NeoHorse-1-4B
- Donante tmax-4b: https://huggingface.co/allenai/tmax-4b
- Repositorio EvoGM: https://github.com/JiangTao97/evogm
- Paper EvoGM (arXiv:2511.21437): https://arxiv.org/abs/2511.21437
