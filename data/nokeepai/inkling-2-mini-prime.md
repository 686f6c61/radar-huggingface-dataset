# nokeepai/Inkling-2-Mini-Prime

## Resumen

Inkling-2-Mini-Prime es un ajuste fino (finetune) del modelo de razonamiento multimodal Inkling-2-Mini de Thinking Machines Lab, desarrollado por nokeepai y publicado el 27 de noviembre de 2026 bajo licencia Apache 2.0. El modelo base recibe texto e imágenes y emplea un modo de "pensamiento" privado antes de responder, controlado mediante el parametro `reasoning_effort`. El problema que aborda Prime es concreto: el modelo original tiende a deliberar en exceso y, en tareas de varios pasos, puede encadenar turnos de razonamiento sin producir acciones utiles.

Prime incorpora un paso adicional de entrenamiento que ensena al modelo a dejar de deliberar y actuar. Segun la model card, el ajuste se entreno unicamente con tareas benignas (depuracion de codigo, matematicas, redaccion y preguntas cotidianas), por lo que modifica la duracion del razonamiento y no la politica de rechazo del modelo. La arquitectura, los ficheros de pesos y la plantilla de chat son identicos a los del modelo base, de modo que cualquier infraestructura que ejecute Inkling-2-Mini puede ejecutar Prime sin cambios.

El modelo cuenta con 26.388.646.440 parametros totales segun los metadatos de safetensors, se distribuye en transformers con pesos en safetensors (tamano de repositorio de 20,2 GB) y esta etiquetado como MoE. Su relevancia actual radica en que reduce de forma medible el coste de inferencia en cargas agénticas de multiples turnos sin sacrificar la precision en tareas de depuracion, un compromiso poco habitual en ajustes finos de modelos de razonamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE), segun etiqueta del autor; detalles de capas no disponibles |
| Parametros totales | 26.388.646.440 |
| Parametros activos | no disponible |
| Longitud de contexto | 32.768 tokens en la configuracion de ejemplo con llama.cpp (`-c 32768`); maximo nativo no disponible |
| Tipos de cuantizacion | GGUF (incluye Q4_K_M, aproximadamente 18 GB); pesos principales en 8 bits via modelopt; otros formatos no disponibles |
| Idiomas soportados | Ingles (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo principal), GGUF (repo separado `Inkling-2-Mini-Prime-GGUF`), proyector multimodal `mmproj` en Q8_0 |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del base Inkling-2-Mini, que el autor etiqueta como MoE y que procesa entradas de imagen y texto (pipeline `image-text-to-text`). La model card no detalla el numero de expertos, la dimension oculta ni la composicion del dataset de preentrenamiento original, por lo que esos datos no estan disponibles. El repositorio incluye un proyector multimodal separado (`mmproj-Inkling-2-Mini-Q8_0.gguf`) para el pipeline de vision en llama.cpp, lo que confirma un diseno de torre visual acoplada a un decodificador de lenguaje.

La innovacion de Prime es un unico paso adicional de ajuste fino supervisado sobre tareas benignas, orientado a reducir la deliberacion improductiva. No se documenta el uso de RLHF o DPO en este paso, ni el volumen de datos empleado. El modelo conserva el mecanismo `reasoning_effort`, un parametro que escala el numero de tokens de pensamiento antes de la respuesta visible: 0 desactiva el razonamiento y los valores medidos por el autor van de 0,3 a 0,9. La configuracion recomendada limita el pensamiento a 4096 tokens y la respuesta a 8192, con temperatura 0,6 y top_p 1,0.

## Capacidades

- Generacion de texto y razonamiento multi-paso con modo de pensamiento privado configurable mediante `reasoning_effort`.
- Comprension de imagenes combinada con texto (image-text-to-text), con soporte de proyector multimodal en llama.cpp.
- Depuracion de codigo iterativa: el modelo recibe salida de tests fallidos, propone correcciones y repite el ciclo hasta 12 turnos.
- Matematicas y resolucion de problemas estructurados, segun las tareas empleadas en el ajuste.
- Redaccion y respuesta a preguntas cotidianas con menor latencia que el modelo base.
- Seguimiento de instrucciones en system prompts largos, con mejora medida del 70,0 % al 92,5 % de reglas cumplidas.
- Capacidad multilingue limitada al ingles.
- No dispone de soporte declarado de tool calling, function calling ni audio en la informacion disponible; el autor solo menciona compatibilidad con servidores OpenAI-compatible, lo que no implica soporte nativo de herramientas.

## Casos de uso

- Depuracion automatizada de codigo en CI/CD: el modelo puede integrarse en un bucle que ejecute tests, lea la salida de fallo y proponga parches sucesivos. Prime resuelve el 100 % de las 15 tareas de depuracion dura del banco del autor con 2766 tokens por tarea, frente a 23.920 del original, lo que abarata cada iteracion.
- Agentes de multiples pasos con presupuesto de tokens ajustado: al eliminar los turnos en los que el modelo solo piensa sin actuar (0 % frente al 86,2 % del base), encaja en pipelines donde cada turno vacio consume cuota de API y tiempo.
- Asistencia tecnica con instrucciones extensas: con 148 de 160 reglas cumplidas en system prompts largos, es adecuado para sistemas con politicas de negocio detalladas que deben respetarse en cada respuesta.
- Analisis de capturas de pantalla y diagramas: el pipeline image-text-to-text permite extraer informacion de imagenes tecnicas y combinarla con razonamiento textual en un mismo turno.
- Generacion de respuestas en produccion con latencia acotada: el autor mide 49,0 s por respuesta cotidiana frente a 119,9 s del original en el mismo servidor, lo que reduce el coste por consulta en servicios interactivos.
- Despliegue en estaciones de trabajo con una sola GPU: con cuantizacion Q4_K_M (18 GB) y un proyector Q8_0, cabe en GPUs de 24-32 GB y permite ejecutar el modelo en local con llama.cpp, LM Studio u Ollama.
- Evaluacion comparativa de tecnicas de control de razonamiento: sirve como referencia para estudiar el efecto de `reasoning_effort` sobre latencia y calidad en entornos de investigacion.

