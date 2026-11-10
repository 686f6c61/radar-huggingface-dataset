# ragentile/Jasper-K-32B

## Resumen

Jasper-K-32B es un modelo de lenguaje de 32 mil millones de parámetros desarrollado por el usuario ragentile, construido como un ajuste fino (finetune) del modelo Qwen/QwQ-32B. Su especialización declarada es la optimización de kernels de GPU, un dominio tecnico donde el modelo debe generar codigo CUDA funcional y optimizado en terminos de rendimiento. El modelo se distribuye bajo licencia Apache 2.0 y se etiqueta con las categorias kernel-optimization, reinforcement-learning e inference-harness.

El repositorio de Hugging Face no contiene los pesos del modelo en el momento de redactar esta ficha; lo que se publica es un arnes de inferencia denominado J1 Inference Harness, que incluye codigo de generacion multi-turno, multi-rollout, un cliente de evaluacion, scripts de lanzamiento para vLLM y tareas de ejemplo. La model card indica explicitamente que "los pesos del modelo y el backend de evaluacion no estan incluidos en este repositorio todavia". Por tanto, el modelo no es descargable ni ejecutable directamente desde el repositorio, y su evaluacion practica depende de un servicio de evaluacion propio (el servicio interno CudaEval no se distribuye).

La relevancia del proyecto radica en su enfoque: un bucle de optimizacion de kernels guiado por retroalimentacion de ejecucion real (correccion y rendimiento medidos), con hasta cuatro turnos por trayectoria y multiples rollouts por tarea. Se apoya en la arquitectura de Qwen2.5-32B subyacente de QwQ-32B, un transformer denso de 32B parametros con contexto de 131.072 tokens en su version original, aunque el arnes limita la ventana de servicio a 40.960 tokens.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (heredada de Qwen/QwQ-32B) |
| Parametros totales | 32.000 millones (32B, segun modelo base QwQ-32B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 40.960 tokens en el arnes J1 (ventana de servicio); contexto nativo del modelo base no confirmado en la informacion disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | No disponible (los pesos no estan incluidos en el repositorio) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Qwen/QwQ-32B, un transformer denso de 32B parametros. La model card no detalla la composicion del dataset de entrenamiento ni el numero de tokens utilizados en el ajuste fino. Las etiquetas del repositorio indican que el entrenamiento se realizo mediante aprendizaje por refuerzo (reinforcement-learning) orientado a la optimizacion de kernels, presumiblemente con retroalimentacion de ejecucion (correccion funcional y mediciones de rendimiento) como senal de recompensa, aunque este extremo no se describe explicitamente en la informacion proporcionada.

La innovacion tecnica principal documentada es el arnes J1, que implementa un presupuesto de pensamiento en dos etapas: una primera etapa de hasta 32.768 tokens para el razonamiento, seguida de una instruccion de cierre insertada si se alcanza el limite sin terminar la seccion de pensamiento, tras lo cual la generacion de respuesta continua desde los token IDs originales. El presupuesto total de generacion es de 40.960 tokens menos la longitud completa del prompt. El arnes soporta presupuesto dinamico de contexto, `top_k=-1` explicito, un offset de semilla basado en el indice de trayectoria, evaluacion SOL con timeout de 300 segundos y la regla de evaluar resultados truncados parseables antes de terminar la trayectoria. La decodificacion usa temperatura 0,9 y top_p 0,95.

## Capacidades

- Generacion de codigo CUDA orientado a optimizacion de kernels, con iteracion guiada por retroalimentacion de ejecucion.
- Razonamiento multi-turno: hasta cuatro turnos por trayectoria, con historial, codigo y resultados de evaluacion pasados al turno siguiente.
- Multi-rollout: multiples trayectorias independientes por tarea (por defecto 16), conservando cada una su mejor implementacion verificada.
- Presupuesto de pensamiento configurable en dos etapas (hasta 32.768 tokens en la primera fase).
- Integracion con un endpoint de evaluacion externo mediante un adaptador generico (`/evaluate`), que permite conectar verificaciones de correccion, mediciones de rendimiento y aislamiento de ejecucion propios.
- Compatibilidad con endpoints vLLM `/v1/completions` que soporten `return_token_ids`.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Soporte de tool calling, agentes genericos, vision o audio: no disponible en la informacion proporcionada.

## Casos de uso

- Optimizacion automatica de kernels CUDA: el modelo genera implementaciones candidatas de un kernel a partir de una referencia `Model` y funciones de construccion de entrada, y el arnes evalua correccion y rendimiento para seleccionar la mejor variante. Es el caso de uso central del proyecto.
- Exploracion de espacio de diseno en computacion GPU: con 16 rollouts independientes por tarea y hasta 64 rondas de generacion/evaluacion por tarea, el modelo puede producir y comparar multiples estrategias de optimizacion (por ejemplo, distintas politicas de tiling o de uso de memoria compartida) sobre el mismo problema.
- Investigacion en aprendizaje por refuerzo con retroalimentacion de ejecucion: el arnes proporciona la infraestructura para estudiar como un modelo de 32B mejora sus soluciones cuando recibe senales de correccion y latencia entre turnos.
- Generacion de codigo asistida por verifiacion: en pipelines internos donde se disponga de un evaluador propio, el modelo puede integrarse como generador de codigo sujeto a pruebas de correccion antes de aceptar una salida.
- Prototipado de sistemas de sintesis de programas: el flujo de multiples trayectorias con retencion del mejor resultado verificado sirve como base para experimentos de best-of-N en generacion de codigo.
- Formacion y evaluacion de modelos especializados: las tareas de ejemplo organizadas por niveles (`level1/1_example.py`, `level2/2_example.py`, etc.) permiten construir conjuntos de evaluacion progresivos en dominios de computacion de alto rendimiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card advierte explicitamente que las puntuaciones del autotest no deben interpretarse como resultados oficiales de benchmark, y no incluye cifras de MMLU, HumanEval, GSM8K ni de evaluaciones de optimizacion de kernels.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita. Para un modelo denso de 32B parametros, la inferencia en BF16 requiere aproximadamente 64 GB de VRAM solo para pesos, mas memoria para cache KV y activaciones; con cuantizacion de 8 bits se reduce a unos 32 GB y con 4 bits a unos 16-20 GB, aunque estas cifras son estimaciones generales y no estan confirmadas en la informacion proporcionada.
- GPU recomendadas: el despliegue por defecto del arnes es 1 replica con tensor parallelism de 8 dispositivos (`TP8`), lo que sugiere configuraciones multi-GPU (por ejemplo, 8x A100 o 8x H100) para el modo documentado.
- Cabe en GPU de consumo: no confirmado. Con cuantizacion agresiva podria caber en GPUs de 24 GB, pero no hay datos en la informacion disponible.
- Opciones de despliegue: vLLM (documentado, mediante endpoint `/v1/completions` con `return_token_ids`), Python 3.11 o superior y versiones de Transformers compatibles con la arquitectura. No se mencionan llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. El arnes configura timeout de 7.200 segundos por ejecucion, timeout de evaluacion SOL de 300 segundos y repeticiones de pruebas de rendimiento de 100 por defecto, pero no publica cifras de latencia ni tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad de pesos |
|---|---|---|---|---|---|
| Jasper-K-32B | 32B (denso) | 40.960 tokens en el arnes J1 | Optimizacion de kernels CUDA | Apache 2.0 | No incluidos en el repositorio |
| Qwen/QwQ-32B | 32B (denso) | 131.072 tokens (modelo base) | Razonamiento general | Apache 2.0 | Disponible en Hugging Face |
| Alternativas de optimizacion de kernels | No disponible | No disponible | No disponible | No disponible | No disponible |

La comparacion con otras alternativas especializadas en optimizacion de kernels no esta disponible en la informacion proporcionada. El unico punto de referencia solido es el modelo base QwQ-32B, del que Jasper-K-32B hereda arquitectura y tamano pero del que se diferencia por el ajuste fino con RL y por el arnes de evaluacion, no por cambios estructurales documentados.

## Limitaciones y advertencias

- Los pesos del modelo no estan incluidos en el repositorio; la ficha no permite descargar ni ejecutar el modelo, solo el arnes de inferencia.
- El backend de evaluacion interno (CudaEval) no se distribuye; el usuario debe implementar su propio evaluador, verificaciones de correccion, mediciones de rendimiento y aislamiento de ejecucion.
- Sin un endpoint de evaluacion conectado, cada trayectoria genera un solo turno y la optimizacion multi-turno guiada por retroalimentacion no esta disponible.
- El adaptador de evaluacion no implementa compilacion, ejecucion en dispositivo, medicion de tiempos ni perfilado; esas funciones son responsabilidad del usuario.
- La longitud de contexto efectiva en el arnes es de 40.960 tokens, inferior al contexto nativo del modelo base; prompts largos reducen el presupuesto de generacion disponible.
- El presupuesto de pensamiento no es un recuento exacto de tokens de razonamiento: limita la longitud de la primera etapa de generacion, y la instruccion de cierre insertada cuenta contra el presupuesto total.
- Las puntuaciones del autotest no equivalen a resultados oficiales de benchmark y su reevaluacion final no incluye todas las comprobaciones del servicio completo.
- Riesgo de alucinacion y sesgos: no documentados en la informacion disponible, pero aplicables por herencia del modelo base.
- Idiomas soportados no documentados; el uso en produccion multilingue no esta garantizado.
- El modelo tiene 0 descargas y 0 likes en el momento de redactar esta ficha, lo que indica ausencia de validacion por parte de la comunidad.
- La licencia Apache 2.0 permite uso comercial, pero la ausencia de pesos publicados impide ejercer ese derecho sobre el modelo en si.

## Enlaces

- Repositorio de Hugging Face: https://huggingface.co/ragentile/Jasper-K-32B
- Modelo base: https://huggingface.co/Qwen/QwQ-32B
- Paper referenciado en las etiquetas (arXiv:2507.11948): https://arxiv.org/abs/2507.11948
- Documentacion del adaptador de evaluacion: EVALUATOR_API.md (referenciado en la model card, sin URL externa disponible)
- Scripts de lanzamiento de vLLM y tareas de ejemplo: incluidos en el repositorio (sin URL externa disponible)
