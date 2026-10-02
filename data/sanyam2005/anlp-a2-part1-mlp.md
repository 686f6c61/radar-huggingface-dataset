# sanyam2005/anlp-a2-part1-mlp

## Resumen

El modelo `sanyam2005/anlp-a2-part1-mlp` es un transformer decoder-only entrenado desde cero para traduccion automatica del vietnamita al ingles y del japones al ingles. Lo desarrolla Sanyam Agrawal (usuario `sanyam2005`) en el marco de la asignatura ANLP (Advanced Natural Language Processing), segunda practica, parte 1, y corresponde a la variante V1 de la red feed-forward: una MLP densa de dos capas. Con 35.265.024 parametros totales, es un modelo pequeno pensado como ejercicio academico mas que como sistema de traduccion de produccion.

Su interes es principalmente didactico y de investigacion: documenta de forma transparente el proceso de entrenamiento (50.011.655 tokens sobre el dataset `belumind/en-vi-ja-curated-500k-triplets`), el formato de prompt y la perdida final de validacion (1.9009). Sirve para comparar variantes de arquitectura de la capa feed-forward dentro de la propia practica.

Es relevante ahora porque forma parte de una familia de experimentos abiertos sobre arquitecturas eficientes (la etiqueta incluye `mixture-of-experts`, aunque esta variante concreta es densa), y porque su tamano reducido lo hace util como baseline reproducible y como modelo de traduccion ligero en entornos con recursos muy limitados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con FFN densa de 2 capas (variante V1 "mlp") |
| Parametros totales | 35.265.024 |
| Parametros activos | 35.265.024 (modelo denso; no es MoE pese a la etiqueta) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | vietnamita (vi), japones (ja), ingles (en) |
| Licencia | no disponible |
| Formato de pesos | safetensors (`model.safetensors`), tokenizer byte-level BPE (`tokenizer.json`) |

## Arquitectura y entrenamiento

Se trata de un transformer decoder-only entrenado desde cero. La innovacion concreta de esta variante esta en la capa feed-forward: una MLP densa de dos capas (`mlp`), frente a otras variantes de la practica. Los parametros de la FFN son 12.582.912, todos activos en cada token, y coinciden con los parametros activos totales del modelo (35.265.024), lo que confirma que esta version es completamente densa. A pesar de que la etiqueta de Hugging Face incluye `mixture-of-experts`, esa etiqueta describe la familia de experimentos, no a este checkpoint.

El entrenamiento se hizo sobre `belumind/en-vi-ja-curated-500k-triplets`, consumiendo 50.011.655 tokens para las direcciones vietnamita→ingles y japones→ingles. El autor reporta una perdida final de validacion de 1.9009. No se documenta en la informacion disponible el uso de RLHF, DPO ni ninguna fase de alineacion posterior; tampoco el numero de capas, dimensiones de atencion o cabezas del transformer. La inferencia se realiza con decodificacion voraz (greedy) hasta `<eos>`, usando el formato de prompt `<bos> <vi|ja> source <en>`.

## Capacidades

- Traduccion de texto de vietnamita a ingles y de japones a ingles.
- Generacion autoregresiva de texto mediante decodificacion voraz hasta el token `<eos>`.
- Manejo de tres idiomas: vietnamita, japones e ingles.
- Tokenizacion byte-level BPE propia (`tokenizer.json`, libreria `tokenizers`).
- Carga mediante la utilidad `src.part1.evaluate.load_model_folder` del repositorio de la practica.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni de razonamiento multi-paso.
- No se documentan capacidades de vision, audio ni modo "thinking".
- No se documenta capacidad multilingue mas alla de los tres idiomas indicados.

## Casos de uso

