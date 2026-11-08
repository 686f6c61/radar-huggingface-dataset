# prithivMLmods/Qwen3.5-4B-abliterated-NVFP4-GGUF

## Resumen

Qwen3.5-4B-abliterated-NVFP4-GGUF es una cuantizacion en formato GGUF con precision NVFP4 del modelo Qwen3.5-4B de Alibaba, publicada por el usuario prithivMLmods. El modelo base es un transformer denso de 4.205.751.552 parametros (4B) con arquitectura hibrida Gated DeltaNet + Gated Attention, ventana de contexto nativa de 262.144 tokens (extensible a mas de 1 millon), vocabulario de 248.000 tokens para 201 idiomas y capacidad multimodal de fusion temprana para texto, imagen y video. La variante "abliterated" elimina los comportamientos de rechazo del modelo original, y la cuantizacion NVFP4 esta optimizada para aceleradores NVIDIA Blackwell con Tensor Cores FP4 nativos.

El interes de esta publicacion es doble. Por un lado, ofrece una via para ejecutar un modelo multimodal de 4B con contexto muy largo en hardware Blackwell (RTX Pro 6000, serie RTX 50, B200, B300) aprovechando la aceleracion FP4 por hardware. Por otro lado, la variante abliterated elimina los guardarrailes del modelo original, lo que cambia por completo el perfil de riesgo para uso en produccion. En las pruebas del autor sobre una RTX PRO 6000 con 96 GB de VRAM se obtuvieron 332,69 tokens/s de procesamiento de prompt y 196,16 tokens/s de generacion con 99 capas offloaded a GPU y un pico de 5,50 GiB de VRAM.

