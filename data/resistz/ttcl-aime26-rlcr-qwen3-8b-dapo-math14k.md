# resistz/TTCL-AIME26-RLCR-Qwen3-8B-DAPO-Math14K

## Resumen

TTCL-AIME26-RLCR-Qwen3-8B-DAPO-Math14K es un ajuste fino de investigación publicado por el usuario resistz sobre Qwen/Qwen3-8B. El nombre resume la receta completa: un modelo base Qwen3-8B (8.190.735.360 parámetros, transformer denso decoder-only) sometido a un entrenamiento por refuerzo con el algoritmo DAPO sobre un conjunto de problemas matemáticos denominado Math14K, seguido de una fase de calibración en tiempo de inferencia llamada TTCL (Test-time Calibration Learning) ejecutada sobre el benchmark AIME26.

El interés del artefacto es metodológico más que de producto: documenta un pipeline de post-entrenamiento en dos etapas (RL con DAPO y posterior calibración test-time) aplicado a un modelo pequeño de razonamiento matemático. El repositorio solo contiene pesos en safetensors (16,4 GB), con licencia MIT, y no incluye ni cuantizaciones GGUF ni resultados numéricos de evaluación.

En el momento de redactar esta ficha el modelo acumula 0 descargas y 0 likes, y la model card se limita a tres líneas sin detallar hiperparámetros, composición del dataset ni métricas. Cualquier evaluación de su calidad real requiere, por tanto, reproducir los experimentos de forma independiente.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (heredada de Qwen3-8B) |
| Parámetros totales | 8.190.735.360 (~8,19 mil millones) |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens nativos; 131.072 con extensión YaRN (heredado de Qwen3-8B) |
| Tipos de cuantización | Solo safetensors en BF16/FP16 en el repositorio; no se publican GGUF, AWQ ni GPTQ |
| Idiomas soportados | No disponible para este ajuste (el modelo base Qwen3-8B declara 119 idiomas y dialectos, no confirmado aquí) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es la de Qwen3-8B sin modificaciones estructurales: transformer decoder-only denso de 36 capas, dimensión oculta 4096, atención con 32 cabezas de consulta y 8 cabezas de clave/valor (GQA), dimensión de cabeza 128, SwiGLU en el FFN, RMSNorm, RoPE y QK-Norm. El vocabulario es de 151.936 tokens y el modelo soporta modo pensamiento (thinking) y modo directo, con presupuesto de razonamiento configurable. Qwen3-8B se entrenó originalmente sobre del orden de 36 billones de tokens, dato que se hereda pero que no se ha vuelto a documentar para este ajuste.

Sobre esa base, el autor aplica RL con DAPO (Decoupled Clip and Dynamic sAmpling Policy Optimization), un algoritmo de optimización de política a nivel de grupo, sin crítico, que introduce clip asimétrico, muestreo dinámico de prompts, pérdida por token y modelado de recompensa para respuestas excesivamente largas. El conjunto de entrenamiento se identifica en el nombre como Math14K (presumiblemente 14.000 problemas matemáticos; el autor no lo confirma). Después, la model card indica que se realiza TTCL sobre AIME26, una fase de calibración en tiempo de test de la que no se aportan detalles metodológicos, hiperparámetros ni número de pasos. No se documenta ninguna etapa de SFT previa, ni datos de RLHF/DPO adicionales.

## Capacidades

- Generación de texto y razonamiento paso a paso orientado a problemas matemáticos, por el sesgo del dataset de RL (Math14K) y del benchmark de calibración (AIME26).
- Modo pensamiento (thinking) y modo no pensamiento, heredados del chat template de Qwen3-8B.
- Razonamiento de múltiples pasos con cadenas largas de tokens, apoyado en la ventana de contexto de 32.768 tokens nativos.
- Generación de soluciones formales y verificación de pasos intermedios en problemas de competición, presumiblemente reforzada por el entrenamiento con recompensa verificable.
- Soporte de tool calling / function calling: no confirmado en este ajuste; Qwen3-8B lo soporta, pero el autor no documenta si se ha preservado tras el RL.
- Comportamiento agéntico y multi-step reasoning con herramientas: no disponible.
- Capacidades multilingües: no disponibles para este ajuste.
- Capacidades especiales (visión, audio, decodificación especulativa propia): no disponibles.

## Casos de uso

- Investigación en post-entrenamiento con RL: sirve como referencia reproducible de una receta DAPO aplicada a un modelo de 8B, útil para comparar curvas de recompensa y estabilidad de entrenamiento frente a GRPO u otros algoritmos de política a nivel de grupo.
- Estudio de calibración en tiempo de test: el artefacto permite analizar si la fase TTCL sobre AIME26 mejora la consistencia de las respuestas sin reentrenar los pesos, un área activa en razonamiento matemático.
- Evaluación de razonamiento matemático de competición: uso como candidato en arneses internos tipo AIME/MATH-500, siempre con verificación de solapamiento con el conjunto de calibración.
- Generación de datos sintéticos de razonamiento: producir cadenas de solución largas para destilar en modelos menores o para ampliar datasets de matemáticas, filtrando después por verificación simbólica.
- Tutoría matemática asistida: generar explicaciones paso a paso de problemas de nivel preuniversitario y universitario, con revisión humana obligatoria por el riesgo de alucinación en pasos intermedios.
- Baseline en ablaciones controladas: al ser un ajuste de Qwen3-8B con licencia permisiva y pesos abiertos, resulta adecuado como punto de partida frente a variantes con y sin TTCL.
- Prototipado local en GPU de consumo: 8,19B parámetros permiten inferencia en una única RTX 4090 a BF16 o en tarjetas de 12 GB con cuantización de 4 bits, útil para experimentos de laboratorio sin clúster.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona AIME26 como benchmark sobre el que se ejecuta TTCL, pero no incluye ninguna métrica (pass@1, cons@N ni exactitud) asociada a este checkpoint.

