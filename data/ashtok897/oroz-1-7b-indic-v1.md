# ashtok897/oroZ-1.7B-Indic-v1

## Resumen

oroZ-1.7B-Indic-v1 es un modelo de lenguaje base de 1.720 millones de parámetros (1,41B en capas del transformer, con embeddings de entrada y salida atados) entrenado desde cero, con inicialización aleatoria y sin pesos heredados de Qwen, por el autor ashtok897. Emplea la arquitectura Qwen3 (transformer decoder-only de 28 capas, dimensión oculta 2048, 16 cabezas de atención y 8 cabezas KV) y un tokenizador BPE byte-level de 152.012 tokens reentrenado específicamente para escrituras índicas, con el objetivo de reducir la fertilidad de tokens en lenguas como el telugu, el tamil o el maratí.

El modelo cubre 14 idiomas (inglés y 13 lenguas índicas: hindi, bengalí, telugu, maratí, tamil, urdu, kannada, malayalam, gujarati, nepalí, panyabí, odia y asamés) y se entrenó sobre el dataset ashtok897/indic-hplt-v2, derivado de HPLT v3, con 34,6 millones de documentos y aproximadamente 38,9B tokens disponibles con este tokenizador. La ejecución consumió 25,2B tokens en 48.000 pasos, es decir, en torno al 65% de una época, sobre 2 GPU NVIDIA L40 durante unos 19 días.

