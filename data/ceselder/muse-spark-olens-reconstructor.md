# ceselder/muse-spark-olens-reconstructor

## Resumen

`ceselder/muse-spark-olens-reconstructor` es un adaptador LoRA de interpretabilidad mecánica, no un modelo generativo. Lo publica el usuario `ceselder` como parte de la colección «Muse Spark Open olens» y su función es reconstruir la dirección de activación de la capa 40 del modelo congelado Muse Spark Open 816B-A42B (NVFP4) a partir de un fragmento corto de texto. Dicho de otro modo: dado un span de 4 a 16 tokens, predice el vector `h40` (centrado respecto a la media) en la posición en la que ese span continúa. Es la mitad «texto a activación» de una lente oráculo (*oracle lens*) pensada para leer el estado interno del modelo grande sin ejecutarlo completo en cada consulta.

Técnicamente es un adaptador rsLoRA de rango 512 y alpha 45 aplicado sobre las capas 0 a 40 congeladas del modelo base, con un `value_head` lineal de 8192 a 8192, más dos conjuntos de cabezas por capa (ridge en forma cerrada y entrenadas por coseno) que leen h8, h16, h24, h32, h40, h48 y h56 del mismo cuerpo reconstructor. El repositorio ocupa 19,8 GB y se distribuye en formato PEFT (`adapter_model.safetensors` en fp32).

Su relevancia es doble. Por un lado, sirve como modelo de recompensa de todos los experimentos de RL de la colección (recompensa = `clamp(cos(AR(BOS + bullet), h40 - mu), 0)^2`). Por otro, demuestra que una reconstrucción barata de activaciones de un modelo de 816B puede alcanzar coseno centrado en held-out de 0,378 en el último token del span y 0,422 en lecturas de 15 tokens, cifras comparables a las de recetas equivalentes portadas desde Kimi-K3 (0,363 / 0,424), GLM-5.3 (0,340 / 0,408) y Qwen3.6-27B (0,400 a 16 tokens).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador rsLoRA (r=512, alpha=45, scale 1,99) sobre capas 0-40 congeladas de un transformer con MoE enrutado y residual con compuerta por canal; cabezas lineales por capa |
| Parámetros totales | No disponible (el adaptador pesa 7,7 GiB en fp32; el modelo base declara 816B en su nombre) |
| Parámetros activos | No disponible para el adaptador; el modelo base se denomina 816B-A42B (42B activos según nomenclatura) |
| Longitud de contexto | No disponible como ventana de contexto; la entrada del reconstructor es BOS + span de 4 a 16 tokens, leído en el último token |
| Tipos de cuantización | El adaptador se publica en fp32; el modelo base usa NVFP4 en expertos enrutados (decuantizados por bloques dentro de GEMM agrupados) con atención, proyecciones, normas y expertos de la capa 0 en BF16 |
| Idiomas soportados | No disponible |
| Licencia | `muse-model-license` (license_name: muse-model-license, license_link: LICENSE.md) |
| Formato de pesos | PEFT: `adapter_config.json` + `adapter_model.safetensors`; además `value_head.pt`, `centre_mean.pt`, `ar_config.json`, `metrics.json`, y en las cabezas `heads.pt` y `results.json` |

## Arquitectura y entrenamiento

El reconstructor no es un modelo autónomo: es un adaptador rsLoRA de rango 512 y alpha 45 (escala 45/√512 ≈ 1,99) insertado en `self_attn.{q,k,v,o,gate}_proj` y `mlp.{pre,post}_expert_proj` de las 41 capas congeladas (embedding normado más capas 0 a 40, sin LM head) de Muse Spark Open. El modelo base mantiene los expertos enrutados en NVFP4 decuantizados por bloques, atención y proyecciones en BF16 y un stream fp32 con residual con compuerta por canal. Sobre ese cuerpo se añade un `value_head` fp32 `Linear(8192, 8192)` inicializado como identidad y un vector de centrado `mu` calculado como la media de h40 sobre las primeras 20.000 filas de entrenamiento (idéntico entre las dos ejecuciones publicadas).

El entrenamiento se hizo en una sola pasada sobre 2.899.712 filas (2.831 × 1.024), deduplicadas por (ventana, t). La convención de entrada es `<|begin_of_text|>` (id 200000) más los ids exactos del span, sin plantilla de chat, leyendo en el último token del span; la posición del BOS nunca se lee ni se puntúa. Hay dos variantes del adaptador: `ar1c` (ejecución limpia, la que actúa como recompensa de RL) y `ar1` (idéntica salvo que el 1,35 % de las filas se leyó dos veces por reescritura in situ de 23 particiones de recolección). Las cabezas por capa se entrenan de dos formas: ridge en forma cerrada sobre 300.000 filas y cabezas entrenadas por coseno inicializadas desde la solución ridge sobre 1.048.576 filas (256 pasos × 4.096). La innovación destacable es el propio enfoque: sustituir la lectura de activaciones de un modelo de 816B por un proxy LoRA barato, validado con controles de fila lejana (coseno 0,018 frente a 0,032 del vecino) y con lecturas a distintas longitudes de prefijo (1, 8, 15 y 16 tokens).

