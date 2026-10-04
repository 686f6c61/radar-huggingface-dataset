# Fatha/vev-9b-v2

## Resumen

vev-9b-v2 es un modelo multimodal de decision visual publicado por el usuario Fatha en HuggingFace. No es un modelo generativo de proposito general: dado una unica imagen, responde preguntas de si/no o de opcion multiple y devuelve probabilidades calibradas sobre las opciones. Su proposito principal es la evaluacion automatica de imagenes generadas por IA (coincidencia con el prompt, presencia de artefactos, calidad del texto renderizado, etc.).

Tecnicamente es un ajuste fino del modelo base Qwen/Qwen3.5-9B-Base mediante una LoRA de rango 32 que se ha fusionado en los pesos finales, dando lugar a un checkpoint de 9.409.813.744 parametros (aproximadamente 9,4 mil millones) en formato safetensors, con un repositorio de 18,8 GB. El entrenamiento consistio en 846 pasos sobre 59.378 filas de datasets publicos de imagenes unicas etiquetadas por humanos, sin datos de rating ni de estetica.

Su rasgo diferencial es la calibracion: el autor ajusto una unica temperatura (T = 1.163) sobre una particion de validacion de 1.999 ejemplos, almacenada en el fichero `vev_config.json`. Segun la model card, esa particion alcanza una exactitud de 0.906 y un error de calibracion esperado (ECE) de 0.0159 tras el escalado de temperatura, lo que permite usar las probabilidades de salida como umbrales fiables en pipelines automaticos. El modelo tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validacion independiente por parte de la comunidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible con detalle; derivada de Qwen/Qwen3.5-9B-Base (tag `qwen3_5`), multimodal imagen-texto |
| Parametros totales | 9.409.813.744 |
| Parametros activos | No aplica (no se describe como MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (el repositorio solo publica safetensors sin cuantizar) |
| Idiomas soportados | No disponible |
| Licencia | `other` / `see-data-licenses`. Codigo Apache-2.0; los pesos heredan las condiciones de los datasets de entrenamiento |
| Formato de pesos | safetensors (libreria transformers) |
| Modelo base | Qwen/Qwen3.5-9B-Base |
| Modalidad de entrada | Imagen unica + texto (pipeline `image-text-to-text`) |
| Tipo de ajuste | LoRA de rango 32, fusionada en los pesos |
| Tamano del repositorio | 18,8 GB |
| Calibracion | Temperatura unica T = 1.163, ajustada sobre 1.999 ejemplos de validacion |
| Fecha de publicacion | 2026-10-04 |
| Fecha de actualizacion | 2026-10-04 |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna mas alla de que el modelo deriva de Qwen/Qwen3.5-9B-Base, etiquetado con `qwen3_5` y con pipeline `image-text-to-text`. No se especifica en la model card el numero de capas, la dimension oculta, el mecanismo de atencion ni el codificador visual empleado. Lo que si se documenta es que se trata de un fine-tuning mediante LoRA de rango 32 sobre ese modelo base, posteriormente fusionada en los pesos, lo que produce un checkpoint denso de 9.409.813.744 parametros.

El entrenamiento consta de 846 pasos sobre 59.378 filas procedentes de datasets publicos de imagenes unicas etiquetadas por humanos. El autor indica explicitamente que no se han usado datos de rating ni de estetica, lo que orienta el modelo hacia juicios objetivos verificables (coincidencia semantica, presencia de artefactos, legibilidad del texto) y no hacia preferencias subjetivas de calidad. No se menciona el uso de RLHF, DPO ni ninguna otra fase de alineamiento.

La innovacion tecnica destacable es la calibracion de probabilidades: tras el entrenamiento se ajusto una temperatura unica de 1.163 sobre una particion de validacion de 1.999 ejemplos, guardada en `vev_config.json`. Sobre esa misma particion, el modelo alcanza 0.906 de exactitud y 0.0159 de ECE tras el escalado. No se documenta el ECE previo al escalado, ni la composicion exacta de los datasets, ni el desglose de la particion de entrenamiento.

## Capacidades

- Respuesta a preguntas binarias de si/no sobre una imagen dada.
- Respuesta a preguntas de opcion multiple con distribucion de probabilidad sobre las opciones.
- Salida de probabilidades calibradas, aptas para fijar umbrales de decision automaticos (ECE de 0.0159 en la particion de validacion).
- Evaluacion de coincidencia entre un prompt y la imagen generada.
- Deteccion de artefactos visuales en imagenes sinteticas.
- Verificacion de texto renderizado dentro de la imagen.
- Procesamiento de una sola imagen por consulta, con interfaz conversacional segun el tag `conversational`.
- Soporte de tool calling / function calling: no disponible.
- Capacidades de agente o razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible (no se declara lista de idiomas).
- Modo de razonamiento explicito (thinking mode): no disponible.
- Entrada de audio o video: no disponible.
- Generacion de imagenes: no, es un modelo de decision, no de sintesis.

## Casos de uso

- Control de calidad en pipelines de generacion de imagenes: colocar el modelo como filtro posterior a un generador texto-a-imagen para comprobar si la imagen resultante responde al prompt original, usando el umbral de probabilidad calibrada para decidir si se descarta o se regenera.
- Deteccion de artefactos antes de entrenar: pasar por el modelo los lotes de imagenes sinteticas destinadas a un dataset de entrenamiento y descartar aquellas con probabilidad alta de contener artefactos, reduciendo ruido en el conjunto de datos.
- Verificacion de texto renderizado: preguntar al modelo si el cartel, etiqueta o rotulo de la imagen contiene exactamente el texto solicitado, util en generacion de material promocional o maquetas con tipografia.
- Triaje de revision humana: enviar a revision manual unicamente los casos cuya probabilidad de salida queda cerca de 0.5, aprovechando la calibracion para no saturar al equipo de anotacion.
- Comparativa A/B de modelos de difusion: evaluar dos generadores sobre el mismo conjunto de prompts con el mismo modelo juez y comparar las tasas de exito con intervalos de confianza derivados de las probabilidades calibradas.
- Curacion de datasets multimodales: filtrar pares imagen-texto en los que la descripcion no se corresponde con el contenido visual, como paso previo a un entrenamiento de captioning o recuperacion.
- Moderacion de contenido visual generado: comprobar el cumplimiento de criterios binarios definidos por politica antes de publicar una imagen generada.
- Integracion en herramientas de diseno generativo: exponer el modelo como servicio de validacion en un editor que sugiere variaciones y descarta automaticamente las que no cumplen la instruccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K ni equivalentes multimodales) en la informacion disponible. El unico dato de rendimiento publicado es el de la particion de validacion usada para la calibracion:

| Particion de calibracion (held-out, 1.999 ejemplos) | Exactitud | ECE |
|---|---|---|
| Tras escalado de temperatura (T = 1.163) | 0.906 | 0.0159 |

No se dispone de la metrica antes del escalado de temperatura, ni de resultados por subcategoria (coincidencia de prompt, artefactos, texto renderizado), ni de comparaciones con otros modelos jueces.

## Requisitos de hardware

- Los siguientes valores de VRAM son estimaciones aritmeticas derivadas del numero de parametros (9.409.813.744) y del tamano del repositorio (18,8 GB), no cifras confirmadas por el autor.
- Precision completa (FP16/BF16): aproximadamente 18,8 GB solo en pesos; con cache KV y tokens visuales de imagen, reservar del orden de 24 GB o mas.
- Cuantizacion a 8 bits: aproximadamente 9,4 GB en pesos; reservar del orden de 12 a 14 GB de VRAM.
- Cuantizacion a 4 bits: aproximadamente 4,7 a 5,5 GB en pesos; reservar del orden de 7 a 9 GB de VRAM.
- El repositorio no publica checkpoints cuantizados (GGUF, AWQ, GPTQ ni similares), por lo que cualquier despliegue en 4 u 8 bits requiere una conversion propia.
- GPU recomendadas para FP16: A100 40 GB, H100, L40S. En una RTX 4090 de 24 GB el modelo en FP16 resulta ajustado y depende de la resolucion de imagen y del numero de tokens visuales.
- Cabe en GPU de consumo con cuantizacion de 4 bits: RTX 3090, RTX 4090, RTX 4080 o equivalentes con 12 GB o mas.
- Opciones de despliegue: la model card remite al repositorio de GitHub para el servicio y la CLI (`vev serve --run` apuntando a un directorio de modelo); el tag `endpoints_compatible` sugiere compatibilidad con HuggingFace Inference Endpoints; tambien es desplegable con transformers y, previsiblemente, con vLLM si la arquitectura base esta soportada (no confirmado en la informacion disponible).
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de modelos comparables en la informacion proporcionada, por lo que la comparacion se limita a caracteristicas estructurales verificables.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Fatha/vev-9b-v2 | 9,41 B | No disponible | `other` (see-data-licenses), pesos con restricciones heredadas de los datasets | HuggingFace, 0 descargas y 0 likes | Modelo juez de decision visual con calibracion explicita (T = 1.163) |
| Qwen/Qwen3.5-9B-Base | No disponible con precision | No disponible | Segun el repositorio de Qwen | HuggingFace | Modelo base sobre el que se construye vev-9b-v2; sin calibracion ni cabeza de decision especifica |
| Otros modelos jueces multimodales (Qwen-VL, InternVL, LLaVA, etc.) | No disponible | No disponible | No disponible | No disponible | No se han encontrado comparativas publicadas para vev-9b-v2 |

