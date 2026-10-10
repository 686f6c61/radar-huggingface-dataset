# davidmelash/modern_liberta_large_w2048_v7large_2026-10-09_r4_s43

## Resumen

modern_liberta_large_w2048_v7large_2026-10-09_r4_s43 es un modelo de clasificación de tokens (token classification) publicado por el usuario davidmelash y afinado a partir del codificador ucraniano Goader/modern-liberta-large. Su función es detectar datos personales en sentencias judiciales de Ucrania para permitir su seudonimización, identificando entidades como nombres de personas, direcciones, números e información sensible.

El modelo cuenta con 409.799.689 parámetros (unos 410 millones) según el fichero safetensors, y sigue la arquitectura de encoder ModernBERT. Está entrenado sobre un corpus sintético denominado v7large, construido a partir de sentencias del Registro Unificado Estatal de Decisiones Judiciales de Ucrania en las que los fragmentos anonimizados se rellenan con valores generados. Las direcciones sintéticas provienen del directorio de Ukrposhta y de OpenStreetMap.

Es relevante para equipos que trabajan con corpus legales ucranianos y necesitan automatizar el cumplimiento de protección de datos (seudonimización antes de publicar o compartir resoluciones). El modelo es monolingüe en ucraniano, se distribuye con licencia MIT y únicamente con pesos en formato safetensors, sin cuantizaciones publicadas ni resultados de benchmarks declarados en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder transformer tipo ModernBERT (familia modern-liberta) |
| Parametros totales | 409.799.689 (~410 M) |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | 2048 tokens (según el identificador "w2048"; no confirmado de forma explícita en la model card) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | ucraniano (código uk) |
| Licencia | MIT |
| Formato de pesos | safetensors |

Otras especificaciones: tarea de pipeline `token-classification`; tamaño del repositorio 1,6 GB (coherente con pesos en precisión completa, FP32); modelo base `Goader/modern-liberta-large`; etiquetas de entidad: `ОСОБА` (persona), `АДРЕСА` (dirección), `НОМЕР` (número), `ІНФОРМАЦІЯ` (información).

## Arquitectura y entrenamiento

El modelo es un encoder transformer de la familia ModernBERT, una revisión moderna de la arquitectura BERT que habitualmente incorpora atención con RoPE, alternancia de atención local y global, y capas sin sesgos, aunque la model card no detalla la configuración interna exacta. Al ser un modelo de clasificación de tokens, la cabeza de salida etiqueta cada token de la secuencia de entrada, lo que lo hace adecuado para reconocimiento de entidades nombradas (NER) y extracción de PII. El identificador "w2048" apunta a una ventana de 2048 tokens, aunque este dato no se confirma en la documentación disponible.

El entrenamiento se realizó sobre el conjunto sintético `v7large`, formado por sentencias del Registro Unificado Estatal de Decisiones Judiciales de Ucrania cuyos fragmentos anonimizados se rellenaron con valores generados. Las direcciones sintéticas se obtuvieron del directorio de Ukrposhta y de datos de OpenStreetMap (© OpenStreetMap contributors, ODbL). No se especifican en la información disponible el número de tokens, la composición exacta del dataset, ni si se aplicaron etapas de RLHF, DPO u otras técnicas de alineación.

## Capacidades

- Reconocimiento de entidades nombradas (NER) en ucraniano sobre texto jurídico, con cuatro categorías: persona (`ОСОБА`), dirección (`АДРЕСА`), número (`НОМЕР`) e información (`ІНФОРМАЦІЯ`).
- Clasificación a nivel de token, lo que permite delimitar los límites exactos de cada entidad dentro de la secuencia.
- Detección de datos personales orientada a seudonimización de sentencias judiciales ucranianas.
- Integración nativa con la librería transformers mediante la tarea `token-classification` y compatibilidad declarada con endpoints.
- Modelo monolingüe en ucraniano; no se declara soporte multilingüe.
- No se declaran capacidades de generación de texto, razonamiento general, código, matemáticas, visión, audio, tool calling ni comportamiento de agente; es un codificador discriminativo, no un modelo generativo.

## Casos de uso

