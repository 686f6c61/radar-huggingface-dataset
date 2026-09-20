# AiMamis/She-Hulk

## Resumen

She-Hulk es un adaptador LoRA de generacion de imagenes texto-a-imagen publicado por el usuario AiMamis en HuggingFace. No es un modelo de lenguaje ni un modelo de difusion completo: se trata de un ajuste fino de bajo rango que se monta sobre el modelo base krea/Krea-2-Turbo, del que hereda toda la arquitectura, el tokenizador de texto y el espacio latente. Su proposito es introducir un concepto visual concreto (el personaje She-Hulk con piel verde oscuro, pelo negro y ojos verde oscuro) sin necesidad de reentrenar el modelo completo.

El adaptador se activa mediante cuatro palabras clave en el prompt: `She-hulk`, `Deep green skin`, `Black hair` y `Dark green eyes`. El repositorio ocupa aproximadamente 0,5 GB, pesa muy poco en comparacion con un modelo de difusion completo y esta etiquetado con la libreria diffusers y la plantilla `template:diffusion-lora`.

En el momento de redactar esta ficha el repositorio registra 0 descargas y 0 likes, fue creado el 19 de septiembre de 2026 y no incluye documentacion tecnica sobre el dataset de entrenamiento, el rango del adaptador ni los hiperparametros utilizados. La busqueda web asociada no devolvio ningun resultado relevante sobre el modelo: los unicos enlaces recuperados son listados de estudios de diseno grafico en Israel, sin relacion alguna con este adaptador.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (low-rank adaptation) sobre un modelo base de difusion texto-a-imagen (krea/Krea-2-Turbo) |
| Parametros totales | no disponible (no se especifica el rango ni el numero de parametros del adaptador) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (generacion de imagen; el equivalente seria resolucion y pasos de muestreo, no especificados) |
| Tipos de cuantizacion | no disponible; al ser un LoRA, la cuantizacion efectiva la determina el modelo base sobre el que se monte |
| Idiomas soportados | no disponible; las palabras de activacion proporcionadas estan en ingles |
| Licencia | openrail++ |
| Formato de pesos | no disponible en la informacion proporcionada (libreria declarada: diffusers) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA, es decir, un conjunto de matrices de bajo rango que se inyectan en las capas del modelo base congelado. La arquitectura subyacente, el tipo de autoencoder latente, el text encoder y el scheduler corresponden integramente a krea/Krea-2-Turbo, que es el `base_model` declarado tanto en las etiquetas del repositorio como en la model card. No se documenta en que capas concretas se insertan los adaptadores, ni el rango (`rank`), ni el valor de `alpha`, ni la estrategia de entrenamiento empleada.

Tampoco se facilita informacion sobre el dataset: no se indica el numero de imagenes, su procedencia, si hubo regularizacion mediante imagenes de clase, ni si se aplicaron tecnicas como captioning automatico, ajuste de learning rate o entrenamiento con DreamBooth. La unica informacion funcional del entrenamiento son las cuatro cadenas de activacion que el autor declara como disparadoras del concepto, lo que sugiere un entrenamiento del tipo concepto unico con instance prompt fijo.

## Capacidades

- Generacion de imagenes texto-a-imagen condicionada por prompt, heredada del modelo base krea/Krea-2-Turbo.
- Reproduccion de un concepto visual especifico (personaje She-Hulk) cuando el prompt incluye las palabras de activacion `She-hulk`, `Deep green skin`, `Black hair` y `Dark green eyes`.
- Consistencia de personaje entre generaciones: al fijar el concepto en los pesos del adaptador, se reduce la variabilidad que tendria el mismo prompt con el modelo base sin adaptar.
- Combinacion con otros prompts de estilo, iluminacion o composicion del modelo base, ya que el LoRA solo anade un concepto y no sustituye al resto de la condicion textual.
- No dispone de tool calling, function calling, razonamiento multi-paso, agentes ni generacion de texto: no es un modelo de lenguaje.
- No se declaran capacidades de vision, audio, video ni edicion de imagen.
- No se declaran capacidades multilingues ni se especifica como responde ante prompts en castellano.

## Casos de uso

