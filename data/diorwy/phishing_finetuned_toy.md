# diorwy/phishing_finetuned_toy

## Resumen

`diorwy/phishing_finetuned_toy` es un modelo de clasificación de texto publicado en Hugging Face por el usuario diorwy. Por su identificador y sus etiquetas, se presenta como un ajuste fino (fine-tuning) de DistilBERT orientado a la detección de phishing, presumiblemente en textos como correos electrónicos, mensajes o URLs. El sufijo `_toy` sugiere que se trata de un experimento de pequeña escala o de una prueba de concepto, no de un modelo listo para producción.

El modelo emplea la arquitectura DistilBERT, una versión destilada de BERT con 66.955.010 parámetros, lo que lo sitúa en el rango de los modelos encoder pequeños y eficientes para tareas de clasificación. El repositorio ocupa 0,3 GB y los pesos están en formato safetensors, con integración declarada para `transformers`, `text-embeddings-inference` y `endpoints_compatible`.

La relevancia de esta ficha es limitada pero útil como referencia: se trata de un modelo con documentación prácticamente inexistente (la model card es la plantilla automática de Hugging Face sin rellenar), sin licencia declarada, sin idiomas especificados y sin resultados de evaluación publicados. Cualquier evaluación seria de su utilidad requiere inspección directa de los pesos y del dataset de ajuste, que no se documenta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DistilBERT (transformer encoder destilado de BERT) |
| Parametros totales | 66.955.010 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (DistilBERT admite hasta 512 tokens por diseño, no confirmado en la model card) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es DistilBERT, un transformer encoder de 6 capas obtenido mediante destilación de conocimiento a partir de BERT-base, con aproximadamente 66 millones de parámetros. Está diseñado para tareas de comprensión del lenguaje y clasificación de secuencias, con una cabeza de clasificación sobre el token `[CLS]`. El modelo base se describe en el paper de Sanh et al. (2019), referenciado en las etiquetas del repositorio mediante el arXiv 1910.09700, que corresponde al artículo de distilación.

No se dispone de información sobre el proceso de ajuste fino: ni el dataset utilizado, ni el número de ejemplos, ni los hiperparámetros, ni si hubo balanceo de clases, aumentación de datos o validación. La model card es la plantilla automática de Hugging Face y todos los campos de detalles de entrenamiento aparecen como "More Information Needed". Tampoco se documenta ninguna innovación técnica adicional más allá de la propia destilación del modelo base.

## Capacidades

- Clasificación de texto binaria o multiclase, presumiblemente orientada a distinguir contenido de phishing frente a contenido legítimo.
- Extracción de representaciones textuales (embeddings) mediante el encoder subyacente, aprovechable para tareas downstream.
- Integración con la librería `transformers` mediante `AutoModelForSequenceClassification` y `AutoTokenizer`.
- Compatibilidad declarada con `text-embeddings-inference` y con endpoints de Hugging Face (`endpoints_compatible`).
- No se documenta soporte de tool calling, agentes, razonamiento multi-paso, visión, audio ni modo de pensamiento; son capacidades ajenas a un encoder de clasificación.
- Capacidades multilingües: no disponibles; el modelo base DistilBERT es principalmente inglés, pero no se confirma el idioma del ajuste.

## Casos de uso

