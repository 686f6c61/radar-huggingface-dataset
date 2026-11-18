# SituativeModelling/NVIDIA-Nemotron-3-Nano-30B-A3B-BF16

## Resumen

NVIDIA-Nemotron-3-Nano-30B-A3B-BF16 es un modelo de lenguaje de gran escala desarrollado por NVIDIA Corporation, publicado en el repositorio de Hugging Face bajo el identificador `SituativeModelling/NVIDIA-Nemotron-3-Nano-30B-A3B-BF16`. Se trata de un modelo entrenado desde cero, disenado como una solucion unificada para tareas de razonamiento y no razonamiento, que genera una traza de razonamiento antes de emitir una respuesta final. Su principal innovacion reside en una arquitectura hibrida Mixture-of-Experts (MoE) que combina 23 capas Mamba-2 y MoE con 6 capas de atencion, sumando 31.577.937.344 parametros totales y 3.5B parametros activos por token.

El modelo esta pensado para su uso comercial y se distribuye bajo la NVIDIA Nemotron Open Model License. Soporta seis idiomas (ingles, aleman, espanol, frances, italiano y japones) y esta optimizado para tareas de razonamiento complejo, generacion de codigo, matematicas y flujos agenticos. Su naturaleza MoE con solo 3.5B parametros activos lo hace especialmente atractivo para despliegues con restricciones de latencia y coste computacional, manteniendo una calidad cercana a modelos densos de mayor tamano.

La relevancia actual del modelo radica en su combinacion de eficiencia (arquitectura hibrida Mamba-2 + atencion) y capacidades de razonamiento de ultima generacion, con resultados competitivos frente a alternativas como Qwen3-30B-A3B-Thinking-2507 y GPT-OSS-20B en benchmarks como AIME25, LiveCodeBench o Terminal Bench. Su publicacion incluye datasets de preentrenamiento y postentrenamiento abiertos, lo que facilita la reproducibilidad y el ajuste fino.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hibrida Mixture-of-Experts (MoE) con 23 capas Mamba-2 y MoE, y 6 capas de atencion (nemotron_h) |
| Parametros totales | 31.577.937.344 (aproximadamente 30B) |
| Parametros activos | 3.5B por token |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en BF16) |
| Idiomas soportados | Ingles, aleman, espanol, frances, italiano y japones |
| Licencia | NVIDIA Nemotron Open Model License |
| Formato de pesos | safetensors (BF16) |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura hibrida que combina capas Mamba-2 con capas de atencion tradicional. En concreto, consta de 23 capas Mamba-2 y MoE, mas 6 capas de atencion. Cada capa MoE incluye 128 expertos mas 1 experto compartido, con 6 expertos activados por token, lo que resulta en 3.5B parametros activos sobre un total de 30B. Esta combinacion busca reducir el coste computacional de la atencion cuadratica clasica mediante el uso de Mamba-2 para la mayoria de capas, reservando la atencion para un subconjunto reducido.

El entrenamiento se realizo desde cero por NVIDIA, con datos de preentrenamiento cuyo corte es el 25 de junio de 2025 y datos de postentrenamiento con corte a 28 de noviembre de 2025. El modelo se apoya en una extensa coleccion de datasets propios de NVIDIA (Nemotron-CC-v2, Nemotron-Pretraining-Code-v1/v2, Nemotron-Math-v2, Nemotron-Agentic-v1, Nemotron-Instruction-Following-Chat-v1, entre otros). El modelo soporta un modo de razonamiento configurable mediante una flag en la plantilla de chat: puede generar trazas de razonamiento antes de la respuesta final o responder directamente, con una ligera perdida de precision en prompts complejos si se desactiva el razonamiento. La model card menciona que el modelo fue "improved using Qwen", aunque no se detalla el mecanismo exacto de esa mejora.

## Capacidades

