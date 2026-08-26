# justinchuby/onnx-genai-example-esm2-t6-8m

## Resumen

El paquete `justinchuby/onnx-genai-example-esm2-t6-8m` es un artefacto ONNX de pesos reales generado por la herramienta Mobius a partir del modelo de lenguaje de proteínas `facebook/esm2_t6_8M_UR50D`, en una revisión inmutable específica. No se trata de un modelo nuevo entrenado, sino de una conversión del checkpoint original a formato ONNX para su ejecución con ONNX Runtime GenAI, incluyendo los metadatos de inferencia canónicos, el tokenizador/procesador completo y evidencia de ejecución real (`request.json`, `output.json`, `performance.json`).

El modelo original, ESM-2 (Evolutionary Scale Modeling), es un transformer de 8 millones de parámetros con 6 capas, entrenado sobre secuencias de proteínas de UniRef50. Está diseñado para producir embeddings de secuencias de proteínas y servir de base para tareas de biología computacional como predicción de estructura, anotación funcional o búsqueda de homólogos. La conversión a ONNX facilita el despliegue en producción con el runtime de ONNX, que soporta inferencia en CPU y GPU con optimizaciones específicas.

La relevancia de este paquete reside en que demuestra el flujo completo de conversión de un modelo de proteínas a ONNX, con metadatos de inferencia hashless, prueba de carga con ONNX Runtime y métricas de rendimiento preservadas. Es útil como referencia técnica para integrar modelos de embeddings de proteínas en pipelines de inferencia ONNX, especialmente en entornos donde se requiere compatibilidad con el ecosistema de ONNX Runtime GenAI.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (ESM2), 6 capas, embeddings de 320 dimensiones |
| Parámetros totales | 8 millones (8M) |
| Parámetros activos | No disponible (modelo denso, no MoE) |
| Longitud de contexto | No disponible (no se indica en la información; el modelo original de ESM2 soporta hasta 1024 residuos, pero no se especifica en este paquete) |
| Tipos de cuantización | No disponible (solo se menciona ONNX con pesos de datos externos) |
| Idiomas soportados | No aplicable (modelo de proteínas, no de lenguaje humano) |
| Licencia | MIT (tanto la fuente como el paquete) |
| Formato de pesos | ONNX con datos externos (external-data weights) |

## Arquitectura y entrenamiento

El modelo subyacente, `facebook/esm2_t6_8M_UR50D`, es un transformer de 6 capas con 8 millones de parámetros entrenado sobre UniRef50 (UR50D), un conjunto de secuencias de proteínas agrupadas por similitud. ESM2 es una evolución de ESM1 y se entrena con un objetivo de modelado de lenguaje enmascarado (masked language modeling) sobre secuencias de aminoácidos. No se han publicado detalles sobre el proceso de entrenamiento del paquete ONNX en sí, ya que este es una conversión del modelo original y no un entrenamiento nuevo.

El paquete incluye el grafo ONNX completo, los pesos en formato de datos externos, el tokenizador/procesador para secuencias de proteínas, y un conjunto de metadatos de inferencia (`inference_metadata.yaml`) que describen las entradas y salidas del modelo. La salida observada en la prueba de ejecución es una norma de embedding de `7.5770978927612305`, lo que confirma que el modelo produce embeddings de secuencias de proteínas.

## Capacidades

- Generación de embeddings de secuencias de proteínas: el modelo transforma una secuencia de aminoácidos en un vector denso de 8 dimensiones, adecuado para tareas de aprendizaje automático posteriores (clasificación, clustering, búsqueda de similitud).
- Inferencia ONNX optimizada: al estar empaquetado en formato ONNX, puede ejecutarse con ONNX Runtime GenAI, que ofrece optimizaciones para CPU y aceleradores.
- Carga y verificación de ejecución: el paquete incluye `request.json`, `output.json` y `performance.json` que documentan una ejecución real de prueba, útil para validar la integración.
- Compatibilidad con el ecosistema de ONNX Runtime: se puede cargar con `onnxruntime.InferenceSession` (probado con `CPUExecutionProvider`) y es compatible con las herramientas de profiling de ONNX GenAI (`ONNX_GENAI_TRACE`, `ONNX_GENAI_PROFILE`).
- No soporta generación de texto, tool calling, agentes ni capacidades multimodales: es un modelo de embeddings de proteínas, no un modelo generativo de lenguaje.

## Casos de uso

