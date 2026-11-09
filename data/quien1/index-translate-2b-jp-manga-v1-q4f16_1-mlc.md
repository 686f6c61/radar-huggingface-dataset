# Quien1/Index-Translate-2B-JP-Manga-v1-q4f16_1-MLC

## Resumen

Index-Translate-2B-JP-Manga-v1-q4f16_1-MLC es una conversión al formato MLC (`q4f16_1`) del modelo Index-Translate-2B-JP-Manga-Finetune-v1, publicado por el usuario Quien1. El modelo original lo desarrolla fumetodev y está especializado en la traducción de diálogo de manga del japonés al inglés, construido a su vez sobre la base IndexTeam/Index-Translate-2B, que emplea la arquitectura Qwen3.5-2B. Esta versión no introduce ningún reentrenamiento: únicamente cambia el formato de los pesos para que puedan ejecutarse en el navegador mediante WebLLM.

La relevancia de esta ficha radica en su empaquetado: al estar cuantizado a 4 bits (q4f16_1, tamaño de grupo 32) y dispuesto de forma idéntica a `mlc-ai/Qwen3.5-2B-q4f16_1-MLC`, el modelo puede cargarse en WebLLM reutilizando la librería precompilada de Qwen3.5-2B. Esto permite traducción JP→EN de diálogo de manga en cliente, sin backend, con un peso de repositorio de 1,1 GB.

Se trata de un modelo pequeño (2B parámetros) y de propósito muy concreto: traducción de un solo par de idiomas (japonés a inglés) en el dominio del manga. No está pensado como modelo generalista ni como asistente conversacional, y sus límites son los del modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer, familia Qwen3.5-2B (según model card) |
| Parametros totales | 2B (según nombre del modelo) |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | q4f16_1 (4 bits, group size 32) |
| Idiomas soportados | ja, en |
| Licencia | apache-2.0 |
| Formato de pesos | MLC (mlc-llm), compatible con WebLLM |
| Tamano del repositorio | 1,1 GB |
| Modelo base | fumetodev/Index-Translate-2B-JP-Manga-Finetune-v1-GGUF |
| Modelo raíz | IndexTeam/Index-Translate-2B |
| Revision de pesos originales | f920fe5b75390165b5b3bac508e7aeee7f64db39 |
| Stop tokens | 248044, 248046 |
| System prompt | ninguno (el modelo se entrenó sin system prompt) |

## Arquitectura y entrenamiento

La arquitectura corresponde a Qwen3.5-2B, un transformer de 2B parámetros. Esta versión MLC no aporta información propia sobre el entrenamiento: la model card indica explícitamente que no se ha reentrenado nada y que solo se han cuantizado los pesos bf16 de la revisión `f920fe5b75390165b5b3bac508e7aeee7f64db39` a 4 bits con group size 32, con un layout idéntico al de `mlc-ai/Qwen3.5-2B-q4f16_1-MLC`. Como comprobación de fidelidad del pipeline de conversión, el autor señala que la misma conversión aplicada al Qwen3.5-2B base reproduce ese build byte a byte.

El modelo original (fumetodev) es un fine-tune de IndexTeam/Index-Translate-2B orientado a diálogo de manga JP→EN. La model card remite a la ficha del modelo original para los detalles de datos de entrenamiento y evaluación, y no los reproduce aquí. No se dispone de información sobre número de tokens de entrenamiento, composición del dataset ni uso de RLHF/DPO en la información proporcionada. Tampoco se documentan innovaciones técnicas adicionales más allá de la cuantización y el empaquetado para WebLLM.

## Capacidades

- Traducción de diálogo de manga del japonés al inglés (tarea principal y prácticamente única).
- Generación de texto condicionada a una instrucción en chino, según indica la model card del modelo original (se debe usar el mismo prompt que allí se describe).
- Decodificación greedy recomendada por el autor del modelo original.
- Ejecución en navegador mediante WebLLM, sin backend, reutilizando la librería precompilada de Qwen3.5-2B.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible; no es el propósito del modelo.
- Capacidades multilingües: limitadas a ja y en según los metadatos; el prompt de instrucción es en chino según la model card original.
- Capacidades especiales (thinking mode, visión, audio): no disponible.

## Casos de uso

