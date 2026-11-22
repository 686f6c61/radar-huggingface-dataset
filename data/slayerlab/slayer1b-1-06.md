# SlayerLab/Slayer1B-1.06

## Resumen

Slayer1B 1.06 es un modelo de lenguaje decoder-only de 1.073.912.851 parámetros desarrollado por SlayerLab, entrenado desde cero y con dominio principal del polaco. Se trata de la continuación de Slayer1B 1.05 hasta completar una pasada íntegra sobre el corpus de entrenamiento, alcanzando el paso 13848 con una tasa de aprendizaje constante de 6e-4. Es relevante porque representa el estado final de la primera vuelta sobre el corpus de la línea Slayer1B, un punto de partida documentado y reproducible para futuros entrenamientos.

El modelo emplea una arquitectura transformer causal estándar, definida en el fichero `train_gpt_ref_r23.py` (clase `GPT`), con un vocabulario y tokenizador propios. El entrenamiento utilizó el dataset `SlayerLab/slayer-pl-8x3b`, con un total de 14.520.680.448 tokens vistos una sola vez (aproximadamente 13,5 tokens por parámetro), sobre 8 GPU NVIDIA L40S.

La versión 1.06 no aplica decaimiento de la tasa de aprendizaje ni extensión de contexto; es un checkpoint de tasa constante que cierra la primera pasada. La licencia Apache 2.0 y su reducido tamaño lo hacen adecuado para experimentación y despliegue en hardware de consumo, aunque su enfoque principal en polaco limita su uso generalista en otros idiomas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (causal LM), clase `GPT` en `train_gpt_ref_r23.py` |
| Parámetros totales | 1.073.912.851 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 4096 tokens (longitud de secuencia de entrenamiento) |
| Tipos de cuantización | no disponible (pesos publicados en safetensors, presumiblemente fp32/bf16; no se especifica) |
| Idiomas soportados | pl (principal), en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (`model.safetensors`), con `config.json`, `tokenizer.json` y scripts de carga |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only causal estándar, sin innovaciones arquitectónicas destacadas (no es MoE, SSM ni híbrido). La definición del modelo se encuentra en `train_gpt_ref_r23.py` y la carga se realiza mediante `load_slayer.py`. El `config.json` registra el sha256 del checkpoint de origen `ckpt_13848.pt` y el hash del fichero de definición del modelo (`trainer_sha256`). La arquitectura se mantuvo sin cambios respecto a las versiones 1.03, 1.04 y 1.05, entrenadas con las revisiones r24.1 y r24.2 del script de entrenamiento.

El entrenamiento se realizó sobre el dataset `SlayerLab/slayer-pl-8x3b` en una única pasada, con un batch global de 256 secuencias × 4096 tokens = 1.048.576 tokens por paso y una tasa de aprendizaje constante de 6e-4. La versión 1.06 retoma desde el paso 12870 (checkpoint final de 1.05) y continúa hasta el paso 13848 (978 pasos, 1.025.507.328 tokens) sobre 8 GPU NVIDIA L40S. El segmento final es más corto que los segmentos de 2860 pasos de 1.04 y 1.05 porque termina donde acaba el corpus, sin relleno con datos repetidos. No se aplicó decaimiento de la tasa de aprendizaje ni extensión de contexto. No se menciona el uso de RLHF, DPO ni técnicas de alineación adicionales.

## Capacidades

- Generación de texto causal en polaco (idioma principal) e inglés.
- Modelo base sin ajuste instructivo: no se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidades multilingües limitadas a polaco e inglés según los tags del modelo.
- No se documentan capacidades de visión, audio, thinking mode ni decodificación especulativa.
- Evaluación zero-shot en tareas de comprensión lingüística (BLiMP, MultiBLiMP) y razonamiento elemental (ARC-Easy).

## Casos de uso

- Experimentación en investigación sobre modelos de lenguaje en polaco: el modelo sirve como punto de partida reproducible para estudiar el efecto de una pasada completa sobre el corpus, con checkpoints intermedios publicados (pasos 12900–13848) y curva de entrenamiento disponible.
- Generación de texto en polaco para prototipos: con 1.07B parámetros y licencia Apache 2.0, puede desplegarse en hardware de consumo para tareas de completado de texto y generación libre en entornos de desarrollo.
- Evaluación de técnicas de cuantización: al ser un modelo pequeño con pesos safetensors, es adecuado para probar pipelines de cuantización (GGUF, etc.) y medir el impacto en perplejidad sobre WikiText-2.
- Fine-tuning específico de dominio en polaco: el checkpoint base y su licencia permisiva permiten ajustar el modelo para tareas concretas (clasificación, extracción, resumen) con recursos limitados.
- Estudio de dinámicas de entrenamiento: la publicación de checkpoints con estado del optimizador y de la curva de entrenamiento facilita análisis de convergencia y de la evolución de métricas como BLiMP o ARC-Easy.
- Benchmarking de infraestructura: su tamaño permite validar pipelines de entrenamiento e inferencia (vLLM, llama.cpp, TGI) en configuraciones multi-GPU pequeñas (8× L40S) antes de escalar a modelos mayores.

