# leobianco/npov_SFT_Mistral-7B-Instruct-v0_3_S130104_epo3_lr1_5e-03_r8_2609211248

## Resumen

Este repositorio contiene un ajuste fino supervisado (SFT) del modelo mistralai/Mistral-7B-Instruct-v0.3, publicado por el usuario leobianco. Se trata de un modelo derivado, no de un entrenamiento desde cero: parte de los pesos de Mistral 7B Instruct v0.3 y los adapta mediante la librería TRL (versión 1.9.2) sobre un dataset que no se documenta en la model card. El nombre del repositorio codifica la configuracion del experimento (SFT, 3 epochs, learning rate 1,5e-3, r8, junto a un identificador de ejecucion), aunque la model card no detalla ni el dataset ni el metodo de adaptacion.

El modelo hereda por tanto la arquitectura del base: un transformer decoder-only de aproximadamente 7.250 millones de parametros, con Grouped Query Attention (GQA), atención de ventana deslizante (sliding window attention) y una longitud de contexto de 32.768 tokens en su version v0.3, que ademas incorpora soporte nativo de function calling. Es relevante para quien busque un modelo de 7B afinado para una tarea concreta y ligera de desplegar, aunque la ausencia total de documentacion sobre los datos de entrenamiento limita seriamente su evaluacion previa.

El repositorio presenta senales de baja madurez: 0 descargas, 0 likes, ninguna metrica publicada y un tamano de repo reportado de 0,0 GB, lo que sugiere que los pesos pueden no estar completamente subidos o que se trata de un adaptador de muy pocos parametros. Se recomienda tratarlo como un artefacto experimental antes que como un modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con GQA y atención de ventana deslizante (heredada del modelo base) |
| Parametros totales | 7.250 millones aprox. (modelo base Mistral-7B-Instruct-v0.3); no confirmado para el artefacto ajustado |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 32.768 tokens (modelo base v0.3) |
| Tipos de cuantizacion | No disponible en la model card; el base admite FP16/BF16, INT8 y cuantizaciones de comunidad (GGUF, AWQ, GPTQ) |
| Idiomas soportados | No disponible. El modelo base esta orientado a ingles, frances, aleman, espanol e italiano |
| Licencia | No disponible para este ajuste (la model card solo contiene el marcador "licence: license"). El base es Apache-2.0 |
| Formato de pesos | safetensors (tag del repositorio) |
| Modelo base | mistralai/Mistral-7B-Instruct-v0.3 |
| Metodo de entrenamiento | SFT con TRL 1.9.2 (posiblemente LoRA r=8, inferido del nombre del repo, no confirmado) |
| Hiperparametros declarados | 3 epochs, learning rate 1,5e-3 |
| Tamano del repositorio | 0,0 GB |
| Versiones de framework | TRL 1.9.2, Transformers 5.14.1, PyTorch 2.11.0, Datasets 5.0.1, Tokenizers 0.22.2 |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Mistral-7B-Instruct-v0.3: un transformer decoder-only de 7.250 millones de parametros con 32 capas, atencion de consultas agrupadas (GQA) para reducir el coste de la cache KV y atencion de ventana deslizante de 4.096 tokens por capa, que combinada con el mecanismo de informacion fluyente permite un contexto efectivo de 32.768 tokens. El tokenizador del base v0.3 amplia el vocabulario a 32.768 entradas respecto a versiones anteriores. Este ajuste no modifica esa arquitectura; solo altera los pesos.

Sobre el entrenamiento del ajuste solo se dispone de lo que declara la model card: SFT mediante TRL, con 3 epochs y learning rate 1,5e-3, y un enlace publico a un run de Weights & Biases. No se especifica el dataset, su composicion, el numero de tokens de entrenamiento, la tecnica de adaptacion (LoRA, QLoRA o ajuste completo) ni si hubo una fase posterior de alineacion con RLHF o DPO. El sufijo "r8" del nombre sugiere un rango LoRA de 8, pero es una inferencia a partir de la nomenclatura, no un dato confirmado. Tampoco se documenta ninguna innovacion tecnica adicional.

