# Nsmith15/consapia-router-mini-GGUF

## Resumen

Consapia router (mini) es un modelo de lenguaje de 361,8 millones de parametros, afinado a partir de HuggingFaceTB/SmolLM2-360M-Instruct y publicado por el usuario Nsmith15 en formato GGUF para llama.cpp y wllama. Su funcion es muy concreta: recibe una pregunta del usuario y la transforma en un plan JSON compuesto por entre 2 y 6 sub-tareas tipadas, es decir, actua como enrutador/planificador ligero dentro de una arquitectura mayor denominada Consapia.

El modelo es relevante por su planteamiento de especializacion extrema en un tamano minimo: en lugar de competir en capacidades generales, se limita a una tarea estructurada de descomposicion de consultas en pasos. Esto permite ejecutarlo en entornos con recursos muy limitados, incluidos navegadores mediante wllama, y encadenarlo a otros modelos mas grandes que resuelvan cada sub-tarea.

La informacion publicada es escasa: la model card se limita a describir el proposito, el modelo base y el formato de distribucion (Q4_K_M calibrado con importance matrix, dividido en partes de 512 MB). No se detallan idiomas, datos de entrenamiento ni resultados de evaluacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de SmolLM2-360M-Instruct) |
| Parametros totales | 361.821.120 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (calibrada con importance matrix); otras no disponibles |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (partido en fragmentos de 512 MB) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de SmolLM2-360M-Instruct, un transformer decoder-only de 361,8 millones de parametros desarrollado originalmente por Hugging Face. Sobre esa base se ha realizado un ajuste fino orientado a una unica tarea: la conversion de una pregunta en un plan JSON de 2 a 6 sub-tareas tipadas. No se ha publicado informacion sobre el volumen de datos de ajuste, la composicion del dataset, ni si se emplearon tecnicas de RLHF o DPO.

La innovacion tecnica destacable no esta en la arquitectura sino en el empaquetado: la cuantizacion Q4_K_M se ha calibrado con una importance matrix (imatrix), lo que suele mejorar la calidad de la cuantizacion en modelos pequenos, y el archivo GGUF se ha dividido en fragmentos de 512 MB para permitir su carga en wllama (entorno de inferencia en navegador). El consumo debe realizarse cargando todas las partes listadas en el manifiesto `consapia-gguf.json`.

## Capacidades

- Generacion de planes estructurados en JSON a partir de una pregunta, con 2 a 6 sub-tareas tipadas.
- Enrutamiento y descomposicion de consultas para pipelines multi-modelo o multi-agente.
- Salida en formato conversacional, segun la etiqueta `conversational` del repositorio.
- Compatibilidad con endpoints (`endpoints_compatible`), lo que facilita su integracion como servicio.
- Ejecucion en llama.cpp y wllama, incluido el entorno del navegador.
- No se ha documentado soporte de tool calling, vision, audio, modo de razonamiento explicito ni capacidades multilingues especificas.

## Casos de uso

- Enrutamiento de consultas en asistentes multi-modelo: el modelo recibe la pregunta del usuario y genera un plan JSON con sub-tareas que un orquestador deriva a modelos especializados, aprovechando su bajo coste computacional.
- Descomposicion de tareas en agentes: dentro de un pipeline agentico, actua como primer eslabon que estructura la peticion en pasos tipados antes de la ejecucion por parte de herramientas o LLM mayores.
- Clasificacion y etiquetado de intenciones: el esquema de sub-tareas tipadas permite usar la salida como taxonomia de intenciones para telemetria, analitica o enrutado de tickets.
- Inferencia en navegador con wllama: al estar dividido en fragmentos de 512 MB y cuantizado en Q4_K_M, puede cargarse en aplicaciones web sin backend, lo que habilita planificacion local y privada en el cliente.
- Prototipado rapido de pipelines: su tamano reducido permite iterar sobre el diseno de planes y esquemas JSON en local con llama.cpp sin infraestructura GPU.
- Preprocesado de bajo coste en produccion: como paso previo a modelos grandes, reduce el numero de llamadas costosas al estructurar la consulta antes de invocar al modelo principal.
- Sistemas con restricciones de hardware: despliegue en dispositivos de borde o contenedores sin GPU, donde un modelo de 0,36 mil millones de parametros cuantizado a 4 bits ocupa unos cientos de MB.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en Q4_K_M, aproximadamente 0,2-0,3 GB de pesos, mas overhead de contexto y runtime; cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: no requiere GPU dedicada; funciona en CPU. Cualquier GPU con 2 GB o mas de VRAM (GTX 1050, RTX 3050, RTX 4090, A100, H100) es sobrada.
- Cabe en GPU consumer: si, en practicamente todas, incluidas integradas con memoria compartida suficiente.
- Opciones de despliegue: llama.cpp, wllama (navegador), y cualquier runtime compatible con GGUF; Ollama o vLLM no estan confirmados en la informacion disponible.
- Latencia y throughput estimados: no disponibles; por tamano, la generacion en CPU deberia ser interactiva para salidas cortas de JSON, aunque no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Consapia router mini (este) | 361,8 M | no disponible | Apache 2.0 | GGUF Q4_K_M | Especializado en planes JSON de sub-tareas |
| HuggingFaceTB/SmolLM2-360M-Instruct | 361,8 M | no disponible | Apache 2.0 | safetensors, GGUF | Modelo base generalista de instrucciones |
| SmolLM2-135M-Instruct | 135 M | no disponible | Apache 2.0 | safetensors, GGUF | Alternativa aun mas ligera del mismo linaje |
| Qwen2.5-0.5B-Instruct | 0,5 B | no disponible | Apache 2.0 | safetensors, GGUF | Modelo generalista pequeno con soporte multilingue |

La comparativa se limita a datos estructurales; no se dispone de resultados de rendimiento del modelo evaluado frente a estas alternativas.

## Limitaciones y advertencias

- Modelo altamente especializado: fuera de la generacion de planes JSON de sub-tareas, su calidad como asistente general sera inferior a la de su modelo base.
- Riesgo de alucinacion en la estructura de salida: puede generar sub-tareas no tipadas, JSON malformado o planes incoherentes; se recomienda validacion de esquema en produccion.
- Idiomas soportados no documentados; el comportamiento multilingue es incierto y probablemente limitado por el modelo base.
- Longitud de contexto no documentada; planes con muchas sub-tareas o preguntas largas pueden degradar la salida.
- Sesgos: no se ha publicado informacion sobre evaluaciones de sesgo; al derivar de SmolLM2, hereda los sesgos de sus datos de preentrenamiento.
- Licencia Apache 2.0 permite uso comercial, pero la model card remite a los archivos LICENSE y NOTICE del modelo base para sus terminos.
- Repositorio sin descargas ni likes y creado recientemente: no hay evidencia de comunidad, mantenimiento ni validacion externa.
- El uso requiere cargar todas las partes del GGUF listadas en `consapia-gguf.json`; una carga parcial producira errores.

## Enlaces

- Hugging Face: https://huggingface.co/Nsmith15/consapia-router-mini-GGUF
- Modelo base: https://huggingface.co/HuggingFaceTB/SmolLM2-360M-Instruct
