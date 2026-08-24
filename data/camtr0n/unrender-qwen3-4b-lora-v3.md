# camtr0n/unrender-qwen3-4b-lora-v3

## Resumen

`camtr0n/unrender-qwen3-4b-lora-v3` es un adaptador LoRA entrenado sobre el modelo base `Qwen/Qwen3-4B-Instruct-2507` para reconstruir documentos LaTeX compilables a partir de la información extraída de un PDF renderizado: texto, cajas de palabras (word boxes) y nombres de fuentes declaradas. El objetivo es generar un archivo `.tex` que compile a la primera pasada con XeLaTeX, sin advertencias de caracteres ausentes y manteniendo la posición de las palabras dentro de un margen de 3 puntos. Este adaptador no procesa PDFs directamente; requiere un pipeline previo de extracción (el autor menciona `src/unrender/extract.py` en su repositorio de código).

El adaptador es ligero: 14,68 millones de parámetros, entrenado con QLoRA sobre una base cuantizada a 4 bits (nf4) y con una ventana de contexto de 8192 tokens. El autor (camtr0n, Cameron Moore) lo ha publicado en Hugging Face con licencia no declarada. Es una herramienta especializada para digitalización y reestructuración de documentos científicos o técnicos que ya existen en PDF, no un modelo generalista de generación de LaTeX desde cero.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre Qwen3-4B-Instruct-2507 (dense transformer) |
| Parametros totales | 14,68 M (adaptador); modelo base ~4 B (no declarado en la ficha) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 8192 tokens |
| Tipos de cuantizacion | Base cuantizada a 4-bit nf4 (QLoRA); adaptador en precisión original |
| Idiomas soportados | no disponible (el adaptador se entrena sobre datos de repositorios LaTeX, probablemente inglés) |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El adaptador se entrena sobre Qwen3-4B-Instruct-2507, un modelo de lenguaje denso de 4B parámetros de la familia Qwen3. Se aplica QLoRA con cuantización de la base a 4-bit nf4, y el adaptador añade 14,68 millones de parámetros (0,36% del total) distribuidos en las últimas 16 capas del modelo, con rango de actualización 16. La ventana de contexto se fija en 8192 tokens.

El conjunto de entrenamiento consta de 210 ejemplos extraídos de 308 repositorios LaTeX. No se incluyen fuentes de evaluación en el entrenamiento para evitar contaminación. El objetivo de entrenamiento es generar un `.tex` que compile con XeLaTeX en la primera ejecución, sin errores de glifos ausentes y con posiciones de palabras dentro de un margen de 3 puntos respecto a la página original. El autor menciona que el umbral N se calibra mediante perturbaciones, no se elige arbitrariamente: la distribución de error residual es bimodal (~0 o ~8+ puntos), por lo que cualquier N entre 1 y 7 puntos produce un comportamiento idéntico.

## Capacidades

- Reconstrucción de documentos LaTeX compilables a partir de texto extraído, cajas de palabras y fuentes declaradas de un PDF.
- Generación de archivos `.tex` que compilan en la primera ejecución de XeLaTeX, sin advertencias de caracteres ausentes.
- Mantenimiento de la estructura de página (número de páginas y posiciones de palabras dentro de 3 puntos).
- No es un modelo de propósito general: su especialización es la reconstrucción de documentos técnicos/científicos.
- No se reportan capacidades de tool calling, agentes o razonamiento multimodal.
- El adaptador no procesa PDFs directamente; requiere un pipeline de extracción previo.

## Casos de uso

- **Digitalización de documentos científicos en LaTeX**: dado un PDF de un artículo antiguo o escaneado (con extracción de texto y geometría), el adaptador produce un `.tex` editable que puede ser recompilado y modificado.
- **Reconstrucción de plantillas y formatos**: en editoriales académicas, permite recuperar el código LaTeX original de documentos que solo existen como PDF, facilitando la revisión y reutilización.
- **Migración de archivos a sistemas de publicación**: convertir documentos PDF a LaTeX para integrarlos en repositorios de código fuente (por ejemplo, proyectos de documentación técnica).
- **Preservación y archivo**: generar versiones LaTeX de documentos antiguos para mantener la fidelidad tipográfica y la capacidad de regeneración.
- **Análisis de documentos para NLP**: transformar PDFs en texto LaTeX estructurado para pipelines de minería de texto o entrenamiento de modelos.
- **Generación de material docente**: a partir de apuntes o diapositivas en PDF, crear archivos LaTeX editables para actualizar contenido o adaptar formatos.

