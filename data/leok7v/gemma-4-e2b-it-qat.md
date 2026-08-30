# leok7v/gemma-4-e2b-it-qat

## Resumen

El modelo `leok7v/gemma-4-e2b-it-qat` es un repack en formato GGUF del checkpoint oficial de Google `gemma-4-E2B-it-qat-mobile-transformers`, diseñado para ejecución en dispositivo (on-device). Se trata de un modelo multimodal que integra torres de texto, visión y audio en un único archivo autocontenido, con el tokenizador y la plantilla de chat incrustados, de modo que no requiere llamadas externas a servidores durante la inferencia. Su relevancia radica en que permite desplegar un modelo de 5.500 millones de parámetros con capacidades multimodales en entornos con recursos limitados, manteniendo la calidad gracias a un entrenamiento consciente de la cuantización (QAT) en lugar de una cuantización posterior.

La arquitectura combina un decoder con embeddings por capa (PLE), atención alternada entre ventana deslizante y atención completa, y compartición de claves/valores en las capas superiores. El peso total del archivo GGUF es de 2,665 GB, con una mezcla de tipos de cuantización (Q4_0, Q2_0, Q8_0, BF16 y F32). Está publicado bajo licencia Apache 2.0, heredada del modelo base, y su uso principal es el de asistentes conversacionales y procesamiento multimodal en privacidad o sin conexión.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Decoder multimodal con per-layer-embedding (PLE), atención alternada (28 capas sliding-window + 7 full-attention), shared-KV en 20 capas, vision encoder (16 capas) y audio encoder Conformer (12 capas) |
| Parametros totales | 5.506.950.723 (5,5 B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q4_0, Q2_0, Q8_0, BF16, F32 (según tabla de tensores) |
| Idiomas soportados | Inglés (según tags); el modelo base puede soportar más idiomas, no especificado |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF v3 (con tensores en Q4_0, Q2_0, Q8_0, BF16 y F32) |

## Arquitectura y entrenamiento

El modelo sigue un diseño de decoder multimodal con una innovación destacada: cada capa recibe un embedding propio de 256 dimensiones proveniente de una tabla grande por capa, que se proyecta y se combina con el embedding de token habitual. La atención alterna cuatro capas de ventana deslizante (sliding window de 512) por una capa de atención completa, con diferentes anchos de cabeza (256 para sliding, 512 para full) y bases RoPE distintas. Las 20 capas superiores comparten el estado de claves/valores con sus vecinas, reduciendo el coste computacional. Un encoder de visión de 16 capas y un encoder de audio Conformer de 12 capas proyectan sus entradas al mismo espacio de embeddings.

El entrenamiento es quantization-aware (QAT): Google entrenó el modelo simulando errores de baja precisión, lo que explica que las capas de 2 bits mantengan un rendimiento aceptable, a diferencia de una conversión post-hoc. El checkpoint original proviene de `google/gemma-4-E2B-it-qat-mobile-transformers`. El repack GGUF transfiere los códigos enteros exactos del checkpoint QAT sin re-cuantizar: los códigos INT4 usan el formato Q4_0 y los INT2 usan Q2_0 (bajo negación). La única diferencia numérica respecto a los pesos originales es una conversión de escala de fp32 a fp16 por bloque.

## Capacidades

- Generación de texto y chat conversacional multimodal: acepta entradas de texto, imagen y audio, y produce respuestas de texto.
- Procesamiento de imágenes: el encoder de visión de 16 capas permite entender imágenes a resolución nativa.
- Procesamiento de audio: el encoder Conformer de 12 capas habilita la entrada de audio (por ejemplo, voz).
- Razonamiento y comprensión de contexto: al ser un modelo de 5,5 B con atención de ventana deslizante, puede manejar secuencias largas de forma eficiente, aunque la longitud exacta de contexto no se ha especificado.
- Ejecución en dispositivo: al estar empaquetado en GGUF con el tokenizador y la plantilla incrustados, es adecuado para entornos sin conexión o con privacidad estricta.
- Soporte de tool calling y agentes: no se menciona explícitamente en la información disponible; se asume que depende del modelo base, pero no se confirma.

## Casos de uso

- Asistentes personales en el móvil: el modelo puede gestionar conversaciones multimodales (texto, voz, imágenes) directamente en el dispositivo, sin enviar datos a la nube, gracias a su tamaño compacto y a la inclusión de las torres de audio y visión.
- Análisis de imágenes sin conexión: en entornos industriales o de campo, se puede usar para clasificar o describir fotografías sin necesidad de conectividad, aprovechando el encoder de visión.
- Transcripción y comprensión de audio: el encoder Conformer permite procesar comandos de voz o audios cortos para tareas de dictado o control por voz en aplicaciones locales.
- Chat privado para empresas: en sectores con requisitos de confidencialidad (salud, legal, finanzas), el modelo puede desplegarse en infraestructura propia para atender consultas internas sin exponer datos sensibles.
- Prototipado rápido de aplicaciones multimodales: al ser un GGUF autocontenido, los desarrolladores pueden integrarlo en motores de inferencia compatibles (que soporten el tipo Q2_0) para crear demos o MVPs sin depender de servicios externos.
- Educación y accesibilidad: como asistente de estudio que lee texto, interpreta diagramas o responde a preguntas orales, funcionando en portátiles o tablets de gama media.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de rendimiento (MMLU, HumanEval, GSM8K, etc.) ni comparaciones con otros modelos. Se recomienda consultar la documentación del modelo base de Google para posibles evaluaciones.

## Requisitos de hardware

- El archivo GGUF pesa 2,665 GB, por lo que cabe en GPUs con al menos 4 GB de VRAM si se usa una cuantización mixta (Q4_0/Q2_0). Con cuantizaciones más ligeras (solo Q4_0) podría caber en 3 GB, pero no se especifica.
- Está diseñado para ejecución en dispositivo, por lo que puede correr en CPUs modernas con soporte AVX2, aunque la inferencia será más lenta que en GPU.
- GPUs recomendadas: cualquier GPU con al menos 4 GB de VRAM (por ejemplo, NVIDIA GTX 1650, RTX 3050, o superiores). Para uso en servidores, una A100 o H100 no es necesaria dado el tamaño.
- Opciones de despliegue: runtimes que soporten el tipo de bloque Q2_0 (no compatible con llama.cpp upstream; se requiere una rama como PrismML/Gadeon ggml). No se menciona soporte para vLLM, Ollama o TGI en la información.
- Latencia y throughput: no disponibles. Al ser un modelo de 5,5 B con cuantización mixta, se espera una latencia de decenas de milisegundos por token en GPU, pero no hay datos oficiales.

## Comparativa con modelos similares

No se dispone de información suficiente para una comparativa rigurosa. El modelo es un repack GGUF del Gemma 4 E2B de Google, y existen otras variantes como `gemma-4-e4b-it-qat` (también repack de leok7v) con 4 B de parámetros, pero no se han publicado métricas comparativas. Se recomienda consultar las fichas de los modelos base de Google para comparaciones de rendimiento.

## Limitaciones y advertencias

- Sesgos y alucinaciones: como todo modelo de lenguaje, puede generar texto plausible pero incorrecto o sesgado. La model card advierte explícitamente que no verifica hechos y que no debe usarse para decisiones legales, médicas, financieras o de seguridad.
- Limitación de idioma: los tags indican solo inglés; aunque el modelo base podría soportar más idiomas, no se confirma en esta versión.
- Incompatibilidad con llama.cpp upstream: 170 tensores usan el tipo Q2_0, que no existe en el ggml estándar. Solo runtimes que implementen ese tipo (por ejemplo, la rama PrismML/Gadeon) pueden cargar el archivo.
- Restricciones de licencia: aunque la licencia es Apache 2.0, se debe revisar el texto completo de la licencia de Gemma 4 para posibles condiciones adicionales (por ejemplo, restricciones de uso comercial en ciertos casos).
- Sin garantía de rendimiento en producción: al ser un repack no oficial, no hay soporte técnico de Google; los usuarios deben validar el comportamiento en su caso de uso específico.

## Enlaces

- Repositorio del modelo: https://huggingface.co/leok7v/gemma-4-e2b-it-qat
- Modelo base: https://huggingface.co/google/gemma-4-E2B-it-qat-mobile-transformers
- Página de lanzamientos de Gemma (Google AI): https://ai.google.dev/gemma/docs/releases
- Página oficial de Gemma 4 (DeepMind): https://deepmind.google/models/gemma/gemma-4/
