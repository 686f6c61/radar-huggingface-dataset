# darkmaniac7/TokForge-Bonsai-2-4B-MNN

## Resumen

TokForge-Bonsai-2-4B-MNN es una conversión al motor MNN de Alibaba del modelo Ternary Bonsai 2 4B de Prism ML, derivado a su vez de Qwen3.5 4B. El autor, darkmaniac7, lo publica bajo el paraguas de TokForge para inferencia en dispositivo (on-device) en teléfonos Android. Se trata de un modelo de chat exclusivamente de texto: la parte de visión del modelo original no está incluida en este bundle.

La característica técnica central es el uso de pesos ternarios: las matrices de pesos grandes toman valores -1, 0 o +1 multiplicados por una escala por grupo de 128. Esta representación reduce drásticamente el tamaño del modelo (2,39 GB en total) y permite ejecutarlo en teléfonos con 8 GB de RAM o más, sin conexión una vez descargado.

El modelo es relevante ahora porque demuestra una ruta viable para llevar un LLM de 4B parámetros a hardware móvil de gama media-alta con pesos ternarios y un runtime optimizado, manteniendo la fidelidad numérica respecto al modelo original mediante una rotación de base Walsh-Hadamard implementada en el grafo MNN. La licencia Apache-2.0 facilita su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido (32 capas: 24 de atención linear, 8 de atención completa), pesos ternarios (-1, 0, +1) con escala por grupo de 128 |
| Parametros totales | 4B (modelo base Qwen3.5-4B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Ternaria almacenada como 4-bit simétrico, bloque 64; proyecciones de compuerta de atención linear en 4-bit; normas en float |
| Idiomas soportados | en (inglés) |
| Licencia | Apache-2.0 |
| Formato de pesos | MNN bundle (llm.mnn, llm.mnn.weight, tokenizer.mtok) |

## Arquitectura y entrenamiento

El modelo subyacente es Qwen3.5-4B, un transformer de 32 capas con un diseño híbrido: 24 capas de atención linear y 8 de atención completa, con tamaño oculto de 2560. Prism ML lo transformó en Ternary Bonsai 2 4B ternarizando las matrices de pesos grandes: cada peso es -1, 0 o +1 multiplicado por una escala por grupo de 128. Prism almacena cada matriz ternaria en una base rotada, de modo que el runtime multiplica la entrada de cada capa por una matriz Walsh-Hadamard fija (bloques de 512) y un patrón de signos +1/-1 antes del producto matricial.

La conversión a MNN preserva esa rotación dentro del grafo usando operaciones estándar de MNN (dos productos matriciales de 16 x 32, una transposición y una multiplicación de signos), de forma que el modelo calcula la misma función que el runtime propio de Prism. Cada peso ternario se almacena como valor simétrico de 4 bits con una escala por bloque de 64 (los códigos son -7, 0 y +7, con escala igual a la escala de grupo dividida por 7). El autor verificó leyendo todas las matrices ternarias de vuelta desde llm.mnn.weight y comparándolas con los valores de Prism: todas coinciden. No son exactas las dos proyecciones de compuerta pequeñas de cada capa de atención linear (Prism las guarda en float32, aquí en 4-bit) ni las normas, que permanecen en float. La tabla de embeddings y la cabeza de salida están atadas (tied) y se almacenan una sola vez como cabeza de salida de 4 bits. No se dispone de información sobre el dataset de entrenamiento, el número de tokens ni si hubo RLHF o DPO.

## Capacidades

- Generación de texto conversacional en inglés, orientada a chat.
- Razonamiento y respuesta a preguntas dentro de las capacidades heredadas de Qwen3.5-4B.
- Ejecución completamente local en el teléfono: tras la descarga, el chat no requiere conexión.
- Inferencia en CPU o GPU del dispositivo, con selección automática de ruta por parte de TokForge según el teléfono.
- Solo texto: la capacidad de visión del modelo original no está incluida; en TokForge las fotos se describen mediante un helper de imagen integrado en la app y el modelo responde a partir de esa descripción.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al inglés según la model card.
- Modo thinking, audio u otras capacidades especiales: no disponible en la información proporcionada.

## Casos de uso

- Chat conversacional offline en Android: el modelo se ejecuta íntegramente en el teléfono con 8 GB de RAM o más, permitiendo conversaciones sin conexión una vez descargado el bundle de 2,39 GB.
- Asistente personal en movilidad: al no requerir red, es adecuado para entornos sin cobertura o con requisitos de privacidad, ya que los datos no salen del dispositivo.
- Prototipado de aplicaciones móviles con LLM: desarrolladores que quieran integrar un modelo de 4B en una app Android mediante el motor MNN pueden usar este bundle como referencia de conversión y despliegue.
- Evaluación de cuantización ternaria: investigadores interesados en el impacto de pesos ternarios con rotación Walsh-Hadamard pueden comparar este bundle con el GGUF original de Prism para estudiar fidelidad numérica y rendimiento.
- Descripción de imágenes asistida en móvil: combinado con el helper de imagen de TokForge, el modelo puede responder preguntas sobre fotos a partir de la descripción textual generada por la app.
- Demostración de inferencia en dispositivo para docencia: sirve para ilustrar en cursos o talleres cómo un LLM de 4B puede ejecutarse en hardware de consumo con un runtime específico para móvil.
- Base para fine-tuning o experimentación sobre MNN: el formato y la estructura del grafo permiten estudiar adaptaciones del runtime, aunque no se documentan herramientas de entrenamiento en este repositorio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- RAM del dispositivo: 8 GB o más, según el catálogo de TokForge.
- Almacenamiento: 2,39 GB para los 9 archivos del bundle (llm.mnn.weight ocupa 2,37 GB).
- Plataforma: teléfonos Android con el motor MNN; TokForge selecciona la ruta de CPU o GPU según el teléfono.
- GPU de escritorio (A100, H100, RTX 4090): no disponible; el bundle está orientado a MNN en móvil, no a servidores.
- ¿Cabe en GPU de consumo? No disponible para este formato; el modelo está empaquetado para MNN en Android.
- Opciones de despliegue: app TokForge (Google Play en Android, TestFlight en iOS) con el motor MNN; no se documentan vLLM, llama.cpp, Ollama ni TGI para este bundle.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| TokForge-Bonsai-2-4B-MNN | 4B | no disponible | Ternaria 4-bit (bloque 64), MNN | Apache-2.0 | Hugging Face, app TokForge |
| prism-ml/Ternary-Bonsai-2-4B-gguf | 4B | no disponible | Ternaria ~2-bit (PQ2_0), GGUF | no disponible en la información | Hugging Face |
| Qwen/Qwen3.5-4B | 4B | no disponible | Float original | no disponible en la información | Hugging Face |

El bundle MNN ocupa aproximadamente el doble que el archivo PQ2_0 de Prism (1.146.465.120 bytes) porque almacena los valores ternarios en 4 bits en lugar de unos 2 bits. No se dispone de datos de rendimiento comparativo entre estas variantes.

## Limitaciones y advertencias

- Solo texto: no incluye la capacidad de visión del modelo original; cualquier caso de uso con imágenes depende de un helper externo de la app.
- Idiomas: únicamente inglés según la model card; no se garantiza calidad en castellano u otros idiomas.
- Fidelidad parcial: las dos proyecciones de compuerta de cada capa de atención linear se almacenan en 4-bit en lugar de float32, por lo que no son exactas respecto a Prism; las normas permanecen en float.
- Tamaño: el uso de 4 bits por peso ternario duplica aproximadamente el tamaño frente al archivo PQ2_0 de Prism, lo que afecta al almacenamiento y a la descarga.
- Sesgos y alucinaciones: no se documentan evaluaciones de sesgo ni tasas de alucinación; al derivar de Qwen3.5-4B, hereda los riesgos del modelo base, no caracterizados en esta ficha.
- Contexto: la longitud de contexto no está indicada en la información disponible, lo que impide planificar casos de uso con ventanas largas.
- Licencia: Apache-2.0 permite uso comercial, pero deben respetarse las condiciones del modelo base Qwen3.5-4B y del modelo intermedio de Prism; el archivo NOTICE acredita a Prism ML y Qwen y describe los cambios realizados.
- Producción: el bundle está pensado para la app TokForge y el motor MNN en Android; no se documentan integraciones con servidores ni runtimes de escritorio.

## Enlaces

- [Hugging Face: darkmaniac7/TokForge-Bonsai-2-4B-MNN](https://huggingface.co/darkmaniac7/TokForge-Bonsai-2-4B-MNN)
- [Modelo base: prism-ml/Ternary-Bonsai-2-4B-gguf](https://huggingface.co/prism-ml/Ternary-Bonsai-2-4B-gguf)
- [Modelo original: Qwen/Qwen3.5-4B](https://huggingface.co/Qwen/Qwen3.5-4B)
- [Motor MNN (Alibaba)](https://github.com/alibaba/MNN)
- [TokForge](https://tokforge.ai)
- [TokForge en Google Play](https://play.google.com/store/apps/details?id=dev.tokforge)
- [TokForge en iOS TestFlight](https://testflight.apple.com/join/jnufjzRr)
- [Discord de TokForge](https://discord.gg/Acv3CBtfVm)
- [Colección TokForge Chat Models (MNN)](https://huggingface.co/collections/darkmaniac7/tokforge-chat-models-mnn-69cdcddc86ea126668a5e9e8)
- [Colección TokForge Bonsai 2 Ternary Models](https://huggingface.co/collections/darkmaniac7/tokforge-bonsai-2-ternary-models-6af3fdd7a548b444c61a1982)
