# schrottteil/dayakr

## Resumen

`schrottteil/dayakr` es un LoRA de tipo DreamBooth para el modelo de difusion texto-a-imagen Krea 2, entrenado sobre el checkpoint base `krea/Krea-2-Raw` y pensado para usarse en inferencia sobre la variante destilada `krea/Krea-2-Turbo`. Lo publica el usuario `schrottteil` en Hugging Face bajo licencia Apache 2.0, con un repositorio de aproximadamente 1 GB y la libreria `diffusers` como via de carga. No es un modelo fundacional: es un adaptador de bajo rango que inyecta un concepto concreto, invocado mediante el token `MDaya`.

El problema que resuelve es el habitual de los LoRA de personalizacion: fijar la identidad o el estilo de un sujeto (en este caso, la entidad "MDaya") sin reentrenar el modelo completo, manteniendo la capacidad generativa del checkpoint base. La model card incluye tres prompts de ejemplo generados con 8 pasos de inferencia y `guidance_scale=0.0`, lo que confirma que el adaptador esta calibrado para el regimen de muestreo rapido de Krea 2 Turbo.

La relevancia practica es limitada y muy especifica: el repositorio no presenta descargas ni interacciones, no documenta el dataset de entrenamiento ni publica metricas, y su interes se reduce a quien necesite reproducir el concepto `MDaya` sobre la familia Krea 2. La informacion disponible sobre el modelo base (parametros, contexto, arquitectura interna) no viene detallada en la ficha, por lo que buena parte de las especificaciones figuran como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre un modelo de difusion texto-a-imagen; el checkpoint base es `krea/Krea-2-Raw` |
| Parametros totales | no disponible (el repositorio ocupa 1.0 GB; el numero de parametros del adaptador no se especifica) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (no aplica en el sentido de LLM; la ventana la define el encoder de texto del pipeline Krea 2) |
| Tipos de cuantizacion | no disponible (la model card solo muestra carga en `torch.bfloat16`) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | pesos compatibles con `diffusers` (carga via `pipe.load_lora_weights`); no se detalla si hay safetensors sueltos o estructura de carpeta |

## Arquitectura y entrenamiento

El artefacto es un LoRA de DreamBooth, es decir, un conjunto de matrices de bajo rango que se suman a las proyecciones del modelo base para especializarlo en un concepto. El entrenamiento se realizo sobre `krea/Krea-2-Raw`, la variante no destilada de Krea 2, mientras que las muestras publicadas se generaron sobre `krea/Krea-2-Turbo`, la variante optimizada para pocos pasos. Esta separacion implica que el adaptador debe portarse entre dos checkpoints con dinamicas de muestreo distintas, algo que la model card da por resuelto sin detallar el procedimiento.

No se especifican en la informacion disponible el numero de imagenes de entrenamiento, el numero de pasos, la tasa de aprendizaje, el rango del LoRA ni la resolucion de entrenamiento. Tampoco se documenta si hubo regularizacion, aumento de datos o ajuste del text encoder ademas del modulo UNet/DiT. La unica innovacion tecnica declarada es el uso del token disparador `MDaya` para activar el concepto, junto con la recomendacion de inferir a 8 pasos y `guidance_scale=0.0`, coherente con el modo turbo del modelo base.

## Capacidades

- Generacion de imagenes texto-a-imagen condicionada por el concepto aprendido, invocado con el token `MDaya`.
- Personalizacion de identidad o entidad: el adaptador permite situar el sujeto `MDaya` en escenas arbitrarias descritas en el prompt.
- Compatibilidad con el ecosistema `diffusers` mediante `Krea2Pipeline` y `load_lora_weights`.
- Inferencia rapida en pocos pasos (8 pasos documentados) cuando se combina con Krea 2 Turbo.
- Composicion de escena compleja: los ejemplos de la model card incluyen entornos cyberpunk, bibliotecas clasicas y macrofotografia cosmica, lo que sugiere capacidad de integrar el concepto en estilos muy distintos.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, vision de entrada, audio ni modo thinking, por tratarse de un modelo generativo de imagen.
- Capacidades multilingues: no disponibles; los prompts de ejemplo estan en ingles.

## Casos de uso

