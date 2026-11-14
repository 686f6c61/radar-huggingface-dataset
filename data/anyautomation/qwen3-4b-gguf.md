# AnyAutomation/qwen3-4b-gguf

## Resumen

`AnyAutomation/qwen3-4b-gguf` es un repositorio de espejo que contiene una copia sin modificar del archivo `Qwen3-4B-Q4_K_M.gguf` publicado originalmente por el equipo Qwen en `Qwen/Qwen3-4B-GGUF` (commit `bc640142c66e1fdd12af0bd68f40445458f3869b`). No se trata de un modelo nuevo ni de una variante afinada: es el mismo binario, replicado por AnyAutomation para poder descargarlo desde una dirección fijada (pinned) en su software, con el objetivo de garantizar reproducibilidad en sus despliegues.

El modelo subyacente, Qwen3-4B, es un transformer denso de 4.022.468.096 parámetros desarrollado por el equipo Qwen de Alibaba, con soporte de modo razonamiento (thinking) y contexto nativo de 32.768 tokens extensible hasta 131.072 mediante YaRN. La versión aquí alojada está cuantizada en Q4_K_M, lo que reduce el peso del archivo a 2.497.280.256 bytes (unos 2,5 GB) y permite ejecutarlo en GPUs de consumo con 4-6 GB de VRAM.

La relevancia de este repositorio es operativa, no técnica: ofrece un artefacto GGUF con hash SHA-256 verificado y licencia Apache 2.0, apto para pipelines que necesitan una fuente estable e inmutable del modelo. Cualquier evaluación de capacidades, sesgos o rendimiento debe remitirse a la model card original de Qwen3-4B.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3), decodificador causal |
| Parametros totales | 4.022.468.096 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 32.768 tokens nativos en Qwen3-4B; extensible a 131.072 con YaRN (segun model card original) |
| Tipos de cuantizacion | Q4_K_M (unico archivo incluido en este repo) |
| Idiomas soportados | no disponible en este repositorio; la model card original de Qwen3-4B declara multilingue (chino, ingles y otros) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (`Qwen3-4B-Q4_K_M.gguf`) |
| Tamano del archivo | 2.497.280.256 bytes (~2,5 GB) |
| SHA-256 | `7485fe6f11af29433bc51cab58009521f205840f5b4ae3a32fa7f92e8534fdf5` |
| Modelo base | Qwen/Qwen3-4B |
| Commit de origen | `bc640142c66e1fdd12af0bd68f40445458f3869b` |

## Arquitectura y entrenamiento

La arquitectura corresponde a Qwen3-4B, un transformer denso con atención causal estándar, normalización RMSNorm, embeddings RoPE y activación SwiGLU en las capas feed-forward, siguiendo el diseño de la familia Qwen3. El modelo incorpora un modo de razonamiento explícito (thinking) que puede activarse o desactivarse por prompt, y soporta contexto nativo de 32.768 tokens ampliable a 131.072 mediante interpolación YaRN.

Los detalles de entrenamiento (número de tokens, composición del corpus, fases de RLHF/DPO) no se documentan en este repositorio: el autor indica explícitamente que la descripción, el uso previsto y las limitaciones deben consultarse en la model card original de `Qwen/Qwen3-4B`. La única modificación aplicada respecto al checkpoint original es la cuantización Q4_K_M, realizada por el equipo Qwen antes de publicar el GGUF; este repositorio no altera ni un byte del archivo.

## Capacidades

- Generación de texto y razonamiento multi-paso, con modo thinking activable.
- Generación de código en múltiples lenguajes y resolución de problemas matemáticos.
- Soporte de tool calling / function calling (heredado de Qwen3-4B).
- Capacidad de agentes y razonamiento encadenado multi-step.
- Multilingüismo según la model card original de Qwen3-4B (chino, inglés y otras lenguas; el listado exacto no se detalla en este repositorio).
- Conversación multi-turno con contexto largo (hasta 32.768 tokens nativos).
- No incluye visión ni audio: es un modelo exclusivamente de texto.

## Casos de uso

