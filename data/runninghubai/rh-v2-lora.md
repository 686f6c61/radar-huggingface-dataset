# RunningHubAI/rh-v2-lora

## Resumen

rh-v2-lora (nombre interno: Combat Base V2) es un adaptador LoRA para generación de vídeo, publicado por RunningHubAI en nombre del autor identificado como @四只兔子 en la plataforma RunningHub. No es un modelo fundacional, sino un ajuste fino de bajo rango que se aplica sobre el modelo base MiniMax H3 y que modifica el comportamiento del mismo en escenas de combate, acción física y diálogo. El repositorio contiene un único archivo de pesos, `H3_Combat_V2.safetensors`, de 148 MiB, lo que sitúa el tamaño total del repositorio en torno a 0,2 GB.

El problema que aborda es concreto: los modelos de vídeo generalistas tienden a resolver las peleas con un patrón de "ataque y reinicio", sin continuidad física entre golpes, sin acumulación de daño y sin respuesta corporal coherente. Este LoRA introduce cadenas de movimiento continuo, reacciones de impacto acumulativas, pérdida de equilibrio, derribos y lógica de remate, además de mejorar el movimiento corporal y la dinámica de audio en escenas no combatientes. La versión V2 amplía el alcance respecto a V1: ya no se limita al wu-shu o al combate puro, sino que también actúa en escenas de diálogo.

Su relevancia actual es doble. Por un lado, demuestra el patrón de trabajo habitual en la comunidad de vídeo generativo: adaptadores LoRA ligeros, entrenados sobre una base concreta, que se distribuyen mediante ComfyUI y plataformas en la nube. Por otro, documenta explícitamente un conjunto de hiperparámetros de muestreo y de estructura de prompt (sampler y scheduler recomendados, palabras de activación, orden "acción → diálogo") sin los cuales el resultado se degrada, algo que conviene tener presente antes de evaluar el modelo. El repositorio no incluye pesos del modelo base, ni pipeline declarado, ni licencia explícita, ni datos de cuantización.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (adaptador LoRA; se aplica sobre MiniMax H3, cuya arquitectura no se detalla en la informacion proporcionada) |
| Parametros totales | no disponible (el adaptador ocupa 148 MiB en disco; no se declara el numero de parametros) |
| Longitud de contexto | no aplicable (no es un modelo de lenguaje; el limite lo fija el modelo base de video) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (la model card indica que los flujos de trabajo adjuntos permiten generar prompts en cualquier idioma) |
| Licencia | no disponible; la model card indica que los derechos pertenecen al autor y que se debe seguir la licencia del proyecto original o del modelo upstream |
| Formato de pesos | safetensors |
| Modelo base | MiniMax H3 |
| Palabras de activacion | `prfight2`, `prfin1` |
| Plataformas compatibles | ComfyUI, RunningHub, Hugging Face |
| Tamano del repositorio | 0,2 GB (un unico archivo de 148 MiB) |
| Fecha de publicacion | 23 de septiembre de 2026 (creacion y ultima actualizacion el mismo dia) |

## Arquitectura y entrenamiento

El adaptador es un LoRA, es decir, una reparametrizacion de bajo rango que se inyecta en las capas del modelo base MiniMax H3 sin modificar sus pesos originales. Esto explica su tamano reducido (148 MiB) y su naturaleza intercambiable: se carga junto al modelo base en ComfyUI o se ejecuta en la infraestructura de RunningHub. La informacion disponible no detalla el rango del LoRA, las capas objetivo ni el numero de tokens de entrenamiento.

El autor describe un proceso iterativo con varias versiones entrenadas y evaluadas, en las que se ajustaron la composicion y el equilibrio del dataset, la velocidad del combate, las reacciones a los impactos y las direcciones de entrenamiento centradas en remates. Segun la model card, las versiones anteriores lograban combates mas rapidos pero degradaban la fluidez nativa de H3, produciendo sensacion de velocidad acelerada, desenfoque o cadenas de ataques sin recuperacion. La version publicada prioriza la continuidad y la causalidad fisica sobre la velocidad bruta. Se menciona tambien una "segunda pasada" o workflow de bajo sigma asociado al trabajo en Civitai, aunque no se aportan detalles tecnicos sobre el mismo en la informacion disponible.

No se documenta el uso de RLHF, DPO ni tecnicas equivalentes. Tampoco se especifica si el entrenamiento se realizo con pares de texto-video, con anotaciones de movimiento o con datos sinteticos.

## Capacidades

