# jackttv/card-scanner-siglip-lora

## Resumen

Card scanner SigLIP2 es un adaptador LoRA de rango 16 sobre la torre de visión de google/siglip2-so400m-patch14-384, desarrollado por el usuario jackttv y publicado en Hugging Face bajo licencia Apache 2.0. No es un modelo generativo ni un sistema OCR: es un componente de recuperación de imágenes (image retrieval) especializado en identificar cartas coleccionables de Pokémon (inglés y japonés) y One Piece dentro de un catálogo cerrado de 57.913 productos. El adaptador se distribuye junto con una galería de embeddings precalculados (embeddings.pt) que debe desplegarse siempre en la misma revisión que los pesos, ya que mezclar embeddings de revisiones distintas invalida los resultados.

El problema que resuelve es concreto: dado un escaneo o fotografía de una carta física, recuperar la impresión exacta del catálogo (no solo el nombre) mediante similitud coseno entre embeddings L2-normalizados. La release actual, etiquetada name-first-2026-10-12, entrena durante 300 pasos con una función de pérdida combinada (`exact_product_cross_entropy + 4 * name_cross_entropy`) que prioriza acertar el nombre de la carta manteniendo supervisión sobre la impresión exacta. Es relevante para desarrolladores que construyan escáneres de cartas, herramientas de catalogación o sistemas de tasación, porque ofrece una alternativa ligera (1,2 GB de repo) frente a pipelines OCR + búsqueda textual, aunque con un dominio de aplicación muy acotado.

El modelo base SigLIP2-so400m es un codificador visión-lenguaje de aproximadamente 400 millones de parámetros con parches de 14×14 y resolución de entrada de 384 píxeles; el adaptador LoRA modifica únicamente la torre de visión y se fusiona con `merge_and_unload()` para inferencia. La información disponible no detalla el número de tokens de entrenamiento ni la composición completa del dataset más allá de las imágenes aumentadas del catálogo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | SigLIP2 (vision tower) + adaptador LoRA de rango 16 sobre la torre de visión |
| Parámetros totales | no disponible (modelo base SigLIP2-so400m, ~400M según nomenclatura; el adaptador LoRA añade un número no especificado) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de visión; entrada de imagen 384×384 en el base, preprocesado de producción a 400×558) |
| Tipos de cuantización | no disponible (pesos del adaptador en safetensors; embeddings en fp16; inferencia documentada en bfloat16) |
| Idiomas soportados | no disponibles (catálogo en inglés y japonés para Pokémon; One Piece; el modelo no realiza OCR ni reconocimiento de texto) |
| Licencia | Apache 2.0 |
| Formato de pesos | adapter_model.safetensors + adapter_config.json (PEFT), embeddings.pt (galería), evaluation.json |

## Arquitectura y entrenamiento

El adaptador se aplica sobre la torre de visión de SigLIP2-so400m-patch14-384, un transformer de visión con parches de 14×14 y resolución nativa de 384 píxeles. El LoRA es de rango 16 y se fusiona en el modelo base para producción. La galería asociada contiene 57.913 embeddings L2-normalizados en fp16 de dimensión 1.152, junto con ratios de aspecto y metadatos de procedencia de la build. El pipeline de producción decodifica con OpenCV, redimensiona a 400×558 con interpolación `INTER_LINEAR`, convierte BGR a RGB y aplica el procesador; las referencias de galería se codifican directamente con el procesador y la búsqueda se hace por similitud coseno en fp16.

El entrenamiento de esta release continúa el adaptador de catálogo combinado durante 300 pasos con la pérdida `exact_product_cross_entropy + 4 * name_cross_entropy`. La pérdida de nombre recompensa la probabilidad asignada a impresiones con el mismo nombre, mientras que la pérdida de producto exacto mantiene la supervisión sobre la impresión concreta. Los batches incluyen hermanos con el mismo nombre y negativos visualmente similares pero con nombre incorrecto. El entrenamiento usa imágenes aumentadas del catálogo y nunca los escaneos de evaluación. No se documentan datos de RLHF ni DPO, ni el volumen total de tokens o imágenes de entrenamiento.

## Capacidades

- Recuperación de imágenes por similitud: genera embeddings de imagen de cartas y los compara contra una galería de 57.913 productos mediante similitud coseno.
- Identificación de nombre de carta: la release name-first prioriza acertar el nombre sobre la impresión exacta.
- Identificación de impresión exacta: recupera la variante concreta del catálogo cuando está presente en la galería.
- Cobertura de catálogo: Pokémon en inglés, Pokémon en japonés y One Piece.
- Umbral de rechazo configurable: el autor documenta `min_similarity=0.60` como suelo que preserva las diez predicciones del conjunto de desafío y no rechaza ninguno de los 514 escaneos históricos.
- No soporta OCR ni garantiza reconocimiento correcto de texto; no es un modelo generativo, no hace tool calling, no soporta agentes ni razonamiento multi-paso.
- Capacidades multilingües limitadas al catálogo (nombres en inglés y japonés); no se documenta soporte de otros idiomas.

## Casos de uso

