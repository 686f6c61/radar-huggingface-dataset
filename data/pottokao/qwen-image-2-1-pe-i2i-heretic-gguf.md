# pottokao/Qwen-Image-2.1-PE-I2I-Heretic-GGUF

## Resumen

Qwen-Image-2.1-PE-I2I-Heretic-GGUF es una derivacion comunitaria del modelo Qwen/Qwen-Image-2.1-PE-I2I, publicada por el usuario pottokao bajo la Qwen Research License. No se trata de un modelo generativo de imagenes, sino de un **reescritor de prompts de edicion**: partiendo de una instruccion de edicion vaga y una o varias imagenes de entrada, devuelve un prompt de edicion preciso y accionable. Internamente es un Qwen3.5-VL de 9B afinado para esta tarea, con 8.953.803.264 parametros totales segun los safetensors del modelo base.

La variante anadida por el autor es una **ablacion direccional de rechazos** aplicada con la herramienta Heretic, que reduce la tasa de rechazos de aproximadamente 98/100 en el modelo original a unos 5/100 en esta build, con un coste de divergencia KL de ~0.037. El resultado se distribuye en formato GGUF para llama.cpp e incluye el proyector de vision (mmproj) en bf16, por lo que funciona tanto en modo texto como en modo imagen+texto.

Es relevante ahora porque cubre un nicho muy concreto y poco servido: la capa de reescritura previa a un pipeline de edicion de imagenes, donde la calidad del prompt determina el resultado final. Su utilidad practica esta, sin embargo, fuertemente condicionada por dos factores: requiere obligatoriamente un system prompt de 18 KB que define el contrato de salida, y su licencia prohibe el uso comercial sin un acuerdo aparte con Qwen.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Qwen3.5-VL) con torre de vision y proyector; afinado como reescritor de prompts |
| Parametros totales | 8.953.803.264 (dato real de safetensors del modelo base) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 16.384 tokens en el ejemplo de uso documentado (`-c 16384`); la longitud nativa del modelo base no se especifica |
| Tipos de cuantizacion | Q4_K_M para el modelo de lenguaje (tensores de embedding de tokens y de salida mantenidos en Q6_K); mmproj en bf16. Solo se distribuye esta cuantizacion |
| Idiomas soportados | no disponible (no documentado en la model card) |
| Licencia | qwen-research (Qwen Research License); solo uso no comercial |
| Formato de pesos | GGUF (llama.cpp), con mmproj GGUF independiente para la vision |
| Tamano del repositorio | 6,8 GB |
| Ficheros distribuidos | `pe_i2i_heretic-Q4_K_M.gguf`, `pe_i2i_heretic.mmproj-bf16.gguf`, `system_prompt.txt` |
| Modelo base | Qwen/Qwen-Image-2.1-PE-I2I |
| Pipeline declarado | no disponible |
| Descargas / likes | 0 / 1 |

## Arquitectura y entrenamiento

El modelo base es un Qwen3.5-VL de 9B afinado especificamente como reescritor de prompts de edicion de imagen (image-to-image). Su entrada es una instruccion de edicion ambigua mas una o varias imagenes; su salida es un prompt de edicion estructurado. El contrato de salida es estricto: el modelo razona primero dentro de un bloque `<think>` y despues emite un JSON con estructura, registro, longitud y descripcion espacial definidos. Ese contrato no esta implicito en los pesos, sino en un documento externo de 18 KB (`system_prompt.txt`) que el autor incluye y sin el cual, segun sus propias palabras, el modelo es inservible.

La intervencion de este repositorio es una ablacion direccional de la direccion de rechazo mediante la herramienta Heretic, aplicada **unicamente sobre el modelo de lenguaje**. La torre de vision no fue modificada, de modo que el mmproj es bit a bit el codificador visual original. La busqueda de hiperparametros se hizo con Optuna distribuido sobre redis, con aproximadamente 1.900 ensayos, y produjo un frente de Pareto monotono: cada rechazo eliminado incrementa la divergencia KL respecto al modelo original y, en un reescritor estructurado, ese dano se traduce en perdida de disciplina de longitud, cumplimiento de JSON y capacidad de descripcion espacial. Esta build corresponde al punto equilibrado de bajo dano (≈5/100 rechazos con KL ≈ 0.037). No se documentan en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO en el modelo base.

## Capacidades

