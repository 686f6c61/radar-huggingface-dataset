# Mir2k/Inkling-2-Mini-Uncensored-GGUF

## Resumen

Inkling-2-Mini-Uncensored-GGUF es una cuantizacion en formato GGUF del modelo base thinkingmachines/Inkling-2-Mini, un transformer de tipo mezcla de expertos (MoE) desarrollado por Thinking Machines. El modelo original cuenta con 26.000 millones de parametros totales y 3.400 millones activos por token, con 128 expertos y enrutamiento top-k, e incorpora una arquitectura denominada `inkling2_loop` con 24 capas, de las cuales 12 son capas con bucle que se ejecutan en tres pasadas compartiendo pesos. Esta version, publicada por el usuario Mir2k, aplica una ablacion de la capa de alineacion a nivel de pesos (abliteration) para eliminar el comportamiento de rechazo y obtener respuestas directas sin preambulos.

El modelo resuelve el problema de disponer de un MoE de razonamiento en hardware de consumo mediante una cuantizacion Q4_K_M de 17,4 GB, con contexto de hasta 32k tokens y soporte para llama.cpp, llama-server y Ollama. Es relevante porque combina un diseno de capas con bucle (que multiplica la profundidad efectiva sin incrementar el numero de parametros) con una edicion de pesos de rango 1 aplicada por capa, que en las capas con bucle cubre 48 capas efectivas con una sola modificacion.

La ficha se centra en la build GGUF publicada, que incluye una plantilla de chat propia (el repositorio base no la trae) y un unico archivo de pesos. La licencia es Apache-2.0 y los idiomas declarados son ingles, frances, ruso y chino.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `inkling2_loop`, transformer MoE con capas con bucle (24 capas, 12 con bucle a 3 pasadas) |
| Parametros totales | 26B |
| Parametros activos | 3.4B (128 expertos, enrutamiento top-k) |
| Longitud de contexto | hasta 32k |
| Tipos de cuantizacion | Q4_K_M (17.4 GB); otras tallas bajo peticion al autor |
| Idiomas soportados | en, fr, ru, zh |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

La arquitectura `inkling2_loop` es un transformer de mezcla de expertos con 24 capas, de las que 12 son capas con bucle que se reutilizan en tres pasadas, compartiendo pesos entre pasadas. El modelo tiene 26B parametros totales con 3.4B activos por token gracias a 128 expertos y enrutamiento top-k. Incorpora una pasada de razonamiento integrada (reasoning pass). No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO en el modelo base.

La build GGUF aplica una ablacion de rechazo (abliteration) mediante una actualizacion de rango 1 por capa. La direccion asociada a la capa de alineacion se mide por capa sobre conjuntos de prompts emparejados, proyectando fuera la media del conjunto "harmless" para no capturar el eje de tono cortes. La actualizacion se aplica a todos los tensores que escriben en el flujo residual: salida de atencion, expertos enrutados y embedding de tokens. Como las 12 capas con bucle comparten pesos en tres pasadas, una sola edicion cubre 48 capas efectivas. El GGUF es autocontenido: no requiere adaptador ni dataset de prompts en inferencia. La cuantizacion se realizo con llama.cpp y la ablacion sigue el enfoque de proyeccion por capa popularizado por `sipratt-p/refusal-ablation-eval`.

## Capacidades

- Generacion de texto y razonamiento con pasada de pensamiento integrada (bloque de "think", a menudo vacio en esfuerzo bajo).
- Aritmetica con descomposicion de pasos (verificado: 17 × 23 = 391 con pasos mostrados).
- Generacion de codigo Python ejecutable (verificado en la model card).
- Explicaciones factuales concisas siguiendo instrucciones de longitud (verificado con el ciclo del agua en tres frases).
- Seguimiento de instrucciones en frances (verificado).
- Capacidades multilingues en ingles, frances, ruso y chino (ruso y chino mas debiles que ingles y frances).
- Respuestas directas sin preambulo ni necesidad de system prompt, gracias a la ablacion de la capa de alineacion.
- Plantilla de chat propia incluida en el GGUF (`tokenizer.chat_template`), compatible con llama.cpp, LM Studio y Ollama.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Vision y audio: no disponible en la informacion proporcionada.

## Casos de uso

