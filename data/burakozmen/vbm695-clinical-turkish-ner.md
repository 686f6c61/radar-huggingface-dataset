# burakozmen/vbm695-clinical-turkish-ner

## Resumen

VBM695 es un modelo de reconocimiento de entidades nombradas (NER) para turco clínico, desarrollado por burakozmen en el marco de un proyecto de máster del Instituto de Informática de la Universidad de Hacettepe (asignatura VBM695, Ingeniería de Datos y Conocimiento). Se trata de un ajuste fino (fine-tuning) de `dbmdz/bert-base-turkish-cased` orientado a la seudonimización local de transcripciones de sesiones de psicoterapia antes de enviarlas a servicios LLM en la nube. El modelo resuelve un problema concreto de privacidad: sustituir nombres de personas, organizaciones y lugares por marcadores del tipo `[PERSON_1]`, `[ORG_1]` o `[LOC_1]` sin salir del entorno del terapeuta.

Arquitectura BERT encoder-only con 110.032.135 parámetros (aproximadamente 110 M), etiquetado BIO de 7 clases (O, B/I-PER, B/I-ORG, B/I-LOC) y licencia MIT. El interés actual reside en su enfoque de "edge local fiable": un modelo pequeño, rápido (5,33 ms por turno de conversación, 394,24 ms por sesión completa) y con un umbral de decisión calibrado a τ = 0,35 para minimizar falsos negativos, es decir, nombres propios que se escapan sin enmascarar en datos de salud.

La model card reporta métricas muy altas en su propio conjunto de validación (F1 de entidad del 99,77 % en el conjunto clínico realista y del 100 % en el conjunto limpio), aunque se trata de evaluaciones internas del autor y no de benchmarks públicos independientes. El modelo solo soporta turco y está pensado como componente de un pipeline de anonimización, no como modelo generativo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder-only (BERT base, variante cased para turco) |
| Parámetros totales | 110.032.135 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la información proporcionada (el modelo base `dbmdz/bert-base-turkish-cased` es de 512 tokens, pero no se confirma en la ficha) |
| Tipos de cuantización | No disponible en la información proporcionada (pesos en safetensors; cuantización dinámica INT8 posible vía PyTorch, no documentada por el autor) |
| Idiomas soportados | Turco (tr) |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Tarea | Token classification (NER, esquema BIO de 7 clases) |
| Modelo base | `dbmdz/bert-base-turkish-cased` |
| Tamaño del repositorio | 0,4 GB |
| Umbral de decisión recomendado | τ = 0,35 |

## Arquitectura y entrenamiento

El modelo es un ajuste fino supervisado de `dbmdz/bert-base-turkish-cased`, un BERT base con vocabulario y casing adaptados al turco. Sobre la cabeza de clasificación de tokens se aplica un esquema BIO de 7 etiquetas que cubre personas (B/I-PER), organizaciones (B/I-ORG) y localizaciones (B/I-LOC), además de la clase O para tokens fuera de entidad. No se documenta en la información disponible el número exacto de tokens de entrenamiento, la composición detallada del corpus ni si se aplicaron técnicas de RLHF o DPO (no procede en un encoder de clasificación).

Los datos de entrenamiento provienen de dos fuentes declaradas: `burakozmen/vbm695-clinical-turkish-corpus` (corpus clínico propio de transcripciones de psicoterapia) y `unimelb-nlp/wikiann` (corpus NER multilingüe de Wikipedia, usado previsiblemente para reforzar el reconocimiento de entidades generales). La innovación técnica destacable no está en la arquitectura, sino en el diseño del pipeline: adaptación de dominio al registro clínico, robustez frente a transcripciones automáticas de voz (STT, concretamente Faster-Whisper) con minúsculas y apóstrofos ausentes, y una calibración explícita del umbral de decisión orientada a recall. El autor reporta una comparativa de umbrales (0,25, 0,35 y 0,50) y selecciona τ = 0,35 como compromiso óptimo entre recall y precisión en el conjunto de validación realista.

## Capacidades

