# camilablank/qwen3.6-27b-multilayer-nla-rl600

## Resumen

Qwen3.6-27B multi-layer NLA, RL step 600, es un artefacto de interpretabilidad publicado por el usuario camilablank sobre el modelo base Qwen/Qwen3.6-27B. No es un modelo de lenguaje de propósito general: es un autoencoder en lenguaje natural (NLA, natural-language autoencoder) disenado para verbalizar y reconstruir activaciones residuales del modelo base en 11 capas concretas (plan 20:61:4, es decir, de la capa 20 a la 61 con paso 4) tomadas en las salidas de bloque del ultimo token real. El objetivo es traducir estados internos (vectores de activacion) a texto legible y, a la inversa, reconstruir el vector original a partir de esa descripcion, lo que permite auditar y monitorizar el comportamiento interno de un transformer de 27B parametros.

El repositorio contiene dos componentes: un verbalizador de activaciones (AV, `av/`), que es un adaptador LoRA sobre Qwen3.6-27B entrenado con RL hasta el paso 600 y que inyecta la activacion en el token `㈜`, y un reconstructor de activaciones (AR, `ar/`), que actua como critico coentrenado y consiste en un modelo completo mas una cabeza lineal compartida (`value_head.safetensors`) que predice la activacion de la capa etiquetada a partir del estado oculto final. Se incluye tambien un adaptador de referencia SFT (`av/reference/`) empleado para el termino KL del entrenamiento.

El modelo es relevante por su enfoque metodologico: aplica RL sobre un esquema de autoencoder en lenguaje natural con etiquetado de capa estilo O-lens, y reporta resultados internos en un macro de WorkspaceBench de 0,754 para la rejilla de 11 capas, frente a 0,768 de O-lens, y 0,473 para una sola capa en L44. Su publicacion es muy reciente (12 de octubre de 2026) y, en el momento de redactar esta ficha, no acumula descargas ni interacciones, ademas de no declarar licencia ni idiomas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Autoencoder en lenguaje natural (NLA) sobre transformer: AV = adaptador LoRA sobre Qwen3.6-27B; AR = modelo completo con cabeza lineal (`value_head.safetensors`) |
| Parametros totales | AR: modelo completo del orden de 27B parametros mas cabeza lineal; AV: adaptador LoRA sobre un modelo de 27B (cifra exacta no disponible) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No se documentan cuantizaciones; pesos distribuidos en safetensors (presumiblemente bf16/fp16, no confirmado) |
| Idiomas soportados | No disponible |
| Licencia | No disponible (no declarada en la model card; sujeta a las condiciones del modelo base) |
| Formato de pesos | safetensors (adaptadores LoRA y `value_head.safetensors`) |

Otros datos: tamano del repositorio 56,5 GB; capas objetivo 20:61:4 (11 capas); token de inyeccion `㈜`; fecha de creacion 2026-10-12; pipeline no disponible.

## Arquitectura y entrenamiento

El componente AV es un adaptador LoRA sobre Qwen/Qwen3.6-27B que recibe, en el token especial `㈜`, la activacion residual de una capa concreta del modelo base. La plantilla de prompt indica cual es la capa de origen, de modo que el mismo adaptador puede verbalizar cualquiera de las 11 capas del plan 20:61:4. Las activaciones se toman en las salidas de bloque del ultimo token real, lo que las hace comparables entre capas y reproducible el punto de extraccion. El adaptador se entreno con RL hasta el paso 600, con un adaptador de referencia obtenido por SFT (`av/reference/`) que se usa para calcular el termino KL y mantener la verbalizacion cerca de la distribucion de referencia.

El componente AR es el critico coentrenado durante el mismo proceso de RL y se guarda tambien en el paso 600. Consta de un modelo completo mas `value_head.safetensors`, una cabeza lineal compartida que predice la activacion de la capa etiquetada a partir del estado oculto final; esta cabeza es la que cierra el bucle de reconstruccion y permite medir el error de reconstruccion (FVE). El entrenamiento se realizo con EasyNLA (un fork para Qwen3.6) y emplea un etiquetado de capa estilo O-lens. Los metadatos de dataset, capa, token y prompts, asi como la configuracion de RL, estan en `nla_meta.yaml` y `run_config.yaml`.