## Benchmarks y rendimiento

Los datos proceden de la model card del autor y comparan Prime con el modelo base original.

| Metrica | Inkling-2-Mini original | Inkling-2-Mini-Prime |
|---|---|---|
| Tareas de depuracion dura resueltas (15 tareas) | 80,0 % [54,8; 93,0] | 100,0 % [79,6; 100,0] |
| Turnos de depuracion sin escribir codigo | 86,2 % | 0,0 % |
| Tokens por tarea de depuracion | 23.920 | 2.766 |
| Pensamiento por prompt cotidiano (mediana de tokens) | 318 | 174 |
| Segundos por respuesta cotidiana (mismo servidor) | 119,9 s | 49,0 s |
| System prompts largos: todas las reglas cumplidas | 112/160 (70,0 %) | 148/160 (92,5 %) |
| Solicitudes sensibles: dispuesto a responder | 64,5 % [61,6; 67,2] | 65,3 % [62,4; 68,0] |
| Solicitudes sensibles: puntuacion de entrega | 35,9 % [34,0; 37,7] | 34,6 % [32,8; 36,4] |

No se han publicado resultados de benchmarks publicos estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. El autor afirma que en benchmarks publicos el modelo puntua al mismo nivel que el original y no reclama ninguna ganancia de precision. La medicion de system prompts largos se realizo sobre el servicio alojado de Thinking Machines con el ajuste aplicado pero no fusionado en los pesos, por lo que es una aproximacion y no una medida directa de este repositorio.

## Requisitos de hardware

- VRAM estimada: aproximadamente 18 GB con cuantizacion Q4_K_M en GGUF; el repositorio completo en safetensors ocupa 20,2 GB, lo que requiere al menos 24 GB de VRAM para cargar en precision nativa o 8 bits.
- GPU recomendadas: el autor verifico el funcionamiento en una RTX 5090 de 32 GB; una RTX 4090 de 24 GB deberia ser suficiente para Q4_K_M con margen limitado; A100 y H100 son adecuadas para despliegues en servidor.
- Cabe en GPU de consumo: si, en tarjetas de 24 GB o mas con cuantizacion Q4_K_M y proyector Q8_0; por debajo de 24 GB no hay datos que confirmen viabilidad.
- Opciones de despliegue: llama.cpp (`llama-server`), LM Studio, Ollama, Transformers, SGLang y vLLM; el repositorio esta etiquetado como compatible con endpoints OpenAI.
- Latencia y throughput: el autor reporta 49,0 s por respuesta cotidiana en su servidor de pruebas, frente a 119,9 s del modelo base, sin especificar el hardware exacto de esa medicion.

## Comparativa con modelos similares

| Modelo | Parametros totales | Contexto | Licencia | Relacion |
|---|---|---|---|---|
| Inkling-2-Mini-Prime | 26,4 B | 32.768 en configuracion de ejemplo | Apache 2.0 | Finetune de Inkling-2-Mini |
| Inkling-2-Mini (base) | no disponible | no disponible | Apache 2.0 (segun etiquetas del base) | Modelo original de Thinking Machines Lab |
| Alternativas de tamano similar | no disponible | no disponible | no disponible | No se dispone de datos de otros modelos comparables en la informacion proporcionada |

La unica comparacion documentada es contra el modelo base. No se dispone de datos de otros modelos de 20-30 B con capacidades multimodales y de razonamiento que permitan una comparativa rigurosa con la informacion disponible.

## Limitaciones y advertencias

- El modelo solo esta entrenado y evaluado en ingles; el rendimiento en castellano u otros idiomas no esta documentado.
- No es un modelo sin censura: rechaza las mismas categorias de solicitudes que el original y al mismo ritmo (65,3 % de disposicion frente a 64,5 %), por lo que no debe usarse esperando evadir filtros de seguridad.
- La puntuacion de entrega en solicitudes sensibles baja ligeramente (34,6 % frente a 35,9 %), lo que indica una pequena perdida de exhaustividad en ese tipo de respuestas.
- No se reclama mejora de precision en benchmarks publicos; el beneficio es de eficiencia y finalizacion de tareas, no de calidad bruta.
- La medicion de system prompts largos proviene de un servicio alojado con el ajuste no fusionado, no de los pesos de este repositorio.
- Los tamanos de muestra son pequenos (15 tareas de depuracion, 160 comprobaciones de reglas), con intervalos de confianza amplios que limitan la extrapolacion.
- Riesgo de alucinacion no cuantificado en la informacion disponible; el modo de razonamiento privado no garantiza la verificabilidad de las respuestas.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validacion independiente de la comunidad.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base y sus condiciones deben verificarse por separado.
- El limite de contexto practico documentado es de 32.768 tokens en la configuracion de llama.cpp; no se confirma soporte nativo superior.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nokeepai/Inkling-2-Mini-Prime
- Repositorio GGUF: https://huggingface.co/nokeepai/Inkling-2-Mini-Prime-GGUF
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Sitio del autor: https://nokeep.ai/?ref=huggingface
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
