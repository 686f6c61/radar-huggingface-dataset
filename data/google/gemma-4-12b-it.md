# google/gemma-4-12B-it

## Resumen

Gemma 4 12B Unified es un modelo de lenguaje multimodal de código abierto desarrollado por Google DeepMind, presentado como parte de la familia Gemma 4 en mayo de 2026. Se trata de la variante instruida (it) del modelo base google/gemma-4-12B, con una arquitectura densa de 11,95 mil millones de parámetros y una ventana de contexto de hasta 256 000 tokens. Su característica más distintiva es su diseño *encoder-free*: a diferencia de otros modelos multimodales que emplean codificadores separados para imagen y audio, este modelo proyecta directamente los parches de imagen y las formas de onda de audio al espacio de embeddings del transformador mediante capas lineales ligeras, lo que reduce la latencia y permite un ajuste fino unificado de todas las modalidades.

El modelo acepta entradas de texto, imagen y audio, y genera texto como salida. Está optimizado para ejecución local en dispositivos de consumo, como portátiles y estaciones de trabajo con GPU de gama media, gracias a su tamaño contenido y a su licencia Apache 2.0, que permite uso comercial sin restricciones significativas. Su soporte nativo de *function calling* y de rol de sistema lo hace especialmente adecuado para aplicaciones agénticas y de automatización. La familia Gemma 4 incluye además variantes MoE (26B A4B) y densas de mayor tamaño (31B), pero el 12B Unified destaca por su equilibrio entre capacidades multimodales y requisitos de hardware accesibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Decoder-only transformer con atención híbrida (sliding window + global) y proyección lineal para imagen y audio (encoder-free) |
| Parametros totales | 11,95 mil millones |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 256 000 tokens |
| Tipos de cuantizacion | No disponible (formato safetensors; se pueden generar cuantizaciones de terceros como GGUF, AWQ o GPTQ) |
| Idiomas soportados | Más de 140 idiomas |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura de transformador decoder-only con una atención híbrida que intercala capas de atención local de ventana deslizante (1024 tokens) con capas de atención global completa, garantizando que la última capa sea siempre global. Esta combinación reduce el coste computacional y la memoria en contextos largos, manteniendo al mismo tiempo la capacidad de atender a información distante. Para optimizar aún más el uso de memoria en secuencias extensas, las capas globales comparten Keys y Values unificados y aplican *Proportional RoPE* (p-RoPE), una variante de codificación posicional rotatoria que ajusta la frecuencia según la longitud del contexto.

La característica más innovadora es su naturaleza *encoder-free*: no utiliza codificadores de visión ni de audio separados. En su lugar, los parches de imagen y las muestras de audio se transforman mediante capas lineales ligeras y se inyectan directamente en el espacio de embeddings del modelo. Esto permite que todas las modalidades fluyan a través del mismo transformador, simplificando el ajuste fino y reduciendo la latencia multimodal. El modelo tiene 48 capas, un vocabulario de 262 000 tokens y soporta entrada de texto, imagen y audio, generando únicamente texto como salida.

Los detalles específicos del entrenamiento (número de tokens, composición del dataset, uso de RLHF o DPO) no se han publicado en la información disponible. Se sabe que es la versión instruida (it) del modelo base google/gemma-4-12B, y que el ajuste fino se realizó para mejorar el razonamiento, la codificación y las capacidades agénticas, incluyendo soporte nativo de *function calling* y del rol de sistema.

## Capacidades

- Generación de texto y razonamiento complejo, con modos de pensamiento configurables que permiten activar o desactivar el razonamiento explícito paso a paso.
- Comprensión multimodal de imágenes (con resolución y relación de aspecto variables) y audio, sin necesidad de codificadores externos.
- Codificación de software en múltiples lenguajes, con mejoras notables en benchmarks de programación según la documentación oficial.
- Soporte nativo de *function calling* (llamada a herramientas), lo que permite integrar el modelo en flujos agénticos y automatizaciones.
- Capacidad para actuar como agente autónomo en tareas de múltiples pasos, gracias a su contexto largo y a su habilidad para mantener estado conversacional.
- Soporte nativo del rol de sistema (`system`), que permite estructurar conversaciones y controlar el comportamiento del modelo de forma más precisa.
- Multilingüismo en más de 140 idiomas, con cobertura amplia para tareas de traducción, resumen y generación en contextos internacionales.
- Ventana de contexto de 256 000 tokens, adecuada para procesar documentos extensos, libros completos o conversaciones de larga duración.

## Casos de uso

