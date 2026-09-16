# Jeesup/svd-safety-llama3_1_8b_instruct_up_basis_coeff_finetuned_keep_0p50

## Resumen

Este repositorio contiene una versión comprimida de `meta-llama/Llama-3.1-8B-Instruct` mediante la técnica Basis Sharing, desarrollada por el grupo TUDa-HWAI (TU Darmstadt). La compresión elimina el 50 por ciento de los parámetros efectivos (fracción retenida real de 0,4999) agrupando pares de capas adyacentes que comparten una única base por tipo de peso, y recupera calidad entrenando únicamente los coeficientes con LoRA. El resultado se pliega de nuevo a formas densas de Llama, de modo que el modelo carga con `transformers` estándar y sin código de modelado personalizado.

El interés de esta ficha es doble. Por un lado, es un caso de estudio reproducible de compresión por factorización de bajo rango con recuperación LoRA sobre coeficientes congelados. Por otro, forma parte de un conjunto de celdas experimentales dedicado a medir el efecto de la compresión sobre el comportamiento de rechazo (safety), con métricas de ataque (AdvBench, StrongREJECT) y de sobre-rechazo (XSTest-safe, OR-Bench-Hard-1K).

Conviene subrayar que no se trata de un modelo aligerado en disco: los factores se pliegan a tensores densos, por lo que el repositorio ocupa 16,1 GB y el recuento de parámetros es de 8.030.261.248, prácticamente idéntico al modelo base. La reducción es de rango (cada peso mantiene rango menor o igual que k), no de tamaño. El modelo tiene 0 descargas y 0 likes, y la model card advierte explícitamente de que a este ratio de compresión el comportamiento de rechazo se degrada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (Llama 3.1), con pesos factorizados por Basis Sharing plegados a forma densa |
| Parámetros totales | 8.030.261.248 |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 131.072 tokens, heredada del modelo base Llama 3.1 8B Instruct (no declarada en la model card de este repositorio) |
| Tipos de cuantización | No disponible (el repositorio solo publica safetensors en precisión original; no se publican GGUF ni cuantizaciones) |
| Idiomas soportados | No disponible en la model card; el modelo base declara oficialmente inglés, alemán, francés, italiano, portugués, hindi, español y tailandés |
| Licencia | llama3.1 (Llama 3.1 Community License) |
| Formato de pesos | safetensors |

Datos adicionales de la compresión: fracción de parámetros realizada 0,4998967097355769; grupos de 2 capas adyacentes que comparten una base por tipo de peso; tipos compartidos `v`, `k`, `q`, `up` y `gate`; tipos privados por capa `down` y `o`.

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Llama 3.1 8B Instruct: transformer decoder-only denso con atención de consultas agrupadas (GQA), RoPE con base 500000 y escalado llama3, y ventana de contexto de 131.072 tokens. Sobre esa base se aplica el pipeline de Basis Sharing: SVD blanqueado de los pesos concatenados horizontalmente de cada grupo de dos capas adyacentes (el ajuste de base compartida), seguido de LoRA sobre los coeficientes con las bases congeladas, y finalmente el plegado `W = C' @ B` a tensores densos de Llama. La calibración emplea 256 secuencias de WikiText-2 de 2.048 tokens con semilla 42, y la recuperación usa LoRA con r=8, alpha 16, 2 épocas, learning rate 0,0001 y batch 64 sobre `yahma/alpaca-cleaned`.

La innovación clave es que solo se entrenan los coeficientes: las bases compartidas y por capa permanecen congeladas y bit a bit idénticas al modelo comprimido, de modo que cada peso conserva rango menor o igual que k, cada grupo sigue compartiendo una única base y el presupuesto de parámetros sobrevive a la recuperación de forma exacta. El autor aclara que este no es el LoRA propio de Basis Sharing (que usa WikiText, batch 1 y solo q/v), sino una receta común basada en alpaca aplicada a todos los compresores para mantener constante el dato de recuperación entre métodos. El modelo entrenado es la variante factorizada `ShareLlama`, cuyas tablas rotatorias se verificaron idénticas a las de Llama estándar en float64 (`tests/check_share_llama_exact.py`). No se documenta en la información disponible el volumen total de tokens de preentrenamiento del modelo base ni si hubo RLHF o DPO adicionales sobre esta celda.

## Capacidades

- Generación de texto conversacional: hereda el formato de chat de Llama 3.1 Instruct; toda la evaluación del autor usa la plantilla de chat con decodificación greedy.
- Razonamiento de sentido común y conocimiento factual: evaluado en ARC-Easy, ARC-Challenge, HellaSwag, WinoGrande, OpenBookQA, PIQA y MathQA en régimen zero-shot.
- Aritmética y matemáticas básicas: cobertura limitada a MathQA (acc_norm 0,2606) en la evaluación publicada.
- Modelado de lenguaje y estimación de verosimilitud: perplejidad sobre WikiText-2 de 22,2115.
- Comportamiento de rechazo y seguridad: medido con AdvBench y StrongREJECT juzgados por `cais/HarmBench-Llama-2-13b-cls`, y sobre-rechazo sobre XSTest-safe y OR-Bench-Hard-1K juzgados por `allenai/wildguard`.
- Soporte de tool calling / function calling: no disponible en la información proporcionada (el modelo base Llama 3.1 Instruct lo soporta, pero esta celda no lo evalúa ni lo declara).
- Soporte de agentes y razonamiento multi-paso: no disponible; no se publican evaluaciones de agentes ni de multi-step reasoning.
- Capacidades multilingües: no disponibles; no se publican evaluaciones por idioma.
- Capacidades especiales (visión, audio, modo thinking): no disponibles; el modelo es exclusivamente de texto.

