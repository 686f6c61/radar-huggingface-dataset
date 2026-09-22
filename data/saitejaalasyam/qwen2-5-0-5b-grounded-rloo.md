# saitejaalasyam/qwen2.5-0.5b-grounded-rloo

## Resumen

Qwen2.5-0.5B grounded RLOO es un ajuste fino del modelo Qwen/Qwen2.5-0.5B-Instruct publicado por el usuario saitejaalasyam en HuggingFace. Se trata de un ejercicio de alineamiento mediante aprendizaje por refuerzo con retroalimentacion humana (RLHF) aplicado a una tarea muy concreta: respuesta fundamentada en un pasaje (grounded question answering) con abstención explicita cuando el pasaje no contiene la respuesta. El pipeline seguido es el clasico de RLHF: ajuste supervisado (SFT) sobre respuestas preferidas, entrenamiento de un modelo de recompensa a partir de pares de preferencia y optimizacion de la politica con el algoritmo RLOO (REINFORCE leave-one-out) implementado en la libreria TRL.

El modelo tiene 494.032.768 parametros (aproximadamente 0,49 mil millones), un tamano que lo situa en la gama ultraligera, apto para inferencia en CPU o en GPUs de consumo muy modestas. Hereda la arquitectura transformer decoder-only de la familia Qwen2.5 y su licencia Apache 2.0, y esta entrenado exclusivamente en ingles sobre pares derivados de SQuAD 2.0.

