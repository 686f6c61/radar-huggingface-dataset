# JoudAlrubaish/technical-support-extractive-qa

## Resumen

technical-support-extractive-qa es un modelo de respuesta a preguntas extractiva publicado en Hugging Face por el usuario JoudAlrubaish. Se apoya en la familia DistilBERT, la versión destilada de BERT, con 66.364.418 parámetros y un repositorio de 0,3 GB que únicamente contiene pesos en formato safetensors. El pipeline declarado es question-answering, de modo que no genera texto libre: localiza el fragmento de un contexto dado que responde a una pregunta y devuelve sus índices de inicio y fin.

El nombre del repositorio apunta a un ajuste orientado a soporte técnico, es decir, a extraer respuestas concretas de documentación, manuales o artículos de ayuda. Sin embargo, la model card es la plantilla automática de transformers y no se ha rellenado: no hay información sobre el dataset de entrenamiento, el idioma, la licencia ni la procedencia de los pesos.

Su interés práctico es el de un modelo pequeño (66 M de parámetros) que puede ejecutarse en CPU o en cualquier GPU de consumo y actuar como componente de lectura dentro de un pipeline RAG o de un motor de FAQ con trazabilidad de la cita. Con cero descargas y cero likes en el momento de la consulta, debe tratarse como un artefacto sin validación pública.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder de la familia DistilBERT (destilación de BERT), con cabeza de question answering; número exacto de capas no confirmado en la información proporcionada |
| Parametros totales | 66.364.418 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (la familia DistilBERT-base suele limitarse a 512 tokens) |
| Tipos de cuantizacion | No disponible; el repositorio solo publica pesos sin cuantizar. No incluye variantes GGUF, GPTQ, AWQ ni ONNX |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors |
| Autor | JoudAlrubaish |
| Pipeline | question-answering |
| Libreria | transformers |
| Tamano del repositorio | 0,3 GB |
| Fecha de publicacion | 19 de septiembre de 2026 (según metadatos del Hub) |
| Descargas / likes | 0 / 0 |
| Compatibilidad de despliegue | endpoints_compatible (etiqueta del Hub) |

## Arquitectura y entrenamiento

La etiqueta distilbert junto al recuento de 66.364.418 parámetros sitúan al modelo en la familia DistilBERT, un transformer encoder obtenido por destilación de conocimiento a partir de BERT-base (Sanh et al., 2019). La configuración habitual de DistilBERT-base es de 6 capas, 12 cabezas de atención y dimensión oculta de 768, sobre la que se añade la cabeza estándar de question answering de transformers: dos proyecciones lineales que producen los logits de inicio y de fin del span respuesta. No es una arquitectura MoE, ni híbrida con SSM, ni presenta mecanismos de atención lineal declarados. La model card no aporta la configuración exacta, por lo que esta descripción se deduce de la familia indicada en las etiquetas y del recuento de parámetros, no de documentación del autor.

En cuanto al entrenamiento, la información disponible es nula: la model card conserva todos los campos en "[More Information Needed]". No se indica dataset, número de tokens, composición de los datos, ni si hubo ajuste sobre SQuAD, SQuAD v2, un corpus propio de soporte técnico u otro conjunto. Tampoco se documentan hiperparámetros, régimen de precisión (fp32, fp16, bf16) ni uso de RLHF o DPO, técnicas poco habituales en modelos extractivos. No se puede confirmar ninguna innovación técnica asociada a este checkpoint. La única referencia arXiv presente en las etiquetas (1910.09700) corresponde a Lacoste et al. (2019) sobre cuantificación de emisiones de carbono, citada en la plantilla de la model card, y no a un paper del modelo.

## Capacidades

