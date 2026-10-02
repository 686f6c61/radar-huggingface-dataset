# RunningHubAI/rh-black-multiple-people-lora

## Resumen

rh-black-multiple-people-lora es un adaptador LoRA (Low-Rank Adaptation) para edicion y generacion de imagen por texto, publicado por la plataforma RunningHub bajo la cuenta RunningHubAI. Se distribuye como un unico fichero de pesos de 1790 MiB (aproximadamente 1,75 GiB) denominado `blacked-krea2-step00003000.safetensors`, pensado para cargarse sobre el modelo base krea2 dentro de flujos de trabajo de ComfyUI o en la propia plataforma RunningHub. El adaptador esta orientado a representar personas de piel oscura y a componer escenas con varias personas simultaneamente.

A diferencia de un modelo fundacional, este repositorio no contiene un modelo completo con tokenizador, configuracion de arquitectura ni pipeline de inferencia: es un conjunto de pesos delta que modifica el comportamiento de un modelo de difusion subyacente. Esto implica que no tiene parametros propios en el sentido habitual, ni contexto de texto, ni capacidades de razonamiento, codigo o tool calling; todas esas funciones dependen del modelo base sobre el que se aplique.

El modelo es relevante dentro de un nicho muy concreto: la personalizacion de generadores de imagen para mejorar la representacion de diversidad etnica y de composiciones multitudinarias sin necesidad de reentrenar el modelo completo. Su utilidad practica esta limitada por la ausencia de documentacion: no se publican trigger words, dataset de entrenamiento, rango de LoRA, licencia explicita ni resultados de evaluacion, por lo que su adopcion en produccion requiere validacion propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre un modelo de difusion de imagen base krea2; arquitectura del base no detallada en la informacion disponible |
| Parametros totales | no disponible (fichero de pesos de 1790 MiB; numero de parametros no declarado) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de imagen condicionado por prompt de texto) |
| Tipos de cuantizacion | no disponible (se distribuye en safetensors, presumiblemente fp16/bf16; se puede cuantizar a fp8 o GGUF segun el soporte del base, no confirmado por el autor) |
| Idiomas soportados | no disponible (los prompts de texto dependen del codificador de texto del modelo base) |
| Licencia | no disponible; la model card indica que RunningHub publica en nombre del autor y que el copyright permanece en el autor, remitiendo a la licencia del proyecto original o upstream |
| Formato de pesos | safetensors (`blacked-krea2-step00003000.safetensors`, 1790 MiB) |

## Arquitectura y entrenamiento

La informacion disponible describe el artefacto como un LoRA de edicion de imagen, entrenado a partir del modelo krea2, con la indicacion "Finetuned from: krea2" en la model card. El nombre del fichero (`blacked-krea2-step00003000`) sugiere que el checkpoint corresponde al paso 30000 de un entrenamiento realizado en la infraestructura de RunningHub, que ofrece servicio de entrenamiento de modelos. No se especifica el rango del LoRA, la dimension de las matrices de bajo rango, las capas objetivo (attention, cross-attention, MLP), la tasa de aprendizaje, el optimizador ni el numero de imagenes o pasos totales del dataset.

Tampoco se documenta la composicion del dataset de entrenamiento, si hubo tecnicas de regularizacion como caption dropout o prior preservation, ni si se empleo algun tipo de ajuste por preferencias humanas. El unico dato funcional declarado es la referencia al modelo original en CivitAI y una descripcion breve en chino que indica que el adaptador introduce "elementos de personas negras" y admite "multiples personas". Al no publicarse trigger word ni plantilla de prompt, el uso correcto del adaptador debe determinarse por prueba y error sobre el modelo base.

## Capacidades

- Generacion de imagenes condicionada por texto, heredada del modelo base krea2, con sesgo aprendido hacia personas de piel oscura.
- Composicion de escenas con varias personas en una misma imagen, que es la funcion declarada explicitamente por el autor.
- Edicion de imagen de referencia (el pipeline declarado es image-text-to-image), es decir, transformacion de una imagen de entrada guiada por prompt.
- Integracion en flujos de ComfyUI mediante nodos de carga de LoRA, y en la plataforma RunningHub como modelo publico.
- No dispone de tool calling, function calling, uso como agente ni razonamiento multi-paso.
- No dispone de capacidades de codigo, matematicas, vision analitica ni procesamiento de audio.
- Capacidades multilingues: no disponibles; la comprension del prompt depende del codificador de texto del modelo base.
- No se declara modo de pensamiento (thinking mode) ni ningun mecanismo especial de inferencia.

## Casos de uso

- Ilustracion editorial y prensa: generar imagenes de actualidad o reportaje con diversidad etnica realista dentro de ComfyUI, encadenando el LoRA al modelo base krea2 y un prompt descriptivo de la escena; util para medios que necesitan material grafico sin depender de banco de imagenes.
- Publicidad y comunicacion inclusiva: producir campanas con grupos de personas de distintos tonos de piel en una sola imagen, aprovechando la capacidad declarada de componer varias personas sin que el modelo las fusione o degrade los rasgos.
- Concept art y preproduccion audiovisual: generar bocetos de reparto y composicion de personajes para storyboards de cine o series, iterando rapidamente sobre vestuario, iluminacion y encuadre antes de la fase de casting.
- Diseño de personajes para videojuegos: crear variaciones de personajes secundarios de un mismo universo narrativo con coherencia estetica, usando el LoRA en combinacion con embeddings o LoRAs de estilo para fijar la direccion artistica.
- Generacion de datasets sinteticos de rostro y figura humana: producir material de entrenamiento balanceado en diversidad etnica para otros modelos de vision, con la advertencia de que el dataset resultante hereda los sesgos y limitaciones del generador.
- Ilustracion para moda y producto: crear escenas con varios modelos mostrando una coleccion, donde el adaptador ayuda a evitar la sobrerrepresentacion de un unico tono de piel en las composiciones generadas por el base.
- Prototipado rapido en RunningHub: usar el modelo publico directamente desde la plataforma o su API para validar ideas visuales sin montar infraestructura local, siempre que se acepten las condiciones de uso del servicio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