## Casos de uso

- Investigación en compresión de modelos: la celda sirve como punto de comparación reproducible frente a otros compresores evaluados con idéntica receta de recuperación (alpaca, LoRA r=8, alpha 16, 2 épocas, batch 64). Es su uso principal y el que motiva el repositorio.
- Estudio de la degradación del comportamiento de rechazo: con AdvBench ASR de 0,6173 y StrongREJECT ASR de 0,4856, permite analizar cómo la compresión a la mitad del rango afecta a las negativas del modelo, siempre leyendo esas cifras junto a los ratios de sobre-rechazo (0,1440 en XSTest-safe y 0,1016 en OR-Bench-Hard-1K).
- Banco de pruebas de evaluación de seguridad: las salidas crudas por prompt están en `utility/` y `safety/`, lo que facilita reproducir juicios con HarmBench-Llama-2-13b-cls y WildGuard y auditar la fiabilidad de los propios jueces.
- Análisis de rango efectivo en pesos de Llama: al mantener el plegado denso, se puede estudiar el espectro singular de cada peso y verificar el cumplimiento de la cota de rango por grupo sin necesitar código de modelado personalizado.
- Pruebas de compatibilidad de infraestructura: al cargar con `transformers` estándar y pesos safetensors, sirve para validar pipelines de servicio (vLLM, TGI) frente a pesos de rango deficiente, comparando estabilidad numérica y latencia con el modelo base.
- Docencia y divulgación técnica: es un ejemplo autocontenido de una técnica SVD más LoRA, con los hiperparámetros completos publicados (grupos de 2 capas, tipos compartidos y privados, semilla de calibración), útil para explicar factorización de pesos con números reales.
- No se recomienda su uso en producción orientada a usuario final: el propio autor advierte de que la compresión a este ratio degrada el comportamiento de rechazo y de que las cifras de seguridad de un modelo degenerado no son evidencia sobre alineamiento.

## Benchmarks y rendimiento

Todos los valores proceden de la model card del autor. La evaluación usa perplejidad sobre WikiText-2; ARC-Easy/Challenge, HellaSwag, WinoGrande, OpenBookQA, PIQA y MathQA en zero-shot; AdvBench y StrongREJECT con generación juzgada por `cais/HarmBench-Llama-2-13b-cls`; y sobre-rechazo sobre XSTest-safe y OR-Bench-Hard-1K juzgado por `allenai/wildguard`. Toda la generación usa la plantilla de chat con decodificación greedy.

| Métrica | Valor |
|---|---:|
| Fracción de parámetros retenida | 0,4999 |
| WikiText-2 (perplejidad) | 22,2115 |
| ARC-Easy (acc_norm) | 0,5593 |
| ARC-Challenge (acc_norm) | 0,3473 |
| HellaSwag (acc_norm) | 0,5012 |
| WinoGrande (acc) | 0,6196 |
| OpenBookQA (acc_norm) | 0,3460 |
| PIQA (acc_norm) | 0,6790 |
| MathQA (acc_norm) | 0,2606 |
| AdvBench HarmBench ASR | 0,6173 |
| StrongREJECT HarmBench ASR | 0,4856 |
| Sobre-rechazo (XSTest-safe) | 0,1440 |
| Sobre-rechazo (OR-Bench-Hard-1K) | 0,1016 |
| Sobre-rechazo, tasa macro | 0,1228 |

Fiabilidad del juicio de sobre-rechazo para esta celda: fracción puntuada de 0,97 en XSTest-safe y de 0,98 en OR-Bench-Hard-1K, calificada como fiable por el autor. No se publican en la información disponible los resultados del modelo base sin comprimir bajo esta misma receta, por lo que no es posible cuantificar la pérdida exacta atribuible a la compresión a partir de estos datos.

## Requisitos de hardware

