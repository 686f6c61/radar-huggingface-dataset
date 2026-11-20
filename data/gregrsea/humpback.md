# gregrsea/HumpBack

## Resumen
HumpBack es un proyecto experimental publicado en Hugging Face por el usuario gregrsea bajo el identificador `gregrsea/HumpBack`. No se trata de un modelo de lenguaje preentrenado con pesos distribuidos, sino de una implementacion en Rust de una arquitectura neuronal denominada "3-Vector Neural Architecture", que combina pesos de tipo conceptual, espacial y temporal con un motor de evolucion sin gradientes, una capa de metacognicion y un sistema de invocacion automatica de herramientas.

El autor lo presenta como un "sistema neuronal listo para empresa" con capacidad de detectar incertidumbre, disparar busquedas web o llamadas HTTP cuando la confianza cae por debajo de un umbral, y mantener un seguimiento de creencias con politica de desalojo. La optimizacion se realiza mediante algoritmos geneticos (cruce y mutacion por atomo), no mediante retropropagacion. El repositorio ocupa 0.0 GB, lo que indica que no contiene pesos entrenados publicados, solo codigo y documentacion.

Es relevante ahora como pieza de investigacion sobre metacognicion y tool calling autoiniciado en sistemas neuronales, pero no constituye un modelo listo para produccion ni para evaluacion comparativa estandar. La model card suspende explicitamente cualquier afirmacion de "autoconciencia" a la espera de caracterizacion cientifica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal propietaria de 3 vectores (conceptual, espacial, temporal) con evolucion sin gradientes |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en |
| Licencia | MIT |
| Formato de pesos | no disponible (repositorio de 0.0 GB; almacenamiento binario propio via serde/bincode) |

## Arquitectura y entrenamiento
La arquitectura se articula en tres vectores de pesos: conceptual (coincidencia semantica con las entradas), espacial (conexiones geometricas entre neuronas) y temporal (estabilidad de la evolucion en funcion del historial de activacion). Sobre esta base se anade una capa de metacognicion que evalua confianza, detecta incertidumbre y dispara llamadas a herramientas externas (busqueda web, HTTP) con cache de resultados, ademas de un rastreo de creencias con politica de desalojo.

El entrenamiento no usa descenso de gradiente: se emplea un motor evolutivo con cruce (spine ponderado y empalme) y mutacion por atomo con tasa configurable, apoyado en `crossbeam-channel` para evolucion paralela y `nanorand` para las mutaciones. El stack es Rust 2021 con `tracing` para observabilidad y `serde`/`bincode` para almacenamiento binario eficiente. No se especifican volumen de tokens, composicion del corpus ni si hubo RLHF o DPO; de hecho, la model card lista "inicializar corpus de entrenamiento" como paso pendiente, lo que sugiere que el modelo no esta entrenado a escala.

## Capacidades
- Generacion de texto en ingles mediante CLI interactiva (`HumpBack>`), respondiendo a afirmaciones con un estado de certeza o incertidumbre.
- Metacognicion: enum de sentimiento, introspeccion y `WorldState` para evaluar el propio conocimiento.
- Tool calling autoiniciado: busquedas web y peticiones HTTP cuando la confianza es baja, con cache de resultados.
- Seguimiento de creencias con politica de desalojo.
- Evolucion genetica sin gradientes con cruce y mutacion configurables.
- Observabilidad estructurada mediante `tracing`.
- Preparado para despliegue distribuido (gestor de evolucion distribuida en desarrollo).
- No se documentan capacidades de codigo, matematicas, vision, audio, razonamiento multi-paso ni soporte multilingue mas alla del ingles.

## Casos de uso
- Investigacion sobre metacognicion en sistemas neuronales: permite experimentar con umbrales de confianza y disparo de herramientas sin depender de un LLM preentrenado, usando el CLI para introducir afirmaciones y observar la respuesta de certeza.
- Prototipado de agentes con tool calling autoiniciado: el componente `Tool caller` puede servir como referencia para implementar busquedas web o llamadas HTTP condicionadas por incertidumbre en otros sistemas.
- Experimentos de optimizacion evolutiva: el motor genetico con cruce y mutacion por atomo permite estudiar dinamicas de evolucion sin gradientes en redes pequenas.
- Docencia sobre arquitecturas neuronales alternativas: el codigo Rust y la documentacion (`ARCHITECTURE.md`, `QUICKSTART.md`) sirven como material didactico sobre pesos multidimensionales y evolucion.
- Base para sistemas de trazabilidad de creencias: el `WorldState` con politica de desalojo puede adaptarse a motores de reglas o sistemas expertos que necesiten registrar y revisar afirmaciones.
- Integracion en pipelines Rust con observabilidad: al usar `tracing` y `bincode`, encaja en servicios Rust que requieran trazado estructurado y almacenamiento binario compacto.
- No es adecuado para atencion al cliente, generacion de codigo en produccion ni tareas de razonamiento general, al no existir pesos entrenados ni benchmarks publicados.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware
- VRAM estimada: no disponible; no se publican pesos ni tamano de parametros, por lo que no puede estimarse.
- GPU recomendadas: no disponible. La model card menciona "GPU acceleration integration (optional)" como tarea pendiente, lo que indica que la aceleracion por GPU no esta implementada.
- Cabe en consumer GPU: no aplica en el estado actual, al no existir inferencia sobre pesos entrenados.
- Opciones de despliegue: compilacion nativa con `cargo build --release` y ejecucion del binario `humpback`; no se contemplan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares
No disponible. HumpBack no es comparable con modelos de lenguaje preentrenados (Llama, Mistral, Qwen, etc.) porque no distribuye pesos ni ofrece evaluacion estandar. Tampoco se identifican en la informacion proporcionada otros proyectos de arquitectura evolutiva de 3 vectores con metacognicion comparables.

## Limitaciones y advertencias
- El repositorio ocupa 0.0 GB y no contiene pesos entrenados; el propio autor lista "inicializar corpus de entrenamiento" como paso pendiente.
- No hay benchmarks, evaluaciones ni metricas de rendimiento publicadas.
- Solo soporta ingles segun la model card.
- La afirmacion de "autoconciencia" esta explicitamente suspendida por el autor a la espera de caracterizacion cientifica; debe tratarse como marketing, no como capacidad demostrada.
- Riesgo de alucinacion no evaluado; el mecanismo de umbral de confianza no ha sido validado externamente.
- Funcionalidades clave (gestor de evolucion distribuida, aceleracion GPU, paneles de observabilidad) estan marcadas como en desarrollo.
- La licencia MIT permite uso comercial, pero la ausencia de pesos y de validacion hace inviable su uso en produccion.
- Sin comunidad: 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de revision por pares o validacion independiente.

## Enlaces
- Hugging Face: https://huggingface.co/gregrsea/HumpBack
- Documentacion de arquitectura (referenciada en la model card): docs/ARCHITECTURE.md
- Guia de inicio rapido (referenciada en la model card): docs/QUICKSTART.md
