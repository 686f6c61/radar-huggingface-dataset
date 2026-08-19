# inclusionAI/Ling-3.0-tiny-int4

## Resumen

Ling-3.0-tiny es un modelo de razonamiento híbrido de tipo Mixture-of-Experts (MoE) desarrollado por inclusionAI, la división de investigación en inteligencia artificial de Ant Group. Con 7,9 mil millones de parámetros totales y solo 1,3 mil millones activos por token, está diseñado para ofrecer capacidades avanzadas de razonamiento y agente a un coste de inferencia reducido, lo que lo hace adecuado para despliegue local y entornos con recursos limitados. Esta versión concreta, Ling-3.0-tiny-int4, corresponde a los pesos cuantizados a INT4, pensados para minimizar el uso de memoria y facilitar su ejecución en hardware de consumo.

El modelo combina una arquitectura híbrida lineal que alterna capas de atención KDA (Kimi Delta Attention) y MLA (Multi-Head Latent Attention) en proporción 3:1, junto con una capa FFN MoE dispersa de 128 expertos, de los cuales se activan 8 por token más un experto compartido. Soporta un contexto nativo de 256K tokens, modo de razonamiento configurable por petición y capacidades de agente, lo que lo convierte en una opción relevante para tareas de codificación, matemáticas, ciencia y seguimiento de instrucciones. Su licencia MIT permite uso comercial sin restricciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida KDA-MLA (3:1) con MoE disperso de 128 expertos (8 activos + 1 compartido por token) |
| Parametros totales | 7.893.392.800 (7,9B) |
| Parametros activos | 1,3B por token |
| Longitud de contexto | 256K tokens (nativo, con YaRN) |
| Tipos de cuantizacion | INT4 (esta versión), BF16, FP8 |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (también disponibles BF16 y FP8) |

## Arquitectura y entrenamiento

Ling-3.0-tiny emplea una arquitectura híbrida lineal que combina capas de atención KDA (Kimi Delta Attention) y MLA (Multi-Head Latent Attention) en una proporción de 3:1 por cada bloque de cuatro capas. Esta combinación busca equilibrar la capacidad de modelado de contexto largo con la eficiencia computacional. La capa FFN es un MoE disperso con 128 expertos enrutados, de los cuales se activan 8 por token junto con un experto compartido, lo que reduce el coste de cómputo a 1,3B parámetros activos por token.

No se han publicado en la información disponible los detalles del entrenamiento, como el número de tokens, la composición del dataset o si se utilizaron técnicas de RLHF o DPO. El modelo incorpora innovaciones técnicas como decodificación especulativa (MTP/NEXTN) y escalado de contexto mediante YaRN, además de un modo de razonamiento híbrido configurable por petición a través del parámetro `enable_thinking`.

## Capacidades

- Razonamiento híbrido: soporta respuestas rápidas para tareas rutinarias y razonamiento multi-paso para problemas complejos, activable por petición mediante `enable_thinking`.
- Capacidades de agente: incluye soporte nativo para function calling y ejecución de tareas multi-paso, adecuado para flujos de trabajo autónomos.
- Codificación: genera y depura código en múltiples lenguajes, con rendimiento validado en benchmarks de terminal y agentes.
- Matemáticas y razonamiento científico: resuelve problemas de cálculo, álgebra y razonamiento lógico.
- Seguimiento de instrucciones: mantiene coherencia en tareas complejas y conversaciones multi-turno.
- Contexto largo: procesa hasta 256K tokens, lo que permite manejar documentos extensos y conversaciones prolongadas.
- Prompt caching: optimiza el coste en escenarios de uso repetitivo.

## Casos de uso

- Asistentes de codificación en entornos locales: un desarrollador puede ejecutar Ling-3.0-tiny en un MacBook Pro o un mini-PC con GPU para obtener sugerencias de código, refactorización y generación de tests sin depender de servicios en la nube, gracias a su bajo uso de memoria (8,34 GiB pico a 8K contexto en FP8) y su velocidad de salida superior a 160 tokens/s.
- Agentes autónomos de automatización de tareas: al soportar function calling y razonamiento multi-paso, puede integrarse en pipelines que interactúan con APIs, bases de datos o herramientas de productividad, ejecutando flujos como la actualización de registros o el envío de informes.
- Atención al cliente con contexto largo: su ventana de 256K tokens permite mantener conversaciones extensas con historial completo, gestionando consultas complejas y derivando a sistemas externos cuando es necesario.
- Análisis de documentos extensos: investigadores o analistas pueden cargar informes, artículos o contratos de gran tamaño y extraer resúmenes, comparativas o respuestas a preguntas específicas sin truncar el contexto.
- Educación y tutoría en matemáticas: el modo de razonamiento permite desglosar problemas paso a paso, útil para plataformas de aprendizaje automático o asistentes de estudio.
- Prototipado rápido en investigación: por su licencia MIT y su tamaño reducido, es adecuado para experimentar con arquitecturas de agentes o sistemas de razonamiento en entornos académicos sin costes de licencia.

