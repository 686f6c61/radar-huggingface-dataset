# AIconjured/Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-MTP-GGUF-Q8-NVFP4

## Resumen

Este modelo es una re-cuantización a nivel de tensor en formato NVFP4 mixto del modelo HauhauCS Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-MTP-GGUF, que a su vez deriva del Qwen3.8-27B de Qwen. El autor, AIconjured, ha tomado la versión Q8_K_P (31,46 GB, 9,21 bpw) y la ha re-cuantizado a un perfil mixto NVFP4/Q8_0/F32/F16 de 17,10 GB (5,00 bpw), reduciendo el consumo de VRAM en unos 15 GB. El objetivo es permitir la inferencia local en tarjetas NVIDIA Blackwell de 24 GB (RTX 5060 Ti, 5070, 5080) aprovechando los núcleos tensoriales FP4 nativos de esa arquitectura.

El modelo conserva todas las capacidades del original: es un transformer denso de 27B parámetros con encoder de visión, cabezal MTP/NextN para decodificación especulativa, y el perfil "Aggressive" de HauhauCS que elimina comportamientos de rechazo (0/465 rechazos en pruebas). La re-cuantización mantiene en alta precisión los tensores críticos para la calidad (embeddings, lm_head, estado recurrente DeltaNet, normas y cabezal MTP), mientras que las matrices de cómputo grandes (FFN, proyecciones de atención, salida DeltaNet) se convierten a NVFP4. El resultado es un modelo que cabe en GPUs de consumo recientes con calidad cercana a Q5, según el autor.

La relevancia de este lanzamiento radica en que demuestra una vía práctica para ejecutar modelos de 27B con visión y decodificación especulativa en hardware de gama media-alta de consumo, sin sacrificar los componentes más sensibles a la precisión. Es una opción interesante para desarrolladores que quieran desplegar un modelo local con capacidades multimodales y sin filtros de contenido, siempre que la licencia y los riesgos de uso sean aceptables.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso con encoder de vision, cabezal MTP/NextN y estado recurrente DeltaNet |
| Parametros totales | 27B (segun el nombre del modelo; el archivo safetensors del repo indica 1.863.907.840, dato que no coincide y probablemente sea un error del repositorio) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 32K (configuracion recomendada en el Modelfile de Ollama; el contexto nativo del modelo base no se especifica) |
| Tipos de cuantizacion | NVFP4 mixto (NVFP4, Q8_0, F32, F16) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo base es Qwen3.8-27B, un transformer denso de 27B parámetros con encoder de visión y un cabezal MTP (Multi-Token Prediction, también llamado NextN) que permite decodificación especulativa. HauhauCS realizó un fine-tuning "uncensored" con perfil "Aggressive" sobre este modelo, eliminando comportamientos de rechazo y reduciendo el preámbulo en respuestas a prompts difíciles. El resultado se distribuyó como GGUF en varias cuantizaciones, incluida la Q8_K_P de 9,21 bpw que sirve de fuente para esta re-cuantización.

La re-cuantización de AIconjured no modifica los pesos ni el dataset: es una conversión a nivel de tensor. Se generó una matriz de importancia con `llama-imatrix` sobre 45 fragmentos de calibración (código, prosa, razonamiento, JSON y prompts agénticos) y se aplicó `llama-quantize --allow-requantize --imatrix --tensor-type-file` con un perfil que asigna NVFP4 a las 371 matrices de cómputo grandes (FFN, atención, DeltaNet), Q8_0 a los 115 tensores de calidad (embeddings, lm_head, estado recurrente, proyección MTP), F32 a las 360 normas y parámetros pequeños, y F16 a los 16 tensores de atención del cabezal MTP de la capa 64. El objetivo es preservar la tasa de aceptación del FastMTP (que multiplica por 3 la velocidad) y la calidad de salida.

## Capacidades

- Generación de texto con respuestas directas y sin rechazos (perfil "Aggressive" de HauhauCS, 0/465 refusals en pruebas del autor).
- Visión: incluye un proyector multimodal (mmproj) en BF16 que permite entrada de imágenes y vídeo.
- Decodificación especulativa MTP/NextN nativa, acelerada por el sidecar FastMTP de HauhauCS (opcional, requiere parche del runtime).
- Razonamiento multi-paso y generación de código, heredado del modelo base Qwen3.8-27B.
- Soporte de tool calling y agentes, según las capacidades del modelo base (no verificado en esta re-cuantización).
- Multilingüe, aunque los idiomas concretos no se especifican en la documentación disponible.

## Casos de uso

