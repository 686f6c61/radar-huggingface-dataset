# gatilin/kanana-2-vision-encoder-tiny

## Resumen

Kanana-2 Vision Encoder Tiny es un codificador visual (vision encoder) de 98,7 millones de parámetros desarrollado por Kakao Corp. dentro de la familia Kanana-2. No se trata de un modelo de lenguaje multimodal completo, sino de un extractor de características visuales autónomo diseñado para alimentar modelos de visión-lenguaje (VLM). Su función es convertir imágenes en representaciones latentes (`last_hidden_state`) que posteriormente se inyectan en la torre lingüística de un VLM.

Este repositorio concreto (`gatilin/kanana-2-vision-encoder-tiny`) es un espejo comunitario del modelo oficial `kakaocorp/kanana-2-vision-encoder-tiny`. Según la model card, el fichero de pesos safetensors es idéntico byte a byte al original y se verificó contra el SHA-256 del LFS de origen. Incluye además un cargador de conveniencia (`component.py`) y un `validation.json` con una prueba de humo en CPU sobre imágenes reales.

La relevancia de esta variante "tiny" radica en su tamaño reducido (0,2 GB de repositorio), lo que la hace adecuada para prototipado rápido, despliegue en entornos con recursos limitados y como componente de pipelines de extracción de características visuales. La serie Kanana-2 Vision Encoder se publica junto a una variante "medium" de 426M parámetros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision encoder (familia Kanana-2), implementación custom_code sobre transformers |
| Parametros totales | 98.720.768 (98,7M) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos en safetensors; cuantización no documentada) |
| Idiomas soportados | No disponible (modelo visual, no lingüístico) |
| Licencia | Kanana Open License (`kanana-open-license`), etiquetada como `other` |
| Formato de pesos | safetensors |
| Pipeline | image-feature-extraction |
| Tipo de tarea | feature-extraction / vision-encoder |
| Modelo base | kakaocorp/kanana-2-vision-encoder-tiny |
| Tamaño del repo | 0,2 GB |
| Descargas | 14 |
| Fecha de creación | 2026-11-06 |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del codificador (tipo de backbone, resolución de entrada, número de parches o estrategia de atención). Se trata de un vision encoder de la familia Kanana-2, orientado a extracción de características visuales para modelos de visión-lenguaje. El modelo se distribuye con su configuración, procesador e implementación originales sin modificar, más un fichero `component.py` añadido como cargador de conveniencia.

No se han publicado en la información disponible datos sobre el número de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF, DPO o ajuste supervisado. El autor del espejo indica que `validation.json` contiene una prueba de humo en CPU con imágenes reales, y advierte explícitamente de que no se trata de una evaluación end-to-end de VLM ni de una comprobación de paridad en GPU.

## Capacidades

- Extracción de características visuales: devuelve `last_hidden_state` a partir de imágenes RGB procesadas por el procesador incluido.
- Comprensión visual general: según la descripción de la serie oficial, los codificadores Kanana-2 están orientados a comprensión visual general, comprensión de documentos y razonamiento visual.
- Integración como componente de VLM: pensado para alimentar la torre lingüística de modelos de visión-lenguaje.
- Procesamiento de imágenes: requiere conversión a RGB y ajuste del dtype de `pixel_values` al dtype del modelo.
- No es un modelo generativo: no produce texto, no soporta tool calling ni razonamiento multi-step por sí mismo.
- Capacidades multilingües: no aplica, al ser un componente puramente visual.

## Casos de uso

