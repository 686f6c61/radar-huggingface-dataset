# rsoohyun213/Qwen2.5-VL-3B-Instruct-v7_S4only_S2v20_mix_s1_ep3-lr1e-5-letter-full_SFT

## Resumen

Qwen2.5-VL-3B-Instruct-v7_S4only_S2v20_mix_s1_ep3-lr1e-5-letter-full_SFT es un ajuste fino (SFT) del modelo multimodal Qwen2.5-VL-3B-Instruct, desarrollado por el usuario rsoohyun213 y publicado en Hugging Face. El modelo base, creado por el equipo Qwen de Alibaba, es un transformer de tipo vision-language de 3.000 millones de parametros que procesa entradas de imagen y texto y genera texto. Este ajuste concreto parte de ese modelo y lo entrena con Supervised Fine-Tuning (SFT) mediante la libreria TRL, con el objetivo declarado de mejorar el razonamiento espacial (spatial reasoning), segun se deduce del nombre del proyecto en Weights & Biases.

El modelo hereda la arquitectura y la ventana de contexto del Qwen2.5-VL-3B-Instruct original, pero los pesos han sido modificados mediante entrenamiento supervisado sobre un dataset no documentado en la model card. La nomenclatura del repositorio (S4only, S2v20, mix, letter, full_SFT) sugiere una experimentacion con distintas configuraciones de datos y capas, aunque el autor no detalla el contenido del dataset ni la metodologia.

