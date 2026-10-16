# cgerdes/embeddinggemma-2-coreml-mirror

## Resumen

Este repositorio no es un modelo entrenado desde cero, sino un espejo (mirror) con conversión a Core ML del encoder de texto de `google/embeddinggemma-2`, el modelo de embeddings de Google. Lo publica el usuario `cgerdes` para que la aplicación Apiscript pueda descargar siempre la misma versión fijada y evitar que un cambio, borrado o reescritura del repositorio original rompa las instalaciones existentes. El artefacto se generó de forma automática con el script `scripts/package-embeddinggemma.sh` y el propio autor advierte de que no debe editarse a mano.

La conversión afecta únicamente al encoder de texto. Los pesos se almacenan en 8 bits por canal, el cómputo se realiza en fp16 y la entrada es fija: 512 tokens mediante `input_ids` y `attention_mask` (int32, forma `[1, 512]`). La salida es un vector `embedding` en fp32 de dimensión `[1, 768]`, con *mean-pooling* y normalización L2 ya aplicados. El repositorio ocupa 0,3 GB e incluye un archivo de modelo de 249.615.861 bytes junto con los ficheros de tokenizador, que son idénticos byte a byte a los del modelo original.

Su relevancia es práctica para desarrolladores que integran búsqueda semántica *on-device* en aplicaciones: ofrece un artefacto reproducible, con licencia Apache-2.0 y con una verificación explícita de equivalencia frente a la versión `sentence-transformers` en fp32 (coseno >= 0,99 sobre 50 entradas en alemán e inglés). No incorpora generación de texto, sino extracción de características y similitud de frases.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder de texto para embeddings; arquitectura interna del modelo base no detallada en la informacion disponible |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 512 tokens (entrada fija: `input_ids` y `attention_mask`, int32 `[1, 512]`) |
| Tipos de cuantizacion | Pesos de 8 bits por canal; computo en fp16 |
| Idiomas soportados | no disponible (las pruebas de equivalencia se hicieron en aleman e ingles) |
| Licencia | Apache-2.0 |
| Formato de pesos | Core ML (`embeddinggemma-2-text-512-w8.aar`, 249.615.861 bytes) |

## Arquitectura y entrenamiento

El repositorio no describe un entrenamiento propio. Se trata de una conversión del encoder de texto de `google/embeddinggemma-2` (revision `914f7f89142e33e77833254d9c9b90c3cef7303b`) a formato Core ML. El proceso aplica cuantización de pesos a 8 bits por canal con cómputo en fp16, fija la secuencia de entrada en 512 tokens y expone como salida un único vector de 768 dimensiones que ya viene con *mean-pooling* y normalización L2. El modelo base se distribuye bajo Apache-2.0, condición que se mantiene en este espejo, y los ficheros `LICENSE` y `NOTICE` viajan dentro del archivo.

La innovación relevante aquí es la del proceso de empaquetado y la verificación de fidelidad, no la del modelo en sí. Antes de subir el artefacto, el autor comparó cada vector generado frente a la versión `sentence-transformers` en fp32 y obtuvo una similitud coseno mayor o igual a 0,99 sobre 50 entradas en alemán e inglés. Para un uso correcto hay que emplear los *prompts* oficiales: `task: search result | query: ` para las consultas y `title: <title or none> | text: ` para los documentos. El tokenizador se mantiene idéntico al del repositorio original.

## Capacidades

- Generación de embeddings de texto: produce vectores normalizados en L2 de 768 dimensiones a partir de entradas de hasta 512 tokens.
- Similitud de frases y búsqueda semántica: la tarea declarada en las etiquetas es `sentence-similarity` y `feature-extraction`.
- Recuperación de documentos con *prompts* diferenciados para consulta y documento, lo que permite construir índices vectoriales orientados a *retrieval*.
- Funcionamiento *on-device* mediante Core ML, orientado a inferencia local en aplicaciones.
- Soporte multilingüe: no confirmado en la información disponible; la validación de equivalencia solo cubre alemán e inglés.
- No dispone de generación de texto, razonamiento, código, matemáticas, visión ni audio.
- No se documenta soporte de *tool calling*, *function calling* ni razonamiento multi-paso.

## Casos de uso

