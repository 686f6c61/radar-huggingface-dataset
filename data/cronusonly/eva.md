# CronusOnly/eva

## Resumen

`CronusOnly/eva` es un adaptador LoRA de tipo DreamBooth para el modelo de difusion texto-a-imagen Krea 2, publicado por el usuario CronusOnly en HuggingFace. No es un modelo autonomo: se carga sobre los pesos de Krea 2 y anade un concepto concreto invocable mediante el token `vxl_Eva`. El adaptador se entreno sobre `krea/Krea-2-Raw` y las muestras publicadas se generaron sobre `krea/Krea-2-Turbo` con 8 pasos de inferencia y `guidance_scale=0.0`.

El repositorio tiene un tamano de 1,0 GB e incluye la model card, tres imagenes de ejemplo y los pesos del adaptador; se distribuye con licencia Apache 2.0 y se carga mediante la libreria `diffusers` con la clase `Krea2Pipeline` del modelo base. La relevancia practica es la habitual en adaptadores de identidad o estilo: permite fijar un sujeto consistente en un pipeline de generacion de imagenes sin reentrenar el modelo completo.

La informacion publicada es muy limitada: no se documentan el numero de parametros del adaptador, el volumen ni la composicion del dataset de entrenamiento, los hiperparametros, ni resultados cuantitativos. Cualquier evaluacion seria del adaptador requiere pruebas propias de consistencia, fidelidad al concepto y deriva sobre prompts fuera de distribucion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (DreamBooth) sobre un modelo de difusion texto-a-imagen Krea 2; arquitectura interna del modelo base no disponible |
| Parametros totales | no disponible (el repositorio ocupa 1,0 GB e incluye pesos del adaptador y muestras) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible; no aplica en el sentido de LLM (el condicionamiento depende del codificador de texto del modelo base) |
| Tipos de cuantizacion | no se documentan cuantizaciones del adaptador; los ejemplos de la model card usan `torch.bfloat16` en el modelo base |
| Idiomas soportados | no disponible (depende de los idiomas del codificador de texto de Krea 2) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible en detalle; el repositorio se carga con `diffusers` y usa la plantilla `template:sd-lora` (compatible con el ecosistema de LoRAs de difusion) |

Otros datos verificables: pipeline `text-to-image`, modelo base `krea/Krea-2-Raw`, token de activacion `vxl_Eva`, 0 descargas y 0 likes en el momento de la consulta, creado el 2026-10-28 y actualizado el mismo dia.

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA, es decir, un conjunto de matrices de bajo rango inyectadas en las capas del modelo base, entrenado con la metodologia DreamBooth para asociar un token raro (`vxl_Eva`) a un concepto visual. El entrenamiento se realizo sobre `krea/Krea-2-Raw`, la variante del modelo Krea 2 orientada a calidad y muestreo completo, mientras que la inferencia de las muestras publicadas se hizo sobre `krea/Krea-2-Turbo`, la variante destilada para pocos pasos. Esta separacion entre modelo de entrenamiento y modelo de inferencia es habitual y suele trasladar razonablemente bien, aunque no hay datos que cuantifiquen la perdida de fidelidad.

No se publican detalles tecnicos del entrenamiento: numero de imagenes del dataset, resolucion, pasos, tasa de aprendizaje, uso de imagenes de regularizacion, rangos del LoRA ni si hubo aumento de datos o captioning automatico. Tampoco se indica si el adaptador incluye pesos para el codificador de texto o solo para el UNet/transformer del modelo de difusion. La unica innovacion documentada es el uso de la variante Turbo con 8 pasos y `guidance_scale=0.0` en los ejemplos, lo que reduce coste de inferencia a costa de menor control por CFG.

## Capacidades

- Generacion de imagenes texto-a-imagen condicionada al concepto `vxl_Eva` sobre el pipeline Krea 2.
- Fijacion de identidad o apariencia consistente de un sujeto a traves de multiples prompts, escenas y estilos (las tres muestras cubren cyberpunk, pintura al oleo y macrofotografia).
- Transferencia de estilo: los ejemplos demuestran que el concepto se mantiene al cambiar de medio (render cinematografico, pintura, fotografia macro).
- Composicion de escenas complejas mediante prompt en lenguaje natural; no se documenta soporte de ControlNet, inpainting, img2img ni otras tecnicas de control espacial.
- Compatibilidad con la API de `diffusers` (`load_lora_weights`) y, por la plantilla `sd-lora`, previsiblemente con herramientas del ecosistema de difusion, aunque no se confirma en la model card.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni otras capacidades de LLM: es un adaptador de imagen.
- Capacidades multilingues: no disponibles; dependen del codificador de texto del modelo base y no se documentan.

## Casos de uso

