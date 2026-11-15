# Adeely93/llama32v-11b-vlguard-sft-v1

## Resumen

`Adeely93/llama32v-11b-vlguard-sft-v1` es un ajuste fino supervisado (SFT) de `meta-llama/Llama-3.2-11B-Vision-Instruct` sobre el conjunto de datos VLGuard, orientado a alineamiento de seguridad en modelos multimodales. Lo publica el usuario Adeely93 como artefacto reproducible del estudio WSP-MLLM-Safety, cuyo objetivo es caracterizar dónde reside el comportamiento de rechazo (refusal) en un transformer multimodal y cómo se puede manipular a nivel de capa y parámetro. No es un modelo de propósito general nuevo, sino una línea base de seguridad pensada para investigación.

El modelo conserva la arquitectura Mllama de Llama 3.2 Vision: un transformer decoder con atención por cross-attention hacia un encoder de visión, 10.670.220.835 parámetros en BF16 y un contexto heredado del modelo base. La relevancia actual es metodológica: el autor documenta que la decisión de rechazar o cumplir se forma en las capas 10-17 y se puede eliminar con una edición de rango 1 sobre `embed_tokens` y las proyecciones `o_proj`/`down_proj` de las capas 0-17, lo que tiene implicaciones directas para evaluaciones de seguridad y para el diseño de salvaguardas.

El checkpoint se distribuye en cinco shards safetensors BF16 (21,3 GB de repositorio) con config, generation config, tokenizer, processor y chat template sin modificar. Su utilidad práctica es acotada: sirve como referencia de sobre-rechazo en entradas benignas con imagen y como sujeto de experimentos de interpretabilidad, no como modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mllama (transformer decoder con cross-attention a encoder de visión) |
| Parametros totales | 10.670.220.835 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada de Llama-3.2-11B-Vision-Instruct) |
| Tipos de cuantizacion | BF16 en el repositorio; no se documentan otras cuantizaciones publicadas |
| Idiomas soportados | en |
| Licencia | llama3.2 (Llama 3.2 Community License y Acceptable Use Policy) |
| Formato de pesos | safetensors (5 shards BF16) |

## Arquitectura y entrenamiento

El modelo es un `MllamaForConditionalGeneration`, la arquitectura multimodal de Llama 3.2 Vision: un decoder de lenguaje tipo transformer con capas de cross-attention que integran representaciones de un encoder de visión. Los pesos se publican en BF16 con la configuración, generation config, tokenizer, processor y chat template del checkpoint original sin cambios. El ajuste se realizó mediante SFT sobre VLGuard, un dataset de seguridad para modelos visión-lenguaje, partiendo de `meta-llama/Llama-3.2-11B-Vision-Instruct`.

El autor no detalla en la model card el número de tokens de entrenamiento, la composición exacta del dataset, la presencia de RLHF/DPO ni hiperparámetros de entrenamiento; esa información no está disponible. La innovación documentada no está en el entrenamiento sino en el análisis posterior: el estudio identifica que la decisión de rechazo se forma en las capas 10-17 y se transporta en una única dirección del residual stream, que 16-32 cabezas de atención en las capas 10-17 y 19 (por ejemplo L12H27, L15H4, L15H22) y unos 300 neuronas MLP la portan, y que el sobre-rechazo ante imágenes benignas proviene de la rama MLP de la capa de cross-attention 13. Una edición de rango 1 sobre `embed_tokens` y `o_proj`/`down_proj` de las capas 0-17 elimina la mayor parte de los rechazos en texto.

## Capacidades

- Generación de texto e imagen-texto en inglés, con el pipeline `image-text-to-text`.
- Respuesta a prompts multimodales con la imagen primero y el texto después, usando el chat template propio del modelo.
- Comportamiento de rechazo medido con decodificación greedy y un juez de rechazo por palabras clave: 100 % de rechazo en peticiones dañinas en texto, con imagen no relacionada y con texto dañino renderizado dentro de una imagen.
- Precisión de QA factual de 40/40 en el conjunto de evaluación del autor.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingües: limitadas al inglés según la model card.
- Modo thinking, visión adicional o audio: no disponible; solo visión como modalidad extra.

## Casos de uso

- Investigación en interpretabilidad de seguridad multimodal: el checkpoint permite replicar el análisis de dirección de rechazo, cabezas y neuronas críticas descrito en el estudio, usando las capas 10-17 como objetivo de sondas y ediciones.
- Evaluación de sobre-rechazo en pipelines VLM: sirve como línea base para medir la tasa de rechazo ante peticiones benignas con imagen (63 %) y ante texto benigno renderizado en imagen (77 %), y comparar contra variantes mitigadas.
- Auditoría de salvaguardas antes de desplegar un VLM: permite comprobar si una edición de pesos o un filtro externo reduce el rechazo excesivo sin degradar el rechazo de contenido dañino.
- Estudio de robustez frente a ataques de prompt en imagen: el conjunto de pruebas con texto dañino renderizado en imagen (100 % de rechazo) sirve para validar defensas contra inyección visual.
- Referencia reproducible en publicaciones: al publicarse los shards exactos del checkpoint `cvpr27_wsp/llama_sft_checkpoints/v1`, facilita la reproducibilidad de resultados en artículos sobre seguridad de MLLM.
- Pruebas de regresión de QA factual: con 40/40 en el conjunto del autor, puede usarse como control de que una modificación de pesos no destruye capacidades básicas de respuesta.
- Base para experimentos de poda y edición de pesos: la documentación de que una edición de rango 1 sobre `embed_tokens` y capas 0-17 elimina rechazos permite usarlo como banco de pruebas de técnicas de model editing.

