# mradermacher/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic-GGUF

## Resumen

DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic es un modelo de lenguaje de aproximadamente 9 mil millones de parámetros (8.953.803.264 exactos según los safetensors), desarrollado por xtools-at y distribuido en formato GGUF por el cuantizador mradermacher. Se trata de un modelo derivado de la familia Qwen3.5 con destilación de DeepSeek, orientado a razonamiento, matemáticas y STEM, entrenado con SFT, RL (concretamente GSPO) y MTP (multi-token prediction). La variante "heretic" indica que el modelo ha pasado por un proceso de abliteración (decensurado), eliminando los mecanismos de rechazo del modelo base.

El modelo es relevante para desarrolladores que buscan un modelo de razonamiento sin restricciones de contenido que funcione en hardware de consumo, con soporte de function calling, tool use y capacidades multimodales (incluye archivos mmproj para visión). La licencia Apache 2.0 permite uso comercial sin restricciones, lo que lo hace atractivo para productos y servicios. El repositorio de mradermacher ofrece cuantizaciones estáticas desde Q2_K (3,9 GB) hasta f16 (18 GB), además de cuantizaciones imatrix ponderadas en un repositorio hermano.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer basado en Qwen3.5 (con MTP), detalles adicionales no disponibles |
| Parametros totales | 8.953.803.264 |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 (más variantes imatrix en repositorio aparte) |
| Idiomas soportados | inglés, chino, coreano, japonés, español, ruso |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (original en safetensors) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Qwen3.5 (transformer decoder) y ha sido entrenado mediante destilación desde DeepSeek V4 Pro, según los metadatos del repositorio. Los tags indican entrenamiento con SFT (supervised fine-tuning), RL con el algoritmo GSPO (Group Sequence Policy Optimization) y MTP (multi-token prediction), una técnica que permite predecir varios tokens por paso y acelerar la generación. El pipeline incluye capacidades multimodales, dado que el repositorio GGUF incluye archivos mmproj (proyectores multimodales) en Q8_0 y f16.

La variante "heretic" hace referencia a la herramienta Heretic, un proceso automatizado de abliteración que identifica y elimina direcciones de activación responsables de los rechazos del modelo, sin necesidad de datos de entrenamiento adicionales. El resultado es un modelo "uncensored" que responde a instrucciones sin aplicar los filtros de seguridad del modelo original. No se ha publicado información sobre el número de tokens de entrenamiento ni la composición detallada del dataset.

## Capacidades

- Razonamiento general y mode reasoning (tags "reasoning", "distillation" de DeepSeek)
- Matemáticas y STEM (tags "math", "stem")
- Generación de código y uso de herramientas (tags "tool-use", "function-calling")
- Capacidades multimodales de visión (archivos mmproj incluidos en el repositorio GGUF)
- Multilingüe: inglés, chino, coreano, japonés, español y ruso
- Generación conversacional (tag "conversational")
- Sin filtros de seguridad: la abliteración elimina los rechazos, lo que permite respuestas a cualquier petición sin negativas del modelo

## Casos de uso

- Investigación en alineación y seguridad: al ser un modelo abliterado, sirve para estudiar el impacto de la eliminación de salvaguardas en el comportamiento de LLMs, red-teaming y análisis de robustez.
- Asistentes técnicos sin restricciones de contenido: para entornos donde el filtrado del modelo interfiere con casos de uso legítimos (seguridad ofensiva autorizada, análisis de contenido sensible, escritura de ficción adulta).
- Resolución de problemas de matemáticas y STEM: gracias al entrenamiento con RL (GSPO) y destilación de DeepSeek, es adecuado para tutorías técnicas y generación de soluciones paso a paso en disciplinas científicas.
- Agentes con tool calling: soporta function calling, por lo que puede integrarse en frameworks de agentes (LangChain, llama-index) para tareas multi-paso con llamada a APIs y herramientas externas.
- Despliegue local en hardware de consumo: con la cuantización Q4_K_M (5,7 GB) funciona en GPUs de 8 GB de VRAM o incluso en CPU con RAM suficiente, ideal para prototipado sin coste de API.
- Aplicaciones multimodales locales: combinando los pesos de texto con los archivos mmproj, se pueden construir pipelines de descripción de imágenes o OCR asistido en local.
- Generación acelerada: si el runtime soporta MTP (multi-token prediction), la generación puede ser más rápida que en modelos equivalentes sin esta técnica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (según la tabla de cuantizaciones):
  - Q2_K: ~3,9 GB (cabe en GPUs de 4-6 GB)
  - Q3_K_M: ~4,7 GB
  - Q4_K_M: ~5,7 GB (cabe en RTX 3060 8 GB, RTX 4060)
  - Q5_K_M: ~6,6 GB
  - Q6_K: ~7,5 GB (RTX 4070, RTX 3080)
  - Q8_0: ~9,6 GB (RTX 4090, RTX 3090, o GPUs de 12 GB)
  - f16: ~18 GB (requiere GPU de 24 GB como RTX 4090/3090, o CPU con suficiente RAM)