- Prototipado de pipelines VLM: usar el encoder para generar embeddings de imagen y conectarlos a una torre lingüística propia, aprovechando su reducido tamaño (98,7M parámetros) para iterar rápido en investigación.
- Extracción de características para búsqueda visual: generar embeddings de imágenes y almacenarlos en un índice vectorial para recuperación por similitud en catálogos o bases de datos de imágenes.
- Comprensión de documentos: según la descripción de la serie, el encoder está orientado a document understanding, por lo que puede emplearse para representar páginas escaneadas antes de tareas de extracción de información.
- Clasificación y etiquetado de imágenes: congelar el encoder y entrenar una cabeza ligera de clasificación sobre `last_hidden_state` para tareas específicas de dominio.
- Evaluación comparativa de encoders: al ser un espejo verificado byte a byte del oficial, sirve para reproducir experimentos y comparar contra la variante medium (426M) en términos de coste/calidad.
- Despliegue en entornos con recursos limitados: su tamaño de 0,2 GB permite ejecutarlo en CPU para pruebas de humo y en GPUs de gama baja para extracción por lotes.
- Componente de sistemas de moderación o análisis de contenido: extracción de representaciones visuales que alimenten clasificadores posteriores de contenido sensible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo referencia una prueba de humo en CPU (`validation.json`) sobre imágenes reales, que no constituye una evaluación comparativa de rendimiento.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 98,7M parámetros en fp32 los pesos ocupan aproximadamente 0,4 GB, y en fp16/bf16 alrededor de 0,2 GB, a lo que hay que sumar activaciones y memoria del procesador de imagen.
- GPU recomendadas: no especificadas por el autor. Por tamaño, cualquier GPU con al menos 2-4 GB de VRAM debería ser suficiente para inferencia en precisión reducida.
- GPU de consumo: cabe previsiblemente en GTX 1650, RTX 3060, RTX 4060 y superiores; también se ha validado una prueba de humo en CPU.
- Opciones de despliegue: la model card documenta el uso con PyTorch, torchvision, Transformers, accelerate, safetensors y Pillow mediante `snapshot_download` y el cargador `component.py`. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Kanana-2 Vision Encoder Tiny (este) | 98,7M | No disponible | image-feature-extraction | Kanana Open License | Hugging Face (espejo comunitario y oficial) |
| Kanana-2 Vision Encoder Medium | 426M (0,4B) | No disponible | image-feature-extraction | Kanana Open License | Hugging Face (oficial) |
| Otros encoders visuales de propósito general | No disponible | No disponible | image-feature-extraction | No disponible | No disponible |

La comparación natural dentro de la misma familia es con la variante medium (426M parámetros), que ofrece mayor capacidad a costa de un tamaño aproximadamente 4,3 veces superior. No se dispone de datos de benchmarks que permitan comparar calidad entre ambas variantes ni frente a encoders de otros proveedores.

## Limitaciones y advertencias

- No es un VLM completo: no genera texto ni mantiene conversaciones; solo produce características visuales.
- Sin benchmarks publicados: no hay evidencia cuantitativa de calidad frente a alternativas, más allá de una prueba de humo en CPU.
- Restricciones de licencia: se aplica la Kanana Open License Agreement, que incluye una política de usos prohibidos y condiciones de redistribución. Ciertos servicios comerciales requieren una licencia separada, por lo que es obligatorio revisar el fichero `LICENSE` antes de un uso comercial.
- Obligación de aviso de copyright: el aviso requerido está incluido en `NOTICE` y debe conservarse en la redistribución.
- Cumplimiento de las Guidelines for Responsible AI de Kakao: la sección 2.2 de la licencia exige su cumplimiento.
- Es un espejo comunitario: aunque los pesos están verificados byte a byte, la responsabilidad de mantenimiento y actualización recae en el autor del espejo, no en Kakao.
- Idiomas: al ser un componente visual, no se documentan capacidades lingüísticas; cualquier comportamiento multilingüe dependerá del VLM al que se conecte.
- Riesgo de sesgos: no documentado en la información disponible; los sesgos visuales heredados del dataset de entrenamiento del modelo original no se detallan.
- Sin soporte documentado para cuantización: no se indican formatos GGUF ni recetas de cuantización.

## Enlaces

- Repositorio del espejo: https://huggingface.co/gatilin/kanana-2-vision-encoder-tiny
- Modelo oficial: https://huggingface.co/kakaocorp/kanana-2-vision-encoder-tiny
- Colección Kanana-2 Vision Encoder: https://huggingface.co/collections/kakaocorp/kanana-2-vision-encoder
- Variante medium: https://huggingface.co/kakaocorp/kanana-2-vision-encoder-medium