## Capacidades

- Verbalizacion de activaciones residuales: transforma el vector de activacion de una capa concreta (11 capas del plan 20:61:4) en una descripcion en lenguaje natural.
- Reconstruccion de activaciones: el AR predice la activacion de la capa etiquetada desde el estado oculto final, con un FVE con AR congelado de aproximadamente el 68%.
- Etiquetado explicito de capa: el prompt nombra la capa de origen mediante plantillas definidas en `nla_meta.yaml`, lo que permite consultas dirigidas por capa.
- Cobertura multicapa: un unico adaptador AV cubre 11 capas, frente a esquemas de una sola capa.
- Uso como herramienta de diagnostico interno: inspeccion de representaciones, comparacion entre capas y deteccion de diferencias de representacion.
- No se documentan capacidades de generacion abierta, razonamiento general, codigo, matematicas, vision, audio, tool calling ni uso como agente en la informacion proporcionada.

## Casos de uso

- Investigacion en interpretabilidad mecanicista: obtener descripciones legibles de las activaciones de 11 capas permite estudiar que informacion aparece en cada profundidad del transformer y como evoluciona entre la capa 20 y la 60.
- Monitorizacion de representaciones en produccion: el AR, al predecir la activacion desde el estado final, puede usarse como sonda para detectar desviaciones de la distribucion esperada en un despliegue de Qwen3.6-27B.
- Auditoria de seguridad de modelos: verbalizar activaciones en capas profundas ayuda a inspeccionar si el modelo esta representando internamente contenido sensible antes de generar la respuesta.
- Analisis comparativo de metodos NLA: los valores publicados (0,754 en la rejilla de 11 capas frente a 0,768 de O-lens y 0,473 en L44) permiten reproducir y comparar variantes de entrenamiento NLA con y sin RL.
- Desarrollo de sondas para deteccion de alucinacion: entrenar clasificadores sobre las reconstrucciones del AR para anticipar respuestas no fundamentadas antes de que se emitan.
- Estudio de circuitos a nivel de capa: al mantener fijo el punto de extraccion (salidas de bloque del ultimo token real), se pueden aislar cambios atribuibles a una capa concreta en experimentos controlados.
- Investigacion en RL aplicado a autoencoders linguisticos: el par AV/AR con adaptador de referencia SFT documenta una receta reproducible (termino KL, paso 600) para explorar objetivos de reconstruccion frente a fluidez.
- Docencia y divulgacion tecnica: el material de configuracion (`nla_meta.yaml`, `run_config.yaml`) sirve como ejemplo de pipeline completo de extraccion, verbalizacion y reconstruccion de activaciones.

## Benchmarks y rendimiento

Resultados internos reportados por el autor (evaluacion propia, no replicada de forma independiente):

| Evaluacion | Resultado |
|---|---|
| WorkspaceBench macro, rejilla de plan de 11 capas | 0,754 |
| O-lens (referencia) | 0,768 |
| Una sola capa, L44 | 0,473 |
| NLA-RL de una sola capa en L42 (referencia) | 0,489 |
| FVE con AR congelado | ~68% |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, ni tienen sentido directo para un artefacto de interpretabilidad como este. No se dispone de datos de latencia ni de throughput.

## Requisitos de hardware

