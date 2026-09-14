# JasonYANG170/bge-small-zh-v1.5-ONNX

## Resumen

bge-small-zh-v1.5-ONNX es una conversión a formato ONNX del modelo de embeddings BAAI/bge-small-zh-v1.5, publicada por el usuario JasonYANG170. No incluye ajuste fino: es una exportación del checkpoint original (revisión `7999e1d3359715c523056ef9478215996d62a620`) con el único objetivo de ejecutar el modelo en navegador y en Node mediante Transformers.js y ONNX Runtime, incluyendo aceleración por WebGPU. El repositorio ocupa 0,2 GB e incluye tres variantes de precisión con sus pesos y grafo.

Se trata de un modelo de extracción de características (feature-extraction en HuggingFace), es decir, no genera texto: produce vectores de embedding a nivel de token que, tras aplicar pooling y normalización, se utilizan para búsqueda semántica, recuperación aumentada (RAG), clustering o clasificación por similitud. El modelo base es monolingüe en chino y la etiqueta de arquitectura del repositorio es `bert`, por lo que hereda la estructura de encoder transformer del modelo original.

Su relevancia actual es de tipo práctico: permite desplegar recuperación semántica en chino íntegramente en el cliente (navegador con WebGPU o WASM, o Node en CPU), sin servidor de inferencia, con artefactos de entre 47,5 MB y 94,8 MB según precisión. La ficha del autor documenta además comprobaciones numéricas de fidelidad entre variantes, los scripts de exportación y cuantización, y un problema conocido de cierre del proceso en Node con WebGPU nativo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder transformer tipo BERT (etiqueta `bert` del repositorio); conversión del modelo base BAAI/bge-small-zh-v1.5 |
| Parametros totales | No disponible. El artefacto FP32 de 94,8 MB es coherente con aproximadamente 24 M de parámetros (estimación a partir del tamaño del fichero, no confirmada por el autor) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la ficha de la conversión. La familia BGE v1.5 del modelo base opera con ventanas de 512 tokens |
| Tipos de cuantizacion | FP32 (94,8 MB), FP16 (47,5 MB), Q8 (57,2 MB); el script `quantize_q4.py` permite generar variantes Q4 de precisión mixta |
| Idiomas soportados | Chino (zh) |
| Licencia | MIT |
| Formato de pesos | ONNX (grafo + pesos), para ONNX Runtime y Transformers.js |

## Arquitectura y entrenamiento

El repositorio no contiene ningún proceso de entrenamiento ni de ajuste fino: es una exportación directa del checkpoint BAAI/bge-small-zh-v1.5 a ONNX, con la misma receta de embeddings del modelo original. El autor indica que todas las variantes BGE emiten embeddings por token y que la receta prevista del modelo original es pooling sobre el token CLS más normalización; la integración en EasyEDA que motivó la conversión usa mean pooling, y las pruebas de humo cubren ese comportamiento. Los vectores generados con tamaños small, base y large tienen dimensiones distintas y no deben mezclarse.

El repositorio incluye tres variantes (FP32, FP16 y Q8, esta última con umbral de similitud coseno de 0,98 frente a FP32, mientras que FP32 y FP16 usan umbral de 0,999) y herramientas de reproducibilidad: `build-manifest.json` con la revisión de origen, versiones de paquetes y sumas SHA-256; `export_models.py`, que espera los checkpoints originales en `sources/<nombre-modelo>` y escribe en `repos/<nombre-modelo>-ONNX`; `quantize_q4.py` para variantes Q4 de precisión mixta; y los scripts e informes de validación. La validación de FP16 en GPU se realizó con Transformers.js 4.0.1 y ONNX Runtime Node 1.24.3 con WebGPU nativo sobre una RTX 5080 Laptop GPU. Las ejecuciones nativas con WebGPU produjeron los vectores probados y completaron `dispose()`, pero el proceso de Node devolvió código de salida 1 durante el apagado sin diagnóstico; las comprobaciones de salida pasaron y el cierre del proceso queda sin resolver.

## Capacidades

