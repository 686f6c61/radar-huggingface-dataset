# mradermacher/Qwen3-0.6B-text2mermaid-GGUF

## Resumen

Qwen3-0.6B-text2mermaid-GGUF es una cuantización estática en formato GGUF del modelo JeronimoMendes/Qwen3-0.6B-text2mermaid, publicada por el usuario mradermacher. Se trata, por tanto, de una conversión de pesos y no de un modelo entrenado desde cero: el autor original del ajuste fino es JeronimoMendes y la arquitectura subyacente corresponde a Qwen3-0.6B, el modelo denso de 0,6 mil millones de parámetros de la familia Qwen3 de Alibaba. La especialización declarada por el nombre es la generación de diagramas Mermaid a partir de texto (text2mermaid).

El interés de esta publicación es práctico: ofrece el modelo en múltiples niveles de cuantización GGUF (desde Q2_K hasta F16, pasando por Q3_K_S, Q4_K_M, Q5_K_M, Q6_K, Q8_0 e IQ4_XS), lo que permite ejecutarlo en hardware muy modesto, incluso en CPU, y desplegarlo con llama.cpp u Ollama. Al tratarse de un modelo de 0,6B, el objetivo típico es la generación de diagramas dentro de herramientas de documentación o asistentes ligeros, no el razonamiento general de alta calidad.

La información pública disponible es muy escasa: la model card del repositorio se limita a una lista de cuantizaciones y a la referencia al modelo base, sin datos sobre licencia, idiomas, pipeline, dataset de ajuste ni evaluación. Todo lo que no figure explícitamente en esa información se marca como no disponible en esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (heredada de Qwen3-0.6B; no detallada en la model card) |
| Parametros totales | 0,6 mil millones (según el nombre del modelo base) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | F16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K, IQ4_XS |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones estáticas) |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna ni el proceso de entrenamiento. Por el nombre del repositorio, el modelo deriva de Qwen3-0.6B, un transformer denso de la familia Qwen3, y ha sido ajustado por JeronimoMendes para la tarea text2mermaid, es decir, la conversión de descripciones en lenguaje natural a código de diagramas Mermaid. No se especifica en la información proporcionada el número de tokens de entrenamiento, la composición del dataset de ajuste fino, ni si se emplearon técnicas de RLHF, DPO o instrucción supervisada.

Esta publicación concreta es una cuantización estática realizada con las herramientas habituales de mradermacher (los metadatos indican convert_type hf y quantize_version 2). No introduce cambios arquitectónicos: solo reduce la precisión de los pesos para facilitar la inferencia local. Se desconoce si el ajuste fino original preservó la ventana de contexto completa de Qwen3-0.6B o si la recortó, y tampoco hay información sobre innovaciones técnicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Generación de diagramas Mermaid a partir de descripciones textuales, según la especialización declarada en el nombre del modelo.
- Generación de texto general, heredada del modelo base Qwen3-0.6B (no verificada en la información disponible para este ajuste).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible; un modelo de 0,6B tiene capacidad limitada para tareas agénticas complejas.
- Capacidades multilingües: no disponibles; no se especifican idiomas en la model card.
- Modo thinking, visión o audio: no disponible en la información proporcionada.
- Ejecución local en CPU y GPU mediante llama.cpp u Ollama gracias al formato GGUF.

## Casos de uso

