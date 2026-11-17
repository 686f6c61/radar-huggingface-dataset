# kanippa/llm2026-r1-ruri-reranker-310m

## Resumen

kanippa/llm2026-r1-ruri-reranker-310m es un modelo de reranking (clasificación de pares consulta-documento) en japonés, obtenido mediante un ajuste fino con LoRA fusionado sobre cl-nagoya/ruri-v3-reranker-310m, un encoder ModernBERT de 310M de parámetros. Lo desarrolla el usuario kanippa y se publica bajo licencia Apache 2.0. El modelo resuelve la segunda fase de un pipeline de recuperación de información (RAG): reordenar los candidatos devueltos por un retriever para mejorar la precisión final.

La variante `R1` corresponde al ciclo 2 de un proceso iterativo de ajuste, según indica la model card. El ajuste se realizó sobre tres fuentes de datos en japonés: JSQuAD train, JEMHopQA train y un 90 % del split de desarrollo de NIILC, excluyendo los conjuntos de evaluación, mock y producción. Los pesos se fusionaron directamente en la arquitectura del modelo base sin ningún cambio arquitectónico.

Es relevante porque demuestra la viabilidad de especializar rerankers compactos de 310M parámetros para dominios concretos (QA extractiva, QA multi-hop y búsqueda documental) con un coste de entrenamiento bajo, manteniendo el formato y la compatibilidad del modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT (encoder transformer), tarea de clasificación de pares |
| Parametros totales | 315.203.329 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible (heredada del base cl-nagoya/ruri-v3-reranker-310m; no especificada en la información proporcionada) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; cuantizaciones GGUF/ONNX no publicadas) |
| Idiomas soportados | japonés (ja) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repositorio de 1,3 GB) |

## Arquitectura y entrenamiento

El modelo es un encoder ModernBERT de 310M parámetros empleado como cross-encoder para reranking: recibe un par (consulta, documento) y produce una puntuación de relevancia mediante la cabeza de clasificación. No hay cambios arquitectónicos respecto al modelo base; el ajuste se aplicó con LoRA y los adaptadores se fusionaron en los pesos originales, de modo que la estructura y el tokenizador son idénticos a los de cl-nagoya/ruri-v3-reranker-310m.

El entrenamiento utilizó JSQuAD train (QA extractiva sobre Wikipedia en japonés), JEMHopQA train (QA multi-hop) y el 90 % del split de desarrollo de NIILC, dejando fuera los conjuntos de evaluación, mock y producción. La model card no detalla hiperparámetros, número de tokens de entrenamiento, configuración de LoRA ni si hubo etapas de alineación adicionales. Se publica un SHA256 de los pesos fusionados (`32c3e10b3180d3eee0373bc1deb24d504f665c2013a800f406b3664a4451fe91`) para verificación de integridad.

## Capacidades

- Reranking de pares consulta-documento en japonés con salida de clasificación.
- Reordenación de candidatos en pipelines de recuperación (RAG, búsqueda documental).
- Manejo de consultas de QA extractiva (dominio JSQuAD) y multi-hop (dominio JEMHopQA).
- Aplicable a búsqueda sobre documentación técnica en japonés (dominio NIILC).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible (el modelo no genera texto libre; solo puntúa).
- Capacidades multilingües: limitadas al japonés.
- Capacidades especiales (modo thinking, visión, audio): no disponibles.

## Casos de uso

- RAG sobre documentación empresarial en japonés: usar el modelo como segunda fase de recuperación, puntuando los 20-50 candidatos devueltos por un retriever denso o BM25 y seleccionando los 3-5 mejores para el prompt del LLM generador.
- Atención al cliente con base de conocimiento en japonés: reordenar artículos de FAQ antes de pasarlos a un modelo generativo, reduciendo respuestas basadas en fragmentos irrelevantes.
- Búsqueda interna en repositorios técnicos: el ajuste sobre NIILC (documentación científica y técnica japonesa) lo hace adecuado para reranking de manuales, especificaciones e informes internos.
- QA multi-hop sobre fuentes en japonés: el entrenamiento con JEMHopQA mejora la selección de documentos intermedios cuando la respuesta requiere combinar varios pasajes.
- Evaluación de sistemas de recuperación: como componente de referencia para medir mejoras de nDCG/MRR frente al modelo base ruri-v3-reranker-310m en conjuntos japoneses.
- Filtrado de candidatos en motores de búsqueda verticales: al ser un cross-encoder de 310M, puede desplegarse en CPU o GPU modesta para puntuar lotes de pares con latencia controlada.
- Preetiquetado de datos de entrenamiento: usar las puntuaciones para seleccionar pares positivos y negativos duros en la construcción de datasets de reranking.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas (nDCG, MRR, accuracy) sobre JSQuAD, JEMHopQA, NIILC ni otros conjuntos, ni comparaciones con el modelo base.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 1,3 GB de pesos (315M parámetros × 4 bytes), más overhead de activaciones; en fp16/bf16, en torno a 0,65 GB.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM (RTX 3060, RTX 4060, T4, L4); para lotes grandes, A10G o A100.
- Cabe en GPU de consumo: sí, en cualquier GPU moderna con 4 GB o más; también puede ejecutarse en CPU para volúmenes moderados.
- Opciones de despliegue: Transformers (PyTorch) con la cabeza de clasificación, Text Embeddings Inference (TEI) si soporta el modelo base, ONNX Runtime tras conversión manual, o servidores propios con batching. No se han publicado pesos GGUF ni integraciones con Ollama.
- Latencia y throughput: no disponibles; al ser un cross-encoder, el coste escala linealmente con el número de pares a puntuar.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idioma | Licencia | Notas |
|---|---|---|---|---|---|
| kanippa/llm2026-r1-ruri-reranker-310m | 315M | no disponible | ja | Apache 2.0 | Ajuste LoRA fusionado sobre ruri-v3-reranker-310m con JSQuAD, JEMHopQA y NIILC |
| cl-nagoya/ruri-v3-reranker-310m | 310M | no disponible | ja | Apache 2.0 | Modelo base; reranker generalista en japonés |
| cl-nagoya/ruri-v3-310m | 310M | no disponible | ja | Apache 2.0 | Variante de embeddings (bi-encoder) del mismo linaje, para primera fase de recuperación |

El modelo ajustado conserva el tamaño y la licencia del base; la diferencia principal es la especialización en los dominios de entrenamiento indicados. No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Solo soporta japonés; su uso con consultas en otros idiomas no está validado.
- Es un cross-encoder de clasificación: no genera texto, no soporta tool calling ni razonamiento multi-paso.
- El ajuste está sesgado hacia los dominios de JSQuAD, JEMHopQA y NIILC; el rendimiento en otros dominios (p. ej., conversacional, legal, médico) puede degradarse respecto al modelo base.
- No se han publicado métricas de evaluación, por lo que la mejora frente al base no está cuantificada.
- Riesgo de alucinación no aplica directamente (no genera texto), pero puede asignar puntuaciones altas a documentos superficialmente similares; conviene calibrar umbrales por dominio.
- La licencia Apache 2.0 permite uso comercial, pero se debe conservar el aviso de licencia y atribución.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de validación por terceros.
- La model card no documenta hiperparámetros de entrenamiento ni el proceso de selección de negativos, lo que dificulta reproducir el ajuste.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kanippa/llm2026-r1-ruri-reranker-310m
- Modelo base: https://huggingface.co/cl-nagoya/ruri-v3-reranker-310m
- Familia ruri-v3 (embeddings): https://huggingface.co/cl-nagoya/ruri-v3-310m
