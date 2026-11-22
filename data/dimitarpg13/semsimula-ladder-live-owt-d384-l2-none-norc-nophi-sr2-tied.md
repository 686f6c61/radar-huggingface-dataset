# dimitarpg13/semsimula-ladder-live-owt-d384-l2-none-norc-nophi-sr2-tied

## Resumen

semsimula-ladder-live-owt-d384-l2-none-norc-nophi-sr2-tied es un modelo de lenguaje de investigación desarrollado por el autor independiente dimitarpg13 dentro de su programa "semsimula", que explora arquitecturas alternativas a los transformers basadas en mecánica lagrangiana y potenciales escalares. Este modelo concreto, denominado SR2-NP-T (tied embeddings), es la segunda rama entrenada del programa de productización de la generación 3 y responde a una pregunta de ablación muy específica: si es necesario mantener una cabeza de salida separada de la matriz de embeddings de entrada.

El modelo es un LM conservativo de 57,1 millones de parámetros con embeddings atados (una única matriz de 50.257 × 384 usada tanto como embedding de entrada como cabeza de salida), entrenado desde cero sobre OpenWebText con un presupuesto exacto de 532,48 millones de tokens. No es un transformer: carece de atención y emplea un integrador exacto (BAOAB) sobre un potencial gaussiano anisotrópico en un espacio de Fock, con geometría riemanniana (métrica de Jacobi). El resultado es una perplexity de validación de 59,35 en el bloque 512, un 1,44% peor que la variante con cabeza separada (SR2-NP, 58,51), lo que confirma empíricamente que la cabeza separada es necesaria.

Su relevancia es fundamentalmente metodológica: se trata de un estudio de ablación pre-registrado, con predicciones y umbrales fijados antes del entrenamiento, y con datos completos de salud del run (pasos, gradientes, memoria, tiempos). No está pensado para uso en producción, sino como evidencia reproducible sobre el diseño de arquitecturas conservativas de lenguaje.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LM conservativo no-transformer, sin atención; potencial escalar gaussiano anisotrópico en espacio de Fock, integrador exacto BAOAB, geometría riemanniana (métrica de Jacobi) |
| Parametros totales | 57.135.619 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (entrenado y evaluado con bloques de 512 tokens) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | cc-by-4.0 |
| Formato de pesos | PyTorch (repo de 0,5 GB; no se especifica safetensors ni GGUF) |

## Arquitectura y entrenamiento

El modelo pertenece a la familia SR2 (Semantic Simulation, generación 3) y sustituye el mecanismo de atención por una dinámica conservativa: cada token se sitúa en un paisaje de potencial escalar y la evolución del estado sigue una integración lagrangiana exacta mediante el esquema BAOAB, sobre una variedad con métrica de Jacobi. La variante "NP" (no pair force) elimina la fuerza de pares enrutada presente en SR2, y "T" indica que los embeddings de entrada y la cabeza de salida comparten una única matriz de 50.257 × 384; se conserva el sesgo de salida. Esta atadura reduce el recuento de parámetros en 19.298.688 (25%) respecto a SR2-NP.

El entrenamiento se realizó desde cero sobre OpenWebText, con exactamente 532.480.000 tokens (32.500 pasos × 32 de batch × 512 de bloque), mismo corpus, tokenizer y lotes de validación que el resto de brazos de la escalera. No se menciona RLHF ni DPO. El run se completó sin pasos omitidos ni disparos de watchdog; la norma global del gradiente superó 1,0 en 13 de 650 pasos registrados (máximo 2,16 en el paso 450, durante el warm-up), con 0,72 s por paso en una A100 de 40 GB y un pico de memoria de entrenamiento de 14,7 GB (19,0 GB con evaluación).

