# asksolz/munin-qwen35-2b-text-4bit-mlx

## Resumen

Munin es una conversión en cuantización de 4 bits del modelo Qwen3.5-2B de Alibaba, realizada por el usuario asksolz (Ask Solz) y publicada en Hugging Face. Se distribuye en formato MLX, pensada para su despliegue en dispositivos con Apple Silicon. La conversión se ha realizado directamente desde los pesos oficiales del modelo base, sin intermediarios de terceros, y se ha verificado mediante hashes SHA-256 para garantizar la integridad de la cadena de suministro.

El modelo conserva la arquitectura híbrida del Qwen3.5-2B, con 24 capas de las cuales 18 usan atención lineal y 6 atención completa, y una ventana de contexto de 262 144 tokens. Al ser una versión solo texto, se descarta la torre de visión del modelo original, lo que reduce el peso del paquete de 1749 MB a 1059 MB. Es relevante para desarrolladores que necesiten un modelo ligero con razonamiento y largo contexto en entornos Apple Silicon, sin depender de servicios externos.

La licencia Apache 2.0 permite uso comercial sin restricciones adicionales, heredada del modelo base. El autor ha activado el modo de pensamiento (thinking mode) por defecto, por lo que para obtener respuestas directas es necesario desactivarlo mediante la plantilla de chat.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer híbrido con atención lineal y completa (24 capas: 18 lineal, 6 completa) |
| Parámetros totales | 294 498 112 (según safetensors; el modelo base Qwen3.5-2B declara ~2 000 millones) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | 262 144 tokens |
| Tipos de cuantización | 4 bits (4.503 bits/peso, grupo de cuantización de 64) |
| Idiomas soportados | no disponible (el modelo base Qwen3.5 soporta múltiples idiomas, pero no se especifican en esta conversión) |
| Licencia | Apache 2.0 |
| Formato de pesos | MLX (safetensors) |

## Arquitectura y entrenamiento

El modelo base Qwen3.5-2B de Alibaba emplea una arquitectura híbrida que combina capas de atención lineal (18 de las 24) con capas de atención completa (6), un diseño que reduce el coste computacional en contextos largos. La conversión realizada por asksolz utiliza la herramienta `mlx_lm` en su versión 0.31.2 sobre los pesos oficiales del modelo base, con cuantización de 4 bits y grupo de tamaño 64. El proceso es reproducible: se fija la revisión `15852e8c16360a2fea060d615a32b45270f8a8fc` del repositorio fuente y se ejecuta el comando documentado.

Durante la conversión se eliminan los pesos de la torre de visión (`vision_tower.*` y `model.visual.*`), por lo que el paquete resultante solo contiene los pesos de lenguaje. El autor indica que la conversión se ha realizado internamente, sin reutilizar cuantizaciones de terceros, para evitar intermediarios en la cadena de suministro. No se proporcionan datos sobre el entrenamiento del modelo base (número de tokens, dataset, uso de RLHF) en esta ficha.

## Capacidades

- Generación de texto en lenguaje natural con soporte de modo razonamiento (thinking mode) activado por defecto; se puede desactivar mediante `enable_thinking=False` en la plantilla de chat.
- Ventana de contexto de 262 144 tokens, adecuada para tareas que requieren procesar documentos largos o conversaciones multi-turno extensas.
- Soporte de tool calling y function calling, heredado del modelo base Qwen3.5.
- Capacidades de razonamiento y resolución de problemas matemáticos y lógicos, propias de la familia Qwen3.5.
- Soporte multilingüe (el modelo base Qwen3.5 es multilingüe, aunque la ficha no detalla los idiomas concretos).
- Integración con el ecosistema MLX para ejecución eficiente en Apple Silicon.

## Casos de uso

