# RunningHubAI/rh-daphne-lora

## Resumen

rh-daphne-lora es un adaptador LoRA de tipo text-to-image publicado por RunningHubAI en nombre del autor (RunningHub, usuario @The Gold Members). No es un modelo generativo autonomo: es un complemento de bajo rango que se aplica sobre el modelo base Z-image-turbo para fijar una identidad femenil adulta concreta y reproducible a lo largo de generaciones independientes. El repositorio contiene un unico fichero de pesos, `Daphne_low.safetensors`, de 146 MiB, con un peso total de repositorio de 0,2 GB.

Su funcion es resolver el problema de consistencia de personaje en pipelines de generacion de imagen: sin un LoRA de identidad, un modelo de difusion produce caras distintas en cada inferencia, lo que rompe cualquier narrativa visual (comics, storyboards, catalogos de moda, avatares). El adaptador define un personaje con pelo largo ondulado castano chocolate, ojos verde avellana, piel clara con pecas, rasgos faciales definidos y complexion femenina atletica, y se activa mediante la palabra clave `DaphneL`.

Es relevante ahora porque encaja en el ecosistema ComfyUI y en el catalogo de modelos de RunningHub, que permiten cargarlo y ejecutarlo sin infraestructura propia. La model card no especifica rango del adaptador, resolucion de entrenamiento, numero de pasos ni composicion del dataset; tampoco declara licencia explicita, mas alla de la nota de que los derechos permanecen en el autor y debe seguirse la licencia del proyecto original (Z-image-turbo).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre modelo base de difusion Z-image-turbo |
| Parametros totales | No disponible. El fichero de pesos ocupa 146 MiB; a 2 bytes por parametro equivaldria a unas 76 millones de entradas de adaptador, pero el rango no se declara |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (text-to-image). El limite practico lo fija el codificador de texto del modelo base, no disponible |
| Tipos de cuantizacion | No disponible. Se distribuye en un unico fichero safetensors; no se publican variantes cuantizadas del adaptador |
| Idiomas soportados | No disponible. La palabra de activacion `DaphneL` es un token latino; presumiblemente el prompt se procesa en el idioma que soporte el modelo base, sin confirmacion en la model card |
| Licencia | No disponible. La model card indica que los derechos permanecen en el autor y que debe seguirse la licencia del proyecto original o del upstream |
| Formato de pesos | safetensors (`Daphne_low.safetensors`, 146 MiB) |

## Arquitectura y entrenamiento

Se trata de un adaptador LoRA (Low-Rank Adaptation) sobre Z-image-turbo, segun declara el propio autor. Un LoRA no sustituye al modelo base: inyecta matrices de bajo rango en capas seleccionadas y modifica su comportamiento con un coste de almacenamiento muy inferior al de un finetune completo. En este caso, la ausencia de informacion sobre el rango, los modulos objetivo (attention, cross-attention, MLP) y el multiplicador de escala recomendado obliga a ajustar la fuerza del adaptador de forma empirica al cargarlo en ComfyUI.

No hay datos publicos en la informacion proporcionada sobre el dataset de entrenamiento (numero de imagenes, resolucion, si hubo recorte de caras o captioning por atributos), ni sobre el numero de pasos, learning rate, scheduler o si se emplearon tecnicas de regularizacion como LoRA DreamBooth con clase prior. RunningHub indica que el modelo se entreno en su plataforma y que ofrece ese servicio de entrenamiento, pero no publica la receta. Tampoco se documenta ninguna innovacion tecnica adicional (decodificacion especulativa, atencion lineal u otras), lo cual es coherente con la naturaleza de un adaptador de personaje.

## Capacidades

- Generacion de imagenes fotorrealistas de un personaje femenino adulto consistente, activado con la palabra clave `DaphneL`.
- Reproduccion de atributos fisicos definidos: pelo largo ondulado castano chocolate, ojos verde avellana, piel clara con pecas, rasgos faciales marcados y complexion atletica.
- Retratos de primer plano y planos de cuerpo entero en estilo lifestyle.
- Variacion controlada de pose, vestuario, angulo de camara y escenario manteniendo la identidad del personaje.
- Integracion en flujos de trabajo de ComfyUI como nodo de carga de LoRA.
- Ejecucion en la nube de RunningHub y mediante la API de la plataforma, sin necesidad de GPU local.
- No dispone de soporte de tool calling ni de function calling.
- No dispone de capacidades de agente ni de razonamiento multi-paso; no genera texto.
- No dispone de capacidades de vision, audio ni modo de razonamiento explicito.
- Capacidad multilingue: no documentada.

## Casos de uso

- Ilustracion de personajes recurrentes en comic digital y novela grafica: aplicar `DaphneL` en cada panel permite mantener la misma cara a lo largo de cientos de vinetas generadas por separado, algo inviable solo con prompt.
- Storyboards y previsualizacion cinematografica: generar secuencias de planos del mismo personaje en distintas localizaciones y angulos antes de rodar o animar.
- Catalogos de moda y e-commerce: producir un mismo modelo humano virtual con diferentes prendas y poses, reduciendo la necesidad de sesiones fotograficas y de gestion de derechos de imagen de modelos reales.
- Avatares y contenido para redes sociales: crear un personaje con identidad estable para publicaciones seriadas, con control de encuadre y estilo.
- Prototipado de videojuegos y novelas visuales: generar retratos de personaje y expresiones derivadas para fichas de personaje, dialogos y pantallas de carga.
- Ilustracion editorial y branding de marca personal: construir un rostro reconocible asociado a una marca o publicacion, reutilizable en cabeceras, articulos y campanas.
- Pruebas de concepto de direccion de arte: comparar rapidamente vestuario, iluminacion y composicion sobre una identidad fija antes de invertir en produccion.
- Automatizacion via API de RunningHub: encadenar el LoRA dentro de un pipeline de generacion por lotes con parametros fijos para producir variaciones sistematicas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Este tipo de adaptador no se evalua con MMLU, HumanEval o GSM8K; las metricas habituales serian similitud facial (por ejemplo distancia coseno con ArcFace), CLIP score o evaluacion humana de consistencia de identidad, y ninguna de ellas aparece en la model card ni en los resultados de busqueda.

