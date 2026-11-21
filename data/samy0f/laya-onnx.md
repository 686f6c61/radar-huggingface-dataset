# Samy0f/laya-onnx

## Resumen

Laya-onnx es una exportación a formato ONNX del checkpoint en inglés de convaiinnovations/laya, un modelo orientado a tareas de reranking. El trabajo de conversión lo publica el usuario Samy0f y no introduce cambios en los pesos: se limita a dividir el modelo original en dos grafos, `encoder.onnx` y `head.onnx`, replicando la estructura que espera la librería `laya-ts` para cargarlo. Todo el mérito del modelo subyacente corresponde a sus autores originales.

La relevancia de esta ficha es práctica: permite ejecutar el modelo en entornos donde no hay soporte nativo de PyTorch o safetensors, como aplicaciones TypeScript o Node.js, y además el autor ha parcheado los grafos para que funcionen con el proveedor DirectML de onnxruntime, lo que abre la puerta a inferencia en GPU sobre Windows sin CUDA. El repositorio pesa 1,7 GB, coherente con un encoder de unos 1.579 millones de bytes de pesos más una cabeza de 106 MB.

Se trata, por tanto, de un artefacto de despliegue más que de un modelo nuevo. No se dispone de información sobre arquitectura interna, número de parámetros, longitud de contexto ni datos de entrenamiento en la documentación proporcionada, por lo que esos apartados se marcan como no disponibles. La licencia Apache 2.0 se hereda del modelo original.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base orientado a reranking; exportado como encoder + head) |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (los pesos se distribuyen en float, sin variantes cuantizadas en el repo) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | ONNX (`encoder.onnx` + `encoder.onnx.data`, `head.onnx` + `head.onnx.data`) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo base convaiinnovations/laya en la documentación proporcionada. Lo único verificable es la estructura de la exportación: un grafo `encoder.onnx` de 3,4 MB (más 1,58 GB de pesos externos) y un grafo `head.onnx` de 298 KB (más 106 MB de pesos externos), acompañados de `tokenizer.json` (3,6 MB) y `rl_agent_config.json` (745 bytes). La presencia de este último fichero sugiere que el modelo original incorpora algún componente de agente o política entrenada con refuerzo, pero no hay detalles disponibles sobre el proceso.

El único cambio técnico documentado respecto al original es la conversión a ONNX mediante `laya-ts/scripts/export_onnx.py --repo convaiinnovations/laya`, seguida de un parche sobre los dos grafos pequeños: el exportador de PyTorch escribe cada reshape con `allowzero=1`, flag que el proveedor DirectML de onnxruntime rechaza, por lo que se limpió en aquellos `Reshape` cuya forma objetivo no puede contener un cero literal. Según el autor, esto no altera la salida para entradas no vacías. Los ficheros `.onnx.data` no se modificaron. No hay información sobre tokens de entrenamiento, composición del dataset ni uso de RLHF o DPO.

## Capacidades

- Reranking de documentos o pasajes: es la tarea declarada del modelo base y la razón de ser de la exportación.
- Ejecución en TypeScript/Node.js mediante la librería `laya-ts`, con carga vía `Agent.load` y enrutado mediante `Router`.
- Selección de dispositivo en inferencia: `cpu`, `dml` (DirectML) o `cuda`, según indica la model card.
- Soporte de tokenización incluido en el repo (`tokenizer.json`), lo que permite usar el modelo sin depender del tokenizador del framework original.
- Idioma: únicamente inglés.
- No hay información disponible sobre tool calling, function calling, razonamiento multi-paso, agentes autónomos, visión, audio ni modos de pensamiento extendido.

## Casos de uso

- Reranking en pipelines de búsqueda web o RAG en aplicaciones TypeScript: el modelo se integra directamente en un backend Node.js mediante `laya-ts`, reordenando los candidatos recuperados por un retriever vectorial antes de pasarlos al generador. Es adecuado porque evita introducir una dependencia de Python en la pila.
- Búsqueda semántica en escritorio Windows sin CUDA: gracias al parche para DirectML, se puede ejecutar el encoder en GPU mediante onnxruntime con el proveedor `dml`, útil en equipos con gráficas integradas o AMD que no disponen de CUDA.
- Filtrado y priorización de resultados en herramientas internas de documentación: un reranker en inglés permite ordenar fragmentos de manuales técnicos o bases de conocimiento antes de mostrarlos al usuario.
- Evaluación de relevancia en sistemas de preguntas y respuestas sobre corpus en inglés: el modelo puntúa pares consulta-pasaje para descartar respuestas poco relacionadas antes de la generación.
- Despliegue en entornos con restricciones de dependencias: al ser ONNX puro, se puede servir con onnxruntime en contenedores ligeros, sin PyTorch ni transformers, reduciendo el tamaño de la imagen.
- Prototipado e investigación sobre reranking en el ecosistema JS: permite experimentar con el modelo desde notebooks o scripts de Node sin cambiar de lenguaje, útil para equipos de frontend que quieran validar la calidad del reranking antes de invertir en infraestructura Python.
- Integración en aplicaciones de escritorio Electron: la combinación de ONNX, DirectML y `laya-ts` permite empaquetar el reranker dentro de una app de escritorio con inferencia local.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión, pero los pesos suman aproximadamente 1,58 GB (encoder) más 106 MB (head), es decir, en torno a 1,7 GB en float32; en la práctica se necesita algo más de memoria para activaciones y buffers de onnxruntime.
- GPU recomendadas: no disponibles. El autor menciona los proveedores `cpu`, `dml` y `cuda`, pero no especifica modelos de GPU ni requisitos mínimos.
- ¿Cabe en GPU de consumo? Por tamaño de pesos, sí es plausible en tarjetas con 4 GB o más de VRAM, pero no hay confirmación oficial ni mediciones publicadas.
- Opciones de despliegue: onnxruntime con proveedor CPU, DirectML o CUDA; la vía documentada es la librería `laya-ts` en TypeScript. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que además no aplican a un reranker ONNX.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de rendimiento ni características de otros rerankers que permitan una comparación rigurosa.

## Limitaciones y advertencias

- Solo soporta inglés; no hay evidencia de capacidades multilingües.
- Es un artefacto de conversión, no un modelo entrenado por el autor del repo: cualquier problema de calidad del modelo base se hereda sin cambios.
- El parche de DirectML modifica los grafos ONNX; aunque el autor afirma que no altera la salida, conviene validar los resultados frente al modelo original antes de usarlo en producción.
- No hay información sobre sesgos, tasa de alucinación ni robustez frente a dominios especializados.
- No se han publicado benchmarks ni evaluaciones independientes en la información disponible.
- La licencia es Apache 2.0, lo que permite uso comercial, pero conviene revisar también las condiciones del modelo base convaiinnovations/laya por si añaden restricciones adicionales.
- El repositorio tiene 0 descargas y 1 like en el momento de la consulta, por lo que no hay señal de validación por parte de la comunidad.
- Al ser un reranker, no genera texto libre; usarlo como modelo generativo no es su propósito.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Samy0f/laya-onnx
- Modelo base: https://huggingface.co/convaiinnovations/laya
- Librería de carga (`laya-ts`): no disponible como enlace directo en la información proporcionada
- Paper, blog o demo: no disponibles
