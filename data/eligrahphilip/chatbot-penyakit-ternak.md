# eligrahphilip/chatbot-penyakit-ternak

## Resumen

`eligrahphilip/chatbot-penyakit-ternak` es un modelo de clasificación de texto basado en la arquitectura BERT, publicado en Hugging Face por el usuario eligrahphilip. Por el nombre ("penyakit ternak" significa "enfermedades del ganado" en indonesio) y por la etiqueta de pipeline `text-classification`, el modelo parece estar orientado a la detección o clasificación de enfermedades animales en un contexto de chatbot, probablemente en indonesio. Sin embargo, la model card es la plantilla automática de Hugging Face y no aporta ninguna información sustantiva sobre el propósito real, los datos de entrenamiento o el rendimiento.

El modelo tiene 124.452.879 parámetros (aproximadamente 124 millones), lo que coincide con el tamaño de un BERT-base. El repositorio ocupa 0,5 GB y los pesos están en formato safetensors. Se creó y actualizó el 25 de noviembre de 2026, con cero descargas y cero likes en el momento de redactar esta ficha, lo que indica que es un modelo recién publicado y sin validación por parte de la comunidad.

Su relevancia actual es muy limitada: se trata de un artefacto de investigación o experimento personal sin documentación, sin métricas y sin licencia declarada. Cualquier evaluación seria requiere inspeccionar los pesos y el tokenizador directamente, y no puede recomendarse para producción sin una validación previa exhaustiva.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | BERT (transformer encoder, según la etiqueta `bert`) |
| Parámetros totales | 124.452.879 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (típicamente 512 tokens en BERT-base, sin confirmar) |
| Tipos de cuantización | no disponible (pesos safetensors en precisión original; convertible a GGUF/ONNX) |
| Idiomas soportados | no disponible (el nombre sugiere indonesio, sin confirmar) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La etiqueta `bert` y el recuento de parámetros (124,4 M) apuntan a un transformer encoder tipo BERT-base, con 12 capas, 768 dimensiones ocultas y 12 cabezas de atención, más una cabeza de clasificación sobre el token `[CLS]`. El tag `arxiv:1910.09700` que aparece en los metadatos corresponde al artículo de Lacoste et al. sobre el impacto ambiental del aprendizaje automático, citado en la plantilla de la model card; no es una referencia al artículo de BERT ni describe el entrenamiento del modelo.

No hay información sobre el conjunto de datos de entrenamiento, el número de tokens, el régimen de precisión (fp32, fp16, bf16), la existencia de ajuste fino supervisado, RLHF o DPO, ni sobre innovaciones técnicas como decodificación especulativa o atención lineal. La model card no incluye hiperparámetros, procedimiento de preprocesado ni detalles del corpus. Todo ello debe considerarse no disponible.

## Capacidades

- Clasificación de texto: el pipeline declarado es `text-classification`, por lo que el modelo emite etiquetas (probablemente relacionadas con enfermedades del ganado) para un texto de entrada.
- Codificación de representaciones: al ser un encoder BERT, puede emplearse para generar embeddings de frases o documentos (`text-embeddings-inference` aparece entre los tags).
- Compatibilidad con endpoints: el tag `endpoints_compatible` indica que puede desplegarse en la infraestructura de inferencia de Hugging Face.
- Generación de texto: no soportada de forma nativa; es un modelo encoder, no un modelo causal.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no confirmadas; el nombre sugiere indonesio, pero no hay evidencia documentada.
- Capacidades especiales (thinking mode, visión, audio): no disponibles.

## Casos de uso

