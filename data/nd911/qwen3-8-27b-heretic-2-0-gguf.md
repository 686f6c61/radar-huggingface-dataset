# ND911/Qwen3.8-27B-heretic-2.0-GGUF

## Resumen
Qwen3.8-27B-heretic-2.0-GGUF es una reconversión a formato GGUF del modelo reifnir/Qwen3.8-27B-heretic, que a su vez deriva del Qwen/Qwen3.8-27B del equipo Qwen. El autor de esta ficha de pesos es ND911, que se limita a convertir y cuantizar los pesos originales sin modificar los valores más allá del proceso de conversión y cuantización. El modelo base es un transformer multimodal de aproximadamente 26.900 millones de parámetros (26.895.998.464 según safetensors), orientado a tareas de image-text-to-text y conversación.

La particularidad del modelo es que ha sido sometido a un proceso de abliteración con la herramienta Heretic 2.0.0, en su variante ARA (Arbitrary-Rank Ablation), aplicada sobre las capas 32 a 52 de un total de 64. El resultado es un modelo "decensored": se eliminan las capas de rechazo explícitas, pero no se mejora la capacidad del modelo. Según la propia model card, el modelo mide 0/100 rechazos por coincidencia de palabras clave pero 36/100 rechazos según un clasificador entrenado, lo que indica que persisten patrones de evasiva ("no puedo aconsejar, pero...").

