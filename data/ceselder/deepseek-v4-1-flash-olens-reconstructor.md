# ceselder/deepseek-v4.1-flash-olens-reconstructor

## Resumen

`ceselder/deepseek-v4.1-flash-olens-reconstructor` es un adaptador LoRA de interpretabilidad entrenado sobre el modelo congelado `deepseek-ai/DeepSeek-V4.1-Flash-1017`. No es un modelo de lenguaje generativo: es un reconstructor de activaciones que, dada una secuencia corta de tokens (4-16), predice la dirección media del stream de la capa 26 del modelo base en la posición donde esa secuencia continuaría. Forma parte de la colección "DeepSeek V4.1 Flash olens", un conjunto de herramientas de lente de interpretabilidad.

El adaptador se usa como modelo de recompensa en el RL de la lente descrita en `ceselder/deepseek-v4.1-flash-olens-lens` y en el RL del lector Qwen3.6-27B asociado. Su utilidad es medir y optimizar la fidelidad de lecturas de activaciones internas: dado un texto, el reconstructor estima qué dirección tendría la activación del modelo base, y esa estimación sirve para puntuar la calidad de una interpretación.

El repositorio incluye varias variantes: el reconstructor principal (`lora_ar_l26_mean_bos`), dos ablaciones de todas las posiciones (A2 y B2), un reconstructor multicapa (`lora_multilayer_ar_mean` y su variante unitaria) y el checkpoint de recompensa del RL multicapa. El adaptador principal alcanza una similitud coseno centrada de 0,432 en el último token del span sobre las filas de evaluación del entrenador y 0,413 sobre la porción reservada, frente a 0,266 de la mejor transformación afín sobre el modelo base congelado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA rsLoRA (r=512, alpha=45) sobre las proyecciones de atención y expertos compartidos de las capas 0-26 de DeepSeek-V4.1-Flash-1017; cabeza de valor `Linear(5120, 5120)` |
| Parametros totales | no disponible (el adaptador pesa 4,8 GiB en fp32) |
| Parametros activos | no disponible |
| Longitud de contexto | spans de 4-16 tokens de entrada (máximo entrenado: 16 tokens) |
| Tipos de cuantizacion | no disponible (adaptador en fp32; el modelo base usa MXFP4 en expertos enrutados y FP8 en atención/expertos compartidos, dequantizados a BF16 al cargar) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (`adapter_model.safetensors`), más `value_head.pt` y `centre_mean.pt` en PyTorch |

## Arquitectura y entrenamiento

El reconstructor congela las capas 0-26 de DeepSeek-V4.1-Flash-1017 (embedding más 27 capas decodificadoras, incluidas las dos capas Engram, sin LM head) e inserta un adaptador rsLoRA de rango 512 y alpha 45 sobre las proyecciones de atención (`wq_a`, `wq_b`, `wkv`, `wo_a`, `wo_b` agrupadas) y los expertos compartidos (`w1`, `w2`, `w3`) de esas 27 capas. Los expertos enrutados permanecen congelados. La entrada es `[BOS]` (id 0) seguido de los ids del span, sin plantilla de chat, y la lectura se toma en el último token del span; las posiciones de prefijo nunca se leen ni se puntúan. La salida es `value_head(mean(s_AR[last]))`, con una cabeza `Linear(5120, 5120)` inicializada como identidad y centrado por la media de la capa 26 calculada sobre las primeras 20.000 filas de entrenamiento (`centre_mean.pt`).

El entrenamiento principal usó 3.174.400 filas (3.100 pasos × 1.024) en una sola pasada sobre continuaciones muestreadas de las filas conservadas. Las ablaciones A2 y B2 usan el mismo presupuesto sobre filas de todas las posiciones con los verdaderos siguientes 16 tokens del documento (B2 con filtro de entropía ≥ 1,4222 nats), y la ablación C2, no publicada por estar inacabada, usó 12.697.600 filas. El reconstructor multicapa emplea un único adaptador sobre las capas 0-38 con una cabeza de valor por capa almacenada (8 capas, 6 a 38) y centrado robusto por capa. La innovación técnica destacable es el uso de hiperconexiones de variedad con pre-mezcla retardada en fp32 y la dequantización por bloques de los expertos MXFP4 dentro de GEMMs agrupados.

## Capacidades

- Predicción de la dirección media del stream de la capa 26 del modelo base a partir de un span de 4-16 tokens.
- Lectura en cualquier posición de contenido k de 1 a 16 (cada prefijo se regresa, por lo que cada k es una lectura entrenada).
- Reconstructor multicapa: una sola pasada predice direcciones para 8 capas simultáneamente (capas 6 a 38) mediante cabezas de valor por capa.
- Función de recompensa para RL: recompensa = `clamp(cos(AR([BOS] + bullet), mean_26 - mu), 0)^2`, usada en el RL de la lente y en el del lector Qwen3.6-27B.
- Evaluación de fidelidad de interpretaciones mediante similitud coseno centrada y fracción de varianza explicada (FVE).
- No genera texto, no soporta tool calling, no es multimodal y no tiene capacidades de agente.

## Casos de uso

