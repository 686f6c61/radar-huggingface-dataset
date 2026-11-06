# SlayerLab/Slayer1B-1.04

## Resumen

Slayer1B 1.04 es un modelo de lenguaje causal decoder-only de 1.073.912.851 parámetros desarrollado por SlayerLab, entrenado desde cero con dominio principal del polaco y capacidad secundaria en inglés. Se trata de la cuarta iteración pública de la línea Slayer1B: 1.04 es exactamente 1.03 con entrenamiento continuado desde su checkpoint final (paso 7150) hasta el paso 10010, manteniendo sin cambios arquitectura, tokenizador, orden del corpus y batch global. La relevancia de esta release radica en su carácter de estado intermedio con tasa de aprendizaje constante, documentado de forma transparente y con los checkpoints de entrenamiento publicados.

El modelo se ha entrenado sobre el corpus SlayerLab/slayer-pl-8x3b en una única pasada, acumulando 10.496.245.760 tokens (aproximadamente 9,8 tokens por parámetro). El entrenamiento de la continuación se realizó sobre 4 GPU NVIDIA L40S durante 2860 pasos, con un batch global de 256 secuencias de 4096 tokens (1.048.576 tokens por paso) y una tasa de aprendizaje constante de 6e-4, sin decaimiento.

La ficha del autor es explícita respecto a las limitaciones metodológicas: la evaluación publicada es la del evaluador automático del propio run (una sola instrumentación, A100, zero-shot) y no la suite lm-evaluation-harness empleada en las releases 1.00–1.03, por lo que los números no son directamente comparables entre versiones. Además, se documenta el solapamiento n-gram entre la parte inglesa compartida del corpus y los ítems de test de BoolQ, MMLU y ARC, parcialmente mitigado a partir del paso 7193.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only causal (clase `GPT` definida en `train_gpt_ref_r23.py`) |
| Parametros totales | 1.073.912.851 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4096 tokens (longitud de secuencia de entrenamiento) |
| Tipos de cuantizacion | no disponible (solo se publican pesos en safetensors en precisión original) |
| Idiomas soportados | polaco (principal), inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`model.safetensors`), con `config.json`, `tokenizer.json`, `load_slayer.py`, `train_gpt_ref_r23.py` y `SHA256SUMS` |

## Arquitectura y entrenamiento

Arquitectura transformer decoder-only causal estándar, definida en el fichero `train_gpt_ref_r23.py` (clase `GPT`) e importada por el loader `load_slayer.py`. No se documentan innovaciones arquitectónicas destacables (ni MoE, ni atención lineal, ni SSM, ni decodificación especulativa): la release se presenta como una continuación de entrenamiento con arquitectura idéntica a la de 1.03, verificable mediante el hash `trainer_sha256` registrado en `config.json`. El checkpoint de origen `ckpt_10010.pt` tiene sha256 `04438959d7b317d1a8d972b264e9610a06fd8addde7349c6e9f458ee56dc1e51`, también publicado en el repositorio de checkpoints.

El entrenamiento continuó desde el paso 7150 de 1.03 hasta el paso 10010, es decir, 2860 pasos adicionales que suponen 2.998.927.360 tokens sobre el corpus SlayerLab/slayer-pl-8x3b, en una única pasada iniciada en la versión 1.00. El total acumulado es de 10.496.245.760 tokens (≈ 9,8 tokens por parámetro). Se mantuvo el batch global de 1.048.576 tokens por paso y la tasa de aprendizaje constante de 6e-4, sin decaimiento, por lo que 1.04 es un estado de learning rate constante igual que 1.02 y 1.03. El cómputo se ejecutó sobre 4× NVIDIA L40S. No se documenta en la información disponible el uso de RLHF, DPO ni fases de ajuste fino posteriores al preentrenamiento.

## Capacidades

- Generación de texto causal autoregresiva en polaco e inglés.
- Modelado de lenguaje y continuación de texto con ventana de contexto de 4096 tokens.
- Capacidad principal en polaco, con competencia secundaria en inglés (el corpus de entrenamiento es de dominio polaco).
- Razonamiento de sentido común y comprensión lectora a nivel básico, según las métricas de entrenamiento publicadas (ARC-Easy en inglés y en polaco).
- Conocimiento gramatical y morfosintáctico, medido con BLiMP (inglés) y MultiBLiMP (polaco).
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso explícito.
- No se documenta modo thinking, visión ni audio.
- No se documenta unaplantilla de chat ni formato instruct: el modelo se publica como base causal-lm.

