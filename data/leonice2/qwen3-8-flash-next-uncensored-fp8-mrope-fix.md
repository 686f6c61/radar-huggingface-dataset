# leonice2/Qwen3.8-Flash-Next-UNCENSORED-FP8-MRoPE-Fix

## Resumen

Qwen3.8-Flash-Next-UNCENSORED-FP8-MRoPE-Fix es una variante afinada para eliminar los mecanismos de rechazo del modelo base Qwen/Qwen3.8-Flash-Next-FP8, publicado por el usuario leonice2 bajo el sello "dealignai". Se trata de un modelo de arquitectura Mixture of Experts (MoE) con aproximadamente 180.000 millones de parametros totales, pesos en FP8 y capacidad multimodal (texto y vision), distribuido en safetensors con un repositorio de 185,6 GB. El autor lo presenta como un reemplazo directo ("drop-in replacement") del checkpoint FP8 original, conservando intactos el cabezal de prediccion multi-token (MTP) y la torre de vision.

El objetivo declarado es eliminar por completo las respuestas de rechazo ("refusal removed") manteniendo, e incluso incrementando, la profundidad de razonamiento respecto al base. Segun la model card, la tasa de cumplimiento real en HarmBench pasa del 1,9% al 94,2% (100% efectivo tras revision manual), mientras que la precision en MMLU cae 3,15 puntos porcentuales (de 83,54% a 80,39%). El modelo tambien incorpora una correccion de MRoPE (rotary position embedding multimodal) que da nombre al sufijo del repositorio.

