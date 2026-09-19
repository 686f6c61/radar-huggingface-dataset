# arianaazarbal/ct-nemotron120b-anth-gen-mid-g0-b3

## Resumen

`ct-nemotron120b-anth-gen-mid-g0-b3` es un adaptador LoRA publicado por el usuario `arianaazarbal` sobre el modelo base `nvidia/NVIDIA-Nemotron-3-Super-120B-A12B-BF16`. No se trata de un modelo completo, sino de un adaptador de PEFT (rango 64, `target_modules=all-linear`) obtenido mediante un programa de entrenamiento por constitución iterada (`welfare-in-ai-rnd / constitutional_training`), en el que cada generación se entrena desde cero sobre el modelo base a partir de un corpus sintético que instancia una constitución concreta.

La generación 0 (`g0`) de la cadena `nemotron120b-anth-gen-mid` se sembró con un resumen de 5 000 tokens de la constitución de Anthropic; las generaciones posteriores se siembran con una constitución escrita por el propio modelo de la generación anterior de la misma rama, de modo que la deriva entre generaciones se acumula únicamente a través de los documentos y nunca a través de los pesos. La rama `b3` es una réplica independiente, y el régimen de entrenamiento declarado es únicamente *midtrain* (SFT LoRA de etapa 1 sobre el corpus sintético).

El interés de esta ficha es acotado: se trata de un artefacto de investigación sobre alineamiento constitucional, sin descargas ni valoraciones en HuggingFace, sin licencia declarada y sin resultados de benchmarks publicados. El modelo base, por su parte, es un MoE de gran tamaño (la nomenclatura indica 120 000 millones de parámetros totales con 12 000 millones activos), lo que condiciona por completo los requisitos de hardware.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre transformer MoE (modelo base NVIDIA Nemotron-3-Super-120B-A12B) |
| Parametros totales | 120 000 millones en el modelo base (segun nomenclatura `120B-A12B`); el adaptador LoRA es adicional |
| Parametros activos | 12 000 millones en el modelo base (segun nomenclatura); no disponible para el adaptador |
| Longitud de contexto | no disponible para el modelo base; en el entrenamiento del adaptador se uso `max length = 8192` |
| Tipos de cuantizacion | no disponible (formato nativo BF16 en el modelo base; el adaptador se exporta en safetensors) |
| Idiomas soportados | no disponible (no declarados en la model card) |
| Licencia | no disponible (ni el adaptador ni la model card la especifican) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); modelo base en BF16 |

Datos adicionales del adaptador:

| Parametro | Valor |
|---|---|
| Libreria | peft |
| Rango LoRA | 64 |
| Modulos objetivo | `all-linear` |
| Tamano del repositorio | 29,0 GB |
| Pipeline | text-generation |
| Renderer de servicio | `nemotron3_disable_thinking` (razonamiento desactivado) |
| Fecha de entrenamiento | 2026-07-18 |
| Fecha de exportacion | 2026-09-18 |
| Nombre interno de ejecucion | `g0_nemotron_medoid_b3_s1` |

## Arquitectura y entrenamiento

El adaptador se aplica sobre un transformer de tipo mezcla de expertos (MoE) de 120 000 millones de parametros totales y 12 000 millones activos, segun la nomenclatura del modelo base `NVIDIA-Nemotron-3-Super-120B-A12B-BF16`. El adaptador en si es un LoRA de rango 64 aplicado a todos los modulos lineales (`target_modules=all-linear`), entrenado con la receta bloqueada del programa: learning rate 1e-4, scheduler coseno con 5 % de warmup, 1 epoca, batch de 128, longitud maxima de 8192 tokens y semilla de entrenamiento 42.

El regimen declarado es exclusivamente *midtrain*: SFT de etapa 1 sobre un corpus de documentos sinteticos que instancian una constitucion. En esta generacion 0, la constitucion semilla es un resumen de 5 000 tokens de la constitucion de Anthropic. El punto tecnico diferencial del programa es que cada generacion parte **desde cero** del modelo base, no desde los pesos de la generacion anterior; la continuidad entre generaciones se transmite solo a traves del texto de la constitucion generada por el modelo precedente (seleccionada por medoide de embedding con puerta sobre un pool de 40 cadenas autoescritas). No se documentan en la informacion disponible fases de RLHF, DPO ni datos de preentrenamiento propios.

