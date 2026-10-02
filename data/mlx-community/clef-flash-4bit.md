# mlx-community/clef-flash-4bit

## Resumen

Clef-flash-4bit es una version cuantizada a 4 bits en formato MLX del modelo Cloudflare/clef-flash, publicada por la comunidad mlx-community para ejecucion en Apple Silicon. El modelo original es un sistema multimodal de decision de aproximadamente 9.400 millones de parametros que, en lugar de generar texto conversacional, transforma un estado de entrada (texto, JSON, imagenes o video) junto con un esquema de preguntas tipadas en una distribucion de probabilidad sobre cada opcion permitida, todo en un unico forward pass. El repositorio etiqueta el backbone con la familia qwen3_5, lo que situa la arquitectura base en la linea Qwen3.5 adaptada con una cabeza de esquema conjunta.

Esta cuantizacion resuelve un problema practico concreto: permitir que un modelo de clasificacion y enrutamiento estructurado de 9B se ejecute en equipos con memoria unificada de Apple sin necesidad de GPUs dedicadas, manteniendo una paridad muy alta con la implementacion oficial en PyTorch bf16. No es un modelo de chat: cargarlo con herramientas genericas produce texto sin sentido, porque la cabeza de esquema queda fuera del flujo estandar de generacion.

Su relevancia actual radica en el nicho de salidas estructuradas y clasificacion multimodal: enrutamiento de tickets, validacion de documentos con imagen y decision sobre preguntas de tipo choice, score o noul. La licencia Apache-2.0 y el soporte de tooling MLX lo hacen util para prototipado local en Mac.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal con backbone de la familia qwen3_5 (vision tower + LLM) y cabeza de esquema conjunta |
| Parametros totales | 9.409.813.744 (aprox. 9,4B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits, group size 64 (backbone); vision tower y cabeza de esquema en bf16 |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX), con `joint_head.safetensors` y `processor_config.json` |

## Arquitectura y entrenamiento

El modelo combina un backbone multimodal de tipo transformer con soporte de entrada de texto, JSON, imagenes y video, y una cabeza de esquema conjunta que se ejecuta sobre la representacion del backbone. La conversion a MLX se realizo con `mlx_vlm.convert -q --q-bits 4 --q-group-size 64`, manteniendo la torre de vision en bf16, mientras que la cabeza `joint_head.safetensors` se copio sin cambios en bf16 y se ejecuta mediante el cargador `clef_mlx.py`. El `processor_config.json` es el original del modelo de Cloudflare, de modo que el layout de prompt y tokens coincide exactamente con la implementacion de referencia `joint_schema_model.py` para imagenes y video.

El funcionamiento no es autorregresivo clasico orientado a texto libre, sino que produce una probabilidad para cada opcion permitida de cada pregunta definida en el esquema (tipos choice, score y noul). En lugar de generar una respuesta secuencial, evalua el estado contra el conjunto de opciones en un solo paso hacia delante. No se dispone en la informacion proporcionada de detalles sobre el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO en el modelo original.

## Capacidades

- Decision estructurada multimodal: acepta como estado texto, JSON, imagenes (objetos PIL) o video (arrays de frames) y devuelve probabilidades por opcion.
- Preguntas tipadas: soporta al menos los tipos choice (eleccion entre criterios definidos), score (puntuacion sobre una escala de criterios) y noul (pregunta binaria tipo si/no o nula).
- Salida probabilistica: para cada pregunta devuelve una distribucion sobre las opciones permitidas, no una respuesta de texto abierta.
- Clasificacion y enrutamiento: adecuado para tareas de asignacion a categorias, como derivar un mensaje al departamento correspondiente.
- Multimodalidad de entrada: manejo conjunto de texto e imagen, y de video mediante frames.
- Extraccion de decisiones a partir de documentos: puede evaluar si un total de un recibo es legible u otras comprobaciones sobre imagenes.
- No es un modelo conversacional ni de generacion de texto libre: no soporta chat, ni se documenta tool calling, function calling, agentes ni modo de razonamiento explicito en la informacion disponible.
- Capacidades multilingues: no disponibles.

## Casos de uso

- Enrutamiento de tickets de soporte: el modelo clasifica un mensaje entrante definiendo preguntas de tipo choice (por ejemplo, departamento) y score (urgencia), devolviendo probabilidades que un sistema posterior puede usar para asignar el ticket al equipo correcto.
- Deteccion de incidencias criticas: con una pregunta de tipo noul ("¿esta caido algun servicio?") y una escala de urgencia, permite priorizar automaticamente alertas que describen fallos como el bloqueo de un checkout.
- Validacion de documentos en imagen: dado un recibo o factura junto con preguntas binarias (por ejemplo, si el importe total es legible), el modelo devuelve la probabilidad de cada opcion para decidir si el documento supera una validacion automatica antes de pasar a revision humana.
- Moderacion y triaje de contenido multimodal: evaluar imagenes o video frente a preguntas definidas por esquema para clasificar contenido en categorias preestablecidas sin generar texto libre.
- Automatizacion de back office con JSON: procesar registros estructurados (estados en JSON) y emitir decisiones categorizadas sobre campos concretos, integrándose en pipelines de datos que consumen probabilidades en lugar de texto.
- Prototipado local en Apple Silicon: gracias a la cuantizacion 4-bit y al cargador MLX, permite iterar sobre disenos de esquemas y preguntas en un Mac sin depender de GPUs dedicadas ni de Torch.
- Sistemas de decision explicita con umbral de confianza: al devolver probabilidades, permite fijar umbrales y derivar a revision humana los casos con baja confianza, algo util en flujos de aprobacion.

