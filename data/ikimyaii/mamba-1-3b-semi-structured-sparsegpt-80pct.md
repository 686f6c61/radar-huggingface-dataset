# ikimyaii/Mamba-1.3B-semi-structured-SparseGPT-80pct

## Resumen

Mamba-1.3B-semi-structured-SparseGPT-80pct es un modelo derivado de fla-hub/mamba-1.3B-100B al que se le ha aplicado una poda (pruning) one-shot sin reentrenamiento posterior, reduciendo la densidad de sus capas lineales internas a una dispersión semi-estructurada del 80% aproximadamente (densidad medida de 0,2160, es decir, 0,7840 de sparsity). Lo publica el usuario ikimyaii en Hugging Face como *baseline* de una familia de modelos propios denominada EHWS, de modo que sirve como referencia comparativa para evaluar variantes de poda con restricciones por fila.

El modelo parte de una arquitectura Mamba pura (modelo de espacio de estados selectivo, no transformer) con 1.334.740.992 parámetros totales, entrenada originalmente sobre 100.000 millones de tokens (según el nombre del checkpoint base, mamba-1.3B-100B). La poda se aplica exclusivamente a las proyecciones lineales dentro de los bloques (`in_proj`, `x_proj`, `out_proj`), manteniendo densas `dt_proj`, `conv1d`, `A_log`, `D`, los embeddings y el `lm_head`.

Su relevancia es fundamentalmente metodológica y de investigación: demuestra el coste en calidad de una poda agresiva al 80% sin recuperación, con un deterioro muy severo de perplejidad (de 10,03 a 187,71 en WikiText-2) y una caída de precisión media zero-shot de 0,4350 a 0,3259. No es un modelo pensado para producción, sino para estudiar técnicas de compresión en arquitecturas SSM.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mamba (modelo de espacio de estados selectivo, SSM), basada en fla-hub/mamba-1.3B-100B |
| Parametros totales | 1.334.740.992 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (el calibrado usó secuencias de 2.048 tokens) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, originalmente bfloat16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Dispersion (sparsity) | 0,7840 semi-estructurada en capas lineales internas de los bloques |
| Tamano del repo | 2,7 GB |
| Modelo base | fla-hub/mamba-1.3B-100B |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura Mamba del checkpoint base: un modelo de espacio de estados selectivo con mecanismo de recurrencia dependiente de la entrada, sin atención y con complejidad lineal respecto a la longitud de secuencia. Sobre esa arquitectura se aplica una poda one-shot mediante la herramienta oficial `fasterprune`, que implementa SparseGPT, con una modificación del autor: dentro de cada bloque de 128 columnas, cada fila poda el mismo número de entradas según la regla de menor magnitud `w^2 / [H^-1]_jj^2` (regla N:M de SparseGPT con M igual al tamaño del bloque). Esto garantiza que todas las filas tengan el mismo número de no-ceros, equilibrando la carga de trabajo por fila (verificado sobre las 192 capas podadas).

El proceso de calibración usa el cargador oficial con 128 secuencias de C4 de 2.048 tokens y semilla 0. Los bloques se podan en orden, calibrando cada uno sobre las salidas de los bloques ya podados anteriores, siguiendo el esquema de los drivers oficiales. La poda se realizó en bfloat16 y tardó 5,2 minutos en una A100 de 40 GB. No hubo reentrenamiento ni ajuste fino posterior a la poda.

## Capacidades

- Generación de texto autoregresiva básica, aunque con calidad muy degradada respecto al modelo denso (perplejidad en WikiText-2 de 187,71 frente a 10,03).
- Razonamiento y conocimiento factual limitados: la precisión media zero-shot cae a 0,3259 (frente a 0,4350 del denso).
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidades multilingües: no disponibles.
- No dispone de visión, audio ni modo de razonamiento extendido.
- Su utilidad principal es como referencia de investigación para comparar técnicas de poda en arquitecturas Mamba.

## Casos de uso

