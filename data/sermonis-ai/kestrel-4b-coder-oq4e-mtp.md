# sermonis-ai/Kestrel-4B-Coder-oQ4e-mtp

## Resumen

Kestrel-4B-Coder-oQ4e-mtp es una cuantización a 4 bits en formato MLX de Jackrong/Kestrel-4B-Coder, un ajuste fino orientado a programación y agentes construido sobre Qwen3.5-4B (linaje: Qwen/Qwen3.5-4B → unsloth/Qwen3.5-4B → Kestrel). La cuantización fue realizada por sermonis-ai con el cuantizador de streaming oQ4e de oMLX, y destaca por preservar tanto la torre de visión (en BF16 sin cuantizar) como la cabeza de predicción multi-token (MTP) integrada en el modelo original.

El resultado es un modelo multimodal (imagen-texto a texto) de unos 4,66 mil millones de parámetros que ocupa solo 3,3 GB en disco, apto para ejecutarse en hardware Apple Silicon con memoria unificada. Su relevancia reside en que combina capacidades de generación de código, tool calling y visión con una inferencia acelerada por MTP (decodificación especulativa con varios tokens por ciclo), todo bajo licencia Apache 2.0.

La ficha de verificación publicada por el autor muestra una degradación mínima respecto al modelo fuente: la perplejidad sube apenas un 0,202 % y la divergencia KL media del siguiente token es de 0,01579 nats, con una ganancia de throughput del orden del 9-20 % al activar MTP.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `qwen3_5` VLM (`Qwen3_5ForConditionalGeneration`), con torre de visión y cabeza MTP |
| Parametros totales | 4.659.865.088 (4,66 B); torre de visión: 333,51 M |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | oQ4e (oQ nivel 4, imatrix mejorada, `group_size=64`, afín); texto en 4 bits, visión en BF16 |
| Idiomas soportados | no disponible (el imatrix de calibración es `oqe_code_multilingual`, lo que sugiere soporte multilingüe heredado de Qwen3.5) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX), empaquetados como U32; almacenamiento en bfloat16 |

Otros datos técnicos relevantes:

| Parametro | Valor |
|---|---|
| Tamaño del repo | 3,3 GB (3.265.548.624 bytes) |
| Tensors | 1250 totales (953 lenguaje + 297 visión); 0 `lm_head` |
| MTP | 1 capa, 29 tensors bajo `language_model.mtp.*` |
| Imatrix | `oqe_code_multilingual`, 128 muestras × 512 tokens, 256 entradas |
| Runtime requerido | oMLX ≥ 0.7.1 con MLX 0.32.4 |

## Arquitectura y entrenamiento

El modelo base es un ajuste fino de Qwen3.5-4B, una arquitectura transformer con torre de visión integrada (arquitectura VLM condicional) y una cabeza de predicción multi-token (MTP) de una sola capa. La MTP funciona como un mecanismo de decodificación especulativa: predice varios tokens por ciclo y el verificador acepta los que coinciden, lo que aumenta el throughput sin cambiar la calidad de la distribución de salida. En las pruebas del autor, la tasa media de aceptación de borradores fue del 74,7 %, con 1,80 tokens por ciclo.

En cuanto al entrenamiento del modelo base (Kestrel-4B-Coder por Jackrong), no se han publicado detalles sobre el número de tokens, la composición del dataset ni el uso de RLHF/DPO en la información disponible. Sí se sabe que el ajuste fino está orientado a programación y agentes.

La cuantización oQ4e es el aporte específico de esta variante: usa nivel 4 de oQ con matriz de importancia (imatrix) mejorada, `group_size=64` y cuantización afín, calibrada con 128 muestras multilingües de código de 512 tokens. Se aplicaron 92 boosts por capa para proteger las capas más sensibles. La torre de visión se mantiene en BF16 sin cuantizar para preservar la calidad multimodal.

## Capacidades

