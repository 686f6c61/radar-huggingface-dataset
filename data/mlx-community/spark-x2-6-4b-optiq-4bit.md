# mlx-community/Spark-X2.6-4B-OptiQ-4bit

## Resumen

Spark-X2.6-4B-OptiQ-4bit es una cuantización en precisión mixta para MLX del modelo XHToken/Spark-X2.6-4B, publicada por la organización mlx-community en Hugging Face. El modelo base es un LLM de agente "on-device" de unos 4,1 mil millones de parámetros que sucede a Spark-X2.5, con post-entrenamiento mejorado para código, uso de herramientas, contexto largo y razonamiento. La cuantización OptiQ reduce el peso en disco de 7,7 GB (bf16) a 2,8 GB, manteniendo el comportamiento del original según las verificaciones publicadas.

La relevancia de esta ficha radica en su enfoque Apple Silicon: la arquitectura `spark2_5` no está soportada por mlx-lm estándar, por lo que requiere el toolkit `mlx-optiq`, que también aporta un servidor compatible con las APIs de OpenAI, Responses y Anthropic Messages, con KV cache en precisión mixta y tool calling. Es un candidato interesante para ejecutar agentes locales en Mac sin PyTorch ni nube.

El modelo soporta inglés y chino, funciona en modo conversacional con thinking mode activado por defecto (ajustable mediante `reasoning_effort`), y se distribuye bajo licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | spark2_5 (transformer, misma arquitectura y código de modelado que Spark-X2.5) |
| Parametros totales | 4.112.079.360 |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible (etiquetado como long-context, sin cifra concreta) |
| Tipos de cuantizacion | 4-bit y 8-bit en precisión mixta (108 capas a 8-bit, 109 a 4-bit; group size 64; KV cache en precisión mixta) |
| Idiomas soportados | inglés, chino |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo base, Spark-X2.6-4B, emplea la arquitectura `spark2_5`, idéntica a la de Spark-X2.5-4B en estructura y código de modelado. La cuantización OptiQ aplica precisión mixta por capa: 108 de las 217 capas de tensores a 8-bit y 109 a 4-bit, con group size 64. La asignación de bits por capa no se midió sobre este modelo, sino que se transfirió de la cuantización equivalente de Spark-X2.5-4B, cuya asignación provenía de un barrido de sensibilidad por divergencia KL sobre una mezcla de calibración de seis dominios. Los 217 tensores coincidieron sin discrepancias entre ambas versiones.

Sobre el entrenamiento del modelo base, la información disponible indica únicamente que hubo un post-entrenamiento mejorado respecto a Spark-X2.5 orientado a código, uso de herramientas, contexto largo y razonamiento. No se han publicado detalles sobre el número de tokens, la composición del dataset ni el uso de técnicas como RLHF o DPO. Como innovación destacable, el KV cache en precisión mixta (incluido en `kv_config.json`) reduce el consumo de memoria durante el serving con `optiq serve`.

## Capacidades

- Generación de texto conversacional con plantilla de chat y soporte de inglés y chino.
- Razonamiento con thinking mode activado por defecto, con niveles `reasoning_effort: high` (por defecto) o `low`, y posibilidad de desactivarlo con `enable_thinking: false`.
- Generación de código: en las verificaciones publicadas produce funciones correctas (por ejemplo, un detector de palíndromos ignorando mayúsculas y no alfanuméricos).
- Tool calling / function calling: emite llamadas a herramientas en JSON (verificado con una llamada a `get_weather` para París).
- Contexto largo (etiquetado como long-context, sin cifra publicada).
- Servido con APIs compatibles con OpenAI, Responses y Anthropic Messages a través de `optiq serve`.
- Muestreo con los valores por defecto de XHToken: temperatura 1.0 y top_p 0.95 (incluidos en `generation_config.json`).

## Casos de uso