- Reconocimiento de entidades nombradas en turco clínico: personas, organizaciones y localizaciones en transcripciones de sesiones de psicoterapia.
- Desambiguación de palabras homónimas del turco que funcionan tanto como nombre propio como concepto común (Umut, Duygu, Deniz, Barış, Sevgi, Savaş): el autor reporta 100 % de acierto en la clase O (546/546) y 100 % de sensibilidad en la clase PER (49/49) con τ = 0,35.
- Robustez ante texto procedente de STT: tolera minúsculas y ausencia de apóstrofos en transcripciones ruidosas.
- Etiquetado a nivel de token con esquema BIO, apto para post-procesado de agrupación de entidades y sustitución por marcadores seudónimos.
- No soporta generación de texto, tool calling, razonamiento multi-paso ni capacidades multimodales: es un encoder de clasificación.
- Multilingüismo limitado: solo turco.

## Casos de uso

- Seudonimización previa a LLM en la nube: el modelo detecta nombres, organizaciones y lugares en la transcripción y los sustituye por `[PERSON_n]`, `[ORG_n]` y `[LOC_n]` antes de enviar el texto a GPT-4o o Claude, de modo que el proveedor nunca recibe datos identificativos. Es el caso de uso principal declarado por el autor.
- Cumplimiento de protección de datos en salud mental: integrado en el software de un gabinete de psicoterapia, permite almacenar y analizar sesiones con datos personales enmascarados de forma automática, reduciendo el riesgo de exposición en registros y backups.
- Preprocesado de transcripciones automáticas: al tolerar salida de Faster-Whisper con minúsculas y sin apóstrofos, encaja directamente tras el paso de STT sin necesidad de normalización manual previa.
- Anonimización de corpus para investigación: permite construir conjuntos de datos clínicos publicables o compartibles con terceros, sustituyendo identificadores por marcadores consistentes que preservan la estructura conversacional.
- Seguimiento de evolución terapéutica: al conservar la estructura de turnos y seudónimos estables, un sistema posterior puede analizar la evolución del paciente entre sesiones sin acceder a su identidad real.
- Filtrado de PII en pipelines de logging: como clasificador rápido (5,33 ms por turno), puede ejecutarse en línea sobre registros de aplicaciones clínicas para detectar y marcar datos personales antes de que se escriban en sistemas de observabilidad.
- Componente de un sistema de "edge local fiable": con 110 M de parámetros y 0,4 GB de pesos, se despliega en una máquina de terapeuta o en un servidor local pequeño sin depender de APIs externas.

## Benchmarks y rendimiento

Los únicos datos disponibles son las métricas de validación internas reportadas por el autor. No se han publicado resultados en benchmarks públicos independientes (MMLU, HumanEval, GSM8K u otros no aplican a esta tarea).

Conjunto de validación clínico realista (estándar + 33 % de transcripciones STT ruidosas en minúsculas):

| Umbral τ | Precisión de entidad | Recall de entidad | F1 de entidad | F2 (sesgado a recall) | Tokens PII no detectados (FN) | Enmascarados de más (FP) |
|---|---|---|---|---|---|---|
| 0,25 | 99,87 % | 99,79 % | 99,83 % | 99,81 % | 2 | 0 |
| 0,35 (elegido) | 99,79 % | 99,75 % | 99,77 % | 99,75 % | 3 | 0 |
| 0,50 | 99,70 % | 99,70 % | 99,70 % | 99,70 % | 4 | 0 |

Conjunto de validación limpio (`val_ner_bio.jsonl`, 24 sesiones, 1.776 turnos):

| Umbral τ | Precisión de entidad | Recall de entidad | F1 de entidad | Tokens PII no detectados (FN) | Enmascarados de más (FP) |
|---|---|---|---|---|---|
| 0,25 | 100,00 % | 100,00 % | 100,00 % | 0 | 0 |
| 0,35 | 100,00 % | 100,00 % | 100,00 % | 0 | 0 |
| 0,50 | 100,00 % | 100,00 % | 100,00 % | 0 | 0 |