- Anotación funcional de proteínas: el embedding de 8 dimensiones puede alimentar clasificadores para predecir funciones de proteínas (enzimas, transportadores, etc.) a partir de secuencias.
- Búsqueda de similitud de secuencias: los embeddings permiten construir índices vectoriales (por ejemplo, con FAISS) para recuperar proteínas homólogas de una base de datos, acelerando la búsqueda de homilité.
- Predicción de estructura de proteínas: como representación intermedia, los embeddings pueden combinarse con redes posteriores para tareas como predicción de estructura secundaria o de contacto.
- Pipeline de filtrado de secuencias: en un entorno de producción, el modelo ONNX puede ejecutarse en CPU para filtrar o clasificar grandes volúmenes de secuencias de proteínas con baja latencia.
- Referencia para desarrollo de paquetes ONNX: sirve como ejemplo de cómo empaquetar un modelo de proteínas con metadatos de inferencia y evidencia de ejecución, útil para equipos que quieran replicar el flujo con otros modelos.
- Integración con ONNX Runtime GenAI: el paquete puede usarse como punto de partida para probar el runtime GenAI de ONNX en tareas de embeddings, aunque no es un modelo generativo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La única métrica observada es la norma del embedding de salida (`7.5770975407612305`) durante una ejecución de prueba, pero no se comparan con otros modelos ni se reportan métricas de precisión en tareas de biología. El paquete incluye `performance.json`, que probablemente contiene tiempos de inferencia, pero no se detallan en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible, pero por el tamaño del modelo (8M parámetros), la memoria necesaria es mínima; cabe en cualquier GPU moderna y también en CPU.
- GPU recomendadas: no se indican; con 8M parámetros, puede ejecutarse en cualquier GPU con al menos 1-2 GB de VRAM, aunque también es viable en CPU.
- Compatibilidad con GPU de consumo: sí, es ejecutable en GPUs de consumo (por ejemplo, RTX 3060, RTX 4090) y en CPU sin problemas de memoria.
- Opciones de despliegue: el paquete está diseñado para ONNX Runtime; se puede desplegar con `onnxruntime.InferenceSession` (CPU o CUDA) o con el runtime GenAI de ONNX (prototipo en GitHub).
- Latencia y throughput: no disponible; se puede estimar que, al ser un modelo pequeño, la inferencia es de pocos milisegundos por secuencia en CPU, pero no hay datos oficiales.

## Comparativa con modelos similares

| Modelo | Parámetros | Arquitectura | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `facebook/esm2_t6_8M_UR50D` | 8M | Transformer (6 capas) | No especificado en este paquete | MIT | Hugging Face, pesos PyTorch |
| `facebook/esm2_t12_35M_UR50D` | 35M | Transformer (12 capas) | No especificado | MIT | Hugging Face, pesos PyTorch |
| `facebook/esm2_t33_650M_UR50D` | 650M | Transformer (33 capas) | No especificado | MIT | Hugging Face, pesos PyTorch |

La comparación es limitada porque el paquete es una conversión ONNX del modelo de 8M, no un modelo independiente. Las alternativas de mayor tamaño (35M, 650M) ofrecen representaciones de mayor calidad pero con mayor coste computacional. No se han publicado benchmarks comparativos en la información proporcionada.

## Limitaciones y advertencias

- Modelo de embeddings, no generativo: no puede generar texto ni secuencias nuevas; solo produce vectores de representación.
- Tamaño reducido: con 8M parámetros, la calidad de los embeddings es inferior a la de modelos ESM2 más grandes (35M, 150M, 650M, 3B), lo que limita su rendimiento en tareas complejas.
- Contexto de secuencia: no se especifica la longitud máxima de secuencia soportada en este paquete; el modelo original de ESM2 soporta hasta 1024 residuos, pero no se confirma en la información.
- Sesgo de datos: el modelo se entrena con UniRef50, que puede tener sesgos hacia proteínas de organismos más estudiados (por ejemplo, humanos, ratón), lo que puede afectar a la representación de proteínas de organismos menos representados.
- Riesgo de alucinación: no aplica, ya que no es un modelo generativo de texto.
- Restricciones de licencia: la licencia MIT permite uso comercial y modificación, pero se debe verificar la licencia del modelo fuente (`facebook/esm2_t6_8M_UR50D`), que también es MIT según la model card del paquete.
- Para producción: es un paquete de ejemplo y prototipo; se recomienda validar la calidad de las embeddings en el dominio específico antes de desplegarlo en aplicaciones críticas.

## Enlaces

- Hugging Face: [justinchuby/onnx-genai-example-esm2-t6-8m](https://huggingface.co/justinchuby/onnx-genai-example-esm2-t6-8m)
- Modelo original: [facebook/esm2_t6_8M_UR50D](https://huggingface.co/facebook/esm2_t6_8M_UR50D)
- Repositorio de la herramienta de conversión: [justinchuby/onnx-genai (GitHub)](https://github.com/justinchuby/onnx-genai)
- Ejemplos de la herramienta: [onnx-genai/examples](https://github.com/justinchuby/onnx-genai/tree/main/examples)
- Colección de ejemplos de metadatos de inferencia: [ONNX GenAI Inference Metadata Examples](https://huggingface.co/collections/justinchuby/onnx-genai-inference-metadata-examples)
- Documentación de ONNX Runtime GenAI (C++): [DeepWiki - C++ Examples](https://deepwiki.com/microsoft/onnxruntime-genai/6.3-c++-examples)
