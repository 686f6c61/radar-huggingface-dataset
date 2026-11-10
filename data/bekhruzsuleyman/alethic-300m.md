# bekhruzsuleyman/alethic-300m

## Resumen

Alethic-300M es un par de modelos de lenguaje decoder-only de 302.908.416 parámetros cada uno, desarrollados por Bekhruz Suleyman y publicados como checkpoint de investigación. El objetivo del proyecto no es ofrecer un asistente funcional, sino responder a una pregunta técnica concreta: si Sin-Gated Control Attention (SGCA) supera a grouped-query attention (GQA) con el mismo número de parámetros y los mismos datos de entrenamiento. La respuesta, a 1.000 millones de tokens, es negativa.

Ambos modelos comparten arquitectura base: 24 capas, dimensión de modelo 1024, 16 cabezas de consulta y 4 de clave-valor (head_dim 64), RoPE, feed-forward SwiGLU, contexto de 4096 tokens y embeddings atados con vocabulario de 50.000 unidades. La diferencia está en el mecanismo de atención y en el ancho del FFN, ajustado para igualar el recuento total de parámetros.

El modelo es relevante por su valor metodológico: documenta de forma reproducible un experimento de ablación con métricas de validación (bits per byte), análisis de velocidad y desglose de la contribución de cada componente al gap observado. No es apto para producción: no está ajustado a instrucciones y solo ha visto 3,3 tokens por parámetro, frente a los aproximadamente 20 de un entrenamiento compute-optimal.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con atención GQA (variante SGCA en el modelo experimental) |
| Parámetros totales | 302.908.416 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 4096 tokens |
| Tipos de cuantización | no disponible |
| Idiomas soportados | inglés (en), uzbeko (uz) |
| Licencia | MIT |
| Formato de pesos | no disponible en la información proporcionada |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only de 24 capas con d_model 1024, 16 cabezas de consulta y 4 cabezas KV (head_dim 64), RoPE, SwiGLU y embeddings atados. El vocabulario de 50.000 tokens usa SentencePiece Unigram con byte fallback. El modelo GQA emplea un FFN de dimensión oculta 2560; el modelo SGCA reduce ese FFN a 2218 para compensar el coste paramétrico de su puerta de atención, que añade 1.050.624 parámetros por capa. La puerta sustituye el camino residual directo de la atención por C = (W_g H + b) ⊙ (α ⊙ sin A), con α un vector por canal inicializado a 1.0.

El entrenamiento se realizó desde cero sobre 1.000.013.824 tokens (15.259 pasos de 65.536 tokens), en precisión bf16, con learning rate pico de 4e-4, warmup de 763 pasos y decaimiento coseno hasta 4e-5, semilla 1234 y una sola H100 en Modal (aproximadamente 1,9 horas por ejecución). Los datos combinan StarCoderData (Python y otros siete lenguajes), FineWeb-Edu, OpenWebMath y FineWeb-2 en uzbeko (latino y cirílico). La validación retenida consta de 1.017.192 tokens de las seis fuentes. No se aplicó RLHF ni DPO: es un modelo base sin ajuste por preferencias.

## Capacidades

- Generación de texto autoregresiva en inglés y uzbeko (latino y cirílico).
- Modelado de código en Python y otros siete lenguajes presentes en StarCoderData.
- Razonamiento matemático básico derivado de OpenWebMath.
- Modelado de lenguaje general con datos educativos de FineWeb-Edu.
- No dispone de soporte de tool calling ni function calling.
- No dispone de capacidades de agente ni razonamiento multi-paso entrenado.
- No dispone de visión, audio ni modo de pensamiento (thinking mode).
- No está ajustado a instrucciones; requiere penalización de repetición (1.15) y regla no-repeat 4-gram para evitar bucles.

## Casos de uso

- Investigación en mecanismos de atención: replicar o extender el experimento SGCA vs GQA usando los checkpoints y logs publicados para validar la metodología de ablación con parámetros y datos igualados.
- Estudio de eficiencia arquitectónica: analizar el coste paramétrico y de throughput de una puerta de atención frente a GQA, con datos medidos (SGCA un 6,8% más lento que GQA a igualdad de FLOPs por token).
- Evaluación de modelos base de pequeño tamaño: usar el checkpoint como línea base de 300M parámetros en experimentos de scaling laws o de curricula de datos.
- Modelado de uzbeko: probar la cobertura del tokenizador y del modelo en texto uzbeko en latino y cirílico, que representa aproximadamente el 10% de la mezcla planificada.
- Generación de código exploratoria: evaluar la perplejidad en Python y otros lenguajes como referencia para comparar tokenizadores o mezclas de datos, no para autocompletado en producción.
- Docencia y formación: ilustrar en un curso o taller cómo se diseña un experimento controlado de arquitectura con métricas de validación y análisis de curvas de entrenamiento.
- Reproducibilidad de entrenamiento: reutilizar los shards tokenizados, el tokenizador alethic-tokenizer-v1 y los configs del repositorio para reproducir la ejecución en hardware similar.

## Benchmarks y rendimiento

Los únicos datos publicados son bits per byte (BPB) en validación a 1.000 millones de tokens, no puntuaciones de benchmarks de tareas.

