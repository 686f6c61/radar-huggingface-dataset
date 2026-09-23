# beycanai/Qwen-LLM

## Resumen

`beycanai/Qwen-LLM` no es un unico modelo, sino un repositorio de recopilacion que distribuye ocho archivos `safetensors` en formato de un solo fichero para ComfyUI, correspondientes a codificadores de texto (text encoders) basados en la familia Qwen. En concreto, agrupa el modelo Qwen3.5-9B y el modelo multimodal Qwen3-VL-8B-Instruct, cada uno en su version oficial y en una version "abliterated" (sin mecanismos de rechazo), y cada variante en dos precisiones: BF16 e INT8 ConvRot. El objetivo declarado es unificar la nomenclatura (`<nombre del modelo original>_<bf16|int8_convrot>.safetensors`) y facilitar la carga de estos codificadores en flujos de trabajo de ComfyUI a traves del nodo `CLIPLoader`.

El repositorio es relevante porque proporciona conversiones INT8 de dos modelos que, en BF16, ocupan entre 17,5 y 19,5 GB de VRAM, reduciendo el consumo a aproximadamente 10 GB mediante cuantizacion INT8 ConvRot. Ademas, incluye variantes abliterated que eliminan las frases de rechazo del modelo oficial, un aspecto que el propio autor documenta con mediciones de comportamiento sobre contenido adulto. Se trata de un artefacto de despliegue, no de un entrenamiento nuevo: seis de los ocho archivos son re-subidas identicas byte a byte de materiales publicados por otros autores y solo dos son conversiones realizadas en este repositorio.

El repositorio ocupa 113 GB, se publico el 22 de septiembre de 2026 bajo licencia Apache-2.0 y registra 0 descargas y 0 "likes" en el momento de la consulta. La model card esta truncada en la informacion disponible, por lo que algunos detalles de la seccion de Qwen3.5-9B quedan incompletos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (se infiere transformer de la familia Qwen3.5 / Qwen3-VL, no confirmado en la informacion) |
| Parametros totales | 9B (Qwen3.5-9B) y 8B (Qwen3-VL-8B-Instruct) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 e INT8 ConvRot |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (archivo unico en layout ComfyUI) |

Archivos incluidos en el repositorio:

| Archivo | Modelo original | Autor de la conversion/re-subida | Tamano (bytes) |
|---|---|---|---|
| `Qwen3.5-9B_bf16.safetensors` | Qwen3.5-9B | Comfy-Org (re-subida) | 19.306.312.328 |
| `Qwen3.5-9B_int8_convrot.safetensors` | Qwen3.5-9B | conversion propia | 9.957.667.548 |
| `Qwen3.5-9B-abliterated_bf16.safetensors` | Qwen3.5-9B-abliterated | wangzhang (re-subida) | 18.819.722.392 |
| `Qwen3.5-9B-abliterated_int8_convrot.safetensors` | Qwen3.5-9B-abliterated | conversion propia | 9.471.076.556 |
| `Qwen3-VL-8B-Instruct_bf16.safetensors` | Qwen3-VL-8B-Instruct | Comfy-Org (re-subida) | 17.534.334.616 |
| `Qwen3-VL-8B-Instruct_int8_convrot.safetensors` | Qwen3-VL-8B-Instruct | Comfy-Org (re-subida) | 9.350.798.360 |
| `Qwen3-VL-8B-Instruct-abliterated_bf16.safetensors` | Qwen3-VL-8B-Instruct abliterated (Heretic 1.3.0) | DreamFast (re-subida) | 17.534.334.584 |
| `Qwen3-VL-8B-Instruct-abliterated_int8_convrot.safetensors` | Qwen3-VL-8B-Instruct abliterated (Heretic 1.3.0) | craftingmod (re-subida) | 10.979.853.342 |

## Arquitectura y entrenamiento

No se dispone de informacion sobre el entrenamiento de los modelos subyacentes en los materiales proporcionados. El repositorio no documenta el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO. Tampoco describe innovaciones de arquitectura mas alla de la pertenencia a las familias Qwen3.5 y Qwen3-VL.

