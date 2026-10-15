# ddvd233/hb27b_general_specgap_ship_retrieval_websearch_global_step_130

## Resumen

El modelo `ddvd233/hb27b_general_specgap_ship_retrieval_websearch_global_step_130` es un artefacto de investigación publicado por el usuario de HuggingFace ddvd233. Consiste en los pesos fusionados (merge) del checkpoint FSDP `global_step_130` de un experimento de aprendizaje por refuerzo (RL) sobre `Qwen/Qwen3.6-27B`, entrenado con la librería verl y con herramientas de recuperación (retrieval) y búsqueda web disponibles durante el entrenamiento.

El problema que aborda es de carácter metodológico: el experimento se describe como "RRI full arm (hack-then-patch rounds)" con evaluación graduada por GPT (GPT-graded) y con un proponente entrenado sobre una descripción de tarea que no nombra ningún benchmark concreto (general bundle). El propio autor indica que el modelo no forma parte de ninguno de sus dos artículos y que es el último checkpoint del run.

Es relevante ahora únicamente en el contexto de investigación en RL aplicado a dominios médicos: reporta una exactitud ajustada por longitud de 0,402 en validación de HealthBench Professional en este paso, frente a 0,368 sin entrenar y un máximo de 0,416 en el paso 70 (cuyos pesos no se conservaron). Se trata de un modelo de 27.356.728.560 parámetros (~27,36 mil millones), sin documentación sobre arquitectura interna, contexto o idiomas, y con el aviso explícito de que no es apto para uso clínico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No documentada en la informacion disponible (etiquetada como `qwen3_5`; derivada de `Qwen/Qwen3.6-27B`) |
| Parametros totales | 27.356.728.560 (~27,36 mil millones), medidos en los safetensors |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible. El repositorio solo publica pesos en bf16; no se distribuyen versiones GGUF, AWQ, GPTQ ni similares |
| Idiomas soportados | No disponible |
| Licencia | apache-2.0 (declarada en la model card y en los tags) |
| Formato de pesos | safetensors (bf16), pesos fusionados del checkpoint FSDP |
| Modelo base | Qwen/Qwen3.6-27B (fine-tune via RL) |
| Pipeline declarado | reinforcement-learning |
| Tamano del repositorio | 54,7 GB |
| Fecha de creacion | 2026-10-14 |
| Ultima actualizacion | 2026-10-14 |

## Arquitectura y entrenamiento

No se dispone de informacion tecnica sobre la arquitectura interna mas alla de la etiqueta `qwen3_5` y del modelo base declarado, `Qwen/Qwen3.6-27B`. No se documentan numero de capas, tipo de atencion, si es denso o MoE, ni si incorpora alguna innovacion de decodificacion. La unica cifra fiable es la de parametros totales, 27.356.728.560, coherente con un repositorio de 54,7 GB en bf16 (aproximadamente 2 bytes por parametro).

En cuanto al entrenamiento, la model card describe un experimento de RL con verl sobre Qwen3.6-27B, en el marco de un protocolo denominado "RRI full arm (hack-then-patch rounds)", con acceso a herramientas de retrieval y de busqueda web durante el proceso, evaluacion graduada por GPT y un proponente entrenado sobre una descripcion de tarea que no nombra ningun benchmark (general bundle). No se especifican tokens de entrenamiento, composicion del dataset, ni si hubo RLHF, DPO u otra fase de alineamiento; tampoco se detalla el algoritmo de RL ni la funcion de recompensa mas alla de la mencion a la evaluacion por GPT y del ajuste por longitud. El checkpoint es el ultimo del run (global step 130).

## Capacidades

- Generacion de texto y respuestas en el ambito de salud y consejo profesional, segun el objetivo declarado del entrenamiento (HealthBench Professional).
- Uso de herramientas de recuperacion (retrieval) y de busqueda web, dado que el experimento se entreno con esas herramientas disponibles.
- Razonamiento multi-paso orientado a tareas con acceso a informacion externa, propio de un pipeline de RL con herramientas.
- No se documentan capacidades de codigo, matematicas, vision, audio, tool calling generico ni modo de razonamiento explicito (thinking mode).
- Capacidades multilingues: no disponibles.
- Capacidad especial reseñable: el propio autor describe el regimen de entrenamiento como "hack-then-patch rounds", es decir, se contempla explicitamente la aparicion de atajos de recompensa y su correccion posterior; esto es una caracteristica del metodo, no una capacidad funcional del modelo.

## Casos de uso

- Investigacion en RL con herramientas: reproducir o inspeccionar un checkpoint intermedio de un run de RL con retrieval y busqueda web sobre un modelo de 27B, para estudiar la evolucion de la politica paso a paso.
- Estudio de recompensas y atajos: el regimen "hack-then-patch rounds" y la evaluacion graduada por GPT permiten analizar como aparecen y se corrigen comportamientos de explotacion de la funcion de recompensa en tareas medicas.
- Analisis de sensibilidad al sesgo de longitud: al reportarse exactitud ajustada por longitud, el checkpoint sirve para estudiar como el entrenamiento con RL afecta a la verbosidad de las respuestas sanitarias.
- Evaluacion offline de QA medico: uso como modelo de referencia en arneses de evaluacion tipo HealthBench Professional, siempre en entorno de investigacion y nunca como fuente de consejo clinico.
- Base para experimentos de RL posteriores: al ser un checkpoint fusionado en safetensors, puede servir como inicializacion de nuevos runs o como punto de comparacion frente al modelo base.
- Pruebas de pipelines de inferencia a escala 27B: validar despliegues con vLLM, TGI o SGLang en bf16 para medir latencia y throughput con un modelo de este tamano.
- Auditoria de artefactos de investigacion: al tener 0 descargas y 0 likes y no formar parte de publicacion alguna, es util como caso de estudio sobre trazabilidad y documentacion de checkpoints intermedios.

