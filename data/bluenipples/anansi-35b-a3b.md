# BlueNipples/Anansi-35B-A3B

## Resumen

Anansi-35B-A3B es un modelo de lenguaje obtenido por fusión de pesos (*merge*) y publicado por el usuario BlueNipples en HuggingFace. No es un modelo entrenado desde cero: se construye combinando tres modelos donantes mediante una receta declarada de DARE-TIES al 45/55 y una interpolación posterior del tensor de la cabeza LM (*lm-head-swap*). El objetivo declarado por el autor es lograr un modelo que equilibre seguimiento de instrucciones, razonamiento narrativo y una prosa más cuidada, y que sea ejecutable en hardware de gama de consumo ("potato"), en lugar de los modelos densos de ~30B.

La nomenclatura "35B-A3B" sugiere una arquitectura de mezcla de expertos (*MoE*) con aproximadamente 35.000 millones de parámetros totales y unos 3.000 millones activos por token, aunque la model card no especifica la arquitectura de forma explícita. El autor menciona que Mergekit no soporta "Qwen 3.5", lo que apunta a que los modelos donantes pertenecen a esa familia, pero este dato no se confirma en la documentación disponible.

La relevancia del modelo es limitada en el momento de redactar esta ficha: la model card indica "coming soon", el repositorio tiene un tamaño declarado de 0,0 GB, cero descargas y cero valoraciones, por lo que no hay pesos publicados verificables ni resultados de evaluación. Debe tratarse, por tanto, como un anuncio de receta de fusión más que como un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (la nomenclatura "A3B" sugiere MoE con ~3B activos; no confirmado en la model card) |
| Parametros totales | ~35B segun la nomenclatura del nombre; no confirmado en la model card |
| Parametros activos | ~3B segun la nomenclatura "A3B"; no confirmado |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (no se publican pesos ni cuantizaciones en el repositorio) |
| Idiomas soportados | no disponible (el campo de idiomas figura como no disponible) |
| Licencia | apache-2.0 |
| Formato de pesos | no disponible (tamano del repositorio declarado: 0,0 GB) |

Datos adicionales de la ficha de HuggingFace: pipeline `text-generation`; etiquetas `merge`, `dare-ties`, `lm-head-swap`, `text-generation`, `conversational`, `roleplay`, `narrative-reasoning`; fecha de creacion 2026-09-19; ultima actualizacion 2026-09-20; 0 descargas y 0 likes.

## Arquitectura y entrenamiento

No hay entrenamiento en sentido estricto. El modelo se genera mediante dos operaciones sobre pesos ya entrenados:

1. **Fusion base del "cuerpo" de razonamiento (DARE-TIES 45/55).** Se combinan `huihui-ai/Huihui-Agents-A1-abliterated` al 45% y `Gryphe/WorldSim-Opus-3.6-35B-A3B` al 55%. Segun el autor, el primero aporta buen seguimiento de instrucciones pero un razonamiento demasiado verboso para roleplay, mientras que el segundo ofrece un razonamiento narrativo mucho mas conciso pero un seguimiento de instrucciones menos fiable.
2. **Interpolacion de la cabeza LM al 35%.** Con el script `Wiself/Voice` y un script propio en Python, el 35% del tensor de la cabeza LM del merge base se interpola con la cabeza LM de `ReadyArt/Melody1437-35B-A3B`. El autor afirma que una proporcion 35/65 preserva mejor la logica, el razonamiento y el seguimiento de instrucciones del modelo base que un reemplazo completo de la cabeza, a la vez que incorpora el estilo de prosa del donante.

El autor indica que Mergekit no soporta la arquitectura de los modelos donantes (menciona "Qwen 3.5") y que tuvo que improvisar la implementacion con asistencia de un LLM. No se documentan tokens de entrenamiento, composicion de dataset, fases de RLHF/DPO ni innovaciones tecnicas adicionales, porque no existe entrenamiento implicado. La innovacion declarada es metodologica: la combinacion de DARE-TIES con un *partial head swap* al 35%.

## Capacidades

- Generacion de texto conversacional y de formato largo orientada a prosa narrativa.
- Roleplay y ficcion interactiva, segun las etiquetas declaradas por el autor.
- Razonamiento narrativo ("narrative-reasoning"), con enfasis en concision frente al donante Agents-A1.
- Seguimiento de instrucciones heredado del linaje `Huihui-Agents-A1-abliterated`, con el objetivo declarado de mejorarlo respecto a WorldSim-Opus.
- Estilo de prosa mejorado mediante la interpolacion de la cabeza LM con Melody1437.
- Soporte de *tool calling* / *function calling*: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible como capacidad verificada; el linaje de uno de los donantes esta orientado a agentes, pero no hay confirmacion para este merge.
- Capacidades multilingues: no disponible.
- Capacidades especiales (modo *thinking*, vision, audio, decodificacion especulativa): no disponible.

