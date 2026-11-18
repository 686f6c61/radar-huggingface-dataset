# nemonullsec/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic

## Resumen

DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic es un ajuste fino de tipo "decensored" (abliterated) del modelo Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B, que a su vez es un fine-tune de razonamiento de Qwen3.5-9B destilado a partir de respuestas generadas por DeepSeek-V4-Pro en modo "Max Effect". Lo publica el usuario nemonullsec en Hugging Face y su objetivo es eliminar los comportamientos de rechazo del modelo original manteniendo al máximo las capacidades subyacentes.

El modelo conserva la naturaleza multimodal del linaje Qwen3.5 (etiqueta image-text-to-text) y el foco en matematicas y STEM del fine-tune base, que se entreno con aproximadamente 250.000 muestras centradas en razonamiento cientifico y matematico. Con 9.409.813.744 parametros totales y pesos en safetensors, esta pensado para despliegue en una unica GPU de gama alta o en configuraciones consumer con cuantizacion.

La relevancia actual reside en dos frentes: por un lado, ofrece un modelo de razonamiento compacto (clase 9B) con soporte declarado de tool calling y function calling; por otro, aplica la tecnica Heretic v2.0.0.dev0 de ablacion de rangos arbitrarios (ARA) para reducir drásticamente las negaciones, pasando de 100/100 rechazos en el modelo original a 3/100 en esta version, con una divergencia KL de 0.0422 respecto al original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (linaje Qwen3.5), multimodal image-text-to-text |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no disponible (no se declara MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; el autor menciona evaluacion con NVFP4) |
| Idiomas soportados | en, zh, ko, ja, es, ru |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura transformer de Qwen3.5 en su variante de 9B, con capacidad multimodal declarada mediante la etiqueta image-text-to-text y el pipeline text-generation. El fine-tune base (Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B) se construyo por destilacion: se generaron respuestas con DeepSeek-V4-Pro en modo "Max Effect" y se uso ese corpus como senal supervisada (SFT) sobre Qwen3.5-9B, concentrando el entrenamiento en matematicas y STEM con aproximadamente 250.000 muestras. Las etiquetas del repositorio mencionan tambien etapas de RL con GSPO y tecnicas MTP (multi-token prediction), aunque la model card no detalla hiperparametros ni composicion exacta del dataset.

Sobre esa base, el autor aplica Heretic v2.0.0.dev0, una tecnica de ablacion de rangos arbitrarios (Arbitrary-Rank Ablation, ARA) que modifica las activaciones internas en un rango de capas (de la capa 9 a la 24) con pesos especificos: `preserve_good_behavior_weight` 0.8264, `steer_bad_behavior_weight` 0.0003, `overcorrect_relative_weight` 0.9645 y `neighbor_count` 12. El resultado declarado es una reduccion de rechazos de 100/100 a 3/100 con una divergencia KL de 0.0422 frente al modelo original, lo que indica un cambio moderado en la distribucion de salida.

## Capacidades

- Generacion de texto y razonamiento multi-paso con descomposicion estructurada de problemas, heredado de la destilacion de DeepSeek-V4-Pro.
- Razonamiento matematico y cientifico (STEM) reforzado por el entrenamiento con unas 250.000 muestras especificas.
- Capacidad multimodal de entrada imagen-texto segun la etiqueta image-text-to-text del repositorio.
- Soporte de tool calling y function calling (etiquetas tool-use y function-calling).
- Razonamiento agentico y multi-step reasoning (etiqueta reasoning).
- Capacidades multilingues en ingles, chino, coreano, japones, espanol y ruso.
- Modo de razonamiento explicito (thinking) segun el linaje Qwen3.5 y la etiqueta reasoning.
- Comportamiento "decensored": reduce de forma agresiva las negaciones y rechazos del modelo base.

## Casos de uso

