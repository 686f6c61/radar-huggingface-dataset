# genaforvena/study-toy_passage_ppl

## Resumen

`genaforvena/study-toy_passage_ppl` es un adaptador LoRA (PEFT) publicado en HuggingFace sobre el modelo base `HuggingFaceTB/SmolLM2-360M-Instruct`. Se trata de un artefacto de investigación de tipo «toy»: el repositorio ocupa 0,0 GB —es decir, contiene unicamente los pesos del adaptador, no el modelo completo— y el nombre sugiere un experimento de estudio sobre perplejidad de pasajes (*passage perplexity*). El autor, `genaforvena`, no ha publicado ni un solo campo sustantivo de la model card: la tarjeta es la plantilla por defecto de HuggingFace con todos los apartados marcados como «More Information Needed».

El interes practico del repositorio es, por tanto, limitado y muy acotado: sirve como ejemplo reproducible de fine-tuning con LoRA sobre un modelo pequeno, y como punto de partida para quien quiera inspeccionar como se estructura un adaptador PEFT de rank desconocido acoplado a SmolLM2-360M. No hay evidencia de evaluacion, de dataset de entrenamiento, de hiperparametros ni de licencia. Cualquier uso en produccion requeriria validacion propia desde cero.

El modelo base, SmolLM2-360M-Instruct, si esta bien documentado por HuggingFaceTB: es un transformer decoder-only de 361 millones de parametros, entorno de 8.192 tokens de contexto y licencia Apache-2.0, disenado para ejecucion en dispositivo (*on-device*) y entornos con recursos muy limitados. Las especificaciones que se detallan a continuacion corresponden al modelo base, ya que el adaptador no anade ni modifica la arquitectura.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only tipo Llama (adaptador LoRA sobre el modelo base; el adaptador en si no define arquitectura propia) |
| Parametros totales | 361 M en el modelo base `HuggingFaceTB/SmolLM2-360M-Instruct`; numero de parametros entrenables del adaptador: no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 8.192 tokens en el modelo base; no disponible si el adaptador la modifica |
| Tipos de cuantizacion | no disponible en la informacion del repositorio; el modelo base admite cuantizacion a 8 y 4 bits mediante herramientas estandar (GGUF, bitsandbytes) |
| Idiomas soportados | no disponible (el modelo base esta entrenado principalmente en ingles) |
| Licencia | no disponible para el adaptador; el modelo base SmolLM2-360M-Instruct se distribuye bajo Apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |
| Libreria | PEFT 0.20.0, transformers |
| Pipeline | text-generation |
| Tamano del repositorio | 0,0 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-09-16 |

## Arquitectura y entrenamiento

No hay informacion publicada sobre el procedimiento de entrenamiento del adaptador: se desconoce el dataset, el numero de tokens vistos, la composicion de los datos, la existencia de RLHF, DPO o SFT supervisado, la configuracion exacta de LoRA (rank `r`, `alpha`, `dropout`, modulos objetivo) y los hiperparametros de optimizacion. La unica pista es el nombre del repositorio, `study-toy_passage_ppl`, que apunta a un estudio experimental sobre perplejidad de pasajes, probablemente con un conjunto de datos minusculo y sin intencion de publicacion como modelo funcional.

En cuanto al modelo base, SmolLM2-360M-Instruct es un transformer decoder-only con normalizacion RMSNorm, activacion SwiGLU, embeddings rotatorios (RoPE) y atencion con consultas agrupadas (GQA). El modelo completo de la familia SmolLM2 se entreno sobre un corpus del orden de billones de tokens combinando datos web filtrados por criterios educativos, codigo, matematicas y datos de instrucciones, seguido de una fase de alineacion para el modo instruct. La innovacion principal de la familia es el enfoque *data-centric*: conseguir capacidad util en un presupuesto de parametros muy reducido mediante curacion agresiva del corpus. El adaptador LoRA no introduce ninguna innovacion tecnica adicional conocida (ni decodificacion especulativa, ni atencion lineal, ni mecanismos hibridos SSM).

## Capacidades

