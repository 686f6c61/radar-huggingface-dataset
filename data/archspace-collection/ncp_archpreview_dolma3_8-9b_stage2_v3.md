# ArchSpace-Collection/NCP_ArchPreview_dolma3_8.9B_Stage2_v3

## Resumen

NCP-ArchPreview 8.9B Stage 2 v3 es un modelo de lenguaje base de la familia NCP (Next Concept Prediction), desarrollado por The NCP Team del Shanghai AI Lab y LUMIA Lab de la Universidad Jiao Tong de Shanghai. Se trata de la variante V3 de la segunda etapa de entrenamiento, que continúa desde el Stage 1 sobre el dataset Dolma 3 Dolmino, siguiendo el currículo de datos de OLMo-3. El modelo tiene aproximadamente 8.94B parámetros y un contexto de entrenamiento de 8.192 tokens.

La arquitectura combina Next Token Prediction (NTP) con Next Concept Prediction (NCP), lo que le permite operar simultáneamente en el espacio de tokens y en un espacio de conceptos latentes. Está compuesto por 16 capas encoder, 8 capas de módulo de conceptos y 16 capas decoder. El Stage 2 mantiene estas estructuras del Stage 1 y refina tanto las capacidades a nivel de token como el espacio de conceptos aprendido.

Su relevancia radica en que el informe del equipo reporta que alcanza la pérdida de entrenamiento final del modelo OLMo-3-7B utilizando el 66.2% de los tokens, lo que implica una convergencia de 1.51x en presupuesto de tokens. Sin embargo, el propio autor advierte que la variante V3 no es la más fuerte de las tres recetas de Stage 2: V1 es la que mejor rendimiento muestra en capacidades de código, matemáticas, STEM y razonamiento lógico. V3 destaca en HellaSwag, pero es la más débil en los demás benchmarks evaluados.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido con predicción conjunta de tokens y conceptos (NTP + NCP). Compuesto por 16 capas encoder, 8 capas de módulo de conceptos y 16 capas decoder. |
| Parametros totales | 8.938.363.792 (~8.94B) |
| Parametros activos | no disponible |
| Longitud de contexto | 8.192 tokens (contexto de entrenamiento) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bfloat16) |

## Arquitectura y entrenamiento

El modelo pertenece a la familia NCP-ArchPreview, que extiende la arquitectura OLMo-3 con un módulo de conceptos intermedio. La estructura es de tipo encoder-decoder con un módulo de conceptos en medio: 16 capas encoder procesan la secuencia de tokens, 8 capas de módulo de conceptos operan en el espacio latente, y 16 capas decoder generan los tokens de salida. El entrenamiento se realiza con dos objetivos simultáneos: Next Token Prediction (NTP) y Next Concept Prediction (NCP), lo que permite al modelo aprender representaciones de alto nivel además de la predicción de tokens.

El Stage 2 continúa desde el Stage 1 y se entrena sobre Dolma 3 Dolmino, siguiendo la segunda etapa del currículo de datos de OLMo-3. Según el informe del equipo, el Stage 2 alcanza la pérdida de entrenamiento final del modelo OLMo-3-7B con el 66.2% de los tokens, lo que corresponde a una convergencia de 1.51x en presupuesto de tokens. Esta comparación es a nivel de pérdida de entrenamiento, no de throughput de inferencia. No se documenta ningún proceso de alineación posterior como RLHF o DPO; el modelo se publica como modelo base.

## Capacidades

- Generación de texto y razonamiento generalista, con puntuaciones destacadas en MMLU (68.48) y GSM8K (83.02) en la comparativa principal del informe.
- Razonamiento matemático en varios niveles, incluyendo GSM8K, GSM-Symbolic, MATH-500 y Minerva. Para la variante V3, los resultados en MATH-500 y Minerva son 37.21 y 36.70 respectivamente.
- Generación de código en Python, con resultados moderados en HumanEval (39.96 en V3) y MBPP (46.60 en V3).
- Razonamiento lógico y tareas de opción múltiple STEM, con puntuaciones de 60.44 en BBH y 57.72 en MMLU-STEM para V3.
- Capacidad de operar en un espacio de conceptos latentes gracias a NCP, lo que permite su uso como modelo objetivo en esquemas de decodificación especulativa basada en conceptos.
- No se documenta soporte de tool calling ni capacidades multimodales (visión, audio).

