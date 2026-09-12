# ddvd233/hb27b_specgap_simple_retrieval_aicr_global_step_60

## Resumen

hb27b_specgap_simple_retrieval_aicr_global_step_60 es un checkpoint de pesos fusionados (bf16 safetensors) publicado por el usuario ddvd233, resultado de un experimento de aprendizaje por refuerzo sobre el modelo base Qwen/Qwen3.6-27B. Se trata de un artefacto de investigación, no de un modelo listo para producción: la propia model card lo describe como la línea base (control) del paper RRIMed, en la que se aplica exactamente la misma receta de RL pero con la recompensa fijada mediante un prompt constante (`fixed prompt`), con el objetivo de medir el efecto de la señal de recompensa frente al entrenamiento real.

El modelo tiene 27.356.728.560 parámetros (~27,36 B) y el repositorio ocupa 54,7 GB, coherente con pesos en bf16. Fue entrenado con verl sobre checkpoints FSDP y posteriormente fusionado a formato HuggingFace. El dominio declarado es médico, mediante tareas escritas por el propio modelo (`model-written tasks`), y la evaluación se limita a una única familia de benchmarks, HealthBench Professional en su métrica de precisión ajustada por longitud.

El resultado principal publicado en la model card es revelador: 0,370 en el paso 60 (el checkpoint disponible), frente a 0,392 en el mejor paso de validación (paso 75, perdido por rotación de checkpoints) y 0,374 del modelo sin entrenar. Es decir, este checkpoint concreto queda por debajo de su propia línea base sin RL, lo que lo convierte en una referencia de control útil para investigar dinámicas de RL, pero no en un modelo de uso clínico ni de propósito general. La model card incluye una advertencia explícita: "Not for clinical use".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (heredada del modelo base Qwen/Qwen3.6-27B; etiqueta de arquitectura en HuggingFace: qwen3_5) |
| Parametros totales | 27.356.728.560 (~27,36 B) |
| Parametros activos | no aplica (no hay indicios de que sea MoE en la informacion proporcionada) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | pesos publicados en bf16 (safetensors); no se documentan variantes GGUF, AWQ, GPTQ ni FP8 |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (bf16), fusionados desde un checkpoint FSDP de verl |
| Modelo base | Qwen/Qwen3.6-27B |
| Tamano del repositorio | 54,7 GB |
| Pipeline declarado | reinforcement-learning |
| Dominio declarado | medical |
| Framework de entrenamiento | verl (FSDP), fusionado posteriormente a pesos HuggingFace |
| Fecha de publicacion | 11 de septiembre de 2026 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La informacion proporcionada no detalla la arquitectura interna del modelo; se hereda del modelo base Qwen/Qwen3.6-27B y la etiqueta de HuggingFace lo asocia a la familia `qwen3_5`. El checkpoint se generó entrenando con refuerzo (pipeline `reinforcement-learning`) mediante el framework verl con FSDP, y después se fusionaron los fragmentos (sharding) en un único conjunto de pesos bf16 en safetensors.

El experimento se describe como "RRIMed paper baseline: identical RL recipe with the reward held fixed (fixed prompt), 27B, ARM 18". Esto significa que se aplicó la misma receta de RL que en el experimento principal, pero con la recompensa congelada a través de un prompt fijo, lo que en la práctica convierte este entrenamiento en un control para aislar el efecto de la señal de recompensa. El conjunto de entrenamiento está compuesto por tareas escritas por el propio modelo, no por datos clínicos anotados por especialistas. No se documentan en la informacion disponible el número de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF, DPO u otras técnicas de alineamiento adicionales. Tampoco se describen innovaciones técnicas de inferencia (decodificación especulativa, atención lineal, etc.).

## Capacidades

- Generacion de texto: capacidad heredada del modelo base Qwen/Qwen3.6-27B, sin cuantificar ni validar en la informacion disponible.
- Dominio medico: el entrenamiento de RL se realizó sobre tareas de temática médica escritas por el modelo, orientadas a la familia de evaluación HealthBench Professional.
- Razonamiento y respuesta a preguntas: evaluado únicamente mediante precisión ajustada por longitud en HealthBench Professional (0,370 en el paso 60).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible (el campo de idiomas no está informado en la model card).
- Capacidades especiales (modo thinking, visión, audio): no disponible.
- Aprendizaje por refuerzo: el modelo es un artefacto de investigación sobre dinámicas de RL con recompensa fija, útil para reproducir y estudiar experimentos de este tipo.

## Casos de uso

- Reproduccion de experimentos de RL: el checkpoint permite reproducir la línea base de recompensa fija del paper RRIMed y comparar su evolución frente a la variante con recompensa aprendida, usando la misma receta y el mismo modelo base.
- Investigacion sobre senales de recompensa: sirve para estudiar hasta qué punto una recompensa congelada (prompt fijo) degrada o mantiene el rendimiento respecto al modelo sin entrenar, dado que este checkpoint obtiene 0,370 frente a 0,374 de la línea base.
- Estudios de rotacion y gestion de checkpoints: el propio autor documenta que el mejor paso (75, con 0,392) se perdió por rotación de checkpoints, lo que hace de este repositorio un caso práctico para diseñar políticas de retención de checkpoints en pipelines de RL.
- Analisis de dominios especializados bajo RL: permite analizar cómo se comporta un modelo de 27B entrenado con tareas sintéticas de temática médica, comparando con el modelo base en la misma familia de benchmarks.
- Punto de partida para ablaciones: al ser un control, es un punto de referencia adecuado para experimentos posteriores que modifiquen la función de recompensa, el tamaño del modelo o la composición de las tareas.
- Evaluacion de pipelines de fusion de pesos FSDP: el repositorio contiene pesos fusionados desde un checkpoint FSDP de verl, por lo que es útil para validar herramientas de conversión y carga de este tipo de artefactos en HuggingFace.
- Uso educativo y metodologico: documenta un caso real en el que un paso intermedio de RL rinde por debajo del modelo sin entrenar, útil para ilustrar la varianza entre pasos y la necesidad de selección por validación.

