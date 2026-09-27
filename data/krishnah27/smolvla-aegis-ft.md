# krishnah27/smolvla-aegis-ft

## Resumen

krishnah27/smolvla-aegis-ft es un fine-tune del modelo vision-lenguaje-accion (VLA) SmolVLA-500M, desarrollado por el usuario krishnah27 y publicado en Hugging Face. No es un modelo de lenguaje generativo al uso: es una politica de control robotico que recibe observaciones visuales e instrucciones en lenguaje natural y emite acciones motoras. El repositorio ocupa 0,9 GB y contiene 450.046.176 parametros en formato safetensors, coherente con la escala de 500M del modelo base `lerobot/smolvla_base`.

El ajuste se ha realizado con LoRA de rango 16 sobre el componente VLM y entrenamiento completo del experto de flujo (*flow expert*), usando el dataset `lerobot/libero`. La particularidad del fine-tune es el condicionamiento por contexto: el identificador de herramienta (`tool_id`), el desplazamiento SE(3) (`se3_offset`) y una etiqueta de fallo se componen dentro de la cadena de tarea. Los lotes mezclan 27.196 fotogramas de exito y 6.276 de fallo condicionado, con `gate_on=False` e `interception_delta=0`.

El propio autor etiqueta el resultado como "validated-candidate-predicted ONLY": no existe validacion fisica con 20 semillas ni se reclama como *champion*. Se trata por tanto de un checkpoint de investigacion, con 0 descargas y 0 *likes* en el momento de la consulta, pensado para reproducir o continuar experimentos de ajuste fino sobre SmolVLA mas que para despliegue en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) basada en SmolVLA: backbone VLM con adaptadores LoRA r=16 y experto de accion (*flow expert*) entrenado a ancho completo |
| Parametros totales | 450.046.176 (~450M) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio solo publica pesos en safetensors; no hay GGUF ni cuantizaciones publicadas) |
| Idiomas soportados | no disponible (el modelo base acepta instrucciones en lenguaje natural, pero la ficha no declara idiomas) |
| Licencia | no disponible (la model card no especifica licencia) |
| Formato de pesos | safetensors |
| Tamano del repositorio | 0,9 GB |
| Modelo base | `lerobot/smolvla_base` |
| Dataset de entrenamiento | `lerobot/libero` |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-09-27 |

## Arquitectura y entrenamiento

La arquitectura sigue el diseno de SmolVLA, descrito en el paper arXiv:2506.01844: un VLM preentrenado sobre datos multimodales a gran escala se adapta a control robotico en lugar de entrenar una politica desde cero, con el objetivo declarado de hacer la robotica VLA mas asequible y eficiente. En este fine-tune concreto, la adaptacion se hace con LoRA de rango 16 sobre el VLM mientras que el experto de flujo que genera las acciones se entrena de forma completa (no con adaptadores de bajo rango).

El entrenamiento usa el dataset `lerobot/libero` y condiciona la tarea con informacion estructurada inyectada en la propia cadena de texto: `tool_id`, `se3_offset` y una etiqueta de fallo, tomados de un fichero lateral (*sidecar-file*). Los lotes mezclan 27.196 fotogramas de exito con 6.276 fotogramas de fallo condicionado, pero con `gate_on=False` e `interception_delta=0`, es decir, el mecanismo de compuerta de fallos no estaba activo durante este entrenamiento. El lote efectivo fue de 64 y el pico de VRAM registrado de 4.455,0 MB.

Los unicos datos de entrenamiento publicados en la model card son los siguientes. No son resultados de evaluacion y no deben interpretarse como metricas de rendimiento:

| Metadato de entrenamiento | Valor |
|---|---|
| Lote efectivo | 64 |
| Pico de VRAM | 4.455,0 MB |
| Tiempo por paso | 59.440,3 ms |
| Fotogramas de exito | 27.196 |
| Fotogramas de fallo condicionado | 6.276 |
| `gate_on` | False |
| `interception_delta` | 0 |
| Estado declarado | validated-candidate-predicted ONLY, sin validacion fisica de 20 semillas |

## Capacidades

