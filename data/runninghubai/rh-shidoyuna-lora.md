# RunningHubAI/rh-shidoyuna-lora

## Resumen

rh-shidoyuna-lora es un adaptador LoRA de edicion de imagen publicado por RunningHubAI, una plataforma comercial de generacion y entrenamiento de modelos de difusion, en nombre del autor acreditado como BRAVE TECHUB LMT. No se trata de un modelo de lenguaje ni de un modelo completo, sino de un peso adicional que se carga sobre un modelo base de difusion identificado en la model card como "krea2". Su funcion es inyectar en ese modelo base un sujeto concreto ("yuna", una mujer adulta de 25 anos con pelo largo negro y flequillo) para que aparezca de forma consistente en las imagenes generadas o editadas.

El repositorio contiene un unico archivo, `Yuna_Krea2_v1.safetensors`, de 448 MiB, con una palabra de activacion declarada: `yuna`. La pipeline declarada es image-text-to-image, es decir, generacion o edicion condicionada simultaneamente por una imagen de entrada y un prompt de texto. Esto lo situa en el ecosistema de ComfyUI, donde este tipo de adaptadores se encadenan con checkpoints, VAE y encoders de texto.

Es relevante porque ilustra el flujo de trabajo actual de personalizacion de modelos de difusion en produccion: adaptadores pequenos y desacoplados del modelo base, entrenados y distribuidos a traves de plataformas gestionadas (RunningHub), con disparadores de texto para controlar la identidad. Como contrapartida, la ficha tecnica del repositorio es practicamente inexistente: cero descargas, cero likes, sin licencia explicita, sin especificaciones de entrenamiento y sin benchmarks publicados, por lo que cualquier evaluacion seria exige probarlo directamente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre modelo base de difusion "krea2"; arquitectura del adaptador no disponible |
| Parametros totales | no disponible (el unico peso publicado ocupa 448 MiB; el numero de parametros del adaptador no se declara) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de imagen; no procesa secuencias de texto autoregresivas) |
| Tipos de cuantizacion | no disponible; solo se publica un safetensors de 448 MiB, sin variantes GGUF ni cuantizadas |
| Idiomas soportados | no disponible; los disparadores y prompts dependen del encoder de texto del modelo base |
| Licencia | no disponible; la model card indica que el copyright pertenece al autor y que se debe seguir la licencia del proyecto original o del upstream |
| Formato de pesos | safetensors (`Yuna_Krea2_v1.safetensors`, 448 MiB) |
| Tamano del repositorio | 0,5 GB |
| Plataformas declaradas | ComfyUI, RunningHub, Hugging Face |
| Palabra de activacion | `yuna` |
| Modelo base | krea2 (finetuned from) |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura del adaptador. LoRA (Low-Rank Adaptation) es una tecnica estandar que congela el modelo base e inserta matrices de bajo rango en determinadas capas, de modo que el adaptador aprende un desplazamiento de pesos de dimension mucho menor que el modelo completo; eso explica que un unico archivo de 448 MiB baste para anadir un sujeto nuevo. Sin embargo, el repositorio no especifica en que capas se han insertado las matrices, cual es el rango, ni la dimension del adaptador, por lo que estos datos figuran como no disponibles.

Tampoco se documentan los datos de entrenamiento: no se indica el numero de imagenes, la resolucion, el numero de pasos, la tasa de aprendizaje, si hubo regularizacion con imagenes de clase, ni si se aplicaron tecnicas como captioning automatico o entrenamiento con mascara de region. No hay mencion a RLHF ni DPO, que en cualquier caso no se aplican a este tipo de adaptadores de difusion. El unico dato objetivo del entrenamiento es el resultado declarado: un adaptador que reproduce una descripcion fija (mujer adulta de 25 anos, pelo negro liso y largo con flequillo, piel clara, delineador sutil y labios rosados naturales) asociada al token `yuna`.

## Capacidades

- Generacion de imagenes condicionada por texto: al invocar el token `yuna` en el prompt, el adaptador tiende a producir el sujeto descrito en la model card.
- Edicion de imagen condicionada por imagen y texto (pipeline image-text-to-image): permite modificar una imagen de entrada manteniendo la identidad inyectada por el LoRA.
- Consistencia de personaje entre generaciones: es la funcion principal de un LoRA de sujeto, mantener rasgos faciales y de peinado reconocibles en escenas, poses e iluminaciones distintas.
- Encadenamiento con otros adaptadores: al ser un LoRA independiente, puede combinarse con otros LoRA en ComfyUI (estilo, iluminacion, pose), con los riesgos de interferencia habituales.
- Integracion en flujos ComfyUI: se carga como nodo de pesos y se puede insertar en grafos existentes sin reentrenar el modelo base.
- Ejecucion remota via API de RunningHub: la model card enlaza explicitamente la API de la plataforma para invocar el modelo sin infraestructura propia.
- Capacidades que NO tiene: no es un modelo de lenguaje, no genera texto, no razona, no escribe codigo, no resuelve matematicas, no soporta tool calling ni function calling, no funciona como agente multi-paso y no procesa audio ni video de forma nativa.

## Casos de uso

