# flammafex/Qwen3-4B-High-Level-Critic-SFT-DPO-GGUF

## Resumen

Qwen3-4B-High-Level-Critic-SFT-DPO-GGUF es una conversion a formato GGUF, con varias cuantizaciones, del checkpoint `code-critic-model/Qwen3-4B-Critic-SFT-DPO`, un modelo critico de 4.000 millones de parametros desarrollado para supervisar agentes de codigo. No se trata de un modelo que resuelva tareas de programacion, sino de un supervisor de trayectoria: examina lo que un agente ha hecho hasta el momento, detecta errores a nivel de trayectoria y devuelve una guia correctiva breve sin resolver el problema por el agente. La conversion la firma el usuario `flammafex` y deriva del trabajo descrito en el articulo "Steer, Don't Solve: Training Small Critic Models for Large Code Agents" (arXiv:2606.21811).

El checkpoint original parte de `Qwen/Qwen3-4B-Instruct-2507` y se entreno con un pipeline de SFT seguido de DPO sobre pares de criticas generadas por el propio modelo SFT. La contribucion especifica de este repositorio es de inferencia, no de entrenamiento: el prompt de sistema del critico de alto nivel se ha incrustado directamente en la plantilla de chat del GGUF, de modo que un cliente compatible con llama.cpp puede enviar la trayectoria del agente como un mensaje de usuario normal, sin aportar por separado el prompt de supervision.

Es relevante porque aborda un problema practico de los sistemas agénticos: los modelos pequenos fallan a menudo en la supervision de trayectorias largas, y depender de un modelo grande como critico encarece y ralentiza el bucle del agente. Un critico de 4B en GGUF, ejecutable en GPU de consumo, permite incorporar supervision de trayectoria en tiempo real. La arquitectura es un transformer denso de la familia Qwen3, con 262.144 tokens de contexto nativo en el modelo base (el articulo usa 65.536 como longitud maxima en su ejemplo de servicio), licencia Apache 2.0 y modo thinking desactivado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso decoder-only de la familia Qwen3 |
| Parametros totales | 4B |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens nativos en el modelo base; 65.536 tokens de longitud maxima usados en el ejemplo de servicio publicado del critico; los ejemplos de llama.cpp del repositorio usan 32.768 tokens |
| Tipos de cuantizacion | BF16, Q8_0, Q6_K, Q5_K_M, Q4_K_M |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del Qwen3-4B-Instruct-2507: un transformer denso decoder-only con atencion por grupos (GQA) y 4.000 millones de parametros, sin mezcla de expertos ni atencion lineal. El modelo base soporta 262.144 tokens de contexto nativo, aunque el checkpoint critico se sirve en el ejemplo publicado con una longitud maxima de 65.536 tokens. El modo thinking esta desactivado, de modo que la generacion es directa y no produce bloques de razonamiento intermedios.

El entrenamiento del checkpoint original se hizo en dos fases: primero un ajuste supervisado (SFT) sobre datos de supervision de trayectorias de agentes de codigo, y despues una optimizacion por preferencias directas (DPO) sobre pares de criticas generadas por el propio modelo SFT. La innovacion tecnica destacable no esta en la arquitectura, sino en el diseno del prompt de supervision incrustado: este instruye al modelo a vigilar doce clases de errores a nivel de trayectoria, agrupadas en errores de especificacion (violaciones de la especificacion de tarea, violaciones de rol, repeticion de pasos, desconocimiento de la condicion de terminacion), errores de razonamiento (identificacion erronea del problema, seleccion incorrecta de herramientas, alucinaciones, fallos de procesamiento de informacion) y errores de coordinacion (desvio de tarea, desviacion de objetivo, fallos de gestion de contexto y fallos de verificacion). El prompt insiste en que el critico sea conservador —debe permitir que un agente competente continue salvo evidencia clara de problema— y en que no resuelva la tarea: no debe emitir codigo, comandos de shell, recetas de implementacion ni enfoques tecnicos alternativos detallados.

Este repositorio no ha entrenado nada: solo convierte pesos y modifica `tokenizer.chat_template` para incrustar el prompt de sistema del critico de alto nivel. Si la aplicacion anade ademas un mensaje de sistema propio, este se concatena despues de las instrucciones incrustadas dentro de la seccion de sistema.

## Capacidades

