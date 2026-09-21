# Slomin/Potato-CODER-12GB

## Resumen

Potato-CODER-12GB es un despliegue publicado por el usuario Slomin sobre los pesos de un modelo de mezcla de expertos (MoE) de aproximadamente 35.000 millones de parametros totales y unos 3.000 millones activos por token (35B-A3B), derivado de Ornith-1.5-35B-A3B y del cuantizado Tiel-Coder-35B-A3B de peculiar-ragdoll. El modelo se distribuye unicamente en formato GGUF con cuantizacion UD-IQ3_XXS (unos 3,0 bits por peso, 12,3 GiB en disco) y el repositorio completo ocupa 13,8 GB. No se ha entrenado ni recuantizado nada en esta publicacion: lo que aporta el autor es la receta de despliegue (contexto, offload, cache, muestreo y presupuesto de razonamiento) que permite servir un modelo de este tamano en una unica tarjeta NVIDIA de 12 GB.

La propuesta tecnica consiste en mantener 26 de las capas de expertos en la RAM del sistema mientras el resto permanece en la GPU, con una cache KV cuantizada a q8_0, logrando una longitud de contexto de 131.072 tokens con un pico de VRAM de 8.949 MiB sobre una envolvente de 11.836 MiB. El modelo soporta vision (proyector Q8_0 residente en la GPU) y tool calling verificado, y esta orientado explicitamente a flujos de codigo agentico, con plantilla de chat "Sharp" integrada en el propio GGUF que se activa con `--jinja`.

Es relevante ahora porque demuestra que un MoE de 35B con contexto de 131k puede ejecutarse en hardware de gama media-alta de consumo sin recuantizar los pesos, a costa de ceder latencia y de depender de la RAM del sistema. El autor publica ademas una variante hermana, Potato-CODER-12GB-Fast, unas 2,4 veces mas rapida sobre el mismo trabajo y con el modelo completamente residente en GPU, pero descrita como mas debil en tareas de repositorio de varios pasos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Ornith-1.5-35B-A3B, mezcla de expertos (MoE); identificada como `qwen35moe` en el GGUF |
| Parametros totales | 34.660.610.688 (~34,66B) |
| Parametros activos | ~3B (variante 35B-A3B) |
| Longitud de contexto | 131.072 tokens, una sola ranura (slot), sin context shift |
| Tipos de cuantizacion | UD-IQ3_XXS (~3,0 bits por peso, 12,3 GiB en disco); cache KV en q8_0 / q8_0; proyector de vision en Q8_0 |
| Idiomas soportados | en (ingles), zh (chino) |
| Licencia | MIT |
| Formato de pesos | GGUF (modelo principal y proyector `mmproj` por separado); no se distribuyen safetensors |
| Pipeline declarado | image-text-to-text |
| Modelo base | peculiar-ragdoll/Tiel-Coder-35B-A3B-GGUF, ornith-ai/Ornith-1.5-35B-A3B |
| Tamano del repositorio | 13,8 GB |
| Descargas / likes | 0 / 0 |
| Fecha de publicacion | 20 de septiembre de 2026 (ultima actualizacion: 21 de septiembre de 2026) |

## Arquitectura y entrenamiento

La arquitectura es una mezcla de expertos de tipo transformer con enrutamiento disperso, con aproximadamente 34,66B de parametros totales y unos 3B activos por token. El autor no describe el proceso de entrenamiento en la informacion disponible: no se indican el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo fases de RLHF, DPO u otras. Tampoco se documentan innovaciones de atencion del modelo base. Lo unico indicado es que los pesos proceden de `peculiar-ragdoll/Tiel-Coder-35B-A3B-UD-IQ3_XXS.gguf` y que todos los tensores se verificaron byte a byte identicos al origen, con la unica modificacion de los metadatos `general.*` para esta publicacion.

La innovacion real de esta ficha es de despliegue, no de entrenamiento: el reparto de capas entre GPU y RAM (`--n-cpu-moe 26`), la cache KV en q8_0, el presupuesto de razonamiento de 16.384 tokens con mensaje de cierre forzado, y el muestreo para agentes (`--presence-penalty 0`, temperatura 1.0, top-p 0.95, top-k 20, min-p 0.0) que evita penalizar repeticiones legitimas de rutas de fichero. El autor reporta que el ajuste de offload es determinante para la calidad: con 131k de contexto, 22 capas offload fallan su comprobacion de recuperacion en profundidad (*retrieval-at-depth*) y 26 la superan, y ninguna de las fallas observadas fue un error de memoria insuficiente. La plantilla de chat "Sharp" de peculiar-ragdoll va dentro del GGUF y se activa con `--jinja`.

## Capacidades

