# Brunosil22/Orena_FRAME_Track_Qwen3_VL_8B_finetuned

## Resumen

Orena_FRAME_Track_Qwen3_VL_8B_finetuned es un adaptador LoRA (PEFT) sobre el modelo vision-lenguaje Qwen/Qwen3-VL-8B-Instruct, publicado por el usuario Brunosil22 en el marco del reto ICVS-2Ai ORena FOCUS, en su pista FRAME. El modelo resuelve una tarea muy concreta: respuesta a preguntas visuales (VQA) sobre un unico fotograma de cirugia, orientada a la identificacion de cuerpos extranos quirurgicos. El checkpoint publicado corresponde al paso 3300 del conjunto FRAME20K, entrenado a 768 px con LoRA en vision y lenguaje y aumento de imagen, sin anotaciones adicionales.

Se trata, por tanto, de un modelo de nicho y no de un modelo generalista: el repositorio contiene unicamente el adaptador (0,2 GB) y el codigo de inferencia del reto, no los pesos completos del modelo base. La relevancia actual es doble. Por un lado, demuestra un flujo de trabajo reproducible de ajuste fino multimodal de bajo coste sobre un VLM abierto de 8B. Por otro, ataca un caso de uso medico-quirurgico donde la verificacion de material (gasas, agujas, instrumental) es un problema real de seguridad del paciente.

El modelo base Qwen3-VL-8B-Instruct aporta la arquitectura y el grueso de las capacidades; el adaptador solo especializa el comportamiento hacia el formato de respuesta y el dominio quirurgico. No se han publicado resultados de benchmarks ni el adaptador incluye metricas de evaluacion en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre un transformer vision-lenguaje (Qwen3-VL-8B-Instruct) |
| Parametros totales | Aproximadamente 8 000 millones en el modelo base; el adaptador ocupa 0,2 GB en el repositorio (parametros del adaptador no disponibles) |
| Parametros activos | No aplica (el modelo base es denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (consultar la model card del modelo base) |
| Tipos de cuantizacion | No disponible; el adaptador se distribuye en safetensors y puede combinarse con el modelo base para su posterior cuantizacion, no documentada |
| Idiomas soportados | No disponible |
| Licencia | apache-2.0 (debe verificarse tambien la licencia del modelo base) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); pesos base no incluidos en el repositorio |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo Qwen3-VL-8B-Instruct, un transformer multimodal que procesa imagen y texto y genera texto (pipeline `image-text-to-text`). Sobre el se aplica un ajuste fino con LoRA tanto en la torre de vision como en la de lenguaje, segun indica la model card. El entrenamiento se realizo a 768 px de resolucion de entrada, con aumento de imagen, y no se emplearon anotaciones adicionales mas alla del conjunto FRAME20K. El checkpoint publicado es el paso 3300 de ese entrenamiento.

El flujo de inferencia es deliberadamente rigido: `inference.py` carga un unico PNG, lo redimensiona a 768 px, aplica un prompt con marca temporal congelado (`resources/system_prompt.txt`, identico al usado en entrenamiento), genera de forma greedy y normaliza la salida a formatos de respuesta estrictos. Este diseno implica que el adaptador esta fuertemente acoplado a ese prompt y a ese preprocesado; desviarse de ellos puede degradar el rendimiento. En despliegue, el adaptador se fusiono con el modelo base, aunque tambien puede ejecutarse por separado indicando `MODEL_DIR` (modelo base) y `ADAPTER_DIR` (`adapter_step_03300`).

## Capacidades

- Respuesta a preguntas visuales sobre un unico fotograma de imagen quirurgica (single-frame surgical VQA).
- Identificacion de cuerpos extranos quirurgicos (por ejemplo, material o instrumental retenido) dentro del alcance definido por el reto FRAME.
- Generacion de respuestas con formatos estrictos normalizados por el script de inferencia, pensadas para evaluacion automatica.
- Procesamiento de imagen a 768 px con el preprocesado fijo definido en `inference.py`.
- Generacion greedy, reproducible, con el prompt congelado de entrenamiento.
- Capacidades heredadas del modelo base Qwen3-VL-8B-Instruct: no documentadas en esta ficha; deben consultarse en la model card de Qwen.
- Soporte de tool calling o function calling: no documentado en la informacion disponible.
- Soporte de agentes o razonamiento multi-paso: no documentado en la informacion disponible.
- Capacidades multilingues: no disponibles.
- Capacidades especiales (modo thinking, audio, video multipista): no disponibles; la propia denominacion FRAME y la descripcion indican uso sobre un solo fotograma.

## Casos de uso

