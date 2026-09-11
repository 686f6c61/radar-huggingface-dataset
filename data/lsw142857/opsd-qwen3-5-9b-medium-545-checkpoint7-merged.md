# LSW142857/OPSD-Qwen3.5-9B-Medium-545-Checkpoint7-Merged

## Resumen

OPSD-Qwen3.5-9B-Medium-545-Checkpoint7-Merged es un checkpoint fusionado publicado por el usuario LSW142857 sobre una base Qwen3.5 de 9B. No es un modelo entrenado desde cero: es el resultado de aplicar OPSD (el acrónimo no se desarrolla en la model card) sobre el checkpoint de SFT experto `qwen35-9b-expert-sft-131k-lora64-block28-2996448/checkpoint-best`, alojado en `jiaxingx/privilege-code-opsd-ckpts`. El artefacto incluye los cuatro shards de pesos, tokenizer y chat template, la configuración del processor, las actualizaciones LoRA ya fusionadas y el módulo MTP completo, por lo que no requiere un adaptador aparte.

El modelo tiene 9.653.104.368 parámetros totales y ocupa 19,3 GB en el repositorio. Está orientado a código y a flujos agénticos multi-turno: se entrenó sobre 545 tareas derivadas de errores de estudiante y se valida en un subconjunto de 100 tareas de SWE-Gym con hasta 250 turnos, contexto de evaluación de 262.144 tokens y modo thinking activado. Se trata de un artefacto de investigación con 8 actualizaciones de optimizador completadas, no de un modelo pulido para producción.

Su relevancia es doble: por un lado documenta una técnica concreta de autodestilación con información privilegiada (PI) en la vista final del profesor, y por otro sirve como caso reproducible de fusión de LoRA sobre un modelo multimodal grande con módulo MTP para decodificación especulativa. La licencia no está declarada y el entrenamiento está en curso, sin tasa de acierto final publicada.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (etiquetada como `qwen3_5`; transformer con modulo MTP; se desconoce si es MoE) |
| Parametros totales | 9.653.104.368 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible como valor nativo; entrenamiento a 131.072 tokens y evaluacion con override explicito a 262.144 tokens |
| Tipos de cuantizacion | no disponible (el repositorio solo publica safetensors sin cuantizar) |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | safetensors (4 shards, transformers); sin GGUF ni AWQ/GPTQ publicados |

Datos adicionales: repo de 19,3 GB, pipeline `text-generation`, etiquetas `image-text-to-text` y `conversational`, `endpoints_compatible`, creado y actualizado el 10 de septiembre de 2026. Modelo base declarado: `jiaxingx/privilege-code-opsd-ckpts` (revision `3fbab6c3ed8ad472c7b99bdf5e571ff90de0c0fc`). Revisiones y hashes en `SHA256SUMS.json` y `merge_manifest.json`.

## Arquitectura y entrenamiento

La model card no detalla la arquitectura interna mas alla de la etiqueta `qwen3_5`, pero sí confirma la presencia de un modulo MTP (multi-token prediction) completamente entrenado y verificado en la fusión, que se usa para especulación durante la inferencia (desactivada en la evaluación actual). El modelo parte del SFT experto con LoRA de rango 64 y bloque 28, sobre el que se aplican actualizaciones OPSD y una fusión posterior de los adaptadores LoRA en los pesos base.

El entrenamiento OPSD se realizó sobre 545 tareas de error de estudiante, con una estrategia de PI adaptativa por etapas ("Medium") que se inyecta en la vista final del usuario del profesor congelado. El estudiante nunca ve la información privilegiada. Hiperparámetros declarados: LoRA rank 64, alpha 128, batch size 32, learning rate 2e-6, temperatura 0.6, top-K del profesor 64, contexto 131.072, tope de salida por petición de 4.096 tokens y máximo de 150 turnos. El índice de checkpoint 7 equivale a 8 actualizaciones de optimizador completadas; el estado del optimizador y el cursor del dataset no forman parte del artefacto de inferencia.

