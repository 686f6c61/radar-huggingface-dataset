# jsbaicenter/Aztec-Coder-4B

## Resumen

Aztec-Coder-4B es un modelo de codificacion agentica de 4.205.751.296 parametros (~4,2B) desarrollado por el James Silberrad Brown Center for Artificial Intelligence (JSBCAI) de la Universidad Estatal de San Diego (SDSU), publicado bajo el identificador `jsbaicenter/Aztec-Coder-4B`. Se trata de un *fine-tuning* de `Qwen/Qwen3.5-4B` orientado a un flujo de trabajo concreto: el modelo explora un repositorio de software, localiza el fallo, escribe un parche, ejecuta comandos y lanza la suite de tests dentro de un contenedor aislado para verificar su propia correccion. Su propuesta es trasladar la codificacion agentica, hasta ahora territorio de modelos de 27B o mas, a hardware de consumo.

El modelo se entrena en tres etapas: destilacion de aproximadamente 1.875 trayectorias de codificacion generadas por GLM-5.3 (un modelo abierto de 744B) y verificadas ejecutando los tests reales; aprendizaje por refuerzo con GRPO sobre 237 problemas de ingenieria de software seleccionados; y comprobaciones de generalizacion en cada frontera de etapa. El resultado declarado es un salto del 10,1% al 82,9% en un conjunto reservado de 121 fallos reales nunca vistos durante el entrenamiento, medido ejecutando la suite de tests oculta de cada proyecto.

La relevancia actual del modelo esta en su relacion tamano/capacidad y en su coste de despliegue: aproximadamente 8 GB de VRAM en BF16 y unos 5 GB en la variante cuantizada NVFP4, con una ventana de contexto de 131.072 tokens en la configuracion de ejemplo para vLLM. Ademas, hereda de su modelo base la plantilla de chat de Qwen3.5 con *thinking* intercalado, el parser de razonamiento `qwen3` y el formato de llamada a herramientas `qwen3_coder`. La licencia Apache-2.0, identica a la del modelo base, elimina friccion para uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder denso (familia `qwen3_5_text`), con razonamiento intercalado entre llamadas a herramientas |
| Parametros totales | 4.205.751.296 (~4,2B) |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | 131.072 tokens (valor de `max_model_len` en el ejemplo de uso con vLLM) |
| Tipos de cuantizacion | BF16 (pesos originales); NVFP4 en la variante oficial de ~5 GB, cuantizada con NVIDIA ModelOpt; cabezal MTP de decodificacion especulativa disponible en la misma organizacion |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria `transformers`; tamano del repositorio 8,7 GB) |

## Arquitectura y entrenamiento

Arquitectura transformer decoder denso de 4,2B parametros, derivada por *fine-tuning* de Qwen3.5-4B. No hay mezcla de expertos ni componentes de espacio de estados: el modelo es denso y su coste de inferencia es proporcional a su tamano completo. El autor declara compatibilidad con la plantilla de chat de Qwen3.5 con *thinking* intercalado, el parser de razonamiento `qwen3` en vLLM y el formato de tool calling `qwen3_coder`. Los parametros de muestreo recomendados son temperatura 1,0 y top_p 0,95.

El entrenamiento consta de tres etapas. La primera es de demostraciones semilla: GLM-5.3 (744B) genero aproximadamente 1.875 trayectorias de codificacion, cada una verificada ejecutando los tests reales antes de incorporarla, con el objetivo de ensenar al modelo el formato del trabajo agentico (uso de herramientas, cuando ejecutar tests, que aspecto tiene una solucion valida). La segunda es aprendizaje por refuerzo sobre 237 problemas de ingenieria de software seleccionados por ser resolubles de forma ocasional pero no fiable; se aplicaron 145 lotes de GRPO *on-policy*, reforzando unicamente las soluciones que hacian pasar los tests ocultos y sin emplear datos estaticos: cada lote generaba intentos nuevos y solo el resultado verificado por tests se convertia en senal de entrenamiento. La tercera etapa consiste en reevaluaciones de generalizacion en cada frontera de etapa sobre problemas nunca vistos.

El corpus auxiliar para capacidades generales proviene de una porcion de NVIDIA Nemotron-Post-Training-Dataset-v2 (instrucciones generales, salida estructurada y uso de herramientas), complementado con conjuntos abiertos de SWE como fondo de practica para la fase de RL. El autor afirma haber publicado un protocolo de descontaminacion segun el cual ninguno de los problemas de benchmark se solapa con los datos de entrenamiento. El informe tecnico completo, con ablaciones y resultados negativos sobre destilacion por *teacher logprob*, esta anunciado como proximo. No se especifica el numero total de tokens de entrenamiento ni la composicion detallada del dataset.

## Capacidades

