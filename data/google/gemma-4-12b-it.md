# google/gemma-4-12B-it

## Resumen

Gemma 4 12B Unified es un modelo multimodal de pesos abiertos desarrollado por Google DeepMind, perteneciente a la familia Gemma 4. Se trata de un transformer decoder-only denso de 11.959.730.224 parámetros (aproximadamente 11,95B) que procesa entradas de texto, imagen y audio, y genera salida de texto. Su rasgo diferencial frente al resto de la familia es su arquitectura *encoder-free*: en lugar de emplear codificadores dedicados de visión y audio, proyecta directamente parches de imagen y formas de onda de audio al espacio de embeddings del LLM mediante capas lineales ligeras.

El modelo está diseñado para ejecución local en GPUs de consumo y estaciones de trabajo, con una ventana de contexto de 256K tokens, vocabulario de 262K tokens y soporte multilingüe en más de 140 idiomas. Incorpora modos de razonamiento configurables (*thinking modes*), soporte nativo del rol `system` y function calling, lo que lo orienta a flujos agénticos y de generación de código.

Su relevancia actual radica en combinar multimodalidad nativa (texto, imagen, audio) con un tamaño contenido (~12B) y licencia Apache 2.0, lo que facilita su despliegue en producción y su ajuste fino en una sola pasada sobre todas las modalidades. El modelo base preentrenado es `google/gemma-4-12B` y esta variante es la instruction-tuned.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso con atención híbrida (sliding window local + atención global), sin codificadores multimodales (encoder-free) |
| Parámetros totales | 11.959.730.224 (~11,95B) |
| Parámetros activos | No aplica (modelo denso) |
| Longitud de contexto | 256K tokens |
| Tipos de cuantización | No disponible (no especificado en la información proporcionada) |
| Idiomas soportados | Más de 140 idiomas |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

Otros datos técnicos: 48 capas, ventana deslizante de 1024 tokens, vocabulario de 262K tokens, tamaño del repositorio de 54,5 GB. Modalidades soportadas: texto, imagen y audio (entrada); texto (salida).

## Arquitectura y entrenamiento

El modelo emplea una arquitectura transformer decoder-only densa de 48 capas con un mecanismo de atención híbrido que intercala atención local de ventana deslizante (1024 tokens) con atención global completa, garantizando que la capa final sea siempre global. Para optimizar el consumo de memoria en contextos largos, las capas globales utilizan claves y valores unificados y aplican Proportional RoPE (p-RoPE). La innovación principal es la eliminación de codificadores multimodales: los parches de imagen en bruto y las formas de onda de audio se proyectan directamente al espacio de embeddings del LLM mediante capas lineales ligeras, lo que reduce la latencia multimodal y permite ajustar todo el modelo en una sola pasada.

No se dispone en la información proporcionada del número de tokens de entrenamiento, la composición del dataset ni los detalles de las etapas de alineación (RLHF/DPO). El modelo pertenece a la familia Gemma 4, que incluye variantes densas (E2B, E4B, 12B, 31B) y una variante MoE (26B A4B); las variantes pequeñas incorporan Per-Layer Embeddings (PLE) para eficiencia en dispositivo, mecanismo que no se indica para el 12B.

## Capacidades

- Generación de texto y razonamiento con modos de pensamiento configurables (*thinking modes*).
- Comprensión de imágenes con soporte de relación de aspecto y resolución variables.
- Comprensión de audio nativa (sin codificador separado) en las variantes E2B, E4B y 12B.
- Procesamiento de vídeo como entrada multimodal.
- Generación y razonamiento sobre código, con mejoras notables en benchmarks de programación según la model card.
- Soporte nativo de function calling / tool calling.
- Capacidades agénticas y razonamiento multi-paso para agentes autónomos.
- Soporte multilingüe en más de 140 idiomas.
- Soporte nativo del rol `system` para conversaciones estructuradas y controlables.
- Salida exclusivamente de texto (no genera imagen ni audio).

## Casos de uso

