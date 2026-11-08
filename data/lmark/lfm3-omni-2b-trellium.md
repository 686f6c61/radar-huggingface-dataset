# LMark/LFM3-Omni-2B-Trellium

## Resumen

LFM3-Omni-2B-Trellium es una familia de 11 checkpoints cuantizados de bajos bits del modelo LFM3-Omni-2B de Liquid AI, publicada por el usuario LMark. El modelo base es un modelo ómnido (any-to-any) de 2B parámetros que entiende texto, imágenes, vídeo y audio, y responde en texto, habla o texto y habla intercalados. La aportación de esta ficha no es el modelo en sí, sino el método de cuantización: Trellium, una cuantización por código de retícula (trellis-coded quantization) que produce pesos desde 4,96 hasta 1,06 bits por peso sin ningún paso de gradiente, calculada en forma cerrada a partir de 100.000 tokens de calibración.

El resultado relevante es que las versiones Trellium baten a los cuantizados estándar de llama.cpp en fidelidad al modelo en coma flotante a igual tamaño. La versión q505t (1.071 MB, 4,96 bits por peso) logra una divergencia KL de 0,017 frente al modelo float32, frente a 0,063 del mejor Q4_K_M de llama.cpp y 0,078 del Q4_K_M oficial de LiquidAI, ocupando 20 MB menos. La versión q385t (834 MB, 3,86 bits) iguala la KL del Q4_K_M con un 24 % menos de bytes.

El interés actual es práctico: permite ejecutar un modelo ómnido de 2B parámetros en hardware de borde con huellas de memoria de entre 228 MB y 1,07 GB, algo imposible con el checkpoint BF16 original de 3.458 MB. Las variantes por debajo de 2 bits (q160t, q113t, q105t) se publican solo con fines de investigación y colapsan en calidad.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer del modelo base LFM3-Omni-2B (Liquid AI); cuantización trellis-coded sobre matrices y embedding atado |
| Parámetros totales | 1,73 B (modelo base); 11 checkpoints cuantizados de 228 MB a 1.071 MB |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | 11 niveles: q505t (4,96 bits), q450t (4,43), q385t (3,86), q341t (3,43), q301t (3,02), q284t (2,87), q263t (2,65), q200t (2,02), q160t (1,59), q113t (1,12), q105t (1,06) |
| Idiomas soportados | en, ar, zh, fr, de, it, ja, ko, pt, es, vi, th, id, hi, ru, pl (16 idiomas) |
| Licencia | lfm1.0 (other) |
| Formato de pesos | safetensors, con custom_code (requiere `trust_remote_code`) |

## Arquitectura y entrenamiento

El modelo base LFM3-Omni-2B es un modelo ómnido end-to-end de Liquid AI que procesa texto, imagen, vídeo y audio y genera texto y habla. Es un modelo no razonador (non-reasoning) diseñado para ejecución en dispositivo. Esta ficha no documenta la arquitectura interna del base más allá de su naturaleza multimodal y su tamaño de 1,73 B parámetros.

La innovación de esta publicación es el método de cuantización, denominado Trellium. Cada matriz de pesos se representa como un código de retícula con desplazamiento de bits de 1 a 5 bits, y el embedding atado se cuantiza como una rejilla de 1 a 8 bits por fila. La asignación de bits no es uniforme: un asignador la distribuye según una tabla de daño medida, de modo que las matrices más sensibles reciben más bits. No hay ningún paso de gradiente sobre los pesos; cada checkpoint se calcula en forma cerrada a partir de 100.000 tokens de calibración. El resultado es una curva de fidelidad (KL frente al modelo float32) que queda por debajo de los tipos de llama.cpp y de los archivos publicados por terceros en todos los tamaños evaluados.

## Capacidades

