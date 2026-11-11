# HMC83/name-detector-68m

## Resumen

Name detector 68M es un modelo de clasificación de tokens especializado en la detección de nombres de personas en documentos, desarrollado por el usuario HMC83. Su propósito es identificar nombres propios para poder enmascararlos o remitirlos a revisión humana, en el contexto de la correspondencia de solicitudes de acceso a la información (FOI) del Reino Unido y documentos del sector público (cartas, correos, actas, registros, informes y páginas escaneadas). Se distribuye bajo licencia MIT y está pensado para entornos de redacción de datos personales (PII redaction).

El modelo parte de los pesos públicos de Ettin 68M (jhu-clsp/ettin-encoder-68m), un encoder de arquitectura ModernBERT de 19 capas y dimensión 512, y se ha afinado mediante destilación de un profesor ModernBERT-base de 149M parámetros. Cuenta con 68.408.322 parámetros totales, de los cuales 25,8 millones corresponden a la tabla de embeddings de tokens, y ocupa unos 274 MB en precisión completa (ONNX o safetensors). Su ventana de contexto operativa es de hasta 2.046 tokens con solapamiento de 256.

Su relevancia actual radica en que ofrece un rendimiento cercano al de su profesor de 149M con la mitad de parámetros, superando ampliamente a soluciones genéricas como Presidio con spaCy en la tarea específica de detección de nombres, y con una brecha de equidad entre grupos demográficos de solo 0,5 puntos frente a los 28 puntos de Presidio.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ModernBERT (encoder transformer), 19 capas × 512 |
| Parámetros totales | 68.408.322 (25,8 M en embeddings de tokens) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | Ventanas de hasta 2.046 tokens con solapamiento de 256 |
| Tipos de cuantización | No disponible (se distribuye en precisión completa ONNX y safetensors) |
| Idiomas soportados | Inglés (en); galés con menor fiabilidad; otros idiomas no probados |
| Licencia | MIT |
| Formato de pesos | safetensors y ONNX |

## Arquitectura y entrenamiento

El modelo es un encoder transformer de arquitectura ModernBERT con 19 capas y dimensión oculta de 512, inicializado desde los pesos públicos de Ettin 68M (MIT, Johns Hopkins University). Se entrena como clasificador de tokens (token-classification) para etiquetar los tokens que componen nombres de personas.

El entrenamiento se realizó por destilación desde un profesor ModernBERT-base de 149M parámetros, previamente afinado para etiquetar tokens de nombres de personas. El texto de entrenamiento del profesor incluyó NVIDIA Nemotron-PII, sentencias judiciales del Text Anonymization Benchmark, Few-NERD y texto de dominio inventado: plantillas, documentos generados que cubren iniciales, fallos de OCR y nombres que son palabras comunes, además de documentos del sector público británico. El modelo alumno se entrenó durante tres pasadas para imitar al profesor, leyendo su texto de entrenamiento en ventanas de hasta 512 tokens, con cada documento reescrito con nombres doce veces. El umbral de decisión (0,2, valor `tau` en `namecfg.json`) se fijó mediante una regla predefinida sobre conjuntos de desarrollo únicamente. No se utilizó correspondencia FOI real ni documentos de test reales durante el entrenamiento. Solo se realizó una ejecución de entrenamiento, por lo que no se ha medido la variación entre ejecuciones.

## Capacidades

- Detección de nombres de personas: nombres completos, nombres de pila, apellidos e iniciales.
- Enmascaramiento de palabras completas cuando cualquier fragmento supera el umbral configurado.
- Detección de iniciales definidas en el documento (por ejemplo, "AR" tras "Anjali Raval (AR)").
- Procesamiento de textos largos mediante ventanas solapadas de hasta 2.046 tokens.
- Soporte opcional de nombres de solicitante y autoridad: el nombre de la autoridad nunca se enmascara y el del solicitante siempre se enmascara.
- Exclusión de títulos como "Dr" del enmascaramiento.
- Inferencia sin PyTorch mediante onnxruntime, tokenizers y numpy (código incluido en el repositorio).
- Integración con la librería transformers mediante pipeline de token-classification.
- Capacidad de manejar documentos con fallos de maquetación y OCR.
- No soporta tool calling, agentes, visión, audio ni modo de razonamiento; es un modelo exclusivamente de etiquetado de tokens.

## Casos de uso

- Redacción de PII en correspondencia FOI: el modelo identifica nombres de personas en cartas y correos de solicitudes de acceso a la información para enmascararlos antes de su publicación, con una tasa de detección de 132 de 132 nombres en solicitudes FOI reales.
- Anonimización de actas y registros del sector público: procesa documentos administrativos (minutas, registros, informes) en ventanas de 2.046 tokens, adecuado para flujos de publicación de documentos oficiales.
- Preprocesamiento de documentos escaneados: su robustez ante fallos de OCR (detecta 1.195 de 1.197 nombres en 64 documentos de test con fallos de maquetación y OCR) lo hace apto para pipelines de digitalización.
- Revisión asistida por humanos: el modelo marca candidatos a nombre para que un revisor humano confirme el enmascaramiento, reduciendo el volumen de texto a revisar manualmente.
- Cumplimiento normativo y protección de datos: integrable en flujos de cumplimiento para detectar nombres antes de compartir documentos, combinándolo con patrones para correos, teléfonos y números de referencia.
- Procesamiento por lotes de bajo coste: con 68M parámetros y 274 MB en precisión completa, puede ejecutarse en CPU mediante onnxruntime para grandes volúmenes de documentos sin GPU.
- Auditoría de equidad en redacción: su brecha de 0,5 puntos entre grupos demográficos (frente a 28 de Presidio) lo hace útil para validar que los sistemas de anonimización no discriminan por origen del nombre.