- Catalogación automática de colecciones: el sistema recibe una foto de cada carta, genera el embedding con el adaptador y busca el vecino más cercano en la galería para asignar nombre e impresión, reduciendo el trabajo manual de inventario.
- Escáner móvil de cartas en producción: el pipeline documentado (OpenCV, resize a 400×558, BGR a RGB, procesador SigLIP2) es directamente replicable en un servicio de identificación por lotes o en tiempo real.
- Verificación de listados en marketplaces: comparar la imagen subida por un vendedor contra la galería para detectar discrepancias entre el nombre anunciado y la carta fotografiada, usando el umbral de similitud como filtro de rechazo.
- Control de calidad en grading y tasación: prefiltrar cartas por nombre e impresión antes de la inspección humana, acelerando la clasificación de lotes grandes.
- Construcción de datasets etiquetados: usar las recuperaciones de alta confianza para etiquetar automáticamente imágenes nuevas y ampliar la galería con revisión humana.
- Detección de variantes y ediciones: aunque las variantes con imagen de catálogo idéntica siguen siendo ambiguas, el sistema distingue impresiones con representaciones visuales distintas, útil para separar ediciones de Pokémon japonés e inglés.
- Integración en herramientas de coleccionismo: el repositorio de GitHub card-scanner-siglip documenta el uso del adaptador en un escáner funcional, lo que facilita su incorporación en aplicaciones existentes.

## Benchmarks y rendimiento

Resultados publicados en la model card (diez escaneos de producción con mismatch, preprocesados como en producción):

| Modelo | Nombre correcto | Impresión exacta |
|---|---:|---:|
| CSR deployment anterior | 8/10 | 0/10 |
| Adaptador inicial de entrenamiento | 9/10 | 4/10 |
| Esta release | 10/10 | 5/10 |

Sobre 514 escaneos históricos de Pokémon, el top-1 de impresión exacta es 508/514 (98,83 %), frente a 508/514 del modelo CSR previo y 509/514 del adaptador inicial. Los dos fallos de nombre en el conjunto de desafío fueron Great Ball y Hau, cuyas impresiones exactas no están en la galería; la release recupera otras impresiones de esas cartas con similitudes coseno de 0,614 y 0,704, y sus diez candidatos principales tienen el nombre correcto en todos los casos. El autor advierte que los escaneos históricos se usaron para selección de modelo y que los diez escaneos de desafío son fallos preseleccionados solo de Pokémon, por lo que ninguno de los dos resultados establece precisión sobre entradas arbitrarias u otros juegos. No se publica benchmark de latencia.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el repo ocupa 1,2 GB y la inferencia documentada usa bfloat16 sobre SigLIP2-so400m (~400M parámetros), lo que en la práctica requiere una GPU con varios GB de VRAM, pero el autor no publica cifras.
- GPU recomendadas: no disponibles; al ser un modelo de ~400M parámetros, cabe previsiblemente en GPUs de consumo, pero no hay confirmación en la información proporcionada.
- Despliegue: transformers + PEFT (merge_and_unload), con descarga de la galería vía huggingface_hub; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no se reclama ningún benchmark de latencia nuevo en esta release.
- Almacenamiento: la galería de 57.913 embeddings fp16 de dimensión 1.152 debe cargarse junto al adaptador; desplegar siempre ambos desde la misma revisión.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Rendimiento documentado | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| card-scanner-siglip-lora (esta release) | LoRA sobre SigLIP2-so400m para retrieval de cartas | ~400M base + LoRA | no disponible | 10/10 nombre, 5/10 impresión en desafío; 508/514 top-1 en históricos | Apache 2.0 | Hugging Face |
| Adaptador CSR previo (misma familia) | LoRA sobre SigLIP2 para retrieval de cartas | ~400M base + LoRA | no disponible | 8/10 nombre, 0/10 impresión en desafío; 508/514 en históricos | no disponible | Hugging Face (revisión anterior) |
| Adaptador inicial de entrenamiento (misma familia) | LoRA sobre SigLIP2 para retrieval de cartas | ~400M base + LoRA | no disponible | 9/10 nombre, 4/10 impresión en desafío; 509/514 en históricos | no disponible | Hugging Face (revisión anterior) |
| google/siglip2-so400m-patch14-384 | Modelo base visión-lenguaje | ~400M | no disponible | no aplica (sin fine-tuning específico) | Apache 2.0 | Hugging Face |

No se dispone de comparación con otros sistemas de identificación de cartas (por ejemplo, pipelines OCR + búsqueda textual) en la información proporcionada.

## Limitaciones y advertencias

- El adaptador y la galería deben desplegarse siempre desde la misma revisión; mezclar embeddings de adaptadores anteriores con estos pesos produce resultados inválidos.
- No añade OCR ni garantiza reconocimiento correcto de texto; la identificación se basa en similitud visual, no en lectura de caracteres.
- Las variantes de impresión o acabado con imágenes de catálogo idénticas siguen siendo ambiguas.
- La similitud coseno no es una probabilidad calibrada; el umbral `min_similarity=0.60` debe reevaluarse en el dominio de captura propio.
- Los resultados publicados proceden de diez escaneos de desafío preseleccionados como fallos y de 514 escaneos históricos usados para selección de modelo; no establecen precisión sobre entradas arbitrarias ni sobre otros juegos.
- Cobertura limitada a Pokémon (inglés y japonés) y One Piece; no se documentan otros juegos ni idiomas.
- Sesgos conocidos: no disponibles en la información proporcionada.
- Riesgo de alucinación: no aplica en el sentido generativo, pero sí existe riesgo de recuperar una carta visualmente similar con nombre incorrecto cuando la impresión exacta no está en la galería.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base y las imágenes del catálogo pueden tener condiciones adicionales no detalladas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jackttv/card-scanner-siglip-lora
- Repositorio del escáner: https://github.com/Tabletop-Village/card-scanner-siglip
- Modelo base: https://huggingface.co/google/siglip2-so400m-patch14-384
