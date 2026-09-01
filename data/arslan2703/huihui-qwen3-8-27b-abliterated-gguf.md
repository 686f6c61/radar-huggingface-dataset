# Arslan2703/Huihui-Qwen3.8-27B-abliterated-GGUF

## Resumen

El modelo **Huihui-Qwen3.8-27B-abliterated-GGUF** es una variante sin censura del modelo base **Qwen/Qwen3.8-27B**, creada por el equipo de huihui-ai mediante la técnica de *abliteration* (eliminación de los mecanismos de rechazo) aplicada sobre los pesos del modelo original. El resultado es un modelo que responde sin filtros de seguridad, manteniendo en gran medida las capacidades de razonamiento, generación de código y comprensión multimodal del modelo base. Esta versión en formato GGUF está pensada para su uso con `llama.cpp`, `Ollama` y otras herramientas de inferencia local.

El modelo base Qwen3.8-27B es un modelo de lenguaje de gran tamaño con arquitectura híbrida (atención + capas SSM) y 27 320 millones de parámetros totales, de los cuales aproximadamente 3 800 millones son activos (MoE). Soporta una ventana de contexto de 262 144 tokens y capacidades multimodales (imagen-texto). La versión abliterated conserva las capas de visión y el módulo de predicción multi-token (MTP) sin modificar, mientras que las capas de atención y SSM seleccionadas se han ablado para eliminar los rechazos. El repositorio contiene múltiples cuantizaciones GGUF, incluyendo variantes especiales `_L` que mejoran la calidad de los tensores ablados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE híbrida (atención + SSM) basada en Qwen3.8-27B |
| Parametros totales | 27 320 697 856 (27,32 B) |
| Parametros activos | 3,8 B (según nomenclatura del modelo base) |
| Longitud de contexto | 262 144 tokens (según ejemplo de `llama-cli`) |
| Tipos de cuantizacion | GGUF: Q2_K, Q3_K, Q4_K, Q5_K, Q6_K, Q8_0 y variantes `_L` (Q2_K_L, Q3_K_L, Q4_K_L, Q5_K_L, Q6_K_L, Q8_0_L) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (archivos `.gguf`) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B emplea una arquitectura de mezcla de expertos (MoE) con 27 320 millones de parámetros totales y 3 800 millones activos por token. Combina capas de atención tradicional con capas de espacio de estados (SSM), lo que le permite manejar secuencias largas de forma eficiente. El modelo original fue entrenado con un gran corpus multilingüe y multimodal, e incorpora un módulo de predicción multi-token (MTP) que acelera la generación.

La versión abliterated se obtiene mediante la técnica de *abliteration* implementada en el repositorio `remove-refusals-with-transformers`. Este método identifica y elimina las direcciones de los pesos responsables de los comportamientos de rechazo, sin necesidad de reentrenamiento. En esta variante concreta, se han ablado las capas 18 a 51 (o 23 a 51 en la versión UD-DW), conservando las primeras 15 capas sin modificar para preservar el rendimiento general. Los tensores ablados (token_embd, output, ffn_down, ssm_out, attn_output) se han convertido a mayor precisión (Q8_0 o BF16) en las cuantizaciones `_L` para mitigar la pérdida de calidad. No se ha realizado ningún entrenamiento adicional; el proceso es puramente de post-procesado de pesos.

## Capacidades

- Generación de texto y razonamiento complejo, heredadas del modelo base Qwen3.8-27B.
- Generación de código y soporte de tool calling / function calling (capacidad del modelo base).
- Razonamiento multi-paso y capacidades de agente (agentic tasks) gracias a la ventana de contexto de 262 144 tokens.
- Comprensión multimodal (imagen-texto) ya que el módulo visual no ha sido modificado.
- Soporte de predicción multi-token (MTP) para acelerar la inferencia.
- Respuestas sin filtros de seguridad ni rechazos, al haber sido ablada la capa de refusal.
- Multilingüe (idiomas no especificados, pero el modelo base soporta múltiples lenguas).

## Casos de uso

- **Investigación en alineación y seguridad**: el modelo permite estudiar el comportamiento de los LLM sin mecanismos de rechazo, facilitando la investigación sobre sesgos, alucinaciones y estrategias de mitigación.
- **Generación de contenido creativo sin restricciones**: escritura de ficción, guiones o diálogos que requieren explorar temas sensibles o controvertidos sin censura automática.
- **Desarrollo de asistentes de código especializados**: al conservar las capacidades de generación de código del modelo base, puede integrarse en entornos de desarrollo donde se necesite un asistente que no rechace peticiones de código potencialmente ofensivo o de doble uso.
- **Análisis de textos largos**: con 262 144 tokens de contexto, es adecuado para resumir o analizar documentos extensos, contratos o libros completos en una sola pasada.
- **Prototipado de agentes conversacionales**: su capacidad de tool calling y razonamiento multi-paso permite construir agentes que interactúan con APIs y ejecutan tareas complejas, aunque con la advertencia de que las respuestas no están filtradas.
- **Evaluación de robustez de modelos**: sirve como banco de pruebas para medir la eficacia de técnicas de *abliteration* y comparar el comportamiento con el modelo original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no proporciona métricas de MMLU, HumanEval, GSM8K u otros tests estandarizados para esta variante abliterated. Se recomienda consultar los benchmarks del modelo base Qwen3.8-27B para tener una referencia aproximada, aunque la abliteration puede afectar ligeramente al rendimiento en tareas que requieren seguir instrucciones de seguridad.