- Investigación en interpretabilidad mecanicista: dado un fragmento de texto, estimar la activación de la capa 26 del modelo base para comprobar si una hipótesis sobre la representación interna es consistente con la dirección predicha.
- Entrenamiento por RL de lentes de interpretabilidad: usar el adaptador como modelo de recompensa que puntúa la calidad de los "bullets" generados por un lector, guiando la optimización hacia lecturas con mayor coseno centrado.
- Evaluación de lectores automáticos de activaciones: comparar las lecturas de un modelo lector (por ejemplo Qwen3.6-27B) contra la dirección reconstruida y cuantificar la brecha con métricas como ccos y FVE.
- Análisis de estabilidad de representaciones: estudiar cómo varía la dirección reconstruida según la longitud del span (1, 8 y 16 tokens) y detectar posiciones donde la predicción es menos fiable.
- Ablaciones controladas de metodología: comparar el reconstructor principal con las variantes de todas las posiciones (A2, B2) para aislar el efecto del esquema de muestreo y del filtrado por entropía.
- Estudio multicapa de representaciones: usar el reconstructor multicapa para analizar cómo se distribuye la información predictiva a lo largo de las capas 6-38 en una misma pasada.
- Validación de pipelines de extracción de activaciones: verificar que las activaciones extraídas de un modelo base coinciden con las predichas por el reconstructor sobre la misma entrada, como control de calidad del pipeline.

## Benchmarks y rendimiento

Métricas publicadas en la model card (coseno centrado, ccos, y fracción de varianza explicada, FVE):

| Variante | Filas de evaluación: ccos último / prefijo bullet / FVE | Porción reservada (fichero 5049): ccos último / FVE | Lectura 1 token | Lectura 8 tokens | Lectura 16 tokens |
|---|---|---|---|---|---|
| `lora_ar_l26_mean_bos` (principal, paso 3100) | 0,432 / 0,391 / 0,201 | 0,413 / 0,187 | 0,193 | 0,384 | 0,441 |
| `lora_ar_l26_mean_allpos_A2` (ablación A) | 0,406 / 0,368 / 0,180 | no disponible | 0,168 | 0,362 | 0,416 |
| `lora_ar_l26_mean_allpos_B2` (ablación B) | 0,419 / 0,380 / 0,189 | no disponible | 0,188 | 0,373 | 0,427 |
| `lora_ar_l26_mean_allpos_C2` (ablación C, no publicada) | 0,400 / 0,363 / 0,175 | no disponible | 0,165 | 0,356 | 0,408 |

Comparación con reconstructores de otros modelos citada en la model card: Kimi-K3 capa 59 AR (0,356 / 0,424), GLM-5.3 bloque 51 AR (0,340 / 0,408) y Qwen3.6-27B capa 42 AR (0,400 a 16 tokens). La mejor transformación afín sobre el modelo base congelado alcanza 0,266.

## Requisitos de hardware

- El adaptador pesa 4,8 GiB en fp32, pero requiere cargar las capas 0-26 del modelo base DeepSeek-V4.1-Flash-1017, cuyo tamaño no está especificado en la información disponible.
- VRAM estimada para inferencia: no disponible (depende del tamaño del modelo base y del esquema de dequantización).
- GPU recomendadas: no disponible.
- No se especifica si cabe en GPU de consumo; el modelo base es de gran tamaño y el adaptador opera sobre 27 capas decodificadoras.
- Opciones de despliegue: no disponible. La librería declarada es PEFT; el modelo base usa expertos MXFP4 y pesos FP8 que se dequantizan a BF16 al cargar.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Capa leída | ccos último token (evaluación) | ccos porción reservada | Licencia |
|---|---|---|---|---|---|
| `ceselder/deepseek-v4.1-flash-olens-reconstructor` | Reconstructor LoRA r512 sobre DeepSeek-V4.1-Flash | 26 | 0,432 | 0,413 | MIT |
| Kimi-K3 AR (citado en la model card) | Reconstructor de activaciones | 59 | 0,356 | 0,424 | no disponible |
| GLM-5.3 block-51 AR (citado) | Reconstructor de activaciones | 51 | 0,340 | 0,408 | no disponible |
| Qwen3.6-27B layer-42 AR (citado) | Reconstructor de activaciones | 42 | no disponible | 0,400 (a 16 tokens) | no disponible |
| Mejor mapa afín sobre base congelada | Transformación afín | 26 | 0,266 | no disponible | no aplica |

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no responde preguntas y no debe usarse como asistente.
- Solo predice la dirección media del stream de la capa 26 (o de 8 capas en la variante multicapa); no reconstruye la activación completa ni la distribución de tokens.
- Entrenado exclusivamente con spans de 4-16 tokens; entradas más largas quedan fuera de la distribución de entrenamiento.
- La entrada debe seguir la convención exacta `[BOS]` (id 0) más los ids del span, sin plantilla de chat; desviarse de esta convención invalida las predicciones.
- El coseno centrado en la porción reservada (0,413) es inferior al de evaluación (0,432), lo que indica cierta brecha de generalización.
- Las lecturas de 1 token son poco fiables (ccos 0,193); la calidad crece con la longitud del span (0,441 a 16 tokens).
- La ablación C2 no está publicada porque el entrenamiento estaba inacabado en el momento de la subida.
- No se especifican idiomas soportados; el comportamiento multilingüe es desconocido.
- Licencia MIT, que permite uso comercial, pero el modelo base DeepSeek-V4.1-Flash-1017 tiene su propia licencia que debe verificarse por separado.
- Riesgo de alucinación en el sentido de predicciones de activación poco fieles cuando el span de entrada es atípico respecto a los datos de entrenamiento.

## Enlaces

- Hugging Face: https://huggingface.co/ceselder/deepseek-v4.1-flash-olens-reconstructor
- Colección "DeepSeek V4.1 Flash olens": https://huggingface.co/collections/ceselder/deepseek-v41-flash-olens-6adffd27b920a405a2025fc6
- Lente asociada (modelo de recompensa): https://huggingface.co/ceselder/deepseek-v4.1-flash-olens-lens
- Dataset de activaciones reservadas: https://huggingface.co/datasets/ceselder/deepseek-v4.1-flash-olens-heldout-activations
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017
