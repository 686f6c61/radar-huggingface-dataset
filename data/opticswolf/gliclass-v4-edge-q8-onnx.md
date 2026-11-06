# opticsWolf/gliclass-v4-edge-q8-onnx

## Resumen

gliclass-v4-edge-q8-onnx es una compilación cuantizada en int8 del modelo knowledgator/gliclass-v4-edge, un modelo de decisión (decision-model) orientado a tareas de reranking y clasificación zero-shot. Lo publica el usuario opticsWolf en Hugging Face y su base es el checkpoint GLiClass v4-edge de Knowledgator, construido sobre una arquitectura DeBERTa-v3 con enfoque "labels-first". El resultado se distribuye en formato ONNX para ejecución con onnxruntime, lo que facilita el despliegue en entornos de producción sin depender de PyTorch.

La relevancia de esta ficha radica en que ofrece una variante ligera y portable de un modelo de clasificación/reranking: la cuantización weight-only int8 con MatMulNBits (8 bits, bloque de 128, asimétrica, escalas fp32) reduce el peso del repositorio a 0,9 GB y permite inferencia acelerada en CPU y GPU mediante ONNX Runtime. El autor reporta una paridad de 0,0899 en el peor caso y 0 flips respecto al modelo original en una validación de 6 casos dorados.

No obstante, la información publicada es muy escasa: no se detallan parámetros totales, longitud de contexto, idiomas soportados ni resultados de benchmarks. Esta ficha recoge lo disponible y marca explícitamente como "no disponible" todo aquello que la model card no especifica.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | DeBERTa-v3 (modelo de decisión/reranking, enfoque labels-first) |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | int8 weight-only (MatMulNBits, bits=8, bloque 128, asimétrica, escalas fp32); cabeza excluida de la cuantización |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (onnxruntime) |
| Modelo base | knowledgator/gliclass-v4-edge |
| Tamaño del repositorio | 0,9 GB |
| Librería | onnxruntime |

## Arquitectura y entrenamiento

El modelo subyacente es GLiClass v4-edge, basado en DeBERTa-v3 y diseñado como decision-model con enfoque labels-first, es decir, orientado a evaluar etiquetas o candidatos de forma eficiente para tareas de clasificación y reranking. La variante publicada por opticsWolf no reentrena el modelo: aplica una cuantización weight-only int8 sobre los pesos mediante el operador MatMulNBits de ONNX Runtime, con 8 bits, bloque de 128 y esquema asimétrico con escalas en fp32. La cabeza del modelo queda excluida de la cuantización, presumiblemente para preservar la precisión de la salida de decisión.

El autor reporta una validación de paridad frente al checkpoint original: un peor caso de 0,0899 de diferencia y 0 flips, con 6 de 6 casos dorados coincidentes. No se especifican en la información disponible los datos de entrenamiento del modelo base (número de tokens, composición del dataset, uso de RLHF/DPO) ni innovaciones técnicas adicionales más allá de la propia cuantización.

## Capacidades

- Reranking de candidatos: evalúa y ordena pares o listas de etiquetas/documentos según relevancia, gracias a su naturaleza de decision-model.
- Clasificación zero-shot con enfoque labels-first: permite definir etiquetas en tiempo de inferencia sin reentrenamiento.
- Modelo de decisión ligero: adecuado para tareas de filtrado y puntuación binaria o multietiqueta.
- Ejecución portable vía ONNX Runtime: compatible con despliegues en CPU y GPU sin dependencia de PyTorch.
- Cuantización int8: reduce el tamaño y acelera la inferencia en hardware modesto.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (los idiomas no están especificados).
- Capacidades especiales (thinking mode, visión, audio): no disponible.

## Casos de uso

