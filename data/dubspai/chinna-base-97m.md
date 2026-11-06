# dubspai/chinna-base-97m

## Resumen

Chinna-Base (97M) es un modelo de lenguaje decoder-only de 97.241.856 parámetros entrenado desde inicialización aleatoria por Aravind Raghunathan (usuario `dubspai`), sin cargar pesos preentrenados en ningún momento. Está especializado en tamil (`ta`) y se distribuye como checkpoint de chat tras un ajuste por instrucciones (`base-001-sft-003`). Su arquitectura sigue el bloque estilo Llama: pre-RMSNorm, RoPE, SwiGLU, sin sesgos y con embeddings atados, en 12 capas con `d_model` 768, 12 cabezas, `d_ff` 2048 y una ventana de contexto de 1024 tokens.

El modelo resuelve el problema de disponer de un LM tamil-first de tamano reducido y entrenado de forma independiente, pensado para experimentación e investigación más que para producción. Su corpus de preentrenamiento (corpus v2) combina Wikipedia tamil (10%), Sangraha (55%) y CulturaX (35%), con 1.600 millones de tokens en una única ejecución. El ajuste por instrucciones se realizó sobre un subconjunto tamil del Aya Dataset, aritmética sintética paso a paso, QA de Wikipedia tamil, QA con evidencia recuperada y ejemplos de abstención.

Es relevante ahora por su enfoque de recuperación aumentada: el código de inferencia del proyecto incorpora BM25 sobre Wikipedia tamil y Wikidata, de modo que el modelo puede responder con evidencia externa, algo que mejora notablemente su fiabilidad frente al conocimiento en memoria. El autor lo etiqueta explícitamente como modelo de investigación experimental con respuestas a menudo factualmente incorrectas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, bloque estilo Llama: pre-RMSNorm, RoPE, SwiGLU, sin sesgos, embeddings atados |
| Parámetros totales | 97.241.856 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 1024 tokens |
| Tipos de cuantización | f16 (GGUF); pesos PyTorch en fp32 |
| Idiomas soportados | tamil (`ta`) |
| Licencia | CC BY-SA 4.0 (pesos); código Apache-2.0 |
| Formato de pesos | safetensors (fp32), GGUF (f16), tokenizer SentencePiece |

## Arquitectura y entrenamiento

El modelo es un Transformer decoder-only con 12 capas, dimensión de modelo 768, 12 cabezas de atención, dimensión de feed-forward 2048 y contexto de 1024 tokens. Emplea normalización RMS previa a cada subcapa, embeddings rotatorios (RoPE), activación SwiGLU, ausencia de términos de sesgo y atado de embeddings de entrada y salida. El tokenizador `chinna-sp-v1` es un SentencePiece BPE de 16.000 piezas con fallback de bytes (sha256 `63daa5bedea9`).

El preentrenamiento se hizo desde inicialización aleatoria sobre el corpus v2 (Wikipedia tamil 10%, Sangraha 55%, CulturaX 35%), con 1.600 millones de tokens en una sola ejecución. La pérdida de validación reportada es de 2,9657 nats/token. El ajuste por instrucciones usó un subconjunto tamil del Aya Dataset, aritmética sintética paso a paso, QA de Wikipedia tamil, QA fundamentado sobre frases de Wikipedia recuperadas y líneas de hechos de Wikidata, además de ejemplos de abstención. No se documenta uso de RLHF ni DPO.

## Capacidades

- Generación de texto en tamil con registro enciclopédico y web.
- Aritmética en formatos entrenados: suma, resta, comparación y problemas verbales con alta exactitud; multiplicación y división limitadas a tablas memorizadas del 1 al 12.
- QA sobre líneas de hechos de Wikidata y QA fundamentado sobre evidencia de Wikipedia tamil recuperada.
- Abstención ante preguntas sin evidencia (ejemplos incluidos en el ajuste).
- Formato de prompt de un solo turno: `பயனர்: <pregunta>` seguido de `சின்னா:`.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, visión, audio ni modo de razonamiento extendido.

## Casos de uso

