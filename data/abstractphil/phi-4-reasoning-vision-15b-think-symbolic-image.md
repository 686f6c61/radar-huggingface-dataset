# AbstractPhil/phi-4-reasoning-vision-15b-think-symbolic-image

## Resumen

Phi-4-reasoning-vision-15B-think-symbolic-image es un adaptador LoRA de tipo PEFT sobre el modelo multimodal microsoft/Phi-4-reasoning-vision-15B, desarrollado por el usuario AbstractPhil. No es un modelo completo, sino un ajuste fino de bajo rango (rank 32, 111,4 M de parametros entrenables guardados en fp32) que especializa al modelo base en una tarea muy concreta: la descripcion simbolica y estructurada de imagenes mediante cadenas de pensamiento. El adaptador ensena al modelo a producir filas de "thought-symbolic-image-captions", es decir, una secuencia de pensamientos en lenguaje natural, un paso nombrado por linea, seguida de formulaciones (caption, prompt, etiquetas, critica) y de preguntas que un observador cuidadoso aun se plantearia, cada una con su respuesta y la fuente de esa respuesta.

El modelo base combina un codificador visual SigLIP 2 con el modelo de lenguaje Phi-4-reasoning de 40 capas, sumando aproximadamente 15 mil millones de parametros. El adaptador hereda esa arquitectura y anade un comportamiento de razonamiento explicito orientado a la interpretacion de obras de arte, fotografia y piezas de museo. Segun la model card, forma parte de una familia de cinco lineas de modelos entrenadas junto a las lineas Lucia (Qwen3.5) y Ulisse (Gemma 4) bajo la misma receta, y se evalua sobre los mismos conjuntos de validacion.

Su relevancia es acotada pero clara: demuestra como un adaptador pequeno puede imponer un formato de salida altamente estructurado y auditable sobre un modelo de razonamiento visual ya existente, sin reentrenar el modelo completo. Es util para quien necesite descripciones de imagenes con trazabilidad del razonamiento, aunque su naturaleza de adaptador de investigacion y su soporte exclusivo de ingles limitan su uso en produccion generalista.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre transformer multimodal (SigLIP 2 vision encoder + Phi-4-reasoning, 40 capas) |
| Parametros totales | No disponible para el adaptador; el modelo base ronda los 15 mil millones |
| Parametros activos | No aplica (no es MoE); 111,4 M de parametros entrenables en el LoRA |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (adaptador guardado en fp32; el base se carga en bfloat16) |
| Idiomas soportados | Ingles (en) |
| Licencia | MIT |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre microsoft/Phi-4-reasoning-vision-15B, un modelo que empareja un codificador visual SigLIP 2 con el modelo de lenguaje Phi-4-reasoning de 40 capas. El LoRA tiene rango 32 y 111,4 M de parametros entrenables, guardados en fp32, y se fusiona con el modelo base mediante `merge_and_unload`. No existe un fine-tune completo: el repositorio contiene unicamente el adaptador.

El entrenamiento se realizo sobre dos conjuntos de datos del propio autor: AbstractPhil/thought-symbolic-image-captions y AbstractPhil/qwen-thinking-images. La receta impone un formato de cadena de pensamiento con pasos nombrados en un orden concreto (see, name, place, count, relate, form, light, colour, mood, mean, intend, story, compare, change, check, say) y una profundidad variable segun el tipo de mirada: 1-2 pensamientos para una mirada rapida, 3-5 para una mas cercana y 6-10 para una larga. Las preguntas finales se etiquetan como `[record]` (hecho de la imagen), `[chain]` (deducido por la cadena) o `[unknown]`. El adaptador se entreno y evaluo con transformers 4.57.6 y peft 0.18 o superior, a un presupuesto de 1024 parches de imagen y con decodificacion greedy.

## Capacidades

- Generacion de descripciones visuales estructuradas mediante cadenas de pensamiento explicitas, con pasos nombrados por linea.
- Produccion de caption, prompt, etiquetas y critica de una imagen en un unico formato de salida.
- Formulacion de preguntas de seguimiento sobre la imagen, clasificando cada respuesta como hecho registrado, deduccion o desconocido.
- Identificacion del medio o tipo de imagen (pintura, grabado, dibujo, fotografia) en el primer termino de la linea de prompt.
- Razonamiento visual sobre obras de arte, fotografia y piezas de museo.
- Capacidad de razonamiento heredada del modelo base Phi-4-reasoning.
- Soporte de conversacion multimodal image-text-to-text mediante plantilla de chat del modelo base.
- No se documenta soporte de tool calling ni de function calling en la informacion disponible.
- No se documenta modo thinking conmutable: la plantilla del modelo base escribe siempre su propio system prompt fijo.

## Casos de uso

