# elginarda-hg/gemma-4-26B-A4B-it-BF16-untied-GGUF

## Resumen

Gemma 4 26B-A4B-it es un modelo de lenguaje de Google con arquitectura Mixture of Experts (MoE), 25.971.339.550 parámetros totales y 4B parámetros activos por token (según la nomenclatura A4B del nombre). Este repositorio concreto, publicado por el usuario elginarda-hg, no contiene el modelo original sino conversiones a GGUF en precisión BF16 de dos checkpoints oficiales, pensadas como fuente para cuantización posterior.

La particularidad técnica del repositorio es que los ficheros GGUF están "untied": el tensor de salida (LM head) se ha separado del tensor de embeddings de entrada, añadiendo un `output.weight` explícito que es una copia BF16 exacta de `token_embd.weight`. Esto permite a `llama-quantize` aplicar tipos de cuantización distintos a embeddings y a la capa de salida mediante los flags `--token-embedding-type` y `--output-tensor-type`, sin alterar las salidas respecto al modelo original con pesos atados.

Es relevante para desarrolladores que necesitan generar sus propias cuantizaciones GGUF (Q4_K_M, Q5_K_M, Q8_0, etc.) a partir de pesos BF16 sin pérdida, manteniendo control independiente sobre la precisión de los tensores más sensibles. El repositorio incluye únicamente la torre de texto; los pesos de visión no están incluidos. La licencia es Apache 2.0, igual que los modelos fuente.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE) tipo transformer, según nomenclatura A4B del checkpoint base; detalles internos no disponibles |
| Parámetros totales | 25.971.339.550 |
| Parámetros activos | 4B (deducido de la nomenclatura A4B; no confirmado en la información proporcionada) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | BF16 (ficheros de este repo); el modelo está pensado como fuente para generar otras cuantizaciones con `llama-quantize` |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (BF16, con tensor de salida "untied") |

## Arquitectura y entrenamiento

El modelo base es un Mixture of Experts de Google identificado como Gemma 4 26B-A4B-it, con aproximadamente 26.000 millones de parámetros totales y 4.000 millones activos por token. No se dispone en la información proporcionada de detalles sobre el número de expertos, la estrategia de enrutamiento, la composición del dataset de entrenamiento, el número de tokens vistos ni las etapas de alineación (RLHF, DPO u otras).

La innovación técnica de este repositorio es la conversión "untied": los ficheros se generaron con `convert_hf_to_gguf.py` de llama.cpp en el commit `b94959a`, usando `--outtype bf16` y transformers 5.x. Como el modelo original ata el LM head a `token_embd.weight`, la conversión añade un `output.weight` explícito (copia BF16 exacta del tensor de embeddings) para que el cuantizador pueda tratar ambos tensores de forma independiente. Según el autor, las salidas son idénticas al modelo con pesos atados. Se incluyen dos ficheros, correspondientes a los checkpoints `google/gemma-4-26B-A4B-it` y `google/gemma-4-26B-A4B-it-qat-q4_0-unquantized`. Solo se convierte la torre de texto.

## Capacidades

- Generación de texto conversacional: el sufijo `-it` indica un checkpoint ajustado para instrucciones y diálogo.
- Razonamiento y generación de contenido general, heredados del modelo base Gemma 4.
- Capacidades multimodales: no disponibles en este repositorio, ya que solo se incluye la torre de texto y se excluyen los pesos de visión.
- Tool calling / function calling: no confirmado en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no confirmado en la información proporcionada.
- Capacidades multilingües: no disponibles.
- Modo "thinking" u otras capacidades especiales: no disponibles.

## Casos de uso

