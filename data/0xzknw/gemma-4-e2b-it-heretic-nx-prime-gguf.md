# 0xzknw/Gemma-4-E2B-it-Heretic-NX-PRIME-GGUF

## Resumen

Gemma 4 E2B IT — Heretic NX PRIME Q8_0 es una edición conductual del modelo `google/gemma-4-E2B-it` de Google, publicada por el usuario 0xzknw en Hugging Face. El objetivo declarado es reducir los falsos rechazos (refusals) del modelo original manteniendo la capacidad general, mediante una edición directa de los pesos cuantizados a Q8_0. El proyecto se denomina "Heretic NX" y aplica un protocolo interno de evaluación y preservación de capacidades llamado PRIME, que no es una certificación externa.

El modelo base es un transformer de la familia Gemma 4 con aproximadamente 4.647 millones de parámetros (según el dato de safetensors), aunque la documentación web de Google indica que Gemma 4 E2B tiene 2.1 mil millones de parámetros; esta discrepancia no está resuelta en la información disponible. La versión GGUF aquí descrita es solo de texto, con una ventana de contexto de 8K tokens según la web gemma4.dev, y no incluye los componentes de preprocesado de imagen o audio del modelo base. Se distribuye bajo licencia Apache 2.0.

La relevancia de esta ficha radica en que se trata de un artefacto de edición de modelos con un enfoque metodológico explícito: mide la deriva respecto al Q8 original mediante divergencia KL y evalúa la preservación de capacidades en tareas de opción múltiple. Es útil para desarrolladores que buscan alternativas con menos rechazos en entornos controlados, aunque con advertencias importantes de seguridad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Gemma 4) |
| Parametros totales | 4.647.450.147 (dato safetensors) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 8.192 tokens (8K, segun gemma4.dev) |
| Tipos de cuantizacion | Q8_0 (GGUF) |
| Idiomas soportados | Multilingue |
| Licencia | Apache 2.0 (Gemma 4 license) |
| Formato de pesos | GGUF (safetensors no incluido en el repo) |

## Arquitectura y entrenamiento

El modelo es una edición directa del artefacto Q8_0 de `google/gemma-4-E2B-it`, no una reconstrucción desde un checkpoint editado por separado. Se modifican siete operadores densos compartidos: proyecciones down de la FFN en las capas 15, 23, 25 y 26, y proyecciones de salida de atención en las capas 16, 17 y 30. El método emplea destilación de detector con penalización benigna (`lambda=100`, `beta=4.0`), reparación aditiva (`gamma=1.875`) y dos ajustes de fuerza de coordenadas. El detector final se proyecta ortogonalmente a la activación BF16 de una fila benigna de desarrollo (fila 53), lo que se declara explícitamente como una reparación dirigida.

No se proporcionan datos sobre el entrenamiento original del modelo base (número de tokens, composición del dataset, uso de RLHF/DPO). La model card solo describe el proceso de edición y su evaluación. El modelo base de Google es un transformer de la familia Gemma 4, pero no se detallan innovaciones arquitectónicas específicas en la información disponible.

## Capacidades

- Generación de texto en multiples idiomas (etiqueta "multilingual").
- Ventana de contexto de 8K tokens, suficiente para conversaciones de varias vueltas y documentos medianos.
- Reduccion de falsos rechazos: la edicion reduce los marcadores lexicos de rechazo de 104 filas dañinas de 6/104, frente a un comportamiento mas restrictivo del original.
- Preservacion de capacidades en tareas de opcion multiple (ARC-Challenge, HellaSwag, MMLU) segun la evaluacion pareada.
- No incluye capacidades de vision, audio ni tool calling en esta version GGUF; el modelo base las tiene, pero no se empaquetan aqui.
- Compatible con runtime de llama.cpp y LM Studio, con soporte de chat template via `--jinja`.

## Casos de uso

- Asistentes conversacionales en entornos controlados: el modelo puede gestionar dialogos multi-turno con contexto de 8K, y su menor tasa de rechazo puede ser util en aplicaciones donde se requiere respuestas directas sin rodeos, siempre bajo supervisión humana.
- Generacion de contenido creativo (relatos, guiones, ideas): su capacidad multilingue y su menor censura permiten explorar temas variados, aunque debe usarse con cuidado por el riesgo de contenido inapropiado.
- Traduccion y localizacion de textos: al ser multilingue, puede traducir fragmentos de hasta 8K tokens, aunque no se han publicado benchmarks especificos de traduccion.
- Resumen de documentos y articulos: con 8K de contexto, puede resumir informes o articulos de extension media, manteniendo la fidelidad segun la evaluacion de MMLU (62.28%).
- Generacion de codigo basico: aunque no se menciona tool calling, el modelo base de Gemma 4 tiene capacidades de codigo; esta edicion podria usarse para fragmentos simples, pero no hay datos de HumanEval.
- Analisis de sentimiento y clasificacion de texto: su rendimiento en tareas de opcion multiple sugiere que puede manejar clasificaciones simples, aunque no se ha evaluado especificamente.

