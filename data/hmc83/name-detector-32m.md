# HMC83/name-detector-32m

## Resumen

Name detector 32M es un modelo de clasificación de tokens especializado en detectar nombres de personas en documentos para su posterior anonimización o revisión humana. Lo desarrolla HMC83 y está diseñado específicamente para correspondencia FOI (Freedom of Information) del Reino Unido y documentos del sector público: cartas, correos, actas, registros, informes y páginas escaneadas. Con 32 millones de parámetros, resuelve el problema de identificar nombres propios de forma fiable y con bajas tasas de falsos positivos, algo crítico en flujos de redacción de datos personales.

El modelo parte de los pesos públicos de `jhu-clsp/ettin-encoder-32m`, un encoder de arquitectura ModernBERT de 10 capas y dimensión 384, y se entrena por destilación desde un profesor ModernBERT-base de 149M. Su contexto operativo es de ventanas de hasta 2.046 tokens con 256 de solapamiento, lo que permite procesar documentos largos por tramos manteniendo coherencia entre ellos.

Es relevante ahora porque ofrece un rendimiento cercano al de su profesor (149M) con una cuarta parte de los parámetros, y supera ampliamente a soluciones genéricas como Presidio con spaCy en la tarea concreta de detección de nombres, con una brecha de rendimiento entre grupos demográficos de solo 1,0 punto frente a los 28 puntos de Presidio.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder (ModernBERT), 10 capas × 384 de dimensión |
| Parámetros totales | 32.031.746 (19,3M en la tabla de embeddings) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | Ventanas de hasta 2.046 tokens con 256 de solapamiento |
| Tipos de cuantización | No disponible (se distribuye en precisión completa: ONNX y safetensors, 128 MB) |
| Idiomas soportados | Inglés (variante del Reino Unido) |
| Licencia | MIT |
| Formato de pesos | safetensors, ONNX |

## Arquitectura y entrenamiento

El modelo es un encoder transformer de arquitectura ModernBERT con 10 capas y dimensión oculta de 384, inicializado desde los pesos públicos de Ettin 32M. Se entrena mediante destilación de conocimiento desde un profesor ModernBERT-base de 149M previamente ajustado para etiquetar tokens de nombres de personas. El entrenamiento consiste en tres pasadas para imitar las predicciones del profesor sobre texto de dominio.

Los datos de entrenamiento del profesor incluyen NVIDIA Nemotron-PII, sentencias judiciales del Text Anonymization Benchmark, Few-NERD y texto de dominio inventado: plantillas, documentos generados con iniciales, fallos de OCR y nombres que son palabras comunes, además de documentos del sector público británico. El alumno añade 728 copias de 91 documentos publicados por 40 organismos públicos del Reino Unido bajo Open Government Licence, con cada nombre real sustituido por uno inventado, y ventanas largas para aprender a usar listas de asistentes situadas muy por encima de la línea que se está leyendo. El umbral de decisión (0,2) se fijó por una regla predefinida usando solo conjuntos de desarrollo. No se usó correspondencia FOI real ni documentos de test reales durante el entrenamiento.

Una innovación destacable es el manejo de iniciales definidas en el documento: el código enmascara iniciales como "AR" cuando aparecen tras "Anjali Raval (AR)". También procesa textos largos en ventanas solapadas y enmascara una palabra completa cuando cualquier fragmento supera el umbral.

## Capacidades

- Detección de nombres de personas: nombres completos, nombres de pila, apellidos e iniciales.
- Clasificación de tokens (token-classification) para anonimización y redacción de PII.
- Procesamiento de documentos largos mediante ventanas solapadas de hasta 2.046 tokens.
- Manejo de iniciales definidas en el propio documento.
- Distinción opcional entre solicitante y autoridad: `findings(text, requester="…", authority="…")` permite no enmascarar nunca el nombre de la autoridad y enmascarar siempre el del solicitante.
- Deja sin enmascarar títulos como "Dr".
- Inferencia sin PyTorch mediante onnxruntime, tokenizers y numpy.
- Integración con transformers mediante pipeline de token-classification.
- No soporta tool calling, agentes, visión, audio ni modo thinking; es un modelo discriminativo de etiquetado, no generativo.

## Casos de uso

- Redacción de correspondencia FOI: el modelo identifica nombres de ciudadanos y funcionarios en cartas y correos para enmascararlos antes de la publicación, con una tasa de detección del 100% en 100 solicitudes FOI reales (132 de 132 nombres).
- Revisión asistida de documentos del sector público: actas, registros e informes se procesan por ventanas de 2.046 tokens para marcar nombres y pasarlos a revisión humana, reduciendo el trabajo manual frente a Presidio.
- Anonimización de sentencias judiciales: con F1 de 93,2 sobre el conjunto TAB (court judgments), es adecuado para pipelines de publicación de resoluciones con datos personales suprimidos.
- Procesamiento de documentos escaneados con fallos de OCR: en 64 documentos de test con errores de maquetación y OCR añadidos detecta 1.195 de 1.197 nombres.
- Cumplimiento de protección de datos en flujos automatizados: al ser MIT y ejecutarse con onnxruntime sin PyTorch, se puede desplegar en entornos ligeros para redactar PII en lotes de documentos.
- Detección de nombres en registros sintéticos: con F1 de 98,3 en Nemotron-PII, sirve para validar o generar datos sintéticos anonimizados.
- Preprocesado para pipelines de NLP: como paso previo a otros modelos, enmascara nombres antes de enviar texto a sistemas externos.

