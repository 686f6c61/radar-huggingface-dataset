# peculiar-ragdoll/Sharp-Spark-X2.5-4B-GGUF

## Resumen

Sharp-Spark-X2.5-4B-GGUF es una colección de cuantizaciones GGUF dinámicas del modelo denso XHToken/Spark-X2.5-4B, publicada por el usuario peculiar-ragdoll. El modelo base es un transformer denso de 4.112.079.360 parámetros (aproximadamente 4B) con arquitectura de atención híbrida y orientación a contexto largo y generación de código. La aportación de esta ficha no es el modelo en sí, sino el proceso de cuantización: una matriz de importancia (imatrix) ponderada hacia código de sistemas y seguridad, una asignación heurística de bits por tensor y una plantilla de chat propia denominada Sharp-Spark.

El interés actual del modelo radica en su perfil de eficiencia: con cuantizaciones de entre 2,67 GB (Q4_K_XL) y 3,61 GB (Q6_K_XL), está diseñado para ejecutarse en GPUs con 4-6 GB de VRAM y mantener velocidad utilizable hasta contextos de seis cifras. La arquitectura híbrida de atención —solo 9 de sus 36 capas son de atención completa, mientras que las otras 27 usan una ventana deslizante de 512 tokens— reduce drásticamente el crecimiento de la caché KV y hace viable un contexto de 131.072 tokens en hardware de gama baja.

