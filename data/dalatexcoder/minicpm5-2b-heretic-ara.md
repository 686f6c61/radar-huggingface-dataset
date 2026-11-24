# dalatexcoder/MiniCPM5-2B-heretic-ara

## Resumen

MiniCPM5-2B-heretic-ara es una variante "abliterated" del modelo openbmb/MiniCPM5-2B, un transformer denso de 2.516.756.480 parametros desarrollado por OpenBMB dentro de la familia MiniCPM5. La modificacion la firma el usuario dalatexcoder y se ha realizado con la herramienta Heretic v1.2.0 aplicando el metodo Arbitrary-Rank Ablation (ARA) con preservacion de la norma de fila. El objetivo es eliminar el comportamiento de rechazo (refusals) del modelo original sin reentrenar: se interviene sobre los pesos de las capas 9 a 32 para suprimir la direccion de activacion asociada a las negativas, manteniendo al mismo tiempo la mayor parte del comportamiento original.

El modelo base esta disenado para despliegue en dispositivo, entornos locales y escenarios con recursos limitados, y segun su model card alcanza SOTA en la categoria de 2B parametros, compitiendo con modelos de 4B en codigo, matematicas, comprension de contexto largo, uso de herramientas y tareas agenticas. Soporta contexto largo y tool calling, y se distribuye con licencia Apache 2.0, lo que permite uso comercial sin restricciones adicionales.

La relevancia de esta variante concreta es doble: por un lado, ofrece una version sin censura de un modelo pequeno y eficiente para casos donde el filtrado del modelo base resulta un obstaculo (investigacion sobre alineacion, generacion creativa sin restricciones, evaluacion de sesgos); por otro, su tabla de rendimiento reporta una divergencia KL de 0.0077 frente al original y una reduccion de rechazos de 99/100 a 4/100, lo que sugiere que la ablacion es agresiva en la supresion de negativas pero conserva en gran medida la distribucion de salida.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia MiniCPM5, compatible con arquitectura Llama) |
| Parametros totales | 2.516.756.480 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible en la informacion proporcionada (etiquetado como long-context) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada (pesos en safetensors; cuantizaciones GGUF no confirmadas) |
| Idiomas soportados | ingles (en), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers) |
| Tamano del repositorio | 10.1 GB |
| Modelo base | openbmb/MiniCPM5-2B |
| Metodo de modificacion | Heretic v1.2.0 con Arbitrary-Rank Ablation (ARA) y preservacion de norma de fila |
| Capas intervenidas | indices 9 a 32 |

## Arquitectura y entrenamiento

El modelo base es un transformer denso de aproximadamente 2.5B parametros perteneciente a la serie MiniCPM5 de OpenBMB, que escala la receta de entrenamiento de MiniCPM5-1B. La model card del modelo base cita como fuentes de datos los conjuntos Ultra-FineWeb, UltraX-Preview, Ultra-FineWeb-L3, UltraData-Math, UltraData-Code, UltraData-SFT-2605, UltraData-SFT-Agent-2609 y UltraData-RL-2609, lo que indica un pipeline que combina preentrenamiento web de alta calidad, datos matematicos y de codigo, SFT y una fase de aprendizaje por refuerzo. No se detalla en la informacion disponible el numero exacto de tokens de entrenamiento ni la composicion porcentual de cada conjunto.

La variante aqui descrita no reentrena el modelo: aplica una ablacion de direcciones de activacion sobre las capas 9 a 32 mediante Heretic v1.2.0 con el metodo ARA. Los hiperparametros reportados son start_layer_index 9, end_layer_index 32, preserve_good_behavior_weight 0.5019, steer_bad_behavior_weight 0.0001, overcorrect_relative_weight 0.5136 y neighbor_count 9. La innovacion tecnica respecto a ablaciones clasicas de rango uno es el uso de una ablacion de rango arbitrario con preservacion de la norma de fila, que busca minimizar el dano colateral en las capacidades del modelo mientras suprime la direccion responsable de los rechazos. El resultado reportado es una divergencia KL de 0.0077 respecto al modelo original.

## Capacidades

- Generacion de texto conversacional en ingles y chino.
- Razonamiento y matematicas, apoyado en los conjuntos UltraData-Math del entrenamiento base.
- Generacion de codigo, con datos de UltraData-Code en el pipeline del modelo base.
- Comprension de contexto largo (etiqueta long-context en el repo; longitud exacta no disponible).
- Tool calling y function calling, segun las etiquetas del modelo y los datos UltraData-SFT-Agent-2609.
- Tareas agenticas y razonamiento multi-paso, respaldado por los conjuntos SFT-Agent y RL del modelo base.
- Comportamiento "uncensored": supresion mayoritaria de rechazos (4/100 frente a 99/100 del original segun la model card).
- Despliegue en dispositivo y entornos con recursos limitados (edge-ai, on-device).
- No se menciona soporte de vision, audio ni modo de pensamiento explicito en la informacion disponible.

## Casos de uso