- Generación de código: el modelo base está afinado específicamente para tareas de programación; las pruebas de humo con 5 prompts de código pasaron sin artefactos de truncamiento.
- Comprensión de imágenes: la torre de visión (333,51 M de parámetros, en BF16) permite análisis de capturas de pantalla, diagramas y tablas; en las pruebas identificó correctamente tablas comparativas y gráficos de barras.
- Tool calling / function calling: verificado en las pruebas del autor (T7), con salida JSON válida con nombre y argumentos esperados.
- Capacidades agentivas: el modelo base está orientado a agentes; combinado con tool calling, es apto para flujos multi-paso.
- Modo thinking: el runtime admite `enable_thinking` (desactivado por defecto en la configuración recomendada).
- Decodificación especulativa vía MTP: aceleración del 8,9 % en media y del 19,9 % en mediana frente a MTP desactivado.
- Multilingüe: la calibración del imatrix usó datos multilingües de código, aunque la lista oficial de idiomas no está disponible.
- Generación de texto conversacional: pipeline `image-text-to-text` y tag `conversational`.

## Casos de uso

- Asistente de programación local en Mac: con 3,3 GB de peso, el modelo cabe cómodamente en la memoria unificada de cualquier Mac con Apple Silicon (M1 o superior), lo que lo hace ideal para autocompletado y generación de código sin depender de la nube.
- Análisis de capturas de pantalla y documentación visual: gracias a la torre de visión preservada en BF16, puede leer tablas de benchmarks, diagramas de arquitectura o capturas de errores y traducirlos a código o explicaciones.
- Agentes de código con tool calling: su soporte verificado de function calling en JSON permite integrarlo en frameworks de agentes (LangChain, funciones propias) para ejecutar herramientas como búsqueda de archivos, ejecución de tests o consultas a APIs.
- Servidor de inferencia local tipo OpenAI: mediante `omlx serve` se despliega como servicio HTTP en el puerto que se indique, apto para integrarse en IDEs o aplicaciones locales.
- Revisión de pull requests con contexto visual: puede combinar diffs de código con capturas de la interfaz resultante para validar cambios de UI.
- Prototipado rápido de agentes multimodales: la combinación de tamaño reducido, licencia Apache 2.0 y visión integrada permite experimentar con agentes que ven y actúan sin coste de API.
- Generación de documentación técnica: las pruebas de respuestas largas (512 tokens) muestran coherencia sin bucles de repetición significativos (máximo 15-grama repetido: 1).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandarizados (MMLU, HumanEval, GSM8K, etc.) para esta variante en la información disponible; el autor indica explícitamente que no re-ejecutó los benchmarks de la model card del modelo fuente.

Sí se publicaron mediciones propias de calidad y rendimiento de la cuantización:

| Metrica | Modelo fuente (BF16) | Esta variante (oQ4e) |
|---|---:|---:|
| Perplejidad (5 snippets de código, 422 tokens) | 1,8579 | 1,8617 (+0,202 %) |
| KL media del siguiente token | — | 0,01579 nats |

Throughput con y sin MTP (Apple M2 Max, `temperature=0`, 256 tokens máx., 3 prompts × 3 ejecuciones):

| Configuracion | Tok/s medios | Tok/s medianos |
|---|---:|---:|
| MTP desactivado | 20,22 | 18,28 |
| MTP activado | 22,01 (+8,9 %) | 21,92 (+19,9 %) |

## Requisitos de hardware

