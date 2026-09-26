# 1bit-MONSTER/Qwen1.5-MoE-A2.7B-Chat-GGUF

## Resumen

Este repositorio publica una cuantizacion GGUF en formato Q4_K_M del modelo Qwen1.5-MoE-A2.7B-Chat de Alibaba Cloud, reempaquetada por el usuario 1bit-MONSTER para su motor de inferencia 1bit sobre hardware Strix Halo. Se trata de un transformer con arquitectura de mezcla de expertos (MoE) de 14.315.784.192 parametros totales, de los que aproximadamente 2.700 millones se activan por token, lo que situa su coste de computo por token en el rango de un modelo denso de unos 3B pese a almacenar 14,3B de pesos.

El valor practico del artefacto es doble. Por un lado, ofrece los pesos en un unico fichero GGUF de unos 9,5 GB, manejable en GPUs de consumo y en equipos con memoria unificada. Por otro, la ficha aporta mediciones reales de inferencia (pp512: 1896 tok/s; tg128: 89,7 tok/s) sobre un equipo Strix Halo con backend Vulkan, un dato poco habitual en repositorios de cuantizacion.

El repositorio no incluye benchmarks de calidad, informacion sobre idiomas, longitud de contexto, composicion del dataset ni detalles de alineacion. La licencia es la Tongyi Qianwen original, que permite uso comercial salvo que el producto o servicio supere los 100 millones de usuarios activos mensuales. Acumula 0 descargas y 0 likes, por lo que se trata de un artefacto sin validacion comunitaria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE) |
| Parametros totales | 14.315.784.192 (~14,3 B) |
| Parametros activos | ~2,7 B por token (segun model card) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (unico fichero incluido en el repositorio) |
| Idiomas soportados | no disponible |
| Licencia | Tongyi Qianwen (etiquetada como "other", `license_name: tongyi-qianwen`) |
| Formato de pesos | GGUF |
| Modelo base | Qwen/Qwen1.5-MoE-A2.7B-Chat |
| Fichero incluido | `Qwen1.5-MoE-A2.7B-Chat.Q4_K_M.gguf` |
| Tamano del repositorio | 9,5 GB |
| Uso previsto | Conversacional (etiqueta `conversational`, sufijo `-Chat`) |
| Descargas / likes | 0 / 0 |
| Fecha de creacion (metadatos) | 26/09/2026 |

## Arquitectura y entrenamiento

El modelo base es un transformer decoder de tipo MoE: cada token activa un subconjunto de expertos, de modo que el coste computacional se aproxima al de un modelo denso de ~2,7B mientras que la memoria necesaria corresponde a 14,3B de parametros. El repositorio no especifica el numero de expertos por capa, el numero de expertos activados, la dimension oculta ni el mecanismo de enrutamiento, por lo que esos detalles figuran como no disponibles en la informacion proporcionada.

Tampoco se documentan el volumen de tokens de entrenamiento, la composicion del dataset, ni si hubo fases de RLHF, DPO u otra forma de alineacion sobre la variante `-Chat`. La innovacion destacable del artefacto es la propia cuantizacion: es una cuantizacion de segunda generacion, ya que parte del GGUF publicado por RichardErkhov (a su vez derivado de los safetensors oficiales), de modo que conviene verificar que no se acumula degradacion adicional respecto al modelo original. El autor aporta mediciones de rendimiento del motor 1bit con backend Vulkan, no resultados de calidad.

## Capacidades

- Generacion de texto conversacional multi-turno: el modelo base esta publicado como variante `-Chat` y el repositorio se etiqueta como `conversational`.
- Eficiencia de inferencia por activacion dispersa: ~2,7B parametros activos por token con 14,3B almacenados.
- Despliegue en formato GGUF con motor compatible (llama.cpp, Ollama, LM Studio, motor 1bit).
- Razonamiento, generacion de codigo y matematicas: no confirmado en la informacion disponible.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible (no se declara lista de idiomas).
- Capacidades especiales (modo de razonamiento explicito, vision, audio): no disponible.

## Casos de uso

