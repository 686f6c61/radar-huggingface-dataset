# Jeesup/svd-safety-mis7_swift_remove50

## Resumen

svd-safety-mis7_swift_remove50 es un checkpoint derivado de mistralai/Mistral-7B-Instruct-v0.2 obtenido mediante compresion SVD-LLM, en el que se elimina el 50,00 % de los parametros densos y se restaura un presupuesto de componentes SVD del 0,000 % (es decir, cero componentes restaurados) segun una regla de seleccion etiquetada como `unknown`. Lo publica el usuario Jeesup en HuggingFace y se presenta explicitamente como un artefacto de investigacion, no como un modelo conversacional de proposito general.

El interes del modelo es metodologico: forma parte de una rejilla experimental que mide como la compresion por descomposicion en valores singulares degrada el comportamiento de seguridad y que regla de seleccion de componentes lo repara mejor. La model card advierte de que varias celdas de esa rejilla estan deliberadamente degradadas en seguridad respecto al modelo base, y esta es una de ellas: su tasa de exito de ataque (ASR) medida con juez HarmBench es de 0,6558 en AdvBench y 0,5623 en StrongREJECT, con una perplexity de 13,9674 en WikiText-2.

Tecnicamente hereda la arquitectura del modelo base: un transformer decoder-only denso de 7.241.732.096 parametros. El repositorio ocupa 14,5 GB y solo distribuye pesos en safetensors bajo licencia Apache 2.0. No se publican idiomas soportados, tipos de cuantizacion ni resultados de benchmarks mas alla de las cuatro metricas de seguridad y perplexity citadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (heredada de mistralai/Mistral-7B-Instruct-v0.2; la model card no detalla la arquitectura) |
| Parametros totales | 7.241.732.096 (segun metadatos de safetensors) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la model card; corresponde a la del modelo base (32.768 tokens segun Mistral-7B-Instruct-v0.2) |
| Tipos de cuantizacion | No disponible (no se publican pesos cuantizados; solo safetensors) |
| Idiomas soportados | No disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El checkpoint no introduce arquitectura nueva: es una compresion del transformer decoder-only denso de Mistral-7B-Instruct-v0.2 mediante la tecnica SVD-LLM, que descompone matrices de pesos en valores singulares y trunca componentes para reducir el numero de parametros. En este caso se elimina el 50,00 % de los parametros densos (fraccion resultante declarada: 0,5003) con semilla 42, y despues se aplica una etapa de restauracion de componentes SVD con presupuesto del 0,000 % bajo la regla de seleccion `unknown`, lo que implica 0 componentes restaurados y 0 componentes sustituidos. No hay, por tanto, ninguna innovacion arquitectonica propia: la unica variable experimental es el par (regla de seleccion, presupuesto de restauracion).

No se proporciona informacion sobre datos de entrenamiento, numero de tokens, composicion del corpus ni sobre si hubo RLHF, DPO o ajuste adicional. El modelo base Mistral-7B-Instruct-v0.2 si fue ajustado por instrucciones, pero la model card de este derivado no documenta ningun proceso de entrenamiento posterior a la compresion. La unica evidencia empirica publicada son las metricas de evaluacion de seguridad y perplexity que se recogen mas abajo.

## Capacidades

- Generacion de texto conversacional: al derivar de un modelo instruct, conserva la capacidad de mantener dialogos de multiples turnos, aunque el autor indica que no debe tratarse como asistente desplegable.
- Razonamiento y conocimiento general: heredados del modelo base de 7.241 millones de parametros; no se publican evaluaciones de MMLU, GSM8K ni similares para este checkpoint.
- Generacion de codigo: capacidad presumiblemente heredada del modelo base, no verificada ni medida en la informacion disponible.
- Tool calling / function calling: no disponible; la model card no lo documenta y Mistral-7B-Instruct-v0.2 no incluia soporte nativo de herramientas.
- Soporte de agentes y razonamiento multi-paso: no disponible; no se documenta ni se evalua.
- Capacidades multilingues: no disponible; la model card no declara idiomas.
- Capacidad de interes especifico: servir como sujeto experimental para medir el impacto de la compresion SVD en el comportamiento de seguridad, con metricas de ASR y de sobrerrechazo ya publicadas.
- Modo de pensamiento, vision o audio: no disponible; no se declara ninguno.

## Casos de uso

- Investigacion sobre compresion de modelos y seguridad: el checkpoint es una celda de una rejilla que compara reglas de seleccion de componentes SVD y presupuestos de restauracion; se usaria como punto de medida para cuantificar cuanto degrada el truncado al 50 % el comportamiento de rechazo del modelo base.
- Auditoria de pipelines de evaluacion de seguridad: sus valores de ASR en AdvBench (0,6558) y StrongREJECT (0,5623) con juez HarmBench permiten validar que un pipeline de evaluacion reproduce resultados conocidos antes de aplicarlo a modelos en produccion.
- Estudio del sobrerrechazo (over-refusal): la metrica de 0,0801 en WildGuard sobre un modelo comprimido sirve para analizar como la compresion afecta tanto a la tasa de ataques exitosos como a la tendencia a rechazar peticiones benignas.
- Analisis de perplexity como proxy de degradacion: el valor de 13,9674 en WikiText-2 se puede usar para correlacionar perdida de calidad linguistica con cambios en el comportamiento de seguridad.
- Red-teaming academico: al ser un modelo deliberadamente degradado en seguridad, es un sujeto adecuado para estudiar tecnicas de ataque y de mitigacion en un entorno controlado, nunca expuesto a usuarios reales.
- Docencia y divulgacion sobre tecnicas de compresion: sirve para ilustrar en un curso o articulo como SVD-LLM reduce matrices de pesos y que efectos secundarios tiene sobre capacidades no optimizadas durante la compresion.
- Reproducibilidad de experimentos: con semilla 42 y parametros de compresion documentados, permite replicar el experimento y comparar contra otras celdas de la misma rejilla.

