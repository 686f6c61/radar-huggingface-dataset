# ngqtrung/M3OPD-Warmup-Teacher-ImagePerception-9B

## Resumen

M3OPD-Warmup-Teacher-ImagePerception-9B es un modelo multimodal de tipo image-text-to-text desarrollado por el usuario ngqtrung, derivado mediante fine-tuning de Qwen/Qwen3.5-9B. Forma parte de la receta experimental del artículo M3OPD-Reasoner y actúa como "teacher" de dominio especifico para tareas de percepcion de imagen. El modelo combina un calentamiento SFT sobre el subconjunto de percepcion de imagen del dataset M3OPD-SFT-1.35M con un entrenamiento posterior de refuerzo mediante GSPO sobre los prompts de percepcion de imagen de M3OPD-RL-193K.

La relevancia de este checkpoint es metodologica: documenta una variante "con warm-up" de la receta principal, que emplea teachers sin calentamiento (M3OPD-Teacher-*-9B). El checkpoint publicado corresponde al paso 220 de la ejecucion GSPO. Al conservar la arquitectura, tokenizer, processor y chat template de Qwen3.5-9B, puede desplegarse en cualquier infraestructura que soporte el modelo base (Transformers, vLLM, SGLang).

Con 9.409.813.744 parametros totales y un repositorio de 18,8 GB en safetensors, se posiciona como un modelo de escala 9B orientado a razonamiento multimodal, con licencia Apache 2.0 heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text), heredada de Qwen3.5-9B |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible en la model card; el ejemplo de despliegue usa `--max-model-len 40960` |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Qwen3.5-9B, incluyendo su tokenizer, processor y chat template, lo que garantiza compatibilidad directa con el ecosistema de despliegue del modelo base. Es un modelo multimodal de entrada imagen-texto y salida de texto, orientado a razonamiento multimodal.

El entrenamiento sigue una receta de destilacion on-policy en dos fases. Primero se aplica un calentamiento SFT sobre los datos de percepcion de imagen del dataset M3OPD-SFT-1.35M. Despues se ejecuta GSPO (Group Sequence Policy Optimization) sobre los prompts de percepcion de imagen del dataset M3OPD-RL-193K, concretamente en la carpeta `image_perception`. El checkpoint publicado corresponde al paso 220 de esa ejecucion GSPO. La receta principal del articulo emplea teachers sin este calentamiento previo; esta variante documenta el efecto del warm-up. El entrenamiento y la evaluacion se realizan con el chat template nativo de Qwen3.5, con thinking habilitado, sin system prompt y con una linea de formato de respuesta tras la pregunta.

## Capacidades

- Generacion de texto y razonamiento multimodal a partir de entradas de imagen y texto.
- Percepcion de imagen como dominio de especializacion del teacher.
- Modo thinking habilitado por defecto en el chat template nativo de Qwen3.5.
- Formato de respuesta controlado mediante instrucciones del tipo `Put your final answer within \boxed{}.`
- Soporte de tool calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Capacidades de audio: no disponible en la informacion proporcionada.

## Casos de uso

- Destilacion de conocimiento multimodal: el modelo actua como teacher de dominio de percepcion de imagen para generar trayectorias de razonamiento que alimenten el entrenamiento de modelos student mas pequenos, aprovechando su especializacion tras el warm-up SFT y el GSPO.
- Investigacion en aprendizaje por refuerzo multimodal: sirve como punto de comparacion controlado frente a los teachers sin warm-up (M3OPD-Teacher-*-9B) para medir el efecto del calentamiento SFT en la receta GSPO.
- Evaluacion de percepcion visual en pipelines de investigacion: permite analizar respuestas con thinking habilitado y formato de respuesta `\boxed{}` sobre prompts de percepcion, facilitando la comparacion con otros checkpoints de la coleccion M3OPD-Reasoner.
- Reproduccion de experimentos: al conservar tokenizer y chat template de Qwen3.5-9B, se puede desplegar con vLLM (`vllm serve ... --max-model-len 40960`) para reproducir las condiciones de entrenamiento y evaluacion del autor.
- Analisis de razonamiento paso a paso en tareas visuales: el modo thinking permite inspeccionar cadenas de razonamiento sobre imagenes en entornos de investigacion.
- Base para fine-tuning posterior: al estar bajo Apache 2.0 y compartir arquitectura con Qwen3.5-9B, puede servir como punto de partida para ajustes especificos en dominios que requieran percepcion de imagen.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; con 9.409.813.744 parametros, en precision completa (BF16) se requieren aproximadamente 18,8 GB solo para pesos, a los que hay que sumar KV cache y overhead.
- GPU recomendadas: no disponible en la informacion proporcionada.
- Cabe en consumer GPU: no disponible; con cuantizacion a 8 bits o 4 bits seria viable en GPUs de 24 GB, pero no se confirma en la documentacion.
- Opciones de despliegue: Transformers, vLLM y SGLang, segun la model card. El ejemplo oficial usa `vllm serve ngqtrung/M3OPD-Warmup-Teacher-ImagePerception-9B --max-model-len 40960`.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| M3OPD-Warmup-Teacher-ImagePerception-9B | 9.409.813.744 | no disponible (ejemplo con 40960) | Apache 2.0 | Teacher de percepcion de imagen con warm-up SFT + GSPO |
| Qwen/Qwen3.5-9B | no disponible en la informacion | no disponible | Apache 2.0 | Modelo base del que deriva |
| M3OPD-Teacher-*-9B | no disponible en la informacion | no disponible | no disponible | Teachers de la receta principal, sin warm-up |

## Limitaciones y advertencias

- Modelo de investigacion: es un checkpoint intermedio (paso 220 de GSPO) de una receta experimental, no un modelo afinado para produccion.
- Especializacion estrecha: esta entrenado como teacher de dominio de percepcion de imagen, por lo que su comportamiento fuera de ese dominio no esta documentado.
- Idiomas soportados no disponibles: no se puede garantizar cobertura multilingue mas alla de la del modelo base.
- Riesgo de alucinacion: no se han publicado evaluaciones que cuantifiquen este riesgo.
- Sesgos conocidos: no disponible en la informacion proporcionada.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero se heredan las condiciones del modelo base Qwen3.5-9B; conviene revisar la licencia de este ultimo.
- Sin datos de benchmarks: no hay evidencia publicada de rendimiento comparado con alternativas.
- Adopcion nula: 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validacion por parte de la comunidad.
- Requiere el chat template nativo de Qwen3.5 con thinking habilitado para reproducir las condiciones de entrenamiento; otros formatos pueden degradar el comportamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ngqtrung/M3OPD-Warmup-Teacher-ImagePerception-9B
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Dataset SFT: https://huggingface.co/datasets/ngqtrung/M3OPD-SFT-1.35M
- Dataset RL: https://huggingface.co/datasets/ngqtrung/M3OPD-RL-193K
- Coleccion M3OPD-Reasoner: https://huggingface.co/collections/ngqtrung/m3opd-reasoner-6aed5164d151b6643a1b3b2d