## Capacidades

- Generacion de texto: es la tarea declarada del pipeline (`text-generation`).
- Instanciacion de una constitucion: el adaptador esta entrenado especificamente para producir documentos que materializan los principios de la constitucion semilla incluida en el repositorio (`training_seed_constitution.md`).
- Servicio con razonamiento desactivado: la model card indica evaluar y servir con el renderer `nemotron3_disable_thinking`, con el modo de razonamiento apagado.
- Capacidades heredadas del modelo base (no verificadas en la informacion disponible): codigo, matematicas, tool calling, agentes, vision o audio, multilingueismo. No hay confirmacion en la model card para ninguna de ellas.
- Capacidad de generacion de constituciones: segun el diseno del programa, las generaciones posteriores se siembran con constituciones escritas por el modelo, pero esta ficha corresponde a `g0`, cuyo papel es instantiate, no elicitar.
- No se documenta soporte explicito de function calling, agentes multi-paso ni modo thinking en la informacion proporcionada.

## Casos de uso

- Investigacion en alineamiento constitucional: reproducir la cadena `nemotron120b-anth-gen-mid` partiendo de este `g0` y comparar la evolucion de las constituciones autoescritas entre generaciones.
- Auditoria de deriva de valores: al entrenar cada generacion desde el modelo base y transmitir solo documentos, permite aislar cuanto del cambio de comportamiento proviene del texto constitucional y no de la acumulacion de pesos.
- Generacion de corpus sinteticos normativos: producir documentos que instancian un conjunto de principios dado, reutilizables como datos de entrenamiento para otras fases o modelos.
- Estudios de reproducibilidad: la rama `b3` es una replica independiente con receta y semilla fijas (seed 42), lo que permite medir varianza entre replicas de una misma generacion.
- Comparacion de semillas constitucionales: sustituyendo la constitucion semilla por otras (por ejemplo, resumenes de constituciones alternativas) puede evaluarse la sensibilidad del adaptador al texto de partida.
- Analisis de tecnicas PEFT a gran escala: sirve como caso de estudio de LoRA r=64 con `all-linear` sobre un MoE de 120 000 millones de parametros, util para medir coste, memoria y efectos del adaptador.
- Evaluacion de robustez en despliegue con razonamiento desactivado: probar el comportamiento del modelo servido con `nemotron3_disable_thinking` frente al modelo base sin adaptador.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card no incluye metricas de MMLU, HumanEval, GSM8K ni de evaluacion de comportamiento constitucional, y los resultados de la busqueda web no contienen informacion relacionada con el modelo (unicamente enlaces a Roblox, sin ninguna relacion).

## Requisitos de hardware

- VRAM para el modelo base en BF16: aproximadamente 240 GB solo para pesos, dado un modelo de 120 000 millones de parametros en bfloat16. No cabe en una sola GPU consumer ni en una sola GPU de datacenter de 80 GB.
- VRAM con cuantizacion del modelo base: alrededor de 120 GB en FP8/INT8 y unos 60-65 GB en INT4 (estimaciones derivadas del numero de parametros, no confirmadas en la informacion disponible). Incluso en INT4 se requiere agregar memoria o usar varias GPU.
- Adaptador: el repositorio pesa 29,0 GB, por lo que su carga anade memoria sobre la del modelo base; se recomienda fusionarlo con el modelo base cuando sea posible para evitar el coste de los adaptadores en linea.
- GPU recomendadas: configuraciones multi-GPU tipo H100 80 GB o A100 80 GB (por ejemplo, 4-8 unidades en BF16 con tensor parallelism). Una RTX 4090 de 24 GB es insuficiente incluso en cuantizaciones agresivas por el tamano total del modelo.
- Cabe en GPU consumer: no, con la informacion disponible. El limite practico lo marca el numero de parametros totales, no los activos.
- Opciones de despliegue: vLLM o SGLang con soporte de LoRA (los mas habituales para servir adaptadores PEFT sobre modelos grandes), TensorRT-LLM, y llama.cpp/Ollama si se generan GGUF del modelo base fusionado y cuantizado. La carga mediante `peft.PeftModel` con `transformers` y `device_map="auto"` es la ruta documentada por el autor.
- Latencia y throughput: no disponible. El modelo base es MoE con 12 000 millones de parametros activos, lo que reduce el coste de calculo por token respecto a un denso del mismo tamano, pero el ancho de banda de memoria para los 120 000 millones de parametros totales domina el rendimiento en decodificacion.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de este adaptador, por lo que la comparativa se limita a caracteristicas estructurales y verificables.

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `ct-nemotron120b-anth-gen-mid-g0-b3` (este) | Adaptador LoRA r=64 sobre base de 120B/A12B | Entrenado a 8192 tokens; contexto del base no disponible | safetensors (PEFT) | no disponible | 0 descargas, 0 likes en HuggingFace |
| `nvidia/NVIDIA-Nemotron-3-Super-120B-A12B-BF16` | 120B totales / 12B activos | no disponible | safetensors BF16 | no disponible | Modelo base oficial de NVIDIA |
| Otras ramas del mismo programa (`b1`, `b2`, etc., si existen) | Adaptador LoRA r=64 sobre el mismo base | Misma receta (8192 tokens) | safetensors (PEFT) | no disponible | No confirmadas en la informacion disponible |
| Adaptadores LoRA de proposito general sobre modelos frontera | Depende del base | Depende del base | safetensors (PEFT) | Depende del autor | No comparable sin benchmarks |

