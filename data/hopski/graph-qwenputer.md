# hopski/graph-qwenputer

## Resumen

Graph Qwenputer es un checkpoint derivado de Qwen3.5-4B en el que el autor, hopski, ha insertado una CPU RV32IM (RISC-V de 32 bits con extensiones base y Zba) implementada como capas de transformer, compilada mediante el proyecto Qwenputer de Divyansh Agrawal. El modelo conserva las 32 capas originales de Qwen3.5-4B con sus pesos publicados y antepone 11 capas nuevas que emulan una maquina de computacion grafica: un grafo dirigido y tipado de hasta 1024 nodos que el modelo puede leer y modificar durante su propia ejecucion mediante llamadas como `path`, `neighbours`, `add_node` y `link`.

El checkpoint no ha sido entrenado: las 11 capas anadidas son pesos compilados que implementan el interprete de la CPU y 85 unidades de salida adicionales para que la maquina pueda emitir tokens ordinarios. De los 424 tensores de las 32 capas de Qwen, 360 coinciden bit a bit con la release original y los 64 restantes son ganancias de normalizacion reescaladas por Qwenputer para el modelo ensanchado. El resultado es un modelo de 9.381.981.888 parametros totales (18,9 GB en safetensors) que actua como una maquina vacia: los pesos no contienen ningun grafo, sino la capacidad de ejecutar uno cargado en tiempo de inferencia.

La relevancia es fundamentalmente experimental: demuestra que se puede incrustar una CPU funcional dentro de un transformer sin reentrenar, a costa de un rendimiento muy bajo (una consulta al grafo tarda minutos frente a milisegundos de una herramienta convencional). No es un modelo para produccion, sino una prueba de concepto sobre computacion hibrida entre redes neuronales y maquinas de estado explicitas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3.5-4B, 32 capas) con 11 capas adicionales que implementan una CPU RV32IM+Zba compilada |
| Parametros totales | 9.381.981.888 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo safetensors en el repo) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Modelo base | Qwen/Qwen3.5-4B |
| Tamano del repo | 18,9 GB |
| Tipo de pesos | compilados (no entrenados) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-4B, un transformer decoder-only de 32 capas, y le antepone 11 capas generadas por el compilador Qwenputer. Estas capas implementan una CPU RISC-V RV32IM con la extension Zba, con 85 unidades de salida adicionales que permiten a la maquina emitir tokens normales del vocabulario. No hay entrenamiento involucrado: los pesos de las capas nuevas son el resultado de compilar el firmware de la CPU a tensores, y los pesos de Qwen se conservan intactos salvo 64 tensores de normalizacion que Qwenputer reescala para adaptarlos a las dimensiones ensanchadas del modelo. Ademas, Qwenputer anade columnas disenadas para mantener las capas de Qwen "silenciosas" ante los tokens de la computadora, de modo que el modelo base no interfiera con la ejecucion del grafo.

La innovacion tecnica es la incrustacion de una maquina de estado explicita (un grafo tipado y dirigido de hasta 1024 nodos) dentro del propio forward pass del transformer. El firmware y el grafo no estan en los pesos: se cargan en el estado de ejecucion despues del prompt, por lo que el checkpoint por si solo es una maquina vacia que necesita el driver y el firmware del repositorio del proyecto. No se han publicado detalles sobre datos de entrenamiento, RLHF, DPO ni tecnicas de decodificacion especulativa, ya que no hay fase de entrenamiento.

## Capacidades

- Generacion de texto conversacional heredada de Qwen3.5-4B, aunque el autor advierte que la respuesta de Qwen tras la ejecucion del grafo puede ser basura sin el enrutado del driver.
- Lectura y escritura de un grafo dirigido y tipado de hasta 1024 nodos mediante llamadas como `path`, `neighbours`, `add_node` y `link`.
- Ejecucion de una CPU RV32IM+Zba completa dentro del forward pass, con firmware cargado en tiempo de inferencia.
- Emision de tokens ordinarios gracias a las 85 unidades de salida adicionales.
- Soporte de tool calling: el driver ofrece la herramienta y enruta los tokens, actuando como capa de integracion.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Sin soporte de vision, audio ni modo thinking documentado.

## Casos de uso