- Generacion de texto autoregresiva: heredada del modelo base, con calidad propia de un modelo de 361 M de parametros.
- Razonamiento y conocimiento general: capacidad limitada y sensible al dominio; no hay evaluacion publicada para este adaptador.
- Generacion de codigo: el modelo base incluye datos de codigo en su entrenamiento, pero no hay evidencia de que el adaptador preserve o mejore esta capacidad.
- Matematicas: no disponible; el modelo base tiene rendimiento modesto en tareas aritmeticas de varios pasos.
- Tool calling / function calling: no documentado para el adaptador; el modelo base no incluye un formato nativo de llamada a herramientas garantizado.
- Soporte de agentes y razonamiento multi-paso: no documentado; poco realista en un modelo de este tamano sin fine-tuning especifico.
- Capacidades multilingues: no disponibles; el modelo base esta centrado en ingles y presenta degradacion notable fuera de ese idioma.
- Capacidades especiales (modo thinking, vision, audio): ninguna declarada.
- Uso como banco de pruebas de PEFT: es la unica capacidad claramente verificable del repositorio, ya que se puede cargar como adaptador sobre el modelo base.

## Casos de uso

- Reproduccion de experimentos de fine-tuning con LoRA: el adaptador sirve para estudiar como se comporta un ajuste de bajo rango sobre un transformer de 361 M, comparando la perplejidad del modelo base frente a la del modelo adaptado en un corpus de validacion propio.
- Analisis de perplejidad de pasajes: dado el nombre del repositorio, el caso mas plausible es medir perplejidad sobre fragmentos de texto concretos para estudiar que tipo de pasajes degradan mas la prediccion del modelo; util en investigacion sobre metricas intrinsecas.
- Docencia y formacion: sirve como ejemplo minimo de artefacto PEFT para explicar en un curso la diferencia entre pesos completos y adaptadores, el papel del `adapter_config.json` y la carga con `PeftModel.from_pretrained`.
- Pruebas de integracion en pipelines de inferencia local: permite validar que una cadena de herramientas (transformers, PEFT, llama.cpp tras conversion) carga correctamente un adaptador sobre un modelo pequeno antes de escalar a modelos mayores.
- Prototipado en dispositivo con recursos minimos: el modelo base cabe en menos de 1 GB en fp16, por lo que el conjunto base + adaptador puede ejecutarse en portatiles, Raspberry Pi 5 o moviles para demos de generacion de texto muy acotada.
- Auditoria de model cards y gobernanza de artefactos: el repositorio es un caso de estudio real de publicacion sin licencia, sin idiomas declarados y sin evaluacion, util para disenar checklists de revision antes de adoptar un modelo de terceros.
- Filtrado o scoring de candidatos en generacion: usar la perplejidad del modelo adaptado como funcion de puntuacion para reordenar varias hipotesis de texto generadas por otro sistema, siempre que se valide previamente que la adaptacion no ha degradado la senal.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del adaptador no incluye ninguna seccion de evaluacion cumplimentada, y los resultados de la busqueda web realizada no guardan relacion con el modelo.

## Requisitos de hardware

- VRAM estimada para inferencia (base + adaptador): aproximadamente 0,75 GB en fp16/fp32 mixto, unos 0,4 GB en cuantizacion de 8 bits y entre 0,2 y 0,3 GB en 4 bits.
- GPU recomendadas: no requiere GPU dedicada. Funciona en cualquier GPU con 2 GB o mas de VRAM (GTX 1050 Ti, MX150, integradas modernas con suficiente memoria compartida).
- GPU de centro de datos: A100, H100 o L40S estan sobredimensionadas para este tamano; solo tendrian sentido para servir muchas replicas concurrentes.
- Cabe en GPU de consumo: si, en practicamente todas las GPU de consumo actuales (RTX 3060, RTX 4060, RTX 4090) e incluso en CPU con 1-2 GB de RAM libre.
- Opciones de despliegue: `transformers` + `peft` como via natural para adaptadores LoRA; tras fusionar los pesos (`merge_and_unload`) puede convertirse a GGUF y servirse con `llama.cpp` u `Ollama`. vLLM y TGI admiten adaptadores LoRA, aunque el rendimiento en un modelo de 361 M esta limitado por el *overhead* de gestion, no por el computo.
- Latencia y throughput estimados: no disponible; no se han publicado mediciones. Como referencia cualitativa, un modelo de este orden genera decenas de tokens por segundo en CPU moderna y varios cientos en una GPU de consumo.

