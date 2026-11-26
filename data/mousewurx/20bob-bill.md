# MouseWurX/20Bob-Bill

## Resumen

20Bob Bill es un modelo de lenguaje derivado de Qwen/Qwen3.6-35B-A3B, publicado por MouseWurX dentro del proyecto Bob, un agente de IA de codigo abierto que se ejecuta en local. El modelo parte de la arquitectura MoE del Qwen3.6-35B-A3B original y se ha sometido a un proceso de poda de expertos (de los 128 o mas del modelo base se conservan 144 por capa segun la model card, con unos 21 000 millones de parametros totales y unos 3000 millones activos por token) y a un reentrenamiento orientado al uso de herramientas (tool-use) dentro de un agente.

La relevancia de esta ficha no esta en su rendimiento, sino en su estado: el propio autor lo marca como **"unintentionally poisoned, kept for study only"**. Fue entrenado con las versiones v1 a v3 de los "lesson sets" de Bob, que posteriormente se descubrieron contaminados: de 5788 lecciones de herramientas, solo el 3 % (189) se consideraron validas tras una revision; el 40 % contenian resultados de herramientas inventados, el 28 % incluian detalles privados filtrados desde el prompt y el 23 % tenian un paso de herramienta incorrecto. Ademas, ensenaban habitos que el proyecto ha retirado, como delegar en `ask_specialist` o escribir ficheros mediante `run_command`.

Se distribuye principalmente en formato GGUF (Q3_K_M y Q4_K_M) para ejecucion local en tarjetas graficas de consumo, aunque el repositorio tambien contiene pesos en safetensors. La licencia es Apache 2.0, heredada del modelo base de Alibaba. Su interes practico es limitado: sirve como caso de estudio de un pipeline de poda y destilacion de un MoE, y como advertencia sobre la contaminacion de datos sinteticos de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE), derivado de Qwen3.6-35B-A3B; 144 expertos conservados por capa |
| Parametros totales | 21 005 145 456 (dato real de safetensors) |
| Parametros activos | Aproximadamente 3 000 millones por token |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | GGUF Q3_K_M y Q4_K_M publicados; safetensors en el repo |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors y GGUF |

## Arquitectura y entrenamiento

El modelo es un MoE derivado del Qwen3.6-35B-A3B. El pipeline de "Bob's Forge" descrito por el autor sigue este orden: linea base, limpieza previa, analisis, entrenamiento, poda por pasos, "healing" por destilacion desde el modelo completo (copiar las probabilidades del profesor), comprobacion de objetivos, aprendizaje on-policy a partir de sus propias respuestas (con recompensa por llamadas a herramientas que funcionan), mezcla y publicacion. La poda se guia por REAP (medicion previa de la carga de trabajo real de cada experto segun trazas de uso), de modo que se eliminan los expertos con menor contribucion por tarea.

No se detallan en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset ni si hubo RLHF o DPO convencionales; el autor menciona entrenamiento con lecciones (lesson sets) y senales de recompensa por tool calls exitosas. La innovacion principal es el propio metodo de poda y destilacion, no la arquitectura, que se mantiene la del modelo base. El fallo critico es la calidad de los datos: las lecciones v1 a v3 estaban contaminadas con resultados fabricados, fugas de informacion del prompt y pasos erroneos, lo que hace que el efecto real de ese entrenamiento sobre el modelo no este verificado ("unproven in our lab, as we have yet to test", segun el autor).

## Capacidades

- Generacion de texto conversacional en formato chat, orientada a un agente local.
- Uso de herramientas (tool calling / function calling): es el eje del entrenamiento, aunque parte de las lecciones que lo ensenaron estaban contaminadas.
- Razonamiento multi-paso y ejecucion de tareas de agente (investigar, escribir y corregir codigo, leer y editar ficheros, manipular documentos).
- Capacidades multilingues: no disponibles de forma explicita en la informacion.
- No se documentan capacidades de vision, audio ni modo "thinking" especifico.
- Integracion con el agente Bob en Windows, macOS, Linux, Raspberry Pi y Android, con soporte de red local Bob-Net para repartir carga entre equipos.

## Casos de uso

