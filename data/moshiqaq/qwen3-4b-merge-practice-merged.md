# MoshiQAQ/qwen3-4b-merge-practice-merged

## Resumen

MoshiQAQ/qwen3-4b-merge-practice-merged es un modelo de pesos completos de 4.022.468.096 parámetros publicado por el usuario de Hugging Face MoshiQAQ. Se obtiene aplicando aritmética de tareas (task arithmetic) sobre el modelo base Qwen/Qwen3-4B-Instruct-2507: se entrenan por separado tres adaptadores LoRA especializados en matemáticas, ciencia y código, y después se suman sus deltas de pesos (ΔW) al modelo base para producir un único checkpoint denso.

El propio autor lo describe como un "experimento de práctica" (练手实验) y advierte explícitamente de que no es un modelo apto para producción. Su interés es metodológico: documenta una receta completa de fusión (LoRA r=32, alpha=64, datos generados por rechazo desde el propio base, comparación de cuatro candidatos de fusión) y publica una evaluación honesta con intervalos de confianza que concluye que no hay mejoras estadísticamente significativas respecto al base.

Es relevante ahora porque ejemplifica una práctica común en la comunidad open source, la fusión de expertos por dominios sobre un mismo base, y porque su evaluación rigurosa sirve como contrapunto a los informes que solo publican ganancias puntuales. El repo ocupa 8,1 GB y distribuye los pesos en safetensors con precisión bfloat16, bajo licencia Apache 2.0.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso de la familia Qwen3 (modelo base Qwen/Qwen3-4B-Instruct-2507) |
| Parámetros totales | 4.022.468.096 (~4,02 B) |
| Longitud de contexto | no disponible en la información proporcionada |
| Tipos de cuantización | no disponible (el repo solo publica pesos en bfloat16; no se listan variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | no disponible en la información proporcionada |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte del checkpoint Qwen/Qwen3-4B-Instruct-2507 (commit cdbee75f17c01a7cc42f958dc650907174af0554) y mantiene su arquitectura transformer decoder-only densa. Sobre ese base se entrenaron tres adaptadores LoRA independientes con r=32, alpha=64, aplicados a todas las capas lineales, con learning rate 1e-4, 2 épocas y batch efectivo de 16. Los datos de entrenamiento se obtuvieron por muestreo por rechazo (RFT) con el propio modelo base: se conservaron únicamente las respuestas cuya solución fue validada como correcta. Los volúmenes son pequeños: 370 ejemplos de NuminaMath-CoT para matemáticas (respuesta media de ~1.400 tokens), 1.671 de nvidia/OpenScience para ciencia (341 tokens) y 938 de BAAI/TACO restringidos a problemas con entrada estándar stdin para código (~1.700 tokens).

La fusión se realizó en el espacio de deltas de pesos con la fórmula lineal W = W0 + Σ λi·ΔWi, donde ΔWi = Bi·Ai·(α/r), con pesos λ = 1.0 para los tres expertos, densidad 1.0 y semilla 0. La receta se eligió entre cuatro candidatos (lineal λ=0.5, lineal λ=1.0, TIES con densidad 0.5 y DARE-TIES con densidad 0.5) evaluados sobre tres conjuntos de desarrollo de 100 preguntas por dominio, aislados de los conjuntos de evaluación. En desarrollo, la configuración lineal λ=1.0 obtuvo la mejor media (63,3 frente a 60,0 del base, 59,7 de lineal λ=0.5, 59,3 de TIES y 61,3 de DARE-TIES). No se documenta ningún uso de RLHF o DPO más allá del muestreo por rechazo empleado para construir los datos.

## Capacidades

- Generación de texto y conversación: el repo declara el pipeline text-generation y la etiqueta conversational.
- Razonamiento matemático: entrenado sobre NuminaMath-CoT; obtiene 93,2 en MATH-500, dentro del intervalo del base.
- Conocimiento científico: entrenado sobre nvidia/OpenScience; obtiene 41,9 en GPQA-Diamond.
- Generación de código: entrenado solo con problemas de tipo stdin de BAAI/TACO; obtiene 36,6 en LiveCodeBench v6 (175 problemas).
- Capacidades instruct generales heredadas del base Qwen3-4B-Instruct-2507 (no se detallan en la model card).
- Tool calling / function calling: no documentado.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingües: no documentadas.
- Modo thinking o razonamiento extendido explícito: no documentado.
- Integración con text-generation-inference y endpoints compatibles: sí, según las etiquetas del repositorio.

## Casos de uso

- Estudio académico de técnicas de model merging: el repositorio documenta la receta completa (LoRA, ΔW, comparación lineal frente a TIES y DARE-TIES) y permite reproducir el experimento en un laboratorio o curso sobre fusión de modelos.
- Reproducción de pipelines de RFT con LoRA: sirve como referencia para construir datos por muestreo por rechazo con el propio base y validar respuestas antes de entrenar adaptadores de dominio.
- Comparación controlada de recetas de fusión: incluye un control conjunto (un solo LoRA entrenado con datos de los tres dominios) que permite medir si la fusión aporta algo frente al entrenamiento conjunto en el mismo presupuesto.
- Banco de pruebas de matemáticas de nivel competición: con MATH-500 y generación de hasta 16.384 tokens por respuesta, útil para medir estabilidad de respuestas largas y truncación, no para producción.
- Banco de pruebas de conocimiento científico: GPQA-Diamond con preguntas de nivel posgrado permite evaluar alucinación factual y comparar contra el base y el control conjunto.
- Evaluación de generación de código para entrada stdin: adecuado para probar problemas de estilo competitivo con lectura de entrada estándar; no cubre problemas tipo LeetCode con funciones.
- Prototipos internos de asistentes conversacionales: al heredar el comportamiento instruct del base puede usarse en demos locales, siempre que se asuma la advertencia del autor sobre su falta de validación.
- Medición de degradación por truncación: la tasa de truncado en código pasó del 0,8 % al 9,7 %, lo que lo convierte en un caso útil para estudiar el efecto de respuestas más largas en pipelines con límite de tokens.

## Benchmarks y rendimiento

Parámetros de muestreo de la evaluación: temperature 0,7, top_p 0,8, top_k 20, máximo 16.384 tokens por respuesta. Los corchetes indican intervalos de confianza del 95 % obtenidos por bootstrap; Δ es la diferencia pareada frente al base con la misma semilla.

| Modelo | MATH-500 | GPQA-Diamond | LCB v6 (175) | Macro |
|---|---|---|---|---|
| Base (3 semillas) | 94,2 [92,4; 95,9] | 41,8 [35,9; 47,6] | 32,8 [26,3; 39,2] | 56,2 |
| Este modelo (semilla 0) | 93,2 [91,0; 95,4] (Δ −1,0) | 41,9 [34,8; 49,0] (Δ +1,5) | 36,6 [29,1; 44,0] (Δ +4,0) | 57,2 |
| Control conjunto: un LoRA con los tres dominios (semilla 0) | 94,2 (Δ 0,0) | 42,4 (Δ +2,0) | 30,9 (Δ −1,7) | 55,8 |

Resultados de desarrollo usados para elegir la receta de fusión (100 preguntas por dominio, aisladas de los conjuntos de evaluación):

| Configuración | Dev matemáticas | Dev ciencia | Dev código | Media |
|---|---|---|---|---|
| Base | 67 | 79 | 34 | 60,0 |
| Lineal λ=0,5 | 61 | 80 | 38 | 59,7 |
| Lineal λ=1,0 | 69 | 82 | 39 | 63,3 |
| TIES d=0,5 | 66 | 78 | 34 | 59,3 |
| DARE-TIES d=0,5 | 63 | 82 | 39 | 61,3 |

El autor concluye que todas las diferencias frente al base caen dentro del intervalo de confianza y que, por tanto, no hay mejora estadísticamente significativa. Se observa además un aumento claro de la longitud de salida (GPQA: 963 tokens de media frente a 453 del base) y un aumento del truncado en problemas de código (del 0,8 % al 9,7 %). Los resultados de las semillas 1 y 2 quedan pendientes de publicación según la model card.

## Requisitos de hardware

- Peso de los parámetros en bfloat16: aproximadamente 8 GB (el repositorio ocupa 8,1 GB).
- VRAM estimada para inferencia: del orden de 10 a 14 GB en bfloat16 con caché KV y activaciones para contextos moderados; es una estimación a partir del tamaño del checkpoint, no un dato publicado por el autor.
- VRAM estimada en 4 bits: alrededor de 3 GB de pesos, aunque no se publican archivos cuantizados y habría que generarlos.
- GPU profesionales: A100 (40/80 GB) y H100 son holgadas para inferencia en bfloat16, incluso con lotes grandes.
- GPU de consumo: cabe en RTX 4090 y RTX 3090 (24 GB) con margen amplio; en RTX 4080 (16 GB) con contexto moderado; en RTX 3080 (10 GB) o RTX 3060 (12 GB) es ajustado en bfloat16 y requeriría cuantización para trabajar con comodidad.
- Opciones de despliegue: transformers está documentado en la model card con un ejemplo de carga en bfloat16; el repositorio incluye las etiquetas text-generation-inference y endpoints_compatible. No se confirman en la información disponible integraciones con vLLM, llama.cpp ni Ollama, y en el caso de llama.cpp u Ollama sería necesaria una conversión a GGUF, ya que no se publican archivos de ese tipo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de comparativas con otros modelos fuera del propio base y del control conjunto publicado por el autor. La siguiente tabla recoge los tres puntos de referencia disponibles, todos con el mismo tamaño de parámetros (el control conjunto se entrena sobre el mismo base de 4,02 B).

| Modelo | Parámetros | Contexto | MATH-500 | GPQA-Diamond | LCB v6 | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| Qwen/Qwen3-4B-Instruct-2507 (base) | 4,02 B | no disponible en esta información | 94,2 | 41,8 | 32,8 | Apache 2.0 | Hugging Face |
| MoshiQAQ/qwen3-4b-merge-practice-merged | 4,02 B | no disponible en esta información | 93,2 | 41,9 | 36,6 | Apache 2.0 | Hugging Face |
| Control conjunto (un LoRA con los tres dominios, semilla 0) | 4,02 B | no disponible en esta información | 94,2 | 42,4 | 30,9 | no disponible | no disponible como checkpoint independiente |

## Limitaciones y advertencias

- El autor declara explícitamente que es un experimento de práctica y no un modelo apto para producción.
- No hay mejora estadísticamente significativa frente al base: todas las diferencias están dentro del intervalo de confianza del 95 %.
- Los expertos cambian poco respecto al base porque los datos de entrenamiento son escasos y generados por el propio base (pérdida de validación en el rango 0,08-0,13).
- Aumento acusado de la longitud de salida: 963 tokens de media en GPQA frente a 453 del base, y truncado del 9,7 % en problemas de código frente al 0,8 % del base.
- El experto de código solo ha visto problemas con entrada estándar (stdin); no ha visto problemas tipo LeetCode con funciones, por lo que su rendimiento en ese formato no está validado.
- Los datos de ciencia provienen de nvidia/OpenScience (CC-BY-4.0) y sus respuestas de referencia se obtuvieron por votación mayoritaria entre modelos, por lo que pueden contener errores. El publicador de ese dataset advierte de que los modelos entrenados con él pueden quedar sujetos a la licencia de Qwen.
- Aunque el repositorio declara licencia Apache 2.0, la advertencia anterior introduce incertidumbre sobre el uso comercial derivada del dataset de ciencia.
- No se documentan sesgos específicos, idiomas soportados, longitud de contexto ni capacidades de tool calling o agentes; cualquier uso que dependa de esas capacidades requiere verificación previa.
- El riesgo de alucinación no se ha medido de forma específica más allá de los benchmarks citados.
- El modelo tiene 0 descargas y 0 "me gusta" en el momento de redactar esta ficha, por lo que no cuenta con validación independiente de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/MoshiQAQ/qwen3-4b-merge-practice-merged
- Repositorio de adaptadores LoRA de los tres expertos: https://huggingface.co/MoshiQAQ/qwen3-4b-merge-practice-adapters
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Commit del base usado: cdbee75f17c01a7cc42f958dc650907174af0554
- Conjuntos de datos referenciados (sin URL directa en la información proporcionada): NuminaMath-CoT, nvidia/OpenScience, BAAI/TACO