- Asistentes de conversación en dispositivos Apple: el modelo se puede integrar en aplicaciones de escritorio o iOS usando el ecosistema MLX, con respuestas generadas localmente y sin conexión.
- Análisis de documentos extensos: con 262 144 tokens de contexto, permite resumir, extraer información o responder preguntas sobre informes, contratos o libros completos.
- Generación de código asistida: el modo razonamiento puede desglosar problemas de programación complejos antes de emitir el código final, útil en editores o CLI.
- Automatización de atención al cliente: conversaciones multi-turno con historial largo, sin perder el contexto de interacciones anteriores.
- Herramientas de estudio y tutoría: explicación de conceptos, resolución de ejercicios y generación de cuestionarios, aprovechando el razonamiento paso a paso.
- Prototipado de agentes conversacionales: al soportar tool calling, se puede conectar a APIs externas y construir agentes que ejecuten acciones (consultas, cálculos, etc.) con el modelo como orquestador.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La ficha del autor no incluye métricas de evaluación (MMLU, HumanEval, GSM8K, etc.), ni comparaciones con otros modelos. Se recomienda consultar el repositorio del modelo base Qwen3.5-2B para datos de rendimiento del modelo original.

## Requisitos de hardware

- El modelo está diseñado para Apple Silicon (M1/M2/M3/M4) y se ejecuta con el framework MLX.
- El peso del paquete es de 1.1 GB (1059 MB), por lo que cabe en la memoria unificada de cualquier Mac con al menos 8 GB de RAM.
- No se ha especificado soporte para GPU NVIDIA ni despliegue con vLLM, llama.cpp u Ollama; el formato MLX es específico de Apple.
- La latencia y el throughput no se han publicado; al ser un modelo de 2B en 4 bits, se espera que sea rápido en dispositivos Apple Silicon de gama media, pero no hay cifras concretas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| munin-qwen35-2b-text-4bit-mlx | ~2B (294M según safetensors) | 262 144 | Apache 2.0 | MLX | Solo texto, 4-bit, para Apple Silicon |
| Qwen3-4B (base) | 4B | 32 768 | Apache 2.0 | Transformers/GGUF | Multimodal, no cuantizado por defecto |
| Llama 3.2 3B Instruct | 3.2B | 128 000 | Llama 3.2 Community | Transformers/GGUF | Multimodal, licencia restrictiva para uso comercial |
| Gemma 2 2B | 2.6B | 8 192 | Gemma Terms | Transformers/GGUF | Restricciones de uso comercial |

La comparativa es estructural, ya que no hay datos de rendimiento disponibles para este modelo. En términos de contexto, supera ampliamente a los alternativos (262 144 tokens frente a 32 768 o 8 192), mientras que su licencia Apache 2.0 es más permisiva que la de Gemma o Llama 3.2.

## Limitaciones y advertencias

- El modelo es solo texto; no puede procesar imágenes ni vídeo, a diferencia del base Qwen3.5-2B que es multimodal.
- El modo pensamiento está activado por defecto; si no se desactiva, la respuesta incluirá el razonamiento interno, lo que puede confundir aplicaciones que esperan una respuesta limpia.
- El número de parámetros reportado (294 498 112) es notablemente inferior al esperado para un modelo de 2B, lo que podría indicar que el conteo de safetensors solo incluye una parte de los pesos o que hay un error en el registro. Se recomienda verificar antes de usarlo en producción.
- No se proporcionan datos de sesgos o alucinaciones específicos, pero al ser un modelo base de Qwen, puede heredar los sesgos de su entrenamiento original.
- La cadena de suministro se verifica con SHA256, pero la conversión se ha realizado por un tercero (asksolz), no por Alibaba; conviene auditar los pesos antes de un uso crítico.
- No hay documentación sobre el rendimiento en tareas específicas, por lo que es necesario realizar una evaluación propia antes de integrarlo en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/asksolz/munin-qwen35-2b-text-4bit-mlx
- Modelo base Qwen3.5-2B: https://huggingface.co/Qwen/Qwen3.5-2B
- Perfil del autor en Hugging Face: https://huggingface.co/asksolz
- Repositorio Qwen3 en GitHub: https://github.com/QwenLM/Qwen3
- Guía técnica de la serie Qwen3.5: https://explore.n1n.ai/blog/qwen3-5-model-series-2026-guide-2026-02-25
- Información sobre requisitos de hardware del modelo base: https://www.canirun.ai/model/qwen3.5-2b
