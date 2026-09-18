# arianaazarbal/ct-inkling-oai-gen-mid-g2-b3

## Resumen

ct-inkling-oai-gen-mid-g2-b3 es un adaptador LoRA de rango 64 con `target_modules=all-linear` entrenado sobre el modelo base `thinkingmachines/Inkling-Small`. Lo publica el usuario arianaazarbal como parte de un programa de investigación denominado welfare-in-ai-rnd / constitutional_training. No es un modelo completo: es un adaptador PEFT que modifica el comportamiento del modelo base mediante ajuste supervisado (SFT) sobre un corpus sintético de documentos que instancian una constitución escrita de forma automática.

El interés del artefacto es metodológico. Forma parte de una cadena iterada en la que cada generación se entrena desde cero sobre el modelo base con una constitución generada por la generación anterior de la misma rama, de modo que la deriva entre generaciones se acumula únicamente a través de los documentos y nunca a través de los pesos. Esta ficha corresponde a la generación g2, rama b3 (réplica independiente), con semilla de generación 0 derivada de un resumen de 5k del OpenAI Model Spec.

El repositorio se exportó desde Tinker el 18 de septiembre de 2026 y ocupa 16,9 GB. No hay información pública sobre licencia, idiomas soportados, arquitectura del modelo base ni resultados de evaluación, por lo que cualquier uso más allá de la investigación requiere validación empírica previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre el modelo base `thinkingmachines/Inkling-Small`; arquitectura interna del base no disponible |
| Parametros totales | No disponible (el adaptador tiene rango 64 y `target_modules=all-linear`; el tamaño del repositorio es de 16,9 GB, lo que incluye los pesos del adaptador y, previsiblemente, material adicional de la exportación) |
| Parametros activos | No aplicable (no se indica que el modelo base sea MoE) |
| Longitud de contexto | No disponible para el base; la longitud maxima de entrenamiento del adaptador es de 8192 tokens |
| Tipos de cuantizacion | No disponible en la documentacion del autor. Al ser un adaptador PEFT puede cargarse sobre un base cuantizado, pero el autor no documenta ninguna combinacion validada |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |
| Modelo base | thinkingmachines/Inkling-Small |
| Libreria | peft |
| Pipeline | text-generation |
| Linaje (cadena) | inkling-oai-gen-mid |
| Generacion / rama | g2 / b3 |
| Semilla de gen-0 | OpenAI Model Spec (resumen de 5k) |
| Regimen de entrenamiento | midtrain only (SFT LoRA de etapa 1 sobre corpus sintetico de documentos que instancian la constitucion) |
| Configuracion de servicio | Renderer tml_v0, reasoning OFF, effort 0.0 |
| Nombre interno de la ejecucion | inkoaig2_inkoai_g2_b3_s1 |
| Fecha de entrenamiento | 2026-09-17 |
| Fecha de exportacion | 2026-09-18 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA, no un modelo con pesos completos. La receta esta bloqueada y es explicita: rango 64, learning rate 1e-4, scheduler coseno con 5 % de warmup, 1 epoca, batch de 128, longitud maxima de 8192 tokens y semilla de entrenamiento 42. Los modulos objetivo son todos los lineales (`all-linear`). El modelo base sobre el que se aplica el adaptador es `thinkingmachines/Inkling-Small`, cuya arquitectura, numero de parametros y composicion del dataset de preentrenamiento no se detallan en la informacion disponible.

El aspecto diferencial es el procedimiento de entrenamiento iterado. Cada generacion parte de nuevo del modelo base y se entrena sobre un corpus sintetico que instancia una unica constitucion. La generacion 0 se sembro con una constitucion escrita por humanos (resumen de 5k del OpenAI Model Spec); en las generaciones N>=1, la constitucion la escribe el modelo de la generacion N-1 de la misma rama, seleccionada como medoide de embedding con filtrado sobre un pool de 40 cadenas autogeneradas. Esto implica que la deriva conductual entre generaciones no se transmite por los pesos, sino por los documentos. La constitucion concreta de esta generacion se incluye en el repositorio como `training_seed_constitution.md`, y el registro de exportacion en `tinker_meta.json`.

