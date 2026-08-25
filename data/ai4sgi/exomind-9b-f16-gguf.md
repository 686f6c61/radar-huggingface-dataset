# AI4SGI/ExoMind-9B-F16-GGUF

## Resumen

ExoMind-9B-F16-GGUF es una cuantización en precisión F16 en formato GGUF del modelo ExoMind-9B, desarrollado por el Shanghai Artificial Intelligence Laboratory (AI4SGI). ExoMind es un sistema agéntico inspirado en la "mente extendida" que integra ingeniería de datos sistemática, un marco de interacción científica y una estrategia de entrenamiento estructurada para avanzar en el razonamiento científico. El modelo base, ExoMind-9B, es multimodal (imagen-texto), con capacidades de tool-use y razonamiento agéntico, y está construido sobre la arquitectura de Qwen3.5.

Esta versión GGUF F16 está pensada para inferencia local con llama.cpp, e incluye el proyector multimodal necesario para procesar imágenes. Al estar en formato GGUF, puede ejecutarse en una amplia gama de hardware, desde GPUs de consumo hasta servidores, y es compatible con herramientas como llama.cpp, Ollama o vLLM. Su licencia Apache 2.0 facilita su uso comercial, aunque los materiales de investigación y la marca tienen términos adicionales.

La relevancia de este modelo radica en democratizar el acceso a capacidades de razonamiento científico avanzado en un paquete de 9B parámetros, con soporte multimodal y agéntico, sin depender de APIs propietarias. Sin embargo, es importante señalar que no se han publicado benchmarks específicos para la variante de 9B; la tabla de evaluación principal del proyecto corresponde al modelo de 35B-A3B.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal basado en Qwen3.5 (detalles no publicados) |
| Parametros totales | 9 mil millones (9B) |
| Parametros activos | no disponible |
| Longitud de contexto | 32768 tokens (según ejemplo de llama.cpp en la documentación) |
| Tipos de cuantizacion | F16 (este repo); también disponibles Q4_K_M y Q8_0 en repos hermanos |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (v3) |

## Arquitectura y entrenamiento

El modelo ExoMind-9B se basa en la arquitectura de Qwen3.5, un transformer multimodal que combina un codificador de visión con un modelo de lenguaje. Esta versión GGUF F16 incluye un proyector multimodal (`mmproj-qwen3_5_9b-F16.gguf`) que permite procesar entradas de imagen junto con texto. Los detalles exactos de la arquitectura (número de capas, dimensiones, mecanismos de atención) no se han publicado en la información disponible.

El entrenamiento de ExoMind se describe en el informe técnico como un proceso que integra ingeniería de datos sistemática, un marco de interacción científica y una estrategia de entrenamiento estructurada. No se especifican el número de tokens de entrenamiento, la composición del dataset ni si se utilizaron técnicas como RLHF o DPO. La página del proyecto menciona un "evaluation explorer" con configuraciones y comparaciones, pero los resultados corresponden al modelo de 35B-A3B, no al de 9B.

## Capacidades

- Razonamiento científico: diseñado para tareas de razonamiento complejo en dominios científicos, como análisis de literatura, formulación de hipótesis y síntesis de resultados.
- Tool-use / function calling: soporta la invocación de herramientas externas, lo que permite integrarlo en flujos agénticos y automatizaciones.
- Capacidades agénticas: puede participar en sistemas multi-paso que requieren planificación y ejecución de acciones.
- Multimodal (imagen-texto): procesa imágenes junto con texto, útil para interpretar figuras, gráficos y diagramas científicos.
- Generación de texto: produce respuestas coherentes y detalladas en formato natural.
- Multilingüe: no se ha especificado la lista de idiomas soportados, pero al estar basado en Qwen3.5 es probable que cubra múltiples idiomas, aunque no se confirma.

## Casos de uso