- Generación de embeddings de texto en chino para recuperación semántica y similitud entre frases.
- Extracción de características a nivel de token, con pooling configurable (CLS según la receta original, mean pooling en el caso de uso EasyEDA) y normalización.
- Búsqueda semántica sobre documentos: indexación de vectores y consulta por similitud coseno.
- Inferencia en el navegador mediante WebGPU (`device: 'webgpu'`, `dtype: 'fp16'`) o en CPU de navegador mediante WASM (`device: 'wasm'`, `dtype: 'q8'`).
- Inferencia en Node en CPU (`device: 'cpu'`) y en Node con WebGPU nativo (probado sobre ONNX Runtime Node 1.24.3).
- Uso offline: el autor recomienda descargar el repositorio completo e importarlo localmente, conservando `onnx/model.onnx_data` junto a `onnx/model.onnx`.
- Capacidad de clasificación, clustering, deduplicación y filtrado por similitud derivada de los vectores (tarea indirecta, no incluida en el modelo).
- No dispone de generación de texto, tool calling, function calling, razonamiento multi-paso, capacidades de agente, visión ni audio.
- Cobertura multilingüe: únicamente chino.

## Casos de uso

- Busqueda semantica en documentacion tecnica en chino: se indexan los fragmentos con las variantes FP16 o Q8 y se consulta por similitud coseno, lo que permite encontrar pasajes relevantes aunque la consulta no comparta términos literales con el documento.
- Recuperacion aumentada en pipelines RAG: el modelo actúa como retriever sobre una base de conocimiento en chino; su tamaño (47,5 MB en FP16) permite ejecutarlo junto al generador sin competir por VRAM y reduce la latencia total del pipeline.
- Deduplicacion de tickets o incidencias: se calcula el embedding de cada entrada y se agrupan por umbral de similitud para fusionar casos repetidos antes de asignarlos a soporte.
- Clasificacion por similitud sin entrenamiento: se construyen prototipos con frases representativas de cada categoría y se etiquetan entradas nuevas por vecindad, útil cuando no hay datos etiquetados suficientes.
- Cache semantica de consultas: se almacenan los embeddings de preguntas previas y se reutiliza la respuesta cuando la nueva consulta supera un umbral de similitud, con el consiguiente ahorro de llamadas a un modelo generativo.
- Extensiones y aplicaciones web con inferencia local: al cargarse con Transformers.js, permite búsqueda semántica en el navegador sin enviar el texto del usuario a un servidor, lo que simplifica el cumplimiento de requisitos de privacidad.
- Moderacion y filtrado de contenido: los embeddings permiten detectar mensajes próximos a patrones conocidos de spam o abuso mediante similitud con un conjunto de referencia.
- Recomendacion de contenido relacionado: en sitios en chino, el embedding del artículo o producto consultado sirve para recuperar los más próximos dentro del mismo corpus vectorial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible (no hay MMLU, HumanEval, GSM8K, MTEB ni métricas de recuperación). El autor únicamente documenta una comprobación numérica de fidelidad entre variantes, medida como similitud coseno mínima frente a FP32 sobre seis entradas en chino de distinta longitud, y advierte explícitamente que es una prueba de humo numérica y no un benchmark de precisión o recuperación. Los informes incluyen además error absoluto máximo y, para generación, acuerdo en el siguiente token; el propio autor señala que la similitud de salida no establece corrección factual.

| Variante | Tamano de grafo + pesos | Cosimilitud minima frente a FP32 | Umbral aplicado |
|---|---|---|---|
| FP32 | 94,8 MB | 1,000000 | 0,999 |
| FP16 | 47,5 MB | 1,000000 | 0,999 |
| Q8 | 57,2 MB | 0,988265 | 0,98 |

## Requisitos de hardware

