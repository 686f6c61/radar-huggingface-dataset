# braydenh563/Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-MTP-Ollama

## Resumen

El modelo `braydenh563/Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-MTP-Ollama` es una variante "uncensored" (sin rechazos) del modelo Qwen3.8-27B de Alibaba, publicada por el usuario braydenh563 en Hugging Face. Se trata de un modelo denso de 27B parámetros con arquitectura híbrida de atención (Gated DeltaNet lineal + atención completa) y encoder de visión, lo que le permite procesar texto, imágenes y vídeo. La versión "Aggressive" de HauhauCS elimina el comportamiento de rechazo y proporciona respuestas directas, sin preámbulos, en prompts difíciles.

Este repositorio contiene exclusivamente pesos en formato GGUF, incluyendo cuantizaciones personalizadas K_P ("Perfect") de HauhauCS, un proyector de visión en BF16 y un sidecar FastMTP para acelerar la decodificación especulativa. El modelo está pensado para ejecutarse con llama.cpp, Ollama o LM Studio, y su nombre indica que está preparado para su uso directo con Ollama. Al estar basado en Qwen3.8-27B, hereda sus capacidades de razonamiento, tool calling, agente y visión, aunque con un perfil de comportamiento menos restrictivo.

La relevancia de este modelo radica en su combinación de rendimiento (27B, contexto largo, multimodal) con una eliminación agresiva de rechazos, lo que lo hace atractivo para desarrolladores que necesitan un asistente sin filtros en entornos controlados, aunque con importantes advertencias éticas y de seguridad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso con encoder de visión (64 capas, hidden size no disponible) |
| Parametros totales | 27B (modelo base) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible (el modelo base Qwen3.8-27B soporta hasta 262.000 tokens, pero no se confirma en esta variante) |
| Tipos de cuantizacion | Q8_K_P, Q6_K_P, Q5_K_P, Q4_K_P, IQ4_XS, Q3_K_P, IQ3_M, IQ3_XS, Q2_K_P, IQ2_M, Q8_0, Q6_K, Q5_K_M, Q4_K_M, Q3_K_M; además proyector de visión BF16 (931 MB) y sidecar FastMTP (903 MB) |
| Idiomas soportados | Inglés, chino, multilingüe |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (archivos .gguf) |

Nota: los metadatos de Hugging Face indican 1.863.907.840 parámetros en safetensors, pero ese dato corresponde probablemente a un archivo auxiliar del repo (como el proyector), no al modelo completo, que es de 27B según la model card.

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B es un transformer denso de 27B parámetros con una arquitectura híbrida de atención: combina capas de atención completa con capas de atención lineal basadas en Gated DeltaNet. Esta mezcla reduce el coste computacional en contextos largos manteniendo la calidad. Además, incorpora un encoder de visión nativo que permite procesar imágenes y vídeo, y un head NextN (MTP) para decodificación especulativa integrada.

La variante "Uncensored-HauhauCS-Aggressive" aplica un proceso de abliteración (eliminación de la dirección de rechazo) sobre el modelo base, sin modificar los datos de entrenamiento ni las capacidades originales. El perfil "Aggressive" elimina por completo el comportamiento de rechazo y minimiza los preámbulos en prompts difíciles, dando respuestas directas. El autor afirma que el modelo tiene 0/465 rechazos en pruebas internas, aunque no se proporciona la metodología exacta. No se han publicado detalles sobre el dataset de entrenamiento, el número de tokens o si se usó RLHF/DPO; la model card solo indica que "no hay cambios en los datasets ni en las capacidades previstas".

## Capacidades

- Generación de texto y razonamiento: mantiene las capacidades completas de Qwen3.8-27B, incluyendo razonamiento complejo y matemáticas.
- Tool calling / function calling: soportado por el modelo base, útil para integraciones con APIs y agentes.
- Capacidades de agente: puede ejecutar tareas multi-paso y razonar sobre herramientas externas.
- Multimodal: procesa imágenes y vídeo mediante el proyector de visión BF16 incluido en el repo.
- Modo de pensamiento (thinking mode): no se confirma explícitamente en esta variante, pero el modelo base lo soporta.
- Sin comportamiento de rechazo: la variante "Aggressive" responde directamente a prompts controvertidos o sensibles, sin negarse ni añadir advertencias.
- Decodificación especulativa: el sidecar FastMTP acelera la generación hasta 3.02x en documentos y 1.93x en razonamiento frente a la versión sin MTP, según las afirmaciones del autor.
- Multilingüe: inglés, chino y otros idiomas (herencia del modelo base).

## Casos de uso

