# fbaldassarri/tiiuae_Falcon3-7B-Instruct-auto_awq-int4-gs64-asym

## Resumen

Esta ficha describe `fbaldassarri/tiiuae_Falcon3-7B-Instruct-auto_awq-int4-gs64-asym`, una version cuantizada a INT4 del modelo instructivo `tiiuae/Falcon3-7B-Instruct` de TII (Technology Innovation Institute). No es un modelo entrenado desde cero: es un artefacto de cuantizacion post-entrenamiento (weight-only quantization, WoQ) generado por el usuario fbaldassarri con la herramienta Intel AutoRound v0.15.1, siguiendo el algoritmo AutoAWQ. El objetivo es reducir el peso en memoria y acelerar la inferencia entre 2 y 3 veces, a cambio de una perdida leve de precision declarada por el autor en la configuracion W4G64.

La cuantizacion usa 4 bits, group size 64 y esquema asimetrico (`sym: false`), con calibracion en CPU sobre 128 muestras, 200 iteraciones de tuning, secuencia de 512 tokens y batch de 4, partiendo de pesos en `torch.bfloat16`. El proceso completo duro 48.869,8 segundos (unas 13,6 horas) y se ejecuto en CPU. El autor indica que el artefacto esta pensado para inferencia en CPU Intel, iGPU Intel Arc mediante intel-extension-for-pytorch y NPU Intel (AI Boost en Core Ultra) via OpenVINO.

