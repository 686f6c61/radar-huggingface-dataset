# nikimori/Qwen3.5-2B-4bit-slim

## Resumen

nikimori/Qwen3.5-2B-4bit-slim es una derivacion del modelo multimodal mlx-community/Qwen3.5-2B-4bit a la que se le ha eliminado la torre de vision. En concreto, el autor ha borrado los 297 tensores con prefijo `vision_tower.*` (0,66 GB en bf16) y ha conservado los 694 tensores restantes byte a byte, sin tocar la configuracion, el tokenizador ni la plantilla de chat del modelo original. El resultado es un checkpoint de solo texto de 1,06 GB frente a los 1,72 GB de partida, con 1.881.825.088 parametros (aproximadamente 1,88 mil millones) en cuantizacion de 4 bits para MLX.

El modelo esta pensado para Pretype, una aplicacion de autocompletado para macOS del mismo autor, que ejecuta sus funciones de correccion y respuesta sobre Macs de 8 GB de RAM. Pretype solo envia texto al modelo, por lo que la torre de vision representaba una descarga que nunca se cargaba en memoria; de ahi la poda. La relevancia de esta ficha es acotada: no es un modelo nuevo ni un reentrenamiento, sino un artefacto de optimizacion de tamano con verificacion empirica de equivalencia funcional en la tarea objetivo.

La licencia es Apache-2.0, heredada del modelo fuente. No se han publicado datos sobre longitud de contexto, idiomas soportados ni composicion del dataset de entrenamiento original, por lo que esos apartados se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base de la familia qwen3_5 con torre de vision eliminada; transformer multimodal en origen) |
| Parametros totales | 1.881.825.088 (aprox. 1,88 mil millones) |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits (formato MLX, heredado del modelo base) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX); repositorio de 1,1 GB en disco, 1,06 GB de pesos segun la model card |
| Libreria de inferencia | mlx (validado con mlx-lm 0.31.3) |
| Modalidad | solo texto (vision eliminada) |
| Modelo base | mlx-community/Qwen3.5-2B-4bit |
| Tensores conservados | 694 (de los 991 originales; se eliminan 297 de `vision_tower.*`) |

## Arquitectura y entrenamiento

No se proporciona informacion sobre la arquitectura interna ni sobre el proceso de entrenamiento del modelo base. Lo unico documentado es que mlx-community/Qwen3.5-2B-4bit incluye una torre de vision de 297 tensores en bf16 (0,66 GB) y que este build la elimina, dejando 694 tensores intactos byte a byte. La configuracion, el tokenizador y la plantilla de chat no se han modificado respecto al modelo fuente. La cuantizacion de 4 bits ya venia aplicada en el checkpoint de origen; este repositorio no recuantiza, solo poda.

El autor reporta que la salida de texto es identica entre el modelo original y esta version. No hay informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF o DPO en el modelo base. La plantilla de chat expone un parametro `enable_thinking` en `apply_chat_template`, lo que indica que el modelo base soporta un modo de razonamiento explicito desactivable en generacion.

## Capacidades

- Generacion de texto conversacional, segun el tag `conversational` y el pipeline `text-generation` del repositorio.
- Correccion de texto y erratas: la evaluacion del autor incluye una funcion "Fix" sobre 680 filas de prueba.
- Generacion de respuestas en contexto de conversacion: funcion "Reply" evaluada sobre 570 filas.
- Modo de razonamiento conmutable mediante `enable_thinking` en la plantilla de chat (el ejemplo de uso lo desactiva explicitamente).
- Capacidad multilingue: no disponible.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Vision: no soportada en este build. La model card lo indica de forma explicita: "Image input does not work with this build".
- Capacidades de audio: no disponible.

## Casos de uso

- Autocompletado y correccion en editores de texto en macOS: es el caso de uso original. Pretype ejecuta los atajos de correccion y respuesta con este modelo sobre equipos de 8 GB de RAM, aprovechando que los pesos ocupan 1,06 GB.
- Correccion ortografica y gramatical en linea: el modelo corrige frases como "I recieved teh package yesterday" en menos de 40 tokens de salida, segun el ejemplo de la model card, lo que permite integrarlo en campos de formulario o clientes de correo.
- Generacion de respuestas cortas en asistentes locales: la funcion "Reply" se evaluo sobre 570 filas con salida identica al modelo original, lo que habilita respuestas sugeridas sin coste de red.
- Procesamiento de texto en local por privacidad: al ejecutarse con MLX sobre Apple Silicon, los datos no salen del dispositivo, adecuado para documentos confidenciales o entornos sin conectividad.
- Prototipado rapido de aplicaciones de escritorio con MLX: el repositorio es un checkpoint de 1,06 GB que se carga con `mlx_lm.load`, util para iterar en demos de UI sin descargar pesos innecesarios.
- Tareas de texto por lotes en portatiles: al reducir el peso en disco un 38 % (de 1,72 GB a 1,06 GB), es viable empaquetarlo en distribuciones de aplicaciones o en imagenes de contenedor ligeras.
- Fine-tuning o evaluacion de referencia sobre la familia qwen3_5 en solo texto: al eliminar la torre de vision, se simplifica el grafo de carga en pipelines que nunca procesan imagenes.

