# brivangl/qwenar-0.6b-montevideo

## Resumen

`brivangl/qwenar-0.6b-montevideo` es un autoencoder de frases: comprime una oración completa en un único vector de 1024 dimensiones y reconstruye la oración original a partir de ese vector. Lo publica el usuario brivangl como parte del trabajo del equipo Montevideo de JetBrains, que aportó el cómputo, y es la variante de dominio general (`SlimPajama`) del anterior `brivangl/qwenar-0.6b`, entrenado sobre una mezcla biomédica. Sobre frases retenidas de SlimPajama reconstruye el 98,6% de los caracteres de forma exacta y supera 27 de 32 pruebas de estrés.

El interés técnico está en su construcción: en lugar de entrenar un modelo seq2seq desde cero, conecta dos checkpoints abiertos ya existentes —`perplexity-ai/pplx-embed-v1-0.6b` como encoder y `Qwen/Qwen3-0.6B-Base` como decoder— mediante un puente lineal aprendido y adapta ambos con DoRA. El conector completo son unas 30 líneas de código. El resultado totaliza 1.194.200.064 parámetros y ocupa 2,4 GB en el repositorio.

La relevancia de este checkpoint viene de la línea de trabajo de SONAR y los Large Concept Models: disponer de un embedding de frase lo bastante fiel como para poder decodificarse, de modo que el vector pueda sustituir al texto en pipelines posteriores. Es un modelo de extracción de características (feature-extraction), solo para inglés, con licencia apache-2.0 y sin descargas ni valoraciones registradas en el momento de redactar esta ficha.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Autoencoder de frases: encoder bidireccional (Qwen3 con máscara causal desactivada) + puente lineal `EmbedToPrefix` + decoder causal Qwen3 |
| Parámetros totales | 1.194.200.064 (~1,19B) |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible en la información proporcionada; el entrenamiento limitó las frases a entre 5 y 256 tokens |
| Tipos de cuantización | no disponible (no se documentan cuantizaciones publicadas; requiere `custom_code`) |
| Idiomas soportados | inglés (`en`) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Dimensión del embedding | 1024 |
| Modelos base | `perplexity-ai/pplx-embed-v1-0.6b` (encoder), `Qwen/Qwen3-0.6B-Base` (decoder) |
| Tarea declarada (pipeline) | feature-extraction |
| Tamaño del repositorio | 2,4 GB |
| Requisito de librería | `transformers>=5.15` (obligatorio) |

## Arquitectura y entrenamiento

El encoder es `perplexity-ai/pplx-embed-v1-0.6b`, un Qwen3 con la máscara causal desactivada, por lo que procesa la frase de forma bidireccional; el embedding se obtiene con mean-pooling sobre los tokens no de relleno, sin `tanh` ni INT8. El puente `EmbedToPrefix` proyecta el vector de 1024 dimensiones con `Linear(1024 → K·d_model)`, aplica GELU, reorganiza a `(B, K, d_model)` y normaliza con RMSNorm, con `K = 2`; esas dos posiciones de prefijo alimentan al decoder `Qwen/Qwen3-0.6B-Base`, adaptado con DoRA (r=32, α=64) en las proyecciones q, k, v, o, gate, up y down. El entrenamiento usa entropía cruzada autorregresiva con teacher forcing y máscara `-100` sobre el prefijo y el relleno. El encoder también se adapta (DoRA r=16, α=32) con una tasa de aprendizaje diez veces menor, no se congela.

Los datos son frases en inglés extraídas de SlimPajama: 9.169.225.926 frases (199,2B tokens Qwen3) segmentadas del corpus deduplicado, filtradas a entre 5 y 256 tokens, deduplicadas de forma exacta y reempaquetadas por longitud. La longitud media es de 21,7 tokens (mediana 19, percentil 95 de 45); en torno al 0,6% de las frases son código. El reparto por longitud es 37,4% entre 0-15 tokens, 42,8% entre 16-31, 16,2% entre 32-47, 3,0% entre 48-63, 0,4% entre 64-79 y 0,1% entre 80-95. El run vio aproximadamente el 14% del corpus (≈1.280 millones de frases, ≈27,9B tokens supervisados) y no completó una pasada. Se ejecutaron 600.000 pasos de optimizador en 8×H100 con bf16, con presupuesto de 5.888 tokens por lote y hasta 1.024 frases por lote, agrupando frases de longitud homogénea; las cifras son coherentes si ese presupuesto es por dispositivo sobre las 8 GPU (600.000 × 5.888 × 8 ≈ 28,3B tokens). Las tasas de aprendizaje son 1e-4 para el puente, 1e-4 para el LoRA del decoder y 1e-5 para el encoder, con scheduler coseno y 500 pasos de calentamiento. Se aplica ReLoRA: cada 100.001 pasos se fusionan los adaptadores en el backbone, se reinicia `lora_B`, se limpia el estado del optimizador y se reinicia el scheduler, con 5 ciclos; como la pérdida de validación da un pico tras cada fusión, los checkpoints se toman al final de cada ciclo.