- Asistente conversacional local en equipos con memoria unificada: con un fichero de 9,5 GB, el modelo cabe holgadamente en un Strix Halo o en mini-PC con 32 GB o mas de memoria y ofrece 89,7 tok/s de generacion medidos en ese hardware, suficiente para uso interactivo de un solo usuario.
- Prototipado y evaluacion de motores de inferencia: los valores pp512 (1896 tok/s) y tg128 (89,7 tok/s) sobre Vulkan sirven como linea base reproducible para comparar backends, versiones de llama.cpp u otros motores sobre el mismo fichero GGUF.
- Chat interno de baja concurrencia en GPU de consumo: con 16 GB de VRAM (RTX 4080, 4070 Ti Super) o 24 GB (RTX 4090) el modelo se ejecuta integramente en GPU con margen para cache KV en contextos moderados, sin enviar datos a servicios externos.
- Procesamiento por lotes de texto (resumen, clasificacion, extraccion de campos y reescritura): el reducido coste por token derivado de los ~2,7B parametros activos permite procesar volumenes altos manteniendo la capacidad memoristica de un modelo de 14,3B.
- Despliegue en entornos con restricciones de red o de soberania del dato: la licencia permite uso comercial y el peso es descargable y ejecutable en local, lo que encaja en sectores con requisitos de confidencialidad.
- Investigacion sobre cuantizacion y arquitecturas MoE: permite medir el impacto de Q4_K_M frente a otras precisiones y estudiar el comportamiento de un MoE pequeno en runtimes GGUF.
- Integracion en aplicaciones de escritorio: al ser un unico fichero GGUF, se puede empaquetar como backend de asistentes de escritorio o plugins de editor sin infraestructura de servidor.
- Evaluacion comparativa frente a modelos densos de tamano similar en terminos de latencia y memoria, usando el motor 1bit como referencia en hardware integrado (iGPU).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K, MT-Bench u otros) en la informacion disponible. El unico dato de rendimiento publicado corresponde a inferencia:

| Metrica | Valor | Condiciones |
|---|---|---|
| pp512 (prefill) | 1896 tok/s | Strix Halo, backend Vulkan, motor 1bit, Q4_K_M |
| tg128 (generacion) | 89,7 tok/s | Strix Halo, backend Vulkan, motor 1bit, Q4_K_M |

No hay comparaciones con otros modelos ni mediciones en GPU dedicada dentro de la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada para los pesos: en torno a 9,5 GB con Q4_K_M, segun el tamano del repositorio.
- VRAM total estimada: aproximadamente 10-12 GB para contexto moderado una vez anadida la cache KV y el overhead del runtime; aumenta con la longitud de contexto, que no esta documentada.
- GPU recomendadas: RTX 4090 (24 GB) y RTX 4080 / 4070 Ti Super (16 GB) para ejecucion completa en GPU con holgura; RTX 4070 / 4060 Ti (12-16 GB) de forma ajustada, con contexto reducido.
- Hardware integrado: el autor reporta ejecucion en Strix Halo con memoria unificada, escenario en el que el modelo aprovecha el ancho de banda compartido.
- Cabe en GPU de consumo: si, comodamente desde 16 GB de VRAM; en 12 GB es viable con contexto limitado o descarga parcial de capas a RAM.
- Opciones de despliegue: llama.cpp / llama-server, Ollama y LM Studio (compatibles con GGUF), el motor 1bit con backend Vulkan (`1bit serve -m Qwen1.5-MoE-A2.7B-Chat.Q4_K_M.gguf --device vulkan`). Para vLLM o TGI es preferible el modelo base en safetensors, ya que el soporte de GGUF en esos servidores es limitado o experimental.
- Latencia y throughput: 1896 tok/s en prefill y 89,7 tok/s en generacion sobre Strix Halo con Vulkan. No hay mediciones publicadas para otras GPU en la informacion disponible.
- Nota: al ser un MoE, el rendimiento depende en gran medida del soporte de enrutamiento disperso del runtime; conviene validar que el backend utilice todos los expertos correctamente antes de medir.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Formato | Benchmarks en la informacion disponible |
|---|---|---|---|---|---|---|
| Este repositorio (Qwen1.5-MoE-A2.7B-Chat Q4_K_M GGUF) | 14,3 B | ~2,7 B | no disponible | Tongyi Qianwen | GGUF (Q4_K_M) | no disponibles; solo mediciones de inferencia |
| Qwen/Qwen1.5-MoE-A2.7B-Chat (oficial) | 14,3 B | ~2,7 B | no disponible | Tongyi Qianwen | safetensors | no disponibles |
| RichardErkhov/Qwen_-_Qwen1.5-MoE-A2.7B-Chat-gguf | 14,3 B | ~2,7 B | no disponible | Tongyi Qianwen | GGUF (varias cuantizaciones) | no disponibles |
| Mixtral 8x7B (referencia de categoria) | 46,7 B | 12,9 B | 32.768 tokens | Apache 2.0 | safetensors / GGUF | no incluidos en esta ficha |

