# lmsolo/gemma-4-E4B-it-qat-q4_0-gguf

## Resumen

Gemma 4 E4B-it QAT Q4_0 es la versión cuantizada con Quantization-Aware Training (QAT) del modelo instructivo E4B de la familia Gemma 4, desarrollada por Google DeepMind. Este repositorio concreto, publicado por el usuario `lmsolo`, empaqueta los pesos en formato GGUF con cuantización Q4_0, lo que reduce drásticamente los requisitos de memoria respecto al checkpoint en bfloat16 manteniendo una calidad cercana a la del modelo original gracias al entrenamiento consciente de la cuantización.

El modelo es multimodal de tipo any-to-any: procesa texto, imagen y audio como entrada y genera texto como salida. Emplea una arquitectura densa con atención híbrida que intercala atención local de ventana deslizante con atención global, e incorpora Per-Layer Embeddings (PLE) para maximizar la eficiencia de parámetros en despliegues locales. Con 4.500 millones de parámetros efectivos (8.000 millones contando embeddings) y una ventana de contexto de 128.000 tokens, está diseñado para ejecutarse en portátiles, dispositivos móviles y GPUs de consumo.

La relevancia de esta ficha radica en que combina tres factores poco habituales en un mismo artefacto: multimodalidad nativa (texto, imagen y audio), soporte de razonamiento con modos de pensamiento configurables y una cuantización Q4_0 que hace viable la inferencia local. El repositorio ocupa 6,1 GB y se distribuye bajo licencia Apache 2.0, lo que facilita su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso con atención híbrida (sliding window local + atención global) y Per-Layer Embeddings (PLE) |
| Parametros totales | 7.463.013.674 (4.5B efectivos; 8B con embeddings) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 128.000 tokens |
| Tipos de cuantizacion | Q4_0 (GGUF); el checkpoint base QAT admite también wNa8o8 (móvil) y w4a16 (compressed-tensors para vLLM) |
| Idiomas soportados | Más de 140 idiomas según la model card de la familia; lista específica no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (Q4_0) |

## Arquitectura y entrenamiento

El modelo pertenece a la familia Gemma 4 y emplea una arquitectura transformer densa de 42 capas con un mecanismo de atención híbrido: las capas alternan atención local de ventana deslizante de 512 tokens con atención global, garantizando que la capa final sea siempre global. Para optimizar la memoria en contextos largos, las capas globales unifican claves y valores y aplican Proportional RoPE (p-RoPE). El vocabulario es de 262.000 tokens. La variante E4B incorpora Per-Layer Embeddings (PLE) para maximizar la eficiencia de parámetros en despliegues on-device, de ahí la distinción entre parámetros efectivos (4.5B) y parámetros con embeddings (8B).

El entrenamiento incluye una fase de Quantization-Aware Training que produce los checkpoints QAT: los pesos se entrenan simulando la cuantización Q4_0 de modo que, al convertirlos a GGUF, la degradación de calidad respecto a bfloat16 es mínima. La model card indica que la familia se distribuye en variantes preentrenada e instruida, con soporte nativo del rol `system` y modos de pensamiento configurables. No se especifica en la información disponible el número exacto de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO. El repositorio incluye un encoder de visión de aproximadamente 150M de parámetros y un encoder de audio de aproximadamente 300M.

## Capacidades

- Generación de texto y razonamiento con modos de pensamiento (thinking) configurables.
- Comprensión de imágenes con soporte de relación de aspecto y resolución variables.
- Comprensión de audio (nativa en E2B, E4B y 12B).
- Procesamiento de vídeo según la model card de la familia.
- Generación de código y capacidades agénticas mejoradas respecto a generaciones anteriores.
- Soporte nativo de function calling / tool calling.
- Soporte nativo del rol `system` para conversaciones estructuradas.
- Multilingüismo en más de 140 idiomas.
- Decodificación especulativa mediante modelos drafter (requiere que el asistente sea también un checkpoint QAT de la misma precisión).
- Conversacional multi-turno con contexto de 128.000 tokens.

## Casos de uso