- Asistente local sin censura para investigación: el modelo responde sin rechazos a prompts delicados, lo que lo hace útil para estudiar comportamientos de modelos sin filtros en entornos controlados. Se desplegaría con Ollama o llama.cpp en una GPU Blackwell de 24 GB.
- Generación de código con contexto largo: con 32K de contexto configurado, puede mantener conversaciones extensas sobre repositorios o documentación técnica. La decodificación especulativa MTP acelera la generación en tareas de autocompletado.
- Análisis de imágenes y vídeo en local: el proyector BF16 permite pasar imágenes al modelo para descripciones, OCR o razonamiento visual sin depender de APIs externas. Útil en entornos con requisitos de privacidad.
- Prototipado de agentes con tool calling: el modelo base soporta llamadas a funciones, y esta cuantización mantiene los tensores críticos en alta precisión, lo que lo hace adecuado para probar pipelines agénticos en local antes de escalar a modelos más grandes.
- Chat conversacional de baja latencia en hardware de consumo: con 17,10 GB de peso, cabe en una RTX 5070 o 5080 con margen para contexto amplio, permitiendo un asistente personal con respuestas rápidas gracias al FastMTP.
- Evaluación de calidad de cuantización NVFP4: este modelo sirve como banco de pruebas para comparar la calidad de NVFP4 frente a Q8 o Q5 en tareas de razonamiento y generación, dado que mantiene los tensores de anclaje en alta precisión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor menciona que la calidad es "cercana a Q5" basándose en el diseño de la re-cuantización, pero no aporta métricas numéricas (MMLU, HumanEval, GSM8K, etc.). Tampoco se proporcionan datos de throughput o latencia medidos.

## Requisitos de hardware

- VRAM estimada: 17,10 GB para el archivo principal, más 931 MB del proyector de visión y 903 MB del sidecar FastMTP si se usan. Con contexto de 32K, se recomienda una GPU con al menos 24 GB de VRAM.
- GPUs compatibles: NVIDIA Blackwell (RTX 5060 Ti, 5070, 5080) por el soporte nativo de FP4. En GPUs sin núcleos FP4 (Ampere, Ada Lovelace), el modelo podría ejecutarse pero sin la aceleración de los tensor cores FP4, con rendimiento inferior.
- No cabe en GPUs de 16 GB o menos con contexto amplio; con contexto reducido (8K) podría intentarse en una RTX 4080 o 4090, pero no está garantizado.
- Opciones de despliegue: Ollama (con Modelfile dual para modelo y proyector), llama.cpp, y cualquier runtime compatible con GGUF (vLLM, LM Studio, etc.). El sidecar FastMTP requiere el parche de runtime de HauhauCS.
- Latencia y throughput: no disponibles. Se espera que la decodificación especulativa MTP acelere la generación, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-27B (base) | 27B | No especificado | BF16, FP8, etc. | Apache 2.0 (segun Qwen) | HuggingFace |
| HauhauCS Qwen3.8-27B-Uncensored-Aggressive-MTP-GGUF | 27B | 32K (recomendado) | Q8_K_P, Q5_K_M, etc. | No disponible | HuggingFace |
| Este modelo (NVFP4 mixto) | 27B | 32K (recomendado) | NVFP4/Q8_0/F32/F16 | No disponible | HuggingFace |

La comparativa con otros modelos de 27B de la misma categoría (por ejemplo, Llama-3.1-8B o Mistral-7B) no es directa por el tamaño y las capacidades multimodales. Este modelo se distingue por su perfil "uncensored" y por la optimización específica para Blackwell.

## Limitaciones y advertencias

- Sesgos conocidos: al ser un fine-tuning "uncensored" sin filtros, el modelo puede generar contenido ofensivo, ilegal o perjudicial. No se han documentado sesgos específicos, pero el perfil Aggressive elimina los mecanismos de rechazo que normalmente mitigan estos riesgos.
- Riesgo de alucinación: alto, especialmente en tareas factuales, al igual que otros modelos de 27B. La cuantización NVFP4 puede aumentar ligeramente la probabilidad de errores en comparación con precisiones más altas.
- Limitaciones de contexto: la ventana de 32K es una configuración recomendada, no el máximo del modelo base. Superar ese límite puede degradar la calidad o causar errores.
- Restricciones de licencia: la licencia no está disponible en la documentación. El uso comercial no está garantizado y depende de la licencia del modelo base Qwen3.8-27B y del fine-tuning de HauhauCS. Se recomienda contactar con los autores antes de usar en producción.
- Caveat de producción: la re-cuantización se realizó desde un GGUF Q8_K_P, no desde pesos BF16 originales, lo que introduce una doble pérdida de precisión. Aunque el autor afirma que la calidad es cercana a Q5, no hay benchmarks que lo respalden.
- El sidecar FastMTP requiere un parche de runtime específico de HauhauCS; sin él, el modelo funciona pero sin la aceleración de decodificación especulativa.

## Enlaces

- Repositorio HuggingFace del modelo: https://huggingface.co/AIconjured/Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-MTP-GGUF-Q8-NVFP4
- Modelo base de HauhauCS: https://huggingface.co/HauhauCS/Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-MTP-GGUF
- Modelo base de Qwen: https://huggingface.co/Qwen/Qwen3.8-27B
- Página de descripción en aiany.app: https://aiany.app/item/qwen3-8-27b-uncensored-hauhaucs-aggressive-mtp-gguf
- Página de descripción en local-ai-zone: https://local-ai-zone.github.io/models/qwen3-8-27b-uncensored-hauhaucs-aggressive-mtp.html
- Página de descripción en interfaze.ai: https://interfaze.ai/models/hauhaucsqwen38-27b-uncensored-hauhaucs-aggressive-mtp-gguf
