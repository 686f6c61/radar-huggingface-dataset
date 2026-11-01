# hakunokina/Qwen3-235B-A22B-abliterated-oQ4e

## Resumen

Qwen3-235B-A22B-abliterated-oQ4e es una cuantización de 4 bits en formato MLX del modelo Qwen3-235B-A22B, un transformer de mezcla de expertos (MoE) desarrollado originalmente por el equipo Qwen de Alibaba. La variante concreta publicada por hakunokina parte del checkpoint FP8 de null-space, que a su vez aplica una técnica de "abliteration" sobre los pesos originales para eliminar la dirección de rechazo aprendida, de modo que el modelo responde a instrucciones que la versión alineada rechazaría. Esta build empaqueta esos pesos con oMLX en formato oQ4e, una cuantización afín de 4 bits calibrada con imatrix y orientada específicamente a Apple Silicon.

El interés de esta ficha es doble. Por un lado, demuestra que un MoE de 235.000 millones de parámetros totales y unos 22.000 millones activos puede ejecutarse en hardware de consumo profesional de Apple: el repositorio ocupa 136,3 GB y el autor reporta unos 20 tokens por segundo en decodificación sobre un Mac Studio M3 Ultra con 512 GB de memoria unificada. Por otro lado, ilustra el ecosistema de derivados que se está formando alrededor de Qwen3, con cadenas de cuantización que van del BF16 al FP8 y de ahí a formatos de 4 bits para runtimes alternativos.

Conviene subrayar que se trata de un modelo sin benchmarks de precisión publicados por el autor de esta build y con la alineación de seguridad eliminada a nivel de pesos, lo que lo hace inadecuado para despliegues de producción sin controles adicionales. La licencia Apache-2.0 se hereda del modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (qwen3_moe), 128 expertos, top-8, 94 capas |
| Parametros totales | 235.093.634.560 (~235B) |
| Parametros activos | ~22B (aproximado, segun model card) |
| Longitud de contexto | 32k nativo, extensible a ~128k con YaRN |
| Tipos de cuantizacion | oQ4e: afin 4 bits, group size 64, 378 tensores sensibles a 8 bits, 4,64 bits/peso efectivos |
| Idiomas soportados | no disponible (la model card no detalla idiomas; el set de calibración se llama `oqe_code_multilingual`) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors en formato MLX (librería `mlx`), orientado a oMLX |

## Arquitectura y entrenamiento

El modelo subyacente es Qwen3-235B-A22B, un transformer de mezcla de expertos con 128 expertos y enrutamiento top-8, distribuido en 94 capas. Es un modelo híbrido de razonamiento: admite los modificadores `/think` y `/no_think` para alternar entre modo de pensamiento explícito y respuesta directa. El contexto nativo es de 32.000 tokens, ampliable a unos 128.000 mediante escalado YaRN. Esta build no incluye cabeza MTP (multi-token prediction), ya que el checkpoint de origen tampoco la tiene.

Sobre el entrenamiento original de Qwen3 no se aportan detalles en la información disponible (número de tokens, composición del dataset, fases de RLHF o DPO). Lo que sí documenta el autor es la cadena de transformaciones: el checkpoint original se "ablitera" eliminando la dirección de rechazo a nivel de pesos (versión BF16 de null-space, ~438 GB), se convierte a FP8 con compressed-tensors (~236 GB) y finalmente se cuantiza a oQ4e mediante calibración imatrix sobre el conjunto `oqe_code_multilingual`, con cobertura de los 128 expertos. La innovación técnica destacable de esta build es precisamente el esquema de cuantización: 4 bits afines con grupo de 64 y una selección de 378 tensores que se mantienen en 8 bits por su sensibilidad, lo que eleva el coste efectivo a 4,64 bits por peso.

## Capacidades

- Generación de texto conversacional multi-turno con contexto nativo de 32k tokens.
- Razonamiento explícito en modo thinking (`/think`) y respuestas directas en modo no-thinking (`/no_think`).
- Tool calling y function calling: el autor reporta 5/5 ejecuciones correctas tanto en la API Anthropic (`/v1/messages`) como en la OpenAI (`/v1/chat/completions`).
- Capacidad de seguir instrucciones sin las restricciones de rechazo del modelo alineado, al haberse eliminado la dirección de rechazo a nivel de pesos.
- Generación de código y matemáticas: el set de calibración incluye datos de código multilingüe, aunque no se publican evaluaciones específicas.
- Capacidades multilingües heredadas de Qwen3, sin listado oficial de idiomas en esta ficha.
- Sin soporte de visión ni audio documentado en esta build.

## Casos de uso

- Asistente conversacional local en estaciones de trabajo Apple: el modelo cabe en un Mac con 192 GB de memoria unificada y se sirve mediante oMLX en las APIs de OpenAI y Anthropic, lo que permite integrarlo en clientes existentes sin cambios de código.
- Automatización de agentes con tool calling: los resultados 5/5 en ambas APIs indican que puede encadenar llamadas a funciones de forma fiable para orquestar flujos multi-paso, por ejemplo consultas a bases de datos internas o ejecución de comandos.
- Procesamiento de documentos largos: con 32k tokens nativos y extensión YaRN a ~128k, es adecuado para resumir contratos, analizar informes técnicos o extraer entidades de expedientes extensos en local.
- Generación de código en entornos con requisitos de privacidad: al ejecutarse íntegramente en local, permite autocompletado y revisión de código sin enviar el repositorio a servicios en la nube.
- Investigación sobre alineación y seguridad: al ser una variante abliterada, sirve como objeto de estudio para medir qué comportamientos emergen al eliminar la dirección de rechazo y cómo varían con la cuantización.
- Prototipado de razonamiento con modo thinking: útil para comparar cadenas de razonamiento explícitas frente a respuestas directas en tareas de matemáticas o lógica, con la ventaja de no depender de APIs externas.
- Servicio de inferencia personal con caché de prefijo: el autor documenta que un prompt de ~27k tokens pasa de ~101 s en frío a ~5,7 s con caché de prefijo, lo que hace viable mantener un contexto fijo largo (por ejemplo, un manual técnico) y hacer consultas sucesivas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de precisión en la información disponible. El autor indica explícitamente que no midió divergencia KL frente al checkpoint de origen ni ejecutó evaluaciones de exactitud, y remite a la model card del modelo abliterado original para la evaluación de la ablación.