- Generacion de texto conversacional y no conversacional con modo de razonamiento configurable (thinking mode on/off).
- Razonamiento matematico avanzado, con resultados destacados en AIME25 (89.1 sin herramientas, 99.2 con herramientas).
- Generacion y comprension de codigo, evaluado en LiveCodeBench y Terminal Bench.
- Razonamiento cientifico y de conocimiento general (MMLU-Pro, GPQA, SciCode).
- Soporte de tool calling y uso de herramientas externas, con mejoras notables en benchmarks cuando se habilitan herramientas (AIME25 with tools: 99.2; GPQA with tools: 75.0).
- Capacidades agenticas y de razonamiento multi-paso, orientadas a tareas de terminal y resolucion de problemas.
- Soporte multilingue en seis idiomas: ingles, aleman, espanol, frances, italiano y japones.
- Capacidad de demostracion matematica formal (MiniF2F pass@1: 50.0; pass@32: 79.9).
- No se mencionan capacidades de vision ni audio en la informacion disponible.

## Casos de uso

- Razonamiento matematico y resolucion de problemas complejos: el modelo puede utilizarse para resolver problemas de competicion y demostraciones formales, con la opcion de habilitar tool calling para mejorar la precision en AIME25 (hasta 99.2 con herramientas). Es adecuado para plataformas educativas o sistemas de tutoria automatizada.
- Generacion de codigo en produccion: gracias a su rendimiento en LiveCodeBench (68.3) y su soporte de tool calling, puede integrarse en pipelines de CI/CD para revision de codigo, generacion de tests o correccion automatica de errores.
- Agentes autonomos de terminal: su evaluacion en Terminal Bench (hard subset: 8.5) lo posiciona para tareas de automatizacion de linea de comandos, scripts de administracion de sistemas y flujos agenticos multi-paso.
- Atencion al cliente multilingue: al soportar seis idiomas y disponer de modo de razonamiento configurable, puede gestionar conversaciones multi-turno con contexto largo, aunque la longitud exacta de contexto no esta disponible en la informacion proporcionada.
- Asistencia cientifica y de investigacion: con resultados en GPQA (73.0 sin herramientas, 75.0 con herramientas) y SciCode (33.3), es util para responder preguntas tecnicas de dominio cientifico y apoyar tareas de analisis.
- Razonamiento con uso de herramientas externas: el modelo puede orquestar llamadas a APIs, calculadoras o motores de busqueda para mejorar respuestas en tareas de conocimiento general y matematicas, como demuestra la mejora en AIME25 y GPQA al habilitar herramientas.
- Despliegue eficiente en entornos con recursos limitados: al tener solo 3.5B parametros activos, es adecuado para inferencia en GPUs de gama alta consumer o profesional, reduciendo costes frente a modelos densos de 30B.

## Benchmarks y rendimiento