## Benchmarks y rendimiento

Los unicos datos publicados son las mediciones del arnes de evaluacion de Pretype, del 16 de octubre de 2026, con decodificacion voraz (greedy):

| Metrica | mlx-community/Qwen3.5-2B-4bit | nikimori/Qwen3.5-2B-4bit-slim |
|---|---|---|
| Fix: salida identica, 680 filas | referencia | 680 / 680 |
| Reply: salida identica, 570 filas | referencia | 570 / 570 |
| Fix: linea con errata restaurada exactamente | 33 % | 33 % |
| Tamano de descarga | 1,72 GB | 1,06 GB |

No se han publicado resultados de MMLU, HumanEval, GSM8K u otros benchmarks estandar en la informacion disponible.

## Requisitos de hardware

- Peso de los pesos en disco: 1,06 GB segun la model card (repositorio de 1,1 GB en HuggingFace).
- Plataforma: MLX, lo que implica Apple Silicon (M1 o posterior). No hay soporte CUDA, ROCm ni CPU generica en este formato.
- Memoria: el autor indica que el modelo funciona en Macs de 8 GB de RAM ejecutando las funciones de correccion y respuesta de Pretype. No se publican cifras de VRAM ni de memoria unificada pico.
- GPU recomendadas: no disponible. Al ser un artefacto MLX, no aplican A100, H100 o RTX 4090 de forma nativa.
- Inferencia en GPU consumer: no aplica en el sentido habitual; el destino son GPUs integradas de Apple Silicon. Cabe en equipos con 8 GB de memoria unificada segun el autor.
- Opciones de despliegue: mlx-lm (validado con la version 0.31.3). No se documenta compatibilidad con vLLM, TGI, llama.cpp u Ollama, que no consumen pesos MLX.
- Latencia y throughput: no disponibles. Solo se indica que la salida es identica a la del modelo base con el mismo binario y las mismas filas de prueba.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Tamano de pesos | Disponibilidad |
|---|---|---|---|---|---|---|
| nikimori/Qwen3.5-2B-4bit-slim | 1,88 B | no disponible | solo texto | Apache-2.0 | 1,06 GB | MLX / mlx-lm |
| mlx-community/Qwen3.5-2B-4bit | no disponible | no disponible | texto + vision | no disponible en esta ficha | 1,72 GB | MLX / mlx-lm |
| Otras alternativas de ~2 B para MLX | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

La unica comparacion documentada es contra el modelo base: misma salida en las 680 filas de "Fix" y las 570 de "Reply", con 0,66 GB menos de descarga. No se dispone de datos de rendimiento frente a otros modelos de tamano similar.

## Limitaciones y advertencias

- Eliminacion irreversible de la vision: este build no acepta entrada de imagenes. Cualquier caso de uso que requiera multimodalidad debe usar el modelo original.
- No es un modelo nuevo: no hay reentrenamiento ni ajuste fino. La calidad depende integramente de mlx-community/Qwen3.5-2B-4bit.
- Equivalencia verificada en un dominio estrecho: los resultados de identidad (680/680 y 570/570) provienen del arnes de Pretype, con decodificacion voraz y un conjunto concreto de filas. No garantizan comportamiento identico en otros prompts, temperaturas de muestreo ni tareas.
- Tasa de acierto limitada en la tarea de correccion: la restauracion exacta de la linea con errata es del 33 % en ambos modelos, es decir, dos de cada tres intentos no reproducen la linea exacta esperada. Es un dato a tener en cuenta antes de usar el modelo como corrector automatico sin supervision.
- Riesgo de alucinacion: no evaluado ni documentado en la informacion disponible.
- Sesgos: no documentados.
- Idiomas: no disponibles. No se puede asumir cobertura multilingue a partir de la informacion proporcionada. El ejemplo de uso esta en ingles.
- Contexto: longitud maxima desconocida; no se debe asumir una ventana amplia sin verificar la configuracion del modelo base.
- Licencia: Apache-2.0, permisiva para uso comercial, heredada del modelo fuente. Conviene verificar los terminos del checkpoint original de Qwen3.5-2B en caso de redistribucion.
- Dependencia de plataforma: al ser MLX, queda restringido a hardware Apple Silicon; no es desplegable en servidores Linux con GPU NVIDIA sin conversion previa del formato.
- Adopcion practicamente nula: 0 descargas y 1 like en el momento de redactar esta ficha, sin mantenimiento ni comunidad documentados.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/nikimori/Qwen3.5-2B-4bit-slim
- Modelo base: https://huggingface.co/mlx-community/Qwen3.5-2B-4bit
- Aplicacion Pretype: https://github.com/nikiomori/Pretype
- Libreria mlx-lm: no se proporciona enlace en la informacion disponible