## Requisitos de hardware

- El adaptador en si ocupa 146 MiB, por lo que su coste de VRAM es despreciable frente al del modelo base.
- El requisito real de VRAM lo determina Z-image-turbo. No se dispone de las especificaciones del modelo base en la informacion proporcionada.
- A modo de referencia orientativa y no confirmada, un modelo de difusion tipo DiT de varios miles de millones de parametros suele requerir del orden de 12 a 16 GB en precision de 16 bits y de 7 a 9 GB en formatos de 8 bits, mas el overhead del pipeline y del codificador de texto. Debe verificarse contra la documentacion oficial del modelo base.
- GPU recomendadas: no disponible en la informacion proporcionada. La plataforma RunningHub permite ejecutar el flujo en la nube, lo que evita depender de hardware local.
- Viabilidad en GPU de consumo: no confirmada. Depende enteramente del modelo base y del grado de cuantizacion empleado.
- Opciones de despliegue: ComfyUI (etiqueta declarada del repositorio), plataforma RunningHub y su API. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que ademas no aplican a un modelo de difusion de imagen.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Modelo base | Tamano | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| rh-daphne-lora | LoRA text-to-image | Z-image-turbo | 146 MiB (adaptador) | No aplica | No disponible | Hugging Face, RunningHub |
| rh-face-model-lora | LoRA text-to-image | No disponible | No disponible | No aplica | No disponible | Hugging Face (mismo autor) |
| Otros LoRA de personaje en el catalogo de RunningHub | LoRA text-to-image | Variable | Variable | No aplica | No disponible | RunningHub |

No se dispone de datos publicos de rendimiento, contexto o licencia de las alternativas como para establecer una comparacion cuantitativa. La comparacion mas directa disponible es rh-face-model-lora, del mismo autor y mismo pipeline, pero la informacion proporcionada no incluye sus especificaciones tecnicas.

## Limitaciones y advertencias

- La licencia no esta declarada de forma explicita. La model card solo indica que los derechos permanecen en el autor y que debe seguirse la licencia del proyecto original. Esto genera incertidumbre juridica para uso comercial; es imprescindible aclararlo antes de integrarlo en produccion.
- Riesgo de derechos de imagen: si el personaje se inspira en una persona real, la generacion y redistribucion de su imagen puede infringir derechos de imagen o de publicidad en distintas jurisdicciones. No hay declaracion del autor al respecto.
- Sesgos: el adaptador fija un canon estetico concreto (piel clara, complexion atletica, rasgos definidos) y no documenta la diversidad del dataset de entrenamiento. Puede reproducir sesgos de representacion y de iluminacion heredados del conjunto de datos.
- Alucinacion visual y artefactos: como cualquier modelo de difusion, puede producir manos deformes, texto ilegible, perspectivas incoherentes o accesorios imposibles, especialmente en planos de cuerpo entero y con prompts poco especificos.
- Dependencia del prompt: la identidad solo se activa con la palabra clave `DaphneL`. Omitirla o modificar su grafia degrada o anula el efecto del adaptador.
- Sobreajuste y rigidez: un LoRA de personaje puede dificultar cambios de peinado, edad o etnia de forma realista, y puede contaminar el estilo global de la imagen si se sube el multiplicador de escala.
- Debilidad en pose: no hay informacion sobre el rango de poses cubierto; es probable que fallen poses muy dinamicas, escorzos extremos o composiciones con varias personas.
- Idioma: no se documenta el idioma de los prompts. Usar prompts en castellano puede degradar el resultado si el codificador de texto del modelo base esta optimizado para ingles.
- Proceso de entrenamiento opaco: sin datos de dataset, pasos ni regularizacion, resulta dificil diagnosticar fallos o estimar la robustez del adaptador en dominios alejados del fotografico.
- Ausencia de benchmarks y de adopcion: el repositorio registra 0 descargas y 0 likes en la informacion proporcionada, sin validacion externa de calidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/RunningHubAI/rh-daphne-lora
- Modelo original en RunningHub: https://www.runninghub.ai/model/public/2096493061273673729
- Pagina del autor en RunningHub: https://www.runninghub.ai/user-center/2091651499075149826
- Plataforma RunningHub: https://www.runninghub.ai
- RunningHub China: https://www.runninghub.cn
- Catalogo de modelos de RunningHub: https://www.runninghub.ai/models
- Documentacion de la API (ingles): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentacion de la API (chino): https://www.runninghub.cn/runninghub-api-doc-cn/
- Entrenamiento de modelos en RunningHub: https://www.runninghub.ai/page-model
- Detalle de API de Seedance 2.5: https://www.runninghub.ai/call-api/api-detail/2133100000000700025
- README en chino: https://huggingface.co/RunningHubAI/rh-daphne-lora/blob/main/README_cn.md
- Modelo relacionado del mismo autor: https://huggingface.co/RunningHubAI/rh-face-model-lora
