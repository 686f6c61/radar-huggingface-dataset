# izagami/Shikigami-594B-A17B-GGUF

## Resumen

Shikigami-594B-A17B-GGUF es una cuantización extrema del modelo Inkling 2 Small de Thinking Machines, un transformer de mezcla de expertos (MoE) con 594.000 millones de parámetros totales y 17.000 millones activos por token, distribuidos en 384 expertos enrutados con top-8. El autor, izagami, publica versiones GGUF a 2 bits (RVQ2) y a aproximadamente 1 bit (RVQ1 y TQ1) empleando cuantización vectorial residual (RVQ) y un código de trellis estilo QTIP, respectivamente. El objetivo es hacer viable en hardware de consumo y en GPUs Intel Arc la inferencia de un modelo que en BF16 ocuparía más de 1 TB.

La relevancia de esta ficha reside en que demuestra que un MoE de casi 600.000 millones de parámetros puede servirse a velocidades interactivas (hasta 57 tokens/s en decodificación con decodificación especulativa) sobre tres Intel Arc Pro B70 de 32 GB, algo impensable con cuantizaciones convencionales. El modelo conserva la torre de visión en BF16 (23 capas ViT, 0,66 GB) y acepta entrada de imagen y texto, lo que lo sitúa en la categoría image-text-to-text.

La contrapartida es importante: los formatos RVQ1, RVQ2 y TQ1 no son tipos nativos de llama.cpp ni de Ollama, LM Studio o Unsloth; requieren el motor XeStrata (rama `b70-local`, SYCL) y, en el caso de TQ1, un commit concreto del 19 de noviembre de 2026. Es, por tanto, un artefacto para experimentación avanzada en hardware Intel más que una opción de despliegue estándar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (mezcla de expertos), 384 expertos enrutados, top-8; torre de vision ViT de 23 capas |
| Parametros totales | 594B (319.741.454.939 segun safetensors del repo base) |
| Parametros activos | 17B por token |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | RVQ2 (2 bits, ~152,9 GB), RVQ1 (1,2 bits, ~84,2 GB), TQ1 (trellis, 2,06 bits/peso, ~84,2 GB); atencion, embeddings y cabeza de salida en Q6_K; router en F32; torre de vision en BF16 |
| Idiomas soportados | no disponibles (la model card incluye evaluacion en ingles y japones) |
| Licencia | Apache 2.0 (derivado de Inkling 2 Small; sujeto a la Acceptable Use Policy de Thinking Machines) |
| Formato de pesos | GGUF (tensores de expertos tipo 150 `RVQ2X8` en RVQ; bytes crudos `.tq` + `.tq_gain` en TQ1); vision en `mmproj-BF16.gguf` |

## Arquitectura y entrenamiento

El modelo base Inkling 2 Small es un transformer de mezcla de expertos con 384 expertos enrutados y activación top-8, lo que da 17B parámetros activos sobre 594B totales. Shikigami no reentrena ni ajusta el modelo: es una cuantización post-entrenamiento. Los expertos enrutados se almacenan con cuantización vectorial residual (RVQ) en las variantes RVQ1/RVQ2: cada 8 pesos consecutivos de una fila se codifican como un código de 16 bits formado por dos índices de 8 bits en dos codebooks de 256 entradas de vectores de 8 dimensiones (un par de codebooks por capa), sumados y multiplicados por una ganancia FP16 por fila, resultando en 2,0 bits por peso más las ganancias.

La variante TQ1 emplea un código de trellis con desplazamiento de bits inspirado en QTIP: teselas de 16x16 (256 pesos) de 66 bytes (2,06 bits/peso), con un estado inicial de 14 bits y 255 símbolos de 2 bits; el peso se calcula mediante una función determinista sobre el estado (sin codebook) y una ganancia FP16 por fila, aplicando una transformada de Hadamard de 64 puntos con signos fijos a la entrada de cada matriz. Los códigos se buscaron con un algoritmo de Viterbi sobre los 2^14 estados posibles. En RVQ1 y TQ1 se podan y estrechan expertos por capa (anchos 2304/1728/1152/576) para minimizar el error de salida al tamaño objetivo. Los códigos se seleccionaron para preservar la salida de cada experto sobre activaciones de calibración del modelo original. No se dispone de información sobre datos de entrenamiento, número de tokens ni etapas de RLHF/DPO del modelo base.

## Capacidades