- Tutoria de matematicas y ciencias: el modelo puede resolver problemas paso a paso y explicar la descomposicion, aprovechando el entrenamiento especifico en unas 250.000 muestras STEM y su modo de razonamiento explicito.
- Generacion de codigo asistida: aunque no recibio SFT especifico de codigo, la model card reporta pequenas mejoras por transferencia cruzada; es util en pipelines de autocompletado y revision con tool calling integrado.
- Agentes con function calling: la etiqueta tool-use permite integrarlo en orquestadores de agentes que necesiten invocar APIs, consultar bases de datos o encadenar pasos multi-turno.
- Procesamiento de documentos con imagen: la capacidad image-text-to-text permite extraer y razonar sobre contenido de capturas, diagramas o formularios en flujos de digitalizacion.
- Investigacion sobre alineacion y seguridad: al ser una version abliterated con metricas publicadas de rechazos y KL, sirve como caso de estudio para evaluar el impacto de tecnicas ARA en modelos de 9B.
- Atencion al cliente tecnico multilingue: con soporte de espanol, ingles, chino, coreano, japones y ruso, puede gestionar conversaciones en varios idiomas, aunque su naturaleza decensored exige filtros externos en produccion.
- Despliegue en hardware limitado: con 9,4B de parametros y pesos safetensors, se puede cuantizar y servir en una sola GPU consumer o de gama profesional para prototipos e inferencia local.

## Benchmarks y rendimiento

La model card solo publica metricas del proceso de ablacion frente al modelo original, no benchmarks estandar de tareas (MMLU, HumanEval, GSM8K).

| Metrica | Este modelo | Modelo original (Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B) |
|---|---|---|
| Rechazos (Refusals) | 3/100 | 100/100 |
| Divergencia KL | 0.0422 | 0 (por definicion) |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16/FP16: aproximadamente 19 GB solo para pesos, mas overhead de activaciones y cache KV; se recomienda 24 GB o mas.
- VRAM estimada en cuantizacion de 8 bits: en torno a 10-11 GB para pesos.
- VRAM estimada en cuantizacion de 4 bits: en torno a 5-6 GB para pesos, con margen para contexto.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 4090 (24 GB) para BF16; RTX 3090/4080 o superiores para cuantizaciones de 8 y 4 bits.
- Cabe en GPU consumer: si, en RTX 4090 en BF16 justo al limite y con holgura en cuantizaciones de 8/4 bits; en GPUs de 16 GB requiere cuantizacion.
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference (etiqueta TGI), y por compatibilidad de formato safetensors, vLLM y llama.cpp/Ollama tras conversion a GGUF.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Notas |
|---|---|---|---|---|---|
| DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic (este) | 9,4B | no disponible | Razonamiento STEM destilado, decensored | Apache 2.0 | 3/100 rechazos, KL 0.0422 |
| Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B | 9,4B | no disponible | Razonamiento STEM destilado | Apache 2.0 | 100/100 rechazos, modelo base |
| xtools-at/DeepSeek-V4-Pro-Qwen3.5-4B-UNCENSORED-heretic | 4B (aprox.) | no disponible | Version 4B decensored | no disponible | Version reducida del mismo linaje |
| xtools-at/Qwen3.5-9B-DeepThought-STEM | 9B (aprox.) | no disponible | Fine-tune cientifico sobre este modelo | no disponible | Derivado orientado a STEM |

## Limitaciones y advertencias

- Modelo "uncensored"/abliterated: la reduccion de rechazos a 3/100 implica que puede generar contenido que el modelo original bloqueaba; requiere moderacion externa en cualquier despliegue publico.
- La ablacion ARA modifica activaciones en las capas 9 a 24, lo que puede degradar sutilmente capacidades no medidas; la KL de 0.0422 indica cambios no nulos en la distribucion.
- Riesgo de alucinacion inherente a modelos de 9B destilados, especialmente en matematicas fuera del dominio de entrenamiento y en tareas de codigo sin SFT especifico.
- Longitud de contexto no documentada en la informacion disponible; no asumir ventanas largas sin verificacion empirica.
- Idiomas declarados limitados a seis (en, zh, ko, ja, es, ru); el rendimiento en espanol no esta cuantificado.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias sobre el comportamiento del modelo decensored ni sobre el cumplimiento normativo del contenido generado.
- Repositorio con 0 descargas y creado en 2026-11-18: sin validacion comunitaria ni reportes independientes de calidad.
- La model card esta incompleta (se corta en la seccion de despliegue) y no detalla hiperparametros de RL, composicion exacta del dataset ni resultados de evaluacion estandar.

## Enlaces

- Hugging Face: https://huggingface.co/nemonullsec/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic
- Modelo base: https://huggingface.co/Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B
- Version 4B decensored: https://huggingface.co/xtools-at/DeepSeek-V4-Pro-Qwen3.5-4B-UNCENSORED-heretic
- Fine-tune STEM derivado: https://huggingface.co/xtools-at/Qwen3.5-9B-DeepThought-STEM
- Proyecto Heretic: https://heretic-project.org