- Respuesta a preguntas extractiva: recibe un contexto y una pregunta y devuelve el fragmento del contexto que contiene la respuesta, mediante logits de inicio y fin.
- Trazabilidad de la respuesta: al devolver un span literal del documento, la cita es verificable sin generación libre.
- Integración directa con la API pipeline("question-answering") de transformers y con endpoints compatibles del Hub.
- Procesamiento por lotes, al ser un encoder de 66 M de parámetros con coste de inferencia bajo.
- No dispone de generación de texto libre, resumen, traducción ni redacción.
- Sin soporte conocido de tool calling, function calling, agentes ni razonamiento multi-paso.
- Sin capacidades multimodales (visión, audio) ni modo de pensamiento explícito.
- Cobertura multilingüe: no disponible. Los checkpoints DistilBERT-base se publican habitualmente en inglés sin distinción de mayúsculas, pero no se confirma para este modelo.
- Gestión de preguntas sin respuesta: no disponible; no puede confirmarse si se entrenó con SQuAD v2 u otro conjunto con ejemplos negativos, por lo que la calibración de la confianza es desconocida.

## Casos de uso

- Búsqueda de respuestas en documentación técnica: el modelo se coloca al final de un pipeline de recuperación y extrae el fragmento exacto del manual o de la página de referencia que responde a la consulta del usuario. Su tamaño permite ejecutarlo por cada pasaje recuperado sin disparar el coste.
- Atención al cliente de nivel 1: sobre una base de artículos de ayuda, responde preguntas frecuentes devolviendo el span con la solución y el enlace al artículo de origen, de modo que el agente o el bot puedan citar la fuente.
- Asistente interno de soporte IT: indexación de runbooks y procedimientos operativos para responder consultas del tipo "¿qué comando reinicia el servicio X?" extrayendo la línea concreta del procedimiento.
- Extracción de campos en tickets y formularios: planteando preguntas del tipo "¿cuál es el número de incidencia?" o "¿qué versión de firmware aparece?", el modelo puede rellenar campos estructurados de un CRM a partir de texto libre, siempre con revisión humana.
- Componente de lectura en arquitecturas RAG: actúa como lector extractivo tras el recuperador, reduciendo el riesgo de respuestas inventadas porque la salida está anclada a un fragmento literal del contexto recuperado.
- Auditoría y cumplimiento: al devolver índices de carácter sobre el documento original, permite reconstruir la evidencia exacta de cada respuesta, requisito habitual en entornos regulados.
- Clasificación ligera mediante preguntas: formular preguntas binarias o de categoría sobre un texto para derivar etiquetas simples, aprovechando la cabeza de QA como extractor de evidencia textual.
- Despliegue en CPU o en el borde: con menos de 300 MB de pesos en fp32, puede ejecutarse en servidores sin GPU, en contenedores pequeños o en dispositivos con recursos limitados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

La model card no describe ningún protocolo de evaluación, conjunto de test ni métrica (EM, F1). Como referencia externa y no atribuible a este checkpoint, el modelo distilbert-base-uncased-distilled-squad publicado por sus autores originales reporta 79,1 de Exact Match y 86,9 de F1 en SQuAD v1.1 (Sanh et al., 2019). No existe ningún dato que permita afirmar que este ajuste concreto alcanza cifras similares.

## Requisitos de hardware

