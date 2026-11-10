# Sleepy303/DeepSeek-V4.1-Flash-1017-Uncensored-DwarfStar-GGUF

## Resumen

DeepSeek-V4.1-Flash-1017-Uncensored-DwarfStar-GGUF es una cuantizacion GGUF de un fine-tune sin censura del modelo DeepSeek-V4.1-Flash-1017, desarrollado por el equipo de AtomicChat y publicado en Hugging Face por el usuario Sleepy303. Se trata de una variante "abliterada": se ha eliminado la direccion de rechazo (refusal direction) de los pesos del modelo original mediante una proyeccion sobre 122 tensores que escriben en el flujo residual, de modo que el modelo deja de negarse a responder peticiones que el original declina.

El modelo base es un transformer de tipo Mixture-of-Experts con 754.638.867.584 parametros totales (unos 754,6 mil millones) y 384 expertos enrutados por bloque, segun se desprende de la model card. La build concreta esta cuantizada a IQ2_XXS para las proyecciones gate/up de los expertos y Q2_K para las down, con una matriz de importancia (imatrix), lo que reduce el peso a aproximadamente 365,7 GB en disco y unos 152 GiB en VRAM en CUDA.

La relevancia de esta ficha es doble: por un lado, documenta un caso de estudio de abliteracion a gran escala con mediciones cuantitativas del coste en capacidad (MMLU) y del efecto sobre el rechazo (JailbreakBench, XSTest); por otro, permite ejecutar un modelo de casi 755 mil millones de parametros en hardware de una sola GPU o en Apple Silicon mediante el runtime DwarfStar (ds4), algo impensable con los pesos en precision completa. La licencia es MIT, heredada del modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts (MoE) con 384 expertos enrutados por bloque y expertos compartidos; incluye modulo Engram con tablas leidas desde disco |
| Parametros totales | 754.638.867.584 (754,6 mil millones) |
| Parametros activos | no disponible |
| Longitud de contexto | 32.768 tokens en la configuracion de ejemplo del runtime (`--ctx 32768`); maximo nativo no disponible |
| Tipos de cuantizacion | IQ2_XXS (gate/up de expertos), Q2_K (down de expertos, con imatrix), Q8_0 y F16 en los tensores reemplazados |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (fichero unico `DeepSeek-V4.1-Flash-1017-Uncensored-IQ2_XXS-Q2_K-imatrix.gguf`, 365,7 GB) |

## Arquitectura y entrenamiento

El modelo base es un transformer de tipo Mixture-of-Experts con 384 expertos enrutados por bloque, expertos compartidos y un componente denominado Engram cuya proyeccion de valor tambien ha sido modificada en esta build. La model card no detalla el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO en el modelo original; esa informacion no esta disponible en la documentacion proporcionada.

La innovacion tecnica de esta publicacion es el proceso de abliteracion. Se identifico una unica direccion de rechazo y se proyecto fuera de los pesos con una fuerza de 2,0, afectando exclusivamente a 122 tensores que escriben en el flujo residual: la salida de atencion (`attn_output_b`), la proyeccion down de los expertos compartidos, la proyeccion down de los 384 expertos enrutados de cada bloque y la proyeccion de valor de Engram. El resto de bytes, incluida la cabecera, son identicos al fichero original de `antirez/deepseek-v4.1-flash-gguf` (revision `9dcee51692e6`), por lo que se ejecuta en el mismo runtime y con el mismo consumo de memoria. Tras el bake, el 99,98% de la edicion queda contenida en cada tensor que escribe en el flujo residual. Los tensores reemplazados se cuantizaron a los tipos originales (Q8_0, Q2_K con imatrix, F16), preservando la estructura de cuantizacion del fichero de partida.

## Capacidades

