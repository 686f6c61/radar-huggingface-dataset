# masahiroid/DeepSeek-Coder-V2-Lite-Instruct-FLOW

## Resumen

DeepSeek-Coder-V2-Lite-Instruct-FLOW es un contenedor de pesos en formato propietario `.gguf.flow`, derivado del modelo DeepSeek-Coder-V2-Lite-Instruct de DeepSeek. No se trata de un modelo nuevo entrenado desde cero, sino de una reempaquetación del modelo base en una cuantización de 2 bits (denominada "Pyrite") junto con un esquema de compresión y streaming desde disco (NVMe) hacia memoria, diseñado para ejecutarse en el runtime FLOW Studio (macOS y Windows). El autor es Masahiro Nakatsugawa (AntenneFrance / n.p.minerva & Co.), no DeepSeek.

La propuesta técnica central es el desacoplamiento entre RAM y almacenamiento: los pesos permanecen en SSD y se descomprimen en vuelo (byte-shuffle + Zstandard) hacia un búfer de memoria acotado a unos 2,5 GiB, lo que permite ejecutar el modelo en equipos con 16 GB de RAM (Apple Silicon y PC Windows) sin caídas por OOM. El modelo base DeepSeek-Coder-V2-Lite es un transformer MoE de 16B parámetros totales y 2,4B activos, con 128K de contexto y foco en código y matemáticas.

La relevancia de esta ficha es doble: por un lado, documenta una técnica de despliegue out-of-core aplicable a modelos MoE de gran tamaño en hardware de consumo; por otro, advierte de que el artefacto publicado no es compatible con llama.cpp, Ollama o LM Studio, y de que la cuantización a 2 bits degrada la calidad respecto al modelo original. Para uso estándar existe una build GGUF separada del mismo autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE), derivada de DeepSeek-Coder-V2-Lite |
| Parametros totales | 16B (modelo base) |
| Parametros activos | 2,4B (modelo base) |
| Longitud de contexto | 128K (modelo base; no confirmado en el contenedor FLOW) |
| Tipos de cuantizacion | 2 bits (esquema "Pyrite", guiado por sensibilidad) |
| Idiomas soportados | no disponible |
| Licencia | deepseek-license (licencia del modelo base) |
| Formato de pesos | `.gguf.flow` (contenedor FLOW-Boost propietario); GGUF estándar en repo separado |
| Tamano del repositorio | 6,1 GB |
| Runtime compatible | FLOW Studio (macOS y Windows) |
| Huella de RAM objetivo | ~2,5 GiB fijos |
| Compresion adicional | 8-12 % sobre pesos de 2 bits (Zstd + byte-shuffle) |
| API | Compatible con OpenAI (`http://localhost:8080/v1`) |

## Arquitectura y entrenamiento

El modelo subyacente, DeepSeek-Coder-V2-Lite-Instruct, es un transformer con arquitectura MoE (Mixture of Experts) de 16B parámetros totales y 2,4B activos por token, entrenado por DeepSeek con un corpus orientado a código y matemáticas y ajustado con instrucciones (fase Instruct). No se dispone en la información proporcionada de detalles adicionales sobre composición del dataset, número de tokens de entrenamiento ni si se empleó RLHF o DPO en la fase de alineamiento.

La innovación de esta publicación no está en el entrenamiento sino en el contenedor de despliegue. El autor aplica un esquema de streaming out-of-core inspirado en el trabajo *LLM in a Flash* de Apple (Alizadeh et al., 2023) y en filtros de reordenamiento de bytes sin pérdida (Blosc, IBM ZipNN), especializado para el pipeline de memoria unificada de Metal en Apple Silicon. Concretamente, los pesos se reorganizan por planos de bytes y se comprimen con Zstandard; en tiempo de inferencia se descomprimen en vuelo hacia un búfer de RAM acotado. El autor afirma que la cuantización de 2 bits es bit a bit idéntica a la referencia "Pyrite" (ε ≡ 0.0), es decir, que el reempaquetado no introduce pérdida adicional sobre esa cuantización. La compresión sobre pesos ya cuantizados a 2 bits es limitada (8-12 %), frente al 31,5 % que se lograría sobre FP16/BF16 sin cuantizar.

## Capacidades

- Generación de texto y código en el modelo base DeepSeek-Coder-V2-Lite-Instruct, con soporte para múltiples lenguajes de programación.
- Razonamiento matemático y resolución de problemas algorítmicos (capacidad heredada del modelo base).
- Relleno de código (fill-in-the-middle) y completado en editores, según las capacidades del modelo base.
- Soporte de instrucciones en formato chat (variante Instruct).
- Servidor local con API compatible con OpenAI, lo que permite integrarlo con clientes y SDK existentes.
- Ejecución en hardware de consumo con memoria acotada gracias al streaming desde disco.
- No se documentan en la información disponible capacidades de visión, audio, tool calling nativo ni modo de razonamiento extendido (thinking) para esta variante.

## Casos de uso

