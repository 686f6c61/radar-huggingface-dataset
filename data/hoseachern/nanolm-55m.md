# HoseaChern/nanoLM-55M

## Resumen

nanoLM-55M es un modelo de lenguaje causal (decoder-only) de 55.326.720 parámetros entrenado desde cero por HoseaChern, un autor individual, sobre un corpus en chino. Se trata de un experimento de escala reducida cuyo interés principal es metodológico: demuestra que es posible preentrenar un transformer tipo GPT funcional en una única GPU de consumo, concretamente una RTX 4060 Laptop con 8 GB de VRAM, en 15,04 horas y procesando 1.500 millones de tokens.

La arquitectura es un transformer denso convencional de 12 capas y anchura 512, con FFN SwiGLU de dimensión oculta 1408, 8 cabezas de atención de dimensión 64, normalización Pre-LN RMSNorm, embeddings rotatorios RoPE con base 10000, QK-Norm y embeddings de entrada/salida atados. El contexto está fijado en 1024 tokens y el vocabulario es de 32.768 entradas mediante SentencePiece BPE.

Su relevancia es acotada: no compite con modelos de producción, sino que sirve como referencia reproducible de un pipeline completo de preentrenamiento de bajo coste, con informe técnico publicado, código de entrenamiento y evaluación de transferencia en tareas de clasificación en chino (THUCNews y ChnSentiCorp). Es adecuado para experimentación educativa, ablaciones arquitectónicas y como línea base de modelos en chino de tamaño muy reducido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (GPT), denso, Pre-LN RMSNorm, RoPE base 10000, atención causal SDPA con QK-Norm, FFN SwiGLU |
| Parametros totales | 55.326.720 (embeddings atados) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 1024 tokens (fija, sin extrapolación validada) |
| Tipos de cuantizacion | no disponible (pesos publicados en fp32; el autor menciona bf16 para inferencia en GPU) |
| Idiomas soportados | chino (zh); inglés solo de forma incidental |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (model.safetensors), más config.yaml y tokenizer.json; librería PyTorch |
| Capas / anchura | 12 / 512 |
| Cabezas / dim. de cabeza | 8 / 64 |
| FFN oculto | 1408 (SwiGLU) |
| Vocabulario | 32.768 (SentencePiece BPE) |
| Precision de pesos | fp32 |
| Tamano del repositorio | 0,2 GB |

## Arquitectura y entrenamiento

El modelo sigue el diseño GPT clásico: pila de 12 bloques transformer con atención causal multi-cabeza (8 cabezas de 64 dimensiones), QK-Norm para estabilizar los productos query-key, normalización RMSNorm en configuración Pre-LN, activación SwiGLU en la FFN con dimensión intermedia 1408 y codificación posicional rotatoria RoPE con base 10000. Los embeddings de entrada y la proyección de salida están atados, por lo que el checkpoint solo almacena `token_embedding.weight` y la carga debe hacerse con `strict=False`. La atención usa SDPA causal y el sampler incorpora caché KV por defecto.

El preentrenamiento se realizó sobre el corpus tinybrain (split nano, alojado en ModelScope), con 986,7 millones de tokens de entrenamiento disponibles y 1.500 millones de tokens vistos en 15.274 pasos, lo que supone aproximadamente 1,5 épocas. El batch efectivo fue de 98.208 tokens por paso, con optimizador AdamW (betas 0,9 y 0,95, weight decay 0,1) y un schedule WSD con pico de learning rate 1e-3, 300 pasos de warmup y un 20 % de decaimiento. El entrenamiento se ejecutó en bf16 sobre una RTX 4060 Laptop de 8 GB durante 15,04 horas, alcanzando 50,6 K tokens/s con `torch.compile`. No se documenta ninguna fase de RLHF, DPO o SFT; el artefacto publicado son los pesos de preentrenamiento puros.

## Capacidades

- Generación de texto autoregresiva en chino con fluidez local (frases y párrafos cortos coherentes).
- Modelado de lenguaje causal: útil como base para fine-tuning supervisado.
- Clasificación de texto tras fine-tuning completo: el informe reporta macro-F1 de 0,9381 en THUCNews (14 clases) y 0,9150 en ChnSentiCorp.
- Extracción de representaciones para probing lineal y adaptación con LoRA (evaluados como líneas base en el informe).
- Tokenización BPE específica para chino con vocabulario de 32.768 entradas.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso explícito, visión, audio ni modo "thinking".
- Capacidad multilingüe prácticamente nula: el tokenizador y el corpus son chino-first.

## Casos de uso

