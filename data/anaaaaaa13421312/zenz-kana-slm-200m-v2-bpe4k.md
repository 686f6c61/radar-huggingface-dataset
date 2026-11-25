# anaaaaaa13421312/zenz-kana-slm-200m-v2-bpe4k

## Resumen

El modelo `zenz-kana-slm-200m-v2-bpe4k` es un pequeño modelo de lenguaje (SLM) de aproximadamente 196 millones de parámetros, desarrollado por el usuario de Hugging Face `anaaaaaa13421312`, especializado en la generación de texto en katakana japonés. Se trata de un `Qwen3ForCausalLM` preentrenado con unos 3.600 millones de tokens y posteriormente ajustado mediante SFT sobre 135.865 diálogos en katakana. Su propósito no es generar japonés estándar (kanji-kana mixto), sino producir lecturas en katakana que se combinan con un decodificador Zenz externo para reconstruir texto japonés convencional.

La relevancia del modelo radica en su enfoque de nicho: en lugar de competir como un chatbot generalista, actúa como componente de un pipeline de conversión kana-kanji. Al emplear un tokenizador BPE con un vocabulario reducido de 4.096 tokens y entrenar sobre corpus convertidos a katakana mediante SudachiPy, el modelo reduce la complejidad del vocabulario a costa de delegar la desambiguación ortográfica al decodificador Zenz. Está pensado para entornos con recursos limitados (entrenado en TPU v5e-8 de Kaggle) y para experimentación con arquitecturas Qwen3 a pequeña escala.

El modelo se publica bajo licencia `other` (compuesta, según los conjuntos de datos de origen) y solo soporta japonés. No se han publicado resultados de benchmarks estándar en la información disponible, y su utilidad práctica está intrínsecamente ligada a la integración con el ecosistema Zenz.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3ForCausalLM (transformer decoder-only) |
| Parametros totales | 195.859.584 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | japones (katakana) |
| Licencia | other (compuesta; ver LICENSE del repositorio) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de la familia Qwen3, con 17 capas, dimensión oculta de 1.024, dimensión intermedia de 2.816, 16 cabezas de atención de consulta y 4 de clave/valor, `head_dim` de 64, QK-Norm y embeddings atados (tied embeddings). El preentrenamiento se realizó sobre 3.599.892.480 tokens durante 12.564,3 segundos en una TPU v5e-8, alcanzando un `val_bpc_raw` de 2,49304, un `val_bpb_raw` de 0,9033 y una perplejidad de validación de 14,344. El corpus de preentrenamiento combina FineWeb-2 EDU japonés (~70%), Wikipedia japonesa (~25%) y Aozora Bunko (~5%), con conversión a katakana mediante SudachiPy en la rama kana.

El ajuste SFT se llevó a cabo durante 2 épocas (2.122 pasos, 135.865 filas conservadas, 54.773.249 tokens válidos) con pérdida de entropía cruzada solo sobre el turno del asistente, en 998,4 segundos sobre TPU v5e-8. La mejor validación SFT (398.029 tokens de asistente, paso 2.122) reporta `val_loss` de 1,34091 y `val_ppl` de 3,823. El formato de prompt es `<|bos|><|user|>...<|end|><|assistant|>...<|eos|>`. Los datos SFT provienen de Magpie SFT v1.0 (60.000), Magpie-Tanuki-8B (40.000), extraction-wiki-ja (35.000), chatbot-arena-ja (1.394) y llm-jp-instructions (600), todos convertidos a katakana en la rama correspondiente.

## Capacidades

- Generación de texto en katakana japonés con formato conversacional de un solo turno o multi-turno según el template `<|user|>` / `<|assistant|>`.
- Conversión de diálogo a lecturas katakana para su posterior reconstrucción con un decodificador Zenz (kana a kanji).
- Generación condicionada por instrucciones en el dominio del SFT (diálogos de Magpie, extracción de Wikipedia, instrucciones de llm-jp).
- Manejo de vocabulario reducido (4.096 tokens BPE), lo que simplifica el modelo de embedding y reduce el coste de inferencia.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo de razonamiento extendido (thinking mode).
- Capacidad multilingüe limitada al japonés; no se declara soporte de otros idiomas.

## Casos de uso

- Front-end de conversión kana-kanji: el modelo genera la secuencia de katakana a partir del historial de diálogo y un decodificador Zenz (`Miwa-Keita/zenz-v3.2-small-gguf` u otro) reconstruye el texto japonés estándar. Adecuado por su bajo coste y su vocabulario BPE de 4.096 tokens.
- Prototipado de asistentes conversacionales en japonés sobre hardware modesto: con ~196M parámetros, cabe en GPU de consumo y permite iterar rápidamente en pipelines de diálogo.
- Investigación en tokenización reducida: sirve como banco de pruebas para estudiar el equilibrio entre tamaño de vocabulario, calidad de representación y dependencia de un decodificador externo.
- Generación de lecturas katakana para TTS o sistemas de lectura asistida: el modelo produce la secuencia fonética que puede alimentar un sintetizador o un corrector ortográfico.
- Ajuste fino adicional (fine-tuning) sobre dominios concretos: al ser un SLM con licencia `other` y pesos safetensors, es viable reentrenar sobre corpus katakana específicos (por ejemplo, atención al cliente de un sector).
- Evaluación comparativa de arquitecturas Qwen3 a escala pequeña: útil para medir el impacto de QK-Norm, tied embeddings y vocabulario reducido en tareas japonesas.
- Componente de sistemas de normalización textual: conversión de texto japonés a katakana para búsqueda fonética o indexación, integrado con SudachiPy en el preprocesado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