## Benchmarks y rendimiento

Se presentan unicamente los datos de paridad frente a la implementacion oficial en PyTorch (bf16) incluidos en la model card de esta cuantizacion. No se incluyen resultados de benchmarks estandar como MMLU, HumanEval o GSM8K en la informacion disponible.

| Entradas | Coincidencia en la respuesta principal | Delta maximo absoluto de probabilidad |
|---|---|---|
| Texto (4 registros, 10 preguntas) | 10/10 | 0,029 |
| Imagenes + video (5 registros, 9 preguntas) | 9/9 | 0,119 |

Estas cifras corresponden a una comprobacion puntual medida en un M5 Max (128 GB) y no a una ejecucion completa de benchmark, tal como advierte la propia model card.

## Requisitos de hardware

- Almacenamiento: el repositorio ocupa aproximadamente 6,2 GB, coherente con pesos de 9,4B en 4 bits mas componentes en bf16.
- Entorno de ejecucion: MLX esta disenado para Apple Silicon; requiere un Mac con chip de la serie M.
- Memoria unificada: la paridad se midio en un M5 Max con 128 GB. Con 4 bits, es razonable esperar que quepa en equipos Apple Silicon con memoria unificada de gama alta, aunque no se proporcionan cifras minimas oficiales.
- GPU dedicadas (A100, H100, RTX 4090): no aplicables a este formato MLX; no se documentan requisitos para CUDA en esta ficha.
- Opciones de despliegue: el cargador especifico `clef_mlx.py` incluido en el repositorio, invocando el backbone y la cabeza de esquema conjuntamente.
- Advertencia de despliegue: cargarlo con `mlx_vlm.generate`, `mlx_lm.generate` o LM Studio produce texto sin sentido, porque esas herramientas cargan el backbone sin la cabeza de esquema.
- Dependencias: `pip install mlx-vlm huggingface_hub`, sin necesidad de Torch.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mlx-community/clef-flash-4bit | 9,4B | 4 bits (MLX) | no disponible | Apache-2.0 | HuggingFace (MLX) |
| Cloudflare/clef-flash (original) | no disponible | bf16 | no disponible | Apache-2.0 | HuggingFace |
| Otros modelos de decision estructurada comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparacion directa mas relevante es con el modelo base Cloudflare/clef-flash en bf16, del que esta version es una cuantizacion. No se dispone de informacion sobre otros modelos de la misma categoria (decision estructurada multimodal con esquema de preguntas tipadas) para establecer una comparativa de rendimiento adicional.

## Limitaciones y advertencias

- No es un modelo de chat: usarlo con herramientas de generacion estandar (`mlx_vlm.generate`, `mlx_lm.generate`, LM Studio) produce texto sin sentido porque solo se carga el backbone.
- Requiere el cargador propietario `clef_mlx.py` para ejecutar la cabeza de esquema conjunta; no es un drop-in de modelos MLX convencionales.
- La evaluacion de paridad es una comprobacion puntual (4 registros de texto y 5 de imagen/video) en un M5 Max, no un benchmark exhaustivo; el delta maximo de probabilidad en el caso multimodal alcanza 0,119.
- Dependencia del ecosistema Apple Silicon: el formato MLX limita su uso a equipos Apple, no a GPUs NVIDIA.
- Idiomas soportados no declarados: no se puede garantizar cobertura multilingue.
- Longitud de contexto no disponible: limita la planificacion de casos con estados extensos.
- Riesgo de clasificacion erronea en preguntas con opciones ambiguas o estados ruidosos; al devolver probabilidades, conviene fijar umbrales y derivar los casos de baja confianza.
- No se documentan sesgos especificos del modelo en la informacion disponible.
- Datos de entrenamiento (tokens, dataset, RLHF/DPO) no disponibles para este repositorio.
- Licencia Apache-2.0: permite uso comercial, pero el modelo base Cloudflare/clef-flash mantiene la misma licencia, por lo que conviene revisar sus terminos originales.
- La cuantizacion 4-bit introduce una degradacion pequena pero medible frente a bf16, especialmente en entradas multimodales.

## Enlaces

- HuggingFace (esta cuantizacion): https://huggingface.co/mlx-community/clef-flash-4bit
- Modelo base en HuggingFace: https://huggingface.co/Cloudflare/clef-flash
- Documentacion de Cloudflare sobre clef-flash: https://developers.cloudflare.com/workers-ai/models/clef-flash/
- Perfil de la comunidad MLX: https://huggingface.co/mlx-community
- Sitio de la comunidad MLX: https://mlxcommunity.com/
