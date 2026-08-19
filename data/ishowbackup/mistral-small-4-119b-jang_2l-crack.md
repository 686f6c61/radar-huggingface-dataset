# Ishowbackup/Mistral-Small-4-119B-JANG_2L-CRACK

## Resumen

El modelo **Ishowbackup/Mistral-Small-4-119B-JANG_2L-CRACK** es una versión cuantizada y modificada del modelo base `mistralai/Mistral-Small-4-119B-2603`, desarrollada por el usuario Ishowbackup (vinculado al proyecto JANG). Se trata de un modelo de lenguaje multimodal (texto e imagen) de arquitectura MoE con 119.000 millones de parámetros totales y aproximadamente 8.000 millones activos por token, que incorpora Multi-head Latent Attention (MLA), 128 expertos y capacidades de visión Pixtral. La modificación principal consiste en la aplicación de dos técnicas: **JANG_2L**, un esquema de cuantización mixta de precisión (8 bits en atención, 6 bits en capas importantes y 2 bits en expertos) diseñado específicamente para Apple Silicon, y **CRACK** (Controlled Refusal Ablation via Calibrated Knockouts), una intervención a nivel de pesos que elimina permanentemente los mecanismos de rechazo de contenido del modelo original, dando lugar a una versión "uncensored" o sin guardarraíles.

El modelo está pensado exclusivamente para ejecutarse en equipos Mac con chip Apple Silicon (64 GB de RAM o más) mediante el software **MLX Studio** o la librería Python `jang-tools`. No es compatible con herramientas basadas en GGUF como LM Studio, Ollama u oMLX. Su relevancia radica en que es la primera versión sin restricciones de seguridad de un modelo de 119B que cabe en hardware de consumo de gama alta de Apple, aunque esta característica conlleva riesgos importantes de uso indebido. La licencia declarada es Apache 2.0, aunque el modelo base de Mistral tiene su propia licencia que podría imponer restricciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (Mixture of Experts) con MLA y 128 expertos, basada en Mistral Small 4 |
| Parametros totales | 119B (según model card; el archivo safetensors reporta 12.106.925.056, posiblemente un error de metadata) |
| Parametros activos | ~8B (según model card); otras fuentes indican 6B o 6.5B |
| Longitud de contexto | no disponible (el modelo base de Mistral Small 4 soporta hasta 256k tokens, pero no se confirma en esta versión) |
| Tipos de cuantizacion | JANG_2L (8-bit atención, 6-bit capas importantes, 2-bit expertos); también existe variante JANG_4M |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 (declarada en el repo) |
| Formato de pesos | safetensors (contenedor JANG, equivalente a GGUF para MLX) |

## Arquitectura y entrenamiento

El modelo base, Mistral Small 4, es un transformer híbrido que combina capacidades de instrucción, razonamiento y generación de código en un solo modelo. Emplea Multi-head Latent Attention (MLA) para reducir el coste de la atención y una arquitectura MoE con 128 expertos, de los cuales se activan aproximadamente 6-8 por token. Incluye además un codificador de visión Pixtral para procesar imágenes. El modelo original fue entrenado por Mistral AI con un enfoque que unifica tres familias de modelos (Instruct, Reasoning y Devstral), y soporta modos de razonamiento explícito mediante etiquetas `[THINK]...[/THINK]`.

La versión JANG_2L-CRACK aplica dos modificaciones sobre el checkpoint base:

1. **JANG** (Jang Adaptive N-bit Grading): cuantización mixta que clasifica cada tensor de pesos según su sensibilidad y asigna anchos de bit óptimos (8/6/2 bits). Esto reduce el tamaño del modelo a 37 GB, permitiendo su ejecución en Macs con 64 GB de RAM unificada, con una pérdida de calidad mínima según los autores.
2. **CRACK** (Controlled Refusal Ablation via Calibrated Knockouts): intervención a nivel de pesos que elimina los circuitos responsables del rechazo de contenido (safety refusal). El resultado es un modelo que no se niega a responder a peticiones dañinas o ilegales, sin necesidad de LoRA, fine-tuning ni prompts especiales. Los autores reportan una caída del 1.4% en MMLU sin razonamiento respecto al modelo base cuantizado.