La licencia declarada es Apache 2.0, heredada del modelo base, y el unico idioma declarado en la model card es el ingles, aunque el vocabulario del modelo base cubre 201 idiomas. El repositorio ocupa 4,7 GB y contiene un unico archivo GGUF de 4,75 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso hibrido Gated DeltaNet + Gated Attention, fusion temprana multimodal |
| Parametros totales | 4.205.751.552 (4B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens nativos, extensible a mas de 1M |
| Tipos de cuantizacion | NVFP4 (unica variante publicada en este repo) |
| Idiomas soportados | Ingles declarado en la model card; vocabulario del modelo base para 201 idiomas |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (archivo unico de 4,75 GB) |

## Arquitectura y entrenamiento

El modelo base Qwen3.5-4B emplea una arquitectura hibrida que combina capas Gated DeltaNet con capas de atencion con compuertas (Gated Attention), un diseno que busca reducir el coste computacional de la atencion en contextos largos manteniendo la capacidad de recuperacion de informacion. Incorpora prediccion multi-token (MTP) y entrenamiento de fusion temprana que unifica la comprension de texto, imagen y video en un unico espacio de representacion. El vocabulario de 248.000 tokens esta disenado para cubrir 201 idiomas.

La informacion proporcionada no detalla el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO en el modelo base. La variante abliterated aplica una modificacion post-entrenamiento que elimina las direcciones de activacion asociadas a respuestas de rechazo, un proceso documentado por el mismo autor en publicaciones anteriores (Qwen3-4B-2507-abliterated) mediante un metodo de abliteracion que no requiere TransformerLens. La cuantizacion NVFP4 se realizo con llama.cpp y esta orientada especificamente a los Tensor Cores FP4 de la arquitectura Blackwell (SM120, GB202).

## Capacidades

- Generacion de texto y razonamiento complejo, con un indice de inteligencia de 27 en Artificial Analysis Intelligence Index segun el autor.
- Razonamiento multimodal: comprension de imagen y video mediante fusion temprana, con 65,4% en MMMU-Pro segun la model card.
- OCR y analisis de documentos.
- Respuesta a preguntas visuales (VQA).
- Generacion de codigo.
- Tool calling y function calling nativos, orientados a flujos de trabajo agenticos.
- Razonamiento multi-paso para agentes.
- Prediccion multi-token (MTP) en el modelo base; la model card indica que esta build NVFP4 es solo texto y no usa decodificacion especulativa.
- Capacidades multilingues derivadas del vocabulario de 248.000 tokens del modelo base.
- Comportamiento sin guardarrailes de rechazo (variante abliterated).

## Casos de uso

- Analisis de documentos largos: con 262.144 tokens de contexto nativo, el modelo puede ingerir contratos, informes o expedientes completos en una sola pasada y responder preguntas sobre su contenido sin necesidad de fragmentacion.
- Procesamiento de facturas y formularios con OCR: la capacidad multimodal permite extraer campos estructurados directamente de imagenes de documentos, adecuado para pipelines de digitalizacion en hardware Blackwell.
- Atencion al cliente multi-turno: el contexto largo y el soporte de tool calling permiten mantener historiales extensos y consultar sistemas externos (pedidos, stock, estado de cuenta) durante la conversacion.
- Agentes de automatizacion: el razonamiento multi-paso y el function calling nativo permiten construir agentes que encadenan busquedas, calculos y acciones sobre APIs.
- Generacion de codigo en pipelines de CI/CD: el modelo puede integrarse en herramientas de revision automatica o generacion de tests, con la ventaja de ejecutarse en una GPU consumer Blackwell con unos 5,5 GiB de VRAM en FP4.
- Investigacion sobre alineacion y seguridad: la variante abliterated sirve como objeto de estudio para analizar que comportamientos se eliminan al suprimir las direcciones de rechazo y como afecta a la utilidad y al riesgo del modelo.
- Despliegue en el borde: con 4,75 GB de pesos y un pico de 5,50 GiB de VRAM medido, cabe en estaciones de trabajo con GPU Blackwell de gama alta y en servidores con multiples instancias por GPU.

## Benchmarks y rendimiento

Resultados declarados por el autor para el modelo base Qwen3.5-4B (no especificos de esta cuantizacion):

| Benchmark | Resultado |
|---|---|
| Artificial Analysis Intelligence Index | 27 |
| MMMU-Pro (razonamiento multimodal) | 65,4% |

Rendimiento medido de esta cuantizacion NVFP4 en NVIDIA RTX PRO 6000 Blackwell Server Edition (96 GB VRAM, llama-cli, `-ngl 99`, contexto 8.192, KV cache `q8_0`):

| Metrica | Valor |
|---|---|
| Velocidad media de procesamiento de prompt | 332,69 tokens/s |
| Velocidad media de generacion | 196,16 tokens/s |
| Tiempo total de ejecucion | 38,4 s |
| Pico de VRAM | 5,50 GiB |
| Utilizacion pico de GPU | 89% |

No se han publicado resultados de MMLU, HumanEval o GSM8K en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 5,5 GiB en FP4 con contexto de 8.192 tokens y KV cache en `q8_0`, segun la medicion del autor.
- GPU recomendadas: NVIDIA RTX PRO 6000 Blackwell, RTX serie 50, B200 y B300, todas con soporte nativo de Tensor Cores FP4 (SM120).
- Compatibilidad con GPU consumer: si, en tarjetas Blackwell de la serie RTX 50 con suficiente VRAM; en arquitecturas anteriores (Ampere, Ada) la cuantizacion NVFP4 no aprovecha la aceleracion por hardware y puede degradar el rendimiento.
- Opciones de despliegue: llama.cpp (`llama-cli`), con soporte declarado para vLLM, Ollama y text-generation-inference en el ecosistema del modelo base.
- Latencia y throughput: 196,16 tokens/s de generacion y 332,69 tokens/s de prompt en la configuracion medida; el rendimiento varia con el prompt, la build y los parametros de ejecucion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multimodal | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3.5-4B-abliterated-NVFP4-GGUF | 4B | 262K (extensible a 1M+) | Si (texto, imagen, video) | Apache 2.0 | Variante sin guardarrailes, optimizada para Blackwell FP4 |
| Falcon-H1R-7B | 7B | No disponible | No disponible | No disponible | Superado por Qwen3.5-4B en Intelligence Index segun el autor |
| NM-Nano-9B-V2 | 9B | No disponible | No disponible | No disponible | Superado por Qwen3.5-4B en Intelligence Index segun el autor |
| GPT-OSS-20B | 20B | No disponible | No disponible | No disponible | Rendimiento comparable en razonamiento complejo con unas 5 veces mas parametros, segun el autor |

## Limitaciones y advertencias

- La variante abliterated elimina los comportamientos de rechazo: puede generar contenido que el modelo original declinaria, con implicaciones legales y reputacionales en produccion.
- Riesgo de alucinacion inherente a modelos de 4B, especialmente en tareas de razonamiento complejo y contextos muy largos.
- La model card solo declara ingles; el rendimiento en otros idiomas, aunque el vocabulario los cubra, no esta verificado.
- La cuantizacion NVFP4 esta disenada para Blackwell; en otras arquitecturas el rendimiento y la calidad pueden diferir.
- La build NVFP4 es solo texto segun la model card, por lo que las capacidades de imagen y video del modelo base no estan disponibles en este archivo.
- Los benchmarks de MMMU-Pro e Intelligence Index corresponden al modelo base, no a esta cuantizacion ni a la variante abliterated.
- El repositorio tiene 0 descargas y 1 like en el momento de la consulta, sin validacion independiente de la comunidad.
- Aunque la licencia es Apache 2.0, el uso comercial de una variante sin guardarrailes exige evaluacion legal propia y filtros adicionales.

## Enlaces

- [Hugging Face: prithivMLmods/Qwen3.5-4B-abliterated-NVFP4-GGUF](https://huggingface.co/prithivMLmods/Qwen3.5-4B-abliterated-NVFP4-GGUF)
- [Modelo base: Qwen/Qwen3.5-4B](https://huggingface.co/Qwen/Qwen3.5-4B)
- [Version MTP del mismo autor: prithivMLmods/Qwen3.5-4B-MTP-GGUF](https://huggingface.co/prithivMLmods/Qwen3.5-4B-MTP-GGUF)
- [Publicacion previa de abliteracion: prithivMLmods/Qwen3-4B-2507-abliterated-GGUF](https://huggingface.co/prithivMLmods/Qwen3-4B-2507-abliterated-GGUF)
- [llama.cpp](https://github.com/ggml-org/llama.cpp)
