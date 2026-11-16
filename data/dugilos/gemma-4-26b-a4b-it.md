# Dugilos/gemma-4-26B-A4B-it

## Resumen

Gemma 4 26B A4B IT es la variante instruida del modelo multimodal de tipo Mixture-of-Experts (MoE) de la familia Gemma 4, desarrollada por Google DeepMind. El checkpoint aquí referenciado, `Dugilos/gemma-4-26B-A4B-it`, es una publicación derivada del modelo base `google/gemma-4-26B-A4B` que mantiene la licencia Apache 2.0 y el pipeline `image-text-to-text`. El modelo acepta entradas de texto e imagen y genera texto, con una ventana de contexto de 256K tokens y soporte declarado para más de 140 idiomas.

La arquitectura combina atención híbrida (ventanas locales deslizantes de 1024 tokens intercaladas con capas de atención global, garantizando que la última capa sea siempre global) y un esquema MoE con 128 expertos totales, 8 activos por token más un experto compartido. Con 25,2B parámetros totales y aproximadamente 3,8B activos por token, el modelo busca ofrecer un coste de inferencia propio de un modelo de ~4B manteniendo la capacidad de uno de ~26B.

Es relevante porque representa el tramo medio de la familia Gemma 4, orientado a estaciones de trabajo y GPUs de consumo de gama alta, con soporte nativo de *function calling*, modo de razonamiento configurable y *system prompt* nativo. La ficha se basa exclusivamente en los datos de la model card y en los metadatos del repositorio; no se dispone de resultados de benchmarks ni de detalles de entrenamiento más allá de lo indicado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con Mixture-of-Experts y atención híbrida (sliding window local + atención global), p-RoPE en capas globales |
| Parámetros totales | 25,2B según model card; 25.805.936.206 según safetensors |
| Parámetros activos | 3,8B (8 expertos activos de 128 totales + 1 compartido) |
| Longitud de contexto | 256K tokens |
| Tipos de cuantización | no disponible |
| Idiomas soportados | más de 140 idiomas (según model card); lista concreta no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers) |
| Capas | 30 |
| Ventana deslizante | 1024 tokens |
| Tamaño de vocabulario | 262K |
| Modalidades de entrada | texto e imagen |
| Codificador de visión | ~550M parámetros |
| Tamaño del repositorio | 51,6 GB |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only con capas MoE: 128 expertos en total, de los que se activan 8 por token más un experto compartido, lo que resulta en unos 3,8B parámetros activos sobre 25,2B totales. La atención es híbrida: intercala capas con ventana deslizante local de 1024 tokens con capas de atención global, asegurando que la última capa sea siempre global. Las capas globales emplean claves y valores unificados y Proportional RoPE (p-RoPE) para reducir el consumo de memoria en contextos largos. La entrada multimodal de imagen se procesa mediante un codificador de visión de aproximadamente 550M parámetros; a diferencia de la variante 12B Unified, este modelo no es *encoder-free*.

La model card indica que la familia Gemma 4 se distribuye en variantes preentrenada e instruida, con soporte multilingüe en más de 140 idiomas, razonamiento con modos de *thinking* configurables y *system prompt* nativo. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron fases de RLHF o DPO. Tampoco se detallan innovaciones adicionales como decodificación especulativa.

## Capacidades

- Generación de texto y razonamiento con modos de *thinking* configurables.
- Comprensión de imágenes con soporte de relación de aspecto y resolución variables.
- Procesamiento de vídeo (según la descripción de la familia Gemma 4); audio no soportado en esta variante.
- Capacidades de código y matemáticas, con mejoras declaradas en benchmarks de programación.
- *Function calling* nativo y soporte para flujos agénticos y razonamiento multi-paso.
- Soporte nativo del rol `system` para conversaciones estructuradas y controlables.
- Multilingüismo en más de 140 idiomas.
- Conversación multi-turno con ventana de contexto de 256K tokens.

## Casos de uso

