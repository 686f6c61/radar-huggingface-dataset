# MANGSEOK123/qwen3-4b-tau2-oel-telecom-random74

## Resumen

qwen3-4b-tau2-oel-telecom-random74 es un ajuste fino de Qwen/Qwen3-4B-Instruct-2507 realizado por el usuario MANGSEOK123 mediante una epoca de Online Experiential Learning (OEL) sobre el dominio **telecom** del benchmark tau2-bench. El modelo conserva la arquitectura del base (familia Qwen3, aproximadamente 4.411 millones de parametros) y se distribuye en formato safetensors con licencia Apache-2.0. Su relevancia no esta en una mejora de capacidades, sino en ser un artefacto reproducible de investigacion sobre destilacion de memoria en pesos.

El metodo OEL aplicado aqui no es aprendizaje por refuerzo: no existe senal de recompensa. Se trata de **auto-destilacion** en la que profesor y alumno comparten pesos; la unica diferencia es que al profesor se le anade la memoria de la tarea al prompt de sistema, y el alumno se ajusta a la distribucion del profesor con una perdida KL a nivel de token sobre toda la respuesta. El objetivo es que el comportamiento aprendido sobreviva sin necesidad de inyectar la memoria en el prompt en tiempo de inferencia.

El propio autor advierte en la model card que el ajuste **no mejora al modelo base**: las diferencias quedan dentro de un error estandar (SE ~0,06-0,08 con 40 tareas) y una segunda epoca empeoro ligeramente los resultados. El modelo se publica explicitamente como artefacto reproducible, no como un modelo mejorado, y no ha sido evaluado sobre el split de test reservado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso de la familia Qwen3 (heredada del modelo base) |
| Parametros totales | 4.411.424.256 (4,41 B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | no disponible (se distribuye en safetensors; admite cuantizacion estandar de la familia Qwen3, no verificada en esta ficha) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (tamano del repo: 8,8 GB) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo base Qwen/Qwen3-4B-Instruct-2507, un transformer denso de la familia Qwen3 con 4,41 mil millones de parametros. Este ajuste no introduce cambios estructurales: modifica unicamente los pesos mediante destilacion. El entrenamiento consistio en una epoca de Online Experiential Learning sobre el dominio telecom de tau2-bench, con 72 pares (memoria, tarea sintetizada), batch size de 8 repartido en 4 GPUs, 9 pasos de optimizacion y learning rate de 3e-6.

La innovacion metodologica es el esquema de auto-destilacion: profesor y alumno comparten pesos, y el profesor recibe la memoria de la tarea anexada a su prompt de sistema. La perdida es una KL completa (`full`) calculada sobre todos los tokens de la respuesta, con gradient clipping de 1.0. El simulador de usuario fue gpt-4.1-mini. Un detalle reportado por el autor es que las normas de gradiente se mantuvieron muy por encima del umbral de clipping de 1.0 durante todo el entrenamiento, de modo que fue el clipping, y no el learning rate, el que determino el tamano efectivo del paso. No se empleo RLHF, DPO ni ninguna otra senal de recompensa.

## Capacidades

- Generacion de texto y razonamiento conversacional en ingles, heredados del modelo base Qwen3-4B-Instruct-2507.
- Soporte de tool calling / function calling, con parser `hermes` en vLLM segun la receta de uso publicada por el autor.
- Ejecucion de tareas de agente en el dominio telecom de tau2-bench (resolucion de incidencias de clientes con interaccion multi-turno y uso de herramientas).
- Ajuste especifico para operar en tareas de soporte donde el modelo base necesitaba memoria externa inyectada en el prompt.
- Capacidades multilingues: limitadas al ingles segun la etiqueta de idioma declarada.
- Capacidades adicionales (vision, audio, thinking mode explicito): no disponible en la informacion proporcionada.

## Casos de uso

- Reproduccion de investigacion sobre OEL: el modelo se publica como artefacto reproducible para validar los resultados del metodo de auto-destilacion sobre tau2-bench telecom, comparando su comportamiento con el del modelo base.
- Agente de atencion al cliente en telefonia: gestion de conversaciones multi-turno con uso de herramientas para consultar estado de linea, plan contratado o incidencias, usando el parser `hermes` de vLLM.
- Diagnostico tecnico de incidencias de red: el modelo puede encadenar pasos de razonamiento y llamadas a herramientas para aislar la causa de una averia descrita por el usuario.
- Automatizacion de soporte de primer nivel: clasificacion y resolucion de tickets repetitivos en ingles, con escalado a humano cuando la tarea excede el alcance del dominio.
- Prototipado de pipelines de agentes con tool calling: sirve como modelo pequeno (4,4 B) para validar integraciones de function calling antes de escalar a modelos mayores.
- Estudio de degradacion por destilacion de memoria: util para medir cuanto del beneficio de inyectar memoria en el prompt es recuperable en pesos, dado que el autor reporta que solo se recupera parte de la senal.
- Base para experimentos de cuantizacion en produccion ligera: al ser un Qwen3-4B estandar, permite probar despliegues INT8/INT4 en hardware de gama media, aunque no se han validado cuantizaciones concretas para este ajuste.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explicitamente que el modelo no ha sido evaluado sobre el split de test reservado de tau2-bench. El unico dato de rendimiento reportado es cualitativo: en la serie de ejecuciones de OEL, el ajuste no mejoro al modelo base, con diferencias dentro de un error estandar (SE ~0,06-0,08 con 40 tareas), y una segunda epoca resulto ligeramente peor que la primera.

## Requisitos de hardware

- VRAM estimada en FP16/BF16: alrededor de 8,8 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica conviene reservar 11-13 GB.
- VRAM estimada en INT8: en torno a 4,4-5,5 GB de pesos mas overhead.
- VRAM estimada en INT4: aproximadamente 2,5-3,5 GB de pesos, dependiendo del esquema de cuantizacion.
- GPUs recomendadas: A100, H100 o L40S para despliegue en servidor; para desarrollo local, RTX 4090 (24 GB), RTX 4080/4070 Ti (16 GB) o RTX 4060 Ti (16 GB) en BF16.
- Cabe en GPU de consumo: si. En 16 GB con holgura en BF16 y en 8-12 GB con cuantizacion INT4/INT8.
- Opciones de despliegue: vLLM (documentado por el autor con `--enable-auto-tool-choice --tool-call-parser hermes`); al ser un safetensors Qwen3 estandar, son aplicables tambien llama.cpp, Ollama, TGI o SGLang, aunque no estan documentados para este ajuste concreto.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento en tau2-bench telecom | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen3-4b-tau2-oel-telecom-random74 | 4,41 B | no disponible | No publicado; el autor indica que no mejora al base (diferencias dentro de 1 SE) | apache-2.0 | HuggingFace (0 descargas, 0 likes) |
| Qwen/Qwen3-4B-Instruct-2507 | ~4,4 B | no disponible | Referencia base del ajuste; resultados no publicados en esta ficha | apache-2.0 | HuggingFace (modelo base oficial) |
| Otros ajustes de tau2-bench telecom | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El autor declara explicitamente que el modelo no mejora al base sobre el que se construye; no debe seleccionarse esperando una ganancia de rendimiento.
- No ha sido evaluado sobre el split de test reservado de tau2-bench, por lo que no existen cifras fiables de su rendimiento en tareas no vistas.
- Sesgos conocidos: no disponibles; el modelo hereda los sesgos del modelo base y se ha ajustado sobre un unico dominio (telecom) en ingles.
- Riesgo de alucinacion: presente, como en cualquier modelo de esta familia; el ajuste no incorpora mecanismos de verificacion de hechos.
- Limitacion de idioma: solo se declara soporte de ingles, lo que lo descarta para produccion en castellano sin evaluacion adicional.
- Especializacion estrecha: el entrenamiento se limita al dominio telecom de tau2-bench con 72 pares de memoria y tarea, por lo que la transferencia fuera de ese dominio no esta garantizada.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero el autor publica el modelo como artefacto de investigacion, no como producto listo para produccion.
- Nota de entrenamiento: el gradient clipping fue el factor limitante del tamano de paso efectivo, lo que sugiere que la configuracion de optimizacion pudo no ser la optima.
- Adopcion nula: 0 descargas y 0 likes en el momento de la consulta, sin senales de validacion por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/MANGSEOK123/qwen3-4b-tau2-oel-telecom-random74
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Paper, blog o repositorio adicionales: no disponible en la informacion proporcionada.