## Capacidades

- Generacion de texto conversacional multi-turno: hereda el formato de chat del base, con rol de sistema, usuario y asistente.
- Razonamiento e instrucciones: capacidad de seguir instrucciones complejas y resolver tareas de razonamiento de varios pasos, en el nivel propio de un modelo de 7B.
- Generacion de codigo: el base v0.3 mantiene un rendimiento solido en lenguajes como Python, JavaScript o SQL, aunque inferior al de modelos especializados de mayor tamano.
- Matematicas: resolucion de problemas aritmeticos y algebraicos de dificultad media, con riesgo de error en cadenas de calculo largas.
- Tool calling / function calling: el base v0.3 incorpora soporte nativo de llamadas a funciones, siempre que el ajuste SFT no lo haya degradado.
- Uso en agentes: admite plantillas de conversacion con resultados de herramientas interpolados, lo que permite flujos de razonamiento multi-paso.
- Capacidades multilingues: no documentadas para este ajuste. Las del base se limitan a un conjunto reducido de idiomas europeos.
- Capacidades especiales: no se documenta modo "thinking", vision, audio ni ninguna otra modalidad adicional.

## Casos de uso

- Asistente conversacional especializado: el ajuste puede emplearse como chatbot de dominio concreto, aprovechando los 32.768 tokens de contexto del base para mantener historiales largos de conversacion sin truncar.
- Generacion de codigo en pipelines internos: integrado con tool calling, puede generar parches o pruebas unitarias y devolverlas en un formato estructurado que un sistema de CI/CD consuma directamente.
- Clasificacion y etiquetado de texto: al ser un modelo pequeno y cuantificable, resulta viable ejecutarlo en lote sobre grandes volumenes de documentos para extraer categorias o entidades.
- Resumen de documentacion tecnica: su ventana de 32k permite resumir manuales o actas extensas en una sola pasada, sin fragmentacion y sin perder el hilo entre secciones.
- Extraccion de informacion estructurada: con plantillas de function calling puede convertir texto libre en JSON con campos definidos, util para ingesta de datos en bases relacionales.
- Prototipado rapido en investigacion: sirve como punto de partida para experimentos de SFT comparativos, ya que se puede reentrenar con TRL sobre el mismo base y medir deltas.
- Despliegue en edge o en una sola GPU de consumo: cuantizado a 4 bits ocupa alrededor de 4-5 GB de VRAM, lo que permite servirlo en estaciones de trabajo modestas para tareas de asistencia interna.
- Moderacion o pre-filtrado: como primera etapa barata en un pipeline de dos modelos, filtrando solicitudes antes de enviarlas a un modelo mayor y mas costoso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del autor no incluye ninguna tabla de evaluacion (MMLU, HumanEval, GSM8K ni similares), y los resultados de la busqueda web realizada no guardan relacion con el modelo: corresponden a fichas de producto de refrigeradores adiabaticos de la marca JACIR, sin conexion alguna con inteligencia artificial. No se deben asumir los numeros del modelo base como propios de este ajuste, ya que el SFT puede degradar capacidades generales (olvido catastrofico) o mejorarlas en el dominio del dataset, que se desconoce.

## Requisitos de hardware

- VRAM en FP16/BF16: aproximadamente 14-15 GB solo para los pesos, mas 2-4 GB de cache KV con contextos largos y batching moderado.
- VRAM en INT8: alrededor de 8 GB de pesos.
- VRAM en 4 bits (GPTQ, AWQ o GGUF Q4): aproximadamente 4-5 GB de pesos.
- GPU recomendadas para FP16: A100 40/80 GB, H100, L40S, RTX A6000 o dos RTX 4090 en tensor parallel.
- GPU de consumo: cabe en una RTX 4090 o RTX 3090 (24 GB) en FP16 con contexto moderado; en 4 bits cabe en una RTX 4060 Ti de 16 GB, una RTX 3060 de 12 GB o incluso una GPU de 8 GB con contexto reducido.
- Despliegue: vLLM o TGI para servicio con batching continuo en FP16; llama.cpp u Ollama para cuantizaciones GGUF en CPU/GPU hibrida; Transformers con `pipeline` para prototipado, tal como propone la model card.
- CPU: es viable en exclusiva con llama.cpp y cuantizacion Q4, con velocidades de pocos tokens por segundo en procesadores de escritorio.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo ni de latencia para este repositorio, y el tamano de repo reportado (0,0 GB) impide incluso confirmar que los pesos completos esten descargables.