## Casos de uso

- Generación y continuación de texto en polaco: el modelo puede emplearse para completar documentos, artículos o contenido editorial en polaco, aprovechando que es su idioma dominante de entrenamiento y su ventana de 4096 tokens para mantener coherencia en pasajes largos.
- Prototipado e investigación sobre modelos pequeños desde cero: al publicarse la definición del modelo (`train_gpt_ref_r23.py`), el loader (`load_slayer.py`), los checkpoints con estado del optimizador y la curva de entrenamiento, sirve como base reproducible para estudiar dinámicas de entrenamiento con learning rate constante a escala de 1B parámetros.
- Evaluación de técnicas de cuantización y despliegue en hardware modesto: con 1.073.912.851 parámetros y pesos en safetensors, es un candidato manejable para probar pipelines de cuantización y servir el modelo en una sola GPU consumer, aunque el autor no publique recetas de cuantización.
- Filtrado y clasificación de texto en polaco mediante puntuación de perplejidad: al ser un modelo de lenguaje base, puede usarse para puntuar la probabilidad de secuencias y detectar texto anómalo, generado o fuera de dominio en corpus polacos.
- Generación aumentada en aplicaciones de bajo coste: su tamaño permite integrarlo en servicios con presupuesto de cómputo reducido donde un modelo mayor no sería viable, aceptando la menor calidad respecto a modelos de decenas de miles de millones de parámetros.
- Investigación lingüística comparada polaco-inglés: las métricas BLiMP y MultiBLiMP publicadas permiten analizar el comportamiento gramatical en ambos idiomas y estudiar el efecto del dominio del corpus en el rendimiento cruzado de lenguas.
- Base para ajuste fino supervisado posterior: al ser un modelo base con licencia Apache 2.0 y pesos abiertos, puede servir como punto de partida para SFT o DPO en tareas concretas en polaco, aunque el autor no publique recetas de ajuste.

## Benchmarks y rendimiento

Métricas del evaluador automático del run, medidas sobre el checkpoint liberado (paso 10010) en una NVIDIA A100, zero-shot. El autor advierte que no son la suite lm-evaluation-harness usada en 1.00–1.03 y no son directamente comparables con ella.

| Métrica | Slayer1B 1.04 (paso 10010) |
|---|---:|
| BLiMP (EN), accuracy % | 74,17 |
| ARC-Easy (EN), accuracy % | 50,59 |
| WikiText-2, byte perplexity ↓ | 2,3078 |
| WikiText-2, token perplexity ↓ | 31,29 |
| MultiBLiMP (PL), accuracy % | 98,87 |
| ARC-Easy (PL, eu20), accuracy % | 44,02 |

La suite lm-evaluation-harness (HellaSwag, PIQA, LAMBADA, ARC-Challenge, BoolQ, MMLU) no se ha ejecutado sobre 1.04, por lo que no hay resultados disponibles para esas tareas en esta release.

## Requisitos de hardware

- VRAM estimada para inferencia en precisión original (fp16/bf16): aproximadamente 2,1 GB solo para pesos, más memoria para activaciones y caché KV; en la práctica, unos 3–4 GB para secuencias cortas y más para contextos cercanos a 4096 tokens.
- VRAM estimada en cuantización de 8 bits: alrededor de 1,1 GB para pesos; en 4 bits, alrededor de 0,6 GB. El autor no publica recetas de cuantización, por lo que estos valores son estimaciones derivadas del recuento de parámetros.
- GPU recomendadas: el autor entrenó sobre 4× NVIDIA L40S; para inferencia, una única GPU con al menos 8 GB de VRAM es suficiente en fp16, y GPUs consumer como RTX 3060, RTX 4060, RTX 4070 o superiores pueden alojar el modelo con holgura.
- Cabe en GPU consumer: sí, en la mayoría de tarjetas con 8 GB o más en fp16, y en tarjetas con 4–6 GB si se cuantiza.
- Opciones de despliegue: el repositorio incluye `load_slayer.py` como loader de referencia sobre PyTorch. No se documenta soporte oficial para vLLM, llama.cpp, Ollama ni TGI; la conversión a GGUF no está publicada.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---:|---:|---|---|---|
| Slayer1B 1.04 | 1.073.912.851 | 4096 | pl, en | Apache 2.0 | Pesos safetensors en Hugging Face |
| Slayer1B 1.03 | no disponible en la información | 4096 | pl, en | Apache 2.0 | Pesos safetensors en Hugging Face |
| Slayer1B 1.02 | no disponible en la información | 4096 | pl, en | Apache 2.0 | Pesos safetensors en Hugging Face |
| Slayer1B 1.00 | no disponible en la información | 4096 | pl, en | Apache 2.0 | Pesos safetensors en Hugging Face |

