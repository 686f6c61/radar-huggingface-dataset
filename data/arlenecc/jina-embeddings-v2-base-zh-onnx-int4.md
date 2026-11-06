# arlenecc/jina-embeddings-v2-base-zh-onnx-int4

## Resumen

`arlenecc/jina-embeddings-v2-base-zh-onnx-int4` es una conversión a ONNX con cuantización INT4 del modelo de embeddings `jina-embeddings-v2-base-zh` de Jina AI, publicada por el usuario arlenecc en Hugging Face. Se trata, por tanto, de una redistribución derivada y no de un modelo entrenado desde cero: el autor original del modelo base es Jina AI y esta versión se limita a exportar los pesos a formato ONNX y a aplicar una cuantización de 4 bits para reducir el tamaño y facilitar la inferencia en entornos con recursos limitados.

El modelo base es un transformer tipo BERT especializado en generar representaciones vectoriales (embeddings) de texto en chino, pensado para tareas de recuperación semántica, búsqueda y similitud entre frases. La versión INT4 ocupa aproximadamente 0,3 GB en el repositorio, lo que la hace atractiva para despliegues en CPU, dispositivos de borde o pipelines de RAG donde el espacio y la latencia importan más que la fidelidad absoluta del embedding.

La relevancia de esta ficha es doble: por un lado, documenta una alternativa ligera para embeddings en chino; por otro, advierte de que la model card del autor es prácticamente vacía (solo declara licencia MIT) y de que no se han publicado métricas de calidad tras la cuantización, por lo que cualquier uso en producción exige una validación propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT (transformer encoder), según el modelo base `jina-embeddings-v2-base-zh`; confirmado por el tag `bert` |
| Parametros totales | no disponible (el modelo base Jina v2 base se sitúa en torno a 137M, pero no se confirma en la información proporcionada) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (el modelo base Jina v2 soporta 8192 tokens, pero no se confirma en la información proporcionada) |
| Tipos de cuantizacion | INT4 (indicado en el nombre del repositorio); no se detalla el esquema exacto (GPTQ, AWQ, RTN, etc.) |
| Idiomas soportados | no disponible (el sufijo `zh` del modelo base sugiere chino, sin confirmación explícita) |
| Licencia | MIT |
| Formato de pesos | ONNX (con tag `custom_code`, lo que implica código de carga personalizado) |

## Arquitectura y entrenamiento

La arquitectura corresponde a un transformer encoder de tipo BERT, heredada del modelo base `jina-embeddings-v2-base-zh` de Jina AI. Este modelo base está diseñado para producir embeddings de frase y de pasaje, con atención bidireccional y un tokenizador adaptado al chino. La versión publicada aquí no aporta información sobre el proceso de entrenamiento original (número de tokens, composición del dataset, uso de RLHF o DPO), y la model card no incluye ningún detalle al respecto.

La innovación técnica de esta publicación concreta es la exportación a ONNX y la cuantización a INT4, que reduce el peso del repositorio a unos 0,3 GB. No se documenta qué herramienta de cuantización se empleó, si se calibró con un conjunto representativo, ni qué degradación de calidad introduce frente al modelo en FP32. El tag `custom_code` indica que la carga del modelo requiere código propio del autor, lo que añade un riesgo operativo adicional para quien lo integre.

## Capacidades

- Generación de embeddings de texto para similitud semántica y recuperación densa.
- Codificación de frases y pasajes en un espacio vectorial común, apto para búsqueda por vecino más cercano.
- Soporte esperado de chino, derivado del sufijo `zh` del modelo base; no confirmado explícitamente.
- Ejecución en ONNX Runtime, lo que permite inferencia en CPU y en entornos sin GPU.
- Modelo de solo codificación: no genera texto, no hace tool calling ni razonamiento multi-paso.
- No se documentan capacidades de visión, audio ni modo de pensamiento.

## Casos de uso

- Búsqueda semántica en corpus chinos: indexar documentos con este modelo y recuperar pasajes por similitud coseno; la cuantización INT4 reduce el coste de almacenamiento de vectores y acelera la inferencia en CPU.
- RAG ligero en local: integrar el modelo en un pipeline de recuperación sobre ONNX Runtime para asistentes que deban funcionar sin GPU, aceptando la pérdida de precisión que introduce la cuantización.
- Deduplicación y clustering de textos: calcular embeddings de grandes lotes de documentos y agrupar por distancia para detectar duplicados o temas recurrentes.
- Filtrado de contenido en el borde: desplegar el modelo en dispositivos con poca memoria para clasificar similitud entre consultas y plantillas predefinidas.
- Enrutamiento de consultas: usar los embeddings para decidir a qué índice o servicio derivar una petición según su similitud con prototipos.
- Evaluación comparativa de cuantizaciones: servir como referencia INT4 frente al modelo original para medir la degradación de recall en tareas de recuperación propias.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible con precisión; el repositorio ocupa 0,3 GB, por lo que la inferencia en INT4 debería caber holgadamente en GPUs de 4 GB o menos, y en CPU.
- GPU recomendadas: no se especifican; cualquier GPU con soporte de ONNX Runtime (por ejemplo, RTX 3060 en adelante) sería suficiente por tamaño, aunque no hay datos de throughput.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU con al menos 2-4 GB de memoria, dado el tamaño del artefacto.
- Opciones de despliegue: ONNX Runtime (CPU o GPU); no se confirma compatibilidad con vLLM, llama.cpp, Ollama ni TGI, que no están orientados a este tipo de encoder.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| arlenecc/jina-embeddings-v2-base-zh-onnx-int4 | no disponible | no disponible | ONNX INT4 | MIT | Conversión comunitaria, sin benchmarks publicados |
| jina-embeddings-v2-base-zh (original) | no disponible en esta ficha | no disponible en esta ficha | safetensors/PyTorch | no disponible en esta ficha | Modelo base de Jina AI; referencia de calidad |
| Otros embeddings BERT multilingües | no disponible | no disponible | varios | varios | No se dispone de datos comparativos en la información proporcionada |

## Limitaciones y advertencias

- La model card del autor no contiene más que la línea de licencia; no hay documentación de uso, calibración ni evaluación.
- La cuantización INT4 puede degradar la calidad de los embeddings; no se han publicado métricas de recall o correlación frente al modelo original.
- El tag `custom_code` implica que la carga requiere código del autor, con el riesgo de seguridad y mantenimiento que ello conlleva.
- No se confirman los idiomas soportados ni la longitud de contexto efectiva; asumir chino y contexto largo sin verificación es arriesgado.
- Riesgo de sesgos heredados del corpus de entrenamiento original de Jina AI, no documentados en esta publicación.
- Riesgo de alucinación no aplica directamente (es un encoder), pero sí de recuperaciones incorrectas por pérdida de precisión.
- La licencia MIT permite uso comercial, pero conviene verificar la licencia del modelo base original de Jina AI antes de redistribuir o desplegar.
- El repositorio tiene muy pocas descargas (16) y ningún like, lo que sugiere escasa validación por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/arlenecc/jina-embeddings-v2-base-zh-onnx-int4
- Modelo base de referencia (Jina AI): no disponible en la información proporcionada.
- Paper, blog o repositorio del autor: no disponible en la información proporcionada.
