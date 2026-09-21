# krishnah27/smolvla-pusht-piq

## Resumen

`krishnah27/smolvla-pusht-piq` es un adaptador LoRA publicado en HuggingFace sobre el modelo base `HuggingFaceTB/SmolLM2-135M-Instruct`. Se distribuye con la libreria PEFT (version declarada 0.19.1) y el repositorio ocupa 1,7 GB, un tamano notablemente superior al que cabria esperar de un adaptador de bajo rango sobre un modelo de 135 millones de parametros. El autor es el usuario `krishnah27` y el repositorio acumula 15 descargas y 0 likes en el momento de la consulta.

La model card es la plantilla generica de HuggingFace sin rellenar: todos los campos de descripcion, datos de entrenamiento, evaluacion, licencia e idiomas aparecen como `[More Information Needed]`. La unica informacion tecnica verificable proviene de las etiquetas del repositorio (`peft`, `safetensors`, `fastvla`, `lora`, `transformers`, `text-generation`, `conversational`) y del campo `base_model`.

El nombre del repositorio sugiere un experimento relacionado con tareas de robotica tipo PushT y con la familia de modelos vision-language-action (VLA), pero la configuracion declarada es exclusivamente de generacion de texto y el modelo base es un LLM de texto sin capacidades de vision ni de accion. Esta incoherencia, junto con la ausencia total de documentacion, hace que la ficha deba tratarse como un artefacto experimental de trazabilidad limitada y no como un modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada del modelo base SmolLM2-135M-Instruct); adaptacion mediante LoRA sobre pesos congelados |
| Parametros totales | 135 millones en el modelo base; el adaptador anade un numero de parametros entrenables no documentado (no disponible) |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no disponible en el repositorio del adaptador; el modelo base SmolLM2-135M-Instruct soporta 8.192 tokens segun su documentacion |
| Tipos de cuantizacion | no disponible (el repositorio publica pesos en safetensors correspondientes al adaptador PEFT; no se distribuyen cuantizaciones propias) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (la model card no declara licencia; el modelo base SmolLM2 se publica bajo Apache 2.0, pero eso no determina la licencia del adaptador) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); se necesita el modelo base para poder cargarlo |
| Tamano del repositorio | 1,7 GB |
| Libreria | peft 0.19.1 (compatible con transformers) |
| Pipeline declarado | text-generation |
| Fecha de creacion | 2026-09-21 |
| Fecha de ultima actualizacion | 2026-09-21 |

## Arquitectura y entrenamiento

No se dispone de informacion sobre el procedimiento de entrenamiento. La model card incluye los apartados de datos de entrenamiento, preprocesado, hiperparametros y regimen de precision, pero todos ellos estan sin rellenar. No se documenta el rango LoRA, el parametro alpha, los modulos objetivo, la tasa de aprendizaje, el numero de pasos ni el dataset utilizado. Tampoco se indica si hubo una fase de ajuste por preferencias (RLHF, DPO u otra) despues del entrenamiento supervisado.

Arquitectonicamente, el adaptador hereda la estructura del modelo base: un transformer decoder-only de 135 millones de parametros, con atencion causal estandar, disenado para generacion de texto. El entrenamiento del modelo base SmolLM2 (familia de HuggingFaceTB) se realizo sobre un corpus multietapa de gran volumen de tokens, con tecnicas de destilacion de logits en las variantes pequenas, pero estos datos corresponden al modelo base y no al adaptador aqui descrito. La etiqueta `fastvla` sugiere alguna relacion con la familia de modelos VLA, aunque no hay ninguna evidencia en el repositorio que respalde esa conexion mas alla de la etiqueta.

## Capacidades