El experimento es un estudio pre-registrado: el autor fijó tres predicciones (TE1, TE2, TE3) antes del run. TE1 (perplexity dentro del 1% de SR2-NP) falló con 59,35 frente a 58,51; TE2 (no retorno del colapso de tokens raros) y TE3 (quintil más raro dentro de 0,5 nats de SR2-NP) acertaron. El análisis por frecuencia de token muestra que la brecha no aparece en la fase estable (media de −0,003 nats entre los pasos 1.625 y 21.125) sino en la fase de decaimiento (+0,015 nats de media en las últimas 14 evaluaciones), lo que el autor interpreta como un coste real de la atadura y no como ruido de evaluación.

## Capacidades

- Generación de texto autoregresiva en inglés, con pipeline `text-generation`.
- Modelado de lenguaje a nivel de token con evaluación de perplexity sobre OpenWebText.
- Razonamiento o codificación especializada: no disponible; no se documentan capacidades de código, matemáticas o vision.
- Tool calling / function calling: no soportado.
- Soporte de agentes o razonamiento multi-paso: no disponible.
- Capacidades multilingües: limitadas al inglés.
- Capacidades especiales: ninguna documentada (sin thinking mode, vision ni audio). El interés del modelo es exclusivamente como objeto de estudio de ablación arquitectónica.

## Casos de uso

- Investigación en arquitecturas alternativas al transformer: el modelo sirve como punto de comparación reproducible para estudiar si los mecanismos conservativos sin atención pueden modelar lenguaje a escala de ~57M de parámetros.
- Ablación de atadura de embeddings: permite medir directamente el coste en perplexity (+1,44%) de compartir la matriz de entrada y salida, con datos por fase de entrenamiento y por frecuencia de token.
- Reproducción de estudios pre-registrados: el diseño con predicciones fijadas antes del run y umbrales explícitos (TE1-TE3) es un ejemplo metodológico para investigadores que quieran replicar protocolos de validación rigurosos.
- Análisis de dinámica de entrenamiento: los datos de norma de gradiente, memoria, tiempo por paso y evolución de la perplexity por fase permiten estudiar estabilidad de integradores exactos en modelos de lenguaje.
- Docencia y divulgación: como caso concreto y acotado (57M de parámetros, 0,5 GB de repo) para explicar mecánica lagrangiana aplicada a LM, embeddings atados y evaluación por quintiles de frecuencia.
- Base para extensiones de la escalera semsimula: el modelo es un brazo de una familia con presupuesto de tokens y corpus idénticos, lo que facilita comparaciones controladas en futuros experimentos del autor.

## Benchmarks y rendimiento

Datos declarados por el autor en el model-index (no verificados de forma independiente):

| Benchmark | Metrica | Valor |
|---|---|---|
| OpenWebText (validation, block 512) | Perplexity asentada (media de las últimas tres evaluaciones de 500 pasos) | 59,35 |

Comparación interna de la escalera semsimula (mismos datos, schedule y semilla):

| Modelo | Cabeza de salida | Parametros | PPL asentada | vs GPT-2 |
|---|---|---:|---:|---:|
| Este modelo (SR2-NP-T) | atada | 57.135.619 | 59,35 | 1,192× |
| SR2-NP | separada | 76.434.307 | 58,51 | 1,175× |
| SR2 (con fuerza de pares) | separada | 76.572.110 | 58,32 | 1,171× |
| gpt2-matched | atada | no disponible | 49,81 | 1,000× |

