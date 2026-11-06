# SlayerLab/Slayer1B-1.05

## Resumen

Slayer1B 1.05 es un modelo de lenguaje causal (decoder-only) de 1.073.912.851 parámetros desarrollado por SlayerLab, con el polaco como idioma dominante y competencia en inglés. Se trata de un entrenamiento desde cero (from-scratch), no de un ajuste fino sobre una base existente, lo que lo convierte en uno de los pocos proyectos abiertos que documentan de forma transparente todo el ciclo de preentrenamiento de un modelo monolingüe de escala ~1B.

La versión 1.05 no es un modelo nuevo, sino una continuación del entrenamiento de Slayer1B 1.04: el entrenamiento se reanudó desde su checkpoint final (paso 10010) y se prolongó hasta el paso 12870, acumulando 13.495.173.120 tokens vistos (aproximadamente 12,6 tokens por parámetro). Al igual que las versiones 1.02 a 1.04, se trata de un estado de tasa de aprendizaje constante (6e-4), sin decaimiento aplicado.

Su relevancia reside en la trazabilidad: el autor publica los checkpoints intermedios con estado del optimizador, la curva de entrenamiento, el script de definición del modelo y los hashes SHA256 de cada artefacto. Esto lo hace útil para investigación sobre dinámicas de entrenamiento, no tanto como modelo de producción listo para tareas complejas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (causal LM), definición en `train_gpt_ref_r23.py` (clase `GPT`) |
| Parámetros totales | 1.073.912.851 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 4096 tokens (longitud de secuencia usada en entrenamiento: 256 × 4096 por paso) |
| Tipos de cuantización | no disponible (solo se publican pesos en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | polaco (pl), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`model.safetensors`), más `config.json`, `tokenizer.json`, `load_slayer.py`, `train_gpt_ref_r23.py` y `SHA256SUMS` |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only estándar implementado en el fichero `train_gpt_ref_r23.py` (clase `GPT`), que actúa como definición canónica de la arquitectura y es importado por el loader `load_slayer.py`. El `config.json` registra el hash SHA256 del checkpoint fuente `ckpt_12870.pt` (`435082ff36becfbb96803622139f38d2afa0ba1a9d2fc284bad96f5a8edc1181`), también publicado en el repositorio de checkpoints. No se documentan innovaciones arquitectónicas como atención lineal, SSM o decodificación especulativa; la arquitectura se mantiene sin cambios respecto a la versión 1.03 (entrenada con `train_gpt_ref` r24.1 y r24.2).

El entrenamiento continuó desde el paso 10010 de la versión 1.04 hasta el paso 12870, es decir, 2860 pasos con un batch global de 256 secuencias × 4096 tokens = 1.048.576 tokens por paso, lo que suma 2.998.927.360 tokens adicionales en esta fase y 13.495.173.120 tokens acumulados en total. Se ejecutó sobre 8× NVIDIA L40S, tras migrar desde 4× L40S en el checkpoint de 1.04; el primer update en el nuevo hardware reprodujo el batch global del run anterior, de modo que 1.05 continúa la misma trayectoria de entrenamiento. La tasa de aprendizaje se mantuvo constante en 6e-4, sin decaimiento. Los datos provienen del dataset `SlayerLab/slayer-pl-8x3b`, en una única pasada sobre el corpus iniciada en la versión 1.00. No se documenta RLHF, DPO ni ajuste por instrucciones.

## Capacidades

- Generación de texto causal en polaco e inglés.
- Modelado de lenguaje y continuación de texto; no se documenta un modo de instrucciones ni plantilla de chat.
- Razonamiento lingüístico básico evaluado en tareas zero-shot (BLiMP, ARC-Easy, MultiBLiMP).
- Capacidad multilingüe limitada a polaco e inglés.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta visión, audio ni modo thinking.
- No se documenta capacidad de código ni matemáticas de forma específica.

## Casos de uso

- Investigación sobre dinámicas de entrenamiento: el modelo publica checkpoints intermedios con estado del optimizador (pasos 10050–12870) y curva de entrenamiento, lo que permite estudiar el efecto de la tasa de aprendizaje constante frente al decaimiento en modelos de ~1B.
- Reproducibilidad y auditoría: los hashes SHA256 del checkpoint fuente, del script de definición y del trainer permiten verificar que los pesos publicados corresponden exactamente al estado de entrenamiento declarado.
- Generación de texto en polaco: al ser un modelo polaco-dominante entrenado desde cero sobre un corpus específico, es adecuado para experimentos de continuación de texto y modelado de lenguaje en ese idioma.
- Evaluación de transferencia lingüística pl→en: las métricas separadas para BLiMP (EN), ARC-Easy (EN), MultiBLiMP (PL) y ARC-Easy (PL, eu20) permiten analizar cómo un modelo entrenado mayoritariamente en polaco generaliza tareas en inglés.
- Base para ajuste fino posterior: con licencia Apache 2.0 y pesos en safetensors, puede servir como punto de partida para SFT o DPO en tareas concretas en polaco, aunque no se han publicado resultados de tales ajustes.
- Estudio de contaminación de benchmarks: la model card documenta la exclusión de 5133 documentos con solapamiento n-gram con ítems de test de BoolQ, MMLU y ARC a partir del paso 7193, lo que convierte al modelo en un caso de estudio sobre filtrado de datos y contaminación.

