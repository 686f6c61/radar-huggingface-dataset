# florian862-art/ERNIE-5.5-Flash-Preview-Basalt

## Resumen

ERNIE-5.5-Flash-Preview-Basalt es una conversión no oficial, realizada por la comunidad, del modelo baidu/ERNIE-5.5-Flash-Preview al formato de fichero único `.basalt` para el motor de inferencia local Basalt. El modelo original lo desarrolla Baidu y es un transformer de tipo Mixture of Experts (MoE) con 42 capas de expertos enrutados y 512 expertos por capa, orientado a generación de texto, razonamiento con modo de pensamiento y llamadas a herramientas. Esta conversión no modifica los pesos: solo los reempaqueta en un contenedor que Basalt puede cargar en GPUs NVIDIA Blackwell (sm_120).

La relevancia de esta ficha es doble. Por un lado, documenta un modelo de Baidu de gran tamaño con ventana de contexto nativa de hasta 1.048.576 tokens y cuantización MXFP4 en los expertos. Por otro, ilustra un patrón de despliegue poco habitual: el motor Basalt reparte los expertos MoE entre la VRAM de una o varias GPUs Blackwell y la memoria RAM del sistema, lo que permite ejecutar un modelo de 166,7 GB en equipos con 16-32 GB de VRAM y 192 GB de RAM recomendados.

La conversión incluye además un drafter especulativo de tres etapas (DSpark) empaquetado en el mismo fichero, lo que acelera la decodificación sin alterar la salida del modelo, ya que los tokens propuestos se verifican. La licencia declarada es Apache 2.0, heredada del release de Baidu, y los idiomas soportados son inglés y chino. No se dispone de datos publicados de benchmarks ni de especificaciones completas del modelo base en la información proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (42 capas MoE x 512 expertos enrutados; incluye atencion MLA-DSA, Lightning Indexer, HCA y mHC) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | Hasta 1.048.576 tokens (YaRN nativo); configurable con `--max-context` |
| Tipos de cuantizacion | MXFP4 en expertos enrutados (bit a bit del release original); FP8 128x128 en proyecciones densas convertido a Q8_0; BF16 en embeddings, head, claves de compresor e indexer; F32 en normas, mHC, sinks y routers |
| Idiomas soportados | Ingles (en), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | `.basalt` v2 (fichero unico autocontenido: pesos, tokenizer, plantilla de chat y drafter DSpark) |
| Tamano del fichero | 166,7 GB (155,3 GiB) |
| SHA-256 | `7af8cd7a90ce86c269c4fbe5a24f0b5f40266d5f72d054ba9999a7edda088728` |
| Memoria cargada | ~152,6 GiB (~9,1 GiB en GPU 0 para denso/KV/DSpark; resto de expertos entre GPU 0, GPUs peer y RAM del sistema) |
| Vision | No (el release preview de Baidu es solo texto) |

## Arquitectura y entrenamiento

El modelo base es un transformer MoE con 42 capas de expertos enrutados y 512 expertos por capa. La conversión conserva los códigos MXFP4 nativos de Baidu y las escalas UE8M0 bit a bit, de modo que el comportamiento numérico de los expertos es idéntico al del release original. Las proyecciones densas originales están en FP8 con bloques de 128x128; en esta conversión se descomprimen a F32 y se redondean una sola vez a Q8_0 siguiendo el redondeo de referencia de ggml. Los embeddings, la cabeza de salida, las claves del compresor y del indexer se mantienen en BF16, y las normas, mHC, sinks y routers en F32.

La arquitectura incorpora componentes que la model card nombra como HCA, MLA-DSA, Lightning Indexer y mHC, además de expertos compartidos y proyecciones latentes. No se detalla en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO. La conversión no ha realizado calibración, fine-tuning ni reentrenamiento: todos los pasos son conversiones deterministas de formato de pesos.

La innovación destacable en el plano de despliegue es el drafter DSpark de tres etapas (tres etapas SWA-mHC con cabeza Markov y de confianza), empaquetado como sección `dspark` verificada por SHA-256. Por defecto se activa con `--spec 8` y propone hasta 7 tokens por ventana; los tokens propuestos se verifican, por lo que la salida final es la del propio modelo. Se puede desactivar con `--spec 0`.

## Capacidades

- Generación de texto en inglés y chino.
- Razonamiento con modo de pensamiento (`<ernie:think>`) y control de esfuerzo mediante `reasoning_effort` con los niveles `none`, `low`, `medium`, `high` y `max`.
- Llamadas a herramientas en paralelo mediante XML `<ernie:tool_call>`, gestionadas por el servidor de Basalt.
- Ventana de contexto muy larga, hasta 1.048.576 tokens con YaRN nativo.
- Decodificación especulativa integrada con el drafter DSpark de tres etapas.
- API compatible con OpenAI y Anthropic a través del servidor de Basalt.
- Sin capacidades de visión en este release preview (solo texto).
- No se documentan en la información disponible capacidades de audio ni de agente multi-paso más allá del tool calling.

## Casos de uso

