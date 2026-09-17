# llm-semantic-router/Vela-1.0-Omni-Nano

## Resumen

Vela-1.0-Omni-Nano es un modelo de embeddings multimodales desarrollado por el equipo de llm-semantic-router (proyecto vLLM Semantic Router). Su función no es generar texto, sino proyectar texto, imágenes y audio en un espacio vectorial compartido de 384 dimensiones con vectores normalizados en norma L2. Con 133.956.480 parámetros (aproximadamente 134 M) y un repositorio de 1,1 GB, se posiciona como la variante más ligera de la familia Vela 1.0, pensada para ejecutarse en CPU o en GPUs de gama baja.

El problema que resuelve es el enrutado semántico y la recuperación multimodal: dado un conjunto de destinos descritos en lenguaje natural (por ejemplo, qué modelo de lenguaje debe atender una petición), el sistema incrusta cada descripción y cada consulta entrante, y selecciona el vector más cercano. Además de texto, el modelo cubre recuperación imagen-texto y audio-texto, lo que permite enrutar también entradas que llegan como imágenes o fragmentos de voz de hasta 30 segundos.

Es relevante ahora porque combina tres modalidades en un único encoder de 134 M de parámetros bajo licencia Apache 2.0, algo poco habitual en modelos de este tamaño: la mayoría de alternativas multimodales ligeras cubren solo texto e imagen. Su principal contrapartida es que la modalidad de audio es claramente más débil que en la variante grande de la misma familia, y que las puntuaciones de clasificación publicadas corresponden a adaptación supervisada con prototipos, no a evaluación zero-shot.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible en detalle; encoder multimodal (texto, imagen, audio) que proyecta a un espacio de embeddings compartido. Código nativo propio en el repositorio (`vela_omni`), ejecutado con PyTorch y Transformers 4.57.6 |
| Parámetros totales | 133.956.480 (≈134 M) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible; la evaluación publicada aplica un límite común de 128 tokens de texto |
| Tipos de cuantización | No disponible; no se documentan variantes cuantizadas (GGUF, AWQ, GPTQ). Los pesos se distribuyen en safetensors |
| Idiomas soportados | No disponible. Las evaluaciones publicadas son en inglés (Banking77, MASSIVE English, COCO, LibriSpeech) |
| Licencia | Apache 2.0 (el repositorio incluye un fichero NOTICE con atribución de componentes) |
| Formato de pesos | Safetensors, con código de modelo nativo, configuraciones de componentes, tokenizer y processor |
| Dimensión de embedding | 384, normalizados en L2 |
| Modalidades de entrada | Texto, imagen (Pillow) y audio (ondas mono NumPy, 16 kHz, máximo 30 s por clip) |
| Pipeline declarado | feature-extraction |
| Tamaño del repositorio | 1,1 GB |

## Arquitectura y entrenamiento

La model card no detalla la topología interna del encoder ni el número de capas, la dimensión oculta o el mecanismo de atención. Lo que sí se especifica es el contrato funcional: tres funciones de codificación (`encode_text`, `encode_image`, `encode_audio`) que producen vectores de 384 dimensiones en un espacio compartido, comparables mediante producto escalar. El repositorio incluye código nativo (`vela_omni`), ficheros de configuración de componentes, tokenizer y processor, y se carga con `VelaOmni.from_pretrained`. El audio debe entregarse como onda mono a 16 kHz y con una duración máxima de 30 segundos por clip.

En cuanto a los datos, el alineamiento cross-modal se entrenó con pares imagen-caption de COCO (subconjunto de imágenes CC-BY 2.0) y pares voz-transcripción de LibriSpeech (CC-BY 4.0). Las anotaciones de COCO, junto con Banking77 y MASSIVE, se distribuyen bajo CC-BY 4.0. No se indica el volumen de tokens, la composición completa del dataset ni si hubo fases de RLHF o DPO; al tratarse de un modelo de embeddings de alineamiento contrastivo, esas fases no serían el mecanismo esperable. Los resultados de clasificación de intenciones publicados corresponden explícitamente a un ajuste con ejemplos de entrenamiento y etiquetas de intención de Banking77 y MASSIVE, evaluados con clasificación por prototipo más cercano.

## Capacidades

