# mie-edu/child-gemma4-e2b-v5-vision-gguf

## Resumen

child-gemma4-e2b-v5-vision-gguf es una adaptación del modelo google/gemma-4-E2B-it desarrollada por el autor mie-edu (vinculado a la Universidad de Mie, Japón) como parte de un trabajo de fin de grado del curso 2026. El modelo está especializado en una tarea educativa muy concreta: leer el texto de imágenes de material escolar japonés (boletines de clase, hojas fotocopiadas) y reescribirlo utilizando únicamente los kanji correspondientes al nivel de un curso escolar determinado. Se distribuye en formato GGUF para su uso con llama.cpp y aplicaciones móviles como PocketPal AI, Off Grid o Enclave.

La arquitectura subyacente es la del Gemma 4 E2B-it de Google, un transformer multimodal con capacidad de entrada imagen-texto. El autor solo ha reentrenado la parte lingüística (con un ajuste DPO posterior), por lo que el componente de visión (mmproj) es el original de Google convertido a GGUF por ggml-org y simplemente renombrado para que las aplicaciones lo asocien al modelo principal. El modelo tiene 4.628.569.635 parámetros totales y el repositorio ocupa 36,7 GB, aunque el uso típico se hace con las cuantizaciones Q6_K (3,8 GB) o Q8_0 (5,0 GB).

Su relevancia es acotada pero clara: demuestra cómo un modelo base relativamente pequeño puede adaptarse con éxito a una tarea pedagógica específica (control del vocabulario kanji por curso) y desplegarse en dispositivos de consumo, incluso móviles, sin conexión a internet. Está pensado exclusivamente para japonés y para el sistema educativo japonés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Gemma 4 E2B-it), con componente de visión mmproj separado |
| Parametros totales | 4.628.569.635 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el autor recomienda ajustar Context size a ~1024 en PocketPal AI) |
| Tipos de cuantizacion | Q6_K (3,8 GB), Q8_0 (5,0 GB), F16 (9,3 GB); mmproj en Q8_0 (0,56 GB) |
| Idiomas soportados | Japones (ja) |
| Licencia | Gemma Terms of Use y Gemma Prohibited Use Policy |
| Formato de pesos | GGUF (llama.cpp) |
| Modelo base | google/gemma-4-E2B-it |
| Tamano del repo | 36,7 GB |
| Archivos auxiliares | grammar_g3.gbnf a grammar_g6.gbnf (gramaticas GBNF por curso, ~1,5 KB cada una) |

## Arquitectura y entrenamiento

El modelo parte de google/gemma-4-E2B-it, un transformer multimodal de Google con capacidad de procesamiento de imágenes y texto. La adaptación realizada por mie-edu se centra exclusivamente en la parte lingüística: se ha reentrenado el modelo de lenguaje para la tarea de reescritura de texto con kanji restringidos por curso escolar, con un ajuste posterior mediante DPO (los pesos se denominan "dpo" en los nombres de archivo). El componente de visión es el original de Gemma 4 E2B-it convertido a GGUF por ggml-org y renombrado para que las aplicaciones lo emparejen automáticamente con el modelo principal.

No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni detalles sobre el proceso de RLHF/DPO más allá de su uso. La innovación técnica destacable es el uso de gramáticas GBNF por curso (grammar_g3 a grammar_g6) para restringir la generación al conjunto de kanji permitido en cada nivel educativo, y el diseño de un flujo de dos pasos (lectura de imagen y luego reescritura) porque el modelo no fue entrenado para reescritura directa desde imagen.

## Capacidades

- Lectura de texto en imágenes (OCR) de material escolar japonés impreso o fotografiado.
- Reescritura de texto sustituyendo kanji por equivalentes del curso escolar indicado (3.º a 6.º de primaria).
- Generación de texto conversacional en japonés.
- Procesamiento multimodal imagen-texto (entrada de imagen, salida de texto).
- Uso de gramáticas GBNF para restringir el vocabulario de salida por curso.
- Flujo de dos etapas: extracción de texto de la imagen y posterior reescritura pedagógica.
- No se documenta soporte de tool calling, function calling ni razonamiento multi-paso en la información disponible.

## Casos de uso

