# Infinity-io/Step-Audio-EditX

## Resumen
Step-Audio-EditX es un modelo de audio basado en un LLM de aproximadamente 3.500 millones de parametros (3.529.706.496 segun los pesos en safetensors), desarrollado por StepFun (publicado en Hugging Face bajo el namespace Infinity-io). Su especialidad es la edicion iterativa de audio expresivo: modifica emocion, estilo de habla y rasgos paralinguisticos sobre una locucion existente, y ademas incorpora capacidades de sintesis de voz zero-shot (TTS). El modelo se entrena con tecnicas de aprendizaje por refuerzo (GRPO) sobre una base de lenguaje, lo que lo situa en la interseccion entre los LLM y los modelos generativos de audio.

La relevancia actual del modelo radica en que aborda una tarea poco cubierta por los TTS clasicos: el control fino y repetido de atributos expresivos (decenas de emociones y estilos, diez tipos de rasgos paralinguisticos como respiracion, risa o suspiro) sin regenerar la locucion desde cero. Segun la model card, soporta mandarin, ingles, sichuanes y cantonés, y desde finales de noviembre de 2025 tambien japones y coreano. La ficha tecnica oficial lo presenta como un modelo de audio "LLM-based" con soporte de vLLM y codigo de entrenamiento GRPO publicado.

