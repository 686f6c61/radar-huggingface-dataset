# NetherlandsForensicInstitute/vuurwerkverkenner

## Resumen

Vuurwerkverkenner es un modelo de visión por computador desarrollado por el Netherlands Forensic Institute (NFI) para identificar el tipo de fuego artificial al que pertenece un fragmento recuperado tras una explosión. El sistema se emplea en investigación forense: a partir de la fotografía de un trozo de envoltorio, el modelo busca en una base de datos de referencias y devuelve las categorías de producto más probables. Se publica junto a una aplicación operativa en vuurwerkverkenner.nl y su código fuente en GitHub.

Técnicamente no es un modelo generativo, sino un sistema de recuperación basado en embeddings visuales. La pieza central es un Vision Transformer ViT-B/32 fine-tuneado que proyecta cada imagen de 448x448 píxeles a un vector L2-normalizado de 128 dimensiones. La clasificación se resuelve por distancia coseno entre el embedding del fragmento y los embeddings de referencia de cada envoltorio, sin necesidad de reentrenar cuando se añaden nuevas categorías a la base de datos.

El modelo está entrenado con fragmentos reales detonados en laboratorio, imágenes que imitan escenarios de escena del crimen y recortes artificiales de envoltorios. Su relevancia radica en que automatiza una tarea pericial que de otro modo requiere comparación manual contra catálogos, y en que su enfoque de metric learning permite ampliar el catálogo de referencia de forma incremental.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Vision Transformer ViT-B/32 con cabeza de embedding lineal L2-normalizada |
| Parámetros totales | no disponible (ViT-B/32, del orden de 88 M según la arquitectura base; el autor no lo indica) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada de imagen 448x448 px) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | inglés (en) y neerlandés (nl), únicamente para el filtro de texto opcional |
| Licencia | EUPL-1.2 |
| Formato de pesos | no disponible (repo de 2,8 GB; el autor no detalla safetensors ni otro formato) |

## Arquitectura y entrenamiento

El sistema consta de dos componentes. El primero es un modelo de embedding basado en ViT-B/32 fine-tuneado con una cabeza lineal de 128 dimensiones y normalización L2. Se entrena con ProxyAnchorLoss (margen 0,5, alpha 64), AdamW con tasa de aprendizaje fija de 1e-4 para los pesos y 1e-2 para los vectores proxy, tamaño de lote de 150 y 20 épocas. La entrada es una imagen RGB de 448x448 píxeles. El objetivo del entrenamiento es que fragmentos del mismo envoltorio queden próximos en el espacio de embeddings y los de envoltorios distintos queden separados.

El segundo componente es la clasificación por recuperación: se generan embeddings de referencia de un conjunto de fondo para cada envoltorio del catálogo, se calcula la distancia coseno entre el embedding del fragmento consultado y cada referencia, y la distancia mínima por categoría determina la puntuación representativa. Este diseño permite añadir nuevos envoltorios sin reentrenar. Opcionalmente se aplica un filtro de texto posterior: el usuario introduce manualmente los fragmentos de texto visibles en el recorte y el sistema solo acepta coincidencias en las que todos los fragmentos aparecen en la etiqueta del producto.

Los datos provienen de casos reales del NFI desde 2010 y se dividen en tres conjuntos (desarrollo, validación y aplicación). Incluyen fragmentos reales detonados y fotografiados con cámara DSLR sobre fondo blanco, fragmentos simulados de escena del crimen con iluminación subóptima y cámara de móvil sobre mantas de ADN, y fragmentos artificiales generados por recorte aleatorio de imágenes de envoltorios para cubrir categorías sin muestras reales. No se documenta uso de RLHF ni DPO, algo esperable en un modelo discriminativo.

## Capacidades

- Recuperación visual de identidad de producto: dado un fragmento de envoltorio, devuelve las categorías de fuego artificial más probables ordenadas por distancia coseno.
- Embeddings de imagen de 128 dimensiones aptos para comparación por similitud coseno.
- Ampliación del catálogo sin reentrenamiento: basta con generar embeddings de referencia de los nuevos envoltorios.
- Filtro de texto opcional sobre las etiquetas, con coincidencia obligatoria de todos los fragmentos introducidos.
- Evaluación integrada mediante un componente de clasificación auxiliar.
- No soporta tool calling, agentes, razonamiento multi-paso ni generación de texto.
- Capacidades multimodales limitadas a visión y a un filtro textual basado en reglas, no en comprensión lingüística.

## Casos de uso