- Control robotico guiado por lenguaje: genera acciones motoras (chunks de accion) a partir de observaciones visuales y una instruccion en lenguaje natural.
- Comprension visual y linguistica heredada del backbone VLM, que actua como codificador de la observacion y de la tarea.
- Condicionamiento por contexto estructurado: acepta cadenas de tarea compuestas con `tool_id`, `se3_offset` y etiqueta de fallo, lo que permite especificar la herramienta y el desplazamiento relativo de la tarea en el propio prompt.
- Entrenamiento sobre datos mixtos de exito y fallo condicionado, lo que en principio le permite haberse expuesto a trayectorias fallidas etiquetadas (aunque la compuerta `gate_on` estaba desactivada).
- Ajuste eficiente mediante LoRA r=16 sobre el VLM, lo que facilita reentrenamientos incrementales con presupuesto de VRAM reducido.
- Soporte de *tool calling* / *function calling*: no disponible en la informacion proporcionada (es una politica de accion, no un modelo conversacional con API de herramientas).
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Capacidades especiales (thinking mode, vision, audio): vision si (es un VLA); thinking mode y audio no disponibles.
- Generacion de texto de proposito general, codigo y matematicas: no disponible; el modelo esta orientado a control y no se documenta como LLM de uso general.

## Casos de uso

- Manipulacion robotica en tareas tipo LIBERO: el modelo esta ajustado sobre `lerobot/libero`, por lo que el escenario natural es la ejecucion de tareas de manipulacion de objetos en entornos de simulacion con instrucciones en lenguaje natural. Es adecuado porque el condicionamiento de tarea incluye la herramienta y el desplazamiento SE(3) concretos.
- Investigacion en seguridad de VLA: el ecosistema AEGIS se centra en mejorar la fiabilidad y seguridad de VLA congelados (SmolVLA/SmolVLM2) sin reentrenamiento, mediante alineacion en tiempo de inferencia. Este checkpoint sirve como sujeto de prueba para medir si esas tecnicas de inferencia mejoran una politica ya ajustada.
- Reproduccion academica de fine-tunes con LoRA: el autor documenta la receta (LoRA r=16 en el VLM, experto de flujo completo, lote efectivo 64, pico de 4.455 MB), lo que permite a un laboratorio reproducir el ajuste en una GPU unica y comparar variantes.
- Experimentos de condicionamiento contextual: al componer `tool_id` + `se3_offset` + etiqueta de fallo en la cadena de tarea, se puede estudiar como el modelo responde a cambios de herramienta o de marco de referencia sin reentrenar.
- Entrenamiento con datos de fallo etiquetados: la mezcla de 6.276 fotogramas de fallo condicionado permite investigar si la exposicion a fallos etiquetados mejora la recuperacion, activando o desactivando la compuerta en futuras iteraciones.
- Punto de partida para un pipeline de reajuste iterativo: por su tamano (450M de parametros, 0,9 GB), es viable mantener varias versiones del checkpoint y comparar con el hermano `krishnah27/smolvla-aegis-ft-step587`.
- Prototipado en robotica de bajo coste: el modelo base SmolVLA se plantea explicitamente como una alternativa asequible y eficiente, por lo que este fine-tune encaja en montajes con GPU de gama media o incluso CPU para pruebas de integracion.
- Docencia y formacion: sirve como ejemplo completo y pequeno de fine-tune de un VLA con LoRA, con metadatos de entrenamiento publicados y sin los requisitos de hardware de los VLA de mayor tamano.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente incluye metadatos de entrenamiento (lote efectivo, VRAM pico, tiempo por paso y recuento de fotogramas), que se han recogido en la seccion de arquitectura y que no constituyen una evaluacion de rendimiento.

El autor indica de forma explicita que el estado del modelo es "validated-candidate-predicted ONLY", sin validacion fisica de 20 semillas, y que no se trata de un *champion*.

## Requisitos de hardware

