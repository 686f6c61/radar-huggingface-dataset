# fbaldassarri/tiiuae_Falcon3-7B-Instruct-auto_gptq-int4-gs64-sym

## Resumen

Esta ficha describe `fbaldassarri/tiiuae_Falcon3-7B-Instruct-auto_gptq-int4-gs64-sym`, una version cuantizada a 4 bits del modelo instructivo Falcon3-7B-Instruct desarrollado por TII (Technology Innovation Institute). La cuantizacion la firma el usuario fbaldassarri y se ha generado con Intel AutoRound v0.15.1, empleando el algoritmo GPTQ (AutoGPTQ) en modo weights-only quantization, con 4 bits, tamano de grupo 64 y esquema simetrico (W4G64). El resultado es un artefacto orientado a inferencia con menor huella de memoria y, segun el autor, entre 2 y 3 veces mas rapido que la version en bf16, a cambio de una ligera perdida de precision.

El interes practico del repositorio es doble. Por un lado, ofrece el modelo base en un formato INT4 autocontenido (safetensors con configuracion `auto_gptq`) cargable directamente con `transformers`, lo que simplifica su despliegue en GPUs de gama media. Por otro, el autor ha documentado explicitamente el proceso de cuantizacion (version de auto-round, numero de muestras de calibracion, iteraciones, secuencia, lote y duracion total), lo que permite reproducir el artefacto de forma trazable, algo poco habitual en cuantizaciones de terceros.

Se trata de un modelo denso de tipo causal LM, con `model_type: llama` en la configuracion del repositorio, especializado en generacion de texto conversacional y declarado unicamente para ingles. La model card no especifica la longitud de contexto soportada ni los datos de entrenamiento del modelo base, y no se han publicado resultados de benchmarks asociados a esta version cuantizada.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only causal LM (`model_type: llama` segun la configuracion del repositorio) |
| Parametros totales | 1.754.797.056 segun los safetensors del repositorio; el modelo base se distribuye comercialmente como 7B (ver advertencias sobre esta discrepancia) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT4 (4 bits), GPTQ/AutoGPTQ, group_size 64, simetrica (W4G64) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors con configuracion de cuantizacion `auto_gptq` |
| Desarrollador de la cuantizacion | fbaldassarri |
| Modelo base | tiiuae/Falcon3-7B-Instruct |
| Framework de cuantizacion | Intel AutoRound 0.15.1 (algoritmo AutoGPTQ) |
| Tamano del repositorio | 6,8 GB |
| Precision de calibracion | torch.bfloat16 |
| `torch_dtype` de carga | torch.bfloat16 |
| Fecha de creacion del repositorio | 2026-10-10 |

## Arquitectura y entrenamiento

La model card de esta version cuantizada no documenta la arquitectura interna ni los datos de entrenamiento del modelo base Falcon3-7B-Instruct: no hay informacion sobre numero de tokens, composicion del dataset ni si se aplicaron tecnicas de alineacion como RLHF o DPO. Lo unico que revela el repositorio es que la configuracion declara `model_type: llama`, es decir, una arquitectura transformer decoder-only de tipo causal, coherente con la generacion de texto autorregresiva. Cualquier afirmacion sobre atencion agrupada, RoPE, normalizacion o presupuesto de contexto debe consultarse en la ficha del modelo base, no en este repositorio.

La innovacion documentada esta en la fase de cuantizacion. Se utilizo Intel AutoRound 0.15.1 en un proceso de weights-only quantization ejecutado integramente en CPU, con `torch.bfloat16` como tipo de carga y 128 muestras de calibracion de 512 tokens procesadas en lotes de 4 durante 200 iteraciones de ajuste. La ejecucion completa duro 48.229,9 segundos (803,8 minutos) y finalizo el 2026-09-28. El entorno registrado incluye transformers 4.55.3 y torch 2.14.0+cpu. El autor indica que el artefacto esta pensado para inferencia en CPU Intel, iGPU Intel Arc (mediante intel-extension-for-pytorch) y NPU Intel AI Boost de la serie Core Ultra (mediante OpenVINO), ademas del uso convencional en GPU.

## Capacidades

