# linellazatin/p-e-w_gpt-oss-20b-heretic-ara-v4-gguf

## Resumen

Este repositorio contiene una conversión a formato GGUF del modelo `p-e-w/gpt-oss-20b-heretic-ara-v4`, una variante del GPT-OSS-20B de OpenAI modificada mediante la herramienta Heretic para reducir el comportamiento de rechazo (refusal) conservando las capacidades generales del modelo original. La conversión la ha realizado el usuario linellazatin para poder ejecutar el modelo en llama.cpp sobre hardware de consumo (concretamente una AMD Radeon RX 7700 XT con 12 GiB de VRAM y backend Vulkan), ya que el checkpoint original en safetensors no era práctico en ese entorno con vLLM.

El modelo subyacente es un transformer de tipo Mixture-of-Experts con aproximadamente 20,9 mil millones de parámetros totales, desarrollado originalmente por OpenAI y posteriormente modificado por p-e-w. La modificación principal consiste en una ablación de rango arbitrario (Arbitrary-Rank Ablation, ARA) combinada con preservación de la norma de filas, una técnica que elimina direcciones del espacio de activaciones asociadas a comportamientos de rechazo. La conversión a GGUF preserva los pesos de los expertos en MXFP4 y exporta el resto en BF16/F32 mixtos, sin cuantización adicional ni reentrenamiento.

