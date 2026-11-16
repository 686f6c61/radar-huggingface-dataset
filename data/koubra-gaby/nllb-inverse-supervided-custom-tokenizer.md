# Koubra-Gaby/nllb-inverse-supervided-custom-tokenizer

## Resumen

El modelo `Koubra-Gaby/nllb-inverse-supervided-custom-tokenizer` es un checkpoint de la familia M2M-100 publicado en Hugging Face por el usuario Koubra-Gaby. Se trata de un modelo de traducción automática neuronal (text2text-generation) con arquitectura transformer encoder-decoder, derivado de la línea de trabajo de M2M-100 presentada por Facebook AI en el artículo arXiv:1910.09700. El checkpoint contiene 617.392.128 parámetros y se distribuye en formato safetensors con un tamaño de repositorio de 2,5 GB.

El nombre del repositorio sugiere un proceso de ajuste fino orientado a traducción inversa ("inverse") con un tokenizador personalizado ("custom-tokenizer"), aunque la model card no documenta explícitamente ni la dirección de traducción, ni el dataset de entrenamiento, ni los idiomas cubiertos. La información disponible es mínima: la model card es la plantilla automática de Hugging Face sin rellenar, y el repositorio no registra descargas ni interacciones. Cualquier evaluación de sus capacidades reales requiere inspección directa de los pesos y del tokenizador.

A pesar de la escasez de documentación, el modelo resulta relevante como ejemplo de checkpoint derivado de M2M-100 con modificaciones en el tokenizador, un patrón habitual en proyectos de traducción de bajo recurso o de pares de idiomas específicos. Para producción, sin embargo, la ausencia de licencia, de idiomas declarados y de benchmarks obliga a tratar el modelo como experimental.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (familia M2M-100, tag `m2m_100`) |
| Parametros totales | 617.392.128 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos en safetensors; cuantizaciones GGUF/ONNX no publicadas) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El tag `m2m_100` y la referencia arXiv:1910.09700 enlazan el checkpoint con la arquitectura M2M-100 de Facebook AI, un transformer encoder-decoder con atención multi-cabeza estándar y embeddings de idioma por token (language token) que permiten traducir entre pares de lenguas sin pivote en inglés. El tamaño de 617 millones de parámetros coincide con el orden de magnitud de las variantes intermedias de M2M-100, aunque no se confirma la configuración exacta de capas, dimensiones ocultas ni número de cabezas.

No hay información sobre el número de tokens de entrenamiento, la composición del dataset, el uso de RLHF/DPO ni detalles de la inicialización del tokenizador personalizado. El nombre "inverse-supervided" sugiere entrenamiento supervisado en la dirección inversa de traducción, pero es una inferencia a partir del nombre del repositorio y no un dato documentado. Tampoco se especifica si el ajuste fino fue completo o mediante adaptadores, ni la precisión utilizada (fp16, bf16, fp32).

## Capacidades

- Generación de texto condicionada a tarea de traducción (pipeline `text2text-generation`).
- Traducción automática neuronal, presumiblemente entre pares de idiomas cubiertos por el tokenizador personalizado, aunque los idiomas no están declarados.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no documentadas; el tokenizador personalizado puede alterar el comportamiento respecto al M2M-100 original.
- Capacidades especiales (thinking mode, visión, audio): no disponibles.

## Casos de uso

- Traducción automática de documentos técnicos: el modelo puede emplearse para traducir texto plano entre el par de idiomas para el que fue ajustado, siempre que se valide previamente el tokenizador personalizado con un conjunto de prueba representativo.
- Preprocesado multilingüe en pipelines de datos: generación de traducciones de referencia para corpus de entrenamiento o para aumentar datasets en lenguas de bajo recurso, dado el tamaño moderado del checkpoint (2,5 GB) que permite ejecución en una sola GPU.
- Evaluación comparativa de tokenizadores: el repositorio sirve como caso de estudio para medir el impacto de un tokenizador personalizado frente al tokenizador SentencePiece original de M2M-100 en métricas BLEU/chrF.
- Prototipado de sistemas de traducción inversa: útil en flujos donde se requiere traducir de una lengua meta a una lengua fuente (por ejemplo, para verificación cruzada o generación de pares sintéticos).
- Servicio de traducción de baja latencia en CPU: con 617 M de parámetros y pesos safetensors, es viable su conversión a GGUF y despliegue en llama.cpp u Ollama para entornos sin GPU, aunque dicha conversión no está publicada.
- Investigación en ajuste fino de modelos multilingües: punto de partida para experimentos de fine-tuning en pares de idiomas adicionales, dado el tamaño manejable y la arquitectura conocida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 2,5 GB solo para pesos, más memoria de activaciones y KV cache (estimación típica de 4-6 GB en función de la longitud de secuencia).
- VRAM estimada en fp16/bf16: aproximadamente 1,3 GB para pesos, con 2-4 GB totales considerando activaciones.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM (RTX 3060, RTX 4060, RTX 4090, A100, H100); el modelo es holgadamente ejecutable en consumer GPU.
- Despliegue: compatible con `transformers` (pipeline `text2text-generation`), y potencialmente con TGI y vLLM si se valida la arquitectura exacta; no se han publicado conversiones a GGUF para llama.cpp/Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Koubra-Gaby/nllb-inverse-supervided-custom-tokenizer | 617 M | No disponible | No disponible | Hugging Face (0 descargas) |
| facebook/m2m100_418M | 418 M | 1024 tokens (configuración original) | MIT (según repositorio original) | Hugging Face, ampliamente usado |
| facebook/m2m100_1.2B | 1,2 B | 1024 tokens (configuración original) | MIT (según repositorio original) | Hugging Face |
| facebook/nllb-200-distilled-600M | 600 M | 1024 tokens (configuración original) | CC-BY-NC 4.0 (según repositorio original) | Hugging Face |

La comparación se basa en el tamaño y la familia arquitectónica; no hay datos de rendimiento del checkpoint evaluado que permitan comparar métricas de traducción.

## Limitaciones y advertencias

- La model card es la plantilla automática sin rellenar: no hay información sobre sesgos, datos de entrenamiento ni evaluación.
- Riesgo elevado de alucinación y de traducciones incorrectas al no existir validación publicada del ajuste fino ni del tokenizador personalizado.
- Idiomas soportados no declarados: no es posible saber qué pares de lenguas cubre sin inspeccionar el tokenizador y probar el modelo.
- Licencia no disponible: no se puede asumir uso comercial permitido; es imprescindible contactar con el autor antes de cualquier despliegue en producción.
- Longitud de contexto no documentada; el tokenizador personalizado puede reducir o alterar la cobertura de vocabulario respecto al M2M-100 original.
- Cero descargas y cero likes: no hay evidencia de uso comunitario ni de validación por terceros.
- El nombre del repositorio sugiere una dirección de traducción específica ("inverse") que no está confirmada; usarlo en la dirección opuesta puede degradar la calidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Koubra-Gaby/nllb-inverse-supervided-custom-tokenizer
- Artículo de referencia M2M-100: https://arxiv.org/abs/1910.09700
- Modelo original M2M-100 (Facebook AI): https://huggingface.co/facebook/m2m100_418M
- Calculadora de impacto ambiental citada en la model card: https://mlco2.github.io/impact