No se dispone en la información proporcionada de datos de benchmarks de modelos de terceros de tamaño comparable (por ejemplo, modelos polacos de ~1B parámetros) que permitan una comparación cuantitativa fiable. La comparación con las versiones anteriores de la propia línea Slayer1B es la única disponible, y el autor advierte que las métricas de 1.04 no son directamente comparables con las de 1.00–1.03 por el cambio de instrumentación de evaluación.

## Limitaciones y advertencias

- Modelo base sin ajuste instructivo: no está alineado para seguir instrucciones ni para conversación; su uso esperado es la continuación de texto y el ajuste fino posterior.
- Riesgo de alucinación: al ser un modelo de 1B parámetros entrenado con ≈ 9,8 tokens por parámetro, su conocimiento factual es limitado y la generación de hechos inventados es esperable en dominios especializados.
- Sesgos: no se documenta ninguna evaluación de sesgos; el corpus es de dominio polaco y puede reflejar sesgos presentes en las fuentes de datos, que no se detallan en la información disponible.
- Limitación de contexto: ventana de 4096 tokens; no se documenta soporte para contextos más largos ni técnicas de extensión.
- Limitación de idioma: el polaco es el idioma dominante y el inglés es secundario; el rendimiento en otros idiomas no está documentado y previsiblemente será bajo.
- Contaminación de benchmarks: el autor reconoce solapamiento n-gram entre la parte inglesa compartida del corpus y los ítems de test de BoolQ, MMLU y ARC. Los pasos hasta 7192 (1.00–1.03 y los primeros 42 pasos de la continuación) usaron datos sin filtrar; a partir del paso 7193 se excluyeron 5133 documentos con solapamiento (lista con sha256 `84caed78733c25a7d7bbe5f0c9c1ef1d2bb249793ef559f1b73f4b390995b445`). Las métricas en inglés deben interpretarse con cautela.
- Comparabilidad de métricas: los resultados publicados usan el evaluador automático del run, no lm-evaluation-harness, y no son comparables con las tablas de resultados de 1.00–1.03.
- Estado de entrenamiento intermedio: 1.04 es un estado con learning rate constante, sin decaimiento; el autor continúa el preentrenamiento en 1.05 (paso 12870) y 1.06 (paso 13848), por lo que 1.04 no es el checkpoint final de la línea.
- Licencia: Apache 2.0 permite uso comercial, pero al ser un modelo base sin alineación, el despliegue en producción requeriría ajuste fino y evaluación propios.
- Sin soporte documentado de tool calling, agentes, visión ni audio: no debe asumirse ninguna de estas capacidades.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SlayerLab/Slayer1B-1.04
- Versión anterior 1.03: https://huggingface.co/SlayerLab/Slayer1B-1.03
- Versión anterior 1.02: https://huggingface.co/SlayerLab/Slayer1B-1.02
- Versión anterior 1.01: https://huggingface.co/SlayerLab/Slayer1B-1.01
- Versión anterior 1.00: https://huggingface.co/SlayerLab/Slayer1B-1.00
- Checkpoints de entrenamiento con estado del optimizador: https://huggingface.co/SlayerLab/Slayer1B-1.04-checkpoints
- Dataset de entrenamiento: https://huggingface.co/datasets/SlayerLab/slayer-pl-8x3b
- Curva de entrenamiento y evaluación durante el entrenamiento (pasos 7160–13848): https://track.fabryka.ai/run/f056bb5c-f1da-56d5-9776-cc33063f10a5