- Ilustracion de personaje recurrente: un estudio que produce 200 ilustraciones de un mismo personaje para un comic o novela ligera carga el LoRA en ComfyUI y usa el token `yuna` en cada prompt para mantener la identidad sin retocar cada imagen a mano.
- Creacion de storyboards: partiendo de bocetos como imagen de entrada en un flujo image-text-to-image, se obtienen fotogramas coherentes del mismo personaje en distintas localizaciones, lo que acelera la previsualizacion de escenas antes del rodaje o de la animacion.
- Avatares y contenido para redes: generacion de un conjunto de imagenes consistentes de un personaje virtual (retratos, planos medios, escenas de exterior) a partir de una sola referencia de identidad.
- Previsualizacion de vestuario y maquillaje: dado que el LoRA fija el rostro, se puede variar el prompt para cambiar ropa, peinado o maquillaje y evaluar combinaciones sin sesion de fotos, usando el modo de edicion sobre una imagen base.
- Prototipado de arte conceptual para videojuegos: generacion rapida de variantes de un personaje no jugable (NPC) con rasgos estables para presentar al equipo de arte antes de modelar en 3D.
- Aumento de datasets con identidad controlada: produccion de imagenes sinteticas etiquetadas de un unico sujeto para entrenar o evaluar otros sistemas (por ejemplo, detectores de rostro), siempre que la licencia del modelo base lo permita.
- Demostraciones y pruebas de integracion: verificar el funcionamiento del nodo LoRA en un pipeline ComfyUI propio o a traves de la API de RunningHub antes de invertir en un entrenamiento a medida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye FID, CLIP score, similitud facial, ni ninguna otra metrica cuantitativa, y el repositorio no tiene descargas ni evaluaciones de la comunidad en el momento de la consulta.

## Requisitos de hardware

- VRAM para el adaptador: el archivo de pesos ocupa 448 MiB en disco; en memoria, la carga del LoRA anade un consumo del orden de ese mismo tamano al del modelo base, pero no se publica ninguna medicion oficial.
- VRAM total: no disponible, porque depende enteramente del modelo base "krea2", cuyo checkpoint no forma parte de este repositorio y cuyas especificaciones no se detallan aqui.
- GPU recomendadas: no disponible. Como referencia general del ecosistema, adaptadores de este tamano se han ejecutado historicamente en GPUs de consumo, pero sin confirmar que el modelo base entre en VRAM consumer no se puede afirmar que este LoRA sea ejecutable en una RTX 4090 o similar.
- Opciones de despliegue: ComfyUI (declarado), plataforma RunningHub y su API (declarado), Hugging Face como alojamiento del peso. No se menciona soporte para diffusers con `load_lora_weights`, llama.cpp ni vLLM, que no aplican a modelos de difusion en el caso de los dos ultimos.
- Latencia y throughput: no disponible; no se aportan mediciones de tiempo por imagen ni de imagenes por segundo.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye resultados de benchmarks ni identificadores de adaptadores comparables, por lo que no es posible establecer una comparacion cuantitativa con otros LoRA de personaje. Cualquier comparacion requeriria evaluar el mismo prompt y semilla sobre varios adaptadores con el mismo modelo base, prueba que no se ha publicado.

## Limitaciones y advertencias

- Ausencia total de datos de entrenamiento: sin numero de imagenes, resolucion ni composicion del dataset, no se puede evaluar el riesgo de sobreajuste ni de reproduccion de material con derechos.
- Licencia no declarada: la model card solo indica que el copyright pertenece al autor y que se siga la licencia del proyecto original. Esto es insuficiente para uso comercial; hay que verificar la licencia del modelo base krea2 antes de desplegar nada.
- Modelo practicamente sin validacion externa: cero descargas y cero likes en el momento de la consulta, sin evaluaciones de terceros ni ejemplos de salida verificables.
- Riesgo de alucinacion visual: como cualquier modelo de difusion, puede generar anatomia incorrecta, manos deformes, texto ilegible o incoherencias espaciales, especialmente fuera de las condiciones de entrenamiento.
- Riesgo de sesgo: se describe un unico fenotipo (piel clara, pelo negro liso), lo que limita la diversidad de salidas y puede reforzar estereotipos de representacion si se usa sin control.
- Dependencia estricta del modelo base: el LoRA no es autonomo; sin el checkpoint krea2 no se puede cargar, y cambios de version del base pueden degradar o romper la identidad.
- Ambiguedad del disparador: la palabra de activacion `yuna` es un termino comun que puede aparecer colisionando con otros conceptos en el prompt; conviene aislarla para evitar contaminacion.
- Limitaciones idiomaticas: no se declara que idiomas entiende el encoder de texto del base, por lo que no hay garantia de que los prompts en castellano funcionen igual que en ingles.
- Restricciones de uso responsable: al tratarse de un LoRA de identidad facial, su uso para generar imagenes de personas reales sin consentimiento, contenido intimo no consentido o desinformacion es un riesgo directo y puede infringir normativa de proteccion de datos y derechos de imagen.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/RunningHubAI/rh-shidoyuna-lora
- Modelo original en RunningHub: https://www.runninghub.ai/model/public/2104632344144531457
- Pagina del autor en RunningHub: https://www.runninghub.ai/user-center/2090552318396162050
- Plataforma RunningHub: https://www.runninghub.ai
- RunningHub China: https://www.runninghub.cn
- Documentacion de la API (ingles): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentacion de la API (chino): https://www.runninghub.cn/runninghub-api-doc-cn/
- Entrenamiento de modelos en RunningHub: https://www.runninghub.ai/page-model
- Paper, blog tecnico o demo adicional: no disponible en la informacion proporcionada (los resultados de busqueda web recibidos no contienen material relacionado con este modelo).
