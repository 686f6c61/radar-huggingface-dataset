# CharlieBT/kd31-skillpack-t3m

## Resumen

CharlieBT/kd31-skillpack-t3m es un ajuste fino (finetune) del modelo MachinePulseAI/karpo-decision-31B, publicado por el usuario CharlieBT bajo licencia Apache 2.0. El modelo se distribuye en formato safetensors con 31.273.088.876 parámetros totales (aproximadamente 31,3 mil millones) y un tamaño de repositorio de 62,6 GB, lo que es coherente con pesos en precisión de 16 bits. La arquitectura declarada en las etiquetas es "gemma4", lo que sugiere que el modelo base deriva de la familia Gemma, aunque esta información no se detalla en la documentación disponible.

El pipeline declarado en Hugging Face es `text-classification`, si bien las etiquetas incluyen también `image-text-to-text`, lo que indica que el modelo base podría tener capacidades multimodales de entrada imagen-texto. Esta discrepancia entre el pipeline declarado y las etiquetas sugiere que el ajuste fino se ha orientado a una tarea de clasificación de texto a partir de un modelo multimodal subyacente.

El modelo tiene acceso restringido (gated): es necesario aceptar condiciones en Hugging Face para descargar los pesos. En el momento de redactar esta ficha no se han publicado resultados de benchmarks, documentación de entrenamiento ni detalles sobre el dataset utilizado en el ajuste fino, por lo que gran parte de las especificaciones técnicas se indican como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | gemma4 (según etiqueta de Hugging Face; no se detalla la variante exacta) |
| Parametros totales | 31.273.088.876 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La etiqueta `gemma4` en Hugging Face indica que el modelo base MachinePulseAI/karpo-decision-31B pertenece a la familia Gemma, aunque no se especifica la variante concreta ni si se trata de una arquitectura transformer densa o de mezcla de expertos (MoE). El tamaño de 31,3 mil millones de parámetros y el repositorio de 62,6 GB son consistentes con pesos en bfloat16 o float16 sin cuantizar. La etiqueta `image-text-to-text` sugiere que el modelo base incorpora un codificador de visión, si bien el ajuste fino publicado se orienta a clasificación de texto.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset de ajuste fino, ni si se emplearon técnicas de RLHF, DPO o supervisión directa. Tampoco se documentan innovaciones técnicas específicas del ajuste (decodificación especulativa, atención lineal u otras). Toda esta información debe considerarse no disponible a partir de los datos proporcionados.

## Capacidades

- Clasificación de texto: el pipeline declarado es `text-classification`, por lo que el ajuste fino está orientado a tareas de etiquetado o categorización de texto.
- Procesamiento de entrada imagen-texto: la etiqueta `image-text-to-text` sugiere que el modelo base admite entradas multimodales, aunque no se confirma que el ajuste fino conserve esta capacidad.
- Generación de texto: al derivar de un modelo de 31,3 mil millones de parámetros, es probable que mantenga capacidades generativas, pero no se documenta explícitamente.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (el campo de idiomas no está informado).
- Modo "thinking" u otras capacidades especiales: no disponible.

## Casos de uso

- Clasificación de documentos en pipelines de ingestión: el modelo puede emplearse para etiquetar documentos por categoría, tema o intención antes de indexarlos en un sistema de búsqueda o RAG, aprovechando su naturaleza de modelo de clasificación de texto.
- Moderación de contenido: uso como clasificador para detectar categorías de contenido sensible en flujos de texto entrante, integrándolo en una etapa previa a la publicación.
- Enrutamiento de tickets de soporte: clasificación automática de consultas de clientes en categorías (facturación, técnico, comercial) para dirigirlas al equipo adecuado.
- Análisis de sentimiento y opinión: etiquetado de reseñas o comentarios en categorías de polaridad o temática, siempre que se valide el comportamiento sobre el dominio objetivo.
- Etiquetado de datasets para entrenamiento: uso del modelo como anotador automático para pre-etiquetar grandes corpus de texto que luego se revisan manualmente.
- Clasificación de contenido multimodal (si se conserva la capacidad imagen-texto): categorización de publicaciones que combinan imagen y texto, como en plataformas de contenido o comercio electrónico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16/float16: aproximadamente 62,6 GB solo para los pesos, más overhead de activaciones y KV cache; se recomienda al menos 80 GB de VRAM para inferencia cómoda sin cuantizar.
- VRAM estimada en cuantización de 8 bits: en torno a 32-35 GB, viable en una A100 40 GB o en dos GPU de 24 GB.
- VRAM estimada en cuantización de 4 bits: en torno a 17-20 GB, potencialmente viable en una RTX 4090 (24 GB) con margen limitado para contexto largo.
- GPU recomendadas: A100 80 GB, H100 80 GB para inferencia sin cuantizar; A100 40 GB o RTX 4090 para cuantizaciones de 8 y 4 bits respectivamente.
- Cabe en GPU de consumo: solo en cuantizaciones agresivas (4 bits) y en tarjetas con 24 GB o más, como la RTX 4090 o la RTX 3090.
- Opciones de despliegue: transformers (librería declarada); vLLM, TGI o llama.cpp no están confirmados para este modelo concreto, por lo que su compatibilidad debe verificarse.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| CharlieBT/kd31-skillpack-t3m | 31,3 B | no disponible | Apache 2.0 | Gated en Hugging Face |
| MachinePulseAI/karpo-decision-31B (base) | no disponible | no disponible | no disponible | no disponible |
| Alternativas de ~30 B de la familia Gemma | no disponible | no disponible | no disponible | no disponible |

No se dispone de información suficiente sobre modelos comparables de la misma categoría para establecer una comparativa rigurosa de rendimiento, contexto o disponibilidad.

## Limitaciones y advertencias

- Acceso restringido: el modelo es gated y requiere aceptar condiciones en Hugging Face antes de su descarga.
- Documentación mínima: no se publican datos de entrenamiento, benchmarks, idiomas soportados ni contexto máximo, lo que dificulta evaluar su idoneidad en producción.
- Riesgo de alucinación: al ser un modelo generativo de gran tamaño, puede producir salidas incorrectas o inventadas, especialmente fuera del dominio de clasificación para el que fue ajustado.
- Sesgos: no se documenta ningún análisis de sesgos; al desconocerse la composición del dataset de ajuste fino, no puede descartarse la presencia de sesgos heredados del modelo base.
- Limitaciones de idioma: el campo de idiomas no está informado, por lo que no puede garantizarse un rendimiento adecuado en castellano u otros idiomas distintos del inglés.
- Uso comercial: la licencia Apache 2.0 permite uso comercial, pero debe verificarse que el modelo base MachinePulseAI/karpo-decision-31B no imponga restricciones adicionales que prevalezcan sobre la licencia del ajuste.
- Caveat de producción: la discrepancia entre el pipeline declarado (`text-classification`) y las etiquetas (`image-text-to-text`) hace recomendable validar empíricamente el comportamiento del modelo antes de integrarlo en un sistema real.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/CharlieBT/kd31-skillpack-t3m
- Modelo base: https://huggingface.co/MachinePulseAI/karpo-decision-31B
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la información disponible.
