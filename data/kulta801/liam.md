# kulta801/liam

## Resumen

kulta801/liam es un adaptador LoRA de tipo DreamBooth para generacion de imagenes texto-a-imagen, publicado por el usuario kulta801 en HuggingFace. No es un modelo autonomo: se entrena sobre krea/Krea-2-Raw y se ejecuta sobre krea/Krea-2-Turbo, los dos checkpoints de la familia Krea 2 que la propia model card documenta. Su funcion es inyectar un sujeto o concepto personalizado, activado mediante la palabra clave `LIAMX`, dentro del pipeline `Krea2Pipeline` de la libreria diffusers.

El repositorio ocupa 1,0 GB y contiene pesos en formato diffusers/safetensors bajo licencia Apache 2.0. La model card describe el flujo recomendado: entrenar el LoRA sobre el checkpoint RAW (no destilado) y ejecutarlo sobre el checkpoint Turbo (destilado a 8 pasos), porque los LoRA entrenados sobre RAW se expresan con fuerza sobre Turbo. La receta de inferencia documentada es `num_inference_steps=8` y `guidance_scale=0.0`, es decir, sin classifier-free guidance.

Su relevancia practica es la de cualquier LoRA de personalizacion: permite generar variaciones coherentes de un sujeto concreto sin reentrenar el modelo base y con un coste de inferencia bajo. La model card no aporta informacion sobre el dataset de entrenamiento, el numero de pasos, el rango del adaptador ni benchmarks, por lo que la evaluacion objetiva del adaptador queda pendiente. El modelo tiene 0 descargas y 0 likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | adaptador LoRA sobre un modelo de difusion texto-a-imagen (familia Krea 2); la arquitectura interna del modelo base no se detalla en la informacion disponible |
| Parametros totales | no disponible (no se indica el tamano del adaptador ni el del modelo base) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de generacion de imagen; la entrada es un prompt de texto) |
| Tipos de cuantizacion | no disponible (la model card solo documenta ejecucion en bfloat16) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors en formato diffusers (adaptador LoRA); tamano del repositorio 1,0 GB |
| Modelo base de entrenamiento | krea/Krea-2-Raw |
| Modelo base de inferencia | krea/Krea-2-Turbo |
| Palabra de activacion | `LIAMX` |
| Pipeline | text-to-image (`Krea2Pipeline`) |
| Libreria | diffusers |

## Arquitectura y entrenamiento

El objeto publicado es un adaptador LoRA, no un modelo completo. Se ha entrenado con la tecnica DreamBooth sobre el checkpoint krea/Krea-2-Raw, utilizando el entrenador de DreamBooth para Krea 2 incluido en diffusers (`examples/dreambooth/README_krea2.md`). La familia Krea 2 se distribuye en dos variantes: RAW, que es el modelo base no destilado sobre el que se recomienda hacer fine-tuning, y Turbo, un checkpoint destilado a 8 pasos pensado para inferencia rapida. El adaptador se entrena sobre RAW y se aplica en tiempo de inferencia sobre Turbo.

La model card no especifica el numero de imagenes del dataset, la composicion del mismo, el numero de pasos de entrenamiento, el rango o el alpha del LoRA, la tasa de aprendizaje ni si se aplicaron tecnicas de regularizacion. Tampoco documenta el uso de RLHF, DPO ni preferencias humanas, algo por otra parte poco habitual en adaptadores de texto-a-imagen. Las secciones "Training details" y "Limitations and bias" de la model card aparecen marcadas como `TODO`, por lo que no hay informacion adicional del autor.

## Capacidades

- Personalizacion de sujeto o concepto: el adaptador inyecta un elemento concreto en la generacion, activado con el token `LIAMX`, manteniendo la coherencia visual entre distintas muestras.
- Generacion texto-a-imagen dentro del pipeline `Krea2Pipeline`, cargado desde `krea/Krea-2-Turbo` en `bfloat16`.
- Inferencia rapida: la receta documentada usa 8 pasos de muestreo con `guidance_scale=0.0`, lo que reduce el coste por imagen frente a configuraciones con guidance.
- Composicion con otros adaptadores: al ser un LoRA en formato diffusers, admite ponderacion, mezcla y fusion con otros LoRA siguiendo la documentacion de carga de adaptadores.
- No se documentan capacidades de tool calling, function calling, agentes, razonamiento multi-paso, vision de entrada, audio ni modo "thinking"; no aplican a un modelo de difusion de imagen de este tipo.
- No se documentan capacidades multilingues ni el tratamiento de prompts en idiomas distintos del usado en el entrenamiento (presumiblemente ingles, aunque no se confirma).

## Casos de uso