- Generacion de texto y codigo con soporte explicito de plantilla de chat y modo de razonamiento (bloque de pensamiento con presupuesto configurable de 16.384 tokens).
- Codigo agentico: tool calling verificado en la configuracion publicada, con un turno de llamada a herramienta medido en 2,7 s sobre RTX 3090 dentro de la envolvente de 12 GB.
- Vision: clasificacion y descripcion de imagenes mediante proyector Q8_0 residente en la GPU; verificada con capturas de pantalla y fotografias a profundidad total de contexto, con un turno de imagen de 4,9 s.
- Contexto largo: 131.072 tokens en una sola ranura, con cache KV q8_0 y `--no-context-shift`.
- Uso como backend de agentes: el servidor expone API compatible con OpenAI en `http://127.0.0.1:8080/v1`, y el autor cita OpenCode, Cline y mini-SWE-agent como clientes.
- Multilingue limitado a ingles y chino segun los metadatos declarados; no se declara soporte de castellano.
- Control de razonamiento por parametros de plantilla: `reasoning_effort` (por ejemplo "medium") y `preserve_thinking`.

## Casos de uso

- Agente de codigo en local para desarrolladores individuales: el modelo se sirve con llama.cpp en una unica GPU de 12 GB y se conecta a clientes tipo Cline u OpenCode por API compatible con OpenAI, lo que permite trabajar sobre un repositorio sin enviar codigo a servicios externos.
- Refactorizacion de repositorios con contexto amplio: los 131.072 tokens permiten cargar varios ficheros y el historial de conversacion en una sola ventana, util para renombrar simbolos, migrar APIs o unificar estilos en proyectos medianos.
- Resolucion de incidencias sobre trazas o capturas: al aceptar entrada de imagen, puede recibir capturas de pantalla de errores, paneles de monitorizacion o diffs renderizados y proponer la correccion correspondiente.
- Automatizacion de tareas de mantenimiento con tool calling: el modelo puede invocar herramientas de fichero, shell o busqueda paso a paso, adecuado para scripts de triaje de issues, actualizacion de dependencias o generacion de tests.
- Pipelines de revision de codigo asistida: integrado en un servidor local, puede revisar pull requests completos y emitir comentarios, con la ventaja de que el material sensible no sale de la maquina.
- Extraccion y resumen de documentacion tecnica en ingles o chino: util para equipos que consumen documentacion de librerias cuyo idioma principal es el chino o el ingles.
- Prototipado de agentes multi-paso en investigacion: la combinacion de 131k de contexto, vision y herramientas permite experimentar con bucles de razonamiento largos sin coste de API, aunque las pruebas deben realizarse contra el hardware objetivo por la dependencia del offload.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye cifras de MMLU, HumanEval, GSM8K ni de ninguna otra suite estandar. El unico dato de evaluacion es cualitativo: el modelo supera la comprobacion interna de recuperacion en profundidad (*retrieval-at-depth*) del autor con `--n-cpu-moe 26` a 131k de contexto y falla con 22 capas offload, sin cifras publicadas asociadas.

Los datos de rendimiento de ejecucion disponibles, medidos en una RTX 3090 con una ranura y dentro de la envolvente de 12 GB, son:

| Metrica | Valor |
|---|---|
| Decodificacion | 53 tok/s |
| Prefill a 60k de contexto | 744 tok/s |
| Tiempo de carga | 18 s |
| Turno con imagen | 4,9 s |
| Turno de llamada a herramienta | 2,7 s |
| Pico de VRAM | 8.949 MiB de 11.836 MiB (2.886 MiB libres) |

## Requisitos de hardware

