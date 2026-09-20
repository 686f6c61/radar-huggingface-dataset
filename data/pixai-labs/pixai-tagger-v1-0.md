# pixai-labs/pixai-tagger-v1.0

## Resumen

PixAI Tagger v1.0 es un modelo de clasificación de imágenes multi-etiqueta desarrollado por pixai-labs, orientado específicamente al dominio del arte anime. Su función es asignar automáticamente etiquetas descriptivas a una imagen, repartidas en seis categorías: contenido general (ropa, poses, objetos, composición), personajes con nombre, estilos, obras y franquicias de origen, metadatos y clasificación por rating. El vocabulario total asciende a 30.877 etiquetas, frente a las 13.461 que manejaba su predecesor, PixAI Tagger v0.9.

El modelo emplea un backbone SAM3 reajustado (fine-tuned) con una cabeza de clasificación multi-etiqueta, identificado en los metadatos del repositorio con la etiqueta `cls_vitdet`. Trabaja a una resolución de entrada de 1008 × 1008 píxeles, preservando la relación de aspecto mediante redimensionado y padding en lugar de deformar la imagen. El cómputo total es de 486.346.909 parámetros, lo que lo sitúa en la gama media de los modelos de visión, con un repositorio de 1,9 GB.

Su relevancia actual radica en la mejora medible respecto a la versión anterior y frente a otros etiquetadores del mismo nicho: en el conjunto de evaluación compartido obtiene 0,6660 de micro F1 en etiquetas generales y 0,9242 en personajes, con una ventana de conocimiento de datos que llega hasta mayo de 2026. Está pensado para organizar colecciones, preparar conjuntos de datos y asistir en la redacción de descripciones, un flujo de trabajo habitual en la comunidad de generación de imágenes por difusión.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Backbone SAM3 reajustado con cabeza de clasificación multi-etiqueta (etiqueta `cls_vitdet` en el repositorio) |
| Parametros totales | 486.346.909 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica; entrada de imagen de 1008 × 1008 con relación de aspecto preservada mediante redimensionado y padding |
| Tipos de cuantizacion | No disponible (el repositorio publica pesos en safetensors sin cuantizaciones alternativas documentadas) |
| Idiomas soportados | No disponible en los metadatos; las etiquetas de salida del ejemplo de la model card están en inglés (`1girl`, `solo`) |
| Licencia | No disponible |
| Formato de pesos | safetensors |
| Tarea (pipeline) | image-classification (multi-etiqueta) |
| Vocabulario de etiquetas | 30.877 etiquetas en seis categorías |
| Categorias de salida | `general` (15.043), `character` (8.308), `style` (4.917), `copyright` (2.460), `meta` (145), `rating` (4) |
| Umbrales por defecto | general 0,17 · character 0,27 · style 0,15 · copyright 0,24 · meta 0,17 · rating 0,41 |
| Fecha de corte de datos | Mayo de 2026 |
| Tamano del repositorio | 1,9 GB |
| Libreria | transformers (requiere `trust_remote_code=True`) |

## Arquitectura y entrenamiento

El modelo se construye sobre un backbone SAM3 reajustado, al que se añade una cabeza de clasificación multi-etiqueta. La etiqueta `cls_vitdet` presente en los metadatos del repositorio apunta a una implementación de tipo ViTDet para la parte de clasificación. La entrada se procesa a 1008 × 1008 píxeles, cuatro veces y media más resolución lineal que los 448 × 448 de la versión 0.9, lo que explica en parte la mejora en la detección de detalles finos como prendas concretas o accesorios pequeños. El redimensionado preserva la relación de aspecto y rellena con padding, evitando la distorsión geométrica de la imagen original.

La model card no detalla el volumen de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de ajuste por refuerzo. Tampoco se documenta el uso de RLHF o DPO, algo esperable dado que no se trata de un modelo generativo de lenguaje. Lo que sí se documenta es la fecha de corte de los datos, mayo de 2026, y el procedimiento de calibración de umbrales: los valores por defecto de cada categoría corresponden a los ajustes de macro-F1 obtenidos en la evaluación de vocabulario completo, seleccionados únicamente sobre imágenes de calibración para no contaminar el conjunto de prueba. El informe menciona además un umbral global de 0,20 como resultado separado de umbral único.

