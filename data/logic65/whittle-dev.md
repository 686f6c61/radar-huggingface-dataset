# logic65/whittle-dev

## Resumen

`logic65/whittle-dev` es un repositorio de HuggingFace publicado por el usuario logic65 que no contiene un modelo listo para inferencia, sino una coleccion de checkpoints nocturnos de entrenamiento ("nightly training checkpoints") correspondientes a las ejecuciones de un proyecto denominado Whittle-Next sobre Google Colab. Segun la propia model card, los ficheros almacenan el estado del entrenador (`trainer state`) con los componentes etiquetados como HC, PLE, LoRA y gates, y no estan pensados para cargarse de forma autonoma. La carga prevista es mediante el script de entrenamiento, estableciendo la variable de entorno `RESUME_CKPT=`.

La relevancia de este repositorio es, por tanto, puramente operativa: sirve como almacen externo de puntos de reanudacion para runs de entrenamiento que se ejecutan en entornos efimeros como Colab. El repositorio distingue entre `colab1/latest.pt`, que se sobrescribe a medida que avanza el run, y `colab1/step<N>.pt`, que actua como hito cada 1000 pasos de entrenamiento. No se documenta la arquitectura del modelo subyacente, el numero de parametros, la longitud de contexto, los idiomas ni la licencia.

El repositorio no registra descargas ni "likes", fue creado y actualizado el 17 de septiembre de 2026 (mismo instante, lo que sugiere una subida automatizada) y su unico tag es `region:us`. La busqueda web realizada no ha devuelto ningun resultado relacionado con el proyecto Whittle-Next, por lo que no existe documentacion externa verificable sobre el mismo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (la model card menciona componentes internos etiquetados como HC, PLE, LoRA y gates, sin especificar la topologia del modelo) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (los ficheros son checkpoints de entrenamiento en `.pt`, no pesos cuantizados para inferencia) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | checkpoints de PyTorch (`.pt`) con estado del entrenador; no se publican pesos en safetensors ni GGUF |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura del modelo Whittle-Next. La model card unicamente indica que los checkpoints contienen "trainer state: HC/PLE/LoRA/gates". Estos terminos sugieren la presencia de adaptadores LoRA y de algun mecanismo de puertas (gating) como parte del estado guardado, pero la documentacion no aclara si forman parte de la arquitectura del modelo, de una estrategia de parametrizacion eficiente (PEFT) o de un esquema de enrutamiento. Cualquier afirmacion adicional sobre transformer, MoE, SSM o arquitecturas hibridas seria especulativa.

Tampoco se detallan los datos de entrenamiento: no hay informacion sobre el numero de tokens, la composicion del dataset, ni sobre si se aplicaron tecnicas de ajuste por preferencias como RLHF o DPO. Lo unico verificable es el regimen de entrenamiento: ejecuciones en Colab con guardado periodico cada 1000 pasos y un fichero `latest.pt` sobrescrito continuamente. La actualizacion del repositorio (17 de septiembre de 2026) coincide con la fecha de creacion, sin historial posterior visible.

## Capacidades

No es posible enumerar capacidades funcionales del modelo subyacente, ya que el repositorio no publica pesos cargables de forma autonoma ni documentacion sobre tareas soportadas. Lo que si puede afirmarse del artefacto publicado es lo siguiente:

- Almacenamiento y reanudacion de estado de entrenamiento: los ficheros `.pt` permiten reanudar un run interrumpido mediante `RESUME_CKPT=`.
- Versionado por hitos: los ficheros `step<N>.pt` permiten recuperar el estado exacto en multiplos de 1000 pasos.
- Persistencia de componentes de ajuste eficiente: el estado incluye elementos etiquetados como LoRA y gates, presumiblemente adaptadores y parametros de enrutamiento o compuertas.
- Generacion de texto, razonamiento, codigo, matematicas o vision: no disponible.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Capacidades especiales (modo pensamiento, vision, audio): no disponible.

## Casos de uso