| Modelo | BPB global | Diferencia vs GQA |
|---|---|---|
| GQA | 0,806841 | referencia |
| GQA-narrow (ablación) | 0,811015 | +0,004174 |
| SGCA | 0,847203 | +0,040362 |

| Fuente | GQA-narrow | SGCA | GQA |
|---|---|---|---|
| python | 0,5725 | 0,6074 | 0,5696 |
| code_other | 0,6506 | 0,6953 | 0,6465 |
| fineweb_edu | 0,9821 | 1,0138 | 0,9766 |
| math | 1,0533 | 1,0946 | 1,0494 |
| uzbek_latn | 1,1597 | 1,2029 | 1,1547 |
| uzbek_cyrl | 0,7649 | 0,7999 | 0,7617 |

Rendimiento de entrenamiento (mediana de throughput): GQA 148.948 tokens/s, GQA-narrow 153.023 tokens/s, SGCA 138.834 tokens/s. El análisis del autor atribuye aproximadamente el 90% del gap (0,0362 BPB) a la puerta y solo el 10% (0,004174 BPB) al FFN más estrecho. Las curvas de validación se cruzan en torno a 145 millones de tokens: SGCA iba 0,14 BPB por delante a 66 millones y después su pérdida decae un 14% más despacio que la de GQA. No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 0,6 GB solo para pesos (302,9M parámetros × 2 bytes), más overhead de activaciones y caché KV; en la práctica, entre 1,5 y 3 GB según longitud de contexto y batch.
- En cuantización de 8 bits, los pesos ocuparían unos 0,3 GB; en 4 bits, unos 0,15 GB. No se han publicado cuantizaciones oficiales.
- GPU recomendadas: cualquier GPU consumer moderna con al menos 8 GB (RTX 3060, RTX 4060, RTX 4090) es suficiente; para entrenamiento, el autor usó una H100.
- Cabe holgadamente en GPU consumer, incluidas integradas con suficiente memoria compartida para cuantizaciones agresivas.
- Opciones de despliegue: no se especifican en la model card; al ser un transformer estándar con RoPE y SwiGLU, es compatible en principio con llama.cpp, Ollama, vLLM y TGI, aunque no hay conversión oficial publicada.
- Latencia y throughput de inferencia: no disponibles. El único dato de throughput es de entrenamiento (138.834 a 148.948 tokens/s según variante).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| Alethic-300M (GQA/SGCA) | 302,9M | 4096 | MIT | Investigación de atención, base sin instrucciones | Hugging Face, 0 descargas |
| GPT-2 small | 124M | 1024 | MIT | Base generalista | Ampliamente disponible |
| Pythia-410M | 410M | 2048 | Apache 2.0 | Base de investigación con checkpoints intermedios | Ampliamente disponible |
| SmolLM-360M | 360M | 2048 | Apache 2.0 | Base/instruido de pequeño tamaño | Ampliamente disponible |

La comparación con alternativas consolidadas es desfavorable en madurez: Alethic-300M no ha sido evaluado en benchmarks de tareas, no tiene cuantizaciones publicadas ni pipeline declarado, y su entrenamiento es deliberadamente corto (3,3 tokens por parámetro). Su interés es experimental, no competitivo.

## Limitaciones y advertencias

- Solo 1.000 millones de tokens de entrenamiento: un run compute-optimal vería aproximadamente 20 tokens por parámetro. El propio autor estima en un 10-15% la probabilidad de que SGCA remonte en su forma actual con un entrenamiento más largo, y lo califica como juicio, no como resultado.
- No está ajustado a instrucciones: las muestras pueden repetirse sin penalización de repetición (1.15) y regla no-repeat 4-gram.
- El conjunto de validación es pequeño (aproximadamente 1 millón de tokens) y la métrica es BPB, no precisión en benchmarks.
- Una sola semilla por modelo: el ruido entre ejecuciones es de aproximadamente 0,003 BPB, por lo que solo el gap de SGCA queda claramente fuera de ese margen.
- Cobertura idiomática limitada a inglés y uzbeko; la calidad fuera de esos idiomas y del código no se midió. El uzbeko representa aproximadamente el 10% de la mezcla planificada.
- Riesgo de alucinación y de texto incoherente alto por tratarse de un modelo base de 300M con entrenamiento corto; no debe usarse en producción sin ajuste y evaluación adicionales.
- Licencia MIT: permite uso comercial, pero el modelo no ofrece garantías de calidad ni de seguridad.
- El checkpoint de la ablación GQA-narrow no está en el repositorio; sus cifras provienen solo de los logs.
- No se han publicado evaluaciones de sesgo, toxicidad ni robustez.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/bekhruzsuleyman/alethic-300m
- Write-up completo con gráficas: https://bekhruz.org/alethic
- Dataset StarCoderData: https://huggingface.co/datasets/bigcode/starcoderdata
- Dataset FineWeb-Edu: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Dataset OpenWebMath: https://huggingface.co/datasets/open-web-math/open-web-math
- Dataset FineWeb-2: https://huggingface.co/datasets/HuggingFaceFW/fineweb-2
