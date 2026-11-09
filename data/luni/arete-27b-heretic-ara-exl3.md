# Luni/Arete-27B-Heretic-ARA-EXL3

## Resumen

Arete-27B-Heretic-ARA-EXL3 es una cuantizacion EXL3 del modelo Luni/Arete-27B-Heretic-ARA, publicada por el usuario Luni en Hugging Face. El modelo base es un post-entrenamiento de Qwen3.8-27B (27.000 millones de parametros) orientado a reforzar valores occidentales, segun la nota de Nous Research enlazada en la busqueda. La variante "Heretic-ARA" anade un proceso de abliteration que reduce los rechazos del modelo base, y esta version concreta redistribuye los pesos en formato EXL3 para inferencia con ExLlamaV3/TabbyAPI.

El interes practico de esta publicacion es la coleccion de cuantizaciones por rama (3.0, 4.0, 4.3, 5.0 y 6.0 bits por peso), pensadas para cubrir desde tarjetas de 16 GB hasta GPUs de 32 GB, con una torre de vision cuantizada a 6 bpw y una cabeza MTP (multi-token prediction) de Qwen3.8-27B incluida para decodificacion especulativa. El pipeline declarado es image-text-to-text, por lo que el modelo es multimodal.

La ficha se basa exclusivamente en la model card del autor y en los metadatos de Hugging Face; no se dispone de datos de entrenamiento, benchmarks publicos ni documentacion adicional del modelo base mas alla de la nota de Nous Research.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (base Qwen3.8-27B) con cabeza MTP; cuantizacion EXL3 |
| Parametros totales | 27.000 millones (27B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | hasta 128k segun la model card (rama 4.3bpw "best quality that still fits 128k") |
| Tipos de cuantizacion | EXL3 a 3.0, 4.0, 4.3, 5.0 y 6.0 bpw; cabeza a 6 bpw; torre de vision a 6 bpw |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | EXL3 (libreria exllamav3) |
| Tamano del repo | 36,1 GB |
| Fecha de creacion | 2026-11-08 |

## Arquitectura y entrenamiento

El modelo base es un post-entrenamiento de Qwen3.8-27B realizado por Nous Research, segun la nota publica enlazada, con el objetivo declarado de "reforzar valores occidentales" sobre un modelo entrenado originalmente en China; la evaluacion asociada cubre 803 prompts en siete categorias de valores. La variante "Heretic-ARA" incorpora un proceso de abliteration que reduce la tasa de rechazos, y la model card reporta un 2,7% de rechazos duros en 816 prompts de retencion con `reasoning_effort: low`, frente a "la mayoria de prompts" en el modelo base.

La arquitectura subyacente es un transformer multimodal con torre de vision (pipeline image-text-to-text) y una cabeza MTP de Qwen3.8-27B que permite decodificacion especulativa mediante `draft_mode: mtp` en TabbyAPI. La cuantizacion EXL3 mantiene la cabeza y la torre de vision a 6 bpw en todas las ramas. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni las tecnicas de alineacion (RLHF/DPO) empleadas.

## Capacidades

- Generacion de texto y razonamiento con modo de esfuerzo configurable (`reasoning_effort`: `off`, `low`, `medium`, `xhigh`; la plantilla acepta `low`, `medium` y `xhigh`).
- Procesamiento de imagen y texto (pipeline image-text-to-text), con torre de vision cuantizada a 6 bpw.
- Decodificacion especulativa mediante cabeza MTP integrada (soporte en TabbyAPI con `draft_mode: mtp`).
- Reduccion de rechazos por abliteration: 2,7% de rechazos duros con esfuerzo bajo en la evaluacion del autor.
- Capacidades multilingues: no disponible.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible de forma explicita, aunque el modo de razonamiento (`reasoning_effort`) sugiere capacidad de cadena de pensamiento.

## Casos de uso

- Despliegue en GPUs de 16 GB: la rama `3.0bpw` (13,5 GB) permite ejecutar un modelo de 27B multimodal en tarjetas como RTX 4080 o RTX 4060 Ti de 16 GB mediante ExLlamaV3/TabbyAPI, con contexto reducido.
- Despliegue en GPUs de 24 GB con contexto largo: la rama `4.0bpw` (16,5 GB, KLD 0,011 frente a BF16) o la `4.3bpw` (17,5 GB) encajan en RTX 4090 o A10G y permiten ventanas de hasta 128k tokens, utiles para analisis de documentos extensos con imagenes intercaladas.
- Inferencia near-lossless en GPUs de 32 GB: la rama `6.0bpw` (22,6 GB) esta pensada para tarjetas como A100 40GB, RTX A6000 o V100 32GB, priorizando fidelidad frente a BF16.
- Generacion aumentada por recuperacion (RAG) multimodal: el modelo puede procesar capturas, diagramas o paginas escaneadas junto con texto de contexto, aprovechando la ventana de 128k para concatenar multiples fragmentos.
- Asistentes conversacionales sin filtrado excesivo: la abliteration reduce los rechazos, lo que resulta adecuado para aplicaciones creativas o de investigacion donde el modelo base rechazaria peticiones legitimas.
- Aceleracion de inferencia en produccion: la cabeza MTP integrada permite decodificacion especulativa en TabbyAPI, reduciendo la latencia por token en comparacion con decodificacion autoregresiva estandar.
- Evaluacion comparativa de alineacion: al ser un post-entrenamiento de Qwen3.8-27B con valores occidentales declarados, sirve para estudios de sesgo y alineacion frente al modelo original.

## Benchmarks y rendimiento

La model card no publica resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.). Solo se reportan dos metricas internas del autor, medidas sobre la cuantizacion de 4.0 bpw:

