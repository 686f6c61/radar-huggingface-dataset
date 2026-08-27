# huangyusi/WeMM-Embedding-2B-GGUF

## Resumen

WeMM-Embedding es una familia de modelos de embedding multimodal desarrollada por el equipo de WeChat (Tencent), diseñada para representar texto, imágenes y vídeo en un espacio vectorial unificado. El modelo de 2B parámetros aquí referenciado es la variante cuantizada en formato GGUF, lo que permite su ejecución en hardware de consumo con un uso reducido de memoria. Su relevancia actual radica en que aborda la necesidad de sistemas de búsqueda y recuperación que combinen múltiples modalidades, un campo en rápida expansión con aplicaciones en motores de búsqueda multimodales, sistemas de recomendación y agentes conversacionales.

El modelo se entrena en dos etapas: una primera fase de alineamiento multimodal a gran escala y una segunda de refinamiento con datos curados, supervisión de relevancia fina y transferencia de conocimiento entre escalas. La familia completa incluye variantes de 2B, 4B y 9B parámetros, todas ellas capaces de procesar entradas de texto e imagen, y la versión de 2B también admite vídeo de hasta 64 fotogramas. Según el informe técnico, el modelo de 2B compite favorablemente con sistemas propietarios líderes en el conjunto de evaluación de recuperación cross-modal de Gemini Embedding 2.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLM2Vec (backbone multimodal basado en transformer) |
| Parametros totales | 2B (variante de la familia WeMM-Embedding) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF (variantes de cuantizacion no especificadas) |
| Idiomas soportados | Chino e ingles (bilingue) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

WeMM-Embedding se basa en el pipeline oficial de TIGER-AI-Lab/VLM2Vec, con modificaciones para soportar inferencia multi-nodo y multi-GPU mediante torchrun. El backbone implementa un preprocesamiento específico y una inferencia por lotes optimizada, con muestreo de vídeo de 64 fotogramas. La arquitectura subyacente es un transformer multimodal que procesa conjuntamente texto e imágenes (y vídeo en la variante de 2B), generando embeddings unificados en un espacio vectorial compartido.

El entrenamiento se realiza en dos etapas: una primera fase de alineamiento multimodal a gran escala, seguida de un refinamiento con datos curados que incluye supervisión de relevancia fina y transferencia de conocimiento entre escalas (de los modelos más grandes a los más pequeños). Esta segunda fase es clave para mejorar la precisión en tareas de recuperación y búsqueda. No se han publicado detalles sobre el número exacto de tokens de entrenamiento ni sobre el uso de técnicas como RLHF o DPO.

## Capacidades

- Generación de embeddings multimodales: representa texto, imágenes y vídeo en un espacio vectorial unificado.
- Recuperación cross-modal: permite buscar imágenes a partir de texto, texto a partir de imágenes, y combinaciones de ambas modalidades.
- Procesamiento de vídeo: la variante de 2B admite hasta 64 fotogramas por vídeo.
- Conversación bilingüe: soporta chino e inglés, lo que la hace adecuada para aplicaciones en ambos mercados.
- Integración con pipelines de búsqueda: puede usarse como backbone para sistemas de recuperación densa y de segunda etapa (reranking).
- Transferencia de conocimiento: los modelos más pequeños se benefician del conocimiento de los más grandes mediante destilación durante el entrenamiento.

## Casos de uso