Es relevante para quien necesite ejecutar un modelo conversacional de la familia Falcon 3 en hardware Intel sin GPU dedicada, o para quien quiera reproducir una receta de cuantizacion AWQ con AutoRound. El repositorio tiene 0 descargas y 0 likes en el momento de redactar esta ficha, y no declara resultados de benchmarks. Los metadatos de safetensors indican 1.753.635.840 parametros, cifra que no cuadra con el "7B" del nombre ni con el modelo base; se detalla en la seccion de limitaciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Causal LM transformer (`model_type: llama` en la model card); heredada del modelo base Falcon3-7B-Instruct |
| Parametros totales | 1.753.635.840 segun metadatos de safetensors (discrepancia con el "7B" del nombre; ver limitaciones) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | INT4 (4 bits) AWQ / AutoAWQ, group size 64, asimetrica (`sym: false`), WoQ |
| Idiomas soportados | Ingles (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (formato de guardado `auto_awq`) |
| Herramienta de cuantizacion | Intel AutoRound v0.15.1 |
| Tamano del repositorio | 6,8 GB |
| Tipo de modelo | Instruct / chat (requiere plantilla de chat) |
| Modelo base | tiiuae/Falcon3-7B-Instruct |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El artefacto no implica entrenamiento nuevo: se trata de una cuantizacion solo de pesos (weights-only quantization) aplicada sobre `tiiuae/Falcon3-7B-Instruct`. La receta exacta registrada es AutoRound v0.15.1 con `bits=4`, `group_size=64`, `sym=False`, carga en `torch.bfloat16`, calibracion en `cpu`, `nsamples=128`, `iters=200`, `seqlen=512` y `batch_size=4`. El entorno de ejecucion declarado incluye transformers 4.55.3 y torch 2.14.0+cpu. No se documenta en la informacion disponible ni la composicion del dataset de preentrenamiento del modelo base, ni el numero de tokens, ni si hubo fases de RLHF, DPO o similar en Falcon3-7B-Instruct.

La innovacion tecnica aqui es el propio metodo de cuantizacion: AWQ con AutoRound busca minimizar el error de redondeo mediante tuning de los parametros de escala, y el modo asimetrico con group size 64 (W4G64) es un compromiso habitual entre tamano y fidelidad. El autor declara explicitamente "slight accuracy drop at W4G64", es decir, una degradacion leve asumida. La model card incluye una receta de replicacion en tres pasos (bootstrap del pipeline, ejecucion del runner y llamada standalone a `AutoRound`), lo que permite auditar y reproducir el proceso. El campo `inference: false` aparece en los metadatos de la model card aunque la seccion de uso muestra codigo de inferencia con transformers; es una inconsistencia de metadatos, no una funcionalidad ausente.

## Capacidades

- Generacion de texto conversacional e instructiva en ingles, usando la plantilla de chat del modelo base mediante `apply_chat_template`.
- Razonamiento general y respuesta a instrucciones: capacidades heredadas de Falcon3-7B-Instruct, no documentadas de forma independiente para esta version cuantizada.
- Generacion de codigo: no disponible en la informacion proporcionada (no se declaran benchmarks ni capacidades especificas).
- Matematicas: no disponible en la informacion proporcionada.
- Vision: no soportada (el modelo es exclusivamente de texto).
- Audio: no soportado.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Modo "thinking" explicito: no disponible en la informacion proporcionada.
- Capacidades multilingues: solo se declara ingles (`en`).
- Capacidad especial: ejecucion en CPU Intel, iGPU Intel Arc (via intel-extension-for-pytorch) y NPU Intel Core Ultra (via OpenVINO), segun el autor.

## Casos de uso

- Inferencia en portatiles y mini-PC con CPU Intel sin GPU dedicada: al ser una cuantizacion INT4 calibrada en CPU, el modelo puede ejecutarse con intel-extension-for-pytorch en equipos de oficina, reduciendo el peso de pesos a una fraccion del modelo en bfloat16.
- Aceleracion en NPU Intel Core Ultra: el autor indica compatibilidad con OpenVINO para la NPU AI Boost, lo que permite delegar la inferencia a un acelerador de bajo consumo en aplicaciones de escritorio.
- Asistentes conversacionales en ingles embebidos en producto: al ser un modelo instruct con plantilla de chat, encaja en interfaces de pregunta-respuesta de un solo turno o multi-turno corto, siempre que el presupuesto de memoria sea limitado.
- Prototipado rapido de aplicaciones LLM en CPU: sirve como sustituto economico del modelo base durante el desarrollo, antes de migrar a una version de mayor precision o a hardware GPU.
- Evaluacion comparativa de pipelines de cuantizacion: el repositorio documenta version de herramienta, hiperparametros, duracion y condiciones de calibracion, por lo que es util como referencia reproducible para equipos que investigan AWQ/AutoRound.
- Despliegue en servidores de CPU con requisitos de coste: en escenarios donde el throughput por vatio o el coste por token en CPU importan mas que la precision maxima, esta variante INT4 ofrece una alternativa al modelo en bf16.
- Experimentacion en investigacion academica: la propia model card indica que el modelo se ha desarrollado solo con fines de investigacion, lo que lo posiciona para entornos de laboratorio y no para produccion critica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo declara una mejora de velocidad de "2-3X" y una "slight accuracy drop" en W4G64, sin cifras concretas de MMLU, HumanEval, GSM8K ni de latencia o throughput medidos.

## Requisitos de hardware

- VRAM estimada: para un modelo de 7B en INT4 con group size 64, la huella de pesos ronda los 4-5 GB; a ello hay que sumar la cache KV, que depende de la longitud de contexto. Estimacion orientativa, no confirmada por el autor.
- Advertencia de tamano: los metadatos de safetensors reportan 1,75 mil millones de parametros, lo que no concuerda con el nombre "7B"; el repositorio ocupa 6,8 GB, coherente con un modelo de mayor tamano. Verificar antes de planificar hardware.
- GPU recomendadas (si se usa CUDA): no declaradas por el autor. Como referencia generica para INT4 de 7B, una GPU con 8 GB o mas de VRAM es suficiente para contextos moderados; 12-16 GB dan margen para contextos largos y batches mayores.
- Cabe en GPU de consumo: previsiblemente si en RTX 3060 12 GB, RTX 4060 Ti 16 GB o superiores. En GPUs de 8 GB el margen depende de la longitud de contexto. No confirmado por el autor.
- Hardware Intel objetivo declarado: CPU Intel, iGPU Intel Arc mediante intel-extension-for-pytorch, y NPU Intel (AI Boost, Core Ultra) mediante OpenVINO.
- Opciones de despliegue: transformers (receta oficial de la model card), text-generation-inference (etiqueta declarada) y vLLM o llama.cpp no estan confirmados; llama.cpp requeriria una conversion a GGUF que no se proporciona en el repositorio.
- Latencia y throughput: no disponibles. Solo se declara una mejora de 2-3 veces frente al modelo sin cuantizar.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (Falcon3-7B-Instruct AWQ INT4) | 7B nominal (1,75B segun safetensors, discrepante) | No disponible | INT4 AWQ, G64 asimetrica | Apache 2.0 | HuggingFace, 0 descargas |
| tiiuae/Falcon3-7B-Instruct | 7B | No disponible en la informacion proporcionada | bfloat16 (sin cuantizar) | Apache 2.0 | HuggingFace (modelo base oficial) |
| Otras cuantizaciones INT4 de Falcon3-7B-Instruct | 7B | No disponible | AWQ, GPTQ, GGUF (segun autor) | Apache 2.0 | HuggingFace (comunidad) |
| Qwen2.5-7B-Instruct (INT4 AWQ) | 7B | No disponible en la informacion proporcionada | INT4 AWQ | Apache 2.0 | HuggingFace (oficial) |

No se dispone de datos de rendimiento comparados para ninguna de las alternativas dentro de la informacion proporcionada; la comparacion se limita a parametros, licencia y formato de distribucion.

## Limitaciones y advertencias

- Perdida de precision por cuantizacion: el propio autor reconoce una "slight accuracy drop" en W4G64. No se cuantifica cuanto, ni en que tareas.
- Discrepancia de parametros: los metadatos de safetensors indican 1.753.635.840 parametros, mientras el nombre del repositorio y el modelo base apuntan a 7B. Es un dato que debe verificarse antes de usarlo en planificacion de capacidad.
- Idioma: solo se declara ingles. Un uso en castellano no esta soportado ni evaluado.
- Riesgo de alucinacion: inherente a los modelos generativos; no hay evaluaciones de fidelidad publicadas para esta variante.
- Sesgos: no disponibles en la informacion proporcionada. No se documenta ningun analisis de sesgo para el modelo base ni para la version cuantizada.
- Licencia: Apache 2.0, permisiva para uso comercial. El autor anade un descargo de responsabilidad que indica que el modelo se ha desarrollado "only for research purposes" y se entrega "with no warranty", lo que puede entrar en tension con un despliegue comercial.
- Metadatos inconsistentes: la model card declara `inference: false` a la vez que documenta codigo de inferencia, lo que puede confundir a herramientas de descubrimiento automatico.
- Enlaces de replicacion a un dominio de terceros: la receta apunta a `git.epicdynamic.com/auto-round-pipeline`, un origen no verificado y no equivalente al repositorio oficial de Intel. Ejecutar scripts de `setup.sh` de ese origen implica un riesgo de cadena de suministro; se recomienda comparar con `github.com/intel/auto-round`.
- Madurez del artefacto: 0 descargas y 0 likes, sin benchmarks publicados y sin validacion independiente. No recomendado para produccion sin una evaluacion propia.
- Búsqueda web: los resultados obtenidos en la busqueda no contienen informacion tecnica relacionada con este modelo (contenido irrelevante y no fiable), por lo que no se ha podido contrastar ningun dato externo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/fbaldassarri/tiiuae_Falcon3-7B-Instruct-auto_awq-int4-gs64-asym
- Modelo base: https://huggingface.co/tiiuae/Falcon3-7B-Instruct
- Intel AutoRound (repositorio oficial): https://github.com/intel/auto-round
- Pipeline de replicacion citado en la model card (origen de terceros, no verificado): https://git.epicdynamic.com/auto-round-pipeline
- Licencia Apache 2.0: https://choosealicense.com/licenses/apache-2.0/
- Resultados de busqueda web: no se han encontrado enlaces tecnicos relevantes; los resultados devueltos no guardan relacion con el modelo.