- Generación de embeddings de texto en 384 dimensiones, normalizados en L2 y comparables por producto escalar.
- Generación de embeddings de imagen a partir de objetos Pillow, alineados con el espacio de texto (recuperación imagen-texto y texto-imagen).
- Generación de embeddings de audio a partir de ondas mono a 16 kHz, con clips de hasta 30 segundos, alineados con el espacio de texto.
- Recuperación multimodal cruzada: buscar imágenes o fragmentos de voz mediante consultas textuales y viceversa.
- Clasificación por prototipo más cercano: clasificación de intenciones comparando la incrustación de la consulta con prototipos de clase fijos (evaluado con éxito en Banking77 y MASSIVE English).
- Enrutado semántico: incrustar nombre y descripción de cada destino y seleccionar el vector más próximo a la consulta.
- Clustering y descubrimiento de categorías: agrupar embeddings de media y inspeccionar cada grupo para definir categorías de enrutado.
- No soporta generación de texto, tool calling, function calling ni razonamiento multi-paso agentico: es un modelo de extracción de características, no un modelo generativo.

## Casos de uso

- Enrutado de peticiones entre modelos de lenguaje (vLLM Semantic Router): se incrustan el nombre y la descripción de cada modelo destino y la consulta del usuario; el destino con mayor similitud coseno atiende la petición. Con 134 M de parámetros el coste por consulta es mínimo frente al coste de invocar el modelo generativo.
- Búsqueda multimodal en catálogos de producto: indexar las imágenes del catálogo con `encode_image` y permitir consultas en lenguaje natural con `encode_text`, explotando el R@10 de 82,99 en texto→imagen sobre COCO.
- Deduplicación y agrupación de contenido multimedia: generar embeddings de un corpus mixto de textos, imágenes y audios y aplicar clustering para detectar duplicados o agrupar temas, gracias a que las tres modalidades comparten un mismo espacio de 384 dimensiones.
- Clasificación de intenciones en asistentes conversacionales: construir prototipos por intención y clasificar consultas por vecino más cercano. Los 73,28 puntos de accuracy en Banking77 y 66,55 en MASSIVE English sirven como referencia orientativa de este flujo.
- Enrutado de entradas de voz en sistemas de atención telefónica: transcribir o incrustar directamente el audio con `encode_audio` (clips de hasta 30 s) para decidir si la llamada va a facturación, soporte técnico o incidencias.
- Filtrado y moderación de contenido en pipelines de ingesta: incrustar imágenes y textos entrantes y comparar contra prototipos de categorías no deseadas para un primer cribado de bajo coste antes de modelos más caros.
- Selección de contexto en sistemas RAG: usar los embeddings de texto para recuperar pasajes relevantes antes de pasarlos a un modelo generativo, o para enrutar la consulta al índice correcto.
- Prototipado e investigación en alineamiento multimodal: al ser un modelo pequeño y con licencia Apache 2.0, sirve como punto de partida reproducible para estudiar recuperación cruzada texto-imagen-audio sin infraestructura de GPU dedicada.

## Benchmarks y rendimiento

Resultados publicados en la model card. Escala 0-100, mayor es mejor. Todos los modelos usan los mismos ejemplos y las mismas bolsas de recuperación; "N/A" indica una modalidad que el modelo solo-texto no soporta. En negrita, las puntuaciones de Vela-1.0-Omni-Nano que mejoran a multi-modal-embed-small.

| Métrica | Vela-1.0-Encoder-307M-Embedding | multi-modal-embed-small | multi-modal-embed-large | Vela-1.0-Omni-Nano |
|---|---:|---:|---:|---:|
| Banking77 · Accuracy | 80,00 | 70,42 | 75,78 | **73,28** |
| MASSIVE English · Accuracy | 75,64 | 65,95 | 72,31 | **66,55** |
| COCO · Image → text · R@1 | N/A | 40,83 | 42,53 | **47,02** |
| COCO · Image → text · R@5 | N/A | 67,19 | 75,21 | **74,97** |
| COCO · Image → text · R@10 | N/A | 78,49 | 87,61 | **85,91** |
| COCO · Text → image · R@1 | N/A | 30,18 | 35,04 | **37,33** |
| COCO · Text → image · R@5 | N/A | 59,42 | 70,09 | **70,16** |
| COCO · Text → image · R@10 | N/A | 74,29 | 83,91 | **82,99** |
| LibriSpeech · Audio → text · R@1 | N/A | 4,21 | 56,99 | **8,20** |
| LibriSpeech · Audio → text · R@5 | N/A | 11,99 | 81,85 | **21,29** |
| LibriSpeech · Audio → text · R@10 | N/A | 19,03 | 87,94 | **30,26** |
| LibriSpeech · Text → audio · R@1 | N/A | 9,58 | 78,58 | **13,26** |
| LibriSpeech · Text → audio · R@5 | N/A | 22,53 | 94,02 | **30,00** |
| LibriSpeech · Text → audio · R@10 | N/A | 30,69 | 97,01 | **38,66** |