| Metrica | Valor |
|---|---|
| KLD vs BF16 (4.0 bpw) | 0,011 |
| Rechazos duros (816 prompts, low effort) | 2,7% |
| Rechazos duros en modelo base | "la mayoria de prompts" (sin cifra) |
| Evaluacion HumanEval-40 | mencionada, sin resultados publicados |

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada por rama: 13,5 GB (`3.0bpw`), 16,5 GB (`4.0bpw`), 17,5 GB (`4.3bpw`), 19,6 GB (`5.0bpw`), 22,6 GB (`6.0bpw`). Hay que sumar overhead de contexto KV cache, que crece con la ventana usada.
- GPUs recomendadas por rama: `3.0bpw` para tarjetas de 16 GB; `4.0`/`4.3bpw` para 24 GB (RTX 4090, A10G, L4 24GB); `5.0bpw` para 24 GB con contexto corto o 32 GB; `6.0bpw` para 32 GB (V100 32GB, A100 40GB, RTX A6000).
- Cabe en GPU consumer: si, en RTX 4090 (24 GB) con las ramas de 4.0 a 5.0 bpw, y en tarjetas de 16 GB con la rama 3.0 bpw.
- Opciones de despliegue: ExLlamaV3 y TabbyAPI (soporte nativo de EXL3 y de `draft_mode: mtp`). No se indica compatibilidad con vLLM, llama.cpp, Ollama ni TGI, ya que el formato EXL3 es especifico de ExLlamaV3.
- Latencia y throughput: no disponible; la decodificacion especulativa via MTP deberia reducirlos frente a decodificacion estandar, pero no se publican cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Arete-27B-Heretic-ARA-EXL3 | 27B | 128k | EXL3 | Apache 2.0 | Cuantizado, multimodal, abliterated |
| Luni/Arete-27B-Heretic-ARA | 27B | no disponible | safetensors (presumible) | Apache 2.0 | Modelo base sin cuantizar |
| Luni/Thinklite-27B-Heretic-EXL3 | 27B | no disponible | EXL3 | Apache 2.0 | Variante "thinklite" con razonamiento y abliteration, solo texto |
| Qwen3.8-27B (original) | 27B | no disponible | safetensors | no disponible | Modelo base original de Alibaba, sin post-entrenamiento occidental |

La comparativa se limita a los modelos mencionados en la informacion disponible; no se dispone de datos de rendimiento comparables entre ellos.

## Limitaciones y advertencias

- La abliteration reduce los rechazos, lo que puede aumentar la probabilidad de generar contenido danino o inapropiado; requiere moderacion externa en produccion.
- El post-entrenamiento declarado "refuerza valores occidentales", lo que introduce un sesgo ideologico explicito que puede afectar a respuestas sobre temas politicos o culturales.
- Riesgo de alucinacion: no evaluado en la informacion disponible; es esperable en un modelo de 27B sin benchmarks publicados.
- La cuantizacion EXL3 implica perdida de calidad respecto a BF16; el autor reporta KLD 0,011 en 4.0 bpw, pero no se ofrecen datos para las demas ramas.
- El formato EXL3 solo es compatible con ExLlamaV3/TabbyAPI, lo que limita las opciones de despliegue frente a GGUF o safetensors.
- Idiomas soportados no documentados; el modelo base Qwen3.8-27B esta orientado a chino e ingles, y el post-entrenamiento occidental puede haber alterado el equilibrio.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base y los datos de post-entrenamiento pueden tener restricciones adicionales no documentadas.
- No hay informacion sobre tool calling, agentes ni capacidades multilingues verificadas; no debe asumirse su disponibilidad en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Luni/Arete-27B-Heretic-ARA-EXL3
- Modelo base: https://huggingface.co/Luni/Arete-27B-Heretic-ARA
- Modelo relacionado (Thinklite): https://huggingface.co/Luni/Thinklite-27B-Heretic-EXL3
- Nota de Nous Research sobre Arete-27B: https://nousresearch.com/arete
- ExLlamaV3 (libreria de inferencia): no disponible en la busqueda
- TabbyAPI (servidor compatible): no disponible en la busqueda