- VRAM / memoria estimada: unos 3,3 GB solo de pesos; con KV cache y sobrecarga de runtime, se recomienda disponer de al menos 6-8 GB de memoria unificada disponible.
- Hardware objetivo: Apple Silicon (la etiqueta `apple-silicon` y el formato MLX lo confirman). Verificado en un Apple M2 Max con 96 GiB de memoria unificada; debería funcionar en cualquier Mac M1/M2/M3/M4 con suficiente RAM libre.
- No aplica a GPUs NVIDIA de forma directa: MLX está diseñado para Apple Silicon; para CUDA habría que usar el modelo base `Jackrong/Kestrel-4B-Coder` en BF16 u otras cuantizaciones (GGUF, etc.).
- En consumer hardware: sí, cualquier Mac con Apple Silicon y 8 GB de RAM o más debería ejecutarlo sin problemas al ocupar los pesos solo 3,3 GB.
- Despliegue: requiere oMLX ≥ 0.7.1 con MLX 0.32.4 (con su patch del runtime Qwen3.5 VLM). El `mlx_vlm` estándar elimina silenciosamente los tensors MTP al cargar, y `mlx_lm` no puede cargar la torre de visión, por lo que no son opciones válidas para esta variante completa.
- Rendimiento medido: 20-22 tok/s en un M2 Max; con MTP activado, 1,80 tokens por ciclo de decodificación con 74,7 % de aceptación de borrador.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Vision | MTP | Licencia | Formato |
|---|---|---|---|---|---|---|
| Kestrel-4B-Coder-oQ4e-mtp (este) | 4,66 B | 4-bit oQ4e (texto), BF16 (visión) | Sí | Sí (1 capa) | Apache 2.0 | MLX safetensors |
| Jackrong/Kestrel-4B-Coder (base) | 4,66 B | BF16 | Sí | Sí | Apache 2.0 | safetensors (9,32 GB) |
| Kestrel-4B-Coder-oQ4e-fp16-mtp (hermano) | 4,66 B | 4-bit oQ4e, visión/audios en float32 | Sí | Sí | Apache 2.0 | MLX safetensors (~3,93 GB) |

La variante oQ4e-mtp ocupa menos de la mitad del espacio del modelo base (3,3 GB frente a 9,32 GB) con una degradación de perplejidad de solo +0,202 %, manteniendo todas las capacidades multimodales y de MTP. Frente a su hermano FP16, es un 17 % más ligero, a costa de almacenar la visión en BF16 en lugar de float32. Comparaciones con otros modelos de código de 4B (Qwen2.5-Coder-4B, DeepSeek-Coder, etc.) no están disponibles en la información proporcionada.

## Limitaciones y advertencias

- Es una cuantización derivada, no un modelo nuevo: las garantías de calidad se limitan a las pruebas publicadas por el autor; los benchmarks del modelo fuente no fueron re-ejecutados.
- Compatibilidad de runtime muy restringida: solo funciona con oMLX ≥ 0.7.1 (con patch de runtime Qwen3.5 VLM). El `mlx_vlm` estándar pierde los tensors MTP silenciosamente y `mlx_lm` no carga la torre de visión.
- Riesgo de alucinación: inherente a modelos de lenguaje de 4B; no se dispone de evaluaciones de veracidad en la información disponible.
- Sesgos: heredados de Qwen3.5-4B y del ajuste fino de Kestrel; no se han documentado sesgos específicos.
- Contexto: la longitud de ventana de contexto no está disponible en la documentación consultada.
- Idiomas: la lista oficial de idiomas soportados no está disponible; la calibración fue multilingüe pero el soporte real depende del modelo base.
- Repetición en respuestas largas: el propio autor advierte que las respuestas largas pueden caer en bucles de repetición; recomienda reintentar con `temperature=1.0`, `top_p=0.95`, `top_k=20`.
- Advertencia del tokenizer: transformers 5.17 emite un aviso de regex del pre-tokenizador; el tokenizer no ha cambiado respecto al modelo fuente.
- Throughput con MTP: la varianza es alta según el propio autor; la ganancia media (+8,9 %) puede variar notablemente según el prompt.
- Licencia: Apache 2.0 permite uso comercial sin restricciones relevantes, aunque conviene revisar también la licencia del modelo base y de Qwen3.5.

## Enlaces

- Modelo cuantizado: https://huggingface.co/sermonis-ai/Kestrel-4B-Coder-oQ4e-mtp
- Modelo base: https://huggingface.co/Jackrong/Kestrel-4B-Coder
- Variante hermana FP16: `sermonis-ai/Kestrel-4B-Coder-oQ4e-fp16-mtp` (en Hugging Face, bajo el autor sermonis-ai)
- Linaje upstream: https://huggingface.co/Qwen/Qwen3.5-4B y https://huggingface.co/unsloth/Qwen3.5-4B
- Otros enlaces (papers, blogs, demos): no disponibles en la información proporcionada.