Es relevante ahora porque demuestra que es viable entrenar desde cero un modelo multilingüe índico con recursos modestos y licencia Apache 2.0, y porque documenta de forma transparente una mejora sustancial del tokenizador (de ~87B a ~38,9B tokens sobre el mismo corpus, un 55% menos) gracias al reentrenamiento del vocabulario. No obstante, es un modelo base sin ajuste de instrucciones ni alineamiento de seguridad, con contexto de entrenamiento de solo 2.048 tokens y considerado infraentrenado según los estándares actuales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3 decoder-only transformer, 28 capas, hidden size 2048, 16 cabezas de atención, 8 cabezas KV |
| Parametros totales | 1,72B (1,41B en capas del transformer; embeddings atados; el repo reporta ~2,03B por la copia de la matriz de salida) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 2.048 tokens (longitud de entrenamiento) |
| Tipos de cuantizacion | No disponible (el repo publica pesos en bfloat16; no se documentan GGUF ni otras cuantizaciones) |
| Idiomas soportados | en, hi, bn, te, mr, ta, ur, kn, ml, gu, ne, pa, or, as (14 idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Qwen3 en configuración densa: transformer decoder-only de 28 capas con atención de 16 cabezas y 8 cabezas KV (GQA), dimensión oculta 2048 y embeddings de entrada y salida atados. El tokenizador es un BPE byte-level de 152.012 tokens entrenado desde cero sobre una muestra equilibrada de 40.000 documentos por idioma (560.000 en total), conservando el pre-tokenizador y los tokens especiales de Qwen3. Las filas de embedding se rellenan a 152.064 (52 filas de padding sin uso) por eficiencia. El entrenamiento se realizó en bfloat16 con Megatron-Bridge (contenedor NeMo), paralelismo tensorial 1, pipeline 1 y datos 2, sobre 2 GPU NVIDIA L40 del clúster Julia HPC de la Universidad de Würzburg.

El corpus de entrenamiento es ashtok897/indic-hplt-v2, construido a partir de HPLT v3, ya limpio y deduplicado: 34,6 millones de documentos y ~38,9B tokens con este tokenizador. La ejecución alcanzó 48.000 pasos con batch global de 256 secuencias × 2.048 tokens (25,2B tokens vistos, ~65% de una época). Se usó AdamW (β2 0,95), LR pico 3e-4 con decaimiento coseno hasta 3e-5, 2.000 pasos de warmup, weight decay 0,033 y clipping de gradiente 1,0. La innovación técnica destacable no está en la arquitectura sino en el tokenizador: frente al tokenizador base de Qwen3, que fragmenta el texto índico en muchos trozos byte-level (hasta ~15 tokens por palabra en telugu), el nuevo vocabulario reduce la fertilidad a 5,25 en telugu, 4,25 en tamil, 3,60 en maratí, 2,33 en bengalí y 2,25 en hindi, con un 1,00 en urdu e inglés. El autor advierte como limitación conocida que el pre-tokenizador heredado de Qwen3 corta palabras en signos vocálicos y viramas (marcas combinantes Unicode) antes de que actúe el BPE, de modo que la fertilidad ya está en ese suelo y no puede bajar sin cambiar la regex del pre-tokenizador. El run se encadenó automáticamente entre trabajos SLURM de 24 horas reanudando desde checkpoints cada 500 pasos. Existe una continuación del mismo entrenamiento, hasta 72.000 pasos (37,7B tokens), publicada como ashtok897/oroZ-1.7B-Indic-v2.

## Capacidades

- Generación de texto autoregresiva en 14 idiomas (inglés y 13 lenguas índicas), orientada a continuación de texto, no a seguir instrucciones.
- Modelo base: completa y continúa prompts de texto plano; no está ajustado para instrucciones ni para diálogo.
- Cobertura multilingüe con calidad variable entre idiomas, mayor esperanza en los de más recursos del corpus (hindi, bengalí, inglés) y menor en los de menos recursos.
- Tokenización eficiente de escrituras índicas gracias al vocabulario reentrenado, con menor coste en tokens por palabra que el tokenizador base de Qwen3.
- No dispone de tool calling ni function calling (no documentado ni entrenado para ello).
- No dispone de capacidades de agente ni de razonamiento multi-paso (modelo base sin alineamiento).
- No dispone de visión, audio ni modo de pensamiento (thinking mode).
- La plantilla de chat incluida se hereda de Qwen3 y no se usó durante el entrenamiento; el autor recomienda prompts de texto plano.

## Casos de uso

- Investigación en tokenización multilingüe: sirve como caso de estudio reproducible de cómo un vocabulario reentrenado reduce un 55% el número de tokens del corpus (de ~87B a ~38,9B), útil para experimentos de fertilidad y coste de entrenamiento en lenguas índicas.
- Punto de partida para fine-tuning supervisado (SFT) en lenguas índicas: al ser un modelo base Apache 2.0 de 1,7B, puede ajustarse con instrucciones o pares pregunta-respuesta para tareas concretas (resumen, extracción, clasificación) en hindi, bengalí, tamil u otras lenguas del conjunto.
- Generación de texto y completado en dominios de bajo riesgo: continuación de artículos, descripciones o textos de relleno en los idiomas cubiertos, aceptando la calidad irregular propia de un modelo infraentrenado.
- Experimentos de destilación o preentrenamiento a pequeña escala: su tamaño (1,72B) y su receta documentada (Megatron-Bridge, 2 GPU L40, 19 días) lo hacen útil como referencia para reproducir pipelines de entrenamiento desde cero en entornos académicos.
- Evaluación comparativa de modelos índicos: sirve como línea base para medir el efecto del tokenizador y del volumen de tokens frente a modelos más entrenados como Qwen3-1.7B o modelos índicos ajustados.
- Prototipado de aplicaciones de traducción o generación asistida en lengua índica con revisión humana obligatoria, dado que no hay alineamiento de seguridad ni garantías de fidelidad factual.
- Docencia y demostraciones de arquitectura Qwen3: al compartir arquitectura con Qwen3-1.7B pero con pesos aleatorios iniciales, permite ilustrar el impacto del vocabulario y de los datos en modelos multilingües.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que todavía no hay resultados de evaluación publicados.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: en torno a 3,5-4 GB solo para pesos (1,72B parámetros × 2 bytes); con caché KV y overhead de runtime, unos 5-6 GB para contextos cortos (2.048 tokens).
- VRAM estimada en cuantización de 8 bits: aproximadamente 2 GB para pesos; en 4 bits, alrededor de 1 GB (no se publican pesos cuantizados oficiales, sería necesario generarlos).
- GPU recomendadas para servicio: NVIDIA L40, A100 o H100 para despliegues con concurrencia; el propio entrenamiento usó 2 × L40.
- Cabe en GPU de consumo: sí, en tarjetas con 8 GB o más (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090) incluso en bfloat16, y en 4-6 GB con cuantización.
- Opciones de despliegue: transformers (soporte nativo, `AutoModelForCausalLM` con `dtype="bfloat16"`), text-generation-inference (el repo está marcado como compatible con endpoints), y previsiblemente llama.cpp/Ollama si se generan pesos GGUF, aunque no se documentan en el repo.
- Latencia y throughput estimados: no disponibles; no se publican mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas índicos | Licencia | Estado |
|---|---|---|---|---|---|
| oroZ-1.7B-Indic-v1 | 1,72B (denso) | 2.048 | 13 + inglés | Apache 2.0 | Base, 25,2B tokens vistos |
| Qwen3-1.7B | 1,7B (denso) | No disponible en la información proporcionada | Multilingüe general, tokenizador poco eficiente en índico | Apache 2.0 | Base e instruct, ampliamente entrenado |
| oroZ-1.7B-Indic-v2 | 1,72B (denso) | 2.048 | 13 + inglés | Apache 2.0 | Base, 37,7B tokens vistos (continuación del v1) |

La comparación cuantitativa de rendimiento no está disponible porque ninguno de los datos de benchmarks del v1 se ha publicado. Frente a Qwen3-1.7B, la diferencia principal documentada es el tokenizador: el de oroZ reduce la fertilidad en índico de forma drástica (por ejemplo, de 15,25 a 5,25 tokens por palabra en telugu), mientras que en inglés ambos se mantienen en 1,00. Frente a su propia continuación (v2), el v1 ha visto menos tokens (25,2B frente a 37,7B) y se espera, por tanto, peor calidad.

## Limitaciones y advertencias

- Modelo base sin ajuste de instrucciones: no sigue instrucciones de forma fiable; solo continúa texto.
- Sin alineamiento de seguridad: puede generar contenido dañino, sesgado o factualmente incorrecto presente en datos web.
- Infraentrenado según estándares actuales (25,2B tokens para 1,72B parámetros), con salidas toscas esperables, especialmente en lenguas de menos recursos.
- Contexto de entrenamiento de solo 2.048 tokens; entradas más largas no han sido probadas y el comportamiento es incierto.
- Cobertura limitada a los 14 idiomas de entrenamiento, con calidad desigual entre ellos.
- Sesgos derivados de datos web (HPLT v3), sin filtrado específico de sesgos documentado más allá de la limpieza y deduplicación del corpus.
- Riesgo de alucinación alto por tratarse de un modelo base pequeño y poco entrenado; no apto para decisiones de alto impacto sin evaluación y alineamiento adicionales.
- Limitación conocida del tokenizador: el pre-tokenizador heredado de Qwen3 corta en signos vocálicos y viramas, lo que fija un suelo de fertilidad que no puede reducirse sin cambiar la regex.
- La plantilla de chat incluida no se usó en entrenamiento; usarla puede degradar los resultados.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de garantías de calidad y seguridad hace necesario evaluar el modelo antes de cualquier despliegue en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ashtok897/oroZ-1.7B-Indic-v1
- Continuación del entrenamiento (v2): https://huggingface.co/ashtok897/oroZ-1.7B-Indic-v2
- Dataset de entrenamiento: https://huggingface.co/datasets/ashtok897/indic-hplt-v2
- Arquitectura y tokenizador base Qwen3: https://huggingface.co/Qwen/Qwen3-1.7B
- Proyecto HPLT (origen de los datos): https://hplt-project.org/