## Benchmarks y rendimiento

La model card incluye una evaluacion pareada entre el Q8 original y la edicion Heretic NX sobre 854 preguntas deterministicas de ARC-Challenge, HellaSwag y MMLU, con respuestas de primer token greedy restringidas a A/B/C/D.

| Tarea | Filas | Original Q8 | Heretic NX Q8 | Diferencia |
|---|---:|---:|---:|---:|
| ARC-Challenge | 256 | 74.22% | 73.44% | -0.78 puntos |
| HellaSwag | 256 | 58.59% | 59.38% | +0.78 puntos |
| MMLU | 342 | 61.99% | 62.28% | +0.29 puntos |
| **Total** | **854** | 64.64% | 64.75% | **+0.12 puntos** |

El intervalo bootstrap pareado al 95% para la diferencia (Heretic - original) es [-0.94, +1.17] puntos, lo que cruza cero y no demuestra una mejora agregada, pero si respalda la preservacion de capacidades dentro de un margen de no inferioridad de 3 puntos. Ademas, se reportan metricas de deriva: media de KL de primer token de 0.008579, mediana de 0.000054, P95 de 0.025772 y maximo de 0.201503 sobre 104 filas benignas. Los marcadores de rechazo lexico son 6/104 en filas dañinas.

No se han publicado resultados de benchmarks adicionales (HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- El archivo GGUF Q8_0 pesa 4.95 GB, por lo que se necesita al menos esa cantidad de VRAM para cargar los pesos, mas overhead de activaciones y KV cache.
- Se recomienda una GPU con al menos 8 GB de VRAM para inferencia comoda (por ejemplo, RTX 3060, RTX 4060, RTX 2070, o GPUs de datacenter como A10 o T4).
- En GPUs con 6 GB de VRAM podria funcionar con contexto reducido, pero no esta garantizado.
- El modelo base de 2.1B puede correr en CPU, pero esta version de 4.6B en Q8_0 es mas pesada; en CPU seria lenta, aunque posible con llama.cpp.
- Opciones de despliegue: llama.cpp (llama-server), LM Studio, y cualquier runtime compatible con GGUF (Ollama, text-generation-webui, etc.).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| google/gemma-4-E2B-it (original) | 2.1B (segun web) o 4.6B (segun safetensors) | 8K | BF16, Q8_0 | Apache 2.0 | Modelo base con vision, audio y tool calling |
| 0xzknw/Gemma-4-E2B-it-Heretic-NX-PRIME-GGUF | 4.6B (safetensors) | 8K | Q8_0 | Apache 2.0 | Edicion con menos refusals, solo texto |
| DuoNeural/Gemma-4-E2B-Heretic-GGUF | No disponible | No disponible | GGUF | No disponible | Otra edicion similar, sin datos publicados |

No se dispone de informacion sobre otros modelos comparables de la misma categoria (tamano similar, ediciones de refusals) en los resultados de busqueda.

## Limitaciones y advertencias

- La edicion reduce deliberadamente el comportamiento de rechazo, lo que puede aumentar el cumplimiento de solicitudes inseguras, ilegales, incorrectas o dañinas. No anade factibilidad, juicio, sandboxing ni seguridad a nivel de aplicacion.
- Las evaluaciones de capacidad y de refusals son estrechas (854 preguntas de opcion multiple y 104 filas dañinas) y ambas suites participaron en el desarrollo y seleccion, por lo que no son conjuntos de validacion independientes.
- La evaluacion de capacidades no demuestra una mejora agregada (el intervalo de confianza cruza cero); solo respalda la preservacion dentro de un margen de 3 puntos.
- No se incluyen los componentes de vision y audio del modelo base; esta version es solo texto.
- No se han publicado datos sobre sesgos, alucinaciones o limitaciones de idioma especificas.
- La licencia Apache 2.0 permite uso comercial, pero el usuario debe asumir la responsabilidad de los outputs generados, especialmente en contextos de produccion.
- Se recomienda ejecutar generaciones no confiables en un sandbox adecuado.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/0xzknw/Gemma-4-E2B-it-Heretic-NX-PRIME-GGUF
- Modelo base: https://huggingface.co/google/gemma-4-E2B-it
- Repositorio de experimentos (GitHub): https://github.com/0xZKnw/heretic-nx
- Pagina oficial de Gemma 4 (DeepMind): https://deepmind.google/models/gemma/gemma-4/
- Documentacion de Gemma 4 E2B: https://gemma4.dev/models/gemma-4-e2b
- Tweet de Google sobre Gemma 4 E2B: https://x.com/googlegemma/status/2093355401307963769
- Edicion similar de DuoNeural: https://huggingface.co/DuoNeural/Gemma-4-E2B-Heretic-GGUF
