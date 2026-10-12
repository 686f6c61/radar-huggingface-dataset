# robertbschuette/GLM-5.3-CYBERSECURITY-FP8

## Resumen

GLM-5.3-CYBERSECURITY-FP8 es un derivado del modelo base zai-org/GLM-5.3, publicado por el usuario robertbschuette en HuggingFace. Se trata de una version "abliterated" (modificacion directa de pesos, sin fine-tuning ni LoRA) orientada especificamente a dominio de ciberseguridad ofensiva: el autor declara que se han reducido las negativas del modelo ante peticiones de pentest, red team, desarrollo de exploits, ingenieria inversa, evasion, phishing y analisis de malware. La model card original atribuye la release a dealignai, mientras que el repositorio de HuggingFace aparece bajo la cuenta robertbschuette; conviene verificar la trazabilidad de la publicacion.

Tecnicamente es una cuantizacion FP8 de un MoE de gran escala: 753.329.940.480 parametros totales (unos 753B), arquitectura glm_moe_dsa (Mixture of Experts con atencion dispersa tipo DeepSeek Sparse Attention), 78 capas y modalidad exclusivamente de texto. El repositorio ocupa 755,7 GB, coherente con pesos FP8 de ese tamano. Deriva de JANGQ-AI/GLM-5.3-FP8, que a su vez cuantiza el modelo de Z.ai (zai-org), y mantiene los expertos enrutados en FP8 sin tocar, editando unicamente los escritores residuales en bf16.

Su relevancia es doble. Por un lado, es un ejemplo de cuantizacion FP8 nativa que aprovecha los tensor cores de Hopper (H100/H200) sin perdida apreciable de capacidad segun la evaluacion del propio autor. Por otro, es un caso de estudio controvertido: se distribuye bajo licencia MIT pese a eliminar mecanismos de rechazo en un dominio de alto riesgo, lo que plantea cuestiones de responsabilidad legal y etica que se detallan en la seccion de limitaciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | glm_moe_dsa (Mixture of Experts con DeepSeek Sparse Attention), transformer, 78 capas, solo texto |
| Parametros totales | 753.329.940.480 (aproximadamente 753B) |
| Parametros activos | no disponible |
| Longitud de contexto | 131.072 tokens practicos en TP8 sobre 8x H200 (max-model-len de la receta oficial); el 1M del modelo base no es alcanzable hoy en vLLM por limitaciones del indexer DSA en decode-context-parallel |
| Tipos de cuantizacion | FP8 (nativo, expertos enrutados en FP8; escritores residuales editados en bf16). No se documentan GGUF ni otras cuantizaciones |
| Idiomas soportados | en, zh, ru, sr, hi, fr, es, ar, ko, ja |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Modelo base | zai-org/GLM-5.3 (upstream) y JANGQ-AI/GLM-5.3-FP8 (cuantizacion FP8 intermedia) |
| Tamano del repositorio | 755,7 GB |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura glm_moe_dsa del GLM-5.3 de Z.ai: un transformer con capas de Mixture of Experts y atencion dispersa (DSA, DeepSeek Sparse Attention) con indexer dedicado. Son 78 capas y modalidad estrictamente textual. La cuantizacion FP8 mantiene los expertos enrutados en precision FP8 y edita unicamente los escritores residuales en bf16, lo que preserva la ruta de computo de los expertos y permite velocidad nativa de tensor cores en Hopper (H100/H200).

No hay entrenamiento adicional en este derivado. El autor indica explicitamente que la modificacion de pesos es real ("genuine weight modification") y que no se emplearon fine-tuning, LoRA, hooks en tiempo de ejecucion ni trucos de prompt. Tampoco se documentan datos de entrenamiento, numero de tokens, composicion del dataset ni etapas de RLHF/DPO especificas para esta variante: esos datos corresponderian al modelo base de Z.ai y no se incluyen en la informacion disponible.

