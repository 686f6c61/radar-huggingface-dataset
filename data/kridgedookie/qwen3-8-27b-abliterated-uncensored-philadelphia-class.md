# KridgeDookie/Qwen3.8-27B-ABLITERATED-UNCENSORED-PHILADELPHIA-CLASS

## Resumen

Qwen3.8-27B-ABLITERATED-UNCENSORED-PHILADELPHIA-CLASS es un modelo multimodal derivado de Qwen/Qwen3.8-27B, desarrollado por el usuario KridgeDookie. Su propósito principal es reducir drásticamente el comportamiento de rechazo (refusals) del modelo base mediante una técnica de "abliteration", manteniendo la arquitectura híbrida de texto e imagen. El nombre "PHILADELPHIA CLASS" identifica esta variante específica dentro de la familia de modelos abliterados del autor.

El modelo se distribuye en formato BF16 (safetensors) y en varias cuantizaciones GGUF (Q4_K_M, Q5_K_M, Q8_0) para facilitar su despliegue local. Conserva el modo de pensamiento (thinking) de Qwen3.8 y soporta entrada multimodal (imagen y texto). Según las evaluaciones internas del autor, alcanza 0 rechazos en una pantalla de 842 prompts y en un conjunto de validación separado de 126 prompts, con 23/24 comprobaciones de coherencia superadas. Es relevante para casos de uso que requieren generación sin restricciones de contenido, aunque con las advertencias éticas y legales correspondientes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Multimodal hibrido texto-vision basado en Qwen3.8-27B (detalles exactos no especificados) |
| Parametros totales | 27B (segun el nombre del modelo, no confirmado oficialmente) |
| Parametros activos | No disponible (no se indica si es MoE) |
| Longitud de contexto | 32768 tokens (segun el Modelfile de ejemplo de Ollama, no confirmado oficialmente) |
| Tipos de cuantizacion | BF16 (safetensors), Q4_K_M, Q5_K_M, Q8_0 (GGUF) |
| Idiomas soportados | Multilingue (sin lista detallada) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (BF16) y GGUF |

## Arquitectura y entrenamiento

El modelo es un derivado directo de Qwen/Qwen3.8-27B, del que hereda la arquitectura híbrida de texto e imagen. La modificación principal consiste en la aplicación de una técnica de "abliteration" orientada a eliminar o reducir los mecanismos de rechazo del modelo base, sin alterar la estructura general del transformer. No se proporcionan detalles sobre el proceso de entrenamiento, el dataset utilizado ni si se emplearon técnicas como RLHF o DPO. El autor indica que la transformación se ajustó sobre 716 prompts de un conjunto interno de 842, y que se validó con un conjunto separado de 126 prompts de familias distintas.

No se ha publicado información sobre el número de tokens de entrenamiento, la composición del dataset ni las innovaciones técnicas específicas más allá de la reducción de rechazos. El modelo mantiene el modo de pensamiento (thinking) de Qwen3.8, que puede activarse o desactivarse mediante el parámetro `enable_thinking` en Transformers.

## Capacidades

- Generación de texto y conversación multilingüe.
- Entrada multimodal: procesa imágenes junto con texto (pipeline `image-text-to-text`).
- Modo de pensamiento (thinking) disponible, activable o desactivable.
- Reducción de rechazos: el autor reporta 0 rechazos en sus evaluaciones internas, lo que permite respuestas a prompts que el modelo base podría rechazar.
- Soporte para cuantizaciones GGUF para despliegue ligero.
- Compatible con Transformers (>=5.14.1) y Ollama.

No se menciona soporte explícito para tool calling, function calling ni razonamiento multi-paso más allá del modo de pensamiento estándar.

## Casos de uso