- Identificación pericial de fragmentos en investigación de explosivos: el perito fotografía el recorte sobre fondo uniforme, el modelo genera el embedding y lo compara contra la base de referencias para acotar el producto de origen.
- Triaje rápido en escena: con una foto de móvil sobre una manta de ADN, el sistema propone candidatos que el perito verifica después con el filtro de texto y cotejo manual.
- Ampliación del catálogo nacional de fuegos artificiales: al añadirse nuevos productos, se generan embeddings de referencia de sus envoltorios y quedan disponibles sin reentrenar el modelo.
- Apoyo a la trazabilidad de incautaciones: vincular lotes decomisados con fragmentos recuperados en incidentes para establecer relaciones entre casos.
- Formación y validación de peritos: la aplicación sirve como herramienta de comparación asistida que documenta candidatos y puntuaciones de similitud.
- Investigación académica en metric learning aplicado a forense: el par de datasets publicados permite reproducir el pipeline de entrenamiento y evaluar variantes de ProxyAnchorLoss en un dominio real.

## Benchmarks y rendimiento

| Métrica | Valor |
|---|---|
| RecallAtKValidator (k=1) | 0,9428 |
| RecallAtKValidator (k=3) | 0,9638 |
| RecallAtKValidator (k=5) | 0,9690 |
| CategoricalRecallAtKValidator (k=1) | 0,9821 |
| CategoricalRecallAtKValidator (k=5) | 0,9940 |

No se han publicado en la información disponible resultados comparativos frente a otros modelos en benchmarks estándar como MMLU, HumanEval o GSM8K, que además no aplican a un modelo de recuperación visual.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; un ViT-B/32 a 448x448 es manejable en GPUs de consumo, pero el autor no publica cifras.
- GPU recomendadas: no especificadas por el autor.
- Cabe en GPU de consumo: previsiblemente sí por el tamaño de la arquitectura, aunque no hay confirmación oficial ni requisitos publicados.
- Opciones de despliegue: la aplicación de referencia está publicada en GitHub y es el cauce previsto; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto/entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Vuurwerkverkenner (NFI) | ViT-B/32 + recuperación por embeddings | no disponible | imagen 448x448 | EUPL-1.2 | Hugging Face + app + GitHub |
| CLIP ViT-B/32 (OpenAI) | ViT contrastivo imagen-texto | ~88 M | imagen 224x224 | MIT | Hugging Face |
| DINOv2 ViT-B/14 | ViT auto-supervisado | ~86 M | imagen 518x518 | Apache 2.0 | Hugging Face |
| ResNet-50 preentrenado | CNN de clasificación | ~25 M | imagen variable | BSD/Apache según versión | Hugging Face, torchvision |

La comparación es orientativa: CLIP y DINOv2 son extractores de características genéricos que requerirían un pipeline de recuperación y fine-tune específico para esta tarea, mientras que Vuurwerkverkenner ya está especializado en fragmentos de fuegos artificiales y viene con datasets y aplicación. No se dispone de métricas cruzadas entre estos modelos en el dominio forense de envoltorios.

## Limitaciones y advertencias

- El modelo se entrenó y evaluó con fondos lisos e iluminación óptima; en condiciones reales de escena la precisión puede degradarse.
- Las métricas publicadas probablemente sobreestiman el rendimiento real, según advierte el propio autor.
- Si el tipo de fuego artificial es nuevo o raro y no está en la base de referencias, el modelo no podrá identificarlo.
- El filtro de texto exige introducir manualmente los fragmentos y que todos aparezcan en la etiqueta; un error de transcripción invalida la coincidencia.
- No se documentan sesgos específicos, pero al derivarse de casos del NFI la distribución de productos refleja el catálogo neerlandés y puede no generalizar a otros países.
- Riesgo de falsos positivos por similitud entre envoltorios parecidos; el autor recomienda revisar categorías con muchos envoltorios similares.
- Licencia EUPL-1.2: permite uso comercial y modificación con obligaciones de copyleft compatible; conviene revisar los términos antes de integrarlo en productos propietarios.
- El modelo está pensado para usarse con la aplicación Vuurwerkverkenner; no se garantiza su funcionamiento aislado ni se documenta el formato exacto de pesos.
- No apto para decisiones periciales automáticas sin revisión humana.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/NetherlandsForensicInstitute/vuurwerkverkenner
- Dataset de desarrollo: https://huggingface.co/datasets/NetherlandsForensicInstitute/vuurwerkverkenner-development-data
- Dataset de aplicación: https://huggingface.co/datasets/NetherlandsForensicInstitute/vuurwerkverkenner-application-data
- Aplicación: https://www.vuurwerkverkenner.nl
- Código fuente: https://github.com/NetherlandsForensicInstitute (repositorio de la aplicación Vuurwerkverkenner)
- Paper de ViT: https://arxiv.org/abs/2010.11929
- Documentación de ProxyAnchorLoss: https://kevinmusgrave.github.io/pytorch-metric-learning/losses/#proxyanchorloss
