# florin-inc/florin-parser-nano

## Resumen

florin-parser-nano es un ajuste fino LoRA del modelo KDLAI/KDL-Frontier-Parser-nano, desarrollado por florin-inc, que a su vez se basa en la arquitectura Qwen2-VL de 1.200 millones de parámetros (1,16 B). El objetivo del modelo es mejorar el reconocimiento de texto en documentos con formato enriquecido, emitiendo marcado inline (negritas, tachado, superíndice y subíndice) durante la tarea de OCR. Está diseñado específicamente para el parsing de documentos, con especial atención a documentos de seguros (declaraciones SERFF, informes EDGAR) y soporte multilingüe (inglés, chino e hindi).

El modelo se distribuye bajo licencia AGPL-3.0, heredada del modelo base, y su pipeline completo (entrenamiento, generación de datos, evaluación) está disponible públicamente en GitHub. Su relevancia actual radica en que aborda una limitación común de los modelos OCR: la pérdida de formato semántico al convertir documentos a texto plano. Según los resultados publicados en ParseBench, consigue una puntuación de formato semántico de 71,71, superando la mejor entrada open-weight del ranking público (69,30).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen2-VL (transformer multimodal con torre de visión) |
| Parametros totales | 1.156.026.624 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base, no especificada) |
| Tipos de cuantizacion | BF16 (safetensors); no se documentan cuantizaciones adicionales |
| Idiomas soportados | en, zh, hi |
| Licencia | AGPL-3.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base es KDLAI/KDL-Frontier-Parser-nano, un modelo de 1,2 B parámetros basado en la arquitectura Qwen2-VL, que combina un codificador de visión con un transformer de lenguaje. El ajuste fino aplica LoRA con rango 16 únicamente sobre las capas de atención y MLP del módulo de lenguaje, dejando congelados la torre de visión y el proyector. El entrenamiento se realizó durante 2 épocas con una tasa de aprendizaje de 5e-5, en precisión BF16, en una única GPU H100 durante aproximadamente 50 minutos, utilizando una pérdida de solo-completado y un prompt idéntico al de producción ("\nText Recognition:\n").

El conjunto de datos de entrenamiento consta de 6.678 pares recorte-de-región → markdown, compuestos por: 2.165 fragmentos reales de declaraciones de aseguradoras del SEC EDGAR (con verdad fundamental de negritas derivada del DOM HTML), 3.313 fragmentos sintéticos renderizados (única fuente de tachado, superíndice y subíndice, incluyendo texturas de periódicos CJK y devanagari) y 1.200 negativos sin estilo para enseñar moderación. El autor documenta que el prompting por sí solo no era suficiente: cuatro variantes de prompt probadas obtuvieron puntuaciones iguales o inferiores al control, ya que el modelo base emitía marcado pero marcaba los tramos incorrectos.

## Capacidades

- Reconocimiento de texto en imágenes con emisión de formato inline: `**negrita**`, `~~tachado~~`, `<sup>` y `<sub>`.
- Parsing de documentos estructurados, incluyendo tablas, gráficos y contenido mixto.
- OCR multilingüe con soporte para inglés, chino e hindi (incluyendo texturas de periódicos CJK y devanagari en el entrenamiento).
- Grounding visual: capacidad de localizar elementos en la imagen (medida en ParseBench con 74,15).
- Fidelidad de contenido: mantiene la integridad del texto extraído respecto al documento original (87,35 en ParseBench).
- No se documenta soporte para tool calling, agentes o razonamiento multi-paso.

## Casos de uso

- Digitalización de documentos de seguros: el modelo puede extraer texto de declaraciones SERFF y formularios de tarifas, conservando el formato semántico (negritas en cláusulas, superíndices en referencias legales), lo que facilita su posterior procesamiento automático en sistemas de suscripción.
- Archivado de documentos corporativos: convierte PDFs escaneados o imágenes de informes anuales a Markdown estructurado, preservando jerarquías visuales y anotaciones, útil para motores de búsqueda interna o bases de datos documentales.
- Extracción de datos de publicaciones científicas: reconoce tablas, ecuaciones con subíndices y notas al pie en artículos de investigación, generando salida en formato Markdown listo para su integración en pipelines de análisis bibliométrico.
- Procesamiento de prensa y noticias: dado su entrenamiento con texturas de periódicos CJK, puede digitalizar recortes de prensa en chino e hindi, manteniendo el formato original (titulares en negrita, pies de foto), para servicios de monitoreo de medios.
- Automatización de back-office legal: extrae cláusulas de contratos y documentos judiciales escaneados, conservando el marcado de énfasis que puede indicar términos importantes, reduciendo la intervención manual en tareas de revisión.
- Generación de contenido accesible: convierte documentos escaneados a HTML/Markdown con formato semántico, permitiendo su reutilización en lectores de pantalla o sistemas de publicación web sin pérdida de estructura.

