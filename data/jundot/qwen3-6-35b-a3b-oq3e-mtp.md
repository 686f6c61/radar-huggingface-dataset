# Jundot/Qwen3.6-35B-A3B-oQ3e-mtp

## Resumen

Qwen3.6-35B-A3B-oQ3e-mtp es una cuantizacion de precision mixta en formato MLX del modelo Qwen/Qwen3.6-35B-A3B, un modelo de lenguaje y vision con arquitectura de mezcla de expertos (MoE) desarrollado por el equipo Qwen de Alibaba. La cuantizacion la ha realizado el usuario Jundot mediante la herramienta oQ (oMLX v0.8.0), que asigna bits por capa segun la sensibilidad medida de cada una y aplica redondeo con matriz de importancia y reajuste por minimos cuadrados ponderados. El checkpoint incluye el backbone de lenguaje, el codificador de vision y la cabeza de prediccion multi-token (MTP).

El modelo base combina 35.952 millones de parametros totales con solo 3.000 millones activos por token, gracias a un diseno MoE con capas hibridas de Gated DeltaNet y Gated Attention. Esta cuantizacion reduce el peso a 3.978 bits por peso de media (16.651 GiB), manteniendo el backbone en 3.807 bits/weight, lo que permite ejecutar un modelo de 35B en hardware Apple Silicon con memoria unificada moderada.

Es relevante para desarrolladores que trabajan en el ecosistema MLX y necesitan desplegar un modelo multimodal (image-text-to-text) de gran tamano en equipos locales con GPU integrada de Apple, sin renunciar a capacidades de razonamiento, vision y generacion de codigo. La licencia Apache-2.0 facilita el uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE con capas hibridas Gated DeltaNet + Gated Attention, con codificador de vision y cabeza MTP |
| Parametros totales | 35.951.822.704 (35,95B) |
| Parametros activos | 3B (aproximado, segun el nombre A3B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Precision mixta oQ3e: affine 3-bit group 64 (89,6%), 4-bit group 64 (2,3%), 6-bit group 64 (2,4%), 8-bit group 128 (0,36%), 8-bit group 64 (4,0%), BF16 (1,3%). Media 3,978 bits/weight |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX), 17,9 GB de repo, 16.651 GiB reales |

## Arquitectura y entrenamiento

El modelo base es un transformer MoE multimodal con un layout hibrido que intercala capas de Gated DeltaNet (atencion lineal con estado recurrente) y capas de Gated Attention clasica. Esta combinacion busca reducir el coste computacional del contexto largo manteniendo la calidad de atencion. El checkpoint incluye tres componentes: backbone de lenguaje (34,661B parametros logicos), codificador de vision (0,447B) y cabeza MTP (0,845B) para decodificacion especulativa multi-token.

La cuantizacion oQ3e no es uniforme: asigna bits segun la sensibilidad medida de cada capa, usa una matriz de importancia calculada con 128 muestras de 512 tokens y reajusta escala y sesgo por minimos cuadrados ponderados. El resultado es un checkpoint de 16.651 GiB con 3,978 bits/weight efectivos, frente a los ~71 GB que ocuparia en BF16. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF/DPO en el modelo base.

## Capacidades

- Generacion de texto y razonamiento multi-turno con arquitectura MoE de 35B parametros totales y 3B activos.
- Comprension de imagenes y texto (pipeline image-text-to-text) mediante el codificador de vision incluido.
- Generacion de codigo y matematicas, capacidades habituales en la familia Qwen3.
- Decodificacion especulativa multi-token (MTP) para acelerar la inferencia.
- Soporte de tool calling y function calling: no confirmado en la informacion disponible.
- Soporte de agentes y razonamiento multi-paso: no confirmado en la informacion disponible.
- Capacidades multilingues: no disponible el listado de idiomas.
- Modo thinking: no confirmado en la informacion disponible.

## Casos de uso