- Investigación sobre modelos lingüísticos de bajo recurso: sirve como base reproducible para estudiar el efecto del tamano y la composición del corpus en tamil, al estar entrenado desde cero y publicar pérdida de validación.
- QA fundamentado con recuperación: el código de inferencia del proyecto integra BM25 sobre Wikipedia tamil y Wikidata, permitiendo responder con fuentes mostradas; adecuado para prototipos de asistentes documentales en tamil.
- Extracción de hechos estructurados: con líneas de Wikidata como contexto, alcanza 77,3% de acierto en el conjunto de evaluación, útil para tareas de normalización de entidades en tamil.
- Aritmética educativa básica: con penalización de repetición 1.0, resuelve sumas, restas y comparaciones con exactitud cercana al 100%, aprovechable en herramientas de práctica de cálculo en tamil.
- Despliegue ligero en local: el GGUF f16 ocupa aproximadamente 0,6 GB, por lo que cabe en CPU y en GPU de consumo para demos y pruebas de integración con Ollama o llama.cpp.
- Generación de texto enciclopédico de borrador: puede producir texto tamil con apariencia fluida para revisión humana, siempre que se validen los hechos con fuentes externas.
- Evaluación de pipelines de recuperación en tamil: al separar el modelo del recuperador, permite medir el impacto de la calidad de la evidencia en las respuestas (55,0% en dev y 27,5% en held-out con evidencia web).

## Benchmarks y rendimiento

| Prueba | Resultado |
|---|---|
| Coincidencia exacta en aritmética (300 problemas reservados) | 89,3% |
| — suma / resta / comparación / problemas verbales | 100% / 98% / 97% / 97%–100% |
| — multiplicación / división | 76% / 33% |
| QA sobre líneas de hechos de Wikidata (198 elementos reservados) | 77,3% |
| QA fundamentado sobre evidencia de Wikipedia local recuperada (held-out) | 75,8% |
| Respuestas con evidencia web (Wikidata + Wikipedia tamil en vivo): dev 40 / held-out 40 | 55,0% / 27,5% |
| Conocimiento general sin evidencia: dev 40 / held-out 40 | 40,0% / 37,5% |
| Pérdida de validación del preentrenamiento (corpus v2, nats/token) | 2,9657 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,6 GB en f16; en fp32, alrededor de 0,4 GB solo de pesos más overhead de activaciones, muy por debajo de 1 GB en cualquier caso.
- GPU recomendadas: cualquier GPU con al menos 2 GB de memoria; no requiere A100 ni H100. Funciona en RTX 4090, RTX 3060 y GPUs integradas.
- Cabe en GPU de consumo: sí, en cualquier modelo con 2 GB o más de VRAM; también en CPU.
- Opciones de despliegue: llama.cpp (`llama-cli`), Ollama (mediante el `Modelfile` incluido) y PyTorch con `sentencepiece`, `safetensors`, `pydantic` y `pyyaml`.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Chinna-Base 97M | 97,2 M | 1024 | tamil | CC BY-SA 4.0 | safetensors, GGUF |
| Chinna-Small 40M | no disponible | no disponible | tamil | no disponible | no disponible |
| Alternativas tamil de tamano similar | no disponible | no disponible | no disponible | no disponible | no disponible |

La información proporcionada solo menciona `chinna-small-40m` como otro tamano del mismo proyecto, sin especificaciones detalladas. No se dispone de datos de benchmarks comparativos con otros modelos tamil de tamano similar.

## Limitaciones y advertencias

- Modelo pequeno: produce tamil con apariencia fluida pero con errores factuales frecuentes y detalles inventados; las respuestas abiertas (ensayos, consejos, explicaciones) son en gran medida inventadas.
- Los hechos en memoria (closed-book) no son fiables: 40,0% en dev y 37,5% en held-out. Debe usarse con evidencia recuperada y mostrar las fuentes.
- La aritmética solo es fiable en los formatos entrenados; multiplicación y división dependen de tablas memorizadas del 1 al 12, y la división es débil en este checkpoint (a menudo escribe la tabla correctamente pero da un cociente una unidad por debajo).
- Registro limitado: predominantemente tamil enciclopédico y web; el tamil coloquial y conversacional es débil.
- Sesgos heredados de Wikipedia y del texto web (temas, regiones, género).
- Licencia CC BY-SA 4.0 en los pesos: exige atribución (Aravind Raghunathan, Chinna y las fuentes de datos) y liberar adaptaciones bajo la misma licencia; el código es Apache-2.0.
- El autor lo declara modelo de investigación experimental; no debe usarse donde la precisión sea crítica.

## Enlaces

- Hugging Face: https://huggingface.co/dubspai/chinna-base-97m
- Web del autor: https://aravind-r.com
- GitHub: https://github.com/ai-aravind
- LinkedIn: https://linkedin.com/in/aravindai
- X / Twitter: https://x.com/AI_Aravind
- YouTube: https://youtube.com/@AravindAI
- Instagram: https://instagram.com/aravind.aiml
- Facebook: https://www.facebook.com/profile.php?id=61572024542558
- Calendly: https://calendly.com/aravind-ai