- Peso de los pesos en memoria: aproximadamente 265 MB en fp32 (66,36 M de parámetros × 4 bytes), unos 133 MB en fp16 y unos 66 MB en int8. El repositorio de 0,3 GB es coherente con pesos sin cuantizar.
- VRAM estimada para inferencia: menos de 1 GB con cualquiera de esas precisiones, incluyendo activaciones y overhead del runtime para longitudes de secuencia cortas.
- GPU recomendadas: cualquier GPU con 2 GB o más de VRAM es suficiente. Funciona en tarjetas de gama de entrada y en GPUs de datacenter (T4, L4, A10, A100, H100) sin aprovechar toda su capacidad; en estas últimas el cuello de botella será el preprocesado y la orquestación, no el modelo.
- Cabe en GPU de consumo: sí, en cualquier RTX 30/40, GTX 16xx o integradas con suficiente memoria compartida. También es viable la inferencia en CPU, que suele ser la opción más coste-eficiente para este tamaño.
- Opciones de despliegue: pipeline de transformers, Hugging Face Inference Endpoints (la etiqueta endpoints_compatible lo indica), exportación a ONNX Runtime o TorchScript para reducir latencia, servidores tipo Triton o FastAPI con por lotes dinámico. La conversión a GGUF para llama.cpp u Ollama es posible en teoría, pero no es el flujo habitual para un encoder extractivo y no está documentada para este repositorio.
- Latencia y throughput estimados: no disponible. No se han publicado mediciones, y dependerán de la longitud del contexto, del tamaño de lote y del hardware.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Resultados publicados |
|---|---|---|---|---|---|
| technical-support-extractive-qa (este modelo) | 66,36 M | No disponible (familia DistilBERT: 512 tokens) | QA extractiva | No disponible | No publicados |
| distilbert-base-uncased-distilled-squad | ~67 M | 512 tokens | QA extractiva (SQuAD v1.1) | Apache-2.0 | 79,1 EM / 86,9 F1 en SQuAD v1.1 (Sanh et al., 2019) |
| deepset/roberta-base-squad2 | ~125 M | 512 tokens | QA extractiva (SQuAD v2) | No verificado | No verificado en esta ficha |
| google/flan-t5-base | ~248 M | 512 tokens | QA generativa (seq2seq) | Apache-2.0 | No verificado en esta ficha |

Frente a estas alternativas, este modelo ofrece el mismo orden de magnitud en parámetros que el checkpoint destilado de referencia y un coste de inferencia muy inferior al de un modelo generativo, a cambio de no poder formular respuestas que no aparezcan literalmente en el contexto y de carecer de licencia declarada y de evaluación publicada.

## Limitaciones y advertencias

- Licencia no declarada: al no especificarse, no puede asumirse que el uso comercial esté permitido. Es un bloqueo potencial para producción hasta que el autor lo aclare.
- Model card vacía: se desconoce el dataset de entrenamiento, el idioma y el dominio real de ajuste. Cualquier afirmación sobre su especialización en soporte técnico proviene únicamente del nombre del repositorio.
- Sesgos desconocidos: al no documentarse los datos, no es posible auditar sesgos de género, idioma, origen o terminología técnica.
- Riesgo de respuesta incorrecta: aunque un modelo extractivo no genera texto nuevo, sí puede seleccionar un span equivocado o poco relevante. Es imprescindible aplicar un umbral de confianza sobre la puntuación devuelta y validar con un conjunto propio.
- Dependencia de la recuperación: si la respuesta no está literalmente en el contexto proporcionado, el modelo no puede responderla. No sintetiza información de varios pasajes ni razona sobre ellos.
- Ventana de contexto limitada: la familia DistilBERT-base trabaja con 512 tokens, lo que obliga a trocear documentos largos y a gestionar correctamente la correspondencia entre fragmentos y documento original.
- Idiomas no confirmados: no hay garantía de comportamiento en castellano ni en otros idiomas distintos del inglés.
- Sin preguntas sin respuesta garantizadas: no se sabe si se entrenó con ejemplos negativos, por lo que puede devolver spans de baja calidad ante preguntas fuera de alcance.
- Cero adopción verificable: 0 descargas y 0 likes implican ausencia de validación por parte de la comunidad. No debería desplegarse sin una evaluación propia sobre datos representativos del caso de uso.
- Sin artefactos adicionales: no se ofrecen versiones cuantizadas, ONNX ni contenedores, lo que añade trabajo de empaquetado antes de cualquier despliegue.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/JoudAlrubaish/technical-support-extractive-qa
- Referencia arXiv presente en las etiquetas del Hub, 1910.09700 (Lacoste et al., 2019, sobre cuantificación de emisiones de carbono): https://arxiv.org/abs/1910.09700
- Paper de la familia DistilBERT (Sanh et al., 2019), referencia externa de arquitectura, sin enlace verificado en la información proporcionada
- Nota sobre la búsqueda web: los resultados devueltos corresponden a páginas de previsión meteorológica de Orihuela y no guardan relación con el modelo. No se han encontrado papers, blogs, repositorios ni demos adicionales asociados a este checkpoint.