No se dispone de información detallada sobre el dataset de entrenamiento de esta modificación, ya que CRACK no implica un entrenamiento adicional, sino una ablación calibrada de pesos.

## Capacidades

- **Generación de texto y razonamiento**: puede actuar como modelo de instrucción general y como modelo de razonamiento paso a paso, activable mediante el parámetro `reasoning_effort` (OFF por defecto, ON con etiquetas `[THINK]`).
- **Multimodalidad**: incluye tensores de visión Pixtral, por lo que es capaz de procesar imágenes junto con texto (pipeline `image-text-to-text`).
- **Generación de código**: hereda las capacidades de la familia Devstral del modelo base, orientada a tareas de programación.
- **Sin restricciones de contenido**: la ablación CRACK elimina los mecanismos de rechazo, permitiendo respuestas a cualquier tipo de petición, incluyendo contenido dañino o ilegal.
- **Tool calling / function calling**: no se especifica explícitamente en la documentación, pero el modelo base Mistral Small 4 soporta esta funcionalidad; es probable que se herede, aunque no está confirmado.
- **Multilingüismo**: limitado al inglés (según la metadata del repo).
- **Razonamiento multi-step**: soportado mediante el modo de razonamiento con esfuerzo configurable.

## Casos de uso

- **Investigación en seguridad y alineación**: el modelo permite estudiar el comportamiento de un LLM sin guardarraíles, analizando cómo la ablación de pesos afecta a la generación de contenido sensible. Es útil para investigadores que trabajan en detección de sesgos, jailbreaks o evaluación de riesgos de modelos no alineados.
- **Generación de código en entornos aislados**: gracias a sus capacidades de código y tool calling (si se confirma), puede integrarse en pipelines de desarrollo en Macs, por ejemplo para autocompletado o revisión de código, siempre que el contenido generado no requiera control de seguridad.
- **Análisis de imágenes en local**: al ser multimodal, puede utilizarse para tareas de descripción de imágenes, extracción de información visual o generación de informes a partir de capturas, sin depender de servicios en la nube.
- **Prototipado de agentes conversacionales**: su capacidad de razonamiento y generación de texto permite construir asistentes o chatbots para entornos de desarrollo, aunque su falta de filtros lo hace inadecuado para producción orientada al público.
- **Evaluación de cuantización mixta**: sirve como banco de pruebas para comparar la calidad de JANG_2L frente a otras cuantizaciones (GGUF, GPTQ, etc.) en tareas de razonamiento y generación, en plataformas Apple Silicon.
- **Generación de contenido creativo sin restricciones**: escritura de ficción, guiones o material que requiera explorar temas tabú, siempre que el uso sea legal y ético en el contexto correspondiente.

## Benchmarks y rendimiento

Los resultados proporcionados por el autor en la model card son los siguientes:

| Benchmark | Resultado |
|---|---|
| HarmBench (tasa de cumplimiento) | 95.9% (307/320) |
| MMLU (con razonamiento) | 89.9% (187/208) |
| MMLU (sin razonamiento, no-think) | 65.9% (137/208) |

Desglose de HarmBench por categorías:

| Categoría | Puntuación |
|---|---|
| Covering Tracks | 20/20 (100%) |
| Auth Bypass | 97/100 (97%) |
| API Hacking | 96/100 (96%) |
| Cloud Exploits | 94/100 (94%) |

Comparación con el modelo base cuantizado (según el autor):

| Métrica | CRACK | Base JANG_2L |
|---|---|---|
| MMLU (con razonamiento) | 89.9% | ~91% (estimado) |
| MMLU (sin razonamiento) | 65.9% | 67.3% |
| MMLU drop (sin razonamiento) | -1.4% | — |
| HarmBench | 95.9% | 0% |

No se han publicado resultados de benchmarks en la información disponible más allá de los mostrados.

## Requisitos de hardware

