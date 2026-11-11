# nhatkhangdtp/CKTN-ELECTRA-no-script-aware

## Resumen

CKTN-ELECTRA-no-script-aware es un checkpoint de ablación del modelo CKTN-ELECTRA, un encoder multilingüe basado en la arquitectura RemBERT y entrenado con el objetivo ELECTRA (Replaced Token Detection) para lenguas de bajos recursos de Vietnam y zonas limítrofes: cham (cjm), jemer (km), tay-nung (tyz) y nut (nut). Lo desarrolla un equipo de investigadores vietnamitas (Dinh, Vo, Doan, Ta y Lam) en el marco del artículo *Echoes Across Vietnam's Highlands, Delta, and Coast: A Multilingual Corpus for Cham, Khmer, and Tay-Nung* (arXiv:2607.08362).

El modelo no es un generador de texto ni un modelo instruido: es un extractor de características (`feature-extraction`) que produce embeddings contextuales de 576.998.912 parámetros. Su propósito es servir de base para tareas downstream (clasificación, NER, similitud semántica) sobre lenguas escasamente representadas en los corpus habituales, empleando un tokenizador compartido entre escrituras latina y brahmí.

Este checkpoint concreto existe para reproducir el estudio de ablación del artículo: se entrenó exactamente igual que el modelo completo, salvo que se desactivó el filtro de compatibilidad de escritura del muestreador de reemplazo. El autor advierte explícitamente que para uso downstream debe emplearse el modelo completo `nhatkhangdtp/CKTN-ELECTRA`, no este.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RemBERT (encoder transformer, `RemBertModel` sin cabeza de tarea) |
| Parametros totales | 576.998.912 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens (longitud de secuencia de entrenamiento) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan variantes GGUF/INT8) |
| Idiomas soportados | cjm (cham), km (jemer), tyz (tay-nung), nut (nut) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (tamano del repo: 2,3 GB) |

## Arquitectura y entrenamiento

El modelo es un encoder transformer RemBERT reutilizado como `RemBertModel` puro, sin cabeza de clasificación ni de generación. El entrenamiento sigue el esquema ELECTRA: un generador de 8 capas con embeddings compartidos propone reemplazos de tokens y un discriminador aprende a detectar qué tokens fueron sustituidos (Replaced Token Detection). Los pesos publicados corresponden al discriminador de la época 3, seleccionada por el mejor F1 de detección de tokens reemplazados en desarrollo (RTD F1 0,878; accuracy 0,969).

La configuración de preentrenamiento es idéntica a la del modelo completo: candidatos top-64 con temperatura 1,25, banda de similitud de embeddings [0,15, 0,95], AdamW con learning rate 2e-5, 6 épocas, enmascaramiento del 15 % y longitud de secuencia 512. La única diferencia de esta ablación es que se desactiva el filtro de compatibilidad de escritura del muestreador, manteniendo activos los filtros de identidad, buena formación y similitud de embeddings. En consecuencia, el generador puede sustituir, por ejemplo, una pieza en escritura jemer dentro de una frase cham o tay-nung en escritura latina, lo que introduce ruido de escritura que el discriminador debe tolerar.

## Capacidades

- Extracción de características y embeddings contextuales para cham, jemer, tay-nung y nut.
- Representaciones a nivel de token y de secuencia utilizables como entrada de clasificadores downstream (NER, POS, clasificación de texto).
- Similitud semántica entre frases y recuperación de información mediante embeddings.
- Manejo de texto en escrituras latina y brahmí dentro de un mismo vocabulario compartido.
- No soporta generación de texto, tool calling, function calling ni razonamiento multi-paso: es un encoder sin cabeza generativa.
- No dispone de modo thinking, visión ni audio.
- Capacidad multilingüe limitada a los cuatro idiomas declarados y a lo que el corpus de preentrenamiento aporte; no se documenta cobertura de vietnamita estándar ni de inglés.

## Casos de uso

