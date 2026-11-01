# opticsWolf/ms-marco-MiniLM-L-6-v2-q8-onnx

## Resumen

`opticsWolf/ms-marco-MiniLM-L-6-v2-q8-onnx` es una compilación cuantizada a int8 de pesos (weight-only) del cross-encoder `cross-encoder/ms-marco-MiniLM-L6-v2`, un modelo de reranking entrenado sobre el corpus MS MARCO. El modelo original, desarrollado por el equipo de Sentence Transformers (UKPLab), se utiliza como segunda etapa en pipelines de recuperación de información: recibe un par consulta-documento y devuelve una puntuación de relevancia que permite reordenar los candidatos recuperados por un retriever de primera etapa (BM25, embeddings densos, etc.).

Esta versión concreta, publicada por el usuario `opticsWolf`, no reentrena ni modifica la arquitectura: aplica cuantización de solo pesos mediante `MatMulNBits` de ONNX Runtime (8 bits, bloques de 128, asimétrica, escalas en fp32) y exporta el resultado al formato ONNX para su ejecución con `onnxruntime`. El objetivo es reducir el coste de almacenamiento y el ancho de banda de memoria en inferencia, manteniendo el orden de ranking sobre pares de validación.

Su relevancia práctica es acotada pero concreta: permite desplegar un reranker ligero (repo de 0,1 GB) en entornos donde no se dispone de GPU o donde el coste por consulta es crítico, a cambio de una degradación medible en los logits crudos (peor desviación de 0,161 según el autor). La licencia Apache-2.0 del checkpoint original se preserva en esta build.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder (MiniLM-L-6), cross-encoder para reranking |
| Parámetros totales | no disponible (el checkpoint MiniLM-L6 original ronda los 22,7 M, dato no confirmado en la información proporcionada) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (el checkpoint base admite pares consulta-documento truncados; el límite exacto no se especifica en la información) |
| Tipos de cuantización | int8 weight-only (ORT MatMulNBits, bits=8, block=128, asimétrico, escalas fp32) |
| Idiomas soportados | no disponible (el corpus MS MARCO es mayoritariamente inglés) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (ejecutable con onnxruntime) |

## Arquitectura y entrenamiento

La arquitectura subyacente es un cross-encoder basado en MiniLM-L-6: un transformer encoder de 6 capas que procesa conjuntamente la consulta y el documento como una única secuencia con tokens especiales de separación, y produce una puntuación escalar de relevancia a partir de la representación del token `[CLS]`. A diferencia de los bi-encoders, el cross-encoder modela la interacción completa entre consulta y documento, lo que mejora la precisión del ranking a costa de no poder precomputar embeddings de documentos.

El checkpoint original fue entrenado sobre MS MARCO (pares consulta-pasaje con etiquetas de relevancia derivadas de clics) y es un estándar de facto en la literatura de reranking por su relación calidad-coste. Esta build no aporta información sobre el proceso de entrenamiento original ni sobre datos adicionales; se limita a documentar el proceso de cuantización. La innovación técnica de esta publicación es exclusivamente la cuantización weight-only con `MatMulNBits` de ONNX Runtime, que reduce el tamaño de los pesos a int8 manteniendo escalas en fp32 por bloque de 128 columnas, con verificación de paridad en el orden de ranking sobre un conjunto de pares dorados.

## Capacidades

- Puntuación de relevancia consulta-documento (reranking de segunda etapa).
- Ordenación de candidatos recuperados por un retriever de primera etapa.
- Ejecución en CPU mediante `onnxruntime` sin dependencia de GPU.
- Integración en pipelines de búsqueda y RAG como componente de filtrado fino.
- Capacidad multilingüe: no disponible (el corpus de entrenamiento es mayoritariamente inglés).
- Soporte de tool calling / function calling: no aplica (no es un modelo generativo).
- Soporte de agentes y razonamiento multi-paso: no aplica.
- Modo thinking, visión o audio: no disponible / no aplica.

## Casos de uso