## Requisitos de hardware

- **VRAM estimada**: depende de la cuantización. Para un modelo de 27B parámetros, los tamaños típicos de GGUF son:
  - Q2_K: ~11-12 GB
  - Q3_K: ~13-14 GB
  - Q4_K: ~16-17 GB
  - Q5_K: ~19-20 GB
  - Q6_K: ~22-23 GB
  - Q8_0: ~29-30 GB
  (Las variantes `_L` pueden ser ligeramente mayores al usar Q8_0 o BF16 en tensores ablados).
- **GPU recomendadas**: para cuantizaciones Q4_K o inferiores, una GPU con 16-24 GB de VRAM (RTX 4090, RTX 3090, A5000) es suficiente. Para Q8_0 se recomienda una GPU con 32 GB o más (A100, H100, RTX 6000 Ada).
- **Compatibilidad con GPU de consumo**: sí, las cuantizaciones Q2_K a Q5_K caben en GPUs de consumo de gama alta (16-24 GB). Las versiones Q6_K y Q8_0 requieren GPUs profesionales o de mayor VRAM.
- **Opciones de despliegue**: `llama.cpp` (última versión), `Ollama` (comando `ollama run huihui_ai/Qwen3.8-abliterated`), y cualquier runtime compatible con GGUF (llama-cpp-python, etc.). No se recomienda vLLM ni TGI para GGUF, aunque se puede convertir a safetensors si se desea.
- **Latencia y throughput**: no disponibles. Dependen del hardware y de la cuantización. En una RTX 4090 con Q4_K, se puede esperar una velocidad de generación de 20-40 tokens/s, pero no hay datos oficiales.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Qwen3.8-27B (base) | 27,32 B | 3,8 B | 262 144 | Apache 2.0 | safetensors | Modelo original con filtros de seguridad |
| Huihui-Qwen3.8-27B-abliterated (este) | 27,32 B | 3,8 B | 262 144 | Apache 2.0 | GGUF | Sin censura, abliterated |
| Otros modelos abliterated (p.ej. Llama-3-8B-abliterated) | 8 B | 8 B | 8 192 | variada | GGUF | Menor tamaño, contexto menor |

No se dispone de datos de rendimiento comparativos entre estas variantes. La principal diferencia es la eliminación de los rechazos y el formato de pesos.

## Limitaciones y advertencias

- **Contenido sensible**: al haber sido ablada la capa de rechazo, el modelo puede generar contenido sexual explícito, violento, ilegal o éticamente cuestionable sin aviso previo.
- **Riesgo de alucinación**: como cualquier LLM, puede inventar información, pero al no tener filtros, las alucinaciones pueden ser más difíciles de detectar.
- **No apto para producción**: el autor recomienda explícitamente no usarlo en aplicaciones comerciales o públicas sin supervisión humana.
- **Idiomas**: no se especifican los idiomas soportados; se asume que hereda los del modelo base, pero no hay garantía.
- **Licencia**: Apache 2.0 permite uso comercial, pero el contenido generado puede violar leyes locales; el usuario es responsable.
- **Calidad de cuantización**: las variantes `_L` no son cuantizaciones estándar; pueden tener tamaños inusuales y requieren versiones recientes de `llama.cpp` para funcionar correctamente.
- **Rendimiento potencialmente degradado**: la abliteration puede afectar a tareas que dependen de seguir instrucciones de seguridad, aunque el autor afirma que se conserva la mayor parte del rendimiento original.

## Enlaces

- Repositorio HuggingFace: [Arslan2703/Huihui-Qwen3.8-27B-abliterated-GGUF](https://huggingface.co/Arslan2703/Huihui-Qwen3.8-27B-abliterated-GGUF)
- Modelo original: [Qwen/Qwen3.8-27B](https://huggingface.co/Qwen/Qwen3.8-27B)
- Repositorio de huihui-ai (versión no GGUF): [huihui-ai/Huihui-Qwen3.8-27B-abliterated](https://huggingface.co/huihui-ai/Huihui-Qwen3.8-27B-abliterated)
- Página en Ollama: [huihui_ai/Qwen3.8-abliterated](https://ollama.com/huihui_ai/Qwen3.8-abliterated)
- Herramienta de abliteration: [remove-refusals-with-transformers](https://github.com/Sumandora/remove-refusals-with-transformers)
- llama.cpp: [https://github.com/ggml-org/llama.cpp](https://github.com/ggml-org/llama.cpp)