- Generación de contenido creativo sin restricciones: el modelo puede producir ficción, guiones, poesía o narrativa con temáticas que otros modelos rechazarían por políticas de seguridad, útil para escritores y creadores que necesitan explorar territorios narrativos complejos.
- Investigación académica sobre temas sensibles: permite analizar o generar texto sobre temas tabú o controvertidos (violencia, sexualidad, drogas) en contextos de estudio sociológico o psicológico, donde un modelo censurado limitaría el análisis.
- Desarrollo de chatbots con personalidad sin filtros: se puede integrar en asistentes conversacionales que requieran un tono directo y sin evasivas, por ejemplo en aplicaciones de entretenimiento o roleplay.
- Moderación y análisis de contenido explícito: su capacidad para procesar texto sin rechazos lo hace útil para clasificar, resumir o extraer información de contenido que otros modelos se negarían a procesar.
- Experimentación con técnicas de alineación: sirve como banco de pruebas para estudiar el impacto de la reducción de rechazos en la coherencia, la facticidad y el comportamiento general de un modelo multimodal.
- Generación de código y depuración: aunque no es su foco principal, el modelo base Qwen3.8 tiene capacidades de programación, y esta variante puede utilizarse en entornos donde se necesite generar código sin restricciones de contenido (por ejemplo, scripts ofensivos para pruebas de seguridad).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks públicos (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor proporciona únicamente evaluaciones internas automatizadas, que se resumen a continuación. Estas no son comparativas con otros modelos ni han sido auditadas de forma independiente.

| Evaluacion interna | Resultado |
|---|---|
| Pantalla completa de rechazos - 842 prompts | 0/842 rechazos; 100% utilizables; 0 degeneracion |
| Conjunto de validacion separado - 126 prompts, 96 tokens generados | 0/126 rechazos; 100% utilizables; 0 degeneracion |
| Regresion de coherencia - codigo, JSON, depuracion, explicacion, matematicas y tareas de limites | 23/24 superadas |
| Diagnostico de formato largo - 24 prompts, 256 tokens generados | 0/24 rechazos; 23/24 utilizables; 0 degeneracion |
| Prueba de recarga multimodal | Superada; identifico correctamente un cuadrado azul |

El autor advierte que "utilizable" mide la forma y la topicalidad de la respuesta, no la exactitud factual. Los resultados se obtuvieron con el checkpoint BF16 y el modo de pensamiento desactivado; la cuantizacion y el backend pueden alterar el comportamiento.

## Requisitos de hardware

- Peso BF16: aproximadamente 56 GB de VRAM para los pesos, mas overhead de runtime y cache KV. Requiere GPUs profesionales como A100 (80 GB), H100 (80 GB) o multiples GPUs.
- Cuantizacion Q4_K_M (GGUF): tamano estimado de 16-18 GB, cabe en GPUs de consumo como RTX 4090 (24 GB) o RTX 3090 (24 GB).
- Cuantizacion Q5_K_M (GGUF): tamano estimado de 20-22 GB, requiere GPUs con al menos 24 GB de VRAM.
- Cuantizacion Q8_0 (GGUF): tamano estimado de 28-30 GB, requiere GPUs profesionales o multiples GPUs de consumo.
- Opciones de despliegue: Transformers (con `device_map="auto"`), Ollama (mediante Modelfile), llama.cpp (por los archivos GGUF). No se confirma compatibilidad con vLLM o TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multimodal | Licencia | Rechazos |
|---|---|---|---|---|---|
| Qwen3.8-27B (base) | 27B | No especificado (probablemente 32K) | Si | Apache 2.0 | Presentes (modelo estandar) |
| Qwen3.8-27B-ABLITERATED-UNCENSORED-PHILADELPHIA-CLASS | 27B | 32768 (segun ejemplo) | Si | Apache 2.0 | Reducidos (0 en evaluaciones internas) |
| Otros modelos abliterated de la comunidad | Variable | Variable | Variable | Variable | Reducidos, pero sin datos publicos comparables |

No se dispone de informacion suficiente para comparar con otros modelos abliterated especificos (por ejemplo, variantes de Llama o Mistral con tecnicas similares). La comparativa se limita al modelo base del que deriva.

## Limitaciones y advertencias

- La reduccion de rechazos no es una garantia absoluta: el propio autor indica que "uncensored" describe una fuerte reduccion, no una ausencia total, y que puede variar segun el prompt, el idioma, la configuracion de decodificacion, la cuantizacion y el runtime.
- Las evaluaciones son internas y no independientes: los resultados de 0 rechazos provienen de pruebas automatizadas del autor, no de auditorias externas ni leaderboards publicos.
- No se garantiza la preservacion del rendimiento: el autor no afirma que las puntuaciones de razonamiento, facticidad, codigo o vision del modelo base se mantengan intactas tras la modificacion.
- Riesgo de contenido inapropiado o danino: al eliminar los rechazos, el modelo puede generar texto ofensivo, ilegal o peligroso si se le solicita. Su uso debe limitarse a contextos legales y eticos.
- Los archivos GGUF son solo texto: la funcionalidad multimodal (vision) solo esta disponible en el checkpoint safetensors BF16, a menos que se proporcione un proyector de vision compatible.
- La cuantizacion puede alterar el comportamiento: los resultados de las evaluaciones se obtuvieron con BF16 y thinking desactivado; las versiones cuantizadas pueden mostrar diferencias en coherencia y rechazos.
- Requisitos de hardware elevados para la version completa: el checkpoint BF16 necesita ~56 GB de VRAM, lo que limita su uso a entornos profesionales.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/KridgeDookie/Qwen3.8-27B-ABLITERATED-UNCENSORED-PHILADELPHIA-CLASS
- Modelo base Qwen/Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
