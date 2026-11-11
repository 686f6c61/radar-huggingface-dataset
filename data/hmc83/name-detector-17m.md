# HMC83/name-detector-17m

## Resumen

Name detector 17M es un modelo de clasificación de tokens (token-classification) especializado en la detección de nombres de personas para su anonimización o redacción en documentos. Lo desarrolla el usuario independiente HMC83 y se publica bajo licencia MIT. El modelo parte de los pesos de `jhu-clsp/ettin-encoder-17m`, un encoder de arquitectura ModernBERT de 7 capas y dimensión 256, destilado a su vez de un profesor de 149M de parámetros. El resultado es un detector extremadamente compacto: 16,86 millones de parámetros, de los cuales 12,9 millones corresponden a la tabla de embeddings de tokens, con un peso de repositorio de 0,1 GB.

El problema que resuelve es concreto: localizar nombres propios de personas en correspondencia y documentación del sector público británico (cartas, correos, actas, registros, informes y páginas escaneadas) para poder enmascararlos o derivarlos a revisión humana. Está pensado como componente de un pipeline de redacción de datos personales (PII), no como un NER genérico.

Su relevancia actual radica en la relación entre tamaño y rendimiento: con 17M de parámetros se acerca a un profesor de 149M en varios conjuntos de prueba y supera ampliamente a Presidio con spaCy `en_core_web_lg` en documentos reales del sector público. Está disponible en safetensors y ONNX, y su inferencia puede ejecutarse sin PyTorch, solo con onnxruntime, tokenizers y numpy.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ModernBERT encoder (7 capas × 256), destilado |
| Parámetros totales | 16.863.746 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | ventanas de hasta 2.046 tokens con 256 de solapamiento |
| Tipos de cuantización | no disponible (pesos completos; 68 MB en precisión completa) |
| Idiomas soportados | inglés (en); galés con menor fiabilidad; otros idiomas sin probar |
| Licencia | MIT |
| Formato de pesos | safetensors, ONNX |

## Arquitectura y entrenamiento

El modelo es un encoder transformer de la familia ModernBERT con 7 capas y dimensión oculta de 256, partiendo de los pesos públicos de Ettin 17M. La tarea es token-classification binaria (nombre de persona / no nombre). El contexto se gestiona mediante ventanas deslizantes de hasta 2.046 tokens con 256 tokens de solapamiento, lo que permite procesar documentos largos y aprovechar listas de asistentes situadas muy por encima de la línea que se está leyendo.

El entrenamiento sigue un esquema de destilación desde un profesor: `ModernBERT-base` (149M de pesos) afinado para etiquetar tokens de nombres de personas. El corpus del profesor incluye NVIDIA Nemotron-PII, sentencias judiciales del Text Anonymization Benchmark (TAB), Few-NERD y texto de dominio inventado (plantillas, documentos generados con iniciales, fallos de OCR y nombres que son palabras comunes, además de documentos del sector público británico). El modelo estudiante se entrenó durante tres pasadas para imitar al profesor, añadiendo 728 copias de 91 documentos publicados por 40 organismos públicos británicos bajo Open Government Licence, con todos los nombres reales sustituidos por inventados. El umbral de decisión (0,3, valor `tau` en `namecfg.json`) se fijó por una regla predefinida sobre conjuntos de desarrollo. No se usó correspondencia real de FOI ni documentos reales de prueba en el entrenamiento.

## Capacidades

- Detección de nombres completos, nombres de pila, apellidos e iniciales en texto inglés.
- Enmascarado de palabras completas cuando cualquier fragmento supera el umbral de 0,3.
- Resolución de iniciales definidas en el documento (por ejemplo, «AR» tras «Anjali Raval (AR)»).
- Procesamiento de textos largos mediante ventanas solapadas.
- Argumentos opcionales `requester` y `authority`: el nombre de la autoridad nunca se enmascara y el del solicitante siempre se enmascara.
- Los títulos como «Dr» se dejan sin enmascarar.
- Inferencia sin PyTorch mediante onnxruntime, tokenizers y numpy.
- Integración estándar con `transformers` mediante `pipeline("token-classification", ...)`.
- No realiza detección de otro tipo de PII (correos, teléfonos, direcciones); solo nombres de personas.

## Casos de uso

- Redacción de correspondencia FOI en el sector público: el modelo localiza nombres de ciudadanos y funcionarios en cartas y correos para enmascararlos antes de la publicación, con la ventaja de que distingue al solicitante del organismo y evita enmascarar el nombre de la autoridad.
- Anonimización de actas y minutas: procesa documentos multi-página con ventanas solapadas y resuelve iniciales definidas en listas de asistentes, un caso frecuente en actas de reuniones.
- Preprocesado de documentos escaneados con OCR: el modelo fue entrenado con fallos de OCR y se probó sobre 64 documentos con errores de maquetación y OCR añadidos, encontrando 1.196 de 1.197 nombres.
- Triaje previo a revisión humana: al ser un modelo de 68 MB, puede ejecutarse en CPU en un pipeline de ingestión para marcar candidatos a nombre y derivar solo los casos dudosos a un revisor.
- Despliegue en entornos con restricciones de recursos: su tamaño permite ejecutarlo en contenedores ligeros sin GPU, integrándose en servicios de procesamiento documental.
- Filtrado en pipelines de datos para entrenamiento: detección de nombres en corpus de texto antes de su uso en modelos, como paso de saneamiento de PII.
- Evaluación comparativa de herramientas de redacción: sirve como referencia ligera frente a Presidio con spaCy en pruebas de cobertura y precisión sobre documentos reales.