- Generación de texto conversacional multi-turno (pipeline `conversational`).
- Entrada de imagen y texto (image-text-to-text): la torre de visión ViT de 23 capas procesa imágenes mediante el encoder `ink2_vision.py`, que asigna un token a cada celda de 40x40 píxeles y reescala imágenes de más de 1024 celdas.
- Razonamiento agéntico y uso de herramientas: la model card evalúa explícitamente texto "agentic / tool use" con KL de 0,038 en RVQ2 y 0,059 en RVQ1.
- Generación de código: evaluada con KL de 0,020 (RVQ2) y 0,050 (RVQ1), con decodificación a 57 tokens/s en TQ1 para prompts de código.
- Capacidades multilingües: se reportan métricas para inglés y japonés (KL 0,033/0,067 en RVQ2; 0,110/0,205 en RVQ1).
- Conocimiento factual (trivia): evaluado, aunque es el área donde la cuantización pierde más calidad (KL 0,249 en RVQ2 y 1,272 en RVQ1).
- Compatibilidad con API OpenAI de imágenes (`image_url`) a través del servidor de XeStrata, integrable con Open WebUI.
- Plantilla de chat y tokenizador originales de Inkling 2 Small incluidos en los metadatos GGUF.

## Casos de uso

- Despliegue de un MoE de 594B en hardware Intel Arc: con tres Arc Pro B70 (32 GB cada una) y 89 GB de RAM, RVQ1 mantiene todos los expertos en VRAM y decodifica a 29,5 tokens/s, lo que permite servir un modelo de escala frontera en un escritorio de gama alta.
- Asistentes agénticos con uso de herramientas: la variante RVQ1 conserva un top-1 del 95,9% en texto agéntico respecto al original, adecuada para pipelines de function calling donde la fidelidad de la distribución de tokens importa.
- Generación de código en local: TQ1 alcanza 57 tokens/s en decodificación de código con decodificación especulativa DSpark, suficiente para autocompletado y revisión de código en un flujo de desarrollo individual.
- Procesamiento de documentos con imágenes: la torre de visión en BF16 permite pasar capturas, diagramas o formularios al modelo vía el servidor de XeStrata con partes `image_url`, útil para extracción de información de documentos escaneados.
- Investigación en cuantización extrema: RVQ1, RVQ2 y TQ1 sirven como casos de estudio reproducibles de RVQ y códigos de trellis aplicados a MoE, con métricas de KL y top-1 publicadas para calibrar el compromiso tamaño/calidad.
- Evaluación comparativa de motores de inferencia: al requerir XeStrata (SYCL) y no funcionar en llama.cpp, el modelo es un banco de pruebas para medir rendimiento de decodificación especulativa y offloading de expertos a RAM fijada sobre PCIe (RVQ2: 59% de expertos en VRAM, 15,5 tokens/s).
- Experimentación multilingüe inglés-japonés: las métricas publicadas por idioma permiten validar la degradación de la cuantización en japonés (KL 0,205 en RVQ1) antes de usarla en productos para ese mercado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. La model card proporciona métricas de fidelidad de cuantización frente al modelo original en BF16 sobre texto retenido:

| Texto | RVQ2 KL | RVQ2 top-1 | RVQ1 KL | RVQ1 top-1 |
|---|---|---|---|---|
| Agéntico / uso de herramientas | 0,038 | 96,6% | 0,059 | 95,9% |
| Código | 0,020 | 96,5% | 0,050 | 94,9% |
| Inglés | 0,033 | 95,5% | 0,110 | 91,0% |
| Japonés | 0,067 | 92,1% | 0,205 | 87,1% |
| Conocimiento (trivia) | 0,249 | 84,7% | 1,272 | 63,3% |

Rendimiento medido en 3x Intel Arc Pro B70 (32 GB), 89 GB de RAM del sistema, decodificación greedy y prompts cortos:

| Variante | VRAM | Decodificación | Carga |
|---|---|---|---|
| RVQ1 | Todos los expertos en VRAM | 29,5 tok/s | ~40 s |
| RVQ2 | ~59% de expertos en VRAM, resto desde RAM fijada por PCIe | 15,5 tok/s | 40-60 s |
| TQ1 + DSpark | Todos los expertos en VRAM | 57 / 45 / 50 tok/s (código / japonés / agéntico) | no disponible |
| RVQ1 (mismos prompts) | Todos los expertos en VRAM | 59 / 49 / 53 tok/s (código / japonés / agéntico) | no disponible |