## Comparativa con modelos similares

Los datos de la columna del adaptador son los del modelo base, unico componente con especificaciones verificables. Las cifras de los modelos alternativos proceden de sus model cards publicas.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| `study-toy_passage_ppl` (sobre SmolLM2-360M-Instruct) | 361 M (base) + adaptador de tamano no declarado | 8.192 (base) | no disponible | Repositorio con 0 descargas y 0 likes | Sin evaluacion ni documentacion |
| HuggingFaceTB/SmolLM2-360M-Instruct | 361 M | 8.192 | Apache-2.0 | Muy extendido, con GGUF y despliegue en Ollama | Alternativa directa y completamente documentada |
| Qwen/Qwen2.5-0.5B-Instruct | ~0,49 B | 32.768 | Apache-2.0 | Amplia, con cuantizaciones oficiales | Mejor soporte de contexto largo y multilingue |
| meta-llama/Llama-3.2-1B-Instruct | ~1,24 B | 128.000 | Llama 3.2 Community License | Muy amplia, requiere aceptar la licencia | Mas capacidad, mas recursos y restricciones de uso |
| TinyLlama/TinyLlama-1.1B-Chat-v1.0 | ~1,1 B | 2.048 | Apache-2.0 | Amplia | Contexto muy corto; superado por SmolLM2 en su rango |

## Limitaciones y advertencias

- Ausencia total de documentacion: la model card es la plantilla por defecto, sin datos de autor, financiacion, tipo de modelo, idiomas, licencia ni procedencia de los datos.
- Licencia no declarada para el adaptador: no se puede asumir uso comercial permitido. Aunque el modelo base es Apache-2.0, los pesos derivados carecen de terminos explicitos.
- Origen de los datos de entrenamiento desconocido: no es posible auditar si el ajuste introdujo sesgos, datos personales o contenido con derechos de autor.
- Riesgo de alucinacion elevado: el modelo base de 361 M parametros tiene capacidad factual muy limitada y tiende a generar texto plausible pero incorrecto, especialmente en dominios especializados.
- Degradacion fuera del ingles: el modelo base esta centrado en ingles; no se ha validado su comportamiento en castellano ni en otros idiomas.
- Contexto efectivo reducido: aunque la ventana nominal sea de 8.192 tokens, los modelos de este tamano pierden coherencia mucho antes en tareas de recuperacion dentro del contexto.
- Sin benchmarks: no existe ninguna evidencia de que el ajuste LoRA mejore al modelo base; podria incluso degradarlo fuera de la distribucion de su dataset de estudio.
- Cero adopcion: 0 descargas y 0 likes, sin issues ni discusiones, lo que implica ausencia de validacion por parte de terceros.
- Idoneidad para produccion: nula sin una evaluacion propia exhaustiva. Debe tratarse como artefacto de laboratorio, no como componente de un sistema en servicio.
- Fechas de publicacion inusuales (creacion en 2026-09-16): conviene verificar la integridad del repositorio antes de cargarlo en un entorno controlado.

## Enlaces

- Repositorio del adaptador: https://huggingface.co/genaforvena/study-toy_passage_ppl
- Modelo base: https://huggingface.co/HuggingFaceTB/SmolLM2-360M-Instruct
- Paper de la familia SmolLM2 (referencia del modelo base): https://arxiv.org/abs/2502.02737
- Referencia metodologica citada en los tags del repositorio (Lacoste et al., 2019, sobre impacto ambiental del aprendizaje automatico): https://arxiv.org/abs/1910.09700
- Calculadora de impacto de ML citada en la model card: https://mlco2.github.io/impact
- Documentacion de PEFT: https://huggingface.co/docs/peft
- Resultados de la busqueda web: no se han encontrado enlaces relevantes al modelo; las consultas devolvieron unicamente hilos de soporte sobre cuentas de correo, sin relacion con este repositorio.
