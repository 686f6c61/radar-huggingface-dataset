# orlandorubino/Qwen3-1.7B-heretic

## Resumen

Qwen3-1.7B-heretic es una variante "abliterada" (sin censura) del modelo denso Qwen/Qwen3-1.7B, publicada por el usuario orlandorubino en HuggingFace. La modificacion se ha realizado con la herramienta Heretic, que localiza la direccion de rechazo en el espacio de activaciones y la anula en los pesos mediante ortogonalizacion, buscando con Optuna los parametros que minimizan los rechazos manteniendo baja la divergencia KL respecto al modelo original. El resultado declarado por el autor es una reduccion de rechazos de 92/100 a 3/100 con una divergencia KL de 0,0566.

El modelo conserva la arquitectura del original: transformer denso de 1.720.574.976 parametros (aproximadamente 1,7 mil millones), pesos en BF16 y licencia Apache 2.0. El repositorio ocupa 3,5 GB e incluye pesos en safetensors compatibles con transformers y text-generation-inference. Los idiomas declarados son ingles y espanol.

Su relevancia es doble. Por un lado, es un ejemplo reproducible y de bajo coste del proceso de abliteracion: el autor detalla que ejecuto el proceso en BF16 sobre una unica GPU de 8 GB (RTX 2060 Super) con solo 25 pruebas de Optuna y unos 45 minutos de computo. Por otro lado, ofrece un modelo de 1,7 B parametros sin salvaguardas de rechazo, util para investigacion sobre alineacion, evaluacion de sesgos y experimentacion con modelos pequenos desplegables en hardware de consumo, aunque con los riesgos legales y eticos que ello implica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Qwen3); sin mezcla de expertos |
| Parametros totales | 1.720.574.976 (1,7 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens nativos segun el informe tecnico de Qwen3; no confirmado en la model card de esta variante |
| Tipos de cuantizacion | BF16 (pesos del repositorio); 4 bits NF4 mediante BitsAndBytes segun la model card; no se incluyen archivos GGUF |
| Idiomas soportados | Ingles (en) y espanol (es) declarados en la model card |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (BF16), libreria transformers |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base Qwen/Qwen3-1.7B: un transformer denso de 1,7 B parametros perteneciente a la familia Qwen3, que incluye modelos densos y de mezcla de expertos (MoE) con escalas de 0,6 a 235 mil millones de parametros segun el informe tecnico de Qwen3. No se ha realizado ningun reentrenamiento ni ajuste fino supervisado adicional: el repositorio no documenta nuevas fases de preentrenamiento, SFT, RLHF o DPO.

La unica modificacion es la abliteracion aplicada con Heretic. El procedimiento compara representaciones internas ante prompts inofensivos y ante prompts que provocan rechazo para estimar una "direccion de rechazo" en el espacio de activaciones, y despues proyecta los pesos ortogonalmente contra esa direccion para suprimirla. Los hiperparametros se eligen con Optuna mediante un objetivo doble: maximizar la tasa de cumplimiento y minimizar la divergencia KL frente al modelo original, de forma que se preserve al maximo la capacidad del modelo. En esta publicacion se limito la busqueda a 25 pruebas (frente a las 200 por defecto) con batch_size 8, ejecutadas en BF16 sobre una RTX 2060 Super de 8 GB, seleccionandose la prueba numero 19. No se documentan innovaciones adicionales de decodificacion, atencion lineal ni tecnicas de inferencia especulativa.

## Capacidades

- Generacion de texto conversacional en ingles y espanol, heredada del modelo base Qwen3-1.7B.
- Razonamiento basico y resolucion de problemas de complejidad baja propios de un modelo de 1,7 B parametros.
- Generacion de codigo y soporte a tareas de matematicas elementales, capacidades destacadas por el fabricante en la ficha de Qwen3-1.7B.
- Reduccion drastica de rechazos: 3/100 en el conjunto de prompts "malos" del autor, frente a 92/100 del modelo original.
- Soporte de tool calling / function calling: no confirmado de forma explicita en la model card de esta variante; el modelo base Qwen3 lo contempla, pero no se ha verificado su conservacion tras la abliteracion.
- Comportamiento de agente y razonamiento multi-paso: no verificado en esta variante.
- Modo de razonamiento (thinking) del modelo base Qwen3: no se especifica si se ha preservado tras el proceso de abliteracion.
- Capacidades multimodales: no disponibles (no hay vision ni audio).

## Casos de uso

- Investigacion sobre alineacion y seguridad: permite estudiar empiricamente como se comporta un modelo sin mecanismos de rechazo y medir el impacto de la abliteracion sobre las capacidades originales, usando la divergencia KL (0,0566) como referencia cuantitativa.
- Evaluacion de sesgos y toxicidad: util como sujeto de pruebas en pipelines de red-teaming y benchmarks de seguridad, al reducir la friccion de generar respuestas que otros modelos bloquean.
- Generacion creativa sin restricciones tematicas: escritura de ficcion, guiones o dialogos con tematicas adultas o controvertidas que los modelos alineados rechazan, en un entorno controlado y con supervision humana.
- Prototipado local en hardware modesto: con cuantizacion NF4 en 4 bits ocupa aproximadamente 1 GB de pesos, por lo que cabe en GPUs de gama media y permite experimentar con inferencia local sin coste de API.
- Experimentos academicos de destilacion o comparacion: sirve como punto de comparacion frente a Qwen3-1.7B original para cuantificar cuanto afecta la ablacion de la direccion de rechazo al rendimiento general.
- Chatbot especializado sin filtros para dominios tecnicos: por ejemplo, asistencia en ciberseguridad ofensiva documentada o analisis de contenido sensible, donde los rechazos automaticos de otros modelos interrumpen la tarea.
- Generacion de datos sinteticos para datasets: puede emplearse para producir corpus de texto diverso, incluido contenido que otros modelos se negarian a generar, siempre que se cumpla la legalidad aplicable.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. El autor unicamente reporta las dos metricas del proceso de abliteracion:

| Metrica | Original (Qwen3-1.7B) | Qwen3-1.7B-heretic |
|---|---|---|
| Rechazos (prompts "malos") | 92/100 | 3/100 |
| Divergencia KL | 0 | 0,0566 |

No hay datos de rendimiento en tareas de razonamiento, codigo o matematicas para esta variante concreta.

## Requisitos de hardware

- VRAM estimada en BF16: aproximadamente 3,5 GB solo para los pesos, mas la cache KV; en la practica se recomiendan entre 4 y 6 GB de VRAM.
- VRAM estimada en 4 bits (NF4 con BitsAndBytes): alrededor de 1 GB de pesos, manejable con 2-3 GB de VRAM.
- El propio autor ejecuto el proceso de abliteracion completo en BF16 sobre una RTX 2060 Super de 8 GB, lo que confirma que la inferencia en precision completa cabe en GPUs de gama media de generaciones recientes.
- GPU recomendadas: cualquier GPU consumer con 6 GB o mas de VRAM (RTX 3060, RTX 4060, RTX 2070 en adelante); en el extremo alto, RTX 4090, A100 o H100 para despliegues con alto throughput o lotes grandes.
- Si cabe en GPU de consumo: si, tanto en BF16 en GPUs de 6-8 GB como en 4 bits en GPUs de 4 GB o incluso en CPU con cuantizacion.
- Opciones de despliegue: transformers (referencia oficial del repositorio), text-generation-inference (etiqueta endpoints_compatible), vLLM, y conversion a GGUF para llama.cpp, Ollama o LM Studio (los archivos GGUF no vienen incluidos y habria que generarlos).
- Latencia y throughput: no disponibles. No se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Estado de alineacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3-1.7B-heretic | 1,7 B (denso) | 32.768 tokens (segun informe de Qwen3) | Abliterado, 3/100 rechazos | Apache 2.0 | HuggingFace, safetensors BF16 |
| Qwen/Qwen3-1.7B | 1,7 B (denso) | 32.768 tokens | Alineado, 92/100 rechazos | Apache 2.0 | HuggingFace, Ollama (qwen3:1.7b) |
| Otros modelos abliterados de ~1-2 B | Variable | No disponible | Abliterado | Depende del modelo base | Disponibles en HuggingFace |
| Alternativas densas de ~1-2 B (por ejemplo Llama 3.2 1B, Gemma 3 1B) | 1-2 B | No disponible en esta busqueda | Alineados | Licencias propias de cada fabricante | HuggingFace |

No se dispone de datos de rendimiento comparativos entre estas alternativas en la informacion proporcionada, por lo que la comparacion se limita a parametros, contexto, licencia y estado de alineacion.

## Limitaciones y advertencias

- Eliminacion deliberada de salvaguardas: el modelo presenta solo 3 rechazos de cada 100 prompts problematicos, por lo que puede generar contenido danino, ilegal o eticamente cuestionable. El uso responsable recae integramente en quien lo despliega.
- Divergencia respecto al original: la divergencia KL de 0,0566 indica una desviacion medible de la distribucion del modelo base; aunque es baja, implica degradacion potencial en algunas tareas.
- Busqueda de hiperparametros reducida: solo 25 pruebas de Optuna en lugar de las 200 por defecto, en unos 45 minutos, lo que sugiere que los parametros elegidos no son necesariamente optimos.
- Capacidad limitada por tamano: con 1,7 B parametros, el modelo es propenso a errores en razonamiento complejo, matematicas avanzadas y generacion de codigo extenso, y es mas sensible a alucinaciones que modelos mayores.
- Cobertura idiomatica restringida: solo ingles y espanol declarados; no hay garantia de calidad en otros idiomas.
- Contexto limitado: 32.768 tokens es una ventana modesta para tareas de documento largo, y no se documenta en esta variante la extension por YaRN que ofrece la familia Qwen3.
- Sin datos de benchmarks: no se ha verificado el rendimiento en MMLU, HumanEval, GSM8K ni en tareas de tool calling o agentes, por lo que no se recomienda su uso en produccion critica sin evaluacion propia.
- Advertencia legal: la licencia Apache 2.0 cubre el modelo, pero el uso debe cumplir la legislacion aplicable; la ausencia de filtros no exime de responsabilidad legal por el contenido generado.
- Escasa validacion por la comunidad: con 137 descargas y 0 likes en el momento de la consulta, no existe un cuerpo de evaluaciones independientes que respalde su calidad o estabilidad.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/orlandorubino/Qwen3-1.7B-heretic
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
- Herramienta Heretic: https://github.com/p-e-w/heretic
- Informe tecnico de Qwen3 (arXiv): https://arxiv.org/html/2505.09388v1
- Qwen3-1.7B en Ollama: https://ollama.com/library/qwen3:1.7b
- Qwen3-1.7B en Qualcomm AI Hub: https://aihub.qualcomm.com/models/qwen3_1_7b