- Reescritura de instrucciones de edicion de imagen: convierte una orden vaga en un prompt preciso con estructura, registro y restricciones explicitas.
- Procesamiento multimodal real: acepta imagenes de entrada junto con la instruccion (via `image_url`) y tambien funciona en modo solo texto.
- Razonamiento previo a la respuesta: genera un bloque `<think>` antes del JSON final.
- Salida estructurada en JSON conforme al contrato definido en `system_prompt.txt`.
- Preservacion de texto presente en la imagen: segun el autor, en ediciones neutras mantiene el texto dentro de la imagen igual que el modelo base.
- Descripcion espacial: produce listas de detalle retenido y referencias posicionales dentro de la imagen.
- Ejecucion de ediciones que el modelo base rechaza o sanitiza de forma encubierta, tanto por canal de texto como por canal de imagen+instruccion.
- No se documenta soporte de tool calling, function calling ni comportamiento agentico multi-paso.
- Idiomas soportados: no disponible.

## Casos de uso

- **Preprocesado de pipelines de edicion de imagen**: el modelo se coloca delante de un modelo de edicion (por ejemplo, el propio Qwen-Image) para transformar la instruccion informal del usuario en un prompt tecnico y detallado; mejora la fidelidad del resultado sin tocar el modelo generativo.
- **Retoque fotografico por lotes**: con una instruccion generica ("limpia el fondo y sube la nitidez") mas la imagen de entrada, genera prompts consistentes para procesar colecciones enteras con parametros homogeneos.
- **Herramientas de diseno asistido**: integrado como paso intermedio en un editor grafico, traduce la intencion del disenador a especificaciones ejecutables y devuelve el JSON que la interfaz usa para mostrar el plan de edicion.
- **Generacion de datasets instruccion-edicion**: produce pares (instruccion vaga, prompt estructurado) de forma masiva para entrenar o evaluar modelos de edicion de imagen, gracias a que la salida es JSON parseable.
- **Marketing y material grafico con texto en imagen**: aprovecha la preservacion de texto in-image documentada para editar piezas con tipografia manteniendo la legibilidad y la posicion original.
- **Investigacion sobre abliteration**: sirve como caso de estudio reproducible de ablacion direccional sobre un modelo multimodal, con la tabla de compromiso entre rechazos y KL publicada por el autor.
- **Flujos de contenido sin restricciones tematicas**: para equipos que trabajan con material sensible o artistico y necesitan un reescritor que no sanitice ni rechace la instruccion (ver limitaciones legales en la seccion correspondiente).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible (ni MMLU, ni HumanEval, ni GSM8K, ni metricas de calidad de reescritura). El unico dato cuantitativo publicado es la tabla de compromiso de la ablacion, medida con el harness de Heretic sobre n = 100 peticiones de rechazo:

| Rechazos | KL (dano) | Nota |
|---:|---:|---|
| 1/100 | 0.107 | ablacion mas agresiva, mayor dano |
| 2/100 | 0.058 | build alternativa mas fuerte |
| ~5/100 | ~0.037 | esta build, punto equilibrado de bajo dano |
| 10/100 | 0.036 | |
| 19/100 | 0.028 | |
| 32/100 | 0.015 | |
| 98/100 | 0 | el modelo original |

Verificacion cross-modal publicada por el autor, con peticiones de edicion NSFW por categoria (desnudez, actos explicitos, gore/violencia, restriccion) lanzadas como instruccion solo texto y como imagen + instruccion:

| Canal | Modelo base original | Esta build |
|---|---|---|
| Instruccion NSFW solo texto | cumple en casos leves, rechaza los fuertes | cumple en 8/8 categorias |
| Imagen + instruccion NSFW | rechazo blando / sanitiza (JSON valido que declina la edicion) | ejecuta la edicion solicitada |

El propio autor advierte de que los rechazos se miden sobre n = 100 y que diferencias de pocos rechazos estan dentro del ruido binomial; KL es la medida fiable.

## Requisitos de hardware