- Consistencia de personaje en narrativa serializada: usar `vxl_Eva` como token fijo en cada prompt para mantener el mismo sujeto en ilustraciones de capitulos, portadas o storyboards, con 8 pasos en la variante Turbo para iterar rapido.
- Prototipado de arte conceptual en videojuegos: generar variantes del personaje en distintos entornos (interiores, exterior, iluminacion nocturna) para explorar direccion de arte antes de producir assets definitivos.
- Creacion de avatares y retratos para producto digital: generar un set coherente de imagenes del mismo sujeto para perfiles, onboarding o materiales de marca, revisando manualmente cada salida por el riesgo de deriva.
- Ilustracion editorial y de blog: producir imagenes tematicas con un personaje recurrente en estilos distintos (pintura, fotografia, render) a partir de un unico adaptador, reduciendo el coste frente a encargar cada pieza.
- Aumento de datos visuales: generar variaciones controladas del concepto para alimentar clasificadores o sistemas de deteccion, siempre que la licencia Apache 2.0 del adaptador y la del modelo base lo permitan en el uso previsto.
- Pruebas de concepto de pipelines generativos: servir como caso de prueba para validar integracion de LoRAs en `diffusers`, ComfyUI u orquestadores propios, dado su bajo peso relativo frente al modelo completo.
- Experimentacion artistica y educativa: demostrar el efecto de un token de activacion y de la escala de LoRA en la salida, util en docencia sobre modelos de difusion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La unica evidencia cualitativa son tres imagenes de muestra generadas con Krea 2 Turbo a 8 pasos y `guidance_scale=0.0`, sin semillas, sin resolucion declarada y sin comparacion contra el modelo base sin LoRA. No hay metricas de similitud de identidad (por ejemplo, CLIP-I o DINO), ni FID, ni evaluaciones de fidelidad al prompt.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion publicada; depende enteramente del modelo base Krea 2, no del adaptador. El repositorio del LoRA ocupa 1,0 GB, pero la inferencia requiere cargar el modelo completo.
- GPU recomendadas: no disponibles para este adaptador. La model card solo indica ejecucion en CUDA con `torch_dtype=torch.bfloat16`.
- Compatibilidad con GPU de consumo: no confirmada. Requiere evaluar los requisitos de Krea 2 en bfloat16; no hay datos publicados en esta ficha.
- Opciones de despliegue: `diffusers` con `Krea2Pipeline.from_pretrained("krea/Krea-2-Turbo")` y `load_lora_weights("CronusOnly/eva")`. No aplica vLLM, llama.cpp, Ollama ni TGI, que son runtimes de LLM.
- Latencia y throughput: no disponibles. El uso de 8 pasos con `guidance_scale=0.0` reduce el coste frente a muestreo completo, pero no se aportan tiempos por imagen ni resolucion de salida.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto / condicionamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CronusOnly/eva | LoRA DreamBooth sobre Krea 2 | no disponible | codificador de texto de Krea 2 (no disponible) | Apache 2.0 | HuggingFace, 0 descargas |
| krea/Krea-2-Raw | Modelo de difusion base | no disponible | no disponible | no disponible en esta ficha | HuggingFace (modelo base declarado) |
| krea/Krea-2-Turbo | Modelo de difusion base destilado para pocos pasos | no disponible | no disponible | no disponible en esta ficha | HuggingFace (usado en los ejemplos) |
| Otros LoRAs de Krea 2 | Adaptadores de concepto | no disponible | no disponible | variable | no se han identificado alternativas concretas en la informacion disponible |

No se dispone de datos de benchmarks ni de alternativas comparables documentadas para establecer una comparacion cuantitativa. La comparacion relevante es funcional: frente al modelo base, este LoRA anade un concepto concreto y un token de activacion, a cambio de un riesgo de sobreajuste y de dependencia de la variante del modelo base con la que se combine.

## Limitaciones y advertencias

- Ausencia total de documentacion de entrenamiento: sin dataset, hiperparametros ni pasos, no es posible reproducir el adaptador ni estimar su grado de sobreajuste.
- Riesgo de deriva del concepto: al ser un LoRA de identidad, los prompts alejados de la distribucion de las muestras (poses extremas, sujetos multiples, primeros planos muy cerrados) pueden degradar la fidelidad.
- Sesgos conocidos: no documentados. Al no publicarse la composicion del dataset, no se puede evaluar el sesgo demografico, estetico o cultural del concepto aprendido.
- Riesgo de alucinacion visual: como todo modelo de difusion, puede generar anatomias incorrectas, texto ilegible y artefactos, especialmente a 8 pasos con `guidance_scale=0.0`, donde no hay control por CFG.
- Ambiguedad de licencia: el adaptador declara Apache 2.0, pero el uso comercial depende tambien de la licencia del modelo base Krea 2, que no se detalla en la informacion disponible. Verificar antes de desplegar en produccion.
- Idiomas: no documentados; el rendimiento con prompts en castellano depende del codificador de texto de Krea 2 y no ha sido evaluado.
- Versionado del modelo base: las muestras se generaron en Turbo, pero el entrenamiento fue en Raw; el comportamiento al combinar el LoRA con otras variantes o checkpoints no esta documentado.
- Madurez del artefacto: 0 descargas y 0 likes, publicado y actualizado el mismo dia, sin historial de uso ni issues. No hay evidencia de comunidad que valide su calidad.
- Contenido: un LoRA de personaje puede reproducir rasgos de personas reales si el dataset las contenia; no se especifica el origen de las imagenes de entrenamiento.
- No apto para tareas de texto, razonamiento, codigo o agentes: es exclusivamente un adaptador de generacion de imagenes.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/CronusOnly/eva
- Modelo base declarado: https://huggingface.co/krea/Krea-2-Raw
- Variante usada en los ejemplos: https://huggingface.co/krea/Krea-2-Turbo
- Paper, blog o repositorio del adaptador: no disponible
- Demo o Space oficial: no disponible
- Los resultados de la busqueda web realizada no contienen enlaces relevantes para este modelo (devuelven articulos sobre castillos europeos y su relacion con Disney), por lo que no se incluyen.
