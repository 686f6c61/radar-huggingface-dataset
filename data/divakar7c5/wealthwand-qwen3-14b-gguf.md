# divakar7c5/wealthwand-qwen3-14b-gguf

## Resumen

Wealthwand-qwen3-14b-gguf es una cuantizacion en formato GGUF (Q4_K_M) del modelo denso Qwen/Qwen3-14B, publicada por el usuario divakar7c5 para el asistente de escritorio de Wealth Wand, una aplicacion de finanzas personales con enfoque local-first. No se trata de un modelo entrenado desde cero ni de un fine-tuning: es una conversion de los pesos oficiales a GGUF y su posterior cuantizacion a 4 bits con llama.cpp (build `b11620`), lo que reduce el peso en disco a aproximadamente 9,0 GB y permite ejecutarlo en equipos de escritorio con 16 GB de RAM o mas, con aceleracion por GPU mediante Vulkan en Windows y Metal en macOS.

El modelo conserva la arquitectura y los pesos del Qwen3-14B original, con 14.768.307.200 parametros (unos 14,8 mil millones) y licencia Apache-2.0, la misma del modelo base. Su relevancia es practica: ofrece una via de despliegue de un modelo de ~15B en hardware de consumo sin depender de servicios en la nube, algo critico para una aplicacion que procesa datos financieros personales y que por diseno no quiere enviarlos a terceros.

El autor reporta que la evaluacion interna de la aplicacion puntuo este cuantizado con un 79% de exito en 114 tareas financieras, el mejor resultado entre los modelos que se ejecutan con comodidad en un escritorio. Se trata, sin embargo, de una metrica propietaria y no de un benchmark estandar, por lo que no es comparable con MMLU, GSM8K u otros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (heredada del modelo base Qwen3-14B); el repositorio solo contiene el cuantizado, no una arquitectura nueva |
| Parametros totales | 14.768.307.200 (aproximadamente 14,8 mil millones) |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | No disponible en la informacion del repositorio; el modelo base Qwen3-14B documenta 32.768 tokens nativos, extensibles con YaRN (dato no confirmado en esta ficha) |
| Tipos de cuantizacion | Q4_K_M (unico cuantizado publicado en este repositorio) |
| Idiomas soportados | No disponible en la metadata de HuggingFace |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp), fichero unico de aproximadamente 9,0 GB |
| Modelo base | Qwen/Qwen3-14B |
| Herramienta de conversion | llama.cpp build `b11620` (`convert_hf_to_gguf.py --outtype f16` + `llama-quantize Q4_K_M`) |
| Tamano del repositorio | 9,0 GB |
| Fecha de publicacion | 15 de octubre de 2026 (segun metadata de HuggingFace) |

## Arquitectura y entrenamiento

Este repositorio no incluye entrenamiento propio. El procedimiento documentado por el autor es puramente de conversion y cuantizacion: descarga de los pesos oficiales de Qwen/Qwen3-14B en safetensors (junto con los ficheros de configuracion, tokenizer y plantilla Jinja), conversion a GGUF en precision f16 con `convert_hf_to_gguf.py` y cuantizacion posterior a Q4_K_M con `llama-quantize`. Por tanto, la arquitectura, los datos de entrenamiento, el alineamiento (RLHF/DPO) y las innovaciones tecnicas son exactamente las del modelo base Qwen3-14B, sobre el que no se aporta informacion adicional en la model card.

El unico cambio real respecto al original es la precision numerica: se pasa de pesos en punto flotante de 16 bits (unos 29,5 GB teoricos para 14,768 mil millones de parametros) a una cuantizacion de bloque de 4 bits con escalas de tipo K, lo que deja el fichero en 9,0 GB, aproximadamente 0,61 bytes por parametro (unas 4,9 bits por parametro contando metadatos y escalas). Esto implica una perdida de calidad respecto al modelo en f16 o bf16 que no se cuantifica en la documentacion del repositorio; el unico indicio es la evaluacion interna de la aplicacion (79% en 114 tareas financieras), sin comparacion publicada contra el modelo sin cuantizar.

## Capacidades

- Generacion de texto conversacional multi-turno, orientada al asistente de escritorio de Wealth Wand.
- Razonamiento y comprension de lenguaje natural heredados del modelo base Qwen3-14B.
- Uso en tareas de dominio financiero: la evaluacion interna de la aplicacion cubre 114 tareas de este tipo, con un 79% de exito.
- Ejecucion completamente local: no requiere conexion a servicios externos ni envio de datos a la nube.
- Inferencia acelerada por GPU en escritorio: Vulkan en Windows y Metal en macOS cuando hay GPU disponible.
- Capacidades adicionales del modelo base (tool calling, modo thinking, multilingueismo, codigo, matematicas, contexto largo) no se documentan ni se confirman en la model card de este repositorio; se consideran no disponibles a efectos de esta ficha.

## Casos de uso