- Búsqueda semántica dentro de una aplicación de escritorio o móvil: indexar el contenido local como vectores de 768 dimensiones y recuperar los fragmentos más cercanos a una consulta, sin enviar datos a un servidor.
- RAG (generación aumentada por recuperación) local: usar el modelo como recuperador y encadenarlo a un LLM aparte para responder sobre documentación propia, aprovechando los *prompts* de consulta y documento.
- Deduplicación y agrupación de contenidos: calcular similitud coseno entre embeddings para detectar entradas repetidas o agrupar textos por temática.
- Búsqueda de notas o correo personal en macOS/iOS: al ser un artefacto Core ML, encaja en flujos donde la privacidad impide subir el texto a la nube.
- Clasificación y etiquetado con *k*-NN: reutilizar los vectores como características para un clasificador ligero sobre un conjunto de ejemplos etiquetados.
- Recomendación de contenido: representar ítems y consultas en el mismo espacio vectorial para sugerir elementos afines.
- *Caching* reproducible en pipelines de integración: al estar el modelo fijado a una revisión concreta, las aplicaciones pueden depender de un artefacto estable que no cambia con el tiempo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. El único dato de rendimiento aportado es la verificación de fidelidad frente a la versión fp32.

| Prueba | Resultado |
|---|---|
| Equivalencia frente a `sentence-transformers` fp32 | Similitud coseno >= 0,99 sobre 50 entradas en aleman e ingles |

## Requisitos de hardware

- Artefacto de 249.615.861 bytes (aproximadamente 238 MiB) más tokenizador y ficheros auxiliares; repositorio total de 0,3 GB.
- Orientado a ejecución local en plataformas compatibles con Core ML (dispositivos Apple), donde puede usar la Neural Engine, la GPU o la CPU.
- Al estar cuantizado a 8 bits por canal, el uso de memoria es muy inferior al de la versión fp32 del modelo base.
- No se especifican GPU de servidor (A100, H100, RTX 4090) porque el formato Core ML no está pensado para esos entornos.
- Opciones de despliegue: Core ML en aplicaciones Apple; para servir embeddings en servidor habría que recurrir al modelo base `google/embeddinggemma-2` con otras herramientas (por ejemplo sentence-transformers, vLLM u Ollama), que no forman parte de este repositorio.
- Latencia y *throughput*: no disponibles.

## Comparativa con modelos similares

| Modelo | Formato | Contexto | Cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| `cgerdes/embeddinggemma-2-coreml-mirror` | Core ML (`.aar`) | 512 tokens | 8 bits por canal, computo fp16 | Apache-2.0 | Espejo fijado a una revision; solo el encoder de texto |
| `google/embeddinggemma-2` (modelo base) | Pesos originales del autor (safetensors/formato nativo, no detallado) | no disponible | fp32 (referencia de comparacion) | Apache-2.0 | Modelo original de Google del que deriva este espejo |
| Otros modelos de embeddings comparables | no disponible | no disponible | no disponible | no disponible | No se aportan datos de otras familias en la informacion disponible |

## Limitaciones y advertencias

- Es un espejo de conversión, no un modelo nuevo: cualquier mejora o corrección del modelo base no llegará a este repositorio salvo que el autor lo regenere.
- La entrada está fija a 512 tokens; los textos más largos deben truncarse o dividirse en fragmentos.
- Solo se incluye el encoder de texto. Cualquier componente adicional del modelo original (por ejemplo, multimodal) queda fuera de esta conversión.
- La cuantización a 8 bits introduce una aproximación: la equivalencia medida es >= 0,99 de coseno, no una coincidencia exacta con fp32.
- El soporte real de idiomas no está confirmado; la validación se limitó a alemán e inglés, por lo que el comportamiento en otros idiomas no está verificado en esta conversión.
- El uso de los *prompts* incorrectos (`task: ... | query:` o `title: ... | text:`) puede degradar la calidad de la recuperación, ya que el modelo se diseñó para ellos.
- Licencia Apache-2.0: permite uso comercial, pero conviene revisar también el aviso `NOTICE` incluido en el archivo para cumplir las condiciones de atribución.
- Riesgo de alucinación: no aplica directamente, ya que el modelo no genera texto; el riesgo se traslada al sistema que consuma los embeddings (por ejemplo, el LLM de un RAG).
- Sesgos: no disponibles; no se documenta ninguna evaluación de sesgos para este artefacto.

## Enlaces

- Repositorio del espejo en HuggingFace: https://huggingface.co/cgerdes/embeddinggemma-2-coreml-mirror
- Modelo base (Google): https://huggingface.co/google/embeddinggemma-2
- Revision del modelo base fijada por el autor: `914f7f89142e33e77833254d9c9b90c3cef7303b`