- Generación de texto y conversación multiturno, heredadas del modelo base.
- Comprensión de imágenes, vídeo y audio, y generación de habla en el modelo base (la model card de esta publicación describe el checkpoint como "text in and text out"; las capacidades ómnidas corresponden al modelo base y deben verificarse en cada checkpoint cuantizado).
- Salida de texto y de habla, o texto y habla intercalados, según la documentación de Liquid AI para el modelo base.
- Multilingüismo en 16 idiomas: inglés, árabe, chino, francés, alemán, italiano, japonés, coreano, portugués, español, vietnamita, tailandés, indonesio, hindi, ruso y polaco.
- No es un modelo de razonamiento explícito (non-reasoning).
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.

## Casos de uso

- Asistentes de voz en dispositivo: el modelo base acepta audio y responde con habla, y las versiones q385t (834 MB) o q284t (619 MB) caben en dispositivos de borde con memoria limitada, sustituyendo a la vez un modelo ASR, un LLM y un modelo TTS.
- Subtitulación y transcripción con comprensión: al combinar entrada de audio y de texto, puede transcribir y a la vez responder preguntas sobre el contenido, desplegado en local sin conexión.
- Descripción de imágenes y vídeo en aplicaciones móviles: el checkpoint q505t (1.071 MB) ofrece una fidelidad cercana al float32 (KL 0,017, 94,7 % de acuerdo top-1) con una huella apta para un teléfono de gama alta.
- Atención al cliente multimodal: conversaciones multiturno con entrada de texto y audio en 16 idiomas, ejecutadas en servidores de baja capacidad o en el propio dispositivo del usuario.
- Procesamiento por lotes en CPU: los checkpoints de 436 MB a 834 MB permiten procesar grandes volúmenes de texto en máquinas sin GPU, con una degradación de calidad medible y acotada (KL entre 0,062 y 0,707).
- Investigación en cuantización extrema: las variantes q200t, q160t, q113t y q105t sirven como referencia para estudiar el punto de colapso de la cuantización por retícula por debajo de 2 bits por peso.
- Prototipado de agentes conversacionales en entornos con restricciones de memoria, como Raspberry Pi o dispositivos IoT con 1 GB de RAM, usando q385t o q284t.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K) en la información disponible. Los datos publicados miden fidelidad de cuantización frente al modelo float32, no calidad de tarea.

| Modelo | Bits/peso | Tamaño (MB) | KL ↓ | Acuerdo top-1 ↑ |
|---|---:|---:|---:|---:|
| Checkpoint sin cuantizar (BF16) | 16,00 | 3.458 | 0 | 99,9 % |
| Trellium q505t | 4,96 | 1.071 | 0,017 | 94,7 % |
| Trellium q450t | 4,43 | 956 | 0,028 | 92,7 % |
| Trellium q385t | 3,86 | 834 | 0,062 | 89,8 % |
| llama.cpp Q4_K_M | 5,05 | 1.091 | 0,063 | 88,8 % |
| LiquidAI Q4_K_M (oficial) | 5,05 | 1.091 | 0,078 | 87,5 % |
| AtomicChat AD-IQ3_S | 4,23 | 913 | 0,143 | 83,0 % |
| MLX affine 4-bit g64 | 4,50 | 973 | 0,207 | 78,9 % |
| AtomicChat AD-IQ3_XXS | 3,71 | 802 | 0,281 | 75,5 % |
| PollardWeights IQ3_S | 3,95 | 853 | 0,282 | 76,1 % |
| Trellium q284t | 2,87 | 619 | 0,213 | 80,5 % |
| Trellium q263t | 2,65 | 572 | 0,279 | 76,8 % |
| llama.cpp Q2_K | 3,43 | 742 | 0,657 | 65,9 % |
| Trellium q200t | 2,02 | 436 | 0,707 | 67,1 % |
| llama.cpp IQ2_M | 3,07 | 663 | 0,713 | 64,6 % |
| llama.cpp IQ2_S | 2,87 | 620 | 0,916 | 60,6 % |
| llama.cpp IQ2_XXS | 2,61 | 564 | 1,40 | 52,1 % |
| llama.cpp IQ1_M | 2,36 | 511 | 2,14 | 40,5 % |

