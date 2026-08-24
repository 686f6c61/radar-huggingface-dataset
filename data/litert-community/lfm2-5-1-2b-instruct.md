# litert-community/LFM2.5-1.2B-Instruct

## Resumen

LFM2.5-1.2B-Instruct es el modelo insignia de Liquid AI para despliegue en dispositivos, diseñado específicamente para inferencia on-device con un equilibrio entre rendimiento y eficiencia. Este repositorio de la comunidad LiteRT (anteriormente TFLite) proporciona una conversión del modelo original al formato `.litertlm`, optimizado para el runtime LiteRT-LM de Google, lo que permite ejecutarlo en CPU y GPU de dispositivos móviles y ordenadores de sobremesa.

El modelo emplea una arquitectura híbrida que combina bloques de convolución corta con gating y atención grouped-query, una combinación poco habitual que le permite alcanzar velocidades de decodificación muy superiores a las de modelos puramente atencionales del mismo tamaño. Con 1.2 mil millones de parámetros y una ventana de contexto máxima de 4096 tokens, está pensado para tareas de chat, seguimiento de instrucciones y tool calling en entornos con recursos limitados.

La relevancia actual de este modelo radica en su capacidad para ejecutarse en hardware de consumo —como un Pixel 8a o un Mac con chip M4— manteniendo un rendimiento competitivo en tareas de razonamiento matemático, superando según sus creadores a modelos de mayor tamaño como Qwen3-1.7B y Gemma 3 1B. La versión int8 del repositorio alcanza un 81% en GSM8K, ligeramente por encima de la referencia bf16 en PyTorch (79%), lo que demuestra que la cuantización no degrada significativamente la calidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: bloques de convolución corta con gating + grouped-query attention |
| Parametros totales | 1.2 mil millones |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | 4096 tokens (máximo, configurable vía `--max-num-tokens`) |
| Tipos de cuantizacion | int8 dinámico (lineales + convoluciones + embedding), int4 blockwise-32 + OCTAV (lineales), int8 embedding, convoluciones en float32 |
| Idiomas soportados | no disponible (no se especifica en la documentación) |
| Licencia | lfm-open-license-v1.0 (Liquid AI) |
| Formato de pesos | `.litertlm` (LiteRT-LM), también disponible el modelo base en safetensors |

## Arquitectura y entrenamiento

LFM2.5-1.2B-Instruct utiliza una arquitectura híbrida que integra bloques de convolución corta con mecanismos de gating junto con atención grouped-query. Esta combinación permite que el modelo procese secuencias largas de forma eficiente, ya que las convoluciones capturan dependencias locales de manera más rápida que la atención, mientras que la atención grouped-query maneja las dependencias globales con un coste computacional reducido. Según la documentación de Liquid AI, el modelo fue preentrenado con 28 billones de tokens y posteriormente afinado mediante aprendizaje por refuerzo en múltiples etapas, lo que le confiere habilidades sólidas en seguimiento de instrucciones y tool calling.

El proceso de entrenamiento incluye una fase de instrucción con plantilla ChatML que soporta listas de herramientas y un canal de "thinking" declarado, lo que permite al modelo razonar de forma explícita antes de responder. La conversión a LiteRT-LM mantiene byte-idénticos los pesos y el grafo respecto al modelo original, añadiendo únicamente metadatos de ejecución para el runtime. La cuantización int8 dinámica cubre todas las capas lineales, convoluciones y embedding, mientras que la variante int4 utiliza cuantización blockwise de 32 elementos con el esquema OCTAV para las capas lineales, manteniendo las convoluciones en float32.

## Capacidades

- Generación de texto conversacional y seguimiento de instrucciones en formato ChatML.
- Tool calling / function calling: la plantilla incluida soporta listas de herramientas y el modelo puede invocar funciones externas.
- Razonamiento multi-paso con canal de "thinking" explícito, útil para tareas de razonamiento matemático y lógico.
- Razonamiento matemático: alcanza un 81% en GSM8K (int8) con 0-shot chain-of-thought.
- Capacidades multilingües: no especificadas, aunque el modelo base de Liquid AI suele soportar múltiples idiomas; no hay datos confirmados en este repositorio.
- Inferencia on-device: optimizado para CPU y GPU en dispositivos móviles (Android, macOS) y ordenadores de sobremesa.
- Integración con el ecosistema LiteRT-LM: compatible con Google AI Edge Gallery y el runtime `litert-lm`.

## Casos de uso

- Asistentes conversacionales en dispositivos móviles: el modelo puede gestionar diálogos multi-turno con contexto de hasta 4096 tokens, suficiente para mantener conversaciones coherentes sin depender de la nube. Su velocidad de decodificación en CPU (93 tok/s en un M4 Max) permite una experiencia fluida en hardware de gama media.
- Automatización de atención al cliente en edge: gracias a su soporte de tool calling, puede integrarse en sistemas de ticketing o CRM para consultar bases de datos, enviar respuestas o escalar incidencias, ejecutándose localmente en el dispositivo del agente o en un servidor de bajo coste.
- Razonamiento matemático y lógico en entornos sin GPU: su buen resultado en GSM8K (81% int8) lo hace adecuado para aplicaciones educativas, resolución de problemas aritméticos o asistentes de estudio que funcionen en portátiles sin tarjeta gráfica dedicada.
- Chatbots de documentación técnica con RAG: el modelo puede combinarse con un pipeline de recuperación aumentada para responder preguntas sobre manuales o bases de conocimiento internas, aprovechando su capacidad de seguir instrucciones y su ventana de contexto de 4096 tokens para procesar fragmentos relevantes.
- Prototipado rápido de agentes conversacionales: al ser un modelo pequeño y rápido, permite iterar sobre lógica de agentes, prompts y flujos de tool calling en entornos de desarrollo locales sin necesidad de infraestructura cloud.
- Inferencia en dispositivos Android de gama media: con la variante int4 (736 MB) se puede desplegar en teléfonos como el Pixel 8a, alcanzando ~31 tok/s en CPU, suficiente para aplicaciones de chat offline o asistentes personales que respeten la privacidad del usuario.

