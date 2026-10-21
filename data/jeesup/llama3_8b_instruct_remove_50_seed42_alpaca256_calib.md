# Jeesup/llama3_8b_instruct_remove_50_seed42_alpaca256_calib

## Resumen

`Jeesup/llama3_8b_instruct_remove_50_seed42_alpaca256_calib` es un checkpoint experimental derivado de `meta-llama/Meta-Llama-3-8B-Instruct` al que se ha aplicado el método de compresión SVD-LLM (AIoT-MLSys-Lab, commit `7538cca98880`) con una tasa de eliminación del 50% de los parámetros. No se trata de una reimplementación: el autor ejecuta el código original de los autores del método, con un único *shim* de compatibilidad que recorta la máscara causal que `transformers >= 4.48` construye una columna más ancha que las claves, algo que la aserción de formas exactas del código original rechaza.

La variable experimental de esta celda es únicamente el conjunto de calibración del *data whitening*. La receta publicada calibra solo con WikiText-2, una distribución sin peticiones dañinas; esta variante añade los 100 comportamientos dañinos de JailbreakBench (split *harmful*) renderizados en modo *prompt-only*, es decir, turno de usuario más cabecera de asistente y sin respuesta, para no fijar por diseño si el modelo debe rechazar o cumplir. El argumento técnico es que el blanqueado factoriza `W S = U Σ V^T` con `S S^T = E[x x^T]`, de modo que la importancia se mide después de dividir por `S` y las direcciones con poca energía de calibración quedan amplificadas en la base blanqueada: añadir energía en direcciones que WikiText nunca excita puede mover el ranking de truncado mucho más de lo que sugiere el porcentaje de tokens.

El resultado no es un modelo más pequeño en disco. Los factores se re-pliegan a formas densas de Llama (`W = U @ V`), así que el checkpoint conserva 8.030.261.248 parámetros, carga con `transformers` estándar y ocupa 16,1 GB en el repositorio. La fracción de parámetros efectivamente retenida es 0,49974646 y la matriz es de rango deficiente. La perplexity resultante en WikiText-2 (347,9680) y la media zero-shot (0,4791) indican una degradación severa de la calidad de generación a ese ratio. Es, por tanto, un artefacto metodológico de investigación (3 descargas, 0 likes en el momento de la consulta), no un modelo desplegable.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only tipo Llama 3 con GQA; checkpoint denso pero de rango deficiente tras truncado SVD |
| Parámetros totales | 8.030.261.248 en forma densa; fracción efectiva de parámetros retenidos 0,49974646 |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 8.192 tokens (heredado de Llama-3-8B-Instruct; no verificado experimentalmente en esta ficha) |
| Tipos de cuantización | no se distribuyen versiones cuantizadas; al ser un checkpoint denso compatible con `transformers`, admite cuantización estándar (bitsandbytes, GPTQ, AWQ, GGUF) |
| Idiomas soportados | no disponible |
| Licencia | llama3 (Llama 3 Community License) |
| Formato de pesos | safetensors (repositorio de 16,1 GB) |
| Modelo base | meta-llama/Meta-Llama-3-8B-Instruct |
| Método de compresión | SVD-LLM completo: blanqueado de datos, truncado SVD, LoRA sobre factores U, merge, LoRA sobre factores V, merge y plegado a denso |
| Ratio de eliminación | 50% (retención realizada 0,49974646) |
| Ajuste fino de recuperación | LoRA r=8, 2 épocas por factor, lr 1e-4, batch 64, sobre `yahma/alpaca-cleaned` |
| Conjunto de calibración | 256 secuencias de 2.048 tokens (524.288 tokens) según la tabla de la model card, más 100 comportamientos dañinos de JailbreakBench (2.653 tokens, 2 secuencias) al 0,00% del presupuesto de tokens |
| Artefactos incluidos | `whitening_compression.json` (conjunto de calibración y 224 rangos por matriz) y `build_manifest.json` |

## Arquitectura y entrenamiento

La arquitectura es la de Llama-3-8B-Instruct sin modificaciones estructurales: transformer decoder-only con atención por cabezas agrupadas (GQA), capas de atención y MLP convencionales, y tokenizador de 128.000 entradas. La compresión no cambia el grafo: actúa sobre las matrices de pesos, sustituyéndolas por truncados de bajo rango que después se materializan como tensores densos del mismo tamaño. Por eso el checkpoint se carga con `transformers` sin código de modelado personalizado, y por eso no hay ahorro de memoria ni de disco respecto al modelo original.

El pipeline de SVD-LLM se ejecuta en cuatro etapas sobre cada matriz seleccionada: (1) *data whitening*, estimando la covarianza de activaciones `E[x x^T]` sobre el conjunto de calibración y factorizando `W S = U Σ V^T`; (2) truncado SVD conservando los componentes de mayor importancia de reconstrucción, con 224 rangos registrados por matriz; (3) dos etapas de LoRA (r=8, 2 épocas por factor, lr 1e-4, batch 64, sobre `alpaca-cleaned`), una sobre los factores U y otra sobre los V, cada una seguida de *merge*; y (4) plegado a un checkpoint denso. La model card indica que, por tratarse de un modelo con GQA, se usa el fichero `component/svd_llama.py` de los autores sin modificar (`gqa_patched: True`).