- VRAM: pico de 8.949 MiB sobre una envolvente de 11.836 MiB (tarjeta de 12 GB menos 452 MiB reservados para escritorio y controladores). El autor recomienda 12 GB como minimo practico, con 2.886 MiB de margen y el proyector de vision Q8_0 residente.
- RAM del sistema: 16 GB recomendados. En las pruebas del autor el servidor se limito a 10 GiB y se mantuvo dentro de ese limite; 26 capas de expertos residen en RAM.
- GPU objetivo declarada: NVIDIA RTX 4070 y RTX 3060 de clase 12 GB. Las mediciones se realizaron en una RTX 3090 restringida a la envolvente de 12 GB.
- Compatibilidad de binarios: los builds publicados incluyen SASS para sm_75, sm_80, sm_86, sm_89 y sm_120, mas PTX generico para tarjetas mas nuevas. En Windows se distribuyen paquetes CUDA 12.4 (RTX 20xx-40xx) y CUDA 13.4 (RTX 50xx) junto con el `cudart` correspondiente.
- Despliegue: llama.cpp (`llama-server`) sin parches sobre el upstream actual. No se mencionan vLLM, TGI, Ollama ni otros motores; el reparto de expertos a CPU es especifico de llama.cpp.
- Ajuste critico de Windows: desactivar el desbordamiento a RAM del controlador (NVIDIA Control Panel, *CUDA - Sysmem Fallback Policy* en *Prefer No Sysmem Fallback*); de lo contrario la generacion cae a unos pocos tokens por segundo sin reportar error.
- Si falla la asignacion, el autor sugiere bajar `-c` a 114.688 antes que reducir el offload, y despues subir `--n-cpu-moe`.
- Latencia y throughput: 53 tok/s de decodificacion y 744 tok/s de prefill a 60k en RTX 3090, con una sola ranura de servicio.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Potato-CODER-12GB | ~34,66B totales, ~3B activos | 131.072 | 53 tok/s decodificacion, 744 tok/s prefill a 60k (RTX 3090, envolvente 12 GB) | MIT | GGUF en HuggingFace, 0 descargas |
| Potato-CODER-12GB-Fast | no disponible (misma familia 35B-A3B) | 131.072 | ~2,4x mas rapido que Potato-CODER-12GB en el mismo trabajo | no disponible | GGUF en HuggingFace; modelo completo residente en GPU, sin uso de RAM |
| peculiar-ragdoll/Tiel-Coder-35B-A3B-GGUF | ~35B totales, ~3B activos | no disponible | no disponible | no disponible | GGUF en HuggingFace; es el origen byte a byte de los pesos de esta publicacion |
| ornith-ai/Ornith-1.5-35B-A3B | 35B-A3B | no disponible | no disponible | no disponible | modelo base de la familia; pesos completos, no GGUF segun la informacion disponible |

La diferencia funcional declarada entre Potato-CODER-12GB y su variante Fast no es de peso ni de contexto, sino de reparto hardware: la version lenta mantiene 26 capas de expertos en RAM y es descrita como la mas fuerte en trabajo de repositorio de varios pasos; la rapida reside entera en GPU y es descrita como mas debil en ese mismo escenario. No hay datos publicados que cuantifiquen esa diferencia de calidad.

## Limitaciones y advertencias

- Cuantizacion agresiva: UD-IQ3_XXS a unos 3,0 bits por peso implica una perdida de fidelidad respecto a los pesos originales. No se publican evaluaciones que cuantifiquen esa degradacion.
- Dependencia de la RAM del sistema: 26 de las capas de expertos se sirven desde memoria principal, por lo que el rendimiento depende de la velocidad y el ancho de banda de la RAM, no solo de la GPU.
- Fragilidad del ajuste de offload: con 22 capas en lugar de 26 el modelo falla la comprobacion de recuperacion en profundidad del autor; no es un parametro opcional ni una simple palanca de rendimiento.
- Contexto util condicionado: los 131.072 tokens son alcanzables, pero el propio autor indica que la calidad de recuperacion depende del ajuste de offload y de mantener la cache KV en q8_0 o superior.
- Idiomas: solo ingles y chino segun los metadatos. No hay soporte declarado de castellano ni de otras lenguas.
- Riesgo de alucinacion: no disponible. No se publican evaluaciones de fidelidad, y el modelo esta orientado a generacion de codigo y llamadas a herramientas, contextos donde los errores silenciosos son especialmente costosos.
- Sesgos conocidos: no disponible. La informacion proporcionada no incluye ninguna evaluacion de sesgo.
- Uso comercial: la licencia declarada es MIT, lo que permite uso comercial, pero el repositorio incluye ficheros `LICENSE` y `NOTICE` con atribuciones a los modelos base que conviene revisar antes de redistribuir.
- Estado del artefacto: version v1.0-rc1 con 0 descargas y 0 likes en el momento de la consulta, publicada el 20 de septiembre de 2026 con actualizacion al dia siguiente. No hay validacion independiente de las mediciones del autor.
- Especifico de Windows: sin desactivar el *Sysmem Fallback* del controlador, el modelo se desborda a RAM y la generacion se degrada a unos pocos tokens por segundo en lugar de fallar de forma explicita.
- Plantilla de chat propietaria del ecosistema ("Sharp") integrada en el GGUF: requiere `--jinja` para activarse correctamente; otros motores de inferencia pueden no interpretarla igual.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Slomin/Potato-CODER-12GB
- Variante rapida: https://huggingface.co/Slomin/Potato-CODER-12GB-Fast
- Modelo base cuantizado (origen de los pesos): https://huggingface.co/peculiar-ragdoll/Tiel-Coder-35B-A3B-GGUF
- Modelo base de la familia: https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B
- Binarios de llama.cpp del autor: https://github.com/potato-os/llama.cpp/releases
- La busqueda web realizada no ha devuelto ningun enlace relevante sobre este modelo; los resultados obtenidos corresponden a perfiles personales sin relacion con el artefacto. No se dispone de paper, blog tecnico ni demo adicionales.