- Investigacion sobre alineacion y seguridad: la variante permite comparar el comportamiento del modelo base y el abliterated sobre el mismo prompt, midiendo el efecto de la ablacion en rechazos y en calidad de respuesta con una divergencia KL conocida (0.0077).
- Generacion creativa sin filtros: escritura de ficcion, guiones o narrativa con tematicas sensibles donde el modelo base rechazaria la peticion; el modelo sigue siendo un transformer de 2.5B con licencia Apache 2.0 para uso comercial.
- Asistentes locales en dispositivo: con 2.5B parametros y pesos safetensors de ~10 GB en el repo, es viable en GPUs de consumo y en equipos con suficiente memoria, sin depender de API externa.
- Automatizacion de agentes con tool calling: integracion en pipelines donde el modelo debe invocar funciones y encadenar pasos, aprovechando los datos de SFT-Agent y RL del entrenamiento base.
- Procesamiento de documentos largos en ingles y chino: resumen, extraccion y pregunta-respuesta sobre textos extensos gracias a la orientacion long-context del modelo base.
- Generacion de codigo en entornos con recursos limitados: autocompletado y explicacion de codigo en IDE o CI/CD local, donde un modelo de 2B reduce coste y latencia frente a alternativas mayores.
- Evaluacion de sesgos y robustez: al eliminar la capa de rechazo, resulta util para estudiar como responde el modelo a peticiones limite y que sesgos emergen sin el filtrado de alineacion.
- Chatbot de soporte en ingles o chino: conversaciones multi-turno con contexto moderado en despliegues self-hosted con licencia permisiva.

## Benchmarks y rendimiento

La model card de esta variante solo reporta metricas del proceso de abliteracion frente al modelo original. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible para esta variante concreta.

| Metrica | Este modelo | openbmb/MiniCPM5-2B |
|---|---|---|
| Divergencia KL | 0.0077 | 0 (por definicion) |
| Rechazos | 4/100 | 99/100 |

La model card del modelo base afirma SOTA en la categoria 2B y competitividad con modelos de 4B en codigo, matematicas, contexto largo, uso de herramientas y tareas agenticas, pero no se incluyen los valores numericos de esos benchmarks en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: en torno a 5-6 GB solo para pesos, mas overhead de activaciones y cache KV; un presupuesto practico de 8-10 GB es razonable para contexto moderado.
- Cuantizacion a 8 bits: aproximadamente 2.5-3 GB de pesos; a 4 bits, en torno a 1.5-2 GB, aunque no se confirman ficheros GGUF publicados en el repo.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090 para inferencia local comoda; A100 o H100 para despliegue en servidor con alto throughput.
- Cabe en GPU de consumo: si, en tarjetas con 8 GB o mas en fp16 y en tarjetas de 4-6 GB con cuantizacion (sujeto a disponibilidad de pesos cuantizados).
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference (tag text-generation-inference y endpoints_compatible), y previsiblemente vLLM y llama.cpp/Ollama si se generan conversiones, aunque estas ultimas no se confirman en la informacion disponible.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| dalatexcoder/MiniCPM5-2B-heretic-ara | 2.516.756.480 | no disponible | Apache 2.0 | Variante abliterated con 4/100 rechazos y KL 0.0077 |
| openbmb/MiniCPM5-2B | 2.516.756.480 | no disponible | Apache 2.0 | Modelo original, 99/100 rechazos, SOTA declarado en 2B |
| openbmb/MiniCPM5-1B | no disponible | no disponible | no disponible | Modelo previo de la serie MiniCPM5, menor tamano |
| Modelos de 4B de la comparativa del autor | ~4B | no disponible | no disponible | El autor afirma competitividad del 2B frente a ellos, sin cifras en la informacion disponible |

No se dispone de datos numericos de benchmarks para establecer una comparativa cuantitativa con alternativas de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- La ablacion elimina la mayor parte de los rechazos, lo que implica que el modelo puede generar contenido danino, ofensivo o inseguro sin advertir; no es adecuado para aplicaciones orientadas al publico sin capas de moderacion externas.
- La divergencia KL de 0.0077 indica un cambio no trivial en la distribucion de salida; puede haber degradacion sutil en tareas de razonamiento o instrucciones complejas que no se refleja en la metrica de rechazos.
- Solo se declaran idiomas ingles y chino; el rendimiento en castellano no esta garantizado ni evaluado.
- La longitud de contexto real no se especifica en la informacion disponible, pese a la etiqueta long-context.
- Riesgo de alucinacion inherente a un modelo de 2.5B: menor fiabilidad factica que modelos mayores, especialmente en dominios especializados.
- Sesgos de los datos de entrenamiento (web, matematicas, codigo) no documentados en detalle; la supresion del filtrado de alineacion puede exponerlos con mayor facilidad.
- Licencia Apache 2.0 permite uso comercial, pero el usuario es responsable del cumplimiento normativo y de las politicas de contenido aplicables a su producto.
- No se confirman conversiones GGUF ni cuantizaciones oficiales; verificar el repo antes de planificar despliegues en llama.cpp u Ollama.
- Modelo con 0 likes y 332 descargas en el momento de la ficha: ecosistema y soporte comunitario limitados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dalatexcoder/MiniCPM5-2B-heretic-ara
- Modelo base: https://huggingface.co/openbmb/MiniCPM5-2B
- MiniCPM5-1B: https://huggingface.co/openbmb/MiniCPM5-1B
- Repositorio GitHub de MiniCPM: https://github.com/OpenBMB/MiniCPM
- Heretic (herramienta de abliteracion): https://github.com/p-e-w/heretic
- Pull request del metodo ARA: https://github.com/p-e-w/heretic/pull/211
- Informe tecnico MiniCPM (arXiv 2506.07900): https://arxiv.org/pdf/2506.07900
- Wiki de MiniCPM (chino): https://modelbest.feishu.cn/wiki/UtWxwcERfiRIpIkBOjuc3h9tn1D
- UltraData: https://ultradata.openbmb.cn/
- Demo online del modelo base: https://huggingface.co/spaces/openbmb/MiniCPM5-2B-Demo
- README en chino del modelo base: https://huggingface.co/openbmb/MiniCPM5-2B/blob/main/README-cn.md
