# kisersantine/stephanie

## Resumen

`kisersantine/stephanie` es un adaptador LoRA de tipo DreamBooth para generacion de imagenes a partir de texto, entrenado sobre el modelo base `krea/Krea-2-Raw` y pensado para su uso con el modelo destilado `krea/Krea-2-Turbo`. Lo publica el usuario `kisersantine` en Hugging Face bajo licencia Apache 2.0. Su funcion es introducir un concepto concreto, invocado mediante el token de activacion `Stephanie`, en el espacio latente de Krea 2, de modo que el modelo base genere representaciones coherentes de ese concepto en estilos y escenas arbitrarias.

El repositorio tiene un tamano de 1,0 GB, lo que es consistente con un conjunto de pesos LoRA (mas los ficheros de muestra y metadatos) sobre un modelo base de difusion. La model card documenta tres ejemplos de generacion con el LoRA aplicado sobre Krea 2 Turbo a 8 pasos de inferencia y `guidance_scale=0.0`, lo que indica que el adaptador esta calibrado para el regimen de muestreo rapido del modelo destilado.

La relevancia de esta ficha es acotada: se trata de un adaptador de concepto de autor individual, con cero descargas y cero likes en el momento de la consulta, sin benchmarks publicados ni documentacion sobre el dataset de entrenamiento. Es util como ejemplo del flujo de trabajo LoRA sobre la familia Krea 2 y como pieza reutilizable para quien quiera incorporar el concepto `Stephanie` en sus pipelines de `diffusers`, pero no debe evaluarse como un modelo fundacional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre modelo de difusion text-to-image Krea 2; no se especifica la arquitectura interna del modelo base |
| Parametros totales | no disponible (no se declara el rango ni el numero de modulos adaptados) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo text-to-image); no disponible la longitud maxima del prompt |
| Tipos de cuantizacion | no disponible; el ejemplo de uso emplea `torch.bfloat16` |
| Idiomas soportados | no disponible (el prompt de ejemplo esta en ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | pesos LoRA compatibles con `diffusers` (`load_lora_weights`); no se detalla el formato de fichero exacto (safetensors u otro) |

## Arquitectura y entrenamiento

El artefacto es un LoRA de tipo DreamBooth sobre `krea/Krea-2-Raw`, segun declara el autor en la model card. DreamBooth es una tecnica de ajuste fino personalizado que asocia un token raro o unico (aqui `Stephanie`) a un concepto concreto a partir de un conjunto reducido de imagenes de referencia; el uso de LoRA implica que solo se entrenan matrices de bajo rango inyectadas en las capas del modelo base, dejando congelados los pesos originales. Esto explica el tamano de repositorio de 1,0 GB, muy inferior al de un modelo de difusion completo.

No se proporciona informacion sobre el numero de imagenes del dataset, la resolucion de entrenamiento, el rango del LoRA, la tasa de aprendizaje, el numero de pasos ni si se aplicaron tecnicas de regularizacion o de aumento de datos. Tampoco se documenta si el entrenamiento se realizo sobre Krea 2 RAW y se valido sobre Turbo, aunque la model card afirma que el LoRA se entreno en RAW y se muestra en Turbo, lo que sugiere una transferencia directa del adaptador entre ambas variantes. Las muestras publicadas se generaron con Krea 2 Turbo a 8 pasos y `guidance_scale=0.0`, un regimen propio de modelos destilados por destilacion de trayectoria.

## Capacidades

- Generacion de imagenes a partir de descripciones textuales en ingles, condicionada por el token de activacion `Stephanie`.
- Personalizacion de concepto: permite representar el concepto aprendido en escenas, estilos y encuadres arbitrarios (los ejemplos cubren estetica cyberpunk, pintura al oleo renacentista y ciencia ficcion espacial).
- Compatibilidad con el ecosistema `diffusers` mediante `Krea2Pipeline` y `load_lora_weights`.
- Inferencia rapida en combinacion con Krea 2 Turbo (8 pasos en los ejemplos documentados).
- No soporta tool calling, function calling, razonamiento multi-paso ni agentes: es un modelo generativo de imagen, no un modelo de lenguaje.
- Capacidades multilingues: no documentadas; los prompts de ejemplo estan en ingles.
- No se declaran capacidades de vision, audio, thinking mode ni control estructural (ControlNet, inpainting, etc.).

## Casos de uso

- Prototipado de personajes para narrativa visual: usar el token `Stephanie` para generar variaciones consistentes del personaje en distintos entornos (interiores, exteriores, epocas historicas) y construir un storyboard preliminar sin reentrenar el modelo base.
- Ilustracion de articulos y blog posts: generar imagenes de acompanamiento con una identidad visual recurrente, aprovechando que el LoRA se aplica sobre Krea 2 Turbo y permite iterar a 8 pasos por imagen.
- Pruebas de concepto en estudios de diseno: evaluar como se comporta un concepto personalizado bajo estilos radicalmente distintos (oleo, render cinematografico, ilustracion espacial) antes de invertir en un pipeline de produccion.
- Docencia y divulgacion sobre LoRA y DreamBooth: el repositorio sirve como ejemplo minimo y reproducible de adaptador de concepto sobre Krea 2, con codigo de uso incluido en la model card.
- Generacion de material para maquetas y presentaciones: crear imagenes de relleno con coherencia de personaje para prototipos de interfaz o pitch decks, dado que la licencia Apache 2.0 facilita su uso interno.
- Base para ajustes posteriores: al ser un LoRA de bajo rango sobre Krea 2, puede combinarse o sustituirse por otros adaptadores en experimentos de composicion de LoRAs, siempre que el pipeline lo permita.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas objetivas (FID, CLIP score, similitud de concepto) ni comparaciones cuantitativas con otros adaptadores.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita. El adaptador anade una sobrecarga pequena sobre el modelo base Krea 2; el requisito dominante es el de Krea 2 Turbo en `bfloat16`, que no se detalla en la informacion proporcionada.
- GPU recomendadas: no disponibles. El ejemplo de la model card usa `.to("cuda")` sin especificar modelo de GPU.
- Compatibilidad con GPU de consumo: no confirmada; depende enteramente de los requisitos de Krea 2 Turbo, no documentados aqui.
- Opciones de despliegue: `diffusers` con `Krea2Pipeline` y `load_lora_weights` (unico metodo documentado). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a modelos de difusion de imagen en este contexto.
- Latencia y throughput: no disponibles. Solo se indica que las muestras se generaron con 8 pasos de inferencia y `guidance_scale=0.0`.

## Comparativa con modelos similares

| Modelo | Tipo | Modelo base | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| kisersantine/stephanie | LoRA DreamBooth text-to-image | krea/Krea-2-Raw | no disponible | no aplica | Apache 2.0 | Hugging Face (0 descargas) |
| kisersantine/laurab | LoRA text-to-image (mismo autor) | no disponible en la informacion | no disponible | no aplica | no disponible | Hugging Face |
| krea/Krea-2-Raw | Modelo base text-to-image | no aplica | no disponible | no disponible | no disponible en la informacion | Hugging Face |
| krea/Krea-2-Turbo | Modelo base destilado text-to-image | Krea 2 | no disponible | no disponible | no disponible en la informacion | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada; la comparativa se limita a tipo de artefacto, modelo base y licencia.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados. Al ser un adaptador de concepto entrenado sobre un modelo base opaco, hereda los sesgos de Krea 2, que no se detallan.
- Riesgo de alucinacion visual: como todo modelo de difusion, puede generar anatomias incorrectas, texto ilegible y detalles incoherentes, especialmente en escenas complejas o con multiples sujetos.
- Limitaciones de contexto e idioma: no se documenta el soporte multilingue; los ejemplos y el prompt de instancia estan en ingles, por lo que el comportamiento con prompts en castellano es desconocido.
- Restricciones de licencia: el adaptador se declara Apache 2.0, pero el uso comercial efectivo depende tambien de la licencia del modelo base Krea 2, que no se especifica en la informacion disponible y debe verificarse por separado.
- Caveats para produccion: cero descargas y cero likes en el momento de la consulta implican ausencia de validacion comunitaria; no hay benchmarks, no se documenta el dataset de entrenamiento ni el rango del LoRA, y el autor no ofrece garantias de calidad o consistencia del concepto.
- Dependencia de version: el codigo de ejemplo usa `Krea2Pipeline`, una clase que debe existir en la version de `diffusers` instalada; cambios en la API pueden romper la reproducibilidad.
- El token `Stephanie` es un nombre comun: prompts que lo contengan sin intencion de invocar el concepto pueden activar el adaptador de forma no deseada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kisersantine/stephanie
- Modelo base: https://huggingface.co/krea/Krea-2-Raw
- Modelo destilado usado en los ejemplos: https://huggingface.co/krea/Krea-2-Turbo
- Otro LoRA del mismo autor: https://huggingface.co/kisersantine/laurab
- Documentacion de `diffusers`: https://huggingface.co/docs/diffusers
