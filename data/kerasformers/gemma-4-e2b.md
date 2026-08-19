# kerasformers/gemma-4-e2b

## Resumen

`kerasformers/gemma-4-e2b` es una conversión íntegra en Keras 3 del modelo `google/gemma-4-E2B`, desarrollada por el equipo de KerasFormers. Se trata de un modelo multimodal any-to-any que acepta entradas de texto, imagen y audio, y genera texto como salida. Con 2.3 mil millones de parámetros efectivos (5.1 mil millones incluyendo embeddings), está diseñado para ejecutarse de forma eficiente en una amplia gama de hardware, incluyendo GPUs de consumo. Su relevancia radica en ofrecer una implementación unificada que funciona sin modificaciones en TensorFlow, PyTorch y JAX, facilitando la experimentación y el despliegue en entornos heterogéneos. El modelo tiene una ventana de contexto de 128K tokens y utiliza una arquitectura transformer con atención de ventana deslizante de 512 tokens, junto con encoders especializados para visión y audio.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal con atención de ventana deslizante (sliding window) y encoders de visión y audio |
| Parametros totales | 5.1B (incluyendo embeddings) / 2.3B efectivos (sin embeddings) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 128K tokens |
| Tipos de cuantizacion | bfloat16 (por defecto), int8 (opcional) |
| Idiomas soportados | Inglés (según model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | No disponible (probablemente formato Keras, no especificado) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura de la familia Gemma 4, un transformer multimodal con atención de ventana deslizante de 512 tokens, lo que permite manejar contextos largos de hasta 128K tokens de forma eficiente. Incorpora un encoder de visión de aproximadamente 150 millones de parámetros y un encoder de audio de unos 300 millones, que procesan las entradas multimodales antes de la generación de texto. La conversión a Keras 3 mantiene los pesos originales en bfloat16 y permite cargarlos en float32 o cuantizarlos a int8. No se dispone de información detallada sobre el entrenamiento del modelo original (datos, número de tokens, técnicas de alineación como RLHF o DPO), ya que la model card se centra en la implementación técnica y remite a la ficha de Google para esos detalles.

## Capacidades

- Generación de texto a partir de entradas multimodales: texto, imagen y audio.
- Comprensión de imágenes: puede describir contenido visual, responder preguntas sobre imágenes y realizar tareas de razonamiento visual.
- Comprensión de audio: puede transcribir audio, identificar sonidos y responder a consultas basadas en clips de audio.
- Conversación multimodal: soporta diálogos multi-turno donde el usuario puede intercalar texto, imágenes y audio.
- Ejecución multiplataforma: la misma implementación funciona en TensorFlow, PyTorch y JAX, facilitando la portabilidad entre frameworks.
- Carga flexible: permite usar pesos en bfloat16, float32 o cuantización int8 para adaptarse a distintos requisitos de memoria.

## Casos de uso

- Asistentes virtuales multimodales: el modelo puede gestionar conversaciones donde el usuario envía fotos, notas de voz y texto, respondiendo de forma coherente y contextualizada gracias a su ventana de 128K tokens.
- Análisis de contenido multimedia: útil para generar descripciones automáticas de imágenes y transcripciones de audio en aplicaciones de archivado, accesibilidad o moderación de contenido.
- Educación interactiva: puede servir como tutor que explica conceptos a partir de diagramas, vídeos (con pista de audio) o preguntas escritas, adaptándose a distintos formatos de entrada.
- Automatización de soporte técnico: integrado en sistemas de atención al cliente, puede procesar capturas de pantalla, mensajes de voz y texto para diagnosticar problemas y ofrecer soluciones.
- Desarrollo de prototipos rápidos: al ser una implementación Keras 3, los desarrolladores pueden experimentar con el modelo en notebooks o entornos de investigación sin necesidad de infraestructura pesada, gracias a su tamaño reducido.
- Aplicaciones en edge computing: con cuantización int8, el modelo puede desplegarse en dispositivos con recursos limitados, como Raspberry Pi o GPUs de gama baja, para tareas de visión y audio en tiempo real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 10.2 GB en bfloat16 (5.1B parámetros × 2 bytes) y alrededor de 5.1 GB en int8, más overhead de activaciones y memoria intermedia.
- GPU recomendadas: para bfloat16, se necesita una GPU con al menos 12 GB de VRAM (por ejemplo, RTX 3060 12GB, RTX 4070, A10). Con cuantización int8, puede funcionar en GPUs con 6-8 GB (RTX 3060 8GB, RTX 4060).
- Compatibilidad con GPUs de consumo: sí, cabe en GPUs consumer de gama media-alta, especialmente con cuantización.
- Opciones de despliegue: al ser Keras 3, se puede ejecutar directamente con TensorFlow, PyTorch o JAX. No se menciona soporte nativo para vLLM, llama.cpp u Ollama, pero podría adaptarse mediante conversión a otros formatos.
- Latencia y throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de comparaciones directas con otros modelos en la información proporcionada. Sin embargo, dentro de la familia Gemma 4, el E2B es la variante más pequeña, con 2.3B parámetros efectivos, frente a los 4.5B del E4B, los 11.95B del 12B Unified y los 30.7B del 31B Dense. Todos comparten la misma arquitectura base y contexto de 128K (excepto los modelos más grandes que llegan a 256K), pero el E2B es el más ligero y adecuado para entornos con restricciones de memoria.

## Limitaciones y advertencias

- El modelo solo soporta inglés según la model card, lo que limita su uso en aplicaciones multilingües.
- La atención de ventana deslizante de 512 tokens puede dificultar la captura de dependencias de largo alcance dentro de la ventana de 128K, aunque el contexto global sigue disponible.
- Al ser un modelo pequeño (2.3B efectivos), su rendimiento en tareas complejas de razonamiento o generación de código puede ser inferior al de modelos más grandes.
- No se proporcionan detalles sobre sesgos o riesgos de alucinación; se recomienda consultar la model card de Google para conocer las limitaciones del modelo original.
- La licencia Apache 2.0 permite uso comercial, pero es necesario verificar los términos específicos del modelo base de Google, ya que pueden existir restricciones adicionales.
- El formato de pesos no está documentado explícitamente; aunque la carga se realiza mediante `from_weights`, la interoperabilidad con otras herramientas (como vLLM o llama.cpp) no está garantizada sin conversión previa.

## Enlaces

- [HuggingFace: kerasformers/gemma-4-e2b](https://huggingface.co/kerasformers/gemma-4-e2b)
- [Modelo base: google/gemma-4-E2B](https://huggingface.co/google/gemma-4-E2B)
- [Repositorio GitHub de KerasFormers](https://github.com/IMvision12/KerasFormers)
- [Documentación de Gemma 4 en KerasFormers](https://imvision12.github.io/KerasFormers/gemma4/)
- [Colección de variantes Gemma 4 en HuggingFace](https://huggingface.co/kerasformers)
