# Iniharith/gemma-4-E2B-it

## Resumen

El modelo `Iniharith/gemma-4-E2B-it` es una variante instruction-tuned del modelo `google/gemma-4-E2B`, perteneciente a la familia Gemma 4 de Google DeepMind. Se trata de un modelo multimodal ligero que procesa texto, imagen y audio, y genera texto como salida. El repositorio ha sido subido por el usuario Iniharith, pero la arquitectura y el model card corresponden al lanzamiento oficial de Gemma 4.

El modelo utiliza una arquitectura transformer densa con Per-Layer Embeddings (PLE), lo que le permite ofrecer un rendimiento efectivo de 2.3B parámetros mientras mantiene 5.1B parámetros totales con embeddings. Está diseñado para ejecutarse eficientemente en dispositivos móviles, portátiles y entornos de consumo, con una ventana de contexto de 128K tokens. Su relevancia radica en combinar capacidades de razonamiento, coding, soporte de agentes y multimodalidad en un tamaño reducido, con licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso con Per-Layer Embeddings (PLE) y atención híbrida (sliding window + global) |
| Parámetros totales | 5.123.178.051 (5.1B con embeddings) |
| Parámetros activos | No aplica (modelo denso) |
| Parámetros efectivos | 2.3B |
| Longitud de contexto | 128K tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Más de 140 idiomas (según la familia Gemma 4) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Capas | 35 |
| Ventana deslizante | 512 tokens |
| Tamaño de vocabulario | 262K |
| Modalidades | Texto, imagen, audio |
| Encoders | Visión ~150M, audio ~300M |
| Pipeline | any-to-any |

## Arquitectura y entrenamiento

La arquitectura de Gemma 4 E2B es un transformer decoder-only con encoders dedicados para visión (~150M parámetros) y audio (~300M parámetros). El modelo emplea un mecanismo de atención híbrida que intercala atención local de ventana deslizante (512 tokens) con atención global completa, garantizando que la última capa sea siempre global. Para optimizar la memoria en contextos largos, las capas globales utilizan claves y valores unificados y aplican Proportional RoPE (p-RoPE). Los Per-Layer Embeddings (PLE) asignan una pequeña tabla de embeddings a cada capa decodificadora, lo que reduce el número de parámetros efectivos a 2.3B.

No se han proporcionado datos específicos sobre el proceso de entrenamiento de esta variante concreta, como el número de tokens o la composición del dataset. El model card indica que la familia Gemma 4 incluye variantes pre-trained e instruction-tuned, y que el modelo base es `google/gemma-4-E2B`. No hay información sobre RLHF o DPO en la documentación disponible. La subida realizada por Iniharith no incluye detalles adicionales sobre el fine-tuning aplicado.

## Capacidades

- Generación de texto multimodal: procesa entradas de texto, imagen y audio, y produce respuestas en texto.
- Razonamiento con modos de pensamiento configurables, lo que permite ajustar el nivel de deliberación según la tarea.
- Soporte nativo de tool calling / function calling, habilitando la integración con herramientas externas.
- Capacidades agénticas y de razonamiento multi-paso, adecuadas para flujos de trabajo autónomos.
- Soporte multilingüe en más de 140 idiomas.
- Soporte nativo del rol `system` en la conversación, permitiendo un control más estructurado del comportamiento del modelo.
- Optimizado para ejecución local en dispositivos móviles y portátiles, gracias a su diseño eficiente con PLE.
- Atención híbrida con ventana de contexto de 128K tokens, adecuada para tareas de contexto largo.

## Casos de uso

- Asistente de productividad en el móvil: al procesar audio e imagen, puede transcribir notas de voz y describir fotografías sin conexión, gracias a su optimización on-device.
- Agente de soporte técnico con tool calling: el modelo puede consultar bases de conocimiento externas mediante funciones, gestionar tickets y mantener un contexto de 128K tokens en conversaciones extensas.
- Generación de código en entornos de desarrollo: con mejoras en coding y razonamiento, puede autocompletar, refactorizar y explicar fragmentos de código en múltiples idiomas.
- Análisis de documentos escaneados: combina visión e imagen para extraer información de facturas, contratos o gráficos, y generar resúmenes en texto.
- Aplicaciones de accesibilidad: interpreta imágenes y audio para ayudar a personas con discapacidad visual, describiendo el entorno o leyendo texto en voz alta.
- Chatbots multilingües de atención al cliente: soporta más de 140 idiomas y contexto largo, ideal para conversaciones extensas con clientes internacionales.
- Resumen de reuniones: procesa audio de reuniones y genera actas con puntos clave, gracias a su capacidad de audio y generación de texto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El model card menciona mejoras cualitativas en benchmarks de coding y capacidades agénticas, pero no proporciona cifras concretas.

## Requisitos de hardware

- VRAM estimada: no disponible.
- GPU recomendadas: no disponible. El model card indica que los modelos E2B y E4B están optimizados para ejecución local en portátiles y dispositivos móviles.
- Cabe en consumer GPU: no se especifica. El tamaño del repositorio es de 10.3 GB, lo que sugiere que podría ejecutarse en GPUs de consumidor con cuantización, aunque no hay datos oficiales.
- Opciones de despliegue: compatible con la librería `transformers`; el repositorio indica `endpoints_compatible`. No se especifican vLLM, llama.cpp, Ollama o TGI, aunque son opciones habituales para modelos con pesos en safetensors.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

La siguiente tabla compara el modelo E2B con otros modelos de la misma familia Gemma 4, según los datos del model card:

| Modelo | Parámetros totales | Parámetros activos | Contexto | Arquitectura | Modalidades | Licencia |
|---|---|---|---|---|---|---|
| E2B | 5.1B (2.3B efectivos) | No aplica | 128K | Dense con PLE | Texto, imagen, audio | Apache 2.0 |
| E4B | 8B (4.5B efectivos) | No aplica | 128K | Dense con PLE | Texto, imagen, audio | Apache 2.0 |
| 12B Unified | 11.95B | No aplica | 256K | Dense encoder-free | Texto, imagen, audio | Apache 2.0 |
| 26B A4B | 25.2B | 3.8B | 256K | MoE | Texto, imagen | Apache 2.0 |

No se dispone de datos de rendimiento comparativo (benchmarks) para estos modelos en la información proporcionada.

## Limitaciones y advertencias

- No se han publicado evaluaciones de seguridad, sesgos o alucinaciones para este modelo específico en la información disponible.
- Al ser una subida de un usuario no oficial (Iniharith), no hay garantías de que el proceso de fine-tuning sea reproducible o esté verificado por Google DeepMind.
- La licencia Apache 2.0 permite uso comercial, pero se deben revisar los términos específicos de la licencia de Gemma 4 para asegurar el cumplimiento.
- El soporte de audio e imagen requiere encoders adicionales que pueden aumentar el consumo de memoria en comparación con un modelo de texto puro.
- No se proporcionan detalles sobre el proceso de entrenamiento ni sobre la composición del dataset, lo que limita la evaluación de posibles sesgos.

## Enlaces

- HuggingFace: https://huggingface.co/Iniharith/gemma-4-E2B-it
- Colección oficial de Gemma 4 en HuggingFace: https://huggingface.co/collections/google/gemma-4
- GitHub de Google Gemma: https://github.com/google-gemma
- Blog de lanzamiento: https://blog.google/innovation-and-ai/technology/developers-tools/gemma-4/
- Documentación: https://ai.google.dev/gemma/docs/core
- Technical report: https://arxiv.org/abs/2607.02770
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