- Asistente conversacional local en portátil: con 6,1 GB de pesos en Q4_0 y 128K de contexto, el modelo puede gestionar conversaciones multi-turno extensas en una GPU de consumo, sin depender de la nube.
- Atención al cliente automatizada: el rol `system` nativo permite definir políticas de empresa de forma estructurada, y la ventana de 128K admite historiales largos e incluso documentos adjuntos en la misma sesión.
- Agente autónomo con tool calling: la integración de function calling permite conectarlo a APIs, bases de datos o sistemas de ticketing para flujos multi-paso.
- Análisis de documentos con imágenes: al aceptar imagen y texto, puede procesar capturas, escaneos o gráficos junto a preguntas en lenguaje natural.
- Transcripción y comprensión de audio en local: el encoder de audio de ~300M de parámetros permite resumir reuniones o extraer acciones de grabaciones sin salir del dispositivo.
- Generación de código en pipelines de desarrollo: el modelo puede integrarse en asistentes de IDE o revisiones automáticas, con la ventaja de ejecutarse en hardware modesto.
- Prototipado de investigación multimodal: al ser un checkpoint QAT con licencia Apache 2.0, sirve como base para experimentos de cuantización, destilación o ajuste fino sobre GGUF.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio GGUF Q4_0 ocupa 6,1 GB, por lo que se necesita aproximadamente 7-8 GB de VRAM considerando la caché KV para contextos moderados; contextos cercanos a 128K elevan sustancialmente este requisito.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080, RTX 4090, A100 y H100 para despliegues de mayor concurrencia.
- Cabe en GPU de consumo: sí, en tarjetas con 8 GB o más de VRAM para contextos cortos y en 12-16 GB para contextos largos.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y otros motores compatibles con GGUF. Para la variante w4a16 del checkpoint base, vLLM con compressed-tensors.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidades | Licencia | Formato |
|---|---|---|---|---|---|
| Gemma 4 E4B-it QAT Q4_0 (este) | 4.5B efectivos (8B con embeddings) | 128K | Texto, imagen, audio | Apache 2.0 | GGUF Q4_0 |
| Gemma 4 E2B-it QAT Q4_0 | 2.3B efectivos (5.1B con embeddings) | 128K | Texto, imagen, audio | Apache 2.0 | GGUF Q4_0 |
| Gemma 4 12B Unified QAT Q4_0 | 11.95B | 256K | Texto, imagen, audio | Apache 2.0 | GGUF Q4_0 |
| Gemma 4 31B Dense QAT Q4_0 | 30.7B | 256K | Texto, imagen | Apache 2.0 | GGUF Q4_0 |

La comparativa se limita a la propia familia Gemma 4 porque la información disponible no incluye datos de rendimiento frente a modelos de otros fabricantes.

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan en la información disponible; como modelo entrenado con datos web a gran escala, es previsible que herede sesgos sociales y culturales.
- Riesgo de alucinación: inherente a los modelos generativos; no se han publicado tasas específicas de alucinación para esta variante.
- Limitaciones de contexto: aunque soporta 128K tokens, el rendimiento efectivo en contextos muy largos puede degradarse y el consumo de memoria de la caché KV crece con la longitud.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero la model card remite a la licencia específica de Gemma 4 en ai.google.dev, que conviene revisar para obligaciones adicionales de atribución o uso aceptable.
- Compatibilidad de decodificación especulativa: si se usa un modelo drafter, debe ser también un checkpoint QAT de la misma precisión; de lo contrario, la decodificación especulativa no es compatible.
- Repositorio de terceros: este GGUF lo publica el usuario `lmsolo`, no Google; conviene verificar la integridad de los pesos frente al checkpoint oficial.
- Idiomas: se anuncia soporte de más de 140 idiomas, pero no se detalla el rendimiento por idioma ni la lista completa.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/lmsolo/gemma-4-E4B-it-qat-q4_0-gguf
- Modelo base: https://huggingface.co/google/gemma-4-E4B-it-qat-q4_0-unquantized
- Colección oficial Gemma 4 QAT Q4_0: https://huggingface.co/collections/google/gemma-4-qat-q4-0
- Colección Unsloth Gemma 4 QAT: https://huggingface.co/collections/unsloth/gemma-4-qat
- GitHub de Google Gemma: https://github.com/google-gemma
- Blog de lanzamiento de QAT: https://blog.google/innovation-and-ai/technology/developers-tools/quantization-aware-training-gemma-4/
- Documentación: https://ai.google.dev/gemma/docs/core
- Informe técnico: https://arxiv.org/abs/2607.02770
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- Página de modelos Gemma de DeepMind: https://deepmind.google/models/gemma/
