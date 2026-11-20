# anaaaaaa13421312/zenz-kanji-baseline-40m-bpe32k

## Resumen

zenz-kanji-baseline-40m-bpe32k es un modelo de lenguaje pequeño (SLM) de aproximadamente 38,8 millones de parámetros desarrollado por el usuario independiente anaaaaaa13421312. Se trata de una variante *baseline* del trabajo sobre Zenz, un modelo orientado a la conversión de texto japonés entre escrituras (kana-kanji), entrenado sobre texto japonés estándar con mezcla de kanji y kana y con un tokenizador BPE de 32.768 entradas. El modelo sirve como referencia de comparación frente a otras variantes del mismo presupuesto de parámetros, presumiblemente centradas en kana o katakana.

La arquitectura es un transformer causal de tipo LlamaForCausalLM con 7 capas, dimensión oculta de 512 y 8 cabezas de consulta con 4 cabezas KV (GQA), con embeddings atados (tie_word_embeddings=True). La longitud máxima de secuencia es de 512 tokens, un contexto muy reducido que limita su uso a tareas de transformación local de texto y no a conversación de largo alcance.

Es relevante ahora como pieza de un experimento controlado sobre representación de escritura japonesa en modelos pequeños: permite medir cuánto aporta (o resta) el vocabulario BPE estándar frente a alternativas centradas en kana en un presupuesto de ~39M parámetros. No obstante, es un modelo de nicho, sin descargas ni validación externa, y su licencia CC-BY-SA 4.0 impone obligaciones de atribución y compartición derivada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal decoder-only, LlamaForCausalLM (tie_word_embeddings=True) |
| Parametros totales | 38.804.992 (~38,80 M) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 512 tokens (max seq length) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan cuantizaciones) |
| Idiomas soportados | Japonés (ja) |
| Licencia | CC-BY-SA 4.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer causal decoder-only estándar con cabecera de clasificación de lenguaje de Llama, 7 capas, 512 de dimensión oculta, 8 cabezas de atención de consulta y 4 cabezas KV (atención con query grouping), y embeddings de entrada y salida atados. El vocabulario BPE tiene 32.768 entradas y la ventana de contexto máxima es de 512 tokens. No se documentan innovaciones arquitectónicas adicionales (no hay decodificación especulativa, atención lineal ni componentes SSM).

El entrenamiento se divide en una fase de preentrenamiento sobre `hotchpotch/fineweb-2-edu-japanese` y una fase de ajuste supervisado (SFT) sobre `llm-jp/oasst2-33k-ja` y `kunishou/databricks-dolly-15k-ja`. No se indica el número de tokens de preentrenamiento, la composición exacta del dataset, ni si hubo RLHF o DPO. El autor reporta una pérdida de validación final de SFT de 3,25926 y una perplejidad de 26,03. La model card atribuye la referencia del decodificador kana-kanji a `Miwa-Keita/zenz-v3.1-small` y `Miwa-Keita/zenz-v3.2-small-gguf` (también CC-BY-SA 4.0).

## Capacidades

- Generación de texto en japonés con mezcla estándar de kanji y kana.
- Conversión de escritura japonesa (kana a kanji y viceversa) como caso de uso principal del linaje Zenz, aunque la model card no detalla métricas específicas de esta tarea para esta variante.
- Modelado de lenguaje causal de propósito general a pequeña escala.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidad monolingüe: únicamente japonés.
- No se documentan modos especiales (thinking, visión, audio) ni capacidades multimodales.

## Casos de uso