## Benchmarks y rendimiento

Los únicos datos de rendimiento publicados en la informacion disponible son los de HealthBench Professional (precisión ajustada por longitud):

| Modelo / paso | HealthBench Professional (precision ajustada por longitud) |
|---|---|
| hb27b_specgap_simple_retrieval_aicr, paso 60 (checkpoint publicado) | 0,370 |
| hb27b_specgap_simple_retrieval_aicr, paso 75 (mejor validacion de la run, no disponible por rotacion) | 0,392 |
| Qwen/Qwen3.6-27B sin entrenar (linea base) | 0,374 |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni de otros benchmarks en la informacion disponible. Tampoco se ha encontrado informacion adicional en la busqueda web.

## Requisitos de hardware

- Peso de los pesos en bf16: aproximadamente 54,7 GB (tamano real del repositorio).
- VRAM estimada para inferencia en bf16: en torno a 60-70 GB considerando pesos, caché KV y activaciones, dependiendo de la longitud de contexto (no documentada). Requiere GPU de 80 GB (A100 80 GB, H100 80 GB) o tensor parallelism sobre 2 GPU de 48 GB.
- VRAM estimada en cuantizacion de 8 bits: alrededor de 28-35 GB, viable en una A100 40 GB o en 2 GPU consumer de 24 GB.
- VRAM estimada en cuantizacion de 4 bits: alrededor de 15-20 GB, viable en una única RTX 4090 (24 GB), RTX 3090 (24 GB) o L40S, siempre que se conviertan los pesos a GGUF o AWQ/GPTQ.
- GPU recomendadas: H100 80 GB o A100 80 GB para bf16; A100 40 GB o 2x RTX 4090 para 8 bits; RTX 4090 / RTX 3090 para 4 bits.
- Opciones de despliegue: vLLM y TGI soportan pesos safetensors directamente; llama.cpp y Ollama requieren convertir previamente a GGUF; SGLang es otra alternativa compatible con arquitecturas de la familia Qwen.
- Latencia y throughput estimados: no disponible.
- Nota: la model card no documenta requisitos de hardware ni configuraciones de despliegue probadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento (HealthBench Professional, ajustado por longitud) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ddvd233/hb27b_specgap_simple_retrieval_aicr_global_step_60 | ~27,36 B | no disponible | 0,370 (paso 60) | apache-2.0 | HuggingFace, 0 descargas |
| Qwen/Qwen3.6-27B (modelo base, sin entrenar) | ~27 B (no confirmado en la informacion disponible) | no disponible | 0,374 | no disponible en la informacion proporcionada | HuggingFace |
| Otras variantes del mismo experimento RRIMed | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks de modelos alternativos de tamano similar (por ejemplo, otras familias abiertas de 27-32B) en la informacion proporcionada, por lo que no es posible establecer una comparativa cuantitativa más amplia.

## Limitaciones y advertencias

- Advertencia explicita del autor: "Not for clinical use". No debe emplearse en diagnósticos, triajes ni decisiones clínicas.
- Rendimiento por debajo de la linea base: el checkpoint publicado obtiene 0,370 frente a 0,374 del modelo sin entrenar, de modo que el RL con recompensa fija no mejora el resultado en este paso.
- Seleccion de checkpoint suboptima: el mejor paso de validacion de la run (75, con 0,392) no está disponible porque se perdió al rotar los checkpoints; el repositorio solo conserva el paso 60.
- Entrenamiento con tareas escritas por el modelo: el dataset de RL son tareas generadas por el propio modelo, con el riesgo de sesgos y errores que ello implica, y sin validacion clinica humana documentada.
- Evaluacion limitada a una unica familia de benchmarks: HealthBench Professional en su metrica ajustada por longitud; no hay evidencia de generalizacion a otras tareas o dominios.
- Riesgo de alucinacion: no cuantificado en la informacion disponible, pero relevante dado el dominio medico y la ausencia de validacion externa.
- Idiomas soportados: no documentados; se desconoce el comportamiento multilingue.
- Longitud de contexto: no documentada, lo que impide planificar despliegues con requisitos de contexto largo.
- Trazabilidad baja: 0 descargas y 0 likes, sin papers, demos ni repositorios enlazados en la model card, lo que dificulta verificar resultados de forma independiente.
- Licencia: apache-2.0 permite uso comercial del artefacto, pero al tratarse de un control de investigación sin validación clínica, su uso en producción no está justificado técnicamente.
- Busqueda web sin resultados utiles: las consultas devolvieron exclusivamente contenido turístico sobre Lisboa, sin relación con el modelo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ddvd233/hb27b_specgap_simple_retrieval_aicr_global_step_60
- Modelo base Qwen/Qwen3.6-27B: https://huggingface.co/Qwen/Qwen3.6-27B
- Paper RRIMed: no disponible (referenciado en la model card sin enlace)
- Repositorio de codigo: no disponible
- Demo: no disponible
- Otros enlaces relevantes: no se han encontrado en la busqueda web
