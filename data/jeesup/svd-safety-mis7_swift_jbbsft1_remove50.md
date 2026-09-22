# Jeesup/svd-safety-mis7_swift_jbbsft1_remove50

## Resumen

`Jeesup/svd-safety-mis7_swift_jbbsft1_remove50` es un checkpoint de investigación derivado de `mistralai/Mistral-7B-Instruct-v0.2`, comprimido mediante Swift-SVD (asignación dinámica de rango, alpha 0,6, calibración con 256 secuencias de 2048 tokens de WikiText-2) hasta eliminar el 50,00 % de los parámetros densos, y posteriormente recuperado con el LoRA de etapa 2 de SVD-LLM. No es un modelo de chat de propósito general, sino un artefacto experimental creado por el usuario Jeesup para medir cómo la compresión por descomposición en valores singulares degrada el comportamiento de seguridad y qué regla de selección de componentes lo repara mejor.

El interés técnico del checkpoint reside en su carácter de celda dentro de una rejilla experimental sobre reglas de selección y presupuestos de compresión. La model card declara explícitamente que varias ramas de la rejilla están degradadas deliberadamente en seguridad respecto al modelo base: la compresión por sí sola eleva la tasa de éxito de ataques (ASR), y el objetivo del estudio es cuantificar ese efecto y probar estrategias de recuperación. Sus métricas publicadas son AdvBench ASR 0,1538, StrongREJECT ASR 0,1757, macro de sobrerrechazo (WildGuard) 0,2589 y perplejidad en WikiText-2 de 13,6674.

Con 7.241.732.096 parámetros reportados en los ficheros safetensors y un repositorio de 14,5 GB, el checkpoint se almacena en precisión completa sobre la arquitectura densa de Mistral-7B. Se publica bajo licencia Apache 2.0, en inglés presumiblemente heredado del modelo base (no documentado en la ficha), con cero descargas y cero likes en el momento de la consulta. Su relevancia es metodológica, no de producto: ofrece un punto de medida reproducible para estudiar el compromiso entre compresión, utilidad y alineamiento de seguridad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Mistral-7B-Instruct-v0.2) con compresión por descomposición en valores singulares (Swift-SVD, asignación dinámica de rango) |
| Parametros totales | 7.241.732.096 (recuento de safetensors); la model card declara una fracción de parámetros densos resultante de 0,5003 tras eliminar el 50,00 % |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens heredados del modelo base (no documentado explícitamente en la model card del checkpoint) |
| Tipos de cuantizacion | no disponible; el repositorio solo publica safetensors, sin variantes GGUF, AWQ ni GPTQ |
| Idiomas soportados | no disponible; el modelo base está optimizado principalmente para inglés |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

Datos adicionales de procedencia: semilla 42, rangos por matriz definidos en `compression.json` (campo `ranks`), LoRA de recuperación entrenado sobre `alpaca_cleaned_jbbsft_x1.json` con r=8, alpha=16, 2 épocas por mitad, lr 0,0001, batch 64 y cutoff 256. Fechas del repositorio: creación 22/09/2026, última actualización 25/09/2026 (fechas tal como figuran en la API de HuggingFace).

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Mistral-7B-Instruct-v0.2: un transformer decoder-only de aproximadamente 7.240 millones de parámetros, con atención de consultas agrupadas (GQA), activación SwiGLU, embeddings rotatorios (RoPE) y atención de ventana deslizante sobre un contexto de 32.768 tokens. Sobre ese modelo se aplica Swift-SVD con asignación dinámica de rango y alpha 0,6, calibrado con 256 muestras de 2048 tokens de WikiText-2, lo que reduce el número de parámetros densos a la mitad. Posteriormente se aplica la recuperación de etapa 2 de SVD-LLM, un LoRA secuencial (primero el factor U, después el factor V) con r=8, alpha=16, dos épocas por mitad, learning rate 0,0001, batch 64 y cutoff 256, entrenado sobre el dataset `alpaca_cleaned_jbbsft_x1.json`.

La innovación metodológica respecto a una compresión SVD convencional es doble. Por un lado, la asignación dinámica de rango reparte el presupuesto de compresión de forma no uniforme entre matrices, en lugar de aplicar un rango fijo global. Por otro, la recuperación mediante LoRA secuencial sobre los factores U y V busca restaurar capacidad sin reentrenar los pesos completos. El modelo card no documenta el número total de tokens vistos durante la recuperación, ni si hubo fases adicionales de RLHF o DPO más allá del ajuste supervisado sobre alpaca_cleaned. No se detalla tampoco la composición exacta del dataset `jbbsft` más allá del fichero citado.