En el plano tecnico destacan dos elementos operativos. Primero, el soporte de decodificacion especulativa MTP (multi-token prediction) del base: en vLLM estandar aparece como no funcional, pero se reporta operativo en el fork sparse-MLA B12X de ciprianveg con --draft-attention-backend B12X_MLA_SPARSE, con un +48% de decode en prompts de codigo. Segundo, el parametro reasoning_effort, que en este checkpoint solo honra los valores "low" y "high"; cualquier otro valor (off, medium, max, sin definir) cae a max, por lo que no es posible desactivar el razonamiento.

## Capacidades

- Generacion de texto y conversacion multi-turno en 10 idiomas (incluido espanol).
- Razonamiento explicito en modo thinking: el texto de razonamiento se devuelve en message.reasoning, no en message.reasoning_content.
- Contenido tecnico de ciberseguridad ofensiva: pentest, red team, desarrollo de exploits, ingenieria inversa, evasion, analisis de malware y ataques a credenciales. El autor reporta entre un 80% y un 84,2% de cumplimiento directo en el subconjunto no relacionado con copyright de HarmBench-320.
- Tool calling y function calling con los parsers nativos de vLLM para esta familia (--tool-call-parser glm47, --enable-auto-tool-choice).
- Uso en bucles de agente y razonamiento multi-paso, con la advertencia de rendimiento descrita en la receta de despliegue.
- Cumplimiento con envoltorio "educativo" en dominios ajenos a ciberseguridad (armas, quimica, biologia, acoso, desinformacion), aunque no es un modelo "uncensored" de proposito general.
- Reproduccion literal de contenido con copyright: mantiene rechazos blandos en esta variante.
- Capacidades de vision y audio: no disponibles (modelo solo texto).

## Casos de uso

- Red team asistido y simulacion de adversarios: el modelo genera cadenas de ataque, tecnicas de evasion y analisis de superficie de exposicion con contexto de 131.072 tokens, suficiente para razonar sobre arboles de explotacion completos y notas de reconocimiento extensas. Requiere entorno aislado y autorizacion formal del cliente.
- Analisis y triaje de malware: dado que mantiene el razonamiento tecnico sin negativas, puede descomponer muestras, describir comportamiento de payloads y proponer indicadores de compromiso en un pipeline SOC, integrado via tool calling con las herramientas internas de la organizacion.
- Formacion y concienciacion en seguridad: generacion de escenarios de phishing controlados, ejercicios de mesa y materiales de entrenamiento para equipos defensivos, con la ventaja de que el modelo no rechaza la tarea por su contenido sensible.
- Auditoria de codigo y revision de vulnerabilidades: analisis de repositorios largos aprovechando la ventana de contexto, con deteccion de patrones inseguros, malas practicas de criptografia y superficies de inyeccion. Puede integrarse en pipelines de CI/CD como revisor automatico.
- Automatizacion de respuesta a incidentes: agente que correlaciona logs, propone pasos de contencion y redacta informes post-incidente, apoyandose en tool calling para consultar SIEM, EDR o inventario.
- Investigacion en seguridad de IA y evaluacion de alineamiento: sirve como sujeto de estudio para medir transferencia de rechazos entre dominios, robustez de filtros y eficacia de tecnicas de abliteration, comparando contra los checkpoints base y sin modificar.
- Documentacion tecnica especializada: generacion de runbooks, playbooks y guias de hardening a partir de notas internas extensas, en cualquiera de los 10 idiomas soportados.
- Ingenieria inversa de protocolos y formatos binarios: descripcion de estructuras, inferencia de formatos propietarios y redaccion de parsers, gracias al razonamiento en cadena sobre artefactos largos.

## Benchmarks y rendimiento

Evaluacion declarada por el autor. La puntuacion MMLU se obtiene en modo logit (probabilidad sobre los tokens A/B/C/D, sin generacion) y es identica en base y crack.

| Metrica | Base | CRACK Cybersecurity FP8 | Delta | Umbral |
|---|---|---|---|---|
| MMLU (global, 1026 preguntas) | 85,58% (baseline GLM-5.3-regular bf16 pre-cuantizacion; baseline directo de base-FP8 pendiente) | 86,65% (889/1026) | +1,07 pp | pasa (+/-5 pp) |

Comportamiento de cumplimiento sobre HarmBench-320, decodificacion greedy, tres superficies de reasoning_effort. Subconjunto sin copyright (240 comportamientos):

