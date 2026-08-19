# Atomic-Germ/Qwen3.5-9B-Claude-4.8-Opus-NPU2

## Resumen

Qwen3.5-9B-Claude-4.8-Opus-NPU2 es un fine-tune de 9 000 millones de parámetros sobre el modelo base Qwen/Qwen3.5-9B, desarrollado por Atomic-Germ. El modelo se ha ajustado con cadenas de razonamiento (CoT) invertidas por traza procedentes de Claude-Opus-4.8, con el objetivo de especializarlo en programación, matemáticas y razonamiento de ciberseguridad, logrando aproximadamente un 20 % de trazas de pensamiento más cortas que el modelo base.

La relevancia de este lanzamiento reside en su formato de pesos: Q4NX, un formato de cuantización empaquetado y propietario del motor FastFlowLM, diseñado específicamente para las NPU AMD Ryzen AI con arquitectura XDNA2 (serie Ryzen AI 300 / Strix Point). No es un archivo GGUF y no funciona con llama.cpp ni Ollama; está pensado exclusivamente para el motor FastFlowLM sobre NPU de AMD. El repositorio incluye además un peso de torre de visión (vision_weight.q4nx) que habilita entrada multimodal.

El contexto declarado en la configuración es de 262 144 tokens, y el modelo está licenciado bajo Apache-2.0. Está dirigido a desarrolladores que trabajan con hardware NPU de AMD y necesitan un modelo de razonamiento compacto con capacidades de codificación, matemáticas y análisis de seguridad.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.5, base Qwen/Qwen3.5-9B) |
| Parametros totales | 9 000 millones (9B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 262 144 tokens (según config) |
| Tipos de cuantizacion | Q4NX (formato propietario de FastFlowLM, basado en Q4_1 reorganizado) |
| Idiomas soportados | en (inglés) |
| Licencia | Apache-2.0 |
| Formato de pesos | Q4NX (no es GGUF ni safetensors; exclusivo de FastFlowLM) |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura de Qwen3.5-9B, un transformer denso de 9 000 millones de parámetros con una ventana de contexto de 262 144 tokens. El proceso de entrenamiento consiste en un fine-tuning supervisado con cadenas de razonamiento de Claude-Opus-4.8, descrito como "trace-inverted CoT" (cadenas de pensamiento con trazas invertidas), lo que reduce aproximadamente un 20% la longitud de las trazas de razonamiento respecto al modelo base. No se especifican detalles sobre el volumen de datos de entrenamiento, el uso de RLHF o DPO, ni la composición exacta del dataset.

La innovación técnica principal no está en el entrenamiento sino en el formato de distribución: la conversión a Q4NX, un formato de cuantización empaquetado que reorganiza el layout Q4_1 para adaptarse a los tamaños de tile y patrones de acceso a memoria de la matriz de la NPU XDNA2. Los kernels de la NPU (xclbins) son de código cerrado y no se incluyen en el repositorio; el instalador flm-add.py enlaza los kernels del modelo oficial Qwen3.5-9B-NPU2 al compartir la misma familia de motor (qwen3.5) y arquitectura.

## Capacidades

- Generación de texto conversacional con pipeline text-generation.
- Razonamiento especializado en programación (coding), matemáticas (math) y ciberseguridad (cybersecurity), gracias al fine-tuning con trazas de Claude-Opus-4.8.
- Trazas de pensamiento más cortas que el modelo base (aproximadamente un 20% menos), lo que reduce la latencia de razonamiento en tareas complejas.
- Entrada multimodal: el repositorio incluye vision_weight.q4nx, lo que indica soporte de entrada de imágenes a través de la torre de visión, aunque no se documentan detalles del rendimiento multimodal.
- Soporte de tool calling y uso de chat template mediante tokenizer_config.json y chat_template.jinja, heredados de la familia Qwen3.5.
- Ventana de contexto larga de 262 144 tokens, adecuada para tareas que requieren grandes cantidades de información previa.

## Casos de uso

- Asistente de programación en entornos con NPU AMD: el modelo puede generar código y razonar sobre problemas de programación con trazas de pensamiento más cortas, reduciendo la latencia en iteraciones de desarrollo en laptops con Ryzen AI 300.
- Auditoría y análisis de ciberseguridad: su especialización en razonamiento de seguridad permite analizar fragmentos de código sospechosos, logs o configuraciones para identificar vulnerabilidades, con la ventaja de ejecutarse localmente en hardware de consumo sin enviar datos sensibles a la nube.
- Resolución de problemas matemáticos paso a paso: el fine-tuning con cadenas de razonamiento de Opus-4.8 mejora la eficiencia del razonamiento matemático, útil para herramientas educativas o de cálculo simbólico asistido.
- Razonamiento sobre documentos largos: con 262 144 tokens de contexto, puede procesar y razonar sobre manuales técnicos, bases de código completas o informes de seguridad extensos en una sola pasada.
- Generación de código con entrada multimodal: la torre de visión permite analizar capturas de pantalla o diagramas de arquitectura para generar código o explicaciones, ejecutable en portátiles con NPU XDNA2.
- Despliegue de agentes conversacionales locales en hardware de consumo: el modelo puede gestionar conversaciones multi-turno con tool calling en entornos donde la privacidad exige inferencia local y el hardware disponible es una NPU de AMD, no una GPU dedicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandarizados (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card incluye únicamente una prueba de rendimiento denominada "GhostWriter Influence Test", realizada en un portátil AMD Ryzen AI 340 Framework 13:

| Metrica | Valor |
|---|---|
| Prompt tokens | 9 210 |
| Completion tokens | 1 537 |
| Total tokens | 10 747 |
| Tokens KV activos | 10 747 |
| Capacidad maxima de tokens KV | 32 768 |
| Ocupacion de KV | 32,80% |
| Duracion de carga | 0,000000621 segundos |
| Prefill (TTFT) | 33,71 ms |
| Duracion de decodificacion | 268,54 ms |
| Velocidad de prefill | 273,21 tokens/segundo |
| Velocidad de decodificacion | 5,72 tokens/segundo |

Estos datos son de una única prueba no estandarizada y no deben compararse directamente con benchmarks de otros modelos.

## Requisitos de hardware

- NPU obligatoria: AMD Ryzen AI con arquitectura XDNA2 (NPU2), es decir, serie Strix Point / Ryzen AI 300 o posterior. No funciona en GPUs convencionales ni en CPUs sin NPU compatible.
- Memoria: aproximadamente 17 GB de memoria unificada del sistema para los pesos Q4NX, activaciones y KV cache.
- Peso del archivo model.q4nx: 7,76 GB.
- Software: FastFlowLM >= 0.9.45 (CLI flm), Linux con la pila XRT NPU instalada, y el instalador flm-add.py incluido en el repositorio.
- Rendimiento observado: prefill de 273,21 tokens/segundo y decodificación de 5,72 tokens/segundo en un AMD Ryzen AI 340 (Framework 13), con TTFT de 33,71 ms.
- No es compatible con vLLM, llama.cpp, Ollama ni TGI, ya que el formato Q4NX es exclusivo de FastFlowLM.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Especializacion |
|---|---|---|---|---|---|
| Qwen3.5-9B-Claude-4.8-Opus-NPU2 (este) | 9B | 262 144 | Q4NX (NPU AMD) | Apache-2.0 | Razonamiento, código, matemáticas, ciberseguridad |
| Qwen/Qwen3.5-9B (base) | 9B | 262 144 | safetensors / GGUF | Apache-2.0 | Generalista |
| kwangsuklee/Qwen3.5-9B.Q4_K_M-Claude-4.6-Opus-Reasoning-Distilled-v2 | 9B | 262 144 | GGUF Q4_K_M | no disponible | Razonamiento (14 000 muestras de Claude 4.6 Opus) |
| Qwen3.5-9B-Claude-4.6-Opus-Reasoning-Distilled-v2-GGUF (Jackrong) | 9B | 262 144 | GGUF | no disponible | Razonamiento (fine-tuning LoRA con Unsloth) |

Las alternativas en GGUF (kwangsuklee y Jackrong) son comparables en tamaño y especialización en razonamiento, pero se distribuyen en formato GGUF para ejecutarse en llama.cpp/Ollama y GPU convencionales, mientras que este modelo está bloqueado al ecosistema FastFlowLM sobre NPU AMD.

## Limitaciones y advertencias

- Formato propietario y no portable: el modelo solo se ejecuta con el motor FastFlowLM en NPUs AMD XDNA2. No funciona en GPUs NVIDIA, Apple Silicon ni CPUs.
- Kernels de código cerrado: los xclbins de la NPU son propietarios y no se distribuyen en el repositorio; se enlazan los kernels del modelo oficial Qwen3.5-9B-NPU2, lo que introduce una dependencia de terceros.
- Idioma: la model card declara únicamente inglés (en); no se documenta soporte multilingüe.
- Rendimiento de decodificación bajo: 5,72 tokens/segundo en la prueba publicada, lo que puede resultar lento para aplicaciones interactivas en tiempo real.
- Riesgo de alucinación y sesgos: no se documentan evaluaciones de sesgos ni de alucinación; como fine-tune de un modelo base de 9B, el riesgo de alucinación en tareas de razonamiento complejo sigue presente.
- Licencia Apache-2.0 permite uso comercial, pero el ecosistema FastFlowLM y sus kernels pueden tener términos propios no cubiertos por esta licencia.
- Los datos de rendimiento publicados provienen de una única prueba no estandarizada ("GhostWriter Influence Test") y no son comparables con benchmarks académicos.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Atomic-Germ/Qwen3.5-9B-Claude-4.8-Opus-NPU2
- Modelo base Qwen/Qwen3.5-9B: https://huggingface.co/Qwen/Qwen3.5-9B
- Motor FastFlowLM: https://fastflowlm.com
- Variante relacionada (Claude-Code): https://huggingface.co/Atomic-Germ/Qwen3.5-9B-Claude-Code-NPU2
- Artículo de prueba de modelos destilados de Claude-Opus en Qwen3.5 9B: https://www.besthub.dev/articles/testing-claude-opus-4-6-distilled-qwen3-5-9b-model-locally-via-lm-studio-and-claude-code-21e3b8f87011
- Variante GGUF de razonamiento destilado similar: https://ollama.com/kwangsuklee/Qwen3.5-9B.Q4_K_M-Claude-4.6-Opus-Reasoning-Distilled-v2:latest
- Ficha de la variante GGUF de Jackrong: https://www.aimodels.fyi/models/huggingFace/qwen3.5-9b-claude-4.6-opus-reasoning-distilled-v2-gguf-jackrong