Es relevante para desarrolladores que necesitan un modelo multimodal de ~27B con licencia Apache-2.0 y sin capa de seguridad, desplegable en llama.cpp con soporte de visión mediante el proyector mmproj. El repo ocupa 87,4 GB e incluye cuantizaciones desde Q4_K_M hasta Q8_0, además del proyector de visión en bf16.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text); detalles de atención no disponibles |
| Parametros totales | 26.895.998.464 (~26,9B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | hasta 131.072 tokens (según configuración de ejemplo con `--tensor-split` y caché q8_0); 32.768 tokens en el ejemplo básico |
| Tipos de cuantizacion | Q8_0 (26,6 GiB), Q6_K (20,6 GiB), Q5_K_M (17,9 GiB), Q4_K_M (15,4 GiB); proyector de visión mmproj en bf16 (0,87 GiB) |
| Idiomas soportados | en, zh |
| Licencia | Apache-2.0 (los pesos); Heretic es AGPL-3.0 pero solo afecta a la herramienta |
| Formato de pesos | GGUF (llama.cpp); safetensors en el modelo base |

## Arquitectura y entrenamiento
El modelo base Qwen3.8-27B es un transformer multimodal que acepta entradas de imagen y texto (pipeline image-text-to-text). No se dispone en la información proporcionada de detalles sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO. La innovación técnica destacable es el proceso de abliteración: Heretic 2.0.0 con modificador ARA (Arbitrary-Rank Ablation) sobre las capas 32 a 52 de 64, con 500 iteraciones de optimización y una divergencia KL de 0,0338 respecto al modelo base. Este proceso elimina direcciones de activación asociadas al rechazo sin reentrenar los pesos.

La conversión a GGUF se realizó con `convert_hf_to_gguf.py` a BF16 y posteriormente con `llama-quantize`. El modelo conserva el modo de razonamiento (reasoning pass) activado por defecto en nivel `xhigh`, que puede desactivarse con `-rea off` en llama.cpp. El proyector de visión es un fichero separado (mmproj) necesario para el procesamiento de imágenes.

## Capacidades
- Generación de texto conversacional multi-turno en inglés y chino.
- Procesamiento de imágenes (image-text-to-text) mediante el proyector mmproj en bf16.
- Modo de razonamiento (reasoning pass) activado por defecto en nivel `xhigh`, desactivable.
- Soporte de plantilla Jinja (`--jinja`) para formateo de conversaciones.
- Compatibilidad con endpoints (tag `endpoints_compatible`).
- Capacidad de respuesta sin rechazo explícito en temas sensibles (modelo abliterado).
- No se documenta soporte explícito de tool calling o function calling en la información disponible.
- No se documenta soporte explícito de agentes multi-step en la información disponible.
- No se documenta soporte de audio.

## Casos de uso
- Despliegue local de un modelo multimodal de ~27B en una estación de trabajo con una GPU de 24 GB: la cuantización Q6_K (20,6 GiB) es la de mayor calidad que cabe en una tarjeta de 24 GB, según la propia model card, lo que permite inferencia local con visión sin infraestructura en la nube.
- Análisis de imágenes con descripción textual en inglés o chino: usando `llama-server` con `--mmproj` y los parámetros `--image-min-tokens 1024 --image-max-tokens 1024` que espera la plantilla Qwen-VL, se pueden procesar capturas, diagramas o fotografías y obtener descripciones o respuestas conversacionales.
- Generación de texto sin restricciones de contenido para investigación sobre alineación y seguridad: el modelo permite estudiar el comportamiento de un modelo abliterado, comparando sus respuestas con las del Qwen3.8-27B original para analizar qué se elimina y qué persiste (36/100 rechazos según clasificador).
- Conversación multi-turno con contexto largo: con hasta 131.072 tokens de contexto configurados en dos GPU mediante `--tensor-split 30,70` y caché K/V en q8_0, se pueden mantener sesiones extensas con documentos o historiales largos.
- Evaluación de robustez frente a alucinación: dado que el modelo confabula en lugar de declinar (según la model card, inventó una estrofa de poema), es útil como caso de estudio para medir la fiabilidad de modelos decensored en tareas factuales.
- Prototipado de asistentes conversacionales en llama.cpp: la integración con `llama-server` y la compatibilidad con endpoints permiten montar un servicio HTTP local para pruebas de integración en aplicaciones de chat.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible. La model card únicamente reporta métricas del proceso de abliteración y de comportamiento:

| Metrica | Valor |
|---|---|
| Rechazos por coincidencia de palabras clave | 0/100 |
| Rechazos según clasificador entrenado | 36/100 |
| Divergencia KL respecto al base | 0,0338 |
| Capas abliteradas | 32–52 de 64 |
| Iteraciones de optimización | 500 |

## Requisitos de hardware
- VRAM estimada para inferencia: Q4_K_M ~15,4 GiB, Q5_K_M ~17,9 GiB, Q6_K ~20,6 GiB, Q8_0 ~26,6 GiB; el proyector de visión añade ~0,87 GiB.
- GPU recomendadas: no se especifican modelos concretos en la información disponible; por tamaño, una RTX 4090 (24 GB) puede ejecutar Q6_K y Q5_K_M; Q8_0 requiere más de 24 GB o reparto entre varias GPU.
- Cabe en GPU de consumo: sí, en tarjetas de 24 GB con cuantizaciones Q4_K_M, Q5_K_M y Q6_K; Q8_0 no cabe en una sola tarjeta de 24 GB.
- Opciones de despliegue: llama.cpp (`llama-server`, `llama-quantize`); no se documentan otras opciones como vLLM, Ollama o TGI para estos GGUF.
- Configuración conocida para 131k de contexto en dos tarjetas: `--tensor-split 30,70 --cache-type-k q8_0 --cache-type-v q8_0`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Qwen3.8-27B-heretic-2.0-GGUF (este) | ~26,9B | hasta 131.072 | en, zh | Apache-2.0 | GGUF | Abliterado con Heretic 2.0.0 (ARA), multimodal |
| Qwen/Qwen3.8-27B (base) | ~26,9B | no disponible | en, zh | Apache-2.0 | safetensors | Modelo original con capa de seguridad intacta |
| reifnir/Qwen3.8-27B-heretic | ~26,9B | no disponible | en, zh | Apache-2.0 | safetensors | Pesos abliterados originales, sin cuantizar |

No se dispone de datos de benchmarks para comparar el rendimiento entre estas variantes en la información proporcionada.

## Limitaciones y advertencias
- El modelo es decensored, no más inteligente: la abliteración elimina rechazos explícitos pero no mejora las capacidades del modelo base.
- Persisten evasivas: un 36/100 de respuestas siguen leyéndose como rechazos para un clasificador, típicamente con patrones del tipo "no puedo aconsejar, pero...".
- Riesgo alto de confabulación: según la model card, el modelo inventa contenido en lugar de declinar; se cita el ejemplo de una estrofa de poema inventada. Verificar cualquier dato factual o cita textual.
- Idiomas limitados a inglés y chino; no se documenta soporte de castellano.
- Sin capa de seguridad: los outputs son responsabilidad del usuario; no apto para producción orientada a usuarios finales sin filtros externos.
- La licencia Apache-2.0 se hereda de Qwen3.8-27B; Heretic es AGPL-3.0 pero solo afecta a la herramienta, no a los modelos que produce.
- El repo tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación comunitaria independiente más allá de las comprobaciones puntuales del autor.
- El proyector de visión es un fichero separado; sin `--mmproj` no hay soporte de imágenes.
- No se documentan benchmarks estándar (MMLU, HumanEval, GSM8K) que permitan comparar su rendimiento con otros modelos.

## Enlaces
- Hugging Face: https://huggingface.co/ND911/Qwen3.8-27B-heretic-2.0-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Pesos abliterados originales: https://huggingface.co/reifnir/Qwen3.8-27B-heretic
- Herramienta Heretic: https://github.com/p-e-w/heretic
- Perfil del autor de la conversión: https://huggingface.co/ND911
