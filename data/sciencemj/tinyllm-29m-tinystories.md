# sciencemj/tinyllm-29m-tinystories

## Resumen

tinyLLM 29M es un modelo de lenguaje pequeño (SLM) de 29,58 millones de parámetros, desarrollado por sciencemj y entrenado exclusivamente sobre el corpus TinyStories, un dataset de historias cortas en inglés diseñado para evaluar hasta qué punto modelos muy pequeños pueden generar texto coherente. El modelo es un transformer decoder-only con 8 capas, 8 cabezas de atención y una dimensión de modelo de 512, con una ventana de contexto de 512 tokens. Su principal valor es demostrar que con una cantidad mínima de recursos de cómputo (3,06 horas en una RTX 3060 Ti) se puede obtener un generador de narrativa con gramática y puntuación correctas, aunque sin capacidades conversacionales ni factuales.

Este lanzamiento es relevante en el contexto actual de investigación sobre eficiencia y modelos de pequeño tamaño, ya que ofrece una alternativa reproducible y de bajo coste para estudiar los límites de los SLM. El modelo solo genera texto continuando una historia; no responde preguntas ni mantiene diálogos. Para uso conversacional, el autor publica una variante separada (tinyllm-29m-chat). El peso se distribuye bajo licencia CDLA-Sharing-1.0, que impone restricciones mínimas al uso de resultados derivados.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (implementado con `nn.TransformerEncoderLayer`, 8 capas, 8 cabezas, dim_feedforward 2048, GELU, norm_first, RMSNorm) |
| Parametros totales | 29.577.728 |
| Parametros activos | no aplicable (modelo denso, no MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin cuantizaciones publicadas) |
| Idiomas soportados | ingles (unicamente) |
| Licencia | CDLA-Sharing-1.0 |
| Formato de pesos | safetensors (pytorch) |

## Arquitectura y entrenamiento

El modelo utiliza una arquitectura transformer decoder-only construida con `nn.TransformerEncoderLayer` de PyTorch. El autor explica que no usa `TransformerDecoderLayer` porque esta capa exige un argumento `memory` para cross-attention, que no es necesario en un modelo autoregresivo. La estructura es: embedding de tokens (vocabulario 8000) + embedding de posiciones (512), seguido de 8 capas de transformer con 8 cabezas, feed-forward de 2048 y normalización RMSNorm, y una capa lineal final con tying de pesos con el embedding de tokens. El tokenizador es un byte-level BPE de 8000 tokens entrenado sobre la unión de TinyStories y DailyDialog; es imprescindible usar el `tokenizer.json` incluido en el repositorio, ya que cualquier otro tokenizador produce resultados incorrectos.

El entrenamiento consistió en una fase única de preentrenamiento (el autor indica "1단계 사전학습만 거친 가중치", es decir, solo preentrenamiento, sin SFT) de 3,06 horas en una RTX 3060 Ti, seguida de un ajuste fino supervisado (SFT) de 2,4 minutos. La pérdida de validación alcanzada es de 1,3202 nats/token, lo que corresponde a una perplexity de 3,744 y 0,4659 bits/char. El autor señala que la brecha entre train y validación es de 0,03, lo que indica que el modelo no memoriza el corpus.

## Capacidades

- Generacion de texto narrativo en ingles: es capaz de continuar historias con gramatica, puntuacion, uso de comillas en dialogos, division en parrafos y mantenimiento de nombres de personajes.
- Coherencia causal basica: las historias generadas mantienen conexiones causales simples entre eventos.
- Generacion autoregresiva con parametros de temperatura y top-k (el ejemplo usa temperature=0.6 y top_k=20).
- No soporta tool calling, ni function calling, ni razonamiento multi-paso, ni vision, ni audio.
- No es un modelo conversacional: si se le da una pregunta, la trata como la primera frase de una historia y continua escribiendo.
- Unicamente ingles; no hay capacidades multilingues.

## Casos de uso