- Búsqueda multimodal en comercio electrónico: los usuarios pueden buscar productos con una imagen y texto descriptivo; el modelo genera embeddings que permiten recuperar artículos relevantes de un catálogo.
- Moderación de contenido visual: clasificar imágenes y vídeos según su contenido mediante similitud de embeddings con ejemplos etiquetados.
- Sistemas de recomendación cross-modal: recomendar contenido (vídeos, artículos, productos) basándose en la similitud entre el historial del usuario (texto) y los ítems disponibles (imagen/vídeo).
- Asistentes conversacionales con memoria visual: un agente puede recordar imágenes o vídeos vistos previamente y recuperarlos cuando el usuario los menciona en una conversación.
- Indexación de vídeo para búsqueda semántica: extraer embeddings de fotogramas clave para permitir búsquedas por descripción textual dentro de un archivo de vídeo.
- Análisis de sentimiento multimodal: combinar texto e imagen para determinar la polaridad de publicaciones en redes sociales o reseñas de productos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El informe técnico menciona que el modelo de 2B "compara favorablemente con sistemas propietarios líderes" en el conjunto de evaluación de recuperación cross-modal de Gemini Embedding 2, pero no se proporcionan cifras concretas. Tampoco se detallan resultados en benchmarks estándar como MMLU, HumanEval o GSM8K, dado que se trata de un modelo de embedding y no de generación.

## Requisitos de hardware

- VRAM estimada para inferencia: al ser un modelo de 2B en formato GGUF, el uso de memoria dependerá de la cuantización elegida. Con cuantización Q4_K_M, se estima un consumo de aproximadamente 1,5-2 GB de VRAM, lo que permite su ejecución en GPUs de consumo como la RTX 3060 o superiores.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM puede ejecutar el modelo con cuantización ligera. Para mayor velocidad, se recomienda una RTX 3090 o superior.
- Compatibilidad con hardware de consumo: sí, el formato GGUF está diseñado para ejecutarse en GPUs de gama media y baja.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y cualquier framework compatible con GGUF. También puede usarse con Python mediante la librería llama-cpp-python.
- Latencia y throughput: no disponibles. Dependerán del hardware y de la cuantización elegida.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidades | Licencia | Formato |
|---|---|---|---|---|---|
| WeMM-Embedding-2B (GGUF) | 2B | no disponible | Texto, imagen, vídeo | Apache-2.0 | GGUF |
| WeMM-Embedding-4B | 4B | no disponible | Texto, imagen | Apache-2.0 | no disponible |
| WeMM-Embedding-9B | 9B | no disponible | Texto, imagen | Apache-2.0 | no disponible |
| Gemini Embedding 2 (propietario) | no disponible | no disponible | Texto, imagen, vídeo | Propietaria | API |

La familia WeMM-Embedding se posiciona como una alternativa open source a sistemas propietarios como Gemini Embedding 2, con la ventaja de ser descargable y ejecutable localmente. La variante de 2B es la más ligera y la única que soporta vídeo, mientras que las de 4B y 9B ofrecen mayor capacidad a costa de mayores requisitos de hardware.

## Limitaciones y advertencias

- Sesgos conocidos: no se han publicado evaluaciones de sesgo para este modelo. Al estar entrenado principalmente con datos en chino e inglés, puede presentar un rendimiento inferior en otros idiomas.
- Riesgo de alucinación: al ser un modelo de embedding, no genera texto, por lo que el riesgo de alucinación es bajo. Sin embargo, la calidad de los embeddings depende de la calidad de los datos de entrenamiento.
- Limitaciones de contexto: no se ha especificado la longitud máxima de contexto. Para vídeo, el límite es de 64 fotogramas, lo que puede ser insuficiente para vídeos largos.
- Restricciones de licencia: la licencia Apache-2.0 permite uso comercial sin restricciones, siempre que se mantenga el aviso de copyright y se indiquen los cambios realizados.
- Caveat para producción: al ser un modelo relativamente nuevo (creado en agosto de 2026), aún no cuenta con un ecosistema maduro de herramientas y documentación. Se recomienda validar su rendimiento en el caso de uso específico antes de desplegarlo en producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/huangyusi/WeMM-Embedding-2B-GGUF
- Repositorio oficial de WeMM-Embedding: https://github.com/Tencent/WeMM-Embedding
- Repositorio de WeMM (modelo de lenguaje multimodal): https://github.com/scenarios/WeMM
- Informe técnico (arXiv): https://arxiv.org/pdf/2608.24053
- Página del informe técnico: https://papers.fzhiy.net/papers/2608-24053.html
