# kingjones777/Qwen3.5-4B-Post-Reasoning-SuperRoc-GGUF

## Resumen

Qwen3.5-4B-Post-Reasoning-SuperRoc-GGUF es una cuantización GGUF en formato ROCm-FP4 del modelo richmondsin/Qwen3.5-4B-Post-Reasoning, publicada por el usuario kingjones777. Se trata de un build optimizado específicamente para Super Roc, un motor de inferencia local orientado al hardware Strix Halo (AMD Ryzen AI Max+ 395, arquitectura gfx1151). El modelo base pertenece a la familia Qwen3.5 con aproximadamente 4.205 millones de parámetros (4,2B), licencia Apache 2.0 y orientación a generación de texto conversacional.

La relevancia de esta ficha radica en que no es un modelo nuevo entrenado desde cero, sino una distribución de pesos cuantizados pensada para ejecutar un LLM de 4B en hardware de consumo AMD con aceleración ROCm. El autor reporta una perplejidad de 9,51 sobre un documento técnico en inglés de 11K tokens (contexto 4096), frente a 9,47 del Q4_K_M estándar del mismo modelo, lo que indica una degradación mínima por la cuantización FP4 específica de ROCm.

El contexto cargado en las pruebas alcanza los 131.072 tokens según la model card, y el despliegue se realiza mediante el motor Super Roc o a través de Lemonade. La información disponible sobre el entrenamiento original del modelo base es escasa; los datos técnicos proceden principalmente de la model card del autor de la cuantización.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (heredada del modelo base Qwen3.5-4B; detalles no disponibles) |
| Parametros totales | 4.205.751.296 (4,2B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 131.072 tokens (contexto cargado en las pruebas del motor Super Roc) |
| Tipos de cuantizacion | Q4_0 con formato ROCm-FP4 (archivo Q4_0-ROCmFP4-FAST-imatrix.gguf) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (2.434.454.176 bytes, ~2,4 GB) |

## Arquitectura y entrenamiento

La arquitectura subyacente corresponde al modelo base richmondsin/Qwen3.5-4B-Post-Reasoning, un transformer de 4,2B parámetros de la familia Qwen3.5. La model card de esta cuantización no detalla la composición del dataset de entrenamiento, el número de tokens vistos ni si se aplicaron técnicas de RLHF o DPO en el modelo original. El sufijo "Post-Reasoning" del nombre sugiere un ajuste orientado a razonamiento posterior, pero no se aportan datos verificables al respecto en la información disponible.

La innovación técnica destacable de esta publicación es la cuantización en formato ROCm-FP4, desarrollada por el equipo ROCmFPX y construida sobre llama.cpp/ggml. El autor reporta que la perplejidad sobre un documento técnico en inglés de 11K tokens (contexto 4096) es de 9,51, muy cercana al 9,47 del Q4_K_M estándar, lo que sugiere que la cuantización FP4 específica para ROCm preserva la calidad del modelo con una huella de ~2,4 GB. El motor Super Roc soporta además decodificación con drafter (desactivado en las mediciones reportadas) y prompt lookup.

## Capacidades

- Generación de texto conversacional multi-turno, según el pipeline text-generation y la etiqueta conversational.
- Razonamiento: el nombre del modelo base incluye "Post-Reasoning" y el motor permite activar el modo thinking por petición mediante chat_template_kwargs.enable_thinking.
- Tool calling / function calling: la model card reporta 7/8 en tool calls requeridos y 7/8 en modo automático.
- Generación de código: se midió un rendimiento de 68,0 tok/s en una media de dos prompts de código.
- Soporte de contexto largo: carga hasta 131.072 tokens en el motor Super Roc.
- Caché de prompt: en el segundo turno se reutilizaron 6.961 de 6.986 tokens de prompt.
- Capacidades multilingües: no disponible (no se especifican idiomas).
- Visión y audio: no disponible (no se mencionan).

## Casos de uso

- Asistencia conversacional local en hardware Strix Halo: el modelo puede gestionar diálogos multi-turno con contexto de hasta 131.072 tokens, aprovechando la caché de prompt (6.961 de 6.986 tokens reutilizados en el segundo turno) para reducir el coste de reprocesamiento en conversaciones largas.
- Automatización de agentes con tool calling: con una tasa reportada de 7/8 en llamadas a herramientas requeridas y automáticas, es adecuado para pipelines de agentes que necesiten invocar funciones externas en un entorno local sin depender de la nube.
- Generación de código en estaciones de trabajo AMD: a 68 tok/s en prompts de código, puede integrarse en asistentes de programación locales o scripts de generación de tests sobre hardware Ryzen AI Max+ 395.
- Procesamiento de documentos técnicos largos: la perplejidad de 9,51 sobre un documento técnico de 11K tokens y el contexto de 131K permiten tareas de resumen, extracción o pregunta-respuesta sobre documentación extensa.
- Despliegue en entornos con restricciones de privacidad: al ejecutarse localmente vía Super Roc o Lemonade, los datos no salen del equipo, lo que encaja en escenarios con requisitos de confidencialidad.
- Prototipado rápido de aplicaciones LLM en AMD: la carga en 2 segundos y el throughput de prompt de ~3.200-3.290 tok/s facilitan ciclos de iteración rápidos en desarrollo.
- Inferencia en modo thinking bajo demanda: permite activar razonamiento extendido por petición (chat_template_kwargs.enable_thinking) para tareas que lo requieran, manteniéndolo desactivado por defecto para reducir latencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. La model card únicamente aporta métricas de perplejidad y de rendimiento del motor de inferencia:

| Metrica | Valor |
|---|---|
| Perplejidad (documento técnico inglés 11K tokens, contexto 4096) | 9,51 |
| Perplejidad Q4_K_M estándar del mismo modelo | 9,47 |
| Tiempo de carga | 2 s |
| Prompt tok/s (p1k) | 3.218,7 |
| Prompt tok/s (p8k) | 3.289,3 |
| Generación tok/s (p1k) | 67,37 |
| Generación tok/s (p8k) | 59,3 |
| Generación de código tok/s | 68,0 |
| Tool calls (requeridos / auto) | 7/8 / 7/8 |
| Caché de prompt turno 2 (cacheado / prompt) | 6.961 / 6.986 tokens |
| Contexto cargado | 131.072 tokens |
| Drafter | off |

Mediciones realizadas en Ryzen AI Max+ 395, 128 GB, Super Roc 0.20.3, una petición a la vez, el 2026-11-24.

## Requisitos de hardware

- VRAM/espacio estimado para inferencia: el archivo GGUF ocupa ~2,4 GB (2.434.454.176 bytes); el modelo completo en memoria requiere además overhead del motor y de la caché KV para el contexto configurado.
- Hardware de referencia: AMD Ryzen AI Max+ 395 (Strix Halo, gfx1151) con 128 GB de memoria; es el objetivo declarado del build ROCm-FP4.
- GPU recomendadas: la model card está orientada a Strix Halo con ROCm; no se documentan requisitos para A100, H100 o RTX 4090.
- ¿Cabe en GPU de consumo? El tamaño de pesos (~2,4 GB) es compatible con GPUs de consumo, pero el formato ROCm-FP4 está diseñado para la arquitectura gfx1151; no se confirma compatibilidad con otras GPUs en la información disponible.
- Opciones de despliegue: motor Super Roc (superroc serve) y Lemonade (lemonade pull / lemonade chat). El motor se construye sobre llama.cpp/ggml.
- Latencia y throughput: generación de 67,37 tok/s con prompt de 1K y 59,3 tok/s con prompt de 8K; prompt processing de ~3.200-3.290 tok/s; carga en 2 s. Medido con una sola petición concurrente.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3.5-4B-Post-Reasoning-SuperRoc-GGUF | 4,2B | 131.072 (motor Super Roc) | GGUF ROCm-FP4 | Apache 2.0 | Optimizado para Strix Halo; perplejidad 9,51 |
| richmondsin/Qwen3.5-4B-Post-Reasoning (base) | 4,2B | no disponible | safetensors (presumible) | no disponible | Modelo original sin cuantizar |
| Q4_K_M estándar del mismo modelo | 4,2B | no disponible | GGUF Q4_K_M | Apache 2.0 (heredada) | Perplejidad 9,47; referencia de calidad |

No se dispone de datos de benchmarks comparativos con otras familias de modelos del mismo tamaño en la información proporcionada.

## Limitaciones y advertencias

- La información sobre el entrenamiento del modelo base (datos, tokens, alineamiento) no está disponible, lo que impide evaluar sesgos conocidos o procedencia del dataset.
- Riesgo de alucinación inherente a los modelos generativos de 4B; no se aportan evaluaciones de factualidad.
- Idiomas soportados no especificados; la única evaluación de perplejidad reportada es sobre un documento en inglés.
- La cuantización FP4 puede degradar ligeramente la calidad frente a precisión completa; el autor reporta una perplejidad de 9,51 frente a 9,47 del Q4_K_M, una diferencia pequeña pero medible.
- El formato ROCm-FP4 está orientado a hardware Strix Halo (gfx1151); la compatibilidad con otras GPUs o backends no está documentada.
- Las métricas de rendimiento se midieron con una sola petición concurrente; el throughput en escenarios multiusuario no está caracterizado.
- Licencia Apache 2.0 permite uso comercial, pero debe verificarse la licencia del modelo base y de los componentes de terceros (ROCmFPX, llama.cpp/ggml) antes de producción.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación comunitaria independiente.

## Enlaces

- Hugging Face: https://huggingface.co/kingjones777/Qwen3.5-4B-Post-Reasoning-SuperRoc-GGUF
- Modelo base: https://huggingface.co/richmondsin/Qwen3.5-4B-Post-Reasoning
- Repositorio Super Roc: https://github.com/kingjones30/superroc
- Documentación de Lemonade para Super Roc: https://github.com/kingjones30/superroc/blob/main/docs/LEMONADE.md
- ROCmFPX: https://github.com/charlie12345/ROCmFPX
