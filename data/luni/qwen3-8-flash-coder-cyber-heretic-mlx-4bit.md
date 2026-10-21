# Luni/Qwen3.8-Flash-Coder-CYBER-Heretic-MLX-4bit

## Resumen

Qwen3.8-Flash-Coder-CYBER-Heretic-MLX-4bit es una cuantización de 4 bits en formato MLX del modelo Luni/Qwen3.8-Flash-Coder-CYBER-Heretic, publicada por el usuario Luni. Se trata de un derivado orientado a Apple Silicon: el repositorio empaqueta los pesos en safetensors con cuantización mlx-4bit para que puedan ejecutarse sobre memoria unificada de Macs con chip de la serie M, sin necesidad de GPU dedicada. El modelo base pertenece a la familia Qwen3-Next (etiqueta `qwen3_next`) y suma los sufijos "Coder", "CYBER" y "Heretic", que en conjunto apuntan a un ajuste orientado a código y ciberseguridad con alineación de seguridad relajada.

El dato objetivo más relevante es el recuento de parámetros: 42.620.279.680 (~42,6 mil millones), según los safetensors del repositorio. La model card declara un tamaño de ~22,5 GB tras la cuantización y fija como objetivo hardware equipos Apple Silicon con 32 GB de memoria unificada o más. La licencia es Apache 2.0 y los idiomas declarados son inglés y chino.

Su relevancia es acotada pero específica: cubre el nicho de ejecución local en Mac de un modelo grande con presunta arquitectura MoE, preservando las puertas del router en 8 bits para limitar la degradación típica de la cuantización en ese componente. No obstante, el repositorio no incluye benchmarks, no documenta el proceso de cuantización más allá de una línea y registra cero descargas y cero "likes" en el momento de la consulta, por lo que debe tratarse como un artefacto no validado por la comunidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de la familia Qwen3-Next (etiqueta `qwen3_next`); tipo exacto (MoE u otra) no detallado en la informacion disponible |
| Parametros totales | 42.620.279.680 (~42,6 B), segun safetensors |
| Parametros activos | no disponible (la etiqueta `qwen3_next` sugiere arquitectura con mezcla de expertos, pero no se confirma ni se cuantifica) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | MLX 4-bit (pesos); puertas del router preservadas a 8 bits |
| Idiomas soportados | en, zh |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors con cuantizacion MLX (libreria `mlx`); tamano del repo 24,0 GB, pesos ~22,5 GB |

## Arquitectura y entrenamiento

La informacion disponible identifica el modelo como un derivado de Qwen3-Next (etiqueta `qwen3_next`) con 42,6 mil millones de parametros totales. La model card del repositorio no describe la arquitectura interna: no se detalla si se trata de un transformer denso o de una mezcla de expertos, ni el numero de expertos, la longitud de contexto nativa o el esquema de atencion. El unico detalle tecnico aportado sobre el proceso de cuantizacion es que las puertas del router se mantienen en 8 bits mientras los demas pesos se reducen a 4 bits, una practica habitual para evitar que el enrutamiento de tokens se degrade cuando el modelo es de tipo MoE.

Tampoco se documentan los datos de entrenamiento: no hay cifra de tokens, composicion del corpus, ni confirmacion de si hubo RLHF, DPO u otra fase de alineacion. Los sufijos del nombre son la unica pista: "Coder" indica especializacion en codigo, "CYBER" sugiere un ajuste orientado a ciberseguridad, analisis binario, descompilacion y analisis de exploits, y "Heretic" se asocia en la practica a variantes con los rechazos atenuados o eliminados, si bien la model card no lo confirma explicitamente. Cualquier afirmacion sobre el pipeline de entrenamiento del modelo base queda fuera de lo verificable con los datos suministrados.

## Capacidades

- Generacion de texto y conversacion multi-turno, segun el pipeline declarado `text-generation` y la etiqueta `conversational`.
- Generacion y analisis de codigo, derivado del sufijo "Coder" del modelo base y del ajuste declarado.
- Ciberseguridad ofensiva y defensiva: la model card cita explicitamente analisis binario, descompilacion y analisis de exploits como proposito del modelo.
- Ejecucion local en Apple Silicon mediante MLX, sin dependencia de CUDA.
- Multilingue limitado a ingles y chino; no se declara soporte de castellano.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de agente o razonamiento multi-paso: no disponibles en la informacion proporcionada.
- Modo "thinking", vision o audio: no disponibles en la informacion proporcionada.

## Casos de uso

- Analisis de binarios en local: el modelo esta declarado para analisis binario y descompilacion, de modo que puede emplearse para resumir el comportamiento de un ejecutable o reconstruir pseudocodigo en un flujo de ingenieria inversa, ejecutandose integramente en el Mac del analista sin enviar muestras a la nube.
- Triaje de vulnerabilidades: dado un fragmento de codigo o un diff, el modelo puede señalar patrones de riesgo (desbordamientos, uso tras liberacion, inyecciones) y priorizar la revision manual dentro de un programa de divulgacion responsable.
- Apoyo a laboratorios de formacion en seguridad: generacion de escenarios y explicaciones tecnicas sobre tecnicas de explotacion en entornos controlados (CTFs, aulas), donde la ausencia de rechazos agiliza la explicacion de conceptos que otros modelos filtran.
- Auditoria de codigo en macOS: al ejecutarse sobre MLX, encaja en estaciones de trabajo de desarrolladores con Mac que necesitan revision de codigo sin GPU dedicada ni conexion a servicios externos, con los ~22,5 GB de pesos cargados en memoria unificada.
- Ingenieria de prompts para deteccion: generacion de reglas YARA, firmas o expresiones heuristicas a partir de la descripcion de una familia de malware, con iteracion conversacional sobre los falsos positivos detectados.
- Prototipado de asistentes tecnicos bilingues: cobertura de consultas de desarrollo en ingles y chino para equipos distribuidos, con despliegue local que evita costes por token.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye tablas de MMLU, HumanEval, GSM8K ni metricas de seguridad, y tampoco se aportan mediciones de latencia o throughput para la cuantizacion MLX 4-bit. Cualquier cifra de rendimiento atribuida a este modelo seria una extrapolacion no verificada.