## Capacidades

- Generacion de texto conversacional en ingles, con pipeline declarada `text-generation`.
- Generacion y manipulacion de codigo, dado el origen del entrenamiento (tareas de error de estudiante sobre SWE-Gym) y la etiqueta `code`.
- Razonamiento agéntico multi-turno: la evaluacion se ejecuta con hasta 250 turnos por tarea, lo que implica gestion de estado y contexto acumulado.
- Modo thinking activado durante la evaluacion (el autor no documenta como desactivarlo ni como se comporta sin el).
- Decodificacion especulativa mediante modulo MTP incluido en los pesos (deshabilitada en la evaluacion reportada).
- Posible entrada de imagen: la etiqueta `image-text-to-text` aparece en el repositorio, aunque la model card no describe ninguna capacidad de vision ni se publican ejemplos. Debe tratarse como no confirmada.
- Soporte de tool calling / function calling: no documentado en la informacion disponible.
- Capacidades multilingues: solo ingles declarado.

## Casos de uso

- Reparacion automatica de fallos en repositorios: el modelo se entrena especificamente sobre tareas derivadas de errores de estudiante, por lo que encaja en un agente que recibe un test en rojo, inspecciona el arbol de codigo y aplica parches iterativos durante decenas de turnos.
- Evaluacion de pipelines de destilacion: sirve como estudiante de referencia para comparar variantes de OPSD (la card menciona el experimento "Taurus Medium" frente al "Weak" en Aries) midiendo si la inyeccion de PI en la vista del profesor mejora la tasa de resolucion.
- Agente de CI/CD para correccion de builds: con contexto de 131.072 tokens de entrenamiento puede ingerir logs extensos, diffs y ficheros de configuracion en una sola ventana y proponer el parche antes de abrir la pull request.
- Revision de codigo asistida: dado un diff largo y el historial de la rama, el modelo puede razonar sobre regresiones y efectos laterales, aprovechando la ventana extendida para no fragmentar el contexto en trozos.
- Investigacion sobre decodificacion especulativa: el modulo MTP incluido permite medir la ganancia de throughput de la especulacion multi-token frente a la decodificacion autoregresiva estandar en el mismo checkpoint.
- Asistente de depuracion interactiva en IDE: conversacion multi-turno donde el desarrollador pega trazas, el modelo propone hipotesis y pide ejecuciones adicionales, manteniendo el hilo durante muchos intercambios.
- Servicio interno experimental en endpoints compatibles: la etiqueta `endpoints_compatible` permite desplegarlo en infraestructura tipo Hugging Face Endpoints o SGLang para pruebas acotadas de agentes de codigo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card describe una evaluacion en curso sobre un subconjunto de 100 tareas de SWE-Gym (no SWE-bench Verified) con ocho replicas TP1 de SGLang, temperatura 0,6, top-p 0,95, top-k 20, min-p 0, semilla 42, tope de salida de 4.096 tokens y hasta 250 turnos. El autor indica expresamente que no reclama ninguna tasa de acierto final y que los fallos de infraestructura deben auditarse aparte y no interpretarse como respuestas incorrectas del modelo.

## Requisitos de hardware

- Pesos en bf16/fp16: aproximadamente 19,3 GB (coincide con el tamano del repositorio). En una GPU de 24 GB solo caben con ventanas de contexto cortas, ya que la cache KV del contexto largo es adicional.
- Pesos en int8: en torno a 10-11 GB, dejando margen para cache KV en GPUs de 24 GB.
- Pesos en int4 (si se genera una cuantizacion propia): en torno a 5-6 GB, con lo que cabria comodamente en GPUs de consumo.
- Cabe en GPU de consumo: si, en RTX 3090, RTX 4090, RTX 5090 y similares de 24 GB o mas en cuantizacion de 8 o 4 bits. En bf16 es ajustado en 24 GB y requiere reducir la longitud de contexto.
- GPUs recomendadas para evaluacion a contexto completo: A100 40/80 GB, H100 80 GB y nodos multi-GPU con tensor parallelism. El autor usa ocho replicas TP1, es decir, una GPU por replica, con el override de contexto largo de SGLang.
- Opciones de despliegue: transformers (libreria declarada), SGLang (usado por el autor), vLLM y TGI como alternativas habituales para safetensors. No hay ficheros GGUF publicados, por lo que llama.cpp u Ollama exigirian convertir los pesos previamente.
- Latencia y throughput: no disponible. El unico dato operativo es que la especulacion con MTP esta deshabilitada en la evaluacion reportada y que el cliente reserva 16 tokens de contexto.