- Generacion de un sujeto recurrente: usar `LIAMX` como prompt para producir variaciones del sujeto aprendido (persona, personaje o mascota) en distintas poses, iluminaciones y encuadres, manteniendo la identidad visual entre imagenes.
- Creacion de avatares e imagenes de perfil: generar retratos consistentes a partir de un prompt corto con el token de activacion, aprovechando los 8 pasos de Turbo para iterar rapidamente sobre el resultado.
- Prototipado de contenido para redes sociales: producir lotes de imagenes tematicas de un mismo sujeto para campanas o publicaciones seriadas, con coste de inferencia bajo.
- Ilustracion editorial y conceptual: incorporar el sujeto personalizado a escenas descritas por texto para bocetos y propuestas visuales previas al arte final.
- Pruebas de concepto de personalizacion: servir como referencia para equipos que quieran evaluar el flujo RAW para entrenar y Turbo para inferir antes de invertir en un entrenamiento propio a mayor escala.
- Composicion con otros LoRA: cargar este adaptador junto con LoRA de estilo o de iluminacion mediante `load_lora_weights` y ajustar pesos para combinar la identidad aprendida con un tratamiento visual concreto.
- Conservacion de material grafico existente: regenerar variaciones de una imagen de referencia sin volver a fotografiar o dibujar al sujeto, util en catalogos o archivos personales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas cuantitativas (FID, CLIP score, similitud de identidad DINO o similares), ni comparaciones con otros adaptadores, ni ejemplos de galeria (`<Gallery />` aparece vacio y el `widget` esta declarado como lista vacia).

## Requisitos de hardware

- Los pesos del adaptador ocupan 1,0 GB en disco; a ellos se suma el espacio del checkpoint base krea/Krea-2-Turbo, que debe descargarse aparte. No se publica el tamano del modelo base.
- VRAM estimada para inferencia: no disponible. La model card solo indica ejecucion en una GPU CUDA con `torch_dtype=torch.bfloat16`; no se especifica un minimo de memoria.
- GPU recomendadas: no disponibles. El uso de `bfloat16` implica una GPU con soporte nativo para ese tipo, lo habitual en generaciones recientes de NVIDIA (Ampere, Ada y posteriores) y en aceleradores equivalentes.
- Compatibilidad con GPU de consumo: probable si el checkpoint base Turbo cabe en la memoria disponible, pero no se confirma en la informacion proporcionada.
- Opciones de despliegue documentadas: diffusers con `Krea2Pipeline.from_pretrained("krea/Krea-2-Turbo", torch_dtype=torch.bfloat16).to("cuda")` y `pipe.load_lora_weights("kulta801/liam")`. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles. Cualitativamente, la receta de 8 pasos sin guidance reduce el numero de evaluaciones del modelo frente a configuraciones con classifier-free guidance.

## Comparativa con modelos similares

| Modelo | Tipo | Modelo base | Pasos de inferencia | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| kulta801/liam | LoRA DreamBooth de personalizacion | krea/Krea-2-Raw (entrenamiento) y krea/Krea-2-Turbo (inferencia) | 8, sin guidance | Apache 2.0 | HuggingFace, 0 descargas y 0 likes |
| krea/Krea-2-Turbo | checkpoint destilado de texto-a-imagen | no aplica | 8 (destilado) | no disponible en la informacion consultada | HuggingFace, referenciado como base |
| krea/Krea-2-Raw | checkpoint base no destilado de texto-a-imagen | no aplica | no disponible | no disponible en la informacion consultada | HuggingFace, referenciado como base de entrenamiento |

No se dispone de datos de rendimiento ni de parametros del modelo base, por lo que no es posible una comparacion cuantitativa con otros adaptadores de personalizacion de la misma categoria. Cualquier comparacion con alternativas como LoRA sobre SDXL o FLUX quedaria fuera de la informacion proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: la model card no documenta ningun analisis de sesgos; la seccion "Limitations and bias" esta marcada como `TODO`. Un adaptador de personalizacion entrena sobre un conjunto reducido de imagenes y puede reproducir los sesgos presentes en ellas.
- Riesgo de sobreajuste al sujeto: al ser un LoRA DreamBooth, es probable que el modelo reproduzca el sujeto con fidelidad solo en condiciones similares a las del entrenamiento y que pierda coherencia en escenas muy alejadas.
- Riesgo de alucinacion visual: como todo modelo de difusion, puede generar anatomias incorrectas, objetos incongruentes o texto ilegible dentro de la imagen.
- Limitaciones de idioma: no se especifica que idiomas soporta el prompt; la palabra de activacion es `LIAMX` y la model card esta en ingles.
- Restricciones de licencia: tanto el adaptador como el modelo base se declaran bajo Apache 2.0, lo que en principio permite uso comercial, pero conviene verificar la licencia de krea/Krea-2-Raw y krea/Krea-2-Turbo, no confirmada en la informacion disponible.
- Ausencia de datos de entrenamiento: al no publicarse el dataset, no es posible auditar la procedencia de las imagenes ni los derechos asociados al sujeto representado.
- Madurez: el repositorio tiene 0 descargas y 0 likes y fue creado y actualizado el mismo dia (27 de septiembre de 2026), sin validacion externa conocida.
- Dependencia del pipeline: el adaptador solo funciona con el ecosistema Krea 2 y diffusers; no es portable a otros modelos base sin reentrenamiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/kulta801/liam
- Archivos y versiones (safetensors del LoRA): https://huggingface.co/kulta801/liam/tree/main
- Modelo base de entrenamiento: https://huggingface.co/krea/Krea-2-Raw
- Modelo base de inferencia: https://huggingface.co/krea/Krea-2-Turbo
- Documentacion de DreamBooth en diffusers para Krea 2: https://github.com/huggingface/diffusers/blob/main/examples/dreambooth/README_krea2.md
- Documentacion de carga de adaptadores LoRA en diffusers: https://huggingface.co/docs/diffusers/main/en/using-diffusers/loading_adapters
- Articulo original de DreamBooth: https://dreambooth.github.io/
- Repositorio de diffusers: https://github.com/huggingface/diffusers
