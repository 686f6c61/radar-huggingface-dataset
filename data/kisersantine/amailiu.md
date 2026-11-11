# kisersantine/amailiu

## Resumen

`kisersantine/amailiu` es un adaptador LoRA de tipo DreamBooth para el modelo de difusion texto-a-imagen Krea 2, desarrollado por el usuario kisersantine y publicado en Hugging Face bajo licencia Apache 2.0. El adaptador introduce un concepto visual concreto, invocado mediante el token `AmaiLiu`, sobre el modelo base `krea/Krea-2-Raw`. No se trata de un modelo fundacional, sino de un peso adicional de bajo rango que se carga sobre el pipeline Krea 2 para personalizar la generacion.

El repositorio tiene un tamano de 0,8 GB, lo que es coherente con un adaptador LoRA (no con un modelo completo), e incluye tres imagenes de muestra generadas con el modelo Krea 2 Turbo en 8 pasos de inferencia. La model card documenta el uso mediante la libreria `diffusers` y la clase `Krea2Pipeline`, junto con el prompt de instancia y ejemplos de generacion en estilos muy distintos (cyberpunk, pintura al oleo fantastica y fotografia noir en blanco y negro).

La relevancia de esta ficha es limitada pero concreta: sirve como ejemplo de personalizacion de Krea 2 mediante LoRA y como referencia para desarrolladores que quieran reutilizar el formato de entrenamiento e inferencia. No hay informacion publicada sobre el dataset de entrenamiento, los hiperparametros ni evaluaciones cuantitativas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre modelo de difusion Krea 2; pipeline `Krea2Pipeline` en diffusers |
| Parametros totales | no disponible (el repo pesa 0,8 GB; no se desglosa el numero de parametros del adaptador) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo texto-a-imagen; no se especifica longitud de prompt maxima) |
| Tipos de cuantizacion | no disponible (la model card usa `torch.bfloat16` en el ejemplo) |
| Idiomas soportados | no disponible (los prompts de ejemplo estan en ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | pesos LoRA compatibles con `diffusers` (formato exacto de fichero no especificado) |

## Arquitectura y entrenamiento

El adaptador se basa en la tecnica DreamBooth-LoRA aplicada sobre Krea 2. DreamBooth permite asociar un sujeto o concepto concreto a un token unico (`AmaiLiu`) mediante un entrenamiento de ajuste fino supervisado con unas pocas imagenes de referencia; LoRA reduce el coste computacional y el tamano del artefacto resultante al congelar los pesos del modelo base e inyectar matrices de bajo rango en las capas de atencion. La model card indica que el entrenamiento se realizo sobre Krea 2 RAW y que las muestras se generaron con Krea 2 Turbo, lo que sugiere que el adaptador es compatible con ambas variantes del modelo base.

No se proporciona informacion sobre el numero de imagenes de entrenamiento, el numero de pasos, la tasa de aprendizaje, la resolucion de entrenamiento ni la composicion del dataset. Tampoco se documenta si se aplicaron tecnicas adicionales como regularizacion por clase, augmentacion o decodificacion especulativa. La unica innovacion tecnica destacable es el propio formato LoRA, que permite distribuir el concepto en un fichero de 0,8 GB y cargarlo dinamicamente sobre el pipeline base sin reentrenar el modelo completo.

## Capacidades

- Generacion de imagenes texto-a-imagen condicionada por el token `AmaiLiu`, que activa el concepto aprendido.
- Compatibilidad con el pipeline `Krea2Pipeline` de `diffusers` mediante `load_lora_weights`.
- Funcionamiento con el modelo Krea 2 Turbo en regimen de pocos pasos (8 pasos en los ejemplos) y `guidance_scale=0.0`.
- Capacidad de aplicar el concepto en estilos visuales muy distintos: escenas cinematograficas cyberpunk, pintura al oleo fantastica y fotografia noir en blanco y negro.
- No se documenta soporte de tool calling, agentes, razonamiento multi-paso ni capacidades multimodales de entrada (texto, audio, video).
- No se documenta capacidad multilingue; los prompts de ejemplo estan en ingles.

## Casos de uso

- Generacion de retratos consistentes de un personaje: el token `AmaiLiu` permite mantener la identidad visual del sujeto en multiples escenas y estilos, util para storyboards, comics o prototipos de videojuegos.
- Ilustracion editorial tematica: aplicar el concepto en estilos tan dispares como oleo fantastico o fotografia noir facilita cubrir briefs artisticos distintos con un unico adaptador.
- Pruebas de concepto de personalizacion con LoRA: el repo sirve como plantilla reproducible para entrenar y desplegar adaptadores DreamBooth sobre Krea 2 en un entorno `diffusers`.
- Prototipado rapido de campanas visuales: con Krea 2 Turbo y 8 pasos, el coste de inferencia es bajo, lo que permite iterar sobre variaciones de prompt en minutos.
- Integracion en pipelines de generacion por lotes: el adaptador se puede cargar una vez y reutilizar para generar cientos de imagenes con el mismo concepto en un servicio interno.
- Experimentacion academica sobre personalizacion de modelos de difusion: al estar bajo Apache 2.0, el adaptador se puede inspeccionar, modificar y redistribuir sin restricciones de licencia adicionales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; depende del modelo base Krea 2, no del adaptador LoRA. El adaptador anade una sobrecarga minima sobre el modelo base.
- GPU recomendadas: no disponible en la informacion proporcionada. El ejemplo de la model card usa `torch_dtype=torch.bfloat16` y `.to("cuda")`, lo que requiere una GPU compatible con bfloat16 (Ampere o posterior, como A100, H100, RTX 3090, RTX 4090).
- Compatibilidad con GPU de consumo: no confirmada; depende de los requisitos del modelo base Krea 2, que no se detallan.
- Opciones de despliegue: `diffusers` con `Krea2Pipeline` y `load_lora_weights` segun la model card. No se documentan opciones como vLLM, llama.cpp, Ollama o TGI (no aplicables a un modelo de difusion de imagen en este formato).
- Latencia y throughput: no disponibles. La model card menciona generacion en 8 pasos con Krea 2 Turbo, pero no publica tiempos por imagen.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye otros adaptadores LoRA comparables para Krea 2 ni datos de rendimiento que permitan una comparacion cuantitativa.

## Limitaciones y advertencias

- No se documenta el dataset de entrenamiento, por lo que se desconocen los sesgos potenciales del concepto aprendido.
- Riesgo de alucinacion visual y de sobreajuste al concepto: al ser un LoRA DreamBooth con un token unico, el modelo puede reproducir el sujeto de forma poco flexible o introducir artefactos en composiciones complejas.
- No hay informacion sobre el numero de imagenes de entrenamiento ni sobre la diversidad de las mismas, lo que impide evaluar la robustez del adaptador.
- La model card no especifica la longitud maxima de prompt ni el comportamiento multilingue; los ejemplos estan en ingles.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base Krea 2 puede tener sus propias condiciones de licencia que deben verificarse por separado antes de un despliegue en produccion.
- El repositorio tiene solo 14 descargas y 0 likes en el momento de la consulta, lo que indica una validacion comunitaria muy limitada.
- No se han publicado evaluaciones cuantitativas ni comparaciones con otros adaptadores, por lo que no se puede garantizar la calidad en dominios distintos a los de las muestras.

## Enlaces

- Hugging Face: https://huggingface.co/kisersantine/amailiu
- Modelo base: https://huggingface.co/krea/Krea-2-Raw
- Modelo Turbo (usado en las muestras): https://huggingface.co/krea/Krea-2-Turbo
- Libreria diffusers: https://github.com/huggingface/diffusers