La innovación principal respecto a la versión anterior es la ampliación del vocabulario, de 13.461 a 30.877 etiquetas, manteniendo la misma estructura de seis categorías. Esto multiplica por 2,3 la cobertura de conceptos sin degradar el rendimiento en las etiquetas que ambas versiones comparten, que es precisamente la comparación que los autores presentan como más justa.

## Capacidades

- Etiquetado multi-etiqueta de imágenes de estilo anime con 30.877 etiquetas posibles, agrupadas en categorías independientes con umbral configurable por categoría.
- Reconocimiento de contenido general: 15.043 etiquetas que cubren ropa, poses, objetos y composición de la escena.
- Identificación de personajes con nombre: 8.308 etiquetas de personajes.
- Clasificación de estilo artístico: 4.917 etiquetas de estilo.
- Detección de obra o franquicia de origen: 2.460 etiquetas de copyright, incluida la etiqueta `original`.
- Etiquetado de metadatos: 145 etiquetas relativas a medio, procedencia, resolución y estado.
- Clasificación por rating en cuatro niveles: `rating:g`, `rating:s`, `rating:q` y `rating:e`, con umbral por defecto de 0,41.
- Configuración flexible de umbrales: por categoría, sobrescribiendo solo una de ellas o aplicando un único valor numérico a todas.
- Integración con el ecosistema transformers mediante `pipeline()` con `trust_remote_code=True`, y posibilidad de apuntar a una carpeta local si el modelo ya está descargado.
- No soporta generación de texto, tool calling, function calling, razonamiento multi-paso ni capacidades de agente. Tampoco procesa audio ni vídeo según la información disponible.

## Casos de uso

- Organización de bibliotecas de imágenes anime: el modelo asigna etiquetas de personaje, franquicia y contenido general a cada archivo, lo que permite construir un índice consultable y filtrar colecciones de miles de imágenes sin etiquetado manual. El vocabulario de 30.877 etiquetas cubre tanto rasgos visibles como obras de origen.
- Preparación de datasets para entrenamiento de LoRA o DreamBooth: las etiquetas generadas se pueden volcar directamente como captions de entrenamiento, y la separación entre categoría `general`, `character` y `style` permite decidir qué conceptos se quieren aprender y cuáles actuarán como disparadores. El umbral ajustable ayuda a controlar la densidad de etiquetas por imagen.
- Moderación y filtrado de contenido: la categoría `rating` con cuatro niveles y umbral por defecto de 0,41 permite clasificar imágenes en g, s, q y e, y actuar como primera barrera en plataformas que necesiten separar contenido sensible del contenido apto para todo público.
- Búsqueda y recuperación de imágenes por atributos: al disponer de puntuaciones de confianza por etiqueta, se puede construir un buscador que permita consultas del tipo "personaje X con ropa Y" ordenando resultados por la puntuación combinada de las etiquetas relevantes.
- Curación y análisis de tendencias de estilo: la categoría `style`, con 4.917 etiquetas, permite agrupar producciones por corriente estética y medir la evolución de estilos a lo largo del tiempo, útil para editores, comisarios o equipos de producto.
- Asistencia en la redacción de descripciones: las etiquetas devueltas sirven como borrador estructurado que un humano revisa y convierte en un caption o en una ficha de catálogo, reduciendo el tiempo de redacción sin sustituir la revisión editorial.
- Auditoría de sesgo o cobertura en datasets existentes: ejecutar el etiquetador sobre un corpus ya recopilado permite cuantificar qué personajes, franquicias o estilos están sobrerrepresentados, con la advertencia de que la fecha de corte de mayo de 2026 limita el análisis de obras posteriores.
- Procesamiento por lotes en pipelines de datos: al ser un modelo de 486 millones de parámetros, cabe en una GPU de consumo y puede ejecutarse sobre lotes grandes de imágenes en una sola máquina sin infraestructura dedicada, integrándose en flujos ETL de datos visuales.