## Requisitos de hardware

- VRAM para pesos en BF16/FP16: aproximadamente 16,4 GB (coincide con el tamaño del repositorio). Añadir caché KV: con GQA de 8 cabezas KV, 36 capas y dimensión de cabeza 128, la caché ocupa unos 0,14 MB por token y secuencia, es decir, del orden de 4,6 GB para 32.768 tokens con una sola secuencia.
- VRAM para cuantización INT8: alrededor de 8-9 GB de pesos, más caché KV. Para INT4: alrededor de 4,5-5,5 GB, más caché KV.
- GPU de datacenter: A100 40 GB, A100 80 GB, H100 80 GB y L40S 48 GB ejecutan el modelo en BF16 con contexto completo y lotes moderados.
- GPU de consumo: cabe en RTX 4090 y RTX 3090 (24 GB) a BF16 con contexto limitado o con caché KV en FP8; en RTX 4080/4070 Ti (16 GB) solo con cuantización; en RTX 3060 12 GB o RTX 4060 Ti 16 GB únicamente en 4 bits y contextos reducidos.
- Opciones de despliegue: vLLM y SGLang soportan la arquitectura Qwen3 y el parser de razonamiento correspondiente; TGI también es viable. llama.cpp, Ollama y LM Studio requieren convertir previamente los safetensors a GGUF, ya que el autor no publica cuantizaciones.
- Latencia y throughput estimados: no disponibles (no se han publicado mediciones).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Rendimiento en benchmarks |
|---|---|---|---|---|---|
| TTCL-AIME26-RLCR-Qwen3-8B-DAPO-Math14K | 8,19B denso | 32.768 nativo (131.072 con YaRN) | MIT | Pesos safetensors, 0 descargas | No disponible |
| Qwen/Qwen3-8B | ~8,2B denso | 32.768 nativo (131.072 con YaRN) | Apache 2.0 | Muy extendido, múltiples cuantizaciones | Publicados por el autor del base |
| DeepSeek-R1-0528-Qwen3-8B | ~8B denso (destilado de razonamiento) | 131.072 | MIT | Ampliamente distribuido | Publicados por el autor del base |
| Qwen/Qwen2.5-Math-7B | ~7B denso, especializado en matemáticas | 4.096 | Apache 2.0 | Modelo de referencia previo a la serie Qwen3 | Publicados por el autor del base |

La comparación de rendimiento directa con este ajuste no es posible porque no hay métricas publicadas; la tabla recoge únicamente datos estructurales y de licencia de los modelos de referencia.

## Limitaciones y advertencias

- Ausencia total de validación externa: 0 descargas y 0 likes, sin resultados de benchmarks publicados, por lo que no existe evidencia pública de que la receta DAPO + TTCL mejore a Qwen3-8B base o a otras destilaciones de razonamiento.
- Riesgo de contaminación del benchmark: si TTCL se ha ejecutado directamente sobre AIME26, cualquier resultado reportado sobre ese mismo conjunto no es indicativo de generalización. Conviene evaluar en AIME 2025, MATH-500 o conjuntos privados.
- Sesgo hacia matemáticas: el RL sobre Math14K puede degradar el rendimiento en tareas generales de lenguaje, código o conversación respecto al modelo base. No hay datos que lo confirmen ni que lo descarten.
- Alucinación en razonamiento matemático: los modelos de razonamiento largo tienden a producir pasos intermedios plausibles pero incorrectos; cualquier uso en producción exige verificación simbólica o revisión humana.
- Idiomas no documentados: se desconoce si el ajuste conserva el multilingüismo de Qwen3-8B o si se ha estrechado al inglés matemático.
- Soporte de tool calling no confirmado: no se especifica si el chat template y el entrenamiento conservan la capacidad de function calling de Qwen3, algo crítico para pipelines agénticos.
- Licencia MIT: permisiva para uso comercial, pero conviene verificar la compatibilidad con los términos del modelo base Qwen3-8B (Apache 2.0), que se mantienen como capa inferior de derechos.
- Metadatos atípicos: la fecha de creación (2026-09-28) y la ausencia de pipeline declarado en la ficha de HuggingFace dificultan la trazabilidad de la versión exacta de los pesos.
- Sin cuantizaciones oficiales: desplegar en entornos con restricciones de VRAM exige generar GGUF/AWQ/GPTQ por cuenta propia, con el riesgo de degradación no medida.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/resistz/TTCL-AIME26-RLCR-Qwen3-8B-DAPO-Math14K
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B
- Paper del algoritmo DAPO (referencia del método citado en el nombre del modelo, no enlazado por el autor): https://arxiv.org/abs/2503.14476
- Repositorio de Qwen3 en GitHub: https://github.com/QwenLM/Qwen3