- Ilustracion editorial con personaje recurrente: usar `MDaya` como sujeto fijo en una serie de articulos o portadas, variando el entorno mediante el prompt y manteniendo la coherencia visual entre piezas gracias al concepto aprendido.
- Creacion de mascotas o avatares de marca: el LoRA permite generar representaciones consistentes de una entidad concreta en multiples estilos (realista, cinematografico, abstracto) sin reentrenar el modelo base en cada iteracion.
- Prototipado rapido de concept art: con 8 pasos de inferencia sobre Krea 2 Turbo, el ciclo de exploracion visual es corto, adecuado para sesiones de ideacion donde se prueban decenas de variaciones de escena.
- Generacion de assets para videojuegos o narrativa transmedia: producir variaciones del personaje en contextos diegeticos distintos (ciudad futurista, biblioteca antigua, espacio profundo) para bocetos de arte conceptual.
- Experimentacion academica con LoRA y DreamBooth: el repositorio sirve como ejemplo minimo de adaptador sobre Krea 2, util para estudiar la transferencia de un LoRA entrenado en un checkpoint RAW a uno Turbo.
- Pruebas de pipelines de difusion en produccion: validar la integracion de `Krea2Pipeline` con `load_lora_weights` en un entorno de despliegue antes de invertir en adaptadores propios.
- Demostraciones de personalizacion en talleres o docencia: el par de checkpoints (RAW para entrenamiento, Turbo para inferencia) ilustra de forma compacta el flujo completo de un LoRA de concepto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas objetivas (FID, CLIP score, similitud de identidad) ni comparaciones cuantitativas con otros LoRA o con el modelo base sin adaptador.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; depende del checkpoint base Krea 2 (RAW o Turbo) y no del LoRA, cuyo peso adicional es marginal frente al modelo completo. El repositorio del adaptador ocupa 1.0 GB.
- GPU recomendadas: no disponibles en la informacion proporcionada; la model card solo muestra `.to("cuda")` con `torch.bfloat16`, lo que exige una GPU con soporte de bfloat16 (serie Ampere o posterior en NVIDIA).
- Cabe en GPU de consumo: no confirmado; al desconocerse el tamano del modelo base Krea 2, no puede afirmarse que quepa en una RTX 4090 o similar.
- Opciones de despliegue: `diffusers` con `Krea2Pipeline` y `load_lora_weights`, segun el ejemplo oficial. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que ademas no aplican a modelos de difusion de imagen.
- Latencia y throughput: no disponibles. El unico dato operativo es que las muestras se generaron con 8 pasos de inferencia y `guidance_scale=0.0` sobre Krea 2 Turbo.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye otros LoRA comparables para Krea 2 ni datos del modelo base que permitan una comparacion cuantitativa con alternativas de la misma categoria.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `schrottteil/dayakr` | no disponible (adaptador LoRA, repo de 1.0 GB) | no disponible | sin benchmarks publicados | Apache 2.0 | Hugging Face |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Sesgos conocidos: no documentados por el autor; al heredar el comportamiento del checkpoint base Krea 2, el adaptador puede reproducir los sesgos de representacion de dicho modelo, que tampoco se detallan.
- Riesgo de alucinacion visual: como todo modelo de difusion, puede generar anatomias, textos o estructuras fisicamente incoherentes, especialmente en escenas complejas o con multiples sujetos.
- Fidelidad del concepto: al no publicarse metricas de similitud de identidad, no hay garantia cuantificada de que `MDaya` se reproduzca de forma consistente fuera de los prompts de ejemplo.
- Limitaciones de contexto e idioma: no se especifica la longitud maxima de prompt ni los idiomas soportados; los ejemplos estan unicamente en ingles.
- Restricciones de licencia: Apache 2.0 permite uso comercial y modificacion, pero el autor no aclara si el entrenamiento uso imagenes con derechos de terceros, lo que traslada al usuario el riesgo legal sobre el concepto `MDaya`.
- Caveat de produccion: el adaptador se entrena en Krea 2 RAW y se muestra en Krea 2 Turbo; no se documenta el procedimiento de portado ni su estabilidad, por lo que conviene validar el resultado en el checkpoint objetivo antes de desplegarlo.
- Madurez del repositorio: cero descargas y cero interacciones en el momento de la ficha, sin issues ni discusion; no hay evidencia de uso en produccion ni de mantenimiento.
- Ausencia de datos de entrenamiento: sin informacion sobre el dataset, no es posible auditar el origen del concepto ni evaluar riesgos de memorizacion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/schrottteil/dayakr
- Modelo base (RAW): https://huggingface.co/krea/Krea-2-Raw
- Modelo base (Turbo, usado en los ejemplos): https://huggingface.co/krea/Krea-2-Turbo
- Libreria diffusers: https://github.com/huggingface/diffusers
