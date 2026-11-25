# husnainbinmunawar/docfusion-doclaynet-experimental

## Resumen

DocFusion DocLayNet Layout Classifier es un modelo experimental de clasificación de elementos de maquetación documental (layout analysis) desarrollado por el usuario de Hugging Face husnainbinmunawar. Se trata de un clasificador de 11 clases que consume geometría normalizada de cada elemento de una página y características geométricas de vecinos cercanos (nearest-neighbor geometry features) para predecir la clase de layout a la que pertenece dicho elemento. No es un sistema OCR ni un pipeline de extracción documental de producción.

El modelo se ha entrenado a partir de un fragmento (shard) real y anotado manualmente del corpus DocLayNet v1.2, distribuido por DS4SD bajo licencia CDLA-Permissive-1.0. Su relevancia es acotada: se presenta explícitamente como experimental, con cero descargas y cero likes en el momento de la consulta, y con un tamaño de repositorio de 0.0 GB. La información pública disponible es muy limitada: no se documentan parámetros de entrenamiento, composición del dataset, hiperparámetros ni resultados de benchmarks más allá de la mención a un artefacto de evaluación con partición held-out por documento.

La arquitectura concreta no se detalla en la model card; los tags indican PyTorch y safetensors, y el recuento de parámetros en safetensors es de 12.878, lo que sugiere un modelo de muy pequeño tamaño, probablemente una cabeza de clasificación o un clasificador ligero sobre características geométricas. No se especifican longitud de contexto, idiomas soportados ni formatos de cuantización.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (clasificador de layout; tag `docfusion_layout_classifier`) |
| Parametros totales | 12.878 (según safetensors) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | CDLA-Permissive-1.0 |
| Formato de pesos | safetensors (librería PyTorch) |

## Arquitectura y entrenamiento

La model card describe un clasificador de 11 clases que toma como entrada geometría normalizada de elementos y características geométricas de vecinos más cercanos, y predice la clase de layout del elemento. No se especifica si la arquitectura subyacente es un transformer, un MLP, un GNN o un modelo híbrido; el tag `docfusion_layout_classifier` y la librería PyTorch son los únicos indicios técnicos disponibles. El recuento de 12.878 parámetros en safetensors apunta a un modelo muy compacto, coherente con un clasificador sobre features geométricas más que con un modelo fundacional.

En cuanto a datos de entrenamiento, el autor indica que se ha entrenado desde un shard real y anotado manualmente de DocLayNet v1.2. No se detalla el número de tokens, la composición exacta del dataset, ni si hubo RLHF, DPO u otras fases de ajuste. Se menciona la existencia de manifiestos y un artefacto de evaluación con resultados sobre una partición held-out por documento, pero los valores numéricos no se reproducen en la información disponible. Tampoco se documentan innovaciones técnicas como decodificación especulativa o atención lineal.

## Capacidades

- Clasificación de elementos de maquetación documental en 11 clases, a partir de geometría normalizada y features de vecinos cercanos.
- Análisis de layout sobre páginas de documentos, orientado a tareas de estructuración de documentos.
- Entrenado sobre DocLayNet v1.2, un corpus con anotaciones humanas de layout.
- No es un sistema OCR: no extrae texto de imágenes ni PDFs.
- No realiza atribución de autoría documental ni procesamiento legal.
- No se documenta soporte de tool calling, function calling ni agentes.
- No se documentan capacidades multilingües.
- No se documentan modos especiales (thinking mode, visión, audio).

## Casos de uso

- Prototipado de pipelines de análisis de layout: el modelo puede usarse como clasificador de elementos en un experimento de estructuración documental, alimentado con geometría normalizada y features de vecinos, antes de integrarlo en un sistema mayor.
- Investigación sobre DocLayNet: sirve como punto de partida reproducible para comparar clasificadores de layout entrenados sobre shards de DocLayNet v1.2, gracias a los manifiestos y al artefacto de evaluación incluidos.
- Etiquetado asistido de regiones documentales: en un flujo de anotación, el clasificador puede predecir la clase de cada elemento para que un humano la revise, reduciendo el esfuerzo manual en corpus con esquema de 11 clases.
- Detección de estructura en documentos digitalizados: combinado con un motor OCR externo que aporte las cajas de los elementos, el modelo clasificaría cada región (título, párrafo, tabla, etc.) según su geometría y su contexto espacial.
- Evaluación de features geométricas: al consumir únicamente geometría normalizada y vecinos cercanos, es útil para estudiar cuánta señal de layout se puede capturar sin información textual ni visual.
- Docencia y experimentación: por su tamaño reducido (12.878 parámetros) y su licencia permisiva, es adecuado para ejercicios prácticos sobre clasificación de layout y sobre el uso responsable de modelos experimentales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona un artefacto de evaluación con resultados sobre una partición held-out por documento, pero no se reproducen cifras numéricas en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; con 12.878 parámetros, el modelo es extremadamente pequeño y cabría en cualquier GPU consumer, pero no se documentan requisitos oficiales.
- GPU recomendadas: no disponible; por tamaño, cualquier GPU moderna (incluidas RTX 4090, A100, H100) sería sobrada, aunque no hay confirmación del autor.
- Cabe en GPU consumer: previsiblemente sí, dado el recuento de parámetros, aunque no se documenta.
- Opciones de despliegue: no disponible; la librería indicada es PyTorch y los pesos están en safetensors. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de la misma categoría (clasificadores de layout sobre DocLayNet) con parámetros, contexto, rendimiento, licencia y disponibilidad verificables.

## Limitaciones y advertencias

- Modelo explícitamente experimental: el autor lo etiqueta como `experimental` y no lo presenta como apto para producción.
- No es OCR ni un sistema de extracción documental: no debe usarse para extraer texto, atribuir autoría ni procesar documentos legales.
- Entrenado sobre un único shard de DocLayNet v1.2: la cobertura y la generalización a otros dominios documentales no están documentadas.
- Sin datos publicados de benchmarks ni métricas numéricas en la información disponible: no es posible evaluar su calidad de forma objetiva.
- Cero descargas y cero likes en el momento de la consulta: sin validación comunitaria conocida.
- No se documentan sesgos, riesgos de alucinación (no genera texto), limitaciones de idioma ni restricciones adicionales de licencia más allá de CDLA-Permissive-1.0.
- Las imágenes y PDFs de origen no se incluyen en el repositorio del modelo; la procedencia debe consultarse en los manifiestos y en el repositorio de DocLayNet.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/husnainbinmunawar/docfusion-doclaynet-experimental
- Repositorio de DocLayNet (DS4SD): https://github.com/DS4SD/DocLayNet
- Licencia CDLA-Permissive-1.0 de DocLayNet: https://github.com/DS4SD/DocLayNet/blob/main/LICENSE