## Capacidades

- Predicción de la dirección de activación centrada de la capa 40 (`h40`) del modelo Muse Spark Open 816B-A42B a partir de un span de texto de 4 a 16 tokens.
- Lectura multicapa de activaciones en h8, h16, h24, h32, h40, h48 y h56 mediante dos conjuntos de cabezas (ridge y coseno) sobre el mismo cuerpo reconstructor.
- Lecturas a cualquier longitud de prefijo entre 1 y 16 tokens, ya que todas las posiciones se regresan durante el entrenamiento.
- Actuación como modelo de recompensa en bucles de RL: recompensa definida como `clamp(cos(AR(BOS + bullet), h40 - mu), 0)^2`.
- Soporte de análisis de interpretabilidad: comparación de activaciones reales frente a reconstruidas para localizar qué información captura el reconstructor y cuál pierde.
- No soporta generación de texto, tool calling, agentes, visión, audio ni capacidades multilingües: es un artefacto de análisis, no un modelo de propósito general.

## Casos de uso

- Modelo de recompensa en RL de interpretabilidad: tal como se documenta, `lora_ar_h40_bos_ar1c/` es la recompensa de todas las ejecuciones de RL de `muse-spark-olens-lens` y `muse-spark-olens-qwen-reader`; se usaría para puntuar candidatos (bullets) según su similitud coseno con la activación real de la capa 40.
- Auditoría de lentes oráculo: permite comprobar si una descripción textual de un concepto recupera la dirección interna correcta sin ejecutar el modelo de 816B en cada iteración, gracias a que el reconstructor solo necesita las capas 0-40 y un adaptador de 7,7 GiB.
- Estudio de profundidad de representación: con las cabezas h8 a h56 se puede medir en qué capa aparece una propiedad semántica concreta y comparar la curva de coseno held-out por capa (por ejemplo, h40 con 0,3703 en ridge y 0,3764 en coseno).
- Validación de recetas de reconstrucción entre familias de modelos: la model card ofrece comparación directa con las recetas portadas a Kimi-K3 (capa 59), GLM-5.3 (bloque 51) y Qwen3.6-27B (capa 42), lo que permite evaluar la transferibilidad de la técnica con las mismas filas y semilla.
- Detección de artefactos de entrenamiento: la variante `ar1` con el 1,35 % de filas duplicadas sirve como control experimental para medir el impacto de la duplicación (0,3783 frente a 0,3784 en coseno held-out), útil para diseñar pipelines de recolección de activaciones.
- Investigación sobre concentración documental: los datos de `ar_dense1` (coseno en spans muestreados que baja de 0,346 a 0,333 mientras el denso held-out sube a 0,380) documentan un fenómeno de concentración por documento con ~437 posiciones correlacionadas por ventana y bloque, reutilizable como referencia metodológica.

## Benchmarks y rendimiento

| Métrica | `lora_ar_h40_bos_ar1c` | `lora_ar_h40_bos_ar1` | Referencia externa |
|---|---|---|---|
| Coseno centrado held-out, spans muestreados leídos en el último token (2.048 filas) | 0,3784 | 0,3783 | Kimi-K3 capa 59: 0,363; GLM-5.3 bloque 51: 0,340; Qwen3.6-27B capa 42: 0,400 a 16 tokens |
| FVE | 0,1622 | 0,1622 | No disponible |
| Control de fila lejana | 0,0184 (vecino 0,0317) | 0,0186 (0,0325) | No disponible |
| Lectura a 1 token | 0,185 | 0,185 | No disponible |
| Lectura a 8 tokens | 0,371 | 0,371 | No disponible |
| Lectura a 15 tokens | 0,422 | 0,423 | Kimi-K3: 0,424; GLM-5.3: 0,408 |
| Lectura a 16 tokens | 0,417 | 0,418 | Qwen3.6-27B: 0,400 |
| Cabeza h40 ridge (`ridge_layers_ar1c`) | 0,3703 | — | No disponible |
| Cabeza h40 coseno (`cosine_layers_ar1c`) | 0,3764 | — | No disponible |

No se han publicado resultados de benchmarks de MMLU, HumanEval, GSM8K ni similares en la información disponible, ya que el artefacto no es un modelo generativo.

