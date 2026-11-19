# sony3021919/gemma-4-E2B-it-qat-q4_0-gguf

## Resumen

Gemma 4 E2B-it-qat-q4_0 es un checkpoint de la familia Gemma 4 de Google DeepMind, publicado en formato GGUF con cuantizacion Q4_0 y entrenado con Quantization-Aware Training (QAT). El modelo base es `google/gemma-4-E2B-it-qat-q4_0-unquantized`, y esta version GGUF la distribuye el usuario `sony3021919`. Se trata de un modelo multimodal any-to-any: acepta texto, imagen y audio como entrada y genera texto como salida.

La variante E2B emplea la arquitectura densa de Gemma 4 con "effective parameters": 2.3B efectivos y 5.1B contando embeddings, con un total real de 4.628.569.635 parametros segun los safetensors del repo. Incorpora Per-Layer Embeddings (PLE) para maximizar la eficiencia en dispositivos, 35 capas, ventana de atencion local de 512 tokens y una longitud de contexto de 128K tokens. El vocabulario es de 262K entradas.

La relevancia de esta ficha radica en que combina tres caracteristicas poco frecuentes en un mismo artefacto: cuantizacion QAT que preserva calidad cercana a bfloat16, formato GGUF listo para despliegue en ecosistemas locales (llama.cpp, Ollama) y soporte nativo de audio e imagen en un modelo de menos de 5B parametros totales. Esta pensado para ejecucion en movil, portatil y edge.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso con atencion hibrida (sliding window local + atencion global), Per-Layer Embeddings (PLE), p-RoPE en capas globales |
| Parametros totales | 4.628.569.635 (2.3B efectivos, 5.1B con embeddings) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 128K tokens |
| Tipos de cuantizacion | Q4_0 (GGUF); el checkpoint base QAT tambien existe en wNa8o8 y w4a16 compressed-tensors |
| Idiomas soportados | Mas de 140 idiomas segun la model card de la familia; lista concreta no disponible |
| Licencia | Apache 2.0 (con license_link a la licencia de Gemma 4 de Google) |
| Formato de pesos | GGUF (repo de 4.3 GB) |
| Ventana de atencion local | 512 tokens |
| Capas | 35 |
| Vocabulario | 262K tokens |
| Modalidades de entrada | Texto, imagen, audio |
| Modalidad de salida | Texto |
| Encoder de vision | ~150M parametros |
| Encoder de audio | ~300M parametros |
| Pipeline declarado | any-to-any |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura densa de Gemma 4 para la variante E2B: 35 capas con un mecanismo de atencion hibrido que intercala atencion local de ventana deslizante (512 tokens) con atencion global completa, garantizando que la capa final sea siempre global. Las capas globales usan claves y valores unificados y aplican Proportional RoPE (p-RoPE) para reducir el coste de memoria en contextos largos. Los modelos pequenos de la familia incorporan Per-Layer Embeddings (PLE) para mejorar la eficiencia parametrica en dispositivos.

El entrenamiento incluye una fase de Quantization-Aware Training que produce pesos Q4_0 con calidad declarada cercana a bfloat16, reduciendo drasticamente los requisitos de memoria. La model card de la familia menciona variantes preentrenadas e instruction-tuned, y esta version concreta es la instruction-tuned (`-it`). No se detalla en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si se aplico RLHF o DPO. Tampoco se especifica el proceso exacto de conversion a GGUF realizado por el autor del repo.

Una innovacion relevante es la compatibilidad de decodificacion especulativa: al usar multi-token prediction con un modelo asistente junto a un modelo QAT, el asistente debe ser tambien un checkpoint QAT con la misma precision.

## Capacidades

- Generacion de texto con modo de razonamiento configurable (thinking modes) en toda la familia Gemma 4.
- Comprension de imagen con soporte de relacion de aspecto y resolucion variables.
- Comprension de audio nativa (encoder de ~300M parametros en E2B).
- Procesamiento de video como modalidad extendida de la familia.
- Soporte nativo de function calling para flujos agenticos.
- Soporte del rol `system` nativo para conversaciones estructuradas y controlables.
- Capacidades de codigo mejoradas respecto a generaciones anteriores de Gemma.
- Multilingue en mas de 140 idiomas.
- Conversacion multi-turno con contexto de hasta 128K tokens.
- Despliegue en movil y edge gracias al formato Q4_0 y a PLE.

## Casos de uso

