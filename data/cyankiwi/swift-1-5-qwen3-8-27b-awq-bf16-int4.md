# cyankiwi/Swift-1.5-Qwen3.8-27B-AWQ-BF16-INT4

## Resumen

Swift 1.5 Qwen3.8-27B es un derivado de razonamiento eficiente del modelo Qwen3.8-27B desarrollado por UkisAI. Se presenta como una evolucion de Swift 1.0 (con mas de 350.000 descargas) que escala el post-entrenamiento (RL y OPD) para mejorar el rendimiento general, especialmente en tareas de codigo y agenticas, con un menor consumo de tokens de pensamiento. La model card del autor reporta un 58,5 % menos de tokens de thinking y una puntuacion un 0,35 % superior a la base, lo que se traduce en una aceleracion de 1,95x en varias tareas.

La ficha que nos ocupa, `cyankiwi/Swift-1.5-Qwen3.8-27B-AWQ-BF16-INT4`, no es el modelo original sino una cuantizacion AWQ INT4 publicada por cyankiwi sobre el checkpoint base `ukisai/Swift-1.5-Qwen3.8-27b`. Mantiene el pipeline `image-text-to-text` (multimodal imagen-texto), la licencia `swift-open-license-1.0` y un total de 27.781.427.952 parametros reales segun safetensors, con un repositorio de 28,9 GB.