La relevancia de esta ficha radica en que ofrece una vía práctica para desplegar un modelo de ~21B con arquitectura MoE en equipos modestos mediante llama.cpp, manteniendo la plantilla de chat Harmony de la familia GPT-OSS. Es importante subrayar que no se trata de un modelo nuevo ni de un fine-tune independiente: es una conversión de formato del checkpoint de p-e-w, y toda la documentación metodológica y de evaluación debe consultarse en la model card del modelo fuente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts (MoE), basada en GPT-OSS-20B |
| Parametros totales | 20.914.757.184 (~20,9B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible en la informacion proporcionada (el ejemplo de uso de llama-server emplea `-c 4096`, ajustable por el usuario) |
| Tipos de cuantizacion | MXFP4 para pesos de expertos; BF16 y F32 mixtos para el resto; sin cuantizacion adicional post-conversion |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (origen: safetensors) |
| Tamano del repositorio | 13,8 GB |
| Plantilla de chat | Harmony |
| Herramienta de conversion | llama.cpp (`convert_hf_to_gguf.py`) |
| Modelo base | p-e-w/gpt-oss-20b-heretic-ara-v4 (a su vez derivado de openai/gpt-oss-20b) |
| Descargas | 228 |
| Likes | 0 |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de GPT-OSS-20B de OpenAI: un transformer con capas de mezcla de expertos (MoE) y aproximadamente 20,9B de parámetros totales. Sobre ese checkpoint, p-e-w aplicó una modificación mediante Heretic que emplea Arbitrary-Rank Ablation (ARA) junto con preservación de la norma de filas para reducir el comportamiento de rechazo. Este repositorio no introduce entrenamiento adicional: es una conversión de formato realizada con `convert_hf_to_gguf.py` de llama.cpp a partir del checkpoint en safetensors (revisión `35496bd3e94ed309cf8290e4a6f4ad72c59c05a9`), ejecutada con Python 3.13 y PyTorch en modo solo CPU.

Durante la conversión se preservó la representación MXFP4 original de los pesos de los expertos mediante la funcionalidad de repacking MXFP4 de llama.cpp, mientras que el resto de tensores se exportaron en la precisión BF16/F32 seleccionada automáticamente por el conversor. Se aplicaron dos ajustes de compatibilidad específicos del checkpoint: normalización de los nombres de los bloques y escalas MXFP4 para que coincidieran con lo que espera el conversor, y sustitución del backend de tokenizador declarado (`TokenizersBackend`, incompatible con la versión de Transformers instalada) por `PreTrainedTokenizerFast`, tras verificar la tokenización y el funcionamiento de la plantilla Harmony. No se realizó reentrenamiento ni alteración deliberada del comportamiento del modelo.

## Capacidades

- Generación de texto conversacional con plantilla de chat Harmony, compatible con el ecosistema GPT-OSS.
- Razonamiento y uso enfocado a código: el autor de la conversión indica que su flujo de trabajo habitual requiere uso preciso y centrado en programación, y que lo consigue con estas ablaciones.
- Arquitectura MoE con enrutamiento por experto (los pesos de experto se mantienen en MXFP4).
- Compatibilidad con `llama-server` y `--jinja` para aplicar la plantilla de chat desde línea de comandos.
- Compatibilidad declarada con endpoints (`endpoints_compatible` en los tags del repositorio).
- Comportamiento de rechazo reducido respecto al GPT-OSS-20B original, gracias a la ablación ARA con preservación de norma de filas.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Soporte explícito de tool calling, agentes o modos de pensamiento: no disponible en la información proporcionada.

## Casos de uso

- Asistencia a la programación en local: el modelo puede servir como copiloto de código en un flujo de trabajo con llama.cpp y `llama-server`, aprovechando su enfoque declarado en uso preciso y de programación y su plantilla Harmony para estructurar las respuestas.
- Despliegue en estaciones de trabajo con GPU de consumo: al estar en GGUF y conservar los expertos en MXFP4, permite ejecutar un MoE de ~21B en tarjetas con 12 GiB de VRAM como la RX 7700 XT del autor, usando Vulkan como backend de cómputo.
- Sustitución de un checkpoint safetensors por GGUF en pipelines existentes de llama.cpp: útil cuando el entorno no soporta vLLM o cuando se prefiere una única herramienta de inferencia para todos los modelos.
- Experimentación con modelos ablacionados: investigadores que estudien el comportamiento de rechazo pueden comparar esta variante frente al GPT-OSS-20B original manteniendo el mismo runtime y la misma plantilla de chat.
- Servicio HTTP local de generación de texto: `llama-server` expone una API compatible con endpoints, lo que permite integrar el modelo en prototipos de aplicaciones internas sin depender de servicios en la nube.
- Evaluación de la fidelidad de conversiones GGUF: sirve como caso de estudio de cómo se preservan los pesos MXFP4 de un MoE durante la conversión y de los ajustes de compatibilidad necesarios (nombres de tensores, tokenizador).
- Pruebas de inferencia en CPU o GPU híbrida: al estar en GGUF, se puede repartir la carga entre CPU y GPU ajustando el offloading de capas en llama.cpp.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio remite a la model card del modelo fuente (`p-e-w/gpt-oss-20b-heretic-ara-v4`) para consultar la metodología, configuración y resultados de evaluación originales, pero no se incluyen cifras en la información proporcionada.

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 13,8 GB en disco; el autor ejecuta el modelo en una AMD Radeon RX 7700 XT con 12 GiB de VRAM, lo que sugiere que el modelo cabe ajustadamente en 12 GiB con offloading parcial o con la representación MXFP4 de los expertos.
- GPU recomendadas: no disponible en la información proporcionada. El único dato concreto es la RX 7700 XT (12 GiB, Vulkan) usada por el autor de la conversión.
- GPU de consumo: sí cabe en GPUs de consumo de gama alta con 12 GiB o más, según la experiencia del autor; no se especifican otras tarjetas concretas.
- Opciones de despliegue: llama.cpp (`llama-server`, `llama-cli`), con soporte de `-hf` para servir directamente desde Hugging Face y `--jinja` para la plantilla Harmony. No se mencionan vLLM, TGI ni Ollama en la información disponible.
- Latencia y throughput: no disponible en la información proporcionada.
- Parámetros de muestreo sugeridos por el autor: `--temp 0.7 --top-p 0.95 --top-k 40 --min-p 0.05 --repeat-penalty 1.1` (la lista aparece truncada en la model card).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| linellazatin/p-e-w_gpt-oss-20b-heretic-ara-v4-gguf | ~20,9B (MoE) | no disponible | GGUF | Apache 2.0 | Conversión GGUF del modelo ablacionado de p-e-w; sin cuantización adicional |
| p-e-w/gpt-oss-20b-heretic-ara-v4 | ~20,9B (MoE) | no disponible | safetensors | Apache 2.0 | Checkpoint original con ablación ARA; requiere vLLM u otro runtime compatible con safetensors |
| openai/gpt-oss-20b | ~20,9B (MoE) | no disponible | safetensors | Apache 2.0 | Modelo base de OpenAI, sin modificación de rechazo |

## Limitaciones y advertencias

- No es un modelo nuevo ni un fine-tune: es una conversión de formato del checkpoint de p-e-w; cualquier evaluación de calidad debe remitirse al modelo fuente.
- La ablación ARA modifica el comportamiento de rechazo del modelo; esto puede traducirse en respuestas menos restrictivas ante solicitudes sensibles y requiere revisión de seguridad antes de uso en producción.
- La conversión se realizó con ajustes locales específicos del checkpoint (renombrado de tensores MXFP4 y sustitución del tokenizador); aunque el autor verificó tokenización y plantilla Harmony, no se documentan pruebas exhaustivas de fidelidad frente al original.
- Los pesos de los expertos se mantienen en MXFP4, lo que puede implicar diferencias numéricas respecto al checkpoint original en BF16.
- No hay información sobre idiomas soportados ni sobre sesgos conocidos; se desconoce el comportamiento multilingüe real.
- No se han publicado benchmarks ni datos de latencia/throughput en la información disponible; no se puede afirmar nada sobre el rendimiento comparado.
- El repositorio tiene 0 likes y 228 descargas, por lo que la validación comunitaria es mínima.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar los términos del modelo base de OpenAI y del checkpoint de p-e-w.
- El contexto máximo real no está documentado; el ejemplo de uso emplea `-c 4096`, que es solo un valor de ejemplo y no necesariamente el límite del modelo.
- La model card del autor está truncada en la información proporcionada (los parámetros de muestreo y el cierre del documento no aparecen completos).

## Enlaces

- Repositorio GGUF: https://huggingface.co/linellazatin/p-e-w_gpt-oss-20b-heretic-ara-v4-gguf
- Modelo fuente: https://huggingface.co/p-e-w/gpt-oss-20b-heretic-ara-v4
- Herramienta Heretic: https://github.com/p-e-w/heretic
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Commit de conversión (base.py): https://github.com/linellazatin/llama.cpp/commit/c43b85922d66ae256fd463a1d7738f6736052cce
- Commit de conversión (gpt_oss.py): https://github.com/linellazatin/llama.cpp/commit/239c2540acfe958b134814064df6cfa398bd5239
- Modelo base de OpenAI (referenciado en la lineage): https://huggingface.co/openai/gpt-oss-20b
