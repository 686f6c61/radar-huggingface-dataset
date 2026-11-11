# Climb-Ai/Climb-1-Photon-GGUF

## Resumen

Climb 1 Photon es un modelo de lenguaje especializado en la generación de comandos de terminal Linux y Bash, desarrollado por Climb-Ai. Con 752.393.024 parámetros (aproximadamente 0,8B), se posiciona como un copiloto de CLI ultraligero pensado para ejecución local en portátiles, dispositivos edge, Termux y entornos con recursos limitados. Esta ficha cubre la variante GGUF, que ofrece pesos cuantizados listos para `llama.cpp` y Ollama.

El modelo parte de una base Qwen (etiquetada como `qwen3.5` en los tags del repositorio) e incorpora una innovación propietaria denominada Astra Weight-Space Programming (WSP), descrita por el autor como protección anti-bucle. Su propósito es traducir instrucciones en lenguaje natural a comandos POSIX correctos, con soporte declarado para inglés y ruso, y una licencia Apache 2.0 que permite uso comercial sin restricciones adicionales.

La relevancia de esta ficha radica en su enfoque vertical: en lugar de competir en razonamiento general, optimiza la generación de sintaxis de shell con un coste computacional mínimo. La cuantización Q5_K_M ocupa 551 MB y requiere unos 850 MB de RAM/VRAM, lo que lo hace desplegable en hardware muy modesto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (base Qwen, segun tags `qwen` y `qwen3.5`); detalles de capas y atención no disponibles |
| Parametros totales | 752.393.024 (aprox. 0,8B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible de forma explicita; los ejemplos de la model card usan `n_ctx=512` |
| Tipos de cuantizacion | F16, Q8_0, Q5_K_M, Q4_K_M |
| Idiomas soportados | Ingles (en), ruso (ru) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repositorio de cuantizaciones); el modelo base se distribuye en otro formato no especificado en esta ficha |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna mas alla de que el modelo deriva de la familia Qwen (tags `qwen` y `qwen3.5`) y que cuenta con 752.393.024 parametros. No se especifican el numero de capas, la dimension del modelo, el tipo de atencion ni la longitud de contexto nativa. Tampoco se documentan el volumen de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO.

La innovacion tecnica destacada por el autor es Astra Weight-Space Programming (WSP), presentada como un mecanismo de proteccion anti-bucle. No se aporta documentacion tecnica sobre su funcionamiento, su implementacion ni metricas que cuantifiquen su eficacia. La model card recomienda un prompt con estructura ChatML (`<|im_start|>`, `<|im_end|>`) y un bloque `<think>` vacio, lo que sugiere un formato de plantilla de conversacion compatible con modelos de la familia Qwen.

## Capacidades

- Generacion de comandos de terminal Linux y Bash a partir de instrucciones en lenguaje natural, incluyendo operaciones sobre ficheros, procesos, puertos y permisos.
- Traduccion de tareas cotidianas de administracion de sistemas a sintaxis POSIX, con ejemplos en la model card como `find`, borrado de ficheros antiguos y terminacion de procesos por puerto (`fuser -k 8080/tcp`).
- Soporte bilingue declarado: ingles y ruso.
- Formato conversacional con plantilla ChatML y bloque de razonamiento `<think>`.
- Proteccion anti-bucle mediante Astra WSP, segun el autor.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, vision, audio ni modo thinking extendido.

## Casos de uso

