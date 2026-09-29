# RunningHubAI/rh-ripblouse-lora

## Resumen

rh-ripblouse-lora es un adaptador de tipo LoRA publicado por RunningHubAI (autor original identificado en la model card como RunningHub-@404) para el modelo de generacion de video WAN2.2, concretamente sobre el experto de alto ruido (HighNoise). El repositorio de HuggingFace contiene un unico fichero de pesos, `RipHerBlouse.safetensors`, de 343 MiB, y esta etiquetado con los tags `comfyui` y `lora`. La model card no incluye informacion sobre el pipeline de difusion subyacente, la licencia ni los idiomas soportados.

Se trata, por tanto, de un adaptador de bajo rango (Low-Rank Adaptation) y no de un modelo completo: no es utilizable de forma autonoma, sino que debe cargarse junto con los pesos base de WAN2.2 en un entorno compatible, tipicamente ComfyUI o la plataforma en la nube de RunningHub. El nombre del fichero y del repositorio indica que su funcion es modificar la apariencia de una prenda de ropa (desgarro o apertura de una blusa) en el resultado generado, lo que lo situa en la categoria de LoRAs de efectos de vestuario para generacion de video.

La relevancia de esta ficha es limitada en terminos de investigacion: el modelo acumulaba 0 descargas y 0 likes en el momento de la consulta, no tiene licencia declarada y la model card es practicamente vacia (el campo "About this model" contiene un unico caracter). Esto lo convierte en un ejemplo tipico de artefacto publicado automaticamente desde una plataforma de entrenamiento, con trazabilidad tecnica minima.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre WAN2.2 (HighNoise); arquitectura del modelo base no disponible |
| Parametros totales | no disponible (adaptador LoRA de ~343 MiB, rango no declarado) |
| Parametros activos | no aplica (no es un modelo MoE; el base WAN2.2 podria serlo, dato no disponible) |
| Longitud de contexto | no aplica (modelo de generacion de video, no de lenguaje); no disponible |
| Tipos de cuantizacion | no disponible; el adaptador se distribuye en precision completa para el formato safetensors |
| Idiomas soportados | no disponible |
| Licencia | no disponible; la model card indica que se sigue "la licencia del proyecto original o upstream" |
| Formato de pesos | safetensors (LoRA), fichero `RipHerBlouse.safetensors` de 343 MiB |
| Modelo base | WAN2.2 (HighNoise), segun la model card |
| Plataformas compatibles | ComfyUI, RunningHub, Hugging Face |
| Tamano del repositorio | 0,4 GB |
| Descargas / likes | 0 / 0 |
| Fecha de publicacion | 2026-09-28 |

## Arquitectura y entrenamiento

La informacion disponible no permite describir la arquitectura interna del adaptador mas alla de su naturaleza LoRA. No se declara el rango (rank), el valor de alpha, las capas objetivo (target modules), la tasa de aprendizaje, el numero de pasos ni el dataset de entrenamiento. Tampoco se especifica si el entrenamiento se realizo sobre el experto de alto ruido de forma aislada o sobre el pipeline completo de WAN2.2, ni si se emplearon tecnicas auxiliares como regularizacion por captions, dropout o entrenamiento con mascaras.

El unico dato tecnico de entrenamiento explicitado es el origen: `Finetuned from: WAN2.2 (HighNoise)`. WAN2.2 es una familia de modelos de generacion de video de pesos abiertos distribuida por el proyecto Wan; el adaptador se ha entrenado, por tanto, sobre un modelo de difusion para texto-a-video o imagen-a-video, y su efecto esperado es la modificacion del atributo de vestuario en los fotogramas generados. Cualquier afirmacion adicional sobre composicion del dataset, uso de RLHF/DPO (que no aplica a modelos de difusion de este tipo en su forma estandar) o innovaciones tecnicas concretas seria especulativa y no se incluye.

La model card menciona ademas que el modelo puede entrenarse y ejecutarse a traves de la plataforma RunningHub, lo que sugiere que el flujo de trabajo de referencia es un pipeline alojado con exportacion de pesos a safetensors.

## Capacidades

- Modificacion de vestuario en generacion de video: el adaptador esta disenado para alterar la apariencia de una prenda (segun el nombre, desgarrar o abrir una blusa) en el material generado por el modelo base.
- Integracion como LoRA en ComfyUI: puede cargarse mediante los nodos de carga de LoRA habituales y combinarse con otros adaptadores y con el prompt del modelo base.
- Compatibilidad con el experto HighNoise de WAN2.2: segun la model card, el ajuste fino parte de ese componente del pipeline.
- Generacion de texto: no aplica, no es un modelo de lenguaje.
- Tool calling / function calling: no disponible, no aplica.
- Soporte de agentes y razonamiento multi-paso: no disponible, no aplica.
- Capacidades multilingues: no disponible; la comprension del prompt depende del codificador de texto del modelo base, no del LoRA.
- Capacidades especiales (vision, audio, thinking mode): no disponibles en la informacion proporcionada.

## Casos de uso