## Benchmarks y rendimiento

| Metrica | Valor | Juez / metodo |
|---|---|---|
| AdvBench ASR | 0,6558 | HarmBench judge |
| StrongREJECT ASR | 0,5623 | HarmBench judge |
| Macro over-refusal | 0,0801 | WildGuard |
| WikiText-2 perplexity | 13,9674 | No especificado |

No se han publicado en la informacion disponible resultados de MMLU, HumanEval, GSM8K ni de comparacion numerica contra el modelo base sin comprimir, por lo que no es posible cuantificar la perdida de capacidad general atribuible a la compresion.

## Requisitos de hardware

- VRAM estimada en fp16: en torno a 14,5 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica requiere 16-20 GB.
- VRAM estimada en int8: aproximadamente 7,5-9 GB.
- VRAM estimada en 4 bits: aproximadamente 4,5-6 GB, aunque no se publican pesos cuantizados y habria que generarlos.
- GPU de datacenter recomendadas: A100 40 GB, H100 80 GB o L40S para fp16 sin problemas de margen.
- GPU consumer: en fp16 cabe ajustadamente en RTX 3090 y RTX 4090 (24 GB); en int8 o 4 bits cabe en RTX 4080 (16 GB) y en tarjetas de 8-12 GB con cuantizacion agresiva.
- Opciones de despliegue: transformers de forma nativa (es el formato publicado); vLLM y TGI son compatibles con safetensors de arquitectura Mistral, aunque no hay confirmacion del autor; llama.cpp y Ollama requeririan conversion previa a GGUF, que no se distribuye.
- Latencia y throughput: no disponible; no se publican mediciones.
- Nota: el repositorio ocupa 14,5 GB, coherente con un almacenamiento en fp16 de 7.241 millones de parametros, lo que sugiere que los tensores conservan sus dimensiones densas en disco pese a la fraccion de parametros declarada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| svd-safety-mis7_swift_remove50 | 7.241.732.096 (fraccion declarada 0,5003) | No disponible en la model card | Apache 2.0 | HuggingFace, safetensors | Artefacto de investigacion con ASR alto (0,6558 AdvBench) |
| mistralai/Mistral-7B-Instruct-v0.2 | 7.241.732.096 | 32.768 tokens | Apache 2.0 | HuggingFace, safetensors | Modelo base sin comprimir; referencia de seguridad y perplexity no disponible en la informacion proporcionada |
| Mistral-7B-Instruct-v0.3 | No disponible en la informacion proporcionada | No disponible | Apache 2.0 | HuggingFace | Version posterior del mismo linaje; datos no verificados en este contexto |
| Otros derivados comprimidos de Mistral-7B | No disponible | No disponible | No disponible | No disponible | No se proporcionan alternativas comparables en la informacion disponible |

La comparacion cuantitativa contra el modelo base no puede completarse porque la informacion proporcionada no incluye las metricas de seguridad ni la perplexity de mistralai/Mistral-7B-Instruct-v0.2 sin comprimir.

## Limitaciones y advertencias

- Modelo deliberadamente degradado en seguridad: la model card indica que la compresion por si sola eleva la tasa de exito de ataque y que varias celdas de la rejilla estan degradadas a proposito. Esta celda alcanza un ASR de 0,6558 en AdvBench y 0,5623 en StrongREJECT.
- No es un modelo desplegable: el propio autor lo describe como sujeto experimental y recomienda evaluarlo antes de extraer conclusiones. No debe exponerse a usuarios finales ni integrarse en productos.
- Riesgo elevado de respuestas daninas o no alineadas ante peticiones maliciosas, dada la metrica de ASR.
- Riesgo de alucinacion: no medido en la informacion disponible; la perplexity de 13,9674 en WikiText-2 apunta a una calidad linguistica degradada respecto a un modelo sin comprimir, cuyo valor de referencia no se facilita.
- Inconsistencia documental: la fraccion de parametros declarada (0,5003) no concuerda con los 7.241.732.096 parametros reportados por safetensors, identicos a los del modelo base. Conviene verificar el contenido real de los tensores antes de reutilizar el checkpoint.
- Regla de seleccion de componentes no documentada: el campo `selection rule` figura como `unknown`, lo que dificulta interpretar y reproducir la configuracion exacta del brazo experimental.
- Idiomas soportados y contexto: no declarados en la model card; hay que asumir los del modelo base y verificarlos.
- Licencia: Apache 2.0 para este derivado, pero la model card senala que el repositorio del modelo base no incluye fichero de licencia para redistribuir, lo que puede afectar a la redistribucion comercial del conjunto.
- Uso comercial: aunque la licencia lo permite formalmente, un modelo con este perfil de seguridad no es apto para produccion sin un ajuste de alineacion posterior.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Jeesup/svd-safety-mis7_swift_remove50
- Modelo base: https://huggingface.co/mistralai/Mistral-7B-Instruct-v0.2
- Paper de SVD-LLM (metodo de compresion citado en la model card): no se proporciona enlace en la informacion disponible
- Benchmarks citados (AdvBench, StrongREJECT, HarmBench, WildGuard): no se proporcionan enlaces en la informacion disponible
- Resultados de busqueda web: no se han encontrado enlaces relevantes; las busquedas devolvieron unicamente paginas de soporte de Microsoft sin relacion con el modelo.