- **VRAM / memoria**: requiere al menos 64 GB de memoria unificada en Macs con Apple Silicon (el modelo ocupa 37 GB en disco, pero necesita memoria adicional para el contexto y la computación). La variante JANG_4M ocupa 64 GB y necesita 96 GB de RAM.
- **GPU**: exclusivamente Apple Silicon (M1 Pro/Max/Ultra, M2, M3, M4, etc.). No es compatible con GPUs NVIDIA o AMD.
- **Software**: solo MLX Studio o la librería `jang-tools` (`pip install "jang[mlx]"`). No funciona con LM Studio, Ollama, oMLX, Inferencer ni ninguna herramienta basada en GGUF.
- **Latencia y throughput**: no se proporcionan datos concretos. El autor afirma en el repositorio JANG que la inferencia es 5x más rápida en prefill que la implementación de MLX Community, pero no hay cifras exactas.
- **Despliegue**: la ejecución se realiza en local mediante el motor de MLX Studio. No hay opciones de despliegue en servidores cloud estándar (aunque se podría emular en un Mac con Apple Silicon en la nube).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| **Mistral-Small-4-119B-JANG_2L-CRACK** | 119B totales, ~8B activos | no disponible | Apache 2.0 | JANG (safetensors) | Sin guardarraíles, solo Apple Silicon |
| **Mistral-Small-4-119B-2603** (base) | 119B totales, ~6.5B activos | 256k (según documentación de Mistral) | Mistral Research License (uso comercial restringido) | safetensors, GGUF, etc. | Modelo original con guardarraíles, multiplataforma |
| **Mistral-Small-4-119B-JANG_4M-CRACK** | 119B totales | no disponible | Apache 2.0 | JANG (safetensors) | Versión con cuantización 4-bit media, 64 GB, HarmBench 95.3%, requiere 96 GB RAM |

No se dispone de comparativas con otros modelos "uncensored" (como Dolphin o WizardLM) en la información proporcionada.

## Limitaciones y advertencias

- **Ausencia total de guardarraíles**: el modelo puede generar contenido ilegal, peligroso o éticamente cuestionable. Su uso en producción o en entornos no controlados supone un riesgo grave de seguridad y responsabilidad legal.
- **Sesgos y alucinaciones**: al ser una versión ablacionada de un modelo base, puede presentar sesgos heredados y una mayor propensión a alucinar, especialmente en temas controvertidos donde el modelo original habría aplicado filtros.
- **Degradación por cuantización**: la cuantización de 2 bits en los expertos puede reducir la calidad de las respuestas en tareas que requieren precisión numérica o razonamiento complejo (como se observa en la caída de MMLU sin razonamiento).
- **Compatibilidad limitada**: solo funciona en Apple Silicon con MLX Studio o `jang-tools`. No es portable a otros entornos (GPU NVIDIA, CPU x86, etc.).
- **Idioma**: solo inglés confirmado; el uso en otros idiomas puede dar resultados inconsistentes.
- **Licencia**: aunque el repo declara Apache 2.0, el modelo base de Mistral tiene una licencia propia que puede imponer restricciones de uso comercial. La versión CRACK, al eliminar la seguridad, podría violar los términos de uso de Mistral AI.
- **Contexto no confirmado**: no se especifica la longitud de contexto de esta versión cuantizada; podría ser inferior al del modelo base (256k) debido a limitaciones de memoria.
- **Riesgo de mal uso**: la combinación de alta tasa de cumplimiento en HarmBench (95.9%) y ausencia de filtros lo convierte en una herramienta peligrosa para actividades maliciosas (hacking, fraude, etc.).

## Enlaces

- [Modelo en HuggingFace: Ishowbackup/Mistral-Small-4-119B-JANG_2L-CRACK](https://huggingface.co/Ishowbackup/Mistral-Small-4-119B-JANG_2L-CRACK)
- [Modelo base: mistralai/Mistral-Small-4-119B-2603](https://huggingface.co/mistralai/Mistral-Small-4-119B-2603)
- [Repositorio JANG (jangq)](https://github.com/jjang-ai/jangq)
- [Documentación de Mistral Small 4](https://docs.mistral.ai/models/mistral-small-4-0-26-03)
- [Versión cuantizada NVFP4 del modelo base](https://huggingface.co/mistralai/Mistral-Small-4-119B-2603-NVFP4)
- [Referencia en NVIDIA NIM](https://docs.api.nvidia.com/nim/reference/mistralai-mistral-small-4-119b-2603)