- Asistente multimodal para análisis de documentos técnicos: el modelo puede procesar simultáneamente texto, diagramas e incluso grabaciones de audio de reuniones, extrayendo información relevante y generando resúmenes ejecutivos. Su contexto de 256K tokens permite manejar informes extensos sin segmentación.
- Generación de código en producción: gracias a su soporte de *function calling*, puede integrarse en pipelines de CI/CD para autocompletar código, revisar pull requests o generar tests unitarios. Su capacidad de razonamiento mejora la calidad de las sugerencias en lenguajes como Python, Java o TypeScript.
- Atención al cliente automatizada: con su ventana de contexto larga y su soporte de rol de sistema, puede gestionar conversaciones multi-turno con historial completo, manteniendo el tono y las políticas de la empresa. La entrada de audio permite transcribir y responder llamadas en tiempo real.
- Análisis de contenido audiovisual: el modelo puede procesar vídeos (a través de frames de imagen y pista de audio) para generar subtítulos, descripciones o detectar eventos relevantes, sin necesidad de pipelines separados de visión o voz.
- Agente de investigación autónomo: combinando su capacidad de razonamiento, *function calling* y contexto largo, puede buscar información en bases de datos, consultar APIs y sintetizar resultados en informes estructurados, actuando como un asistente de investigación semi-autónomo.
- Traducción y localización multilingüe: con soporte para más de 140 idiomas, puede traducir documentos completos, mantener la coherencia terminológica y adaptar contenido culturalmente, todo en un solo paso gracias a su contexto amplio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La documentación oficial menciona mejoras en tareas de codificación y razonamiento, pero no proporciona cifras concretas para MMLU, HumanEval, GSM8K u otros conjuntos de referencia. Se recomienda consultar el informe técnico (arxiv:2607.02770) para obtener datos detallados cuando estén disponibles.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 11,95B parámetros. En precisión FP16/BF16, ocupa aproximadamente 24 GB de VRAM. Con cuantización de 8 bits, se reduce a unos 12 GB, y con 4 bits, a unos 6 GB (estimaciones orientativas basadas en el tamaño del modelo; no hay datos oficiales).
- GPU recomendadas: para ejecución en FP16, se necesitan GPUs con al menos 24 GB de VRAM, como NVIDIA RTX 4090, A100 40GB o similar. Con cuantización de 4 bits, puede ejecutarse en GPUs de consumo con 8 GB de VRAM, como RTX 3060 o RTX 4060.
- En dispositivos de gama alta (portátiles con GPU de 16 GB o más) puede ejecutarse con cuantización de 8 bits sin problemas.
- Opciones de despliegue: compatible con frameworks estándar como vLLM, TensorRT-LLM, llama.cpp, Ollama y Hugging Face TGI. Al ser un modelo safetensors, se puede convertir a GGUF para su uso con llama.cpp y Ollama.
- Latencia y throughput: no disponibles en la información proporcionada. Dependerán del hardware, la cuantización y la longitud de las secuencias.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Modalidades | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Gemma 4 12B Unified | 11,95B | 256K | Texto, imagen, audio | Apache 2.0 | Hugging Face |
| Llama 3.1 8B | 8B | 128K | Texto | Llama 3.1 (uso comercial permitido) | Hugging Face |
| Qwen 2.5 7B | 7,6B | 128K | Texto | Apache 2.0 | Hugging Face |
| Mistral 7B | 7,3B | 32K | Texto | Apache 2.0 | Hugging Face |

La comparativa se limita a parámetros, contexto y licencia, ya que no se dispone de resultados de benchmarks para Gemma 4 12B. Frente a Llama 3.1 8B, Gemma 4 ofrece mayor contexto y multimodalidad, pero con más parámetros. Qwen 2.5 7B y Mistral 7B son más ligeros, pero carecen de soporte multimodal nativo y de contexto tan largo.

## Limitaciones y advertencias

- No se han documentado sesgos específicos en la información disponible, pero como modelo entrenado con datos web, puede reflejar sesgos sociales, culturales o de género presentes en esos datos.
- Riesgo de alucinación: como cualquier modelo generativo, puede producir información falsa o inventada, especialmente en tareas de razonamiento complejo o cuando se le pide datos precisos. Se recomienda verificar las salidas en aplicaciones críticas.
- Limitaciones de idioma: aunque soporta más de 140 idiomas, la calidad puede variar significativamente entre ellos; los idiomas con menos representación en los datos de entrenamiento probablemente tendrán un rendimiento inferior.
- Restricciones de licencia: la licencia Apache 2.0 permite uso comercial, pero se deben revisar los términos adicionales de Google (enlace en la documentación) para asegurar el cumplimiento, especialmente en lo relativo a marcas y atribución.
- Advertencia para producción: al ser un modelo multimodal con entrada de audio e imagen, el preprocesamiento de estas modalidades (muestreo, resolución) puede afectar al rendimiento. Se recomienda probar con datos reales antes de desplegar.
- El modelo genera solo texto; no es capaz de generar imágenes o audio como salida, solo de comprenderlos como entrada.

## Enlaces

- [Hugging Face - google/gemma-4-12B-it](https://huggingface.co/google/gemma-4-12B-it)
- [Blog de lanzamiento de Gemma 4](https://blog.google/innovation-and-ai/technology/developers-tools/introducing-gemma-4-12B/)
- [Documentación oficial de Gemma](https://ai.google.dev/gemma/docs/core)
- [Informe técnico (arXiv:2607.02770)](https://arxiv.org/abs/2607.02770)
- [Colección Gemma 4 en Hugging Face](https://huggingface.co/collections/google/gemma-4)
- [Repositorio GitHub de Google Gemma](https://github.com/google-gemma)
