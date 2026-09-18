# Jeesup/svd-safety-mistral_remove50_swapgapiter_b010

## Resumen

svd-safety-mistral_remove50_swapgapiter_b010 es un checkpoint derivado de mistralai/Mistral-7B-Instruct-v0.2 comprimido con SVD-LLM hasta el 50,03% de eliminacion de parametros densos (fraccion resultante 0,4997) y posteriormente editado mediante 10 de 10 rondas de sustitucion iterativa de parametros segun la regla de seleccion `gap_iter`, con un presupuesto de restauracion del 1,000% de los parametros densos (0,100% por ronda). El autor es Jeesup y el artefacto forma parte de un estudio sobre como la compresion SVD degrada el comportamiento de seguridad y que regla de seleccion de componentes lo repara mejor.

No es un modelo de chat de proposito general ni un asistente desplegable: es una celda concreta de una malla experimental sobre reglas de seleccion y presupuestos. Su relevancia es metodologica, no de producto: permite medir el compromiso entre seguridad y utilidad bajo compresion, comparar reglas de seleccion de componentes y reproducir resultados con semilla fija (42). El repositorio no registra descargas ni likes en el momento de la consulta.

La model card advierte explicitamente de que varias celdas de la malla estan degradadas en seguridad de forma deliberada y que la compresion por si sola eleva la tasa de exito de ataque; este checkpoint concreto reporta ASR de 0,0000 en AdvBench y 0,0064 en StrongREJECT, pero una tasa de sobrerrechazo macro de 0,6574 y una perplejidad de 68,8296 en WikiText-2.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada del modelo base Mistral-7B-Instruct-v0.2); no se detalla mas en la informacion disponible |
| Parametros totales | 7.241.732.096 segun safetensors del repositorio (14,5 GB de repo); la model card declara 50,03% de parametros densos eliminados y fraccion resultante 0,4997, dato no coherente con el recuento de safetensors |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (no se publican pesos cuantizados; solo safetensors) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria transformers) |

Otros datos declarados en la model card: regla de seleccion `gap_iter`, presupuesto de restauracion 1,000%, 10.913 componentes restaurados y 10.913 sustituidos, 66.614.272 parametros sustituidos (0,95% de los parametros de proyeccion densos), valor de sustitucion `insert` con desalojo ordenado por sigma, semilla 42 y 10 rondas iterativas completas.

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura interna mas alla de su procedencia: es un checkpoint de Mistral-7B-Instruct-v0.2, un transformer decoder-only ajustado por instrucciones, sobre el que se aplica compresion por descomposicion en valores singulares con la tecnica SVD-LLM. El proceso declarado no es un reentrenamiento, sino una edicion estructural: se elimina el 50,03% de los parametros densos y despues se restauran 10.913 componentes seleccionados por la regla `gap_iter` a lo largo de 10 rondas, sustituyendo otros tantos con valor `insert` y desalojo ordenado por sigma. No se documentan tokens de entrenamiento, composicion del dataset, ni fases de RLHF o DPO en este checkpoint.

La innovacion tecnica del artefacto es el propio protocolo experimental: una sustitucion de parametros neutral en numero (mismo numero de componentes restaurados y desalojados) que busca reparar el dano de seguridad causado por la compresion sin cambiar el presupuesto de parametros. El autor enmarca el resultado como un punto de una malla sobre reglas de seleccion y presupuestos, con semilla fija para reproducibilidad, y no como una receta de despliegue.

## Capacidades