- Generacion de video de escenas de combate con continuidad fisica: los ataques fallidos conservan momento, los bloqueos redirigen la trayectoria y los puntos de contacto se separan sin artefactos de fusion entre miembros.
- Acumulacion de dano y reacciones de impacto sostenidas: flexion toracica progresiva, reduccion de la capacidad de defensa y movilidad limitada que desembocan en remates mas verosimiles.
- Tecnicas de accion ampliadas: patadas giratorias encadenadas, agarres y proyecciones sostenidas, colisiones en tres fases con el entorno y caidas con trayectorias de varias etapas.
- Coreografia de escenas tipo 1 contra muchos: entrada escalonada de atacantes, control del espacio entre personajes, seguimiento continuo centrado en el protagonista y continuidad entre planos.
- Rendimiento en escenas de dialogo ("wen xi"): segun las pruebas internas del autor, aumenta la cantidad de movimiento dentro de plano, la dinamica de respiracion y voz, y la definicion de bordes respecto al modelo base.
- Generacion de audio asociada al video: la metrica interna de RMS de audio sugiere que el modelo base produce pista sonora y que el LoRA modifica su dinamica; la model card no detalla el alcance exacto de esta capacidad.
- Soporte de palabras de activacion graduadas: sin trigger para maxima estabilidad anatomica, `prfight2` para mayor agresividad, y `prfight2, prfin1` para impactos fuertes y remates.
- Integracion con flujos de trabajo de ComfyUI y con la API de RunningHub, lo que permite uso interactivo o por lotes.
- Soporte de tool calling, function calling, agentes, razonamiento multi-paso, matematicas, codigo y vision: no aplicable (es un adaptador de generacion de video, no un modelo de lenguaje o multimodal de proposito general).

## Casos de uso

- Previsualizacion de escenas de accion para cine y animacion: el LoRA permite generar previzes con coreografia continua y causalidad fisica, de modo que el equipo de dobles o de animacion puede evaluar tiempos, entradas y salidas de golpes antes de rodar o producir en alta calidad.
- Cinematicas de videojuegos: para estudios que necesitan prototipar secuencias de combate cuerpo a cuerpo con reacciones de impacto creibles, el adaptador ofrece un punto de partida coherente sobre el que iterar con prompts que describan quien ataca, donde impacta y como reacciona el oponente.
- Contenido corto para redes sociales: clips de artes marciales o escenas de accion de pocos segundos, generados en ComfyUI y exportados directamente, aprovechando que el tamano del LoRA permite iterar rapidamente sin reentrenar nada.
- Animatics y storyboards animados: el aumento reportado de movimiento dentro de plano (+19,5%) en escenas de dialogo hace que el adaptador sea util para dar vida a guiones conversacionales, donde normalmente los modelos base generan personajes demasiado estaticos.
- Escenas de multitud y asedio: la capacidad documentada de orquestar composiciones 1 contra muchos con entradas escalonadas y seguimiento centrado en el protagonista encaja en secuencias de asalto, emboscada o disturbios.
- Produccion por lotes mediante API: al publicarse en RunningHub con soporte de API, el adaptador puede integrarse en pipelines automatizados que generen variantes de una misma escena cambiando prompts y semillas, por ejemplo para pruebas A/B de montaje.
- Prototipado de doblaje y diseno sonoro: dado que las pruebas internas miden el RMS de audio, el flujo puede emplearse para explorar la sincronizacion entre accion fisica y locucion antes de pasar a produccion de audio real.
- Demostraciones tecnicas y docencia: el repositorio incluye dos flujos de direccion de combate con instrucciones en chino que separan la fase de direccion de la de redaccion del prompt, un material util para explicar como se estructura un prompt de video de accion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandarizados (MMLU, HumanEval, GSM8K, VBench u otros) en la informacion disponible. El autor solo reporta mediciones internas de comparacion con el modelo base, con la misma semilla, en escenas de dialogo:

| Metrica | Variacion reportada frente al modelo base |
|---|---|
| Movimiento dentro de plano | +19,5% |
| RMS de audio | +34,2% |
| Nitidez de bordes | +22,4% |

Estas cifras proceden de pruebas internas del autor, no de una evaluacion independiente, y no se especifica la metodologia de medicion ni el tamano de la muestra. No se aportan datos equivalentes para las escenas de combate.

## Requisitos de hardware

- Un flujo de trabajo asociado en Civitai se presenta explicitamente como apto para 12 GB de VRAM, lo que indica que la combinacion del modelo base y este LoRA puede ejecutarse en GPU de gama alta de consumo. El dato procede del titulo de ese flujo y no de una especificacion oficial del repositorio.
- El propio adaptador anade una sobrecarga minima: 148 MiB de pesos, frente a los pesos completos del modelo base de video, que no se distribuyen en este repositorio.
- GPU recomendadas: no disponible. La informacion proporcionada no enumera modelos concretos (A100, H100, RTX 4090, etc.) ni perfiles de VRAM por cuantizacion.
- Opciones de despliegue documentadas: ComfyUI (local), la plataforma RunningHub y la API de RunningHub. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que ademas no son aplicables a un adaptador de generacion de video.
- Latencia y throughput estimados: no disponible.