- Investigacion sobre computacion hibrida neuro-simbolica: el modelo permite estudiar como un transformer puede ejecutar una maquina de estado explicita dentro de su propio forward pass, sirviendo como banco de pruebas para arquitecturas que combinan redes neuronales con interpretes.
- Demostracion educativa de compilacion de CPU a tensores: util para cursos y articulos que expliquen como se traduce un firmware RISC-V a pesos de transformer y como se conservan las capas originales bit a bit.
- Experimentos de grafos pequenos en entornos controlados: con el firmware y el driver del repositorio, se puede cargar un grafo de hasta 1024 nodos (el ejemplo documentado es el metro de Nueva York) y consultar rutas y vecinos, aunque con latencias de minutos.
- Validacion de tecnicas de preservacion de pesos: el hecho de que 360 de 424 tensores coincidan bit a bit con Qwen3.5-4B permite estudiar metodos de ensanchado de modelos sin reentrenamiento.
- Pruebas de robustez de drivers de inferencia: el modelo exige un driver que cargue memoria y enrute tokens, lo que lo convierte en un caso extremo para probar pipelines de transformers personalizados.
- Reproduccion de resultados academicos: el checkpoint es el usado en las ejecuciones con pesos reales del proyecto, por lo que sirve para replicar los experimentos publicados en el repositorio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor solo reporta cualitativamente que una consulta al grafo tarda minutos frente a milisegundos de una herramienta convencional, y que un bucle de top-token sin el enrutado del driver acerto en 6 de 6 viajes probados, aproximadamente cinco veces mas lento, con respuesta posterior de Qwen inservible.

## Requisitos de hardware

- VRAM estimada para inferencia: al menos 19 GB en precision completa (fp16/bf16) para los 18,9 GB de safetensors, mas overhead de activaciones y estado del grafo.
- GPU recomendadas: A100 40 GB, H100, o GPUs consumer con 24 GB o mas (RTX 3090, RTX 4090) para fp16; no cabe en GPUs de 16 GB sin cuantizacion, que no esta disponible en el repo.
- Opciones de despliegue: transformers con el driver y firmware del repositorio del proyecto; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: el autor indica que una consulta al grafo tarda minutos, ordenes de magnitud por encima de una herramienta convencional; no se proporcionan cifras de throughput.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Graph Qwenputer | 9,38 B | no disponible | Qwen3.5-4B + CPU RISC-V compilada | Apache 2.0 | Hugging Face (hopski/graph-qwenputer) |
| Qwen3.5-4B | no disponible | no disponible | Transformer decoder-only convencional | Apache 2.0 | Hugging Face (Qwen/Qwen3.5-4B) |
| Qwenputer (proyecto original) | no disponible | no disponible | Compilador de CPU a capas de transformer | MIT (compilador) | GitHub (divagr18/qwenputer) |

La comparativa con alternativas de la misma categoria (modelos de ~4 B para generacion de texto) no esta disponible en la informacion proporcionada, ya que no se han publicado datos de rendimiento de Graph Qwenputer frente a modelos convencionales.

## Limitaciones y advertencias

- El modelo es una maquina vacia: los pesos no contienen ningun grafo ni firmware; sin el driver y el firmware del repositorio del proyecto no es funcional.
- Sin el enrutado del driver, un bucle de top-token simple produce respuestas de Qwen inservibles tras la ejecucion del grafo.
- Rendimiento muy bajo: una consulta al grafo tarda minutos frente a milisegundos de una herramienta convencional, y una herramienta ordinaria obtiene las mismas respuestas.
- El juicio de Qwen es la parte debil segun el autor; el repositorio documenta problemas conocidos.
- Riesgo de alucinacion: no evaluado ni cuantificado en la informacion disponible.
- Sesgos conocidos: no documentados; al heredar los pesos de Qwen3.5-4B, podria arrastrar los sesgos del modelo base, pero no se confirma.
- Limitaciones de contexto e idioma: no disponibles.
- Restricciones de licencia: Apache 2.0 para los pesos; el compilador y la maquina son de Divyansh Agrawal bajo licencia MIT, lo que debe respetarse en uso derivado.
- No apto para produccion: es una prueba de concepto experimental, no un modelo para despliegues reales.

## Enlaces

- Hugging Face: https://huggingface.co/hopski/graph-qwenputer
- Repositorio del proyecto: https://github.com/ho3h/graph-qwenputer
- Qwenputer (compilador original): https://github.com/divagr18/qwenputer
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