Lo que si documenta la model card es el proceso de conversion y empaquetado: los archivos se distribuyen en el layout de fichero unico de ComfyUI y la herramienta detecta automaticamente la arquitectura (Qwen3.5-9B o Qwen3-VL-8B) a partir de los pesos. Las variantes INT8 utilizan el esquema de cuantizacion denominado ConvRot, que requiere una version reciente de ComfyUI con soporte de comfy-kitchen para INT8 ConvRot. El autor indica que dos ficheros son conversiones propias y que los seis restantes conservan el mismo `sha256` que el objeto LFS de su repositorio de origen. La variante abliterated de Qwen3-VL corresponde a `DreamFast/Qwen3-VL-8B-Heretic-1.3.0`; el autor senala que este build mantiene una divergencia baja respecto al modelo oficial (KL 0,01 sobre texto no danino), mientras que otro build abliterated de Qwen3.5-9B que probaron divergia mucho mas (KL 0,25) y seguia aproximadamente la mitad de las instrucciones de formato, motivo por el que eligieron el build de wangzhang.

## Capacidades

- Codificacion de texto para flujos de generacion de imagen en ComfyUI mediante el nodo `Load CLIP` (`CLIPLoader`).
- Qwen3-VL-8B-Instruct incorpora capacidades de vision-lenguaje (procesamiento de imagenes junto a texto), segun su denominacion VL y las pruebas descritas sobre descripcion de fotografias.
- Generacion y expansion de texto: la model card menciona tareas de "describir fotos" y "expandir briefs de texto cortos".
- Seguimiento de instrucciones de formato: el autor indica que Qwen3-VL-8B sigue instrucciones de formato con mas fidelidad que Qwen3.5-9B.
- Control de contenido explicito en ambas direcciones: los modelos pueden omitir contenido explicito cuando se les instruye para ello; el build abliterated de Qwen3.5-9B lo hizo en 46 de 46 casos.
- Variantes abliterated sin frases de rechazo explicito para escenarios donde el modelo oficial rechaza la peticion.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Modo "thinking": no disponible.
- Capacidades de audio: no disponible.
- Capacidades multilingues: no disponible en la informacion proporcionada.

## Casos de uso

