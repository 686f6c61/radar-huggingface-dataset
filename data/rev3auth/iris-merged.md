# Rev3auth/iris-merged

## Resumen

Rev3auth/iris-merged es un modelo de generación de texto publicado en HuggingFace por el usuario Rev3auth. Se trata de un checkpoint de aproximadamente 134,5 millones de parámetros almacenado en safetensors (0,3 GB de repositorio), etiquetado con la arquitectura llama y compatible con la librería transformers y con text-generation-inference. El nombre "merged" sugiere que se ha generado mediante la fusión de dos o más checkpoints, pero el autor no documenta el procedimiento, los modelos de origen ni la receta de entrenamiento.

La model card es la plantilla automática de HuggingFace sin rellenar: todos los campos relevantes (desarrollador, tipo de modelo, idiomas, licencia, datos de entrenamiento, hiperparámetros, evaluación) aparecen con el texto "[More Information Needed]". Esto convierte al modelo en una caja negra desde el punto de vista técnico: se conocen el recuento de parámetros y el formato de los pesos, pero no la longitud de contexto, el tokenizador, el dataset ni el régimen de entrenamiento.

Su relevancia actual es limitada y de carácter experimental: al no haber benchmarks publicados, ni licencia declarada, ni descargas (0 descargas y 0 "likes" en el momento de la consulta), no es un artefacto recomendable para producción. Puede resultar de interés únicamente como objeto de estudio para quien quiera inspeccionar una fusión de modelos de tamaño reducido o comparar su comportamiento con alternativas pequeñas bien documentadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (el Hub la etiqueta como "llama"; sin confirmar en la model card) |
| Parametros totales | 134.515.008 (aprox. 134,5 M) |
| Parametros activos | No aplica / no disponible (no se documenta que sea un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (el repositorio solo publica safetensors; no hay GGUF ni AWQ/GPTQ) |
| Idiomas soportados | No disponible |
| Licencia | No disponible (campo sin rellenar en la model card) |
| Formato de pesos | safetensors |
| Libreria | transformers |
| Pipeline | text-generation |
| Tamano del repositorio | 0,3 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creacion en el Hub | 2026-09-27 |
| Ultima actualizacion en el Hub | 2026-09-27 |

## Arquitectura y entrenamiento

No hay informacion sobre la arquitectura mas alla de la etiqueta "llama" del Hub y de la libreria declarada (transformers). Con 134,5 millones de parametros y un repositorio de 0,3 GB, el checkpoint es coherente con un transformer decoder-only de tamano pequeno en precision de 16 bits, pero no se especifican el numero de capas, las dimensiones ocultas, el numero de cabezas de atencion, el vocabulario ni el tokenizador asociado. Tampoco se indica si emplea atencion con RoPE, GQA, atencion lineal u otro esquema.

Respecto al entrenamiento, la model card no proporciona ningun dato: ni el numero de tokens, ni la composicion del dataset, ni si hubo ajuste por instrucciones (SFT), RLHF o DPO. El sufijo "merged" apunta a una fusion de pesos (por ejemplo, mediante tecnicas tipo SLERP, TIES o DARE), pero sin la receta no es posible reproducir el resultado ni atribuir el comportamiento observado a los modelos originales. El unico identificador tecnico adicional es la referencia arXiv:1910.09700, que en la propia plantilla de HuggingFace corresponde al articulo de Lacoste et al. sobre estimacion de emisiones de carbono, no a un paper del modelo.

## Capacidades

- Generacion de texto autoregresiva basica: el pipeline declarado es text-generation y la etiqueta "conversational" sugiere cierto ajuste para dialogos, aunque no se aportan ejemplos ni plantillas de chat.
- Conversacion multi-turno: potencialmente soportada por la etiqueta "conversational", sin evidencia documental de calidad ni de formato de prompt requerido.
- Compatibilidad con text-generation-inference y con endpoints compatibles de HuggingFace, segun los tags del repositorio.
- Soporte de tool calling / function calling: no disponible (no se documenta).
- Soporte de agentes y razonamiento multi-paso: no disponible (no se documenta).
- Capacidades multilingues: no disponibles (el campo de idiomas no esta relleno y no hay tokenizador publicado que permita inferirlo).
- Capacidades especiales (modo "thinking", vision, audio, decodificacion especulativa): no disponibles (no se documenta ninguna).

## Casos de uso

- Prototipado rapido de interfaces conversacionales: al ser un checkpoint de 134,5 M de parametros (0,3 GB), se puede cargar en memoria en segundos y usar como sustituto desechable en pruebas de UI antes de integrar un modelo definitivo del mismo rol.
- Fine-tuning ligero para tareas de dominio cerrado: con ese tamano, un ajuste supervisado sobre unos miles de ejemplos cabe en una GPU de consumo; el checkpoint "merged" puede servir como inicializacion alternativa frente a un modelo base equivalente.
- Generacion de texto de baja latencia en CPU: los pesos en fp32 ocupan aproximadamente 538 MB y en fp16 unos 269 MB, de modo que es viable en entornos sin GPU dedicada para tareas de autocompletado o resumen de frases cortas.
- Despliegue en el borde (edge) y en dispositivos con memoria limitada: al no existir cuantizaciones publicadas, habria que generarlas localmente (por ejemplo con llama.cpp) antes de plantear su uso en movil o embebido.
- Experimentacion academica sobre fusion de modelos: dado el sufijo "merged", el checkpoint es un candidato razonable para estudiar el efecto de la fusion de pesos en modelos pequenos, comparando sus salidas con las de los presuntos modelos de origen.
- Pruebas de regresion de infraestructura de inferencia: sirve para validar pipelines de transformers, TGI o endpoints compatibles con un modelo de bajo coste antes de escalar a uno de mayor tamano.
- Evaluacion de sesgos y alucinacion en modelos no documentados: util como caso de estudio metodologico sobre que ocurre cuando se despliega un modelo sin model card, sin licencia y sin benchmarks.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye seccion de evaluacion con datos (todos los campos figuran como "[More Information Needed]") y la busqueda web realizada no devolvio ningun resultado relacionado con este modelo: los resultados obtenidos tratan sobre declaraciones de Scarlett Johansson en entrevistas y no guardan relacion con Rev3auth/iris-merged.

## Requisitos de hardware

- VRAM estimada para inferencia (calculada a partir de los 134.515.008 parametros; no son cifras publicadas por el autor): aproximadamente 538 MB en fp32, 269 MB en fp16/bf16, 135 MB en int8 y unos 70-80 MB en int4.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM libre es suficiente en la practica; una NVIDIA RTX 3060, RTX 4090, A100 o H100 estan sobradamente dimensionadas y lo unico que aportarian es mayor velocidad, no mayor capacidad.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU de consumo de los ultimos diez anos, e incluso en iGPU con memoria compartida suficiente.
- CPU: es viable en inferencia en CPU, ya que el modelo completo en fp32 ocupa unos 538 MB.
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference (tag explicito) y endpoints compatibles. No hay GGUF publicado, por lo que Ollama y llama.cpp requeririan una conversion previa de los safetensors. vLLM y TGI son tecnicamente compatibles con safetensors, pero habria que verificar la configuracion de arquitectura antes de arrancarlos.
- Latencia y throughput estimados: no disponibles (no hay mediciones publicadas).

## Comparativa con modelos similares

Los datos de la columna de "iris-merged" son los unicos verificados en la informacion suministrada; los de los modelos comparables provienen de sus fichas publicas, que pueden cambiar, y se incluyen solo como referencia de categoria.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Rev3auth/iris-merged | 134,5 M | No disponible | No disponible | HuggingFace, 0 descargas, sin cuantizaciones |
| SmolLM-135M (HuggingFaceTB) | 135 M | 2.048 tokens | Apache-2.0 | HuggingFace, ampliamente descargado |
| Qwen2.5-0.5B (Alibaba) | 494 M | 32.768 tokens | Apache-2.0 | HuggingFace, cuantizaciones GGUF/AWQ disponibles |
| Llama-3.2-1B (Meta) | 1.240 M | 128.000 tokens | Llama 3.2 Community License | HuggingFace, con restricciones de uso |

En la misma franja de parametros, SmolLM-135M ofrece documentacion completa, licencia permisiva y contexto declarado, por lo que es una alternativa mas segura para cualquier uso real. Qwen2.5-0.5B y Llama-3.2-1B suben de tamano y de contexto, pero aportan garantias legales y tecnicas de las que iris-merged carece.

## Limitaciones y advertencias

- Ausencia total de model card: no se documentan datos de entrenamiento, hiperparametros, tokenizador ni proceso de alineacion, lo que impide auditar el modelo.
- Licencia no disponible: sin licencia declarada no hay autorizacion explicita de uso comercial; en la practica, el modelo queda en un limbo legal que desaconseja cualquier despliegue en produccion.
- Riesgo elevado de alucinacion: en modelos de 134 M de parametros, la generacion de hechos es poco fiable por capacidad, agravado aqui por la falta de evaluacion.
- Sesgos desconocidos: al no conocerse la composicion del corpus de entrenamiento, no es posible estimar sesgos de genero, raza, idioma o ideologia.
- Cobertura idiomatica desconocida: el campo de idiomas esta vacio y no hay tokenizador publicado; no se puede asumir un buen rendimiento en castellano.
- Longitud de contexto desconocida: cualquier caso de uso con conversaciones largas o documentos extensos requeriria una verificacion empirica previa.
- Sin cuantizaciones oficiales ni ficheros GGUF: el despliegue en llama.cpp, Ollama o LM Studio exige conversion manual y validacion posterior.
- Cero traccion en el Hub (0 descargas, 0 likes): no hay retroalimentacion de la comunidad que permita detectar fallos conocidos.
- La unica referencia arXiv de la ficha (1910.09700) es la plantilla de estimacion de emisiones de carbono de HuggingFace, no un paper del modelo; citarla como documentacion tecnica seria un error.
- Los resultados de la busqueda web no contienen ningun material relacionado con el modelo, por lo que no existe literatura externa que lo respalde.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Rev3auth/iris-merged
- Referencia arXiv incluida en la plantilla de la model card (Lacoste et al., 2019, estimacion de emisiones): https://arxiv.org/abs/1910.09700
- Calculadora de impacto ambiental de Machine Learning citada en la model card: https://mloc2.github.io/impact (enlace original de la plantilla: https://mlco2.github.io/impact)
- Repositorio de transformers: https://github.com/huggingface/transformers
- Repositorio de text-generation-inference: https://github.com/huggingface/text-generation-inference
- No se han encontrado papers, blogs, demos ni repositorios adicionales asociados a este modelo en la busqueda web realizada.