Los únicos datos de rendimiento publicados son medidas de velocidad en un Mac Studio M3 Ultra con 512 GB y oMLX 0.7.3:

| Métrica | Valor |
|---|---|
| Prefill, prompt de ~27k tokens (caché fría) | ~101 s (~265 tok/s) |
| Mismo prefijo con caché de prefijo | ~5,7 s |
| Decodificación | ~20 tok/s |
| Tool calling (Anthropic / OpenAI, 5 ejecuciones) | 5/5 / 5/5 |
| Primera petición completa (~27k tokens, incluye carga) | ~123 s |

## Requisitos de hardware

- VRAM/memoria unificada: ~136 GB solo para los pesos; el autor recomienda 192 GB para contextos moderados y 256 GB o más para contextos largos.
- GPU recomendadas: Apple Silicon de gama alta; el autor validó en un Mac Studio M3 Ultra con 512 GB. No se documenta soporte para GPU NVIDIA en esta build, al estar empaquetada para MLX.
- GPU de consumo: no cabe en ninguna GPU de consumo convencional (RTX 4090 con 24 GB, por ejemplo); requiere hardware Apple con memoria unificada de al menos 192 GB.
- Despliegue: oMLX 0.7.3, que expone endpoints compatibles con OpenAI y Anthropic. El autor advierte que no se ha probado con `mlx-lm` estándar ni con LM Studio.
- Latencia y throughput: ~20 tok/s en decodificación y ~265 tok/s en prefill sobre M3 Ultra de 512 GB, según medidas de una sola ejecución del autor.
- Muestreo sugerido: temperatura 0,6 / top_p 0,95 / top_k 20 en modo thinking; temperatura 0,7 / top_p 0,8 / top_k 20 en modo no-thinking; `presence_penalty` en torno a 1,0 para mitigar repeticiones en builds cuantizadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato / runtime | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3-235B-A22B-abliterated-oQ4e (esta ficha) | 235B totales, ~22B activos | 32k (128k con YaRN) | MLX oQ4e, oMLX | Apache-2.0 | HuggingFace, 55 descargas |
| Qwen3-235B-A22B-abliterated-FP8 (null-space) | 235B totales, ~22B activos | 32k (128k con YaRN) | FP8 compressed-tensors | Apache-2.0 | HuggingFace |
| Qwen3-235B-A22B (original) | 235B totales, ~22B activos | 32k (128k con YaRN) | BF16 safetensors | Apache-2.0 | HuggingFace |

La comparación se limita a la cadena de derivados del mismo modelo base, ya que la información disponible no incluye datos de rendimiento que permitan contrastarlo con alternativas de otros fabricantes. La diferencia práctica entre las tres variantes es el formato y el tamaño: el original en BF16 ocupa del orden de 438 GB, el FP8 unos 236 GB y esta build 136,3 GB, con la particularidad de que solo la variante oQ4e está pensada para Apple Silicon.

## Limitaciones y advertencias

- Modelo abliterado: la dirección de rechazo se ha eliminado a nivel de pesos, por lo que seguirá instrucciones que el modelo alineado rechazaría. El usuario es responsable del uso y del cumplimiento legal aplicable.
- Sin evaluación de calidad: no se midió divergencia KL frente al checkpoint de origen ni se ejecutaron benchmarks de exactitud; la degradación introducida por la cuantización de 4 bits es desconocida.
- Riesgo de alucinación: inherente a los modelos de lenguaje y no cuantificado en esta build; la ausencia de benchmarks impide acotarlo.
- Idiomas: no se publica una lista oficial de idiomas soportados para esta variante.
- Contexto: 32k nativos; la extensión a ~128k depende de YaRN y no está validada en esta cuantización.
- Licencia: Apache-2.0 permite uso comercial, pero la eliminación de la alineación puede entrar en conflicto con políticas de plataformas o normativa sectorial; conviene revisar el encaje legal antes de desplegarlo.
- Compatibilidad: solo probado con oMLX 0.7.3; no hay garantías con `mlx-lm` estándar ni con LM Studio.
- Repeticiones: el autor recomienda `presence_penalty` cercano a 1,0 porque las builds cuantizadas tienden a repetir.
- Madurez: 55 descargas y 0 likes en el momento de la consulta; es una build reciente y poco validada por la comunidad.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/hakunokina/Qwen3-235B-A22B-abliterated-oQ4e
- Modelo base FP8: https://huggingface.co/null-space/Qwen3-235B-A22B-abliterated-FP8
- Variante abliterada en BF16: https://huggingface.co/null-space/Qwen3-235B-A22B-abliterated
- Modelo original: https://huggingface.co/Qwen/Qwen3-235B-A22B
- Herramienta de cuantización oMLX: https://omlx.ai