## Benchmarks y rendimiento

F1 sobre los caracteres de nombres de personas. Otros documentos de TAB y Nemotron-PII se usaron en entrenamiento. PrivacyBench se puntúa con su propia regla de solapamiento en nombres y apellidos.

| Test set | Presidio estándar | Profesor (149M) | Este modelo |
|---|---|---|---|
| OntoNotes 5 (géneros mixtos) | 92,2 | 92,9 | 91,5 |
| WNUT-17 (redes sociales) | 49,1 | 64,1 | 61,3 |
| TAB (sentencias judiciales) | 81,9 | 93,6 | 93,2 |
| Nemotron-PII (registros sintéticos) | 78,3 | 98,5 | 98,3 |
| Gretel PII (documentos sintéticos) | 70,6 | 92,4 | 89,3 |
| AI4Privacy 300k (inglés) | 36,3 | 82,1 | 79,8 |
| Tonic PrivacyBench (emails, chat y documentos sintéticos) | 87,9 | 95,5 | 92,8 |

En 86 documentos reales publicados por organismos públicos del Reino Unido, con cada nombre marcado por dos personas, el modelo encuentra 1.611 de 1.628 nombres y enmascara erróneamente 1.137 caracteres fuera de ellos. Su profesor encuentra 1.624; Presidio estándar encuentra 929 y enmascara erróneamente 5.063 caracteres. En 100 solicitudes FOI reales elegidas al azar encuentra 132 de 132 nombres.

En el test de nombres de distintos orígenes (179 mensajes FOI reescritos 24 veces con nombres de doce grupos), el modelo encuentra 7.176 de 7.248 nombres, con entre 98,3% y 99,3% en cada grupo (brecha de 1,0 punto). Presidio estándar mostró una brecha de 28 puntos en el mismo test.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; el modelo completo ocupa 128 MB en precisión completa (ONNX o safetensors), por lo que cabe en cualquier GPU consumer e incluso en CPU.
- GPU recomendadas: no requiere GPU dedicada; funciona en CPU. Cualquier GPU consumer (RTX 3060, RTX 4090, etc.) es más que suficiente.
- Cabe en consumer GPU: sí, en todas, y también en CPU y entornos embebidos.
- Opciones de despliegue: onnxruntime (recomendado por el autor, sin PyTorch), transformers con pipeline de token-classification, y cualquier runtime compatible con ONNX.
- Latencia y throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | F1 TAB | F1 Nemotron-PII | Licencia |
|---|---|---|---|---|---|
| Name detector 32M | 32M | 2.046 tokens (ventanas) | 93,2 | 98,3 | MIT |
| Profesor ModernBERT-base (149M) | 149M | No disponible | 93,6 | 98,5 | No disponible |
| Presidio + spaCy en_core_web_lg | No disponible | No disponible | 81,9 | 78,3 | No disponible (open source) |

El modelo logra un rendimiento muy cercano al de su profesor de 149M con menos de una cuarta parte de los parámetros, y supera ampliamente a Presidio con spaCy en todos los conjuntos de test, especialmente en dominios específicos como sentencias judiciales y registros sintéticos.

## Limitaciones y advertencias

- Pierde algunos nombres, sobre todo iniciales: 16 de los 17 que falló en los documentos reales eran dos o tres letras mayúsculas.
- Está diseñado para inglés del Reino Unido; los nombres en texto en galés se detectan con menos fiabilidad y otros idiomas no están probados.
- A veces enmascara abreviaturas, letras de estado, palabras de rol como "Clerk" y organizaciones o lugares con nombre de persona.
- Pierde más nombres de pila en minúscula en conversaciones informales.
- Solo detecta nombres; debe combinarse con patrones para correos electrónicos, teléfonos y números de referencia.
- El umbral de 0,2 puede ajustarse: uno más bajo encuentra más nombres pero enmascara más texto que no lo es.
- La licencia MIT permite uso comercial sin restricciones conocidas.
- No se han documentado sesgos más allá del análisis de brecha entre grupos demográficos, que es de 1,0 punto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/HMC83/name-detector-32m
- Modelo base Ettin 32M: https://huggingface.co/jhu-clsp/ettin-encoder-32m
- ModernBERT-base (profesor): https://huggingface.co/answerdotai/ModernBERT-base
- Paper de referencia (arxiv:2507.11412): https://arxiv.org/abs/2507.11412
- Dataset NVIDIA Nemotron-PII: https://huggingface.co/datasets/nvidia/Nemotron-PII
- Dataset DFKI-SLT/few-nerd: https://huggingface.co/datasets/DFKI-SLT/few-nerd