Los únicos datos de rendimiento reportados por el autor son métricas de validación internas:

| Metrica | Valor |
|---|---|
| val_bpc_raw (preentrenamiento) | 2,49304 |
| val_bpb_raw (preentrenamiento) | 0,9033 |
| val_ppl (preentrenamiento) | 14,344 |
| val_loss (SFT, mejor) | 1,34091 |
| val_ppl (SFT, mejor) | 3,823 |
| Tokens de preentrenamiento | 3.599.892.480 |
| Tokens válidos SFT | 54.773.249 |

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: en torno a 0,4 GB para los pesos (196M parámetros × 2 bytes), más overhead de activaciones y caché KV; en la práctica, menos de 2 GB para contextos moderados.
- VRAM estimada en cuantización de 8 bits: ~0,2 GB de pesos; en 4 bits: ~0,1 GB. Los tipos de cuantización concretos no están documentados por el autor.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM; cabe holgadamente en RTX 3060, RTX 4060, RTX 4090, A100 y H100. También es viable en CPU.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU consumer moderna e incluso en iGPU con suficiente memoria compartida.
- Opciones de despliegue: `transformers` (librería declarada), `text-generation-inference` (tag `text-generation-inference`), y potencialmente llama.cpp/Ollama si se generan pesos GGUF (no publicados). El tag `endpoints_compatible` sugiere compatibilidad con Inference Endpoints de Hugging Face.
- Latencia y throughput: no disponibles. El entrenamiento se realizó en TPU v5e-8, pero no se reportan métricas de inferencia.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de modelos directamente comparables en la información proporcionada. Como referencia cualitativa de la misma categoría (SLM japoneses de ~200M parámetros), podrían considerarse los modelos Zenz de `Miwa-Keita`, pero no se aportan parámetros, contexto ni resultados que permitan una comparación rigurosa.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| zenz-kana-slm-200m-v2-bpe4k | 195.859.584 | no disponible | other | Hugging Face |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El modelo solo genera katakana; no produce japonés estándar por sí mismo. Requiere un decodificador Zenz externo para obtener texto kanji-kana, lo que añade una dependencia y un paso adicional en producción.
- Licencia `other` compuesta: los conjuntos de datos de origen tienen licencias heterogéneas (ODC-By v1.0, CC-BY-SA 4.0, CC-BY 4.0, Apache-2.0, términos de CommonCrawl). Es imprescindible revisar el archivo LICENSE del repositorio antes de cualquier uso comercial.
- Riesgo de alucinación inherente a un SLM de ~196M parámetros entrenado con 3,6B tokens; la calidad factual es limitada y no debe usarse como fuente de verdad.
- Sesgos potenciales heredados de FineWeb-2 EDU, Wikipedia y Aozora Bunko, así como de los datos SFT generados por otros modelos (calm3-22b-chat, Qwen2.5-32B-Instruct, Tanuki-8B-dpo-v1.0).
- Longitud de contexto no documentada; no se garantiza el manejo de conversaciones largas.
- Sin soporte declarado de tool calling, agentes, visión ni audio.
- Sin resultados de benchmarks públicos; la evaluación se limita a métricas de validación internas del autor.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación por parte de la comunidad.
- El tag `region:us` y la fecha de creación (2026-11-24) deben verificarse; el modelo parece muy reciente y poco probado en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/anaaaaaa13421312/zenz-kana-slm-200m-v2-bpe4k
- Rama de preentrenamiento: https://huggingface.co/anaaaaaa13421312/zenz-kana-slm-200m-v2-bpe4k/tree/pretrain
- Dataset de preentrenamiento: https://huggingface.co/datasets/anaaaaaa13421312/zenz-kana-slm-v2-pretrain-shards
- Dataset SFT: https://huggingface.co/datasets/anaaaaaa13421312/zenz-kana-slm-v2-sft-ja
- Decodificador Zenz de referencia: https://huggingface.co/Miwa-Keita/zenz-v3.2-small-gguf
- FineWeb-2 EDU japonés: https://huggingface.co/datasets/hotchpotch/fineweb-2-edu-japanese
- Wikipedia japonesa (202506): https://huggingface.co/datasets/OmniAICreator/Japanese-Wikipedia-202506
- Aozora Bunko clean: https://huggingface.co/datasets/globis-university/aozorabunko-clean
- SudachiPy: https://github.com/WorksApplications/SudachiPy
- Magpie SFT v1.0: https://huggingface.co/datasets/llm-jp/magpie-sft-v1.0
- Magpie-Tanuki-8B-97k: https://huggingface.co/datasets/Aratako/Magpie-Tanuki-8B-97k
- extraction-wiki-ja: https://huggingface.co/datasets/llm-jp/extraction-wiki-ja
- llm-jp chatbot-arena-conversations: https://huggingface.co/datasets/llm-jp/llm-jp-chatbot-arena-conversations
- llm-jp-instructions: https://huggingface.co/datasets/llm-jp/llm-jp-instructions
