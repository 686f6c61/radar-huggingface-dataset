# DavidAU/Qwen3-8B-192k-Josiefied-Uncensored-NEO-Max-GGUF

## Resumen

Qwen3-8B-192k-Josiefied-Uncensored-NEO-Max-GGUF es una cuantización GGUF publicada por DavidAU sobre el fine-tune Josiefied-Qwen3-8B-abliterated-v1 de Goekdeniz-Guelmez. El modelo parte de Qwen3-8B, un transformer denso de 8.190.735.360 parámetros (alrededor de 8,2 mil millones) desarrollado por el equipo Qwen de Alibaba, y le aplica una extensión de contexto mediante YARN desde los 32.768 tokens originales hasta los 196.608 tokens (192k). La versión que nos ocupa es la variante cuantizada con el dataset NEO Imatrix y tensores de salida a 16 bits, orientada a escritura creativa, ficción, roleplay y generación de tramas sin restricciones de contenido.

El interés de esta ficha reside en dos factores. Por un lado, ofrece una ventana de contexto de 192k tokens sobre un modelo de solo 8B, lo que permite procesar novelas completas, guiones largos o sesiones de roleplay extensas en una única pasada. Por otro, el proceso de "abliteration" y el ajuste fino de Jose eliminan los rechazos y filtros del Qwen3 original, de modo que el modelo responde a contenido explícito, violento o de terror sin negativas, algo que el autor declara abiertamente en la model card.

Es relevante ahora porque la comunidad de escritura asistida y roleplay local busca modelos pequeños, desplegables en hardware de consumo, con contexto muy largo y sin censura. Esta variante cubre ese hueco, aunque a costa de asumir riesgos de sesgo, alucinación y contenido no apto para todos los públicos que conviene evaluar antes de usarla en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (base Qwen3-8B), contexto extendido con YARN |
| Parámetros totales | 8.190.735.360 (≈8,2B) |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 196.608 tokens (192k); el autor sugiere 8k–16k para modo "thinking" |
| Tipos de cuantización | GGUF en múltiples niveles (el repo incluye varios quants; ejemplo probado IQ3_M); tensores de salida a 16 bits |
| Idiomas soportados | No disponible (la model card no detalla idiomas; hereda el multilingüismo de Qwen3) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizado); el modelo base se distribuye en bfloat16 |
| Tamaño del repositorio | 77,5 GB (conjunto de todos los quants) |
| Plantilla de chat | Jinja o ChatML |
| Dataset de cuantización | NEO Imatrix |
| Modelo base | DavidAU/Qwen3-8B-192k-Context-6X-Josiefied-Uncensored (a su vez derivado de Goekdeniz-Guelmez/Josiefied-Qwen3-8B-abliterated-v1) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen3-8B: un transformer denso con atención completa estándar, entrenado por el equipo Qwen de Alibaba. Sobre esa base, Goekdeniz-Guelmez aplicó una técnica de "abliteration" que modifica los pesos para eliminar la tendencia a rechazar peticiones, dando lugar a Josiefied-Qwen3-8B-abliterated-v1. DavidAU amplió después el contexto de 32.768 a 196.608 tokens mediante YARN (Yet Another RoPE extensioN), siguiendo las notas técnicas publicadas en el repositorio oficial de Qwen, y generó las cuantizaciones GGUF con el dataset NEO Imatrix, fijando los tensores de salida a 16 bits para preservar la calidad del razonamiento.

No se dispone de información sobre el número exacto de tokens de entrenamiento, la composición del dataset de ajuste fino ni si se emplearon técnicas de RLHF o DPO en el fine-tune de Jose. La model card remite a la documentación de Qwen3-8B para los detalles de entrenamiento originales (benchmarks, modos de razonamiento, configuración de roles de sistema), pero no aporta cifras propias. La innovación técnica destacable de esta variante es la combinación de contexto extendido por YARN con cuantización Imatrix de alta calidad, pensada para mantener coherencia en generaciones largas sin degradar el modo "thinking" del modelo.

## Capacidades

- Generación de texto y razonamiento con modo "thinking": el modelo puede emitir bloques de razonamiento interno delimitados por etiquetas `<think>` antes de la respuesta final, activables mediante rol de sistema o de forma espontánea.
- Escritura creativa y de ficción: prosa vívida, generación de tramas y subtramas, continuación de escenas, diálogos y descripciones detalladas en todos los géneros (ciencia ficción, romance, terror, etc.).
- Roleplay y conversación multi-turno: diseñado explícitamente para sesiones de rol prolongadas, con contexto de hasta 192k tokens que permite mantener coherencia a lo largo de historias extensas.
- Contenido sin censura: responde a peticiones explícitas, violentas, de terror o con lenguaje soez sin rechazos, gracias al proceso de abliteration.
- Capacidades multilingües: heredadas de Qwen3-8B; la model card no especifica la lista concreta de idiomas.
- Soporte de plantillas Jinja y ChatML para integración en distintas aplicaciones de inferencia local.
- No se documenta en la información disponible soporte explícito de tool calling, function calling, agentes multi-paso, visión ni audio.

## Casos de uso

