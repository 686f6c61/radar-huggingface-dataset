# MIRALABS/Qwen3.8-27B-W4A16-AutoRound

## Resumen

Qwen3.8-27B-W4A16-AutoRound es una cuantización de 4 bits (W4A16) del modelo Qwen3.8-27B, desarrollada por MIRALABS mediante el método AutoRound con grupo de 128 y formato compressed-tensors compatible con el kernel Marlin. El modelo base, creado por Qwen, es un transformer denso de 27 000 millones de parámetros con 64 capas y dimensión oculta de 5120, que incorpora además un codificador de visión y componentes de recurrencia ligera. Esta versión cuantizada reduce el peso en disco a 19,5 GB, lo que permite ejecutarlo en una GPU de consumo con 24 GB de VRAM, algo inviable con los pesos originales en BF16 (que ocupan aproximadamente 54 GB).

La relevancia de esta ficha radica en que ofrece una vía práctica para desplegar un modelo de 27B con ventana de contexto nativa de 262 144 tokens (ampliable a 1M con YaRN) en hardware asequible, manteniendo capacidades de razonamiento, tool calling, visión y decodificación especulativa MTP. Está pensada para desarrolladores que necesitan ejecutar el modelo en producción con vLLM, ya sea en una sola RTX 3090 con contexto reducido o en configuraciones de doble GPU para contexto completo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3.8-27B) con codificador de vision y recurrencia ligera |
| Parametros totales | 27 000 millones (el widget de Hub muestra 6,26B por empaquetado INT4, no es el recuento real) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262 144 tokens nativos; 1 000 000 con YaRN |
| Tipos de cuantizacion | W4A16 (AutoRound, grupo 128); el base tambien ofrece BF16 y FP8 |
| Idiomas soportados | No disponible (el modelo base Qwen es multilingue, pero no se especifican idiomas concretos) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compressed-tensors, pack-quantized); GGUF no incluido pero convertible |

## Arquitectura y entrenamiento

El modelo es una cuantizacion post-entrenamiento del Qwen3.8-27B original, realizada con AutoRound 0.14.2 en configuracion W4A16 (pesos en INT4, activaciones en BF16) y grupo de cuantizacion de 128. El calibrado se efectuo sobre el dataset pile-10k. Los componentes de recurrencia, vision y MTP (Multi-Token Prediction) se mantienen en BF16 para preservar su funcionamiento, lo que implica que no toda la computacion es de 4 bits. El formato compressed-tensors con empaquetado cuantizado permite el uso del kernel Marlin en GPUs Ampere o superiores.

El modelo base Qwen3.8-27B, del cual deriva, es un transformer denso de 27B con 64 capas y dimension oculta de 5120, que incorpora un codificador de vision (de ahi el pipeline image-text-to-text) y una recurrencia ligera. No se dispone de datos sobre el numero de tokens de entrenamiento ni la composicion del dataset del modelo original en la informacion proporcionada. La cuantizacion no altera la arquitectura, solo la representacion numerica de los pesos.

## Capacidades

- Generacion de texto y razonamiento con modo "thinking" activado por defecto (reasoning_effort configurable: xhigh, medium, low), que separa el razonamiento interno de la respuesta final.
- Soporte de tool calling y function calling mediante el parser `qwen3_coder`, con activacion automatica de seleccion de herramientas.
- Capacidades de agente y razonamiento multi-paso gracias al modo thinking y al soporte de contexto largo.
- Procesamiento de imagenes junto con texto (pipeline image-text-to-text), aunque el codificador de vision se mantiene en BF16.
- Decodificacion especulativa MTP (Multi-Token Prediction) para acelerar la inferencia, tambien en BF16.
- Multilingue (presumiblemente, dado el origen del modelo base, aunque no se documentan idiomas especificos).
- Compatible con vLLM, incluyendo prefix caching, chunked prefill y CUDA graphs.

## Casos de uso

- Asistente de codigo en produccion: con tool calling y el parser `qwen3_coder`, puede integrarse en IDEs o pipelines de CI/CD para generar, revisar y ejecutar codigo, aprovechando el modo thinking para razonar sobre problemas complejos antes de responder.
- Analisis de documentos extensos: su contexto nativo de 262 144 tokens permite procesar libros completos, expedientes legales o codigos fuente de gran tamano en una sola pasada, sin necesidad de chunking.
- Chat conversacional con separacion de razonamiento: el modo thinking permite que el modelo elabore una cadena de razonamiento interna antes de dar la respuesta final, util para aplicaciones de soporte tecnico o tutoria donde se requiere explicar el proceso.
- Agentes autonomos multi-paso: con soporte de tool calling y razonamiento extendido, puede orquestar tareas como busqueda web, ejecucion de scripts o consultas a APIs, manteniendo el estado a lo largo de la conversacion.
- Vision-lenguaje en entornos con recursos limitados: al ser una cuantizacion de 4 bits, puede ejecutarse en una GPU de 24 GB para tareas de captioning o respuesta a preguntas sobre imagenes, aunque con contexto reducido.
- Despliegue en hardware AMD: segun el blog oficial de AMD, el modelo tiene soporte "Day 0" en procesadores Ryzen AI Max y GPUs Radeon mediante LM Studio, lo que permite ejecutarlo en estaciones de trabajo sin GPU NVIDIA.
- Inferencia local en servidores con doble GPU: la configuracion recomendada de 2x RTX 3090 con vLLM permite servir el modelo con contexto completo de 262k, adecuado para aplicaciones de investigacion que requieren analisis de secuencias muy largas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks especificos para esta cuantizacion W4A16 en la informacion disponible. El modelo base Qwen3.8-27B cuenta con benchmarks publicados (segun fuentes como aireleasetracker y yottalabs), pero no se han proporcionado los numeros concretos en los materiales consultados. Se recomienda evaluar la degradacion de calidad respecto al modelo BF16 original en las tareas objetivo antes de desplegar en produccion.