- Generacion de texto y razonamiento: el modelo razona entre llamadas a herramientas (*interleaved thinking*), de forma comparable a modelos de razonamiento de mayor tamano.
- Codificacion agentica sobre repositorios reales: explora un *codebase*, localiza el codigo que falla, escribe un parche y lo valida ejecutando la suite de tests.
- Ejecucion de comandos en *sandbox*: opera dentro de un contenedor aislado, ejecutando comandos de shell y herramientas de desarrollo.
- Uso de herramientas (*tool calling* / *function calling*): soporta el formato `qwen3_coder`, compatible con el *reasoning parser* `qwen3` de vLLM.
- Razonamiento multi-paso y flujos de agente: encadenamiento de acciones con verificacion propia antes de dar una tarea por terminada.
- Seguimiento de instrucciones: puntuacion IFEval de 87,21, superior a la del modelo base (84,66).
- Salida estructurada: capacidad reforzada con datos de *structured output* de Nemotron-Post-Training-Dataset-v2.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Capacidad especial de inferencia: existe un cabezal MTP (Multi-Token Prediction) de decodificacion especulativa publicado por la misma organizacion para acelerar la generacion.
- No se documentan capacidades de vision, audio ni otras modalidades.

## Casos de uso

- Correccion automatica de fallos en integracion continua: el modelo puede recibir un *issue* o un fallo de test en un runner, explorar el repositorio, generar un parche y ejecutar la suite para validarlo antes de abrir un *pull request*, lo que encaja con su entrenamiento especifico en resolucion de bugs verificada por tests.
- Asistente de desarrollo en local sobre portatil: con ~8 GB de VRAM en BF16 (o ~5 GB en NVFP4) se puede ejecutar en un portatil con GPU de consumo, dando soporte de exploracion de codigo y edicion de archivos sin enviar codigo propietario a servicios externos.
- Migracion y refactorizacion de codigo heredado: se le puede pedir que localice los puntos de uso de una API obsoleta, aplique los cambios y verifique que los tests siguen pasando, aprovechando su capacidad de inspeccionar el repositorio antes de editar.
- Generacion de tests de regresion: dado un modulo sin cobertura, el modelo puede generar casos de prueba, ejecutarlos y corregir los que fallen, usando el mismo bucle de verificacion que emplea al reparar bugs.
- Agente de mantenimiento de dependencias: automatizar la actualizacion de librerias, la adaptacion del codigo a los cambios de API y la comprobacion de que la build y los tests siguen en verde dentro de un contenedor.
- Diagnostico de fallos en produccion a partir de trazas: el modelo puede recibir un *stack trace* o un *log* de error, rastrear en el repositorio la ruta de ejecucion afectada y proponer una hipotesis de causa raiz con un parche candidato.
- Automatizacion de tareas de terminal en entornos *sandbox*: dado que el bucle de agente esta ajustado para entornos de contenedor, resulta adecuado para pipelines de evaluacion automatizada, *benchmarking* interno y agentes de operaciones con aislamiento.
- Prototipado rapido con contexto largo: los 131.072 tokens de ventana permiten cargar modulos completos o varios archivos grandes en una sola pasada para tareas de analisis y reescritura.

## Benchmarks y rendimiento

Resultados publicados en la model card. El conjunto de generalizacion consta de 121 fallos reales nunca vistos durante el entrenamiento, verificados ejecutando la suite de tests de cada proyecto.

| Benchmark | Qwen3.5-4B (base) | Aztec-Coder-4B | Aztec-Coder-4B-NVFP4 |
|---|---|---|---|
| Generalization test (121 fallos no vistos, verificados con tests) | 10,1% | 82,9% | 38,0% (*) |
| Live-60 (60 tareas de ingenieria reales resueltas de extremo a extremo en contenedores) | 15,0% | 21,7% | 15,0% |
| Instruction-following (IFEval) | 84,66 | 87,21 | 86,37 |
| MMLU-Pro | 64,0% | 70,0% | 66,85% |
| Terminal-Bench 1.0 (core, 80 tareas) | 33,8% | 33,8% | 18,8% |

(*) El dato de generalizacion de la variante NVFP4 corresponde a un subconjunto de 32 instancias (12/32), el mismo fragmento empleado en las comparaciones de la model card. El autor indica que la cuantizacion cuesta aproximadamente la mitad de la capacidad de generalizacion. Terminal-Bench 2.1 (89 tareas) aparece como "coming soon" en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: ~8 GB en BF16 (pesos originales, repositorio de 8,7 GB); ~5 GB con la variante cuantizada NVFP4.
- GPU de consumo: cabe en tarjetas de consumo con 8 GB o mas de VRAM. Con 8 GB exactos el margen es ajustado en BF16, ya que hay que sumar la cache KV para la ventana de contexto configurada; las opciones comodas son RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090 y equivalentes. La variante NVFP4 reduce el requisito a unos 5 GB, lo que la hace viable en tarjetas de 6-8 GB.
- GPU de centro de datos: A100, H100 y similares no son necesarias para el modelo base, pero permiten aumentar el *batch* y procesar contextos de 131.072 tokens con mas holgura.
- Despliegue: el ejemplo oficial de uso emplea vLLM (`LLM(model="jsbaicenter/Aztec-Coder-4B", max_model_len=131072)`), con el *reasoning parser* `qwen3` y el formato de tool call `qwen3_coder`. Al ser un modelo de `transformers` con pesos en safetensors, es compatible con el ecosistema habitual de transformers; no se confirma en la informacion disponible la existencia de pesos GGUF ni soporte explicito para llama.cpp, Ollama o TGI.
- Aceleracion opcional: cabezal MTP de decodificacion especulativa publicado por la misma organizacion, orientado a reducir la latencia de generacion.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