- Asistencia al cliente multimodal: el modelo puede recibir capturas de pantalla o notas de voz junto con texto y mantener conversaciones multi-turno gracias a su ventana de 256K tokens y su comprensión nativa de imagen y audio.
- Generación de código en producción: con soporte de function calling y rol `system`, puede integrarse en pipelines de CI/CD para revisión de código, generación de tests y corrección automatizada.
- Agentes autónomos de escritorio: su tamaño (~12B) y su capacidad agéntica permiten ejecutarlo localmente en una estación de trabajo para tareas de automatización con llamadas a herramientas.
- Análisis de documentos largos con imágenes: informes, contratos o papers con figuras y tablas pueden procesarse en una sola pasada aprovechando el contexto de 256K tokens y la entrada de imagen.
- Transcripción y análisis de audio local: reuniones, entrevistas o notas de voz pueden procesarse sin codificador externo ni servicios en la nube, reduciendo latencia y preservando privacidad.
- Atención al cliente multilingüe: el soporte de más de 140 idiomas permite desplegar un único modelo para mercados con varios idiomas sin modelos auxiliares.
- Asistente de accesibilidad: descripción de imágenes y audio en dispositivo para aplicaciones de asistencia a personas con discapacidad visual, con ejecución local en hardware de consumo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con ~11,95B parámetros, en FP16 requeriría aproximadamente 24 GB solo para pesos, y en cuantizaciones de 8 o 4 bits bajaría a rangos de ~12 GB y ~6-7 GB respectivamente (estimación orientativa, no confirmada en la información proporcionada).
- GPU recomendadas: no especificadas en la información disponible. Por tamaño, encaja en GPUs de estación de trabajo y consumo de gama alta; la model card lo posiciona para "consumer GPUs and workstations".
- ¿Cabe en GPU de consumo? La model card indica que la familia está pensada para GPUs de consumo en los tamaños 12B, 26B A4B y 31B; no se detallan modelos concretos.
- Opciones de despliegue: compatible con `transformers`; los tags indican `endpoints_compatible` y `deploy:sagemaker`. No se confirman en la información otras opciones como vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Modalidades | Licencia |
|---|---|---|---|---|
| Gemma 4 12B Unified (este) | 11,95B | 256K | Texto, imagen, audio | Apache 2.0 |
| Gemma 4 31B Dense | 30,7B | 256K | Texto, imagen | Apache 2.0 |
| Gemma 4 E4B | 4,5B efectivos (8B con embeddings) | 128K | Texto, imagen, audio | Apache 2.0 |
| Gemma 4 26B A4B MoE | 26B totales (4B activos) | No disponible en el extracto | No disponible en el extracto | Apache 2.0 |

No se dispone de datos de rendimiento comparativo (benchmarks) en la información proporcionada para establecer una comparación cuantitativa con alternativas de otros fabricantes.

## Limitaciones y advertencias

- Riesgo de alucinación inherente a los modelos generativos; no se documentan tasas específicas en la información disponible.
- Sesgos conocidos: no documentados en la información proporcionada; deben evaluarse antes de un despliegue en producción.
- La salida es únicamente texto: no genera imagen ni audio pese a aceptar esas modalidades como entrada.
- Aunque la licencia es Apache 2.0, la model card enlaza a los términos específicos de Gemma 4 (`gemma_4_license`); conviene revisar dichos términos antes de un uso comercial.
- El soporte de audio no está presente en la variante 31B de la familia, por lo que la portabilidad de flujos de audio entre tamaños no es directa.
- No se han publicado en la información disponible detalles sobre cuantizaciones oficiales, lo que puede afectar a la planificación de despliegues con memoria limitada.
- El tamaño del repositorio (54,5 GB) implica requisitos de almacenamiento y ancho de banda considerables para su descarga y despliegue.

## Enlaces

- Hugging Face: https://huggingface.co/google/gemma-4-12B-it
- Colección Gemma 4 en Hugging Face: https://huggingface.co/collections/google/gemma-4
- GitHub: https://github.com/google-gemma
- Blog de lanzamiento: https://blog.google/innovation-and-ai/technology/developers-tools/introducing-gemma-4-12B/
- Documentación: https://ai.google.dev/gemma/docs/core
- Informe técnico (arXiv): https://arxiv.org/abs/2607.02770
- Licencia: https://ai.google.dev/gemma/docs/gemma_4_license
- Página de modelos Gemma de Google DeepMind: https://deepmind.google/models/gemma/
