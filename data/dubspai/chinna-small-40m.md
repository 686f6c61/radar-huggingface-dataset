# dubspai/chinna-small-40m

## Resumen

Chinna-Small (40M) es un modelo de lenguaje decoder-only especializado en tamil, entrenado desde inicialización aleatoria por el autor independiente dubspai. No se cargaron pesos preentrenados en ningún momento del entrenamiento: el modelo se construyó íntegramente sobre una única laptop Apple M4 Max con PyTorch y el backend MPS. Esta ficha corresponde al checkpoint de chat con ajuste de instrucciones `small-003-sft-003`, distribuido en formato GGUF (f16) y safetensors (fp32).

El modelo sigue una arquitectura Transformer tipo Llama con pre-RMSNorm, RoPE, SwiGLU, sin sesgos y con embeddings atados. Cuenta con 40.315.392 parámetros, 10 capas, dimensión de modelo 512, 8 cabezas de atención, dimensión feed-forward 1408 y una ventana de contexto de 1024 tokens. El tokenizador es SentencePiece BPE con 16.000 piezas y fallback de bytes.

Su relevancia es fundamentalmente metodológica y de investigación: demuestra que es posible entrenar un modelo de lenguaje funcional en un idioma de bajos recursos como el tamil con hardware de consumo, partiendo de cero y con un presupuesto de cómputo mínimo. El propio autor lo etiqueta como modelo experimental de investigación y advierte de que sus respuestas suelen ser factualmente incorrectas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only estilo Llama (pre-RMSNorm, RoPE, SwiGLU, sin sesgos, embeddings atados) |
| Parametros totales | 40.315.392 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 1024 tokens |
| Tipos de cuantizacion | f16 (GGUF); pesos fp32 en safetensors |
| Idiomas soportados | tamil (ta) |
| Licencia | CC BY-SA 4.0 (pesos); Apache-2.0 (código) |
| Formato de pesos | safetensors (fp32), GGUF (f16) |

## Arquitectura y entrenamiento

El modelo es un Transformer decoder-only con bloque estilo Llama: normalización RMS previa a la atención y al feed-forward, embeddings rotatorios posicionales (RoPE), activación SwiGLU, ausencia de términos de sesgo y atado de embeddings entre entrada y salida. La configuración concreta es de 10 capas, `d_model` 512, 8 cabezas de atención, `d_ff` 1408 y contexto de 1024 tokens. El tokenizador `chinna-sp-v1` es un SentencePiece BPE de 16.000 piezas con fallback de bytes (sha256 `63daa5bedea9`).

El preentrenamiento se realizó en dos fases: primero sobre Tamil Wikipedia (corpus v1, 245,8 millones de tokens) y después sobre un corpus v2 que combina Wikipedia, Sangraha y CulturaX, con 1.290 millones de tokens adicionales. La pérdida de validación final sobre el corpus v2 fue de 3,1798 nats/token. El ajuste de instrucciones utilizó un subconjunto tamil del Aya Dataset, aritmética sintética paso a paso, QA extraído de Wikipedia en tamil, QA fundamentado sobre frases recuperadas de Wikipedia y líneas de hechos de Wikidata, además de ejemplos de abstención. Todo el entrenamiento se ejecutó en una Apple M4 Max con 128 GB de memoria unificada mediante PyTorch MPS.

## Capacidades

- Generación de texto en tamil con registro enciclopédico y web.
- Aritmética de suma, resta, comparación y problemas verbales en los formatos entrenados, con alta fiabilidad (90,7% de coincidencia exacta en 300 problemas retenidos).
- Multiplicación y división limitadas a las tablas memorizadas del 1 al 12.
- QA fundamentado sobre evidencia recuperada (Wikipedia local y líneas de hechos de Wikidata), con resultados del 74,5% y 77,8% respectivamente.
- Ejemplos de abstención entrenados, orientados a no responder cuando falta evidencia.
- Conversación de un solo turno con plantilla `பயனர்: <pregunta>\nசின்னா:`.
- No dispone de tool calling ni function calling.
- No dispone de modo de razonamiento explícito (thinking mode), visión ni audio.
- Capacidades multilingües: únicamente tamil.

## Casos de uso

- Investigación sobre entrenamiento desde cero en lenguas de bajos recursos: sirve como referencia reproducible para estudiar qué rendimiento se obtiene con 40M de parámetros y cómputo de consumo en tamil, con pesos, código y scripts de evaluación publicados.
- Docencia y divulgación de arquitecturas Transformer: su tamaño reducido y su código de inferencia mínimo (`code/chinna/` y `example.py`) permiten diseccionar el flujo completo desde el tokenizador hasta la generación greedy.
- QA fundamentado sobre Wikipedia en tamil: combinado con el código de recuperación BM25 del proyecto, puede responder preguntas mostrando la fuente, lo que mitiga parcialmente su tendencia a la alucinación.
- Extracción de hechos estructurados desde Wikidata: el 77,8% de acierto en QA sobre líneas de hechos lo hace útil como componente de demostración en pipelines de pregunta-respuesta sobre datos estructurados.
- Prácticas de aritmética sintética: con penalización de repetición 1.0, resuelve sumas, restas y comparaciones fiables, adecuado para prototipos educativos de generación de problemas y soluciones paso a paso.
- Despliegue local en hardware modesto: el GGUF f16 ocupa aproximadamente 80 MB y se ejecuta con llama.cpp u Ollama en cualquier equipo, lo que facilita pruebas de concepto sin GPU.
- Base para experimentos de ajuste fino: al ser un checkpoint pequeño y con licencia CC BY-SA 4.0, puede adaptarse a dominios concretos en tamil con recursos limitados, siempre liberando las adaptaciones bajo la misma licencia.

