# mradermacher/Qwen3.5-35B-A3B-abliterated-GGUF

## Resumen

El modelo Qwen3.5-35B-A3B-abliterated-GGUF es una cuantización en formato GGUF del modelo Qwen3.5-35B-A3B-abliterated, creada por mradermacher. El modelo original, desarrollado por Alibaba Qwen, es un modelo de lenguaje de arquitectura híbrida que combina atención lineal con una mezcla dispersa de expertos (MoE), con aproximadamente 35 mil millones de parámetros totales y 3 mil millones activos. La versión "abliterated" elimina los mecanismos de rechazo y censura, ofreciendo respuestas sin restricciones de contenido. Esta cuantización GGUF permite ejecutar el modelo en hardware de consumo mediante motores como llama.cpp, Ollama o LM Studio, con múltiples niveles de precisión que van desde Q2_K hasta Q8_0, con tamaños de archivo entre 13 GB y 37 GB.

El repositorio contiene únicamente los pesos cuantizados en formato GGUF, sin el proyector de visión (mmproj), por lo que esta versión funciona exclusivamente como modelo de texto. La licencia Apache 2.0 permite uso comercial y modificación, lo que lo hace atractivo para integraciones en producción. Aunque el modelo original es un modelo de visión-lenguaje nativo, esta cuantización se centra en las capacidades de lenguaje.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: atención lineal + mezcla dispersa de expertos (MoE) |
| Parametros totales | 34.660.610.688 (~34,66 mil millones) |
| Parametros activos | 3 mil millones (según nomenclatura A3B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

Según la documentación oficial de Alibaba Cloud, el modelo Qwen3.5-35B-A3B es un modelo nativo de visión-lenguaje con una arquitectura híbrida que integra mecanismos de atención lineal y un modelo de mezcla dispersa de expertos, logrando una mayor eficiencia de inferencia en comparación con arquitecturas transformer densas. Su rendimiento general se describe como comparable al del Qwen3.5-27B. La versión "abliterated" ha sido sometida a un proceso de abliteración, que consiste en eliminar las respuestas de rechazo del modelo, permitiendo que responda a cualquier solicitud sin filtros de seguridad. No se dispone de información detallada sobre el entrenamiento (número de tokens, composición del dataset, uso de RLHF o DPO) en la información proporcionada.

## Capacidades

- Generación de texto sin censura: al ser abliterated, el modelo no rechaza solicitudes sobre temas sensibles, violencia, contenido adulto u otros temas que normalmente estarían bloqueados.
- Razonamiento y resolución de problemas: al ser un modelo de 35B con 3B activos, mantiene capacidades de razonamiento lógico y matemático, aunque no se han publicado benchmarks específicos.
- Generación de código: probablemente soporta tareas de programación, aunque no hay confirmación explícita en la documentación disponible.
- Tool calling / function calling: no se menciona en la información proporcionada; se considera no disponible.
- Capacidades multilingües: la model card solo indica "en", aunque el modelo original podría soportar más idiomas; no confirmado.
- Capacidades de visión: el modelo original es vision-language, pero esta versión GGUF no incluye el proyector de visión (skip_mmproj), por lo que solo funciona como modelo de texto.

## Casos de uso

- Escritura creativa sin restricciones: el modelo puede generar ficción, guiones, poesía o contenido narrativo con temáticas adultas o controvertidas sin rechazos, gracias a su naturaleza abliterated.
- Roleplay y simulación de personajes: adecuado para aplicaciones de chat inmersivo donde se requiere que el modelo adopte personalidades sin limitaciones de contenido.
- Generación de contenido para investigación sociológica: puede producir respuestas sobre temas tabú o sensibles para estudios académicos, siempre que se respeten las normativas éticas.
- Asistente de programación en entornos aislados: puede ayudar a generar código o explicar conceptos técnicos, aunque se recomienda verificar las salidas por posibles alucinaciones.
- Prototipado rápido de aplicaciones de chat: al ser un modelo GGUF, se puede integrar fácilmente en aplicaciones locales con llama.cpp u Ollama para pruebas de concepto.
- Análisis de texto sin filtros: útil para tareas de procesamiento de lenguaje natural donde se necesita una respuesta directa sin evasivas, como resúmenes o extracción de información.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye métricas de MMLU, HumanEval, GSM8K ni otras evaluaciones estándar. Se recomienda consultar la documentación del modelo base Qwen3.5-35B-A3B para obtener datos de rendimiento, aunque no se han proporcionado en esta ficha.

## Requisitos de hardware

- VRAM estimada para inferencia: según el tamaño de los archivos GGUF, se puede estimar:
  - Q2_K (13,0 GB): cabe en GPUs con 16 GB de VRAM (por ejemplo, RTX 4080, RTX 4090).
  - Q4_K_M (21,3 GB): requiere al menos 24 GB de VRAM (RTX 3090, RTX 4090, A5000).
  - Q8_0 (37,0 GB): necesita 40 GB o más (A100 40GB, H100, o múltiples GPUs).
- GPUs recomendadas: RTX 3090/4090 para cuantizaciones Q4 y superiores; A100 o H100 para Q8_0.
- Si cabe en consumer GPU: sí, con cuantizaciones Q4_K_M o inferiores en GPUs de 24 GB.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui, o cualquier motor compatible con GGUF.
- Latencia y throughput: no se dispone de datos medidos; dependerá del hardware y de la cuantización elegida.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Parámetros activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3.5-35B-A3B (original) | ~35B | 3B | no disponible | Apache 2.0 | safetensors |
| Qwen3.5-35B-A3B-abliterated (base) | ~35B | 3B | no disponible | Apache 2.0 | safetensors |
| Qwen3.5-35B-A3B-abliterated-GGUF (este) | ~35B | 3B | no disponible | Apache 2.0 | GGUF |

No se dispone de comparativas con otros modelos MoE de tamaño similar (como DeepSeek-V3 o Mixtral) en la información proporcionada. La principal diferencia entre las versiones es el proceso de abliteración y el formato de pesos.

## Limitaciones y advertencias

- Contenido sin filtrar: al ser abliterated, el modelo puede generar contenido ofensivo, ilegal o dañino. No debe utilizarse en aplicaciones públicas sin moderación humana.
- Riesgo de alucinación: como cualquier modelo de lenguaje, puede inventar hechos o respuestas incorrectas, especialmente en temas especializados.
- Idioma limitado: solo se confirma soporte para inglés; el rendimiento en otros idiomas no está garantizado.
- Sin componente de visión: esta versión GGUF no incluye el proyector de visión, por lo que no puede procesar imágenes a pesar de que el modelo original es multimodal.
- Contexto desconocido: no se ha especificado la longitud máxima de contexto; se recomienda probar con secuencias cortas para evitar degradación.
- Licencia Apache 2.0: permite uso comercial, pero se debe revisar si el proceso de abliteración cumple con las políticas de uso de la organización.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Qwen3.5-35B-A3B-abliterated-GGUF
- Modelo base (abliterated): https://huggingface.co/wangzhang/Qwen3.5-35B-A3B-abliterated
- Modelo original Qwen3.5-35B-A3B: https://huggingface.co/Qwen/Qwen3.5-35B-A3B
- Documentación de Alibaba Cloud: https://docs.modelstudio.console.alibabacloud.com/en/model-studio/qwen3-5-35b-a3b
- Repositorio GitHub de Qwen3.8 (incluye serie Qwen3.5): https://github.com/QwenLM/Qwen3.8
- Página de Ollama para versiones abliterated: https://ollama.com/huihui_ai/qwen3.5-abliterated