Latencia reportada por el autor: 5,33 ms por turno de conversación y 394,24 ms por sesión completa.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,5 GB en FP32 (110 M de parámetros) y en torno a 0,3 GB en FP16; el repositorio completo ocupa 0,4 GB.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM es suficiente; una RTX 3060, RTX 4060 o incluso una GTX 1650 bastan para inferencia. Para lotes grandes, A100 o H100 no aportan ventajas significativas frente a GPUs de consumo.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna e incluso en iGPU con suficiente memoria compartida.
- Despliegue: `transformers` con `pipeline("token-classification")`, TorchScript o ONNX Runtime para reducir latencia; también es viable servir con Text Embeddings Inference o FastAPI propio. vLLM y TGI no son adecuados para un encoder de clasificación de este tamaño.
- Latencia y throughput: el autor reporta 5,33 ms por turno y 394,24 ms por sesión completa; el throughput exacto en tokens por segundo no está disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| VBM695 clinical-turkish-ner | 110 M | No disponible | NER clínico turco (BIO, 7 clases) | MIT | Hugging Face |
| `dbmdz/bert-base-turkish-cased` | 110 M | 512 tokens (modelo base) | Modelo de lenguaje enmascarado turco | MIT | Hugging Face |
| `savasy/bert-base-turkish-ner-cased` | ~110 M | 512 tokens | NER general en turco (pipeline token-classification) | No disponible en la información proporcionada | Hugging Face |
| `akdeniz27/bert-base-turkish-cased-ner` | ~110 M | 512 tokens | NER general en turco | No disponible en la información proporcionada | Hugging Face |

La comparación cuantitativa de rendimiento frente a estas alternativas no está disponible: el autor no publica métricas comparativas contra otros modelos NER turcos, y las métricas internas de VBM695 no son directamente comparables con las de benchmarks públicos de NER general. La diferencia principal frente a los modelos NER turcos genéricos es la adaptación al dominio clínico y la calibración del umbral para priorizar recall en datos de salud.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados por el autor; al entrenarse sobre un corpus clínico propio y WikiANN, puede heredar sesgos de dominio y de composición del corpus, especialmente en la distribución de nombres y localizaciones.
- Riesgo de alucinación: no aplica en sentido generativo, pero sí existe riesgo de falsos negativos (PII no detectada) y de falsos positivos (términos comunes enmascarados como entidades); el autor reporta 3 tokens PII no detectados en el conjunto realista con τ = 0,35.
- Limitaciones de contexto e idioma: solo turco; la longitud máxima de entrada no se especifica en la información disponible, aunque el modelo base está limitado a 512 tokens, lo que obliga a trocear sesiones largas.
- Restricciones de licencia: MIT permite uso comercial y modificación, pero el autor no ofrece garantías ni asume responsabilidad sobre el uso en entornos clínicos regulados.
- Caveat para producción: las métricas del 99,7-100 % proceden de conjuntos de validación internos del autor (24 sesiones y 1.776 turnos en el conjunto limpio), no de evaluaciones independientes; deben validarse sobre los datos reales de cada despliegue antes de confiar en la seudonimización.
- El modelo es un componente de anonimización, no un sustituto de revisión humana: en entornos sanitarios conviene mantener una verificación manual o un paso de auditoría sobre las entidades detectadas.
- No se documentan los datos de entrenamiento en detalle (número de tokens, proporción entre corpus clínico y WikiANN), lo que dificulta evaluar la cobertura de dominios y la reproducibilidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/burakozmen/vbm695-clinical-turkish-ner
- Modelo base: https://huggingface.co/dbmdz/bert-base-turkish-cased
- Corpus clínico declarado: https://huggingface.co/datasets/burakozmen/vbm695-clinical-turkish-corpus
- Corpus NER multilingüe: https://huggingface.co/datasets/unimelb-nlp/wikiann
- Repositorio del modelo base BERT: https://github.com/google-research/bert
- Paper de BERT: https://arxiv.org/abs/1810.04805