## Benchmarks y rendimiento

| Prueba | Resultado |
|---|---|
| Coincidencia exacta en aritmética (300 problemas retenidos) | 90,7% |
| – suma / resta / comparación / problemas verbales | 100% / 97% / 97% / 97%–100% |
| – multiplicación / división | 59% / 81% |
| QA sobre líneas de hechos de Wikidata (198 elementos retenidos) | 77,8% |
| QA fundamentado sobre evidencia de Wikipedia local recuperada (conjunto retenido) | 74,5% |
| Respuestas con evidencia web (Wikidata + Wikipedia tamil en vivo), dev 40 / retenido 40 | 55,0% / 32,5% |
| Conocimiento general sin evidencia, dev 40 / retenido 40 | 35,0% / 27,5% |
| Suite de opción múltiple en tamil (46 ítems, elaborada por el autor) | 0,80 |
| Pérdida de validación de preentrenamiento (corpus v2, nats/token) | 3,1798 |

No se han publicado resultados en benchmarks estándar como MMLU, HumanEval o GSM8K en la información disponible. Los conjuntos de evaluación son pequeños en varios casos (40 preguntas), por lo que diferencias de pocos puntos equivalen a una o dos preguntas.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 80 MB en f16 (GGUF) y aproximadamente 160 MB en fp32 (safetensors), sin contar el overhead del runtime.
- GPU recomendadas: no requiere GPU; funciona en CPU. El autor entrenó en una Apple M4 Max (128 GB) con PyTorch MPS.
- Cabe holgadamente en cualquier GPU de consumo, incluida una GTX 1050 o una iGPU moderna, y en Raspberry Pi con llama.cpp.
- Opciones de despliegue: llama.cpp, Ollama (incluye `Modelfile` con plantilla de prompt, secuencia de parada y parámetros de muestreo) y PyTorch con SentencePiece y safetensors.
- Latencia y throughput: no disponibles en la información proporcionada. Por el tamaño del modelo, la generación en CPU es viable en tiempo interactivo, pero no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Chinna-Small 40M | 40,3M | 1024 | tamil | CC BY-SA 4.0 | Hugging Face (GGUF + safetensors) |
| Chinna-Base 97M | 97M (según model card) | no disponible | tamil | no disponible en la información | Hugging Face (mismo proyecto) |
| Alternativas tamil de mayor tamaño (p. ej. modelos multilingües de 1B–7B) | no disponible | no disponible | multilingüe | no disponible | no disponible |

No se dispone de datos de benchmarks comparativos con otros modelos tamil en la información proporcionada. El único comparable directo documentado es `chinna-base-97m`, la otra talla del mismo proyecto, del que no se detallan especificaciones ni resultados en esta ficha.

## Limitaciones y advertencias

- Modelo pequeño: produce tamil aparentemente fluido con errores factuales frecuentes y detalles inventados. Las respuestas abiertas (ensayos, consejos, explicaciones) son en gran medida inventadas.
- Los hechos sin evidencia son poco fiables: 27,5% de acierto en conocimiento general sin recuperación. Debe usarse con evidencia recuperada y mostrar las fuentes.
- La aritmética solo es fiable en los formatos entrenados; multiplicación y división dependen de tablas memorizadas del 1 al 12.
- Registro limitado al tamil enciclopédico y web; el tamil coloquial y conversacional es débil.
- Sesgos heredados de la cobertura de Wikipedia y del texto web (temas, regiones, género).
- No ha sido evaluado por revisores cualificados de tamil.
- Conversación limitada a un solo turno; no soporta tool calling ni agentes multi-paso.
- Ventana de contexto de solo 1024 tokens, insuficiente para documentos largos.
- Licencia CC BY-SA 4.0 en los pesos: el uso comercial es posible, pero obliga a atribución al proyecto Chinna y a las fuentes de datos, y a liberar las adaptaciones bajo la misma licencia. El código es Apache-2.0.
- Los datos de CulturaX son un dataset con acceso restringido que hereda los términos de mC4 y OSCAR; conviene revisarlos antes de un uso comercial.
- Estado experimental de investigación: no apto para producción donde la precisión sea crítica.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dubspai/chinna-small-40m
- Modelo hermano: https://huggingface.co/dubspai/chinna-base-97m
- Tamil Wikipedia: https://ta.wikipedia.org
- Sangraha (AI4Bharat): https://huggingface.co/datasets/ai4bharat/sangraha
- CulturaX: https://huggingface.co/datasets/uonlp/CulturaX
- Aya Dataset (Cohere Labs): https://huggingface.co/datasets/CohereLabs/aya_dataset
- Wikidata: https://www.wikidata.org
- SentencePiece: https://github.com/google/sentencepiece
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Ollama: https://ollama.com