- Seudonimización de sentencias judiciales: el modelo detecta nombres, direcciones, números e información sensible para sustituirlos por valores sintéticos antes de la publicación o cesión de resoluciones, que es su finalidad principal declarada.
- Cumplimiento de protección de datos en registros judiciales: permite automatizar el enmascaramiento de PII en flujos de documentos legales, reduciendo la exposición de datos personales en repositorios públicos.
- Preprocesado de corpus para NLP legal: se puede usar como paso previo de anonimización para construir corpus de investigación reutilizables sin vulnerar la privacidad de las personas citadas.
- Normalización de direcciones: al apoyarse en valores generados a partir de Ukrposhta y OpenStreetMap, es adecuado para localizar y tratar direcciones dentro de textos judiciales ucranianos.
- Revisión asistida de documentos: puede preseleccionar fragmentos con datos personales y enviarlos a revisión humana, reduciendo el volumen de texto que un operador debe inspeccionar manualmente.
- Enmascaramiento en sistemas de gestión documental: integrable como servicio de inferencia que marca entidades en un documento antes de almacenarlo o indexarlo.
- Etiquetado de datos para entrenamiento: sus salidas pueden servir como preetiquetado asistido para generar nuevos conjuntos anotados de NER jurídico en ucraniano.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (estimaciones a partir de los 410 M de parámetros): unos 1,6 GB en FP32, unos 0,8 GB en FP16/BF16, unos 0,4 GB en INT8 y unos 0,2 GB en INT4.
- Al ser un modelo de 410 M de parámetros, cabe holgadamente en GPU de consumo: RTX 3060, RTX 4060, RTX 4090, y en muchas tarjetas integradas con memoria compartida.
- GPU recomendadas para producción con mayor throughput: A100, H100 o L40S, aunque para este tamaño no son necesarias y bastan GPUs de gama media.
- Opciones de despliegue: pipeline de transformers, exportación a ONNX, y servidores de inferencia compatibles con modelos de transformers. No se confirma en la información disponible el soporte específico de vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| modern_liberta_large_w2048_v7large_2026-10-09_r4_s43 | 409,8 M | 2048 tokens (según identificador) | Clasificación de tokens (PII en ucraniano) | MIT | HuggingFace (transformers, safetensors) |
| Goader/modern-liberta-large (modelo base) | ~no disponible (familia large) | no disponible | Encoder preentrenado en ucraniano | no disponible en la información proporcionada | HuggingFace |
| Otras alternativas de NER jurídico en ucraniano | no disponible | no disponible | Clasificación de tokens | no disponible | no disponible |

No se dispone de datos de benchmarks ni de comparativas cuantitativas con modelos equivalentes en la información proporcionada.

## Limitaciones y advertencias

- Modelo monolingüe: solo soporta ucraniano (uk); su uso con otros idiomas no está respaldado.
- Especializado en texto jurídico ucraniano; el rendimiento fuera de ese dominio no está documentado.
- Al ser un modelo entrenado sobre datos sintéticos generados, puede presentar un sesgo hacia los patrones de dichos datos y generalizar peor ante variaciones reales no representadas.
- Riesgo de falsos negativos y falsos positivos en la detección de PII; no debe usarse como único mecanismo de garantía de anonimización en producción sin validación humana.
- Solo se publican pesos en safetensors; no hay cuantizaciones ni versiones GGUF/ONNX declaradas, lo que puede limitar algunos despliegues de bajo consumo.
- Sin datos de benchmarks ni de evaluación, no es posible cuantificar su precisión, exhaustividad ni su comportamiento frente a otros modelos.
- La licencia MIT permite uso comercial y modificación, pero se debe conservar el aviso de licencia y respetar las atribuciones de las fuentes de datos subyacentes (Ukrposhta y OpenStreetMap, © OpenStreetMap contributors, ODbL).

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/davidmelash/modern_liberta_large_w2048_v7large_2026-10-09_r4_s43
- Modelo base: https://huggingface.co/Goader/modern-liberta-large
- OpenStreetMap (atribución de datos): https://www.openstreetmap.org/copyright
- Ukrposhta (directorio de direcciones): no disponible como enlace específico en la información proporcionada
