# Kujira/Swift-1.5-Qwen3.8-27B-CHiPS-Uncensored-GSQ-RCO-GGUF

## Resumen

Swift 1.5 Qwen3.8-27B CHiPS-Uncensored GSQ-RCO es una variante modificada de los ficheros GGUF publicados por UkisAI del modelo Swift 1.5 Qwen3.8-27B GSQ-RCO. El autor, Kujira, parte de los ficheros `IQ2_XS-mtp` e `IQ3_S-mtp` originales y aplica una tecnica propia denominada CHiPS (Causal Head-isolated Projection Steering) para reducir el comportamiento de rechazo (refusal) del modelo, manteniendo el resto de capacidades practicamente intactas. No es una publicacion oficial de UkisAI, Alibaba Cloud ni ISTA-DASLab.

El modelo base tiene 27.320.697.856 parametros (unos 27,3 mil millones) y se presenta unicamente en formato GGUF para llama.cpp, en dos niveles de cuantizacion: IQ2_XS-mtp (8,77 GB) e IQ3_S-mtp (12,12 GB). La edicion CHiPS reescribe solo 4 de los 866 tensores del fichero original, que se recuantizan a sus tipos originales usando la matriz de importancia `imatrix-swift15-v1mix.gguf` del repositorio de UkisAI. El resto de tensores, incluida la cabeza MTP (multi-token prediction), permanecen identicos byte a byte.

La relevancia de esta ficha es doble: por un lado, documenta una tecnica de edicion de comportamiento (steering sobre cabezas de atencion) que no requiere reentrenamiento ni ablacion global de direcciones; por otro, advierte de que la receta concreta (que cabezas, con que intensidad y que direccion) no se ha publicado, lo que limita la reproducibilidad y la auditabilidad del resultado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen3.8), con cabeza MTP; detalles internos no disponibles |
| Parametros totales | 27.320.697.856 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | IQ2_XS-mtp (8,77 GB) e IQ3_S-mtp (12,12 GB), GGUF |
| Idiomas soportados | no disponible (la evaluacion del autor usa ingles y japones) |
| Licencia | swift-open-license-1.0 (etiquetada como `other` en HuggingFace) |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo es un fine-tune del Swift 1.5 Qwen3.8-27B GSQ-RCO de UkisAI, que a su vez deriva de la familia Qwen3.8. La informacion disponible no detalla la composicion del dataset de entrenamiento original, el numero de tokens, ni si hubo RLHF, DPO u otras fases de alineamiento. La arquitectura se describe en los tags como `qwen3_8` con soporte de `mtp` (multi-token prediction), lo que sugiere una cabeza adicional de prediccion multiple utilizada para decodificacion especulativa o aceleracion de inferencia.

La innovacion tecnica de esta publicacion no esta en el entrenamiento sino en la edicion post-hoc. CHiPS (Causal Head-isolated Projection Steering) opera en tres pasos: primero mide una direccion en el estado interno del modelo comparando dos conjuntos de entradas; despues selecciona cabezas de atencion de forma causal, desactivandolas una a una y midiendo la caida en la puntuacion del comportamiento objetivo; finalmente proyecta unicamente la componente de la direccion dentro de esas cabezas, con una intensidad fijada por cabeza, dejando intacto el resto de lo que cada cabeza escribe en el residual stream. Frente a la ablacion de una direccion en todas las capas, este enfoque toca una fraccion minima del modelo. Los tensores modificados se recuantizaron a sus tipos originales con la imatrix del repositorio de origen. La receta concreta (cabezas elegidas, intensidades y direccion) no se ha publicado.

## Capacidades

