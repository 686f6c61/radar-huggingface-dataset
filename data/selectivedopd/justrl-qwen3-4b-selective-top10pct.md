# SelectiveDOPD/JustRL-Qwen3-4b-Selective-Top10pct

## Resumen

JustRL-Qwen3-4b-Selective-Top10pct es un ajuste de la familia Qwen3 de 4B de parametros, publicado por el usuario SelectiveDOPD en HuggingFace. El nombre y las etiquetas del repositorio (`qwen3`, `transformers`, `safetensors`) indican que se trata de un derivado de Qwen3-4B, y el recuento real de pesos del safetensors confirma 4.411.424.256 parametros (4,41 mil millones), coherente con el tamano base declarado en el identificador del modelo.

El modelo procede de un experimento de aprendizaje por refuerzo denominado internamente `justrl_qwen3_4b_js_ladder_90_100_kl`, dentro de los experimentos "BiDirect-OPD" segun la propia model card. La rama `main` contiene el checkpoint `global_step_300`, y el repositorio expone catorce ramas adicionales con checkpoints intermedios (`global_step_20` hasta `global_step_280` en incrementos de 20). El sufijo "Selective-Top10pct" del nombre apunta a algun tipo de seleccion sobre el 10 % superior de un criterio no documentado, presumiblemente aplicada durante el entrenamiento o el filtrado de datos, aunque el autor no lo especifica.

La relevancia de esta ficha es limitada pero concreta: se trata de un artefacto de investigacion sin benchmarks publicados, sin licencia declarada y sin idiomas declarados, con cero descargas y cero "likes" en el momento de la consulta. Su interes principal esta en el estudio de la dinamica de entrenamiento por RL (la escalera de checkpoints permite analizar la evolucion del modelo paso a paso) y en la reproducibilidad de los experimentos BiDirect-OPD, no en un uso en produccion sin evaluacion previa.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible en la informacion proporcionada. Derivado de la familia Qwen3 (segun nombre y etiquetas); estructura interna concreta no documentada |
| Parametros totales | 4.411.424.256 (4,41 mil millones), segun los pesos en safetensors |
| Parametros activos | No aplica / no disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponibles. El repositorio solo publica pesos en safetensors; no se listan variantes GGUF, AWQ, GPTQ ni FP8 |
| Idiomas soportados | No disponibles |
| Licencia | No disponible |
| Formato de pesos | safetensors (libreria `transformers`) |
| Tamano del repositorio | 52,9 GB |
| Pipeline | text-generation |
| Idiomas y etiquetas adicionales | `conversational`, `text-generation-inference`, `endpoints_compatible`, `region:us` |
| Fecha de creacion | 2026-09-10 |
| Ultima actualizacion | 2026-09-10 |

## Arquitectura y entrenamiento

La model card no describe la arquitectura. Por el identificador y las etiquetas (`qwen3`), el modelo se presenta como un ajuste de Qwen3-4B, lo que implica una arquitectura transformer decoder-only con normalizacion RMSNorm, atencion por consultas agrupadas (GQA) y embeddings rotatorios, propia de esa familia. No hay confirmacion explicita en la informacion disponible, por lo que cualquier detalle adicional sobre numero de capas, dimensiones ocultas, cabezas de atencion o mecanismos de atencion debe verificarse en la ficha del modelo base.

En cuanto al entrenamiento, lo unico documentado es el origen: el modelo se subio desde el experimento `justrl_qwen3_4b_js_ladder_90_100_kl`, dentro de los experimentos "BiDirect-OPD". El prefijo "JustRL" sugiere un entrenamiento por refuerzo, y el sufijo `kl` apunta a un termino de divergencia KL en la funcion objetivo (habitual en RLHF/GRPO/DPO con anclaje al modelo de referencia). El nombre del repositorio, "Selective-Top10pct", apunta a una seleccion sobre el 10 % superior de algun criterio (posiblemente tokens, muestras o pasos), y el termino `ladder` sugiere una escalera de fases de entrenamiento, coherente con la escalera de checkpoints publicada cada 20 pasos hasta el paso 300. No se especifica el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo fases de SFT, RLHF o DPO adicionales.

La innovacion tecnica mas aprovechable desde el punto de vista de la investigacion no es interna al modelo, sino la estructura del repositorio: quince checkpoints de una misma trayectoria de RL, lo que permite trazar curvas de aprendizaje, medir deriva de distribucion respecto al modelo base, analizar el efecto del termino KL y estudiar si la seleccion del "top 10 %" mejora la estabilidad del entrenamiento.

## Capacidades

No hay documentacion del autor sobre capacidades especificas. Al tratarse de un derivado de Qwen3-4B, se espera por herencia la siguientes capacidades, ninguna de ellas verificada en la informacion disponible:

- Generacion de texto conversacional: la etiqueta `conversational` y el pipeline `text-generation` indican soporte de dialogos multi-turno en formato chat.
- Razonamiento y matematicas: esperado por herencia de Qwen3-4B, sin datos publicados para este checkpoint concreto.
- Generacion de codigo: esperado por herencia del modelo base, sin evaluacion publicada.
- Modo de razonamiento explicito (thinking mode): Qwen3 introdujo modos de pensamiento conmutables; no se confirma si el ajuste RL los conserva o los modifica.
- Soporte de tool calling / function calling: no documentado para este ajuste. Depende de si el tokenizer y la plantilla de chat se han conservado intactos.
- Capacidades de agente y razonamiento multi-paso: no documentadas.
- Capacidades multilingues: el campo de idiomas esta vacio en el repositorio; no se puede afirmar cobertura multilingue.
- Capacidades de vision o audio: no aplicables, no se declaran.

## Casos de uso

- Investigacion sobre aprendizaje por refuerzo: la escalera de quince checkpoints (`global_step_20` a `global_step_300`) permite estudiar la evolucion de la politica a lo largo del entrenamiento, medir la divergencia KL respecto al modelo base y analizar fenomenos de colapso de diversidad o sobreajuste a la recompensa. Es el uso mas solido dado el estado del artefacto.
- Analisis de la seleccion por "top 10 %": si el autor publica los detalles del criterio de seleccion, este checkpoint sirve como referencia para reproducir y ablar el efecto de filtrar el decil superior de senales de recompensa o de tokens.
- Punto de partida para fine-tuning posterior: con 4,41 mil millones de parametros, el modelo se puede ajustar en una GPU de 24 GB con cuantizacion o con tecnicas de adaptadores de bajo rango, lo que lo hace util como base para experimentos de alineacion a bajo coste.
- Destilacion on-policy (BiDirect-OPD): dado que el repositorio se enmarca en experimentos de destilacion, el modelo puede emplearse como estudiante o como profesor intermedio en pipelines de destilacion, comparando el rendimiento de distintos pasos de la escalera.
- Evaluacion comparativa de checkpoints intermedios: los quince puntos de control permiten construir estudios de ablacion sobre el numero de pasos de RL, algo util para decidir cuando detener un entrenamiento en proyectos propios.
- Generacion de texto asistida en entornos controlados: como modelo de 4B, puede ejecutarse en local para tareas de resumen, reescritura o asistencia conversacional, siempre que se realice una evaluacion previa propia, dado que no existen benchmarks publicados.
- Reproducibilidad academica: el repositorio permite a otros grupos replicar los experimentos BiDirect-OPD y contrastar los resultados con sus propias configuraciones de RL.
- Prototipado de agentes con contexto corto y bajo presupuesto de computo: si se confirma la ventana de contexto heredada del modelo base, podria integrarse en prototipos de agentes ligeros, con la advertencia de que el soporte de tool calling no esta documentado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tablas de MMLU, HumanEval, GSM8K, MT-Bench, Arena-Hard ni de ninguna otra evaluacion estandar, ni tampoco comparaciones con el modelo base Qwen3-4B. No se deben atribuir a este checkpoint los resultados publicos de Qwen3-4B, ya que el ajuste por RL con seleccion puede alterar el comportamiento de forma significativa en ambas direcciones.

## Requisitos de hardware

Estimaciones calculadas a partir del recuento real de parametros (4,41 mil millones). No son cifras publicadas por el autor.

- VRAM para inferencia en FP16/BF16: aproximadamente 9 GB solo para pesos, mas 1-3 GB de cache KV y activaciones segun longitud de contexto y tamano de lote. Presupuesto recomendado: 12-16 GB.
- VRAM para inferencia en INT8: aproximadamente 4,5-5 GB para pesos, con presupuesto total de 8-10 GB.
- VRAM para inferencia en INT4: aproximadamente 2,5-3 GB para pesos, con presupuesto total de 5-7 GB. Requiere cuantizacion propia, ya que el repositorio no publica variantes GGUF, AWQ ni GPTQ.
- GPU consumer: cabe holgadamente en RTX 4090 (24 GB), RTX 4080/4070 Ti Super (16 GB) y, con cuantizacion INT4, en tarjetas de 8 GB como RTX 3060 Ti o RTX 4060. Tambien es viable en Apple Silicon con memoria unificada de 16 GB o superior.
- GPU de datacenter: A100 40/80 GB, H100 80 GB, L40S y A6000 permiten servir el modelo en precision completa con lotes grandes y contexto largo; estan sobredimensionadas para un unico modelo de 4B salvo por concurrencia.
- Despliegue: compatible con el ecosistema transformers y con text-generation-inference (la etiqueta `text-generation-inference` y `endpoints_compatible` figura en el repositorio). vLLM y SGLang son opciones adecuadas para servir en safetensors con alto throughput. Para cuantizacion y ejecucion en CPU o GPU de gama baja, seria necesario convertir los pesos a GGUF con llama.cpp u Ollama, tarea que no ha realizado el autor.
- Latencia y throughput: no disponibles. No hay datos publicados de tokens por segundo ni de latencia en ninguna configuracion de hardware.
- Almacenamiento: el repositorio ocupa 52,9 GB por la acumulacion de ramas de checkpoints. Descargar solo la rama `main` reduce considerablemente el espacio necesario, en torno a 9 GB en safetensors FP16/BF16.