- VRAM de inferencia estimada a partir del recuento de parametros (450.046.176), sin incluir el coste de activaciones ni del codificador visual: ~0,90 GB en FP16/BF16, ~0,45 GB en INT8 y ~0,23 GB en INT4. Son estimaciones aritmeticas, no mediciones publicadas por el autor.
- VRAM de entrenamiento documentada: pico de 4.455,0 MB (4,4 GB) con LoRA r=16 en el VLM, experto de flujo completo y lote efectivo de 64.
- Tiempo por paso documentado durante el entrenamiento: 59.440,3 ms (~59,4 s por paso).
- Cabe en GPU de consumo: muy probablemente si, dado que el entrenamiento cupo en 4,4 GB; no se especifica que GPU concreta se utilizo, por lo que no se puede confirmar el modelo exacto (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090, etc. son candidatas plausibles en funcion del backend).
- GPU recomendadas para entrenamiento o evaluacion a mayor escala: no disponible en la informacion proporcionada (no se documenta A100, H100 ni similares).
- Opciones de despliegue: el repositorio publica safetensors, lo que permite cargarlo con las librerias de LeRobot/Hugging Face. No se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI, y al tratarse de un modelo de accion (no de texto generativo) estas herramientas no son directamente aplicables.
- Latencia y throughput de inferencia: no disponible. El unico dato temporal publicado es el tiempo por paso de entrenamiento.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Dataset / base | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| krishnah27/smolvla-aegis-ft | 450.046.176 | no disponible | Fine-tune de `lerobot/smolvla_base` sobre `lerobot/libero` | no disponible | Publico en Hugging Face, 0 descargas |
| krishnah27/smolvla-aegis-ft-step587 | no disponible | no disponible | Checkpoint hermano del mismo autor (mismo linaje AEGIS SmolVLA) | no disponible | Publico en Hugging Face |
| lerobot/smolvla_base | no disponible en la informacion proporcionada | no disponible | Modelo base de SmolVLA | no disponible en la informacion proporcionada | Publico en Hugging Face |
| OpenVLA, pi0 u otros VLA de referencia | no disponible | no disponible | no disponible | no disponible | no disponible en la informacion proporcionada |

La informacion disponible no permite comparar rendimiento numerico con alternativas: no hay resultados de benchmarks publicados para este checkpoint ni para el modelo base en el material proporcionado. La unica comparacion verificable es de linaje (base y checkpoint hermano) y de tamano de parametros.

## Limitaciones y advertencias

- Estado de validacion incompleto: el autor declara explicitamente "validated-candidate-predicted ONLY", sin validacion fisica con 20 semillas y sin reclamar la condicion de *champion*.
- No es un modelo de lenguaje: es una politica VLA que produce acciones; no debe usarse para generacion de texto, codigo o matematicas.
- Compuerta de fallos desactivada: `gate_on=False` e `interception_delta=0` durante el entrenamiento, por lo que el mecanismo de filtrado de fallos no actuo.
- Ausencia de licencia declarada: la model card no especifica licencia, lo que impide determinar si el uso comercial esta permitido. Cualquier despliegue en produccion requiere aclarar este punto con el autor y revisar la licencia del modelo base.
- Idiomas no declarados: no se documenta que lenguas acepta como instruccion.
- Longitud de contexto no documentada: no disponible, lo que impide planificar tareas con historiales largos.
- Riesgo de alucinacion y de generalizacion limitada: al estar ajustado sobre `lerobot/libero`, el comportamiento fuera de la distribucion de ese dataset (otras morfologias de robot, otras camaras, otras tareas) no esta caracterizado.
- Sesgos: no disponible; no se documenta ningun analisis de sesgo.
- Trazabilidad escasa: 0 descargas y 0 *likes*, creado y actualizado el mismo dia (2026-09-27), sin pipeline declarado ni documentacion adicional mas alla del README.
- Metrica de entrenamiento llamativa: 59.440,3 ms por paso es un valor muy alto; conviene verificar la configuracion antes de reproducir el entrenamiento.
- Seguridad fisica: cualquier aplicacion sobre hardware real exige validacion propia, ya que la validacion fisica no se ha realizado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/krishnah27/smolvla-aegis-ft
- Checkpoint hermano: https://huggingface.co/krishnah27/smolvla-aegis-ft-step587
- Ficheros del checkpoint hermano: https://huggingface.co/krishnah27/smolvla-aegis-ft-step587/tree/main
- Paper de SmolVLA (arXiv:2506.01844): https://arxiv.org/abs/2506.01844
- Repositorio AEGIS (alineacion en tiempo de inferencia para VLA): https://github.com/lexus-x/AEGIS
- Repositorio Hii, resultado de busqueda relacionado con AEGIS ELITE (relevancia no confirmada): https://github.com/krishnarama286-coder/Hii
- Modelo base citado en la model card: `lerobot/smolvla_base`
- Dataset citado en la model card: `lerobot/libero`