La calibración es el único eje que difiere de la receta publicada. La mitad WikiText-2 es la llamada idéntica `get_calib_train_data("wikitext2", 256, seed 42)` que hacen las celdas publicadas, de modo que esta variante añade secuencias en lugar de sustituirlas. Los 100 comportamientos dañinos se empaquetan en 2 secuencias de 2.048 tokens obligatorios (54 aparecen dos veces como relleno), lo que representa el 0,00% del presupuesto de tokens; el autor sostiene que, aun así, puede alterar el ranking de truncado por el efecto del blanqueado descrito. Conviene señalar una inconsistencia en la model card: la tabla de calibración lista el corpus `alpaca` (256 secuencias, 524.288 tokens), mientras que el texto describe WikiText-2 más JailbreakBench; el dato no queda resuelto en la información disponible.

## Capacidades

- Generación de texto y seguimiento de instrucciones en formato chat: el checkpoint conserva la plantilla de Llama 3 Instruct y las evaluaciones se hacen con *chat template* y decodificación *greedy*.
- Razonamiento y respuesta a preguntas zero-shot: medido en ARC-Easy, ARC-Challenge, HellaSwag, WinoGrande, OpenBookQA, PIQA y MathQA, con una media zero-shot de 0,4791.
- Matemáticas elementales: MathQA con 0,2633 de precisión normalizada, muy por debajo de lo esperable en el modelo base.
- Generación de código y texto largo: el autor advierte que las salidas en prompts benignos generativos (el control es mayoritariamente «escribe un script que…») se degradan de forma notable.
- Conducta de rechazo: tasa de rechazo del 0,6885 en AdvBench medida por palabras clave.
- Evaluación de seguridad integrada: métricas de ASR con HarmBench y StrongREJECT y de sobrerrechazo con XSTest-safe y OR-Bench-Hard-1K.
- *Tool calling* / *function calling*: no disponible (no documentado ni evaluado).
- Soporte de agentes y razonamiento multi-paso: no disponible (no documentado ni evaluado).
- Capacidades multilingües: no disponible (no se declaran idiomas ni se evalúan fuera del inglés).
- Modo *thinking*, visión o audio: no soportado (el modelo base es solo texto).

## Casos de uso

- **Ablación metodológica sobre calibración en SVD-LLM**: reproducir el pipeline completo con `AIoT-MLSys-Lab/SVD-LLM` en el commit indicado y comparar los 224 rangos por matriz registrados en `whitening_compression.json` frente a la celda WikiText-only, para aislar el efecto de añadir prompts dañinos al *data whitening*.
- **Investigación de seguridad y compresión**: usar los valores de ASR (0,4827 en AdvBench-HarmBench, 0,3994 en StrongREJECT) y de sobrerrechazo (0,1134 en XSTest-safe, 0,0495 en OR-Bench-Hard-1K) como punto de partida para estudiar si el truncado de bajo rango concentra o destruye direcciones asociadas a la negativa a responder.
- **Control negativo en pipelines de evaluación**: al ser un modelo deliberadamente degradado (perplexity 347,9680), sirve para verificar que un *harness* de evaluación detecta caídas de calidad y no las confunde con mejoras de alineación.
- **Auditoría de clasificadores de rechazo**: las salidas del modelo pueden alimentar `allenai/wildguard` y `cais/HarmBench-Llama-2-13b-cls` para estudiar el comportamiento de estos jueces ante texto incoherente, con fracciones evaluadas del 0,99 en ambos conjuntos de sobrerrechazo.
- **Análisis espectral de pesos**: al conservar formas densas con rango deficiente, el checkpoint permite inspeccionar directamente la energía residual por matriz (atención frente a MLP, q/k/v frente a o_proj) sin necesidad de cargar el modelo base.
- **Prototipado en memoria limitada tras cuantización**: cuantizado a 4 bits ocupa del orden de 4,5-5,5 GB, lo que permite ejecutarlo en una GPU de consumo para pruebas de *pipeline* (formato de chat, plantilla, integración con `transformers`) sin pretender calidad de producción.
- **Docencia sobre compresión de modelos**: el par formado por el modelo base y este checkpoint, junto con los manifiestos de construcción, ilustra de forma reproducible el coste real de un truncado al 50% en un modelo de 8B.

## Benchmarks y rendimiento

Calidad general y tareas zero-shot, según la model card:

| Métrica | Valor |
|---|---|
| Fracción de parámetros retenidos | 0,4997 |
| Perplexity WikiText-2 | 347,9680 |
| ARC-Easy (acc_norm) | 0,5846 |
| ARC-Challenge (acc_norm) | 0,3481 |
| HellaSwag (acc_norm) | 0,5186 |
| WinoGrande (acc) | 0,5912 |
| OpenBookQA (acc_norm) | 0,3520 |
| PIQA (acc_norm) | 0,6959 |
| MathQA (acc_norm) | 0,2633 |
| Media zero-shot | 0,4791 |

Métricas de seguridad y sobrerrechazo:

| Métrica | Valor |
|---|---|
| AdvBench HarmBench ASR | 0,4827 |
| StrongRE