- Generación de cuantizaciones propias: el uso principal del repositorio es servir como fuente BF16 para producir GGUF en Q4_K_M, Q5_K_M, Q8_0 u otros tipos con `llama-quantize`, eligiendo por separado el tipo de los embeddings y del tensor de salida gracias a la conversión "untied".
- Despliegue en llama.cpp: los ficheros BF16 pueden cargarse directamente en llama.cpp para inferencia en CPU o GPU, aunque por su tamaño son más adecuados como paso intermedio hacia cuantizaciones más pequeñas.
- Evaluación de precisión de cuantización: al disponer de una copia BF16 sin pérdida, permite comparar la perplejidad y la calidad de salida de distintas cuantizaciones contra la referencia exacta.
- Investigación sobre MoE: el modelo permite estudiar el comportamiento de un MoE de 26B totales y 4B activos en entornos de inferencia locales, con un coste por token inferior al de un modelo denso del mismo tamaño total.
- Integración en pipelines de CI/CD para modelos: el formato GGUF y la compatibilidad con endpoints permiten automatizar la conversión, cuantización y publicación de variantes en un flujo reproducible.
- Ajuste fino con control de precisión: el tensor de salida separado facilita experimentos donde se mantiene el LM head en mayor precisión mientras se cuantizan agresivamente los embeddings.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 52 GB solo para pesos (26B parámetros × 2 bytes), más overhead de contexto y caché KV; en la práctica se recomienda al menos 64-80 GB.
- GPU recomendadas para BF16: A100 80 GB, H100 80 GB, o configuraciones multi-GPU (por ejemplo, 2× RTX 4090 24 GB o 2× A6000 48 GB) con reparto de capas.
- GPU de consumo: no cabe en una única GPU de consumo en BF16. Tras cuantizar a Q4_K_M (aproximadamente 15-16 GB), podría caber en una RTX 4090 24 GB o RTX 3090 24 GB, siempre que el contexto no sea muy largo.
- Opciones de despliegue: llama.cpp (formato nativo), Ollama y otros runners compatibles con GGUF. vLLM y TGI no consumen GGUF de forma nativa; requerirían los pesos originales en safetensors.
- Latencia y throughput: no disponibles. Al ser un MoE con 4B parámetros activos, el coste por token debería aproximarse al de un modelo denso de 4B en cómputo, aunque condicionado por el ancho de banda de memoria al cargar los expertos.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| Gemma 4 26B-A4B-it (este repo, GGUF BF16) | 25,97B | 4B (según nomenclatura) | no disponible | Apache 2.0 | GGUF |
| google/gemma-4-26B-A4B-it (original) | 25,97B | 4B (según nomenclatura) | no disponible | Apache 2.0 | safetensors |
| google/gemma-4-26B-A4B-it-qat-q4_0-unquantized | 25,97B | 4B (según nomenclatura) | no disponible | Apache 2.0 | safetensors |

No se dispone de datos de rendimiento ni de contexto para establecer comparaciones cuantitativas con alternativas de otros fabricantes.

## Limitaciones y advertencias

- Este repositorio no es un modelo entrenado de forma independiente: es una conversión de formato de checkpoints de Google; cualquier sesgo o limitación del modelo base se hereda íntegramente.
- Solo contiene la torre de texto: no incluye pesos de visión, por lo que no puede usarse para tareas multimodales aunque el modelo base las soporte.
- Los ficheros BF16 ocupan 104 GB en total (dos variantes); el tamaño por fichero ronda los 52 GB, lo que dificulta su uso directo en hardware de consumo.
- Riesgo de alucinación inherente a los modelos de lenguaje; no se han publicado evaluaciones específicas en este repositorio.
- Idiomas soportados no documentados en esta ficha; conviene verificar el comportamiento en castellano antes de usarlo en producción.
- Aunque la licencia es Apache 2.0, deben revisarse los términos del modelo base de Google por si imponen condiciones adicionales de uso aceptable.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia comunitaria de validación de los ficheros.
- La conversión "untied" modifica la estructura de tensores; herramientas que asuman pesos atados podrían comportarse de forma distinta, aunque el autor afirma que las salidas son idénticas.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/elginarda-hg/gemma-4-26B-A4B-it-BF16-untied-GGUF
- Modelo base: https://huggingface.co/google/gemma-4-26B-A4B-it
- Checkpoint QAT sin cuantizar: https://huggingface.co/google/gemma-4-26B-A4B-it-qat-q4_0-unquantized
- Script de conversión de llama.cpp: `convert_hf_to_gguf.py` en el repositorio de llama.cpp (commit `b94959a`)
