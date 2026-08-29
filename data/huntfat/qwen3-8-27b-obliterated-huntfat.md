# Huntfat/Qwen3.8-27B-OBLITERATED-huntfat

## Resumen

Huntfat/Qwen3.8-27B-OBLITERATED-huntfat es un modelo de lenguaje basado en Qwen3.8-27B, el modelo denso de 27.800 millones de parámetros publicado por Alibaba en agosto de 2026 bajo licencia Apache 2.0. El autor, Huntfat, ha aplicado una técnica de abliteración (eliminación de direcciones de rechazo en el espacio de pesos) con el objetivo de suprimir los comportamientos de negativa y las respuestas evasivas de seguridad del modelo original, manteniendo un coste de capacidad relativamente bajo.

El modelo se presenta en su versión V3, que combina refinamiento iterativo sobre una mezcla complementaria de dos métodos de abliteración (SVD y LEACE) y una cirugía dirigida con un corpus específico. Según la model card, V3 logra una puntuación MMLU de 82,3% frente al 84,5% del modelo original, una pérdida de 2,1 puntos porcentuales, y responde de forma sustancial a consultas que el modelo base rechazaría. Está disponible en formatos safetensors, GGUF y MLX, lo que permite su despliegue en una variedad de entornos, desde GPU de consumo hasta hardware de Apple.

