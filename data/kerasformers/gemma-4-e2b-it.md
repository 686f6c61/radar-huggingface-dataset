# kerasformers/gemma-4-e2b-it

## Resumen

`kerasformers/gemma-4-e2b-it` es una conversión íntegra en Keras 3 del modelo `google/gemma-4-E2B-it`, desarrollada por el equipo de KerasFormers. Se trata de un modelo multimodal any-to-any que acepta imagen, audio y texto como entrada y genera texto como salida. La implementación es única y funciona sin modificaciones sobre los tres backends principales de Keras: TensorFlow, PyTorch y JAX.

El modelo pertenece a la familia Gemma 4 de Google, concretamente a la variante eficiente E2B, con 2.3 mil millones de parámetros efectivos (5.1 mil millones incluyendo embeddings), 35 capas, ventana de contexto de 128.000 tokens y atención de ventana deslizante de 512 tokens. Incluye encoders de visión (~150M de parámetros) y de audio (~300M de parámetros). Los pesos se distribuyen en bfloat16 y el repositorio ocupa 10.2 GB.

Su relevancia radica en ofrecer una alternativa multiplataforma al modelo original de Google, permitiendo a desarrolladores e investigadores ejecutar Gemma 4 en cualquier framework de Keras sin necesidad de adaptar el código. La licencia Apache 2.0 facilita su uso comercial y su integración en proyectos propietarios.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (encoder de visión + encoder de audio + decoder de texto) con atención de ventana deslizante de 512 tokens |
| Parametros totales | 5.1B (incluyendo embeddings) |
| Parametros activos | 2.3B (efectivos) |
| Longitud de contexto | 128K tokens |
| Tipos de cuantizacion | bfloat16 (por defecto), int8 (opcional) |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (almacenados en bfloat16, formato de archivo no especificado) |

## Arquitectura y entrenamiento

La arquitectura sigue el diseño de Gemma 4 de Google: un transformer con atención de ventana deslizante (sliding window) de 512 tokens, lo que permite manejar secuencias largas de hasta 128K tokens con un coste computacional reducido. El modelo incorpora un encoder de visión de aproximadamente 150 millones de parámetros y un encoder de audio de unos 300 millones, cuyas salidas se proyectan al espacio de embeddings del decoder de texto. La variante E2B se caracteriza por tener 2.3B de parámetros efectivos, lo que sugiere un diseño con activación selectiva de parámetros (posiblemente MoE), aunque no se especifica explícitamente en la documentación.

No se dispone de información sobre el proceso de entrenamiento: ni el número de tokens, ni la composición del dataset, ni si se aplicaron técnicas como RLHF o DPO. La model card solo indica que se trata de una conversión de pesos del modelo original de Google, por lo que las características de entrenamiento son las mismas que las de `google/gemma-4-E2B-it`, pero no se detallan en la información proporcionada.

## Capacidades

- Generación de texto a partir de entradas multimodales: imagen, audio y texto.
- Descripción de imágenes: el modelo puede analizar una imagen y generar una descripción textual detallada.
- Procesamiento de audio: es capaz de interpretar clips de audio y responder sobre su contenido (por ejemplo, transcribir o resumir).
- Conversación multimodal: admite diálogos multi-turno donde el usuario puede intercalar imágenes, audio y texto.
- Soporte de los tres backends de Keras: TensorFlow, PyTorch y JAX, con la misma implementación.
- Carga en bfloat16 por defecto, con opción de cuantización int8 para reducir el uso de memoria.
- No se mencionan capacidades de tool calling, agentes o razonamiento multi-paso en la documentación disponible.

## Casos de uso