- Documentación técnica automatizada: generar diagramas de flujo, de clases o de secuencia en Mermaid a partir de descripciones en prosa, integrándolo en un pipeline de documentación que renderice el código Mermaid con herramientas como Mermaid CLI o GitHub.
- Asistentes en editores de Markdown: plugin que convierte una descripción escrita por el usuario en un bloque de código Mermaid dentro de un archivo .md, aprovechando el tamaño reducido del modelo para ejecutarse en local sin latencia de red.
- Generación de diagramas en entornos con recursos limitados: al disponer de cuantizaciones Q4_K_M o Q5_K_M, puede ejecutarse en portátiles sin GPU dedicada mediante llama.cpp u Ollama, lo que lo hace adecuado para herramientas de escritorio.
- Prototipado de pipelines text2diagram: servir como modelo de referencia rápido y barato para comparar enfoques de generación de diagramas antes de escalar a modelos mayores.
- Educación y formación: generar diagramas de ejemplo a partir de enunciados de ejercicios, con la ventaja de que el modelo cabe en equipos de estudiantes.
- Preprocesado en cadena: usar el modelo como primer paso para producir un borrador de diagrama Mermaid que después se valide o corrija con un modelo mayor o con un linter de sintaxis Mermaid.
- Automatización de wikis internas: convertir descripciones de procesos de negocio en diagramas de flujo Mermaid dentro de una wiki corporativa, con despliegue en CPU si no hay GPU disponible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo de 0,6B, las cuantizaciones Q4_K_M ocupan del orden de 0,4 GB y las Q8_0 alrededor de 0,7 GB; F16 se sitúa en torno a 1,2 GB. Son estimaciones basadas en el número de parámetros, no datos publicados en la model card.
- GPU recomendadas: cualquier GPU consumer con al menos 2 GB de VRAM puede alojar las cuantizaciones pequeñas; una RTX 3060, RTX 4060 o superior ofrece margen sobrado. Para F16, una GPU con 4 GB o más es suficiente.
- Cabe en GPU consumer: sí, en prácticamente cualquier GPU dedicada e incluso en iGPU con memoria compartida.
- Cabe en CPU: sí; las cuantizaciones Q4_K_M y Q5_K_M son adecuadas para inferencia en CPU con llama.cpp.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runtime compatible con GGUF (por ejemplo, servidores basados en llama.cpp). vLLM y TGI no son la vía natural para GGUF, aunque existen soportes parciales.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Formato |
|---|---|---|---|---|---|
| mradermacher/Qwen3-0.6B-text2mermaid-GGUF | 0,6B | no disponible | text2mermaid | no disponible | GGUF |
| JeronimoMendes/Qwen3-0.6B-text2mermaid | 0,6B | no disponible | text2mermaid | no disponible | safetensors (presumiblemente) |
| Qwen/Qwen3-0.6B | 0,6B | no disponible en esta ficha | propósito general | no disponible en esta ficha | safetensors, GGUF (versiones oficiales) |

La comparación con alternativas de la misma categoría (otros modelos especializados en generación de diagramas Mermaid) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- La model card no declara licencia; antes de un uso comercial es imprescindible verificar la licencia del modelo base Qwen3-0.6B y del ajuste fino original de JeronimoMendes.
- No hay información sobre sesgos, datos de entrenamiento ni evaluación de calidad; el riesgo de alucinación en la sintaxis Mermaid (diagramas inválidos o incoherentes) es real y debe mitigarse con validación automática del código generado.
- El tamaño de 0,6B limita la capacidad de razonamiento complejo y de seguir instrucciones largas; es previsible un rendimiento inferior a modelos mayores en descripciones ambiguas o diagramas extensos.
- Se desconoce la longitud de contexto efectiva del ajuste fino, lo que impide garantizar el procesamiento de descripciones largas.
- No se especifican idiomas soportados; el comportamiento en castellano no está verificado.
- Al ser una cuantización, las versiones de baja precisión (Q2_K, Q3_K_S) pueden degradar la calidad de la sintaxis generada; se recomienda Q4_K_M o superior para producción.
- El repositorio no registra descargas ni likes en el momento de la consulta, por lo que no hay evidencia comunitaria de calidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/Qwen3-0.6B-text2mermaid-GGUF
- Modelo base del ajuste fino: https://huggingface.co/JeronimoMendes/Qwen3-0.6B-text2mermaid
- Modelo original Qwen3-0.6B: https://huggingface.co/Qwen/Qwen3-0.6B
