# asincole/gemma-4-E2B-it-qat-q4_0-gguf

## Resumen

El repositorio asincole/gemma-4-E2B-it-qat-q4_0-gguf es una conversión a formato GGUF del checkpoint cuantizado con Quantization-Aware Training (QAT) de Gemma 4 E2B en su variante instruction-tuned. El modelo original lo desarrolla Google DeepMind y forma parte de la familia Gemma 4, publicada con pesos abiertos y bajo licencia Apache 2.0. Este repositorio concreto ha sido subido por el usuario asincole a partir del checkpoint no cuantizado google/gemma-4-E2B-it-qat-q4_0-unquantized, con el objetivo de ofrecer un artefacto listo para desplegar en el ecosistema GGUF (llama.cpp, Ollama y derivados).

Gemma 4 E2B es un modelo denso y multimodal que acepta entrada de texto, imagen y audio, y genera salida de texto. La nomenclatura "E" hace referencia a parámetros efectivos: Google declara 2,3B efectivos y 5,1B contando embeddings, mientras que el repositorio de safetensors reporta 4.628.569.635 parámetros totales. Incorpora Per-Layer Embeddings (PLE) para maximizar la eficiencia en dispositivos, atención híbrida con ventana deslizante local combinada con atención global, y una ventana de contexto de 128K tokens.

La relevancia de esta ficha reside en que QAT permite conservar una calidad cercana a bfloat16 reduciendo drásticamente los requisitos de memoria, lo que habilita la ejecución local en teléfonos de gama alta, portátiles y GPU de consumo. El modelo soporta más de 140 idiomas, modo de razonamiento configurable, soporte nativo del rol `system` y function calling, lo que lo orienta a flujos agénticos y de generación de código en el borde.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso multimodal con atención híbrida (sliding window local + atención global) y Per-Layer Embeddings (PLE) |
| Parametros totales | 4.628.569.635 (~4,63B) según safetensors del repositorio; Google declara 2,3B efectivos y 5,1B con embeddings |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 128K tokens (modelos pequeños de la familia) |
| Tipos de cuantizacion | Q4_0 (GGUF), derivada de un pipeline de Quantization-Aware Training |
| Idiomas soportados | Más de 140 idiomas según la model card de la familia |
| Licencia | Apache 2.0 (license_link apunta a la licencia específica Gemma 4) |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

Gemma 4 E2B emplea una arquitectura transformer densa de 35 capas con un mecanismo de atención híbrido que intercala capas de atención local con ventana deslizante de 512 tokens y capas de atención global, garantizando que la última capa sea siempre global. Para optimizar el consumo de memoria en contextos largos, las capas globales utilizan claves y valores unificados y aplican Proportional RoPE (p-RoPE). El vocabulario es de 262K tokens. El modelo incorpora además Per-Layer Embeddings (PLE), una técnica que maximiza la eficiencia de parámetros en escenarios on-device, y añade un codificador de visión de aproximadamente 150M de parámetros y un codificador de audio de aproximadamente 300M.

La variante concreta de este repositorio procede de un entrenamiento con Quantization-Aware Training, que simula la cuantización durante el entrenamiento para preservar una calidad próxima a bfloat16 tras comprimir los pesos a Q4_0. Sobre el número exacto de tokens de entrenamiento, la composición del dataset y el uso de RLHF o DPO, la información proporcionada no ofrece detalles: no disponible. La model card sí confirma que existen variantes preentrenadas e instruction-tuned, y que la familia está diseñada como modelo razonador con modos de pensamiento configurables.

## Capacidades

- Generación de texto, razonamiento y codificación, con mejoras notables en benchmarks de código y flujos agénticos según la documentación de la familia.
- Procesamiento multimodal de imagen con soporte de relación de aspecto y resolución variable.
- Entrada de audio nativa en los modelos E2B, E4B y 12B (salida siempre de texto).
- Modo de razonamiento configurable (thinking modes).
- Soporte nativo de function calling y tool calling.
- Soporte nativo del rol `system` para conversaciones más estructuradas y controlables.
- Capacidades multilingües en más de 140 idiomas.
- Diseñado para ejecución on-device en portátiles y dispositivos móviles.

## Casos de uso

