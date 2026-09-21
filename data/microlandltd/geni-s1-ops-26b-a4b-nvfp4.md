# microlandltd/Geni-S1-Ops-26B-A4B-NVFP4

## Resumen

Geni-S1-Ops es un modelo multimodal derivado de `google/diffusiongemma-26B-A4B-it`, publicado por el usuario microlandltd en Hugging Face, y especializado en decisiones operativas tipadas de tipo System-1 para entornos de IT, SRE y DevOps. No es un asistente conversacional al uso: en lugar de generar texto libre token a token, recibe un estado operativo, una o varias preguntas tipadas y el conjunto cerrado de valores permitidos, y devuelve distribuciones de probabilidad sobre esos valores (por ejemplo, operación, riesgo, radio de impacto, reversibilidad o `UNKNOWN`). El checkpoint publico corresponde al modelo de produccion E2, fusionado y cuantizado a NVFP4 para servir lecturas estructuradas con baja latencia.

El modelo se apoya en un transformer disperso de mezcla de expertos (MoE) con decodificador de difusion, que opera sobre un lienzo de tokens en lugar de decodificacion autoregresiva de izquierda a derecha. La model card del modelo base declara aproximadamente 25,2B de parametros totales y unos 3,8B activos, mientras que los tensores safetensors de este repositorio suman 14.404.788.588 parametros, una discrepancia que conviene tener presente. El repositorio ocupa 18,9 GB y declara licencia Apache 2.0.

Su relevancia actual es acotada y muy especifica: propone un patron de ejecucion en el que el modelo aporta evidencia semantica probabilistica y la autorizacion final queda en una capa de politica determinista. Con 0 descargas y 0 likes desde su publicacion el 21 de septiembre de 2026, se trata de un artefacto reciente y sin validacion comunitaria independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer disperso de mezcla de expertos (MoE) con decodificador de difusion (familia DiffusionGemma) |
| Parametros totales | 14.404.788.588 segun los tensores safetensors del repositorio; la model card del modelo base declara ~25,2B |
| Parametros activos | ~3,8B (dato declarado para el modelo base, no verificado en este checkpoint) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 (4 bits en coma flotante); el repositorio incluye ademas la etiqueta "8-bit" y `modelopt` en sus metadatos |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

Otros datos del repositorio: pipeline `image-text-to-text`, tamano del repositorio 18,9 GB, creado el 21 de septiembre de 2026 y actualizado el mismo dia, 0 descargas y 0 likes acumulados.

## Arquitectura y entrenamiento

La base es DiffusionGemma 26B-A4B, un modelo de lenguaje de difusion con mezcla de expertos dispersa y entrada multimodal de texto e imagen. El decodificador de difusion trabaja sobre lienzos de tokens, no sobre generacion autoregresiva convencional; segun la model card, para servir decisiones estructuradas las preguntas se representan en el lienzo y se leen en paralelo, de modo que un unico pase puede producir varias distribuciones (operacion, riesgo, radio de impacto) a la vez. Esa lectura paralela es el argumento central del autor para justificar la latencia baja frente a la generacion libre seguida de parseo.

Sobre esa base se aplico un ajuste fino denominado E2, orientado a decisiones operativas tipadas de IT/SRE, y despues una fusion con un proceso que el autor describe como seguro para pesos atados (tied-weight-safe) y una cuantizacion a NVFP4. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset, ni si se emplearon tecnicas de RLHF, DPO u otras. Tampoco se documentan innovaciones adicionales de atencion mas alla de la decodificacion por difusion.

## Capacidades