- Generacion de texto conversacional en formato instruct, heredada del modelo base SmolLM2-135M-Instruct.
- Capacidad muy limitada de razonamiento y de conocimiento factual, coherente con un modelo de 135 millones de parametros.
- No se ha documentado soporte de tool calling ni de function calling.
- No se ha documentado soporte de agentes ni de razonamiento multi-paso.
- Idiomas soportados sin especificar; el modelo base esta entrenado principalmente en ingles, por lo que el rendimiento en castellano es previsiblemente bajo, aunque no esta medido.
- No se ha documentado ningun modo especial (thinking mode, vision, audio, accion robotica), a pesar de que el nombre del repositorio alude a un entorno de robotica (PushT).
- La unica capacidad confirmada por la configuracion del repositorio es la generacion de texto con pesos PEFT cargables mediante `transformers`.

## Casos de uso

- Reproduccion de experimentos de investigacion: el adaptador puede cargarse con `transformers` y `peft` para inspeccionar como un ajuste LoRA modifica el comportamiento de un modelo base de 135 millones de parametros en tareas controladas de laboratorio.
- Clasificacion y etiquetado de texto en lote: un modelo de este tamano es adecuado para tareas de discriminacion simple (categoria, sentimiento, intencion) cuando se ejecuta en CPU y se procesan grandes volumenes de documentos, siempre que se valide exhaustivamente la salida.
- Extraccion de campos estructurados: con prompts muy acotados y esquemas fijos, puede emplearse para extraer entidades o campos de documentos cortos en entornos de baja exigencia, con verificacion posterior obligatoria.
- Asistente embebido sin conexion: sus aproximadamente 70-270 MB de pesos permiten desplegarlo en dispositivos con recursos muy limitados (Raspberry Pi, moviles, navegador mediante WebGPU o WASM) para tareas de autocompletado o respuesta corta.
- Generacion de datos sinteticos de bajo coste: puede utilizarse como generador de borradores o de datos aumentados para tareas auxiliares, filtrando despues con un modelo mayor o con reglas deterministas.
- Decodificacion especulativa experimental: por su tamano, puede actuar como modelo borrador en un esquema especulativo junto a un modelo de mayor capacidad, siempre que se verifique compatibilidad de tokenizador y mejora real de latencia.
- Educacion y docencia: sirve como ejemplo didactico de ajuste fino eficiente (LoRA/PEFT) sobre un modelo pequeno, con un coste de entrenamiento accesible en hardware de consumo.
- Pruebas de humo de infraestructura: util para validar pipelines de despliegue (vLLM, TGI, transformers) y mecanismos de carga de adaptadores antes de escalar a modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye ninguna tabla de evaluacion y los resultados de la busqueda web no aportan datos sobre este modelo.

## Requisitos de hardware

- VRAM estimada para el modelo base de 135 millones de parametros: aproximadamente 540 MB en fp32, 270 MB en fp16/bf16, 135 MB en int8 y 70-80 MB en int4. A esta cifra hay que sumar la memoria del adaptador LoRA, que es pequena (tipicamente decenas de MB) y los estados de activacion durante la inferencia.
- Cabe con holgura en cualquier GPU de consumo: RTX 3060, RTX 4060, RTX 4090 y tambien en GPUs integradas y CPU. No requiere A100 ni H100.
- Despliegue en CPU: completamente viable en un solo hilo o con pocos hilos, lo que lo hace apto para entornos sin acelerador.
- Opciones de despliegue: `transformers` con `peft` para cargar el adaptador; vLLM y TGI admiten adaptadores LoRA; llama.cpp y Ollama requieren convertir el modelo combinado a GGUF; tambien es posible fusionar el adaptador con los pesos base y exportar a otros formatos.
- Latencia y throughput: no se han publicado mediciones para este adaptador. Cualquier cifra concreta dependeria del hardware, del backend y de la longitud de secuencia, y no puede estimarse a partir de la informacion disponible.
- Nota sobre el tamano: el repositorio ocupa 1,7 GB, muy por encima del peso esperado de los pesos de un modelo de 135 millones de parametros mas un adaptador LoRA. Es probable que contenga artefactos adicionales (checkpoints intermedios, estados de optimizador o copias redundantes) que conviene inspeccionar antes de descargarlo.
- Framework minimo declarado: PEFT 0.19.1.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia declarada | Disponibilidad |
|---|---|---|---|---|---|
| krishnah27/smolvla-pusht-piq | 135 M (base) + adaptador LoRA | no disponible (base: 8.192 tokens) | Adaptador LoRA sobre LLM denso | no disponible | HuggingFace, 15 descargas, 0 likes |
| HuggingFaceTB/SmolLM2-135M-Instruct | 135 M | 8.192 tokens | LLM denso instruct | Apache 2.0 segun su model card | Ampliamente disponible y documentado |
| HuggingFaceTB/SmolLM2-360M-Instruct | 360 M | 8.192 tokens | LLM denso instruct | Apache 2.0 segun su model card | Ampliamente disponible y documentado |
| Qwen/Qwen2.5-0.5B-Instruct | 0,49 B | 32.768 tokens | LLM denso instruct | Apache 2.0 segun su model card | Ampliamente disponible y documentado |