- Asistentes de chat sin restricciones: ideal para entornos de investigación o desarrollo donde se necesita explorar temas sensibles sin filtros, como análisis de contenido político o social. El modelo responde de forma directa, sin evasivas.
- Generación de contenido creativo: escritura de ficción, guiones o diálogos con un tono agresivo o sin censura, útil para creadores que buscan un estilo "sin filtro".
- Agentes con tool calling: al mantener las capacidades de función del modelo base, puede integrarse en pipelines de automatización que requieran llamadas a APIs, búsquedas web o ejecución de código.
- Análisis de imágenes y vídeo: gracias al proyector de visión, puede describir o responder preguntas sobre contenido visual, por ejemplo en tareas de moderación o análisis de documentos escaneados.
- Decodificación especulativa para baja latencia: el sidecar FastMTP permite acelerar la generación en servidores de inferencia, reduciendo el tiempo de respuesta en aplicaciones de chat en tiempo real.
- Experimentación con abliteración: sirve como referencia para estudiar el efecto de la eliminación de rechazos en modelos grandes, tanto en calidad de respuestas como en riesgos de seguridad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras métricas para esta variante específica. El autor solo menciona mejoras de velocidad de generación (hasta 3.02x en documentos y 1.93x en razonamiento) gracias al sidecar FastMTP, pero sin metodología detallada.

## Requisitos de hardware

- VRAM estimada: según la cuantización elegida. Por ejemplo, Q4_K_P ocupa 17.92 GB, Q6_K_P 25.92 GB y Q8_K_P 31.46 GB. Se necesita VRAM adicional para el contexto y el proyector de visión (si se usa).
- GPU recomendadas: para Q4_K_P o inferior, una RTX 4090 (24 GB) o similar es suficiente. Para Q6_K_P o Q8_K_P, se requiere una GPU con 32 GB o más (A100 40GB, RTX A6000, etc.). El sidecar FastMTP añade ~0.9 GB adicionales.
- Compatibilidad con consumer GPU: sí, con cuantizaciones Q4_K_P o inferiores en GPUs de 24 GB. Para cuantizaciones más altas, se necesitan GPUs profesionales o de doble socket.
- Opciones de despliegue: llama.cpp, Ollama (por el nombre del repo), LM Studio, y cualquier runtime compatible con GGUF. El modelo base también puede usarse con vLLM si se convierte a safetensors, pero este repo solo ofrece GGUF.
- Latencia y throughput: no se proporcionan datos concretos, pero el sidecar FastMTP afirma mejoras de hasta 3x en generación de documentos, lo que reduce la latencia en cargas de contexto largo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B (base) | 27B | 262K (según otras fuentes) | Apache 2.0 | safetensors, GGUF | Modelo original con rechazos estándar |
| Huihui-Qwen3.8-27B-abliterated | 27B | 262K (según vgtimes) | Apache 2.0 | GGUF, MLX | Abliteración estándar, disponible en Ollama |
| braydenh563/Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-MTP-Ollama | 27B | No disponible | Apache 2.0 | GGUF | Variante "Aggressive" con K_P quants y FastMTP |

La comparativa se basa en características públicas; no hay datos de rendimiento para contrastar. La principal diferencia es el perfil de comportamiento (agresivo vs. estándar) y las cuantizaciones personalizadas K_P.

## Limitaciones y advertencias

- Contenido sin filtrar: al eliminar los rechazos, el modelo puede generar contenido dañino, ofensivo, ilegal o éticamente cuestionable. No debe usarse en producción sin supervisión humana y medidas de seguridad adicionales.
- Sesgos: al ser un modelo base entrenado con datos web, puede heredar sesgos de género, raza, religión, etc. La abliteración no corrige estos sesgos.
- Riesgo de alucinación: como cualquier LLM, puede inventar información, especialmente en contextos largos o temas poco comunes.
- Contexto no confirmado: no se ha verificado la longitud de contexto real en esta variante; puede ser inferior al máximo del modelo base si la cuantización afecta al rendimiento.
- Sin benchmarks: no hay métricas de calidad que permitan comparar objetivamente con otras variantes.
- Licencia Apache 2.0: permite uso comercial, pero el contenido generado es responsabilidad del usuario. No hay garantías de seguridad.
- Compatibilidad: los quants K_P pueden mostrar "?" en LM Studio (problema de visualización, no de funcionamiento). El sidecar FastMTP requiere un runtime compatible (llama.cpp con soporte para MTP).

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/braydenh563/Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-MTP-Ollama
- Modelo de texto (sin visión) de HauhauCS: https://huggingface.co/HauhauCS/Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-MTP-GGUF
- Modelo base Qwen/Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Discord de HauhauCS: https://discord.gg/SZ5vacTXYf
- Artículo sobre abliteración (referencia general): https://www.mindstudio.ai/blog/qwen3-8-27b-aeon-uncensored-abliteration