- Filtrado de correo electrónico entrante: clasificar mensajes como sospechosos o legítimos antes de que lleguen a la bandeja de entrada, usando el modelo como un clasificador ligero en un pipeline de seguridad. Su tamaño reducido permite procesar grandes volúmenes con bajo coste computacional.
- Detección de URLs maliciosas en formularios web: analizar el texto de una URL o el contenido de una página de aterrizaje para marcar posibles intentos de phishing, integrándolo en un gateway o proxy con latencia mínima.
- Moderación de mensajes en plataformas de mensajería: revisar mensajes de usuarios en busca de patrones de ingeniería social, como solicitudes de credenciales o enlaces sospechosos, en un servicio de moderación en tiempo real.
- Enriquecimiento de alertas SOC: añadir una puntuación de phishing a correos reportados por empleados, ayudando a los analistas a priorizar la triage. El modelo actuaría como señal adicional, no como decisión final.
- Prototipado y experimentación académica: servir como base para comparar estrategias de fine-tuning de DistilBERT en tareas de detección de fraude, dado su bajo coste de entrenamiento e inferencia.
- Clasificación por lotes de grandes corpus: procesar millones de documentos en un job batch usando CPU o GPU de gama baja, gracias a los 67 millones de parámetros y al formato safetensors.
- Filtro previo en un sistema de detección en cascada: actuar como primer clasificador rápido que descarte la mayoría del tráfico limpio y derive solo los casos dudosos a un modelo mayor o a revisión humana.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 270 MB solo para pesos (66,9 M de parámetros × 4 bytes), más activaciones y overhead del runtime; en la práctica, menos de 1 GB.
- VRAM estimada en fp16: aproximadamente 135 MB para pesos; en int8, unos 67 MB.
- GPU recomendadas: cualquier GPU moderna sirve; el modelo cabe holgadamente en tarjetas consumer como RTX 3060, RTX 4060, RTX 4090, e incluso en iGPU o CPU.
- Cabe en GPU consumer: sí, en prácticamente cualquier GPU con al menos 1-2 GB de VRAM libre; también es viable en CPU para lotes pequeños.
- Opciones de despliegue: `transformers` (PyTorch), `text-embeddings-inference` (según etiquetas), Hugging Face Inference Endpoints (según etiquetas `endpoints_compatible`). No se confirma soporte de llama.cpp, Ollama, vLLM o TGI en la información disponible.
- Latencia y throughput: no disponibles; para un DistilBERT típico en GPU moderna se esperan latencias de milisegundos por lote pequeño, pero no hay mediciones publicadas para este checkpoint concreto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| diorwy/phishing_finetuned_toy | 66,9 M | no disponible | Clasificación de texto (phishing) | no disponible | Hugging Face |
| distilbert-base-uncased | 66,9 M | 512 tokens | Modelo base de propósito general | Apache 2.0 | Hugging Face |
| bert-base-uncased | 110 M | 512 tokens | Modelo base de propósito general | Apache 2.0 | Hugging Face |
| Modelos específicos de detección de phishing | no disponible | no disponible | Clasificación de phishing | variable | variable |

La comparación con el modelo base es la más informativa: `phishing_finetuned_toy` parte de la misma arquitectura y tamaño que `distilbert-base-uncased`, pero no documenta ni el dataset ni las métricas de ajuste, por lo que no es posible afirmar que mejore al base en la tarea objetivo. Frente a `bert-base-uncased`, ofrece menos parámetros y presumiblemente menor latencia, a costa de capacidad representacional. No se han identificado en la información disponible modelos comparables específicos de detección de phishing con los que establecer una comparación cuantitativa.

## Limitaciones y advertencias

- Documentación inexistente: la model card es la plantilla automática sin rellenar; no hay información sobre datos, entrenamiento, evaluación ni uso previsto.
- Licencia no declarada: no se puede asumir uso comercial permitido; es imprescindible contactar con el autor antes de cualquier despliegue en producción.
- Sin resultados de evaluación: no hay métricas de precisión, recall, F1 ni matrices de confusión, por lo que se desconoce su rendimiento real en detección de phishing.
- Riesgo de sobreajuste o sesgo de dataset: al ser un ajuste "toy", es probable que el conjunto de entrenamiento sea pequeño y poco representativo, lo que puede provocar falsos positivos y falsos negativos sistemáticos.
- Riesgo de alucinación no aplica en sentido estricto (es un clasificador, no un generador), pero sí existe riesgo de clasificaciones erróneas con alta confianza.
- Idiomas no especificados: si el ajuste se hizo en inglés, su uso en castellano u otros idiomas no está validado.
- Ventana de contexto limitada por la arquitectura (512 tokens en DistilBERT, no confirmado en la card): textos más largos requerirán truncamiento o segmentación.
- Sin garantías de robustez frente a adversarial examples: los clasificadores de phishing son vulnerables a ofuscación de texto, typosquatting y evasión deliberada.
- Fecha de creación inusual (2026-11-27): conviene verificar la integridad y procedencia del repositorio antes de confiar en él.
- No apto como única capa de defensa: debe combinarse con listas de reputación, análisis de cabeceras, sandboxing y revisión humana.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/diorwy/phishing_finetuned_toy
- Paper de DistilBERT (referenciado en las etiquetas): https://arxiv.org/abs/1910.09700
- Documentación de DistilBERT en transformers: https://huggingface.co/docs/transformers/model_doc/distilbert
- Calculadora de impacto ambiental citada en la model card: https://mlco2.github.io/impact
- Paper de Lacoste et al. (2019) sobre estimación de emisiones: https://arxiv.org/abs/1910.09700