## Comparativa con modelos similares

Los datos de los modelos alternativos proceden de sus fichas publicas y no se han verificado en esta ficha. Del modelo objeto de analisis, la mayoria de campos figuran como "no disponible" porque el autor no los declara.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Benchmarks publicos |
|---|---|---|---|---|---|
| JustRL-Qwen3-4b-Selective-Top10pct | 4,41 mil millones | No disponible | No disponible | HuggingFace, 0 descargas | No |
| Qwen3-4B (modelo base de referencia) | ~4 mil millones | 32 768 tokens nativos, ampliable con YaRN | Apache 2.0 | HuggingFace, ampliamente descargado | Si (ficha oficial) |
| Qwen2.5-3B | ~3 mil millones | 32 768 tokens | Apache 2.0 | HuggingFace | Si (ficha oficial) |
| Llama 3.2 3B Instruct | ~3,2 mil millones | 128 000 tokens | Licencia de la comunidad de Llama | HuggingFace | Si (ficha oficial) |

Diferencias clave: frente a los tres alternativos, este checkpoint carece de licencia declarada, de idiomas declarados, de resultados de evaluacion y de variantes cuantizadas, lo que limita su uso en produccion. A cambio, ofrece algo que los modelos base no aportan: una trayectoria completa de RL con quince checkpoints intermedios, util exclusivamente para investigacion sobre dinamica de entrenamiento.

## Limitaciones y advertencias

- Licencia no declarada: el repositorio no especifica ninguna licencia. Sin licencia explicita, no hay autorizacion clara para uso comercial ni para redistribucion. Es un bloqueo potencial para cualquier despliegue en produccion.
- Cero validacion independiente: cero descargas y cero "likes" en el momento de la consulta, sin benchmarks ni evaluaciones externas. No se conoce su comportamiento real en ninguna tarea.
- Documentacion minima: la model card se limita a enumerar las ramas de checkpoints. No hay informacion sobre datos de entrenamiento, hiperparametros de RL, funcion de recompensa, criterio de seleccion del "top 10 %" ni numero de tokens vistos.
- Riesgo de sobreoptimizacion de la recompensa: al ser un modelo entrenado con RL (prefijo JustRL) y con un termino KL (`kl` en el nombre del experimento), es esperable cierta deriva respecto al modelo base, con posible perdida de diversidad, degradacion en tareas fuera de la distribucion de la recompensa o aparicion de sesgos introducidos por el modelo de recompensa. Estos sesgos no estan caracterizados.
- Riesgo de alucinacion: no cuantificado y, en principio, comparable o superior al del modelo base, ya que el ajuste por RL puede incrementar la confianza en respuestas incorrectas si la recompensa premia la fluidez o la seguridad aparente por encima de la veracidad.
- Idiomas no declarados: no se puede confirmar el soporte multilingue ni la calidad en castellano. Cualquier uso en espanol requiere evaluacion previa.
- Contexto desconocido: si el ajuste ha modificado la plantilla de chat o el tokenizer respecto al modelo base, la ventana de contexto efectiva y el formato de prompt podrian diferir. Hay que verificar los archivos de configuracion y del tokenizer antes de integrarlo.
- Compatibilidad de tool calling no confirmada: no se documenta soporte de llamadas a funciones. En pipelines de agentes, asumir esta capacidad sin verificar puede provocar fallos silenciosos en el parseo de salidas estructuradas.
- Artefacto de investigacion: la rama `main` corresponde al paso 300 de una escalera de RL, no necesariamente al checkpoint con mejor rendimiento. Los pasos intermedios podrian comportarse mejor en tareas concretas; el autor no indica criterios de seleccion.
- Tamano del repositorio: 52,9 GB por la acumulacion de quince ramas de checkpoints. Conviene descargar solo la rama necesaria para evitar consumo innecesario de disco y ancho de banda.
- Modelo de 4B: incluso con un ajuste optimo, la capacidad de razonamiento complejo, matematicas avanzadas y contextos muy largos esta acotada por el tamano. No es adecuado como sustituto de modelos de mayor escala en tareas de alta exigencia.

## Enlaces

- Ficha del modelo en HuggingFace: https://huggingface.co/SelectiveDOPD/JustRL-Qwen3-4b-Selective-Top10pct
- Repositorio del modelo base Qwen3-4B: https://huggingface.co/Qwen/Qwen3-4B
- Documentacion tecnica de la familia Qwen3 (blog oficial): https://qwenlm.github.io/blog/qwen3/
- Articulo tecnico de Qwen3 en arXiv: https://arxiv.org/abs/2505.09388
- Resultados de busqueda web: no se han encontrado resultados relevantes sobre este modelo. Las entradas devueltas corresponden al medio de prensa suizo Blick y no guardan ninguna relacion con el modelo analizado.