- Conversión kana-kanji en preprocesado de texto: el modelo puede emplearse para normalizar o convertir fragmentos de texto japonés entre escrituras en pipelines de NLP, dado su entrenamiento sobre corpus japonés y su vocabulario BPE de 32.768 entradas.
- Referencia de comparación en experimentos de tokenización: sirve como baseline controlado (~39M parámetros) para medir el efecto del vocabulario BPE estándar frente a variantes centradas en kana en tareas de escritura japonesa.
- Prototipado de modelos pequeños en investigación: su tamaño reducido (0,3 GB de repositorio) permite iterar rápidamente en experimentos de arquitectura y datos sin grandes recursos de cómputo.
- Generación de texto japonés breve: adecuado para completar o generar fragmentos cortos (hasta 512 tokens) en contextos donde no se requiere conversación multi-turno.
- Filtrado y etiquetado ligero de corpus japoneses: puede usarse para puntuar perplejidad o coherencia local de textos en tareas de limpieza de datos.
- Despliegue en entornos con recursos muy limitados: al tener ~38,8M de parámetros, puede ejecutarse en CPU o en GPUs de gama baja para tareas de inferencia por lotes no interactivas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El único dato de rendimiento reportado por el autor es la pérdida de validación final de SFT (3,25926) y la perplejidad asociada (26,03), que no son comparables directamente con métricas estándar como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 (~155 MB de pesos) y alrededor de 40-80 MB en cuantizaciones de 8 o 4 bits, aunque no se documentan versiones cuantizadas.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; no se requiere A100 ni H100. Cabe en RTX 3060, RTX 4090, e incluso en GPUs integradas.
- Cabe en GPU consumer: sí, con amplio margen.
- Opciones de despliegue: al ser un modelo LlamaForCausalLM en safetensors, es compatible con transformers, vLLM, llama.cpp (previa conversión a GGUF), Ollama y TGI, aunque no se documentan conversiones oficiales ni configuraciones probadas.
- Latencia y throughput estimados: no disponibles. Por el tamaño, se espera latencia muy baja en GPU y aceptable en CPU, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| zenz-kanji-baseline-40m-bpe32k | ~38,8 M | 512 | CC-BY-SA 4.0 | Hugging Face (0 descargas) |
| Miwa-Keita/zenz-v3.1-small | no disponible en la informacion proporcionada | no disponible | CC-BY-SA 4.0 | Hugging Face |
| Miwa-Keita/zenz-v3.2-small-gguf | no disponible en la informacion proporcionada | no disponible | CC-BY-SA 4.0 | Hugging Face (formato GGUF) |

No se dispone de datos de rendimiento comparables entre estas variantes en la información proporcionada; la comparación se limita a linaje, licencia y formato de distribución.

## Limitaciones y advertencias

- Contexto muy limitado (512 tokens), insuficiente para conversaciones multi-turno o documentos largos.
- Monolingüe (solo japonés); no apto para otros idiomas.
- Riesgo de alucinación inherente a un modelo de ~39M de parámetros entrenado con datos limitados; no se documentan evaluaciones de fidelidad.
- Sesgos desconocidos: no se documenta ningún análisis de sesgos ni de composición demográfica del corpus.
- Licencia CC-BY-SA 4.0: permite uso comercial, pero obliga a atribución y a compartir las obras derivadas bajo la misma licencia, lo que puede ser restrictivo en productos propietarios.
- Sin descargas ni validación comunitaria (0 descargas, 0 likes en el momento de la consulta); no hay evidencia externa de calidad.
- No se documentan cuantizaciones oficiales ni recetas de despliegue probadas.
- El modelo se presenta explícitamente como *baseline* de un experimento comparativo, no como un modelo listo para producción.

## Enlaces

- Hugging Face: https://huggingface.co/anaaaaaa13421312/zenz-kanji-baseline-40m-bpe32k
- Dataset de preentrenamiento: https://huggingface.co/datasets/anaaaaaa13421312/zenz-kana-slm-pretrain-ja
- Dataset de SFT: https://huggingface.co/datasets/anaaaaaa13421312/zenz-kana-slm-sft-ja
- Corpus de preentrenamiento original: https://huggingface.co/datasets/hotchpotch/fineweb-2-edu-japanese
- Dataset SFT (OASST2 ja): https://huggingface.co/datasets/llm-jp/oasst2-33k-ja
- Dataset SFT (Dolly ja): https://huggingface.co/datasets/kunishou/databricks-dolly-15k-ja
- Referencia del decodificador kana-kanji: https://huggingface.co/Miwa-Keita/zenz-v3.1-small
- Referencia del decodificador kana-kanji (GGUF): https://huggingface.co/Miwa-Keita/zenz-v3.2-small-gguf