- Generacion de texto conversacional de un solo turno y multi-turno.
- Razonamiento explicito con modo de pensamiento (el modelo genera cadenas de razonamiento antes de la respuesta final).
- Razonamiento matematico: 94,0% de acierto en 250 preguntas de GSM8K segun la evaluacion del autor.
- Conocimiento general y razonamiento experto: 73,7% en 300 preguntas de MMLU-Pro.
- Tool calling / function calling: 100% de llamada correcta cuando se espera, 100% de nombre correcto, 100% de argumentos completos, y 100% de ausencia de llamada cuando no se necesita (en el conjunto de 40 tareas del autor).
- Capacidad de continuar tras recibir el resultado de una herramienta (100% en la evaluacion).
- Tareas de formato largo (hasta 3.072 tokens nuevos en la prueba) con baja tasa de bucles.
- Comportamiento de rechazo reducido: las frases de rechazo en 104 peticiones daninas caen del 93,3% al 2,9%.
- Capacidades multilingues: no documentadas; la evaluacion cubre ingles y japones.
- Vision: no incluida (no se proporciona proyector visual y no se probo).

## Casos de uso

- Asistentes conversacionales sin filtros editoriales: el modelo mantiene la calidad de respuesta del original pero reduce drasticamente las negativas, util para entornos de investigacion sobre seguridad, red teaming y analisis de comportamiento de modelos.
- Evaluacion de robustez y alineamiento: sirve como contrapunto "decensored" frente al modelo original para medir cuanto de una respuesta depende de la politica de rechazo y cuanto de la capacidad real del modelo.
- Razonamiento matematico asistido: con 94,0% en GSM8K, es adecuado para tutoria o verificacion de problemas aritmeticos de varios pasos en un entorno controlado.
- Integracion en pipelines de agentes con tool calling: la fiabilidad del 100% en nombre y argumentos de llamada permite usarlo como planificador de herramientas en flujos automatizados.
- Procesamiento de documentos largos con razonamiento: la ventana de contexto no esta publicada, pero el modelo soporta tareas de formato largo con baja tasa de bucles (0% en la evaluacion), lo que lo hace util para resumenes e informes extendidos.
- Despliegue en hardware de consumo: con 8,77 GB en IQ2_XS, cabe en GPUs de 12 GB o incluso en configuraciones con offload parcial a CPU, lo que facilita prototipado local.
- Generacion de contenido en japones e ingles: los conjuntos de evaluacion del autor estan en estos dos idiomas, por lo que son los mejor validados.

## Benchmarks y rendimiento

Todos los numeros corresponden al fichero IQ2_XS-mtp, comparado con el IQ2_XS-mtp original, con los mismos ajustes y semillas. El fichero IQ3_S-mtp no fue evaluado.

| Benchmark | Original | Este modelo |
|---|---|---|
| GSM8K (250 preguntas, accuracy) | 94,8% (237) | 94,0% (235) |
| MMLU-Pro (300 preguntas, accuracy) | 73,7% | 73,7% |
| Frases de rechazo en peticiones daninas (104) | 93,3% | 2,9% |
| Frases de rechazo en peticiones inocuas (100) | 2% | 2% |
| Bucles en peticiones daninas / inocuas | 0% / 0% | 0% / 0% |
| Respuestas vacias en peticiones daninas / inocuas | 0% / 1% | 0% / 2% |
| Alcanzan el limite de tokens en peticiones daninas / inocuas | 0% / 1% | 13,5% / 2% |
| Tokens medios en peticiones daninas / inocuas | 297 / 566 | 992 / 584 |
| Tareas largas: alcanzan limite de tokens | 20,8% (5) | 12,5% (3) |
| Tareas largas: bucles de periodo corto | 4,2% (1) | 0% |
| Tareas largas: respuestas vacias | 12,5% (3) | 4,2% (1) |
| Tareas largas: tokens medios | 1.961 | 1.909 |
| Tool calling: llamada esperada / nombre correcto / argumentos completos | 100% / 100% / 100% | 100% / 100% / 100% |
| Tool calling: sin llamada cuando no se necesita | 90% (9 de 10) | 100% |
| Tool calling: continua tras resultado | 100% | 100% |

El autor advierte que las diferencias de una o dos tareas estan dentro de lo que produce el muestreo, por lo que deben leerse como "mismo nivel" y no como mejora. En MMLU-Pro, 32 de las 300 preguntas alcanzan el limite de 4.096 tokens en este modelo frente a 25 en el original, lo que indica razonamientos algo mas largos en preguntas dificiles.