No hay informacion sobre uso de RLHF, DPO u otras tecnicas de preferencias en esta etapa: el regimen declarado es exclusivamente midtrain/SFT de etapa 1.

## Capacidades

- Generacion de texto autoregresiva: el `pipeline_tag` declarado es `text-generation`.
- Instanciacion de una constitucion concreta: el adaptador se ha entrenado para reproducir el comportamiento descrito en `training_seed_constitution.md`, derivado en ultima instancia del OpenAI Model Spec.
- Generacion de constituciones para la siguiente generacion: el programa describe que la semilla de g3 se elicita del modelo entrenado de g2, por lo que este adaptador es el candidato a producirla dentro de su rama.
- Modo de razonamiento: la configuracion de servicio recomendada es reasoning OFF y effort 0.0, es decir, sin modo de pensamiento extendido.
- Tool calling / function calling: no documentado, no disponible.
- Capacidades de agente o razonamiento multi-paso: no documentadas, no disponibles.
- Capacidades multilingues: no disponibles.
- Vision, audio u otras modalidades: no documentadas, no disponibles.

## Casos de uso

- Investigacion en constitutional AI: reproducir la cadena iterada de constituciones y comparar el comportamiento de la rama b3 con el de otras ramas y generaciones del mismo programa, usando siempre el mismo modelo base y la misma receta LoRA.
- Estudio de deriva conductual entre generaciones: al entrenar cada generacion desde el base con documentos distintos, es posible aislar la contribucion del texto constitucional al comportamiento final y medir la deriva sin contaminacion de pesos.
- Generacion de la semilla de la generacion siguiente: elicitar una constitucion nueva a partir de este adaptador (medoide de embedding sobre un pool de cadenas autogeneradas) para alimentar el entrenamiento de g3.
- Auditoria de alineacion frente a especificaciones de comportamiento: analizar hasta que punto un corpus derivado del OpenAI Model Spec se traduce en conductas concretas y detectar desviaciones o interpretaciones no deseadas.
- Ablacion de hiperparametros de PEFT en condiciones controladas: la receta esta bloqueada y la semilla es fija (42), lo que permite estudiar el efecto de variaciones de rango, learning rate o epocas sobre un punto de partida reproducible.
- Reproduccion de experimentos exportados desde Tinker: la ruta original del sampler permite volver a la ejecucion concreta y verificar resultados, util en entornos de investigacion que exigen trazabilidad completa.
- Docencia y divulgacion sobre PEFT y LoRA: el repositorio incluye tanto el adaptador como la constitucion y el registro de exportacion, lo que lo convierte en un ejemplo documentado de fine-tuning con peft sobre un base congelado.
- Evaluacion comparativa de tecnicas de alineacion: servir el adaptador con el renderer tml_v0 y comparar sus respuestas frente al modelo base sin adaptador en tareas sensibles a normas de comportamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no reporta metricas de MMLU, HumanEval, GSM8K ni de evaluaciones de alineacion, seguridad o deriva conductual. Tampoco hay comparaciones cuantitativas con el modelo base ni con otras ramas del mismo programa.

## Requisitos de hardware

- VRAM para inferencia: no disponible. La huella depende por completo del tamano del modelo base `thinkingmachines/Inkling-Small`, que no se especifica en la informacion proporcionada. Un adaptador LoRA de rango 64 anade un coste despreciable frente al base, pero no se puede estimar el total sin conocer este ultimo.
- GPU recomendadas: no disponible por la misma razon. La eleccion de GPU debe derivarse del modelo base, no del adaptador.
- Encaje en GPU de consumo: indeterminable con los datos disponibles. Depende del tamano del base y del nivel de cuantizacion que admita.
- Tamano del repositorio: 16,9 GB, dato relevante para planificar el espacio en disco y la descarga, aunque no equivale a la VRAM necesaria en inferencia.
- Opciones de despliegue: el autor documenta la carga mediante `peft.PeftModel` y `transformers.AutoModelForCausalLM` con `torch_dtype="bfloat16"` y `device_map="auto"`. No se documentan despliegues con vLLM, TGI, llama.cpp, Ollama ni otros servidores. Para vLLM o TGI seria necesario verificar el soporte de adaptadores LoRA sobre este base concreto.
- Latencia y throughput: no disponibles.
- Configuracion de servicio obligatoria segun el autor: renderer `tml_v0`, reasoning OFF, effort 0.0. Servir el adaptador con otra configuracion puede alterar el comportamiento observado en el entrenamiento.
- Exportacion desde Tinker: el registro de la ruta original (`tinker://130e8d5e-54aa-5dc6-ab00-d1c3f2a46952:train:0/sampler_weights/inkoaig2_inkoai_g2_b3_s1_final`) permite reproducir la ejecucion en esa plataforma.