## Casos de uso

- Investigación en interpretabilidad de espacios latentes: al combinar NTP y NCP, el modelo permite estudiar cómo se organizan los conceptos en el espacio latente. Se puede utilizar con el código de evaluación de NCP para analizar representaciones y comparar con modelos OLMo-3 estándar.
- Decodificación especulativa y aceleración de inferencia: la familia Stage 2 está pensada para servir como modelo objetivo en esquemas de concept-conditioned drafting. Aunque el informe asocia V1 como el target del modelo NCPFlash, V3 comparte la misma arquitectura NCP y podría usarse de forma similar en pipelines de decodificación especulativa para reducir latencia.
- Razonamiento matemático en entornos educativos: con 83.02 en GSM8K en la comparativa principal, el modelo puede generar soluciones paso a paso para problemas aritméticos y algebraicos en plataformas de tutoría, siempre que se verifiquen los resultados.
- Generación de código en investigación: aunque su HumanEval es moderado (39.96 en V3), puede emplearse para tareas de generación de código en Python cuando se combina con herramientas de verificación de ejecución. Para uso en producción sería necesario fine-tuning.
- Evaluación y reproducción de experimentos de entrenamiento: como modelo base con licencia Apache 2.0, es útil para reproducir y comparar el efecto del entrenamiento en dos etapas sobre el mismo dataset, en trabajos de investigación de sistemas de entrenamiento.
- Análisis de textos académicos STEM: con MMLU-STEM 57.72 y MMLU 68.48 en la comparativa principal, el modelo puede utilizarse en sistemas de extracción de conocimiento o resumen de papers científicos, con supervisión humana.
- Fine-tuning para tareas específicas: al ser un modelo base sin restricciones de licencia comercial, permite adaptarlo con técnicas como SFT o DPO a dominios concretos como atención al cliente o generación de informes técnicos.

## Benchmarks y rendimiento

Se han publicado resultados de benchmarks en la información disponible. La siguiente tabla corresponde a la comparativa principal del informe, que se aplica al modelo Stage 2 en general y no debe asignarse a la variante V3:

| Metrica | OLMo-3-7B Stage 2 | NCP-ArchPreview Stage 2 | Delta |
|---|---|---|---|
| Overall AVG | 56.98 | 57.57 | +0.59 |
| MMLU | 66.66 | 68.48 | +1.82 |
| GSM8K | 79.68 | 83.02 | +3.34 |
| GSM-Symbolic | 57.32 | 60.32 | +3.00 |
| MATH-500 | 43.44 | 43.91 | +0.47 |
| HumanEval | 49.31 | 45.62 | -3.69 |
| MBPP | 48.98 | 50.85 | +1.87 |
| ARC-Challenge | 85.49 | 83.28 | -2.21 |
| PIQA | 78.35 | 81.45 | +3.10 |

La siguiente tabla compara las tres variantes de recetas de datos del Stage 2, incluyendo V3, bajo una configuración común de inferencia y muestreo:

| Benchmark | v1 | v2 | v3 |
|---|---|---|---|
| HumanEval | 45.60 | 42.19 | 39.96 |
| MBPP | 50.91 | 49.34 | 46.60 |
| MATH-500 | 43.74 | 41.66 | 37.21 |
| Minerva | 42.20 | 40.39 | 36.70 |
| MMLU-STEM | 61.84 | 59.85 | 57.72 |
| BBH | 63.23 | 62.90 | 60.44 |
| HellaSwag | 66.40 | 67.30 | 67.25 |

