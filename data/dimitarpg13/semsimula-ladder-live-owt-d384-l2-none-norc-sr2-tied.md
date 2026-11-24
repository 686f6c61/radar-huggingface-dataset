# dimitarpg13/semsimula-ladder-live-owt-d384-l2-none-norc-sr2-tied

## Resumen
semsimula-ladder-live-owt-d384-l2-none-norc-sr2-tied (abreviado SR2-T) es un modelo de lenguaje de investigación desarrollado por dimitarpg13 dentro del programa SemSimula. No es un transformer: se trata de un modelo de lenguaje conservativo, un energy-based model con potencial escalar y dinámica lagrangiana, libre de atención (attention-free) y entrenado desde cero sobre OpenWebText. Su interés es fundamentalmente científico: forma parte de un estudio de ablación de mecanismos (ladder study) pre-registrado que compara variantes arquitectónicas con presupuesto de tokens idéntico.

Esta variante concreta es la cuarta esquina de la rejilla "pair force × tie": incorpora una fuerza de pares enrutada (pair force) y embeddings de entrada y cabeza de salida atados (tied embeddings), compartiendo una única matriz de 50.257 × 384. El modelo tiene 57.273.422 parámetros y una perplejidad de validación asentada de 61,27 sobre OpenWebText a bloque 512. El resultado central del experimento es que atar los embeddings y la fuerza de pares compiten entre sí: cada uno es asumible por separado, pero juntos degradan el modelo respecto a la variante sin atar.

La relevancia es metodológica más que práctica: el autor publica predicciones pre-registradas (ST1–ST4) y sus resultados, todas fallidas, lo que convierte al modelo en evidencia transparente sobre interacciones entre mecanismos en arquitecturas no-transformer. No está pensado para despliegue en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de lenguaje conservativo (energy-based, potencial escalar, dinámica lagrangiana, integrador exacto BAOAB, atención-free, no-transformer) |
| Parametros totales | 57.273.422 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (evaluado a bloque 512) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | inglés (en) |
| Licencia | cc-by-4.0 |
| Formato de pesos | PyTorch (pytorch); no se especifica safetensors ni GGUF |

## Arquitectura y entrenamiento
El modelo sustituye la atención por un formalismo físico: los tokens se sitúan en un paisaje de potencial escalar y la generación se rige por mecánica lagrangiana con un integrador exacto (BAOAB) y gradientes vivos (live gradients). Incorpora una fuerza de pares enrutada (pair force), potencial gaussiano anisótropo, embeddings atados y una formulación multi-canal xi en espacio de Fock, con geometría riemanniana (geodésicas, métrica de Jacobi). La variante "none" y "norc" del nombre indica configuraciones de ablación concretas dentro de la escalera de mecanismos.

El entrenamiento se realizó desde cero sobre OpenWebText con un presupuesto exacto de 532.480.000 tokens (32.500 pasos × 32 × 512), idéntico corpus, tokenizer y lotes de validación que el resto de modelos de la tabla comparativa. Se usó lote 16 × 2 acumulaciones, semilla y planificación idénticas a SR2. En una A100 el paso de entrenamiento tarda 1,28 s, con pico de 20,6 GB (25,0 GB con evaluación). No se reportan fases de RLHF ni DPO.

## Capacidades
- Generación de texto autorregresiva en inglés, evaluada mediante perplejidad sobre OpenWebText.
- Modelado de lenguaje de investigación con dinámica conservativa, sin mecanismo de atención.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: limitadas al inglés.
- Capacidades especiales: ninguna documentada (sin visión, audio ni modo thinking); su valor es como artefacto de ablación reproducible.

## Casos de uso
- Estudio de ablación arquitectónica: sirve como una de las cuatro esquinas de la rejilla pair force × tie para aislar el efecto de atar embeddings frente a la fuerza de pares, con presupuesto de tokens controlado.
- Reproducción de investigación: permite replicar el resultado de que la interacción tie × pair force es de 0,035 nats con el mismo corpus, tokenizer y lotes de validación.
- Evaluación de modelos energy-based: útil para comparar la perplejidad de un modelo conservativo (61,27) frente a una referencia transformer con presupuesto equivalente (49,81 en el brazo gpt2-matched).
- Docencia sobre dinámica lagrangiana aplicada a LM: el integrador BAOAB y el potencial escalar sirven como ejemplo didáctico de generación sin atención.
- Análisis de salud de entrenamiento: sus métricas (norma de gradiente, pasos sin saltos, disparos de watchdog) son material para estudiar estabilidad en modelos no-transformer.
- Verificación de hipótesis pre-registradas: el modelo documenta el fallo de las predicciones ST1–ST4, útil como caso de estudio de metodología científica en ML.