Mejor PPL puntual: 57,22 en el paso 31.000 (SR2-NP: 56,71, también en el paso 31.000). Evolución de la perplexity de validación frente a SR2-NP: 533,39 vs 463,11 en el paso 500; 108,45 vs 108,04 en el 5.000; 82,03 vs 86,00 en el 10.000; 70,72 vs 70,39 en el 20.000; 66,68 vs 65,70 en el 25.000; 59,34 vs 58,29 en el 30.000.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 57,1M de parámetros en fp32 los pesos ocupan aproximadamente 0,23 GB, por lo que cabe holgadamente en cualquier GPU consumer moderna.
- GPU de entrenamiento documentada: una A100 de 40 GB, con 0,72 s por paso y pico de 14,7 GB (19,0 GB con evaluación).
- GPU consumer: sí cabe en RTX 3060, RTX 4060, RTX 4090 y similares para inferencia; el entrenamiento completo requeriría al menos ~19 GB, al alcance de una RTX 4090 (24 GB) o A100.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI; al ser un modelo PyTorch con arquitectura no estándar y sin atención, es probable que requiera código propio del autor en lugar de los runners convencionales (no confirmado en la información disponible).
- Latencia y throughput: no disponibles para inferencia; solo se documenta el coste de entrenamiento (0,72 s por paso).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | PPL (OWT val, block 512) | Licencia | Disponibilidad |
|---|---:|---|---:|---|---|
| semsimula SR2-NP-T (este) | 57,1M | no disponible (bloques de 512) | 59,35 | cc-by-4.0 | Hugging Face |
| semsimula SR2-NP | 76,4M | no disponible (bloques de 512) | 58,51 | no disponible | Hugging Face |
| semsimula SR2 | 76,6M | no disponible (bloques de 512) | 58,32 | no disponible | Hugging Face |
| semsimula gpt2-matched | no disponible | no disponible | 49,81 | no disponible | Hugging Face |

No se dispone de comparación con modelos de la misma categoría fuera de la familia semsimula (por ejemplo, GPT-2 pequeño) más allá del factor 1,192× frente a GPT-2 que reporta el autor; no se detalla la configuración exacta de esa referencia.

## Limitaciones y advertencias

- Modelo exclusivamente de investigación: no está pensado ni validado para uso en producción, atención al cliente ni generación de código.
- Solo inglés; sin capacidades multilingües documentadas.
- Perplexity de 59,35 en OpenWebText, un 19,2% peor que el brazo gpt2-matched de la propia escalera (49,81), lo que sitúa su calidad de modelado por debajo de una referencia tipo GPT-2 emparejada.
- Riesgo de alucinación: no evaluado en la información disponible; al ser un LM entrenado solo con objetivo de modelado, es esperable, pero no hay datos concretos.
- Sesgos: no documentados; OpenWebText es un corpus web con los sesgos habituales de ese tipo de datos.
- Licencia CC-BY-4.0: permite uso comercial con atribución, pero el modelo no ha sido validado para tales fines y su calidad no lo hace recomendable.
- La arquitectura no estándar (sin atención, integrador BAOAB, métrica de Jacobi) implica que las herramientas habituales de inferencia y cuantización pueden no ser compatibles.
- El resultado principal es negativo por diseño (TE1 falló): la atadura de embeddings cuesta 1,44% de perplexity, por lo que el autor mantiene la cabeza separada en el núcleo de la generación 3.
- Datos de benchmarks no verificados de forma independiente (`verified: false` en el model-index).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dimitarpg13/semsimula-ladder-live-owt-d384-l2-none-norc-nophi-sr2-tied
- Modelo SR2-NP (variante con cabeza separada): https://huggingface.co/dimitarpg13/semsimula-ladder-live-owt-d384-l2-none-norc-nophi-sr2
- Modelo SR2 (con fuerza de pares): https://huggingface.co/dimitarpg13/semsimula-ladder-live-owt-d384-l2-none-norc-sr2
- Brazo gpt2-matched: https://huggingface.co/dimitarpg13/semsimula-ladder-owt-d384-l2-gpt2-matched
- Colección Gen 3: https://huggingface.co/collections/dimitarpg13/semantic-simulation-gen-3-cfc-baoab-live-gradients-6abf371ea3c83f127057020c
- Nota de la etapa 3b (setup y scoring): https://github.com/dimitarpg13/semsimula-paper/blob/main/companion_notes/productization/Stage3b_SR2_NP_Tied_Embeddings.md
- Dataset OpenWebText: https://huggingface.co/datasets/Skylion007/openwebtext