El informe también reporta una métrica de verosimilitud en bits por byte UTF-8 (BPB), donde el Stage 2 obtiene 0.763 frente a 0.793 de OLMo-3-7B. Valores más bajos indican mejor rendimiento.

## Requisitos de hardware

No se proporcionan datos oficiales de VRAM, latencia o throughput en la información disponible. A partir del tamaño del repositorio (17.9 GB) y de los pesos en bfloat16, se puede estimar lo siguiente:

- Para cargar los pesos en bfloat16 se requieren aproximadamente 17.9 GB de memoria de GPU o RAM.
- En GPU, una A100 40GB o una H100 80GB serían adecuadas para ejecutar el modelo en bfloat16 con margen suficiente.
- En GPUs de consumo, una RTX 4090 de 24GB no es suficiente para cargar los pesos en bfloat16 completos; sería necesario aplicar cuantización a 4 bits o 8 bits (no proporcionada de serie).
- Opciones de despliegue: vLLM, TGI, y HuggingFace Transformers para bfloat16; llama.cpp u Ollama si se convierte el modelo a formato GGUF con cuantización.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Rendimiento destacado | Disponibilidad |
|---|---|---|---|---|---|
| OLMo-3-7B Stage 2 | no disponible | 8.192 tokens | Apache 2.0 | HumanEval 49.31, ARC-Challenge 85.49 | HuggingFace |
| NCP-ArchPreview 8.9B Stage 2 V1 | 8.938.363.792 | 8.192 tokens | Apache 2.0 | HumanEval 45.60, MBPP 50.91, MATH-500 43.74 | HuggingFace |
| NCP-ArchPreview 8.9B Stage 2 V3 | 8.938.363.792 | 8.192 tokens | Apache 2.0 | HellaSwag 67.25, pero más débil en HumanEval, MBPP, MATH-500 | HuggingFace |

La variante V3 es la más débil de las tres recetas en la mayoría de benchmarks de código, matemáticas y razonamiento lógico. El informe recomienda V1 como la opción más fuerte entre las tres.

## Limitaciones y advertencias

- La variante V3 es la más débil en HumanEval (39.96), MBPP (46.60), MATH-500 (37.21) y BBH (60.44) dentro de las tres recetas del Stage 2. El propio autor advierte que un número de versión mayor no implica un modelo más fuerte.
- La tabla principal de benchmarks no debe asignarse a las tres variantes; los valores de V3 son inferiores en varias tareas.
- El modelo es un modelo base sin alineación con RLHF ni DPO, por lo que puede generar contenido sesgado, tóxico o no deseado.
- El contexto de entrenamiento es de 8.192 tokens, una ventana corta en comparación con modelos modernos que ofrecen contextos de 32K o más.
- Los idiomas soportados no están documentados; el dataset Dolma es predominantemente en inglés, por lo que el rendimiento en otros idiomas es probablemente limitado.
- El informe señala un posible desajuste entre la mezcla de datos del entrenamiento continuado y los dominios downstream, lo que explica la caída en HumanEval y ARC-Challenge.
- No se documenta soporte de tool calling, function calling ni uso como agente autónomo.
- El informe compara la pérdida de entrenamiento con OLMo-3-7B, no el throughput de inferencia, por lo que no debe interpretarse como una afirmación de mayor velocidad de generación.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ArchSpace-Collection/NCP_ArchPreview_dolma3_8.9B_Stage2_v3
- Colección NCP-ArchPreview: https://huggingface.co/collections/ArchSpace-Collection/ncp-archpreview
- Modelo Stage 1: https://huggingface.co/ArchSpace-Collection/NCP_ArchPreview_dolma3_8.9B_Stage1
- Modelo NCPFlash (draft model): https://huggingface.co/ArchSpace-Collection/NCP_ArchPreview_dolma3_8.9B_Stage2_DFlash2_NCPFlash
- Código de evaluación NCP: https://github.com/LuckySJTU/ncp_olmo_eval
- Informe técnico: no disponible
