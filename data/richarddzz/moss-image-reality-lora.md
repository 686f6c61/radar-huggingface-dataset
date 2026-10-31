# Richarddzz/moss-image-reality-lora

## Resumen

MOSS-Image Reality LoRA es un adaptador LoRA para generación de imágenes texto-a-imagen, entrenado por el usuario Richarddzz sobre el modelo base OpenMOSS-Team/MOSS-Image-SFT. Su objetivo es muy concreto: producir retratos fotorrealistas con la estética de una foto sin editar sacada con un teléfono móvil, priorizando la naturalidad (luz ambiente, algo de ruido, desenfoque de profundidad y encuadres imperfectos) frente a la nitidez de estudio.

El LoRA está optimizado específicamente para rostros asiáticos (rasgos faciales, tonos de piel y maquillaje) y cubre escenas cotidianas variadas: street photography, cafeterías, selfies, interiores domésticos y habitaciones de hotel. Una capacidad destacable es la generación directa de collages multi-panel, como trípticos horizontales en una sola imagen.

Se trata de una versión Preview (paso de entrenamiento 73250) y el autor indica que el entrenamiento continúa, por lo que se esperan versiones actualizadas. El repositorio pesa 1,2 GB y se publica bajo licencia Apache 2.0. Dada su naturaleza (LoRA especializado en retratos realistas con datos sin filtrado adicional de contenido y etiquetado "not-for-all-audiences"), requiere un uso responsable y está restringido explícitamente a personas adultas ficticias.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre modelo de difusion texto-a-imagen |
| Parametros totales | no disponible (tamano del repo: 1,2 GB) |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no aplicable (modelo de difusion; prompts en lenguaje natural) |
| Tipos de cuantizacion | no disponible (entrenado en bf16) |
| Idiomas soportados | no disponible (los prompts de ejemplo funcionan bien en chino; se recomiendan descripciones en lenguaje natural) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (claves con prefijo `diffusion_model.`, renombrable a `transformer.` para Diffusers) |

Datos adicionales del adaptador: LoRA rank 128 / alpha 128, recomendado con intensidad (strength) 0,9–1,0 sobre el modelo base.

## Arquitectura y entrenamiento

El modelo es un LoRA de rank 128 y alpha 128 aplicado sobre MOSS-Image-SFT, un modelo de difusion texto-a-imagen del equipo OpenMOSS. Al tratarse de un adaptador, no sustituye al modelo base sino que modifica sus pesos durante la inferencia, lo que permite cargarlo de forma nativa en ComfyUI mediante su cargador de LoRA para MOSS-Image.

El entrenamiento se realizo en bf16 con una tasa de aprendizaje de 2e-5 y un batch size efectivo de 4, sobre un dataset de aproximadamente 2.200 imagenes realistas curadas manualmente por humanos. Las resoluciones de entrenamiento se situan en torno a 1 megapixel, con imagenes multi-panel a unos 2 megapixels. La version publicada corresponde al paso 73250; las imagenes de ejemplo del README se generaron con checkpoints de los pasos 72750–73000, con resultados practicamente identicos. El autor senala que el entrenamiento aun no ha finalizado y que se publicaran versiones posteriores. No hay informacion disponible sobre la arquitectura interna exacta del modelo base (tipo de backbone de difusion, text encoder, etc.) ni sobre tecnicas adicionales como destilacion de pasos.

## Capacidades

- Generacion texto-a-imagen de retratos fotorrealistas con estetica de foto movil sin editar: luz natural, ruido ligero, desenfoque de profundidad y encuadres imperfectos.
- Optimizacion especifica para rasgos faciales, tonos de piel y maquillaje de personas asiaticas.
- Cobertura amplia de escenas: calle, cafeterias, selfies, entornos domesticos e interiores privados (dormitorios, habitaciones de hotel).
- Generacion directa de collages multi-panel, como tripticos horizontales, en una sola imagen.
- Uso de prompts en lenguaje natural sin palabras disparadoras (trigger words); las descripciones largas y detalladas dan mejores resultados, especialmente en chino.
- Compatible con ComfyUI (carga nativa) y con Diffusers (renombrando el prefijo de las claves de `diffusion_model.` a `transformer.`).
- No soporta tool calling, agentes ni razonamiento multi-paso: es un modelo generativo de imagenes, no un LLM.

## Casos de uso