Este tipo de modelo es relevante para la investigación en seguridad de IA, el red-teaming y la evaluación de robustez de sistemas de alineación, aunque su uso en producción requiere una consideración cuidadosa de los riesgos asociados a la eliminación de salvaguardas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (basado en Qwen3.8-27B) |
| Parametros totales | 27.781.427.952 (27,8B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | safetensors (FP16/BF16), GGUF, MLX |
| Idiomas soportados | No disponible (el modelo base Qwen3.8-27B soporta multiples idiomas, pero no se especifica en la informacion) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors, GGUF, MLX |

## Arquitectura y entrenamiento

El modelo no ha sido entrenado desde cero, sino que es el resultado de un proceso de abliteración aplicado sobre los pesos del modelo base Qwen3.8-27B. La abliteración consiste en identificar direcciones en el espacio de activaciones que correlacionan con el comportamiento de rechazo y proyectarlas fuera de los pesos. Huntfat ha desarrollado una técnica propia denominada "complementary abliteration blending", que combina dos métodos de cirugía con fallos complementarios: SVD (que elimina rechazos de forma agresiva pero daña la capacidad) y LEACE (que preserva la capacidad pero elimina rechazos de forma más débil). La mezcla 60/40 de ambos resultados cancela las debilidades de cada método.

La versión V3 aplica refinamiento iterativo sobre la V2, seguido de una cirugía dirigida con un corpus enfocado en categorías específicas de desviación (como ingeniería social, malware o phishing), y posteriormente mezcla los resultados. El proceso no utiliza datos de entrenamiento convencionales ni RLHF; se trata exclusivamente de una modificación de pesos. No se han publicado detalles sobre el corpus exacto utilizado ni sobre el número de direcciones de rechazo identificadas.

## Capacidades

- Generación de texto y razonamiento: hereda las capacidades del modelo base Qwen3.8-27B, incluyendo comprensión de instrucciones complejas y generación de respuestas extensas.
- Generación de código: según la model card, el modelo V3 resuelve 20 de 20 tareas de generación de código con implementaciones funcionales, sin limitarse a descargos.
- Modo de pensamiento (thinking mode): el modelo es compatible con el modo de razonamiento extendido de Qwen3.8, aunque se recomienda desactivarlo para obtener respuestas más directas.
- Ausencia de rechazos: el objetivo principal del modelo es responder a consultas que el modelo base rechazaría, incluyendo temas sensibles, sin emitir lecciones de seguridad ni negativas.
- Multilingüismo: no se ha especificado, pero el modelo base Qwen3.8-27B soporta múltiples idiomas; se asume que esta capacidad se mantiene, aunque no está confirmada.
- Tool calling y funciones de agente: no se menciona explícitamente en la información disponible, aunque el modelo base Qwen3.8-27B incluye soporte para tool calling; no se ha verificado si la abliteración afecta a esta funcionalidad.

## Casos de uso

- Investigación en seguridad de IA: el modelo es útil para red-teaming, es decir, para probar las defensas de otros sistemas generando prompts adversarios o evaluando la robustez de los mecanismos de alineación. Su capacidad de responder sin rechazos permite estudiar qué tipo de contenido puede generar un modelo sin salvaguardas.
- Evaluación de sesgos y alucinaciones: al eliminar los rechazos, se puede analizar si el modelo base tiene sesgos subyacentes que quedaban enmascarados por las respuestas de seguridad. Esto es relevante para auditar la imparcialidad de los modelos.
- Generación de código en entornos controlados: el modelo puede utilizarse para generar código de forma directa, sin interrupciones por políticas de uso, en entornos de desarrollo donde se requiere una respuesta inmediata y sin restricciones.
- Asistencia conversacional en entornos de investigación: para estudios de interacción humano-máquina donde se necesita un asistente que no imponga límites éticos predefinidos, permitiendo observar el comportamiento natural del modelo.
- Pruebas de jailbreak y defensas: el modelo puede servir como objetivo para probar técnicas de jailbreak en otros modelos, o como referencia para medir la eficacia de métodos de alineación.
- Análisis de contenido sensible en entornos académicos: investigadores que estudian la generación de contenido potencialmente dañino pueden utilizar este modelo para comprender los mecanismos de generación, siempre bajo supervisión y con las debidas salvaguardas institucionales.

## Benchmarks y rendimiento

La model card del autor proporciona resultados de MMLU (lm-eval-harness, 0-shot, n=100 por materia, 5700 preguntas) para las distintas versiones del modelo, así como evaluaciones cualitativas adicionales.

| Modelo | MMLU (0-shot) | vs Stock | Notas |
|---|---|---|---|
| Qwen3.8-27B (stock) | 84,5% | — | Modelo original |
| V1 (abliteración simple) | 81,4% | -6,0 pp | Elimina rechazos duros, pero pierde capacidad |
| V2 (blending complementario) | 84,3% | -0,3 pp | Casi sin pérdida, pero persisten desviaciones suaves |
| V3 (refinamiento iterativo) | 82,3% | -2,1 pp | Elimina rechazos y desviaciones, con pérdida moderada |

Además, la model card reporta:
- Tareas de código/ciber (20 prompts): 20/20 con código funcional.
- Tareas avanzadas del mundo real: 7/8.
- Modo de pensamiento: compatible, sin rechazos.

No se han publicado resultados de otros benchmarks estándar (HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- El modelo tiene 27,8B parámetros. En precisión FP16/BF16, el peso ocupa aproximadamente 55,6 GB, lo que requiere una GPU con al menos 60 GB de VRAM (por ejemplo, A100 80GB, H100 80GB) o varias GPU en paralelo.
- Con cuantización GGUF de 4 bits, el peso se reduce a unos 14 GB, lo que permite su ejecución en GPU de consumo como RTX 4090 (24 GB) o RTX 3090 (24 GB), así como en Macs con 32 GB de memoria unificada (formato MLX).
- El repositorio tiene un tamaño de 237,1 GB, lo que indica que incluye múltiples formatos y cuantizaciones.
- Opciones de despliegue: vLLM, llama.cpp, Ollama, TGI (Text Generation Inference) y MLX para Apple Silicon. El autor recomienda usar la plantilla de chat incluida en los GGUF para evitar problemas con el modo de pensamiento.
- Latencia y throughput: no se han proporcionado datos específicos. Se estima que con cuantización 4-bit en una RTX 4090, la generación de 2048 tokens puede tardar del orden de 10-20 segundos, dependiendo de la implementación.

## Comparativa con modelos similares

Existen otras versiones abliteradas de Qwen3.8-27B publicadas por diferentes autores. La información disponible no incluye benchmarks comparativos entre ellas, por lo que la comparación se limita a aspectos generales.

| Modelo | Autor | Técnica | MMLU (0-shot) | Licencia |
|---|---|---|---|---|
| Qwen3.8-27B (stock) | Alibaba | — | 84,5% | Apache-2.0 |
| Huntfat/Qwen3.8-27B-OBLITERATED-huntfat | Huntfat | Abliteración complementaria (SVD+LEACE) + refinamiento iterativo | 82,3% | Apache-2.0 |
| OBLITERATUS/Qwen3.8-27B-OBLITERATED | OBLITERATUS | Abliteración (no se especifica método) | No disponible | Apache-2.0 |
| dn2k/Qwen3.8-27B-OBLITERATED | dn2k | Abliteración con múltiples direcciones | No disponible | Apache-2.0 |

No se dispone de datos de rendimiento para los modelos de OBLITERATUS y dn2k, por lo que no es posible una comparación cuantitativa.

## Limitaciones y advertencias

- El proceso de abliteración elimina los mecanismos de rechazo del modelo, lo que implica que puede generar contenido dañino, ilegal o éticamente problemático sin ninguna barrera. No debe utilizarse en aplicaciones orientadas al usuario final sin supervisión humana y sin medidas de filtrado adicionales.
- La pérdida de capacidad medida en MMLU es de 2,1 puntos porcentuales respecto al modelo base, pero no se ha evaluado el impacto en otras tareas como razonamiento matemático, comprensión lectora o generación de código en benchmarks estándar.
- El modelo puede presentar alucinaciones o respuestas incorrectas, especialmente en temas sensibles, ya que la abliteración no mejora la veracidad.
- No se ha especificado la longitud de contexto soportada. El modelo base Qwen3.8-27B probablemente soporta 32.768 tokens o más, pero no está confirmado para esta versión.
- La licencia Apache-2.0 permite uso comercial, pero el responsable del despliegue debe asumir las consecuencias legales y éticas del contenido generado.
- El autor recomienda configuraciones específicas (temperatura 0, repetition_penalty 1.15, sin system prompt) para obtener respuestas óptimas; desviarse de estas puede degradar la calidad o reintroducir comportamientos de rechazo.
- No se han realizado evaluaciones de sesgos demográficos o de toxicidad en esta versión.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Huntfat/Qwen3.8-27B-OBLITERATED-huntfat
- Modelo base Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Artículo sobre el modelo en explainx.ai: https://www.explainx.ai/blog/pliny-qwen3-8-27b-obliterated-alex-finn-mac-august-2026
- Ficha del modelo en Atomic Chat: https://atomic.chat/models/qwen3-8-27b
- Recetas de despliegue con vLLM: https://recipes.vllm.ai/Qwen/Qwen3.8-27B