- Investigacion academica sobre SLM: el modelo sirve como base para estudiar el comportamiento de modelos de menos de 30M de parametros en tareas de generacion de texto, comparando con otros modelos entrenados en TinyStories.
- Prototipado rapido de generacion de narrativa: se puede integrar en demos o experimentos que requieran generar micro-relatos coherentes sin necesidad de infraestructura de GPU potente.
- Educacion y aprendizaje de arquitecturas transformer: al ser un modelo pequeno y con codigo de entrenamiento publico, es util para ensenar conceptos de preentrenamiento, tokenizacion y generacion autoregresiva en cursos de NLP.
- Generacion de datos sinteticos para entrenamiento de modelos mas grandes: las historias generadas pueden usarse como aumentacion de datos en tareas de comprension lectora o generacion de texto en ingles.
- Evaluacion de metricas de calidad de texto: al conocerse la val loss y perplexity, se puede usar como punto de referencia para probar metricas automaticas de coherencia y fluidez.
- Experimentos de cuantizacion y compresion: con solo 29M de parametros, es un candidato ideal para probar tecnicas de cuantizacion (GPTQ, AWQ, GGUF) en un entorno controlado y de bajo coste.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El unico dato de rendimiento reportado es la perdida de validacion en TinyStories:

| Metrica | Valor |
|---|---|
| Val loss | 1,3202 nats/token |
| Perplexity | 3,744 |
| Bits/char | 0,4659 |

Estos valores indican una buena capacidad de modelado del corpus TinyStories, pero no son comparables con benchmarks generales de razonamiento o conocimiento.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 29,58M de parametros. En fp32 ocupa aproximadamente 118 MB, en fp16 unos 59 MB y en int8 unos 30 MB. Cabe en cualquier GPU moderna, incluso en iGPU o en CPU.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM es suficiente. Una RTX 3060 Ti (la usada para entrenar) es mas que suficiente para inferencia.
- Si cabe en consumer GPU: si, absolutamente. Tambien funciona en CPU (con llama.cpp o directamente con PyTorch) con latencia de milisegundos por token.
- Opciones de despliegue: el repositorio proporciona un script propio (`modeling_tinyllm.py`) que no depende de `transformers`. Se puede cargar con PyTorch puro. No se mencionan integraciones con vLLM, Ollama o TGI, pero al ser un modelo estandar de PyTorch, podria adaptarse.
- Latencia y throughput: no se han publicado mediciones, pero dada su tamano, se espera una generacion de cientos de tokens por segundo en una GPU moderna.

## Comparativa con modelos similares

No se dispone de datos comparativos publicados con otros modelos de la misma categoria (SLM entrenados en TinyStories). Como referencia cualitativa:

| Modelo | Parametros | Contexto | Entrenamiento | Licencia |
|---|---|---|---|---|
| tinyLLM 29M (este) | 29,58M | 512 | TinyStories (solo preentrenamiento) | CDLA-Sharing-1.0 |
| TinyStories original (Eldan & Li) | 1M - 28M | variable | TinyStories | MIT (paper) |
| GPT-2 small (referencia) | 124M | 1024 | WebText | MIT |

La comparacion cuantitativa no es posible por falta de benchmarks comunes. El modelo tinyLLM 29M destaca por su bajo coste de entrenamiento y su licencia permisiva, pero carece de las capacidades conversacionales de modelos como GPT-2 (que tampoco es conversacional de forma nativa).

## Limitaciones y advertencias

- El modelo solo genera continuaciones de historias; no responde preguntas ni mantiene conversaciones. Si se le da una pregunta, la interpreta como inicio de una historia.
- No tiene memoria entre turnos ni capacidad de razonamiento logico consistente.
- Puede producir repeticiones dentro de una misma frase y fallos de coherencia logica en historias largas.
- No es fiable para obtener informacion factual; el autor advierte explicitamente que no debe usarse para ese fin.
- Solo entiende ingles; no hay soporte para otros idiomas.
- La licencia CDLA-Sharing-1.0 permite el uso sin restricciones de los resultados (segun el autor, la seccion 3.5 del acuerdo), pero conviene revisar los terminos completos antes de un uso comercial.
- El tokenizador es especifico del modelo; no es compatible con otros tokenizadores de HuggingFace, lo que limita su interoperabilidad.
- No se proporcionan cuantizaciones precalculadas ni integraciones con frameworks de despliegue estandar.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/sciencemj/tinyllm-29m-tinystories
- Codigo de entrenamiento y diseno (GitHub): https://github.com/sciencemj/tinyLLM
- Model card detallada (GitHub): https://github.com/sciencemj/tinyLLM/blob/main/MODEL_CARD.md
- Variante conversacional (chat): https://huggingface.co/sciencemj/tinyllm-29m-chat
- Paper TinyStories: https://arxiv.org/abs/2305.07759
- Dataset TinyStories: https://huggingface.co/datasets/roneneldan/TinyStories
