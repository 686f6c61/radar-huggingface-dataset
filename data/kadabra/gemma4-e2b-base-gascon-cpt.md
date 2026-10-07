# Kadabra/Gemma4-E2B-Base-Gascon-CPT

## Resumen

Kadabra/Gemma4-E2B-Base-Gascon-CPT es un ajuste fino (fine-tuning) publicado por el usuario Kadabra sobre el modelo base unsloth/gemma-4-E2B-unsloth-bnb-4bit. Se distribuye en formato FP16 (16 bits) y cuenta con 5.123.178.051 parametros totales segun los pesos en safetensors, con un tamano de repositorio de 10,3 GB. El pipeline declarado es image-text-to-text, lo que indica que el modelo base es multimodal (procesa imagenes y texto), y la etiqueta principal de tarea es text-generation-inference.

El modelo se ha entrenado, segun la model card, con Unsloth y la libreria TRL de Hugging Face, con la promesa de un entrenamiento "2x mas rapido". La licencia declarada es Apache 2.0 y el unico idioma soportado explicitamente es el ingles (en). El nombre incluye "Gascon" y el sufijo "CPT", que habitualmente se asocia a continued pre-training, aunque la model card no documenta ningun detalle sobre los datos, el idioma Gascon ni el proceso de entrenamiento continuado.

