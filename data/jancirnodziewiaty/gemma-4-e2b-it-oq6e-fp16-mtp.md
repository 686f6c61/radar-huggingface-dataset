# jancirnodziewiaty/gemma-4-E2B-it-oQ6e-fp16-mtp

## Resumen

`gemma-4-E2B-it-oQ6e-fp16-mtp` es una version cuantizada del modelo Gemma 4 E2B instruct, publicada por el usuario jancirnodziewiaty en Hugging Face. Se trata de un checkpoint multimodal (lenguaje, vision y audio) derivado de la familia Gemma 4 de Google, procesado con la herramienta oQ (oMLX v0.7.3) para aplicar cuantizacion de precision mixta. El resultado es un artefacto de 5.182 millones de parametros logicos con un peso efectivo medio de 9,148 bits por parametro, empaquetado nativamente para el framework MLX de Apple.

La relevancia de esta publicacion radica en su naturaleza de artefacto de despliegue: no introduce arquitectura nueva, sino que combina cuantizacion afin de 6 y 8 bits con capas residuales en BF16, FP16 y FP32, ademas de una cabeza MTP (multi-token prediction) conservada en BF16. Esto permite ejecutar un modelo multimodal de la familia Gemma 4 en hardware Apple Silicon con un footprint de almacenamiento de aproximadamente 6 GB, manteniendo componentes sensibles a la precision en formato completo.