## Comparativa con modelos similares

La informacion proporcionada no incluye especificaciones ni resultados de modelos comparables, por lo que no es posible rellenar una comparativa con datos verificados. Como referencia de categoria, este checkpoint compite con la propia familia Qwen3.5 de ~9B y con modelos de codigo de 7-9B de otras familias, pero no se dispone de parametros, contexto, rendimiento ni licencia de esas alternativas en la documentacion facilitada.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| OPSD-Qwen3.5-9B-Medium-545-Checkpoint7-Merged | 9.653.104.368 | no disponible como valor nativo (evaluado a 262.144) | no disponible | no disponible | Publico en Hugging Face, 0 descargas |
| Alternativas de la misma categoria (~9B) | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Licencia sin declarar: no hay permiso explicito de uso comercial ni condiciones de redistribucion. No debe desplegarse en produccion hasta aclarar este punto con el autor.
- Entrenamiento incompleto: solo 8 actualizaciones de optimizador completadas y evaluacion en curso. No existe ninguna tasa de acierto validada.
- Idioma: unicamente ingles declarado. El rendimiento en castellano no esta documentado y previsiblemente sera inferior.
- Contexto: entrenado a 131.072 tokens y evaluado con un override de runtime a 262.144. La model card advierte explicitamente que esto no implica que la longitud de contexto nativa de la configuracion haya cambiado; usarlo a 262.144 puede degradar la calidad.
- Capacidad de vision incierta: la etiqueta `image-text-to-text` sugiere soporte multimodal, pero la model card no lo documenta ni aporta ejemplos. No debe asumirse.
- Riesgo de alucinacion: sin datos de evaluacion no hay estimacion de fiabilidad. En tareas de parcheo de codigo, una alucinacion se traduce directamente en codigo que no compila o que rompe tests.
- Trazabilidad limitada: los logs de entrenamiento, transcripciones de tareas, datasets, credenciales y checkpoints del optimizador se excluyen deliberadamente del repositorio, por lo que la reproducibilidad completa no es posible.
- Sin canal de soporte: el repositorio acumula 0 descargas y 0 likes en el momento de la consulta, lo que reduce la probabilidad de encontrar incidencias resueltas por terceros.
- Herramientas de terceros: al no publicarse GGUF, AWQ ni GPTQ, cualquier cuantizacion para despliegue ligero debe validarse de forma independiente antes de confiar en ella.
- Evaluacion no equivalente a SWE-bench Verified: el conjunto de validacion es un subconjunto de 100 tareas de SWE-Gym, por lo que los resultados no son comparables con los numeros publicos de SWE-bench.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/LSW142857/OPSD-Qwen3.5-9B-Medium-545-Checkpoint7-Merged
- Repositorio del modelo base y checkpoints OPSD: https://huggingface.co/jiaxingx/privilege-code-opsd-ckpts
- Ficheros de verificacion citados por el autor: `SHA256SUMS.json` y `merge_manifest.json` en el repositorio del modelo.
- Paper, blog o demo oficial: no disponible en la informacion proporcionada.
- Resultados de busqueda web: no se ha encontrado ninguna fuente relevante sobre este modelo; las coincidencias devueltas corresponden a definiciones del verbo ingles "vie" y no guardan relacion con el artefacto.