La comparativa directa disponible es con el propio modelo base y con la variante cuantizada del mismo autor. No se dispone de datos verificables de otros modelos comparables en la informacion proporcionada.

| Modelo | Parametros | Contexto | Rendimiento en codificacion agentica | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Aztec-Coder-4B | 4,2B | 131.072 tokens (configuracion vLLM) | 82,9% en 121 fallos no vistos; 21,7% en Live-60 | Apache-2.0 | safetensors en HuggingFace |
| Aztec-Coder-4B-NVFP4 | 4,2B (cuantizado) | no disponible | 38,0% (*) en 32 fallos no vistos; 15,0% en Live-60 | Apache-2.0 (heredada) | variante cuantizada en HuggingFace |
| Qwen3.5-4B (base) | 4,2B | no disponible | 10,1% en 121 fallos no vistos; 15,0% en Live-60 | Apache-2.0 | safetensors en HuggingFace |

El autor situa el punto de partida de la codificacion agentica fiable en modelos de 27B o mas, categoria para la que no se aportan cifras comparativas en la informacion disponible. Otros modelos de codigo de referencia del sector (por ejemplo, la familia DeepSeek-Coder) no cuentan con datos comparables en esta informacion, por lo que no se incluye una comparacion numerica con ellos.

## Limitaciones y advertencias

- Conocimiento limitado por tamano: al ser un modelo de 4B, los hechos poco frecuentes y el razonamiento en dominios muy especializados siguen favoreciendo a modelos mayores, tal como advierte el propio autor.
- Bucle de agente ajustado a contenedores: el flujo agentico se optimizo para entornos *sandbox*; otros contextos de despliegue no han sido probados.
- Seguridad no entrenada especificamente: los comportamientos de seguridad provienen del modelo base, ya que la fase de RL optimizo unicamente el paso de tests. Se recomienda consultar la model card de Qwen3.5-4B y aplicar capas adicionales de moderacion en produccion.
- Perdida de capacidad por cuantizacion: la variante NVFP4 reduce la generalizacion en resolucion de bugs aproximadamente a la mitad (38,0% frente a 82,9% en el subconjunto comparable) y baja Terminal-Bench 1.0 de 33,8% a 18,8%. No es un intercambio neutro.
- Sin mejora medida en Terminal-Bench 1.0: el modelo iguala al base (33,8%) en ese benchmark, por lo que la ganancia se concentra en tareas de reparacion verificadas por tests, no en todas las tareas de terminal.
- Riesgo de alucinacion: no se documentan tasas de alucinacion en la informacion disponible. Como en cualquier modelo de 4B, es esperable que genere APIs, funciones o rutas de archivo inexistentes; el propio diseno del modelo mitiga esto al ejecutar los tests, por lo que se recomienda no dar por valida ninguna salida sin verificacion automatica.
- Idiomas: no se declara soporte multilingue. No hay informacion sobre el comportamiento en castellano ni en idiomas distintos del ingles.
- Sesgos: no se documentan evaluaciones de sesgo en la informacion disponible.
- Estado del arte cambiante: el modelo se publico con resultados de Generalization test y Terminal-Bench 2.1 pendientes ("coming soon"), y el informe tecnico completo esta anunciado pero no disponible.
- Uso comercial: la licencia Apache-2.0, heredada del modelo base, permite uso comercial sin restricciones adicionales conocidas, pero conviene verificar las condiciones de los datasets de terceros empleados en el entrenamiento si se requiere trazabilidad completa.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jsbaicenter/Aztec-Coder-4B
- Version preliminar relacionada: https://huggingface.co/jsbaicenter/JSBAI-Coder-4B
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Dataset de post-entrenamiento: https://huggingface.co/datasets/nvidia/Nemotron-Post-Training-Dataset-v2
- Repositorio de la organizacion en GitHub: https://github.com/JSBAICenter
- Listado de repositorios: https://github.com/orgs/JSBAICenter/repositories
- Herramienta de cuantizacion NVFP4 (NVIDIA ModelOpt): https://github.com/NVIDIA/Model-Optimizer
- Publicacion de presentacion del modelo: https://www.linkedin.com/posts/aaroncelkins_jsbaicenterjsbai-coder-4b-hugging-face-activity-7508987840081551360-owvj
- Informe tecnico: anunciado como proximo, no disponible
- Referencia externa sobre modelos de codigo: https://deepseekcoder.github.io/