Protocolo declarado: embeddings en FP32, similitud coseno y límite común de 128 tokens de texto. La evaluación de texto usa prototipos de clase fijos (3.080 consultas de Banking77 y 2.972 de MASSIVE English). El modelo de recuperación de imagen usa el subconjunto Karpathy CC-BY 2.0 de COCO: 823 imágenes y 4.115 captions. La recuperación de voz usa 2.611 clips de LibriSpeech test-clean y 2.610 transcripciones únicas, con clips limitados a 30 segundos. La recall se mide contra la bolsa completa de candidatos, aceptando todos los positivos coincidentes. Nota importante del autor: Vela Omni se adapta usando ejemplos de entrenamiento y etiquetas de intención de Banking77 y MASSIVE, mientras que los modelos de comparación se evalúan tal como se publicaron; por tanto estas cifras miden adaptación supervisada con clasificación por prototipo más cercano, no transferencia zero-shot ni el protocolo de clasificación de MTEB.

## Requisitos de hardware

- VRAM estimada para inferencia: en FP32, alrededor de 0,54 GB solo de pesos (134 M × 4 bytes); en FP16/BF16, alrededor de 0,27 GB; en INT8, alrededor de 0,13 GB. Hay que sumar el coste de los codificadores de imagen y audio y de las activaciones, no cuantificado en la información disponible.
- Ejecución en CPU: viable y documentada. El ejemplo de inicio rápido de la model card usa explícitamente `device="cpu"`, lo que hace innecesaria una GPU para texto.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM es suficiente en la práctica; una RTX 3060, RTX 4070 o RTX 4090 lo ejecutan con holgura, igual que una A100 o H100 si se despliega a gran escala. No se publican cifras de latencia o throughput por GPU.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU de consumo moderna e incluso en iGPU o en CPU sola.
- Opciones de despliegue: PyTorch con Transformers 4.57.6 y el código nativo del repositorio (`vela_omni.VelaOmni`); Hugging Face Hub para la descarga (`snapshot_download`); safetensors y NumPy/Pillow para el manejo de pesos y entradas. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, y al no ser un modelo generativo ni seguir una interfaz `AutoModel` estándar, esas vías no son directamente aplicables sin trabajo adicional.
- Latencia y throughput: no disponibles en la información proporcionada. Al ser un encoder de 134 M de parámetros, la latencia esperada es de milisegundos en GPU y de decenas a cientos de milisegundos en CPU, pero se trata de una estimación general, no de un dato publicado.

## Comparativa con modelos similares

Modelos de la misma familia y del mismo autor, evaluados con el mismo protocolo:

| Modelo | Parámetros | Modalidades | Banking77 (accuracy) | COCO text→image R@1 | LibriSpeech audio→text R@1 | Licencia |
|---|---|---|---|---|---|---|
| Vela-1.0-Omni-Nano | 134 M | Texto, imagen, audio | 73,28 | 37,33 | 8,20 | Apache 2.0 |
| Vela-1.0-Encoder-307M-Embedding | 307 M (según denominación) | Solo texto | 80,00 | N/A | N/A | No disponible |
| multi-modal-embed-small | No disponible | Texto, imagen, audio | 70,42 | 30,18 | 4,21 | No disponible |
| multi-modal-embed-large | No disponible | Texto, imagen, audio | 75,78 | 35,04 | 56,99 | No disponible |