No se dispone de informacion sobre licencia, idiomas completos ni pipeline en los metadatos de Hugging Face; el repositorio indica 0 descargas y 0 likes en el momento de la consulta, y un tamano de 8,3 GB, coherente con pesos en safetensors y posiblemente artefactos ONNX.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LLM de audio basado en transformer (tag `step1`, `custom_code`); no se detalla la variante exacta |
| Parametros totales | 3.529.706.496 (aprox. 3,5 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | se menciona una variante `Step-Audio-EditX-Int4`; no se detallan otros formatos |
| Idiomas soportados | mandarin, ingles, sichuanes, cantonés, japones y coreano (segun la model card); no disponible el listado oficial completo |
| Licencia | no disponible |
| Formato de pesos | safetensors y ONNX (tags del repositorio) |

## Arquitectura y entrenamiento
La model card describe Step-Audio-EditX como un modelo de audio basado en un LLM de 3B parametros especializado en edicion expresiva e iterativa. No se especifica en la informacion disponible el tipo exacto de transformer, el numero de capas ni la composicion del dataset de entrenamiento. El modelo se entrena con aprendizaje por refuerzo: la model card anuncia la publicacion del codigo de entrenamiento GRPO (23 de enero de 2026), mientras que el entrenamiento SFT y PPO figuran como pendientes en el plan de codigo abierto. Esto sugiere que el ajuste fino supervisado precede al refinamiento con RL, aunque no se detalla la receta completa ni el volumen de tokens de audio utilizados.

Entre las innovaciones tecnicas destacadas estan la edicion iterativa de atributos expresivos (permitiendo aplicar varias ediciones sucesivas sobre una misma locucion), el control de pronunciacion de caracteres polifonicos mediante sustitucion por pinyin (por ejemplo, convertir caracteres ambiguos en su lectura fonetica con tonos), y la publicacion de un tokenizer propio (Step-Audio-Tokenizer). Tambien se anuncia soporte de inferencia y entrenamiento con vLLM, lo que facilita el despliegue en produccion.

## Capacidades
- TTS zero-shot con clonacion de voz para mandarin, ingles, sichuanes y cantonés, y soporte de japones y coreano mediante etiquetas de idioma.
- Edicion de emocion: felicidad, enfado, tristeza, miedo, sorpresa, confusion, empatia, verguenza, emocion, entre otras (decenas de opciones).
- Edicion de estilo de habla: actitud coqueta, voz de persona mayor, voz infantil, susurro, tono serio, generoso, exagerado, entre otros.
- Edicion paralinguistica con diez tipos de rasgos: respiracion, risa, sorpresa (oh/ah/wa), confirmacion (en), duda (uhm), suspiro, pregunta (ei) e insatisfaccion (hnn).
- Control de pronunciacion polifonica mediante pinyin con tonos.
- Edicion iterativa: aplicar multiples cambios expresivos de forma sucesiva sobre una misma locucion.
- Soporte de inferencia con vLLM y entrenamiento con GRPO.
- Capacidades de agente o tool calling: no disponibles en la informacion proporcionada.

## Casos de uso
- Doblaje y localizacion de contenido: el modelo permite partir de una locucion y reajustar emocion y estilo para adaptar el tono de un personaje a distintas escenas sin volver a grabar, gracias a la edicion iterativa.
- Produccion de audiolibros y podcast: se puede generar la narracion con TTS zero-shot clonando una voz y luego aplicar ediciones de susurro, tono serio o emocion triste en pasajes concretos.
- Postproduccion de videojuegos: insercion controlada de rasgos paralinguisticos (respiracion, risa, suspiro) en dialogos de personajes para aumentar el realismo sin sesiones de grabacion adicionales.
- Accesibilidad y lectores de pantalla: sintesis de voz expresiva en mandarin, ingles, cantonés y sichuanes que transmita emocion en lugar de una lectura plana, mejorando la comprension en contenidos largos.
- Prototipado rapido de voces para anuncios: generar varias versiones de una misma cuota con estilos distintos (exagerado, coqueto, serio) y seleccionar la mejor sin coste de estudio.
- Investigacion en edicion de audio: uso del modelo y del benchmark Step-Audio-Edit-Benchmark para evaluar y comparar tecnicas de edicion expresiva, con codigo GRPO disponible para reproducir experimentos.
- Asistentes conversacionales de voz: incorporar respiraciones, confirmaciones y emociones en las respuestas sintetizadas para que la interaccion resulte mas natural en mandarin o ingles.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona la publicacion del Step-Audio-Edit-Benchmark (23 de noviembre de 2025) como herramienta de evaluacion, pero no incluye cifras concretas en el material proporcionado.

## Requisitos de hardware
- VRAM estimada para inferencia: con pesos en fp16/bf16, un modelo de 3,5 B parametros requiere aproximadamente 7-8 GB solo para los pesos; con la variante Int4, el requisito baja a unos 2-3 GB, aunque la memoria para el tokenizer de audio y el estado de decodificacion anade overhead.
- GPU recomendadas: no disponibles de forma oficial; por tamano, una RTX 4090 (24 GB) o una A100 (40/80 GB) son opciones razonables para fp16, y una RTX 3090/4090 o incluso GPUs de 8-12 GB para la variante Int4.
- Cabe en GPU de consumo: si, previsiblemente en RTX 3090, RTX 4090 y GPUs con 12 GB o mas para la variante Int4; no confirmado por el autor.
- Opciones de despliegue: vLLM (soporte anunciado en enero de 2026), codigo de inferencia propio y demo Gradio; no se confirma soporte de llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Step-Audio-EditX | ~3,5 B | no disponible | mandarin, ingles, sichuanes, cantonés, japones, coreano | no disponible | Hugging Face, ModelScope, vLLM |
| Modelos TTS zero-shot de la competencia | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos suficientes en la informacion proporcionada para establecer una comparativa cuantitativa con alternativas concretas de la misma categoria (edicion de audio expresiva o TTS zero-shot). Se recomienda consultar el Step-Audio-Edit-Benchmark para obtener comparaciones publicadas.

## Limitaciones y advertencias
- La licencia no esta indicada en el repositorio; no se puede confirmar el uso comercial sin consultar la fuente original.
- El modelo esta orientado principalmente al chino (mandarin, sichuanes, cantonés) y al ingles; el soporte de japones y coreano es reciente y el de arabe, frances, ruso y espanol figura como pendiente en el plan del autor.
- La edicion de audio expresiva puede introducir artefactos o inconsistencias en la voz clonada; no se documentan tasas de error ni evaluaciones objetivas en el material disponible.
- Riesgo de alucinacion y de desviacion del contenido original al aplicar ediciones iterativas sucesivas; conviene validar auditivamente cada paso.
- El uso de clonacion de voz plantea riesgos de suplantacion y requiere consentimiento explicito y cumplimiento normativo (por ejemplo, RGPD y normativa sobre deepfakes).
- El repositorio consultado (Infinity-io/Step-Audio-EditX) muestra 0 descargas y 0 likes, y el autor oficial citado en la model card es stepfun-ai; conviene verificar la procedencia de los pesos antes de usarlos en produccion.
- No se detallan sesgos conocidos ni el proceso de alineacion mas alla del entrenamiento GRPO.

## Enlaces
- Repositorio en Hugging Face (consultado): https://huggingface.co/Infinity-io/Step-Audio-EditX
- Repositorio oficial citado en la model card: https://huggingface.co/stepfun-ai/Step-Audio-EditX
- ModelScope: https://modelscope.cn/models/stepfun-ai/Step-Audio-EditX
- Informe tecnico (arXiv): https://arxiv.org/abs/2511.03601
- Demo web: https://stepaudiollm.github.io/step-audio-editx/
- Space de playground: https://huggingface.co/spaces/stepfun-ai/Step-Audio-EditX
- Benchmark: https://github.com/stepfun-ai/Step-Audio-Edit-Benchmark
- Tokenizer: https://huggingface.co/stepfun-ai/Step-Audio-Tokenizer
- StepFun Audio Studio: https://www.stepfun.com/studio/audio
- Plataforma de API de StepFun: https://platform.stepfun.com/