## Requisitos de hardware

- Memoria: la model card fija Apple Silicon con memoria unificada de 32 GB o mas como objetivo minimo. Con ~22,5 GB de pesos, 32 GB deja un margen estrecho para el contexto KV y el propio sistema; 48 GB o 64 GB son configuraciones mas holgadas para contextos largos.
- GPU dedicadas: el formato MLX esta pensado para Apple Silicon; no se declara compatibilidad con CUDA (A100, H100, RTX 4090) ni se ofrecen pesos GGUF en este repositorio. Para hardware NVIDIA habria que recurrir al modelo base o a otra cuantizacion.
- Cabe en GPU de consumo: si, en el sentido de que cabe en Macs de gama alta con memoria unificada (M-series Pro/Max/Ultra de 32 GB en adelante). No hay datos para GPUs de consumo con 24 GB de VRAM, que serian insuficientes para 22,5 GB de pesos mas overhead.
- Opciones de despliegue: `mlx` y `mlx-lm` son las herramientas coherentes con el formato publicado. vLLM, llama.cpp, Ollama y TGI no se mencionan en la informacion disponible y no pueden darse por soportados.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Luni/Qwen3.8-Flash-Coder-CYBER-Heretic-MLX-4bit | 42,6 B | no disponible | MLX 4-bit (router a 8 bits) | Apache 2.0 | 0 descargas, 0 likes |
| Luni/Qwen3.8-Flash-Coder-CYBER-Heretic (base) | 42,6 B (por herencia del derivado) | no disponible | Pesos completos, precision original | Apache 2.0 | Repositorio referenciado |
| Otras cuantizaciones del mismo base | no disponible | no disponible | no disponible | Apache 2.0 | no disponible |

No se dispone de datos de benchmarks ni de especificaciones de terceros que permitan una comparacion cuantitativa con alternativas de la misma categoria (por ejemplo, otros modelos de codigo de ~40 B o cuantizaciones MLX equivalentes). La comparacion queda limitada al propio linaje del modelo.

## Limitaciones y advertencias

- Alineacion de seguridad atenuada: el sufijo "Heretic" se asocia habitualmente a variantes con los rechazos reducidos o eliminados. Si se confirma, el modelo puede producir contenido ofensivo, codigo de explotacion funcional o instrucciones peligrosas sin friccion, lo que exige controles adicionales en cualquier despliegue expuesto a usuarios.
- Riesgo legal y de cumplimiento: la orientacion a ciberseguridad ofensiva y descompilacion puede entrar en conflicto con legislacion sobre acceso no autorizado a sistemas, derechos de autor sobre software propietario o normativa de exportacion de tecnologias de doble uso. La licencia Apache 2.0 no exime de esas obligaciones.
- Idiomas: solo se declaran ingles y chino. No hay soporte declarado de castellano, por lo que la calidad en espanol es impredecible y no esta evaluada.
- Alucinacion: no se han publicado evaluaciones de fidelidad. En tareas de analisis binario o de vulnerabilidades, una salida plausible pero incorrecta es especialmente costosa, ya que puede dirigir mal una auditoria.
- Degradacion por cuantizacion: los pesos estan reducidos a 4 bits. Aunque el router se preserva a 8 bits, no se aportan mediciones de la perdida de calidad respecto al modelo base.
- Ausencia de validacion comunitaria: cero descargas y cero likes en el momento de la consulta, sin benchmarks ni informes de terceros. El artefacto debe considerarse no verificado.
- Contexto desconocido: al no documentarse la longitud de contexto nativa, no puede garantizarse el comportamiento en conversaciones largas ni en el analisis de ficheros de gran tamano.
- Dependencia de plataforma: los pesos MLX no son portables a CUDA ni a CPU generica sin conversion, lo que limita su uso en infraestructura de servidores convencional.
- Fecha de creacion anomala (2026-10-20) en los metadatos del repositorio, aspecto a verificar antes de confiar en la trazabilidad del artefacto.

## Enlaces

- Repositorio del modelo: https://huggingface.co/Luni/Qwen3.8-Flash-Coder-CYBER-Heretic-MLX-4bit
- Modelo base: https://huggingface.co/Luni/Qwen3.8-Flash-Coder-CYBER-Heretic
- Paper, blog, repositorio de codigo o demo: no disponible en la informacion proporcionada. La busqueda web realizada no devolvio resultados relacionados con el modelo (los resultados obtenidos corresponden a entidades homonimas sin relacion: Lunii, Lumni y un canal de YouTube).