## Benchmarks y rendimiento

Benchmark de etiquetas comunes en la categoría `general`, sobre 8.407 etiquetas compartidas y 50.416 imágenes. Cada modelo usó un umbral calibrado únicamente sobre imágenes de calibración. Los resultados son estimaciones puntuales sin intervalos de confianza.

| Modelo | Micro F1 | Macro F1 | mAP |
|---|---:|---:|---:|
| PixAI Tagger v1.0 | 0,6660 | 0,3885 | 0,3807 |
| AnimeTIMM CAFormer B36 | 0,6435 | 0,3539 | 0,3324 |
| AnimeTIMM ConvNeXtV2 Huge | 0,6421 | 0,3752 | 0,3333 |
| AnimeTIMM EVA Giant | 0,6410 | 0,3796 | 0,3391 |
| AnimeTIMM EVA02 Large | 0,6401 | 0,3742 | 0,3423 |
| AnimeTIMM SigLIP Giant | 0,6362 | 0,3722 | 0,3267 |
| PixAI Tagger v0.9 | 0,5980 | 0,3286 | 0,3251 |
| Camie v2 | 0,5775 | 0,2109 | 0,2245 |

Comparativa entre versiones del mismo modelo, sobre las mismas imágenes de prueba y las etiquetas compartidas:

| Version | Vocabulario | Resolucion de entrada | General micro F1 | Character micro F1 |
|---|---:|---|---:|---:|
| PixAI Tagger v0.9 | 13.461 | 448 × 448 | 0,5980 | 0,8198 |
| PixAI Tagger v1.0 | 30.877 | 1008 × 1008 | 0,6660 | 0,9242 |

La mejora de v1.0 sobre v0.9 es de 6,80 puntos porcentuales en micro F1 general y 10,44 puntos en micro F1 de personajes. Según los autores, la ventaja en mAP sobre el siguiente modelo en la tabla es de 3,84 puntos (el texto de la model card aparece truncado en ese punto). No se han publicado en la información disponible resultados de benchmarks de otras tareas, como MMLU, HumanEval o GSM8K, que por otra parte no aplican a un modelo de clasificación de imágenes.

## Requisitos de hardware

- VRAM estimada para los pesos: aproximadamente 1,9 GB en fp32 (coincide con el tamaño del repositorio) y en torno a 1,0 GB en fp16 o bf16. Son estimaciones derivadas del recuento de 486,3 millones de parámetros, no cifras publicadas por el autor.
- VRAM total para inferencia: debe sumarse la memoria de activaciones y del procesador de imagen a 1008 × 1008, considerablemente mayor que en resoluciones de 448 × 448. Como orden de magnitud, cabe esperar un rango de 3 a 6 GB en fp16, aunque no hay mediciones oficiales publicadas.
- GPU recomendadas: no disponible en la información proporcionada. Por tamaño de parámetros, cualquier GPU con al menos 6-8 GB de VRAM debería ser suficiente para inferencia a resolución completa; A100 o H100 solo tendrían sentido para procesamiento por lotes a gran escala.
- GPU de consumo: sí, es probable que quepa en tarjetas como RTX 3060, RTX 4060, RTX 4070 o RTX 4090, dado el tamaño del modelo. No hay confirmación oficial de esta compatibilidad.
- Opciones de despliegue: la vía documentada es la librería `transformers` mediante `pipeline()` con `trust_remote_code=True`, ya que el repositorio incluye código personalizado. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que además no son aplicables a un modelo de clasificación de imágenes de este tipo.
- Dependencias declaradas: PyTorch, torchvision, Transformers, timm, NumPy y Pillow.
- Latencia y throughput: no disponibles. No se han publicado cifras de latencia ni de imágenes por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto/entrada | General micro F1 | General mAP | Licencia | Disponibilidad |
|---|---:|---|---:|---:|---|---|
| PixAI Tagger v1.0 | 486,3 M | 1008 × 1008 | 0,6660 | 0,3807 | No disponible | HuggingFace (pixai-labs) |
| AnimeTIMM CAFormer B36 | No disponible | No disponible | 0,6435 | 0,3324 | No disponible | No disponible |
| AnimeTIMM EVA Giant | No disponible | No disponible | 0,6410 | 0,3391 | No disponible | No disponible |
| AnimeTIMM EVA02 Large | No disponible | No disponible | 0,6401 | 0,3423 | No disponible | No disponible |
| AnimeTIMM SigLIP Giant | No disponible | No disponible | 0,6362 | 0,3267 | No disponible | No disponible |
| PixAI Tagger v0.9 | No disponible | 448 × 448 | 0,5980 | 0,3251 | No disponible | HuggingFace (pixai-labs) |
| Camie v2 | No disponible | No disponible | 0,5775 | 0,2245 | No disponible | No disponible |

