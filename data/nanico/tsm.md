# Nanico/tsm

## Resumen

`Nanico/tsm` es un LoRA de tipo DreamBooth para el modelo de difusion texto-a-imagen Krea 2, entrenado sobre el checkpoint base `krea/Krea-2-Raw` y pensado para usarse en inferencia sobre la variante destilada `krea/Krea-2-Turbo`. Lo publica el usuario Nanico en Hugging Face bajo licencia Apache 2.0 y con la libreria `diffusers` como via de integracion. No es un modelo fundacional autonomo: es un adaptador de bajo rango que modifica el comportamiento estilistico del modelo base al invocar el token disparador `tsm`.

El adaptador esta disenado para inyectar un concepto o estilo concreto (las muestras de la model card apuntan a una estetica cinematografica y atmosferica: iluminacion cinematografica, planos amplios etéreos, estilo de libro de cuentos en tonos pastel) mediante la palabra clave `tsm` insertada en el prompt. El repositorio ocupa 0,8 GB, coherente con un LoRA de rango moderado sobre un modelo de difusion moderno, y no incluye pesos completos del modelo base.

La relevancia practica es la habitual de los LoRA de estilo: permiten personalizar la generacion de imagenes con un coste de almacenamiento y de entrenamiento muy bajo, manteniendo la calidad del modelo base y pudiendo combinarse con otras tecnicas (otros LoRA, control de composicion, etc.). La informacion publicada es escasa: no hay datos de entrenamiento, hiperparametros, benchmarks ni idiomas declarados, por lo que muchas especificaciones quedan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre un modelo de difusion texto-a-imagen Krea 2; no se detalla la arquitectura interna del modelo base |
| Parametros totales | no disponible (el repositorio ocupa 0,8 GB, pero no se especifica el numero de parametros del adaptador ni del base) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo texto-a-imagen; no se especifica longitud maxima de prompt) |
| Tipos de cuantizacion | no disponible (la model card solo muestra uso en `bfloat16`) |
| Idiomas soportados | no disponible (la model card no declara idiomas; los prompts de ejemplo estan en ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | pesos compatibles con `diffusers` (carga via `pipe.load_lora_weights`); no se especifica si incluye safetensors, aunque el tamano de 0,8 GB es consistente con un adaptador LoRA en ese formato |

## Arquitectura y entrenamiento

El adaptador es un LoRA de tipo DreamBooth, segun declara el autor en la model card. Se entrena sobre `krea/Krea-2-Raw` y se muestra en inferencia sobre `krea/Krea-2-Turbo`, la variante destilada del modelo base. La model card no detalla el rango del LoRA, las capas objetivo, el numero de pasos de entrenamiento, el dataset utilizado, la resolucion de entrenamiento ni si se aplicaron tecnicas de regularizacion o de aumento de datos. Tampoco se indica si el entrenamiento uso optimizadores especificos (por ejemplo, AdamW de 8 bits), precision mixta o tecnicas como LoRA con descomposicion (LoHa, LoKr).

La unica innovacion tecnica documentada es el uso de un token disparador dedicado, `tsm`, que activa el concepto aprendido. Las muestras publicadas se generaron sobre Krea 2 Turbo con 8 pasos de inferencia y `guidance_scale=0.0`, lo que refleja el regimen de muestreo tipico de los modelos destilados (pocos pasos, sin clasificador libre de guia). No hay informacion sobre la composicion del dataset de entrenamiento ni sobre posibles sesgos introducidos por el mismo.

## Capacidades

- Generacion de imagenes texto-a-imagen condicionada por el token `tsm`, que activa el concepto o estilo aprendido por el LoRA.
- Aplicacion de estilos visuales concretos segun las muestras: iluminacion cinematografica, planos amplios etéreos y estetica de libro de cuentos en tonos pastel.
- Composicion con el modelo base Krea 2 Turbo en regimen de pocos pasos (8 pasos en los ejemplos) y sin guia de clasificador (`guidance_scale=0.0`).
- Compatibilidad con la API de `diffusers` mediante `load_lora_weights`, lo que permite cargarlo sobre un pipeline ya instanciado.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, vision, audio ni modo thinking; son capacidades no aplicables a un adaptador de generacion de imagenes.
- Capacidades multilingues: no documentadas; los prompts de ejemplo estan en ingles y no se declara soporte de otros idiomas.

## Casos de uso

- Ilustracion editorial y conceptual: usar el token `tsm` para generar imagenes de portada o ilustraciones interiores con una estetica cinematografica coherente, aprovechando la ventana de 8 pasos de Krea 2 Turbo para iterar rapidamente sobre variaciones de prompt.
- Previsualizacion de arte para videojuegos: generar concept art de entornos (templos, junglas bioluminiscentes, ciudades ciberpunk) en pocos segundos por imagen, lo que permite explorar direcciones visuales antes de encargar arte final.
- Creacion de storyboards y moodboards: producir una serie de imagenes con el mismo estilo `tsm` para mantener coherencia visual en una presentacion o en la fase de preproduccion de un proyecto audiovisual.
- Generacion de material para redes sociales y marketing: crear imagenes de fondo o ilustraciones con una firma estilistica reconocible, usando el LoRA como capa de personalizacion sobre un pipeline ya desplegado con Krea 2 Turbo.
- Prototipado de estilos para artistas digitales: entrenar o combinar este LoRA con otros adaptadores para explorar variantes de un estilo propio antes de invertir en un entrenamiento completo o en un modelo afinado.
- Experimentacion en investigacion sobre personalizacion: emplear el adaptador como caso de estudio de DreamBooth-LoRA sobre un modelo de difusion reciente, midiendo la fidelidad al concepto y la interferencia con otros LoRA al combinarlos.
- Demostraciones y docencia: ilustrar en talleres o articulos como un unico token disparador modifica el resultado de un modelo texto-a-imagen, con ejemplos reproducibles mediante el codigo de la model card.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas cuantitativas (FID, CLIP score, similitud de concepto, etc.) ni comparaciones con otros LoRA o modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; depende del modelo base Krea 2 Turbo y de la precision. El ejemplo oficial usa `torch.bfloat16` en CUDA, lo que sugiere que se necesita una GPU con soporte bfloat16 y VRAM suficiente para el pipeline completo (el adaptador en si ocupa 0,8 GB en disco).
- GPU recomendadas: no especificadas por el autor. Por el uso de `bfloat16` y de un pipeline de difusion moderno, son razonables GPU de gama alta con soporte bfloat16 (A100, H100, RTX 4090, RTX 3090); no hay confirmacion de que quepa en GPU de consumo con menos VRAM.
- Compatibilidad con GPU de consumo: no confirmada. El adaptador es pequeno (0,8 GB), pero el requisito dominante es el del modelo base, no el del LoRA.
- Opciones de despliegue: `diffusers` con `Krea2Pipeline` es la via documentada (`from_pretrained("krea/Krea-2-Turbo")` + `load_lora_weights("Nanico/tsm")`). No se documentan opciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo de difusion de este tipo.
- Latencia y throughput: no disponibles. Las muestras se generaron con 8 pasos de inferencia, lo que indica un regimen de baja latencia relativa, pero no se publican tiempos por imagen ni throughput medido.

## Comparativa con modelos similares

No se dispone de datos de rendimiento ni de especificaciones detalladas de los modelos comparables en la informacion proporcionada, por lo que la comparacion se limita a caracteristicas estructurales conocidas.

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Nanico/tsm | LoRA sobre Krea 2 | no disponible (repo de 0,8 GB) | no aplica | Apache 2.0 | Hugging Face, 0 descargas, 0 likes |
| krea/Krea-2-Raw | Modelo base de difusion texto-a-imagen | no disponible | no aplica | no disponible en la informacion proporcionada | Hugging Face (referenciado como base) |
| krea/Krea-2-Turbo | Variante destilada del base | no disponible | no aplica | no disponible en la informacion proporcionada | Hugging Face (referenciado en el ejemplo de uso) |
| Otros LoRA de estilo para Krea 2 | Adaptadores LoRA | no disponible | no aplica | variable | Hugging Face (no se identifican alternativas concretas en la informacion disponible) |

No se han identificado en la informacion proporcionada modelos comparables de otros autores con datos de rendimiento que permitan una comparacion cuantitativa.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados. Al ser un LoRA de estilo entrenado con un dataset no publicado, puede heredar sesgos del modelo base y del conjunto de entrenamiento, que se desconoce.
- Riesgo de alucinacion: en generacion de imagenes, el equivalente es la produccion de contenido visual no fiel al prompt o la aparicion de artefactos; no hay evaluacion publicada de fidelidad al prompt ni de coherencia visual.
- Limitaciones de contexto o idioma: no se declaran idiomas soportados; los prompts de ejemplo estan en ingles y no hay evidencia de comportamiento en castellano ni en otros idiomas.
- Restricciones de licencia: el adaptador se publica bajo Apache 2.0, pero el uso comercial depende tambien de la licencia del modelo base Krea 2, que no se detalla en la informacion proporcionada; conviene verificar la licencia de `krea/Krea-2-Raw` y `krea/Krea-2-Turbo` antes de usarlo en produccion.
- Dependencia del modelo base: el LoRA no funciona de forma autonoma; requiere cargar Krea 2 (Raw para entrenamiento, Turbo para inferencia segun los ejemplos) y su calidad esta acotada por la del base.
- Madurez y soporte: el repositorio tiene 0 descargas y 0 likes, fue creado y actualizado el mismo dia (2 de noviembre de 2026) y no cuenta con documentacion sobre hiperparametros, dataset ni evaluacion; es un artefacto reciente y sin validacion comunitaria.
- Compatibilidad: no se documenta el rango del LoRA ni las capas objetivo, por lo que la combinacion con otros adaptadores o con tecnicas de control de composicion puede producir interferencias no previstas.
- Reproducibilidad: al no publicarse el dataset ni los hiperparametros de entrenamiento, no es posible reproducir el adaptador ni auditar su comportamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Nanico/tsm
- Modelo base (Raw): https://huggingface.co/krea/Krea-2-Raw
- Modelo base (Turbo, usado en los ejemplos): https://huggingface.co/krea/Krea-2-Turbo
- Libreria diffusers: https://github.com/huggingface/diffusers
- Documentacion de carga de LoRA en diffusers: https://huggingface.co/docs/diffusers/using-diffusers/loading_adapters
- No se han encontrado en la informacion proporcionada papers, blogs, repositorios adicionales ni demos asociados a este adaptador.