- Asistente de codigo en local sobre Apple Silicon: el checkpoint MLX de 16,6 GiB permite ejecutar un modelo de 35B con capacidades de generacion de codigo en un Mac con memoria unificada de 32 GB o superior, usando la cabeza MTP para reducir latencia.
- Analisis de documentos con imagenes: al incluir codificador de vision, se puede usar para extraer informacion de capturas, diagramas o formularios escaneados junto con texto, en flujos de transcripcion y resumen.
- Prototipado de agentes multimodales: la combinacion de vision y lenguaje permite construir pipelines que reciben imagenes y texto y generan acciones o respuestas estructuradas, aunque el soporte de tool calling debe validarse empiricamente.
- Inferencia en entornos sin conectividad: al ser un checkpoint local en MLX, es adecuado para despliegues en portatiles o estaciones de trabajo Apple sin dependencia de la nube, con licencia Apache-2.0 para uso comercial.
- Experimentacion academica con cuantizacion: el checkpoint documenta la distribucion de bits por capa, lo que lo convierte en un caso de estudio para investigar el impacto de la precision mixta en modelos MoE multimodales.
- Generacion de contenido asistida por vision: descripcion de imagenes, respuesta a preguntas visuales (VQA) y generacion de texto condicionada por imagen en aplicaciones de accesibilidad o catalogacion.
- Evaluacion comparativa de tecnicas de cuantizacion: util para comparar oQ3e frente a otras cuantizaciones (GGUF Q4, AWQ) en terminos de calidad y velocidad en el mismo hardware.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: 16,6 GiB para los pesos; con overhead de inferencia (KV cache, activaciones) se recomienda al menos 24-32 GB de memoria unificada.
- Hardware objetivo: Apple Silicon (M1/M2/M3/M4 Pro, Max o Ultra) con memoria unificada suficiente; la libreria es MLX, por lo que no esta pensada para GPU NVIDIA.
- Cabe en consumer hardware Apple: si, en equipos con 32 GB o mas de memoria unificada; en 24 GB es ajustado y depende de la longitud de contexto.
- Opciones de despliegue: MLX (libreria nativa), oMLX; no compatible directamente con vLLM, llama.cpp, Ollama o TGI por el formato MLX y la arquitectura hibrida.
- Latencia y throughput: no disponibles. La cabeza MTP puede mejorar la velocidad de decodificacion, pero no se han publicado cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Qwen3.6-35B-A3B-oQ3e-mtp | 35,95B | 3B | no disponible | MLX safetensors (3,978 bits/weight) | Apache-2.0 | Hugging Face, 475 descargas |
| Qwen/Qwen3.6-35B-A3B (base) | 35,95B | 3B | no disponible | safetensors BF16 | Apache-2.0 | Hugging Face (modelo original) |
| Cuantizaciones GGUF del mismo base | 35,95B | 3B | no disponible | GGUF (Q4, Q5, etc.) | Apache-2.0 | no disponible en esta informacion |
| Otros MoE de ~30-40B (p. ej. familia Mixtral o Qwen MoE) | no disponible | no disponible | no disponible | varios | varias | no disponible |

No se dispone de datos de rendimiento comparativo en la informacion proporcionada.

## Limitaciones y advertencias

- La cuantizacion a 3,978 bits/weight introduce perdida de calidad respecto al modelo base en BF16; el autor indica que la version de noviembre de 2026 reduce el error, pero no cuantifica la degradacion.
- Solo es ejecutable con la libreria MLX en hardware Apple; no hay soporte para CUDA, ROCm ni CPU generica en este checkpoint.
- No se dispone de informacion sobre sesgos, tasas de alucinacion ni evaluaciones de seguridad del modelo base.
- El listado de idiomas soportados no esta disponible; no se puede garantizar calidad multilingue sin validacion.
- La longitud de contexto no esta documentada en la informacion disponible, lo que impide planificar casos de uso con contexto largo.
- Aunque la licencia es Apache-2.0 y permite uso comercial, el modelo base puede tener terminos adicionales que conviene revisar antes de desplegar en produccion.
- El repo tiene 0 likes y 475 descargas, lo que sugiere poca validacion comunitaria; se recomienda evaluar la calidad antes de adoptarlo.
- El soporte de tool calling, agentes y modo thinking no esta confirmado; debe probarse empiricamente.
- Es un checkpoint cuantizado de un modelo de terceros: los errores del modelo base se propagan y la cuantizacion puede amplificarlos en tareas sensibles.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Jundot/Qwen3.6-35B-A3B-oQ3e-mtp
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Repositorio de la herramienta oQ/oMLX: https://github.com/jundot/omlx
- Pull request de mejora oQe: https://github.com/jundot/omlx/pull/4930
- Pull request de refinamiento del redondeo oQe: https://github.com/jundot/omlx/pull/5292
