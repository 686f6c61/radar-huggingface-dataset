# caligo-org/docstructure-4b-v64-m3k-cut24-fullm

## Resumen

docstructure-4b-v64-m3k-cut24-fullm es un modelo de propósito específico desarrollado por caligo-org para la reconstrucción de la estructura jerárquica de documentos. Parte de Qwen/Qwen3.5-4B-Base, al que se le han eliminado los bloques de lenguaje 24 a 31 (conservando solo los 24 primeros) y se ha entrenado para leer una ventana de páginas de documento —imágenes de página más una línea de texto por cada región de maquetación— y predecir el padre de cada región, a partir del cual se construye el árbol de encabezados del documento.

El modelo tiene 3.767.352.704 parámetros totales (3,77 mil millones) y se distribuye como pesos completos en formato safetensors, con un tamaño de repositorio de 7,5 GB. No es un adaptador LoRA: el entrenamiento se realizó en dos fases, primero con un LoRA de rango 16 fusionado en los pesos y después con un ajuste completo de todos los pesos de lenguaje (2.678 millones), manteniendo congelados la tabla de embeddings, la torre de visión y el alineador.

La relevancia del modelo reside en su enfoque: en lugar de generar texto libre, emite marcadores de un solo token que codifican relaciones padre-hijo entre regiones, lo que permite construir directamente el árbol de secciones de un documento a partir de su representación visual y de maquetación. Está orientado a tareas de análisis documental (parsing de PDF, extracción de estructura de informes, facturas o artículos) y no a generación de texto general.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Qwen3.5) con torre de visión y alineador; recortado a 24 bloques de lenguaje |
| Parámetros totales | 3.767.352.704 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible de forma explícita; las ventanas de entrenamiento llegan a 90 páginas y hasta 70.000 tokens |
| Tipos de cuantización | No disponible (el autor menciona inferencia en bf16 y en 8 bits para el modelo de lenguaje) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer multimodal derivado de Qwen3.5-4B-Base. La modificación estructural principal consiste en recortar el modelo a sus primeros 24 bloques de lenguaje (bloques 0-23), descartando los bloques 24 a 31 del modelo base. Conserva la torre de visión y el alineador del modelo original, que permanecen congelados durante el entrenamiento. El proceso de construcción consta de tres pasos: primero el recorte a 24 bloques; después el entrenamiento de un LoRA de rango 16 sobre esa estructura (ejecución `v64-m3k-cut24`, una pasada) fusionado en los pesos mediante `merge_lora.py`; y finalmente una pasada adicional de entrenamiento completo de todos los pesos de lenguaje (2.678 millones), con la tabla de embeddings, la torre de visión y el alineador congelados, y una tasa de aprendizaje de 1e-5 a 1e-6 sobre nuevos recortes de ventana de los mismos documentos.

Los datos de entrenamiento son 185 documentos sintéticos (20 reservados para validación), con ventanas de 1 a 90 páginas y un límite de 70.000 tokens. Cada región se representa con 160 caracteres de texto seguidos de ` [truncated]`, y las imágenes de página se procesan a 800 px en el lado largo con la plantilla `qwen3_5_lz` definida en `register_lz.py`. El formato de respuesta utiliza marcadores de un solo token (`markers-3k.json`): cada línea de respuesta contiene el marcador de una región y el marcador de su padre. La pérdida en el conjunto de validación es de 0,031 (frente a 0,036 del adaptador fusionado del que partió y 0,021 del modelo completo de 32 bloques con adaptador). Los pesos `mtp.*` corresponden al modelo base y no se modificaron; la decodificación forzada de tokens no los utiliza.

## Capacidades

- Análisis de estructura documental: lee una ventana de páginas (imágenes más una línea de texto por región de maquetación) y predice la relación padre-hijo de cada región.
- Construcción de árboles de encabezados: a partir de las relaciones padre-hijo emitidas como marcadores de un token, se puede reconstruir la jerarquía de secciones del documento.
- Procesamiento multimodal: combina entrada visual (imágenes de página a 800 px) con entrada textual estructurada (una línea por región).
- Manejo de ventanas largas: entrenado con ventanas de 1 a 90 páginas y hasta 70.000 tokens.
- Salida restringida a marcadores: el formato de respuesta es un par marcador-región / marcador-padre, lo que simplifica el postprocesado.
- No se ha documentado soporte de tool calling, function calling, agentes, modo thinking, audio ni generación de texto libre.
- Capacidades multilingües: no disponibles.

## Casos de uso