- A estas cantidades hay que sumar el KV cache, que depende de la longitud de contexto (no publicada).
- Si se usa la parte multimodal, añadir ~0,7-1,0 GB por el mmproj.
- GPU recomendadas: RTX 3060 12 GB o superior para cuantizaciones medias; RTX 4090 para Q8_0/f16 con contexto amplio. Al ser un modelo de ~9B, no requiere A100/H100 salvo para servir muchos usuarios concurrentes.
- Consumer GPUs: sí, cabe cómodamente en GPUs de 8 GB con Q4_K_S o Q4_K_M.
- Despliegue: llama.cpp, Ollama, LM Studio, KoboldCpp, text-generation-webui; el modelo original en safetensors admite vLLM y TGI (library_name: transformers). Los archivos mmproj funcionan con runtimes llama.cpp compatibles con visión.
- Latencia y throughput: no disponible; con MTP, si el runtime lo soporta, la generación debería ser más rápida que en modelos comparables sin esta técnica.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multimodal | Licencia | Notas |
|---|---|---|---|---|---|
| DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic | 8,95B | no disponible | sí (mmproj) | Apache 2.0 | Abliterado, destilado de DeepSeek, RL con GSPO |
| Qwen3 8B (oficial) | 8,2B | 128K (según ficha oficial) | no (salvo variantes VL) | Apache 2.0 | Modelo base con filtros de seguridad intactos |
| DeepSeek-R1-Distill-Qwen-7B | 7,6B | 128K | no | MIT | Destilación de razonamiento de R1, censurado |

Nota: los datos de la fila de Qwen3 8B y DeepSeek-R1-Distill provienen de conocimiento general y no de la informacion proporcionada; conviene verificarlos en las fichas oficiales.

## Limitaciones y advertencias

- Modelo abliterado: carece de salvaguardas de seguridad. Es responsabilidad del desarrollador implementar filtros propios antes de exponerlo a usuarios finales; su uso para generar contenido ilegal o dañino puede tener implicaciones legales.
- Riesgo de alucinación: no disponible como dato específico, pero al ser un modelo abliterado y de 9B, la fiabilidad factual es limitada; no usar como fuente de verdad sin verificación.
- Longitud de contexto no publicada: no se puede garantizar rendimiento en tareas de contexto largo.
- La abliteración puede degradar ligeramente la calidad general del modelo respecto al original (efecto documentado en procesos de decensurado).
- Cuantizaciones bajas (Q2_K, Q3_K_S/M) tienen pérdida de calidad notable, especialmente en razonamiento y matemáticas.
- Sesgos: no disponible; al eliminar el fine-tuning de seguridad, los sesgos del modelo base pueden manifestarse sin mitigación.
- Licencia Apache 2.0 sin restricciones de uso comercial, pero los términos del modelo base (xtools-at/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic) deben revisarse por si existen condiciones adicionales.
- El repositorio de cuantización tiene 0 descargas registradas, por lo que no hay retroalimentación comunitaria sobre su funcionamiento.

## Enlaces

- Repositorio GGUF (cuantizaciones estáticas): https://huggingface.co/mradermacher/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic-GGUF
- Modelo base: https://huggingface.co/xtools-at/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic
- Cuantizaciones imatrix ponderadas: https://huggingface.co/mradermacher/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic-i1-GGUF
- Página de descargas del cuantizador: https://hf.tst.eu/model#DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic-GGUF
- Guía de uso de GGUF (referenciada en el README): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- FAQ y peticiones de cuantización: https://huggingface.co/mradermacher/model_requests
- Notas sobre cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Empresa del cuantizador: https://www.nethype.de/
