# abe123/babylm-dat-strict-nextlat-final

## Resumen

DAT Strict NextLat Final es un modelo de lenguaje causal de tipo Dual Attention Transformer (DAT) entrenado desde cero por el usuario abe123 para la pista Strict del desafío BabyLM 2026. El modelo combina atención propia con atención relacional y símbolos relativos a la posición, e incorpora un objetivo auxiliar de entrenamiento denominado NextLat. Cuenta con 304.318.464 parámetros totales, 16 capas transformer y una dimensión oculta de 1.024.

El modelo está pensado exclusivamente para investigación y evaluación en el marco de BabyLM, un desafío que limita el entrenamiento a un corpus del orden de 100 millones de palabras para estudiar cómo aprenden los modelos con datos comparables a los que recibe un niño. No está destinado a uso en producción ni a aplicaciones generales: su ventana de contexto es de 514 tokens y su vocabulario de 16.384 entradas.

Su relevancia reside en el interés arquitectónico: la combinación de atención relacional con un objetivo auxiliar NextLat y pesos EMA lo convierten en un objeto de estudio para quienes investigan arquitecturas alternativas al transformer estándar en regímenes de datos limitados. La licencia Apache 2.0 facilita su reutilización en experimentos académicos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Dual Attention Transformer (DAT) causal con atención propia y atención relacional |
| Parametros totales | 304.318.464 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 514 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Capas | 16 |
| Dimension oculta | 1.024 |
| Cabezas de atencion | 12 de auto-atención y 4 de atención relacional |
| Vocabulario | 16.384 tokens |
| Embedding y cabeza LM | no atados (untied) |

## Arquitectura y entrenamiento

El modelo es un transformer causal de 16 capas con SwiGLU en las capas feed-forward y codificación posicional rotatoria a nivel de token. La innovación principal es la atención dual: además de 12 cabezas de auto-atención convencional, incorpora 4 cabezas de atención relacional (RA) que operan sobre símbolos relativos a la posición recuperados de forma compartida, sin RoPE aplicado a dichos símbolos. El embedding de tokens y la cabeza de lenguaje no comparten pesos.

El entrenamiento consistió en diez pasadas sobre el corpus BabyLM 2026 Strict, respetando el límite de 100 millones de palabras. Se usaron lotes de 42 secuencias de 512 tokens con semilla 1, el optimizador Muon para las matrices ocultas y LambW para el resto de parámetros, con tasa de aprendizaje Muon de 0,02, tasa auxiliar de 0,001, weight decay de 0,01 y un schedule de warmup del 1 por ciento seguido de decaimiento coseno hasta el 10 por ciento de la tasa inicial. El objetivo auxiliar NextLat empleó horizonte 1 con peso de entropía cruzada 0,0, peso KL de 0,5 y peso MSE de 1,0. Se mantuvo una media móvil exponencial (EMA) con decaimiento 0,999, y los pesos publicados corresponden a la EMA. No se usaron modelos profesor, datos sintéticos ni entradas multimodales.

## Capacidades

- Generación de texto causal autoregresiva en inglés, limitada al dominio del corpus BabyLM.
- Modelado de lenguaje con objetivo auxiliar NextLat, orientado a representaciones latentes de siguiente paso.
- Atención relacional sobre símbolos relativos a la posición, orientada a capturar estructura relacional en secuencias cortas.
- No dispone de soporte documentado de tool calling ni function calling.
- No dispone de soporte documentado de agentes ni razonamiento multi-paso.
- Capacidades multilingües no documentadas; el corpus BabyLM es predominantemente anglófono.
- No incluye modo thinking, visión ni audio.

## Casos de uso

- Investigación en arquitecturas alternativas: sirve como punto de comparación frente a transformers estándar entrenados con el mismo corpus BabyLM, permitiendo aislar el efecto de la atención relacional y del objetivo NextLat.
- Evaluación en el benchmark BabyLM 2026: el modelo está diseñado para las tareas de la pista Strict, por lo que se emplearía directamente en los pipelines de evaluación oficiales del desafío.
- Estudio de eficiencia en regímenes de datos limitados: con 304 millones de parámetros y 100 millones de palabras de entrenamiento, es adecuado para analizar curvas de aprendizaje y sobreajuste.
- Reproducción de experimentos: los checkpoints intermedios con nombres `chck_1M` a `chck_1000M` permiten trazar la evolución del modelo a lo largo del entrenamiento y validar resultados con un SHA inmutable.
- Análisis de pesos EMA frente a pesos finales: la publicación de pesos EMA facilita estudiar el efecto de la media móvil exponencial en la estabilidad y calidad del modelo.
- Docencia y experimentación académica: su tamaño reducido y licencia Apache 2.0 permiten desplegarlo en entornos de laboratorio con GPU de gama media para prácticas de modelado de lenguaje.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 1,2 GB para los 304 millones de parámetros, más overhead de activaciones y caché KV.
- VRAM estimada en fp16/bf16: aproximadamente 0,6 GB para pesos, más overhead.
- Cabe holgadamente en GPU de consumo como RTX 3060, RTX 4060, RTX 4090 y superiores.
- GPU de datacenter (A100, H100) no necesarias; sobredimensionadas para este modelo.
- Despliegue mediante transformers con `trust_remote_code=True`; requiere el código personalizado incluido en el repositorio.
- Compatibilidad con vLLM, llama.cpp, Ollama o TGI no documentada; el código personalizado puede impedir su uso directo.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| DAT Strict NextLat Final | 304 M | 514 | Apache 2.0 | Atención dual con atención relacional y NextLat; BabyLM 2026 Strict |
| BabyLM baselines (transformers estándar) | variable (aprox. 100-400 M) | variable | variable | Referencia del desafío; sin atención relacional |
| GPT-2 small | 124 M | 1.024 | MIT | Transformer estándar, entrenamiento a gran escala, no comparable en régimen de datos |

La comparación cuantitativa con alternativas BabyLM no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Modelo de investigación: no está destinado a producción ni a aplicaciones de usuario final.
- Ventana de contexto muy corta (514 tokens), insuficiente para la mayoría de tareas reales.
- Entrenado sobre un corpus limitado a 100 millones de palabras; cobertura lingüística y de dominio restringida.
- Riesgo elevado de alucinación y de generar texto incoherente fuera del dominio del corpus.
- Idiomas soportados no documentados; se espera un rendimiento muy limitado fuera del inglés.
- Requiere `trust_remote_code=True`, lo que implica ejecutar código personalizado del autor; revisar antes de usar en entornos sensibles.
- Sesgos no documentados; al entrenarse con un corpus académico puede reflejar sesgos del mismo.
- Licencia Apache 2.0 permite uso comercial, pero las limitaciones técnicas hacen inviable su uso en producción.
- Los pesos publicados corresponden a la EMA, no a los pesos finales sin promediar; tenerlo en cuenta al reproducir resultados.

## Enlaces

- Hugging Face: https://huggingface.co/abe123/babylm-dat-strict-nextlat-final
- BabyLM Challenge: no disponible en la información proporcionada
- Paper de Dual Attention Transformer: no disponible en la información proporcionada
- Repositorio de código: no disponible en la información proporcionada
