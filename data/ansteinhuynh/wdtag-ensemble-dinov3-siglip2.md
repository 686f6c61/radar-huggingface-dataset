# ansteinhuynh/wdtag-ensemble-dinov3-siglip2

## Resumen

wdtag-ensemble-dinov3-siglip2 es un modelo de etiquetado automático de imágenes (image tagging) orientado al dominio Danbooru, desarrollado por el usuario ansteinhuynh. Se trata de un ensemble de dos torres: un DINOv3-B/16 parcialmente ajustado mediante adaptadores OFTv2 (Orthogonal Fine-Tuning v2) en sus 12 bloques más un bloque descongelado, y una torre SigLIP2-B/16 congelada cuyas características cls en fp32 se cachean y se concatenan con las del DINOv3 antes de una cabeza lineal de 1536 a 12476 etiquetas.

El modelo resuelve el problema del etiquetado multietiqueta de ilustraciones de estilo anime/manga con un coste de parámetros muy reducido: entrena solo 31,1 millones de parámetros, un 4,5 % del recuento del tagger convnextv2_huge publicado como referencia. Alcanza el 74,6 % de la macro F1 de ese baseline sobre un instrumento de validación de 50 000 imágenes (0,4162 frente a 0,5579 con umbral 0,40).

Es relevante por su enfoque parameter-efficient (OFT sobre DINOv3 y reutilización de características cacheadas de SigLIP2), que permite reproducir un tagger funcional con recursos de entrenamiento modestos. El repositorio ocupa 0,7 GB y contiene dos checkpoints en formato PyTorch. La información pública sobre idiomas, pipeline y benchmarks detallados es escasa; el autor remite al repositorio de GitHub para el protocolo completo, el resultado honesto en test held-out y el log de experimentos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Ensemble de dos torres vision transformer: DINOv3-B/16 (con adaptadores OFTv2) + SigLIP2-B/16 congelada; concatenación de features y cabeza Linear(1536, 12476) |
| Parámetros totales | 31,1 M entrenados (4,5 % del recuento del tagger convnextv2_huge de referencia) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (modelo de visión; no gestiona contexto textual) |
| Tipos de cuantización | No disponible (checkpoints .pt en precisión completa; no se documentan variantes GGUF, INT8 ni FP16) |
| Idiomas soportados | No disponible (el espacio de etiquetas es Danbooru, mayoritariamente inglés y japonés romanizado en las tags) |
| Licencia | other (licencia personalizada; ver limitaciones) |
| Formato de pesos | PyTorch (.pt): ensemble-ckpt-13859.pt y siglip2-tower-ckpt-27718.pt |

## Arquitectura y entrenamiento

El modelo combina dos torres de visión. La primera es DINOv3-B/16, sobre la que se insertan adaptadores OFTv2 en los 12 bloques del transformer y se descongela además un bloque adicional; esta es la única parte entrenable del sistema. La segunda es SigLIP2-B/16, que permanece completamente congelada y cuyas características cls en fp32 se precalculan y cachean para todo el dataset. Las features de ambas torres se concatenan (1536 dimensiones) y se pasan por una única capa lineal que proyecta a las 12 476 etiquetas del espacio WD-tagger v4.

El entrenamiento se realizó durante una sola época contra las features cacheadas de la torre SigLIP2 congelada, lo que reduce drásticamente el coste computacional. No se documentan en la información disponible el número de tokens de imagen, la composición exacta del dataset, ni si hubo etapas de RLHF/DPO (no aplicables en un modelo de tagging). Tampoco se detallan innovaciones como decodificación especulativa o atención lineal; la innovación principal es el uso de OFTv2 para el ajuste eficiente de parámetros sobre DINOv3 y la reutilización de features cacheadas de SigLIP2.

## Capacidades

- Etiquetado multietiqueta de imágenes en el dominio Danbooru con un espacio de 12 476 etiquetas (personajes, series, atributos visuales, composición, etc.).
- Clasificación de ilustraciones de estilo anime/manga, incluyendo tags de personaje, franquicia, rasgos físicos, ropa, expresión y encuadre.
- Inferencia en modo ensemble de dos torres (DINOv3 + SigLIP2), requiriendo ambos checkpoints.
- No soporta tool calling ni function calling: es un modelo puramente visual de clasificación.
- No soporta agentes ni razonamiento multi-step.
- Capacidades multilingües: no documentadas; el espacio de etiquetas está en inglés/romanización de Danbooru.
- No dispone de modo thinking, visión generativa, audio ni generación de texto.

## Casos de uso

