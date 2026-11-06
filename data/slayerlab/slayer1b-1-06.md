# SlayerLab/Slayer1B-1.06

## Resumen

Slayer1B 1.06 es un modelo de lenguaje decoder-only de 1.073.912.851 parámetros (aproximadamente 1,07 mil millones) desarrollado por SlayerLab, entrenado desde cero con predominancia del polaco y capacidad secundaria en inglés. Se trata de la versión final de la primera pasada completa sobre el corpus de entrenamiento: retoma el checkpoint final de Slayer1B 1.05 (paso 12870) y continúa hasta el paso 13848, completando un recorrido único sobre 14.520.680.448 tokens (≈13,5 tokens por parámetro).

La relevancia de esta versión radica en su carácter de hito reproducible: es el primer checkpoint de la línea Slayer1B que agota el corpus preparado sin reutilizar datos ni aplicar padding con secuencias repetidas. Mantiene una tasa de aprendizaje constante de 6e-4 sin decaimiento ni extensión de contexto, lo que lo convierte en un punto de partida documentado para futuras continuaciones del entrenamiento.

El modelo se distribuye con licencia Apache 2.0, pesos en safetensors, definición de arquitectura en código Python (`train_gpt_ref_r23.py`) y un cargador específico (`load_slayer.py`). Su tamaño contenido permite desplegarlo en hardware de consumo, lo que lo hace útil para experimentación e investigación en modelos pequeños multilingües con foco en lenguas eslavas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (causal LM), definida en `train_gpt_ref_r23.py` (clase `GPT`) |
| Parámetros totales | 1.073.912.851 |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 4096 tokens (longitud de secuencia de entrenamiento: 256 × 4096 por paso) |
| Tipos de cuantización | No disponible (no se documentan cuantizaciones oficiales; los pesos se publican en safetensors) |
| Idiomas soportados | Polaco (pl), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`model.safetensors`), más `config.json`, `tokenizer.json`, `load_slayer.py`, `train_gpt_ref_r23.py` y `SHA256SUMS` |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only estándar para modelado de lenguaje causal, definido en el fichero `train_gpt_ref_r23.py` que se incluye en el repositorio y que el cargador `load_slayer.py` importa. El entrenamiento se realizó con un batch global de 256 secuencias de 4096 tokens (1.048.576 tokens por paso) y una tasa de aprendizaje constante de 6e-4. La versión 1.06 continúa desde el paso 12870 (checkpoint final de 1.05) hasta el paso 13848, es decir, 978 pasos adicionales que suponen 1.025.507.328 tokens, ejecutados sobre 8 GPUs NVIDIA L40S. Este segmento final es más corto que los segmentos de 2860 pasos de las versiones 1.04 y 1.05 porque termina donde acaba el corpus, sin rellenar con datos repetidos.

El corpus de entrenamiento es `SlayerLab/slayer-pl-8x3b`, sobre el que se realiza una única pasada: cada token de entrenamiento se ve una sola vez, sumando 14.520.680.448 tokens en total. No se aplicó decaimiento de la tasa de aprendizaje ni extensión de contexto en esta versión. La model card indica que, a partir del paso 7193 (pack-04), se excluyeron 5133 documentos con solapamiento de n-gramas con ítems de test de BoolQ, MMLU y ARC; los pasos anteriores (hasta 7192, correspondientes a 1.00–1.03 y los primeros 42 pasos de la continuación) usaron datos sin filtrar. No se documenta en la información disponible el uso de RLHF, DPO ni otras técnicas de alineación posteriores al preentrenamiento.

## Capacidades

- Generación de texto causal en polaco e inglés, con predominancia del polaco según la model card.
- Modelado de lenguaje y razonamiento básico de sentido común, evaluado en tareas como BLiMP, ARC-Easy y MultiBLiMP.
- Capacidad multilingüe limitada a los dos idiomas declarados (pl, en); no se documentan otros idiomas.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso explícito.
- No se documentan capacidades de visión, audio ni modos de pensamiento (thinking mode).
- No se documenta una plantilla de chat ni formato instruct; el pipeline declarado es `text-generation` sobre un modelo causal base.

## Casos de uso

- Experimentación en investigación sobre modelos pequeños desde cero: el repositorio incluye la definición de arquitectura, el cargador y los checkpoints con estado del optimizador, lo que permite reproducir y continuar el entrenamiento desde el paso 13848.
- Generación de texto en polaco para prototipos: el modelo está entrenado con predominancia de polaco y alcanza un 98,41 % de precisión en MultiBLiMP (PL), lo que lo hace adecuado para tareas de completado y generación libre en ese idioma en entornos de prueba.
- Evaluación comparativa de modelos pequeños: sirve como referencia de base para medir el efecto de continuar el entrenamiento con tasa constante frente a esquemas con decaimiento.
- Fine-tuning sobre dominios específicos en polaco: con 1,07 mil millones de parámetros y licencia Apache 2.0, es viable ajustarlo en una sola GPU para tareas de clasificación, resumen o generación especializada.
- Despliegue en hardware de consumo para demos: su tamaño permite inferencia en GPUs de gama media-alta, útil para entornos de desarrollo y pruebas de concepto.
- Estudio de dinámica de entrenamiento: la curva de entrenamiento y la evaluación automática publicadas en `track.fabryka.ai` permiten analizar la evolución de métricas como perplejidad y precisión a lo largo de los pasos.

