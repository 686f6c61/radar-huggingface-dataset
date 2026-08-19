# anquachdev/hibiki-1b-mlx-q8

## Resumen

Hibiki 1B MLX Q8 es una cuantización de peso (weight-only) del modelo de voz a voz Hibiki 1B, desarrollado por Kyutai, adaptado para el ecosistema MLX de Apple. El modelo original es un sistema de conversación speech-to-speech de 1B parámetros que procesa audio directamente, sin necesidad de transcripción intermedia, y opera en tiempo real con baja latencia. Esta versión cuantizada reduce el tamaño de los pesos lineales del modelo de lenguaje a Q8 (group size 64), manteniendo intactos el codec Mimi, los embeddings, las capas de normalización y el tokenizador.

La cuantización ha sido realizada por el usuario anquachdev, y el repositorio contiene los pesos en formato MLX listos para usar en aplicaciones de Apple Silicon. El modelo soporta francés e inglés, y se distribuye bajo licencia CC-BY-4.0, lo que permite uso comercial con atribución. Aunque el tamaño del repositorio es de 2.5 GB, la cuantización Q8 reduce la huella de memoria en comparación con la versión bf16, facilitando su ejecución en dispositivos con memoria unificada limitada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (modelo speech-to-speech, arquitectura detallada no disponible) |
| Parametros totales | 1B (según nombre del modelo base, no confirmado) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8 (group size 64) |
| Idiomas soportados | fr, en |
| Licencia | cc-by-4.0 |
| Formato de pesos | MLX (formato nativo, probablemente safetensors o .npz) |

## Arquitectura y entrenamiento

El modelo base Hibiki 1B es un sistema de conversación speech-to-speech desarrollado por Kyutai, que integra un codec neuronal (Mimi) para comprimir y descomprimir audio, junto con un modelo de lenguaje que genera respuestas directamente en el espacio latente del codec. La arquitectura exacta del transformer (número de capas, dimensiones, atención) no se especifica en la información disponible. El modelo fue entrenado con datos de voz y texto en francés e inglés, con técnicas de alineación y ajuste para conversación natural.

Esta versión MLX Q8 es una cuantización de solo pesos (weight-only) aplicada exclusivamente a las capas lineales compatibles con MLX. No se realizó ningún entrenamiento adicional ni ajuste fino. El codec Mimi, los embeddings, las capas de normalización y el tokenizador permanecen sin cambios, lo que preserva la calidad de codificación de audio y la integridad del vocabulario. La cuantización Q8 con group size 64 reduce la precisión de los pesos de 16 bits a 8 bits, lo que disminuye el uso de memoria y acelera la inferencia en hardware Apple, a costa de una posible pérdida mínima de fidelidad.

## Capacidades

- Conversación de voz a voz en tiempo real: el modelo recibe audio del usuario y genera audio de respuesta sin transcripción intermedia.
- Soporte bilingüe: francés e inglés, con capacidad de cambio de idioma dentro de una conversación.
- Procesamiento de audio nativo: utiliza el codec Mimi para representar el habla en tokens discretos, lo que permite un diálogo fluido con baja latencia.
- Compatible con MLX: integración directa con el framework MLX de Apple para inferencia en GPU y CPU unificadas.
- Cuantización Q8: reduce el tamaño del modelo y el consumo de memoria, manteniendo la funcionalidad completa del modelo base.

## Casos de uso

- Asistentes de voz embebidos en macOS: el modelo puede integrarse en aplicaciones de escritorio para proporcionar un asistente conversacional que responde de forma natural, aprovechando la aceleración MLX en Macs con chip M1 o superior.
- Traducción oral simultánea: dado que soporta francés e inglés, puede usarse para interpretar conversaciones bilingües en tiempo real, aunque no se garantiza una traducción literal.
- Prototipado de interfaces de voz: los desarrolladores pueden crear demos de aplicaciones de voz a voz sin necesidad de infraestructura en la nube, gracias al tamaño reducido del modelo cuantizado.
- Educación y aprendizaje de idiomas: el modelo puede actuar como interlocutor para practicar conversación en francés o inglés, ofreciendo respuestas contextuales y naturales.
- Accesibilidad: puede integrarse en herramientas de asistencia para personas con discapacidad visual o motora, permitiendo la interacción por voz con el ordenador.
- Investigación en interacción humano-máquina: sirve como base para experimentos sobre diálogo oral, análisis de prosodia y evaluación de modelos speech-to-speech en entornos locales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye métricas de calidad de voz, latencia o comparaciones con otros modelos.

## Requisitos de hardware

- Memoria: el repositorio ocupa 2.5 GB, por lo que se recomienda un mínimo de 8 GB de memoria unificada en Apple Silicon para cargar el modelo y ejecutar inferencia con holgura.
- GPU: compatible con cualquier chip Apple Silicon (M1, M2, M3, M4) gracias al framework MLX. La inferencia se acelera mediante la GPU integrada.
- CPU: puede ejecutarse en CPU, aunque con mayor latencia; se recomienda GPU para uso interactivo.
- Despliegue: se puede usar directamente con la librería MLX de Python, o mediante herramientas como mlx-lm si se adapta el formato. No es compatible con vLLM, llama.cpp u Ollama, ya que esos entornos no soportan modelos MLX de forma nativa.
- Latencia y throughput: no se proporcionan datos específicos; se espera que la cuantización Q8 ofrezca una mejora significativa frente a bf16 en velocidad de inferencia en hardware Apple.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa fiable con otros modelos de voz a voz de tamaño similar. El modelo base Hibiki 1B es uno de los pocos modelos speech-to-speech abiertos con licencia permisiva, pero no se han publicado comparaciones directas con alternativas como Moshi (también de Kyutai) o modelos propietarios.

## Limitaciones y advertencias

- La cuantización Q8 puede introducir una ligera degradación en la calidad de las respuestas en comparación con la versión bf16, aunque en la práctica suele ser imperceptible.
- El modelo solo soporta francés e inglés; no se garantiza un rendimiento adecuado en otros idiomas.
- Al ser un modelo de voz a voz, no está diseñado para tareas de texto puro ni para razonamiento simbólico complejo.
- La latencia en tiempo real depende del hardware; en Macs con poca memoria o chips antiguos, puede no alcanzar el rendimiento interactivo esperado.
- La licencia CC-BY-4.0 permite uso comercial, pero exige atribución al autor original (Kyutai) y al autor de la cuantización.
- No se han publicado evaluaciones de sesgos o alucinaciones para esta versión cuantizada; se recomienda probar en el dominio de aplicación antes de desplegar en producción.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/anquachdev/hibiki-1b-mlx-q8
- Modelo base (bf16): https://huggingface.co/kyutai/hibiki-1b-mlx-bf16
- Sitio web de Kyutai (organización desarrolladora): https://kyutai.org (enlace no verificado, se deduce de la autoría)