- Efectos de vestuario en postproduccion de video: el LoRA puede aplicarse sobre planos generados con WAN2.2 para introducir un cambio de estado en una prenda concreta (rotura, apertura) sin necesidad de simular la tela fisicamente ni rodar la secuencia dos veces.
- Previsualizacion de vestuario en animatica: en produccion audiovisual, permite generar versiones alternativas de un plano con la prenda en distinto estado para decidir en fases tempranas, usando ComfyUI como entorno de iteracion rapida.
- Prototipado de pipelines de difusion de video: sirve como ejemplo de adaptador ligero (343 MiB) que se puede cargar y descargar de memoria sin recompilar el modelo base, util para medir el coste de anadir LoRAs encadenados en un grafo de ComfyUI.
- Creacion de contenido para plataformas de generacion alojada: al estar pensado para RunningHub, encaja en flujos donde el usuario no dispone de GPU local y ejecuta el pipeline mediante API o interfaz web.
- Pruebas de composicion de multiples LoRAs: permite evaluar como interactua un adaptador de vestuario con LoRAs de estilo o de personaje sobre el mismo experto de alto ruido, analizando perdida de coherencia temporal entre fotogramas.
- Investigacion sobre edicion de atributos en video generado: como caso de estudio de curacion de adaptadores publicados automaticamente, con licencia indefinida y model card vacia, resulta util para analizar riesgos de procedencia y trazabilidad en repositorios abiertos.
- Filtrado y moderacion de contenido: tambien puede emplearse en sentido inverso, es decir, como referencia para construir clasificadores o filtros que detecten este tipo de modificaciones en material generado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas objetivas (FVD, CLIP score, SSIM, consistencia temporal), ni comparaciones cuantitativas con otros adaptadores, ni ejemplos de salida con parametros de muestreo asociados.

## Requisitos de hardware

- VRAM para el adaptador: el fichero LoRA ocupa 343 MiB en disco; en memoria, su huella es marginal frente a la del modelo base.
- VRAM para el modelo base: no disponible en la informacion proporcionada. Como referencia orientativa no confirmada por el autor, un experto de difusion de video de escala ~14B en bf16 requiere del orden de 28 GB de VRAM, alrededor de 15 GB en fp8 y del orden de 10 GB en cuantizaciones GGUF Q4, cifras que deben verificarse contra la documentacion oficial de WAN2.2 y no contra esta ficha.
- GPU recomendadas: no disponible. Por el rango de VRAM estimado, el modelo base se situa en la franja de A100 40/80 GB, H100, L40S o RTX 6000 Ada; las GPU de consumo con 24 GB (RTX 3090, 4090) quedarian al limite y dependerian de cuantizacion y offloading.
- Cabe en GPU de consumo: no confirmado; previsiblemente solo con cuantizacion agresiva y descarga de pesos a RAM o disco.
- Opciones de despliegue: ComfyUI (entorno de referencia declarado), plataforma RunningHub (cloud y API) y Hugging Face como alojamiento de pesos. No se declara compatibilidad explicita con vLLM, llama.cpp, Ollama o TGI, que ademas no son aplicables a un modelo de difusion de video en su forma habitual.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| rh-ripblouse-lora | LoRA sobre WAN2.2 HighNoise | ~343 MiB de pesos de adaptador | no aplica | no disponible | HuggingFace (0 descargas) |
| Otros LoRAs de efectos para WAN2.2 | LoRA | no disponible | no aplica | variable | no disponible en la informacion proporcionada |
| Modelo base WAN2.2 (HighNoise) | Modelo de difusion de video | no disponible en esta ficha | no aplica | segun proyecto upstream | distribucion abierta del proyecto Wan |
| Adaptadores de vestuario para otros modelos de video | LoRA | no disponible | no aplica | variable | no disponible |

No se dispone de datos de rendimiento de ninguno de los elementos comparados en la informacion proporcionada, por lo que la comparativa se limita a tipo de artefacto, licencia y canal de distribucion.

## Limitaciones y advertencias

- Licencia indefinida: la model card no declara licencia concreta y remite a "la licencia del proyecto original o upstream". Esto impide determinar si el uso comercial esta permitido; en un entorno de produccion debe resolverse esta ambiguedad antes de cualquier despliegue.
- Contenido potencialmente sensible: el nombre del repositorio y del fichero indican una funcion de modificacion de ropa que puede producir material no apto para todos los publicos. Debe evaluarse el cumplimiento de las politicas de la plataforma de destino y de la legislacion aplicable.
- Riesgo de alucinacion visual: como todo adaptador de difusion, puede introducir artefactos, incoherencias temporales entre fotogramas y deformaciones anatomicas, especialmente al combinarse con otros LoRAs.
- Dependencia total del modelo base: el adaptador no funciona de forma aislada; su comportamiento depende de la version concreta de WAN2.2 HighNoise y puede degradarse con otras variantes o versiones del base.
- Ausencia de documentacion: sin rango, alpha, capas objetivo ni parametros de entrenamiento, la reproducibilidad es nula y el ajuste fino adicional resulta dificil de planificar.
- Idiomas no declarados: no hay informacion sobre el comportamiento con prompts en castellano; el codificador de texto del base determina el soporte real.
- Sin validacion por la comunidad: 0 descargas y 0 likes implican ausencia de verificacion externa, de ejemplos reproducibles y de reporte de fallos.
- Trazabilidad de la publicacion: el modelo se distribuye a traves de una cuenta de plataforma, con copyright retenido por el autor original; conviene verificar la procedencia antes de reutilizarlo.
- Sin garantias de mantenimiento: no se declara versionado, changelog ni fecha de soporte.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/RunningHubAI/rh-ripblouse-lora
- Modelo original en RunningHub: https://www.runninghub.ai/model/public/2054166825763647490
- Pagina del autor en RunningHub: https://www.runninghub.ai/user-center/1980346154456125442
- Plataforma RunningHub (internacional): https://www.runninghub.ai
- Plataforma RunningHub (China): https://www.runninghub.cn
- Documentacion de la API (ingles): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentacion de la API (chino): https://www.runninghub.cn/runninghub-api-doc-cn/
- Entrenamiento de modelos en RunningHub: https://www.runninghub.ai/page-model
- Detalle de API de Seedance 2.5 (enlace relacionado de la model card): https://www.runninghub.ai/call-api/api-detail/2133100000000700025
- Paper o blog oficial del adaptador: no disponible
- Demo publica del adaptador: no disponible