La información disponible solo permite comparar el rendimiento en la categoría `general` sobre las 8.407 etiquetas compartidas. Los parámetros, la licencia y la disponibilidad de los modelos AnimeTIMM y Camie v2 no se detallan en los datos proporcionados. Destaca que PixAI Tagger v1.0 lidera las tres métricas de la comparativa (micro F1, macro F1 y mAP), con una ventaja de 2,25 puntos porcentuales en micro F1 sobre el siguiente modelo.

## Limitaciones y advertencias

- La licencia no está disponible en los metadatos. Antes de cualquier uso comercial es imprescindible contactar con el autor o consultar el repositorio para conocer los términos exactos.
- El modelo está especializado exclusivamente en arte anime. No hay evidencia de que generalice a fotografía, ilustración realista u otros dominios visuales.
- La fecha de corte de datos es mayo de 2026. Personajes, franquicias o estilos aparecidos con posterioridad no estarán representados en el vocabulario y el modelo probablemente los etiquetará de forma incorrecta o incompleta.
- Se trata de un clasificador multi-etiqueta con umbrales, no de un sistema determinista. Las puntuaciones son probabilidades calibradas sobre un conjunto concreto y pueden no transferirse bien a distribuciones de imagen distintas de las de calibración; los autores recomiendan tratar los umbrales por defecto como puntos de partida.
- La categoría `rating` incluye los niveles `q` y `e`, asociados a contenido sensible. Cualquier despliegue orientado a moderación debe validar sus propios umbrales, porque el valor 0,41 se eligió sobre imágenes de calibración y no sobre el tráfico real de una plataforma.
- Los sesgos del modelo no están documentados en la información disponible. Es razonable esperar que herede los sesgos de representación del corpus de entrenamiento, pero no hay datos publicados al respecto.
- El riesgo de alucinación, entendido como asignación de etiquetas no presentes en la imagen, existe y se mitiga subiendo los umbrales, a costa de perder cobertura. No se publican métricas de precisión y exhaustividad desagregadas por categoría más allá de las de la comparativa de etiquetas generales.
- Requiere `trust_remote_code=True`, lo que implica ejecutar código Python incluido en el repositorio del modelo. Conviene auditar ese código antes de desplegarlo en entornos de producción.
- No hay información sobre el rendimiento en idiomas distintos del inglés a nivel de etiquetas, ni sobre si el vocabulario sigue una convención concreta de etiquetado más allá de los ejemplos mostrados.
- No se han publicado cifras de latencia, throughput ni requisitos oficiales de hardware, lo que dificulta el dimensionamiento previo de una infraestructura de producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/pixai-labs/pixai-tagger-v1.0
- Versión anterior, PixAI Tagger v0.9: https://huggingface.co/pixai-labs/pixai-tagger-v0.9
- Sitio oficial de PixAI (en inglés): https://pixai.art/en
- Sitio oficial de PixAI (en francés): https://pixai.art/fr
- Sitio corporativo de PixAI: https://www.pix.ai/en/
- No se han encontrado en la búsqueda web papers, repositorios de código independientes ni demos adicionales asociados específicamente a este modelo.
- Aviso: el dominio pixai.fr corresponde a un servicio de creación visual sin relación aparente con pixai-labs, y pixai.lol parece un sitio espejo no oficial. No se recomienda tomarlos como fuentes del modelo.