Prefill: 118 tok/s en TQ1 y 132 tok/s en RVQ1. TQ1 presenta aproximadamente un 8% menos de KL que RVQ1 al mismo tamaño. El autor advierte que las cifras de KL no son comparables con las de otros publicadores por diferencias en el texto y el procedimiento de evaluación.

## Requisitos de hardware

- VRAM estimada: RVQ1 y TQ1 ocupan 84,2 GB; RVQ2 ocupa 152,9 GB. La torre de visión añade 0,66 GB en BF16.
- Configuración mínima reportada: 3x Intel Arc Pro B70 (32 GB cada una) más 89 GB de RAM del sistema. RVQ1 y TQ1 caben íntegramente en 96 GB de VRAM; RVQ2 requiere offloading parcial a RAM fijada.
- GPU recomendadas: Intel Arc Pro B70 (probado); el motor XeStrata usa SYCL, por lo que el soporte está orientado a GPUs Intel. No hay datos de funcionamiento en A100, H100 o RTX 4090.
- En GPU de consumo: no cabe en ninguna GPU de consumo actual (la variante más pequeña son 84,2 GB); requiere múltiples GPUs o offloading a RAM del sistema.
- Opciones de despliegue: exclusivamente XeStrata, rama `b70-local` (compilación SYCL según `docs/BUILD.md`); TQ1 necesita el commit 4b1a8fbdb (2026-11-19) o posterior. llama.cpp, Ollama, LM Studio y Unsloth no pueden cargar estos ficheros.
- Latencia y throughput: decodificación de 29,5 tok/s (RVQ1) y 15,5 tok/s (RVQ2) sin decodificación especulativa; 45-57 tok/s con DSpark en TQ1; prefill de 118-132 tok/s; carga de 40-60 s.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Formato / cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Shikigami-594B-A17B (RVQ1/TQ1) | 594B | 17B | no disponible | GGUF propietario (RVQ2X8 / trellis), ~84,2 GB | Apache 2.0 | HF, motor XeStrata |
| Shikigami-594B-A17B (RVQ2) | 594B | 17B | no disponible | GGUF propietario, ~152,9 GB | Apache 2.0 | HF, motor XeStrata |
| Inkling 2 Small (original) | 594B | 17B | no disponible | BF16 (safetensors) | Apache 2.0 | HF, Thinking Machines |
| Cuantizaciones GGUF estándar (Q4_K_M, Q2_K) | no disponible | no disponible | no disponible | GGUF estándar (llama.cpp) | según modelo base | ecosistema llama.cpp |

La comparación directa con cuantizaciones GGUF convencionales no es posible porque el autor no publica variantes en tipos estándar de llama.cpp; la única alternativa práctica al original en BF16 son estas variantes RVQ/TQ, que exigen un motor específico.

## Limitaciones y advertencias

- No es una versión oficial de Thinking Machines; es un derivado no oficial bajo Apache 2.0 y sujeto a la Acceptable Use Policy del autor original.
- Incompatible con llama.cpp, Ollama, LM Studio y Unsloth: los tensores de expertos usan el tipo GGUF 150 (`RVQ2X8`) o bytes crudos `.tq`, no reconocidos por el ecosistema estándar.
- Requiere hardware Intel Arc y compilación manual de XeStrata (SYCL); no hay soporte documentado para NVIDIA ni AMD.
- Pérdida de calidad notable en conocimiento factual: KL de 0,249 y top-1 del 84,7% en RVQ2; en RVQ1 el top-1 cae al 63,3%, lo que desaconseja su uso en tareas de recuperación de hechos.
- Degradación acusada en japonés con RVQ1 (KL 0,205, top-1 87,1%) frente a RVQ2 (KL 0,067, top-1 92,1%).
- Las cifras de KL no son comparables con las de otros publicadores por diferencias de texto y procedimiento; el autor lo advierte explícitamente.
- Riesgo de alucinación inherente al modelo base, agravado por la cuantización a 1 bit en dominios factuales.
- Longitud de contexto e idiomas soportados no documentados en la información disponible.
- La evaluación de rendimiento se hizo con prompts cortos y decodificación greedy; el throughput en producción con prompts largos y sampling puede diferir.
- El encoder de visión corre en CPU con NumPy, lo que añade latencia al procesamiento de imágenes.

## Enlaces

- Hugging Face: https://huggingface.co/izagami/Shikigami-594B-A17B-GGUF
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Small
- Motor XeStrata (rama b70-local): https://github.com/izagami/XeStrata/tree/b70-local
- Política de uso aceptable de Thinking Machines: https://thinkingmachines.ai/model-acceptable-use-policy
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