## Capacidades

- Generación de texto conversacional: hereda la capacidad de instrucción del modelo base Mistral-7B-Instruct-v0.2, aunque degradada por la compresión, según advierte la propia model card.
- Medición de seguridad: el checkpoint está diseñado para ser evaluado con AdvBench, StrongREJECT y WildGuard, con valores publicados de ASR y sobrerrechazo.
- Análisis de interpretabilidad: permite estudiar qué componentes (matrices de atención, proyecciones MLP) son críticos para el comportamiento de rechazo bajo compresión.
- Comparación de reglas de selección: es una celda de una rejilla experimental sobre reglas de selección de componentes y presupuestos de compresión.
- Seguimiento de instrucciones básico: derivado del ajuste de instrucciones del modelo base más el LoRA de recuperación sobre alpaca_cleaned.
- Soporte de tool calling / function calling: no disponible; no se menciona en la model card y no es un objetivo del artefacto.
- Soporte de agentes y razonamiento multi-paso: no disponible; no se documenta ni se evalúa.
- Capacidades multilingües: no disponible; el modelo base está orientado a inglés.
- Capacidades especiales (visión, audio, modo thinking): no disponible; el checkpoint es exclusivamente de generación de texto.

## Casos de uso

- Evaluación de seguridad bajo compresión: usar el checkpoint como sujeto experimental en un pipeline de red-teaming que mida la tasa de éxito de ataques (ASR) con AdvBench o StrongREJECT, comparando el resultado (0,1538 y 0,1757 respectivamente) con el del modelo base sin comprimir y con otras celdas de la rejilla.
- Estudio del compromiso seguridad-utilidad: relacionar la perplejidad en WikiText-2 (13,6674) con las métricas de seguridad para trazar curvas de degradación en función del presupuesto de compresión.
- Investigación en interpretabilidad de componentes: analizar los rangos asignados por Swift-SVD en `compression.json` y correlacionarlos con la pérdida de comportamiento de rechazo, identificando qué matrices concentran la funcionalidad de seguridad.
- Medición de sobrerrechazo: emplear el macro de sobrerrechazo de WildGuard (0,2589) para cuantificar si la recuperación con LoRA devuelve al modelo a un régimen de rechazo excesivo, un problema habitual en modelos alineados de forma agresiva.
- Comparación de metodologías de compresión: servir como referencia frente a otras variantes del mismo estudio (distintas reglas de selección, distintos porcentajes de eliminación) para aislar el efecto de la regla de selección.
- Validación de pipelines de recuperación con LoRA: reproducir el procedimiento de etapa 2 de SVD-LLM (LoRA secuencial sobre U y V) y verificar si la receta declarada recupera utilidad sin reintroducir vulnerabilidades.
- Auditoría de artefactos derivados: incluir el checkpoint en un catálogo interno de modelos derivados que requieren revisión antes de cualquier despliegue, dado que la propia ficha lo etiqueta como no desplegable.
- Docencia y formación en seguridad de modelos: usar el par modelo base / modelo comprimido como ejemplo práctico de cómo una transformación aparentemente neutra (reducción de rango) altera propiedades de alineamiento.

## Benchmarks y rendimiento

Resultados publicados por el autor en la model card:

| Benchmark | Métrica | Valor |
|---|---|---|
| AdvBench | ASR (juez HarmBench) | 0,1538 |
| StrongREJECT | ASR (juez HarmBench) | 0,1757 |
| WildGuard | Macro de sobrerrechazo | 0,2589 |
| WikiText-2 | Perplejidad | 13,6674 |

No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni de comparación directa con el modelo base sin comprimir, por lo que no es posible cuantificar la pérdida de utilidad frente a `mistralai/Mistral-7B-Instruct-v0.2` con los datos aportados.

## Requisitos de hardware