## Benchmarks y rendimiento

Resultados en ParseBench (corpus completo, 2.079 documentos, cinco dimensiones). La comparación honesta es la columna "mismo entorno", que muestra una mejora de +4,30 sobre el modelo base evaluado en las mismas condiciones.

| Dimension | florin-parser-nano | Base (publicado) | Base (mismo entorno) |
|---|---:|---:|---:|
| Tablas | 86,14 | 85,56 | 85,76 |
| Gráficos | 65,39 | 63,41 | 63,69 |
| Fidelidad de contenido | 87,35 | 87,19 | 87,18 |
| Formato semántico | **71,71** | 66,81 | 52,42 |
| Grounding visual | 74,15 | 78,84 | 74,19 |
| **Global** | **76,95** | **76,36** | **72,65** |

La confirmación con dos ejecuciones independientes dio 76,95 y 76,89 (diferencia absoluta de 0,06; máxima diferencia por dimensión de 0,12), reportándose la media de 76,92. En un subconjunto de documentos de seguros (384 documentos, incluyendo declaraciones SERFF), el modelo obtiene 77,60 frente a 74,77 del pipeline base medido idénticamente. El autor indica que la comparación con el número publicado (+0,59) cruza entornos de evaluación y debe interpretarse con cautela.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 1,156 M de parámetros en BF16, lo que supone aproximadamente 2,3 GB de pesos. Con overhead de activaciones y KV cache, se estima un uso de VRAM entre 4 y 6 GB para una imagen de resolución media.
- GPU recomendadas: cualquier GPU consumer con al menos 6 GB de VRAM (RTX 3060, RTX 4060, RTX 4090) es suficiente. Para procesamiento por lotes o despliegue concurrente, se recomienda una GPU profesional (A10, A100, H100).
- Cabe en GPUs consumer: sí, en todas las GPU de gama media y alta actuales.
- Opciones de despliegue: al ser un modelo Safetensors en formato HuggingFace, puede servirse con vLLM, TGI o Transformers. Para entornos sin GPU, se puede convertir a GGUF y usar llama.cpp u Ollama, aunque no se documenta una conversión oficial.
- Latencia y throughput: no se proporcionan datos medidos. Como referencia orientativa, un modelo de 1,2 B en una RTX 4090 puede alcanzar decenas de tokens por segundo, pero la latencia real depende del tamaño de la imagen de entrada y del número de tokens generados.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato semantico (ParseBench) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| florin-parser-nano | 1,16 B | no disponible | 71,71 | AGPL-3.0 | Safetensors en HF |
| KDLAI/KDL-Frontier-Parser-nano (base) | 1,2 B | no disponible | 52,42 (mismo entorno) | AGPL-3.0 | Safetensors en HF |
| Mejor entrada open-weight en ParseBench | no disponible | no disponible | 69,30 | no disponible | no disponible |

La comparativa se limita al modelo base y al mejor resultado open-weight del ranking público, ya que no se dispone de datos de otros modelos de la misma categoría (parsing de documentos con formato semántico) en la información proporcionada.

## Limitaciones y advertencias

- Licencia AGPL-3.0: cualquier uso comercial o despliegue como servicio debe cumplir con los términos de copyleft, lo que puede requerir la publicación del código fuente de las modificaciones. Verificar implicaciones legales antes de usar en producción.
- Sesgos potenciales: el entrenamiento se centra en documentos de seguros (SEC EDGAR) y fragmentos sintéticos, por lo que el rendimiento puede degradarse en otros dominios (facturas, formularios médicos, documentos manuscritos).
- Riesgo de alucinación: como todo modelo generativo, puede inventar texto o formato en regiones ambiguas o de baja resolución. Se recomienda validación humana para documentos críticos.
- Limitaciones de idioma: aunque soporta inglés, chino e hindi, el conjunto de datos sintéticos para CJK y devanagari es limitado; el rendimiento en estos idiomas puede ser inferior al del inglés.
- Dependencia del prompt: el modelo está entrenado con un prompt fijo ("\nText Recognition:\n"); cualquier modificación del prompt puede degradar el rendimiento, como se demostró en las pruebas del autor.
- Sin cuantizaciones oficiales: no se ofrecen versiones GGUF, INT8 o INT4, por lo que el despliegue en entornos con poca VRAM requiere conversión manual.
- El modelo no incluye soporte para tool calling, agentes ni razonamiento multi-paso; es exclusivamente un parser de imágenes a texto con formato.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/florin-inc/florin-parser-nano
- Modelo base: https://huggingface.co/KDLAI/KDL-Frontier-Parser-nano
- Repositorio de reproducción (entrenamiento, datos, evaluación): https://github.com/ammoman21/parsebench-open-weight-sota
- Nota metodológica (mencionada en la model card, sin URL directa): no disponible
