# marco-bazzani/nla-qwen3-8b-multilayer

## Resumen

El modelo `marco-bazzani/nla-qwen3-8b-multilayer` es un *verbalizer* de activaciones (AV, por sus siglas en inglés) que forma parte de un autoencoder en lenguaje natural (NLA) multicapa construido sobre Qwen3-8B. Su funcion es recibir el *residual stream* de Qwen3-8B en una posicion de token concreta, tomado a la salida de cada uno de los bloques 8 a 35 (28 vectores de dimension 4096), y generar una explicacion en lenguaje natural de esa activacion. No es un modelo de proposito general, sino una herramienta de interpretabilidad mecanicista.

El modelo lo publica el usuario independiente `marco-bazzani` y se distribuye con licencia Apache 2.0. Se trata de un *fine-tune* de Qwen/Qwen3-8B (8.190.735.360 parametros segun los pesos en safetensors, 16.4 GB de repositorio). La receta empleada es la "multilayer", semilla 3, tras 500 iteraciones de aprendizaje por refuerzo. El reconstructor con el que fue entrenado no se incluye en el repositorio.

Su relevancia radica en que permite traducir estados internos del modelo base a texto legible, lo que abre la puerta a auditar representaciones, depurar comportamientos y estudiar que informacion codifica Qwen3-8B en capas intermedias y altas. Es un artefacto de investigacion, no un modelo conversacional de produccion, y su uso requiere ejecutar tambien Qwen3-8B para extraer las activaciones de entrada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (fine-tune de Qwen/Qwen3-8B) |
| Parametros totales | 8.190.735.360 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; el ejemplo usa bfloat16) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un *fine-tune* de Qwen3-8B, un transformer decoder-only denso de aproximadamente 8.190 millones de parametros. La innovacion no esta en la arquitectura base, sino en el procedimiento de entrenamiento: el AV se entrena como la mitad "escritora" de un autoencoder en lenguaje natural. Recibe 28 vectores del *residual stream* de Qwen3-8B (bloques 8 a 35, dimension 4096 cada uno), cada uno reescalado a una norma fija e inyectado en la embedding de uno de los 28 tokens marcadores del prompt, empezando por el bloque 8. El modelo debe producir una explicacion en lenguaje natural del contenido de esas activaciones.

El entrenamiento se realizo mediante aprendizaje por refuerzo (500 iteraciones) con la receta multicapa, semilla 3. El reconstructor, que se encargaria de recuperar las activaciones a partir de la explicacion generada, no se incluye en el repositorio, por lo que no es posible evaluar la fidelidad de la reconstruccion de forma directa con este artefacto. Los metadatos de inyeccion (plantilla de prompt, caracter marcador, escala y token id) se encuentran en el fichero `nla_meta.yaml` del repositorio.

## Capacidades

- Generacion de explicaciones en lenguaje natural de activaciones internas de Qwen3-8B en un token concreto.
- Procesamiento conjunto de 28 capas (bloques 8 a 35) del *residual stream* en una sola pasada.
- Generacion estocastica: el autor recomienda muestrear varias explicaciones por activacion (temperatura 1.0, top-p 1.0) para obtener una vision mas completa.
- Salida estructurada dentro de etiquetas `<explanation>...</explanation>`, facil de parsear.
- No dispone de tool calling, capacidades de agente, vision, audio ni modo *thinking* documentados.
- Capacidades multilingues: no documentadas; el idioma de las explicaciones no se especifica en la informacion disponible.

## Casos de uso

- Interpretabilidad mecanicista: extraer activaciones de Qwen3-8B en un token y verbalizarlas para estudiar que informacion codifica cada capa intermedia, comparando explicaciones entre bloques 8 y 35.
- Auditoria de sesgos y representaciones: analizar como se representan internamente conceptos sensibles en distintas capas, generando descripciones textuales que puedan revisarse manualmente.
- Depuracion de comportamientos anomalos: ante una respuesta incorrecta de Qwen3-8B, verbalizar la activacion en el token problematico para identificar que representacion interna pudo desencadenar el fallo.
- Investigacion en autoencoders en lenguaje natural: usar este AV junto con un reconstructor propio para evaluar la fidelidad del canal texto como cuello de botella en la reconstruccion de activaciones.
- Docencia y divulgacion: ilustrar de forma tangible como un LLM codifica informacion en su *residual stream*, mostrando explicaciones legibles de estados internos.
- Desarrollo de pipelines de monitorizacion: integrar el AV en un bucle que verbalice activaciones durante la inferencia de Qwen3-8B para detectar representaciones inesperadas antes de que se materialicen en salidas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El AV tiene 8.190 millones de parametros; en bfloat16 requiere aproximadamente 16.4 GB de VRAM solo para los pesos, mas memoria para el contexto y el KV cache.
- Ademas, es necesario cargar simultaneamente (o de forma secuencial) Qwen3-8B para extraer las activaciones, lo que anade otros ~16.4 GB en bfloat16.
- Para ejecutar ambos modelos a la vez en bfloat16 se recomienda una GPU con 40 GB o mas (A100 40 GB, A100 80 GB, H100). En GPUs consumer de 24 GB (RTX 3090, RTX 4090) no caben ambos modelos simultaneamente en bfloat16; seria necesario descargar el modelo base tras extraer las activaciones (como hace el ejemplo) o cuantizar.
- El codigo de ejemplo del autor libera el modelo base (`del base`) antes de cargar el AV, lo que permite ejecutar el flujo en una sola GPU de 24 GB si se gestiona la memoria con cuidado.
- Opciones de despliegue: transformers (documentado en el ejemplo). No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI; la inyeccion de embeddings personalizados en el prompt hace que el despliegue estandar con estos motores requiera adaptaciones.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Funcion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| nla-qwen3-8b-multilayer | 8.19 B | no disponible | Verbalizer de activaciones de Qwen3-8B (28 capas) | Apache 2.0 | Hugging Face |
| Qwen/Qwen3-8B | ~8 B | no disponible en la informacion proporcionada | LLM de proposito general | Apache 2.0 | Hugging Face |
| SAE (sparse autoencoders) para Qwen | variable | no aplica | Descomposicion de activaciones en features | variable | no disponible |

No se dispone de informacion sobre otros verbalizers NLA comparables ni sobre sus resultados, por lo que la comparativa cuantitativa no esta disponible.

## Limitaciones y advertencias

- No es un modelo de proposito general: generar texto util fuera del flujo de verbalizacion de activaciones no es su funcion prevista.
- El reconstructor no se incluye, por lo que no se puede medir la fidelidad de la reconstruccion con este repositorio por si solo.
- Las explicaciones son estocasticas y varian entre muestras; una sola generacion puede ser enganosa. El autor recomienda muestrear varias.
- Depende de la version exacta de Qwen3-8B y de los hooks en las capas 8 a 35; cambios en el modelo base invalidarian las activaciones.
- No hay informacion sobre sesgos, idiomas soportados ni evaluacion de alucinacion en las explicaciones generadas.
- La licencia Apache 2.0 permite uso comercial, pero al ser un artefacto de investigacion sin benchmarks publicados, no se recomienda su uso en produccion sin validacion propia.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validacion por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/marco-bazzani/nla-qwen3-8b-multilayer
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B
