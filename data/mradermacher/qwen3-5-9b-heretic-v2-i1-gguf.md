# mradermacher/Qwen3.5-9B-heretic-v2-i1-GGUF

## Resumen

El modelo `mradermacher/Qwen3.5-9B-heretic-v2-i1-GGUF` es una colección de cuantizaciones GGUF con matriz de importancia (imatrix) del modelo `ansulev/Qwen3.5-9B-heretic-v2`, que a su vez es una versión "desensurada" (decensored) del modelo Qwen3.5-9B de Alibaba. El proceso de desensura, denominado "heretic", elimina automáticamente los mecanismos de rechazo del modelo original, dando como resultado un modelo que responde sin restricciones de seguridad a peticiones que normalmente serían bloqueadas. Esta versión está orientada a usuarios que necesitan un modelo de 9B parámetros con comportamiento "uncensored" y que se puede ejecutar en hardware de consumo gracias a las cuantizaciones GGUF.

El modelo base Qwen3.5-9B es un transformer de 9 mil millones de parámetros, con soporte multimodal (visión y texto) y una longitud de contexto que, aunque no se especifica en la información disponible, es típica de la serie Qwen3.5 (se estima en 128K tokens). La cuantización i1 (imatrix) ofrece mejores resultados de perplejidad que las cuantizaciones estáticas para un mismo tamaño, según los comentarios del autor. La licencia Apache 2.0 permite uso comercial sin restricciones adicionales.