- Escritura de ficción larga: el modelo puede generar capítulos completos de novela manteniendo personajes, tramas y subtramas coherentes gracias a sus 192k tokens de contexto, lo que permite cargar manuscritos enteros como referencia.
- Roleplay persistente: sesiones de rol con trasfondo extenso, fichas de personaje y memoria de eventos anteriores caben en la ventana de contexto, evitando que el modelo olvide detalles de la partida.
- Generación de guiones y narrativa interactiva: útil para videojuegos narrativos o ficción interactiva donde se necesita continuar escenas de forma consistente y sin restricciones de contenido.
- Continuación de escenas y "scene continue": el autor documenta explícitamente esta capacidad; el modelo retoma un fragmento previo y lo desarrolla con prosa vívida, útil en talleres de escritura asistida.
- Creación de contenido de terror y horror gráfico: el fine-tune está orientado a descripciones intensas y explícitas, adecuado para autores de género que necesitan un asistente sin filtros.
- Prototipado de asistentes creativos locales: al ser un GGUF de 8B, se puede desplegar en estaciones de trabajo con GPU de consumo para herramientas de escritura privadas, sin enviar texto a servicios en la nube.
- Análisis y reescritura de textos largos: la ventana de 192k permite resumir, reescribir o analizar documentos extensos en una sola pasada, aunque el ajuste fino está orientado a ficción más que a tareas analíticas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card remite a los benchmarks del Qwen3-8B original, pero no aporta cifras propias para esta variante cuantizada ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada: un GGUF de 8B en cuantización Q4 requiere aproximadamente 5–6 GB de VRAM; en Q5, unos 6–7 GB; en Q6, unos 7–8 GB; en Q8, alrededor de 9–10 GB. La cuantización IQ3_M probada por el autor ocupa menos, en torno a 4 GB.
- Contexto largo: con 192k tokens, la caché KV crece de forma significativa; se recomienda GPU con al menos 16–24 GB de VRAM para aprovechar ventanas muy largas, o bien usar atención con memoria eficiente en llama.cpp.
- GPU recomendadas: RTX 4090 (24 GB) para contexto largo y quants altos; RTX 3090, RTX 4080 o RTX 4070 Ti para quants medios; A100 o H100 si se necesita servir varias sesiones concurrentes.
- Cabe en GPU de consumo: sí, en tarjetas con 8 GB o más usando quants Q4/Q5; en 6 GB con IQ3_M y contexto moderado.
- Opciones de despliegue: llama.cpp, LM Studio (el autor probó IQ3_M en LM Studio), Ollama, y servidores compatibles con GGUF; vLLM y TGI no soportan GGUF de forma nativa para este formato, por lo que requerirían convertir a safetensors.
- Latencia y throughput: no disponibles de forma oficial; el autor menciona un tiempo de "thinking" de unos 59,67 segundos en su ejemplo con IQ3_M, pero no aporta tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Orientación | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3-8B-192k-Josiefied-Uncensored-NEO-Max-GGUF | 8,2B | 192k | Apache 2.0 | Ficción sin censura, roleplay | GGUF en Hugging Face |
| Qwen3-8B (original) | 8,2B | 32k (extensible) | Apache 2.0 | Uso general, razonamiento | Safetensors y GGUF oficiales |
| Josiefied-Qwen3-8B-abliterated-v1 | 8,2B | 32k | Apache 2.0 | Sin censura, uso general | Safetensors en Hugging Face |
| Llama 3.1 8B Instruct | 8B | 128k | Llama 3.1 Community License | Uso general | Safetensors y GGUF |

La ventaja principal de esta variante frente al Qwen3-8B original y al Josiefied base es la ventana de 192k tokens, que multiplica por seis el contexto original. Frente a Llama 3.1 8B, ofrece más contexto (192k frente a 128k) y ausencia de censura, aunque con una licencia Apache 2.0 más permisiva que la de Llama. No se dispone de datos de rendimiento comparativo en benchmarks para esta variante concreta.

## Limitaciones y advertencias

- Contenido no apto para todos los públicos: el modelo está diseñado para generar material explícito, violento, de terror y con lenguaje soez; no es adecuado para aplicaciones dirigidas a menores ni para entornos corporativos sin moderación.
- Riesgo de alucinación: como todo modelo de lenguaje, puede inventar hechos, personajes o detalles; el ajuste fino a ficción no elimina este riesgo y puede exacerbarlo en contextos factuales.
- Sesgos: el proceso de abliteration y el ajuste fino pueden introducir o amplificar sesgos presentes en los datos de entrenamiento; no se documentan evaluaciones de sesgo.
- Degradación en contexto muy largo: aunque el contexto nominal es de 192k, el autor recomienda 8k–16k para el modo "thinking"; el rendimiento real en ventanas cercanas al máximo puede degradarse.
- Idiomas: no se especifica la lista de idiomas soportados; el multilingüismo heredado de Qwen3 puede ser desigual fuera del inglés y el chino.
- Licencia: Apache 2.0 permite uso comercial, pero el contenido generado sin censura puede infringir normativas locales o las políticas de las plataformas donde se despliegue; la responsabilidad recae en el integrador.
- Formato GGUF: no es directamente compatible con servidores de alto rendimiento como vLLM o TGI sin conversión; para producción a gran escala conviene evaluar el modelo base en safetensors.
- Repositorio de 77,5 GB: descargar el conjunto completo de quants es costoso en almacenamiento; conviene descargar solo el archivo GGUF necesario.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/DavidAU/Qwen3-8B-192k-Josiefied-Uncensored-NEO-Max-GGUF
- Modelo base del fine-tune: https://huggingface.co/Goekdeniz-Guelmez/Josiefied-Qwen3-8B-abliterated-v1
- Modelo base intermedio: https://huggingface.co/DavidAU/Qwen3-8B-192k-Context-6X-Josiefied-Uncensored
- Model card oficial de Qwen3-8B: https://huggingface.co/Qwen/Qwen3-8B
- Guía de parámetros y samplers del autor: https://huggingface.co/DavidAU/Maximizing-Model-Performance-All-Quants-Types-And-Full-Precision-by-Samplers_Parameters
- Perfil del autor: https://huggingface.co/DavidAU
- Colecciones del autor: https://huggingface.co/DavidAU/collections
