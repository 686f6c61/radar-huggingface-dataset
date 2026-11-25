# nexiloopofficial/nexi-4-v3-GGUF

## Resumen

NEXI-4 v3 es un modelo de lenguaje instructivo de pequeno tamano (1.881.825.088 parametros, aproximadamente 1,88 mil millones) desarrollado por el usuario nexiloopofficial y distribuido en formato GGUF cuantizado Q4_K_M. Se construye mediante un ajuste LoRA sobre Qwen3.5-2B, entrenado con el corpus real de function calling xLAM (con sobremuestreo) y con 20 trazas de razonamiento destiladas de un modelo mayor denominado NEXI-20 (Inkling-2-Mini). El modelo esta pensado para ejecucion local en CPU y entornos con recursos muy limitados.

Su propuesta de valor es clara: un runtime de agentes con tool calling y razonamiento destilado que cabe en torno a 2 GB de RAM en CPU. La model card reporta 24,7 tokens por segundo en una maquina de 8 vCPU con llama.cpp, 1,0 s de carga y un pico de 2,07 GB de RAM. La licencia Apache 2.0 facilita su integracion comercial sin restricciones adicionales.

El modelo llega en un momento en el que el interes por agentes locales y orquestacion tipo MCP crece, y donde la privacidad de los datos impide en muchos casos recurrir a APIs en la nube. NEXI-4 v3 apunta a ese nicho con un compromiso explicito: razonamiento antes de responder, a costa de cierta perdida de disciplina en tareas de formato estricto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (base Qwen3.5-2B, ajuste LoRA) |
| Parametros totales | 1.881.825.088 (aprox. 1,88 B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q4_K_M (unica publicada en el repo) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (compatible con llama.cpp) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-2B, un transformer denso de aproximadamente 1,88 mil millones de parametros, sobre el que se aplica un ajuste LoRA. El entrenamiento combina dos fuentes: el corpus real de function calling xLAM, con sobremuestreo para reforzar la capacidad de tool calling, y 20 trazas de razonamiento destiladas de NEXI-20 (Inkling-2-Mini). El resultado se fusiona en los pesos base y se cuantiza a Q4_K_M para su distribucion en GGUF.

La innovacion principal no reside en la arquitectura, sino en el enfoque de destilacion de razonamiento: el modelo genera texto de razonamiento antes de la respuesta final, lo que mejora tareas de matematicas y logica a costa de cierta perdida de disciplina en formatos estrictos. La model card reconoce este trade-off y recomienda extraccion estricta de la respuesta final o un system prompt que exija una seccion de respuesta final. No se especifican el numero de tokens de entrenamiento ni la composicion detallada del dataset.

## Capacidades

- Generacion de texto conversacional en modo instructivo.
- Tool calling y function calling, entrenado sobre el corpus real xLAM.
- Razonamiento multi-paso con texto de razonamiento previo a la respuesta (destilado de Inkling).
- Razonamiento matematico y logico basico, con mejora reportada de 1/3 a 3/3 en la suite propia del autor.
- Integracion con runtimes de agentes locales y orquestacion tipo MCP.
- Compatible con endpoints (tag `endpoints_compatible`) y con llama.cpp.
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Runtime de agentes con tool calling en local: el modelo puede gestionar llamadas a funciones en un bucle de agente sobre llama.cpp, sin dependencia de APIs en la nube, gracias a su entrenamiento sobre xLAM y su huella de 2 GB de RAM.
- Razonamiento en dispositivos con recursos limitados: tareas de matematicas y logica ejecutables en CPU con 8 vCPU a 24,7 tok/s, adecuado para entornos de escritorio o servidores pequenos.
- Orquestacion tipo MCP con requisitos de privacidad: cuando los datos no pueden salir del dispositivo, el modelo actua como cerebro de un agente local que coordina herramientas internas.
- Prototipado rapido de asistentes conversacionales: su carga en 1,0 s y su formato GGUF permiten iterar con rapidez en entornos de desarrollo sin GPU.
- Educacion y demostraciones de razonamiento destilado: util para mostrar como un modelo de 2B puede generar trazas de razonamiento antes de responder en tareas acotadas.
- Evaluacion de pipelines de extraccion de respuestas: su comportamiento de razonamiento previo lo convierte en un buen banco de pruebas para tecnicas de parsing y extraccion de respuesta final en produccion.

## Benchmarks y rendimiento

Resultados reportados por el autor en su suite propia de 12 tareas con verificacion de ejecucion estricta:

| Categoria | v2 | v3 |
|---|---|---|
| Coding | 3/4 | 2/4 |
| Math | 1/3 | 3/3 |
| Format | 3/3 | 2/3 |
| Knowledge | 2/2 | 2/2 |
| Total | 9/12 | 9/12 |

Metricas de ejecucion en CPU (8 vCPU, llama.cpp):

| Metrica | Valor |
|---|---|
| Tamano de fichero | 1,29 GB |
| RAM pico | 2,07 GB |
| Tiempo de carga | 1,0 s |
| Velocidad de generacion | 24,7 tok/s |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. Los datos anteriores proceden de la suite propia del autor y de sus mediciones de ejecucion; las salidas crudas se distribuyen en el repo (`eval_v3.json`).

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: aproximadamente 2,07 GB de RAM pico en la cuantizacion Q4_K_M reportada.
- GPU recomendadas: no disponibles; el modelo esta medido y optimizado para CPU.
- Cabe en GPU consumer: si, en cualquier GPU con al menos 2-3 GB de memoria libre, aunque no se han publicado mediciones en GPU.
- Opciones de despliegue: llama.cpp (medido), Ollama y otros runners compatibles con GGUF; tag `endpoints_compatible` sugiere soporte de endpoints.
- Latencia y throughput: 24,7 tok/s en 8 vCPU con llama.cpp; tiempo de carga de 1,0 s.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| NEXI-4 v3 | 1,88 B | No disponible | Apache 2.0 | GGUF Q4_K_M | Tool calling y razonamiento destilado; medido en CPU |
| Qwen3.5-2B (base) | ~2 B | No disponible | No disponible | Safetensors | Modelo base sin ajuste de tool calling ni razonamiento destilado |
| Alternativas de 2B con tool calling | No disponible | No disponible | No disponible | No disponible | No se dispone de datos comparables en la informacion proporcionada |

No se dispone de informacion suficiente para comparar con alternativas concretas de la misma categoria en terminos de rendimiento y contexto.

## Limitaciones y advertencias

- Conocimiento del mundo propio de un modelo de clase 2B; el autor lo califica explicitamente como no fronterizo.
- Regresion en disciplina de formato estricto en v3: el texto de razonamiento precede a la respuesta final, lo que puede romper parsers que esperen solo la respuesta.
- Manejo de CSV embebido en texto identificado como carencia conocida por el autor.
- Riesgo de alucinacion inherente a modelos de este tamano; se recomienda verificacion externa en produccion.
- Idiomas soportados no documentados; no se garantiza calidad multilingue.
- Longitud de contexto no documentada; no se debe asumir una ventana amplia.
- Licencia Apache 2.0 permite uso comercial, pero el modelo se distribuye sin garantias y con evaluacion limitada a la suite propia del autor.
- Repo con 0 descargas y 0 likes en el momento de la consulta; madurez y soporte comunitario no verificables.

## Enlaces

- Hugging Face: https://huggingface.co/nexiloopofficial/nexi-4-v3-GGUF
- Corpus xLAM: no disponible en la informacion proporcionada
- Paper o blog de NEXI-20 (Inkling-2-Mini): no disponible en la informacion proporcionada
- Repositorio de llama.cpp: no disponible en la informacion proporcionada
- Fichero de evaluacion `eval_v3.json`: incluido en el repo de Hugging Face