- Reanudacion de entrenamientos interrumpidos en entornos efimeros: en una sesion de Colab que se corta por limite de tiempo o de GPU, el entrenador puede relanzarse con `RESUME_CKPT=colab1/latest.pt` y continuar desde el ultimo estado consistente en lugar de reiniciar el run.
- Recuperacion ante divergencia del entrenamiento: si la perdida diverge tras un determinado punto, los hitos `step<N>.pt` permiten volver a un estado anterior concreto (por ejemplo, el multiplo de 1000 inmediatamente anterior) y reajustar hiperparametros como la tasa de aprendizaje.
- Analisis de la progresion del entrenamiento: comparar checkpoints separados por miles de pasos permite estudiar la evolucion de los pesos, de los adaptadores LoRA y de los parametros de las compuertas a lo largo del run.
- Experimentos de ablacion sobre LoRA y gates: al conservar el estado de estos componentes, es posible cargar variantes y medir el efecto de congelar, reinicializar o escalar los adaptadores sin reentrenar desde cero.
- Migracion del entrenamiento a otra plataforma de computo: los `.pt` pueden descargarse de HuggingFace y reinyectarse en un cluster con GPUs de mayor memoria para continuar el run alli donde lo dejo Colab.
- Auditoria y trazabilidad de experimentos: mantener hitos periodicos en un repositorio remoto proporciona un registro reproducible de que estado exacto del modelo se uso en cada evaluacion intermedia, requisito habitual en flujos de investigacion.
- Comparticion de estados intermedios entre colaboradores: un colaborador que no disponga del entorno original puede descargar el checkpoint y cargarlo con la misma herramienta de entrenamiento para inspeccionar el estado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM para inferencia: no determinable. El repositorio no declara el numero de parametros ni la precision de los pesos, por lo que no es posible estimar el consumo de memoria. Como referencia general, un checkpoint de entrenamiento en `.pt` ocupa en disco aproximadamente el numero de parametros entrenables multiplicado por el tamano de cada tensor (4 bytes en fp32, 2 bytes en fp16/bf16), y su carga en memoria requiere ademas el estado del optimizador si se reanuda el entrenamiento.
- GPU recomendadas: no disponible. El unico indicio es el uso de Google Colab como entorno de ejecucion, lo que sugiere que el run cabe en las GPU que ofrece esa plataforma (tipicamente T4, L4 o A100, segun el plan contratado), pero no se especifica cual.
- Compatibilidad con GPU de consumo: no determinable sin conocer el tamano del modelo.
- Opciones de despliegue: este repositorio no es desplegable como modelo. No es compatible con vLLM, llama.cpp, Ollama ni TGI en su forma actual, ya que contiene estado de entrenador y debe cargarse con la herramienta de entrenamiento del proyecto Whittle-Next.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. Este repositorio no es un modelo publicado, sino un almacen de checkpoints de entrenamiento de un proyecto interno sin documentacion publica. No se han identificado alternativas comparables de la misma categoria (repositorios de estado de entrenador para runs de Whittle-Next) ni modelos de inferencia con los que establecer una comparacion en parametros, contexto, rendimiento o licencia.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| logic65/whittle-dev | no disponible | no disponible | no disponible | no disponible | checkpoints `.pt`, carga solo con el entrenador |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- No es un modelo utilizable directamente: la propia model card indica explicitamente que debe cargarse con el entrenador (`RESUME_CKPT=`) y no como modelo autonomo. Intentar cargarlo con librerias de inferencia convencionales fallara o producira resultados sin sentido.
- Ausencia total de documentacion tecnica: no se publican parametros, arquitectura, contexto, idiomas ni datos de entrenamiento, lo que impide evaluar el modelo subyacente.
- Licencia no declarada: al no especificarse licencia, no existe autorizacion explicita de uso comercial ni de redistribucion. Cualquier uso en produccion queda en un limbo legal.
- Riesgo de confusion entre artefactos: `latest.pt` se sobrescribe durante el run, por lo que un checkpoint descargado en un momento dado puede no corresponder a un estado reproducible ni documentado.
- Estados intermedios no evaluados: al tratarse de checkpoints nocturnos, es probable que correspondan a puntos del entrenamiento no convergidos. No hay garantia de calidad ni de coherencia de las salidas.
- Sesgos y alucinacion: no evaluables, al no existir informacion sobre los datos de entrenamiento ni evaluaciones publicadas.
- Fecha de creacion atipica: el repositorio figura creado y actualizado el 17 de septiembre de 2026, sin actividad posterior registrada, lo que sugiere un proyecto inactivo o de muy corta vida.
- Busqueda web sin resultados utiles: las consultas realizadas no han devuelto ninguna fuente relacionada con Whittle-Next, por lo que no hay verificacion independiente de ningun dato.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/logic65/whittle-dev
- Paper: no disponible
- Blog o documentacion del proyecto: no disponible
- Repositorio de codigo: no disponible
- Demos: no disponible
- Otros enlaces relevantes: no se han encontrado en la busqueda web