- Análisis de artículos científicos con figuras: el modelo puede leer un PDF o imagen de una figura y extraer conclusiones, relacionando el contenido visual con el texto. Adecuado por su capacidad multimodal y su enfoque en razonamiento científico.
- Asistente de laboratorio para protocolos experimentales: puede interpretar instrucciones, sugerir pasos siguientes y responder preguntas sobre procedimientos, gracias a su entrenamiento en interacción científica.
- Generación de código para análisis de datos: con tool-use, puede escribir y ejecutar scripts de Python para procesar datos científicos, integrándose en pipelines de investigación.
- Automatización de revisiones bibliográficas: puede resumir múltiples documentos, extraer hallazgos clave y comparar metodologías, reduciendo el trabajo manual de investigadores.
- Soporte educativo en ciencias: estudiantes pueden usarlo para resolver dudas, explicar conceptos y analizar problemas, con la ventaja de poder adjuntar imágenes de enunciados o diagramas.
- Integración en sistemas de gestión de conocimiento: como backend de un chatbot interno que indexa documentos técnicos y responde consultas con referencias a figuras y tablas.
- Procesamiento de documentos multimodales en producción: por su formato GGUF, puede desplegarse en entornos locales con llama.cpp para tareas de extracción de información de informes técnicos con gráficos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks para la variante ExoMind-9B. La model card indica explícitamente que la tabla de evaluación principal del proyecto corresponde al sistema de 35B-A3B y que esta versión F16 GGUF no tiene puntuaciones separadas. Por tanto, no se dispone de datos de MMLU, HumanEval, GSM8K u otros para este modelo.

## Requisitos de hardware

- El archivo F16 del modelo pesa 16.69 GiB, más 875.63 MiB del proyector multimodal, totalizando aproximadamente 17.5 GiB solo en pesos.
- Para inferencia en F16 se recomienda una GPU con al menos 20-24 GB de VRAM para acomodar los pesos y el overhead de ejecución. Una RTX 4090 (24 GB) o una A100 (40 GB) son opciones viables.
- Con cuantizaciones menores (Q4_K_M, disponible en repos hermanos), el modelo puede caber en GPUs de 8 GB, como una RTX 3070 o RTX 4060, aunque con pérdida de precisión.
- Opciones de despliegue: llama.cpp (llama-server), Ollama (si se importa el GGUF), vLLM (con soporte para GGUF en versiones recientes) y TGI (a través de conversión).
- No se han publicado datos de latencia o throughput para este modelo.

## Comparativa con modelos similares

No se dispone de benchmarks para comparar directamente. A continuación se presenta una comparación estructural con otros modelos multimodales de tamaño similar, basada en información pública:

| Modelo | Parametros | Contexto | Multimodal | Licencia | Formato |
|---|---|---|---|---|---|
| ExoMind-9B (F16 GGUF) | 9B | 32768 (según ejemplo) | Sí (imagen-texto) | Apache 2.0 | GGUF |
| Qwen2.5-VL-7B | 7B | 32768 | Sí | Apache 2.0 | Transformers, GGUF |
| Llama-3.2-11B-Vision | 11B | 131072 | Sí | Llama 3.2 Community License | Transformers, GGUF |

Las diferencias clave son el enfoque en razonamiento científico y tool-use de ExoMind, frente a capacidades más generales de los otros. Sin datos de rendimiento, no es posible establecer una jerarquía objetiva.

## Limitaciones y advertencias

- No se han publicado benchmarks específicos para la variante de 9B; los resultados del proyecto corresponden al modelo de 35B-A3B y no deben atribuirse a este.
- Riesgo de alucinación: como todo modelo generativo, puede producir información plausible pero incorrecta, especialmente en dominios científicos donde la precisión es crítica.
- Sesgos no documentados: no se ha publicado información sobre sesgos potenciales en los datos de entrenamiento.
- Limitaciones de idioma: no se ha confirmado la lista de idiomas soportados; el rendimiento en idiomas distintos del inglés puede ser inferior.
- Restricciones de licencia: aunque los pesos están bajo Apache 2.0, el texto del informe técnico, las figuras y la marca ExoMind están sujetos a los "ExoMind Research Content and Brand Terms" (ver CONTENT_RIGHTS.md).
- Reproducibilidad: la conversión a GGUF no es bit-a-bit reproducible, ya que no se conservaron los comandos originales de conversión y cuantización.
- Para producción, se recomienda validar el modelo en el dominio específico y considerar el uso de cuantizaciones más bajas solo si la pérdida de precisión es aceptable.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/AI4SGI/ExoMind-9B-F16-GGUF
- Modelo base (Transformers): https://huggingface.co/AI4SGI/ExoMind-9B
- Página del proyecto: https://ai4sgi.github.io/ExoMind/
- Repositorio GitHub: https://github.com/AI4SGI/ExoMind
- Informe técnico (PDF): https://github.com/AI4SGI/ExoMind/blob/main/Paper.pdf
- ModelScope: https://modelscope.cn/models/AI4SGI/ExoMind-9B-F16-GGUF
- Colección de la familia ExoMind: https://huggingface.co/collections/AI4SGI/exomind-model-family
