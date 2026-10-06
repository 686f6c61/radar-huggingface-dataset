# open-inference/GLM-5.3-W4A8-Mixed-AttentionGPTQ-Cal48-Seq512

## Resumen

GLM-5.3-W4A8-Mixed-AttentionGPTQ-Cal48-Seq512 es un checkpoint experimental publicado por el usuario open-inference que modifica únicamente las matrices de atención del modelo gpustack/GLM-5.3-W4A8. No es un modelo nuevo ni un entrenamiento adicional: se trata de un artefacto de cuantización que sustituye las proyecciones Q-a, Q-b y O de las 78 capas por versiones INT4 con escalas FP32, manteniendo byte a byte el resto de tensores del modelo padre (incluidos los códigos y escalas W4/G128 de los expertos enrutados y los metadatos originales).

El modelo base pertenece a la familia GLM-5.3, etiquetada con la arquitectura glm_moe_dsa (mezcla de expertos con atención dispersa), y suma 753.329.940.480 parámetros totales; el repositorio ocupa 405,5 GB en formato safetensors con cuantización comprimida. El contrato de servicio asociado declara una longitud de contexto de hasta 262.144 tokens, aunque la evaluación publicada solo cubre ventanas de 512 tokens.

Su relevancia es acotada y muy técnica: sirve como banco de pruebas para validar en hardware real (32 chips v6e) si una atención cuantizada a INT4 degrada o no la distribución de salida respecto a la atención BF16 con los mismos expertos y la misma caché KV INT4. El propio autor declara que la calidad de producción queda sin cualificar y que la publicación no modifica ninguna admisión de servicio público.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | glm_moe_dsa (mezcla de expertos con atención dispersa); detalles de capas y expertos no disponibles |
| Parametros totales | 753.329.940.480 |
| Parametros activos | no disponible |
| Longitud de contexto | 262.144 tokens segun el contrato de servicio; la evaluacion publicada solo cubre 512 tokens |
| Tipos de cuantizacion | Pesos W4A8 con codigos/escalas G128 en los expertos enrutados; atencion INT4 con signo en rango [-7,7], empaquetado binario con desplazamiento en INT32 y escalas FP32 por canal de salida; cache KV INT4/G64 como politica de runtime |
| Idiomas soportados | no disponible |
| Licencia | other, con license_name glm-5.3 (enlace a la licencia de zai-org/GLM-5.3) |
| Formato de pesos | safetensors con compresion compressed-tensors |
| Modelo base | gpustack/GLM-5.3-W4A8 (revision f6d1e50d43edb5fb3f3141f19fc691511a50756c) |
| Tamano del repositorio | 405,5 GB |
| Fecha de publicacion | 6 de octubre de 2026 |
| Descargas / likes | 10 / 0 |
| Pipeline declarado | no disponible |

## Arquitectura y entrenamiento

La arquitectura subyacente es glm_moe_dsa, es decir, un transformer de mezcla de expertos con algun esquema de atención dispersa, segun la etiqueta oficial del repositorio. No se dispone de informacion sobre el numero de capas totales (aunque la model card menciona 78 capas afectadas por la cuantizacion de atencion), el numero de expertos, los parametros activos por token ni la dimension oculta. Tampoco hay datos sobre el corpus de entrenamiento del modelo base, el numero de tokens procesados ni si hubo fases de RLHF o DPO; el modelo card de este repositorio no los documenta porque no es un modelo entrenado, sino una re-cuantizacion.

La innovacion tecnica concreta de este checkpoint es el componente `attention-w4/`: cuantiza Q-a, Q-b y O en las 78 capas, lo que suma 234 matrices, usando enteros con signo de 4 bits en el rango [-7,7] con empaquetado binario con desplazamiento en INT32 y escalas FP32 reales por canal de salida sobre el eje K logico completo. Las activaciones nativas usan A8; los productos punto en INT32 se reescalan en FP32, las parciales de tensor-parallel se redondean a BF16 y se reducen mediante sumas FP32 ordenadas. El resto de tensores de atencion conservan la representacion del padre.

