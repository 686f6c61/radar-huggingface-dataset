# bedmancdn/Qwen3.5-4B-Uncensored-HauhauCS-Aggressive

## Resumen

Qwen3.5-4B-Uncensored-HauhauCS-Aggressive es una variante sin censura del modelo Qwen3.5-4B de Alibaba, desarrollada por HauhauCS y distribuida en este repositorio espejo de bedmancdn. Segun la model card, el modelo elimina los mecanismos de rechazo del modelo base manteniendo intactas sus capacidades, con un indice declarado de 0/465 rechazos y cero perdida de funcionalidad. Se trata de la variante "aggressive", que aplica una eliminacion mas profunda de las negativas del sistema.

Arquitecturalmente, el modelo combina atencion lineal Gated DeltaNet con atencion softmax completa en proporcion 3:1, con 32 capas y 4.205.751.296 parametros densos. Ofrece un contexto nativo de 262K tokens extendible a 1M mediante YaRN, un vocabulario de 248K tokens en 201 idiomas y capacidades multimodales nativas para texto, imagen y video. La licencia Apache-2.0 permite uso comercial sin restricciones.

Su relevancia reside en que combina un tamano compacto de 4B parametros con capacidades avanzadas de razonamiento, multimodalidad y contexto largo, todo ello ejecutable en hardware de consumo mediante cuantizaciones GGUF. El modelo se publico originalmente el 2 de marzo de 2026 y requiere versiones recientes de llama.cpp para su ejecucion, dado que su arquitectura hibrida es nueva.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hibrida: Gated DeltaNet (atencion lineal) + atencion softmax completa, proporcion 3:1 |
| Parametros totales | 4.205.751.296 (4,2B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262K tokens nativos (extendible a 1M con YaRN) |
| Tipos de cuantizacion | BF16, Q8_0, Q6_K, Q4_K_M (formato GGUF) |
| Idiomas soportados | 201 idiomas (ingles, chino y multilingue) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (archivos .gguf) y mmproj para el encoder de vision |

## Arquitectura y entrenamiento

El modelo se basa en el Qwen3.5-4B original de Alibaba, que presenta una arquitectura hibrida innovadora que combina atencion lineal Gated DeltaNet con atencion softmax completa en una proporcion de 3:1. Esta combinacion busca reducir el coste computacional de la atencion en contextos largos manteniendo la calidad de la atencion completa donde es necesaria. El modelo cuenta con 32 capas y 4,2B parametros densos, sin componente de mezcla de expertos (MoE).

El proceso de "uncensoring" realizado por HauhauCS no modifica los datos de entrenamiento ni las capacidades del modelo base, sino que elimina los rechazos y negativas integrados en el modelo original. Segun la model card, el resultado es un modelo funcional al 100 % de lo que los autores originales pretendian, pero sin los rechazos. La variante "aggressive" aplica una eliminacion mas profunda de los rechazos, y el autor advierte que el modelo puede ocasionalmente anadir un breve aviso legal al final de las respuestas, pero esto se considera parte del entrenamiento base y no un rechazo.

El modelo soporta multi-token prediction (MTP), una tecnica que predice varios tokens futuros simultaneamente para acelerar la inferencia. Tambien es nativamente multimodal, con un encoder de vision (mmproj) de 645 MB que permite procesar entradas de imagen y video.

## Capacidades

- Generacion de texto y razonamiento avanzado, incluyendo modo de pensamiento (thinking mode) por defecto y modo directo (non-thinking mode).
- Multimodal nativo: procesamiento de texto, imagen y video mediante el encoder de vision mmproj.
- Multi-token prediction (MTP) para acelerar la inferencia.
- Soporte de contexto largo de 262K tokens nativos, extendible a 1M con YaRN.
- Vocabulario de 248K tokens que cubre 201 idiomas.
- Sin rechazos: no rechaza ninguna peticion, incluidas las que el modelo base rechazaria.
- Compatible con tool calling y agentes (capacidad heredada del modelo Qwen3.5 base).
- Soporte de modos de configuracion diferenciados: temperatura 0.6 con top_p 0.95 para modo pensamiento, temperatura 0.7 con top_p 0.8 para modo directo.

## Casos de uso

- Analisis y procesamiento de documentos extensos: el contexto nativo de 262K tokens permite ingerir libros completos, contratos legales o codigos fuente de gran tamano en una sola pasada, con capacidad de razonamiento sobre todo el contenido.
- Generacion de codigo y asistencia al desarrollo: el modelo hereda las capacidades de codigo de Qwen3.5, con soporte para tool calling y prediccion multitoken, lo que lo hace util para autocompletado y generacion de funciones en entornos de desarrollo.
- Analisis multimodal de imagenes y video: gracias al encoder mmproj, el modelo puede describir, analizar y razonar sobre contenido visual, util para sistemas de descripcion automatica, moderacion de contenido o asistencia a personas con discapacidad visual.
- Traduccion y localizacion multilingue: con soporte para 201 idiomas, puede traducir documentos tecnicos, localizar interfaces y mantener la coherencia terminologica en proyectos multilingues.
- Investigacion academica sobre seguridad de la IA: al ser un modelo sin rechazos, permite estudiar el comportamiento de los LLM cuando se eliminan las salvaguardas, lo que es util para investigar alucinaciones, sesgos y estrategias de mitigacion.
- Desarrollo de aplicaciones de generacion de contenido creativo sin restricciones: adecuado para entornos donde se necesita generar narrativa, guiones o contenido editorial sin las limitaciones de contenido del modelo base.
- Asistentes conversacionales en entornos controlados: puede desplegarse como backend conversacional para chatbots de atencion al cliente, siempre que se implementen filtros adicionales de contenido en la aplicacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye datos de MMLU, HumanEval, GSM8K ni otros benchmarks estandar. La unica metrica declarada es el indice de rechazo de 0/465, que indica que el modelo no rechaza ninguna peticion de las 465 probadas, pero no hay datos de rendimiento comparativo con otros modelos.

## Requisitos de hardware

- Cuantizacion Q4_K_M (2,6 GB + 645 MB del encoder de vision): cabe en GPUs de consumo con 8 GB de VRAM, como RTX 4060, RTX 3070 o RTX 4060 Ti.
- Cuantizacion Q6_K (3,3 GB + encoder): cabe en GPUs de 6-8 GB, como RTX 3060 o RTX 4060.
- Cuantizacion Q8_0 (4,2 GB + encoder): cabe en GPUs de 8-10 GB, como RTX 3080 o RTX 4080.
- Cuantizacion BF16 (7,9 GB + encoder): requiere GPUs con 12 GB o mas de VRAM, como RTX 4070 Ti o RTX 4090.
- El contexto largo (128K+ tokens) incrementa significativamente los requisitos de memoria para la cache KV, por lo que se recomienda usar cuantizaciones mas agresivas (Q4_K_M) para contextos largos.
- Runtime compatibles: llama.cpp, LM Studio, Jan, koboldcpp, Ollama (via integracion de Colab), vLLM, SGLang y KTransformers para despliegue en produccion.
- La arquitectura es nueva (lanzada en marzo de 2026), por lo que se requiere una version reciente de llama.cpp para su ejecucion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Censura |
|---|---|---|---|---|---|
| Qwen3.5-4B (base) | 4,2B | 262K | Texto, imagen, video | Apache-2.0 | Con rechazos |
| Qwen3.5-4B-Uncensored-HauhauCS-Aggressive | 4,2B | 262K | Texto, imagen, video | Apache-2.0 | Sin rechazos |
| Qwen3.5-9B-Uncensored-HauhauCS-Aggressive | 9B | No disponible | No disponible | Apache-2.0 | Sin rechazos |
| Qwen3.5-35B-A3B | 35B (3B activos) | No disponible | Multimodal | No disponible | Sin rechazos (variante uncensored) |

La variante de 4B se diferencia de la de 9B principalmente en el tamano de parametros, lo que afecta a la calidad de razonamiento y a los requisitos de hardware. La variante de 35B-A3B es un modelo MoE con 3B parametros activos, que ofrece un rendimiento superior con coste de inferencia menor que un denso de 35B. No hay datos de benchmarks disponibles para comparar el rendimiento exacto de estos modelos.

## Limitaciones y advertencias

- El modelo no tiene salvaguardas de seguridad: al eliminar los rechazos, puede generar contenido inapropiado, ofensivo o ilegal si se le pide. No es adecuado para despliegue publico sin capas adicionales de moderacion de contenido.
- Puede anadir comentarios legales o avisos al final de las respuestas, segun el autor, aunque esto no impide la generacion del contenido solicitado.
- La arquitectura es nueva y el soporte en llama.cpp es reciente: puede haber problemas de compatibilidad o rendimiento en versiones antiguas de los runtimes.
- Se recomienda mantener al menos 128K de contexto para preservar las capacidades de pensamiento (thinking mode), lo que incrementa los requisitos de memoria.
- El modelo base Qwen3.5-4B tiene sesgos inherentes que pueden amplificarse al eliminar los filtros de rechazo, incluyendo sesgos de genero, etnia o idioma.
- El riesgo de alucinacion es significativo en contextos largos, y la falta de rechazo no implica mayor precision: el modelo puede afirmar datos falsos con la misma conviccion que datos correctos.
- La licencia Apache-2.0 permite uso comercial, pero el modelo se distribuye tal cual, sin garantias de calidad, seguridad o exactitud.
- El repositorio tiene 0 descargas y 0 likes, lo que sugiere que es un mirror muy reciente y no ha sido validado por la comunidad.

## Enlaces

- Repositorio de HuggingFace (mirror de bedmancdn): https://huggingface.co/bedmancdn/Qwen3.5-4B-Uncensored-HauhauCS-Aggressive
- Repositorio original de HauhauCS en HuggingFace: https://huggingface.co/HauhauCS/Qwen3.5-4B-Uncensored-HauhauCS-Aggressive
- Modelo base Qwen3.5-4B: https://huggingface.co/Qwen/Qwen3.5-4B
- Variante de 9B: https://huggingface.co/HauhauCS/Qwen3.5-9B-Uncensored-HauhauCS-Aggressive
- Guia de uso en Colab (GitHub): https://github.com/CookieFilled/qwen-3.5-4B-uncensored-colab
- Integracion ComfyUI-Qwen3.5-Uncensored (GitHub): https://github.com/Deaquay/ComfyUI-Qwen3.5-Uncensored
- Variante en Ollama: https://ollama.com/jaahas/qwen3.5-uncensored
- Guia de la variante 35B-A3B (HackerNoon): https://hackernoon.com/qwen35-35b-a3b-uncensored-guide-features-capabilities-and-setup
- Discord del autor: https://discord.gg/SZ5vacTXYf</think>## Resumen

Qwen3.5-4B-Uncensored-HauhauCS-Aggressive es una variante sin censura del modelo Qwen3.5-4B de Alibaba, creada por HauhauCS y distribuida en este repositorio espejo de bedmancdn. Según la model card, el modelo elimina los mecanismos de rechazo del modelo base manteniendo intactas sus capacidades, logrando un índice declarado de 0/465 rechazos sin pérdida de funcionalidad. Se trata de la variante "aggressive", que aplica una eliminación más profunda de los rechazos del sistema.

Arquitecturalmente, el modelo combina atención lineal Gated DeltaNet con atención softmax completa en proporción 3:1, con 32 capas y 4.205.751.296 parámetros densos. Ofrece un contexto nativo de 262K tokens, extendible a 1M mediante YaRN, un vocabulario de 248K tokens en 201 idiomas y capacidades multimodales nativas para texto, imagen y vídeo. La licencia Apache-2.0 permite uso comercial sin restricciones.

Su relevancia reside en que combina un tamaño compacto de 4B parámetros con capacidades avanzadas de razonamiento, multimodalidad y contexto largo, todo ello disponible en cuantizaciones GGUF para ejecución local. La arquitectura es nueva (lanzada en marzo de 2026), por lo que requiere versiones recientes de llama.cpp para su ejecución.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Híbrida: Gated DeltaNet (atención lineal) + atención softmax completa, proporción 3:1 |
| Parámetros totales | 4.205.751.296 (4,2B) |
| Parámetros activos | No aplica (modelo denso) |
| Longitud de contexto | 262K tokens nativos (extendible a 1M con YaRN) |
| Tipos de cuantización | BF16, Q8_0, Q6_K, Q4_K_M (formato GGUF) |
| Idiomas soportados | 201 idiomas (inglés, chino y multilingüe) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (archivos .gguf) + mmproj para el encoder de visión |

## Arquitectura y entrenamiento

El modelo se basa en el Qwen3.5-4B original de Alibaba, que utiliza una arquitectura híbrida que combina atención lineal Gated DeltaNet con atención softmax completa en una proporción de 3:1. Esta combinación busca reducir el coste computacional de la atención en contextos largos manteniendo la calidad de la atención completa donde es necesaria. El modelo cuenta con 32 capas y 4,2B parámetros densos, sin componente de mezcla de expertos (MoE).

El proceso de "uncensoring" realizado por HauhauCS no modifica los datos de entrenamiento ni las capacidades del modelo base, sino que elimina los mecanismos de rechazo integrados. Según la model card, el resultado es un modelo totalmente funcional, al 100 % de lo que los autores originales pretendían, pero sin los rechazos. La variante "aggressive" aplica una eliminación más profunda de los rechazos, y el autor señala que el modelo puede ocasionalmente añadir un aviso legal al final de las respuestas (por ejemplo, "esto es información general, no asesoramiento legal"), pero esto forma parte del entrenamiento base y no constituye un rechazo.

El modelo incorpora multi-token prediction (MTP), una técnica que predice múltiples tokens futuros simultáneamente para acelerar la inferencia. También es nativamente multimodal, con un encoder de visión (archivo mmproj) de 645 MB que debe cargarse junto al GGUF principal para procesar entradas de imagen y vídeo.

## Capacidades

- Generación de texto y razonamiento avanzado, con modo de pensamiento (thinking mode) activado por defecto y modo directo (non-thinking mode) configurable.
- Multimodal nativo: procesamiento de texto, imagen y vídeo mediante el encoder de visión mmproj.
- Multi-token prediction (MTP) para mejorar la velocidad de inferencia.
- Contexto largo de 262K tokens nativos, extendible a 1M con YaRN.
- Vocabulario de 248K tokens que cubre 201 idiomas.
- Sin rechazos: no deniega ninguna petición, incluidas las que el modelo base rechazaría.
- Soporte de tool calling y agentes, heredado del modelo Qwen3.5 base.
- Compatible con llama.cpp, LM Studio, Jan, koboldcpp y Ollama (via Colab).

## Casos de uso

- **Análisis y procesamiento de documentos extensos**: su contexto nativo de 262K tokens permite ingerir libros completos, contratos legales o código fuente de gran tamaño en una sola petición, con razonamiento sobre el contenido completo sin necesidad de fragmentación.
- **Generación de código en entornos de desarrollo**: las capacidades de código de Qwen3.5, combinadas con el soporte de tool calling, permiten integrar el modelo en pipelines de CI/CD para generación de tests, revisión de código o autocompletado en IDEs.
- **Análisis multimodal de imágenes y vídeo**: gracias al encoder de visión, el modelo puede describir, analizar y razonar sobre contenido visual, lo que resulta útil para sistemas de análisis de vídeo de vigilancia, generación de subtítulos automáticos o asistentes de accesibilidad.
- **Traducción y localización multilingüe**:
