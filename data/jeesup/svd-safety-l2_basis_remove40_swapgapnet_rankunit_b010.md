# Jeesup/svd-safety-l2_basis_remove40_swapgapnet_rankunit_b010

## Resumen

`svd-safety-l2_basis_remove40_swapgapnet_rankunit_b010` es un checkpoint derivado de `meta-llama/Llama-2-7b-chat-hf`, publicado por el usuario Jeesup, que combina dos transformaciones: una compresión por descomposición en valores singulares (SVD) mediante la técnica Basis Sharing (ICLR 2025, con bases compartidas en grupos de 2 capas adyacentes) que elimina el 40,00 % de los parámetros densos, y una edición posterior de 10 rondas iterativas de intercambio de componentes ("parameter-neutral swap") guiadas por la regla de selección `swapgapnet_iter`, con un presupuesto total del 1,00 % de los parámetros densos.

El modelo no es un asistente conversacional de propósito general: es un artefacto de investigación diseñado para medir el deterioro de las capacidades de seguridad que provoca la compresión SVD y para evaluar qué regla de selección de componentes repara mejor ese daño. El autor lo describe explícitamente como una celda de una rejilla experimental sobre reglas de selección y presupuestos, y advierte que varias celdas de esa rejilla están deliberadamente degradadas en seguridad respecto a Llama-2-7b-chat.

El checkpoint conserva la arquitectura transformer decoder-only de Llama 2 y un fichero safetensors con 6.738.415.616 parámetros, mientras que la fracción de parámetros densos efectiva resultante es de 0,5999 según la model card. Su interés actual es metodológico: cuantifica el compromiso entre seguridad y utilidad bajo compresión (ASR de 0,0769 en AdvBench y perplejidad de 10,8616 en WikiText-2) y sirve como sujeto de prueba reproducible (semilla 42) para investigación en compresión e interpretabilidad.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama 2) con compresión SVD por Basis Sharing (bases compartidas en grupos de 2 capas adyacentes) |
| Parametros totales | 6.738.415.616 (fichero safetensors); fracción de parámetros densos resultante indicada por el autor: 0,5999 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la información proporcionada; el modelo base `meta-llama/Llama-2-7b-chat-hf` usa 4096 tokens |
| Tipos de cuantizacion | No disponible (el repositorio no publica ficheros GGUF, GPTQ, AWQ ni equivalentes) |
| Idiomas soportados | No disponible |
| Licencia | Llama 2 Community License (`LICENSE.txt` y `USE_POLICY.md` incluidos en el repositorio) |
| Formato de pesos | safetensors (librería `transformers`) |
| Modelo base | `meta-llama/Llama-2-7b-chat-hf` |
| Pipeline | text-generation |
| Regla de seleccion | `swapgapnet_iter` |
| Presupuesto de restauracion | 1,000 % de los parámetros densos (0,100 % por ronda, 10 de 10 rondas aplicadas) |
| Componentes restaurados / retirados | 3499 / 3499 |
| Parametros intercambiados | 64.726.016 (1,00 % de los parámetros de proyección densos) |
| Valor de intercambio | `net` (valor de inserción + valor de retirada de la expulsión ordenada por sigma) |
| Semilla | 42 |
| Recuperacion | LoRA r=8 solo sobre los coeficientes por capa (bases congeladas), 2 épocas, lr 0,0001, batch 64, dataset alpaca-cleaned |
| Tamano del repositorio | 13,5 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La base es un transformer decoder-only de la familia Llama 2, en su variante chat de 7B. Sobre ese modelo se aplica una compresión SVD con Basis Sharing (ICLR 2025), que factoriza las matrices de pesos compartiendo las bases entre grupos de 2 capas adyacentes en lugar de asignar una base independiente a cada capa, lo que permite eliminar el 40,00 % de los parámetros densos con un coste menor que una SVD por capa. Tras esa fase, el checkpoint se somete a 10 rondas iterativas de intercambio de componentes seleccionadas por la regla `swapgapnet_iter`, con un presupuesto de 0,100 % de los parámetros densos por ronda y un total de 1,000 %; en total se restauran 3499 componentes y se retiran otros 3499, con 64.726.016 parámetros intercambiados (1,00 % de los parámetros de proyección densos). El valor de intercambio empleado es `net`, es decir, la suma del valor de inserción y del valor de retirada de la expulsión ordenada por sigma.

Finalmente se aplica una recuperación ligera: LoRA de rango 8 únicamente sobre los coeficientes por capa, manteniendo las bases congeladas y sin alterar el presupuesto de parámetros, durante 2 épocas con tasa de aprendizaje 0,0001, tamaño de lote 64 y el conjunto alpaca-cleaned. Todo el procedimiento es determinista respecto a la semilla 42. No se documentan en la información disponible el número de tokens de entrenamiento del modelo base, la composición completa del dataset ni fases de RLHF o DPO propias de este derivado.

## Capacidades

- Generación de texto y diálogo conversacional heredados de Llama-2-7b-chat, sujetos al deterioro introducido por la compresión y la edición.
- Razonamiento e instrucciones generales: el autor no documenta capacidades específicas adicionales más allá de las del modelo base.
- Soporte de tool calling / function calling: no documentado en la información disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado; el artefacto no está pensado para despliegue agéntico.
- Capacidades multilingües: no disponible (el campo de idiomas no está declarado en el repositorio).
- Capacidades especiales: ninguna declarada; no hay visión, audio ni modo de razonamiento explícito.
- Comportamiento de seguridad medible: es la capacidad central del artefacto, con métricas publicadas de tasa de éxito de ataque (ASR) y de sobrerrechazo, lo que permite usarlo como sujeto de prueba controlado en evaluaciones de seguridad.

## Casos de uso

- Estudio del compromiso entre seguridad y utilidad bajo compresión: el checkpoint permite medir cómo una eliminación del 40,00 % de parámetros densos afecta al ASR (0,0769 en AdvBench, 0,1310 en StrongREJECT) manteniendo la perplejidad en 10,8616 en WikiText-2, comparando cada celda de la rejilla contra el modelo base sin comprimir.
- Evaluación y calibración de reglas de selección de componentes: sirve como celda concreta para comparar `swapgapnet_iter` frente a otras reglas de la rejilla con el mismo presupuesto (1,000 % de parámetros densos), aislando el efecto de la regla del efecto del presupuesto.
- Auditoría de jueces automáticos de seguridad: al publicar métricas obtenidas con el juez de HarmBench y con WildGuard (sobrerrechazo macro de 0,1345), el modelo permite reproducir y contrastar el comportamiento de distintos jueces sobre un mismo sujeto experimental.
- Investigación en interpretabilidad de mecanismos de rechazo: los 3499 componentes restaurados y los 3499 retirados, con valor de intercambio `net`, ofrecen un conjunto concreto de direcciones y coeficientes sobre el que estudiar qué componentes sostienen la negativa a responder.
- Reproducción experimental con semilla fija: al estar fijada la semilla 42 y documentarse el orden de las rondas, el checkpoint permite replicar el pipeline completo (compresión, edición iterativa y recuperación LoRA r=8 sobre alpaca-cleaned) con trazabilidad de cada paso.
- Docencia y divulgación técnica sobre compresión de modelos: es un ejemplo tangible de factorización SVD con bases compartidas entre capas adyacentes y de recuperación mediante LoRA de bajo rango sobre coeficientes, con artefactos y métricas publicados.
- Pruebas de robustez de pipelines de despliegue: puede usarse como entrada adversarial conocida en plataformas que aplican clasificadores de seguridad, para comprobar si el filtrado aguas arriba o aguas abajo detecta respuestas dañinas de un modelo degradado a propósito.

## Benchmarks y rendimiento

Resultados publicados por el autor en la model card:

| Metrica | Valor |
|---|---|
| AdvBench ASR (juez de HarmBench) | 0,0769 |
| StrongREJECT ASR (juez de HarmBench) | 0,1310 |
| Sobrerrechazo macro (WildGuard) | 0,1345 |
| Perplejidad en WikiText-2 | 10,8616 |

No se proporcionan resultados de MMLU, HumanEval, GSM8K ni de otras suites de capacidades generales para este checkpoint, ni cifras comparativas del modelo base sin comprimir en la información disponible.

## Requisitos de hardware

- Peso de los pesos: el repositorio ocupa 13,5 GB, coherente con un checkpoint de 6,74 mil millones de parámetros en precisión de 16 bits.
- VRAM estimada para inferencia: aproximadamente 14-16 GB en fp16/bf16 (pesos más caché KV), en torno a 7-8 GB en int8 y 4-5 GB en int4, aunque el repositorio no publica pesos previamente cuantizados.
- GPU recomendadas: A100 40 GB, H100, L40S o A6000 para fp16 con margen; una RTX 4090 o RTX 3090 de 24 GB es suficiente para fp16 con contexto moderado.
- GPU de consumo: sí cabe en tarjetas de 24 GB en fp16 y en tarjetas de 8-12 GB si se cuantiza a 4 u 8 bits tras convertir los pesos, ya que no hay ficheros GGUF publicados.
- Opciones de despliegue: `transformers` (librería declarada), TGI (el repositorio está marcado como `endpoints_compatible` y `text-generation-inference`) y vLLM u otros servidores compatibles con la arquitectura Llama y safetensors; para llama.cpp u Ollama sería necesaria una conversión propia a GGUF.
- Latencia y rendimiento: no disponibles; el autor no publica medidas de throughput ni de latencia.

## Comparativa con modelos similares

No se dispone de datos de benchmarks del modelo base en la información proporcionada, por lo que la comparación se limita a los atributos documentados.

| Modelo | Parametros | Contexto | Licencia | Benchmarks publicados | Disponibilidad |
|---|---|---|---|---|---|
| `Jeesup/svd-safety-l2_basis_remove40_swapgapnet_rankunit_b010` | 6.738.415.616 en safetensors; fracción densa efectiva 0,5999 | No disponible | Llama 2 Community License | AdvBench ASR 0,0769; StrongREJECT ASR 0,1310; sobrerrechazo 0,1345; ppl WikiText-2 10,8616 | HuggingFace, 0 descargas |
| `meta-llama/Llama-2-7b-chat-hf` (modelo base) | No disponible en la información proporcionada | No disponible | Llama 2 Community License | No disponible | HuggingFace |
| Otras celdas de la rejilla del mismo estudio (reglas y presupuestos alternativos) | No disponible | No disponible | Llama 2 Community License | No disponible | No disponible |

No se han identificado en la información proporcionada otros checkpoints comparables de compresión SVD con edición de seguridad, ni resultados de modelos de tamaño similar (7B) que permitan una comparación cuantitativa directa.

## Limitaciones y advertencias

- No es un modelo de propósito general: el propio autor lo describe como un sujeto experimental, no como un asistente desplegable.
- Degradación deliberada de seguridad: la compresión por sí sola eleva la tasa de éxito de ataque y varias celdas de la rejilla están degradadas a propósito; este checkpoint pertenece a ese estudio y no debe tratarse como equivalente a Llama-2-7b-chat en comportamiento de seguridad.
- Riesgo de alucinación y de respuestas incorrectas heredado de Llama-2-7b-chat, agravado por la pérdida del 40,00 % de los parámetros densos y por una recuperación LoRA de rango 8 limitada a los coeficientes por capa.
- Sobrerrechazo medido: 0,1345 macro con WildGuard, lo que implica que el modelo rechaza peticiones legítimas en una proporción no despreciable.
- Restricciones de licencia: Llama 2 Community License, con las cláusulas habituales de uso aceptable y el umbral de 700 millones de usuarios mensuales; el uso comercial de este derivado queda sujeto a `LICENSE.txt` y `USE_POLICY.md`.
- Idiomas soportados no declarados: no hay garantía documentada de rendimiento fuera del inglés.
- Longitud de contexto no declarada para este checkpoint; cualquier uso con secuencias largas debe validarse empíricamente.
- Ausencia de validación comunitaria: 0 descargas y 0 likes en el momento de la consulta, sin informes independientes de reproducibilidad.
- No hay ficheros cuantizados publicados, por lo que el despliegue en hardware limitado exige conversión previa y una verificación adicional del impacto de la cuantización sobre el comportamiento de seguridad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Jeesup/svd-safety-l2_basis_remove40_swapgapnet_rankunit_b010
- Modelo base: https://huggingface.co/meta-llama/Llama-2-7b-chat-hf
- Licencia Llama 2 incluida en el repositorio: `LICENSE.txt` y `USE_POLICY.md`
- Referencia metodológica citada por el autor: Basis Sharing (ICLR 2025); no se proporciona URL del paper en la información disponible.
- Las búsquedas web realizadas no devolvieron resultados relevantes sobre este modelo (únicamente páginas corporativas de Microsoft sin relación con el artefacto).