## Comparativa con modelos similares

No se dispone de datos de rendimiento ni de especificaciones del modelo base, por lo que la comparativa se limita a la relacion entre el adaptador y su base. No se han identificado en la informacion disponible modelos de terceros comparables con datos verificables.

| Modelo | Tipo | Relacion | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| thinkingmachines/Inkling-Small | Modelo base completo | Punto de partida de todas las generaciones de la cadena | No disponible | No disponible | HuggingFace |
| ct-inkling-oai-gen-mid-g2-b3 | Adaptador LoRA r=64, all-linear | Objeto de esta ficha; generacion g2, rama b3 | No disponible (maximo de entrenamiento: 8192 tokens) | No disponible | HuggingFace |
| Otras generaciones o ramas de la misma cadena | Adaptadores LoRA | No documentadas en la informacion proporcionada | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- No es un modelo autonomo: requiere descargar y cargar el modelo base `thinkingmachines/Inkling-Small` para funcionar. No puede desplegarse por si solo.
- Licencia no disponible: sin una licencia explicita no se puede asumir permiso para uso comercial, redistribucion ni modificacion. Conviene contactar con el autor o con el titular del modelo base antes de cualquier uso productivo.
- Ausencia total de evaluacion: no hay benchmarks, ni evaluaciones de seguridad, ni analisis de sesgos. No es posible afirmar nada sobre su calidad relativa.
- Riesgo de alucinacion: no evaluado y no documentado. Debe asumirse el comportamiento del modelo base, que tambien se desconoce.
- Idiomas no documentados: se desconoce si el comportamiento constitucional se mantiene fuera del ingles y si el corpus sintetico de entrenamiento cubria otros idiomas.
- Sesgos conocidos: no documentados. La semilla deriva del OpenAI Model Spec, un documento con una orientacion normativa concreta, lo que puede introducir sesgos de valores especificos de esa especificacion.
- Sobreajuste al corpus constitucional: el entrenamiento es de 1 epoca sobre documentos sinteticos que instancian una unica constitucion, por lo que el comportamiento puede ser estrecho y poco generalizable fuera de ese dominio.
- Configuracion de servicio restrictiva: el autor especifica renderer `tml_v0`, reasoning OFF y effort 0.0. Usar otro renderer o activar el razonamiento puede invalidar el comportamiento esperado.
- Naturaleza experimental: el artefacto pertenece a un programa de investigacion sobre bienestar en IA y constituciones iteradas, no a un lanzamiento de producto. No hay senales de validacion por parte de la comunidad (0 descargas y 0 likes en el momento de la consulta).
- Fechas declaradas: el entrenamiento (2026-09-17) y la exportacion (2026-09-18) figuran en el repositorio; conviene verificar la coherencia temporal con el resto de la cadena antes de citar el artefacto.
- La busqueda web realizada no devolvio ningun resultado relevante sobre este modelo (unicamente dominios sin relacion), por lo que no existe documentacion externa que permita contrastar la model card.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/arianaazarbal/ct-inkling-oai-gen-mid-g2-b3
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-Small
- Constitucion de entrenamiento: `training_seed_constitution.md`, incluida en el repositorio
- Registro de exportacion: `tinker_meta.json`, incluido en el repositorio
- Ruta original en Tinker: `tinker://130e8d5e-54aa-5dc6-ab00-d1c3f2a46952:train:0/sampler_weights/inkoaig2_inkoai_g2_b3_s1_final`
- Papers, blogs, repositorios o demos adicionales: no disponible (la busqueda web no devolvio resultados relevantes)