La relevancia actual de este modelo reside en su naturaleza "uncensored" y en su facilidad de despliegue en hardware modesto. Es una opción para desarrolladores que buscan un modelo de razonamiento y generación de texto sin filtros de seguridad, aunque esto conlleva riesgos importantes de uso indebido que deben evaluarse antes de implementarlo en producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basada en Qwen3.5-9B) |
| Parametros totales | 8.953.803.264 (aprox. 9B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (se estima 128K, no confirmado) |
| Tipos de cuantizacion | i1-Q2_K (3.9 GB), i1-IQ3_M (4.5 GB) y archivo imatrix |
| Idiomas soportados | Inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (imatrix) |

## Arquitectura y entrenamiento

La arquitectura del modelo base es un transformer estándar de la serie Qwen3.5, con atención global y posiblemente mecanismos de atención por ventanas para manejar contextos largos. No se dispone de detalles exactos sobre el número de capas, dimensiones ocultas o cabezas de atención, ya que la información proporcionada se centra en la cuantización y el proceso de desensura. El modelo original fue entrenado por Alibaba con un corpus masivo multilingüe, aunque la versión heretic-v2 ha sido modificada mediante la herramienta Heretic, que elimina automáticamente los mecanismos de rechazo (refusal) del modelo sin requerir acceso a los pesos originales. Este proceso no altera los pesos del modelo original, sino que genera un nuevo conjunto de pesos que se comporta como el original pero sin las restricciones de seguridad.

La cuantización imatrix (i1) se ha realizado con el dataset de importancia de mradermacher, que mejora la calidad de las cuantizaciones de baja precisión al ponderar la importancia de cada tensor. El autor no proporciona información sobre el dataset de entrenamiento del modelo base ni sobre el proceso de entrenamiento específico de la versión heretic.

## Capacidades

- Generación de texto y conversación sin filtros de censura: el modelo responde a cualquier petición sin rechazos, incluidas preguntas sobre temas sensibles, violencia, drogas o contenido explícito.
- Razonamiento y matemáticas: hereda las capacidades de razonamiento del modelo base Qwen3.5-9B, que incluyen resolución de problemas matemáticos y lógicos.
- Generación de código: soporta generación de código en múltiples lenguajes de programación, aunque no se han publicado benchmarks específicos para esta variante.
- Capacidades multimodales: el modelo base es un modelo de visión y texto, por lo que puede procesar imágenes y texto. Sin embargo, los archivos mmproj (proyección de visión) no están incluidos en este repositorio y deben obtenerse del repositorio estático.
- Tool calling / function calling: no se ha confirmado explícitamente, pero es probable que el modelo base lo soporte.
- Soporte de agentes: no hay documentación específica, pero al ser un modelo Qwen3.5, podría soportar razonamiento multi-paso.
- Multilingüe: aunque la etiqueta de idioma solo indica "en", el modelo base Qwen3.5 soporta múltiples idiomas, pero la versión heretic podría estar limitada al inglés.

## Casos de uso

- **Investigación sobre IA y seguridad**: los investigadores pueden usar este modelo para estudiar el impacto de la eliminación de censura en el comportamiento de los modelos de lenguaje, comparando respuestas entre versiones censuradas y sin censurar.
- **Generación de contenido creativo sin restricciones**: escritores y creadores pueden usarlo para generar contenido de ficción que aborde temas tabú o explícitos sin restricciones.
- **Desarrollo de asistentes de conversación para nichos específicos**: por ejemplo, asistentes para comunidades que necesitan respuestas sin filtro (p. ej., juegos de rol adultos, discusión de temas controvertidos).
- **Evaluación de robustez**: se puede usar para probar sistemas de moderación de contenido, ya que al eliminar la censura se puede analizar cómo el modelo responde a entradas maliciosas y diseñar mejores filtros.
- **Educación en ética de IA**: como herramienta de demostración para ilustrar los riesgos de modelos sin alineación y la importancia de los mecanismos de seguridad.
- **Prototipado rápido en entornos de desarrollo**: gracias a su tamaño (9B) y cuantizaciones ligeras, se puede ejecutar en una GPU de consumo para prototipar aplicaciones que requieren respuestas abiertas y sin restricciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La cuantización i1 afecta al rendimiento respecto al modelo original, pero no hay datos numéricos. Se recomienda consultar el repositorio del modelo base o la documentación de Qwen3.5-9B para benchmarks de referencia.

## Requisitos de hardware

- **VRAM estimada**: para la cuantización i1-Q2_K (3.9 GB), se necesita al menos 6 GB de VRAM para inferencia con overhead (contexto). Para i1-IQ3_M (4.6 GB), se recomiendan 8 GB o más.
- **GPU recomendadas**: cualquier GPU con 6-8 GB de VRAM puede ejecutar la cuantización más pequeña (GTX 1660 Super, RTX 2060, RTX 3060, etc.). Para mayor velocidad, se recomienda una RTX 3090 o superior.
- **Despliegue**: los archivos GGUF son compatibles con llama.cpp, Ollama, LM Studio, y servidores como llama-server o vLLM (con soporte GGUF). También se puede usar en CPU, aunque la velocidad será menor.
- **Latencia y throughput**: no hay datos específicos. En una RTX 4090, un modelo de 9B cuantizado a Q4_K_M suele generar entre 20-40 tokens por segundo, pero la latencia dependerá de la cuantización y del hardware.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa numérica con otros modelos de la misma categoría. El modelo base Qwen3.5-9B es comparable a otros modelos de 9B como Llama 3.1 8B o Mistral 7B, pero no se tienen datos de rendimiento de esta variante heretic. La principal diferencia es la ausencia de censura, lo que la hace única frente a los modelos estándar.

## Limitaciones y advertencias

- **Sesgos y contenido perjudicial**: al eliminar la censura, el modelo puede generar contenido ofensivo, violento, ilegal o éticamente cuestionable. Su uso en producción debe estar restringido y supervisado.
- **Alucinaciones**: como todos los modelos de lenguaje, puede inventar información con confianza, especialmente en temas de conocimiento profundo.
- **Idioma**: el modelo está etiquetado solo para inglés, aunque el modelo base Qwen3.5 soporta otros idiomas. La versión heretic podría no mantener la misma calidad en otros idiomas.
- **Contexto**: no se especifica la longitud de contexto soportada por el modelo base. Se asume 128K, pero no se ha confirmado.
- **Licencia**: Apache 2.0 permite uso comercial, pero el usuario es responsable del contenido generado y del cumplimiento legal.
- **Cuantizaciones**: las cuantizaciones de baja precisión (i1-Q2_K) pueden degradar la calidad de las respuestas y aumentar la perplejidad. Se recomienda usar IQ3_N o superior para tareas críticas.

## Enlaces

- [Repositorio HuggingFace del modelo (i1-GGUF)](https://huggingface.co/mradermacher/Qwen3.5-9B-heretic-v2-i1-GGUF)
- [Repositorio HuggingFace de cuantizaciones estáticas (GGUF)](https://huggingface.co/mradermacher/Qwen3.5-9B-heretic-v2-GGUF)
- [Modelo base ansulev/Qwen3.5-9B-heretic-v2](https://huggingface.co/ansulev/Qwen3.5-9B-heretic-v2)
- [Herramienta Heretic (repositorio GitHub)](https://github.com/p-e-w/heretic)
- [Modelo Qwen3.5-9B original (Alibaba)](https://huggingface.co/Qwen/Qwen3.5-9B)
