# bluebottlewize/anlp-a3-cipher

## Resumen

`bluebottlewize/anlp-a3-cipher` es un conjunto de cuatro checkpoints de modelos de secuencia entrenados para descifrado de cifrados a nivel de carácter, desarrollado como parte de la asignatura CSE576 ANLP (Assignment 3) del IIIT-Hyderabad. El objetivo es mapear texto cifrado sobre un alfabeto ASCII de 81 caracteres a texto plano sobre un alfabeto de 27 caracteres (`a`–`z` y espacio), en horizontes de contexto de hasta 15.021 tokens. No es un modelo de lenguaje generalista: es un artefacto académico de investigación en modelado de secuencias.

El repositorio incluye cuatro arquitecturas comparadas bajo un mismo presupuesto de entrenamiento (4 capas, `d_model=256`, FP32): un Transformer con atención SDPA/FlashAttention, un SSM selectivo tipo Mamba, un modelo de atención lineal DeltaNet y un híbrido propio del autor. Los tamaños oscilan entre 1,8 M y 3,2 M de parámetros, lo que los sitúa en la categoría de modelos minúsculos orientados a una tarea concreta.

Su relevancia es fundamentalmente metodológica: permite comparar empíricamente SSM, atención lineal e híbridos frente a Transformer estándar en una tarea de dependencias de largo alcance, con métricas de accuracy, F1 y distancia de Levenshtein sobre un conjunto de test de 1.318 muestras. No está pensado para uso en producción general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cuatro variantes: Transformer (SDPA/FlashAttention), Mamba (SSM selectivo), DeltaNet (atención lineal) e híbrido propio; 4 capas, `d_model=256`, FP32 |
| Parametros totales | DeltaNet 3.219.472; Transformer 3.203.584; Híbrido 2.508.552; Mamba 1.797.632 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | Hasta 15.021 tokens |
| Tipos de cuantizacion | No disponible (pesos en FP32) |
| Idiomas soportados | No disponible (tarea de descifrado carácter a carácter sobre alfabeto `a`–`z` y espacio) |
| Licencia | MIT |
| Formato de pesos | `.pt` (PyTorch): `deltanet_best.pt`, `hybrid_best.pt`, `mamba_best.pt`, `transformer_best.pt` |

## Arquitectura y entrenamiento

Los cuatro checkpoints comparten una configuración común de 4 capas y dimensión de modelo 256, entrenados en FP32. La variante Transformer emplea atención estándar con SDPA (Scaled Dot-Product Attention, con soporte de FlashAttention). Mamba corresponde a un modelo de espacio de estados selectivo. DeltaNet implementa atención lineal con regla de actualización delta. El modelo híbrido combina componentes de las anteriores, con un recuento de parámetros intermedio (2,5 M) y un coste de FLOPs de 321 M, entre Mamba (230 M) y DeltaNet (412 M).

La tarea es descifrado neuronal a nivel de carácter: la entrada es texto cifrado sobre un alfabeto ASCII de 81 símbolos y la salida es texto plano sobre 27 símbolos. El contexto de entrenamiento y evaluación alcanza los 15.021 tokens, lo que exige mecanismos eficientes para dependencias de largo alcance. No se especifican en la información disponible el volumen de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO (poco probables en esta tarea). Tampoco se documentan innovaciones adicionales más allá de las arquitecturas comparadas.

## Capacidades

- Descifrado de texto cifrado a nivel de carácter sobre un alfabeto ASCII de 81 símbolos, produciendo salida sobre `a`–`z` y espacio.
- Modelado de secuencias con dependencias de largo alcance (hasta 15.021 tokens).
- Comparación controlada entre cuatro familias arquitectónicas bajo idéntico presupuesto de parámetros y capas.
- Evaluación con métricas de accuracy por carácter y por palabra, precisión, recall, F1 y distancia de Levenshtein.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No dispone de capacidades multilingües documentadas.
- No incluye modo de pensamiento, visión ni audio.

## Casos de uso

