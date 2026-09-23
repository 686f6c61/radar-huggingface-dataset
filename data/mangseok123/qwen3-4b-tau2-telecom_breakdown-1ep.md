# MANGSEOK123/qwen3-4b-tau2-telecom_breakdown-1ep

## Resumen

`MANGSEOK123/qwen3-4b-tau2-telecom_breakdown-1ep` es un ajuste fino de `Qwen/Qwen3-4B-Instruct-2507` (modelo denso de 4.411.424.256 parametros) orientado al dominio de telecomunicaciones del benchmark tau2-bench. El autor lo ha entrenado con una tecnica de destilacion de experiencia denominada OEL (experience distillation), en la que el propio modelo actua como estudiante y como profesor: el estudiante reproduce cada tarea sin memoria y el profesor es exactamente el mismo modelo con la memoria de esa tarea insertada en el system prompt. El objetivo es internalizar el contenido de esas memorias en los pesos, de modo que el modelo resuelva tareas de atencion al cliente de telecomunicaciones sin necesidad de inyectar documentacion adicional en el contexto.

El entrenamiento es deliberadamente minimo: 24 pares tarea-memoria extraidos del conjunto `general_p30_source_pairs`, batch de 6, una sola epoca y cuatro pasos de optimizacion con perdida KL completa sobre todos los tokens de respuesta (`kl_topk` 256), learning rate constante de 3e-6 y sin ninguna funcion de recompensa. El simulador de usuario empleado fue `gpt-4.1-mini` con temperatura 0. El repositorio ocupa 8,8 GB y los pesos estan en safetensors bajo licencia apache-2.0.

Se trata de un experimento de investigacion de nicho, no de un modelo de produccion: acumula cero descargas y cero likes, no ha sido evaluado por el autor tras el entrenamiento y su model card documenta explicitamente que se subio a HuggingFace inmediatamente despues de entrenar. Su relevancia es metodologica (comprobar si la destilacion de experiencia sobre un numero muy reducido de pares puede trasladar conocimiento de dominio a los pesos), mas que practica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso, familia Qwen3 (heredada del modelo base `Qwen/Qwen3-4B-Instruct-2507`) |
| Parametros totales | 4.411.424.256 (aproximadamente 4,4 B) |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no disponible en la informacion del autor; el ejemplo de despliegue de vLLM usa `--max-model-len 40960` |
| Tipos de cuantizacion | no se publican variantes cuantizadas (GGUF, AWQ, GPTQ, FP8); los pesos se distribuyen en safetensors y el tamano del repo (8,8 GB) es coherente con precision bf16 |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

Otros datos del repositorio: autor `MANGSEOK123`, pipeline no disponible, 0 descargas, 0 likes, creado el 2026-09-23 y actualizado el mismo dia. Etiquetas declaradas: `safetensors`, `qwen3`, `tau2-bench`, `telecom`, `oel`, `experience-distillation`.

## Arquitectura y entrenamiento

La arquitectura es la del modelo base: un transformer decoder-only denso de la familia Qwen3 con 4,4 B de parametros. El ajuste no modifica la topologia ni la tokenizer, solo los pesos. La innovacion no esta en la arquitectura sino en el procedimiento de entrenamiento, que el autor etiqueta como OEL y describe como una variante de destilacion de experiencia. En cada par tarea-memoria, el estudiante recibe la tarea sin memoria en el prompt y el profesor es el mismo conjunto de pesos con la memoria de esa tarea en el system prompt. El unico factor que difiere entre ambos es el prompt, y no se utiliza ninguna recompensa: la senal de aprendizaje es una divergencia KL completa sobre todos los tokens de respuesta, con `kl_topk` fijado en 256.

La configuracion de entrenamiento es la siguiente: 24 pares de entrenamiento, batch size 6, 1 epoca, learning rate 3e-6 constante, gradient clipping 1.0 (valor por defecto de verl) y simulador de usuario `gpt-4.1-mini` con temperatura 0. El autor publica la traza de los cuatro pasos:

| Paso | Perdida KL | Entropia | Norma del gradiente |
|---|---|---|---|
| 1 | 0,068 | 0,112 | 20,909 |
| 2 | 0,023 | 0,229 | 2,298 |
| 3 | 0,010 | 0,530 | 5,514 |
| 4 | 0,010 | 0,268 | 0,815 |