- Flujos de generacion de imagen en ComfyUI: cargar el fichero en `ComfyUI/models/text_encoders/` y enlazarlo con `CLIPLoader` seleccionando el tipo que use el workflow (por ejemplo `qwen_image`) para proporcionar la codificacion de texto al modelo de difusion.
- Despliegue en GPUs de gama consumer con VRAM limitada: la variante `int8_convrot` reduce el consumo a unos 10 GB, frente a los 18-19,5 GB de BF16, lo que permite ejecutar el codificador en tarjetas de 12-16 GB donde BF16 no cabria.
- Descripcion automatica de imagenes (image captioning) en preprocesado de datasets: el autor describe pruebas de descripcion de fotografias con Qwen3-VL-8B, lo que lo hace adecuado para etiquetar lotes de imagenes antes de entrenar modelos de difusion.
- Expansion de briefs cortos a prompts detallados: usar el modelo para transformar una descripcion breve en un prompt extenso para generacion de imagen, tarea que el autor cita explicitamente en sus pruebas.
- Pipelines que requieren seguimiento estricto de formato: Qwen3-VL-8B-Instruct es la opcion recomendada por el autor para workflows que dependen de que la salida respete una estructura concreta, dado que sigue instrucciones de formato mas fielmente.
- Escenarios con requisitos de moderacion inversos: las variantes abliterated permiten flujos donde el modelo oficial emite rechazos, y el autor documenta que las instrucciones funcionan en ambas direcciones (tambien se puede pedir omitir contenido).
- Seleccion entre velocidad y detalle: el autor indica que Qwen3-VL-8B-Instruct es aproximadamente un 20% mas rapido y escribe menos detalle explicito que Qwen3.5-9B, por lo que sirve para pipelines con restricciones de latencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks convencionales (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La model card si incluye una tabla de comportamiento observado sobre contenido adulto (decodificacion greedy, muestras pequenas; el autor advierte que diferencias de 2-3 casos son ruido), en tareas de descripcion de fotos y expansion de briefs de texto:

| Modelo | Rechazo explicito ("I cannot...") | Contenido explicito no solicitado (fotos / texto) | Contenido explicito solicitado de forma directa (fotos / texto) | Lo omite cuando se le pide |
|---|---|---|---|---|
| Qwen3.5-9B oficial | Si, 18 de 138 peticiones (INT8: 9), todas al describir fotos explicitas | 4% / 28% | 38% / 72% | 38 de 46 |
| Qwen3.5-9B-abliterated (wangzhang) | Nunca | 0% / 33% | 58% / 83% | 46 de 46 |
| Qwen3-VL-8B-Instruct oficial | Nunca | 8% / 28% | 25% / 39% | 43 de 46 |
| Qwen3-VL-8B-Instruct-abliterated (Heretic) | Nunca | 8% / 39% | 42% / 39% | 43 de 46 |

Datos adicionales aportados por el autor:
- Sobre contenido leve (trajes de bano, lenceria, poses provocativas; 780 peticiones) ningun modelo rechazo, pero entre un 15% y un 40% de las descripciones de fotos suavizaron lo mostrado, y la abliteracion no redujo ese comportamiento.
- Divergencia medida respecto al modelo oficial: el build Heretic de Qwen3-VL presenta KL 0,01 sobre texto no danino; otro build abliterated de Qwen3.5-9B probado presentaba KL 0,25 y seguia aproximadamente la mitad de las instrucciones de formato.
- Qwen3-VL-8B-Instruct es aproximadamente un 20% mas rapido que Qwen3.5-9B.

## Requisitos de hardware

- VRAM estimada, variantes BF16: 18-19,5 GB (rango indicado en la model card para los ficheros sin cuantizar).
- VRAM estimada, variantes INT8 ConvRot: alrededor de 10 GB en las pruebas del autor.
- GPU recomendadas: no disponibles de forma explicita. Los ficheros BF16 (17,5-19,5 GB) encajan en GPUs profesionales de 24 GB o mas (A100 40/80 GB, H100, RTX 3090/4090 24 GB al limite). Las variantes INT8, con unos 10 GB, son las adecuadas para GPUs consumer de 12-16 GB.
- Cabe en GPU consumer: si, las variantes INT8 en tarjetas de 12 GB o mas. Las BF16 solo en tarjetas de 24 GB (RTX 3090, RTX 4090) ajustando margen.
- Opciones de despliegue: ComfyUI, mediante el nodo `Load CLIP` (`CLIPLoader`). Las variantes INT8 requieren una version reciente de ComfyUI con soporte de comfy-kitchen para INT8 ConvRot.
- Latencia y throughput estimados: no disponibles, salvo la indicacion relativa de que Qwen3-VL-8B-Instruct es aproximadamente un 20% mas rapido que Qwen3.5-9B.
- Requisito de disco: el repositorio completo ocupa 113 GB.

## Comparativa con modelos similares

La comparacion mas directa disponible en la informacion proporcionada es entre las variantes incluidas en el propio repositorio:

| Variante | Parametros | Precision | Tamano del fichero | VRAM aprox. | Rechazos explicitos | Licencia |
|---|---|---|---|---|---|---|
| Qwen3.5-9B oficial | 9B | BF16 | 19,31 GB | 19-19,5 GB | Si (18/138) | Apache-2.0 |
| Qwen3.5-9B oficial | 9B | INT8 ConvRot | 9,96 GB | ~10 GB | Si (9/138) | Apache-2.0 |
| Qwen3.5-9B-abliterated | 9B | BF16 | 18,82 GB | 18-19 GB | Nunca | Apache-2.0 |
| Qwen3.5-9B-abliterated | 9B | INT8 ConvRot | 9,47 GB | ~10 GB | Nunca | Apache-2.0 |
| Qwen3-VL-8B-Instruct oficial | 8B | BF16 | 17,53 GB | 17,5-19 GB | Nunca | Apache-2.0 |
| Qwen3-VL-8B-Instruct oficial | 8B | INT8 ConvRot | 9,35 GB | ~10 GB | Nunca | Apache-2.0 |
| Qwen3-VL-8B-Instruct-abliterated (Heretic) | 8B | BF16 | 17,53 GB | 17,5-19 GB | Nunca | Apache-2.0 |
| Qwen3-VL-8B-Instruct-abliterated (Heretic) | 8B | INT8 ConvRot | 10,98 GB | ~10 GB | Nunca | Apache-2.0 |

Comparacion con alternativas externas de la misma categoria (text encoders para modelos de difusion en ComfyUI, como T5-XXL, CLIP-L o Llama-based encoders): no disponible en la informacion proporcionada.

## Limitaciones y advertencias

- La model card esta truncada en la informacion disponible: la seccion de Qwen3.5-9B queda incompleta, por lo que podrian faltar advertencias adicionales.
- Sesgos conocidos: no disponible. La unica medicion de comportamiento aportada se refiere a contenido adulto, con muestras pequenas y decodificacion greedy; el propio autor advierte que diferencias de 2-3 casos son ruido.
- Riesgo de alucinacion: no disponible. No hay evaluacion de fidelidad factual en los materiales proporcionados.
- Contenido explicito: los modelos abliterated no rechazan, pero tampoco generan contenido explicito de forma espontanea; lo omiten o lo suavizan cuando la instruccion no lo pide. Si la instruccion lo pide de forma explicita, todas las variantes lo generan. Esto tiene implicaciones directas de moderacion en produccion.
- Calidad tras abliteration: el autor documenta que la abliteracion puede degradar la calidad. Un build de Qwen3.5-9B distinto al incluido presentaba KL 0,25 y seguia aproximadamente la mitad de las instrucciones de formato; el build de wangzhang fue elegido precisamente por ser menos divergente.
- Restricciones de licencia: todo el material de origen esta bajo Apache-2.0, lo que permite uso comercial, pero conviene verificar la licencia de cada modelo original por separado antes de desplegarlo.
- Dependencia de version: los ficheros `_int8_convrot` requieren una version reciente de ComfyUI con soporte de comfy-kitchen para INT8 ConvRot; en versiones antiguas no funcionaran.
- Discrepancia de tamanos: el fichero `Qwen3-VL-8B-Instruct-abliterated_int8_convrot.safetensors` ocupa 10,98 GB, mas que los demas ficheros INT8 (9,35-9,96 GB), lo que sugiere un proceso de cuantizacion distinto realizado por otro autor (craftingmod). No se detalla la causa.
- Uso previsto: son codificadores de texto empaquetados para ComfyUI, no checkpoints de proposito general; no debe asumirse su comportamiento como modelo de chat autonomo.
- Procedencia: seis de los ocho ficheros son re-subidas identicas de otros autores; solo dos son conversiones propias. El mantenimiento y la actualizacion de esos artefactos dependen de terceros.

## Enlaces

- Repositorio de HuggingFace: https://huggingface.co/beycanai/Qwen-LLM
- Comfy-Org/Qwen3.5 (origen del empaquetado ComfyUI): https://huggingface.co/Comfy-Org/Qwen3.5
- Qwen/Qwen3.5-9B: https://huggingface.co/Qwen/Qwen3.5-9B
- Qwen/Qwen3-VL-8B-Instruct: https://huggingface.co/Qwen/Qwen3-VL-8B-Instruct
- wangzhang/Qwen3.5-9B-abliterated: https://huggingface.co/wangzhang/Qwen3.5-9B-abliterated
- DreamFast/Qwen3-VL-8B-Heretic-1.3.0: https://huggingface.co/DreamFast/Qwen3-VL-8B-Heretic-1.3.0

Nota: los resultados de la busqueda web realizada no contenian informacion relevante sobre el modelo; solo devolvieron paginas genericas de servicios de Google no relacionados con este repositorio. No se han encontrado papers, blogs ni demos adicionales.
