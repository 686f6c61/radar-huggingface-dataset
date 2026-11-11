# kisersantine/luna

## Resumen

Luna es un adaptador LoRA de tipo DreamBooth para el modelo de difusion Krea 2, desarrollado por el usuario kisersantine y publicado en Hugging Face bajo licencia Apache 2.0. Su funcion es introducir un concepto personalizado —invocado mediante el token `Luna`— en las generaciones de imagen del modelo base, sin necesidad de reentrenar el modelo completo. El adaptador se entreno sobre Krea 2 RAW y las muestras publicadas se generaron con Krea 2 Turbo en 8 pasos de inferencia.

El modelo resuelve el problema clasico de personalizacion en difusion texto-a-imagen: incorporar un sujeto o estilo concreto (en este caso, un concepto llamado Luna) que el modelo base no conoce de forma nativa. Al ser un LoRA, el peso del adaptador es reducido (el repositorio ocupa 1,0 GB) y se carga de forma dinamica sobre el pipeline de Krea 2, lo que permite combinarlo con el modelo base sin duplicar los pesos completos.

Es relevante para desarrolladores que trabajan con Krea 2 y necesitan personalizacion ligera mediante la libreria diffusers. No obstante, el repositorio no incluye informacion sobre el dataset de entrenamiento, hiperparametros, numero de pasos ni evaluacion cuantitativa, y el modelo no registra descargas ni interacciones en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (DreamBooth) sobre modelo de difusion Krea 2 |
| Parametros totales | no disponible (adaptador LoRA; tamano del repo 1,0 GB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo texto-a-imagen) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el prompt de instancia es "Luna") |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (compatible con diffusers; pesos LoRA) |

## Arquitectura y entrenamiento

Luna es un adaptador LoRA entrenado con la tecnica DreamBooth sobre el modelo base krea/Krea-2-Raw. La arquitectura subyacente es la del modelo de difusion Krea 2, y el adaptador se inyecta en sus capas mediante la API `load_lora_weights` de diffusers. El token de activacion es `Luna`, que debe incluirse en el prompt para invocar el concepto aprendido.

No se dispone de informacion sobre el dataset de entrenamiento (numero de imagenes, resolucion, composicion), el numero de pasos, la tasa de aprendizaje, el rango del LoRA ni si se aplicaron tecnicas adicionales como regularizacion o aumento de datos. Las muestras publicadas se generaron con Krea 2 Turbo a 8 pasos y `guidance_scale=0.0`, lo que indica que el adaptador es compatible tanto con la variante RAW (entrenamiento) como con Turbo (inferencia rapida).

## Capacidades

- Generacion de imagenes texto-a-imagen condicionada por el token `Luna` para introducir el concepto personalizado.
- Personalizacion ligera sobre Krea 2 sin reentrenar el modelo base.
- Compatibilidad con la libreria diffusers mediante `Krea2Pipeline` y `load_lora_weights`.
- Funcionamiento en modo de pocos pasos (8 pasos) con Krea 2 Turbo y `guidance_scale=0.0`.
- Composicion de escenas complejas: las muestras incluyen entornos cyberpunk, victorianos y submarinos con el concepto Luna integrado.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, vision, audio ni modo thinking (no aplica a un modelo texto-a-imagen).

## Casos de uso

- Personalizacion de marca: entrenar y desplegar un LoRA como Luna para generar imagenes consistentes de una mascota o personaje en distintos entornos (ciudad cyberpunk, jardin victoriano, templo submarino) manteniendo la identidad visual del concepto.
- Ilustracion editorial y conceptual: usar el token `Luna` para producir ilustraciones de portada o articulos donde el personaje aparezca integrado en escenas diversas, aprovechando la capacidad del modelo base para composiciones complejas.
- Prototipado rapido de personajes: generar variaciones de un personaje en 8 pasos con Krea 2 Turbo para iterar sobre direcciones de arte antes de producir assets finales.
- Storyboarding y previsualizacion: crear secuencias de imagenes coherentes de un mismo sujeto en localizaciones distintas para pitches o guiones.
- Generacion de assets para videojuegos o animacion: producir referencias visuales de un personaje llamado Luna en multiples ambientaciones para guiar al equipo de arte.
- Experimentacion en investigacion de personalizacion: servir como ejemplo reproducible de DreamBooth-LoRA sobre Krea 2 para estudiar la transferencia de concepto entre las variantes RAW y Turbo.
- Integracion en pipelines de diffusers: cargar el adaptador sobre `Krea2Pipeline` en flujos automatizados de generacion de imagenes con prompts que incluyan el token de activacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma especifica para este adaptador; depende del modelo base Krea 2. El repositorio del LoRA ocupa 1,0 GB, que se suma a los pesos del modelo base al cargarse.
- GPU recomendadas: no disponible en la informacion proporcionada. Al ser un LoRA sobre un modelo de difusion, se recomienda consultar los requisitos del modelo base krea/Krea-2-Raw y krea/Krea-2-Turbo.
- Compatibilidad con GPU de consumo: no confirmada en la informacion disponible; depende del modelo base y de la precision utilizada (el ejemplo oficial usa `torch.bfloat16` en CUDA).
- Opciones de despliegue: diffusers (`Krea2Pipeline` con `load_lora_weights`). No se documentan otras opciones como vLLM, llama.cpp, Ollama o TGI (no aplicables a difusion texto-a-imagen en este contexto).
- Latencia y throughput: no disponibles. Las muestras se generaron con 8 pasos de inferencia en Krea 2 Turbo, lo que sugiere un coste de generacion reducido, pero no se aportan medidas.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables en la documentacion proporcionada. Como referencia estructural, este adaptador se puede contrastar con otros LoRA de personalizacion para Krea 2, pero no se han identificado alternativas concretas con datos verificables en la informacion disponible.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| kisersantine/luna | no disponible (LoRA, repo 1,0 GB) | no aplica | no disponible | Apache 2.0 | Hugging Face |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- No se documenta el dataset de entrenamiento, por lo que se desconocen los sesgos potenciales introducidos por el concepto Luna.
- Riesgo de alucinacion visual: como todo modelo de difusion, puede generar composiciones incoherentes o artefactos, especialmente en escenas complejas o con el token de activacion en contextos no vistos durante el entrenamiento.
- El adaptador solo se activa con el token `Luna`; su uso sin dicho token no reproduce el concepto.
- No se especifican los idiomas soportados en los prompts; el unico prompt documentado esta en ingles.
- Licencia Apache 2.0 permite uso comercial, pero se recomienda verificar las condiciones del modelo base krea/Krea-2-Raw y krea/Krea-2-Turbo, de los que depende.
- El modelo no registra descargas ni likes en el momento de la consulta, lo que limita la evidencia de validacion por parte de la comunidad.
- No hay informacion sobre el rango del LoRA, el numero de pasos de entrenamiento ni la resolucion de las imagenes de entrenamiento, lo que dificulta reproducir o ajustar el adaptador.
- Para produccion, conviene validar cualitativamente la consistencia del concepto en distintos prompts y semillas antes de desplegarlo.

## Enlaces

- Hugging Face: https://huggingface.co/kisersantine/luna
- Modelo base: https://huggingface.co/krea/Krea-2-Raw
- Variante de inferencia: https://huggingface.co/krea/Krea-2-Turbo
- Libreria diffusers: https://github.com/huggingface/diffusers