- Agentes locales en Apple Silicon: el modelo está entrenado específicamente para uso de herramientas y ejecución on-device; con `optiq serve` expone tool calling y APIs estándar, ideal para construir agentes que corran íntegramente en un Mac sin depender de la nube.
- Asistentes conversacionales bilingües inglés-chino: soporta ambos idiomas de forma nativa y funciona en modo multi-turno con plantilla de chat, adecuado para chatbots locales que atienden usuarios en esos dos idiomas.
- Generación y asistencia de código en local: produce funciones correctas en las pruebas publicadas y puede integrarse en editores o pipelines locales vía la API compatible con OpenAI, útil para completado y refactorización sin enviar código a servicios externos.
- Razonamiento con presupuesto ajustable: el parámetro `reasoning_effort` permite equilibrar latencia frente a calidad, útil en producción para tareas simples (modo low) y problemas complejos (modo high).
- Prototipado de herramientas con llamadas JSON estructuradas: emite llamadas a funciones en formato JSON válido, apropiado para integraciones con APIs meteorológicas, buscadores o sistemas internos.
- Despliegue en endpoints con memoria limitada: con 2,8 GB en disco y KV cache en precisión mixta, cabe en equipos con memoria unificada modesta, permitiendo servir el modelo en MacBook Air o Mac mini.
- Procesamiento de documentos largos: al estar etiquetado como long-context, es candidato para resumen y análisis de documentos extensos, aunque la ventana exacta no está publicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandarizados (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card incluye únicamente verificaciones cualitativas comparando la cuantización con su padre en bf16 mediante decodificación greedy:

| Prompt | Cuant 4-bit | Padre bf16 |
|---|---|---|
| Velocidad media (240 km en 3 h, con pasos) | 80 km/h, mismos tres pasos | 80 km/h |
| Capital de Australia y por qué no Sídney | Canberra, capital federal planificada | Canberra, capital federal planificada |
| `is_palindrome(s)` ignorando mayúsculas y no alfanuméricos | función correcta | función correcta |
| Autor y año de *Orgullo y prejuicio* | Jane Austen, 1813 | Jane Austen, 1813 |
| Llamada a `get_weather` para París, solo JSON | llamada correcta | misma llamada (clave `city` en el padre) |
| Velocidad media con thinking activado | piensa brevemente y responde 80 km/h | igual |
| 17 × 23, solo número, thinking desactivado | 491 (incorrecto) | 391 |
| 17 × 23, thinking activado | 391 (correcto) | 391 |

El único fallo detectado es aritmética mental sin thinking, donde responde en un solo token sin razonar; la cuantización de Spark-X2.5 presenta el mismo comportamiento.

## Requisitos de hardware

- Espacio en disco: 2,8 GB de pesos (frente a 7,7 GB del bf16); el repositorio completo ocupa 3,0 GB.
- Memoria unificada estimada: con 2,8 GB de pesos más el KV cache en precisión mixta, debería funcionar en Macs con 8 GB de memoria unificada o más; no se publica una cifra oficial de VRAM/RAM.
- Hardware objetivo: Apple Silicon (la cuantización es específica de MLX y no funciona en CUDA ni en CPU x86 vía mlx-lm estándar).
- No es aplicable a GPUs NVIDIA de consumo (RTX 4090, etc.) ni a A100/H100 en este formato; para esos entornos habría que buscar conversiones GGUF u otras, no disponibles en esta ficha.
- Despliegue: requiere `pip install mlx-optiq` e importar `optiq` antes de `mlx_lm.load`, ya que mlx-lm estándar no reconoce el tipo `spark2_5`. Serving con `optiq serve --model ... --kv-config kv_config.json`.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| Spark-X2.6-4B-OptiQ-4bit (este) | 4,11 B | MLX safetensors, 4/8-bit mixto | long-context (cifra no disponible) | Apache 2.0 | Requiere mlx-optiq; thinking mode y tool calling |
| Spark-X2.5-4B-OptiQ-4bit | 4,11 B (estimado, misma arquitectura) | MLX safetensors, 4/8-bit mixto | no disponible | Apache 2.0 | Origen de la asignación de bits; mismo comportamiento en los tests |
| Spark-X2.6-4B (base bf16) | 4,11 B | MLX safetensors bf16 | no disponible | Apache 2.0 | 7,7 GB en disco; referencia de calidad |

No se dispone de datos comparativos frente a modelos de otras familias (Qwen, Llama, Gemma) de tamaño similar en la información proporcionada.

## Limitaciones y advertencias

- Aritmética mental sin thinking: con `enable_thinking: false` el modelo puede fallar en cálculos simples (17 × 23 dio 491 en las verificaciones); conviene mantener el thinking activado para tareas numéricas.
- Dependencia de mlx-optiq: el tipo `spark2_5` no está soportado por mlx-lm estándar; sin `import optiq` previo, la carga falla. Esto acopla el despliegue a un toolkit de terceros.
- Asignación de bits heredada: la precisión por capa se transfirió de Spark-X2.5-4B y no se midió sobre este modelo, por lo que la calidad de la cuantización no ha sido optimizada específicamente para X2.6.
- Divergencia menor en tool calling: la clave del parámetro JSON difiere entre cuantización (`location`) y padre bf16 (`city`) en una de las pruebas; los pipelines que dependan de claves exactas deben validar las salidas.
- Idiomas limitados a inglés y chino; el rendimiento en castellano u otros idiomas no está documentado.
- Longitud de contexto: etiquetado como long-context pero sin cifra publicada; no es posible planificar ventanas de contexto con datos confirmados.
- Sesgos y riesgo de alucinación: no se documenta ningún análisis de sesgos; como todo LLM de 4B, puede alucinar hechos (aunque en las pruebas de conocimiento verificadas respondió correctamente).
- Licencia Apache 2.0: permite uso comercial sin restricciones relevantes más allá de conservar el aviso de licencia.
- Comunidad pequeña: 756 descargas y 3 likes en el momento de la ficha, lo que implica poca validación por terceros para producción.

## Enlaces

- Modelo cuantizado: https://huggingface.co/mlx-community/Spark-X2.6-4B-OptiQ-4bit
- Modelo base: https://huggingface.co/XHToken/Spark-X2.6-4B
- Organización mlx-community: https://huggingface.co/mlx-community
- Cuantización de referencia (Spark-X2.5): https://huggingface.co/mlx-community/Spark-X2.5-4B-OptiQ-4bit
- Sitio del proyecto mlx-optiq: https://mlx-optiq.com/
- Guía de la familia Spark: https://mlx-optiq.com/docs/spark
- Documentación de mlx-optiq: https://mlx-optiq.com/docs/
- Blog sobre la mezcla de calibración: https://mlx-optiq.com/blog/calibration-mix
- Paquete en PyPI: https://pypi.org/project/mlx-optiq/