- Despliegue reproducible en producción: el hash SHA-256 y la dirección fijada permiten integrar el modelo en imágenes de contenedor o artefactos de CI sin riesgo de que el binario cambie entre builds.
- Inferencia local en estaciones de trabajo: con ~2,5 GB en Q4_K_M cabe en GPUs de consumo (RTX 3060 6 GB, RTX 4060 8 GB) y en CPU con llama.cpp u Ollama, habilitando asistentes de código offline.
- Atención al cliente automatizada: los 32.768 tokens de contexto permiten mantener conversaciones multi-turno con historial extenso y documentos de referencia adjuntos.
- Generación de código en pipelines de CI/CD: el soporte de tool calling permite integrarlo en agentes que ejecutan tests, aplican parches o consultan APIs.
- Procesamiento de documentos largos: resumen y extracción de información sobre contratos, informes o logs de hasta ~32k tokens en una sola pasada.
- Prototipado de agentes: su tamaño reducido y licencia Apache 2.0 facilitan iterar sobre flujos de razonamiento multi-paso sin coste de API.
- Educación y experimentación académica: modelo ligero para estudiar técnicas de cuantización, decodificación y evaluación de sesgos en hardware asequible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio es un espejo del GGUF y no incluye métricas propias; para evaluaciones de referencia debe consultarse la model card de `Qwen/Qwen3-4B` y el informe técnico de Qwen3.

## Requisitos de hardware

- VRAM estimada para inferencia en Q4_K_M: ~3,5-4,5 GB incluyendo overhead de contexto y caché KV (el archivo pesa 2,5 GB).
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 8 GB, RTX 4070, RTX 4090; en datacenter, A10G, L4, A100 y H100 (sobradas para este tamaño).
- Cabe en GPU de consumo: sí, desde 6 GB de VRAM en adelante; también en CPU con llama.cpp (rendimiento dependiente de núcleos y ancho de banda de memoria).
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, llama-cpp-python, vLLM (soporte GGUF experimental), text-generation-webui.
- Latencia y throughput: no disponibles en la información proporcionada; dependerán del hardware y del backend.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| AnyAutomation/qwen3-4b-gguf (este) | 4,02 B | 32.768 (131.072 con YaRN) | Apache 2.0 | GGUF Q4_K_M | Espejo verificado de Qwen3-4B |
| Qwen/Qwen3-4B-GGUF | 4,02 B | 32.768 (131.072 con YaRN) | Apache 2.0 | GGUF (varias cuantizaciones) | Fuente original; incluye Q8_0, Q6_K, Q5_K_M, Q4_K_M, Q3_K_M, Q2_K |
| Qwen/Qwen3-4B | 4,02 B | 32.768 (131.072 con YaRN) | Apache 2.0 | safetensors | Pesos completos en BF16; requiere ~8 GB de VRAM |
| Llama 3.2 3B Instruct | 3,21 B | 131.072 | Llama 3.2 Community License | safetensors, GGUF | Alternativa de tamaño similar; licencia con restricciones para >700 M usuarios |
| Phi-3.5-mini-instruct | 3,82 B | 131.072 | MIT | safetensors, GGUF | Contexto largo nativo; entrenamiento centrado en inglés |

## Limitaciones y advertencias

- Este repositorio no documenta sesgos propios; deben evaluarse los del modelo base Qwen3-4B, que la model card original describe como no auditados de forma exhaustiva.
- Riesgo de alucinación inherente a los modelos de 4 B de parámetros, especialmente en dominios especializados y con contexto muy largo.
- La cuantización Q4_K_M introduce una pérdida de precisión medible frente a BF16; no se han publicado métricas de degradación en este repositorio.
- El listado exacto de idiomas soportados no está disponible aquí; conviene verificar el rendimiento en castellano contra la model card original antes de usarlo en producción.
- La licencia Apache 2.0 permite uso comercial sin restricciones adicionales, pero se recomienda conservar el archivo `LICENSE` y la atribución al equipo Qwen.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso comunitario que valide la integridad más allá del hash publicado.
- Al ser un espejo, cualquier corrección o actualización del modelo original no se reflejará automáticamente aquí.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/AnyAutomation/qwen3-4b-gguf
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B
- GGUF original: https://huggingface.co/Qwen/Qwen3-4B-GGUF
- Commit de origen: `bc640142c66e1fdd12af0bd68f40445458f3869b`
