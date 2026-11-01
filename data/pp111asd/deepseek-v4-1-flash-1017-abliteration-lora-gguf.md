# pp111asd/DeepSeek-V4.1-Flash-1017-Abliteration-LoRA-GGUF

## Resumen

DeepSeek-V4.1-Flash-1017-Abliteration-LoRA-GGUF es un adaptador LoRA de rango 1 publicado por el usuario pp111asd sobre el modelo base deepseek-ai/DeepSeek-V4.1-Flash-1017. Su proposito no es mejorar las capacidades del modelo, sino reducir de forma drastica su tasa de rechazos (refusals) mediante una tecnica de abliteration: se identifica la "direccion de rechazo" en el espacio de activaciones y se resta de la salida de cada capa al stream residual. El adaptador pesa aproximadamente 438 MiB y se aplica sobre los pesos existentes, sin necesidad de recuantizar ni descargar una copia completa del modelo.

La relevancia de esta publicacion es doble. Por un lado, demuestra que una intervencion de rango 1 (una unica direccion extraida de la capa 22) basta para desplomar la tasa de rechazo del 98,3% al 4,2% en un conjunto de 120 prompts daninos de AdvBench, manteniendo practicamente intacta la capacidad de codigo (HumanEval pasa de 95,1% a 95,7%, diferencia dentro del ruido estadistico). Por otro, expone con inusual honestidad las limitaciones del metodo: el adaptador esta construido especificamente para el pack de cuantizacion Maya-S del Proyecto Maya, y en otras cuantizaciones (Q4_K_XL, Q8, BF16) solo aproxima la eliminacion de la direccion, sin haber sido probado en ellas.

El modelo se distribuye en formato GGUF con licencia MIT, esta etiquetado unicamente para ingles y cuenta con 53 descargas y 0 likes en el momento de la consulta. El dato de parametros totales reportado en safetensors (114.862.080) corresponde al adaptador, no al modelo base, cuyo tamano no se especifica en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA de rango 1 (adaptador de abliteration) sobre transformer DeepSeek-V4.1-Flash-1017 |
| Parametros totales | 114.862.080 (adaptador; el modelo base no se especifica) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (depende del modelo base) |
| Tipos de cuantizacion | GGUF; construido y validado para el pack Maya-S de Project Maya; no probado en Q4_K_XL, Q8 ni BF16 |
| Idiomas soportados | en |
| Licencia | MIT |
| Formato de pesos | GGUF (adaptador LoRA; repo de 0,9 GB) |

## Arquitectura y entrenamiento

El adaptador no entrena el modelo en el sentido convencional. El autor extrae la direccion de rechazo comparando las activaciones del modelo base sobre 128 prompts daninos (AdvBench) frente a 128 prompts inofensivos (Alpaca). La direccion se toma de la capa 22 y se aplica con escala 1,0. El adaptador almacena, para cada capa, dos mitades: la propia direccion y la direccion multiplicada por los pesos de esa capa. La operacion aplicada es y ← y − scale · r (r · y), es decir, una proyeccion que elimina la componente de la activacion alineada con la direccion de rechazo.

Un detalle tecnico critico es que la segunda mitad del adaptador depende de los pesos concretos de una cuantizacion especifica: el pack Maya-S usado por Project Maya. Sobre esos pesos la eliminacion es exacta; sobre cualquier otra cuantizacion es solo aproximada. En la ruta de Project Maya (maya-ds4 --ablate), el motor lee la direccion y la escala del adaptador y proyecta en tiempo de ejecucion usando los pesos cargados, por lo que no depende de las matrices almacenadas en el adaptador. El repo incluye un segundo adaptador (...-allmean-L22.gguf) construido con una version de la direccion promediada sobre todos los tokens en lugar de solo el ultimo, aunque el autor solo ha probado el principal. No se dispone de informacion sobre el dataset de entrenamiento del modelo base ni sobre procesos de RLHF/DPO en el material proporcionado.

## Capacidades

- Reduccion de rechazos: baja la tasa de refusal ante prompts daninos del 98,3% al 4,2% en la evaluacion del autor, sin afectar a los prompts inofensivos (0% de rechazos en ambos casos, 120/120 respuestas completas).
- Generacion de codigo preservada: HumanEval pasa de 95,1% a 95,7% con el adaptador; ningun problema paso de aprobado a fallado en la comparacion problema a problema.
- Generacion de texto general: hereda las capacidades del modelo base DeepSeek-V4.1-Flash-1017.
- Modo thinking: las evaluaciones del autor se realizaron con thinking desactivado en ambos casos.
- Tool calling / function calling: no evaluado por el autor; no disponible.
- Capacidades agenticas y multi-step reasoning: no medidas; una version anterior de la model card incluia una puntuacion agentica que el autor retiro por no poder trazarla a un resultado real.
- Capacidades multilingues: limitadas a ingles segun la etiqueta del repo.
- Vision y audio: no disponible.

## Casos de uso