La calibracion se hizo con GPTQ de Hessiano completo sobre 48 prompts de chat y 16 prompts de validacion disjuntos, limitados a 512 tokens renderizados, con 1.536 filas de calibracion y 512 filas de validacion muestreadas por matriz. El damping y el reajuste persistente de escalas por canal se seleccionaron exclusivamente sobre el cuarto de ajuste de calibracion y despues se reajustaron sobre todas las filas de calibracion; las observaciones de validacion no entraron en la seleccion. Las entradas siguen la trayectoria de atencion BF16 con los expertos padre sin modificar y la cache KV INT4 nativa. El autor no reclama ningun corpus nuevo ni una recalibracion sobre trayectorias cuantizadas, y advierte que no se ha realizado una calibracion GPTQ nueva de los expertos.

## Capacidades

- No se documentan capacidades funcionales propias de este checkpoint: es un artefacto de cuantizacion sobre gpustack/GLM-5.3-W4A8, por lo que sus capacidades derivan integramente del modelo padre.
- Generacion de texto: no disponible como dato verificado; la evaluacion publicada se limita a prediccion del siguiente token sobre 8.118 posiciones, no a generacion libre.
- Razonamiento, codigo y matematicas: no disponible.
- Soporte de tool calling o function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible; los idiomas soportados no estan declarados.
- Capacidades especiales (modo thinking, vision, audio): no disponible.
- Lo unico verificable es que el checkpoint se carga con el runtime nativo de GLM-5.3 en modo de atencion W4 y que la prediccion del siguiente token mantiene una coincidencia top-1 del 89,6773 por ciento con la referencia BF16 sobre el conjunto de validacion.

## Casos de uso

- Validacion de kernels INT4 de atencion: el checkpoint permite comparar, con los mismos expertos y la misma cache KV INT4, una atencion BF16 contra una atencion W4 sobre 8.118 predicciones, midiendo NLL, KL y coincidencia top-1 en lugar de estimaciones teoricas.
- Investigacion en cuantizacion post-entrenamiento: sirve como caso de estudio de GPTQ con Hessiano completo sobre un subconjunto de tensores (solo 234 matrices de atencion) con calibracion corta de 512 tokens y particion explicita entre ajuste y validacion.
- Auditoria de recetas reproducibles: el repositorio incluye hashes del constructor, la receta, el contrato y la fuente exacta de evaluacion, de modo que un equipo puede verificar si el procedimiento es replicable antes de adoptarlo.
- Pruebas de integracion con tensor parallelism: el autor indica DP8/TP4 y ejecucion sobre 32 chips v6e, por lo que es util para validar el redondeo a BF16 de parciales TP y la reduccion en FP32 ordenado en infraestructura real.
- Estudio de degradacion por prompt: el peor delta de NLL por prompt fue de +0,0725 nats/token, un dato util para analizar la varianza de la cuantizacion entre entradas y decidir si conviene un filtrado previo.
- Evaluacion de politicas de cache KV: dado que la cache INT4/G64 es una politica de runtime separada y no un tensor offline, el checkpoint permite medir su interaccion con la atencion cuantizada manteniendo claves RoPE e indexer en BF16.
- No se recomienda su uso en produccion orientada a usuario final mientras no se superen las puertas de calidad declaradas por el autor (generacion libre, exactitud en tareas, contexto largo y rendimiento de servicio con carga).

## Benchmarks y rendimiento

Los unicos datos publicados son los de la comparacion de validacion entre atencion BF16 y atencion W4, con 32 chips v6e y resultados de rango identicos:

| Metrica de validacion | Resultado |
|---|---|
| Predicciones de siguiente token puntuadas | 8.118 |
| NLL de referencia (nats/token) | 1,8952646 |
| NLL con W4 | 1,8867090 |
| Delta de NLL | -0,0085556 |
| Divergencia KL referencia a W4 | 0,1540096 |
| Coincidencia top-1 | 89,6773 por ciento |
| Peor delta de NLL por prompt | +0,0725 nats/token |