## Benchmarks y rendimiento

Datos de evaluación durante el entrenamiento (evaluador automático del run, una NVIDIA A100, zero-shot). La model card advierte que no son comparables directamente con el benchmark de lm-evaluation-harness usado en las tablas de resultados de 1.00–1.03.

| Métrica | 1.04 (paso 10010) | 1.05 (paso 12870) | 1.06 (paso 13848) |
|---|---:|---:|---:|
| BLiMP (EN), precisión % | 74,17 | 75,53 | 76,12 |
| ARC-Easy (EN), precisión % | 50,59 | 52,19 | 52,99 |
| WikiText-2, perplejidad por byte ↓ | 2,3078 | 2,2816 | 2,2849 |
| WikiText-2, perplejidad por token ↓ | 31,29 | 29,86 | 30,03 |
| MultiBLiMP (PL), precisión % | 98,87 | 98,47 | 98,41 |
| ARC-Easy (PL, eu20), precisión % | 44,02 | 45,20 | 45,03 |

El benchmark de lm-evaluation-harness (HellaSwag, PIQA, LAMBADA, ARC-Challenge, BoolQ, MMLU) no se ha ejecutado sobre 1.06 según la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Con 1,07 mil millones de parámetros, en fp16 los pesos ocupan aproximadamente 2,1 GB; en cuantización de 8 bits, alrededor de 1,1 GB; en 4 bits, en torno a 0,6 GB (estimaciones a partir del recuento de parámetros, no publicadas por el autor).
- GPUs recomendadas: el entrenamiento se realizó sobre 8× NVIDIA L40S y la evaluación sobre NVIDIA A100; para inferencia no se documentan GPU recomendadas.
- Cabe en GPU de consumo: sí, por tamaño de parámetros, aunque no se publican requisitos oficiales ni configuraciones validadas.
- Opciones de despliegue: el repositorio incluye `load_slayer.py` para cargar los pesos con PyTorch. No se documenta soporte oficial para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de benchmarks comparables publicados por el autor frente a otros modelos de la misma categoría, por lo que la comparación cuantitativa no está disponible. A continuación se comparan únicamente datos objetivos de ficha:

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Slayer1B 1.06 | 1.073.912.851 | 4096 | pl, en | Apache 2.0 | safetensors |
| Alternativas de ~1B | no disponible | no disponible | no disponible | no disponible | no disponible |

No se han identificado en la información proporcionada modelos alternativos concretos con los que comparar parámetros, contexto, rendimiento, licencia y disponibilidad.

## Limitaciones y advertencias

- Modelo base sin alineación documentada: no se indica RLHF, DPO ni ajuste por instrucciones, por lo que no está pensado para seguir instrucciones de forma fiable sin fine-tuning adicional.
- Riesgo de alucinación: como modelo causal de 1,07 mil millones de parámetros entrenado una sola pasada sobre el corpus, la generación puede producir contenido plausible pero incorrecto.
- Cobertura lingüística restringida a polaco e inglés; no se garantiza comportamiento en otros idiomas.
- Contexto limitado a 4096 tokens; no se aplicó extensión de contexto en esta versión.
- La model card advierte de solapamiento de n-gramas entre la parte inglesa compartida y los ítems de test de BoolQ, MMLU y ARC en los pasos hasta 7192, lo que puede inflar resultados en esas evaluaciones si se usan los checkpoints tempranos.
- Los resultados de evaluación durante el entrenamiento no son directamente comparables con el benchmark de lm-evaluation-harness de versiones anteriores.
- Licencia Apache 2.0: permite uso comercial, pero debe conservarse el aviso de licencia y no se ofrece garantía alguna por parte del autor.
- No se documentan cuantizaciones oficiales ni integración con frameworks de despliegue habituales, lo que puede requerir trabajo adicional para producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SlayerLab/Slayer1B-1.06
- Versión anterior 1.05: https://huggingface.co/SlayerLab/Slayer1B-1.05
- Versión anterior 1.04: https://huggingface.co/SlayerLab/Slayer1B-1.04
- Versión anterior 1.03: https://huggingface.co/SlayerLab/Slayer1B-1.03
- Versión anterior 1.02: https://huggingface.co/SlayerLab/Slayer1B-1.02
- Versión anterior 1.01: https://huggingface.co/SlayerLab/Slayer1B-1.01
- Versión anterior 1.00: https://huggingface.co/SlayerLab/Slayer1B-1.00
- Checkpoints con estado del optimizador (1.06): https://huggingface.co/SlayerLab/Slayer1B-1.06-checkpoints
- Checkpoints con estado del optimizador (1.04): https://huggingface.co/SlayerLab/Slayer1B-1.04-checkpoints
- Dataset de entrenamiento: https://huggingface.co/datasets/SlayerLab/slayer-pl-8x3b
- Curva de entrenamiento y evaluación: https://track.fabryka.ai/run/f056bb5c-f1da-56d5-9776-cc33063f10a5