No se dispone de datos de rendimiento comparativo para el adaptador, por lo que la comparacion se limita a parametros, contexto, licencia y disponibilidad. La diferencia principal frente a las alternativas es la ausencia de documentacion, licencia y evaluacion; en terminos de rendimiento esperado, un adaptador LoRA sobre un modelo de 135 millones de parametros no deberia superar a alternativas mayores y mejor documentadas como SmolLM2-360M-Instruct o Qwen2.5-0.5B-Instruct, aunque esto no se ha verificado con mediciones.

## Limitaciones y advertencias

- Model card sin contenido: no hay informacion sobre datos de entrenamiento, evaluacion, sesgos ni uso previsto, lo que impide auditar el ajuste.
- Licencia no declarada: sin licencia explicita no se puede asumir permiso de uso comercial. La licencia Apache 2.0 del modelo base no se extiende automaticamente al adaptador.
- Riesgo elevado de alucinacion: con 135 millones de parametros, el modelo tiene una capacidad muy limitada de conocimiento factual y de razonamiento; no debe usarse para responder preguntas de dominio sin verificacion externa.
- Sesgos desconocidos: al no documentarse los datos de ajuste, no se puede evaluar que sesgos se han introducido o amplificado respecto al modelo base.
- Cobertura idiomatica indeterminada: no se declaran idiomas soportados. El modelo base esta centrado en ingles; el rendimiento en castellano es probablemente pobre y no esta medido.
- Ambiguedad de proposito: el nombre del repositorio alude a PushT y a modelos VLA (robotica), mientras que la configuracion declarada es de generacion de texto sin vision ni accion. Cualquier uso en robotica deberia verificarse directamente contra los artefactos del repositorio.
- Ventana de contexto efectiva no verificada: aunque el modelo base soporta 8.192 tokens, no hay confirmacion de que el adaptador mantenga ese comportamiento.
- Trazabilidad y mantenimiento: repositorio creado y actualizado el mismo dia, 0 likes, 15 descargas y sin autor identificable ni contacto. No hay garantia de mantenimiento ni de soporte.
- Idoneidad para produccion: limitada. Se recomienda tratarlo como artefacto experimental y no como componente critico sin una evaluacion propia previa.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/krishnah27/smolvla-pusht-piq
- Modelo base: https://huggingface.co/HuggingFaceTB/SmolLM2-135M-Instruct
- Repositorio de PEFT: https://github.com/huggingface/peft
- Articulo citado en la plantilla de la model card (Lacoste et al., 2019, sobre impacto ambiental): https://arxiv.org/abs/1910.09700
- Calculadora de impacto ambiental referenciada en la model card: https://mlco2.github.io/impact
- La busqueda web realizada no devolvio ningun enlace relevante sobre este modelo; los resultados obtenidos correspondian a contenido no relacionado (normativa italiana sobre creditos fiscales de bienes instrumentales).