- Clasificación de consultas en un chatbot veterinario: el modelo podría etiquetar mensajes de usuarios sobre síntomas de animales y enrutarlos a la respuesta o al especialista adecuado, siempre que se valide previamente el etiquetado real que produce.
- Triaje de informes de ganaderos: dado un texto descriptivo de síntomas, asignar una categoría de enfermedad para priorizar la atención veterinaria, tras confirmar el conjunto de etiquetas con el autor.
- Filtrado de mensajes en un canal de soporte: detectar consultas relacionadas con enfermedades del ganado frente a otros temas, usando la cabeza de clasificación como filtro binario o multiclase.
- Generación de embeddings para búsqueda semántica: extraer representaciones del token `[CLS]` o de la media de tokens para indexar una base documental veterinaria y recuperar material relevante.
- Análisis de sentimiento o urgencia en reseñas y reportes: reutilizar el encoder como extractor de características y añadir una cabeza de clasificación propia sobre los embeddings, con ajuste fino adicional.
- Prototipado de investigación en NLP para indonesio: servir como punto de partida para experimentos académicos sobre clasificación de textos sanitarios, dado su tamaño manejable y su compatibilidad con la librería `transformers`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0,5 GB para los pesos (124 M de parámetros × 4 bytes), más overhead de activaciones y tokenizador; en la práctica, menos de 1 GB.
- VRAM estimada en fp16: alrededor de 0,25 GB para los pesos.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; una RTX 3060, RTX 4060 o superior cubre el modelo con holgura. Para lotes grandes, una A10G o L4 ofrece buen throughput.
- Cabe en GPU consumer: sí, en cualquier GPU con al menos 2 GB de VRAM, e incluso en CPU para inferencia por lotes pequeños.
- Opciones de despliegue: `transformers` con `pipeline("text-classification")`, Text Embeddings Inference (TEI) para servir embeddings, ONNX Runtime u `optimum` para exportación, y servidores de inferencia compatibles con los endpoints de Hugging Face.
- Latencia y throughput estimados: no disponibles; al no haber benchmarks publicados ni datos de longitud de secuencia, no es posible dar cifras fiables.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| `eligrahphilip/chatbot-penyakit-ternak` | 124,4 M | no disponible | no disponible | Hugging Face, 0 descargas | Sin documentación ni benchmarks |
| `bert-base-multilingual-cased` | 178 M | 512 tokens | Apache 2.0 | Ampliamente disponible | Referencia multilingüe de Google, con benchmarks públicos |
| `indobert-base-p2` | 124,4 M | 512 tokens | MIT (según el autor) | Hugging Face | BERT para indonesio, con corpus documentado |
| `distilbert-base-multilingual-cased` | 135 M | 512 tokens | Apache 2.0 | Ampliamente disponible | Versión destilada, más rápida y con métricas publicadas |

La comparación es orientativa: no se dispone de datos de rendimiento del modelo evaluado, por lo que la elección frente a estas alternativas debe basarse en la validación empírica sobre el dominio concreto.

## Limitaciones y advertencias

- Ausencia total de documentación: la model card es la plantilla automática, sin información sobre datos, etiquetas, métricas ni uso previsto.
- Licencia no declarada: no puede asumirse uso comercial; es imprescindible contactar con el autor antes de cualquier despliegue en producción.
- Sin validación comunitaria: cero descargas y cero likes; no hay evidencia de que el modelo funcione correctamente en la tarea que sugiere su nombre.
- Riesgo de alucinación y etiquetado erróneo: al ser un clasificador, puede asignar categorías incorrectas con alta confianza; no debe usarse en decisiones veterinarias sin supervisión humana.
- Sesgos desconocidos: al no conocerse el corpus de entrenamiento, no es posible evaluar sesgos de dominio, geográficos o lingüísticos.
- Idiomas no confirmados: el nombre sugiere indonesio, pero no hay garantía de que el tokenizador y el vocabulario estén adaptados a ese idioma.
- Longitud de contexto no confirmada: si es BERT-base, el límite habitual es de 512 tokens; textos más largos requerirán truncamiento o segmentación.
- Fecha de creación futura (2026): conviene verificar la integridad del repositorio y la procedencia de los pesos antes de cargarlos en un entorno de confianza.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/eligrahphilip/chatbot-penyakit-ternak
- Artículo citado en los metadatos (Lacoste et al., 2019, sobre impacto ambiental): https://arxiv.org/abs/1910.09700
- Calculadora de impacto ambiental citada en la plantilla: https://mlco2.github.io/impact
- Documentación de BERT en `transformers`: https://huggingface.co/docs/transformers/model_doc/bert
- Documentación de Text Embeddings Inference: https://huggingface.co/docs/text-embeddings-inference