La propia model card advierte que cada paso lee un batch distinto, por lo que la columna de perdida refleja la dificultad del batch y no una curva de convergencia. Con 24 pares y 4 pasos, el volumen de datos es extremadamente bajo incluso para un ajuste de estilo LoRA o full fine-tuning, lo que condiciona por completo la interpretacion de los resultados.

## Capacidades

- Generacion de texto conversacional y resolución de tareas multi-turno en el dominio de telecomunicaciones, heredadas del modelo base.
- Ejecucion de tareas de tau2-bench en el dominio `telecom`, el unico dominio sobre el que se ha entrenado explicitamente.
- Soporte de tool calling y function calling, segun se deduce del comando de despliegue recomendado por el autor, que activa `--enable-auto-tool-choice` y usa el parser `hermes`.
- Razonamiento agentico de varios pasos en el marco de tau2-bench, donde el modelo debe interactuar con el simulador de usuario y con herramientas.
- Capacidad multilingue: no disponible en la informacion proporcionada.
- Modo de pensamiento explicito (`thinking`), vision o audio: no documentado en la informacion proporcionada.
- Uso sin memoria externa: la finalidad declarada del entrenamiento es que el modelo no necesite la memoria de la tarea en el prompt, es decir, que el conocimiento quede embebido en los pesos.

## Casos de uso

- Atencion al cliente de telefonia en conversaciones multi-turno: el modelo puede gestionar dialogos donde el usuario plantea incidencias de facturacion, cambios de tarifa o problemas de cobertura, apoyandose en el formato de tareas de tau2-bench para el que fue ajustado.
- Agente de resolucion de averias con llamadas a herramientas: gracias al soporte de tool calling y al parser `hermes`, puede invocar funciones de consulta de estado de linea, reinicio de servicios o verificacion de saldo dentro de un flujo agentico.
- Investigacion sobre destilacion de experiencia: sirve como caso de estudio reproducible para medir cuanto conocimiento de dominio se transfiere a los pesos con tan solo 24 pares y 4 pasos de optimizacion.
- Evaluacion comparativa de metodologias de ajuste: al tener un modelo base publico y una configuracion de entrenamiento totalmente documentada, permite aislar el efecto de OEL frente a otras tecnicas sobre el mismo punto de partida.
- Prototipado rapido en el dominio telecom: con 4,4 B de parametros cabe en una sola GPU consumer, lo que permite iterar en local sobre flujos de agente antes de escalar a un modelo mayor.
- Generacion de datos sinteticos de dialogo telecom: el modelo puede producir trayectorias de conversacion que despues se filtren o se usen para aumentar otros conjuntos de entrenamiento.
- Base para ajustes posteriores en dominios regulados: al ser apache-2.0 y de tamano reducido, es un punto de partida comodo para anadir capas de cumplimiento normativo o vocabulario especifico de operador.
- Despliegue en el borde o en entornos con GPU limitada: su tamano permite servir el modelo en una unica GPU de 16-24 GB sin necesidad de infraestructura multi-GPU.

## Benchmarks y rendimiento

El autor indica explicitamente que el modelo no fue evaluado tras el entrenamiento ("Not evaluated. Pushed straight after training"). El unico dato disponible es la referencia del modelo base:

| Benchmark | Modelo | Resultado |
|---|---|---|
| tau2-bench, dominio telecom, test split | Qwen3-4B-Instruct-2507 (modelo base, referencia del autor) | avg 0,056 / pass@4 0,175 |
| tau2-bench, dominio telecom, test split | `qwen3-4b-tau2-telecom_breakdown-1ep` | no evaluado |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada en bf16 (precision de los pesos publicados): en torno a 9 GB solo para los pesos. Hay que sumar activaciones y cache KV, por lo que conviene reservar 12-16 GB como minimo. Con `--max-model-len 40960` la cache KV crece de forma apreciable y puede anadir varios gigabytes adicionales, aunque el autor no publica el desglose.
- VRAM estimada en cuantizacion de 8 bits: aproximadamente 5 GB de pesos, mas cache KV y activaciones. No se publican pesos ya cuantizados, habria que generarlos.
- VRAM estimada en cuantizacion de 4 bits (formato GGUF o similar): en torno a 3 GB de pesos. Tampoco se distribuyen variantes cuantizadas.
- GPU recomendadas: cualquier GPU con 16 GB o mas permite servir el modelo en bf16 con margen, por ejemplo RTX 4090, RTX 4080, A100 40 GB o L40S. Con 24 GB (RTX 3090, RTX 4090) es holgado para bf16 si se limita la longitud de contexto.
- Compatibilidad con GPU consumer: si. Cabe con holgura en una RTX 4090 o RTX 3090 en bf16; con cuantizacion a 8 o 4 bits encajaria en GPUs de 8-12 GB, como una RTX 3060 de 12 GB.
- Opciones de despliegue: el autor documenta vLLM como via de despliegue, con el comando `vllm serve MANGSEOK123/qwen3-4b-tau2-telecom_breakdown-1ep --enable-auto-tool-choice --tool-call-parser hermes --max-model-len 40960`. Al no publicarse pesos GGUF, llama.cpp y Ollama requeririan una conversion previa por parte del usuario. TGI, SGLang y otras pilas compatibles con safetensors de Qwen3 serian igualmente utilizables, aunque no estan documentadas por el autor.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo ni de latencia por peticion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | tau2-bench telecom | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `qwen3-4b-tau2-telecom_breakdown-1ep` | 4,4 B | no disponible (ejemplo con 40.960) | no evaluado | apache-2.0 | HuggingFace, 0 descargas, 0 likes |
| `Qwen/Qwen3-4B-Instruct-2507` (modelo base) | 4,4 B | no disponible en la informacion proporcionada | avg 0,056 / pass@4 0,175 (referencia) | apache-2.0 | ampliamente disponible |
| Otros modelos afinados sobre tau2-bench | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones de modelos alternativos en la informacion proporcionada, por lo que la comparativa se limita al modelo base del que deriva.

## Limitaciones y advertencias

- Modelo sin evaluar: el autor declara explicitamente que se subio a HuggingFace inmediatamente despues del entrenamiento, sin ninguna evaluacion posterior. No hay evidencia publicada de que mejore al modelo base en tau2-bench telecom ni en ninguna otra tarea.
- Volumen de entrenamiento minimo: 24 pares tarea-memoria, batch 6, 1 epoca y 4 pasos de optimizacion. Es una cantidad de datos muy reducida, insuficiente para garantizar una mejora robusta o generalizable.
- Riesgo de sobreajuste a las 24 memorias concretas: el objetivo del entrenamiento es reproducir el comportamiento del profesor con una memoria especifica en el prompt, lo que puede provocar que el modelo memorice detalles idiosincraticos de esas tareas y no generalice a otras.
- Riesgo de olvido catastrofico: al ajustar todos los pesos (o una parte no especificada) sobre un dominio muy estrecho, pueden degradarse capacidades generales del modelo base. El autor no documenta este punto.
- Ausencia de senal de recompensa: el entrenamiento usa unicamente divergencia KL hacia el profesor, lo que optimiza la imitacion de la distribucion del profesor, no la calidad de la respuesta final.
- Riesgo de alucinacion: no cuantificado por el autor. En dominios de atencion al cliente telecom, con procedimientos y politicas concretas, una alucinacion puede tener consecuencias operativas y de cumplimiento.
- Idiomas soportados: no disponibles. No hay garantia documentada de buen rendimiento en castellano.
- Longitud de contexto: no declarada por el autor. El unico dato es el `--max-model-len 40960` del ejemplo de vLLM, que es una recomendacion de despliegue, no una especificacion del modelo.
- Sin validacion de la comunidad: 0 descargas y 0 likes en el momento de redactar esta ficha. No existe retroalimentacion externa ni replicacion independiente.
- Procedencia: el nombre del repositorio incluye un identificador de autor no verificado y la model card esta en ingles, con una descripcion tecnica escueta. Conviene tratar los pesos como material experimental.
- Licencia: apache-2.0, que permite uso comercial y modificacion. Se hereda la licencia del modelo base, tambien apache-2.0. Aun asi, la licencia permisiva no implica idoneidad tecnica para produccion.
- Entorno de entrenamiento: el simulador de usuario fue `gpt-4.1-mini`, un modelo propietario de terceros. Esto puede introducir dependencias o sesgos en el estilo de las conversaciones aprendidas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/MANGSEOK123/qwen3-4b-tau2-telecom_breakdown-1ep
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507

No se han proporcionado otros enlaces (papers, blogs, repositorios de codigo o demos) en la informacion disponible.
