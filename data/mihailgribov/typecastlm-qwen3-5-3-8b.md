# mihailgribov/typecastlm-qwen3.5-3.8b

## Resumen

TypeCastLM-Qwen3.5-3.8B es un modelo de decision (decision model) de pesos abiertos desarrollado por el usuario mihailgribov, construido sobre el modelo base Qwen/Qwen3.5-4B. A diferencia de un modelo generativo, no produce texto: recibe un material y una pregunta y devuelve numeros, es decir, distribuciones de probabilidad sobre un conjunto cerrado de respuestas. Cuenta con 3.759.594.944 parametros (3,76B) y 7,5 GB de pesos, lo que permite ejecutarlo en una unica tarjeta grafica de consumo de 16 GB.

El modelo expone cuatro modos de decision sobre una sola cabeza de clasificacion de 39 salidas: `noul` (si/no sobre dos criterios), `tfu` (verdadero/falso/unsure), `choice` (entre 2 y 26 opciones) y `scale` (rubricas ordinales de hasta 10 niveles). Cada modo realiza un unico forward pass y no genera tokens, lo que se traduce en latencias declaradas de 48 ms (p50) para materiales de menos de 200 tokens y 566 ms para materiales de 1000 a 4000 tokens.

Su relevancia actual radica en dos factores: por un lado, ofrece calibracion por modo (cada modo tiene su propia temperatura incluida con los pesos, de modo que una probabilidad es interpretable); por otro, el modo `tfu` incorpora una tercera respuesta, `unsure`, que permite abstenerse o derivar a revision humana en lugar de forzar una respuesta binaria. Bajo licencia Apache-2.0 y con soporte tanto para `transformers` como para una API HTTP propia (Jev API), se posiciona como una alternativa ligera y rapida para pipelines de clasificacion y verificacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Decoder transformer sobre el modelo base Qwen/Qwen3.5-4B (etiqueta qwen3_5_text) con cabeza de clasificacion de 39 salidas |
| Parametros totales | 3.759.594.944 (3,76B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Pesos safetensors completos y versiones GGUF (segun etiquetas); no se detallan los niveles de cuantizacion concretos |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

Se trata de un decoder transformer que lee un modelo base congelado (Qwen/Qwen3.5-4B) y anade una cabeza de clasificacion de 39 salidas: las etiquetas `true`, `false` y `unsure`, mas una por cada marca de respuesta (`mark_A` ... `mark_Z`, `mark_0` ... `mark_9`). Los distintos modos comparten una misma pasada hacia delante y solo se diferencian en el subconjunto de salidas sobre el que se aplica el softmax y en la temperatura asociada. El paquete de inferencia declara dependencias de `flash-linear-attention` y `fla-core`, aunque la informacion disponible no detalla la composicion exacta de la atencion ni si se trata de un esquema hibrido.

No se ha publicado informacion sobre el volumen de datos de entrenamiento, la composicion del dataset, el uso de RLHF o DPO, ni sobre el metodo de ajuste empleado para obtener la cabeza de decision y las temperaturas de calibracion. La model card unicamente indica que el modelo lee un modelo base congelado y que las temperaturas por modo se distribuyen junto con los pesos en el archivo `prompt.json`, junto con la formulacion exacta de los prompts con la que se midieron los resultados.

## Capacidades

- Clasificacion zero-shot con respuesta probabilistica: el modelo no genera texto, sino distribuciones de probabilidad sobre respuestas predefinidas.
- Modo `noul`: decision si/no sobre dos criterios, con softmax sobre las dos respuestas y calibrado para umbral en 0,5.
- Modo `tfu`: la misma pregunta resuelta sobre tres respuestas (verdadero, falso, unsure), donde `unsure` recoge lo que ninguno de los dos criterios cubre y no se solicita por prompt.
- Modo `choice`: eleccion de una opcion correcta entre 2 y 26 alternativas, con una probabilidad por opcion.
- Modo `scale`: puntuacion ordinal segun rubrica de 10 niveles o menos, con una probabilidad por nivel.
- Calibracion por modo: cada modo incorpora su propia temperatura, de forma que las probabilidades son interpretables de forma directa.
- Capacidad de abtencion: el modo `tfu` permite umbralizar la salida `unsure` para abstenerse, derivar a una persona o descartar un documento.
- Inferencia de un unico forward pass por decision, sin generacion de tokens.
- Integracion como clasificador estandar de `transformers` (pipeline `text-classification`) o mediante la API HTTP Jev.
- No se documenta soporte de tool calling, uso de agentes, razonamiento multi-paso, vision ni audio.
- Capacidades multilingues: no disponibles; el modelo declara unicamente el idioma ingles.

## Casos de uso

- Verificacion de afirmaciones (fact checking): con el modo `tfu` el modelo permite comprobar si una afirmacion esta respaldada por un material y, ademas, marcar como `unsure` los casos no decidibles; en FEVER logra un AUC de 0,771 separando material indecidible de decidible.
- Abtencion en pipelines automaticos: umbralizando `p(unsure)` se puede descartar un documento o enviarlo a revision humana antes de que entre en un flujo productivo, evitando respuestas binarias forzadas.
- Clasificacion de documentos con opciones cerradas: con el modo `choice` se puede asignar una categoria entre 2 y 26 alternativas (por ejemplo, tipos de incidencia o categorias tematicas) obteniendo una probabilidad por clase.
- Evaluacion ordinal con rubrica: con el modo `scale` se pueden puntuar respuestas, resenas o incidencias en una escala de hasta 10 niveles, util para sistemas de scoring o control de calidad.
- Coincidencia de politicas y normativa: el modo `noul` permite comprobar si una afirmacion queda cubierta o excluida por una politica, con dos criterios explicitos y un umbral calibrado a 0,5.
- Enrutado de decisiones en produccion de baja latencia: al resolverse en un forward pass (48 ms p50 para materiales de menos de 200 tokens), encaja en servicios que necesitan clasificar grandes volumenes sin coste de generacion.
- Moderacion de contenido asistida: la salida probabilistica permite fijar umbrales de confianza para aceptar, revisar o rechazar contenido antes de aplicar acciones automaticas.
- Servicio HTTP compatible con Jev API: al desplegarse con `typecastlm-serve`, un cliente escrito contra esa interfaz puede apuntar al modelo cambiando solo la URL base.

## Benchmarks y rendimiento

Resultados publicados en el listado JevBench v1.6.1 (88 sistemas de pesos abiertos, 6 de octubre de 2026). El Composite Score pondera a partes iguales precision, calibracion, velocidad y coste; el Capability Score considera unicamente precision y calibracion.

| Puesto | Sistema | Base | Composite Score | Capability Score |
|---|---|---|---|---|
| 4 | deck-31B | Gemma-4-31B | 68,7 | 77,6 |
| 5 | Cygnet | Gemma-4-12B | 68,6 | 70,9 |
| 13 | jev-local | Qwen3.5-9B | 41,3 | 57,5 |
| 25 | jqv | Qwen3-32B | 25,4 | 61,9 |
| 32 | TypeCastLM | Qwen3.5-4B | 19,7 | 56,5 |
| 42 | SemIf | Qwen3.5-4B | 15,5 | 55,4 |
| 44 | LitJev | Qwen3.8-27B | 11,5 | 66,6 |
| 45 | local-jev | Qwen3.5-4B | 11,4 | 55,0 |
| 46 | system-one | Qwen3-8B | 11,0 | 29,7 |
| 50 | open-alternative-jev | Qwen3.5-4B | 9,4 | 49,1 |
| 53 | Nemotron Diffusion 8B | Nemotron-8B | 7,3 | 47,5 |

Adicionalmente, la model card indica una AUC de 0,771 en FEVER para la separacion entre material indecidible y decidible mediante la salida `unsure`. No se han publicado en la informacion disponible resultados de benchmarks como MMLU, HumanEval o GSM8K, y dado que el modelo es un clasificador y no un generador, esas metricas no serian directamente aplicables.

## Requisitos de hardware

- Peso de los pesos: 7,5 GB (modelo de 3,76B parametros), segun la model card.
- Inferencia en tarjeta de consumo: el modelo declara ejecutarse en una tarjeta de consumo de 16 GB, donde se midieron las latencias publicadas.
- Latencia declarada: 48 ms de mediana (p50) para materiales de menos de 200 tokens y 566 ms para materiales de 1000 a 4000 tokens, sobre una tarjeta de consumo de 16 GB.
- GPU recomendadas: no se especifican modelos concretos (A100, H100, RTX 4090, etc.) en la informacion disponible.
- Formatos de despliegue: safetensors y GGUF, ademas de la libreria `transformers` (pipeline `text-classification`).
- Opciones de despliegue documentadas: pipeline de `transformers`; paquete `typecastlm[local]` con `flash-linear-attention` y `fla-core`; servidor HTTP `typecastlm-serve` (`typecastlm[server]`).
- Throughput: no disponible.

## Comparativa con modelos similares

Comparativa con sistemas del mismo listado JevBench, en particular los que leen el mismo modelo base (Qwen3.5-4B):

| Sistema | Base | Parametros | Composite Score | Capability Score |
|---|---|---|---|---|
| TypeCastLM | Qwen3.5-4B | 3,76B | 19,7 | 56,5 |
| SemIf | Qwen3.5-4B | no disponible | 15,5 | 55,4 |
| local-jev | Qwen3.5-4B | no disponible | 11,4 | 55,0 |
| open-alternative-jev | Qwen3.5-4B | no disponible | 9,4 | 49,1 |
| jev-local | Qwen3.5-9B | no disponible | 41,3 | 57,5 |
| jqv | Qwen3-32B | no disponible | 25,4 | 61,9 |

Todos los sistemas de la comparativa comparten categoria (modelos de decision sobre modelo base congelado) y licencia no especificada en la informacion disponible salvo TypeCastLM, que es Apache-2.0. Los datos de contexto, cuantizacion y disponibilidad de los competidores no estan disponibles en la informacion proporcionada.

## Limitaciones y advertencias

- El modelo solo declara soporte para ingles (`en`); el comportamiento en otros idiomas no esta documentado.
- Es un clasificador, no un generador: no produce texto libre ni razonamiento explicito, y por tanto no sirve para tareas de generacion.
- La cabeza tiene 39 salidas que responden a preguntas distintas; el propio autor advierte de que hay que aplicar el softmax unicamente sobre el subconjunto de salidas que usa la pregunta, nunca sobre las 39.
- La calibracion depende de las temperaturas incluidas en `prompt.json`; usar el modelo fuera de esas formulaciones de prompt puede invalidar la interpretacion de las probabilidades.
- La salida `unsure` solo tiene sentido en el modo `tfu`; en `noul` la probabilidad es un softmax sobre las dos respuestas que deciden la pregunta y no incorpora esa tercera opcion.
- Riesgo de alucinacion: no aplica en el sentido generativo, pero existe riesgo de clasificacion erronea con alta confianza en dominios fuera de la distribucion de entrenamiento.
- No se documentan sesgos conocidos, composicion del dataset ni evaluaciones de equidad.
- No se especifican requisitos de atribucion mas alla de la licencia Apache-2.0; al ser permisiva, se permite uso comercial, pero se recomienda conservar el aviso de licencia y la atribucion al autor.
- La fecha de creacion y actualizacion del repositorio (2026) y la presencia de los modelos base Qwen3.5 no permiten validar de forma independiente el resto de cifras publicadas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mihailgribov/typecastlm-qwen3.5-3.8b
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Paquete en PyPI: https://pypi.org/project/typecastlm/
- Repositorio fuente: https://github.com/mihail-gribov/typecastlm
- Contrato HTTP (Jev API): https://github.com/mihail-gribov/typecastlm/blob/main/docs/API.md
- Listado JevBench: https://benchmarkheaven.com/jev-models
