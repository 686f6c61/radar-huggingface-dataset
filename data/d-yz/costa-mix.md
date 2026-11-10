# D-YZ/CoSTA-MIX

## Resumen

CoSTA-MIX es un checkpoint de diálogo hablado bilingüe (chino e inglés) desarrollado por D-YZ a partir de Step-Audio-2-mini de StepFun. Implementa la técnica CoSTA (Compressed Speech Token Adaptation for Efficient Spoken Dialogue Models), presentada en el artículo arXiv 2610.21143, que comprime las secuencias de tokens de habla generadas por el modelo de lenguaje mediante un vocabulario BPE aprendido. Los tokens generados se expanden de forma sin pérdida al espacio original de tokens de habla antes de la síntesis de onda, conservando el tokenizador de habla y el decodificador de onda originales.

El modelo resuelve el coste computacional asociado a las secuencias largas de tokens de habla en sistemas speech-to-speech, reduciendo la longitud efectiva de las secuencias que procesa el LLM. Cuenta con 8.885.981.440 parámetros en pesos BF16 y un vocabulario ampliado de 238.352 identificadores de tokens de texto y habla, de los cuales 80.000 son tokens de habla añadidos. El vocabulario BPE de habla asociado tiene 86.656 entradas: 6.656 unidades originales y 80.000 unidades fusionadas.

Es relevante porque aborda uno de los cuellos de botella prácticos de los modelos de diálogo hablado: la eficiencia de las secuencias de tokens acústicos. Se distribuye con licencia Apache-2.0 y requiere el código de inferencia del repositorio CoSTA, ya que no es compatible con un `pipeline` genérico de Transformers.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer basado en Step-Audio-2-mini con adaptación de tokens de habla comprimidos (CoSTA); implementación custom en Transformers |
| Parámetros totales | 8.885.981.440 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (checkpoint publicado en BF16) |
| Idiomas soportados | chino (zh), inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (BF16) |

## Arquitectura y entrenamiento

El modelo parte de Step-Audio-2-mini y añade la adaptación CoSTA: el LLM genera tokens de habla comprimidos mediante un vocabulario BPE aprendido de 86.656 entradas (6.656 unidades originales y 80.000 fusionadas). Antes de la síntesis de onda, los tokens se expanden de forma sin pérdida al espacio original de tokens de habla mediante `speech_bpe_vocab_int.jsonl`, y el decodificador `token2wav` del modelo base se conserva intacto. El vocabulario del LLM se amplía hasta 238.352 identificadores, incluyendo 80.000 tokens de habla nuevos, con inicialización por media.

El entrenamiento sigue tres etapas: extensión de vocabulario con inicialización por media; adaptación de pronunciación en dos fases (primero embeddings y LM-head, después el LLM completo); y adaptación a diálogo speech-to-speech. Los datos de pronunciación se basan en Emilia con conversión de voz Seed-VC, y la preparación del diálogo sigue OpenS2S con síntesis de habla del asistente mediante CosyVoice 2. La implementación custom incluye cambios en la pérdida de entrenamiento, el redimensionado de embeddings y la temporización de inferencia.

## Capacidades

- Diálogo hablado extremo a extremo (speech-to-speech) en chino e inglés.
- Generación de texto y de tokens de habla comprimidos mediante BPE.
- Compresión de secuencias de tokens de habla con expansión sin pérdida antes de la síntesis de onda.
- Adaptación de pronunciación específica para el par de idiomas soportado.
- Entrada y salida any-to-any según el pipeline declarado (`any-to-any`).
- No se documenta soporte de tool calling, function calling ni razonamiento multi-paso en la información disponible.
- No se documentan capacidades de visión ni audio más allá del diálogo hablado.

## Casos de uso

- Asistentes de voz bilingües chino-inglés: el modelo gestiona diálogo hablado directo sin pipeline separado de ASR y TTS, adecuado para interfaces conversacionales en aplicaciones de atención al cliente.
- Evaluación de eficiencia en investigación: sirve para reproducir los experimentos de CoSTA sobre compresión de tokens de habla y medir el impacto en latencia y longitud de secuencia.
- Sistemas de diálogo embebidos: con 8,9 mil millones de parámetros y pesos BF16, es viable en despliegues con GPU única de gama alta, reduciendo coste frente a modelos de diálogo hablado mayores.
- Prototipado de agentes conversacionales por voz: permite construir demos de interacción hablada multi-turno en entornos de investigación con datos sintéticos controlados.
- Adaptación a dominios específicos: al ser un finetune con licencia Apache-2.0, puede ajustarse adicionalmente para verticales concretas (educación, soporte técnico) manteniendo los ficheros BPE propios del checkpoint.
- Benchmarking de modelos speech-to-speech: útil como referencia en comparativas sobre URO-Bench y para estudiar el efecto de la compresión de tokens en la calidad del habla generada.

## Benchmarks y rendimiento

El artículo asociado reporta evaluación en URO-Bench, pero en la información proporcionada no se incluyen los valores numéricos de los resultados. Por tanto:

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 18 GB solo para pesos, más overhead del decodificador `token2wav` y del runtime; se recomienda al menos 24 GB.
- GPU recomendadas: A100 40/80 GB, H100, L40S; en consumer, RTX 4090 (24 GB) es el mínimo realista en BF16.
- Cuantización: no se documentan ficheros GGUF ni cuantizaciones oficiales; el despliegue estándar es BF16 con la implementación custom.
- Opciones de despliegue: el workflow soportado es el repositorio CoSTA con Transformers 4.49.0 y la implementación custom; no se garantiza compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| CoSTA-MIX | 8,89 B | no disponible | zh, en | Apache-2.0 | Finetune de diálogo hablado con compresión BPE de tokens de habla |
| stepfun-ai/Step-Audio-2-mini | no disponible en la información | no disponible | no disponible | no disponible | Modelo base del que deriva CoSTA-MIX |
| Alternativas de diálogo hablado de tamaño similar | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparables en la información proporcionada |

## Limitaciones y advertencias

- Gran parte de los datos de adaptación son sintéticos (pronunciación vía Seed-VC, diálogo vía CosyVoice 2), lo que puede introducir artefactos acústicos y sesgos de dominio.
- La evaluación se centra en diálogo hablado general; el rendimiento en dominios especializados no está validado.
- Los autores advierten que las salidas pueden contener errores factuales y dependen del idioma de entrada y de las condiciones acústicas.
- Solo se soportan chino e inglés; no hay cobertura multilingüe adicional.
- No es compatible con un `pipeline` genérico de Transformers; requiere el código del repositorio CoSTA y la versión específica 4.49.0.
- El decodificador `token2wav` debe descargarse por separado desde el modelo base.
- Los datos de entrenamiento y evaluación no se incluyen en el repositorio del modelo.
- Licencia Apache-2.0 permite uso comercial, pero deben respetarse los ficheros `LICENSE` y `NOTICE` y la atribución al modelo base Step-Audio-2-mini.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/D-YZ/CoSTA-MIX
- Artículo (arXiv): https://arxiv.org/abs/2610.21143
- Repositorio de código e instrucciones: https://github.com/yingzhuodeng/CoSTA
- Instrucciones de entorno: https://github.com/yingzhuodeng/CoSTA#-environment-setup
- Instrucciones de datos e inferencia: https://github.com/yingzhuodeng/CoSTA#-model-inference
- Modelo base: https://huggingface.co/stepfun-ai/Step-Audio-2-mini