Lectura de la comparativa: Vela-1.0-Omni-Nano es el mejor de la familia en recuperación de imagen (47,02 de R@1 en imagen→texto frente a 40,83 y 42,53) con un coste de parámetros muy inferior al encoder de 307 M, que además no cubre imagen ni audio. En cambio, en audio queda muy por detrás de multi-modal-embed-large (8,20 frente a 56,99 de R@1 en audio→texto), lo que indica que la modalidad de voz es la más sacrificada en esta variante Nano. Frente a modelos de embeddings puramente textuales de tamaño comparable, la ventaja es la cobertura de tres modalidades en un único espacio de 384 dimensiones. No se dispone de datos de parámetros ni licencia de los modelos multi-modal-embed, ni de comparaciones con alternativas externas a la familia.

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto, no soporta tool calling, function calling ni razonamiento agentico. No aplica el concepto habitual de alucinación, pero sí el de falsos positivos en la recuperación.
- La modalidad de audio es claramente débil: R@1 de 8,20 en audio→texto sobre LibriSpeech, frente a 56,99 de multi-modal-embed-large. No es adecuado para búsqueda por voz en producción sin una validación exhaustiva.
- Los clips de audio están limitados a 30 segundos y deben ser ondas mono a 16 kHz. No hay solapamiento ni mecanismo documentado para audio más largo.
- Las puntuaciones de Banking77 y MASSIVE corresponden a adaptación supervisada con ejemplos y etiquetas de esos conjuntos y clasificación por prototipo más cercano. No deben interpretarse como rendimiento zero-shot ni compararse directamente con resultados de MTEB.
- Los modelos de comparación se evaluaron tal como se publicaron, sin esa adaptación, por lo que la comparación en las tareas de clasificación no es simétrica.
- Los embeddings de LibriSpeech test-clean son en inglés y de dominio acústico limitado; el rendimiento en otros idiomas, acentos o audio con ruido no está documentado.
- Idiomas soportados: no disponible. Las únicas evaluaciones publicadas son en inglés, por lo que el comportamiento multilingüe es desconocido y no debe asumirse.
- Las similitudes coseno producen rankings, no probabilidades calibradas. El autor lo advierte explícitamente: no deben usarse como umbrales de confianza sin calibración propia.
- Riesgo de sesgo heredado de los datos de entrenamiento: COCO (subconjunto CC-BY 2.0), LibriSpeech (CC-BY 4.0), Banking77 y MASSIVE. No se documenta ningún análisis de sesgo ni de representación demográfica.
- Licencia Apache 2.0 para el modelo, pero el repositorio incluye un fichero NOTICE con atribución de componentes y un fichero LICENSE que deben revisarse antes de un uso comercial, por si algún componente tiene términos distintos.
- Advertencia de producción: al requerir código nativo del repositorio y no seguir la interfaz estándar de Transformers, la integración depende de la estabilidad de ese código. Conviene fijar una revisión concreta del modelo en lugar de seguir la rama principal.
- El repositorio es pequeño (1,1 GB) y el modelo apenas tiene adopción (0 descargas, 1 like en el momento de redactar esta ficha), lo que reduce la probabilidad de que los problemas de integración estén ya resueltos por terceros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/llm-semantic-router/Vela-1.0-Omni-Nano
- Resultados completos y protocolo (`scores.json`): https://huggingface.co/llm-semantic-router/Vela-1.0-Omni-Nano/blob/main/scores.json
- Fichero NOTICE con atribución de componentes: https://huggingface.co/llm-semantic-router/Vela-1.0-Omni-Nano/blob/main/NOTICE
- Licencia del repositorio: https://huggingface.co/llm-semantic-router/Vela-1.0-Omni-Nano/blob/main/LICENSE
- Colección Vela 1.0: https://huggingface.co/collections/llm-semantic-router/vela-10-6aa555ba70cc6997d6d67798
- Demo Vela Studio en Hugging Face Spaces: https://huggingface.co/spaces/llm-semantic-router/vela-studio
- Vela-1.0-Encoder-307M-Embedding: https://huggingface.co/llm-semantic-router/Vela-1.0-Encoder-307M-Embedding
- multi-modal-embed-small: https://huggingface.co/llm-semantic-router/multi-modal-embed-small
- multi-modal-embed-large: https://huggingface.co/llm-semantic-router/multi-modal-embed-large
- Documentación del proyecto: https://vllm-sr.ai/
- Blog del proyecto: https://vllm-sr.ai/blog/
- Repositorio GitHub (vLLM Semantic Router): https://github.com/vllm-project/semantic-router
- Canal de Slack: https://vllm-dev.slack.com/archives/C09CTGF8KCN
- Dataset LibriSpeech (OpenSLR 12): https://www.openslr.org/12/