- Reescritura de boletines escolares para familias: el modelo lee una foto del boletín de clase y reescribe el texto con kanji del curso indicado, facilitando la comprensión a padres y alumnos de primaria.
- Adaptación de material didáctico por nivel: un docente puede fotografiar un texto y generar versiones simplificadas para distintos cursos (3.º a 6.º) usando las gramáticas GBNF incluidas.
- Digitalización de material escolar en papel: extracción de texto de hojas fotocopiadas o impresas con una tasa de error de caracteres del 2,5-3,2% (mediana) y conservación casi total de cifras y fechas.
- Uso educativo sin conexión en dispositivos móviles: despliegue en PocketPal AI, Off Grid o Enclave en teléfonos con 4-8 GB de RAM, útil en aulas sin conectividad fiable.
- Apoyo a la lectoescritura infantil: generación de textos con kanji adecuados al nivel del alumno para prácticas de lectura.
- Prototipado de asistentes educativos locales: base para desarrolladores que quieran construir herramientas de accesibilidad lingüística en japonés con modelos pequeños y cuantizados.
- Investigación en adaptación de modelos pequeños a tareas pedagógicas: ejemplo reproducible de fine-tuning con DPO y restricciones gramaticales sobre un modelo base de 4,6 mil millones de parámetros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor proporciona una métrica propia de la tarea: sobre 25 frases de boletín escolar convertidas en imágenes de estilo impreso y fotográfico, la tasa de error de caracteres fue del 2,5-3,2% en mediana, con conservación casi total de números y fechas.

## Requisitos de hardware

- VRAM/RAM estimada: Q6_K ~3,8 GB + mmproj ~0,56 GB; Q8_0 ~5,0 GB + mmproj; F16 ~9,3 GB + mmproj.
- En PocketPal AI el autor recomienda Context size de ~1024; en dispositivos con 8 GB de RAM, abrir la cámara junto con el modelo puede agotar la memoria y cerrar la aplicación.
- En iPhone, Off Grid usa GPU para el procesamiento de imágenes en equipos con más de 4 GB de RAM.
- Cabe en GPUs de consumo (RTX 3060 12 GB, RTX 4090, etc.) y en móviles de gama media-alta con las cuantizaciones Q6_K/Q8_0.
- Opciones de despliegue: llama.cpp, PocketPal AI, Off Grid, Enclave.
- Latencia y throughput: no disponibles en la información proporcionada.
- Recomendación del autor: adjuntar fotos desde la galería en lugar de usar la cámara directamente para ahorrar memoria.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| child-gemma4-e2b-v5-vision-gguf | 4.628.569.635 | no disponible | ja | Gemma Terms | GGUF | Especializado en kanji por curso escolar, con visión |
| google/gemma-4-E2B-it (base) | no disponible | no disponible | multilingue | Gemma Terms | safetensors/GGUF | Modelo generalista multimodal, sin especialización pedagógica |
| child-gemma4-e2b-v5-gguf (versión solo texto) | no disponible | no disponible | ja | Gemma Terms | GGUF | Misma tarea sin visión; 0,56 GB más pequeño y menor uso de memoria |

No se dispone de datos de benchmarks comparativos con otras alternativas en la información proporcionada.

## Limitaciones y advertencias

- El modelo solo soporta japonés; no es adecuado para otros idiomas.
- Puede detenerse tras leer solo la primera línea de un encabezado; el autor sugiere pedir "continúa" o añadir un salto de línea.
- Puede repetir texto al llegar a un salto de línea de la imagen; se recomienda recapturar con letra grande y papel plano.
- Confunde kanji de trazos complejos con palabras similares (p. ej., 懸命→熱心, 欠席→次席); conviene revisar la lectura antes de la reescritura.
- No fue entrenado para reescritura directa desde imagen; requiere el flujo de dos pasos (lectura y luego reescritura).
- Riesgo de alucinación en la lectura de texto manuscrito o imágenes de baja calidad; las métricas del autor se basan en texto impreso o fotografiado en condiciones controladas.
- Restricciones de licencia: uso sujeto a Gemma Terms of Use y Gemma Prohibited Use Policy; el componente mmproj es propiedad de Google y se rige por las mismas condiciones.
- En dispositivos con 8 GB de RAM o menos, el uso simultáneo de cámara y modelo puede provocar cierres de la aplicación.
- La compatibilidad de Enclave con el componente mmproj depende de la versión de la aplicación.
- Modelo de investigación académica (trabajo de fin de grado); no se documenta un proceso de validación en producción a gran escala.

## Enlaces

- Hugging Face: https://huggingface.co/mie-edu/child-gemma4-e2b-v5-vision-gguf
- Versión solo texto: https://huggingface.co/mie-edu/child-gemma4-e2b-v5-gguf
- Modelo base: https://huggingface.co/google/gemma-4-E2B-it
- Gemma Terms of Use: https://ai.google.dev/gemma/terms
- Gemma Prohibited Use Policy: https://ai.google.dev/gemma/prohibited_use_policy