## Benchmarks y rendimiento

Resultados publicados en la model card. F1 sobre caracteres de nombres de personas en conjuntos públicos; en TAB y Nemotron-PII se usaron otros documentos en entrenamiento. PrivacyBench se puntúa con su propia regla de solapamiento.

| Test set | Presidio (stock) | Profesor (149M) | Este modelo |
|---|---|---|---|
| OntoNotes 5 (géneros mixtos) | 92,2 | 92,9 | 91,3 |
| WNUT-17 (redes sociales) | 49,1 | 64,1 | 60,3 |
| TAB (sentencias judiciales) | 81,9 | 93,6 | 93,3 |
| Nemotron-PII (registros sintéticos) | 78,3 | 98,5 | 96,7 |
| Gretel PII (documentos sintéticos) | 70,6 | 92,4 | 89,2 |
| AI4Privacy 300k (inglés) | 36,3 | 82,1 | 80,1 |
| Tonic PrivacyBench (correos, chat y documentos sintéticos) | 87,9 | 95,5 | 91,3 |

Pruebas sobre documentos reales del sector público británico:

| Prueba | Presidio (stock) | Profesor (149M) | Este modelo |
|---|---|---|---|
| 86 documentos reales (1.628 nombres) | 929 encontrados, 5.063 caracteres mal enmascarados | 1.624 encontrados | 1.610 encontrados, 1.038 caracteres mal enmascarados |
| 100 solicitudes FOI reales (132 nombres) | no disponible | no disponible | 130 encontrados |
| 64 documentos con fallos de maquetación y OCR (1.197 nombres) | no disponible | no disponible | 1.196 encontrados |

Prueba de sesgo por origen de nombres (179 mensajes FOI reescritos 24 veces con nombres de doce grupos): el modelo encuentra 7.179 de 7.248 nombres, con una horquilla del 98,5 % al 99,3 % por grupo (diferencia de 0,8 puntos). Presidio mostró una diferencia de 28 puntos en la misma prueba.

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB en precisión completa (68 MB de pesos); cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: no requiere GPU; funciona en CPU. Cualquier GPU (RTX 4090, A100, H100) sirve para lotes grandes, pero no es necesaria.
- Cabe en GPU consumer: sí, en todas, incluidas integradas.
- Opciones de despliegue: onnxruntime (vía el código del repositorio), `transformers` con `pipeline("token-classification")`, y cualquier runtime compatible con safetensors/ONNX.
- Latencia y throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Name detector 17M | 16,9M | 2.046 tokens (ventanas) | MIT | Destilado de ModernBERT-base; F1 93,3 en TAB, 96,7 en Nemotron-PII |
| Profesor (ModernBERT-base afinado) | 149M | no disponible | no disponible | Mejor F1 en casi todos los conjuntos (98,5 en Nemotron-PII), pero 9 veces más grande |
| Presidio con spaCy `en_core_web_lg` | no disponible | no disponible | MIT (Presidio) | Mucho peor en documentos reales (929 de 1.628 nombres) y con gran sesgo por origen (28 puntos) |
| Ettin 17M (base) | 16,9M | no disponible | no disponible | Modelo base sin afinar para NER de nombres |

## Limitaciones y advertencias

- Omite algunas iniciales: 14 de los 18 nombres no detectados en los documentos reales eran de dos o tres letras mayúsculas.
- Diseñado para inglés del sector público británico; los nombres en textos en galés se detectan con menor fiabilidad y otros idiomas no se han probado.
- En ocasiones enmascara abreviaturas, siglas de estado, palabras de rol como «Clerk» y organizaciones o lugares que llevan nombre de persona.
- Omite más nombres de pila en minúscula en conversaciones informales.
- Puede pasar por alto un nombre de pila aislado repetido en una columna de tabla.
- Solo detecta nombres de personas; debe combinarse con patrones para otra PII (correos, teléfonos, direcciones).
- El umbral de 0,3 implica un compromiso: bajarlo encuentra más nombres pero enmascara más texto que no lo es.
- La licencia MIT permite uso comercial, pero el modelo se entrenó con datos de terceros (Nemotron-PII, TAB, Few-NERD) cuyas condiciones conviene verificar para producción.
- Riesgo de alucinación no aplicable en el sentido generativo, pero sí de falsos positivos y falsos negativos en el etiquetado.
- Sin datos publicados sobre latencia ni throughput.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/HMC83/name-detector-17m
- Modelo base: https://huggingface.co/jhu-clsp/ettin-encoder-17m
- Profesor (ModernBERT-base): https://huggingface.co/answerdotai/ModernBERT-base
- Dataset Nemotron-PII: https://huggingface.co/datasets/nvidia/Nemotron-PII
- Dataset Few-NERD: https://huggingface.co/datasets/DFKI-SLT/few-nerd
- Paper de referencia (arxiv:2507.11412): https://arxiv.org/abs/2507.11412