El modelo esta orientado a inferencia local en Mac mediante MLX. No se dispone de informacion publicada sobre la licencia, los idiomas soportados ni la model card original de Gemma 4 E2B, por lo que los datos tecnicos proceden exclusivamente de las tablas de cuantizacion incluidas por el autor y de los metadatos de safetensors.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (lenguaje + vision + audio) con cabeza MTP; detalles completos no disponibles |
| Parametros totales | 5.182.291.015 (5,182B logicos) |
| Parametros activos | no disponible (no se confirma que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Precision mixta oQ: affine 6-bit grupo 64 (80,447%), affine 8-bit grupo 64 (8,931%), BF16 (1,500%), FP16 (0,006%), FP32 (9,112%), I64 (0,005%); media efectiva 9,148 bits/peso |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors, libreria MLX (mlx) |

Desglose de almacenamiento por componente:

| Componente | Pesos logicos | Almacenamiento |
|---|---|---|
| Modelo de lenguaje | 4,632B | 3,880 GB / 3,613 GiB |
| Vision | 0,167B | 0,669 GB / 0,623 GiB |
| Audio | 0,305B | 1,219 GB / 1,136 GiB |
| Cabeza MTP | 0,078B | 0,158 GB / 0,147 GiB |
| Total | 5,182B | 5,926 GB / 5,519 GiB |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base Gemma 4 E2B. Por los componentes declarados por el autor se deduce una estructura multimodal con tres torres diferenciadas: un modelo de lenguaje de 4,632B parametros, un codificador de vision de 0,167B y un codificador de audio de 0,305B. Adicionalmente incorpora una cabeza MTP (multi-token prediction) de 0,078B parametros, una tecnica de decodificacion especulativa que permite predecir varios tokens por paso y acelerar la generacion.

El checkpoint no ha sido reentrenado: es el resultado de aplicar cuantizacion de precision mixta con oQ (oMLX v0.7.3) sobre los pesos originales. La distribucion de bits revela una estrategia selectiva: el 80,4% de los pesos se almacena en affine 6-bit, mientras que el 9,1% permanece en FP32 (probablemente capas de normalizacion, embeddings o parametros sensibles a la precision) y el 1,5% en BF16 (incluyendo la cabeza MTP). No se dispone de datos sobre el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO en el modelo original.

## Capacidades

- Generacion de texto e instrucciones en modo chat (sufijo `-it` en el nombre).
- Procesamiento de vision: el checkpoint incluye un modulo de vision de 0,167B parametros, lo que sugiere capacidad de comprension de imagenes.
- Procesamiento de audio: incluye un modulo de audio de 0,305B parametros, lo que sugiere capacidad de comprension de audio.
- Decodificacion especulativa mediante cabeza MTP, orientada a reducir la latencia de generacion.
- Ejecucion nativa en MLX, optimizada para Apple Silicon.
- Soporte de tool calling, agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible.
- Modo thinking explicito: no disponible.

## Casos de uso

- Inferencia local en Mac con MLX: el modelo esta empaquetado especificamente para MLX y ocupa unos 6 GB en disco, por lo que puede cargarse en un Mac con Apple Silicon y memoria unificada suficiente para ejecutar un asistente conversacional sin conexion.
- Prototipado de asistentes multimodales en local: al incluir torres de vision y audio, permite experimentar con entradas de imagen y sonido en un entorno de desarrollo sin depender de APIs externas.
- Evaluacion de cuantizacion de precision mixta: sirve como referencia para comparar la calidad de oQ frente a otras estrategias de cuantizacion sobre el mismo modelo base, dado el desglose detallado de bits por componente.
- Pruebas de decodificacion especulativa: la cabeza MTP en BF16 permite medir la ganancia de throughput de la prediccion multi-token en MLX frente a la decodificacion autoregresiva clasica.
- Desarrollo de aplicaciones de escritorio para macOS: al integrarse con MLX, puede embeberse en apps nativas que requieran procesamiento de lenguaje, vision o audio en el dispositivo.
- Investigacion sobre preservacion de capas en FP32: el 9,1% de pesos en FP32 ofrece un caso de estudio sobre que componentes conviene mantener a alta precision al cuantizar modelos multimodales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Almacenamiento: aproximadamente 5,9 GB en disco (5,519 GiB de pesos).
- Memoria: el checkpoint completo requiere cargar unos 5,5 GiB de pesos; con overhead de runtime MLX, se recomienda un minimo de 8 GB de memoria unificada, y 16 GB para margen comodo con contexto largo.
- Hardware: exclusivamente Apple Silicon (M1, M2, M3, M4 y variantes Pro/Max/Ultra), al estar empaquetado para MLX. No es compatible de forma nativa con CUDA.
- GPU dedicadas (A100, H100, RTX 4090): no aplicable sin conversion previa del checkpoint a otro formato.
- Despliegue: MLX (libreria `mlx`); otras opciones como vLLM, llama.cpp, Ollama o TGI no estan soportadas de forma directa con este artefacto.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multimodal | Formato | Licencia |
|---|---|---|---|---|---|
| gemma-4-E2B-it-oQ6e-fp16-mtp | 5,182B | no disponible | Si (vision + audio) | safetensors MLX | no disponible |
| Gemma 4 E2B it (original) | no disponible | no disponible | Si (segun componentes) | safetensors | no disponible |
| Otras cuantizaciones oQ del mismo base | 5,182B | no disponible | Si | safetensors MLX | no disponible |

No se dispone de datos de rendimiento ni de especificaciones del modelo base original en la informacion proporcionada, por lo que no es posible establecer una comparativa cuantitativa con alternativas.

## Limitaciones y advertencias

- La cuantizacion a 6 bits en el 80,4% de los pesos puede degradar la calidad frente al modelo original, especialmente en tareas de razonamiento complejo o generacion de codigo.
- El 9,1% de pesos en FP32 incrementa el tamano del checkpoint respecto a una cuantizacion uniforme de 6 bits; el beneficio real de esta mezcla no esta documentado con metricas.
- La licencia no esta declarada en la informacion disponible; debe verificarse la licencia del modelo Gemma 4 base antes de cualquier uso comercial.
- No se dispone de informacion sobre sesgos, tasas de alucinacion ni comportamiento multilingue.
- El artefacto esta ligado a MLX: no es portable a CUDA, ROCm ni CPU sin conversion y posible perdida de fidelidad.
- Publicado por un usuario individual con 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de validacion por terceros.
- El campo `pipeline` no esta definido, lo que puede complicar la carga automatica en herramientas que dependan de ese metadato.
- No hay model card original de Gemma 4 E2B incluida; la documentacion se limita a las tablas de cuantizacion.

## Enlaces

- Hugging Face: https://huggingface.co/jancirnodziewiaty/gemma-4-E2B-it-oQ6e-fp16-mtp
- Repositorio de la herramienta de cuantizacion oQ (oMLX): https://github.com/jundot/omlx