- El repositorio ocupa 56,5 GB, consistente con pesos en precision de 16 bits de un modelo del orden de 27B mas adaptadores y cabeza; se requiere espacio en disco y en memoria acorde.
- Inferencia del AR (modelo completo): VRAM estimada en torno a 54-60 GB en bf16/fp16, es decir, una A100 80 GB, H100 80 GB o un nodo multi-GPU.
- Inferencia del AV: el LoRA puede aplicarse sobre el modelo base; la VRAM depende de la precision del base. En 4 bits cabria en GPUs de 24 GB (RTX 4090, A6000 48 GB en 8 bits), aunque no hay cifras oficiales.
- No cabe, con los datos disponibles, en GPUs de consumo de 8-16 GB en precision completa.
- Opciones de despliegue: al tratarse de artefactos de investigacion con safetensors y adaptadores LoRA, las opciones naturales son transformers con PEFT, vLLM o TGI para el AR; llama.cpp/Ollama solo serian viables si se generan cuantizaciones GGUF, que no se distribuyen en el repositorio.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No se dispone de especificaciones publicadas de modelos comparables en la informacion proporcionada. La unica comparacion disponible es contra las referencias citadas por el autor en su propia evaluacion:

| Referencia | Enfoque | Resultado en la misma evaluacion | Licencia |
|---|---|---|---|
| Este modelo (multi-layer NLA, RL 600) | NLA multicapa con RL, 11 capas | 0,754 (rejilla de 11 capas) | No disponible |
| O-lens | Referencia de etiquetado por capa | 0,768 | No disponible |
| NLA-RL de una sola capa en L42 | NLA de una capa con RL | 0,489 | No disponible |
| Este modelo, capa unica L44 | NLA de una capa | 0,473 | No disponible |

No se dispone de comparativas con modelos de interpretabilidad alternativos (por ejemplo, autoencoders dispersos) en la informacion proporcionada.

## Limitaciones y advertencias

- Los resultados son internos y declarados por el autor; no se ha publicado una evaluacion independiente que los reproduzca.
- No se declara licencia en la model card, por lo que no puede asumirse uso comercial sin aclaracion previa; ademas, las condiciones del modelo base Qwen/Qwen3.6-27B no se detallan en la informacion disponible.
- No se declaran idiomas soportados; el comportamiento del verbalizador fuera del idioma de entrenamiento es desconocido.
- No se especifica la longitud de contexto, ni del modelo base ni de los adaptadores.
- El repositorio tiene 0 descargas y 0 likes y se creo el 12 de octubre de 2026, con ultima actualizacion el mismo dia: no hay evidencia de uso, validacion comunitaria ni mantenimiento.
- Es un artefacto de investigacion, no un modelo de proposito general: no debe emplearse como asistente conversacional ni como generador de codigo.
- El FVE del 68% con AR congelado implica que aproximadamente un tercio de la varianza de la activacion no se reconstruye, lo que limita la fidelidad de las reconstrucciones.
- El rendimiento en la rejilla multicapa (0,754) queda por debajo de la referencia O-lens (0,768), y el rendimiento por capa individual (0,473 en L44) esta proximo a la referencia de una sola capa (0,489), por lo que la ganancia no es uniforme.
- Riesgo de alucinacion en las verbalizaciones: al ser texto generado sobre un estado interno, el AV puede producir descripciones plausibles que no correspondan fielmente a la activacion subyacente.
- Dependencia de un token especial de inyeccion (`㈜`) y de plantillas de prompt concretas: alterar el formato invalida el comportamiento esperado.
- No hay garantia de que el modelo base Qwen/Qwen3.6-27B este disponible publicamente ni de que sus pesos coincidan con los usados en el entrenamiento.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/camilablank/qwen3.6-27b-multilayer-nla-rl600
- Modelo base referenciado: https://huggingface.co/Qwen/Qwen3.6-27B
- Archivos de configuracion y metadatos incluidos en el repositorio: `nla_meta.yaml`, `run_config.yaml`, `av/reference/`, `ar/value_head.safetensors`
- Paper, blog, repositorio de codigo, demo o documentacion adicional: no disponible

Nota: la busqueda web realizada solo devolvio paginas generales sobre ChatGPT (chatgpt.com, openai.com, Wikipedia), sin ninguna relacion con este modelo, por lo que no se incluyen como enlaces relevantes.