- Asistente financiero local en escritorio: es el proposito declarado del cuantizado. La aplicacion Wealth Wand lo usa para responder preguntas sobre finanzas personales sin que los datos del usuario salgan del equipo, algo posible gracias a los 9,0 GB de peso que caben en un equipo de 16 GB.
- Clasificacion y categorizacion de transacciones: el modelo puede etiquetar movimientos bancarios y asignar categorias a partir del texto del comercio o la descripcion, una tarea encuadrada en las 114 tareas financieras evaluadas internamente.
- Resumen de extractos y movimientos: dado un listado de operaciones, generar un resumen en lenguaje natural de ingresos, gastos y variaciones por periodo, con el contexto suficiente para cubrir historicos extensos segun los limites del modelo base.
- Analisis de presupuestos y recomendaciones de ahorro: conversacion multi-turno en la que el usuario ajusta cifras y el modelo recalcula escenarios, aprovechando que todo el estado se mantiene en local.
- Despliegue en equipos sin GPU dedicada: al ser un GGUF Q4_K_M, puede ejecutarse total o parcialmente en CPU con llama.cpp, lo que cubre portatiles y equipos de oficina con 16 GB de RAM que quedan fuera del alcance de modelos de mayor tamano.
- Base para prototipos de aplicaciones de finanzas personales: sirve como punto de partida para desarrolladores que quieran integrar un LLM local en su propio producto, al estar publicado bajo Apache-2.0 y en un formato soportado por Ollama, LM Studio o llama.cpp.
- Procesamiento por lotes de documentos financieros en local: extraccion de datos y respuestas sobre contratos, recibos o extractos sin coste por token y sin dependencia de API externa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El unico dato de evaluacion aportado por el autor es una metrica interna de producto:

| Evaluacion | Resultado | Contexto |
|---|---|---|
| Tareas financieras internas de Wealth Wand | 79% de exito sobre 114 tareas | Metrica propietaria de la aplicacion, no comparable con benchmarks publicos; mide el rendimiento del cuantizado Q4_K_M en el asistente |

No se aporta comparacion contra el modelo base sin cuantizar, contra otras cuantizaciones ni contra modelos alternativos.

## Requisitos de hardware

- VRAM estimada: en torno a 10-11 GB para descargar por completo el fichero de 9,0 GB en GPU, sumando el contexto y los buffers de inferencia. Es una estimacion aritmetica a partir del tamano del repositorio, no un dato publicado.
- RAM: el autor indica que el modelo esta pensado para escritorios con 16 GB de RAM o mas.
- GPU recomendadas: cualquier GPU con 12 GB o mas de VRAM permite el offload completo o casi completo (RTX 3060 12 GB, RTX 4070 Ti, RTX 4080, RTX 4090, A100, H100). En GPUs de 8 GB es necesario repartir capas entre GPU y CPU.
- Compatibilidad con GPU de consumo: si, es uno de los objetivos del cuantizado. La model card menciona explicitamente aceleracion Vulkan en Windows y Metal en macOS.
- Opciones de despliegue: llama.cpp (herramienta con la que se genero el fichero), Ollama, LM Studio, Jan, koboldcpp y cualquier runtime compatible con GGUF. El soporte de GGUF en vLLM es experimental y no se menciona en la documentacion del repositorio.
- Latencia y throughput: no disponibles. No se publican mediciones de tokens por segundo ni de latencia.

## Comparativa con modelos similares

| Modelo | Parametros | Formato / tamano | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| wealthwand-qwen3-14b-gguf (Q4_K_M) | 14,77 mil millones | GGUF, 9,0 GB | No disponible en la ficha | Apache-2.0 | HuggingFace, 0 descargas, 0 likes en el momento de la consulta |
| Qwen/Qwen3-14B (modelo base) | 14,77 mil millones | Safetensors, aproximadamente 29,5 GB en bf16/f16 (calculo a partir del numero de parametros) | 32.768 tokens nativos segun la documentacion del base | Apache-2.0 | HuggingFace, repositorio oficial de Qwen |
| Otras cuantizaciones GGUF de Qwen3-14B | 14,77 mil millones | GGUF en distintos niveles (Q3, Q5, Q6, Q8) | Igual que el base | Apache-2.0 | Disponibles en el ecosistema, pero no referenciadas en esta ficha |

No se dispone de datos de rendimiento comparativos entre estas opciones en la informacion proporcionada, por lo que la comparacion se limita a formato, tamano y licencia.

## Limitaciones y advertencias

- La cuantizacion Q4_K_M introduce perdida de precision respecto a los pesos originales en f16/bf16. El repositorio no documenta ninguna evaluacion de degradacion frente al modelo base.
- La unica metrica de calidad publicada (79% en 114 tareas financieras) proviene de una evaluacion interna de la aplicacion Wealth Wand, sin metodologia detallada, sin conjunto de test publico y sin posibilidad de reproduccion independiente.
- El repositorio no declara idiomas soportados en su metadata; el comportamiento en castellano no esta verificado en la informacion disponible.
- Riesgo de alucinacion: inherente a los modelos de lenguaje de esta escala, y especialmente sensible en un dominio como el financiero, donde una cifra o una recomendacion incorrecta puede tener consecuencias economicas. No se documentan salvaguardas especificas.
- Sesgos conocidos: no se documenta ningun analisis de sesgos en el repositorio.
- Licencia Apache-2.0, heredada del modelo base: permite uso comercial, modificacion y redistribucion, siempre que se conserve el aviso de licencia y se indique los cambios. No se imponen restricciones adicionales en la model card.
- Modelo con 0 descargas y 0 likes en HuggingFace en el momento de la consulta: no hay evidencia de uso en produccion por terceros ni de validacion de la comunidad.
- El repositorio no incluye informacion sobre longitud de contexto soportada en la practica con este cuantizado, ni sobre la plantilla de chat empleada mas alla del fichero Jinja heredado del base.
- Para despliegues en produccion conviene verificar el fichero cuantizado frente al original y validar el comportamiento en el dominio concreto de la aplicacion antes de sustituir un modelo sin cuantizar.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/divakar7c5/wealthwand-qwen3-14b-gguf
- Modelo base: https://huggingface.co/Qwen/Qwen3-14B
- Repositorio de la aplicacion Wealth Wand: https://github.com/WealthWand/wealth-wand
- llama.cpp (herramienta de conversion y cuantizacion): https://github.com/ggml-org/llama.cpp