## Casos de uso

- **Roleplay y ficcion interactiva de sesion larga:** el modelo esta etiquetado explicitamente como `roleplay` y `conversational`; la interpolacion de la cabeza LM busca una prosa mas natural, adecuada para personajes con voz propia en turnos encadenados. La longitud de contexto util depende del modelo donante y no esta documentada.
- **Generacion de dialogos para videojuegos y visual novels:** la combinacion de razonamiento narrativo conciso (WorldSim-Opus) con buen seguimiento de instrucciones (Agents-A1) encaja en la generacion de arboles de dialogo ramificados donde el modelo debe respetar restricciones de personaje y de trama.
- **Asistente de escritura creativa:** reescritura y continuacion de textos de ficcion manteniendo coherencia de estilo, aprovechando la cabeza LM injertada de Melody1437 para el registro de prosa.
- **Prototipado y pruebas locales en hardware de consumo:** el autor disena el modelo explicitamente para una GPU modesta; un MoE de ~35B con ~3B activos, si se publican cuantizaciones bajas, permitiria inferencia local con requisitos de VRAM muy inferiores a un denso de 30B en precision completa.
- **Sistemas de narracion procedimental para mundos simulados:** el linaje `WorldSim-Opus` sugiere uso en simulacion de mundo y generacion de eventos coherentes con un estado narrativo.
- **Ajuste fino adicional sobre una base permisiva:** al publicarse bajo Apache-2.0, puede servir como punto de partida para *fine-tuning* de estilo o de dominio, siempre que se respeten las licencias de los modelos donantes originales.
- **Investigacion en tecnicas de fusion de modelos:** es un caso de estudio util para reproducir y evaluar DARE-TIES combinado con *partial head swap* frente a un *full head swap*.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card no incluye ninguna tabla de evaluacion (MMLU, GSM8K, HumanEval, MT-Bench ni similares), y el autor solo describe impresiones cualitativas de pruebas previas sobre la proporcion 35/65 de interpolacion de cabeza. Los resultados de la busqueda web no contienen informacion relevante sobre este modelo: los enlaces devueltos corresponden a foros de soporte tecnico de hardware en turco, sin relacion con Anansi-35B-A3B, por lo que no aportan datos de rendimiento ni documentacion adicional.

## Requisitos de hardware

Todas las cifras de esta seccion son estimaciones derivadas del recuento de parametros declarado en el nombre (~35B totales, ~3B activos) y de la suposicion de pesos en precision estandar. No proceden de la model card ni de mediciones publicadas, y dependen de que el autor llegue a publicar los pesos.

- **Pesos en BF16:** ~70 GB solo para pesos, mas cache KV; requiere GPU de 80 GB (H100 80 GB, A100 80 GB) o reparto multi-GPU. No cabe en GPU de consumo.
- **Pesos en FP8:** ~35 GB; viable en una RTX 5090 de 32 GB solo con cuantizacion adicional o *offloading*; en A100 40 GB y H100 80 GB con margen para cache KV.
- **Cuantizacion de 8 bits:** ~35-37 GB; requiere 48 GB o mas de VRAM.
- **Cuantizacion tipo Q4_K_M:** ~20-21 GB; cabe en RTX 3090/4090 de 24 GB con contexto moderado, o en dos GPU de 16 GB.
- **Cuantizacion tipo Q3:** ~16-17 GB; cabe en RTX 4080/4090 de 16-24 GB.
- **Cuantizacion tipo Q2:** ~12-13 GB; cabe en GPU de 12-16 GB, con perdida de calidad apreciable.
- **Al ser MoE con ~3B activos:** la velocidad de generacion seria alta en relacion al tamano de pesos, mas cercana a la de un modelo de 3B denso que a la de un denso de 35B, siempre que los expertos activados residan en VRAM.
- **GPU recomendadas:** H100 80 GB o A100 80 GB para BF16; A100 40 GB, L40S o RTX 6000 Ada para FP8; RTX 4090/3090 de 24 GB para cuantizaciones de 4 bits.
- **Opciones de despliegue:** vLLM y SGLang si se publican pesos en safetensors con arquitectura soportada; llama.cpp y Ollama si se publican GGUF; LM Studio y text-generation-inference como alternativas. Nada de esto puede confirmarse porque el repositorio no contiene pesos en el momento de la consulta.
- **Latencia y throughput:** no disponible.