- Asistente de accesibilidad para personas con discapacidad visual: el modelo puede recibir una imagen capturada por la cámara del móvil y generar una descripción en texto, ayudando a entender el entorno.
- Transcripción y resumen de audio: dado un clip de voz o una grabación, el modelo puede transcribir el contenido y generar un resumen textual, útil en reuniones o entrevistas.
- Moderación de contenido multimodal: en plataformas que reciben imágenes y audio, el modelo puede analizar ambos y generar un informe textual sobre si el contenido cumple las políticas.
- Generación de subtítulos para vídeos: combinando fotogramas (imagen) y pista de audio, el modelo puede producir subtítulos descriptivos en inglés.
- Chatbot de atención al cliente con soporte de adjuntos: los usuarios pueden enviar capturas de pantalla o mensajes de voz, y el modelo responde en texto, aprovechando su contexto de 128K tokens para mantener conversaciones largas.
- Herramienta de documentación técnica: a partir de diagramas (imagen) y explicaciones orales (audio), el modelo genera documentación escrita en inglés, facilitando la creación de manuales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se proporcionan métricas como MMLU, HumanEval o GSM8K para este modelo.

## Requisitos de hardware

- El tamaño del repositorio es de 10.2 GB, lo que corresponde a los pesos en bfloat16 (5.1B parámetros × 2 bytes). Para inferencia se recomienda una GPU con al menos 12-16 GB de VRAM para cargar el modelo en bfloat16 sin cuantización.
- Con cuantización int8, el uso de memoria se reduce aproximadamente a la mitad, permitiendo ejecución en GPUs de 8-10 GB como la RTX 3080 o RTX 4060 Ti.
- Para los tres backends, se requiere una GPU compatible con CUDA (NVIDIA) o TPU para JAX. No se especifican modelos concretos de GPU.
- Opciones de despliegue: al ser una librería Keras, se puede integrar en entornos con TensorFlow Serving, o exportar a SavedModel para producción. No se mencionan integraciones con vLLM, llama.cpp u Ollama.
- La latencia y el throughput no están documentados; dependerán del backend elegido y del hardware.

## Comparativa con modelos similares

| Modelo | Parámetros efectivos | Contexto | Modalidades | Licencia |
|---|---|---|---|---|
| kerasformers/gemma-4-e2b-it | 2.3B | 128K | Imagen, audio, texto | Apache 2.0 |
| kerasformers/gemma-4-e4b-it | 4.5B | 128K | Imagen, audio, texto | Apache 2.0 |
| kerasformers/gemma-4-12b-it | 11.95B | 256K | Imagen, texto | Apache 2.0 |
| kerasformers/gemma-4-31b-it | 30.7B | 256K | Imagen, texto | Apache 2.0 |

La comparativa se limita a la familia Gemma 4 de KerasFormers, ya que no se dispone de datos de otros modelos multimodales comparables en la información proporcionada. El E2B es el más ligero y el único con soporte de audio junto con el E4B.

## Limitaciones y advertencias

- Es una conversión de pesos de Keras, no un modelo entrenado desde cero; el rendimiento puede diferir ligeramente del original de Google debido a diferencias en la implementación.
- Solo soporta inglés como idioma de entrada y salida; no se garantiza un buen comportamiento en otros idiomas.
- No se documentan sesgos específicos, pero al ser un modelo derivado de Gemma 4, puede heredar sesgos presentes en los datos de entrenamiento de Google.
- Riesgo de alucinación en tareas de descripción de imágenes o audio, especialmente con entradas ambiguas o de baja calidad.
- La ventana de contexto de 128K tokens es amplia, pero la atención de ventana deslizante de 512 tokens puede limitar la coherencia en pasajes muy largos.
- No se menciona soporte para tool calling ni funciones de agente, por lo que no es adecuado para pipelines de automatización complejos.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda revisar los términos del modelo base de Google por si hubiera restricciones adicionales.

## Enlaces

- [HuggingFace: kerasformers/gemma-4-e2b-it](https://huggingface.co/kerasformers/gemma-4-e2b-it)
- [Repositorio GitHub de KerasFormers](https://github.com/IMvision12/KerasFormers)
- [Documentación de Gemma 4 en KerasFormers](https://imvision12.github.io/KerasFormers/gemma4/)
- [Modelo base: google/gemma-4-E2B-it](https://huggingface.co/google/gemma-4-E2B-it)
