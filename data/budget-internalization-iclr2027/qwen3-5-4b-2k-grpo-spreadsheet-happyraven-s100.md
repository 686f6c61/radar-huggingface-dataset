# budget-internalization-iclr2027/qwen3.5-4b-2k-grpo-spreadsheet-happyraven-s100

## Resumen

El modelo `qwen3.5-4b-2k-grpo-spreadsheet-happyraven-s100` es un ajuste fino por aprendizaje por refuerzo del modelo base Qwen/Qwen3.5-4B, desarrollado por el usuario `budget-internalization-iclr2027` y publicado como parte de una submission anónima a ICLR 2027. El objetivo declarado del entrenamiento es la internalización de un presupuesto de generación: el modelo se optimiza para resolver tareas de manipulación de hojas de cálculo consumiendo como máximo 2.048 tokens de generación, en lugar de razonar de forma ilimitada. El algoritmo empleado es GRPO (Group Relative Policy Optimization) con baseline leave-one-out, normalización de recompensa por grupo y pérdida a nivel de token.

El dominio de entrenamiento son las tareas de spreadsheet-manipulation de ExcelForum, evaluadas mediante un checker automático que verifica la hoja de cálculo producida. El checkpoint publicado corresponde al paso 100 de un run identificado con el sobrenombre `happyraven`. Los pesos se distribuyen en BF16 y safetensors, con licencia Apache 2.0 heredada del modelo base.

Se trata de un artefacto de investigación más que de un modelo listo para producción: no tiene descargas ni valoraciones, no se documentan benchmarks y la model card es deliberadamente mínima. Su interés radica en el método (GRPO aplicado al control del presupuesto de cómputo en tareas estructuradas) y en servir como punto de comparación dentro del estudio sobre internalización de presupuesto de tokens.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (hereda la del modelo base Qwen/Qwen3.5-4B; tags `qwen3_5`, `transformers`) |
| Parametros totales | 4.659.865.088 (~4,66 B), segun safetensors |
| Parametros activos | No aplica / no disponible (no se indica que sea MoE) |
| Longitud de contexto | No disponible. Se documenta un presupuesto de generacion de 2.048 tokens (`max_new_tokens`) |
| Tipos de cuantizacion | No se publican cuantizaciones oficiales. Pesos en BF16 (aproximadamente 9,3 GB en repositorio) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 (heredada del modelo base) |
| Formato de pesos | safetensors (BF16), libreria `transformers` |
| Pipeline declarado | image-text-to-text |
| Modelo base | Qwen/Qwen3.5-4B (relacion: finetune) |
| Fecha de publicacion | 2026-09-25 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

No se detalla la arquitectura interna del modelo en la informacion proporcionada; se sabe que es un fine-tune del modelo Qwen/Qwen3.5-4B, cuya etiqueta de pipeline (`image-text-to-text`) sugiere capacidad multimodal de entrada, aunque la model card solo muestra ejemplos de uso con `AutoModelForCausalLM` y `AutoTokenizer`. El entrenamiento se realizo con GRPO, con baseline de tipo leave-one-out, normalizacion de recompensa a nivel de grupo y funcion de perdida calculada a nivel de token. La recompensa proviene de un checker de tarea que evalua la hoja de calculo producida.

Los hiperparametros documentados son: presupuesto de generacion de 2.048 tokens por rollout, batch de 32 prompts con 8 rollouts por prompt en cada paso, optimizador Adam con schedule de learning rate coseno y pico de 5e-7, 10 pasos de warmup y 100 pasos totales. Los datos son tareas de manipulacion de hojas de calculo de ExcelForum, con un maximo de 10 epocas, y los prompts se renderizan con la plantilla de chat del modelo base. La innovacion central no esta en la arquitectura sino en el procedimiento: se refuerza al modelo para operar bajo un presupuesto fijo de tokens de generacion, lo que en la practica induce respuestas mas compactas y presumiblemente reduce el coste de inferencia en tareas estructuradas.

## Capacidades

- Razonamiento orientado a tareas estructuradas: manipulacion de hojas de calculo (formulas, celdas, transformaciones de datos) dentro del dominio ExcelForum.
- Generacion de texto conversacional, segun el tag `conversational` del repositorio.
- Capacidad multimodal de entrada declarada a traves del pipeline `image-text-to-text`, aunque la model card no documenta ejemplos de uso con imagenes.
- Razonamiento con control de presupuesto: el modelo esta optimizado para completar la tarea dentro de un limite de 2.048 tokens generados.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada (aunque el dominio de spreadsheet implica cadenas de operaciones).
- Capacidades multilingues: no disponible.
- Modo de pensamiento explicito (thinking mode) u otras capacidades especiales: no disponible.

## Casos de uso