## Benchmarks y rendimiento

Evaluación realizada durante el entrenamiento con el evaluador automático del run (instrumento único, NVIDIA A100, zero-shot). Según el autor, estos resultados no son directamente comparables con el benchmark de lm-evaluation-harness usado en las tablas de resultados de las versiones 1.00–1.03.

| Métrica | 1.04 (paso 10010) | 1.05 (paso 12870) |
|---|---:|---:|
| BLiMP (EN), accuracy % | 74,17 | 75,53 |
| ARC-Easy (EN), accuracy % | 50,59 | 52,19 |
| WikiText-2, byte perplexity ↓ | 2,3078 | 2,2816 |
| WikiText-2, token perplexity ↓ | 31,29 | 29,86 |
| MultiBLiMP (PL), accuracy % | 98,87 | 98,47 |
| ARC-Easy (PL, eu20), accuracy % | 44,02 | 45,20 |

El autor señala que checkpoints individuales difieren: por ejemplo, el paso 13000 obtuvo ARC-Easy (EN) 51,56 y MultiBLiMP (PL) 98,81, sin atribuir causa. El benchmark de lm-evaluation-harness (HellaSwag, PIQA, LAMBADA, ARC-Challenge, BoolQ, MMLU) no se ha ejecutado sobre 1.05.

## Requisitos de hardware

- VRAM estimada para inferencia: con 1.073.912.851 parámetros, en fp16/bf16 se requieren aproximadamente 2,1 GB solo para pesos; en fp32, unos 4,3 GB (el repositorio ocupa 4,3 GB).
- GPU recomendadas: el entrenamiento se realizó en 8× NVIDIA L40S (48 GB cada una); para inferencia basta con una GPU de gama media o consumer.
- Cabe en GPU consumer: sí, cualquier GPU con al menos 4–6 GB de VRAM libre (por ejemplo, RTX 3060, RTX 4060, RTX 4090) puede ejecutar el modelo en fp16.
- Opciones de despliegue: el autor proporciona `load_slayer.py` como loader específico en PyTorch; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, ni pesos en GGUF.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---:|---|---|---|---|
| Slayer1B 1.05 | 1.073.912.851 | 4096 | pl, en | Apache 2.0 | Hugging Face, pesos safetensors + loader propio |
| Slayer1B 1.04 | mismo modelo (paso 10010) | 4096 | pl, en | Apache 2.0 | Hugging Face |
| Slayer1B 1.03 | mismo modelo (paso anterior) | 4096 | pl, en | Apache 2.0 | Hugging Face |

No se dispone en la información proporcionada de datos sobre modelos comparables de otros autores (mismo tamaño o misma tarea) para establecer una comparativa de rendimiento. Los benchmarks publicados no son directamente comparables con los de lm-evaluation-harness, según advierte el propio autor.

## Limitaciones y advertencias

- El modelo no ha pasado por RLHF, DPO ni ajuste por instrucciones; no debe esperarse un comportamiento de asistente conversacional.
- Riesgo de alucinación inherente a un modelo causal de 1B sin alineación; no se han publicado evaluaciones de fidelidad factual.
- Contexto limitado a 4096 tokens, adecuado para documentos cortos pero insuficiente para tareas de contexto largo.
- Cobertura lingüística restringida a polaco e inglés; el rendimiento en otros idiomas no está documentado.
- La model card advierte de que parte del entrenamiento (hasta el paso 7192) usó datos sin filtrar con solapamiento n-gram con ítems de test de BoolQ, MMLU y ARC; los resultados de esos benchmarks sobre versiones anteriores pueden estar inflados.
- Los benchmarks de lm-evaluation-harness no se han ejecutado sobre 1.05, por lo que no hay resultados comparables con la tabla de resultados de 1.00–1.03.
- Las métricas de entrenamiento provienen de un único instrumento (evaluador automático del run en A100) y el autor indica que no son directamente comparables con otras herramientas.
- Licencia Apache 2.0: permite uso comercial, pero el modelo se distribuye sin garantías y sin evaluación de sesgos.
- El despliegue requiere el loader propio `load_slayer.py` y la definición `train_gpt_ref_r23.py`; no hay soporte documentado en frameworks de inferencia estándar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SlayerLab/Slayer1B-1.05
- Versión anterior 1.04: https://huggingface.co/SlayerLab/Slayer1B-1.04
- Versión anterior 1.03: https://huggingface.co/SlayerLab/Slayer1B-1.03
- Versión anterior 1.02: https://huggingface.co/SlayerLab/Slayer1B-1.02
- Versión anterior 1.01: https://huggingface.co/SlayerLab/Slayer1B-1.01
- Versión anterior 1.00: https://huggingface.co/SlayerLab/Slayer1B-1.00
- Checkpoints de 1.05 (con estado del optimizador): https://huggingface.co/SlayerLab/Slayer1B-1.05-checkpoints
- Checkpoints de 1.04: https://huggingface.co/SlayerLab/Slayer1B-1.04-checkpoints
- Dataset de entrenamiento: https://huggingface.co/datasets/SlayerLab/slayer-pl-8x3b
- Curva de entrenamiento y evaluación durante el entrenamiento: https://track.fabryka.ai/run/f056bb5c-f1da-56d5-9776-cc33063f10a5