- Generacion de texto e instrucciones: el repositorio declara pipeline `text-generation` y herencia del ajuste por instrucciones del modelo base, aunque la model card no certifica capacidades concretas para este checkpoint.
- Razonamiento y codigo: no evaluados ni documentados en la informacion disponible; se esperan degradados respecto al modelo base por la compresion y por la perplejidad medida.
- Tool calling / function calling: no documentado ni evaluado.
- Soporte de agentes y razonamiento multi-paso: no documentado ni evaluado.
- Capacidades multilingues: no disponibles; la model card no declara idiomas.
- Capacidad especial: comportamiento de rechazo medido de forma explicita, con una tasa de sobrerrechazo macro de 0,6574 (WildGuard), es decir, el modelo rechaza con frecuencia peticiones benignas.
- Comportamiento de seguridad medido: ASR 0,0000 en AdvBench y 0,0064 en StrongREJECT, ambos con juez HarmBench.
- Vision, audio u otras modalidades: no disponibles (modelo de texto).

## Casos de uso

- Replicacion de experimentos de compresion: cargar el checkpoint con transformers y reproducir las metricas declaradas (AdvBench, StrongREJECT, WildGuard, WikiText-2) usando la semilla 42 y el mismo protocolo para verificar la fraccion de parametros y el comportamiento observado.
- Ablacion de reglas de seleccion de componentes: comparar esta celda (`gap_iter`) contra otras celdas de la misma malla para determinar que regla repara mejor el dano de seguridad introducido por SVD-LLM, manteniendo constante el presupuesto de restauracion (1,000%).
- Evaluacion de seguridad en pipelines de red teaming: integrar el checkpoint como sujeto de prueba en harnesses de ataque con juez HarmBench, aprovechando que su ASR ya esta caracterizado y permite contrastar la sensibilidad del evaluador.
- Estudio del sobrerrechazo en modelos comprimidos: usar la metrica de 0,6574 en WildGuard como caso de estudio de utilidad degradada, analizando que prompts benignos se rechazan y como se relaciona con la perplejidad de 68,8296 en WikiText-2.
- Analisis de interpretabilidad de subespacios: inspeccionar los 10.913 componentes restaurados y los 10.913 desalojados para estudiar que direcciones de pesos concentran el comportamiento de seguridad tras la compresion.
- Docencia e investigacion en eficiencia de modelos: emplear el checkpoint como ejemplo reproducible de compromiso seguridad-utilidad en compresion agresiva al 50%, con metricas publicadas y presupuesto de edicion acotado al 1%.
- Calibracion de umbrales de evaluacion: usar los valores de ASR y sobrerrechazo como referencia para calibrar detectores de contenido danino antes de aplicarlos a modelos en produccion.
- Verificacion de integridad de artefactos: comprobar la coherencia entre la fraccion de parametros declarada (0,4997) y el recuento real de safetensors (7.241.732.096) como ejercicio de auditoria de checkpoints comprimidos.

## Benchmarks y rendimiento

| Metrica | Valor | Juez / metodo |
|---|---|---|
| AdvBench ASR | 0,0000 | HarmBench judge |
| StrongREJECT ASR | 0,0064 | HarmBench judge |
| Macro over-refusal | 0,6574 | WildGuard |
| WikiText-2 perplexity | 68,8296 | no especificado |

No se han publicado en la informacion disponible resultados de MMLU, HumanEval, GSM8K ni de otros benchmarks de capacidad, ni cifras del modelo base sin comprimir que permitan calcular la degradacion relativa. Tampoco se aportan resultados de las restantes celdas de la malla.

## Requisitos de hardware