## Comparativa con modelos similares

Los datos de la columna del modelo evaluado corresponden al base Mistral-7B-Instruct-v0.3, ya que el ajuste no publica especificaciones propias. Las cifras de los alternativas proceden de su documentacion publica.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Este ajuste (sobre Mistral-7B-Instruct-v0.3) | 7,25B | 32.768 | No disponible (base Apache-2.0) | 0 descargas, 0 likes, repo de 0,0 GB | Sin benchmarks ni dataset documentado |
| mistralai/Mistral-7B-Instruct-v0.3 | 7,25B | 32.768 | Apache-2.0 | Muy extendida | Function calling nativo, amplia ecosystema de cuantizaciones |
| meta-llama/Llama-3.1-8B-Instruct | 8,03B | 131.072 | Llama 3.1 Community License | Muy extendida | Contexto mucho mayor, licencia con restricciones para grandes despliegues |
| Qwen/Qwen2.5-7B-Instruct | 7,62B | 32.768 nativo (131.072 con YaRN) | Apache-2.0 | Muy extendida | Buen rendimiento en codigo y matematicas, multilingue amplio |
| google/gemma-2-9b-it | 9,24B | 8.192 | Gemma Terms of Use | Muy extendida | Contexto corto, licencia con condiciones de uso adicionales |

## Limitaciones y advertencias

- Ausencia total de documentacion sobre el dataset de SFT: no es posible saber que sesgos se han introducido, que dominios se han reforzado ni que capacidades del base pueden haberse degradado.
- Riesgo de olvido catastrofico: un SFT de 3 epochs con learning rate 1,5e-3 sobre un dataset desconocido puede estrechar el comportamiento del modelo y empeorar su rendimiento general.
- Riesgo de alucinacion: igual que el base, el modelo puede generar contenido plausible pero falso, especialmente en contextos largos o en dominios poco representados.
- Licencia no resuelta: la model card contiene unicamente el marcador "licence: license". Aunque el base es Apache-2.0, el ajuste no declara terminos propios, lo que impide confirmar las condiciones de uso comercial.
- Idiomas no declarados: no hay garantia de que el ajuste conserve el rendimiento multilingue del base; es probable que el SFT haya reforzado un unico idioma.
- Repositorio potencialmente incompleto: el tamano reportado de 0,0 GB y la ausencia de descargas hacen dudar de que los pesos esten realmente publicados y sean cargables con `from_pretrained`.
- Sin benchmarks: cualquier decision de adopcion en produccion requeriria una evaluacion propia sobre el caso de uso concreto.
- Sin garantia de soporte de tool calling: aunque el base lo ofrece, el ajuste SFT puede haber degradado esta capacidad si el dataset no incluia ejemplos de llamadas a funciones.
- Modelo sin mantenimiento aparente: creado y actualizado en un intervalo de un minuto, sin senales de iteracion posterior.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/leobianco/npov_SFT_Mistral-7B-Instruct-v0_3_S130104_epo3_lr1_5e-03_r8_2609211248
- Modelo base: https://huggingface.co/mistralai/Mistral-7B-Instruct-v0.3
- Libreria TRL: https://github.com/huggingface/trl
- Run de entrenamiento en Weights & Biases: https://wandb.ai/leobianco-universit-paris-saclay/new_perl/runs/6u3ry7nt
- Paper de referencia de TRL (von Werra et al., 2020): https://github.com/huggingface/trl (citado en la model card del autor)
- Resultados de la busqueda web: no se ha encontrado ningun enlace relevante al modelo. Los resultados devueltos corresponden a fichas de producto de refrigeradores adiabaticos TOPAZ NEO del fabricante JACIR y no guardan relacion con este repositorio.