- Asistencia de código en portátiles Apple Silicon de 16 GB: el modelo se ejecuta con una huella de RAM de ~2,5 GiB, lo que deja memoria libre para el IDE, el navegador y el sistema operativo, algo inviable con el modelo completo en memoria.
- Autocompletado y chat de código en local sin conexión: al exponer una API compatible con OpenAI en `localhost:8080`, se puede conectar a extensiones de editor o scripts propios sin depender de servicios en la nube.
- Prototipado de pipelines de generación de código en Windows: FLOW Studio ofrece un lanzador para Windows, lo que permite probar el modelo en equipos sin GPU dedicada de gran VRAM.
- Evaluación de técnicas out-of-core: el contenedor sirve como banco de pruebas para medir latencia y throughput del streaming NVMe-RAM frente a la carga completa en memoria.
- Despliegue en entornos con restricciones de memoria: útil en máquinas virtuales o contenedores con límites estrictos de RAM donde un MoE de 16B en formato estándar no cabría.
- Educación y demostraciones: permite mostrar el funcionamiento de un MoE de 16B en hardware asequible, con la advertencia de que la calidad está degradada por la cuantización a 2 bits.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni comparativas cuantitativas con el modelo base o con otras cuantizaciones, más allá de la afirmación de equivalencia bit a bit con la cuantización Pyrite de 2 bits.

## Requisitos de hardware

- RAM: ~2,5 GiB de huella activa declarada por el autor, independientemente del tamaño del modelo, gracias al streaming desde SSD.
- Almacenamiento: se requiere SSD NVMe con al menos 6,1 GB libres para el contenedor; el rendimiento depende de la velocidad de lectura secuencial y aleatoria del disco.
- GPU: no se especifican modelos concretos; el runtime está orientado a Apple Silicon (memoria unificada con Metal) y a PC Windows. No se documenta soporte para A100, H100 ni RTX 4090 en esta variante.
- Hardware de consumo: el autor indica compatibilidad con Macs Apple Silicon de 16 GB y PC Windows; no se detallan requisitos mínimos de CPU ni de GPU en Windows.
- Despliegue: exclusivamente mediante FLOW Studio (macOS y Windows). No es compatible con vLLM, llama.cpp, Ollama, TGI ni LM Studio; para esos runtimes existe la build GGUF estándar en `masahiroid/DeepSeek-Coder-V2-Lite-Instruct-Pyrite-2bit-GGUF`.
- Latencia y throughput: no disponibles. El streaming desde disco introduce coste adicional frente a la inferencia en memoria, pero no se publican cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Formato | Licencia | Runtime |
|---|---|---|---|---|---|---|
| DeepSeek-Coder-V2-Lite-Instruct-FLOW | 16B totales / 2,4B activos | 128K (base) | 2 bits (Pyrite) | `.gguf.flow` | deepseek-license | FLOW Studio |
| DeepSeek-Coder-V2-Lite-Instruct (original) | 16B totales / 2,4B activos | 128K | FP16/BF16 | safetensors | deepseek-license | vLLM, TGI, transformers |
| DeepSeek-Coder-V2-Lite-Instruct-Pyrite-2bit-GGUF | 16B totales / 2,4B activos | 128K (base) | 2 bits (Pyrite) | GGUF | deepseek-license | llama.cpp, Ollama, LM Studio |
| Qwen2.5-Coder-7B-Instruct | 7B densos | 128K | varias (GGUF, AWQ, etc.) | safetensors, GGUF | Apache 2.0 | amplio soporte |

La comparativa relevante es frente a la build GGUF estándar del mismo autor: mismo modelo y misma cuantización de 2 bits, pero con compatibilidad con el ecosistema llama.cpp. Frente al modelo original en FP16, el FLOW pierde precisión por la cuantización a 2 bits pero gana en requisitos de memoria. No se dispone de datos de rendimiento para comparar calidad entre variantes.

## Limitaciones y advertencias

- La cuantización a 2 bits degrada la calidad de forma significativa respecto al modelo original en FP16/BF16; no es adecuada para tareas que requieran precisión alta en código o matemáticas.
- El formato `.gguf.flow` es propietario y solo funciona con FLOW Studio; no es portable a otros runtimes.
- El rendimiento depende críticamente de la velocidad del SSD NVMe; discos lentos pueden provocar latencias altas en generación.
- La licencia deepseek-license del modelo base impone condiciones de uso comercial que deben revisarse antes de un despliegue en producción; no es una licencia permisiva tipo Apache 2.0.
- No se documentan idiomas soportados ni evaluación multilingüe en esta variante.
- Riesgo de alucinación inherente al modelo base, agravado por la cuantización agresiva.
- No se han publicado benchmarks que permitan cuantificar la degradación real frente al modelo original.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validación comunitaria.
- La model card contiene erratas (dos puntos numerados como "3") y afirmaciones de rendimiento no verificadas de forma independiente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/masahiroid/DeepSeek-Coder-V2-Lite-Instruct-FLOW
- Build GGUF estándar del mismo autor: https://huggingface.co/masahiroid/DeepSeek-Coder-V2-Lite-Instruct-Pyrite-2bit-GGUF
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-Coder-V2-Lite-Instruct
- Runtime FLOW Studio (GitHub): https://github.com/antennefrance/flow-studio
- Releases de FLOW Studio: https://github.com/antennefrance/flow-studio/releases
- Licencia de FLOW Studio: https://github.com/antennefrance/flow-studio/blob/main/LICENSE
- ORCID del autor: https://orcid.org/0009-0000-3224-0103
- Paper de referencia *LLM in a Flash* (Alizadeh et al., 2023): no se proporciona enlace directo en la información disponible.
