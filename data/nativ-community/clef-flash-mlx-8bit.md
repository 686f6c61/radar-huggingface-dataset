# nativ-community/clef-flash-MLX-8bit

## Resumen

clef-flash-MLX-8bit es una conversion a MLX del modelo Cloudflare/clef-flash, publicada por la comunidad nativ-community. No es un modelo generativo al uso: se trata de un modelo de decision (decision model) de tipo image-text-to-text que, en una sola pasada hacia delante, devuelve una probabilidad para cada opcion de cada pregunta planteada, en lugar de generar texto token a token. Esa naturaleza lo aleja de los asistentes conversacionales convencionales y lo acerca a los clasificadores estructurados con entrada multimodal.

El repositorio contiene aproximadamente 9.531.576.561 parametros almacenados con cuantizacion affine de 8 bits y tamano de grupo 64, en formato safetensors y con un peso total en disco de unos 10,7 GB. La libreria declarada es mlx y el pipeline es image-text-to-text, lo que implica soporte de imagenes (y, segun la verificacion del autor, tambien video) ademas de texto. La licencia es Apache 2.0, lo que permite uso comercial sin las restricciones tipicas de otras licencias comunitarias.

Su relevancia es doble. Por un lado, lleva un modelo de decision multimodal al ecosistema MLX, pensado para ejecucion local en Apple Silicon. Por otro, el autor documenta una verificacion bastante estricta de la conversion: mismos token ids en 11 de 11 registros de referencia (texto, imagen, video, imagen mas video, dos imagenes, max_pixels, fps y num_frames) y la misma respuesta que la referencia de Cloudflare en PyTorch (fp32) en 25 de 25 preguntas, con una diferencia maxima de probabilidad de 0,0321.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de decision multimodal image-text-to-text; arquitectura interna no detallada en la informacion disponible) |
| Parametros totales | 9.531.576.561 |
| Parametros activos | no disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | affine 8-bit, group size 64 (unica variante publicada en este repositorio) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (formato MLX, libreria `mlx`) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura concreta del modelo base Cloudflare/clef-flash: no se especifican el tipo de transformer, el numero de capas, la dimension oculta ni el mecanismo de atencion. Lo que si se puede afirmar es que se trata de un modelo multimodal de entrada imagen mas texto, con capacidad adicional de procesar video (la verificacion de la conversion incluye registros con `fps` y `num_frames`), y que su salida no es texto libre sino una distribucion de probabilidad sobre un conjunto de opciones definido por el usuario mediante un esquema JSON con tipos como `choice` e `instructions` y `criteria`.

Tampoco hay datos publicos en esta ficha sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF o DPO. La innovacion destacable no esta en el entrenamiento sino en el proceso de conversion: se reproduce fielmente el comportamiento del modelo original en PyTorch fp32, con coincidencia exacta de token ids en 11 de 11 registros de referencia y coincidencia de respuesta en 25 de 25 preguntas, con una discrepancia maxima de probabilidad de 0,0321 atribuible a la cuantizacion de 8 bits.

## Capacidades

- Decision multimodal con salida estructurada: devuelve una probabilidad para cada opcion de cada pregunta en una unica pasada hacia delante, en lugar de generar texto.
- Entrada de texto e imagen (pipeline image-text-to-text), con soporte documentado de video en la verificacion de la conversion.
- Definicion de esquemas de decision arbitrarios por parte del usuario, con criterios y conjuntos de opciones personalizados (por ejemplo, asignacion de un ticket a un departamento entre varias alternativas).
- Multiples preguntas simultaneas: el resultado se devuelve como un diccionario indexado por el nombre de cada campo del esquema.
- Ejecucion local en Apple Silicon mediante MLX y mlx-vlm.
- No soporta generacion de texto libre: el propio autor lo indica explicitamente en la model card.
- Soporte de tool calling, agentes o razonamiento multi-paso: no disponible en la informacion proporcionada.

## Casos de uso

- Enrutado de tickets de soporte: el ejemplo oficial de la model card usa el modelo para decidir si una queja ("Please refund my duplicate charge") debe ir a facturacion, soporte tecnico o ventas, devolviendo la probabilidad de cada opcion en una sola inferencia.
- Clasificacion de documentos con imagen: al aceptar imagen y texto, puede decidir la categoria de un formulario escaneado, una factura o una captura de pantalla junto con su descripcion textual, sin necesidad de un OCR previo separado.
- Moderacion de contenido con criterios configurables: el esquema de decision permite definir varias categorias y obtener una probabilidad por categoria, lo que facilita fijar umbrales ajustables en lugar de depender de una generacion de texto.
- Triaje de incidencias en pipelines de automatizacion: integrado como paso de decision previo a un agente generativo, reduce el coste al evitar invocar un LLM grande para tareas de clasificacion.
- Analisis de video con criterios definidos: la verificacion menciona registros con `num_frames` y `fps`, lo que apunta a la posibilidad de decidir sobre contenido de video (por ejemplo, presencia o ausencia de un evento concreto).
- Investigacion sobre modelos de decision: util para comparar frente a clasificadores generativos y estudiar calibracion de probabilidades, gracias a que el modelo expone directamente la probabilidad de cada opcion.
- Inferencia local y privada en Mac: al ejecutarse con MLX sobre Apple Silicon, permite procesar contenido sensible sin enviar datos a servicios externos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica evaluacion documentada es la verificacion de fidelidad de la conversion, que se reproduce aqui tal cual:

| Verificacion | Resultado |
|---|---|
| Coincidencia de token ids en registros de referencia | 11 de 11 |
| Tipos de registro cubiertos | texto, imagen, video, imagen mas video, dos imagenes, max_pixels, fps, num_frames |
| Coincidencia de respuesta frente a la referencia PyTorch fp32 de Cloudflare | 25 de 25 preguntas |
| Diferencia maxima de probabilidad | 0,0321 |

## Requisitos de hardware

- El repositorio ocupa 10,7 GB, coherente con unos 9,53 mil millones de parametros en 8 bits y grupo de 64; se necesita al menos ese espacio de memoria unificada, y en la practica conviene disponer de 16 GB o mas para no forzar el intercambio a disco.
- MLX esta disenado para Apple Silicon, por lo que el hardware objetivo son chips de la serie M (M1, M2, M3, M4 y variantes Pro, Max y Ultra).
- Cabe en Mac con memoria unificada de 16 GB o superior; en equipos de 8 GB el modelo no entra con holgura.
- GPU Nvidia (A100, H100, RTX 4090) no son compatibles con esta conversion concreta, ya que MLX no las soporta; para esas GPU habria que usar la version original en PyTorch de Cloudflare/clef-flash.
- Opciones de despliegue: mlx-vlm. El soporte de Clef aun no esta en una release oficial, por lo que hay que instalar una rama concreta: `pip install "git+https://github.com/Lazarus-931/mlx-vlm.git@feat/clef"`. La verificacion se realizo con `Lazarus-931/mlx-vlm@c16f81aa`.
- Alternativa de despliegue para usuario final: la aplicacion Nativ, que ejecuta modelos abiertos en local sobre Apple Silicon.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| nativ-community/clef-flash-MLX-8bit | 9,53 mil millones | no disponible | safetensors (MLX, 8-bit) | Apache 2.0 | HuggingFace |
| Cloudflare/clef-flash (modelo base) | no disponible en esta ficha (mismo modelo origen) | no disponible | safetensors (PyTorch) | Apache 2.0 | HuggingFace |
| Otros modelos de decision multimodales comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion sobre modelos alternativos de la misma categoria (modelos de decision con salida de probabilidad por opcion y entrada multimodal), por lo que no es posible establecer una comparacion cuantitativa.

## Limitaciones y advertencias

- No genera texto: cualquier caso de uso que requiera respuestas redactadas necesita un modelo adicional; este modelo solo devuelve probabilidades sobre opciones predefinidas.
- La cuantizacion a 8 bits introduce una desviacion medible: la diferencia maxima de probabilidad frente a la referencia fp32 es de 0,0321, lo que puede ser relevante si se fijan umbrales de decision muy ajustados.
- No hay informacion sobre idiomas soportados; no se puede asumir un rendimiento multilingue sin verificacion previa.
- No hay informacion sobre la longitud de contexto ni sobre el numero de tokens de entrenamiento, lo que dificulta dimensionar el modelo para entradas largas.
- No se documentan sesgos conocidos ni evaluaciones de robustez o de alucinacion; al tratarse de un clasificador, el riesgo se manifiesta como asignacion erronea de probabilidad a una opcion, no como texto inventado.
- El soporte de Clef no esta en una release estable de mlx-vlm: depende de una rama de desarrollo concreta, con el riesgo de ruptura que ello implica en produccion.
- El repositorio registra 0 descargas y 0 likes, y fue creado y actualizado en octubre de 2026; se trata de una publicacion muy reciente y sin validacion externa por parte de la comunidad.
- La licencia Apache 2.0 permite uso comercial, pero conviene revisar tambien las condiciones del modelo base Cloudflare/clef-flash.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/nativ-community/clef-flash-MLX-8bit
- Modelo base: https://huggingface.co/Cloudflare/clef-flash
- mlx-vlm (repositorio de Blaizzy): https://github.com/Blaizzy/mlx-vlm
- Rama de mlx-vlm con soporte de Clef: https://github.com/Lazarus-931/mlx-vlm/tree/feat/clef
- Nativ, aplicacion para ejecutar IA en local en Mac: https://blaizzy.github.io/nativ/