Es relevante para desarrolladores que quieran desplegar un modelo de ~27B con capacidad de razonamiento y vision en hardware mas modesto que el requerido por los pesos BF16, manteniendo segun el autor la eficiencia de tokens del post-entrenamiento de Swift 1.5. La cuantizacion usa calibration sobre datos STEM y agenticos (version cyankiwi 26.05.01).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivado de Qwen3.8-27B; tag `qwen3_5`/`qwen3_8` en Hugging Face) |
| Parametros totales | 27.781.427.952 (27,78B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | AWQ INT4 con activaciones BF16 (repo AWQ-BF16-INT4); existen GGUF y GSQ-RCO GGUF del modelo base |
| Idiomas soportados | no disponibles |
| Licencia | swift-open-license-1.0 (gated, requiere aceptacion) |
| Formato de pesos | safetensors (compressed-tensors), compatible con transformers |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer derivado de Qwen3.8-27B, con 27,78B parametros totales. El modelo base Swift 1.5 se obtiene mediante post-entrenamiento sobre Swift 1.0: el autor indica que identifico tokens asociados a "overthinking" patologico y los penalizo sin atacar directamente la longitud del razonamiento, recuperando despues la precision con RL y OPD (on-policy distillation). El foco del escalado de post-entrenamiento fue tareas de horizonte largo, agenticas y de codigo, con mejoras reportadas en LiveCodeBench y Terminal Bench 2.1. Los datos de entrenamiento son publicos en `ukisai/Qwen3.8-27B-multi-turn-agent-sft`, aunque el autor aclara que no se usan tal cual.

Esta ficha concreta es una cuantizacion AWQ INT4 (activation-aware weight quantization) realizada por cyankiwi, version 26.05.01, calibrada con un dataset de STEM y agentico. No se dispone de informacion sobre el numero de tokens de entrenamiento del modelo original, la composicion exacta del dataset ni detalles de la fase de RLHF/DPO mas alla de lo indicado.

## Capacidades

- Generacion de texto y razonamiento con modo de pensamiento eficiente ("efficient-thinking", "token-efficient").
- Capacidad multimodal imagen-texto (pipeline `image-text-to-text`).
- Generacion de codigo, incluyendo tareas de codigo de horizonte largo (mejoras reportadas en LiveCodeBench).
- Tareas agenticas y de terminal (tag `terminal-bench`, mejoras en Terminal Bench 2.1).
- Razonamiento multi-paso y conversacional multi-turno.
- Soporte de tool calling / function calling: no confirmado explicitamente en la informacion disponible.
- Capacidades multilingues: no disponibles.

## Casos de uso

- Generacion de codigo en produccion: el modelo esta post-entrenado especificamente para tareas de codigo y agenticas, por lo que puede integrarse en pipelines de generacion y revision de codigo donde la eficiencia de tokens reduce coste y latencia.
- Agentes autonomos de terminal: el enfasis en Terminal Bench 2.1 lo hace adecuado para agentes que ejecutan comandos, interpretan salidas y corrigen errores en entornos de shell.
- Prototipado rapido de aplicaciones interactivas: el ejemplo de la model card (generacion de un juego 3D en 11,39 minutos frente a 104,6 minutos del base) ilustra su uso para generar artefactos de codigo completos en sesiones largas.
- Asistentes con entrada de imagen: al ser un modelo imagen-texto, puede emplearse en tareas de descripcion, extraccion de informacion o respuesta a preguntas sobre imagenes.
- Razonamiento con presupuesto de tokens ajustado: su reduccion del 58,5 % en tokens de thinking lo hace util en entornos con limites de coste por peticion o latencia estricta.
- Despliegue en infraestructura limitada: la version INT4 permite servir un modelo de ~27B en GPUs con menos VRAM que la requerida por BF16, habilitando entornos de desarrollo o inferencia on-premise.
- Conversaciones multi-turno de larga duracion: el modelo esta disenado para tareas de horizonte largo, lo que encaja en asistentes que mantienen contexto durante sesiones extensas.

## Benchmarks y rendimiento

La model card reporta comparaciones cualitativas y relativas frente al modelo base, pero no publica una tabla numerica de benchmarks estandar (MMLU, HumanEval, GSM8K). Los datos disponibles son:

| Metrica | Swift 1.5 27B | Qwen3.8-27B (base) |
|---|---|---|
| Tokens de thinking | 58,5 % menos | referencia |
| Puntuacion agregada | +0,35 % | referencia |
| Aceleracion en varias tareas | 1,95x | referencia |
| Demo de generacion de juego (tiempo) | 11,39 min | 104,6 min |

No se han publicado resultados numericos detallados de benchmarks en la informacion disponible para esta cuantizacion AWQ concreta.

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 28,9 GB en INT4 con activaciones BF16; se necesita algo mas de esa cifra para el runtime (KV cache, overhead), por lo que se recomienda al menos 32 GB de VRAM para inferencia comoda.
- GPU recomendadas: A100 40/80 GB, H100, L40S, RTX A6000 (48 GB). En consumer, una RTX 4090 (24 GB) probablemente no sea suficiente para esta cuantizacion concreta; seria necesario recurrir a las variantes GGUF del modelo base con cuantizaciones mas agresivas.
- Cabe en consumer GPU: no con esta cuantizacion INT4 de 28,9 GB; si con GGUF de menor bit-depth (disponibles en el repo del modelo base).
- Opciones de despliegue: transformers (libreria declarada), vLLM y TGI por compatibilidad con compressed-tensors/AWQ; llama.cpp/Ollama solo mediante los GGUF del modelo base.
- Latencia y throughput: no disponibles; el autor reporta una aceleracion de 1,95x atribuible a la reduccion de tokens de thinking, no a la cuantizacion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| cyankiwi/Swift-1.5-Qwen3.8-27B-AWQ-BF16-INT4 | 27,78B | no disponible | swift-open-license-1.0 (gated) | Hugging Face, 471 descargas |
| ukisai/Swift-1.5-Qwen3.8-27b (original BF16) | 27,78B | no disponible | swift-open-license-1.0 (gated) | Hugging Face |
| Qwen/Qwen3.8-27B (base) | 27B | no disponible | no disponible | Hugging Face |
| ukisai/Swift-Qwen3.8-27b (Swift 1.0) | 27B | no disponible | no disponible | Hugging Face, 350k+ descargas |

La comparativa se limita a la familia del propio modelo; no se dispone de datos de benchmarks que permitan contrastarlo numericamente con alternativas de otros desarrolladores.

## Limitaciones y advertencias

- Modelo gated: requiere aceptar la licencia en Hugging Face antes de descargar los pesos.
- Licencia `swift-open-license-1.0`: es una licencia propia ("other") con enlace a los terminos del modelo base; es imprescindible revisarla antes de cualquier uso comercial.
- Al ser una cuantizacion INT4, puede presentar degradacion de precision respecto al BF16 original, especialmente en tareas de razonamiento largo; no se han publicado evaluaciones de esta cuantizacion concreta.
- Riesgo de alucinacion inherente a los modelos generativos; no hay datos especificos publicados.
- Idiomas soportados no documentados; no se garantiza un rendimiento uniforme fuera de los idiomas del entrenamiento.
- Longitud de contexto no disponible, lo que dificulta planificar despliegues con ventanas largas.
- Sesgos conocidos: no documentados en la informacion disponible.
- El modelo base esta orientado a eficiencia de tokens; la penalizacion de tokens de "overthinking" podria reducir la profundidad de razonamiento en problemas que requieren cadenas largas, aunque el autor afirma mantener la precision.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/cyankiwi/Swift-1.5-Qwen3.8-27B-AWQ-BF16-INT4
- Modelo base: https://huggingface.co/ukisai/Swift-1.5-Qwen3.8-27b
- Licencia: https://huggingface.co/ukisai/Swift-1.5-Qwen3.8-27b/blob/main/LICENSE
- Qwen3.8-27B original: https://huggingface.co/Qwen/Qwen3.8-27B
- Swift 1.0: https://huggingface.co/ukisai/Swift-Qwen3.8-27b
- GGUF del modelo base: https://huggingface.co/ukisai/Swift-1.5-Qwen3.8-27B-GGUF
- GSQ-RCO GGUF: https://huggingface.co/ukisai/Swift-1.5-Qwen3.8-27B-GSQ-RCO-GGUF
- Dataset de entrenamiento: https://huggingface.co/datasets/ukisai/Qwen3.8-27B-multi-turn-agent-sft
- Dataset de calibracion AWQ: https://huggingface.co/datasets/cyankiwi/calibration
- Web de cyankiwi: https://cyan.kiwi/
- Web de UkisAI: https://ukisai.com
- Pagina de producto Swift: https://ukisai.com/products/swift
- Demo del juego generado: https://ukisai.com/swift-games/27b
- Perfil de cyankiwi en Hugging Face: https://huggingface.co/cyankiwi
- ModelScope de cyankiwi: https://www.modelscope.ai/organization/cyankiwi