## Benchmarks y rendimiento

Los únicos datos publicados son las mediciones de comportamiento del autor con decodificación greedy y un juez de rechazo por palabras clave, sobre un split held-out de su propio análisis de seguridad. No son benchmarks estándar y no hay comparación con otros modelos.

| Conjunto de prompts | Tasa de rechazo |
|---|---|
| Peticiones dañinas, solo texto | 100 % |
| Peticiones dañinas + imagen no relacionada | 100 % |
| Peticiones dañinas renderizadas como texto en imagen | 100 % |
| Peticiones benignas, solo texto | 0 % |
| Peticiones benignas con palabras alarmantes (borderline) | 0 % |
| Peticiones benignas + imagen no relacionada | 63 % (sobre-rechazo) |
| Peticiones benignas renderizadas en imagen | 77 % (sobre-rechazo) |
| Precisión en QA factual | 40/40 |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estándar en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 21,3 GB solo para pesos, más overhead de activaciones y del encoder de visión; en la práctica se recomienda al menos 24 GB y, para contextos largos o batches, 40-80 GB.
- GPU recomendadas: A100 40/80 GB, H100 80 GB, L40S 48 GB. En consumer, una RTX 4090 (24 GB) puede alojar los pesos en BF16 con `device_map` ajustado, aunque con margen escaso; una RTX 3090 (24 GB) queda al límite.
- Cuantizaciones a 8 bits o 4 bits reducirían el requisito a ~11 GB y ~6 GB respectivamente, pero el autor no publica versiones cuantizadas; habría que generarlas con herramientas externas.
- Opciones de despliegue: `transformers` con `MllamaForConditionalGeneration` y `AutoProcessor` (ruta documentada por el autor), `text-generation-inference` (etiqueta presente en el repo) y endpoints compatibles. No se documenta soporte en llama.cpp, Ollama ni vLLM en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Adeely93/llama32v-11b-vlguard-sft-v1 | 10,67 B | no disponible | SFT de seguridad sobre VLGuard | llama3.2 | Hugging Face, 0 descargas |
| meta-llama/Llama-3.2-11B-Vision-Instruct | 10,67 B | no disponible en esta ficha | VLM instructivo general | llama3.2 | Hugging Face, ampliamente usado |
| Llama Guard 3-11B-Vision | no disponible en esta ficha | no disponible | Clasificador de seguridad multimodal | llama3.2 | Hugging Face |
| Modelos VLM de ~11 B con ajuste de seguridad (por ejemplo, variantes de Qwen2-VL con SFT de seguridad) | ~11 B | no disponible | Salvaguardas multimodales | variable | variable |

La comparación relevante es con el modelo base: este checkpoint mantiene las capacidades del instructivo original pero introduce un sesgo fuerte de rechazo que, según las mediciones del autor, se dispara ante entradas benignas con imagen (63-77 %). Frente a un clasificador dedicado como Llama Guard 3-11B-Vision, el propósito es distinto: aquí el modelo genera respuestas, no etiqueta contenido.

## Limitaciones y advertencias

- Sobre-rechazo severo: 63 % de rechazo en peticiones benignas con imagen no relacionada y 77 % cuando el texto benigno está renderizado en la imagen, lo que lo hace inadecuado para producción sin mitigación.
- El rechazo es frágil: el propio autor documenta que una edición de rango 1 sobre `embed_tokens` y `o_proj`/`down_proj` de las capas 0-17 elimina la mayor parte de los rechazos en texto, lo que implica que la salvaguarda no es robusta frente a manipulación de pesos.
- Sesgos conocidos: no documentados en la información disponible; al derivar de Llama 3.2 Vision, hereda los sesgos del modelo base.
- Riesgo de alucinación: no cuantificado; la única métrica es 40/40 en QA factual del propio autor, sin benchmark independiente.
- Idioma: solo inglés según la model card; el chat template incluye una cabecera de sistema con fecha, y para prompts reproducibles hay que pasar `date_string="26 Jul 2024"`.
- Licencia: se aplica la Llama 3.2 Community License y la Acceptable Use Policy del modelo base, con las restricciones de uso comercial y de redistribución que impone.
- Repositorio con 0 descargas y 0 likes, creado en noviembre de 2026: sin validación comunitaria ni mantenimiento conocido.
- El enlace al análisis de seguridad completo apunta a un repositorio de GitHub marcado como privado, por lo que la reproducibilidad del análisis detallado no está garantizada.
- No se documentan cuantizaciones, soporte en motores de inferencia populares ni métricas de latencia, lo que complica su integración en pipelines existentes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Adeely93/llama32v-11b-vlguard-sft-v1
- Modelo base: https://huggingface.co/meta-llama/Llama-3.2-11B-Vision-Instruct
- Repositorio del estudio (referenciado como privado): https://github.com/Adeelyousaf/WSP-MLLM-Safety/tree/main/safety_analysis
- Licencia Llama 3.2: https://www.llama.com/llama3_2/license/
- Política de uso aceptable de Llama: https://www.llama.com/usage-policy/