- Traduccion embebida en dispositivos con recursos minimos: con 35 millones de parametros, el modelo cabe en memoria de sistemas muy limitados (moviles, Raspberry Pi, navegador con runtimes ligeros), lo que permite traducir vi→en o ja→en sin conexion.
- Preprocesamiento de corpus multilingues: util para normalizar y pre-traducir grandes volumenes de texto vietnamita o japones antes de alimentar pipelines de NLP en ingles.
- Baseline academico reproducible: sirve como referencia para comparar variantes de la capa feed-forward (MLP densa frente a MoE) dentro de la misma practica.
- Prototipado rapido de sistemas de traduccion: por su tamano, permite iterar en experimentos de tokenizacion, prompts y decodificacion con coste computacional muy bajo.
- Generacion de subtitulos y transcripciones: se puede integrar en una cadena que transcriba audio en vietnamita o japones y traduzca despues al ingles para publicacion.
- Aumento de datos (data augmentation): generar pares de traduccion sinteticos para ampliar datasets de entrenamiento en ingles a partir de fuentes vi o ja.
- Fine-tuning sobre dominios especificos: al ser un modelo pequeno, es viable reentrenarlo o ajustarlo con presupuestos modestos para dominios concretos (legal, medico, tecnico) en los idiomas soportados.
- Docencia: ejemplo practico para explicar el ciclo completo de entrenamiento de un transformer decoder-only, desde el dataset hasta la evaluacion con perdida de validacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El unico dato de evaluacion reportado por el autor es la perdida final de validacion del modelo, que se recoge a continuacion.

| Metrica | Valor |
|---|---|
| Perdida de validacion final | 1.9009 |
| MMLU | no disponible |
| HumanEval | no disponible |
| GSM8K | no disponible |
| BLEU (vi→en) | no disponible |
| BLEU (ja→en) | no disponible |

## Requisitos de hardware

- VRAM estimada para inferencia (calculo a partir del numero de parametros): aproximadamente 141 MB en fp32 y 70 MB en fp16, sin contar el overhead del runtime ni el cache de activaciones.
- GPU recomendadas: cualquier GPU moderna sirve; el modelo es tan pequeno que tambien funciona en CPU. No requiere A100, H100 ni RTX 4090, aunque son compatibles.
- Cabe en cualquier GPU de consumo (GTX 1050 en adelante, RTX serie 20/30/40) y en la mayoria de iGPU y SoC moviles.
- Opciones de despliegue: al distribuirse en formato safetensors, la via natural es PyTorch/Transformers; tambien seria posible convertirlo a GGUF para llama.cpp u Ollama, aunque el autor no documenta esas conversiones. vLLM o TGI son compatibles pero desproporcionados para este tamano.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No se dispone de datos de rendimiento del modelo mas alla de la perdida de validacion (1.9009), por lo que no es posible una comparacion cuantitativa rigurosa. En la busqueda web aparece un checkpoint hermano de otra persona, `SSKS5432/aNLP-A2-Part-1`, presumiblemente con la misma tarea y estructura de practica, pero no se han recuperado sus especificaciones.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| sanyam2005/anlp-a2-part1-mlp | 35.265.024 | no disponible | perdida de validacion 1.9009 | no disponible | Hugging Face |
| SSKS5432/aNLP-A2-Part-1 | no disponible | no disponible | no disponible | no disponible | Hugging Face |
| Modelos de traduccion de referencia de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Se trata de un modelo academico de 35 millones de parametros; su calidad de traduccion sera notablemente inferior a la de sistemas de traduccion dedicados de mayor tamano.
- Riesgo elevado de alucinacion y de traducciones inexactas, especialmente en textos largos, dominios especializados o frases con ambiguedad.
- La direccion de traduccion esta limitada a vi→en y ja→en; no se documenta traduccion en sentido inverso ni hacia otros idiomas.
- Solo cubre tres idiomas (vietnamita, japones, ingles); no es un modelo multilingue general.
- No se documenta la longitud de contexto soportada, lo que dificulta su uso en documentos largos.
- La licencia es "no disponible", por lo que no hay autorizacion explicita de uso comercial; conviene contactar con el autor antes de cualquier empleo en produccion.
- La etiqueta `mixture-of-experts` puede inducir a confusion: este checkpoint concreto (V1) es una MLP densa, no un MoE.
- No se han publicado resultados de BLEU ni de otras metricas de traduccion estandar, ni comparaciones con baselines, lo que limita la evaluacion objetiva.
- El entrenamiento se realizo solo sobre 50 millones de tokens, un volumen muy reducido para traduccion de calidad.
- No se documentan sesgos, composicion del dataset ni filtrado de datos, por lo que no se puede evaluar el sesgo de las traducciones.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sanyam2005/anlp-a2-part1-mlp
- Perfil de modelos del autor: https://huggingface.co/sanyam2005/models
- Repositorio GitHub del autor: https://github.com/Sanyam2005/anlp-a1-transformers/tree/main
- Checkpoint hermano de la practica: https://huggingface.co/SSKS5432/aNLP-A2-Part-1
- Dataset de entrenamiento: `belumind/en-vi-ja-curated-500k-triplets` (Hugging Face)
