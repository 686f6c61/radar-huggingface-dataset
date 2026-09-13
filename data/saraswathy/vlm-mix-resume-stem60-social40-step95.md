# Saraswathy/vlm-mix-resume-stem60-social40-step95

## Resumen

Saraswathy/vlm-mix-resume-stem60-social40-step95 es un checkpoint de reanudacion de entrenamiento publicado como archivo, no un modelo autónomo listo para servir. Se trata de un adaptador LoRA (librería PEFT) entrenado sobre el modelo vision-lenguaje Qwen/Qwen3-VL-4B-Instruct, con pipeline image-text-to-text, es decir, entrada de imagen y texto y salida de texto. El autor lo describe como el archivo completo de un "training-resume checkpoint" en el paso global 95 de un entrenamiento realizado con EasyR1, e incluye estado FSDP de modelo y optimizador, estado adicional, estado del dataloader y el adaptador LoRA listo para evaluacion bajo la ruta `actor/lora_adapter/`.

El nombre del repositorio, "stem60-social40", apunta a una mezcla de datos de entrenamiento con proporcion 60/40 entre un subconjunto de tipo STEM y otro de tipo social, aunque la model card no detalla la composicion exacta del dataset. El repositorio ocupa 11,8 GB, un tamano muy superior al de un adaptador LoRA tipico, precisamente porque incluye los shards de FSDP y los estados del optimizador necesarios para retomar el entrenamiento, no solo los pesos adaptados.

Su relevancia practica es limitada pero concreta: es util para reproducir o continuar un experimento de ajuste fino multimodal de un VLM de 4B parametros, y para evaluar el adaptador resultante del paso 95 una vez cargado sobre el modelo base. No debe confundirse con un modelo fusionado ni con un artefacto listo para produccion: el propio autor indica explicitamente que no es un modelo independiente y que hay que cargar el adaptador sobre `Qwen/Qwen3-VL-4B-Instruct`. No se declara licencia, idiomas soportados ni resultados de evaluacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer vision-lenguaje (heredada del modelo base Qwen/Qwen3-VL-4B-Instruct); adaptador LoRA entrenado con EasyR1 |
| Parametros totales | No disponible (modelo base de la familia Qwen3-VL-4B segun su denominacion; el repositorio contiene un adaptador LoRA, no pesos completos) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (depende del modelo base) |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors; no se documentan versiones cuantizadas) |
| Idiomas soportados | No disponible |
| Licencia | No disponible (la model card no declara licencia) |
| Formato de pesos | safetensors (adaptador LoRA PEFT) + shards FSDP de modelo y optimizador; verificar con `SHA256SUMS.json` |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA sobre Qwen/Qwen3-VL-4B-Instruct, un modelo multimodal que acepta imagenes y texto y genera texto. El entrenamiento se realizo con el framework EasyR1, orientado a ajuste fino con aprendizaje por refuerzo sobre modelos vision-lenguaje en configuraciones distribuidas. El repositorio conserva el estado completo del entrenamiento en el paso global 95: pesos del modelo en formato FSDP, estado del optimizador, estado adicional y estado del dataloader, ademas del adaptador final en `actor/lora_adapter/`. Esto lo convierte en un punto de reanudacion exacto, no en una instantanea limpia de inferencia.

La model card no especifica el numero de tokens de entrenamiento, la composicion detallada del dataset ni si se aplicaron etapas de RLHF o DPO. El unico indicio sobre los datos es el sufijo del nombre, "stem60-social40", que sugiere una mezcla con proporcion 60/40 entre datos de contenido STEM y datos de contenido social, pero no se aporta ninguna descripcion adicional. Tampoco se documentan innovaciones tecnicas propias mas alla del uso de LoRA y FSDP. El paso 95 es un punto temprano o intermedio de entrenamiento, sin informacion publicada sobre convergencia o perdida.

## Capacidades

- Generacion de texto condicionada por imagen: al heredar el pipeline image-text-to-text del modelo base, puede responder preguntas sobre imagenes, describir escenas y extraer informacion visual.
- Comprension de documentos e imagenes con texto (OCR implicito del modelo base), sin que el autor detalle el rendimiento del adaptador en esta tarea.
- Razonamiento multimodal de proposito general segun las capacidades del modelo base Qwen3-VL-4B-Instruct.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada para este adaptador; depende de lo que preserve el ajuste con LoRA.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible; no se declaran idiomas en la model card.
- Capacidades especiales (modo thinking, audio, vision adicional): no disponible.
- Reanudacion de entrenamiento: capacidad destacable del repositorio, ya que incluye estado FSDP, optimizador y dataloader para continuar desde el paso global 95.

## Casos de uso

