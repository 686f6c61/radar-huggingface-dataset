# diarizeapp/plda-speaker-clustering

## Resumen

`diarizeapp/plda-speaker-clustering` no es un modelo de aprendizaje profundo al uso, sino un repositorio de artefactos estadísticos para el posprocesado de embeddings de hablante (x-vectors) en pipelines de diarización. Contiene archivos NumPy (`.npz`) con las matrices de covarianza de un modelo PLDA (Probabilistic Linear Discriminant Analysis) en la variante Kaldi/VBx —concretamente las matrices Phi, Gamma, Sigma y el vector de medias mu— junto con las proyecciones de blanqueamiento (whitening) aplicadas a los x-vectors antes de la fase de clustering.

El problema que resuelve es concreto: en diarización de hablantes, una vez extraídos los embeddings por turno o por ventana, es necesario agruparlos por hablante. El clustering PLDA probabilístico ofrece una alternativa más robusta que el clustering coseno puro, especialmente cuando hay número desconocido de hablantes y grabaciones ruidosas. Este repositorio empaqueta esos parámetros de forma canónica para evitar dependencias frágiles y enlaces caídos.

Es relevante por su función de infraestructura: el autor (diarizeapp) lo publica como repositorio canónico para garantizar disponibilidad persistente de los artefactos que consume su ecosistema de diarización. No hay pesos neuronales, ni arquitectura transformer, ni contexto de tokens; es un componente matemático determinista.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | PLDA estadístico (Kaldi/VBx) sobre embeddings x-vector; no es una red neuronal |
| Parametros totales | no disponible (matrices de covarianza, no pesos entrenables en sentido estricto) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica |
| Tipos de cuantizacion | no disponible (matrices float en `.npz`; no se documenta precision) |
| Idiomas soportados | no disponible (independiente del idioma; opera sobre embeddings acústicos) |
| Licencia | Apache 2.0 |
| Formato de pesos | `.npz` (NumPy array archives) |

## Arquitectura y entrenamiento

El artefacto implementa un modelo PLDA en la formulación Kaldi/VBx, que descompone la variabilidad de un x-vector en una componente de hablante y una componente de canal/ruido mediante matrices de covarianza (Phi para la variabilidad intra-hablante, Gamma para la inter-hablante, Sigma como covarianza residual y mu como media global). El blanqueamiento (whitening) transforma los x-vectors a un espacio donde la distancia euclídea aproxima la verosimilitud PLDA, lo que simplifica el clustering posterior.

No se documenta en la información disponible el corpus de entrenamiento, el número de tokens o utterances, ni si hubo discriminative training. Tampoco se especifican hiperparámetros como el número de iteraciones EM o la dimensión de los embeddings asumida. La model card indica que las matrices se evalúan en rutinas matemáticas puras en Rust, sin grafo de cómputo, lo que confirma que no hay inferencia neuronal implicada.

## Capacidades

- Clustering probabilístico de hablantes a partir de x-vectors previamente extraídos.
- Blanqueamiento (whitening) de embeddings para normalizar la métrica de distancia.
- Puntuación PLDA para decidir si dos segmentos pertenecen al mismo hablante.
- Integración en pipelines de diarización que ya dispongan de un extractor de embeddings (no incluido en este repo).
- Ejecución en CPU (x86_64 y ARM NEON) mediante rutinas SIMD.
- Soporte declarado de ONNX Runtime con DirectML y CUDA para el cómputo asociado.
- No soporta tool calling, agentes, visión, audio-to-text ni generación de texto: no es un modelo generativo.

## Casos de uso

- Diarización de reuniones: agrupar segmentos de una grabación multipartícipe usando los x-vectors extraídos por un modelo aparte y este PLDA para decidir el número de hablantes y sus asignaciones.
- Transcripción con etiquetado de hablante: en pipelines ASR, asignar cada turno transcrito a un hablante concreto combinando el PLDA con los timestamps del ASR.
- Análisis de llamadas de atención al cliente: separar agente y cliente en grabaciones de call center para métricas de tiempo de habla y solapamiento.
- Investigación en verificación de hablante: usar las matrices como referencia canónica para reproducir experimentos Kaldi/VBx sin depender de rutas externas.
- Sistemas embebidos: al ser artefactos estáticos evaluados en Rust sobre CPU con NEON, encajan en despliegues sin GPU (por ejemplo, dispositivos ARM).
- Archivado y reproducibilidad: servir como fuente estable de parámetros para pipelines que antes descargaban estos ficheros de URLs que podían desaparecer.
- Preprocesado para clustering aglomerativo: el blanqueamiento permite usar distancia coseno o euclídea con umbrales calibrados en lugar de PLDA completo en entornos con restricciones de cómputo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM: no aplica; el artefacto es un conjunto de matrices NumPy evaluadas en CPU. El consumo de memoria depende del tamaño de las matrices (no documentado) y del número de x-vectors a procesar.
- GPU recomendadas: no necesarias. La model card menciona soporte de DirectML y CUDA vía ONNX Runtime, pero el PLDA en sí se ejecuta en rutinas Rust.
- Consumer GPU: irrelevante para este componente; el cuello de botella estará en el extractor de x-vectors que se use aguas arriba.
- Despliegue: no aplica vLLM, llama.cpp, Ollama ni TGI (no es un LLM). Se integra como librería o asset en el pipeline de diarización del ecosistema diarizeapp.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Componente | Tipo | Formato | Licencia | Notas |
|---|---|---|---|---|
| diarizeapp/plda-speaker-clustering | PLDA Kaldi/VBx + whitening | `.npz` | Apache 2.0 | Repositorio canónico de parámetros |
| Modelos PLDA incluidos en Kaldi (p. ej., `0003_sre16_v2_1a`) | PLDA Kaldi | binario/texto Kaldi | depende del recipe | Requiere descarga desde recipes de Kaldi; no es un repo HF canónico |
| `pyannote/embedding` + clustering interno | Red neuronal de embeddings | PyTorch | MIT/condicional | Incluye extracción y clustering; no es un PLDA aislado |
| `speechbrain/spkrec-xvect-voxceleb` | Extractor x-vector | PyTorch | Apache 2.0 | Complementario: produce los embeddings que este PLDA consumiría |

No se dispone de datos de rendimiento comparativo (DER, EER) en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo de IA generativa: no genera texto, no responde preguntas y no procesa audio directamente. Cualquier uso que espere inferencia neuronal es un error de categoría.
- Depende de un extractor de x-vectors compatible con la dimensión y normalización asumidas por estas matrices; si el extractor cambia, los parámetros dejan de ser válidos.
- No se documenta la dimensión de embedding, el corpus de entrenamiento ni la precisión numérica de las matrices, lo que dificulta validar su idoneidad en un pipeline nuevo.
- Riesgo de degradación en dominios acústicos alejados del corpus original (no declarado), con posible sobreclustering o infraclustering.
- El repositorio tiene 0.0 GB declarados y 22 descargas, lo que sugiere un artefacto pequeño pero también poca validación comunitaria.
- Licencia Apache 2.0 permite uso comercial, pero al no haber pesos neuronales la responsabilidad legal recae en el pipeline completo y en el extractor de embeddings.
- La fecha de creación indicada (2026-10-28) es futura respecto a la redacción habitual de fichas; conviene verificar la integridad del repositorio antes de usarlo en producción.

## Enlaces

- Hugging Face: https://huggingface.co/diarizeapp/plda-speaker-clustering
- Repositorio del ecosistema: https://github.com/benzy/diarize
- No se han encontrado en la información proporcionada papers, blogs, demos ni otros enlaces adicionales.