## Benchmarks y rendimiento

Los unicos datos disponibles son los reportados por el autor para validacion de HealthBench Professional, con exactitud ajustada por longitud, medidos en el propio bucle de entrenamiento (in-loop):

| Evaluacion | Exactitud ajustada por longitud (HealthBench Professional, validacion) |
|---|---|
| Modelo sin entrenar (referencia) | 0,368 |
| Este checkpoint (global step 130) | 0,402 |
| Mejor resultado del run (global step 70) | 0,416 (pesos no conservados) |

No se han publicado resultados de benchmarks en la informacion disponible para MMLU, HumanEval, GSM8K ni ninguna otra prueba estandar. Las cifras anteriores son autoreportadas, no verificadas de forma independiente y proceden de un ajuste por longitud realizado dentro del propio bucle de evaluacion.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: los pesos ocupan aproximadamente 54,7 GB; con cache KV y overhead de ejecucion hay que prever del orden de 60-70 GB para contexto moderado. No hay cifras oficiales de consumo.
- GPU recomendadas: A100 80 GB, H100 80 GB o H200 para ejecucion en una sola GPU; 2 x A100 40 GB o 2 x RTX 4090 con paralelismo tensorial como alternativas.
- Cabe en GPU de consumo: no en una sola unidad de 24 GB en bf16. Seria necesario repartir entre varias GPU (por ejemplo 2-4 x RTX 4090/3090) o convertir los pesos a cuantizaciones de 4-8 bits, conversion que el repositorio no proporciona.
- Opciones de despliegue: vLLM, TGI o SGLang para bf16 en GPU; llama.cpp u Ollama requeririan una conversion previa a GGUF que no se distribuye. El repositorio solo contiene safetensors en bf16.
- Latencia y throughput estimados: no disponibles. No se publican mediciones de tokens por segundo ni de tiempo hasta el primer token.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Resultado HealthBench Professional (val.) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint (step 130) | 27,36 B | No disponible | 0,402 (ajustado por longitud, in-loop) | apache-2.0 | Pesos en safetensors, 54,7 GB |
| Qwen/Qwen3.6-27B (base) | ~27 B (cifra exacta no disponible) | No disponible | 0,368 segun el autor, sin entrenamiento | No disponible en esta informacion | Publico en HuggingFace |
| Alternativas medicas de ~27 B (por ejemplo, la familia MedGemma) | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone en la informacion proporcionada de resultados comparables de otros modelos en HealthBench Professional ni de sus especificaciones, por lo que no es posible establecer una comparacion cuantitativa fiable mas alla de la referencia frente al modelo base.

## Limitaciones y advertencias

- No apto para uso clinico: la propia model card lo declara explicitamente ("Not for clinical use"). Es un artefacto de investigacion entrenado sobre tareas escritas por el propio modelo.
- Riesgo de alucinacion elevado en dominio sanitario: el modelo no esta validado para emitir consejo medico y no se documentan mecanismos de mitigacion.
- Riesgo de atajos de recompensa: el regimen de entrenamiento se describe como "hack-then-patch", lo que indica que la politica puede haber explotado la funcion de recompensa y que las correcciones aplicadas no estan documentadas en detalle.
- Evaluacion no independiente: la unica metrica disponible es in-loop, graduada por GPT y ajustada por longitud, sin verificacion externa ni replicacion.
- Degradacion respecto al mejor paso: el mejor resultado del run (0,416) se obtuvo en el paso 70 y sus pesos no se conservaron; este checkpoint es el ultimo del run y rinde por debajo.
- Ausencia de datos de contexto e idiomas: no se puede garantizar comportamiento correcto en conversaciones largas ni en idiomas distintos del usado en el entrenamiento, que no se especifica.
- Sin versiones cuantizadas: no hay GGUF, AWQ ni GPTQ, lo que limita el despliegue en hardware de consumo.
- Licencia: el repositorio declara apache-2.0, pero conviene verificar los terminos aplicables al modelo base Qwen/Qwen3.6-27B antes de cualquier uso comercial.
- Adopcion nula y sin mantenimiento declarado: 0 descargas y 0 likes, sin parte de publicacion cientifica, por lo que no hay garantia de soporte, issues atendidos ni actualizaciones.
- Trazabilidad limitada: no se documentan datos de entrenamiento, hiperparametros, tokens vistos ni composicion del dataset, lo que dificulta la reproducibilidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ddvd233/hb27b_general_specgap_ship_retrieval_websearch_global_step_130
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-27B
- Libreria de entrenamiento (verl): no disponible en la informacion proporcionada
- Paper o blog del autor: no disponible; la model card indica que el modelo no forma parte de ninguno de los dos articulos del autor
- Demo o espacio asociado: no disponible
- Resultados de la busqueda web: no se han encontrado enlaces relevantes al modelo; los resultados devueltos corresponden a paginas de Microsoft Word y no guardan relacion con este artefacto