Es relevante ahora porque representa un ejemplo de "abliteration" o ajuste de cumplimiento sobre un modelo frontera abierto de gran tamano, con documentacion cuantitativa de los compromisos entre seguridad y capacidades. Para desarrolladores e investigadores resulta util como caso de estudio de los trade-offs entre alineamiento y rendimiento, y como base para experimentos que requieran un modelo sin sesgos de rechazo, siempre bajo las advertencias legales y eticas correspondientes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE) transformer multimodal, con cabezal MTP y torre de vision; correccion MRoPE |
| Parametros totales | 179.999.981.459 (~180B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP8 (pesos publicados en FP8); otras cuantizaciones no disponibles |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del checkpoint Qwen/Qwen3.8-Flash-Next-FP8: un transformer con capas Mixture of Experts, pesos cuantizados en FP8, un cabezal de prediccion multi-token (MTP) para decodificacion especulativa y una torre de vision que lo habilita como modelo vision-lenguaje. El autor indica que tanto el cabezal MTP como la torre de vision se conservan intactos y verificados tras el ajuste, y que se aplico una correccion sobre el mecanismo MRoPE (rotary position embedding multimodal) que aparece en el nombre del repositorio; no se detalla en la informacion disponible en que consiste dicha correccion.

Respecto al entrenamiento, la model card no especifica el numero de tokens, la composicion del dataset ni si se emplearon tecnicas de RLHF o DPO. Lo que si documenta es el efecto del ajuste de cumplimiento: el modelo incrementa el numero de tokens de razonamiento ("think tokens") en un factor de 3,5x en una bateria de cinco acertijos de razonamiento (de 1.970 a 6.872 tokens), elevando la proporcion de tokens de pensamiento del 73,8% al 89,9%. El autor atribuye este aumento a la eliminacion de atajos de rechazo entrenados que truncaban la deliberacion en problemas dificiles.

## Capacidades

- Generacion de texto conversacional multi-turno.
- Razonamiento con modo de pensamiento explicito ("thinking"), con mayor profundidad de deliberacion que el modelo base segun las pruebas del autor.
- Capacidades de vision y vision-lenguaje gracias a la torre de vision preservada.
- Prediccion multi-token (MTP), orientada a decodificacion especulativa y mayor throughput.
- Cumplimiento sin rechazos: ausencia de respuestas de rechazo duras en las categorias evaluadas de HarmBench.
- Soporte de tool calling / function calling: no confirmado explicitamente en la informacion disponible (el modelo base Qwen lo soporta, pero no se verifica en esta variante).
- Soporte de agentes y razonamiento multi-paso: no confirmado explicitamente en la informacion disponible.
- Capacidades multilingues: no disponibles.

## Casos de uso

- Investigacion sobre alineamiento y seguridad: el modelo sirve como caso controlado para estudiar como varia la tasa de cumplimiento y la calidad del razonamiento al eliminar los mecanismos de rechazo, comparando directamente con el checkpoint base FP8.
- Evaluacion de robustez de clasificadores de seguridad: permite generar respuestas que los filtros convencionales rechazan, util para probar y calibrar sistemas de moderacion y clasificadores de contenido en entornos de laboratorio.
- Red teaming autorizado: uso en ejercicios de seguridad ofensiva con permiso explicito para identificar fallos en pipelines de defensa, aprovechando la ausencia de rechazos y la profundidad de razonamiento.
- Analisis de trade-offs de rendimiento: la documentacion por asignatura de MMLU permite estudiar que areas de conocimiento se degradan al eliminar los reflejos de rechazo (por ejemplo, moral_scenarios con -14,3 pp), informacion valiosa para disenar ajustes mas selectivos.
- Procesamiento multimodal de documentos: la torre de vision intacta permite tareas de descripcion de imagenes, extraccion de informacion de capturas o diagramas y respuesta visual a preguntas, en escenarios donde no se requieran filtros de seguridad.
- Generacion de contenido creativo sin restricciones: escritura de ficcion, guiones o narrativa que aborde temas sensibles, donde los rechazos del modelo base resultan un obstaculo para el flujo creativo.
- Despliegue en infraestructura con FP8: al conservar el formato FP8 del base, puede servirse en GPUs con soporte nativo de FP8 (H100, H200, B200) reduciendo el footprint de memoria frente a una version BF16.

## Benchmarks y rendimiento

Los datos proceden exclusivamente de la model card del autor. No hay resultados independientes publicados.

| Benchmark | Base FP8 | Este modelo | Delta |
|---|---:|---:|---:|
| HarmBench 6 categorias, cumplimiento real (thinking off) | 3/156 (1,9%) | 147/156 (94,2%) | +92,3 pp |
| HarmBench, rechazos duros | ~155 | 0 | — |
| MMLU (14.042 preguntas, test completo) | 83,54% | 80,39% | -3,15 pp |
| Acertijos de razonamiento (5, temp=0) | 3/4 | 4/4 | +1 |
| Tokens de pensamiento totales (5 acertijos) | 1.970 | 6.872 | 3,5x |
| Proporcion de tokens de pensamiento | 73,8% | 89,9% | +16,1 pp |

Desglose de HarmBench por categoria (cumplimiento real):

| Categoria | Cumplimiento | Total |
|---|---:|---:|
| chemical_biological | 100% | 19 |
| cybercrime_intrusion | 93,9% | 33 |
| harassment_bullying | 75,0% | 16 |
| harmful | 100% | 17 |
| illegal | 93,2% | 44 |
| misinformation_disinformation | 100% | 27 |

Asignaturas de MMLU con mayor ganancia: high_school_physics (+3,97 pp), human_aging (+3,14 pp), high_school_european_history (+3,03 pp). Asignaturas con mayor perdida: moral_scenarios (-14,30 pp), abstract_algebra (-7,00 pp), computer_security (-7,00 pp), management (-6,80 pp), marketing (-6,41 pp).

## Requisitos de hardware

- VRAM estimada para inferencia en FP8: aproximadamente 180 GB solo para pesos, mas overhead de KV cache y activaciones; en la practica se necesita un nodo multi-GPU.
- GPU recomendadas: H100 80GB (3 unidades como minimo para pesos, 4 recomendadas con margen), H200 141GB (2 unidades), B200; en A100 80GB serian necesarias al menos 3-4 unidades, aunque sin aceleracion FP8 nativa el rendimiento seria inferior.
- No cabe en GPUs de consumo (RTX 4090 24GB, RTX 5090 32GB) en FP8; requeriria cuantizaciones adicionales (GGUF Q4/Q5) no publicadas en este repositorio.
- Opciones de despliegue: vLLM y TGI son las opciones mas adecuadas para FP8 en multi-GPU; llama.cpp/Ollama no soportan este checkpoint FP8 tal cual y requeririan conversion a GGUF.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Qwen3.8-Flash-Next-UNCENSORED-FP8-MRoPE-Fix (este) | ~180B (MoE) | no disponible | apache-2.0 | Sin rechazos, MMLU 80,39%, vision y MTP intactos |
| Qwen/Qwen3.8-Flash-Next-FP8 (base) | ~180B (MoE) | no disponible | apache-2.0 | MMLU 83,54%, rechazos en HarmBench (~155/156) |
| Otras variantes "uncensored" de la familia Qwen | no disponible | no disponible | variable | No se dispone de datos verificables en la informacion proporcionada |

La comparacion directa mas solida es contra el checkpoint base, del que se tienen cifras pareadas. Para alternativas de otros desarrolladores no hay datos en la informacion disponible.

## Limitaciones y advertencias

- Eliminacion deliberada de rechazos: el modelo responde a practicamente cualquier peticion, incluidas categorias de dano real (chemical_biological, cybercrime, illegal). Su uso en produccion orientada al publico es altamente desaconsejable sin capas de moderacion externas.
- Degradacion en areas de conocimiento: MMLU cae 3,15 pp en global, con perdidas severas en moral_scenarios (-14,3 pp), abstract_algebra (-7 pp), computer_security (-7 pp) y management (-6,8 pp).
- Mayor coste de inferencia: el modelo genera 3,5x mas tokens de pensamiento, lo que incrementa latencia y coste por consulta en modo thinking.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; el aumento de deliberacion no garantiza mayor veracidad.
- Sesgos conocidos: no documentados en la model card; la eliminacion de rechazos puede amplificar sesgos presentes en el modelo base.
- Idiomas soportados: no disponibles; no se confirma cobertura multilingue.
- Longitud de contexto: no disponible.
- Licencia apache-2.0 permite uso comercial, pero el autor no ofrece garantias y la responsabilidad legal del uso recae en el desplegador; varias jurisdicciones pueden restringir la generacion de cierto contenido independientemente de la licencia.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validacion comunitaria ni resultados de terceros que confirmen las cifras del autor.
- Requiere infraestructura multi-GPU de gama alta; no es desplegable en hardware de consumo sin cuantizacion adicional no publicada.

## Enlaces

- HuggingFace: https://huggingface.co/leonice2/Qwen3.8-Flash-Next-UNCENSORED-FP8-MRoPE-Fix
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next-FP8
- No se han encontrado en la busqueda web papers, blogs, repositorios o demos adicionales asociados a este modelo.