## Comparativa con modelos similares

La comparacion se establece con los propios modelos donantes, ya que no hay alternativas publicas equivalentes verificadas con la misma receta. Los datos de parametros, contexto y rendimiento de los donantes no estan disponibles en la informacion proporcionada, salvo el recuento implicito en sus nombres.

| Modelo | Rol en la receta | Parametros | Contexto | Rendimiento | Licencia |
|---|---|---|---|---|---|
| Anansi-35B-A3B | Modelo final | ~35B totales / ~3B activos (segun nomenclatura) | no disponible | no disponible | apache-2.0 |
| Gryphe/WorldSim-Opus-3.6-35B-A3B | Donante al 55% (razonamiento narrativo) | ~35B / ~3B activos (segun nomenclatura) | no disponible | no disponible | no disponible |
| huihui-ai/Huihui-Agents-A1-abliterated | Donante al 45% (seguimiento de instrucciones) | no disponible | no disponible | no disponible | no disponible |
| ReadyArt/Melody1437-35B-A3B | Donante de la cabeza LM (35%) | ~35B / ~3B activos (segun nomenclatura) | no disponible | no disponible | no disponible |
| InternScience/Agents-A1 | Linaje original del donante de instrucciones | no disponible | no disponible | no disponible | no disponible |

No se dispone de modelos comparables de terceros con datos verificables dentro de la informacion proporcionada.

## Limitaciones y advertencias

- **Pesos no publicados:** el repositorio declara 0,0 GB de tamano, la model card indica "coming soon" y no hay descargas ni valoraciones. En el momento de redactar esta ficha no es posible descargar ni ejecutar el modelo.
- **Ausencia total de evaluacion:** no existen benchmarks, comparativas cuantitativas ni pruebas reproducibles. Todas las afirmaciones sobre calidad de prosa o de razonamiento provienen del propio autor y son cualitativas.
- **Riesgo de alucinacion:** no cuantificado. Al ser un merge sin evaluacion, no hay datos sobre tasas de alucinacion ni sobre fidelidad factual.
- **Procedencia abliterated:** uno de los donantes principales es una variante *abliterated*, lo que implica que se han eliminado mecanismos de rechazo. Es previsible una reduccion de las barreras de seguridad y un mayor riesgo de generar contenido inapropiado, sin que exista documentacion de mitigaciones.
- **Licencia efectiva incierta:** aunque el repositorio declara Apache-2.0, la licencia de cada modelo donante puede imponer condiciones adicionales. No se dispone de informacion sobre las licencias de `Gryphe/WorldSim-Opus-3.6-35B-A3B`, `huihui-ai/Huihui-Agents-A1-abliterated` ni `ReadyArt/Melody1437-35B-A3B` en la informacion proporcionada. Verificar antes de cualquier uso comercial.
- **Herramientas no oficiales:** el autor declara que Mergekit no soportaba la arquitectura objetivo y que la fusion se implemento con scripts improvisados con ayuda de un LLM. Esto aumenta el riesgo de artefactos no documentados en los pesos.
- **Idiomas no especificados:** el campo de idiomas figura como no disponible, por lo que no hay garantia de calidad en castellano ni en otros idiomas distintos del ingles.
- **Contexto desconocido:** sin longitud de contexto documentada no es posible planificar aplicaciones que dependan de ventanas largas.
- **Fechas de publicacion anomalas:** la ficha registra creacion el 2026-09-19 y actualizacion el 2026-09-20, posteriores a la consulta, lo que refuerza la condicion de publicacion incompleta o en preparacion.
- **Idoneidad para produccion:** nula en el estado actual. Solo es apto como referencia de receta de fusion o para experimentacion una vez se publiquen los pesos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/BlueNipples/Anansi-35B-A3B
- Donante principal (razonamiento narrativo): https://huggingface.co/Gryphe/WorldSim-Opus-3.6-35B-A3B
- Donante de seguimiento de instrucciones: https://huggingface.co/huihui-ai/Huihui-Agents-A1-abliterated
- Donante de la cabeza LM: https://huggingface.co/ReadyArt/Melody1437-35B-A3B
- Linaje original del donante de agentes: https://huggingface.co/InternScience/Agents-A1
- Script de interpolacion de cabeza: https://huggingface.co/Wiself/Voice
- Mergekit: https://github.com/arcee-ai/mergekit

Los resultados de la busqueda web no aportaron enlaces relevantes: todos los resultados devueltos corresponden a foros de soporte tecnico de hardware en turco, sin relacion con el modelo.