- Ilustracion de comics y fan art: el adaptador genera al personaje con los rasgos cromaticos fijados en las palabras de activacion, lo que permite producir paneles consistentes a lo largo de una serie de ilustraciones.
- Concept art para videojuegos: se pueden generar hojas de personaje y variaciones de vestuario manteniendo piel verde oscuro, pelo negro y ojos verde oscuro como constantes visuales.
- Storyboards y previz de animacion: al ser un LoRA ligero se puede iterar rapidamente sobre bocetos de escenas antes de encargar el trabajo definitivo a un ilustrador.
- Diseno de merchandising y material promocional: camisetas, posters o carteles para eventos de cultura pop donde se requiera una figura de superheroina con esta paleta concreta.
- Retratos para partidas de rol de mesa: los jugadores pueden generar retratos de su personaje con el aspecto definido por el adaptador para usarlos en fichas y tableros virtuales.
- Pruebas de investigacion sobre LoRA: sirve como caso de estudio de como un adaptador de concepto unico modifica el comportamiento de un modelo base turbo sin reentrenarlo, util para comparar tecnicas de ajuste.
- Prototipado de campanas creativas: agencias y estudios pueden validar direcciones de arte con generaciones rapidas antes de invertir en produccion tradicional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas cuantitativas (FID, CLIP score, similitud de personaje ni comparaciones con otros adaptadores), y la busqueda web no aporto ningun dato de evaluacion.

## Requisitos de hardware

- La VRAM necesaria para la inferencia viene determinada por el modelo base krea/Krea-2-Turbo, cuyas especificaciones no se proporcionan en la informacion disponible.
- El adaptador en si anade una sobrecarga marginal de memoria: el repositorio completo ocupa aproximadamente 0,5 GB, un orden de magnitud por debajo de un modelo de difusion completo.
- No se puede confirmar si el modelo base cabe en GPU de consumo (RTX 3060, 4060, 4090) porque no se conocen su numero de parametros ni su resolucion nativa.
- Opciones de despliegue: al declararse la libreria diffusers, la via natural es cargar el modelo base con `DiffusionPipeline` y montar el adaptador con `load_lora_weights`. No se confirma compatibilidad con llama.cpp, Ollama, TGI ni vLLM, que ademas no aplican a modelos de difusion de imagen.
- No se publican datos de latencia, throughput ni numero de pasos de muestreo recomendado.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no identifica otros adaptadores LoRA comparables, ni variantes del mismo concepto, ni resultados que permitan situar este modelo frente a alternativas de la misma categoria. El unico punto de referencia objetivo es el modelo base declarado, krea/Krea-2-Turbo, que no es un modelo comparable sino la base sobre la que se monta el adaptador.

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AiMamis/She-Hulk | LoRA sobre Krea-2-Turbo | no disponible | no aplica | openrail++ | HuggingFace, 0 descargas |
| Alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- No se documenta el rango del LoRA, el dataset de entrenamiento ni los hiperparametros, lo que dificulta reproducir o auditar el adaptador.
- Las cuatro palabras de activacion estan en ingles; se desconoce su comportamiento con prompts en castellano u otros idiomas.
- Riesgo de sobreajuste al concepto: los LoRA de personaje suelen degradar la diversidad de poses, encuadres y estilos si el prompt no aporta variacion suficiente.
- Riesgo de arrastre de sesgos del modelo base, que no se puede evaluar porque no se aporta informacion sobre su dataset de entrenamiento.
- El personaje She-Hulk es propiedad intelectual de Marvel. La licencia openrail++ cubre los pesos del adaptador, pero no otorga derechos sobre la marca ni el personaje; el uso comercial de imagenes derivadas puede infringir derechos de terceros.
- La licencia openrail++ incluye clausulas de uso restringido que deben revisarse antes de cualquier despliegue en produccion.
- El repositorio tiene 0 descargas y 0 likes, sin validacion por parte de la comunidad ni imagenes de ejemplo verificables mas alla de la galeria declarada en la model card.
- No hay garantia de compatibilidad con interfaces de usuario de terceros ni de soporte a largo plazo por parte del autor.
- Al depender de un modelo base turbo, el resultado puede variar de forma notable segun el scheduler, el numero de pasos y el CFG utilizados, parametros que no se especifican.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/AiMamis/She-Hulk
- Archivos del repositorio: https://huggingface.co/AiMamis/She-Hulk/tree/main
- Modelo base declarado, Krea-2-Turbo: https://huggingface.co/krea/Krea-2-Turbo
- Licencia openrail++ (CreativeML Open RAIL++): https://huggingface.co/spaces/CompVis/stable-diffusion-license
- Documentacion de adaptadores LoRA en diffusers: https://huggingface.co/docs/diffusers/training/lora
- Busqueda web realizada: no se encontro ningun enlace relevante sobre el modelo. Los resultados devueltos corresponden a directorios de estudios de diseno grafico en Israel y no guardan relacion con este adaptador.