## Benchmarks y rendimiento

| Modelo | Pair force | Cabeza de salida | Parámetros | PPL asentada (OpenWebText, bloque 512) | vs GPT-2 |
|---|---|---:|---:|---:|---:|
| SR2-T (este modelo) | sí | atada | 57.273.422 | 61,27 | 1,230× |
| SR2 | sí | separada | 76.572.110 | 58,32 | 1,171× |
| SR2-NP | no | separada | 76.434.307 | 58,51 | 1,175× |
| SR2-NP-T | no | atada | 57.135.619 | 59,35 | 1,192× |
| gpt2-matched | — | atada | no disponible | 49,81 | 1,000× |

La PPL asentada es la media de las tres últimas evaluaciones (61,38; 61,31; 61,13); el mejor valor fue 59,24 en el paso 31.000. La interacción tie × pair force resulta de 0,035 nats, positiva, frente a la aditiva esperada. Datos declarados por el autor, no verificados de forma independiente.

## Requisitos de hardware
- VRAM estimada para inferencia: no disponible de forma explícita; con 57,3 M de parámetros en fp32 el peso ronda los 0,23 GB, por lo que cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: el entrenamiento se realizó en una A100 (pico de 20,6 GB sin evaluación, 25,0 GB con evaluación); para inferencia basta una GPU consumer.
- Cabe en GPU consumer: sí, por tamaño de parámetros.
- Opciones de despliegue: al ser un modelo PyTorch no-transformer con dinámica conservativa, no se documenta soporte en vLLM, llama.cpp, Ollama ni TGI; requiere el código del autor.
- Latencia y throughput: no disponible; el dato conocido es 1,28 s por paso de entrenamiento en A100.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | PPL (OWT, bloque 512) | Licencia | Disponibilidad |
|---|---:|---|---:|---|---|
| SR2-T (este) | 57,3 M | no disponible | 61,27 | cc-by-4.0 | Hugging Face |
| SR2 | 76,6 M | no disponible | 58,32 | cc-by-4.0 | Hugging Face |
| SR2-NP-T | 57,1 M | no disponible | 59,35 | cc-by-4.0 | Hugging Face |
| gpt2-matched | no disponible | no disponible | 49,81 | no disponible | Hugging Face |

## Limitaciones y advertencias
- Rendimiento inferior a la referencia transformer con el mismo presupuesto: 61,27 frente a 49,81 de perplejidad (1,230× peor que GPT-2).
- La combinación de embeddings atados y fuerza de pares degrada el modelo un 3,2 % frente a SR2-NP-T; el autor recomienda, para despliegue, prescindir de la fuerza de pares en modelos atados.
- Las predicciones pre-registradas ST1–ST4 fallaron, lo que indica que el comportamiento del mecanismo no coincide con las expectativas teóricas.
- Solo inglés; sin datos de contexto máximo documentados.
- Modelo de investigación sin verificación independiente de benchmarks; la PPL está marcada como no verificada.
- Riesgo de alucinación no evaluado; no hay datos de sesgos ni de robustez.
- Licencia cc-by-4.0 permite uso comercial con atribución, pero el modelo no está pensado para producción.
- Requiere código específico del autor para inferencia; sin soporte en runtimes estándar.

## Enlaces
- Hugging Face: https://huggingface.co/dimitarpg13/semsimula-ladder-live-owt-d384-l2-none-norc-sr2-tied
- Modelo SR2: https://huggingface.co/dimitarpg13/semsimula-ladder-live-owt-d384-l2-none-norc-sr2
- Modelo SR2-NP: https://huggingface.co/dimitarpg13/semsimula-ladder-live-owt-d384-l2-none-norc-nophi-sr2
- Modelo SR2-NP-T: https://huggingface.co/dimitarpg13/semsimula-ladder-live-owt-d384-l2-none-norc-nophi-sr2-tied
- Brazo gpt2-matched: https://huggingface.co/dimitarpg13/semsimula-ladder-owt-d384-l2-gpt2-matched
- Colección Gen 3: https://huggingface.co/collections/dimitarpg13/semantic-simulation-gen-3-cfc-baoab-live-gradients-6abf371ea3c83f127057020c
- Nota de etapa 3d (setup y scoring): https://github.com/dimitarpg13/semsimula-paper/blob/main/companion_notes/productization/Stage3d_SR2_Tied_With_Pair_Force.md
- Dataset OpenWebText: https://huggingface.co/datasets/Skylion007/openwebtext
