# haihengh/Qwen3.8-Flash-Next-125B-finch-4bit-ple2bit-vision

## Resumen

Qwen3.8-Flash-Next-125B-finch-4bit-ple2bit-vision es una distribucion cuantizada del checkpoint Qwen/Qwen3.8-Flash-Next, un modelo de mezcla de expertos (MoE) de 125B parametros con torre de vision, empaquetado por el usuario haihengh para el motor de inferencia out-of-core FinchMoE. No es un checkpoint de Transformers: es un artefacto en formato propietario `.finch` que contiene pesos residentes, expertos enrutados empaquetados por capa, tokenizador y una carga util de vision copiada byte a byte del modelo original.

La relevancia de esta ficha es doble. Por un lado, documenta una receta de cuantizacion agresiva (expertos enrutados a 2 bits, cuerpo de texto a 4 bits, router y atencion lineal a 8 bits) que reduce el peso total a 69,57 GiB, lo que permite ejecutar un MoE de 125B en hardware de consumo alto o en equipos Apple Silicon mediante acceso a disco mapeado. Por otro, ilustra un patron de publicacion derivado: el autor no reentrena ni modifica los pesos del modelo base, solo cambia el contenedor, la precision y anade la torre visual.

El modelo base Qwen3.8-Flash-Next pertenece a la familia Qwen y se distribuye bajo la Qwen Community License 1.0. Esta variante hereda esa licencia como obra derivada y se publica con cero descargas y cero likes en el momento de la consulta, lo que indica que es un artefacto reciente y practicamente sin validacion externa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE con atencion lineal y torre de vision (heredada de Qwen3.8-Flash-Next) |
| Parametros totales | 125B (segun nombre del modelo base) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Expertos enrutados 2-bit affine (grupo 64, escalas/sesgos BF16); atencion y expertos compartidos 4-bit; atencion lineal y router 8-bit; tabla PLE int4 grupo 32; vision en BF16 |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-license-1.0 |
| Formato de pesos | Finch `.finch` (manifest + pesos residentes + expertos empaquetados + tokenizador + vision); vision en safetensors BF16 |

## Arquitectura y entrenamiento

El modelo base es un transformer MoE con atencion lineal, segun se deduce de la descripcion del artefacto ("linear attention and router at 8-bit"). La receta de cuantizacion distingue cuatro regimenes de precision: los expertos enrutados (512 por capa, 48 capas, stride de 1.540.096 bytes) se comprimen a 2 bits affine con grupo 64 y escalas en BF16; las capas de atencion y los expertos compartidos quedan a 4 bits; la atencion lineal y el router a 8 bits; y la tabla PLE a int4 con grupo 32. El pool de expertos ocupa 35,25 GiB, mientras que los pesos residentes suman 3.877.265.688 bytes.

No hay informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si el modelo base uso RLHF, DPO u otras tecnicas de alineamiento. El autor indica explicitamente que la abliteration, cuando aplica, se realizo en el modelo upstream, y que este repositorio solo cambia el contenedor, la cuantizacion y anade la carga util de vision. La torre visual se copia sin modificar: 333 tensores BF16 que ocupan 856,3 MiB y se mapean solo durante la codificacion de imagenes.

## Capacidades

- Generacion de texto y razonamiento: heredadas del modelo base Qwen3.8-Flash-Next, aunque no se documentan evaluaciones especificas para esta variante.
- Procesamiento de imagen y texto: pipeline `image-text-to-text` con torre visual BF16 funcional en el runtime FinchMoE.
- Tool calling y function calling: no documentado en la informacion disponible.
- Razonamiento multi-paso y agentes: no documentado en la informacion disponible.
- Capacidades multilingues: no documentadas; los idiomas soportados figuran como no disponibles.
- Modo thinking: no documentado.
- Inferencia out-of-core: el formato `.finch` permite mapear expertos desde disco, lo que habilita ejecucion en equipos con memoria unificada limitada.

## Casos de uso