En los resultados de busqueda aparece un endpoint en FriendliAI bajo el namespace `CountingSheep/vev-9b`, distinto del autor de esta ficha (`Fatha`). No se puede confirmar que corresponda al mismo modelo, por lo que no se usa como referencia comparativa.

## Limitaciones y advertencias

- Ambito restringido: el modelo responde preguntas de si/no o de opcion multiple sobre una unica imagen. No es un generador de texto libre ni un modelo de proposito general.
- Calibracion dependiente de la distribucion: la temperatura T = 1.163 y el ECE de 0.0159 se obtuvieron sobre una particion de 1.999 ejemplos. Aplicado a dominios, resoluciones o estilos de imagen distintos, la calibracion puede degradarse y las probabilidades dejar de ser fiables como umbrales.
- Riesgo de alucinacion: al ser un modelo de decision, el fallo tipico no es inventar texto sino responder con alta confianza una pregunta cuya respuesta no es verificable en la imagen (por ejemplo, sobre elementos ausentes o demasiado pequenos).
- Datos de entrenamiento con condiciones heterogeneas: el autor advierte de que los pesos se entrenaron con datasets cuyos terminos incluyen algunos de solo investigacion. Esas restricciones se heredan a los pesos.
- Licencia: la licencia declarada es `other` (`see-data-licenses`). El codigo del proyecto es Apache-2.0, pero eso no cubre los pesos. Antes de cualquier uso comercial es obligatorio revisar `DATA_LICENSES.md` en el repositorio de GitHub; no se puede asumir uso comercial libre.
- Idiomas, contexto y cuantizaciones no declarados: no hay informacion publicada sobre cobertura linguistica, longitud de contexto soportada ni formatos cuantizados, lo que dificulta planificar despliegues en produccion.
- Sin validacion externa: 0 descargas y 0 likes, ademas de una unica particion de validacion reportada por el propio autor. No hay evaluacion independiente ni replicacion de terceros.
- Ausencia de benchmarks estandar: no se puede comparar su rendimiento con otros modelos jueces mediante metricas publicas reconocidas.
- Fecha de publicacion inusualmente avanzada (2026-10-04) en los metadatos de HuggingFace; conviene verificar la vigencia del repositorio antes de depender de el.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Fatha/vev-9b-v2
- Repositorio de codigo, servicio, CLI y benchmark: https://github.com/Fathaah/vev
- Licencias de los datos de entrenamiento: https://github.com/Fathaah/vev/blob/main/DATA_LICENSES.md
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B-Base
- Endpoint en FriendliAI bajo otro namespace, sin confirmar que sea el mismo modelo: https://friendli.ai/models/CountingSheep/vev-9b
- Nota sobre la busqueda web: el resto de resultados obtenidos (FLUX.2-klein-9B-Blitz-ComfyUI, workflows de FLUX.2 Klein en Civitai y LoRAs de piel sobre FLUX.2 Klein) corresponden a modelos de generacion de imagen sin relacion con vev-9b-v2 y no se han usado como fuente.