## Benchmarks y rendimiento

Evaluación realizada durante el entrenamiento con el evaluador automático del run (una sola instrumentación, NVIDIA A100, zero-shot). No son directamente comparables con el benchmark lm-evaluation-harness de las versiones 1.00–1.03.

| Métrica | 1.04 (paso 10010) | 1.05 (paso 12870) | 1.06 (paso 13848) |
|---|---:|---:|---:|
| BLiMP (EN), accuracy % | 74,17 | 75,53 | 76,12 |
| ARC-Easy (EN), accuracy % | 50,59 | 52,19 | 52,99 |
| WikiText-2, byte perplexity ↓ | 2,3078 | 2,2816 | 2,2849 |
| WikiText-2, token perplexity ↓ | 31,29 | 29,86 | 30,03 |
| MultiBLiMP (PL), accuracy % | 98,87 | 98,47 | 98,41 |
| ARC-Easy (PL, eu20), accuracy % | 44,02 | 45,20 | 45,03 |

El benchmark lm-evaluation-harness (HellaSwag, PIQA, LAMBADA, ARC-Challenge, BoolQ, MMLU) no se ha ejecutado sobre 1.06. No se han publicado resultados comparativos con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; para 1.07B parámetros en fp32 se requieren aproximadamente 4,3 GB solo de pesos, en bf16/fp16 unos 2,1 GB, y en cuantización de 8 bits unos 1,1 GB (estimaciones a partir del número de parámetros, no publicadas por el autor).
- GPU de entrenamiento utilizadas: 8× NVIDIA L40S; evaluación durante el entrenamiento en NVIDIA A100.
- GPU de consumo: por tamaño, el modelo cabe en GPU de consumo (RTX 3090, RTX 4090, etc.) en bf16 o cuantizado, aunque el autor no publica requisitos ni cifras de latencia.
- Opciones de despliegue: no documentadas por el autor; el repositorio incluye `load_slayer.py` para carga con PyTorch. No se publican pesos GGUF ni integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se han publicado comparativas con otros modelos en la información disponible. Como referencia de categoría (modelos base de ~1B parámetros), podrían considerarse alternativas como TinyLlama, Qwen2.5-1.5B o SmolLM2-1.7B, pero no se dispone de datos de rendimiento comparables de Slayer1B 1.06 frente a ellos en la información proporcionada.

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Slayer1B 1.06 | 1,07B | 4096 | pl, en | apache-2.0 | Hugging Face |
| Alternativas de ~1B | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Modelo base sin alineación: no se documenta entrenamiento con RLHF ni DPO, por lo que puede generar contenido sesgado, tóxico o no deseado sin filtros.
- Riesgo de alucinación inherente a un modelo de 1B parámetros entrenado sobre una sola pasada de corpus; no se han publicado evaluaciones de factualidad.
- Dominio principal del polaco: el rendimiento en inglés es secundario y limitado (BLiMP 76,12 %, ARC-Easy 52,99 %); no se garantiza un uso generalista en otros idiomas.
- Contexto limitado a 4096 tokens; no se aplicó extensión de contexto en esta versión.
- Advertencia del autor sobre solapamiento n-gram: los pasos hasta 7192 usaron datos sin filtrar; desde el paso 7193 se excluyeron 5133 documentos con solapamiento n-gram con ítems de test de BoolQ, MMLU y ARC, lo que afecta a la comparabilidad de benchmarks en inglés.
- La evaluación publicada es la del evaluador interno del entrenamiento, no lm-evaluation-harness, y no es directamente comparable con las tablas de resultados de versiones anteriores.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías ni soporte; verificar el cumplimiento de la licencia del dataset de entrenamiento para usos derivados.
- No se publican requisitos de hardware, formatos cuantizados ni cifras de latencia/throughput, lo que dificulta la planificación de producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SlayerLab/Slayer1B-1.06
- Checkpoints de entrenamiento (pasos 12900–13848): https://huggingface.co/SlayerLab/Slayer1B-1.06-checkpoints
- Checkpoints de la continuación completa (7200–13848): https://huggingface.co/SlayerLab/Slayer1B-1.04-checkpoints
- Versión anterior 1.05: https://huggingface.co/SlayerLab/Slayer1B-1.05
- Versión anterior 1.04: https://huggingface.co/SlayerLab/Slayer1B-1.04
- Versión anterior 1.03: https://huggingface.co/SlayerLab/Slayer1B-1.03
- Versión anterior 1.02: https://huggingface.co/SlayerLab/Slayer1B-1.02
- Versión anterior 1.01: https://huggingface.co/SlayerLab/Slayer1B-1.01
- Versión anterior 1.00: https://huggingface.co/SlayerLab/Slayer1B-1.00
- Dataset de entrenamiento: https://huggingface.co/datasets/SlayerLab/slayer-pl-8x3b
- Curva de entrenamiento y evaluación: https://track.fabryka.ai/run/f056bb5c-f1da-56d5-9776-cc33063f10a5
