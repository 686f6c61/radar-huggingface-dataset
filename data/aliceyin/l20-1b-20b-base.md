# AliceYin/L20-1B-20B-Base

## Resumen

L20-1B-20B-Base es un modelo de lenguaje causal en inglés de 1.100.048.384 parámetros (1,10B) entrenado desde inicialización aleatoria por el usuario AliceYin, sin partir de ningún checkpoint preentrenado de terceros. El nombre resume su propuesta: un transformer tipo Llama entrenado sobre 20.000 millones de tokens de predicción utilizando una única GPU NVIDIA L20 de 46 GB, lo que lo convierte en un ejercicio de eficiencia de cómputo más que en un modelo orientado a producto.

El modelo usa la arquitectura LlamaForCausalLM con 22 capas, dimensión oculta de 2.048, 32 cabezas de atención y 4 cabezas KV (GQA), MLP intermedio de 5.632 y una ventana de contexto de 2.048 tokens. El tokenizador BPE byte-level de 32.000 entradas también se entrenó desde cero. Es un modelo base de completado, no ajustado a instrucciones ni con alineamiento de preferencias o seguridad.

Su relevancia actual es metodológica: publica telemetría completa de entrenamiento (93,948 TFLOP/s de modelo, 71,17% de MFU estándar, 12.845 tokens/s), el conjunto de datos exacto con proporciones y filtros, y un estudio comparativo de 36 checkpoints frente a la familia TinyLlama con intervalos de confianza bootstrap. Es un artefacto útil para investigación sobre eficiencia de tokens, reproducibilidad y entrenamiento con presupuesto de una sola GPU, no para despliegues de producción conversacionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LlamaForCausalLM (transformer decoder-only, causal) |
| Parametros totales | 1.100.048.384 (1,10B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 2.048 tokens |
| Tipos de cuantizacion | No disponible; el repositorio solo publica pesos en safetensors FP32 (carga en BF16 recomendada) |
| Idiomas soportados | Ingles (en) |
| Licencia | No disponible |
| Formato de pesos | safetensors (FP32; tamano del repo 4,4 GB) |

Detalles adicionales de arquitectura publicados por el autor:

| Campo | Valor |
|---|---|
| Capas | 22 |
| Hidden size | 2.048 |
| Cabezas de atencion / cabezas KV | 32 / 4 (GQA) |
| Tamano intermedio del MLP | 5.632 |
| Vocabulario | 32.000, BPE byte-level |
| Codificacion posicional | RoPE, theta 10.000 |
| Weight tying | No |

## Arquitectura y entrenamiento

Se trata de un transformer decoder-only estándar con atención causal, normalización previa, RoPE con theta 10.000 y atención con consultas agrupadas (32 cabezas de consulta frente a 4 cabezas de clave/valor), sin atado de pesos entre la matriz de embeddings y la cabeza de salida. No incorpora innovaciones arquitectónicas como decodificación especulativa, atención lineal o capas SSM: la contribución está en el régimen de entrenamiento, no en la topología.

El entrenamiento consumió 19.999.703.040 tokens de predicción en 19.148 pasos de optimizador, con precisión mixta BF16, PyTorch SDPA compilado, AdamW fusionado, longitud de secuencia 2.048, micro-lote de 6, acumulación de gradiente de 85 y lote global efectivo de 510 secuencias. La tasa de aprendizaje usó 1.000 pasos de calentamiento y decaimiento coseno de 4e-4 a 4e-5. No hay RLHF ni DPO: es un modelo puramente preentrenado. La mezcla inglesa fue 42,5% FineWeb-Edu-Dedup (puntuación 4+), 42,5% DCLM-Baseline, 3% FineMath-4+ y 12% código Stack-Edu con licencias permisivas en Python, JavaScript, TypeScript, C++, y Java. Los documentos aceptados pasaron filtros de inglés y contenido, deduplicación exacta por SHA-256 sobre texto normalizado y un control de descontaminación de benchmarks por coincidencia de 13 palabras; las direcciones de correo y las IPv4 sintácticamente válidas de DCLM se anonimizaron de forma determinista. La lista original de descontaminación no incluía BoolQ, por lo que el autor añade un análisis de sensibilidad de seis tareas que excluye ese benchmark.

## Capacidades

- Generación de texto en inglés por completado de secuencia (modelo base, sin plantilla de instrucciones).
- Completado de código en Python, JavaScript, TypeScript, C++, y Java, fruto del 12% de corpus Stack-Edu en el preentrenamiento.
- Razonamiento matemático básico limitado, con un 3% de FineMath-4+ en la mezcla y un resultado de 1,67% en GSM8K 5-shot.
- Comprensión lectora y razonamiento de sentido común a nivel elemental (PIQA 69,59%, ARC-Easy 64,14% en 0-shot).
- Conocimiento factual y académico muy limitado: MMLU 5-shot de 25,31%.
- No dispone de soporte de tool calling ni function calling: es un modelo base sin ajuste.
- No dispone de capacidades de agente, razonamiento multi-paso guiado ni modo "thinking".
- No dispone de visión, audio ni modalidades adicionales.
- Capacidad multilingüe nula fuera del inglés, según la propia ficha del modelo.
- Acepta hidden states y logits para extracción de características, al ser un modelo transformers estándar.

## Casos de uso

- Estudio de eficiencia de cómputo y reproducibilidad: el repositorio incluye telemetría de GPU, hiperparámetros completos y el pipeline de datos, de modo que un grupo de investigación puede replicar el entrenamiento en una sola L20 o comparar su propia receta contra esta referencia concreta.
- Modelo de referencia para estudios de escalado: con 1,10B parámetros y 20.000 millones de tokens, sirve como punto de la curva de asignación óptima de cómputo (Chinchilla) y como base para ablaciones sobre composición del dataset.
- Ajuste fino supervisado para tareas de dominio cerrado: clasificación de textos, extracción de entidades o etiquetado, donde el coste de adaptar un modelo de 1,1B es mucho menor que el de uno de 7B y la ventana de 2.048 tokens cubre documentos cortos.
- Destilación y anotación de datos a gran escala: al ser pequeño y barato de ejecutar, puede puntuar o generar etiquetas preliminares sobre corpus masivos antes de un filtrado con un modelo mayor.
- Autocompletado de código en entornos con recursos limitados: el 12% de código en el preentrenamiento en cinco lenguajes permite usarlo como base para un modelo de completado de línea o bloque, tras un ajuste fino específico del repositorio de destino.
- Docencia y prácticas de entrenamiento desde cero: es un caso completo y documentado de tokenizador propio más preentrenamiento en una única GPU, adecuado para cursos de aprendizaje automático que quieran reproducir el ciclo completo.
- Generación de texto sintético controlado para aumento de datos: con decodificación por muestreo (temperatura y top-p) puede producir continuaciones de estilo homogéneo para ampliar corpus pequeños, asumiendo revisión humana posterior.
- Despliegue en hardware de borde con fines de demostración: con 1,1B parámetros cabe en GPU de 4-6 GB en BF16, lo que permite prototipos en portátiles o tarjetas integradas sin cuantización agresiva.

## Benchmarks y rendimiento

Evaluación externa con lm-eval 0.4.9, precisión BF16, contexto máximo 2.048 y semillas fijas. Pérdida de validación final retenida: 2,4247; perplejidad: 11,2990.

| Tarea | Shots | Metrica | Resultado |
|---|---:|---|---:|
| ARC-Challenge | 0 | acc_norm | 33,62% |
| ARC-Easy | 0 | acc_norm | 64,14% |
| HellaSwag | 0 | acc_norm | 45,13% |
| OpenBookQA | 0 | acc_norm | 35,00% |
| PIQA | 0 | acc_norm | 69,59% |
| WinoGrande | 0 | acc | 52,17% |
| BoolQ | 0 | acc | 59,17% |
| LAMBADA OpenAI | 0 | acc | 46,26% |
| TruthfulQA MC2 | 0 | acc | 36,91% |
| MMLU | 5 | acc | 25,31% |
| GSM8K | 5 | flexible exact match | 1,67% |

Macro primaria de siete tareas (HellaSwag, PIQA, WinoGrande, OpenBookQA, ARC-Easy, ARC-Challenge y BoolQ): 51,2601%. Excluyendo BoolQ: 49,9411%. Bajo el mismo protocolo congelado de siete tareas, el autor compara con la familia TinyLlama:

| Comparacion | Diferencia (pp) | IC 95% bootstrap |
|---|---:|---|
| Frente a TinyLlama 1T | +1,0182 | [+0,1584, +1,8860] |
| Frente a TinyLlama 1.5T | +0,0910 | [-0,7771, +0,9745] |
| Frente a TinyLlama 2T | -0,3019 | [-1,1978, +0,5871] |
| Frente a TinyLlama 2.5T | -2,6317 | [-3,4891, -1,8006] |

Los intervalos cubren únicamente la incertidumbre de muestreo de los ítems de benchmark, no la varianza de semilla de entrenamiento, y no están ajustados por comparaciones múltiples. El estudio completo de 36 checkpoints incluye tanto victorias como derrotas y no debe leerse como un censo global ni como una afirmación de liderazgo universal en eficiencia por token.

Telemetría de entrenamiento (instantánea en el paso 10.595, no promedio del ciclo completo):

| Metrica | Valor |
|---|---:|
| Throughput | 12.845 tokens/s |
| FLOP/s de modelo | 93,948 TFLOP/s |
| MFU estándar | 71,17% (denominador de pico BF16 de 132 TFLOP/s) |
| Utilizacion de GPU | 100% |
| VRAM | 45.265 / 46.068 MiB |
| Potencia | 348,3 W |

Preflight de 60 pasos con el micro-lote seleccionado: 12.586 tokens/s y 36,13 GiB de memoria máxima asignada. El micro-lote 8 se descartó tras un fallo por falta de memoria.

## Requisitos de hardware

- VRAM estimada para inferencia, calculada a partir de los 1,10B parámetros (estimación propia, el autor no publica cifras de inferencia): ~4,4 GB en FP32, ~2,2 GB en BF16/FP16, ~1,1 GB en INT8 y ~0,6 GB en INT4, más caché KV.
- Caché KV: con GQA de 4 cabezas KV y dimensión de cabeza 64, cada token consume unos 22 KiB adicionales por capa agregada, alrededor de 45 MiB para los 2.048 tokens de contexto. Es un coste marginal.
- GPU recomendadas: cualquier GPU moderna con al menos 4 GB de VRAM. Cabe en RTX 3060, RTX 4060, RTX 4090, y también en A100, H100 o L4 para despliegues en servidor.
- Inferencia en CPU: viable en BF16 o, mejor, tras conversión a un formato de cuantización de 8 o 4 bits, dado el reducido tamaño del modelo.
- Opciones de despliegue: `transformers` con `AutoModelForCausalLM` (ruta documentada por el autor), text-generation-inference (el repositorio incluye la etiqueta `text-generation-inference` y `endpoints_compatible`) y vLLM, aunque el autor no documenta explícitamente ninguna de estas dos últimas. Para llama.cpp u Ollama sería necesaria una conversión a GGUF que el repositorio no proporciona.
- La carga en BF16 reduce sustancialmente el uso de memoria respecto al checkpoint FP32 publicado.
- Latencia y throughput de inferencia: no disponible. El único dato de rendimiento publicado es de entrenamiento (12.845 tokens/s en una L20).

## Comparativa con modelos similares

La información proporcionada solo permite comparar, y de forma parcial, con los checkpoints de la familia TinyLlama citados en la model card. No se dispone de datos de otros modelos comparables.

| Modelo | Parametros | Contexto | Macro 7 tareas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| L20-1B-20B-Base | 1.100.048.384 | 2.048 | 51,2601% | No disponible | HuggingFace, safetensors FP32 |
| TinyLlama 1T | No disponible en la informacion proporcionada (referido como 1T) | No disponible | 1,0182 pp por debajo de L20-1B-20B-Base | No disponible | No disponible |
| TinyLlama 1.5T | No disponible (referido como 1.5T) | No disponible | Diferencia de +0,0910 pp a favor de L20-1B-20B-Base (empate estadistico) | No disponible | No disponible |
| TinyLlama 2T | No disponible (referido como 2T) | No disponible | Diferencia de -0,3019 pp (empate estadistico) | No disponible | No disponible |
| TinyLlama 2.5T | No disponible (referido como 2.5T) | No disponible | Diferencia de -2,6317 pp en contra de L20-1B-20B-Base | No disponible | No disponible |

La comparación debe interpretarse en el contexto del estudio: es un conjunto de candidatos congelado, no un censo exhaustivo, y el propio autor advierte que contiene tanto victorias como derrotas.

## Limitaciones y advertencias

- No está ajustado a instrucciones, preferencias ni seguridad. No debe emplearse como asistente conversacional ni como autoridad factual.
- Riesgo elevado de alucinación, repetición de texto y generación de contenido sesgado o dañino, según reconoce el propio autor.
- No debe utilizarse como decisor autónomo en entornos de producción.
- Enfocado exclusivamente al inglés; sin capacidad multilingüe.
- Ventana de contexto de solo 2.048 tokens, insuficiente para documentos largos, conversaciones extensas o análisis de repositorios completos.
- Rendimiento muy débil en matemáticas multi-paso: 1,67% en GSM8K 5-shot, lo que descarta su uso en tareas aritméticas o de razonamiento cuantitativo.
- La puntuación de MMLU 5-shot (25,31%) requirió truncamiento por la izquierda en algunos ejemplos debido al límite de contexto, por lo que debe interpretarse con cautela y no es directamente comparable con evaluaciones de contexto largo.
- La licencia no está publicada en el repositorio, lo que impide determinar si el uso comercial está permitido. Cualquier despliegue en producción debería aclarar este punto con el autor antes de proceder.
- El modelo no incluye artefactos de cuantización ni conversiones a GGUF, por lo que su uso en llama.cpp u Ollama exige un trabajo previo de conversión y validación.
- El control de descontaminación no cubría BoolQ inicialmente, de modo que las cifras de esa tarea y la macro de siete tareas incorporan un análisis de sensibilidad específico.
- Los intervalos de confianza publicados no contemplan la varianza entre semillas de entrenamiento ni ajustes por comparaciones múltiples.
- La telemetría de entrenamiento es una instantánea puntual, no un promedio del ciclo completo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/AliceYin/L20-1B-20B-Base
- Metricas finales de benchmark (JSON): https://huggingface.co/AliceYin/L20-1B-20B-Base/blob/main/evaluation/final-benchmarks.json
- Comparativa completa de 36 checkpoints: https://huggingface.co/AliceYin/L20-1B-20B-Base/blob/main/evaluation/efficiency-all-results.md
- Telemetria de GPU y artefactos de entrenamiento: https://huggingface.co/AliceYin/L20-1B-20B-Base/tree/main/training
- Grafico de frontera de eficiencia de computo: https://huggingface.co/AliceYin/L20-1B-20B-Base/resolve/main/assets/efficiency-frontier-clean.png
- Paper, blog o repositorio adicional: no disponible. La busqueda web realizada no devolvio resultados relacionados con el modelo (unicamente hilos de foro sobre vehiculos Mercedes-Benz, sin relacion con este artefacto).