## Benchmarks y rendimiento

F1 sobre los caracteres de nombres de personas. Otros documentos de TAB y Nemotron-PII se usaron en entrenamiento. PrivacyBench se puntúa con su propia regla de solapamiento sobre nombres y apellidos.

| Test set | Presidio estándar | Profesor (149M) | Este modelo |
|---|---|---|---|
| OntoNotes 5 (géneros mixtos) | 92,2 | 92,9 | 92,6 |
| WNUT-17 (redes sociales) | 49,1 | 64,1 | 63,8 |
| TAB (sentencias judiciales) | 81,9 | 93,6 | 94,0 |
| Nemotron-PII (registros sintéticos) | 78,3 | 98,5 | 98,2 |
| Gretel PII (documentos sintéticos) | 70,6 | 92,4 | 91,3 |
| AI4Privacy 300k (inglés) | 36,3 | 82,1 | 83,0 |

Resultados adicionales en documentos reales:

| Conjunto | Presidio estándar | Profesor (149M) | Este modelo |
|---|---|---|---|
| 86 documentos reales de organismos públicos (1.628 nombres) | 929 encontrados, 5.063 caracteres mal enmascarados | 1.624 encontrados | 1.619 encontrados, 880 caracteres mal enmascarados |
| 100 solicitudes FOI reales (132 nombres) | No disponible | No disponible | 132 de 132 |
| 64 documentos con fallos de maquetación y OCR (1.197 nombres) | No disponible | No disponible | 1.195 de 1.197 |
| 179 mensajes FOI reescritos con 12 orígenes (7.248 nombres) | Brecha de 28 puntos entre grupos | No disponible | 7.192 encontrados, entre 98,8 % y 99,3 % por grupo (brecha 0,5 puntos) |

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo de 68M parámetros (274 MB en precisión completa), cabe holgadamente en cualquier GPU consumer; en FP16 requiere aproximadamente 0,14 GB de pesos, más memoria para activaciones.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM; RTX 3060, RTX 4090, A100 o H100 son más que suficientes. También puede ejecutarse en CPU.
- Cabe en GPU consumer: sí, en cualquier GPU consumer moderna e incluso en hardware de gama baja.
- Opciones de despliegue: onnxruntime (vía el código incluido en el repositorio, sin PyTorch), transformers con pipeline de token-classification, y cualquier runtime compatible con ONNX o safetensors. No se documentan integraciones específicas con vLLM, llama.cpp, Ollama o TGI (estos están orientados a modelos generativos).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Rendimiento (OntoNotes 5, F1) |
|---|---|---|---|---|---|
| Name detector 68M | 68,4 M | 2.046 tokens | Detección de nombres (destilado) | MIT | 92,6 |
| Profesor ModernBERT-base | 149 M | No disponible | Detección de nombres | No disponible | 92,9 |
| Presidio estándar (spaCy en_core_web_lg) | No disponible | No disponible | NER genérico (PERSON) | No disponible | 92,2 |

El modelo iguala prácticamente a su profesor de 149M con menos de la mitad de parámetros y supera a Presidio en la mayoría de conjuntos, especialmente en dominios específicos (TAB: 94,0 frente a 81,9; AI4Privacy: 83,0 frente a 36,3) y en equidad entre grupos demográficos.

## Limitaciones y advertencias

- Pierde algunos nombres, sobre todo iniciales: 8 de los 9 nombres no detectados en documentos reales eran dos o tres letras mayúsculas.
- Está diseñado para inglés del sector público británico; los nombres en texto en galés se detectan con menor fiabilidad y otros idiomas no se han probado.
- A veces enmascara abreviaturas, letras de estado, palabras de rol como "Clerk" y organizaciones o lugares con nombre de persona.
- Pierde más nombres de pila en minúscula en conversaciones informales.
- Solo detecta nombres; debe combinarse con patrones para direcciones de correo, teléfonos y números de referencia.
- Solo se realizó una ejecución de entrenamiento, por lo que no se ha medido la variación entre ejecuciones.
- Licencia MIT: permite uso comercial, pero se recomienda mantener la atribución a Ettin 68M y al profesor ModernBERT-base.
- Riesgo de alucinación no aplica directamente (no es generativo), pero sí existe riesgo de falsos positivos y falsos negativos en el etiquetado.
- El umbral de 0,2 puede ajustarse: un umbral más bajo encuentra más nombres pero enmascara más texto que no es nombre.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/HMC83/name-detector-68m
- Modelo base Ettin 68M: https://huggingface.co/jhu-clsp/ettin-encoder-68m
- Profesor ModernBERT-base: https://huggingface.co/answerdotai/ModernBERT-base
- Paper de referencia (arxiv:2507.11412): https://arxiv.org/abs/2507.11412
- Dataset NVIDIA Nemotron-PII: https://huggingface.co/datasets/nvidia/Nemotron-PII
- Dataset DFKI-SLT/few-nerd: https://huggingface.co/datasets/DFKI-SLT/few-nerd