- Despliegue local en Apple Silicon: el motor FinchMoE y sus apps Mac/iOS estan disenados para este formato, de modo que un MoE de 125B puede ejecutarse en un Mac con memoria unificada suficiente, mapeando el pool de expertos desde SSD.
- Procesamiento de documentos con imagenes: la torre visual permite tareas de image-text-to-text, como extraccion de datos de capturas, facturas o diagramas, en un unico modelo sin pipeline separado de OCR mas LLM.
- Prototipado de asistentes multimodales: util para validar flujos de conversacion con entrada de imagen en entornos de desarrollo antes de migrar a infraestructura de servidor.
- Investigacion sobre cuantizacion extrema: el artefacto sirve como caso de estudio de como afecta una receta 2-bit en expertos enrutados a la calidad del texto, comparandolo con el hermano text-only del mismo autor.
- Evaluacion de motores de inferencia alternativos: permite comparar FinchMoE frente a llama.cpp, vLLM o TGI en terminos de latencia y huella de memoria para un mismo modelo base.
- Pruebas de regresion de pipelines multimodales: al conservar el tokenizador, el chat template y los preprocesadores originales, se puede usar como sustituto del checkpoint BF16 en tests automatizados con recursos limitados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explicitamente que esta variante no se ha medido por separado y remite a la model card de `haihengh/Qwen3.8-Flash-Next-125B-finch-4bit-ple2bit` para la calidad y el throughput de la ruta de texto.

## Requisitos de hardware

- VRAM/memoria estimada: el artefacto declara 69,57 GiB en total; los pesos residentes son 3,88 GB y el pool de expertos 35,25 GiB, mapeado desde disco en el modo out-of-core.
- GPU recomendadas: no disponibles en la informacion proporcionada; el motor esta orientado a Mac/iOS, por lo que el hardware objetivo principal es Apple Silicon con memoria unificada.
- GPU de consumo: no se confirma compatibilidad con RTX 4090 u otras GPU consumer; el formato `.finch` requiere el runtime FinchMoE.
- Opciones de despliegue: CLI `FinchMoECLI` y apps Mac/iOS de FinchMoE. No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next-125B-finch-4bit-ple2bit-vision (este) | 125B | no disponible | Finch `.finch` | qwen-community-license-1.0 | Incluye torre de vision BF16; expertos a 2 bits |
| Qwen3.8-Flash-Next-125B-finch-4bit-ple2bit | 125B | no disponible | Finch `.finch` | qwen-community-license-1.0 | Mismo autor, solo texto; referencia de calidad declarada |
| Qwen/Qwen3.8-Flash-Next | 125B | no disponible | safetensors BF16 | qwen-community-license-1.0 | Modelo base sin cuantizar |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- Artefacto sin validacion externa: cero descargas y cero likes en el momento de la consulta; no hay evidencia independiente de calidad.
- Formato no estandar: no es un checkpoint de Transformers y solo funciona con el runtime FinchMoE; no se puede cargar directamente en vLLM, llama.cpp, Ollama ni TGI.
- Cuantizacion muy agresiva: los expertos enrutados a 2 bits pueden degradar la calidad frente al BF16 original; el autor no publica metricas de esta variante.
- Riesgo de alucinacion: inherente al modelo base y potencialmente amplificado por la cuantizacion; no cuantificado.
- Idiomas y contexto: no documentados; no se puede garantizar cobertura multilingue ni una ventana de contexto concreta.
- Licencia: Qwen Community License 1.0, con posibles restricciones para uso comercial; es necesario revisar el fichero LICENSE antes de desplegar en produccion.
- Vision limitada al runtime: la torre visual solo se consume en la app Mac/iOS con una fila de modelo compatible con vision; una fila text-only rechaza el directorio `vision/`.
- Sin garantias de soporte: el repositorio es un artefacto de un tercero, no una publicacion oficial de Qwen.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/haihengh/Qwen3.8-Flash-Next-125B-finch-4bit-ple2bit-vision
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Variante text-only del mismo autor: https://huggingface.co/haihengh/Qwen3.8-Flash-Next-125B-finch-4bit-ple2bit
- Motor FinchMoE: https://github.com/haihengh/finchMoE
- Licencia: https://huggingface.co/haihengh/Qwen3.8-Flash-Next-125B-finch-4bit-ple2bit-vision/blob/main/LICENSE