## Benchmarks y rendimiento

El autor reporta resultados sobre 34 escenarios de validación (held-out) comparando el modelo base sin adaptador y el modelo con el adaptador LoRA v3. La tabla siguiente se extrae de la model card:

| Modelo | Compilados (de 34) | Glifos perdidos | Mismo línea | Alineación derecha | Recall | Score |
|---|---|---|---|---|---|---|
| Qwen3-4B base (bf16) | 25/34 | 138 | 0,584 | 0,386 | 0,569 | 0,2486 |
| **+ LoRA v3 (este adaptador)** | 27/34 | 299 | 0,641 | 0,395 | 0,578 | 0,2388 |

El adaptador logra compilar más escenarios (27 frente a 25), pero pierde más glifos (299 frente a 138) y su score global es ligeramente inferior (0,2388 frente a 0,2486). No se han publicado resultados en otros benchmarks generales (MMLU, HumanEval, etc.) porque el modelo está especializado en una tarea muy concreta.

## Requisitos de hardware

- El adaptador en sí ocupa unos 0,1 GB (repo) y se carga sobre el modelo base Qwen3-4B-Instruct-2507.
- Para la inferencia, se necesita el modelo base en memoria. Con cuantización 4-bit (nf4) la VRAM estimada ronda los 4-6 GB, y con precisión bf16 puede alcanzar ~8-10 GB.
- Recomendado: GPU con al menos 8 GB de VRAM para la versión cuantizada, y 12-16 GB para bf16 sin cuantizar. Tarjetas como RTX 3090, RTX 4090, A10, A100 o H100 son adecuadas.
- El adaptador se carga con la librería `peft` y `transformers`, y puede fusionarse con `merge_and_unload()` para producir un modelo único.
- La generación requiere `max_new_tokens` al menos 10000, lo que implica un uso intensivo de memoria durante la generación (el modelo produce salidas largas).
- No se dispone de datos de latencia o throughput específicos del adaptador.

## Comparativa con modelos similares

No hay información pública sobre otros adaptadores específicos para reconstrucción de LaTeX a partir de PDF. La comparativa más relevante es contra el modelo base sin adaptación (ver sección de benchmarks). Se puede considerar la versión anterior del mismo autor, `camtr0n/unrender-qwen3-4b-lora-v2`, pero no se han publicado resultados comparativos de la v2 en la información disponible.

| Modelo | Params | Contexto | Especialidad | Licencia |
|---|---|---|---|---|
| Qwen3-4B-Instruct-2507 (base) | ~4,4 B | 8192 | General | Apache 2.0 |
| + LoRA v3 (este) | 14,68 M adicionales | 8192 | Reconstrucción LaTeX | no disponible |
| + LoRA v2 | no disponible | no disponible | Reconstrucción LaTeX | no disponible |

## Limitaciones y advertencias

- **Sesgos y datos**: el entrenamiento se basa en 210 repositorios, lo que puede limitar la generalización a otros estilos de documentos, idiomas o formatos de PDF.
- **Alucinación**: el modelo puede generar comandos LaTeX no válidos o estructuras que no existen en el original, especialmente en documentos con formato complejo.
- **Rendimiento mixto**: aunque compila más escenarios que el base, pierde más glifos y tiene un score ligeramente inferior, lo que indica una degradación en la fidelidad de los caracteres.
- **Dependencia del pipeline de extracción**: el adaptador no funciona sobre PDFs crudos; requiere un formato de entrada específico (texto, cajas de palabras, fuentes) que debe ser generado por el script de extracción del autor.
- **Licencia no declarada**: no se especifica la licencia del adaptador en la model card, lo que puede limitar su uso comercial.
- **Contexto**: la ventana de 8192 tokens es suficiente para documentos cortos, pero para PDFs extensos puede truncar la entrada y afectar a la reconstrucción.
- **Generación larga**: requiere `max_new_tokens` de al menos 10000; una capa ajustada truncará el `.tex` a mitad de comando, generando archivos no compilables.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/camtr0n/unrender-qwen3-4b-lora-v3)
- [Versión v2 del adaptador](https://huggingface.co/camtr0n/unrender-qwen3-4b-lora-v2)
- [Perfil del autor en Hugging Face](https://huggingface.co/camtr0n)
- [Página de modelos de camtr0n](https://huggingface.co/camtr0n/models)
- [Repositorio de código (mencionado en la model card)](https://huggingface.co/camtr0n/unrender-qwen3-4b-lora-v3) (no se proporciona URL directa al repositorio de código en la información disponible)