- Extracción de la tabla de contenidos de PDF: el modelo recibe las imágenes de las páginas y las regiones detectadas por un motor de maquetación, y devuelve la relación padre-hijo de cada región, permitiendo reconstruir el índice jerárquico del documento sin heurísticas de tipografía.
- Procesamiento de informes financieros y memorias anuales: documentos de decenas de páginas con secciones anidadas se pueden analizar en ventanas de hasta 90 páginas y 70.000 tokens, generando el árbol de secciones para su indexación posterior.
- Enriquecimiento de pipelines de RAG documental: la estructura jerárquica producida permite dividir y etiquetar fragmentos por sección, mejorando la recuperación y la trazabilidad de las citas.
- Digitalización de documentación técnica y normativa: manuales y reglamentos con numeración multinivel se estructuran automáticamente para su publicación en portales o bases de conocimiento.
- Preprocesado para sistemas de gestión documental: la salida de marcadores se integra en un motor de maquetación existente para clasificar y ordenar regiones antes de tareas de OCR o extracción de campos.
- Análisis de contratos y expedientes administrativos: la identificación de la jerarquía de cláusulas y apartados facilita la revisión y el resumen por secciones.
- Investigación en parsing de documentos: sirve como modelo de referencia para experimentos de reconstrucción de estructura con salidas restringidas a marcadores y evaluación mediante métricas de árbol (HeadTEDS).

## Benchmarks y rendimiento

Resultados publicados por el autor con la métrica HeadTEDS sobre el gold original:

| Configuración | MarathonDocBench | MPDocBench |
|---|---|---|
| Motor draft-head, bf16, 800 px | 57,06 | 61,21 |
| Tokens forzados, LM en 8 bits, visión bf16, 576 px | 57,00 | 60,52 |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 7,5 GB en safetensors; en bf16 los pesos de lenguaje (2.678 millones) más la torre de visión y el alineador requieren aproximadamente 8 GB de VRAM, con margen adicional para las activaciones de ventanas largas.
- El autor reporta inferencia en bf16 y una variante con el modelo de lenguaje en 8 bits y la visión en bf16, lo que reduce los requisitos de memoria del LM.
- GPU recomendadas: no disponible de forma explícita; por tamaño, cabe en GPU de consumo con 12-16 GB (por ejemplo, RTX 4070 Ti, RTX 4080, RTX 4090) para ventanas moderadas, y en A100/H100 para ventanas de hasta 90 páginas y 70.000 tokens.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI; el repositorio incluye scripts propios (`register_lz.py`, `common.py`, `merge_lora.py`) y el formato safetensors es compatible con librerías estándar de transformers.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| docstructure-4b-v64-m3k-cut24-fullm | 3,77 mil millones (24 bloques) | Ventanas de hasta 70.000 tokens | Estructura documental (padre-hijo) | No disponible | Hugging Face (caligo-org) |
| Qwen/Qwen3.5-4B-Base | No disponible | No disponible | Generación multimodal general | No disponible | Hugging Face |
| Modelo completo de 32 bloques con adaptador (referencia del autor) | No disponible | No disponible | Estructura documental | No disponible | No disponible |

No se dispone de datos de benchmarks de los modelos comparables en la información proporcionada; la única comparación publicada es la pérdida de validación (0,031 frente a 0,036 del adaptador fusionado y 0,021 del modelo completo de 32 bloques con adaptador).

## Limitaciones y advertencias

- Modelo de propósito muy específico: no está diseñado para generación de texto libre, diálogo ni tareas generales; su salida se limita a marcadores de relación padre-hijo.
- Dependencia de un motor de maquetación externo: necesita que las regiones de cada página estén previamente detectadas y descritas en una línea de texto.
- Entrenado con solo 185 documentos sintéticos (20 reservados), lo que limita la diversidad de dominios y plantillas; el rendimiento en documentos reales fuera de esa distribución no está documentado.
- El recorte a 24 bloques de lenguaje puede degradar capacidades del modelo base; el autor reporta una pérdida de validación superior a la del modelo completo de 32 bloques con adaptador (0,031 frente a 0,021).
- Truncado del texto de región a 160 caracteres, lo que puede perder información en regiones con contenido extenso.
- Licencia no disponible: no se puede confirmar el uso comercial ni las condiciones de redistribución.
- Idiomas soportados no disponibles; el comportamiento multilingüe no está verificado.
- Riesgo de alucinación en las relaciones padre-hijo no cuantificado; se recomienda validación con métricas de árbol sobre datos propios.
- Sin datos publicados de latencia, throughput ni requisitos de hardware oficiales.

## Enlaces

- Hugging Face: https://huggingface.co/caligo-org/docstructure-4b-v64-m3k-cut24-fullm
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B-Base
- No se han encontrado otros enlaces (papers, blogs, repositorios o demos) en la información disponible.