La relevancia de esta ficha es limitada: se trata de un checkpoint de investigacion con cero descargas y cero likes en el momento de la consulta, sin model card sustantiva, sin resultados de evaluacion publicados y sin licencia declarada de forma clara. Es util unicamente como referencia para quienes sigan la experimentacion del autor o quieran reproducir el pipeline de SFT sobre Qwen2.5-VL.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer vision-language (hereda de Qwen2.5-VL-3B-Instruct; no detallada en la model card) |
| Parametros totales | 3.000 millones (3B, segun el modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la model card (el modelo base Qwen2.5-VL-3B-Instruct soporta contexto largo, pero no se confirma en este ajuste) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible (la model card incluye el campo `licence: license`, sin especificar) |
| Formato de pesos | safetensors |
| Tamano del repositorio | 142,7 GB |
| Pipeline | image-text-to-text |
| Libreria | transformers |
| Modelo base | Qwen/Qwen2.5-VL-3B-Instruct |
| Framework de entrenamiento | TRL 1.3.0, Transformers 4.57.6, PyTorch 2.8.0+cu128, Datasets 4.8.5, Tokenizers 0.22.2 |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del Qwen2.5-VL-3B-Instruct, un transformer multimodal que combina un codificador visual con un decodificador de lenguaje. La model card no describe cambios arquitectonicos respecto al modelo base; se trata de un SFT estandar sobre los pesos preentrenados. El entrenamiento se realizo con TRL (version 1.3.0) en modo SFT, con un learning rate de 1e-5 (indicado en el nombre del repositorio) y 3 epocas (ep3 en el nombre). El nombre del proyecto en Weights & Biases es "spatial_reasoning@SFT-full", lo que sugiere que el objetivo del ajuste era mejorar tareas de razonamiento espacial.

No se especifica el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo etapas de RLHF o DPO posteriores. Tampoco se detalla si se congelaron capas o se entreno el modelo completo; el sufijo "full_SFT" apunta a un ajuste completo de pesos, pero no se confirma. El tamano del repositorio (142,7 GB) es considerablemente mayor que el de un checkpoint de 3B en precision media, lo que sugiere que puede incluir multiples checkpoints intermedios, estados del optimizador o artefactos de entrenamiento, aunque no se especifica.

## Capacidades

- Generacion de texto a partir de entradas multimodales (imagen y texto), heredada del modelo base Qwen2.5-VL-3B-Instruct.
- Razonamiento espacial: el nombre del proyecto de entrenamiento sugiere un enfasis en tareas de comprension de relaciones espaciales en imagenes, aunque no hay evaluacion publicada que lo confirme.
- Conversacion multi-turno: el pipeline es image-text-to-text y el modelo esta etiquetado como "conversational".
- Capacidades del modelo base no verificadas en este ajuste: tool calling, function calling, agentes, modo thinking, vision detallada, multilingue. No se dispone de informacion que confirme que estas capacidades se preservan tras el ajuste.
- No se documentan capacidades de audio.

## Casos de uso

- Investigacion en razonamiento espacial: el modelo puede emplearse como punto de partida para experimentos que requieran interpretar relaciones espaciales en imagenes (posiciones, orientaciones, distancias), dado el enfasis declarado del entrenamiento.
- Reproduccion de pipelines de SFT multimodal: sirve como ejemplo de ajuste fino de Qwen2.5-VL con TRL, util para equipos que quieran replicar la receta (learning rate, epocas, framework).
- Prototipado de asistentes visuales: al ser un modelo de 3B, puede desplegarse en entornos con recursos limitados para probar flujos de image-text-to-text en fase de prototipo.
- Evaluacion comparativa de checkpoints: util para comparar el efecto del SFT sobre el modelo base en tareas de vision-lenguaje, siempre que se disponga de un conjunto de evaluacion propio.
- Generacion de descripciones de imagenes en dominios especificos: si el dataset de entrenamiento estaba orientado a un dominio concreto (no documentado), el modelo podria emplearse para captioning especializado, previa validacion.
- Docencia y formacion: como ejemplo practico de ajuste fino de un VLM pequeno con TRL y publicacion en Hugging Face.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa para un modelo de 3B en el rango de precisión habitual: aproximadamente 6-8 GB en FP16, 3-4 GB en cuantizacion de 4 bits (estimacion generica, no confirmada para este checkpoint).
- GPU recomendadas: no disponible. Por tamano, cabria esperar que funcione en GPUs consumer de gama media-alta (por ejemplo, RTX 3060 12 GB, RTX 4070, RTX 4090) en cuantizacion, pero no hay validacion publicada.
- Cabe en GPU consumer: probablemente si, en cuantizacion, pero no confirmado.
- Opciones de despliegue: transformers (soporte nativo declarado), text-generation-inference (etiqueta endpoints_compatible). No se confirma soporte de vLLM, llama.cpp u Ollama.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Este ajuste (rsoohyun213) | 3B | no disponible | no disponible | Hugging Face, 0 descargas | SFT sobre Qwen2.5-VL-3B-Instruct, sin evaluacion publicada |
| Qwen/Qwen2.5-VL-3B-Instruct | 3B | no disponible en esta ficha | no disponible en esta ficha | Hugging Face, ampliamente descargado | Modelo base oficial de Alibaba, con model card completa |
| Otros VLM de ~3B (p. ej. variantes de la familia Qwen2.5-VL o PaliGemma) | ~3B | variable | variable | Hugging Face | No se dispone de datos comparativos verificados en la informacion proporcionada |

## Limitaciones y advertencias

- Ausencia de model card sustantiva: no se documenta el dataset de entrenamiento, la metodologia ni las metricas, lo que impide evaluar la calidad del ajuste.
- Licencia no declarada de forma explicita: el campo `licence: license` no especifica terminos, por lo que no se puede garantizar el uso comercial. Es imprescindible contactar con el autor o consultar la licencia del modelo base.
- Riesgo de alucinacion: inherente a los modelos de lenguaje; no hay evaluacion que cuantifique este riesgo en el ajuste.
- Posible degradacion de capacidades del modelo base: el SFT sobre un dataset no documentado puede haber reducido capacidades generales (multilingue, tool calling) no presentes en los datos de entrenamiento.
- Sesgos: no documentados; se heredan los del modelo base y los del dataset de ajuste, desconocido.
- Cero descargas y cero likes: no hay evidencia de uso ni validacion por parte de la comunidad.
- Tamano del repositorio (142,7 GB) muy superior al de un checkpoint de 3B: puede contener artefactos de entrenamiento que compliquen el despliegue; conviene revisar los archivos antes de descargar.
- Idiomas soportados no confirmados: no se puede asumir el multilingueismo del modelo base sin validacion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/rsoohyun213/Qwen2.5-VL-3B-Instruct-v7_S4only_S2v20_mix_s1_ep3-lr1e-5-letter-full_SFT
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-VL-3B-Instruct
- Repositorio de TRL: https://github.com/huggingface/trl
- Run de Weights & Biases (enlace incluido en la model card): https://forge.coreweave.com/wandb/joyhyun/spatial_reasoning%40SFT-full/runs/jy4qxrot