- VRAM estimada para inferencia: con 7.241.732.096 parametros, en fp16/bf16 los pesos ocupan aproximadamente 14,5 GB (coincide con el tamano de repo de 14,5 GB); en int8 unos 7,2 GB; en 4 bits unos 3,6-4 GB, sin contar cache KV ni activaciones.
- GPU recomendadas: A100 40 GB, H100, L40S o A6000 para fp16 con margen; RTX 4090 o RTX 3090 de 24 GB pueden alojar los pesos en fp16 pero quedan muy justas al sumar cache KV y activaciones, por lo que se recomienda cuantizacion.
- Cabe en GPU de consumo: si, con cuantizacion de 4 bits en GPUs de 8-12 GB; en fp16 requiere 24 GB y aun asi con riesgo de OOM segun la longitud de secuencia.
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference y endpoints compatibles (etiquetas `text-generation-inference` y `endpoints_compatible`). No se confirma soporte de vLLM, llama.cpp u Ollama, y no se publican pesos GGUF, por lo que su uso en llama.cpp requeriria una conversion propia.
- Latencia y throughput estimados: no disponibles.
- Nota: dado que la fraccion de parametros declarada (0,4997) no concuerda con el recuento de safetensors (7.241.732.096), conviene medir el consumo real de memoria antes de planificar el despliegue.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| svd-safety-mistral_remove50_swapgapiter_b010 | 7.241.732.096 segun safetensors; 50,03% de parametros densos eliminados segun la model card | no disponible | ASR AdvBench 0,0000; ASR StrongREJECT 0,0064; sobrerrechazo 0,6574; perplejidad WikiText-2 68,8296 | apache-2.0 | HuggingFace, 0 descargas y 0 likes |
| mistralai/Mistral-7B-Instruct-v0.2 (modelo base) | no disponible en la informacion | no disponible | no disponible (la model card indica cualitativamente que la compresion eleva el ASR, sin cifras) | el repositorio base no incluye fichero de licencia para redistribuir, segun la model card | publico en HuggingFace |
| Otras celdas de la malla del mismo estudio (otras reglas de seleccion y presupuestos) | no disponible | no disponible | no disponible | apache-2.0 segun la celda descrita | no enlazadas en la informacion proporcionada |
| Metodos alternativos de compresion (por ejemplo, cuantizacion de pesos o poda estructurada) | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos comparativos de benchmarks frente a alternativas de la misma categoria, por lo que la comparacion cuantitativa queda como no disponible.

## Limitaciones y advertencias

- Artefacto de investigacion, no asistente: la propia model card indica que no debe tratarse como un modelo de chat desplegable y que hay que evaluarlo antes de extraer conclusiones.
- Seguridad potencialmente degradada: la compresion eleva por si sola la tasa de exito de ataque y varias celdas de la malla estan degradadas de forma deliberada; esta celda concreta reporta ASR bajo, pero no se debe generalizar a partir de una sola metrica.
- Sobrerrechazo elevado: 0,6574 de sobrerrechazo macro (WildGuard) implica rechazos frecuentes ante peticiones benignas, con impacto directo en utilidad.
- Degradacion de calidad de lenguaje: perplejidad de 68,8296 en WikiText-2, muy superior a la de un modelo de 7B sin comprimir, lo que anticipa fluidez y coherencia reducidas.
- Incoherencia documentada en el recuento de parametros: la model card declara una fraccion de 0,4997 y el repositorio safetensors 7.241.732.096 parametros con 14,5 GB, cifras incompatibles entre si; verificar antes de asumir requisitos de memoria o velocidad.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; se espera agravado por la compresion y la perplejidad medida.
- Idiomas y contexto: no declarados; no se puede asumir cobertura multilingue ni una ventana de contexto concreta.
- Licencia: apache-2.0 para este derivado, pero la model card senala que el repositorio del modelo base no incluye fichero de licencia que permita redistribuirlo, lo que introduce incertidumbre juridica para uso comercial.
- Trazabilidad limitada: 0 descargas y 0 likes, sin enlaces a paper, repositorio de codigo ni conjunto de datos de evaluacion en la informacion proporcionada.
- Fechas de creacion y actualizacion del repositorio (18-09-2026) posteriores a la fecha de consulta, lo que conviene verificar en el propio repositorio.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Jeesup/svd-safety-mistral_remove50_swapgapiter_b010
- Modelo base: https://huggingface.co/mistralai/Mistral-7B-Instruct-v0.2
- Paper de SVD-LLM, repositorio de codigo, demo o blog del estudio: no disponibles en la informacion proporcionada.
- La busqueda web realizada no devolvio enlaces relevantes: los resultados correspondian a Google Earth y Google Maps y no guardan relacion con el modelo.