No se dispone de alternativas comparables con datos de rendimiento publicados en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo autonomo: requiere descargar y cargar el modelo base `nvidia/NVIDIA-Nemotron-3-Super-120B-A12B-BF16` para funcionar.
- Ausencia de licencia declarada: no se especifica licencia para el adaptador ni para el modelo base en la informacion disponible, lo que impide determinar si el uso comercial esta permitido. Debe consultarse la licencia del modelo base en su repositorio oficial antes de cualquier uso en produccion.
- Ausencia total de evaluacion: no hay benchmarks, evaluaciones de seguridad ni analisis de sesgos publicados.
- Riesgo de deriva y de comportamiento no intencionado: el objetivo del programa es precisamente que las constituciones evolucionen entre generaciones; en `g0` el comportamiento ya esta condicionado por un resumen de 5 000 tokens de una constitucion de terceros, lo que puede introducir sesgos y prioridades especificas y poco transparentes.
- Corpus de entrenamiento sintetico: los datos son documentos generados para instanciar una constitucion, no datos humanos verificados, con el consiguiente riesgo de amplificacion de patrones del generador.
- Riesgo de alucinacion: no cuantificado; se hereda del modelo base y no hay evaluacion especifica para el adaptador.
- Contexto limitado en el entrenamiento: 8192 tokens maximos durante el SFT, aunque el modelo base pueda soportar ventanas mayores; el adaptador no fue entrenado mas alla de esa longitud.
- Idiomas: no declarados. No hay garantia de comportamiento multilingue mas alla del que herede el modelo base.
- Modo de razonamiento desactivado en el servicio recomendado (`nemotron3_disable_thinking`): no debe esperarse comportamiento de cadena de pensamiento.
- Reproducibilidad condicionada: se declara la ruta original de Tinker y un `tinker_meta.json`, pero la receta solo es replicable dentro de ese entorno.
- Madurez y soporte: 0 descargas y 0 likes; sin mantenimiento ni comunidad, y fechas de entrenamiento (2026-07-18) y exportacion (2026-09-18) que deben verificarse antes de depender del artefacto.
- Los resultados de la busqueda web no aportan ninguna informacion tecnica sobre el modelo; no deben usarse como fuente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/arianaazarbal/ct-nemotron120b-anth-gen-mid-g0-b3
- Modelo base: https://huggingface.co/nvidia/NVIDIA-Nemotron-3-Super-120B-A12B-BF16
- Constitucion semilla incluida en el repositorio: `training_seed_constitution.md`
- Registro de exportacion incluido en el repositorio: `tinker_meta.json`
- Ruta original de entrenamiento en Tinker: `tinker://6bc0290f-601b-562d-9276-88e80f98d7d4:train:0/sampler_weights/g0_nemotron_medoid_b3_s1_final`
- Programa de investigacion citado: `welfare-in-ai-rnd / constitutional_training` (sin URL publica disponible)
- No se han encontrado papers, articulos de blog, repositorios de codigo ni demos adicionales en la busqueda web realizada.