- Inferencia en CPU: viable en cualquier equipo, con artefactos de 47,5 MB (FP16) a 94,8 MB (FP32); no requiere GPU.
- GPU de consumo: cabe holgadamente en cualquier GPU de consumo; el autor validó FP16 con WebGPU en una RTX 5080 Laptop GPU.
- Navegador: WebGPU con `dtype: 'fp16'` o WASM con `dtype: 'q8'` para CPU del navegador.
- Node: `device: 'cpu'` para CPU y WebGPU nativo con ONNX Runtime Node 1.24.3 (probado con Transformers.js 4.0.1).
- VRAM estimada: no disponible; por el tamaño de los artefactos (menos de 100 MB), el peso del modelo es despreciable frente al consumo del propio runtime.
- El runtime de navegador de EasyEDA no fue probado directamente por el autor.
- Opciones de despliegue documentadas: Transformers.js (`@huggingface/transformers`) y ONNX Runtime. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.
- Nota operativa: un cliente online que fije `q8` no podrá cargar un repositorio que no incluya esa variante; en EasyEDA debe seleccionarse el `dtype` de forma explícita.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| JasonYANG170/bge-small-zh-v1.5-ONNX (este modelo) | No disponible (FP32 de 94,8 MB) | No disponible | ONNX (FP32, FP16, Q8) | MIT | HuggingFace, 0 descargas y 0 likes |
| BAAI/bge-small-zh-v1.5 (modelo base) | No disponible | No disponible | Pesos originales del modelo base | MIT | HuggingFace |
| BAAI/bge-base-zh-v1.5 | No disponible | No disponible | No disponible | MIT (familia BGE v1.5) | HuggingFace |
| BAAI/bge-large-zh-v1.5 | No disponible | No disponible | No disponible | MIT (familia BGE v1.5) | HuggingFace |

La ficha del autor solo aporta una comparación cualitativa dentro de la familia: los vectores de los tamaños small, base y large tienen dimensiones distintas y no pueden mezclarse en un mismo índice. No se dispone de métricas comparativas de rendimiento entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo generativo: solo produce embeddings, por lo que no admite tool calling, agentes ni razonamiento multi-paso.
- Modelo monolingüe en chino; no se declara soporte para castellano ni otros idiomas.
- Conversión sin ajuste fino: cualquier limitación de sesgo o dominio del modelo base BAAI/bge-small-zh-v1.5 se hereda sin cambios.
- Riesgo de alucinación: no aplica a la generación, pero una similitud coseno alta entre vectores no garantiza relevancia factual ni corrección del documento recuperado, tal como advierte el autor.
- La cuantización Q8 introduce desviación numérica (cosimilitud mínima de 0,988265 frente a FP32 sobre seis entradas); las variantes cuantizadas requieren validación propia antes de usarse en producción.
- Cambiar el tamaño del modelo, la precisión o el tipo de pooling obliga a reconstruir todos los vectores del documento; mezclar dimensiones de small, base y large rompe el índice.
- Problema conocido: en ejecuciones nativas con WebGPU, el proceso de Node devuelve código de salida 1 durante el apagado sin diagnóstico, aunque los resultados de inferencia son correctos. El cierre del proceso queda sin resolver.
- Uso offline: es necesario descargar el repositorio completo y conservar `onnx/model.onnx_data` junto a `onnx/model.onnx`.
- Restricciones de licencia: MIT, uso comercial permitido manteniendo el aviso de licencia; los pesos conservan la licencia upstream (MIT) y la conversión no la modifica. El autor remite a la documentación y al fichero LICENSE originales.
- Adopción nula: 0 descargas y 0 likes, sin validación externa de la comunidad; el repositorio figura creado y actualizado el 2026-09-14.
- La información disponible no especifica longitud de contexto, dimensión de embedding ni número de parámetros exacto de esta conversión.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/JasonYANG170/bge-small-zh-v1.5-ONNX
- Modelo base BAAI/bge-small-zh-v1.5: https://huggingface.co/BAAI/bge-small-zh-v1.5
- Revisión concreta del modelo base: https://huggingface.co/BAAI/bge-small-zh-v1.5/tree/7999e1d3359715c523056ef9478215996d62a620
- Documentación original del modelo base: fichero `UPSTREAM_README.md` incluido en el repositorio de la conversión
- Metadatos de reproducibilidad: fichero `build-manifest.json` del repositorio
- La búsqueda web realizada no devolvió resultados relevantes para este modelo: los enlaces recuperados corresponden a foros de soporte de Microsoft y no guardan relación con la ficha.