Nota: los datos de Mixtral 8x7B no forman parte de la informacion proporcionada en esta busqueda; se incluyen como referencia de categoria procedente de documentacion publica del modelo. No se dispone de valores de contexto, idiomas ni benchmarks para la familia Qwen1.5-MoE en la informacion suministrada.

## Limitaciones y advertencias

- Artefacto sin validacion: 0 descargas y 0 likes en el momento de la consulta, sin informes de terceros sobre su comportamiento real.
- Cuantizacion de segunda generacion: el GGUF procede de una cuantizacion previa de RichardErkhov sobre los safetensors oficiales, por lo que puede acumular perdida de precision respecto al modelo original. No se documentan mediciones de perplexity.
- Perdida inherente a Q4_K_M: esperable degradacion en tareas sensibles a precision numerica (matematicas, codigo, razonamiento largo) respecto a los pesos originales.
- Unica cuantizacion disponible en el repositorio: no hay Q8_0, Q5_K_M ni Q6_K para ajustar el equilibrio calidad/memoria.
- Ausencia de datos clave: no se publican longitud de contexto, idiomas soportados, numero de expertos, composicion del dataset ni detalles de alineacion, lo que dificulta estimar su idoneidad para casos concretos.
- Ausencia de benchmarks de calidad: no hay MMLU, HumanEval, GSM8K ni evaluaciones multilingues, y no se han publicado evaluaciones de sesgo o de tasa de alucinacion, por lo que el riesgo no esta cuantificado.
- Soporte de MoE en runtimes GGUF: la ejecucion de mezclas de expertos en algunos backends puede ser experimental o requerir opciones especificas; conviene validar resultados antes de llevar el modelo a produccion.
- Licencia Tongyi Qianwen: el uso comercial esta permitido, con la salvedad de que se requiere una licencia separada si el producto o servicio supera los 100 millones de usuarios activos mensuales. Es responsabilidad del integrador revisar el texto completo de `LICENSE` y conservar la atribucion a Alibaba Cloud.
- Atribucion obligada: el repositorio realoja una cuantizacion de terceros, por lo que deben mantenerse las referencias al modelo base (Qwen/Alibaba Cloud) y al autor de la cuantizacion (RichardErkhov).
- Generacion del modelo base: la familia Qwen1.5 es anterior a las generaciones Qwen2, Qwen2.5 y Qwen3, por lo que es previsible que existan alternativas mas capaces y mejor alineadas en el mismo rango de tamano.
- Metadatos anomalos: la fecha de creacion registrada (26/09/2026) resulta poco habitual, lo que sugiere posibles inconsistencias en los metadatos del repositorio.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/1bit-MONSTER/Qwen1.5-MoE-A2.7B-Chat-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen1.5-MoE-A2.7B-Chat
- Cuantizacion origen: https://huggingface.co/RichardErkhov/Qwen_-_Qwen1.5-MoE-A2.7B-Chat-gguf
- Motor 1bit: https://github.com/1bit-MONSTER/engine
- Licencia Tongyi Qianwen (referenciada en la model card): https://huggingface.co/1bit-MONSTER/Qwen1.5-MoE-A2.7B-Chat-GGUF/blob/main/LICENSE