El autor advierte expresamente que no hubo aumento agregado de NLL en este conjunto de validacion reducido, pero que esto no establece una mejora de calidad estadisticamente fiable. No se han publicado resultados de MMLU, HumanEval, GSM8K ni de ninguna otra suite de evaluacion en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible como medicion oficial. Como referencia aritmetica, 753,3 mil millones de parametros a 4 bits por peso suponen unos 376,7 GB solo de pesos; el repositorio ocupa 405,5 GB, a lo que hay que sumar escalas, activaciones A8, cache KV y overhead del runtime.
- GPU recomendadas: no disponibles. El autor referencia 32 chips v6e, no GPU de consumo ni modelos concretos de NVIDIA.
- GPU de consumo: no cabe en ninguna. Una RTX 4090 con 24 GB queda mas de un orden de magnitud por debajo del espacio necesario; se requiere despliegue multi-nodo.
- Opciones de despliegue: se debe usar el cargador nativo del runtime de GLM-5.3 sobre el directorio completo descargado, con additional_config.glm53.attention_weight_bits=4 y una configuracion DP8/TP4. El modo por defecto de atencion BF16 sigue leyendo los tensores padre preservados. La carga W4 arbitraria en Transformers o en GPU no esta cualificada, por lo que vLLM, llama.cpp, Ollama y TGI no estan validados para esta atencion cuantizada.
- Latencia y throughput: no disponibles. El autor indica que el rendimiento de servicio con carga es una puerta de calidad separada que no se ha evaluado.
- La cache KV es gestionada por el planificador como cache paginada estandar, compartida entre prefill y decode.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Estado |
|---|---|---|---|---|
| open-inference/GLM-5.3-W4A8-Mixed-AttentionGPTQ-Cal48-Seq512 | 753,3 mil millones | 262.144 tokens segun contrato de servicio, evaluado a 512 | other, license_name glm-5.3 | Experimental, calidad de produccion sin cualificar |
| gpustack/GLM-5.3-W4A8 (modelo padre) | no disponible en la informacion facilitada | no disponible | no disponible | Referencia directa de esta comparativa |
| zai-org/GLM-5.3 (modelo original) | no disponible | no disponible | glm-5.3 | Origen de la licencia citada |

No se dispone de datos de rendimiento del modelo padre ni del modelo original en la informacion proporcionada, por lo que no es posible establecer una comparativa cuantitativa. Tampoco se han encontrado en la busqueda web modelos alternativos de la misma categoria con datos verificables.

## Limitaciones y advertencias

- Calidad de produccion sin cualificar: el autor senala explicitamente que la generacion libre, la exactitud en tareas, la calidad en contexto largo y el rendimiento de servicio son puertas de calidad independientes que no se han superado.
- Contexto no validado: el contrato de servicio permite 262.144 tokens, pero la evaluacion se hizo con 512 tokens renderizados, por lo que no se cualifica el comportamiento en ventanas largas.
- Evidencia estadistica insuficiente: la mejora de NLL de -0,0085556 nats/token se obtuvo sobre un conjunto de validacion pequeno y el propio autor niega que establezca una mejora fiable. El peor prompt empeoro en +0,0725 nats/token.
- Cobertura parcial de la cuantizacion: solo se cuantizaron 234 matrices de atencion (Q-a, Q-b y O en 78 capas). Los expertos enrutados se conservan del padre y no se han recalibrado.
- Compatibilidad restringida: la carga W4 en Transformers o en GPU generica no esta cualificada; usar el checkpoint fuera del runtime nativo puede producir resultados incorrectos sin aviso.
- Idiomas no declarados: no hay informacion sobre cobertura linguistica ni sobre sesgos asociados.
- Riesgo de alucinacion: no evaluado en la informacion disponible; no hay mediciones de veracidad ni de fidelidad factual.
- Sesgos conocidos: no disponibles.
- Licencia: es "other" con license_name glm-5.3 y enlace a la licencia del modelo original. Las condiciones exactas de uso comercial dependen de ese texto, que no se reproduce en la informacion facilitada; hay que consultarlo antes de cualquier despliegue.
- Naturaleza experimental: el repositorio se marca como experimental y con solo 10 descargas, sin pipeline declarado ni validacion externa conocida.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/open-inference/GLM-5.3-W4A8-Mixed-AttentionGPTQ-Cal48-Seq512
- Modelo padre: https://huggingface.co/gpustack/GLM-5.3-W4A8
- Modelo original y licencia: https://huggingface.co/zai-org/GLM-5.3
- Texto de licencia: https://huggingface.co/zai-org/GLM-5.3/blob/main/LICENSE
- La busqueda web no devolvio resultados relevantes: los enlaces recuperados corresponden a OpenAI, OpenOffice y portales de empleo, sin relacion con este modelo. No hay papers, blogs, repositorios de codigo ni demos adicionales disponibles.