- Línea base reproducible para investigación en preentrenamiento: sirve para comparar variantes arquitectónicas (QK-Norm sí/no, SwiGLU frente a GELU, RoPE frente a posicional aprendido) con un coste de cómputo de una sola GPU de portátil.
- Fine-tuning de clasificación de texto en chino: con un conjunto etiquetado pequeño, el modelo alcanza F1 superior a 0,91 en tareas de sentimiento, lo que lo hace útil para prototipos de moderación o categorización de reseñas.
- Material docente: el repositorio incluye código de entrenamiento, evaluación y muestreo, lo que permite recorrer el ciclo completo de un LLM desde cero en un curso práctico.
- Generación de texto de relleno o completion local en aplicaciones de demostración en chino, siempre que las salidas sean cortas (decenas de tokens) para evitar deriva de tema.
- Experimentación con técnicas de eficiencia (cuantización, `torch.compile`, caché KV) en un modelo lo bastante pequeño como para iterar en minutos.
- Base para estudios de destilación: al ser un modelo de 55 M, puede actuar como alumno en experimentos de destilación desde modelos mayores en chino.
- Pruebas de pipelines de despliegue ligero en CPU, dado que el checkpoint en fp32 ocupa unos 0,2 GB y la inferencia no requiere GPU.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Pérdida de validación | 2,9349 nats/token |
| Bits por token | 4,2342 |
| Entropía unigrama del corpus (H1) | 11,8063 bit/token |
| THUCNews 14 clases, macro-F1 (fine-tuning completo) | 0,9381 ± 0,0009 |
| ChnSentiCorp, macro-F1 (fine-tuning completo) | 0,9150 ± 0,0071 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, C-Eval) en la información disponible. Las cifras de clasificación son medias sobre tres semillas y corresponden a fine-tuning completo; el informe incluye además líneas base de inicialización aleatoria, probing lineal y LoRA, pero sus valores no se detallan en la información proporcionada.

## Requisitos de hardware

- VRAM para inferencia en fp32: aproximadamente 0,25-0,3 GB para pesos, más caché KV y activaciones; en la práctica cabe en cualquier GPU con 2 GB o más.
- VRAM en bf16: en torno a 0,15 GB para pesos; el autor indica llamar a `model.to("cuda").to(torch.bfloat16)` tras la carga.
- GPU recomendadas: cualquiera moderna; el propio modelo se entrenó en una RTX 4060 Laptop de 8 GB. Para servir varias peticiones concurrentes son suficientes tarjetas de gama baja (GTX 1650, RTX 3050) o incluso A100/H100 si se busca throughput agregado.
- Cabe holgadamente en GPU de consumo; también funciona en CPU, como muestra el ejemplo de la model card.
- Opciones de despliegue: el autor proporciona código propio basado en PyTorch y safetensors (`nanolm.models.gpt.GPT`, `nanolm.eval.sample.generate`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, ni se publican pesos en GGUF.
- Throughput de entrenamiento documentado: 50,6 K tokens/s con `torch.compile` en una RTX 4060 Laptop. No se publican latencias ni throughput de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idioma | Licencia | Notas |
|---|---|---|---|---|---|
| nanoLM-55M | 55,3 M | 1024 | zh | Apache-2.0 | Entrenado desde cero en una GPU de 8 GB; sin benchmarks estándar publicados |
| Qwen2.5-0.5B | 0,49 B | 32.768 | multilingüe | Apache-2.0 | Modelo de producción con RLHF y benchmarks publicados; requiere bastante más cómputo |
| SmolLM2-135M | 135 M | 8192 | inglés principalmente | Apache-2.0 | Referencia de preentrenamiento pequeño con evaluación publicada; no orientado a chino |
| GPT-2 small | 124 M | 1024 | inglés | MIT | Línea base histórica de escala comparable; sin soporte de chino |

La comparación con modelos de la misma categoría (menos de 200 M de parámetros) es desfavorable en cobertura funcional: nanoLM-55M no publica resultados en benchmarks estándar ni soporte multilingüe, y su contexto es de 1024 tokens. Su ventaja es la reproducibilidad completa del pipeline y el coste de entrenamiento (15 horas en hardware de consumo).

## Limitaciones y advertencias

- Con 55 M de parámetros y 1.500 millones de tokens, la fluidez es solo local; son esperables deriva de tema y repeticiones en generaciones largas.
- Contexto fijo de 1024 tokens; no se ha validado extrapolación de longitud, por lo que superar esa ventana produce degradación no controlada.
- Tokenizador y corpus son chino-first; la calidad en inglés es incidental y no debe asumirse para otros idiomas.
- Los resultados de clasificación provienen de tareas relativamente sencillas (THUCNews, ChnSentiCorp) y no deben generalizarse a tareas más difíciles.
- Riesgo de alucinación y de generar contenido factualmente incorrecto: el modelo no ha pasado por RLHF ni por filtrado de seguridad documentado.
- No se documentan evaluaciones de sesgo; al entrenarse sobre un corpus web chino, es probable que herede sesgos del mismo.
- La licencia del modelo es Apache-2.0, pero el corpus de preentrenamiento (tinybrain) y los conjuntos de clasificación conservan sus licencias originales, lo que puede condicionar el uso comercial derivado de esos datos.
- La carga de pesos requiere `strict=False` por el atado de embeddings; un uso incorrecto puede dejar `lm_head` sin atar y degradar la generación.
- Proyecto de autor individual, con 0 descargas y 0 likes en el momento de la consulta: no hay garantía de mantenimiento ni soporte.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/HoseaChern/nanoLM-55M
- Repositorio de código: https://github.com/HoseaChern/nanoLM-55M
- Informe técnico (PDF): https://github.com/HoseaChern/nanoLM-55M/blob/main/docs/report/report.pdf
- Corpus tinybrain (ModelScope, split nano): no disponible (enlace directo no incluido en la información proporcionada)