- Generacion de texto conversacional y de un solo turno, con modo de razonamiento (thinking) activable.
- Razonamiento multi-paso: la model card menciona que, con thinking activado, el modelo planifica la respuesta a peticiones que el original declina, y que dicho plan puede ser largo.
- Respuesta a peticiones que el modelo base rechaza: la abliteracion elimina la direccion de rechazo en todos los temas, no solo en un subconjunto.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes: no disponible.
- Vision, audio u otras modalidades: no disponible.
- Ejecucion local offline mediante el runtime DwarfStar (ds4-server) en Metal, CUDA o ROCm.

## Casos de uso

- Investigacion sobre alineacion y abliteracion: el modelo sirve como sujeto de estudio para medir cuanto del comportamiento de rechazo es separable de la capacidad general; las metricas de JailbreakBench y XSTest permiten cuantificar el efecto de una unica direccion proyectada sobre 122 tensores.
- Evaluacion de robustez de clasificadores de seguridad: al producir respuestas que el original rechaza, permite probar si los filtros de salida detectan contenido problematico mas alla del inicio de la respuesta, dado que el clasificador de la model card solo lee el comienzo del texto.
- Despliegue local de un modelo de gran escala en una sola GPU: con unos 152 GiB en CUDA, cabe en una GPU de 192 GB (H200 o similar) y permite inferencia offline sin dependencia de API, util para entornos con requisitos de confidencialidad.
- Experimentacion en Apple Silicon: el runtime ds4 soporta Metal, de modo que un Mac Studio con memoria unificada suficiente puede ejecutar el modelo con contexto de 32.768 tokens leyendo las tablas Engram desde SSD local.
- Generacion de texto creativo sin restricciones tematicas: escritura de ficcion, guiones o material editorial donde el modelo base aplicaria rechazos por contenido sensible, con la advertencia de que la calidad puede degradarse respecto al original.
- Estudio del coste de cuantizacion extrema: la comparacion entre layouts de 3,58 bpw y ~3,2 bpw con sus respectivas cifras de MMLU permite analizar la relacion entre bits por peso, retencion de capacidad y supresion de rechazo en modelos MoE de gran tamano.
- Pruebas de estres de pipelines de inferencia: al ser un fichero de 365,7 GB con lectura de disco para Engram, es un banco de pruebas realista para medir throughput de almacenamiento y latencia de carga en despliegues locales.

## Benchmarks y rendimiento

La model card advierte que **este fichero concreto aun no se ha medido en DwarfStar**. Las cifras disponibles corresponden a la misma edicion medida como ficheros GGUF en llama.cpp frente a los mismos layouts sin la edicion:

| Build (llama.cpp) | JailbreakBench (EN) | XSTest (prompts seguros rechazados) | MMLU (500) |
|---|---|---|---|
| 3,58 bpw, expertos Q2_K | 91,4% → **0,0%** | 8,0% → 0,4% | 86,0% → 86,6% |
| ~3,2 bpw, expertos gate/up IQ2_XXS (medido, no publicado) | 97,5% → **0,0%** | 6,8% → 0,4% | 84,6% → 82,4% |