- Clasificacion tipada de decisiones operativas: operacion del comando, riesgo operativo, radio de impacto (blast radius), reversibilidad, comportamiento de solo lectura frente a cambio de estado, comportamiento destructivo, requisitos de privilegios, impacto en disponibilidad, impacto en datos y posible perdida de datos, impacto en configuracion, impacto en seguridad y semantica de reinicio o tiempo de inactividad.
- Comportamiento explicito de absteción mediante el valor `UNKNOWN` cuando la informacion es insuficiente.
- Vectores de decision tipados en paralelo: varias preguntas tipadas evaluadas sobre el mismo estado en una sola pasada.
- Esquema de aplicacion definible en tiempo de inferencia: el modelo no esta limitado a una cabeza clasificadora fija.
- Salida en forma de distribuciones de probabilidad sobre el conjunto de valores permitidos, no texto libre.
- Capacidades multimodales de vision conservadas del modelo base, con grounding visual nativo. Las coordenadas siguen la convencion normalizada 0-1000 de la familia Gemma.
- No se declara soporte explicito de tool calling, function calling ni de razonamiento agente multi-paso; el patron propuesto es de decision puntual dentro de un flujo externo.

## Casos de uso

- Puerta de autorizacion previa a la ejecucion de comandos: se envia el comando (`kubectl scale deployment payments --replicas=0`), el entorno y el nivel de criticidad del servicio; el modelo devuelve la operacion detectada y la distribucion de riesgo, que una politica determinista usa para permitir, exigir aprobacion o bloquear.
- Evaluacion de blast radius y reversibilidad antes de operaciones destructivas: el vector de decision alimenta un planificador de cambios que decide si hace falta ventana de mantenimiento o copia de seguridad previa.
- Triaje de alertas de SRE: a partir del estado del incidente se obtienen puntuaciones de impacto en disponibilidad y en datos, lo que permite enrutar la alerta al equipo adecuado sin que un humano lea el contexto completo.
- Analisis de cambios de infraestructura como codigo: clasificacion de planes de Terraform o manifiestos de Kubernetes segun impacto en configuracion y seguridad antes de fusionar el cambio.
- Auditoria de privilegios y superficie de seguridad: deteccion de comandos que requieren privilegios elevados o que modifican controles de acceso, como entrada para un sistema de RBAC o de cumplimiento.
- Seleccion de elementos de interfaz sobre capturas de pantalla: gracias al grounding visual conservado, el modelo puede localizar objetivos en consolas de operaciones o dashboards usando la convencion de coordenadas normalizadas 0-1000, lo que habilita automatizacion de consolas sin API.
- Decisiones operativas de alta frecuencia y bajo coste: al devolver varias decisiones en una sola pasada sobre el lienzo, encaja en puntos de decision repetitivos donde el coste de una generacion autoregresiva completa seria prohibitivo.

## Benchmarks y rendimiento

La unica evaluacion publicada en la informacion disponible es una sonda de grounding sobre 100 ejemplos:

| Modelo | Point-in-bbox (ScreenSpot) |
|---|---:|
| Base DiffusionGemma NVFP4 | 0,838 |
| Geni-S1-Ops E2 NVFP4 | 0,854 |

El propio autor advierte que la comparacion es de tamano reducido (n=100) y que la diferencia debe tratarse como direccional; el resultado relevante es la ausencia de degradacion observada en grounding tras el ajuste fino, la fusion, la cuantizacion y el servicio.