- Automatizacion de tareas contables en hojas de calculo: el modelo puede recibir una hoja y una instruccion en lenguaje natural y devolver la hoja modificada, apoyandose en el entrenamiento especifico sobre tareas de ExcelForum y en la verificacion por checker.
- Asistente embebido en herramientas ofimaticas: integrado en un complemento de hoja de calculo, opera con un presupuesto de 2.048 tokens, lo que acota la latencia y el coste por consulta en entornos interactivos.
- Agente de limpieza y normalizacion de datos tabulares: aplicar reglas de formato, eliminar duplicados o reescribir formulas sobre ficheros tabulares, con una salida verificable de forma automatica.
- Generacion de formulas a partir de descripcion: dado un objetivo ("calcula el total por trimestre excluyendo celdas vacias"), producir la formula o el conjunto de formulas adecuadas en la hoja.
- Evaluacion de investigacion sobre presupuesto de tokens: servir como checkpoint de referencia para medir como afecta el limite de generacion a la precision en tareas de spreadsheet dentro de un estudio de internalizacion de presupuesto.
- Fine-tuning adicional sobre dominios propios: al ser un modelo de 4,66 B con licencia Apache 2.0 y pesos safetensors, se puede reentrenar o adaptar con LoRA en hardware de gama alta de consumo.
- Generacion de informes tabulares resumidos: producir tablas de resultados agregados a partir de datos de entrada, con la ventaja de que el modelo tiende a salidas cortas y directas.
- Canal de soporte o Q&A sobre estructura de hojas de calculo: responder consultas sobre la organizacion de un libro, dependencias entre celdas o deteccion de errores de referencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada en BF16: aproximadamente 9,3 GB solo para los pesos (el repositorio ocupa 9,3 GB), mas overhead de activaciones y cache KV; en la practica conviene reservar entre 11 y 14 GB para inferencia comoda.
- VRAM estimada en cuantizacion de 8 bits: en torno a 5,5-6 GB de pesos.
- VRAM estimada en cuantizacion de 4 bits: en torno a 3,5-4 GB de pesos, aunque no se publican cuantizaciones oficiales y habria que generarlas.
- GPU recomendadas: A100 40/80 GB, H100, L40S o A6000 para despliegue en BF16 sin compresion. En consumer, RTX 3090, RTX 4090, RTX 5090 (24-32 GB) ejecutan el modelo en BF16 con margen; RTX 4080/4070 Ti Super (16 GB) pueden funcionar en BF16 con secuencias cortas, y tarjetas de 8-12 GB requieren cuantizacion.
- Cabe en GPU de consumo: si, en BF16 en tarjetas de 16 GB o mas; en 4 bits en tarjetas de 8 GB.
- Opciones de despliegue: vLLM (comando documentado por el autor), `transformers` con `AutoModelForCausalLM.from_pretrained(..., device_map="auto")`. Para TGI, llama.cpp u Ollama seria necesario convertir los pesos, ya que no se publican ficheros GGUF.
- Latencia y throughput estimados: no disponibles. El limite de 2.048 tokens de generacion acota el peor caso de latencia por peticion, pero no se aportan mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen3.5-4b-2k-grpo-spreadsheet-happyraven-s100 | 4,66 B | No disponible (presupuesto de generacion de 2.048 tokens) | Hojas de calculo + control de presupuesto de tokens | Apache 2.0 | HuggingFace, 0 descargas |
| Qwen/Qwen3.5-4B (base) | No disponible en la informacion proporcionada | No disponible | Proposito general, multimodal de entrada segun pipeline | Apache 2.0 (heredada) | HuggingFace |
| Otras alternativas de ~4 B para tareas tabulares o de agente | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos de rendimiento de este checkpoint ni de alternativas comparables en la informacion proporcionada, por lo que la comparacion se limita a parametros, licencia y disponibilidad.

## Limitaciones y advertencias

- Artefacto de investigacion: la model card indica que se publica como parte de una submission anonima a ICLR 2027, sin validacion externa ni resultados reproducibles publicados.
- Ausencia total de benchmarks: no hay MMLU, HumanEval, GSM8K ni metricas del dominio ExcelForum, por lo que no es posible estimar su calidad frente al modelo base.
- Riesgo de alucinacion elevado en tareas fuera de dominio: al ser un fine-tune de RL sobre un unico tipo de tarea, es probable que degrade capacidades generales del modelo base, aunque no se documenta ninguna medicion al respecto.
- Restriccion autoimpuesta de 2.048 tokens de generacion: en tareas que requieran cadenas de razonamiento largas puede truncar la respuesta o producir resultados incompletos.
- Idiomas soportados no declarados: no se puede asumir un rendimiento multilingue equivalente al del modelo base.
- Sesgos conocidos: no disponibles; no se documenta ninguna evaluacion de sesgo, toxicidad o seguridad.
- Licencia Apache 2.0 permite uso comercial, pero el autor remite a la licencia del modelo base, por lo que conviene verificar las condiciones de Qwen/Qwen3.5-4B antes de un despliegue productivo.
- Formato de despliegue limitado: solo safetensors en BF16; sin GGUF ni cuantizaciones oficiales, lo que complica el uso en entornos de CPU o GPU de gama baja.
- Sin mantenimiento aparente: 0 descargas, 0 likes y un unico commit cercano a la fecha de creacion, lo que sugiere que no habra actualizaciones.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/budget-internalization-iclr2027/qwen3.5-4b-2k-grpo-spreadsheet-happyraven-s100
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Paper, repositorio o demo del metodo: no disponible en la informacion proporcionada. La busqueda web realizada no devolvio resultados relevantes (unicamente paginas sobre alquiler de vehiculos y el presupuesto del Estado frances, sin relacion con el modelo).