- Supervision de trayectorias de agentes de codigo: analiza el historial de acciones de un agente y emite una critica breve y correctiva de alto nivel.
- Deteccion de doce clases de errores a nivel de trayectoria: cuatro de especificacion, cuatro de razonamiento y cuatro de coordinacion.
- Guia conservadora: por defecto permite continuar al agente y solo interviene ante evidencia clara de problema.
- Restriccion explicita de rol: no genera codigo, comandos de shell ni recetas de implementacion, lo que reduce el riesgo de que el critico sustituya al agente.
- Integracion con llama.cpp mediante plantilla de chat con el prompt de supervision ya incrustado.
- Sin modo thinking: la respuesta es directa, lo que simplifica el parseo en el bucle del agente.
- Tool calling y function calling: no disponible en la informacion proporcionada.
- Capacidades de agente autonomo, vision o audio: no disponibles; el modelo actua como componente supervisor, no como agente.
- Capacidades multilingues: limitadas al ingles segun los metadatos del repositorio.

## Casos de uso

- Supervision en linea de agentes de codigo: el critico se intercala en cada N pasos del bucle del agente, recibe la trayectoria acumulada como mensaje de usuario y devuelve una correccion corta cuando detecta repeticion de pasos, desvio de objetivo o alucinaciones. Al ser un modelo de 4B en Q6_K, cabe en GPU de consumo y anade poca latencia al bucle.
- Filtrado de trayectorias antes de entrenar: las criticas del modelo pueden usarse para anotar y descartar trayectorias defectuosas en la construccion de datasets de entrenamiento de agentes, aprovechando su capacidad de clasificar errores en doce categorias.
- Evaluacion automatica de agentes en CI: integrar el critico en un pipeline de integracion continua que ejecute tareas de codigo representativas y marque las trayectorias que superen un umbral de errores, como senal de regresion entre versiones del agente.
- Deteccion de bucles infinitos en produccion: el critico identifica explicitamente repeticion de pasos y desconocimiento de la condicion de terminacion, dos fallos que disparan el coste de un agente autonomo sin aportar progreso.
- Supervision de subagentes en sistemas multiagente: cuando varios agentes coordinan tareas, el critico puede actuar sobre el flujo agregado para detectar fallos de gestion de contexto y de verificacion entre agentes.
- Servicio de critica como microservicio local: desplegado con `llama-server` y la plantilla incrustada, cualquier cliente compatible con OpenAI puede enviar solo la trayectoria y obtener la critica, sin gestionar el prompt de sistema por separado.
- Investigacion sobre modelos de recompensa de proceso: el modelo sirve como linea base de 4B para comparar estrategias de supervision de trayectoria frente a criticos mayores o frente a la supervision por resultado.
- Despliegue en entornos con VRAM limitada: las cuantizaciones Q5_K_M y Q4_K_M, combinadas con cache KV cuantizada a q8_0 y microbatch reducido, permiten servir contexto largo en GPUs de alrededor de 6 GB.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks numericos en la informacion disponible. Los unicos datos cualitativos aportados son que el articulo describe este checkpoint como el critico de 4B mas fuerte de los evaluados en el trabajo, y que el modelo base Qwen3-4B-Instruct-2507 del que deriva pertenece a la familia Qwen3 descrita en el informe tecnico arXiv:2505.09388. No se dispone de cifras de MMLU, HumanEval, GSM8K ni de metricas especificas de supervision de trayectorias en el material proporcionado.

| Benchmark | Resultado |
|---|---|
| MMLU | no disponible |
| HumanEval | no disponible |
| GSM8K | no disponible |
| Metricas de critica de trayectoria | no disponible |

## Requisitos de hardware