- Asistentes locales en dispositivos móviles: al ser un modelo E2B con cuantización Q4_0 y PLE, puede ejecutarse en teléfonos de gama alta preservando razonamiento y comprensión multimodal de imagen y audio.
- Atención al cliente automatizada: gestiona conversaciones multi-turno con hasta 128K tokens de contexto y soporte nativo del rol `system` para definir políticas de respuesta.
- Agentes autónomos con tool calling: la compatibilidad con function calling permite encadenar llamadas a APIs y ejecutar razonamiento multi-paso en pipelines agénticos.
- Asistencia de código en el editor: las mejoras en benchmarks de codificación y el soporte de instrucciones estructuradas lo hacen apto para autocompletado y revisión de código en local sin enviar datos a la nube.
- Procesamiento de documentos con imágenes: la capacidad de visión con resolución variable permite extraer información de capturas, diagramas o formularios junto con su texto asociado.
- Transcripción y comprensión de audio en el dispositivo: el codificador de audio integrado habilita tareas de resumen y Q&A sobre notas de voz sin conexión.
- Despliegue en el borde con requisitos de memoria reducidos: el formato GGUF Q4_0 facilita su integración en aplicaciones de escritorio y servicios con GPU limitada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Tamaño del repositorio: 4,3 GB, lo que da una referencia aproximada del peso de los artefactos GGUF Q4_0 incluidos.
- VRAM estimada para inferencia: en torno a 3-5 GB con cuantización Q4_0, dependiendo de la longitud de contexto y del uso de caché KV para las capas globales.
- GPU de consumo: cabe holgadamente en tarjetas con 8 GB de VRAM o más, como RTX 3060, 4060, 4070 o superiores; también en equipos Apple Silicon con memoria unificada.
- GPU de servidor: A100, H100 y similares para despliegues de mayor concurrencia o contextos largos.
- Opciones de despliegue: llama.cpp, Ollama y otros motores compatibles con GGUF; la model card menciona además variantes optimizadas para vLLM en formato compressed-tensors para otros checkpoints de la familia.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidades | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| asincole/gemma-4-E2B-it-qat-q4_0-gguf | ~4,63B totales (2,3B efectivos) | 128K | Texto, imagen, audio | Apache 2.0 | GGUF en HuggingFace |
| google/gemma-4-E2B-it-qat-q4_0-unquantized | ~4,63B totales (2,3B efectivos) | 128K | Texto, imagen, audio | Apache 2.0 | Safetensors en HuggingFace |
| google/gemma-4-E2B-it-qat-mobile-transformers | ~4,63B totales (2,3B efectivos) | 128K | Texto, imagen, audio | Apache 2.0 | Formato móvil wNa8o8 |

## Limitaciones y advertencias

- Este repositorio es una conversión de terceros (usuario asincole) del checkpoint oficial; no está publicado por Google DeepMind y podría diferir del comportamiento del original.
- No se han publicado resultados de benchmarks para esta conversión específica, por lo que no puede confirmarse empíricamente que mantenga la calidad del checkpoint unquantized.
- La licencia del repositorio figura como Apache 2.0, pero el enlace de licencia apunta a la licencia específica de Gemma 4; conviene verificar las condiciones reales antes de un uso comercial.
- Riesgo de alucinación inherente a los modelos de lenguaje; no se dispone de datos específicos de evaluación para este checkpoint cuantizado.
- La cuantización Q4_0 puede degradar ligeramente tareas sensibles a la precisión numérica, como matemáticas o razonamiento de varios pasos, aunque QAT está diseñado para mitigar ese efecto.
- Cuando se use decodificación especulativa con un modelo asistente, este debe ser también un checkpoint QAT con la misma precisión para garantizar la compatibilidad.
- No se dispone de información sobre sesgos conocidos ni sobre la composición exacta del dataset de entrenamiento en la información proporcionada.
- El repositorio no registra descargas ni interacciones, lo que reduce la evidencia comunitaria sobre su fiabilidad en producción.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/asincole/gemma-4-E2B-it-qat-q4_0-gguf
- Modelo base: https://huggingface.co/google/gemma-4-E2B-it-qat-q4_0-unquantized
- Variante móvil oficial: https://huggingface.co/google/gemma-4-E2B-it-qat-mobile-transformers
- Colección QAT Q4_0 de Google: https://huggingface.co/collections/google/gemma-4-qat-q4-0
- GitHub: https://github.com/google-gemma
- Blog de lanzamiento de QAT: https://blog.google/innovation-and-ai/technology/developers-tools/quantization-aware-training-gemma-4/
- Documentación de Gemma: https://ai.google.dev/gemma/docs/core
- Informe técnico: https://arxiv.org/abs/2607.02770
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- Página de Gemma 4 en Google DeepMind: https://deepmind.google/models/gemma/gemma-4/