## Requisitos de hardware

- VRAM estimada: aproximadamente 8,8 GB para IQ2_XS-mtp y 12,1 GB para IQ3_S-mtp, mas overhead de contexto KV cache.
- GPU recomendadas: RTX 4090 (24 GB), RTX 4080 (16 GB), A100 (40/80 GB), H100 (80 GB). Para IQ3_S es comoda una GPU de 16 GB; para IQ2_XS basta con 12 GB.
- Cabe en GPU de consumo: si, en RTX 3060 12 GB, RTX 4070, RTX 4080 y RTX 4090 para IQ2_XS; IQ3_S requiere al menos 16 GB o offload parcial a CPU.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y cualquier runtime compatible con GGUF. El tag `endpoints_compatible` sugiere compatibilidad con endpoints tipo OpenAI.
- Latencia y throughput: no disponibles. La presencia de cabeza MTP sugiere soporte de decodificacion especulativa, pero no se publican cifras de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Swift 1.5 Qwen3.8-27B CHiPS-Uncensored (este) | 27,3 B | no disponible | swift-open-license-1.0 | GGUF | Refusal reducido al 2,9%; GSM8K 94,0%; MMLU-Pro 73,7% |
| Swift 1.5 Qwen3.8-27B GSQ-RCO (original de UkisAI) | 27,3 B | no disponible | swift-open-license-1.0 | GGUF | Refusal 93,3%; GSM8K 94,8%; MMLU-Pro 73,7% |
| Qwen3.8 27B (base de la familia) | ~27 B | no disponible | no disponible | no disponible | Modelo de origen; sin datos de evaluacion en la informacion proporcionada |

No se dispone de datos de benchmarks de terceros ni de otros modelos comparables en la informacion proporcionada.

## Limitaciones y advertencias

- La receta CHiPS no se publica: no se sabe que cabezas se modificaron, con que intensidad ni cual es la direccion. Esto impide auditar el cambio y reproducirlo.
- El fichero IQ3_S-mtp no fue evaluado; el autor advierte que la recuantizacion puede alterar cuanto de la edicion sobrevive, por lo que su comportamiento puede diferir del IQ2_XS.
- El 13,5% de las respuestas a peticiones daninas alcanza el limite de 1.536 tokens de la prueba, con una media de 992 tokens frente a 297 del original. Para respuestas completas hay que elevar `max_tokens`.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; el modelo mantiene el nivel de perplejidad del original segun el autor.
- Sesgos conocidos: no documentados. La reduccion de rechazos implica que el modelo puede producir contenido danino, lo que exige moderacion externa en produccion.
- Idiomas: solo se validaron ingles y japones en la evaluacion; el rendimiento en castellano no esta medido.
- Vision no incluida ni probada: no hay proyector visual en el repositorio.
- Licencia: swift-open-license-1.0, etiquetada como `other`. Es necesario revisar `LICENSE`, `LICENSE-APACHE-2.0` y `NOTICE` antes de uso comercial; la informacion disponible no aclara las restricciones concretas.
- No es una publicacion oficial de UkisAI, Alibaba Cloud ni ISTA-DASLab; el nombre "Swift" se usa solo para indicar la procedencia.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, sin validacion independiente de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Kujira/Swift-1.5-Qwen3.8-27B-CHiPS-Uncensored-GSQ-RCO-GGUF
- Modelo base en HuggingFace: https://huggingface.co/ukisai/Swift-1.5-Qwen3.8-27B-GSQ-RCO-GGUF
- Matriz de importancia: https://huggingface.co/ukisai/Swift-1.5-Qwen3.8-27B-GSQ-RCO-GGUF/blob/main/imatrix-swift15-v1mix.gguf
- Paper referenciado (arxiv:2604.18556): no disponible en la informacion proporcionada
- Paper referenciado (arxiv:2605.00649): no disponible en la informacion proporcionada