| Tarea | NVIDIA-Nemotron-3-Nano-30B-A3B-BF16 | Qwen3-30B-A3B-Thinking-2507 | GPT-OSS-20B |
|---|---|---|---|
| MMLU-Pro | 78.3 | **80.9** | 75.0 |
| AIME25 (no tools) | 89.1 | 85.0 | **91.7** |
| AIME25 (with tools) | **99.2** | - | 98.7 |
| GPQA (no tools) | 73.0 | **73.4** | 71.5 |
| GPQA (with tools) | **75.0** | - | 74.2 |
| LiveCodeBench (v6 2025-08–2025-05) | **68.3** | 66.0 | 61.0 |
| SciCode (subtask) | 33.3 | 33.0 | **34.0** |
| HLE (no tools) | 10.6 | 9.8 | **10.9** |
| HLE (with tools) | 15.5 | - | **17.3** |
| MiniF2F pass@1 | **50.0** | 5.7 | 12.1 |
| MiniF2F pass@32 | **79.9** | 16.8 | 43.0 |
| Terminal Bench (hard subset) | 8.5 | 5.0 | 6.0 |

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 63.2 GB de pesos, por lo que se necesita al menos una GPU con 80 GB (A100 80GB, H100 80GB) para cargar el modelo completo sin cuantizar.
- Con cuantizacion a 8 bits, la VRAM estimada se reduce a unos 32 GB, siendo viable en GPUs como A100 40GB o RTX 6000 Ada.
- Con cuantizacion a 4 bits, la VRAM estimada se situa en torno a 16-18 GB, lo que permite su ejecucion en GPUs consumer como RTX 4090 (24 GB) o RTX 3090 (24 GB).
- GPU recomendadas: NVIDIA A100 (80GB), H100 (80GB), H200, RTX 6000 Ada, y para cuantizaciones agresivas RTX 4090 o RTX 3090.
- Opciones de despliegue: al ser un modelo con arquitectura personalizada (`nemotron_h`) y `custom_code`, requiere transformers con soporte para dicha arquitectura. No se confirma soporte en vLLM, llama.cpp, Ollama o TGI en la informacion disponible.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada. La naturaleza MoE con 3.5B parametros activos sugiere una latencia inferior a la de un modelo denso de 30B, pero no se aportan cifras concretas.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | MMLU-Pro | AIME25 (no tools) | LiveCodeBench |
|---|---|---|---|---|---|---|---|
| NVIDIA-Nemotron-3-Nano-30B-A3B-BF16 | 30B (31.58B) | 3.5B | no disponible | NVIDIA Nemotron Open Model License | 78.3 | 89.1 | 68.3 |
| Qwen3-30B-A3B-Thinking-2507 | 30B | no disponible | no disponible | no disponible | 80.9 | 85.0 | 66.0 |
| GPT-OSS-20B | 20B | no disponible | no disponible | no disponible | 75.0 | 91.7 | 61.0 |

## Limitaciones y advertencias

- Riesgo de alucinacion inherente a los modelos de lenguaje; no se han publicado evaluaciones especificas de tasa de alucinacion en la informacion disponible.
- La longitud de contexto no esta especificada en la informacion proporcionada, lo que impide garantizar el rendimiento en tareas que requieran ventanas muy extensas.
- El modo de razonamiento desactivado puede reducir la precision en prompts complejos, segun advierte la propia model card.
- El soporte linguistico se limita a seis idiomas (ingles, aleman, espanol, frances, italiano y japones); no se garantiza un rendimiento adecuado en otros idiomas.
- La licencia NVIDIA Nemotron Open Model License permite uso comercial, pero impone terminos especificos que deben revisarse antes de su integracion en productos.
- La arquitectura personalizada (`nemotron_h` con `custom_code`) puede requerir versiones especificas de transformers y limitar la compatibilidad con herramientas de inferencia estandar.
- No se dispone de informacion sobre sesgos conocidos ni sobre evaluaciones de seguridad en la informacion proporcionada.
- El rendimiento en Terminal Bench (8.5) y SciCode (33.3) es bajo en terminos absolutos, lo que sugiere cautela en despliegues agenticos criticos sin supervision humana.

## Enlaces

- [Hugging Face: SituativeModelling/NVIDIA-Nemotron-3-Nano-30B-A3B-BF16](https://huggingface.co/SituativeModelling/NVIDIA-Nemotron-3-Nano-30B-A3B-BF16)
- [Paper (arXiv:2512.20848)](https://arxiv.org/abs/2512.20848)
- [Paper adicional (arXiv:2512.20856)](https://arxiv.org/abs/2512.20856)
- [NVIDIA Nemotron Open Model License](https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-nemotron-open-model-license/)
- [NVIDIA Build: Nemotron 3 Nano](https://build.nvidia.com/nvidia/nemotron-3-nano-30b-a3b)
- [Coleccion de datasets de preentrenamiento Nemotron](https://huggingface.co/collections/nvidia/nemotron-pre-training-datasets)
- [Coleccion de datasets de postentrenamiento Nemotron v3](https://huggingface.co/collections/nvidia/nemotron-post-training-v3)
- [Pagina de desarrollador Nemotron](https://developer.nvidia.com/nemotron)
- [Discord NVIDIA AI Developer](https://discord.gg/9xpKQtVvrk)