- VRAM estimada para inferencia (pesos, sin contar cache KV): aproximadamente 8 GB en BF16, 4,3 GB en Q8_0, 3,4 GB en Q6_K, 2,9 GB en Q5_K_M y 2,5 GB en Q4_K_M. Son estimaciones de orden de magnitud a partir del tamano de las cuantizaciones; el consumo real depende del backend y de la longitud de contexto.
- Cache KV: con 32.768 tokens de contexto y 36 capas, la cache KV en f16 es considerable; el propio repositorio recomienda cuantizarla a q8_0 (`--cache-type-k q8_0 --cache-type-v q8_0`) para liberar VRAM.
- GPU de consumo: el modelo cabe en tarjetas de 8 GB o mas en Q4_K_M y Q5_K_M. El repositorio documenta explicitamente una configuracion para GPU de unos 6 GB de VRAM usando Q5_K_M con cache KV cuantizada y contexto de 32.768 tokens.
- GPU profesionales: A100, H100, L40S o A10G permiten servir la cuantizacion Q8_0 o BF16 con contexto largo sin recurrir a la cuantizacion de cache.
- Opciones de despliegue: llama.cpp y su servidor `llama-server` son el camino soportado, dado que el artefacto es GGUF con plantilla de chat modificada. vLLM, TGI y Ollama no estan confirmados en la informacion proporcionada, aunque Ollama podria consumir el GGUF.
- Ajuste fino de memoria: el repositorio sugiere reducir el microbatch fisico con `-ub 128` para disminuir los requisitos del buffer de computo.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo para este checkpoint.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rol | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3-4B-High-Level-Critic-SFT-DPO-GGUF | 4B | 262.144 nativos (65.536 en el ejemplo de servicio) | Critico de trayectorias de agentes de codigo | Apache 2.0 | GGUF en HuggingFace |
| code-critic-model/Qwen3-4B-Critic-SFT-DPO | 4B | 262.144 nativos | Critico de trayectorias, checkpoint original BF16 | Apache 2.0 | Safetensors en HuggingFace |
| Qwen/Qwen3-4B-Instruct-2507 | 4B | 262.144 nativos | Modelo de proposito general, modo instruct | Apache 2.0 | Pesos y GGUF en HuggingFace |
| Otros criticos de 4B evaluados en el articulo | no disponible | no disponible | Critico de trayectorias | no disponible | no disponible |

La diferencia frente al checkpoint original no es de pesos ni de rendimiento, sino de empaquetado: la version GGUF incrusta el prompt de supervision en la plantilla de chat y ofrece cinco niveles de cuantizacion. Frente a Qwen3-4B-Instruct-2507, el critico ha sido ajustado especificamente para supervisar trayectorias y tiene el modo thinking desactivado.

## Limitaciones y advertencias

- Es un modelo critico, no un agente: no resuelve tareas de programacion y no debe usarse como generador de codigo en produccion.
- Doble inyeccion del prompt de sistema: si la aplicacion anade por su cuenta el prompt de critico de alto nivel, las instrucciones se duplicaran, ya que este ya esta incrustado en la plantilla de chat del GGUF.
- Idiomas: el repositorio declara unicamente ingles. No hay evidencia de comportamiento fiable en castellano ni en otros idiomas.
- Alucinacion: el propio prompt de supervision contempla la deteccion de alucinaciones como categoria de error, lo que implica que el critico puede emitir criticas incorrectas sobre trayectorias validas. La instruccion de ser conservador mitiga, pero no elimina, este riesgo.
- Sesgos conocidos: no disponibles en la informacion proporcionada.
- Longitud de contexto efectiva: aunque el modelo base soporta 262.144 tokens, el ejemplo de servicio publicado usa 65.536 y los ejemplos de llama.cpp del repositorio usan 32.768. Rendimiento mas alla de esas longitudes no esta documentado.
- Contexto largo en VRAM limitada: sin cuantizacion de cache KV, el contexto de 32.768 tokens puede agotar la memoria de una GPU de 6-8 GB.
- Cuantizacion agresiva: el propio autor advierte que Q4_K_M, aunque ahorra memoria, debe usarse con mayor cautela que Q5_K_M o Q6_K para este caso de uso.
- Licencia Apache 2.0: permite uso comercial, pero conviene conservar los avisos de atribucion del modelo base Qwen3 y del checkpoint critico original.
- Madurez del artefacto: el repositorio registra cero descargas y cero likes en el momento de la consulta, y los pesos no incorporan entrenamiento adicional respecto al checkpoint original.
- Reproducibilidad: no se documentan semillas, hiperparametros de DPO ni composicion exacta del dataset de SFT en el material disponible.

## Enlaces

- Repositorio GGUF: https://huggingface.co/flammafex/Qwen3-4B-High-Level-Critic-SFT-DPO-GGUF
- Checkpoint critico original: https://huggingface.co/code-critic-model/Qwen3-4B-Critic-SFT-DPO
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B
- Articulo "Steer, Don't Solve: Training Small Critic Models for Large Code Agents": https://arxiv.org/abs/2606.21811
- Informe tecnico de Qwen3: https://arxiv.org/abs/2505.09388
- Informe tecnico de Qwen3 (HTML): https://arxiv.org/html/2505.09388v1
- Repositorio Qwen3 en GitHub: https://github.com/QwenLM/Qwen3
