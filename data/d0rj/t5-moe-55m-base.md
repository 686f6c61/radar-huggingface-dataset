# d0rj/t5-moe-55M-base

## Resumen

t5-moe-55M-base es un modelo de lenguaje encoder-decoder de tipo T5 con mezcla de expertos (MoE), desarrollado por el usuario d0rj como parte de un experimento de ablación de modelos diminutos ("Tiny llm ablation"). Cuenta con 54.858.272 parámetros totales (54,86 M) y fue entrenado desde cero sobre 3.932.160.000 tokens de FineWeb-Edu, con el objetivo UL2 y enrutamiento top-2 sobre 8 expertos por capa MoE. No es un modelo de propósito general orientado a producto, sino una pieza de investigación reproducible sobre arquitecturas T5-MoE de escala muy reducida.

El modelo sigue la inspiración arquitectónica de yandex/AliceAI-T5-35B-A0.6B y reutiliza el tokenizador de q-project/Q-50M-Base (32.768 IDs originales más 3 tokens de modo y 512 centinelas, hasta 33.283 entradas). La ventana de entrenamiento es de bloques de 2.048 tokens, con una longitud máxima de encoder de 2.050 tokens incluyendo tokens de control. Los pesos se distribuyen en formato safetensors con código personalizado (alicet5_moe), lo que obliga a confiar en la implementación del repositorio para cargarlos.

Su relevancia actual es acotada pero concreta: sirve como referencia pública de bajo coste computacional para estudiar enrutamiento MoE, objetivos de denoising tipo UL2 y el efecto del preentrenamiento desde cero en modelos por debajo de 100 M de parámetros. La licencia no está declarada y solo se soporta inglés, por lo que su uso en producción comercial es arriesgado sin aclaración previa del autor.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder tipo T5 con capas MoE (alicet5_moe) |
| Parámetros totales | 54.858.272 (safetensors); la model card cita 54.858.240 |
| Parámetros activos | no disponible (MoE con 8 expertos por capa y enrutamiento top-2; el autor no publica el desglose de parámetros activos) |
| Longitud de contexto | 2.048 tokens por bloque de entrenamiento; máximo de encoder 2.050 tokens incluyendo tokens de control; longitud de decoder no disponible |
| Tipos de cuantización | no disponible (solo se publican pesos en FP32/safetensors; no hay GGUF, AWQ ni GPTQ) |
| Idiomas soportados | inglés (en) |
| Licencia | no disponible |
| Formato de pesos | safetensors (requiere custom_code: alicet5_moe) |

Datos adicionales relevantes: 6 capas de encoder y 6 de decoder, anchura 512; atención de 8 cabezas en el encoder y 8 cabezas de consulta / 2 de clave-valor en el decoder; anchura de experto 160; RoPE, RMSNorm, residuales en FP32 y embeddings compartidos atados. Tamaño del repositorio: 0,2 GB. Vocabulario: 33.283 entradas. Descargas y likes en HuggingFace: 0 en la fecha de la consulta.

## Arquitectura y entrenamiento

La arquitectura es un encoder-decoder de 6+6 capas con anchura 512 y atención multi-cabeza asimétrica (8 cabezas en el encoder frente a 8 consultas / 2 claves-valor en el decoder, un esquema de atención tipo GQA). Cada capa MoE aloja 8 expertos de anchura 160 con enrutamiento top-2. Se emplean RoPE, RMSNorm, residuales en FP32 y embeddings compartidos y atados. El tokenizador procede de q-project/Q-50M-Base, conservando los 32.768 IDs originales y añadiendo 3 tokens de modo y 512 centinelas (33.283 entradas totales). La inicialización de pesos fue aleatoria, sin destilación ni reutilización de pesos preentrenados.

El entrenamiento usó FineWeb-Edu (subset sample-10BT) leído desde shards Parquet locales con un búfer de mezcla de 100.000. El objetivo es UL2 con siete denoisers equiprobables: R(15 %, span medio 3/8), S(sufijo), X(50 %,3), X(50 %,8), X(15 %,64) y X(50 %,64); el denoiser S enmascara un sufijo de longitud uniforme entre 1 y L/2. Se añade una pérdida auxiliar de enrutador con coeficiente 0,01. El lote efectivo es de 16 secuencias × 8 de acumulación × 2.048 tokens = 262.144 tokens fuente por paso, durante 15.000 pasos, lo que da los 3.932.160.000 tokens procesados (bloques de entrada, no texto único ni tokens objetivo supervisados). El optimizador es Fused AdamW con LR máximo 0,001, betas (0,9; 0,95), weight decay 0,1 (sin decay en sesgos, normas y parámetros 1D), recorte de gradiente 1,0, calentamiento lineal de 150 pasos y decaimiento coseno hasta el 10 % del LR máximo. El cómputo se hizo en BF16 sobre una única RTX 5070 Ti de 16 GB (semilla 2026), conservando los checkpoints pesos en FP32.