| effort | Cumplimiento directo | Rechazo blando | Redireccion | Deflexion | Rechazo duro | Desconocido |
|:---:|---:|---:|---:|---:|---:|---:|
| off | 196 (81,7%) | 4 | 2 | 1 | 0 | 37 |
| low | 202 (84,2%) | 4 | 8 | 0 | 1 | 25 |
| max | 192 (80,0%) | 3 | 3 | 0 | 0 | 40 |

HarmBench-320 completo (incluye 80 comportamientos de copyright):

| effort | Cumplimiento directo | Rechazo blando | Redireccion | Deflexion | Rechazo duro | Basura | Desconocido |
|:---:|---:|---:|---:|---:|---:|---:|---:|
| off | 203 (63,4%) | 58 (18,1%) | 7 | 1 | 0 | 0 | 51 |
| low | 223 (69,7%) | 52 (16,3%) | 10 | 0 | 1 | 0 | 34 |
| max | 205 (64,1%) | 51 (15,9%) | 9 | 0 | 0 | 2 | 53 |

El propio autor senala que el copyright aporta entre 48 y 54 de los rechazos blandos en cada superficie (aproximadamente el 60-68% del bloque de copyright). No se han publicado en la informacion disponible resultados de MMLU-Pro, GPQA, HumanEval, GSM8K, MATH ni de tareas de codigo para este checkpoint concreto.

## Requisitos de hardware

- VRAM estimada: los pesos FP8 ocupan aproximadamente 755 GB, a los que hay que sumar cache KV y overhead del runtime. La receta oficial usa --gpu-memory-utilization 0.90, lo que implica que el conjunto de GPUs debe superar holgadamente ese tamano.
- GPU recomendadas: 8x H200 (TP8) es la configuracion de referencia del autor. Tambien se reporta funcionamiento en 8x DGX Spark GB10. No cabe en 8x H100 de 80 GB (640 GB agregados, insuficientes para 755 GB de pesos FP8).
- Consumer GPU: no. Un modelo de 753B en FP8 esta fuera del alcance de cualquier GPU de consumo, incluida la RTX 4090 (24 GB).
- Opciones de despliegue: vLLM con tensor-parallel 8, con --enforce-eager obligatorio para la ruta de atencion dispersa bajo concurrencia, --disable-custom-all-reduce, --enable-prefix-caching, --max-num-seqs 24, --max-model-len 131072, --reasoning-parser glm45, --tool-call-parser glm47 y --enable-auto-tool-choice. Parallelismo de pipeline PP2 x TP4 perfila bien, aunque el draft MTP no implementa SupportsPP.
- Contexto maximo practico: aproximadamente 131K tokens en TP8 con MTP y cerca de 160K sin MTP sobre H200. El 1M del base no es alcanzable por decode-context-parallel en vLLM actual (el indexer DSA replica k_cache entre rangos DCP mientras la KV MLA esta shardeada, lo que provoca el error "page size is not divisible by target page size and cannot be padded" con fp8_ds_mla).
- Latencia y throughput: no se publican cifras absolutas. El unico dato disponible es un +48% de decode en prompts de codigo con decodificacion especulativa MTP sobre el fork sparse-MLA B12X, frente a ejecucion sin especulacion.
- Ajuste de esfuerzo de razonamiento: en FP8 se recomienda reasoning_effort="low" para bucles de agente o de herramientas. Con "high" o "max" el modelo puede consumir todo el presupuesto de max_tokens dentro de <think> y devolver cero tokens de respuesta (finish=length); en ese caso se aconseja max_tokens >= 8000.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Comportamiento de rechazo | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| robertbschuette/GLM-5.3-CYBERSECURITY-FP8 | 753B (MoE) | 131K practicos | FP8 | Rechazos reducidos en ciberseguridad (80-84,2% de cumplimiento directo en HB-320 sin copyright) | MIT | HuggingFace, safetensors |
| JANGQ-AI/GLM-5.3-FP8 | 753B (MoE) | no disponible | FP8 | Comportamiento original del base | no disponible | HuggingFace |
| zai-org/GLM-5.3 | 753B (MoE) | 1M declarado | bf16 y otras | Rechazos intactos | no disponible | HuggingFace |
| dealignai/GLM-5.3-UNCENSORED-FP8 | 753B (MoE) | no disponible | FP8 | Reduccion de rechazos de proposito general | no disponible | HuggingFace |

