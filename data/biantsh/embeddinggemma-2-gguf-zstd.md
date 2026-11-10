# biantsh/embeddinggemma-2-GGUF-zstd

## Resumen

EmbeddingGemma 2 es un modelo de embeddings de Google, distribuido originalmente en formato GGUF por el repositorio `ggml-org/embeddinggemma-2-GGUF`. El repositorio analizado, `biantsh/embeddinggemma-2-GGUF-zstd`, no es un modelo nuevo ni un fine-tuning: es una reempaquetado del GGUF Q8_0 original comprimido con zstd, sin modificaciones en los pesos. Su proposito es reducir el tamano de descarga y permitir reanudar descargas interrumpidas gracias a la compresion por bloques de 16 MiB.

El modelo subyacente es un modelo de extraccion de caracteristicas (feature-extraction) orientado a generar representaciones vectoriales densas para tareas de recuperacion, similitud semantica y busqueda. La licencia es Apache 2.0, lo que facilita su uso comercial. El repositorio tiene un tamano de 0,6 GB y no registra descargas ni likes en el momento de la consulta.

La relevancia de este empaquetado es operativa: facilita la distribucion del modelo en entornos con ancho de banda limitado o conexiones inestables, manteniendo intactos los pesos originales verificables mediante SHA-256. No aporta mejoras de rendimiento ni cambios en la arquitectura.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de embeddings de Google; detalles no incluidos en la informacion proporcionada) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0 (GGUF), comprimido con zstd nivel 19 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF comprimido en `.zst` (descomprimible con `zstd -d`); incluye fichero `mmproj` |
| Tamano del repositorio | 0,6 GB |
| Ficheros | `embeddinggemma-2-Q8_0.gguf.zst` (280.577.244 bytes comprimidos; 309.855.456 originales) y `mmproj-embeddinggemma-2-Q8_0.gguf.zst` (296.191.728 comprimidos; 554.821.056 originales) |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del modelo base en la documentacion proporcionada. El repositorio se limita a describir el proceso de reempaquetado: los ficheros Q8_0 del GGUF original (revision `6ea3e3a309d12a4779cfda98b8c19800d2d5da71`) se dividieron en piezas de 16 MiB, cada una comprimida como un frame zstd independiente a nivel 19. El resultado es un `.zst` convencional que puede descomprimirse con la herramienta estandar.

La unica innovacion tecnica documentada es el esquema de compresion por bloques, que permite reanudar descargas interrumpidas desde el inicio de cada pieza de 16 MiB. Los pesos no se han modificado; la integridad se verifica mediante los SHA-256 publicados para los ficheros originales. No se aportan datos sobre tokens de entrenamiento, composicion del dataset, RLHF/DPO ni tecnicas de atencion.

## Capacidades

- Generacion de embeddings densos para extraccion de caracteristicas (pipeline `feature-extraction`).
- Soporte de similitud semantica y recuperacion de informacion mediante representaciones vectoriales.
- Incluye fichero `mmproj`, lo que sugiere soporte de proyeccion multimodal en el ecosistema GGUF (no confirmado en la informacion disponible).
- Compatible con el ecosistema GGUF (llama.cpp y derivados).
- Capacidades multilingues: no disponibles.
- Tool calling, agentes, razonamiento multi-paso, thinking mode, vision o audio: no disponibles en la informacion proporcionada.

## Casos de uso

- Busqueda semantica en documentacion interna: el modelo genera embeddings para indexar y recuperar fragmentos por similitud, integrándose en un pipeline de RAG con una base vectorial como FAISS o Qdrant.
- Clasificacion y deduplicacion de textos: comparar embeddings de pares de documentos permite detectar duplicados o agrupar contenido tematicamente sin entrenar un clasificador adicional.
- Sistemas de recomendacion basados en contenido: representar items y consultas de usuario en el mismo espacio vectorial para recuperar candidatos relevantes.
- Filtrado de spam o contenido anomalo: medir la distancia semantica respecto a un conjunto de referencia de ejemplos etiquetados.
- Agrupacion de tickets de soporte: generar embeddings de incidencias y aplicar clustering para identificar categorias recurrentes y priorizar.
- Despliegue en entornos con ancho de banda limitado: el formato zstd por bloques facilita la distribucion y reanudacion de descargas en infraestructuras con conexiones inestables, manteniendo la integridad verificable mediante SHA-256.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precision; el fichero Q8_0 descomprimido ocupa aproximadamente 310 MB y el `mmproj` unos 555 MB, por lo que el modelo cabe holgadamente en GPUs de consumo.
- GPU recomendadas: no disponibles; por tamano, cualquier GPU con al menos 1-2 GB de VRAM libre deberia ser suficiente para el fichero principal.
- Cabe en GPU de consumo: si, previsiblemente en cualquier GPU moderna (RTX 3060 o superior) e incluso en CPU, dado el tamano reducido.
- Opciones de despliegue: llama.cpp y herramientas compatibles con GGUF; el fichero debe descomprimirse previamente con `zstd -d`.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| biantsh/embeddinggemma-2-GGUF-zstd | no disponible | no disponible | GGUF + zstd | Apache 2.0 | Reempaquetado del Q8_0 de ggml-org |
| ggml-org/embeddinggemma-2-GGUF | no disponible | no disponible | GGUF | Apache 2.0 | Fuente original del GGUF Q8_0 |
| google/embeddinggemma-2 | no disponible | no disponible | safetensors (presumible) | Apache 2.0 | Modelo base de Google |

No se dispone de datos de rendimiento para establecer comparaciones cuantitativas con alternativas de la misma categoria.

## Limitaciones y advertencias

- El repositorio no es un modelo entrenado ni afinado: es un reempaquetado comprimido del GGUF original, por lo que hereda cualquier limitacion del modelo base.
- No se documentan sesgos conocidos ni riesgos de alucinacion especificos; al ser un modelo de embeddings, el riesgo principal es la representacion sesgada de textos, no la generacion.
- Limitaciones de contexto e idioma: no disponibles en la informacion proporcionada.
- La licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base de Google antes de desplegarlo en produccion.
- El fichero requiere descompresion previa con `zstd -d`; no es cargable directamente por llama.cpp en su forma `.zst`.
- El repositorio no registra descargas ni likes, y el autor no es el desarrollador original del modelo; se recomienda verificar los SHA-256 publicados antes de usar los pesos.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/biantsh/embeddinggemma-2-GGUF-zstd
- Modelo base en GGUF: https://huggingface.co/ggml-org/embeddinggemma-2-GGUF
- Modelo original de Google: https://huggingface.co/google/embeddinggemma-2
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