## Capacidades

- Codificación de frases en inglés a vectores densos de 1024 dimensiones (`encode`), con pooling sobre tokens no de relleno.
- Decodificación del vector a texto (`decode`), es decir, reconstrucción de la frase original a partir del embedding.
- Round-trip completo (`roundtrip`) en una sola llamada, que devuelve vector y reconstrucción.
- Codificación bidireccional de la frase, al desactivar la máscara causal del encoder Qwen3.
- Extracción de características para búsqueda o agrupamiento semántico de frases, al ser un modelo de pipeline `feature-extraction`.
- Generación condicionada por prefijo mediante `generate_from_embeddings`, con decodificación greedy (`do_sample=False` en los ejemplos) y `max_new_tokens` configurable.
- Uso con dos tokenizadores independientes: el del decoder en la raíz del repositorio y el del encoder en `encoder_tokenizer/`.
- No dispone de modo conversacional ni de instrucciones, no soporta tool calling ni function calling, no implementa razonamiento multi-paso, agentes, visión, audio ni thinking mode. No es un modelo de chat: es específicamente un codificador/decodificador de frases.

## Casos de uso

- Búsqueda semántica a nivel de frase: generar embeddings de 1024 dimensiones de un corpus y consultar por similitud vectorial, aprovechando que el mismo vector puede decodificarse si hace falta inspeccionar qué representaba un resultado.
- Compresión y almacenamiento de texto: una frase se almacena como 1024 valores (~4 KB en fp32, ~2 KB en fp16) en lugar de como cadena, útil para cachés de oraciones o transmisión de contexto entre servicios.
- Deduplicación y agrupamiento de frases casi idénticas: el `encode` permite agrupar por distancia en el espacio de embeddings y verificar con `decode` si dos vectores corresponden realmente a la misma frase.
- Investigación sobre Large Concept Models y SONAR: el modelo sirve como componente listo para usar en pipelines que razonan sobre vectores de frase en lugar de tokens, dado que su embedding es decodificable y el conector es de 30 líneas.
- Medición de la fidelidad de representaciones: el round-trip permite cuantificar cuánta información de la frase sobrevive en un vector de 1024 dimensiones, comparando reconstrucción exacta frente a original sobre conjuntos propios.
- Auditoría de sistemas de embeddings: decodificar vectores de un índice permite comprobar de forma textual qué contenido se está almacenando realmente, por ejemplo en revisiones de privacidad o de sesgo de un corpus.
- Punto de partida para ajuste por dominio: la misma construcción se aplicó antes a un corpus biomédico (`brivangl/qwenar-0.6b`), por lo que es una base razonable para adaptar el puente y los adaptadores DoRA a otro dominio en inglés.
- Generación de datos sintéticos controlados por longitud: repitiendo el pipeline sobre frases de entre 5 y 256 tokens, se puede estudiar cómo degrada la reconstrucción al crecer la longitud, ya que el 80,2% del entrenamiento se concentró en frases de 31 tokens o menos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. La evaluación facilitada se limita a reconstrucción sobre frases retenidas, ejecutada con `scripts/tech_report.py`:

| Evaluación | Resultado | Conjunto |
|---|---|---|
| Reconstrucción exacta carácter a carácter | 98,6% | 200.000 frases retenidas de SlimPajama, nunca vistas en entrenamiento |
| Pruebas de estrés superadas | 27 de 32 | sondas de estrés (detalle no disponible) |
| Corpus de entrenamiento efectivamente visto | ≈14% (≈1,28B frases, ≈27,9B tokens supervisados) | SlimPajama segmentado |

## Requisitos de hardware