- Asistencia en programacion local: el modelo genera funciones Python ejecutables y puede desplegarse con llama-server en una estacion de trabajo con RTX 4090 (24 GB), donde cabe completo en Q4_K_M, para autocompletado y generacion de scripts sin dependencia de la nube.
- Razonamiento aritmetico con trazabilidad: util para tareas de calculo con descomposicion de pasos (verificado con multiplicaciones), adecuado en entornos educativos o de verificacion donde se necesita ver el procedimiento.
- Atencion al cliente automatizada multilingue: con contexto de hasta 32k tokens puede gestionar conversaciones multi-turno largas en ingles y frances principalmente, con soporte secundario de ruso y chino.
- Procesamiento de documentos extensos: la ventana de 32k permite resumir o extraer informacion de contratos, informes o articulos largos en una sola pasada, sin trocear el contexto.
- Despliegue en hardware de consumo: con 17,4 GB en Q4_K_M y offload parcial de 20 capas en una RTX 3060 de 8 GB (~6,5 tok/s), permite prototipado local de aplicaciones de texto generativo sin GPU de datacenter.
- Generacion de contenido sin filtros editoriales: para casos donde se requiere respuesta directa sin preambulos ni rechazos (ficcion, guiones, redaccion tecnica), con la advertencia de verificacion factual por la ausencia de capa de alineacion.
- Experimentacion en investigacion sobre alineacion: la build sirve como referencia para estudiar el efecto de la ablacion de rechazo en un MoE con capas con bucle, comparando con el modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye unicamente comprobaciones cualitativas de capacidad con decodificacion greedy:

| Tarea | Resultado |
|---|---|
| Aritmetica con descomposicion | correcto (17 × 23 = 391, pasos mostrados) |
| Generacion de funcion Python | correcto, ejecutable |
| Explicacion factual (ciclo del agua) | correcto, tres frases segun lo pedido |
| Seguimiento de instrucciones en frances | correcto |
| Autodescripcion | coherente |

## Requisitos de hardware

- VRAM estimada para inferencia: 17,4 GB en Q4_K_M (tamano del archivo).
- RTX 4090 (24 GB): el modelo cabe completo, rendimiento descrito como "rapido" (sin cifra concreta).
- RTX 3060 (8 GB): con 20 capas descargadas a CPU, ~6,5 tok/s, descrito como usable.
- Solo CPU, 16 hilos: ~2 tok/s, funcional pero lento.
- Cabe en GPU de consumo: si, en tarjetas de 24 GB completas y en 8 GB con offload parcial.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-server`), Ollama y LM Studio (clientes que leen `tokenizer.chat_template`).
- Latencia y throughput: unicos datos disponibles son los ~6,5 tok/s en RTX 3060 con offload y ~2 tok/s en CPU de 16 hilos.

## Comparativa con modelos similares

No se dispone de datos de benchmarks del modelo base ni de esta build que permitan una comparacion cuantitativa con alternativas. Comparacion estructural con modelos MoE de tamano similar:

| Modelo | Parametros totales / activos | Contexto | Licencia | Formato |
|---|---|---|---|---|
| Inkling-2-Mini-Uncensored (esta build) | 26B / 3.4B | 32k | Apache-2.0 | GGUF Q4_K_M |
| Mixtral 8x7B | 46.7B / 12.9B | 32k | Apache-2.0 | safetensors, GGUF |
| Qwen2.5-MoE (variantes) | no disponible | no disponible | no disponible | no disponible |

Los datos de Mixtral 8x7B se incluyen como referencia estructural de la categoria MoE; no se dispone de comparacion de rendimiento medida entre ambos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Entrenado con pasada de razonamiento: el bloque de pensamiento suele quedar vacio en esfuerzo bajo, lo que puede reducir la calidad en tareas que se beneficiarian de razonamiento explicito.
- Ruso y chino son mas debiles que ingles y frances; no usar como modelo principal en esos idiomas en produccion critica.
- Sin capa de alineacion, las respuestas factuales de nicho pueden ser erroneas con alta confianza; verificar todo dato relevante.
- Las salidas reflejan los pesos, no un filtro: no hay salvaguardas de contenido, lo que implica riesgo en despliegues publicos sin moderacion externa.
- Riesgo de alucinacion incrementado por la ausencia de la capa de alineacion, segun advierte el propio autor.
- La model card no documenta sesgos conocidos; no disponible.
- El repositorio base no incluye plantilla de chat; esta build aporta una propia, y builds antiguas de llama.cpp pueden requerir el formato crudo de tokens especiales.
- Licencia Apache-2.0 permite uso comercial, pero la responsabilidad sobre el contenido generado sin filtros recae en el desplegador.
- Sin benchmarks publicados: no hay evidencia cuantitativa de rendimiento frente al modelo base ni frente a alternativas.

## Enlaces

- Hugging Face (esta build): https://huggingface.co/Mir2k/Inkling-2-Mini-Uncensored-GGUF
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Enfoque de ablacion de rechazo por capa: `sipratt-p/refusal-ablation-eval` (referenciado en la model card; no se proporciona URL)
- llama.cpp: no se proporciona URL en la informacion disponible
- Papers, blogs y demos: no disponible