- Traducción de manga en el navegador: el modelo se carga con WebLLM y traduce bocadillos JP→EN en el cliente, sin enviar texto a un servidor, lo que resulta adecuado para lectores que quieren traducción privada y offline una vez descargados los pesos (1,1 GB).
- Herramientas de scanlation asistida: integración en editores o visores de manga que pasen el texto japonés OCRizado al modelo y reciban la traducción inglesa para revisión humana, aprovechando la licencia Apache-2.0 para uso comercial.
- Prototipado rápido de pipelines de traducción: al ejecutarse en WebLLM con la configuración precompilada de Qwen3.5-2B, sirve para validar flujos de traducción sin montar infraestructura de GPU.
- Aplicaciones de escritorio o extensiones de navegador: el formato MLC y el tamaño reducido permiten empaquetar el modelo en una extensión o app web para traducción de contenido japonés in situ.
- Evaluación comparativa de cuantización: útil para medir la pérdida de calidad de q4f16_1 frente a los pesos bf16/GGUF originales en una tarea concreta de traducción.
- Filtrado o pre-traducción por lotes de corpus de manga: para generar borradores en inglés que después se posteditan, dado el bajo coste de inferencia de un modelo de 2B cuantizado a 4 bits.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card de esta conversión remite a la ficha del modelo original para la evaluación, y no incluye cifras propias.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con pesos q4f16_1 y un repositorio de 1,1 GB, el modelo está diseñado para ejecutarse en el navegador mediante WebLLM, lo que implica consumo moderado de memoria gráfica en el cliente.
- GPU recomendadas: no disponible. El caso de uso declarado es WebLLM en navegador, no servidores con A100/H100.
- Compatibilidad con GPU de consumo: el objetivo del formato q4f16_1 es precisamente ejecutarse en hardware de consumo vía WebGPU en el navegador; no se especifican modelos concretos de GPU.
- Opciones de despliegue: WebLLM (librería `@mlc-ai/web-llm`) y, por extensión, el runtime MLC-LLM. No se documentan otras opciones (vLLM, llama.cpp, Ollama, TGI) para este artefacto concreto.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato / despliegue |
|---|---|---|---|---|---|
| Index-Translate-2B-JP-Manga-v1-q4f16_1-MLC (este) | 2B | no disponible | ja, en | Apache-2.0 | MLC / WebLLM en navegador |
| fumetodev/Index-Translate-2B-JP-Manga-Finetune-v1-GGUF | 2B | no disponible | ja, en | Apache-2.0 | GGUF / llama.cpp |
| IndexTeam/Index-Translate-2B (base) | 2B | no disponible | no disponible | no disponible | no disponible |
| mlc-ai/Qwen3.5-2B-q4f16_1-MLC | 2B | no disponible | no disponible | no disponible | MLC / WebLLM |

La comparativa se limita a la cadena de derivación del propio modelo, ya que no se dispone de datos de rendimiento ni de especificaciones de contexto para contrastar con alternativas de traducción JP→EN de la misma categoría.

## Limitaciones y advertencias

- Modelo de propósito muy restringido: traducción JP→EN de diálogo de manga; no debe esperarse comportamiento generalista ni conversacional.
- Requiere el prompt exacto descrito en la model card del modelo original (instrucción en chino, sin system message) y decodificación greedy; desviarse de ello puede degradar la calidad.
- La cuantización a 4 bits (q4f16_1, group size 32) puede introducir pérdida de calidad respecto a los pesos bf16 originales; no se han publicado métricas que la cuantifiquen.
- Sesgos conocidos: no disponible en la información proporcionada.
- Riesgo de alucinación: no cuantificado en la información disponible; es un riesgo inherente a modelos de 2B en traducción.
- Limitaciones de contexto e idioma: solo ja→en según los metadatos; longitud de contexto no disponible.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero conviene revisar la ficha del modelo original para las condiciones de los datos de entrenamiento.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso en producción ni validación comunitaria de esta conversión concreta.
- El autor de la conversión es un tercero (Quien1), no el autor del modelo original ni el equipo de MLC; la fidelidad del empaquetado se apoya en la comprobación byte a byte descrita, no en una auditoría independiente.

## Enlaces

- Hugging Face (esta conversión): https://huggingface.co/Quien1/Index-Translate-2B-JP-Manga-v1-q4f16_1-MLC
- Modelo original (GGUF): https://huggingface.co/fumetodev/Index-Translate-2B-JP-Manga-Finetune-v1-GGUF
- Modelo base: https://huggingface.co/IndexTeam/Index-Translate-2B
- WebLLM: https://github.com/mlc-ai/web-llm
- Build de referencia Qwen3.5-2B en MLC: https://huggingface.co/mlc-ai/Qwen3.5-2B-q4f16_1-MLC
