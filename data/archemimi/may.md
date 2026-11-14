# Archemimi/may

## Resumen

Archemimi/may es un adaptador LoRA de tipo DreamBooth para el modelo de difusion texto-a-imagen Krea 2. Lo publica el usuario Archemimi en Hugging Face y su funcion es introducir un concepto visual concreto, invocado mediante el token `maybout`, en las generaciones del modelo base. El repositorio ocupa 0,8 GB y se distribuye con licencia Apache 2.0.

El adaptador esta entrenado sobre Krea-2-Raw y los ejemplos de la model card se han generado sobre Krea-2-Turbo con 8 pasos de inferencia y `guidance_scale=0.0`. Se integra en el ecosistema diffusers mediante `Krea2Pipeline` y `load_lora_weights`, por lo que no requiere un pipeline propio: se carga sobre el modelo base ya instanciado.

Es relevante para quien necesite personalizar Krea 2 con un concepto propio (personaje, objeto o estilo) sin reentrenar el modelo completo, manteniendo el coste de almacenamiento y de inferencia del adaptador. La informacion publica es escasa: no hay detalles sobre el dataset de entrenamiento, hiperparametros ni evaluaciones cuantitativas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre un modelo de difusion texto-a-imagen; pipeline `Krea2Pipeline` en diffusers |
| Parametros totales | no disponible (el adaptador ocupa 0,8 GB en el repositorio) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo texto-a-imagen; sin ventana de contexto de texto) |
| Tipos de cuantizacion | no disponible (la model card solo documenta carga en `bfloat16`) |
| Idiomas soportados | no disponible (las indicaciones de texto de los ejemplos estan en ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | pesos compatibles con diffusers (`load_lora_weights`); no se especifica el formato de fichero |

## Arquitectura y entrenamiento

El artefacto es un LoRA de bajo rango aplicado sobre Krea 2, un modelo de difusion texto-a-imagen. La model card lo describe como un DreamBooth-LoRA entrenado sobre Krea 2 RAW y presentado sobre Krea 2 Turbo. El entrenamiento DreamBooth asocia un token raro, `maybout`, con el concepto objetivo, de modo que el adaptador modula los pesos del modelo base para reproducir ese concepto cuando aparece el token en el prompt.

No se publican datos sobre el numero de imagenes de entrenamiento, la composicion del dataset, el numero de pasos, la tasa de aprendizaje, el rango del LoRA ni si se aplicaron tecnicas adicionales (regularizacion, captions automaticos, etc.). Tampoco se documenta ningun proceso de alineacion o refinamiento posterior; en modelos de difusion ese concepto no aplica del mismo modo que en LLM.

## Capacidades

- Generacion de imagenes texto-a-imagen condicionada por el concepto `maybout`, heredando las capacidades del modelo base Krea 2.
- Inyeccion de un concepto visual especifico mediante un unico token de activacion, sin necesidad de describirlo en cada prompt.
- Composicion del concepto en escenas diversas: la model card muestra ejemplos en un entorno cyberpunk, una biblioteca antigua y un paisaje volcanico.
- Compatibilidad con el ecosistema diffusers: carga mediante `pipe.load_lora_weights("Archemimi/may")` sobre `Krea2Pipeline`.
- Inferencia rapida sobre Krea 2 Turbo: los ejemplos se generan con 8 pasos y `guidance_scale=0.0`.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, vision de entrada, audio ni modo thinking; no aplican a este tipo de modelo.

## Casos de uso

- Ilustracion de personaje recurrente: usar `maybout` en los prompts para mantener la identidad visual del concepto en una serie de imagenes (portadas, capitulos, escenas), aprovechando que el LoRA fija sus rasgos sin repetir la descripcion completa en cada generacion.
- Creacion de assets para videojuegos o animacion: generar variaciones del concepto en distintos entornos (interiores, exteriores, iluminacion nocturna) con coherencia visual, como muestran los ejemplos de la model card.
- Prototipado rapido de concept art: producir bocetos en 8 pasos con Krea 2 Turbo para iterar sobre direccion de arte antes de encargar un render final de mayor calidad sobre Krea 2 RAW.
- Branding y mascotas de marca: entrenar y desplegar un LoRA de este tipo para generar una mascota corporativa en contextos diversos (campanas, redes sociales, material promocional) manteniendo consistencia.
- Storytelling visual y comics: combinar el token `maybout` con descripciones de escena para generar paneles consecutivos con el mismo personaje u objeto.
- Generacion de material para pruebas de pipelines: usar el adaptador como caso de prueba de integracion de LoRA en flujos diffusers (carga, mezcla de pesos, inferencia con Turbo) antes de desplegar adaptadores propios en produccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma especifica para el adaptador. Depende enteramente del modelo base Krea 2; el LoRA anade una sobrecarga pequena respecto a la inferencia del base.
- GPU recomendadas: no disponible en la informacion proporcionada. La model card solo indica ejecucion en CUDA con `torch_dtype=torch.bfloat16`.
- Compatibilidad con GPU de consumo: no confirmada en la documentacion; depende de los requisitos de Krea 2, que no se detallan.
- Opciones de despliegue: diffusers (`Krea2Pipeline` + `load_lora_weights`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplican a un modelo de difusion de este tipo).
- Latencia y throughput: no disponibles. Los ejemplos usan 8 pasos de inferencia sobre Krea 2 Turbo, pero no se publican tiempos.

## Comparativa con modelos similares

| Modelo | Tipo | Modelo base | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Archemimi/may | LoRA DreamBooth texto-a-imagen | krea/Krea-2-Raw | no disponible (repo de 0,8 GB) | no aplica | Apache 2.0 | Hugging Face, 20 descargas |
| krea/Krea-2-Raw | Modelo de difusion texto-a-imagen | — | no disponible | no aplica | no disponible en esta ficha | Hugging Face |
| krea/Krea-2-Turbo | Modelo de difusion texto-a-imagen (pocos pasos) | — | no disponible | no aplica | no disponible en esta ficha | Hugging Face |
| Otros LoRA para Krea 2 | Adaptadores DreamBooth | krea/Krea-2-Raw | no disponible | no aplica | variable | Hugging Face |

No se dispone de datos de rendimiento ni de parametros de los modelos comparados en la informacion proporcionada, por lo que la comparacion se limita a tipo, base, licencia y disponibilidad.

## Limitaciones y advertencias

- Informacion de entrenamiento ausente: no se documentan dataset, hiperparametros ni rango del LoRA, lo que dificulta reproducir o auditar el adaptador.
- Riesgo de sobreajuste al concepto: al ser un DreamBooth-LoRA con un token dedicado, puede degradar la diversidad de las generaciones o filtrar el concepto en prompts donde no se invoca `maybout`.
- Dependencia estricta del modelo base: solo es valido sobre Krea 2 (entrenado sobre Krea-2-Raw, mostrado sobre Krea-2-Turbo); no funcionara con otros modelos de difusion.
- Idioma: los prompts de ejemplo estan en ingles; no se documenta el comportamiento con prompts en castellano.
- Sesgos: no se han publicado evaluaciones de sesgo; al heredar el modelo base, puede reproducir los sesgos de sus datos de entrenamiento.
- Alucinacion visual: como todo modelo de difusion, puede generar composiciones incoherentes o anatomicamente incorrectas, especialmente con prompts complejos.
- Licencia: el adaptador es Apache 2.0, pero el uso comercial depende tambien de la licencia del modelo base Krea 2, que no se detalla en la informacion disponible; conviene verificarla antes de un despliegue en produccion.
- Madurez: el repositorio tiene 20 descargas y 0 likes, sin validacion externa ni resultados de benchmarks.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Archemimi/may
- Modelo base: https://huggingface.co/krea/Krea-2-Raw
- Modelo Turbo citado en la model card: https://huggingface.co/krea/Krea-2-Turbo