- Asistencia interactiva en terminal: el modelo traduce peticiones como "borra los ficheros .log de mas de 30 dias en /var/log" a comandos `find` con `-mtime` y `-delete`, adecuado por su tamano reducido y su enfoque en sintaxis de shell.
- Integracion en editores y entornos de desarrollo: mediante `llama-cpp-python` con `n_gpu_layers=-1` se puede invocar localmente para autocompletar o sugerir comandos mientras se escribe, sin latencia de red.
- Despliegue en dispositivos edge y Termux: la cuantizacion Q4_K_M (505 MB, unos 750 MB de RAM) permite ejecutarlo en moviles y dispositivos con memoria limitada para asistencia offline de administracion.
- Automatizacion de scripts de mantenimiento: generar fragmentos de Bash para tareas repetitivas (limpieza de directorios, monitorizacion de procesos) con validacion humana previa, aprovechando la licencia Apache 2.0 para uso interno y comercial.
- Formacion y soporte a usuarios noveles: explicar y proponer comandos a partir de descripciones en lenguaje natural, con la ventaja de que el modelo es lo bastante pequeno para ejecutarse en el portatil del usuario sin conexion.
- Copiloto en pipelines de CI/CD: generar o revisar comandos de shell en etapas de build y despliegue mediante llamadas a `llama.cpp` o Ollama, con temperatura 0 para maximizar la determinacion de la salida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada segun cuantizacion: F16 ~1,9 GB; Q8_0 ~1,1 GB; Q5_K_M ~850 MB; Q4_K_M ~750 MB.
- GPU recomendadas: no se especifican modelos concretos; el modelo es lo bastante pequeno para ejecutarse en cualquier GPU consumer con al menos 2 GB de VRAM (F16) o en CPU.
- Cabe en GPU consumer: si, practicamente en cualquier GPU moderna (GTX 1050 o superior con 4 GB o mas), y en CPU con 1-2 GB de RAM libre.
- Opciones de despliegue: `llama.cpp` (CLI y `llama-cpp-python`), Ollama (con Modelfile incluido en la model card). No se documenta soporte de vLLM ni TGI.
- Latencia y throughput: no disponibles. Los ejemplos de la model card usan `n_ctx=512` y `max_tokens=64`, lo que sugiere respuestas cortas y de baja latencia, pero no se aportan cifras medidas.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones de modelos comparables en la informacion proporcionada. Como referencia estructural, el modelo comparte familia (Qwen) y orden de magnitud (sub-1B) con variantes pequenas de Qwen, pero no se aportan parametros de contexto, rendimiento ni licencia de esas alternativas para establecer una comparacion rigurosa. Por tanto, la comparativa se considera no disponible.

## Limitaciones y advertencias

- Modelo especializado: su entrenamiento se orienta a comandos de terminal Linux/Bash; no debe esperarse buen rendimiento en razonamiento general, matematicas o codigo fuera del dominio de shell.
- Idiomas limitados: solo ingles y ruso declarados; el rendimiento en castellano no esta documentado y probablemente sea deficiente.
- Riesgo de alucinacion en comandos: como todo modelo generativo, puede producir sintaxis incorrecta o comandos peligrosos (por ejemplo, borrados recursivos no solicitados); se recomienda validacion humana antes de ejecutar cualquier salida en produccion.
- Contexto corto en los ejemplos: la model card usa `n_ctx=512`, insuficiente para conversaciones largas o ficheros de configuracion extensos; la longitud maxima real no esta documentada.
- Sin datos de sesgos: no se publica informacion sobre sesgos conocidos ni sobre la composicion del dataset de entrenamiento.
- Astra WSP sin documentacion: la proteccion anti-bucle no cuenta con documentacion tecnica ni metricas publicas que permitan evaluar su eficacia.
- Licencia Apache 2.0: permite uso comercial y modificacion, pero se debe conservar el aviso de licencia y no se ofrece garantia alguna por parte del autor.
- Madurez: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, y fue creado en noviembre de 2026; no hay evidencia de adopcion ni de validacion por la comunidad.

## Enlaces

- Repositorio GGUF en Hugging Face: https://huggingface.co/Climb-Ai/Climb-1-Photon-GGUF
- Modelo base: https://huggingface.co/Climb-Ai/Climb-1-Photon
- No se han encontrado en la busqueda web papers, blogs, repositorios ni demos adicionales relevantes para este modelo.