El fichero de esta ficha usa expertos IQ2_XXS (gate, up) y Q2_K (down), un layout intermedio entre los dos medidos. La model card estima que cabe esperar ausencia de rechazos y un coste en MMLU de hasta unos 2 puntos. No se han publicado resultados de benchmarks adicionales (HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada en CUDA: aproximadamente 152 GiB para los pesos Q2, segun la model card.
- GPU recomendadas: una unica GPU CUDA con capacidad suficiente para alojar los pesos, es decir, del orden de 192 GB (H200 o equivalentes); no cabe en A100 de 80 GB ni en RTX 4090 de 24 GB.
- Consumer GPU: no es viable en ninguna GPU de consumo actual por el tamano de los pesos.
- Apple Silicon: soportado via Metal con el runtime DwarfStar; requiere memoria unificada suficiente y un SSD local rapido, ya que las tablas Engram se leen de disco.
- ROCm: soportado por el runtime ds4.
- Opciones de despliegue: DwarfStar (`ds4-server`) es el runtime indicado por el autor; no se mencionan vLLM, llama.cpp, Ollama ni TGI para este fichero concreto, aunque las mediciones de referencia se hicieron en llama.cpp.
- Comando de ejemplo: `./ds4-server -m gguf/DeepSeek-V4.1-Flash-1017-Uncensored-IQ2_XXS-Q2_K-imatrix.gguf --ctx 32768`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros totales | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| DeepSeek-V4.1-Flash-1017-Uncensored-DwarfStar-GGUF (este) | 754,6 mil millones | 32.768 en config. de ejemplo | MIT | GGUF (IQ2_XXS/Q2_K) | Abliterado, 365,7 GB, runtime ds4 |
| deepseek-ai/DeepSeek-V4.1-Flash-1017 (base) | 754,6 mil millones | no disponible | MIT (segun la model card) | safetensors | Modelo original con rechazos |
| antirez/deepseek-v4.1-flash-gguf (IQ2_XXS-Q2_K-imatrix) | 754,6 mil millones | no disponible | MIT | GGUF | Mismo fichero sin la edicion de abliteracion |
| AtomicChat/DeepSeek-V4.1-Flash-1017-Uncensored-GGUF | 754,6 mil millones | no disponible | MIT | GGUF | Misma edicion en otros layouts (3,58 bpw y ~3,2 bpw) con mediciones publicadas |

No se dispone de datos de benchmarks del modelo base ni de los otros layouts en la informacion proporcionada, por lo que la comparacion de rendimiento se limita a las cifras de la tabla de benchmarks.

## Limitaciones y advertencias

- Este fichero concreto no se ha medido aun en DwarfStar; las cifras de rendimiento proceden de layouts equivalentes medidos en llama.cpp.
- El clasificador de rechazo empleado en las metricas lee el inicio de la respuesta, por lo que un rechazo suave situado mas adelante en el texto puede contabilizarse erroneamente como respuesta.
- La edicion elimina los rechazos en todos los temas; no conserva un subconjunto mas estrecho de negativas.
- Con thinking activado, el modelo planifica respuestas a peticiones que el original declina y el plan puede ser largo; conviene asignar un presupuesto de tokens mayor o reducir el esfuerzo de razonamiento.
- Coste estimado en capacidad: hasta unos 2 puntos de MMLU respecto al modelo sin editar, segun la interpolacion de los layouts medidos.
- Riesgo de alucinacion: no cuantificado en la informacion disponible, pero inherente a un modelo de este tipo y potencialmente agravado por la cuantizacion de 2 bits en los expertos.
- Idiomas soportados: no disponibles; no se puede confirmar el comportamiento multilingue.
- Uso comercial: la licencia MIT lo permite, pero el autor declina responsabilidad sobre el uso y recuerda la obligacion de cumplir la legislacion aplicable.
- El modelo responde a peticiones que el original rechaza; su uso en produccion exige filtros de salida propios y supervision humana.
- Requiere almacenamiento local rapido: las tablas Engram se leen de disco, por lo que un SSD lento degrada la latencia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Sleepy303/DeepSeek-V4.1-Flash-1017-Uncensored-DwarfStar-GGUF
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017
- GGUF original de antirez: https://huggingface.co/antirez/deepseek-v4.1-flash-gguf
- Version sin censura de AtomicChat: https://huggingface.co/AtomicChat/DeepSeek-V4.1-Flash-1017-Uncensored-GGUF
- Metricas de la edicion: https://huggingface.co/datasets/AtomicChat/DeepSeek-V4.1-Flash-1017-Uncensored-GGUF-metrics
- Atomic Chat: https://atomic.chat/
- Repositorio Atomic Chat en GitHub: https://github.com/AtomicBot-ai/Atomic-Chat
- Discord de AtomicChat: https://discord.gg/8wGSsvmg4V
- X (Twitter) de AtomicChat: https://x.com/atomic_chat_hq