La licencia es Apache 2.0, lo que permite uso comercial sin restricciones adicionales conocidas. El repositorio acumula 870.866 descargas y 165 likes, y el autor mantiene una versión posterior (Sharp-Spark-X2.6-4B-GGUF) que recomienda como mejora sobre esta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso con atención híbrida (9 capas de atención completa cada 4 capas, 27 capas con ventana deslizante de 512 tokens); 36 capas en total |
| Parametros totales | 4.112.079.360 (~4B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 131.072 tokens (validado en la model card); la caché KV permite hasta 256K según las tablas publicadas |
| Tipos de cuantizacion | Q4_K_XL (2,67 GB), Q5_K_XL (3,24 GB), Q6_K_XL (3,61 GB); cuantizaciones GGUF dinámicas con imatrix |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo base Spark-X2.5-4B es un transformer denso de 36 capas con un esquema de atención híbrido: una de cada cuatro capas (9 en total) realiza atención completa sobre toda la secuencia, mientras que las 27 restantes operan con una ventana deslizante de 512 tokens. Esta configuración limita el crecimiento de la caché KV a las 9 capas de atención completa, que escalan a razón de aproximadamente 4 KB por token y capa, es decir, unos 36 KB/token en f16 y 19 KB/token en q8_0. El resultado es que un contexto de 128K consume 4,83 GB de caché KV en f16 o 2,60 GB en q8_0, cantidades manejables en GPUs de gama baja.

La contribución específica de esta ficha es el proceso de cuantización. El autor generó una matriz de importancia (imatrix) ejecutando los pesos BF16 completos (8,2 GB) sobre un corpus de calibración público y redistribuible, ponderado hacia código de seguridad y sistemas. El corpus se consumió hasta el agotamiento: 3.641 fragmentos de 4.096 tokens cada uno, lo que suma 14,9 millones de tokens. La elección de fragmentos de 4.096 tokens es deliberada: al superar la ventana de 512 tokens de las capas deslizantes, se fuerza a las 9 capas de atención completa a operar en el régimen de largo alcance para el que fueron diseñadas, evitando que el cuantizador subproteja precisamente esas capas. Los metadatos de la imatrix se registran en el propio archivo GGUF (`imatrix.chunk_count`). No se dispone de información sobre el dataset de entrenamiento original del modelo base ni sobre si se aplicaron técnicas de RLHF o DPO.

## Capacidades

- Generación de texto conversacional y de código, con especial orientación a código de sistemas y seguridad según la ponderación de la imatrix.
- Razonamiento de múltiples pasos y modo de pensamiento eficiente en tokens (etiquetas `efficient-thinking` y `token-efficient`).
- Contexto largo utilizable: validado a 131.072 tokens con decodificación a 42 tok/s y prefill a 557 tok/s; la tabla de caché KV sugiere viabilidad hasta 256K.
- Plantilla de chat propia Sharp-Spark, incluida en el repositorio.
- Compatibilidad con endpoints (etiqueta `endpoints_compatible`).
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Capacidades multimodales (visión, audio): no disponibles.

## Casos de uso

- Asistencia de código en GPU de 6 GB: con Q6_K_XL (3,61 GB) el modelo cabe en tarjetas como la RTX 2060 o la GTX 1660 Ti, dejando espacio para unos 48K de contexto en caché f16 o unos 96K en q8_0. Adecuado para autocompletado y revisión de código en entornos con hardware limitado.
- Análisis de repositorios completos: con Q4_K_XL (2,67 GB) se superan los 128K de contexto en la misma tarjeta de 6 GB, lo que permite cargar varios archivos de un proyecto y razonar sobre dependencias entre ellos.
- Revisión de código orientada a seguridad: la imatrix está ponderada hacia código de seguridad y sistemas, por lo que el modelo conserva mejor la precisión en patrones de vulnerabilidades, gestión de memoria y llamadas al sistema que una cuantización genérica.
- Agentes de codificación con contexto largo: la caída de decodificación de solo 2,6× entre contexto vacío y 131K (de 111 a 42 tok/s) permite mantener sesiones de agente multi-turno con historial extenso sin degradación severa de latencia.
- Despliegue en portátiles y equipos de gama baja: con menos de 16 GB de RAM y una GPU de 4-6 GB, el modelo es una opción viable para asistentes de código locales sin conexión.
- Procesamiento de documentación técnica extensa: la ventana de 131K tokens permite resumir y extraer información de manuales, especificaciones o logs de sistemas largos en una sola pasada.
- Evaluación comparativa de cuantizaciones: el repositorio incluye resultados de SWE-bench-Live y MMLU-Pro por cuantización, lo que lo convierte en un caso de estudio útil para medir el impacto de la cuantización en modelos pequeños.

## Benchmarks y rendimiento

Los datos publicados en la model card provienen de subconjuntos reducidos y múltiples semillas, por lo que deben interpretarse con cautela.

| Benchmark | SharpSpark-Q6 | Referencia | Notas |
|---|---|---|---|
| SWE-bench-Live (17 celdas, 3 semillas) | 5,7 solves/semilla | Haiku 4.5-high: 5,0; upstream Spark-Q8: 3,7 | Dentro de intervalos de confianza; trabajo amortizado por solve: 74 min (SharpSpark-Q6), 21 min (Haiku), 145 min (stock Q8) |
| MMLU-Pro (100 preguntas, 3 semillas) | 69,0 % | upstream Spark-Q8: 70,3 % | Diferencia no significativa (p=0,51); 43 % menos tokens por pregunta en la mediana y 18 % menos en la media (p=0,0002) |

Rendimiento de inferencia declarado (contexto corto vs. 131K):

| Contexto | Prefill (tok/s) | Decode (tok/s) |
|---|---:|---:|
| 512 tokens | 1.684 | 111 |
| 131.072 tokens | 557 | 42 |

## Requisitos de hardware

- VRAM para los pesos: 2,67 GB (Q4_K_XL), 3,24 GB (Q5_K_XL) o 3,61 GB (Q6_K_XL).
- VRAM para caché KV: 0,21 GB a 4K y 4,83 GB a 128K en f16; 0,11 GB a 4K y 2,60 GB a 128K en q8_0.
- Configuración recomendada por el autor: Q6_K_XL en GPU de 6+ GB de VRAM (rendimiento validado en SWE-bench-Live); Q4_K_XL como opción para GPU de 4 GB o para maximizar contexto.
- En una tarjeta de 6 GB, Q6_K_XL deja espacio para unos 48K de contexto en f16 o unos 96K en q8_0; Q4_K_XL supera los 128K en la misma tarjeta.
- El autor advierte que los modelos de este tamaño son sensibles al daño por cuantización por debajo de Q6, y recomienda elegir un modelo nativamente más pequeño antes que bajar de Q4.
- Opciones de despliegue: llama.cpp (formato nativo GGUF); compatible con endpoints según las etiquetas del repositorio. No se confirma soporte de vLLM, TGI ni Ollama en la información disponible.
- Throughput: 111 tok/s en decodificación con contexto corto y 42 tok/s a 131K; prefill de 1.684 tok/s en corto y 557 tok/s a 131K (unos 4 minutos para llenar 131K tokens).
- El autor sugiere, para equipos con más de 16 GB de RAM, usar un modelo MoE mayor con offloading parcial (su colección TielCoder 35B-A3B) en lugar de este 4B.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Sharp-Spark-X2.5-4B-GGUF (esta ficha) | 4,11B denso | 131K validado (hasta 256K por caché KV) | Apache 2.0 | Cuantizaciones Q4-Q6 con imatrix; 2,67-3,61 GB |
| XHToken/Spark-X2.5-4B (modelo base) | 4,11B denso | 131K | No disponible | Pesos BF16 (8,2 GB); referencia de calidad upstream |
| Sharp-Spark-X2.6-4B-GGUF | 4B (presumiblemente) | No disponible | Apache 2.0 (presumible) | Versión posterior del mismo autor, recomendada como mejora |
| CyberTiel 35B-A3B (MoE del mismo autor) | 35B totales, 3B activos | No disponible | No disponible | Requiere más RAM; según el autor, aproximadamente el doble de capacidad en SWE-bench-Live (13,0/17 frente a 5,7/17) |

No se dispone de datos de benchmarks de modelos de terceros comparables en la información proporcionada.

## Limitaciones y advertencias

- Modelo de 4B: capacidad limitada en comparación con modelos mayores; el propio autor indica que un MoE de 35B con offloading es aproximadamente el doble de capaz en tareas de código.
- Sensibilidad a la cuantización: por debajo de Q6 el daño puede ser significativo; el autor desaconseja cuantizaciones menores que Q4.
- Los resultados de benchmarks publicados usan subconjuntos reducidos (17 celdas en SWE-bench-Live, 100 preguntas en MMLU-Pro) y múltiples semillas, con intervalos de confianza amplios; no deben extrapolarse a evaluaciones completas.
- Idiomas soportados no documentados; no hay garantía de rendimiento multilingüe más allá del inglés.
- Riesgo de alucinación inherente a los modelos de lenguaje; no se documentan mitigaciones específicas.
- Sesgos conocidos: no documentados en la información disponible.
- La plantilla de chat Sharp-Spark es específica de esta ficha; usar otra plantilla puede degradar el rendimiento.
- Aunque la licencia es Apache 2.0, conviene verificar las condiciones del modelo base XHToken/Spark-X2.5-4B, cuya licencia no se detalla en la información disponible.
- El autor mantiene una versión posterior (2.6) que recomienda sobre esta; la ficha 2.5 puede quedar desactualizada.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/peculiar-ragdoll/Sharp-Spark-X2.5-4B-GGUF
- Modelo base: https://huggingface.co/XHToken/Spark-X2.5-4B
- Versión posterior recomendada: https://huggingface.co/peculiar-ragdoll/Sharp-Spark-X2.6-4B-GGUF
- Colección CyberTiel Coder 35B-A3B: https://huggingface.co/collections/peculiar-ragdoll/cyber-tiel-coder-35b-a3b
- Colección TielCoder 35B-A3B: https://huggingface.co/collections/peculiar-ragdoll/tiel-coder-35b-a3b