Su relevancia no esta en el rendimiento absoluto, sino en su valor como caso de estudio reproducible de un ciclo completo de RLHF con RLOO sobre un modelo pequeno. La propia model card advierte que los resultados de la evaluacion son modestos: la exactitud global del checkpoint final (0,375) es inferior a la del modelo base (0,400), aunque mejora la tasa de respuesta en preguntas con respuesta (0,250 frente a 0,200) a costa de abstenerse menos en las no respondibles (0,500 frente a 0,600).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen2, derivado de Qwen/Qwen2.5-0.5B-Instruct) |
| Parametros totales | 494.032.768 (segun safetensors) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (no se declara en la model card ni en los metadatos) |
| Tipos de cuantizacion | no disponible en el repositorio (solo se publican pesos en safetensors; no se incluyen variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | ingles (en) |
| Licencia | apache-2.0 (los datos de entrenamiento derivan de SQuAD 2.0, con licencia CC BY-SA 4.0) |
| Formato de pesos | safetensors |
| Modelo base | Qwen/Qwen2.5-0.5B-Instruct |
| Libreria de inferencia | transformers, text-generation-inference (endpoints_compatible) |
| Tamano del repositorio | 1,0 GB |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo base Qwen2.5-0.5B-Instruct: un transformer decoder-only con atencion causal, normalizacion RMSNorm, activacion SwiGLU y atencion con sesgo QKV, en la configuracion de 0,5 mil millones de parametros de la familia Qwen2.5. Sobre esa base no se introduce ninguna modificacion estructural; el trabajo del autor se concentra integramente en la fase de alineamiento.

El entrenamiento sigue un esquema de tres etapas. Primero, el modelo base se ajusta de forma supervisada (SFT) sobre respuestas preferidas derivadas de SQuAD 2.0. En segundo lugar, se entrena un modelo de recompensa a partir de pares de preferencia generados en la misma ejecucion. Por ultimo, la politica se optimiza contra ese modelo de recompensa con RLOO, el metodo de RL en linea que TRL mantiene tras la eliminacion de `PPOTrainer` en la version 1.13. RLOO muestrea dos completaciones por prompt, las puntua con el modelo de recompensa y emplea una linea base leave-one-out para reducir la varianza de la actualizacion, con una penalizacion KL (`beta` = 0,05) que mantiene la politica cerca de la referencia SFT. El ajuste se realizo con LoRA y los adaptadores se fusionaron con los pesos base antes de la subida al repositorio. El prompt de sistema impone tres reglas: responder solo con el pasaje del mensaje de usuario, dar una respuesta corta extraida del pasaje y responder exactamente "The passage does not say." cuando el pasaje no contiene la respuesta.

## Capacidades

- Generacion de texto conversacional en ingles siguiendo la plantilla de chat de Qwen2.5.
- Question answering extractivo fundamentado: la respuesta debe proceder literalmente del pasaje proporcionado en el mensaje de usuario.
- Abstención explicita: devuelve la cadena fija "The passage does not say." cuando el pasaje no contiene la respuesta, una capacidad entrenada de forma deliberada.
- Formato de entrada especifico: pregunta primero y pasaje despues dentro del mensaje de usuario, con un mensaje de sistema fijo.
- Razonamiento multi-paso, uso de herramientas (tool calling) y function calling: no declarados en la informacion proporcionada.
- Capacidades multimodales (vision, audio): no disponibles.
- Capacidades multilingues: no disponibles; el modelo esta etiquetado unicamente como ingles.
- Modo de pensamiento explicito (thinking mode): no disponible.
- Despliegue compatible con text-generation-inference y con el ecosistema transformers.

## Casos de uso

- Respuesta extractiva sobre documentacion tecnica: dado un fragmento de manual o de README y una pregunta, el modelo devuelve la frase literal del fragmento que responde, lo que permite construir un lector de documentacion con citas verificables y sin generacion libre de contenido.
- Filtro de abstención en pipelines RAG: integrado como verificador barato que decide si el contexto recuperado contiene la respuesta antes de invocar un modelo mayor, reduciendo coste y alucinacion en la etapa final del pipeline.
- Evaluacion de pasajes para busqueda: el modelo puede puntuar si un fragmento recuperado responde a una consulta, sirviendo como reordenador (reranker) generativo de bajo coste sobre colecciones de documentos.
- Prototipado rapido de sistemas de QA en el borde: con menos de 500 millones de parametros puede ejecutarse en CPU o en una GPU integrada, lo que permite validar la logica de un producto de QA antes de escalar a un modelo mayor.
- Docencia e investigacion en RLHF: es un ejemplo completo y de bajo coste computacional de un ciclo SFT + modelo de recompensa + RLOO, util para cursos y experimentos sobre estabilidad y varianza en RL en linea.
- Pruebas de regresion de pipelines de alineamiento: al publicar las metricas del modelo base, el SFT y el RLOO, sirve como punto de referencia para comparar variantes de hiperparametros (numero de generaciones, coeficiente KL, tamano del modelo de recompensa).
- Generacion de conjuntos de datos sinteticos de abstención: sus respuestas de abstención pueden emplearse para construir ejemplos etiquetados de "no respondible" en tareas de QA extractivo.
- Demostracion interactiva con Gradio: la model card referencia un `app.py` en el repositorio de entrenamiento con una demo Gradio lista para ejecutar.

## Benchmarks y rendimiento

Los unicos datos publicados son los de la model card: decodificacion greedy sobre articulos de SQuAD reservados. La exactitud se mide como coincidencia de span en preguntas respondibles y como abstención exacta en las no respondibles. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

| Modelo | Exactitud | Respondibles | No respondibles |
|---|---|---|---|
| base | 0,400 | 0,200 | 0,600 |
| sft | 0,400 | 0,150 | 0,650 |
| rloo | 0,375 | 0,250 | 0,500 |

| Comparacion | Tasa de victoria (modelo de recompensa) | Empates |
|---|---|---|
| rloo_vs_sft | 0,150 | 0,825 |
| rloo_vs_base | 0,325 | 0,450 |
| sft_vs_base | 0,250 | 0,525 |

Configuracion de evaluacion: `demo.yaml`. La tasa de victoria indica con que frecuencia la respuesta de esta politica puntua por encima de la del modelo de comparacion bajo el modelo de recompensa. Destaca el elevado porcentaje de empates (0,825 en rloo_vs_sft), lo que limita la interpretabilidad de esa metrica.

## Requisitos de hardware

- VRAM estimada en precision completa (fp16/bf16): en torno a 1 GB solo para pesos, aproximadamente 1,5-2 GB contando cache KV y overhead de runtime. El repositorio ocupa 1,0 GB.
- VRAM estimada con cuantizacion de 8 bits: del orden de 0,6-0,8 GB; con 4 bits, del orden de 0,4-0,6 GB (estimaciones calculadas a partir del numero de parametros, ya que el repositorio no publica variantes cuantizadas).
- GPU recomendadas: cualquier GPU con 2 GB o mas de memoria, incluidas GTX 1650, RTX 3050, RTX 4060, T4, L4. En GPUs de datacenter (A100, H100) el modelo queda muy sobredimensionado para la GPU y el cuello de botella pasa a ser el lanzamiento de kernels.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU dedicada de los ultimos ocho anos, y tambien en GPUs integradas con memoria compartida.
- Ejecucion en CPU: viable; con 0,49 mil millones de parametros es adecuado para inferencia en CPU con cuantizacion, aunque no se publican pesos GGUF y habria que convertirlos.
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference (el repositorio esta etiquetado como `endpoints_compatible`), vLLM. Para llama.cpp u Ollama seria necesaria una conversion previa a GGUF, no incluida en el repositorio.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

Los datos de los modelos comparativos proceden de sus fichas publicas y no de la informacion aportada en esta busqueda; se incluyen solo a efectos orientativos.

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| qwen2.5-0.5b-grounded-rloo | 494 M | no declarado | Apache 2.0 | QA extractivo con abstención, RLHF con RLOO |
| Qwen2.5-0.5B-Instruct | 494 M | 32.768 tokens (segun su model card) | Apache 2.0 | Instruct generalista multilingue |
| SmolLM2-360M-Instruct | 362 M | 8.192 tokens (segun su model card) | Apache 2.0 | Instruct generalista en ingles |
| TinyLlama-1.1B-Chat | 1,1 B | 2.048 tokens (segun su model card) | Apache 2.0 | Chat generalista en ingles |

Frente a sus alternativas, este checkpoint no compite en capacidad general: sacrifica el comportamiento instruct generalista de Qwen2.5-0.5B-Instruct para especializarse en una unica tarea de lectura comprensiva en ingles. Su ventaja es la trazabilidad completa del proceso de RLHF y la publicacion de metricas comparativas entre base, SFT y RLOO, algo poco habitual en modelos de este tamano. Su desventaja es que no hereda de forma fiable las capacidades generales del base: el propio autor advierte que no debe tratarse como un lector fiable.

## Limitaciones y advertencias

- El autor advierte explicitamente de que un modelo de 0,5 mil millones de parametros entrenado sobre unos pocos miles de pares derivados no es un lector fiable.
- El modelo de recompensa puede ser explotado (reward hacking): la optimizacion con RLOO puede aumentar la recompensa sin mejorar la exactitud en la tarea. Las metricas publicadas son coherentes con este fenomeno, ya que la exactitud global baja de 0,400 (base) a 0,375 (rloo).
- El porcentaje de empates en las comparaciones es muy alto (0,825 frente al SFT), de modo que la tasa de victoria no debe interpretarse como evidencia de mejores respuestas.
- La caida en abstención correcta sobre preguntas no respondibles (de 0,650 en SFT a 0,500 en RLOO) indica mayor tendencia a inventar una respuesta cuando el pasaje no la contiene.
- Sesgos conocidos: no se documentan analisis de sesgo en la informacion proporcionada.
- Idiomas: unicamente ingles. No hay soporte declarado para castellano ni para otras lenguas.
- Longitud de contexto: no declarada; no hay confirmacion de que el ajuste RLHF conserve la ventana de contexto del modelo base.
- Uso comercial: la licencia Apache 2.0 lo permite, pero los datos de entrenamiento derivan de SQuAD 2.0, con licencia CC BY-SA 4.0, lo que puede introducir obligaciones de atribucion o de compartir igual sobre los datos derivados.
- No apto para usos de alto riesgo, segun la propia model card.
- El modelo exige un formato de prompt muy rigido (mensaje de sistema fijo, pregunta antes del pasaje); usarlo fuera de ese formato degrada el comportamiento de abstención.
- El repositorio no incluye pesos cuantizados, plantilla de chat propia ni script de conversion a GGUF.
- Los metadatos del repositorio muestran fechas de creacion y actualizacion de septiembre de 2026, lo que resulta anomalo y conviene verificar antes de citarlo.
- El repositorio no registra descargas ni "likes" en el momento de la consulta, por lo que no hay validacion externa de la comunidad.

## Enlaces

- HuggingFace: https://huggingface.co/saitejaalasyam/qwen2.5-0.5b-grounded-rloo
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Paper de RLOO (Back to Basics: Revisiting REINFORCE Style Optimization for Learning from Human Feedback in LLMs): https://huggingface.co/papers/2402.14740
- Libreria TRL: https://github.com/huggingface/trl
- SQuAD 2.0 (dataset de origen de los datos de entrenamiento): https://rajpurkar.github.io/SQuAD-explorer/
- Resultados de la busqueda web: no se han encontrado enlaces relevantes al modelo; los resultados devueltos corresponden a paginas de soporte de Microsoft sin relacion con esta ficha.