No existen metricas objetivas declaradas por el autor: no hay FID, CLIP score, evaluacion de alineacion prompt-imagen, ni comparativas cuantitativas con otros adaptadores. La unica referencia de rendimiento es el numero de paso del checkpoint (30000), que no es una metrica de calidad.

## Requisitos de hardware

- El adaptador en si ocupa 1790 MiB en disco, pero su VRAM efectiva es la del modelo base krea2 mas el coste del adaptador; no se publican requisitos oficiales.
- Estimacion orientativa basada en la familia del modelo base (no confirmada por el autor): inferencia en fp16 en torno a 20-24 GB de VRAM; en fp8 alrededor de 12-16 GB; con cuantizaciones GGUF de la comunidad, potencialmente en el rango de 8-12 GB.
- GPU profesionales recomendadas para fp16: NVIDIA A100 40/80 GB, H100, L40S o A6000. Para fp8 o cuantizado, una RTX 4090 de 24 GB es suficiente con margen.
- GPU de consumo: una RTX 4080/4090 (16-24 GB) deberia poder ejecutar el modelo base cuantizado; en tarjetas de 8-12 GB el uso depende de cuantizacion agresiva y de la resolucion de salida, y no esta garantizado.
- Opciones de despliegue: ComfyUI (via nodos de carga de LoRA), la propia plataforma RunningHub y su API, y en principio cualquier runtime compatible con el formato de pesos del modelo base (por ejemplo Diffusers o comfyui con backend GGUF), siempre que el base krea2 sea soportado.
- Latencia y throughput: no disponibles. Dependen por completo del modelo base, de la GPU y del numero de pasos de muestreo, y el autor no publica ninguna medicion.

## Comparativa con modelos similares

No disponible. No se conocen en la informacion proporcionada adaptadores LoRA comparables de los que se puedan extraer parametros, contexto o rendimiento verificables, y tampoco se publican datos del propio modelo que permitan una comparacion cuantitativa.

| Modelo | Base | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| rh-black-multiple-people-lora | krea2 | no disponible (1790 MiB en safetensors) | no aplica | no disponible | Hugging Face y RunningHub |
| Alternativas comparables (otros LoRA de diversidad etnica sobre la misma familia) | no disponible | no disponible | no aplica | no disponible | no disponible |

Una comparacion rigurosa requeriria, como minimo, el rango del LoRA, la resolucion de entrenamiento, el numero de imagenes del dataset y una evaluacion prompt-imagen con el mismo conjunto de prompts sobre el mismo modelo base, datos que no se han publicado.

## Limitaciones y advertencias

- Sesgos conocidos: el adaptador esta diseñado especificamente para sesgar la generacion hacia personas de piel oscura y escenas multitudinarias; puede provocar sobrerrepresentacion del rasgo en prompts donde no se solicita y reducir la diversidad de resultados si se aplica con pesos elevados.
- Riesgo de alucinacion visual: como todo modelo de difusion, puede generar anatomia incorrecta, manos deformes, fusion de cuerpos o rostros inconsistentes, especialmente al componer varias personas en el mismo encuadre.
- Contenido sensible: la referencia original en CivitAI y el nombre del adaptador apuntan a un uso orientado a contenido para adultos. Es responsabilidad del usuario cumplir la legislacion aplicable, las politicas de la plataforma y los requisitos de moderacion si lo despliega en un servicio publico.
- Ausencia de trigger word documentada: sin ella, la reproducibilidad de resultados en produccion es baja y obliga a calibrar el peso del LoRA y el prompt manualmente.
- Licencia no disponible: la model card no concede una licencia explicita y remite a la del proyecto original o upstream. No hay garantia de permisos para uso comercial, por lo que se recomienda contactar con el autor antes de integrarlo en un producto.
- Idiomas y contexto: al no tener contexto propio ni idiomas declarados, cualquier limitacion de longitud o idioma del prompt proviene del codificador de texto del modelo base, no documentado aqui.
- Ausencia total de evaluacion: sin benchmarks ni validacion por terceros, no hay evidencia publica de que el adaptador mejore la fidelidad o la coherencia frente al modelo base sin el.
- Trazabilidad limitada: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta y fue creado y actualizado con dos minutos de diferencia, lo que sugiere una publicacion automatizada de la plataforma mas que un proyecto con mantenimiento activo.

## Enlaces

- Hugging Face: https://huggingface.co/RunningHubAI/rh-black-multiple-people-lora
- Modelo original en RunningHub: https://www.runninghub.ai/model/public/2074701525955465218
- Pagina del autor en RunningHub: https://www.runninghub.ai/user-center/2041030036219498497
- Referencia original en CivitAI: https://civitai.red/models/2762443/blacked?modelVersionId=3108990
- Plataforma RunningHub: https://www.runninghub.ai
- RunningHub (China): https://www.runninghub.cn
- Documentacion de la API de RunningHub (EN): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentacion de la API de RunningHub (CN): https://www.runninghub.cn/runninghub-api-doc-cn/
- Entrenamiento de modelos en RunningHub: https://www.runninghub.ai/page-model
- README en chino incluido en el repositorio: README_cn.md
- Resultados de busqueda web: no se han encontrado enlaces relevantes al modelo. Las consultas devolvieron exclusivamente sitios de video para adultos sin relacion tecnica con este adaptador, por lo que no se incluyen.
