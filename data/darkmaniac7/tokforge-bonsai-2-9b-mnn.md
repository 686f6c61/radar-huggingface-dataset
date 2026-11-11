# darkmaniac7/TokForge-Bonsai-2-9B-MNN

## Resumen

TokForge-Bonsai-2-9B-MNN es una conversión al formato MNN del modelo Ternary Bonsai 2 9B de Prism ML, publicada por el desarrollador darkmaniac7 bajo el paraguas de TokForge para inferencia en dispositivos móviles Android. El modelo base es Qwen3.5 9B, un transformer de 32 capas (24 de atención lineal y 8 de atención completa) con tamaño oculto 4096, cuyos pesos han sido ternarizados: cada valor es -1, 0 o +1 multiplicado por una escala por grupo de 128.

La relevancia de esta ficha reside en que demuestra una ruta viable para ejecutar un modelo de 9B parámetros en teléfonos con 12 GB de RAM o más, sin conexión a red una vez descargado. El bundle ocupa 6,52 GB repartidos en 10 ficheros y utiliza cuantización ternaria empaquetada en valores de 4 bits con bloque 64, embeddings en BF16 y una cabeza de salida también en 4 bits.

El modelo es estrictamente de texto: la parte de visión del Bonsai original no está incluida y, en la aplicación TokForge, las imágenes se describen mediante un helper interno antes de pasar la descripción al modelo. La licencia es Apache-2.0 y el idioma declarado es inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Qwen3.5 con 32 capas (24 de atención lineal, 8 de atención completa), hidden size 4096 |
| Parametros totales | 9B (modelo base Qwen3.5-9B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Ternaria empaquetada en 4 bits (bloque 64), embeddings BF16, cabeza de salida 4 bits |
| Idiomas soportados | en (inglés) |
| Licencia | Apache-2.0 |
| Formato de pesos | MNN bundle (`llm.mnn.weight`, `embeddings_bf16.bin`, `tokenizer.mtok`) |

## Arquitectura y entrenamiento

La arquitectura subyacente es Qwen3.5 9B, un transformer de 32 capas que combina 24 capas de atención lineal con 8 de atención completa, con dimensión oculta de 4096. Sobre esta base, Prism ML aplica ternarización: las matrices de pesos grandes se representan como valores -1, 0 o +1 multiplicados por una escala por grupo de 128. El bundle MNN conserva los pesos en la base rotada original de Prism, aplicando la misma rotación Walsh-Hadamard (bloques de 4096) y patrón de signos +1/-1 dentro del grafo mediante operaciones MNN estándar (dos productos matriciales de 64x64, una transposición y una multiplicación de signos), de modo que el modelo calcula la misma función que el runtime de Prism.

La conversión parte del fichero `Ternary-Bonsai-2-9B-PQ2_0.gguf` (2.416.851.840 bytes) en el commit `5b2abb02362efbed46bbe204014b02837778b2c2`. Los códigos ternarios empaquetados a 2 bits se desempaquetan y se reempaquetan sin pérdida, y los tensores se reorganizan como checkpoint Qwen3.5 (inversa de la conversión de llama.cpp) manteniendo la base rotada. Se reutilizan sin cambios el tokenizador y la plantilla de chat de Qwen3.5 9B. No se dispone de información sobre el dataset de entrenamiento, número de tokens, ni si hubo RLHF o DPO en la información proporcionada.

## Capacidades

- Generación de texto conversacional en inglés, orientada a chat multi-turno en dispositivo.
- Razonamiento y respuesta a preguntas dentro del ámbito del modelo base Qwen3.5 9B.
- Ejecución completamente offline una vez descargado el bundle en el teléfono.
- Selección automática de ruta de cómputo CPU o GPU por parte del motor MNN según el dispositivo.
- Soporte de plantilla de chat de Qwen3.5 (heredada sin cambios).
- Capacidad multimodal de visión no incluida: el bundle solo contiene el modelo de lenguaje.
- Soporte de tool calling, function calling, agentes y modo thinking: no disponible en la información proporcionada.

## Casos de uso

- Asistente de chat offline en Android: el modelo se ejecuta íntegramente en el teléfono mediante MNN, por lo que permite conversaciones sin conexión tras la descarga inicial de 6,52 GB, útil en entornos sin cobertura o con requisitos de privacidad.
- Atención al cliente en campo: técnicos que trabajan en ubicaciones remotas pueden consultar procedimientos y resolver dudas en lenguaje natural sin depender de conectividad.
- Procesamiento de documentación sensible: al no salir los datos del dispositivo, encaja en escenarios donde la información no puede enviarse a servicios en la nube.
- Descripción asistida de imágenes: en TokForge, un helper de imagen integrado genera una descripción que el modelo utiliza como contexto para responder preguntas sobre fotos, aunque la visión no esté en el bundle.
- Prototipado de aplicaciones móviles con IA: desarrolladores que quieran validar experiencias de chat on-device con un modelo de 9B pueden usar este bundle como referencia de integración MNN.
- Educación y aprendizaje de idiomas: conversación guiada en inglés en dispositivos de gama alta con 12 GB de RAM o más, sin coste de API.
- Evaluación de cuantización ternaria: investigadores pueden comparar el comportamiento de un 9B ternario frente a su versión completa en tareas de texto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- RAM del dispositivo: 12 GB o más según el catálogo de TokForge para Android.
- Almacenamiento: 6,52 GB para los 10 ficheros del bundle.
- GPU de escritorio: no aplica; el bundle está pensado para el motor MNN en Android, no para inferencia en servidor.
- Cabe en GPU de consumo: no disponible para este formato; el formato MNN está orientado a móvil.
- Opciones de despliegue: aplicación TokForge (Google Play en Android, TestFlight en iOS) y motor MNN de Alibaba.
- Latencia y throughput: no disponibles en la información proporcionada; dependen del teléfono y de la ruta CPU/GPU elegida por MNN.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| TokForge-Bonsai-2-9B-MNN | 9B | no disponible | Ternaria 4 bits + BF16 embeddings | Apache-2.0 | MNN | Hugging Face, app TokForge |
| prism-ml/Ternary-Bonsai-2-9B-gguf | 9B | no disponible | Ternaria ~2 bits (PQ2_0) | no disponible | GGUF | Hugging Face |
| Qwen/Qwen3.5-9B | 9B | no disponible | Pesos completos (BF16/FP16) | no disponible | safetensors | Hugging Face |

La comparativa se limita a los tres modelos citados en la información disponible; no se han identificado otras alternativas ternarias on-device con datos verificables.

## Limitaciones y advertencias

- Modelo solo de texto: la capacidad de visión del Bonsai 2 original no está incluida en este bundle.
- Idioma declarado únicamente inglés; el rendimiento en castellano u otros idiomas no está garantizado.
- Los pesos ternarios se almacenan a 4 bits en lugar de los ~2 bits del fichero de Prism, por lo que el bundle ocupa aproximadamente el doble que el PQ2_0 original.
- Las dos proyecciones de compuerta pequeñas de cada capa de atención lineal no son exactas: Prism las guarda en float32 y aquí se cuantizan a 4 bits, como en otros bundles MNN de Qwen3.5.
- Los embeddings se redondean a BF16 tras deshacer la rotación, lo que introduce un redondeo respecto a los valores originales.
- Riesgo de alucinación inherente a un modelo de lenguaje de 9B cuantizado; no se han publicado evaluaciones específicas de este bundle.
- Sesgos conocidos: no disponibles en la información proporcionada.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero deben conservarse los avisos de atribución a Prism ML y Qwen recogidos en el fichero NOTICE.
- Dependencia del ecosistema TokForge/MNN: no es un formato portable a vLLM, llama.cpp u Ollama.

## Enlaces

- Hugging Face: https://huggingface.co/darkmaniac7/TokForge-Bonsai-2-9B-MNN
- Modelo base ternario: https://huggingface.co/prism-ml/Ternary-Bonsai-2-9B-gguf
- Modelo base original: https://huggingface.co/Qwen/Qwen3.5-9B
- Motor MNN: https://github.com/alibaba/MNN
- Web de TokForge: https://tokforge.ai
- Discord de TokForge: https://discord.gg/Acv3CBtfVm
- Google Play: https://play.google.com/store/apps/details?id=dev.tokforge
- iOS TestFlight: https://testflight.apple.com/join/jnufjzRr
- Colección TokForge Chat Models (MNN): https://huggingface.co/collections/darkmaniac7/tokforge-chat-models-mnn-69cdcddc86ea126668a5e9e8
- Colección TokForge Bonsai 2 Ternary Models: https://huggingface.co/collections/darkmaniac7/tokforge-bonsai-2-ternary-models-6af3fdd7a548b444c61a1982