- Investigación comparativa de arquitecturas de secuencia: usar los cuatro checkpoints para medir empíricamente cómo se comportan SSM, atención lineal, híbridos y Transformer en una tarea de dependencias largas con el mismo presupuesto de parámetros.
- Reproducción de resultados académicos: ejecutar `scripts/part1/test_assn.sh` con cada variante para replicar las métricas publicadas sobre el conjunto de test de 1.318 muestras.
- Docencia en procesamiento de lenguaje natural: servir como ejemplo práctico de entrenamiento y evaluación de modelos de secuencia carácter a carácter con contextos de más de 15.000 tokens.
- Estudio de eficiencia computacional: comparar FLOPs (entre 211 M y 412 M) y recuento de parámetros frente a calidad de descifrado para analizar el compromiso coste-rendimiento.
- Base para experimentos de criptoanálisis neuronal: punto de partida para probar variantes de cifrados, alfabetos o longitudes de contexto en un entorno reproducible con licencia MIT.
- Prototipado de pipelines de evaluación de modelos pequeños: el arnés de test incluido permite integrar los checkpoints en flujos de validación automatizada con métricas estándar (accuracy, F1, Levenshtein).

## Benchmarks y rendimiento

Resultados sobre el conjunto de test retenido (1.318 muestras), según la model card del autor:

| Modelo | Char acc. | Word acc. | Precision | Recall | F1 | Levenshtein | Params | FLOPs |
|---|---|---|---|---|---|---|---|---|
| DeltaNet | 50,40 % | 45,89 % | 86,43 % | 73,78 % | 0,7719 | 667,70 | 3.219.472 | 412.092.416 |
| Híbrido (propio) | 50,03 % | 45,65 % | 86,21 % | 73,49 % | 0,7694 | 673,64 | 2.508.552 | 321.094.656 |
| Mamba | 49,78 % | 45,75 % | 92,24 % | 73,21 % | 0,7766 | 703,08 | 1.797.632 | 230.096.896 |
| Transformer | 44,06 % | 39,29 % | 86,18 % | 64,07 % | 0,6770 | 720,96 | 3.203.584 | 211.861.504 |

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP32 para cualquiera de los cuatro checkpoints (entre 1,8 M y 3,2 M de parámetros); el repositorio completo ocupa 0,1 GB.
- GPU recomendadas: cualquier GPU con al menos 1–2 GB de memoria; una RTX 4090, A100 o H100 están sobredimensionadas para esta carga.
- Cabe holgadamente en GPU de consumo, incluida una GTX 1650 o una iGPU con memoria compartida; también es viable en CPU.
- Opciones de despliegue: el repositorio proporciona un arnés propio en `scripts/part1/test_assn.sh`; al ser pesos PyTorch (`*.pt`) con arquitecturas personalizadas, no hay soporte documentado para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Params | Contexto | Char acc. | F1 | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| DeltaNet (este repo) | 3.219.472 | 15.021 | 50,40 % | 0,7719 | MIT | Hugging Face |
| Híbrido (este repo) | 2.508.552 | 15.021 | 50,03 % | 0,7694 | MIT | Hugging Face |
| Mamba (este repo) | 1.797.632 | 15.021 | 49,78 % | 0,7766 | MIT | Hugging Face |
| Transformer (este repo) | 3.203.584 | 15.021 | 44,06 % | 0,6770 | MIT | Hugging Face |

No se dispone de información sobre modelos externos comparables en la misma tarea de descifrado neuronal a nivel de carácter con estas características.

## Limitaciones y advertencias

- Modelo de propósito muy específico: solo descifra texto sobre un alfabeto ASCII de 81 símbolos hacia `a`–`z` y espacio; no es un modelo de lenguaje general.
- Rendimiento moderado: la mejor accuracy por carácter es del 50,40 % (DeltaNet), insuficiente para descifrado fiable en producción.
- Sesgos conocidos: no documentados; al entrenarse sobre una distribución concreta de cifrados, el comportamiento fuera de esa distribución es incierto.
- Riesgo de alucinación: la salida es una predicción carácter a carácter sin mecanismo de verificación; puede producir texto plano plausible pero incorrecto.
- Limitaciones de contexto e idioma: contexto máximo de 15.021 tokens y sin soporte multilingüe documentado.
- Licencia MIT: permite uso comercial, pero el modelo es un artefacto académico sin garantías de idoneidad.
- Caveat para producción: los pesos están en formato `.pt` con código de arquitectura propio; la integración requiere el arnés del repositorio y no hay soporte para runtimes de inferencia estándar.
- Repositorio con 0 descargas y 0 likes: sin validación comunitaria externa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/bluebottlewize/anlp-a3-cipher