- Generacion de texto autorregresiva y conversacional, con plantilla de chat integrada; la model card insiste en usar `apply_chat_template` en lugar de prompts en texto plano.
- Ajuste instructivo: el modelo base es una variante Instruct, por lo que esta optimizado para seguir instrucciones y mantener dialogos multi-turno.
- Generacion de codigo y resolucion de problemas matematicos: no documentado explicitamente en la informacion proporcionada; depende de las capacidades del modelo base.
- Tool calling / function calling: no documentado.
- Uso como agente y razonamiento multi-paso: no documentado.
- Capacidades multilingues: limitadas al ingles segun el campo `language: en` del repositorio.
- Vision, audio u otras modalidades: no soportadas; el pipeline declarado es exclusivamente `text-generation`.
- Capacidades especiales (modo thinking, decodificacion especulativa): no documentadas.
- Inferencia en hardware Intel: soporte declarado para CPU Intel, iGPU Arc y NPU Core Ultra.

## Casos de uso

- Despliegue de un asistente conversacional en ingles sobre hardware modesto: el formato INT4 reduce la huella de memoria hasta hacer viable la ejecucion en GPUs de 8-12 GB, algo que la version bf16 del modelo base no permite con holgura.
- Prototipado rapido en portatiles con GPU de gama media: cargando el repositorio con `transformers` y `device_map="auto"` se puede iterar sobre prompts y plantillas de chat sin aprovisionar instancias en la nube.
- Chatbot de soporte interno en ingles: al ser un modelo instructivo, admite conversaciones multi-turno mediante la plantilla de chat; conviene limitar la longitud de contexto en produccion dado que no se especifica la ventana soportada.
- Generacion de borradores de texto y resumenes en ingles: tareas de redaccion asistida donde una ligera perdida de precision respecto a bf16 es aceptable frente al ahorro de memoria.
- Inferencia en CPU Intel para entornos sin GPU: es el escenario explicitamente previsto por el autor, apoyandose en intel-extension-for-pytorch o OpenVINO.
- Inferencia en iGPU Intel Arc o NPU Core Ultra: util para despliegues de borde o equipos de sobremesa con aceleracion integrada, segun lo declarado en la model card.
- Evaluacion comparativa de tecnicas de cuantizacion: el repositorio documenta de forma completa los hiperparametros y condiciones de la ejecucion, por lo que sirve como referencia reproducible para estudiar el impacto de W4G64.
- Servicio de generacion de texto detras de una API compatible con OpenAI: la etiqueta `text-generation-inference` sugiere compatibilidad con TGI, aunque no se aportan configuraciones ni mediciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card unicamente incluye dos afirmaciones cualitativas sin respaldo numerico ni indicacion del hardware empleado: una aceleracion de 2 a 3 veces respecto a la version sin cuantizar y una "ligera" caida de precision en la configuracion W4G64. No se aportan valores de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion, ni comparaciones con el modelo base en bf16, por lo que el efecto real de la cuantizacion sobre la calidad no puede cuantificarse con los datos disponibles.

Datos de la ejecucion de cuantizacion registrados por el autor:

| Campo | Valor |
|---|---|
| Version de Intel AutoRound | 0.15.1 |
| Version de transformers | 4.55.3 |
| Version de torch | 2.14.0+cpu |
| `torch_dtype` de carga | torch.bfloat16 |
| Dispositivo de calibracion | cpu |
| Muestras de calibracion | 128 |
| Iteraciones de ajuste | 200 |
| Longitud de secuencia de calibracion | 512 |
| Tamano de lote de calibracion | 4 |
| Duracion de la cuantizacion | 48.229,9 s (803,8 min) |
| Finalizada el (UTC) | 2026-09-28T04:36:36 |

## Requisitos de hardware