- Asistente conversacional en dispositivo movil: el checkpoint Q4_0 en GGUF ocupa 4.3 GB y esta disenado para ejecucion local en telefonos de gama alta, con contexto de 128K para conversaciones largas sin conexion.
- Transcripcion y resumen de audio en local: el encoder de audio de ~300M parametros permite procesar notas de voz o reuniones y generar resumenes de texto sin enviar datos a la nube.
- Analisis de imagenes en edge: con el encoder de vision de ~150M parametros, el modelo puede describir capturas, extraer texto de imagenes o clasificar contenido visual en un portatil.
- Agente autonomo con function calling: el soporte nativo de tool calling y del rol `system` permite construir agentes multi-paso que consulten APIs externas y mantengan estado en el contexto de 128K tokens.
- Asistencia de codigo en IDE local: las mejoras en benchmarks de codigo de la familia y el bajo requisito de VRAM lo hacen viable como autocompletado y explicacion de codigo en un portatil con GPU consumer.
- Atencion al cliente multilingue: con soporte de mas de 140 idiomas y contexto largo, puede gestionar conversaciones multi-turno con historial extenso y derivar a herramientas internas via function calling.
- Procesamiento de documentos con imagenes: combinando vision y contexto de 128K, puede extraer informacion de capturas, formularios o diagramas y responder preguntas sobre ellos.
- Prototipado e investigacion de cuantizacion: al ser un checkpoint QAT en GGUF, sirve para estudiar el impacto de Q4_0 frente a bfloat16 en tareas multimodales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el repo GGUF ocupa 4.3 GB, por lo que la inferencia en Q4_0 requiere aproximadamente 4-5 GB de VRAM o memoria unificada, mas el espacio de cache KV para el contexto utilizado.
- El contexto de 128K incrementa significativamente el consumo de cache KV; con ventana local de 512 tokens y p-RoPE en capas globales el coste es menor que en un transformer clasico, pero no se dispone de cifras exactas.
- GPU recomendadas: no disponibles de forma especifica. Por tamano, cabe en GPUs consumer con 6-8 GB o mas (por ejemplo, RTX 3060, RTX 4060, RTX 4070); para lotes grandes o contexto muy largo se recomendarian A100 o H100.
- Cabe en consumer GPU: si, en cualquier GPU con al menos 6 GB de VRAM para Q4_0 y contexto moderado.
- Opciones de despliegue: llama.cpp y Ollama por el formato GGUF; vLLM para la variante w4a16 compressed-tensors del checkpoint base; el repo declara compatibilidad con endpoints (`endpoints_compatible`).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidades | Licencia | Formato |
|---|---|---|---|---|---|
| Gemma 4 E2B-it-qat-q4_0 (este) | 4.63B totales (2.3B efectivos) | 128K | Texto, imagen, audio | Apache 2.0 | GGUF Q4_0 |
| Gemma 4 E4B | 8B con embeddings (4.5B efectivos) | 128K | Texto, imagen, audio | Apache 2.0 | GGUF, wNa8o8, w4a16 |
| Gemma 4 12B Unified | 11.95B | 256K | Texto, imagen, audio | Apache 2.0 | GGUF, w4a16 |
| Gemma 4 31B Dense | 30.7B | 256K | Texto, imagen | Apache 2.0 | GGUF, w4a16 |

No se dispone de datos de benchmarks para comparar el rendimiento relativo con estas alternativas. La comparativa se limita a parametros, contexto, modalidades y licencia, todos ellos extraidos de la model card de la familia Gemma 4.

## Limitaciones y advertencias

- No se han publicado resultados de benchmarks especificos para este checkpoint, por lo que el rendimiento real en tareas concretas no esta cuantificado.
- El repo tiene 0 descargas y 0 likes en el momento de la ficha; es una publicacion de terceros (`sony3021919`), no oficial de Google, lo que implica que la conversion a GGUF no ha sido validada por el desarrollador original.
- La cuantizacion Q4_0, aunque sea QAT, introduce perdida de calidad respecto a bfloat16; el grado exacto de degradacion no esta documentado en la informacion disponible.
- Riesgo de alucinacion inherente a los modelos generativos; no hay evaluaciones publicadas de tasa de alucinacion para esta variante.
- Sesgos conocidos: no disponibles en la informacion proporcionada; se recomienda consultar la model card oficial de Gemma 4.
- La lista concreta de idiomas soportados no esta disponible; solo se indica "mas de 140 idiomas" a nivel de familia.
- Restricciones de licencia: se declara Apache 2.0, pero el `license_link` apunta a la licencia de Gemma 4 de Google; conviene revisar los terminos de uso de Gemma antes de un despliegue comercial.
- Para decodificacion especulativa, el modelo asistente debe ser tambien QAT con la misma precision; usar un asistente no QAT puede degradar la calidad o fallar.
- El contexto de 128K requiere gestion cuidadosa de la cache KV en hardware limitado; no se dispone de cifras de memoria para contextos maximos.
- El pipeline declarado es `any-to-any`, pero la salida es unicamente texto; no genera imagen ni audio.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/sony3021919/gemma-4-E2B-it-qat-q4_0-gguf
- Modelo base: https://huggingface.co/google/gemma-4-E2B-it-qat-q4_0-unquantized
- Coleccion Gemma 4 QAT Q4_0: https://huggingface.co/collections/google/gemma-4-qat-q4-0
- GitHub de Google Gemma: https://github.com/google-gemma
- Blog de lanzamiento de QAT en Gemma 4: https://blog.google/innovation-and-ai/technology/developers-tools/quantization-aware-training-gemma-4/
- Documentacion de Gemma: https://ai.google.dev/gemma/docs/core
- Informe tecnico (arXiv): https://arxiv.org/abs/2607.02770
- Licencia de Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- Pagina de modelos Gemma de DeepMind: https://deepmind.google/models/gemma/
