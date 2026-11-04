# empyrealworks/Swift-1.5-Flash-Next-Abliterated-Gufo-GGUF

## Resumen

Swift-1.5-Flash-Next-Abliterated-Gufo-GGUF es una cuantización GGUF del modelo Swift 1.5, desarrollada por el usuario empyrealworks a partir del modelo base Qwen/Qwen3.8-Flash-Next. Se trata de una variante "abliterated", es decir, con la dirección de rechazo proyectada fuera de 149 tensores residuales del modelo, lo que elimina los mecanismos de negativa aprendidos durante el alineamiento. El resultado es un modelo conversacional sin los filtros de rechazo habituales.

La relevancia de esta ficha es doble. Por un lado, documenta un modelo de aproximadamente 177.000 millones de parámetros en formato GGUF, con una ventana de contexto anunciada de 1.048.576 tokens (1M) mediante YaRN y capacidades multimodales a través de un proyector de visión en BF16. Por otro, está empaquetado específicamente para Gufo, un runtime orientado a hardware AMD Strix Halo (gfx1151), con una combinación de cuantizaciones poco habitual: proyecciones densas en Q8_0, proyecciones down de expertos enrutados en Q4_1 y una cabeza de predicción multi-token (MTP) en Q4.

El modelo incluye decodificación especulativa mediante una cabeza MTP separada, lo que permite acelerar la inferencia. El repositorio ocupa 109,3 GB y la licencia es swift-open-license-1.0, una licencia personalizada que requiere revisión antes de cualquier uso comercial. No se dispone de información sobre idiomas soportados ni sobre resultados de benchmarks publicados por el autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE) y cabeza de predicción multi-token (MTP); detalles completos no disponibles |
| Parametros totales | 176.943.899.520 (~177B) |
| Parametros activos | no disponible |
| Longitud de contexto | 1.048.576 tokens (configurado con `--context 1048576` y `--enable-yarn` en el ejemplo del autor) |
| Tipos de cuantizacion | Q8_0 (proyecciones densas), Q4_1 (proyecciones down de expertos enrutados), Q4 (cabeza MTP), BF16 (proyector de visión) |
| Idiomas soportados | no disponible |
| Licencia | swift-open-license-1.0 (etiquetada como `other` en HuggingFace) |
| Formato de pesos | GGUF (tres ficheros: modelo principal, cabeza MTP y proyector de visión) |

## Arquitectura y entrenamiento

El modelo base es Qwen/Qwen3.8-Flash-Next, del que no se proporcionan detalles de arquitectura interna más allá de que se trata de un transformer con mezcla de expertos (MoE), dado que la model card menciona "routed-expert down projections". La variante publicada por empyrealworks aplica una técnica de abliteration que proyecta fuera la dirección de rechazo de 149 tensores residuales, un procedimiento habitual para eliminar el comportamiento de negativa sin reentrenar.

El empaquetado está optimizado para el runtime Gufo sobre AMD Strix Halo (gfx1151). La cuantización es mixta y selectiva: las proyecciones densas se mantienen en Q8_0 para preservar calidad, mientras que las proyecciones down de los expertos enrutados se comprimen a Q4_1 para reducir el tamaño. Se incluye además una cabeza MTP en Q4 que habilita decodificación especulativa, y un proyector de visión en BF16 para mantener la calidad multimodal. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO en el modelo base.

## Capacidades

- Generación de texto y conversación multi-turno, con modo de razonamiento configurable (`--reasoning-effort xhigh` y `--preserve-thinking on` en el ejemplo del autor).
- Procesamiento de imágenes mediante el proyector de visión BF16 incluido (`mmproj-Swift-1.5-Flash-Next-BF16.gguf`).
- Decodificación especulativa mediante cabeza MTP, que acelera la generación de tokens.
- Soporte de contexto largo de hasta 1.048.576 tokens con YaRN habilitado.
- Comportamiento sin rechazos (abliterated): el modelo no aplica las negativas aprendidas durante el alineamiento.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso

- Investigación sobre alineamiento y seguridad: el modelo permite estudiar el comportamiento de un LLM sin la dirección de rechazo, comparándolo con el modelo base para analizar qué mecanismos de seguridad se eliminan y cuáles persisten.
- Despliegue en hardware AMD Strix Halo: el empaquetado está pensado para Gufo sobre gfx1151, por lo que sirve para probar inferencia local de un modelo de ~177B en un APU con memoria unificada, sin depender de GPUs NVIDIA.
- Procesamiento de documentos largos: con 1M tokens de contexto, el modelo puede ingerir libros completos, expedientes o bases de código extensas en una sola pasada para tareas de resumen y extracción.
- Análisis de imágenes con contexto textual largo: la combinación de proyector de visión y ventana de 1M permite describir y razonar sobre capturas, diagramas o páginas escaneadas junto con documentación extensa.
- Generación asistida con decodificación especulativa: la cabeza MTP permite acelerar la inferencia en entornos con recursos limitados, útil para prototipado interactivo en local.
- Experimentación con cuantizaciones mixtas: sirve como caso de estudio de cómo afecta Q8_0 en densas frente a Q4_1 en expertos a la calidad de un MoE grande, útil para quienes investigan técnicas de compresión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Tamaño en disco: 109,3 GB en total (106,8 GB el modelo principal, 1,6 GB la cabeza MTP, 0,9 GB el proyector de visión).
- VRAM/memoria estimada: al menos ~107 GB para cargar el modelo principal, más overhead del runtime y de la caché KV, que con 1M de contexto puede ser muy elevada. Con contextos reducidos, el requisito práctico ronda los 110-120 GB de memoria unificada o VRAM.
- Hardware objetivo: AMD Strix Halo con `gfx1151`, según el ejemplo de despliegue del autor. No se documenta soporte para GPUs NVIDIA.
- Cabe en GPU de consumo: no, salvo configuraciones con memoria unificada de gran capacidad como Strix Halo. Una RTX 4090 (24 GB) no puede alojar el modelo completo.
- Opciones de despliegue: Gufo (`gufo serve`), con soporte para `--speculative mtp`, `--enable-yarn` y `--reasoning-effort`. La carga de las proyecciones Q4_1 requiere una build de Gufo que las soporte (referencia a gufo-org/gufo issue 906).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Swift-1.5-Flash-Next-Abliterated-Gufo-GGUF | ~177B | 1.048.576 | GGUF | swift-open-license-1.0 | Abliterated, orientado a Gufo/Strix Halo, con MTP y visión |
| Qwen/Qwen3.8-Flash-Next (base) | ~177B (presumiblemente) | no disponible | safetensors (presumiblemente) | no disponible | Modelo original con alineamiento intacto |
| Otras variantes GGUF de Qwen3.8-Flash-Next | no disponible | no disponible | GGUF | no disponible | No se dispone de datos de comparación |

No se dispone de información suficiente para comparar con alternativas de la misma categoría en términos de rendimiento, ya que no se han publicado benchmarks ni datos de modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- Modelo abliterated: la eliminación de la dirección de rechazo implica que el modelo puede generar contenido dañino, ilegal o inseguro sin negarse. No es apto para despliegues públicos sin capas de moderación externas.
- Licencia swift-open-license-1.0: es una licencia personalizada; deben revisarse sus términos antes de cualquier uso comercial, ya que no se detallan en la información disponible.
- Idiomas soportados: no disponibles; no se puede garantizar un rendimiento adecuado en castellano sin evaluación previa.
- Riesgo de alucinación: no cuantificado en la información disponible, pero es un riesgo inherente a los LLM de esta escala.
- Requisito de runtime específico: las proyecciones Q4_1 de expertos requieren una build de Gufo con soporte (issue 906), lo que limita la portabilidad a otros runtimes como llama.cpp o vLLM.
- Contexto de 1M tokens: la caché KV a esa longitud puede consumir decenas de GB adicionales, lo que hace inviable el contexto máximo en la mayoría de configuraciones.
- Sin benchmarks publicados: no hay evidencia cuantitativa de calidad, por lo que cualquier uso en producción debe acompañarse de una evaluación propia.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay validación comunitaria del empaquetado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/empyrealworks/Swift-1.5-Flash-Next-Abliterated-Gufo-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Issue de Gufo sobre carga de proyecciones Q4_1: https://github.com/gufo-org/gufo/issues/906