Antes de planificar el despliegue conviene verificar la VRAM requerida por el modelo base MiniMax H3 en la cuantizacion elegida, ya que este repositorio no la documenta y el dato disponible sobre 12 GB corresponde a un flujo de trabajo de terceros.

## Comparativa con modelos similares

| Modelo | Tipo | Modelo base | Tamano | Contexto | Rendimiento publicado | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| rh-v2-lora (Combat Base V2) | LoRA de video, accion y dialogo | MiniMax H3 | 148 MiB | no aplicable | Solo metricas internas del autor | no disponible | Hugging Face, ComfyUI, RunningHub |
| rh-ltx2.3-audio-reactive-lora-v2 | LoRA de video reactivo a audio | no disponible | no disponible | no aplicable | no disponible | no disponible | Hugging Face (RunningHubAI) |
| LoRA generico de estilo o personaje para video | LoRA de video | variable (Wan, LTX, etc.) | tipicamente decenas o cientos de MiB | no aplicable | habitualmente no publicado | variable segun autor | Hugging Face, Civitai, ComfyUI |

La comparacion cuantitativa no es posible con la informacion disponible: no se declaran parametros, dataset ni resultados de benchmarks del modelo base MiniMax H3 ni de los adaptadores alternativos. El criterio diferencial de rh-v2-lora es su especializacion en fisica de combate y continuidad entre planos, con un enfoque de entrenamiento iterativo documentado, frente a LoRAs de estilo que no modifican la dinamica fisica de la escena.

## Limitaciones y advertencias

- No es un modelo autonomo: requiere el modelo base MiniMax H3, que no se incluye en el repositorio y cuya licencia y condiciones de uso son independientes.
- La licencia del propio adaptador no esta declarada como SPDX. La model card indica que los derechos permanecen en el autor y que se debe seguir la licencia del proyecto original o upstream, lo que deja la situacion legal en un limbo poco adecuado para uso comercial sin consulta previa.
- El autor advierte explicitamente de que no es un "LoRA magico": no coreografía combates por si solo. Con prompts pobres del tipo "two people fighting" el resultado tiende a ser un intercambio rapido de golpes sin logica. Se exige describir quien ataca, que hace, donde impacta, como reacciona el oponente y por que encadena el siguiente ataque.
- Sensibilidad elevada al sampler y al scheduler. Solo se recomiendan dos combinaciones: `res_multistep` con scheduler simple, o `euler` con scheduler beta. Otras combinaciones producen resultados visiblemente mas borrosos.
- Orden de prompt obligatorio en escenas mixtas: la accion debe resolverse antes del dialogo. Si se mezclan en el mismo plano sin respetar ese orden, el modelo revierte al comportamiento de camara lenta del modelo base.
- Riesgo de alucinacion visual y de artefactos anatomicos, inherente a la generacion de video: miembros fusionados, contactos fisicos irreales o trayectorias imposibles, especialmente con pesos altos o con prompts ambiguos.
- El repositorio registra 0 descargas y 0 "likes" en el momento de la consulta, por lo que no existe validacion independiente de la comunidad ni replicacion de las metricas internas.
- No se declaran sesgos conocidos, limitaciones de idioma ni restricciones de contenido, pero tampoco se aporta informacion sobre el dataset de entrenamiento que permita evaluarlos.
- Las fechas de creacion y actualizacion del repositorio son muy proximas entre si, lo que sugiere una publicacion reciente y potencialmente sujeta a cambios sin historial de versiones.
- Existen enlaces de promocion y de afiliacion (RunningHub API, plataformas internacional y china) dentro de la model card; conviene tratarlos como material comercial y no como documentacion tecnica.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/RunningHubAI/rh-v2-lora
- Perfil del autor en Hugging Face: https://huggingface.co/RunningHubAI
- Modelo original en RunningHub: https://www.runninghub.cn/model/public/2094270584455782402
- Perfil del autor en RunningHub: https://www.runninghub.cn/user-center/1903712633437167617
- Plataforma RunningHub: https://www.runninghub.ai
- Plataforma RunningHub (China): https://www.runninghub.cn
- Documentacion de la API de RunningHub: https://www.runninghub.cn/runninghub-api-doc-en/
- Documentacion de la API de RunningHub (chino): https://www.runninghub.cn/runninghub-api-doc-cn/
- Entrenamiento de modelos en RunningHub: https://www.runninghub.ai/page-model
- Flujo de trabajo MiniMax H3 en Civitai (12 GB de VRAM): https://civitai.red/models/2869434/minimax-h312gb-vramuniversal-fl2varef2va-base-model-low-sigma-combat-second-pass-workflow?modelVersionId=3241900
- Otro adaptador del mismo autor (referencia comparativa): https://huggingface.co/RunningHubAI/rh-ltx2.3-audio-reactive-lora-v2.safetensors-lora
- README en chino del modelo: README_cn.md (dentro del repositorio)
- Modelo base MiniMax H3: no se proporciona enlace directo en la informacion disponible