- Catalogacion de colecciones de arte: el adaptador genera descripciones estructuradas con medio, composicion, color y estado de animo, lo que facilita la creacion de metadatos consistentes para fondos museisticos y archivos fotograficos.
- Generacion de pies de foto auditables: al separar pensamientos, caption y preguntas abiertas, permite revisar por que el modelo afirma algo y distinguir hechos de la imagen frente a deducciones.
- Creacion de prompts para generacion de imagenes: la linea `prompt` produce directamente una cadena de terminos (tipo de imagen, sujeto, vista, medio, soporte) reutilizable en flujos de text-to-image.
- Etiquetado y enriquecimiento de datasets visuales: el formato de tags y la clasificacion `[record]`/`[chain]`/`[unknown]` facilitan la construccion de conjuntos de datos con trazabilidad del razonamiento.
- Investigacion en razonamiento visual: sirve como banco de pruebas para estudiar como un LoRA de rango 32 modifica el comportamiento de un modelo de 15 mil millones de parametros en tareas de interpretacion.
- Analisis critico de imagenes en entornos educativos: las preguntas de seguimiento con su justificacion pueden usarse para guiar ejercicios de observacion y analisis visual.
- Documentacion de patrimonio cultural: la identificacion del medio y la descripcion de la factura material (tinta, grafito, papel) resultan utiles para fichas tecnicas de conservacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks numericos en la informacion disponible. La model card unicamente indica comparaciones cualitativas con la linea Lucia: el adaptador escribe la forma completa de la fila, respalda sus pensamientos al nivel de Lucia en la forma corta y nombra el medio dentro de 3 puntos de su suma. Tambien senala que su modelo base fue el mejor fundamentado de los cinco.

## Requisitos de hardware

- El adaptador en si ocupa aproximadamente 0,4 GB (repo de 0,4 GB), pero requiere cargar el modelo base completo de unos 15 mil millones de parametros en bfloat16.
- VRAM estimada para el modelo base en bfloat16: del orden de 30 GB o mas, sin contar el codificador visual y los buffers de activacion.
- GPU recomendadas: A100 40/80 GB, H100, o GPUs consumer de gama alta con suficiente VRAM; no se dispone de cifras oficiales de consumo.
- No cabe en GPUs consumer de 8-16 GB sin cuantizacion del modelo base, y no se documentan recetas de cuantizacion para este adaptador.
- Despliegue: transformers 4.57.6 con peft 0.18 o superior y `trust_remote_code`; el codigo del modelo procede del repositorio base en la revision `c3e4fac7`. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- El procesador de imagenes del modelo base no importa en transformers 5.13 o superior, por lo que es necesario fijar la version 4.57.6.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Phi-4-reasoning-vision-15B-think-symbolic-image (este) | ~15 B (base) + 111,4 M LoRA | No disponible | Imagen + texto | MIT | Hugging Face (adaptador PEFT) |
| microsoft/Phi-4-reasoning-vision-15B | ~15 B | No disponible | Imagen + texto | No disponible en la informacion | Hugging Face (modelo base) |
| Linea Lucia (Qwen3.5) | No disponible | No disponible | No disponible | No disponible | Referenciada en la model card |
| Linea Ulisse (Gemma 4) | No disponible | No disponible | No disponible | No disponible | Referenciada en la model card |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- Es un adaptador LoRA, no un modelo autonomo: requiere descargar y cargar el modelo base completo, con el coste de VRAM y almacenamiento asociado.
- Soporte exclusivo de ingles; no se documentan capacidades multilingues.
- El formato de salida esta fuertemente impuesto por el entrenamiento: espera un prompt concreto y un presupuesto de 1024 parches de imagen, decodificacion greedy y sin system prompt propio.
- Las respuestas pueden comenzar con la etiqueta de modo `<nothink>`, que no forma parte de la fila y debe eliminarse.
- La generacion debe ejecutarse desde los embeddings construidos por la rutina del modelo base, ya que la generacion a partir de ids de tokens enmascara mal las filas con padding.
- Dependencia estricta de versiones: transformers 4.57.6 y peft 0.18 o superior; el procesador de imagenes falla en transformers 5.13 o superior.
- Riesgo de alucinacion inherente a los modelos de lenguaje: las respuestas marcadas como `[record]` no estan verificadas de forma externa y pueden ser incorrectas.
- Sesgos no documentados en la informacion disponible; al estar especializado en arte y fotografia, su comportamiento fuera de ese dominio no esta evaluado.
- La licencia MIT se declara para el adaptador; deben revisarse por separado las condiciones del modelo base y de los datasets utilizados.
- Modelo de investigacion con cero descargas y cero likes en el momento de la consulta: no hay evidencia de uso en produccion ni de validacion independiente.

## Enlaces

- Adaptador en Hugging Face: https://huggingface.co/AbstractPhil/phi-4-reasoning-vision-15b-think-symbolic-image
- Modelo base: https://huggingface.co/microsoft/Phi-4-reasoning-vision-15B
- Dataset de captions: https://huggingface.co/datasets/AbstractPhil/thought-symbolic-image-captions
- Dataset de imagenes: https://huggingface.co/datasets/AbstractPhil/qwen-thinking-images