## Capacidades

- Generación de texto en inglés mediante el esquema text2text-generation (entrada codificada y salida decodificada), no como modelo causal puro.
- Capacidad de continuación y puntuación de verosimilitud (evaluado en tareas de elección múltiple zero-shot con lm-eval 0.4.12).
- Reconstrucción y denoising de texto en varias modalidades UL2 (R, S y X con distintos spans), aprendidas durante el preentrenamiento.
- Modelo base: no incorpora ajuste por instrucciones, RLHF ni DPO, por lo que no sigue instrucciones de forma fiable sin fine-tuning posterior.
- No hay evidencia en la información disponible de soporte de tool calling, function calling, uso de agentes, modo de razonamiento explícito, visión ni audio.
- Multilingüismo: únicamente inglés declarado; no se documentan capacidades en castellano ni en otros idiomas.
- Uso de tokens de control (3 tokens de modo y 512 centinelas) a través del tokenizador heredado de Q-50M-Base.

## Casos de uso

- Estudio de ablación de arquitecturas MoE a pequeña escala: el modelo permite comparar configuraciones de número de expertos, anchura de experto y política de enrutamiento con un coste de entrenamiento bajo (15.000 pasos en una sola GPU de 16 GB).
- Reproducción de experimentos UL2: sus siete denoisers documentados y su pérdida auxiliar de enrutador (0,01) lo convierten en una base reproducible para estudiar objetivos de denoising, spans y sufijos en corpus de tamaño medio.
- Investigación sobre tokenizadores: al reutilizar el vocabulario de Q-50M-Base con 32.768 IDs más tokens de control y centinelas, sirve para analizar el efecto de añadir tokens especiales en modelos encoder-decoder diminutos.
- Fine-tuning para tareas concretas de PLN en inglés: clasificación de texto, resumen extractivo o respuesta a preguntas sobre pasajes cortos, siempre que el contexto necesario quepa en los 2.048 tokens de bloque.
- Generación de datos sintéticos a pequeña escala: puede usarse como generador de continuaciones o reformulaciones en inglés para aumentar datasets de entrenamiento de modelos mayores, con validación humana posterior por su baja precisión.
- Prototipado educativo y docencia: su tamaño (0,2 GB de repositorio) permite cargarlo, inspeccionar el enrutamiento MoE y depurar en un portátil con recursos limitados.
- Baseline de comparación en pipelines de evaluación: con los resultados zero-shot ya publicados (HellaSwag, ARC, PIQA, WinoGrande, OpenBookQA, BoolQ, LAMBADA) sirve como punto de referencia para modelos de menos de 100 M de parámetros.
- Destilación o inicialización de modelos mayores: los checkpoints en FP32 y el código de arquitectura pueden servir como punto de partida para experimentos de transferencia, aunque no hay evidencia publicada de que mejore a una inicialización aleatoria.

## Benchmarks y rendimiento

Resultados declarados por el autor, evaluados en splits oficiales completos, zero-shot y con lm-eval 0.4.12. Los intervalos son de confianza al 95 % (método Wilson). Ningún resultado está verificado de forma independiente (`verified: false`).

| Tarea / dataset | Métrica | Valor | IC 95 % |
|---|---|---|---|
| HellaSwag (validación) | acc_norm | 0,2779 | 0,2693 – 0,2868 |
| ARC-Easy (test) | acc_norm | 0,3893 | 0,3699 – 0,4091 |
| ARC-Challenge (test) | acc_norm | 0,2381 | 0,2146 – 0,2633 |
| PIQA (validación) | acc_norm | 0,5560 | 0,5332 – 0,5786 |
| WinoGrande XL (validación) | acc | 0,4846 | 0,4572 – 0,5121 |
| OpenBookQA (test) | acc_norm | 0,2620 | 0,2254 – 0,3023 |
| BoolQ (validación) | acc | 0,4994 | 0,4823 – 0,5165 |
| LAMBADA OpenAI (test) | acc | 0,1483 | 0,1388 – 0,1582 |