## Benchmarks y rendimiento

La model card del repositorio proporciona resultados de GSM8K (greedy, 0-shot chain-of-thought, max-tokens 1024, n=100) comparando la conversión LiteRT con la referencia PyTorch:

| Configuracion | GSM8K |
|---|---|
| PyTorch bf16 (referencia) | 79% |
| LiteRT int8 (este repositorio) | 81% |
| LiteRT int4-b32 OCTAV (este repositorio) | 72% |

Además, la model card afirma que el modelo base supera a Qwen3-1.7B y Gemma 3 1B en benchmarks de conocimiento y seguimiento de instrucciones, aunque no se proporcionan cifras concretas en la información disponible. No se han publicado resultados adicionales de benchmarks (MMLU, HumanEval, etc.) en la documentación de este repositorio.

## Requisitos de hardware

- VRAM estimada: la variante int8 ocupa 1.25 GB y la int4 736 MB, por lo que caben en GPUs de consumo con 2 GB o más de memoria.
- GPUs recomendadas: cualquier GPU moderna con soporte OpenCL (Android, macOS) o CUDA (a través del runtime LiteRT-LM). En Apple M4 Max se alcanzan 318 tok/s de decodificación en GPU.
- Compatibilidad con consumer GPU: sí, tanto en CPU como en GPU de portátiles y sobremesa. En un Pixel 8a (Tensor G3) se obtienen ~19-31 tok/s en CPU y ~21 tok/s en GPU.
- Opciones de despliegue: runtime `litert-lm` (CLI), Google AI Edge Gallery (aplicación Android), o integración mediante SDKs. El modelo base también es compatible con Transformers, vLLM y llama.cpp, aunque este repositorio está orientado a LiteRT-LM.
- Latencia y throughput: en M4 Max con CPU, prefill de 1592 tok/s y decodificación de 93.1 tok/s (int8, max-tokens 1024); en GPU, prefill de 3765 tok/s y decodificación de 318.3 tok/s. En Pixel 8a con GPU, prefill de 188-193 tok/s y decodificación de 21 tok/s.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | GSM8K | Licencia | Formato |
|---|---|---|---|---|---|
| LFM2.5-1.2B-Instruct (LiteRT) | 1.2B | 4096 | 81% (int8) | lfm-open-license-v1.0 | .litertlm |
| Qwen3-1.7B | 1.7B | no disponible | no disponible | Apache 2.0 | safetensors, GGUF |
| Gemma 3 1B | 1B | no disponible | no disponible | Gemma Terms of Use | safetensors, GGUF |

Según la model card, LFM2.5-1.2B-Instruct supera a Qwen3-1.7B y Gemma 3 1B en benchmarks de conocimiento y seguimiento de instrucciones, aunque no se aportan cifras concretas. La principal ventaja de este modelo es su arquitectura híbrida, que le permite decodificar más rápido que modelos puramente atencionales del mismo tamaño, y su disponibilidad en formato LiteRT-LM para despliegue on-device.

## Limitaciones y advertencias

- Contexto limitado a 4096 tokens, lo que puede ser insuficiente para tareas que requieran procesar documentos largos o conversaciones muy extensas.
- No está orientado a generación de código intensiva ni a tareas que requieran conocimiento enciclopédico profundo, según la documentación de Overmind.
- La licencia lfm-open-license-v1.0 es una licencia específica de Liquid AI; es necesario revisar sus términos para uso comercial, aunque es de tipo open source.
- La variante int4 sacrifica 7 puntos de GSM8K (72% vs 79% bf16) a cambio de un 41% menos de tamaño; hay que evaluar si esa pérdida es aceptable para el caso de uso.
- En iOS, la ejecución en GPU falla actualmente (issue #3129 de LiteRT-LM), por lo que solo está disponible la vía CPU en dispositivos Apple móviles.
- La velocidad de decodificación depende fuertemente del presupuesto de tokens configurado (`--max-num-tokens`); aumentar el límite reduce el throughput (de 101 a 77 tok/s en int8 al pasar de 1024 a 4096).
- No se han publicado datos sobre sesgos o alucinaciones específicos de este modelo; se recomienda validar las respuestas en aplicaciones críticas.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/litert-community/LFM2.5-1.2B-Instruct
- Modelo base (LiquidAI): https://huggingface.co/LiquidAI/LFM2.5-1.2B-Instruct
- Documentación oficial de Liquid AI: https://docs.liquid.ai/lfm/models/lfm25-1.2b-instruct
- Página en Overmind: https://www.overmindlab.ai/models/lfm-2-5-1-2b-instruct
- ModelScope: https://www.modelscope.cn/models/LiquidAI/LFM2.5-1.2B-Instruct
- Repositorio LiteRT-LM: https://github.com/google-ai-edge/litert-lm
- Google AI Edge Gallery: https://github.com/google-ai-edge/gallery
- Issue de iOS Metal: https://github.com/google-ai-edge/LiteRT-LM/issues/3129
