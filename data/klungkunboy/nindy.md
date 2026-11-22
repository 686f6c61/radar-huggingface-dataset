# klungkunboy/nindy

## Resumen

`klungkunboy/nindy` es un adaptador LoRA de tipo DreamBooth para el modelo de difusion texto-a-imagen Krea 2, desarrollado por el usuario klungkunboy y publicado en Hugging Face. El LoRA introduce un concepto visual personalizado invocado mediante el token `@nindy`, que permite generar imagenes coherentes de un sujeto o estilo concreto en combinacion con el modelo base. Se entrenó sobre Krea 2 RAW y los ejemplos de la model card se generaron con Krea 2 Turbo en 8 pasos de inferencia.

El repositorio ocupa 0,8 GB y se distribuye con licencia Apache 2.0. La arquitectura subyacente es la del modelo base Krea 2 (un modelo de difusion texto-a-imagen), sobre el que el LoRA aplica una adaptacion de bajo rango. No se especifican en la informacion disponible el numero de parametros del modelo base, la longitud de contexto textual ni los idiomas soportados.

Su relevancia es practica: permite a desarrolladores y artistas incorporar un concepto personalizado (`@nindy`) en pipelines de generacion de imagenes basados en diffusers, sin necesidad de reentrenar el modelo completo. Al ser un LoRA, el coste de almacenamiento y de carga es reducido frente a un fine-tuning completo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (DreamBooth) sobre modelo de difusion texto-a-imagen Krea 2 |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | pesos LoRA compatibles con diffusers (no se detalla el formato exacto de los ficheros) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de DreamBooth entrenado sobre Krea 2 RAW, el checkpoint base del modelo Krea 2. DreamBooth es una tecnica de personalizacion que ajusta un numero reducido de parametros para que el modelo asocie un token unico (`@nindy`) con un concepto visual concreto, preservando el conocimiento previo del modelo base. El LoRA se aplica sobre el pipeline de difusion y se carga con `pipe.load_lora_weights()` en diffusers.

No se dispone de informacion sobre el numero de imagenes de entrenamiento, el numero de pasos, la composicion del dataset, el rango del LoRA ni si se aplicaron tecnicas adicionales como regularizacion o prior preservation. Los ejemplos de la model card indican que el adaptador se probó sobre Krea 2 Turbo con 8 pasos y `guidance_scale=0.0`, lo que sugiere compatibilidad con la variante Turbo del modelo base.

## Capacidades

- Generacion de imagenes texto-a-imagen condicionada por el token `@nindy`.
- Personalizacion de un concepto visual concreto (sujeto o estilo) mediante DreamBooth.
- Compatibilidad con el pipeline `Krea2Pipeline` de diffusers.
- Funcionamiento con el modelo base Krea 2 Turbo en regimen de pocos pasos (8 pasos en los ejemplos).
- Composicion de escenas variadas: retrato cinematografico, pintura al oleo, fotografia candid, segun los prompts de ejemplo.
- No se documentan capacidades de tool calling, agentes, vision, audio ni modo thinking (no aplica a un modelo de difusion).

## Casos de uso

- Generacion de retratos personalizados: usar `@nindy` en prompts para producir imagenes coherentes del concepto en distintos estilos (cinematografico, pictorico, fotografico) sin reentrenar el modelo base.
- Prototipado de personajes para narrativa visual: generar variaciones de un mismo personaje en escenarios distintos (ciberpunk, fantasia, cotidiano) para guiones, storyboards o comics.
- Creacion de contenido para redes sociales: producir imagenes tematicas de forma rapida cargando el LoRA sobre Krea 2 Turbo con 8 pasos, lo que reduce el coste computacional por imagen.
- Integracion en pipelines de diffusers: cargar el adaptador con `pipe.load_lora_weights()` dentro de aplicaciones Python existentes que ya usen Krea 2.
- Experimentacion artistica: combinar el token `@nindy` con estilos y tecnicas diversas (oleo, fotografia, render 3D) para explorar variaciones creativas.
- Investigacion sobre personalizacion: servir como ejemplo de LoRA DreamBooth para estudiar como un token unico condiciona la generacion en modelos de difusion modernos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada; depende del modelo base Krea 2 y de la precision usada (los ejemplos usan `torch.bfloat16`).
- GPU recomendadas: no disponibles; el ejemplo de la model card usa `cuda` con `bfloat16`, sin especificar modelo de GPU.
- Compatibilidad con GPU de consumo: no confirmada en la informacion disponible.
- Opciones de despliegue: diffusers (`Krea2Pipeline`) segun el ejemplo de la model card; no se documentan otras opciones como vLLM, llama.cpp, Ollama o TGI (no aplicables a difusion en la mayoria de casos).
- Latencia y throughput: no disponibles; los ejemplos usan 8 pasos de inferencia sobre Krea 2 Turbo, pero no se aportan tiempos.

## Comparativa con modelos similares

| Modelo | Tipo | Modelo base | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| klungkunboy/nindy | LoRA DreamBooth | krea/Krea-2-Raw | no disponible | no disponible | Apache 2.0 | Hugging Face |
| krea/Krea-2-Raw | Modelo de difusion texto-a-imagen | no aplica | no disponible | no disponible | no disponible | Hugging Face |
| krea/Krea-2-Turbo | Modelo de difusion texto-a-imagen (pocos pasos) | no aplica | no disponible | no disponible | no disponible | Hugging Face |

No se dispone de datos de rendimiento ni de especificaciones detalladas de los modelos comparables en la informacion proporcionada, por lo que la comparacion se limita a la relacion de dependencia (el LoRA requiere Krea 2 como base).

## Limitaciones y advertencias

- El adaptador solo funciona junto con el modelo base Krea 2; no es un modelo autonomo.
- No se documentan sesgos conocidos, pero al ser un LoRA de personalizacion hereda los sesgos del modelo base Krea 2.
- Riesgo de alucinacion visual y de deriva estilistica fuera del concepto entrenado; la coherencia del token `@nindy` depende de la calidad del dataset de entrenamiento, no documentado.
- No se especifican limitaciones de idioma; los prompts de ejemplo estan en ingles.
- La licencia es Apache 2.0, lo que permite uso comercial, pero conviene verificar la licencia del modelo base Krea 2 antes de desplegar en produccion.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validacion comunitaria del adaptador.
- No se aportan datos sobre el rango del LoRA, el numero de imagenes de entrenamiento ni la estabilidad del concepto en prompts complejos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/klungkunboy/nindy
- Modelo base Krea 2 RAW: https://huggingface.co/krea/Krea-2-Raw
- Modelo base Krea 2 Turbo (usado en los ejemplos): https://huggingface.co/krea/Krea-2-Turbo