- Los pesos ocupan 6,8 GB en disco. En GPU, la VRAM necesaria para los pesos en INT4 se situa de forma orientativa en 5-8 GB, ya que es habitual que las capas de embedding y la cabeza de salida queden sin cuantizar en precision de 16 bits.
- El cache KV es adicional y depende de la longitud de contexto configurada y de la configuracion de atencion del modelo base, dato no disponible. A contextos largos puede anadir varios gigabytes en fp16; se recomienda medirlo en el hardware objetivo.
- GPU consumer compatibles: RTX 3060 de 12 GB, RTX 4060 Ti de 16 GB, RTX 4070/4070 Ti, RTX 4080 y RTX 4090. En tarjetas de 8 GB el modelo puede caber con contexto corto, pero el margen es ajustado.
- GPU de datacenter recomendadas para produccion: A100 (40/80 GB), H100, L40S y A6000. Al ser un modelo de 7B, una unica GPU es suficiente; no requiere tensor parallelism.
- Opciones de despliegue declaradas o compatibles: `transformers` con AutoGPTQ o gptqmodel, vLLM (soporta GPTQ), text-generation-inference (etiqueta presente en el repositorio), intel-extension-for-pytorch para CPU e iGPU Intel Arc, y OpenVINO para NPU Intel AI Boost.
- llama.cpp y Ollama no cargan pesos GPTQ/AutoGPTQ de forma directa: requeririan una conversion previa a GGUF que no se incluye en este repositorio.
- Latencia y throughput: no disponibles. La unica referencia es la afirmacion del autor de una aceleracion de 2-3x frente a bf16, sin especificar hardware ni longitud de secuencia.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de terceros en la informacion proporcionada, por lo que la comparacion se limita a lo que puede extraerse del propio repositorio y de la relacion con su modelo base.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Este repositorio (Falcon3-7B-Instruct INT4 GPTQ W4G64) | 1.754.797.056 segun safetensors del repo; 7B nominal del base | no disponible | apache-2.0 declarada en el repositorio | safetensors + auto_gptq, 6,8 GB, 0 descargas y 0 likes en el momento del analisis |
| tiiuae/Falcon3-7B-Instruct (modelo base) | no disponible en la informacion proporcionada | no disponible | no disponible (verificar antes de uso comercial) | version sin cuantizar en bf16 |
| Otras alternativas de la misma categoria (instrucciones de 7-8B: Mistral-7B-Instruct, Llama-3.1-8B-Instruct, Qwen2.5-7B-Instruct) | no disponible | no disponible | no disponible | no disponible |

La comparacion cuantitativa con alternativas de la misma categoria no puede realizarse con la informacion disponible: no se han aportado parametros, ventanas de contexto, licencias ni resultados de evaluacion de esos modelos, y tampoco existe una evaluacion publicada de esta cuantizacion concreta.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay ninguna medicion publicada de la calidad de esta cuantizacion frente al modelo base, por lo que la magnitud real de la degradacion introducida por W4G64 es desconocida.
- Discrepancia en el recuento de parametros: los metadatos de safetensors indican 1.754.797.056 parametros, mientras que el modelo base se comercializa como 7B y el repositorio ocupa 6,8 GB. Conviene verificar la configuracion y el inventario de tensores antes de asumir cualquier cifra en planificacion de capacidad.
- Longitud de contexto no especificada: no se documenta la ventana soportada, lo que dificulta dimensionar el cache KV y planificar casos de uso con contexto largo.
- Idioma unico: el repositorio declara soporte exclusivo para ingles. No hay evidencia de capacidades multilingues y no se recomienda su uso en castellano sin evaluacion previa.
- Riesgo de alucinacion: inherente a los modelos de lenguaje de esta escala; la cuantizacion puede agravar la perdida de coherencia en generaciones largas o en tareas de razonamiento. No se han realizado evaluaciones de fidelidad.
- Sesgos: no documentados. La model card no incluye ninguna seccion sobre sesgos, datos de entrenamiento o consideraciones eticas del modelo base.
- Licencia: el repositorio declara apache-2.0, pero se trata de una cuantizacion de un modelo de terceros. Antes de explotacion comercial es imprescindible verificar los terminos aplicables al modelo base.
- Artefacto de terceros sin validacion de la comunidad: 0 descargas y 0 likes en el momento del analisis, y disclaimer explicito del autor de que se distribuye sin garantia y solo con fines de investigacion.
- La model card marca `inference: false`, es decir, no esta desplegado como endpoint de inferencia gestionado en HuggingFace.
- Origen de la cuantizacion: realizada por un usuario independiente, no por TII. No existe respaldo oficial del fabricante del modelo base.
- La receta de replicacion apunta a un repositorio Git alojado en `git.epicdynamic.com`, un dominio externo a GitHub; conviene auditar su contenido antes de ejecutar los scripts de instalacion.
- Compatibilidad limitada de herramientas: al ser GPTQ/AutoGPTQ en lugar de GGUF, no es cargable directamente en llama.cpp u Ollama.

## Enlaces

- Repositorio del modelo en HuggingFace: https://huggingface.co/fbaldassarri/tiiuae_Falcon3-7B-Instruct-auto_gptq-int4-gs64-sym
- Modelo base: https://huggingface.co/tiiuae/Falcon3-7B-Instruct
- Intel AutoRound (framework de cuantizacion): https://github.com/intel/auto-round
- Pipeline de cuantizacion citado por el autor: https://git.epicdynamic.com/auto-round-pipeline
- Texto de la licencia Apache 2.0 referenciado en la model card: https://choosealicense.com/licenses/apache-2.0/
- No se han encontrado enlaces relevantes en la busqueda web. Los resultados devueltos por el buscador no guardan ninguna relacion con el modelo ni con Falcon3, por lo que se han descartado integramente.