No se han publicado resultados de benchmarks de razonamiento, codigo o matematicas (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. Tampoco hay metricas de precision por campo de decision, calibracion de las probabilidades o tasas de absteción.

## Requisitos de hardware

- No se dispone de cifras publicadas de VRAM para inferencia. Como referencia, el repositorio de pesos ocupa 18,9 GB, de modo que la huella en memoria debe ser igual o superior a esa cantidad, mas el espacio para cache KV y overhead del motor de inferencia.
- La cuantizacion NVFP4 esta pensada para hardware con soporte nativo de FP4; la unica configuracion validada en la informacion disponible es NVIDIA DGX Spark (GB10, 128 GB de memoria unificada) con CUDA 13.0.
- No se confirma compatibilidad con GPU de consumo en la informacion proporcionada; no hay validacion publicada en RTX 4090 u otras.
- Despliegue validado: motor de lectura estructurada sobre vLLM `0.29.1rc1.dev347+gdee37d891` (build incluido en la imagen de `djev-spark`) con `transformers` 5.17.0, expuesto mediante un servidor de decisiones estructuradas con API compatible `POST /v1/systemone` y soporte de entradas de imagen.
- No se documentan opciones de despliegue con llama.cpp, Ollama o TGI para este checkpoint.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables de terceros en la informacion proporcionada. La unica referencia disponible es el modelo base y su variante cuantizada:

| Modelo | Parametros totales | Parametros activos | Contexto | Grounding (n=100) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| google/diffusiongemma-26B-A4B-it | ~25,2B declarados | ~3,8B | no disponible | no aplica (referencia) | no disponible | modelo base |
| DiffusionGemma NVFP4 (base cuantizado) | no disponible | no disponible | no disponible | 0,838 | no disponible | referencia de la comparacion |
| Geni-S1-Ops-26B-A4B-NVFP4 (E2) | 14.404.788.588 segun safetensors | ~3,8B declarados | no disponible | 0,854 | Apache 2.0 | publico en Hugging Face, 0 descargas |

## Limitaciones y advertencias

- Adopcion nula y sin validacion externa: 0 descargas y 0 likes desde su publicacion, sin evaluaciones independientes.
- Discrepancia de parametros: el nombre del repositorio indica 26B-A4B y la model card del base declara ~25,2B, pero los tensores safetensors suman 14.404.788.588. Conviene verificar el checkpoint antes de dimensionar infraestructura.
- Discrepancia de cuantizacion: el nombre declara NVFP4 (4 bits), mientras que los metadatos incluyen la etiqueta "8-bit". Ademas, 18,9 GB para 14,4B parametros equivale aproximadamente a 1 byte por parametro, mas cerca de 8 bits que de 4.
- El modelo no es un asistente conversacional: devuelve distribuciones sobre valores permitidos, por lo que no sirve para generar explicaciones, texto libre ni JSON token a token sin un adaptador adicional.
- Por diseno, no debe ser el autorizador final de una accion: la model card insiste en que la autorizacion quede en politica determinista y que el modelo aporte solo evidencia semantica y probabilidades.
- Riesgo de calibracion: no se publican metricas de calibracion ni de fiabilidad de las probabilidades, pese a que el caso de uso depende directamente de ellas.
- Riesgo de alucinacion en la clasificacion: un valor de riesgo bajo o de reversibilidad completa mal asignado puede desactivar controles de seguridad aguas abajo. El mecanismo `UNKNOWN` mitiga pero no elimina este riesgo.
- Longitud de contexto e idiomas no declarados, lo que impide planificar escenarios de contexto largo o uso multilingue con garantias.
- La evaluacion de grounding tiene n=100 y el propio autor la califica de direccional; no hay datos de degradacion en otras capacidades del modelo base tras el ajuste fino.
- Requisito de hardware restrictivo: NVFP4 depende de soporte nativo de FP4, y la unica pila validada es DGX Spark con una version concreta de vLLM y un servidor externo (`djev-spark`), lo que reduce la portabilidad.
- Licencia: el repositorio declara Apache 2.0, lo que en principio permite uso comercial, pero al derivar de un modelo de la familia Gemma de Google conviene verificar las condiciones aplicables al modelo base antes de un despliegue en produccion.
- La busqueda web realizada no devolvio ninguna fuente relevante sobre este modelo; todos los resultados obtenidos eran articulos de prensa local alemana sin relacion con el artefacto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/microlandltd/Geni-S1-Ops-26B-A4B-NVFP4
- Modelo base: https://huggingface.co/google/diffusiongemma-26B-A4B-it
- Receta de servicio `djev-spark` (commit `1444f3e927f83ba508e5b28a4fd4fdd9ecd0976b`): https://github.com/mmastrac/djev-spark
- Paper, blog o demo oficial: no disponible en la informacion proporcionada
- Fuentes adicionales de la busqueda web: no disponible (los resultados obtenidos no guardan relacion con el modelo)
