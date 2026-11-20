# schrottteil/tobi

## Resumen

`schrottteil/tobi` es un adaptador LoRA de tipo DreamBooth para el modelo de difusion texto-a-imagen Krea 2, entrenado por el usuario schrottteil sobre los pesos de Krea 2 RAW y pensado para invocarse sobre Krea 2 Turbo. Su funcion es inyectar un concepto o identidad concreta, activada mediante el token `MTobi`, en las generaciones del modelo base sin necesidad de reentrenar la red completa. El repositorio ocupa aproximadamente 1.0 GB y se distribuye bajo licencia Apache 2.0.

El modelo resuelve el problema clasico de personalizacion en difusion: conseguir que un sujeto concreto aparezca de forma consistente en escenas, estilos y composiciones muy distintas (desde un retrato ciberpunk hasta una pintura al oleo victoriana o una escena de alpinismo). Al ser un LoRA, el coste de almacenamiento y de carga es muy inferior al de un fine-tuning completo, y se puede combinar con el pipeline de `diffusers` mediante `load_lora_weights`.

Es relevante ahora porque el ecosistema Krea 2 esta orientado a generacion rapida (Turbo con 8 pasos y `guidance_scale=0.0`), y los LoRA de concepto permiten a estudios pequenos y creadores individuales producir variaciones coherentes de un personaje o marca con inferencia de baja latencia. La informacion publica disponible es minima: no hay benchmarks, no se detalla el dataset de entrenamiento ni el numero de pasos, y el modelo no registra descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (DreamBooth) sobre un modelo de difusion texto-a-imagen Krea 2 |
| Parametros totales | no disponible (adaptador LoRA; el repositorio pesa ~1.0 GB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo texto-a-imagen, sin contexto de texto extenso) |
| Tipos de cuantizacion | no disponible (pesos del adaptador en el formato del repo; el base admite `bfloat16`) |
| Idiomas soportados | no disponible (los prompts de ejemplo estan en ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | pesos de adaptador LoRA compatibles con `diffusers` (`load_lora_weights`) |
| Modelo base | krea/Krea-2-Raw (entrenamiento); inferencia mostrada sobre krea/Krea-2-Turbo |
| Token de activacion | `MTobi` |
| Libreria | diffusers |
| Pipeline | text-to-image |
| Tamano del repositorio | ~1.0 GB |
| Fecha de creacion | 2026-11-20 |

## Arquitectura y entrenamiento

El adaptador se construye sobre Krea 2, un modelo de difusion texto-a-imagen, y sigue la tecnica DreamBooth-LoRA: se congelan los pesos del modelo base y se entrenan matrices de baja dimension que modifican las proyecciones de atencion (y posiblemente otras capas), de modo que el modelo aprenda a asociar el token `MTobi` con el concepto objetivo. El entrenamiento se realizo sobre Krea 2 RAW, mientras que los ejemplos publicados se generan con Krea 2 Turbo en 8 pasos de inferencia y `guidance_scale=0.0`, lo que indica que el adaptador es compatible con la variante destilada de pocos pasos.

No se especifica en la model card el numero de imagenes del dataset, el numero de pasos de entrenamiento, la tasa de aprendizaje, el rango del LoRA ni si se aplicaron tecnicas adicionales como regularizacion por clase o aumentado de datos. Tampoco se documenta si el concepto `MTobi` corresponde a una persona, un personaje ficticio o una marca; los prompts de ejemplo lo presentan en contextos muy dispares (ciberpunk, pintura victoriana, alpinismo), lo que sugiere un sujeto versatil mas que un estilo artistico. No hay informacion sobre el uso de RLHF, DPO ni preferencias humanas, algo esperable en un adaptador de difusion.

## Capacidades

- Generacion de imagenes texto-a-imagen condicionada por el token `MTobi` para reproducir el concepto aprendido.
- Personalizacion de sujeto o identidad en multiples estilos: fotografia cinematografica, pintura al oleo, escenas de accion, etc.
- Compatibilidad con Krea 2 Turbo para inferencia rapida (8 pasos, `guidance_scale=0.0`).
- Integracion directa con `diffusers` mediante `Krea2Pipeline` y `load_lora_weights`.
- Composicion de escenas complejas: los ejemplos incluyen descripciones detalladas de entorno, iluminacion y vestuario.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, vision, audio ni modo thinking, ya que es un modelo puramente generativo de imagen.
- Capacidades multilingues: no documentadas; los prompts de ejemplo estan en ingles.

## Casos de uso

- Creacion de personajes consistentes para narrativa visual: usar `MTobi` como sujeto fijo en un guion ilustrado o comic, variando escenario y estilo entre viñetas gracias a la capacidad del LoRA de mantener la identidad bajo prompts muy distintos.
- Prototipado de mascotas de marca: generar al sujeto en contextos corporativos, deportivos o fantasia para explorar direcciones creativas antes de encargar ilustracion final.
- Ilustracion editorial rapida: producir imagenes de acompanamiento para articulos con un personaje recurrente, usando Krea 2 Turbo para iterar en segundos con 8 pasos.
- Storyboarding de videojuegos o animacion: generar keyframes con el mismo personaje en localizaciones variadas (ciudad ciberpunk, conservatorio flotante, montana helada) para previsualizar escenas.
- Contenido para redes sociales: crear variaciones tematicas del personaje (festividades, estaciones, estilos artisticos) con un coste de inferencia bajo.
- Pruebas de concepto en pipelines de difusion: servir como ejemplo de integracion LoRA en `diffusers` para equipos que quieran evaluar el flujo `Krea2Pipeline` + `load_lora_weights` antes de entrenar sus propios adaptadores.
- Generacion de arte conceptual con direccion de arte variable: el mismo sujeto en estilos oleo, fotografia cinematografica o accion, util para pitches creativos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas objetivas (FID, CLIP score, similitud de identidad) ni comparaciones cuantitativas con otros LoRA o modelos base.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma especifica; depende del modelo base Krea 2 Turbo en `bfloat16` y del overhead del adaptador LoRA (el repo pesa ~1.0 GB, pero la VRAM la determina el base).
- GPU recomendadas: no documentadas por el autor; por el tipo de modelo (difusion texto-a-imagen con inferencia en 8 pasos) es esperable que funcione en GPUs consumer de gama alta, pero no hay confirmacion en la informacion disponible.
- Cabe en GPU consumer: no confirmado; el autor no publica requisitos.
- Opciones de despliegue: `diffusers` con `Krea2Pipeline` (unico flujo documentado en la model card). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a difusion.
- Latencia y throughput: no disponibles; solo se indica que los ejemplos se generaron con 8 pasos de inferencia sobre Krea 2 Turbo.

## Comparativa con modelos similares

| Modelo | Tipo | Base | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| schrottteil/tobi | LoRA DreamBooth | Krea 2 RAW / Turbo | no disponible (~1.0 GB repo) | no aplica | Apache 2.0 | Hugging Face, 0 descargas |
| krea/Krea-2-Raw | Modelo base difusion | — | no disponible | no aplica | no disponible en la informacion | Hugging Face |
| krea/Krea-2-Turbo | Modelo base destilado | Krea 2 | no disponible | no aplica | no disponible en la informacion | Hugging Face |
| Otros LoRA de concepto para Krea 2 | LoRA DreamBooth | Krea 2 | variable | no aplica | variable | no disponible en la informacion |

No se dispone de datos de rendimiento comparado ni de alternativas concretas documentadas en la informacion proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; al ser un LoRA de concepto, hereda los sesgos del modelo base Krea 2, que no se detallan.
- Riesgo de alucinacion visual: como todo modelo de difusion, puede generar anatomias, textos o detalles incoherentes, especialmente en composiciones complejas.
- Limitaciones de contexto o idioma: no hay informacion sobre soporte multilingue; los prompts de ejemplo estan en ingles y el token `MTobi` esta pensado para prompts en ese idioma.
- Restricciones de licencia: el adaptador se declara Apache 2.0, pero el uso comercial depende tambien de la licencia del modelo base Krea 2, que no se especifica en la informacion disponible; conviene verificar la licencia de `krea/Krea-2-Raw` y `krea/Krea-2-Turbo` antes de produccion.
- Caveats para produccion: el repositorio tiene 0 descargas y 0 likes, sin validacion externa; no hay benchmarks ni evaluacion de calidad; el entrenamiento y el dataset no estan documentados, lo que dificulta auditar el origen del concepto `MTobi`.
- Dependencia del token: sin `MTobi` en el prompt, el adaptador puede no activar el concepto o degradar la generacion.
- Compatibilidad: el flujo documentado usa `Krea2Pipeline` de `diffusers`; no se garantiza funcionamiento en otras librerias o pipelines.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/schrottteil/tobi
- Modelo base de entrenamiento: https://huggingface.co/krea/Krea-2-Raw
- Modelo base de inferencia (Turbo): https://huggingface.co/krea/Krea-2-Turbo
- Libreria diffusers: https://github.com/huggingface/diffusers
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la informacion disponible.