- **VRAM estimada para inferencia**: el repositorio ocupa 6,8 GB, de los cuales el GGUF Q4_K_M del modelo de lenguaje ronda los 5,5-6 GB y el mmproj bf16 anade aproximadamente 0,5-1 GB. Sumando cache KV a 16.384 tokens, una estimacion razonable es de 8-10 GB de VRAM. Son estimaciones a partir del tamano publicado, no cifras oficiales.
- **GPU recomendadas**: RTX 4090, RTX 4080, RTX 3090 o superiores para ejecucion fluida con vision activada; A100 o H100 si se despliega para multiples usuarios concurrentes, aunque estan sobredimensionadas para un modelo de 9B en Q4_K_M.
- **Cabe en GPU de consumo**: si. Una GPU de 12 GB deberia ser suficiente reduciendo el contexto por debajo de 16k; 16 GB o mas da margen comodo. Tambien puede ejecutarse en CPU con llama.cpp, con latencias mucho mayores.
- **Opciones de despliegue**: la unica ruta documentada es llama.cpp (`llama-server -m ... --mmproj ... -c 16384 --jinja`). El autor etiqueta el repositorio como compatible con endpoints. No hay informacion sobre Ollama, vLLM, TGI u otros motores, y el uso de mmproj GGUF limita las alternativas fuera del ecosistema llama.cpp.
- **Latencia y throughput**: no disponibles.
- **Requisito operativo critico**: es obligatorio enviar el contenido de `system_prompt.txt` como mensaje de sistema y reservar entre 4.000 y 6.000 tokens de `max_tokens`, porque el modelo razona en un bloque `<think>` antes de emitir el JSON.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rechazos | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| pottokao/Qwen-Image-2.1-PE-I2I-Heretic-GGUF | 8,95 B | 16.384 en el ejemplo documentado | ~5/100 | qwen-research, solo no comercial | GGUF para llama.cpp con mmproj |
| Qwen/Qwen-Image-2.1-PE-I2I (base) | 8,95 B | no disponible | 98/100 | qwen-research | pesos originales; no es esta build GGUF |
| Otros reescritores de prompts de edicion abliterados en GGUF | no disponible | no disponible | no disponible | no disponible | no disponible |

La busqueda web realizada no devolvio ningun resultado relevante sobre este modelo ni sobre alternativas comparables de la misma categoria; los unicos enlaces recuperados corresponden a recambios de automocion y no guardan relacion con el contenido de esta ficha. Por tanto, la comparativa con terceros modelos equivalentes queda como no disponible.

## Limitaciones y advertencias

- **Licencia no comercial**: la Qwen Research License (§1.i / §2.a) prohibe el uso comercial. Cualquier despliegue en produccion con animo de lucro requiere una licencia separada de Qwen. El autor lo declara de forma explicita.
- **Dependencia absoluta del system prompt**: sin el documento de 18 KB el modelo no funciona correctamente. Esto lo hace fragil ante cambios de plantilla de chat o de motor de inferencia.
- **Dano medible por la ablacion**: el frente de Pareto implica que la eliminacion de rechazos degrada la disciplina de longitud, el cumplimiento del formato JSON y la descripcion espacial. Es precisamente la capacidad por la que se paga en esta tarea.
- **Ruido estadistico**: la metrica de rechazos se mide sobre n = 100; diferencias de pocos rechazos entre builds no son significativas.
- **Riesgo de alucinacion espacial**: el modelo describe la imagen y planifica la edicion; no hay datos publicados sobre tasa de error en la descripcion de detalles ni sobre fidelidad al contenido real de la imagen.
- **Contenido sin filtros**: la ablacion elimina rechazos en el canal de texto y en el de imagen. Esto traslada toda la responsabilidad legal y etica al operador del sistema, especialmente en jurisdicciones con regulacion sobre contenido sexual, violento o generado.
- **Sin validacion comunitaria**: 0 descargas y 1 like en el momento de la consulta; es una publicacion reciente sin evidencia de uso independiente.
- **Una sola cuantizacion**: no hay alternativas en Q5, Q6, Q8 ni bf16 completas en este repositorio, lo que limita el ajuste fino de la relacion calidad/VRAM.
- **Idiomas no documentados**: se desconoce el soporte real multilingue y su calidad fuera del ingles.
- **El modelo no genera imagenes**: es un reescritor de prompts. Cualquier expectativa de edicion directa es incorrecta.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/pottokao/Qwen-Image-2.1-PE-I2I-Heretic-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen-Image-2.1-PE-I2I
- Heretic (ablacion direccional): https://github.com/p-e-w/heretic
- Resultados de la busqueda web: no se encontro ningun enlace relevante; los resultados devueltos correspondian a recambios de automocion y no guardan relacion con el modelo.