## Benchmarks y rendimiento

En la información disponible se mencionan los siguientes resultados de evaluación:

- Artificial Analysis Intelligence Index v4.1.1: 25 puntos.
- Artificial Analysis Agentic Index: 16 puntos.
- Velocidad de salida: más de 160 tokens/s en pruebas de Artificial Analysis.
- Latencia de extremo a extremo: aproximadamente 18 segundos para una respuesta de 500 tokens, incluyendo tiempo de razonamiento.

No se han publicado en la información proporcionada los valores numéricos de la tabla de benchmarks específica (MMLU, HumanEval, GSM8K, etc.) que aparece en la model card como imagen. Por tanto, no es posible presentar una comparación cuantitativa detallada con otros modelos.

## Requisitos de hardware

- VRAM estimada: con FP8, aproximadamente 8,34 GiB de memoria pico a 8K de contexto. La versión INT4 de este repositorio debería requerir menos memoria, aunque no se especifica el valor exacto.
- GPUs recomendadas: validado en NVIDIA DGX Spark, Apple Silicon MacBook (M4 Pro) y Mac mini. También puede ejecutarse en GPUs de consumo con suficiente VRAM (por ejemplo, RTX 4090 con 24 GB), aunque no se indica explícitamente.
- Opciones de despliegue: SGLang es el runtime recomendado, con una imagen Docker preconstruida (`lmsysorg/sglang:dev-Ling-3.0-tiny`) y una receta de baja latencia que incluye MTP/NEXTN y contexto YaRN de 256K. También está disponible en OpenRouter como servicio gratuito.
- Latencia y throughput: en DGX Spark con FP8 alcanza 100-105 tokens/s; en M4 Pro, 86-90 tokens/s. En pruebas de Artificial Analysis, supera los 160 tokens/s.

## Comparativa con modelos similares

No se dispone de datos comparativos con otros modelos en la información proporcionada. Ling-3.0-tiny se posiciona como un MoE ligero de 7,9B totales y 1,3B activos, con licencia MIT y contexto de 256K, lo que lo sitúa en una categoría similar a otros modelos compactos de razonamiento, pero no se pueden ofrecer cifras concretas de comparación sin fuentes adicionales.

## Limitaciones y advertencias

- No se han documentado sesgos específicos ni tasas de alucinación en la información disponible.
- El rendimiento óptimo depende del runtime SGLang y de la configuración recomendada (temperatura=1.0, top_p=0.95, top_k=20). Usar otros entornos puede degradar los resultados.
- El modo de razonamiento está activado por defecto; desactivarlo requiere ajustar el parámetro `enable_thinking` en la petición, lo que puede afectar a la calidad en tareas complejas.
- Aunque la licencia MIT permite uso comercial, no se especifican garantías ni responsabilidades por parte del desarrollador.
- Los idiomas soportados no están documentados, por lo que su comportamiento en lenguas distintas del inglés o el chino no está garantizado.
- La versión INT4 puede presentar una ligera pérdida de precisión frente a BF16 o FP8, especialmente en tareas de razonamiento extenso.

## Enlaces

- Hugging Face: https://huggingface.co/inclusionAI/Ling-3.0-tiny-int4
- ModelScope: https://www.modelscope.cn/models/inclusionAI/Ling-3.0-tiny-int4
- OpenRouter: https://openrouter.ai/inclusionai/ling-3.0-tiny:free
- SGLang cookbook: https://docs.sglang.io/cookbook/autoregressive/InclusionAI/Ling-3.0-tiny
- SourceForge: https://sourceforge.net/projects/ling-3-0-tiny/
- Benchable: https://benchable.ai/models/inclusionai/ling-3.0-tiny-20260806
- AIToolsReview: https://aitoolsreview.co.uk/insights/ling-3-0-tiny