- Estudio de pipelines de poda de MoE: util como referencia para analizar como afecta la eliminacion de expertos guiada por REAP y la destilacion posterior a un modelo base de ~35B con ~3B activos.
- Analisis de contaminacion de datos sinteticos: sirve como caso documentado de lecciones generadas por modelos que introducen resultados inventados y fugas de datos privados, util para disenar filtros de calidad.
- Pruebas de agentes locales en hardware de consumo: con el GGUF Q4_K_M (12,6 GB) puede ejecutarse en tarjetas de 14 GB o mas para experimentar con tool calling en un entorno aislado.
- Evaluacion de "healing" por destilacion: permite comparar el comportamiento del modelo podado frente al Qwen3.6-35B-A3B original en tareas controladas.
- Docencia y divulgacion: ejemplo real de por que conviene marcar un modelo como no apto para produccion tras detectar fallos en su dataset.
- Investigacion de robustez: medir la tasa de llamadas a herramientas erroneas o de delegacion indebida (`ask_specialist`, `run_command`) para caracterizar el impacto de datos contaminados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explicitamente que no ha probado en laboratorio cuanto del sesgo de las lecciones contaminadas conserva el modelo.

## Requisitos de hardware

- VRAM estimada: unos 12 GB para el GGUF Q3_K_M (10,0 GB de fichero) y unos 14 GB para el Q4_K_M (12,6 GB de fichero), segun la model card.
- GPU recomendadas: tarjetas de consumo con 12-16 GB o mas (por ejemplo, RTX 4080/4090 o equivalentes); para los pesos safetensors completos (21B parametros) se necesitarian del orden de 42 GB en FP16, lo que exige A100 80 GB, H100 o varias GPU.
- Cabe en GPU de consumo en cuantizacion Q3_K_M y Q4_K_M.
- Opciones de despliegue: llama.cpp u Ollama para los GGUF; vLLM o TGI para los safetensors si se dispone de hardware suficiente. El agente Bob lo carga directamente como "cerebro" propio.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros totales / activos | Contexto | Licencia | Estado |
|---|---|---|---|---|
| 20Bob Bill | 21,0B / ~3B | No disponible | Apache 2.0 | Marcado como envenenado, solo estudio |
| Qwen/Qwen3.6-35B-A3B (base) | 35B / ~3B | No disponible | Apache 2.0 | Modelo base original, sin poda |
| Alternativas MoE de ~20-30B con ~3B activos | No disponible | No disponible | No disponible | No disponible |

La comparacion directa mas relevante es con su modelo base: 20Bob Bill conserva aproximadamente el 60 % de los parametros totales del Qwen3.6-35B-A3B, mantiene el regimen de ~3B activos y anade entrenamiento especifico de tool-use, pero con datos contaminados. No se dispone de datos de rendimiento para comparar con otras alternativas.

## Limitaciones y advertencias

- **Modelo envenenado de forma no intencionada**: el autor lo marca como "kept for study only". No debe usarse en produccion ni en aplicaciones reales.
- Riesgo elevado de alucinacion en llamadas a herramientas: el 40 % de las lecciones de entrenamiento contenian resultados inventados y el 23 % pasos erroneos.
- Riesgo de fuga de informacion: el 28 % de las lecciones incluian detalles privados recogidos del prompt.
- Habitos no deseados aprendidos: delegacion en `ask_specialist` y escritura de ficheros mediante `run_command`, practicas que el proyecto ha retirado.
- No se ha medido cuanto de estos defectos persiste en el modelo final.
- Idiomas y contexto no documentados; no se puede garantizar comportamiento multilingue ni ventanas largas.
- Licencia Apache 2.0: permite uso comercial segun los terminos, pero el estado de contaminacion hace desaconsejable cualquier despliegue.
- Las lecciones originales son CC BY-SA 4.0; el autor cita que se han usado trazas de otros modelos con licencias abiertas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/MouseWurX/20Bob-Bill
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Dataset de lecciones y analisis de contaminacion: https://huggingface.co/datasets/MouseWurX/bob-lessons
- Repositorio del proyecto Bob: https://github.com/MouseWurX/Bob
- Forge journal (metodo y numeros): https://github.com/MouseWurX/Bob/blob/main/app/docs/FORGE-JOURNAL.md
- Guia de Forge: https://github.com/MouseWurX/Bob/blob/main/app/model-lab/forge/README.md
- Documento sobre modelos mas pequenos: https://github.com/MouseWurX/Bob/blob/main/app/docs/MAKING-SMALLER-MODELS.md
- Guia de usuario y laboratorio: https://github.com/MouseWurX/Bob/blob/main/app/docs/USER-GUIDE.md#make-your-own-brain-the-lab
- Codigo del laboratorio: https://github.com/MouseWurX/Bob/tree/main/app/model-lab
- Costes: https://github.com/MouseWurX/Bob/blob/main/app/docs/COSTS.md
- Hoja de ruta: https://github.com/MouseWurX/Bob/pull/230