- Indexación y búsqueda de bases de datos de ilustraciones anime/manga: el modelo asigna las 12 476 etiquetas Danbooru a cada imagen, permitiendo construir índices invertidos para búsqueda por tags con un coste de almacenamiento reducido gracias a sus 31,1 M de parámetros entrenados.
- Moderación y filtrado de contenido en plataformas de fan art: las etiquetas predichas (incluidas tags de contenido sensible del espacio Danbooru) permiten aplicar políticas de filtrado automático sobre grandes volúmenes de subidas.
- Autoetiquetado de datasets para entrenamiento de modelos generativos (LoRA, DreamBooth): el tagger genera captioning estructurado por tags que puede alimentar pipelines de fine-tuning de difusión, sustituyendo al costoso convnextv2_huge con una fracción de los parámetros.
- Organización de bibliotecas personales de imágenes: integración en herramientas de gestión que clasifiquen automáticamente por personaje, serie o atributos visuales, ejecutándose en hardware modesto al no requerir el baseline enorme.
- Análisis de tendencias en comunidades de arte: agregación estadística de tags sobre corpus de imágenes para estudiar popularidad de personajes, estilos o atributos a lo largo del tiempo.
- Preetiquetado asistido para anotadores humanos: el modelo propone tags con umbral ajustable (0,40 en la validación reportada) y los revisores corrigen, reduciendo el esfuerzo de anotación manual.
- Investigación en parameter-efficient fine-tuning: el checkpoint sirve como referencia reproducible de OFTv2 sobre DINOv3 con features cacheadas de SigLIP2, útil para estudiar transferencia en visión.

## Benchmarks y rendimiento

| Métrica | wdtag-ensemble-dinov3-siglip2 | convnextv2_huge tagger (referencia) |
|---|---|---|
| Macro F1 (validación, 50 000 imágenes, umbral 0,40) | 0,4162 | 0,5579 |
| Ratio de macro F1 frente al baseline | 74,6 % | 100 % |
| Parámetros entrenados | 31,1 M (4,5 % del baseline) | ~691 M (estimado a partir del ratio 4,5 %) |

No se han publicado en la información disponible resultados de MMLU, HumanEval ni GSM8K, ya que el modelo no es de lenguaje. El autor menciona un resultado de test held-out en el repositorio de GitHub, pero su valor numérico no se incluye en la model card proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con un repo de 0,7 GB y dos torres B/16, la inferencia en fp32 requiere previsiblemente varios GB, pero no se documenta la cifra exacta.
- GPU recomendadas: no documentadas por el autor. Por el tamaño de las torres (DINOv3-B/16 y SigLIP2-B/16), cabría esperar GPUs consumer tipo RTX 3060/4090, pero es una estimación no confirmada.
- ¿Cabe en GPU consumer? No confirmado en la información disponible.
- Opciones de despliegue: exclusivamente PyTorch; requiere restaurar ambos checkpoints y ejecutar DinoTagger con la vista SigLIP2 congelada. No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI (no aplicables a un modelo de visión de este tipo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros entrenados | Contexto / modalidad | Macro F1 (val. 50k, umbral 0,40) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| wdtag-ensemble-dinov3-siglip2 | 31,1 M | Visión, 12 476 tags | 0,4162 | other | Hugging Face + GitHub |
| convnextv2_huge WD-tagger (baseline citado) | ~691 M (implícito) | Visión, 12 476 tags | 0,5579 | no disponible | Referencia del autor |
| Otros taggers Danbooru | no disponible | Visión | no disponible | no disponible | no disponible |

La comparativa se limita al baseline citado por el autor, ya que la información proporcionada no incluye datos de otros taggers Danbooru comparables (p. ej., WD-tagger v3, SmilingWolf models) con métricas verificables en el mismo instrumento de validación.

## Limitaciones y advertencias

- Licencia "other": es una licencia personalizada no especificada en detalle; es imprescindible revisar los términos antes de cualquier uso comercial, ya que puede imponer restricciones adicionales.
- El rendimiento es sustancialmente inferior al baseline convnextv2_huge (0,4162 frente a 0,5579 de macro F1), por lo que en producción de alta precisión puede no ser suficiente.
- Requiere obligatoriamente ambos checkpoints y el código del repositorio GitHub; no es un modelo autónomo de un solo archivo.
- Depende de un espacio de etiquetas externo (WD-tagger v4, 12 476 tags) que debe obtenerse por separado vía WDTAG_BASELINE_DIR.
- Riesgo de falsos negativos y positivos en tags poco frecuentes: la validación se reporta con umbral 0,40, lo que implica un compromiso precisión/recall ajustable pero no óptimo para todos los tags.
- Sesgos del dataset Danbooru: el modelo hereda los sesgos de anotación de la comunidad (sobrerrepresentación de ciertos personajes, estilos y atributos; posibles tags sensibles o NSFW).
- Idiomas: no se documenta soporte multilingüe; las etiquetas están en inglés/romanización, lo que limita su uso en otros idiomas sin postprocesado.
- Sin datos publicados de latencia, VRAM ni cuantizaciones: la planificación de producción requiere medición propia.
- Modelo de nicho con 0 descargas y 0 likes en el momento de la consulta; no hay validación comunitaria independiente.

## Enlaces

- Hugging Face: https://huggingface.co/ansteinhuynh/wdtag-ensemble-dinov3-siglip2
- Repositorio GitHub (código, pipeline y log de experimentos): https://github.com/AnsteinHuynh/wd-tagger-trainer