- Verificacion de recuento de material quirurgico: el adaptador puede aplicarse a un fotograma de la mesa o del campo quirurgico para responder preguntas cerradas sobre presencia o ausencia de un objeto concreto, integrándose en una lista de comprobacion previa al cierre de la intervencion.
- Auditoria retrospectiva de videos quirurgicos: extrayendo fotogramas clave y ejecutando el modelo sobre cada uno, se puede construir un informe de presencia de cuerpos extranos sin necesidad de revision manual completa.
- Etiquetado asistido de conjuntos de datos medicos: dado que respeta formatos de respuesta estrictos, sus salidas normalizadas pueden usarse como preanotaciones que un revisor humano valida despues.
- Investigacion en VQA quirurgica: sirve como linea base reproducible para comparar tecnicas de ajuste fino multimodal (LoRA en vision y lenguaje) sobre un VLM abierto de 8B.
- Formacion y simulacion clinica: sobre imagenes de simuladores o maquetas, el modelo puede generar respuestas de comprobacion que alimenten herramientas de entrenamiento para personal de quirofano.
- Prototipos de asistencia intraoperatoria documental: integrado en un sistema que captura fotogramas y lanza preguntas predefinidas, aporta una senal adicional de alerta (siempre supervisada por un profesional) sobre material no localizado.
- Evaluacion comparativa de adaptadores: el repositorio incluye el prompt exacto y el script de entrada, lo que facilita reproducir la misma tarea con otros adaptadores o modelos base y medir diferencias de comportamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas del reto ICVS-2Ai ORena FOCUS ni resultados en conjuntos como MMLU, HumanEval o GSM8K, y estos ultimos no serian representativos de una tarea de VQA quirurgica de un solo fotograma. Tampoco se documentan latencia, throughput ni puntuaciones del conjunto FRAME20K.

## Requisitos de hardware

- El repositorio solo contiene el adaptador (0,2 GB). Para inferir hay que cargar el modelo base Qwen3-VL-8B-Instruct completo.
- VRAM estimada para el modelo base de 8B (estimacion a partir del numero de parametros, no confirmada por el autor): en precision de 16 bits en torno a 16-18 GB; en cuantizacion de 8 bits en torno a 9-11 GB; en cuantizacion de 4 bits en torno a 5-7 GB. A estas cifras hay que sumar el coste de la torre de vision y de las imagenes a 768 px.
- Cabe en GPU de consumo con cuantizacion: RTX 3090, RTX 4090 (24 GB) pueden ejecutar el modelo en 16 bits con margen limitado; tarjetas de 12-16 GB requeririan cuantizacion.
- GPU recomendadas para produccion: A100 40/80 GB, H100, L40S o similares, segun el nivel de concurrencia.
- Opciones de despliegue: el flujo oficial documentado es `inference.py` con transformers y PEFT (`MODEL_DIR` + `ADAPTER_DIR`). El adaptador tambien puede fusionarse con el modelo base para desplegarlo con servidores compatibles con VLMs (por ejemplo, vLLM con soporte de LoRA). El soporte de llama.cpp, Ollama o TGI no esta documentado en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos verificables de otros adaptadores equivalentes en la informacion proporcionada, por lo que la comparacion se limita al modelo base y a filas marcadas como no disponibles. No se incluyen cifras de rendimiento porque no se han publicado.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Orena_FRAME_Track_Qwen3_VL_8B_finetuned (este modelo) | Adaptador LoRA sobre base de ~8B | No disponible | No se han publicado benchmarks | apache-2.0 | Repositorio PEFT, 0 descargas y 0 likes en el momento de la consulta |
| Qwen/Qwen3-VL-8B-Instruct (modelo base) | ~8B | No disponible en la informacion proporcionada | No disponible en la informacion proporcionada | Consultar la model card del base | Modelo publico en HuggingFace |
| Otros adaptadores de VQA medica comparables | No disponible | No disponible | No disponible | No disponible | No identificados en la informacion disponible |

## Limitaciones y advertencias

- Alcance muy restringido: esta entrenado para VQA quirurgica de un solo fotograma; no procesa video ni razonamiento temporal.
- Fuerte acoplamiento al prompt y al preprocesado: la model card indica que el prompt esta congelado e identico en entrenamiento e inferencia, y que la imagen se redimensiona a 768 px. Cambiar cualquiera de los dos puede degradar la salida.
- La normalizacion de formatos la realiza el script `inference.py`, no el modelo; fuera de ese script las respuestas pueden no cumplir el formato esperado.
- Riesgo de alucinacion: es un modelo generativo aplicado a un dominio critico. Una respuesta incorrecta sobre presencia o ausencia de material quirurgico puede tener consecuencias graves.
- No debe utilizarse como dispositivo medico ni para decision clinica autonoma; cualquier uso real exige supervision de personal cualificado y validacion regulatoria independiente.
- Sesgos: no documentados por el autor; no se detalla la composicion demografica ni la procedencia de FRAME20K.
- Idiomas soportados no especificados; el prompt de entrenamiento esta en un unico idioma no indicado en la informacion disponible.
- Licencia: el adaptador se publica bajo apache-2.0, lo que en principio permite uso comercial, pero debe verificarse la licencia y las condiciones del modelo base antes de un despliegue en produccion.
- Adopcion nula en el momento de la consulta (0 descargas, 0 likes) y ausencia de metricas publicadas: no hay evidencia externa de calidad.
- Entrenado sin anotaciones adicionales; el autor no documenta tecnicas de RLHF o DPO, ni el numero total de tokens vistos.

## Enlaces

- Repositorio del modelo: https://huggingface.co/Brunosil22/Orena_FRAME_Track_Qwen3_VL_8B_finetuned
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-8B-Instruct
- Archivos internos citados en la model card: `adapter_step_03300/`, `inference.py`, `resources/system_prompt.txt`
- Las busquedas web realizadas no devolvieron enlaces relevantes al modelo, al reto ICVS-2Ai ORena FOCUS ni al conjunto FRAME20K; los resultados obtenidos correspondian a sitios de peliculas sin relacion con el contenido. No se han podido localizar papers, blogs o demos adicionales.