No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni de otras tareas de razonamiento, código o matemáticas. Tampoco se aportan comparaciones directas contra otros modelos en la model card.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,22 GB en FP32 (los checkpoints se conservan en FP32), unos 0,11 GB en BF16/FP16 y del orden de 27-55 MB si se cuantizara a 4-8 bits (no hay pesos cuantizados publicados).
- GPU recomendadas: cualquier GPU con más de 1-2 GB de VRAM es suficiente; el propio autor entrenó el modelo en una RTX 5070 Ti de 16 GB, aunque el entrenamiento completo cabe en GPUs mucho más pequeñas.
- Cabe holgadamente en GPU de consumo: RTX 3060, RTX 4060, RTX 4090, e incluso en iGPU o ejecución en CPU, dado el tamaño del modelo.
- Opciones de despliegue: la vía soportada es transformers con `trust_remote_code=True` para cargar la arquitectura personalizada alicet5_moe. No hay evidencia de soporte en vLLM, TGI, llama.cpp, Ollama ni MLX, ni ficheros GGUF publicados; al ser un encoder-decoder con MoE y código propio, su integración en esos motores requeriría una implementación a medida.
- Latencia y throughput estimados: no disponible. El repositorio solo documenta la configuración de entrenamiento (262.144 tokens fuente por paso, 15.000 pasos), no métricas de inferencia.

## Comparativa con modelos similares

La información disponible no incluye comparaciones de benchmarks con alternativas. La tabla siguiente recoge únicamente los datos que pueden contrastarse; los campos marcados como no disponibles no se han podido verificar en la información proporcionada.

| Modelo | Parámetros totales | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| d0rj/t5-moe-55M-base | 54,86 M | 2.048 tokens (bloques de entrenamiento; encoder hasta 2.050) | no disponible | HuggingFace, requiere código personalizado |
| yandex/AliceAI-T5-35B-A0.6B | 35 B totales / 0,6 B activos (según su nombre) | no disponible | no disponible | HuggingFace; citado como inspiración arquitectónica, sin datos comparativos en la información disponible |
| q-project/Q-50M-Base | no disponible | no disponible | no disponible | HuggingFace; citado únicamente como base del tokenizador |
| Otras alternativas de tamaño similar (p. ej. T5-small o FLAN-T5-small) | no disponible en la información proporcionada | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks comparables entre estos modelos dentro de la información facilitada, por lo que no es posible establecer una comparación de rendimiento rigurosa.

## Limitaciones y advertencias

- Modelo base sin ajuste por instrucciones: no ha pasado por RLHF, DPO ni fine-tuning supervisado, por lo que no sigue instrucciones ni mantiene diálogos de forma fiable.
- Rendimiento muy bajo en las tareas evaluadas: LAMBADA OpenAI con 0,1483 de exactitud, ARC-Challenge 0,2381 y HellaSwag 0,2779, propios de un modelo de 55 M entrenado con solo 3,93 mil millones de tokens procesados.
- Riesgo elevado de alucinación y de texto incoherente; no debe usarse para generar información factual sin revisión humana.
- Idioma: únicamente inglés declarado. No hay soporte documentado de castellano, lo que limita su uso en productos en español.
- Limitación de contexto: los bloques son de 2.048 tokens y el encoder admite como máximo 2.050 tokens incluyendo tokens de control; no se documenta la longitud máxima del decoder.
- Licencia no declarada: sin licencia explícita no hay autorización clara para uso comercial ni para redistribución; conviene contactar con el autor antes de cualquier uso en producción.
- Dependencia de código personalizado (`alicet5_moe`): cargar el modelo exige `trust_remote_code=True`, lo que implica ejecutar código de terceros; conviene auditar el repositorio antes de usarlo.
- Los resultados de benchmarks están declarados por el autor con `verified: false`, es decir, no han sido replicados por un tercero independiente.
- Discrepancia menor en el recuento de parámetros: 54.858.272 según safetensors frente a los 54.858.240 que cita el texto de la model card.
- El recuento de tokens de entrenamiento mide bloques de entrada procesados, no texto único ni tokens objetivo supervisados, por lo que no debe interpretarse como volumen de datos único.
- Sin descargas ni interacciones registradas en HuggingFace en el momento de la consulta, lo que implica ausencia de validación por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/d0rj/t5-moe-55M-base
- Dataset de entrenamiento (FineWeb-Edu): https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Paper del objetivo UL2: https://arxiv.org/abs/2205.05131
- Arquitectura de inspiración (yandex/AliceAI-T5-35B-A0.6B): https://huggingface.co/yandex/AliceAI-T5-35B-A0.6B
- Base del tokenizador (q-project/Q-50M-Base): https://huggingface.co/q-project/Q-50M-Base
- Configuración de entrenamiento citada en la model card: training_config.json dentro del repositorio del modelo
- Suites de evaluación empleadas: HellaSwag (Rowan/hellaswag), ARC (allenai/ai2_arc), PIQA (baber/piqa), WinoGrande (allenai/winogrande), OpenBookQA (allenai/openbookqa), BoolQ (aps/super_glue), LAMBADA OpenAI (EleutherAI/lambada_openai) y el arnés lm-eval 0.4.12
- No se han encontrado resultados de búsqueda web relevantes sobre este modelo; las consultas devolvieron únicamente contenido no relacionado.