## Requisitos de hardware

- VRAM estimada: los pesos cuantizados ocupan aproximadamente 18 GB, por lo que caben en una GPU de 24 GB (RTX 3090, RTX 4090) dejando espacio limitado para la cache KV.
- GPU recomendadas: cualquier GPU Ampere o superior (RTX 30xx, RTX 40xx, A100, H100) por el kernel Marlin. En una sola RTX 3090 se puede ejecutar con contexto reducido (8k-16k) usando `--gpu-memory-utilization 0.95` y `--kv-cache-dtype fp8`.
- Para contexto completo de 262k se recomienda una configuracion de 2x 24 GB (por ejemplo, 2x RTX 3090) con `--tensor-parallel-size 2`.
- Opciones de despliegue: vLLM (principal), llama.cpp con GGUF (para una sola GPU con contexto largo), LM Studio (soporte AMD), SGLang (mencionado en fuentes externas).
- Latencia y throughput: no disponibles. La decodificacion especulativa MTP puede mejorar el throughput, pero no se han proporcionado cifras concretas.
- Requisito de software: transformers >= 5.15 (necesario para `Qwen3_5Config`), vLLM 0.19 o superior.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Tamano en disco | Licencia |
|---|---|---|---|---|---|
| Qwen3.8-27B (base BF16) | 27B | 262k (1M YaRN) | BF16 | ~54 GB | Apache 2.0 |
| Qwen3.8-27B (FP8) | 27B | 262k (1M YaRN) | FP8 | ~27 GB | Apache 2.0 |
| Qwen3.8-27B-W4A16-AutoRound (este) | 27B | 262k (1M YaRN) | W4A16 | 19,5 GB | Apache 2.0 |

La cuantizacion W4A16 ofrece el menor tamano en disco y la menor huella de memoria, a costa de una posible degradacion de precision frente a FP8 o BF16. No se dispone de datos comparativos de rendimiento entre estas variantes en la informacion proporcionada. Otras alternativas de 27B en el ecosistema (por ejemplo, Llama 3.3 70B o Mistral Large) no son directamente comparables por diferencia de tamano y licencia.

## Limitaciones y advertencias

- La cuantizacion W4A16 puede introducir degradacion de calidad en tareas de alta precision (matematicas, razonamiento logico) respecto al modelo BF16 original; se recomienda validar con benchmarks propios.
- En una sola GPU de 24 GB, el contexto util se limita a 8k-16k tokens; la ventana nativa de 262k solo es alcanzable con multiples GPUs o con GGUF y offload a RAM.
- Los componentes de vision, recurrencia y MTP se mantienen en BF16, lo que aumenta el uso de memoria y puede reducir la velocidad de inferencia en esos modulos.
- Requiere versiones muy recientes de transformers (>=5.15) y vLLM (>=0.19), que pueden no estar disponibles en todos los entornos o tener incompatibilidades con otras librerias.
- No se han publicado benchmarks de esta cuantizacion, por lo que el rendimiento real en tareas especificas es desconocido.
- El modelo base puede presentar sesgos y alucinaciones inherentes a los LLM; la cuantizacion no los corrige.
- La licencia Apache 2.0 permite uso comercial, pero se debe verificar que el modelo base no tenga restricciones adicionales (en este caso, no las tiene).
- El modo thinking activado por defecto consume muchos tokens de salida; es necesario configurar `max_tokens` adecuadamente o desactivarlo si la latencia es critica.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/MIRALABS/Qwen3.8-27B-W4A16-AutoRound
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio GitHub de despliegue en 2x RTX 3090: https://github.com/tonyd2wild/Qwen3.8-27B-AutoRound-W4A16-2x3090
- Blog de AMD sobre soporte en Ryzen AI Max y Radeon: https://www.amd.com/en/blogs/2026/run-qwen-3-8-27b-on-amd-ryzen-ai-max-and-radeon-graphics-cards-day-0.html
- Ficha de benchmarks y especificaciones (aireleasetracker): https://aireleasetracker.com/model/qwen/qwen3.8-27b
- Guia de especificaciones y requisitos de hardware (yottalabs): https://www.yottalabs.ai/post/qwen-3-8-27b-specs-hardware-requirements-how-to-run-2026