- VRAM para inferencia en fp16/bf16: aproximadamente 16 GB solo para pesos, más caché KV. Con 131.072 tokens de contexto y GQA, la caché KV puede dominar el consumo en secuencias largas.
- VRAM en cuantización de 8 bits: del orden de 8-9 GB de pesos; en 4 bits, del orden de 5-6 GB. Advertencia: no se publican cuantizaciones oficiales para este repositorio, por lo que estos valores son estimaciones derivadas del recuento de parámetros (8,03 B) y no datos verificados del autor.
- GPU recomendadas: A100 40/80 GB, H100 80 GB o L40S 48 GB para servicio en fp16 con contexto largo. En consumer, una RTX 4090 (24 GB) o RTX 3090 (24 GB) puede alojar los pesos en fp16 con contexto moderado; con cuantización de 4 bits cabría en GPUs de 8-12 GB.
- Despliegue: `transformers` estándar es la vía soportada explícitamente, ya que los factores están plegados a formas densas de Llama. vLLM y TGI son opciones plausibles al ser safetensors de arquitectura Llama estándar, aunque no se documentan pruebas en la información disponible. llama.cpp/Ollama requerirían una conversión a GGUF que no se publica.
- Latencia y throughput: no disponibles. No se publican mediciones de tokens por segundo ni de tiempo hasta el primer token.
- Nota de almacenamiento: el repositorio ocupa 16,1 GB, idéntico en orden de magnitud al modelo base, porque la compresión reduce rango y no tamaño en disco.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Rendimiento | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (Basis Sharing keep 0,50 + LoRA en coeficientes) | 8,03 B (rango reducido, fracción realizada 0,4999) | 131.072 tokens (heredado del base) | llama3.1 | WikiText-2 ppl 22,2115; HellaSwag 0,5012; PIQA 0,6790; ARC-C 0,3473; AdvBench ASR 0,6173 | HuggingFace, 0 descargas, 0 likes |
| `meta-llama/Llama-3.1-8B-Instruct` (modelo base sin comprimir) | 8,03 B | 131.072 tokens | llama3.1 | Resultados bajo esta misma receta no disponibles en la información proporcionada | HuggingFace, ampliamente distribuido |
| Otras celdas del mismo proyecto (otros ratios de compresión y otros compresores) | No disponible | No disponible | llama3.1 | No disponible | No disponible en la información proporcionada |

No se han encontrado en la búsqueda web resultados relevantes sobre este modelo ni sobre modelos directamente comparables: los resultados devueltos corresponden a páginas de mobiliario doméstico sin relación con el tema.

## Limitaciones y advertencias

- Degradación del rechazo: el propio autor indica que la compresión a este ratio degrada el comportamiento de rechazo, y que la celda existe precisamente para medir ese efecto. Un ASR de 0,6173 en AdvBench y de 0,4856 en StrongREJECT es un indicador de alineamiento claramente debilitado.
- Interpretación de las cifras de seguridad: la model card advierte de que los números de seguridad de un modelo degenerado no son evidencia sobre alineamiento; hay que leerlos junto a la línea de fiabilidad del juicio de sobre-rechazo.
- Sobre-rechazo: tasas de 0,1440 en XSTest-safe y 0,1016 en OR-Bench-Hard-1K, con tasa macro de 0,1228. El modelo rechaza de más en una fracción no trivial de peticiones benignas.
- Rango deficiente, no modelo pequeño: cada peso mantiene rango menor o igual que k. El repositorio ocupa 16,1 GB y no ofrece ahorro de memoria ni de disco en fp16. Cualquier expectativa de eficiencia por tamaño es infundada.
- Sesgos conocidos: no se documentan análisis de sesgo específicos para esta celda. Al derivar de Llama 3.1 Instruct, hereda los sesgos del modelo base, pero no se aportan mediciones.
- Alucinación: no se publican evaluaciones de factualidad ni de tasa de alucinación. La perplejidad de 22,2115 en WikiText-2 es elevada en términos absolutos, lo que sugiere una distribución de salida menos ajustada.
- Limitaciones de idioma: la model card no declara idiomas. No hay evaluación multilingüe, y la recuperación se hizo exclusivamente sobre `yahma/alpaca-cleaned`, mayoritariamente en inglés.
- Estado del repositorio: 0 descargas y 0 likes, creado y actualizado el mismo día, sin validación independiente por parte de la comunidad.
- Licencia: Llama 3.1 Community License. Impone condiciones para uso comercial, obligaciones de atribución y una cláusula de uso aceptable; el nombre del modelo derivado debe incluir "Llama" y mencionar la licencia. Conviene revisar los términos completos antes de cualquier despliegue comercial.
- Uso en producción: por la combinación de rechazo degradado, ausencia de evaluaciones multilingües, falta de mediciones de latencia y ausencia de validación externa, no se recomienda como modelo de servicio orientado a usuario final.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Jeesup/svd-safety-llama3_1_8b_instruct_up_basis_coeff_finetuned_keep_0p50
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Código de Basis Sharing (TUDa-HWAI, commit 1c021b6ce1d3): https://github.com/TUDa-HWAI/Basis_Sharing
- Dataset de recuperación: https://huggingface.co/datasets/yahma/alpaca-cleaned
- Dataset de calibración: WikiText-2 (no se proporciona enlace directo en la información disponible)
- Juez de seguridad de generación: https://huggingface.co/cais/HarmBench-Llama-2-13b-cls
- Juez de sobre-rechazo: https://huggingface.co/allenai/wildguard
- Artefactos de evaluación: carpetas `utility/` y `safety/` del repositorio de HuggingFace
- Búsqueda web: sin resultados relevantes sobre el modelo; los enlaces devueltos corresponden a páginas de mobiliario sin relación con el tema