- Pesos en bf16/fp16: aproximadamente 2,4 GB (cálculo a partir de 1.194.200.064 parámetros × 2 bytes). En fp32, aproximadamente 4,8 GB.
- VRAM estimada para inferencia: en torno a 3-4 GB en bf16 con lotes pequeños (estimación propia a partir del tamaño de pesos más activaciones y caché); en torno a 5-6 GB en fp32.
- Cabe en GPU de consumo: sí. Tarjetas de 8 GB (RTX 3060 Ti, 3070, 4060) son suficientes en bf16; 12-16 GB (RTX 3060 12 GB, 4060 Ti 16 GB, 4070, 4080, 4090) dan margen para lotes mayores.
- GPU de centro de datos: no son necesarias para inferencia. El entrenamiento documentado se hizo con 8×H100 en bf16, pero la inferencia no requiere ese hardware.
- Opciones de despliegue: paquete `qwenar` (`pip install qwenar`, con `Qwenar.from_pretrained`) o `transformers>=5.15` con `trust_remote_code=True`, usando `AutoModel` y `model.generate_from_embeddings`. No hay soporte documentado para vLLM, TGI, llama.cpp ni Ollama; además, la generación se realiza condicionada por un prefijo de 2 posiciones y no como una generación causal estándar, por lo que los runtimes que solo admiten modelos causales convencionales no funcionarán sin adaptación.
- Latencia y throughput: no disponible en la información proporcionada.
- Requisito crítico: `transformers>=5.15`. Con la serie 4.x el modelo no lanza ningún error y produce texto fluido pero incorrecto.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Función | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `brivangl/qwenar-0.6b-montevideo` | 1.194.200.064 | no disponible (frases de 5 a 256 tokens en entrenamiento) | Autoencoder de frases: encode y decode de vectores de 1024 dimensiones | inglés | apache-2.0 | HuggingFace, `custom_code`, `transformers>=5.15` |
| `brivangl/qwenar-0.6b` (predecesor) | no disponible | no disponible | Misma construcción, entrenada sobre una mezcla biomédica | no disponible | no disponible | HuggingFace |
| `perplexity-ai/pplx-embed-v1-0.6b` (encoder base) | ≈0,6B según nombre del checkpoint | no disponible | Embeddings de frase (sin decoder asociado documentado aquí) | no disponible | no disponible | HuggingFace |
| `Qwen/Qwen3-0.6B-Base` (decoder base) | ≈0,6B según nombre del checkpoint | no disponible | Modelo de lenguaje causal de propósito general | no disponible | no disponible | HuggingFace |
| SONAR / Large Concept Model (Meta) | no disponible | no disponible | Embeddings de frase decodificables a nivel de concepto | no disponible | no disponible | citados como referencia conceptual en la model card |

## Limitaciones y advertencias

- Idioma: solo inglés (`en`). No hay soporte multilingüe documentado.
- Falla silenciosa con `transformers` 4.x: el modelo no lanza excepción y genera texto fluido pero incorrecto. Es el riesgo más grave para producción y obliga a fijar `transformers>=5.15` y a verificar la versión en el entorno de despliegue.
- La reconstrucción no es perfecta: 98,6% de coincidencia carácter a carácter sobre frases retenidas, y 27 de 32 pruebas de estrés. El 1,4% restante implica pérdida de información inherente al cuello de botella de 1024 dimensiones.
- Distribución de entrenamiento sesgada hacia frases cortas: el 80,2% de las frases del corpus tienen 31 tokens o menos y el entrenamiento solo vio el 14% del corpus, sin completar una pasada. Las frases largas (por encima de 64 tokens, el 0,5% del corpus) están muy poco representadas.
- El código está presente en los datos pero es marginal (≈0,6% de las frases, estimación basada en reglas sobre el split de validación), por lo que la reconstrucción de fragmentos de código no es fiable.
- Umbral de longitud no documentado más allá del rango de entrenamiento de 5 a 256 tokens: no se especifica el comportamiento con frases fuera de ese rango ni la ventana de contexto real del modelo.
- El decoder debe recibir objetivos con relleno a la derecha; el wrapper `Qwenar` lo impone, pero al usar `transformers` directamente hay que respetarlo.
- No es un modelo de propósito general: no sigue instrucciones, no conversa, no hace tool calling ni razonamiento multi-paso. Usarlo como modelo de chat produciría resultados fuera de su función.
- Licencia apache-2.0 para este checkpoint, pero la model card no detalla los términos de los checkpoints base (`perplexity-ai/pplx-embed-v1-0.6b` y `Qwen/Qwen3-0.6B-Base`), que conviene verificar antes de un uso comercial.
- Adopción nula en el momento de redactar la ficha (0 descargas, 0 valoraciones), sin validación independiente de los resultados declarados.
- No hay resultados publicados en benchmarks estándar, por lo que las comparaciones de calidad con otros autoencoders de frases no pueden sustentarse en datos de la información disponible.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/brivangl/qwenar-0.6b-montevideo
- Repositorio de código, pipeline de entrenamiento y evaluación completa: https://github.com/IvanDrokin/QwenAR
- Modelo predecesor (dominio biomédico): https://huggingface.co/brivangl/qwenar-0.6b
- Encoder base: https://huggingface.co/perplexity-ai/pplx-embed-v1-0.6b
- Decoder base: https://huggingface.co/Qwen/Qwen3-0.6B-Base
- Dataset de entrenamiento: https://huggingface.co/datasets/cerebras/SlimPajama-627B
- JetBrains (entidad que aportó el cómputo): https://www.jetbrains.com/
- Referencias arXiv citadas en las etiquetas del repositorio: https://arxiv.org/abs/2308.11466, https://arxiv.org/abs/2412.08821, https://arxiv.org/abs/2307.05695, https://arxiv.org/abs/2402.09353, https://arxiv.org/abs/2402.12354
- La búsqueda web realizada no devolvió ningún enlace relacionado con este modelo; los resultados obtenidos correspondían a un foro sobre ferrocarriles de vía estrecha, sin relación con el contenido de esta ficha.
