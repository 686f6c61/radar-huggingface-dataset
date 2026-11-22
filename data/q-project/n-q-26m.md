# q-project/N-Q-26M

## Resumen

N-Q-26M es un modelo base de generación de texto de tipo causal-LM desarrollado por q-project, orientado a ruso e inglés y diseñado como el escalón más pequeño de la familia N-Q, una escalera de modelos pequeños al estilo MiniMind entrenados desde cero en una única GPU V100 de 16 GB. Se presenta como un "mini Qwen3.8-Flash-Next": combina atención lineal Gated DeltaNet intercalada 3:1 con atención completa con puerta, un Gated Residual de 4 flujos y un embedding de n-gramas con hashing. El modelo almacena 46.452.571 parámetros según safetensors (29,7M de backbone más 16,8M de tabla de n-gramas).

La relevancia del modelo es doble. Por un lado, demuestra que es posible preentrenar desde cero un modelo bilingüe RU/EN funcional en 6,6 horas sobre hardware de consumo profesional (V100), con 2.000 millones de tokens y una velocidad de 85.000 tokens/s. Por otro, sirve como pieza de investigación reproducible: el autor documenta una ablación controlada frente al diseño ternario Q-164M y publica el checkpoint base junto a una variante Chat.

Es importante subrayar que se trata de un lanzamiento de investigación, no de un producto. El modelo es de continuación de texto puro: produce ruso e inglés gramaticales con tono seguro, pero inventa hechos con frecuencia y no tiene ajuste de seguridad. Para diálogo y llamadas a herramientas exactas, el autor remite explícitamente a N-Q-26M-Chat.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido: Gated DeltaNet (atención lineal) intercalada 3:1 con atención completa con puerta; Gated Residual de 4 flujos; embedding de n-gramas con hashing (PLE) |
| Parametros totales | 46.452.571 (29,7M backbone + 16,8M tabla de n-gramas) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (tokenizador de 8.256 tokens; el contexto máximo no se especifica en la información proporcionada) |
| Tipos de cuantizacion | no disponible (pesos en fp16 para matrices y fp32 para tensores 1-D en el formato qpack; no se documentan cuantizaciones GGUF/AWQ/GPTQ) |
| Idiomas soportados | ruso (ru), inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors y QPACK1 (`model.qpack`, contenedor empaquetado de 89 MiB frente a 177 MiB en safetensors) |

## Arquitectura y entrenamiento

El modelo consta de 8 capas con patrón `LLLA` repetido dos veces: tres capas de Gated DeltaNet (3 cabezas de clave, 6 de valor, dimensión 64, convolución k=4) seguidas de una capa de atención completa con puerta (8 cabezas de consulta, 2 de clave/valor, dimensión 64, QK-norm centrada en cero, RoPE parcial al 25% con θ=1e6 y puerta de salida sigmoide). La dimensión oculta es 512, con SwiGLU 512→704→512, Gated Residual de 4 flujos, RMSNorm centrada en cero y cabeza de salida no atada. Tras la capa 2 se inserta un embedding de 3-gramas con hashing (PLE) de 16,8M parámetros en tablas de tamaño primo.

El tokenizador es un BPE a nivel de byte de 8.256 tokens para RU+EN. El layout de tokens reserva los ids 0–8191 para texto (0 `<pad>`, 1 `<bos>`, 2 `<eos>`) y 8192–8255 para tokens de control (`<USER>`, `<MODEL>`, `<EOT>`, `<THINK>`, `<ETHINK>`, `<CALC>`, `<EQ>`, `<ECALC>`, `<NEED>`, `<QUOTE>`, `<SYSTEM>` y reservados `<R11>`…`<R63>`). El preentrenamiento usó 2.000 millones de tokens en 6,6 horas (30.517 pasos, 64×1024 tokens por paso, schedule WSD, Muon + AdamW, `torch.compile`, 85k tokens/s). Un 5% de las filas fueron diálogos y filas de circuito `<CALC>` desde el primer paso, lo que explica que incluso el modelo base conozca los formatos de chat y de herramienta.

Los datos de entrenamiento provienen de FineWeb-Edu (inglés), Cultura-Ru-Edu y Wikipedia en ruso, más filas de diálogo de SmolTalk, GrandMaster-PRO-MAX, saiga_scored y un corpus propio de circuitos `<CALC>`. El modelo incorpora su propio método `generate()` que gestiona el estado recurrente de Gated DeltaNet y la caché KV; si se pasa `tokenizer=tok` se activan los circuitos exactos `<CALC>` al promptear en formato chat.

## Capacidades

- Generación de texto causal en ruso e inglés con gramática correcta y tono seguro.
- Continuación de texto libre; no es un modelo de instrucciones más allá del 5% de filas de diálogo vistas en preentrenamiento.
- Conocimiento de los formatos de chat y de herramienta (`<USER>`, `<MODEL>`, `<EOT>`, `<THINK>`, `<CALC>`, etc.) gracias a las filas de diálogo y circuito incluidas en el preentrenamiento.
- Soporte de circuitos exactos `<CALC>` para cálculo cuando se promptea en formato chat con el tokenizador correcto.
- Capacidad bilingüe RU/EN; no se documentan otros idiomas.
- No se documentan capacidades de visión, audio, tool calling genérico ni razonamiento multi-paso más allá de los formatos aprendidos.
- No dispone de modo "thinking" funcional documentado en el modelo base (el token `<THINK>` existe en el vocabulario, pero su uso no se valida en la model card).