- Fotografia de stock realista: generacion de imagenes con aspecto de foto amateur para maquetas, presentaciones o articulos de blog, evitando el aspecto demasiado pulido de otros generadores.
- Retratos de personas asiaticas: al estar afinado especificamente en rasgos, tonos de piel y maquillaje asiaticos, es adecuado para proyectos que requieran diversidad etnica realista en personajes.
- Prototipado de personajes y moodboards: exploracion rapida de personajes ficticios en escenas cotidianas (cafe, calle, casa) para preproduccion creativa, publicidad o storyboard.
- Contenido para redes sociales simulado: la capacidad de generar tripticos y collages horizontales permite crear mockups de carruseles o tiras de fotos tipo photobooth.
- Datos sinteticos para vision por computador: las fotos con imperfecciones realistas (ruido, desenfoque, mala iluminacion) pueden servir como datos de entrenamiento o evaluacion para modelos de deteccion o segmentacion en condiciones de camara movil.
- Generacion artistica de estetica "candid": proyectos fotograficos ficticios que buscan la sensacion de foto espontanea tomada por el propio sujeto.
- Composiciones con ComfyUI: integracion en workflows existentes de ComfyUI como LoRA adicional sobre MOSS-Image-SFT, combinable con otros LoRA o controles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al tratarse de un LoRA de imagen, no aplica el tipo de benchmarks tipicos de LLM (MMLU, HumanEval, etc.). La unica referencia cuantitativa es el paso de entrenamiento (73250) y los parametros de generacion de los ejemplos: 50 pasos, CFG 3.0, shift 5.0, resolucion 1088×1920 o 2176×960.

## Requisitos de hardware

- VRAM para el LoRA: al pesar el repositorio 1,2 GB en bf16, el adaptador en si ocupa alrededor de 1–1,2 GB de VRAM adicional.
- VRAM total: depende del modelo base OpenMOSS-Team/MOSS-Image-SFT, cuyos requisitos no estan disponibles en la informacion proporcionada. Los modelos de difusion de imagen de este tipo suelen requerir tipicamente entre 12 y 24 GB de VRAM para inferencia comoda, pero esta cifra es una estimacion general, no un dato publicado.
- GPU recomendadas: no disponible; para generacion de imagens a ~1–2 MP con 50 pasos, una GPU consumer de gama alta (RTX 3090/4090) suele ser suficiente, sujeto a los requisitos del modelo base.
- Compatibilidad con consumer GPUs: plausible dada la carga nativa en ComfyUI, pero no confirmada por el autor.
- Opciones de despliegue: ComfyUI (carga nativa mediante el cargador de LoRA de MOSS-Image, ya que las claves empiezan por `diffusion_model.`) y la libreria Diffusers de Hugging Face (requiere renombrar el prefijo a `transformer.`). No se menciona soporte para Ollama, vLLM, TGI ni llama.cpp (no aplicable a modelos de difusion).
- Latencia y throughput: no disponibles; los ejemplos usan 50 pasos de muestreo, lo que da una referencia del coste de inferencia por imagen.

## Comparativa con modelos similares

| Modelo | Tipo | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|
| Richarddzz/moss-image-reality-lora | LoRA sobre MOSS-Image-SFT | Realismo movil, retratos asiaticos, multi-panel | Apache 2.0 | Hugging Face (Preview) |
| OpenMOSS-Team/MOSS-Image-SFT | Modelo base texto-a-imagen | Generacion de imagen general (SFT) | no disponible | Hugging Face |
| LoRAs realistas de SDXL/Flux (p. ej. epiCRealism, Realism LoRAs de la comunidad) | LoRA sobre SDXL o Flux.1-dev | Realismo fotografico general | Varia (algunas con restricciones de uso) | Hugging Face / Civitai |

La diferencia principal frente a LoRAs de realismo generico es la optimizacion dirigida a rostros asiaticos y al estilo concreto de "foto de movil sin editar", ademas del soporte nativo de composiciones multi-panel. No hay datos de rendimiento comparativo publicados.

## Limitaciones y advertencias

- Estetica deliberadamente blanda: las imagenes tienen desenfoque y suavidad intencionales; si se busca nitidez de estudio, este LoRA no es adecuado o conviene reducir la intensidad.
- Texto pequeno: el texto impreso en ropa o el contenido de pantallas de movil suele salir garbled (ilegible o con caracteres corruptos).
- Manos: los detalles de las manos fallan ocasionalmente.
- Version Preview: el entrenamiento no ha finalizado; la calidad puede cambiar en versiones posteriores.
- Datos sin filtrado adicional: el autor indica que el conjunto de entrenamiento incluye escenas privadas (dormitorios, habitaciones de hotel) sin filtrado de contenido extra, y el repo esta etiquetado como "not-for-all-audiences". Esto exige especial precaucion en entornos de produccion y con usuarios finales.
- Restricciones de uso: solo se permite generar personas adultas ficticias. Esta prohibido generar imagenes de personas reales identificables (incluidas figuras publicas) o imagenes intimas de cualquier persona real sin su consentimiento. El usuario es responsable de cumplir la legislacion de su jurisdiccion; en Espana, la Ley Organica 1/2025 y la normativa de proteccion de datos refuerzan la proteccion frente a imagenes intimas generadas sin consentimiento.
- Compatibilidad de formato: los usuarios de Diffusers deben renombrar el prefijo de las claves, lo que puede anadir friccion en pipelines automatizados.
- Cero descargas registradas en el momento de redactar la ficha: falta validacion comunitaria amplia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Richarddzz/moss-image-reality-lora
- Modelo base (MOSS-Image-SFT): https://huggingface.co/OpenMOSS-Team/MOSS-Image-SFT

No se han encontrado enlaces adicionales (papers, blogs oficiales o demos) en la informacion disponible.