- Investigacion sobre mecanismos de rechazo: el adaptador permite comparar el comportamiento del modelo con y sin la direccion de rechazo proyectada, aislando el efecto de una unica direccion en la capa 22 sobre la conducta de negativa. Es adecuado porque la intervencion es de rango 1 y el autor documenta el metodo de extraccion con prompts concretos (AdvBench y Alpaca).
- Evaluacion de robustez de salvaguardas: permite medir hasta que punto las defensas de un modelo dependen de una direccion lineal unica, usando el mismo conjunto de 120 prompts daninos y 120 inofensivos que reporta el autor. Util para equipos de red teaming que quieran cuantificar la fragilidad de los filtros.
- Uso local sin censura dentro del marco legal: el adaptador se carga en llama.cpp con --lora sobre un GGUF del modelo base, lo que permite ejecutar el modelo en infraestructura propia (el autor lo probo en 4x RTX 3090) para tareas de escritura o analisis que el modelo base rechazaria por defecto.
- Desarrollo y pruebas de codigo: dado que HumanEval se mantiene estable (156/164 problemas aprobados en ambos casos), el adaptador es adecuado para pipelines de generacion de codigo donde se quiera evitar rechazos espurios sin degradar la calidad, siempre que se use el pack Maya-S.
- Analisis de sesgos y contenido: investigadores que estudien la relacion entre rechazo y contenido generado pueden usar el adaptador como variable de control, comparando las respuestas con y sin proyeccion sobre el mismo modelo y los mismos prompts.
- Despliegue en llama.cpp: la integracion via --lora con --jinja permite incorporar el adaptador a un servidor llama-server existente sin recuantizar el modelo, lo que simplifica la experimentacion en entornos con recursos limitados.

## Benchmarks y rendimiento

Resultados reportados por el autor sobre maya-ds4 con el pack Maya-S (4x RTX 3090), thinking desactivado.

| Benchmark | Stock | Con adaptador |
|---|---:|---:|
| Refusals en prompts daninos (AdvBench, 120) | 98,3% (118/120) | 4,2% (5/120) |
| Puntuacion de danosidad (0–1) | 0,013 | 0,851 |
| Refusals en prompts inofensivos (xstest_safe, 120) | 0% | 0% |
| Respuestas completas a prompts inofensivos | 120/120 | 120/120 |
| HumanEval pass rate (164 problemas) | 95,1% (156/164) | 95,7% (157/164) |
| Longitud tipica de respuesta en HumanEval (tokens) | 91 | 92 |

Comparacion problema a problema en HumanEval: 156 aprobados en ambos casos, 7 fallados en ambos, 0 que pasaran con stock y fallaran con el adaptador, y 1 (HumanEval/32) que fallo con stock y paso con el adaptador. El autor califica la diferencia de 0,6 puntos como dentro del ruido estadistico.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible para el adaptador de forma aislada; depende del modelo base. El autor ejecuto las pruebas en 4x RTX 3090 con el pack Maya-S.
- GPU recomendadas: el autor valido el metodo en 4x RTX 3090; no se documentan otras configuraciones.
- Cabe en GPU consumer: si, segun la configuracion del autor (4x RTX 3090), aunque el requisito real lo marca el modelo base, no el adaptador de 438 MiB.
- Opciones de despliegue: llama.cpp (llama-server con --lora y --jinja) y Project Maya (maya-ds4 --ablate, disponible en upstream a partir del commit 8a3395142537ae7ae909a1bce33fe76f8a810592, incluido para v1.1.31).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de informacion sobre adaptadores de abliteration comparables en el material proporcionado. La comparacion con el modelo base sin adaptador se recoge en la tabla de benchmarks.

| Modelo | Parametros | Contexto | Refusals (AdvBench) | HumanEval | Licencia |
|---|---|---:|---:|---:|---|
| DeepSeek-V4.1-Flash-1017 (stock) | no disponible | no disponible | 98,3% | 95,1% | MIT |
| DeepSeek-V4.1-Flash-1017 + este adaptador | no disponible | no disponible | 4,2% | 95,7% | MIT |
| Otros adaptadores de abliteration | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Dependencia de cuantizacion: el adaptador esta construido para el pack Maya-S; en Q4_K_XL, Q8, BF16 u otras cuantizaciones la eliminacion de la direccion es solo aproximada y no ha sido probada por el autor.
- Muestra limitada: la evaluacion de refusals usa 120 prompts daninos y 120 inofensivos, un tamano que el propio autor califica de no muy grande.
- No elimina todos los rechazos: la tasa baja al 4,2%, no a cero.
- Cambios de comportamiento no medidos: el autor no ha evaluado todas las formas en que el adaptador puede alterar la conducta del modelo; en particular, no se midieron capacidades agenticas ni de tool use.
- Riesgo de alucinacion: no evaluado en el material disponible; se hereda el del modelo base.
- Sesgos conocidos: no documentados en la informacion proporcionada.
- Restricciones de licencia: licencia MIT tanto para el modelo base como para el adaptador; reducir los rechazos no exime de las responsabilidades legales del usuario.
- Uso responsable: el autor prohibe explicitamente usar el adaptador para atacar a personas reales o sistemas de terceros; su proposito declarado es la investigacion sobre mecanismos de rechazo y el uso local sin censura dentro de la ley.
- Idiomas: etiquetado solo para ingles; el comportamiento en otros idiomas no esta documentado.
- Trazabilidad de resultados: el autor retiro una puntuacion agentica de una version anterior de la model card por no poder verificarla, lo que subraya la necesidad de tratar los numeros reportados como resultados de un unico entorno de prueba.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/pp111asd/DeepSeek-V4.1-Flash-1017-Abliteration-LoRA-GGUF
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017
- Project Maya (repositorio): https://github.com/mw00/project-maya
- Commit con soporte --ablate en upstream: https://github.com/mw00/project-maya/commit/8a3395142537ae7ae909a1bce33fe76f8a810592
