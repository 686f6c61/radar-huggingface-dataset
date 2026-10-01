# Atomic-Germ/Hy-MT2-7B-NPU2

## Resumen

Hy-MT2-7B-NPU2 es una conversión cuantizada del modelo de lenguaje tencent/Hy-MT2-7B-FP8, publicada por el usuario Atomic-Germ. No se trata de un entrenamiento nuevo ni de un ajuste fino: es un port del modelo base al formato propietario Q4NX, compilado especificamente para el runtime OpenFlowLM (OFLM) y orientado a inferencia sobre NPU AMD XDNA. El repositorio ocupa 5,8 GB y el fichero de pesos principal (`model.q4nx`) pesa 5,35 GB.

La relevancia de esta publicacion es de infraestructura mas que de modelado: permite ejecutar un transformer denso de la familia Hunyuan (`hunyuan_v1_dense`) en hardware de aceleracion NPU en lugar de GPU, algo poco habitual porque la mayoria de cuantizaciones para consumo se distribuyen en GGUF. Aqui el formato es Q4NX, gestionado por el instalador `oflm-add`, y el autor advierte explicitamente de que no es un fichero GGUF.

La informacion publica disponible es muy limitada. La model card del repositorio remite a la del modelo base para cualquier detalle de capacidades, contexto o entrenamiento, y la busqueda web asociada no ha devuelto resultados tecnicos relevantes (los enlaces encontrados corresponden a una marca de esqui y a una cartera de criptomonedas ajenos al proyecto). En consecuencia, buena parte de las especificaciones se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | hunyuan_v1_dense (transformer denso) segun etiqueta del repositorio |
| Parametros totales | aproximadamente 7.000 millones (deducido de la denominacion "7B" del modelo base; no confirmado en la model card) |
| Parametros activos | no aplica (arquitectura densa, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4NX, con componentes declarados como Q8_0 / Q4_1 / BF16 en el fichero `model.q4nx` |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | `model.q4nx` (formato del runtime OpenFlowLM, no es GGUF) |

Otros datos del repositorio: modalidad declarada "language"; version de OFLM requerida 0.1.0; fecha de conversion 2026-10-01; ficheros adicionales `config.json`, `tokenizer.json`, `tokenizer_config.json` y `chat_template.jinja`; etiquetas `compressed-tensors`, `npu2`, `q4nx`, `oflm`, `openflowlm`, `region:us`.

## Arquitectura y entrenamiento

La arquitectura corresponde a la etiqueta `hunyuan_v1_dense`, es decir, un transformer denso (sin mezcla de expertos) de la familia Hunyuan de Tencent. Esta publicacion no introduce cambios arquitectonicos: es una conversion de pesos del modelo tencent/Hy-MT2-7B-FP8, que a su vez es la version en FP8 de tencent/Hy-MT2-7B. Por tanto, la innovacion tecnica del repositorio es exclusivamente la cuantizacion y el empaquetado para NPU mediante el formato Q4NX y el stack OpenFlowLM.

No hay informacion publica en la documentacion proporcionada sobre el numero de tokens de entrenamiento, la composicion del dataset, el uso de RLHF o DPO, ni sobre tecnicas de atencion o decodificacion. Tampoco se detalla la receta exacta de cuantizacion (que capas se mantienen en Q8_0, Q4_1 o BF16) ni el pipeline de conversion desde el GGUF intermedio `Hy-MT2-7B.Q8_0.gguf` que menciona la model card.

## Capacidades

- Generacion de texto en modalidad "language", con plantilla de chat incluida (`chat_template.jinja`) y tokenizador completo.
- Ejecucion de inferencia sobre NPU AMD XDNA mediante el runtime OpenFlowLM, no sobre GPU ni CPU convencional.
- Carga e instalacion mediante la herramienta `oflm-add`, que registra el modelo en el directorio de usuario de OpenFlowLM sin modificar la instalacion del sistema.
- Capacidades especificas del modelo base (traduccion, razonamiento, codigo, tool calling, agentes, multilingueismo): no disponibles en la informacion proporcionada. La nomenclatura "Hy-MT2" de la familia Hunyuan apunta a un posible enfoque en traduccion automatica, pero la model card no lo confirma.
- Modo de razonamiento explicito (thinking), vision o audio: no disponible.

## Casos de uso

- Inferencia local en equipos con NPU AMD XDNA: el modelo permite desplegar generacion de texto en portatiles o mini-PC con Ryzen AI sin depender de una GPU dedicada, usando el runtime OpenFlowLM.
- Traduccion automatica en el borde, si se confirma la especializacion del modelo base: al ejecutarse sobre NPU, permitiria traduccion de baja latencia sin enviar texto a servicios en la nube.
- Procesamiento de documentos confidenciales en local: el despliegue sobre hardware propio evita la salida de datos hacia APIs externas, relevante en entornos con requisitos de privacidad.
- Prototipado y evaluacion del stack OpenFlowLM: el repositorio sirve como caso de prueba para validar el pipeline `oflm-add` y la ejecucion de modelos cuantizados en formato Q4NX.
- Generacion asistida en aplicaciones de escritorio: integrable como backend de texto en editores o asistentes locales que ya utilicen la NPU para otras tareas.
- Experimentacion academica sobre cuantizacion: permite comparar la calidad del modelo base en FP8 frente a la version Q4NX en tareas controladas, siempre que se disponga del hardware adecuado.
- Despliegue en entornos sin GPU: alternativa para equipos donde el consumo energetico o la disponibilidad de tarjetas graficas es una restriccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Acelerador: NPU AMD XDNA (familia Ryzen AI). El repositorio esta compilado especificamente para este hardware; no esta pensado para GPU generica.
- Memoria: los pesos ocupan 5,35 GB, a los que hay que sumar el overhead del runtime y la cache de contexto. Se puede estimar un minimo practico en torno a 8 GB de memoria disponible en el dispositivo, aunque la cifra exacta no esta confirmada por el autor.
- GPU dedicada: no aplica; el formato Q4NX no es cargable por vLLM, TGI ni llama.cpp.
- Despliegue: exclusivamente mediante el runtime OpenFlowLM, con instalacion previa del paquete `oflm-add` (`pip install oflm-add` o `uv tool install oflm-add`) y ejecucion con `oflm run Hy-MT2-7B-NPU2`.
- Latencia y throughput: no disponibles.
- Compatibilidad con Ollama, llama.cpp, LM Studio: no disponible (el autor indica explicitamente que no es un fichero GGUF).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Runtime objetivo |
|---|---|---|---|---|---|
| Atomic-Germ/Hy-MT2-7B-NPU2 | ~7B denso | no disponible | Q4NX | apache-2.0 | OpenFlowLM sobre NPU AMD XDNA |
| tencent/Hy-MT2-7B-FP8 | ~7B denso | no disponible | safetensors (FP8) | apache-2.0 | GPU (vLLM, TGI u otros) |
| tencent/Hy-MT2-7B | ~7B denso | no disponible | safetensors (BF16) | apache-2.0 | GPU |

No se dispone de datos de rendimiento comparado entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- La model card no documenta sesgos, tasas de alucinacion ni evaluaciones de calidad; se desconoce el impacto real de la cuantizacion Q4NX sobre la fidelidad de las respuestas.
- La longitud de contexto, los idiomas soportados y las capacidades funcionales no estan confirmados en el repositorio; cualquier afirmacion al respecto seria especulativa.
- El modelo esta atado a un runtime concreto (OpenFlowLM 0.1.0) y a hardware AMD XDNA. No es portable a otros stacks de inferencia sin reconversion.
- El numero de descargas y de "likes" es cero y no hay historial de uso, por lo que no existe validacion comunitaria de su funcionamiento.
- Aunque la licencia declarada es apache-2.0, conviene verificar la licencia efectiva del modelo base tencent/Hy-MT2-7B antes de un uso comercial, ya que las condiciones del modelo original prevalecen.
- El repositorio no incluye informacion sobre el proceso de cuantizacion ni sobre posibles perdidas de precision por capa.
- La busqueda web asociada no aporto documentacion tecnica adicional, lo que dificulta auditar el proyecto.
- Uso en produccion: se recomienda validar primero con un conjunto de evaluacion propio, dado que no hay benchmarks publicados.

## Enlaces

- Repositorio del modelo: https://huggingface.co/Atomic-Germ/Hy-MT2-7B-NPU2
- Modelo base inmediato: https://huggingface.co/tencent/Hy-MT2-7B-FP8
- Modelo original: https://huggingface.co/tencent/Hy-MT2-7B
- Referencia arXiv citada en las etiquetas: https://arxiv.org/abs/2605.22064 (no se ha podido verificar su contenido en la informacion proporcionada)
- Herramienta de instalacion: paquete `oflm-add` (PyPI/uv); no se ha proporcionado una URL directa en la documentacion
- Nota sobre la busqueda web: los resultados obtenidos corresponden a una marca de esqui (atomic.com), a la entrada de Wikipedia sobre Atomic Austria GmbH, a la seccion de Decathlon y a Atomic Wallet; ninguno es relevante para este modelo.