- Atención al cliente automatizada: gestión de conversaciones multi-turno con historial extenso gracias a los 256K tokens de contexto, manteniendo coherencia en hilos largos y con soporte de *system prompt* para definir políticas de respuesta.
- Agentes autónomos con *tool calling*: el modelo puede invocar funciones externas de forma nativa y encadenar varios pasos de razonamiento, adecuado para orquestadores de tareas que consultan APIs, bases de datos o servicios internos.
- Análisis de documentos con imágenes: extracción y razonamiento sobre capturas, diagramas o formularios combinando el codificador de visión (~550M parámetros) con el decoder para responder preguntas sobre el contenido visual.
- Asistencia a la programación: generación y revisión de código en pipelines de CI/CD, con soporte de *function calling* para integrarse en herramientas de análisis estático o entornos de desarrollo.
- Procesamiento de vídeo para moderación o resumen: la familia Gemma 4 declara soporte de vídeo, lo que permite describir o clasificar secuencias dentro de flujos de revisión de contenido.
- Despliegue en estación de trabajo: con 3,8B parámetros activos, es viable en GPUs de consumo de gama alta para prototipos locales de asistentes multimodales sin depender de la nube.
- Razonamiento sobre corpus largos multilingües: análisis de contratos, informes o documentación técnica en más de 140 idiomas aprovechando la ventana de 256K tokens.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa basada en el tamaño (25,2B parámetros totales, 51,6 GB en safetensors), en precisión de 16 bits los pesos ocuparían del orden de 50 GB; en cuantizaciones de 8 y 4 bits se reduciría aproximadamente a la mitad y a un cuarto, aunque los tipos de cuantización soportados no se detallan en la información disponible.
- GPU recomendadas: no especificadas por el autor. Por tamaño, cabría esperar despliegues en A100/H100 de 80 GB para FP16/BF16 y en GPUs de consumo de gama alta (RTX 4090, 24 GB) solo con cuantización agresiva.
- ¿Cabe en GPU de consumo? Posiblemente en RTX 4090 o superiores con cuantización de 4 bits, aunque no hay confirmación oficial en la información proporcionada.
- Opciones de despliegue: la librería declarada es `transformers`; el repositorio incluye la etiqueta `endpoints_compatible`. No se confirma soporte de vLLM, llama.cpp, Ollama o TGI en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros totales / activos | Contexto | Modalidades | Licencia |
|---|---|---|---|---|
| Gemma 4 26B A4B IT (este) | 25,2B / 3,8B | 256K | Texto, imagen | Apache 2.0 |
| Gemma 4 31B Dense | 30,7B / denso | 256K | Texto, imagen | Apache 2.0 |
| Gemma 4 12B Unified | 11,95B / denso | 256K | Texto, imagen, audio | Apache 2.0 |
| Gemma 4 E4B | 4,5B efectivos (8B con embeddings) | 128K | Texto, imagen, audio | Apache 2.0 |

La comparación se limita a la propia familia Gemma 4, ya que no se dispone de datos de rendimiento frente a modelos de otros fabricantes en la información proporcionada. Frente a la variante densa de 31B, este modelo reduce los parámetros activos a 3,8B, lo que debería traducirse en menor coste computacional por token a cambio de una arquitectura MoE más compleja de desplegar. Frente a la 12B Unified, añade capacidad total pero pierde la arquitectura *encoder-free* y el soporte de audio.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información disponible; cabe esperar los sesgos habituales de los corpus web multilingües, pero no hay confirmación oficial.
- Riesgo de alucinación: no cuantificado; al ser un modelo generativo con modo de razonamiento, puede producir contenido plausible pero incorrecto, especialmente en tareas de razonamiento largo.
- Limitaciones de contexto o idioma: aunque se declaran más de 140 idiomas, no se detalla el nivel de calidad por idioma; el rendimiento en lenguas de bajos recursos puede ser inferior.
- Restricciones de licencia: la licencia es Apache 2.0, pero la model card enlaza a `license_link` con los términos de Gemma 4 (`ai.google.dev/gemma/docs/gemma_4_license`); conviene verificar la compatibilidad de ambos textos antes de un uso comercial.
- El checkpoint es una publicación derivada de un tercero (`Dugilos`) con 0 descargas y 0 *likes* en el momento de la consulta; no hay garantías de mantenimiento ni de integridad más allá de los metadatos.
- No se dispone de información sobre cuantizaciones oficiales, rendimiento medido ni soporte en motores de inferencia distintos de `transformers`.
- El modelo no soporta audio en esta variante, a diferencia de E2B, E4B y 12B.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Dugilos/gemma-4-26B-A4B-it
- Modelo base: https://huggingface.co/google/gemma-4-26B-A4B
- Colección Gemma 4 en Hugging Face: https://huggingface.co/collections/google/gemma-4
- GitHub de Google Gemma: https://github.com/google-gemma
- Blog de lanzamiento: https://blog.google/innovation-and-ai/technology/developers-tools/gemma-4/
- Documentación: https://ai.google.dev/gemma/docs/core
- Informe técnico (arXiv): https://arxiv.org/abs/2607.02770
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- Página de Gemma en Google DeepMind: https://deepmind.google/models/gemma/