- Investigación en compresión de modelos: servir como baseline frente a las variantes EHWS del mismo autor para medir la mejora que aportan esquemas de poda alternativos bajo la misma dispersión del 80%.
- Estudio de poda en arquitecturas SSM: permite analizar cómo afecta la poda semi-estructurada a capas lineales internas de Mamba, un terreno menos explorado que en transformers.
- Experimentos de eficiencia energética y de memoria: al reducir la densidad de las capas lineales, sirve para medir el ahorro teórico en cómputo y ancho de banda de memoria en hardware con soporte de sparsity estructurada.
- Docencia y divulgación: ejemplo reproducible de aplicación de SparseGPT a un modelo no transformer, con protocolo de calibración documentado.
- Evaluación de protocolos de perplejidad: el autor emplea el protocolo de ELSA (WikiText-2 y C4) en bf16, útil para replicar y comparar mediciones.
- Análisis de robustez: estudiar la degradación por tarea (por ejemplo, RTE y Winogrande apenas caen, mientras arc_easy y boolq se desploman) para entender qué tipos de capacidad resisten mejor a la poda agresiva.

## Benchmarks y rendimiento

Perplejidad con protocolo de evaluación de ELSA, en bf16:

| Conjunto | Denso | Este modelo |
|---|---|---|
| WikiText-2 | 10,03 | 187,71 |
| C4 | 14,12 | 176,42 |

Precisión zero-shot con lm-evaluation-harness:

| Tarea | Denso | Este modelo |
|---|---|---|
| arc_challenge | 0,2329 | 0,1758 |
| arc_easy | 0,5644 | 0,2908 |
| boolq | 0,6040 | 0,3847 |
| hellaswag | 0,3898 | 0,2729 |
| openbookqa | 0,1980 | 0,1160 |
| rte | 0,5343 | 0,5271 |
| winogrande | 0,5217 | 0,5138 |
| Media | 0,4350 | 0,3259 |

## Requisitos de hardware

- VRAM estimada para inferencia: alrededor de 2,7 GB en bfloat16 para los pesos; en fp16 no es viable porque Mamba desborda en fp16 según el autor, por lo que debe usarse bf16 o cuantización.
- GPU recomendadas: cualquier GPU con soporte de bf16 y al menos 6-8 GB de VRAM para dejar margen a activaciones y contexto; una A100 40 GB fue suficiente para el proceso de poda.
- Cabe en GPU de consumo: sí, en tarjetas como RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080 o RTX 4090.
- Opciones de despliegue: es necesario instalar `flash-linear-attention` (`import fla`) y cargar con `AutoModelForCausalLM.from_pretrained(...)`. No se documenta soporte en vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Perplejidad WikiText-2 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (Mamba-1.3B, sparsity 80%) | 1.334.740.992 | no disponible | 187,71 | no disponible | Hugging Face |
| fla-hub/mamba-1.3B-100B (denso) | ~1.300 M | no disponible | 10,03 | no disponible | Hugging Face |
| Variantes EHWS del mismo autor | no disponible | no disponible | no disponible | no disponible | Hugging Face (cuenta ikimyaii) |

## Limitaciones y advertencias

- Calidad severamente degradada: la perplejidad se multiplica por más de 17 en WikiText-2 y por más de 12 en C4 respecto al modelo denso; no es apto para uso en producción.
- Caída notable en tareas de sentido común y lectura comprensiva (arc_easy pasa de 0,5644 a 0,2908; boolq de 0,6040 a 0,3847).
- Riesgo elevado de alucinación y de generación incoherente debido a la poda agresiva sin reentrenamiento.
- Licencia no especificada: no se puede confirmar el uso comercial; conviene consultar la licencia del modelo base fla-hub/mamba-1.3B-100B antes de cualquier uso.
- Idiomas soportados no documentados.
- Longitud de contexto no documentada; el calibrado usó 2.048 tokens, pero no se garantiza comportamiento correcto más allá.
- Requiere la librería `flash-linear-attention` para cargarse; no funciona con cargadores estándar sin ella.
- No debe usarse en fp16 por desbordamiento de Mamba; usar bf16.
- El autor indica explícitamente que no es el método SparseGPT publicado, sino una variante con restricción por fila; los resultados no son directamente comparables con implementaciones estándar de SparseGPT.
- Sesgos conocidos: no documentados, pero heredables del corpus de entrenamiento del modelo base (C4 y datos no especificados).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ikimyaii/Mamba-1.3B-semi-structured-SparseGPT-80pct
- Modelo base: https://huggingface.co/fla-hub/mamba-1.3B-100B
- Cuenta del autor (variantes EHWS): https://huggingface.co/ikimyaii