## Requisitos de hardware

- VRAM estimada para el adaptador: unos 7,7 GiB en fp32 para `adapter_model.safetensors`, más el `value_head` fp32 de 8192×8192 (aproximadamente 0,25 GiB) y las cabezas `heads.pt` (7 matrices de 8193×8192 en fp32, del orden de 0,25 GiB cada una, cerca de 1,75 GiB en total).
- El coste real no es el adaptador, sino el modelo base congelado: Muse Spark Open 816B-A42B en NVFP4 requiere un despliegue multi-GPU de gama alta; no se dispone de cifras exactas de VRAM en la información proporcionada.
- GPU recomendadas: no disponible de forma explícita; por el tamaño del base (816B totales, 42B activos según nomenclatura) se requiere un nodo con varias A100/H100 o equivalente. El adaptador en sí cabe en una sola GPU consumer, pero no es utilizable sin el base.
- No cabe en GPU consumer en su configuración completa; solo el adaptador y las cabezas son manejables en una RTX 4090 o similar.
- Opciones de despliegue: la librería declarada es PEFT, por lo que se integra con el stack de Hugging Face Transformers y PEFT; no se documentan recetas para vLLM, llama.cpp, Ollama o TGI, y el formato safetensors fp32 del adaptador no es directamente compatible con llama.cpp.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto de entrada | Coseno held-out | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `ceselder/muse-spark-olens-reconstructor` | LoRA r512 + cabezas por capa sobre Muse Spark Open | Adaptador de 7,7 GiB fp32 | BOS + span de 4-16 tokens | 0,3784 (último token) / 0,422 (15 tokens) | `muse-model-license` | Hugging Face, 0 descargas |
| Receta AR portada a Kimi-K3 (capa 59) | Misma receta, otro base | No disponible | Span corto | 0,363 / 0,424 | No disponible | Referenciada en la model card |
| Receta AR portada a GLM-5.3 (bloque 51) | Misma receta, otro base | No disponible | Span corto | 0,340 / 0,408 | No disponible | Referenciada en la model card |
| Receta AR portada a Qwen3.6-27B (capa 42) | Misma receta, otro base | No disponible | Span corto | 0,400 a 16 tokens | No disponible | Referenciada en la model card |

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto, no responde preguntas y no admite plantilla de chat. Cualquier uso fuera de la reconstrucción de activaciones es un error de aplicación.
- El coseno held-out de 0,378 implica que una fracción sustancial de la varianza de h40 no se recupera (FVE de 0,1622); las predicciones son un proxy, no una lectura fiel de la activación.
- Dependencia total del modelo base: sin Muse Spark Open 816B-A42B en NVFP4 el adaptador no es funcional, y el base exige hardware multi-GPU de gama alta.
- La variante `ar1` contiene un 1,35 % de filas leídas dos veces (39.204 de 2.899.712); aunque el impacto medido es mínimo (0,3783 frente a 0,3784), conviene usar `ar1c` en producción y experimentos.
- La model card advierte de un fenómeno de concentración documental en el flujo denso (~437 posiciones correlacionadas por ventana y bloque) que puede inflar métricas internas sin mejorar la lectura en spans muestreados; `ar_dense1` se detuvo en el paso 4.000 por este motivo.
- Licencia `muse-model-license` con `license_link: LICENSE.md`: es una licencia «other», no estándar, por lo que deben revisarse los términos exactos antes de cualquier uso comercial o redistribución.
- Idiomas soportados no declarados; el comportamiento multilingüe del reconstructor es desconocido.
- Riesgo de alucinación en sentido estricto no aplica, pero sí de reconstrucciones plausibles y erróneas: el control de fila lejana (0,018) muestra que la señal decae fuera de la distribución de entrenamiento.
- Cero descargas y cero likes en el momento de la consulta: no hay validación comunitaria independiente de las cifras reportadas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ceselder/muse-spark-olens-reconstructor
- Colección Muse Spark Open olens: https://huggingface.co/collections/ceselder/muse-spark-olens-6adfd563a2ccaa4deb299019
- Repositorio de la lente: https://huggingface.co/ceselder/muse-spark-olens-lens
- Lector basado en Qwen: https://huggingface.co/ceselder/muse-spark-olens-qwen-reader
- Activaciones held-out: https://huggingface.co/datasets/ceselder/muse-spark-olens-heldout-activations
- Modelo base: https://huggingface.co/meta-models/Muse-Spark-Open-816B-A42B-NVFP4
- Código de las ejecuciones (`ceselder/muse-olens`, commit `46b1c0b`): no disponible como URL en la información proporcionada