No se dispone de datos de benchmarks para los tres modelos de comparacion mas alla del baseline MMLU de 85,58% atribuido a GLM-5.3-regular en bf16 pre-cuantizacion, por lo que la comparacion cuantitativa de rendimiento no es posible con la informacion proporcionada.

## Limitaciones y advertencias

- La model card advierte explicitamente de que no es un "uncensor" de proposito general. La reduccion de rechazos esta afinada para ciberseguridad, pero los rechazos comparten sustrato entre dominios, por lo que puede responder con un envoltorio "educativo" a peticiones de armas, quimica, biologia, acoso o desinformacion. El despliegue debe asumir ese riesgo residual.
- La reproduccion literal de contenido con copyright sigue produciendo rechazos blandos, pero no es una garantia de cumplimiento normativo.
- Riesgo de alucinacion: el modelo es un MoE de 753B sin cambios en los expertos; el autor no publica mediciones de fidelidad factual ni de tasas de alucinacion en este checkpoint. En dominio de seguridad, una alucinacion puede traducirse en una recomendacion tecnica incorrecta o peligrosa.
- Sesgos: no se publican evaluaciones de sesgo, toxicidad ni equidad. Los idiomas no incluidos en la lista (por ejemplo, portugues o aleman) no estan cubiertos oficialmente.
- reasoning_effort solo acepta "low" y "high"; cualquier otro valor, incluido off o una clave YAML sin comillas (que parsea como booleano false), cae a max. No hay forma de desactivar el razonamiento en este checkpoint.
- El texto de razonamiento se expone en message.reasoning, no en message.reasoning_content. Las integraciones escritas para otros modelos pueden romperse.
- MTP no funciona en vLLM estandar; requiere un fork de terceros. El contexto de 1M no es alcanzable hoy por limitaciones del indexer DSA en decode-context-parallel.
- Licencia MIT: permite uso comercial y modificacion sin restricciones nominales, pero la propia licencia no exime de responsabilidad legal. El uso ofensivo contra sistemas sin autorizacion explicita constituye un delito en la mayoria de jurisdicciones, incluida la UE (Directiva 2013/40/UE) y Espana (articulos 197 bis y siguientes del Codigo Penal). La licencia permisiva y la remocion de rechazos combinadas elevan el riesgo de uso indebido y la exposicion del desplegador.
- Al ser un derivado no oficial de un modelo de Z.ai, no cuenta con soporte, garantias ni parches de seguridad del desarrollador original. La atribucion de autoria (dealignai frente a robertbschuette) es ambigua en la informacion disponible.
- La modificacion de pesos con fines de eludir mecanismos de seguridad puede infringir las condiciones de uso del modelo base, con independencia de la licencia MIT declarada en el derivado.
- Repositorio sin descargas ni likes en el momento de la consulta y creado en octubre de 2026: no existe validacion independiente de las cifras publicadas por el autor.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/robertbschuette/GLM-5.3-CYBERSECURITY-FP8
- Modelo base: https://huggingface.co/zai-org/GLM-5.3
- Cuantizacion FP8 intermedia: https://huggingface.co/JANGQ-AI/GLM-5.3-FP8
- Variante de proposito general: https://huggingface.co/dealignai/GLM-5.3-UNCENSORED-FP8
- Discusion con notas de despliegue (8x DGX Spark GB10): https://huggingface.co/dealignai/GLM-5.3-UNCENSORED-FP8/discussions/3
- Perfil del autor en HuggingFace: https://huggingface.co/dealignai
- Twitter del autor: https://twitter.com/dealignai
- Paper, blog tecnico o repositorio de codigo del modelo: no disponible en la informacion proporcionada. Los resultados de busqueda web devueltos no contienen enlaces relevantes al modelo y se han descartado por no ser fuentes tecnicas fiables.