- Reranking en pipelines RAG: tras recuperar los N documentos más similares con un índice vectorial, el cross-encoder reordena esos candidatos según relevancia real a la consulta, mejorando la precisión del contexto entregado al LLM generador. La build q8 permite ejecutar esta etapa en CPU dentro del mismo servicio.
- Búsqueda empresarial en documentación interna: reordenar resultados de un motor BM25 sobre manuales, wikis o tickets de soporte, con latencia baja gracias al tamaño reducido del modelo (0,1 GB) y a la inferencia int8.
- Filtrado de candidatos en motores de recomendación de contenido textual: puntuar pares usuario-ítem descritos en texto para descartar falsos positivos antes de una etapa de ranking más costosa.
- Moderación y deduplicación semántica: usar la puntuación de relevancia para decidir si dos textos tratan el mismo tema, aprovechando la capacidad del cross-encoder de modelar interacciones finas.
- Despliegue en entornos edge o sin GPU: al ejecutarse con `onnxruntime` en CPU y ocupar 0,1 GB, es viable en contenedores pequeños, funciones serverless o dispositivos con recursos limitados.
- Evaluación offline de sistemas de recuperación: generar puntuaciones de relevancia para calcular métricas como nDCG o MRR sobre conjuntos de validación, con un coste computacional bajo y reproducible.
- Segunda etapa en buscadores de código o documentación técnica: reordenar fragmentos de código o pasajes de API recuperados por embeddings, donde la interacción consulta-fragmento es determinante.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor únicamente reporta una métrica de paridad tras la cuantización: la peor desviación en logits crudos es de 0,161 y el orden de ranking se preserva sobre el conjunto de pares dorados utilizado como puerta de validación. No se proporcionan valores de nDCG, MRR ni comparaciones con el checkpoint fp32 en dichos conjuntos.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en CPU; en GPU, el modelo int8 ocupa del orden de decenas de MB, aunque la cifra exacta no se especifica en la información.
- GPU recomendadas: no disponible; cualquier GPU con soporte de ONNX Runtime (CUDA EP o TensorRT EP) podría ejecutarlo, pero no se documentan requisitos mínimos.
- Cabe en GPU de consumo: sí, con alta probabilidad, dado el tamaño del repo (0,1 GB) y la cuantización int8, aunque no se confirma en la información.
- Opciones de despliegue: `onnxruntime` (CPU o GPU), integración en servicios Python, contenedores ligeros. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplican a un cross-encoder).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `opticsWolf/ms-marco-MiniLM-L-6-v2-q8-onnx` | no disponible (MiniLM-L6 base) | no disponible | ONNX int8 | Apache-2.0 | HuggingFace (0 descargas) |
| `cross-encoder/ms-marco-MiniLM-L6-v2` (original) | no disponible (MiniLM-L6 base) | no disponible | safetensors/PyTorch | Apache-2.0 | HuggingFace (ampliamente usado) |
| `cross-encoder/ms-marco-MiniLM-L-12-v2` | no disponible | no disponible | safetensors/PyTorch | Apache-2.0 | HuggingFace |
| `BAAI/bge-reranker-base` | no disponible | no disponible | safetensors/PyTorch | MIT (según el autor) | HuggingFace |

La comparación cuantitativa de rendimiento entre estas alternativas no está disponible en la información proporcionada. La diferencia principal de esta build frente al checkpoint original es el formato (ONNX int8 frente a PyTorch fp32) y el consiguiente ahorro de memoria, con una degradación documentada únicamente en logits crudos.

## Limitaciones y advertencias

- Solo inglés en la práctica: el checkpoint base se entrenó sobre MS MARCO, mayoritariamente en inglés; el rendimiento en otros idiomas no está documentado y probablemente sea inferior.
- Degradación por cuantización: la peor desviación de 0,161 en logits crudos puede alterar el orden de pares con puntuaciones muy próximas, aunque el autor afirma que el orden de ranking se preserva en su conjunto de validación.
- Sin datos de benchmarks estándar: no hay métricas de nDCG ni MRR publicadas para esta build, lo que dificulta estimar su impacto real en producción.
- Modelo no generativo: no produce texto, solo puntuaciones; no sirve para generación, tool calling ni agentes.
- Riesgo de sesgo heredado: el corpus MS MARCO refleja sesgos de los datos de clics y de la web angloparlante; no se documenta ningún análisis de sesgo específico.
- Riesgo de alucinación: no aplica en el sentido generativo, pero el modelo puede asignar puntuaciones altas a documentos superficialmente relevantes si el par comparte términos, sin verificación factual.
- Licencia Apache-2.0: permite uso comercial y modificación, pero se recomienda conservar los avisos de atribución del checkpoint original.
- Repositorio con 0 descargas y 0 likes: no hay evidencia de uso en producción ni de validación comunitaria independiente; conviene verificar la paridad en el propio dominio antes de adoptarlo.
- Fecha de creación futura (2026-10-30) en los metadatos: inconsistencia que sugiere que los datos del repositorio deben tratarse con cautela.

## Enlaces

- HuggingFace: https://huggingface.co/opticsWolf/ms-marco-MiniLM-L-6-v2-q8-onnx
- Modelo base: https://huggingface.co/cross-encoder/ms-marco-MiniLM-L6-v2
- ONNX Runtime: https://onnxruntime.ai/
- Documentación de MatMulNBits en ONNX Runtime: no disponible en la información proporcionada
- Paper de MiniLM: no disponible en la información proporcionada
- Paper de MS MARCO: no disponible en la información proporcionada