- Etiquetado de secuencias (NER, POS) en jemer y cham: se congela el encoder y se entrena una cabeza lineal ligera sobre los embeddings de token, aprovechando que el modelo ya ha visto estas escrituras durante el preentrenamiento.
- Clasificación de documentos en tay-nung y nut: se usa el embedding del token `[CLS]` o un pooling medio como vector de entrada de un clasificador supervisado con pocos datos etiquetados.
- Búsqueda semántica en archivos etnográficos o lingüísticos: se indexan frases en las cuatro lenguas y se recuperan por similitud de coseno de sus embeddings.
- Análisis de similitud interlingüística: comparar representaciones de términos equivalentes en cham, jemer y tay-nung para estudiar préstamos y cognados.
- Filtrado y deduplicación de corpus: detectar pares de frases casi idénticas en corpus multilingües de bajos recursos mediante similitud de embeddings.
- Reproducción de la ablación del artículo: comparar el efecto de desactivar el filtro de compatibilidad de escritura frente al modelo completo en tareas de detección de tokens reemplazados y en downstream.
- Como inicialización para ajuste fino en tareas de traducción o generación aumentada por recuperación (RAG) en estas lenguas, siempre que se añada una cabeza adecuada.

## Benchmarks y rendimiento

| Metrica | Valor | Contexto |
|---|---|---|
| RTD F1 (desarrollo) | 0,878 | Discriminador, época 3 |
| RTD accuracy (desarrollo) | 0,969 | Discriminador, época 3 |

No se han publicado en la informacion disponible resultados de benchmarks downstream (MMLU, HumanEval, GSM8K u otros) para este checkpoint de ablación.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 2,3 GB solo de pesos, más activaciones; en la práctica unos 3-4 GB con batch pequeño y secuencia de 512.
- En fp16/bf16: alrededor de 1,2 GB de pesos, factible en GPUs consumer con 6-8 GB de VRAM.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) es suficiente; para throughput alto en producción, A100 o H100 con vLLM o TGI.
- Cabe en GPU consumer: sí, en la práctica totalidad de modelos con 6 GB o más.
- Opciones de despliegue: `transformers` (con `use_fast=False` en el tokenizador, según la model card), TGI, vLLM y ONNX Runtime. No se documentan pesos GGUF para llama.cpp u Ollama.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| CKTN-ELECTRA-no-script-aware | 577 M | 512 | cjm, km, tyz, nut | Apache 2.0 | Ablación sin filtro de escritura |
| CKTN-ELECTRA (completo) | no disponible | 512 | cjm, km, tyz, nut | Apache 2.0 | Modelo recomendado para uso downstream |
| RemBERT (original, Google) | 575 M | 512 | multilingüe amplio | Apache 2.0 | Base arquitectónica; sin especialización en lenguas de Vietnam |
| XLM-R base | 278 M | 512 | 100 idiomas | MIT | Alternativa multilingüe generalista; cobertura dudosa de cjm, tyz y nut |

## Limitaciones y advertencias

- Es un checkpoint de ablación: el propio autor indica que no debe usarse para downstream; para ello existe `nhatkhangdtp/CKTN-ELECTRA`.
- El filtro de compatibilidad de escritura desactivado introduce sustituciones entre escrituras distintas, lo que puede degradar la calidad de los embeddings en comparación con el modelo completo.
- No es un modelo generativo: no produce texto, no soporta instrucciones ni tool calling.
- Ventana de contexto fija de 512 tokens; los documentos más largos deben truncarse o dividirse.
- Cobertura lingüística muy restringida a cuatro idiomas de bajos recursos; el rendimiento fuera de ellos no está documentado.
- Riesgo de sesgo derivado de la composición del corpus de preentrenamiento, no cuantificado en la información disponible.
- Riesgo de alucinación no aplicable en sentido estricto (no genera texto), pero sí de representaciones poco fiables en dominios alejados del corpus.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de benchmarks downstream impide garantizar calidad en producción.
- Solo 25 descargas y 0 likes en el momento de la consulta: ecosistema de validación muy reducido.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nhatkhangdtp/CKTN-ELECTRA-no-script-aware
- Modelo completo recomendado: https://huggingface.co/nhatkhangdtp/CKTN-ELECTRA
- Modelo base: https://huggingface.co/ducanhdinh/CKTN-ELECTRA
- Artículo: https://arxiv.org/abs/2607.08362
- Repositorio de código y configuración: https://github.com/TracDucAnh/CKTN-ELECTRA