- Reproducibilidad de experimentos: cargar el estado FSDP y del optimizador para reanudar el entrenamiento exactamente en el paso global 95, lo que permite continuar una linea de investigacion sin repetir computo previo.
- Evaluacion de estrategias de mezcla de datos: comparar el adaptador STEM 60 / social 40 con adaptadores de otras proporciones para medir el efecto de la composicion del dataset en tareas multimodales.
- Prueba de concepto de ajuste fino con EasyR1: usar el repositorio como plantilla de la estructura de artefactos que genera este framework (FSDP, LoRA, dataloader, `SHA256SUMS.json`).
- Analisis de imagen en dominio cientifico o tecnico: al estar entrenado con una proporcion mayoritaria de datos tipo STEM, puede probarse en tareas de interpretacion de figuras, diagramas o graficos, siempre con validacion previa.
- Investigacion sobre comportamiento social en VLM: la parte social de la mezcla permite estudiar como responde el modelo ante imagenes y contextos de interaccion humana, con fines de analisis de sesgos.
- Base para comparativas de adaptadores: servir como punto de referencia intermedio (paso 95) frente a checkpoints posteriores del mismo entrenamiento, si el autor los publica.
- Docencia y divulgacion tecnica: ilustrar como se estructura un checkpoint de reanudacion completo en proyectos de ajuste fino multimodal.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de MMLU, HumanEval, GSM8K, MMMU ni de ninguna otra evaluacion, y tampoco se han encontrado referencias externas con resultados.

## Requisitos de hardware

- VRAM para inferencia: el adaptador por si solo ocupa muy poco espacio, pero requiere cargar el modelo base. Para un modelo de 4B parametros en precision de 16 bits, la estimacion de pesos ronda los 8 GB, a los que hay que sumar el codificador visual, activaciones y cache KV; en la practica se recomienda contar con 12 GB o mas de VRAM.
- Cuantizacion en 8 bits: aproximadamente 5-6 GB de VRAM para los pesos del modelo base.
- Cuantizacion en 4 bits: aproximadamente 3-4 GB de VRAM para los pesos del modelo base, dejando margen para el contexto y las imagenes de entrada.
- GPU consumer: cabe en tarjetas con 12 GB o mas, como RTX 3060 12 GB, RTX 4070, RTX 4080 y RTX 4090, especialmente con cuantizacion. En GPUs de 8 GB puede ser necesario recurrir a cuantizaciones agresivas y reducir la resolucion de imagen o el contexto.
- GPU de centro de datos (A100, H100): sobradamente suficientes para este tamano, utiles para procesar lotes grandes o servir con concurrencia.
- Opciones de despliegue: vLLM, SGLang, Hugging Face TGI o Transformers para el modelo base con el adaptador cargado; llama.cpp y Ollama solo si se convierte el modelo fusionado a GGUF, algo que el repositorio no incluye. El directorio del repositorio no es servible tal cual: hay que extraer el adaptador de `actor/lora_adapter/` y cargarlo sobre `Qwen/Qwen3-VL-4B-Instruct`.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se han encontrado en la busqueda web modelos comparables publicados (adaptadores multimodales equivalentes sobre Qwen3-VL-4B). La unica comparacion documentada es con el propio modelo base.

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Saraswathy/vlm-mix-resume-stem60-social40-step95 | Adaptador LoRA sobre 4B (base) | No disponible | safetensors + FSDP | No disponible | Publico en HuggingFace, 0 descargas |
| Qwen/Qwen3-VL-4B-Instruct (modelo base) | 4B | No disponible en la informacion proporcionada | safetensors | La del modelo base (consultar en su repositorio) | Publico en HuggingFace |
| Otros adaptadores similares | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- No es un modelo autonomo: requiere cargar el adaptador sobre `Qwen/Qwen3-VL-4B-Instruct`. Intentar usarlo sin el modelo base produce un error.
- Licencia no declarada: al no especificarse licencia en la model card, no hay autorizacion explicita de uso comercial. Conviene contactar con el autor y revisar la licencia del modelo base antes de cualquier despliegue en produccion.
- Checkpoint en el paso 95: es un punto temprano o intermedio de entrenamiento, sin metricas publicadas de convergencia, perdida o calidad. No hay garantia de que el ajuste haya mejorado al modelo base.
- Tamano del repositorio: 11,8 GB, de los cuales la mayor parte corresponde a estado de optimizador y shards FSDP. Para inferencia solo es relevante el subdirectorio `actor/lora_adapter/`, lo que puede inducir a error al descargar.
- Sin informacion sobre sesgos: la model card no documenta la composicion del dataset ni analisis de sesgos. Un ajuste con una mezcla desequilibrada puede amplificar sesgos presentes en los datos STEM y sociales empleados.
- Riesgo de alucinacion: inherente a los modelos vision-lenguaje de este tamano, especialmente en tareas de lectura precisa de texto en imagenes y en razonamiento numerico.
- Idiomas: no se declaran idiomas soportados, por lo que el comportamiento fuera del idioma dominante del dataset de ajuste es impredecible.
- Sin validacion externa: cero descargas y cero "likes" en el momento de la consulta, y sin resultados de benchmarks, lo que implica ausencia total de verificacion independiente.
- Verificacion de integridad: el autor recomienda comprobar los ficheros con `SHA256SUMS.json`; conviene hacerlo antes de reanudar cualquier entrenamiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Saraswathy/vlm-mix-resume-stem60-social40-step95
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-4B-Instruct
- EasyR1 (framework de entrenamiento citado en la model card): no se ha encontrado enlace en la informacion proporcionada.
- Paper asociado: no disponible.
- Repositorio de codigo o demo: no disponible.
- Resultados de la busqueda web: no se ha encontrado ninguna referencia relevante al modelo; los unicos resultados devueltos corresponden a un comercio no relacionado y se descartan por no ser pertinentes.