La evaluación se realizó con el mismo arnés para todos los modelos: 42 filas reservadas de 14 dominios, con los pesos de cada archivo decodificados en el mismo modelo de PyTorch, de modo que solo cambian los pesos. Los archivos de llama.cpp se construyeron con la matriz de importancia del autor; los archivos publicados por terceros se usaron tal como se subieron.

## Requisitos de hardware

- VRAM estimada: entre 228 MB y 1.071 MB según el checkpoint, más el overhead del runtime de PyTorch y de los módulos de audio y visión del modelo base.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM para los checkpoints pequeños; para q505t se recomienda 4 GB o más para acomodar el runtime completo.
- Cabe en GPU de consumo: sí, en todas las RTX y en muchas iGPU; q284t (619 MB) y q385t (834 MB) caben en dispositivos de borde y en placas como Raspberry Pi con suficiente RAM.
- Opciones de despliegue: transformers con `trust_remote_code=True` (formato safetensors con código personalizado); vLLM, llama.cpp, Ollama y TGI no están confirmados para estos checkpoints en la información disponible.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| LFM3-Omni-2B-Trellium (q385t) | 1,73 B | no disponible | lfm1.0 | Hugging Face | 834 MB, KL 0,062, 89,8 % top-1 |
| LFM3-Omni-2B (oficial, Q4_K_M) | 1,73 B | no disponible | lfm1.0 | Hugging Face | 1.091 MB, KL 0,078, 87,5 % top-1 |
| llama.cpp Q4_K_M del mismo base | 1,73 B | no disponible | lfm1.0 | Construido por el autor | 1.091 MB, KL 0,063, 88,8 % top-1 |
| llama.cpp IQ2_S del mismo base | 1,73 B | no disponible | lfm1.0 | Construido por el autor | 620 MB, KL 0,916, 60,6 % top-1 |

La comparación relevante es interna al mismo modelo base, ya que la información disponible no incluye otros modelos ómnidos de 2B con los que contrastar parámetros y contexto.

## Limitaciones y advertencias

- Por debajo de 2 bits por peso el método colapsa: q160t, q113t y q105t se publican solo para investigación y no deben usarse en producción (KL de 1,22 a 3,93; acuerdo top-1 de 25,3 % a 56,7 %).
- La cuantización introduce degradación acumulativa: incluso q505t falla en el 5,3 % de las predicciones greedy respecto al modelo float32.
- La model card describe los checkpoints como "text in and text out"; las capacidades de audio, imagen y vídeo del modelo base pueden no estar preservadas o verificadas en estas versiones cuantizadas.
- Sesgos conocidos: no disponible en la información proporcionada; se heredan los del modelo base.
- Riesgo de alucinación: no cuantificado en la información disponible; previsiblemente mayor en los checkpoints de menor bits.
- La licencia lfm1.0 es "other": deben revisarse sus términos antes de cualquier uso comercial, incluida la redistribución de los checkpoints cuantizados.
- Requiere `trust_remote_code=True` por el código personalizado de la cuantización, lo que implica ejecutar código del autor del repositorio.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación comunitaria independiente.
- No hay datos publicados de rendimiento en tareas (benchmarks de razonamiento, código o matemáticas) para estos checkpoints.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/LMark/LFM3-Omni-2B-Trellium
- Modelo base en Hugging Face: https://huggingface.co/LiquidAI/LFM3-Omni-2B
- Documentación de Liquid AI sobre LFM3-Omni-2B: https://docs.liquid.ai/lfm/models/lfm3-omni-2b
- Paper de referencia citado (arXiv:2406.11235): https://arxiv.org/abs/2406.11235
- Paper de referencia citado (arXiv:2402.04396): https://arxiv.org/abs/2402.04396
- Paper de referencia citado (arXiv:2210.17323): https://arxiv.org/abs/2210.17323