Se trata de un modelo muy reciente y con nula traccion publica (0 descargas y 0 likes en el momento de la consulta), por lo que la informacion verificable es escasa. Esto lo convierte en un candidato a evaluar con cautela: la ficha recoge unicamente lo que el autor y los metadatos de Hugging Face declaran, sin datos de benchmarks ni documentacion adicional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Gemma 4, presumiblemente decoder-only transformer multimodal; no confirmado en la informacion) |
| Parametros totales | 5.123.178.051 |
| Parametros activos | no disponible (no se declara que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP16 (16 bits) en esta publicacion; el modelo base se distribuye en 4 bits (bnb-4bit). Otras cuantizaciones (GGUF, INT8) no disponibles |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna mas alla del pipeline image-text-to-text y la etiqueta gemma4, lo que situa al modelo en la familia Gemma 4 de Google y sugiere una arquitectura transformer con capacidad multimodal (entrada de imagenes y texto). La nomenclatura "E2B" es coherente con los modelos Gemma con parametros efectivos reducidos (del orden de 2B efectivos) sobre un total de aproximadamente 5B parametros, pero este dato no esta confirmado en la model card y debe tratarse como una inferencia.

El proceso de entrenamiento reportado consiste en un ajuste fino realizado con Unsloth y TRL, partiendo de unsloth/gemma-4-E2B-unsloth-bnb-4bit y publicando el resultado en FP16. No se especifican el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de alineacion como RLHF, DPO o SFT supervisado. El sufijo "CPT" y el termino "Gascon" del nombre apuntan a un posible continued pre-training orientado al gascon, pero no existe documentacion que lo respalde.

## Capacidades

- Generacion de texto en ingles: tarea principal declarada (text-generation-inference).
- Procesamiento multimodal de entrada: el pipeline image-text-to-text indica capacidad de recibir imagenes ademas de texto, heredada del modelo base.
- Razonamiento y generacion general: esperable por herencia del modelo base Gemma 4, aunque no documentado especificamente para este ajuste.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: limitadas al ingles segun los metadatos; el supuesto gascon del nombre no esta confirmado ni documentado.
- Capacidades especiales (modo thinking, audio, vision): vision de entrada probable por el pipeline; el resto no disponible.

## Casos de uso

- Prototipado de aplicaciones multimodales en ingles: al heredar el pipeline image-text-to-text, puede emplearse para generar descripciones o respuestas a partir de imagenes y texto en fase de investigacion.
- Investigacion sobre continued pre-training: util para estudiar el efecto de un CPT sobre un modelo Gemma 4 E2B, siempre que se documenten los datos empleados.
- Experimentos de ajuste fino con Unsloth: sirve como ejemplo reproducible de un flujo Unsloth + TRL con publicacion en FP16.
- Generacion de texto en ingles de proposito general: tareas de resumen, redaccion o respuesta a preguntas dentro de su ventana de contexto (desconocida).
- Base para nuevos ajustes especificos de dominio: al estar en FP16 y con licencia Apache 2.0, puede servir de punto de partida para fine-tunings posteriores.
- Evaluacion comparativa de modelos pequenos multimodales: util como referencia en estudios que comparen Gemma 4 E2B frente a alternativas de tamano similar.
- Uso educativo: analisis de como se estructura una model card de un ajuste fino y que metadatos acompanan a una publicacion de este tipo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas (MMLU, HumanEval, GSM8K u otras) ni comparaciones con modelos similares.

## Requisitos de hardware

- VRAM estimada en FP16: aproximadamente 10,3 GB solo de pesos, mas overhead de activaciones y cache KV; en la practica se recomienda un minimo de 12-16 GB de VRAM para inferencia comoda.
- VRAM estimada en cuantizacion INT8: del orden de 5,5-6,5 GB (estimacion basada en el numero de parametros, no confirmada por el autor).
- VRAM estimada en cuantizacion INT4: del orden de 3-3,5 GB (estimacion; requiere pesos GGUF/AWQ/GPTQ que no se distribuyen en este repositorio).
- GPU recomendadas: A100 (40/80 GB), H100 y RTX 4090 (24 GB) para FP16 sin problemas; RTX 3090 (24 GB) tambien suficiente en FP16.
- Cabe en GPU de consumo: si, en FP16 en tarjetas con 16-24 GB (RTX 4090, RTX 3090, RTX 4080); en cuantizaciones menores podria caber en GPUs de 8-12 GB, aunque no se ofrecen esos formatos.
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference (TGI) por la etiqueta endpoints_compatible, y vLLM como alternativa habitual. Llama.cpp/Ollama requeririan una conversion a GGUF que no se proporciona.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multimodal | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Kadabra/Gemma4-E2B-Base-Gascon-CPT | 5.123.178.051 | no disponible | si (image-text-to-text) | apache-2.0 | Hugging Face, 0 descargas |
| unsloth/gemma-4-E2B-unsloth-bnb-4bit (modelo base) | no disponible | no disponible | si | no disponible | Hugging Face |
| Gemma 3n E2B (familia previa) | ~5B totales, ~2B efectivos (referencia) | no disponible | si | Gemma Terms | Hugging Face |
| Qwen2.5 3B-Instruct (alternativa texto) | ~3B | no disponible | no | Apache 2.0 | Hugging Face |

Nota: los datos de las filas de comparacion distintas al modelo de esta ficha son referencias generales de la familia y no proceden de la informacion proporcionada; deben verificarse en las fichas oficiales correspondientes.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay evidencia publicada de rendimiento, por lo que no se puede garantizar calidad en ninguna tarea.
- Documentacion minima: la model card no describe los datos de entrenamiento, el numero de tokens, ni el proceso de ajuste, lo que dificulta reproducir o auditar el modelo.
- Riesgo de alucinacion: inherente a los modelos generativos de este tamano, agravado por la falta de evaluacion.
- Idioma: solo se declara ingles, lo que limita su uso en castellano u otros idiomas. El supuesto enfoque en gascon no esta confirmado.
- Ambiguedad del nombre: "Gascon-CPT" sugiere un entrenamiento continuado en gascon, pero los metadatos indican unicamente ingles; existe una contradiccion no resuelta.
- Traccion nula: 0 descargas y 0 likes implican ausencia de validacion por parte de la comunidad.
- Licencia: Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base Gemma 4 de Google, ya que pueden imponer restricciones adicionales que la licencia declarada no refleje.
- Idoneidad para produccion: no recomendado sin una evaluacion previa propia, dado el vacio de informacion y la falta de validacion externa.
- Contexto desconocido: al no declararse la longitud de contexto, no se puede dimensionar su uso en tareas de contexto largo.

## Enlaces

- Hugging Face: https://huggingface.co/Kadabra/Gemma4-E2B-Base-Gascon-CPT
- Unsloth (repositorio): https://github.com/unslothai/unsloth
- TRL de Hugging Face: no disponible en la informacion proporcionada
- Paper o blog del modelo: no disponible
- Demo: no disponible

Nota: los resultados de busqueda web proporcionados (enlaces de Google Maps y Mappy) no guardan relacion con el modelo y no se han utilizado como fuentes.