- Análisis de documentos largos en inglés o chino: con hasta 1.048.576 tokens de contexto, el modelo puede procesar libros completos, expedientes o bases de código extensas en una sola pasada, algo inviable en modelos con ventanas de 8K-128K.
- Asistente con tool calling en producción: el soporte de `<ernie:tool_call>` en paralelo y la API compatible con OpenAI permiten integrarlo en orquestadores existentes sin reescribir la capa de integración.
- Razonamiento con presupuesto controlado: el parámetro `reasoning_effort` permite ajustar el coste computacional por consulta, usando `low` para clasificación o extracción y `high`/`max` para problemas matemáticos o de planificación.
- Despliegue local en estaciones de trabajo con Blackwell: el reparto de expertos entre VRAM y RAM del sistema hace posible ejecutar el modelo en equipos con dos GPUs de 16 GB y 192 GB de RAM, sin depender de un clúster.
- Servicio de chat multi-turno con caché de conversación en disco: la configuración de Basalt incluye `conversation-cache-disk-mib`, útil para mantener sesiones largas con contexto persistente entre peticiones.
- Investigación sobre cuantización MoE: al conservar los códigos MXFP4 bit a bit y documentar la conversión de FP8 a Q8_0, el fichero sirve como referencia reproducible para estudiar el impacto del formato en la calidad.
- Generación de código y texto técnico bilingüe: aunque no se publican benchmarks, el modelo está orientado a generación de texto y admite prompts en inglés y chino, adecuado para documentación técnica en ambos idiomas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona la existencia de benchmarks en la documentación de Basalt (`docs/models/ernie55.md`), pero no incluye cifras. Tampoco se proporcionan datos de latencia o throughput medidos.

## Requisitos de hardware

- VRAM: el fichero pesa 166,7 GB y el modelo cargado ocupa ~152,6 GiB, de los cuales ~9,1 GiB corresponden a GPU 0 (pesos densos, KV cache y DSpark). El resto de expertos se reparte entre GPU 0, GPUs peer opcionales y RAM del sistema paginada.
- GPU recomendadas: NVIDIA Blackwell (sm_120). La configuración de ejemplo usa dos GPUs de 16 GB en modo `peer`; también admite una sola GPU con `"gpu": "0"` y sin `"gpu-mode"`.
- GPUs consumer: sí es viable en GPUs Blackwell de 16-32 GB, siempre que se acompañen de 192 GB de RAM del sistema (recomendado para el rango 16-32 GB de VRAM).
- KV cache: con `--kv fp8` (por defecto) consume ~4,5 KB/token (~1,13 GiB a 262.144 tokens de contexto); con `--kv fp16`, ~8,7 KB/token.
- Opciones de despliegue: exclusivamente el motor Basalt (`bin/basalt serve`), con API compatible con OpenAI y Anthropic. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. La decodificación especulativa con DSpark (`--spec 8`, hasta 7 tokens por ventana) está pensada para reducir la latencia de generación, pero no se aportan cifras.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones completas (parámetros totales y activos) del modelo base, por lo que no es posible establecer una comparativa cuantitativa fiable con alternativas. La siguiente tabla recoge únicamente los datos verificables de esta conversión frente al release original de Baidu.

| Modelo | Formato | Tamano | Contexto | Licencia | Motor de inferencia |
|---|---|---|---|---|---|
| ERNIE-5.5-Flash-Preview-Basalt | `.basalt` (fichero unico) | 166,7 GB | Hasta 1.048.576 tokens | Apache 2.0 | Basalt (Blackwell) |
| baidu/ERNIE-5.5-Flash-Preview | safetensors (shards) | no disponible | no disponible | Apache 2.0 | no disponible |

## Limitaciones y advertencias

- Conversión no oficial: no está afiliada, patrocinada ni respaldada por Baidu ni por los mantenedores de Basalt. Para producción conviene evaluar el release oficial de Baidu.
- Compatibilidad de hardware restringida: Basalt está diseñado para GPUs NVIDIA Blackwell (sm_120); no funcionará en arquitecturas anteriores.
- Requisito de memoria elevado: aunque quepa en GPUs de 16 GB, necesita ~152,6 GiB de memoria total y se recomiendan 192 GB de RAM del sistema, lo que limita su uso a estaciones de trabajo o servidores con mucha memoria.
- Idiomas limitados: solo inglés y chino; no se declara soporte de español ni de otros idiomas.
- Sin visión: el release preview es solo texto.
- Riesgo de alucinación: no se documentan evaluaciones de fidelidad ni de sesgos en la información disponible; como en cualquier modelo generativo, conviene validar las salidas en dominios críticos.
- Sin benchmarks publicados: no hay cifras que permitan estimar la calidad frente a alternativas, lo que dificulta la decisión de adopción.
- Restricciones de licencia: los pesos de ERNIE 5.5 Flash Preview están bajo Apache 2.0, pero ERNIE 5.5 Flash Base se rige por la ERNIE 5.5 Flash Base Model License Agreement v1.0. "ERNIE" y "Baidu" son marcas registradas de Baidu, Inc., usadas aquí solo con fines identificativos (Apache-2.0 §6).
- Cero adopción verificable: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de uso en producción.

## Enlaces

- Repositorio de la conversión: https://huggingface.co/florian862-art/ERNIE-5.5-Flash-Preview-Basalt
- Modelo base oficial: https://huggingface.co/baidu/ERNIE-5.5-Flash-Preview
- Modelo base (variante Base): https://huggingface.co/baidu/ERNIE-5.5-Flash-Base
- Motor Basalt (repositorio): https://github.com/jesdga95/basalt
- Sitio de Basalt: https://basalt.jgulfo.com
- PR de soporte ERNIE-5.5-Flash: https://github.com/jesdga95/basalt/pull/687
- Documentación del modelo en Basalt: https://github.com/florian862-art/basalt/blob/feat/ernie55/docs/models/ernie55.md
- Documentación de precisión en Basalt: https://github.com/florian862-art/basalt/blob/feat/ernie55/docs/precision/ernie55.md
