# kitaniai/morgana-1.2

## Resumen

Kitani Morgana v1.2 es un modelo de generacion de imagenes a partir de texto (text-to-image) desarrollado por Kitani en colaboracion con ShuttleAI, especializado en fotografia realista. Se trata de un fine-tuning de FLUX.2-klein-base-4B de Black Forest Labs, entrenado en parte con el dataset Shuttle 3 Jaguar, y su objetivo declarado es producir imagenes que parezcan tomadas con una camara real: luz natural, color honesto y detalle del mundo fisico.

A diferencia de los modelos genericos de imagen, Morgana se centra en un nicho concreto: fotografia creible (retratos tipo selfie, macros de materiales, paisajes cinematicos, escenas nocturnas con neon) y estilos artisticos bajo demanda (oleo, acuarela, anime, renders 3D hiperrealistas). Tiene aproximadamente 3.909 millones de parametros y se distribuye en formatos safetensors y GGUF, con integracion nativa en la libreria diffusers mediante la clase Flux2KleinPipeline.

Su relevancia actual radica en la demanda de modelos abiertos especializados en realismo fotografico, donde los modelos base suelen producir renders con aspecto plastico o HDR excesivo. Morgana aborda ese problema con un ajuste fino orientado a texturas, grano de pelicula e imperfecciones naturales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Flux (diffusion transformer), pipeline Flux2KleinPipeline |
| Parametros totales | 3.908.967.936 (~3,9 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens de secuencia maxima para el prompt (max_sequence_length) |
| Tipos de cuantizacion | safetensors (bfloat16) y GGUF |
| Idiomas soportados | no disponible (modelo de imagen; prompts en ingles recomendados) |
| Licencia | other (licencia propia de Kitani, Inc., https://kitani.ai) |
| Formato de pesos | safetensors y GGUF |

## Arquitectura y entrenamiento

Morgana v1.2 parte de FLUX.2-klein-base-4B, un modelo de difusion de la familia Flux basado en arquitectura transformer para difusion. El pipeline oficial es Flux2KleinPipeline de diffusers, con una configuracion de inferencia por defecto de 28 pasos y guidance scale de 4,0 segun los ejemplos del autor. No se ha publicado informacion sobre el metodo exacto de fine-tuning (LoRA, full fine-tuning) ni sobre el numero de pasos de entrenamiento.

El entrenamiento se realizo en parte sobre el dataset Shuttle 3 Jaguar, en colaboracion con ShuttleAI. No se ha publicado informacion sobre el tamano del dataset, la composicion de los datos ni si se aplicaron tecnicas de alineacion posteriores. El enfoque declarado del ajuste es la fidelidad fotografica: luz de ventana suave, sombras profundas, grano tipo pelicula y caracter de lente sutil en lugar de renders plasticos.

## Capacidades

- Generacion de imagenes fotorrealistas a partir de texto, con especial fuerza en luz natural, grano de pelicula y caracter de lente.
- Retratos y selfies realistas: camara frontal, momentos espontaneos, poros visibles, cabello despeinado y encuadres imperfectos.
- Detalle macro y de materiales: gotas de agua, barbas de plumas, trama de tejidos, veta de madera, metal oxidado y cuero gastado.
- Paisajes cinematicos: auroras reflejadas en lagos alpinos, olas sobre arena negra, niebla entre pinos.
- Escenas nocturnas atmosfericas: neones sobre asfalto mojado y exposiciones en baja luz creibles.
- Estilos artisticos bajo demanda: oleo empastado, acuarela luminosa, anime tipo fotograma de pelicula y renders 3D hiperrealistas.
- Resolucion de trabajo de 1024x1024 en los ejemplos oficiales (ajustable via parametros width/height).
- No soporta negative prompts en el pipeline oficial.
- No soporta tool calling, agentes ni razonamiento multi-paso (no es un modelo de lenguaje).

## Casos de uso

- Generacion de stock fotografico sintetico: agencias y creadores pueden producir imagenes de archivo realistas (paisajes, macros, escenas urbanas) sin sesiones fotograficas, aprovechando el realismo de texturas y materiales del modelo.
- Prototipado de arte conceptual para cine y videojuegos: la generacion de fotogramas con iluminacion cinematografica (golden hour, noche con neon) permite explorar look and feel de escenas antes de produccion.
- Contenido para marketing y redes sociales: generacion de imagenes de producto con texturas creibles (cuero, madera, metal) y composiciones con luz natural para campanas visuales.
- Ilustracion editorial en estilos artisticos: portadas y articulos con oleo, acuarela o anime generados bajo demanda, utiles para medios que necesitan arte original rapido.
- Investigacion en generacion de imagenes: al ser un fine-tuning abierto de FLUX.2-klein, sirve como base para estudios de especializacion fotografica y comparativas entre checkpoints de la familia Flux.
- Generacion de assets para diseno grafico: texturas macro (gotas, tejidos, vetas) utilizables como fondos, overlays o material de referencia en flujos de diseno.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al ser un modelo de generacion de imagenes, las metricas tipicas (MMLU, HumanEval, GSM8K) no son aplicables, y el autor no ha publicado evaluaciones cuantitativas de fidelidad fotografica (FID, CLIP score u otras).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible oficialmente; con ~3,9 B de parametros en bfloat16, el modelo principal ocupa en torno a 8 GB, a lo que hay que sumar los componentes del pipeline Flux (text encoder y VAE), por lo que una GPU con 16 GB o mas es una estimacion razonable para la version completa.
- GPU recomendadas: no disponible oficialmente; por tamano de modelo, una RTX 4090 (24 GB) deberia ejecutarlo con holgura, y GPUs de datacenter como la A100 o H100 para cargas por lotes.
- Consumer GPUs: plausible en tarjetas de 16-24 GB (RTX 4080/4090, RTX 3090); la disponibilidad de pesos GGUF sugiere que versiones cuantizadas pueden ejecutarse en GPUs con menos VRAM o incluso en CPU via llama.cpp-compatible, aunque no hay cifras publicadas.
- Opciones de despliegue: diffusers (Flux2KleinPipeline, metodo oficial documentado); GGUF sugiere compatibilidad con backends de inferencia que soporten ese formato. No se menciona soporte para vLLM, TGI u Ollama.
- Latencia y throughput: no disponibles; los ejemplos usan 28 pasos de inferencia con guidance scale 4,0 a 1024x1024.

## Comparativa con modelos similares

| Modelo | Parametros | Base | Licencia | Formato | Enfoque |
|---|---|---|---|---|---|
| Kitani Morgana v1.2 | ~3,9 B | FLUX.2-klein-base-4B | other (Kitani, Inc.) | safetensors, GGUF | Fotografia realista |
| FLUX.2-klein-base-4B | ~4 B | — | other (Black Forest Labs) | safetensors | Modelo base generalista |
| FLUX.1-dev (referencia historica) | 12 B | — | licencia no comercial BFL | safetensors | Generalista |

Morgana se diferencia de su modelo base en la especializacion fotografica; frente a modelos Flux de 12 B, ofrece un footprint notablemente menor (~3,9 B frente a 12 B), lo que facilita el despliegue en hardware consumer, a costa de la capacidad generalista del modelo mayor.

## Limitaciones y advertencias

- No soporta negative prompts en el pipeline oficial, lo que limita el control fino sobre elementos no deseados en la imagen.
- La generacion de texto legible y rotulos es un punto debil reconocido por el propio autor; se recomienda pedir escenas limpias cuando el texto importe.
- La calidad depende fuertemente de la redaccion del prompt; el autor recomienda estilo fotografico (iluminacion, lente, encuadre, textura) para obtener los mejores resultados.
- La licencia es "other" bajo los terminos de Kitani, Inc. (https://kitani.ai); el uso comercial requiere revisar la licencia vinculada, que puede restringir usos. No es una licencia abierta estandar (Apache, MIT, etc.).
- No hay informacion sobre sesgos del dataset Shuttle 3 Jaguar ni sobre representacion demografica en retratos, un riesgo habitual en modelos de generacion de rostros.
- Riesgo de alucinacion visual tipico de modelos de difusion: anatomia incorrecta en manos y rostros en escenas complejas, aunque el modelo esta afinado para mitigar el aspecto artificial.
- Con 0 descargas registradas en Hugging Face en el momento de la ficha, hay poca evidencia comunitaria de rendimiento en produccion.
- No es un modelo de lenguaje: no aplica para tareas de texto, codigo ni agentes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kitaniai/morgana-1.2
- Modelo base: https://huggingface.co/black-forest-labs/FLUX.2-klein-base-4B
- Licencia y web de Kitani, Inc.: https://kitani.ai
- Ejemplo de collage de resultados: https://kcdn2.kitani.ai/collage-v4.jpg
- Paper, repositorio de codigo y demo: no disponibles en la informacion proporcionada.