## Casos de uso

- Investigación en arquitecturas híbridas de atención: el modelo permite reproducir y estudiar la combinación Gated DeltaNet + atención completa con puerta en un presupuesto de 6,6 horas de V100, útil para ablaciones académicas sobre atención lineal.
- Experimentación con embeddings de n-gramas con hashing: sirve para evaluar el impacto del módulo PLE de 16,8M parámetros en modelos pequeños, comparando con variantes sin él.
- Generación de texto en ruso para tareas de aumento de datos: el modelo produce ruso gramatical y puede usarse para generar corpus sintéticos de bajo coste en dominios acotados, siempre con revisión humana.
- Prototipado de pipelines de continuación de texto bilingüe en entornos con recursos limitados: cabe en una V100 de 16 GB y en GPUs de consumo con suficiente VRAM, lo que permite iterar localmente.
- Educación y docencia: adecuado para demostrar el ciclo completo de preentrenamiento desde cero, desde la tokenización hasta el empaquetado QPACK, en cursos de IA.
- Base para fine-tuning específico de dominio: al ser un modelo base Apache-2.0 con tokenizador RU/EN, puede ajustarse para clasificación, extracción o generación en nichos concretos con datasets pequeños.
- Evaluación de formatos de chat y circuitos: permite estudiar cómo un modelo base aprende formatos estructurados (`<CALC>`, `<EQ>`) con solo un 5% de filas de diálogo en el preentrenamiento.

## Benchmarks y rendimiento

| Conjunto de evaluación (held-out) | Loss | Perplejidad (tokenizador propio) |
|---|---|---|
| FineWeb-Edu (EN) | 2,381 | 10,8 |
| Cultura-Ru-Edu (RU) | 2,651 | 14,2 |
| Wikipedia en ruso | 2,323 | 10,2 |

El autor indica que las perplejidades son por token de su tokenizador de 8.256 tokens y no son comparables con modelos de otros tokenizadores. Como referencia de escala, la misma arquitectura tras 0,5B tokens alcanzó una loss media de 2,616, y con 2,0B tokens baja a 2,452. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint safetensors ocupa 177 MiB y el QPACK1 89 MiB; con pesos fp16 el modelo completo cabe holgadamente en menos de 1 GB de VRAM, más el estado recurrente y la caché KV.
- GPU recomendadas: el autor lo entrenó en una V100 de 16 GB; para inferencia es suficiente cualquier GPU con al menos 2 GB de VRAM.
- Cabe en GPU de consumo: sí, en GTX 1650, RTX 3050, RTX 4060 y superiores; también en CPU para pruebas.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` (método `generate()` propio); el formato QPACK1 se carga mediante `AutoModelForCausalLM.from_pretrained` y admite `python qpack.py --selftest model.qpack` (imprime `SELFTEST 5/5`). No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 85.000 tokens/s durante el entrenamiento en V100; no se publican cifras de latencia o throughput de inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| N-Q-26M | 46,5M (29,7M backbone + 16,8M n-gramas) | no disponible | ru, en | Apache-2.0 | Híbrido Gated DeltaNet + atención completa; base, sin ajuste de instrucciones |
| N-Q-26M-Chat | no disponible | no disponible | ru, en | no disponible | Variante chat del mismo autor, recomendada para diálogo y tool calls |
| Q-164M | no disponible | no disponible | no disponible | no disponible | Diseño ternario previo del mismo proyecto, descartado por ablación |
| MiniMind | no disponible | no disponible | no disponible | no disponible | Referencia metodológica citada por el autor para la escalera de modelos pequeños |

No se dispone de datos suficientes en la información proporcionada para comparar rendimiento numérico con alternativas de la misma categoría.

## Limitaciones y advertencias

- Los hechos son frecuentemente incorrectos y el conocimiento general es limitado; el propio autor lo advierte en la model card.
- Genera repeticiones bajo decodificación greedy.
- No tiene ajuste de seguridad (no safety tuning).
- Es un modelo base: no sigue instrucciones más allá del 5% de filas de diálogo vistas en preentrenamiento.
- Uso previsto: investigación y educación únicamente.
- La licencia del código y los pesos es Apache-2.0, pero los datos de entrenamiento conservan sus propios términos: FineWeb-Edu (ODC-By 1.0), Wikipedia en ruso 20231101.ru (CC BY-SA / GFDL) y filas de diálogo de SmolTalk, GrandMaster-PRO-MAX, saiga_scored y el corpus propio `<CALC>`; conviene revisarlos antes de un uso comercial.
- Las perplejidades publicadas no son comparables con las de modelos que usan otros tokenizadores.
- No se documenta la longitud máxima de contexto soportada, lo que limita su uso en tareas de contexto largo.
- El soporte de tool calling y de circuitos exactos requiere promptear en formato chat con el tokenizador correcto; no está validado como capacidad general.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/q-project/N-Q-26M
- Variante Chat: https://huggingface.co/q-project/N-Q-26M-Chat
- Referencia metodológica MiniMind: https://jingyaogong.github.io/minimind/
- FineWeb-Edu: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Cultura-Ru-Edu: https://huggingface.co/datasets/deepvk/cultura_ru_edu
- Wikipedia en ruso: https://huggingface.co/datasets/wikimedia/wikipedia