- Reranking en pipelines RAG: el modelo puede reordenar los documentos recuperados por un buscador vectorial antes de pasarlos al generador, mejorando la precisión de las respuestas. Su formato ONNX permite integrarlo como paso intermedio en servicios de recuperación sin sobrecarga de PyTorch.
- Clasificación zero-shot de tickets de soporte: definir categorías en tiempo de inferencia (facturación, incidencia técnica, cancelación) y puntuar cada mensaje con el modelo labels-first, sin necesidad de datos etiquetados para cada nueva categoría.
- Filtrado de contenido y moderación: usar el modelo como decision-model para puntuar si un texto cumple una política definida mediante etiquetas, con despliegue en CPU gracias a la cuantización int8.
- Enrutamiento de consultas en asistentes conversacionales: clasificar la intención del usuario para dirigir la petición al agente o herramienta adecuada, aprovechando la baja latencia esperada de un modelo edge cuantizado.
- Deduplicación y agrupación semántica: puntuar pares de textos para decidir si son equivalentes o pertenecen a la misma categoría, útil en tareas de limpieza de datasets y catálogos.
- Despliegue en entornos con recursos limitados: al distribuirse como ONNX int8 de 0,9 GB, puede ejecutarse en servidores sin GPU o en dispositivos edge donde un transformer completo en fp32 no cabría con holgura.
- Evaluación de relevancia en motores de búsqueda internos: integrar el modelo como etapa de scoring para reordenar resultados de búsqueda corporativa con etiquetas de negocio personalizadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El único dato de rendimiento reportado por el autor es la paridad de cuantización frente al modelo base: peor diferencia de 0,0899, 0 flips y 6/6 casos dorados coincidentes. No se proporcionan métricas de latencia ni throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma exacta; el repositorio ocupa 0,9 GB en int8, por lo que la huella en memoria es del orden de 1 GB o inferior, dependiendo de la cabeza y de los buffers de ejecución.
- GPU recomendadas: no especificadas por el autor. Por tamaño, cualquier GPU con al menos 2 GB de VRAM libre debería poder alojarlo; tarjetas como RTX 3060, RTX 4090, A100 o H100 son compatibles con ONNX Runtime, aunque no hay datos de rendimiento publicados.
- Cabe en GPU consumer: sí, previsiblemente en cualquier GPU consumer moderna con 2 GB o más de VRAM, dado el tamaño del artefacto.
- Opciones de despliegue: ONNX Runtime (librería declarada), con posibilidad de usar los execution providers de CPU, CUDA o TensorRT que ofrece ONNX Runtime. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este formato.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Formato | Cuantización | Licencia | Contexto | Notas |
|---|---|---|---|---|---|---|
| opticsWolf/gliclass-v4-edge-q8-onnx | DeBERTa-v3 (decision-model) | ONNX | int8 weight-only | Apache-2.0 | no disponible | Variante cuantizada para onnxruntime |
| knowledgator/gliclass-v4-edge | DeBERTa-v3 (decision-model) | no disponible | fp32 (presumiblemente) | Apache-2.0 | no disponible | Modelo base sin cuantizar |
| Alternativas de reranking de la familia GLiClass | DeBERTa-v3 | safetensors / ONNX | variable | Apache-2.0 | no disponible | No se dispone de datos comparativos en la información proporcionada |

No se dispone de datos de benchmarks ni de especificaciones detalladas de alternativas en la información proporcionada, por lo que la comparación cuantitativa no es posible.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la model card; al ser una variante de un modelo base sin información sobre su dataset de entrenamiento, no es posible evaluar sesgos.
- Riesgo de alucinación: tratándose de un decision-model de clasificación/reranking, el riesgo se manifiesta como falsos positivos o negativos en la puntuación, no como generación de texto libre.
- Limitaciones de contexto e idioma: no se especifican ni la longitud máxima de contexto ni los idiomas soportados, lo que impide garantizar su comportamiento en textos largos o en castellano.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero conviene verificar que el modelo base mantiene la misma licencia y que la cuantización no introduce obligaciones adicionales.
- Paridad limitada: la validación de cuantización se basa en solo 6 casos dorados; el peor caso de 0,0899 indica que pueden existir diferencias de puntuación frente al modelo original en entradas no cubiertas por esa muestra.
- Advertencia de producción: al no haber benchmarks ni métricas de latencia publicadas, es recomendable realizar una evaluación propia antes de desplegarlo en un sistema crítico.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/opticsWolf/gliclass-v4-edge-q8-onnx
- Modelo base: https://huggingface.co/knowledgator/gliclass-v4-edge
- Repositorio de Knowledgator (organización): https://huggingface.co/knowledgator
- Documentación de ONNX Runtime: https://onnxruntime.ai/