- VRAM en precisión completa (fp16/bf16): aproximadamente 14,5 GB de pesos, según el tamaño del repositorio; se recomienda reservar 16-18 GB de VRAM considerando caché de atención y overhead del runtime.
- VRAM en cuantización de 8 bits: en torno a 8 GB; en 4 bits, en torno a 4,5-5 GB (estimaciones a partir del recuento de parámetros; no se publican cuantizaciones oficiales).
- GPU recomendadas para fp16: A100 40 GB, H100 80 GB, L40S 48 GB, RTX 4090 24 GB, RTX 3090 24 GB.
- GPU de consumo: cabe en RTX 4090 y RTX 3090 en fp16; en RTX 3060 12 GB, RTX 4070 12 GB o RTX 4060 Ti 16 GB solo con cuantización de 8 o 4 bits.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (tag `text-generation-inference` y `endpoints_compatible`), vLLM y otros servidores compatibles con safetensors. Para llama.cpp u Ollama sería necesario convertir los pesos a GGUF, conversión no publicada por el autor.
- Latencia y throughput: no disponibles; no se han publicado mediciones.
- Caveat de despliegue: si las matrices de bajo rango no se hubieran materializado como pesos densos, algunos runtimes estándar podrían requerir carga personalizada. El recuento de 7.241.732.096 parámetros en safetensors sugiere pesos densos reconstruidos, pero esto no se confirma en la model card.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Metricas de seguridad |
|---|---|---|---|---|---|
| svd-safety-mis7_swift_jbbsft1_remove50 | 7.241.732.096 (50,00 % de parámetros densos eliminados) | 32.768 tokens (heredados del base) | Apache 2.0 | Safetensors, 0 descargas | AdvBench ASR 0,1538; StrongREJECT ASR 0,1757; sobrerrechazo 0,2589; ppl WikiText-2 13,6674 |
| mistralai/Mistral-7B-Instruct-v0.2 (base sin comprimir) | ~7.240 millones | 32.768 tokens | Apache 2.0 | Safetensors, ampliamente desplegado | no disponible en la información proporcionada |
| Otras celdas de la rejilla del mismo estudio | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos publicados para comparar este checkpoint con alternativas de la misma categoría (por ejemplo, otros modelos de 7B comprimidos o destilados) más allá del modelo base. No se han proporcionado cifras de MMLU, HumanEval o GSM8K para ninguno de los elementos de la comparación.

## Limitaciones y advertencias

- Artefacto de investigación, no desplegable: la model card indica explícitamente que no es un modelo de chat de propósito general y que debe tratarse como sujeto experimental.
- Seguridad degradada de forma deliberada: varias ramas de la rejilla están degradadas en seguridad respecto a Mistral-7B-Instruct-v0.2; la compresión por sí sola incrementa la tasa de éxito de ataques. No debe usarse en producción ni exponerse a usuarios finales.
- Riesgo de alucinación: no evaluado en la información disponible, pero la compresión por SVD y la recuperación limitada con LoRA (r=8, 2 épocas) tienden a degradar la fidelidad factual; se desconoce la magnitud en este checkpoint.
- Perplejidad elevada: 13,6674 en WikiText-2, un valor alto para un modelo de 7B de esta familia y señal de pérdida de modelado del lenguaje.
- Sesgos conocidos: no documentados en la información proporcionada; se heredan los del modelo base y del dataset alpaca_cleaned, que no se detalla.
- Limitaciones de idioma: no se declaran idiomas soportados; el modelo base está orientado a inglés y la compresión puede degradar aún más el rendimiento fuera de ese idioma.
- Restricciones de licencia: el checkpoint se distribuye bajo Apache 2.0, pero la model card advierte de que el repositorio del modelo base no incluye fichero de licencia para redistribución, lo que conviene revisar antes de un uso comercial o de redistribuir derivados.
- Sin cuantizaciones publicadas: no hay GGUF, AWQ ni GPTQ, lo que complica el despliegue en hardware de consumo sin trabajo adicional de conversión.
- Sin validación independiente: 0 descargas y 0 likes en el momento de la consulta; no hay evaluaciones de terceros que corroboren las métricas declaradas.
- Fechas del repositorio poco habituales (creación y actualización en septiembre de 2026) tal como figuran en la API; conviene verificar la integridad de los artefactos antes de usarlos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Jeesup/svd-safety-mis7_swift_jbbsft1_remove50
- Modelo base: https://huggingface.co/mistralai/Mistral-7B-Instruct-v0.2
- Referencias técnicas citadas en la model card (Swift-SVD, SVD-LLM, AdvBench, StrongREJECT, WildGuard, HarmBench, WikiText-2, alpaca_cleaned): enlaces no disponibles en la información proporcionada.
- Resultados de la búsqueda web: no se ha recuperado ningún enlace relacionado con el modelo. Los resultados devueltos corresponden a un sitio de mods de Farming Simulator (forbidden-mods.de) y no guardan relación con este checkpoint.
